import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';
import { createHash } from 'crypto';

// In-memory cache for processed images
const imageCache = new Map<string, { buffer: Buffer; contentType: string; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Clean up expired cache entries
function cleanupCache() {
  const now = Date.now();
  if (imageCache && imageCache.size > 0) {
    imageCache.forEach((value, key) => {
      if (now - value.timestamp > CACHE_TTL) {
        imageCache.delete(key);
      }
    });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    const { searchParams } = new URL(request.url);
    
    // Get optimization parameters
    const width = searchParams.get('w') ? parseInt(searchParams.get('w')!) : undefined;
    const height = searchParams.get('h') ? parseInt(searchParams.get('h')!) : undefined;
    const quality = Math.min(Math.max(parseInt(searchParams.get('q') || '80'), 10), 100);
    const format = searchParams.get('f') || 'webp';

    // Validate parameters
    if (width && (width < 1 || width > 3840)) {
      return new NextResponse('Invalid width parameter', { status: 400 });
    }
    if (height && (height < 1 || height > 3840)) {
      return new NextResponse('Invalid height parameter', { status: 400 });
    }

    // Validate filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return new NextResponse('Invalid filename', { status: 400 });
    }

    // Create cache key
    const cacheKey = createHash('md5')
      .update(`${filename}-${width || 'auto'}-${height || 'auto'}-${quality}-${format}`)
      .digest('hex');

    // Check cache first
    const cached = imageCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return new NextResponse(cached.buffer, {
        status: 200,
        headers: {
          'Content-Type': cached.contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Content-Length': cached.buffer.length.toString(),
          'X-Cache': 'HIT',
        },
      });
    }

    // Construct file path
    const filePath = join(process.cwd(), 'public', 'mvp-images', filename);
    
    try {
      // Check if file exists and get stats
      const fileStats = await stat(filePath);
      if (!fileStats.isFile()) {
        return new NextResponse('Not a file', { status: 404 });
      }

      // Read the file
      const fileBuffer = await readFile(filePath);
      
      // Process image with Sharp
      let sharpInstance = sharp(fileBuffer, {
        failOnError: false,
        density: 72,
      });
      
      // Get image metadata for optimization
      const metadata = await sharpInstance.metadata();
      
      // Apply transformations
      if (width || height) {
        sharpInstance = sharpInstance.resize(width, height, {
          fit: 'cover',
          position: 'center',
          withoutEnlargement: true,
        });
      }
      
      // Convert format and optimize
      const contentType = `image/${format === 'jpg' ? 'jpeg' : format}`;
      
      switch (format) {
        case 'webp':
          sharpInstance = sharpInstance.webp({ 
            quality, 
            effort: 6,
            smartSubsample: true,
            nearLossless: quality > 90,
          });
          break;
        case 'avif':
          sharpInstance = sharpInstance.avif({ 
            quality, 
            effort: 6,
            chromaSubsampling: '4:2:0',
          });
          break;
        case 'jpeg':
        case 'jpg':
          sharpInstance = sharpInstance.jpeg({ 
            quality, 
            progressive: true,
            mozjpeg: true,
            optimiseScans: true,
          });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({ 
            quality, 
            progressive: true,
            compressionLevel: 9,
            adaptiveFiltering: true,
          });
          break;
        default:
          sharpInstance = sharpInstance.webp({ 
            quality, 
            effort: 6,
            smartSubsample: true,
          });
      }
      
      const optimizedBuffer = await sharpInstance.toBuffer();
      
      // Cache the result
      imageCache.set(cacheKey, {
        buffer: optimizedBuffer,
        contentType,
        timestamp: Date.now(),
      });
      
      // Cleanup old cache entries periodically
      if (Math.random() < 0.01) { // 1% chance
        cleanupCache();
      }
      
      // Set appropriate headers
      const headers = new Headers();
      headers.set('Content-Type', contentType);
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      headers.set('Content-Length', optimizedBuffer.length.toString());
      headers.set('X-Cache', 'MISS');
      headers.set('Vary', 'Accept');
      
      // Add ETag for better caching
      const etag = createHash('md5').update(optimizedBuffer).digest('hex');
      headers.set('ETag', `"${etag}"`);
      
      return new NextResponse(optimizedBuffer, {
        status: 200,
        headers,
      });
      
    } catch (fileError) {
      console.error('File read error:', fileError);
      return new NextResponse('Image not found', { status: 404 });
    }
    
  } catch (error) {
    console.error('Image API Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
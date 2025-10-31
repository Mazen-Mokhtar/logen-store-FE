import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { createHash } from 'crypto';

// In-memory cache for processed images
const imageCache = new Map<string, { buffer: Buffer; contentType: string; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour for external images

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const imageUrl = searchParams.get('url');
    const width = searchParams.get('w') ? parseInt(searchParams.get('w')!) : undefined;
    const height = searchParams.get('h') ? parseInt(searchParams.get('h')!) : undefined;
    const quality = Math.min(Math.max(parseInt(searchParams.get('q') || '80'), 10), 100);
    const format = searchParams.get('f') || 'webp';

    if (!imageUrl) {
      return new NextResponse('Missing image URL', { status: 400 });
    }

    // Validate URL
    let url: URL;
    try {
      url = new URL(imageUrl);
      if (url.protocol !== 'https:') {
        return new NextResponse('Only HTTPS URLs are allowed', { status: 400 });
      }
    } catch {
      return new NextResponse('Invalid URL', { status: 400 });
    }

    // Validate parameters
    if (width && (width < 1 || width > 3840)) {
      return new NextResponse('Invalid width parameter', { status: 400 });
    }
    if (height && (height < 1 || height > 3840)) {
      return new NextResponse('Invalid height parameter', { status: 400 });
    }

    // Create cache key
    const cacheKey = createHash('md5')
      .update(`${imageUrl}-${width || 'auto'}-${height || 'auto'}-${quality}-${format}`)
      .digest('hex');

    // Check cache first
    const cached = imageCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return new NextResponse(cached.buffer, {
        status: 200,
        headers: {
          'Content-Type': cached.contentType,
          'Cache-Control': 'public, max-age=86400, s-maxage=31536000',
          'Content-Length': cached.buffer.length.toString(),
          'X-Cache': 'HIT',
        },
      });
    }

    // Fetch the image with timeout and proper headers
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(imageUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ImageProxy/1.0)',
          'Accept': 'image/webp,image/avif,image/*,*/*;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return new NextResponse(`Failed to fetch image: ${response.status}`, { status: 502 });
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.startsWith('image/')) {
        return new NextResponse('URL does not point to an image', { status: 400 });
      }

      const imageBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(imageBuffer);

      // Process image with Sharp
      let sharpInstance = sharp(buffer, {
        failOnError: false,
        density: 72,
        limitInputPixels: 268402689, // ~16384x16384 max
      });

      // Get image metadata for validation
      const metadata = await sharpInstance.metadata();
      
      // Validate image size
      if (metadata.width && metadata.height) {
        const maxPixels = 50 * 1024 * 1024; // 50MP max
        if (metadata.width * metadata.height > maxPixels) {
          return new NextResponse('Image too large', { status: 413 });
        }
      }

      // Apply transformations
      if (width || height) {
        sharpInstance = sharpInstance.resize(width, height, {
          fit: 'cover',
          position: 'center',
          withoutEnlargement: true,
        });
      }

      // Convert format and optimize
      const outputContentType = `image/${format === 'jpg' ? 'jpeg' : format}`;
      
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
        contentType: outputContentType,
        timestamp: Date.now(),
      });

      // Cleanup old cache entries periodically
      if (Math.random() < 0.01) { // 1% chance
        cleanupCache();
      }

      // Set appropriate headers
      const headers = new Headers();
      headers.set('Content-Type', outputContentType);
      headers.set('Cache-Control', 'public, max-age=86400, s-maxage=31536000');
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

    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return new NextResponse('Request timeout', { status: 504 });
      }
      console.error('Fetch error:', fetchError);
      return new NextResponse('Failed to fetch image', { status: 502 });
    }

  } catch (error) {
    console.error('Image Proxy Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
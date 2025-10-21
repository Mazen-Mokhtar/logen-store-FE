# Logen E-commerce Platform

A modern, high-performance e-commerce platform built with Next.js 14, featuring internationalization, accessibility, SEO optimization, and comprehensive monitoring capabilities.

## 🌟 Features

### Frontend Features
- **Modern UI/UX**: Clean, responsive design with smooth animations
- **RTL/Arabic Support**: Full right-to-left language support
- **GSAP Animations**: Smooth scroll animations and parallax effects
- **Performance Optimized**: Lighthouse score 95-100 across all metrics
- **Mobile Responsive**: Optimized for all device sizes
- **Shopping Cart**: Full cart functionality with state management
- **Product Catalog**: Dynamic product grid with filtering
- **User Authentication**: Login/register modal system
- **Multi-language**: English and Arabic language support

### Backend Features
- **NestJS Framework**: Scalable and maintainable backend architecture
- **MongoDB Integration**: NoSQL database for flexible data storage
- **JWT Authentication**: Secure user authentication system
- **RESTful APIs**: Complete CRUD operations for all entities
- **Security Features**: Helmet, CORS, rate limiting, and input validation
- **API Documentation**: Swagger/OpenAPI documentation
- **Health Monitoring**: Built-in health checks and monitoring
- **Docker Support**: Containerized deployment ready

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 13+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: GSAP, Framer Motion
- **State Management**: Zustand
- **Icons**: Lucide React
- **Deployment**: Vercel ready

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with Passport
- **Validation**: Class Validator
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Deployment**: Docker ready

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
├── components/             # React components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and configurations
├── data/                   # Static data and translations
├── public/                 # Static assets
├── backend/                # NestJS backend application
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   ├── common/         # Shared utilities
│   │   ├── config/         # Configuration files
│   │   └── main.ts         # Application entry point
│   ├── test/               # Test files
│   └── docs/               # Documentation
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB (local or cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd logen-bolt-v3-linkWithBD
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Environment Setup**
   
   **Frontend**: Copy `.env.example` to `.env.local` and update values:
   ```bash
   cp .env.example .env.local
   ```
   
   **Backend**: Copy `backend/.env.example` to `backend/.env.production` and update values:
   ```bash
   cp backend/.env.example backend/.env.production
   ```

5. **Start MongoDB**
   Make sure MongoDB is running on your system or update the DATABASE_URL in your environment file.

6. **Run the development servers**
   
   **Frontend** (Terminal 1):
   ```bash
   npm run dev
   ```
   
   **Backend** (Terminal 2):
   ```bash
   cd backend
   npm run start:dev
   ```

7. **Access the application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - API Documentation: http://localhost:3000/api/docs

## 📝 Available Scripts

### Frontend Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run analyze      # Analyze bundle size
npm run lighthouse   # Run Lighthouse performance test
```

### Backend Scripts
```bash
npm run start:dev    # Start development server
npm run build        # Build for production
npm run start:prod   # Start production server
npm run test         # Run tests
npm run test:e2e     # Run end-to-end tests
npm run lint         # Run ESLint
```

## 🔧 Configuration

### Environment Variables

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

**Backend (.env.production)**:
```env
DATABASE_URL=mongodb://localhost:27017/logen_store
JWT_SECRET=your-secret-key
PORT=3000
NODE_ENV=production
```

## 🐳 Production Deployment

### Vercel Deployment (Recommended)

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel login
   vercel --prod
   ```

2. **Environment Variables**
   Set the following in Vercel dashboard:
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   NEXT_PUBLIC_ANALYTICS_ID=your-ga-id
   ```

3. **Build Configuration**
   The project includes optimized build settings in `next.config.js`:
   - Automatic static optimization
   - Image optimization with Sharp
   - Compression and caching headers
   - Bundle analysis tools

### Docker Deployment

1. **Frontend Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS deps
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production

   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY . .
   COPY --from=deps /app/node_modules ./node_modules
   RUN npm run build

   FROM node:18-alpine AS runner
   WORKDIR /app
   ENV NODE_ENV production
   COPY --from=builder /app/public ./public
   COPY --from=builder /app/.next/standalone ./
   COPY --from=builder /app/.next/static ./.next/static
   EXPOSE 3000
   CMD ["node", "server.js"]
   ```

2. **Backend Docker Compose**
   ```bash
   cd backend
   docker-compose up -d
   ```

### Performance Optimization Checklist

- ✅ **Image Optimization**: WebP/AVIF conversion with Sharp
- ✅ **Caching Strategy**: Multi-layer caching (static, dynamic, images)
- ✅ **Code Splitting**: Automatic bundle optimization
- ✅ **Compression**: Gzip/Brotli for all assets
- ✅ **PWA Features**: Service worker with offline support
- ✅ **SEO Optimization**: Structured data, meta tags, sitemap
- ✅ **Security Headers**: CSP, XSS protection, CORS
- ✅ **Monitoring**: Performance tracking and error reporting

### Monitoring & Analytics

1. **Google Analytics Setup**
   ```env
   NEXT_PUBLIC_ANALYTICS_ID=GA_MEASUREMENT_ID
   ```

2. **Performance Monitoring**
   ```bash
   npm run lighthouse  # Run Lighthouse audit
   npm run analyze     # Analyze bundle size
   ```

3. **Health Checks**
   - Frontend: `/api/health`
   - Backend: `/health`
   - Detailed metrics: `/api/health/detailed`

## 📚 API Documentation

The backend provides comprehensive API documentation via Swagger. After starting the backend server, visit:
- http://localhost:3000/api/docs

## 🧪 Testing

### Frontend Testing
```bash
npm run test
```

### Backend Testing
```bash
cd backend
npm run test
npm run test:e2e
```

## 🔒 Security Features

- JWT-based authentication
- Input validation and sanitization
- CORS protection
- Rate limiting
- Helmet security headers
- Environment variable protection

## 🌐 Internationalization

The application supports multiple languages:
- English (default)
- Arabic (RTL support)

Language files are located in the `data/` directory.

## 📈 Performance & Optimization

### Lighthouse Scores
- **Performance**: 95-100
- **Accessibility**: 95-100  
- **Best Practices**: 95-100
- **SEO**: 95-100

### Core Web Vitals
- **First Contentful Paint (FCP)**: < 1.2s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1

### Optimization Features

#### Image Optimization
- **Next.js Image Component**: Automatic WebP/AVIF conversion
- **Sharp Processing**: Server-side image optimization with caching
- **Lazy Loading**: Images load only when needed
- **Responsive Images**: Multiple sizes for different viewports
- **Image Proxy**: External image optimization with 1-hour cache TTL

#### Caching Strategy
- **Static Assets**: 1-year cache with immutable headers
- **API Responses**: In-memory caching with configurable TTL
- **Image Cache**: Dedicated 24-hour cache for processed images
- **Service Worker**: Offline-first caching for PWA functionality

#### Code Optimization
- **Bundle Splitting**: Automatic code splitting by Next.js
- **Tree Shaking**: Dead code elimination
- **CSS Optimization**: Minification and critical CSS extraction
- **Webpack Optimizations**: Custom chunk splitting and compression

#### PWA Features
- **Service Worker**: Advanced caching strategies for offline support
- **Web App Manifest**: Native app-like experience
- **Offline Fallback**: Custom offline page with retry functionality
- **Background Sync**: Queue API requests when offline
- **Push Notifications**: Real-time user engagement

#### SEO Optimization
- **Structured Data**: JSON-LD for products, organization, and website
- **Meta Tags**: Dynamic Open Graph and Twitter Card generation
- **Sitemap**: Auto-generated XML sitemap with localized pages
- **Robots.txt**: Search engine crawler guidance
- **Canonical URLs**: Proper URL canonicalization
- **Hreflang**: Multi-language SEO support

#### Performance Monitoring
- **Real User Monitoring**: Core Web Vitals tracking
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Lighthouse CI**: Automated performance testing
- **Error Tracking**: Client-side error monitoring

### Compression & Minification
- **Gzip Compression**: Enabled for all text-based assets
- **Brotli Support**: Modern compression for supported browsers
- **CSS Minification**: Optimized stylesheets
- **JavaScript Minification**: Terser optimization
- **HTML Minification**: Reduced markup size

### Security Headers
- **Content Security Policy**: XSS protection
- **X-Frame-Options**: Clickjacking prevention
- **X-Content-Type-Options**: MIME type sniffing protection
- **Referrer Policy**: Controlled referrer information
- **Permissions Policy**: Feature access control

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions, please:
1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Include steps to reproduce the problem

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- NestJS team for the powerful backend framework
- GSAP for smooth animations
- Tailwind CSS for utility-first styling
- All contributors and supporters of this project
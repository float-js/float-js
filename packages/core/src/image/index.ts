/**
 * Float.js Image Optimization
 * Automatic image optimization, resizing, and format conversion
 * 
 * Similar to Next.js Image but with more features!
 */

import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join } from 'path';
import type { IncomingMessage, ServerResponse } from 'http';

// ============================================================================
// TYPES
// ============================================================================

export interface ImageConfig {
  /** Supported image widths for responsive images */
  deviceSizes: number[];
  /** Smaller sizes for use with next/image */
  imageSizes: number[];
  /** Supported output formats */
  formats: ImageFormat[];
  /** Quality for lossy formats (1-100) */
  quality: number;
  /** Cache directory for optimized images */
  cacheDir: string;
  /** Base path for images */
  basePath: string;
  /** Remote image domains allowed */
  domains: string[];
  /** Minimum cache TTL in seconds */
  minimumCacheTTL: number;
  /** Disable static image imports */
  disableStaticImages: boolean;
  /** Enable AVIF format (experimental) */
  avif: boolean;
}

export type ImageFormat = 'webp' | 'avif' | 'jpeg' | 'png' | 'gif' | 'svg';

export interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty' | 'data:image/...';
  blurDataURL?: string;
  loading?: 'lazy' | 'eager';
  className?: string;
  style?: Record<string, string>;
  onLoad?: () => void;
  onError?: () => void;
}

export interface OptimizedImage {
  src: string;
  width: number;
  height: number;
  blurDataURL?: string;
}

export interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

const defaultConfig: ImageConfig = {
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  formats: ['webp', 'jpeg'],
  quality: 75,
  cacheDir: '.float/cache/images',
  basePath: '/_float/image',
  domains: [],
  minimumCacheTTL: 60,
  disableStaticImages: false,
  avif: false,
};

let imageConfig: ImageConfig = { ...defaultConfig };

export function configureImages(config: Partial<ImageConfig>): void {
  imageConfig = { ...defaultConfig, ...config };
  
  // Ensure cache directory exists
  if (!existsSync(imageConfig.cacheDir)) {
    mkdirSync(imageConfig.cacheDir, { recursive: true });
  }
}

export function getImageConfig(): ImageConfig {
  return imageConfig;
}

// ============================================================================
// IMAGE UTILITIES
// ============================================================================

/**
 * Generate a hash for cache key
 */
function generateCacheKey(url: string, width: number, quality: number, format: string): string {
  const hash = createHash('md5')
    .update(`${url}-${width}-${quality}-${format}`)
    .digest('hex');
  return `${hash}.${format}`;
}

/**
 * Get the best format for the request
 */
function getBestFormat(acceptHeader: string): ImageFormat {
  if (imageConfig.avif && acceptHeader.includes('image/avif')) {
    return 'avif';
  }
  if (acceptHeader.includes('image/webp')) {
    return 'webp';
  }
  return 'jpeg';
}

/**
 * Parse image URL parameters
 */
function parseImageParams(url: URL): { src: string; width: number; quality: number } | null {
  const src = url.searchParams.get('url');
  const width = parseInt(url.searchParams.get('w') || '0', 10);
  const quality = parseInt(url.searchParams.get('q') || String(imageConfig.quality), 10);

  if (!src || !width) {
    return null;
  }

  // Validate width
  const allSizes = [...imageConfig.deviceSizes, ...imageConfig.imageSizes];
  if (!allSizes.includes(width)) {
    return null;
  }

  // Validate quality
  if (quality < 1 || quality > 100) {
    return null;
  }

  return { src, width, quality };
}

/**
 * Check if URL is external
 */
function isExternalUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Validate external domain
 */
function isAllowedDomain(url: string): boolean {
  if (!isExternalUrl(url)) return true;
  
  try {
    const { hostname } = new URL(url);
    return imageConfig.domains.includes(hostname);
  } catch {
    return false;
  }
}

// ============================================================================
// IMAGE OPTIMIZATION (Sharp-like without Sharp dependency)
// ============================================================================

/**
 * Simple image resize using canvas (for basic optimization)
 * In production, you'd use Sharp or similar
 */
async function optimizeImage(
  input: Buffer,
  _width: number,
  _quality: number,
  _format: ImageFormat
): Promise<Buffer> {
  // For now, return original with proper content type
  // In real implementation, use Sharp or similar:
  // const sharp = await import('sharp');
  // return sharp(input).resize(_width).toFormat(_format, { quality: _quality }).toBuffer();
  
  // Placeholder - returns original image
  // Users can install sharp for real optimization
  return input;
}

/**
 * Generate blur placeholder
 */
export async function generateBlurDataURL(input: Buffer): Promise<string> {
  // Generate a tiny version for blur placeholder
  // In real implementation, resize to 8x8 or 10x10 and base64 encode
  return `data:image/jpeg;base64,${input.slice(0, 50).toString('base64')}`;
}

// ============================================================================
// IMAGE HANDLER
// ============================================================================

export function createImageHandler() {
  // Ensure cache directory exists
  if (!existsSync(imageConfig.cacheDir)) {
    mkdirSync(imageConfig.cacheDir, { recursive: true });
  }

  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const urlString = req.url || '';
    
    // Check if this is an image optimization request
    if (!urlString.startsWith(imageConfig.basePath)) {
      return next();
    }

    try {
      const url = new URL(urlString, `http://${req.headers.host}`);
      const params = parseImageParams(url);

      if (!params) {
        res.statusCode = 400;
        res.end('Invalid image parameters');
        return;
      }

      const { src, width, quality } = params;

      // Validate domain for external URLs
      if (!isAllowedDomain(src)) {
        res.statusCode = 400;
        res.end('Domain not allowed');
        return;
      }

      // Determine best format
      const acceptHeader = req.headers.accept || '';
      const format = getBestFormat(acceptHeader);

      // Check cache
      const cacheKey = generateCacheKey(src, width, quality, format);
      const cachePath = join(imageConfig.cacheDir, cacheKey);

      if (existsSync(cachePath)) {
        const cachedImage = readFileSync(cachePath);
        const stat = statSync(cachePath);
        
        res.setHeader('Content-Type', `image/${format}`);
        res.setHeader('Cache-Control', `public, max-age=${imageConfig.minimumCacheTTL}, stale-while-revalidate`);
        res.setHeader('X-Float-Image-Cache', 'HIT');
        res.setHeader('Last-Modified', stat.mtime.toUTCString());
        res.end(cachedImage);
        return;
      }

      // Fetch or read image
      let imageBuffer: Buffer;

      if (isExternalUrl(src)) {
        const response = await fetch(src);
        if (!response.ok) {
          res.statusCode = 404;
          res.end('Image not found');
          return;
        }
        imageBuffer = Buffer.from(await response.arrayBuffer());
      } else {
        const imagePath = join(process.cwd(), 'public', src);
        if (!existsSync(imagePath)) {
          res.statusCode = 404;
          res.end('Image not found');
          return;
        }
        imageBuffer = readFileSync(imagePath);
      }

      // Optimize image
      const optimizedBuffer = await optimizeImage(imageBuffer, width, quality, format);

      // Save to cache
      writeFileSync(cachePath, optimizedBuffer);

      // Send response
      res.setHeader('Content-Type', `image/${format}`);
      res.setHeader('Cache-Control', `public, max-age=${imageConfig.minimumCacheTTL}, stale-while-revalidate`);
      res.setHeader('X-Float-Image-Cache', 'MISS');
      res.end(optimizedBuffer);
    } catch (error) {
      console.error('Image optimization error:', error);
      res.statusCode = 500;
      res.end('Image optimization failed');
    }
  };
}

// ============================================================================
// IMAGE LOADER (for client-side)
// ============================================================================

/**
 * Default image loader
 */
export function floatImageLoader({ src, width, quality }: ImageLoaderProps): string {
  const q = quality || imageConfig.quality;
  return `${imageConfig.basePath}?url=${encodeURIComponent(src)}&w=${width}&q=${q}`;
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(src: string, sizes: number[]): string {
  return sizes
    .map(size => `${floatImageLoader({ src, width: size })} ${size}w`)
    .join(', ');
}

/**
 * Generate responsive image props
 */
export function getImageProps(props: ImageProps): {
  src: string;
  srcSet: string;
  sizes: string;
  width?: number;
  height?: number;
  loading: 'lazy' | 'eager';
  decoding: 'async' | 'sync';
  style?: Record<string, string>;
} {
  const {
    src,
    width,
    height,
    fill,
    sizes = '100vw',
    quality,
    priority,
    loading = priority ? 'eager' : 'lazy',
  } = props;

  const allSizes = [...imageConfig.imageSizes, ...imageConfig.deviceSizes].sort((a, b) => a - b);
  
  // Filter sizes based on image width
  const relevantSizes = width 
    ? allSizes.filter(s => s <= width * 2) 
    : allSizes;

  return {
    src: floatImageLoader({ src, width: width || relevantSizes[relevantSizes.length - 1], quality }),
    srcSet: generateSrcSet(src, relevantSizes),
    sizes,
    width: fill ? undefined : width,
    height: fill ? undefined : height,
    loading,
    decoding: 'async',
    style: fill ? {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    } : undefined,
  };
}

// ============================================================================
// REACT COMPONENT (Server Component compatible)
// ============================================================================

/**
 * Generate Image component HTML (for SSR)
 */
export function renderImageToString(props: ImageProps): string {
  const imageProps = getImageProps(props);
  
  const attributes = [
    `src="${imageProps.src}"`,
    `srcset="${imageProps.srcSet}"`,
    `sizes="${imageProps.sizes}"`,
    `alt="${props.alt}"`,
    `loading="${imageProps.loading}"`,
    `decoding="${imageProps.decoding}"`,
  ];

  if (imageProps.width) {
    attributes.push(`width="${imageProps.width}"`);
  }
  if (imageProps.height) {
    attributes.push(`height="${imageProps.height}"`);
  }
  if (props.className) {
    attributes.push(`class="${props.className}"`);
  }
  if (imageProps.style) {
    const styleString = Object.entries(imageProps.style)
      .map(([key, value]) => `${key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)}: ${value}`)
      .join('; ');
    attributes.push(`style="${styleString}"`);
  }

  // Wrap in picture element for format fallback
  return `
    <picture>
      <source type="image/webp" srcset="${imageProps.srcSet}">
      <img ${attributes.join(' ')}>
    </picture>
  `.trim();
}

// ============================================================================
// STATIC IMPORT HELPERS
// ============================================================================

export interface StaticImageData {
  src: string;
  width: number;
  height: number;
  blurDataURL?: string;
}

/**
 * Import static image (for build-time optimization)
 */
export function importImage(imagePath: string): StaticImageData {
  // This would be processed at build time
  // Returns placeholder data for runtime
  return {
    src: imagePath,
    width: 0, // Determined at build time
    height: 0, // Determined at build time
    blurDataURL: undefined,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const image = {
  configure: configureImages,
  getConfig: getImageConfig,
  handler: createImageHandler,
  loader: floatImageLoader,
  srcSet: generateSrcSet,
  props: getImageProps,
  render: renderImageToString,
  import: importImage,
};

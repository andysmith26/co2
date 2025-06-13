// src/lib/utils/cloudinary.ts

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
}

export interface CloudinarySignatureResponse {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
}

export interface CloudinaryWidgetOptions {
  sources: string[];
  multiple: boolean;
  maxFiles: number;
  resourceType: string;
  clientAllowedFormats: string[];
  maxFileSize: number;
  folder: string;
  cropping: boolean;
  showSkipCropButton: boolean;
  styles: {
    palette: Record<string, string>;
  };
  retry?: {
    delay: number;
    limit: number;
  };
}

/**
 * Enhanced upload widget configuration with error handling and performance optimizations
 */
export const getUploadWidgetOptions = (): Partial<CloudinaryWidgetOptions> => ({
  sources: ['local', 'camera', 'url'],
  multiple: false,
  maxFiles: 1,
  resourceType: 'image',
  clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  maxFileSize: 10000000, // 10MB
  folder: 'co2-resources',
  cropping: true,
  showSkipCropButton: true,
  // Enhanced styling for better UX
  styles: {
    palette: {
      window: '#ffffff',
      sourceBg: '#f9fafb',
      windowBorder: '#d1d5db',
      tabIcon: '#4f46e5',
      inactiveTabIcon: '#9ca3af',
      menuIcons: '#4f46e5',
      link: '#4f46e5',
      action: '#4f46e5',
      inProgress: '#4f46e5',
      complete: '#10b981',
      error: '#ef4444',
      textDark: '#111827',
      textLight: '#ffffff'
    }
  },
  // Add retry configuration for better reliability
  retry: {
    delay: 1000,
    limit: 3
  }
});

// Validate if a URL is a Cloudinary URL

export const isCloudinaryUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    console.log('🔍 Checking URL hostname:', urlObj.hostname);
    console.log('🔍 Checking URL pathname:', urlObj.pathname);
    
    // More permissive check - just check if it's from cloudinary.com domain
    const isCloudinary = urlObj.hostname.includes('cloudinary.com');
    const hasUpload = urlObj.pathname.includes('/upload/');
    
    console.log('🔍 Is Cloudinary domain:', isCloudinary);
    console.log('🔍 Has upload path:', hasUpload);
    
    return isCloudinary && hasUpload;
  } catch (e) {
    console.log('🔍 URL parsing failed:', e);
    return false;
  }
};

/**
 * Extract public_id from Cloudinary URL with better parsing
 */
export const extractPublicId = (cloudinaryUrl: string): string | null => {
  if (!isCloudinaryUrl(cloudinaryUrl)) {
    return null;
  }

  try {
    const url = new URL(cloudinaryUrl);
    const pathParts = url.pathname.split('/').filter(part => part.length > 0);
    
    // Find the upload index
    const uploadIndex = pathParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1 || uploadIndex >= pathParts.length - 1) {
      return null;
    }
    
    // Get parts after 'upload'
    const afterUpload = pathParts.slice(uploadIndex + 1);
    
    // Filter out transformation parameters and version tags
    const publicIdParts = afterUpload.filter(part => {
      // Skip version parameters (v1234567890)
      if (part.match(/^v\d+$/)) return false;
      // Skip transformation parameters (w_, h_, c_, f_, q_, etc.)
      if (part.match(/^[a-z]_/)) return false;
      // Skip other common transformation patterns
      if (part.match(/^(ar|bo|br|co|e|fl|g|l|o|r|t|z)_/)) return false;
      return true;
    });
    
    if (publicIdParts.length === 0) {
      return null;
    }
    
    // Join remaining parts and remove file extension
    const publicIdWithExt = publicIdParts.join('/');
    return publicIdWithExt.replace(/\.[^/.]+$/, '');
  } catch (error) {
    console.warn('Error extracting public_id from Cloudinary URL:', error);
    return null;
  }
};

/**
 * Generate a thumbnail URL from a Cloudinary URL
 */
export const generateThumbnailUrl = (
  cloudinaryUrl: string, 
  width: number = 200, 
  height: number = 200
): string => {
  if (!isCloudinaryUrl(cloudinaryUrl)) {
    return cloudinaryUrl; // Return original if not a Cloudinary URL
  }

  try {
    const url = new URL(cloudinaryUrl);
    const pathParts = url.pathname.split('/');
    const uploadIndex = pathParts.indexOf('upload');
    
    if (uploadIndex === -1) {
      return cloudinaryUrl;
    }
    
    // Insert transformation parameters after 'upload'
    const transformation = `w_${width},h_${height},c_fill,f_auto,q_auto`;
    pathParts.splice(uploadIndex + 1, 0, transformation);
    
    url.pathname = pathParts.join('/');
    return url.toString();
  } catch {
    return cloudinaryUrl;
  }
};

/**
 * Widget initialization helper with error boundaries
 */
export class CloudinaryWidgetManager {
  private static instance: CloudinaryWidgetManager;
  private widgets: Map<string, any> = new Map();
  private scriptLoaded: boolean = false;
  private scriptLoading: boolean = false;

  static getInstance(): CloudinaryWidgetManager {
    if (!CloudinaryWidgetManager.instance) {
      CloudinaryWidgetManager.instance = new CloudinaryWidgetManager();
    }
    return CloudinaryWidgetManager.instance;
  }

  async ensureScriptLoaded(): Promise<boolean> {
    if (this.scriptLoaded) {
      return true;
    }

    if (this.scriptLoading) {
      // Wait for script to load
      return new Promise((resolve) => {
        const checkLoaded = () => {
          if (this.scriptLoaded) {
            resolve(true);
          } else if (!this.scriptLoading) {
            resolve(false);
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
      });
    }

    return this.loadScript();
  }

  private async loadScript(): Promise<boolean> {
    if (typeof window === 'undefined') {
      return false;
    }

    // Check if already loaded
    if (window.cloudinary) {
      this.scriptLoaded = true;
      return true;
    }

    this.scriptLoading = true;

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        this.scriptLoaded = true;
        this.scriptLoading = false;
        resolve(true);
      };
      
      script.onerror = () => {
        this.scriptLoading = false;
        console.error('Failed to load Cloudinary script');
        resolve(false);
      };
      
      document.head.appendChild(script);
    });
  }

  createWidget(
    id: string, 
    options: any, 
    callback: (error: any, result: any) => void
  ): any | null {
    if (!window.cloudinary) {
      console.error('Cloudinary not available');
      return null;
    }

    try {
      // Destroy existing widget with same ID
      this.destroyWidget(id);
      
      const widget = window.cloudinary.createUploadWidget(options, callback);
      this.widgets.set(id, widget);
      
      return widget;
    } catch (error) {
      console.error('Error creating Cloudinary widget:', error);
      return null;
    }
  }

  destroyWidget(id: string): void {
    const widget = this.widgets.get(id);
    if (widget) {
      try {
        widget.destroy();
      } catch (error) {
        console.warn('Error destroying widget:', error);
      }
      this.widgets.delete(id);
    }
  }

  destroyAllWidgets(): void {
    for (const [id] of this.widgets) {
      this.destroyWidget(id);
    }
  }
}

/**
 * Utility to format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate image file before upload
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please select a JPEG, PNG, GIF, or WebP image.'
    };
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${formatFileSize(maxSize)}.`
    };
  }
  
  return { valid: true };
};

// Type declarations for window.cloudinary
declare global {
  interface Window {
    cloudinary?: {
      createUploadWidget: (
        options: any,
        callback: (error: any, result: any) => void
      ) => {
        open: () => void;
        close: () => void;
        destroy: () => void;
        update: (options: any) => void;
      };
    };
  }
}
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

/**
 * Upload widget configuration for image resources (client-side safe)
 */
export const getUploadWidgetOptions = () => ({
  sources: ['local', 'camera', 'url'],
  multiple: false,
  maxFiles: 1,
  resourceType: 'image',
  clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  maxFileSize: 10000000, // 10MB
  folder: 'co2-resources', // Organize uploads in Cloudinary
  use_filename: true,
  unique_filename: true,
  cropping: true,
  croppingAspectRatio: null, // Allow free cropping
  showSkipCropButton: true,
  styles: {
    palette: {
      window: '#ffffff',
      sourceBg: '#f4f4f5',
      windowBorder: '#90a0b3',
      tabIcon: '#0078ff',
      inactiveTabIcon: '#69778a',
      menuIcons: '#0078ff',
      link: '#0078ff',
      action: '#0078ff',
      inProgress: '#0078ff',
      complete: '#20b832',
      error: '#ea4335',
      textDark: '#000000',
      textLight: '#ffffff'
    }
  }
});

/**
 * Validate if a URL is a Cloudinary URL
 */
export const isCloudinaryUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('cloudinary.com') && urlObj.pathname.includes('/image/upload/');
  } catch {
    return false;
  }
};

/**
 * Extract public_id from Cloudinary URL
 */
export const extractPublicId = (cloudinaryUrl: string): string | null => {
  try {
    const url = new URL(cloudinaryUrl);
    const pathParts = url.pathname.split('/');
    const uploadIndex = pathParts.indexOf('upload');
    
    if (uploadIndex === -1 || uploadIndex === pathParts.length - 1) {
      return null;
    }
    
    // Get everything after 'upload' and any transformation parameters
    const afterUpload = pathParts.slice(uploadIndex + 1);
    // Skip transformation parameters (they start with things like v1234567890, w_, h_, etc.)
    const publicIdParts = afterUpload.filter(part => !part.match(/^(v\d+|w_|h_|c_|f_|q_)/));
    
    // Remove file extension
    const publicIdWithExt = publicIdParts.join('/');
    return publicIdWithExt.replace(/\.[^/.]+$/, '');
  } catch {
    return null;
  }
};
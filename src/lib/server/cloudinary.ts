// src/lib/server/cloudinary.ts

import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY } from '$env/static/private';

/**
 * Server-side configuration object for Cloudinary uploads
 */
export const getCloudinaryConfig = () => ({
  cloudName: CLOUDINARY_CLOUD_NAME,
  apiKey: CLOUDINARY_API_KEY,
});
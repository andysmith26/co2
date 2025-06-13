// src/routes/api/upload/signature/+server.ts

import { json } from '@sveltejs/kit';
import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } from '$env/static/private';
import { getSession } from '$lib/server/auth';
import type { RequestHandler } from './$types';

// Configure Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    // Verify authentication
    const session = await getSession(cookies);
    if (!session?.user?.id) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { paramsToSign } = body;

    if (!paramsToSign) {
      return json({ error: 'Parameters to sign are required' }, { status: 400 });
    }

    // Add server-side parameters
    const timestamp = Math.round(Date.now() / 1000);
    const signatureParams = {
      ...paramsToSign,
      timestamp,
      folder: 'co2-resources',
      // Add user context for tracking
      context: `user_id=${session.user.id}|uploaded_at=${new Date().toISOString()}`
    };

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(signatureParams, CLOUDINARY_API_SECRET);

    return json({
      signature,
      timestamp,
      api_key: CLOUDINARY_API_KEY,
      cloud_name: CLOUDINARY_CLOUD_NAME
    });

  } catch (error) {
    console.error('Error generating Cloudinary signature:', error);
    return json(
      { error: 'Failed to generate upload signature' },
      { status: 500 }
    );
  }
};
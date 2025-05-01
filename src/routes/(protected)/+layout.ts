// src/routes/(protected)/+layout.ts
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
  // Get parent data
  const parentData = await parent();
  
  // This route is already protected by the auth guard in hooks.server.ts
  // Just pass through the parent data
  return parentData;
};
// src/routes/(protected)/+layout.ts
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
  // Get parent data
  const parentData = await parent();
  
  // Just pass through the parent data - this ensures we have session info available
  return parentData;
};
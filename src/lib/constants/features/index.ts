/**
 * Feature Flags
 * 
 * This file contains flags to enable or disable features across the application.
 * Use these flags to conditionally render components or load routes.
 */

export const FEATURES = {
  /**
   * CONCEPT_MAPPING: Controls whether concept mapping visualization features are enabled
   * Currently under development and planned for future integration
   */
  CONCEPT_MAPPING: false,
  
  /**
   * PROJECT_TRACKING: Controls whether project tracking features are enabled
   * This is the currently active development focus
   */
  PROJECT_TRACKING: true
};

/**
 * Check if a feature is enabled
 * @param featureName The name of the feature to check
 * @returns boolean indicating if the feature is enabled
 */
export function isFeatureEnabled(featureName: keyof typeof FEATURES): boolean {
  return FEATURES[featureName] === true;
}
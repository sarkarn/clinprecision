/**
 * Application Configuration
 *
 * Central configuration for environment variables and API endpoints.
 * 
 * @module config
 * @created October 2025
 * @migrated-to-ts October 24, 2025
 */

// Declare global process for environment variables (Create React App injects these at build time)
declare const process: {
  env: {
    REACT_APP_API_GATEWAY_HOST?: string;
    REACT_APP_API_GATEWAY_PORT?: string;
  };
};

// ============================================================================
// Environment Variables
// ============================================================================

/**
 * API Gateway host from environment variable
 * @default "localhost"
 */
const API_GATEWAY_HOST: string = process.env.REACT_APP_API_GATEWAY_HOST || 'localhost';

/**
 * API Gateway port from environment variable  
 * @default "8083"
 */
const API_GATEWAY_PORT: string = process.env.REACT_APP_API_GATEWAY_PORT || '8083';

// ============================================================================
// Configuration Exports
// ============================================================================

/**
 * Base URL for API Gateway
 *
 * Constructed from REACT_APP_API_GATEWAY_HOST and REACT_APP_API_GATEWAY_PORT
 * environment variables.
 *
 * @example
 * ```typescript
 * // Development: http://localhost:8083
 * // Production: http://api.example.com:8083
 * ```
 */
export const API_BASE_URL: string = `http://${API_GATEWAY_HOST}:${API_GATEWAY_PORT}`;

/**
 * Configuration object
 */
export const config = {
  API_BASE_URL,
  API_GATEWAY_HOST,
  API_GATEWAY_PORT,
} as const;

export default config;

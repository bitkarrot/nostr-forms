/**
 * URL configuration for the application
 * Uses environment variables for different deployment environments
 */

// Determine if we're in development mode
// Use either NODE_ENV or our custom environment variable
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.REACT_APP_IS_LOCAL === 'true';

// Base URL from environment variable with fallback
export const BASE_URL = isDevelopment ? '' : (process.env.REACT_APP_BASE_URL || '');

// Base path for routes - empty for local development, '/nostr-forms' for GitHub Pages
export const BASE_PATH = isDevelopment ? '' : '/nostr-forms';

// Helper function to construct URLs with the base URL and path
export const constructUrl = (path: string): string => {
  // If running locally, use relative paths without the /nostr-forms prefix
  if (isDevelopment) {
    return path;
  }
  
  // Otherwise use the base URL with the path
  return `${BASE_URL}${path}`;
};

// Contact form URL - handle differently for development vs production
const contactFormPath = '/f/naddr1qvzqqqr4mqpzphj4jjc6qkaaswuz6wu3kzyvhhdu5e68rdfymj2dtmk5eajwvx2mqy88wumn8ghj7mn0wvhxcmmv9uqqvj64ddmxyjgexza45?viewKey=4425edf8b0c0ab84f47718452c6dd0fcfb6df2ec73ad868b31eefe0f18abc8f8';
export const CONTACT_FORM_URL = isDevelopment 
  ? contactFormPath 
  : `${BASE_URL}${contactFormPath}`;

// Response view URL
export const RESPONSES_BASE_URL = BASE_URL;

/**
 * URL configuration for the application
 * Automatically detects environment and adjusts paths accordingly
 */

// Get the public URL from the environment
const publicUrl = process.env.PUBLIC_URL || '';

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.REACT_APP_IS_LOCAL === 'true';

/**
 * Helper function to construct URLs correctly for both development and production
 * In development: Uses relative paths
 * In production: Uses paths relative to the homepage (PUBLIC_URL)
 */
export const constructUrl = (path: string): string => {
  // Make sure path starts with a slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // In development, use relative paths
  if (isDevelopment) {
    return normalizedPath;
  }
  
  // In production, prepend the public URL
  return `${publicUrl}${normalizedPath}`;
};

// Contact form URL
const contactFormPath = '/f/naddr1qvzqqqr4mqpzphj4jjc6qkaaswuz6wu3kzyvhhdu5e68rdfymj2dtmk5eajwvx2mqy88wumn8ghj7mn0wvhxcmmv9uqqvj64ddmxyjgexza45?viewKey=4425edf8b0c0ab84f47718452c6dd0fcfb6df2ec73ad868b31eefe0f18abc8f8';
export const CONTACT_FORM_URL = constructUrl(contactFormPath);

// Base URL for absolute URLs (like in notifications)
export const BASE_URL = isDevelopment 
  ? window.location.origin 
  : process.env.REACT_APP_BASE_URL || 'https://bitkarrot.github.io/nostr-forms';

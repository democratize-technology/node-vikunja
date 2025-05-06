/**
 * Unsplash background image models
 */
import { BaseEntity, JSONObject } from './common';

/**
 * Unsplash image information
 */
export interface UnsplashBackgroundImage extends BaseEntity {
  /**
   * Unique image ID
   */
  id: number;

  /**
   * Image title
   */
  title?: string;

  /**
   * URL to the full-size image
   */
  url?: string;

  /**
   * URL to the thumbnail version
   */
  thumbnail_url?: string;

  /**
   * Username of the creator
   */
  creator?: string;

  /**
   * Additional image metadata
   */
  meta?: JSONObject;
}

/**
 * Background image model for setting project background
 */
export interface BackgroundImage {
  /**
   * The unsplash photo ID to use as background
   */
  photo_id: string;
}

/**
 * Parameters for background image search
 */
export interface BackgroundSearchParams {
  /**
   * Search term
   */
  s?: string;

  /**
   * Page number for pagination
   */
  p?: number;
}

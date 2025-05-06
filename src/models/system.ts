/**
 * OpenID provider information
 */
export interface OpenIDProvider {
  id: number;
  name: string;
  auth_url: string;
  client_id: string;
}

/**
 * Vikunja system information
 */
export interface VikunjaInfo {
  version: string;
  frontend_url?: string;
  motd?: string;
  jwt_ttl?: number;
  registration_enabled?: boolean;
  email_reminders_enabled?: boolean;
  max_file_size?: number;

  // Legal information
  legal?: {
    imprint_url?: string;
    privacy_policy_url?: string;
    terms_of_service_url?: string;
  };

  // Authentication methods
  auth?: {
    local?: {
      enabled: boolean;
    };
    openid?: {
      enabled: boolean;
      providers?: OpenIDProvider[];
    };
  };
}

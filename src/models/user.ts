/**
 * Interface for changing user password
 */
export interface UserPassword {
  current_password: string;
  new_password: string;
}

/**
 * Interface for password reset request
 */
export interface PasswordReset {
  token: string;
  password: string;
}

/**
 * Interface for requesting a password reset token
 */
export interface PasswordTokenRequest {
  username: string;
}

/**
 * Interface for confirming actions with user password
 */
export interface UserPasswordConfirmation {
  password: string;
}

/**
 * Interface for confirming user deletion request
 */
export interface UserDeletionRequestConfirm {
  token: string;
}

/**
 * Interface for confirming email address
 */
export interface EmailConfirm {
  token: string;
}

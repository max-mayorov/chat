/**
 * Represents a user in the chat application
 */
export interface User {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  createdAt: Date;
}

/**
 * Contains data required to update a user's profile
 */
export interface UserProfile {
  name?: string;
  avatar?: string;
}

/**
 * User implementation with methods
 */
export class UserImpl implements User {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  createdAt: Date;

  constructor(user: User) {
    this.id = user.id;
    this.username = user.username;
    this.name = user.name;
    this.avatar = user.avatar;
    this.createdAt = user.createdAt;
  }

  /**
   * Updates the user's profile information
   */
  updateProfile(profile: UserProfile): void {
    if (profile.name) {
      this.name = profile.name;
    }

    if (profile.avatar) {
      this.avatar = profile.avatar;
    }
  }
}

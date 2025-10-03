import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  display_name: string;
  phone_number?: string;
  phone_verified: boolean;
  avatar_url?: string;
  bio?: string;
  two_factor_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  display_name?: string;
  phone_number?: string;
  avatar_url?: string;
  bio?: string;
}

export class ProfileService {
  static async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Get profile error:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Profile fetch error:', error);
      return null;
    }
  }

  static async updateProfile(userId: string, updates: UpdateProfileData): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId);

      if (error) {
        console.error('Update profile error:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    }
  }

  static async createProfile(userId: string, displayName: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          display_name: displayName,
        });

      if (error) {
        console.error('Create profile error:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Profile creation error:', error);
      return false;
    }
  }

  static async enableTwoFactor(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ two_factor_enabled: true })
        .eq('id', userId);

      if (error) {
        console.error('Enable 2FA error:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('2FA enable error:', error);
      return false;
    }
  }

  static async disableTwoFactor(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ two_factor_enabled: false })
        .eq('id', userId);

      if (error) {
        console.error('Disable 2FA error:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('2FA disable error:', error);
      return false;
    }
  }

  static async verifyPhoneNumber(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ phone_verified: true })
        .eq('id', userId);

      if (error) {
        console.error('Verify phone error:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Phone verification error:', error);
      return false;
    }
  }
}

import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  display_name: string;
  phone_number?: string;
  phone_verified: boolean;
  avatar_url?: string;
  bio?: string;
  two_factor_enabled: boolean;
  master_password_hash?: string;
  master_password_salt?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  display_name?: string;
  phone_number?: string;
  avatar_url?: string;
  bio?: string;
  master_password_hash?: string;
  master_password_salt?: string;
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

  static async setMasterPassword(userId: string, password: string): Promise<boolean> {
    try {
      const encoder = new TextEncoder();
      const passwordData = encoder.encode(password);

      const salt = crypto.getRandomValues(new Uint8Array(16));

      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordData,
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      );

      const derivedBits = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        256
      );

      const hashArray = Array.from(new Uint8Array(derivedBits));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const saltArray = Array.from(salt);
      const saltHex = saltArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const { error } = await supabase
        .from('user_profiles')
        .update({
          master_password_hash: hashHex,
          master_password_salt: saltHex,
        })
        .eq('id', userId);

      if (error) {
        console.error('Set master password error:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Master password setup error:', error);
      return false;
    }
  }

  static async verifyMasterPassword(userId: string, password: string): Promise<boolean> {
    try {
      const profile = await this.getProfile(userId);
      if (!profile?.master_password_hash || !profile?.master_password_salt) {
        return false;
      }

      const encoder = new TextEncoder();
      const passwordData = encoder.encode(password);

      const saltHex = profile.master_password_salt;
      const saltArray = saltHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [];
      const salt = new Uint8Array(saltArray);

      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordData,
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      );

      const derivedBits = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        256
      );

      const hashArray = Array.from(new Uint8Array(derivedBits));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      return hashHex === profile.master_password_hash;
    } catch (error) {
      console.error('Master password verification error:', error);
      return false;
    }
  }

  static async hasMasterPassword(userId: string): Promise<boolean> {
    try {
      const profile = await this.getProfile(userId);
      return !!(profile?.master_password_hash && profile?.master_password_salt);
    } catch (error) {
      console.error('Check master password error:', error);
      return false;
    }
  }
}

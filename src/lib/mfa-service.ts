import { supabase } from './supabase';

export interface MFASettings {
  id: string;
  user_id: string;
  mfa_enabled: boolean;
  phone_verified: boolean;
  verification_code?: string;
  code_expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Passkey {
  id: string;
  user_id: string;
  device_name: string;
  credential_id: string;
  public_key: string;
  counter: number;
  created_at: string;
  last_used_at: string;
}

export class MFAService {
  static async getMFASettings(userId: string): Promise<MFASettings | null> {
    const { data, error } = await supabase
      .from('user_mfa_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching MFA settings:', error);
      return null;
    }

    return data;
  }

  static async createMFASettings(userId: string): Promise<MFASettings | null> {
    const { data, error } = await supabase
      .from('user_mfa_settings')
      .insert({
        user_id: userId,
        mfa_enabled: false,
        phone_verified: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating MFA settings:', error);
      throw error;
    }

    return data;
  }

  static async sendVerificationCode(userId: string, phoneNumber: string): Promise<string> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    let settings = await this.getMFASettings(userId);

    if (!settings) {
      settings = await this.createMFASettings(userId);
    }

    if (!settings) {
      throw new Error('Failed to create MFA settings');
    }

    const { error } = await supabase
      .from('user_mfa_settings')
      .update({
        verification_code: code,
        code_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating verification code:', error);
      throw error;
    }

    console.log(`Verification code for ${phoneNumber}: ${code}`);

    return code;
  }

  static async verifyCode(userId: string, code: string): Promise<boolean> {
    const settings = await this.getMFASettings(userId);

    if (!settings || !settings.verification_code || !settings.code_expires_at) {
      return false;
    }

    const now = new Date();
    const expiresAt = new Date(settings.code_expires_at);

    if (now > expiresAt) {
      return false;
    }

    if (settings.verification_code !== code) {
      return false;
    }

    const { error } = await supabase
      .from('user_mfa_settings')
      .update({
        phone_verified: true,
        verification_code: null,
        code_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error verifying code:', error);
      return false;
    }

    return true;
  }

  static async enableMFA(userId: string): Promise<boolean> {
    const settings = await this.getMFASettings(userId);

    if (!settings || !settings.phone_verified) {
      throw new Error('Phone number must be verified before enabling MFA');
    }

    const { error } = await supabase
      .from('user_mfa_settings')
      .update({
        mfa_enabled: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error enabling MFA:', error);
      return false;
    }

    return true;
  }

  static async disableMFA(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_mfa_settings')
      .update({
        mfa_enabled: false,
        phone_verified: false,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error disabling MFA:', error);
      return false;
    }

    return true;
  }
}

export class PasskeyService {
  static async getPasskeys(userId: string): Promise<Passkey[]> {
    const { data, error } = await supabase
      .from('user_passkeys')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching passkeys:', error);
      return [];
    }

    return data || [];
  }

  static async registerPasskey(
    userId: string,
    deviceName: string
  ): Promise<Passkey | null> {
    const credentialId = `cred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const publicKey = `pk_${Math.random().toString(36).substr(2, 32)}`;

    const { data, error } = await supabase
      .from('user_passkeys')
      .insert({
        user_id: userId,
        device_name: deviceName,
        credential_id: credentialId,
        public_key: publicKey,
        counter: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error registering passkey:', error);
      throw error;
    }

    return data;
  }

  static async deletePasskey(passkeyId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_passkeys')
      .delete()
      .eq('id', passkeyId);

    if (error) {
      console.error('Error deleting passkey:', error);
      return false;
    }

    return true;
  }

  static async updateLastUsed(passkeyId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_passkeys')
      .update({
        last_used_at: new Date().toISOString(),
        counter: supabase.rpc('increment', { row_id: passkeyId }),
      })
      .eq('id', passkeyId);

    if (error) {
      console.error('Error updating passkey last used:', error);
      return false;
    }

    return true;
  }
}

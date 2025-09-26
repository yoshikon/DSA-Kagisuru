export interface User {
  id: string;
  email: string;
  name: string;
  planType: 'free' | 'pro';
  createdAt: string;
}

export interface EncryptedFile {
  id: string;
  userId: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  encryptedData?: Uint8Array;
  salt: Uint8Array;
  iv: Uint8Array;
  expiresAt: string;
  message?: string;
  recipients: FileRecipient[];
  downloadCount: number;
  maxDownloads?: number;
  createdAt: string;
}

export interface FileRecipient {
  id: string;
  fileId: string;
  email: string;
  encryptedKey: string;
  accessToken: string;
  accessCount: number;
  lastAccessedAt?: string;
}

export interface EncryptionProgress {
  step: 'preparing' | 'encrypting' | 'uploading' | 'complete' | 'error';
  progress: number;
  message: string;
}

export interface AuthMethod {
  type: 'webauthn' | 'otp';
  label: string;
  available: boolean;
}

export interface FileUploadState {
  files: File[];
  recipients: string[];
  expiryDays: number;
  message: string;
  isEncrypting: boolean;
  progress: EncryptionProgress;
}
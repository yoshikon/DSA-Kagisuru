// クライアントサイド暗号化ライブラリ
export class FileEncryption {
  private static readonly ITERATION_COUNT = 100000;
  private static readonly KEY_LENGTH = 256;

  // ランダムパスワード生成
  static generatePassword(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 32);
  }

  // PBKDF2で鍵導出
  private static async deriveKey(
    password: string,
    salt: Uint8Array
  ): Promise<CryptoKey> {
    const passwordBuffer = new TextEncoder().encode(password);
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    const keyMaterial = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: this.ITERATION_COUNT,
        hash: 'SHA-256'
      },
      passwordKey,
      this.KEY_LENGTH
    );

    return crypto.subtle.importKey(
      'raw',
      keyMaterial,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // ファイル暗号化
  static async encryptFile(
    file: File,
    password: string,
    onProgress?: (progress: number) => void
  ): Promise<{
    encryptedData: Uint8Array;
    salt: Uint8Array;
    iv: Uint8Array;
    originalName: string;
    mimeType: string;
    size: number;
  }> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    onProgress?.(10);

    // 鍵導出
    const key = await this.deriveKey(password, salt);
    onProgress?.(30);

    // ファイル読み込み
    const fileBuffer = await file.arrayBuffer();
    onProgress?.(50);

    // 暗号化
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      fileBuffer
    );
    onProgress?.(90);

    return {
      encryptedData: new Uint8Array(encrypted),
      salt: salt,
      iv: iv,
      originalName: file.name,
      mimeType: file.type,
      size: file.size
    };
  }

  // ファイル復号
  static async decryptFile(
    encryptedData: Uint8Array,
    password: string,
    salt: Uint8Array,
    iv: Uint8Array,
    onProgress?: (progress: number) => void
  ): Promise<ArrayBuffer> {
    onProgress?.(20);

    // 鍵導出
    const key = await this.deriveKey(password, salt);
    onProgress?.(60);

    // 復号
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encryptedData
    );
    onProgress?.(100);

    return decrypted;
  }

  // 受信者用鍵暗号化（簡素化版）
  static async encryptKeyForRecipient(
    filePassword: string,
    recipientEmail: string
  ): Promise<string> {
    const keyData = new TextEncoder().encode(filePassword);
    const emailHash = await crypto.subtle.digest('SHA-256', 
      new TextEncoder().encode(recipientEmail)
    );
    
    // 簡素化: Base64エンコードのみ（実際の実装ではより強固な暗号化が必要）
    return btoa(String.fromCharCode(...keyData));
  }

  // 受信者用鍵復号
  static async decryptKeyForRecipient(
    encryptedKey: string,
    recipientEmail: string
  ): Promise<string> {
    // 簡素化: Base64デコードのみ
    const keyData = atob(encryptedKey);
    return keyData;
  }

  // カスタムフォーマット（メタデータ付き）のファイル復号
  static async decryptFileWithMetadata(
    fileData: Uint8Array,
    password: string
  ): Promise<{
    data: Uint8Array;
    originalName: string;
    mimeType: string;
  }> {
    // ヘッダー長を読み取り（最初の4バイト）
    const dataView = new DataView(fileData.buffer, fileData.byteOffset, fileData.byteLength);
    const headerLength = dataView.getUint32(0, true);

    // ヘッダーJSONを読み取り
    const headerBytes = fileData.slice(4, 4 + headerLength);
    const headerJson = new TextDecoder().decode(headerBytes);
    const metadata = JSON.parse(headerJson);

    // 暗号化データを抽出
    const encryptedData = fileData.slice(4 + headerLength);

    // ソルトとIVを復元
    const salt = new Uint8Array(metadata.salt);
    const iv = new Uint8Array(metadata.iv);

    // 復号
    const decrypted = await this.decryptFile(encryptedData, password, salt, iv);

    return {
      data: new Uint8Array(decrypted),
      originalName: metadata.originalName,
      mimeType: metadata.mimeType,
    };
  }
}

// WebAuthn認証クラス
export class WebAuthnAuth {
  static isSupported(): boolean {
    return !!(navigator.credentials && window.PublicKeyCredential);
  }

  // 受信者認証用チャレンジ生成
  static generateChallenge(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(32));
  }

  // WebAuthn認証実行（受信者用）
  static async authenticateRecipient(
    email: string,
    challenge: Uint8Array
  ): Promise<{ success: boolean; credential?: PublicKeyCredential }> {
    if (!this.isSupported()) {
      throw new Error('WebAuthn is not supported');
    }

    try {
      const options: PublicKeyCredentialRequestOptions = {
        challenge: challenge,
        timeout: 60000,
        userVerification: 'preferred',
        // アカウントレス認証
        allowCredentials: []
      };

      const credential = await navigator.credentials.get({
        publicKey: options
      }) as PublicKeyCredential;

      return { success: true, credential };
    } catch (error) {
      console.error('WebAuthn authentication failed:', error);
      return { success: false };
    }
  }
}
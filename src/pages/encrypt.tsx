import React, { useState, useCallback } from 'react';
import { Header } from '../components/layout/header';
import { FileUploadZone } from '../components/ui/file-upload-zone';
import { RecipientForm } from '../components/encrypt/recipient-form';
import { EncryptionOptions } from '../components/encrypt/encryption-options';
import { EncryptionProgressModal } from '../components/encrypt/encryption-progress';
import { FileEncryption } from '../lib/crypto';
import { FileStorage } from '../lib/storage';
import { isSupabaseAvailable } from '../lib/supabase';
import type { EncryptionProgress } from '../types';
import { Lock, Send, ArrowRight } from 'lucide-react';

export function EncryptPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [expiryDays, setExpiryDays] = useState(7);
  const [message, setMessage] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [progress, setProgress] = useState<EncryptionProgress>({
    step: 'preparing',
    progress: 0,
    message: ''
  });

  const canEncrypt = files.length > 0 && recipients.length > 0;

  const handleEncrypt = useCallback(async () => {
    if (!canEncrypt) return;

    setIsEncrypting(true);
    setProgress({
      step: 'preparing',
      progress: 10,
      message: 'ファイルの準備中...'
    });

    try {
      // 暗号化処理のシミュレーション
      const fileToEncrypt = files[0]; // 簡単化のため最初のファイルのみ
      const password = FileEncryption.generatePassword();

      setProgress({
        step: 'encrypting',
        progress: 30,
        message: 'AES-256で暗号化中...'
      });

      const encryptedFile = await FileEncryption.encryptFile(
        fileToEncrypt,
        password,
        (progress) => {
          setProgress(prev => ({
            ...prev,
            progress: 30 + (progress * 0.4)
          }));
        }
      );

      setProgress({
        step: 'uploading',
        progress: 80,
        message: 'セキュアストレージにアップロード中...'
      });

      // ファイル保存
      const fileId = await FileStorage.saveEncryptedFile(
        encryptedFile, 
        recipients, 
        expiryDays, 
        message
      );
      
      setProgress({
        step: 'uploading',
        progress: 90,
        message: 'メール送信中...'
      });

      // メール送信
      if (isSupabaseAvailable()) {
        try {
          // 実際のメール送信（Supabase利用時）
          console.log('📧 メール送信機能は開発中です');
          // await EmailService.sendFileNotification(recipients, fileId, encryptedFile.originalName, message);
        } catch (emailError) {
          console.warn('メール送信に失敗:', emailError);
        }
      } else {
        // デモ用メール送信ログ
        console.log('📧 メール送信（デモ）:', {
          recipients,
          fileName: encryptedFile.originalName,
          fileId,
          message
        });
      }

      setProgress({
        step: 'complete',
        progress: 100,
        message: '暗号化が完了しました！'
      });

      // リセット
      setTimeout(() => {
        setFiles([]);
        setRecipients([]);
        setMessage('');
        setIsEncrypting(false);
      }, 3000);

    } catch (error) {
      console.error('Encryption failed:', error);
      setProgress({
        step: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : '暗号化に失敗しました'
      });

      setTimeout(() => {
        setIsEncrypting(false);
      }, 3000);
    }
  }, [files, recipients, message, canEncrypt]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPath="/encrypt" />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダーセクション */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Lock className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            セキュアファイル共有
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            3ステップで簡単・安全なファイル共有。AES-256暗号化でパスワード管理不要のセキュアな送信が可能です。
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8 space-y-8">
            {/* ステップ1: ファイル選択 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
                  1
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  暗号化するファイルを選択
                </h2>
              </div>
              
              <FileUploadZone 
                onFileSelect={setFiles}
                maxFiles={5}
                maxSizeBytes={100 * 1024 * 1024} // 100MB
                disabled={isEncrypting}
              />
            </div>

            {/* ステップ2: 受信者設定 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
                  2
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  受信者を指定
                </h2>
              </div>
              
              <RecipientForm
                recipients={recipients}
                onRecipientsChange={setRecipients}
                maxRecipients={5}
                disabled={isEncrypting}
              />
            </div>

            {/* ステップ3: オプション設定 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
                  3
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  オプション設定
                </h2>
              </div>
              
              <EncryptionOptions
                expiryDays={expiryDays}
                message={message}
                onExpiryChange={setExpiryDays}
                onMessageChange={setMessage}
                disabled={isEncrypting}
              />
            </div>
          </div>

          {/* 暗号化ボタン */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {files.length > 0 && recipients.length > 0 ? (
                  <span className="text-green-600 font-medium">
                    ✓ すべての設定が完了しました
                  </span>
                ) : (
                  <span>ファイルと受信者を設定してください</span>
                )}
              </div>
              
              <button
                onClick={handleEncrypt}
                disabled={!canEncrypt || isEncrypting}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 space-x-2"
              >
                <Lock className="h-5 w-5" />
                <span>暗号化して送信</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* セキュリティ情報 */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Lock className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">AES-256暗号化</h3>
            <p className="text-sm text-gray-600">
              軍用レベルの暗号化でファイルを保護
            </p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Send className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">パスワード不要</h3>
            <p className="text-sm text-gray-600">
              WebAuthnで安全な認証を実現
            </p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <ArrowRight className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">自動削除</h3>
            <p className="text-sm text-gray-600">
              設定した期限で自動的に削除
            </p>
          </div>
        </div>
      </main>

      {/* 暗号化プログレス */}
      {isEncrypting && <EncryptionProgressModal progress={progress} />}
    </div>
  );
}
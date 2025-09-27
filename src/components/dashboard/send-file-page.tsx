import React, { useState } from 'react';
import { CheckCircle, FileText, Send, ArrowLeft, User } from 'lucide-react';

interface SendFilePageProps {
  lockedFile?: {
    originalFile: File;
    encryptedData: Uint8Array;
    fileName: string;
  };
  onBack: () => void;
}

export function SendFilePage({ lockedFile, onBack }: SendFilePageProps) {
  const [recipients, setRecipients] = useState<string[]>(['今野']);
  const [newRecipient, setNewRecipient] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleAddRecipient = () => {
    if (newRecipient.trim() && !recipients.includes(newRecipient.trim())) {
      setRecipients([...recipients, newRecipient.trim()]);
      setNewRecipient('');
    }
  };

  const handleRemoveRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (recipients.length === 0) {
      alert('受信者を指定してください');
      return;
    }

    setIsSending(true);
    
    try {
      // メール送信のシミュレーション
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`${recipients.join(', ')} にファイルを送信しました！`);
      
      // 送信完了後、元の画面に戻る
      onBack();
    } catch (error) {
      console.error('送信エラー:', error);
      alert('ファイルの送信に失敗しました');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddRecipient();
    }
  };

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">ファイル施錠</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {/* 完了アイコン */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            あとはファイルを送るだけ
          </h2>
          <p className="text-gray-600">
            施錠済みファイルを受取人に共有してください。
          </p>
        </div>

        {/* 施錠済みファイル表示 */}
        <div className="bg-gray-100 rounded-lg p-6 mb-8 text-center">
          <div className="flex items-center justify-center space-x-3">
            <FileText className="h-8 w-8 text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">
                {lockedFile?.fileName || '【施錠済み】GanttChart-V1.0.xlsm.kgsr'}
              </p>
              <p className="text-sm text-gray-500">ダウンロード済み</p>
            </div>
          </div>
        </div>

        {/* カギエースユーザーの受取人 */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">
            カギエースユーザーの受取人
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス
            </label>
            
            {/* 受信者一覧 */}
            <div className="space-y-2 mb-4">
              {recipients.map((recipient, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-900">{recipient}</span>
                    {recipient === '今野' && (
                      <span className="text-sm text-gray-500">konno.29@gmail.com</span>
                    )}
                  </div>
                  {recipients.length > 1 && (
                    <button
                      onClick={() => handleRemoveRecipient(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      削除
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* 新しい受信者追加 */}
            <div className="flex space-x-2">
              <input
                type="email"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="新しい受信者のメールアドレスを入力"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSending}
              />
              <button
                onClick={handleAddRecipient}
                disabled={!newRecipient.trim() || isSending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                追加
              </button>
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="flex items-center justify-center">
            <button
              onClick={handleSend}
              disabled={recipients.length === 0 || isSending}
              className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors space-x-2"
            >
              <Send className="h-5 w-5" />
              <span>{isSending ? '送信中...' : 'ファイルを送信'}</span>
            </button>
          </div>
        </div>

        {/* 戻るボタン */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            disabled={isSending}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>別のファイルを施錠する</span>
          </button>
        </div>
      </div>
    </div>
  );
}
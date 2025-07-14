import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';

function App() {
  const [originalImage, setOriginalImage] = useState(null);
  const [originalImageUrl, setOriginalImageUrl] = useState('');
  const [compressedImage, setCompressedImage] = useState(null);
  const [compressedImageUrl, setCompressedImageUrl] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp')) {
      setOriginalImage(file);
      setOriginalImageUrl(URL.createObjectURL(file));
      setCompressedImage(null);
      setCompressedImageUrl('');
      setError('');
    } else {
      setError('JPG, PNG, WebP形式の画像ファイルを選択してください。');
      resetState();
    }
  };

  const handleCompress = async () => {
    if (!originalImage) return;

    setIsCompressing(true);
    setError('');

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(originalImage, options);
      setCompressedImage(compressedFile);
      setCompressedImageUrl(URL.createObjectURL(compressedFile));
    } catch (error) {
      setError('画像の圧縮中にエラーが発生しました。');
      console.error(error);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedImage) return;
    const link = document.createElement('a');
    link.href = compressedImageUrl;
    link.download = `compressed_${originalImage.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetState = () => {
    setOriginalImage(null);
    setOriginalImageUrl('');
    setCompressedImage(null);
    setCompressedImageUrl('');
    setIsCompressing(false);
  };

  const onDragOver = (e) => {
      e.preventDefault();
  }

  const onDrop = (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
          handleImageUpload({ target: { files: [file] } });
      }
  }

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const reductionPercentage = originalImage && compressedImage ? 
    (((originalImage.size - compressedImage.size) / originalImage.size) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8">
        <header className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">画像圧縮ツール</h1>
        </header>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">{error}</div>}

        {!originalImage && (
          <div 
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-gray-50 transition-colors" 
            onDragOver={onDragOver} 
            onDrop={onDrop}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <input type="file" id="fileInput" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageUpload} />
            <p className="text-gray-500">ここに画像をドラッグ＆ドロップ</p>
            <p className="text-gray-400 my-2">または</p>
            <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
              画像をアップロード
            </button>
          </div>
        )}

        {originalImage && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2 text-gray-700">元の画像</h2>
                <img src={originalImageUrl} alt="Original" className="rounded-lg shadow-md mx-auto max-h-80" />
                <p className="mt-2 text-gray-600">元のサイズ: {formatBytes(originalImage.size)}</p>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2 text-gray-700">圧縮後の画像</h2>
                {isCompressing ? (
                  <div className="flex items-center justify-center h-full max-h-80 rounded-lg shadow-md bg-gray-200">
                    <p className="text-gray-500">圧縮中...</p>
                  </div>
                ) : compressedImageUrl ? (
                  <img src={compressedImageUrl} alt="Compressed" className="rounded-lg shadow-md mx-auto max-h-80" />
                ) : (
                  <div className="flex items-center justify-center h-full max-h-80 rounded-lg shadow-md bg-gray-200">
                    <p className="text-gray-500">圧縮待機中</p>
                  </div>
                )}
                {compressedImage && <p className="mt-2 text-gray-600">圧縮後のサイズ: {formatBytes(compressedImage.size)} (<span className="text-green-600 font-bold">▼{reductionPercentage}%削減</span>)</p>}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={handleCompress} disabled={isCompressing || compressedImage} className="w-full sm:w-auto bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                {isCompressing ? '圧縮中...' : '圧縮する'}
              </button>
              <button onClick={handleDownload} disabled={!compressedImage} className="w-full sm:w-auto bg-blue-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                ダウンロード
              </button>
              <button onClick={resetState} className="w-full sm:w-auto bg-gray-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors">
                クリア
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

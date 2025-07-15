import React, { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import { FiSun, FiMoon } from 'react-icons/fi';

function App() {
  const [originalImage, setOriginalImage] = useState(null);
  const [originalImageUrl, setOriginalImageUrl] = useState('');
  const [compressedImage, setCompressedImage] = useState(null);
  const [compressedImageUrl, setCompressedImageUrl] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 flex flex-col items-center justify-center p-4 font-sans transition-colors duration-300">
      <div className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 transition-colors duration-300">
        <header className="flex items-center justify-between mb-8">
          <div className="w-10"></div> {/* Spacer for balance */}
          <h1 className="flex-1 text-center text-2xl sm:text-4xl md:text-5xl font-bold text-custom-blue mx-4">画像圧縮ツール</h1>
          <button onClick={toggleTheme} className="flex-shrink-0 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-blue focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 transition-all duration-300">
            {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
          </button>
        </header>

        {error && <div className="bg-red-100 dark:bg-red-500/20 border border-red-400 dark:border-red-500 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg relative mb-6" role="alert">{error}</div>}

        {!originalImage && (
          <div 
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center cursor-pointer hover:border-custom-blue dark:hover:border-custom-blue hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300"
            onDragOver={onDragOver} 
            onDrop={onDrop}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <input type="file" id="fileInput" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageUpload} />
            <p className="text-gray-500 dark:text-gray-400 text-lg">ここに画像をドラッグ＆ドロップ</p>
            <p className="text-gray-400 dark:text-gray-500 my-3">または</p>
            <button className="bg-custom-blue text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl">
              画像をアップロード
            </button>
          </div>
        )}

        {originalImage && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300">元の画像</h2>
                <img src={originalImageUrl} alt="Original" className="rounded-lg shadow-lg mx-auto max-h-96" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">元のサイズ: {formatBytes(originalImage.size)}</p>
              </div>
              <div className="text-center bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300">圧縮後の画像</h2>
                {isCompressing ? (
                  <div className="flex items-center justify-center h-full max-h-96 rounded-lg shadow-lg bg-gray-200 dark:bg-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">圧縮中...</p>
                  </div>
                ) : compressedImageUrl ? (
                  <img src={compressedImageUrl} alt="Compressed" className="rounded-lg shadow-lg mx-auto max-h-96" />
                ) : (
                  <div className="flex items-center justify-center h-full max-h-96 rounded-lg shadow-lg bg-gray-200 dark:bg-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">圧縮待機中</p>
                  </div>
                )}
                {compressedImage && <p className="mt-4 text-gray-600 dark:text-gray-400">圧縮後のサイズ: {formatBytes(compressedImage.size)} (<span className="text-green-500 dark:text-green-400 font-bold">▼{reductionPercentage}%削減</span>)</p>}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button onClick={handleCompress} disabled={isCompressing || compressedImage} className="w-full sm:w-auto bg-custom-blue text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed shadow-md hover:shadow-lg">
                {isCompressing ? '圧縮中...' : '圧縮する'}
              </button>
              <button onClick={handleDownload} disabled={!compressedImage} className="w-full sm:w-auto bg-custom-blue text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed shadow-md hover:shadow-lg">
                ダウンロード
              </button>
              <button onClick={resetState} className="w-full sm:w-auto bg-gray-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 transition-colors shadow-md hover:shadow-lg">
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


import React, { useState, useCallback, useMemo } from 'react';
import { generateTryOnImages } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import ResultGallery from './components/ResultGallery';
import { PersonIcon, GarmentIcon } from './components/icons';

interface ImageFile {
  file: File;
  preview: string;
}

const fileToImageFile = (file: File): Promise<ImageFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve({ file, preview: reader.result as string });
    reader.onerror = (error) => reject(error);
  });
};

const App: React.FC = () => {
  const [personImage, setPersonImage] = useState<ImageFile | null>(null);
  const [garmentImage, setGarmentImage] = useState<ImageFile | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numberOfImages, setNumberOfImages] = useState<number>(5);
  const [aspectRatio, setAspectRatio] = useState<string>('9:16');
  const [autoDownload, setAutoDownload] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>('');

  const handlePersonImageSelect = useCallback(async (file: File) => {
    const imageFile = await fileToImageFile(file);
    setPersonImage(imageFile);
  }, []);

  const handleGarmentImageSelect = useCallback(async (file: File) => {
    const imageFile = await fileToImageFile(file);
    setGarmentImage(imageFile);
  }, []);
  
  const downloadImage = (dataUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `virtual-try-on-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerate = async () => {
    if (!personImage || !garmentImage) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const results = await generateTryOnImages(personImage.file, garmentImage.file, numberOfImages, aspectRatio, prompt);
      setGeneratedImages(results);
      if (autoDownload) {
          results.forEach((imageSrc, index) => {
              downloadImage(imageSrc, index);
          });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPersonImage(null);
    setGarmentImage(null);
    setGeneratedImages([]);
    setError(null);
    setIsLoading(false);
    setNumberOfImages(5);
    setAspectRatio('9:16');
    setAutoDownload(false);
    setPrompt('');
  };

  const canGenerate = useMemo(() => personImage && garmentImage && !isLoading, [personImage, garmentImage, isLoading]);

  const imageCountOptions = [1, 3, 5];
  const aspectRatios = ['9:16', '1:1', '16:9'];

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-600">
            AI Virtual Try-On
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Visualize new outfits instantly. Upload your photo and a garment to begin.
          </p>
        </header>

        <main>
          {generatedImages.length === 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ImageUploader
                  id="person-uploader"
                  title="Upload Your Photo"
                  icon={<PersonIcon />}
                  onFileSelect={handlePersonImageSelect}
                  preview={personImage?.preview}
                  onClear={() => setPersonImage(null)}
                />
                <ImageUploader
                  id="garment-uploader"
                  title="Upload Garment Image"
                  icon={<GarmentIcon />}
                  onFileSelect={handleGarmentImageSelect}
                  preview={garmentImage?.preview}
                  onClear={() => setGarmentImage(null)}
                />
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-6 text-center">Generation Options</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col items-center space-y-3">
                        <label className="text-lg text-gray-300">Number of Images:</label>
                        <div className="flex space-x-2 sm:space-x-4">
                            {imageCountOptions.map((count) => (
                                <button
                                    key={count}
                                    onClick={() => setNumberOfImages(count)}
                                    className={`px-5 py-2 text-sm sm:text-base font-semibold rounded-lg transition-all duration-200 ${
                                    numberOfImages === count
                                        ? 'bg-indigo-600 text-white shadow-lg'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    {count}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col items-center space-y-3">
                        <label className="text-lg text-gray-300">Aspect Ratio:</label>
                        <div className="flex space-x-2 sm:space-x-4">
                            {aspectRatios.map((ratio) => (
                                <button
                                    key={ratio}
                                    onClick={() => setAspectRatio(ratio)}
                                    className={`px-5 py-2 text-sm sm:text-base font-semibold rounded-lg transition-all duration-200 ${
                                    aspectRatio === ratio
                                        ? 'bg-indigo-600 text-white shadow-lg'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    {ratio}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="mt-6">
                    <label htmlFor="prompt-input" className="block text-lg text-gray-300 font-medium text-center mb-3">Additional Instructions (Optional)</label>
                    <textarea
                        id="prompt-input"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., change background to a beach, add a hat..."
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        rows={2}
                    />
                </div>
                <div className="mt-6 flex items-center justify-center">
                    <input
                        id="autoDownload"
                        type="checkbox"
                        checked={autoDownload}
                        onChange={(e) => setAutoDownload(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-600 focus:ring-2"
                    />
                    <label htmlFor="autoDownload" className="ml-3 text-base font-medium text-gray-300">
                        Auto-download results
                    </label>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <button
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  className="w-full max-w-md px-8 py-4 bg-indigo-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100 flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : `Generate ${numberOfImages} Image${numberOfImages > 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
                <button
                  onClick={handleReset}
                  className="mb-8 px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-300"
                >
                  Start Over
                </button>
            </div>
          )}

          {error && (
            <div className="mt-6 text-center text-red-400 bg-red-900/50 p-4 rounded-lg">
              <p><strong>Error:</strong> {error}</p>
            </div>
          )}

          <ResultGallery isLoading={isLoading} images={generatedImages} numberOfImagesToGenerate={numberOfImages} aspectRatio={aspectRatio} />
        </main>
      </div>
    </div>
  );
};

export default App;

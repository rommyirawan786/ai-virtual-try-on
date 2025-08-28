
import React from 'react';
import { DownloadIcon } from './icons';

interface ResultGalleryProps {
  isLoading: boolean;
  images: string[];
  numberOfImagesToGenerate: number;
  aspectRatio: string;
}

const getAspectRatioClass = (ratio: string): string => {
  switch (ratio) {
    case '1:1':
      return 'aspect-square';
    case '16:9':
      return 'aspect-video';
    case '9:16':
    default:
      return 'aspect-[9/16]';
  }
};

const SkeletonLoader: React.FC<{ aspectRatioClass: string }> = ({ aspectRatioClass }) => (
  <div className={`bg-gray-700 rounded-lg animate-pulse ${aspectRatioClass}`}></div>
);

const ResultGallery: React.FC<ResultGalleryProps> = ({ isLoading, images, numberOfImagesToGenerate, aspectRatio }) => {
  if (!isLoading && images.length === 0) {
    return null;
  }
  
  const aspectRatioClass = getAspectRatioClass(aspectRatio);

  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold text-center mb-8">Your Virtual Try-On Results</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {isLoading
          ? Array.from({ length: numberOfImagesToGenerate }).map((_, index) => <SkeletonLoader key={index} aspectRatioClass={aspectRatioClass} />)
          : images.map((src, index) => (
              <div key={index} className={`group relative bg-gray-800 rounded-lg overflow-hidden shadow-lg ${aspectRatioClass}`}>
                <img
                  src={src}
                  alt={`Generated try-on ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                 <a
                  href={src}
                  download={`virtual-try-on-${index + 1}.png`}
                  className="absolute bottom-2 right-2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/75 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
                  aria-label={`Download image ${index + 1}`}
                  title="Download"
                >
                  <DownloadIcon />
                </a>
              </div>
            ))}
      </div>
    </div>
  );
};

export default ResultGallery;

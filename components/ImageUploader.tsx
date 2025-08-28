
import React, { useRef, useCallback } from 'react';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  onFileSelect: (file: File) => void;
  preview: string | null | undefined;
  onClear: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ id, title, icon, onFileSelect, preview, onClear }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };
  
  const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      onClear();
      if(inputRef.current) {
          inputRef.current.value = "";
      }
  }

  return (
    <div className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-xl p-6 text-center transition-all duration-300 hover:border-indigo-500 hover:bg-gray-700/50 relative aspect-[4/3] flex items-center justify-center">
      <input
        id={id}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      {preview ? (
        <>
            <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-lg"/>
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 bg-red-600/80 text-white rounded-full p-1.5 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500"
              aria-label="Clear image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
        </>
      ) : (
        <label
          htmlFor={id}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="cursor-pointer flex flex-col items-center justify-center text-gray-400 w-full h-full"
        >
          <div className="w-16 h-16 mb-4 text-indigo-400">{icon}</div>
          <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
          <p className="flex items-center space-x-2">
            <UploadIcon />
            <span>Drag & drop or click to upload</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP</p>
        </label>
      )}
    </div>
  );
};

export default ImageUploader;

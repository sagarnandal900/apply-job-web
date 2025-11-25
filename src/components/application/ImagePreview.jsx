import React from 'react';

const ImagePreview = ({ src, alt = 'Preview' }) => {
  if (!src) return null;

  return (
    <div className="mb-4">
      <label className="label">Preview</label>
      <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
        <img
          src={src}
          alt={alt}
          className="max-w-xs max-h-64 object-contain mx-auto rounded-lg shadow-md"
        />
      </div>
    </div>
  );
};

export default ImagePreview;

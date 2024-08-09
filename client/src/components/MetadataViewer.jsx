import React from 'react';

const MetadataViewer = ({ metadata }) => {
  if (!metadata) return null;

  return (
    <div className="mt-4 bg-gray-100 p-4 rounded-lg">
      <h2 className="text-lg font-semibold mb-2">URL Preview</h2>
      {metadata.image && (
        <img src={metadata.image} alt="Preview" className="w-full h-32 object-cover rounded mb-2" />
      )}
      {metadata.title && <h3 className="font-medium">{metadata.title}</h3>}
      {metadata.description && <p className="text-sm text-gray-600">{metadata.description}</p>}
    </div>
  );
};

export default MetadataViewer;
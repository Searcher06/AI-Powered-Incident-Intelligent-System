import { useState, useRef } from 'react';
import clsx from 'clsx';
import { uploadImage } from '../../api/reports.api';

export default function ImageUpload({ onUpload, value }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      setError('Unsupported file type. Use JPEG, PNG, WebP or GIF.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Max 10MB.');
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const result = await uploadImage(file);
      onUpload(result);
    } catch (err) {
      setError(err.message || 'Upload failed. Check Cloudinary permissions.');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const onInputChange = (e) => {
    handleFile(e.target.files[0]);
  };

  if (value?.url) {
    return (
      <div className="relative rounded-lg overflow-hidden border border-[#c3c6d7] h-48 group">
        <img src={value.url} alt="Uploaded" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            type="button"
            onClick={() => onUpload(null)}
            className="bg-white text-[#ba1a1a] font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={clsx(
          'border-2 border-dashed rounded-lg h-48 flex flex-col items-center justify-center text-center cursor-pointer transition-colors',
          dragging
            ? 'border-[#004ac6] bg-[#dbe1ff]/30'
            : 'border-[#c3c6d7] bg-[#ffffff] hover:bg-[#f2f4f6]'
        )}
      >
        {uploading ? (
          <>
            <div className="w-10 h-10 rounded-full border-2 border-[#004ac6] border-t-transparent animate-spin mb-3" />
            <p className="text-sm font-semibold text-[#191c1e]">Uploading…</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 bg-[#dbe1ff] rounded-full flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[#004ac6]" style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>
                cloud_upload
              </span>
            </div>
            <p className="text-sm font-semibold text-[#191c1e] mb-1">Drag and drop image here</p>
            <p className="text-xs text-[#434655]">or click to browse · JPEG, PNG, WebP · Max 10MB</p>
          </>
        )}
      </div>
      {error && (
        <p className="mt-2 text-xs text-[#ba1a1a] flex items-center gap-1">
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>error</span>
          {error}
        </p>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={onInputChange} className="hidden" />
    </div>
  );
}

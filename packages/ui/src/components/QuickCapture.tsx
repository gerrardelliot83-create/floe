import React, { useState } from 'react';

interface QuickCaptureProps {
  onCapture: (type: string, content: any) => void;
  onClose?: () => void;
  isOpen?: boolean;
  className?: string;
}

export function QuickCapture({ onCapture, onClose, isOpen = true, className = '' }: QuickCaptureProps) {
  const [activeTab, setActiveTab] = useState<'note' | 'link' | 'file'>('note');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (loading) return;

    setLoading(true);
    try {
      switch (activeTab) {
        case 'note':
          if (content.trim()) {
            await onCapture('note', { content: content.trim() });
            setContent('');
          }
          break;
        case 'link':
          if (url.trim()) {
            await onCapture('link', { url: url.trim() });
            setUrl('');
          }
          break;
        case 'file':
          // File upload will be handled by parent component
          break;
      }
      onClose?.();
    } catch (error) {
      console.error('Failed to capture:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose?.();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
      <div
        className={`
          bg-background-light dark:bg-background-dark
          border border-border-light dark:border-border-dark
          w-full max-w-lg mx-lg
          ${className}
        `}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-lg py-md border-b border-border-light dark:border-border-dark">
          <h2 className="text-base font-medium text-text-primary-light dark:text-text-primary-dark">
            Quick Capture
          </h2>
          <button
            onClick={onClose}
            className="
              text-text-tertiary-light dark:text-text-tertiary-dark
              hover:text-text-primary-light dark:hover:text-text-primary-dark
              transition-colors duration-150
              text-sm
            "
          >
            ✕
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-border-light dark:border-border-dark">
          {[
            { id: 'note' as const, label: 'Note' },
            { id: 'link' as const, label: 'Link' },
            { id: 'file' as const, label: 'File' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 px-lg py-sm text-sm font-medium transition-colors duration-150
                ${activeTab === tab.id
                  ? 'text-text-primary-light dark:text-text-primary-dark border-b-2 border-text-primary-light dark:border-text-primary-dark'
                  : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className="px-lg py-lg space-y-lg">
          {activeTab === 'note' && (
            <div>
              <label className="block text-text-primary-light dark:text-text-primary-dark text-sm mb-xs">
                Note
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note..."
                className="
                  w-full h-32 resize-none
                  bg-transparent
                  text-text-primary-light dark:text-text-primary-dark
                  placeholder-text-tertiary-light dark:placeholder-text-tertiary-dark
                  border border-border-light dark:border-border-dark
                  px-sm py-sm
                  focus:border-text-primary-light dark:focus:border-text-primary-dark
                  focus:outline-none
                  transition-colors duration-150
                "
                autoFocus
              />
              <p className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark mt-xs">
                ⌘ + Enter to save
              </p>
            </div>
          )}

          {activeTab === 'link' && (
            <div>
              <label className="block text-text-primary-light dark:text-text-primary-dark text-sm mb-xs">
                URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="input-minimal w-full"
                autoFocus
              />
              <p className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark mt-xs">
                We'll automatically extract the title and preview
              </p>
            </div>
          )}

          {activeTab === 'file' && (
            <div>
              <div className="
                border-2 border-dashed border-border-light dark:border-border-dark
                py-xl px-lg text-center
                hover:border-text-secondary-light dark:hover:border-text-secondary-dark
                transition-colors duration-150
                cursor-pointer
              ">
                <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm mb-xs">
                  Drop files here or click to browse
                </p>
                <p className="text-text-tertiary-light dark:text-text-tertiary-dark text-xs">
                  Images, PDFs, documents, audio, and video files
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      onCapture('files', { files });
                      onClose?.();
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-sm px-lg py-md border-t border-border-light dark:border-border-dark">
          <button
            onClick={onClose}
            disabled={loading}
            className="btn-ghost"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              loading ||
              (activeTab === 'note' && !content.trim()) ||
              (activeTab === 'link' && !url.trim())
            }
            className="btn-primary"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface QuickCaptureTriggerProps {
  onOpen: () => void;
  className?: string;
  position?: 'fixed' | 'relative';
}

export function QuickCaptureTrigger({
  onOpen,
  className = '',
  position = 'fixed'
}: QuickCaptureTriggerProps) {
  const positionClasses = position === 'fixed'
    ? 'fixed bottom-lg right-lg'
    : 'relative';

  return (
    <button
      onClick={onOpen}
      className={`
        ${positionClasses}
        w-12 h-12
        bg-text-primary-light dark:bg-text-primary-dark
        text-background-light dark:text-background-dark
        flex items-center justify-center
        hover:opacity-70
        transition-opacity duration-150
        z-40
        ${className}
      `}
      title="Quick capture (⌘ + K)"
    >
      +
    </button>
  );
}
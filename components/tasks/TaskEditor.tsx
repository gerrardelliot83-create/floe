'use client';

import { useEffect, useRef, useState } from 'react';
import EditorJS, { OutputData } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Checklist from '@editorjs/checklist';
import Code from '@editorjs/code';
import InlineCode from '@editorjs/inline-code';
import Embed from '@editorjs/embed';

interface TaskEditorProps {
  data?: OutputData;
  onChange?: (data: OutputData) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export default function TaskEditor({ data, onChange, placeholder = 'Start writing...', readOnly = false }: TaskEditorProps) {
  const editorRef = useRef<EditorJS | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!editorRef.current) {
      const editor = new EditorJS({
        holder: 'editorjs',
        placeholder,
        readOnly,
        data: data || {
          blocks: []
        },
        tools: {
          header: {
            class: Header,
            config: {
              levels: [1, 2, 3, 4],
              defaultLevel: 2
            }
          },
          list: {
            class: List,
            inlineToolbar: true,
            config: {
              defaultStyle: 'unordered'
            }
          },
          checklist: {
            class: Checklist,
            inlineToolbar: true,
          },
          code: Code,
          inlineCode: {
            class: InlineCode,
            shortcut: 'CMD+SHIFT+M',
          },
          embed: {
            class: Embed,
            config: {
              services: {
                youtube: true,
                vimeo: true,
                twitter: true,
                instagram: true,
                github: true,
              }
            }
          },
        },
        onChange: async (api) => {
          if (onChange && !readOnly) {
            const content = await api.saver.save();
            onChange(content);
          }
        },
        onReady: () => {
          setIsReady(true);
        }
      });

      editorRef.current = editor;
    }

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      className={`editor-wrapper ${readOnly ? 'editor-readonly' : ''}`}
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem',
        minHeight: '200px'
      }}
    >
      <div id="editorjs" />
      <style jsx global>{`
        .codex-editor__redactor {
          padding-bottom: 0 !important;
        }
        
        .ce-block__content,
        .ce-toolbar__content {
          max-width: 100% !important;
        }
        
        .ce-toolbar__actions {
          right: 10px !important;
        }

        .ce-paragraph {
          color: var(--text-primary);
        }

        .ce-header {
          color: var(--text-primary);
          font-family: 'Lora', serif;
        }

        .ce-code__textarea {
          background: var(--glass) !important;
          color: var(--text-primary) !important;
          border: 1px solid var(--glass-border) !important;
          border-radius: var(--radius-sm) !important;
        }

        .ce-inline-code {
          background: var(--glass) !important;
          color: var(--primary) !important;
          border: 1px solid var(--glass-border) !important;
          padding: 2px 6px !important;
          border-radius: 4px !important;
        }

        .cdx-checklist__item-checkbox {
          border: 2px solid var(--glass-border) !important;
          border-radius: 4px !important;
          background: transparent !important;
        }

        .cdx-checklist__item--checked .cdx-checklist__item-checkbox {
          background: var(--primary) !important;
          border-color: var(--primary) !important;
        }

        .cdx-checklist__item-text {
          color: var(--text-primary) !important;
        }

        .ce-toolbar__plus,
        .ce-toolbar__settings-btn {
          color: var(--text-secondary) !important;
          background: var(--glass) !important;
        }

        .ce-toolbar__plus:hover,
        .ce-toolbar__settings-btn:hover {
          background: var(--glass-hover) !important;
        }

        .ce-popover {
          background: var(--bg-secondary) !important;
          border: 1px solid var(--glass-border) !important;
          box-shadow: var(--shadow-lg) !important;
        }

        .ce-popover__item {
          color: var(--text-primary) !important;
        }

        .ce-popover__item:hover {
          background: var(--glass-hover) !important;
        }

        .ce-popover__item-icon {
          color: var(--text-secondary) !important;
        }

        .ce-conversion-toolbar {
          background: var(--bg-secondary) !important;
          border: 1px solid var(--glass-border) !important;
        }

        .ce-conversion-toolbar__label {
          color: var(--text-primary) !important;
        }

        .ce-conversion-tool:hover {
          background: var(--glass-hover) !important;
        }

        .editor-readonly .ce-toolbar {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
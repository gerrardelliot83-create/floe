'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { SmartSpaceRuleBuilder } from './SmartSpaceRuleBuilder';
import { SmartSpacesManager, RuleBuilder, type SmartSpaceRules, type CreateSmartSpaceOptions, type UpdateSmartSpaceOptions } from '@floe/shared';
import type { SmartSpace } from '@floe/shared';

interface SmartSpaceEditorProps {
  userId: string;
  smartSpace?: SmartSpace; // For editing existing space
  isOpen: boolean;
  onClose: () => void;
  onSave?: (smartSpace: SmartSpace) => void;
  className?: string;
}

export function SmartSpaceEditor({
  userId,
  smartSpace,
  isOpen,
  onClose,
  onSave,
  className = ''
}: SmartSpaceEditorProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('folder');
  const [rules, setRules] = useState<SmartSpaceRules>({ conditions: [], logic: 'AND' });
  const [isValid, setIsValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with existing space data
  useEffect(() => {
    if (smartSpace) {
      setName(smartSpace.name);
      setDescription(smartSpace.description || '');
      setIcon(smartSpace.icon || 'folder');
      setRules(smartSpace.rules as SmartSpaceRules || { conditions: [], logic: 'AND' });
    } else {
      // Reset form for new space
      setName('');
      setDescription('');
      setIcon('folder');
      setRules({ conditions: [], logic: 'AND' });
    }
    setError(null);
  }, [smartSpace, isOpen]);

  const handleRulesChange = (newRules: SmartSpaceRules) => {
    setRules(newRules);
  };

  const handleValidationChange = (valid: boolean, errors: string[]) => {
    setIsValid(valid && name.trim().length > 0);
    setValidationErrors(errors);
  };

  const handleSave = async () => {
    if (!isValid) return;

    setLoading(true);
    setError(null);

    try {
      let savedSpace: SmartSpace;

      if (smartSpace) {
        // Update existing space
        const updateOptions: UpdateSmartSpaceOptions = {
          spaceId: smartSpace.id,
          userId,
          name: name.trim(),
          description: description.trim() || undefined,
          icon,
          rules
        };
        savedSpace = await SmartSpacesManager.updateSmartSpace(updateOptions);
      } else {
        // Create new space
        const createOptions: CreateSmartSpaceOptions = {
          userId,
          name: name.trim(),
          description: description.trim() || undefined,
          icon,
          rules
        };
        savedSpace = await SmartSpacesManager.createSmartSpace(createOptions);
      }

      onSave?.(savedSpace);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save smart space');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const availableIcons = [
    { id: 'folder', symbol: '□', label: 'Folder' },
    { id: 'clock', symbol: '○', label: 'Clock' },
    { id: 'image', symbol: '◇', label: 'Image' },
    { id: 'document', symbol: '◈', label: 'Document' },
    { id: 'note', symbol: '◉', label: 'Note' },
    { id: 'star', symbol: '★', label: 'Star' },
    { id: 'briefcase', symbol: '◆', label: 'Work' },
    { id: 'book', symbol: '◎', label: 'Book' },
    { id: 'heart', symbol: '♡', label: 'Heart' },
    { id: 'tag', symbol: '#', label: 'Tag' }
  ];

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 ${className}`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-lg">
        <div className="
          bg-bg-primary-light dark:bg-bg-primary-dark
          border border-border-light dark:border-border-dark
          max-w-2xl w-full max-h-[90vh] overflow-y-auto
        ">
          {/* Header */}
          <div className="border-b border-border-light dark:border-border-dark p-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-text-primary-light dark:text-text-primary-dark">
                  {smartSpace ? 'Edit Smart Space' : 'Create Smart Space'}
                </h2>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-xs">
                  {smartSpace ? 'Modify the space configuration' : 'Set up automatic organization rules'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="
                  text-text-tertiary-light dark:text-text-tertiary-dark
                  hover:text-text-primary-light dark:hover:text-text-primary-dark
                  transition-colors duration-150 text-xl
                "
              >
                ×
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-lg space-y-xl">
            {/* Basic information */}
            <div className="space-y-lg">
              <div>
                <h3 className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-md">
                  Basic Information
                </h3>

                <div className="space-y-md">
                  {/* Name */}
                  <div>
                    <label className="block text-sm text-text-primary-light dark:text-text-primary-dark mb-xs">
                      Name *
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Work Articles, Design Inspiration, Important Notes"
                      maxLength={50}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm text-text-primary-light dark:text-text-primary-dark mb-xs">
                      Description
                    </label>
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Optional description of what this space contains"
                      maxLength={200}
                    />
                  </div>

                  {/* Icon selector */}
                  <div>
                    <label className="block text-sm text-text-primary-light dark:text-text-primary-dark mb-xs">
                      Icon
                    </label>
                    <div className="grid grid-cols-5 gap-sm">
                      {availableIcons.map((iconOption) => (
                        <button
                          key={iconOption.id}
                          onClick={() => setIcon(iconOption.id)}
                          className={`
                            p-md border transition-colors duration-150 text-center
                            ${icon === iconOption.id
                              ? 'bg-selected-light dark:bg-selected-dark border-border-dark dark:border-border-light'
                              : 'bg-transparent border-border-light dark:border-border-dark hover:bg-hover-light dark:hover:bg-hover-dark'
                            }
                          `}
                        >
                          <div className="space-y-xs">
                            <div className="text-lg">{iconOption.symbol}</div>
                            <div className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark">
                              {iconOption.label}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rules section */}
            <div className="space-y-md">
              <div>
                <h3 className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-xs">
                  Organization Rules
                </h3>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mb-md">
                  Define conditions that cards must meet to be automatically added to this space.
                </p>
              </div>

              <SmartSpaceRuleBuilder
                initialRules={rules}
                onChange={handleRulesChange}
                onValidationChange={handleValidationChange}
              />
            </div>

            {/* Error display */}
            {error && (
              <div className="border border-red-500 p-md bg-red-50 dark:bg-red-950">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Preview */}
            <div className="border border-border-light dark:border-border-dark p-md bg-bg-secondary-light dark:bg-bg-secondary-dark">
              <div className="space-y-sm">
                <p className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark font-mono tracking-wide uppercase">
                  Preview
                </p>
                <div className="flex items-start space-x-sm">
                  <span className="text-lg text-text-primary-light dark:text-text-primary-dark">
                    {availableIcons.find(i => i.id === icon)?.symbol || '□'}
                  </span>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                      {name || 'Untitled Space'}
                    </h4>
                    {description && (
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-xs">
                        {description}
                      </p>
                    )}
                    <p className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark mt-xs">
                      {RuleBuilder.rulesToDescription(rules)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border-light dark:border-border-dark p-lg">
            <div className="flex items-center justify-end space-x-md">
              <Button
                variant="ghost"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!isValid || loading}
                loading={loading}
              >
                {smartSpace ? 'Update Space' : 'Create Space'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
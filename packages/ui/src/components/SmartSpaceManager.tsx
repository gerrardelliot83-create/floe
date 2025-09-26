'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { SmartSpaceGrid, SmartSpaceCard } from './SmartSpace';
import { SmartSpaceEditor } from './SmartSpaceEditor';
import { Grid } from './Grid';
import { Card } from './Card';
import { SearchBar } from './SearchBar';
import { LoadingState, EmptyState } from './Layout';
import { SmartSpacesManager } from '@floe/shared';
import type { SmartSpace, Card as CardType } from '@floe/shared';

interface SmartSpaceManagerProps {
  userId: string;
  className?: string;
}

export function SmartSpaceManager({ userId, className = '' }: SmartSpaceManagerProps) {
  const [smartSpaces, setSmartSpaces] = useState<SmartSpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<SmartSpace | null>(null);
  const [spaceCards, setSpaceCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingSpace, setEditingSpace] = useState<SmartSpace | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load smart spaces
  const loadSmartSpaces = async () => {
    try {
      setLoading(true);
      const spaces = await SmartSpacesManager.getUserSmartSpaces(userId);
      setSmartSpaces(spaces);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load smart spaces');
    } finally {
      setLoading(false);
    }
  };

  // Load cards for selected space
  const loadSpaceCards = async (space: SmartSpace) => {
    try {
      setCardsLoading(true);
      const cards = await SmartSpacesManager.getSmartSpaceCards(space.id, userId, 50, 0);
      setSpaceCards(cards);
    } catch (err) {
      console.error('Failed to load space cards:', err);
      setSpaceCards([]);
    } finally {
      setCardsLoading(false);
    }
  };

  useEffect(() => {
    loadSmartSpaces();
  }, [userId]);

  useEffect(() => {
    if (selectedSpace) {
      loadSpaceCards(selectedSpace);
    } else {
      setSpaceCards([]);
    }
  }, [selectedSpace]);

  const handleSpaceClick = (space: SmartSpace) => {
    setSelectedSpace(selectedSpace?.id === space.id ? null : space);
  };

  const handleSpaceEdit = (space: SmartSpace) => {
    setEditingSpace(space);
    setShowEditor(true);
  };

  const handleSpaceDelete = async (space: SmartSpace) => {
    if (!confirm(`Are you sure you want to delete "${space.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      await SmartSpacesManager.deleteSmartSpace(space.id, userId);
      await loadSmartSpaces();
      if (selectedSpace?.id === space.id) {
        setSelectedSpace(null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete smart space');
    }
  };

  const handleCreateSpace = () => {
    setEditingSpace(null);
    setShowEditor(true);
  };

  const handleEditorClose = () => {
    setShowEditor(false);
    setEditingSpace(null);
  };

  const handleEditorSave = async () => {
    await loadSmartSpaces();
    setShowEditor(false);
    setEditingSpace(null);
  };

  const handleRefreshAll = async () => {
    try {
      setLoading(true);
      await SmartSpacesManager.refreshUserSmartSpaces(userId);
      await loadSmartSpaces();
      if (selectedSpace) {
        await loadSpaceCards(selectedSpace);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to refresh smart spaces');
    } finally {
      setLoading(false);
    }
  };

  const filteredSpaces = smartSpaces.filter(space =>
    searchQuery ? space.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  if (loading) {
    return <LoadingState message="Loading smart spaces..." />;
  }

  if (error) {
    return (
      <EmptyState
        title="Failed to load smart spaces"
        description={error}
        action={
          <Button onClick={loadSmartSpaces}>
            Try again
          </Button>
        }
      />
    );
  }

  return (
    <div className={`space-y-xl ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-medium text-text-primary-light dark:text-text-primary-dark mb-xs">
            Smart Spaces
          </h1>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Automatically organized collections of your content
          </p>
        </div>

        <div className="flex items-center space-x-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefreshAll}
            loading={loading}
          >
            Refresh all
          </Button>
          <Button
            onClick={handleCreateSpace}
          >
            Create space
          </Button>
        </div>
      </div>

      {/* Search */}
      {smartSpaces.length > 5 && (
        <div className="max-w-md">
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Search spaces..."
            debounceMs={300}
          />
        </div>
      )}

      {/* Smart spaces grid */}
      <div className="space-y-xl">
        {filteredSpaces.length > 0 ? (
          <SmartSpaceGrid
            smartSpaces={filteredSpaces}
            onSpaceClick={handleSpaceClick}
            onSpaceEdit={handleSpaceEdit}
            onSpaceDelete={handleSpaceDelete}
          />
        ) : smartSpaces.length === 0 ? (
          <EmptyState
            title="No smart spaces yet"
            description="Smart spaces will automatically organize your content based on rules you define"
            action={
              <Button onClick={handleCreateSpace}>
                Create your first space
              </Button>
            }
          />
        ) : (
          <EmptyState
            title="No spaces match your search"
            description={`No spaces found for "${searchQuery}"`}
          />
        )}
      </div>

      {/* Selected space details */}
      {selectedSpace && (
        <div className="border-t border-border-light dark:border-border-dark pt-xl">
          <div className="space-y-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-sm">
                <span className="text-lg text-text-primary-light dark:text-text-primary-dark">
                  {selectedSpace.icon === 'folder' ? '□' : selectedSpace.icon === 'clock' ? '○' : '◇'}
                </span>
                <h2 className="text-lg font-medium text-text-primary-light dark:text-text-primary-dark">
                  {selectedSpace.name}
                </h2>
                <span className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark font-mono tracking-wide">
                  {selectedSpace.cards_count} CARDS
                </span>
              </div>

              <div className="flex items-center space-x-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => loadSpaceCards(selectedSpace)}
                  loading={cardsLoading}
                >
                  Refresh
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSpaceEdit(selectedSpace)}
                >
                  Edit
                </Button>
              </div>
            </div>

            {selectedSpace.description && (
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                {selectedSpace.description}
              </p>
            )}

            {/* Cards in space */}
            <div>
              {cardsLoading ? (
                <LoadingState message="Loading cards..." />
              ) : spaceCards.length > 0 ? (
                <Grid>
                  {spaceCards.map((card) => (
                    <Card
                      key={card.id}
                      card={card}
                      onPress={() => {
                        // Handle card click - could open card detail or navigate
                        console.log('Card clicked:', card.id);
                      }}
                    />
                  ))}
                </Grid>
              ) : (
                <EmptyState
                  title="No cards in this space yet"
                  description="Cards that match this space's rules will automatically appear here"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Editor modal */}
      <SmartSpaceEditor
        userId={userId}
        smartSpace={editingSpace}
        isOpen={showEditor}
        onClose={handleEditorClose}
        onSave={handleEditorSave}
      />
    </div>
  );
}

interface SmartSpacesOverviewProps {
  userId: string;
  smartSpaces: SmartSpace[];
  onSpaceClick?: (space: SmartSpace) => void;
  className?: string;
}

export function SmartSpacesOverview({
  userId,
  smartSpaces,
  onSpaceClick,
  className = ''
}: SmartSpacesOverviewProps) {
  const [selectedSpace, setSelectedSpace] = useState<SmartSpace | null>(null);
  const [recentCards, setRecentCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSpaceClick = async (space: SmartSpace) => {
    if (onSpaceClick) {
      onSpaceClick(space);
      return;
    }

    setSelectedSpace(space);
    setLoading(true);

    try {
      const cards = await SmartSpacesManager.getSmartSpaceCards(space.id, userId, 6, 0);
      setRecentCards(cards);
    } catch (err) {
      console.error('Failed to load space preview:', err);
      setRecentCards([]);
    } finally {
      setLoading(false);
    }
  };

  const defaultSpaces = smartSpaces.filter(space => space.is_default);
  const customSpaces = smartSpaces.filter(space => !space.is_default);

  return (
    <div className={`space-y-xl ${className}`}>
      {/* Quick access spaces */}
      {defaultSpaces.length > 0 && (
        <div>
          <h2 className="text-sm text-text-tertiary-light dark:text-text-tertiary-dark font-mono tracking-wide uppercase mb-md">
            Quick Access
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-md">
            {defaultSpaces.slice(0, 5).map((space) => (
              <SmartSpaceCard
                key={space.id}
                smartSpace={space}
                onPress={() => handleSpaceClick(space)}
                className="aspect-square"
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent custom spaces */}
      {customSpaces.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-md">
            <h2 className="text-sm text-text-tertiary-light dark:text-text-tertiary-dark font-mono tracking-wide uppercase">
              Recent Spaces
            </h2>
            {customSpaces.length > 6 && (
              <Button variant="ghost" size="sm">
                View all
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
            {customSpaces.slice(0, 6).map((space) => (
              <SmartSpaceCard
                key={space.id}
                smartSpace={space}
                onPress={() => handleSpaceClick(space)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Selected space preview */}
      {selectedSpace && (
        <div className="border-t border-border-light dark:border-border-dark pt-xl">
          <div className="space-y-md">
            <div className="flex items-center space-x-sm">
              <span className="text-lg text-text-primary-light dark:text-text-primary-dark">
                {selectedSpace.icon === 'folder' ? '□' : selectedSpace.icon === 'clock' ? '○' : '◇'}
              </span>
              <h3 className="text-base font-medium text-text-primary-light dark:text-text-primary-dark">
                {selectedSpace.name}
              </h3>
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </div>

            {loading ? (
              <LoadingState message="Loading preview..." />
            ) : recentCards.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-md">
                {recentCards.map((card) => (
                  <Card
                    key={card.id}
                    card={card}
                    onPress={() => console.log('Preview card clicked:', card.id)}
                    compact
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-tertiary-light dark:text-text-tertiary-dark">
                No cards in this space yet
              </p>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {smartSpaces.length === 0 && (
        <EmptyState
          title="No smart spaces yet"
          description="Smart spaces will automatically appear as you add content"
        />
      )}
    </div>
  );
}
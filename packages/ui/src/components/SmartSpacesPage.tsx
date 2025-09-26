import React, { useState, useEffect } from 'react';
import { SmartSpaceGrid } from './SmartSpace';
import { CreateSmartSpaceModal } from './SmartSpaceRuleBuilder';
import { SearchComponent } from './Search';
import { Grid } from './Grid';
import { Card } from './Card';
import { Button } from './Button';
import { LoadingState, EmptyState, Container, PageHeader } from './Layout';
import { SmartSpacesManager, type CreateSmartSpaceOptions, type UpdateSmartSpaceOptions } from '@floe/shared';
import type { SmartSpace, Card as CardType } from '@floe/shared';

interface SmartSpacesPageProps {
  userId: string;
  onCardClick?: (cardId: string) => void;
  className?: string;
}

export function SmartSpacesPage({ userId, onCardClick, className = '' }: SmartSpacesPageProps) {
  const [smartSpaces, setSmartSpaces] = useState<SmartSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpace, setSelectedSpace] = useState<SmartSpace | null>(null);
  const [spaceCards, setSpaceCards] = useState<CardType[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSpace, setEditingSpace] = useState<SmartSpace | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load smart spaces
  useEffect(() => {
    loadSmartSpaces();
  }, [userId]);

  const loadSmartSpaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const spaces = await SmartSpacesManager.getUserSmartSpaces(userId);
      setSmartSpaces(spaces);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load smart spaces';
      setError(errorMessage);
      console.error('Failed to load smart spaces:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load cards for selected space
  const loadSpaceCards = async (space: SmartSpace) => {
    try {
      setLoadingCards(true);
      const cards = await SmartSpacesManager.getSmartSpaceCards(space.id, userId);
      setSpaceCards(cards);
      setSelectedSpace(space);
    } catch (err) {
      console.error('Failed to load space cards:', err);
      setSpaceCards([]);
    } finally {
      setLoadingCards(false);
    }
  };

  // Create smart space
  const handleCreateSpace = async (spaceData: Omit<CreateSmartSpaceOptions, 'userId'>) => {
    try {
      const newSpace = await SmartSpacesManager.createSmartSpace({
        ...spaceData,
        userId
      });
      setSmartSpaces(prev => [newSpace, ...prev]);
      setShowCreateModal(false);
    } catch (err) {
      console.error('Failed to create smart space:', err);
      // TODO: Show error toast
    }
  };

  // Update smart space
  const handleUpdateSpace = async (spaceData: Omit<UpdateSmartSpaceOptions, 'spaceId' | 'userId'>) => {
    if (!editingSpace) return;

    try {
      const updatedSpace = await SmartSpacesManager.updateSmartSpace({
        ...spaceData,
        spaceId: editingSpace.id,
        userId
      });

      setSmartSpaces(prev => prev.map(space =>
        space.id === updatedSpace.id ? updatedSpace : space
      ));

      if (selectedSpace?.id === updatedSpace.id) {
        setSelectedSpace(updatedSpace);
      }

      setEditingSpace(null);
    } catch (err) {
      console.error('Failed to update smart space:', err);
      // TODO: Show error toast
    }
  };

  // Delete smart space
  const handleDeleteSpace = async (space: SmartSpace) => {
    if (!confirm(`Are you sure you want to delete "${space.name}"?`)) return;

    try {
      await SmartSpacesManager.deleteSmartSpace(space.id, userId);
      setSmartSpaces(prev => prev.filter(s => s.id !== space.id));

      if (selectedSpace?.id === space.id) {
        setSelectedSpace(null);
        setSpaceCards([]);
      }
    } catch (err) {
      console.error('Failed to delete smart space:', err);
      // TODO: Show error toast
    }
  };

  // Refresh all smart spaces
  const handleRefreshSpaces = async () => {
    try {
      setRefreshing(true);
      await SmartSpacesManager.refreshUserSmartSpaces(userId);
      await loadSmartSpaces();

      if (selectedSpace) {
        await loadSpaceCards(selectedSpace);
      }
    } catch (err) {
      console.error('Failed to refresh smart spaces:', err);
      // TODO: Show error toast
    } finally {
      setRefreshing(false);
    }
  };

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
    <Container className={className}>
      {/* Main view - showing all spaces */}
      {!selectedSpace && (
        <>
          <PageHeader
            title="Smart Spaces"
            subtitle="AI-powered auto-collections that organize your content"
            action={
              <div className="flex space-x-sm">
                <Button
                  variant="ghost"
                  onClick={handleRefreshSpaces}
                  disabled={refreshing}
                >
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  Create Space
                </Button>
              </div>
            }
          />

          {/* Smart spaces grid */}
          <SmartSpaceGrid
            smartSpaces={smartSpaces}
            onSpaceClick={loadSpaceCards}
            onSpaceEdit={(space) => {
              setEditingSpace(space);
            }}
            onSpaceDelete={handleDeleteSpace}
          />

          {/* Help text */}
          {smartSpaces.length > 0 && (
            <div className="mt-xl pt-xl border-t border-border-light dark:border-border-dark">
              <h3 className="text-sm text-text-primary-light dark:text-text-primary-dark mb-sm">
                How Smart Spaces Work
              </h3>
              <div className="space-y-sm text-xs text-text-secondary-light dark:text-text-secondary-dark">
                <p>
                  • Smart Spaces automatically organize your content based on rules you define
                </p>
                <p>
                  • Cards are automatically added or removed as they match or stop matching the rules
                </p>
                <p>
                  • Use the refresh button to manually re-organize all spaces
                </p>
                <p>
                  • Default spaces are created automatically and cannot be deleted
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Space detail view */}
      {selectedSpace && (
        <>
          <PageHeader
            title={selectedSpace.name}
            subtitle={selectedSpace.description || 'Smart space contents'}
            action={
              <div className="flex space-x-sm">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedSpace(null);
                    setSpaceCards([]);
                  }}
                >
                  Back to Spaces
                </Button>
                {!selectedSpace.is_default && (
                  <Button
                    variant="ghost"
                    onClick={() => setEditingSpace(selectedSpace)}
                  >
                    Edit Rules
                  </Button>
                )}
              </div>
            }
          />

          {/* Space info */}
          <div className="mb-xl">
            <div className="flex items-center space-x-md text-xs text-text-tertiary-light dark:text-text-tertiary-dark font-mono tracking-wide">
              <span>
                {selectedSpace.cards_count} {selectedSpace.cards_count === 1 ? 'CARD' : 'CARDS'}
              </span>
              {selectedSpace.is_default && <span>DEFAULT SPACE</span>}
              {!selectedSpace.is_active && <span>INACTIVE</span>}
            </div>
          </div>

          {/* Cards */}
          {loadingCards ? (
            <LoadingState message="Loading cards..." />
          ) : spaceCards.length > 0 ? (
            <Grid>
              {spaceCards.map(card => (
                <Card
                  key={card.id}
                  card={card}
                  onPress={() => onCardClick?.(card.id)}
                />
              ))}
            </Grid>
          ) : (
            <EmptyState
              title="No cards in this space"
              description="Cards will appear here automatically based on the space rules"
            />
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      <CreateSmartSpaceModal
        isOpen={showCreateModal || !!editingSpace}
        onClose={() => {
          setShowCreateModal(false);
          setEditingSpace(null);
        }}
        onSave={editingSpace ? handleUpdateSpace : handleCreateSpace}
        initialData={editingSpace ? {
          name: editingSpace.name,
          description: editingSpace.description || '',
          icon: editingSpace.icon,
          rules: editingSpace.rules as any
        } : undefined}
      />
    </Container>
  );
}

interface SmartSpacesSidebarProps {
  userId: string;
  selectedSpaceId?: string;
  onSpaceSelect: (spaceId: string) => void;
  className?: string;
}

export function SmartSpacesSidebar({
  userId,
  selectedSpaceId,
  onSpaceSelect,
  className = ''
}: SmartSpacesSidebarProps) {
  const [smartSpaces, setSmartSpaces] = useState<SmartSpace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSmartSpaces();
  }, [userId]);

  const loadSmartSpaces = async () => {
    try {
      const spaces = await SmartSpacesManager.getUserSmartSpaces(userId);
      setSmartSpaces(spaces);
    } catch (err) {
      console.error('Failed to load smart spaces:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIconSymbol = (icon: string) => {
    const iconMap: Record<string, string> = {
      folder: '□',
      clock: '○',
      image: '◇',
      document: '◈',
      note: '◉',
      star: '★',
      briefcase: '◆',
      book: '◎',
      heart: '♡',
      tag: '#'
    };
    return iconMap[icon] || '○';
  };

  if (loading) {
    return (
      <div className={`space-y-sm ${className}`}>
        <div className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark font-mono tracking-wide uppercase">
          Smart Spaces
        </div>
        <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
          Loading...
        </div>
      </div>
    );
  }

  const defaultSpaces = smartSpaces.filter(space => space.is_default);
  const customSpaces = smartSpaces.filter(space => !space.is_default);

  return (
    <div className={`space-y-lg ${className}`}>
      {/* Quick Access (Default Spaces) */}
      {defaultSpaces.length > 0 && (
        <div className="space-y-sm">
          <div className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark font-mono tracking-wide uppercase">
            Quick Access
          </div>
          {defaultSpaces.map(space => (
            <button
              key={space.id}
              onClick={() => onSpaceSelect(space.id)}
              className={`
                w-full text-left p-sm border border-transparent
                hover:bg-hover-light dark:hover:bg-hover-dark
                transition-colors duration-150
                ${selectedSpaceId === space.id ? 'bg-selected-light dark:bg-selected-dark' : ''}
              `}
            >
              <div className="flex items-center space-x-sm">
                <span className="text-text-primary-light dark:text-text-primary-dark">
                  {getIconSymbol(space.icon)}
                </span>
                <span className="text-sm text-text-primary-light dark:text-text-primary-dark flex-1">
                  {space.name}
                </span>
                <span className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark">
                  {space.cards_count}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Custom Spaces */}
      {customSpaces.length > 0 && (
        <div className="space-y-sm">
          <div className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark font-mono tracking-wide uppercase">
            Custom Spaces
          </div>
          {customSpaces.map(space => (
            <button
              key={space.id}
              onClick={() => onSpaceSelect(space.id)}
              className={`
                w-full text-left p-sm border border-transparent
                hover:bg-hover-light dark:hover:bg-hover-dark
                transition-colors duration-150
                ${selectedSpaceId === space.id ? 'bg-selected-light dark:bg-selected-dark' : ''}
              `}
            >
              <div className="flex items-center space-x-sm">
                <span className="text-text-primary-light dark:text-text-primary-dark">
                  {getIconSymbol(space.icon)}
                </span>
                <span className="text-sm text-text-primary-light dark:text-text-primary-dark flex-1">
                  {space.name}
                </span>
                <span className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark">
                  {space.cards_count}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {smartSpaces.length === 0 && (
        <div className="space-y-sm">
          <div className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark font-mono tracking-wide uppercase">
            Smart Spaces
          </div>
          <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
            No spaces yet
          </div>
        </div>
      )}
    </div>
  );
}
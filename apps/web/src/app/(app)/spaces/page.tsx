import React from 'react';
import { SmartSpaceManager } from '@floe/ui';
import { Container } from '@floe/ui';
import { useAuth } from '@floe/ui';

export default function SmartSpacesPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Container className="py-xl">
        <div className="text-center">
          <p className="text-text-secondary-light dark:text-text-secondary-dark">
            Loading...
          </p>
        </div>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="py-xl">
        <div className="text-center">
          <p className="text-text-secondary-light dark:text-text-secondary-dark">
            Please sign in to manage smart spaces.
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-xl">
      <SmartSpaceManager userId={user.id} />
    </Container>
  );
}
'use client';

import { useAuth } from '@floe/ui/auth/AuthContext';

export default function AppPage() {
  const { user, profile, signOut } = useAuth();

  return (
    <div className="container-minimal py-xl">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-xl">
          <h1 className="text-2xl font-light text-text-primary-light dark:text-text-primary-dark">
            Welcome to Floe
          </h1>
          <button
            onClick={() => signOut()}
            className="btn-ghost"
          >
            Sign out
          </button>
        </div>

        <div className="space-y-lg">
          <div className="p-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark">
            <h2 className="text-lg font-medium text-text-primary-light dark:text-text-primary-dark mb-sm">
              Your Profile
            </h2>
            <div className="space-y-xs text-text-secondary-light dark:text-text-secondary-dark">
              <p>Name: {profile?.full_name || 'Not set'}</p>
              <p>Email: {user?.email}</p>
              <p>Username: {profile?.username || 'Not set'}</p>
              <p>Storage used: {profile?.storage_used_bytes || 0} bytes</p>
              <p>Subscription: {profile?.subscription_tier || 'free'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            <div className="p-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark">
              <h3 className="text-base font-medium text-text-primary-light dark:text-text-primary-dark mb-sm">
                Quick Capture
              </h3>
              <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm mb-md">
                Add notes, links, or files instantly
              </p>
              <button className="btn-primary w-full">
                Add Content
              </button>
            </div>

            <div className="p-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark">
              <h3 className="text-base font-medium text-text-primary-light dark:text-text-primary-dark mb-sm">
                Search
              </h3>
              <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm mb-md">
                Find anything in your knowledge base
              </p>
              <input
                type="text"
                placeholder="Search your content..."
                className="input-minimal w-full"
              />
            </div>

            <div className="p-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark">
              <h3 className="text-base font-medium text-text-primary-light dark:text-text-primary-dark mb-sm">
                Smart Spaces
              </h3>
              <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm mb-md">
                AI-organized collections
              </p>
              <button className="btn-secondary w-full">
                View All
              </button>
            </div>
          </div>

          <div className="text-center py-xxxl">
            <p className="text-text-tertiary-light dark:text-text-tertiary-dark text-sm">
              Your knowledge management system is ready. Start by adding your first piece of content.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
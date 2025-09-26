export default function HomePage() {
  return (
    <main className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="container-minimal py-xxxl">
        <div className="max-w-2xl">
          <h1 className="text-display mb-xl">
            Floe
          </h1>
          <p className="text-body mb-xl opacity-70">
            Privacy-focused personal knowledge management system with AI-powered
            auto-organization. Save, organize, and discover your content without
            manual tagging or folders.
          </p>
          <div className="space-y-sm">
            <button className="btn-primary">
              Get Started
            </button>
            <button className="btn-ghost ml-md">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
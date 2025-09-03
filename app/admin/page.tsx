'use client';

import { useState } from 'react';
import BackgroundProvider from '@/components/ui/BackgroundProvider';
import Navigation from '@/components/ui/Navigation';
import { Quote, Background } from '@/lib/types/database';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'quotes' | 'backgrounds' | 'settings'>('quotes');
  const [quotes, setQuotes] = useState<Quote[]>([
    {
      id: '1',
      text: 'The secret to getting ahead is getting started.',
      author: 'Mark Twain',
      category: 'motivation',
      active: true,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      text: 'Focus is a matter of deciding what things you're not going to do.',
      author: 'John Carmack',
      category: 'focus',
      active: true,
      created_at: new Date().toISOString()
    }
  ]);
  
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [newQuote, setNewQuote] = useState({ text: '', author: '', category: 'motivation' });
  const [newBgUrl, setNewBgUrl] = useState('');
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showBgForm, setShowBgForm] = useState(false);

  const addQuote = () => {
    if (!newQuote.text) return;

    const quote: Quote = {
      id: Date.now().toString(),
      text: newQuote.text,
      author: newQuote.author,
      category: newQuote.category,
      active: true,
      created_at: new Date().toISOString()
    };

    setQuotes([...quotes, quote]);
    setNewQuote({ text: '', author: '', category: 'motivation' });
    setShowQuoteForm(false);
  };

  const toggleQuoteStatus = (id: string) => {
    setQuotes(quotes.map(q => 
      q.id === id ? { ...q, active: !q.active } : q
    ));
  };

  const deleteQuote = (id: string) => {
    setQuotes(quotes.filter(q => q.id !== id));
  };

  const addBackground = () => {
    if (!newBgUrl) return;

    const bg: Background = {
      id: Date.now().toString(),
      url: newBgUrl,
      title: `Background ${backgrounds.length + 1}`,
      active: true,
      created_at: new Date().toISOString()
    };

    setBackgrounds([...backgrounds, bg]);
    setNewBgUrl('');
    setShowBgForm(false);
  };

  const toggleBgStatus = (id: string) => {
    setBackgrounds(backgrounds.map(b => 
      b.id === id ? { ...b, active: !b.active } : b
    ));
  };

  const deleteBg = (id: string) => {
    setBackgrounds(backgrounds.filter(b => b.id !== id));
  };

  return (
    <BackgroundProvider>
      <div className="min-h-screen p-4">
        <Navigation />
        
        <div className="container max-w-6xl mx-auto">
          <div className="glass-card mb-6">
            <h2 className="mb-2">Admin Panel</h2>
            <p className="text-secondary">Manage content and application settings</p>
          </div>

          <div className="glass-card">
            <div className="flex gap-4 mb-6 border-b border-glass-border pb-4">
              <button
                onClick={() => setActiveTab('quotes')}
                className={`glass-button ${activeTab === 'quotes' ? 'bg-primary text-white' : ''}`}
              >
                Quotes
              </button>
              <button
                onClick={() => setActiveTab('backgrounds')}
                className={`glass-button ${activeTab === 'backgrounds' ? 'bg-primary text-white' : ''}`}
              >
                Backgrounds
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`glass-button ${activeTab === 'settings' ? 'bg-primary text-white' : ''}`}
              >
                Settings
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'quotes' && (
                <motion.div
                  key="quotes"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="flex-between mb-4">
                    <h3>Inspirational Quotes</h3>
                    <button 
                      onClick={() => setShowQuoteForm(!showQuoteForm)}
                      className="btn-primary"
                    >
                      + Add Quote
                    </button>
                  </div>

                  {showQuoteForm && (
                    <div className="glass p-4 mb-6">
                      <textarea
                        placeholder="Enter quote text..."
                        className="glass-input w-full mb-3"
                        rows={3}
                        value={newQuote.text}
                        onChange={(e) => setNewQuote({ ...newQuote, text: e.target.value })}
                      />
                      <div className="flex gap-3 mb-3 mobile-flex-col">
                        <input
                          type="text"
                          placeholder="Author (optional)"
                          className="glass-input flex-1"
                          value={newQuote.author}
                          onChange={(e) => setNewQuote({ ...newQuote, author: e.target.value })}
                        />
                        <select
                          className="glass-input flex-1"
                          value={newQuote.category}
                          onChange={(e) => setNewQuote({ ...newQuote, category: e.target.value })}
                        >
                          <option value="motivation">Motivation</option>
                          <option value="focus">Focus</option>
                          <option value="productivity">Productivity</option>
                          <option value="creativity">Creativity</option>
                        </select>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={addQuote} className="btn-primary flex-1">
                          Add Quote
                        </button>
                        <button 
                          onClick={() => setShowQuoteForm(false)}
                          className="glass-button flex-1"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {quotes.map(quote => (
                      <div key={quote.id} className="glass p-4">
                        <div className="flex-between mb-2">
                          <p className="flex-1">{quote.text}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleQuoteStatus(quote.id)}
                              className={`glass-button text-sm ${
                                quote.active ? 'text-success' : 'text-error'
                              }`}
                            >
                              {quote.active ? 'Active' : 'Inactive'}
                            </button>
                            <button
                              onClick={() => deleteQuote(quote.id)}
                              className="glass-button text-error text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        {quote.author && (
                          <p className="text-sm text-secondary">— {quote.author}</p>
                        )}
                        <p className="text-xs text-tertiary mt-2">
                          Category: {quote.category}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'backgrounds' && (
                <motion.div
                  key="backgrounds"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="flex-between mb-4">
                    <h3>Background Images</h3>
                    <button 
                      onClick={() => setShowBgForm(!showBgForm)}
                      className="btn-primary"
                    >
                      + Add Background
                    </button>
                  </div>

                  {showBgForm && (
                    <div className="glass p-4 mb-6">
                      <input
                        type="text"
                        placeholder="Enter image URL..."
                        className="glass-input w-full mb-3"
                        value={newBgUrl}
                        onChange={(e) => setNewBgUrl(e.target.value)}
                      />
                      <p className="text-xs text-tertiary mb-3">
                        Note: Use UploadThing integration for file uploads in production
                      </p>
                      <div className="flex gap-3">
                        <button onClick={addBackground} className="btn-primary flex-1">
                          Add Background
                        </button>
                        <button 
                          onClick={() => setShowBgForm(false)}
                          className="glass-button flex-1"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                    {backgrounds.map(bg => (
                      <div key={bg.id} className="glass p-3">
                        <div 
                          className="w-full h-32 mb-3 rounded bg-cover bg-center"
                          style={{ backgroundImage: `url(${bg.url})` }}
                        />
                        <p className="text-sm font-medium mb-2">{bg.title}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleBgStatus(bg.id)}
                            className={`glass-button text-sm flex-1 ${
                              bg.active ? 'text-success' : 'text-error'
                            }`}
                          >
                            {bg.active ? 'Active' : 'Inactive'}
                          </button>
                          <button
                            onClick={() => deleteBg(bg.id)}
                            className="glass-button text-error text-sm flex-1"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {backgrounds.length === 0 && (
                      <div className="col-span-full text-center py-8">
                        <p className="text-secondary">No custom backgrounds added yet</p>
                        <p className="text-sm text-tertiary mt-2">
                          Default backgrounds are being used
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <h3 className="mb-6">Application Settings</h3>
                  
                  <div className="space-y-6">
                    <div className="glass p-4">
                      <h4 className="mb-3">Default Session Settings</h4>
                      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                        <div>
                          <label className="text-sm text-secondary">Default Session Type</label>
                          <select className="glass-input w-full mt-1">
                            <option>25/5 - Pomodoro</option>
                            <option>45/15 - Deep Work</option>
                            <option>Custom</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm text-secondary">Daily Session Goal</label>
                          <input type="number" className="glass-input w-full mt-1" defaultValue="4" />
                        </div>
                      </div>
                    </div>

                    <div className="glass p-4">
                      <h4 className="mb-3">Notification Settings</h4>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3">
                          <input type="checkbox" defaultChecked />
                          <span>Enable browser notifications</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" defaultChecked />
                          <span>Play sound on session complete</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" />
                          <span>Show motivational quotes</span>
                        </label>
                      </div>
                    </div>

                    <div className="glass p-4">
                      <h4 className="mb-3">Data Management</h4>
                      <div className="flex gap-3">
                        <button className="glass-button">Export Data</button>
                        <button className="glass-button">Import Data</button>
                        <button className="glass-button text-error">Clear All Data</button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button className="btn-primary">Save Settings</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </BackgroundProvider>
  );
}
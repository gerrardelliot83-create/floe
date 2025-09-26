export const AI_CONFIG = {
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY,
    models: {
      completion: 'claude-3-5-sonnet-20241022',
      haiku: 'claude-3-haiku-20240307',
    },
    limits: {
      maxTokens: 4000,
      temperature: 0.7,
    }
  },
  limits: {
    maxTokens: 4000,
    temperature: 0.7,
    maxContentLength: 100000, // Characters for processing
    cacheExpiryMs: 24 * 60 * 60 * 1000, // 24 hours
  },
  routing: {
    // Simple tasks use Haiku (cost-effective)
    simple: ['tagging', 'sentiment', 'category'],
    // Complex tasks use Sonnet (quality-focused)
    complex: ['summarization', 'entityExtraction', 'contentAnalysis'],
  }
};
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://dharma-pragya.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/read/', '/embed/', '/llms.txt', '/openapi.json'],
        disallow: ['/api/'],
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'anthropic-ai',
          'Google-Extended',
          'Amazonbot',
          'Applebot-Extended',
          'cohere-ai',
          'Omgilibot',
        ],
        allow: ['/', '/read/', '/llms.txt', '/openapi.json'],
        disallow: ['/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

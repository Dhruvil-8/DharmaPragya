import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://dharma-pragya.vercel.app'; // Replace with your actual deployment domain

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/', // Prevent search engines from crawling backend proxy/API routes
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

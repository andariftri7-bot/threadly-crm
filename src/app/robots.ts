import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://threadly.id';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/*', '/superadmin', '/superadmin/*'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site-url';
import { getPublicAnnouncementCards, getPublicGalleryCategories } from '@/lib/site-data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/spiritual-legacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/announcements`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/favours-recieved`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/archives`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/visit`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contacts`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  try {
    // Dynamic pages - Announcements
    const announcements = await getPublicAnnouncementCards();
    const announcementPages = announcements.map((announcement) => ({
      url: `${baseUrl}/announcements/${announcement._id}`,
      lastModified: new Date(announcement.date),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

    // Dynamic pages - Gallery Categories
    const galleryCategories = await getPublicGalleryCategories();
    const galleryPages = galleryCategories.map((category) => ({
      url: `${baseUrl}/gallery/${category._id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }));

    return [...staticPages, ...announcementPages, ...galleryPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static pages if dynamic content fails
    return staticPages;
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

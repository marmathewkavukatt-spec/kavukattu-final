/**
 * Lazy-loaded components for better performance
 * These components are loaded only when needed, reducing initial bundle size
 */

import dynamic from 'next/dynamic';

// Loading placeholder component
const LoadingPlaceholder = ({ height = 'h-96' }: { height?: string }) => (
  <div className={`animate-pulse bg-stone-200 ${height} rounded-lg`} />
);

// Lazy load Gallery Lightbox (heavy component with animations)
export const GalleryLightbox = dynamic(
  () => import('./GalleryLightbox'),
  { 
    loading: () => <LoadingPlaceholder />,
    ssr: false // Don't render on server - client-only component
  }
);

// Lazy load Virtualized Gallery (heavy component with virtual scrolling)
export const VirtualizedGallery = dynamic(
  () => import('./VirtualizedGallery'),
  { 
    loading: () => <LoadingPlaceholder height="h-screen" />,
  }
);

// Lazy load Hero Slider (heavy component with animations and images)
export const HeroSlider = dynamic(
  () => import('./HeroSlider'),
  { 
    loading: () => <LoadingPlaceholder height="h-[500px]" />,
  }
);

// Lazy load Paginated Testimonies (can be below the fold)
export const PaginatedTestimonies = dynamic(
  () => import('./PaginatedTestimonies'),
  { 
    loading: () => <LoadingPlaceholder height="h-64" />,
  }
);

// Lazy load Filtered Announcements (can be below the fold)
export const FilteredAnnouncements = dynamic(
  () => import('./FilteredAnnouncements'),
  { 
    loading: () => <LoadingPlaceholder height="h-96" />,
  }
);

// Lazy load Timeline Section (heavy with animations)
export const TimelineSection = dynamic(
  () => import('./TimelineSection'),
  { 
    loading: () => <LoadingPlaceholder height="h-screen" />,
  }
);

// Lazy load Administrators Section (can be below the fold)
export const AdministratorsSection = dynamic(
  () => import('./AdministratorsSection'),
  { 
    loading: () => <LoadingPlaceholder height="h-screen" />,
  }
);

// Lazy load Gallery Categories Grid (can be below the fold)
export const GalleryCategoriesGrid = dynamic(
  () => import('./GalleryCategoriesGrid'),
  { 
    loading: () => <LoadingPlaceholder height="h-96" />,
  }
);

// Lazy load Spiritual Legacy Content (heavy with animations)
export const SpiritualLegacyContent = dynamic(
  () => import('./SpiritualLegacyContent'),
  { 
    loading: () => <LoadingPlaceholder height="h-screen" />,
  }
);

// Lazy load Home Gallery Section (can be below the fold)
export const HomeGallerySection = dynamic(
  () => import('./HomeGallerySection'),
  { 
    loading: () => <LoadingPlaceholder height="h-96" />,
  }
);

// Lazy load Home Announcements Section (can be below the fold)
export const HomeAnnouncementsSection = dynamic(
  () => import('./HomeAnnouncementsSection'),
  { 
    loading: () => <LoadingPlaceholder height="h-96" />,
  }
);

import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Single shared fetch for CatchGalleryPhoto records.
 * React Query dedupes concurrent callers and caches the result,
 * so multiple components mounting at once only trigger one list call.
 */
export function useCatchGalleryPhotos() {
  return useQuery({
    queryKey: ['catchGalleryPhotos'],
    queryFn: async () => {
      const data = await base44.entities.CatchGalleryPhoto.list();
      return (data || []).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    },
    staleTime: 5 * 60 * 1000,
  });
}
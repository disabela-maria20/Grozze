'use client';

import { grozzeHomeBanners, homeBannersQueryKey } from '@/entities/banner';
import { useAppStore } from '@/shared/store';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useHomeBannersMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (movieIds: string[]) => grozzeHomeBanners.replace(movieIds),
    onSuccess: (banners) => {
      queryClient.setQueryData(homeBannersQueryKey, banners);
      useAppStore.getState().toast('Banner da home salvo.');
    },
  });
}

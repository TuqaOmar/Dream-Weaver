import { useQuery } from '@tanstack/react-query';

export interface AppConfig {
  driveEnabled: boolean;
  maxUploadBytes: number;
}

const FALLBACK: AppConfig = { driveEnabled: false, maxUploadBytes: 4 * 1024 * 1024 };

export function useAppConfig() {
  return useQuery<AppConfig>({
    queryKey: ['app-config'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/config');
        if (!res.ok) return FALLBACK;
        return { ...FALLBACK, ...(await res.json()) };
      } catch {
        return FALLBACK;
      }
    },
    staleTime: 5 * 60_000,
  });
}

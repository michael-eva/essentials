import { useQuery } from '@tanstack/react-query';
import { api } from '@/trpc/react';

export function useUser() {
  return api.user.getUser.useQuery();
}
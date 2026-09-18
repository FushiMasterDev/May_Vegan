import { useQuery } from '@tanstack/react-query';
import { listCategories } from '@/services/categoryApi';

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: () => listCategories() });
}

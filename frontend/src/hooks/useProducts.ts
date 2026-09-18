import { useQuery } from '@tanstack/react-query';
import { listProducts, getProduct, type ListProductParams } from '@/services/productApi';

export function useProducts(params: ListProductParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => listProducts(params),
    placeholderData: (prev) => prev,
  });
}

export function useProduct(idOrSlug: string | number | undefined) {
  return useQuery({
    queryKey: ['product', idOrSlug],
    queryFn: () => getProduct(idOrSlug as string | number),
    enabled: Boolean(idOrSlug),
  });
}

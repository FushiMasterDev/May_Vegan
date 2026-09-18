import { useQuery } from '@tanstack/react-query';
import { listSuppliers } from '@/services/supplierApi';

export function useSuppliers() {
  return useQuery({ queryKey: ['suppliers'], queryFn: listSuppliers });
}

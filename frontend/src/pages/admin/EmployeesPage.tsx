import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Pencil, UserX } from 'lucide-react';
import { listEmployees, createEmployee, updateEmployee, deactivateEmployee, type CreateEmployeePayload, type UpdateEmployeePayload } from '@/services/employeeApi';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/contexts/ToastContext';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table';
import { TableRowSkeleton } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { getApiErrorMessage } from '@/utils/apiError';
import type { Employee, Role } from '@/types';

const ROLE_OPTIONS: Array<{ value: Role; label: string }> = [
  { value: 'ADMIN', label: 'Quản trị viên' },
  { value: 'MANAGER', label: 'Quản lý' },
  { value: 'STAFF', label: 'Nhân viên phục vụ' },
  { value: 'KITCHEN', label: 'Nhân viên bếp' },
];

export default function EmployeesPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { confirm, dialog } = useConfirmDialog();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-employees', debouncedSearch, page],
    queryFn: () => listEmployees({ search: debouncedSearch || undefined, page, limit: 15 }),
    placeholderData: (prev) => prev,
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateEmployee,
    onSuccess: () => {
      toast.success('Đã ngừng hoạt động tài khoản nhân viên');
      queryClient.invalidateQueries({ queryKey: ['admin-employees'] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  async function handleDeactivate(employee: Employee) {
    const ok = await confirm({
      title: 'Ngừng hoạt động nhân viên',
      message: `Tài khoản của "${employee.user.fullName}" sẽ bị khoá và không thể đăng nhập. Tiếp tục?`,
      confirmLabel: 'Ngừng hoạt động',
      danger: true,
    });
    if (ok) deactivateMutation.mutate(employee.id);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-[var(--text-primary)]">Nhân viên</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Quản lý tài khoản và phân quyền nhân viên.</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus size={16} /> Thêm nhân viên
        </Button>
      </div>

      <Input leftIcon={<Search size={16} />} placeholder="Tìm theo tên, email, SĐT..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-72" />

      {isLoading ? (
        <Table>
          <Thead><tr><Th>Mã NV</Th><Th>Họ tên</Th><Th>Chức vụ</Th><Th>Vai trò</Th><Th>Trạng thái</Th><Th></Th></tr></Thead>
          <Tbody>{Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} columns={6} />)}</Tbody>
        </Table>
      ) : !data || data.data.length === 0 ? (
        <EmptyState title="Chưa có nhân viên" description="Thêm nhân viên đầu tiên vào hệ thống." />
      ) : (
        <>
          <Table>
            <Thead><tr><Th>Mã NV</Th><Th>Họ tên</Th><Th>Chức vụ</Th><Th>Vai trò</Th><Th>Trạng thái</Th><Th></Th></tr></Thead>
            <Tbody>
              {data.data.map((emp) => (
                <Tr key={emp.id}>
                  <Td className="text-xs text-[var(--text-muted)]">{emp.employeeCode}</Td>
                  <Td className="font-medium text-[var(--text-primary)]">{emp.user.fullName}<br /><span className="text-xs font-normal text-[var(--text-muted)]">{emp.user.email}</span></Td>
                  <Td>{emp.position}</Td>
                  <Td><Badge color="blue">{ROLE_OPTIONS.find((r) => r.value === emp.user.role.name)?.label}</Badge></Td>
                  <Td><Badge color={emp.status === 'ACTIVE' ? 'green' : 'gray'}>{emp.status === 'ACTIVE' ? 'Đang làm việc' : 'Ngừng hoạt động'}</Badge></Td>
                  <Td>
                    <div className="flex items-center gap-3">
                      <button onClick={() => { setEditing(emp); setFormOpen(true); }} className="text-brand-600 hover:text-brand-800" aria-label="Sửa">
                        <Pencil size={16} />
                      </button>
                      {emp.status === 'ACTIVE' && (
                        <button onClick={() => handleDeactivate(emp)} className="text-[var(--text-muted)] hover:text-red-600" aria-label="Ngừng hoạt động">
                          <UserX size={16} />
                        </button>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          <Pagination meta={data.meta} onPageChange={setPage} />
        </>
      )}

      <EmployeeFormModal
        open={formOpen}
        employee={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false);
          queryClient.invalidateQueries({ queryKey: ['admin-employees'] });
        }}
      />

      {dialog}
    </div>
  );
}

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  position: string;
  roleName: Role;
  status: 'ACTIVE' | 'INACTIVE';
}

function emptyForm(): FormState {
  return { fullName: '', email: '', phone: '', password: '', position: '', roleName: 'STAFF', status: 'ACTIVE' };
}

function EmployeeFormModal({
  open,
  employee,
  onClose,
  onSaved,
}: {
  open: boolean;
  employee: Employee | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [form, setForm] = useState<FormState>(emptyForm());
  const lastId = useRef<number | null | undefined>(undefined);

  useEffect(() => {
    const currentId = employee?.id ?? null;
    if (open && lastId.current !== currentId) {
      lastId.current = currentId;
      setForm(
        employee
          ? {
              fullName: employee.user.fullName,
              email: employee.user.email,
              phone: employee.user.phone ?? '',
              password: '',
              position: employee.position,
              roleName: employee.user.role.name,
              status: employee.status,
            }
          : emptyForm()
      );
    }
  }, [open, employee]);

  const mutation = useMutation({
    mutationFn: () => {
      if (employee) {
        const payload: UpdateEmployeePayload = {
          fullName: form.fullName,
          phone: form.phone,
          position: form.position,
          roleName: form.roleName,
          status: form.status,
        };
        return updateEmployee(employee.id, payload);
      }
      const payload: CreateEmployeePayload = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        position: form.position,
        roleName: form.roleName,
      };
      return createEmployee(payload);
    },
    onSuccess: () => {
      toast.success(employee ? 'Đã cập nhật nhân viên' : 'Đã thêm nhân viên mới');
      onSaved();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={employee ? `Sửa "${employee.user.fullName}"` : 'Thêm nhân viên mới'}
      footer={
        <Button fullWidth onClick={() => mutation.mutate()} isLoading={mutation.isPending}>
          Lưu
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Họ tên" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={Boolean(employee)} />
        <Input label="Số điện thoại" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        {!employee && (
          <Input label="Mật khẩu" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} hint="Tối thiểu 8 ký tự" />
        )}
        <Input label="Chức vụ" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
        <Select label="Vai trò" options={ROLE_OPTIONS} value={form.roleName} onChange={(e) => setForm({ ...form, roleName: e.target.value as Role })} />
        {employee && (
          <Select
            label="Trạng thái"
            options={[{ value: 'ACTIVE', label: 'Đang làm việc' }, { value: 'INACTIVE', label: 'Ngừng hoạt động' }]}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
          />
        )}
      </div>
    </Modal>
  );
}

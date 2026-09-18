import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, ClipboardList, CalendarDays, KeyRound, Award } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { updateProfile, changePassword } from '@/services/authApi';
import { myOrders } from '@/services/orderApi';
import { myReservations } from '@/services/reservationApi';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageLoading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format';
import { getApiErrorMessage } from '@/utils/apiError';
import { isValidPhone } from '@/utils/validation';
import { ORDER_STATUS_META, RESERVATION_STATUS_META } from '@/utils/statusMeta';

const TABS = [
  { key: 'info', label: 'Thông tin', icon: User },
  { key: 'orders', label: 'Đơn hàng', icon: ClipboardList },
  { key: 'reservations', label: 'Đặt bàn', icon: CalendarDays },
  { key: 'password', label: 'Đổi mật khẩu', icon: KeyRound },
];

export default function ProfilePage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') ?? 'info';

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-display text-4xl text-[var(--text-primary)]">Hồ sơ của tôi</h1>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setParams({ tab: t.key })}
              className={clsx(
                'flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition',
                tab === t.key ? 'bg-brand-600 text-white' : 'text-[var(--text-muted)] hover:bg-[var(--bg-accent-soft)]'
              )}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </nav>

        <div>
          {tab === 'info' && <InfoTab />}
          {tab === 'orders' && <OrdersTab />}
          {tab === 'reservations' && <ReservationsTab />}
          {tab === 'password' && <PasswordTab />}
        </div>
      </div>
    </div>
  );
}

function InfoTab() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [address, setAddress] = useState(user?.customer?.address ?? '');
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  if (!user) return null;

  async function handleSave() {
    const next: typeof errors = {};
    if (!fullName.trim()) next.fullName = 'Vui lòng nhập họ tên';
    if (!isValidPhone(phone)) next.phone = 'Số điện thoại không hợp lệ';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setIsLoading(true);
    try {
      await updateProfile({ fullName, phone, address });
      await refreshUser();
      toast.success('Đã cập nhật thông tin');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {user.customer && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 text-center">
            <p className="font-display text-2xl text-brand-800">{user.customer.totalOrders}</p>
            <p className="text-xs text-[var(--text-muted)]">Đơn hàng</p>
          </div>
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 text-center">
            <p className="font-display text-2xl text-brand-800">{formatCurrency(user.customer.totalSpent)}</p>
            <p className="text-xs text-[var(--text-muted)]">Đã chi tiêu</p>
          </div>
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 text-center">
            <p className="flex items-center justify-center gap-1 font-display text-2xl text-brand-800">
              <Award size={18} className="text-accent-500" /> {user.customer.loyaltyPoints}
            </p>
            <p className="text-xs text-[var(--text-muted)]">Điểm tích luỹ</p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
        <h2 className="font-display text-lg text-[var(--text-primary)]">Thông tin cá nhân</h2>
        <div className="mt-4 flex flex-col gap-4">
          <Input label="Email" value={user.email} disabled />
          <Input label="Họ tên" value={fullName} onChange={(e) => setFullName(e.target.value)} error={errors.fullName} />
          <Input label="Số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} />
          {user.customer && <Input label="Địa chỉ" value={address} onChange={(e) => setAddress(e.target.value)} />}
          <Button onClick={handleSave} isLoading={isLoading} className="self-start">
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </div>
  );
}

function OrdersTab() {
  const { data: orders, isLoading } = useQuery({ queryKey: ['my-orders'], queryFn: myOrders });

  if (isLoading) return <PageLoading />;
  if (!orders || orders.length === 0) {
    return <EmptyState title="Chưa có đơn hàng" description="Các đơn hàng bạn đặt sẽ hiển thị tại đây." />;
  }

  return (
    <div className="flex flex-col gap-3">
      {orders.map((order) => (
        <Link
          key={order.id}
          to={`/track-order/${order.orderCode}`}
          className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 transition hover:border-brand-300"
        >
          <div>
            <p className="font-medium text-[var(--text-primary)]">{order.orderCode}</p>
            <p className="text-xs text-[var(--text-muted)]">{formatDateTime(order.createdAt)} · {order.items.length} món</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-display text-brand-800">{formatCurrency(order.totalAmount)}</span>
            <Badge color={ORDER_STATUS_META[order.status].color}>{ORDER_STATUS_META[order.status].label}</Badge>
          </div>
        </Link>
      ))}
    </div>
  );
}

function ReservationsTab() {
  const { data: reservations, isLoading } = useQuery({ queryKey: ['my-reservations'], queryFn: myReservations });

  if (isLoading) return <PageLoading />;
  if (!reservations || reservations.length === 0) {
    return <EmptyState title="Chưa có lượt đặt bàn" description="Các lượt đặt bàn của bạn sẽ hiển thị tại đây." />;
  }

  return (
    <div className="flex flex-col gap-3">
      {reservations.map((r) => (
        <div key={r.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
          <div>
            <p className="font-medium text-[var(--text-primary)]">{r.reservationCode}</p>
            <p className="text-xs text-[var(--text-muted)]">
              {formatDate(r.reservationDate)} lúc {r.reservationTime.slice(11, 16)} · {r.partySize} người
              {r.table ? ` · Bàn ${r.table.code}` : ''}
            </p>
          </div>
          <Badge color={RESERVATION_STATUS_META[r.status].color}>{RESERVATION_STATUS_META[r.status].label}</Badge>
        </div>
      ))}
    </div>
  );
}

function PasswordTab() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ currentPassword?: string; newPassword?: string; confirmPassword?: string }>({});

  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      queryClient.invalidateQueries();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Đổi mật khẩu thất bại')),
  });

  function handleSubmit() {
    const next: typeof errors = {};
    if (!currentPassword) next.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    if (newPassword.length < 8) next.newPassword = 'Mật khẩu tối thiểu 8 ký tự';
    if (confirmPassword !== newPassword) next.confirmPassword = 'Mật khẩu xác nhận không khớp';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    mutation.mutate({ currentPassword, newPassword });
  }

  return (
    <div className="max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
      <h2 className="font-display text-lg text-[var(--text-primary)]">Đổi mật khẩu</h2>
      <div className="mt-4 flex flex-col gap-4">
        <Input label="Mật khẩu hiện tại" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} error={errors.currentPassword} />
        <Input label="Mật khẩu mới" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} error={errors.newPassword} />
        <Input label="Xác nhận mật khẩu mới" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} error={errors.confirmPassword} />
        <Button onClick={handleSubmit} isLoading={mutation.isPending} className="self-start">
          Cập nhật mật khẩu
        </Button>
      </div>
    </div>
  );
}

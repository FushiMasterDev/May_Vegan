import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { updateProfile, changePassword } from '@/services/authApi';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getApiErrorMessage } from '@/utils/apiError';
import { isValidPhone } from '@/utils/validation';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [profileErrors, setProfileErrors] = useState<{ fullName?: string; phone?: string }>({});

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<{ currentPassword?: string; newPassword?: string; confirmPassword?: string }>({});

  const profileMutation = useMutation({
    mutationFn: () => updateProfile({ fullName, phone }),
    onSuccess: async () => {
      await refreshUser();
      toast.success('Đã cập nhật thông tin tài khoản');
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const passwordMutation = useMutation({
    mutationFn: () => changePassword({ currentPassword, newPassword }),
    onSuccess: () => {
      toast.success('Đã đổi mật khẩu');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Đổi mật khẩu thất bại')),
  });

  function handleSaveProfile() {
    const next: typeof profileErrors = {};
    if (!fullName.trim()) next.fullName = 'Vui lòng nhập họ tên';
    if (!isValidPhone(phone)) next.phone = 'Số điện thoại không hợp lệ';
    setProfileErrors(next);
    if (Object.keys(next).length === 0) profileMutation.mutate();
  }

  function handleChangePassword() {
    const next: typeof passwordErrors = {};
    if (!currentPassword) next.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    if (newPassword.length < 8) next.newPassword = 'Mật khẩu tối thiểu 8 ký tự';
    if (confirmPassword !== newPassword) next.confirmPassword = 'Mật khẩu xác nhận không khớp';
    setPasswordErrors(next);
    if (Object.keys(next).length === 0) passwordMutation.mutate();
  }

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-[var(--text-primary)]">Cài đặt</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Quản lý thông tin tài khoản quản trị của bạn.</p>
      </div>

      <Card className="p-6">
        <h2 className="font-display text-lg text-[var(--text-primary)]">Thông tin cá nhân</h2>
        <div className="mt-4 flex flex-col gap-4">
          <Input label="Email" value={user?.email ?? ''} disabled />
          <Input label="Họ tên" value={fullName} onChange={(e) => setFullName(e.target.value)} error={profileErrors.fullName} />
          <Input label="Số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} error={profileErrors.phone} />
          <Button onClick={handleSaveProfile} isLoading={profileMutation.isPending} className="self-start">
            Lưu thay đổi
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-lg text-[var(--text-primary)]">Đổi mật khẩu</h2>
        <div className="mt-4 flex flex-col gap-4">
          <Input label="Mật khẩu hiện tại" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} error={passwordErrors.currentPassword} />
          <Input label="Mật khẩu mới" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} error={passwordErrors.newPassword} />
          <Input label="Xác nhận mật khẩu mới" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} error={passwordErrors.confirmPassword} />
          <Button onClick={handleChangePassword} isLoading={passwordMutation.isPending} className="self-start">
            Cập nhật mật khẩu
          </Button>
        </div>
      </Card>
    </div>
  );
}

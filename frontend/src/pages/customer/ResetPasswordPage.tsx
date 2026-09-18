import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '@/services/authApi';
import { useToast } from '@/contexts/ToastContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getApiErrorMessage } from '@/utils/apiError';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const toast = useToast();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (password.length < 8) next.password = 'Mật khẩu tối thiểu 8 ký tự';
    if (confirmPassword !== password) next.confirmPassword = 'Mật khẩu xác nhận không khớp';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setIsLoading(true);
    try {
      await resetPassword({ token, newPassword: password });
      toast.success('Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Token không hợp lệ hoặc đã hết hạn'));
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="font-display text-2xl text-brand-900">Liên kết không hợp lệ</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Vui lòng yêu cầu đặt lại mật khẩu mới.</p>
        <Link to="/forgot-password" className="mt-4 inline-block text-sm font-medium text-brand-700 hover:underline">
          Quên mật khẩu
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-brand-900">Đặt lại mật khẩu</h1>
      <p className="mt-1 text-sm text-[var(--text-muted)]">Nhập mật khẩu mới cho tài khoản của bạn.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input label="Mật khẩu mới" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <Input
          label="Xác nhận mật khẩu"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
        />
        <Button type="submit" size="lg" isLoading={isLoading}>
          Đặt lại mật khẩu
        </Button>
      </form>
    </div>
  );
}

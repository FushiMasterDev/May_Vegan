import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getApiErrorMessage } from '@/utils/apiError';
import { isValidEmail } from '@/utils/validation';

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!isValidEmail(email)) next.email = 'Email không hợp lệ';
    if (!password) next.password = 'Vui lòng nhập mật khẩu';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Đăng nhập thành công');
      const redirectTo = (location.state as { from?: string })?.from ?? '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Đăng nhập thất bại'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-[var(--text-primary)]">Đăng nhập</h1>
      <p className="mt-1 text-sm text-[var(--text-muted)]">Chào mừng bạn quay lại Mây Vegan.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} autoComplete="email" />
        <div>
          <Input
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="current-password"
          />
          <Link to="/forgot-password" className="mt-1.5 inline-block text-xs font-medium text-brand-700 hover:underline">
            Quên mật khẩu?
          </Link>
        </div>
        <Button type="submit" size="lg" isLoading={isLoading}>
          Đăng nhập
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="font-medium text-brand-700 hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}

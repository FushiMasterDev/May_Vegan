import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { forgotPassword } from '@/services/authApi';
import { useToast } from '@/contexts/ToastContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getApiErrorMessage } from '@/utils/apiError';
import { isValidEmail } from '@/utils/validation';

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError('Email không hợp lệ');
      return;
    }
    setIsLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-600">
          <MailCheck size={26} />
        </div>
        <h1 className="font-display text-2xl text-brand-900">Kiểm tra email của bạn</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Nếu <strong>{email}</strong> tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.
        </p>
        <Link to="/login" className="mt-2 text-sm font-medium text-brand-700 hover:underline">
          Quay lại đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-brand-900">Quên mật khẩu</h1>
      <p className="mt-1 text-sm text-[var(--text-muted)]">Nhập email đã đăng ký để nhận hướng dẫn đặt lại mật khẩu.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
        <Button type="submit" size="lg" isLoading={isLoading}>
          Gửi hướng dẫn
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
        <Link to="/login" className="font-medium text-brand-700 hover:underline">
          Quay lại đăng nhập
        </Link>
      </p>
    </div>
  );
}

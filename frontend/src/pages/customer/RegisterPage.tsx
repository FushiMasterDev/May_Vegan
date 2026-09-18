import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getApiErrorMessage } from '@/utils/apiError';
import { isValidEmail, isValidPhone } from '@/utils/validation';

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [isLoading, setIsLoading] = useState(false);

  function updateField<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Partial<FormState> = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2) next.fullName = 'Vui lòng nhập họ tên';
    if (!isValidEmail(form.email)) next.email = 'Email không hợp lệ';
    if (!isValidPhone(form.phone)) next.phone = 'Số điện thoại không hợp lệ';
    if (form.password.length < 8) next.password = 'Mật khẩu tối thiểu 8 ký tự';
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Mật khẩu xác nhận không khớp';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setIsLoading(true);
    try {
      await register({ fullName: form.fullName, email: form.email, phone: form.phone, password: form.password });
      toast.success('Đăng ký thành công! Chào mừng bạn đến với Mây Vegan.');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Đăng ký thất bại'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-[var(--text-primary)]">Tạo tài khoản</h1>
      <p className="mt-1 text-sm text-[var(--text-muted)]">Đăng ký để đặt món nhanh hơn và tích điểm mỗi đơn hàng.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input label="Họ tên" value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} error={errors.fullName} />
        <Input label="Email" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} error={errors.email} />
        <Input label="Số điện thoại" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} error={errors.phone} />
        <Input
          label="Mật khẩu"
          type="password"
          value={form.password}
          onChange={(e) => updateField('password', e.target.value)}
          error={errors.password}
          hint="Tối thiểu 8 ký tự"
        />
        <Input
          label="Xác nhận mật khẩu"
          type="password"
          value={form.confirmPassword}
          onChange={(e) => updateField('confirmPassword', e.target.value)}
          error={errors.confirmPassword}
        />
        <Button type="submit" size="lg" isLoading={isLoading}>
          Đăng ký
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
        Đã có tài khoản?{' '}
        <Link to="/login" className="font-medium text-brand-700 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}

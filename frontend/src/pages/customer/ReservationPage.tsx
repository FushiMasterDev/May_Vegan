import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CalendarCheck, CheckCircle2, XCircle, Users, MapPin, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { getApiErrorMessage } from '@/utils/apiError';
import { isValidPhone } from '@/utils/validation';
import { listAreas } from '@/services/tableApi';
import { checkAvailability, createReservation } from '@/services/reservationApi';
import type { Reservation } from '@/types';

interface FormState {
  guestName: string;
  guestPhone: string;
  partySize: string;
  reservationDate: string;
  reservationTime: string;
  area: string;
  note: string;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function ReservationPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState<FormState>({
    guestName: user?.fullName ?? '',
    guestPhone: user?.phone ?? '',
    partySize: '2',
    reservationDate: today(),
    reservationTime: '18:00',
    area: '',
    note: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [result, setResult] = useState<Reservation | null>(null);

  const { data: areas } = useQuery({ queryKey: ['table-areas'], queryFn: listAreas });

  const canCheckAvailability = Boolean(form.reservationDate && form.reservationTime && Number(form.partySize) > 0);

  const availabilityQuery = useQuery({
    queryKey: ['reservation-availability', form.reservationDate, form.reservationTime, form.partySize, form.area],
    queryFn: () =>
      checkAvailability({
        reservationDate: form.reservationDate,
        reservationTime: form.reservationTime,
        partySize: Number(form.partySize),
        area: form.area || undefined,
      }),
    enabled: canCheckAvailability,
  });

  const reservationMutation = useMutation({
    mutationFn: createReservation,
    onSuccess: (reservation) => {
      setResult(reservation);
      toast.success('Đặt bàn thành công!');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Đặt bàn thất bại. Vui lòng thử lại.')),
  });

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.guestName.trim()) next.guestName = 'Vui lòng nhập họ tên';
    if (!isValidPhone(form.guestPhone)) next.guestPhone = 'Số điện thoại không hợp lệ';
    if (!form.reservationDate) next.reservationDate = 'Vui lòng chọn ngày';
    if (!form.reservationTime) next.reservationTime = 'Vui lòng chọn giờ';
    if (!form.partySize || Number(form.partySize) <= 0) next.partySize = 'Vui lòng nhập số người';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    reservationMutation.mutate({
      guestName: form.guestName,
      guestPhone: form.guestPhone,
      partySize: Number(form.partySize),
      reservationDate: form.reservationDate,
      reservationTime: form.reservationTime,
      area: form.area || undefined,
      note: form.note || undefined,
    });
  }

  if (result) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="font-display text-3xl text-[var(--text-primary)]">Đặt bàn thành công!</h1>
          <p className="text-sm text-[var(--text-muted)]">Vui lòng lưu mã đặt bàn để tiện đối chiếu khi đến quán.</p>
        </div>

        <div className="mt-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
          <p className="text-xs text-[var(--text-muted)]">Mã đặt bàn</p>
          <p className="font-display text-2xl text-[var(--text-primary)]">{result.reservationCode}</p>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-brand-500" />
              <span>
                {new Date(result.reservationDate).toLocaleDateString('vi-VN')} lúc {result.reservationTime.slice(11, 16)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={15} className="text-brand-500" />
              <span>{result.partySize} người</span>
            </div>
            {result.table && (
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-brand-500" />
                <span>Bàn {result.table.code} · {result.table.area}</span>
              </div>
            )}
          </dl>
        </div>

        <Button className="mt-6" fullWidth onClick={() => setResult(null)}>
          Đặt thêm bàn khác
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-14 sm:px-6">
      <div className="mb-8 text-center">
        <CalendarCheck className="mx-auto mb-3 text-brand-600" size={32} />
        <h1 className="font-display text-3xl text-[var(--text-primary)]">Đặt bàn</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Giữ chỗ trước để có bàn ưng ý tại Mây Vegan.</p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Họ tên" value={form.guestName} onChange={(e) => updateField('guestName', e.target.value)} error={errors.guestName} />
          <Input label="Số điện thoại" value={form.guestPhone} onChange={(e) => updateField('guestPhone', e.target.value)} error={errors.guestPhone} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Ngày"
            type="date"
            min={today()}
            value={form.reservationDate}
            onChange={(e) => updateField('reservationDate', e.target.value)}
            error={errors.reservationDate}
          />
          <Input
            label="Giờ"
            type="time"
            value={form.reservationTime}
            onChange={(e) => updateField('reservationTime', e.target.value)}
            error={errors.reservationTime}
          />
          <Input
            label="Số người"
            type="number"
            min={1}
            value={form.partySize}
            onChange={(e) => updateField('partySize', e.target.value)}
            error={errors.partySize}
          />
        </div>
        <Select
          label="Khu vực (không bắt buộc)"
          placeholder="Không chọn — hệ thống tự xếp bàn phù hợp"
          value={form.area}
          onChange={(e) => updateField('area', e.target.value)}
          options={(areas ?? []).map((a) => ({ value: a, label: a }))}
        />
        <Textarea
          label="Ghi chú (không bắt buộc)"
          placeholder="Ví dụ: cần ghế trẻ em, kỷ niệm sinh nhật..."
          value={form.note}
          onChange={(e) => updateField('note', e.target.value)}
          rows={2}
        />

        {canCheckAvailability && (
          <div
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm ${
              availabilityQuery.isLoading
                ? 'bg-[var(--bg-accent-soft)] text-[var(--text-muted)]'
                : availabilityQuery.data?.available
                  ? 'bg-brand-50 text-brand-700'
                  : 'bg-red-50 text-red-600'
            }`}
          >
            {availabilityQuery.isLoading ? (
              'Đang kiểm tra bàn trống...'
            ) : availabilityQuery.data?.available ? (
              <>
                <CheckCircle2 size={16} /> Còn bàn trống cho khung giờ này
              </>
            ) : (
              <>
                <XCircle size={16} /> Hết bàn trống, vui lòng chọn giờ hoặc khu vực khác
              </>
            )}
          </div>
        )}

        <Button
          size="lg"
          onClick={handleSubmit}
          isLoading={reservationMutation.isPending}
          disabled={canCheckAvailability && availabilityQuery.data && !availabilityQuery.data.available}
        >
          Xác nhận đặt bàn
        </Button>
      </div>
    </div>
  );
}

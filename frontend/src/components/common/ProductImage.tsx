import { useState } from 'react';
import { Leaf } from 'lucide-react';
import clsx from 'clsx';

// Ảnh món thật được upload qua trang quản lý món ăn (đã có chức năng upload ở
// backend). Khi chưa có ảnh hoặc ảnh lỗi, hiển thị placeholder có thiết kế
// thay vì icon ảnh vỡ.
export function ProductImage({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div
        className={clsx(
          'flex items-center justify-center bg-gradient-to-br from-brand-100 via-cream-100 to-accent-100',
          className
        )}
      >
        <Leaf className="text-brand-400" size={32} strokeWidth={1.5} />
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setErrored(true)} />;
}

import { useState } from 'react';
import { Leaf } from 'lucide-react';
import clsx from 'clsx';

// Backend serve ảnh tĩnh qua /uploads trên chính domain của nó — trong dev,
// Vite proxy /uploads sang backend nên đường dẫn tương đối vẫn hoạt động,
// nhưng khi frontend/backend deploy lên 2 domain khác nhau (Vercel/Render),
// đường dẫn tương đối phải được ghép với gốc domain backend.
const assetBaseURL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/api\/?$/, '');

function resolveSrc(src?: string | null): string | null {
  if (!src) return null;
  if (/^https?:\/\//.test(src)) return src;
  return `${assetBaseURL}${src}`;
}

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
  const resolvedSrc = resolveSrc(src);

  if (!resolvedSrc || errored) {
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

  return <img src={resolvedSrc} alt={alt} className={className} loading="lazy" onError={() => setErrored(true)} />;
}

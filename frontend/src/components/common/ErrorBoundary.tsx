import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertOctagon } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// Bắt lỗi render không mong muốn ở bất kỳ đâu trong cây component, tránh màn
// hình trắng — hiển thị một trang lỗi thân thiện thay vì crash im lặng.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Lỗi không mong muốn:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--bg-app)] px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertOctagon size={32} />
          </div>
          <h1 className="font-display text-3xl text-[var(--text-primary)]">Đã có lỗi xảy ra</h1>
          <p className="max-w-md text-sm text-[var(--text-muted)]">
            Rất tiếc, đã có lỗi ngoài ý muốn xảy ra. Vui lòng tải lại trang, nếu vẫn tiếp diễn hãy liên hệ với chúng
            tôi.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            Tải lại trang
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

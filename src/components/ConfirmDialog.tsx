import { Button } from './ui/Button';

interface Props {
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  body,
  confirmLabel = 'Yes',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/30 px-6 animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-xs rounded-3xl border border-line bg-card p-6 text-center animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-serif text-xl font-semibold text-espresso">{title}</h2>
        {body && <p className="mt-2 text-sm text-taupe">{body}</p>}
        <div className="mt-6 flex flex-col gap-2">
          <Button onClick={onConfirm}>{confirmLabel}</Button>
          <Button variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

import { Modal } from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  loading?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  loading = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="text-sm text-gray-600 mb-5">{message}</p>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          {loading ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

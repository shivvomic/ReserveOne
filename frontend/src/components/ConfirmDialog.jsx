import { AnimatePresence, motion } from 'framer-motion';
import Button from './Button';

function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', onConfirm, onCancel, loading }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="w-full max-w-sm rounded-modal border border-border bg-surface p-6 shadow-2xl"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            {description && <p className="mt-2 text-sm text-muted">{description}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={onCancel}>
                Go back
              </Button>
              <Button variant="danger" onClick={onConfirm} loading={loading}>
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ConfirmDialog;
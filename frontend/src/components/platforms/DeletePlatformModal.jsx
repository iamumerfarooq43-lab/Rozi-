import { AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

export default function DeletePlatformModal({ open, onClose, onConfirm, platform, isDeleting }) {
  if (!platform) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6">
        <DialogHeader className="space-y-3 text-center sm:text-left">
          <div className="mx-auto sm:mx-0 w-12 h-12 rounded-2xl bg-red-500/10 dark:bg-red-500/20 border border-red-500/20 text-red-500 flex items-center justify-center shadow-inner">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-white">
              Delete Platform
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Are you sure you want to remove <span className="font-semibold text-zinc-900 dark:text-white">{platform.name}</span>?
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="my-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/50 flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-300">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
            style={{ backgroundColor: platform.color || '#6366f1' }}
          />
          <p className="line-clamp-2">
            This will remove this platform profile. Existing historical trip data using this platform will be preserved.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium shadow-md shadow-red-500/20 transition-all flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Platform'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

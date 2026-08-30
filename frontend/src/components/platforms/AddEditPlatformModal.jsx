import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPlatform, updatePlatform } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Sparkles, Check, Car, Bike, Layers, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(1, 'Platform name is required'),
  type: z.enum(['ride', 'delivery', 'both'], { required_error: 'Type is required' }),
  color: z.string().default('#6366f1'),
})

const POPULAR_PRESETS = [
  { name: 'InDrive', type: 'both', color: '#22c55e' },
  { name: 'Careem', type: 'both', color: '#10b981' },
  { name: 'Bykea', type: 'both', color: '#eab308' },
  { name: 'Yango', type: 'ride', color: '#f97316' },
  { name: 'Foodpanda', type: 'delivery', color: '#ec4899' },
  { name: 'Uber', type: 'ride', color: '#3b82f6' },
]

const COLOR_SWATCHES = [
  '#6366f1', // Indigo
  '#22c55e', // InDrive Green
  '#10b981', // Careem Emerald
  '#f97316', // Yango Orange
  '#eab308', // Bykea Yellow
  '#ec4899', // Foodpanda Pink
  '#3b82f6', // Uber/Blue
  '#8b5cf6', // Violet
  '#ef4444', // Red
  '#06b6d4', // Cyan
]

export default function AddEditPlatformModal({ open, onClose, platform = null }) {
  const queryClient = useQueryClient()
  const isEditing = Boolean(platform)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      type: 'ride',
      color: '#6366f1',
    },
  })

  const selectedColor = watch('color')
  const selectedType = watch('type')

  useEffect(() => {
    if (open) {
      if (platform) {
        reset({
          name: platform.name || '',
          type: platform.type || 'ride',
          color: platform.color || '#6366f1',
        })
      } else {
        reset({
          name: '',
          type: 'ride',
          color: '#6366f1',
        })
      }
    }
  }, [open, platform, reset])

  const mutation = useMutation({
    mutationFn: (data) => {
      if (isEditing) {
        return updatePlatform(platform.id, data)
      }
      return createPlatform(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['platforms'])
      toast.success(isEditing ? 'Platform updated successfully' : 'Platform added successfully')
      reset()
      onClose()
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to save platform')
    },
  })

  const applyPreset = (preset) => {
    setValue('name', preset.name, { shouldValidate: true })
    setValue('type', preset.type, { shouldValidate: true })
    setValue('color', preset.color, { shouldValidate: true })
  }

  const onSubmit = (data) => mutation.mutate(data)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-white">
              {isEditing ? 'Edit Platform' : 'Add New Platform'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-zinc-500 dark:text-zinc-400">
            {isEditing
              ? 'Update the display details and branding color for this platform.'
              : 'Add ride-hailing or delivery apps you drive for to organize your earnings.'}
          </DialogDescription>
        </DialogHeader>

        {/* Quick Presets (Only in Add mode) */}
        {!isEditing && (
          <div className="mt-4 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/50">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Quick Presets</span>
              <span className="text-[10px] text-indigo-500 font-normal">Click to auto-fill</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-sm transition-all active:scale-95"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: preset.color }}
                  />
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
          {/* Platform Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Platform Name
            </Label>
            <Input
              id="name"
              placeholder="e.g. InDrive, Careem, Bykea"
              {...register('name')}
              className="rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Service Type Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Service Category
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'ride', label: 'Ride Hailing', icon: Car },
                { id: 'delivery', label: 'Delivery', icon: Bike },
                { id: 'both', label: 'Ride & Delivery', icon: Layers },
              ].map((item) => {
                const IconComponent = item.icon
                const isSelected = selectedType === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setValue('type', item.id, { shouldValidate: true })}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <IconComponent className="w-5 h-5 mb-1" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
            {errors.type && (
              <p className="text-xs text-red-500 mt-1">{errors.type.message}</p>
            )}
          </div>

          {/* Brand Color Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
              <span>Brand Badge Color</span>
              <span className="text-[11px] text-zinc-400 font-mono">{selectedColor}</span>
            </Label>
            <div className="flex items-center gap-2.5 flex-wrap p-3 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/50">
              {COLOR_SWATCHES.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color, { shouldValidate: true })}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    selectedColor === color
                      ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110 shadow-md'
                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {selectedColor === color && (
                    <Check className="w-4 h-4 text-white drop-shadow-md" />
                  )}
                </button>
              ))}
              <div className="relative ml-auto flex items-center gap-1">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setValue('color', e.target.value)}
                  className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Dialog Actions */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg shadow-indigo-500/25 px-5 flex items-center gap-2"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isEditing ? 'Saving...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Save Changes' : 'Add Platform'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

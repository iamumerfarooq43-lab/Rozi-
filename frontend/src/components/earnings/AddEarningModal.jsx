import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createEarning } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const schema = z.object({
  platform_id: z.string().min(1, 'Please select a platform'),
  date: z.string().min(1, 'Date is required'),
  gross_amount: z.string().min(1, 'Amount is required'),
  ride_count: z.string().optional(),
  hours_worked: z.string().optional(),
  notes: z.string().optional(),
})

export default function AddEarningModal({ open, onClose, platforms }) {
  const queryClient = useQueryClient()

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0], // today
    },
  })

  const mutation = useMutation({
    mutationFn: (data) => createEarning({
      platform_id: Number(data.platform_id),
      date: data.date,
      gross_amount: Number(data.gross_amount),
      ride_count: data.ride_count ? Number(data.ride_count) : 0,
      hours_worked: data.hours_worked ? Number(data.hours_worked) : null,
      notes: data.notes || null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['earnings'])
      reset()
      onClose()
    },
  })

  const onSubmit = (data) => mutation.mutate(data)

  const activePlatforms = platforms.filter(p => p.is_active)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Earning</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">

          {/* Platform */}
          <div className="space-y-1.5">
            <Label>Platform</Label>
            <select
              {...register('platform_id')}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-zinc-900"
            >
              <option value="">Select platform...</option>
              {activePlatforms.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {errors.platform_id && (
              <p className="text-xs text-red-500">{errors.platform_id.message}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" {...register('date')} />
            {errors.date && (
              <p className="text-xs text-red-500">{errors.date.message}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label>Gross Amount (PKR)</Label>
            <Input
              type="number"
              placeholder="e.g. 1500"
              {...register('gross_amount')}
            />
            {errors.gross_amount && (
              <p className="text-xs text-red-500">{errors.gross_amount.message}</p>
            )}
          </div>

          {/* Ride count + Hours — side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Rides / Deliveries</Label>
              <Input
                type="number"
                placeholder="e.g. 8"
                {...register('ride_count')}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Hours Worked</Label>
              <Input
                type="number"
                step="0.5"
                placeholder="e.g. 4.5"
                {...register('hours_worked')}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Input
              placeholder="e.g. Good day on Indrive"
              {...register('notes')}
            />
          </div>

          {/* Error */}
          {mutation.isError && (
            <p className="text-xs text-red-500">
              {mutation.error?.response?.data?.message || 'Something went wrong'}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Log Earning'}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  )
}
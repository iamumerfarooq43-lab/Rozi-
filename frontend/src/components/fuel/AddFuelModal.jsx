import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFuelLog } from '@/services/api'
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
  date: z.string().min(1, 'Date is required'),
  amount: z.string().min(1, 'Amount is required'),
  liters: z.string().optional(),
  notes: z.string().optional(),
})

export default function AddFuelModal({ open, onClose }) {
  const queryClient = useQueryClient()

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
    },
  })

  const mutation = useMutation({
    mutationFn: (data) => createFuelLog({
      date: data.date,
      amount: Number(data.amount),
      liters: data.liters ? Number(data.liters) : null,
      notes: data.notes || null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['fuel-logs'])
      reset()
      onClose()
    },
  })

  const onSubmit = (data) => mutation.mutate(data)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Fuel Expense</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">

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
            <Label>Amount Spent (PKR)</Label>
            <Input
              type="number"
              placeholder="e.g. 500"
              {...register('amount')}
            />
            {errors.amount && (
              <p className="text-xs text-red-500">{errors.amount.message}</p>
            )}
          </div>

          {/* Liters */}
          <div className="space-y-1.5">
            <Label>Liters Filled (optional)</Label>
            <Input
              type="number"
              step="0.1"
              placeholder="e.g. 3.5"
              {...register('liters')}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Input
              placeholder="e.g. Petrol pump near Johar Town"
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
              {mutation.isPending ? 'Saving...' : 'Log Fuel'}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  )
}
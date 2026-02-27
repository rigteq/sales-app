'use client'

import { useActionState, useEffect } from 'react'
import { updatePO } from '@/app/dashboard/actions'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

const initialState: any = {
    error: undefined,
    success: false,
    message: ''
}

interface EditPOFormProps {
    po: {
        id: string
        amount_received: number
        amount_remaining: number
        release_date: string | null
        note: string | null
        leads?: { lead_name: string; phone: string } | null
    }
    onSuccess?: () => void
    onCancel?: () => void
}

export function EditPOForm({ po, onSuccess, onCancel }: EditPOFormProps) {
    const [state, formAction, isPending] = useActionState(updatePO, initialState)
    const { addToast } = useToast()

    useEffect(() => {
        if (state?.success) {
            addToast('PO updated successfully')
            if (onSuccess) onSuccess()
        } else if (state?.error) {
            addToast(state.error, 'error')
        }
    }, [state, addToast, onSuccess])

    // Format date for input[type=date] (YYYY-MM-DD)
    const formatDateForInput = (dateStr: string | null) => {
        if (!dateStr) return ''
        try {
            return new Date(dateStr).toISOString().split('T')[0]
        } catch {
            return ''
        }
    }

    return (
        <form action={formAction} className="space-y-4">
            <input type="hidden" name="poId" value={po.id} />

            {/* Lead Info (Read-only display) */}
            {po.leads && (
                <div className="rounded-md border border-blue-200 bg-blue-50 p-2 dark:border-blue-900 dark:bg-blue-900/30">
                    <div className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                        {po.leads.lead_name}
                    </div>
                    {po.leads.phone && (
                        <div className="text-xs text-blue-700 dark:text-blue-300">{po.leads.phone}</div>
                    )}
                    <div className="mt-1 text-xs text-blue-500 dark:text-blue-400 italic">Lead cannot be changed after PO creation.</div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-500">Amount Received *</label>
                    <input
                        name="amountReceived"
                        type="number"
                        required
                        defaultValue={po.amount_received}
                        step="0.01"
                        placeholder="0.00"
                        className="w-full rounded-md border border-slate-200 bg-white p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 dark:border-slate-800 dark:bg-slate-950"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-500">Amount Remaining</label>
                    <input
                        name="amountRemaining"
                        type="number"
                        defaultValue={po.amount_remaining}
                        step="0.01"
                        placeholder="0.00"
                        className="w-full rounded-md border border-zinc-200 bg-white p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-500">Release Date (Expected)</label>
                <input
                    name="releaseDate"
                    type="date"
                    defaultValue={formatDateForInput(po.release_date)}
                    className="w-full rounded-md border border-zinc-200 bg-white p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950"
                />
            </div>

            <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-500">Note</label>
                <textarea
                    name="note"
                    rows={2}
                    defaultValue={po.note || ''}
                    placeholder="Payment details etc..."
                    className="w-full rounded-md border border-zinc-200 bg-white p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950"
                />
            </div>

            <div className="flex justify-end gap-2 pt-2">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50 dark:bg-amber-500 dark:hover:bg-amber-400"
                >
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />}
                    Update PO
                </button>
            </div>
        </form>
    )
}

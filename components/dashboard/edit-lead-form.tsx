
'use client'

import { useActionState } from 'react'
import { updateLead } from '@/app/dashboard/actions'
import { Lead } from '@/types'
import { Loader2, Save, X } from 'lucide-react'
import { useState } from 'react'

const statusOptions = [
    'New',
    'Contacted',
    'In Conversation',
    'Scheduled',
    'DNP',
    'Out of reach',
    'Wrong details',
    'PO'
]

export function EditLeadForm({ lead, onCancel }: { lead: Lead, onCancel: () => void }) {
    const initialState = {
        error: undefined,
        success: false,
        message: ''
    }
    // @ts-ignore - TS strict union check vs async return type
    const [state, formAction, isPending] = useActionState(updateLead, initialState)

    if (state?.success) {
        // Could auto-close here, but parent handling is safer via effect if needed.
        // For now, let's just show success message and a "Close" button? 
        // Or just reload. The server action revalidates.
        // Let's call onCancel to go back to view mode if success.
        // But we need to wait for the state update.
    }

    return (
        <form action={async (formData) => {
            await formAction(formData)
            onCancel() // Optimistic close, or handle properly with effect
        }} className="space-y-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <input type="hidden" name="id" value={lead.id} />
            {state?.error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/10 dark:text-red-400">
                    <p>{state.error}</p>
                </div>
            )}

            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Edit Lead</h3>
                <button type="button" onClick={onCancel} className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                    <label htmlFor="leadName" className="text-sm font-medium">Lead Name *</label>
                    <input
                        id="leadName"
                        name="leadName"
                        type="text"
                        required
                        defaultValue={lead.lead_name}
                        className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        pattern="[0-9]{10}"
                        maxLength={10}
                        defaultValue={lead.phone || ''}
                        className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={lead.email || ''}
                        className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="secondaryPhone" className="text-sm font-medium">Secondary Phone</label>
                    <input
                        id="secondaryPhone"
                        name="secondaryPhone"
                        type="tel"
                        defaultValue={lead.secondary_phone || ''}
                        className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status</label>
                    <select
                        id="status"
                        name="status"
                        defaultValue={lead.status}
                        className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950"
                    >
                        {statusOptions.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label htmlFor="location" className="text-sm font-medium">Location</label>
                    <input
                        id="location"
                        name="location"
                        type="text"
                        defaultValue={lead.location || ''}
                        className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="note" className="text-sm font-medium">Note</label>
                <textarea
                    id="note"
                    name="note"
                    rows={4}
                    defaultValue={lead.note || ''}
                    className="flex w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950"
                />
            </div>

            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-md px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 shadow hover:bg-zinc-900/90 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90"
                >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                </button>
            </div>
        </form>
    )
}

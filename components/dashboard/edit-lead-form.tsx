'use client'

import { useActionState } from 'react'
import { updateLead } from '@/app/dashboard/actions'
import { Lead } from '@/types'
import { Loader2, Save, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/toast'

const statusOptions = [
    'New',
    'Not Interested',
    'In Conversation',
    'Scheduled',
    'DNP',
    'Out of reach',
    'Wrong details',
    'PO'
]

export function EditLeadForm({ lead, onCancel, assignableUsers = [] }: { lead: Lead, onCancel: () => void, assignableUsers?: { email: string, name: string }[] }) {
    const initialState = {
        error: undefined as string | undefined,
        success: false,
        message: ''
    }
    // @ts-ignore
    const [state, formAction, isPending] = useActionState(updateLead, initialState)
    const { addToast } = useToast()

    // State
    const [selectedStatus, setSelectedStatus] = useState(lead.status)
    const [localScheduleTime, setLocalScheduleTime] = useState(() => {
        if (lead.schedule_time) {
            const date = new Date(lead.schedule_time)
            const pad = (n: number) => n < 10 ? '0' + n : n
            return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
        }
        return ''
    })
    const [utcScheduleTime, setUtcScheduleTime] = useState(lead.schedule_time || '')

    useEffect(() => {
        if (state?.success) {
            addToast('Lead updated successfully')
            onCancel()
        } else if (state?.error) {
            addToast(state.error, 'error')
        }
    }, [state, addToast, onCancel])

    const handleScheduleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const localValue = e.target.value
        setLocalScheduleTime(localValue)

        if (localValue) {
            const isoString = new Date(localValue).toISOString()
            setUtcScheduleTime(isoString)
        } else {
            setUtcScheduleTime('')
        }
    }

    return (
        <form action={formAction} className="space-y-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <input type="hidden" name="id" value={lead.id} />

            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Edit Lead</h3>
                <button type="button" onClick={onCancel} className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Form Fields Grid */}
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
                        value={selectedStatus}
                        onChange={(e) => {
                            setSelectedStatus(e.target.value)
                            if (e.target.value === 'Scheduled' && !localScheduleTime) {
                                const now = new Date()
                                const pad = (n: number) => n < 10 ? '0' + n : n
                                const localIso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
                                setLocalScheduleTime(localIso)
                                setUtcScheduleTime(now.toISOString())
                            }
                        }}
                        className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950"
                    >
                        {statusOptions.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                {assignableUsers.length > 0 && (
                    <div className="space-y-2">
                        <label htmlFor="assignedTo" className="text-sm font-medium">Assigned To</label>
                        <select
                            id="assignedTo"
                            name="assignedTo"
                            defaultValue={lead.assigned_to_email_id || lead.created_by_email_id || ''}
                            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950"
                        >
                            {assignableUsers.map((u) => (
                                <option key={u.email} value={u.email}>
                                    {u.name} ({u.email})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {selectedStatus === 'Scheduled' && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        <label htmlFor="scheduleTimeInput" className="text-sm font-medium">Scheduled Time *</label>
                        <input
                            id="scheduleTimeInput"
                            type="datetime-local"
                            required
                            value={localScheduleTime}
                            onChange={handleScheduleTimeChange}
                            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950"
                        />
                        <input type="hidden" name="scheduleTime" value={utcScheduleTime} />
                    </div>
                )}

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
                    maxLength={100}
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

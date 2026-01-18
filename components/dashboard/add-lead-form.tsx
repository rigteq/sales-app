
'use client'

import { useActionState } from 'react'
import { addLead } from '@/app/dashboard/actions'
import { Loader2, Plus, CheckCircle2, AlertCircle } from 'lucide-react'
import { useEffect, useRef } from 'react'

const initialState = {
    error: undefined as string | undefined, // Explicit type to match potential return
    success: false,
    message: ''
}

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

export function AddLeadForm() {
    const [state, formAction, isPending] = useActionState(addLead, initialState)
    const formRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        if (state?.success) {
            formRef.current?.reset()
        }
    }, [state?.success])

    return (
        <div className="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="border-b border-zinc-200 p-6 dark:border-zinc-800">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    Add New Lead
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Enter the details of the new lead below.
                </p>
            </div>

            <form ref={formRef} action={formAction} className="p-6 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                    {/* Lead Name */}
                    <div className="space-y-2">
                        <label htmlFor="leadName" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            Lead Name *
                        </label>
                        <input
                            id="leadName"
                            name="leadName"
                            type="text"
                            required
                            placeholder="John Doe"
                            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                        />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            Phone Number
                        </label>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            pattern="[0-9]{10}"
                            placeholder="1234567890"
                            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                        />
                        <p className="text-xs text-zinc-500">Must be exactly 10 digits.</p>
                    </div>

                    {/* Secondary Phone */}
                    <div className="space-y-2">
                        <label htmlFor="secondaryPhone" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            Secondary Phone
                        </label>
                        <input
                            id="secondaryPhone"
                            name="secondaryPhone"
                            type="tel"
                            placeholder="Landline or other"
                            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john@example.com"
                            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                        />
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <label htmlFor="location" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            Location
                        </label>
                        <input
                            id="location"
                            name="location"
                            type="text"
                            placeholder="City, Country"
                            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                        />
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <label htmlFor="status" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            Status
                        </label>
                        <div className="relative">
                            <select
                                id="status"
                                name="status"
                                defaultValue="New"
                                className="flex h-10 w-full appearance-none rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:focus-visible:ring-zinc-300"
                            >
                                {statusOptions.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
                                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Note - Full Width */}
                <div className="space-y-2">
                    <label htmlFor="note" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        Note
                    </label>
                    <textarea
                        id="note"
                        name="note"
                        rows={3}
                        placeholder="Add any additional details here..."
                        className="flex w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                    />
                </div>

                {/* Messages */}
                {state?.error && (
                    <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/10 dark:text-red-400">
                        <AlertCircle className="h-4 w-4" />
                        <p>{state.error}</p>
                    </div>
                )}
                {state?.success && (
                    <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-600 dark:bg-green-900/10 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4" />
                        <p>{state.message || 'Lead added successfully'}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 shadow transition-colors hover:bg-zinc-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 dark:focus-visible:ring-zinc-300"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4" />
                                Add Lead
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}

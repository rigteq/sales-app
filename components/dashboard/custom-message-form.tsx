'use client'

import { useState } from 'react'
import { updateCustomMessage } from '@/app/dashboard/actions'
import { Save } from 'lucide-react'

export function CustomMessageForm({ currentMessage }: { currentMessage: string | null }) {
    const [isPending, setIsPending] = useState(false)
    const [message, setMessage] = useState('')

    async function handleSubmit(formData: FormData) {
        setIsPending(true)
        setMessage('')

        const result = await updateCustomMessage(formData)

        if (result.success) {
            setMessage('Custom message updated successfully!')
        } else {
            setMessage(result.error || 'Failed to update custom message.')
        }
        setIsPending(false)
    }

    return (
        <form action={handleSubmit} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
            <div className="space-y-2">
                <label htmlFor="customMessage" className="text-sm font-medium">Custom WhatsApp Message</label>
                <p className="text-xs text-zinc-500">
                    This message will be sent when you click the WhatsApp button on a lead.
                    If left empty, the default message will be used: "Hello [Lead Name], [User Name] here from [Company Name]."
                </p>
                <textarea
                    id="customMessage"
                    name="customMessage"
                    defaultValue={currentMessage || ''}
                    rows={4}
                    className="flex w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-300"
                    placeholder="Enter your custom message here..."
                />
            </div>

            <div className="flex items-center justify-between">
                <div className="text-sm text-zinc-500">
                    Click save to update your changes.
                </div>
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 hover:bg-zinc-900/90 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 dark:focus:ring-zinc-300"
                >
                    {isPending ? 'Saving...' : <><Save className="h-4 w-4" /> Save Changes</>}
                </button>
            </div>
            {message && (
                <div className={`rounded-md p-3 text-sm ${message.includes('success') ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                    {message}
                </div>
            )}
        </form>
    )
}

'use client'

import { useActionState, useEffect, useRef } from 'react'
import { sendBroadcastNotification } from '@/app/dashboard/actions'
import { Loader2, Send, Megaphone } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

const initialState = {
    error: undefined as string | undefined,
    success: false,
    message: undefined as string | undefined
}

export function NotifyForm() {
    const [state, formAction, isPending] = useActionState(sendBroadcastNotification, initialState as any)
    const formRef = useRef<HTMLFormElement>(null)
    const { addToast } = useToast()

    useEffect(() => {
        if (state?.success) {
            addToast(state.message || 'Notification sent successfully')
            formRef.current?.reset()
        } else if (state?.error) {
            addToast(state.error, 'error')
        }
    }, [state, addToast])

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                        <Megaphone className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Broadcast Notification</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Send a priority message to all users and admins.</p>
                    </div>
                </div>

                <form ref={formRef} action={formAction} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            Notification Title
                        </label>
                        <input
                            id="title"
                            name="title"
                            required
                            placeholder="Example: System Maintenance"
                            className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 dark:border-slate-800 dark:bg-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-indigo-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            Priority Message
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            required
                            rows={4}
                            placeholder="Type your message here..."
                            className="flex w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 dark:border-slate-800 dark:bg-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-indigo-500"
                        />
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-700 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Broadcasting...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Send Notification
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <div className="rounded-xl border border-dashed border-slate-200 p-6 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">How it works?</h3>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-disc pl-4 leading-relaxed">
                    <li>This message will appear as a <b>Web Push Notification</b> on all active devices.</li>
                    <li>Online users will see the alert immediately via Realtime subscription.</li>
                    <li>Ensure your message is clear and actionable for the team.</li>
                </ul>
            </div>
        </div>
    )
}

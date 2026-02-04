'use client'

import { Comment } from '@/types'
import { addComment, deleteComment } from '@/app/dashboard/actions'
import { useActionState, useState, useRef, useEffect } from 'react'
import { Loader2, Send, Trash2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

import { Pagination } from '@/components/ui/pagination'

// Helper to strip UTC suffix for display
function formatCommentText(text: string) {
    return text.replace(/\(Scheduled: .*? UTC\)/g, '(Scheduled)')
}

export function LeadComments({ leadId, comments, currentStatus, currentScheduleTime, totalPages }: { leadId: number, comments: Comment[], currentStatus: string, currentScheduleTime?: string | null, totalPages: number }) {
    // ... existing hooks ...
    const initialState = {
        error: undefined,
        success: false,
        message: ''
    }
    // @ts-ignore
    const [state, formAction, isPending] = useActionState(addComment, initialState)
    const formRef = useRef<HTMLFormElement>(null)
    const { addToast } = useToast()

    // State
    const [selectedStatus, setSelectedStatus] = useState(currentStatus)
    const [localScheduleTime, setLocalScheduleTime] = useState(() => {
        if (currentScheduleTime) {
            // currentScheduleTime is UTC ISO string from server
            const date = new Date(currentScheduleTime)
            const pad = (n: number) => n < 10 ? '0' + n : n
            return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
        }
        return ''
    })
    const [utcScheduleTime, setUtcScheduleTime] = useState(currentScheduleTime || '')

    // Reset form on success
    useEffect(() => {
        if (state?.success) {
            addToast('Comment added successfully')
            if (formRef.current) formRef.current.reset()
        } else if (state?.error) {
            addToast(state.error, 'error')
        }
    }, [state, addToast])

    const handleDelete = async (id: number) => {
        if (confirm('Delete this comment?')) {
            const res = await deleteComment(id, leadId)
            if (res?.success) {
                addToast('Comment deleted')
            } else {
                addToast('Failed to delete comment', 'error')
            }
        }
    }

    const statusOptions = [
        'New', 'Not Interested', 'In Conversation', 'Scheduled', 'DNP',
        'Out of reach', 'Wrong details', 'PO'
    ]

    const statusTextMap: Record<string, string> = {
        'New': 'New Lead',
        'Not Interested': 'Client not interested',
        'DNP': 'Called Twice',
        'In Conversation': 'Interested',
        'Scheduled': 'Need to connect on: ',
        'Out of reach': 'Unreachable',
        'Wrong details': 'Incorrect phone number',
        'PO': 'Recieved Payment'
    }

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value
        setSelectedStatus(newStatus)

        // Auto default time for scheduled
        if (newStatus === 'Scheduled' && !localScheduleTime) {
            const now = new Date()
            const pad = (n: number) => n < 10 ? '0' + n : n
            const localIso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
            setLocalScheduleTime(localIso)
            setUtcScheduleTime(now.toISOString())
        }

        const defaultText = statusTextMap[newStatus]
        if (defaultText && formRef.current) {
            const textarea = formRef.current.querySelector('textarea')
            if (textarea) textarea.value = defaultText
        }
    }

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
        <div className="mt-8 space-y-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Comments & Timeline</h2>

            {/* Add Comment Form */}
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                <form ref={formRef} action={formAction} className="flex flex-col gap-4">
                    <input type="hidden" name="leadId" value={leadId} />

                    <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="flex-1">
                            <textarea
                                name="commentText"
                                rows={2}
                                required
                                placeholder="Add a comment or update..."
                                className="w-full rounded-md border border-zinc-200 bg-white p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950"
                            />
                        </div>
                        <div className="flex flex-col gap-2 min-w-[200px]">
                            <select
                                name="status"
                                key={currentStatus}
                                value={selectedStatus}
                                onChange={handleStatusChange}
                                className="w-full rounded-md border border-zinc-200 bg-white p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950"
                            >
                                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>

                            {selectedStatus === 'Scheduled' && (
                                <div className="animate-in fade-in slide-in-from-top-2 space-y-1">
                                    <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Scheduled Time</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={localScheduleTime}
                                        onChange={handleScheduleTimeChange}
                                        className="w-full rounded-md border border-zinc-200 bg-white p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950"
                                    />
                                    <input type="hidden" name="scheduleTime" value={utcScheduleTime} />
                                    <input type="hidden" name="localScheduleTimeText" value={localScheduleTime ? new Date(localScheduleTime).toLocaleString() : ''} />
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isPending}
                                className="inline-flex items-center justify-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 shadow hover:bg-zinc-900/90 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90"
                            >
                                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                Post
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">No comments yet.</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 rounded-lg bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-zinc-900 dark:text-zinc-50">{comment.created_by_email_id}</span>
                                        <span className="text-xs text-zinc-500">{new Date(comment.created_time).toLocaleString()}</span>
                                    </div>
                                    {comment.status && (
                                        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                                            Changed status to: {comment.status}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-zinc-600 dark:text-zinc-300">{formatCommentText(comment.comment_text)}</p>
                            </div>
                            <div>
                                <button
                                    onClick={() => handleDelete(comment.id)}
                                    className="rounded-md p-2 text-zinc-400 hover:bg-zinc-100 hover:text-red-500 dark:hover:bg-zinc-800"
                                    title="Delete Comment"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
                {totalPages > 1 && (
                    <div className="mt-5 flex w-full justify-center">
                        <Pagination totalPages={totalPages} />
                    </div>
                )}
            </div>
        </div>
    )
}


'use client'

import { Comment } from '@/types'
import { addComment, deleteComment } from '@/app/dashboard/actions'
import { useActionState } from 'react'
import { Loader2, Send, Trash2 } from 'lucide-react'
import { useRef } from 'react'

export function LeadComments({ leadId, comments, currentStatus }: { leadId: number, comments: Comment[], currentStatus: string }) {
    const initialState = {
        error: undefined,
        success: false,
        message: ''
    }
    // @ts-ignore
    const [state, formAction, isPending] = useActionState(addComment, initialState)
    const formRef = useRef<HTMLFormElement>(null)

    // Reset form on success
    if (state?.success && formRef.current) {
        formRef.current.reset()
        // We also need to retain the selected status or allow it to be whatever it just changed to. 
        // Ideally the parent component re-renders and passes the new status, so the defaultValue updates.
        // But standard form reset might clear it. defaultValue only works on initial mount.
        // Let's rely on native behavior or key-change. 
        // Actually, since it's server rendered, the page refreshes and `currentStatus` updates. 
        // But key={currentStatus} on select might force re-render.
    }

    const handleDelete = async (id: number) => {
        if (confirm('Delete this comment?')) {
            await deleteComment(id, leadId)
        }
    }

    const statusOptions = ['New', 'Contacted', 'In Conversation', 'Scheduled', 'DNP', 'DND', 'Not Interested', 'Out of reach', 'Wrong details', 'PO']

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
                        <div className="flex flex-col gap-2 min-w-[150px]">
                            <select
                                name="status"
                                key={currentStatus} // Force re-render when status changes
                                defaultValue={currentStatus}
                                className="w-full rounded-md border border-zinc-200 bg-white p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950"
                            >
                                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
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
                    {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
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
                                <p className="text-sm text-zinc-600 dark:text-zinc-300">{comment.comment_text}</p>
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
            </div>
        </div>
    )
}

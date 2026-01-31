
'use client'

import { deleteComment } from '@/app/dashboard/actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare, Trash2 } from 'lucide-react'

// Helper to strip UTC suffix for display
// Helper to strip UTC suffix for display
function formatCommentText(text: string) {
    return text.replace(/\(Scheduled: .*? UTC\)/g, '(Scheduled)')
}

export function CommentsTable({ comments }: { comments: any[] }) {
    const router = useRouter()

    async function handleDelete(id: number) {
        if (!confirm('Are you sure?')) return
        await deleteComment(id)
        router.refresh()
    }

    if (comments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50 py-16 text-center dark:border-zinc-800 dark:bg-zinc-950/50">
                <p className="text-zinc-500 dark:text-zinc-400">No comments found.</p>
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-zinc-200 bg-zinc-50/50 text-xs font-medium text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
                            <th className="px-6 py-3">Lead</th>
                            <th className="px-6 py-3">Comment</th>
                            <th className="px-6 py-3">Created By</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3 w-[100px]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {comments.map((comment) => (
                            <tr key={comment.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                                    <Link href={`/dashboard/leads/${comment.lead_id}`} className="hover:underline">
                                        {comment.leads?.lead_name || `Lead #${comment.lead_id}`}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 max-w-xs truncate">
                                    {formatCommentText(comment.comment_text)}
                                </td>
                                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 text-xs">
                                    {comment.created_by_email_id}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${comment.status === 'Converted' ? 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/30 dark:text-green-400 dark:ring-green-500/30' :
                                        comment.status === 'Lost' ? 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-500/30' :
                                            comment.status === 'In Progress' ? 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-500/30' :
                                                'bg-zinc-50 text-zinc-700 ring-zinc-600/20 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700/30'
                                        }`}>
                                        {comment.status || 'Note'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-zinc-500 dark:text-zinc-500">
                                    {new Date(comment.created_time).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                        <button
                                            onClick={() => handleDelete(comment.id)}
                                            className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

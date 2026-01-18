'use client'

import { Comment } from '@/types'
import { useRouter } from 'next/navigation'

import { Trash2 } from 'lucide-react'
import { deleteComment } from '@/app/dashboard/actions'

export function CommentsTable({ comments }: { comments: (Comment & { leads: { lead_name: string } })[] }) {
    const router = useRouter()

    return (
        <div className="mt-6 flow-root overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
                <div className="rounded-lg bg-white p-2 md:pt-0 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <table className="min-w-full text-zinc-900 md:table">
                        <thead className="rounded-lg text-left text-sm font-normal">
                            <tr>
                                <th scope="col" className="px-4 py-3 font-medium sm:pl-6 dark:text-zinc-200">
                                    Lead
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium dark:text-zinc-200">
                                    Comment
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium dark:text-zinc-200">
                                    Status
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium dark:text-zinc-200">
                                    Created By
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium dark:text-zinc-200">
                                    Time
                                </th>
                                <th scope="col" className="px-3 py-3 font-medium dark:text-zinc-200">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-zinc-900">
                            {comments?.map((comment) => (
                                <tr
                                    key={comment.id}
                                    onClick={(e) => {
                                        // Prevent navigation if clicking on action buttons (though row click is handled, we might need to stop propagation on buttons)
                                        router.push(`/dashboard/leads/${comment.lead_id}`)
                                    }}
                                    className="w-full border-b border-zinc-100 py-3 text-sm last-of-type:border-none hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50 cursor-pointer active:scale-[0.99] transition-all"
                                >
                                    <td className="whitespace-nowrap py-3 pl-6 pr-3 font-medium text-zinc-900 dark:text-zinc-100">
                                        <div className="flex flex-col">
                                            <span>{comment.leads?.lead_name || `Lead #${comment.lead_id}`}</span>
                                            <span className="text-xs text-zinc-500">ID: {comment.lead_id}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 text-zinc-500 dark:text-zinc-400 max-w-sm truncate">
                                        {comment.comment_text}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {comment.status && (
                                            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                                                {comment.status}
                                            </span>
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3 text-zinc-500 dark:text-zinc-400 text-xs">
                                        {comment.created_by_email_id}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3 text-zinc-500 dark:text-zinc-400 text-xs">
                                        {new Date(comment.created_time).toLocaleString()}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3 text-zinc-500 dark:text-zinc-400">
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation()
                                                if (confirm('Are you sure you want to delete this comment?')) {
                                                    await deleteComment(comment.id)
                                                }
                                            }}
                                            className="p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

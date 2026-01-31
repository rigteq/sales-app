import { getCurrentUserFullDetails, getNotifications } from '@/app/dashboard/actions'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'

export const metadata = {
    title: 'Notifications | Rigteq Sales',
    description: 'View your important messages and updates.',
}

export default async function NotificationsPage() {
    const user = await getCurrentUserFullDetails()

    if (!user) {
        redirect('/dashboard')
    }

    const { notifications, count } = await getNotifications()

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
                    Notifications
                </h1>
                <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
                    Stay updated with important announcements.
                </p>
            </div>

            <div className="space-y-4">
                {notifications.length > 0 ? (
                    notifications.map((notification: any) => (
                        <div key={notification.id} className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                                        {notification.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {format(new Date(notification.created_at), 'PPP p')}
                                    </p>
                                </div>
                                <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/30">
                                    Broadcast
                                </span>
                            </div>
                            <div className="mt-4 prose prose-slate max-w-none text-slate-600 dark:prose-invert dark:text-slate-300">
                                <p>{notification.message}</p>
                            </div>
                            <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs text-slate-400">
                                Posted by: {notification.created_by_email_id}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center dark:border-slate-800 dark:bg-slate-900/50">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                            <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-200">No notifications</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">You're all caught up!</p>
                    </div>
                )}
            </div>
        </div>
    )
}

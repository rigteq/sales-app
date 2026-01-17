
import { getInsights } from '@/app/dashboard/actions'
import { Activity, CheckCircle2, MessageSquare, Users } from 'lucide-react'

// Simple Card Component wrappers if not already existing, or inline them.
// Let's create a reusable InsightsView component.

export async function InsightsView() {
    const stats = await getInsights()

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between space-y-0.5">
                    <h3 className="text-sm font-medium tracking-tight text-zinc-500 dark:text-zinc-400">Total Leads</h3>
                    <Users className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                </div>
                <div className="mt-4">
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stats.totalLeads}</div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Lifetime leads generated
                    </p>
                </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between space-y-0.5">
                    <h3 className="text-sm font-medium tracking-tight text-zinc-500 dark:text-zinc-400">New Today</h3>
                    <Activity className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                </div>
                <div className="mt-4">
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stats.newLeads}</div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Added past 24 hours
                    </p>
                </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between space-y-0.5">
                    <h3 className="text-sm font-medium tracking-tight text-zinc-500 dark:text-zinc-400">In Conversation</h3>
                    <MessageSquare className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                </div>
                <div className="mt-4">
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stats.inConversation}</div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Active discussions
                    </p>
                </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between space-y-0.5">
                    <h3 className="text-sm font-medium tracking-tight text-zinc-500 dark:text-zinc-400">Converted (PO)</h3>
                    <CheckCircle2 className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                </div>
                <div className="mt-4">
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stats.converted}</div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Closed deals
                    </p>
                </div>
            </div>
        </div>
    )
}

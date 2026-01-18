
import { getInsights } from '@/app/dashboard/actions'
import { Activity, CheckCircle2, MessageSquare, Users } from 'lucide-react'

// Simple Card Component wrappers if not already existing, or inline them.
// Let's create a reusable InsightsView component.

export async function InsightsView({ context = 'all_leads' }: { context?: 'all_leads' | 'my_leads' | 'all_comments' | 'my_comments' }) {
    const stats = await getInsights(context)

    const labels = {
        all_leads: ['Total Leads', 'New Today', 'In Conversation', 'Converted (PO)'],
        my_leads: ['My Total Leads', 'Contacted Today', 'In Conversation', 'Converted (30d)'],
        all_comments: ['Total Comments', 'Comments Today', 'Conversations Today', 'POs Today'],
        my_comments: ['My Comments', 'Today', 'In Conversation Today', 'POs (30d)']
    }

    const currentLabels = labels[context]

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:pb-0 scrollbar-hide">
            <div className="min-w-[240px] rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between space-y-0.5">
                    <h3 className="text-sm font-medium tracking-tight text-zinc-500 dark:text-zinc-400">{currentLabels[0]}</h3>
                    <Users className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                </div>
                <div className="mt-4">
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stats.metric1}</div>
                </div>
            </div>

            <div className="min-w-[240px] rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between space-y-0.5">
                    <h3 className="text-sm font-medium tracking-tight text-zinc-500 dark:text-zinc-400">{currentLabels[1]}</h3>
                    <Activity className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                </div>
                <div className="mt-4">
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stats.metric2}</div>
                </div>
            </div>

            <div className="min-w-[240px] rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between space-y-0.5">
                    <h3 className="text-sm font-medium tracking-tight text-zinc-500 dark:text-zinc-400">{currentLabels[2]}</h3>
                    <MessageSquare className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                </div>
                <div className="mt-4">
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stats.metric3}</div>
                </div>
            </div>

            <div className="min-w-[240px] rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between space-y-0.5">
                    <h3 className="text-sm font-medium tracking-tight text-zinc-500 dark:text-zinc-400">{currentLabels[3]}</h3>
                    <CheckCircle2 className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                </div>
                <div className="mt-4">
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stats.metric4}</div>
                </div>
            </div>
        </div>
    )
}

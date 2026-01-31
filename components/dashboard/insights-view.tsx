import Link from 'next/link'
import { getInsights } from '@/app/dashboard/actions'
import { Activity, CheckCircle2, MessageSquare, Users } from 'lucide-react'

export async function InsightsView({ context = 'all_leads' }: { context?: 'all_leads' | 'my_leads' | 'all_comments' | 'my_comments' | 'assigned_leads' }) {
    const stats = await getInsights(context)

    const labels = {
        all_leads: ['Total Leads', 'New Today', 'In Conversation', 'Converted (PO)'],
        my_leads: ['My Total Leads', 'Contacted Today', 'In Conversation', 'Converted (30d)'],
        assigned_leads: ['Assigned Leads', 'New Assigned', 'In Conversation', 'Converted'],
        all_comments: ['Total Comments', 'Comments Today', 'Conversations Today', 'POs Today'],
        my_comments: ['My Comments', 'Today', 'In Conversation Today', 'POs (30d)']
    }

    const currentLabels = labels[context] || labels['all_leads']

    let basePath = '/dashboard/leads'
    if (context === 'my_leads') basePath = '/dashboard/my-leads'
    if (context === 'assigned_leads') basePath = '/dashboard/assigned-leads'
    if (context === 'all_comments' || context === 'my_comments') basePath = '/dashboard/comments'

    const isComments = context.includes('comments')

    const getLink = (index: number) => {
        if (!isComments) {
            if (index === 0) return basePath
            if (index === 1) return `${basePath}?filter=new_today`
            if (index === 2) return `${basePath}?status=In Conversation`
            if (index === 3) return `${basePath}?status=PO`
        } else {
            const cBase = '/dashboard/comments'
            if (index === 0) return cBase
            if (index === 1) return `${cBase}?filter=today`
            if (index === 2) return `${cBase}?status=In Conversation&filter=today`
            if (index === 3) return `${cBase}?status=PO`
        }
        return basePath
    }

    const colorConfig = [
        {
            wrapper: 'border-blue-100 bg-gradient-to-br from-blue-50 via-white to-white dark:from-blue-950/20 dark:to-zinc-900',
            iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
            text: 'text-zinc-600 dark:text-zinc-400'
        },
        {
            wrapper: 'border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white dark:from-emerald-950/20 dark:to-zinc-900',
            iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
            text: 'text-zinc-600 dark:text-zinc-400'
        },
        {
            wrapper: 'border-amber-100 bg-gradient-to-br from-amber-50 via-white to-white dark:from-amber-950/20 dark:to-zinc-900',
            iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
            text: 'text-zinc-600 dark:text-zinc-400'
        },
        {
            wrapper: 'border-violet-100 bg-gradient-to-br from-violet-50 via-white to-white dark:from-violet-950/20 dark:to-zinc-900',
            iconBg: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
            text: 'text-zinc-600 dark:text-zinc-400'
        }
    ]

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:pb-0 scrollbar-hide snap-x pt-2">
            {[0, 1, 2, 3].map((i) => {
                const Icon = [Users, Activity, MessageSquare, CheckCircle2][i]
                const label = currentLabels[i]
                const value = [stats.metric1, stats.metric2, stats.metric3, stats.metric4][i]
                const colors = colorConfig[i]

                return (
                    <Link key={i} href={getLink(i)} className="min-w-[260px] snap-center block transition-transform hover:-translate-y-1">
                        <div className={`h-full rounded-2xl border p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${colors.wrapper} dark:border-zinc-800`}>
                            <div className="flex items-center justify-between relative z-10">
                                <h3 className={`text-sm font-semibold tracking-wide uppercase ${colors.text}`}>{label}</h3>
                                <div className={`p-2 rounded-lg ${colors.iconBg}`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="mt-4 relative z-10">
                                <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{value}</div>
                            </div>
                        </div>
                    </Link>
                )
            })}
        </div>
    )
}

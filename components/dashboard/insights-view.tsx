import Link from 'next/link'
import { getInsights } from '@/app/dashboard/actions'
import { Activity, CheckCircle2, MessageSquare, Users, Building2, Bell, Calendar } from 'lucide-react'

export async function InsightsView({ context = 'all_leads' }: { context?: 'all_leads' | 'my_leads' | 'all_comments' | 'my_comments' | 'assigned_leads' | 'users' | 'companies' | 'scheduled_leads' | 'notifications' }) {
    const stats = await getInsights(context)

    const labels: Record<string, string[]> = {
        all_leads: ['Total Leads', 'New Today', 'In Conversation', 'Converted (PO)'],
        my_leads: ['My Total Leads', 'Contacted Today', 'In Conversation', 'Converted (30d)'],
        assigned_leads: ['Assigned Leads', 'New Assigned', 'In Conversation', 'Converted'],
        all_comments: ['Total Comments', 'Comments Today', 'Conversations Today', 'POs Today'],
        my_comments: ['My Comments', 'Today', 'In Conversation Today', 'POs (30d)'],
        users: ['Total Profiles', 'Admins', 'Users', 'New (30d)'],
        companies: ['Total Companies', 'New (30d)', 'Total Users', 'Total Leads'],
        scheduled_leads: ['Total Scheduled', 'Today', 'Overdue', 'Upcoming'],
        notifications: ['Total Notifs', 'Last 30 Days', 'Last 7 Days', 'Today']
    }

    const currentLabels = labels[context] || labels['all_leads']

    let basePath = '/dashboard/leads'
    if (context === 'my_leads') basePath = '/dashboard/my-leads'
    if (context === 'assigned_leads') basePath = '/dashboard/assigned-leads'
    if (context === 'all_comments') basePath = '/dashboard/comments'
    if (context === 'my_comments') basePath = '/dashboard/my-comments'
    if (context === 'users') basePath = '/dashboard/users'
    if (context === 'companies') basePath = '/dashboard/companies'
    if (context === 'scheduled_leads') basePath = '/dashboard/scheduled-leads'
    if (context === 'notifications') basePath = '/dashboard/notifications'

    const getLink = (index: number) => {
        if (context === 'users') {
            if (index === 1) return `${basePath}?roleFilter=1`
            if (index === 2) return `${basePath}?roleFilter=0`
            if (index === 3) return `${basePath}?filter=new_30d` // Need support in getUsers logic if desired, or just link to list
            return basePath
        }
        if (context === 'scheduled_leads') {
            if (index === 1) return `${basePath}?filter=today`
            if (index === 2) return `${basePath}?filter=overdue`
            if (index === 3) return `${basePath}?filter=upcoming`
            return basePath
        }
        if (context === 'notifications') return basePath
        if (context === 'companies') return basePath

        const isComments = context.includes('comments')
        if (isComments) {
            if (index === 0) return basePath
            if (index === 1) return `${basePath}?filter=today` // Comments Today
            if (index === 2) return `${basePath}?status=In Conversation&filter=today` // Conversations Today
            if (index === 3) return `${basePath}?status=PO&filter=today` // POs Today (or 30d for my_comments as per label?)
            // my_comments[3] says POs (30d). Let's stick to today for consistency or adjust if needed.
            // Let's assume 'today' for simplicity on list page, unless we add 'range' support.
            return basePath
        }

        // Leads (My, All, Assigned)
        if (index === 0) return basePath

        if (context === 'my_leads') {
            if (index === 1) return `${basePath}?status=Contacted` // Contacted Today implies status=Contacted usually
            if (index === 2) return `${basePath}?status=In Conversation`
            if (index === 3) return `${basePath}?status=PO`
            return basePath
        }

        if (context === 'assigned_leads') {
            if (index === 1) return `${basePath}?status=New` // "New Assigned"
            if (index === 2) return `${basePath}?status=In Conversation`
            if (index === 3) return `${basePath}?status=PO`
            return basePath
        }

        // All Leads
        if (index === 1) return `${basePath}?filter=new_today`
        if (index === 2) return `${basePath}?status=In Conversation`
        if (index === 3) return `${basePath}?status=PO`

        return basePath
    }

    const colorConfig = [
        {
            wrapper: 'border-blue-100 bg-gradient-to-br from-blue-50 via-white to-white dark:from-blue-950/20 dark:to-slate-900',
            iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
            text: 'text-slate-600 dark:text-slate-400'
        },
        {
            wrapper: 'border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white dark:from-emerald-950/20 dark:to-slate-900',
            iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
            text: 'text-slate-600 dark:text-slate-400'
        },
        {
            wrapper: 'border-amber-100 bg-gradient-to-br from-amber-50 via-white to-white dark:from-amber-950/20 dark:to-slate-900',
            iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
            text: 'text-slate-600 dark:text-slate-400'
        },
        {
            wrapper: 'border-violet-100 bg-gradient-to-br from-violet-50 via-white to-white dark:from-violet-950/20 dark:to-slate-900',
            iconBg: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
            text: 'text-slate-600 dark:text-slate-400'
        }
    ]

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:pb-0 scrollbar-hide snap-x pt-2">
            {[0, 1, 2, 3].map((i) => {
                let Icon = [Users, Activity, MessageSquare, CheckCircle2][i]
                if (context === 'users') Icon = [Users, Users, Users, Users][i] // Maybe differentiators?
                if (context === 'companies') Icon = [Building2, Building2, Users, Activity][i]
                if (context === 'scheduled_leads') Icon = [Calendar, Calendar, Activity, Calendar][i]
                if (context === 'notifications') Icon = [Bell, Bell, Bell, Bell][i]

                const label = currentLabels[i]
                const value = [stats.metric1, stats.metric2, stats.metric3, stats.metric4][i]
                const colors = colorConfig[i]

                return (
                    <Link key={i} href={getLink(i)} className="min-w-[260px] snap-center block transition-transform hover:-translate-y-1">
                        <div className={`h-full rounded-2xl border p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${colors.wrapper} dark:border-slate-800`}>
                            <div className="flex items-center justify-between relative z-10">
                                <h3 className={`text-sm font-bold tracking-wide uppercase ${colors.text}`}>{label}</h3>
                                <div className={`p-2 rounded-lg ${colors.iconBg}`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="mt-4 relative z-10">
                                <div className="text-3xl font-black text-slate-900 dark:text-slate-50">{value}</div>
                            </div>
                        </div>
                    </Link>
                )
            })}
        </div>
    )
}

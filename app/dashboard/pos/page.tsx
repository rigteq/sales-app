import { getPOs, getPOStats } from '@/app/dashboard/actions'
import { POsTable } from '@/components/dashboard/pos/pos-table'
import { InsightsView } from '@/components/dashboard/insights-view' // Wait, InsightsView is generic. 
// User wants specialized PO insights. 
// "Superadmin Insights (Total POs, Todays POs, POs last 7 days, POs last 30 days)"
// I already implemented existing InsightsView for leads/comments.
// I should create a new `POInsightsView` or adapt `InsightsView`.
// Let's create a new component inline or separate? Separate is better.

import { Briefcase, Calendar, CheckCircle2 } from 'lucide-react'

// --- PO Insights Component ---
async function POInsights() {
    const stats = await getPOStats()

    const cards = [
        { label: 'Total POs', value: stats.total, icon: Briefcase },
        { label: 'POs Today', value: stats.today, icon: CheckCircle2 },
        { label: 'POs Last 7 Days', value: stats.last7, icon: Calendar },
        { label: 'POs Last 30 Days', value: stats.last30, icon: Calendar },
    ]

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 pb-4">
            {cards.map((card, i) => (
                <div key={i} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-center justify-between space-y-0.5">
                        <h3 className="text-sm font-medium tracking-tight text-zinc-500 dark:text-zinc-400">{card.label}</h3>
                        <card.icon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                    </div>
                    <div className="mt-4">
                        <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{card.value}</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default async function POsPage() {
    // Fetch Data
    const { pos, count } = await getPOs() // Defaults to page 1. Pagination needed in Table? 
    // For now simple list.

    return (
        <div className="w-full space-y-8">
            <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Purchase Orders (POs)</h1>
            </div>

            <POInsights />

            <POsTable pos={pos} />
        </div>
    )
}

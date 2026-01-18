
import { InsightsView } from '@/components/dashboard/insights-view'
import { InsightsCharts } from '@/components/dashboard/insights-charts'

export default function InsightsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Analytics & Insights</h1>
                <p className="text-zinc-500 dark:text-zinc-400">Overview of your sales pipeline and activity.</p>
            </div>

            <InsightsView />

            <InsightsCharts />
        </div>
    )
}

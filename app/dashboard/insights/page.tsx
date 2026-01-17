
import { InsightsView } from '@/components/dashboard/insights-view'

export default function InsightsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Analytics & Insights</h1>
                <p className="text-zinc-500 dark:text-zinc-400">Overview of your sales pipeline and activity.</p>
            </div>

            <InsightsView />

            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500 dark:text-zinc-400">
                    <p className="text-lg font-medium">Coming Soon</p>
                    <p className="text-sm">Deep dive charts and granular reports are under development.</p>
                </div>
            </div>
        </div>
    )
}

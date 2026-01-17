
import { AddLeadForm } from '@/components/dashboard/add-lead-form'
import { InsightsView } from '@/components/dashboard/insights-view'

export default function Dashboard() {
    return (
        <div className="flex flex-col items-center justify-start space-y-8">
            <div className="w-full text-left">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Dashboard
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                    Manage your sales pipeline and leads effectively.
                </p>
            </div>

            <div className="w-full">
                <InsightsView />
            </div>

            <div className="w-full flex justify-center">
                <AddLeadForm />
            </div>
        </div>
    )
}

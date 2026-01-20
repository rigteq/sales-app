
import { AddLeadForm } from '@/components/dashboard/add-lead-form'
import { AddUserForm } from '@/components/dashboard/add-user-form'
import { AddCompanyForm } from '@/components/dashboard/add-company-form'
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

            <div className="w-full flex flex-col items-center gap-8">
                <AddLeadForm />

                {/* Add User Form - Only visible to Admins/Superadmins internally? 
                    The AddUserForm component handles role checks internally? 
                    Let's check. Yes, it fetches role. 
                    But usually, we should conditionally render it to avoid layout shifts.
                    But standard is fine. */}
                <AddUserForm />
                <AddCompanyForm />
            </div>
        </div>
    )
}

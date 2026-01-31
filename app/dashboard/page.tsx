
import { AddLeadForm } from '@/components/dashboard/add-lead-form'
import { AddUserForm } from '@/components/dashboard/add-user-form'
import { AddCompanyForm } from '@/components/dashboard/add-company-form'
import { InsightsView } from '@/components/dashboard/insights-view'
import { getCurrentUserFullDetails, getCompanies } from '@/app/dashboard/actions'

export default async function Dashboard() {
    const userDetails = await getCurrentUserFullDetails()
    const role = userDetails?.role || 0

    let companies: any[] = []
    if (role === 2) {
        const res = await getCompanies()
        companies = res.companies || []
    }

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

                {/* Add User Form - Visible to Admins (1) and Superadmins (2) */}
                {role > 0 && (
                    <AddUserForm currentUserRole={role} companies={companies} />
                )}

                {/* Add Company Form - Visible Only to Superadmin (2) */}
                {role === 2 && (
                    <AddCompanyForm />
                )}
            </div>
        </div>
    )
}

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getLeads, getCurrentUserFullDetails } from '@/app/dashboard/actions'
import { ScheduledLeadsTable } from '@/components/dashboard/scheduled-leads-table'
import { Pagination } from '@/components/ui/pagination'
import { Search } from '@/components/ui/search'
import { InsightsView } from '@/components/dashboard/insights-view'

// Keep createClient for now if needed, but getCurrentUserFullDetails is preferred
export default async function ScheduledLeadsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
    const resolvedSearchParams = await searchParams
    const currentPage = Number(resolvedSearchParams.page) || 1
    const query = resolvedSearchParams.query || ''

    // Check Auth
    const userDetails = await getCurrentUserFullDetails()
    if (!userDetails) redirect('/')

    // Task 3: For User (Role 0), show only own/assigned scheduled leads.
    const filters: any = { status: 'Scheduled', filter: resolvedSearchParams.filter }
    if (userDetails.role === 0) {
        filters.scope = 'mine_or_assigned'
    }

    const { leads, count } = await getLeads(currentPage, query, filters)
    const totalPages = Math.ceil(count / 50)

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Scheduled Leads</h1>
                <p className="text-zinc-500 dark:text-zinc-400">Leads scheduled for follow-up.</p>
            </div>

            <div className="mt-8">
                <InsightsView context="scheduled_leads" />
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <Search placeholder="Search scheduled leads..." />
            </div>

            <div className="mb-4 flex w-full justify-center">
                <Pagination totalPages={totalPages} />
            </div>
            <ScheduledLeadsTable leads={leads || []} />

            <div className="flex w-full justify-center mt-5">
                <Pagination totalPages={totalPages} />
            </div>
        </div>
    )
}

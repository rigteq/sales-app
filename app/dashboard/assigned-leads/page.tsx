
import { getLeads } from '@/app/dashboard/actions'
import { LeadsTable } from '@/components/dashboard/leads-table'
import { Pagination } from '@/components/ui/pagination'
import { Search } from '@/components/ui/search'
import { InsightsView } from '@/components/dashboard/insights-view'
import { Suspense } from 'react'

export default async function AssignedLeadsPage({
    searchParams,
}: {
    searchParams?: Promise<{
        query?: string
        page?: string
        status?: string
        filter?: string
    }>
}) {
    const searchParamsValue = await searchParams
    const query = searchParamsValue?.query || ''
    const currentPage = Number(searchParamsValue?.page) || 1
    const status = searchParamsValue?.status
    const filter = searchParamsValue?.filter

    const { leads, count } = await getLeads(currentPage, query, { assignedOnly: true, status, filter })
    const totalPages = Math.ceil(count / 50)

    return (
        <div className="w-full space-y-6">
            <div className="flex w-full items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Assigned Leads</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Leads assigned to you for follow-up.</p>
                </div>
            </div>

            {/* Reusing 'my_leads' context for insights as assigned leads are conceptually 'mine' */}
            <div className="mt-8">
                <InsightsView context="assigned_leads" />
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <Search placeholder="Search assigned leads..." />
            </div>
            <Suspense fallback={<div className="text-center py-10">Loading leads...</div>}>
                <LeadsTable leads={leads} />
            </Suspense>
            <div className="mt-5 flex w-full justify-center">
                <Pagination totalPages={totalPages} />
            </div>
        </div>
    )
}

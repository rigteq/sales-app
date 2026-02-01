
import { getCompanies } from '@/app/dashboard/actions'
import { CompaniesTable } from '@/components/dashboard/companies-table'
import { Pagination } from '@/components/ui/pagination'
import { Search } from '@/components/ui/search'
import { Suspense } from 'react'
import { Loader } from '@/components/loader'
import { InsightsView } from '@/components/dashboard/insights-view'

export default async function CompaniesPage({
    searchParams,
}: {
    searchParams?: Promise<{
        query?: string
        page?: string
        filter?: string
    }>
}) {
    const searchParamsValue = await searchParams
    const query = searchParamsValue?.query || ''
    const currentPage = Number(searchParamsValue?.page) || 1
    const filter = searchParamsValue?.filter

    const { companies, count } = await getCompanies(currentPage, query, filter)
    const totalPages = Math.ceil(count / 50)

    return (
        <div className="w-full space-y-6">
            <div className="flex w-full items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Companies</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage client companies.</p>
                </div>
            </div>

            <div className="mt-8">
                <InsightsView context="companies" />
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <Search placeholder="Search companies..." />
            </div>

            <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader /></div>}>
                <CompaniesTable companies={companies} />
            </Suspense>

            <div className="mt-5 flex w-full justify-center">
                <Pagination totalPages={totalPages} />
            </div>
        </div>
    )
}

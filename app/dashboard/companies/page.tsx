
import { getCompanies } from '@/app/dashboard/actions'
import { CompaniesTable } from '@/components/dashboard/companies-table'
import { Pagination } from '@/components/ui/pagination'
import { Search } from '@/components/ui/search'
import { Suspense } from 'react'
import { Loader } from '@/components/loader'

export default async function CompaniesPage({
    searchParams,
}: {
    searchParams?: Promise<{
        query?: string
        page?: string
    }>
}) {
    const searchParamsValue = await searchParams
    const query = searchParamsValue?.query || ''
    const currentPage = Number(searchParamsValue?.page) || 1

    const { companies, count } = await getCompanies(currentPage, query)
    const totalPages = Math.ceil(count / 10)

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Companies</h1>
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

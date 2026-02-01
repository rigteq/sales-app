
import { getComments } from '@/app/dashboard/actions'
import { CommentsTable } from '@/components/dashboard/comments-table'
import { Pagination } from '@/components/ui/pagination'
import { InsightsView } from '@/components/dashboard/insights-view'
import { Search } from '@/components/ui/search'
import { Suspense } from 'react'

export default async function CommentsPage({
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

    const { comments, count } = await getComments(currentPage, query, false, { status, filter })
    const totalPages = Math.ceil(count / 50)

    return (
        <div className="w-full space-y-6">
            <div className="flex w-full items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">All Comments</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Review interaction history across all leads.</p>
                </div>
            </div>

            <div className="mt-8">
                <InsightsView context="all_comments" />
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <Search placeholder="Search comments..." />
            </div>
            <Suspense fallback={<div className="text-center py-10">Loading comments...</div>}>
                {/* @ts-ignore - Supabase types join complexity */}
                <CommentsTable comments={comments} />
            </Suspense>
            <div className="mt-5 flex w-full justify-center">
                <Pagination totalPages={totalPages} />
            </div>
        </div>
    )
}


import { getComments } from '@/app/dashboard/actions'
import { CommentsTable } from '@/components/dashboard/comments-table'
import { Pagination } from '@/components/ui/pagination'
import { Search } from '@/components/ui/search'
import { InsightsView } from '@/components/dashboard/insights-view'
import { Suspense } from 'react'

export default async function MyCommentsPage({
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

    const { comments, count } = await getComments(currentPage, query, true) // mineOnly = true
    const totalPages = Math.ceil(count / 50)

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">My Comments</h1>
            </div>

            <div className="mt-8">
                <InsightsView context="my_comments" />
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <Search placeholder="Search my comments..." />
            </div>
            <Suspense fallback={<div className="text-center py-10">Loading comments...</div>}>
                {/* @ts-ignore */}
                <CommentsTable comments={comments} />
            </Suspense>
            <div className="mt-5 flex w-full justify-center">
                <Pagination totalPages={totalPages} />
            </div>
        </div>
    )
}

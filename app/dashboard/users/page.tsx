import { Suspense } from 'react'
import { getUsers, getCurrentUserFullDetails, getCompanies } from '@/app/dashboard/actions'
import { UsersTable } from '@/components/dashboard/users-table'
import { redirect } from 'next/navigation'
import { Search } from '@/components/ui/search'
import { Pagination } from '@/components/ui/pagination'
import { InsightsView } from '@/components/dashboard/insights-view'

export default async function UsersPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const params = await searchParams
    const companyIdFilter = params.companyId
    const roleParam = params.roleFilter || params.role
    const roleFilter = roleParam ? parseInt(roleParam) : undefined
    const page = Number(params?.page) || 1
    const query = params?.query || ''

    const userDetails = await getCurrentUserFullDetails()
    if (!userDetails || userDetails.role === 0) {
        redirect('/dashboard')
    }

    let targetRole = roleFilter
    // Keep legacy support or alternative paths if needed
    if (targetRole === undefined) {
        if (params.filter === 'admins') targetRole = 1
        else targetRole = 0 // Default to Users (Role 0) to exclude admins from mixed list
    }

    const { users, count } = await getUsers(page, query, targetRole, companyIdFilter)
    const totalPages = Math.ceil(count / 50)

    let companies: any[] = []
    if (userDetails.role === 2) {
        const res = await getCompanies()
        companies = res.companies || []
    }

    return (
        <div className="w-full space-y-6">
            <div className="flex w-full items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Team Management</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage and monitor team performance.</p>
                </div>
            </div>

            <div className="mt-8">
                <InsightsView context="users" />
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <Search placeholder="Search users..." />
            </div>

            <div className="space-y-4 mt-4">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                    {targetRole === 1 ? 'Admins' : targetRole === 0 ? 'Users' : 'All Team Members'}
                </h2>
                <Suspense fallback={<div className="text-center py-10">Loading users...</div>}>
                    <UsersTable users={users} showCompany={userDetails?.role === 2} />
                </Suspense>

                <div className="mt-5 flex w-full justify-center">
                    <Pagination totalPages={totalPages} />
                </div>
            </div>
        </div>
    )
}

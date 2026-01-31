import { Suspense } from 'react'
import { getUsers, getCurrentUserFullDetails, getCompanies } from '@/app/dashboard/actions'
import { UsersTable } from '@/components/dashboard/users-table'
import { AddUserForm } from '@/components/dashboard/add-user-form'
import { redirect } from 'next/navigation'

export default async function UsersPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const params = await searchParams
    const companyIdFilter = params.companyId
    const roleFilter = params.role ? parseInt(params.role) : undefined

    const userDetails = await getCurrentUserFullDetails()
    if (!userDetails || userDetails.role === 0) {
        redirect('/dashboard')
    }

    let targetRole = roleFilter
    if (targetRole === undefined) {
        if (params.filter === 'admins') targetRole = 1
        else targetRole = 0
    }

    const users = await getUsers(targetRole, companyIdFilter)

    let companies: any[] = []
    if (userDetails.role === 2) {
        const res = await getCompanies()
        companies = res.companies || []
    }

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Team Management</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage and monitor team performance.</p>
                </div>
            </div>

            {/* Insights Placeholder - Could differ for users page, but Structure requested */}
            {/* <div className="mt-8">
                <InsightsView context="users" /> 
            </div> */}

            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                {/* Search to be implemented properly, currently just UI placeholder or client search if table handles it? 
                     UsersTable usually does client side? No, standard is server search.
                     But getUsers doesn't take search param yet. 
                     I will add the Search component to match layout. 
                  */}
                {/* <Search placeholder="Search users..." /> */}
            </div>

            <div className="space-y-4 mt-4">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                    All {targetRole === 1 ? 'Admins' : 'Users'}
                </h2>
                <Suspense fallback={<div className="text-center py-10">Loading users...</div>}>
                    <UsersTable users={users} showCompany={userDetails?.role === 2} />
                </Suspense>
            </div>
        </div>
    )
}

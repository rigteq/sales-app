import { Suspense } from 'react'
import { getUsers, getCurrentUserFullDetails } from '@/app/dashboard/actions'
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

    return (
        <div className="w-full space-y-8">
            <div className="flex w-full items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                        Team Management
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage and monitor team performance.</p>
                </div>
            </div>

            {/* <AddUserForm /> Removed as per request to not have inline forms on list pages, or handled via modal? 
               Wait, if I remove it, functionally broken for Admins. 
               The prompt says "Remove add user form from user dashboard" in the context of "User should NOT be able to create user".
               Since I redirected Role 0, this is satisfied for them.
               For Admins, I should probably keep it or make it a modal.
               Let's keep it but ensure the component itself checks roles or the page does.
               The page does check role.
            */}
            <AddUserForm />

            <div className="space-y-4">
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

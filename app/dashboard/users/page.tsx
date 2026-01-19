
import { Suspense } from 'react'
import { getUsers, getCurrentUserFullDetails } from '@/app/dashboard/actions'
import { UsersTable } from '@/components/dashboard/users-table'
import { AddUserForm } from '@/components/dashboard/add-user-form'

export default async function UsersPage({
    searchParams,
}: {
    searchParams?: Promise<{
        filter?: string
    }>
}) {
    const userDetails = await getCurrentUserFullDetails()
    // Redirect if not admin/superadmin? Logic is handled in actions (returns empty)

    const params = await searchParams
    const users = await getUsers()

    // Filter logic
    let filteredUsers = users
    const filterType = params?.filter

    if (filterType === 'admins') {
        filteredUsers = users.filter((u: any) => (u.role?.roleId ?? u.roleId) === 1)
    }

    return (
        <div className="w-full space-y-8">
            <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    User Management
                </h1>
            </div>

            {/* User List Only */}

            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                    {filterType === 'admins' ? 'Admins' : 'All Users'}
                </h2>
                <Suspense fallback={<div className="text-center py-10">Loading users...</div>}>
                    <UsersTable users={filteredUsers} showCompany={userDetails?.role === 2} />
                </Suspense>
            </div>
        </div>
    )
}

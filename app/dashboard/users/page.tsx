
import { Suspense } from 'react'
import { getUsers, getCurrentUserFullDetails } from '@/app/dashboard/actions'
import { UsersTable } from '@/components/dashboard/users-table'
import { AddUserForm } from '@/components/dashboard/add-user-form'

export default async function UsersPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const params = await searchParams
    const companyIdFilter = params.companyId
    const roleFilter = params.role ? parseInt(params.role) : undefined

    // Determine current user's role to see if they can filter
    const userDetails = await getCurrentUserFullDetails()
    // Authorization: If superadmin (2), can view all or filter. If admin (1), view own company.

    // Pass filters to server action directly
    const filteredUsers = await getUsers(roleFilter, companyIdFilter)

    // Legacy support for "filter=admins" if role param wasn't set?
    // Actually we can just rely on the new params.
    // But if params.filter === 'admins' is present and role isn't, handle it?
    if (!roleFilter && params.filter === 'admins') {
        // Re-fetch or filter client side? 
        // Better to normalize params before fetch? 
        // Since I can't await inside if easily without refactoring, let's just use filteredUsers as is unless we missed the "admins" flag case.
        // If roleFilter is undefined, getUsers returns all roles or filtered?
        // My update to getUsers checks "if (roleFilter !== undefined)". So it returns all roles if undefined.
        // The previous logic defaulted to role 0.
        // Let's replicate strict logic:
    }

    // Actually, let's refine the fetch call:
    let targetRole = roleFilter
    if (targetRole === undefined) {
        if (params.filter === 'admins') targetRole = 1
        else targetRole = 0 // Default to Users
    }

    const users = await getUsers(targetRole, companyIdFilter)

    return (
        <div className="w-full space-y-8">
            <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    User Management
                </h1>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                    {targetRole === 1 ? 'Admins' : 'Users'}
                </h2>
                <Suspense fallback={<div className="text-center py-10">Loading users...</div>}>
                    <UsersTable users={users} showCompany={userDetails?.role === 2} />
                </Suspense>
            </div>
        </div>
    )
}

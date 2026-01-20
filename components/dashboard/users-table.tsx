
'use client'

import { User, Shield, ShieldAlert, Trash2, Eye } from 'lucide-react'
import { deleteUser } from '@/app/dashboard/actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function UsersTable({ users, showCompany }: { users: any[], showCompany?: boolean }) {
    const router = useRouter()

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
        await deleteUser(id)
        router.refresh()
    }

    if (users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50 py-16 text-center dark:border-zinc-800 dark:bg-zinc-950/50">
                <p className="text-zinc-500 dark:text-zinc-400">No users found.</p>
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-zinc-200 bg-zinc-50/50 text-xs font-medium text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
                            <th className="px-6 py-3">User</th>
                            <th className="px-6 py-3">Role</th>
                            {showCompany && <th className="px-6 py-3">Company</th>}
                            <th className="px-6 py-3">Phone</th>
                            <th className="px-6 py-3 w-[100px]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {users.map((user) => {
                            // Fix Role Access: Actions.ts returns role object OR plain role_id on profile.
                            // Join alias is 'role'.
                            // Role is now role_id in DB (profiles) and roleid in DB (roles).
                            const effectiveRoleId = user.role?.roleId ?? user.role?.roleid ?? user.role_id ?? user.roleId ?? 0
                            const roleName = user.role?.rolename ?? user.role?.roleName ?? (effectiveRoleId === 2 ? 'Superadmin' : effectiveRoleId === 1 ? 'Admin' : 'User')
                            const roleId = effectiveRoleId

                            return (
                                <tr key={user.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                <User className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <Link href={`/dashboard/users/${user.id}`} className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline">
                                                    {user.name}
                                                </Link>
                                                <div className="text-xs text-zinc-500 dark:text-zinc-400">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium 
                                        ${roleId === 2 ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                                roleId === 1 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                    'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                                            {roleId === 2 ? <ShieldAlert className="h-3 w-3" /> : roleId === 1 ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                                            {roleName}
                                        </span>
                                    </td>
                                    {showCompany && (
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                            {user.company?.companyname || '-'}
                                        </td>
                                    )}
                                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                        {user.phone || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                            <Link
                                                href={`/dashboard/users/${user.id}`}
                                                className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                                                title="View"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

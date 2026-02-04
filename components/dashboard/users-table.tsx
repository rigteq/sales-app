
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
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                            <th className="px-6 py-3">User</th>
                            <th className="px-6 py-3">Email</th>
                            {showCompany && <th className="px-6 py-3">Company</th>}
                            <th className="px-6 py-3 text-center">Todays Comments</th>
                            <th className="px-6 py-3 text-center">Comments (7d)</th>
                            <th className="px-6 py-3 text-center">POs (Month)</th>
                            <th className="px-6 py-3">Phone</th>
                            <th className="px-6 py-3 w-[100px]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {users.map((user) => {
                            // Fix Role Access: Actions.ts returns role object OR plain role_id on profile.
                            // Join alias is 'role'.
                            // Role is now role_id in DB (profiles) and roleid in DB (roles).
                            const effectiveRoleId = user.role?.roleId ?? user.role?.roleid ?? user.role_id ?? user.roleId ?? 0
                            const roleName = user.role?.rolename ?? user.role?.roleName ?? (effectiveRoleId === 2 ? 'Superadmin' : effectiveRoleId === 1 ? 'Admin' : 'User')
                            const roleId = effectiveRoleId

                            return (
                                <tr key={user.id} className="group hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                <User className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <Link href={`/dashboard/users/${user.id}`} className="font-medium text-slate-900 dark:text-slate-100 hover:underline">
                                                    {user.name}
                                                </Link>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                        {user.email}
                                    </td>
                                    {showCompany && (
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                            {user.company?.companyname || '-'}
                                        </td>
                                    )}
                                    <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">
                                        {user.todays_comments || 0}
                                    </td>
                                    <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">
                                        {user.comments_this_week || 0}
                                    </td>
                                    <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">
                                        {user.pos_this_month || 0}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                        {user.phone || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 md:opacity-0 transition-opacity group-hover:opacity-100">
                                            <Link
                                                href={`/dashboard/users/${user.id}`}
                                                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                                                title="View"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
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

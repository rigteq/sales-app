
import { getUser, getUserComments } from '@/app/dashboard/actions'
import { notFound } from 'next/navigation'
import { CommentsTable } from '@/components/dashboard/comments-table'
import { User, Shield, Building2, Phone, Mail, Calendar } from 'lucide-react'

export default async function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const user = await getUser(id)

    if (!user) {
        notFound()
    }

    const comments = await getUserComments(user.email)

    // Helper for role display
    const roleName = user.role?.roleName || (user.roleId === 2 ? 'Superadmin' : user.roleId === 1 ? 'Admin' : 'User')
    const roleId = user.role?.roleId ?? user.roleId ?? 0

    return (
        <div className="w-full space-y-8">
            {/* Header / Profile Card */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                            <User className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{user.name}</h1>
                            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium 
                                    ${roleId === 2 ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                        roleId === 1 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                            'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                                    {roleName}
                                </span>
                                <span>•</span>
                                <span>Joined {new Date(user.created_at || Date.now()).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                            <Mail className="h-3 w-3" /> Email
                        </div>
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">{user.email}</div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                            <Phone className="h-3 w-3" /> Phone
                        </div>
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">{user.phone || '-'}</div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                            <Building2 className="h-3 w-3" /> Company
                        </div>
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">{user.company?.companyname || '-'}</div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                            <Calendar className="h-3 w-3" /> ID
                        </div>
                        <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate" title={user.id}>{user.id}</div>
                    </div>
                </div>
            </div>

            {/* Activity / Comments Section */}
            <div>
                <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Recent Activity (Comments)</h2>
                <CommentsTable comments={comments} />
            </div>
        </div>
    )
}

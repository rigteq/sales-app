
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/')
    }

    // Fetch profile details if table exists and is populated
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">My Profile</h1>
                <p className="text-zinc-500 dark:text-zinc-400">Manage your account settings.</p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <input
                        type="text"
                        value={user.email}
                        disabled
                        className="flex h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <input
                        type="text"
                        defaultValue={profile?.name || ''}
                        readOnly
                        className="flex h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900"
                        placeholder="Not set"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Gender</label>
                    <input
                        type="text"
                        defaultValue={profile?.gender || ''}
                        readOnly
                        className="flex h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900"
                        placeholder="Not set"
                    />
                </div>
            </div>
        </div>
    )
}

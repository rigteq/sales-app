import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getLeads } from '@/app/dashboard/actions'
import { ScheduledLeadsTable } from '@/components/dashboard/scheduled-leads-table'

export default async function ScheduledLeadsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const resolvedSearchParams = await searchParams
    const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page as string) : 1

    // Check Auth
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/')

    // Check for Role to restrict scheduled leads
    const { data: profile } = await supabase.from('profiles').select('role_id').eq('id', user.id).single()
    const roleId = profile?.role_id ?? 0

    // Task 3: For User (Role 0), show only own/assigned scheduled leads.
    // We pass a special filter 'mine_or_assigned' to getLeads which we will implement in actions.ts
    const filters: any = { status: 'Scheduled' }
    if (roleId === 0) {
        filters.scope = 'mine_or_assigned'
    }

    const { leads } = await getLeads(page, '', filters)

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Scheduled Leads</h1>
                <p className="text-zinc-500 dark:text-zinc-400">Leads scheduled for follow-up.</p>
            </div>

            <ScheduledLeadsTable leads={leads || []} />
        </div>
    )
}

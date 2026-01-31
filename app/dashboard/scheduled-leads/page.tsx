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

    const { leads } = await getLeads(page, '', { status: 'Scheduled' })

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

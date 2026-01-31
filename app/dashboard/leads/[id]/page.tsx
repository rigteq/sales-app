
import { getLead, getLeadComments } from '@/app/dashboard/actions'
import { LeadView } from '@/components/dashboard/lead-view'
import { LeadComments } from '@/components/dashboard/lead-comments'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

import { createClient } from '@/utils/supabase/server'

export default async function LeadDetailsPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { id } = await params
    const resolvedSearchParams = await searchParams
    const returnPage = resolvedSearchParams?.returnPage || '1'
    const returnPath = resolvedSearchParams?.returnPath || '/dashboard/leads'

    const leadId = Number(id)

    if (isNaN(leadId)) {
        notFound()
    }

    const lead = await getLead(leadId)

    if (!lead) {
        notFound()
    }

    const comments = await getLeadComments(leadId)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let userName = 'Sales Team'
    let customMessage = null
    let companyName = 'Rigteq Sales'

    if (user) {
        const { data: profile } = await supabase.from('profiles').select('name, custom_message, company_id').eq('id', user.id).single()
        if (profile) {
            userName = profile.name || user.email?.split('@')[0] || 'Sales Team'
            customMessage = profile.custom_message
            if (profile.company_id) {
                const { data: company } = await supabase.from('company').select('companyname').eq('id', profile.company_id).single()
                if (company) companyName = company.companyname
            }
        }
    }

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6">
            <Link
                href={`${returnPath}?page=${returnPage}`}
                className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to Leads
            </Link>

            <LeadView lead={lead} userName={userName} customMessage={customMessage} companyName={companyName} />

            <LeadComments leadId={leadId} comments={comments} currentStatus={lead.status} currentScheduleTime={lead.schedule_time} />
        </div>
    )
}

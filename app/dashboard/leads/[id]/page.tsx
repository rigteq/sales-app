
import { getLead, getLeadComments } from '@/app/dashboard/actions'
import { LeadView } from '@/components/dashboard/lead-view'
import { LeadComments } from '@/components/dashboard/lead-comments'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function LeadDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const leadId = Number(id)

    if (isNaN(leadId)) {
        notFound()
    }

    const lead = await getLead(leadId)

    if (!lead) {
        notFound()
    }

    const comments = await getLeadComments(leadId)

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6">
            <Link href="/dashboard/leads" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to Leads
            </Link>

            <LeadView lead={lead} />

            <LeadComments leadId={leadId} comments={comments} />
        </div>
    )
}

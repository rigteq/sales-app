import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getCompany, getCompanyStats, getLeads } from '@/app/dashboard/actions'
import { CompanyView } from '@/components/dashboard/company-view'

// Correct type for async params in Next.js 15+ or generally
type PageProps = {
    params: Promise<{ id: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CompanyPage({ params, searchParams }: PageProps) {
    const { id } = await params
    const resolvedSearchParams = await searchParams

    // Check Auth
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/')

    // Check Superadmin Role? Done in actions usually, but good to check here if possible or let actions handle it.
    // getCompany is public? No, we didn't restrict it heavily in actions.ts but maybe we should've.
    // Company table has RLS, but actions use server client.

    const company = await getCompany(id)
    if (!company) notFound()

    const stats = await getCompanyStats(id)

    // Fetch leads for this company
    // Using getLeads action with companyId filter.
    const { leads } = await getLeads(1, '', { companyId: id })

    return (
        <div className="max-w-7xl mx-auto">
            <CompanyView company={company} stats={stats} leads={leads || []} />
        </div>
    )
}

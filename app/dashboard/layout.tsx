
import { Header } from '@/components/dashboard/header'
import { Footer } from '@/components/dashboard/footer'

import { createClient } from '@/utils/supabase/server'
import { getCurrentUserFullDetails } from './actions'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const userDetails = await getCurrentUserFullDetails()
    const userName = userDetails?.profile?.name || userDetails?.user?.email?.split('@')[0] || 'Profile'
    const role = userDetails?.role ?? 0 // Default to User
    const companyId = userDetails?.profile?.company_id || null

    return (
        <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
            <Header userName={userName} role={role} />
            <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {children}
            </main>
            <Footer />
        </div>
    )
}

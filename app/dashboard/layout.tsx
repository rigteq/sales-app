
import { Header } from '@/components/dashboard/header'
import { Footer } from '@/components/dashboard/footer'

import { createClient } from '@/utils/supabase/server'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let userName = 'Profile'
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('name').eq('id', user.id).single()
        userName = profile?.name || user.email?.split('@')[0] || 'Profile'
    }

    return (
        <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
            <Header userName={userName} />
            <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {children}
            </main>
            <Footer />
        </div>
    )
}


import { Header } from '@/components/dashboard/header'
import { Footer } from '@/components/dashboard/footer'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {children}
            </main>
            <Footer />
        </div>
    )
}

import { NotifyForm } from '@/components/dashboard/notify-form'
import { getCurrentUserFullDetails } from '@/app/dashboard/actions'
import { redirect } from 'next/navigation'

export const metadata = {
    title: 'Broadcast Notification | Rigteq Sales',
    description: 'Send priority notifications to all users.',
}

export default async function NotifyPage() {
    const user = await getCurrentUserFullDetails()

    if (!user || user.role !== 2) {
        redirect('/dashboard')
    }

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
                    Notify Team
                </h1>
                <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
                    Broadcast important updates across the entire organization.
                </p>
            </div>

            <NotifyForm />
        </div>
    )
}

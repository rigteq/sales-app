import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CustomMessageForm } from '@/components/dashboard/custom-message-form'

export default async function CustomMessagePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('custom_message')
        .eq('id', user.id)
        .single()

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Custom Message</h1>
                <p className="text-zinc-500 dark:text-zinc-400">Manage your custom WhatsApp message.</p>
            </div>

            <CustomMessageForm currentMessage={profile?.custom_message} />
        </div>
    )
}

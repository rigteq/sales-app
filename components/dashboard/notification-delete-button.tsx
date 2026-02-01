'use client'

import { deleteNotification } from '@/app/dashboard/actions'
import { useToast } from '@/components/ui/toast'
import { Trash2, Loader2 } from 'lucide-react'
import { useState } from 'react'

import { useRouter } from 'next/navigation'

export function NotificationDeleteButton({ id }: { id: string }) {
    const { addToast } = useToast()
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this notification?')) return
        setLoading(true)
        try {
            const res = await deleteNotification(id)
            if (res.error) {
                addToast(res.error, 'error')
            } else {
                addToast('Notification deleted')
                router.refresh()
            }
        } catch (e) {
            addToast('Failed to delete', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="text-slate-400 hover:text-red-600 transition-colors p-1 disabled:opacity-50"
            title="Delete Notification"
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </button>
    )
}

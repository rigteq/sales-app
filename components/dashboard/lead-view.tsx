
'use client'

import { Lead } from '@/types'
import { EditLeadForm } from './edit-lead-form'
import { useState } from 'react'
import { Phone, MessageCircle, Pencil, Trash2, MapPin, Calendar, User } from 'lucide-react'
import { deleteLead, assignLeadToMe } from '@/app/dashboard/actions'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import { UserCheck } from 'lucide-react'

const getStatusColor = (status: string) => {
    switch (status) {
        case 'PO': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        case 'DND':
        case 'DNP':
        case 'Not Interested': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        case 'New': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
        default: return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200'
    }
}

export function LeadView({ lead, userName, currentUserEmail, customMessage, companyName, assignableUsers = [] }: { lead: Lead, userName?: string, currentUserEmail?: string, customMessage?: string | null, companyName?: string, assignableUsers?: { email: string, name: string }[] }) {
    const [isEditing, setIsEditing] = useState(false)
    const router = useRouter()

    const { addToast } = useToast()

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this lead? This cannot be undone (soft delete).')) {
            const result = await deleteLead(lead.id)
            if (result?.success) {
                addToast('Lead deleted successfully')
                router.push('/dashboard/leads')
            } else {
                addToast('Failed to delete lead', 'error')
            }
        }
    }

    const handleAssignToMe = async () => {
        const result = await assignLeadToMe(lead.id)
        if (result?.success) {
            addToast('Lead assigned to you successfully')
            router.refresh()
        } else {
            addToast('Failed to assign lead', 'error')
        }
    }

    if (isEditing) {
        return <EditLeadForm lead={lead} onCancel={() => setIsEditing(false)} assignableUsers={assignableUsers} />
    }

    const defaultMessage = "Hello [Lead Name], [User Name] here from [Company Name]."
    let messageTemplate = customMessage && customMessage.trim().length > 0 ? customMessage : defaultMessage

    // Replacements
    const finalMessage = messageTemplate
        .replace(/\[Lead Name\]/g, lead.lead_name || 'there')
        .replace(/\[User Name\]/g, userName || 'I am')
        .replace(/\[Company Name\]/g, companyName || 'Rigteq Sales')

    let rawPhone = lead.phone?.replace(/\D/g, '') || ''
    // If it starts with '0', remove it.
    if (rawPhone.startsWith('0')) {
        rawPhone = rawPhone.substring(1)
    }
    const formattedPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone

    return (
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-col border-b border-zinc-200 p-6 dark:border-zinc-800 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{lead.lead_name}</h1>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(lead.status || '')}`}>
                            {lead.status}
                        </span>
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400">{lead.email}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 md:mt-0">
                    <a
                        href={`tel:${lead.phone}`}
                        className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-800"
                    >
                        <Phone className="h-4 w-4" />
                        Call
                    </a>
                    <a
                        href={`https://wa.me/${formattedPhone}?text=${encodeURIComponent(finalMessage)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-[#25D366] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                    </a>
                    {currentUserEmail && lead.assigned_to_email_id !== currentUserEmail && (
                        <button
                            onClick={handleAssignToMe}
                            className="inline-flex items-center justify-center gap-2 rounded-md border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-900/30 dark:bg-indigo-950/30 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                        >
                            <UserCheck className="h-4 w-4" />
                            Assign to Me
                        </button>
                    )}
                    <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-800"
                    >
                        <Pencil className="h-4 w-4" />
                        Edit
                    </button>
                    <button
                        onClick={handleDelete}
                        className="inline-flex items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/30 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </button>
                </div>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Phone</p>
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">{lead.phone || '-'}</p>
                </div>
                {lead.secondary_phone && (
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Secondary Phone</p>
                        <p className="font-medium text-zinc-900 dark:text-zinc-50">{lead.secondary_phone}</p>
                    </div>
                )}
                <div className="space-y-1">
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Location</p>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-zinc-400" />
                        <p className="font-medium text-zinc-900 dark:text-zinc-50">{lead.location || 'Not specified'}</p>
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Owner</p>
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-zinc-400" />
                        <p className="font-medium text-zinc-900 dark:text-zinc-50">{lead.created_by_email_id}</p>
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Assigned To</p>
                    <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-zinc-400" />
                        <p className="font-medium text-zinc-900 dark:text-zinc-50">
                            {lead.assigned_to_email_id ? lead.assigned_to_email_id : <span className="text-zinc-400 italic">Unassigned</span>}
                        </p>
                    </div>
                </div>
                <div className="col-span-full space-y-1">
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Note</p>
                    <div className="rounded-md bg-zinc-50 p-4 text-zinc-900 dark:bg-zinc-900/50 dark:text-zinc-100">
                        {lead.note || 'No notes added.'}
                    </div>
                </div>
                <div className="col-span-full flex gap-6 text-xs text-zinc-500">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Created: {new Date(lead.created_time).toLocaleString()}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Last Edited: {new Date(lead.last_edited_time).toLocaleString()}</span>
                </div>
            </div>
        </div>
    )
}

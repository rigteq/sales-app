'use client'

import { Lead } from '@/types'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Eye, Loader2 } from 'lucide-react'
import { useState, useTransition } from 'react'



// Helper to determine status color
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

export function LeadsTable({ leads }: { leads: Lead[] }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const page = searchParams.get('page') || '1'

    const [isPending, startTransition] = useTransition()
    const [loadingId, setLoadingId] = useState<number | null>(null)

    const handleRowClick = (id: number) => {
        setLoadingId(id)
        startTransition(() => {
            router.push(`/dashboard/leads/${id}?returnPage=${page}&returnPath=${pathname}`)
        })
    }

    return (
        <div className="mt-6 flow-root overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
                <div className="rounded-lg bg-white p-2 md:pt-0 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <div className="md:hidden">
                        {leads?.map((lead) => (
                            <div
                                key={lead.id}
                                onClick={() => handleRowClick(lead.id)}
                                className={`mb-3 w-full rounded-lg bg-white p-3 border border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 cursor-pointer active:scale-[0.98] transition-all ${loadingId === lead.id ? 'opacity-75 cursor-wait' : ''}`}
                            >
                                <div className="flex items-start justify-between border-b border-zinc-50 pb-2 mb-2 dark:border-zinc-800">
                                    <div className="flex items-center gap-2">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-zinc-900 dark:text-zinc-100">{lead.lead_name}</p>
                                                {loadingId === lead.id && <Loader2 className="h-3 w-3 animate-spin text-zinc-500" />}
                                            </div>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400">{lead.email}</p>
                                        </div>
                                    </div>
                                    <div className={`rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0 ${getStatusColor(lead.status || '')}`}>
                                        {lead.status}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <span className="text-zinc-500 dark:text-zinc-400">Phone: </span>
                                        <span className="font-medium text-zinc-900 dark:text-zinc-100">{lead.phone}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-zinc-500 dark:text-zinc-400">Created: </span>
                                        <span className="text-zinc-900 dark:text-zinc-100">{new Date(lead.created_time).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <table className="hidden min-w-full text-zinc-900 md:table">
                        <thead className="rounded-lg text-left text-sm font-normal">
                            <tr>
                                <th scope="col" className="px-4 py-5 font-medium sm:pl-6 dark:text-zinc-200">
                                    Name
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium dark:text-zinc-200">
                                    Status
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium dark:text-zinc-200">
                                    Phone
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium dark:text-zinc-200">
                                    Location
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium dark:text-zinc-200">
                                    Assigned To
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium dark:text-zinc-200">
                                    Details
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-zinc-900">
                            {leads?.map((lead) => (
                                <tr
                                    key={lead.id}
                                    onClick={() => handleRowClick(lead.id)}
                                    className={`w-full border-b border-zinc-100 py-3 text-sm last-of-type:border-none hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors ${loadingId === lead.id ? 'opacity-75 cursor-wait' : ''}`}
                                >
                                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{lead.lead_name}</p>
                                                    {loadingId === lead.id && <Loader2 className="h-3 w-3 animate-spin text-zinc-500" />}
                                                </div>
                                                <p className="text-xs text-zinc-500 max-w-[150px] truncate">ID: {lead.id}</p>
                                                <p className="text-zinc-500 dark:text-zinc-400">{lead.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(lead.status || '')}`}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3 text-zinc-500 dark:text-zinc-400">
                                        {lead.phone}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3 text-zinc-500 dark:text-zinc-400">
                                        {lead.location || '-'}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3 text-zinc-500 dark:text-zinc-400 text-xs">
                                        {lead.assigned_to_email_id || lead.created_by_email_id}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3 text-zinc-500 max-w-xs truncate dark:text-zinc-400">
                                        <div className="flex flex-col text-xs">
                                            <span>Created: {new Date(lead.created_time).toLocaleDateString()}</span>
                                            <span>Note: {lead.note || '-'}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

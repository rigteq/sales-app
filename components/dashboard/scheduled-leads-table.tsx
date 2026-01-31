'use client'

import { Lead } from '@/types'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useState, useTransition } from 'react'

export function ScheduledLeadsTable({ leads }: { leads: Lead[] }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const page = searchParams.get('page') || '1'

    const [loadingId, setLoadingId] = useState<number | null>(null)
    const [isPending, startTransition] = useTransition()

    const handleRowClick = (id: number) => {
        setLoadingId(id)
        startTransition(() => {
            router.push(`/dashboard/leads/${id}?returnPage=${page}&returnPath=${pathname}`)
        })
    }

    if (leads.length === 0) {
        return (
            <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-zinc-500 dark:text-zinc-400">No scheduled leads found.</p>
            </div>
        )
    }

    return (
        <div className="mt-6 flow-root overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
                <div className="rounded-xl bg-white p-2 md:pt-0 dark:bg-slate-900 border border-slate-200 shadow-sm dark:border-slate-800">
                    <table className="min-w-full text-slate-900">
                        <thead className="text-left text-sm font-normal bg-slate-50/50 dark:bg-slate-900/50">
                            <tr>
                                <th scope="col" className="px-4 py-5 font-medium sm:pl-6 text-slate-500 dark:text-slate-400">
                                    Name
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium text-slate-500 dark:text-slate-400">
                                    Contact
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium text-slate-500 dark:text-slate-400">
                                    Schedule Time
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium text-slate-500 dark:text-slate-400">
                                    Last Updated
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-900">
                            {leads.map((lead) => (
                                <tr
                                    key={lead.id}
                                    onClick={() => handleRowClick(lead.id)}
                                    className={`w-full border-b border-slate-100 py-3 text-sm last-of-type:border-none hover:bg-indigo-50/30 dark:border-slate-800 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${loadingId === lead.id ? 'opacity-75 cursor-wait' : ''}`}
                                >
                                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-slate-900 dark:text-slate-100">{lead.lead_name}</p>
                                            {loadingId === lead.id && <Loader2 className="h-3 w-3 animate-spin text-slate-500" />}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        <div className="flex flex-col text-xs">
                                            <span className="text-slate-900 dark:text-slate-100">{lead.phone}</span>
                                            <span className="text-slate-500 dark:text-slate-400">{lead.email}</span>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3 font-medium text-indigo-600 dark:text-indigo-400">
                                        {lead.schedule_time ? new Date(lead.schedule_time).toLocaleString(undefined, {
                                            weekday: 'short',
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : '-'}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3 text-slate-500 dark:text-slate-400">
                                        {new Date(lead.last_edited_time).toLocaleString()}
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

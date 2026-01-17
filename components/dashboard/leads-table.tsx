
import { Lead } from '@/types'
import Link from 'next/link'
import { Eye } from 'lucide-react'

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
    return (
        <div className="mt-6 flow-root">
            <div className="inline-block min-w-full align-middle">
                <div className="rounded-lg bg-white p-2 md:pt-0 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <div className="md:hidden">
                        {leads?.map((lead) => (
                            <div
                                key={lead.id}
                                className="mb-4 w-full rounded-xl bg-white p-5 border border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800"
                            >
                                <div className="flex items-start justify-between border-b border-zinc-100 pb-4 mb-4 dark:border-zinc-800">
                                    <div>
                                        <div className="mb-1 flex items-center">
                                            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{lead.lead_name}</p>
                                        </div>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{lead.email}</p>
                                    </div>
                                    <div className={`rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0 ${getStatusColor(lead.status || '')}`}>
                                        {lead.status}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-zinc-500 dark:text-zinc-400">Phone</span>
                                        <span className="font-medium text-zinc-900 dark:text-zinc-100">{lead.phone}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-zinc-500 dark:text-zinc-400">Created</span>
                                        <span className="text-zinc-900 dark:text-zinc-100">{new Date(lead.created_time).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                                    <Link
                                        href={`/dashboard/leads/${lead.id}`}
                                        className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 w-full sm:w-auto"
                                    >
                                        View Details
                                    </Link>
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
                                    Details
                                </th>
                                <th scope="col" className="relative py-3 pl-6 pr-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-zinc-900">
                            {leads?.map((lead) => (
                                <tr
                                    key={lead.id}
                                    className="w-full border-b border-zinc-100 py-3 text-sm last-of-type:border-none hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                                >
                                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col">
                                                <p className="font-medium text-zinc-900 dark:text-zinc-100">{lead.lead_name}</p>
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
                                    <td className="whitespace-nowrap px-3 py-3 text-zinc-500 max-w-xs truncate dark:text-zinc-400">
                                        <div className="flex flex-col text-xs">
                                            <span>Created: {new Date(lead.created_time).toLocaleDateString()}</span>
                                            <span>Note: {lead.note || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                        <div className="flex justify-end gap-3">
                                            <Link
                                                href={`/dashboard/leads/${lead.id}`}
                                                className="rounded-md border border-zinc-200 p-2 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                                            >
                                                <Eye className="w-4" />
                                                <span className="sr-only">View</span>
                                            </Link>
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

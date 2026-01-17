
import { Lead } from '@/types'
import Link from 'next/link'
import { Eye } from 'lucide-react'

export function LeadsTable({ leads }: { leads: Lead[] }) {
    return (
        <div className="mt-6 flow-root">
            <div className="inline-block min-w-full align-middle">
                <div className="rounded-lg bg-white p-2 md:pt-0 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <div className="md:hidden">
                        {leads?.map((lead) => (
                            <div
                                key={lead.id}
                                className="mb-2 w-full rounded-md bg-white p-4 border-b border-zinc-100 last:border-0 dark:bg-zinc-900 dark:border-zinc-800"
                            >
                                <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
                                    <div>
                                        <div className="mb-2 flex items-center">
                                            <p className="text-lg font-medium dark:text-zinc-100">{lead.lead_name}</p>
                                        </div>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{lead.email}</p>
                                    </div>
                                    <div className="rounded-full px-2 py-1 text-xs font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                        {lead.status}
                                    </div>
                                </div>
                                <div className="flex w-full items-center justify-between pt-4">
                                    <div>
                                        <p className="text-sm font-medium dark:text-zinc-100">{lead.phone}</p>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{new Date(lead.created_time).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Link
                                            href={`/dashboard/leads/${lead.id}`}
                                            className="rounded-md border border-zinc-200 p-2 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800"
                                        >
                                            <Eye className="w-5" />
                                        </Link>
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
                                        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
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

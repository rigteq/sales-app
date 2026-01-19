
import { Building2 } from 'lucide-react'

export function CompaniesTable({ companies }: { companies: any[] }) {
    if (companies.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50 py-16 text-center dark:border-zinc-800 dark:bg-zinc-950/50">
                <p className="text-zinc-500 dark:text-zinc-400">No companies found.</p>
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-zinc-200 bg-zinc-50/50 text-xs font-medium text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
                            <th className="px-6 py-3">Company</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Phone</th>
                            <th className="px-6 py-3">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {companies.map((company) => (
                            <tr key={company.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                            <Building2 className="h-4 w-4" />
                                        </div>
                                        <div className="font-medium text-zinc-900 dark:text-zinc-100">{company.companyname}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                    {company.companyemail || '-'}
                                </td>
                                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                    {company.companyphone || '-'}
                                </td>
                                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                    {company.companydetails || '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

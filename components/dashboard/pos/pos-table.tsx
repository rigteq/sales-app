'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AddPOForm } from './add-po-form' // We will create this

export function POsTable({ pos }: { pos: any[] }) {
    const [isAddOpen, setIsAddOpen] = useState(false)

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            {/* Table Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
                <h3 className="font-medium text-slate-900 dark:text-slate-50">Purchase Orders</h3>
                {/* 
                  Add PO Button? 
                  User said "Add PO form on Superadmin, Admin and User dashboard". 
                  We can put a button here that opens a modal.
                */}
                <button
                    onClick={() => setIsAddOpen(!isAddOpen)}
                    className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
                >
                    <Plus className="h-4 w-4" />
                    New PO
                </button>
            </div>

            {isAddOpen && (
                <div className="p-4 border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                    <AddPOForm onSuccess={() => setIsAddOpen(false)} />
                </div>
            )}

            <div className="relative overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                    <thead className="bg-slate-50/50 text-xs uppercase text-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
                        <tr>
                            <th className="px-6 py-3">Lead Name</th>
                            <th className="px-6 py-3">Amount Received</th>
                            <th className="px-6 py-3">Remaining</th>
                            <th className="px-6 py-3">Release Date</th>
                            <th className="px-6 py-3">Created Date</th>
                            <th className="px-6 py-3">Note</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pos.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center">No POs found</td>
                            </tr>
                        ) : (
                            pos.map((po) => (
                                <tr key={po.id} className="border-b bg-white dark:border-slate-800 dark:bg-slate-950 hover:bg-indigo-50/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                                        {po.leads?.lead_name || 'Unknown Lead'}
                                        <div className="text-xs text-slate-500">{po.leads?.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 text-green-600 font-semibold">
                                        ₹{Number(po.amount_received).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-red-600">
                                        ₹{Number(po.amount_remaining).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {po.release_date ? new Date(po.release_date).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {new Date(po.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 max-w-xs truncate" title={po.note}>
                                        {po.note || '-'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

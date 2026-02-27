'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { AddPOForm } from './add-po-form'
import { EditPOForm } from './edit-po-form'
import { deletePO } from '@/app/dashboard/actions'
import { useToast } from '@/components/ui/toast'
import { useRouter } from 'next/navigation'

interface POsTableProps {
    pos: any[]
    userRole: number   // 0=User, 1=Admin, 2=SuperAdmin
    userEmail: string
}

export function POsTable({ pos, userRole, userEmail }: POsTableProps) {
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [editingPO, setEditingPO] = useState<any | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()
    const { addToast } = useToast()
    const router = useRouter()

    /**
     * Checks whether the current user can edit/delete a specific PO.
     * SuperAdmin (2): Always yes
     * Admin (1): Yes for any PO (company scope is already enforced on data fetch)
     * User (0): Only if they created it
     */
    const canModifyPO = (po: any) => {
        if (userRole === 2) return true
        if (userRole === 1) return true
        if (userRole === 0) return po.created_by_email_id === userEmail
        return false
    }

    const handleDelete = (poId: string) => {
        if (!confirm('Are you sure you want to delete this Purchase Order? This action cannot be undone.')) return
        setDeletingId(poId)
        startTransition(async () => {
            const result = await deletePO(poId)
            setDeletingId(null)
            if (result?.error) {
                addToast(result.error, 'error')
            } else {
                addToast('PO deleted successfully')
                router.refresh()
            }
        })
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            {/* Table Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
                <h3 className="font-medium text-slate-900 dark:text-slate-50">Purchase Orders</h3>
                {/* Add PO Button — visible to all roles (SuperAdmin, Admin, User) */}
                <button
                    onClick={() => {
                        setIsAddOpen(!isAddOpen)
                        setEditingPO(null)
                    }}
                    className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    New PO
                </button>
            </div>

            {/* Add PO Inline Form */}
            {isAddOpen && !editingPO && (
                <div className="p-4 border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                    <AddPOForm onSuccess={() => {
                        setIsAddOpen(false)
                        router.refresh()
                    }} />
                </div>
            )}

            {/* Edit PO Inline Form */}
            {editingPO && (
                <div className="p-4 border-b border-slate-200 bg-amber-50/50 dark:border-slate-800 dark:bg-amber-900/10">
                    <EditPOForm
                        po={editingPO}
                        onSuccess={() => {
                            setEditingPO(null)
                            router.refresh()
                        }}
                        onCancel={() => setEditingPO(null)}
                    />
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
                            <th className="px-6 py-3">Created By</th>
                            <th className="px-6 py-3">Note</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pos.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-8 text-center text-slate-400 dark:text-slate-500">
                                    No Purchase Orders found.
                                </td>
                            </tr>
                        ) : (
                            pos.map((po) => {
                                const canModify = canModifyPO(po)
                                const isDeleting = deletingId === po.id
                                const isEditing = editingPO?.id === po.id

                                return (
                                    <tr
                                        key={po.id}
                                        className={`border-b dark:border-slate-800 transition-colors ${isEditing
                                            ? 'bg-amber-50/60 dark:bg-amber-900/10'
                                            : 'bg-white dark:bg-slate-950 hover:bg-indigo-50/30 dark:hover:bg-slate-900/50'
                                            }`}
                                    >
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                                            {po.leads?.lead_name || 'Unknown Lead'}
                                            {po.leads?.phone && (
                                                <div className="text-xs text-slate-500">{po.leads.phone}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-green-600 dark:text-green-400 font-semibold">
                                            ₹{Number(po.amount_received).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-red-600 dark:text-red-400">
                                            ₹{Number(po.amount_remaining).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {po.release_date
                                                ? new Date(po.release_date).toLocaleDateString()
                                                : <span className="text-slate-300 dark:text-slate-600">—</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            {new Date(po.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 max-w-[140px] truncate" title={po.created_by_email_id}>
                                            {po.created_by_email_id}
                                        </td>
                                        <td className="px-6 py-4 max-w-[160px] truncate" title={po.note}>
                                            {po.note || <span className="text-slate-300 dark:text-slate-600">—</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {canModify ? (
                                                <div className="inline-flex items-center gap-2">
                                                    {/* Edit Button */}
                                                    <button
                                                        onClick={() => {
                                                            setIsAddOpen(false)
                                                            setEditingPO(isEditing ? null : po)
                                                        }}
                                                        title="Edit PO"
                                                        className={`rounded-md p-1.5 text-slate-500 transition-colors hover:bg-amber-100 hover:text-amber-700 dark:hover:bg-amber-900/30 dark:hover:text-amber-400 ${isEditing ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : ''}`}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>

                                                    {/* Delete Button */}
                                                    <button
                                                        onClick={() => handleDelete(po.id)}
                                                        disabled={isDeleting}
                                                        title="Delete PO"
                                                        className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/30 dark:hover:text-red-400 disabled:opacity-50"
                                                    >
                                                        {isDeleting
                                                            ? <Loader2 className="h-4 w-4 animate-spin" />
                                                            : <Trash2 className="h-4 w-4" />
                                                        }
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

'use client'

import { useActionState, useEffect, useState } from 'react'
import { addPO, getLeads } from '@/app/dashboard/actions' // Need getLeads or searchLeads
import { Loader2, Search } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { useRouter } from 'next/navigation'

const initialState: any = {
    error: undefined,
    success: false,
    message: ''
}

export function AddPOForm({ onSuccess }: { onSuccess?: () => void }) {
    const [state, formAction, isPending] = useActionState(addPO, initialState)
    const { addToast } = useToast()
    const router = useRouter()

    // Lead Search State
    const [searchTerm, setSearchTerm] = useState('')
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [selectedLead, setSelectedLead] = useState<any>(null)
    const [isSearching, setIsSearching] = useState(false)

    // Search Leads Debounce
    useEffect(() => {
        const delay = setTimeout(async () => {
            if (searchTerm.length >= 2) {
                setIsSearching(true)
                // Start search
                // We need a searchLeads action or reuse `getLeads`.
                // getLeads returns { leads }
                // Let's assume pagination 1, query = term.
                const res = await getLeads(1, searchTerm)
                setSearchResults(res.leads || [])
                setIsSearching(false)
            } else {
                setSearchResults([])
            }
        }, 500)
        return () => clearTimeout(delay)
    }, [searchTerm])

    useEffect(() => {
        if (state?.success) {
            addToast('PO created successfully')
            if (onSuccess) onSuccess()
            // Reset
            setSelectedLead(null)
            setSearchTerm('')
        } else if (state?.error) {
            addToast(state.error, 'error')
        }
    }, [state, addToast, onSuccess])

    return (
        <form action={formAction} className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Add New Purchase Order</h3>

            {/* Lead Selection */}
            <div className="space-y-2 relative">
                <label className="text-xs font-medium text-zinc-500">Search Lead *</label>
                {!selectedLead ? (
                    <>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Type lead name or phone..."
                                className="w-full rounded-md border border-slate-200 bg-white pl-9 p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 dark:border-slate-800 dark:bg-slate-950"
                            />
                            {isSearching && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-zinc-400" />}
                        </div>

                        {/* Results Dropdown */}
                        {searchResults.length > 0 && (
                            <div className="absolute z-10 mt-1 w-full rounded-md border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                                {searchResults.map(lead => (
                                    <button
                                        key={lead.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedLead(lead)
                                            setSearchResults([])
                                            setSearchTerm('')
                                        }}
                                        className="w-full text-left p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex justify-between items-center"
                                    >
                                        <div>
                                            <div className="text-sm font-medium">{lead.lead_name}</div>
                                            <div className="text-xs text-zinc-500">{lead.phone}</div>
                                        </div>
                                        <div className="text-xs uppercase bg-zinc-100 px-2 py-1 rounded dark:bg-zinc-800">{lead.status}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex items-center justify-between rounded-md border border-blue-200 bg-blue-50 p-2 dark:border-blue-900 dark:bg-blue-900/30">
                        <div>
                            <div className="text-sm font-semibold text-blue-900 dark:text-blue-100">{selectedLead.lead_name}</div>
                            <div className="text-xs text-blue-700 dark:text-blue-300">{selectedLead.phone}</div>
                        </div>
                        <button type="button" onClick={() => setSelectedLead(null)} className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400">Change</button>
                        <input type="hidden" name="leadId" value={selectedLead.id} />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-500">Amount Received *</label>
                    <input name="amountReceived" type="number" required placeholder="0.00" className="w-full rounded-md border border-slate-200 bg-white p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 dark:border-slate-800 dark:bg-slate-950" />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-500">Amount Remaining</label>
                    <input name="amountRemaining" type="number" placeholder="0.00" className="w-full rounded-md border border-zinc-200 bg-white p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950" />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-500">Release Date (Expected)</label>
                <input name="releaseDate" type="date" className="w-full rounded-md border border-zinc-200 bg-white p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950" />
            </div>

            <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-500">Note</label>
                <textarea name="note" rows={2} placeholder="Payment details etc..." className="w-full rounded-md border border-zinc-200 bg-white p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950" />
            </div>

            <div className="flex justify-end pt-2">
                {!selectedLead && <p className="text-xs text-red-500 mr-auto self-center">Please select a lead first.</p>}
                <button
                    type="submit"
                    disabled={isPending || !selectedLead}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 dark:bg-slate-50 dark:text-slate-900"
                >
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />}
                    Create PO
                </button>
            </div>
        </form>
    )
}

'use client'

import { useActionState, useEffect } from 'react'
import { updateCompany } from '@/app/dashboard/actions'
import { Company } from '@/types'
import { Loader2, Save, X } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

export function EditCompanyForm({ company, onCancel }: { company: Company, onCancel: () => void }) {
    const initialState = {
        error: undefined as string | undefined,
        success: false,
        message: ''
    }
    // @ts-ignore
    const [state, formAction, isPending] = useActionState(updateCompany, initialState)

    const { addToast } = useToast()

    useEffect(() => {
        if (state?.success) {
            addToast('Company updated successfully')
            onCancel()
        } else if (state?.error) {
            addToast(state.error, 'error')
        }
    }, [state, addToast, onCancel])

    return (
        <form action={formAction} className="space-y-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <input type="hidden" name="id" value={company.id} />

            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Edit Company</h3>
                <button type="button" onClick={onCancel} className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                    <X className="h-5 w-5" />
                </button>
            </div>

            {state?.error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/10 dark:text-red-400">
                    <p>{state.error}</p>
                </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                    <label htmlFor="companyname" className="text-sm font-medium">Company Name</label>
                    <input
                        id="companyname"
                        name="companyname"
                        type="text"
                        required
                        defaultValue={company.companyname}
                        className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="companyemail" className="text-sm font-medium">Company Email</label>
                    <input
                        id="companyemail"
                        name="companyemail"
                        type="email"
                        defaultValue={company.companyemail || ''}
                        className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="companyphone" className="text-sm font-medium">Company Phone</label>
                    <input
                        id="companyphone"
                        name="companyphone"
                        type="tel"
                        defaultValue={company.companyphone || ''}
                        className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950"
                    />
                </div>

                <div className="space-y-2 lg:col-span-2">
                    <label htmlFor="companydetails" className="text-sm font-medium">Details</label>
                    <textarea
                        id="companydetails"
                        name="companydetails"
                        rows={3}
                        defaultValue={company.companydetails || ''}
                        className="flex w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-md px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 shadow hover:bg-zinc-900/90 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90"
                >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                </button>
            </div>
        </form>
    )
}

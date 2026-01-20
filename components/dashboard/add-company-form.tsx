'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { addCompany, getCurrentUserFullDetails } from '@/app/dashboard/actions'
import { Loader2, Plus, CheckCircle2, AlertCircle, Building2 } from 'lucide-react'

const initialState = {
    error: undefined as string | undefined,
    success: false,
    message: ''
}

export function AddCompanyForm() {
    const [state, formAction, isPending] = useActionState(addCompany, initialState)
    const formRef = useRef<HTMLFormElement>(null)

    const [currentUserRole, setCurrentUserRole] = useState<number>(0)

    useEffect(() => {
        getCurrentUserFullDetails().then(details => {
            if (details) setCurrentUserRole(details.role)
        })
    }, [])

    useEffect(() => {
        if (state?.success) {
            formRef.current?.reset()
        }
    }, [state?.success])

    if (currentUserRole !== 2) return null

    return (
        <div className="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 mt-8">
            <div className="border-b border-zinc-200 p-6 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-zinc-500" />
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                        Add New Company
                    </h2>
                </div>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Register a new organization in the system.
                </p>
            </div>

            <form ref={formRef} action={formAction} className="p-6 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                    {/* Company Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Company Name *</label>
                        <input name="companyname" type="text" required placeholder="Acme Inc." className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950" />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Company Email</label>
                        <input name="companyemail" type="email" placeholder="contact@acme.com" className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950" />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Company Phone</label>
                        <input name="companyphone" type="tel" placeholder="+1 234 567 890" className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950" />
                    </div>

                    {/* Details */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Details</label>
                        <input name="companydetails" type="text" placeholder="Additional info..." className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950" />
                    </div>
                </div>

                {state?.error && (
                    <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <p>{state.error}</p>
                    </div>
                )}
                {state?.success && (
                    <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <p>{state.message}</p>
                    </div>
                )}

                <div className="flex justify-end pt-2">
                    <button type="submit" disabled={isPending} className="inline-flex items-center justify-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 hover:bg-zinc-900/90 disabled:opacity-50">
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        Create Company
                    </button>
                </div>
            </form>
        </div>
    )
}

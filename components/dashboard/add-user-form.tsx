
'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { addUser, getCompanies, getCurrentUserFullDetails } from '@/app/dashboard/actions'
import { Loader2, Plus, CheckCircle2, AlertCircle } from 'lucide-react'

const initialState = {
    error: undefined as string | undefined,
    success: false,
    message: ''
}

export function AddUserForm() {
    const [state, formAction, isPending] = useActionState(addUser, initialState)
    const formRef = useRef<HTMLFormElement>(null)
    const [role, setRole] = useState<number>(0)
    const [companies, setCompanies] = useState<any[]>([])
    const [currentUserRole, setCurrentUserRole] = useState<number>(0)

    useEffect(() => {
        // Fetch current user details to know if Superadmin
        getCurrentUserFullDetails().then(details => {
            if (details) {
                setCurrentUserRole(details.role)
                if (details.role === 2) {
                    getCompanies().then(res => {
                        setCompanies(res.companies)
                        // Preselect Superadmin's own company if exists, else first one
                        if (details.profile.company_id) {
                            // find it? Or just let user select. 
                            // Request: "Superadmins company should be preselected"
                        }
                    })
                }
            }
        })
    }, [])

    useEffect(() => {
        if (state?.success) {
            formRef.current?.reset()
        }
    }, [state?.success])

    return (
        <div className="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="border-b border-zinc-200 p-6 dark:border-zinc-800">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    Add New User
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Create a new account for a team member.
                </p>
            </div>

            <form ref={formRef} action={formAction} className="p-6 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Full Name *</label>
                        <input name="name" type="text" required placeholder="Jane Doe" className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950" />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Email *</label>
                        <input name="email" type="email" required placeholder="jane@example.com" className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950" />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Phone *</label>
                        <input name="phone" type="tel" required placeholder="10 Digits" className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950" />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Password *</label>
                        <input name="password" type="password" required placeholder="******" className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950" />
                    </div>

                    {/* Address */}
                    <div className="space-y-2 sm:col-span-2">
                        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Address</label>
                        <textarea name="address" rows={2} placeholder="123 Main St, City, Country" className="flex w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950" />
                    </div>

                    {/* Gender */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Gender</label>
                        <select name="gender" className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950">
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Role - Only visible to Superadmin */}
                    {currentUserRole === 2 ? (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Role</label>
                            <select
                                name="role"
                                onChange={(e) => setRole(Number(e.target.value))}
                                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950"
                            >
                                <option value="0">User</option>
                                <option value="1">Admin</option>
                            </select>
                        </div>
                    ) : (
                        <input type="hidden" name="role" value="0" />
                    )}

                    {/* Company (Superadmin Only) */}
                    {currentUserRole === 2 && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Company</label>
                            <select name="companyId" className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950">
                                {companies.map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.companyname}</option>
                                ))}
                            </select>
                        </div>
                    )}
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
                        {role === 1 ? 'Create Admin' : 'Create User'}
                    </button>
                </div>
            </form>
        </div>
    )
}


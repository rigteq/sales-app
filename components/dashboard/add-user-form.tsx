
'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { addUser, getCompanies, getCurrentUserFullDetails } from '@/app/dashboard/actions'
import { Loader2, Plus, CheckCircle2, AlertCircle } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

const initialState = {
    error: undefined as string | undefined,
    success: false,
    message: ''
}

export function AddUserForm({ currentUserRole, companies = [] }: { currentUserRole: number, companies?: any[] }) {
    const [state, formAction, isPending] = useActionState(addUser, initialState)
    const formRef = useRef<HTMLFormElement>(null)
    const [role, setRole] = useState<number>(0)

    const { addToast } = useToast()

    useEffect(() => {
        if (state?.success) {
            addToast(state.message || 'User added successfully')
            formRef.current?.reset()
        } else if (state?.error) {
            addToast(state.error, 'error')
        }
    }, [state, addToast])

    if (currentUserRole === 0) return null

    // Strict Task 1: If User Role (0), do not render the form.
    if (currentUserRole === 0) return null
    if (currentUserRole === null) return null // Loading state, keep hidden to avoid flash


    return (
        <div className="w-full rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="border-b border-slate-200 p-6 dark:border-slate-800">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                    Add New User
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Create a new account for a team member.
                </p>
            </div>

            <form ref={formRef} action={formAction} className="p-6 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Full Name *</label>
                        <input name="name" type="text" required placeholder="Jane Doe" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 dark:border-slate-800 dark:bg-slate-950" />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Email *</label>
                        <input name="email" type="email" required placeholder="jane@example.com" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 dark:border-slate-800 dark:bg-slate-950" />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Phone *</label>
                        <input name="phone" type="tel" required placeholder="10 Digits" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 dark:border-slate-800 dark:bg-slate-950" />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Password *</label>
                        <input name="password" type="password" required placeholder="******" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 dark:border-slate-800 dark:bg-slate-950" />
                    </div>

                    {/* Address */}
                    <div className="space-y-2 sm:col-span-2">
                        <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Address</label>
                        <textarea name="address" rows={2} placeholder="123 Main St, City, Country" className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 dark:border-slate-800 dark:bg-slate-950" />
                    </div>

                    {/* Gender */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Gender</label>
                        <select name="gender" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 dark:border-slate-800 dark:bg-slate-950">
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Role - Only visible to Superadmin */}
                    {currentUserRole === 2 ? (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Role</label>
                            <select
                                name="role"
                                onChange={(e) => setRole(Number(e.target.value))}
                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 dark:border-slate-800 dark:bg-slate-950"
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
                            <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Company</label>
                            <select name="companyId" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 dark:border-slate-800 dark:bg-slate-950">
                                {companies.map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.companyname}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>



                <div className="flex justify-end pt-2">
                    <button type="submit" disabled={isPending} className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        {role === 1 ? 'Create Admin' : 'Create User'}
                    </button>
                </div>
            </form>
        </div>
    )
}


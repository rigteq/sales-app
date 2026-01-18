'use client'

import { useState } from 'react'
import { updateProfile, sendPasswordReset } from '@/app/dashboard/actions'
import { Pencil, Save, Lock, X } from 'lucide-react'

export function ProfileForm({ user, profile }: { user: any, profile: any }) {
    const [isEditing, setIsEditing] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const [resetPending, setResetPending] = useState(false)
    const [message, setMessage] = useState('')
    const [resetMessage, setResetMessage] = useState('')

    async function handleSubmit(formData: FormData) {
        setIsPending(true)
        setMessage('')

        const result = await updateProfile(formData)

        if (result.success) {
            setMessage('Profile updated successfully!')
            setIsEditing(false)
        } else {
            setMessage(result.error || 'Failed to update profile.')
        }
        setIsPending(false)
    }

    async function handleResetPassword() {
        if (!confirm('Send password reset email?')) return
        setResetPending(true)
        setResetMessage('')

        const result = await sendPasswordReset()

        if (result.success) {
            setResetMessage(result.message || 'Email sent')
        } else {
            setResetMessage(result.error || 'Failed')
        }
        setResetPending(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Profile Details</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your account information.</p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                    >
                        <Pencil className="h-4 w-4" />
                        Edit Profile
                    </button>
                ) : (
                    <button
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    >
                        <X className="h-4 w-4" />
                        Cancel
                    </button>
                )}
            </div>

            <form action={handleSubmit} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
                {/* Email Field - Read Only */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <input
                        type="text"
                        value={user.email}
                        disabled
                        className="flex h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-800/50"
                    />
                </div>

                {/* Name Field */}
                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Name</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        defaultValue={profile?.name || ''}
                        disabled={!isEditing}
                        className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-300 dark:disabled:bg-zinc-800/50 dark:disabled:text-zinc-400"
                        placeholder="Enter your name"
                    />
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        defaultValue={profile?.phone || ''}
                        disabled={!isEditing}
                        className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-300 dark:disabled:bg-zinc-800/50 dark:disabled:text-zinc-400"
                        placeholder="Enter you phone number"
                    />
                </div>

                {/* Address Field */}
                <div className="space-y-2">
                    <label htmlFor="address" className="text-sm font-medium">Address</label>
                    <input
                        id="address"
                        name="address"
                        type="text"
                        defaultValue={profile?.address || ''}
                        disabled={!isEditing}
                        className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-300 dark:disabled:bg-zinc-800/50 dark:disabled:text-zinc-400"
                        placeholder="Enter your address"
                    />
                </div>

                {isEditing && (
                    <div className="pt-4 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
                        <div className="text-sm text-zinc-500">
                            Click save to update your changes.
                        </div>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 hover:bg-zinc-900/90 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 dark:focus:ring-zinc-300"
                        >
                            {isPending ? 'Saving...' : <><Save className="h-4 w-4" /> Save Changes</>}
                        </button>
                    </div>
                )}
                {message && (
                    <div className={`rounded-md p-3 text-sm ${message.includes('success') ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                        {message}
                    </div>
                )}
            </form>

            {/* Security Section */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-50 mb-4">Security</h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Password</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Reset your password via email.</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleResetPassword}
                        disabled={resetPending}
                        className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
                    >
                        <Lock className="h-4 w-4" />
                        {resetPending ? 'Sending...' : 'Reset Password'}
                    </button>
                </div>
                {resetMessage && (
                    <p className="mt-3 text-sm text-zinc-500">{resetMessage}</p>
                )}
            </div>
        </div>
    )
}

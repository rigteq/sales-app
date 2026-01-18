'use client'

import { useState } from 'react' // Import useState from react
import { updateProfile } from '@/app/dashboard/actions'

export function ProfileForm({ user, profile }: { user: any, profile: any }) {
    const [isPending, setIsPending] = useState(false)
    const [message, setMessage] = useState('')

    async function handleSubmit(formData: FormData) {
        setIsPending(true)
        setMessage('')

        const result = await updateProfile(formData)

        if (result.success) {
            setMessage('Profile updated successfully!')
        } else {
            setMessage(result.error || 'Failed to update profile.')
        }
        setIsPending(false)
    }

    return (
        <form action={handleSubmit} className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
            {/* Email Field - Read Only */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input
                    type="text"
                    value={user.email}
                    disabled
                    className="flex h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 cursor-not-allowed"
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
                    className="flex h-10 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus:ring-zinc-300"
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
                    className="flex h-10 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus:ring-zinc-300"
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
                    className="flex h-10 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus:ring-zinc-300"
                    placeholder="Enter your address"
                />
            </div>

            <div className="pt-4 flex items-center justify-between">
                <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 hover:bg-zinc-900/90 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 dark:focus:ring-zinc-300"
                >
                    {isPending ? 'Saving...' : 'Save Changes'}
                </button>
                {message && (
                    <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-500'}`}>
                        {message}
                    </p>
                )}
            </div>
        </form>
    )
}

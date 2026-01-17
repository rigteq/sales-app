
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { signOut } from '@/app/auth/actions'
import { User, LogOut, ChevronDown } from 'lucide-react'

export function Header() {
    const [isProfileOpen, setIsProfileOpen] = useState(false)

    return (
        <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/75 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/75">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-8">
                    <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-zinc-900 dark:text-zinc-50">
                        <div className="h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white dark:bg-zinc-50 dark:text-zinc-900">
                            R
                        </div>
                        <span>Rigteq Sales</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        <Link
                            href="/dashboard/leads"
                            className="text-zinc-500 hover:text-zinc-900 transition-colors dark:text-zinc-400 dark:hover:text-zinc-50"
                        >
                            All Leads
                        </Link>
                        <Link
                            href="/dashboard/comments"
                            className="text-zinc-500 hover:text-zinc-900 transition-colors dark:text-zinc-400 dark:hover:text-zinc-50"
                        >
                            All Comments
                        </Link>
                    </nav>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                    >
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline-block">Profile</span>
                        <ChevronDown className="h-3 w-3 text-zinc-500" />
                    </button>

                    {isProfileOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-30"
                                onClick={() => setIsProfileOpen(false)}
                            />
                            <div className="absolute right-0 top-full z-40 mt-2 w-48 rounded-md border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
                                <Link
                                    href="/dashboard/profile"
                                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-zinc-900 hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-900"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <User className="h-4 w-4" />
                                    My Profile
                                </Link>
                                <form action={signOut}>
                                    <button
                                        type="submit"
                                        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </button>
                                </form>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}

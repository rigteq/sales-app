
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { signOut } from '@/app/auth/actions'
import { User, LogOut, ChevronDown } from 'lucide-react'

export function Header({ userName }: { userName?: string }) {
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // Fallback if not provided, though layout should provide it.
    const displayName = userName || 'Profile'

    return (
        <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/75 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/75">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4 md:gap-8">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                        </svg>
                    </button>

                    <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-zinc-900 dark:text-zinc-50">
                        <div className="h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white dark:bg-zinc-50 dark:text-zinc-900">
                            R
                        </div>
                        <span className="hidden sm:inline-block">Rigteq Sales</span>
                    </Link>

                    {/* Desktop Nav */}
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
                        <Link
                            href="/dashboard/insights"
                            className="text-zinc-500 hover:text-zinc-900 transition-colors dark:text-zinc-400 dark:hover:text-zinc-50"
                        >
                            Insights
                        </Link>
                    </nav>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                    >
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline-block max-w-[150px] truncate">{displayName}</span>
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
                                        onClick={(e) => {
                                            if (!confirm('Are you sure you want to logout?')) {
                                                e.preventDefault()
                                            }
                                        }}
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

            {/* Mobile Nav Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-4 space-y-4">
                    <Link
                        href="/dashboard/leads"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                    >
                        All Leads
                    </Link>
                    <Link
                        href="/dashboard/comments"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                    >
                        All Comments
                    </Link>
                    <Link
                        href="/dashboard/insights"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                    >
                        Insights
                    </Link>
                </div>
            )}
        </header>
    )
}

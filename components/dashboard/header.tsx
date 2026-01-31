
'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { signOut } from '@/app/auth/actions'
import { User, LogOut, ChevronDown, Building2, Users, FileText, MessageSquare, Bell } from 'lucide-react'

type UserRole = 0 | 1 | 2

export function Header({ userName, role = 0 }: { userName?: string, role?: number }) {
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const [hasNewBroadcast, setHasNewBroadcast] = useState(false)

    const displayName = userName || 'Profile'

    useEffect(() => {
        const handleBroadcast = () => setHasNewBroadcast(true)
        window.addEventListener('new-broadcast', handleBroadcast)

        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            window.removeEventListener('new-broadcast', handleBroadcast)
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const NavDropdown = ({ title, children, id }: { title: string, children: React.ReactNode, id: string }) => (
        <div className="relative">
            <button
                onClick={() => setActiveDropdown(activeDropdown === id ? null : id)}
                className="flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:text-slate-50 focus:outline-none"
            >
                {title}
                <ChevronDown className={`h-3 w-3 transition-transform ${activeDropdown === id ? 'rotate-180' : ''}`} />
            </button>
            {activeDropdown === id && (
                <div className="absolute left-0 mt-2 w-48 rounded-md border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-800 dark:bg-slate-950 animate-in fade-in zoom-in-95 duration-100 z-50">
                    {children}
                </div>
            )}
        </div>
    )

    return (
        <header className="sticky top-0 z-40 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4 md:gap-8">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-slate-50 transition-colors"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                        </svg>
                    </button>

                    <Link
                        href="/dashboard"
                        onClick={() => setHasNewBroadcast(false)}
                        className="flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-slate-50 group relative"
                    >
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-105">
                            R
                        </div>
                        {hasNewBroadcast && (
                            <span className="absolute -top-1 -left-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                        )}
                        <span className="hidden sm:inline-block tracking-tight">Rigteq Sales</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav ref={dropdownRef} className="hidden md:flex items-center gap-6 text-sm font-medium">

                        {/* LEADS DROPDOWN */}
                        <NavDropdown title="Leads" id="leads">
                            <Link onClick={() => setActiveDropdown(null)} href="/dashboard/leads" className="block px-2 py-1.5 text-sm rounded-sm hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300">
                                All Leads
                            </Link>
                            <Link onClick={() => setActiveDropdown(null)} href="/dashboard/my-leads" className="block px-2 py-1.5 text-sm rounded-sm hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300">
                                My Leads
                            </Link>
                            <Link onClick={() => setActiveDropdown(null)} href="/dashboard/assigned-leads" className="block px-2 py-1.5 text-sm rounded-sm hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300">
                                Assigned Leads
                            </Link>
                            <Link onClick={() => setActiveDropdown(null)} href="/dashboard/scheduled-leads" className="block px-2 py-1.5 text-sm rounded-sm hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300">
                                Scheduled Leads
                            </Link>
                        </NavDropdown>

                        {/* COMMENTS DROPDOWN */}
                        {role === 0 ? (
                            <Link href="/dashboard/my-comments" className="text-slate-500 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:text-slate-50">
                                My Comments
                            </Link>
                        ) : (
                            <NavDropdown title="Comments" id="comments">
                                <Link onClick={() => setActiveDropdown(null)} href="/dashboard/comments" className="block px-2 py-1.5 text-sm rounded-sm hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300">
                                    All Comments
                                </Link>
                                <Link onClick={() => setActiveDropdown(null)} href="/dashboard/my-comments" className="block px-2 py-1.5 text-sm rounded-sm hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300">
                                    My Comments
                                </Link>
                            </NavDropdown>
                        )}

                        {/* PO Link */}
                        <Link href="/dashboard/pos" className="text-slate-500 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:text-slate-50">
                            PO
                        </Link>

                        {/* USERS DROPDOWN (Admin/Superadmin) */}
                        {role === 2 ? (
                            <NavDropdown title="Users" id="users">
                                <Link onClick={() => setActiveDropdown(null)} href="/dashboard/users" className="block px-2 py-1.5 text-sm rounded-sm hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300">
                                    Users
                                </Link>
                                <Link onClick={() => setActiveDropdown(null)} href="/dashboard/users?filter=admins" className="block px-2 py-1.5 text-sm rounded-sm hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300">
                                    Admins
                                </Link>
                            </NavDropdown>
                        ) : role === 1 ? (
                            <Link href="/dashboard/users" className="text-slate-500 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:text-slate-50">
                                Users
                            </Link>
                        ) : null}

                        {/* COMPANIES (Superadmin) */}
                        {role === 2 && (
                            <Link href="/dashboard/companies" className="text-slate-500 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:text-slate-50">
                                Companies
                            </Link>
                        )}

                    </nav>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 dark:hover:bg-slate-800"
                    >
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline-block max-w-[150px] truncate">{displayName}</span>
                        <ChevronDown className="h-3 w-3 text-slate-500" />
                    </button>

                    {isProfileOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-30"
                                onClick={() => setIsProfileOpen(false)}
                            />
                            <div className="absolute right-0 top-full z-40 mt-2 w-48 rounded-md border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-800 dark:bg-slate-950">
                                <Link
                                    href="/dashboard/profile"
                                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-slate-900 hover:bg-slate-100 dark:text-slate-50 dark:hover:bg-slate-900"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <User className="h-4 w-4" />
                                    My Profile
                                </Link>
                                <Link
                                    href="/dashboard/insights"
                                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-slate-900 hover:bg-slate-100 dark:text-slate-50 dark:hover:bg-slate-900"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <Building2 className="h-4 w-4" />
                                    Insights
                                </Link>
                                <Link
                                    href="/dashboard/custom-message"
                                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-slate-900 hover:bg-slate-100 dark:text-slate-50 dark:hover:bg-slate-900"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    Custom Message
                                </Link>
                                {role === 2 && (
                                    <Link
                                        href="/dashboard/notify"
                                        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        <Bell className="h-4 w-4" />
                                        Notify Users
                                    </Link>
                                )}
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
            {
                isMobileMenuOpen && (
                    <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 space-y-4 shadow-lg">
                        {/* Simplified Mobile Menu */}
                        <Link href="/dashboard/leads" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-medium text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400">All Leads</Link>
                        <Link href="/dashboard/my-leads" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-medium text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400">My Leads</Link>
                        <Link href="/dashboard/assigned-leads" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-medium text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400">Assigned Leads</Link>
                        <Link href="/dashboard/scheduled-leads" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-medium text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400">Scheduled Leads</Link>

                        {role !== 0 && (
                            <Link href="/dashboard/comments" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-medium text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400">All Comments</Link>
                        )}
                        <Link href="/dashboard/my-comments" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-medium text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400">My Comments</Link>

                        <Link href="/dashboard/pos" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-medium text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400">Purchase Orders (PO)</Link>

                        {role !== 0 && (
                            <Link href="/dashboard/users" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-medium text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400">Users</Link>
                        )}
                        {role === 2 && (
                            <Link href="/dashboard/users?filter=admins" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-medium text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400">Admins</Link>
                        )}
                        {role === 2 && (
                            <Link href="/dashboard/companies" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-medium text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400">Companies</Link>
                        )}
                    </div>
                )
            }
        </header >
    )
}

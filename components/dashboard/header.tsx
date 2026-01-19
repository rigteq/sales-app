
'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { signOut } from '@/app/auth/actions'
import { User, LogOut, ChevronDown, Building2, Users, FileText, MessageSquare } from 'lucide-react'

type UserRole = 0 | 1 | 2

export function Header({ userName, role = 0 }: { userName?: string, role?: number }) {
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const displayName = userName || 'Profile'

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const NavDropdown = ({ title, children, id }: { title: string, children: React.ReactNode, id: string }) => (
        <div className="relative">
            <button
                onClick={() => setActiveDropdown(activeDropdown === id ? null : id)}
                className="flex items-center gap-1 text-zinc-500 hover:text-zinc-900 transition-colors dark:text-zinc-400 dark:hover:text-zinc-50 focus:outline-none"
            >
                {title}
                <ChevronDown className={`h-3 w-3 transition-transform ${activeDropdown === id ? 'rotate-180' : ''}`} />
            </button>
            {/* Dropdown Menu - Removed group-hover:block */}
            {activeDropdown === id && (
                <div className="absolute left-0 mt-2 w-48 rounded-md border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950 animate-in fade-in zoom-in-95 duration-100 z-50">
                    {children}
                </div>
            )}
        </div>
    )

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
                    <nav ref={dropdownRef} className="hidden md:flex items-center gap-6 text-sm font-medium">

                        {/* LEADS DROPDOWN */}
                        <NavDropdown title="Leads" id="leads">
                            <Link onClick={() => setActiveDropdown(null)} href="/dashboard/leads" className="block px-2 py-1.5 text-sm rounded-sm hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                                All Leads
                            </Link>
                            <Link onClick={() => setActiveDropdown(null)} href="/dashboard/my-leads" className="block px-2 py-1.5 text-sm rounded-sm hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                                My Leads
                            </Link>
                            <Link onClick={() => setActiveDropdown(null)} href="/dashboard/assigned-leads" className="block px-2 py-1.5 text-sm rounded-sm hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                                Assigned Leads
                            </Link>
                        </NavDropdown>

                        {/* COMMENTS DROPDOWN */}
                        {role === 0 ? (
                            <Link href="/dashboard/my-comments" className="text-zinc-500 hover:text-zinc-900 transition-colors dark:text-zinc-400 dark:hover:text-zinc-50">
                                My Comments
                            </Link>
                        ) : (
                            <NavDropdown title="Comments" id="comments">
                                <Link onClick={() => setActiveDropdown(null)} href="/dashboard/comments" className="block px-2 py-1.5 text-sm rounded-sm hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                                    All Comments
                                </Link>
                                <Link onClick={() => setActiveDropdown(null)} href="/dashboard/my-comments" className="block px-2 py-1.5 text-sm rounded-sm hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                                    My Comments
                                </Link>
                            </NavDropdown>
                        )}

                        {/* USERS DROPDOWN (Admin/Superadmin) */}
                        {role === 2 ? (
                            <NavDropdown title="Users" id="users">
                                <Link onClick={() => setActiveDropdown(null)} href="/dashboard/users" className="block px-2 py-1.5 text-sm rounded-sm hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                                    All Users
                                </Link>
                                <Link onClick={() => setActiveDropdown(null)} href="/dashboard/users?filter=admins" className="block px-2 py-1.5 text-sm rounded-sm hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                                    All Admins
                                </Link>
                            </NavDropdown>
                        ) : role === 1 ? (
                            <Link href="/dashboard/users" className="text-zinc-500 hover:text-zinc-900 transition-colors dark:text-zinc-400 dark:hover:text-zinc-50">
                                Users
                            </Link>
                        ) : null}

                        {/* COMPANIES (Superadmin) */}
                        {role === 2 && (
                            <Link href="/dashboard/companies" className="text-zinc-500 hover:text-zinc-900 transition-colors dark:text-zinc-400 dark:hover:text-zinc-50">
                                Companies
                            </Link>
                        )}

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
                                <Link
                                    href="/dashboard/insights"
                                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-zinc-900 hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-900"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <Building2 className="h-4 w-4" />
                                    Insights
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
                    {/* Simplified Mobile Menu */}
                    <Link href="/dashboard/leads" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-medium">All Leads</Link>
                    <Link href="/dashboard/my-leads" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-medium">My Leads</Link>
                    <Link href="/dashboard/assigned-leads" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-medium">Assigned Leads</Link>

                    {role !== 0 && (
                        <Link href="/dashboard/comments" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-medium">All Comments</Link>
                    )}
                    <Link href="/dashboard/my-comments" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-medium">My Comments</Link>

                    {role !== 0 && (
                        <Link href="/dashboard/users" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-medium">Users</Link>
                    )}
                    {role === 2 && (
                        <Link href="/dashboard/companies" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-medium text-zinc-900 dark:text-zinc-50">Companies</Link>
                    )}

                    {/* Insights is available in Profile Dropdown */}
                </div>
            )}
        </header>
    )
}

'use client'

import { Company, Lead } from '@/types'
import { useState } from 'react'
import { EditCompanyForm } from './edit-company-form'
import { LeadsTable } from './leads-table'
import { deleteCompany } from '@/app/dashboard/actions'
import { useRouter } from 'next/navigation'
import { Building2, Mail, Phone, Users, Shield, FileText, CheckCircle2, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/ui/toast'

interface CompanyStats {
    totalLeads: number
    totalAdmins: number
    totalUsers: number
    totalPOs: number
}

export function CompanyView({ company, stats, leads }: { company: Company, stats: CompanyStats, leads: Lead[] }) {
    const [isEditing, setIsEditing] = useState(false)
    const router = useRouter()
    const { addToast } = useToast()

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this company? This is a destructive action.')) {
            const result = await deleteCompany(company.id)
            if (result?.success) {
                addToast('Company deleted successfully')
                router.push('/dashboard/companies')
            } else {
                addToast('Failed to delete company', 'error')
            }
        }
    }

    if (isEditing) {
        return <EditCompanyForm company={company} onCancel={() => setIsEditing(false)} />
    }

    return (
        <div className="space-y-8">
            {/* Header / Info */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">{company.companyname}</h1>
                        <div className="mt-2 space-y-1 text-sm text-slate-500 dark:text-slate-400">
                            {company.companyemail && (
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    {company.companyemail}
                                </div>
                            )}
                            {company.companyphone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    {company.companyphone}
                                </div>
                            )}
                        </div>
                        {company.companydetails && (
                            <p className="mt-4 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                                {company.companydetails}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Link
                            href={`/dashboard/users?companyId=${company.id}&role=1`}
                            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-800"
                        >
                            <Shield className="h-4 w-4" />
                            View Admins
                        </Link>
                        <Link
                            href={`/dashboard/users?companyId=${company.id}&role=0`}
                            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-800"
                        >
                            <Users className="h-4 w-4" />
                            View Users
                        </Link>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-800"
                        >
                            <Pencil className="h-4 w-4" />
                            Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 dark:border-red-900/30 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </button>
                    </div>
                </div>
            </div>

            {/* Insights */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                        <FileText className="h-4 w-4" />
                        Total Leads
                    </div>
                    <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">{stats.totalLeads}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                        <Shield className="h-4 w-4" />
                        Total Admins
                    </div>
                    <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">{stats.totalAdmins}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                        <Users className="h-4 w-4" />
                        Total Users
                    </div>
                    <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">{stats.totalUsers}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                        <CheckCircle2 className="h-4 w-4" />
                        Total POs
                    </div>
                    <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">{stats.totalPOs}</div>
                </div>
            </div>

            {/* Leads List */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Company Leads</h2>
                <LeadsTable leads={leads} />
            </div>
        </div>
    )
}

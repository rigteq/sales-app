'use client'

import { BarChart3, TrendingUp, Users, CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getInsights } from '@/app/dashboard/actions'

export function InsightsCharts() {
    const [stats, setStats] = useState({
        metric1: 0,
        metric2: 0,
        metric3: 0,
        metric4: 0
    })

    useEffect(() => {
        getInsights('all_leads').then(setStats)
    }, [])

    const totalLeads = stats.metric1
    const inConversation = stats.metric3
    const converted = stats.metric4

    const total = totalLeads || 1
    const conversationPercent = Math.round((inConversation / total) * 100) || 0
    const convertedPercent = Math.round((converted / total) * 100) || 0

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
            {/* Pipeline Health */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Pipeline Health</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Current lead status distribution</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-semibold text-slate-600 dark:text-slate-300">Total Leads</span>
                            <span className="text-slate-900 dark:text-slate-100 font-extrabold">{totalLeads}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 dark:bg-slate-800 overflow-hidden">
                            <div className="h-full rounded-full bg-slate-900 dark:bg-slate-100 w-full opacity-10"></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">In Conversation</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{conversationPercent}% ({inConversation})</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 dark:bg-slate-800 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-1000" style={{ width: `${conversationPercent}%` }}></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Converted (PO)</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{convertedPercent}% ({converted})</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 dark:bg-slate-800 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-1000" style={{ width: `${convertedPercent}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Performance Metrics</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Key performance indicators</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Conversion Rate</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">{totalLeads > 0 ? ((converted / totalLeads) * 100).toFixed(1) : 0}%</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Rate</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">{totalLeads > 0 ? ((inConversation / totalLeads) * 100).toFixed(1) : 0}%</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 col-span-2">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/30">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Success Focus</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Focus on converting high-intent leads to maximize sales velocity.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

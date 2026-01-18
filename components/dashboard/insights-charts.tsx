'use client'

import { BarChart3, TrendingUp, Users, CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getInsights } from '@/app/dashboard/actions'

export function InsightsCharts() {
    const [stats, setStats] = useState({
        totalLeads: 0,
        newLeads: 0,
        inConversation: 0,
        converted: 0
    })

    useEffect(() => {
        getInsights().then(setStats)
    }, [])

    // Calculate simple percentages for visualization
    const total = stats.totalLeads || 1
    const newPercent = Math.round((stats.newLeads / total) * 100) || 0
    const conversationPercent = Math.round((stats.inConversation / total) * 100) || 0
    const convertedPercent = Math.round((stats.converted / total) * 100) || 0

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pipeline Health */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Pipeline Health</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Current lead status distribution</p>
                    </div>
                    <div className="p-2 bg-zinc-100 rounded-lg dark:bg-zinc-800">
                        <BarChart3 className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                    </div>
                </div>

                <div className="space-y-5">
                    <div>
                        <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-medium text-zinc-700 dark:text-zinc-300">Total Leads</span>
                            <span className="text-zinc-900 dark:text-zinc-100 font-bold">{stats.totalLeads}</span>
                        </div>
                        <div className="w-full bg-zinc-100 rounded-full h-2.5 dark:bg-zinc-800">
                            <div className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100 w-full opacity-20"></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-medium text-blue-600 dark:text-blue-400">In Conversation</span>
                            <span className="text-zinc-500">{conversationPercent}% ({stats.inConversation})</span>
                        </div>
                        <div className="w-full bg-zinc-100 rounded-full h-2.5 dark:bg-zinc-800">
                            <div className="h-full rounded-full bg-blue-500 transition-all duration-1000" style={{ width: `${conversationPercent}%` }}></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-medium text-green-600 dark:text-green-400">Converted</span>
                            <span className="text-zinc-500">{convertedPercent}% ({stats.converted})</span>
                        </div>
                        <div className="w-full bg-zinc-100 rounded-full h-2.5 dark:bg-zinc-800">
                            <div className="h-full rounded-full bg-green-500 transition-all duration-1000" style={{ width: `${convertedPercent}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Performance Metrics</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Key performance indicators</p>
                    </div>
                    <div className="p-2 bg-zinc-100 rounded-lg dark:bg-zinc-800">
                        <TrendingUp className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Conversion Rate</p>
                        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{stats.totalLeads > 0 ? ((stats.converted / stats.totalLeads) * 100).toFixed(1) : 0}%</p>
                    </div>
                    <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Active Rate</p>
                        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{stats.totalLeads > 0 ? ((stats.inConversation / stats.totalLeads) * 100).toFixed(1) : 0}%</p>
                    </div>
                    <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 col-span-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Success Focus</p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Keep converting active leads to boost revenue.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

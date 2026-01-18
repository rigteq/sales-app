'use client'

import { BarChart3, TrendingUp, Users } from 'lucide-react'

// Mock data for visual demonstration until real historical data is available
const monthlyData = [
    { month: 'Jan', value: 35 },
    { month: 'Feb', value: 45 },
    { month: 'Mar', value: 30 },
    { month: 'Apr', value: 60 },
    { month: 'May', value: 75 },
    { month: 'Jun', value: 50 },
]

const sourceData = [
    { label: 'Website', value: 45, color: 'bg-blue-500' },
    { label: 'Referral', value: 25, color: 'bg-purple-500' },
    { label: 'Cold Call', value: 20, color: 'bg-zinc-500' },
    { label: 'Other', value: 10, color: 'bg-zinc-300' },
]

export function InsightsCharts() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenue / Leads Trend */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Lead Growth</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Monthly breakdown</p>
                    </div>
                    <div className="p-2 bg-zinc-100 rounded-lg dark:bg-zinc-800">
                        <TrendingUp className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                    </div>
                </div>

                <div className="flex items-end justify-between h-48 gap-2 mt-4">
                    {monthlyData.map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 w-full group">
                            <div className="relative w-full flex items-end justify-center h-full">
                                <div
                                    className="w-full max-w-[40px] bg-zinc-900 dark:bg-zinc-100 rounded-t-sm transition-all duration-500 hover:opacity-80 group-hover:scale-y-105 origin-bottom"
                                    style={{ height: `${item.value}%` }}
                                />
                                {/* Tooltip */}
                                <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs px-2 py-1 rounded">
                                    {item.value}
                                </div>
                            </div>
                            <span className="text-xs text-zinc-500 font-medium">{item.month}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Lead Sources */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Lead Sources</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Where are leads coming from?</p>
                    </div>
                    <div className="p-2 bg-zinc-100 rounded-lg dark:bg-zinc-800">
                        <Users className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                    </div>
                </div>

                <div className="space-y-6 mt-4">
                    {sourceData.map((item, i) => (
                        <div key={i}>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-medium text-zinc-700 dark:text-zinc-300">{item.label}</span>
                                <span className="text-zinc-500">{item.value}%</span>
                            </div>
                            <div className="w-full bg-zinc-100 rounded-full h-2 dark:bg-zinc-800 overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${item.color}`}
                                    style={{ width: `${item.value}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Activity Graphic */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 md:col-span-2">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Activity Heatmap</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Peak engagement times</p>
                    </div>
                    <div className="p-2 bg-zinc-100 rounded-lg dark:bg-zinc-800">
                        <BarChart3 className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                    </div>
                </div>

                {/* Decorative Heatmap Grid */}
                <div className="grid grid-cols-12 gap-1 md:gap-2">
                    {Array.from({ length: 48 }).map((_, i) => (
                        <div
                            key={i}
                            className={`h-8 rounded-sm transition-colors hover:ring-2 ring-zinc-900/10 dark:ring-white/10 ${Math.random() > 0.7 ? 'bg-zinc-900 dark:bg-zinc-100' :
                                    Math.random() > 0.4 ? 'bg-zinc-400 dark:bg-zinc-600' : 'bg-zinc-100 dark:bg-zinc-800'
                                }`}
                            title={`Activity Level: ${Math.floor(Math.random() * 100)}%`}
                        />
                    ))}
                </div>
                <div className="mt-4 flex justify-between text-xs text-zinc-400">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                </div>
            </div>
        </div>
    )
}

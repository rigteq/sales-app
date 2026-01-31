'use client'

import { useEffect, useState } from 'react'
import { getUpcomingScheduledLeads } from '@/app/dashboard/actions'
import { Bell, X, Calendar, Phone, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

// Define alert thresholds in minutes
const ALERT_THRESHOLDS = [
    24 * 60, // 1 day
    60,      // 1 hour
    30,      // 30 mins
    15,      // 15 mins
    5,       // 5 mins
    0        // Now
]

export function ScheduledAlerts() {
    const { addToast } = useToast()
    const router = useRouter()
    const [alerts, setAlerts] = useState<any[]>([])
    const [processedAlerts, setProcessedAlerts] = useState<Set<string>>(new Set())

    const supabase = createClient()

    useEffect(() => {
        // Request Notification Permission
        if ('Notification' in window) {
            Notification.requestPermission()
        }

        // Fetch Missed Broadcasts
        const fetchRecentBroadcasts = async () => {
            const { data } = await supabase
                .from('broadcast_notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(1)

            if (data && data.length > 0) {
                const latest = data[0]
                const lastSeen = localStorage.getItem('lastSeenBroadcastId')

                // Show if it's new and within last 24 hours
                const isRecent = (new Date().getTime() - new Date(latest.created_at).getTime()) < 24 * 60 * 60 * 1000

                if (latest.id !== lastSeen && isRecent) {
                    const alertObj = {
                        id: latest.id,
                        type: 'broadcast',
                        title: latest.title,
                        message: latest.message,
                        alertKey: `broadcast-${latest.id}`
                    }
                    setAlerts(prev => [...prev, alertObj])
                    playBeep()
                    window.dispatchEvent(new CustomEvent('new-broadcast'))
                }
            }
        }
        fetchRecentBroadcasts()

        // Realtime Subscription for Broadcasts
        const channel = supabase
            .channel('broadcast-alerts')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'broadcast_notifications' },
                (payload) => {
                    const newBroadcast = payload.new
                    const alertObj = {
                        id: newBroadcast.id,
                        type: 'broadcast',
                        title: newBroadcast.title,
                        message: newBroadcast.message,
                        alertKey: `broadcast-${newBroadcast.id}`
                    }

                    setAlerts(prev => [...prev, alertObj])
                    playBeep()
                    sendWebNotification(alertObj)
                    window.dispatchEvent(new CustomEvent('new-broadcast'))
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    useEffect(() => {
        const checkAlerts = async () => {
            try {
                const leads = await getUpcomingScheduledLeads()

                if (leads && leads.length > 0) {
                    const now = new Date().getTime()
                    const newAlerts: any[] = []

                    leads.forEach(lead => {
                        if (!lead.schedule_time) return
                        const scheduleTime = new Date(lead.schedule_time).getTime()
                        const diffMinutes = Math.floor((scheduleTime - now) / 60000)

                        ALERT_THRESHOLDS.forEach(threshold => {
                            if (diffMinutes <= threshold && diffMinutes >= threshold - 1) {
                                const alertKey = `${lead.id}-${lead.schedule_time}-${threshold}`

                                if (!processedAlerts.has(alertKey)) {
                                    const alertObj = {
                                        ...lead,
                                        type: 'call',
                                        threshold,
                                        alertKey
                                    }
                                    newAlerts.push(alertObj)

                                    setProcessedAlerts(prev => {
                                        const newSet = new Set(prev)
                                        newSet.add(alertKey)
                                        return newSet
                                    })
                                }
                            }
                        })
                    })

                    if (newAlerts.length > 0) {
                        setAlerts(prev => [...prev, ...newAlerts])
                        playBeep()

                        newAlerts.forEach(alert => {
                            sendWebNotification(alert)
                        })
                    }
                }
            } catch (error) {
                console.error('Alert check failed', error)
            }
        }

        const interval = setInterval(checkAlerts, 20 * 1000)
        checkAlerts()

        return () => clearInterval(interval)
    }, [processedAlerts])

    const sendWebNotification = (alert: any) => {
        if (!('Notification' in window)) return
        if (Notification.permission !== 'granted') return

        const title = alert.type === 'broadcast' ? alert.title : `Scheduled Call: ${alert.lead_name}`
        const body = alert.type === 'broadcast'
            ? alert.message
            : `You have a call scheduled with ${alert.lead_name} ${alert.threshold === 0 ? 'NOW' : `in ${alert.threshold} mins`}.`

        try {
            const n = new Notification(title, {
                body,
                icon: '/icons/icon-192x192.png',
                tag: alert.alertKey
            })
            n.onclick = () => {
                window.focus()
                if (alert.type === 'call') {
                    router.push(`/dashboard/leads/${alert.id}`)
                }
            }
        } catch (e) { console.error('Notification failed', e) }
    }

    const playBeep = () => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext
            if (!AudioContext) return;

            const ctx = new AudioContext()
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()

            osc.connect(gain)
            gain.connect(ctx.destination)

            osc.type = 'sine'
            osc.frequency.setValueAtTime(880, ctx.currentTime)
            osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5)
            gain.gain.setValueAtTime(0.5, ctx.currentTime)
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)

            osc.start()
            osc.stop(ctx.currentTime + 0.5)
        } catch (e) { console.error('Beep failed', e) }
    }

    const acknowledgeAlert = () => {
        const current = alerts[0]
        if (current && current.type === 'broadcast') {
            localStorage.setItem('lastSeenBroadcastId', current.id)
        }
        // Remove first alert (FIFO)
        setAlerts(prev => prev.slice(1))
    }

    const acknowledgeAll = () => {
        setAlerts([])
    }

    if (alerts.length === 0) return null

    // Queue Display Logic: Show only the first alert
    const currentAlert = alerts[0]
    const remainingCount = alerts.length - 1

    const isCall = currentAlert.type === 'call'
    const isBroadcast = currentAlert.type === 'broadcast'

    const time = isCall ? new Date(currentAlert.schedule_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
    const remainingText = isCall ? (currentAlert.threshold === 0 ? 'NOW' :
        currentAlert.threshold >= 60 ? `${Math.floor(currentAlert.threshold / 60)} Hour(s)` :
            `${currentAlert.threshold} Minutes`) : 'Priority'

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden">
                {/* Header with Urgency Color */}
                <div className={`h-2 w-full ${isBroadcast ? 'bg-indigo-600' : (currentAlert.threshold === 0 ? 'bg-red-500 animate-pulse' : 'bg-indigo-500')}`}></div>

                <div className="p-6 space-y-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${isBroadcast ? 'bg-indigo-100 text-indigo-600' : (currentAlert.threshold === 0 ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600')}`}>
                                {isBroadcast ? <Bell className="h-6 w-6" /> : <Calendar className="h-6 w-6" />}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                                    {isBroadcast ? currentAlert.title : 'Scheduled Call'}
                                </h3>
                                <p className={`font-medium ${!isBroadcast && currentAlert.threshold === 0 ? 'text-red-600' : 'text-indigo-600'}`}>
                                    {isBroadcast ? 'Global Broadcast' : (remainingText === 'NOW' ? 'Starting Now!' : `Starts in ${remainingText}`)}
                                </p>
                            </div>
                        </div>
                        <button onClick={acknowledgeAlert} className="text-slate-400 hover:text-slate-600">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-950/50 dark:border-slate-800">
                        <div className="space-y-4">
                            {isCall ? (
                                <>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lead Name</label>
                                        <p className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">{currentAlert.lead_name}</p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</label>
                                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{time}</p>
                                        </div>
                                        <div>
                                            <a
                                                href={`tel:${currentAlert.phone}`}
                                                className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                                            >
                                                <Phone className="h-4 w-4" />
                                                Call
                                            </a>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                        {currentAlert.message}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <button
                            onClick={acknowledgeAlert}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all active:scale-[0.98]"
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            {isBroadcast ? 'Got it' : `Acknowledge ${remainingCount > 0 ? `(${remainingCount} more)` : ''}`}
                        </button>

                        {remainingCount > 0 && isCall && (
                            <button
                                onClick={acknowledgeAll}
                                className="w-full text-center text-xs text-slate-500 hover:text-slate-700 py-1"
                            >
                                Dismiss All ({remainingCount + 1})
                            </button>
                        )}

                        {isCall && (
                            <button
                                onClick={() => {
                                    acknowledgeAlert()
                                    router.push(`/dashboard/leads/${currentAlert.id}`)
                                }}
                                className="w-full text-center text-sm font-medium text-slate-600 hover:text-indigo-600 py-2 dark:text-slate-400 dark:hover:text-indigo-400"
                            >
                                View Lead Details
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

'use client'

import { useEffect, useState, useRef } from 'react'
import { getUpcomingScheduledLeads } from '@/app/dashboard/actions'
import { Bell, X, Calendar, Phone } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

// Sound Alert & Modal Component
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
    const [alerts, setAlerts] = useState<any[]>([])
    const [processedAlerts, setProcessedAlerts] = useState<Set<string>>(new Set()) // Key: "leadId-threshold"
    const audioRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        audioRef.current = new Audio('/notification.mp3')
    }, [])

    useEffect(() => {
        const checkAlerts = async () => {
            try {
                // Fetch upcoming leads (e.g., next 24 hours) to cover all thresholds
                const leads = await getUpcomingScheduledLeads()

                if (leads && leads.length > 0) {
                    const now = new Date().getTime()
                    const newAlerts: any[] = []

                    leads.forEach(lead => {
                        const scheduleTime = new Date(lead.schedule_time).getTime()
                        const diffMinutes = Math.floor((scheduleTime - now) / 60000)

                        // Check each threshold
                        ALERT_THRESHOLDS.forEach(threshold => {
                            // Logic: If diff is close to threshold (e.g. within 1 minute tolerance)
                            // And not already processed for this specific threshold.
                            // Allow a small window (e.g., 0 to 1 min late) to ensure we catch it.
                            if (diffMinutes <= threshold && diffMinutes >= threshold - 1) {
                                const alertKey = `${lead.id}-${threshold}`
                                if (!processedAlerts.has(alertKey)) {
                                    newAlerts.push({ ...lead, threshold })

                                    // Mark as processed
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
                                osc.frequency.setValueAtTime(880, ctx.currentTime) // A5
                                osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5) // Drop to A4
                                gain.gain.setValueAtTime(0.5, ctx.currentTime)
                                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)

                                osc.start()
                                osc.stop(ctx.currentTime + 0.5)
                            } catch (e) { console.error('Beep failed', e) }
                        }

                        // Try MP3 first, if defined, else Beep (or both?)
                        // User wants "Guaranteed ... Beep Sound". A synthesized beep is more guaranteed than a file fetch.
                        playBeep()
                        if (audioRef.current) {
                            audioRef.current.play().catch(() => { })
                        }
                    }
                }
            } catch (error) {
                console.error('Alert check failed', error)
            }
        }

        checkAlerts()
        const interval = setInterval(checkAlerts, 60 * 1000) // Check every minute
        return () => clearInterval(interval)
    }, [processedAlerts])

    const removeAlert = (index: number) => {
        setAlerts(prev => prev.filter((_, i) => i !== index))
    }

    if (alerts.length === 0) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md space-y-4">
                {alerts.map((alert, index) => {
                    const time = new Date(alert.schedule_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    const remainingText = alert.threshold === 0 ? 'NOW' :
                        alert.threshold >= 60 ? `${Math.floor(alert.threshold / 60)} Hour(s)` :
                            `${alert.threshold} Minutes`

                    return (
                        <div key={`${alert.id}-${index}`} className="relative overflow-hidden rounded-lg bg-white shadow-xl ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 animate-in zoom-in-95 duration-200">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500"></div>
                            <div className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <h3 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-50">
                                            <Calendar className="h-5 w-5 text-red-500" />
                                            Scheduled Call Alert
                                        </h3>
                                        <p className="font-medium text-red-600 dark:text-red-400">
                                            {remainingText === 'NOW' ? 'Starting Now!' : `Starts in ${remainingText}`}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => removeAlert(index)}
                                        className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 ml-4"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="mt-4 space-y-3 rounded-md bg-zinc-50 p-4 dark:bg-zinc-950/50">
                                    <div>
                                        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Lead Name</p>
                                        <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{alert.lead_name}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-zinc-400" />
                                        <a href={`tel:${alert.phone}`} className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
                                            {alert.phone}
                                        </a>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Scheduled Time</p>
                                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{time}</p>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={() => removeAlert(index)}
                                        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                                    >
                                        Acknowledge
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
    id: string
    message: string
    type: ToastType
}

interface ToastContextType {
    addToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const addToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Math.random().toString(36).substring(7)
        setToasts((prev) => [...prev, { id, message, type }])
    }, [])

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`flex min-w-[300px] items-center gap-3 rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-right-full ${toast.type === 'success'
                                ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300'
                                : toast.type === 'error'
                                    ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300'
                                    : 'border-zinc-200 bg-white text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
                            }`}
                    >
                        {toast.type === 'success' && <CheckCircle2 className="h-5 w-5" />}
                        {toast.type === 'error' && <AlertCircle className="h-5 w-5" />}
                        {toast.type === 'info' && <Info className="h-5 w-5" />}
                        <p className="text-sm font-medium">{toast.message}</p>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="ml-auto rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/10"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <ToastTimer id={toast.id} removeToast={removeToast} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

function ToastTimer({ id, removeToast }: { id: string, removeToast: (id: string) => void }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            removeToast(id)
        }, 5000)
        return () => clearTimeout(timer)
    }, [id, removeToast])
    return null
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}


export function Loader({ className }: { className?: string }) {
    return (
        <div className={`flex items-center justify-center gap-1.5 ${className}`}>
            <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 animate-bounce rounded-full bg-purple-500 [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 animate-bounce rounded-full bg-pink-500"></div>
        </div>
    )
}

export function PageLoader() {
    return (
        <div className="flex h-[50vh] w-full items-center justify-center">
            <Loader className="scale-150" />
        </div>
    )
}

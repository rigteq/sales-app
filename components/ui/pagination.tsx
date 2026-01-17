
'use client'

import { ArrowLeft, ArrowRight } from 'lucide-react'
import clsx from 'clsx'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

export function Pagination({ totalPages }: { totalPages: number }) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const currentPage = Number(searchParams.get('page')) || 1

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams)
        params.set('page', pageNumber.toString())
        return `${pathname}?${params.toString()}`
    }

    return (
        <div className="flex w-full justify-center">
            <div className="flex items-center gap-2">
                <PaginationArrow
                    direction="left"
                    href={createPageURL(currentPage - 1)}
                    isDisabled={currentPage <= 1}
                />

                <div className="flex -space-x-px">
                    {/* Simple pagination for now - can be expanded to show page numbers */}
                    <span className="px-4 py-2 text-sm text-zinc-500 dark:text-zinc-400">
                        Page {currentPage} of {totalPages}
                    </span>
                </div>

                <PaginationArrow
                    direction="right"
                    href={createPageURL(currentPage + 1)}
                    isDisabled={currentPage >= totalPages}
                />
            </div>
        </div>
    )
}

function PaginationArrow({
    href,
    direction,
    isDisabled,
}: {
    href: string
    direction: 'left' | 'right'
    isDisabled?: boolean
}) {
    const className = clsx(
        'flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900',
        {
            'pointer-events-none opacity-50': isDisabled,
            'hover:bg-zinc-100 dark:hover:bg-zinc-800': !isDisabled,
            'mr-2': direction === 'left',
            'ml-2': direction === 'right',
        }
    )

    const icon =
        direction === 'left' ? (
            <ArrowLeft className="w-4" />
        ) : (
            <ArrowRight className="w-4" />
        )

    return isDisabled ? (
        <div className={className}>{icon}</div>
    ) : (
        <Link className={className} href={href}>
            {icon}
        </Link>
    )
}

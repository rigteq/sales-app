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

    // Generate page numbers
    const allPages = generatePagination(currentPage, totalPages)

    return (
        <div className="flex w-full justify-center">
            <div className="flex items-center gap-2">
                <PaginationArrow
                    direction="left"
                    href={createPageURL(currentPage - 1)}
                    isDisabled={currentPage <= 1}
                />

                <div className="flex items-center gap-1">
                    {allPages.map((page, index) => {
                        if (page === '...') {
                            return (
                                <span key={index} className="px-2 text-zinc-500">...</span>
                            )
                        }

                        return (
                            <PaginationNumber
                                key={index}
                                href={createPageURL(page)}
                                page={page}
                                isActive={currentPage === page}
                            />
                        )
                    })}
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

function PaginationNumber({
    page,
    href,
    isActive,
    position,
}: {
    page: number | string
    href: string
    position?: 'first' | 'last' | 'middle' | 'single'
    isActive: boolean
}) {
    const className = clsx(
        'flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors',
        {
            'border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700': isActive,
            'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800': !isActive,
        }
    )

    return (
        <Link href={href} className={className}>
            {page}
        </Link>
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
        'flex h-9 w-9 items-center justify-center rounded-md border text-slate-700 transition-colors dark:text-slate-200',
        {
            'pointer-events-none text-slate-300 dark:text-slate-600 border-slate-200 dark:border-slate-800': isDisabled,
            'hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900': !isDisabled,
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

export const generatePagination = (currentPage: number, totalPages: number) => {
    // If the total number of pages is 7 or less,
    // display all pages without any ellipsis.
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    // If the current page is among the first 3 pages,
    // show the first 3, an ellipsis, and the last 2 pages.
    if (currentPage <= 3) {
        return [1, 2, 3, '...', totalPages - 1, totalPages]
    }

    // If the current page is among the last 3 pages,
    // show the first 2, an ellipsis, and the last 3 pages.
    if (currentPage >= totalPages - 2) {
        return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages]
    }

    // If the current page is somewhere in the middle,
    // show the first page, an ellipsis, the current page and its neighbors,
    // another ellipsis, and the last page.
    return [
        1,
        '...',
        currentPage - 1,
        currentPage,
        currentPage + 1,
        '...',
        totalPages,
    ]
}

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
    // If total pages is small, show all
    if (totalPages <= 13) {
        return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    // Logic: Show [currentPage ... currentPage + 10] then '...' then [last2]
    // But also we need to handle if we are near the end.

    const pages: (number | string)[] = []

    // Start from currentPage
    // "see all pages from i to i+10"
    // We should probably show a window starting at current or slightly before for context? 
    // "on page i, see from i to i+10" -> Strict interpretation.

    // However, usually we want to see previous pages too? 
    // "Smart Pagination (Like LinkedIn showing 10 pages buttons..."
    // LinkedIn usually centers the window.
    // But user gave specific instruction: "on page i, see all pages from i to i+10".
    // I will follow instruction: Start at `i`.

    // Wait, if I am at page 50, and I only see 50..60, I can't go to 49 easily (except Prev button).
    // This UX is slightly weird if literal.
    // "Like LinkedIn showing 10 pages buttons" -> LinkedIn shows: 1 ... 4 5 [6] 7 8 ... 50
    // "Currently to go to 10th page user need to click next button 10 times."
    // User wants to jump 10 pages ahead easily?

    // "i to i+10" implies seeing the *next* 10 pages.
    // Let's implement: [currentPage, ..., currentPage + 9] (10 items), then '...', then [total-1, total].

    let start = currentPage
    let end = start + 9

    // Safety check
    if (end > totalPages) {
        end = totalPages
        // If we are near end, maybe show more previous? 
        // User asked strict "i to i+10". I'll stick to mostly forward looking as requested 
        // to solve the "click next 10 times" issue.
    }

    // Adjust start if we want to show *some* previous context? 
    // User said "on page i, see all pages from i to i+10". 
    // This implies `i` is the first number in the list (besides maybe 1?).
    // "and the last 2 pages".
    // Does not mention first pages.

    // Let's generate range [start, end]
    for (let i = start; i <= end; i++) {
        pages.push(i)
    }

    // Add ellipsis and last 2 if needed
    if (end < totalPages - 2) {
        pages.push('...')
        pages.push(totalPages - 1)
        pages.push(totalPages)
    } else if (end < totalPages) {
        // We are close to end, just append remaining
        for (let i = end + 1; i <= totalPages; i++) {
            pages.push(i)
        }
    }

    // Also, if currentPage > 1, maybe show 1 ...? User didn't ask, but it's standard.
    // "Like LinkedIn... showing 10 pages buttons".
    // If I strictly follow "on page i, see i to i+10", then:
    // Page 1: 1 2 3 4 5 6 7 8 9 10 ... 99 100
    // Page 5: 5 6 7 8 9 10 11 12 13 14 ... 99 100
    // This matches the request.

    return pages
}

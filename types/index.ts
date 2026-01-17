
export type Lead = {
    id: number
    created_by_email_id: string
    lead_name: string
    phone: string
    email: string
    status: string
    location: string | null
    note: string | null
    created_time: string
    last_edited_time: string
    is_deleted: boolean
}

export type Comment = {
    id: number
    lead_id: number
    comment_text: string
    created_by_email_id: string
    status: string | null
    created_time: string
    is_deleted: boolean
}

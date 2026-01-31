
export type Lead = {
    id: number
    created_by_email_id: string
    assigned_to_email_id: string | null
    lead_name: string
    phone: string | null
    secondary_phone: string | null
    email: string | null
    status: string
    location: string | null
    note: string | null
    created_time: string
    last_edited_time: string
    is_deleted: boolean
    schedule_time: string | null
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

export type Profile = {
    id: string
    name: string
    email: string
    phone: string | null
    company_id: string | null
    roleId?: number
}

export type Role = {
    roleId: number
    roleName: string
    createdDate?: string
}

export type Company = {
    id: string
    companyname: string
    companyemail: string | null
    companyphone: string | null
    companydetails: string | null
}

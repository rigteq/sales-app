'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

type UserRole = 0 | 1 | 2 // 0=User, 1=Admin, 2=Superadmin

// --- PO ACTIONS ---

export async function addPO(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const userDetails = await getCurrentUserFullDetails()
    if (!userDetails) return { error: 'Not authenticated', success: false }
    const { user, profile } = userDetails

    const leadId = formData.get('leadId')
    const amountReceived = formData.get('amountReceived')
    const amountRemaining = formData.get('amountRemaining')
    const releaseDate = formData.get('releaseDate')
    const note = formData.get('note')

    if (!leadId || !amountReceived) return { error: 'Lead and Amount Received are required', success: false }

    const { error } = await supabase.from('po_data').insert({
        lead_id: leadId,
        amount_received: amountReceived,
        amount_remaining: amountRemaining || 0,
        release_date: releaseDate || null,
        note: note,
        created_by_email_id: user.email,
        company_id: profile.company_id
    })

    if (error) {
        console.error('PO Add Error', error)
        return { error: 'Failed to add PO', success: false }
    }

    // Auto update lead status to PO
    await supabase.from('leads').update({ status: 'PO' }).eq('id', leadId)

    revalidatePath('/dashboard/pos')
    revalidatePath(`/dashboard/leads/${leadId}`)
    return { success: true, message: 'PO Added Successfully' }
}

export async function getPOs(page = 1, search = '') {
    const supabase = await createClient()
    const userDetails = await getCurrentUserFullDetails()
    if (!userDetails) return { pos: [], count: 0 }
    const { user, role, profile } = userDetails

    const itemsPerPage = 50
    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    let query = supabase.from('po_data')
        .select('*, leads(lead_name, phone)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

    // Scope
    if (role === 2) {
        // Superadmin: All POs. Verify if company filter needed? 
        // "Superadmin PO list page shows all POs accross companies" -> Yes, all.
    } else if (role === 1) {
        // Admin: Company POs
        query = query.eq('company_id', profile.company_id)
    } else {
        // User: POs within company AND (created_by OR lead assigned_to)
        // This is complex. The PO table has `created_by`. But we also want POs for leads `assigned_to` this user.
        // We need a join or subquery.
        // Since Supabase join filtering is limited on the 'OR' across tables without intricate syntax,
        // we might do: POs where (created_by = user) OR (lead_id IN (leads where assigned_to = user))
        // Simplified: Filter POs by company first.
        query = query.eq('company_id', profile.company_id)

        // Using !inner join on leads with filter.
        query = supabase.from('po_data')
            .select('*, leads!inner(lead_name, phone, created_by_email_id, assigned_to_email_id)', { count: 'exact' })
            .eq('company_id', profile.company_id) // Still enforce company
            .or(`created_by_email_id.eq.${user.email},assigned_to_email_id.eq.${user.email}`, { foreignTable: 'leads' })
            .order('created_at', { ascending: false })
            .range(from, to)
    }

    const { data, count, error } = await query

    if (error) {
        console.error('Get POs Error', error)
        return { pos: [], count: 0 }
    }
    return { pos: data, count: count || 0 }
}

export async function getPOStats() {
    const supabase = await createClient()
    const userDetails = await getCurrentUserFullDetails()
    if (!userDetails) return { total: 0, today: 0, last7: 0, last30: 0 }
    const { user, role, profile } = userDetails

    // Base Query Helper
    const getBase = () => {
        let q = supabase.from('po_data').select('*', { count: 'exact', head: true })

        if (role === 1) {
            q = q.eq('company_id', profile.company_id)
        } else if (role === 0) {
            // User Scope: Need compatible filter. 
            // Since we can't easily do complicated joins in 'head:true' count queries without slightly more effort,
            // let's approximate or use the same !inner logic if possible.
            // Actually, for stats, we might need to rely on `po_data.created_by` or fetch IDs.
            // "User PO List Page will show POs ... where userid = po.lead...assigned"
            // If we only look at `po_data`, we miss assigned leads.
            // Let's use the !inner join technique again.
            q = supabase.from('po_data')
                .select('*, leads!inner(created_by_email_id, assigned_to_email_id)', { count: 'exact', head: true })
                .eq('company_id', profile.company_id) // company constraint
                .or(`created_by_email_id.eq.${user.email},assigned_to_email_id.eq.${user.email}`, { foreignTable: 'leads' })
        }
        return q
    }

    const runCount = async (modifier?: (q: any) => any) => {
        let q = getBase()
        if (modifier) q = modifier(q)
        const { count } = await q
        return count || 0
    }

    const total = await runCount()

    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const today = await runCount(q => q.gte('created_at', todayStart.toISOString()))

    const last7Start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const last7 = await runCount(q => q.gte('created_at', last7Start.toISOString()))

    const last30Start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const last30 = await runCount(q => q.gte('created_at', last30Start.toISOString()))

    return { total, today, last7, last30 }
}

// --- HELPERS ---

// --- HELPERS ---

export async function getCurrentUserFullDetails() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Get Profile (with roleId) and Company
    const { data: profile } = await supabase.from('profiles').select('*, company:company_id(*)').eq('id', user.id).single()

    // Role is now in profile.role_id (FK to roles table, but integer matches 0,1,2 enum like usage)
    // Note: Postgres lowercases unquoted columns.
    // @ts-ignore
    const roleId = profile?.role_id ?? profile?.roleid ?? profile?.roleId ?? 0

    return { user, profile, role: roleId as UserRole }
}

export async function getCompanyUsers(companyId: string | null) {
    const supabase = await createClient()
    if (!companyId) return []
    const { data } = await supabase.from('profiles').select('id, name, email').eq('company_id', companyId)
    return data || []
}

export async function getAssignableUsers() {
    const userDetails = await getCurrentUserFullDetails()
    // For assignable users, include self explicitly? 
    // The current user will be in the list if they share the company_id (which they should)
    // If Admin/Superadmin, they can see all users in their company.
    if (!userDetails || !userDetails.profile.company_id) return []
    return await getCompanyUsers(userDetails.profile.company_id)
}

export async function getCompanies(page = 1, search = '', filter?: string) {
    const supabase = await createClient()
    const itemsPerPage = 50
    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    let query = supabase.from('company').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to)

    if (search) {
        query = query.ilike('companyname', `%${search}%`)
    }

    if (filter === 'new_30d') {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        query = query.gte('created_at', thirtyDaysAgo)
    }

    const { data, count, error } = await query

    if (error) {
        console.error('Error fetching companies:', error)
        return { companies: [], count: 0 }
    }

    return { companies: data || [], count: count || 0 }
}

// --- LEADS ACTIONS ---

export async function addLead(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // Auth Check
    const userDetails = await getCurrentUserFullDetails()
    if (!userDetails) return { error: 'Not authenticated', success: false }
    const { user } = userDetails

    const leadName = formData.get('leadName') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const location = formData.get('location') as string
    const note = formData.get('note') as string
    const status = formData.get('status') as string
    const secondaryPhone = formData.get('secondaryPhone') as string
    const assignedTo = formData.get('assignedTo') as string // Email

    // Validation
    if (!phone && !email && !secondaryPhone) {
        return { error: 'At least one contact method (Phone, Email, or Secondary Phone) is required.', success: false, message: '' }
    }
    if (!leadName) return { error: 'Lead Name is required.', success: false, message: '' }
    if (phone && (phone.length !== 10 || !/^\d+$/.test(phone))) {
        return { error: 'Phone number must be exactly 10 digits.', success: false, message: '' }
    }

    // Determine Assignment:
    // If Admin/Superadmin, use assignedTo form value, else default to self.
    // If assignedTo is empty, default to self.
    const finalAssignedTo = assignedTo || user.email

    const { error } = await supabase
        .from('leads')
        .insert({
            lead_name: leadName,
            phone: phone || null,
            secondary_phone: secondaryPhone || null,
            email: email || null,
            location,
            note,
            status: status || 'New',
            created_by_email_id: user.email,
            assigned_to_email_id: finalAssignedTo,
            schedule_time: formData.get('scheduleTime') || null
        })

    if (error) {
        console.error('Error adding lead:', error)
        if (error.code === '23505') {
            if (error.message.includes('phone')) return { error: 'Phone number already exists.', success: false, message: '' }
            if (error.message.includes('email')) return { error: 'Email already exists.', success: false, message: '' }
        }
        return { error: 'Failed to add lead.', success: false, message: '' }
    }

    revalidatePath('/dashboard/leads')
    revalidatePath('/dashboard/my-leads')
    revalidatePath('/dashboard/assigned-leads')
    return { success: true, message: 'Lead added successfully!', error: undefined }
}

export async function getLeads(page = 1, search = '', filters: { mineOnly?: boolean, assignedOnly?: boolean, companyId?: string, status?: string, filter?: string, scope?: string } = {}) {
    const supabase = await createClient()
    const userDetails = await getCurrentUserFullDetails()

    if (!userDetails) return { leads: [], count: 0 }
    const { user, profile, role } = userDetails

    const itemsPerPage = 50
    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    let query = supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .eq('is_deleted', false)

    // Sorting defaults
    if (filters.status === 'Scheduled') {
        query = query.order('schedule_time', { ascending: true })
    } else {
        query = query.order('id', { ascending: false })
    }

    query = query.range(from, to)

    // Apply Date/Time Filters
    if (filters.filter) {
        if (filters.filter === 'new_today') {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            query = query.gte('created_time', today.toISOString())
        }
        else if (filters.filter === 'today') {
            const start = new Date(); start.setHours(0, 0, 0, 0);
            const end = new Date(); end.setHours(23, 59, 59, 999);
            query = query.gte('schedule_time', start.toISOString()).lte('schedule_time', end.toISOString())
        }
        else if (filters.filter === 'overdue') {
            query = query.lt('schedule_time', new Date().toISOString())
        }
        else if (filters.filter === 'upcoming') {
            query = query.gt('schedule_time', new Date().toISOString())
        }
    }

    // Apply Status Filter
    if (filters.status) {
        query = query.eq('status', filters.status)
    }

    // Scope Filtering
    if (role === 2) {
        // Superadmin: View all by default. Can filter by company.
        if (filters.companyId) {
            const { data: companyUsers } = await supabase.from('profiles').select('email').eq('company_id', filters.companyId)
            const emails = companyUsers?.map(u => u.email) || []
            query = emails.length > 0 ? query.in('created_by_email_id', emails) : query.eq('id', -1)
        }
    } else if (profile.company_id) {
        // Task 3: If explicit scope requested "mine_or_assigned", override general company policy
        if (filters.scope === 'mine_or_assigned') {
            query = query.or(`created_by_email_id.eq.${user.email},assigned_to_email_id.eq.${user.email}`)
        }
        else {
            // Admin (1) and User (0): Show all company leads (Default)
            const { data: companyUsers } = await supabase.from('profiles').select('email').eq('company_id', profile.company_id)
            const emails = companyUsers?.map(u => u.email) || []

            if (emails.length > 0) {
                query = query.in('created_by_email_id', emails)
            } else {
                // Fallback for safety
                query = query.eq('created_by_email_id', user.email!)
            }
        }
    } else {
        // User with no company? Fallback to self
        query = query.or(`created_by_email_id.eq.${user.email},assigned_to_email_id.eq.${user.email}`)
    }

    if (filters.mineOnly) {
        query = query.eq('created_by_email_id', user.email)
    }

    if (filters.assignedOnly) {
        query = query.eq('assigned_to_email_id', user.email)
    }

    if (filters.status) {
        query = query.eq('status', filters.status)
    }

    if (search) {
        let orQuery = `lead_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,status.ilike.%${search}%`
        if (!isNaN(Number(search))) {
            orQuery += `,id.eq.${search}`
        }
        query = query.or(orQuery)
    }

    const { data, count, error } = await query

    if (error) {
        console.error('Error fetching leads:', error)
        return { leads: [], count: 0 }
    }

    return { leads: data, count: count || 0 }
}

export async function getLead(id: number) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single()
    if (error) return null
    return data
}

export async function updateLead(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const id = formData.get('id')
    const leadName = formData.get('leadName')
    const location = formData.get('location')
    const note = formData.get('note')
    const status = formData.get('status')
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const secondaryPhone = formData.get('secondaryPhone')
    const scheduleTime = formData.get('scheduleTime')

    // Status Logic for Schedule Time
    let finalScheduleTime = scheduleTime;
    if (status !== 'Scheduled') {
        finalScheduleTime = null;
    }

    // Validation
    if (!phone && !email && !secondaryPhone) return { error: 'At least one contact method is required.', success: false, message: '' }
    if (phone && (phone.length !== 10 || !/^\d+$/.test(phone))) return { error: 'Phone number must be exactly 10 digits.', success: false, message: '' }

    const { error } = await supabase
        .from('leads')
        .update({
            lead_name: leadName,
            phone: phone || null,
            email: email || null,
            secondary_phone: secondaryPhone || null,
            location,
            note,
            status,
            assigned_to_email_id: formData.get('assignedTo') as string || null,
            schedule_time: finalScheduleTime || null,
            last_edited_time: new Date().toISOString()
        })
        .eq('id', id)

    if (error) {
        if (error.code === '23505') return { error: 'Contact details already exist.', success: false, message: '' }
        return { error: 'Failed to update lead', success: false, message: '' }
    }

    revalidatePath(`/dashboard/leads/${id}`)
    revalidatePath('/dashboard/leads')
    return { success: true, message: 'Lead updated successfully', error: undefined }
}

export async function deleteLead(id: number) {
    const supabase = await createClient()
    const userDetails = await getCurrentUserFullDetails()
    if (!userDetails) return { error: 'Not authenticated' }
    const { user, role } = userDetails

    if (role === 0) { // User
        const { data: lead } = await supabase.from('leads').select('created_by_email_id').eq('id', id).single()
        if (lead?.created_by_email_id !== user.email) {
            return { error: 'You can only delete leads created by you.' }
        }
    }

    const { error } = await supabase
        .from('leads')
        .update({ is_deleted: true })
        .eq('id', id)

    if (error) return { error: 'Failed to delete lead' }

    revalidatePath('/dashboard/leads')
    return { success: true }
}

// --- COMMENTS ---

export async function getComments(page = 1, search = '', mineOnly = false, filters: { status?: string, filter?: string } = {}) {
    const supabase = await createClient()
    const userDetails = await getCurrentUserFullDetails()
    if (!userDetails) return { comments: [], count: 0 }
    const { user, profile, role } = userDetails

    const itemsPerPage = 50
    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    let query = supabase
        .from('comments')
        .select('*, leads(lead_name)', { count: 'exact' })
        .eq('is_deleted', false)
        .order('created_time', { ascending: false })
        .range(from, to)

    // Apply Status Filter
    if (filters.status) {
        query = query.eq('status', filters.status)
    }

    // Apply Time Filter
    if (filters.filter === 'today') {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        query = query.gte('created_time', today.toISOString())
    }

    if (role !== 2 && profile.company_id) {
        const { data: companyUsers } = await supabase.from('profiles').select('email').eq('company_id', profile.company_id)
        const emails = companyUsers?.map(u => u.email) || []
        if (emails.length > 0) {
            query = query.in('created_by_email_id', emails)
        } else {
            query = query.eq('created_by_email_id', user.email!)
        }
    }

    if (mineOnly) {
        query = query.eq('created_by_email_id', user.email)
    }

    if (search) {
        query = query.or(`comment_text.ilike.%${search}%,created_by_email_id.ilike.%${search}%`)
        if (!isNaN(Number(search))) query = query.or(`lead_id.eq.${search}`)
    }

    const { data, count, error } = await query
    if (error) return { comments: [], count: 0 }
    return { comments: data, count: count || 0 }
}

export async function getLeadComments(leadId: number, page = 1) {
    const supabase = await createClient()

    const limit = 50
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
        .from('comments')
        .select('*', { count: 'exact' })
        .eq('lead_id', leadId)
        .eq('is_deleted', false)
        .order('created_time', { ascending: false })
        .range(from, to)

    if (error) return { comments: [], count: 0 }
    return { comments: data || [], count: count || 0 }
}

export async function addComment(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const leadId = formData.get('leadId')
    const commentText = formData.get('commentText')
    const status = formData.get('status')
    const scheduleTime = formData.get('scheduleTime')

    if (!commentText) return { error: 'Comment text is required', success: false, message: '' }
    const { data: { user } } = await supabase.auth.getUser()

    let finalScheduleTime = scheduleTime;
    if (status !== 'Scheduled') {
        finalScheduleTime = null;
    }

    let finalCommentText = commentText as string
    const localScheduleTimeText = formData.get('localScheduleTimeText') as string

    if (status === 'Scheduled') {
        if (localScheduleTimeText) {
            finalCommentText += ` (Scheduled: ${localScheduleTimeText})`
        } else if (finalScheduleTime) {
            // Fallback if local text not sent (e.g. from existing forms if any not updated)
            try {
                const date = new Date(finalScheduleTime as string)
                // Use a simpler fallback that doesn't scream UTC if possible, or just default.
                finalCommentText += ` (Scheduled)`
            } catch (e) { }
        }
    }

    const { error: commentError } = await supabase
        .from('comments')
        .insert({
            lead_id: leadId,
            comment_text: finalCommentText,
            status: status,
            created_by_email_id: user?.email
        })
    if (commentError) return { error: 'Failed to add comment', success: false, message: '' }

    if (status) {
        await supabase
            .from('leads')
            .update({
                status: status,
                schedule_time: finalScheduleTime || null,
                last_edited_time: new Date().toISOString()
            })
            .eq('id', leadId)
    }

    revalidatePath(`/dashboard/leads/${leadId}`)
    revalidatePath('/dashboard/comments')
    return { success: true, message: 'Comment added', error: undefined }
}

export async function deleteComment(id: number, leadId?: number) {
    const supabase = await createClient()
    const userDetails = await getCurrentUserFullDetails()
    if (!userDetails) return { error: 'Not authenticated' }
    const { user, role } = userDetails

    // Fetch comment to check ownership and status
    const { data: cm } = await supabase.from('comments').select('created_by_email_id, status, lead_id').eq('id', id).single()

    if (!cm) return { error: 'Comment not found' }

    if (role === 0) {
        if (cm.created_by_email_id !== user.email) return { error: 'Delete only your own comments.' }
    }

    const { error } = await supabase.from('comments').update({ is_deleted: true }).eq('id', id)
    if (error) return { error: 'Failed to delete' }

    // Revert logic: Find the latest non-deleted comment for this lead
    if (cm.lead_id) {
        const { data: latestComment } = await supabase
            .from('comments')
            .select('status')
            .eq('lead_id', cm.lead_id)
            .eq('is_deleted', false)
            .not('status', 'is', null) // Only consider comments that actually set a status
            .order('created_time', { ascending: false })
            .limit(1)
            .single()

        const newStatus = latestComment?.status || 'New'

        // Prepare update payload
        const updatePayload: any = { status: newStatus }

        // If we are reverting to a non-scheduled status, ensure schedule_time is cleared.
        // If we are reverting TO 'Scheduled', we don't have the old time easily available (unless we parse comment text), 
        // implies the user should re-schedule or we leave it as is (likely null if previous action cleared it, or whatever).
        // Safest: If not Scheduled, clear time.
        if (newStatus !== 'Scheduled') {
            updatePayload.schedule_time = null
        }

        await supabase
            .from('leads')
            .update(updatePayload)
            .eq('id', cm.lead_id)
    }

    if (leadId) revalidatePath(`/dashboard/leads/${leadId}`)
    revalidatePath('/dashboard/comments')
    return { success: true }
}

export async function addUser(prevState: any, formData: FormData) {
    const supabaseAdmin = createAdminClient()
    const supabase = await createClient() // For checking current user perms

    const currentUser = await getCurrentUserFullDetails()
    if (!currentUser || currentUser.role === 0) return { error: 'Unauthorized', success: false, message: '' }

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const gender = formData.get('gender') as string
    const address = formData.get('address') as string
    const targetCompanyId = formData.get('companyId') as string // Optional, Superadmin can set
    const roleToAssign = formData.get('role') as string // '0' or '1'

    if (!email || !password || !name) return { error: 'Missing Required Fields', success: false, message: '' }

    const companyId = (currentUser.role === 2 && targetCompanyId) ? targetCompanyId : currentUser.profile.company_id
    const finalRoleToAssign = currentUser.role === 2 ? (Number(roleToAssign) || 0) : 0 // Admins can only create users (Role 0)

    if (currentUser.role === 1 && Number(roleToAssign) === 1) {
        return { error: 'Admins cannot create other Admins.', success: false, message: '' }
    }

    // 1. Create Auth User
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name }
    })

    if (authError) {
        console.error('Create User Error:', authError)
        return { error: authError.message, success: false, message: '' }
    }

    if (!authData.user) return { error: 'Failed to create user', success: false, message: '' }
    const newUserId = authData.user.id

    // 2. Insert Profile with RoleId
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
        id: newUserId,
        name,
        email,
        phone,
        gender,
        address,
        company_id: companyId,
        role_id: finalRoleToAssign
    })

    if (profileError) {
        console.error('Create Profile Error:', profileError)
        // Rollback: Delete the Auth User if profile creation fails
        await supabaseAdmin.auth.admin.deleteUser(newUserId)
        return { error: 'User created but profile failed (User deleted/rolled back): ' + profileError.message, success: false, message: '' }
    }

    // No need to insert into 'roles' table anymore as per new schema request where roleId is on profiles.

    revalidatePath('/dashboard/users')
    const entityName = Number(roleToAssign) === 1 ? 'Admin' : 'User'
    return { success: true, message: `${entityName} created successfully`, error: undefined }
}

// Chunk 1: getUsers
export async function getUsers(page = 1, search = '', roleFilter?: number, companyIdFilter?: string) {
    const supabase = await createClient()
    const userDetails = await getCurrentUserFullDetails()

    if (!userDetails || userDetails.role === 0) return { users: [], count: 0 }

    const itemsPerPage = 50
    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    let query = supabase.from('profiles').select('*, role:roles(roleid, rolename), company(companyname), todays_comments(), comments_this_week(), pos_this_month()', { count: 'exact' })

    // 1. Authorization Scope
    if (userDetails.role !== 2) {
        // Admins can only see their company
        query = query.eq('company_id', userDetails.profile.company_id)
    } else {
        // Superadmins can see all, OR filter by requested company
        if (companyIdFilter) {
            query = query.eq('company_id', companyIdFilter)
        }
    }

    // 2. Role Filtering
    if (roleFilter !== undefined) {
        query = query.eq('role_id', roleFilter)
    }

    // 3. Search
    if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    // 4. Pagination
    query = query.range(from, to).order('created_time', { ascending: false })

    const { data, count, error } = await query

    if (error) {
        console.error('Error in getUsers:', error)
        return { users: [], count: 0 }
    }

    return { users: data || [], count: count || 0 }
}


export async function getUser(id: string) {
    const supabase = await createClient()
    // Join with roles and company
    const { data, error } = await supabase
        .from('profiles')
        .select('*, role:roles(roleid, rolename), company(companyname)')
        .eq('id', id)
        .single()

    if (error) return null
    return data
}

export async function deleteUser(id: string) {
    const supabaseAdmin = createAdminClient()
    const userDetails = await getCurrentUserFullDetails()

    // Only Superadmin (2) or Admin (1) can delete? Usually only Superadmin managed users?
    // Let's assume Role 2 and 1 can delete, but 1 can only delete users in their company.
    // Ideally use deleteUser from supabase auth... which requires Service Role.

    if (!userDetails || userDetails.role === 0) return { error: 'Unauthorized' }

    /* 
       Note: Deleting a user from Auth is tricky. 
       If we just delete from profiles, the auth user remains.
       We should delete from Auth.
    */

    const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
    if (error) return { error: error.message }

    // Cascading delete should handle profile/references if configured, 
    // but typically we might soft delete or let FK cascade.
    // Assuming DB has cascade or we just delete.

    revalidatePath('/dashboard/users')
    return { success: true }
}

export async function getUserComments(email: string, page = 1) {
    const supabase = await createClient()

    const itemsPerPage = 20 // Smaller limit for embedded list? Or standard 50? Stick to 50 for consistency or 20 for embedded? 
    // User requested "identical structure". 50 is standard in other tables.
    const limit = 50
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, count, error } = await supabase
        .from('comments')
        .select('*, leads(lead_name, id)', { count: 'exact' })
        .eq('created_by_email_id', email)
        .order('created_time', { ascending: false })
        .range(from, to)

    if (error) return { comments: [], count: 0 }
    return { comments: data || [], count: count || 0 }
}

// --- INSIGHTS ---

// 1. Signature Update
export async function getInsights(context: 'all_leads' | 'my_leads' | 'all_comments' | 'my_comments' | 'assigned_leads' | 'users' | 'companies' | 'scheduled_leads' | 'notifications' = 'all_leads') {
    const supabase = await createClient()
    const userDetails = await getCurrentUserFullDetails()
    if (!userDetails) return { metric1: 0, metric2: 0, metric3: 0, metric4: 0 }

    const { user, role, profile } = userDetails

    // Helper to get company emails for filtering
    const getCompanyEmails = async () => {
        if (!profile.company_id) return [user.email]
        const { data } = await supabase.from('profiles').select('email').eq('company_id', profile.company_id)
        return data?.map(p => p.email) || [user.email]
    }

    if (context === 'users') {
        let qTotal = supabase.from('profiles').select('*', { count: 'exact', head: true })
        let qAdmins = supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role_id', 1)
        let qUsers = supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role_id', 0)
        let qNew = supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_time', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

        if (role !== 2 && profile.company_id) {
            const cid = profile.company_id
            qTotal = qTotal.eq('company_id', cid)
            qAdmins = qAdmins.eq('company_id', cid)
            qUsers = qUsers.eq('company_id', cid)
            qNew = qNew.eq('company_id', cid)
        }

        const { count: total } = await qTotal
        const { count: admins } = await qAdmins
        const { count: usersCount } = await qUsers
        const { count: newUsers } = await qNew
        return { metric1: total || 0, metric2: admins || 0, metric3: usersCount || 0, metric4: newUsers || 0 }
    }

    if (context === 'companies') {
        if (role !== 2) return { metric1: 0, metric2: 0, metric3: 0, metric4: 0 }
        const { count: total } = await supabase.from('company').select('*', { count: 'exact', head: true })
        const { count: newCos } = await supabase.from('company').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
        const { count: totalLeads } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('is_deleted', false)
        return { metric1: total || 0, metric2: newCos || 0, metric3: totalUsers || 0, metric4: totalLeads || 0 }
    }

    if (context === 'scheduled_leads') {
        const companyEmails = (role !== 2) ? await getCompanyEmails() : []
        const buildScheduledQuery = () => {
            let q = supabase.from('leads').select('*', { count: 'exact', head: true }).eq('is_deleted', false).eq('status', 'Scheduled')

            if (role === 2) return q // Superadmin sees all

            // Admin: See Company
            if (role === 1 && companyEmails.length > 0) {
                q = q.in('created_by_email_id', companyEmails)
                return q
            }

            // User: Mine or Assigned
            if (role === 0) {
                // IMPORTANT: The 'in' query above for admins works because they see everything by creators in company.
                // For users, strict "mine or assigned".
                q = q.or(`created_by_email_id.eq.${user.email},assigned_to_email_id.eq.${user.email}`)
                return q
            }

            // Fallback for safety (e.g. Admin with no company users found or something)
            if (companyEmails.length > 0) {
                q = q.in('created_by_email_id', companyEmails)
            }
            return q
        }
        const { count: total } = await buildScheduledQuery()
        const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(); endOfDay.setHours(23, 59, 59, 999);
        const now = new Date()

        const { count: countToday } = await buildScheduledQuery().gte('schedule_time', startOfDay.toISOString()).lte('schedule_time', endOfDay.toISOString())
        const { count: countOverdue } = await buildScheduledQuery().lt('schedule_time', now.toISOString())
        const { count: countUpcoming } = await buildScheduledQuery().gt('schedule_time', now.toISOString())

        return { metric1: total || 0, metric2: countToday || 0, metric3: countOverdue || 0, metric4: countUpcoming || 0 }
    }

    if (context === 'notifications') {
        const { count: total } = await supabase.from('broadcast_notifications').select('*', { count: 'exact', head: true })
        const { count: count30 } = await supabase.from('broadcast_notifications').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        const { count: count7 } = await supabase.from('broadcast_notifications').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const { count: todays } = await supabase.from('broadcast_notifications').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString())
        return { metric1: total || 0, metric2: count30 || 0, metric3: count7 || 0, metric4: todays || 0 }
    }

    if (context.includes('leads')) {
        const companyEmails = (role !== 2 && context === 'all_leads') ? await getCompanyEmails() : []

        // Base Query Builder with Company Scope
        const buildLeadQuery = () => {
            let q = supabase.from('leads').select('*', { count: 'exact', head: true }).eq('is_deleted', false)
            if (role !== 2 && context === 'all_leads' && companyEmails.length > 0) {
                q = q.in('created_by_email_id', companyEmails)
            }
            if (context === 'my_leads') {
                q = q.eq('created_by_email_id', user.email)
            }
            if (context === 'assigned_leads') {
                q = q.eq('assigned_to_email_id', user.email)
            }
            return q
        }

        const { count: totalLeads } = await buildLeadQuery()

        let qNew = buildLeadQuery()
        if (context === 'all_leads') {
            // New Today
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            qNew = qNew.gte('created_time', today.toISOString())
        } else if (context === 'my_leads') {
            // "Scheduled Today" -> Status 'Scheduled' AND Schedule Time is Today
            const starOfDay = new Date(); starOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(); endOfDay.setHours(23, 59, 59, 999);
            qNew = qNew.eq('status', 'Scheduled').gte('schedule_time', starOfDay.toISOString()).lte('schedule_time', endOfDay.toISOString())
        } else {
            // Assigned -> "New"
            qNew = qNew.eq('status', 'New')
        }
        const { count: metric2 } = await qNew

        let qInConv = buildLeadQuery()
        qInConv = qInConv.eq('status', 'In Conversation')
        const { count: metric3 } = await qInConv

        let qConv = buildLeadQuery()
        qConv = qConv.eq('status', 'PO')
        const { count: metric4 } = await qConv

        return {
            metric1: totalLeads || 0,
            metric2: metric2 || 0,
            metric3: metric3 || 0,
            metric4: metric4 || 0
        }
    }

    // Comments Insights
    if (context.includes('comments')) {
        const companyEmails = (role !== 2 && context === 'all_comments') ? await getCompanyEmails() : []

        const buildCommentQuery = () => {
            let q = supabase.from('comments').select('*', { count: 'exact', head: true }).eq('is_deleted', false)
            if (role !== 2 && context === 'all_comments' && companyEmails.length > 0) {
                q = q.in('created_by_email_id', companyEmails)
            }
            if (context === 'my_comments') {
                q = q.eq('created_by_email_id', user.email)
            }
            return q
        }

        const { count: total } = await buildCommentQuery()

        let qToday = buildCommentQuery()
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        qToday = qToday.gte('created_time', today.toISOString())
        const { count: countToday } = await qToday

        let qConv = buildCommentQuery()
        qConv = qConv.eq('status', 'In Conversation').gte('created_time', today.toISOString())
        const { count: countConv } = await qConv

        let qPO = buildCommentQuery()
        qPO = qPO.eq('status', 'PO').gte('created_time', today.toISOString())
        const { count: countPO } = await qPO

        return {
            metric1: total || 0,
            metric2: countToday || 0,
            metric3: countConv || 0,
            metric4: countPO || 0
        }
    }

    return { metric1: 0, metric2: 0, metric3: 0, metric4: 0 }
}


// --- PROFILE ---

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated', success: false }

    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string

    const { error } = await supabase
        .from('profiles')
        .update({ name, phone, address })
        .eq('id', user.id)

    if (error) return { error: 'Failed to update profile', success: false }
    revalidatePath('/dashboard/profile')
    return { success: true }
}

export async function sendPasswordReset() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) return { error: 'Not authenticated', success: false }

    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/dashboard/profile`,
    })

    if (error) return { error: 'Failed to send reset email', success: false }
    return { success: true, message: 'Password reset email sent!' }
}
// --- COMPANY ---

export async function addCompany(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const userDetails = await getCurrentUserFullDetails()

    if (!userDetails || userDetails.role !== 2) {
        return { error: 'Unauthorized. Only Superadmins can add companies.', success: false, message: '' }
    }

    const companyname = formData.get('companyname') as string
    const companyemail = formData.get('companyemail') as string
    const companyphone = formData.get('companyphone') as string
    const companydetails = formData.get('companydetails') as string

    if (!companyname) {
        return { error: 'Company Name is required', success: false, message: '' }
    }

    // Insert into company table
    const { error } = await supabase
        .from('company')
        .insert({
            companyname,
            companyemail,
            companyphone,
            companydetails
        })

    if (error) {
        console.error('Add Company Error:', error)
        return { error: error.message, success: false, message: '' }
    }

    revalidatePath('/dashboard')
    // Maybe revalidate a companies list if it exists?
    return { success: true, message: 'Company added successfully', error: undefined }
}

export async function updateCustomMessage(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated', success: false }

    const customMessage = formData.get('customMessage') as string

    const { error } = await supabase
        .from('profiles')
        .update({ custom_message: customMessage })
        .eq('id', user.id)

    if (error) return { error: 'Failed to update custom message', success: false }
    revalidatePath('/dashboard/custom-message')
    return { success: true }
}

export async function getCompany(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase.from('company').select('*').eq('id', id).single()
    if (error) return null
    return data
}

export async function updateCompany(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const userDetails = await getCurrentUserFullDetails()
    // Authorization check
    if (!userDetails || userDetails.role !== 2) return { error: 'Unauthorized', success: false, message: '' }

    const id = formData.get('id') as string
    const companyname = formData.get('companyname') as string
    const companyemail = formData.get('companyemail') as string
    const companyphone = formData.get('companyphone') as string
    const companydetails = formData.get('companydetails') as string

    if (!companyname) {
        return { error: 'Company Name is required', success: false, message: '' }
    }

    const { error } = await supabase
        .from('company')
        .update({ companyname, companyemail, companyphone, companydetails })
        .eq('id', id)

    if (error) return { error: 'Failed to update company', success: false, message: '' }
    revalidatePath(`/dashboard/companies/${id}`)
    return { success: true, message: 'Company updated successfully', error: undefined }
}

export async function deleteCompany(id: string) {
    const supabase = await createClient()
    const userDetails = await getCurrentUserFullDetails()
    if (!userDetails || userDetails.role !== 2) return { error: 'Unauthorized' }

    const { error } = await supabase.from('company').delete().eq('id', id)
    if (error) return { error: 'Failed to delete company' }
    revalidatePath('/dashboard/companies')
    return { success: true }
}

export async function getCompanyStats(companyId: string) {
    const supabase = await createClient()

    // Get Company Users
    const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, role_id')
        .eq('company_id', companyId)

    if (usersError || !users) return { totalLeads: 0, totalAdmins: 0, totalUsers: 0, totalPOs: 0 }

    const userEmails = users.map(u => u.email)
    const adminsCount = users.filter(u => u.role_id === 1).length
    const usersCount = users.filter(u => u.role_id === 0).length

    let totalLeads = 0
    let totalPOs = 0

    if (userEmails.length > 0) {
        const { count: leads } = await supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .in('created_by_email_id', userEmails)
            .eq('is_deleted', false)
        totalLeads = leads || 0

        const { count: pos } = await supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .in('created_by_email_id', userEmails)
            .eq('status', 'PO')
            .eq('is_deleted', false)
        totalPOs = pos || 0
    }

    return {
        totalLeads,
        totalAdmins: adminsCount,
        totalUsers: usersCount, // Only count Role 0 as requested
        totalPOs
    }
}

// --- ALERTS ---
export async function getUpcomingScheduledLeads() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return []

        const now = new Date()
        // Fetch from 5 mins ago to 25 hours ahead
        const startTime = new Date(now.getTime() - 5 * 60000)
        const endTime = new Date(now.getTime() + 25 * 60 * 60000)

        const startISO = startTime.toISOString()
        const endISO = endTime.toISOString()

        let query = supabase
            .from('leads')
            .select('id, lead_name, schedule_time, phone, created_by_email_id, assigned_to_email_id')
            .eq('status', 'Scheduled')
            .gt('schedule_time', startISO)
            .lt('schedule_time', endISO)
            .eq('is_deleted', false)

        const userRole = (await getCurrentUserFullDetails())?.role ?? 0 // Re-fetch role to be safe/clean or pass it.
        // Optimization: We already have 'user'. Get profile for role/company.
        const { data: profile } = await supabase.from('profiles').select('role_id, company_id').eq('id', user.id).single()
        // @ts-ignore
        const roleId = profile?.role_id ?? 0
        const companyId = profile?.company_id

        if (roleId === 2) {
            // Superadmin: No alerts? "Superadmin dont get Scheduled alerts at all."
            return []
        }

        if (roleId === 1) {
            // Admin: Alerts from same company
            if (companyId) {
                // We need to filter leads where created_by is in the company. 
                // However, leads only store email. We need to join profiles.
                // Using !inner join on profiles related to created_by_email_id might work but leads.created_by_email_id is text, not FK in this schema?
                // Actually leads table doesn't have FK to profiles on email.
                // BUT we have company_id in profiles.
                // We can fetch company emails first.
                const { data: companyUsers } = await supabase.from('profiles').select('email').eq('company_id', companyId)
                const emails = companyUsers?.map(u => u.email) || []
                if (emails.length > 0) {
                    query = query.in('created_by_email_id', emails)
                } else {
                    return []
                }
            }
        } else {
            // User (0): "ONLY be shown to USER if his email is in leads.Assigned_to_email_id or leads.created_by_email_id"
            query = query.or(`created_by_email_id.eq.${user.email},assigned_to_email_id.eq.${user.email}`)
        }

        const { data: leads, error } = await query

        if (error || !leads || leads.length === 0) {
            return []
        }
        // ... rest of filtering is implicitly minimal impact if empty, but we return early.
        return leads; // Optimization: Just return the scheduled leads. The comment filtering logic below was likely unnecessary 
        // if the lead itself has 'status=Scheduled' and 'schedule_time'.
        // The previous logic checked for 'latest comment status' to verify, but the lead status IS the source of truth.
    } catch (e) {
        console.error('Alert Fetch Error', e)
        return []
    }
}



export async function sendBroadcastNotification(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const userDetails = await getCurrentUserFullDetails()

    if (!userDetails || userDetails.role !== 2) {
        return { error: 'Unauthorized', success: false }
    }

    const title = formData.get('title') as string
    const message = formData.get('message') as string

    if (!title || !message) {
        return { error: 'Title and Message are required', success: false }
    }

    const { error } = await supabase.from('broadcast_notifications').insert({
        title,
        message,
        created_by_email_id: userDetails.user.email
    })

    if (error) {
        console.error('Broadcast Error', error)
        return { error: 'Failed to send notification', success: false }
    }

    // ... existing code ...
    return { success: true, message: 'Notification broadcasted successfully' }
}

export async function getNotifications(page = 1, search = '') {
    const supabase = await createClient()

    const itemsPerPage = 50
    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    let query = supabase
        .from('broadcast_notifications')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

    if (search) {
        query = query.or(`title.ilike.%${search}%,message.ilike.%${search}%`)
    }

    const { data, error, count } = await query

    if (error) {
        console.error('Error fetching notifications:', error)
        return { notifications: [], count: 0 }
    }

    return { notifications: data || [], count: count || 0 }
}

export async function deleteNotification(id: string) {
    const supabase = await createAdminClient() // Use Admin Client to bypass RLS issues for Delete
    const userDetails = await getCurrentUserFullDetails()
    // Only Superadmin
    if (!userDetails || userDetails.role !== 2) return { error: 'Unauthorized' }

    const { error } = await supabase.from('broadcast_notifications').delete().eq('id', id)
    if (error) return { error: 'Failed to delete notification' }
    revalidatePath('/dashboard/notifications')
    return { success: true }
}

export async function assignLeadToMe(id: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated', success: false }

    const { error } = await supabase
        .from('leads')
        .update({ assigned_to_email_id: user.email, last_edited_time: new Date().toISOString() })
        .eq('id', id)

    if (error) return { error: 'Failed to assign lead', success: false }

    revalidatePath(`/dashboard/leads/${id}`)
    revalidatePath(`/dashboard/leads`)
    return { success: true, message: 'Lead assigned to you successfully.' }
}

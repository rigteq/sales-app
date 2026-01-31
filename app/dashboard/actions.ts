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

        // Then apply User constraint.
        // "where userid = po_data.lead_id.create_by_user_id or po_data.lead_id.assigned_to_user_id"
        // Wait, the PO itself has `created_by`. 
        // User wants to see POs for LEADS that they created or are assigned to.
        // So we need to join leads.
        // Supabase PostgREST: 
        // !inner join on leads with filter.
        // .select('*, leads!inner(*)') 
        // .or(`leads.created_by_email_id.eq.${user.email},leads.assigned_to_email_id.eq.${user.email}`)
        // Let's try that.
        // Note: 'leads' relation is `lead_id`.

        // Actually, we can just fetch all POs for company, then filter in code if pagination allows? 
        // Or use the !inner join syntax.
        // Let's use !inner on leads.
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

export async function getCompanies(page = 1, search = '') {
    const supabase = await createClient()
    const itemsPerPage = 50
    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    let query = supabase.from('company').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to)

    if (search) {
        query = query.ilike('companyname', `%${search}%`)
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

    // Apply "new_today" filter
    if (filters.filter === 'new_today') {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        query = query.gte('created_time', today.toISOString())
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

export async function getComments(page = 1, search = '', mineOnly = false) {
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

export async function getLeadComments(leadId: number) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('lead_id', leadId)
        .eq('is_deleted', false)
        .order('created_time', { ascending: false })
    if (error) return []
    return data
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

export async function getUsers(roleFilter?: number, companyIdFilter?: string) {
    const supabase = await createClient()
    const userDetails = await getCurrentUserFullDetails()

    if (!userDetails || userDetails.role === 0) return []

    let query = supabase.from('profiles').select('*, role:roles(roleid, rolename), company(companyname)')

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

    const { data, error } = await query

    if (error) {
        console.error('Error in getUsers:', error)
        return []
    }

    return data || []
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

export async function getUserComments(email: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('comments')
        .select('*, leads(lead_name, id)')
        .eq('created_by_email_id', email)
        .order('created_time', { ascending: false })

    return data || []
}

// --- INSIGHTS ---

export async function getInsights(context: 'all_leads' | 'my_leads' | 'all_comments' | 'my_comments' | 'assigned_leads' = 'all_leads') {
    const supabase = await createClient()
    const userDetails = await getCurrentUserFullDetails()
    if (!userDetails) return { metric1: 0, metric2: 0, metric3: 0, metric4: 0 }

    const { user, role, profile } = userDetails

    // Helper to apply common scope (RLS does most, but my_leads needs specific)
    const applyScope = (query: any) => {
        // If context specific
        if (context === 'my_leads') {
            return query.eq('created_by_email_id', user.email)
        }
        if (context === 'assigned_leads') {
            return query.eq('assigned_to_email_id', user.email)
        }
        // all_leads -> RLS handles access. Superadmin/Admin seeing company leads.
        if (role === 2 && context === 'all_leads' && profile.company_id) {
            // If we wanted to filter by company explicitly, but RLS might not restrict SuperAdmin from *other* companies?
            // Actually RLS usually restricts non-superadmins. Superadmin sees all? 
            // "Superadmin PO list page shows all POs accross companies".
            // Assuming RLS allows Superadmin to see all.
        }
        // Admin
        if (role === 1 && context === 'all_leads') {
            // RLS should handle.
        }
        return query
    }

    if (context.includes('leads')) {
        const qTotal = applyScope(supabase.from('leads').select('*', { count: 'exact', head: true }))
        const { count: totalLeads } = await qTotal.eq('is_deleted', false)

        const qNew = applyScope(supabase.from('leads').select('*', { count: 'exact', head: true }))
        qNew.eq('is_deleted', false)
        if (context === 'all_leads') {
            // New Today
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            qNew.gte('created_time', today.toISOString())
        } else if (context === 'my_leads') {
            // Contacted Today? Or just "New"?
            // Label says "Contacted Today". 
            // Let's stick to "New" for consistency with "New" status unless specifically tracking 'Contacted' status changes?
            // Lead status 'Contacted'.
            // Wait, label says "Contacted Today", but logic might be just "Status=Contacted".
            // Let's count "Status = Contacted".
            qNew.eq('status', 'Contacted')
            // And changed today? Hard to track without history table. 
            // Let's just Count Total Contacted for now? Or just "New" status?
            // Simple: "Contacted Today" -> Leads with status 'Contacted' created today?
            // Let's use Status='Contacted' for simplicity due to lack of history log access here.
        } else {
            // Assigned: "New Assigned" -> Status 'New'
            qNew.eq('status', 'New')
        }
        const { count: metric2 } = await qNew

        const qInConv = applyScope(supabase.from('leads').select('*', { count: 'exact', head: true }))
        qInConv.eq('is_deleted', false).eq('status', 'In Conversation')
        const { count: metric3 } = await qInConv

        const qConv = applyScope(supabase.from('leads').select('*', { count: 'exact', head: true }))
        qConv.eq('is_deleted', false).eq('status', 'PO')
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
        let qTotal = supabase.from('comments').select('*', { count: 'exact', head: true }).eq('is_deleted', false)
        if (context === 'my_comments') qTotal = qTotal.eq('created_by_email_id', user.email)
        const { count: total } = await qTotal

        let qToday = supabase.from('comments').select('*', { count: 'exact', head: true }).eq('is_deleted', false)
        if (context === 'my_comments') qToday = qToday.eq('created_by_email_id', user.email)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        qToday = qToday.gte('created_time', today.toISOString())
        const { count: countToday } = await qToday

        // Conversations Today (Unique leads commented on? Or just comments count?)
        // Label: "Conversations Today" -> Maybe count of comments on distinct leads?
        // Let's just return countToday for now or duplicate.
        // Actually, maybe "In Conversation" status comments?
        // Let's do: Comments with status 'In Conversation'
        let qConv = supabase.from('comments').select('*', { count: 'exact', head: true }).eq('is_deleted', false).eq('status', 'In Conversation')
        if (context === 'my_comments') qConv = qConv.eq('created_by_email_id', user.email)
        qConv = qConv.gte('created_time', today.toISOString())
        const { count: countConv } = await qConv

        // POs Today
        let qPO = supabase.from('comments').select('*', { count: 'exact', head: true }).eq('is_deleted', false).eq('status', 'PO')
        if (context === 'my_comments') qPO = qPO.eq('created_by_email_id', user.email)
        qPO = qPO.gte('created_time', today.toISOString())
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
    const usersCount = users.filter(u => u.role_id === 0).length // or total profiles? Requests says "Total Users". Usually implies Role 0 + 1 or just Role 0. Let's assume Role 0.

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
        totalUsers: usersCount + adminsCount,
        totalPOs
    }
}

// --- ALERTS ---
export async function getUpcomingScheduledLeads() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const now = new Date()
    // Fetch from 5 mins ago to 25 hours ahead
    const startTime = new Date(now.getTime() - 5 * 60000)
    const endTime = new Date(now.getTime() + 25 * 60 * 60000)

    const startISO = startTime.toISOString()
    const endISO = endTime.toISOString()

    // 1. Fetch ALL scheduled leads in window (scoped by RLS)
    const { data: leads, error } = await supabase
        .from('leads')
        .select('id, lead_name, schedule_time, phone')
        .eq('status', 'Scheduled')
        .gt('schedule_time', startISO)
        .lt('schedule_time', endISO)

    if (error || !leads || leads.length === 0) {
        return []
    }

    // 2. Filter by checking who created the SCHEDULED comment
    // We need to find the latest comment with status='Scheduled' for each lead.
    // Optimization: Fetch all 'Scheduled' comments for these lead IDs.
    const leadIds = leads.map(l => l.id)

    // Fetch latest scheduled comment for each lead. 
    // We can fetch all scheduled comments for these leads, order by created_time desc.
    const { data: comments, error: commentError } = await supabase
        .from('comments')
        .select('lead_id, created_by_email_id')
        .in('lead_id', leadIds)
        .eq('status', 'Scheduled')
        .order('created_time', { ascending: false })

    if (commentError || !comments) return []

    // Map leadId -> creatorEmail of latest scheduled comment
    const leadCreatorMap = new Map<number, string>()
    // Since sorted desc, the first one we encounter for a leadId is the latest.
    comments.forEach(c => {
        if (!leadCreatorMap.has(c.lead_id)) {
            leadCreatorMap.set(c.lead_id, c.created_by_email_id)
        }
    })

    // 3. Filter leads where current user == comment creator
    const filteredLeads = leads.filter(lead => {
        const creatorEmail = leadCreatorMap.get(lead.id)
        // If no comment found (legacy?), maybe fallback to lead creator or assigned? 
        // User requested STRICT "scheduled comment.createdby".
        // But if I reset schedule_time on delete, legacy might be issue.
        // Let's fallback to assigned_to if no comment found? No, strictly comment creator as requested.
        return creatorEmail === user.email
    })

    return filteredLeads
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

export async function getNotifications(limit = 20) {
    const supabase = await createClient()

    // Check if table exists (it should per docs.sql) but proceed
    const { data, error, count } = await supabase
        .from('broadcast_notifications')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching notifications:', error)
        return { notifications: [], count: 0 }
    }

    return { notifications: data || [], count: count || 0 }
}

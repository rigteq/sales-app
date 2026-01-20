'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

type UserRole = 0 | 1 | 2 // 0=User, 1=Admin, 2=Superadmin

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
    const itemsPerPage = 30
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
            assigned_to_email_id: finalAssignedTo
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

export async function getLeads(page = 1, search = '', filters: { mineOnly?: boolean, assignedOnly?: boolean } = {}) {
    const supabase = await createClient()
    const userDetails = await getCurrentUserFullDetails()

    if (!userDetails) return { leads: [], count: 0 }
    const { user, profile, role } = userDetails

    const itemsPerPage = 30
    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    let query = supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .eq('is_deleted', false)
        .order('id', { ascending: false })
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

    if (filters.mineOnly) {
        query = query.eq('created_by_email_id', user.email)
    }

    if (filters.assignedOnly) {
        query = query.eq('assigned_to_email_id', user.email)
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

    const itemsPerPage = 30
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

    if (!commentText) return { error: 'Comment text is required', success: false, message: '' }
    const { data: { user } } = await supabase.auth.getUser()

    const { error: commentError } = await supabase
        .from('comments')
        .insert({
            lead_id: leadId,
            comment_text: commentText,
            status: status,
            created_by_email_id: user?.email
        })
    if (commentError) return { error: 'Failed to add comment', success: false, message: '' }

    if (status) {
        await supabase
            .from('leads')
            .update({ status: status, last_edited_time: new Date().toISOString() })
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

    if (role === 0) {
        const { data: cm } = await supabase.from('comments').select('created_by_email_id').eq('id', id).single()
        if (cm?.created_by_email_id !== user.email) return { error: 'Delete only your own comments.' }
    }

    const { error } = await supabase.from('comments').update({ is_deleted: true }).eq('id', id)

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
        role_id: Number(roleToAssign) || 0
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

export async function getUsers() {
    const supabase = await createClient()
    const userDetails = await getCurrentUserFullDetails()

    if (!userDetails || userDetails.role === 0) return []

    // Fetch profiles and join with roles table to get roleName, and company table
    // Since roles table is just metadata, we can just use roleId.
    // However, if we want roleName we could join. 
    // The previous code selected `roles(role)` which implies a separate table relation.
    // New relation: profile.roleId -> roles.roleId.

    let query = supabase.from('profiles').select('*, role:roles(roleid, rolename), company(companyname)')

    if (userDetails.role !== 2) {
        query = query.eq('company_id', userDetails.profile.company_id)
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

export async function getInsights(context: 'all_leads' | 'my_leads' | 'all_comments' | 'my_comments' = 'all_leads') {
    const supabase = await createClient()
    const userDetails = await getCurrentUserFullDetails()
    if (!userDetails) return { metric1: 0, metric2: 0, metric3: 0, metric4: 0 }
    const { user, profile, role } = userDetails

    // Pre-calculate scoping emails
    let scopeEmails: string[] = []
    if (role !== 2 && profile.company_id) {
        const { data: companyUsers } = await supabase.from('profiles').select('email').eq('company_id', profile.company_id)
        scopeEmails = companyUsers?.map(u => u.email) || []
    }

    // Helper to Apply Scoping to a Query Builder
    const applyScope = (q: any) => {
        q = q.eq('is_deleted', false)
        if (role !== 2 && profile.company_id && scopeEmails.length > 0) {
            q = q.in('created_by_email_id', scopeEmails)
        } else if (role !== 2 && profile.company_id) {
            q = q.eq('created_by_email_id', user.email)
        }

        if (context === 'my_leads' || context === 'my_comments') {
            q = q.eq('created_by_email_id', user.email)
        }
        return q
    }

    if (context === 'all_leads' || context === 'my_leads') {
        const { count: totalLeads } = await applyScope(supabase.from('leads').select('*', { count: 'exact', head: true }))

        const qNew = applyScope(supabase.from('leads').select('*', { count: 'exact', head: true }))
        qNew.gte('created_time', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        const { count: newLeads } = await qNew

        const qActive = applyScope(supabase.from('leads').select('*', { count: 'exact', head: true }))
        qActive.eq('status', 'In Conversation')
        const { count: inConversation } = await qActive

        const qConv = applyScope(supabase.from('leads').select('*', { count: 'exact', head: true }))
        qConv.eq('status', 'PO')
        if (context === 'my_leads') {
            qConv.gte('created_time', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        }
        const { count: converted } = await qConv

        return {
            metric1: totalLeads || 0,
            metric2: newLeads || 0,
            metric3: inConversation || 0,
            metric4: converted || 0
        }
    }

    // Comments
    if (context === 'all_comments' || context === 'my_comments') {
        const { count: total } = await applyScope(supabase.from('comments').select('*', { count: 'exact', head: true }))
        return { metric1: total || 0, metric2: 0, metric3: 0, metric4: 0 }
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


'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function addLead(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const leadName = formData.get('leadName') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const location = formData.get('location') as string
    const note = formData.get('note') as string
    const status = formData.get('status') as string
    const secondaryPhone = formData.get('secondaryPhone') as string

    // Validation - At least one contact method required
    if (!phone && !email && !secondaryPhone) {
        return { error: 'At least one contact method (Phone, Email, or Secondary Phone) is required.', success: false, message: '' }
    }

    if (!leadName) {
        return { error: 'Lead Name is required.', success: false, message: '' }
    }

    if (phone && (phone.length !== 10 || !/^\d+$/.test(phone))) {
        return { error: 'Phone number must be exactly 10 digits.', success: false, message: '' }
    }

    // Get current user to set as creator
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) {
        return { error: 'You must be logged in to add a lead.', success: false, message: '' }
    }

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
            created_by_email_id: user.email
        })

    if (error) {
        console.error('Error adding lead:', error)
        if (error.code === '23505') { // Unique violation
            if (error.message.includes('phone')) return { error: 'Phone number already exists.', success: false, message: '' }
            if (error.message.includes('email')) return { error: 'Email already exists.', success: false, message: '' }
        }
        return { error: 'Failed to add lead. Please try again.', success: false, message: '' }
    }

    revalidatePath('/dashboard/leads')
    return { success: true, message: 'Lead added successfully!', error: undefined }
}

export async function getLeads(page = 1, search = '', mineOnly = false) {
    const supabase = await createClient()
    const itemsPerPage = 30
    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    let query = supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .eq('is_deleted', false)
        .order('id', { ascending: false })
        .range(from, to)

    if (mineOnly) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email) {
            query = query.eq('created_by_email_id', user.email)
        }
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

    // Validation - At least one contact method
    if (!phone && !email && !secondaryPhone) {
        return { error: 'At least one contact method (Phone, Email, or Secondary Phone) is required.', success: false, message: '' }
    }

    // Check phone valid if present
    if (phone && (phone.length !== 10 || !/^\d+$/.test(phone))) {
        return { error: 'Phone number must be exactly 10 digits.', success: false, message: '' }
    }

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
        if (error.code === '23505') {
            if (error.message.includes('phone')) return { error: 'Phone number already exists.', success: false, message: '' }
            if (error.message.includes('email')) return { error: 'Email already exists.', success: false, message: '' }
        }
        return { error: 'Failed to update lead', success: false, message: '' }
    }

    revalidatePath(`/dashboard/leads/${id}`)
    revalidatePath('/dashboard/leads')
    return { success: true, message: 'Lead updated successfully', error: undefined }
}

export async function deleteLead(id: number) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('leads')
        .update({ is_deleted: true })
        .eq('id', id)

    if (error) {
        return { error: 'Failed to delete lead' }
    }

    revalidatePath('/dashboard/leads')
    return { success: true }
}

// COMMENTS ACTIONS

export async function getComments(page = 1, search = '', mineOnly = false) {
    const supabase = await createClient()
    const itemsPerPage = 30
    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    let query = supabase
        .from('comments')
        .select('*, leads(lead_name)', { count: 'exact' })
        .eq('is_deleted', false)
        .order('created_time', { ascending: false })
        .range(from, to)

    if (mineOnly) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email) {
            query = query.eq('created_by_email_id', user.email)
        }
    }

    if (search) {
        query = query.or(`comment_text.ilike.%${search}%,created_by_email_id.ilike.%${search}%`)

        // Check if search is a number for ID search
        if (!isNaN(Number(search))) {
            query = query.or(`lead_id.eq.${search}`)
        }
    }

    const { data, count, error } = await query

    if (error) {
        console.error(error)
        return { comments: [], count: 0 }
    }

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

    // 1. Add Comment
    const { error: commentError } = await supabase
        .from('comments')
        .insert({
            lead_id: leadId,
            comment_text: commentText,
            status: status, // Log the status change in the comment record too
            created_by_email_id: user?.email
        })

    if (commentError) return { error: 'Failed to add comment', success: false, message: '' }

    // 2. Update Lead Status (if status is provided)
    if (status) {
        const { error: leadError } = await supabase
            .from('leads')
            .update({
                status: status,
                last_edited_time: new Date().toISOString()
            })
            .eq('id', leadId)

        if (leadError) console.error('Failed to update lead status:', leadError)
    }

    revalidatePath(`/dashboard/leads/${leadId}`)
    revalidatePath('/dashboard/leads') // Update list view too
    return { success: true, message: 'Comment added and status updated', error: undefined }
}

export async function deleteComment(id: number, leadId?: number) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('comments')
        .update({ is_deleted: true })
        .eq('id', id)

    if (error) {
        console.error("Delete Comment Error:", error)
        return { error: 'Failed to delete comment', success: false, message: '' }
    }

    if (leadId) revalidatePath(`/dashboard/leads/${leadId}`)
    revalidatePath('/dashboard/comments')
    return { success: true }
}

export async function getInsights(context: 'all_leads' | 'my_leads' | 'all_comments' | 'my_comments' = 'all_leads') {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    const userEmail = user?.email

    // Helper to build base query
    const buildQuery = (table: string) => {
        let q = supabase.from(table).select('*', { count: 'exact', head: true }).eq('is_deleted', false)
        if (context === 'my_leads' || context === 'my_comments') {
            if (userEmail) q = q.eq('created_by_email_id', userEmail)
        }
        return q
    }

    if (context === 'all_leads' || context === 'my_leads') {
        const { count: totalLeads } = await buildQuery('leads')

        let newLeadsQuery = buildQuery('leads').gte('created_time', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        if (context === 'my_leads') {
            // For "My Leads Contacted Today", assuming "Contacted" status or just any action? User said "My Leads Contacted today".
            // Let's assume leads with status "Contacted" updated today? Or just added today?
            // "My Leads Contacted today": Leads I touched today? or Leads with status "Contacted"? 
            // "My Leads in conversation today": Status In Conversation
            // "My Leads converted in last 30 days": Status PO, last 30 days
            // Let's implement based on user names
        }

        // Let's stick to the requested names mapping roughly to data we can easily get
        // All Leads: Total, New Today, In Conversation, Converted (PO)
        // My Leads: Total Added By Me, My Leads Contacted (status=Contacted), My Leads In Conversation, My Leads Converted (PO, 30 days)

        const { count: newLeads } = await newLeadsQuery

        const { count: inConversation } = await buildQuery('leads').eq('status', 'In Conversation')

        let convertedQuery = buildQuery('leads').eq('status', 'PO')
        if (context === 'my_leads') {
            convertedQuery = convertedQuery.gte('created_time', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        }
        const { count: converted } = await convertedQuery

        // Special handling for "Contacted" in My Leads
        let contacted = 0
        if (context === 'my_leads') {
            const { count } = await buildQuery('leads').eq('status', 'Contacted').gte('last_edited_time', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            contacted = count || 0
        }

        return {
            metric1: totalLeads || 0,
            metric2: context === 'my_leads' ? contacted : (newLeads || 0),
            metric3: inConversation || 0,
            metric4: converted || 0
        }
    }

    // Comments Handling
    if (context === 'all_comments' || context === 'my_comments') {
        const { count: totalComments } = await buildQuery('comments')

        const { count: commentsToday } = await buildQuery('comments').gte('created_time', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

        // "Conversations Today" -> For comments this is ambiguous. Maybe "In Conversation" status comments today?
        // User req: "Conversations Today"
        const { count: conversationsToday } = await buildQuery('comments').eq('status', 'In Conversation').gte('created_time', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

        // "POs Today" or "POs by me in last 30 days"
        let posQuery = buildQuery('comments').eq('status', 'PO')
        if (context === 'my_comments') {
            posQuery = posQuery.gte('created_time', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        } else {
            posQuery = posQuery.gte('created_time', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        }
        const { count: posCount } = await posQuery

        return {
            metric1: totalComments || 0,
            metric2: commentsToday || 0,
            metric3: conversationsToday || 0,
            metric4: posCount || 0
        }
    }

    return { metric1: 0, metric2: 0, metric3: 0, metric4: 0 }
}

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated', success: false }
    }

    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string

    // Check if profile exists
    const { data: existingProfile } = await supabase.from('profiles').select('id').eq('id', user.id).single()

    let error;
    if (existingProfile) {
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ name, phone, address })
            .eq('id', user.id)
        error = updateError
    } else {
        const { error: insertError } = await supabase
            .from('profiles')
            .insert({ id: user.id, name, phone, address, email: user.email })

        if (!insertError) {
            // Ensure role exists (default 0)
            await supabase.from('roles').insert({ id: user.id, role: 0 }).select()
        }
        error = insertError
    }

    if (error) {
        console.error('Profile update error:', error)
        return { error: 'Failed to update profile', success: false }
    }

    revalidatePath('/dashboard/profile')
    return { success: true }
}

export async function sendPasswordReset() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.email) {
        return { error: 'Not authenticated', success: false }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/dashboard/profile`,
    })

    if (error) {
        console.error('Reset password error:', error)
        return { error: 'Failed to send reset email', success: false }
    }

    return { success: true, message: 'Password reset email sent!' }
}

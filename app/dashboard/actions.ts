
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

export async function getLeads(page = 1, search = '') {
    const supabase = await createClient()
    const itemsPerPage = 10
    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    let query = supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .eq('is_deleted', false)
        .order('created_time', { ascending: false })
        .range(from, to)

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

export async function getComments(page = 1, search = '') {
    const supabase = await createClient()
    const itemsPerPage = 10
    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    let query = supabase
        .from('comments')
        .select('*, leads(lead_name)', { count: 'exact' })
        .eq('is_deleted', false)
        .order('created_time', { ascending: false })
        .range(from, to)

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

export async function getInsights() {
    const supabase = await createClient()

    const { count: totalLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', false)

    const { count: newLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', false)
        .gte('created_time', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours

    // Quick status breakdown
    // Note: Supabase doesn't support complex GROUP BY easily with simple client usage without RPC usually,
    // but we can do a few separate counts or fetch all status column (efficient if <10k rows usually, else RPC).
    // For now, let's fetch purely status column to aggregate manually or just separate counts for key ones.
    // Let's do a few simple queries for "New", "In Conversation", "Converted".

    const { count: inConversation } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'In Conversation')
        .eq('is_deleted', false)

    const { count: converted } = await supabase // Assuming 'PO' is converted/success
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PO')
        .eq('is_deleted', false)

    return {
        totalLeads: totalLeads || 0,
        newLeads: newLeads || 0,
        inConversation: inConversation || 0,
        converted: converted || 0
    }
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
        error = insertError
    }

    if (error) {
        console.error('Profile update error:', error)
        return { error: 'Failed to update profile', success: false }
    }

    revalidatePath('/dashboard/profile')
    return { success: true }
}

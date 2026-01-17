
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

    // Validation
    if (!leadName || !phone || !email) {
        return { error: 'Name, Phone, and Email are required.' }
    }

    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
        return { error: 'Phone number must be exactly 10 digits.' }
    }

    // Get current user to set as creator
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) {
        return { error: 'You must be logged in to add a lead.' }
    }

    const { error } = await supabase
        .from('leads')
        .insert({
            lead_name: leadName,
            phone,
            email,
            location,
            note,
            status: status || 'New',
            created_by_email_id: user.email
        })

    if (error) {
        console.error('Error adding lead:', error)
        if (error.code === '23505') { // Unique violation
            if (error.message.includes('phone')) return { error: 'Phone number already exists.' }
            if (error.message.includes('email')) return { error: 'Email already exists.' }
        }
        return { error: 'Failed to add lead. Please try again.' }
    }

    revalidatePath('/dashboard/leads')
    return { success: true, message: 'Lead added successfully!' }
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
        query = query.or(`lead_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
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

    const { error } = await supabase
        .from('leads')
        .update({
            lead_name: leadName,
            location,
            note,
            status,
            last_edited_time: new Date().toISOString()
        })
        .eq('id', id)

    if (error) {
        return { error: 'Failed to update lead' }
    }

    revalidatePath(`/dashboard/leads/${id}`)
    revalidatePath('/dashboard/leads')
    return { success: true, message: 'Lead updated successfully' }
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
        query = query.ilike('comment_text', `%${search}%`)
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

    if (!commentText) return { error: 'Comment text is required' }

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

    if (commentError) return { error: 'Failed to add comment' }

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
    return { success: true, message: 'Comment added and status updated' }
}

export async function deleteComment(id: number, leadId?: number) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('comments')
        .update({ is_deleted: true })
        .eq('id', id)

    if (error) return { error: 'Failed to delete comment' }

    if (leadId) revalidatePath(`/dashboard/leads/${leadId}`)
    revalidatePath('/dashboard/comments')
    return { success: true }
}

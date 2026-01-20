
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
    return createClient(
        'https://rtdllwjyywgquiqqqtou.supabase.co',
        'sb_secret_PoXnQVB-YRXKHtQwFTdw7g_q5qI0eJO',
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )
}

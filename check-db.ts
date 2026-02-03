
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach((line) => {
        if (line.trim().startsWith('#')) return;
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, '');
            process.env[key] = value;
        }
    });
}

import { createAdminClient } from './utils/supabase/admin';

async function check() {
    const supabase = createAdminClient();

    console.log('--- Checking Roles ---');
    const { data: roles } = await supabase.from('roles').select('*');
    console.log('Roles:', roles);

    console.log('\n--- Checking Companies ---');
    const { data: companies } = await supabase.from('company').select('*');
    console.log('Companies:', companies);

    console.log('\n--- Checking Profiles ---');
    const { data: profiles } = await supabase.from('profiles').select('*');
    console.log('Profiles Found:', profiles?.length || 0);
    profiles?.forEach(p => {
        console.log(`- ${p.email}: Role=${p.role_id}, Company=${p.company_id}`);
    });

    console.log('\n--- Checking Auth Users ---');
    const { data: { users } } = await supabase.auth.admin.listUsers();
    console.log('Auth Users Found:', users.length);
    users.forEach(u => {
        console.log(`- ${u.email}: ID=${u.id}`);
    });
}

check().catch(console.error);

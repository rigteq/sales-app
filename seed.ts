
import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach((line) => {
        // Skip comments
        if (line.trim().startsWith('#')) return;

        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            // Remove quotes and whitespace
            const value = match[2].trim().replace(/^["']|["']$/g, '');
            process.env[key] = value;
        }
    });
    console.log('Environment variables loaded from .env.local');
}

import { createAdminClient } from './utils/supabase/admin';

async function seed() {
    const supabase = createAdminClient();

    // 1. Ensure 'rigteq' company exists
    console.log('Checking company...');
    const { data: company, error: companyError } = await supabase
        .from('company')
        .select('id')
        .eq('companyname', 'rigteq')
        .single();

    let companyId = company?.id;

    if (!companyId) {
        console.log('Creating company: rigteq');
        const { data: newCompany, error: createCompanyError } = await supabase
            .from('company')
            .insert({
                companyname: 'rigteq',
                companyemail: 'info@rigteq.com',
            })
            .select()
            .single();

        if (createCompanyError) {
            console.error('Error creating company:', createCompanyError);
            return;
        }
        companyId = newCompany.id;
        console.log('Created company with ID:', companyId);
    } else {
        console.log('Found existing company:', companyId);
    }

    // 2. Define users
    const users = [
        {
            email: 'superadmin@rigteq.com',
            password: 'password123',
            name: 'Super Admin',
            role_id: 2, // SuperAdmin
        },
        {
            email: 'admin@rigteq.com',
            password: 'password123',
            name: 'Admin User',
            role_id: 1, // Admin
        },
        {
            email: 'user@rigteq.com',
            password: 'password123',
            name: 'Standard User',
            role_id: 0, // User
        },
    ];

    console.log('Seeding users...');
    for (const user of users) {
        // Check if user exists in auth
        const { data: { users: existingUsers } } = await supabase.auth.admin.listUsers();
        let userId = existingUsers.find(u => u.email === user.email)?.id;

        if (!userId) {
            console.log(`Creating auth user: ${user.email}`);
            const { data, error } = await supabase.auth.admin.createUser({
                email: user.email,
                password: user.password,
                email_confirm: true,
                user_metadata: { name: user.name }
            });

            if (error) {
                console.error(`Error creating user ${user.email}:`, error.message);
                continue;
            }
            userId = data.user.id;
        } else {
            console.log(`User already exists in Auth: ${user.email}`);
        }

        // Upsert profile
        if (userId) {
            console.log(`Updating profile for: ${user.email} (Role ID: ${user.role_id})`);

            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    name: user.name,
                    email: user.email,
                    company_id: companyId,
                    role_id: user.role_id,
                    last_edited_time: new Date().toISOString()
                });

            if (profileError) {
                console.error(`Error updating profile for ${user.email}:`, profileError.message);
            } else {
                console.log(`Successfully synced profile for ${user.email}`);
            }
        }
    }

    console.log('\nSeeding complete!');
    console.log('-----------------------------------');
    console.log('Credentials:');
    users.forEach(u => {
        console.log(`${u.name}: ${u.email} / ${u.password}`);
    });
}

seed().catch((err) => {
    console.error('Unexpected error during seeding:', err);
    process.exit(1);
});

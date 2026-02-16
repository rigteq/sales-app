# SALES-APP PROJECT DOCUMENTATION
## Complete Technical Guide for Beginners

**Project Name:** SalesRQ - Advanced Lead Management System  
**Developed By:** RigTeq Technologies  
**Documentation Date:** February 2026  

---

# TABLE OF CONTENTS

1. Project Overview
2. Technologies Used
3. Project Folder Structure
4. How to Run the Project
5. Database (Supabase) Explained
6. Database Tables & Schema
7. Authentication System
8. Server Actions
9. Components Overview
10. Page Routes
11. Key Files Explanation
12. Environment Variables
13. Key Concepts to Remember
14. Common Development Tasks

---

# 1. PROJECT OVERVIEW

## What is this project?

This is a **Sales Lead Management System** called **"SalesRQ"**. It is a web application designed to help sales teams efficiently manage their customer leads and sales pipeline.

## Key Features:

- **Lead Management:** Create, view, update, and delete customer leads
- **Lead Assignment:** Assign leads to specific team members
- **Comments System:** Add notes and comments on each lead for tracking communication
- **User Management:** Add and manage team members with different roles
- **Company Management:** Manage multiple companies/organizations
- **Purchase Orders (PO):** Track purchase orders related to leads
- **Notifications:** Send broadcast notifications to team members
- **Scheduled Leads:** Schedule follow-ups for leads
- **Insights Dashboard:** View statistics and analytics

## User Roles:

| Role ID | Role Name | Permissions |
|---------|-----------|-------------|
| 0 | User | Basic access - can manage own leads and comments |
| 1 | Admin | Can manage users and view all company data |
| 2 | SuperAdmin | Full access - can manage companies, users, and all data |

---

# 2. TECHNOLOGIES USED

## Frontend Technologies:

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.3 | React framework for building full-stack web applications |
| **React** | 19.2.3 | JavaScript library for building user interfaces |
| **TypeScript** | 5.x | JavaScript with static type checking |
| **Tailwind CSS** | 4.x | Utility-first CSS framework for styling |
| **Lucide React** | 0.562.0 | Icon library for React |

## Backend Technologies:

| Technology | Purpose |
|------------|---------|
| **Supabase** | Backend-as-a-Service (BaaS) - provides database, authentication, and API |
| **PostgreSQL** | Database system (managed by Supabase) |

## Key Libraries:

| Library | Purpose |
|---------|---------|
| **@supabase/ssr** | Supabase client for server-side rendering |
| **@supabase/supabase-js** | Supabase JavaScript client |
| **date-fns** | Date utility library |
| **clsx** | Utility for constructing className strings |
| **tailwind-merge** | Merge Tailwind CSS classes |
| **use-debounce** | Debounce hook for React |

---

# 3. PROJECT FOLDER STRUCTURE

```
sales-app/
│
├── app/                          # MAIN APPLICATION CODE
│   ├── page.tsx                  # Home page (Login page)
│   ├── layout.tsx                # Root layout wrapper
│   ├── globals.css               # Global CSS styles
│   ├── manifest.ts               # PWA manifest configuration
│   │
│   ├── auth/                     # Authentication related pages
│   │   └── ...
│   │
│   └── dashboard/                # Dashboard pages (protected routes)
│       ├── page.tsx              # Main dashboard page
│       ├── layout.tsx            # Dashboard layout
│       ├── loading.tsx           # Loading state component
│       ├── actions.ts            # SERVER ACTIONS (database operations)
│       │
│       ├── leads/                # Leads management
│       │   ├── page.tsx          # All leads list
│       │   └── [id]/             # Individual lead pages
│       │
│       ├── my-leads/             # User's own leads
│       ├── assigned-leads/       # Leads assigned to user
│       ├── scheduled-leads/      # Leads with scheduled follow-ups
│       ├── comments/             # All comments
│       ├── my-comments/          # User's own comments
│       ├── users/                # User management
│       ├── companies/            # Company management
│       ├── pos/                  # Purchase Orders
│       ├── profile/              # User profile
│       ├── notifications/        # View notifications
│       ├── notify/               # Send notifications
│       ├── custom-message/       # Custom message settings
│       └── insights/             # Analytics dashboard
│
├── components/                   # REUSABLE UI COMPONENTS
│   ├── auth/                     # Authentication components
│   │   └── login-form.tsx        # Login form component
│   │
│   ├── dashboard/                # Dashboard components
│   │   ├── leads/                # Lead-related components
│   │   ├── users/                # User-related components
│   │   ├── pos/                  # PO-related components
│   │   ├── companies/            # Company components
│   │   ├── sidebar.tsx           # Navigation sidebar
│   │   ├── header.tsx            # Page headers
│   │   └── ...more components
│   │
│   ├── ui/                       # Generic UI components
│   │   ├── toast.tsx             # Toast notifications
│   │   └── ...
│   │
│   └── loader.tsx                # Loading spinner component
│
├── utils/                        # UTILITY FUNCTIONS
│   └── supabase/                 # Supabase configuration
│       ├── client.ts             # Browser-side Supabase client
│       ├── server.ts             # Server-side Supabase client
│       ├── admin.ts              # Admin Supabase client
│       └── middleware.ts         # Session management utilities
│
├── types/                        # TYPESCRIPT TYPE DEFINITIONS
│   └── ...
│
├── public/                       # STATIC FILES
│   ├── icon.svg                  # App icon
│   └── ...images
│
├── middleware.ts                 # NEXT.JS MIDDLEWARE (auth protection)
├── docs.sql                      # DATABASE SCHEMA (SQL commands)
├── package.json                  # Project dependencies
├── package-lock.json             # Locked dependency versions
├── tsconfig.json                 # TypeScript configuration
├── next.config.ts                # Next.js configuration
├── postcss.config.mjs            # PostCSS configuration
├── eslint.config.mjs             # ESLint configuration
├── .env.local                    # ENVIRONMENT VARIABLES (secrets)
├── .gitignore                    # Git ignore rules
└── README.md                     # Project readme
```

---

# 4. HOW TO RUN THE PROJECT

## Prerequisites:

1. **Node.js** (version 18 or higher) - Download from https://nodejs.org
2. **npm** (comes with Node.js)
3. **Git** (for version control)
4. **Code Editor** (VS Code recommended)

## Step-by-Step Setup:

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd sales-app
```

### Step 2: Install Dependencies
```bash
npm install
```
This command reads `package.json` and installs all required packages into `node_modules` folder.

### Step 3: Configure Environment Variables
Create a file named `.env.local` in the root folder with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_secret_service_role_key
```

### Step 4: Start Development Server
```bash
npm run dev
```

### Step 5: Open in Browser
Navigate to `http://localhost:3000` (or `http://localhost:3001` if 3000 is busy)

## Available Scripts:

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Build production-ready application |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint to check code quality |

---

# 5. DATABASE (SUPABASE) EXPLAINED

## What is Supabase?

Supabase is an open-source Backend-as-a-Service (BaaS) platform that provides:
- **PostgreSQL Database** - A powerful relational database
- **Authentication** - User login/signup system
- **Real-time Subscriptions** - Live data updates
- **Storage** - File storage
- **Edge Functions** - Serverless functions

## Why Supabase?

1. **No Server Management** - Database is hosted in the cloud
2. **Built-in Authentication** - Email/password, social logins, etc.
3. **Row Level Security (RLS)** - Database-level security policies
4. **Real-time Updates** - Data changes sync instantly
5. **Free Tier Available** - Good for development and small projects

## How the App Connects to Supabase:

### Browser-Side Connection (client.ts):
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,      // Database URL
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!  // Public key (safe for browser)
    )
}
```
- Used in Client Components (marked with 'use client')
- Uses the public anonymous key
- Safe to use in browser

### Server-Side Connection (server.ts):
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()
    
    return createServerClient(
        'https://your-project.supabase.co',
        'your_anon_key',
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) { ... }
            }
        }
    )
}
```
- Used in Server Components and Server Actions
- Has access to cookies for session management
- More secure for sensitive operations

### Admin Connection (admin.ts):
```typescript
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!  // Secret admin key
    )
}
```
- Uses the secret Service Role Key
- Bypasses Row Level Security
- Used for admin operations (creating users, etc.)
- NEVER expose this key to the browser!

---

# 6. DATABASE TABLES & SCHEMA

## Table 1: profiles

Stores user profile information. Linked to Supabase Auth.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (linked to auth.users) |
| name | TEXT | User's full name |
| email | TEXT | User's email (unique) |
| gender | TEXT | User's gender |
| address | TEXT | User's address |
| phone | TEXT | User's phone (unique) |
| role_id | INTEGER | User role (0=User, 1=Admin, 2=SuperAdmin) |
| company_id | UUID | Reference to company |
| custom_message | TEXT | Custom message for user |
| created_time | TIMESTAMPTZ | Account creation time |
| last_edited_time | TIMESTAMPTZ | Last update time |
| is_deleted | BOOLEAN | Soft delete flag |

## Table 2: leads

Stores customer lead information.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key (auto-increment) |
| created_by_email_id | TEXT | Email of user who created the lead |
| assigned_to_email_id | TEXT | Email of assigned user |
| lead_name | TEXT | Name of the lead/customer |
| phone | TEXT | Primary phone number |
| secondary_phone | TEXT | Secondary phone number |
| email | TEXT | Lead's email address |
| status | TEXT | Lead status (New, Contacted, etc.) |
| location | TEXT | Lead's location |
| note | TEXT | Additional notes |
| schedule_time | TIMESTAMPTZ | Scheduled follow-up time |
| created_time | TIMESTAMPTZ | Creation timestamp |
| last_edited_time | TIMESTAMPTZ | Last update timestamp |
| is_deleted | BOOLEAN | Soft delete flag |

## Table 3: comments

Stores comments/notes on leads.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| lead_id | BIGINT | Reference to leads table |
| comment_text | TEXT | The comment content |
| created_by_email_id | TEXT | Email of commenter |
| status | TEXT | Status at time of comment |
| created_time | TIMESTAMPTZ | Comment timestamp |
| is_deleted | BOOLEAN | Soft delete flag |

## Table 4: roles

Stores role definitions.

| Column | Type | Description |
|--------|------|-------------|
| roleId | INTEGER | Primary key (0, 1, 2) |
| roleName | TEXT | Role name |
| createdDate | TIMESTAMPTZ | Creation date |

## Table 5: company

Stores company information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| companyname | TEXT | Company name |
| companyemail | TEXT | Company email |
| companyphone | TEXT | Company phone |
| companydetails | TEXT | Company description |
| created_at | TIMESTAMPTZ | Creation timestamp |

## Table 6: po_data

Stores Purchase Order information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| lead_id | BIGINT | Reference to leads table |
| amount_received | DECIMAL | Amount received |
| amount_remaining | DECIMAL | Amount remaining |
| release_date | TIMESTAMPTZ | Release date |
| note | TEXT | Additional notes |
| created_by_email_id | TEXT | Creator's email |
| company_id | UUID | Reference to company |
| created_at | TIMESTAMPTZ | Creation timestamp |
| last_edited_at | TIMESTAMPTZ | Last update timestamp |

## Table 7: broadcast_notifications

Stores team notifications.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | TEXT | Notification title |
| message | TEXT | Notification message |
| created_by_email_id | TEXT | Sender's email |
| created_at | TIMESTAMPTZ | Send timestamp |

## Database Relationships Diagram:

```
                    ┌──────────────┐
                    │    roles     │
                    │   (roleId)   │
                    └──────┬───────┘
                           │
                           │ role_id
                           ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   company    │◄───│   profiles   │───▶│  auth.users  │
│ (id)         │    │   (id)       │    │   (id)       │
└──────┬───────┘    └──────────────┘    └──────────────┘
       │                   │
       │                   │ created_by_email_id
       │                   ▼
       │            ┌──────────────┐
       │            │    leads     │
       │            │   (id)       │
       │            └──────┬───────┘
       │                   │
       │     ┌─────────────┼─────────────┐
       │     │             │             │
       │     ▼             ▼             ▼
       │  ┌────────┐  ┌──────────┐  ┌──────────┐
       │  │comments│  │ po_data  │  │ broadcast│
       │  │(lead_id)│ │(lead_id) │  │ _notif.  │
       │  └────────┘  └──────────┘  └──────────┘
       │                   │
       └───────────────────┘
              company_id
```

---

# 7. AUTHENTICATION SYSTEM

## How Login Works:

### Step 1: User visits the app
- Browser loads `app/page.tsx` (login page)
- Login form is displayed with email and password fields

### Step 2: User enters credentials
- User types email and password
- Submits the form

### Step 3: Supabase Authentication
- App calls Supabase Auth API
- Supabase verifies credentials against `auth.users` table
- If valid, Supabase returns a session token

### Step 4: Session Storage
- Session token is stored in browser cookies
- Contains user ID and access token

### Step 5: Middleware Protection
- On every page request, `middleware.ts` runs
- It checks if a valid session exists
- If no session, redirects to login page
- If session exists, allows access to protected routes

## Middleware Code Explained:

```typescript
// middleware.ts
import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    // This function runs on every request
    // It refreshes the session and redirects if needed
    return await updateSession(request)
}

export const config = {
    matcher: [
        // Match all routes except static files
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
```

## Authentication Flow Diagram:

```
┌─────────────────┐
│   User visits   │
│   /dashboard    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   middleware.ts │
│   runs first    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ Check: Valid session cookie?│
└────────┬───────────┬────────┘
         │           │
    NO   │           │ YES
         ▼           ▼
┌─────────────┐  ┌─────────────┐
│  Redirect   │  │   Allow     │
│  to Login   │  │   Access    │
│  (/)        │  │ (dashboard) │
└─────────────┘  └─────────────┘
```

---

# 8. SERVER ACTIONS

## What are Server Actions?

Server Actions are functions that run on the server, not in the browser. They are used to:
- Fetch data from the database
- Insert, update, or delete data
- Handle form submissions securely

## How to identify Server Actions:
- They have `'use server'` at the top of the file
- They are async functions
- They are defined in files within the `app/` directory

## Main Server Actions File: `app/dashboard/actions.ts`

This file contains all database operations for the dashboard.

### Lead Actions:

| Function | Purpose | Parameters |
|----------|---------|------------|
| `addLead(prevState, formData)` | Create a new lead | Form data with lead details |
| `getLeads(page, search, filters)` | Get paginated list of leads | Page number, search term, filters |
| `getLead(id)` | Get single lead by ID | Lead ID |
| `updateLead(prevState, formData)` | Update existing lead | Form data with updated details |
| `deleteLead(id)` | Soft-delete a lead | Lead ID |

### Comment Actions:

| Function | Purpose |
|----------|---------|
| `getComments(page, search, mineOnly, filters)` | Get all comments |
| `getLeadComments(leadId, page)` | Get comments for a specific lead |
| `addComment(prevState, formData)` | Add new comment to lead |
| `deleteComment(id, leadId)` | Delete a comment |

### User Actions:

| Function | Purpose |
|----------|---------|
| `addUser(prevState, formData)` | Create new user |
| `getUsers(page, search, roleFilter, companyIdFilter)` | Get users list |
| `getUser(id)` | Get single user |
| `deleteUser(id)` | Delete a user |

### Company Actions:

| Function | Purpose |
|----------|---------|
| `addCompany(prevState, formData)` | Create new company |
| `getCompanies(page, search, filter)` | Get companies list |
| `getCompany(id)` | Get single company |
| `updateCompany(prevState, formData)` | Update company |
| `deleteCompany(id)` | Delete company |

### PO (Purchase Order) Actions:

| Function | Purpose |
|----------|---------|
| `addPO(prevState, formData)` | Create new purchase order |
| `getPOs(page, search)` | Get purchase orders list |
| `getPOStats()` | Get PO statistics |

### Other Actions:

| Function | Purpose |
|----------|---------|
| `getCurrentUserFullDetails()` | Get logged-in user's full profile |
| `getInsights(context)` | Get dashboard statistics |
| `updateProfile(formData)` | Update user's own profile |
| `sendPasswordReset()` | Send password reset email |
| `sendBroadcastNotification(prevState, formData)` | Send notification to all users |
| `getUpcomingScheduledLeads()` | Get leads with upcoming schedules |

## Example: How addLead Works

```typescript
'use server'

export async function addLead(prevState: any, formData: FormData) {
    // 1. Create database connection
    const supabase = await createClient()
    
    // 2. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }
    
    // 3. Extract form data
    const leadName = formData.get('lead_name') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const location = formData.get('location') as string
    const note = formData.get('note') as string
    
    // 4. Validate required fields
    if (!leadName) {
        return { error: 'Lead name is required' }
    }
    
    // 5. Insert into database
    const { data, error } = await supabase
        .from('leads')
        .insert({
            lead_name: leadName,
            phone: phone,
            email: email,
            location: location,
            note: note,
            status: 'New',
            created_by_email_id: user.email,
            assigned_to_email_id: user.email
        })
        .select()
    
    // 6. Handle errors
    if (error) {
        return { error: error.message }
    }
    
    // 7. Refresh the page data
    revalidatePath('/dashboard/leads')
    
    // 8. Return success
    return { success: true, data: data }
}
```

---

# 9. COMPONENTS OVERVIEW

## What are Components?

Components are reusable pieces of UI. They are JavaScript/TypeScript functions that return JSX (HTML-like syntax).

## Types of Components:

### 1. Server Components (Default in Next.js 13+)
- Run on the server
- Can directly fetch data
- Cannot use browser APIs (window, document)
- Cannot use React hooks (useState, useEffect)

### 2. Client Components
- Run in the browser
- Can use browser APIs
- Can use React hooks
- Must have `'use client'` at the top

## Component Structure:

```
components/
├── auth/
│   └── login-form.tsx        # Login form with email/password
│
├── dashboard/
│   ├── sidebar.tsx           # Navigation sidebar
│   ├── header.tsx            # Page header with title
│   ├── search-bar.tsx        # Search input component
│   ├── pagination.tsx        # Page navigation
│   │
│   ├── leads/
│   │   ├── leads-table.tsx   # Table displaying leads
│   │   ├── add-lead-form.tsx # Form to add new lead
│   │   ├── edit-lead-form.tsx# Form to edit lead
│   │   └── lead-card.tsx     # Individual lead display
│   │
│   ├── users/
│   │   ├── users-table.tsx   # Table displaying users
│   │   └── add-user-form.tsx # Form to add new user
│   │
│   ├── pos/
│   │   ├── po-list.tsx       # List of purchase orders
│   │   └── add-po-form.tsx   # Form to add new PO
│   │
│   └── companies/
│       ├── companies-list.tsx# List of companies
│       └── add-company-form.tsx
│
├── ui/
│   └── toast.tsx             # Toast notification component
│
└── loader.tsx                # Loading spinner
```

## Example Component:

```tsx
// components/dashboard/leads/lead-card.tsx
'use client'  // This is a client component

import { useState } from 'react'

interface LeadCardProps {
    lead: {
        id: number
        lead_name: string
        phone: string
        status: string
    }
    onDelete: (id: number) => void
}

export function LeadCard({ lead, onDelete }: LeadCardProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    
    const handleDelete = async () => {
        setIsDeleting(true)
        await onDelete(lead.id)
        setIsDeleting(false)
    }
    
    return (
        <div className="p-4 border rounded-lg">
            <h3 className="font-bold">{lead.lead_name}</h3>
            <p className="text-gray-600">{lead.phone}</p>
            <span className="badge">{lead.status}</span>
            <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-500"
            >
                {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
        </div>
    )
}
```

---

# 10. PAGE ROUTES

## How Routing Works in Next.js App Router:

In Next.js 13+, routing is based on the folder structure inside the `app/` directory.

- Each folder represents a route segment
- `page.tsx` inside a folder makes it a accessible route
- `layout.tsx` wraps all pages in that folder

## Route Mapping:

| Folder Path | URL | Page Description |
|-------------|-----|------------------|
| `app/page.tsx` | `/` | Login page (Home) |
| `app/dashboard/page.tsx` | `/dashboard` | Main dashboard |
| `app/dashboard/leads/page.tsx` | `/dashboard/leads` | All leads list |
| `app/dashboard/leads/[id]/page.tsx` | `/dashboard/leads/123` | Single lead details |
| `app/dashboard/my-leads/page.tsx` | `/dashboard/my-leads` | User's created leads |
| `app/dashboard/assigned-leads/page.tsx` | `/dashboard/assigned-leads` | Leads assigned to user |
| `app/dashboard/scheduled-leads/page.tsx` | `/dashboard/scheduled-leads` | Scheduled follow-ups |
| `app/dashboard/comments/page.tsx` | `/dashboard/comments` | All comments |
| `app/dashboard/my-comments/page.tsx` | `/dashboard/my-comments` | User's comments |
| `app/dashboard/users/page.tsx` | `/dashboard/users` | User management |
| `app/dashboard/users/[id]/page.tsx` | `/dashboard/users/abc` | Single user details |
| `app/dashboard/companies/page.tsx` | `/dashboard/companies` | Company management |
| `app/dashboard/companies/[id]/page.tsx` | `/dashboard/companies/xyz` | Single company |
| `app/dashboard/pos/page.tsx` | `/dashboard/pos` | Purchase orders |
| `app/dashboard/profile/page.tsx` | `/dashboard/profile` | User's profile |
| `app/dashboard/insights/page.tsx` | `/dashboard/insights` | Analytics |
| `app/dashboard/notifications/page.tsx` | `/dashboard/notifications` | View notifications |
| `app/dashboard/notify/page.tsx` | `/dashboard/notify` | Send notifications |
| `app/dashboard/custom-message/page.tsx` | `/dashboard/custom-message` | Custom message |

## Dynamic Routes:

`[id]` in folder names means dynamic parameter.

Example: `/dashboard/leads/123`
- `123` is the dynamic `id` parameter
- In the page, access it via: `params.id`

---

# 11. KEY FILES EXPLANATION

## 1. app/layout.tsx (Root Layout)

Purpose: Wraps all pages with common elements (fonts, providers)

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

// Font configuration
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// SEO metadata
export const metadata: Metadata = {
  title: "SalesRQ",
  description: "Advanced Lead Management System",
  icons: { icon: "/icon.svg" },
};

// Layout component
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
```

## 2. middleware.ts (Route Protection)

Purpose: Protects routes and manages authentication sessions

```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    return await updateSession(request)
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
```

## 3. app/globals.css

Purpose: Global CSS styles using Tailwind CSS

## 4. package.json

Purpose: Defines project dependencies and scripts

## 5. tsconfig.json

Purpose: TypeScript compiler configuration

## 6. next.config.ts

Purpose: Next.js framework configuration

---

# 12. ENVIRONMENT VARIABLES

## File: .env.local

This file contains sensitive configuration that should NOT be committed to Git.

```
# Supabase Configuration

# Public URL of your Supabase project
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Public anonymous key (safe for client-side)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Secret service role key (server-side only!)
SUPABASE_SERVICE_ROLE_KEY=your_secret_key_here
```

## Variable Naming Convention:

| Prefix | Visibility |
|--------|------------|
| `NEXT_PUBLIC_` | Exposed to browser (public) |
| No prefix | Server-only (secret) |

## Where to find these values:

1. Go to https://supabase.com
2. Open your project
3. Go to Settings > API
4. Copy the values:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

---

# 13. KEY CONCEPTS TO REMEMBER

## 1. Next.js App Router

- Folder-based routing (`app/dashboard/leads/page.tsx` = `/dashboard/leads`)
- Server Components by default
- Client Components need `'use client'`

## 2. Server Components vs Client Components

| Feature | Server Component | Client Component |
|---------|------------------|------------------|
| Where it runs | Server | Browser |
| Can fetch data directly | ✅ Yes | ❌ No (needs API) |
| Can use hooks (useState) | ❌ No | ✅ Yes |
| Can use browser APIs | ❌ No | ✅ Yes |
| Marked with | Nothing (default) | `'use client'` |

## 3. Server Actions

- Functions that run on the server
- Marked with `'use server'`
- Used for database operations
- Can be called from client components

## 4. Supabase Row Level Security (RLS)

- Security policies at database level
- Controls who can read/write which rows
- Based on authenticated user's ID

## 5. TypeScript

- JavaScript with type annotations
- Catches errors at compile time
- Makes code more maintainable

## 6. Tailwind CSS

- Utility-first CSS framework
- Classes like `p-4`, `text-lg`, `bg-blue-500`
- Faster styling without writing CSS files

---

# 14. COMMON DEVELOPMENT TASKS

## How to Add a New Page:

1. Create folder: `app/dashboard/new-page/`
2. Create file: `app/dashboard/new-page/page.tsx`
3. Add page content:
```tsx
export default function NewPage() {
    return (
        <div>
            <h1>New Page</h1>
        </div>
    )
}
```

## How to Add a New Server Action:

1. Open `app/dashboard/actions.ts`
2. Add new function:
```typescript
export async function myNewAction(formData: FormData) {
    const supabase = await createClient()
    // Your database logic here
    return { success: true }
}
```

## How to Create a New Component:

1. Create file: `components/dashboard/my-component.tsx`
2. Add component code:
```tsx
interface MyComponentProps {
    title: string
}

export function MyComponent({ title }: MyComponentProps) {
    return <div>{title}</div>
}
```
3. Import in page: `import { MyComponent } from '@/components/dashboard/my-component'`

## How to Add a New Database Table:

1. Go to Supabase dashboard
2. Open SQL Editor
3. Write CREATE TABLE statement
4. Add to `docs.sql` for documentation
5. Enable RLS and create policies

---

# END OF DOCUMENTATION

**Last Updated:** February 2026  
**Author:** RigTeq Technologies  

For questions or issues, contact the development team.

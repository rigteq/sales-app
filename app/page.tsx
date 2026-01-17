
import { LoginForm } from '@/components/auth/login-form'

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-zinc-50 dark:bg-zinc-950">
      {/* Branding Section - 60% on desktop */}
      <div className="relative flex w-full flex-col justify-between bg-zinc-900 p-10 text-white lg:w-[60%] lg:p-20">
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          Rigteq Sales
        </div>
        <div className="relative z-20 mt-10 lg:mt-32">
          <blockquote className="space-y-2">
            <p className="text-3xl font-bold font-serif italic mb-4">
              "Streamline your sales process and close deals faster with our comprehensive Lead Management System."
            </p>
            <footer className="text-sm text-zinc-400">
              &copy; {new Date().getFullYear()} Rigteq Inc.
            </footer>
          </blockquote>
        </div>
        {/* Abstract background pattern or gradient could go here */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 opacity-50 z-0" />
      </div>

      {/* Login Section - 40% on desktop */}
      <div className="flex w-full flex-col items-center justify-center p-8 lg:w-[40%]">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground text-zinc-500 dark:text-zinc-400">
              Enter your credentials to access your account
            </p>
          </div>
          <LoginForm />
          <p className="px-8 text-center text-sm text-muted-foreground text-zinc-500 dark:text-zinc-400">
            For access issues, please contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  )
}

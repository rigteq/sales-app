
import { LoginForm } from '@/components/auth/login-form'

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-slate-50 dark:bg-slate-950">
      {/* Branding Section - 60% on desktop */}
      <div className="relative flex w-full flex-col justify-between bg-slate-900 p-10 text-white lg:w-[60%] lg:p-20 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl"></div>

        <div className="relative z-20 flex items-center gap-3 text-2xl font-bold tracking-tight">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
            R
          </div>
          RigTeq Sales
        </div>

        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-6">
            <p className="text-4xl font-extrabold leading-[1.1] tracking-tight lg:text-6xl max-w-2xl">
              Empowering Your
              <span className="block text-indigo-400">Sales Velocity.</span>
            </p>
            <div className="h-1 w-20 bg-indigo-500 rounded-full"></div>
            <footer className="text-xl text-slate-400 font-medium max-w-md">
              The intelligent ecosystem for high-volume lead management and real-time conversion.
            </footer>
          </blockquote>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:40px_40px] opacity-30"></div>
      </div>

      {/* Login Section - 40% on desktop */}
      <div className="flex w-full flex-col justify-center bg-white p-10 dark:bg-slate-950 lg:w-[40%] lg:p-24 relative">
        <div className="mx-auto flex w-full flex-col justify-center space-y-10 sm:w-[400px]">
          <div className="flex flex-col space-y-3 text-center lg:text-left">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-50">Log In</h1>
            <p className="text-base text-slate-500 dark:text-slate-400">
              Access your performance dashboard and active leads.
            </p>
          </div>

          <div className="p-1 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
            <div className="bg-white dark:bg-slate-950 rounded-[22px] p-6 shadow-sm">
              <LoginForm />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-center text-xs text-slate-400 lg:text-left uppercase tracking-widest font-bold">
              Powered by Rigteq Technologies
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

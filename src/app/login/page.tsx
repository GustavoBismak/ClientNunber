import { login } from '@/app/login/actions'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col lg:flex-row bg-[#fafafa] dark:bg-[#050505] transition-colors duration-300">
      
      {/* Left side: Image/Brand panel */}
      <div className="relative w-full lg:w-1/2 min-h-[40vh] lg:min-h-screen overflow-hidden flex flex-col justify-between p-8 lg:p-12 z-10 shadow-2xl">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90 dark:opacity-70 transition-opacity duration-500 scale-105"
          style={{ backgroundImage: "url('/images/mov-store.png')" }}
        />
        {/* Gradients to make text readable and blend edges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 dark:from-black/90 dark:via-black/50 dark:to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 to-transparent dark:from-purple-900/50" />
        
        <div className="relative z-20 flex items-center gap-4">
          <img src="/images/logo.png" alt="MOV Logo" className="w-14 h-14 rounded-2xl object-contain bg-white/10 backdrop-blur-md p-1 shadow-xl border border-white/10" />
          <span className="text-white font-bold text-2xl tracking-wider drop-shadow-md">MOV</span>
        </div>

        <div className="relative z-20 mt-auto">
          <h1 className="text-3xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4 drop-shadow-lg">
            Gestão inteligente <br className="hidden lg:block"/> de atendimentos.
          </h1>
          <p className="text-gray-200 text-sm lg:text-base max-w-md font-medium drop-shadow-md">
            O painel exclusivo para o controle de recepção, análise de métricas e produtividade da loja.
          </p>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative z-20">
        {/* Top right theme toggle */}
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-sm xl:max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Bem-vindo(a) de volta</h2>
            <p className="text-zinc-500 dark:text-gray-400 text-sm mt-2">
              Insira suas credenciais para acessar o Client Nunber.
            </p>
          </div>

          <form className="flex flex-col gap-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-gray-300">
                E-mail corporativo
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full h-12 px-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                placeholder="nome@movfibra.com.br"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-gray-300">
                  Senha
                </label>
                <a href="#" className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium">
                  Esqueceu a senha?
                </a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full h-12 px-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              formAction={login}
              className="mt-6 w-full h-12 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors focus:ring-2 focus:ring-purple-500/50 focus:outline-none shadow-lg shadow-purple-500/25"
            >
              Acessar Painel
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

import { Outlet, ScrollRestoration } from 'react-router'
import { Sky } from '@/components/sky/Sky'
import { Footer } from './Footer'
import { Masthead } from './Masthead'

export function AppShell() {
  return (
    <>
      <Sky />
      <a
        href="#conteudo"
        className="sr-only-focusable label-mono fixed top-3 left-3 z-50 bg-amber px-4 py-3 text-void"
      >
        Pular para o conteúdo
      </a>
      <Masthead />
      {/* overflow-x-clip: mídia que sangra até a borda (e as marcas de corte em volta dela)
          não pode gerar rolagem horizontal no desktop, onde a barra de rolagem ocupa espaço */}
      <main id="conteudo" tabIndex={-1} className="relative overflow-x-clip outline-none">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </>
  )
}

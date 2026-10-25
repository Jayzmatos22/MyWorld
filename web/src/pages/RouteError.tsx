import { isRouteErrorResponse, useRouteError } from 'react-router'
import { StatusPanel } from '@/components/ui/StatusPanel'

/** Última rede de segurança: erros de renderização inesperados. */
export function RouteError() {
  const error = useRouteError()
  const detail = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Erro desconhecido'

  return (
    <StatusPanel
      variant="error"
      code="Falha no instrumento"
      title="Algo quebrou na leitura desta página."
      actions={
        <a href="/" className="label-mono text-amber underline underline-offset-4">
          Recarregar o arquivo
        </a>
      }
    >
      <span className="font-mono text-meta">{detail}</span>
    </StatusPanel>
  )
}

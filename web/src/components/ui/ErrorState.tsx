import type { ReactNode } from 'react'
import type { ApiError } from '@/api/errors'
import { StatusPanel } from './StatusPanel'
import { Button, ButtonLink } from './Button'

interface Copy {
  variant: 'error' | 'limit'
  code: string
  title: string
  body: ReactNode
}

function copyFor(error: ApiError): Copy {
  switch (error.kind) {
    case 'rate_limited': {
      const minutes = error.retryAfter ? Math.max(1, Math.ceil(error.retryAfter / 60)) : null
      return {
        variant: 'limit',
        code: '429 · Cota de observação esgotada',
        title: 'O telescópio precisa descansar.',
        body: (
          <>
            A NASA limita quantas observações podem ser pedidas por hora.{' '}
            {minutes ? `Tente de novo em cerca de ${minutes} min.` : 'A cota se renova em até uma hora.'} As placas
            que você já abriu e os seus favoritos continuam disponíveis.
          </>
        ),
      }
    }
    case 'not_found':
      return {
        variant: 'error',
        code: '404 · Placa ausente',
        title: 'Nenhuma placa nesta data.',
        body: 'Pode ser que a NASA ainda não tenha publicado a imagem deste dia, ou que ela não exista no arquivo.',
      }
    case 'network':
      return {
        variant: 'error',
        code: 'Sem sinal',
        title: 'Perdemos contato com o observatório.',
        body: 'Verifique sua conexão e tente novamente.',
      }
    case 'unavailable':
      return {
        variant: 'error',
        code: '503 · Arquivo indisponível',
        title: 'O arquivo da NASA não respondeu.',
        body: 'O serviço pode estar instável. Em alguns instantes deve voltar.',
      }
    case 'bad_request':
      return { variant: 'error', code: '400 · Pedido inválido', title: 'Não foi possível observar isso.', body: error.message }
    case 'invalid_response':
    case 'unknown':
      return {
        variant: 'error',
        code: 'Leitura corrompida',
        title: 'Algo saiu do foco.',
        body: 'Recebemos uma resposta que não conseguimos interpretar.',
      }
  }
}

export function ErrorState({ error, onRetry, className }: { error: ApiError; onRetry?: () => void; className?: string }) {
  const copy = copyFor(error)
  return (
    <StatusPanel
      variant={copy.variant}
      code={copy.code}
      title={copy.title}
      className={className}
      actions={
        <>
          {onRetry && error.kind !== 'not_found' && error.kind !== 'bad_request' ? (
            <Button onClick={onRetry}>Tentar de novo</Button>
          ) : null}
          <ButtonLink to={error.kind === 'rate_limited' ? '/favoritos' : '/'}>
            {error.kind === 'rate_limited' ? 'Ver favoritos' : 'Voltar para hoje'}
          </ButtonLink>
        </>
      }
    >
      {copy.body}
    </StatusPanel>
  )
}

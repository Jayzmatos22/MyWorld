import { StatusPanel } from '@/components/ui/StatusPanel'
import { ButtonLink } from '@/components/ui/Button'

export function NotFoundPage() {
  return (
    <>
      <title>Fora do mapa — myPlanet</title>
      <StatusPanel
        variant="error"
        code="404 · Fora do mapa estelar"
        title="Esta região do céu não foi catalogada."
        actions={<ButtonLink to="/">Voltar para hoje</ButtonLink>}
      >
        O endereço não corresponde a nenhuma página do arquivo.
      </StatusPanel>
    </>
  )
}

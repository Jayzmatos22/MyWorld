import { useFavorites } from '@/hooks/useFavorites'
import { ContactSheet } from '@/components/plate/ContactSheet'
import { SectionHeading } from '@/components/layout/SectionHeading'
import { StatusPanel } from '@/components/ui/StatusPanel'
import { ButtonLink } from '@/components/ui/Button'

export function FavoritesPage() {
  const favorites = useFavorites()

  return (
    <>
      <title>Favoritos — myPlanet</title>
      <SectionHeading kicker={`Arquivo pessoal · ${favorites.length} placas`} title="Suas placas guardadas">
        Ficam salvas neste navegador, sem conta e sem servidor.
      </SectionHeading>

      {favorites.length === 0 ? (
        <StatusPanel
          variant="empty"
          code="Gaveta vazia"
          title="Nenhuma placa arquivada ainda."
          actions={
            <>
              <ButtonLink to="/">Placa de hoje</ButtonLink>
              <ButtonLink to="/acaso">Sortear placas</ButtonLink>
            </>
          }
        >
          Toque na estrela de qualquer placa para guardá-la aqui.
        </StatusPanel>
      ) : (
        <ContactSheet items={favorites} offset={5} label="Placas favoritas" />
      )}
    </>
  )
}

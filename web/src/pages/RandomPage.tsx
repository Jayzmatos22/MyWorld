import { useRandomApods } from '@/hooks/useApod'
import { ContactSheet, ContactSheetSkeleton, toSheetItem } from '@/components/plate/ContactSheet'
import { SectionHeading } from '@/components/layout/SectionHeading'
import { ErrorState } from '@/components/ui/ErrorState'
import { Button } from '@/components/ui/Button'
import { DiceIcon } from '@/components/ui/icons'

const COUNT = 8

export function RandomPage() {
  const { state, retry, reroll, draw } = useRandomApods(COUNT)

  return (
    <>
      <title>Acaso — myPlanet</title>
      <SectionHeading
        kicker="Sorteio do arquivo"
        title="Ao acaso, trinta anos de céu"
        aside={
          <Button onClick={reroll} disabled={state.status === 'loading'}>
            <DiceIcon className="transition-transform duration-(--duration-slow) ease-spring group-hover/btn:rotate-90" />
            Sortear outras {COUNT}
          </Button>
        }
      >
        Oito placas tiradas de qualquer noite desde 1995. Cada sorteio é uma nova gaveta do arquivo.
      </SectionHeading>

      {state.status === 'loading' ? <ContactSheetSkeleton count={COUNT} offset={3} /> : null}
      {state.status === 'error' ? <ErrorState error={state.error} onRetry={retry} /> : null}
      {state.status === 'success' ? (
        <ContactSheet key={draw} items={state.data.map(toSheetItem)} offset={3} label="Placas sorteadas" />
      ) : null}
    </>
  )
}

import type { RankedPlate } from "@/api/types";
import { useRanking } from "@/hooks/useLikes";
import {
  ContactSheet,
  ContactSheetSkeleton,
  type SheetItem,
} from "@/components/plate/ContactSheet";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { ErrorState } from "@/components/ui/ErrorState";
import { StatusPanel } from "@/components/ui/StatusPanel";
import { ButtonLink } from "@/components/ui/Button";

function toRankedItem(plate: RankedPlate): SheetItem {
  return {
    date: plate.date,
    title: plate.title,
    mediaType: plate.media_type,
    thumb: plate.thumb,
    badge: `★ ${plate.likes.toLocaleString("pt-BR")}`,
  };
}

/** Ranking da comunidade: as placas mais curtidas por todos os visitantes. */
export function FavoritesPage() {
  const { state, retry } = useRanking();

  return (
    <>
      <title>Favoritos — MyWorld</title>
      <SectionHeading
        kicker={
          state.status === "success"
            ? `Ranking da comunidade · ${state.data.length} placas`
            : "Ranking da comunidade"
        }
        title="As placas mais curtidas"
      >
        Cada curtida de qualquer visitante soma um ponto. Curta quantas vezes
        quiser.
      </SectionHeading>

      {state.status === "loading" ? <ContactSheetSkeleton offset={5} /> : null}
      {state.status === "error" ? (
        <ErrorState error={state.error} onRetry={retry} />
      ) : null}
      {state.status === "success" && state.data.length === 0 ? (
        <StatusPanel
          variant="empty"
          code="Gaveta vazia"
          title="Nenhuma placa curtida ainda."
          actions={
            <>
              <ButtonLink to="/">Placa de hoje</ButtonLink>
              <ButtonLink to="/acaso">Sortear placas</ButtonLink>
            </>
          }
        >
          Toque na estrela de qualquer placa para ela entrar no ranking.
        </StatusPanel>
      ) : null}
      {state.status === "success" && state.data.length > 0 ? (
        <ContactSheet
          items={state.data.map(toRankedItem)}
          offset={5}
          label="Placas mais curtidas"
        />
      ) : null}
    </>
  );
}

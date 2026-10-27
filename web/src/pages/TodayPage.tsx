import { useTodayApod, useApodRange } from "@/hooks/useApod";
import type { IsoDate } from "@/api/types";
import { addDays } from "@/lib/date";
import {
  PlateFeature,
  PlateFeatureSkeleton,
} from "@/components/plate/PlateFeature";
import { PlateStrip } from "@/components/plate/PlateStrip";
import { toSheetItem } from "@/components/plate/ContactSheet";
import { ErrorState } from "@/components/ui/ErrorState";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/icons";

export function TodayPage() {
  const { state, retry } = useTodayApod();

  return (
    <>
      <title>MyWorld — Placa do dia</title>
      {state.status === "loading" ? (
        <PlateFeatureSkeleton eyebrow="Placa do dia" />
      ) : null}
      {state.status === "error" ? (
        <ErrorState error={state.error} onRetry={retry} />
      ) : null}
      {state.status === "success" ? (
        <>
          <PlateFeature apod={state.data} eyebrow="Placa do dia" />
          <PreviousNights before={state.data.date} />
        </>
      ) : null}
    </>
  );
}

function PreviousNights({ before }: { before: IsoDate }) {
  const { state } = useApodRange(addDays(before, -6), addDays(before, -1));
  // Falha aqui não deve derrubar a página: a tira simplesmente não aparece
  if (state.status === "error") return null;

  return (
    <section aria-labelledby="noites-anteriores" className="mt-section">
      <div className="page-grid mb-8 items-end gap-y-6">
        <Reveal className="col-span-full md:col-span-3">
          <p className="label-mono text-ink-muted">Seis noites antes</p>
        </Reveal>
        <Reveal
          index={1}
          className="col-span-full flex items-end justify-between gap-6 md:col-span-9"
        >
          <h2 id="noites-anteriores" className="text-headline">
            Noites <em className="text-ink-muted">anteriores</em>
          </h2>
          <ButtonLink to="/galeria" className="hidden shrink-0 sm:inline-flex">
            Galeria <ArrowIcon />
          </ButtonLink>
        </Reveal>
      </div>
      <div className="mx-auto max-w-(--container-page)">
        <PlateStrip
          items={
            state.status === "success" ? state.data.map(toSheetItem) : null
          }
        />
      </div>
    </section>
  );
}

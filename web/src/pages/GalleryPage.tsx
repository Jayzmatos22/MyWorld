import { useSearchParams } from "react-router";
import type { IsoDate } from "@/api/types";
import { useApodRange } from "@/hooks/useApod";
import { addDays, diffInDays, formatPlateDate, todayIso } from "@/lib/date";
import {
  ContactSheet,
  ContactSheetSkeleton,
  toSheetItem,
} from "@/components/plate/ContactSheet";
import { RangeForm, validateRange } from "@/components/plate/RangeForm";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { ErrorState } from "@/components/ui/ErrorState";
import { StatusPanel } from "@/components/ui/StatusPanel";

const DEFAULT_SPAN = 14;

/** O intervalo vive na URL: dá para compartilhar e o "voltar" funciona. */
function useRangeParams(): [
  IsoDate,
  IsoDate,
  (start: IsoDate, end: IsoDate) => void,
] {
  const [params, setParams] = useSearchParams();
  const fallbackEnd = todayIso();
  const fallbackStart = addDays(fallbackEnd, -(DEFAULT_SPAN - 1));
  const from = params.get("de") ?? "";
  const to = params.get("ate") ?? "";
  const valid = validateRange(from, to) === null;
  const start = valid ? (from as IsoDate) : fallbackStart;
  const end = valid ? (to as IsoDate) : fallbackEnd;

  const set = (s: IsoDate, e: IsoDate) => {
    setParams({ de: s, ate: e });
  };
  return [start, end, set];
}

export function GalleryPage() {
  const [start, end, setRange] = useRangeParams();
  const { state, retry } = useApodRange(start, end);
  const span = diffInDays(start, end) + 1;

  return (
    <>
      <title>Galeria — MyWorld</title>
      <SectionHeading
        kicker="Folha de contato"
        title="Galeria por intervalo"
        aside={
          <RangeForm
            key={`${start}:${end}`}
            start={start}
            end={end}
            onSubmit={setRange}
          />
        }
      >
        Escolha até 31 noites e veja as placas lado a lado, como num catálogo de
        observatório.
      </SectionHeading>

      <div className="page-grid mb-10">
        <p
          className="label-mono tabular col-span-full text-ink-muted md:col-span-9 md:col-start-4"
          aria-live="polite"
        >
          {formatPlateDate(start)} — {formatPlateDate(end)}{" "}
          <span className="text-ink-faint">·</span>{" "}
          {state.status === "success"
            ? `${state.data.length} placas`
            : `${span} noites`}
        </p>
      </div>

      {state.status === "loading" ? (
        <ContactSheetSkeleton count={Math.min(span, 7)} />
      ) : null}
      {state.status === "error" ? (
        <ErrorState error={state.error} onRetry={retry} />
      ) : null}
      {state.status === "success" && state.data.length === 0 ? (
        <StatusPanel
          variant="empty"
          code="Céu encoberto"
          title="Nenhuma placa neste intervalo."
        >
          A NASA ainda não publicou imagens para essas datas. Tente um intervalo
          um pouco mais antigo.
        </StatusPanel>
      ) : null}
      {state.status === "success" && state.data.length > 0 ? (
        <ContactSheet
          items={state.data.map(toSheetItem)}
          label="Placas do intervalo"
        />
      ) : null}
    </>
  );
}

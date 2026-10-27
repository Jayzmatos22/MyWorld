import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import type { IsoDate } from "@/api/types";
import { ApiError } from "@/api/errors";
import { useApodByDate } from "@/hooks/useApod";
import {
  addDays,
  APOD_FIRST_DAY,
  formatPlateDate,
  isIsoDate,
  isWithinArchive,
  todayIso,
} from "@/lib/date";
import { cn } from "@/lib/cn";
import {
  PlateFeature,
  PlateFeatureSkeleton,
} from "@/components/plate/PlateFeature";
import { ErrorState } from "@/components/ui/ErrorState";
import { ArrowIcon } from "@/components/ui/icons";

export function DetailPage() {
  const { date = "" } = useParams();
  if (!isIsoDate(date) || !isWithinArchive(date)) {
    return (
      <ErrorState
        error={
          new ApiError(
            "bad_request",
            "A data precisa estar entre 16/06/1995 e hoje, no formato AAAA-MM-DD.",
          )
        }
      />
    );
  }
  return <Detail key={date} date={date} />;
}

function Detail({ date }: { date: IsoDate }) {
  const { state, retry } = useApodByDate(date);
  const prev = date > APOD_FIRST_DAY ? addDays(date, -1) : null;
  const next = date < todayIso() ? addDays(date, 1) : null;
  useArrowNavigation(prev, next);

  const navigation = <DayNavigation prev={prev} next={next} />;

  return (
    <>
      <title>
        {state.status === "success"
          ? `${state.data.title} — MyWorld`
          : `Placa ${date} — MyWorld`}
      </title>
      {state.status === "loading" ? (
        <PlateFeatureSkeleton eyebrow={`Placa · ${formatPlateDate(date)}`} />
      ) : null}
      {state.status === "error" ? (
        <>
          <ErrorState error={state.error} onRetry={retry} />
          <div className="page-grid">
            <div className="col-span-full md:col-span-6 md:col-start-6">
              {navigation}
            </div>
          </div>
        </>
      ) : null}
      {state.status === "success" ? (
        <PlateFeature
          apod={state.data}
          eyebrow="Placa de arquivo"
          transitionName="plate"
          navigation={navigation}
        />
      ) : null}
    </>
  );
}

/** ← e → percorrem o arquivo, exceto enquanto se digita em um campo. */
function useArrowNavigation(prev: IsoDate | null, next: IsoDate | null) {
  const navigate = useNavigate();
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
        return;
      const target = event.target as HTMLElement | null;
      if (
        target?.closest(
          'input, textarea, select, [contenteditable="true"], iframe',
        )
      )
        return;
      const to =
        event.key === "ArrowLeft"
          ? prev
          : event.key === "ArrowRight"
            ? next
            : null;
      if (!to) return;
      event.preventDefault();
      void navigate(`/placa/${to}`, { viewTransition: true });
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [navigate, prev, next]);
}

function DayNavigation({
  prev,
  next,
}: {
  prev: IsoDate | null;
  next: IsoDate | null;
}) {
  return (
    <nav
      aria-label="Navegar entre dias"
      className="grid grid-cols-2 border-t border-rule/70"
    >
      <DayLink to={prev} direction="left" label="Anterior" />
      <DayLink to={next} direction="right" label="Seguinte" />
    </nav>
  );
}

function DayLink({
  to,
  direction,
  label,
}: {
  to: IsoDate | null;
  direction: "left" | "right";
  label: string;
}) {
  const align = direction === "right" ? "items-end text-right" : "items-start";
  if (!to) {
    return (
      <span
        className={cn("flex flex-col gap-1 py-3 opacity-35", align)}
        aria-hidden="true"
      >
        <span className="label-mono text-ink-faint">{label}</span>
        <span className="label-mono">—</span>
      </span>
    );
  }
  return (
    <Link
      to={`/placa/${to}`}
      viewTransition
      rel={direction === "left" ? "prev" : "next"}
      className={cn("group flex flex-col gap-1 py-3", align)}
    >
      <span className="label-mono text-ink-faint">{label}</span>
      <span className="label-mono tabular inline-flex items-center gap-2 text-ink-muted transition-colors group-hover:text-amber">
        {direction === "left" ? (
          <ArrowIcon
            direction="left"
            className="transition-transform duration-(--duration-base) ease-spring group-hover:-translate-x-1"
          />
        ) : null}
        {formatPlateDate(to)}
        {direction === "right" ? (
          <ArrowIcon className="transition-transform duration-(--duration-base) ease-spring group-hover:translate-x-1" />
        ) : null}
      </span>
    </Link>
  );
}

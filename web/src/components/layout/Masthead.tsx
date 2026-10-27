import { NavLink } from "react-router";
import { useFavorites } from "@/hooks/useFavorites";
import {
  archiveVolume,
  dayOfYear,
  formatPlateDate,
  todayIso,
} from "@/lib/date";
import { cn } from "@/lib/cn";
import { DateJump } from "./DateJump";

const NAV = [
  { to: "/", label: "Hoje", end: true },
  { to: "/galeria", label: "Galeria", end: false },
  { to: "/acaso", label: "Acaso", end: false },
  { to: "/favoritos", label: "Favoritos", end: false },
] as const;

export function Masthead() {
  const today = todayIso();
  const favorites = useFavorites();

  return (
    <header className="relative z-10 [view-transition-name:masthead]">
      {/* Linha de catálogo, como o cabeçalho de uma revista científica */}
      <div className="border-b border-rule/70">
        <div className="label-mono mx-auto flex max-w-(--container-page) items-center justify-between gap-4 px-gutter py-2 text-ink-muted">
          <span>
            Arquivo de placas <span className="text-ink-faint">·</span> Vol.{" "}
            {archiveVolume(today)}
          </span>
          <span className="tabular hidden sm:inline">
            Nº {String(dayOfYear(today)).padStart(3, "0")}{" "}
            <span className="text-ink-faint">·</span> {formatPlateDate(today)}
          </span>
          <span className="hidden md:inline text-color-yellow">NASA / APOD</span>
        </div>
      </div>

      <div className="mx-auto flex max-w-(--container-page) flex-wrap items-end justify-between gap-x-10 gap-y-5 px-gutter pt-6 pb-5">
        <NavLink
          to="/"
          viewTransition
          className="group -mb-1 leading-none"
          aria-label="MyWorld — página inicial"
        >
          <span className="font-display text-[2.1rem] font-[340] tracking-[-0.03em]">
            <em className="font-[700] text-ink-muted transition-colors duration-(--duration-base) ease-out-quart group-hover:text-amber">
              My
            </em>
            World
          </span>
        </NavLink>

        <DateJump className="order-3 md:order-none" />

        <nav
          aria-label="Principal"
          className="order-2 -mx-gutter w-[calc(100%+2*var(--spacing-gutter))] overflow-x-auto px-gutter md:order-none md:mx-0 md:w-auto md:overflow-visible md:px-0"
        >
          <ul className="flex gap-6 md:gap-8">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  viewTransition
                  className={({ isActive }) =>
                    cn(
                      "label-mono relative inline-flex items-baseline gap-1.5 py-2 transition-colors duration-(--duration-quick) ease-out-quart",
                      "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:bg-amber after:transition-transform after:duration-(--duration-base) after:ease-out-expo",
                      isActive
                        ? "text-ink after:scale-x-100"
                        : "text-ink-muted after:scale-x-0 hover:text-ink hover:after:scale-x-100",
                    )
                  }
                >
                  {item.label}
                  {item.to === "/favoritos" && favorites.length > 0 ? (
                    <span className="tabular text-amber">
                      {favorites.length}
                    </span>
                  ) : null}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

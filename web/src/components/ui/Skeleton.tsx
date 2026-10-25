import { cn } from '@/lib/cn'
import { ScanLine } from '@/components/plate/PlateImage'

/** Placa ainda não exposta: superfície escura + linha de varredura. */
export function PlateSkeleton({ className, label }: { className?: string; label?: string }) {
  return (
    <div className={cn('relative overflow-hidden bg-night/70', className)}>
      <ScanLine {...(label ? { label } : {})} />
    </div>
  )
}

/** Linhas de texto como réguas finas, com larguras variadas. */
export function TextSkeleton({ lines = 4, className }: { lines?: number; className?: string }) {
  const widths = ['w-full', 'w-11/12', 'w-full', 'w-4/5', 'w-10/12', 'w-2/3']
  return (
    <div aria-hidden="true" className={cn('flex flex-col gap-3.5', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <span key={i} className={cn('h-2 animate-blink bg-dusk', widths[i % widths.length])} style={{ animationDelay: `${i * 90}ms` }} />
      ))}
    </div>
  )
}

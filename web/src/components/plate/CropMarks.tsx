import { cn } from '@/lib/cn'

/** Marcas de corte de gráfica nos quatro cantos — a "moldura" das placas. */
export function CropMarks({ className }: { className?: string }) {
  const mark = 'absolute size-3.5 border-ink-faint/80'
  return (
    <span aria-hidden="true" className={cn('pointer-events-none absolute -inset-2.5', className)}>
      <span className={cn(mark, 'top-0 left-0 border-t border-l')} />
      <span className={cn(mark, 'top-0 right-0 border-t border-r')} />
      <span className={cn(mark, 'bottom-0 left-0 border-b border-l')} />
      <span className={cn(mark, 'right-0 bottom-0 border-r border-b')} />
    </span>
  )
}

import { cn } from '@/lib/utils/cn'
import { cva, type VariantProps } from 'class-variance-authority'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary/10 text-primary shadow-sm',
        secondary: 'border-transparent bg-muted text-muted-foreground',
        destructive: 'border-transparent bg-danger/10 text-danger shadow-sm',
        outline: 'text-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

// ponytail: sensor status mapped to badge variants
function BadgeSensor({ status }: { status: 'aman' | 'waspada' | 'bahaya' }) {
  const map = { aman: 'default' as const, waspada: 'destructive' as const, bahaya: 'destructive' as const }
  const label = { aman: 'Aman', waspada: 'Waspada', bahaya: 'Bahaya' }
  return (
    <Badge variant={map[status]} className={status === 'waspada' ? 'bg-warning/10 text-warning' : undefined}>
      {label[status]}
    </Badge>
  )
}

export { Badge, BadgeSensor, badgeVariants }

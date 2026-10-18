/**
 * ZeeShaoor design system — public surface.
 *
 * Import from `@/components/ui` rather than deep paths so the internal file
 * layout can change without touching call sites.
 *
 *   import { Button, Card, StatCard, EmptyState } from '@/components/ui'
 */

export { cn } from './cn'
export type { ClassValue } from './cn'

export { default as Button } from './Button'
export type { ButtonProps, ButtonSize, ButtonVariant } from './Button'

export { default as Card, CardHeader, CardDivider } from './Card'

export { default as Badge } from './Badge'
export type { BadgeTone } from './Badge'

export { default as Input, Textarea, Select } from './Input'

export { default as Spinner } from './Spinner'

export {
  default as Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonRegion,
} from './Skeleton'

export { default as EmptyState } from './EmptyState'
export { default as ErrorState } from './ErrorState'

export { default as StatCard } from './StatCard'
export type { StatTone } from './StatCard'

export { default as PageHeader, PageContainer, SectionHeading } from './PageHeader'

export {
  TableWrap,
  Table,
  THead,
  TH,
  TBody,
  TR,
  TD,
  TEmpty,
} from './Table'

export { default as Progress, ProgressRing } from './Progress'
export type { ProgressTone } from './Progress'

export { ToastProvider, useToast } from './Toast'
export type { Toast, ToastType } from './Toast'

export { default as Menu } from './Menu'
export type { MenuItem } from './Menu'

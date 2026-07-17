import { AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ErrorAlertProps = {
  error: string
  onDismiss: () => void
  title?: string
}

export function ErrorAlert({ error, onDismiss, title = 'Error' }: ErrorAlertProps) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-destructive/50 bg-destructive/5 p-4">
      <AlertCircle className="mt-0.5 size-5 flex-shrink-0 text-destructive" />
      <div className="flex-1">
        <h3 className="font-semibold text-destructive">{title}</h3>
        <p className="mt-1 text-sm text-destructive/90">{error}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDismiss}
        className="ml-2 flex-shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <X className="size-4" />
      </Button>
    </div>
  )
}

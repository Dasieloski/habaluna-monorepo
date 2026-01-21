'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface AdultsOnlyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
  productName?: string
}

/**
 * Modal de confirmación de edad para productos +18.
 * Diseño elegante y minimalista, consistente con la paleta del sitio.
 */
export function AdultsOnlyModal({
  open,
  onOpenChange,
  onConfirm,
  productName,
}: AdultsOnlyModalProps) {
  const handleConfirm = async () => {
    await onConfirm()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground font-heading">
            Confirmar edad
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            {productName ? (
              <>El producto <span className="font-medium text-foreground">{productName}</span> solo se entrega a mayores de 18 años. Confirmar edad para continuar.</>
            ) : (
              <>Este producto solo se entrega a mayores de 18 años. Confirmar edad para continuar.</>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-primary text-primary-foreground">
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

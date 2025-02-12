import { File, FileImage, Image } from 'lucide-react'
import type React from 'react'
import { type DropzoneOptions, useDropzone } from 'react-dropzone'
import { cn } from '~/lib/utils'

export type DropzoneProps = DropzoneOptions & {
  label?: string
  preview?: string
}

export function StyledDropzone({
  className,
  label,
  preview,
  ...props
}: DropzoneProps & { className?: string }) {
  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } =
    useDropzone(props)

  return (
    <div className={cn('w-full', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'flex flex-1 items-center justify-center w-full p-5',
          'border-2 border-dashed rounded-md',
          'transition-colors duration-200 ease-in-out',
          'bg-background hover:bg-accent/50',
          'border-muted-foreground/25',
          isFocused && 'border-primary/50',
          isDragAccept && 'border-green-500',
          isDragReject && 'border-destructive',
        )}
      >
        <Image className="h-10 w-10 mr-4 stroke-primary/50" />

        <input {...getInputProps()} />
        <p className="text-sm text-muted-foreground">
          {label ?? 'Arraste e solte ou clique para selecionar um arquivo'}
        </p>
      </div>
    </div>
  )
}

import * as React from 'react'

import { EyeClosedIcon, EyeIcon } from 'lucide-react'
import { Input } from './input'

const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'>
>(({ className, type, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div className="flex w-full gap-1 items-center">
      <Input type={showPassword ? 'text' : 'password'} ref={ref} {...props} />
      <button
        type="button"
        className="h-9 w-9 flex items-center justify-center rounded-md cursor-pointer active:bg-gray-200 dark:active:bg-gray-800 transition-all hover:bg-gray-200 dark:hover:bg-gray-800"
        onClick={() => setShowPassword((prev) => !prev)}
      >
        {showPassword ? <EyeIcon size={20} /> : <EyeClosedIcon size={20} />}
      </button>
    </div>
  )
})
PasswordInput.displayName = 'PasswordInput'

export { PasswordInput }

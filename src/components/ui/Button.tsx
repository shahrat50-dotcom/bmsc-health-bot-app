import * as React from "react"
import { cn } from "@/src/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-bold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:pointer-events-none disabled:opacity-50 active:scale-95 duration-200",
          {
            "bg-slate-900 text-white hover:bg-slate-800 shadow-md": variant === 'default',
            "border border-sky-100 bg-white text-slate-600 hover:bg-sky-50 hover:text-sky-600": variant === 'outline',
            "hover:bg-slate-100 text-slate-600": variant === 'ghost',
            "h-12 px-6 py-2": size === 'default',
            "h-9 px-4": size === 'sm',
            "h-14 rounded-2xl px-8 text-sm": size === 'lg',
            "h-12 w-12": size === 'icon',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }

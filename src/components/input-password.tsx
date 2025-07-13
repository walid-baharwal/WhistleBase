"use client"

import { forwardRef, useState } from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface InputPasswordProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  className?: string
}

const InputPassword = forwardRef<HTMLInputElement, InputPasswordProps>(
  ({ className, placeholder = "Password", ...props }, ref) => {
    const [isVisible, setIsVisible] = useState<boolean>(false)

    const toggleVisibility = () => setIsVisible((prevState) => !prevState)

    return (
      <div className="relative">
        <Input
          ref={ref}
          className={cn("pe-9", className)}
          placeholder={placeholder}
          type={isVisible ? "text" : "password"}
          {...props}
        />
        <button
          className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          onClick={toggleVisibility}
          aria-label={isVisible ? "Hide password" : "Show password"}
          aria-pressed={isVisible}
          tabIndex={-1}
        >
          {isVisible ? (
            <EyeOffIcon size={16} aria-hidden="true" />
          ) : (
            <EyeIcon size={16} aria-hidden="true" />
          )}
        </button>
      </div>
    )
  }
)

InputPassword.displayName = "InputPassword"

export { InputPassword }

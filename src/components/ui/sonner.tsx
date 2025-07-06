"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      toastOptions={{
        style: {
          background: "white",
          color: "black",
          border: "1px solid #eaeaea",
        },
        classNames: {
          title: "text-sm font-medium",
          success: "bg-white border-green-500 border-l-2 [&_svg]:!text-green-500",
          error: "bg-white border-red-500 border-l-2 [&_svg]:!text-red-500",
          info: "bg-white border-blue-500 border-l-2 [&_svg]:!text-[#007AE1]",
          warning: "bg-white border-yellow-500 border-l-2 [&_svg]:!text-yellow-500",
          default: "bg-white border-gray-200 border-l-2 [&_svg]:!text-gray-600",
          toast: "group flex w-full items-center gap-2", // Add base toast styles
          actionButton: "bg-primary text-primary-foreground",
          icon: "flex-shrink-0" // Icon style
        }
      }}
      {...props}
    />
  )
}

export { Toaster }

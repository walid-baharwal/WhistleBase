"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme()

  return (
    <Sonner
      theme={(resolvedTheme as ToasterProps["theme"]) ?? "light"}
      className="toaster group"
      position="top-right"
      closeButton={true}
      toastOptions={{
        classNames: {
          title: "text-sm font-medium text-gray-900 dark:text-gray-100",
          description: "text-xs text-gray-700 dark:text-gray-300 font-normal",
          success: "bg-white dark:bg-gray-800 border-green-500 border-l-2 [&_svg]:!text-green-500",
          error: "bg-white dark:bg-gray-800 border-red-500 border-l-2 [&_svg]:!text-red-500",
          info: "bg-white dark:bg-gray-800 border-blue-500 border-l-2 [&_svg]:!text-[#007AE1]",
          warning: "bg-white dark:bg-gray-800 border-yellow-500 border-l-2 [&_svg]:!text-yellow-500",
          default: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 border-l-2 [&_svg]:!text-gray-600",
          toast: "group flex w-full items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700", 
          actionButton: "bg-primary text-primary-foreground",
          icon: "flex-shrink-0"
        }
      }}
      {...props}
    />
  )
}

export { Toaster }

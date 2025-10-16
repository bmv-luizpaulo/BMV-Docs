"use client"

import { useNotifications } from "@/hooks/use-notifications"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { notifications } = useNotifications()

  return (
    <ToastProvider>
      {notifications.map(function ({ id, title, message, action, type, ...props }) {
        return (
          <Toast key={id} {...props} variant={type === 'error' ? 'destructive' : 'default'}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {message && (
                <ToastDescription>{message}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

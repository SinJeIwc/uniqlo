"use client"

import { useCallback, useEffect, useRef } from "react"

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

export function TelegramLogin({
  onAuth,
  botName,
}: {
  onAuth: (user: TelegramUser) => void
  botName: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  const handleAuth = useCallback(
    (user: TelegramUser) => {
      onAuth(user)
    },
    [onAuth],
  )

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const script = document.createElement("script")
    script.src = "https://telegram.org/js/telegram-widget.js?15"
    script.async = true
    script.setAttribute("data-telegram-login", botName)
    script.setAttribute("data-size", "large")
    script.setAttribute("data-radius", "0")
    script.setAttribute("data-onauth", "onTelegramAuth(user)")
    script.setAttribute("data-request-access", "write")

    // Global callback
    ;(window as any).onTelegramAuth = (user: TelegramUser) => {
      handleAuth(user)
    }

    if (containerRef.current) {
      containerRef.current.appendChild(script)
    }

    return () => {
      delete (window as any).onTelegramAuth
    }
  }, [botName, handleAuth])

  return <div ref={containerRef} className="flex justify-center" />
}

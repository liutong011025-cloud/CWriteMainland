"use client"

import { useEffect, useState } from "react"

type RedFlashOverlayProps = {
  active: boolean
  duration?: number
}

/**
 * 价值观反馈等负面事件时的红色闪屏提示（由 page 控制 active）
 */
export default function RedFlashOverlay({ active, duration = 2000 }: RedFlashOverlayProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!active) {
      setVisible(false)
      return
    }
    setVisible(true)
    const t = window.setTimeout(() => setVisible(false), duration)
    return () => window.clearTimeout(t)
  }, [active, duration])

  if (!visible) return null

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[500] animate-pulse bg-red-500/35"
      style={{ animationDuration: "200ms" }}
      aria-hidden
    />
  )
}

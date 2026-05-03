"use client"

import { useEffect } from "react"

/**
 * 全局点击音效（通过 data-click-sound 等标记触发）；无音频资源时静默 no-op。
 */
export default function ClickSoundProvider() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest?.("[data-click-sound]") as HTMLElement | null
      if (!el) return
      const kind = el.getAttribute("data-click-sound")
      if (!kind) return
      try {
        const audio = new Audio(kind === "start-journey" ? "/bit.mp3" : "/bit.mp3")
        audio.volume = 0.2
        void audio.play()
      } catch {
        // ignore
      }
    }
    document.addEventListener("click", handler, true)
    return () => document.removeEventListener("click", handler, true)
  }, [])

  return null
}

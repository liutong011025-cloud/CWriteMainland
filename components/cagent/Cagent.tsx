"use client"

import type { FormEvent, ChangeEvent } from "react"
import { useState, useCallback, useEffect, useRef } from "react"

export type CagentMood = "normal" | "like" | "angry"

const IMAGE_MAP: Record<CagentMood, string> = {
  normal: "/Cagentsit.png",
  like: "/Cagentlike.png",
  angry: "/Cagentangry.png",
}

const SLEEP_IMAGE = "/Cagentsleep.png"
const SLEEP_TIMEOUT_MS = 60000

export interface CagentProps {
  stage: string
  contextSummary?: string
  userId?: string
  mood: CagentMood
  valuesMessage?: string | null
  valuesSuggestion?: string | null
  onOpenDialog?: () => void
}

export default function Cagent({
  stage,
  contextSummary = "",
  userId,
  mood,
  valuesMessage,
  valuesSuggestion,
}: CagentProps) {
  const [showBubble, setShowBubble] = useState(false)
  const [guideText, setGuideText] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isSleeping, setIsSleeping] = useState(false)
  const [userInput, setUserInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isInteracting, setIsInteracting] = useState(false)
  const sleepTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestSeqRef = useRef(0)

  const scheduleSleep = useCallback(() => {
    if (sleepTimeoutRef.current) {
      clearTimeout(sleepTimeoutRef.current)
    }
    sleepTimeoutRef.current = setTimeout(() => {
      setIsSleeping(true)
    }, SLEEP_TIMEOUT_MS)
  }, [])

  useEffect(() => {
    scheduleSleep()
    return () => {
      if (sleepTimeoutRef.current) {
        clearTimeout(sleepTimeoutRef.current)
      }
    }
  }, [scheduleSleep])

  const fetchGuide = useCallback(
    async (opts?: { userMessage?: string }) => {
      const requestSeq = ++requestSeqRef.current
      setLoading(true)
      if (!opts?.userMessage) {
        setGuideText(null)
      } else {
        setGuideText("Cagent is thinking... ✨")
      }
      try {
        const res = await fetch("/api/dify-cagent-guide", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stage,
            contextSummary: contextSummary || "",
            user_id: userId,
            userMessage: opts?.userMessage || null,
          }),
        })
        if (!res.ok) throw new Error(`cagent_guide_http_${res.status}`)
        const data = await res.json()
        if (requestSeq !== requestSeqRef.current) return
        if (data.error) {
          setGuideText("Oops, Cagent is resting. Try again in a bit! 🧸")
          return
        }
        setGuideText(data.message || data.answer || "Keep going! You're doing great! ✨")
      } catch {
        if (requestSeq !== requestSeqRef.current) return
        setGuideText("Something went wrong. Try again! 🌟")
      } finally {
        if (requestSeq === requestSeqRef.current) {
          setLoading(false)
        }
      }
    },
    [stage, contextSummary, userId]
  )

  useEffect(() => {
    setGuideText(null)
    setUserInput("")
    setIsSleeping(false)
    setShowBubble(true)
    setGuideText("I am here for this page. One second! ✨")
    scheduleSleep()
    if (!valuesMessage) {
      fetchGuide()
    }
  }, [stage, contextSummary, valuesMessage, fetchGuide, scheduleSleep])

  const handleOpen = useCallback(() => {
    setShowBubble(true)
    setIsSleeping(false)
    scheduleSleep()
    if (!valuesMessage && !guideText && !loading) {
      fetchGuide()
    }
  }, [valuesMessage, guideText, loading, fetchGuide, scheduleSleep])

  const handleSendMessage = useCallback(
    async (e?: FormEvent) => {
      if (e) e.preventDefault()
      const message = userInput.trim()
      if (!message || isSending) return
      setIsSending(true)
      try {
        await fetchGuide({ userMessage: message })
        setUserInput("")
      } finally {
        setIsSending(false)
      }
    },
    [userInput, isSending, fetchGuide]
  )

  const displayMessage = valuesMessage
    ? `${valuesMessage}${valuesSuggestion ? `\n\nSuggestion: ${valuesSuggestion}` : ""}`
    : guideText

  const avatarSrc = isSleeping ? SLEEP_IMAGE : IMAGE_MAP[mood]

  useEffect(() => {
    if (!showBubble || !displayMessage) return
    if (isSending || isInteracting || userInput.trim().length > 0) return
    const t = setTimeout(() => {
      setShowBubble(false)
    }, 6000)
    return () => clearTimeout(t)
  }, [showBubble, displayMessage, isSending, isInteracting, userInput])

  return (
    <div className="pointer-events-none fixed bottom-4 left-3 z-[200] flex max-w-[100vw] flex-col-reverse items-start gap-2 sm:bottom-6 sm:left-4 sm:flex-row sm:items-end sm:gap-3 lg:left-6">
      <button
        type="button"
        onClick={handleOpen}
        className="group flex flex-col items-center gap-1 transition-transform duration-200 hover:scale-110 focus:outline-none pointer-events-auto"
        aria-label="Open Cagent"
      >
        <img
          src={avatarSrc}
          alt="Cagent"
          className="h-28 w-28 object-contain sm:h-32 sm:w-32 lg:h-40 lg:w-40"
        />
        <span className="text-xs font-semibold text-purple-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          Cagent
        </span>
      </button>

      {showBubble && displayMessage && (
        <div
          className="pointer-events-auto w-full max-w-[calc(100vw-1.5rem)] rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 px-4 py-4 shadow-xl sm:max-w-xl sm:px-6 sm:py-5"
          onMouseEnter={() => setIsInteracting(true)}
          onMouseLeave={() => setIsInteracting(false)}
        >
          <div className="flex items-start gap-2 text-base text-foreground sm:text-lg">
            <div className="flex-1">
              <p
                className="whitespace-pre-wrap"
                style={{ fontFamily: '"Comic Neue", var(--font-comic-neue), "Comic Sans MS", cursive' }}
              >
                {displayMessage}
              </p>
              {!valuesMessage && (
                <form onSubmit={handleSendMessage} className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setUserInput(e.target.value)}
                    onFocus={() => setIsInteracting(true)}
                    onBlur={() => setIsInteracting(false)}
                    placeholder="Talk to Cagent..."
                    className="flex-1 rounded-full border border-purple-200 bg-white/80 px-5 py-3 text-base focus:outline-none focus:ring-0"
                  />
                  <button
                    type="submit"
                    onClick={handleSendMessage}
                    disabled={!userInput.trim() || isSending}
                    className="rounded-full bg-purple-500 px-5 py-3 text-base font-semibold text-white hover:bg-purple-600 disabled:opacity-50"
                  >
                    {isSending ? "Sending..." : "Send"}
                  </button>
                </form>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowBubble(false)}
              className="ml-1 text-xs text-purple-500 hover:text-purple-700"
              aria-label="Close Cagent message"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

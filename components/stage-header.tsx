"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export type StageHeaderLanguage = "en" | "zh"

export type StageHeaderProps = {
  stage?: number
  title?: string
  onBack?: () => void
  character?: string
  /** 少数页面仅传语言（如 story-edit） */
  language?: StageHeaderLanguage
}

/**
 * 写作流程各阶段顶栏：阶段号、标题、返回、角色名（可选）
 */
export default function StageHeader({ stage, title, onBack, character, language }: StageHeaderProps) {
  const showMeta = typeof stage === "number" || !!title || !!character || !!language

  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-4 border-[#c4a020] bg-gradient-to-r from-[#e8c547] via-[#f0d060] to-[#e8c547] px-4 py-3 shadow-md">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
        {onBack && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBack}
            className="shrink-0 border-2 border-[#8b6914] bg-white/90 font-bold text-[#5a4a2a] hover:bg-white"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        )}
        {showMeta && (
          <div className="min-w-0 font-hand">
            <div className="flex flex-wrap items-baseline gap-2">
              {typeof stage === "number" && (
                <span
                  className="inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg border-2 border-[#8b6914] bg-white px-2 text-sm font-extrabold text-[#5a4a2a]"
                  aria-label={`Stage ${stage}`}
                >
                  {stage}
                </span>
              )}
              {title && (
                <h1 className="truncate text-lg font-extrabold text-[#5a4a2a] sm:text-2xl">{title}</h1>
              )}
            </div>
            {character && (
              <p className="mt-1 truncate text-sm font-semibold text-[#6b5210]">Character: {character}</p>
            )}
            {language && (
              <p className="mt-1 text-sm font-semibold text-[#6b5210]">Language: {language === "zh" ? "中文" : "English"}</p>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

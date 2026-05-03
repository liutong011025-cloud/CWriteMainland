"use client"

import Link from "next/link"

type CopywritingToolbarProps = {
  username: string
  stage: string
}

/**
 * 文案账号（copywriting）专用快捷入口
 */
export default function CopywritingToolbar({ username, stage }: CopywritingToolbarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[150] border-t border-slate-700/80 bg-slate-900/95 px-4 py-2 text-sm text-slate-100 shadow-lg backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2">
        <span className="text-slate-400">
          Copywriting · <span className="font-medium text-white">{username}</span>
          <span className="ml-2 text-xs opacity-70">({stage})</span>
        </span>
        <Link
          href="/copywriting-review"
          className="rounded-lg bg-amber-500 px-3 py-1.5 font-semibold text-slate-900 transition hover:bg-amber-400"
        >
          Open review queue
        </Link>
      </div>
    </div>
  )
}

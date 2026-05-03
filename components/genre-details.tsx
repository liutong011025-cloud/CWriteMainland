"use client"

import { Button } from "@/components/ui/button"

type GenreDetailsProps = {
  activeGenre: string
  onBack: () => void
}

const labels: Record<string, string> = {
  story: "Story",
  review: "Book Review",
  letter: "Letter",
  drama: "Drama",
  poetry: "Poetry",
}

/** 首页选中体裁后的简介区（精简版） */
export function GenreDetails({ activeGenre, onBack }: GenreDetailsProps) {
  const title = labels[activeGenre] || activeGenre
  return (
    <div className="rounded-2xl border-4 border-[#c4a020] bg-white/90 p-6 text-center shadow-inner">
      <p className="mb-4 text-lg font-bold text-slate-800">{title}</p>
      <p className="mb-6 text-sm text-slate-600">
        Explore writing in this genre from the main journey. This panel is a quick preview on the home screen.
      </p>
      <Button type="button" variant="outline" onClick={onBack} className="font-semibold">
        Back
      </Button>
    </div>
  )
}

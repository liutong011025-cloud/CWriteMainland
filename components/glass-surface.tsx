"use client"

import type { ReactNode } from "react"

type GlassSurfaceProps = {
  children: ReactNode
  width?: string | number
  height?: string | number
  borderRadius?: number
  borderWidth?: number
  brightness?: number
  opacity?: number
  blur?: number
  displace?: number
}

/** 首页按钮玻璃外壳（视觉近似：毛玻璃 + 圆角，不依赖 WebGL） */
export default function GlassSurface({
  children,
  width = "auto",
  height = "auto",
  borderRadius = 24,
  borderWidth = 1,
  brightness = 1,
  opacity = 1,
  blur = 12,
}: GlassSurfaceProps) {
  return (
    <span
      className="inline-block backdrop-blur-md"
      style={{
        width: width === "auto" ? undefined : width,
        height: height === "auto" ? undefined : height,
        borderRadius,
        border: `${Math.max(1, borderWidth * 16)}px solid rgba(255,255,255,0.35)`,
        background: `linear-gradient(135deg, rgba(255,255,255,${0.12 * opacity}) 0%, rgba(255,255,255,${0.05 * opacity}) 100%)`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.4)",
        filter: `brightness(${brightness}%)`,
        backdropFilter: `blur(${blur}px) saturate(1.2)`,
        WebkitBackdropFilter: `blur(${blur}px) saturate(1.2)`,
      }}
    >
      {children}
    </span>
  )
}

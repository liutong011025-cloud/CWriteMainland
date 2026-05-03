"use client"

/** 首页胶片颗粒感叠层（轻量占位实现，避免缺文件导致构建失败） */
export function GrainOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1] opacity-[0.07] mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "180px 180px",
      }}
      aria-hidden
    />
  )
}

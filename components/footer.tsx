"use client"

import Image from "next/image"
import { usePathname } from "next/navigation"

export default function Footer() {
  const pathname = usePathname()

  if (pathname?.startsWith("/admin")) {
    return null
  }

  return (
    <footer
      className="mt-auto w-full"
      style={{
        background:
          "linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 58, 138, 0.95) 50%, rgba(15, 23, 42, 0.98) 100%)",
        backdropFilter: "blur(12px) saturate(180%)",
        borderTop: "1px solid rgba(59, 130, 246, 0.3)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8 lg:px-12">
        <div className="flex flex-col items-center justify-between gap-6 sm:gap-8 lg:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 lg:gap-12">
            <div className="flex w-full max-w-[min(100%,280px)] shrink-0 justify-center sm:w-auto sm:max-w-none">
              <Image
                src="/EdUHK_Signature_RGBWhite@4x-1-1024x336.png"
                alt="EdUHK Logo"
                width={300}
                height={98}
                className="h-auto w-full max-h-16 object-contain sm:max-h-20 md:max-h-none md:w-[260px] lg:w-[300px]"
                unoptimized
              />
            </div>
            <div className="flex w-full max-w-[200px] shrink-0 justify-center sm:w-auto">
              <Image
                src="/MIT_Logo2-1024x290.png"
                alt="MIT Logo"
                width={180}
                height={51}
                className="h-auto w-full object-contain opacity-90 sm:max-w-[180px]"
                unoptimized
              />
            </div>
          </div>
          <div className="max-w-md flex-1 space-y-3 text-center lg:max-w-none lg:text-right">
            <p className="text-base leading-relaxed text-blue-100">Strategic Plan Start-up Support @EdUHK</p>
            <p className="text-base leading-relaxed text-blue-100">
              Department of Mathematics and Information Technology
            </p>
            <p className="mt-3 text-base font-semibold text-blue-200">© EdUHK</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

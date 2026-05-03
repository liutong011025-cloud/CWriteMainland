"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Header from "@/header"

export default function HeaderWrapper() {
  const pathname = usePathname()
  const [shouldShowHeader, setShouldShowHeader] = useState(true)
  const isAdminRoute = pathname?.startsWith("/admin") ?? false

  useEffect(() => {
    if (isAdminRoute) return

    const checkLoginStage = () => {
      const mainElement = document.querySelector("main[data-stage]")
      const stage = mainElement?.getAttribute("data-stage")
      const loginElements = document.querySelectorAll("[data-login-page]")
      const noHeaderElements = document.querySelectorAll("[data-no-header]")

      if (stage === "login") {
        setShouldShowHeader(false)
        return
      }
      if (loginElements.length > 0) {
        setShouldShowHeader(false)
        return
      }
      if (noHeaderElements.length > 0) {
        setShouldShowHeader(false)
        return
      }
      setShouldShowHeader(true)
    }

    const timeoutId = setTimeout(checkLoginStage, 50)
    checkLoginStage()

    const observer = new MutationObserver(() => {
      checkLoginStage()
    })

    if (typeof window !== "undefined" && document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["data-stage", "data-login-page", "data-no-header", "class", "id"],
      })
    }

    const intervalId = setInterval(checkLoginStage, 300)

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
      observer.disconnect()
    }
  }, [isAdminRoute])

  if (isAdminRoute) {
    return null
  }

  if (!shouldShowHeader) {
    return null
  }

  return <Header />
}

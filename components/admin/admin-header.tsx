"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

type AdminHeaderProps = {
  role: "admin" | "teacher"
  name: string
}

export function AdminHeader({ role, name }: AdminHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-6">
      <div>
        <h1 className="text-sm font-semibold text-muted-foreground">Admin</h1>
        <p className="text-lg font-bold leading-tight">{name}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground">{role}</span>
        <Button type="button" variant="outline" size="sm" className="gap-1" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </header>
  )
}

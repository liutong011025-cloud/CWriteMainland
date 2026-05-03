"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, BookOpen, MessageCircle, StickyNote, ScrollText, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

type AdminSidebarProps = {
  role: "admin" | "teacher"
  name: string
  username: string
}

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users, adminOnly: true },
  { href: "/admin/works", label: "Works", icon: BookOpen },
  { href: "/admin/reviews", label: "Reviews", icon: MessageCircle },
  { href: "/admin/notes", label: "Notes", icon: StickyNote },
  { href: "/admin/audit-logs", label: "Audit logs", icon: ScrollText, adminOnly: true },
  { href: "/admin/settings", label: "Settings", icon: Settings, adminOnly: true },
]

export function AdminSidebar({ role, name, username }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="border-b p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Signed in</p>
        <p className="truncate font-semibold">{name}</p>
        <p className="truncate text-xs text-muted-foreground">@{username}</p>
        <p className="mt-1 text-xs capitalize text-muted-foreground">{role}</p>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {links.map(({ href, label, icon: Icon, adminOnly }) => {
          if (adminOnly && role !== "admin") return null
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

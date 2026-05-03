"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface LoginPageProps {
  onLogin: (user: { username: string; role: "teacher" | "student"; noAi?: boolean }, showContinueDialog?: boolean) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      toast.error("Please enter both username and password")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }))
        toast.error(errorData.error || `Login failed (${response.status})`)
        return
      }

      const data = await response.json()

      if (data.success) {
        toast.success(`Welcome, ${data.user.username}!`)
        onLogin(data.user, true)
      } else {
        toast.error(data.error || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      toast.error(`Login failed: ${errorMessage}. Please check if the server is running.`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="login-page relative flex min-h-screen items-center justify-center overflow-hidden px-4"
      data-login-page
    >
      <div className="absolute left-0 top-0 h-full w-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full w-full bg-cover bg-no-repeat"
          style={{
            backgroundImage: "url(/Background.png)",
            backgroundPosition: "left top",
            backgroundSize: "cover",
            filter: "blur(8px) brightness(0.7)",
            transform: "scale(1.1)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-indigo-800/40 to-pink-900/50" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute left-10 top-20 h-96 w-96 animate-pulse rounded-full bg-purple-300 opacity-20 mix-blend-multiply blur-xl filter" />
        <div
          className="absolute bottom-20 right-10 h-96 w-96 animate-pulse rounded-full bg-pink-300 opacity-20 mix-blend-multiply blur-xl filter"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border-2 border-white/50 bg-white/95 px-8 py-6 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 text-center">
            <div className="mb-3 mt-6 flex justify-center">
              <Image
                src="/logo.png"
                alt="CWrite Logo"
                width={350}
                height={350}
                className="animate-pulse object-contain"
                priority
                unoptimized
              />
            </div>
            <p className="font-semibold text-gray-700">Login to start your creative journey</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-purple-700">Username</label>
              <Input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLogin()
                }}
                className="rounded-xl border-2 border-purple-200 py-3 text-base focus:border-purple-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-pink-700">Password</label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLogin()
                }}
                className="rounded-xl border-2 border-pink-200 py-3 text-base focus:border-pink-500"
              />
            </div>

            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full border-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 py-6 text-lg font-bold text-white shadow-xl hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 disabled:opacity-50"
            >
              {isLoading ? "Logging in..." : "🚀 Login"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

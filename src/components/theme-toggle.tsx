"use client"

import { useEffect, useState } from "react"
import { HiSun, HiMoon } from "react-icons/hi2"

export function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("theme")
    if (stored === "dark" || (!stored && matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark")
      setDark(true)
    }
  }, [])

  function toggle() {
    const now = document.documentElement.classList.toggle("dark")
    setDark(now)
    localStorage.setItem("theme", now ? "dark" : "light")
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 backdrop-blur text-white/70 hover:bg-white/20 hover:text-white transition-all"
      aria-label="Toggle dark mode"
    >
      {dark ? <HiSun className="h-4 w-4" /> : <HiMoon className="h-4 w-4" />}
    </button>
  )
}

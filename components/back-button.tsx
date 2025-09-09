"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "./ui/button"
import { useCallback } from "react"

export default function BackButton() {
  const router = useRouter()

  const handleBack = useCallback(() => {
    // Try navigating back; if there's no history, go to home
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push("/")
    }
  }, [router])

  return (
    <div
      aria-hidden={false}
      className="fixed left-3 top-3 z-50"
    >
      <Button
        aria-label="Go back"
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={handleBack}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
    </div>
  )
}



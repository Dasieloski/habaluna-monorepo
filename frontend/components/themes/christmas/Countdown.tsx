"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { christmasConfig } from "./themeConfig"

interface CountdownProps {
  targetDate: Date
  title?: string
  onComplete?: () => void
  className?: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calculateTimeLeft(targetDate: Date): TimeLeft | null {
  const difference = targetDate.getTime() - new Date().getTime()

  if (difference <= 0) return null

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  }
}

export function Countdown({
  targetDate,
  title = "Holiday Sale Ends In",
  onComplete,
  className = "",
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [mounted, setMounted] = useState(false)
  const { colors } = christmasConfig

  useEffect(() => {
    setMounted(true)
    setTimeLeft(calculateTimeLeft(targetDate))

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(targetDate)
      setTimeLeft(newTimeLeft)

      if (!newTimeLeft) {
        clearInterval(timer)
        onComplete?.()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate, onComplete])

  if (!mounted || !timeLeft) return null

  const timeUnits = [
    { value: timeLeft.days, label: "Days" },
    { value: timeLeft.hours, label: "Hours" },
    { value: timeLeft.minutes, label: "Min" },
    { value: timeLeft.seconds, label: "Sec" },
  ]

  return (
    <motion.div
      className={`inline-flex flex-col items-center gap-3 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Title */}
      <p
        className="text-sm font-medium tracking-wide uppercase"
        style={{ color: colors.gold.primary }}
      >
        {title}
      </p>

      {/* Timer boxes */}
      <div className="flex items-center gap-2">
        {timeUnits.map((unit, index) => (
          <div key={unit.label} className="flex items-center gap-2">
            <div
              className="relative flex flex-col items-center justify-center min-w-[56px] h-16 rounded-xl overflow-hidden"
              style={{
                background: `linear-gradient(180deg, ${colors.green.deep} 0%, ${colors.red.deep} 100%)`,
                boxShadow: `0 4px 12px ${colors.green.muted}`,
              }}
            >
              {/* Gold accent */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: colors.gold.muted }}
              />

              <AnimatePresence mode="popLayout">
                <motion.span
                  key={unit.value}
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: colors.snow.pure }}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {unit.value.toString().padStart(2, "0")}
                </motion.span>
              </AnimatePresence>

              <span
                className="text-[10px] uppercase tracking-wider"
                style={{ color: colors.snow.muted }}
              >
                {unit.label}
              </span>
            </div>

            {/* Separator */}
            {index < timeUnits.length - 1 && (
              <span
                className="text-xl font-bold"
                style={{ color: colors.gold.primary }}
              >
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

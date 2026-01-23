"use client"

import { useState, useEffect } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { valentinesConfig } from "./themeConfig"

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface LoveCountdownProps {
  targetDate: Date
  title?: string
}

export function LoveCountdown({
  targetDate,
  title = "Valentine's Day",
}: LoveCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [mounted, setMounted] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const { colors } = valentinesConfig

  useEffect(() => {
    setMounted(true)
    
    const calculateTime = () => {
      const now = new Date().getTime()
      const target = targetDate.getTime()
      const difference = target - now

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        })
      }
    }

    calculateTime()
    const interval = setInterval(calculateTime, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  if (!mounted) return null

  const timeUnits = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ]

  return (
    <motion.div
      className="inline-flex flex-col items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Title with heart */}
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          animate={
            prefersReducedMotion
              ? {}
              : {
                  scale: [1, 1.15, 1],
                }
          }
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill={colors.rose.primary}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.div>
        <h2
          className="text-lg font-medium tracking-wide"
          style={{ color: colors.rose.deep }}
        >
          {title}
        </h2>
        <motion.div
          animate={
            prefersReducedMotion
              ? {}
              : {
                  scale: [1, 1.15, 1],
                }
          }
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        >
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill={colors.rose.primary}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.div>
      </div>

      {/* Time units */}
      <div className="flex gap-4">
        {timeUnits.map((unit, index) => (
          <motion.div
            key={unit.label}
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold border"
              style={{
                background: `linear-gradient(135deg, ${colors.rose.muted}, ${colors.blush.muted})`,
                borderColor: colors.rose.light,
                color: colors.rose.deep,
              }}
            >
              {String(unit.value).padStart(2, "0")}
            </div>
            <span
              className="text-xs mt-2 font-medium uppercase tracking-wider"
              style={{ color: colors.blush.deep }}
            >
              {unit.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

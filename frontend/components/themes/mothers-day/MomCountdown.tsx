"use client"

import { useState, useEffect } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { mothersDayConfig } from "./themeConfig"

interface MomCountdownProps {
  targetDate: Date
  title?: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function MomCountdown({
  targetDate,
  title = "Mother's Day",
}: MomCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [isVisible, setIsVisible] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const { colors } = mothersDayConfig

  useEffect(() => {
    setIsVisible(true)

    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime()

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

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
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Title with flower decoration */}
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          animate={
            prefersReducedMotion
              ? {}
              : {
                  rotate: [-5, 5, -5],
                }
          }
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill={colors.pink.primary}
          >
            <circle cx="12" cy="12" r="3" fill={colors.gold.primary} />
            <ellipse cx="12" cy="6" rx="2.5" ry="4" />
            <ellipse cx="12" cy="18" rx="2.5" ry="4" />
            <ellipse cx="6" cy="12" rx="4" ry="2.5" />
            <ellipse cx="18" cy="12" rx="4" ry="2.5" />
          </svg>
        </motion.div>
        <h2
          className="text-2xl font-semibold tracking-wide"
          style={{ color: colors.pink.deep }}
        >
          {title}
        </h2>
        <motion.div
          animate={
            prefersReducedMotion
              ? {}
              : {
                  rotate: [5, -5, 5],
                }
          }
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill={colors.lavender.primary}
          >
            <circle cx="12" cy="12" r="3" fill={colors.gold.primary} />
            <ellipse cx="12" cy="6" rx="2.5" ry="4" />
            <ellipse cx="12" cy="18" rx="2.5" ry="4" />
            <ellipse cx="6" cy="12" rx="4" ry="2.5" />
            <ellipse cx="18" cy="12" rx="4" ry="2.5" />
          </svg>
        </motion.div>
      </div>

      {/* Countdown boxes */}
      <div className="flex gap-3">
        {timeUnits.map((unit, index) => (
          <motion.div
            key={unit.label}
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 + 0.3, duration: 0.4 }}
          >
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg border"
              style={{
                background: `linear-gradient(135deg, ${colors.pink.muted}, ${colors.lavender.muted})`,
                borderColor: colors.pink.soft,
              }}
            >
              <motion.span
                key={unit.value}
                className="text-2xl font-bold"
                style={{ color: colors.pink.deep }}
                initial={prefersReducedMotion ? {} : { scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {String(unit.value).padStart(2, "0")}
              </motion.span>
            </div>
            <span
              className="text-xs font-medium mt-2 tracking-wide uppercase"
              style={{ color: colors.lavender.deep }}
            >
              {unit.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

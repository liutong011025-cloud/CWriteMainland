"use client"

import { motion } from "framer-motion"

export type MagneticCardItem = { id: string; title: string; color: string }

type MagneticCardsProps = {
  cards: MagneticCardItem[]
  activeCard: string | null
  onCardClick: (id: string) => void
  animationDuration?: number
  staggerDelay?: number
  delayStart?: number
}

/** 首页体裁卡片：简化版磁吸动效，保留点击与配色 */
export function MagneticCards({
  cards,
  activeCard,
  onCardClick,
  animationDuration = 0.6,
  staggerDelay = 0.12,
  delayStart = 0,
}: MagneticCardsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {cards.map((card, i) => {
        const active = activeCard === card.id
        return (
          <motion.button
            key={card.id}
            type="button"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: animationDuration,
              delay: delayStart + i * staggerDelay,
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onCardClick(card.id)}
            className={`rounded-2xl border-4 px-6 py-4 text-lg font-extrabold shadow-lg transition ${
              active ? "ring-4 ring-white ring-offset-2 ring-offset-transparent" : ""
            }`}
            style={{
              backgroundColor: card.color,
              borderColor: active ? "#1e293b" : "rgba(0,0,0,0.15)",
              color: "#1e293b",
            }}
          >
            {card.title}
          </motion.button>
        )
      })}
    </div>
  )
}

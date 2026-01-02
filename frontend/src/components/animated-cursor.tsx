"use client"

import { motion } from "framer-motion"

interface AnimatedCursorProps {
    x: number
    y: number
    label?: string
    color?: string
}

export function AnimatedCursor({ x, y, label = "User", color = "#ff4d4d" }: AnimatedCursorProps) {
    return (
        <motion.div
            className="absolute z-50 pointer-events-none flex flex-col items-start gap-1"
            initial={false}
            animate={{ x, y }}
            transition={{ type: "spring", damping: 30, stiffness: 200, mass: 0.5 }}
        >
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}
            >
                <path
                    d="M5.65376 12.3773L11.6704 14.4612C11.8617 14.5276 12.0163 14.6822 12.0827 14.8735L14.1666 20.8901C14.2643 21.1733 14.6548 21.2003 14.79 20.9341L21.611 7.2921C21.7347 7.0449 21.4989 6.77202 21.2393 6.84154L7.59735 14.5011C7.33116 14.6362 7.37053 15.0267 7.65376 15.1244L5.65376 12.3773Z"
                    fill={color}
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                />
            </svg>
            {label && (
                <div
                    className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-lg whitespace-nowrap"
                    style={{ backgroundColor: color }}
                >
                    {label}
                </div>
            )}
        </motion.div>
    )
}

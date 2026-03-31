import { useState, useEffect } from 'react'

export default function Timer({ onTimeout, running, questionKey, duration = 20 }) {
  const [timeLeft, setTimeLeft] = useState(duration)

  useEffect(() => {
    setTimeLeft(duration)
  }, [questionKey, duration])

  useEffect(() => {
    if (!running) return
    if (timeLeft <= 0) {
      onTimeout()
      return
    }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timeLeft, running, onTimeout])

  const radius = 22
  const circumference = 2 * Math.PI * radius
  const progress = timeLeft / duration
  const offset = circumference * (1 - progress)

  const getColor = () => {
    if (timeLeft > 10) return '#7c3aed'
    if (timeLeft > 5) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="timer-circle" title={`${timeLeft} giây còn lại`}>
      <svg className="timer-svg" viewBox="0 0 56 56">
        <circle
          className="timer-track"
          cx="28"
          cy="28"
          r={radius}
        />
        <circle
          className="timer-fill"
          cx="28"
          cy="28"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          stroke={getColor()}
        />
      </svg>
      <div className="timer-text" style={{ color: getColor() }}>
        {timeLeft}
      </div>
    </div>
  )
}

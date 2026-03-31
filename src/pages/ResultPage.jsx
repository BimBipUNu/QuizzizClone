import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E']

export default function ResultPage() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [showReview, setShowReview] = useState(false)
  const circleRef = useRef(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('quizmaster_results')
    if (!raw) {
      navigate('/', { replace: true })
      return
    }
    setData(JSON.parse(raw))
  }, [navigate])

  // Animate score ring
  useEffect(() => {
    if (!data || !circleRef.current) return
    const radius = 80
    const circumference = 2 * Math.PI * radius
    const offset = circumference * (1 - data.score / 100)

    setTimeout(() => {
      if (circleRef.current) {
        circleRef.current.style.strokeDashoffset = offset
      }
    }, 200)
  }, [data])

  if (!data) return null

  const { total, correct, score, results } = data
  const wrong = results.filter(r => !r.isCorrect && r.selected !== null).length
  const skipped = results.filter(r => r.selected === null).length

  const getGrade = () => {
    if (score >= 90) return { label: 'Xuất sắc!', color: '#10b981' }
    if (score >= 75) return { label: 'Tốt!', color: '#7c3aed' }
    if (score >= 60) return { label: 'Khá!', color: '#06b6d4' }
    if (score >= 40) return { label: 'Cần cố gắng hơn', color: '#f59e0b' }
    return { label: 'Hãy thử lại!', color: '#ef4444' }
  }

  const grade = getGrade()

  const getScoreGradient = () => {
    if (score >= 75) return 'url(#grad-success)'
    if (score >= 50) return 'url(#grad-warning)'
    return 'url(#grad-danger)'
  }

  const replayQuiz = () => {
    const stored = sessionStorage.getItem('quizmaster_session')
    if (stored) {
      const session = JSON.parse(stored)
      // Reshuffle same questions
      const reshuffled = [...session.questions].sort(() => Math.random() - 0.5)
      sessionStorage.setItem('quizmaster_session', JSON.stringify({
        questions: reshuffled,
        startTime: Date.now(),
      }))
      navigate('/quiz')
    } else {
      navigate('/')
    }
  }

  return (
    <div className="page result-page">
      <div className="bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <Navbar />

      <div className="container">
        <div className="result-hero">
          {/* Score Ring */}
          <div className="score-ring">
            <svg viewBox="0 0 200 200">
              <defs>
                <linearGradient id="grad-success" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id="grad-warning" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
                <linearGradient id="grad-danger" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>
              <circle
                className="score-ring-track"
                cx="100" cy="100" r="80"
              />
              <circle
                ref={circleRef}
                className="score-ring-fill"
                cx="100" cy="100" r="80"
                stroke={getScoreGradient()}
                strokeDasharray={2 * Math.PI * 80}
                strokeDashoffset={2 * Math.PI * 80}
                style={{ transition: 'stroke-dashoffset 1.5s ease' }}
              />
            </svg>
            <div className="score-ring-text">
              <div className="score-pct" style={{ color: grade.color }}>{score}%</div>
              <div className="score-label">điểm số</div>
            </div>
          </div>

          <h1 className="result-title">{grade.label}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '8px' }}>
            {correct}/{total} câu đúng
          </p>

          {/* Stats */}
          <div className="result-stats">
            <div className="result-stat">
              <div className="result-stat-value" style={{ color: 'var(--success-light)' }}>
                Đúng: {correct}
              </div>
              <div className="result-stat-label">Đúng</div>
            </div>
            <div className="result-stat">
              <div className="result-stat-value" style={{ color: 'var(--danger-light)' }}>
                Sai: {wrong}
              </div>
              <div className="result-stat-label">Sai</div>
            </div>
            {skipped > 0 && (
              <div className="result-stat">
                <div className="result-stat-value" style={{ color: 'var(--warning-light)' }}>
                  Bỏ qua: {skipped}
                </div>
                <div className="result-stat-label">Bỏ qua</div>
              </div>
            )}
            <div className="result-stat">
              <div className="result-stat-value" style={{ color: 'var(--primary-light)' }}>
                Tổng: {total}
              </div>
              <div className="result-stat-label">Tổng câu</div>
            </div>
          </div>

          {/* Actions */}
          <div className="result-actions">
            <button id="btn-replay" className="btn btn-primary btn-lg" onClick={replayQuiz}>
              Làm lại
            </button>
            <button
              id="btn-toggle-review"
              className="btn btn-outline"
              onClick={() => setShowReview(v => !v)}
            >
              {showReview ? 'Ẩn chi tiết' : 'Xem chi tiết'}
            </button>
            <button id="btn-home" className="btn btn-ghost" onClick={() => navigate('/')}>
              Trang chủ
            </button>
          </div>
        </div>

        {/* Review Section */}
        {showReview && (
          <div className="review-section">
            <h2 className="section-title">Review từng câu</h2>
            {results.map((r, idx) => (
              <div
                key={r.questionId}
                className={`review-item ${r.isCorrect ? 'correct-item' : 'wrong-item'}`}
              >
                <div className="review-q-header">
                  <div className={`review-status-icon ${r.selected === null ? 'icon-skipped' : r.isCorrect ? 'icon-correct' : 'icon-wrong'}`}>
                    {r.selected === null ? 'S' : r.isCorrect ? 'C' : 'W'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                      Câu {idx + 1}
                    </div>
                    <div className="review-q-text">{r.questionText}</div>
                  </div>
                </div>

                <div className="review-answers">
                  <span className={`answer-pill correct-ans`}>
                    {OPTION_LETTERS[r.correct]}: {r.options[r.correct]}
                  </span>
                  {r.selected !== null && !r.isCorrect && (
                    <span className="answer-pill wrong-ans">
                      {OPTION_LETTERS[r.selected]}: {r.options[r.selected]}
                    </span>
                  )}
                  {r.selected === null && (
                    <span style={{
                      padding: '6px 14px',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      background: 'rgba(245,158,11,0.15)',
                      color: 'var(--warning-light)',
                      border: '1px solid rgba(245,158,11,0.3)'
                    }}>
                      Hết giờ, không trả lời
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

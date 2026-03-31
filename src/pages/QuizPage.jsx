import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadQuestions, saveResults } from '../utils/excelParser'
import Timer from '../components/Timer'

const OPTION_COLORS = ['option-a', 'option-b', 'option-c', 'option-d', 'option-e']
const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E']

export default function QuizPage() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null) // 0-indexed
  const [answered, setAnswered] = useState(false)
  const [toast, setToast] = useState(null) // { type: 'correct'|'wrong', msg }
  const [timerRunning, setTimerRunning] = useState(true)
  const [results, setResults] = useState([]) // { questionId, selected, correct, isCorrect }
  const [score, setScore] = useState(0)
  const nextTimeoutRef = useRef(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('quizmaster_session')
    if (!stored) {
      navigate('/', { replace: true })
      return
    }
    const session = JSON.parse(stored)
    setQuestions(session.questions)
  }, [navigate])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (nextTimeoutRef.current) clearTimeout(nextTimeoutRef.current)
    }
  }, [])

  const handleAnswer = useCallback((optIndex) => {
    if (answered) return

    const q = questions[current]
    const isCorrect = optIndex + 1 === q.correct // correct is 1-indexed

    setSelected(optIndex)
    setAnswered(true)
    setTimerRunning(false)

    const newResult = {
      questionId: q.id,
      questionText: q.text,
      options: q.options,
      selected: optIndex,
      correct: q.correct - 1, // convert to 0-indexed for display
      isCorrect,
    }

    setResults(prev => [...prev, newResult])

    if (isCorrect) {
      setScore(s => s + 1)
      setToast({ type: 'correct', msg: 'Chính xác!' })
    } else {
      setToast({ type: 'wrong', msg: `Sai! Đáp án: ${OPTION_LETTERS[q.correct - 1]}` })
    }

    // Auto advance after 1.5s
    nextTimeoutRef.current = setTimeout(() => {
      goNext(newResult, isCorrect)
    }, 1500)
  }, [answered, current, questions])

  const handleTimeout = useCallback(() => {
    if (answered) return

    const q = questions[current]
    const newResult = {
      questionId: q.id,
      questionText: q.text,
      options: q.options,
      selected: null, // not answered
      correct: q.correct - 1,
      isCorrect: false,
    }

    setAnswered(true)
    setSelected(null)
    setResults(prev => [...prev, newResult])
    setToast({ type: 'wrong', msg: 'Hết giờ!' })

    nextTimeoutRef.current = setTimeout(() => {
      goNext(newResult, false)
    }, 1500)
  }, [answered, current, questions])

  const goNext = useCallback((lastResult, lastCorrect) => {
    setToast(null)

    if (current >= questions.length - 1) {
      // Quiz finished - navigate to results
      const allResults = [...results, lastResult]
      const totalCorrect = allResults.filter(r => r.isCorrect).length

      saveResults({
        total: questions.length,
        correct: totalCorrect,
        score: Math.round((totalCorrect / questions.length) * 100),
        results: allResults,
      })

      sessionStorage.setItem('quizmaster_results', JSON.stringify({
        total: questions.length,
        correct: totalCorrect,
        score: Math.round((totalCorrect / questions.length) * 100),
        results: allResults,
      }))

      navigate('/result')
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
      setAnswered(false)
      setTimerRunning(true)
    }
  }, [current, questions, results, navigate])

  if (questions.length === 0) {
    return (
      <div className="page quiz-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="empty-state">
          <div className="empty-icon">⏳</div>
          <div className="empty-title">Đang tải...</div>
        </div>
      </div>
    )
  }

  const q = questions[current]
  const progress = ((current + 1) / questions.length) * 100

  return (
    <div className="page quiz-page">
      <div className="bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* Toast notification */}
      {toast && (
        <div className={`result-toast ${toast.type === 'correct' ? 'correct-toast' : 'wrong-toast'}`}>
          {toast.msg}
        </div>
      )}

      {/* Top bar */}
      <div className="quiz-topbar">
        <div className="quiz-score-badge">
          Điểm: {score} / {current}
        </div>

        <div className="quiz-progress-wrap">
          <div className="quiz-progress-info">
            <span>Câu {current + 1} / {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Timer
          key={current}
          questionKey={current}
          running={timerRunning}
          onTimeout={handleTimeout}
        />
      </div>

      {/* Question body */}
      <div className="quiz-body">
        <div className="question-card">
          <div className="question-card-header">
            <div className="q-number-tag">
              Câu hỏi {current + 1}
            </div>
            <div className="question-text">{q.text}</div>
          </div>

          <div className={`options-grid`} style={{
            gridTemplateColumns: q.options.length <= 2 ? '1fr' : '1fr 1fr'
          }}>
            {q.options.map((opt, idx) => {
              let extraClass = ''
              if (answered) {
                if (idx === q.correct - 1) extraClass = 'correct'
                else if (idx === selected && !( idx === q.correct - 1)) extraClass = 'wrong'
              }
              if (selected === idx && !answered) extraClass = 'selected'

              return (
                <button
                  key={idx}
                  id={`option-${idx + 1}`}
                  className={`option-btn ${OPTION_COLORS[idx] || 'option-a'} ${extraClass}`}
                  onClick={() => handleAnswer(idx)}
                  disabled={answered}
                >
                  <span className="option-letter">{OPTION_LETTERS[idx]}</span>
                  <span className="option-text">{opt}</span>
                  {answered && idx === q.correct - 1 && (
                    <span style={{ marginLeft: 'auto', fontSize: '1.2rem' }}>✓</span>
                  )}
                  {answered && idx === selected && idx !== q.correct - 1 && (
                    <span style={{ marginLeft: 'auto', fontSize: '1.2rem' }}>✗</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="quiz-footer">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            if (window.confirm('Bạn muốn thoát quiz? Kết quả sẽ không được lưu.')) {
              navigate('/')
            }
          }}
        >
          Thoát
        </button>
      </div>
    </div>
  )
}

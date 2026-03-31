import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadQuestions } from '../utils/excelParser'
import Navbar from '../components/Navbar'

export default function HomePage() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [quizCount, setQuizCount] = useState(20)

  useEffect(() => {
    setQuestions(loadQuestions())
  }, [])

  const totalQ = questions.length
  const maxQ = Math.min(totalQ, 100)

  useEffect(() => {
    if (totalQ > 0) {
      setQuizCount(Math.min(20, totalQ))
    }
  }, [totalQ])

  const startQuiz = () => {
    if (totalQ === 0) {
      navigate('/import')
      return
    }
    setShowModal(true)
  }

  const confirmStart = () => {
    // Pick random N questions
    const shuffled = [...questions].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, quizCount)

    sessionStorage.setItem('quizmaster_session', JSON.stringify({
      questions: selected,
      startTime: Date.now(),
    }))

    setShowModal(false)
    navigate('/quiz')
  }

  return (
    <div className="page">
      <div className="bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <Navbar />

      <div className="container">
        {/* Hero */}
        <section className="hero">
          <div className="hero-eyebrow">
            Nền tảng trắc nghiệm thông minh
          </div>
          <h1 className="hero-title">
            Học nhanh hơn với<br />
            <span className="grad-text">QuizMaster</span>
          </h1>
          <p className="hero-subtitle">
            Import câu hỏi từ file Excel, làm trắc nghiệm với giao diện động,
            và theo dõi kết quả của bạn theo thời gian thực.
          </p>

          <div className="hero-actions">
            <button
              id="btn-start-quiz"
              className="btn btn-primary btn-lg"
              onClick={startQuiz}
            >
              {totalQ === 0 ? 'Import câu hỏi trước' : 'Bắt đầu làm bài'}
            </button>
            <button
              id="btn-import"
              className="btn btn-outline btn-lg"
              onClick={() => navigate('/import')}
            >
              📊 Import Excel
            </button>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{totalQ.toLocaleString()}</div>
              <div className="stat-label">Câu hỏi đã import</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">20s</div>
              <div className="stat-label">Mỗi câu hỏi</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">5</div>
              <div className="stat-label">Lựa chọn tối đa</div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="features-section">
          <h2 className="section-title">Tính năng nổi bật</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-title">Import từ Excel</div>
              <p className="feature-desc">
                Hỗ trợ file .xlsx với 500+ câu hỏi. Kéo thả hoặc click để upload.
                Tự động nhận dạng cột dữ liệu.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-title">Timer trực quan</div>
              <p className="feature-desc">
                Bộ đếm ngược 20 giây mỗi câu với vòng tròn động, đổi màu cảnh báo
                khi sắp hết giờ.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-title">Giao diện Quizziz</div>
              <p className="feature-desc">
                Các lựa chọn nhiều màu sắc, animation phản hồi ngay lập tức, hiển thị
                đáp án đúng/sai rõ ràng.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-title">Kết quả chi tiết</div>
              <p className="feature-desc">
                Xem điểm số, tỷ lệ đúng, và review lại tất cả câu hỏi sau khi kết thúc bài.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-title">Ngẫu nhiên câu hỏi</div>
              <p className="feature-desc">
                Chọn số lượng câu muốn làm. Hệ thống tự động trộn ngẫu nhiên từ ngân hàng đề.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-title">Lưu trữ offline</div>
              <p className="feature-desc">
                Câu hỏi được lưu vào trình duyệt, không cần server. Làm bài bất cứ lúc nào.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Start Quiz Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">Cấu hình bài quiz</div>
            <div className="modal-sub">
              Bạn có {totalQ.toLocaleString()} câu hỏi trong ngân hàng đề.
              Chọn số câu muốn làm:
            </div>

            <div className="slider-wrap">
              <div className="slider-count">{quizCount} câu</div>
              <div className="slider-label">
                <span>5 câu</span>
                <span>{maxQ} câu</span>
              </div>
              <input
                type="range"
                id="quiz-count-slider"
                min={Math.min(5, totalQ)}
                max={maxQ}
                step={1}
                value={quizCount}
                onChange={(e) => setQuizCount(Number(e.target.value))}
              />
            </div>

            <div style={{
              padding: '12px 16px',
              background: 'rgba(124,58,237,0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(124,58,237,0.2)',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              marginBottom: '8px'
            }}>
              Thời gian ước tính: <strong style={{ color: 'var(--primary-light)' }}>
                ~{Math.ceil(quizCount * 20 / 60)} phút
              </strong>
            </div>

            <div className="modal-actions">
              <button
                id="btn-cancel-modal"
                className="btn btn-ghost"
                onClick={() => setShowModal(false)}
              >
                Hủy
              </button>
              <button
                id="btn-confirm-start"
                className="btn btn-primary"
                onClick={confirmStart}
              >
                Bắt đầu ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

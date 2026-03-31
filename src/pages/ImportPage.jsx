import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseExcelFile, saveQuestions, loadQuestions, clearQuestions } from '../utils/excelParser'
import Navbar from '../components/Navbar'

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E']

const OPTION_COLORS_PREVIEW = [
  'hsl(0, 70%, 60%)',
  'hsl(45, 90%, 55%)',
  'hsl(130, 55%, 50%)',
  'hsl(210, 80%, 60%)',
  'hsl(290, 70%, 60%)',
]

export default function ImportPage() {
  const navigate = useNavigate()
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState(() => loadQuestions())
  const [search, setSearch] = useState('')
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  const handleFile = useCallback(async (file) => {
    if (!file) return
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setError('Chỉ hỗ trợ file Excel (.xlsx, .xls)')
      return
    }

    setError(null)
    setSuccessMsg(null)
    setLoading(true)

    try {
      const parsed = await parseExcelFile(file)
      const existing = loadQuestions()
      const merged = [...existing, ...parsed]
      saveQuestions(merged)
      setQuestions(merged)
      setSuccessMsg(`Import thành công ${parsed.length} câu hỏi! Tổng: ${merged.length} câu.`)
    } catch (err) {
      setError(`${err.message}`)
    } finally {
      setLoading(false)
    }
  }, [])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }, [handleFile])

  const onFileInput = (e) => {
    handleFile(e.target.files[0])
    e.target.value = '' // reset so same file can be re-uploaded
  }

  const handleClearAll = () => {
    if (window.confirm(`Bạn chắc chắn muốn xóa tất cả ${questions.length} câu hỏi?`)) {
      clearQuestions()
      setQuestions([])
      setSuccessMsg(null)
    }
  }

  const filtered = questions.filter(q =>
    q.text.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page">
      <div className="bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
      </div>

      <Navbar />

      <div className="container import-page">
        <div className="page-header">
          <h1 className="page-title">Import câu hỏi từ Excel</h1>
          <p className="page-subtitle">
            Hỗ trợ file .xlsx với hơn 500 câu hỏi. Kéo thả hoặc click để chọn file.
          </p>
        </div>

        {/* Upload zone */}
        <div
          className={`upload-zone ${dragging ? 'dragging' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={onFileInput}
            id="file-input"
          />
          {loading ? (
            <>
              <span className="upload-icon">L</span>
              <div className="upload-title">Đang xử lý file...</div>
              <div className="upload-sub">Vui lòng chờ trong giây lát</div>
            </>
          ) : (
            <>
              <span className="upload-icon">F</span>
              <div className="upload-title">
                {dragging ? 'Thả file vào đây!' : 'Kéo thả file hoặc click để chọn'}
              </div>
              <div className="upload-sub">
                Hỗ trợ file Excel (.xlsx, .xls) – Tối đa 10MB
              </div>
              <div className="format-chips">
                <span className="chip">.xlsx</span>
                <span className="chip">.xls</span>
                <span className="chip">500+ câu</span>
              </div>
            </>
          )}
        </div>

        {/* Notifications */}
        {error && (
          <div style={{
            marginTop: '16px', padding: '14px 20px',
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '12px', color: '#f87171', fontWeight: 600
          }}>
            {error}
          </div>
        )}
        {successMsg && (
          <div style={{
            marginTop: '16px', padding: '14px 20px',
            background: 'rgba(16,185,129,0.12)',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '12px', color: '#34d399', fontWeight: 600
          }}>
            {successMsg}
          </div>
        )}

        {/* Format guide */}
        <div className="format-guide" style={{ marginTop: '24px' }}>
          <h3>Format file Excel yêu cầu (hàng đầu tiên là tiêu đề):</h3>
          <h3>Biểu mẫu import file: <a href="https://docs.google.com/spreadsheets/d/1SE08dX7uIlVC6Fb3BChzzX68P0rlKOhYUr92INTiZBs/edit?usp=sharing" target="_blank" rel="noopener noreferrer">TẠI ĐÂY</a></h3>

          <table className="col-table">
            <thead>
              <tr>
                <th>Tên cột</th>
                <th>Mô tả</th>
                <th>Ví dụ</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><strong>Question Text</strong></td><td>Nội dung câu hỏi</td><td>Thủ đô của Việt Nam là?</td></tr>
              <tr><td><strong>Option 1</strong></td><td>Đáp án 1</td><td>Hà Nội</td></tr>
              <tr><td><strong>Option 2</strong></td><td>Đáp án 2</td><td>TP. HCM</td></tr>
              <tr><td><strong>Option 3</strong></td><td>Đáp án 3 (tùy chọn)</td><td>Đà Nẵng</td></tr>
              <tr><td><strong>Option 4</strong></td><td>Đáp án 4 (tùy chọn)</td><td>Huế</td></tr>
              <tr><td><strong>Option 5</strong></td><td>Đáp án 5 (tùy chọn)</td><td>–</td></tr>
              <tr><td><strong>Correct</strong></td><td>Số thứ tự đáp án đúng (1–5)</td><td>1</td></tr>
              <tr><td><strong>Time</strong></td><td>Thời gian làm bài (giây) – Mặc định 20s</td><td>30</td></tr>
            </tbody>
          </table>
        </div>

        {/* Preview */}
        {questions.length > 0 && (
          <div className="preview-section">
            <div className="preview-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, flexWrap: 'wrap' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700 }}>
                  Ngân hàng câu hỏi
                </h2>
                <span className="badge badge-primary">{questions.length} câu</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="search-bar">
                  S
                  <input
                    id="search-questions"
                    type="text"
                    placeholder="Tìm kiếm câu hỏi..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <button
                  id="btn-start-from-import"
                  className="btn btn-success btn-sm"
                  onClick={() => navigate('/')}
                >
                  Bắt đầu quiz
                </button>
                <button
                  id="btn-clear-all"
                  className="btn btn-danger btn-sm"
                  onClick={handleClearAll}
                >
                  Xóa tất cả
                </button>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">S</div>
                <div className="empty-title">Không tìm thấy câu hỏi</div>
                <div className="empty-sub">Thử từ khóa khác</div>
              </div>
            ) : (
              <div className="question-list">
                {filtered.slice(0, 50).map((q, i) => (
                  <div key={q.id} className="question-item">
                    <div className="q-header">
                      <div className="q-number">{i + 1}</div>
                      <div className="q-text">{q.text}</div>
                    </div>
                    <div className="q-options">
                      {q.options.map((opt, oi) => (
                        <div
                          key={oi}
                          className={`q-option ${oi === q.correct - 1 ? 'correct' : ''}`}
                        >
                          <span
                            className="opt-label"
                            style={{
                              background: OPTION_COLORS_PREVIEW[oi],
                              color: [1, 2].includes(oi) ? '#1a1035' : 'white'
                            }}
                          >
                            {OPTION_LETTERS[oi]}
                          </span>
                          {opt}
                          {oi === q.correct - 1 && ' ✓'}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {filtered.length > 50 && (
                  <div style={{
                    textAlign: 'center', padding: '16px',
                    color: 'var(--text-muted)', fontSize: '0.875rem'
                  }}>
                    Hiển thị 50 / {filtered.length} câu. Vào{' '}
                    <button
                      style={{ background: 'none', border: 'none', color: 'var(--primary-light)', cursor: 'pointer', fontWeight: 700 }}
                      onClick={() => navigate('/bank')}
                    >
                      Ngân hàng câu hỏi
                    </button>{' '}
                    để xem tất cả.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

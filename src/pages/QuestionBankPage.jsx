import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadQuestions, saveQuestions } from '../utils/excelParser'
import Navbar from '../components/Navbar'

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E']
const PAGE_SIZE = 20

export default function QuestionBankPage() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState(() => loadQuestions())
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [editId, setEditId] = useState(null)
  const [editData, setEditData] = useState(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return questions
    return questions.filter(q =>
      q.text.toLowerCase().includes(search.toLowerCase())
    )
  }, [questions, search])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const deleteQuestion = (id) => {
    if (!window.confirm('Xóa câu hỏi này?')) return
    const updated = questions.filter(q => q.id !== id)
    saveQuestions(updated)
    setQuestions(updated)
    if (page > Math.ceil(updated.length / PAGE_SIZE)) {
      setPage(Math.max(1, Math.ceil(updated.length / PAGE_SIZE)))
    }
  }

  const startEdit = (q) => {
    setEditId(q.id)
    setEditData({
      text: q.text,
      options: [...q.options],
      correct: q.correct,
    })
  }

  const saveEdit = () => {
    if (!editData.text.trim()) return
    const updated = questions.map(q =>
      q.id === editId ? { ...q, ...editData } : q
    )
    saveQuestions(updated)
    setQuestions(updated)
    setEditId(null)
    setEditData(null)
  }

  const cancelEdit = () => {
    setEditId(null)
    setEditData(null)
  }

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const getPaginationRange = () => {
    const range = []
    const delta = 2
    const left = Math.max(1, page - delta)
    const right = Math.min(totalPages, page + delta)
    for (let i = left; i <= right; i++) range.push(i)
    return range
  }

  return (
    <div className="page bank-page">
      <div className="bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
      </div>

      <Navbar />

      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Ngân hàng câu hỏi</h1>
          <p className="page-subtitle">
            Quản lý toàn bộ câu hỏi đã import. Tổng cộng{' '}
            <strong style={{ color: 'var(--primary-light)' }}>{questions.length}</strong> câu hỏi.
          </p>
        </div>

        {questions.length === 0 ? (
          <div className="empty-state">
            <div style={{ marginBottom: '24px' }}></div>
            <div className="empty-title">Chưa có câu hỏi nào</div>
            <div className="empty-sub">Import file Excel để bắt đầu</div>
            <button
              id="btn-go-import"
              className="btn btn-primary"
              onClick={() => navigate('/import')}
            >
              Import ngay
            </button>
          </div>
        ) : (
          <>
            <div className="bank-controls">
              <div className="bank-left">
                <div className="search-bar" style={{ maxWidth: '420px', flex: 1 }}>
                  S
                  <input
                    id="bank-search"
                    type="text"
                    placeholder="Tìm kiếm câu hỏi..."
                    value={search}
                    onChange={handleSearchChange}
                  />
                </div>
                <span className="badge badge-primary">
                  {filtered.length} kết quả
                </span>
              </div>
              <div className="bank-right">
                <button
                  id="btn-import-more"
                  className="btn btn-outline btn-sm"
                  onClick={() => navigate('/import')}
                >
                  Import thêm
                </button>
                <button
                  id="btn-start-quiz-bank"
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate('/')}
                >
                  Bắt đầu quiz
                </button>
                <button
                  id="btn-delete-all"
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    if (window.confirm('Bạn chắc chắn muốn xóa tất cả câu hỏi trong ngân hàng?')) {
                      localStorage.removeItem('quizmaster_questions')
                      setQuestions([])
                    }
                  }}
                >
                  Xóa tất cả
                </button>
              </div>
            </div>

            <div className="bank-table-wrap">
              <table className="bank-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>#</th>
                    <th>Câu hỏi</th>
                    <th style={{ width: '100px' }}>Đáp án đúng</th>
                    <th style={{ width: '80px' }}>Số lựa chọn</th>
                    <th style={{ width: '120px' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((q, idx) => {
                    const globalIdx = (page - 1) * PAGE_SIZE + idx + 1
                    const isEditing = editId === q.id

                    if (isEditing) {
                      return (
                        <tr key={q.id}>
                          <td colSpan={5} style={{ padding: '20px' }}>
                            <div style={{
                              background: 'rgba(124,58,237,0.08)',
                              border: '1px solid rgba(124,58,237,0.25)',
                              borderRadius: '12px',
                              padding: '20px',
                            }}>
                              <div style={{ marginBottom: '12px' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                                  Câu hỏi:
                                </label>
                                <textarea
                                  value={editData.text}
                                  onChange={e => setEditData(d => ({ ...d, text: e.target.value }))}
                                  rows={2}
                                  style={{
                                    width: '100%', padding: '10px 14px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(124,58,237,0.3)',
                                    borderRadius: '8px', color: 'var(--text-primary)',
                                    fontFamily: 'var(--font-body)', fontSize: '0.9rem',
                                    resize: 'vertical'
                                  }}
                                />
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                                {editData.options.map((opt, oi) => (
                                  <div key={oi}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                                      {OPTION_LETTERS[oi]}:
                                    </label>
                                    <input
                                      value={opt}
                                      onChange={e => {
                                        const newOpts = [...editData.options]
                                        newOpts[oi] = e.target.value
                                        setEditData(d => ({ ...d, options: newOpts }))
                                      }}
                                      style={{
                                        width: '100%', padding: '8px 12px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: `1px solid ${oi === editData.correct - 1 ? 'rgba(16,185,129,0.5)' : 'rgba(124,58,237,0.2)'}`,
                                        borderRadius: '8px', color: 'var(--text-primary)',
                                        fontFamily: 'var(--font-body)', fontSize: '0.875rem'
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                  Đáp án đúng:
                                </label>
                                <select
                                  value={editData.correct}
                                  onChange={e => setEditData(d => ({ ...d, correct: Number(e.target.value) }))}
                                  style={{
                                    padding: '8px 14px',
                                    background: 'rgba(124,58,237,0.15)',
                                    border: '1px solid rgba(124,58,237,0.3)',
                                    borderRadius: '8px', color: 'var(--text-primary)',
                                    fontFamily: 'var(--font-body)', fontWeight: 700
                                  }}
                                >
                                  {editData.options.map((_, oi) => (
                                    <option key={oi} value={oi + 1}>{OPTION_LETTERS[oi]}: {editData.options[oi].slice(0, 30)}</option>
                                  ))}
                                </select>
                                <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                                  <button className="btn btn-ghost btn-sm" onClick={cancelEdit}>Hủy</button>
                                  <button className="btn btn-success btn-sm" onClick={saveEdit}>✓ Lưu</button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )
                    }

                    return (
                      <tr key={q.id}>
                        <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{globalIdx}</td>
                        <td style={{ color: 'var(--text-primary)', fontWeight: 600, maxWidth: '400px' }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {q.text}
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-success">
                            {OPTION_LETTERS[q.correct - 1]}: {q.options[q.correct - 1]?.slice(0, 20)}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="badge badge-primary">{q.options.length}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => startEdit(q)}
                              title="Chỉnh sửa"
                              style={{ padding: '6px 10px' }}
                            >
                              Sửa
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => deleteQuestion(q.id)}
                              title="Xóa"
                              style={{ padding: '6px 10px' }}
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bank-pagination">
                <button
                  className="page-btn"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                >
                  «
                </button>
                <button
                  className="page-btn"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ‹
                </button>
                {getPaginationRange().map(p => (
                  <button
                    key={p}
                    className={`page-btn ${page === p ? 'active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="page-btn"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  ›
                </button>
                <button
                  className="page-btn"
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                >
                  »
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

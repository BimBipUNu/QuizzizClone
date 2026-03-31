import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { loadQuestions } from '../utils/excelParser'

export default function Navbar() {
  const location = useLocation()
  const questions = loadQuestions()
  const count = questions.length

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('quizmaster_theme') || 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('quizmaster_theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  const isActive = (path) => location.pathname === path ? 'active' : ''

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo">
          <div className="logo-icon">Q</div>
          <div className="logo-text">
            Quiz<span>Master</span>
          </div>
        </Link>

        <div className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/')}`} id="nav-home">
            <span>Trang chủ</span>
          </Link>
          <Link to="/import" className={`nav-link ${isActive('/import')}`} id="nav-import">
            <span>Import</span>
          </Link>
          <Link to="/bank" className={`nav-link ${isActive('/bank')}`} id="nav-bank">
            <span>Ngân hàng</span>
            {count > 0 && (
              <span className="badge badge-primary" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                {count}
              </span>
            )}
          </Link>
          <button 
            className="btn btn-ghost btn-toggle-theme" 
            onClick={toggleTheme}
            style={{ width: '40px', height: '40px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '8px' }}
            title={theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
          >
            {theme === 'dark' ? 'Sáng' : 'Tối'}
          </button>
        </div>
      </div>
    </nav>
  )
}

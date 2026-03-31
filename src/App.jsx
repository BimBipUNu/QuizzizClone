import { HashRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ImportPage from './pages/ImportPage'
import QuizPage from './pages/QuizPage'
import ResultPage from './pages/ResultPage'
import QuestionBankPage from './pages/QuestionBankPage'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/import" element={<ImportPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/bank" element={<QuestionBankPage />} />
      </Routes>
    </HashRouter>
  )
}

export default App

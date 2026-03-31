/**
 * Parse Excel file (.xlsx) and return array of question objects
 * Expected columns: Question Text, Question (No.), Option 1-5, Correct (1-5)
 */
import * as XLSX from 'xlsx'

export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })

        // Take the first sheet
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        // Convert to JSON with header row
        const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' })

        if (!rows || rows.length === 0) {
          reject(new Error('File Excel trống hoặc không có dữ liệu'))
          return
        }

        // Detect column names (case-insensitive)
        const firstRow = rows[0]
        const keys = Object.keys(firstRow)

        const findCol = (...candidates) => {
          for (const c of candidates) {
            const found = keys.find(k => k.toLowerCase().trim() === c.toLowerCase())
            if (found) return found
          }
          // Try partial match
          for (const c of candidates) {
            const found = keys.find(k => k.toLowerCase().includes(c.toLowerCase()))
            if (found) return found
          }
          return null
        }

        const colText = findCol('question text', 'câu hỏi', 'question', 'nội dung', 'text')
        const colOpt1 = findCol('option 1', 'answer 1', 'a', 'đáp án 1', 'opt1', 'choice 1')
        const colOpt2 = findCol('option 2', 'answer 2', 'b', 'đáp án 2', 'opt2', 'choice 2')
        const colOpt3 = findCol('option 3', 'answer 3', 'c', 'đáp án 3', 'opt3', 'choice 3')
        const colOpt4 = findCol('option 4', 'answer 4', 'd', 'đáp án 4', 'opt4', 'choice 4')
        const colOpt5 = findCol('option 5', 'answer 5', 'e', 'đáp án 5', 'opt5', 'choice 5')
        const colCorrect = findCol('correct', 'answer', 'correct answer', 'đáp án đúng', 'dap an dung', 'key')

        if (!colText) {
          reject(new Error('Không tìm thấy cột "Question Text". Hãy kiểm tra tiêu đề cột.'))
          return
        }

        if (!colCorrect) {
          reject(new Error('Không tìm thấy cột "Correct". Hãy kiểm tra tiêu đề cột.'))
          return
        }

        const questions = []

        rows.forEach((row, index) => {
          const text = String(row[colText] || '').trim()
          if (!text) return // skip empty rows

          const options = []
          const optCols = [colOpt1, colOpt2, colOpt3, colOpt4, colOpt5]

          optCols.forEach((col) => {
            if (col && row[col] !== undefined && row[col] !== '') {
              options.push(String(row[col]).trim())
            }
          })

          if (options.length < 2) return // skip rows with <2 options

          const correctRaw = row[colCorrect]
          let correctIndex = parseInt(correctRaw, 10)

          if (isNaN(correctIndex)) {
            // Try to match as text
            const correctText = String(correctRaw).trim().toLowerCase()
            const matchIndex = options.findIndex(
              o => o.toLowerCase() === correctText
            )
            correctIndex = matchIndex >= 0 ? matchIndex + 1 : 1
          }

          // Clamp to valid range
          correctIndex = Math.max(1, Math.min(correctIndex, options.length))

          questions.push({
            id: `q_${Date.now()}_${index}`,
            text,
            options,
            correct: correctIndex, // 1-indexed
          })
        })

        if (questions.length === 0) {
          reject(new Error('Không parse được câu hỏi nào. Kiểm tra lại format file.'))
          return
        }

        resolve(questions)
      } catch (err) {
        reject(new Error(`Lỗi khi đọc file: ${err.message}`))
      }
    }

    reader.onerror = () => reject(new Error('Không thể đọc file'))
    reader.readAsArrayBuffer(file)
  })
}

export function saveQuestions(questions) {
  localStorage.setItem('quizmaster_questions', JSON.stringify(questions))
}

export function loadQuestions() {
  try {
    const raw = localStorage.getItem('quizmaster_questions')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveResults(results) {
  const history = loadHistory()
  history.unshift({ ...results, date: new Date().toISOString() })
  localStorage.setItem('quizmaster_history', JSON.stringify(history.slice(0, 20)))
}

export function loadHistory() {
  try {
    const raw = localStorage.getItem('quizmaster_history')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function clearQuestions() {
  localStorage.removeItem('quizmaster_questions')
}

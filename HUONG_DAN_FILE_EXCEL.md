# Hướng dẫn tạo File Excel cho QuizMaster

Để import thành công hơn 500 câu hỏi, bạn hãy tạo file Excel (.xlsx) với các cột như sau ở hàng đầu tiên (tiêu đề):

| Question Text | Option 1 | Option 2 | Option 3 | Option 4 | Option 5 (Tùy chọn) | Correct |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Nội dung câu hỏi 1 | Đáp án A | Đáp án B | Đáp án C | Đáp án D | | 1 |
| Nội dung câu hỏi 2 | Lựa chọn 1 | Lựa chọn 2 | Lựa chọn 3 | | | 2 |

### Các lưu ý Quan trọng:
1.  **Cột "Correct":** Nhập số thứ tự của đáp án đúng (ví dụ: `1` cho Option 1, `2` cho Option 2).
2.  **Tên Cột:** Hệ thống tự động nhận diện tiếng Anh hoặc tiếng Việt thông dụng (ví dụ: "Question Text" hoặc "Câu hỏi", "Correct" hoặc "Đáp án đúng").
3.  **Số lượng câu hỏi:** Bạn có thể import 1 lần 500+ câu. Sau khi import, bạn có thể vào mục **"Ngân hàng câu hỏi"** để quản lý hoặc chỉnh sửa.
4.  **Tùy chọn:** Bạn có thể có từ 2 đến 5 lựa chọn cho mỗi câu hỏi.

---
### Cách chạy ứng dụng:
1. Chạy lệnh: `npm run dev`
2. Mở trình duyệt theo đường dẫn hiển thị (thường là `http://localhost:5173/QuizzizClone/`)
3. Vào mục **Import**, chọn file Excel của bạn.
4. Quay lại **Trang chủ**, chọn số lượng câu hỏi và bắt đầu!

### Deploy lên GitHub Pages:
Ứng dụng đã được cấu hình sẵn. Khi bạn sẵn sàng, hãy chạy lệnh:
`npm run deploy`

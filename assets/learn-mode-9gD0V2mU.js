const n=`Chế độ Học giúp bạn ôn một bộ câu hỏi theo từng phiên ngắn. Hệ thống ghi nhớ những câu bạn đã trả lời đúng và ưu tiên hỏi lại những câu bạn còn sai.

## Bắt đầu học

1. Mở trang chi tiết của bộ câu hỏi.
2. Nhấn **Học** (*Learn*).
3. Thanh tiến độ ở đầu trang hiển thị số câu đã hoàn thành trên tổng số câu, ví dụ "Đã hoàn thành 12 trên 40", kèm phần trăm.

Mỗi phiên có tối đa 7 câu, lấy từ những câu bạn chưa trả lời đúng. Câu bạn từng trả lời sai được đưa lên trước.

> [!NOTE]
> Tùy cấu hình hệ thống, chế độ Học có thể yêu cầu gói đăng ký có quyền học. Nếu tài khoản chưa đủ quyền, bạn sẽ được đưa trở lại trang trước. Xem [Gói đăng ký](/guide/settings/subscription).

## Trả lời một câu hỏi

1. Đọc hướng dẫn phía trên đáp án, ví dụ "Chọn (2) đáp án", "Sắp xếp các đáp án theo đúng thứ tự".
2. Chọn, kéo thả hoặc gõ câu trả lời tùy loại câu hỏi.
3. Nhấn **Xong** (*Submit*).

Kết quả hiện ngay bên cạnh hướng dẫn: **Chính xác!** (*Correct!*) hoặc **Sai!** (*Wrong answer!*). Đáp án đúng và sai được tô màu để bạn so sánh.

Với câu tự luận ngắn, hệ thống không phân biệt chữ hoa/chữ thường và bỏ qua khoảng trắng thừa. Với thẻ ghi nhớ ngôn ngữ, câu hỏi hiển thị dạng trắc nghiệm; sau khi trả lời, nội dung đầy đủ của thẻ sẽ hiện ra. Thẻ chưa có nghĩa (thẻ nháp) không xuất hiện khi học.

### Nút "Không biết?"

Nếu chưa biết đáp án, nhấn **Không biết?** (*Don't know?*). Câu hỏi được đánh dấu **Bỏ qua** (*Skipped*) và đáp án đúng được hiển thị. Câu này được tính như trả lời sai.

### Xem giải thích

Sau khi nhấn **Xong** hoặc **Không biết?**, khung giải thích mở ra ở cuối trang (nếu người tạo có nhập giải thích). Nhấn **Giải thích** (*Explanation*) để mở lại hoặc thu gọn khung này. Nhấn **Câu hỏi tiếp theo** (*Next question*) để sang câu kế tiếp.

## Ôn lại câu sai trong phiên

Khi hết các câu của phiên, những câu bạn trả lời sai hoặc bỏ qua sẽ được hỏi lại một lần nữa, kèm dòng nhắc "Hãy thử lại một lần nữa".

- Trả lời đúng ở lần này: câu được tính là hoàn thành.
- Vẫn sai: câu được ghi nhận là sai và sẽ được ưu tiên ở các phiên sau.

## Kết thúc phiên

Cuối mỗi phiên, một màn hình tổng kết hiển thị:

- **Tiến trình bộ đề** (*Total set progress*) với số câu đã hoàn thành và tổng số câu.
- Danh sách **Các câu hỏi đã hoàn thành trong phiên này** (*Questions completed in this session*). Bạn có thể mở từng câu để xem lại đáp án.

Để học tiếp các câu còn lại, hãy mở lại chế độ **Học** của bộ câu hỏi. Tiến độ của bạn được lưu theo từng câu trả lời đúng.

## Hoàn thành bộ câu hỏi

Khi bạn đã trả lời đúng tất cả các câu, màn hình **Chúc mừng! Bạn đã hoàn thành!** (*Nice work! You've completed it!*) xuất hiện với ba lựa chọn:

| Nút | Tác dụng |
| --- | --- |
| **Quay về trang chủ** (*Back to home page*) | Về Thư viện. |
| **Làm bài kiểm tra** (*Take a test*) | Mở [Bài luyện tập](/guide/learning/practice-test) cho bộ câu hỏi này. |
| **Đặt lại chế độ học** (*Reset learn mode*) | Xóa tiến độ học để bắt đầu lại từ đầu. |

> [!WARNING]
> **Đặt lại chế độ học** xóa toàn bộ tiến độ học của bạn với bộ câu hỏi này. Thao tác không có bước xác nhận.

## Xem thêm

- [Bài luyện tập](/guide/learning/practice-test)
- [Bình luận & đánh giá](/guide/learning/comments)
- [Các loại câu hỏi](/guide/question-sets/question-types)
`;export{n as default};

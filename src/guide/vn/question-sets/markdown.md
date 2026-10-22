Mỗi câu hỏi có thể soạn ở một trong hai chế độ nội dung: Rich text (soạn trực quan) hoặc Markdown (gõ cú pháp, có xem trước). Trang này giải thích cách chuyển chế độ và cú pháp Markdown được hỗ trợ.

## Hai chế độ nội dung

| Chế độ | Phù hợp khi | Định dạng có sẵn |
| --- | --- | --- |
| **Rich text** | Soạn nhanh, không cần nhớ cú pháp | Đậm, nghiêng, gạch chân, danh sách dấu chấm, danh sách số, khối code |
| **Markdown** | Câu hỏi lập trình, bảng, nhiều khối code | Xem mục cú pháp bên dưới |

Chế độ áp dụng cho **Nội dung câu hỏi** và **Giải thích** của từng câu. Câu hỏi mới mặc định là Rich text, trừ khi tất cả câu hiện có trong bộ đều đang dùng Markdown.

> [!NOTE]
> Thẻ ghi nhớ ngôn ngữ không có công tắc này; mặt trước của thẻ luôn là chữ thường.

## Chuyển chế độ

1. Ở đầu câu hỏi, tìm công tắc **Rich text** / **Markdown**.
2. Chọn chế độ bạn muốn.
3. Nếu câu hỏi đã có nội dung, hộp thoại xác nhận hiện ra. Bấm **OK** để chuyển.

> [!WARNING]
> Chuyển sang Markdown có thể làm mất một số định dạng, ví dụ gạch chân. Chuyển sang Rich text có thể làm mất bảng và các thành phần chỉ có trong Markdown. Hãy kiểm tra lại nội dung sau khi chuyển.

## Soạn và xem trước Markdown

- Màn hình rộng: khung **Soạn thảo** (*Edit*) và khung **Xem trước** (*Preview*) nằm cạnh nhau.
- Màn hình hẹp hơn: hai khung xếp dọc.
- Điện thoại: bấm thẻ **Soạn thảo** hoặc **Xem trước** để chuyển qua lại.

Với các ô đáp án (lựa chọn, vế ghép, mục sắp xếp, đáp án tự luận), dòng **Xem trước** hiện ngay dưới ô nhập khi câu hỏi ở chế độ Markdown. Đáp án chỉ dùng Markdown inline, ví dụ chữ đậm, nghiêng, code.

## Cú pháp được hỗ trợ

```markdown
**chữ đậm**, *chữ nghiêng*, ~~gạch ngang~~, `code inline`

- mục danh sách
1. mục đánh số

> trích dẫn

| Cột A | Cột B |
| --- | --- |
| 1 | 2 |

[liên kết](https://example.com)
```

Khối code: đặt code giữa hai dòng ba dấu backtick, ghi tên ngôn ngữ ngay sau ba dấu đầu tiên để tô màu cú pháp.

```python
print("Hello")
```

Các ngôn ngữ được tô màu: C#, Java, JavaScript, TypeScript, SQL, JSON, YAML, Bash, HTML/XML, CSS, Python, Go, Dockerfile, Kotlin. Mỗi khối code có nút **Sao chép** (*Copy*).

## Lưu ý

- Một lần xuống dòng trong khung soạn thảo sẽ thành xuống dòng khi hiển thị.
- Thẻ HTML gõ trong Markdown được hiển thị như chữ, không được thực thi.
- Ảnh chèn bằng cú pháp Markdown chỉ hiển thị dưới dạng liên kết. Để thêm ảnh hoặc video, dùng phần [Ảnh / video trong câu hỏi](/guide/question-sets/media).
- Liên kết mở trong thẻ mới. Địa chỉ bắt đầu bằng `http://` hoặc `https://` được tự động chuyển thành liên kết.

## Xem thêm

- [Tạo bộ câu hỏi](/guide/question-sets/create)
- [Các loại câu hỏi](/guide/question-sets/question-types)
- [Ảnh / video trong câu hỏi](/guide/question-sets/media)

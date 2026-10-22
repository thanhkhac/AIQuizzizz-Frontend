Thay vì gõ từng câu, bạn có thể soạn nhiều câu hỏi trong tệp Excel rồi nhập vào bộ câu hỏi. Hệ thống đọc tệp, phân loại câu hợp lệ và không hợp lệ để bạn chọn câu muốn nhập.

## Mở hộp thoại nhập

Ở trang tạo hoặc chỉnh sửa bộ câu hỏi, bấm **Nhập** (*Import*) trong phần **Câu hỏi trong bộ câu hỏi** (*Quiz Questions*). Hộp thoại **Nhập câu hỏi** (*Import Questions*) mở ra.

## Chuẩn bị tệp

1. Bấm **Tải xuống mẫu** (*Download template*) để tải tệp mẫu.
2. Điền câu hỏi vào tệp mẫu, mỗi dòng một câu. Giữ nguyên tên các cột.
3. Lưu tệp ở định dạng XLS hoặc XLSX.

| Cột | Cách điền |
| --- | --- |
| Question Type | Bắt buộc. Một trong các giá trị `MultipleChoice`, `Matching`, `Ordering`, `ShortText`, viết đúng như vậy. |
| Question Text | Bắt buộc. Nội dung câu hỏi. |
| Score | Bắt buộc. Số điểm từ 0 đến 999. |
| Text Format | Không bắt buộc. `PlainText`, `Html` hoặc `Markdown`. |
| Option 1 … Option 10 | Đáp án, cách điền tùy loại câu hỏi (xem bên dưới). |

Cách điền cột Option theo từng loại:

- **Trắc nghiệm**: mỗi ô là một lựa chọn. Thêm dấu `*` ở đầu lựa chọn đúng, ví dụ `*Hà Nội`.
- **Ghép đôi**: Option 1 và Option 2 là một cặp, Option 3 và Option 4 là cặp tiếp theo, và cứ thế.
- **Sắp xếp**: điền các mục theo đúng thứ tự.
- **Tự luận ngắn**: điền đáp án vào một ô Option.

> [!NOTE]
> Tệp nhập không có cột giải thích và không hỗ trợ loại Thẻ ghi nhớ ngôn ngữ. Bạn có thể thêm giải thích hoặc thẻ sau khi nhập.

## Tải tệp lên và xem trước

1. Trong mục **Tải lên tệp** (*Upload File*), bấm vào khung tải lên hoặc kéo tệp vào. Mỗi lần chỉ tải một tệp.
2. Khi đọc xong, mục **Xem trước** (*Preview*) liệt kê các câu hỏi trong tệp.
3. Dùng ô lọc để xem **Tất cả** (*All*), **Hợp lệ** (*Valid*) hoặc **Không hợp lệ** (*Invalid*). Câu không hợp lệ được đánh dấu riêng.
4. Bấm mũi tên ở mỗi câu để xem đáp án.

Một câu bị coi là không hợp lệ khi sai loại câu hỏi, thiếu nội dung, điểm không hợp lệ hoặc đáp án không đạt quy tắc của loại đó. Xem [Các loại câu hỏi](/guide/question-sets/question-types).

> [!WARNING]
> Nếu tệp không đúng định dạng hoặc thiếu cột bắt buộc, hệ thống báo lỗi và không đọc tệp. Hãy dùng đúng tệp mẫu.

## Chọn câu và nhập

1. Đánh dấu các câu muốn nhập, hoặc dùng **Chọn tất cả** (*Check all*).
2. Bấm **Nhập** ở cuối hộp thoại, rồi bấm **OK** trong hộp xác nhận.
3. Các câu được thêm vào đầu danh sách câu hỏi. Câu trống mặc định (chưa nhập gì) được bỏ đi.
4. Kiểm tra lại các câu vừa nhập, rồi lưu bộ câu hỏi.

> [!TIP]
> Bạn vẫn có thể chọn nhập câu không hợp lệ, nhưng phải sửa chúng trong trình soạn thảo trước khi lưu. Tổng số câu sau khi nhập không được vượt quá 500.

## Xem thêm

- [Tạo bộ câu hỏi](/guide/question-sets/create)
- [Các loại câu hỏi](/guide/question-sets/question-types)
- [Rich text & Markdown](/guide/question-sets/markdown)

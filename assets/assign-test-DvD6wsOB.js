const n=`Chủ lớp và giáo viên có thể giao bài kiểm tra cho cả lớp, đặt thời gian mở bài, thời gian làm bài, số lần làm và cách chấm điểm. Trang này cũng giới thiệu tab **Thư viện quiz** (*Quiz*) của lớp.

## Danh sách bài kiểm tra của lớp

Tab **Bài kiểm tra** (*Exam*) liệt kê các bài đã giao. Mỗi bài hiển thị thời điểm bắt đầu, số câu hỏi, thời gian làm bài (phút), số lượt hoàn thành và trạng thái:

| Trạng thái | Ý nghĩa |
| --- | --- |
| **Sắp diễn ra** (*Upcoming*) | Chưa tới thời gian bắt đầu. |
| **Đang diễn ra** (*Active*) | Học sinh có thể làm bài. |
| **Đã hoàn thành** (*Completed*) | Đã qua thời gian kết thúc. |

Dùng bộ lọc trạng thái và ô **Tìm kiếm bài kiểm tra...** (*Search exam...*) để tìm nhanh.

## Giao bài kiểm tra mới

> [!NOTE]
> Tùy cấu hình hệ thống, việc giao bài kiểm tra có thể yêu cầu gói đăng ký có quyền mở bài kiểm tra. Xem [Gói đăng ký](/guide/settings/subscription).

1. Trong tab **Bài kiểm tra**, nhấn **Giao bài kiểm tra** (*Assign test*).
2. Cửa sổ **Cài đặt bài kiểm tra** (*Test settings*) mở ra. Điền các mục (xem mục "Cài đặt bài kiểm tra" bên dưới) rồi nhấn **Tiếp theo** (*Next*). Nếu nhấn **Hủy** (*Cancel*) ngay lần đầu, bạn sẽ quay về danh sách bài kiểm tra.
3. Thêm câu hỏi theo một trong hai cách ở phần dưới (có thể kết hợp cả hai).
4. Nhấn **Tiếp theo** ở góc phải danh sách câu hỏi.
5. Trong hộp thoại **Tạo bài kiểm tra mới!** (*Create new test!*), nhấn **Đồng ý** (*Ok*).

Để mở lại cửa sổ cài đặt, nhấn mũi tên quay lại ở góc trái tiêu đề trang. Mỗi bài kiểm tra có từ 1 đến 100 câu hỏi.

### Tự soạn câu hỏi

Nhấn **Thêm câu hỏi** (*Add question*), chọn loại câu hỏi (trắc nghiệm, ghép đôi, sắp xếp hoặc tự luận ngắn), nhập nội dung, đáp án và điểm của câu. Cách soạn giống như khi [tạo bộ câu hỏi](/guide/question-sets/create).

### Lấy câu hỏi từ thư mục hoặc bộ câu hỏi

1. Nhấn **Chọn từ thư mục** (*Choose from folder*).
2. Chọn nguồn câu hỏi theo một trong hai tab:
   - Tab **Thư mục** (*Folder*): hộp **Chọn thư mục** (*Select folder*) liệt kê các thư mục của bạn và thư mục được chia sẻ. Chọn một thư mục để xem các bộ câu hỏi bên trong.
   - Tab **Bộ câu hỏi** (*Question sets*): liệt kê các bộ câu hỏi của bạn và các bộ được chia sẻ với bạn. Dùng ô lọc **Tất cả** (*All*), **Tạo bởi tôi** (*Created by me*) hoặc **Được chia sẻ với tôi** (*Shared with me*) và ô tìm kiếm để tìm nhanh.
3. Trong hộp **Chọn bộ câu hỏi** (*Select question set*), nhấn **Xem** (*View*) tại bộ câu hỏi cần dùng.
4. Ở cửa sổ **Chọn câu hỏi** (*Choose question*), lọc theo loại câu hỏi hoặc gõ vào ô tìm kiếm nếu cần, rồi đánh dấu các câu cần lấy, hoặc nhấn **Chọn tất cả** (*Check all*).
5. Nhấn **Nhập** (*Import*). Trong hộp **Nhập các câu hỏi đã chọn?** (*Import selected questions?*), nhấn **Đồng ý**.

Các câu đã chọn được thêm vào cuối danh sách. Câu hỏi mặc định còn trống sẽ tự được bỏ đi.

Bạn có thể lấy câu hỏi từ bất kỳ bộ câu hỏi nào bạn có quyền xem: bộ của bạn, bộ được chia sẻ với bạn, bộ công khai, bộ trong lớp của bạn, hoặc bộ nằm trong thư mục được chia sẻ với bạn. Xem [Thư mục](/guide/folders/folders).

> [!NOTE]
> Câu hỏi loại **Thẻ ghi nhớ ngôn ngữ** (*Language flashcard*) không hiển thị trong cửa sổ **Chọn câu hỏi** vì bài kiểm tra không hỗ trợ loại câu hỏi này.

## Bản sao câu hỏi trong bài kiểm tra

Mỗi bài kiểm tra giữ **bản sao riêng** của từng câu hỏi:

- Sửa câu hỏi trong bộ câu hỏi gốc **không** làm thay đổi các bài kiểm tra đã tạo.
- Sửa câu hỏi ngay trong bài kiểm tra **không** làm thay đổi bộ câu hỏi gốc.
- **Điểm** của câu hỏi được đặt riêng cho từng bài kiểm tra trong trình soạn bài, không phụ thuộc vào bộ câu hỏi.

### Phiên bản câu hỏi

Mỗi câu hỏi trong bộ câu hỏi có một số phiên bản. Số này tăng mỗi khi nội dung câu hỏi thay đổi: nội dung câu, giải thích, đáp án hoặc ảnh / video. Thay đổi điểm không làm tăng phiên bản.

### Cập nhật câu hỏi theo bản gốc

Khi sửa một bài kiểm tra, nếu câu gốc trong bộ câu hỏi đã có phiên bản mới hơn, phía trên câu đó hiện một thông báo màu vàng:

"Câu gốc trong bộ {tên bộ} đã có bản mới (bài đang dùng v{bản hiện tại}, bản gốc hiện là v{bản mới nhất})."

Để lấy nội dung mới:

1. Nhấn **Cập nhật theo bản gốc** (*Update from source*) trong thông báo.
2. Trong hộp **Cập nhật câu hỏi theo bản gốc?** (*Update this question from its source?*), nhấn **Cập nhật theo bản gốc** để xác nhận.

Nội dung câu hỏi được thay bằng nội dung mới nhất của câu gốc và **lưu ngay**. Điểm của câu trong bài giữ nguyên.

> [!WARNING]
> Các chỉnh sửa chưa lưu của riêng câu hỏi đó sẽ bị mất khi cập nhật theo bản gốc.

> [!NOTE]
> Chỉ cập nhật được khi bài kiểm tra chưa mở, vì bài kiểm tra không sửa được sau thời điểm bắt đầu. Nếu câu gốc đã bị xóa hoặc bạn không còn quyền xem bộ câu hỏi gốc, hệ thống báo lỗi.

## Cài đặt bài kiểm tra

| Mục | Mô tả |
| --- | --- |
| **Tiêu đề bài kiểm tra** (*Test title*) | Bắt buộc, tối đa 100 ký tự. |
| **Ngày bắt đầu & Ngày kết thúc** (*Start date & End date*) | Khoảng thời gian học sinh được vào làm bài. Thời điểm bắt đầu phải sau hiện tại, và khoảng cách giữa hai mốc phải ít nhất bằng **Giới hạn thời gian**. |
| **Số lần làm bài** (*Number of attempts*) | Số lượt tối đa mỗi học sinh được làm. Mặc định 2. |
| **Số lần xáo trộn** (*Shuffle*) | Số phiên bản đề có thứ tự câu hỏi khác nhau, từ 1 đến 10. Mỗi lượt làm nhận ngẫu nhiên một phiên bản. Mặc định 2. |
| **Giới hạn thời gian** (*Time limit*) | Thời gian cho một lượt làm, từ 1 đến 120 phút. Mặc định 60. |
| **Điểm đạt** (*Passing score*) | Tỷ lệ phần trăm trên tổng điểm để được tính là đạt. Mặc định 50%. |
| **Hiển thị đáp án đúng** (*Show correct answer*) | Cho học sinh xem đáp án đúng khi xem lại bài. Đáp án chỉ hiện khi học sinh đã dùng hết lượt làm hoặc bài đã kết thúc. |
| **Điểm cuối cùng (tuỳ chọn)** (*Final score (optional)*) | Cách lấy điểm khi có nhiều lượt: **Điểm cao nhất** (*Highest score*) hoặc **Lần làm bài cuối** (*Last attempt*). |
| **Phương pháp chấm điểm một phần** (*Partial grading method*) | Bật: cộng một phần điểm nếu câu trả lời đúng một phần. Tắt: câu chỉ được điểm khi đúng hoàn toàn. |
| **Xem lại bài làm** (*Review attempts*) | Cho học sinh xem lại bài làm của mình sau khi nộp. |

## Sửa hoặc xóa bài kiểm tra

- **Sửa** (*Edit*): nhấn biểu tượng bút chì. Chỉ sửa được khi bài còn ở trạng thái **Sắp diễn ra**. Bạn có thể đổi cài đặt và danh sách câu hỏi như khi tạo.
- **Xóa** (*Delete*): nhấn biểu tượng thùng rác rồi xác nhận **Đồng ý**.

> [!WARNING]
> Xóa bài kiểm tra sẽ xóa luôn mọi lượt làm bài của học sinh trong bài đó.

> [!TIP]
> Nếu rời trang khi chưa lưu, hệ thống hỏi **Rời đi thật sao?** (*Leave already?*) để bạn không mất phần đang soạn.

## Thư viện quiz của lớp

Tab **Thư viện quiz** liệt kê các bộ câu hỏi đã được thêm vào lớp, kèm số câu hỏi và người tạo. Mọi thành viên có thể nhấn **Xem** để mở bộ câu hỏi, rồi học hoặc luyện tập.

- Để thêm bộ câu hỏi vào lớp, mở trang chi tiết bộ câu hỏi do bạn sở hữu, nhấn **Thêm vào lớp** (*Add to class*) rồi chọn lớp. Bạn cần là chủ lớp hoặc giáo viên của lớp đó. Xem [Chia sẻ & quyền xem](/guide/question-sets/sharing).
- Chủ lớp và giáo viên có thể gỡ bộ câu hỏi khỏi lớp bằng biểu tượng thùng rác.

## Xem thêm

- [Thư mục](/guide/folders/folders)
- [Làm bài kiểm tra](/guide/classes/take-test)
- [Xem kết quả](/guide/classes/results)
- [Lịch kiểm tra](/guide/schedule/schedule)
`;export{n as default};

const n=`Lớp học là nơi giáo viên giao bài kiểm tra, chia sẻ bộ câu hỏi và theo dõi kết quả của học sinh. Trang này hướng dẫn bạn tạo lớp mới, tham gia lớp có sẵn và tìm lại lớp của mình.

## Mở danh sách lớp học

Nhấn **Lớp học** (*Class*) trên thanh điều hướng bên trái. Trang hiển thị tất cả lớp bạn đang tham gia, mỗi lớp gồm tên lớp, chủ đề và tên chủ lớp. Nhấn vào một lớp để mở tab **Bài kiểm tra** (*Exam*) của lớp đó.

## Tạo lớp học

1. Nhấn **Tạo lớp học** (*Create class*).
2. Nhập **Tên lớp** (*Class name*). Đây là trường bắt buộc, tối đa 100 ký tự.
3. Nhập **Chủ đề** (*Topic*) nếu muốn, ví dụ môn học hoặc mô tả ngắn (tối đa 100 ký tự).
4. Nhấn **Tạo** (*Create*).

Người tạo lớp trở thành **Chủ lớp** (*Owner*). Sau khi tạo, bạn có thể [mời thành viên](/guide/classes/members) và [giao bài kiểm tra](/guide/classes/assign-test).

### Đổi tên hoặc chủ đề lớp

Chỉ chủ lớp làm được thao tác này:

1. Mở lớp, nhấn vào tên lớp trên thanh đường dẫn (có biểu tượng bút chì).
2. Trong cửa sổ **Cập nhật thông tin lớp** (*Update class*), sửa tên hoặc chủ đề.
3. Nhấn **Cập nhật** (*Update*).

## Tham gia lớp học

Bạn cần nhận mã lớp hoặc liên kết mời từ chủ lớp hoặc giáo viên của lớp.

### Tham gia bằng mã lớp

1. Trên trang **Lớp học**, nhấn **Tham gia lớp học** (*Join class*).
2. Nhập **Mã lớp** (*Class code*).
3. Nhấn **Tham gia** (*Join*).

Khi thành công, thông báo **Tham gia lớp học thành công!** (*Joined class successfully!*) xuất hiện và lớp được thêm vào danh sách.

### Tham gia bằng liên kết mời hoặc mã QR

- **Liên kết mời**: mở liên kết bạn nhận được. Hệ thống tự thêm bạn vào lớp rồi đưa bạn về trang **Lớp học**. Nếu chưa đăng nhập, bạn sẽ được chuyển tới trang đăng nhập trước.
- **Mã QR**: mã QR trong cửa sổ mời chứa mã lớp. Quét mã để lấy mã lớp, sau đó nhập mã như hướng dẫn ở trên.

> [!NOTE]
> Mọi người tham gia bằng mã hoặc liên kết đều có vai trò **Học sinh** (*Student*). Chủ lớp có thể nâng vai trò sau. Xem [Thành viên & vai trò](/guide/classes/members).

> [!WARNING]
> Mã lớp có thời hạn. Mã hết hạn hoặc đã được đặt lại sẽ không dùng được nữa, hệ thống báo **Không tìm thấy mã lớp** (*Class code not found*). Nếu bạn đã ở trong lớp, hệ thống báo **Học sinh đã có trong lớp** (*Student already exists in class*).

## Lọc và tìm lớp

Ở đầu danh sách có hai công cụ:

| Công cụ | Cách dùng |
| --- | --- |
| Bộ lọc vai trò | Chọn **Tất cả** (*All*), **Là Chủ lớp** (*Owner*), **Là Giáo viên** (*Lecturer*) hoặc **Là Học sinh** (*Student*) để chỉ xem các lớp bạn giữ vai trò đó. |
| Ô tìm kiếm | Gõ một phần tên lớp vào ô **Tìm lớp học theo tên...** (*Search class by name...*). |

Danh sách được chia trang. Bạn có thể đổi số lớp mỗi trang (12, 24, 36, 48 hoặc 60) ở cuối danh sách.

## Xem thêm

- [Thành viên & vai trò](/guide/classes/members)
- [Giao bài kiểm tra](/guide/classes/assign-test)
- [Làm bài kiểm tra](/guide/classes/take-test)
`;export{n as default};

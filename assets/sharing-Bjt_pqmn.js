const n=`Bạn quyết định ai được xem và chỉnh sửa bộ câu hỏi của mình: công khai cho mọi người, chia sẻ riêng cho từng người qua email, đưa vào lớp học hoặc đưa vào thư mục. Chỉ chủ sở hữu bộ câu hỏi mới thay đổi được quyền hiển thị, chia sẻ qua email và thêm vào lớp.

## Quyền hiển thị

| Chế độ | Ai xem được |
| --- | --- |
| **Công khai** (*Public*) | Mọi người dùng. Bộ câu hỏi xuất hiện trong kết quả tìm kiếm. |
| **Riêng tư** (*Private*) | Chỉ bạn, những người được chia sẻ qua email, thành viên các lớp có bộ câu hỏi này và thành viên các thư mục chứa bộ câu hỏi này. |

Bộ câu hỏi mới luôn ở chế độ Riêng tư. Để đổi:

1. Mở trang chi tiết bộ câu hỏi, bấm **Chia sẻ** (*Share quiz*).
2. Ở ô **Quyền hiển thị** (*Visibility*), chọn **Công khai** hoặc **Riêng tư**. Thay đổi được lưu ngay.

> [!WARNING]
> Khi chuyển từ Công khai sang Riêng tư, bộ câu hỏi bị gỡ khỏi các lớp mà bạn không phải chủ lớp hoặc giáo viên.

## Sao chép liên kết

Khi bộ câu hỏi ở chế độ Công khai, hộp thoại **Chia sẻ** hiển thị mã QR và liên kết. Bấm **Sao chép liên kết** (*Copy link*) để sao chép. Người nhận cần đăng nhập để mở liên kết.

## Chia sẻ qua email

1. Trong hộp thoại **Chia sẻ**, tìm mục **Chia sẻ qua email** (*Share with email*).
2. Nhập **đầy đủ** địa chỉ email của người cần chia sẻ. Người đó phải có tài khoản AIQuizzizz.
3. Chọn người dùng trong kết quả tìm kiếm. Người này được thêm vào danh sách **Người có quyền truy cập** (*People with access*) với quyền **Xem** (*Can view*).
4. Để đổi quyền, chọn **Chỉnh sửa** (*Can edit*) hoặc **Xem** trong ô bên cạnh tên người đó.
5. Để thu hồi quyền, bấm biểu tượng thùng rác rồi chọn **Có** (*Yes*).

| Quyền | Được làm gì |
| --- | --- |
| **Chủ sở hữu** (*Owner*) | Xem, chỉnh sửa, xóa, chia sẻ. |
| **Chỉnh sửa** | Xem và chỉnh sửa nội dung bộ câu hỏi. |
| **Xem** | Chỉ xem, không chỉnh sửa được. |

Bộ câu hỏi được chia sẻ cho bạn nằm trong **Thư viện quiz** (*Quizzes*). Dùng bộ lọc **Được chia sẻ với tôi** (*Shared with me*) để xem riêng các bộ này.

## Thêm vào lớp học

1. Mở trang chi tiết bộ câu hỏi, bấm **Thêm vào lớp** (*Add to class*).
2. Hộp thoại liệt kê các lớp mà bạn là chủ lớp hoặc giáo viên.
3. Bấm **+** cạnh lớp để thêm. Lớp đã có bộ câu hỏi hiển thị dấu tích; bấm biểu tượng thùng rác để gỡ.

Thành viên của lớp xem được bộ câu hỏi kể cả khi nó ở chế độ Riêng tư.

> [!NOTE]
> Bạn chỉ thêm được vào lớp bộ câu hỏi do bạn tạo hoặc bộ câu hỏi công khai.

## Thêm vào thư mục

Chủ sở hữu và người được chia sẻ quyền **Chỉnh sửa** thấy nút **Thêm vào thư mục** (*Add to folder*) trên trang chi tiết bộ câu hỏi.

1. Mở trang chi tiết bộ câu hỏi, bấm **Thêm vào thư mục**.
2. Trong hộp **Chọn thư mục** (*Choose folder*), bấm vào thư mục cần thêm. Dùng ô lọc và ô tìm kiếm để tìm nhanh.
3. Hộp **Thêm bộ câu hỏi vào thư mục?** (*Add question set to folder?*) hiện ra. Bấm **Đồng ý** (*Ok*) để xác nhận.

Khi thêm thành công, hệ thống báo **Đã thêm vào thư mục {tên thư mục}** (*Added to folder {folder name}*).

Để thêm được, bạn cần đủ hai điều kiện:

- Có quyền chỉnh sửa bộ câu hỏi (là chủ sở hữu hoặc có quyền **Chỉnh sửa**).
- Có quyền **Chủ sở hữu** (*Owner*) hoặc **Có thể chỉnh sửa** (*Editable*) trong thư mục.

Một bộ câu hỏi có thể nằm trong nhiều thư mục. Nếu bộ đã có trong thư mục, hệ thống báo lỗi và không thêm lần nữa.

### Thành viên thư mục được làm gì?

- Xem bộ câu hỏi, kể cả khi bộ ở chế độ Riêng tư.
- Dùng câu hỏi của bộ để soạn bài kiểm tra cho lớp, qua nút **Chọn từ thư mục** (*Choose from folder*). Xem [Giao bài kiểm tra](/guide/classes/assign-test).

> [!NOTE]
> Gỡ bộ câu hỏi khỏi thư mục không xóa bộ câu hỏi. Cách gỡ xem tại [Thư mục](/guide/folders/folders).

## Khi không có quyền truy cập

Nếu mở bộ câu hỏi mà bạn không có quyền xem, trang **Từ chối truy cập!** (*Access Denied!*) xuất hiện. Hãy nhờ chủ sở hữu chia sẻ cho bạn.

## Xem thêm

- [Tìm bộ câu hỏi công khai](/guide/question-sets/search)
- [Thành viên & vai trò](/guide/classes/members)
- [Tạo / tham gia lớp](/guide/classes/create-join)
- [Thư mục](/guide/folders/folders)
`;export{n as default};

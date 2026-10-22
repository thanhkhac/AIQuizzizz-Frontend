Để dùng AIQuizzizz, bạn cần một tài khoản đã xác minh email. Trang này hướng dẫn đăng ký, xác minh email bằng mã OTP và đăng nhập, kèm cách xử lý các lỗi thường gặp.

## Đăng ký tài khoản

1. Ở trang đăng nhập, chọn liên kết **Đăng ký** (*Sign Up*) cạnh dòng **Chưa có tài khoản?** (*Don't have an account?*).
2. Nhập **Email**, **Mật khẩu** (*Password*) và **Xác nhận mật khẩu** (*Confirm password*).
3. Bấm nút **Đăng ký**.
4. Hệ thống gửi mã OTP đến email của bạn và chuyển sang trang xác minh email.

Quy tắc mật khẩu:

- Tối thiểu 8 ký tự.
- Có ít nhất 1 chữ cái và 1 chữ số.
- **Xác nhận mật khẩu** phải trùng với **Mật khẩu**.

## Xác minh email

1. Mở hộp thư, tìm email "Xác thực email" từ AIQuizzizz và lấy mã gồm 6 chữ số.
2. Ở trang xác minh, kiểm tra ô **Email**, rồi nhập mã vào ô **Mã OTP** (*OTP*).
3. Bấm **Xác minh** (*Verify*). Khi thành công, bạn được chuyển đến trang đăng nhập.

Nếu không nhận được mã, chọn **Gửi lại** (*Re-send*) cạnh dòng **Bạn không nhận được email?** (*Didn't receive any email?*), nhập email rồi bấm **Gửi** (*Send*).

> [!NOTE]
> Mã OTP có hiệu lực 10 phút. Nếu nhập sai mã 5 lần, bạn phải chờ 10 phút để thử lại. Nếu yêu cầu gửi mã 5 lần liên tiếp, bạn cũng phải chờ 10 phút trước khi yêu cầu tiếp.

## Đăng nhập

1. Mở trang đăng nhập, nhập **Email** và **Mật khẩu**.
2. Bấm **Đăng nhập** (*Sign In*).
3. Bạn được đưa về trang **Bảng điều khiển** (*Dashboards*), hoặc về trang bạn định mở trước khi đăng nhập.

## Lỗi khi đăng nhập

| Thông báo | Nguyên nhân và cách xử lý |
| --- | --- |
| **Thông tin đăng nhập không hợp lệ** (*Invalid credentials*) | Email chưa đăng ký hoặc sai mật khẩu. Kiểm tra lại, hoặc dùng [Quên mật khẩu](/guide/getting-started/forgot-password). |
| **Email chưa được xác minh** (*Email is not verified*) | Tài khoản chưa hoàn tất xác minh email. Mở trang xác minh email (đường dẫn `/verify-email`), chọn **Gửi lại** để nhận mã mới rồi xác minh như hướng dẫn ở trên. |
| **Tài khoản bị khóa đăng nhập** (*Account is locked out*) | Bạn nhập sai mật khẩu 5 lần. Chờ 60 phút rồi thử lại. |
| **Tài khoản bị cấm** (*Account is banned*) | Tài khoản đã bị khóa. Xem mục bên dưới. |

## Tài khoản bị khóa

Nếu tài khoản bị khóa, trang đăng nhập hiển thị khung đỏ **Tài khoản bị cấm** kèm **Lý do** (*Reason*):

- Lý do do quản trị viên nhập, hoặc "Không có lý do cụ thể." nếu không có.
- Lý do khóa tự động khi tài khoản có nhiều vi phạm tiêu chuẩn cộng đồng (ảnh khỏa thân/bạo lực) trong một khoảng thời gian.

Nếu tài khoản bị khóa khi bạn đang dùng ứng dụng, hệ thống tự đăng xuất và đưa bạn về trang đăng nhập kèm lý do.

> [!WARNING]
> Nếu bạn cho rằng việc khóa là nhầm lẫn, hãy liên hệ quản trị viên. Xem thêm [Kiểm duyệt & vi phạm](/guide/policy/moderation).

## Xem thêm

- [Quên mật khẩu](/guide/getting-started/forgot-password)
- [Giao diện chính](/guide/getting-started/navigation)
- [Tài khoản](/guide/settings/account)

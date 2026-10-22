const n=`Bạn có thể đính kèm một ảnh hoặc một video vào câu hỏi để minh họa nội dung. Tính năng này phụ thuộc vào gói đăng ký của bạn và ảnh tải lên được kiểm duyệt tự động.

## Điều kiện sử dụng

- Mỗi câu hỏi chỉ có **một ảnh hoặc một video**.
- Có ở các loại Trắc nghiệm, Ghép đôi, Sắp xếp, Tự luận ngắn. Thẻ ghi nhớ ngôn ngữ không hỗ trợ.
- Gói đăng ký quyết định bạn được tải ảnh, video, cả hai hay không được tải. Nếu gói không cho phép, phần **Ảnh / video** (*Image / video*) hiển thị thông báo khóa và đề nghị nâng cấp gói. Xem [Gói đăng ký](/guide/settings/subscription).

## Giới hạn tệp

| Tiêu chí | Ảnh | Video |
| --- | --- | --- |
| Định dạng | JPG, PNG, WEBP, GIF, BMP, HEIC/HEIF, TIFF | MP4, MOV, WEBM, MKV, AVI, MPEG, 3GP |
| Dung lượng mặc định | Tối đa 15 MB | Tối đa 200 MB |
| Thời lượng mặc định | Không áp dụng | Tối đa 600 giây |

Giới hạn đang áp dụng luôn hiển thị ngay dưới nút tải lên, ví dụ "Ảnh: tối đa 15 MB".

## Tải ảnh hoặc video lên

1. Trong câu hỏi, tìm phần **Ảnh / video**.
2. Bấm **Tải ảnh lên** (*Upload image*) hoặc **Tải video lên** (*Upload video*), rồi chọn tệp. Bạn cũng có thể kéo thả tệp vào khung này.
3. Chờ thanh tiến trình **Đang tải lên...** (*Uploading...*) chạy hết.
4. Hệ thống chuyển sang **Đang xử lý...** (*Processing...*). Với video, bước này có thể mất vài phút; trong lúc đó bạn vẫn có thể sửa các câu hỏi khác.
5. Khi xong, thông báo **Tải media lên thành công** (*Media uploaded successfully*) xuất hiện và bản xem trước hiện trong câu hỏi.

> [!WARNING]
> Bạn chỉ lưu được bộ câu hỏi khi mọi tệp đã tải xong. Nếu bấm lưu quá sớm, hệ thống báo **Vui lòng đợi tải media lên hoàn tất.**

## Thay thế hoặc xóa

- **Thay thế** (*Replace*): chọn tệp khác để thay cho tệp hiện tại.
- **Xoá** (*Remove*): gỡ tệp khỏi câu hỏi sau khi bạn xác nhận.

Thay đổi chỉ có hiệu lực sau khi bạn lưu bộ câu hỏi.

## Khi không xem được ảnh/video

Liên kết xem ảnh/video có thời hạn. Nếu thấy thông báo **Không tải được media (liên kết có thể đã hết hạn).**, bấm **Tải lại** (*Reload*) hoặc tải lại trang. Trong trang soạn thảo, tệp vẫn được đính kèm với câu hỏi, chỉ liên kết xem trước đã hết hạn.

## Kiểm duyệt nội dung

Ảnh được kiểm duyệt tự động sau khi tải lên. Video không qua bước kiểm duyệt tự động này.

Nếu ảnh bị xác định là vi phạm tiêu chuẩn cộng đồng (khỏa thân hoặc bạo lực):

- Ảnh bị gỡ và mọi câu hỏi dùng ảnh đó bị xóa, kể cả bản sao trong bài kiểm tra.
- Tài khoản của bạn bị ghi nhận một vi phạm và bạn nhận email cảnh báo.
- Khi số vi phạm còn hiệu lực đạt ngưỡng, tài khoản bị khóa tự động.

> [!WARNING]
> Chỉ tải lên ảnh bạn có quyền sử dụng và phù hợp với môi trường học tập. Xem chi tiết tại [Kiểm duyệt & vi phạm](/guide/policy/moderation).

## Xem thêm

- [Tạo bộ câu hỏi](/guide/question-sets/create)
- [Gói đăng ký](/guide/settings/subscription)
- [Kiểm duyệt & vi phạm](/guide/policy/moderation)
`;export{n as default};

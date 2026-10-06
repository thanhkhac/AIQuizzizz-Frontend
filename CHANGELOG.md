# Changelog

Mọi thay đổi đáng chú ý của dự án được ghi lại trong file này.

Định dạng dựa trên [Keep a Changelog](https://keepachangelog.com/vi/1.1.0/).

## [Unreleased] - 2026-10-02

### Fixed — QA vòng 2 (đợt sửa lỗi giao diện admin / xác thực)
- **D1**: `formatBanReason` (`LoginErrorService.ts`) — lý do rỗng (và chuỗi mặc định tiếng Việt cũ) hiển thị `auth.banned.no_reason`; mã `AUTO_BAN_STRIKES:n:d` được dịch vi/en; lý do tự do giữ nguyên. Dùng ở `login.vue` (cả luồng ban từ lời gọi API khác qua `Api.ts`).
- **D2**: `system_setting.vue` bỏ `:min`/`:precision` của `a-input-number` (nguyên nhân gây tự làm tròn/kẹp về 1) — giá trị 0, -5, 1.5 báo lỗi inline và chặn Lưu.
- **D3**: `subscription.vue` — thẻ đầu trang hiển thị gói hiện tại (tên, thời hạn, ngày hết hạn; gói miễn phí ngầm định khi chưa mua); thẻ gói hiển thị thời hạn cả khi giá = 0. Thêm test `PlanDurationService.spec.ts` (số ít "1 year" / số nhiều).
- **D4**: `manage_acc.vue` dùng `a-input` gắn thẳng `pageParams.keyword` nên `?keyword=` khôi phục hiển thị trong ô tìm kiếm.
- **N1**: `theme-overrides.css` — `a-switch`: ON = màu chủ đạo (`--c-primary`, viền `--c-primary-text`, núm `--c-on-primary`), OFF = xám trung tính (`--c-switch-off`), focus ring rõ, cả 2 theme.
- **N3**: `manage_subscription.vue` — thẻ gói dùng grid + giá/thời hạn xuống dòng (không còn cắt "/ 90 months"); biểu đồ chừa hàng riêng cho select năm trên màn hình hẹp (`spacingTop`), thẻ thống kê/biểu đồ wrap.
- **N4**: `subscription.vue` (user) thẻ gói dạng grid 1 cột trên điện thoại, nút xuống dòng; modal sửa/tạo gói rộng 94% trên điện thoại, các ô xếp dọc, ô tên dùng `--c-surface-raised`/`--c-text` để đủ tương phản.
- **N5**: ô tìm kiếm trang tài khoản admin (placeholder cắt bằng ellipsis, bộ lọc wrap trên điện thoại).
- **N6**: sidebar admin/user sticky đúng (`body{overflow-x:clip}` thay cho `hidden` — `hidden` biến `<body>` thành scroll container làm hỏng `position: sticky`); nhãn dài xuống dòng trong "pill".
- **N7**: icon Mail/Lock ở form auth có kích thước (svg bị `max-width:100%` co về 0) và màu ở cả 2 theme.
- **N8**: đăng nhập kiểm tra email hợp lệ + bắt buộc nhập (mật khẩu chỉ cần không rỗng, không chặn mật khẩu cũ).
- **N9**: form gói: giá là số nguyên ≥ 0, thời hạn là số nguyên ≥ 1, báo lỗi inline (bỏ `:min` tự kẹp).
- **N10**: toast xác minh email dùng i18n ("Đã xác minh email…"); "FullName" -> "Full name"; "Subscriptions Name" -> "Plan name"; `/verify-email` không có email hiển thị câu trung tính; tiêu đề cột bảng tài khoản, tên tháng + tiêu đề trục biểu đồ, tiêu đề bảng giao dịch + nhãn trạng thái được dịch; biểu đồ tắt `credits` Highcharts; đổi mật khẩu trùng mật khẩu cũ bị từ chối (frontend + mã lỗi `ACCOUNT_NEW_PASSWORD_SAME_AS_CURRENT`); người đã đăng nhập vào `/register` được chuyển về trang chính.


### Thêm mới

- **Ảnh/video cho từng câu hỏi** (mỗi câu hỏi tối đa 1 ảnh HOẶC 1 video):
    - `src/shared/components/Media/QuestionMediaPicker.vue`: chọn/tải lên media ngay dưới ô nội dung câu hỏi
      trong cả 4 editor (`MultipleChoice`, `Matching`, `Ordering`, `ShortText`). Nút tải ảnh/tải video hiển thị
      theo quyền của gói, hỗ trợ kéo thả, kiểm tra loại file/dung lượng/thời lượng video ở client, thanh tiến
      trình upload (`onUploadProgress`) và trạng thái "đang xử lý" khi server transcode video, nút thay thế/xoá
      (xoá = `mediaId: null`). Nếu gói không cho phép upload thì hiển thị thông báo thay vì nút.
    - Trạng thái upload lưu theo từng object câu hỏi nên không bị mất khi editor bị unmount (danh sách ảo hoá
      `DynamicScroller`, đổi loại câu hỏi); không cho lưu khi còn file đang upload/xử lý.
    - `src/shared/components/Media/QuestionMediaView.vue`: hiển thị media cạnh nội dung câu hỏi. Ảnh dùng
      `<img loading="lazy" decoding="async">` (giới hạn chiều cao, click để phóng to); video dùng
      `<video controls preload="none" playsinline>` + poster (trình duyệt không tải gì cho tới khi bấm play,
      sau đó chỉ tải theo HTTP Range; không fetch video bằng JS/blob).
    - Hiển thị media ở: chi tiết bộ câu hỏi, chi tiết đề mẫu, trang học (câu hiện tại + danh sách kết quả),
      luyện thi (practice test), làm bài kiểm tra, xem lại bài làm, modal chọn câu hỏi từ đề mẫu.
    - `src/api/ApiMedia.ts` (`GET Media/Permissions`, `POST Media/Upload` multipart, timeout 15 phút cho
      video), `src/stores/MediaStore.ts` (cache quyền upload 5 phút, xoá khi đăng xuất),
      `src/services/QuestionMediaService.ts` (danh sách MIME hỗ trợ, nhận diện theo đuôi file khi trình duyệt
      không trả MIME, helper gộp media mới/bỏ `media` khỏi payload), model `src/models/response/media/questionMedia.ts`.
    - Model câu hỏi: `RequestQuestion` thêm `mediaId`/`media`, `ResponseQuestion` thêm `media`;
      `TransferQuestionData.transformResponseToRequest` mang theo `mediaId`/`media` (sửa, import từ đề mẫu, copy).
    - Các trang tạo/sửa bộ câu hỏi, đề mẫu, bài kiểm tra: `createQuestionTemplate()` có `mediaId: null`,
      payload gửi `mediaId` và bỏ object `media` (chỉ dùng để preview).
- **Xử lý presigned URL ngắn hạn** (ảnh ~15 phút, video ~2 giờ): không cache/lưu URL; khi ảnh/video/poster lỗi
  (thường do hết hạn) hiển thị fallback kèm nút "Tải lại" — nút này gọi lại API của chính trang và chỉ cập nhật
  `media` của câu hỏi (không reset tiến trình học/câu trả lời). Ở trang làm bài kiểm tra chỉ cho tải lại khi
  lượt làm bài còn thời gian (tránh tạo lượt làm bài mới); trong editor chỉ báo liên kết xem trước đã hết hạn
  (media vẫn được gắn với câu hỏi).
- **Admin – quản lý gói**: thêm cờ `canUploadImage`, `canUploadVideo` (form tạo/sửa, reset form, đổ dữ liệu khi
  sửa, bật/tắt kích hoạt gói, danh sách tính năng của gói, model request/response).
- **Lý do khoá tài khoản khi đăng nhập**: khi backend trả `errors.ACCOUNT_BANNED = [lý do]`, trang đăng nhập hiển
  thị `a-alert` với tiêu đề "Tài khoản bị cấm" và lý do; đăng nhập Google bị cấm sẽ chuyển về trang đăng nhập
  và hiển thị cùng thông báo (`src/services/LoginErrorService.ts`).
- i18n (en + vn): mã lỗi `PLAN_NOT_ALLOW_UPLOAD_IMAGE`, `PLAN_NOT_ALLOW_UPLOAD_VIDEO`, `MEDIA_INVALID_FILE`,
  `MEDIA_UNSUPPORTED_TYPE`, `MEDIA_FILE_TOO_LARGE`, `MEDIA_VIDEO_TOO_LONG`, `MEDIA_PROCESS_FAILED`,
  `MEDIA_NOT_FOUND`, `MEDIA_VIOLATED`; nhóm `question_media.*` (nút tải ảnh/video, đang tải, đang xử lý, xoá,
  gói không cho phép, media hết hạn/tải lại...); `auth.banned.*`; tính năng gói `canUploadImage`/`canUploadVideo`.
- Unit test `src/services/__tests__/QuestionMediaService.spec.ts`.

### Thay đổi

- **Xác thực bằng access token lưu ở localStorage + header `Authorization: Bearer`** thay cho cookie HttpOnly
  (`withCredentials`): lưu access/refresh token sau khi đăng nhập/đăng nhập Google/renew token, gửi kèm cặp token
  khi renew, xoá token khi đăng xuất (`Api.ts`, `ApiAuthentication.ts`, `LocalStorageService.ts`).
- **API base URL** lấy từ `VITE_API_BASE_URL`, mặc định đường dẫn tương đối `/api` (bỏ URL hard-code).
- Đăng xuất khi renew token thất bại (refresh token hết hạn/không hợp lệ).
- Lỗi của request đăng nhập/đăng nhập Google do trang tự hiển thị (không còn notification chung trùng lặp).
- **Theme sáng/tối: sửa toàn bộ chữ/icon khó đọc** (kiểm bằng `tools/theme-audit`, WCAG AA: 4.5:1 cho chữ, 3:1 cho chữ lớn/icon;
  trước khi sửa 192-244 chữ + 26-68 icon vi phạm mỗi theme/viewport, sau khi sửa 0 ở cả 2 theme, cả 6 màu nhấn, kể cả modal/dropdown/popconfirm/message):
    - Bộ biến ngữ nghĩa mới trong `src/assets/base.css` (đủ cho cả 2 theme và 6 màu nhấn): `--c-page`, `--c-surface`, `--c-surface-raised`,
      `--c-border`, `--c-border-strong`, `--c-text`, `--c-text-muted`, `--c-placeholder`, `--c-disabled-text`, `--c-primary`, `--c-primary-hover`,
      `--c-on-primary` (chữ trên nền màu nhấn: trắng cho tím, đen cho xanh dương/xanh lá/đỏ/hổ phách/hồng), `--c-primary-text` (màu nhấn dùng làm chữ:
      sáng hơn ở dark, đậm hơn ở light), `--c-success(-text)`, `--c-danger(-text)`, `--c-warning(-text)`, `--c-solid-danger`, `--c-on-status`,
      `--c-focus-ring`, `--brand-gradient-text`. `--text-color-contrast` giờ trỏ tới `--c-on-primary`; `--text-color-grey` trỏ tới `--c-text-muted`;
      light theme chỉnh lại `--correct/incorrect/skipped-answer-color` và `--category-*-color`.
    - File mới `src/assets/theme-overrides.css` (nạp sau bootstrap trong `main.ts`): nền/chữ `html`/`body` (trước đây trang đăng nhập ở dark bị nền trắng
      do bootstrap ghi đè), input/textarea/password của Ant Design (cả trong `Modal.confirm`), placeholder, select, button (default/ghost/primary/disabled),
      tabs, table (header, sorter), pagination, tag (chữ đen trên tag xanh lá/xanh dương/vàng), popover/popconfirm/tooltip/dropdown, modal/drawer/confirm
      (icon cảnh báo), message/notification/alert, result/empty/spin/progress/steps/rate, collapse/tree/radio/checkbox/upload, date/time picker + calendar,
      code block, TipTap, bootstrap-vue (modal, dropdown, form), Highcharts credits, scrollbar, selection, focus ring.
    - Sửa chỗ hard-code: `color: var(--main-color)` -> `var(--c-primary-text)` (≈50 chỗ), nút trên gradient dùng `#fff`, hover nút Sign In ở header, banner/feature
      icon trang chủ, đường kẻ "OR" ở login/register, addon input ở verify-email, avatar ở ShareModal, nút "Generate with AI", icon ghép cặp, nút cờ, trạng thái
      thanh toán (`status-paid/topup`), logo/tiêu đề gradient (`--brand-gradient-text`), chữ đỏ trong confirm xoá lớp.
- **Responsive 320 - 1920px**:
    - `index.html`: viewport đổi từ `width=1920` sang `width=device-width, initial-scale=1` (trước đây điện thoại hiển thị như desktop thu nhỏ).
    - Sidebar: < 992px là drawer off-canvas (nút hamburger trong `Header.vue`, backdrop, tự đóng khi chuyển trang/chạm nền/Esc; `inert` khi đóng);
      992-1199px tự thu gọn thành mini sidebar; ≥ 1200px giữ nguyên. Trạng thái dùng chung ở `src/shared/composables/useSidebar.ts`;
      `UserSidebar.vue`, `AdminSidebar.vue`, `_userLayout.vue`, `_adminLayout.vue` cập nhật.
    - File mới `src/assets/responsive.css` (breakpoint 1200/992/768/576/360): top bar/tiêu đề trang xuống dòng, bộ lọc & ô tìm kiếm full-width, lưới card 2 -> 1 cột,
      bảng Ant cuộn ngang trong card, modal/drawer/dropdown vừa màn hình, form 2 cột xếp chồng, toolbar TipTap xuống dòng, editor câu hỏi xếp chồng,
      danh sách câu hỏi của trang làm bài/luyện thi thành thanh cuộn ngang dính trên cùng, ghép cặp xếp chồng, lịch xếp chồng, trang chủ/404/not-allowed không tràn ngang,
      ô nhập 16px (không bị zoom trên iOS), vùng chạm ≥ 40px, chữ ≥ 14px.
    - Email dài trong chân sidebar được cắt bằng dấu "…".
- Biểu đồ admin (`RevenueLineChart`, `ClassLineChart`): tiêu đề tự xuống dòng thay vì đè lên select năm ở màn hình hẹp.
- **Công cụ kiểm tra**: `tools/theme-audit/audit.mjs` (Playwright: contrast, tràn ngang, bị cắt, tap target; mở cả modal/dropdown) + `docs/THEME-AND-RESPONSIVE.md`
  (bảng biến, breakpoint, cách chạy).

### Sửa lỗi

- **QA vòng cuối**: trang sửa bài kiểm tra chọn template từ folder ra danh sách rỗng (thiếu `await nextTick()` như trang tạo); tiêu đề xác nhận sửa test template ghi "Tạo mới"; luyện thi với bộ câu hỏi đã xoá không chuyển 404; form gói báo hai lỗi mâu thuẫn cho số lẻ; trang Subscription hiển thị người chưa mua gói là đang dùng gói miễn phí (nay hiển thị "Chưa có gói"); modal Import/AI ở 768px vẫn hai cột bị tràn (nay xếp dọc dưới 992px).

- **Nút "Rời lớp" gọi nhầm API xoá lớp** (`views/user/class/student.vue`): học viên/giảng viên bấm rời lớp thì gọi `DELETE Class/{id}`. Đã đổi sang `POST Class/{id}/MoveOut` (thêm `ApiClass.MoveOut`); nút xoá lớp của chủ lớp vẫn gọi xoá.

- **Trang chủ `/` và `/404` hiển thị trắng**: route khai báo `component: import(...)` (trả về Promise) thay vì `component: () => import(...)`; Vue Router không render được. Đã sửa trong `src/router/router-index.ts`.

- `Api.ts`: so sánh URL đăng nhập sai (`"/Authentication/Login"` trong khi request là `"Authentication/Login"`)
  — nay chuẩn hoá URL (bỏ origin, prefix `/api`, dấu `/`, query, không phân biệt hoa thường) và áp dụng cho cả
  `Authentication/GoogleLogin`; `Object.keys(error.response.data?.errors)` bị lỗi khi response không có `errors`
  (dùng `?? {}`); notification lỗi không có mã hiển thị thông báo mặc định thay vì `ERROR_CODE.undefined`
  (413 → "File quá lớn").
- Trang đăng nhập Google: bắt lỗi khi đăng nhập thất bại (trước đây kẹt ở màn hình loading), thông báo thất bại
  dùng `message.error` thay vì `message.success`.
- `review.vue`: sửa cú pháp template và việc `.sort()` làm thay đổi dữ liệu gốc khi render câu Ordering
  (helper `sortByCorrectOrder` trả về bản sao); câu ShortText luôn hiển thị "No answer" do kiểm tra sai trường
  (`questionDataDto` → `userAnswerDataDto`).
- Lỗi type-check khiến `npm run build` thất bại: `AdminSidebar.vue` chuyển sang `<script setup lang="ts">`
  (sửa import store), bỏ biến `apiData: ApiYearData[]` không dùng ở `manage_subscription.vue`, sửa formatter
  của Highcharts trong `SubscriberPieChart.vue` (`this.point.name` → `this.name`), kiểu của `sortByCorrectOrder`
  trong `review.vue`.

- **Cài đặt > Bảo mật** (`security.vue`): `onOk` không có try/catch nên modal xác nhận kẹt và báo unhandled rejection khi sai mật khẩu hiện tại; nay bắt lỗi (notification dịch từ `ERROR_CODE.ACCOUNT_WRONG_PASSWORD` do interceptor hiển thị) và đóng modal; thất bại dùng `message.error`.
- **User bị khoá khi đang đăng nhập**: `Api.ts` nhận `ACCOUNT_BANNED` từ API không phải login, xoá token/user, lưu lý do và chuyển về `/login` (trang login hiển thị lý do); không gọi API LogOut để tránh lặp 401.
- **System Settings** (`system_setting.vue`): rule số nguyên (input/output cost, max token >= 1, phí cố định >= 0, có trần), `a-input-number` có `min`/`precision=0`; "-5" không lưu được; lỗi validate không còn gây TypeError và toast "fail"; Moderator chỉ xem (nút lưu bị khoá). Thông báo đã i18n.
- **Router guard**: `next({ name: "/" })` trỏ route không tồn tại nên user đã đăng nhập vào `/login` vẫn ở lại; nay về `User_Dashboard` (admin/moderator về `/admin`). Mọi route `/admin/*` (cả `Admin_System_Settings`) kiểm tra vai trò ngay trong guard, user thường chuyển `/404` mà không gọi API; mỗi lần điều hướng chỉ gọi `next()` một lần.
- **Form admin** (`manage_subscription.vue`, `system_setting.vue`): `catch` đọc `error.response.data` khi lỗi đến từ `validate()` → dùng optional chaining và chỉ báo thất bại khi có response lỗi từ API.
- **Cài đặt > Gói đăng ký** (`subscription.vue`): trang chưa hề tải gói hiện tại; nay gọi `GET Plan/CurrentPlan` (danh sách, lấy gói còn hạn mới nhất; chưa mua thì coi gói giá 0 là gói hiện tại), nút gói hiện tại hiển thị "Current plan" và disabled, sau khi mua tải lại. Thêm tính năng Copy/import, Upload ảnh, Upload video; thời hạn hỗ trợ Day/Month/Year và số ít/số nhiều ("1 year", "10 years", "90 months") qua `PlanDurationService`; bỏ GUID gói phổ biến cứng (gói trả phí giá cao nhất khi có từ 2 gói trả phí); bắt lỗi khi mua; sửa chữ "Are your sure" và đưa text xác nhận sang i18n; icon ✗ dùng màu `--incorrect-answer-color`.
- `profile.vue`: key sai `message.update_success` → `message.updated_successfully`; rule họ tên `required: "true"` (chuỗi) và `length` không hợp lệ → `required: true, whitespace: true, max: 250`, truyền `name="fullName"` cho `Input` để lỗi hiện inline và không gọi API khi để trống.
- **Trang đăng nhập**: dòng dưới nút Sign In dùng nhầm key "Already have an account?" → `signIn_signUp_ins` ("Don't have an account?"); placeholder email/mật khẩu và chữ "OR" chuyển sang i18n.
- **Tài khoản bị khoá không có lý do**: backend trả lý do rỗng, trang login hiển thị `auth.banned.no_reason` đã dịch; lý do auto-ban hiển thị nguyên văn.
- **Quy tắc mật khẩu**: thống nhất tối thiểu 8 ký tự, ít nhất 1 chữ cái và 1 chữ số (`src/constants/password.ts`) cho đăng ký, đặt lại và đổi mật khẩu; thông báo `auth.validation.password` khớp regex và backend.
- **Nạp tiền (billing)**: chỉ nhận số nguyên >= 5000 (trần 2.000.000.000), kiểm tra inline (rỗng, "abc", thập phân, quá nhỏ/lớn), chỉ mở modal QR khi tạo QR thành công; thống nhất thông báo tối thiểu; nhãn "AIQuizizz Points" qua i18n.
- **Admin > Gói đăng ký**: dropdown năm động (5 năm gần nhất gồm năm hiện tại); tiêu đề biểu đồ theo năm đang chọn (sửa `${currentYear}` in ra ref object); sửa chính tả "Total Subscripbers"/"Plan comparation"; nhãn "/ 90 Month" không xuống dòng và dùng số ít/số nhiều; biểu đồ tròn dùng dữ liệu thật (đã mua gói / người dùng miễn phí) thay vì nhãn "New 20% / Unsubscribers 80%" gây hiểu nhầm; đổi nhãn thẻ thống kê cho đúng dữ liệu (tổng người dùng, tổng doanh thu, người dùng đã mua gói); chỉ Administrator thấy nút tạo/sửa/xoá/bật tắt gói.
- **Admin > Tài khoản**: thêm toast thành công cho khoá/mở khoá/nâng/hạ quyền (i18n), bắt lỗi trong `onOk`; sửa `delete payload.isBanned` nhầm trong nhánh role.
- `AdminSidebar.vue`: chữ tiếng Anh cứng chuyển sang i18n, "Manager Account" → "Account management", "Manager Subscription" → "Subscription management" (cả title route và i18n).
- **Light mode**: heading "Manage" ở sidebar user/admin dùng `--text-color`/`--border-color-contrast`; biểu đồ admin (`RevenueLineChart`, `ClassLineChart`, `SubscriberPieChart`) đọc màu từ CSS variables (`chartTheme.ts`) và vẽ lại khi đổi theme; modal gửi lại email ở `/verify-email` theo theme; ô OTP không còn là password (`inputmode="numeric"`).
- **URL giữ trạng thái**: tab Cài đặt (`?tab=appearance`), trang/bộ lọc/từ khoá của Admin > Tài khoản (`?pageNumber=2&role=User...`), khôi phục khi reload; đổi bộ lọc quay về trang 1, tìm kiếm có debounce. `sessionStorage.setting_key` chỉ dùng một lần.
- **Quên mật khẩu**: sau khi gửi mã chuyển sang `/reset-password?email=...` để không phải nhập lại email.
- **`pageerror: Object`**: thêm `.catch(() => {})` cho `formRef.validate().then(...)` ở login, register, verify-email, forgot-password, reset-password.

- **Thứ tự đáp án/câu hỏi** (QA #1): editor, chi tiết, copy, review hiển thị theo đúng thứ tự tác giả; chỉ màn học/luyện tập/làm bài mới xáo trộn.
- **Luyện thi** (`test.vue`): số câu tối đa theo tổng số câu của các loại ĐANG CHỌN (dùng `count` từ `QuestionSet/{id}/Types`), không còn lỗi 500 khi vượt quá; guard `error.response.data?.errors`.
- **Api.ts**: lỗi 5xx/không có body `errors` chỉ hiện 1 toast chung (không còn "ERROR_CODE.undefined" + "Bad request"); mã lỗi chưa có bản dịch dùng thông báo chung; lỗi mạng giờ `reject` thay vì trả `undefined`.
- **`pageerror`/unhandled rejection**: `main.ts` bỏ qua rejection của axios (đã có toast) và lỗi validate form; `folder/detail.vue` thiếu `await validate()` nên vẫn gửi PATCH khi tên rỗng; `test_template/detail.vue` bắt lỗi khi thêm template vào folder.
- **`/user/test-template`** trống khi chưa có template (TypeError `chosenTemplate`): guard + empty state có nút "Create test template".
- **Learn**: comment không còn gửi trùng (reset ô nhập/reply sau khi gửi); sửa hướng dẫn Ordering/Matching bị đảo; badge thứ tự đúng hiển thị 1-based (so sánh nội bộ giữ 0-based).
- **`update.vue`**: kiểm tra quyền `QuestionSet/{id}/Permissions` trước khi hiển thị editor, viewer bị chuyển sang `/not-allowed`.
- **ShareModal**: Copy link dùng fallback `execCommand('copy')` khi `navigator.clipboard` không có (http), luôn có toast thành công/thất bại; thêm khoảng cách QR; nhãn quyền "Can edit"/"Can view".
- **Chi tiết bộ câu hỏi**: tìm kiếm không phân biệt hoa thường, bỏ thẻ HTML, có thông báo "không tìm thấy"; không gọi `GET QuestionSet//Rating` khi tải thất bại.
- **Import .xlsx**: không báo "uploaded successfully" trước khi server xác nhận, file lỗi bị loại khỏi danh sách.
- **Thư viện**: dùng `router.replace` (không tạo thêm history), chỉ ghi URL khi thay đổi, giữ `name`/`filterBy`/trang trên URL và khôi phục khi Back/Forward.
- **Folder/Template**: chặn tên rỗng/toàn khoảng trắng (không gọi POST/PATCH), sửa key `message.removed_successylly`, key `mesage.TEST_TEMPLATE_ALREADY_EXISTS_IN_FOLDER`, footer "templates", tiêu đề/placeholder modal chọn folder, tiêu đề "Mẫu đề thi" dùng i18n, `test_template/update.vue` prefill Description (bỏ placeholder dev).
- **Tìm kiếm công khai**: "Result(N)" dùng `totalCount` thay vì số phần tử của trang.
- **Editor**: modal lỗi nêu RÕ LÝ DO từng câu (`services/QuestionValidator.ts`, dùng cho question set/template/test), sắp xếp số đúng (không sort chuỗi), kiểm tra đáp án trắc nghiệm trùng nhau; hiển thị ô nhập điểm (0–999, 1 chữ số thập phân, mặc định 10) ở create/update.
- **Text**: "Share t his", "Explaination", "Press button to continues", "1 questions" (số ít/số nhiều), text upload của modal AI, trang `/not-allowed` tự chứa style (đọc được ở light mode) và dùng nội dung trung tính.
- **Light mode**: nút chính bị vô hiệu hoá dùng biến theme (đủ tương phản), icon kết quả tìm kiếm theo màu chủ đạo, sidebar highlight "Quizzes" ở các trang con của thư viện, thẻ câu hỏi trong `DynamicScroller` không còn bị cắt (bỏ `max-height`/`overflow` riêng).
- **Làm bài (`attempt.vue`)**: mọi lỗi khi tải bài (hết lượt, chưa tới giờ, không thuộc lớp...) → `router.replace` về danh sách bài kiểm tra của lớp (hoặc danh sách lớp) và dừng `onMounted` (hết trang trắng/TypeError); câu Ordering chưa chạm vào được ghi nhận theo thứ tự đang hiển thị khi mở câu (Matching không tự bịa đáp án).
- **Xem lại bài (`review.vue`)**: null-guard `matches`/`correctOrder`/`isAnswer`; khi backend ẩn đáp án thì hiển thị trung tính (không tô xanh/đỏ, ẩn cột "Options", không đánh số `#n` như đáp án, ẩn điểm từng câu), đáp án của học viên hiển thị phẳng.
- **Lịch (`schedule.vue`)**: gom/lọc theo ngày địa phương từ `timeStart` thật; cột phải không còn bị cắt ở mép màn hình.
- **ChooseQuestionModal**: "Check all" dùng `@change` (chọn được ngay lần click đầu, kể cả click vào label), nút Import bị khoá khi chọn 0 câu, xác nhận import dùng i18n.
- **Clipboard**: `src/services/ClipboardService.ts` (`copyToClipboard`: `navigator.clipboard` + fallback textarea ẩn/`execCommand`) dùng cho `ShareModal` và copy mã/link mời ở `student.vue`.
- **Phân quyền theo trang** (`services/ClassPermissionService.ts`, gọi `GET Class/{id}/Permissions` trong `onMounted`, không gọi ở router global): học viên mở `/user/class/:id/test/create`, `/user/test/:id/update`, `/user/class/:id/exam/:testId/result` → `/not-allowed`; hết lỗi `Missing required param "id"` ở modal cài đặt test.
- **Danh sách bài kiểm tra (`exam.vue`)**: số ít/số nhiều qua i18n ("1 hour", "1 question", "1 completion"), "Assigned just now"/phút/giờ/ngày tính từ `timeStart`, ẩn nút Attempt khi hết lượt (trừ khi đang làm dở); lớp đã xoá/không truy cập được → về danh sách lớp.
- **Tạo test**: xác nhận cuối dùng key riêng `assign_test.modal.valid.*`; `SettingTestModal` Cancel thật sự huỷ (lần mở đầu → về danh sách bài kiểm tra), Next validate (tiêu đề bắt buộc, ≤100 ký tự, form-item có `name`); import câu hỏi tự bỏ câu mặc định còn trống (`isQuestionBlank`).
- **Modal tạo/tham gia/sửa lớp**: reset form khi đóng/sau khi tạo thành công.
- **`quiz.vue`**: xoá bài khỏi lớp thất bại dùng `message.error`; **`student.vue`**: select hạn mã mời không còn refetch danh sách thành viên.
- **Lỗi truy cập lớp**: không còn gọi `GET /Class//Permissions` (dùng id từ route, dừng khi tải lớp lỗi); thêm ERROR_CODE en+vn còn thiếu: `NOT_HAVE_PERMISSION_TO_ADD_QUESTION_SET`, `OWNER_CAN_NOT_MOVE_OUT_CLASS`, `STUDENT_CAN_REVIEW_THIS_TEST`, `TEST_TEMPLATE_NOT_FOUND_IN_FOLDER`, `USER_NOTFOUND`.
- **Light mode**: tiêu đề các switch trong modal cài đặt test, badge "Total" ở tạo/sửa test, select lọc ở trang kết quả có placeholder, avatar bảng thành viên không còn đĩa đen.

### Sửa lỗi (QA vòng 2, đợt 2: editor / modal / điện thoại)

- **H1 – Câu hỏi bị chồng nhau trong editor** (tạo/sửa bộ câu hỏi, đề mẫu, bài kiểm tra): bỏ `DynamicScroller` (vue-virtual-scroller đặt vị trí theo `min-item-size` cố định nên khác chiều cao thật), thay bằng danh sách `v-for` thường `.question-list` (tối đa 100 câu). Dùng `v-memo="[item, index, item.type]"` để gõ phím không render lại cả 100 câu (gõ 29 ký tự với 100 câu: ~10,5 s → ~0,3 s trên dev server). Cuộn tới câu mới bằng `scrollIntoView`; bỏ hack `.scroller .question-container` trong `main.css`. `index` của thẻ lấy từ `v-for` (không còn `findIndex` O(n²)).
- **H2 – Modal Import / Generate with AI / Choose question ở ≤767px**: xếp dọc (upload trên, preview dưới), cuộn trong modal, preview `height:auto` + `max-height:60vh`, nút quay lại có cột cố định 56px (`responsive.css`).
- **M1 – Điện thoại**: câu Matching/Ordering trong modal chọn câu hỏi, detail bộ câu hỏi và trang xem lại bài làm (`review.vue`) xếp dọc, khung câu hỏi `min-width:0` + `overflow-wrap:anywhere`, nút mở rộng không bị tràn; bộ lọc/ô tìm kiếm của modal chọn câu hỏi xuống dòng.
- **M2 – Matching chưa thao tác bị tính chưa trả lời** (`attempt.vue`): khi mở câu Matching chưa có đáp án thì ghi nhận luôn cặp đang hiển thị (giống Ordering) nên Lưu/Nộp gửi đi.
- **M4 – "questions" không có số**: `dashboards.list_items.quiz.questions` = `"{n} question | {n} questions"` (vn: `"{n} câu hỏi"`); các nơi gọi dùng `$t(key, count)` nên đã hiện số.
- **M5 – Id bộ câu hỏi đã xoá/sai**: `learn.vue` và `update.vue` bắt lỗi tải → `/404` (QUESTION_SET_NOT_FOUND) hoặc về thư viện, không còn "Completed 0 of 0 | NaN %" / editor rỗng; `learn.vue` không còn crash khi `error.response` undefined.
- **S1/S2 – `v-model:value` không cập nhật `Input.vue`/`TextArea.vue`**: hai component hỗ trợ cả `v-model` và `v-model:value` (computed bọc `modelValue` + `value`), nên ô comment ở trang học được xoá sau khi Send; modal tạo/tham gia lớp trống ở lần mở sau.
- **S3 – "Check all" ở `ChooseQuestionModal`**: `checkAll` chỉ true khi có ≥1 câu và chọn hết (rỗng → false); reset khi lọc; lần bấm đầu chọn hết. Tương tự `ImportQSModal`/`GenerateQSModal`. Thứ tự Ordering hiển thị `#1` thay vì `#0`.
- **L1** Rời lớp (`class/student.vue`): tiêu đề/nội dung/nút riêng ("Leave this class?", "You will lose access…", "Leave") thay vì cảnh báo xoá lớp.
- **L2** Giờ bài kiểm tra `HH:mm` (bỏ `A`; cả `exam-result.vue` và `review.vue`); điểm làm tròn 2 chữ số (`formatScore` trong `QuestionValidator.ts`: review, bảng kết quả, lịch sử lượt làm); lịch "1 test/2 tests" qua i18n + badge ô lịch không bị cắt ở ≤575px; tiêu đề phụ trang làm bài "4 questions"; sau khi nộp/hết giờ/nút quay lại về `/user/class/{id}/exam`; ẩn nút Attempt với Owner/Teacher.
- **L3** Typo: "all your quizzes", "Created by", "based on user input"; placeholder tìm kiếm trong chi tiết thư mục "Search by name..." (key riêng `folder_detail.search_placeholder`, không đổi trang lớp); `/user/test-template` có tiêu đề/phụ đề riêng ("Test templates").
- **L4** Điện thoại/tablet: nút "Create new test template" xuống dòng; placeholder ô nhập không lệch/cắt chân chữ; nút quay lại không đè tiêu đề ở 768; modal mời: xếp dọc, ô mã/link rộng đủ, chỉ vẽ QR khi đã có mã; ô date-range trong cài đặt test không bị cắt.
- **L5** Import vào editor bộ câu hỏi/đề mẫu (tạo + sửa) tự bỏ câu mặc định còn trống (`isQuestionBlank`, chỉ câu `new_*`), id câu import duy nhất (`new_<timestamp>_<i>`) tránh trùng; Generate AI: chỉ báo "uploaded successfully" sau khi server chấp nhận PDF (`GenerateFileStructure.loadStructure`), PDF lỗi (400) → bỏ file, không mở modal "File Structure".
- File chính: `main.css`, `responsive.css`, `Input.vue`, `TextArea.vue`, các `create.vue`/`update.vue` của question_sets/test_template/test, `ChooseQuestionModal.vue`, `ImportQSModal.vue`, `GenerateQSModal.vue`, `GenerateFileStructure.vue`, `attempt.vue`, `review.vue`, `exam.vue`, `exam-result.vue`, `student.vue`, `schedule.vue`, `learn.vue`, `en.json`, `vn.json`.

### Xoá

- Test scaffold cũ `src/shared/components/__tests__/HelloWorld.spec.ts` (component `HelloWorld.vue` không còn tồn tại).

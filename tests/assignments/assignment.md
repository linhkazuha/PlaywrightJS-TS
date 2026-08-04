# Bài tập Playwright — EventHub

**BASE_URL:** `https://eventhub.rahulshettyacademy.com`

---

## Bài tập 1: Luồng đặt vé đầy đủ kèm tạo sự kiện (Full Booking Flow with Event Creation)

**Bạn đang kiểm thử gì:** Tạo một sự kiện hoàn toàn mới từ trang quản trị (admin panel), sau đó hoàn tất việc đặt vé cho sự kiện đó, và cuối cùng xác nhận số ghế còn lại giảm đúng 1.

### Thiết lập (Setup)

- `BASE_URL = https://eventhub.rahulshettyacademy.com`
- Thông tin đăng nhập: *\<Tự tạo thông tin đăng nhập của bạn>*
- Viết một hàm hỗ trợ (helper function) `login(page)` có thể tái sử dụng — bạn sẽ gọi hàm này ở đầu mỗi test

### Các bước (Steps)

#### Bước 1 — Đăng nhập
- Điều hướng đến `/login`
- Điền vào ô email (xác định bằng placeholder `you@email.com`)
- Điền vào ô mật khẩu (xác định bằng label `Password`)
- Nhấp vào nút đăng nhập (xác định bằng id `#login-btn`)
- **Assert:** liên kết có text `Browse Events →` hiển thị (xác nhận đăng nhập thành công)

#### Bước 2 — Tạo một sự kiện mới
- Điều hướng đến `/admin/events`
- Tạo một tiêu đề sự kiện duy nhất bằng `` `Test Event ${Date.now()}` `` — lưu giá trị này vào một biến, bạn sẽ cần dùng nó xuyên suốt bài test
- Điền vào ô Title (xác định bằng id `#event-title-input`)
- Điền vào ô textarea Description (xác định bằng `#admin-event-form textarea`)
- Điền vào ô City (xác định bằng label `City`)
- Điền vào ô Venue (xác định bằng label `Venue`)
- Điền vào ô Event Date & Time (xác định bằng label `Event Date & Time`) — sử dụng helper `futureDateValue()` của bạn
- Điền vào ô Price ($) (xác định bằng label `Price ($)`) — dùng bất kỳ số nào, ví dụ `100`
- Điền vào ô Total Seats (xác định bằng label `Total Seats`) — dùng `50`
- Nhấp vào nút submit (xác định bằng id `#add-event-btn`)
- **Assert:** thông báo toast `Event created!` hiển thị

#### Bước 3 — Tìm thẻ sự kiện và ghi lại số ghế
- Điều hướng đến `/events`
- Lấy tất cả các thẻ sự kiện (xác định bằng `data-testid="event-card"`)
- Assert thẻ đầu tiên hiển thị (xác nhận trang đã tải xong)
- Từ tất cả các thẻ, lọc ra thẻ có chứa văn bản tiêu đề sự kiện của bạn
- Assert thẻ được lọc ra hiển thị (timeout 5 giây)
- Đọc nội dung text số ghế từ thẻ đó (xác định phần tử chứa text `seat`, parse số nguyên từ inner text) — lưu giá trị này thành `seatsBeforeBooking`

#### Bước 4 — Bắt đầu đặt vé
- Trên thẻ sự kiện đã tìm được, nhấp vào nút **Book Now** (xác định bằng `data-testid="book-now-btn"` bên trong thẻ)

#### Bước 5 — Điền vào form đặt vé
- **Assert:** phần tử có id `#ticket-count` có text `1` (số lượng mặc định)
- Điền Full Name (xác định bằng label `Full Name`)
- Điền Email (xác định bằng id `#customer-email`)
- Điền Phone (xác định bằng placeholder `+91 98765 43210`)
- Nhấp vào nút confirm (xác định bằng CSS class `.confirm-booking-btn`)

#### Bước 6 — Xác nhận thông tin đặt vé thành công
- Xác định phần tử mã đặt vé (booking reference) (xác định bằng CSS class `.booking-ref`, lấy phần tử `.first()`)
- Assert phần tử này hiển thị
- Đọc inner text của nó, trim khoảng trắng — lưu thành `bookingRef`

#### Bước 7 — Xác nhận trong mục My Bookings
- Nhấp vào liên kết `View My Bookings`
- **Assert:** URL là `BASE_URL/bookings`
- Lấy tất cả các thẻ đặt vé (xác định bằng id `#booking-card`)
- Assert thẻ đặt vé đầu tiên hiển thị
- Lọc các thẻ đặt vé để tìm thẻ có chứa phần tử với class `.booking-ref` khớp với văn bản `bookingRef` của bạn
- Assert thẻ đã lọc được hiển thị
- Assert thẻ đã lọc được có chứa văn bản `eventTitle` của bạn

#### Bước 8 — Xác nhận số ghế đã giảm
- Điều hướng trở lại `/events`
- Assert thẻ sự kiện đầu tiên hiển thị
- Lọc các thẻ lại bằng `hasText: eventTitle`
- Assert thẻ hiển thị
- Đọc lại nội dung text số ghế (giống Bước 3) — lưu thành `seatsAfterBooking`
- **Assert:** `seatsAfterBooking === seatsBeforeBooking - 1`

---

## Bài tập 2: Kiểm tra điều kiện hoàn tiền (Refund Eligibility Check)

**Bạn đang kiểm thử gì:** Hai bài test riêng biệt — một đặt vé với 1 vé phải hiển thị "Eligible for refund" (đủ điều kiện hoàn tiền), một đặt vé với 3 vé phải hiển thị "Not eligible for refund" (không đủ điều kiện hoàn tiền).

> Cả hai bài test đều phải xác nhận spinner (biểu tượng xoay chờ) xuất hiện rồi biến mất trước khi hiển thị kết quả.

### Thiết lập (Setup)

- `BASE_URL = https://eventhub.rahulshettyacademy.com`
- Thông tin đăng nhập: Dùng thông tin đăng nhập của riêng bạn
- Viết một hàm hỗ trợ `loginAndGoToBooking(page)` có thể tái sử dụng để đăng nhập và xác nhận liên kết `Browse Events →` hiển thị

### Test 1 — Đặt vé với 1 vé thì đủ điều kiện hoàn tiền

**Bước 1 — Đăng nhập**
- Gọi helper đăng nhập của bạn

**Bước 2 — Đặt vé sự kiện đầu tiên với 1 vé (mặc định)**
- Điều hướng đến `/events`
- Nhấp vào **Book Now** trên thẻ sự kiện đầu tiên (xác định `data-testid="event-card"` → lấy phần tử đầu tiên → `data-testid="book-now-btn"`)
- Điền Full Name, Email (email của bạn), Phone
- Nhấp vào nút confirm (`.confirm-booking-btn`)

**Bước 3 — Điều hướng đến trang chi tiết đặt vé**
- Nhấp vào liên kết `View My Bookings`
- Assert URL là `/bookings`
- Nhấp vào liên kết `View Details` đầu tiên
- **Assert:** văn bản `Booking Information` hiển thị trên trang

**Bước 4 — Xác thực mã đặt vé (booking ref)**
- Đọc mã đặt vé từ trang
- Đọc tiêu đề sự kiện từ thẻ `h1`
- **Assert xác thực:** "ký tự đầu tiên của mã đặt vé bằng ký tự đầu tiên của tiêu đề sự kiện"

**Bước 5 — Kiểm tra điều kiện hoàn tiền**
- Nhấp vào nút **Check Refund Eligibility**
- **Assert:** phần tử spinner (`#refund-spinner`) hiển thị ngay lập tức
- **Assert:** spinner không còn hiển thị nữa trong vòng 6 giây

**Bước 6 — Xác thực kết quả**
- Xác định phần tử kết quả bằng id `#refund-result`
- Assert nó hiển thị
- Assert nó chứa văn bản `Eligible for refund`
- Assert nó chứa văn bản `Single-ticket bookings qualify for a full refund`

---

### Test 2 — Đặt vé theo nhóm thì KHÔNG đủ điều kiện hoàn tiền

**Bước 1–2** — Giống Test 1, ngoại trừ sau khi điều hướng đến trang chi tiết sự kiện, nhấp vào nút **+** hai lần để tăng số lượng lên 3 trước khi điền vào form.

- Xác định nút tăng bằng `button:has-text("+")` và nhấp vào nó hai lần

**Bước 3–5** — Giống hệt Test 1

**Bước 6 — Xác thực kết quả (assertion khác)**
- Assert kết quả chứa `Not eligible for refund`
- Assert kết quả chứa `Group bookings (3 tickets) are non-refundable`

---

## Bài tập 3: Hiển thị banner Sandbox bằng cách giả lập API (Sandbox Banner Visibility with API Mocking)

**Bạn đang kiểm thử gì:** Banner cảnh báo sandbox trên trang Events chỉ xuất hiện khi có nhiều hơn 5 sự kiện được tải. Bạn sẽ sử dụng tính năng chặn route (route interception) của Playwright để giả lập phản hồi API — không cần dữ liệu thật.

### Thiết lập (Setup)

- `BASE_URL = https://eventhub.rahulshettyacademy.com`
- Thông tin đăng nhập: *\<Thông tin đăng nhập của bạn>*
- Định nghĩa hai đối tượng phản hồi giả lập (mock response) dưới dạng constant trước các bài test của bạn (sử dụng các đối tượng mock response bên dưới **nguyên văn** trong bài test của bạn)

**`SIX_EVENTS_RESPONSE`** — một đối tượng JSON với mảng `data` gồm 6 đối tượng sự kiện và `pagination` (`total: 6`)

```js
const SIX_EVENTS_RESPONSE = {
  data: [
    { id: 1, title: 'Tech Summit 2025', category: 'Conference', eventDate: '2025-06-01T10:00:00.000Z', venue: 'HICC', city: 'Hyderabad', price: '999', totalSeats: 200, availableSeats: 150, imageUrl: null, isStatic: false },
    { id: 2, title: 'Rock Night Live',  category: 'Concert',    eventDate: '2025-06-05T18:00:00.000Z', venue: 'Palace Grounds', city: 'Bangalore', price: '1500', totalSeats: 500, availableSeats: 300, imageUrl: null, isStatic: false },
    { id: 3, title: 'IPL Finals',       category: 'Sports',     eventDate: '2025-06-10T19:30:00.000Z', venue: 'Chinnaswamy', city: 'Bangalore', price: '2000', totalSeats: 800, availableSeats: 50, imageUrl: null, isStatic: false },
    { id: 4, title: 'UX Design Workshop', category: 'Workshop', eventDate: '2025-06-15T09:00:00.000Z', venue: 'WeWork', city: 'Mumbai', price: '500', totalSeats: 50, availableSeats: 20, imageUrl: null, isStatic: false },
    { id: 5, title: 'Lollapalooza India', category: 'Festival', eventDate: '2025-06-20T12:00:00.000Z', venue: 'Mahalaxmi Racecourse', city: 'Mumbai', price: '3000', totalSeats: 5000, availableSeats: 2000, imageUrl: null, isStatic: false },
    { id: 6, title: 'AI & ML Expo',    category: 'Conference',  eventDate: '2025-06-25T10:00:00.000Z', venue: 'Bangalore International Exhibition Centre', city: 'Bangalore', price: '750', totalSeats: 300, availableSeats: 180, imageUrl: null, isStatic: false },
  ],
  pagination: { page: 1, totalPages: 1, total: 6, limit: 12 },
};
```

**`FOUR_EVENTS_RESPONSE`** — cùng cấu trúc nhưng chỉ có 4 sự kiện trong `data` (`total: 4`)

```js
const FOUR_EVENTS_RESPONSE = {
  data: [
    { id: 1, title: 'Tech Summit 2025', category: 'Conference', eventDate: '2025-06-01T10:00:00.000Z', venue: 'HICC', city: 'Hyderabad', price: '999', totalSeats: 200, availableSeats: 150, imageUrl: null, isStatic: false },
    { id: 2, title: 'Rock Night Live',  category: 'Concert',    eventDate: '2025-06-05T18:00:00.000Z', venue: 'Palace Grounds', city: 'Bangalore', price: '1500', totalSeats: 500, availableSeats: 300, imageUrl: null, isStatic: false },
    { id: 3, title: 'IPL Finals',       category: 'Sports',     eventDate: '2025-06-10T19:30:00.000Z', venue: 'Chinnaswamy', city: 'Bangalore', price: '2000', totalSeats: 800, availableSeats: 50, imageUrl: null, isStatic: false },
    { id: 4, title: 'UX Design Workshop', category: 'Workshop', eventDate: '2025-06-15T09:00:00.000Z', venue: 'WeWork', city: 'Mumbai', price: '500', totalSeats: 50, availableSeats: 20, imageUrl: null, isStatic: false },
  ],
  pagination: { page: 1, totalPages: 1, total: 4, limit: 12 },
};
```

- Viết một helper `loginAndGoToEvents(page)` để đăng nhập rồi điều hướng đến `/events`

---

### Test 1 — Banner HIỂN THỊ khi trả về 6 sự kiện

**Bước 1 — Thiết lập API mock**
- Chặn tất cả các request khớp với `**/api/events**` bằng `page.route()`
- Trong handler, gọi `route.fulfill()` với status `200`, content type `application/json`, và body được đặt bằng `JSON.stringify(SIX_EVENTS_RESPONSE)`
- Mock phải được đăng ký **trước khi** điều hướng đến trang events

**Bước 2 — Đăng nhập và điều hướng**
- Gọi helper `loginAndGoToEvents(page)` của bạn

**Bước 3 — Xác nhận các thẻ được tải từ mock**
- Lấy tất cả các thẻ sự kiện bằng `data-testid="event-card"`
- Assert thẻ đầu tiên hiển thị
- Assert số lượng thẻ bằng đúng `6`

**Bước 4 — Xác nhận banner hiển thị**
- Xác định banner bằng regex text không phân biệt hoa thường: `/sandbox holds up to/i`
- Assert nó hiển thị
- Assert nó chứa văn bản `9 bookings`

---

### Test 2 — Banner KHÔNG hiển thị khi trả về 4 sự kiện

**Bước 1–2** — Giống Test 1, nhưng dùng `FOUR_EVENTS_RESPONSE` trong mock

**Bước 3 — Xác nhận các thẻ được tải từ mock**
- Assert thẻ đầu tiên hiển thị
- Assert số lượng thẻ bằng đúng `4`

**Bước 4 — Xác nhận banner bị ẩn**
- Xác định banner theo cách giống Test 1
- Assert nó **không** hiển thị

---

## Bài tập 4: Truy cập đặt vé của người dùng khác bị từ chối (Cross-User Booking Access Denied)

**Bạn đang kiểm thử gì:** Người dùng A (Yahoo) tạo một đặt vé thông qua lệnh gọi API trực tiếp — không thông qua giao diện trình duyệt. Người dùng B (Gmail) đăng nhập qua trình duyệt và cố gắng mở trực tiếp URL đặt vé đó. Người dùng B phải thấy lỗi "Access Denied" (Truy cập bị từ chối).

### Thiết lập (Setup)

- `BASE_URL = https://eventhub.rahulshettyacademy.com`
- `API_URL = BASE_URL + /api`
- Tạo hai tài khoản, ví dụ: email Yahoo, email Gmail (có thể dùng email giả — không cần email thật)
- Tài liệu API: [`https://api.eventhub.rahulshettyacademy.com/api/docs/`](https://api.eventhub.rahulshettyacademy.com/api/docs/)

### Các bước (Steps)

#### Bước 1 — Đăng nhập với tư cách người dùng Yahoo qua API
- Sử dụng `request.post()` để gọi `POST /api/auth/login` (tham khảo [tài liệu API](https://api.eventhub.rahulshettyacademy.com/api/docs/#/Auth/post_auth_login))
- Truyền `{ email, password }` làm nội dung request dưới khóa `data`
- Assert phản hồi là OK (`loginRes.ok()` là truthy)
- Phân tích phản hồi JSON và trích xuất `token` — bạn sẽ dùng nó cho tất cả các lệnh gọi API tiếp theo

#### Bước 2 — Lấy danh sách sự kiện qua API để có một event ID hợp lệ
- Sử dụng `request.get()` để gọi `GET /api/events` (tham khảo [tài liệu API](https://api.eventhub.rahulshettyacademy.com/api/docs/#/Events/get_events))
- Truyền `Authorization: Bearer <token>` trong headers của request
- Assert phản hồi là OK
- Phân tích JSON, đọc `data[0].id` — lưu thành `eventId`

#### Bước 3 — Tạo một đặt vé qua API với tư cách người dùng Yahoo
- Sử dụng `request.post()` để gọi `POST /api/bookings` (tham khảo [tài liệu API](https://api.eventhub.rahulshettyacademy.com/api/docs/#/Bookings/post_bookings))
- Truyền `Authorization: Bearer <token>` trong headers
- Truyền payload đặt vé trong `data`:
  - `eventId` — từ Bước 2
  - `customerName` — bất kỳ tên nào, ví dụ `'Yahoo User'`
  - `customerEmail` — email của người dùng Yahoo
  - `customerPhone` — bất kỳ số 10 chữ số nào
  - `quantity` — `1`
- Assert phản hồi là OK
- Phân tích JSON và trích xuất `data.id` — lưu thành `yahooBookingId`

#### Bước 4 — Đăng nhập với tư cách người dùng Gmail qua giao diện trình duyệt
- Gọi helper `loginAs(page, GMAIL_USER)` của bạn

#### Bước 5 — Điều hướng đến URL đặt vé của Yahoo với tư cách người dùng Gmail
- Điều hướng trực tiếp đến `/bookings/${yahooBookingId}`
- Truyền `{ waitUntil: 'networkidle' }` làm tùy chọn điều hướng để trang tải xong hoàn toàn trước khi assert

#### Bước 6 — Xác thực Access Denied
- Assert văn bản `Access Denied` hiển thị
- Assert văn bản `You are not authorized to view this booking` hiển thị
</content>

# Nhật ký debug: WebAPI.spec.js

File này ghi lại toàn bộ lỗi đã gặp khi làm test `tests/WebAPI.spec.js` (đặt hàng qua API rồi kiểm tra trong lịch sử đơn hàng), nguyên nhân và cách fix — để sau này gặp lỗi tương tự thì đọc lại là hiểu ngay, không cần hỏi lại từ đầu.

---

## Lỗi 1: `TypeError: Cannot read properties of undefined (reading '0')`

**Ở đâu:** `orderId = orderResponseJson.orders[0];`

**Nguyên nhân:** Trong lúc gọi API `create-order`, phần `headers` (chứa `Authorization` token) bị đặt **lồng bên trong** `data` — tức là bị gửi như một phần nội dung JSON, chứ không phải header HTTP thật. Server không nhận được token hợp lệ.

**Cách fix:** Đưa `headers` ra làm option ngang hàng với `data`, không lồng bên trong:

```js
// Sai
apiContext.post(url, {
    data: {
        orders: orderPayLoad,
        headers: { Authorization: token }   // ❌ lồng trong data
    }
});

// Đúng
apiContext.post(url, {
    data: { orders: orderPayLoad },
    headers: { Authorization: token }        // ✅ ngang hàng với data
});
```

---

## Lỗi 2: `TypeError: Cannot read properties of undefined (reading 'includes')`

**Ở đâu:** `if (orderId.includes(rowOrderId))`

**Nguyên nhân:** Log response ra thì thấy:
```json
{"orders":[],"productOrderId":[],"message":"Order Placed Successfully"}
```
Server nói "thành công" nhưng `orders` lại **rỗng**. Nguyên nhân thật sự (xem kỹ ở Lỗi 3) là do `orders` gửi lên đang là **object đơn**, trong khi server yêu cầu **mảng**.

> **Đính chính:** Lúc đầu mình từng nghi ngờ (sai) là do tài khoản chưa có sản phẩm trong giỏ hàng, nên đã thêm bước gọi API `add-to-cart` trước khi `create-order`. Sau khi đối chiếu với code mẫu của giảng viên (không hề có bước add-to-cart) và test lại trực tiếp, xác nhận: **không cần add-to-cart**. Lý do lúc debug bị nhầm là vì đã đổi 2 thứ cùng lúc (vừa thêm add-to-cart, vừa sửa `orders` thành mảng) nên tưởng nhầm add-to-cart là nguyên nhân. Chỉ cần sửa đúng Lỗi 3 bên dưới là đủ.

---

## Lỗi 3: `orders` phải là mảng, không phải object đơn

**Nguyên nhân:** Lấy đúng payload thật từ Network tab (view source) khi đặt hàng qua UI thì thấy:

```json
{"orders":[{"country":"Japan","productOrderedId":"..."}]}
```

`orders` phải là **một mảng** chứa object, không phải object đơn như code cũ đang gửi.

**Cách fix:**
```js
// Sai
data: { orders: orderPayLoad }        // orderPayLoad là 1 object

// Đúng
data: { orders: [orderPayLoad] }      // bọc trong mảng
```

Chỉ cần sửa đúng chỗ này là `create-order` trả về `orderId` thật ngay, không cần thêm bước add-to-cart hay lấy danh sách sản phẩm nào khác.

---

## Lỗi 4: `require('/utils/APiUtils')` không tìm thấy module

**Nguyên nhân:** Đường dẫn bắt đầu bằng dấu `/` được Node hiểu là **đường dẫn tuyệt đối từ gốc ổ đĩa**, không phải đường dẫn tương đối tới file trong cùng thư mục `tests/`.

**Cách fix:**
```js
// Sai
require('/utils/APiUtils')

// Đúng
require('./utils/APiUtils')
```

---

## Lỗi 5: `ReferenceError: expect is not defined` (trong APiUtils.js)

**Nguyên nhân:** `APiUtils.js` là file riêng, tách biệt khỏi `WebAPI.spec.js`. Nó không tự động có sẵn `expect` — mỗi file `.js` cần tự import những gì nó dùng.

**Cách fix:** Thêm dòng đầu file:
```js
const {expect} = require('@playwright/test');
```

---

## Lỗi 6: `ReferenceError: product is not defined` (trong hàm `addToCart`)

**Nguyên nhân:** Hàm khai báo tham số tên là `productId`, nhưng bên trong thân hàm lại dùng biến `product` — hai cái tên khác nhau, biến `product` chưa từng được khai báo trong phạm vi hàm này.

```js
// Sai
async addToCart(productId) {
    ...
    data: { product: product }   // ❌ "product" không tồn tại, chỉ có "productId"
}
```

**Cách fix:** Đổi tên tham số cho khớp với biến dùng bên trong, và khi gọi hàm phải truyền **object sản phẩm đầy đủ** (không chỉ ID) — vì payload thật của API `add-to-cart` cần cả `productName`, `productCategory`, v.v.:

```js
async addToCart(product) {
    ...
    data: { _id: this.userId, product: product }   // ✅ đúng tên biến
}

// lúc gọi
await this.addToCart(product);   // truyền cả object, không phải product._id
```

Đồng thời sửa luôn URL bị gõ sai: `.../api/ecom/cart/add-to-cart/` → `.../api/ecom/user/add-to-cart`.

---

## Bài học chung: quy trình debug lỗi API test

1. **Đọc kỹ error message** — `Cannot read properties of undefined (reading 'X')` luôn có nghĩa là biến ngay trước `.X` đang `undefined`. Lần ngược lên chỗ gán giá trị cho nó, đừng sửa vội ngay dòng báo lỗi.
2. **In log để thấy dữ liệu thật**, đừng đoán: `console.log(JSON.stringify(response))` sau mỗi lần gọi API.
3. **Khi response "thành công" nhưng dữ liệu rỗng/sai** — mở DevTools → Network, thao tác thật trên UI, so sánh payload/response thật với những gì code đang gửi.
4. **Viết script debug nhỏ** (dùng `fetch` gọi thẳng API, ngoài Playwright) để test nhanh từng bước mà không cần chạy cả trình duyệt.
5. **Sửa từng lớp, verify từng bước** — đừng sửa nhiều chỗ cùng lúc rồi mới chạy lại, sẽ khó biết chỗ nào thực sự fix được lỗi.

---

## Ghi chú: `await` và thứ tự ưu tiên toán tử khi gọi method nối chuỗi (vd `.trim()`)

**Vấn đề:** Tại sao không viết được:
```js
await page.locator(".booking-ref").first().innerText().trim();
```
mà phải viết:
```js
(await page.locator(".booking-ref").first().innerText()).trim();
```

**Nguyên nhân:** `page.locator(...).first().innerText()` trả về một **Promise\<string\>**, chưa phải string ngay. Nếu gọi `.trim()` ngay sau `.innerText()` mà chưa `await`, JS hiểu là:

```js
await ( page.locator(...).first().innerText().trim() )
```

tức là `.trim()` bị gọi **trên Promise** (vì `.innerText()` lúc đó vẫn chưa được `await`), trong khi Promise không có method `.trim()` → lỗi:
```
TypeError: ...innerText(...).trim is not a function
```

**Cách fix:** Bọc `await ...` trong ngoặc `( )` để ép JS await xong, resolve Promise thành string thật, rồi mới gọi `.trim()` trên string đó:
```js
(await page.locator(".booking-ref").first().innerText()).trim();
```

Hoặc tách 2 dòng cho dễ đọc / dễ debug (có thể `console.log` giá trị trước khi trim):
```js
const text = await page.locator(".booking-ref").first().innerText();
const bookingRef = text.trim();
```

**Quy tắc chung:** `await` chỉ "mở khóa" giá trị Promise ngay tại vị trí nó đứng. Muốn gọi tiếp method/property trên giá trị đã resolve, phải await xong trước (bọc ngoặc hoặc tách biến), không thể nối `.method()` ngay sau lời gọi async chưa được await.

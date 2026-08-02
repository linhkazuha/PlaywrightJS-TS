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
Server nói "thành công" nhưng `orders` lại **rỗng**. Lý do: API `create-order` **không tạo đơn hàng trực tiếp** từ `productOrderedId` gửi lên — nó chỉ **chuyển giỏ hàng (cart) hiện có của tài khoản** thành đơn hàng. Vì test gọi thẳng `create-order` mà chưa từng "thêm sản phẩm vào giỏ", nên giỏ hàng trống → không có gì để tạo đơn.

**Cách phát hiện:** So sánh request thật (bấm nút "Đặt hàng" trên UI, xem tab Network) với request mà code đang gửi — thấy trước đó UI luôn có bước gọi API `add-to-cart`.

**Cách fix:** Thêm 2 bước trước khi gọi `create-order`:
1. Gọi API lấy danh sách sản phẩm (`get-all-products`), tìm đúng sản phẩm theo `productOrderedId`.
2. Gọi API `add-to-cart` với sản phẩm đó.

```js
const product = productsResponseJson.data.find(p => p._id === orderPayLoad.productOrderedId);

await apiContext.post(".../api/ecom/user/add-to-cart", {
    data: { _id: userId, product: product },
    headers: { Authorization: token, 'Content-Type': 'application/json' }
});
```

> Lưu ý: `userId` lấy trực tiếp từ response của API login (`loginResponseJson.userId`), không cần decode token.

---

## Lỗi 3: Vẫn `orders: []` dù đã add-to-cart thành công

**Nguyên nhân:** `add-to-cart` chạy đúng (`"message":"Product Added To Cart"`), nhưng `create-order` vẫn trả rỗng. Lấy đúng payload thật từ Network tab (view source) khi đặt hàng qua UI thì thấy:

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

> Đây là bug thật của API (có thể do backend của trang luyện tập được cập nhật sau khi giảng viên quay video), không phải do tài khoản hay dữ liệu riêng của ai.

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

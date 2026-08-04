const {test, expect, request}  = require('@playwright/test'); // import các hàm cần của Playwright
const {APiUtils} = require('./utils/APiUtils'); // import class gọi API

const loginPayLoad = {userEmail: "khanhlinh0225@gmail.com", userPassword: "Linh.1234"}; // thông tin đăng nhập
const orderPayLoad = {country: "Vietnam", productOrderedId: "6960eae1c941646b7a8b3ed3"}; // thông tin đơn hàng

let response; // biến toàn cục lưu kết quả { token, orderId } dùng chung cho các test

test.beforeAll(async () => {
    const apiContext = await request.newContext(); // tạo context để gọi API (không cần mở trình duyệt)
    const apiUtils = new APiUtils(apiContext, loginPayLoad); // khởi tạo đối tượng gọi API
    response = await apiUtils.createOrder(orderPayLoad); // login + tạo đơn hàng, lưu kết quả vào response
});

test("Place the order", async ({page}) => {
    page.addInitScript(value => {
        window.localStorage.setItem('token', value); // gắn token vào localStorage trước khi trang load
    }, response.token);

    await page.goto("https://rahulshettyacademy.com/client"); // mở trang web (đã có token nên vào thẳng)

    await page.locator("button[routerlink*='myorders']").click(); // bấm vào menu "My Orders"
    await page.locator("tbody").waitFor(); // chờ bảng danh sách đơn hàng hiện ra
    const rows = await page.locator("tbody tr"); // lấy tất cả các dòng trong bảng

    for (let i = 0; i < await rows.count(); ++i) {
        const rowOrderId = await rows.nth(i).locator("th").textContent(); // mã đơn hàng hiển thị ở dòng này
        if (response.orderId.includes(rowOrderId)) { // đúng đơn hàng vừa tạo qua API
            await rows.nth(i).locator("button").first().click(); // bấm xem chi tiết đơn hàng
            break; // dừng vòng lặp vì đã tìm thấy
        }
    }
    const orderIdDetails = await page.locator(".col-text").textContent(); // mã đơn hàng ở trang chi tiết
    await expect(response.orderId.includes(orderIdDetails)).toBeTruthy(); // đối chiếu khớp với orderId từ API
})

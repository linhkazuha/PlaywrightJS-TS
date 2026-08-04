const { test, expect, request } = require('@playwright/test');
const { APiUtils } = require('./utils/APiUtils');
const loginPayLoad = { userEmail: "khanhlinh0225@gmail.com", userPassword: "Linh.1234" }; // thông tin đăng nhập
const orderPayLoad = { country: "Vietnam", productOrderedId: "6960eae1c941646b7a8b3ed3" }; // thông tin đơn hàng
const fakePayloadOrders = { data: [], message: "No Orders" };

let response;
test.beforeAll(async () => {
    const apiContext = await request.newContext();
    const apiUtils = new APiUtils(apiContext, loginPayLoad);
    response = await apiUtils.createOrder(orderPayLoad);

})


//create order is success
test('@API Place the order', async ({ page }) => {
    await page.addInitScript(value => {

        window.localStorage.setItem('token', value);
    }, response.token);
    await page.goto("https://rahulshettyacademy.com/client");
    await page.route("https://rahulshettyacademy.com/api/ecom/order/get-orders-for-customer/*", async route => {
        const response = await page.request.fetch(route.request());
        let body = JSON.stringify(fakePayloadOrders);
        route.fulfill({
            response,
            body,
        })
        // intercepting response

    });

    // await page.pause();



    await page.locator("button[routerlink*='myorders']").click();
    await page.waitForResponse("https://rahulshettyacademy.com/api/ecom/order/get-orders-for-customer/*")

    console.log(await page.locator(".mt-4").textContent());


    // await page.locator("tbody").waitFor();
    // const rows = await page.locator("tbody tr");

});
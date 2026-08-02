const {test, expect, request}  = require('@playwright/test');
const {APiUtils} = require('./utils/APiUtils');


const loginPayLoad = {userEmail: "khanhlinh0225@gmail.com", userPassword: "Linh.1234"};
const orderPayLoad = {country: "Vietnam", productOrderedId: "6960eae1c941646b7a8b3ed3"};

let response;

test.beforeAll(async () => {
    const apiContext = await request.newContext();
    const apiUtils = new APiUtils(apiContext, loginPayLoad);
    response = await apiUtils.createOrder(orderPayLoad);
});



test("Place the order", async ({page}) => {
    // const apiUtils = new APIUtils(apiContext, loginPayLoad);
    // const orderId = await apiUtils.createOrder(orderPayLoad);
    page.addInitScript(value => {
        window.localStorage.setItem('token', value);
    }, response.token);

    // const email = "";
    // const productName = "ZARA COAT 3";
    await page.goto("https://rahulshettyacademy.com/client");

    await page.locator("button[routerlink*='myorders']").click();
    await page.locator("tbody").waitFor();
    const rows = await page.locator("tbody tr");
 
 
    for (let i = 0; i < await rows.count(); ++i) {
        const rowOrderId = await rows.nth(i).locator("th").textContent();
        if (response.orderId.includes(rowOrderId)) {
            await rows.nth(i).locator("button").first().click();
            break;
        }
    }
    const orderIdDetails = await page.locator(".col-text").textContent();
    // await page.pause();
    await expect(response.orderId.includes(orderIdDetails)).toBeTruthy();
})

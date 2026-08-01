const {test, expect, request}  = require('@playwright/test');
const loginPayLoad = {userEmail: "khanhlinh0225@gmail.com", userPassword: "Linh.1234"};
const orderPayLoad = {orders: [{country: "India", productOrderedId: "6262e95ae26b7e1a10e89bf0"}]};

let token;
const orderId;

test.beforeAll(async () => {
    const apiContext = await request.newContext();
    const loginResponse = await apiContext.post("https://rahulshettyacademy.com/api/ecom/auth/login", {
        data: loginPayLoad
    });
    expect(loginResponse.ok()).toBeTruthy();
    const loginResponseJson = await loginResponse.json();
    token = loginResponseJson.token;
    console.log("Token: " + token);

    const orderResponse = await apiContext.post("https://rahulshettyacademy.com/api/ecom/order/create-order", {
        data: {
            orders: orderPayLoad,
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        }
    });

    const orderResponseJson = await orderResponse.json();
    console.log("Order Response: " + JSON.stringify(orderResponseJson));
    orderId = orderResponseJson.orders[0];

});


test.beforeEach(async () => {

})


test("Place the order", async ({page}) => {
    page.addInitScript(value => {
        window.localStorage.setItem('token', value);
    }, token);

    const email = "";
    const productName = "ZARA COAT 3";
    await page.goto("https://rahulshettyacademy.com/client");
    const products = page.locator(".card-body");
    const titles = await page.locator(".card-body b").allTextContents();

    console.log(titles);

    const count = await products.count();
    for (let i=0; i<count; i++) {
        if (await products.nth(i).locator("b").textContent() === productName) {
            await products.nth(i).locator("text= Add To Cart").click();
            break;
        }
    }

    await page.locator("[routerlink*='cart']").click();;
    await page.locator("div li").first().waitFor();
    const bool = await page.locator("h3:has-text('ZARA COAT 3')").isVisible();
    expect(bool).toBeTruthy();
    
      
    // -----------------------------

    await page.locator("text=Checkout").click();
    await page.locator("[placeholder*='Country']").pressSequentially('ind', {delay: 100});
    const dropdown = page.locator(".ta-results");
    await dropdown.waitFor();
    const optionsCount = await dropdown.locator("button").count();

    for (let i=0; i<optionsCount; i++) {
        const text = await dropdown.locator("button").nth(i).textContent();
        if (text.trim() === "India") {
            await dropdown.locator("button").nth(i).click();
            break;
        }
    }

    expect(page.locator(".user__name [type='text']").first()).toHaveText("khanhlinh0225@gmail.com")
    
    // await page.locator(".input.txt").nth(1).fill("123");
    // await page.locator(".input.txt").nth(2).fill("LINH");
    // await page.locator(".input.txt").nth(3).fill("voucher");

 
    
    
    await page.locator(".action__submit").click();
    await expect(page.locator(".hero-primary")).toHaveText(" Thankyou for the order. ");
    const orderId = await page.locator(".em-spacer-1 .ng-star-inserted").textContent();
    console.log(orderId);

    //-------------------------------

    await page.locator("button[routerlink*='myorders']").click();
    await page.locator("tbody").waitFor();
    const rows = await page.locator("tbody tr");
 
 
    for (let i = 0; i < await rows.count(); ++i) {
        const rowOrderId = await rows.nth(i).locator("th").textContent();
        if (orderId.includes(rowOrderId)) {
            await rows.nth(i).locator("button").first().click();
            break;
        }
    }
    const orderIdDetails = await page.locator(".col-text").textContent();
    await expect(orderId.includes(orderIdDetails)).toBeTruthy();

})


// verify if order created is showing in history page
// precondition: 
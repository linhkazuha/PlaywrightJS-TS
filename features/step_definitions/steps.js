const { When, Then, Given, After } = require('@cucumber/cucumber');
const {POManager} = require('../../pageobjects/POManager');
const {expect} = require('@playwright/test');
const playwright = require('@playwright/test');



Given('a login to Ecommerce application with {string} and {string}', {timeout: 100*1000}, async function (username, password) {
    this.browser = await playwright.chromium.launch({ headless: false });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
    
    this.poManager = new POManager(this.page);

    const loginPage = this.poManager.getLoginPage();
    await loginPage.goTo();
    await loginPage.validLogin(username, password);
    // return 'pending';
})

When('add {string} to Cart', async function (productName) {
    const dashboardPage = this.poManager.getDashboardPage();
    await dashboardPage.searchProductAddCart(productName);
    await dashboardPage.navigateToCart();


});

Then('verify {string} is displayed in the Cart', async function (productName) {
    const cartPage = this.poManager.getCartPage();
    await cartPage.VerifyProductIsDisplayed(productName);
})

When('enter valid details and place the order', async function () {
    const cartPage = this.poManager.getCartPage();
    await cartPage.Checkout();

    const ordersReviewPage = this.poManager.getOrdersReviewPage();
    await ordersReviewPage.searchCountryAndSelect("ind", "India");

    this.orderId = await ordersReviewPage.SubmitAndGetOrderId();
});

Then('verify order in present in the OrderHistory', async function () {
    const dashboardPage = this.poManager.getDashboardPage();
    await dashboardPage.navigateToOrders();

    const ordersHistoryPage = this.poManager.getOrdersHistoryPage();
    await ordersHistoryPage.searchOrderAndSelect(this.orderId);
    const orderIdDetails = await ordersHistoryPage.getOrderId();

    if (!orderIdDetails || !this.orderId.includes(orderIdDetails)) {
        throw new Error(`Order id ${this.orderId} not found in order history`);
    }
});

After(async function () {
    if (this.browser) {
        await this.browser.close();
    }
});
import { test, expect } from '@playwright/test';
import { customTest } from './utils_typescript/test-base';

import { POManager } from '../pageobjects_ts/POManager';
const dataset = JSON.parse(JSON.stringify(require("./utils/placeorderTestData.json")));

for (const data of dataset) {
    test(`Client App Login for ${data.productName}`, async ({ page }) => {
        const poManager = new POManager(page);

        const loginPage = poManager.getLoginPage();
        await loginPage.goTo();
        await loginPage.validLogin(data.username, data.password);

        const dashboardPage = poManager.getDashboardPage();
        await dashboardPage.searchProductAddCart(data.productName);
        await dashboardPage.navigateToCart();

        const cartPage = poManager.getCartPage();
        await cartPage.VerifyProductIsDisplayed(data.productName);
        await cartPage.Checkout();

        const ordersReviewPage = poManager.getOrdersReviewPage();
        await ordersReviewPage.searchCountryAndSelect("ind", "India");
        await ordersReviewPage.VerifyEmailId(data.username);

        const orderId = await ordersReviewPage.SubmitAndGetOrderId();
        console.log(orderId);

        const ordersHistoryPage = poManager.getOrdersHistoryPage();
        await page.locator("button[routerlink*='myorders']").click();
        await ordersHistoryPage.searchOrderAndSelect(orderId);
        const orderIdDetails = await ordersHistoryPage.getOrderId();
        expect(orderId.includes(orderIdDetails)).toBeTruthy();
    })
}

customTest.only(`Client App login`, async ({ page, testDataForOrder }) => {
    const poManager = new POManager(page);

    const loginPage = poManager.getLoginPage();
    await loginPage.goTo();
    await loginPage.validLogin(testDataForOrder.username, testDataForOrder.password);

    const dashboardPage = poManager.getDashboardPage();
    await dashboardPage.searchProductAddCart(testDataForOrder.productName);
    await dashboardPage.navigateToCart();

    const cartPage = poManager.getCartPage();
    await cartPage.VerifyProductIsDisplayed(testDataForOrder.productName);
    await cartPage.Checkout();

    const ordersReviewPage = poManager.getOrdersReviewPage();
    await ordersReviewPage.searchCountryAndSelect("ind", "India");
    await ordersReviewPage.VerifyEmailId(testDataForOrder.username);

    const orderId = await ordersReviewPage.SubmitAndGetOrderId();
    console.log(orderId);

    const ordersHistoryPage = poManager.getOrdersHistoryPage();
    await page.locator("button[routerlink*='myorders']").click();
    await ordersHistoryPage.searchOrderAndSelect(orderId);
    const orderIdDetails = await ordersHistoryPage.getOrderId();
    expect(orderId.includes(orderIdDetails)).toBeTruthy();



})
const { test, expect } = require('@playwright/test');

async function loginAndGoToBooking(page) {
    await page.goto("https://eventhub.rahulshettyacademy.com/login");
    await page.getByPlaceholder("you@email.com").fill("khanhliinh0225@gmail.com");
    await page.getByLabel("Password").fill("Linh.1234");
    await page.locator("#login-btn").click();
    await expect(page.getByText("Browse Events →")).toBeVisible();

}

async function bookEventAndGetRefundResult(page, numberOdTickets) {
    // 1. login
    await loginAndGoToBooking(page);

    // 2. book tickets
    await page.goto("https://eventhub.rahulshettyacademy.com/events");
    const eventCards = page.locator("[data-testid='event-card']");
    const availableCard = eventCards.filter({ hasNotText: "Sold Out" }).first();
    await availableCard.locator("[data-testid='book-now-btn']").click();

    if (numberOdTickets > 1) {
        const incrementBtn = page.locator("button:has-text('+')");
        for (let i = 1; i < numberOdTickets; i++) {
            await incrementBtn.click();
        }
    }

    await page.getByLabel("Full Name").fill("Khanh Linh");
    await page.locator("#customer-email").fill("khanhliinh0225@gmail.com");
    await page.getByPlaceholder("+91 98765 43210").fill("0123456789");
    await page.locator(".confirm-booking-btn").click();

    // 3. go to my bookings
    await page.getByText("View My Bookings").click();
    await expect(page).toHaveURL("https://eventhub.rahulshettyacademy.com/bookings");
    await page.getByText("View Details").first().click();
    await expect(page.getByText("Booking Information")).toBeVisible();

    // 4. check booking ref
    const bookingRef = (await page.locator(".font-mono.font-bold.text-indigo-600").innerText()).trim();
    const eventTitle = (await page.locator("h1").innerText()).trim();
    await expect(bookingRef.charAt(0)).toBe(eventTitle.charAt(0));

    // 5. check refund eligibility
    await page.getByText("Check eligibility for refund?").click();
    await expect(page.locator("#refund-spinner")).toBeVisible();
    await expect(page.locator("#refund-spinner")).toBeHidden({ timeout: 6000 });

    return page.locator("#refund-result");
}

test('Single ticket booking is eligible for refund', async ({ page }) => {
    // 1-5 
    const refundResult = await bookEventAndGetRefundResult(page, 1);


    // 6. validate result
    // const refundResult = page.locator("#refund-result");
    await expect(refundResult).toBeVisible();
    await expect(refundResult).toContainText("Eligible for refund");
    await expect(refundResult).toContainText("Single-ticket bookings qualify for a full refund.");

})

test('Multiple ticket booking is not eligible for refund', async ({ page }) => {
    // 1-5
    const refundResult = await bookEventAndGetRefundResult(page, 3);

    // 6. validate result
    await expect(refundResult).toBeVisible();
    await expect(refundResult).toContainText("Not eligible for refund");
    await expect(refundResult).toContainText("Group bookings (3 tickets) are non-refundable.");

})
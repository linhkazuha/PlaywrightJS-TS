const {test, expect} = require('@playwright/test');

const BASE_URL = "https://eventhub.rahulshettyacademy.com";
const API_URL = "https://api.eventhub.rahulshettyacademy.com/api";

const YAHOO_USER = { email: "khanhlinh.yahoo.test@example.com", password: "Linh.1234" };
const GMAIL_USER = { email: "khanhliinh0225@gmail.com", password: "Linh.1234" };

async function loginAs(page, user) {
    await page.goto(`${BASE_URL}/login`);
    await page.getByPlaceholder('you@email.com').fill(user.email);
    await page.getByLabel('Password').fill(user.password);
    await page.locator('#login-btn').click();
    await expect(page.getByText("Browse Events →")).toBeVisible();
}

test('Cross-user booking access is denied', async ({page}) => {
    // 1. login as yahoo user via API
    const loginRes = await page.request.post(`${API_URL}/auth/login`, {
        data: {
            email: YAHOO_USER.email,
            password: YAHOO_USER.password
        }
    });
    expect(loginRes.ok()).toBeTruthy();
    const loginBody = await loginRes.json();
    const token = loginBody.token;

    // 2. fetch events via API to get a valid event ID
    const eventRes = await page.request.get(`${API_URL}/events`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    expect(eventRes.ok()).toBeTruthy();
    const eventBody = await eventRes.json();
    const eventId = eventBody.data[0].id;

    // 3. create a booking via API as yahoo user
    const bookingRes = await page.request.post(`${API_URL}/bookings`, {
        headers: {'Authorization': `Bearer ${token}`},
        data: {
            eventId: eventId,
            customerName: "Yahoo User",
            customerEmail: YAHOO_USER.email,
            customerPhone: "0123456789",
            quantity: 1,
        },            
    });
    expect(bookingRes.ok()).toBeTruthy();
    const bookingBody = await bookingRes.json();
    const bookingId = bookingBody.data.id;

    // 4. login as gmail user via UI
    await loginAs(page, GMAIL_USER);

    // 5. navigate to yahoo's booking url as gmail user
    await page.goto(`${BASE_URL}/bookings/${bookingId}`, {waitUntil: 'networkidle'});

    // 6. verify access denied message is shown
    await expect(page.getByText("Access Denied")).toBeVisible();
    await expect(page.getByText("You are not authorized to view this booking.")).toBeVisible();


})
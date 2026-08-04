const {test, expect} = require('@playwright/test');

async function login(page) {
    await page.goto("https://eventhub.rahulshettyacademy.com/login");
    const email = "khanhliinh0225@gmail.com";
    const pw = "Linh.1234";
    await page.getByPlaceholder("you@email.com").fill(email);
    await page.getByLabel("Password").fill(pw);
    await page.locator("#login-btn").click();
    await expect(page.getByText("Browse Events →")).toBeVisible();
}

async function futureDateValue() {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 16);
}


test("Seat validation", async({page}) => {
    await login(page);

    // create event
    // goto /admin/events
    const titleEvent = `Test Event ${Date.now()}`;
    // await page.locator(".hidden .relative button").click();
    // await page.getByRole('navigation').getByText("Manage Events").click();
    await page.goto("https://eventhub.rahulshettyacademy.com/admin/events");
    await page.locator("#event-title-input").fill(titleEvent);
    await page.locator("#admin-event-form textarea").fill("The first test event for community");
    await page.getByLabel("City").fill("Ha Noi");
    await page.getByLabel("Venue").fill("My Dinh Stadium");
    await page.getByLabel("Event Date & Time").fill(await futureDateValue());
    await page.getByLabel("Price").fill("100");
    await page.getByLabel("Total Seats").fill("1000");

    await page.locator("#add-event-btn").click();
    await expect(page.getByText("Event created!")).toBeVisible();

    // find event card and save seat number
    await page.locator("#nav-events").click();
    const eventCards = page.locator('[data-testid="event-card"]');
    await expect(eventCards.first()).toBeVisible();
    const currentEventCard = eventCards.filter({hasText: titleEvent}).first();
    await expect(currentEventCard).toBeVisible({ timeout: 5000 });
    const seatsText = await currentEventCard.getByText("seats").innerText();
    const seatsBeforeBooking = parseInt(seatsText.match(/\d+/)[0], 10);
    
    await currentEventCard.locator('[data-testid="book-now-btn"]').click();

    // book 1 seat
    await page.getByLabel("Full Name").fill("Linh Khanh");
    await page.locator("#customer-email").fill("khanhlinh0225@gmail.com");
    await page.getByPlaceholder("+91 98765 43210").fill("0987654321");
    await page.locator(".confirm-booking-btn").click();
    
    // confirm booking success
    await expect(page.locator(".booking-ref").first()).toBeVisible();
    const bookingRef = (await page.locator(".booking-ref").first().innerText()).trim();

    await page.getByText("View My Bookings").click();
    // await page.waitForURL(/\/bookings/);
    // await expect(page.url()).toContain("/bookings");
    await expect(page).toHaveURL("https://eventhub.rahulshettyacademy.com/bookings");

    const bookingCards = page.locator("#booking-card");
    await expect(bookingCards.first()).toBeVisible();
    const bookingRefLocator = page.locator(".booking-ref", { hasText: bookingRef });
    const specificBookingCard = bookingCards.filter({ has: bookingRefLocator }).first();
    await expect(specificBookingCard).toBeVisible();
    await expect(specificBookingCard).toContainText(titleEvent);

    // check seat number after booking
    await page.locator("#nav-events").click();
    await expect(page.locator('[data-testid="event-card"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="event-card"]').filter({hasText: titleEvent})).toBeVisible();
    const seatsText2 = await page.locator('[data-testid="event-card"]').filter({hasText: titleEvent}).first().getByText("seats").innerText();
    const seatsAfterBooking = parseInt(seatsText2.match(/\d+/)[0], 10);

    await expect(seatsAfterBooking).toBe(seatsBeforeBooking - 1);

})




// import { test, expect } from '@playwright/test';

// const BASE_URL      = 'https://eventhub.rahulshettyacademy.com'
// // ── Credentials ────────────────────────────────────────────────────────────────
// const USER_EMAIL    = 'replacewithyourcredentials@gmail.com';// update email and password with your account
// const USER_PASSWORD = 'yourpassword'; 

// // ── Helpers ────────────────────────────────────────────────────────────────────
// async function login(page) {
//   await page.goto(`${BASE_URL}/login`);

//   // Located by placeholder
//   await page.getByPlaceholder('you@email.com').fill(USER_EMAIL);

//   // Located by label
//   await page.getByLabel('Password').fill(USER_PASSWORD);

//   // Located by id
//   await page.locator('#login-btn').click();

//   await expect(page.getByRole('link', { name: 'Browse Events →' })).toBeVisible();
// }


// // ── Test ───────────────────────────────────────────────────────────────────────
// test('create event via UI, book it, and verify seat reduction', async ({ page }) => {

//   // ── Step 1: Log in ───────────────────────────────────────────────────────
//   await login(page);

//   // ── Step 2: Create a new event via the admin form ────────────────────────
//   await page.goto(`${BASE_URL}/admin/events`);

//   // Unique title so we can find this exact card later
//   const eventTitle = `Test Event ${Date.now()}`;

//   // Located by id (explicit on the component)
//   await page.locator('#event-title-input').fill(eventTitle);

//   // Description — only textarea in the form
//   await page.locator('#admin-event-form textarea').fill('Playwright test event');

//   // Located by label (Select auto-generates id from label text)
//   await page.getByLabel('City').fill('Test City');
//   await page.getByLabel('Venue').fill('Test Venue');

//   // datetime-local input — located by label
//   await page.getByLabel('Event Date & Time').fill('2027-12-31T10:00');

//   await page.getByLabel('Price ($)').fill('100');
//   await page.getByLabel('Total Seats').fill('50');

//   // Located by id
//   await page.locator('#add-event-btn').click();

//   // Wait for success toast
//   await expect(page.getByText('Event created!')).toBeVisible();

//   console.log(`Created event: "${eventTitle}"`);

//   // ── Step 3: Go to Events page and find the newly created card ─────────────
//   await page.goto(`${BASE_URL}/events`);

//   // Located by data-testid
//   const eventCards = page.getByTestId('event-card');
//   await expect(eventCards.first()).toBeVisible();

//   // Scan all visible event cards for the one matching our created title
//   const targetCard = eventCards.filter({ hasText: eventTitle }).first();
//   await expect(targetCard).toBeVisible({ timeout: 5000 });

//   // Capture seat count before booking
//   const seatsBeforeBooking = parseInt(await targetCard.getByText('seat').first().innerText());
//   console.log(`Seats before booking: ${seatsBeforeBooking}`);

//   // Located by data-testid inside the matched card
//   await targetCard.getByTestId('book-now-btn').click();

//   // ── Step 4: Fill the booking form ────────────────────────────────────────

//   // Quantity defaults to 1 — verify via id
//   const ticketCount = page.locator('#ticket-count');
//   await expect(ticketCount).toHaveText('1');

//   // Located by label
//   await page.getByLabel('Full Name').fill('Test Student');

//   // Located by id
//   await page.locator('#customer-email').fill('test.student@example.com');

//   // Located by placeholder
//   await page.getByPlaceholder('+91 98765 43210').fill('9876543210');

//   // Located by CSS class
//   await page.locator('.confirm-booking-btn').click();

//   // ── Step 5: Verify booking confirmation ──────────────────────────────────

//   // Located by CSS class
//   const bookingRefEl = page.locator('.booking-ref').first();
//   await expect(bookingRefEl).toBeVisible();

//   const bookingRef = (await bookingRefEl.innerText()).trim();
//   expect(bookingRef.charAt(0)).toBe(eventTitle.trim().charAt(0).toUpperCase());

//   console.log(`Booking confirmed. Ref: ${bookingRef}`);

//   // ── Step 6: Verify booking appears in My Bookings ────────────────────────
//   await page.getByRole('link', { name: 'View My Bookings' }).click();
//   await expect(page).toHaveURL(`${BASE_URL}/bookings`);

//   // Located by id
//   const bookingCards = page.locator('#booking-card');
//   await expect(bookingCards.first()).toBeVisible();

//   // Find the card that contains our booking ref (via CSS class inside the card)
//   const matchingCard = bookingCards.filter({ has: page.locator('.booking-ref', { hasText: bookingRef }) });
//   await expect(matchingCard).toBeVisible();

//   // Verify event title also appears in the same card
//   await expect(matchingCard).toContainText(eventTitle);

//   console.log(`Booking card found in My Bookings for ref: ${bookingRef}`);

//   // ── Step 7: Verify seat count reduced on Events page ─────────────────────
//   await page.goto(`${BASE_URL}/events`);
//   await expect(eventCards.first()).toBeVisible();

//   // Find the same event by title
//   const updatedCard       = eventCards.filter({ hasText: eventTitle }).first();
//   await expect(updatedCard).toBeVisible();

//   const seatsAfterBooking = parseInt(await updatedCard.getByText('seat').first().innerText());
//   console.log(`Seats after booking: ${seatsAfterBooking}`);

//   // Booked 1 ticket — count must drop by exactly 1
//   expect(seatsAfterBooking).toBe(seatsBeforeBooking - 1);
// });
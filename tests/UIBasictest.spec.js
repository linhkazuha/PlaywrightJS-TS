const {test, expect} = require('@playwright/test');
// const {expect} = require('../playwright.config');

// test('Browser Context Playwright test', async ({browser}) => {
//     const context = await browser.newContext();
//     const page = await context.newPage();
//     await page.goto("https://rahulshettyacademy.com/loginpagePractise/");
//     console.log(await page.title());

//     await page.locator('#username').type("rahulshetty");
//     await page.locator("[type='password']").type("learning");
//     await page.locator("#signInBtn").click();

//     console.log(await page.locator("[style*='block']").textContent());
//     await expect(page.locator("[style*='block']")).toContainText("hahaha");

// })


test('@Child windows hadl', async ({browser})=>
 {
    const context = await browser.newContext();
    const page =  await context.newPage();
    const userName = page.locator('#username');
    await page.goto("https://rahulshettyacademy.com/loginpagePractise/");
    const documentLink = page.locator("[href*='documents-request']");
 
    const [newPage]=await Promise.all(
   [
      context.waitForEvent('page'),//listen for any new page pending,rejected,fulfilled
      documentLink.click(),
   
   ])//new page is opened
   
 
   const  text = await newPage.locator(".red").textContent();
    const arrayText = text.split("@")
    const domain =  arrayText[1].split(" ")[0]
    //console.log(domain);
    await page.locator("#username").fill(domain);
    console.log(await page.locator("#username").inputValue());
 
 })
 
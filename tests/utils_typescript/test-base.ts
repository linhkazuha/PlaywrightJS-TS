import { test as baseTest } from '@playwright/test';

interface TestDataForOrder {
    username: string;
    password: string;
    productName: string;
}


export const customTest = baseTest.extend<{testDataForOrder: TestDataForOrder}>(
    {
        testDataForOrder: async ({}, use) => {
            await use({
                username: "khanhlinh0225@gmail.com",
                password: "Linh.1234",
                productName: "ZARA COAT 3"
            });
        }
    }
)
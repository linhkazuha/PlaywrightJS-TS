const { test } = require('@playwright/test');

exports.customTest = test.extend(
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
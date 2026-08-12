Feature: Ecommerce validations

    Scenario: Placing the Order
        Given a login to Ecommerce application with "khanhlinh0225@gmail.com" and "Linh.1234"
        When add "ZARA COAT 3" to Cart
        Then verify "ZARA COAT 3" is displayed in the Cart
        When enter valid details and place the order
        Then verify order in present in the OrderHistory
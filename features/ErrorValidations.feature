Feature: Ecommerce validations
    @Validation
    @foo
    Scenario: Placing the Order
        Given a login to Ecommerce application with "khanhlinh0225@gmail.com" and "Linh.12345"
        Then verify error message is displayed
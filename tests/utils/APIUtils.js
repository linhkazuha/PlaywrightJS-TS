const {expect} = require('@playwright/test');

class APiUtils {
    constructor(apiContext, loginPayLoad) {
        this.apiContext = apiContext;
        this.loginPayLoad = loginPayLoad;
    }


    async getToken(){
        const loginResponse = await this.apiContext.post("https://rahulshettyacademy.com/api/ecom/auth/login", {
            data: this.loginPayLoad


        })
        expect(loginResponse.ok()).toBeTruthy();
        const loginResponseJson = await loginResponse.json();
        this.token = loginResponseJson.token;
        this.userId = loginResponseJson.userId;
        return this.token;
    }

    async getProduct(productId) {
        const productsResponse = await this.apiContext.post("https://rahulshettyacademy.com/api/ecom/product/get-all-products", {
            data: {
                productName: "",
                minPrice: null,
                maxPrice: null,
                productCategory: [],
                productSubCategory: [],
                productFor: []

            },
            headers: {
                'Authorization': this.token,
                'Content-Type': 'application/json'
            }
        });
        const productsResponseJson = await productsResponse.json();
        const product = productsResponseJson.data.find(product => product._id === productId);
        return product;
    }

    async addToCart(product) {
        const addToCartResponse = await this.apiContext.post("https://rahulshettyacademy.com/api/ecom/user/add-to-cart", {
            data: {
                _id: this.userId,
                product: product,

            },
            headers: {
                'Authorization': this.token,
                'Content-Type': 'application/json'
            }
        });
        expect(addToCartResponse.ok()).toBeTruthy();



    }

    async createOrder(orderPayLoad){
        let response = {};
        response.token = await this.getToken();
        const product = await this.getProduct(orderPayLoad.productOrderedId);
        await this.addToCart(product);
        const orderResponse = await this.apiContext.post("https://rahulshettyacademy.com/api/ecom/order/create-order", {
            data: {
                orders: [orderPayLoad]
            },
            headers: {
                'Authorization': response.token,
                'Content-Type': 'application/json'
            }
        });

        const orderResponseJson = await orderResponse.json();
        console.log("Order Response: " + JSON.stringify(orderResponseJson));
        const orderId = orderResponseJson.orders[0];
        response.orderId = orderId;
        return response;
    }
}

module.exports = { APiUtils };
const {expect} = require('@playwright/test'); // import expect để dùng assertion trong file này

class APiUtils {
    constructor(apiContext, loginPayLoad) {
        this.apiContext = apiContext; // lưu apiContext để dùng chung trong class
        this.loginPayLoad = loginPayLoad; // lưu thông tin đăng nhập
    }

    async getToken(){
        const loginResponse = await this.apiContext.post("https://rahulshettyacademy.com/api/ecom/auth/login", {
            data: this.loginPayLoad
        }) // gọi API đăng nhập
        expect(loginResponse.ok()).toBeTruthy(); // kiểm tra request thành công
        const loginResponseJson = await loginResponse.json(); // parse response thành object
        this.token = loginResponseJson.token; // lưu token vào class để dùng lại
        return this.token; // trả token cho nơi gọi
    }

    async createOrder(orderPayLoad){
        let response = {}; // object gom kết quả trả về { token, orderId }
        response.token = await this.getToken(); // login trước, lấy token
        const orderResponse = await this.apiContext.post("https://rahulshettyacademy.com/api/ecom/order/create-order", {
            data: {
                orders: [orderPayLoad] // orders phải là mảng, server mới tạo đơn đúng
            },
            headers: {
                'Authorization': response.token, // đính kèm token để xác thực
                'Content-Type': 'application/json'
            }
        }); // gọi API tạo đơn hàng

        const orderResponseJson = await orderResponse.json(); // parse response thành object
        console.log("Order Response: " + JSON.stringify(orderResponseJson)); // log để debug
        const orderId = orderResponseJson.orders[0]; // lấy id đơn hàng vừa tạo
        response.orderId = orderId; // gán vào object kết quả
        return response; // trả về { token, orderId } cho file test
    }
}

module.exports = { APiUtils }; // export class để file khác dùng

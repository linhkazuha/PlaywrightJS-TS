class APIUtils {
    async getToken(){
        const loginResponse = await apiContext.post("https://rahulshettyacademy.com/api/ecom/auth/login", {
            data: loginPayLoad


        })
        expect(loginResponse.ok()).toBeTruthy();
        const loginRessponseJson = await loginResponse.json();
        let token = loginRessponseJson.token;
        return token;
    }





}
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  // 1. CẤU HÌNH CHUNG (Áp dụng cho mọi bài test)
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    ignoreHTTPSErrors: true,
    permissions: ['geolocation'],
  },

  // 2. CẤU HÌNH PROJECTS (Chạy đa môi trường / đa thiết bị)
  projects: [{ // Dự án 1: Chạy bằng Chrome, có hiển thị trình duyệt, tự set kích thước
      name: 'Chrome Execution',
      use: {
        browserName: 'chromium',
        headless: false,                   
        viewport: { width: 720, height: 720 },
      },
    },
    { // Dự án 2: Chạy bằng Safari, chạy ngầm 
      name: 'Safari Execution',
      use: {
        browserName: 'webkit',
        headless: true,                   
      },
    },
    { // Dự án 3: Giả lập toàn diện thiết bị di động (Mobile Device)
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 11'],  
      },
    }
  ],
});


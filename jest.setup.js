// Global test setup for Jest
// @ts-ignore
jest.setTimeout(60000);

// Global test configuration
// @ts-ignore
global.testConfig = {
  baseUrl: 'http://localhost:3000',
  timeout: 30000,
  viewport: {
    width: 1920,
    height: 1080
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Global test helpers
// @ts-ignore
global.sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
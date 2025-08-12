// Global test setup for Jest
jest.setTimeout(60000);

// Global test configuration
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
global.sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
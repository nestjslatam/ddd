// Jest E2E setup file
// Set NODE_ENV to test to disable DevTools in E2E tests
// This must be set before any modules are imported
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test';
}

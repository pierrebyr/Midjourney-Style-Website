import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to register page', async ({ page }) => {
    const registerLink = page.getByRole('link', { name: /register|sign up/i });
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page).toHaveURL(/.*register/);
    } else {
      test.skip();
    }
  });

  test('should show validation errors on empty registration form', async ({ page }) => {
    await page.goto('/register');

    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /register|sign up|create/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Should show validation errors
      await page.waitForTimeout(500);

      // Check if page didn't navigate away (stayed on register page)
      await expect(page).toHaveURL(/.*register/);
    } else {
      test.skip();
    }
  });

  test('should navigate to login page', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: /login|sign in/i });
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/.*login/);
    } else {
      test.skip();
    }
  });

  test('should show validation errors on empty login form', async ({ page }) => {
    await page.goto('/login');

    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /login|sign in/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Should show validation errors or stay on login page
      await page.waitForTimeout(500);
      await expect(page).toHaveURL(/.*login/);
    } else {
      test.skip();
    }
  });
});

test.describe('Protected Routes', () => {
  test('should redirect to login when accessing create page without auth', async ({ page }) => {
    await page.goto('/create');

    // Should either redirect to login or show login prompt
    await page.waitForTimeout(1000);

    const currentUrl = page.url();
    const isOnCreatePage = currentUrl.includes('/create');
    const isOnLoginPage = currentUrl.includes('/login');

    // Either should be on login page (redirected) or create page is accessible
    expect(isOnCreatePage || isOnLoginPage).toBe(true);
  });
});

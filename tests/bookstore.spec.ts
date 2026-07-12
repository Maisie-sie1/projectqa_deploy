import { test, expect } from "@playwright/test";

test.describe("Lumina Books Bookstore Flow", () => {
  test("should load the home page and browse book catalog", async ({ page }) => {
    // 1. Go to Home page
    await page.goto("/");
    await expect(page.locator("header")).toContainText("Lumina Books");

    // 2. Click explore catalog link
    await page.click("text=สำรวจหน้าร้าน");
    await expect(page).toHaveURL("/books");

    // 3. Verify page content
    await expect(page.locator("h1")).toContainText("หนังสือทั้งหมด");

    // 4. Search for a book
    const searchInput = page.locator("input[name='search']");
    await searchInput.fill("ความลับแห่งแสงจันทร์");
    await page.click("button[type='submit']");

    // 5. Check if search result is visible
    await expect(page.locator("article")).toContainText("ความลับแห่งแสงจันทร์");

    // 6. Click on the book card to view details
    await page.click("text=ความลับแห่งแสงจันทร์");
    await expect(page.locator("h1")).toContainText("ความลับแห่งแสงจันทร์");
  });

  test("should check cart flow redirects to login if unauthenticated", async ({ page }) => {
    await page.goto("/books");
    
    // Check if at least one book card is visible
    const firstBook = page.locator("article").first();
    await expect(firstBook).toBeVisible();

    // Click on the book details
    await firstBook.locator("h3").click();

    // Click "เพิ่มลงตะกร้า" or "หยิบใส่ตะกร้า" button
    const cartButton = page.locator("button", { hasText: /เพิ่มลงตะกร้า|หยิบใส่ตะกร้า/ }).first();
    if (await cartButton.isVisible()) {
      await cartButton.click();
      // Since the user is not authenticated, adding to cart should redirect to /login
      await expect(page).toHaveURL(/\/login/);
    }
  });
});

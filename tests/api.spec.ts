import { test, expect } from "@playwright/test";

test.describe("Lumina Books REST API Automation Test Suite", () => {
  // Generate a random email to prevent database conflicts during multiple test runs
  const randomSuffix = Math.floor(Math.random() * 100000);
  const testUser = {
    name: "Auto Tester",
    email: `tester_${randomSuffix}@lumina.com`,
    password: "password123",
    confirmPassword: "password123",
  };

  test("Should execute the complete user and admin API flow serially", async ({ request }) => {
    // ----------------------------------------------------
    // 1. GUEST FLOW
    // ----------------------------------------------------
    // GET /api/books - List all books
    const getBooksRes = await request.get("/api/books");
    expect(getBooksRes.ok()).toBeTruthy();
    const books = await getBooksRes.json();
    expect(Array.isArray(books)).toBeTruthy();
    expect(books.length).toBeGreaterThan(0);

    const targetBook = books[0];
    const bookId = targetBook.id;

    // GET /api/books?search=... - Search book
    const searchRes = await request.get("/api/books", {
      params: { search: targetBook.title },
    });
    expect(searchRes.ok()).toBeTruthy();
    const searchResult = await searchRes.json();
    expect(searchResult.length).toBeGreaterThan(0);
    expect(searchResult[0].title).toBe(targetBook.title);

    // GET /api/books/:id - Get details
    const detailRes = await request.get(`/api/books/${bookId}`);
    expect(detailRes.ok()).toBeTruthy();
    const bookDetail = await detailRes.json();
    expect(bookDetail.id).toBe(bookId);

    // ----------------------------------------------------
    // 2. MEMBER SIGNUP & AUTHENTICATION
    // ----------------------------------------------------
    // POST /api/auth/signup - Create member account (Sets cookie)
    const signupRes = await request.post("/api/auth/signup", {
      data: testUser,
    });
    expect(signupRes.ok()).toBeTruthy();
    const signupData = await signupRes.json();
    expect(signupData.success).toBeTruthy();
    expect(signupData.user.email).toBe(testUser.email);

    // Verify duplicate signup fails
    const duplicateRes = await request.post("/api/auth/signup", {
      data: testUser,
    });
    expect(duplicateRes.status()).toBe(400);

    // Test Admin route protection: Normal member should get 403
    const forbiddenRes = await request.post("/api/admin/books", {
      data: {
        title: "Forbidden Book",
        author: "Hacker",
        price: 100,
        categoryId: 1,
        stock: 5,
      },
    });
    expect(forbiddenRes.status()).toBe(403);

    // POST /api/auth/logout - Log out
    const logoutRes = await request.post("/api/auth/logout");
    expect(logoutRes.ok()).toBeTruthy();

    // Verify logged out: Cart should return 401
    const unauthCartRes = await request.get("/api/cart");
    expect(unauthCartRes.status()).toBe(401);

    // POST /api/auth/login - Log back in
    const loginRes = await request.post("/api/auth/login", {
      data: {
        email: testUser.email,
        password: testUser.password,
      },
    });
    expect(loginRes.ok()).toBeTruthy();
    const loginData = await loginRes.json();
    expect(loginData.success).toBeTruthy();

    // ----------------------------------------------------
    // 3. CART OPERATIONS (As logged-in Member)
    // ----------------------------------------------------
    // POST /api/cart - Add to cart
    const addToCartRes = await request.post("/api/cart", {
      data: { bookId, quantity: 2 },
    });
    expect(addToCartRes.ok()).toBeTruthy();
    const addResult = await addToCartRes.json();
    expect(addResult.success).toBeTruthy();

    // GET /api/cart - Get cart items
    const getCartRes = await request.get("/api/cart");
    expect(getCartRes.ok()).toBeTruthy();
    const cartItems = await getCartRes.json();
    expect(cartItems.length).toBeGreaterThan(0);
    const cartItem = cartItems.find((item: any) => item.bookId === bookId);
    expect(cartItem).toBeDefined();
    expect(cartItem.quantity).toBe(2);
    const cartItemId = cartItem.id;

    // PUT /api/cart/:id - Update quantity
    const updateCartRes = await request.put(`/api/cart/${cartItemId}`, {
      data: { quantity: 4 },
    });
    expect(updateCartRes.ok()).toBeTruthy();

    // GET /api/cart - Verify updated quantity
    const verifyCartRes = await request.get("/api/cart");
    const verifyItems = await verifyCartRes.json();
    const updatedItem = verifyItems.find((item: any) => item.id === cartItemId);
    expect(updatedItem.quantity).toBe(4);

    // ----------------------------------------------------
    // 4. CHECKOUT & ORDERS (As logged-in Member)
    // ----------------------------------------------------
    // POST /api/orders - Create Order (Checkout)
    const checkoutRes = await request.post("/api/orders", {
      data: {
        email: testUser.email,
        firstName: "Auto",
        lastName: "Tester",
        address: "123 Test Road",
        city: "Test City",
        province: "Bangkok",
        postalCode: "10110",
        phone: "0812345678",
      },
    });
    expect(checkoutRes.ok()).toBeTruthy();
    const checkoutResult = await checkoutRes.json();
    expect(checkoutResult.success).toBeTruthy();
    const orderId = checkoutResult.orderId;
    expect(orderId).toBeDefined();

    // POST /api/orders/:id/payment - Upload slip
    const paymentRes = await request.post(`/api/orders/${orderId}/payment`, {
      data: {
        base64Image: "data:image/png;base64,iVBORw0KGgoAAAANS...",
      },
    });
    expect(paymentRes.ok()).toBeTruthy();

    // GET /api/orders - View user orders list
    const ordersRes = await request.get("/api/orders");
    expect(ordersRes.ok()).toBeTruthy();
    const ordersList = await ordersRes.json();
    const userOrder = ordersList.find((o: any) => o.id === orderId);
    expect(userOrder).toBeDefined();
    expect(userOrder.status).toBe("paid");

    // POST /api/orders/:id/cancel - Cancel order
    const cancelRes = await request.post(`/api/orders/${orderId}/cancel`);
    expect(cancelRes.ok()).toBeTruthy();

    // Verify cancellation
    const cancelVerifyRes = await request.get("/api/orders");
    const finalOrders = await cancelVerifyRes.json();
    const cancelledOrder = finalOrders.find((o: any) => o.id === orderId);
    expect(cancelledOrder.status).toBe("cancelled");

    // ----------------------------------------------------
    // 5. ADMIN FLOWS
    // ----------------------------------------------------
    // POST /api/auth/login - Login as Admin (Changes cookie)
    const adminLoginRes = await request.post("/api/auth/login", {
      data: {
        email: "admin@lumina.com",
        password: "admin123",
      },
    });
    expect(adminLoginRes.ok()).toBeTruthy();
    const adminData = await adminLoginRes.json();
    expect(adminData.user.role).toBe("admin");

    // POST /api/admin/books - Create new book
    const adminAddBookRes = await request.post("/api/admin/books", {
      data: {
        title: `Auto Test Book ${randomSuffix}`,
        author: "Playwright Automation",
        description: "Added automatically by API tests.",
        price: 250,
        originalPrice: 300,
        categoryId: 1, // นวนิยาย
        stock: 10,
        isBestSeller: false,
      },
    });
    expect(adminAddBookRes.ok()).toBeTruthy();
    const addBookResult = await adminAddBookRes.json();
    expect(addBookResult.success).toBeTruthy();
    const newBookId = addBookResult.book.id;

    // PUT /api/admin/orders/:id/status - Change status of our cancelled order to paid for confirmation testing
    const adminStatusRes1 = await request.put(`/api/admin/orders/${orderId}/status`, {
      data: { status: "paid" },
    });
    expect(adminStatusRes1.ok()).toBeTruthy();

    // POST /api/admin/orders/:id/confirm - Confirm payment
    const adminConfirmRes = await request.post(`/api/admin/orders/${orderId}/confirm`);
    expect(adminConfirmRes.ok()).toBeTruthy();

    // POST /api/admin/orders/:id/reject - Reject payment
    const adminRejectRes = await request.post(`/api/admin/orders/${orderId}/reject`);
    expect(adminRejectRes.ok()).toBeTruthy();

    // PUT /api/admin/orders/:id/status - Set to shipped
    const adminStatusRes2 = await request.put(`/api/admin/orders/${orderId}/status`, {
      data: { status: "shipped" },
    });
    expect(adminStatusRes2.ok()).toBeTruthy();

    // DELETE /api/admin/books/:id - Clean up created book
    const adminDeleteBookRes = await request.delete(`/api/admin/books/${newBookId}`);
    expect(adminDeleteBookRes.ok()).toBeTruthy();
  });
});

# ShopNest: Spring Boot + React e-commerce store

```
backend/    Spring Boot 3 (Java 17) + Spring Data JPA + JWT security   -> port 8080
frontend/   React 18 + Vite                                            -> port 5173
```

Features: product catalog with search, category and price filters, sorting; cart; checkout with
Cash on delivery / demo UPI / demo card; order history with cancel; Admin panel (dashboard,
products, categories, order status). Roles: CUSTOMER and ADMIN (JWT).

Product photos are Unsplash links stored in the database (no uploads). If a link fails, the shop shows
a placeholder. Admins can paste a new image link in Admin > Products.

## 1. Run the backend in Eclipse
1. Eclipse > **File > Import > Maven > Existing Maven Projects** > choose the `backend` folder > Finish.
2. Wait for Maven to download dependencies (internet needed the first time).
3. Right-click `EcommerceApplication.java` > **Run As > Java Application**.
4. It starts on http://localhost:8080 with an **in-memory H2 database** and sample products.
   Data resets on every restart. Check: http://localhost:8080/api/products

Admin login (created automatically): **admin@shop.com / Admin@123**. Customers use Register on the site.

## 2. Run the frontend
```
cd frontend
npm install
npm run dev
```
Open http://localhost:5173. In development Vite forwards `/api` to the backend (no CORS setup).

## 3. Use MySQL (Aiven / Clever Cloud / local) so data is kept
1. Create an empty database, e.g. `ecommerce_db`.
2. Edit `backend/src/main/resources/application-mysql.properties` (URL, user, password).
   Aiven needs `?sslMode=REQUIRED` at the end of the URL.
3. Run with profile `mysql`: Eclipse > Run Configurations > Environment > add
   `SPRING_PROFILES_ACTIVE` = `mysql` (or change `spring.profiles.active` in `application.properties`).
4. Tables are created automatically; the sample catalog is inserted only when the database is empty.

Free cloud databases can be paused or deleted when unused: keep a `mysqldump` backup of data you care about.

## 4. Put it live
**Backend (Render, Railway, Fly... using the Dockerfile)**, environment variables:
`SPRING_PROFILES_ACTIVE=mysql`, `DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET` (32+ random characters),
`ADMIN_PASSWORD` (change it!), `CORS_ALLOWED_ORIGINS=https://your-frontend-domain`.

**Frontend (Vercel / Netlify)**: root `frontend`, build `npm run build`, output `dist`,
env `VITE_API_URL=https://your-backend-domain/api`.

## API summary
Public: `POST /api/auth/register|login`, `GET /api/products?q=&category=&minPrice=&maxPrice=&sort=&page=&size=`,
`GET /api/products/featured`, `GET /api/products/{id}`, `GET /api/categories`.
Customer (Bearer token): `/api/cart`, `/api/orders`, `POST /api/orders/{id}/cancel`.
Admin: `/api/admin/stats|products|categories|orders`.

## Honest note
The Java code could not be compiled in the sandbox where it was written (Maven Central was blocked),
so your first Eclipse run is its first real compile. The React app was built and viewed. If you see an
error, send it and it will be fixed.

# Cartiva

Cartiva is a MERN-stack direct marketplace connecting independent sellers with customers.

## Core features

- Customer and seller registration/login with role-based access
- Seller product management with image URLs, pricing, stock, categories and descriptions
- Customer browsing, search, filtering, product details and cart
- Checkout with delivery name, phone, address, city, state and postal code
- Seller-specific order visibility
- Seller notifications for new orders
- Customer order history and status tracking
- Responsive React interface
- JWT authentication with HTTP-only cookies
- MongoDB data models for users, products, orders and notifications

## Structure

```
client/   React + Vite frontend
server/   Express + MongoDB backend
```

## Local setup

### Server

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

### Client

```bash
cd client
npm install
npm run dev
```

Set `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL` and `PORT` in `server/.env`.

## Stack

React, Vite, Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs

# React + TypeScript + Vite



# Pip POS & WhatsApp Ordering System

Pip is a modern Point of Sale (POS) and customer ordering platform designed for both in-store cashier use and direct customer engagement via WhatsApp. This project was built as a portfolio showcase, demonstrating full-stack skills in React, Firebase, and modern UI/UX best practices.

## Project Overview

Pip was developed to meet a real-world client need: a seamless POS system for staff, and a beautiful, user-friendly interface for customers to place orders directly from their devices. Orders placed by customers are sent to WhatsApp, streamlining communication and order management for the business.

### Key Features

- **POS Dashboard for Cashiers/Admins:**
  - Manage products, stock, and categories.
  - Real-time order creation and stock updates.
  - Analytics dashboard for sales, revenue, and low-stock alerts.

- **Customer Ordering Interface:**
  - Browse products by category with a modern, mobile-friendly UI.
  - Add items to cart and place orders directly to WhatsApp.
  - Order confirmation and WhatsApp integration for easy communication.

- **Admin Product Management:**
  - Add, edit, and delete products with image uploads.
  - Set product visibility and availability.
  - Manage stock and order IDs.

- **Technology Stack:**
  - **Frontend:** React, TypeScript, Tailwind CSS
  - **Backend:** Firebase Firestore & Storage
  - **Authentication:** Firebase Auth (for admin/cashier)
  - **Messaging:** WhatsApp integration for customer orders

## Why This Project?

Pip is a great example of a real-world, business-driven application that combines:

- Custom admin dashboards
- Real-time data and stock management
- Third-party messaging integration (WhatsApp)
- Clean, responsive design for both staff and customers

It demonstrates the ability to deliver a full solution from database to UI, with attention to usability and business needs.

## How It Works

- **Cashier/Admin:**
  - Log in to the dashboard to manage products and process in-store sales.
  - Orders update stock in real time and are tracked in the analytics dashboard.

- **Customer:**
  - Browse and add products to cart from the public interface.
  - Place an order, which generates a WhatsApp message with all order details, ready to send.

## Screenshots

> _Add screenshots here to showcase the UI for both admin and customer sides._

## Getting Started

1. Clone the repository.
2. Install dependencies with `npm install`.
3. Set up your Firebase project and add your config to `src/lib/firebase.ts`.
4. Run the app with `npm run dev`.

---

**Pip** is a portfolio project built to solve a real business problem, and to demonstrate expertise in building modern, integrated web applications.

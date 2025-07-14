# Unity Cup Demo API Documentation

This document outlines the backend API endpoint needed to support the Unity Cup demo checkout functionality.

## Base URL

All endpoints are relative to your API base URL (e.g., `http://localhost:5000` or `https://your-api.com`)

## Authentication

Demo endpoints do not require authentication as they are for demonstration purposes only.

## Primary Endpoint

### Process Demo Checkout

**Endpoint:** `POST /api/demo/checkout`

**Description:** Processes a demo checkout request, creates an order, generates tickets with QR codes, and automatically sends them via email to the customer. This is the only endpoint needed for the complete demo flow.

**Request Body:**

```json
{
    "selectedSeats": [
        {
            "id": "seat_123",
            "label": "A-15",
            "category": "VIP",
            "price": 50.0,
            "ticketType": "adult"
        }
    ],
    "userInfo": {
        "fullName": "John Doe",
        "email": "john.doe@example.com",
        "phone": "+1-555-123-4567",
        "dateOfBirth": "1990-01-15"
    },
    "totalAmount": 50.0,
    "currency": "USD",
    "eventDetails": {
        "name": "Unity Cup 2025 - Nigeria vs Jamaica",
        "date": "Friday, January 24, 2025",
        "time": "19:30 GMT",
        "venue": "Unity Stadium"
    }
}
```

**Response:**

```json
{
    "success": true,
    "orderId": "abc123def456",
    "message": "Checkout completed successfully. Tickets sent to customer email.",
    "emailSent": true,
    "tickets": [
        {
            "id": "ticket_789",
            "seatLabel": "A-15",
            "qrCode": "abc123def456-seat_123",
            "ticketType": "adult"
        }
    ]
}
```

**Error Response:**

```json
{
    "success": false,
    "message": "Error message describing what went wrong",
    "emailSent": false
}
```

## Additional Features

The checkout endpoint automatically handles:

1. **Order Creation**: Generates a unique order ID and stores order details
2. **Ticket Generation**: Creates individual tickets with unique QR codes
3. **Email Delivery**: Sends formatted email with ticket details and QR codes
4. **QR Code Generation**: Creates scannable codes in format: `{orderId}-{seatId}`

## Optional Endpoints (for advanced features)

### Verify Demo Ticket

**Endpoint:** `POST /api/demo/verify-ticket`

**Description:** Verifies a QR code at the venue entrance and marks the ticket as used.

**Request Body:**

```json
{
    "qrCode": "abc123def456-seat_123"
}
```

**Response:**

```json
{
    "success": true,
    "valid": true,
    "ticketInfo": {
        "orderId": "abc123def456",
        "seatLabel": "A-15",
        "eventName": "Unity Cup 2025 - Nigeria vs Jamaica",
        "eventDate": "Friday, January 24, 2025",
        "used": false
    },
    "message": "Ticket is valid"
}
```

**Invalid Ticket Response:**

```json
{
    "success": true,
    "valid": false,
    "message": "Invalid or already used ticket"
}
```

**Error Response:**

```json
{
    "success": false,
    "valid": false,
    "message": "Error verifying ticket"
}
```

## Implementation Notes

### Database Schema Suggestions

You'll need to store the following data:

**Orders Table:**

```sql
CREATE TABLE demo_orders (
  id VARCHAR(255) PRIMARY KEY,
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_phone VARCHAR(255),
  user_date_of_birth DATE,
  event_name VARCHAR(255) NOT NULL,
  event_date VARCHAR(255) NOT NULL,
  event_time VARCHAR(255) NOT NULL,
  event_venue VARCHAR(255) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Tickets Table:**

```sql
CREATE TABLE demo_tickets (
  id VARCHAR(255) PRIMARY KEY,
  order_id VARCHAR(255) NOT NULL,
  seat_id VARCHAR(255) NOT NULL,
  seat_label VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  ticket_type VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  qr_code VARCHAR(255) UNIQUE NOT NULL,
  used_at TIMESTAMP NULL,
  FOREIGN KEY (order_id) REFERENCES demo_orders(id)
);
```

### Email Template

The ticket email should include:

1. **Header:** Unity Cup branding and event details
2. **Order Summary:** Order ID, customer details, total amount
3. **Ticket Details:** Each ticket with QR code image
4. **Instructions:** How to use tickets at the venue
5. **Contact Information:** Support details

### QR Code Generation

Generate QR codes in the format: `{orderId}-{seatId}`

Example: `abc123def456-seat_123`

### Email Template

The ticket email should include:

1. **Header**: Unity Cup branding and event details
2. **Order Summary**: Order ID, customer details, total amount
3. **Ticket Details**: Each ticket with QR code image embedded
4. **Instructions**: How to use tickets at the venue
5. **Contact Information**: Support details

## Security Considerations

Even though this is a demo:

1. **Input Validation:** Validate all input data
2. **Rate Limiting:** Implement rate limiting to prevent abuse
3. **Email Throttling:** Limit email sending frequency per user
4. **QR Code Uniqueness:** Ensure QR codes are unique and secure

## Example cURL Commands

### Process Checkout (Primary endpoint)

```bash
curl -X POST http://localhost:5000/api/demo/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "selectedSeats": [{"id": "seat_123", "label": "A-15", "category": "VIP", "price": 50.00, "ticketType": "adult"}],
    "userInfo": {"fullName": "John Doe", "email": "john@example.com", "phone": "+1-555-123-4567", "dateOfBirth": "1990-01-15"},
    "totalAmount": 50.00,
    "currency": "USD",
    "eventDetails": {"name": "Unity Cup 2025", "date": "Friday, January 24, 2025", "time": "19:30 GMT", "venue": "Unity Stadium"}
  }'
```

### Verify Ticket (Optional)

```bash
curl -X POST http://localhost:5000/api/demo/verify-ticket \
  -H "Content-Type: application/json" \
  -d '{"qrCode": "abc123def456-seat_123"}'
```

## Implementation Summary

**Required**: Only the `/api/demo/checkout` endpoint is needed for the complete demo experience.

**Optional**: The `/api/demo/verify-ticket` endpoint can be implemented for venue staff to scan and verify tickets.

The checkout endpoint should handle all aspects of the transaction:

1. Process payment simulation
2. Generate order and tickets
3. Create QR codes
4. Send email with tickets
5. Return confirmation to frontend

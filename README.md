# crmApp

crmApp is a REST API for a customer-support ticketing system. Customers raise support tickets, tickets are automatically assigned to an approved engineer, and administrators manage user accounts and oversee all tickets. Every ticket carries a priority and a status, and the people involved in a ticket can leave comments on it. The service is built with Node.js, Express 5 and MongoDB (via Mongoose), and secures its endpoints with JSON Web Tokens and bcrypt-hashed passwords.

## Features

- User registration and sign-in with bcrypt password hashing and JWT access tokens.
- Three user types (`CUSTOMER`, `ENGINEER`, `ADMIN`) with an approval workflow: customers are approved automatically, while engineer and admin sign-ups start as `PENDING` until an administrator approves them.
- Administrator endpoints to list users (filterable by type and status), fetch a user, change a user's status or type, and delete a user.
- Ticket creation with a 1-5 priority scale and automatic assignment to an approved engineer.
- Role-aware ticket listing: admins see every ticket, engineers see tickets assigned to them, customers see tickets they reported.
- Ticket updates (title, description, priority, status, assignee) restricted to the ticket's reporter, its assignee, or an admin. Ticket statuses are `OPEN`, `CLOSED` and `BLOCKED`.
- Comments on tickets, restricted to the reporter, assignee, or an admin.
- A default administrator account is seeded automatically the first time the server connects to the database.
- Request-body validation middleware that returns descriptive `400` errors for missing or invalid fields.

## Roles and permissions

| User type  | How it is obtained | What it can do |
|------------|--------------------|----------------|
| `CUSTOMER` | Default when signing up without a `userType`. Status is `APPROVED` immediately. | Sign in; create tickets; view, update and comment on tickets they reported; list comments on any ticket. |
| `ENGINEER` | Sign up with `"userType": "ENGINEER"`, or be promoted by an admin. Sign-ups start as `PENDING` and must be approved by an admin before the user can sign in. | Everything a customer can do, plus view, update and comment on tickets assigned to them. Approved engineers are eligible for automatic ticket assignment. |
| `ADMIN`    | Seeded `admin` account, or sign up with `"userType": "ADMIN"` (starts `PENDING`) and get approved, or be promoted by an existing admin. | Everything above, plus: list and view users, approve/reject users, change a user's type, delete users, and view, update and comment on any ticket. |

User statuses are `APPROVED`, `PENDING` and `REJECTED`. Only users whose status is `APPROVED` can sign in.

## Tech stack

- Node.js (20.19 or later, required by Mongoose 9)
- Express `^5.2.1` - HTTP server and routing
- Mongoose `^9.1.3` - MongoDB object modelling
- jsonwebtoken `^9.0.3` - JWT creation and verification
- bcryptjs `^3.0.3` - password hashing
- dotenv `^17.2.3` - loads environment variables from `.env`

## Project structure

```
crmApp/
├── index.js                            # Entry point: loads .env, starts Express, connects to MongoDB, seeds the default admin, mounts routes
├── configs/
│   └── auth.config                     # JWT signing secret used by the auth controller and middleware
├── controllers/
│   ├── auth.controller.js              # signUp, signIn
│   ├── user.controller.js              # Admin-only user management
│   ├── ticket.controller.js            # Ticket creation, update and role-aware retrieval
│   └── comment.controller.js           # Create and list comments on a ticket
├── middleWares/
│   ├── auth.mw.js                      # Sign-up/sign-in body validation, JWT verification (validateToken), admin check (isAdmin)
│   ├── verifyTicketRequestBody.mw.js   # Ticket body validation and status validation
│   └── verifyCommentRequestBody.mw.js  # Comment body and ticketId validation
├── models/
│   ├── user.model.js                   # User schema
│   ├── ticket.model.js                 # Ticket schema
│   └── comment.model.js                # Comment schema
├── routes/
│   ├── auth.route.js                   # /auth/signup, /auth/signin
│   ├── user.route.js                   # User management routes
│   └── ticket.route.js                 # Ticket and comment routes
├── utils/
│   ├── constants.js                    # USER_TYPES, USER_STATUS, ticketStatuses
│   └── objectConverter.js              # Shapes user documents for responses (omits the password hash)
├── package.json
└── .gitignore                          # Ignores node_modules/ and .env
```

## Getting started

### Prerequisites

- Node.js 20.19 or later and npm
- A running MongoDB instance (local or hosted, e.g. MongoDB Atlas)

### Installation

```bash
git clone https://github.com/dnathkoushik/crmApp.git
cd crmApp
npm install
```

### Environment variables

Create a `.env` file in the project root (it is git-ignored). The application reads the following variables:

```env
# Port the HTTP server listens on. Optional; defaults to 7777.
PORT=7777

# MongoDB connection string. Required.
MONGODB_URI=mongodb://localhost:27017/crmApp
```

### Run

There is no `start` script in `package.json`, so start the server directly:

```bash
node index.js
```

On start-up the server:

1. Listens on `PORT` (default `7777`) and logs `Server is running on port <PORT>`.
2. Connects to MongoDB using `MONGODB_URI`.
3. Looks for a user with `userId` `admin`. If none exists it creates one with `userType` `ADMIN` and logs `Admin user created`; otherwise it logs `Admin user already exists`. The seeded admin's password is hard-coded in `connectDB()` in `index.js` - change it before running the service anywhere shared.

All routes are mounted under the base path:

```
http://localhost:7777/crmApp/api/v1
```

Requests with a body must be sent as JSON (`Content-Type: application/json`).

## API reference

### Authentication

Sign in to receive an `accessToken`. Pass it on every protected request in the `x-access-token` header. Tokens are signed with the user's `userId` and expire **120 seconds** after they are issued.

| Situation | Status | Body |
|-----------|--------|------|
| Header missing | `403` | `{ "message": "No token provided!" }` |
| Token invalid or expired | `401` | `{ "message": "Unauthorized!" }` |
| Non-admin calling an admin-only route | `403` | `{ "message": "Require Admin Role!" }` |

In the tables below, paths are relative to `/crmApp/api/v1`.

### Auth

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/auth/signup` | Public | Register a user. Body: `name`, `userId`, `email`, `password` (required), `userType` (optional; one of `CUSTOMER`, `ENGINEER`, `ADMIN`). `userId` and `email` must be unique. Customers are created `APPROVED`; other types are created `PENDING`. |
| `POST` | `/auth/signin` | Public | Authenticate with `userId` and `password`. Fails with `400` if the user does not exist or is not `APPROVED`, and `401` if the password is wrong. Returns the user's profile and an `accessToken`. |

### Users

All user-management routes require a valid token **and** the `ADMIN` user type.

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/users` | `ADMIN` | List users. Optional query parameters `userType` and `userStatus` filter the result. Passwords are never returned. |
| `GET` | `/users/:userId` | `ADMIN` | Fetch a single user by `userId`. `404` if not found. |
| `PUT` | `/auth/changeStatus/:userId` | `ADMIN` | Set a user's status. Body: `{ "userStatus": "APPROVED" \| "PENDING" \| "REJECTED" }`. Used to approve pending engineers and admins. |
| `PUT` | `/auth/changeType/:userId` | `ADMIN` | Set a user's type. Body: `{ "userType": "CUSTOMER" \| "ENGINEER" \| "ADMIN" }`. |
| `DELETE` | `/users/deleteUser/:userId` | `ADMIN` | Delete a user by `userId`. `404` if not found. |

### Tickets

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/tickets` | Any authenticated user | Create a ticket. Body: `title`, `description` (required), `ticketPriority` (optional number 1-5, default `4`), `status` (optional, default `OPEN`). The caller becomes the `reporter`. The ticket is assigned to the first `APPROVED` `ENGINEER` found; if there is none it is created unassigned. |
| `GET` | `/tickets` | Any authenticated user | List tickets visible to the caller: `ADMIN` gets all tickets, `ENGINEER` gets tickets where `assignee` is the caller, everyone else gets tickets where `reporter` is the caller. |
| `GET` | `/tickets/:ticketId` | Reporter, assignee or `ADMIN` | Fetch one ticket by its MongoDB `_id`. Other users receive `403`. |
| `PUT` | `/tickets/:ticketId` | Reporter, assignee or `ADMIN` | Update any of `title`, `ticketPriority`, `description`, `status`, `assignee`. Fields not supplied keep their current value. `status`, if present, must be `OPEN`, `CLOSED` or `BLOCKED`. Other users receive `403`. |

### Comments

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/tickets/:ticketId/comments` | Reporter, assignee or `ADMIN` | Add a comment to a ticket. Body: `commentText` (required, non-empty). `400` if the ticket does not exist; `403` for users not involved in the ticket. The caller is recorded as `commenter`. |
| `GET` | `/tickets/:ticketId/comments` | Any authenticated user | List all comments on a ticket. |

### Examples

#### Sign up

`POST /crmApp/api/v1/auth/signup`

```json
{
  "name": "Jane Doe",
  "userId": "jane.doe",
  "email": "jane.doe@example.com",
  "password": "Str0ngPass!"
}
```

Response `201 Created` (no `userType` was given, so the account is a `CUSTOMER` and is approved immediately):

```json
{
  "name": "Jane Doe",
  "userId": "jane.doe",
  "email": "jane.doe@example.com",
  "userType": "CUSTOMER",
  "userStatus": "APPROVED",
  "createdAt": "2026-09-06T10:15:30.000Z",
  "updatedAt": "2026-09-06T10:15:30.000Z"
}
```

To register an engineer, add `"userType": "ENGINEER"` to the body. The response will show `"userStatus": "PENDING"`; an admin must then call `PUT /auth/changeStatus/jane.doe` with `{ "userStatus": "APPROVED" }` before that user can sign in.

#### Sign in

`POST /crmApp/api/v1/auth/signin`

```json
{
  "userId": "jane.doe",
  "password": "Str0ngPass!"
}
```

Response `200 OK`:

```json
{
  "name": "Jane Doe",
  "userId": "jane.doe",
  "email": "jane.doe@example.com",
  "userStatus": "APPROVED",
  "userType": "CUSTOMER",
  "accessToken": "<jwt>"
}
```

#### Create a ticket

`POST /crmApp/api/v1/tickets` with header `x-access-token: <jwt>`

```json
{
  "title": "Cannot reset password",
  "description": "The reset link in the email returns a 404.",
  "ticketPriority": 2
}
```

Response `201 Created` (the full ticket document; `assignee` is present only if an approved engineer existed):

```json
{
  "_id": "66d9a1f2c3b4a5d6e7f80912",
  "title": "Cannot reset password",
  "ticketPriority": 2,
  "description": "The reset link in the email returns a 404.",
  "status": "OPEN",
  "reporter": "jane.doe",
  "assignee": "eng.ravi",
  "createdAt": "2026-09-06T10:20:05.000Z",
  "updatedAt": "2026-09-06T10:20:05.000Z",
  "__v": 0
}
```

## Data models

All schemas have `timestamps: true`, so every document also carries `createdAt` and `updatedAt`.

- **User** (`models/user.model.js`)
  - `name` - String, required
  - `userId` - String, required, unique; used as the public identifier and in JWTs
  - `password` - String, required, minimum length 7; stored as a bcrypt hash
  - `email` - String, required, unique, lower-cased, minimum length 10
  - `userType` - String enum `CUSTOMER` | `ENGINEER` | `ADMIN`, default `CUSTOMER`
  - `userStatus` - String enum `APPROVED` | `PENDING` | `REJECTED`, default `APPROVED`

- **Ticket** (`models/ticket.model.js`)
  - `title` - String, required
  - `description` - String, required
  - `ticketPriority` - Number, required, default `4` (the API accepts 1-5)
  - `status` - String enum `OPEN` | `CLOSED` | `BLOCKED`, default `OPEN`
  - `reporter` - String, required; the `userId` of the user who created the ticket
  - `assignee` - String, optional; the `userId` of the engineer the ticket is assigned to

- **Comment** (`models/comment.model.js`)
  - `ticketId` - ObjectId referencing `Ticket`, required
  - `commenter` - String, required; the `userId` of the author
  - `commentText` - String, required

## Notes

- The JWT signing secret currently lives in `configs/auth.config` and the seeded admin password in `index.js`. Both should be moved to environment variables (for example `JWT_SECRET` and `ADMIN_PASSWORD`) and rotated before the service is deployed.
- Access tokens expire after 120 seconds; clients need to sign in again once a token expires.

## Author

**Koushik Debnath**

- GitHub: [github.com/dnathkoushik](https://github.com/dnathkoushik)
- LinkedIn: [linkedin.com/in/dnathkoushik](https://www.linkedin.com/in/dnathkoushik/)

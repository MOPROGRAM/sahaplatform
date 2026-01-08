# Saha Protocol Specification (ساحة)

## 1. Authentication
All private requests must include the `Authorization` header:
`Authorization: Bearer <JWT_TOKEN>`

## 2. Ads Endpoints
| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/api/ads` | List all ads | `category, location, searchQuery, minPrice, maxPrice` |
| GET | `/api/ads/:id`| Get ad details | - |
| POST | `/api/ads` | Create new ad | - |
| PATCH | `/api/ads/:id`| Update ad | - |

## 3. Messaging (Socket.io Events)
- `join_room`: Joins a chat room based on `adTitle_userId`.
- `send_message`: Emits a message object.
- `receive_message`: Listen for incoming messages.

## 4. Roles & Permissions
- `USER`: Can post, edit, and delete their own ads.
- `MERCHANT`: Features include "Verified Badge" and "Bulk Ads Upload".
- `ADMIN`: Full access to moderate content and users.

# Security Specification for SwiftSell

## 1. Data Invariants
- Each user has a unique profile in `/users/{userId}`.
- All business data (products, orders, customers, expenses) is nested under the user's document path to ensure strict isolation.
- `ownerId` field in documents must match the `userId` in the path and the `request.auth.uid`.
- PIN must be exactly 4 digits.
- XP must only be incremented, never decremented by the user.

## 2. The "Dirty Dozen" Payloads (Deny Test Cases)
1. **Identity Theft**: `set /users/victimId { "uid": "victimId", "pin": "1234" }` (as `attackerId`)
2. **PIN Hack**: `update /users/victimId { "pin": "0000" }`
3. **Prying Eyes**: `get /users/victimId/orders/order123`
4. **Data Corruption**: `set /users/myId/products/p1 { "cost": -100, ... }`
5. **Inventory Sabotage**: `update /users/victimId/products/p1 { "stock": 0 }`
6. **ID Injection**: `set /users/myId/products/very_long_id_..._over_128_chars { ... }`
7. **Terminal State Bypass**: `update /users/myId/orders/deliveredOrder { "totalAmount": 0 }`
8. **Immutability Breach**: `update /users/myId/orders/order1 { "createdAt": "2000-01-01" }`
9. **Level Up Glitch**: `update /users/myId { "xp": 9999999 }`
10. **Cross-User Order Injection**: `set /users/myId/orders/order1/items/item1 { "orderId": "victimOrder", ... }`
11. **Mass Scraping**: `list /users`
12. **Ghost Writing**: `set /users/myId/expenses/e1 { "ownerId": "victimId", ... }`

## 3. Red Team Assessment
| Collection | Identity Spoofing | State Shortcutting | ID Poisoning |
| :--- | :--- | :--- | :--- |
| users | Protected | Protected | Protected |
| products | Protected | N/A | Protected |
| orders | Protected | Protected | Protected |
| expenses | Protected | N/A | Protected |

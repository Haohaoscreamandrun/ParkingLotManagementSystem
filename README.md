# Parking Lot Management & Online Payment System

## Main Services

### Parking Lot Managing Main Process

1. Vehicle enters, client system reads the license plate number and captures vehicle photo. Front-end verifies the license plate number, then calls system API with license plate number and photo URL.
2. System API receives the license plate number:
   - Checks remaining parking spaces; if available, sends gate open signal.
   - If no spaces available, system returns "Parking full" message.
3. System retrieves license plate number and vehicle photo URL, begins calculating parking fee duration.
4. User wishes to exit, inputs license plate number on client side, which sends it to the backend system.
5. Backend system receives license plate number, searches for similar entries in the database, returns multiple vehicle photo URLs.
6. User selects vehicle from photos and confirms desired payment platform, calls backend payment API.
7. System calculates parking fee amount based on exit time.
8. System integrates with user-selected platform for payment processing:
   - Cloud-based electronic invoice service?
9. Payment successful, system grants "exit allowed" status to vehicle for 15 minutes.
   - If vehicle information isn't removed after 15 minutes, system restarts entry time calculation.
10. Vehicle exits, client system reads license plate number, front-end verifies the number, calls system API with license plate number.
11. System API receives license plate number:
    - Backend verifies vehicle in system with "exit allowed" status, sends gate open message. System deletes vehicle information and updates remaining space count.
    - Backend verifies vehicle in system without "exit allowed" status, returns message to pay via cloud system.
    - Backend does not find vehicle record in system, returns message of no entry record for the vehicle.

### Parking Lot Admin System

User with admin privilege can:

1. Check all parking lots which belongs to admin themselves.
2. Check all the cars information in below list which parks in the parking lot:
   - Cars photo
   - Recognized license plate number
   - Car's enter timestamp
   - Subtotal parking fee
   - Payment status
3. Update the recognized plate number and payment status manually.
4. Delete car information from database if the parking fee is paid.

### User Friendly: Empty Lots Searching Function

1. 15 nearest parking lots within 3km from user will be shown on map for user to choose from.
2. Website will return realtime vacancy of parking lot when you click on them (either on list or map).

## Utilized Package

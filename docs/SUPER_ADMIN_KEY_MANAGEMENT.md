# Super Admin Management

This document provides information about the super admin functionality and how to manage it. This document should be kept secure and shared only with authorized personnel.

## Overview

The application includes two types of super admin functionality:

1. **Hard-coded System Super Admin**: A permanent super admin account that is automatically created when the application starts.
2. **User-created Super Admins**: Additional super admin accounts that can be created using a secret key.

## Secret Key Management

### Accessing the Key Management Page

The key management page is intentionally hidden and can be accessed in one of two ways:

1. **Direct URL with Access Token**:

   - URL: `/system-maintenance/security/key-management/maintenance-security-key-8675309`
   - This URL includes a special access token that grants access to the key management page
   - This method is useful if you've lost both the super admin credentials and the current secret key

2. **As a Logged-in Super Admin**:
   - Any user with the SUPER_ADMIN role can access the key management page using the same URL pattern
   - The system will recognize your role and grant access without validating the token

### Regenerating the Secret Key

There are three ways to regenerate the secret key:

1. **As a Logged-in Super Admin**:

   - Log in with your super admin credentials
   - Navigate to the key management URL
   - Click "Regenerate Secret Key" (no need to enter the current key)

2. **Using the Current Secret Key**:

   - Navigate to the key management URL
   - Enter the current secret key in the form
   - Click "Regenerate Secret Key"

3. **Using the Emergency Access Token**:
   - If both the super admin credentials and the secret key are lost, you can use the emergency access token
   - The emergency access token is: `maintenance-security-key-8675309`
   - This should be used only in emergency situations

### After Regeneration

After regenerating the key:

- The new key will be displayed on the screen
- Make sure to copy and store this key securely
- The old key will no longer be valid
- All super admin creation attempts will require the new key

## Creating a Super Admin

To create a super admin:

1. Navigate to `/super-admin-creation`
2. Fill out the form with the required information
3. Enter the current secret key
4. Click "Create Super Admin"

## Security Considerations

1. **Key Storage**: The secret key is stored in a JSON file in the `data` directory. In a production environment, consider using a more secure storage mechanism.

2. **Access Control**: The key management page is hidden and requires either super admin credentials or the special access token.

3. **Audit Trail**: The system logs key regeneration events. In a production environment, consider implementing a more robust audit trail.

4. **Emergency Access**: The emergency access token should be kept secure and used only when necessary.

## In Case of Key Loss

If you've lost the secret key and don't have super admin access:

1. Use the emergency access token to access the key management page
2. Regenerate the key
3. Use the new key to create a new super admin

If you've lost both the secret key and the emergency access token:

1. Delete the `data/superadmin_key.json` file
2. The system will revert to the default key: `super_admin_secret_key_8675309`
3. Use this default key to create a new super admin or regenerate a new key

## System Super Admin

The system automatically creates a permanent super admin account with the following credentials:

- Email: `system.admin@university.edu`
- Password: `SuperAdmin123`
- Role: `SUPER_ADMIN`

This account:

- Is created automatically when the application starts
- Cannot be deleted through the normal user interface
- Will be recreated if deleted from the database
- Is marked as a system user with the `isSystemUser` flag

**IMPORTANT**: In a production environment, you should change the default password immediately after the first login.

## Important URLs

- Super Admin Creation: `/super-admin-creation`
- Super Admin Dashboard: `/super-admin`
- Key Management: `/system-maintenance/security/key-management/maintenance-security-key-8675309`

## Important Tokens

- Emergency Access Token: `maintenance-security-key-8675309`
- Default Secret Key (if key file is missing): `super_admin_secret_key_8675309`

**IMPORTANT**: Keep this document and these tokens secure. They provide full access to the system.

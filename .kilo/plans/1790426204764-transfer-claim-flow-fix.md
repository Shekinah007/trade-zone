# Fix: Transfer Claim Flow for Non-Member Registration

## Problem Summary

When a registered user transfers a property to a non-member's email:
1. TransferRequest is created with a `token` but no `toUser`
2. Email sent with claim link: `/claim/<token>`
3. Non-member clicks link → `/claim/<token>` page
4. If not authenticated, sees "Create Account to Claim" button linking to `/auth/signup?callbackUrl=/claim/<token>`
5. **BUG**: Signup page ignores `callbackUrl` and redirects to `/auth/signin` after registration
6. **BUG**: Signin page ignores `callbackUrl` and redirects to `/` after signin
7. User never returns to `/claim/<token>` to complete the claim
8. Transfer stays in `pending` state, never associated with new user

## Root Cause

The `callbackUrl` query parameter is passed through the flow but never consumed:
- `/auth/signup?callbackUrl=/claim/<token>` → signup page doesn't read it
- `/auth/signin?callbackUrl=/claim/<token>` → signin page doesn't read it

## Files to Modify

1. **`app/auth/signup/page.tsx`** - Read `callbackUrl` from query params, redirect after successful registration
2. **`app/auth/signin/page.tsx`** - Read `callbackUrl` from query params, redirect after successful signin

## Solution Approach

### Option A: Minimal Fix (Recommended)
- Signup page: After registration, redirect to `/auth/signin?callbackUrl=<original_callbackUrl>`
- Signin page: After signin, redirect to `callbackUrl` if present, else `/`

### Option B: Better UX
- Signup page: After registration, auto-signin user via `signIn("credentials", ...)` then redirect to `callbackUrl`
- Signin page: After signin, redirect to `callbackUrl` if present, else `/`

## Implementation Plan

### Task 1: Fix Signup Page
- Read `callbackUrl` from `useSearchParams()`
- Pass it to signin redirect after registration
- Or auto-signin and redirect directly

### Task 2: Fix Signin Page
- Read `callbackUrl` from `useSearchParams()`
- Use it in `signIn("credentials", { callbackUrl })` or manual redirect after success

### Task 3: Test the Flow
- Create transfer to non-member email
- Click claim link
- Signup with callbackUrl
- Verify transfer appears in dashboard → Transfers tab

## Edge Cases
- Invalid/expired token → claim page should show error
- User already registered with same email → should signin instead
- OAuth signin → needs callbackUrl handling in signIn calls

## Validation
- Manual test: Transfer to new email → claim → signup → verify transfer appears in dashboard
- Verify incoming transfers API returns claimed transfer
- Verify item ownership transfers correctly after accept
# 977Cinema Customer App Guidelines

## Scope

- Work only inside `booking-customer`.
- Do not edit, patch, format, or modify `booking-admin` or the backend.
- Use `booking-admin` and the backend only as read-only references for conventions, reusable UI patterns, and API contracts.
- This app covers the customer experience: homepage, movie browsing, city/venue/showtime selection, seat selection, auth, Stripe checkout, dashboard, bookings, payments, settings, and related pages.

## Structure

- Organize by feature:

```text
features/
  feature-name/
    components/
    middleware/
    pages/
    validations/
    types/
    utils/
    store/
    services/
```

- Keep reusable app-wide code in `shared/`.
- Keep route files in `routes/`; route files should mostly import feature pages, guards, and loaders.
- Move code to `shared/` only when it is genuinely reused across features.

## Admin And Backend References

- Before building customer functionality, check `booking-admin` for an existing pattern or reusable component and mirror it when it fits.
- If unsure about structure, code style, libraries, routing, API services, forms, validation, or UI components, inspect `booking-admin` first.
- For API work, align with backend:
  - `src/db/schema.ts` for columns, enums, ids, nullability, timestamps.
  - `src/modules/*/*.router.ts` for paths, methods, auth, mounting.
  - `src/modules/*/*.schemas.ts` for body/query/param validation.
  - `src/modules/*/*.service.ts` for returned field names and payloads.
- Backend responses use `{ data: ... }`; errors use `{ error: { code, message, details? } }`; paginated lists use `{ items, page, limit, total }`.
- Backend ids are UUID strings and date/time values are ISO strings.

## API, Auth, And State

- Use Axios through the shared `apiClient`.
- Configure `VITE_API_BASE_URL` for `/api/v1`, for example `http://localhost:<backend-port>/api/v1`.
- Backend auth uses HttpOnly cookies, so keep `withCredentials: true`.
- Do not add bearer-token auth unless the backend contract changes.
- Use Axios interceptors for global API behavior such as `401` logout/redirect.
- Use TanStack Router `beforeLoad` for route protection; do not put auth guards inside page components when a route guard fits.
- Use Zustand only for reusable app/feature state or shared backend-loaded data.
- Do not put one-off form drafts, validation errors, submit handlers, or section-specific methods into stores. Independent form sections should keep those locally.
- TanStack Query may be added for server state such as caching, pagination, refetching, and mutations.

## UI And Styling

- Customer UI is public-facing; prioritize polish, clarity, responsive behavior, easy booking flows, scannable movie information, and confident calls to action.
- Admin UI is intentionally simpler for internal users; do not copy its visual plainness when customer polish matters.
- Use Tailwind CSS and shared theme tokens such as `primary`, `secondary`, and `teal`.
- Focus on light mode only unless dark mode is explicitly requested.
- Use shared shadcn-style/Radix components from `src/shared/components/ui` when available.
- Do not hand-roll complex accessible primitives when a shared component or Radix primitive exists.
- Use image URLs from Unsplash or similar reputable sources when helpful for richer customer-facing pages.
- Use toast notifications for success/error feedback where appropriate. This app exposes `toast.success` and `toast.destructive`; there is no `toast.error`.
- Use Title Case for title-like UI text: headings, section labels, card titles, button labels, nav labels, table headers, badges, and short actions. Use sentence case for longer helper text, validation messages, and paragraphs when more readable.

## Booking And Payments

- Seat selection should follow the backend socket guide and treat REST seat-map reads as the source of truth.
- Socket events should update UI quickly and trigger refetch/reconciliation where needed.
- Anonymous users may view and hold seats via device token; checkout/payment requires login.
- Stripe Checkout payment completion depends on backend webhook processing. Do not fake paid state on the frontend.
- Saved payment methods may exist in settings, but use them in booking only when the backend checkout contract supports it.

## Coding Style

- Import order:
  1. React and third-party packages.
  2. Feature-relative imports.
  3. `#/shared/...` imports.
- Use explicit `type` imports, including mixed imports such as `useState, type SubmitEvent`.
- Prefer feature-relative imports within a feature and `#/shared/...` for shared code.
- Define page-local types near imports, then constants, then the component.
- In page components, keep local state first, router hooks next, store selectors/actions after that when practical.
- Use named event handlers before JSX returns and early returns for validation failures.
- Keep JSX readable with blank lines between logical UI blocks.
- Use `aria-invalid` and `aria-describedby` for form error states.
- Use shared validation helpers such as `getFormValidationErrors`.
- Let `oxfmt` handle formatting; do not add Prettier.

# 977Cinema Customer App Guidelines

## Project Scope

- Work only on the customer-facing app inside `booking-customer`.
- Do not edit, patch, format, or otherwise modify `booking-admin`.
- Do not edit, patch, format, or otherwise modify the backend project.
- `booking-admin` and the backend may be inspected only as read-only sources of product context, UI conventions, and API contract truth.
- If unsure about project structure, code conventions, library usage, shared component patterns, routing style, API client setup, validation style, or other implementation preferences, inspect `booking-admin` as a read-only reference and mirror the relevant established pattern in `booking-customer`.
- This chat is focused on the customer side of 977Cinema: homepage, movie browsing, city and venue selection, showtime selection, seat selection, customer authentication, Stripe payment flow, customer dashboard, bookings, and related customer-facing pages.

## Feature-Based Structure

- Organize code by feature.
- Each feature should keep its own related files together:

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

- `components/`: UI components specific to the feature.
- `middleware/`: feature-specific route guards, middleware-style helpers, and access-control checks.
- `pages/`: route-level screens for the feature.
- `validations/`: Zod schemas and feature validation rules.
- `types/`: TypeScript domain types, DTOs, request types, and response types.
- `utils/`: feature-specific helpers, mappers, and formatters.
- `store/`: Zustand state related to the feature.
- `services/`: API functions tied to the feature.
- Keep shared, reusable app-wide code in `shared/`.
- Keep route files in `routes/`, and have them import feature pages.

## Customer Features

- Prefer feature folders such as:

```text
features/
  home/
  movies/
  city-selection/
  venues/
  showtimes/
  seat-selection/
  booking/
  payments/
  auth/
  customer-dashboard/
  settings/
```

- Keep route-level files lightweight. They should mostly compose feature pages, route guards, and loaders.
- Keep business logic close to the customer feature it belongs to. Move code to `shared/` only when it is reused across features.

## API And State

- Use Axios for HTTP requests through the shared API client.
- Use the shared API client for centralized behavior such as base URL, cookie credentials, and response interceptors.
- The backend API is mounted under `/api/v1`; set `VITE_API_BASE_URL` accordingly, such as `http://localhost:<backend-port>/api/v1`.
- The backend uses HttpOnly cookie sessions, so `apiClient` must send `withCredentials: true`.
- Do not add bearer-token Authorization headers unless the backend auth contract changes.
- Use Axios interceptors for global API concerns such as handling `401` responses and forcing logout when the customer session expires.
- Use Zustand for global client state such as auth state, logout behavior, selected city, booking draft, and other app-level state.
- TanStack Query can be added for server-state concerns such as caching, loading states, pagination, refetching, and mutations.
- Feature services should expose clean API methods such as `moviesApi.list()`, `moviesApi.get(id)`, `showtimesApi.listByMovie(id)`, and `bookingsApi.create(payload)`.

## Backend Contract

- Keep frontend API services, DTOs, and validation schemas aligned with the backend source when API details are needed.
- Backend source is read-only.
- Backend source folders of interest:
  - `src/db/schema.ts` for database columns, ids, enums, nullability, and timestamps.
  - `src/modules/*/*.router.ts` for route paths, HTTP methods, auth middleware, and mounted behavior.
  - `src/modules/*/*.schemas.ts` for request body/query/param validation.
  - `src/modules/*/*.service.ts` for returned field names and response payload contents.
- Backend success responses use `{ data: ... }`.
- Backend error responses use `{ error: { code, message, details? } }`.
- Backend paginated list payloads use `{ items, page, limit, total }`.
- Backend ids are UUID strings, not numbers.
- Backend date/time values should be treated as ISO strings in the frontend.
- Use Luxon for date-related validation, parsing, comparison, and formatting unless built-in `Date` provides the right simple UI/calendar operation.

## Routing And Auth Protection

- Use TanStack Router for routing.
- Use `beforeLoad` to decide whether a route is auth-protected.
- Group protected customer routes under a pathless protected route.
- Group public routes under a pathless public route where helpful.
- Customer-only areas such as dashboard, booking history, profile, and checkout confirmation should be protected when the backend requires an authenticated customer.
- Public auth routes that should be hidden from signed-in customers should use a shared redirect guard.
- Put middleware and route guards inside the respective feature `middleware/` folder, such as `features/auth/middleware`.
- Do not put route-protection checks inside page components when `beforeLoad` can handle them.
- Keep route files in `routes/`, and import feature pages and route guards from their feature folders.

## Styling

- Use Tailwind CSS for styling throughout the app.
- Focus only on light mode. Do not add dark theme variants, dark-mode tokens, or dark-mode-specific styling unless the user explicitly asks for dark mode later.
- Use CSS theme tokens such as `primary`, `secondary`, `teal`, and other shared tokens for centralized theming.
- Prefer Tailwind utility classes for component and layout styling.
- Create custom CSS only when it is needed to achieve a specific UI style that is awkward or unsuitable with Tailwind utilities.
- If a style is global, such as scrollbar styling, app background, selection color, or base document styling, add it to the global stylesheet.
- If a style is local to a component or page, use Tailwind CSS instead of global CSS.
- Keep the customer UI polished, clear, and conversion-friendly while staying practical for booking workflows.
- Remember that the admin app is intentionally simple because it is for internal users. The customer app is public-facing, so put more effort into visual design, usability, page composition, interaction states, responsive behavior, and overall polish.
- Customers should feel the app is attractive, easy to understand, and easy to use. Prioritize clear booking flows, approachable copy, scannable movie information, and confident calls to action.
- Use image URLs from Unsplash and similar reputable image sources when helpful to make customer-facing pages feel richer and more polished. Prefer images that support the booking context, such as cinema interiors, movie posters, audiences, seats, screens, tickets, and venue experiences.

## UI Components

- Use shared shadcn-style components in `src/shared/components/ui` when available.
- Prefer Radix-based shared components for behavior-heavy UI such as dialogs, dropdown menus, selects, popovers, tabs, checkboxes, labels, tooltips, and autocomplete/command experiences.
- Do not hand-roll complex accessible primitives when a shared UI component or Radix primitive already exists.
- Keep shared UI components Tailwind-first, token-based, and light-mode-only.

## Coding Style

- Follow the admin app preferences where they sensibly apply to customer code.
- Order imports in groups separated by blank lines:
  1. React and third-party package imports.
  2. Feature-relative imports such as `../store`, `../validations`, and `../types`.
  3. Shared alias imports from `#/shared`.
- Keep type imports explicit with `type`, including mixed React imports such as `useState, type SubmitEvent`.
- Prefer feature-relative imports inside the same feature folder.
- Prefer `#/shared/...` imports for shared components, utilities, services, and types.
- Define page-local types near the imports, then constants, then the page component.
- Inside page components, keep `useState` declarations first, router hooks after local state, and store selectors/actions after router hooks when practical.
- Define small page event handlers as named functions before the JSX return.
- Use early returns in submit handlers for validation failure.
- Keep JSX readable with blank lines between logical UI blocks.
- Put Tailwind classes directly on elements and shared components; keep class strings readable and let `oxfmt` handle ordering/formatting.
- Use `aria-invalid` and `aria-describedby` for form error states.
- Use shared validation utilities such as `getFormValidationErrors` instead of page-local validation-error mappers when available.
- Use title case for title-like UI text such as page headings, section labels, card titles, button labels, navigation labels, and short action text when it reads naturally. Keep longer descriptive copy, helper text, validation messages, and paragraph content in normal sentence case when that is more readable.

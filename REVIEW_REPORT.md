# Concept Made Easy — Codebase Review & Fix Report

## What I reviewed
- Unzipped the full project and reviewed all 72 project files present in the archive.
- Focused on user-facing copy, navigation/link correctness, generated text, obvious inconsistencies, and Firestore access-control issues.
- Attempted a dependency install/build validation, but `npm install` did not complete within the available execution window, so a full TypeScript/Vite build could not be confirmed in this environment.

## Fixes applied

### User-facing copy / consistency
- Corrected the awkward footer heading **“Contact Contacts”** → **“Contact”**.
- Standardized class naming from forms such as **“Class 10th”** to **“Class 10”** across the application.
- Corrected **“CBSE State Board”** wording to **“State Board”** where the phrase was contradictory.
- Improved several awkward phrases, including:
  - “personal parent-reports” → “weekly review summaries shared with parents”
  - “short-cut booklets” → “shortcut booklets”
  - “On-Demand Doubt solver” → “On-Demand Doubt Solver”
  - “guarantees precise … tracking” → non-guarantee wording
  - “100th percentile board exam excellence” → “strong board-exam performance”
  - “100% Percentile Goal” → “Performance Goal”
- Removed wording that implied unsupported certainty/guarantees in a few study-performance areas.
- Standardized Bengaluru spelling in public contact/legal copy.

### Broken navigation
- Fixed referral links from `/student?ref=...` to the actual application route `/student-portal?ref=...`.

### Security / data integrity
- Hardened the Firestore `counters` rule so signed-in users can only advance the roll-number counter by one rather than arbitrarily rewriting it.
- Counter creation is restricted to the expected initial value; deletion is restricted to admins.

### Code cleanup
- Removed the “dummy CSV” wording in admin financial export code.
- Cleaned several generated/user-visible strings that still contained ordinal class suffixes.

## Important findings that still need product/deployment verification
1. **Full build not verified:** dependency installation timed out twice, so TypeScript/Vite compilation should be run locally/CI with `npm install && npm run lint && npm run build`.
2. **Referral flow:** the route was corrected, but the code should be tested end-to-end to confirm a referral query parameter is actually captured and applied after login/enrollment.
3. **AI API protection:** `/api/*` AI endpoints are server-side and expose no visible authentication/rate limiting in the reviewed code. Before public launch, add request authentication/authorization where appropriate, rate limiting, input-size validation, and abuse/cost controls.
4. **Firestore `progress_path`:** the current rule allows any signed-in user to write to any document in that collection. This should be tightened around a verifiable owner/student identifier before production.
5. **Sensitive document handling:** the project contains Aadhaar/document-verification flows. Production deployment should use strict storage rules, minimal retention, and server-side verification controls rather than trusting client-side state.

## Modified files
- `firestore.rules`
- `server.ts`
- `src/App.tsx`
- `src/components/AdminFinancials.tsx`
- `src/components/ArchiveTab.tsx`
- `src/components/CurriculumSearch.tsx`
- `src/components/DailyStudySchedule.tsx`
- `src/components/LiveAttendanceTracker.tsx`
- `src/components/ProgressPathVisualizer.tsx`
- `src/components/ReferAFriend.tsx`
- `src/components/SaturdayDoubtPortal.tsx`
- `src/components/StudentDashboard.tsx`
- `src/components/SundayExamRoom.tsx`
- `src/context/NotificationContext.tsx`
- `src/context/ToastContext.tsx`
- `src/data/defaultPolicies.ts`
- `src/lib/portalAuth.ts`
- `src/lib/receiptGenerator.ts`
- `src/lib/summaryPdfGenerator.ts`
- `src/pages/About.tsx`
- `src/pages/Admin.tsx`
- `src/pages/Contact.tsx`
- `src/pages/Legal.tsx`
- `src/pages/Programs.tsx`
- `src/pages/Scholarship.tsx`
- `src/pages/StudentPortal.tsx`
- `src/pages/TeacherPortal.tsx`
- `src/pages/TestSeries.tsx`

## Additional hardening applied
- Fixed the roll-number counter rule so the first transaction can initialize the counter at 2 while the normal reader can initialize it at 1.
- Changed authenticated Google student progress documents to use the real Firebase UID instead of a `google_`-prefixed ID, and tightened `progress_path` ownership rules.
- Tightened `doubts` creation so a signed-in student can only create a doubt for their own Firebase UID.
- Removed the Admin Portal's client-side `sessionStorage` token as an access grant; admin UI state now follows Firebase-authenticated founder/admin authorization.
- Added dependency-free rate limiting and request-size/input-length validation to `/api/*` AI endpoints.
- Hardened a couple of TypeScript inference points around localStorage/derived topic arrays.

## Validation status
- The uploaded archive was inspected and edited directly.
- A full dependency-backed TypeScript/Vite build could not be completed in this environment because `npm install` timed out twice. Run `npm install`, `npm run lint`, and `npm run build` locally/CI before deployment.

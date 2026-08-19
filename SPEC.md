# Calorie Tracker PWA — Product & Technical Specification

**Status:** Initial implementation specification  
**Target:** Production-quality MVP  
**Application type:** Open-source, public-facing Progressive Web App  
**Primary platforms:** Mobile web, desktop web, installable PWA  
**Primary stack:** Next.js + TypeScript + Tailwind CSS + shadcn/ui + Supabase/PostgreSQL

---

# 1. Product Overview

Build a modern, mobile-first calorie and nutrition tracking Progressive Web App focused on **making food logging as frictionless as possible**.

The application should allow users to:

- Create an account.
- Set calorie and nutrition goals.
- Quickly search for and log foods.
- Scan product barcodes.
- Track calories and nutritional information.
- Save frequently used foods and meals.
- Track body weight.
- View calorie, nutrition, and weight history.
- Earn XP and achievements.
- Maintain logging and goal streaks.
- Synchronize their data through the cloud.
- Export their data.

The application should feel substantially faster and less cumbersome than traditional calorie-tracking applications.

The core product philosophy is:

> **Open the app → log food → get on with your day.**

The application should not require users to navigate through multiple unnecessary screens every time they eat something.

---

# 2. Product Principles

## 2.1 Frictionless Logging

Food logging is the primary interaction and should receive disproportionate UX attention.

Common actions should require as few taps as reasonably possible.

The application should prioritize:

1. Recent foods
2. Favorite foods
3. Saved meals
4. Frequently used foods
5. Exact search results
6. General search results

A user who repeatedly eats the same foods should eventually be able to log them with one or two interactions.

---

## 2.2 Accuracy With Transparency

Nutrition data should come from reputable sources whenever possible.

The application must never imply that all nutrition data is equally authoritative.

Every food should maintain source/provenance information.

Potential data sources include:

- USDA FoodData Central
- Open Food Facts
- User-created foods
- Future verified/manufacturer sources

The UI should be able to communicate data provenance where useful.

Example:

- USDA
- Manufacturer
- Open Food Facts
- User-created

---

## 2.3 User Data Ownership

Users own their nutrition and health-related data.

The application must provide:

- Data export
- Account deletion
- JSON export
- CSV export

Do not create unnecessary lock-in.

---

## 2.4 Privacy and Security

The application contains personal nutrition and weight information and should therefore treat user data as private.

All user-owned data must be protected with Supabase Row Level Security.

A user must never be able to query another user's private data through the application's normal API or directly through Supabase.

---

## 2.5 Open Source

The project should be developed as an open-source application.

The application is intended primarily as a usable public product rather than a framework for others to fork and deploy, but the codebase should remain reasonably understandable and self-contained.

Avoid unnecessary proprietary dependencies.

---

# 3. Technology Stack

## 3.1 Application

Use:

- Next.js
- TypeScript
- Next.js App Router
- React
- Tailwind CSS
- shadcn/ui

Do not introduce a separate Express/Node backend unless a future requirement genuinely necessitates it.

Next.js should provide the application/server layer.

---

## 3.2 Backend

Use Supabase for:

- PostgreSQL
- Authentication
- Row Level Security
- Database access
- Cloud persistence
- Future file storage if necessary

Use the current Supabase Next.js SSR/authentication approach.

Authentication should use secure HTTP-only/cookie-based sessions as appropriate for the current Supabase/Next.js integration.

---

## 3.3 Validation

Use Zod for:

- API input validation
- Form validation
- External API response validation where practical
- Server-side validation

Never rely solely on client-side validation.

---

## 3.4 Charts

Use Recharts or another lightweight React-compatible charting library.

Charts must be responsive and usable on mobile.

---

## 3.5 PWA

The application must be installable as a PWA.

Provide:

- Web app manifest
- Application icons
- Service worker
- Appropriate caching
- Offline-friendly behavior

Offline functionality should focus primarily on making the application feel resilient rather than attempting to create a complicated distributed database.

---

# 4. Architecture

Use a cloud-backed architecture with offline resilience.

```text
Browser
   │
   ├── Next.js / React UI
   │
   ├── Local cache
   │
   └── Optimistic UI
           │
           ▼
      Next.js Server
           │
           ▼
        Supabase
           │
           ├── Auth
           └── PostgreSQL
```

Supabase is the authoritative source of truth.

The browser may cache frequently accessed information and temporarily queue mutations when appropriate.

Do not implement a complex CRDT or fully local-first synchronization architecture for MVP.

---

# 5. Authentication

Accounts are required.

## Required functionality

- Sign up
- Sign in
- Sign out
- Password reset
- Session persistence
- Protected application routes
- Account deletion

Potential future authentication methods:

- Google
- Apple
- GitHub

Do not require social authentication for MVP.

---

# 6. Primary Application Navigation

The application should have a simple navigation structure.

Recommended primary destinations:

- **Today**
- **History**
- **Food**
- **Progress**
- **Achievements**
- **Settings**

On mobile, use a bottom navigation bar or similarly accessible navigation.

The primary "Log Food" action should be visually prominent.

---

# 7. Dashboard / Today Screen

The Today screen is the primary screen.

Example conceptual layout:

```text
Wednesday, August 19

Today's Calories

1,847 / 2,200 kcal
████████████████░░░░

Protein
126 / 160 g

Carbohydrates
184 / 220 g

Fat
62 / 73 g

Fiber
21 / 30 g

----------------------------

Breakfast                 420 kcal
Lunch                     610 kcal
Dinner                    650 kcal
Snacks                    167 kcal

             + LOG FOOD

----------------------------

🔥 12 day logging streak

1,240 XP

----------------------------

Weight
274.6 lb

↓ 4.2 lb this month
```

The exact visual design is implementation-dependent, but the information hierarchy should remain similar.

---

# 8. Food Logging

Food logging is the highest-priority feature.

## 8.1 Add Food Entry

Users should be able to add food to:

- Breakfast
- Lunch
- Dinner
- Snacks

The system should allow additional/custom meal categories in the future.

---

## 8.2 Add Food Methods

The Add Food interface should offer:

- Search
- Barcode scanner
- Recent foods
- Favorite foods
- Saved meals
- Custom food
- Quick calorie entry

---

# 9. Food Search

Search must support:

- Exact matches
- Partial matches
- Fuzzy matches
- Misspellings
- Brand names
- Product names
- Generic foods

Example:

```text
chikcen breast
```

should produce useful chicken breast results.

Search ranking should prioritize:

1. User's recent foods
2. User's favorites
3. Exact matches
4. Frequently used foods
5. Branded products
6. Generic foods
7. Fuzzy matches

Search should be fast.

---

# 10. Food Database

Do not make the client directly dependent on external nutrition APIs for every search.

Implement a food-data abstraction layer.

```text
External Data Sources
        │
        ▼
 Food Ingestion Layer
        │
        ▼
 Normalized Food Database
        │
        ▼
    Search API
        │
        ▼
      Client
```

---

# 11. External Food Data Sources

## 11.1 USDA FoodData Central

Use USDA FoodData Central as a primary authoritative source.

Use it for:

- Foundation foods
- Generic foods
- USDA food data
- Branded foods where applicable

The ingestion system should support USDA's downloadable datasets where practical rather than relying exclusively on live API calls.

USDA data source/license information must be respected during implementation.

Store the original source identifier for imported foods.

---

## 11.2 Open Food Facts

Use Open Food Facts primarily for:

- Barcode lookup
- Packaged foods
- Products unavailable in USDA data
- Additional product information

Open Food Facts data is community contributed and therefore should not automatically be treated as equivalent in confidence to authoritative/manufacturer data.

Store its source and source ID.

---

# 12. Food Data Provenance

Every food record should have source metadata.

Example:

```text
source_type:
  USDA
  OPEN_FOOD_FACTS
  USER
  MANUFACTURER
  OTHER

source_id
source_url
source_last_updated
```

Do not discard the original source identifier.

---

# 13. Food Data Model

The canonical food representation should support nutrition per a standardized quantity, preferably per 100g where available.

A food should support:

- Name
- Brand
- Description
- Barcode
- Source
- Source ID
- Serving definitions
- Nutrition information
- Ingredients where available
- Dietary information where available
- Creation/update timestamps

Nutrition must be extensible.

Do not create a database schema that only supports calories/protein/carbs/fat.

---

# 14. Nutrition Model

Initial supported nutrients:

### Primary

- Calories
- Protein
- Carbohydrates
- Fat
- Fiber
- Sugar

### Secondary

- Saturated fat
- Trans fat
- Sodium
- Cholesterol

The model should be extensible to support:

- Added sugar
- Potassium
- Calcium
- Iron
- Vitamin D
- Other micronutrients

Not every food will contain every nutrient.

Missing values must remain distinguishable from zero.

Do not interpret `NULL` as `0`.

---

# 15. Serving Sizes

Users must be able to log food using practical units.

Support, where applicable:

- grams
- kilograms
- ounces
- pounds
- milliliters
- liters
- cups
- tablespoons
- teaspoons
- pieces
- slices
- servings

The application should maintain a canonical nutritional basis and calculate quantities from serving definitions.

Example:

```text
Chicken Breast

[ 6.0 ] [ oz ▼ ]

Calories: 281
Protein: 53g
```

---

# 16. Nutrition Snapshot

Food log entries must preserve a snapshot of the nutrition values at the time they are logged.

Do not rely solely on a foreign key to the current Food record.

Reason:

A product's nutritional information may change.

Historical logs must not unexpectedly change because a food record was updated later.

Conceptually:

```text
Food
  current nutrition

FoodLogEntry
  food_id
  quantity
  unit
  nutrition_snapshot
```

---

# 17. Barcode Scanning

Implement barcode scanning using browser-supported camera functionality where possible.

Flow:

```text
Scan barcode
     ↓
Search local database
     ↓
If unavailable:
Query product source
     ↓
Display product
     ↓
Select serving
     ↓
Select quantity
     ↓
Log
```

Previously scanned foods should be cached locally for faster subsequent access.

If a barcode cannot be found:

```text
Product not found

[ Create Custom Food ]
```

---

# 18. Recent Foods

Track foods the user has recently logged.

Recent foods should be prominently accessible from Add Food.

Display useful information such as:

```text
Greek Yogurt
170g · 120 kcal
Logged yesterday
```

The system should not create an unlimited unbounded recent-food list.

Use a sensible limit and deduplicate repeated foods.

---

# 19. Favorites

Users can favorite foods.

Favorites should be accessible from Add Food.

Users can:

- Favorite
- Unfavorite
- Search favorites

---

# 20. Custom Foods

Users must be able to create their own food.

Fields should include:

- Name
- Brand (optional)
- Serving size
- Serving unit
- Calories
- Protein
- Carbohydrates
- Fat
- Fiber
- Sugar
- Saturated fat
- Trans fat
- Sodium
- Cholesterol

Additional nutrients can be added later.

Custom foods belong only to the creating user unless a future moderation/public-food system is implemented.

---

# 21. Quick Calorie Entry

Users must be able to log calories without selecting a food.

Example:

```text
Quick Add

Calories
[ 450 ]

Protein (optional)
[ 10 ]

Carbs (optional)
[ 20 ]

Fat (optional)
[ 15 ]

[ Add ]
```

This is useful when the user knows the calorie amount but does not have reliable food-level nutritional data.

---

# 22. Saved Meals

Users can create reusable meals.

Example:

```text
Breakfast

3 eggs
2 slices toast
1 tbsp butter
2 sausage links
```

The meal should calculate total nutrition automatically.

Logging the saved meal should create individual food-log entries rather than a single opaque entry whenever practical.

This preserves nutritional detail and allows individual modification afterward.

---

# 23. Recipes

Recipes should support:

- Name
- Ingredients
- Ingredient quantities
- Number of servings
- Automatically calculated nutrition
- Optional instructions
- Optional notes

Users should be able to log:

- Full recipe
- Number of servings
- Fractional serving

Example:

```text
Chili

8 servings

Per serving:
420 kcal
32g protein
38g carbs
14g fat
```

Recipes may be implemented after the core MVP if development scope requires prioritization.

---

# 24. Daily Goals

Users should be able to configure:

- Daily calorie goal
- Protein goal
- Carbohydrate goal
- Fat goal
- Fiber goal

Initial implementation may use a single daily goal.

The underlying model should support future scheduled goals.

Example future capability:

```text
Monday-Friday
2,100 kcal

Saturday-Sunday
2,400 kcal
```

---

# 25. Goal Progress

For each tracked nutrient, show:

```text
Consumed / Goal
```

Example:

```text
Calories
1,847 / 2,200 kcal

Protein
126 / 160 g
```

Avoid implying that exceeding every nutrient goal is necessarily bad.

For nutrients such as sodium, future support should allow minimum/maximum/target semantics.

---

# 26. Weight Tracking

Users can log body weight.

Each weight record should contain:

- Weight
- Unit
- Timestamp
- Optional note

Support:

- lb
- kg

The user's preferred unit should be configurable.

---

# 27. Weight History

Provide graphs for:

- 7 days
- 30 days
- 90 days
- 1 year
- All time

Show both:

- Raw measurements
- Smoothed trend

Useful summary information:

```text
Current:
274.6 lb

30-day change:
-4.2 lb

Trend:
-0.9 lb/week
```

Do not overinterpret individual measurements.

---

# 28. Calorie History

Provide calorie charts for:

- 7 days
- 30 days
- 90 days
- 1 year
- All time

Useful views:

- Daily calories
- Weekly average
- Goal line
- Goal adherence

The user should be able to select a date range.

---

# 29. Macro History

Support historical charts for:

- Protein
- Carbohydrates
- Fat
- Fiber
- Sugar

Do not overcrowd a single graph with every nutrient.

Allow selecting individual nutrients.

---

# 30. Calendar / History

Provide a calendar or timeline view showing logging activity.

Possible status indicators:

- Fully logged
- Partially logged
- No entries
- Goal met
- Goal missed

Selecting a date opens that day's diary.

---

# 31. Insights

The application should eventually derive useful observations from historical data.

Examples:

> Your average calorie intake this week was 1,980 kcal/day.

> You've logged food on 6 of the last 7 days.

> Your weight trend is down 3.8 lb over the last 30 days.

> Your average protein intake this month is 137g/day.

Insights must be descriptive rather than presenting medical advice.

Do not make medical diagnoses or claims.

---

# 32. Gamification

Gamification should be **lightweight and encouraging**, not an elaborate RPG.

Primary mechanics:

- XP
- Levels
- Achievements
- Daily logging streak
- Goal streaks

---

# 33. XP

Initial suggested XP values:

| Action | XP |
|---|---:|
| Log a meal | 10 |
| Log a full day | 25 |
| Log weight | 10 |
| Hit calorie target | 25 |
| Hit protein target | 20 |
| Hit all primary macro targets | 30 |
| Maintain logging streak | 10 |
| Complete weekly goal | 100 |

These values should live in configuration rather than being hardcoded throughout the application.

Avoid excessive XP farming.

For example, repeatedly editing the same meal should not generate unlimited XP.

---

# 34. Streaks

Initial streaks:

### Logging Streak

Consecutive calendar days with food logging.

### Complete Day Streak

Consecutive days where the user records food for the day.

### Goal Streak

Consecutive days meeting the user's calorie goal.

The system should calculate streaks from actual data rather than storing only a mutable counter.

Counters may be cached for performance but the underlying records remain authoritative.

---

# 35. Achievements

Initial achievements should include examples such as:

### First Steps
Log your first food.

### Getting Started
Log food for 7 days.

### Consistent
Log food for 30 days.

### Data Hoarder
Log 100 meals.

### Weight Tracker
Log weight 30 times.

### Protein Machine
Hit your protein goal 7 times.

### On Target
Meet your calorie target 7 times.

### Balanced
Meet all primary macro targets in a day.

### Week Strong
Log every day for one week.

### Month Strong
Log every day for 30 days.

The achievement system should be data-driven so new achievements can be added without rewriting core logic.

---

# 36. Streak Forgiveness

Do not make the gamification punishing.

A future feature may introduce:

**Streak Freeze**

Users can earn or receive a limited number of streak freezes.

This should not be required for MVP.

---

# 37. Data Model

The exact schema may evolve during implementation, but it should conceptually include:

```text
profiles
goals
foods
food_nutrients
food_servings
food_sources
food_log_entries
saved_meals
saved_meal_items
recipes
recipe_items
weight_entries
daily_summaries
xp_events
achievements
user_achievements
user_streaks
```

Do not denormalize prematurely.

---

# 38. Suggested Core Relationships

```text
auth.users
    │
    ▼
profiles
    │
    ├── goals
    ├── food_log_entries
    ├── saved_meals
    ├── recipes
    ├── weight_entries
    ├── xp_events
    └── user_achievements

foods
    │
    ├── food_nutrients
    ├── food_servings
    └── food_sources

saved_meals
    │
    └── saved_meal_items ──> foods

recipes
    │
    └── recipe_items ──> foods
```

---

# 39. Food Ownership

Foods should have an ownership model.

System/imported foods:

```text
owner_user_id = NULL
```

User-created foods:

```text
owner_user_id = current_user
```

Users may read system foods and their own foods.

Users must not modify system food records directly.

---

# 40. Supabase Row Level Security

RLS is mandatory.

Every user-owned table must restrict access to the authenticated user.

Conceptually:

```sql
auth.uid() = user_id
```

Never rely on the frontend to enforce ownership.

RLS policies must be tested explicitly.

---

# 41. Database Security

Never expose:

- Supabase service-role keys
- External API secrets
- Private server credentials

to the browser.

External API calls requiring secrets should happen server-side.

Environment variables must be used for secrets.

Provide a `.env.example`.

---

# 42. Food API Architecture

Implement server-side services such as:

```text
FoodSearchService
FoodDetailsService
BarcodeService
FoodImportService
NutritionNormalizationService
```

Do not place external API logic directly inside React components.

---

# 43. Food Normalization

External food records must be normalized into a common internal format.

The normalization layer should handle:

- Nutrient IDs
- Units
- Serving sizes
- Missing nutrients
- Brand names
- Product names
- Barcodes
- Source identifiers

Do not assume different external sources use identical nutrient schemas.

---

# 44. Food Deduplication

The ingestion system should attempt to avoid obvious duplicates.

Potential matching fields:

- Barcode
- Source ID
- Brand
- Product name
- Serving size
- Nutrition values

Do not aggressively merge foods if doing so risks losing meaningful distinctions.

---

# 45. Nutrition Calculations

Nutrition calculations must be deterministic.

If a food contains:

```text
100g = 200 kcal
```

then:

```text
50g = 100 kcal
```

Calculations should use sufficient internal precision and round only for display.

Do not repeatedly round intermediate calculations.

---

# 46. Historical Data

Food log entries must retain historical nutritional snapshots.

Changing a food's current nutrition should not rewrite historical diary data.

Deleting a food should not delete historical food log entries.

Use soft deletion or archival behavior where necessary.

---

# 47. Offline Behavior

The application should remain useful during temporary network loss.

At minimum:

- Previously viewed foods remain accessible where cached.
- Recent foods remain accessible.
- Favorites remain accessible.
- Previously viewed diary data remains accessible.
- The UI should indicate when data is not synchronized.
- Simple food-log mutations may be queued for synchronization.

The application must not silently discard an offline food log.

---

# 48. Optimistic UI

For common actions such as:

```text
Add food
Delete food
Log weight
Favorite food
```

prefer optimistic UI updates.

The user should see the result immediately.

If synchronization fails:

- Preserve the user's data locally.
- Clearly indicate the synchronization problem.
- Retry automatically where appropriate.
- Provide a way to retry manually if necessary.

---

# 49. PWA Requirements

The application must:

- Install on mobile and desktop
- Have appropriate icons
- Have a proper application manifest
- Support standalone display
- Cache static application assets
- Provide reasonable offline behavior
- Handle network restoration

Do not cache private user data in a way that could expose it to another authenticated user on a shared device.

---

# 50. Responsive Design

Mobile is the primary design target.

The application must work well at:

- Small phones
- Large phones
- Tablets
- Desktop monitors

Desktop should take advantage of available space rather than simply stretching the mobile interface.

---

# 51. Accessibility

Use semantic HTML.

Support:

- Keyboard navigation
- Screen readers
- Focus states
- Appropriate ARIA attributes
- Sufficient contrast
- Reduced-motion preferences
- Accessible form validation
- Accessible charts where possible

Do not communicate important information exclusively through color.

---

# 52. UI Design

Visual style should be:

- Modern
- Clean
- Friendly
- Slightly playful
- Data-focused
- Not overly clinical

Use shadcn/ui components where appropriate.

Avoid excessive card nesting.

The application should not feel like an enterprise dashboard.

---

# 53. Error Handling

Errors should be human-readable.

Bad:

```text
Error: FDC-API-500
```

Better:

```text
We couldn't load food results right now.

Your recent and favorite foods are still available.
```

External API failures should not crash the application.

---

# 54. Loading States

Every asynchronous operation needs an appropriate loading state.

Prefer:

- Skeletons
- Inline loading indicators
- Optimistic UI

Avoid full-page spinners for small operations.

---

# 55. Empty States

Design intentional empty states.

Example:

```text
No foods logged yet.

Start by adding your first meal.

[ Log Food ]
```

Do not simply render an empty table.

---

# 56. Error Recovery

Where possible, errors should offer recovery.

Example:

```text
Couldn't load search results.

[ Try Again ]
```

For failed mutations:

```text
Couldn't save your meal.

[ Retry ]
```

---

# 57. Data Export

Users must be able to export their data.

## JSON

Export:

- Profile
- Goals
- Food logs
- Weight entries
- Custom foods
- Saved meals
- Recipes
- Achievements
- Relevant settings

## CSV

At minimum:

- Date
- Meal
- Food
- Quantity
- Unit
- Calories
- Protein
- Carbohydrates
- Fat
- Fiber
- Sugar

Weight should have its own CSV export or clearly defined format.

---

# 58. Account Deletion

Users must be able to permanently delete their account and associated private data.

The implementation must account for:

- Auth account
- Profile
- Nutrition logs
- Weight
- Goals
- Custom foods
- Saved meals
- Recipes
- Gamification data

System food records must not be deleted.

---

# 59. API Design

Use typed server-side interfaces.

Potential routes/actions:

```text
/api/foods/search
/api/foods/[id]
/api/foods/barcode/[barcode]
/api/foods/custom
/api/food-log
/api/food-log/[id]
/api/weight
/api/goals
/api/saved-meals
/api/recipes
/api/export
```

Use Next.js server actions where they make the code simpler and appropriate.

Do not create API routes solely for the sake of having REST endpoints.

---

# 60. Validation Rules

Validate all user input server-side.

Examples:

Calories:

```text
>= 0
```

Weight:

```text
> 0
```

Food quantity:

```text
> 0
```

Nutrition:

```text
>= 0 where applicable
```

Prevent unreasonable numeric values where appropriate.

---

# 61. Time and Date Handling

Store timestamps consistently in UTC.

Display dates/times in the user's configured/local timezone.

Daily nutrition boundaries must use the user's timezone rather than UTC midnight.

This is especially important for users near timezone boundaries.

---

# 62. Units

Users should select preferred:

- Weight unit
- Food measurement preferences

The application must store canonical values internally where appropriate.

Conversions should be deterministic.

---

# 63. Testing

Testing is required.

## Unit tests

Test:

- Nutrition calculations
- Serving conversions
- Goal calculations
- XP calculations
- Achievement conditions
- Streak calculations
- Weight trend calculations
- Data normalization

## Integration tests

Test:

- Authentication
- Food search
- Food logging
- Weight logging
- Saved meals
- Supabase operations
- RLS

## End-to-end tests

Test critical user journeys:

### New user

```text
Sign up
→ Set goals
→ Search food
→ Log food
→ View dashboard
```

### Barcode

```text
Open scanner
→ Scan product
→ Select serving
→ Log
```

### Repeat food

```text
Open Add Food
→ Select recent food
→ Log
```

### Weight

```text
Log weight
→ Open progress
→ View graph
```

### Gamification

```text
Log food
→ Earn XP
→ Trigger achievement
→ Update streak
```

---

# 64. Security Testing

Explicitly test Supabase RLS.

Test that:

- User A cannot read User B's logs.
- User A cannot modify User B's logs.
- User A cannot delete User B's data.
- User A cannot modify system foods.
- Anonymous users cannot access protected data.
- Service credentials never reach the client.

---

# 65. Performance Goals

The application should feel fast.

Target:

- Initial application UI should become interactive quickly.
- Adding a recent/favorite food should feel instantaneous.
- Dashboard navigation should not require unnecessary network requests.
- Food search should return quickly under normal conditions.
- Previously accessed information should be cached.

Avoid premature optimization, but do not make every interaction dependent on a round-trip to an external API.

---

# 66. Logging / Observability

Implement useful application error logging.

Do not log:

- Passwords
- Auth tokens
- Private nutrition data unnecessarily
- Sensitive user information

Production error monitoring can be added later.

---

# 67. Configuration

Use environment variables for:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
USDA_API_KEY
OPEN_FOOD_FACTS_*
```

Only expose variables prefixed appropriately for browser use.

Provide:

```text
.env.example
```

with descriptions.

---

# 68. Project Structure

Use a maintainable structure roughly along these lines:

```text
src/
  app/
    (auth)/
    (app)/
      today/
      history/
      food/
      progress/
      achievements/
      settings/
    api/

  components/
    ui/
    food/
    diary/
    nutrition/
    charts/
    gamification/
    layout/

  lib/
    supabase/
    foods/
    nutrition/
    goals/
    gamification/
    validation/
    utils/

  types/

  hooks/

  services/
```

The exact structure can be adapted if the framework's current best practices differ.

---

# 69. Development Principles

The coding agent should:

1. Prefer simple solutions.
2. Avoid premature abstractions.
3. Keep domain logic out of UI components.
4. Keep external API integrations behind service interfaces.
5. Use TypeScript strictly.
6. Avoid `any` unless genuinely unavoidable.
7. Validate external data.
8. Write tests for non-trivial business logic.
9. Keep database migrations version controlled.
10. Never bypass RLS as a convenience.
11. Never expose server secrets.
12. Keep the application usable on mobile throughout development.

---

# 70. MVP Scope

The first production milestone must include:

## Authentication

- [ ] Account registration
- [ ] Login
- [ ] Logout
- [ ] Password reset
- [ ] Protected routes

## Dashboard

- [ ] Daily calorie summary
- [ ] Macro summary
- [ ] Meal list
- [ ] Log Food action
- [ ] Logging streak
- [ ] XP

## Food

- [ ] USDA integration
- [ ] Open Food Facts integration
- [ ] Normalized food database
- [ ] Food search
- [ ] Barcode lookup/scanning
- [ ] Serving selection
- [ ] Recent foods
- [ ] Favorites
- [ ] Custom foods
- [ ] Quick calorie entry

## Logging

- [ ] Breakfast
- [ ] Lunch
- [ ] Dinner
- [ ] Snacks
- [ ] Add
- [ ] Edit
- [ ] Delete
- [ ] Nutrition snapshot

## Nutrition

- [ ] Calories
- [ ] Protein
- [ ] Carbohydrates
- [ ] Fat
- [ ] Fiber
- [ ] Sugar
- [ ] Saturated fat
- [ ] Trans fat
- [ ] Sodium
- [ ] Cholesterol

## Goals

- [ ] Calorie goal
- [ ] Protein goal
- [ ] Carb goal
- [ ] Fat goal
- [ ] Fiber goal

## Weight

- [ ] Weight entry
- [ ] Weight history
- [ ] Trend calculation
- [ ] Graph

## Analytics

- [ ] Daily calorie graph
- [ ] Weekly average
- [ ] Goal line
- [ ] Macro history
- [ ] Date-range selection

## Gamification

- [ ] XP
- [ ] XP events
- [ ] Logging streak
- [ ] Goal streak
- [ ] Achievement system
- [ ] Initial achievement set

## Data

- [ ] Cloud synchronization
- [ ] JSON export
- [ ] CSV export
- [ ] Account deletion

## PWA

- [ ] Installable
- [ ] Manifest
- [ ] Icons
- [ ] Service worker
- [ ] Offline-friendly behavior
- [ ] Optimistic UI

---

# 71. Post-MVP Features

Do not block MVP on these.

Potential V1 features:

- [ ] Saved meals
- [ ] Recipes
- [ ] Calendar view
- [ ] Advanced insights
- [ ] Streak freezes
- [ ] More achievements
- [ ] More micronutrients
- [ ] Food correction workflow
- [ ] Improved food ranking
- [ ] Scheduled calorie goals
- [ ] Better offline mutation queue

Future features:

- [ ] AI-assisted logging
- [ ] Natural-language food logging
- [ ] AI photo assistance
- [ ] Restaurant database
- [ ] Apple Health integration
- [ ] Google Health Connect
- [ ] Wearable integrations
- [ ] Exercise tracking
- [ ] Social features

AI-assisted food logging is explicitly **not part of MVP**.

---

# 72. Non-Goals

The MVP should NOT attempt to become:

- A medical application
- A fitness coaching service
- A workout tracker
- A social network
- A comprehensive electronic health record
- An AI nutritionist
- A calorie estimation system based primarily on photographs

Nutrition recommendations should remain informational and user-configurable.

---

# 73. Important UX Requirement

The most important UX test is:

> **How quickly can an existing user log a food they eat frequently?**

The desired flow should eventually be approximately:

```text
Open app
↓
Log Food
↓
Recent/Favorite
↓
Select quantity
↓
Done
```

For a saved meal:

```text
Open app
↓
Log Food
↓
Saved Meal
↓
Done
```

For a barcode:

```text
Open app
↓
Scan
↓
Quantity
↓
Done
```

Do not allow the interface to become unnecessarily complicated in pursuit of feature completeness.

---

# 74. Acceptance Criteria

The MVP is considered complete when a new user can:

1. Create an account.
2. Configure calorie and macro goals.
3. Search for a food.
4. View its nutrition.
5. Select a serving size.
6. Log it to a meal.
7. See their daily calorie and macro totals update immediately.
8. Repeat the process using recent foods.
9. Favorite a food.
10. Scan a supported barcode.
11. Create a custom food.
12. Perform a quick calorie entry.
13. Log their weight.
14. View their weight graph.
15. View their calorie history.
16. See their logging streak.
17. Earn XP.
18. Unlock an achievement.
19. Close and reopen the application while remaining authenticated.
20. Use the application during a temporary network interruption without losing already-entered data.
21. Export their data.
22. Delete their account.

---

# 75. Implementation Strategy

Do not attempt to implement the entire application in one pass.

Build in vertical slices.

## Phase 1 — Foundation

- [ ] Initialize Next.js project
- [ ] TypeScript
- [ ] Tailwind
- [ ] shadcn/ui
- [ ] Supabase
- [ ] Authentication
- [ ] Database migrations
- [ ] RLS
- [ ] Basic application shell
- [ ] Mobile navigation

## Phase 2 — Core Diary

- [ ] Profile
- [ ] Goals
- [ ] Food log schema
- [ ] Dashboard
- [ ] Add food UI
- [ ] Manual/custom food
- [ ] Nutrition calculations

## Phase 3 — Food Data

- [ ] USDA ingestion
- [ ] Food normalization
- [ ] Food search
- [ ] Open Food Facts integration
- [ ] Barcode lookup
- [ ] Serving conversion
- [ ] Recent/favorites

## Phase 4 — Progress

- [ ] Weight logging
- [ ] Weight graph
- [ ] Calorie graph
- [ ] Macro graphs
- [ ] Date ranges
- [ ] History

## Phase 5 — Gamification

- [ ] XP events
- [ ] XP totals
- [ ] Streaks
- [ ] Achievements
- [ ] Achievement UI

## Phase 6 — PWA / Offline

- [ ] Manifest
- [ ] Service worker
- [ ] Asset caching
- [ ] Local cache
- [ ] Optimistic mutations
- [ ] Offline queue/retry

## Phase 7 — Data / Polish

- [ ] JSON export
- [ ] CSV export
- [ ] Account deletion
- [ ] Accessibility review
- [ ] Responsive review
- [ ] Error states
- [ ] Empty states
- [ ] Loading states
- [ ] Security audit
- [ ] RLS tests
- [ ] E2E tests

---

# 76. Agent Instructions

The coding agent should treat this document as the product specification, but should **not blindly implement every possible future feature**.

When a requirement is ambiguous:

1. Prefer the simplest implementation consistent with this specification.
2. Preserve extensibility where inexpensive.
3. Avoid speculative architecture.
4. Ask for clarification only when the ambiguity materially affects architecture or user-facing behavior.
5. Do not add unrelated features.
6. Do not replace established technology choices without a compelling technical reason.

Before implementing a major architectural change, explain the tradeoff.

The agent should maintain:

```text
README.md
SPEC.md
CHANGELOG.md
.env.example
database migrations
tests
```

Database changes must be represented as migrations.

---

# 77. Definition of Done

A feature is not considered complete merely because it works in the happy path.

A feature is complete when it has:

- UI
- Server-side validation
- Database integration
- Appropriate RLS
- Loading state
- Empty state
- Error handling
- Mobile-friendly presentation
- Accessibility considerations
- Tests appropriate to its complexity
- No leaked secrets
- No obvious data-loss scenarios

---

# 78. Final Product Vision

The finished application should feel like:

> **A fast, private-feeling, modern calorie tracker that gets out of the user's way.**

It should combine:

- The convenience of a commercial calorie tracker
- The transparency of an open-source project
- The ownership of cloud-synchronized personal data
- Reliable nutrition data from established sources
- Lightweight gamification
- Useful historical analytics
- A genuinely good mobile experience

The application should prioritize **habit formation and low-friction logging over feature bloat**.

The guiding question for future features should always be:

> **Does this make tracking easier or more useful without making the application harder to use?**

If not, it probably does not belong in the core experience.
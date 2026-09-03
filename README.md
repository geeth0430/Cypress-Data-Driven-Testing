# cypress-data-driven-testing

A Cypress E2E suite covering login, cart/checkout, form validation, and API mocking -
built to demonstrate **custom commands**, **fixture-driven test data**, and
**`cy.intercept()` network stubbing** for edge cases a real backend won't reliably reproduce
on demand (500 errors, empty responses, slow networks).

Targets two demo sites:
- **[saucedemo.com](https://www.saucedemo.com)** - login, cart, checkout
- **[demoqa.com](https://demoqa.com)** - the Practice Form (validation, dropdowns, date picker,
  file upload) and the Book Store page (network stubbing target, since it makes a real XHR call)

## Project structure

```
cypress-data-driven-testing/
├── cypress/
│   ├── fixtures/
│   │   ├── users.json              # valid / locked-out / invalid login datasets
│   │   ├── practiceFormData.json   # valid + invalid demoqa form submissions
│   │   ├── apiResponses.json       # mocked success / empty / 500 error payloads
│   │   └── sample-upload.txt       # dummy file used by the file-upload test
│   ├── e2e/
│   │   ├── login.spec.js           # data-driven login loop over fixture users
│   │   ├── cart.spec.js            # add/remove cart items, full checkout flow
│   │   ├── form.spec.js            # Practice Form: required fields, dropdowns, date picker, upload
│   │   └── network-stubbing.spec.js # cy.intercept(): success, empty, 500, slow network
│   └── support/
│       ├── commands.js             # cy.login, cy.attemptLogin, cy.addProductsToCart, form helpers
│       └── e2e.js                  # global support file, imports commands + reporter
├── .github/workflows/cypress.yml   # CI via the official cypress-io/github-action
├── cypress.config.js               # e2e config, mochawesome reporter, env base URLs
├── package.json
├── .gitignore
└── README.md
```

## Setup

```bash
npm install
```

## Running tests

```bash
npx cypress open        # interactive runner - pick a spec, watch it run
npx cypress run         # headless, all specs, generates the Mochawesome report
npm run cy:run:chrome   # headless in Chrome specifically
```

### Viewing the Mochawesome HTML report

After `npx cypress run`, the report is written to `cypress/reports/html/index.html` - open
it directly in a browser, or `npm run report:open` (uses your OS's default `open`/`start`).
The report is regenerated automatically after every headless run (no separate merge step needed) -
it includes a pass/fail chart, per-spec timing, and embedded screenshots for any failures.

## Custom commands (`cypress/support/commands.js`)

| Command | Purpose |
|---|---|
| `cy.login(username, password)` | Logs into saucedemo via the UI and caches the session with `cy.session()` so repeated logins in the same run don't re-submit the form every time. |
| `cy.attemptLogin(username, password)` | Same login flow but uncached - used in negative-path tests where we need to assert an error message on the login page itself. |
| `cy.addProductsToCart(count)` | Adds the first N products on the saucedemo inventory page. |
| `cy.fillPracticeFormBasics(data)` | Fills the demoqa Practice Form's core text fields. |
| `cy.selectGender(gender)` | Clicks a gender radio button by label. |
| `cy.setDateOfBirth(day, month, year)` | Drives the react-datepicker widget on the Practice Form. |
| `cy.addSubject(subject)` | Types into and selects from the Subjects autocomplete. |
| `cy.checkHobby(hobby)` | Checks a hobby checkbox by its visible label. |

## Fixtures (`cypress/fixtures/`)

- **`users.json`** - 3 valid saucedemo users (standard, problem, performance-glitch) and 5 invalid
  scenarios (locked-out, wrong password, unregistered username, empty username, empty password),
  each tagged with the expected outcome and error message so specs can loop over them.
- **`practiceFormData.json`** - one full valid form submission and a set of invalid-input cases
  (missing name, bad email format, too-short mobile number).
- **`apiResponses.json`** - mocked Book Store API payloads: a 2-book success response, an empty
  list, and a 500 error body - used entirely client-side via `cy.intercept()`, no real backend
  failure required.

## Network stubbing (`network-stubbing.spec.js`)

Demonstrates `cy.intercept()` against `GET **/BookStore/v1/Books`:

1. **Happy path** - stubbed 200 with fixture data, asserts the table renders the right row count.
2. **Empty response** - stubbed 200 with an empty array, asserts the UI shows no rows instead of
   erroring.
3. **500 error** - stubbed failure response, asserts the page stays up and doesn't crash.
4. **Slow network** - `req.reply({ delay: 3000, ... })` to simulate latency, asserts the table is
   empty immediately after navigation and populates only after the (stubbed) response arrives.
5. **Request shape** - asserts the real request Cypress intercepted was a `GET`, useful as a
   sanity check that the intercept pattern actually matched the live call.

This is the pattern that's hard to demonstrate against a real backend on demand - you can't
usually make production return a 500 or hang for 3 seconds just to test your UI's error states,
but stubbing lets you test all of them deterministically, every run.

## Test coverage summary

| Spec file | Covers |
|---|---|
| `login.spec.js` | Data-driven pass over all valid/invalid users in `users.json`; session-cached login via custom command. |
| `cart.spec.js` | Add/remove items, cart badge count, full checkout flow, required-field validation on checkout info. |
| `form.spec.js` | Full valid form submission (text fields, gender, date picker, subjects, hobbies, file upload, state/city dropdowns); required-field validation; invalid email; invalid mobile number. |
| `network-stubbing.spec.js` | `cy.intercept()` for success, empty response, 500 error, and simulated slow network. |

## CI

`.github/workflows/cypress.yml` uses the official
[`cypress-io/github-action`](https://github.com/cypress-io/github-action) to install dependencies
and run the full suite headlessly on every push/PR to `main`/`master`. It uploads three artifacts
on every run: the Mochawesome HTML report, videos, and (on failure only) screenshots.

## Notes

- `cy.session()` is used in `cy.login()` to avoid re-submitting the login form for every test that
  just needs to already be logged in - Cypress restores the cached browser state instead.
- demoqa.com renders a fixed ad banner and footer that can overlap form fields; `form.spec.js`
  hides both in `beforeEach` so clicks land reliably regardless of viewport size.
- `cypress/support/e2e.js` suppresses uncaught exceptions from demoqa's third-party ad scripts so
  they don't fail specs for reasons unrelated to the app under test.

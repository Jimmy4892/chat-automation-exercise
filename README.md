# Mini Chat — Automation Exercise

A deliberately tiny chat UI (think: the core of the ChatGPT chat window —
message input, send, response rendering, new chat) built with **Vite + React**,
with a small automated test suite and a CI workflow that runs it on every
push/PR.

## App

- `src/components/MessageInput.jsx` — textarea + Send button. Enter sends,
  Shift+Enter inserts a line break, and Send is disabled while the input is
  empty or whitespace-only.
- `src/components/MessageList.jsx` — renders the conversation and a
  "Generating…" indicator while a reply is in flight.
- `src/components/ChatWindow.jsx` — wires the two together, simulates an
  assistant reply after a short delay, and supports starting a new chat.

There's no backend: the "assistant" just echoes the message back after a
300ms delay, which is enough to exercise loading states.

## Running the app locally

Requires **Node.js 22+**.

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

## Running the tests locally

Component/unit tests (Vitest + React Testing Library, headless, runs in milliseconds):

```bash
npm test
```

End-to-end tests (Playwright, real Chromium + Firefox browsers against the running app):

```bash
npm run test:e2e          # headless, same as CI
npm run test:e2e:headed   # opens a visible browser window
npm run test:e2e:ui       # interactive UI mode — watch/step through each test
```

The first time, install the browser binaries once: `npx playwright install chromium firefox`.
Playwright starts the dev server automatically, so you don't need `npm run dev`
running first.

## What the tests cover

`src/components/ChatWindow.test.jsx` (Vitest + RTL) and `e2e/chat.spec.js`
(Playwright, run against both Chromium and Firefox) implement every test
case from the test case spreadsheet that is **(a)** marked "In Release Test
Plan? = Yes" and **(b)** actually exercisable by this minimal app (no
accounts, no backend, no real network calls). Tests are listed in the same
order as the spreadsheet: by **Risk**, then **Priority**. A separate block
covers one extra, non-release scenario (TC-003) kept from earlier work.

| Test ID | Risk | Priority | Scenario                                                    | Unit (RTL) | E2E (Playwright) |
| ------- | ---- | -------- | ------------------------------------------------------------ | :--------: | :---------------: |
| TC-001  | High | Critical | Sends a valid message using the Send button                  | ✅ | ✅ |
| TC-002  | High | Critical | Submits a valid message using Enter                           | ✅ | ✅ |
| TC-007  | High | Critical | The user message appears once and in the correct order        | ✅ |    |
| TC-008  | High | Critical | The assistant response begins rendering after submission      | ✅ |    |
| TC-009  | High | Critical | The response does not duplicate or corrupt content            | ✅ |    |
| TC-013  | High | Critical | Rapid repeated Send actions do not create duplicate messages  | ✅ | ✅ |
| TC-014  | High | Critical | A second prompt can be sent after the first response completes| ✅ |    |
| TC-015  | High | Critical | A follow-up preserves the existing conversation                | ✅ |    |
| TC-016  | High | Critical | "New Chat" creates a clean conversation                        | ✅ | ✅ |
| TC-036  | High | Critical | HTML/script content is rendered safely, not executed           | ✅ | ✅ |
| TC-051  | High | Critical | Primary chat flow works on each officially supported browser   | — | ✅ (chromium + firefox projects) |
| TC-004  | Medium | High   | Send is disabled when the input is empty                      | ✅ | ✅ |
| TC-005  | Medium | High   | Whitespace-only input cannot be submitted                      | ✅ |    |
| TC-006  | Medium | High   | The input remains editable before submission                  | ✅ |    |
| TC-010  | Medium | High   | A generating indicator is visible while waiting for a reply    | ✅ | ✅ |
| TC-045  | Medium | High   | Composer, Send and New Chat are reachable by keyboard          | ✅ |    |
| TC-003  | *(not in Release Test Plan)* | Shift+Enter inserts a line break without sending | ✅ | |

**Spreadsheet cases intentionally not automated:** TC-017/018/019/020
(conversation history list — not built), TC-011/012 (Stop-generation button
— not built), TC-037/038/039 (real network-failure simulation — app has no
backend), TC-042/043/044 (multi-account isolation — app has no accounts).
Building those features was out of scope to keep this exercise small; see
the test case spreadsheet for the full set.

The Playwright subset covers the highest-risk, most visual flows (not
every unit test) — the RTL suite already gives full component-level
coverage; while the e2e suite proves the same critical flows work in real browsers end-to-end and avoids unnecessary duplication.

## CI

`.github/workflows/ci.yml` runs on every push and pull request to `main`:
installs dependencies, runs the unit tests, installs the Playwright browsers
(Chromium + Firefox) and runs the e2e tests (headless, both browsers), then
builds the app — so a broken test or build fails the check.

## Tech choices

- **Vite + React** for a minimal, fast app shell — no router, no state
  library, no backend; just enough components to exercise real chat UI
  behavior.
- **Vitest + React Testing Library** for the bulk of the tests, since they
  run in the same toolchain as the app and test the UI the way a user
  interacts with it (by role/label/text, not internals).
- **Playwright** for a small e2e layer on top, to verify the same key flows
  in real browsers (including cross-browser coverage for TC-051) and to
  make the suite watchable/demoable (`--headed` / `--ui`), which
  jsdom-based tests can't offer.

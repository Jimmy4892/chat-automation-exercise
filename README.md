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

End-to-end tests (Playwright, real Chromium browser against the running app):

```bash
npm run test:e2e          # headless, same as CI
npm run test:e2e:headed   # opens a visible browser window
npm run test:e2e:ui       # interactive UI mode — watch/step through each test
```

The first time, install the browser binary once: `npx playwright install chromium`.
Playwright starts the dev server automatically, so you don't need `npm run dev`
running first.

## What the tests cover

`src/components/ChatWindow.test.jsx` (Vitest + RTL) and `e2e/chat.spec.js`
(Playwright) are a small, representative slice of a larger manual test case
list for this type of chat UI. Each test name is tagged with the
corresponding test case ID for traceability:

| Test ID | Scenario                                                    | Unit (RTL) | E2E (Playwright) |
| ------- | ------------------------------------------------------------ | :--------: | :---------------: |
| TC-001  | Sends a valid message using the Send button                  | ✅ | ✅ |
| TC-002  | Submits a valid message using Enter                           | ✅ | ✅ |
| TC-003  | Shift+Enter inserts a line break without sending              | ✅ |    |
| TC-004  | Send is disabled when the input is empty                     | ✅ | ✅ |
| TC-005  | Whitespace-only input cannot be submitted                    | ✅ |    |
| TC-007  | The user message appears once and in the correct order        | ✅ |    |
| TC-010  | A generating indicator is visible while waiting for a reply   | ✅ | ✅ |
| TC-016  | "New Chat" creates a clean conversation                       | ✅ | ✅ |

The Playwright subset deliberately covers only the key user-facing flows
(not every unit test) — the RTL suite already gives full component-level
coverage; the e2e suite exists to prove the same flows work in a real
browser end-to-end.

## CI

`.github/workflows/ci.yml` runs on every push and pull request to `main`:
installs dependencies, runs the unit tests, installs the Playwright browser
and runs the e2e tests (headless), then builds the app — so a broken test
or build fails the check.

## Tech choices

- **Vite + React** for a minimal, fast app shell — no router, no state
  library, no backend; just enough components to exercise real chat UI
  behavior.
- **Vitest + React Testing Library** for the bulk of the tests, since they
  run in the same toolchain as the app and test the UI the way a user
  interacts with it (by role/label/text, not internals).
- **Playwright** for a small e2e layer on top, to verify the same key flows
  in a real browser and to make the suite watchable/demoable (`--headed` /
  `--ui`), which jsdom-based tests can't offer.

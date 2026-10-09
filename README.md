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

```bash
npm test
```

Runs the Vitest + React Testing Library suite once (no watch mode).

## What the tests cover

The suite in `src/components/ChatWindow.test.jsx` is a small, representative
slice of a larger manual test case list for this type of chat UI. Each test
name is tagged with the corresponding test case ID for traceability:

| Test ID | Scenario                                                    |
| ------- | ------------------------------------------------------------ |
| TC-001  | Sends a valid message using the Send button                  |
| TC-002  | Submits a valid message using Enter                           |
| TC-003  | Shift+Enter inserts a line break without sending              |
| TC-004  | Send is disabled when the input is empty                     |
| TC-005  | Whitespace-only input cannot be submitted                    |
| TC-007  | The user message appears once and in the correct order        |
| TC-010  | A generating indicator is visible while waiting for a reply   |
| TC-016  | "New Chat" creates a clean conversation                       |

## CI

`.github/workflows/ci.yml` runs on every push and pull request to `main`:
installs dependencies, runs the test suite, and builds the app, so a broken
test or build fails the check.

## Tech choices

- **Vite + React** for a minimal, fast app shell — no router, no state
  library, no backend; just enough components to exercise real chat UI
  behavior.
- **Vitest + React Testing Library** for tests, since they run in the same
  toolchain as the app (no extra browser install needed in CI) and test the
  UI the way a user interacts with it (by role/label/text, not internals).

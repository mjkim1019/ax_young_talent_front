# Project Task Status

| Task ID | Description | Complexity | Current Status | Notes |
|---------|-------------|------------|----------------|-------|
| `TM-01` | Migrate legacy Vite views to Next.js App Router segments | High | Pending | Blocked until Next.js scaffold lands (`docs/promptmate-prd.md:80`, `AGENTS.md:13`). |
| `TM-02` | Replace `onNavigate` with MobX store + context providers | High | Pending | Depends on Next.js routing foundation (`docs/promptmate-prd.md:142`). |
| `TM-03` | Consolidate mock data into `lib/mock/` with strict types | Medium | Completed | Inline arrays moved to `lib/mock/*`; components now import typed data. |
| `TM-04` | Implement `lib/sorting.ts` and timestamp formatting | Medium | Completed | Added ISO timestamps + shared sorting/formatting utilities. |
| `TM-05` | Expand file upload handling beyond `.txt` | High | Completed | Added `lib/fileParsers.ts` with DOC/DOCX/PDF 지원 + UI 경고. |
| `TM-06` | Transition styling to MUI v3 + Emotion token system | High | Pending | Large-scale UI sweep (`docs/promptmate-prd.md:147`, `AGENTS.md:17`). |
| `TM-07` | Establish manual + Vitest QA coverage for wizard | Medium | In Progress | Manual scripts drafted; tests outstanding (`AGENTS.md:42`). |

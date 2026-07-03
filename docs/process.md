# Process

## Checkpoint Cadence

Use this cadence for all active work:

1. Complete a checkpoint slice (for example `0.1`, `0.2`, `1.3`).
2. Run required checks:
   - `bash tests/no-secrets.sh`
   - task-specific tests for that checkpoint
3. Commit locally on `main`.
4. Push the commit to `origin` immediately.

Tags are reserved for full phase completion only.

## Phase Closeout Rule

Every phase ends with:

1. A commit on `main` that summarizes completed outcomes.
2. A phase tag in the form `phase-x-complete`.
3. A push of branch and tags to `origin`.
4. A clean secret scan (`bash tests/no-secrets.sh`) before push.
5. A phase-level TDD summary linked in commit notes or docs.

## Branching

- `main` is the default branch.
- Feature branches are optional and short-lived.
- Phase closeout always lands on `main`.

## Commit Style

Use concise Conventional Commit prefixes:

- `feat`: shipped behavior
- `chore`: repo/process/tooling changes
- `docs`: doc-only updates
- `test`: test-only changes

## Definition Of Ready

Work for a phase should not start until:

- Requirements and design sections are linked to the phase.
- The corresponding task slice has at least one test intent.
- Open architectural decisions are either resolved or tracked in ADRs.

## TDD Execution Standard

### Task-Level TDD

For each task:

1. Define behavior in a test first (`[T]` line in tasks).
2. Run the new test and confirm it fails for the expected reason.
3. Implement the minimum code to pass.
4. Refactor while keeping tests green.
5. Record any manual validation steps when automation is not yet possible.

### Phase-Level TDD Gate

A phase is not complete until:

1. All completed tasks in that phase have corresponding tests or explicit manual validation notes.
2. Regression checks pass for touched areas.
3. The secret scan passes.
4. The phase commit, tag, and push are complete.
5. `npm run verify:release` passes before clean public repo export or GitHub release creation.

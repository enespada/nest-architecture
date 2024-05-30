# [PROJECT_NAME] PROJECT_NAME

## 📝 Description

<div style="text-align: justify">
PROJECT_DESCRIPTION
</div>
<br />

## 👤 Team members

| Name      | E-mail     | Started at      |
| --------- | ---------- | --------------- |
| TEAM_NAME | TEAM_EMAIL | TEAM_STARTED_AT |

<br />

## 🌲 Branches

- **master**: should only contain changes to README and merges from the `develop` branch. Every merged commit from `develop` should be tagged accordingly.
- **develop**: working branch.

<br />

## 📦 Dependencies

- Node v14.20.0
- npm v6.14.17

<br />

## Installation

```bash
$ npm install
```

<br />

## Commit Message Convention

This app follows [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)

Commit message will be checked using [husky and commit lint](https://theodorusclarence.com/library/husky-commitlint-prettier), you can't commit if not using the proper convention below.

### Format

`<type>(optional scope): <description>`
Example: `feat(pre-event): add speakers section`

### 1. Type

Available types are:

- feat → Changes about addition or removal of a feature. Ex: `feat: add table on landing page`, `feat: remove table from landing page`
- fix → Bug fixing, followed by the bug. Ex: `fix: illustration overflows in mobile view`
- docs → Update documentation (README.md)
- style → Updating style, and not changing any logic in the code (reorder imports, fix whitespace, remove comments)
- chore → Installing new dependencies, or bumping deps
- refactor → Changes in code, same output, but different approach
- ci → Update github workflows, husky
- test → Update testing suite, cypress files
- revert → when reverting commits
- perf → Fixing something regarding performance (deriving state, using memo, callback)
- vercel → Blank commit to trigger vercel deployment. Ex: `vercel: trigger deployment`

### 2. Optional Scope

Labels per page Ex: `feat(pre-event): add date label`

\*If there is no scope needed, you don't need to write it

### 3. Description

Description must fully explain what is being done.

Add BREAKING CHANGE in the description if there is a significant change.

**If there are multiple changes, then commit one by one**

- After colon, there are a single space Ex: `feat: add something`
- When using `fix` type, state the issue Ex: `fix: file size limiter not working`
- Use imperative, and present tense: "change" not "changed" or "changes"
- Don't use capitals in front of the sentence
- Don't add full stop (.) at the end of the sentence

<br />

## Running the app

```bash
# development
$ npm run start:dev

# production mode
$ npm run start
```

<br />

## Deployment Firebase

```bash
# pre-production deployment
$ npm run firebase:deploy:pre

```

<br />

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

<br />

## License

Nest is [MIT licensed](LICENSE).

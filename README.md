# Bundle size github action

Actio to report bundle size difference

## Inputs

### `branch`

**Required** The name of the branch to compare to. Default `"main"`.

### `paths`

**Required** Paths to bundle size json files. Comma separated list. Default
`"/"`.

### `onlyDiff`

Report only differences. Default `"true"`.

### `comment`

Comment on the PR. Default `"true"`.

### `header`

Comment header. Default `"Bundle size report"`.

### `append`

Append or replace comment. Default `"false"`.

### `ghToken`

Github token.

## Outputs

The action will post a comment with differences and an action summary.

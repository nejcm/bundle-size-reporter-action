# Bundle size reporter github action

Action for reporting bundle size difference

## Inputs

`paths` - [**Required**] Paths to bundle size json files. Comma separated list.
Default: `"/"`.

`onlyDiff` - Report only differences. Default `"true"`.

## Outputs

`summary` - Table of bundle size differences in markdown format.

`reports` - Object holding all file/bundle reports.

## Usage

```
  - name: Checkout branch
    uses: actions/checkout@v3
    with:
      ref: 'test' # branch to compare to
      path: br-base # required
      token: ${{ secrets.GITHUB_TOKEN }}

  - name: 📄 Bundle size report
    uses: nejcm/bundle-size-diff-github-action@v1.0.0
    with:
      paths: 'packages/*/.size-snapshot.json' # paths to reports
      onlyDiff: 'true' # report only differences
```

### Post a comment and summary

```
  # post action summary
  - name: Bundle size summary
    if: ${{ steps.bundleSize.outputs.summary }} != ''
    run: |
      echo "${{ steps.bundleSize.outputs.summary }}" >> $GITHUB_STEP_SUMMARY

  # post PR comment
  - uses: marocchino/sticky-pull-request-comment@v2
    if: ${{ steps.bundleSize.outputs.summary }} != ''
    with:
      number: ${{ github.event.pull_request.number }}
      header: 'Bundle size'
      message: ${{ steps.bundleSize.outputs.summary }}
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

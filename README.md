# Bundle size reporter github action

Action for reporting bundle size difference. Works with bundle size json report
files (_rollup-plugin-size-snapshot_) or actual files. Check _reports_ and
_tests_ folder in the repository for examples.

## Inputs

**paths** - _[Required]_ Paths to bundle size json files or folder containing
files. Comma separated list.

**onlyDiff** - Report only differences. Default `"true"`.

**filter** - Regex filter based on file path.

**unit** - Size unit. Default `"KB"`. Options
`"B","KB","MB","GB","TB","PB","EB","ZB","YB"`

## Outputs

**summary** - `string` Table of bundle size differences in markdown format.

**reports** - `object` All file/bundle reports.

**hasDifferences** - `boolean` Did any bundle size change

## Usage

```yml
- name: Checkout branch
  uses: actions/checkout@v3
  with:
    ref: 'test' # branch to compare to
    path: br-base # required
    token: ${{ secrets.GITHUB_TOKEN }}

- name: Bundle size report
  uses: nejcm/bundle-size-reporter-action@v1.2.1
  with:
    paths: 'reports/**/*.json,assets/*'
    onlyDiff: 'true'
    filter: '.*\\.esm\\.js'
```

> Putting `~` in front of the path will combine all files under that folder and
> just calculate the total sum. Usefull when generated files inside the folder
> have hash names that change each time.

```yml
- name: Checkout branch
  uses: actions/checkout@v3
  with:
    ref: 'master' # branch to compare to
    path: br-base # required
    token: ${{ secrets.GITHUB_TOKEN }}

- name: Bundle size report
  uses: nejcm/bundle-size-reporter-action@v1.2.1
  with:
    paths: '~static/*'
```

### Github composite action

This useful
[composite action](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action)
will calculate bundle size difference, post a
[github action summary](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#adding-a-job-summary)
and a PR comment. First two steps are required but the others can be customized
based on your needs.

```yml
name: 'Bundle size reporter'
description: 'Post bundle size difference compared to another branch'
inputs:
  branch:
    description: 'Branch to compare to'
    required: true
    default: 'main'
  paths:
    description:
      'Paths to json file bundle size report or folder containing bundles'
    required: true
    default: '/'
  onlyDiff:
    description: 'Report only different sizes'
    required: false
    default: 'false'
  filter:
    description: 'Regex filter based on file path'
    required: false
  unit:
    description: 'Size unit'
    required: false
    default: 'KB'

  # Comment inputs
  comment:
    description: 'Post comment'
    required: false
    default: 'true'
  header:
    description: 'Comment header'
    required: false
    default: 'Bundle size report'
  append:
    description: 'Append comment'
    required: false
    default: 'false'
  ghToken:
    description: 'Github token'
    required: false

runs:
  using: 'composite'
  steps:
    # Checkout branch to compare to [required]
    - name: Checkout base branch
      uses: actions/checkout@v3
      with:
        ref: ${{ inputs.branch }}
        path: br-base
        token: ${{ inputs.ghToken }}

    # Generate the bundle size difference report [required]
    - name: Generate report
      id: bundleSize
      uses: nejcm/bundle-size-reporter-action@v1
      with:
        paths: ${{ inputs.paths }}
        onlyDiff: ${{ inputs.onlyDiff }}
        filter: ${{ inputs.filter }}
        unit: ${{ inputs.unit }}

    # Post github action summary
    - name: Post summary
      if: ${{ steps.bundleSize.outputs.hasDifferences == 'true' }} # post only in case of changes
      run: |
        echo '${{ steps.bundleSize.outputs.summary }}' >> $GITHUB_STEP_SUMMARY
      shell: bash

    # Post github action comment
    - name: Post comment
      uses: marocchino/sticky-pull-request-comment@v2
      if: ${{ steps.bundleSize.outputs.hasDifferences == 'true' }} # post only in case of changes
      with:
        number: ${{ github.event.pull_request.number }}
        header: ${{ inputs.header }}
        append: ${{ inputs.append }}
        message: '${{ steps.bundleSize.outputs.summary }}'
        GITHUB_TOKEN: ${{ inputs.ghToken }}
```

Using composite action

```yml
- name: 📄 Bundle size report
  uses: ./.github/actions/bundle-size # path to composite action
  with:
    paths: 'reports/**/*.json'
    onlyDiff: 'true'
    branch: 'develop' # branch to compare to
    header: 'Bundle size report' # PR comment header
    ghToken: ${{ secrets.GITHUB_TOKEN }} # github token
```

## Example

![Example](https://raw.githubusercontent.com/nejcm/bundle-size-reporter-action/master/example.jpg)

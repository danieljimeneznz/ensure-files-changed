# Ensure Files Changed

This action ensures that pull requests contain changes to the files listed in
the `file-names` array specified.

Full credit to: [syeutyu/validate-changed-files](https://github.com/syeutyu/validate-changed-files)

## Inputs

- `file-names`: An array of strings that represent the files that should be included in the PR.
- `token`: The GitHub token used to create an authenticated client.

## Example

```yml
name: 'build-test'
on:
  pull_request:
  push:
    branches:
      - "master"

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm ci
      - uses: danieljimeneznz/ensure-files-changed@v1.1.1
        with:
          file-names: '["package.json", "READMD.md"]'
          token: ${{ secrets.GITHUB_TOKEN }}
```

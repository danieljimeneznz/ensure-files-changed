# Ensure Files Changed

This action ensures that pull requests contain changes to the files listed in
the `require-change-file-patterns` array specified, it will fail if these files were not changed or if files were changed that exist in the `prevent-modification-file-patterns` array.

## Inputs

- `require-changes-to`: A list of files (or glob patterns) that represent the files that should be modified by a PR.
- `prevent-changes-to`: A list of files (or glob patterns) that represent the files that should not be modified by a PR.
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
      - uses: danieljimeneznz/ensure-files-changed@v4.1.0
        with:
          require-changes-to: |
            package.json
            *.md
          prevent-changes-to: |
            LICENSE.md
          token: ${{ secrets.GITHUB_TOKEN }}
```

---
Credit to [syeutyu/validate-changed-files](https://github.com/syeutyu/validate-changed-files) for providing the base code

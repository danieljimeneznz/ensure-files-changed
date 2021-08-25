# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.0.1] - 2021-08-25
### Fixed
- Using new `compareCommitsWithBaseHead` github endpoint as previously used endpoint removed in 5.0.0 upgrade

## 3.0.0 - 2021-08-25
### Added
- Changelog
- New action input `prevent-modification-file-patterns`
- Simple tests for logic changes

### Changed
- **BREAKING** Changed action input name `file-patterns` to be `require-change-file-patterns`
- Upgrade deps
  - @vercel/ncc      0.28.3  →  0.29.2
  - @actions/core     1.2.7  →   1.5.0
  - @actions/github   4.0.0  →   5.0.0

[Unreleased]: https://github.com/syeutyu/validate-changed-files/compare/v3.0.1...HEAD
[3.0.1]: https://github.com/syeutyu/validate-changed-files/compare/v3.0.0...v3.0.1

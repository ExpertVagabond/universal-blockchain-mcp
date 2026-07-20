# Vendored: @psm/mcp-core-ts

Copied verbatim from `github.com/ExpertVagabond/psm-mcp-core-ts` at
**v0.1.0** (commit `bb183ca`), on 2026-07-20.

## Why vendored

The package is unpublished (npm 404) and was consumed via a
`file:../psm-mcp-core-ts` dependency, which does not exist on a CI runner
— so `npm ci` in GitHub Actions could never resolve it. Vendoring the
source into the repo removes the external dependency entirely; these files
compile as part of the normal `tsc` build.

## Do not edit here

This is a copy. Change the upstream package and re-vendor. Excluded from
this repo's lint/format because it is third-party source.

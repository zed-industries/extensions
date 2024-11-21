#!/usr/bin/env bash

set -euo pipefail

! git submodule -q foreach 'echo $name $path' \
  | awk '$1 != $2 {print "Git submodule name/path mismatch:", $0}' \
  | grep 'mismatch'

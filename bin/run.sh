#!/bin/bash

set -euo pipefail

function normalize_dir() {
  cd -P "$1" >/dev/null 2>&1 && pwd
}

function unlink() {
  file="$1"
  while [ -L "${file}" ]; do
    # dereference symlink
    file="$(readlink "${file}")"
    # if symlink is relative, make it absolute
    [[ $file != /* ]] && file="$(normalize_dir "$(dirname "${file}")")/$file"
  done
  echo "${file}"
}

# Find correct base dir even when this entry point is symlinked
this_file="$(unlink "${BASH_SOURCE[0]}")"
base_dir="$(normalize_dir "$(dirname "${this_file}")/..")"
node \
  --experimental-loader "${base_dir}/loader.mjs" \
  --experimental-strip-types  \
  --disable-warning=ExperimentalWarning \
  "${base_dir}/src/main.ts" "$@"

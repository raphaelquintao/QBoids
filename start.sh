#!/usr/bin/env bash


PATH=${PATH}:${NPM}

browser-sync --no-notify --no-open --no-ui --no-inject-changes -w

#php -S 0.0.0.0:8000

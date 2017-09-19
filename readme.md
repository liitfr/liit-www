# liit-www

[![Build Status](https://travis-ci.org/liitfr/liit-www.svg?branch=master)](https://travis-ci.org/liitfr/liit-www)
[![dependencies Status](https://david-dm.org/liitfr/liit-www/status.svg)](https://david-dm.org/liitfr/liit-www)
[![Greenkeeper badge](https://badges.greenkeeper.io/liitfr/liit-www.svg)](https://greenkeeper.io/)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/6003f9844b694c7f9fee1f46280601ef)](https://www.codacy.com/app/liitfr/shiftstats?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=liitfr/shiftstats&amp;utm_campaign=Badge_Grade)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

LIIT website

## Setup

- make sure [node.js](http://nodejs.org) is at version >= `6`
- `npm i spike -g`
- clone this repo down and `cd` into the folder
- run `npm install`
- run `spike watch` or `spike compile`
- If you experience troubles when trying to `spike watch`, then execute `rm -rf .remote` before.

## Testing
Tests are located in `test/**` and are powered by [ava](https://github.com/sindresorhus/ava)
- `npm install` to ensure devDeps are installed
- `npm test` to run test suite

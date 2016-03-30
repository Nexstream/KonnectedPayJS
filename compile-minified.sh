#!/bin/bash

pushd "$(dirname "$0")" > /dev/null
uglifyjs src/konnectedpay.js -m -c --comments > src/konnectedpay.min.js
popd > /dev/null

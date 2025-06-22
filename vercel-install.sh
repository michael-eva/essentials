#!/bin/bash
# Move the real package.json back into place, overwriting the temporary one.
mv package.json.bak package.json

# Run the full monorepo install
npm install 
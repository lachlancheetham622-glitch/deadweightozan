#!/bin/bash
# Linux / anything else:  ./start.sh
cd "$(dirname "$0")"
URL=http://localhost:${PORT:-3000}
( sleep 2; (command -v xdg-open >/dev/null && xdg-open $URL) || true ) &
node server.js

#!/bin/bash
# Doble clic para ver el sitio en tu Mac (abre http://localhost:8000).
cd "$(dirname "$0")/site" || exit 1
( sleep 1.5; open "http://localhost:8000" ) &
echo "Sitio en http://localhost:8000 — cerrá esta ventana para detenerlo."
/usr/bin/ruby -run -e httpd . -p 8000 --bind-address=127.0.0.1

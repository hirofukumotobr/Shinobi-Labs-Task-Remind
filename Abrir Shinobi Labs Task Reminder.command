#!/bin/bash
cd "$(dirname "$0")"

if [ ! -d "node_modules" ]; then
  echo "Instalando dependências (só acontece na primeira vez)..."
  npm install
fi

( sleep 2 && open "http://localhost:5173" ) &

npm run dev

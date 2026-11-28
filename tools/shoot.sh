#!/bin/sh
# Real renders of app/ in headless Chrome. Run from the repo root: sh tools/shoot.sh
node serve.ts --port 8099 & PID=$!; sleep 2
shot(){
  google-chrome --headless=new --no-sandbox --disable-gpu --hide-scrollbars \
    --window-size="$2" --virtual-time-budget=4000 --screenshot=/tmp/_s.png \
    "http://localhost:8099/#/$3" >/dev/null 2>&1 || return 1
  # Start at JPEG quality 82; lower to 70 if needed, then reduce further
  # until the file is strictly under 250 KiB. Always encode the real render.
  quality=82
  while :; do
    convert /tmp/_s.png -quality "$quality" "screenshots/$1" || return 1
    bytes=$(wc -c < "screenshots/$1")
    [ "$bytes" -lt 256000 ] && break
    if [ "$quality" -le 10 ]; then
      echo "Screenshot $1 still exceeds the 250 KiB limit" >&2
      return 1
    fi
    if [ "$quality" -eq 82 ]; then quality=70; else quality=$((quality - 10)); fi
  done
}
rm -f screenshots/*
shot 1-overview.jpg 1280,1500 ""
shot 2-indicator.jpg 1280,1500 "indicator/NY.GDP.PCAP.CD"
shot 3-compare.jpg 1280,1500 "compare/NY.GDP.MKTP.CD/SP.POP.TOTL"
shot 4-phone.jpg 390,1300 ""
kill $PID

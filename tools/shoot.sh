#!/bin/sh
# Real renders of app/ in headless Chrome. Run from the repo root: sh tools/shoot.sh
node serve.ts --port 8099 & PID=$!; sleep 2
shot(){ google-chrome --headless=new --no-sandbox --disable-gpu --hide-scrollbars --window-size=$2 --virtual-time-budget=4000 --screenshot=/tmp/_s.png "http://localhost:8099/#/$3" >/dev/null 2>&1; convert /tmp/_s.png -quality 82 screenshots/$1; }
rm -f screenshots/*
shot 1-overview.jpg 1280,800 ""
shot 2-indicator.jpg 1280,800 "indicator/NY.GDP.PCAP.CD"
shot 3-compare.jpg 1280,800 "compare/NY.GDP.MKTP.CD/SP.POP.TOTL"
shot 4-phone.jpg 390,844 ""
kill $PID

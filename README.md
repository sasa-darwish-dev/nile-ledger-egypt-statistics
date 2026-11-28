# nile-ledger-egypt-statistics

[![make.fun · best-national-statistics-site-20261126-0539](https://make.fun/badge/best-national-statistics-site-20261126-0539.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539?utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539)
[![rank](https://make.fun/badge/best-national-statistics-site-20261126-0539/sasa-darwish-dev/nile-ledger-egypt-statistics/rank.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539)
[![reward](https://make.fun/badge/best-national-statistics-site-20261126-0539/sasa-darwish-dev/nile-ledger-egypt-statistics/reward.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539?utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539)

Nile Ledger is a self-contained, static statistics site for Egypt. It turns the supplied World Bank Open Data, World Development Indicators series into an overview dashboard, one page per indicator, an indexed comparison tool, topic browsing, and a concise source and methods guide.

The data pages show annual values, source notes, and CSV downloads. The overview includes latest-value cards, sparks, a topic filter, and a searchable directory. Comparison indexes two series to 100 at the first year they share. A responsive layout, keyboard-friendly navigation and controls, and a working light/dark switch are included.

The site uses only local files, system fonts, and hand-drawn SVG charts. No build step or network request is required. Open `app/index.html` directly, or run `node serve.ts` and visit `http://localhost:8080`. Run `tools/shoot.sh` to regenerate the four review screenshots. The figures are kept in app/data.js; the original series were retrieved 26 Nov 2026 and seven additional World Bank indicators were retrieved 28 Nov 2026. The dataset retrieval date is 2026-11-28. Series can be modelled estimates and may have gaps or later revisions. See About & Sources in the site for methodology and limitations.

## Run it

```sh
node serve.ts   # then open http://localhost:8080
MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=61yzanyh&utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539) · AI agents build software for cash rewards</sub>

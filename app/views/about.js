import { DATA, indicators, topics } from '../state.js';
import { citation } from './shared.js';

function sourceDetails() {
  return `<section class="panel">
    <p class="eyebrow">ONE SOURCE, CLEARLY CITED</p>
    <h2>World Development Indicators</h2>
    <p>All figures on Nile Ledger come from World Bank Open Data, World Development Indicators. The supplied data contains ${indicators.length} indicators for Egypt. Each chart, table and latest-value card names the source and observation year.</p>
    <p><strong>Data retrieved:</strong> ${DATA.retrieved}.<br>
      <strong>Country:</strong> Egypt (EGY).<br>
      <strong>Topics:</strong> ${topics.join(', ')}.</p>
    <p>Values and labels are shown as supplied, with compact display formatting where helpful. Download CSV on an indicator page to inspect its raw observations.</p>
    ${citation(`retrieved ${DATA.retrieved}`)}
  </section>`;
}

function methods() {
  return `<section class="panel">
    <p class="eyebrow">METHOD & LIMITATIONS</p>
    <h2>Read with care.</h2>
    <p>Annual observations are not always available for every year. We show each series as supplied and leave gaps visible; charts do not fill missing years.</p>
    <p>Some figures are modelled estimates, including labour-force unemployment. Estimates are subject to revision and can differ from national survey releases.</p>
    <p>Current US dollar GDP values are not adjusted for inflation or exchange-rate effects. National averages do not describe differences between places or people.</p>
    <p>Ten-year change is the relative difference between the latest observation and the observation exactly ten years earlier. If that year is absent, it is shown as unavailable. Level-series comparisons use a common first observation indexed to 100; rates stay in their own units.</p>
    <p>This is a static educational reference, not an official release or forecast.</p>
  </section>`;
}

export function about() {
  return `<div class="page-heading">
    <div>
      <p class="eyebrow">THE PROJECT / NOTES & SOURCES</p>
      <h1>Numbers need context.</h1>
      <p class="intro">A compact, transparent window into selected development indicators for Egypt.</p>
    </div>
  </div>
  <div class="detail-bottom about-grid">
    ${sourceDetails()}
    ${methods()}
  </div>
  <section class="panel source-panel">
    <p class="eyebrow">A SMALL, OPEN TOOL</p>
    <h2>Built for a closer look.</h2>
    <p>Nile Ledger is a no-network static site. Charts, tables, CSV export and topic browsing run in your browser from the supplied World Bank series.</p>
    <a class="text-link" href="#/">Return to the overview ↗</a>
  </section>`;
}

import { getIndicator, indicators, latest, title, topics } from '../state.js';
import { bindChart, chart } from '../charts.js';
import { value } from '../format.js';
import { card, citation, directory } from './shared.js';

function focusPanel(indicator) {
  return `<section class="panel trend">
    <div class="panel-heading">
      <div>
        <p class="eyebrow">ECONOMY / IN FOCUS</p>
        <h2>The shape of Egypt’s economy</h2>
        <p class="small">Gross domestic product · current US dollars</p>
      </div>
      <a class="text-link" href="#/indicator/${indicator.code}">Explore data ↗</a>
    </div>
    ${chart([{ name: 'GDP', series: indicator.series }], { unit: indicator.unit, height: 220 })}
    ${citation('2012–2025', 2025)}
  </section>`;
}

function readingPanel() {
  const codes = ['IT.NET.USER.ZS', 'SP.URB.TOTL.IN', 'SH.DYN.MORT'];
  const indicatorsHtml = codes.map((code) => {
    const item = getIndicator(code);
    const [year, amount] = latest(item);
    const unit = item.unit === 'per 1,000'
      ? 'per 1,000 live births'
      : item.unit === '%'
        ? 'of population'
        : item.unit;

    return `<a href="#/indicator/${code}" class="mini-stat">
      <span>${title(item)}<small title="${year === 2025 ? 'WB estimate — latest year may be a World Bank estimate and can be revised.' : ''}">${year}${year === 2025 ? ' · WB estimate' : ''} · ${unit}</small></span>
      <b>${value(amount, item.unit)} ↗</b>
    </a>`;
  }).join('');

  return `<aside class="panel reading">
    <p class="eyebrow">BEYOND THE HEADLINES</p>
    <h2>Connected.<br>Living longer.<br>Changing.</h2>
    <p>Three more ways to read Egypt’s development.</p>
    ${indicatorsHtml}
    ${citation()}
  </aside>`;
}

export function overview() {
  const gdp = getIndicator('NY.GDP.MKTP.CD');
  const headlineCards = [
    indicators[0],
    gdp,
    getIndicator('SP.DYN.LE00.IN'),
  ].map(card).join('');
  const topicButtons = ['All indicators', ...topics].map((topic, index) => `
    <button class="chip ${index === 0 ? 'selected' : ''}"
      data-topic="${index ? topic : 'All'}" aria-pressed="${index === 0}">${topic}</button>
  `).join('');

  return `<div class="page-heading overview-heading">
    <div>
      <p class="eyebrow">THE EGYPT OBSERVATORY / OVERVIEW</p>
      <h1>A country, in perspective.</h1>
      <p class="intro">Follow the numbers shaping Egypt’s economy and everyday life.</p>
    </div>
    <span class="country-stamp">EGY <span>Arab Republic<br>of Egypt</span></span>
  </div>
  <div class="section-bar">
    <span class="eyebrow">THE LATEST PICTURE</span>
    <span class="small overview-method">Card change uses values 10 years apart when available · GDP chart: 2012–2025</span>
  </div>
  <div class="cards">${headlineCards}</div>
  <div class="dashboard-grid">
    ${focusPanel(gdp)}
    ${readingPanel()}
  </div>
  <section class="library">
    <div class="section-bar">
      <div><p class="eyebrow">THE DATA DIRECTORY</p><h2>Explore every indicator</h2></div>
      <a class="text-link" href="#/compare">Compare trends ↗</a>
    </div>
    <div class="filters" role="group" aria-label="Filter by topic">${topicButtons}</div>
    <div id="directory-results">${directory(indicators)}</div>
  </section>`;
}

export function bindOverview(root) {
  const gdp = getIndicator('NY.GDP.MKTP.CD');
  bindChart(root, [{ name: 'GDP', series: gdp.series }], { unit: gdp.unit });
}

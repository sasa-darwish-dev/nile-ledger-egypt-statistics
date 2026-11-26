import { change, latest, source, title, topicOf } from '../state.js';
import { signed, unitLabel, value } from '../format.js';
import { sparkline } from '../charts.js';

export const estimateNote = 'WB estimate — latest year may be a World Bank estimate and can be revised.';

export function citation(extra = '', latestYear) {
  const note = latestYear === 2025 ? `<span class="estimate-note"> · ${estimateNote}</span>` : '';
  return `<p class="source">Source: ${source}${extra ? ` · ${extra}` : ''}${note}</p>`;
}

export function card(indicator) {
  const [year, amount] = latest(indicator);
  const tenYearChange = change(indicator);

  const estimate = year === 2025 ? ` · WB estimate. ${estimateNote}` : '';
  const shortEstimate = year === 2025 ? ' · WB estimate' : '';

  return `<a class="metric-card" href="#/indicator/${indicator.code}">
    <div class="card-top">
      <span class="eyebrow">${topicOf(indicator)}</span>
      <span class="arrow" aria-hidden="true">↗</span>
    </div>
    <h3>${title(indicator)}</h3>
    <div class="metric">${value(amount, indicator.unit)} <small>${year}</small></div>
    <div class="metric-bottom">
      <span>${tenYearChange
        ? `<b>${signed(tenYearChange.value)}</b><br>10-year change · ${tenYearChange.from}–${tenYearChange.to}`
        : '10-year change unavailable'}</span>
      ${sparkline(indicator.series)}
    </div>
    <div class="card-source" title="${source} · ${year}${estimate}" aria-label="Source: ${source} · ${year}${estimate}">World Bank WDI${shortEstimate}</div>
  </a>`;
}

export function directory(items) {
  const rows = items.map((indicator) => {
    const [year, amount] = latest(indicator);
    return `<a class="data-row" href="#/indicator/${indicator.code}">
      <span><b>${title(indicator)}</b><small>${unitLabel(indicator.unit)}</small></span>
      <span class="row-value">${value(amount, indicator.unit)}<small title="${year === 2025 ? estimateNote : ''}">${year}${year === 2025 ? ' · WB estimate' : ''} <span aria-hidden="true">↗</span></small></span>
    </a>`;
  }).join('');

  return `<div class="directory">${rows}</div>${citation('latest available observation shown for each indicator')}`;
}

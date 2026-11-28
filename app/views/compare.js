import { getIndicator, indicators, latest, title } from '../state.js';
import { value } from '../format.js';
import { bindChart, chart } from '../charts.js';
import { citation } from './shared.js';

const options = (selected) => indicators.map((indicator) => `
  <option value="${indicator.code}" ${indicator.code === selected ? 'selected' : ''}>${title(indicator)}</option>
`).join('');

const isLevel = (indicator) => ['usd', 'people'].includes(indicator.unit);

function sharedYears(first, second) {
  return first.series.map((point) => point[0])
    .filter((year) => second.series.some((point) => point[0] === year));
}

function indexSeries(indicator, years, baseYear) {
  const base = indicator.series.find((point) => point[0] === baseYear)[1];
  return years.map((year) => {
    const amount = indicator.series.find((point) => point[0] === year)[1];
    return [year, amount / base * 100];
  });
}

function selectPair(first, second) {
  return `<div class="select-pair">
    <label>First indicator<select id="pick-a">${options(first.code)}</select></label>
    <span class="versus">vs</span>
    <label>Second indicator<select id="pick-b">${options(second.code)}</select></label>
  </div>`;
}

function latestLegend(indicator) {
  const [year, amount] = latest(indicator);
  return `<span>${title(indicator)}<small>${year} · ${value(amount, indicator.unit)}</small></span>`;
}

function compareChart(first, second, years, indexed) {
  if (!years.length) {
    return '<p class="method-line">These series have no shared observation years. Choose another pair to compare; the latest values for each series are shown below.</p>';
  }
  if (indexed) {
    const baseYear = years[0];
    const series = [first, second].map((indicator) => ({
      name: title(indicator),
      series: indexSeries(indicator, years, baseYear),
    }));
    return `<div class="legend">
      <span class="legend-a">${latestLegend(first)}</span>
      <span class="legend-b">${latestLegend(second)}</span>
    </div>
    ${chart(series, { indexed: true, id: 'compare-indexed', height: 250 })}
    <p class="method-line">Both level series are indexed to 100 in ${baseYear}; only shared observation years are shown.</p>`;
  }

  const firstSeries = [{
    name: title(first),
    series: years.map((year) => [year, first.series.find((point) => point[0] === year)[1]]),
  }];
  const secondSeries = [{
    name: title(second),
    series: years.map((year) => [year, second.series.find((point) => point[0] === year)[1]]),
  }];

  return `<div class="small-multiples">
    <section class="small-multiple">
      <h2>${title(first)} <small>${first.unit === 'usd' ? 'current US dollars' : first.unit}</small></h2>
      ${chart(firstSeries, { unit: first.unit, id: 'compare-first', height: 185 })}
    </section>
    <section class="small-multiple">
      <h2>${title(second)} <small>${second.unit === 'usd' ? 'current US dollars' : second.unit}</small></h2>
      ${chart(secondSeries, { unit: second.unit, id: 'compare-second', height: 185 })}
    </section>
  </div>
  <p class="method-line">Separate charts keep each indicator in its real unit; both show the shared observation years (${years[0]}–${years.at(-1)}).</p>`;
}

export function compare(firstCode = 'NY.GDP.MKTP.CD', secondCode = 'SP.POP.TOTL') {
  const first = getIndicator(firstCode);
  const second = getIndicator(secondCode);
  const years = sharedYears(first, second);
  const indexed = isLevel(first) && isLevel(second);

  return `<a class="breadcrumb" href="#/">Overview</a>
    <div class="page-heading compare-heading">
      <div>
        <p class="eyebrow">THE COMPARISON ROOM</p>
        <h1>Two stories, side by side.</h1>
        <p class="intro">Compare annual observations with a clear view of each series.</p>
      </div>
    </div>
    <section class="panel compare-panel">
      ${selectPair(first, second)}
      ${compareChart(first, second, years, indexed)}
      ${citation(years.length ? `${years[0]}–${years.at(-1)}` : 'Latest observations shown with their individual years', [latest(first)[0], latest(second)[0]].includes(2025) ? 2025 : undefined)}
    </section>
    <div class="detail-bottom comparison-notes">
      <section class="panel">
        <p class="eyebrow">LATEST OBSERVATIONS</p>
        <h2>Keep the units in view</h2>
        <p>${title(first)}: ${value(latest(first)[1], first.unit)} in ${latest(first)[0]}.</p>
        <p>${title(second)}: ${value(latest(second)[1], second.unit)} in ${latest(second)[0]}.</p>
      </section>
      <section class="panel">
        <p class="eyebrow">ABOUT THIS VIEW</p>
        <h2>Compare movement, not magnitude</h2>
        <p>${indexed
          ? 'Indexing compares proportional movement while keeping the original units on the indicator pages.'
          : 'For rates and percentages, each chart keeps its own scale and original units. No rate is indexed to 100.'}</p>
      </section>
    </div>`;
}

export function bindCompare(root, firstCode, secondCode) {
  const first = getIndicator(firstCode);
  const second = getIndicator(secondCode);
  const years = sharedYears(first, second);
  const indexed = isLevel(first) && isLevel(second);

  if (indexed && years.length) {
    const baseYear = years[0];
    const sets = [first, second].map((indicator) => ({
      name: title(indicator),
      series: indexSeries(indicator, years, baseYear),
    }));
    bindChart(root, sets, { indexed: true });
  } else if (years.length) {
    const sets = [first, second].map((indicator) => [{
      name: title(indicator),
      series: years.map((year) => [year, indicator.series.find((point) => point[0] === year)[1]]),
    }]);
    bindChart(root, sets, { units: [first.unit, second.unit] });
  }

  for (const id of ['pick-a', 'pick-b']) {
    root.querySelector(`#${id}`).onchange = (event) => {
      const nextFirst = id === 'pick-a' ? event.target.value : firstCode;
      const nextSecond = id === 'pick-b' ? event.target.value : secondCode;
      location.hash = `#/compare/${nextFirst}/${nextSecond}`;
    };
  }
}

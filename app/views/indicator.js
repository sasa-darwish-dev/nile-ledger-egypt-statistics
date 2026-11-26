import { change, getIndicator, latest, topicOf, title } from '../state.js';
import { number, signed, unitLabel, value } from '../format.js';
import { bindChart, chart } from '../charts.js';
import { citation } from './shared.js';

function peakSummary(indicator) {
  const peak = indicator.series.reduce((highest, point) => point[1] > highest[1] ? point : highest);
  const [latestYear, latestValue] = latest(indicator);

  if (peak[0] === latestYear) {
    return `The latest reading is the highest in this series so far, recorded in ${peak[0]}.`;
  }

  const difference = (latestValue / peak[1] - 1) * 100;
  const direction = difference < 0 ? 'below' : 'above';
  return `The highest reading was ${value(peak[1], indicator.unit)} in ${peak[0]}; the latest is ${number(Math.abs(difference), 1)}% ${direction} that high (${latestYear}).`;
}

function observations(indicator) {
  const rows = [...indicator.series].reverse().map((point) => {
    const index = indicator.series.indexOf(point);
    const previous = indicator.series[index - 1];
    const annualChange = previous && point[0] - previous[0] === 1
      ? signed((point[1] / previous[1] - 1) * 100)
      : '—';

    return `<tr>
      <th scope="row">${point[0]}</th>
      <td>${value(point[1], indicator.unit, false)}</td>
      <td>${annualChange}</td>
    </tr>`;
  }).join('');

  return `<table>
    <caption>${indicator.name} · ${unitLabel(indicator.unit)}</caption>
    <thead><tr><th scope="col">Year</th><th scope="col">Value</th><th scope="col">Annual change</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

export function indicator(code) {
  const item = getIndicator(code);
  const [year, amount] = latest(item);
  const sinceFirst = change(item, false);
  const tenYear = change(item);

  return `<a class="breadcrumb" href="#/">Overview</a>
    <span class="breadcrumb"> / ${topicOf(item)} / Indicator</span>
    <div class="detail-heading">
      <div>
        <p class="eyebrow">${topicOf(item)} / ${item.code}</p>
        <h1>${title(item)}</h1>
        <p class="intro">${item.name}</p>
      </div>
      <button class="button" id="download">Download CSV ↓</button>
    </div>
    <div class="detail-summary">
      <div>
        <span class="eyebrow">LATEST OBSERVATION</span>
        <div class="big-value">${value(amount, item.unit)} <small>${year}</small></div>
      </div>
      <div>
        <span class="eyebrow">10-YEAR CHANGE</span>
        <strong>${tenYear ? signed(tenYear.value) : 'Unavailable'}</strong>
        <span class="small">${tenYear ? `${tenYear.from}–${tenYear.to} · relative change` : 'No observation 10 years earlier'}</span>
      </div>
      <div>
        <span class="eyebrow">SINCE ${sinceFirst.from}</span>
        <strong>${signed(sinceFirst.value)}</strong>
        <span class="small">${sinceFirst.from}–${sinceFirst.to} · relative change</span>
      </div>
    </div>
    <section class="panel indicator-chart-panel">
      <div class="panel-heading">
        <div><h2>A longer view</h2><p class="small">${unitLabel(item.unit)} · annual observations</p></div>
        <label class="toggle-label"><input id="compare-toggle" type="checkbox"> Compare with another indicator</label>
      </div>
      ${chart([{ name: title(item), series: item.series }], { unit: item.unit, height: 230 })}
      ${citation(`${item.series[0][0]}–${year}`, year)}
    </section>
    <div class="detail-bottom">
      <section class="panel observations-panel">
        <div class="panel-heading"><h2>The observations</h2><span class="small">All available years</span></div>
        ${citation(`${item.series[0][0]}–${year}`, year)}
        <div class="table-scroll">${observations(item)}</div>
        <button class="button table-download" id="download-table">Download these years ↓</button>
      </section>
      <aside class="panel notes">
        <p class="eyebrow">WHAT THIS MEANS</p>
        <p class="insight">${peakSummary(item)}</p>
        <p>${item.unit === 'usd'
          ? 'Current-dollar values reflect economic activity as well as price and exchange-rate movements. They are not adjusted for inflation.'
          : item.code === 'SL.UEM.TOTL.ZS'
            ? 'This series uses modelled ILO estimates. Estimates may differ from national survey results.'
            : 'Values describe a national average and do not show differences between regions or population groups.'}</p>
        <p>Lines connect available observations. Missing years are not estimated here. Relative changes are calculated from the supplied values.</p>
        <a class="text-link" href="#/about">Read the source notes ↗</a>
      </aside>
    </div>`;
}

function downloadCsv(item) {
  const heading = 'Indicator,Code,Year,Value,Unit,Source';
  const rows = item.series.map((point) => [
    item.name,
    item.code,
    point[0],
    point[1],
    item.unit,
    'World Bank Open Data, World Development Indicators',
  ].map((field) => `"${String(field).replaceAll('"', '""')}"`).join(','));
  const csv = [heading, ...rows].join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `egypt-${item.code}.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function bindIndicator(root, code) {
  const item = getIndicator(code);
  bindChart(root, [{ name: title(item), series: item.series }], { unit: item.unit });
  root.querySelector('#compare-toggle').onchange = () => {
    location.hash = `#/compare/${item.code}`;
  };
  root.querySelector('#download').onclick = () => downloadCsv(item);
  root.querySelector('#download-table').onclick = () => downloadCsv(item);
}

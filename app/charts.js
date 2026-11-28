import { number, value } from './format.js';

const WIDTH = 1000;
const LEFT = 68;
const RIGHT = 24;
const TOP = 18;
const BOTTOM = 32;

export function niceScale(minimum, maximum, targetTicks = 5) {
  if (minimum === maximum) {
    const padding = Math.abs(minimum) * 0.1 || 1;
    minimum -= padding;
    maximum += padding;
  }

  const rawStep = (maximum - minimum) / (targetTicks - 1);
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const fraction = rawStep / magnitude;
  const stepFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  const step = stepFraction * magnitude;
  const low = Math.floor(minimum / step) * step;
  const high = Math.ceil(maximum / step) * step;
  const ticks = [];

  for (let tick = low; tick <= high + step * 1e-9; tick += step) {
    ticks.push(Number(tick.toPrecision(12)));
  }

  return { min: low, max: high, step, ticks };
}

export function sparkline(series) {
  const values = series.map((point) => point[1]);
  const low = Math.min(...values);
  const high = Math.max(...values);
  const points = values.map((item, index) => {
    const x = values.length === 1 ? 90 : index / (values.length - 1) * 180;
    const y = 38 - (item - low) / (high - low || 1) * 30;
    return `${x},${y}`;
  }).join(' ');

  return `<svg class="spark" viewBox="0 0 184 44" aria-hidden="true">
    <polyline points="${points}" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke" />
    ${values.length === 1 ? '<circle cx="90" cy="38" r="3" fill="currentColor" />' : ''}
  </svg>`;
}

export function chart(sets, options = {}) {
  const { indexed = false, unit = '', id = 'chart', height = 250 } = options;
  const allPoints = sets.flatMap((set) => set.series);
  const years = allPoints.map((point) => point[0]);
  const values = allPoints.map((point) => point[1]);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  let low = Math.min(...values);
  let high = Math.max(...values);
  const padding = (high - low) * 0.08 || 1;
  low = Math.max(0, low - padding);
  high += padding;
  const scale = niceScale(low, high);
  low = scale.min;
  high = scale.max;

  const x = (year) => minYear === maxYear
    ? LEFT + (WIDTH - LEFT - RIGHT) / 2
    : LEFT + (year - minYear) / (maxYear - minYear) * (WIDTH - LEFT - RIGHT);
  const y = (valueAtYear) => height - BOTTOM - (valueAtYear - low) / (high - low) * (height - TOP - BOTTOM);
  const format = (numberAtTick) => indexed ? number(numberAtTick, 0) : value(numberAtTick, unit);
  const yTicks = scale.ticks;
  const xTicks = [minYear, ...(maxYear - minYear > 6 ? [minYear + 4, minYear + 8] : []), maxYear]
    .filter((year, index, array) => array.indexOf(year) === index);

  const grid = yTicks.map((tick) => `
    <line x1="${LEFT}" y1="${y(tick)}" x2="${WIDTH - RIGHT}" y2="${y(tick)}" class="gridline" />
    <text x="${LEFT - 12}" y="${y(tick) + 4}" text-anchor="end">${format(tick)}</text>
  `).join('');
  const yearsLabels = xTicks.map((year) => `
    <text x="${x(year)}" y="${height - 8}" text-anchor="middle">${year}</text>
  `).join('');
  const lines = sets.map((set, index) => `
    <polyline points="${set.series.map((point) => `${x(point[0])},${y(point[1])}`).join(' ')}" class="series series-${index}" />
    ${set.series.map((point) => `<circle cx="${x(point[0])}" cy="${y(point[1])}" r="4" class="dot series-${index}" />`).join('')}
  `).join('');
  const latestValues = sets.map((set) => {
    const point = set.series.at(-1);
    return `${set.name}: ${format(point[1])} (${point[0]})`;
  }).join(' · ');

  return `<div class="chart-wrap" data-chart="${id}" data-min-year="${minYear}" data-max-year="${maxYear}">
    <svg class="line-chart" style="--chart-h:${height}px" viewBox="0 0 ${WIDTH} ${height}" preserveAspectRatio="none" role="img"
      aria-label="${sets.map((set) => set.name).join(' and ')} annual ${indexed ? 'indexed ' : ''}trend, ${minYear} to ${maxYear}">
      ${grid}${yearsLabels}${lines}
    </svg>
    <div class="chart-readout" aria-live="polite">${latestValues}</div>
    <input class="chart-slider" type="range" min="${minYear}" max="${maxYear}" value="${maxYear}" step="1" aria-label="Explore chart by year">
    <span class="chart-hint">Hover the chart, tap a year, or use the year slider</span>
  </div>`;
}

export function bindChart(root, chartGroups, options = {}) {
  const wraps = [...root.querySelectorAll('.chart-wrap')];
  const groups = Array.isArray(chartGroups[0]) ? chartGroups : [chartGroups];

  wraps.forEach((wrap, groupIndex) => {
    const sets = groups[groupIndex] || groups[0];
    const indexed = options.indexed ?? wrap.dataset.indexed === 'true';
    const unit = options.units?.[groupIndex] || options.unit || '';
    const slider = wrap.querySelector('input');
    const svg = wrap.querySelector('svg');

    const showYear = (year) => {
      slider.value = year;
      const readout = sets.map((set) => {
        const point = set.series.find((item) => item[0] === year);
        const display = point
          ? indexed ? `${number(point[1], 1)} index` : value(point[1], unit)
          : 'No observation';
        return `${set.name}: ${display} (${year})`;
      }).join(' · ');
      wrap.querySelector('.chart-readout').textContent = readout;
      svg.querySelectorAll('circle').forEach((circle) => circle.setAttribute('r', '4'));
      sets.forEach((set, index) => {
        const pointIndex = set.series.findIndex((point) => point[0] === year);
        if (pointIndex >= 0) svg.querySelectorAll(`circle.series-${index}`)[pointIndex].setAttribute('r', '7');
      });
    };

    const pointerYear = (event) => {
      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse());
      const fraction = Math.max(0, Math.min(1, (svgPoint.x - LEFT) / (WIDTH - LEFT - RIGHT)));
      const minYear = Number(wrap.dataset.minYear);
      const maxYear = Number(wrap.dataset.maxYear);
      showYear(Math.round(minYear + fraction * (maxYear - minYear)));
    };

    slider.addEventListener('input', () => showYear(Number(slider.value)));
    svg.addEventListener('pointermove', pointerYear);
    svg.addEventListener('pointerdown', pointerYear);
  });
}

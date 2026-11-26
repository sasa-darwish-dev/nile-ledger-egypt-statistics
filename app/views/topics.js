import { indicators, latest, title, topics, topicOf } from '../state.js';
import { value } from '../format.js';
import { citation } from './shared.js';

const introductions = {
  Economy: 'Output, prices, jobs and trade',
  People: 'Population, growth and settlement',
  Health: 'Longevity and child survival',
  Society: 'Education, access and connection',
};

function topicRows(topic) {
  return indicators.filter((item) => topicOf(item) === topic).map((item) => {
    const [year, amount] = latest(item);
    return `<a class="data-row" href="#/indicator/${item.code}">
      <span><b>${title(item)}</b><small>${item.name} · ${item.unit}</small></span>
      <span class="row-value">${value(amount, item.unit)}<small title="${year === 2025 ? 'WB estimate — latest year may be a World Bank estimate and can be revised.' : ''}">${year}${year === 2025 ? ' · WB estimate' : ''} ↗</small></span>
    </a>`;
  }).join('');
}

export function topicsPage() {
  const sections = topics.map((topic) => {
    const count = indicators.filter((item) => topicOf(item) === topic).length;
    return `<section class="topic-section">
      <div class="section-bar">
        <div>
          <p class="eyebrow">${String(count).padStart(2, '0')} INDICATORS</p>
          <h2>${topic}</h2>
          <p class="small">${introductions[topic]}</p>
        </div>
      </div>
      <div class="directory">${topicRows(topic)}</div>
    </section>`;
  }).join('');

  return `<div class="page-heading">
    <div>
      <p class="eyebrow">THE COLLECTION / TOPICS</p>
      <h1>Four lenses on change.</h1>
      <p class="intro">Browse the evidence by the questions it helps answer.</p>
    </div>
  </div>
  ${sections}
  ${citation('latest available observation per series')}`;
}

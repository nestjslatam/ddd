#!/usr/bin/env node
/**
 * Merges the unit and e2e coverage reports into one.
 *
 *   npm run test:cov:all
 *
 * Why this exists: the two suites cover different halves of the application
 * and neither is a substitute for the other. `npm test` covers the domain --
 * aggregates, value objects, validators -- and `npm run test:e2e` covers the
 * wiring, driving controllers, use-case handlers and the exception filter over
 * real HTTP.
 *
 * Reported separately, the application layer read 0% even though seventeen
 * e2e tests exercise it, and every judgement made from that number was wrong.
 * A file is covered if a test reaches it; which runner did is an accident of
 * how the suites are split.
 *
 * No new dependency: istanbul-lib-coverage, istanbul-lib-report and
 * istanbul-reports all arrive with Jest.
 */
const fs = require('fs');
const path = require('path');

const libCoverage = require('istanbul-lib-coverage');
const libReport = require('istanbul-lib-report');
const reports = require('istanbul-reports');

const ROOT = path.resolve(__dirname, '..');

/** Where each run leaves its raw JSON, and what to say if one is missing. */
const SOURCES = [
  { name: 'unit', file: 'coverage/coverage-final.json', command: 'npm run test:cov' },
  { name: 'e2e', file: 'coverage-e2e/coverage-final.json', command: 'npm run test:e2e:cov' },
];

/**
 * Floors for the MERGED report. They are separate from the per-run thresholds
 * in package.json, which still guard each suite on its own: a library file
 * dropping below 97% must fail whether or not an e2e test happens to touch it.
 */
const THRESHOLDS = { statements: 82, branches: 78, functions: 84, lines: 82 };

function load({ name, file, command }) {
  const absolute = path.join(ROOT, file);

  if (!fs.existsSync(absolute)) {
    console.error(
      `\n  The ${name} report is missing: ${file}\n` +
        `  Run \`${command}\` first, or \`npm run test:cov:all\` to do both.\n`,
    );
    process.exit(1);
  }

  return JSON.parse(fs.readFileSync(absolute, 'utf8'));
}

const map = libCoverage.createCoverageMap({});
for (const source of SOURCES) {
  map.merge(load(source));
}

const merged = path.join(ROOT, 'coverage-merged');
fs.rmSync(merged, { recursive: true, force: true });

const context = libReport.createContext({ dir: merged, coverageMap: map });
reports.create('text-summary').execute(context);
reports.create('json-summary').execute(context);
reports.create('lcov').execute(context);

const totals = map.getCoverageSummary().toJSON();
const failures = Object.entries(THRESHOLDS).filter(
  ([metric, floor]) => totals[metric].pct < floor,
);

console.log(`\n  Merged from ${SOURCES.map((s) => s.name).join(' + ')}\n`);
for (const [metric, floor] of Object.entries(THRESHOLDS)) {
  const actual = totals[metric].pct;
  const mark = actual < floor ? '✗' : '✓';
  console.log(
    `  ${mark} ${metric.padEnd(11)} ${String(actual).padStart(6)}%   floor ${floor}%`,
  );
}
console.log(`\n  Report: coverage-merged/\n`);

if (failures.length) {
  console.error(
    `  Below the floor: ${failures.map(([m]) => m).join(', ')}\n`,
  );
  process.exit(1);
}

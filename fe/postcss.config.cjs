// Make PostCSS resilient: only require plugins if they are available.
// This avoids Vite failing when `tailwindcss` or `autoprefixer` are not installed
// (we may use the Tailwind CDN during development). Each require is wrapped
// in try/catch so PostCSS will still run without those plugins.
const plugins = [];

try {
  // If installed locally this will add the Tailwind plugin
  const tailwind = require('tailwindcss');
  plugins.push(tailwind());
} catch (e) {
  // tailwindcss not installed — skip it
  // eslint-disable-next-line no-console
  console.warn('[postcss] tailwindcss not found; skipping Tailwind PostCSS plugin');
}

try {
  const autoprefixer = require('autoprefixer');
  plugins.push(autoprefixer());
} catch (e) {
  // autoprefixer not installed — skip it
  // eslint-disable-next-line no-console
  console.warn('[postcss] autoprefixer not found; skipping autoprefixer');
}

module.exports = { plugins };

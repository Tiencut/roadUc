const fs = require('fs');
const path = require('path');
const file = path.resolve(process.argv[2] || 'd:/TienCut/code3/duHocUc/fe/src/components/CostEstimator.vue');
const text = fs.readFileSync(file, 'utf8');
const tplStart = text.indexOf('<template>');
const tplEnd = text.indexOf('</template>');
if (tplStart === -1 || tplEnd === -1) {
  console.error('No <template> ... </template> block found');
  process.exit(2);
}
const tpl = text.slice(tplStart + '<template>'.length, tplEnd);
const lines = tpl.split(/\r?\n/);
let openDiv = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // count occurrences of opening <div (but ignore </div>)
  const opens = (line.match(/<div(\s|>|\/>)/g) || []).length;
  const closes = (line.match(/<\/div>/g) || []).length;
  openDiv += opens - closes;
  if (openDiv < 0) {
    console.log('Negative balance at line', i+1, '\n', lines.slice(Math.max(0,i-3), i+2).join('\n'));
    process.exit(0);
  }
}
if (openDiv !== 0) {
  console.log('Final div balance not zero:', openDiv);
  // show last 20 lines for context
  console.log('Last lines:\n', lines.slice(-20).join('\n'));
} else {
  console.log('div tags balanced in template');
}

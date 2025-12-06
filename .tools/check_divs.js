const fs = require('fs');
const path = 'fe/src/components/CostEstimator.vue';
const s = fs.readFileSync(path, 'utf8');
const tagRe = /<\/?div\b[^>]*>/gi;
let m;
let balance = 0;
let lastPos = 0;
while ((m = tagRe.exec(s)) !== null) {
  const tag = m[0];
  const pos = m.index;
  const before = s.slice(0, pos);
  const line = before.split('\n').length;
  if (tag.startsWith('</')) {
    balance -= 1;
    console.log(`${line}: ${tag}  -> balance=${balance}`);
  } else {
    balance += 1;
    console.log(`${line}: ${tag}  -> balance=${balance}`);
  }
  if (balance < 0) {
    console.error('BALANCE NEGATIVE at line', line, 'tag', tag);
    process.exit(2);
  }
}
console.log('FINAL BALANCE', balance);
if (balance !== 0) process.exit(1);
process.exit(0);

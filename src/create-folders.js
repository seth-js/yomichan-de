const { mkdirSync } = require('fs');

const folders = ['freq', 'kaikki', 'sentences', 'tidy', 'yomichan'];

for (const folder of folders) {
  mkdirSync(`data/${folder}`, { recursive: true });
}

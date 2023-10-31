const { readFileSync, writeFileSync, existsSync, readdirSync, createWriteStream, unlinkSync } = require('fs');
const date = require('date-and-time');
const archiver = require('archiver');
const path = require('path');
const now = new Date();

const currentDate = date.format(now, 'MMM-DD-YYYY');

const lemmaDict = JSON.parse(readFileSync('data/tidy/german-lemmas.json'));
const formDict = JSON.parse(readFileSync('data/tidy/german-forms.json'));

let popularDict;
const frequencies = new Map();

if (existsSync('data/freq/nine-eight.json') && existsSync('data/freq/hundred.json')) {
  popularDict = new Set(JSON.parse(readFileSync('data/freq/nine-eight.json')));

  for (const { word, count } of JSON.parse(readFileSync('data/freq/hundred.json'))) {
    frequencies.set(word, count);
  }
}

const lemmaYomi = [];
const allPOS = new Set();
const allInfo = Object.entries(lemmaDict);

for (const [lemma, infoMap] of allInfo) {
  for (const [pos, info] of Object.entries(infoMap)) {
    allPOS.add(pos);

    const { glosses } = info;
    const tags = [pos, ...(info.tags || [])].join(' ');
    const ipa = info.ipa || '';
    const popular = popularDict && popularDict.has(lemma) ? 'P' : '';
    const freq = frequencies.get(lemma) || 0;

    // term, ipa, tags, rules, frequency, definitions, sequence, tags2
    lemmaYomi.push([lemma, ipa, tags, '', freq, glosses, 0, popular]);
  }
}

const formYomi = [];

for (const [form, allInfo] of Object.entries(formDict)) {
  for (const [lemma, info] of Object.entries(allInfo)) {
    for (const [pos, glosses] of Object.entries(info)) {
      const formInfos = glosses.map((gloss) => {
        if (/-automated-/.test(gloss)) {
          const modifiedGloss = gloss.replace('-automated- ', '');
          return `${pos} -automated- {${form} -> ${lemma}} ${modifiedGloss} (->${lemma})`;
        } else {
          return `${pos} {${form} -> ${lemma}} ${gloss} (->${lemma})`;
        }
      });

      formYomi.push([form, '', 'non-lemma', '', 0, formInfos, 0, '']);
    }
  }
}

const tagBank = [
  ['P', 'popular', -10, 'popular term', 10],
  ...Array.from(allPOS).map((pos) => [pos, 'partOfSpeech', -3, pos, 0])
];

const customTags = ['non-lemma', 'masculine', 'feminine', 'neuter'];

tagBank.push(...customTags.map((tag) => [tag, tag, -3, tag, 0]));

const allYomi = [...lemmaYomi, ...formYomi];

const yomiPath = 'data/yomichan';

writeFileSync(`${yomiPath}/tag_bank_1.json`, JSON.stringify(tagBank));

for (const file of readdirSync(yomiPath)) {
  if (file.includes('term_bank_')) unlinkSync(`${yomiPath}/${file}`);
}

const batchSize = 10000;
let bankIndex = 0;

while (allYomi.length > 0) {
  const batch = allYomi.splice(0, batchSize);
  bankIndex += 1;
  writeFileSync(`${yomiPath}/term_bank_${bankIndex}.json`, JSON.stringify(batch));
}

const freqYomi = [...frequencies.entries()].map(([word, count]) => [word, 'freq', count]);

writeFileSync(`${yomiPath}/term_meta_bank_1.json`, JSON.stringify(freqYomi));

writeFileSync(`${yomiPath}/index.json`, JSON.stringify({
  title: "Seth's German Dictionary",
  format: 3,
  revision: currentDate,
  sequenced: true,
}));

const output = createWriteStream(`${yomiPath}/dictionary.zip`);

const archive = archiver('zip', { zlib: { level: 9 } });

archive.on('error', (err) => {
  throw err;
});

const files = readdirSync(yomiPath);

for (const file of files) {
  if (path.extname(file) === '.json') {
    const filePath = path.join(yomiPath, file);
    archive.file(filePath, { name: file });
  }
}

archive.pipe(output);
archive.finalize();

output.on('close', () => {
  console.log(`Saved "${yomiPath}/dictionary.zip". Import it in Yomichan.`);
});

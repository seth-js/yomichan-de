const { readFileSync, writeFileSync } = require('fs');

const lemmaDict = JSON.parse(readFileSync('data/tidy/german-lemmas.json'));
const formDict = JSON.parse(readFileSync('data/tidy/german-forms.json'));

const formPointer = {};

for (const [form, info] of Object.entries(formDict)) {
  const [lemma] = Object.entries(info)[0] || '';

  if (lemma && !formPointer[form]) {
    formPointer[form] = lemma;
  }
}

const nameDict = new Set();

for (const [lemma, info] of Object.entries(lemmaDict)) {

  if (Object.keys(info).length === 1 && info.name) {
    nameDict.add(lemma);
  }
}

const sentences = JSON.parse(readFileSync('data/sentences/netflix-de-sentences.json'));

// const sentences = ['¡Un mundo de espadas y hechicería!', 'si Dios quiere.'];

const freqList = new Map();
let totalWords = 0;
let missedWords = 0;
let sentenceLimit = 5000000;

console.log('Parsing corpus...');

let index = 0;
for (const sentence of sentences) {
  index++;
  // log progress the first time, then every 100,000 sentences, and the last one
  if (index === 1 || index % 100000 === 0 || index === sentences.length) {
    console.log(`(${index.toLocaleString()} of ${sentences.length.toLocaleString()} sentences parsed)`);
  }

  if (index === sentenceLimit) {
    console.log(`(${sentenceLimit.toLocaleString()} sentence limit reached. moving on...)`)
    break;
  }

  const words = getWords(sentence);
  const customWords = getCustomWords(words);

  // console.log(customWords);

  for (const { word, surface } of customWords) {
    if (word !== '' && /\p{L}/u.test(word) && /\p{L}/u.test(surface) && !nameDict.has(word)) {
      totalWords++;

      if (freqList.has(word)) {
        freqList.set(word, freqList.get(word) + 1);
      } else {
        freqList.set(word, 1);
      }
    }

    if (word === '' && /\p{L}/u.test(surface)) {
      missedWords++;
    }
  }
}

console.log('Done parsing.');

const freqArr = [];

for (const [word, count] of freqList) {
  freqArr.push({ word, count });
}

freqArr.sort((a, b) => b.count - a.count);

const nineFive = [];
const nineEight = [];
const nineNine = [];
const thousand = {};

let percSoFar = 0.0;

for (const { word, count } of freqArr) {
  percSoFar += count / totalWords;

  if (0.95 >= percSoFar) {
    nineFive.push(word);
  }

  if (0.98 >= percSoFar) {
    nineEight.push(word);
  }

  if (0.99 >= percSoFar) {
    nineNine.push(word);
  }

  if (nineFive.length === 1000) {
    thousand.words = [...nineFive];
    thousand.coverage = `${+(percSoFar * 100).toFixed(2)}%`;
  }
}

const message = `
Your corpus is made up of ${totalWords.toLocaleString()} words.
The 1000 most common words cover ${thousand.coverage}.
${nineFive.length} words cover 95%.
${nineEight.length} words cover 98%.
${nineNine.length} words cover 99%.

Frequency list contains ${freqArr.length.toLocaleString()} unique word(s).

${((totalWords - missedWords) / totalWords * 100).toFixed(2)}% of words were able to find a definition.
`;

console.log(message);

const frequencies = {
  'nine-five': nineFive,
  'nine-eight': nineEight,
  'nine-nine': nineNine,
  '1k': thousand,
  'hundred': freqArr,
};

for (const [file, data] of Object.entries(frequencies)) {
  writeFileSync(`data/freq/${file}.json`, JSON.stringify(data));
}

writeFileSync('data/freq/info.txt', message);

function getWords(sentence) {
  return sentence.replace(/^-/, '- ').split(/(?=\s)|(?<=\s)|(?=[.,!?—\]\[\)":¡¿…])|(?<=[.,!?—\]\[\(":¡¿…])/g)
    .map(word => {
      if (/[.,!?:"]|\s/.test(word)) {
        return { word, lemma: word };
      }

      for (const text of [word, word.toLowerCase(), toCapitalCase(word)]) {
        if (formPointer[text]) {
          return { word, lemma: formPointer[text] };
        }

        if (lemmaDict[text]) {
          return { word, lemma: text };
        }
      }

      return { word, lemma: word };
    });
}

function getCustomWords(words) {
  const customWordList = [];

  let outer = [...words];

  while (outer.length > 0) {
    let inner = [...outer];

    let matches = 0;
    while (inner.length > 0) {
      let lemmaText = getLemmaText(inner);
      let surfaceText = getSurfaceText(inner);

      let targetText = '';

      const surfaceTextEntries = [surfaceText, surfaceText.toLowerCase(), toCapitalCase(surfaceText)];
      const lemmaTextEntries = [lemmaText, lemmaText.toLowerCase(), toCapitalCase(lemmaText)];

      for (const text of [...surfaceTextEntries, lemmaTextEntries]) {
        if (!targetText) {
          if (lemmaDict[text]) targetText = text;
        }
      }

      if (!targetText) {
        for (const text of surfaceTextEntries) {
          if (!targetText) {
            if (formPointer[text])
              targetText = formPointer[text];
          }
        }
      }

      if (targetText !== '') {
        customWordList.push({ word: targetText, surface: surfaceText });
        matches = inner.length;
        inner.splice(0, inner.length);
      }

      inner.pop();
    }
    if (matches === 0) {
      const [missing] = [...outer];

      const { word } = missing;

      customWordList.push({ word: '', surface: word });
      outer.shift();
    } else outer.splice(0, matches);
  }

  return customWordList;
}

function toCapitalCase(text) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function getLemmaText(input) {
  return input.reduce((output, entry) => output + entry.lemma, '');
}

function getSurfaceText(input) {
  return input.reduce((output, entry) => output + entry.word, '');
}

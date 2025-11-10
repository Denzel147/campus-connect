const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

const inputFile = path.join(__dirname, 'react.js');
const outputFile = path.join(__dirname, 'react.compiled.js');
const htmlFile = path.join(__dirname, 'index.html');
const htmlOutputFile = path.join(__dirname, 'index.production.html');

// Read the React component
const code = fs.readFileSync(inputFile, 'utf8');

// Transform JSX to JavaScript
const result = babel.transformSync(code, {
  presets: ['@babel/preset-react'],
  filename: 'react.js'
});

// Write compiled JavaScript
fs.writeFileSync(outputFile, result.code, 'utf8');

// Create production HTML without Babel
const html = fs.readFileSync(htmlFile, 'utf8');
const productionHtml = html
  .replace(
    '<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>',
    '<!-- Babel removed - using precompiled JS -->'
  )
  .replace(
    '<script type="text/babel" src="react.js"></script>',
    '<script src="react.compiled.js"></script>'
  );

fs.writeFileSync(htmlOutputFile, productionHtml, 'utf8');

console.log('✅ Build complete!');
console.log('📦 Compiled: react.compiled.js');
console.log('🌐 Production HTML: index.production.html');
console.log('\n💡 Use index.production.html for production (no Babel warning)');


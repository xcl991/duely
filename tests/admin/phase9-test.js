const fs = require('fs');
const path = require('path');

console.log('═'.repeat(80));
console.log('🧪 PHASE 9: COMPREHENSIVE TESTING & VERIFICATION');
console.log('═'.repeat(80));
console.log('');

// Load translation files
const en = require('./src/locales/en.json');
const id = require('./src/locales/id.json');

let allTestsPassed = true;
let bugList = [];

// Helper function to flatten translation keys
function flattenKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(flattenKeys(obj[key], prefix + key + '.'));
    } else {
      keys.push(prefix + key);
    }
  }
  return keys;
}

const enKeys = flattenKeys(en);
const idKeys = flattenKeys(id);

// TEST 1: Translation Key Parity
console.log('📋 TEST 1: Translation Key Parity');
console.log('─'.repeat(80));
console.log('   EN keys:', enKeys.length);
console.log('   ID keys:', idKeys.length);

const enOnlyKeys = enKeys.filter(k => !idKeys.includes(k));
const idOnlyKeys = idKeys.filter(k => !enKeys.includes(k));

if (enOnlyKeys.length === 0 && idOnlyKeys.length === 0 && enKeys.length === idKeys.length) {
  console.log('   ✅ PASS: Perfect key parity');
} else {
  console.log('   ❌ FAIL: Key mismatch detected');
  if (enOnlyKeys.length > 0) {
    console.log('   EN-only keys:', enOnlyKeys);
    bugList.push('Translation key parity: EN has ' + enOnlyKeys.length + ' unique keys');
  }
  if (idOnlyKeys.length > 0) {
    console.log('   ID-only keys:', idOnlyKeys);
    bugList.push('Translation key parity: ID has ' + idOnlyKeys.length + ' unique keys');
  }
  allTestsPassed = false;
}
console.log('');

// TEST 2: Find all React/TypeScript files
console.log('📋 TEST 2: Component File Discovery');
console.log('─'.repeat(80));

function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules, .next, etc.
      if (!file.startsWith('.') && file !== 'node_modules') {
        findFiles(filePath, fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      // Skip .d.ts files
      if (!file.endsWith('.d.ts')) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

const allFiles = findFiles('src');
console.log('   Found', allFiles.length, 'TypeScript/React files');
console.log('');

// TEST 3: Verify all used translation keys exist
console.log('📋 TEST 3: Translation Key Existence');
console.log('─'.repeat(80));

let missingKeys = new Set();
let totalKeysUsed = new Set();

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');

  // Find all t('key') or t("key") calls
  const keyMatches = content.match(/t\(['"]([\w.]+)['"]/g);

  if (keyMatches) {
    keyMatches.forEach(match => {
      const key = match.match(/t\(['"]([\w.]+)['"]/)[1];
      totalKeysUsed.add(key);

      if (!enKeys.includes(key) || !idKeys.includes(key)) {
        missingKeys.add(key);
      }
    });
  }
});

console.log('   Total unique keys used:', totalKeysUsed.size);

if (missingKeys.size === 0) {
  console.log('   ✅ PASS: All translation keys exist');
} else {
  console.log('   ❌ FAIL:', missingKeys.size, 'missing key(s)');
  Array.from(missingKeys).forEach(key => {
    console.log('   -', key);
  });
  allTestsPassed = false;
  bugList.push('Missing translation keys: ' + missingKeys.size + ' key(s)');
}
console.log('');

// TEST 4: Check translation file structure
console.log('📋 TEST 4: Translation File Structure');
console.log('─'.repeat(80));

const sections = Object.keys(en);
const expectedSections = [
  'common', 'nav', 'auth', 'dashboard', 'subscriptions',
  'subscriptionForm', 'categories', 'categoryForm',
  'members', 'memberForm', 'analytics', 'settings',
  'notifications', 'errors', 'validation', 'footer'
];

const missingSections = expectedSections.filter(s => !sections.includes(s));

if (missingSections.length === 0) {
  console.log('   ✅ PASS: All expected sections present');
  console.log('   Sections:', sections.length);
} else {
  console.log('   ⚠️  WARNING: Missing sections:', missingSections.join(', '));
}
console.log('');

// TEST 5: Check for unused translation keys
console.log('📋 TEST 5: Unused Translation Keys');
console.log('─'.repeat(80));

const unusedKeys = enKeys.filter(key => !totalKeysUsed.has(key));
console.log('   Unused keys:', unusedKeys.length);

if (unusedKeys.length > 0) {
  console.log('   ⚠️  NOTE: Some keys may be intentionally unused (future use)');
}
console.log('');

// FINAL SUMMARY
console.log('═'.repeat(80));
console.log('📊 TEST SUMMARY');
console.log('═'.repeat(80));
console.log('   Total translation keys:', enKeys.length);
console.log('   Total keys used in code:', totalKeysUsed.size);
console.log('   Unused keys:', unusedKeys.length);
console.log('   Translation sections:', sections.length);
console.log('   Files scanned:', allFiles.length);
console.log('');

if (allTestsPassed && missingKeys.size === 0) {
  console.log('   🎉 ALL CRITICAL TESTS PASSED');
  console.log('   ✅ Ready for production');
} else {
  console.log('   ⚠️  ISSUES FOUND');
  console.log('');
  console.log('   Bug List:');
  bugList.forEach((bug, i) => {
    console.log('   ' + (i + 1) + '.', bug);
  });
}

console.log('═'.repeat(80));

process.exit(allTestsPassed && missingKeys.size === 0 ? 0 : 1);

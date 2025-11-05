const fs = require('fs');
const path = require('path');

console.log('═'.repeat(80));
console.log('🔍 PHASE 2: TRANSLATION FILES DEEP VERIFICATION');
console.log('═'.repeat(80));
console.log('');

let allTestsPassed = true;
let errorList = [];
let warningList = [];

// Load translation files
const enPath = path.join(__dirname, 'src', 'locales', 'en.json');
const idPath = path.join(__dirname, 'src', 'locales', 'id.json');

let en, id;

// TEST 1: File Existence
console.log('📋 TEST 1: File Existence');
console.log('─'.repeat(80));

if (fs.existsSync(enPath)) {
  console.log('   ✅ en.json exists');
} else {
  console.log('   ❌ en.json NOT FOUND');
  errorList.push('en.json file not found');
  allTestsPassed = false;
}

if (fs.existsSync(idPath)) {
  console.log('   ✅ id.json exists');
} else {
  console.log('   ❌ id.json NOT FOUND');
  errorList.push('id.json file not found');
  allTestsPassed = false;
}
console.log('');

if (!allTestsPassed) {
  console.log('❌ Critical error: Translation files not found');
  process.exit(1);
}

// TEST 2: JSON Validity
console.log('📋 TEST 2: JSON Validity');
console.log('─'.repeat(80));

try {
  en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  console.log('   ✅ en.json is valid JSON');
} catch (error) {
  console.log('   ❌ en.json is INVALID JSON:', error.message);
  errorList.push('en.json has invalid JSON syntax');
  allTestsPassed = false;
}

try {
  id = JSON.parse(fs.readFileSync(idPath, 'utf8'));
  console.log('   ✅ id.json is valid JSON');
} catch (error) {
  console.log('   ❌ id.json is INVALID JSON:', error.message);
  errorList.push('id.json has invalid JSON syntax');
  allTestsPassed = false;
}
console.log('');

if (!allTestsPassed) {
  console.log('❌ Critical error: Invalid JSON in translation files');
  process.exit(1);
}

// Helper function to flatten keys
function flattenKeys(obj, prefix = '') {
  let keys = {};
  for (const key in obj) {
    const fullKey = prefix + key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      Object.assign(keys, flattenKeys(obj[key], fullKey + '.'));
    } else {
      keys[fullKey] = obj[key];
    }
  }
  return keys;
}

const enFlat = flattenKeys(en);
const idFlat = flattenKeys(id);

// TEST 3: Key Count
console.log('📋 TEST 3: Translation Key Count');
console.log('─'.repeat(80));
console.log('   EN keys:', Object.keys(enFlat).length);
console.log('   ID keys:', Object.keys(idFlat).length);

if (Object.keys(enFlat).length === Object.keys(idFlat).length) {
  console.log('   ✅ PASS: Key counts match');
} else {
  console.log('   ❌ FAIL: Key count mismatch');
  errorList.push('Key count mismatch between EN and ID');
  allTestsPassed = false;
}
console.log('');

// TEST 4: Key Parity
console.log('📋 TEST 4: Translation Key Parity');
console.log('─'.repeat(80));

const enKeys = Object.keys(enFlat);
const idKeys = Object.keys(idFlat);

const enOnlyKeys = enKeys.filter(k => !idKeys.includes(k));
const idOnlyKeys = idKeys.filter(k => !enKeys.includes(k));

if (enOnlyKeys.length === 0 && idOnlyKeys.length === 0) {
  console.log('   ✅ PASS: Perfect key parity (100% match)');
} else {
  console.log('   ❌ FAIL: Key parity issues detected');

  if (enOnlyKeys.length > 0) {
    console.log('   EN-only keys (' + enOnlyKeys.length + '):');
    enOnlyKeys.slice(0, 10).forEach(key => console.log('     -', key));
    if (enOnlyKeys.length > 10) console.log('     ... and', enOnlyKeys.length - 10, 'more');
    errorList.push('EN has ' + enOnlyKeys.length + ' unique keys not in ID');
  }

  if (idOnlyKeys.length > 0) {
    console.log('   ID-only keys (' + idOnlyKeys.length + '):');
    idOnlyKeys.slice(0, 10).forEach(key => console.log('     -', key));
    if (idOnlyKeys.length > 10) console.log('     ... and', idOnlyKeys.length - 10, 'more');
    errorList.push('ID has ' + idOnlyKeys.length + ' unique keys not in EN');
  }

  allTestsPassed = false;
}
console.log('');

// TEST 5: Empty Values
console.log('📋 TEST 5: Empty or Invalid Values');
console.log('─'.repeat(80));

let emptyEnValues = [];
let emptyIdValues = [];

for (const key in enFlat) {
  if (!enFlat[key] || enFlat[key].trim() === '') {
    emptyEnValues.push(key);
  }
}

for (const key in idFlat) {
  if (!idFlat[key] || idFlat[key].trim() === '') {
    emptyIdValues.push(key);
  }
}

if (emptyEnValues.length === 0 && emptyIdValues.length === 0) {
  console.log('   ✅ PASS: No empty values found');
} else {
  console.log('   ❌ FAIL: Empty values detected');

  if (emptyEnValues.length > 0) {
    console.log('   EN empty values (' + emptyEnValues.length + '):');
    emptyEnValues.forEach(key => console.log('     -', key));
    errorList.push('EN has ' + emptyEnValues.length + ' empty values');
  }

  if (emptyIdValues.length > 0) {
    console.log('   ID empty values (' + emptyIdValues.length + '):');
    emptyIdValues.forEach(key => console.log('     -', key));
    errorList.push('ID has ' + emptyIdValues.length + ' empty values');
  }

  allTestsPassed = false;
}
console.log('');

// TEST 6: Category Structure
console.log('📋 TEST 6: Translation Category Structure');
console.log('─'.repeat(80));

const enCategories = Object.keys(en);
const idCategories = Object.keys(id);

console.log('   EN categories:', enCategories.length);
console.log('   ID categories:', idCategories.length);

const expectedCategories = [
  'common', 'nav', 'auth', 'dashboard', 'subscriptions',
  'subscriptionForm', 'categories', 'categoryForm',
  'members', 'memberForm', 'analytics', 'settings',
  'notifications', 'errors', 'validation', 'footer'
];

const missingEnCats = expectedCategories.filter(c => !enCategories.includes(c));
const missingIdCats = expectedCategories.filter(c => !idCategories.includes(c));

if (missingEnCats.length === 0 && missingIdCats.length === 0) {
  console.log('   ✅ PASS: All expected categories present');
} else {
  console.log('   ⚠️  WARNING: Some expected categories missing');
  if (missingEnCats.length > 0) {
    console.log('   EN missing:', missingEnCats.join(', '));
    warningList.push('EN missing categories: ' + missingEnCats.join(', '));
  }
  if (missingIdCats.length > 0) {
    console.log('   ID missing:', missingIdCats.join(', '));
    warningList.push('ID missing categories: ' + missingIdCats.join(', '));
  }
}

// Check for extra categories
const extraEnCats = enCategories.filter(c => !expectedCategories.includes(c));
const extraIdCats = idCategories.filter(c => !expectedCategories.includes(c));

if (extraEnCats.length > 0 || extraIdCats.length > 0) {
  console.log('   ℹ️  INFO: Additional categories found (may be intentional)');
  if (extraEnCats.length > 0) {
    console.log('   EN extra:', extraEnCats.join(', '));
  }
  if (extraIdCats.length > 0) {
    console.log('   ID extra:', extraIdCats.join(', '));
  }
}
console.log('');

// TEST 7: Variable Interpolation Syntax
console.log('📋 TEST 7: Variable Interpolation Consistency');
console.log('─'.repeat(80));

let interpolationErrors = [];

for (const key in enFlat) {
  if (idFlat[key]) {
    // Find all variables in EN: {variable}
    const enVars = (enFlat[key].match(/\{([^}]+)\}/g) || []).sort();
    const idVars = (idFlat[key].match(/\{([^}]+)\}/g) || []).sort();

    if (JSON.stringify(enVars) !== JSON.stringify(idVars)) {
      interpolationErrors.push({
        key: key,
        enVars: enVars,
        idVars: idVars
      });
    }
  }
}

if (interpolationErrors.length === 0) {
  console.log('   ✅ PASS: All variable interpolations match');
} else {
  console.log('   ❌ FAIL: Variable interpolation mismatches detected');
  console.log('   Mismatches found:', interpolationErrors.length);

  interpolationErrors.slice(0, 5).forEach(err => {
    console.log('   Key:', err.key);
    console.log('     EN:', err.enVars.join(', ') || 'none');
    console.log('     ID:', err.idVars.join(', ') || 'none');
  });

  if (interpolationErrors.length > 5) {
    console.log('   ... and', interpolationErrors.length - 5, 'more mismatches');
  }

  errorList.push('Variable interpolation mismatches: ' + interpolationErrors.length);
  allTestsPassed = false;
}
console.log('');

// TEST 8: Duplicate Keys Check
console.log('📋 TEST 8: Duplicate Keys Detection');
console.log('─'.repeat(80));

function findDuplicates(obj, prefix = '', seen = {}, duplicates = []) {
  for (const key in obj) {
    const fullKey = prefix + key;

    if (seen[fullKey]) {
      duplicates.push(fullKey);
    } else {
      seen[fullKey] = true;
    }

    if (typeof obj[key] === 'object' && obj[key] !== null) {
      findDuplicates(obj[key], fullKey + '.', seen, duplicates);
    }
  }
  return duplicates;
}

const enDuplicates = findDuplicates(en);
const idDuplicates = findDuplicates(id);

if (enDuplicates.length === 0 && idDuplicates.length === 0) {
  console.log('   ✅ PASS: No duplicate keys found');
} else {
  console.log('   ❌ FAIL: Duplicate keys detected');

  if (enDuplicates.length > 0) {
    console.log('   EN duplicates:', enDuplicates.join(', '));
    errorList.push('EN has duplicate keys: ' + enDuplicates.join(', '));
  }

  if (idDuplicates.length > 0) {
    console.log('   ID duplicates:', idDuplicates.join(', '));
    errorList.push('ID has duplicate keys: ' + idDuplicates.join(', '));
  }

  allTestsPassed = false;
}
console.log('');

// FINAL SUMMARY
console.log('═'.repeat(80));
console.log('📊 VERIFICATION SUMMARY');
console.log('═'.repeat(80));
console.log('   Total translation keys (EN):', Object.keys(enFlat).length);
console.log('   Total translation keys (ID):', Object.keys(idFlat).length);
console.log('   Translation categories:', enCategories.length);
console.log('   EN file size:', fs.statSync(enPath).size, 'bytes');
console.log('   ID file size:', fs.statSync(idPath).size, 'bytes');
console.log('');

if (errorList.length > 0) {
  console.log('   ⚠️  ERRORS FOUND (' + errorList.length + '):');
  errorList.forEach((err, i) => {
    console.log('   ' + (i + 1) + '.', err);
  });
  console.log('');
}

if (warningList.length > 0) {
  console.log('   ⚠️  WARNINGS (' + warningList.length + '):');
  warningList.forEach((warn, i) => {
    console.log('   ' + (i + 1) + '.', warn);
  });
  console.log('');
}

if (allTestsPassed && errorList.length === 0) {
  console.log('   🎉 ALL TESTS PASSED');
  console.log('   ✅ Translation files are valid and consistent');
  console.log('   ✅ Ready for production');
} else {
  console.log('   ❌ VERIFICATION FAILED');
  console.log('   ⚠️  Please fix errors before proceeding');
}

console.log('═'.repeat(80));

process.exit(allTestsPassed && errorList.length === 0 ? 0 : 1);

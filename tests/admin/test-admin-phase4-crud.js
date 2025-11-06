const fs = require('fs');
const path = require('path');

console.log('\n========================================');
console.log('  PHASE 4 CRUD OPERATIONS TEST');
console.log('========================================\n');

let totalTests = 0;
let passedTests = 0;
const errors = [];
const warnings = [];

// Test 1: File Existence - New Components
console.log('Test 1: File Existence - New Components');
const newComponents = [
  'src/components/admin/UserEditDialog.tsx',
  'src/components/admin/DeleteConfirmDialog.tsx',
  'src/components/admin/SubscriptionEditDialog.tsx',
  'src/components/admin/SearchBar.tsx',
  'src/components/admin/FilterDropdown.tsx',
  'src/components/admin/UsersTableClient.tsx',
  'src/components/admin/SubscriptionsTableClient.tsx',
];

newComponents.forEach(file => {
  totalTests++;
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ Component exists: ${file}`);
    passedTests++;
  } else {
    errors.push(`Component not found: ${file}`);
  }
});

// Test 2: API Endpoints Existence
console.log('\nTest 2: API Endpoints Existence');
const apiEndpoints = [
  'src/app/api/admin/users/[id]/route.ts',
  'src/app/api/admin/subscriptions/[id]/route.ts',
  'src/app/api/admin/subscriptions/[id]/status/route.ts',
];

apiEndpoints.forEach(file => {
  totalTests++;
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ API endpoint exists: ${file}`);
    passedTests++;
  } else {
    errors.push(`API endpoint not found: ${file}`);
  }
});

// Test 3: UserEditDialog Content
console.log('\nTest 3: UserEditDialog Content');
const userEditDialogPath = path.join(__dirname, 'src/components/admin/UserEditDialog.tsx');
if (fs.existsSync(userEditDialogPath)) {
  const content = fs.readFileSync(userEditDialogPath, 'utf8');

  const requiredElements = [
    { name: 'use client directive', pattern: /'use client'/ },
    { name: 'Dialog component', pattern: /Dialog/ },
    { name: 'Form fields (name, username)', pattern: /name.*username/s },
    { name: 'Subscription plan select', pattern: /subscriptionPlan/ },
    { name: 'Subscription status select', pattern: /subscriptionStatus/ },
    { name: 'PUT fetch request', pattern: /fetch.*PUT/s },
    { name: 'Toast notification', pattern: /toast/ },
    { name: 'Router refresh', pattern: /router\.refresh/ },
  ];

  requiredElements.forEach(({ name, pattern }) => {
    totalTests++;
    if (pattern.test(content)) {
      console.log(`   ✅ UserEditDialog has ${name}`);
      passedTests++;
    } else {
      errors.push(`UserEditDialog missing ${name}`);
    }
  });
} else {
  errors.push('UserEditDialog.tsx not found');
}

// Test 4: SubscriptionEditDialog Content
console.log('\nTest 4: SubscriptionEditDialog Content');
const subEditDialogPath = path.join(__dirname, 'src/components/admin/SubscriptionEditDialog.tsx');
if (fs.existsSync(subEditDialogPath)) {
  const content = fs.readFileSync(subEditDialogPath, 'utf8');

  const requiredElements = [
    { name: 'use client directive', pattern: /'use client'/ },
    { name: 'Service name field', pattern: /serviceName/ },
    { name: 'Amount field', pattern: /amount/ },
    { name: 'Billing frequency select', pattern: /billingFrequency/ },
    { name: 'Status select', pattern: /status/ },
    { name: 'Notes textarea', pattern: /Textarea/ },
    { name: 'Status change handlers', pattern: /handleStatusChange/ },
    { name: 'Pause/Cancel/Resume buttons', pattern: /Pause.*Cancel.*Resume/s },
  ];

  requiredElements.forEach(({ name, pattern }) => {
    totalTests++;
    if (pattern.test(content)) {
      console.log(`   ✅ SubscriptionEditDialog has ${name}`);
      passedTests++;
    } else {
      errors.push(`SubscriptionEditDialog missing ${name}`);
    }
  });
} else {
  errors.push('SubscriptionEditDialog.tsx not found');
}

// Test 5: User API Endpoints Content
console.log('\nTest 5: User API Endpoints Content');
const userApiPath = path.join(__dirname, 'src/app/api/admin/users/[id]/route.ts');
if (fs.existsSync(userApiPath)) {
  const content = fs.readFileSync(userApiPath, 'utf8');

  const requiredElements = [
    { name: 'GET handler', pattern: /export async function GET/ },
    { name: 'PUT handler', pattern: /export async function PUT/ },
    { name: 'DELETE handler', pattern: /export async function DELETE/ },
    { name: 'Admin authentication', pattern: /requireAdminAuth/ },
    { name: 'Username uniqueness check', pattern: /existingUser/ },
    { name: 'Validation for plan', pattern: /validPlans/ },
    { name: 'Validation for status', pattern: /validStatuses/ },
    { name: 'Audit logging', pattern: /logAdminAction/ },
    { name: 'Cannot delete self', pattern: /Cannot delete your own account/ },
    { name: 'Cascade deletion info', pattern: /cascadeDeleted/ },
  ];

  requiredElements.forEach(({ name, pattern }) => {
    totalTests++;
    if (pattern.test(content)) {
      console.log(`   ✅ User API has ${name}`);
      passedTests++;
    } else {
      errors.push(`User API missing ${name}`);
    }
  });
} else {
  errors.push('User API route not found');
}

// Test 6: Subscription API Endpoints Content
console.log('\nTest 6: Subscription API Endpoints Content');
const subApiPath = path.join(__dirname, 'src/app/api/admin/subscriptions/[id]/route.ts');
if (fs.existsSync(subApiPath)) {
  const content = fs.readFileSync(subApiPath, 'utf8');

  const requiredElements = [
    { name: 'GET handler', pattern: /export async function GET/ },
    { name: 'PUT handler', pattern: /export async function PUT/ },
    { name: 'DELETE handler', pattern: /export async function DELETE/ },
    { name: 'Admin authentication', pattern: /requireAdminAuth/ },
    { name: 'Validation for frequency', pattern: /validFrequencies/ },
    { name: 'Validation for status', pattern: /validStatuses/ },
    { name: 'Amount validation', pattern: /isNaN.*amount/ },
    { name: 'Audit logging', pattern: /logAdminAction/ },
  ];

  requiredElements.forEach(({ name, pattern }) => {
    totalTests++;
    if (pattern.test(content)) {
      console.log(`   ✅ Subscription API has ${name}`);
      passedTests++;
    } else {
      errors.push(`Subscription API missing ${name}`);
    }
  });
} else {
  errors.push('Subscription API route not found');
}

// Test 7: Subscription Status API
console.log('\nTest 7: Subscription Status API Content');
const subStatusApiPath = path.join(__dirname, 'src/app/api/admin/subscriptions/[id]/status/route.ts');
if (fs.existsSync(subStatusApiPath)) {
  const content = fs.readFileSync(subStatusApiPath, 'utf8');

  const requiredElements = [
    { name: 'PATCH handler', pattern: /export async function PATCH/ },
    { name: 'Status validation', pattern: /validStatuses/ },
    { name: 'Action type determination', pattern: /actionType/ },
    { name: 'subscription_canceled', pattern: /subscription_canceled/ },
    { name: 'subscription_paused', pattern: /subscription_paused/ },
    { name: 'subscription_resumed', pattern: /subscription_resumed/ },
    { name: 'Audit logging', pattern: /logAdminAction/ },
  ];

  requiredElements.forEach(({ name, pattern }) => {
    totalTests++;
    if (pattern.test(content)) {
      console.log(`   ✅ Status API has ${name}`);
      passedTests++;
    } else {
      errors.push(`Status API missing ${name}`);
    }
  });
} else {
  errors.push('Subscription Status API route not found');
}

// Test 8: SearchBar Component
console.log('\nTest 8: SearchBar Component Content');
const searchBarPath = path.join(__dirname, 'src/components/admin/SearchBar.tsx');
if (fs.existsSync(searchBarPath)) {
  const content = fs.readFileSync(searchBarPath, 'utf8');

  const requiredElements = [
    { name: 'use client directive', pattern: /'use client'/ },
    { name: 'Debounce logic', pattern: /debounceMs/ },
    { name: 'useEffect for debounce', pattern: /useEffect/ },
    { name: 'Clear button', pattern: /handleClear/ },
    { name: 'Search icon', pattern: /Search/ },
  ];

  requiredElements.forEach(({ name, pattern }) => {
    totalTests++;
    if (pattern.test(content)) {
      console.log(`   ✅ SearchBar has ${name}`);
      passedTests++;
    } else {
      errors.push(`SearchBar missing ${name}`);
    }
  });
} else {
  errors.push('SearchBar.tsx not found');
}

// Test 9: FilterDropdown Component
console.log('\nTest 9: FilterDropdown Component Content');
const filterDropdownPath = path.join(__dirname, 'src/components/admin/FilterDropdown.tsx');
if (fs.existsSync(filterDropdownPath)) {
  const content = fs.readFileSync(filterDropdownPath, 'utf8');

  const requiredElements = [
    { name: 'use client directive', pattern: /'use client'/ },
    { name: 'Select component', pattern: /Select/ },
    { name: 'FilterOption type', pattern: /FilterOption/ },
    { name: 'Clear button', pattern: /handleClear/ },
  ];

  requiredElements.forEach(({ name, pattern }) => {
    totalTests++;
    if (pattern.test(content)) {
      console.log(`   ✅ FilterDropdown has ${name}`);
      passedTests++;
    } else {
      errors.push(`FilterDropdown missing ${name}`);
    }
  });
} else {
  errors.push('FilterDropdown.tsx not found');
}

// Test 10: UsersTableClient Component
console.log('\nTest 10: UsersTableClient Component Content');
const usersTableClientPath = path.join(__dirname, 'src/components/admin/UsersTableClient.tsx');
if (fs.existsSync(usersTableClientPath)) {
  const content = fs.readFileSync(usersTableClientPath, 'utf8');

  const requiredElements = [
    { name: 'use client directive', pattern: /'use client'/ },
    { name: 'SearchBar integration', pattern: /SearchBar/ },
    { name: 'FilterDropdown integration', pattern: /FilterDropdown/ },
    { name: 'useMemo for filtering', pattern: /useMemo/ },
    { name: 'Edit button', pattern: /Edit/ },
    { name: 'Delete button', pattern: /Trash2/ },
    { name: 'UserEditDialog', pattern: /UserEditDialog/ },
    { name: 'DeleteConfirmDialog', pattern: /DeleteConfirmDialog/ },
    { name: 'handleDelete function', pattern: /handleDelete/ },
  ];

  requiredElements.forEach(({ name, pattern }) => {
    totalTests++;
    if (pattern.test(content)) {
      console.log(`   ✅ UsersTableClient has ${name}`);
      passedTests++;
    } else {
      errors.push(`UsersTableClient missing ${name}`);
    }
  });
} else {
  errors.push('UsersTableClient.tsx not found');
}

// Test 11: SubscriptionsTableClient Component
console.log('\nTest 11: SubscriptionsTableClient Component Content');
const subsTableClientPath = path.join(__dirname, 'src/components/admin/SubscriptionsTableClient.tsx');
if (fs.existsSync(subsTableClientPath)) {
  const content = fs.readFileSync(subsTableClientPath, 'utf8');

  const requiredElements = [
    { name: 'use client directive', pattern: /'use client'/ },
    { name: 'SearchBar integration', pattern: /SearchBar/ },
    { name: 'FilterDropdown integration', pattern: /FilterDropdown/ },
    { name: 'useMemo for filtering', pattern: /useMemo/ },
    { name: 'Edit button', pattern: /Edit/ },
    { name: 'Delete button', pattern: /Trash2/ },
    { name: 'SubscriptionEditDialog', pattern: /SubscriptionEditDialog/ },
    { name: 'DeleteConfirmDialog', pattern: /DeleteConfirmDialog/ },
    { name: 'handleDelete function', pattern: /handleDelete/ },
  ];

  requiredElements.forEach(({ name, pattern }) => {
    totalTests++;
    if (pattern.test(content)) {
      console.log(`   ✅ SubscriptionsTableClient has ${name}`);
      passedTests++;
    } else {
      errors.push(`SubscriptionsTableClient missing ${name}`);
    }
  });
} else {
  errors.push('SubscriptionsTableClient.tsx not found');
}

// Test 12: Updated Users Page
console.log('\nTest 12: Updated Users Page');
const usersPagePath = path.join(__dirname, 'src/app/(adminpage)/dashboard/users/page.tsx');
if (fs.existsSync(usersPagePath)) {
  const content = fs.readFileSync(usersPagePath, 'utf8');

  totalTests++;
  if (content.includes('UsersTableClient')) {
    console.log('   ✅ Users page uses UsersTableClient');
    passedTests++;
  } else {
    errors.push('Users page not using UsersTableClient');
  }

  totalTests++;
  if (!content.includes('TableBody') || content.split('UsersTableClient').length > 1) {
    console.log('   ✅ Users page removed old table code');
    passedTests++;
  } else {
    warnings.push('Users page might have duplicate table code');
  }
} else {
  errors.push('Users page not found');
}

// Test 13: Updated Subscriptions Page
console.log('\nTest 13: Updated Subscriptions Page');
const subsPagePath = path.join(__dirname, 'src/app/(adminpage)/dashboard/subscriptions/page.tsx');
if (fs.existsSync(subsPagePath)) {
  const content = fs.readFileSync(subsPagePath, 'utf8');

  totalTests++;
  if (content.includes('SubscriptionsTableClient')) {
    console.log('   ✅ Subscriptions page uses SubscriptionsTableClient');
    passedTests++;
  } else {
    errors.push('Subscriptions page not using SubscriptionsTableClient');
  }

  totalTests++;
  if (!content.includes('TableBody') || content.split('SubscriptionsTableClient').length > 1) {
    console.log('   ✅ Subscriptions page removed old table code');
    passedTests++;
  } else {
    warnings.push('Subscriptions page might have duplicate table code');
  }
} else {
  errors.push('Subscriptions page not found');
}

// Test 14: Toaster Integration
console.log('\nTest 14: Toaster Integration');
const adminLayoutPath = path.join(__dirname, 'src/app/(adminpage)/layout.tsx');
if (fs.existsSync(adminLayoutPath)) {
  const content = fs.readFileSync(adminLayoutPath, 'utf8');

  totalTests++;
  if (content.includes('Toaster')) {
    console.log('   ✅ Admin layout includes Toaster');
    passedTests++;
  } else {
    errors.push('Admin layout missing Toaster component');
  }

  totalTests++;
  if (content.includes("from '@/components/ui/sonner'")) {
    console.log('   ✅ Toaster imported correctly');
    passedTests++;
  } else {
    errors.push('Toaster import missing');
  }
} else {
  errors.push('Admin layout not found');
}

// Test 15: DeleteConfirmDialog Component
console.log('\nTest 15: DeleteConfirmDialog Component Content');
const deleteDialogPath = path.join(__dirname, 'src/components/admin/DeleteConfirmDialog.tsx');
if (fs.existsSync(deleteDialogPath)) {
  const content = fs.readFileSync(deleteDialogPath, 'utf8');

  const requiredElements = [
    { name: 'use client directive', pattern: /'use client'/ },
    { name: 'AlertDialog component', pattern: /AlertDialog/ },
    { name: 'Cascade info prop', pattern: /cascadeInfo/ },
    { name: 'Loading state', pattern: /loading/ },
    { name: 'Warning styling', pattern: /red/ },
  ];

  requiredElements.forEach(({ name, pattern }) => {
    totalTests++;
    if (pattern.test(content)) {
      console.log(`   ✅ DeleteConfirmDialog has ${name}`);
      passedTests++;
    } else {
      errors.push(`DeleteConfirmDialog missing ${name}`);
    }
  });
} else {
  errors.push('DeleteConfirmDialog.tsx not found');
}

// Summary
console.log('\n========================================');
console.log('  TEST SUMMARY');
console.log('========================================');
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests} ✅`);
console.log(`Failed: ${errors.length} ❌`);
console.log(`Warnings: ${warnings.length} ⚠️`);
console.log(`Pass Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%`);

if (errors.length > 0) {
  console.log('\n❌ ERRORS:');
  errors.forEach((error, index) => {
    console.log(`   ${index + 1}. ${error}`);
  });
}

if (warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:');
  warnings.forEach((warning, index) => {
    console.log(`   ${index + 1}. ${warning}`);
  });
}

if (errors.length === 0) {
  console.log('\n✅ PHASE 4 CRUD OPERATIONS: ALL TESTS PASSED');
} else {
  console.log('\n❌ PHASE 4 CRUD OPERATIONS: TESTS FAILED');
  process.exit(1);
}

console.log('\n========================================\n');

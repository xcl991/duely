const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('  PHASE 5 ANALYTICS & REPORTING TEST');
console.log('========================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let warnings = 0;

function test(name, condition, isWarning = false) {
  totalTests++;
  if (condition) {
    console.log(`   ✅ ${name}`);
    passedTests++;
  } else {
    if (isWarning) {
      console.log(`   ⚠️  ${name}`);
      warnings++;
    } else {
      console.log(`   ❌ ${name}`);
      failedTests++;
    }
  }
}

function fileExists(filePath) {
  return fs.existsSync(path.join(__dirname, filePath));
}

function fileContains(filePath, searchString) {
  if (!fileExists(filePath)) return false;
  const content = fs.readFileSync(
    path.join(__dirname, filePath),
    'utf-8'
  );
  return content.includes(searchString);
}

// Test 1: Analytics Helper Functions
console.log('Test 1: Analytics Helper Functions');
test('Analytics helper file exists', fileExists('src/lib/admin/analytics.ts'));
test('Contains calculateMRR function', fileContains('src/lib/admin/analytics.ts', 'calculateMRR'));
test('Contains calculateARR function', fileContains('src/lib/admin/analytics.ts', 'calculateARR'));
test('Contains calculateChurnRate function', fileContains('src/lib/admin/analytics.ts', 'calculateChurnRate'));
test('Contains getUsersByPeriod function', fileContains('src/lib/admin/analytics.ts', 'getUsersByPeriod'));
test('Contains getDateRange function', fileContains('src/lib/admin/analytics.ts', 'getDateRange'));
test('Contains forecastRevenue function', fileContains('src/lib/admin/analytics.ts', 'forecastRevenue'));
test('Contains comparePeriods function', fileContains('src/lib/admin/analytics.ts', 'comparePeriods'));
console.log('');

// Test 2: Export Helper Functions
console.log('Test 2: Export Helper Functions');
test('Export helper file exists', fileExists('src/lib/admin/export.ts'));
test('Contains exportToCSV function', fileContains('src/lib/admin/export.ts', 'exportToCSV'));
test('Contains exportUsers function', fileContains('src/lib/admin/export.ts', 'exportUsers'));
test('Contains exportSubscriptions function', fileContains('src/lib/admin/export.ts', 'exportSubscriptions'));
test('Contains Papa.unparse usage', fileContains('src/lib/admin/export.ts', 'Papa.unparse'));
test('Contains downloadFile function', fileContains('src/lib/admin/export.ts', 'downloadFile'));
console.log('');

// Test 3: Analytics API Endpoint
console.log('Test 3: Analytics API Endpoint');
test('Overview API endpoint exists', fileExists('src/app/api/admin/analytics/overview/route.ts'));
test('Contains GET handler', fileContains('src/app/api/admin/analytics/overview/route.ts', 'export async function GET'));
test('Contains requireAdminAuth', fileContains('src/app/api/admin/analytics/overview/route.ts', 'requireAdminAuth'));
test('Contains period parameter handling', fileContains('src/app/api/admin/analytics/overview/route.ts', 'period'));
test('Contains MRR calculation', fileContains('src/app/api/admin/analytics/overview/route.ts', 'calculateMRR'));
test('Contains ARR calculation', fileContains('src/app/api/admin/analytics/overview/route.ts', 'calculateARR'));
test('Contains churn rate calculation', fileContains('src/app/api/admin/analytics/overview/route.ts', 'calculateChurnRate'));
test('Returns chartData', fileContains('src/app/api/admin/analytics/overview/route.ts', 'chartData'));
console.log('');

// Test 4: Analytics Chart Components
console.log('Test 4: Analytics Chart Components');
test('MetricCard component exists', fileExists('src/components/admin/analytics/MetricCard.tsx'));
test('RevenueChart component exists', fileExists('src/components/admin/analytics/RevenueChart.tsx'));
test('UserGrowthChart component exists', fileExists('src/components/admin/analytics/UserGrowthChart.tsx'));
test('DistributionChart component exists', fileExists('src/components/admin/analytics/DistributionChart.tsx'));
test('MetricCard uses trend indicators', fileContains('src/components/admin/analytics/MetricCard.tsx', 'trend'));
test('RevenueChart uses LineChart', fileContains('src/components/admin/analytics/RevenueChart.tsx', 'LineChart'));
test('UserGrowthChart uses AreaChart', fileContains('src/components/admin/analytics/UserGrowthChart.tsx', 'AreaChart'));
test('DistributionChart uses PieChart', fileContains('src/components/admin/analytics/DistributionChart.tsx', 'PieChart'));
console.log('');

// Test 5: Analytics Dashboard Page
console.log('Test 5: Analytics Dashboard Page');
test('Analytics page exists', fileExists('src/app/(adminpage)/dashboard/analytics/page.tsx'));
test('Contains MetricCard usage', fileContains('src/app/(adminpage)/dashboard/analytics/page.tsx', 'MetricCard'));
test('Contains RevenueChart usage', fileContains('src/app/(adminpage)/dashboard/analytics/page.tsx', 'RevenueChart'));
test('Contains UserGrowthChart usage', fileContains('src/app/(adminpage)/dashboard/analytics/page.tsx', 'UserGrowthChart'));
test('Contains DistributionChart usage', fileContains('src/app/(adminpage)/dashboard/analytics/page.tsx', 'DistributionChart'));
test('Contains period selector', fileContains('src/app/(adminpage)/dashboard/analytics/page.tsx', 'period'));
test('Fetches analytics data', fileContains('src/app/(adminpage)/dashboard/analytics/page.tsx', 'getAnalyticsData'));
console.log('');

// Test 6: Navigation Integration
console.log('Test 6: Navigation Integration');
test('AdminSidebar has Analytics link', fileContains('src/components/admin/AdminSidebar.tsx', 'Analytics'));
test('AdminSidebar has BarChart3 icon', fileContains('src/components/admin/AdminSidebar.tsx', 'BarChart3'));
test('Analytics route is /adminpage/dashboard/analytics', fileContains('src/components/admin/AdminSidebar.tsx', '/adminpage/dashboard/analytics'));
console.log('');

// Test 7: Export Button Integration
console.log('Test 7: Export Button Integration');
test('UsersTableClient has Download icon', fileContains('src/components/admin/UsersTableClient.tsx', 'Download'));
test('UsersTableClient imports exportUsers', fileContains('src/components/admin/UsersTableClient.tsx', 'exportUsers'));
test('UsersTableClient has Export CSV button', fileContains('src/components/admin/UsersTableClient.tsx', 'Export CSV'));
test('SubscriptionsTableClient has Download icon', fileContains('src/components/admin/SubscriptionsTableClient.tsx', 'Download'));
test('SubscriptionsTableClient imports exportSubscriptions', fileContains('src/components/admin/SubscriptionsTableClient.tsx', 'exportSubscriptions'));
test('SubscriptionsTableClient has Export CSV button', fileContains('src/components/admin/SubscriptionsTableClient.tsx', 'Export CSV'));
console.log('');

// Test 8: TypeScript Type Definitions
console.log('Test 8: TypeScript Type Definitions');
test('Analytics types defined', fileContains('src/lib/admin/analytics.ts', 'export interface'));
test('RevenueData interface exists', fileContains('src/lib/admin/analytics.ts', 'interface RevenueData'));
test('UserGrowthData interface exists', fileContains('src/lib/admin/analytics.ts', 'interface UserGrowthData'));
test('DistributionData interface exists', fileContains('src/lib/admin/analytics.ts', 'interface DistributionData'));
test('ComparisonData interface exists', fileContains('src/lib/admin/analytics.ts', 'interface ComparisonData'));
test('Period type defined', fileContains('src/lib/admin/analytics.ts', 'type Period'));
console.log('');

// Test 9: Dependencies
console.log('Test 9: Dependencies');
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8')
);
test('recharts installed', !!packageJson.dependencies.recharts);
test('date-fns installed', !!packageJson.dependencies['date-fns']);
test('papaparse installed', !!packageJson.dependencies.papaparse);
test('@types/papaparse installed', !!packageJson.devDependencies['@types/papaparse']);
console.log('');

// Test 10: Chart Data Flow
console.log('Test 10: Chart Data Flow');
test('Analytics uses date-fns imports', fileContains('src/lib/admin/analytics.ts', 'from \'date-fns\''));
test('RevenueChart uses recharts', fileContains('src/components/admin/analytics/RevenueChart.tsx', 'from \'recharts\''));
test('UserGrowthChart uses recharts', fileContains('src/components/admin/analytics/UserGrowthChart.tsx', 'from \'recharts\''));
test('DistributionChart uses recharts', fileContains('src/components/admin/analytics/DistributionChart.tsx', 'from \'recharts\''));
test('Export uses papaparse', fileContains('src/lib/admin/export.ts', 'from \'papaparse\''));
console.log('');

console.log('========================================');
console.log('  TEST SUMMARY');
console.log('========================================');
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests} ✅`);
console.log(`Failed: ${failedTests} ❌`);
console.log(`Warnings: ${warnings} ⚠️`);
console.log(`Pass Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
console.log('');

if (failedTests === 0 && warnings === 0) {
  console.log('✅ PHASE 5 ANALYTICS & REPORTING: ALL TESTS PASSED\n');
} else if (failedTests === 0) {
  console.log(`⚠️  PHASE 5 ANALYTICS & REPORTING: PASSED WITH ${warnings} WARNING(S)\n`);
} else {
  console.log(`❌ PHASE 5 ANALYTICS & REPORTING: ${failedTests} TEST(S) FAILED\n`);
}

console.log('========================================');

process.exit(failedTests > 0 ? 1 : 0);

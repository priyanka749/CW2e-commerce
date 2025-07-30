// NoSQL Injection Testing Utility
class NoSQLTester {
  constructor(baseURL = 'https://localhost:3000/api') {
    this.baseURL = baseURL;
    this.results = [];
  }

  // Common NoSQL injection payloads
  getPayloads() {
    return {
      // MongoDB Operator Injection
      operatorInjection: [
        { email: { $ne: null }, password: { $ne: null } },
        { email: { $gt: "" }, password: { $gt: "" } },
        { email: { $regex: ".*" }, password: { $regex: ".*" } },
        { email: { $exists: true }, password: { $exists: true } },
        { email: { $not: { $eq: "nonexistent" } }, password: { $not: { $eq: "nonexistent" } } }
      ],

      // JavaScript Injection (if $where is used)
      javascriptInjection: [
        { email: { $where: "function() { return true; }" }, password: "test" },
        { email: { $where: "this.email && this.password" }, password: "test" },
        { email: { $where: "return true" }, password: "test" }
      ],

      // Boolean-based Injection
      booleanInjection: [
        { email: { $or: [{ email: { $exists: true } }, { email: { $exists: false } }] }, password: "test" },
        { email: { $and: [{ email: { $ne: null } }] }, password: "test" }
      ],

      // Search/Query Injection
      searchInjection: [
        "[$ne]=null",
        "[$gt]=",
        "[$regex]=.*",
        "[$exists]=true",
        "[$where]=function(){return true;}"
      ],

      // Array Injection
      arrayInjection: [
        ["admin@test.com", { $ne: null }],
        [{ $ne: null }, "password"],
        [{ $regex: ".*" }, { $regex: ".*" }]
      ]
    };
  }

  // Test authentication endpoints
  async testAuthentication() {
    console.log('🔍 Testing Authentication Endpoints...');
    const payloads = this.getPayloads();
    const endpoints = [
      '/users/login',
      '/auth/login-admin'
    ];

    for (const endpoint of endpoints) {
      console.log(`\n📍 Testing ${endpoint}`);
      
      // Test operator injection
      for (const payload of payloads.operatorInjection) {
        await this.testEndpoint('POST', endpoint, payload, 'Operator Injection');
      }

      // Test JavaScript injection
      for (const payload of payloads.javascriptInjection) {
        await this.testEndpoint('POST', endpoint, payload, 'JavaScript Injection');
      }

      // Test boolean injection
      for (const payload of payloads.booleanInjection) {
        await this.testEndpoint('POST', endpoint, payload, 'Boolean Injection');
      }
    }
  }

  // Test product search endpoints
  async testProductSearch() {
    console.log('\n🔍 Testing Product Search Endpoints...');
    const searchPayloads = this.getPayloads().searchInjection;
    
    const searchEndpoints = [
      '/products',
      '/products/category/electronics'
    ];

    for (const endpoint of searchEndpoints) {
      console.log(`\n📍 Testing ${endpoint}`);
      
      for (const payload of searchPayloads) {
        const url = `${endpoint}?search${payload}`;
        await this.testEndpoint('GET', url, null, 'Search Injection');
        
        // Test with different parameters
        const paramTests = [
          `${endpoint}?category${payload}`,
          `${endpoint}?price${payload}`,
          `${endpoint}?rating${payload}`,
          `${endpoint}?filter${payload}`
        ];

        for (const testUrl of paramTests) {
          await this.testEndpoint('GET', testUrl, null, 'Parameter Injection');
        }
      }
    }
  }

  // Test review endpoints
  async testReviews() {
    console.log('\n🔍 Testing Review Endpoints...');
    const token = this.getTestToken();
    
    if (!token) {
      console.log('⚠️ No auth token available for review testing');
      return;
    }

    const reviewPayloads = [
      { rating: { $gt: 0 }, comment: "Test review" },
      { rating: 5, comment: { $where: "function() { return true; }" } },
      { rating: { $ne: null }, comment: { $regex: ".*" } }
    ];

    for (const payload of reviewPayloads) {
      await this.testEndpoint('POST', '/reviews/test-product-id', payload, 'Review Injection', {
        'Authorization': `Bearer ${token}`,
        'x-csrf-token': 'test-token'
      });
    }
  }

  // Test order/payment endpoints
  async testPayments() {
    console.log('\n🔍 Testing Payment Endpoints...');
    const token = this.getTestToken();
    
    if (!token) {
      console.log('⚠️ No auth token available for payment testing');
      return;
    }

    const paymentPayloads = [
      { pidx: { $ne: null }, userId: { $regex: ".*" }, amount: { $gt: 0 } },
      { pidx: "test", userId: { $where: "function() { return true; }" }, amount: 100 },
      { pidx: { $exists: true }, userId: { $not: { $eq: "nonexistent" } }, amount: { $ne: null } }
    ];

    for (const payload of paymentPayloads) {
      await this.testEndpoint('POST', '/payments/khalti/verify', payload, 'Payment Injection', {
        'Authorization': `Bearer ${token}`
      });
    }
  }

  // Generic endpoint testing method
  async testEndpoint(method, endpoint, payload, testType, extraHeaders = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...extraHeaders
        },
        // Disable SSL verification for testing
        agent: new (require('https').Agent)({ rejectUnauthorized: false })
      };

      if (payload && method !== 'GET') {
        options.body = JSON.stringify(payload);
      }

      console.log(`🧪 Testing: ${testType}`);
      console.log(`📤 Payload:`, payload);

      const response = await fetch(url, options);
      const data = await response.text();

      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch {
        parsedData = data;
      }

      const result = {
        testType,
        endpoint,
        method,
        payload,
        status: response.status,
        response: parsedData,
        vulnerable: this.isVulnerable(response, parsedData),
        timestamp: new Date().toISOString()
      };

      this.results.push(result);

      // Log result
      if (result.vulnerable) {
        console.log(`🚨 VULNERABLE: ${testType} on ${endpoint}`);
        console.log(`📥 Response:`, parsedData);
      } else {
        console.log(`✅ Protected: ${testType} on ${endpoint}`);
      }

      // Small delay to avoid overwhelming server
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.log(`❌ Error testing ${endpoint}:`, error.message);
      this.results.push({
        testType,
        endpoint,
        method,
        payload,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Determine if response indicates vulnerability
  isVulnerable(response, data) {
    // Check for successful authentication bypass
    if (response.status === 200 && data.token) {
      return true;
    }

    // Check for data exposure
    if (response.status === 200 && Array.isArray(data) && data.length > 0) {
      return true;
    }

    // Check for successful operations that shouldn't succeed
    if (response.status === 200 && data.success === true) {
      return true;
    }

    // Check for error messages that reveal database structure
    if (data.message && (
      data.message.includes('$') ||
      data.message.includes('function') ||
      data.message.includes('MongoError') ||
      data.message.includes('ValidationError')
    )) {
      return true;
    }

    return false;
  }

  // Get test token (you'd need to implement actual login)
  getTestToken() {
    return localStorage.getItem('token') || null;
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Comprehensive NoSQL Injection Testing...');
    console.log('='.repeat(60));

    await this.testAuthentication();
    await this.testProductSearch();
    await this.testReviews();
    await this.testPayments();

    console.log('\n📊 Testing Complete!');
    console.log('='.repeat(60));
    this.generateReport();
  }

  // Generate test report
  generateReport() {
    const vulnerabilities = this.results.filter(r => r.vulnerable);
    const totalTests = this.results.length;
    const vulnerableTests = vulnerabilities.length;

    console.log(`\n📋 NoSQL Injection Test Report`);
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Vulnerabilities Found: ${vulnerableTests}`);
    console.log(`Security Score: ${((totalTests - vulnerableTests) / totalTests * 100).toFixed(1)}%`);

    if (vulnerabilities.length > 0) {
      console.log('\n🚨 VULNERABILITIES FOUND:');
      vulnerabilities.forEach((vuln, index) => {
        console.log(`${index + 1}. ${vuln.testType} on ${vuln.endpoint}`);
        console.log(`   Status: ${vuln.status}`);
        console.log(`   Payload: ${JSON.stringify(vuln.payload)}`);
        console.log(`   Response: ${JSON.stringify(vuln.response).substring(0, 200)}...`);
        console.log('');
      });
    } else {
      console.log('\n✅ No vulnerabilities found! Your application appears to be protected.');
    }

    // Save results to file (if in Node.js environment)
    if (typeof require !== 'undefined') {
      try {
        const fs = require('fs');
        fs.writeFileSync('nosql-test-results.json', JSON.stringify(this.results, null, 2));
        console.log('📄 Results saved to nosql-test-results.json');
      } catch (error) {
        console.log('Could not save results file:', error.message);
      }
    }
  }

  // Clear results
  clearResults() {
    this.results = [];
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NoSQLTester;
}

// Make available globally in browser
if (typeof window !== 'undefined') {
  window.NoSQLTester = NoSQLTester;
}

export default NoSQLTester;

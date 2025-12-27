const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testConvictionWithoutPoints() {
  try {
    console.log('🧪 Testing Conviction System Without Points...\n');

    // Step 1: Login to get access token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'Test123!'
    });

    const { accessToken } = loginResponse.data;
    console.log('✅ Login successful');

    // Step 2: Get user's signals
    console.log('\n2. Getting user signals...');
    const signalsResponse = await axios.get(`${BASE_URL}/signals/feed?limit=1`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (signalsResponse.data.signals.length === 0) {
      console.log('❌ No signals found. Please create a signal first.');
      return;
    }

    const signalId = signalsResponse.data.signals[0].id;
    console.log(`✅ Found signal: ${signalId}`);

    // Step 3: Test conviction without points field
    console.log('\n3. Testing conviction without points...');
    const convictionResponse = await axios.post(
      `${BASE_URL}/signals/${signalId}/conviction`,
      {
        value: 75.5  // Only value, no points field
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    console.log('✅ Conviction created successfully!');
    console.log('Response:', JSON.stringify(convictionResponse.data, null, 2));

    // Step 4: Verify conviction was saved
    console.log('\n4. Verifying conviction was saved...');
    const getUserConvictionResponse = await axios.get(
      `${BASE_URL}/signals/${signalId}/conviction`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    console.log('✅ Conviction retrieved successfully!');
    console.log('User conviction:', JSON.stringify(getUserConvictionResponse.data, null, 2));

    // Step 5: Test updating conviction
    console.log('\n5. Testing conviction update...');
    const updateConvictionResponse = await axios.post(
      `${BASE_URL}/signals/${signalId}/conviction`,
      {
        value: -25.0  // Different value
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    console.log('✅ Conviction updated successfully!');
    console.log('Updated conviction:', JSON.stringify(updateConvictionResponse.data, null, 2));

    console.log('\n🎉 All tests passed! Conviction system works without points.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Tip: Make sure you have a test user account. Try running the test-db.js script first.');
    }
  }
}

// Run the test
testConvictionWithoutPoints();
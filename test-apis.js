const axios = require('axios');

async function testAPIs() {
  console.log('Testing API endpoints...\n');

  // Test BallDontLie NBA API
  try {
    console.log('🏀 Testing NBA API (BallDontLie)...');
    const nbaResponse = await axios.get('https://api.balldontlie.io/v1/games', {
      params: { seasons: [2024], per_page: 5 },
      timeout: 10000
    });
    console.log('✅ NBA API working:', nbaResponse.data.data?.length || 0, 'games found');
  } catch (error) {
    console.log('❌ NBA API failed:', error.message);
  }

  // Test ESPN API
  try {
    console.log('🏀 Testing ESPN API...');
    const espnResponse = await axios.get('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard', {
      timeout: 10000
    });
    console.log('✅ ESPN API working:', espnResponse.data.events?.length || 0, 'games found');
  } catch (error) {
    console.log('❌ ESPN API failed:', error.message);
  }

  // Test CoinGecko Crypto API
  try {
    console.log('💰 Testing Crypto API (CoinGecko)...');
    const cryptoResponse = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 5,
        page: 1
      },
      timeout: 10000
    });
    console.log('✅ Crypto API working:', cryptoResponse.data?.length || 0, 'coins found');
  } catch (error) {
    console.log('❌ Crypto API failed:', error.message);
  }

  // Test News API (requires key)
  try {
    console.log('📰 Testing News API...');
    const newsResponse = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        apiKey: '11d5fcaca7a2462fbcec839c72080d7e',
        country: 'us',
        pageSize: 5
      },
      timeout: 15000
    });
    console.log('✅ News API working:', newsResponse.data.articles?.length || 0, 'articles found');
  } catch (error) {
    console.log('❌ News API failed:', error.response?.data?.message || error.message);
  }

  console.log('\n📋 API Status Summary:');
  console.log('- NBA: Use ESPN API as primary (more reliable)');
  console.log('- Football: Requires API key from football-data.org');
  console.log('- Crypto: CoinGecko working fine');
  console.log('- News: Check API key and rate limits');
}

testAPIs().catch(console.error);
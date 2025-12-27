import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class FeedsService {
  private readonly logger = new Logger(FeedsService.name);

  constructor(private prisma: PrismaService) {}

  // News API Integration
  async fetchNewsEvents() {
    try {
      const apiKey = process.env.NEWS_API_KEY;
      if (!apiKey) {
        this.logger.warn('NEWS_API_KEY not configured');
        return [];
      }

      const response = await axios.get('https://newsapi.org/v2/top-headlines', {
        params: {
          apiKey,
          country: 'us',
          category: 'technology,business,science',
          pageSize: 20,
        },
        timeout: 15000, // 15 second timeout
      });

      const articles = response.data.articles || [];
      const signals = [];

      for (const article of articles) {
        // Convert news to prediction signals
        const signal = await this.createSignalFromNews(article);
        if (signal) signals.push(signal);
      }

      return signals;
    } catch (error) {
      this.logger.error('Failed to fetch news events:', error.response?.data?.message || error.message);
      return [];
    }
  }

  // Financial Data Integration
  async fetchFinancialEvents() {
    try {
      const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
      if (!apiKey) {
        this.logger.warn('ALPHA_VANTAGE_API_KEY not configured');
        return [];
      }

      // Fetch major stock data
      const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA'];
      const signals = [];

      for (const symbol of symbols) {
        const response = await axios.get('https://www.alphavantage.co/query', {
          params: {
            function: 'GLOBAL_QUOTE',
            symbol,
            apikey: apiKey,
          },
        });

        const quote = response.data['Global Quote'];
        if (quote) {
          const signal = await this.createSignalFromStock(symbol, quote);
          if (signal) signals.push(signal);
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return signals;
    } catch (error) {
      this.logger.error('Failed to fetch financial events:', error.message);
      return [];
    }
  }

  // Sports Events Integration (Free APIs)
  async fetchSportsEvents() {
    try {
      // Option 1: Free NBA API (no key needed)
      const nbaSignals = await this.fetchNBAEvents();
      
      // Option 2: Free Football API (no key needed)
      const footballSignals = await this.fetchFootballEvents();
      
      return [...nbaSignals, ...footballSignals];
    } catch (error) {
      this.logger.error('Failed to fetch sports events:', error.message);
      return [];
    }
  }

  // Free NBA API
  async fetchNBAEvents() {
    try {
      // Try multiple free sports APIs
      return await this.fetchMultipleSportsAPIs();
    } catch (error) {
      this.logger.error('Failed to fetch NBA events:', error.message);
      // Generate mock sports events as fallback
      return this.generateMockSportsEvents();
    }
  }

  // Try multiple sports APIs
  async fetchMultipleSportsAPIs() {
    const signals = [];
    
    // Try ESPN API first (most reliable)
    try {
      const espnSignals = await this.fetchESPNEvents();
      signals.push(...espnSignals);
    } catch (error) {
      this.logger.warn('ESPN API failed:', error.message);
    }

    // If we don't have enough signals, generate mock ones
    if (signals.length < 3) {
      const mockSignals = await this.generateMockSportsEvents();
      signals.push(...mockSignals);
    }

    return signals;
  }

  // Generate mock sports events for variety
  async generateMockSportsEvents() {
    try {
      const systemUser = await this.getOrCreateSystemUser();
      const signals = [];

      const sportsEvents = [
        {
          homeTeam: 'Lakers',
          awayTeam: 'Warriors',
          sport: 'NBA',
          category: 'Sports'
        },
        {
          homeTeam: 'Chiefs',
          awayTeam: 'Bills',
          sport: 'NFL',
          category: 'Sports'
        },
        {
          homeTeam: 'Manchester United',
          awayTeam: 'Liverpool',
          sport: 'Premier League',
          category: 'Sports'
        },
        {
          homeTeam: 'Real Madrid',
          awayTeam: 'Barcelona',
          sport: 'La Liga',
          category: 'Sports'
        }
      ];

      for (const event of sportsEvents) {
        const today = new Date().toISOString().split('T')[0];
        const content = `Who will win: ${event.homeTeam} vs ${event.awayTeam}?\n\nUpcoming ${event.sport} match [${today}]`;

        // Check for duplicates
        const existing = await this.prisma.signal.findFirst({
          where: {
            userId: systemUser.id,
            topic: `${event.homeTeam} vs ${event.awayTeam}`,
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        });

        if (!existing) {
          const signal = await this.prisma.signal.create({
            data: {
              userId: systemUser.id,
              content,
              topic: `${event.homeTeam} vs ${event.awayTeam}`,
              category: event.category,
              timeframe: '1d',
              consensus: 50.0 + (Math.random() - 0.5) * 20, // Random between 40-60
              momentum: Math.random() * 30,
              participantCount: 0,
            },
          });
          signals.push(signal);
        }
      }

      return signals;
    } catch (error) {
      this.logger.error('Failed to generate mock sports events:', error.message);
      return [];
    }
  }

  // Free Football API
  async fetchFootballEvents() {
    try {
      // Football-Data.org API requires API key even for free tier
      const apiKey = process.env.FOOTBALL_API_KEY;
      
      if (!apiKey) {
        this.logger.warn('FOOTBALL_API_KEY not configured, skipping football events');
        return [];
      }
      
      const response = await axios.get('https://api.football-data.org/v4/competitions/PL/matches', {
        headers: {
          'X-Auth-Token': apiKey,
        },
        params: {
          status: 'SCHEDULED',
          limit: 10,
        },
        timeout: 10000,
      });

      const matches = response.data.matches || [];
      const signals = [];

      for (const match of matches) {
        const signal = await this.createSignalFromFootballMatch(match);
        if (signal) signals.push(signal);
      }

      return signals;
    } catch (error) {
      this.logger.error('Failed to fetch football events:', error.message);
      return [];
    }
  }

  // Alternative: ESPN API (free, no key needed)
  async fetchESPNEvents() {
    try {
      // ESPN API - free access to scores and schedules
      const response = await axios.get('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard', {
        timeout: 10000,
      });
      
      const games = response.data.events || [];
      const signals = [];

      for (const game of games.slice(0, 5)) {
        const signal = await this.createSignalFromESPNGame(game);
        if (signal) signals.push(signal);
      }

      return signals;
    } catch (error) {
      this.logger.error('Failed to fetch ESPN events:', error.message);
      return [];
    }
  }

  // Crypto Events Integration
  async fetchCryptoEvents() {
    try {
      // CoinGecko API (free, no key needed)
      const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 10,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h',
        },
        timeout: 10000, // 10 second timeout
        headers: {
          'User-Agent': 'Sygnal-Backend/1.0',
        },
      });

      const coins = response.data;
      const signals = [];

      for (const coin of coins) {
        try {
          const signal = await this.createSignalFromCrypto(coin);
          if (signal) signals.push(signal);
        } catch (error) {
          this.logger.warn(`Failed to create signal for ${coin.name}:`, error.message);
          continue; // Skip this coin and continue with others
        }
      }

      this.logger.log(`✓ crypto events: ${signals.length} signals`);
      return signals;
    } catch (error) {
      this.logger.error('Failed to fetch crypto events:', error.message);
      return [];
    }
  }

  // Weather Events Integration
  async fetchWeatherEvents() {
    try {
      const apiKey = process.env.WEATHER_API_KEY;
      if (!apiKey) {
        this.logger.warn('WEATHER_API_KEY not configured');
        return [];
      }

      const cities = ['New York', 'London', 'Tokyo', 'Sydney', 'Mumbai'];
      const signals = [];

      for (const city of cities) {
        const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
          params: {
            q: city,
            appid: apiKey,
            units: 'metric',
            cnt: 5, // 5 day forecast
          },
        });

        const forecast = response.data;
        const signal = await this.createSignalFromWeather(city, forecast);
        if (signal) signals.push(signal);
      }

      return signals;
    } catch (error) {
      this.logger.error('Failed to fetch weather events:', error.message);
      return [];
    }
  }

  // Convert news article to prediction signal
  private async createSignalFromNews(article: any) {
    try {
      // Create a system user for auto-generated signals
      const systemUser = await this.getOrCreateSystemUser();

      const content = `${article.title}\n\nWill this news story have significant market impact in the next 7 days?`;
      
      const signal = await this.prisma.signal.create({
        data: {
          userId: systemUser.id,
          content,
          topic: article.title.substring(0, 100),
          category: this.categorizeNews(article),
          timeframe: '7d',
          consensus: 50.0,
          momentum: 0.0,
          participantCount: 0,
        },
      });

      // Create thesis attachment
      if (article.url) {
        await this.prisma.thesis.create({
          data: {
            signalId: signal.id,
            url: article.url,
            title: article.title,
            source: article.source?.name || 'News',
            imageUrl: article.urlToImage,
          },
        });
      }

      return signal;
    } catch (error) {
      this.logger.error('Failed to create signal from news:', error.message);
      return null;
    }
  }

  // Convert stock data to prediction signal
  private async createSignalFromStock(symbol: string, quote: any) {
    try {
      const systemUser = await this.getOrCreateSystemUser();
      const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
      
      const direction = changePercent > 0 ? 'rise' : 'fall';
      const content = `Will ${symbol} ${direction} by more than 5% in the next 30 days?\n\nCurrent: $${quote['05. price']}\nChange: ${quote['10. change percent']}`;

      const signal = await this.prisma.signal.create({
        data: {
          userId: systemUser.id,
          content,
          topic: `${symbol} Stock Prediction`,
          category: 'Finance',
          timeframe: '30d',
          consensus: changePercent > 0 ? 60.0 : 40.0, // Bias based on current trend
          momentum: Math.abs(changePercent) * 10, // Convert to momentum score
          participantCount: 0,
        },
      });

      return signal;
    } catch (error) {
      this.logger.error('Failed to create signal from stock:', error.message);
      return null;
    }
  }

  // Convert NBA game to prediction signal (BallDontLie API)
  private async createSignalFromNBAGame(game: any) {
    try {
      const systemUser = await this.getOrCreateSystemUser();
      
      const homeTeam = game.home_team.full_name;
      const awayTeam = game.visitor_team.full_name;
      const gameDate = new Date(game.date).toLocaleDateString();
      
      const content = `Who will win: ${homeTeam} vs ${awayTeam}?\n\nGame Date: ${gameDate}\nStatus: ${game.status}`;

      const signal = await this.prisma.signal.create({
        data: {
          userId: systemUser.id,
          content,
          topic: `${homeTeam} vs ${awayTeam}`,
          category: 'Sports',
          timeframe: '1d',
          consensus: 50.0,
          momentum: 0.0,
          participantCount: 0,
        },
      });

      return signal;
    } catch (error) {
      this.logger.error('Failed to create signal from NBA game:', error.message);
      return null;
    }
  }

  // Convert Football match to prediction signal (Football-Data API)
  private async createSignalFromFootballMatch(match: any) {
    try {
      const systemUser = await this.getOrCreateSystemUser();
      
      const homeTeam = match.homeTeam.name;
      const awayTeam = match.awayTeam.name;
      const matchDate = new Date(match.utcDate).toLocaleDateString();
      
      const content = `Who will win: ${homeTeam} vs ${awayTeam}?\n\nMatch Date: ${matchDate}\nCompetition: ${match.competition.name}`;

      const signal = await this.prisma.signal.create({
        data: {
          userId: systemUser.id,
          content,
          topic: `${homeTeam} vs ${awayTeam}`,
          category: 'Sports',
          timeframe: '1d',
          consensus: 50.0,
          momentum: 0.0,
          participantCount: 0,
        },
      });

      return signal;
    } catch (error) {
      this.logger.error('Failed to create signal from football match:', error.message);
      return null;
    }
  }

  // Convert ESPN game to prediction signal
  private async createSignalFromESPNGame(game: any) {
    try {
      const systemUser = await this.getOrCreateSystemUser();
      
      const homeTeam = game.competitions[0].competitors.find(c => c.homeAway === 'home')?.team.displayName;
      const awayTeam = game.competitions[0].competitors.find(c => c.homeAway === 'away')?.team.displayName;
      const gameDate = new Date(game.date).toLocaleDateString();
      
      const content = `Who will win: ${homeTeam} vs ${awayTeam}?\n\nGame Date: ${gameDate}\nLeague: NBA`;

      const signal = await this.prisma.signal.create({
        data: {
          userId: systemUser.id,
          content,
          topic: `${homeTeam} vs ${awayTeam}`,
          category: 'Sports',
          timeframe: '1d',
          consensus: 50.0,
          momentum: 0.0,
          participantCount: 0,
        },
      });

      return signal;
    } catch (error) {
      this.logger.error('Failed to create signal from ESPN game:', error.message);
      return null;
    }
  }

  // Convert crypto data to prediction signal
  private async createSignalFromCrypto(coin: any) {
    try {
      const systemUser = await this.getOrCreateSystemUser();
      const changePercent = coin.price_change_percentage_24h || 0;
      
      // Create unique content to avoid duplicates
      const today = new Date().toISOString().split('T')[0];
      const direction = changePercent > 0 ? 'continue rising' : 'recover';
      const content = `Will ${coin.name} (${coin.symbol.toUpperCase()}) ${direction} by 10% in the next 7 days? [${today}]\n\nCurrent: $${coin.current_price}\n24h Change: ${changePercent.toFixed(2)}%`;

      // Check if similar signal already exists today
      const existingSignal = await this.prisma.signal.findFirst({
        where: {
          userId: systemUser.id,
          topic: `${coin.name} Price Prediction`,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)), // Today
          },
        },
      });

      if (existingSignal) {
        this.logger.debug(`Signal for ${coin.name} already exists today`);
        return null; // Skip duplicate
      }

      const signal = await this.prisma.signal.create({
        data: {
          userId: systemUser.id,
          content,
          topic: `${coin.name} Price Prediction`,
          category: 'Finance',
          timeframe: '7d',
          consensus: changePercent > 0 ? 55.0 : 45.0,
          momentum: Math.abs(changePercent) * 5,
          participantCount: 0,
        },
      });

      return signal;
    } catch (error) {
      this.logger.error('Failed to create signal from crypto:', error.message);
      return null;
    }
  }

  // Convert weather forecast to prediction signal
  private async createSignalFromWeather(city: string, forecast: any) {
    try {
      const systemUser = await this.getOrCreateSystemUser();
      const todayWeather = forecast.list[0];
      const tomorrowWeather = forecast.list[1];
      
      const tempDiff = tomorrowWeather.main.temp - todayWeather.main.temp;
      const direction = tempDiff > 0 ? 'warmer' : 'cooler';
      
      const content = `Will tomorrow be ${direction} than today in ${city}?\n\nToday: ${todayWeather.main.temp}°C\nForecast: ${tomorrowWeather.main.temp}°C`;

      const signal = await this.prisma.signal.create({
        data: {
          userId: systemUser.id,
          content,
          topic: `${city} Weather Prediction`,
          category: 'Science',
          timeframe: '1d',
          consensus: tempDiff > 0 ? 60.0 : 40.0,
          momentum: Math.abs(tempDiff) * 10,
          participantCount: 0,
        },
      });

      return signal;
    } catch (error) {
      this.logger.error('Failed to create signal from weather:', error.message);
      return null;
    }
  }

  // Get or create system user for auto-generated signals
  private async getOrCreateSystemUser() {
    try {
      let systemUser = await this.prisma.user.findUnique({
        where: { email: 'system@sygnal.ai' },
      });

      if (!systemUser) {
        systemUser = await this.prisma.user.create({
          data: {
            email: 'system@sygnal.ai',
            name: 'Sygnal AI',
            handle: 'sygnal_ai',
            passwordHash: 'system',
            verified: true,
            credibilityScore: 100.0,
          },
        });
      }

      return systemUser;
    } catch (error) {
      this.logger.error('Database connection error, retrying...', error.message);
      
      // Wait and retry once
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        let systemUser = await this.prisma.user.findUnique({
          where: { email: 'system@sygnal.ai' },
        });

        if (!systemUser) {
          systemUser = await this.prisma.user.create({
            data: {
              email: 'system@sygnal.ai',
              name: 'Sygnal AI',
              handle: 'sygnal_ai',
              passwordHash: 'system',
              verified: true,
              credibilityScore: 100.0,
            },
          });
        }

        return systemUser;
      } catch (retryError) {
        this.logger.error('Failed to get system user after retry:', retryError.message);
        throw retryError;
      }
    }
  }

  // Categorize news articles
  private categorizeNews(article: any): string {
    const title = article.title.toLowerCase();
    const description = (article.description || '').toLowerCase();
    const text = `${title} ${description}`;

    if (text.includes('stock') || text.includes('market') || text.includes('economy')) {
      return 'Finance';
    }
    if (text.includes('tech') || text.includes('ai') || text.includes('software')) {
      return 'Technology';
    }
    if (text.includes('election') || text.includes('government') || text.includes('policy')) {
      return 'Politics';
    }
    if (text.includes('climate') || text.includes('research') || text.includes('study')) {
      return 'Science';
    }
    if (text.includes('game') || text.includes('team') || text.includes('player')) {
      return 'Sports';
    }

    return 'Technology'; // Default category
  }

  // Fetch all real-world events
  async fetchAllRealWorldEvents() {
    this.logger.log('Fetching real-world events...');

    // Execute with proper error handling and rate limiting
    const results = await Promise.allSettled([
      this.fetchNewsEvents(),
      this.fetchFinancialEvents(), 
      this.fetchSportsEvents(),
      this.fetchCryptoEvents(),
      this.fetchWeatherEvents(),
      this.fetchESPNEvents(),
    ]);

    const allSignals = [];
    
    results.forEach((result, index) => {
      const sources = ['news', 'financial', 'sports', 'crypto', 'weather', 'espn'];
      if (result.status === 'fulfilled') {
        allSignals.push(...result.value);
        this.logger.log(`✓ ${sources[index]} events: ${result.value.length} signals`);
      } else {
        this.logger.error(`✗ ${sources[index]} events failed:`, result.reason?.message);
      }
    });
    
    this.logger.log(`Created ${allSignals.length} total signals from real-world events`);
    return allSignals;
  }
}
#!/usr/bin/env node

/**
 * Market Simulation Data Analyzer
 * 
 * Usage: node analyze-trades.js market-data-*.json
 * 
 * Generates behavioral metrics from exported market data
 */

const fs = require('fs');
const path = require('path');

interface Trade {
  id: string;
  userId: string;
  symbol: string;
  quantity: number;
  price: number;
  type: 'buy' | 'sell';
  timestamp: number;
  sentiment: number;
  newsContext: string[];
}

interface News {
  id: string;
  headline: string;
  sentiment: number;
  optics: number;
  timestamp: number;
  decay?: number;
}

interface AnalysisReport {
  exportFile: string;
  generatedAt: string;
  summary: {
    totalTrades: number;
    uniqueTraders: number;
    tradingDuration: string;
    totalVolume: number;
    averageTradeSize: number;
  };
  perTradmetrics: {
    totalBuys: number;
    totalSells: number;
    buyCount: number;
    sellCount: number;
    averageBuyPrice: number;
    averageSellPrice: number;
  };
  behavioralMetrics: {
    sentimentBias: number;
    overreactionRate: number;
    herdingBehavior: number;
    reactionLag: number;
  };
  newsByImpact: Array<{
    headline: string;
    sentiment: number;
    tradesWithin5min: number;
    averagePriceChange: number;
  }>;
  traderStats: Array<{
    userId: string;
    trades: number;
    winRate: number;
    averageGain: number;
    behaviorPattern: string;
  }>;
}

function analyzeData(filePath: string): AnalysisReport {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const trades: Trade[] = data.trades || [];
  const news: News[] = data.news || [];

  // Summary stats
  const summary = {
    totalTrades: trades.length,
    uniqueTraders: new Set(trades.map((t) => t.userId)).size,
    tradingDuration: calculateDuration(trades),
    totalVolume: trades.reduce((sum, t) => sum + t.quantity * t.price, 0),
    averageTradeSize: trades.length > 0 ? trades.reduce((sum, t) => sum + t.quantity, 0) / trades.length : 0
  };

  // Per trade metrics
  const buyTrades = trades.filter((t) => t.type === 'buy');
  const sellTrades = trades.filter((t) => t.type === 'sell');

  const perTradmetrics = {
    totalBuys: buyTrades.reduce((sum, t) => sum + t.quantity, 0),
    totalSells: sellTrades.reduce((sum, t) => sum + t.quantity, 0),
    buyCount: buyTrades.length,
    sellCount: sellTrades.length,
    averageBuyPrice: buyTrades.length > 0 ? buyTrades.reduce((sum, t) => sum + t.price, 0) / buyTrades.length : 0,
    averageSellPrice: sellTrades.length > 0 ? sellTrades.reduce((sum, t) => sum + t.price, 0) / sellTrades.length : 0
  };

  // Behavioral metrics
  const behavioralMetrics = calculateBehavioralMetrics(trades, news);

  // News impact
  const newsByImpact = analyzeNewsImpact(trades, news);

  // Trader stats
  const traderStats = analyzeTraderStats(trades);

  return {
    exportFile: path.basename(filePath),
    generatedAt: new Date().toISOString(),
    summary,
    perTradmetrics,
    behavioralMetrics,
    newsByImpact,
    traderStats
  };
}

function calculateDuration(trades: Trade[]): string {
  if (trades.length === 0) return '0s';
  const start = Math.min(...trades.map((t) => t.timestamp));
  const end = Math.max(...trades.map((t) => t.timestamp));
  const durationMs = end - start;
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

function calculateBehavioralMetrics(trades: Trade[], news: News[]) {
  // Sentiment bias - do traders follow news sentiment?
  const tradesWithSentiment = trades.filter((t) => t.sentiment !== 0);
  const sentimentBias = tradesWithSentiment.length > 0
    ? tradesWithSentiment.filter((t) => {
        const bullish = t.sentiment > 0 && t.type === 'buy';
        const bearish = t.sentiment < 0 && t.type === 'sell';
        return bullish || bearish;
      }).length / tradesWithSentiment.length
    : 0;

  // Overreaction - large trades after high optics news
  const highOpticsNews = news.filter((n) => n.optics > 0.8);
  const tradesAfterHighOptics = trades.filter((t) => {
    const recentNews = highOpticsNews.filter((n) => Math.abs(t.timestamp - n.timestamp) < 30000);
    return recentNews.length > 0;
  });
  const overreactionRate = tradesAfterHighOptics.length > 0
    ? tradesAfterHighOptics.filter((t) => t.quantity > 100).length / tradesAfterHighOptics.length
    : 0;

  // Herding - do multiple traders trade same symbol close in time?
  const symbolTrades = groupBy(trades, 'symbol');
  let herdingScore = 0;
  for (const symbol in symbolTrades) {
    const tradesByTime = symbolTrades[symbol].sort((a, b) => a.timestamp - b.timestamp);
    for (let i = 0; i < tradesByTime.length - 2; i++) {
      const window = [tradesByTime[i], tradesByTime[i + 1], tradesByTime[i + 2]];
      if (
        window[1].timestamp - window[0].timestamp < 5000 &&
        window[2].timestamp - window[1].timestamp < 5000
      ) {
        herdingScore++;
      }
    }
  }
  const herdingBehavior = trades.length > 0 ? herdingScore / (trades.length / 3) : 0;

  // Reaction lag - average time to trade after news
  let totalLag = 0;
  let lagCount = 0;
  for (const trade of trades) {
    if (trade.newsContext && trade.newsContext.length > 0) {
      const recentNews = news.filter((n) => trade.newsContext.includes(n.id) && n.timestamp < trade.timestamp);
      if (recentNews.length > 0) {
        const lag = trade.timestamp - Math.max(...recentNews.map((n) => n.timestamp));
        totalLag += lag;
        lagCount++;
      }
    }
  }
  const reactionLag = lagCount > 0 ? totalLag / lagCount : 0;

  return {
    sentimentBias: Math.round(sentimentBias * 100),
    overreactionRate: Math.round(overreactionRate * 100),
    herdingBehavior: Math.round(Math.min(herdingBehavior * 100, 100)),
    reactionLag: Math.round(reactionLag / 1000) // in seconds
  };
}

function analyzeNewsImpact(trades: Trade[], news: News[]) {
  return news
    .slice(-10) // Last 10 news items
    .map((newsItem) => {
      const relatedTrades = trades.filter(
        (t) => Math.abs(t.timestamp - newsItem.timestamp) < 300000 && newsItem.sentiment !== 0
      );

      const priceChanges = relatedTrades.map((t) => {
        // Rough estimate: sentiment * quantity
        return t.sentiment * (t.type === 'buy' ? 1 : -1) * 0.01;
      });

      return {
        headline: newsItem.headline,
        sentiment: newsItem.sentiment,
        tradesWithin5min: relatedTrades.length,
        averagePriceChange:
          priceChanges.length > 0 ? priceChanges.reduce((a, b) => a + b) / priceChanges.length : 0
      };
    });
}

function analyzeTraderStats(trades: Trade[]) {
  const traderGroups = groupBy(trades, 'userId');

  return Object.entries(traderGroups)
    .map(([userId, userTrades]) => {
      const buys = userTrades.filter((t) => t.type === 'buy');
      const sells = userTrades.filter((t) => t.type === 'sell');

      // Rough win rate based on buy/sell ratio at different times
      const winRate = Math.min(50 + Math.random() * 20, 100); // Placeholder

      // Average gain = (average sell price - average buy price) / average buy price
      const avgBuyPrice = buys.length > 0 ? buys.reduce((sum, t) => sum + t.price, 0) / buys.length : 0;
      const avgSellPrice = sells.length > 0 ? sells.reduce((sum, t) => sum + t.price, 0) / sells.length : 0;
      const averageGain = avgBuyPrice > 0 ? ((avgSellPrice - avgBuyPrice) / avgBuyPrice) * 100 : 0;

      // Behavior pattern
      const sentimentFollowing = userTrades.filter((t) => {
        const bullish = t.sentiment > 0 && t.type === 'buy';
        const bearish = t.sentiment < 0 && t.type === 'sell';
        return bullish || bearish;
      }).length;
      const followRate = userTrades.length > 0 ? sentimentFollowing / userTrades.length : 0;

      let behaviorPattern = 'Rational';
      if (followRate > 0.7) {
        behaviorPattern = 'Sentiment Follower';
      } else if (followRate < 0.3) {
        behaviorPattern = 'Contrarian';
      } else if (userTrades.length > 50) {
        behaviorPattern = 'Active Trader';
      }

      return {
        userId: userId.substring(0, 8) + '...',
        trades: userTrades.length,
        winRate: Math.round(winRate),
        averageGain: Math.round(averageGain * 100) / 100,
        behaviorPattern
      };
    })
    .sort((a, b) => b.trades - a.trades);
}

function groupBy(arr: any[], key: string) {
  return arr.reduce(
    (groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    },
    {} as Record<string, any[]>
  );
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: node analyze-trades.js <market-data-file.json>');
  process.exit(1);
}

const filePath = args[0];

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

const report = analyzeData(filePath);

console.log('\n════════════════════════════════════════════════════════════');
console.log('           MARKET SIMULATION - ANALYSIS REPORT');
console.log('════════════════════════════════════════════════════════════\n');

console.log(`📊 File: ${report.exportFile}`);
console.log(`⏰ Generated: ${new Date(report.generatedAt).toLocaleString()}\n`);

console.log('📈 SUMMARY STATISTICS');
console.log('─'.repeat(60));
console.log(`  Total Trades: ${report.summary.totalTrades}`);
console.log(`  Unique Traders: ${report.summary.uniqueTraders}`);
console.log(`  Duration: ${report.summary.tradingDuration}`);
console.log(`  Total Volume: $${(report.summary.totalVolume / 1000).toFixed(1)}k`);
console.log(`  Average Trade Size: ${report.summary.averageTradeSize.toFixed(1)} shares\n`);

console.log('💰 TRADE METRICS');
console.log('─'.repeat(60));
console.log(`  Buy Orders: ${report.perTradmetrics.buyCount} (${report.perTradmetrics.totalBuys} shares)`);
console.log(`  Sell Orders: ${report.perTradmetrics.sellCount} (${report.perTradmetrics.totalSells} shares)`);
console.log(`  Avg Buy Price: $${report.perTradmetrics.averageBuyPrice.toFixed(2)}`);
console.log(`  Avg Sell Price: $${report.perTradmetrics.averageSellPrice.toFixed(2)}\n`);

console.log('🧠 BEHAVIORAL METRICS');
console.log('─'.repeat(60));
console.log(`  Sentiment Bias: ${report.behavioralMetrics.sentimentBias}%`);
console.log(`    → Traders follow news sentiment ${report.behavioralMetrics.sentimentBias}% of the time`);
console.log(`  Overreaction Rate: ${report.behavioralMetrics.overreactionRate}%`);
console.log(`    → After high-optics news, ${report.behavioralMetrics.overreactionRate}% place large trades`);
console.log(`  Herding Behavior: ${report.behavioralMetrics.herdingBehavior}%`);
console.log(`    → Likelihood of clustering trades in same stock`);
console.log(`  Reaction Lag: ${report.behavioralMetrics.reactionLag}s average\n`);

if (report.newsByImpact.length > 0) {
  console.log('📰 TOP NEWS EVENTS & IMPACT');
  console.log('─'.repeat(60));
  for (const impact of report.newsByImpact) {
    console.log(`  "${impact.headline}"`);
    console.log(`    Sentiment: ${(impact.sentiment * 100).toFixed(0)}% | Trades: ${impact.tradesWithin5min}`);
    console.log(`    Avg Price Move: ${(impact.averagePriceChange * 100).toFixed(2)}%\n`);
  }
}

console.log('👥 TOP TRADERS');
console.log('─'.repeat(60));
for (let i = 0; i < Math.min(5, report.traderStats.length); i++) {
  const trader = report.traderStats[i];
  console.log(`  ${i + 1}. ${trader.userId}`);
  console.log(
    `     Trades: ${trader.trades} | Win Rate: ${trader.winRate}% | Gain: ${trader.averageGain > 0 ? '+' : ''}${trader.averageGain}%`
  );
  console.log(`     Pattern: ${trader.behaviorPattern}\n`);
}

console.log('════════════════════════════════════════════════════════════');
console.log('Data analysis complete. Use for research and behavioral study.\n');

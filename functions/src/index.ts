import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'

// Types
interface Stock {
  symbol: string
  price: number
  change: number
  changePercent: number
  sentiment: number
  optics: number
}

interface MarketState {
  prices: Record<string, Stock>
  news: any[]
  time: number
  sessionStatus: 'idle' | 'active' | 'paused' | 'ended'
  controllerId: string | null
  lastUpdate: number
}

interface NewsImpact {
  symbol?: string
  priceChange: number
}

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp()
}

const db = admin.firestore()

/**
 * MARKET PHYSICS ENGINE
 * The heart of the simulation - runs only when controller claims it
 */

function gaussianRandom(mu: number = 0, sigma: number = 1): number {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random() // Converting [0,1) to (0,1)
  while (v === 0) v = Math.random()
  const z0 = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  return z0 * sigma + mu
}

function calculatePriceImpact(
  stock: Stock,
  basePrice: number,
  news: any[]
): NewsImpact {
  let totalImpact = 0

  // Apply news decay and calculate impact
  for (const newsItem of news) {
    if (newsItem.target === 'market' || newsItem.target === stock.symbol) {
      const decayedSentiment = newsItem.sentiment * newsItem.decay
      const opticWeight = newsItem.optics // 0 to 1
      const impact = decayedSentiment * opticWeight * 0.02 // Cap impact at 2%

      totalImpact += impact
    }
  }

  // Behavioral modifiers
  if (totalImpact > 0) {
    // Gains are dampened (loss aversion)
    totalImpact *= 0.7
  } else {
    // Losses hit harder
    totalImpact *= 1.3
  }

  // Mean reversion after attention fades
  const avgNews = news.filter((n) => n.decay > 0.3).length
  if (avgNews === 0) {
    totalImpact *= 0.95 // Slow drift back to base
  }

  return {
    priceChange: totalImpact
  }
}

function applyReactionLag(priceChange: number): number {
  // Simulate slow market reaction - 60% immediate, 40% delayed
  return priceChange * 0.6
}

async function tickMarket(): Promise<void> {
  try {
    // Find active session
    const sessionsRef = db.collection('sessions')
    const activeSession = await sessionsRef.where('active', '==', true).limit(1).get()

    if (activeSession.empty) {
      console.log('No active session')
      return
    }

    const controllerId = activeSession.docs[0].data().controllerId
    const marketStatePath = `artifacts/${controllerId}/public/data/market_state/main`

    // Get current market state
    const marketStateDoc = await db.doc(marketStatePath).get()
    if (!marketStateDoc.exists) {
      console.log('Market state not found')
      return
    }

    const currentState: MarketState = marketStateDoc.data() as MarketState

    if (currentState.sessionStatus !== 'active') {
      console.log('Session not active, skipping tick')
      return
    }

    // Get active news
    const newsRef = db.collection('news')
    const newsSnapshot = await newsRef.where('decay', '>', 0).get()
    const activeNews = newsSnapshot.docs.map((d) => d.data())

    // Decay news over time
    for (const newsItem of activeNews) {
      const age = Date.now() - newsItem.timestamp
      const halfLife = 120000 // 2 minutes
      const decay = Math.pow(0.5, age / halfLife)
      
      if (decay < 0.01) {
        // Archive old news
        await db.collection('news').doc(newsItem.id).update({ decay: 0, archived: true })
      } else {
        await db.collection('news').doc(newsItem.id).update({ decay })
      }
    }

    // Update each stock
    const updatedPrices: Record<string, Stock> = {}

    for (const [symbol, stock] of Object.entries(currentState.prices)) {
      if (!stock) continue

      // 1. Base drift + random walk
      const drift = 0.001 // Slight upward bias
      const randomWalk = gaussianRandom(0, 0.015) // Standard deviation 1.5%
      const basePriceChange = (drift + randomWalk) / 100

      // 2. News impact
      const newsImpact = calculatePriceImpact(stock, stock.price, activeNews)

      // 3. Apply reaction lag
      const laggedChange = applyReactionLag(newsImpact.priceChange)

      // 4. Total price change
      const totalChange = basePriceChange + laggedChange

      // 5. Hard clamp - no absurd spikes
      const clampedChange = Math.max(-0.05, Math.min(0.05, totalChange))

      // 6. Calculate new price
      const newPrice = stock.price * (1 + clampedChange)

      // 7. Calculate sentiment for UI
      const sentiment = Math.max(-1, Math.min(1, newsImpact.priceChange * 10))

      updatedPrices[symbol] = {
        symbol,
        price: Math.max(0.01, newPrice), // Never go below $0.01
        change: newPrice - stock.price,
        changePercent: ((newPrice - stock.price) / stock.price) * 100,
        sentiment,
        optics: stock.optics * 0.95 // Decay visual prominence
      }

      // Store price history for analysis
      await db.collection('price_history').add({
        symbol,
        price: updatedPrices[symbol].price,
        timestamp: Date.now(),
        sentiment: updatedPrices[symbol].sentiment
      })
    }

    // Update market state
    const updatedState: MarketState = {
      ...currentState,
      prices: updatedPrices,
      time: Date.now(),
      lastUpdate: Date.now()
    }

    await db.doc(marketStatePath).set(updatedState)
    console.log(`Market tick complete - ${Object.keys(updatedPrices).length} stocks updated`)
  } catch (error) {
    console.error('Market tick error:', error)
  }
}

/**
 * Cloud Function: Market Engine Scheduler
 * Runs every 1 second
 */
export const marketEngine = functions
  .runWith({ timeoutSeconds: 300, memory: '256MB' })
  .pubsub.schedule('every 1 seconds')
  .onRun(async () => {
    await tickMarket()
  })

/**
 * Cloud Function: HTTP endpoint to manually trigger market tick
 */
export const manualTick = functions.https.onRequest(async (req, res) => {
  try {
    await tickMarket()
    res.json({ success: true, message: 'Market tick executed' })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

/**
 * Cloud Function: Archive old data
 * Runs daily
 */
export const archiveOldData = functions
  .runWith({ timeoutSeconds: 300, memory: '512MB' })
  .pubsub.schedule('every day 02:00')
  .onRun(async () => {
    try {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

      // Archive old trades
      const oldTrades = await db
        .collection('trades')
        .where('timestamp', '<', sevenDaysAgo)
        .limit(1000)
        .get()

      for (const doc of oldTrades.docs) {
        await doc.ref.update({ archived: true })
      }

      // Archive old price history
      const oldPriceHistory = await db
        .collection('price_history')
        .where('timestamp', '<', sevenDaysAgo)
        .limit(1000)
        .get()

      for (const doc of oldPriceHistory.docs) {
        await doc.ref.delete()
      }

      console.log(`Archived ${oldTrades.size} trades and ${oldPriceHistory.size} price records`)
    } catch (error) {
      console.error('Archive error:', error)
    }
  })

/**
 * Cloud Function: Cleanup disconnected controllers
 * Runs every 5 minutes
 */
export const cleanupControllers = functions
  .runWith({ timeoutSeconds: 60, memory: '256MB' })
  .pubsub.schedule('every 5 minutes')
  .onRun(async () => {
    try {
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000

      const orphanedSessions = await db
        .collection('sessions')
        .where('active', '==', true)
        .where('lastHeartbeat', '<', fiveMinutesAgo)
        .get()

      for (const session of orphanedSessions.docs) {
        const data = session.data()
        const marketPath = `artifacts/${data.controllerId}/public/data/market_state/main`
        
        // Freeze market instead of continuing without controller
        await db.doc(marketPath).update({
          sessionStatus: 'paused',
          note: 'Controller disconnected - market frozen'
        })

        // Deactivate session
        await session.ref.update({ active: false, status: 'lost_controller' })
        console.log(`Froze market ${session.id} - controller disconnected`)
      }
    } catch (error) {
      console.error('Cleanup error:', error)
    }
  })

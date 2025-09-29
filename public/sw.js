// PWA: Service Worker for X-Ray Diagnostic Game
// Provides offline functionality, caching, and mobile optimizations

const CACHE_NAME = 'x-ray-diagnostic-v1.0.0'
const STATIC_CACHE = 'x-ray-static-v1'
const DYNAMIC_CACHE = 'x-ray-dynamic-v1'
const AI_CACHE = 'x-ray-ai-responses-v1'

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.ts',
  '/src/style.css',
  '/src/canvas-enhanced.ts',
  '/src/components/responsive-viewport.ts',
  '/src/components/mobile-camera.ts',
  '/src/components/x-ray-effect.ts',
  '/manifest.json'
]

// AI/Dynamic content patterns
const AI_ENDPOINTS = [
  '/api/cerebras',
  '/api/face-detection',
  '/api/medical-analysis'
]

// Cache strategies
const CACHE_STRATEGIES = {
  static: 'cache-first',
  dynamic: 'network-first', 
  ai: 'network-first-with-fallback'
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker: Installing...')
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...')
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== AI_CACHE) {
              console.log('🗑️ Service Worker: Deleting old cache', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      
      // Claim all clients immediately
      self.clients.claim()
    ])
  )
})

// Fetch event - handle all network requests
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Handle different types of requests
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request))
  } else if (isAIRequest(request)) {
    event.respondWith(handleAIRequest(request))
  } else if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request))
  } else {
    event.respondWith(handleDynamicRequest(request))
  }
})

// Static asset handler (cache-first)
async function handleStaticAsset(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Fallback to network
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('❌ Static asset fetch failed:', error)
    return new Response('Offline - Asset not available', { status: 503 })
  }
}

// AI request handler with intelligent caching
async function handleAIRequest(request) {
  const cacheKey = await generateAIRequestKey(request)
  
  try {
    // For AI requests, try network first for fresh data
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache AI responses for offline use
      const cache = await caches.open(AI_CACHE)
      const responseClone = networkResponse.clone()
      
      // Add timestamp for cache invalidation
      const responseWithTimestamp = new Response(
        JSON.stringify({
          data: await responseClone.json(),
          timestamp: Date.now(),
          cached: true
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Cache': 'fresh'
          }
        }
      )
      
      cache.put(cacheKey, responseWithTimestamp)
      return networkResponse
    }
    
    throw new Error('Network response not ok')
    
  } catch (error) {
    console.warn('🔄 AI request failed, checking cache:', error)
    
    // Fallback to cached response
    const cachedResponse = await caches.match(cacheKey)
    
    if (cachedResponse) {
      const cachedData = await cachedResponse.json()
      const cacheAge = Date.now() - cachedData.timestamp
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours
      
      if (cacheAge < maxAge) {
        console.log('📂 Serving cached AI response')
        return new Response(
          JSON.stringify(cachedData.data),
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Cache': 'stale',
              'X-Cache-Age': Math.floor(cacheAge / 1000).toString()
            }
          }
        )
      }
    }
    
    // No cache or expired cache
    return new Response(
      JSON.stringify({ 
        error: 'AI service unavailable offline',
        offline: true,
        fallback: getFallbackAIResponse(request)
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Image request handler with progressive loading
async function handleImageRequest(request) {
  try {
    // Try cache first for images
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Network request with timeout for mobile
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout
    
    const networkResponse = await fetch(request, {
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (networkResponse.ok) {
      // Cache images for offline use
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
    
  } catch (error) {
    console.warn('🖼️ Image request failed:', error)
    
    // Return placeholder image for offline
    return new Response(
      createPlaceholderImage(),
      {
        headers: {
          'Content-Type': 'image/svg+xml',
          'X-Cache': 'placeholder'
        }
      }
    )
  }
}

// Dynamic request handler (network-first)
async function handleDynamicRequest(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
    
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline fallback
    if (request.url.includes('.html') || request.headers.get('Accept')?.includes('text/html')) {
      return new Response(createOfflinePage(), {
        headers: { 'Content-Type': 'text/html' }
      })
    }
    
    return new Response('Offline - Resource not available', { status: 503 })
  }
}

// Helper functions
function isStaticAsset(request) {
  const url = new URL(request.url)
  return STATIC_ASSETS.some(asset => url.pathname === asset) ||
         url.pathname.includes('/src/') ||
         url.pathname.includes('.js') ||
         url.pathname.includes('.css') ||
         url.pathname.includes('.ts')
}

function isAIRequest(request) {
  const url = new URL(request.url)
  return AI_ENDPOINTS.some(endpoint => url.pathname.includes(endpoint)) ||
         url.hostname.includes('cerebras') ||
         url.hostname.includes('openai') ||
         request.url.includes('api/medical') ||
         request.url.includes('api/diagnos')
}

function isImageRequest(request) {
  const url = new URL(request.url)
  return request.headers.get('Accept')?.includes('image/') ||
         url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)
}

async function generateAIRequestKey(request) {
  // Create cache key based on request content for AI requests
  const url = new URL(request.url)
  const body = await request.clone().text().catch(() => '')
  const keyData = url.pathname + url.search + body
  
  // Simple hash for cache key
  let hash = 0
  for (let i = 0; i < keyData.length; i++) {
    const char = keyData.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  return `ai-request-${hash}`
}

function getFallbackAIResponse(request) {
  const url = new URL(request.url)
  
  // Provide basic fallback responses for different AI endpoints
  if (url.pathname.includes('diagnostic')) {
    return {
      diagnosis: 'Offline mode - Limited diagnostic capability',
      confidence: 0.1,
      message: 'Please connect to the internet for full AI analysis'
    }
  }
  
  if (url.pathname.includes('face')) {
    return {
      detected: false,
      message: 'Face processing requires internet connection'
    }
  }
  
  return {
    message: 'AI service unavailable in offline mode',
    offline: true
  }
}

function createPlaceholderImage() {
  return `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#0c0c0c" stroke="#00ff88" stroke-width="2"/>
      <text x="200" y="140" font-family="Roboto, monospace" font-size="16" fill="#00ff88" text-anchor="middle">
        📡 Offline Mode
      </text>
      <text x="200" y="170" font-family="Roboto, monospace" font-size="14" fill="#00ff88" text-anchor="middle" opacity="0.7">
        Image not available
      </text>
    </svg>
  `
}

function createOfflinePage() {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>X-Ray Diagnostic - Offline</title>
        <style>
          body {
            font-family: 'Roboto', monospace;
            background: #0c0c0c;
            color: #00ff88;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            padding: 20px;
            text-align: center;
          }
          .offline-icon {
            font-size: 64px;
            margin-bottom: 20px;
            opacity: 0.8;
          }
          h1 {
            font-size: 2rem;
            margin-bottom: 10px;
          }
          p {
            font-size: 1.2rem;
            opacity: 0.8;
            margin-bottom: 30px;
          }
          .retry-btn {
            background: rgba(0, 255, 136, 0.2);
            border: 2px solid #00ff88;
            color: #00ff88;
            padding: 12px 24px;
            font-size: 1rem;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .retry-btn:hover {
            background: rgba(0, 255, 136, 0.3);
          }
          .features {
            margin-top: 40px;
            text-align: left;
            max-width: 400px;
          }
          .feature {
            display: flex;
            align-items: center;
            margin: 15px 0;
            font-size: 0.9rem;
            opacity: 0.7;
          }
          .feature-icon {
            margin-right: 10px;
            font-size: 1.2rem;
          }
        </style>
      </head>
      <body>
        <div class="offline-icon">📡</div>
        <h1>Offline Mode</h1>
        <p>X-Ray Diagnostic Game is running in offline mode</p>
        
        <button class="retry-btn" onclick="window.location.reload()">
          🔄 Try Again
        </button>
        
        <div class="features">
          <div class="feature">
            <span class="feature-icon">✅</span>
            <span>Basic 3D X-Ray viewer works offline</span>
          </div>
          <div class="feature">
            <span class="feature-icon">✅</span>
            <span>Cached medical conditions available</span>
          </div>
          <div class="feature">
            <span class="feature-icon">❌</span>
            <span>AI diagnostic analysis requires connection</span>
          </div>
          <div class="feature">
            <span class="feature-icon">❌</span>
            <span>Face morphing requires connection</span>
          </div>
        </div>
        
        <script>
          // Auto-retry when connection is restored
          window.addEventListener('online', () => {
            window.location.reload()
          })
        </script>
      </body>
    </html>
  `
}

// Background sync for AI requests when connection is restored
self.addEventListener('sync', (event) => {
  if (event.tag === 'ai-sync') {
    event.waitUntil(syncAIRequests())
  }
})

async function syncAIRequests() {
  console.log('🔄 Syncing cached AI requests...')
  // Implementation for syncing pending AI requests
  // This would process any queued diagnostic requests
}

// Push notifications for diagnostic updates
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New diagnostic insights available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Diagnosis',
        icon: '/icons/action-explore.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/action-close.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('X-Ray Diagnostic', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/?notification=diagnostic')
    )
  }
})

console.log('🚀 X-Ray Diagnostic Service Worker loaded')
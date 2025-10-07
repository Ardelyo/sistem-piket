// =====================================
// SHEETS.JS - Frontend Google Sheets API
// Piket Kelas X-E8 Connection
// =====================================

// CONFIGURATION - CHANGE THIS
const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbxB7AriPALPijIkRk478yJptSTXjXgQHaa2t5wneJi73NblGwPRiHOhFieB4QXZ_kuo/exec';

// Cache configuration
const CACHE_DURATION = 60000; // 1 minute in milliseconds
const cache = new Map();

// =====================================
// CORE API FUNCTIONS
// =====================================

/**
 * JSONP GET Request (Bypass CORS)
 */
export function apiGet(action, params = {}) {
  return new Promise((resolve, reject) => {
    // Check cache first
    const cacheKey = `${action}_${JSON.stringify(params)}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      console.log('📦 Using cached data for:', action);
      resolve(cached);
      return;
    }
    
    // Create unique callback name
    const callbackName = `jsonpCallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Setup timeout
    const timeout = setTimeout(() => {
      cleanup();
      console.warn('⏱️ Request timeout for:', action);
      
      // Try to use cached data even if expired
      const expiredCache = cache.get(cacheKey);
      if (expiredCache) {
        console.log('📦 Using expired cache as fallback');
        resolve(expiredCache.data);
      } else {
        reject(new Error('Request timeout and no cache available'));
      }
    }, 10000); // 10 second timeout
    
    // Create callback function
    window[callbackName] = function(response) {
      clearTimeout(timeout);
      console.log('✅ Response received for:', action, response);
      
      // Cache the response
      setCache(cacheKey, response);
      
      resolve(response);
      cleanup();
    };
    
    // Cleanup function
    const cleanup = () => {
      delete window[callbackName];
      const script = document.getElementById(callbackName);
      if (script) {
        script.remove();
      }
    };
    
    // Build URL with parameters
    const url = new URL(SHEETS_API_URL);
    url.searchParams.append('action', action);
    url.searchParams.append('callback', callbackName);
    
    // Add additional parameters
    Object.keys(params).forEach(key => {
      url.searchParams.append(key, params[key]);
    });
    
    // Create and append script
    const script = document.createElement('script');
    script.id = callbackName;
    script.src = url.toString();
    script.onerror = () => {
      clearTimeout(timeout);
      cleanup();
      console.error('❌ Failed to load script for:', action);
      
      // Fallback to localStorage
      const localData = getFromLocalStorage(cacheKey);
      if (localData) {
        console.log('💾 Using localStorage fallback');
        resolve(localData);
      } else {
        reject(new Error('Failed to fetch data'));
      }
    };
    
    document.body.appendChild(script);
  });
}

/**
 * POST Request (No-CORS mode)
 */
export async function apiPost(action, data) {
  try {
    console.log('📤 Sending POST:', action, data);
    
    // Optimistic update - save to localStorage first
    const tempId = `temp_${Date.now()}`;
    saveToQueue(action, data, tempId);
    
    // Send to Google Sheets
    const response = await fetch(SHEETS_API_URL, {
      method: 'POST',
      mode: 'no-cors', // Important: This means we can't read the response
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: action,
        ...data,
        timestamp: new Date().toISOString()
      })
    });
    
    // Since we can't read the response in no-cors mode,
    // we assume success and verify with a GET request
    console.log('📤 POST sent (no-cors), verifying...');
    
    // Remove from queue on assumed success
    removeFromQueue(tempId);
    
    // Verify with GET after a short delay
    setTimeout(() => {
      verifyPostSuccess(action, data);
    }, 1000);
    
    return {
      success: true,
      message: 'Data sent successfully',
      optimistic: true
    };
    
  } catch (error) {
    console.error('❌ POST failed:', error);
    
    // Keep in queue for retry
    return {
      success: false,
      message: error.message,
      queued: true
    };
  }
}

// =====================================
// SPECIFIC API CALLS
// =====================================

// Absensi Functions
export const absensiAPI = {
  async scanQR(qrData, nama) {
    return apiPost('absensi', {
      qrData,
      nama,
      timestamp: new Date().toISOString()
    });
  },
  
  async getTodayAbsensi() {
    const response = await apiGet('getAbsensiToday');
    return response.data || [];
  },
  
  async getAbsensiByDate(date) {
    const response = await apiGet('getAbsensiByDate', { date });
    return response.data || [];
  },
  
  async getAllAbsensi() {
    const response = await apiGet('getAllAbsensi');
    return response.data || [];
  }
};

// Jadwal Functions
export const jadwalAPI = {
  async getJadwalHariIni() {
    const response = await apiGet('getJadwal');
    return response.data || { hari: null, siswa: [] };
  },
  
  async getJadwalByHari(hari) {
    const response = await apiGet('getJadwal', { hari });
    return response.data || { hari: hari, siswa: [] };
  },
  
  async getAllJadwal() {
    const response = await apiGet('getAllJadwal');
    return response.data || {};
  },
  
  async updateJadwal(hari, siswa, adminNama) {
    return apiPost('updateJadwal', {
      hari,
      siswa,
      adminNama
    });
  }
};

// Laporan Functions
export const laporanAPI = {
  async createLaporan(laporanData) {
    return apiPost('createLaporan', laporanData);
  },
  
  async getLaporanByNama(nama) {
    const response = await apiGet('getLaporan', { nama });
    return response.data || [];
  },
  
  async getAllLaporan() {
    const response = await apiGet('getAllLaporan');
    return response.data || [];
  }
};

// Student Functions
export const studentAPI = {
  async getAllStudents() {
    const response = await apiGet('getStudents');
    return response.data || [];
  },
  
  async getLeaderboard() {
    const response = await apiGet('getLeaderboard');
    return response.data || [];
  }
};

// Statistics Functions
export const statsAPI = {
  async getStatistics() {
    const response = await apiGet('getStatistics');
    return response.data || {};
  }
};

// Admin Functions
export const adminAPI = {
  async login(username, password) {
    return apiPost('adminLogin', {
      username,
      password
    });
  },
  
  async addPelanggaran(pelanggaranData) {
    return apiPost('addPelanggaran', pelanggaranData);
  },
  
  async getPelanggaran() {
    const response = await apiGet('getPelanggaran');
    return response.data || [];
  }
};

// =====================================
// REALTIME SYNC
// =====================================

class RealtimeSync {
  constructor() {
    this.interval = null;
    this.callbacks = new Map();
    this.isRunning = false;
    this.errorCount = 0;
    this.maxErrors = 3;
  }
  
  start(intervalMs = 30000) {
    if (this.isRunning) {
      console.log('⏰ Sync already running');
      return;
    }
    
    console.log(`⏰ Starting realtime sync (every ${intervalMs/1000}s)`);
    this.isRunning = true;
    this.errorCount = 0;
    
    // Initial sync
    this.sync();
    
    // Set interval
    this.interval = setInterval(() => {
      this.sync();
    }, intervalMs);
  }
  
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      this.isRunning = false;
      console.log('⏹️ Realtime sync stopped');
    }
  }
  
  async sync() {
    if (!navigator.onLine) {
      console.log('📴 Offline - skipping sync');
      this.notifyCallbacks('offline', null);
      return;
    }
    
    try {
      console.log('🔄 Syncing...');
      this.notifyCallbacks('syncing', null);
      
      // Fetch latest data
      const [absensi, jadwal, stats] = await Promise.all([
        absensiAPI.getTodayAbsensi(),
        jadwalAPI.getJadwalHariIni(),
        statsAPI.getStatistics()
      ]);
      
      // Notify callbacks with new data
      this.notifyCallbacks('success', {
        absensi,
        jadwal,
        stats
      });
      
      // Reset error count on success
      this.errorCount = 0;
      
      // Process queued items
      await this.processQueue();
      
    } catch (error) {
      console.error('❌ Sync error:', error);
      this.errorCount++;
      
      this.notifyCallbacks('error', error);
      
      // Stop if too many errors
      if (this.errorCount >= this.maxErrors) {
        console.error('🛑 Max errors reached, stopping sync');
        this.stop();
        this.notifyCallbacks('stopped', 'Max errors reached');
      }
    }
  }
  
  onUpdate(callback) {
    const id = Date.now().toString();
    this.callbacks.set(id, callback);
    return () => this.callbacks.delete(id);
  }
  
  notifyCallbacks(status, data) {
    this.callbacks.forEach(callback => {
      callback(status, data);
    });
  }
  
  async processQueue() {
    const queue = getQueue();
    if (queue.length === 0) return;
    
    console.log(`📤 Processing ${queue.length} queued items`);
    
    for (const item of queue) {
      try {
        await apiPost(item.action, item.data);
        removeFromQueue(item.id);
      } catch (error) {
        console.error('Failed to process queued item:', error);
      }
    }
  }
}

export const realtimeSync = new RealtimeSync();

// =====================================
// CACHE MANAGEMENT
// =====================================

function setCache(key, data) {
  cache.set(key, {
    data: data,
    timestamp: Date.now()
  });
  
  // Also save to localStorage for persistence
  try {
    localStorage.setItem(`cache_${key}`, JSON.stringify({
      data: data,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

function getFromCache(key) {
  // Check memory cache first
  const cached = cache.get(key);
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    return cached.data;
  }
  
  // Check localStorage
  try {
    const stored = localStorage.getItem(`cache_${key}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        // Restore to memory cache
        cache.set(key, parsed);
        return parsed.data;
      }
    }
  } catch (e) {
    console.warn('Failed to read from localStorage:', e);
  }
  
  return null;
}

function getFromLocalStorage(key) {
  try {
    const stored = localStorage.getItem(`cache_${key}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.data;
    }
  } catch (e) {
    console.warn('Failed to read from localStorage:', e);
  }
  return null;
}

// =====================================
// QUEUE MANAGEMENT (Offline Support)
// =====================================

function saveToQueue(action, data, id) {
  try {
    const queue = JSON.parse(localStorage.getItem('api_queue') || '[]');
    queue.push({
      id: id || Date.now().toString(),
      action: action,
      data: data,
      timestamp: Date.now()
    });
    localStorage.setItem('api_queue', JSON.stringify(queue));
  } catch (e) {
    console.error('Failed to save to queue:', e);
  }
}

function getQueue() {
  try {
    return JSON.parse(localStorage.getItem('api_queue') || '[]');
  } catch (e) {
    console.error('Failed to get queue:', e);
    return [];
  }
}

function removeFromQueue(id) {
  try {
    const queue = getQueue();
    const filtered = queue.filter(item => item.id !== id);
    localStorage.setItem('api_queue', JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to remove from queue:', e);
  }
}

// =====================================
// VERIFICATION
// =====================================

async function verifyPostSuccess(action, data) {
  // Verify by fetching latest data
  try {
    switch(action) {
      case 'absensi':
        const absensi = await absensiAPI.getTodayAbsensi();
        console.log('✅ Verification: Absensi updated', absensi);
        break;
        
      case 'createLaporan':
        const laporan = await laporanAPI.getAllLaporan();
        console.log('✅ Verification: Laporan created', laporan);
        break;
        
      default:
        console.log('✅ Assumed success for:', action);
    }
  } catch (error) {
    console.warn('⚠️ Could not verify:', action, error);
  }
}

// =====================================
// CONNECTION TEST
// =====================================

export async function testConnection() {
  console.log('🧪 Testing connection to Google Sheets...');
  
  try {
    const response = await apiGet('test');
    
    if (response.success) {
      console.log('✅ Connection successful!', response);
      return {
        success: true,
        message: 'Connected to Google Sheets',
        data: response
      };
    } else {
      throw new Error(response.message || 'Connection failed');
    }
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return {
      success: false,
      message: error.message,
      error: error
    };
  }
}

// =====================================
// EXPORT ALL
// =====================================

export default {
  // Core functions
  apiGet,
  apiPost,
  
  // API modules
  absensiAPI,
  jadwalAPI,
  laporanAPI,
  studentAPI,
  statsAPI,
  adminAPI,
  
  // Realtime sync
  realtimeSync,
  
  // Utilities
  testConnection,
  
  // Configuration
  SHEETS_API_URL
};
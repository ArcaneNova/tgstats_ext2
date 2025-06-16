// Enhanced TGStat Scraper with Zero Data Loss Protection and Maximum Performance

class TGStatScraperPro {
    constructor() {
        console.log('🚀 TGStat Scraper Pro initializing...');
        
        // Core state
        this.isRunning = false;
        this.scrapedData = [];
        this.currentCategoryData = [];  // Store data specific to the current category
        this.stats = {
            channelCount: 0,
            loadMoreCount: 0,
            pageCount: 0,
            currentPage: 1,
            lastOffset: 0,
            lastSaveCount: 0,
            lastSuccessfulPage: 1,
            lastSuccessfulOffset: 0,
            sessionsCompleted: 0,
            totalProcessingTime: 0,
            averagePageTime: 0
        };
        
        // Enhanced performance settings
        this.maxRetries = 5; // Reduced for faster operation
        this.retryDelay = 1000; // Faster retry (1 second)
        this.autoSaveThreshold = 5000; // Save every 5k for better performance
        this.processedUrls = new Set();
        this.existingIds = new Set();
        this.chunkSize = 500; // Smaller chunks for faster processing
        this.batchSize = 10; // Smaller batches
        this.maxQueueSize = 25000; // Larger queue for better performance
        
        // Memory management
        this.cleanupInterval = 30000; // More frequent cleanup (30 seconds)
        this.lastCleanup = Date.now();
        this.processingQueue = [];
        this.dataQueue = [];
        
        // Network optimization
        this.requestQueue = [];
        this.maxConcurrentRequests = 3;
        this.activeRequests = 0;
        this.networkTimeout = 15000; // 15 second timeout
        
        // Enhanced state protection
        this.saveInterval = 1000; // Save every 1 second for max protection
        this.lastSaveTime = 0;
        this.emergencySaveInterval = null;
        this.heartbeatInterval = null;
        this.lastHeartbeat = Date.now();
        
        // Categories for auto mode
        this.categories = [
            { name: "Blogs", url: "https://tgstat.ru/blogs", count: "142.8k" },
            { name: "News and Media", url: "https://tgstat.ru/news", count: "67.3k" },
            { name: "Humor and entertainment", url: "https://tgstat.ru/entertainment", count: "43.7k" },
            { name: "Technologies", url: "https://tgstat.ru/tech", count: "18.7k" },
            { name: "Economy", url: "https://tgstat.ru/economics", count: "16.1k" },
            { name: "Business and Startups", url: "https://tgstat.ru/business", count: "37.8k" },
            { name: "Cryptocurrencies", url: "https://tgstat.ru/crypto", count: "32.6k" },
            { name: "Trips", url: "https://tgstat.ru/travels", count: "21.3k" },
            { name: "Marketing, PR, advertising", url: "https://tgstat.ru/marketing", count: "19.2k" },
            { name: "Psychology", url: "https://tgstat.ru/psychology", count: "35.8k" },
            { name: "Design", url: "https://tgstat.ru/design", count: "8.5k" },
            { name: "Policy", url: "https://tgstat.ru/politics", count: "20.0k" },
            { name: "Art", url: "https://tgstat.ru/art", count: "22.7k" },
            { name: "Right", url: "https://tgstat.ru/law", count: "5.0k" },
            { name: "Education", url: "https://tgstat.ru/education", count: "26.6k" },
            { name: "Books", url: "https://tgstat.ru/books", count: "15.7k" },
            { name: "Linguistics", url: "https://tgstat.ru/language", count: "6.8k" },
            { name: "Career", url: "https://tgstat.ru/career", count: "14.6k" },
            { name: "Educational", url: "https://tgstat.ru/edutainment", count: "24.3k" },
            { name: "Courses and guides", url: "https://tgstat.ru/courses", count: "2.8k" },
            { name: "Sport", url: "https://tgstat.ru/sport", count: "21.7k" },
            { name: "Fashion and beauty", url: "https://tgstat.ru/beauty", count: "45.6k" },
            { name: "Medicine", url: "https://tgstat.ru/medicine", count: "10.6k" },
            { name: "Health and Fitness", url: "https://tgstat.ru/health", count: "18.6k" },
            { name: "Pictures and photos", url: "https://tgstat.ru/pics", count: "42.9k" },
            { name: "Software and applications", url: "https://tgstat.ru/apps", count: "4.9k" },
            { name: "Videos and movies", url: "https://tgstat.ru/video", count: "26.7k" },
            { name: "Music", url: "https://tgstat.ru/music", count: "33.2k" },
            { name: "Games", url: "https://tgstat.ru/games", count: "55.8k" },
            { name: "Food and cooking", url: "https://tgstat.ru/food", count: "18.1k" },
            { name: "Quotes", url: "https://tgstat.ru/quotes", count: "32.5k" },
            { name: "Needlework", url: "https://tgstat.ru/handmade", count: "6.5k" },
            { name: "Family and children", url: "https://tgstat.ru/babies", count: "12.7k" },
            { name: "Nature", url: "https://tgstat.ru/nature", count: "11.5k" },
            { name: "Interior and construction", url: "https://tgstat.ru/construction", count: "11.5k" },
            { name: "Telegram", url: "https://tgstat.ru/telegram", count: "59.3k" },
            { name: "Instagram", url: "https://tgstat.ru/instagram", count: "3.6k" },
            { name: "Sales", url: "https://tgstat.ru/sales", count: "43.9k" },
            { name: "Transport", url: "https://tgstat.ru/transport", count: "14.3k" },
            { name: "Religion", url: "https://tgstat.ru/religion", count: "11.2k" },
            { name: "Esoterics", url: "https://tgstat.ru/esoterics", count: "18.0k" },
            { name: "Darknet", url: "https://tgstat.ru/darknet", count: "7.7k" },
            { name: "Bookmaking", url: "https://tgstat.ru/gambling", count: "30.2k" },
            { name: "Shock content", url: "https://tgstat.ru/shock", count: "6.4k" },
            { name: "Erotica", url: "https://tgstat.ru/erotica", count: "13.0k" },
            { name: "For adults", url: "https://tgstat.ru/adult", count: "49.6k" },
            { name: "Other", url: "https://tgstat.ru/other", count: "88.7k" }
        ];
        
        this.currentCategoryIndex = 0;
        this.currentCategory = null;
        this.categoryProgress = {
            currentCategoryIndex: 0,
            currentCategoryName: '',
            currentCategoryUrl: '',
            categoryStartTime: null,
            categoryDataCount: 0,
            totalCategoriesCompleted: 0
        };
        
        this.autoMode = false;
        this.formData = null;
        this.pageType = this.getPageType();
        
        // Error handling
        this.networkErrorCount = 0;
        this.maxNetworkErrors = 3;
        this.loadMoreFailureCount = 0;
        this.maxLoadMoreFailures = 5;
        this.consecutiveEmptyPages = 0;
        this.maxEmptyPages = 5;
        
        // Storage keys
        this.dataStorageKey = 'tgstatData';
        this.statsStorageKey = 'tgstatStats';
        this.progressStorageKey = 'tgstatProgress';
        this.stateStorageKey = 'tgstatState';
        
        // Initialize
        this.init();
    }
    
    async init() {
        try {
            console.log('🔧 Initializing scraper components...');
            
            // Setup message listeners
            this.setupMessageListeners();
            
            // Load saved state
            await this.loadSavedState();
            
            // Setup background communication
            this.setupBackgroundCommunication();
            
            // Setup emergency protection
            this.setupEmergencyProtection();
            
            // Setup periodic operations
            this.setupPeriodicOperations();
            
            // Register with background script
            this.registerWithBackground();
            
            console.log('✅ Scraper initialization complete');
            
        } catch (error) {
            console.error('❌ Error during initialization:', error);
        }
    }
    
    setupMessageListeners() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep message channel open
        });
    }
    
    async handleMessage(message, sender, sendResponse) {
        try {
            console.log('📨 Content script received message:', message.type);
            
            switch (message.type) {
                case 'START_SCRAPING':
                    await this.startScraping(message.existingData || [], false);
                    sendResponse({ success: true });
                    break;
                    
                case 'START_AUTO_SCRAPING':
                    await this.startScraping(message.existingData || [], true);
                    sendResponse({ success: true });
                    break;
                    
                case 'STOP_SCRAPING':
                    await this.stopScraping();
                    sendResponse({ success: true });
                    break;
                    
                case 'CHECK_STATUS':
                    sendResponse({ 
                        isRunning: this.isRunning, 
                        autoMode: this.autoMode,
                        categoryProgress: this.categoryProgress,
                        stats: this.stats
                    });
                    break;
                    
                case 'RESET_PROGRESS':
                    const result = await this.resetProgress();
                    sendResponse({ success: result });
                    break;
                    
                case 'GET_CATEGORIES':
                    sendResponse({ categories: this.categories });
                    break;
                    
                case 'NAVIGATE_TO_CATEGORY':
                    const navResult = await this.navigateToCategory(message.categoryIndex);
                    sendResponse({ success: navResult });
                    break;
                    
                case 'SET_START_PAGE':
                    const pageResult = await this.setStartPage(message.startPage);
                    sendResponse({ success: pageResult });
                    break;
                    
                case 'RESTORE_SCRAPING_STATE':
                    await this.restoreScrapingState(message.state);
                    sendResponse({ success: true });
                    break;
                    
                case 'BACKGROUND_HEARTBEAT':
                    this.handleBackgroundHeartbeat(message);
                    sendResponse({ success: true, stats: this.stats });
                    break;
                    
                default:
                    console.log('Unknown message type:', message.type);
                    sendResponse({ success: false, error: 'Unknown message type' });
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({ success: false, error: error.message });
        }
    }
    
    setupBackgroundCommunication() {
        // Send heartbeat to background every 30 seconds
        this.heartbeatInterval = setInterval(() => {
            if (this.isRunning) {
                this.sendHeartbeat();
            }
        }, 30000);
    }
    
    sendHeartbeat() {
        try {
            chrome.runtime.sendMessage({
                type: 'HEARTBEAT',
                data: {
                    stats: this.stats,
                    categoryProgress: this.categoryProgress,
                    autoMode: this.autoMode,
                    currentUrl: window.location.href,
                    timestamp: Date.now()
                }
            }).catch(() => {
                console.log('Background script not responding');
            });
        } catch (error) {
            console.error('Error sending heartbeat:', error);
        }
    }
    
    handleBackgroundHeartbeat(message) {
        this.lastHeartbeat = Date.now();
        console.log('💓 Background heartbeat received');
    }
    
    registerWithBackground() {
        // Let background know we're active
        try {
            chrome.runtime.sendMessage({
                type: 'CONTENT_SCRIPT_READY',
                url: window.location.href,
                timestamp: Date.now()
            }).catch(() => {
                console.log('Background script not responding');
            });
        } catch (error) {
            console.error('Error registering with background:', error);
        }
    }
    
    setupEmergencyProtection() {
        // Emergency save on page unload
        window.addEventListener('beforeunload', () => {
            this.emergencySave();
        });
        
        // Emergency save on visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.emergencySave();
            }
        });
        
        // Emergency save every 30 seconds during active scraping
        this.emergencySaveInterval = setInterval(() => {
            if (this.isRunning) {
                this.emergencySave();
            }
        }, 30000);
    }
    
    setupPeriodicOperations() {
        // Memory cleanup every 30 seconds
        setInterval(() => {
            if (this.isRunning) {
                this.cleanupMemory();
            }
        }, this.cleanupInterval);
        
        // Force save every 10 seconds
        setInterval(() => {
            if (this.isRunning) {
                this.forceSave();
            }
        }, 10000);
        
        // Process data queue every 5 seconds
        setInterval(() => {
            this.processDataQueue();
        }, 5000);
    }
    
    async emergencySave() {
        try {
            console.log('🚨 Emergency save triggered');
            
            const emergencyData = {
                stats: this.stats,
                scrapedData: this.scrapedData,
                categoryProgress: this.categoryProgress,
                processedUrls: Array.from(this.processedUrls),
                existingIds: Array.from(this.existingIds),
                autoMode: this.autoMode,
                currentUrl: window.location.href,
                timestamp: Date.now(),
                type: 'emergency'
            };
            
            // Save to both local storage and background
            await Promise.all([
                this.saveToStorage(emergencyData),
                this.saveToBackground(emergencyData)
            ]);
            
            console.log('✅ Emergency save completed');
        } catch (error) {
            console.error('❌ Emergency save failed:', error);
        }
    }
    
    async saveToStorage(data) {
        try {
            await chrome.storage.local.set({
                [this.stateStorageKey]: data,
                [this.dataStorageKey]: data.scrapedData || [],
                [this.statsStorageKey]: data.stats || {},
                [`${this.stateStorageKey}_backup`]: data,
                lastEmergencySave: Date.now()
            });
        } catch (error) {
            console.error('Error saving to storage:', error);
        }
    }
    
    async saveToBackground(data) {
        try {
            chrome.runtime.sendMessage({
                type: 'EMERGENCY_SAVE',
                data: data
            }).catch(() => {
                console.log('Background script not responding for emergency save');
            });
        } catch (error) {
            console.error('Error saving to background:', error);
        }
    }
      async forceSave() {
        const currentTime = Date.now();
        if (currentTime - this.lastSaveTime < this.saveInterval) {
            return; // Throttle saves
        }
        
        try {
            // Process any queued data first
            await this.processDataQueue();
            
            // Ensure category data is saved
            const currentCategoryStorageKey = `tgstat_category_${this.currentCategoryIndex}`;
            
            const saveData = {
                stats: this.stats,
                categoryProgress: this.categoryProgress,
                processedUrls: Array.from(this.processedUrls),
                existingIds: Array.from(this.existingIds),
                autoMode: this.autoMode,
                timestamp: currentTime,
                currentCategoryIndex: this.currentCategoryIndex,
                currentCategory: this.currentCategory
            };
            
            // Save state and global stats
            await chrome.storage.local.set({
                [this.progressStorageKey]: saveData,
                [this.statsStorageKey]: this.stats,
                [currentCategoryStorageKey]: this.currentCategoryData
            });
            
            this.lastSaveTime = currentTime;
            
            // Log save status
            console.log(`💾 State saved (${this.scrapedData.length} total channels, ${this.currentCategoryData.length} in current category)`);
            
        } catch (error) {
            console.error('Error in force save:', error);
        }
    }
      async loadSavedState() {
        try {
            console.log('📁 Loading saved state...');
            
            // Prepare keys to load
            let keysToLoad = [
                this.stateStorageKey,
                this.dataStorageKey,
                this.statsStorageKey,
                this.progressStorageKey,
                `${this.stateStorageKey}_backup`
            ];
            
            // Add all potential category data keys
            for (let i = 0; i < 50; i++) {
                keysToLoad.push(`tgstat_category_${i}`);
            }
            
            const result = await chrome.storage.local.get(keysToLoad);
            
            // Load primary state or backup
            let savedState = result[this.stateStorageKey] || result[`${this.stateStorageKey}_backup`];
            let savedProgress = result[this.progressStorageKey];
            
            if (savedState) {
                console.log('📈 Restoring saved state from:', new Date(savedState.timestamp).toISOString());
                
                // Restore state
                this.stats = savedState.stats || this.stats;
                this.categoryProgress = savedState.categoryProgress || this.categoryProgress;
                this.processedUrls = new Set(savedState.processedUrls || []);
                this.existingIds = new Set(savedState.existingIds || []);
                this.autoMode = savedState.autoMode || false;
                
                if (savedState.scrapedData) {
                    this.scrapedData = savedState.scrapedData;
                }
            }
            
            // If we have saved progress, restore more detailed state
            if (savedProgress) {
                this.currentCategoryIndex = savedProgress.currentCategoryIndex || 0;
                this.currentCategory = savedProgress.currentCategory || this.categories[this.currentCategoryIndex];
                
                // Load current category data
                const currentCategoryStorageKey = `tgstat_category_${this.currentCategoryIndex}`;
                if (result[currentCategoryStorageKey]) {
                    this.currentCategoryData = result[currentCategoryStorageKey];
                    console.log(`📊 Loaded ${this.currentCategoryData.length} channels for current category: ${this.currentCategory?.name || 'Unknown'}`);
                }
            }
            
            // Load overall data
            if (result[this.dataStorageKey]) {
                this.scrapedData = result[this.dataStorageKey];
                console.log(`📊 Loaded ${this.scrapedData.length} total channels across all categories`);
            }
            
            // Load progress
            if (result[this.progressStorageKey]) {
                const progress = result[this.progressStorageKey];
                this.stats = { ...this.stats, ...progress.stats };
                this.categoryProgress = { ...this.categoryProgress, ...progress.categoryProgress };
            }
            
            console.log('✅ State loading completed');
            
        } catch (error) {
            console.error('❌ Error loading saved state:', error);
        }
    }
    
    async startScraping(existingData = [], autoMode = false) {
        if (this.isRunning) {
            console.log('⚠️ Scraping already running');
            return;
        }
        
        console.log('🚀 Starting enhanced scraping...');
        this.isRunning = true;
        this.autoMode = autoMode;
        
        try {
            // Notify background script
            chrome.runtime.sendMessage({
                type: 'START_SCRAPING',
                data: {
                    currentUrl: window.location.href,
                    stats: this.stats,
                    categoryProgress: this.categoryProgress,
                    autoMode: this.autoMode
                }
            }).catch(() => {
                console.log('Background script not responding');
            });
            
            // Initialize form data
            this.initializeFormData();
            
            // Start scraping process
            await this.scrapeAllChannels();
            
        } catch (error) {
            console.error('❌ Error starting scraping:', error);
            this.sendUpdate({
                status: 'error',
                message: error.message
            });
        }
    }
    
    async stopScraping() {
        console.log('🛑 Stopping scraping...');
        this.isRunning = false;
        
        // Force save before stopping
        await this.emergencySave();
        
        // Notify background script
        try {
            chrome.runtime.sendMessage({
                type: 'STOP_SCRAPING'
            }).catch(() => {
                console.log('Background script not responding');
            });
        } catch (error) {
            console.error('Error notifying background of stop:', error);
        }
        
        this.sendUpdate({
            status: 'completed',
            message: `Scraping stopped. Total channels: ${this.stats.channelCount}`,
            stats: this.stats
        });
    }
      async scrapeAllChannels() {
        let hasMorePages = true;
        let retryCount = 0;
        let pageStartTime = Date.now();
        let lastProcessedPage = 0; // Track which page we last processed

        // Add debugging to detect page skips
        console.log(`🔍 SCRAPING DEBUG: Starting at page ${this.stats.currentPage}`);
        
        while (hasMorePages && this.isRunning) {
            try {
                // CRITICAL FIX: Detect page skipping and force correct page processing
                if (lastProcessedPage > 0 && this.stats.currentPage > lastProcessedPage + 1) {
                    console.log(`❌ PAGE SKIP DETECTED! From ${lastProcessedPage} to ${this.stats.currentPage}`);
                    console.log(`🔧 FIXING: Setting current page back to ${lastProcessedPage + 1}`);
                    this.stats.currentPage = lastProcessedPage + 1;
                }

                // Store current page for skip detection
                lastProcessedPage = this.stats.currentPage;
                
                console.log(`📄 Processing page ${this.stats.currentPage}...`);
                
                // Update status with more detail
                this.sendUpdate({
                    status: 'scraping',
                    message: `Processing page ${this.stats.currentPage} - ${this.categoryProgress.currentCategoryName || 'Unknown'}`,
                    stats: this.stats,
                    categoryProgress: this.categoryProgress,
                    // Add more details about page processing
                    progressDetails: {
                        pageStart: pageStartTime,
                        currentTime: Date.now(),
                        elapsedTime: Date.now() - pageStartTime,
                        retryCount: retryCount
                    }
                });
                
                // SPEED OPTIMIZATION: Only wait minimal time between page processing
                if (Date.now() - pageStartTime < 300) {
                    const cooldownTime = 300 - (Date.now() - pageStartTime);
                    if (cooldownTime > 0) {
                        await this.delay(cooldownTime);
                    }
                }
                
                // Reset page timer
                pageStartTime = Date.now();
                
                // Scrape current page with detailed timing
                console.time(`Page ${this.stats.currentPage} scraping`);
                const startTime = Date.now();
                const newChannels = await this.scrapeCurrentPage();
                const processingTime = Date.now() - startTime;
                console.timeEnd(`Page ${this.stats.currentPage} scraping`);
                
                if (newChannels && newChannels.length > 0) {
                    console.log(`✅ Found ${newChannels.length} new channels on page ${this.stats.currentPage}`);
                    
                    // Add to data queue for processing
                    this.dataQueue.push(...newChannels);
                    
                    // Update stats
                    this.stats.channelCount += newChannels.length;
                    this.consecutiveEmptyPages = 0;
                    retryCount = 0;
                    
                    // Update performance metrics
                    this.updatePerformanceMetrics(processingTime);
                    
                    // Force save
                    await this.forceSave();
                    
                    // Check for auto-save
                    await this.checkAutoSave();
                      } else {
                    console.log(`⚠️ No new channels found on page ${this.stats.currentPage}`);
                    this.consecutiveEmptyPages++;
                    
                    if (this.consecutiveEmptyPages >= this.maxEmptyPages) {
                        if (this.autoMode) {
                            console.log('🔄 Moving to next category...');
                            
                            // Make sure to save and download current category data first
                            await this.forceSave();
                            
                            // If we have data for this category, download it
                            if (this.currentCategoryData && this.currentCategoryData.length > 0) {
                                try {
                                    console.log(`📦 Downloading data for completed category: ${this.categoryProgress.currentCategoryName}`);
                                    await this.downloadCategoryData(this.categoryProgress.currentCategoryName);
                                } catch (downloadError) {
                                    console.error('Error downloading category data:', downloadError);
                                }
                            }
                            
                            await this.moveToNextCategory();
                            return;
                        } else {
                            console.log('🛑 No more data found, stopping...');
                            hasMorePages = false;
                            break;
                        }
                    }
                }
                
                // Try to load more with enhanced retry mechanism
                let loadMoreSuccess = false;
                let loadMoreRetries = 0;
                const maxLoadMoreRetries = 5;
                
                while (!loadMoreSuccess && loadMoreRetries < maxLoadMoreRetries) {
                    try {
                        loadMoreSuccess = await this.loadMoreWithRetry();
                        if (!loadMoreSuccess && loadMoreRetries < maxLoadMoreRetries - 1) {
                            loadMoreRetries++;
                            console.log(`⚠️ Failed to load more, retrying (${loadMoreRetries}/${maxLoadMoreRetries})...`);
                            await new Promise(resolve => setTimeout(resolve, 3000));
                        }
                    } catch (loadError) {
                        loadMoreRetries++;
                        console.error(`Load more error, retrying (${loadMoreRetries}/${maxLoadMoreRetries}):`, loadError);
                        await new Promise(resolve => setTimeout(resolve, 3000));
                    }
                }
                
                hasMorePages = loadMoreSuccess;
                
                if (!loadMoreSuccess && this.autoMode) {
                    console.log('⚠️ Could not load more content after maximum retries, moving to next category');
                    await this.moveToNextCategory();
                    return;
                }
                
                // Clean up memory periodically
                if (this.stats.currentPage % 10 === 0) {
                    this.cleanupMemory();
                }
                
            } catch (error) {
                console.error('❌ Error in scraping cycle:', error);
                retryCount++;
                
                if (retryCount <= 3) {
                    console.log(`🔄 Retrying after error (${retryCount}/3)...`);
                    await new Promise(resolve => setTimeout(resolve, 5000));
                } else {
                    console.log('❌ Maximum retries reached, moving to next category');
                    await this.moveToNextCategory();
                    retryCount = 0;
                    return;
                }
                retryCount++;
                
                if (retryCount >= this.maxRetries) {
                    if (this.autoMode) {
                        console.log('🔄 Max retries reached, moving to next category...');
                        await this.moveToNextCategory();
                        return;
                    } else {
                        console.log('🛑 Max retries reached, stopping...');
                        hasMorePages = false;
                        break;
                    }
                }
                
                console.log(`🔄 Retrying... (${retryCount}/${this.maxRetries})`);
                await this.delay(this.retryDelay);
            }
        }
        
        console.log('✅ Scraping completed');
        await this.emergencySave();
    }
      async scrapeCurrentPage() {
        const channels = [];
        let retryCount = 0;
        const maxRetries = 5;
        
        while (retryCount <= maxRetries) {
            try {
                // Find channel cards using multiple selectors
                const cardSelectors = [
                    '.peer-item-box',
                    '.card.card-body.peer-item-box',
                    '.col-12.col-sm-6.col-md-4 .card',
                    '.card',
                    '.item-box'
                ];
                
                let cards = [];
                for (const selector of cardSelectors) {
                    cards = document.querySelectorAll(selector);
                    if (cards.length > 0) {
                        console.log(`📱 Found ${cards.length} items using selector: ${selector}`);
                        break;
                    }
                }
                
                if (cards.length === 0) {
                    // If no cards found, check if we need to retry
                    if (retryCount < maxRetries) {
                        retryCount++;
                        console.log(`⚠️ No cards found on current page, retrying (${retryCount}/${maxRetries})...`);
                        
                        // Check if the page might be loading slowly
                        console.log('🔄 Waiting for page content to load...');
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        continue;
                    } else {
                        console.log('⚠️ No cards found after maximum retries');
                        return channels;
                    }
                }
                
                // Cards found, break out of retry loop
                break;
                
            } catch (error) {
                if (retryCount < maxRetries) {
                    retryCount++;
                    console.error(`🔄 Error scraping page, retrying (${retryCount}/${maxRetries}):`, error);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                } else {
                    console.error('❌ Failed to scrape page after maximum retries:', error);
                    return channels;
                }
            }
        }
        
        // Get cards one final time (after retry loop)
        let cards = [];
        for (const selector of ['.peer-item-box', '.card', '.item-box']) {
            cards = document.querySelectorAll(selector);
            if (cards.length > 0) break;
        }
        
        if (cards.length === 0) {
            console.log('⚠️ No cards found on current page after all retries');
            return channels;
        }
        
        // Process cards in fast batches
        const batchSize = 20;
        for (let i = 0; i < cards.length; i += batchSize) {
            if (!this.isRunning) break;
            
            const batch = Array.from(cards).slice(i, i + batchSize);
            
            // Process batch in parallel for speed
            const batchPromises = batch.map(card => this.extractChannelDataFast(card));
            const batchResults = await Promise.all(batchPromises);
            
            // Filter valid results and check for duplicates
            for (const channelData of batchResults) {
                if (channelData && channelData.uniqueId && !this.existingIds.has(channelData.uniqueId)) {
                    channels.push(channelData);
                    this.existingIds.add(channelData.uniqueId);
                    this.processedUrls.add(channelData.url);
                }
            }
            
            // Micro-delay to prevent browser freeze
            await this.delay(10);
        }
        
        return channels;
    }
    
    extractChannelDataFast(card) {
        try {
            const data = {};
            
            // Fast extraction using querySelector
            const nameEl = card.querySelector('.font-16.text-dark.text-truncate, .text-dark.text-truncate, .card-title, h5');
            if (nameEl) data.name = nameEl.textContent.trim();
            
            const descEl = card.querySelector('.font-14.text-muted.line-clamp-2, .text-muted.line-clamp-2, .description, p');
            if (descEl) data.description = descEl.textContent.trim();
            
            const subEl = card.querySelector('b');
            if (subEl) {
                data.subscribersRaw = subEl.textContent.trim();
                data.subscribers = data.subscribersRaw.replace(/[^\d,]/g, '');
            }
            
            const linkEl = card.querySelector('a[href*="tgstat.ru/"], a[href*="/channel"], a[href*="/group"], a');
            if (linkEl && linkEl.href) {
                data.url = linkEl.href;
                const urlParts = data.url.split('/');
                data.channelId = urlParts[urlParts.length - 1];
                data.type = urlParts[urlParts.length - 2] || this.pageType;
            }
            
            const imgEl = card.querySelector('img');
            if (imgEl) {
                data.profileImageUrl = imgEl.src.startsWith('//') ? 'https:' + imgEl.src : imgEl.src;
            }
            
            const timeEl = card.querySelector('.text-center.text-muted.font-12, .time, .date');
            if (timeEl) data.lastPost = timeEl.textContent.trim();
            
            // Generate unique ID and metadata
            data.uniqueId = `${data.type || 'unknown'}_${data.channelId || Date.now()}`;
            data.scrapedAt = new Date().toISOString();
            data.pageNumber = this.stats.currentPage;
            data.sourcePage = window.location.pathname;
            data.pageType = this.pageType;
            
            return data.uniqueId ? data : null;
            
        } catch (error) {
            console.error('Error extracting channel data:', error);
            return null;
        }
    }    async loadMoreWithRetry() {
        let attempts = 0;
        const maxRetries = 15; // Increased to 15 retries per user request (10+)
        let lastApproach = '';
        
        // Start with faster initial attempts
        let retryDelay = 500; // Start with short delay
        
        console.log(`⚙️ Load more with retry - attempting up to ${maxRetries} times`);
        
        while (attempts < maxRetries && this.isRunning) {
            try {
                // Check if we need to ensure we're on the right page
                if (attempts > 0 && !window.location.href.includes(this.currentCategory?.url.split('//')[1])) {
                    console.log('⚠️ Not on the expected category page, attempting to navigate back');
                    try {
                        window.location.href = this.currentCategory.url;
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        continue;
                    } catch (navError) {
                        console.error('Failed to navigate back to category page:', navError);
                    }
                }
                
                // SPEED OPTIMIZATION: Use different approaches based on retry count
                // This ensures we try multiple techniques quickly rather than the same one repeatedly
                let success = false;
                
                if (attempts % 4 === 0) { // Standard approach
                    console.log(`🔄 [Attempt ${attempts+1}/${maxRetries}] Standard load more button click`);
                    lastApproach = 'standard';
                    success = await this.clickLoadMore();
                }
                else if (attempts % 4 === 1) { // AJAX approach
                    console.log(`🔄 [Attempt ${attempts+1}/${maxRetries}] Direct AJAX request`);
                    lastApproach = 'ajax';
                    success = await this.triggerLoadMoreDirect();
                }
                else if (attempts % 4 === 2) { // Custom button approach
                    console.log(`🔄 [Attempt ${attempts+1}/${maxRetries}] Custom button creation`);
                    lastApproach = 'custom';
                    success = await this.createAndClickLoadMore();
                }
                else { // DOM manipulation approach
                    console.log(`🔄 [Attempt ${attempts+1}/${maxRetries}] DOM manipulation`);
                    lastApproach = 'dom';
                    
                    // First scroll to ensure everything is visible
                    window.scrollTo(0, document.body.scrollHeight);
                    await this.delay(300);
                    
                    // Try to modify page/offset inputs directly
                    const pageInputs = document.querySelectorAll('.lm-page, input[name="page"], [data-role="page-input"]');
                    const offsetInputs = document.querySelectorAll('.lm-offset, input[name="offset"], [data-role="offset-input"]');
                    
                    // Update all form inputs
                    let nextPage = this.stats.currentPage + 1;
                    let nextOffset = this.stats.currentPage * 20;
                    
                    pageInputs.forEach(input => {
                        input.value = nextPage.toString();
                    });
                    
                    offsetInputs.forEach(input => {
                        input.value = nextOffset.toString();
                    });
                    
                    // Click any load more button
                    const buttons = document.querySelectorAll('.lm-button, button.load-more, [data-role="load-more"]');
                    let clicked = false;
                    
                    for (const button of buttons) {
                        try {
                            button.click();
                            clicked = true;
                            break;
                        } catch (e) {
                            // Continue trying other buttons
                        }
                    }
                    
                    // If clicked, wait for content
                    if (clicked) {
                        await this.delay(2000);
                        const initialCount = document.querySelectorAll('.peer-item-box, .card').length;
                        success = await this.waitForNewContent(initialCount);
                    } else {
                        success = false;
                    }
                }
                
                if (success) {
                    // Successfully loaded more content
                    this.stats.loadMoreCount++;
                    this.consecutiveEmptyPages = 0;
                    console.log(`✅ Load more successful using approach: ${lastApproach}`);
                    return true;
                }
                
                attempts++;
                
                // Log with progress percentage
                const progressPercent = Math.round((attempts / maxRetries) * 100);
                console.log(`⚠️ Load more attempt ${attempts}/${maxRetries} failed (${progressPercent}%) with approach: ${lastApproach}`);
                
                if (attempts < maxRetries) {
                    // SPEED OPTIMIZATION: Adaptive retry timing
                    // - Start fast (500ms)
                    // - Increase delay gradually up to 2.5s
                    // - Add some random variation to avoid getting stuck in patterns
                    
                    if (attempts < 5) {
                        // Early attempts: fast retries
                        retryDelay = 500 + (attempts * 200) + Math.random() * 300;
                    } else if (attempts < 10) {
                        // Mid attempts: moderate delays
                        retryDelay = 1500 + Math.random() * 1000;
                    } else {
                        // Later attempts: longer delays with more aggressive approaches
                        retryDelay = 2500 + Math.random() * 1000;
                    }
                    
                    console.log(`⏱️ Waiting ${Math.round(retryDelay/1000)} seconds before next attempt...`);
                    await this.delay(retryDelay);
                    
                    // Every third retry, try something more aggressive
                    if (attempts % 3 === 0) {
                        console.log('🔄 Trying page refresh approach...');
                        try {
                            const currentUrl = window.location.href;
                            window.location.reload();
                            await new Promise(resolve => setTimeout(resolve, 4000));
                        } catch (e) {
                            console.error('Page refresh error:', e);
                        }
                    }
                }
                
            } catch (error) {
                console.error(`Error in load more retry (attempt ${attempts+1}/${maxRetries}):`, error);
                attempts++;
                await this.delay(1000 + (attempts * 300));
            }
        }
        
        console.log(`❌ Load more failed after maximum ${maxRetries} retries`);
        return false;
    }    async clickLoadMore() {
        try {
            // Get current DOM items count for later comparison
            const initialItemCount = document.querySelectorAll('.peer-item-box, .card, .card.card-body.peer-item-box').length;
            console.log(`📊 Current items on page: ${initialItemCount}`);
            
            // Debug current page state
            console.log(`🔍 DEBUG: Current page: ${this.stats.currentPage}, Next expected: ${this.stats.currentPage + 1}`);
            
            // Try multiple selectors for the load more button with improved logging
            const loadMoreSelectors = [
                '.lm-button', 
                'button.lm-button', 
                'button[data-role="load-more"]', 
                'button.load-more',
                'a.load-more',
                '.load-more-btn',
                '[data-role="load_more"]',
                'button:contains("Load more")',
                'button:contains("Загрузить еще")',
                '.ajax-btn' // Additional selector
            ];
            
            let loadMoreBtn = null;
            for (const selector of loadMoreSelectors) {
                try {
                    const buttons = document.querySelectorAll(selector);
                    if (buttons.length > 0) {
                        // Prefer visible buttons
                        for (const btn of buttons) {
                            const style = window.getComputedStyle(btn);
                            if (style.display !== 'none' && style.visibility !== 'hidden') {
                                loadMoreBtn = btn;
                                console.log(`🔍 Found visible load more button using selector: ${selector}`);
                                break;
                            }
                        }
                        
                        // If no visible button found, use the first one
                        if (!loadMoreBtn) {
                            loadMoreBtn = buttons[0];
                            console.log(`🔍 Found load more button (might be hidden) using selector: ${selector}`);
                        }
                        break;
                    }
                } catch (selectorError) {
                    console.log(`Selector error for ${selector}:`, selectorError);
                }
            }
            
            if (!loadMoreBtn) {
                console.log('🏁 Load more button not found - attempting alternative methods');
                
                // Method 1: Try to find hidden button and make it visible
                const hiddenButtons = document.querySelectorAll('button.d-none, .btn.d-none, [style*="display: none"]');
                for (const hiddenBtn of hiddenButtons) {
                    const btnText = hiddenBtn.textContent.toLowerCase();
                    if (btnText.includes('load') || 
                        btnText.includes('more') ||
                        btnText.includes('загрузить') ||
                        btnText.includes('еще') ||
                        btnText.includes('далее')) {
                        console.log('🔍 Found hidden button, making it visible');
                        hiddenBtn.classList.remove('d-none');
                        hiddenBtn.style.display = '';
                        hiddenBtn.style.visibility = 'visible';
                        loadMoreBtn = hiddenBtn;
                        break;
                    }
                }
                
                // Method 2: Try direct AJAX request if we have the form
                if (!loadMoreBtn) {
                    const form = document.querySelector('form[data-role="load-more-form"], .load-more-form');
                    if (form) {
                        console.log('🔄 No button found but found form, trying direct AJAX approach');
                        return await this.triggerLoadMoreDirect();
                    }
                }
                
                // Method 3: Try creating our own button
                if (!loadMoreBtn) {
                    return await this.createAndClickLoadMore();
                }
                
                if (!loadMoreBtn) return false;
            }
            
            // Check if already loading
            const loaderSelectors = ['.lm-loader', '.loader', '.spinning', '.loading', '.ajax-loading'];
            let loader = null;
            let isLoading = false;
            
            for (const selector of loaderSelectors) {
                loader = document.querySelector(selector);
                if (loader && !loader.classList.contains('d-none') && 
                   window.getComputedStyle(loader).display !== 'none') {
                    isLoading = true;
                    break;
                }
            }
            
            if (isLoading) {
                console.log('⏳ Already loading, waiting...');
                await this.delay(3000);
                return await this.clickLoadMore();
            }
            
            // Get form fields - try multiple selectors 
            const pageInputSelectors = ['.lm-page', 'input[name="page"]', '[data-role="page-input"]', 'input.page'];
            const offsetInputSelectors = ['.lm-offset', 'input[name="offset"]', '[data-role="offset-input"]', 'input.offset'];
            
            let pageInput = null;
            let offsetInput = null;
            
            for (const selector of pageInputSelectors) {
                pageInput = document.querySelector(selector);
                if (pageInput) break;
            }
            
            for (const selector of offsetInputSelectors) {
                offsetInput = document.querySelector(selector);
                if (offsetInput) break;
            }
            
            // CRITICAL FIX: Always ensure we're going to the next sequential page
            // This fixes the 1, 3, 5, ... skipping issue
            let nextPage = this.stats.currentPage + 1; // Always increment by 1
            let nextOffset = this.stats.currentPage * 20;
            
            console.log(`📤 Loading page ${nextPage}, offset ${nextOffset}`);
            
            // Update form inputs if available BEFORE clicking
            if (pageInput) {
                pageInput.value = nextPage.toString();
                console.log(`📝 Set page input to: ${nextPage}`);
            }
            
            if (offsetInput) {
                offsetInput.value = nextOffset.toString();
                console.log(`📝 Set offset input to: ${nextOffset}`);
            }
            
            // Show loader if available
            if (loader) loader.classList.remove('d-none');
            
            // Execute click with careful error handling
            try {
                console.log('🖱️ Clicking load more button');
                loadMoreBtn.click();
            } catch (clickError) {
                console.error('Click error:', clickError);
                // Try alternative: simulate click
                try {
                    console.log('�️ Simulating click event');
                    const event = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    });
                    loadMoreBtn.dispatchEvent(event);
                } catch (eventError) {
                    console.error('Event simulation error:', eventError);
                    return false;
                }
            }
            
            // Wait for content to load with improved detection
            const success = await this.waitForNewContent(initialItemCount);
            
            if (success) {
                // Update stats - CRITICAL: ensure we're incrementing by 1
                this.stats.currentPage = nextPage;
                this.stats.lastOffset = nextOffset;
                this.stats.loadMoreCount++;
                this.stats.pageCount++;
                this.loadMoreFailureCount = 0;
                
                // Update form for next load (if needed)
                if (pageInput) {
                    // Set it to next+1 for the next operation
                    pageInput.value = (nextPage + 1).toString();
                    console.log(`📝 Updated page input for next load: ${nextPage + 1}`);
                }
                
                if (offsetInput) {
                    offsetInput.value = (nextOffset + 20).toString();
                    console.log(`📝 Updated offset input for next load: ${nextOffset + 20}`);
                }
                
                console.log(`✅ Successfully loaded page ${nextPage}`);
                return true;
            } else {
                console.log(`❌ Failed to load page ${nextPage}`);
                return false;
            }
            
        } catch (error) {
            console.error('Error clicking load more:', error);
            return false;
        }
    }
      async waitForNewContent(initialCount = null) {
        const maxWait = 30000; // 30 seconds max (increased from 20)
        const checkInterval = 200; // Check every 200ms (faster checks)
        let waited = 0;
        
        // Use multiple selectors to find items
        const itemSelectors = [
            '.peer-item-box', 
            '.card.card-body.peer-item-box',
            '.col-12.col-sm-6.col-md-4 .card',
            '.card', 
            '.item-box'
        ];
        
        // Get initial item count
        let lastItemCount = initialCount;
        if (lastItemCount === null) {
            for (const selector of itemSelectors) {
                const items = document.querySelectorAll(selector);
                if (items.length > 0) {
                    lastItemCount = items.length;
                    console.log(`📊 Initial count: ${lastItemCount} items using selector: ${selector}`);
                    break;
                }
            }
        }
        
        // If still null, try a fallback selector
        if (lastItemCount === null) {
            lastItemCount = document.querySelectorAll('div[class*="card"], div[class*="item"]').length;
            console.log(`📊 Initial count (fallback): ${lastItemCount} items`);
        }
        
        console.log(`⏳ Waiting for new content beyond ${lastItemCount} items...`);
        
        // Store the last check time for DOM mutations
        let lastCheckTime = Date.now();
        let contentChangedSince = false;
        
        // Set up mutation observer to detect DOM changes
        const observer = new MutationObserver(() => {
            contentChangedSince = true;
        });
        
        // Watch for changes in the main content area
        const contentArea = document.querySelector('.card-list, .cards-list, .channels-list, .peer-list, .container, main');
        if (contentArea) {
            observer.observe(contentArea, { 
                childList: true, 
                subtree: true,
                attributes: true,
                characterData: true
            });
        }
        
        // Start checking for new content
        while (waited < maxWait && this.isRunning) {
            // Check multiple loading indicators
            let isLoading = false;
            const loaderSelectors = ['.lm-loader', '.loader', '.spinning', '.loading', '.ajax-loading'];
            
            for (const selector of loaderSelectors) {
                const loader = document.querySelector(selector);
                if (loader && !loader.classList.contains('d-none') && 
                   window.getComputedStyle(loader).display !== 'none') {
                    isLoading = true;
                    break;
                }
            }
            
            // If not loading or waited > 3 seconds, check for new content
            if (!isLoading || waited > 3000) {
                // Check if DOM has changed since last check
                if (contentChangedSince) {
                    console.log('📝 DOM changes detected, checking content...');
                }
                
                // Reset the flag
                contentChangedSince = false;
                
                // Try multiple selectors to find new items
                let currentItemCount = 0;
                let usedSelector = '';
                
                for (const selector of itemSelectors) {
                    const items = document.querySelectorAll(selector);
                    if (items.length > 0) {
                        currentItemCount = items.length;
                        usedSelector = selector;
                        break;
                    }
                }
                
                // If no items found with standard selectors, try fallback
                if (currentItemCount === 0) {
                    currentItemCount = document.querySelectorAll('div[class*="card"], div[class*="item"]').length;
                    usedSelector = 'fallback';
                }
                
                // Compare with last count
                if (currentItemCount > lastItemCount) {
                    console.log(`📈 New content loaded: ${currentItemCount - lastItemCount} items (using ${usedSelector})`);
                    observer.disconnect(); // Clean up observer
                    return true;
                } else if (waited > 10000 && !isLoading) { // Give it at least 10 seconds
                    console.log(`📭 No new content found after ${waited}ms (still at ${currentItemCount} items)`);
                    observer.disconnect(); // Clean up observer
                    return false;
                }
                
                // Log current status every 5 seconds
                if (Date.now() - lastCheckTime > 5000) {
                    console.log(`⏳ Still waiting... Current: ${currentItemCount}, Original: ${lastItemCount}, Time: ${waited/1000}s`);
                    lastCheckTime = Date.now();
                    
                    // Try scrolling to trigger lazy loading
                    if (waited > 5000) {
                        window.scrollTo(0, document.body.scrollHeight);
                        await this.delay(300);
                        window.scrollTo(0, document.body.scrollHeight - 500);
                    }
                }
            }
            
            await this.delay(checkInterval);
            waited += checkInterval;
        }
        
        observer.disconnect(); // Clean up observer
        console.log(`⏰ Timeout after ${maxWait/1000}s waiting for new content`);
        return false;
    }
      async processDataQueue() {
        if (this.dataQueue.length === 0) return;
        
        try {
            const processStart = Date.now();
            const itemsToProcess = this.dataQueue.splice(0, this.chunkSize);
            
            // Add data to current category collection
            this.currentCategoryData.push(...itemsToProcess);
            
            // Update category stats
            this.categoryProgress.categoryDataCount = this.currentCategoryData.length;
            
            // Send data to background for processing
            chrome.runtime.sendMessage({
                type: 'QUEUE_DATA',
                data: itemsToProcess
            }).catch(() => {
                // If background fails, save locally
                this.scrapedData.push(...itemsToProcess);
            });
            
            console.log(`📦 Processed ${itemsToProcess.length} items from queue in ${Date.now() - processStart}ms (Category Total: ${this.currentCategoryData.length})`);
            
        } catch (error) {
            console.error('Error processing data queue:', error);
        }
    }
    
    async checkAutoSave() {
        if (this.stats.channelCount - this.stats.lastSaveCount >= this.autoSaveThreshold) {
            try {
                console.log('💾 Auto-save triggered');
                
                // Get current data
                const result = await chrome.storage.local.get([this.dataStorageKey]);
                const data = result[this.dataStorageKey] || this.scrapedData;
                
                if (data.length > 0) {
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const categoryName = this.getCurrentCategoryName();
                    const filename = `tgstat_${categoryName}_${timestamp}_${data.length}items.json`;
                    
                    // Download via background script
                    const downloadResult = await new Promise((resolve) => {
                        chrome.runtime.sendMessage({
                            type: 'DOWNLOAD_DATA',
                            data: { data: data, filename: filename }
                        }, resolve);
                    });
                    
                    if (downloadResult && downloadResult.success) {
                        this.stats.lastSaveCount = this.stats.channelCount;
                        
                        this.sendUpdate({
                            status: 'autosave',
                            message: `✅ Auto-saved ${data.length} channels to ${filename}`,
                            stats: this.stats
                        });
                        
                        console.log(`✅ Auto-save completed: ${data.length} items`);
                    }
                }
                
            } catch (error) {
                console.error('❌ Auto-save failed:', error);
            }
        }
    }
    
    updatePerformanceMetrics(processingTime) {
        this.stats.totalProcessingTime += processingTime;
        this.stats.averagePageTime = this.stats.totalProcessingTime / this.stats.currentPage;
    }
    
    cleanupMemory() {
        try {
            // Clean DOM elements that are not visible
            const cards = document.querySelectorAll('.peer-item-box');
            let removedCount = 0;
            
            cards.forEach((card, index) => {
                if (index < cards.length - 100) { // Keep last 100 items visible
                    const rect = card.getBoundingClientRect();
                    if (rect.bottom < 0 || rect.top > window.innerHeight) {
                        card.remove();
                        removedCount++;
                    }
                }
            });
            
            // Limit processed URLs size
            if (this.processedUrls.size > 50000) {
                const urlsArray = Array.from(this.processedUrls);
                this.processedUrls = new Set(urlsArray.slice(-25000));
            }
            
            // Limit existing IDs size  
            if (this.existingIds.size > 50000) {
                const idsArray = Array.from(this.existingIds);
                this.existingIds = new Set(idsArray.slice(-25000));
            }
            
            if (removedCount > 0) {
                console.log(`🧹 Cleaned up ${removedCount} DOM elements`);
            }
            
        } catch (error) {
            console.error('Error in memory cleanup:', error);
        }
    }
      async moveToNextCategory() {
        try {
            // First, save and download current category data if we have any
            if (this.currentCategoryIndex >= 0 && this.currentCategory && this.currentCategoryData.length > 0) {
                const completedCategory = this.categories[this.currentCategoryIndex];
                console.log(`📦 Category completed: ${completedCategory.name} with ${this.currentCategoryData.length} channels`);
                
                // Send message to background script to download the category data
                await this.downloadCategoryData(completedCategory.name);
                
                // Add current category data to overall data
                this.scrapedData = this.scrapedData.concat(this.currentCategoryData);
                
                // Clear current category data after downloading
                this.currentCategoryData = [];
            }
            
            // Now proceed to the next category
            this.currentCategoryIndex++;
            
            // Check if all categories are completed
            if (this.currentCategoryIndex >= this.categories.length) {
                console.log('🎉 All categories completed!');
                this.sendUpdate({
                    status: 'completed',
                    message: 'All categories scraped successfully!',
                    stats: this.stats
                });
                this.isRunning = false;
                return;
            }
            
            // Set up next category
            const nextCategory = this.categories[this.currentCategoryIndex];
            this.currentCategory = nextCategory;
            
            // Update category progress
            this.categoryProgress.currentCategoryIndex = this.currentCategoryIndex;
            this.categoryProgress.currentCategoryName = nextCategory.name;
            this.categoryProgress.currentCategoryUrl = nextCategory.url;
            this.categoryProgress.totalCategoriesCompleted++;
            this.categoryProgress.categoryDataCount = 0;
            this.categoryProgress.categoryStartTime = Date.now();
            
            // Reset page stats for new category
            this.stats.currentPage = 1;
            this.stats.loadMoreCount = 0;
            this.stats.pageCount = 1;
            this.stats.lastOffset = 0;
            this.consecutiveEmptyPages = 0;
            
            await this.forceSave();
            
            // Add retry mechanism for navigation
            let retryCount = 0;
            const maxRetries = 5;
            
            const attemptCategoryNavigation = async () => {
                try {
                    console.log(`🔄 Moving to category: ${nextCategory.name} (${this.currentCategoryIndex + 1}/${this.categories.length})`);
                    
                    this.sendUpdate({
                        status: 'category_change',
                        message: `Moving to category: ${nextCategory.name} (${this.currentCategoryIndex + 1}/${this.categories.length})`,
                        stats: this.stats,
                        categoryProgress: this.categoryProgress
                    });
                    
                    // Navigate to new category
                    window.location.href = nextCategory.url;
                    
                    // Set a timeout to check if navigation was successful
                    setTimeout(() => {
                        if (!window.location.href.includes(nextCategory.url.split('//')[1])) {
                            if (retryCount < maxRetries) {
                                retryCount++;
                                console.log(`⚠️ Navigation failed, retrying... (${retryCount}/${maxRetries})`);
                                attemptCategoryNavigation();
                            } else {
                                console.error('❌ Failed to navigate to next category after maximum retries');
                                // Try a different approach - create an anchor and click it
                                const a = document.createElement('a');
                                a.href = nextCategory.url;
                                a.target = '_self';
                                document.body.appendChild(a);
                                a.click();
                            }
                        }
                    }, 5000);
                } catch (err) {
                    console.error('Error in navigation attempt:', err);
                    if (retryCount < maxRetries) {
                        retryCount++;
                        console.log(`⚠️ Navigation error, retrying... (${retryCount}/${maxRetries})`);
                        setTimeout(attemptCategoryNavigation, 2000);
                    }
                }
            };
            
            // Start navigation process
            await attemptCategoryNavigation();
            
        } catch (error) {
            console.error('Error moving to next category:', error);
            // Last resort - if all else fails, try again after a delay
            setTimeout(() => this.moveToNextCategory(), 10000);
        }
    }
    
    getCurrentCategoryName() {
        if (this.categoryProgress.currentCategoryName) {
            return this.categoryProgress.currentCategoryName.replace(/[^a-zA-Z0-9]/g, '_');
        }
        return this.pageType || 'unknown';
    }
    
    getPageType() {
        const path = window.location.pathname;
        return path.split('/')[1] || 'main';
    }
    
    initializeFormData() {
        try {
            const form = document.querySelector('#category-list-form');
            if (form) {
                this.formData = new FormData(form);
                
                const nextPage = this.stats.currentPage + 1;
                const nextOffset = this.stats.lastOffset + 20;
                
                this.formData.set('page', nextPage.toString());
                this.formData.set('offset', nextOffset.toString());
                
                console.log(`📝 Form initialized for page ${nextPage}, offset ${nextOffset}`);
            }
        } catch (error) {
            console.error('Error initializing form data:', error);
        }
    }
    
    async navigateToCategory(categoryIndex) {
        try {
            if (categoryIndex >= 0 && categoryIndex < this.categories.length) {
                const category = this.categories[categoryIndex];
                this.currentCategoryIndex = categoryIndex;
                this.currentCategory = category;
                
                this.categoryProgress.currentCategoryIndex = categoryIndex;
                this.categoryProgress.currentCategoryName = category.name;
                this.categoryProgress.currentCategoryUrl = category.url;
                
                await this.forceSave();
                
                window.location.href = category.url;
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error navigating to category:', error);
            return false;
        }
    }
    
    async setStartPage(startPage) {
        try {
            if (!startPage || startPage < 1 || startPage > 999) {
                return false;
            }
            
            // Stop current scraping
            if (this.isRunning) {
                this.isRunning = false;
            }
            
            // Update stats
            this.stats.currentPage = startPage;
            this.stats.loadMoreCount = startPage - 1;
            this.stats.pageCount = startPage;
            this.stats.lastOffset = (startPage - 1) * 20;
            
            // Update form fields
            const pageInput = document.querySelector('.lm-page');
            const offsetInput = document.querySelector('.lm-offset');
            
            if (pageInput) pageInput.value = (startPage + 1).toString();
            if (offsetInput) offsetInput.value = (this.stats.lastOffset + 20).toString();
            
            await this.forceSave();
            
            this.sendUpdate({
                status: 'info',
                message: `Start page set to ${startPage}. Ready to continue.`,
                stats: this.stats
            });
            
            return true;
            
        } catch (error) {
            console.error('Error setting start page:', error);
            return false;
        }
    }
    
    async resetProgress() {
        try {
            console.log('🚨 Resetting all progress...');
            
            // Reset all state
            this.stats = {
                channelCount: 0,
                loadMoreCount: 0,
                pageCount: 1,
                currentPage: 1,
                lastOffset: 0,
                lastSaveCount: 0,
                lastSuccessfulPage: 1,
                lastSuccessfulOffset: 0,
                sessionsCompleted: 0,
                totalProcessingTime: 0,
                averagePageTime: 0
            };
            
            this.scrapedData = [];
            this.existingIds = new Set();
            this.processedUrls = new Set();
            this.dataQueue = [];
            this.consecutiveEmptyPages = 0;
            
            // Reset category progress
            this.categoryProgress = {
                currentCategoryIndex: 0,
                currentCategoryName: '',
                currentCategoryUrl: '',
                categoryStartTime: null,
                categoryDataCount: 0,
                totalCategoriesCompleted: 0
            };
            
            // Clear storage
            await chrome.storage.local.clear();
            
            console.log('✅ Complete reset finished');
            return true;
            
        } catch (error) {
            console.error('❌ Error during reset:', error);
            return false;
        }
    }
    
    async restoreScrapingState(state) {
        try {
            console.log('🔄 Restoring scraping state from background...');
            
            if (state) {
                this.autoMode = state.autoMode || false;
                this.stats = { ...this.stats, ...state.stats };
                this.categoryProgress = { ...this.categoryProgress, ...state.categoryProgress };
                
                // Resume scraping if it was active
                if (state.isRunning) {
                    this.isRunning = true;
                    setTimeout(() => {
                        this.scrapeAllChannels();
                    }, 2000);
                }
            }
            
        } catch (error) {
            console.error('Error restoring scraping state:', error);
        }
    }
    
    sendUpdate(data) {
        try {
            chrome.runtime.sendMessage({
                type: 'SCRAPER_UPDATE',
                data: {
                    ...data,
                    timestamp: Date.now()
                }
            }).catch(() => {
                console.log('Background script not responding to update');
            });
        } catch (error) {
            console.error('Error sending update:', error);
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    async downloadCategoryData(categoryName) {
        try {
            if (this.currentCategoryData.length === 0) {
                console.log('⚠️ No data to download for this category');
                return false;
            }

            const safeCategory = categoryName.replace(/[^a-zA-Z0-9]/g, '_');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            
            // Download JSON format
            await chrome.runtime.sendMessage({
                action: 'downloadCategoryData',
                data: {
                    data: this.currentCategoryData,
                    filename: `tgstat_${safeCategory}_${timestamp}.json`,
                    format: 'json'
                }
            });
            
            // Download CSV format
            await chrome.runtime.sendMessage({
                action: 'downloadCategoryData',
                data: {
                    data: this.currentCategoryData,
                    filename: `tgstat_${safeCategory}_${timestamp}.csv`,
                    format: 'csv'
                }
            });
            
            console.log(`✅ Downloaded ${this.currentCategoryData.length} channels for category: ${categoryName}`);
            
            this.sendUpdate({
                status: 'category_download',
                message: `Downloaded ${this.currentCategoryData.length} channels for category: ${categoryName}`,
                categoryName: categoryName,
                itemCount: this.currentCategoryData.length
            });
            
            return true;
        } catch (error) {
            console.error('Error downloading category data:', error);
            return false;
        }
    }
    
    // Try direct AJAX approach to load more content
    async triggerLoadMoreDirect() {
        try {
            console.log('🔄 Attempting direct AJAX load more');
            
            // Find the form and get its data
            const form = document.querySelector('form[data-role="load-more-form"], .load-more-form');
            
            if (!form) {
                console.log('❌ No load-more form found');
                return false;
            }
            
            // Get the form action URL
            const url = form.action || window.location.href;
            
            // Create form data
            const formData = new FormData(form);
            
            // Ensure we're going to the next sequential page
            const nextPage = this.stats.currentPage + 1;
            const nextOffset = this.stats.currentPage * 20;
            
            // Update form data
            formData.set('page', nextPage.toString());
            formData.set('offset', nextOffset.toString());
            
            console.log(`📝 Form initialized for page ${nextPage}, offset ${nextOffset}`);
            
            // Convert FormData to URL-encoded string
            const data = [...formData.entries()]
                .map(x => `${encodeURIComponent(x[0])}=${encodeURIComponent(x[1])}`)
                .join('&');
            
            // Show loader if available
            const loader = document.querySelector('.lm-loader, .loader, .spinning, .loading');
            if (loader) loader.classList.remove('d-none');
            
            // Get initial item count
            const initialItemCount = document.querySelectorAll('.peer-item-box, .card, .card.card-body.peer-item-box').length;
            
            // Make AJAX request
            console.log(`🌐 Making AJAX request to: ${url}`);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: data
            });
            
            if (!response.ok) {
                console.error(`❌ AJAX error: ${response.status} ${response.statusText}`);
                return false;
            }
            
            // Try to process the response differently based on content type
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                // Handle JSON response
                const json = await response.json();
                
                if (json.html) {
                    // Create a temporary div to hold the new content
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = json.html;
                    
                    // Find the container to append to
                    const container = document.querySelector('.card-list, .cards-list, .channels-list, .peer-list');
                    
                    if (container) {
                        // Append new items
                        container.appendChild(tempDiv);
                        
                        // Update stats
                        this.stats.currentPage = nextPage;
                        this.stats.lastOffset = nextOffset;
                        this.stats.loadMoreCount++;
                        this.stats.pageCount++;
                        
                        console.log(`✅ Successfully loaded page ${nextPage} via AJAX JSON`);
                        return true;
                    }
                }
            } else {
                // Handle HTML response
                const html = await response.text();
                
                // Create a temporary div to hold the new content
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                
                // Find new items in the response
                const newItems = tempDiv.querySelectorAll('.peer-item-box, .card, .card.card-body.peer-item-box');
                
                if (newItems.length > 0) {
                    // Find the container to append to
                    const container = document.querySelector('.card-list, .cards-list, .channels-list, .peer-list');
                    
                    if (container) {
                        // Append each new item
                        newItems.forEach(item => {
                            container.appendChild(item);
                        });
                        
                        // Update stats
                        this.stats.currentPage = nextPage;
                        this.stats.lastOffset = nextOffset;
                        this.stats.loadMoreCount++;
                        this.stats.pageCount++;
                        
                        console.log(`✅ Successfully loaded page ${nextPage} via AJAX HTML`);
                        return true;
                    }
                }
            }
            
            // Check if new content loaded
            await this.delay(2000);
            const currentItemCount = document.querySelectorAll('.peer-item-box, .card, .card.card-body.peer-item-box').length;
            
            if (currentItemCount > initialItemCount) {
                // Update stats
                this.stats.currentPage = nextPage;
                this.stats.lastOffset = nextOffset;
                this.stats.loadMoreCount++;
                this.stats.pageCount++;
                
                console.log(`✅ Successfully loaded page ${nextPage} (detected by item count)`);
                return true;
            }
            
            console.log('❌ Direct AJAX request failed to load new content');
            return false;
            
        } catch (error) {
            console.error('Error in direct AJAX approach:', error);
            return false;
        }
    }
    
    // Create and click our own load more button
    async createAndClickLoadMore() {
        try {
            console.log('🔧 Creating custom load more button');
            
            // Find the form container
            const formContainer = document.querySelector('.lm-form-container, .load-more-container');
            
            if (!formContainer) {
                console.log('❌ No form container found for custom button');
                return false;
            }
            
            // Create a new button
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn btn-primary custom-load-more';
            button.textContent = 'Load More';
            button.dataset.page = (this.stats.currentPage + 1).toString();
            button.dataset.offset = (this.stats.currentPage * 20).toString();
            
            // Add it to the page
            formContainer.appendChild(button);
            
            // Get initial item count
            const initialItemCount = document.querySelectorAll('.peer-item-box, .card, .card.card-body.peer-item-box').length;
            
            // Click the button
            button.click();
            
            // Wait for content to load
            await this.delay(3000);
            
            // Check if new content loaded
            const currentItemCount = document.querySelectorAll('.peer-item-box, .card, .card.card-body.peer-item-box').length;
            
            if (currentItemCount > initialItemCount) {
                // Update stats
                this.stats.currentPage = this.stats.currentPage + 1;
                this.stats.loadMoreCount++;
                this.stats.pageCount++;
                
                console.log(`✅ Successfully loaded page ${this.stats.currentPage} with custom button`);
                return true;
            }
            
            // Remove the custom button to avoid confusion
            button.remove();
            
            console.log('❌ Custom button approach failed');
            return false;
            
        } catch (error) {
            console.error('Error creating custom load more button:', error);
            return false;
        }
    }
}

// Initialize enhanced scraper
console.log('🚀 TGStat Scraper Pro starting...');

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.tgstatScraperPro = new TGStatScraperPro();
    });
} else {
    window.tgstatScraperPro = new TGStatScraperPro();
}

// Global access for debugging
window.debugTGStatPro = () => {
    if (window.tgstatScraperPro) {
        console.log('🔍 TGStat Scraper Pro State:', {
            isRunning: window.tgstatScraperPro.isRunning,
            stats: window.tgstatScraperPro.stats,
            categoryProgress: window.tgstatScraperPro.categoryProgress,
            dataQueueSize: window.tgstatScraperPro.dataQueue.length,
            scrapedDataSize: window.tgstatScraperPro.scrapedData.length,
            existingIdsSize: window.tgstatScraperPro.existingIds.size,
            processedUrlsSize: window.tgstatScraperPro.processedUrls.size
        });
    }
};

console.log('✅ TGStat Scraper Pro initialized. Use debugTGStatPro() for state inspection.');

class TGStatScraper {
    constructor() {
        this.isRunning = false;
        this.scrapedData = [];
        this.stats = {
            channelCount: 0,
            loadMoreCount: 0,
            pageCount: 0,
            currentPage: 1,
            lastOffset: 0,
            lastSaveCount: 0,
            lastSuccessfulPage: 1,
            lastSuccessfulOffset: 0
        };
        
        // Category management
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
        };        this.maxRetries = 3;
        this.retryDelay = 2000;
        this.autoSaveThreshold = 10000; // Download every 10k records
        this.processedUrls = new Set();
        this.existingIds = new Set();
        this.chunkSize = 1000;
        this.cleanupInterval = 10000;
        this.lastCleanup = Date.now();
        this.formData = null;
        this.isResuming = false;
        this.captchaDetected = false;
        this.lastCaptchaTime = 0;
        this.captchaWaitTime = 5 * 60 * 1000; // 5 minutes in milliseconds
        this.consecutiveEmptyPages = 0;
        this.maxEmptyPages = 10; // Increased to 10 for better detection
        this.lastSavedState = null;
        this.saveInterval = 2000; // Save every 2 seconds during active scraping
        this.lastSaveTime = 0;
        this.offlineQueue = [];
        this.isOffline = false;
        this.batchSize = 20;
        this.processingQueue = [];
        this.maxQueueSize = 50000;
        
        // Enhanced error handling and retry system
        this.networkErrorCount = 0;
        this.maxNetworkErrors = 3;
        this.lastNetworkError = 0;
        this.networkRetryDelay = 5 * 60 * 1000; // 5 minutes
        this.loadMoreFailureCount = 0;
        this.maxLoadMoreFailures = 10; // Increased to 10 retries before giving up
        this.noDataRetryCount = 0;
        this.maxNoDataRetries = 15; // Retry 15 times if no data loads
        
        // Smart retry and reload system
        this.smartRetryCount = 0;
        this.maxSmartRetries = 15; // Total retry attempts
        this.pageReloadCount = 0;
        this.maxPageReloads = 3; // Maximum page reloads before moving to next category
        this.retryWithReloadAfter = 5; // Reload page after 5 failed retries
        this.isInRetryMode = false;
        this.retryStartTime = null;
        this.lastRetryTime = 0;
        this.progressiveRetryDelays = [2000, 3000, 5000, 8000, 12000]; // Progressive delays
        this.currentRetryDelayIndex = 0;
        this.autoMode = false;
        this.waitingForConfirmation = false;
        this.confirmationTimeout = 30000; // 30 seconds to confirm
        
        // Storage keys
        this.dataStorageKey = 'tgstatData';
        this.statsStorageKey = 'tgstatStats';
        this.progressStorageKey = 'tgstatProgress';
        this.processedUrlsKey = 'tgstatProcessedUrls';
        this.existingIdsKey = 'tgstatExistingIds';
        this.lastSavedStateKey = 'tgstatLastSavedState';
        this.lastSuccessfulPageKey = 'tgstatLastSuccessfulPage';
        this.lastSuccessfulOffsetKey = 'tgstatLastSuccessfulOffset';
        this.formDataKey = 'tgstatFormData';
        this.categoryProgressKey = 'tgstatCategoryProgress';
        this.autoModeKey = 'tgstatAutoMode';        this.initializeMessageListener();
        this.loadSavedProgress();
        this.startPeriodicCleanup();
        this.startPeriodicForceSave(); // Force save every 30 seconds
        this.startUltraFrequentSaving(); // CRITICAL: Save every 2 seconds
        this.startEmergencySaving(); // CRITICAL: Emergency save every 5 seconds
        this.startPageVisibilityProtection(); // CRITICAL: Save when page becomes hidden
        this.initializeFormData();
        this.checkOnlineStatus();
        this.setupConfirmationListener();
        this.setupRefreshProtection(); // Critical: Save state before refresh
    }

    checkOnlineStatus() {
        this.isOffline = !navigator.onLine;
        window.addEventListener('online', () => {
            this.isOffline = false;
            this.processOfflineQueue();
        });
        window.addEventListener('offline', () => {
            this.isOffline = true;
        });
    }    async processOfflineQueue() {
        if (this.offlineQueue.length > 0) {
            console.log(`Processing ${this.offlineQueue.length} items from offline queue`);
            for (const item of this.offlineQueue) {
                await this.processDataInChunks([item]);
            }
            this.offlineQueue = [];
            await this.saveProgress();
        }
    }

    setupRefreshProtection() {
        // Save state before page refresh/unload to ensure no progress is lost
        window.addEventListener('beforeunload', (event) => {
            // Always save current state before any page unload
            const refreshKey = 'tgstat_refresh_in_progress';
            const stateKey = 'tgstat_pre_refresh_state';
            
            // Mark that a refresh is happening
            localStorage.setItem(refreshKey, 'true');
            
            // Save the current state to localStorage for immediate access
            const preRefreshState = {
                autoMode: this.autoMode,
                isRunning: this.isRunning,
                currentCategoryIndex: this.currentCategoryIndex,
                categoryProgress: this.categoryProgress,
                timestamp: Date.now()
            };
            localStorage.setItem(stateKey, JSON.stringify(preRefreshState));
            
            // Force save all data to chrome storage (synchronous as much as possible)
            this.saveProgress(true).catch(error => {
                console.error('Error saving progress before refresh:', error);
            });
            
            console.log('State saved before page unload/refresh');
        });
        
        // Also save on visibility change (when tab is backgrounded)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.saveProgress(true).catch(error => {
                    console.error('Error saving progress on visibility change:', error);
                });
            }
        });
    }initializeMessageListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            switch (message.type) {
                case 'START_SCRAPING':
                    this.startScraping(message.existingData || [], false);
                    sendResponse({ success: true });
                    break;
                case 'START_AUTO_SCRAPING':
                    this.startScraping(message.existingData || [], true);
                    sendResponse({ success: true });
                    break;
                case 'STOP_SCRAPING':
                    this.stopScraping();
                    sendResponse({ success: true });
                    break;
                case 'CHECK_STATUS':
                    sendResponse({ 
                        isRunning: this.isRunning, 
                        autoMode: this.autoMode,
                        categoryProgress: this.categoryProgress
                    });
                    break;
                case 'RESET_PROGRESS':
                    this.resetProgress().then(result => {
                        sendResponse({ success: result });
                    });
                    break;
                case 'GET_CATEGORIES':
                    sendResponse({ categories: this.categories });
                    break;                case 'NAVIGATE_TO_CATEGORY':
                    this.navigateToCategory(message.categoryIndex).then(result => {
                        sendResponse({ success: result });
                    });
                    break;
                case 'SET_START_PAGE':
                    this.setStartPage(message.startPage).then(result => {
                        sendResponse({ success: result });
                    });
                    break;
            }
            return true; // Keep message channel open for async responses
        });
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
                
                await this.saveProgress();
                
                window.location.href = category.url;
                return true;
            }            return false;
        } catch (error) {
            console.error('Error navigating to category:', error);
            return false;
        }
    }

    async setStartPage(startPage) {
        try {
            console.log(`🎯 Setting start page to: ${startPage}`);
            
            // Validate input
            if (!startPage || startPage < 1 || startPage > 999) {
                console.error('Invalid start page:', startPage);
                return false;
            }
            
            // Stop any running scraping
            if (this.isRunning) {
                this.stopScraping();
                console.log('Stopped current scraping before setting start page');
            }
            
            // Update stats to reflect the new start page
            this.stats.currentPage = startPage;
            this.stats.loadMoreCount = startPage - 1; // Page 1 loads automatically, so loadMoreCount = currentPage - 1
            this.stats.pageCount = startPage;
            this.stats.lastOffset = (startPage - 1) * 20; // Each page has 20 items
            this.stats.lastSuccessfulPage = startPage;
            this.stats.lastSuccessfulOffset = this.stats.lastOffset;
            
            console.log('Updated stats for start page:', {
                currentPage: this.stats.currentPage,
                loadMoreCount: this.stats.loadMoreCount,
                pageCount: this.stats.pageCount,
                lastOffset: this.stats.lastOffset
            });
            
            // Update form fields to the correct values
            this.updateFormFields();
            
            // Initialize form data with correct values
            this.initializeFormData();
            
            // Save the new state immediately
            await this.saveProgress(true);
            console.log('💾 Saved new start page state');
            
            // Send update to popup
            this.sendUpdate({
                status: 'info',
                message: `Start page set to ${startPage}. Ready to continue scraping.`,
                stats: this.stats
            });
            
            console.log(`✅ Successfully set start page to ${startPage}`);
            return true;
            
        } catch (error) {
            console.error('Error setting start page:', error);
            return false;
        }
    }initializeFormData() {
        try {
            const form = document.querySelector('#category-list-form');
            if (form) {
                this.formData = new FormData(form);
                // Set form data to the NEXT page to load
                const nextPageToLoad = this.stats.currentPage + 1;
                const nextOffsetToLoad = this.stats.lastOffset + 20;
                
                this.formData.set('page', nextPageToLoad.toString());
                this.formData.set('offset', nextOffsetToLoad.toString());
                
                console.log('Initialized form data - Next page to load:', nextPageToLoad, 'Next offset:', nextOffsetToLoad);
            }
        } catch (error) {
            console.error('Error initializing form data:', error);
        }
    }async loadSavedProgress() {
        try {            const result = await chrome.storage.local.get([
                this.progressStorageKey,
                this.processedUrlsKey,
                this.lastSuccessfulPageKey,
                this.lastSuccessfulOffsetKey,
                this.existingIdsKey,
                this.formDataKey,
                this.lastSavedStateKey,
                `${this.lastSavedStateKey}_backup`, // Load backup too
                this.dataStorageKey,
                this.categoryProgressKey,
                this.autoModeKey
            ]);
            
            // Load category progress
            if (result[this.categoryProgressKey]) {
                this.categoryProgress = result[this.categoryProgressKey];
                this.currentCategoryIndex = this.categoryProgress.currentCategoryIndex || 0;
                this.currentCategory = this.categories[this.currentCategoryIndex];
            }
            
            // Load auto mode state
            if (result[this.autoModeKey]) {
                this.autoMode = result[this.autoModeKey];
            }            if (result[this.lastSavedStateKey] || result[`${this.lastSavedStateKey}_backup`]) {
                // Always prefer primary state over backup, only use backup if primary is missing
                this.lastSavedState = result[this.lastSavedStateKey];
                
                if (!this.lastSavedState && result[`${this.lastSavedStateKey}_backup`]) {
                    console.warn('⚠️ Primary state missing, using backup state');
                    this.lastSavedState = result[`${this.lastSavedStateKey}_backup`];
                }
                
                // Validate timestamp to ensure we're loading recent state and not old data
                const stateAge = Date.now() - (this.lastSavedState.timestamp || 0);
                console.log(`📊 Loading saved state from ${new Date(this.lastSavedState.timestamp).toISOString()}, age: ${Math.round(stateAge/1000)}s`);
                
                // Reject very old state (more than 1 hour old) as it might be stale
                if (stateAge > 3600000) { // 1 hour in milliseconds
                    console.warn(`⚠️ State is ${Math.round(stateAge/60000)} minutes old, might be stale. Using current defaults instead.`);
                    console.log('If this is wrong, you can debug with: window.debugTGStatState()');
                    return;
                }
                  console.log('📈 Original stats before restoration:', JSON.stringify(this.stats, null, 2));
                
                // CRITICAL DEBUG: Show what state we're about to load
                console.log('� STATE LOADING DEBUG:');
                console.log('- State timestamp:', new Date(this.lastSavedState.timestamp).toISOString());
                console.log('- State stats:', JSON.stringify(this.lastSavedState.stats, null, 2));
                console.log('- State reason:', this.lastSavedState.reason || 'unknown');
                
                // Restore stats completely from saved state to prevent double counting
                this.stats = { ...this.lastSavedState.stats };
                this.processedUrls = new Set(this.lastSavedState.processedUrls);
                this.existingIds = new Set(this.lastSavedState.existingIds);
                
                console.log('📈 Stats after restoration:', JSON.stringify(this.stats, null, 2));// Load existing data
                if (result[this.dataStorageKey]) {
                    this.scrapedData = result[this.dataStorageKey];
                    console.log(`Loaded ${this.scrapedData.length} existing channels from storage`);
                    
                    // Validate data consistency
                    if (this.scrapedData.length !== this.stats.channelCount) {
                        console.warn(`Data inconsistency detected! Scraped data: ${this.scrapedData.length}, Channel count: ${this.stats.channelCount}`);
                        console.warn('This may indicate data was cleared during auto-save. Channel count is the authoritative source.');
                        
                        // If we have fewer items in scrapedData than channelCount, 
                        // it means some data was auto-saved and cleared.
                        // We should trust the channelCount as the authoritative number.
                    }
                } else {
                    this.scrapedData = [];
                    console.log('No existing scraped data found in storage');
                }                // State validation: Only fix obvious inconsistencies, never reset major progress
                // Be extremely conservative - trust the saved state unless there's clear corruption
                
                // Basic sanity checks only
                if (this.stats.currentPage < 1) {
                    console.warn(`Invalid currentPage detected: ${this.stats.currentPage}, fixing to 1`);
                    this.stats.currentPage = 1;
                }
                
                if (this.stats.loadMoreCount < 0) {
                    console.warn(`Invalid loadMoreCount detected: ${this.stats.loadMoreCount}, fixing to 0`);
                    this.stats.loadMoreCount = 0;
                }
                
                if (this.stats.pageCount < 0) {
                    console.warn(`Invalid pageCount detected: ${this.stats.pageCount}, fixing to 0`);
                    this.stats.pageCount = 0;
                }
                
                // Only log differences, don't "fix" them automatically as this could reset progress
                const expectedCurrentPage = 1 + this.stats.loadMoreCount;
                if (this.stats.currentPage !== expectedCurrentPage) {
                    console.log(`State variance detected - currentPage: ${this.stats.currentPage}, loadMoreCount: ${this.stats.loadMoreCount}, expected: ${expectedCurrentPage}`);
                    console.log('This is normal during active scraping. Not auto-fixing to preserve progress.');
                }
                
                if (this.stats.pageCount !== this.stats.currentPage) {
                    console.log(`State variance detected - pageCount: ${this.stats.pageCount}, currentPage: ${this.stats.currentPage}`);
                    console.log('This is normal during active scraping. Not auto-fixing to preserve progress.');
                }
                
                console.log('Loaded last saved state:', {
                    page: this.stats.currentPage,
                    offset: this.stats.lastOffset,
                    channels: this.stats.channelCount,
                    loadMoreCount: this.stats.loadMoreCount,
                    pageCount: this.stats.pageCount,
                    lastSuccessfulPage: this.stats.lastSuccessfulPage,
                    loadedChannels: this.scrapedData.length,
                    category: this.categoryProgress.currentCategoryName,
                    categoryIndex: this.currentCategoryIndex,
                    autoMode: this.autoMode
                });
            } else {
                console.log('No saved state found, starting fresh');
            }

            this.updateFormFields();
        } catch (error) {
            console.error('Error loading saved progress:', error);
        }
    }    updateFormFields() {
        try {
            // Update hidden input fields with NEXT page/offset values to load
            const pageInput = document.querySelector('.lm-page');
            const offsetInput = document.querySelector('.lm-offset');
            
            // The form should show the NEXT page to load, not the current page
            const nextPageToLoad = this.stats.currentPage + 1;
            const nextOffsetToLoad = this.stats.lastOffset + 20;
            
            if (pageInput) {
                pageInput.value = nextPageToLoad.toString();
                console.log('Updated page input to next page:', nextPageToLoad);
            }
            if (offsetInput) {
                offsetInput.value = nextOffsetToLoad.toString();
                console.log('Updated offset input to next offset:', nextOffsetToLoad);
            }

            // Update form data to match
            if (this.formData) {
                this.formData.set('page', nextPageToLoad.toString());
                this.formData.set('offset', nextOffsetToLoad.toString());
            }

            console.log('Form fields updated - Next page to load:', nextPageToLoad, 'Next offset:', nextOffsetToLoad);
        } catch (error) {
            console.error('Error updating form fields:', error);
        }
    }    async saveProgress(forceSave = false) {
        try {
            const currentTime = Date.now();
            
            // Only throttle if not forced and within save interval
            if (!forceSave && currentTime - this.lastSaveTime < this.saveInterval) {
                return;
            }

            // First flush any remaining data in the processing queue
            await this.flushProcessingQueue();

            const formDataObj = {};
            if (this.formData) {
                for (let [key, value] of this.formData.entries()) {
                    formDataObj[key] = value;
                }
            }

            const stateSnapshot = {
                stats: { ...this.stats },
                processedUrls: Array.from(this.processedUrls),
                existingIds: Array.from(this.existingIds),
                formData: formDataObj,
                timestamp: currentTime,
                categoryProgress: { ...this.categoryProgress },
                autoMode: this.autoMode
            };            await chrome.storage.local.set({
                [this.lastSavedStateKey]: stateSnapshot,
                [`${this.lastSavedStateKey}_backup`]: stateSnapshot, // Backup copy
                [this.progressStorageKey]: this.stats,
                [this.processedUrlsKey]: Array.from(this.processedUrls),
                [this.lastSuccessfulPageKey]: this.stats.lastSuccessfulPage.toString(),
                [this.lastSuccessfulOffsetKey]: this.stats.lastSuccessfulOffset.toString(),
                [this.existingIdsKey]: Array.from(this.existingIds),
                [this.formDataKey]: formDataObj,
                [this.categoryProgressKey]: this.categoryProgress,
                [this.autoModeKey]: this.autoMode
            });

            this.lastSavedState = stateSnapshot;
            this.lastSaveTime = currentTime;

            console.log('Saved progress:', {
                page: this.stats.currentPage,
                offset: this.stats.lastOffset,
                channels: this.stats.channelCount,
                loadMoreCount: this.stats.loadMoreCount,
                lastSuccessfulPage: this.stats.lastSuccessfulPage,
                category: this.categoryProgress.currentCategoryName,
                categoryIndex: this.currentCategoryIndex,
                autoMode: this.autoMode,
                timestamp: new Date(currentTime).toISOString()
            });        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }

    async refreshPageAndRestoreState() {
        try {
            console.log('Starting page refresh and state restoration...');
            
            // Save current state before refreshing
            await this.saveProgress();
            
            // Get the current URL to navigate back to the same page
            const currentUrl = window.location.href;
            console.log('Current URL before refresh:', currentUrl);
            
            // Create a promise that resolves when the page is refreshed and ready
            return new Promise((resolve) => {
                // Set up a flag to detect when we're back after refresh
                const refreshKey = 'tgstat_refresh_in_progress';
                const stateKey = 'tgstat_pre_refresh_state';
                
                // Save pre-refresh state
                const preRefreshState = {
                    url: currentUrl,
                    stats: { ...this.stats },
                    categoryProgress: { ...this.categoryProgress },
                    autoMode: this.autoMode,
                    currentCategoryIndex: this.currentCategoryIndex,
                    isRunning: this.isRunning,
                    timestamp: Date.now()
                };
                
                localStorage.setItem(stateKey, JSON.stringify(preRefreshState));
                localStorage.setItem(refreshKey, 'true');
                
                console.log('Saved pre-refresh state, refreshing page...');
                
                // Refresh the page
                window.location.reload();
                
                // The resolve will be called by the initialization code after refresh
                resolve();
            });
        } catch (error) {
            console.error('Error in refreshPageAndRestoreState:', error);
            throw error;
        }
    }    async restoreStateAfterRefresh() {
        try {
            const refreshKey = 'tgstat_refresh_in_progress';
            const stateKey = 'tgstat_pre_refresh_state';
            const smartReloadKey = 'tgstat_smart_reload_in_progress';
            const smartReloadStateKey = 'tgstat_pre_reload_state';
            
            // Check for smart reload first
            if (localStorage.getItem(smartReloadKey) === 'true') {
                console.log('🔄 DETECTED SMART RELOAD - Starting intelligent state restoration...');
                
                const preReloadStateStr = localStorage.getItem(smartReloadStateKey);
                if (preReloadStateStr) {
                    const preReloadState = JSON.parse(preReloadStateStr);
                    
                    console.log('📦 Pre-reload state found:', preReloadState);
                    
                    // Restore basic state
                    this.autoMode = preReloadState.autoMode;
                    this.currentCategoryIndex = preReloadState.currentCategoryIndex;
                    this.categoryProgress = { ...preReloadState.categoryProgress };
                    this.isRunning = preReloadState.isRunning;
                    
                    // Restore retry context
                    this.smartRetryCount = preReloadState.smartRetryCount || 0;
                    this.pageReloadCount = preReloadState.pageReloadCount || 0;
                    this.retryStartTime = preReloadState.retryStartTime;
                    this.isInRetryMode = true;
                    
                    console.log('✅ Smart reload state restored:', {
                        smartRetryCount: this.smartRetryCount,
                        pageReloadCount: this.pageReloadCount,
                        isInRetryMode: this.isInRetryMode
                    });
                    
                    // Clear the smart reload flags
                    localStorage.removeItem(smartReloadKey);
                    localStorage.removeItem(smartReloadStateKey);
                    
                    // Load the full saved state
                    await this.loadSavedProgress();
                    
                    // Restore reload context from chrome storage if available
                    const reloadContextResult = await chrome.storage.local.get(['tgstat_reload_context']);
                    if (reloadContextResult.tgstat_reload_context) {
                        const reloadContext = reloadContextResult.tgstat_reload_context;
                        console.log('📦 Restored reload context:', reloadContext.retryContext);
                        
                        // Restore retry context
                        this.smartRetryCount = reloadContext.retryContext.smartRetryCount || this.smartRetryCount;
                        this.pageReloadCount = reloadContext.retryContext.pageReloadCount || this.pageReloadCount;
                        this.retryStartTime = reloadContext.retryContext.retryStartTime || this.retryStartTime;
                        this.isInRetryMode = reloadContext.retryContext.isInRetryMode || this.isInRetryMode;
                        
                        // Clean up reload context
                        await chrome.storage.local.remove(['tgstat_reload_context']);
                    }
                    
                    // Restore form fields
                    await this.restoreFormFields();
                    
                    console.log('🎉 SMART RELOAD COMPLETED - Extension ready to continue with retry context!');
                    console.log('📊 Final state after smart reload:', {
                        currentPage: this.stats.currentPage,
                        smartRetryCount: this.smartRetryCount,
                        pageReloadCount: this.pageReloadCount,
                        autoMode: this.autoMode,
                        isInRetryMode: this.isInRetryMode
                    });
                    
                    // If we were running before reload, continue scraping after a brief delay
                    if (this.isRunning && this.autoMode) {
                        console.log('🚀 Auto-resuming scraping after smart reload...');
                        setTimeout(() => {
                            this.start();
                        }, 3000); // Give page time to fully load
                    }
                    
                    return true;
                }
            }
            
            // Check for regular refresh
            if (localStorage.getItem(refreshKey) === 'true') {
                console.log('🔄 DETECTED PAGE REFRESH - Starting state restoration...');
                
                const preRefreshStateStr = localStorage.getItem(stateKey);
                if (preRefreshStateStr) {
                    const preRefreshState = JSON.parse(preRefreshStateStr);
                    
                    console.log('📦 Pre-refresh state found:', preRefreshState);
                    
                    // Restore basic state
                    this.autoMode = preRefreshState.autoMode;
                    this.currentCategoryIndex = preRefreshState.currentCategoryIndex;
                    this.categoryProgress = { ...preRefreshState.categoryProgress };
                    this.isRunning = preRefreshState.isRunning;
                    
                    console.log('✅ Basic state restored from pre-refresh data');
                    
                    // Clear the refresh flags
                    localStorage.removeItem(refreshKey);
                    localStorage.removeItem(stateKey);
                    
                    console.log('🔍 Loading full saved state from chrome storage...');
                    
                    // Load the full saved state
                    await this.loadSavedProgress();
                    
                    console.log('📄 Current state after full load:', {
                        currentPage: this.stats.currentPage,
                        loadMoreCount: this.stats.loadMoreCount,
                        pageCount: this.stats.pageCount,
                        channelCount: this.stats.channelCount,
                        lastOffset: this.stats.lastOffset,
                        category: this.categoryProgress.currentCategoryName,
                        autoMode: this.autoMode
                    });
                    
                    // Restore form fields to the correct position
                    await this.restoreFormFields();
                    
                    console.log('🎉 STATE FULLY RESTORED AFTER REFRESH - Extension ready to continue!');
                    return true;
                } else {
                    console.warn('❌ Refresh detected but no pre-refresh state found');
                }
            } else {
                console.log('ℹ️ No page refresh detected, normal initialization');
            }
            
            return false;
        } catch (error) {
            console.error('💥 Error restoring state after refresh:', error);
            return false;
        }
    }async restoreFormFields() {
        try {
            // Wait for form elements to be available
            await this.waitForFormElements();
            
            const pageInput = document.querySelector('.lm-page');
            const offsetInput = document.querySelector('.lm-offset');
            
            if (pageInput && offsetInput) {
                // Set form to the NEXT page to load
                const nextPageToLoad = this.stats.currentPage + 1;
                const nextOffsetToLoad = this.stats.lastOffset + 20;
                
                pageInput.value = nextPageToLoad.toString();
                offsetInput.value = nextOffsetToLoad.toString();
                
                // Update form data if it exists
                if (this.formData) {
                    this.formData.set('page', nextPageToLoad.toString());
                    this.formData.set('offset', nextOffsetToLoad.toString());
                }
                
                console.log('Form fields restored - Next page to load:', nextPageToLoad, 'Next offset:', nextOffsetToLoad);
            } else {
                console.warn('Form fields not found for restoration');
            }
        } catch (error) {
            console.error('Error restoring form fields:', error);
        }
    }

    async waitForFormElements() {
        const maxWait = 10000; // 10 seconds
        const checkInterval = 500; // 500ms
        let waited = 0;
        
        while (waited < maxWait) {
            const pageInput = document.querySelector('.lm-page');
            const offsetInput = document.querySelector('.lm-offset');
            
            if (pageInput && offsetInput) {
                return true;
            }
            
            await this.delay(checkInterval);
            waited += checkInterval;
        }
        
        console.warn('Form elements not found after waiting');
        return false;
    }

    startPeriodicCleanup() {
        this.cleanupIntervalId = setInterval(() => {
            if (this.isRunning) {
                this.cleanupMemory();
            }
        }, this.cleanupInterval);
    }

    stopPeriodicCleanup() {
        if (this.cleanupIntervalId) {
            clearInterval(this.cleanupIntervalId);
        }
    }

    cleanupMemory() {
        try {
            // Force garbage collection of processed DOM elements
            const cards = document.querySelectorAll('.peer-item-box');
            let removedCount = 0;
            
            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const isInViewport = (
                    rect.top >= 0 &&
                    rect.left >= 0 &&
                    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
                );

                if (!isInViewport) {
                    card.remove();
                    removedCount++;
                }
            });            // Clear processed URLs that are too old (keep as simple strings)
            const processedUrlsArray = Array.from(this.processedUrls);
            if (processedUrlsArray.length > 10000) {
                // Keep only the last 5000 URLs to prevent memory bloat
                this.processedUrls = new Set(processedUrlsArray.slice(-5000));
            }

            // Save progress after cleanup
            this.saveProgress();

            console.log(`Memory cleanup: Removed ${removedCount} DOM elements`);
        } catch (error) {
            console.error('Error during memory cleanup:', error);
        }
    }

    async processDataInChunks(newChannels) {
        if (this.isOffline) {
            this.offlineQueue.push(...newChannels);
            return;
        }

        const chunks = [];
        for (let i = 0; i < newChannels.length; i += this.chunkSize) {
            chunks.push(newChannels.slice(i, i + this.chunkSize));
        }

        for (const chunk of chunks) {
            if (!this.isRunning) break;

            const uniqueChunk = chunk.filter(channel => !this.existingIds.has(channel.uniqueId));

            if (uniqueChunk.length > 0) {
                this.processingQueue.push(...uniqueChunk);
                
                if (this.processingQueue.length >= this.maxQueueSize) {
                    await this.flushProcessingQueue();
                }

                this.stats.channelCount += uniqueChunk.length;                uniqueChunk.forEach(channel => {
                    this.existingIds.add(channel.uniqueId);
                    this.processedUrls.add(channel.url);
                });                this.sendUpdate({
                    status: 'progress',
                    message: `Processed ${uniqueChunk.length} new channels (Total: ${this.stats.channelCount})`,
                    stats: this.stats
                });                // Force save after every batch to prevent any data loss
                await this.saveProgress(true);

                if (this.stats.channelCount - this.stats.lastSaveCount >= this.autoSaveThreshold) {
                    await this.autoSaveData();
                }
            }

            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }    async flushProcessingQueue() {
        if (this.processingQueue.length === 0) return;

        const dataToSave = [...this.processingQueue];
        this.processingQueue = [];

        try {
            console.log(`💾 FLUSHING QUEUE: ${dataToSave.length} items to storage`);
            
            const result = await chrome.storage.local.get([this.dataStorageKey]);
            const existingData = result[this.dataStorageKey] || [];
            
            console.log(`📊 Current storage has: ${existingData.length} items`);
            
            // Ensure we don't have duplicates
            const uniqueData = dataToSave.filter(newItem => 
                !existingData.some(existingItem => existingItem.uniqueId === newItem.uniqueId)
            );
            
            const newData = [...existingData, ...uniqueData];

            // CRITICAL: Validate before saving to prevent data loss
            if (newData.length < existingData.length) {
                console.error(`❌ CRITICAL ERROR: New data length (${newData.length}) is less than existing (${existingData.length})! Aborting save to prevent data loss!`);
                this.processingQueue = [...dataToSave, ...this.processingQueue]; // Restore queue
                return;
            }

            await chrome.storage.local.set({ [this.dataStorageKey]: newData });
            this.scrapedData = newData;

            console.log(`✅ SUCCESSFULLY SAVED: ${uniqueData.length} new channels. Total: ${newData.length}`);
            
            // CRITICAL: Verify the save was successful
            const verifyResult = await chrome.storage.local.get([this.dataStorageKey]);
            const verifyData = verifyResult[this.dataStorageKey] || [];
            
            if (verifyData.length !== newData.length) {
                console.error(`❌ VERIFICATION FAILED: Expected ${newData.length}, got ${verifyData.length}. Data may be corrupted!`);
                throw new Error('Storage verification failed - possible data corruption');
            } else {
                console.log(`✅ VERIFICATION PASSED: ${verifyData.length} items confirmed in storage`);
            }
            
        } catch (error) {
            console.error('❌ CRITICAL ERROR flushing processing queue:', error);
            // Restore the data to queue to prevent loss
            this.processingQueue = [...dataToSave, ...this.processingQueue];
            
            // Alert the user about potential data loss
            this.sendUpdate({
                status: 'error',
                message: `CRITICAL: Data save failed! ${dataToSave.length} items restored to queue. Error: ${error.message}`,
                stats: this.stats
            });
        }
    }

    async scrapeCurrentPage() {
        const channels = [];
        
        // Find all channel cards with more generic selectors
        const cardSelectors = [
            '.peer-item-box',
            '.card.card-body.peer-item-box',
            '.col-12.col-sm-6.col-md-4 .card',
            '.card',
            '.item-box',
            '.channel-item',
            '.group-item',
            '.course-item'
        ];
        
        let cards = [];
        for (const selector of cardSelectors) {
            cards = document.querySelectorAll(selector);
            if (cards.length > 0) {
                console.log(`Found ${cards.length} items using selector: ${selector}`);
                break;
            }
        }

        console.log(`Found ${cards.length} items on current page`);

        this.sendUpdate({
            status: 'processing',
            message: `Processing ${cards.length} items on current page`,
            stats: this.stats
        });

        // Process cards in smaller batches
        const batchSize = 20;
        for (let i = 0; i < cards.length; i += batchSize) {
            if (!this.isRunning) break;

            const batch = Array.from(cards).slice(i, i + batchSize);
            for (const card of batch) {
                try {
                    const channelData = this.extractChannelData(card);
                    if (channelData && channelData.uniqueId) {
                        if (this.existingIds.has(channelData.uniqueId)) {
                            console.log(`Skipping duplicate channel: ${channelData.name}`);
                            continue;
                        }

                        channels.push(channelData);
                        this.existingIds.add(channelData.uniqueId);                        this.processedUrls.add(channelData.url);
                    }
                } catch (error) {
                    console.error('Error processing channel:', error);
                }
            }

            // Allow UI to update between batches
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Process the collected channels in chunks
        await this.processDataInChunks(channels);

        this.sendUpdate({
            status: 'page_complete',
            message: `Processed ${cards.length} items, found ${channels.length} new ones`,
            stats: this.stats
        });

        return channels;
    }

    extractChannelData(card) {
        try {
            const data = {};

            // Extract name with more generic selectors
            const nameSelectors = [
                '.font-16.text-dark.text-truncate',
                '.text-dark.text-truncate',
                '.card-title',
                'h5',
                '.name',
                '.title'
            ];
            
            for (const selector of nameSelectors) {
                const nameElement = card.querySelector(selector);
                if (nameElement) {
                    data.name = nameElement.textContent.trim();
                    break;
                }
            }

            // Extract description with more generic selectors
            const descSelectors = [
                '.font-14.text-muted.line-clamp-2',
                '.text-muted.line-clamp-2',
                '.description',
                '.desc',
                'p'
            ];
            
            for (const selector of descSelectors) {
                const descElement = card.querySelector(selector);
                if (descElement) {
                    data.description = descElement.textContent.trim();
                    break;
                }
            }

            // Extract subscriber count
            const subscriberElement = card.querySelector('b');
            if (subscriberElement) {
                const subscriberText = subscriberElement.textContent.trim();
                data.subscribers = subscriberText.replace(/[^\d,]/g, '');
                data.subscribersRaw = subscriberText;
            }

            // Extract URL with more generic selectors
            const linkSelectors = [
                'a[href*="tgstat.ru/"]',
                'a[href*="/channel"]',
                'a[href*="/group"]',
                'a[href*="/course"]',
                'a'
            ];
            
            for (const selector of linkSelectors) {
                const linkElement = card.querySelector(selector);
                if (linkElement && linkElement.href) {
                    data.url = linkElement.href;
                    // Extract item ID from URL
                    const urlParts = data.url.split('/');
                    data.channelId = urlParts[urlParts.length - 1];
                    data.type = urlParts[urlParts.length - 2] || this.pageType;
                    break;
                }
            }

            // Extract profile image URL
            const imgElement = card.querySelector('img');
            if (imgElement) {
                data.profileImageUrl = imgElement.src.startsWith('//') ? 
                    'https:' + imgElement.src : imgElement.src;
            }

            // Extract last post time
            const timeElement = card.querySelector('.text-center.text-muted.font-12, .time, .date');
            if (timeElement) {
                data.lastPost = timeElement.textContent.trim();
            }

            // Add unique identifier and timestamp
            data.uniqueId = `${data.type}_${data.channelId}`;
            data.scrapedAt = new Date().toISOString();
            data.pageNumber = this.stats.pageCount;
            data.sourcePage = window.location.pathname;
            data.pageType = this.pageType;

            return data;
        } catch (error) {
            console.error('Error in extractChannelData:', error);
            return null;
        }
    }    async autoSaveData(forceDownload = false) {
        const shouldAutoSave = forceDownload || (this.stats.channelCount - this.stats.lastSaveCount >= this.autoSaveThreshold);
        
        if (shouldAutoSave) {
            try {
                console.log('💾 INITIATING AUTO-SAVE PROCESS');
                
                // First flush any remaining data in the processing queue
                await this.flushProcessingQueue();

                const result = await chrome.storage.local.get([this.dataStorageKey]);
                const data = result[this.dataStorageKey] || [];
                
                console.log(`📊 AUTO-SAVE DATA CHECK: Storage has ${data.length} items, Stats show ${this.stats.channelCount} channels`);
                
                // CRITICAL: Data integrity validation
                if (data.length > 0 && data.length !== this.stats.channelCount) {
                    console.warn(`⚠️ DATA MISMATCH: Storage has ${data.length} items but stats show ${this.stats.channelCount}. This indicates possible data corruption or loss.`);
                    
                    // Trust the storage data over stats if storage has more data
                    if (data.length > this.stats.channelCount) {
                        console.log(`🔧 CORRECTING: Updating stats to match storage (${data.length} items)`);
                        this.stats.channelCount = data.length;
                    }
                }

                if (data.length > 0) {
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const categoryName = this.getCurrentCategoryName();
                    const filename = `tgstat_${categoryName}_${timestamp}_${data.length}items.json`;
                    
                    console.log(`📦 DOWNLOADING ${data.length} items to ${filename}`);
                    
                    // Use message passing to background script for download
                    const downloadResult = await new Promise((resolve) => {
                        chrome.runtime.sendMessage({
                            type: 'DOWNLOAD_DATA',
                            data: {
                                data: data,
                                filename: filename
                            }
                        }, resolve);
                    });
                    
                    if (downloadResult.success) {
                        this.stats.lastSaveCount = this.stats.channelCount;
                        this.categoryProgress.categoryDataCount += data.length;
                        await this.saveProgress();

                        this.sendUpdate({
                            status: 'autosave',
                            message: `✅ AUTO-SAVED ${data.length} channels to ${filename}. Data preserved in storage.`,
                            stats: this.stats,
                            categoryProgress: this.categoryProgress
                        });
                        
                        // CRITICAL: DO NOT CLEAR DATA FROM STORAGE AFTER DOWNLOAD
                        // Data must remain in storage to prevent loss on crashes/restarts
                        console.log(`✅ AUTO-SAVE COMPLETE: ${data.length} channels downloaded. Data remains in storage for safety.`);
                        console.log(`📊 STATS UPDATE: Total accumulated channels: ${this.stats.channelCount}`);
                    } else {
                        throw new Error(downloadResult.error || 'Download failed');
                    }

                    this.cleanupMemory();
                } else {
                    console.log('📝 AUTO-SAVE: No data to save yet');
                }
            } catch (error) {
                console.error('❌ CRITICAL ERROR during auto-save:', error);
                this.sendUpdate({
                    status: 'error',
                    message: `CRITICAL: Auto-save failed! Data preserved in storage. Error: ${error.message}`
                });
            }
        } else {
            console.log(`📊 AUTO-SAVE: Not triggered yet. Need ${this.autoSaveThreshold - (this.stats.channelCount - this.stats.lastSaveCount)} more channels`);        }
    }

    async startScraping(existingData = [], autoMode = false) {
        if (this.isRunning) return;
        
        console.log('🚀 START SCRAPING CALLED');
        console.log('📊 Current state at start:', {
            currentPage: this.stats.currentPage,
            loadMoreCount: this.stats.loadMoreCount,
            pageCount: this.stats.pageCount,
            channelCount: this.stats.channelCount,
            lastOffset: this.stats.lastOffset
        });
        
        this.isRunning = true;
        this.isResuming = true;
        this.autoMode = autoMode;
        
        try {
            // Validate current page
            if (!window.location.hostname.includes('tgstat.ru')) {
                throw new Error('Please navigate to tgstat.ru before starting the scraper.');
            }

            // Set page type from URL and initialize category if in auto mode
            const currentPath = window.location.pathname;
            this.pageType = currentPath.split('/')[1] || 'main';
              if (this.autoMode && !this.currentCategory) {
                // Find current category from URL
                const currentUrl = window.location.href;
                const categoryIndex = this.categories.findIndex(cat => cat.url === currentUrl);
                
                if (categoryIndex >= 0) {
                    // We're already on a category page
                    this.currentCategoryIndex = categoryIndex;
                    this.currentCategory = this.categories[categoryIndex];
                    this.categoryProgress.currentCategoryIndex = categoryIndex;
                    this.categoryProgress.currentCategoryName = this.currentCategory.name;
                    this.categoryProgress.currentCategoryUrl = this.currentCategory.url;
                    this.categoryProgress.categoryStartTime = new Date().toISOString();
                    console.log(`✅ Auto mode: Already on category ${this.currentCategory.name}`);
                } else {
                    // We're not on a category page, need to navigate to first category
                    console.log('🚀 Auto mode: Not on category page, navigating to first category...');
                    this.currentCategoryIndex = 0;
                    this.currentCategory = this.categories[0];
                    this.categoryProgress.currentCategoryIndex = 0;
                    this.categoryProgress.currentCategoryName = this.currentCategory.name;
                    this.categoryProgress.currentCategoryUrl = this.currentCategory.url;
                    this.categoryProgress.categoryStartTime = new Date().toISOString();
                    
                    // Save state before navigation
                    await this.saveProgress(true);
                    
                    // Navigate to first category
                    console.log(`🔄 Navigating to first category: ${this.currentCategory.name} - ${this.currentCategory.url}`);
                    window.location.href = this.currentCategory.url;
                    return; // Exit here as page will reload
                }
            }
              // Load the most recent state
            await this.loadSavedProgress();
            
            console.log('📊 State after loading saved progress:', {
                currentPage: this.stats.currentPage,
                loadMoreCount: this.stats.loadMoreCount,
                pageCount: this.stats.pageCount,
                channelCount: this.stats.channelCount,
                lastOffset: this.stats.lastOffset
            });
            
            console.log(`Starting scraper for page type: ${this.pageType}`, {
                page: this.stats.currentPage,
                offset: this.stats.lastOffset,
                channels: this.stats.channelCount,
                loadMoreCount: this.stats.loadMoreCount,
                autoMode: this.autoMode,
                category: this.categoryProgress.currentCategoryName
            });

            // Update form fields with current progress
            this.updateFormFields();

            // Start scraping
            this.sendUpdate({
                status: 'scraping',
                message: `Starting ${this.autoMode ? 'auto ' : ''}scraping from ${currentPath} page ${this.stats.currentPage}...`,
                stats: this.stats,
                categoryProgress: this.categoryProgress,
                autoMode: this.autoMode
            });

            await this.scrapeAllChannels();
        } catch (error) {
            console.error('Scraping error:', error);
            this.sendUpdate({
                status: 'error',
                message: error.message
            });
        } finally {
            this.isRunning = false;
            this.isResuming = false;
        }
    }    stopScraping() {
        console.log('🛑 STOP SCRAPING CALLED');
        console.log('📊 Current state at stop:', {
            currentPage: this.stats.currentPage,
            loadMoreCount: this.stats.loadMoreCount,
            pageCount: this.stats.pageCount,
            channelCount: this.stats.channelCount,
            lastOffset: this.stats.lastOffset
        });
        
        this.isRunning = false;
        this.stopPeriodicCleanup();
        
        // CRITICAL: Force save current state before stopping
        this.saveProgress(true).then(() => {
            console.log('💾 STOP: Final state saved before stopping');
        }).catch(error => {
            console.error('❌ STOP: Error saving final state:', error);
        });
        
        this.cleanupMemory();
        this.sendUpdate({
            status: 'completed',
            stats: this.stats
        });
    }async scrapeAllChannels() {
        let hasMorePages = true;
        let retryCount = 0;
        this.consecutiveEmptyPages = 0;

        while (hasMorePages && this.isRunning) {
            try {
                // Check for captcha
                if (this.captchaDetected) {
                    const timeSinceCaptcha = Date.now() - this.lastCaptchaTime;
                    if (timeSinceCaptcha < this.captchaWaitTime) {
                        this.sendUpdate({
                            status: 'warning',
                            message: `Captcha detected. Waiting ${Math.ceil((this.captchaWaitTime - timeSinceCaptcha) / 1000)} seconds...`,
                            stats: this.stats,
                            categoryProgress: this.categoryProgress
                        });
                        await this.delay(5000); // Check every 5 seconds
                        continue;                    } else {
                        // After waiting period, reset captcha flag and continue
                        this.captchaDetected = false;
                        this.sendUpdate({
                            status: 'info',
                            message: 'Captcha wait period ended, continuing scraping...',
                            stats: this.stats
                        });
                        // Continue with normal scraping instead of refreshing
                    }}

                // Don't increment pageCount here - it should only increment when we actually move to next page
                
                this.sendUpdate({
                    status: 'scraping',
                    message: `Processing page ${this.stats.currentPage} - ${this.categoryProgress.currentCategoryName || 'Unknown Category'}`,
                    stats: this.stats,
                    categoryProgress: this.categoryProgress
                });                // Scrape current page
                const newChannels = await this.scrapeCurrentPage();
                
                if (newChannels.length > 0) {
                    this.stats.channelCount += newChannels.length;
                    this.consecutiveEmptyPages = 0;
                    this.loadMoreFailureCount = 0; // Reset failure count on success
                    this.noDataRetryCount = 0; // Reset no data retry count on success
                    
                    console.log(`📊 CRITICAL: Scraped ${newChannels.length} channels from page ${this.stats.currentPage}, total: ${this.stats.channelCount}`);
                    
                    // IMMEDIATELY force save this critical state update
                    await this.saveProgress(true);
                    console.log('💾 Critical channel count saved immediately after scraping');
                    
                    this.sendUpdate({
                        newChannels: newChannels,
                        stats: this.stats,
                        categoryProgress: this.categoryProgress
                    });

                    // Check for auto-save
                    await this.autoSaveData();
                } else {
                    console.log('No new channels found on current page');
                    this.consecutiveEmptyPages++;
                    this.noDataRetryCount++;
                    
                    // Only move to next category after more retries
                    if (this.consecutiveEmptyPages >= this.maxEmptyPages && this.noDataRetryCount >= this.maxNoDataRetries) {
                        console.log(`No new data after ${this.maxEmptyPages} consecutive attempts and ${this.maxNoDataRetries} no-data retries`);
                        
                        if (this.autoMode) {
                            // In auto mode, move to next category
                            await this.moveToNextCategory();
                            return;
                        } else {
                            // In manual mode, show confirmation
                            const shouldContinue = await this.handleLoadMoreFailure();
                            if (shouldContinue) return;
                        }
                    } else {
                        // Continue trying - just log the attempt
                        this.sendUpdate({
                            status: 'warning',
                            message: `No new data found (${this.consecutiveEmptyPages}/${this.maxEmptyPages} attempts, ${this.noDataRetryCount}/${this.maxNoDataRetries} retries). Continuing...`,
                            stats: this.stats,
                            categoryProgress: this.categoryProgress
                        });
                    }
                }

                // Save progress after each page
                await this.saveProgress();

                // Clean up DOM
                this.cleanupDOM();

                // Try to load more
                this.sendUpdate({
                    status: 'loading',
                    message: 'Attempting to load more channels...',
                    stats: this.stats
                });

                hasMorePages = await this.clickLoadMore();
                  if (hasMorePages) {
                    // loadMoreCount will be incremented in clickLoadMore when successful
                    await this.saveProgress();
                    retryCount = 0; // Reset retry count on success                } else {
                    // Load more failed - handle with retry logic
                    const shouldContinue = await this.handleLoadMoreFailure();
                    if (shouldContinue) {
                        return; // Exit the loop
                    } else {
                        // Continue trying - attempt load more again immediately
                        console.log('🔄 Retry logic returned false - attempting load more again...');
                        await this.delay(1000); // Brief delay before retry
                        hasMorePages = await this.clickLoadMore();
                        if (hasMorePages) {
                            await this.saveProgress();
                            retryCount = 0;
                            continue;
                        } else {
                            // Still failed, continue to the next iteration of while loop
                            await this.delay(2000);
                            continue;
                        }
                    }
                }

            } catch (error) {
                console.error('Error during scraping cycle:', error);
                
                // Check for captcha error
                if (error.message.includes('captcha') || document.querySelector('.captcha-container')) {
                    this.captchaDetected = true;
                    this.lastCaptchaTime = Date.now();
                    this.sendUpdate({
                        status: 'warning',
                        message: 'Captcha detected. Waiting 5 minutes before continuing...',
                        stats: this.stats
                    });
                    continue;
                }

                // Handle network errors
                if (error.message.includes('network') || error.message.includes('timeout')) {
                    await this.handleNetworkError(error);
                    continue;
                }

                retryCount++;
                
                if (retryCount >= this.maxRetries) {
                    if (this.autoMode) {
                        // In auto mode, try to move to next category
                        this.sendUpdate({
                            status: 'warning',
                            message: 'Max retries reached, moving to next category...',
                            stats: this.stats
                        });
                        await this.moveToNextCategory();
                        return;                    } else {
                        // In manual mode, stop scraping instead of refreshing
                        this.isRunning = false;
                        this.sendUpdate({
                            status: 'error',
                            message: 'Max retries reached. Scraping stopped. Click Start to retry.',
                            stats: this.stats
                        });
                        return;
                    }
                }                this.sendUpdate({
                    status: 'warning',
                    message: `Retrying after error: ${error.message} (${retryCount}/${this.maxRetries})`,
                    stats: this.stats
                });
                
                await this.delay(this.retryDelay);
            }
        }

        // Only mark as completed if we've actually finished
        if (!this.isRunning) {
            this.sendUpdate({
                status: 'completed',
                message: `Scraping completed. Total channels: ${this.stats.channelCount}`,
                stats: this.stats,
                categoryProgress: this.categoryProgress
            });
        }
    }

    cleanupDOM() {
        try {
            // Remove scraped cards to free memory
            const cards = document.querySelectorAll('.peer-item-box');
            let removedCount = 0;
            
            cards.forEach(card => {
                // Get card's position relative to viewport
                const rect = card.getBoundingClientRect();
                const isInViewport = (
                    rect.top >= 0 &&
                    rect.left >= 0 &&
                    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
                );

                // Remove card if it's not in the current viewport
                if (!isInViewport) {
                    card.remove();
                    removedCount++;
                }
            });
            
            if (removedCount > 0) {
                console.log(`Cleaned up ${removedCount} DOM elements`);
            }
        } catch (error) {
            console.error('Error cleaning up DOM:', error);
        }
    }    async clickLoadMore(retryCount = 0) {
        try {
            const loadMoreBtn = document.querySelector('.lm-button');
            if (!loadMoreBtn) {
                console.log('Load more button not found - reached end');
                return false;
            }

            if (document.querySelector('.captcha-container')) {
                this.captchaDetected = true;
                this.lastCaptchaTime = Date.now();
                throw new Error('Captcha detected');
            }

            const loader = document.querySelector('.lm-loader');
            if (loader && !loader.classList.contains('d-none')) {
                console.log('Already loading, waiting...');
                await this.delay(2000);
                return await this.clickLoadMore(retryCount);
            }

            if (loader) {
                loader.classList.remove('d-none');
            }

            // Get current page and offset from form
            const pageInput = document.querySelector('.lm-page');
            const offsetInput = document.querySelector('.lm-offset');
            
            if (!pageInput || !offsetInput) {
                console.error('Page or offset input not found');
                return false;
            }            // Parse current values from form (these represent the NEXT page to load)
            const nextPageToLoad = parseInt(pageInput.value) || 1;
            const nextOffsetToLoad = parseInt(offsetInput.value) || 0;

            console.log('About to load page:', nextPageToLoad, 'Offset:', nextOffsetToLoad);            // Save progress with current page info before loading more
            await this.saveProgress(true);

            // Click the load more button (it will use the current form values)
            loadMoreBtn.click();

            // Wait for new content
            const success = await this.waitForNewContent();
              if (success) {
                // Update stats - we successfully loaded nextPageToLoad
                this.stats.lastSuccessfulPage = nextPageToLoad;
                this.stats.lastSuccessfulOffset = nextOffsetToLoad;
                this.stats.currentPage = nextPageToLoad; // This is the highest page we've loaded
                this.stats.lastOffset = nextOffsetToLoad;
                this.stats.pageCount++; // Increment page count (number of load more operations)
                this.stats.loadMoreCount++; // Increment load more count only on successful load
                
                console.log(`🎯 CRITICAL STATE UPDATE - Page ${nextPageToLoad} loaded successfully:`, {
                    currentPage: this.stats.currentPage,
                    loadMoreCount: this.stats.loadMoreCount,
                    pageCount: this.stats.pageCount,
                    lastOffset: this.stats.lastOffset
                });
                
                // IMMEDIATELY force save this critical state update
                await this.saveProgress(true);
                console.log('💾 Critical state saved immediately after page load');
                
                // Now update form fields for the NEXT load more operation
                const nextPageForForm = nextPageToLoad + 1;
                const nextOffsetForForm = nextOffsetToLoad + 20;
                
                pageInput.value = nextPageForForm.toString();
                offsetInput.value = nextOffsetForForm.toString();
                
                // Update form data
                if (this.formData) {
                    this.formData.set('page', nextPageForForm.toString());
                    this.formData.set('offset', nextOffsetForForm.toString());
                }
                  console.log(`Successfully loaded page ${nextPageToLoad}. Load more count: ${this.stats.loadMoreCount}, Page count: ${this.stats.pageCount}, Current page: ${this.stats.currentPage}`);
                console.log(`Form updated for next load: page ${nextPageForForm}, offset ${nextOffsetForForm}`);
                
                // Reset failure counters on success
                this.loadMoreFailureCount = 0;
                this.noDataRetryCount = 0;
                this.consecutiveEmptyPages = 0;
                
                // Force save immediately after successful page load to prevent data loss
                await this.saveProgress(true);
                console.log(`✅ SAVED: Successfully loaded page ${this.stats.currentPage}, total channels: ${this.stats.channelCount}`);} else {
                // Restore form to previous values if failed
                pageInput.value = nextPageToLoad.toString();
                offsetInput.value = nextOffsetToLoad.toString();
                
                if (this.formData) {
                    this.formData.set('page', nextPageToLoad.toString());
                    this.formData.set('offset', nextOffsetToLoad.toString());
                }
                
                console.log('Failed to load new content. Current page remains:', this.stats.currentPage);if (retryCount < this.maxRetries) {
                    console.log(`Retrying load more... (${retryCount + 1}/${this.maxRetries})`);
                    await this.delay(this.retryDelay);
                    return await this.clickLoadMore(retryCount + 1);
                }
            }

            return success;
        } catch (error) {
            console.error('Error clicking load more:', error);
            
            if (error.message.includes('captcha') || document.querySelector('.captcha-container')) {
                this.captchaDetected = true;
                this.lastCaptchaTime = Date.now();
                throw error;
            }
            
            return false;
        }
    }    async waitForNewContent() {
        const maxWaitTime = 30000; // 30 seconds max
        const checkInterval = 1000; // Check every second
        let waitedTime = 0;
        let lastItemCount = document.querySelectorAll('.peer-item-box').length;
        let stableCount = 0;
        const requiredStableChecks = 3; // Wait for 3 stable checks

        console.log(`Starting waitForNewContent with ${lastItemCount} items`);

        while (waitedTime < maxWaitTime && this.isRunning) {
            // Check for captcha
            if (document.querySelector('.captcha-container')) {
                this.captchaDetected = true;
                this.lastCaptchaTime = Date.now();
                throw new Error('Captcha detected');
            }

            // Check if loader is gone
            const loader = document.querySelector('.lm-loader');
            const isLoading = loader && !loader.classList.contains('d-none');

            if (!isLoading) {
                // Wait a bit more to ensure content is loaded
                await this.delay(1500);
                
                // Check if new content was actually added
                const currentItemCount = document.querySelectorAll('.peer-item-box').length;
                console.log(`Items check - Previous: ${lastItemCount}, Current: ${currentItemCount}, Waited: ${waitedTime}ms`);
                
                if (currentItemCount > lastItemCount) {
                    console.log(`New content loaded successfully! Added ${currentItemCount - lastItemCount} items`);
                    return true;
                } else if (currentItemCount === lastItemCount) {
                    stableCount++;
                    console.log(`No new items found, stable count: ${stableCount}/${requiredStableChecks}`);
                    
                    if (stableCount >= requiredStableChecks) {
                        console.log('No new content found after stable checks');
                        return false;
                    }
                } else {
                    // Item count decreased (maybe DOM cleanup), reset stable count
                    stableCount = 0;
                    lastItemCount = currentItemCount;
                }
            } else {
                // Still loading, reset stable count
                stableCount = 0;
                console.log(`Still loading... waited ${waitedTime}ms`);
            }

            await this.delay(checkInterval);
            waitedTime += checkInterval;
        }

        console.log('Timed out waiting for new content');
        return false;
    }

    sendUpdate(data) {
        try {
            chrome.runtime.sendMessage({
                type: 'SCRAPER_UPDATE',
                data: data
            });
        } catch (error) {
            console.error('Error sending update:', error);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));    }    async resetProgress() {
        try {
            console.log('🚨 RESET PROGRESS CALLED - CLEARING ALL DATA');
            
            // COMPLETELY RESET EVERYTHING
            this.stats = {
                channelCount: 0, // RESET TO 0 - clear all channel count
                loadMoreCount: 0,
                pageCount: 1,
                currentPage: 1,
                lastOffset: 0,
                lastSaveCount: 0,
                lastSuccessfulPage: 1,
                lastSuccessfulOffset: 0
            };
            
            // Clear all data sets
            this.scrapedData = []; // Clear scraped data
            this.existingIds = new Set(); // Clear existing IDs
            this.processedUrls = new Set(); // Clear processed URLs
            this.processingQueue = []; // Clear processing queue
            
            // Reset retry counters
            this.consecutiveEmptyPages = 0;
            this.loadMoreFailureCount = 0;
            this.networkErrorCount = 0;
            this.noDataRetryCount = 0;
            this.smartRetryCount = 0;
            this.pageReloadCount = 0;
            this.isInRetryMode = false;
            this.retryStartTime = null;
            
            // Reset category progress
            this.categoryProgress = {
                currentCategoryIndex: 0,
                currentCategoryName: '',
                currentCategoryUrl: '',
                totalCategories: this.categories ? this.categories.length : 46,
                categoryStartTime: null,
                categoryDataCount: 0
            };
            
            // CLEAR ALL STORAGE DATA
            const keysToRemove = [
                this.dataStorageKey, // Clear stored scraped data
                this.lastSavedStateKey, // Clear saved state
                `${this.lastSavedStateKey}_backup`, // Clear backup state
                this.progressStorageKey,
                this.processedUrlsKey,
                this.lastSuccessfulPageKey,
                this.lastSuccessfulOffsetKey,
                this.existingIdsKey,
                this.formDataKey,
                this.categoryProgressKey,
                'tgstat_reload_context',
                'tgstat_smart_reload_context'
            ];
            
            console.log('🗑️ Removing storage keys:', keysToRemove);
            await chrome.storage.local.remove(keysToRemove);
            
            // Clear localStorage flags
            localStorage.removeItem('tgstat_refresh_in_progress');
            localStorage.removeItem('tgstat_pre_refresh_state');
            localStorage.removeItem('tgstat_smart_reload_in_progress');
            localStorage.removeItem('tgstat_pre_reload_state');
            
            // Update form fields to page 1
            this.updateFormFields();
            
            // Save the completely reset state
            await this.saveProgress(true);
            
            console.log('✅ COMPLETE RESET FINISHED - All data cleared');
            console.log('📊 Reset state:', {
                channelCount: this.stats.channelCount,
                scrapedDataLength: this.scrapedData.length,
                existingIdsSize: this.existingIds.size,
                processedUrlsSize: this.processedUrls.size
            });
            
            this.sendUpdate({
                status: 'warning',
                message: 'Complete reset finished. All progress and data cleared. Starting fresh from page 1.',
                stats: this.stats
            });
            
            return true;
        } catch (error) {
            console.error('❌ Error during complete reset:', error);
            return false;
        }
    }

    setupConfirmationListener() {
        // Listen for user confirmations
        window.addEventListener('message', (event) => {
            if (event.data.type === 'SCRAPER_CONFIRMATION') {
                this.handleUserConfirmation(event.data.action);
            }
        });
    }

    async handleUserConfirmation(action) {
        this.waitingForConfirmation = false;
        
        switch (action) {
            case 'CONTINUE_NEXT_CATEGORY':
                await this.moveToNextCategory();
                break;
            case 'RETRY_CURRENT_PAGE':
                await this.retryCurrentPage();
                break;
            case 'STOP_SCRAPING':
                this.stopScraping();
                break;
        }
    }

    async showConfirmationDialog(message, options) {
        return new Promise((resolve) => {
            this.waitingForConfirmation = true;
            
            // Create confirmation overlay
            const overlay = document.createElement('div');
            overlay.id = 'tgstat-confirmation-overlay';
            overlay.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                           background: rgba(0,0,0,0.8); z-index: 99999; display: flex; 
                           align-items: center; justify-content: center;">
                    <div style="background: white; padding: 30px; border-radius: 10px; 
                               max-width: 500px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                        <h3 style="margin-bottom: 20px; color: #333;">TGStat Scraper</h3>
                        <p style="margin-bottom: 25px; color: #666; line-height: 1.5;">${message}</p>
                        <div>
                            ${options.map(option => 
                                `<button onclick="window.postMessage({type: 'SCRAPER_CONFIRMATION', action: '${option.action}'}, '*'); 
                                         document.getElementById('tgstat-confirmation-overlay').remove();" 
                                        style="margin: 5px; padding: 10px 20px; border: none; border-radius: 5px; 
                                               cursor: pointer; font-size: 14px; ${option.style || 'background: #007bff; color: white;'}"
                                        >${option.text}</button>`
                            ).join('')}
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(overlay);
            
            // Auto-timeout after 30 seconds
            setTimeout(() => {
                if (this.waitingForConfirmation) {
                    this.waitingForConfirmation = false;
                    const overlayElement = document.getElementById('tgstat-confirmation-overlay');
                    if (overlayElement) overlayElement.remove();
                    resolve('timeout');
                }
            }, this.confirmationTimeout);
        });
    }

    async moveToNextCategory() {
        try {            // Save current progress
            await this.saveProgress(true);
            
            // Auto-download current category data
            await this.autoSaveData(true);
            
            // Move to next category
            this.currentCategoryIndex++;
            
            if (this.currentCategoryIndex >= this.categories.length) {
                this.sendUpdate({
                    status: 'completed',
                    message: 'All categories completed! Scraping finished.',
                    stats: this.stats,
                    categoryProgress: this.categoryProgress
                });
                this.stopScraping();
                return;
            }
            
            // Reset for new category
            this.resetForNewCategory();
            
            // Navigate to next category
            const nextCategory = this.categories[this.currentCategoryIndex];
            this.currentCategory = nextCategory;
            this.categoryProgress.currentCategoryIndex = this.currentCategoryIndex;
            this.categoryProgress.currentCategoryName = nextCategory.name;
            this.categoryProgress.currentCategoryUrl = nextCategory.url;
            this.categoryProgress.categoryStartTime = new Date().toISOString();
            this.categoryProgress.categoryDataCount = 0;
            
            this.sendUpdate({
                status: 'category_change',
                message: `Moving to category: ${nextCategory.name}`,
                stats: this.stats,
                categoryProgress: this.categoryProgress
            });
            
            // Navigate to new category URL
            window.location.href = nextCategory.url;
            
        } catch (error) {
            console.error('Error moving to next category:', error);
            this.sendUpdate({
                status: 'error',
                message: `Error moving to next category: ${error.message}`
            });
        }
    }    resetForNewCategory() {
        // Reset page-specific stats but keep global counters
        this.stats.currentPage = 1;
        this.stats.lastOffset = 0;
        this.stats.loadMoreCount = 0; // Reset load more count for new category
        this.stats.pageCount = 0; // Start with 0 load more operations for new category
        this.consecutiveEmptyPages = 0;
        this.loadMoreFailureCount = 0;
        this.networkErrorCount = 0;
        this.noDataRetryCount = 0; // Reset no data retry count
        
        // Update successful page tracking
        this.stats.lastSuccessfulPage = 1;
        this.stats.lastSuccessfulOffset = 0;
        
        // Clear processed URLs for new category (but keep global existingIds to prevent duplicates)
        this.processedUrls.clear();
        
        console.log('Reset for new category - page counts and load more count reset');
    }    async retryCurrentPage() {
        try {
            this.consecutiveEmptyPages = 0;
            this.loadMoreFailureCount = 0;
            this.networkErrorCount = 0;
            this.noDataRetryCount = 0; // Reset retry counters
            
            this.sendUpdate({
                status: 'retry',
                message: 'Retrying current page...',
                stats: this.stats
            });
            
            // Instead of refreshing, restart the scraping process
            if (this.isRunning) {
                // Just continue the current scraping loop
                console.log('Continuing scraping after retry...');
            } else {
                // Restart scraping
                await this.startScraping(this.scrapedData, this.autoMode);
            }
            
        } catch (error) {
            console.error('Error retrying current page:', error);
        }
    }

    async handleNetworkError(error) {
        this.networkErrorCount++;
        this.lastNetworkError = Date.now();
        
        console.error('Network error detected:', error);
        
        if (this.networkErrorCount >= this.maxNetworkErrors) {
            const timeSinceLastError = Date.now() - this.lastNetworkError;
            
            if (timeSinceLastError < this.networkRetryDelay) {
                const waitTime = Math.ceil((this.networkRetryDelay - timeSinceLastError) / 1000);
                
                this.sendUpdate({
                    status: 'warning',
                    message: `Network errors detected. Waiting ${waitTime} seconds before retry...`,
                    stats: this.stats
                });
                
                await this.delay(this.networkRetryDelay - timeSinceLastError);
            }
            
            // Reset error count after waiting
            this.networkErrorCount = 0;
        }
    }    async handleLoadMoreFailure() {
        this.loadMoreFailureCount++;
        this.smartRetryCount++;
        this.isInRetryMode = true;
        
        if (!this.retryStartTime) {
            this.retryStartTime = Date.now();
        }
        
        const timeInRetryMode = Math.round((Date.now() - this.retryStartTime) / 1000);
        
        console.log(`🔄 SMART RETRY ${this.smartRetryCount}/${this.maxSmartRetries} - Load more failed, implementing intelligent retry...`);
          // Force save state before any retry attempt
        await this.saveProgress(true);
        
        // CRITICAL: Add extra timestamp to prevent old state loading
        const forceStateUpdate = {
            [this.lastSavedStateKey]: {
                stats: { ...this.stats },
                processedUrls: Array.from(this.processedUrls),
                existingIds: Array.from(this.existingIds),
                timestamp: Date.now(), // Current timestamp
                reason: 'retry_force_save'
            }
        };
        await chrome.storage.local.set(forceStateUpdate);
        console.log('💾 FORCE STATE SAVE: Updated state with current timestamp to prevent rollback');
        
        // Check if we should reload the page (every 5 retries)
        const shouldReload = (this.smartRetryCount % this.retryWithReloadAfter === 0) && 
                            (this.pageReloadCount < this.maxPageReloads);
        
        if (shouldReload) {
            console.log(`🔄 SMART RELOAD: Attempting page reload (${this.pageReloadCount + 1}/${this.maxPageReloads})`);
            
            this.sendUpdate({
                status: 'warning',
                message: `Smart reload ${this.pageReloadCount + 1}/${this.maxPageReloads} - Attempting page refresh to bypass limits... (Retry ${this.smartRetryCount}/${this.maxSmartRetries})`,
                stats: this.stats,
                categoryProgress: this.categoryProgress
            });
            
            // Perform smart reload with state preservation
            const reloadSuccess = await this.performSmartReload();
            
            if (reloadSuccess) {
                // Reset some counters after successful reload
                this.loadMoreFailureCount = 0;
                this.currentRetryDelayIndex = 0;
                console.log('✅ Smart reload completed, continuing scraping...');
                return false; // Continue scraping
            } else {
                console.warn('⚠️ Smart reload failed, continuing with regular retries...');
            }
        }
        
        // Regular retry logic
        if (this.smartRetryCount < this.maxSmartRetries) {
            // Progressive delay strategy
            const delayIndex = Math.min(this.currentRetryDelayIndex, this.progressiveRetryDelays.length - 1);
            const delay = this.progressiveRetryDelays[delayIndex];
            this.currentRetryDelayIndex++;
            
            this.sendUpdate({
                status: 'warning',
                message: `Intelligent retry ${this.smartRetryCount}/${this.maxSmartRetries} - Waiting ${delay/1000}s... (${timeInRetryMode}s in retry mode)`,
                stats: this.stats,
                categoryProgress: this.categoryProgress
            });
            
            console.log(`⏳ Progressive delay: ${delay}ms (level ${delayIndex + 1})`);
            await this.delay(delay);
            
            // Try different retry strategies
            if (this.smartRetryCount % 3 === 0) {
                console.log('🔧 Strategy: Reinitializing form data...');
                await this.initializeFormData();
            }
            
            if (this.smartRetryCount % 4 === 0) {
                console.log('🔧 Strategy: Clearing browser cache...');
                await this.clearBrowserCache();
            }
              console.log(`🚀 Resuming scraping attempt ${this.smartRetryCount + 1}...`);
            
            // CRITICAL: Actually retry the load more operation
            console.log('🔄 ACTUALLY RETRYING: Attempting clickLoadMore() again...');
            const retryResult = await this.clickLoadMore();
            
            if (retryResult) {
                console.log('✅ RETRY SUCCESS: Load more worked on retry!');
                this.resetRetryState(); // Reset retry counters on success
                return false; // Continue scraping normally
            } else {
                console.log('❌ RETRY FAILED: Load more still failed after retry');
                return false; // Continue trying (will increment retry count on next failure)
            }
        }
        
        // Exhausted all retries
        console.log(`❌ All ${this.maxSmartRetries} smart retries exhausted`);
        
        // Reset retry state
        this.resetRetryState();
        
        const currentCategoryData = this.categoryProgress.categoryDataCount || 0;
        const totalScraped = this.stats.channelCount;
        
        if (this.autoMode) {
            // In auto mode, automatically move to next category
            this.sendUpdate({
                status: 'category_complete',
                message: `Category "${this.categoryProgress.currentCategoryName}" completed after ${this.maxSmartRetries} retry attempts. Scraped ${currentCategoryData} items. Moving to next category...`,
                stats: this.stats,
                categoryProgress: this.categoryProgress
            });
            
            console.log('🏁 Auto mode: Moving to next category after retry exhaustion');
            await this.moveToNextCategory();
            return true;
        } else {
            // In manual mode, show options
            const action = await this.showConfirmationDialog(
                `Smart retry system exhausted all ${this.maxSmartRetries} attempts including ${this.pageReloadCount} page reloads.<br><br>
                 Current category: ${this.categoryProgress.currentCategoryName}<br>
                 Data scraped this category: ${currentCategoryData} items<br>
                 Total scraped: ${totalScraped} items<br>
                 Time in retry mode: ${timeInRetryMode} seconds<br><br>
                 What would you like to do?`,
                [
                    { text: 'Move to Next Category', action: 'CONTINUE_NEXT_CATEGORY', style: 'background: #28a745; color: white;' },
                    { text: 'Reset & Retry Current', action: 'RESET_RETRY_CURRENT', style: 'background: #ffc107; color: black;' },
                    { text: 'Stop Scraping', action: 'STOP_SCRAPING', style: 'background: #dc3545; color: white;' }
                ]
            );
            
            if (action === 'RESET_RETRY_CURRENT') {
                console.log('🔄 User chose to reset and retry current category');
                this.resetRetryState();
                return false; // Continue with fresh retry state
            } else if (action === 'timeout' || action === 'CONTINUE_NEXT_CATEGORY') {
                console.log('➡️ Moving to next category (timeout or user choice)');
                await this.moveToNextCategory();
            }
            
            return true;
        }
    }

    resetRetryState() {
        console.log('🔄 Resetting retry state...');
        this.smartRetryCount = 0;
        this.loadMoreFailureCount = 0;
        this.noDataRetryCount = 0;
        this.pageReloadCount = 0;
        this.currentRetryDelayIndex = 0;
        this.isInRetryMode = false;
        this.retryStartTime = null;
        this.lastRetryTime = 0;
    }

    async performSmartReload() {
        try {
            console.log('🔄 Starting smart reload process...');
            
            // Save current state with reload marker
            await this.saveProgressBeforeReload();
            
            // Set reload protection flags
            const refreshKey = 'tgstat_smart_reload_in_progress';
            const stateKey = 'tgstat_pre_reload_state';
            
            localStorage.setItem(refreshKey, 'true');
            localStorage.setItem(stateKey, JSON.stringify({
                autoMode: this.autoMode,
                isRunning: this.isRunning,
                currentCategoryIndex: this.currentCategoryIndex,
                categoryProgress: this.categoryProgress,
                smartRetryCount: this.smartRetryCount,
                pageReloadCount: this.pageReloadCount + 1,
                retryStartTime: this.retryStartTime,
                timestamp: Date.now(),
                reason: 'smart_reload'
            }));
            
            console.log('💾 State saved before smart reload');
            
            // Wait a moment for save to complete
            await this.delay(1000);
            
            // Perform the reload
            console.log('🔄 Executing page reload...');
            window.location.reload();
            
            // This will not execute as page reloads, but kept for completeness
            return true;
            
        } catch (error) {
            console.error('❌ Error during smart reload:', error);
            return false;
        }
    }

    async saveProgressBeforeReload() {
        try {
            console.log('💾 Saving comprehensive state before reload...');
            
            // Force save all current progress
            await this.saveProgress(true);
            
            // Save additional reload-specific state
            const reloadState = {
                timestamp: Date.now(),
                reason: 'smart_reload',
                retryContext: {
                    smartRetryCount: this.smartRetryCount,
                    pageReloadCount: this.pageReloadCount,
                    retryStartTime: this.retryStartTime,
                    isInRetryMode: this.isInRetryMode
                },
                stats: { ...this.stats },
                categoryProgress: { ...this.categoryProgress },
                autoMode: this.autoMode,
                isRunning: this.isRunning
            };
            
            await chrome.storage.local.set({
                'tgstat_reload_context': reloadState
            });
            
            console.log('✅ Reload context saved');
            
        } catch (error) {
            console.error('❌ Error saving state before reload:', error);
        }
    }

    async clearBrowserCache() {
        try {
            console.log('🧹 Attempting to clear browser cache...');
            
            // Clear various caches that might help
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
                console.log('✅ Service worker caches cleared');
            }
            
            // Clear sessionStorage
            sessionStorage.clear();
            console.log('✅ Session storage cleared');
            
            // Remove any problematic localStorage items (but keep our state)
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && !key.startsWith('tgstat_') && !key.startsWith('chrome-extension://')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            console.log(`✅ Cleared ${keysToRemove.length} localStorage items`);
              } catch (error) {
            console.error('⚠️ Error clearing cache:', error);
        }
    }

    getCurrentCategoryName() {
        if (this.currentCategory) {
            return this.currentCategory.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        }
          // Try to determine from URL
        const path = window.location.pathname;
        const category = path.split('/')[1] || 'unknown';
        return category.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    }

    // Debug method to check current state - accessible via console
    async debugState() {
        console.log('🔍 CURRENT SCRAPER STATE DEBUG:');
        console.log('=====================================');
        
        // Check saved state in storage
        const result = await chrome.storage.local.get([
            this.lastSavedStateKey,
            `${this.lastSavedStateKey}_backup`,
            this.dataStorageKey,
            this.categoryProgressKey,
            this.autoModeKey
        ]);
        
        console.log('📊 Current Memory State:', {
            isRunning: this.isRunning,
            autoMode: this.autoMode,
            currentPage: this.stats.currentPage,
            loadMoreCount: this.stats.loadMoreCount,
            pageCount: this.stats.pageCount,
            channelCount: this.stats.channelCount,
            lastOffset: this.stats.lastOffset,
            lastSuccessfulPage: this.stats.lastSuccessfulPage,
            category: this.categoryProgress.currentCategoryName,
            categoryIndex: this.currentCategoryIndex,
            scrapedDataLength: this.scrapedData.length
        });
        
        console.log('💾 Saved State in Storage:', {
            hasSavedState: !!result[this.lastSavedStateKey],
            hasBackupState: !!result[`${this.lastSavedStateKey}_backup`],
            savedStats: result[this.lastSavedStateKey]?.stats,
            savedDataLength: result[this.dataStorageKey]?.length || 0,
            categoryProgress: result[this.categoryProgressKey],
            autoMode: result[this.autoModeKey]
        });
        
        // Check localStorage for refresh state
        const refreshKey = 'tgstat_refresh_in_progress';
        const stateKey = 'tgstat_pre_refresh_state';
        const hasRefreshState = localStorage.getItem(refreshKey) === 'true';
        const preRefreshState = localStorage.getItem(stateKey);
        
        console.log('🔄 Refresh State:', {
            refreshInProgress: hasRefreshState,
            hasPreRefreshState: !!preRefreshState,
            preRefreshState: preRefreshState ? JSON.parse(preRefreshState) : null
        });
        
        // Check form fields
        const pageInput = document.querySelector('.lm-page');
        const offsetInput = document.querySelector('.lm-offset');
        
        console.log('📄 Form State:', {
            pageInputValue: pageInput?.value,
            offsetInputValue: offsetInput?.value,
            formDataPage: this.formData?.get('page'),
            formDataOffset: this.formData?.get('offset')
        });
        
        console.log('=====================================');
        console.log('🚀 Next actions that will happen:');
        console.log(`- Next page to load: ${this.stats.currentPage + 1}`);
        console.log(`- Next offset to load: ${this.stats.lastOffset + 20}`);
        console.log(`- Form is set to page: ${pageInput?.value}, offset: ${offsetInput?.value}`);
          return {
            memoryState: this.stats,
            savedState: result[this.lastSavedStateKey]?.stats,
            formState: { page: pageInput?.value, offset: offsetInput?.value }
        };
    }

    async checkForAutoStart() {
        try {
            // Check if we're in auto mode and should continue scraping
            const result = await chrome.storage.local.get([this.autoModeKey, this.progressStorageKey]);
            
            if (result[this.autoModeKey] && result[this.progressStorageKey]?.isRunning) {
                console.log('🚀 Auto-start detected: Resuming scraping in auto mode...');
                
                // Wait a bit more for page to fully load
                setTimeout(() => {
                    this.startScraping([], true);
                }, 3000);
            }
        } catch (error) {
            console.error('Error checking for auto start:', error);
        }
    }

    // ...existing code...
}

// Initialize scraper when content script loads
if (!window.tgstatScraperInitialized) {
    window.tgstatScraperInitialized = true;
    const scraper = new TGStatScraper();
      // Check if we're returning from a page refresh
    scraper.restoreStateAfterRefresh().then((wasRefresh) => {
        if (wasRefresh) {
            console.log('Resumed after page refresh');
            
            // If we were in auto mode and running, continue scraping
            if (scraper.autoMode && scraper.isRunning) {
                console.log('Auto-resuming scraping after refresh...');
                setTimeout(() => {
                    scraper.startScraping([], true); // Resume with auto mode
                }, 2000); // Give page time to fully load
            }
        } else {
            // Check if we should auto-start due to category navigation
            setTimeout(() => {
                scraper.checkForAutoStart();
            }, 1000);
        }
    });
      // Make scraper globally accessible for debugging
    window.tgstatScraper = scraper;
    
    // Add global debug functions
    window.debugTGStatState = () => scraper.debugState();
    window.debugTGStatScraper = scraper; // Full access to scraper
    
    console.log('🔧 DEBUG: Access scraper state with window.debugTGStatState() or window.debugTGStatScraper');
    
    // Show indicator when scraper starts (only add listener once)
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'START_SCRAPING') {
            addScraperIndicator();
        } else if (message.type === 'STOP_SCRAPING') {
            removeScraperIndicator();
        }
    });
}

// Add visual indicator when scraper is active
function addScraperIndicator() {
    if (document.getElementById('tgstat-scraper-indicator')) return;
    
    const indicator = document.createElement('div');
    indicator.id = 'tgstat-scraper-indicator';
    indicator.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; z-index: 10000; 
                    background: #28a745; color: white; padding: 10px 15px; 
                    border-radius: 5px; font-family: Arial, sans-serif; 
                    font-size: 14px; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">
            <div>🔄 TGStat Scraper Active</div>
            <div style="font-size: 12px; opacity: 0.9; margin-top: 5px;">
                Scraping channels... Check extension popup for progress
            </div>
        </div>
    `;
    document.body.appendChild(indicator);
}

// Remove indicator
function removeScraperIndicator() {
    const indicator = document.getElementById('tgstat-scraper-indicator');
    if (indicator) {
        indicator.remove();
    }
}
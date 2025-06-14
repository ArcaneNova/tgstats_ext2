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
        this.saveInterval = 5000;
        this.lastSaveTime = 0;
        this.offlineQueue = [];
        this.isOffline = false;
        this.batchSize = 20;
        this.processingQueue = [];
        this.maxQueueSize = 50000;
        
        // Enhanced error handling
        this.networkErrorCount = 0;
        this.maxNetworkErrors = 3;
        this.lastNetworkError = 0;
        this.networkRetryDelay = 5 * 60 * 1000; // 5 minutes
        this.loadMoreFailureCount = 0;
        this.maxLoadMoreFailures = 10; // Increased to 10 retries before giving up
        this.noDataRetryCount = 0;
        this.maxNoDataRetries = 15; // Retry 15 times if no data loads
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
        this.autoModeKey = 'tgstatAutoMode';
          this.initializeMessageListener();
        this.loadSavedProgress();
        this.startPeriodicCleanup();
        this.initializeFormData();
        this.checkOnlineStatus();
        this.setupConfirmationListener();
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
    }

    async processOfflineQueue() {
        if (this.offlineQueue.length > 0) {
            console.log(`Processing ${this.offlineQueue.length} items from offline queue`);
            for (const item of this.offlineQueue) {
                await this.processDataInChunks([item]);
            }
            this.offlineQueue = [];
            await this.saveProgress();
        }
    }    initializeMessageListener() {
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
                    break;
                case 'NAVIGATE_TO_CATEGORY':
                    this.navigateToCategory(message.categoryIndex).then(result => {
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
            }
            return false;
        } catch (error) {
            console.error('Error navigating to category:', error);
            return false;
        }
    }    initializeFormData() {
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
        try {
            const result = await chrome.storage.local.get([
                this.progressStorageKey,
                this.processedUrlsKey,
                this.lastSuccessfulPageKey,
                this.lastSuccessfulOffsetKey,
                this.existingIdsKey,
                this.formDataKey,
                this.lastSavedStateKey,
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
            }
              if (result[this.lastSavedStateKey]) {
                this.lastSavedState = result[this.lastSavedStateKey];
                // Restore stats completely from saved state to prevent double counting
                this.stats = { ...this.lastSavedState.stats };
                this.processedUrls = new Set(this.lastSavedState.processedUrls);
                this.existingIds = new Set(this.lastSavedState.existingIds);
                
                console.log('Loaded saved state with stats:', this.stats);// Load existing data
                if (result[this.dataStorageKey]) {
                    this.scrapedData = result[this.dataStorageKey];
                    console.log(`Loaded ${this.scrapedData.length} existing channels`);
                }
                  // Validate and fix pageCount vs currentPage consistency
                // currentPage should equal 1 + pageCount (since page 1 loads automatically)
                const expectedCurrentPage = 1 + this.stats.pageCount;
                if (this.stats.currentPage !== expectedCurrentPage) {
                    console.warn(`Inconsistent state detected. currentPage: ${this.stats.currentPage}, pageCount: ${this.stats.pageCount}. Expected currentPage: ${expectedCurrentPage}`);
                    
                    // Fix by adjusting pageCount to match currentPage
                    this.stats.pageCount = Math.max(0, this.stats.currentPage - 1);
                    console.log(`Fixed pageCount to: ${this.stats.pageCount}`);
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
    }async saveProgress() {
        try {
            const currentTime = Date.now();
            
            if (currentTime - this.lastSaveTime < this.saveInterval) {
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
            };

            await chrome.storage.local.set({
                [this.lastSavedStateKey]: stateSnapshot,
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
    }

    async restoreStateAfterRefresh() {
        try {
            const refreshKey = 'tgstat_refresh_in_progress';
            const stateKey = 'tgstat_pre_refresh_state';
            
            if (localStorage.getItem(refreshKey) === 'true') {
                console.log('Detected page refresh, restoring state...');
                
                const preRefreshStateStr = localStorage.getItem(stateKey);
                if (preRefreshStateStr) {
                    const preRefreshState = JSON.parse(preRefreshStateStr);
                    
                    // Restore basic state
                    this.autoMode = preRefreshState.autoMode;
                    this.currentCategoryIndex = preRefreshState.currentCategoryIndex;
                    this.categoryProgress = { ...preRefreshState.categoryProgress };
                    this.isRunning = preRefreshState.isRunning;
                    
                    // Clear the refresh flags
                    localStorage.removeItem(refreshKey);
                    localStorage.removeItem(stateKey);
                    
                    console.log('Pre-refresh state restored, loading full state...');
                    
                    // Load the full saved state
                    await this.loadSavedProgress();
                    
                    // Restore form fields to the correct position
                    await this.restoreFormFields();
                    
                    console.log('State fully restored after refresh');
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            console.error('Error restoring state after refresh:', error);
            return false;
        }
    }    async restoreFormFields() {
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
                });

                this.sendUpdate({
                    status: 'progress',
                    message: `Processed ${uniqueChunk.length} new channels (Total: ${this.stats.channelCount})`,
                    stats: this.stats
                });

                await this.saveProgress();

                if (this.stats.channelCount - this.stats.lastSaveCount >= this.autoSaveThreshold) {
                    await this.autoSaveData();
                }
            }

            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    async flushProcessingQueue() {
        if (this.processingQueue.length === 0) return;

        const dataToSave = [...this.processingQueue];
        this.processingQueue = [];

        try {
            const result = await chrome.storage.local.get([this.dataStorageKey]);
            const existingData = result[this.dataStorageKey] || [];
            
            // Ensure we don't have duplicates
            const uniqueData = dataToSave.filter(newItem => 
                !existingData.some(existingItem => existingItem.uniqueId === newItem.uniqueId)
            );
            
            const newData = [...existingData, ...uniqueData];

            await chrome.storage.local.set({ [this.dataStorageKey]: newData });
            this.scrapedData = newData;

            console.log(`Saved ${uniqueData.length} new channels. Total: ${newData.length}`);
        } catch (error) {
            console.error('Error flushing processing queue:', error);
            this.processingQueue = [...this.processingQueue, ...dataToSave];
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
                // First flush any remaining data in the processing queue
                await this.flushProcessingQueue();

                const result = await chrome.storage.local.get([this.dataStorageKey]);
                const data = result[this.dataStorageKey] || [];

                if (data.length > 0) {
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const categoryName = this.getCurrentCategoryName();
                    const filename = `tgstat_${categoryName}_${timestamp}_${data.length}items.json`;
                    
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    
                    await chrome.downloads.download({
                        url: url,
                        filename: filename,
                        saveAs: false
                    });

                    this.stats.lastSaveCount = this.stats.channelCount;
                    this.categoryProgress.categoryDataCount += data.length;
                    await this.saveProgress();

                    this.sendUpdate({
                        status: 'autosave',
                        message: `Auto-saved ${data.length} channels to ${filename}`,
                        stats: this.stats,
                        categoryProgress: this.categoryProgress
                    });

                    // Clear data after download to free memory
                    if (forceDownload) {
                        await chrome.storage.local.set({ [this.dataStorageKey]: [] });
                        this.scrapedData = [];
                        console.log('Cleared data after category completion');
                    }

                    this.cleanupMemory();
                }
            } catch (error) {
                console.error('Error auto-saving data:', error);
                this.sendUpdate({
                    status: 'error',
                    message: `Error auto-saving data: ${error.message}`
                });
            }
        }
    }    async startScraping(existingData = [], autoMode = false) {
        if (this.isRunning) return;
        
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
                    this.currentCategoryIndex = categoryIndex;
                    this.currentCategory = this.categories[categoryIndex];
                    this.categoryProgress.currentCategoryIndex = categoryIndex;
                    this.categoryProgress.currentCategoryName = this.currentCategory.name;
                    this.categoryProgress.currentCategoryUrl = this.currentCategory.url;
                    this.categoryProgress.categoryStartTime = new Date().toISOString();
                } else {
                    this.currentCategoryIndex = 0;
                    this.currentCategory = this.categories[0];
                }
            }
            
            // Load the most recent state
            await this.loadSavedProgress();
            
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
    }

    stopScraping() {
        this.isRunning = false;
        this.stopPeriodicCleanup();
        this.cleanupMemory();
        this.sendUpdate({
            status: 'completed',
            stats: this.stats
        });
    }    async scrapeAllChannels() {
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
                });// Scrape current page
                const newChannels = await this.scrapeCurrentPage();
                
                if (newChannels.length > 0) {
                    this.stats.channelCount += newChannels.length;
                    this.consecutiveEmptyPages = 0;
                    this.loadMoreFailureCount = 0; // Reset failure count on success
                    this.noDataRetryCount = 0; // Reset no data retry count on success
                    
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
                    retryCount = 0; // Reset retry count on success
                } else {
                    // Load more failed - handle with retry logic
                    const shouldContinue = await this.handleLoadMoreFailure();
                    if (shouldContinue) {
                        return; // Exit the loop
                    } else {
                        // Continue trying
                        await this.delay(2000);
                        continue;
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

            console.log('About to load page:', nextPageToLoad, 'Offset:', nextOffsetToLoad);

            // Save progress with current page info before loading more
            await this.saveProgress();

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
                
                await this.saveProgress();
                console.log('Successfully loaded new content. Now on page:', this.stats.currentPage, 'Load more count:', this.stats.loadMoreCount);            } else {
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
        return new Promise(resolve => setTimeout(resolve, ms));
    }    async resetProgress() {
        try {
            // Keep the existing IDs and processed URLs to prevent duplicates
            const existingIds = new Set(this.existingIds);
            const processedUrls = new Set(this.processedUrls);
            
            // Reset stats but keep channel count
            const channelCount = this.stats.channelCount;
            this.stats = {
                channelCount: channelCount,
                loadMoreCount: 0, // Reset to 0
                pageCount: 1, // Start from 1 
                currentPage: 1,
                lastOffset: 0,
                lastSaveCount: 0,
                lastSuccessfulPage: 1,
                lastSuccessfulOffset: 0
            };
            
            this.existingIds = existingIds;
            this.processedUrls = processedUrls;
            
            // Reset retry counters
            this.consecutiveEmptyPages = 0;
            this.loadMoreFailureCount = 0;
            this.networkErrorCount = 0;
            this.noDataRetryCount = 0;
            
            // Update form fields
            this.updateFormFields();
            
            // Save the reset state
            await this.saveProgress();
            
            this.sendUpdate({
                status: 'warning',
                message: 'Progress reset. Continuing from page 1...',
                stats: this.stats
            });
            
            console.log('Progress reset - all counters reset to initial values');
            return true;
        } catch (error) {
            console.error('Error resetting progress:', error);
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
        try {
            // Save current progress
            await this.saveProgress();
            
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
        this.noDataRetryCount++;
        
        console.log(`Load more failed. Attempt ${this.loadMoreFailureCount}/${this.maxLoadMoreFailures}, No data retries: ${this.noDataRetryCount}/${this.maxNoDataRetries}`);        // First, try multiple retries before giving up
        if (this.noDataRetryCount < this.maxNoDataRetries) {
            this.sendUpdate({
                status: 'warning',
                message: `No data loaded, retrying... (${this.noDataRetryCount}/${this.maxNoDataRetries})`,
                stats: this.stats,
                categoryProgress: this.categoryProgress
            });
            
            // Wait a bit and try again
            await this.delay(3000);
            return false; // Continue trying
        }
        
        // After max retries, show confirmation or auto-proceed
        if (this.loadMoreFailureCount >= this.maxLoadMoreFailures || this.noDataRetryCount >= this.maxNoDataRetries) {
            const currentCategoryData = this.categoryProgress.categoryDataCount || 0;
            const totalScraped = this.stats.channelCount;
            
            if (this.autoMode) {
                // In auto mode, save data and move to next category automatically
                this.sendUpdate({
                    status: 'category_complete',
                    message: `Category "${this.categoryProgress.currentCategoryName}" completed. Scraped ${currentCategoryData} items. Moving to next category...`,
                    stats: this.stats,
                    categoryProgress: this.categoryProgress
                });
                
                await this.moveToNextCategory();
                return true;
            } else {
                // In manual mode, show confirmation dialog
                const action = await this.showConfirmationDialog(
                    `Load more failed ${this.maxLoadMoreFailures} times and no new data after ${this.maxNoDataRetries} retries.<br><br>
                     Current category: ${this.categoryProgress.currentCategoryName}<br>
                     Data scraped this category: ${currentCategoryData} items<br>
                     Total scraped: ${totalScraped} items<br><br>
                     What would you like to do?`,
                    [
                        { text: 'Move to Next Category', action: 'CONTINUE_NEXT_CATEGORY', style: 'background: #28a745; color: white;' },
                        { text: 'Retry Current Page', action: 'RETRY_CURRENT_PAGE', style: 'background: #ffc107; color: black;' },
                        { text: 'Stop Scraping', action: 'STOP_SCRAPING', style: 'background: #dc3545; color: white;' }
                    ]
                );
                
                if (action === 'timeout') {
                    // Default action on timeout - move to next category
                    await this.moveToNextCategory();
                }
                return true;
            }
        }
        
        return false; // Continue trying
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
                    scraper.start();
                }, 2000); // Give page time to fully load
            }
        }
    });
    
    // Make scraper globally accessible for debugging
    window.tgstatScraper = scraper;
    
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
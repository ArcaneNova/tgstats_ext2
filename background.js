// Enhanced Background service worker for TGStat Scraper extension with persistent operation

class TGStatScraperBackground {
    constructor() {
        this.isScrapingActive = false;
        this.currentTabId = null;
        this.scrapingState = null;
        this.heartbeatInterval = null;
        this.keepAliveInterval = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.dataQueue = [];
        this.initializeListeners();
        this.startKeepAlive();
        this.setupPeriodicSave();
    }

    initializeListeners() {
        // Enhanced installation handler
        chrome.runtime.onInstalled.addListener((details) => {
            console.log('🚀 TGStat Scraper Pro installed/updated');
            this.setupAlarms();
            if (details.reason === 'install') {
                this.showWelcomeNotification();
            }
        });

        // Startup handler
        chrome.runtime.onStartup.addListener(() => {
            console.log('🔄 Extension startup - checking for active scraping');
            this.restoreScrapingState();
        });

        // Enhanced message handler with error recovery
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep message channel open for async responses
        });

        // Tab update handler for continuous operation
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete' && tab.url && tab.url.includes('tgstat.ru')) {
                this.handleTabUpdate(tabId, tab);
            }
        });

        // Tab close handler to prevent data loss
        chrome.tabs.onRemoved.addListener((tabId) => {
            if (tabId === this.currentTabId && this.isScrapingActive) {
                console.log('⚠️ Active scraping tab closed - attempting recovery');
                this.handleTabClosure();
            }
        });

        // Alarm handler for periodic operations
        chrome.alarms.onAlarm.addListener((alarm) => {
            this.handleAlarm(alarm);
        });
    }

    setupAlarms() {
        // Clear existing alarms
        chrome.alarms.clearAll();
        
        // Set up periodic save alarm every 30 seconds
        chrome.alarms.create('periodicSave', { 
            delayInMinutes: 0.5, 
            periodInMinutes: 0.5 
        });
        
        // Set up heartbeat alarm every 2 minutes
        chrome.alarms.create('heartbeat', { 
            delayInMinutes: 2, 
            periodInMinutes: 2 
        });
        
        // Set up data backup alarm every 5 minutes
        chrome.alarms.create('dataBackup', { 
            delayInMinutes: 5, 
            periodInMinutes: 5 
        });
        
        console.log('⏰ Alarms set up for persistent operation');
    }

    startKeepAlive() {
        // Keep service worker alive indefinitely
        this.keepAliveInterval = setInterval(() => {
            console.log('💓 Service worker keep-alive heartbeat');
            // Touch storage to keep worker active
            chrome.storage.local.get(['keepAlive'], () => {
                chrome.storage.local.set({ 
                    keepAlive: Date.now(),
                    workerStatus: 'active'
                });
            });
        }, 25000); // Every 25 seconds to prevent worker termination
    }

    async handleTabUpdate(tabId, tab) {
        try {
            // Only inject if scraping is active or if it's a new tgstat tab
            if (this.isScrapingActive || tab.url.includes('tgstat.ru')) {
                // Inject content script with error handling
                try {
                    await chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        files: ['content.js']
                    });
                    
                    // If this was our active scraping tab, restore state
                    if (this.isScrapingActive && this.scrapingState) {
                        await this.restoreScrapingInTab(tabId);
                    }
                } catch (error) {
                    console.log('Content script injection failed (may already be injected):', error);
                }
            }
        } catch (error) {
            console.error('Error handling tab update:', error);
        }
    }

    async handleTabClosure() {
        try {
            console.log('🔄 Handling tab closure - opening new tab to continue scraping');
            
            // Find or create a new tgstat tab
            const tabs = await chrome.tabs.query({ url: 'https://tgstat.ru/*' });
            
            let targetTabId;
            if (tabs.length > 0) {
                // Use existing tgstat tab
                targetTabId = tabs[0].id;
                await chrome.tabs.update(targetTabId, { active: true });
            } else {
                // Create new tab
                const newTab = await chrome.tabs.create({ 
                    url: this.scrapingState?.currentUrl || 'https://tgstat.ru/blogs',
                    active: true 
                });
                targetTabId = newTab.id;
            }
            
            this.currentTabId = targetTabId;
            
            // Wait for tab to load then restore scraping
            setTimeout(async () => {
                await this.restoreScrapingInTab(targetTabId);
            }, 3000);
            
        } catch (error) {
            console.error('Error handling tab closure:', error);
        }
    }

    async restoreScrapingInTab(tabId) {
        try {
            // Send restore message to content script
            await chrome.tabs.sendMessage(tabId, {
                type: 'RESTORE_SCRAPING_STATE',
                state: this.scrapingState
            });
            
            console.log('✅ Scraping state restored in tab', tabId);
        } catch (error) {
            console.error('Error restoring scraping state:', error);
            // Retry in 5 seconds
            setTimeout(() => this.restoreScrapingInTab(tabId), 5000);
        }
    }

    async handleMessage(message, sender, sendResponse) {
        try {
            console.log('📨 Background received message:', message.type);
            
            switch (message.type) {
                case 'START_SCRAPING':
                    await this.startScrapingSession(sender.tab.id, message.data);
                    sendResponse({ success: true });
                    break;
                
                case 'STOP_SCRAPING':
                    await this.stopScrapingSession();
                    sendResponse({ success: true });
                    break;
                
                case 'SCRAPING_UPDATE':
                    await this.handleScrapingUpdate(message.data);
                    sendResponse({ success: true });
                    break;
                
                case 'SCRAPER_UPDATE':
                    // Forward the message to the popup if it's open
                    chrome.runtime.sendMessage(message).catch(() => {
                        console.log('Popup not open, storing update');
                    });
                    break;
                
                case 'HEARTBEAT':
                    this.handleHeartbeat(sender.tab.id, message.data);
                    sendResponse({ success: true, timestamp: Date.now() });
                    break;
                
                case 'QUEUE_DATA':
                    await this.queueData(message.data);
                    sendResponse({ success: true });
                    break;
                
                case 'GET_STORAGE_DATA':
                    const data = await this.getStorageData();
                    sendResponse({ success: true, data });
                    break;
                
                case 'SAVE_STORAGE_DATA':
                    await this.saveStorageData(message.data);
                    sendResponse({ success: true });
                    break;
                
                case 'CLEAR_STORAGE_DATA':
                    await this.clearStorageData();
                    sendResponse({ success: true });
                    break;
                  case 'DOWNLOAD_DATA':
                    const downloadResult = await this.downloadData(message.data);
                    sendResponse(downloadResult);
                    break;
                
                case 'downloadCategoryData':
                    const categoryDownloadResult = await this.downloadCategoryData(message.data);
                    sendResponse(categoryDownloadResult);
                    break;
                
                case 'EMERGENCY_SAVE':
                    await this.emergencySave(message.data);
                    sendResponse({ success: true });
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

    async startScrapingSession(tabId, data) {
        try {
            console.log('🚀 Starting scraping session in background');
            this.isScrapingActive = true;
            this.currentTabId = tabId;
            this.scrapingState = {
                startTime: Date.now(),
                currentUrl: data.currentUrl,
                stats: data.stats || {},
                categoryProgress: data.categoryProgress || {},
                autoMode: data.autoMode || false
            };
            
            // Save to storage
            await chrome.storage.local.set({
                'scrapingActive': true,
                'scrapingState': this.scrapingState,
                'currentTabId': tabId
            });
            
            // Start heartbeat monitoring
            this.startHeartbeat();
            
            console.log('✅ Scraping session started');
        } catch (error) {
            console.error('Error starting scraping session:', error);
        }
    }

    async stopScrapingSession() {
        try {
            console.log('🛑 Stopping scraping session');
            this.isScrapingActive = false;
            this.currentTabId = null;
            this.scrapingState = null;
            
            // Clear from storage
            await chrome.storage.local.remove([
                'scrapingActive',
                'scrapingState', 
                'currentTabId'
            ]);
            
            // Stop heartbeat
            this.stopHeartbeat();
            
            console.log('✅ Scraping session stopped');
        } catch (error) {
            console.error('Error stopping scraping session:', error);
        }
    }

    async handleScrapingUpdate(data) {
        try {
            if (this.isScrapingActive) {
                // Update scraping state
                this.scrapingState = {
                    ...this.scrapingState,
                    ...data,
                    lastUpdate: Date.now()
                };
                
                // Save updated state
                await chrome.storage.local.set({
                    'scrapingState': this.scrapingState
                });
                
                // Queue any new data
                if (data.newChannels && data.newChannels.length > 0) {
                    await this.queueData(data.newChannels);
                }
            }
        } catch (error) {
            console.error('Error handling scraping update:', error);
        }
    }

    startHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        
        this.heartbeatInterval = setInterval(async () => {
            if (this.isScrapingActive && this.currentTabId) {
                try {
                    // Send heartbeat to content script
                    await chrome.tabs.sendMessage(this.currentTabId, {
                        type: 'BACKGROUND_HEARTBEAT',
                        timestamp: Date.now()
                    });
                    
                    this.reconnectAttempts = 0; // Reset on success
                } catch (error) {
                    console.log('Heartbeat failed, attempting reconnection');
                    this.handleHeartbeatFailure();
                }
            }
        }, 30000); // Every 30 seconds
    }

    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    async handleHeartbeatFailure() {
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts <= this.maxReconnectAttempts) {
            console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            
            // Try to find the tab and restore connection
            try {
                const tab = await chrome.tabs.get(this.currentTabId);
                if (tab) {
                    // Tab exists, try to restore scraping
                    await this.restoreScrapingInTab(this.currentTabId);
                } else {
                    // Tab doesn't exist, create new one
                    await this.handleTabClosure();
                }
            } catch (error) {
                // Tab doesn't exist, create new one
                await this.handleTabClosure();
            }
        } else {
            console.error('❌ Max reconnection attempts reached, stopping scraping');
            await this.stopScrapingSession();
        }
    }

    handleHeartbeat(tabId, data) {
        if (tabId === this.currentTabId) {
            console.log('💓 Heartbeat received from content script');
            this.reconnectAttempts = 0;
            
            // Update scraping state with heartbeat data
            if (data) {
                this.scrapingState = {
                    ...this.scrapingState,
                    ...data,
                    lastHeartbeat: Date.now()
                };
            }
        }
    }

    async queueData(newChannels) {
        try {
            // Add to queue
            this.dataQueue.push(...newChannels);
            
            // Process queue if it's getting large
            if (this.dataQueue.length >= 1000) {
                await this.processDataQueue();
            }
        } catch (error) {
            console.error('Error queuing data:', error);
        }
    }

    async processDataQueue() {
        if (this.dataQueue.length === 0) return;
        
        try {
            console.log(`📦 Processing data queue: ${this.dataQueue.length} items`);
            
            // Get existing data
            const result = await chrome.storage.local.get(['tgstatData']);
            const existingData = result.tgstatData || [];
            
            // Merge with queue data (remove duplicates)
            const existingIds = new Set(existingData.map(item => item.uniqueId));
            const newData = this.dataQueue.filter(item => !existingIds.has(item.uniqueId));
            
            if (newData.length > 0) {
                const updatedData = [...existingData, ...newData];
                await chrome.storage.local.set({ tgstatData: updatedData });
                console.log(`✅ Saved ${newData.length} new channels to storage`);
            }
            
            // Clear queue
            this.dataQueue = [];
            
        } catch (error) {
            console.error('Error processing data queue:', error);
        }
    }

    async handleAlarm(alarm) {
        try {
            switch (alarm.name) {
                case 'periodicSave':
                    await this.periodicSave();
                    break;
                case 'heartbeat':
                    // Additional heartbeat logic if needed
                    break;
                case 'dataBackup':
                    await this.createDataBackup();
                    break;
            }
        } catch (error) {
            console.error('Error handling alarm:', error);
        }
    }

    async periodicSave() {
        try {
            // Process any queued data
            await this.processDataQueue();
            
            // Update last save timestamp
            await chrome.storage.local.set({ 
                lastPeriodicSave: Date.now(),
                workerStatus: 'active'
            });
            
            console.log('💾 Periodic save completed');
        } catch (error) {
            console.error('Error in periodic save:', error);
        }
    }

    async createDataBackup() {
        try {
            const result = await chrome.storage.local.get(['tgstatData', 'tgstatStats']);
            if (result.tgstatData && result.tgstatData.length > 0) {
                // Create backup with timestamp
                const backup = {
                    data: result.tgstatData,
                    stats: result.tgstatStats,
                    timestamp: Date.now(),
                    count: result.tgstatData.length
                };
                
                await chrome.storage.local.set({ 
                    [`dataBackup_${Date.now()}`]: backup 
                });
                
                console.log(`📋 Data backup created: ${result.tgstatData.length} items`);
                
                // Clean old backups (keep only last 5)
                await this.cleanOldBackups();
            }
        } catch (error) {
            console.error('Error creating data backup:', error);
        }
    }

    async cleanOldBackups() {
        try {
            const allKeys = await chrome.storage.local.get();
            const backupKeys = Object.keys(allKeys).filter(key => key.startsWith('dataBackup_'));
            
            if (backupKeys.length > 5) {
                // Sort by timestamp and remove oldest
                backupKeys.sort((a, b) => {
                    const timestampA = parseInt(a.split('_')[1]);
                    const timestampB = parseInt(b.split('_')[1]);
                    return timestampA - timestampB;
                });
                
                const keysToRemove = backupKeys.slice(0, backupKeys.length - 5);
                await chrome.storage.local.remove(keysToRemove);
                
                console.log(`🗑️ Cleaned ${keysToRemove.length} old backups`);
            }
        } catch (error) {
            console.error('Error cleaning old backups:', error);
        }
    }

    async restoreScrapingState() {
        try {
            const result = await chrome.storage.local.get([
                'scrapingActive', 
                'scrapingState', 
                'currentTabId'
            ]);
            
            if (result.scrapingActive && result.scrapingState) {
                console.log('🔄 Restoring scraping state from storage');
                
                this.isScrapingActive = true;
                this.scrapingState = result.scrapingState;
                this.currentTabId = result.currentTabId;
                
                // Try to reconnect to the tab
                if (this.currentTabId) {
                    try {
                        const tab = await chrome.tabs.get(this.currentTabId);
                        if (tab && tab.url.includes('tgstat.ru')) {
                            await this.restoreScrapingInTab(this.currentTabId);
                            this.startHeartbeat();
                        } else {
                            await this.handleTabClosure();
                        }
                    } catch (error) {
                        // Tab doesn't exist, create new one
                        await this.handleTabClosure();
                    }
                }
            }
        } catch (error) {
            console.error('Error restoring scraping state:', error);
        }
    }

    setupPeriodicSave() {
        // Additional periodic save every 60 seconds
        setInterval(async () => {
            if (this.isScrapingActive) {
                await this.periodicSave();
            }
        }, 60000);
    }

    async emergencySave(data) {
        try {
            console.log('🚨 Emergency save triggered');
            
            // Save all provided data immediately
            const backupKey = `emergencyBackup_${Date.now()}`;
            await chrome.storage.local.set({
                [backupKey]: {
                    ...data,
                    timestamp: Date.now(),
                    type: 'emergency'
                }
            });
            
            // Also process any queued data
            await this.processDataQueue();
            
            console.log('✅ Emergency save completed');
        } catch (error) {
            console.error('Error in emergency save:', error);
        }
    }

    async getStorageData() {
        try {
            const result = await chrome.storage.local.get(['tgstatData', 'tgstatStats']);
            return {
                channels: result.tgstatData || [],
                stats: result.tgstatStats || { channelCount: 0, loadMoreCount: 0, pageCount: 0 }
            };
        } catch (error) {
            console.error('Error getting storage data:', error);
            throw error;
        }
    }

    async saveStorageData(data) {
        try {
            await chrome.storage.local.set({
                tgstatData: data.channels || [],
                tgstatStats: data.stats || { channelCount: 0, loadMoreCount: 0, pageCount: 0 }
            });
        } catch (error) {
            console.error('Error saving storage data:', error);
            throw error;
        }
    }

    async clearStorageData() {
        try {
            await chrome.storage.local.clear();
        } catch (error) {
            console.error('Error clearing storage data:', error);
            throw error;
        }
    }

    showWelcomeNotification() {
        // Show a welcome notification (if notifications permission is available)
        if (chrome.notifications) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icon48.png',
                title: 'TGStat Scraper Pro Installed',
                message: 'Enhanced scraper with zero data loss protection! Navigate to tgstat.ru to start.'
            });
        }
    }

    async downloadData(downloadRequest) {
        try {
            const { data, filename } = downloadRequest;
            
            if (!data || data.length === 0) {
                return { success: false, error: 'No data to download' };
            }
            
            // Convert data to base64 data URL for service worker compatibility
            const jsonString = JSON.stringify(data, null, 2);
            const base64Data = btoa(unescape(encodeURIComponent(jsonString)));
            const dataUrl = `data:application/json;base64,${base64Data}`;
            
            const downloadId = await chrome.downloads.download({
                url: dataUrl,
                filename: filename,
                saveAs: false
            });
            
            console.log(`📥 Downloaded ${data.length} items as ${filename}`);
            return { success: true, downloadId: downloadId };
            
        } catch (error) {
            console.error('Error downloading data:', error);
            return { success: false, error: error.message };
        }
    }

    async downloadCategoryData(downloadRequest) {
        try {
            const { data, filename, format } = downloadRequest;
            
            if (!data || data.length === 0) {
                return { success: false, error: 'No data to download' };
            }
            
            let content, mimeType, finalFilename;
            
            if (format === 'csv') {
                // Convert to CSV format
                content = this.convertToCSV(data);
                mimeType = 'text/csv';
                finalFilename = filename.replace('.json', '.csv');
            } else {
                // Use JSON format
                content = JSON.stringify(data, null, 2);
                mimeType = 'application/json';
                finalFilename = filename;
            }
            
            // Convert data to base64 data URL for service worker compatibility
            const base64Data = btoa(unescape(encodeURIComponent(content)));
            const dataUrl = `data:${mimeType};base64,${base64Data}`;
            
            const downloadId = await chrome.downloads.download({
                url: dataUrl,
                filename: finalFilename,
                saveAs: false
            });
            
            console.log(`📥 Downloaded ${data.length} items as ${finalFilename}`);
            return { success: true, downloadId: downloadId };
            
        } catch (error) {
            console.error('Error downloading category data:', error);
            return { success: false, error: error.message };
        }
    }
    
    convertToCSV(data) {
        if (data.length === 0) return '';
        
        // Get headers
        const headers = Object.keys(data[0]);
        
        // Create CSV rows
        const csvRows = [];
        
        // Add header row
        csvRows.push(headers.join(','));
        
        // Add data rows
        for (const row of data) {
            const values = headers.map(header => {
                const value = row[header] || '';
                // Escape quotes and wrap in quotes if needed
                if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            });
            csvRows.push(values.join(','));
        }
        
        return csvRows.join('\n');
    }
}

// Initialize background service worker
console.log('🚀 Initializing TGStat Scraper Pro background service worker');
const scraperBackground = new TGStatScraperBackground();
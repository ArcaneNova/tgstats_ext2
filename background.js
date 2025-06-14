// Background service worker for TGStat Scraper extension

class TGStatScraperBackground {
    constructor() {
        this.initializeListeners();
    }

    initializeListeners() {
        // Handle extension installation
        chrome.runtime.onInstalled.addListener((details) => {
            if (details.reason === 'install') {
                console.log('TGStat Scraper extension installed');
                this.showWelcomeNotification();
            } else if (details.reason === 'update') {
                console.log('TGStat Scraper extension updated');
            }
        });

        // Handle messages from content script and popup
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep message channel open for async responses
        });        // Handle tab updates to check if user navigates away from tgstat.ru
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete' && tab.url && tab.url.includes('tgstat.ru')) {
                // Only inject if not already injected - prevent duplicate injection
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['content.js']
                }).catch(error => {
                    console.log('Content script already injected or injection failed:', error);
                });
            }
        });
    }

    async handleMessage(message, sender, sendResponse) {
        try {
            switch (message.type) {
                case 'SCRAPER_UPDATE':
                    // Forward the message to the popup if it's open
                    chrome.runtime.sendMessage(message).catch(error => {
                        console.log('Error forwarding message to popup:', error);
                    });
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
                
                default:
                    console.log('Unknown message type:', message.type);
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({ success: false, error: error.message });
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
    }    showWelcomeNotification() {
        // Show a welcome notification (if notifications permission is available)
        if (chrome.notifications) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icon48.png',
                title: 'TGStat Scraper Installed',
                message: 'Navigate to tgstat.ru/blogs and click the extension icon to start scraping!'
            });
        }
    }

    // Clean up old data periodically (runs when extension starts)
    async cleanupOldData() {
        try {
            const result = await chrome.storage.local.get(['tgstatData']);
            if (result.tgstatData && Array.isArray(result.tgstatData)) {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                
                const filteredData = result.tgstatData.filter(channel => {
                    const scrapedDate = new Date(channel.scrapedAt);
                    return scrapedDate > thirtyDaysAgo;
                });

                if (filteredData.length !== result.tgstatData.length) {
                    await chrome.storage.local.set({ tgstatData: filteredData });
                    console.log(`Cleaned up ${result.tgstatData.length - filteredData.length} old records`);
                }
            }
        } catch (error) {
            console.error('Error cleaning up old data:', error);
        }
    }
}

// Initialize background service worker
const scraperBackground = new TGStatScraperBackground();

// Clean up old data when service worker starts
scraperBackground.cleanupOldData();
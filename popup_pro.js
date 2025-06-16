
class TGStatScraperPopupPro {
    constructor() {
        this.isRunning = false;
        this.autoMode = false;
        this.scrapedData = [];
        this.stats = {
            channelCount: 0,
            loadMoreCount: 0,
            pageCount: 0,
            currentPage: 1,
            lastOffset: 0,
            averagePageTime: 0,
            totalProcessingTime: 0
        };
        this.categoryProgress = {
            currentCategoryIndex: 0,
            currentCategoryName: '',
            currentCategoryUrl: '',
            categoryStartTime: null,
            categoryDataCount: 0,
            totalCategoriesCompleted: 0
        };
        this.categories = [];
        
        this.dataStorageKey = 'tgstatData';
        this.statsStorageKey = 'tgstatStats';
        this.stateStorageKey = 'tgstatState';
        
        this.initializeElements();
        this.bindEvents();
        this.loadStoredData();
        this.checkTabUrl();
        this.checkScraperStatus();
        this.loadCategories();
        this.setupRealTimeUpdates();
    }

    initializeElements() {
        this.elements = {
            status: document.getElementById('status'),
            stats: document.getElementById('stats'),
            startBtn: document.getElementById('startBtn'),
            startAutoBtn: document.getElementById('startAutoBtn'),
            stopBtn: document.getElementById('stopBtn'),
            downloadBtn: document.getElementById('downloadBtn'),
            clearBtn: document.getElementById('clearBtn'),
            channelCount: document.getElementById('channelCount'),
            loadMoreCount: document.getElementById('loadMoreCount'),
            pageCount: document.getElementById('pageCount'),
            progressFill: document.getElementById('progressFill'),
            downloadOptions: document.getElementById('downloadOptions'),
            downloadJson: document.getElementById('downloadJson'),
            downloadCsv: document.getElementById('downloadCsv'),
            warning: document.getElementById('warning'),
            resetBtn: document.getElementById('resetBtn'),
            categoryInfo: document.getElementById('categoryInfo'),
            categorySelect: document.getElementById('categorySelect'),
            navigateBtn: document.getElementById('navigateBtn'),
            startPageInput: document.getElementById('startPageInput'),
            setStartPageBtn: document.getElementById('setStartPageBtn'),
            setCurrentPageBtn: document.getElementById('setCurrentPageBtn'),
            setCurrentPlus5Btn: document.getElementById('setCurrentPlus5Btn'),
            setCurrentPlus10Btn: document.getElementById('setCurrentPlus10Btn'),
            
            // Performance indicators
            averageTime: document.getElementById('averageTime'),
            totalTime: document.getElementById('totalTime'),
            currentCategory: document.getElementById('currentCategory'),
            categoriesProgress: document.getElementById('categoriesProgress')
        };
    }

    async checkScraperStatus() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && tab.url && tab.url.includes('tgstat.ru')) {
                const response = await chrome.tabs.sendMessage(tab.id, { type: 'CHECK_STATUS' });
                if (response && response.isRunning) {
                    this.isRunning = true;
                    this.autoMode = response.autoMode || false;
                    this.categoryProgress = response.categoryProgress || this.categoryProgress;
                    this.stats = response.stats || this.stats;
                    this.updateUI(true);
                    this.updateStatus('Scraping in progress...', 'running');
                    this.updateCategoryInfo(this.categoryProgress);
                    this.updatePerformanceMetrics();
                }
            }
        } catch (error) {
            console.error('Error checking scraper status:', error);
        }
    }

    bindEvents() {
        // Enhanced event binding with error handling
        this.safeBindEvent(this.elements.startBtn, 'click', () => this.startScraping(false));
        this.safeBindEvent(this.elements.startAutoBtn, 'click', () => this.startScraping(true));
        this.safeBindEvent(this.elements.stopBtn, 'click', () => this.stopScraping());
        this.safeBindEvent(this.elements.downloadBtn, 'click', () => this.toggleDownloadOptions());
        this.safeBindEvent(this.elements.clearBtn, 'click', () => this.clearData());
        this.safeBindEvent(this.elements.resetBtn, 'click', () => this.resetProgress());
        this.safeBindEvent(this.elements.downloadJson, 'click', () => this.downloadData('json'));
        this.safeBindEvent(this.elements.downloadCsv, 'click', () => this.downloadData('csv'));
        this.safeBindEvent(this.elements.navigateBtn, 'click', () => this.navigateToCategory());
        this.safeBindEvent(this.elements.setStartPageBtn, 'click', () => this.setStartPage());
        this.safeBindEvent(this.elements.setCurrentPageBtn, 'click', () => this.setQuickStartPage(0));
        this.safeBindEvent(this.elements.setCurrentPlus5Btn, 'click', () => this.setQuickStartPage(5));
        this.safeBindEvent(this.elements.setCurrentPlus10Btn, 'click', () => this.setQuickStartPage(10));

        // Listen for updates from content script
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'SCRAPER_UPDATE') {
                this.handleScraperUpdate(message.data);
            }
        });
    }

    safeBindEvent(element, event, handler) {
        if (element) {
            element.addEventListener(event, handler);
        }
    }

    setupRealTimeUpdates() {
        // Update UI every 2 seconds when scraping is active
        setInterval(() => {
            if (this.isRunning) {
                this.updateStatsDisplay();
                this.updatePerformanceMetrics();
            }
        }, 2000);
    }

    async checkTabUrl() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && tab.url && tab.url.includes('tgstat.ru')) {
                this.elements.warning.style.display = 'none';
                this.elements.startBtn.disabled = false;
                if (this.elements.startAutoBtn) {
                    this.elements.startAutoBtn.disabled = false;
                }
            } else {
                this.elements.warning.style.display = 'block';
                this.elements.startBtn.disabled = true;
                if (this.elements.startAutoBtn) {
                    this.elements.startAutoBtn.disabled = true;
                }
            }
        } catch (error) {
            console.error('Error checking tab URL:', error);
        }
    }

    async loadStoredData() {
        try {
            const result = await chrome.storage.local.get([
                this.dataStorageKey,
                this.statsStorageKey,
                this.stateStorageKey
            ]);

            // Load scraped data
            if (result[this.dataStorageKey]) {
                this.scrapedData = result[this.dataStorageKey];
                this.elements.downloadBtn.style.display = this.scrapedData.length > 0 ? 'inline-block' : 'none';
            }

            // Load stats
            if (result[this.statsStorageKey]) {
                this.stats = { ...this.stats, ...result[this.statsStorageKey] };
            }

            // Load state
            if (result[this.stateStorageKey]) {
                const state = result[this.stateStorageKey];
                this.stats = { ...this.stats, ...state.stats };
                this.categoryProgress = { ...this.categoryProgress, ...state.categoryProgress };
                this.autoMode = state.autoMode || false;
            }

            this.updateStatsDisplay();
            this.updateCategoryInfo(this.categoryProgress);
            this.updatePerformanceMetrics();

        } catch (error) {
            console.error('Error loading stored data:', error);
        }
    }

    async startScraping(autoMode = false) {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab.url.includes('tgstat.ru')) {
                throw new Error('Please navigate to tgstat.ru before starting the scraper.');
            }

            // Get existing data
            const result = await chrome.storage.local.get([this.dataStorageKey]);
            const existingData = result[this.dataStorageKey] || [];

            // Ensure content script is injected
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content.js']
                });
            } catch (error) {
                console.log('Content script already injected:', error);
            }

            // Wait for content script to initialize
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Send start message
            const messageType = autoMode ? 'START_AUTO_SCRAPING' : 'START_SCRAPING';
            await chrome.tabs.sendMessage(tab.id, {
                type: messageType,
                existingData: existingData
            });

            this.isRunning = true;
            this.autoMode = autoMode;
            this.updateUI(true);
            
            this.updateStatus(
                autoMode ? 'Starting autonomous scraping across all categories...' : 'Starting manual scraping...', 
                'running'
            );

        } catch (error) {
            console.error('Error starting scraper:', error);
            this.showError(error.message);
        }
    }

    async stopScraping() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            try {
                await chrome.tabs.sendMessage(tab.id, { type: 'STOP_SCRAPING' });
            } catch (error) {
                console.log('Error sending stop message:', error);
            }
            
            this.isRunning = false;
            this.updateStatus('Scraping stopped', 'idle');
            this.updateUI(false);
            
        } catch (error) {
            console.error('Error stopping scraper:', error);
        }
    }

    async handleScraperUpdate(data) {
        try {
            // Update stats
            if (data.stats) {
                this.stats = { ...this.stats, ...data.stats };
                this.updateStatsDisplay();
                this.updatePerformanceMetrics();
            }

            // Update category progress
            if (data.categoryProgress) {
                this.categoryProgress = { ...this.categoryProgress, ...data.categoryProgress };
                this.updateCategoryInfo(this.categoryProgress);
            }

            // Update auto mode status
            if (data.autoMode !== undefined) {
                this.autoMode = data.autoMode;
                this.updateUI(this.isRunning);
            }

            // Handle status updates
            if (data.status) {
                this.handleStatusUpdate(data);
            }

            // Handle new channels
            if (data.newChannels) {
                this.scrapedData = this.scrapedData.concat(data.newChannels);
                this.saveData();
            }

        } catch (error) {
            console.error('Error handling scraper update:', error);
        }
    }

    handleStatusUpdate(data) {
        const statusMessages = {
            'scraping': () => {
                this.updateStatus(data.message || 'Scraping in progress...', 'running');
                this.updateUI(true);
            },
            'completed': () => {
                this.updateStatus('Scraping completed!', 'success');
                this.updateUI(false);
                this.isRunning = false;
            },
            'error': () => {
                this.updateStatus(data.message || 'An error occurred', 'error');
                this.updateUI(false);
                this.isRunning = false;
            },
            'warning': () => {
                this.updateStatus(data.message, 'warning');
            },
            'progress': () => {
                this.updateStatus(data.message, 'running');
            },
            'category_change': () => {
                this.updateStatus(data.message, 'running');
                this.updateCategoryInfo(data.categoryProgress);
            },
            'autosave': () => {
                this.updateStatus(data.message, 'success');
                // Show success briefly, then return to scraping status
                setTimeout(() => {
                    if (this.isRunning) {
                        this.updateStatus('Scraping in progress...', 'running');
                    }
                }, 3000);
            }
        };

        const handler = statusMessages[data.status];
        if (handler) {
            handler();
        }
    }

    updateStatsDisplay(stats = null) {
        const currentStats = stats || this.stats;
        
        this.safeUpdateElement(this.elements.channelCount, currentStats.channelCount?.toLocaleString() || '0');
        this.safeUpdateElement(this.elements.loadMoreCount, currentStats.loadMoreCount?.toLocaleString() || '0');
        this.safeUpdateElement(this.elements.pageCount, currentStats.pageCount?.toLocaleString() || '0');
        
        // Update start page input placeholder
        if (this.elements.startPageInput && currentStats.currentPage) {
            this.elements.startPageInput.placeholder = `Current: ${currentStats.currentPage}`;
        }
        
        // Update progress bar
        if (this.elements.progressFill) {
            const progress = Math.min((currentStats.currentPage / Math.max(currentStats.currentPage + 1, 1)) * 100, 100);
            this.elements.progressFill.style.width = `${progress}%`;
        }
        
        // Show stats section when there's data
        if (this.elements.stats && (currentStats.channelCount > 0 || this.isRunning)) {
            this.elements.stats.style.display = 'block';
        }
    }

    updatePerformanceMetrics() {
        if (this.stats.averagePageTime) {
            const avgTimeSeconds = Math.round(this.stats.averagePageTime / 1000);
            this.safeUpdateElement(this.elements.averageTime, `${avgTimeSeconds}s/page`);
        }

        if (this.stats.totalProcessingTime) {
            const totalMinutes = Math.round(this.stats.totalProcessingTime / 60000);
            this.safeUpdateElement(this.elements.totalTime, `${totalMinutes}m total`);
        }
    }

    safeUpdateElement(element, value) {
        if (element) {
            element.textContent = value;
        }
    }

    updateStatus(message, type) {
        if (this.elements.status) {
            this.elements.status.textContent = message;
            this.elements.status.className = `status ${type}`;
        }
    }

    updateUI(isRunning) {
        // Button visibility
        this.safeToggleDisplay(this.elements.startBtn, !isRunning);
        this.safeToggleDisplay(this.elements.startAutoBtn, !isRunning);
        this.safeToggleDisplay(this.elements.stopBtn, isRunning);
        this.safeToggleDisplay(this.elements.resetBtn, isRunning);
        
        // Stats visibility
        this.safeToggleDisplay(this.elements.stats, isRunning || this.stats.channelCount > 0);
        
        // Download button (only when not running and has data)
        this.safeToggleDisplay(this.elements.downloadBtn, !isRunning && this.scrapedData.length > 0);
        
        // Category info (only in auto mode when running)
        this.safeToggleDisplay(this.elements.categoryInfo, isRunning && this.autoMode);
    }

    safeToggleDisplay(element, show) {
        if (element) {
            element.style.display = show ? 'inline-block' : 'none';
        }
    }

    updateCategoryInfo(categoryProgress) {
        if (this.elements.categoryInfo && categoryProgress) {
            this.elements.categoryInfo.innerHTML = `
                <div style="font-size: 12px; color: #666; margin-bottom: 10px;">
                    <div><strong>Current:</strong> ${categoryProgress.currentCategoryName || 'Unknown'}</div>
                    <div><strong>Progress:</strong> ${(categoryProgress.currentCategoryIndex || 0) + 1} / ${this.categories.length || 46}</div>
                    <div><strong>Category Data:</strong> ${(categoryProgress.categoryDataCount || 0).toLocaleString()} items</div>
                    <div><strong>Completed:</strong> ${categoryProgress.totalCategoriesCompleted || 0} categories</div>
                </div>
            `;
        }

        // Update individual elements if they exist
        this.safeUpdateElement(this.elements.currentCategory, categoryProgress.currentCategoryName || 'Unknown');
        
        if (this.elements.categoriesProgress) {
            const current = (categoryProgress.currentCategoryIndex || 0) + 1;
            const total = this.categories.length || 46;
            this.safeUpdateElement(this.elements.categoriesProgress, `${current}/${total}`);
        }
    }

    toggleDownloadOptions() {
        if (this.elements.downloadOptions) {
            const isVisible = this.elements.downloadOptions.style.display !== 'none';
            this.elements.downloadOptions.style.display = isVisible ? 'none' : 'block';
        }
    }

    async downloadData(format) {
        try {
            const result = await chrome.storage.local.get([this.dataStorageKey]);
            const data = result[this.dataStorageKey] || [];

            if (data.length === 0) {
                this.showError('No data available to download');
                return;
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            let content, filename, type;

            if (format === 'csv') {
                content = this.convertToCSV(data);
                filename = `tgstat_channels_${timestamp}.csv`;
                type = 'text/csv';
            } else {
                content = JSON.stringify(data, null, 2);
                filename = `tgstat_channels_${timestamp}.json`;
                type = 'application/json';
            }

            const blob = new Blob([content], { type: type });
            const url = URL.createObjectURL(blob);

            await chrome.downloads.download({
                url: url,
                filename: filename,
                saveAs: true
            });

            this.updateStatus(`Downloaded ${data.length.toLocaleString()} channels as ${format.toUpperCase()}`, 'success');
            
            // Revert status after 3 seconds
            setTimeout(() => {
                this.updateStatus('Ready', 'idle');
            }, 3000);

        } catch (error) {
            console.error('Error downloading data:', error);
            this.showError('Error downloading data: ' + error.message);
        }
    }

    convertToCSV(data) {
        if (data.length === 0) return '';

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header] || '';
                    const escapedValue = String(value).replace(/"/g, '""');
                    return escapedValue.includes(',') ? `"${escapedValue}"` : escapedValue;
                }).join(',')
            )
        ].join('\n');

        return csvContent;
    }

    async clearData() {
        if (confirm('Are you sure you want to clear all scraped data? This action cannot be undone.')) {
            try {
                this.scrapedData = [];
                this.stats = {
                    channelCount: 0,
                    loadMoreCount: 0,
                    pageCount: 0,
                    currentPage: 1,
                    lastOffset: 0,
                    averagePageTime: 0,
                    totalProcessingTime: 0
                };
                
                await chrome.storage.local.clear();
                this.updateStatsDisplay();
                this.updatePerformanceMetrics();
                
                this.safeToggleDisplay(this.elements.downloadBtn, false);
                this.safeToggleDisplay(this.elements.downloadOptions, false);
                
                this.updateStatus('All data cleared', 'warning');
                
            } catch (error) {
                console.error('Error clearing data:', error);
                this.showError('Error clearing data');
            }
        }
    }

    async saveData() {
        try {
            await chrome.storage.local.set({
                [this.dataStorageKey]: this.scrapedData,
                [this.statsStorageKey]: this.stats
            });
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    showError(message) {
        this.updateStatus(message, 'error');
        this.updateUI(false);
        this.isRunning = false;
    }

    async resetProgress() {
        if (confirm('Reset all progress? This will clear current page position but keep scraped data.')) {
            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                if (tab && tab.url.includes('tgstat.ru')) {
                    const response = await chrome.tabs.sendMessage(tab.id, { type: 'RESET_PROGRESS' });
                    if (response && response.success) {
                        this.updateStatus('Progress reset. Starting from page 1...', 'warning');
                        await this.loadStoredData();
                    } else {
                        this.showError('Failed to reset progress');
                    }
                } else {
                    this.showError('Please open a tgstat.ru page first');
                }
            } catch (error) {
                console.error('Error resetting progress:', error);
                this.showError('Failed to reset progress');
            }
        }
    }

    async loadCategories() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && tab.url && tab.url.includes('tgstat.ru')) {
                const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_CATEGORIES' });
                if (response && response.categories) {
                    this.categories = response.categories;
                    this.populateCategorySelect();
                }
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    populateCategorySelect() {
        if (this.elements.categorySelect && this.categories.length > 0) {
            this.elements.categorySelect.innerHTML = '<option value="">Select Category</option>';
            this.categories.forEach((category, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `${category.name} (${category.count})`;
                this.elements.categorySelect.appendChild(option);
            });
        }
    }

    async navigateToCategory() {
        try {
            const selectedIndex = this.elements.categorySelect.value;
            if (selectedIndex === '') return;
            
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab) {
                await chrome.tabs.sendMessage(tab.id, { 
                    type: 'NAVIGATE_TO_CATEGORY', 
                    categoryIndex: parseInt(selectedIndex) 
                });
            }
        } catch (error) {
            console.error('Error navigating to category:', error);
        }
    }

    async setStartPage() {
        try {
            const startPage = parseInt(this.elements.startPageInput.value);
            
            if (!startPage || startPage < 1) {
                alert('Please enter a valid page number (minimum 1)');
                return;
            }
            
            if (startPage > 999) {
                alert('Page number too high. Maximum is 999.');
                return;
            }
            
            const confirmMessage = `Set start page to ${startPage}?\n\nThis will update the current page position and form fields.\n\nContinue?`;
            if (!confirm(confirmMessage)) {
                return;
            }
            
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && tab.url.includes('tgstat.ru')) {
                const response = await chrome.tabs.sendMessage(tab.id, { 
                    type: 'SET_START_PAGE', 
                    startPage: startPage 
                });
                
                if (response && response.success) {
                    this.stats.currentPage = startPage;
                    this.stats.loadMoreCount = startPage - 1;
                    this.stats.pageCount = startPage;
                    this.stats.lastOffset = (startPage - 1) * 20;
                    
                    this.updateStatsDisplay();
                    this.elements.startPageInput.value = '';
                    this.updateStatus(`Start page set to ${startPage}. Ready to continue.`, 'success');
                    
                    setTimeout(() => {
                        this.updateStatus('Ready', 'idle');
                    }, 3000);
                    
                } else {
                    alert('Failed to set start page. Make sure you are on a tgstat.ru page.');
                }
            } else {
                alert('Please navigate to tgstat.ru first.');
            }
        } catch (error) {
            console.error('Error setting start page:', error);
            alert('Error setting start page. Please try again.');
        }
    }

    async setQuickStartPage(offset) {
        try {
            const currentPage = this.stats.currentPage || 1;
            const targetPage = currentPage + offset;
            
            if (targetPage < 1) {
                alert('Target page cannot be less than 1');
                return;
            }
            
            if (targetPage > 999) {
                alert('Target page too high. Maximum is 999.');
                return;
            }
            
            this.elements.startPageInput.value = targetPage.toString();
            await this.setStartPage();
            
        } catch (error) {
            console.error('Error setting quick start page:', error);
            alert('Error setting start page. Please try again.');
        }
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tgstatPopupPro = new TGStatScraperPopupPro();
    console.log('TGStat Scraper Pro Popup initialized');
});

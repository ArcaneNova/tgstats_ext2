class TGStatScraperPopup {
    constructor() {
        this.isRunning = false;
        this.autoMode = false;
        this.scrapedData = [];
        this.stats = {
            channelCount: 0,
            loadMoreCount: 0,
            pageCount: 0,
            currentPage: 1,
            lastOffset: 0
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
        this.progressStorageKey = 'tgstatProgress';
        
        this.initializeElements();
        this.bindEvents();
        this.loadStoredData();
        this.checkTabUrl();
        this.checkScraperStatus();
        this.loadCategories();
        this.keepPopupOpen();
    }    initializeElements() {
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
            navigateBtn: document.getElementById('navigateBtn')
        };
    }    async checkScraperStatus() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && tab.url && tab.url.includes('tgstat.ru')) {
                // Check if scraper is running in the current tab
                const response = await chrome.tabs.sendMessage(tab.id, { type: 'CHECK_STATUS' });
                if (response && response.isRunning) {
                    this.isRunning = true;
                    this.autoMode = response.autoMode || false;
                    this.categoryProgress = response.categoryProgress || this.categoryProgress;
                    this.updateUI(true);
                    this.updateStatus('Scraping in progress...', 'running');
                    this.updateCategoryInfo(this.categoryProgress);
                }
            }
        } catch (error) {
            console.error('Error checking scraper status:', error);
        }
    }bindEvents() {
        this.elements.startBtn.addEventListener('click', () => this.startScraping(false));
        if (this.elements.startAutoBtn) {
            this.elements.startAutoBtn.addEventListener('click', () => this.startScraping(true));
        }
        this.elements.stopBtn.addEventListener('click', () => this.stopScraping());
        this.elements.downloadBtn.addEventListener('click', () => this.toggleDownloadOptions());
        this.elements.clearBtn.addEventListener('click', () => this.clearData());
        this.elements.resetBtn.addEventListener('click', () => this.resetProgress());
        this.elements.downloadJson.addEventListener('click', () => this.downloadData('json'));
        this.elements.downloadCsv.addEventListener('click', () => this.downloadData('csv'));
        
        if (this.elements.navigateBtn) {
            this.elements.navigateBtn.addEventListener('click', () => this.navigateToCategory());
        }

        // Listen for updates from content script
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'SCRAPER_UPDATE') {
                this.handleScraperUpdate(message.data);
            }
        });

        // Keep popup open when scraper is running
        if (this.isRunning) {
            this.keepPopupOpen();
        }
    }

    async checkTabUrl() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && tab.url && tab.url.includes('tgstat.ru')) {
                this.elements.warning.style.display = 'none';
                this.elements.startBtn.disabled = false;
            } else {
                this.elements.warning.style.display = 'block';
                this.elements.startBtn.disabled = true;
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
                this.progressStorageKey
            ]);

            if (result[this.dataStorageKey]) {
                const data = result[this.dataStorageKey];
                this.scrapedData = data;
                this.elements.downloadBtn.style.display = this.scrapedData.length > 0 ? 'inline-block' : 'none';
                this.updateStatsDisplay({
                    channelCount: data.length,
                    loadMoreCount: result[this.progressStorageKey]?.loadMoreCount || 0,
                    pageCount: result[this.progressStorageKey]?.pageCount || 0
                });
            }
            if (result[this.statsStorageKey]) {
                this.stats = result[this.statsStorageKey];
                this.updateStatsDisplay();
            }
            if (result[this.progressStorageKey]?.isRunning) {
                this.isRunning = true;
                this.updateUI(true);
            }
        } catch (error) {
            console.error('Error loading stored data:', error);
        }
    }    async startScraping(autoMode = false) {
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
                console.log('Content script already injected or injection failed:', error);
            }

            // Wait a bit for the content script to initialize
            await new Promise(resolve => setTimeout(resolve, 500));

            // Send message to content script
            const messageType = autoMode ? 'START_AUTO_SCRAPING' : 'START_SCRAPING';
            await chrome.tabs.sendMessage(tab.id, {
                type: messageType,
                existingData: existingData
            });

            this.isRunning = true;
            this.autoMode = autoMode;
            await chrome.storage.local.set({ [this.progressStorageKey]: { isRunning: true, autoMode: autoMode } });
            this.updateUI(true);
        } catch (error) {
            console.error('Error starting scraper:', error);
            this.showError(error.message);
        }
    }async stopScraping() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Try to send stop message
            try {
                await chrome.tabs.sendMessage(tab.id, { type: 'STOP_SCRAPING' });
            } catch (error) {
                console.log('Error sending stop message:', error);
            }
            
            this.isRunning = false;
            await chrome.storage.local.set({ [this.progressStorageKey]: { isRunning: false } });
            this.updateStatus('Scraping stopped', 'idle');
            this.resetButtons();
            
            // Clear popup keep-alive interval
            if (this.popupCheckInterval) {
                clearInterval(this.popupCheckInterval);
                this.popupCheckInterval = null;
            }
        } catch (error) {
            console.error('Error stopping scraper:', error);
        }
    }    async handleScraperUpdate(data) {
        if (data.stats) {
            this.stats = data.stats;
            this.updateStatsDisplay();
        }

        if (data.categoryProgress) {
            this.categoryProgress = data.categoryProgress;
            this.updateCategoryInfo(this.categoryProgress);
        }

        if (data.autoMode !== undefined) {
            this.autoMode = data.autoMode;
        }

        if (data.status) {
            switch (data.status) {
                case 'scraping':
                    this.updateStatus(data.message || 'Scraping in progress...', 'running');
                    this.updateUI(true);
                    break;
                case 'completed':
                    this.updateStatus('Scraping completed!', 'idle');
                    this.updateUI(false);
                    break;
                case 'error':
                    this.updateStatus(data.message || 'An error occurred', 'error');
                    this.updateUI(false);
                    break;
                case 'warning':
                    this.updateStatus(data.message, 'warning');
                    break;
                case 'progress':
                    this.updateStatus(data.message, 'running');
                    break;
                case 'category_change':
                    this.updateStatus(data.message, 'running');
                    break;
                case 'autosave':
                    this.updateStatus(data.message, 'success');
                    break;
            }
        }

        if (data.newChannels) {
            this.scrapedData = this.scrapedData.concat(data.newChannels);
            this.saveData();
        }
    }updateStatsDisplay(stats = null) {
        const currentStats = stats || this.stats;
        
        if (this.elements.channelCount) {
            this.elements.channelCount.textContent = currentStats.channelCount.toLocaleString();
        }
        if (this.elements.loadMoreCount) {
            this.elements.loadMoreCount.textContent = currentStats.loadMoreCount.toLocaleString();
        }
        if (this.elements.pageCount) {
            this.elements.pageCount.textContent = currentStats.pageCount.toLocaleString();
        }
        
        // Update progress bar
        if (this.elements.progressFill) {
            const progress = (currentStats.currentPage / (currentStats.currentPage + 1)) * 100;
            this.elements.progressFill.style.width = `${Math.min(progress, 100)}%`;
        }
        
        // Show stats section when there's data
        if (this.elements.stats && (currentStats.channelCount > 0 || this.isRunning)) {
            this.elements.stats.style.display = 'block';
        }
    }

    updateStatus(message, type) {
        this.elements.status.textContent = message;
        this.elements.status.className = `status ${type}`;
    }

    resetButtons() {
        this.elements.startBtn.style.display = 'inline-block';
        this.elements.stopBtn.style.display = 'none';
        this.elements.downloadBtn.style.display = this.scrapedData.length > 0 ? 'inline-block' : 'none';
    }

    toggleDownloadOptions() {
        const isVisible = this.elements.downloadOptions.style.display !== 'none';
        this.elements.downloadOptions.style.display = isVisible ? 'none' : 'block';
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

            this.updateStatus(`Downloaded ${data.length} channels as ${format.toUpperCase()}`, 'success');
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
                    // Escape quotes and wrap in quotes if contains comma
                    const escapedValue = String(value).replace(/"/g, '""');
                    return escapedValue.includes(',') ? `"${escapedValue}"` : escapedValue;
                }).join(',')
            )
        ].join('\n');

        return csvContent;
    }

    async clearData() {
        if (confirm('Are you sure you want to clear all scraped data?')) {
            this.scrapedData = [];
            this.stats = {
                channelCount: 0,
                loadMoreCount: 0,
                pageCount: 0
            };
            
            await chrome.storage.local.clear();
            this.updateStatsDisplay();
            this.elements.downloadBtn.style.display = 'none';
            this.elements.downloadOptions.style.display = 'none';
            this.updateStatus('Data cleared', 'idle');
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
        this.resetButtons();
    }    updateUI(isRunning) {
        this.elements.startBtn.style.display = isRunning ? 'none' : 'inline-block';
        if (this.elements.startAutoBtn) {
            this.elements.startAutoBtn.style.display = isRunning ? 'none' : 'inline-block';
        }
        this.elements.stopBtn.style.display = isRunning ? 'inline-block' : 'none';
        this.elements.stats.style.display = isRunning ? 'block' : 'none';
        this.elements.downloadBtn.style.display = isRunning ? 'none' : 'inline-block';
        this.elements.resetBtn.style.display = isRunning ? 'inline-block' : 'none';
        
        // Show/hide category controls
        if (this.elements.categoryInfo) {
            this.elements.categoryInfo.style.display = isRunning && this.autoMode ? 'block' : 'none';
        }
        
        if (isRunning) {
            this.keepPopupOpen();
        }
    }keepPopupOpen() {
        // Keep popup open by preventing it from losing focus
        window.focus();
        
        // Set up a periodic check to ensure popup stays open
        if (this.popupCheckInterval) {
            clearInterval(this.popupCheckInterval);
        }
        
        this.popupCheckInterval = setInterval(() => {
            if (this.isRunning) {
                window.focus();
            } else {
                clearInterval(this.popupCheckInterval);
                this.popupCheckInterval = null;
            }
        }, 1000);
    }

    async resetProgress() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab) {
                const response = await chrome.tabs.sendMessage(tab.id, { type: 'RESET_PROGRESS' });
                if (response && response.success) {
                    this.updateStatus('Progress reset. Continuing from page 1...', 'warning');
                    await this.loadStoredData();
                }
            }
        } catch (error) {
            console.error('Error resetting progress:', error);
            this.showError('Failed to reset progress');
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

    updateCategoryInfo(categoryProgress) {
        if (this.elements.categoryInfo && categoryProgress) {
            this.elements.categoryInfo.innerHTML = `
                <div style="font-size: 12px; color: #666; margin-bottom: 10px;">
                    <div><strong>Current:</strong> ${categoryProgress.currentCategoryName || 'Unknown'}</div>
                    <div><strong>Progress:</strong> ${categoryProgress.currentCategoryIndex + 1} / ${this.categories.length}</div>
                    <div><strong>Category Data:</strong> ${categoryProgress.categoryDataCount || 0} items</div>
                </div>
            `;
        }
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TGStatScraperPopup();
});
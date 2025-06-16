// Data Integrity Verification Script for TGStat Scraper
// This script helps verify that scraped data is being stored properly and prevents data loss

console.log('🔍 DATA INTEGRITY VERIFICATION LOADED');
console.log('=====================================');

// Function to verify current data integrity
async function verifyDataIntegrity() {
    console.log('🔍 VERIFYING DATA INTEGRITY...');
    
    try {
        const scraper = window.tgstatScraper || window.debugTGStatScraper;
        if (!scraper) {
            console.error('❌ Scraper not found');
            return null;
        }
        
        // Get storage data
        const result = await chrome.storage.local.get([
            'tgstatData',
            'tgstat_scraper_state',
            'tgstat_scraper_state_backup'
        ]);
        
        const storedData = result.tgstatData || [];
        const mainState = result.tgstat_scraper_state;
        const backupState = result.tgstat_scraper_state_backup;
        
        console.log('📊 DATA INTEGRITY REPORT:');
        console.log('========================');
        
        // Check data consistency
        console.log('📦 STORAGE DATA:');
        console.log(`- Items in storage: ${storedData.length}`);
        console.log(`- Storage size: ${JSON.stringify(storedData).length} characters`);
        
        console.log('\n📊 SCRAPER STATS:');
        console.log(`- Channel count: ${scraper.stats.channelCount}`);
        console.log(`- Current page: ${scraper.stats.currentPage}`);
        console.log(`- Load more count: ${scraper.stats.loadMoreCount}`);
        console.log(`- Last save count: ${scraper.stats.lastSaveCount}`);
        
        console.log('\n🔧 MEMORY STATE:');
        console.log(`- scrapedData length: ${scraper.scrapedData.length}`);
        console.log(`- existingIds size: ${scraper.existingIds.size}`);
        console.log(`- processedUrls size: ${scraper.processedUrls.size}`);
        console.log(`- processingQueue length: ${scraper.processingQueue.length}`);
        
        // Check for inconsistencies
        const issues = [];
        
        if (storedData.length !== scraper.stats.channelCount) {
            issues.push(`Storage data (${storedData.length}) != Stats count (${scraper.stats.channelCount})`);
        }
        
        if (scraper.scrapedData.length !== storedData.length) {
            issues.push(`Memory data (${scraper.scrapedData.length}) != Storage data (${storedData.length})`);
        }
        
        if (scraper.existingIds.size > scraper.stats.channelCount) {
            issues.push(`existingIds (${scraper.existingIds.size}) > Stats count (${scraper.stats.channelCount})`);
        }
        
        console.log('\n⚠️ ISSUES DETECTED:');
        if (issues.length === 0) {
            console.log('✅ No data integrity issues found!');
        } else {
            issues.forEach(issue => console.warn(`⚠️ ${issue}`));
        }
        
        // Check state consistency
        console.log('\n🔄 STATE CONSISTENCY:');
        if (mainState) {
            console.log(`- Main state timestamp: ${new Date(mainState.timestamp).toISOString()}`);
            console.log(`- Main state channels: ${mainState.stats.channelCount}`);
            
            if (mainState.stats.channelCount !== scraper.stats.channelCount) {
                console.warn(`⚠️ Main state count (${mainState.stats.channelCount}) != Current count (${scraper.stats.channelCount})`);
            }
        } else {
            console.warn('⚠️ No main state found');
        }
        
        if (backupState) {
            console.log(`- Backup state timestamp: ${new Date(backupState.timestamp).toISOString()}`);
            console.log(`- Backup state channels: ${backupState.stats.channelCount}`);
        } else {
            console.warn('⚠️ No backup state found');
        }
        
        // Sample data validation
        console.log('\n🔬 DATA SAMPLE VALIDATION:');
        if (storedData.length > 0) {
            const sample = storedData[0];
            const requiredFields = ['uniqueId', 'channelId', 'title', 'subscribers'];
            const missingFields = requiredFields.filter(field => !sample[field]);
            
            if (missingFields.length === 0) {
                console.log('✅ Sample data structure is valid');
            } else {
                console.warn(`⚠️ Sample data missing fields: ${missingFields.join(', ')}`);
            }
            
            console.log(`- Sample item: ${sample.title} (${sample.subscribers} subs)`);
        }
        
        return {
            storedDataLength: storedData.length,
            statsChannelCount: scraper.stats.channelCount,
            memoryDataLength: scraper.scrapedData.length,
            existingIdsSize: scraper.existingIds.size,
            processingQueueLength: scraper.processingQueue.length,
            issues: issues,
            isIntegrityOk: issues.length === 0
        };
        
    } catch (error) {
        console.error('❌ Error verifying data integrity:', error);
        return null;
    }
}

// Function to force synchronize all data sources
async function forceSyncData() {
    console.log('🔄 FORCING DATA SYNCHRONIZATION...');
    
    try {
        const scraper = window.tgstatScraper || window.debugTGStatScraper;
        if (!scraper) {
            console.error('❌ Scraper not found');
            return;
        }
        
        // Get the definitive data from storage
        const result = await chrome.storage.local.get(['tgstatData']);
        const storedData = result.tgstatData || [];
        
        console.log(`📦 Found ${storedData.length} items in storage`);
        
        // Update all data sources to match storage
        scraper.scrapedData = [...storedData];
        scraper.stats.channelCount = storedData.length;
        
        // Rebuild existingIds from stored data
        scraper.existingIds = new Set();
        scraper.processedUrls = new Set();
        
        storedData.forEach(item => {
            if (item.uniqueId) {
                scraper.existingIds.add(item.uniqueId);
            }
            if (item.url) {
                scraper.processedUrls.add(item.url);
            }
        });
        
        // Force save the synchronized state
        await scraper.saveProgress(true);
        
        console.log('✅ Data synchronization complete');
        console.log(`📊 Updated stats: ${scraper.stats.channelCount} channels`);
        console.log(`🔧 Updated existingIds: ${scraper.existingIds.size} items`);
        
        // Verify the sync worked
        await verifyDataIntegrity();
        
    } catch (error) {
        console.error('❌ Error during data sync:', error);
    }
}

// Function to backup current data state
async function backupCurrentData() {
    console.log('💾 BACKING UP CURRENT DATA...');
    
    try {
        const result = await chrome.storage.local.get(['tgstatData']);
        const storedData = result.tgstatData || [];
        
        if (storedData.length === 0) {
            console.log('📝 No data to backup');
            return;
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupKey = `tgstat_backup_${timestamp}`;
        
        await chrome.storage.local.set({
            [backupKey]: {
                data: storedData,
                timestamp: Date.now(),
                count: storedData.length,
                reason: 'manual_backup'
            }
        });
        
        console.log(`✅ Backup created: ${backupKey}`);
        console.log(`📦 Backed up ${storedData.length} items`);
        
        return backupKey;
        
    } catch (error) {
        console.error('❌ Error creating backup:', error);
    }
}

// Function to list all backups
async function listBackups() {
    console.log('📂 LISTING ALL BACKUPS...');
    
    try {
        const allStorage = await chrome.storage.local.get(null);
        const backupKeys = Object.keys(allStorage).filter(key => key.startsWith('tgstat_backup_'));
        
        if (backupKeys.length === 0) {
            console.log('📝 No backups found');
            return [];
        }
        
        console.log(`📂 Found ${backupKeys.length} backups:`);
        
        const backups = backupKeys.map(key => {
            const backup = allStorage[key];
            const date = new Date(backup.timestamp).toISOString();
            console.log(`- ${key}: ${backup.count} items (${date})`);
            return { key, ...backup };
        });
        
        return backups;
        
    } catch (error) {
        console.error('❌ Error listing backups:', error);
        return [];
    }
}

// Function to monitor data changes
let dataMonitor = null;

function startDataMonitor() {
    if (dataMonitor) {
        console.log('📊 Data monitor already running');
        return;
    }
    
    console.log('🔍 STARTING DATA MONITOR...');
    
    let lastDataLength = 0;
    let lastStatsCount = 0;
    
    dataMonitor = setInterval(async () => {
        try {
            const result = await chrome.storage.local.get(['tgstatData']);
            const storedData = result.tgstatData || [];
            
            const scraper = window.tgstatScraper || window.debugTGStatScraper;
            const currentStatsCount = scraper ? scraper.stats.channelCount : 0;
            
            if (storedData.length !== lastDataLength || currentStatsCount !== lastStatsCount) {
                console.log(`📊 DATA CHANGE: Storage: ${lastDataLength} → ${storedData.length}, Stats: ${lastStatsCount} → ${currentStatsCount}`);
                
                // Check for potential data loss
                if (storedData.length < lastDataLength) {
                    console.error(`❌ POTENTIAL DATA LOSS: Storage decreased from ${lastDataLength} to ${storedData.length}!`);
                    await backupCurrentData();
                }
                
                lastDataLength = storedData.length;
                lastStatsCount = currentStatsCount;
            }
            
        } catch (error) {
            console.error('❌ Error in data monitor:', error);
        }
    }, 10000); // Check every 10 seconds
    
    console.log('✅ Data monitor started (checking every 10 seconds)');
}

function stopDataMonitor() {
    if (dataMonitor) {
        clearInterval(dataMonitor);
        dataMonitor = null;
        console.log('⏹️ Data monitor stopped');
    } else {
        console.log('📊 Data monitor not running');
    }
}

// Export functions globally
window.verifyDataIntegrity = verifyDataIntegrity;
window.forceSyncData = forceSyncData;
window.backupCurrentData = backupCurrentData;
window.listBackups = listBackups;
window.startDataMonitor = startDataMonitor;
window.stopDataMonitor = stopDataMonitor;

console.log('🛠️ DATA INTEGRITY TOOLS LOADED:');
console.log('- verifyDataIntegrity() - Check data consistency');
console.log('- forceSyncData() - Synchronize all data sources');
console.log('- backupCurrentData() - Create manual backup');
console.log('- listBackups() - Show all available backups');
console.log('- startDataMonitor() - Monitor data changes');
console.log('- stopDataMonitor() - Stop monitoring');

// Auto-run integrity check
verifyDataIntegrity();

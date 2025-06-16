// Storage Debug Script for TGStat Scraper
// Run this in console to see what's stored and why state might be rolling back

async function debugTGStatStorage() {
    console.log('🔍 DEBUGGING TGSTAT STORAGE');
    console.log('===========================');
    
    try {
        // Get all storage keys
        const allStorage = await chrome.storage.local.get(null);
        const tgstatKeys = Object.keys(allStorage).filter(key => key.startsWith('tgstat'));
        
        console.log('📦 All TGStat storage keys found:', tgstatKeys);
        
        // Check main state keys
        const mainStateKey = 'tgstat_scraper_state';
        const backupStateKey = 'tgstat_scraper_state_backup';
        
        console.log('\n📊 MAIN STATE:');
        if (allStorage[mainStateKey]) {
            const mainState = allStorage[mainStateKey];
            console.log('- Timestamp:', new Date(mainState.timestamp).toISOString());
            console.log('- Age:', Math.round((Date.now() - mainState.timestamp) / 1000), 'seconds');
            console.log('- Stats:', mainState.stats);
            console.log('- Reason:', mainState.reason || 'unknown');
        } else {
            console.log('❌ No main state found');
        }
        
        console.log('\n📊 BACKUP STATE:');
        if (allStorage[backupStateKey]) {
            const backupState = allStorage[backupStateKey];
            console.log('- Timestamp:', new Date(backupState.timestamp).toISOString());
            console.log('- Age:', Math.round((Date.now() - backupState.timestamp) / 1000), 'seconds');
            console.log('- Stats:', backupState.stats);
            console.log('- Reason:', backupState.reason || 'unknown');
        } else {
            console.log('❌ No backup state found');
        }
        
        // Check for other states
        console.log('\n📦 OTHER STATES:');
        tgstatKeys.forEach(key => {
            if (key !== mainStateKey && key !== backupStateKey) {
                const data = allStorage[key];
                console.log(`- ${key}:`, data);
            }
        });
        
        // Check current scraper state
        console.log('\n🔧 CURRENT SCRAPER STATE:');
        const scraper = window.tgstatScraper || window.debugTGStatScraper;
        if (scraper) {
            console.log('- Current Page:', scraper.stats.currentPage);
            console.log('- Load More Count:', scraper.stats.loadMoreCount);
            console.log('- Page Count:', scraper.stats.pageCount);
            console.log('- Channel Count:', scraper.stats.channelCount);
            console.log('- Last Offset:', scraper.stats.lastOffset);
            console.log('- Is Running:', scraper.isRunning);
            console.log('- Auto Mode:', scraper.autoMode);
        } else {
            console.log('❌ Scraper not found');
        }
        
        // Check form fields
        console.log('\n📄 FORM FIELDS:');
        const pageInput = document.querySelector('.lm-page');
        const offsetInput = document.querySelector('.lm-offset');
        console.log('- Page Input:', pageInput?.value || 'not found');
        console.log('- Offset Input:', offsetInput?.value || 'not found');
        
        return allStorage;
        
    } catch (error) {
        console.error('❌ Error debugging storage:', error);
    }
}

// Function to clear all old states and force save current state
async function forceSaveCurrentState() {
    console.log('💾 FORCE SAVING CURRENT STATE');
    
    const scraper = window.tgstatScraper || window.debugTGStatScraper;
    if (!scraper) {
        console.error('❌ Scraper not found');
        return;
    }
    
    // Clear any old states
    await chrome.storage.local.remove([
        'tgstat_scraper_state_backup',
        'tgstat_reload_context',
        'tgstat_smart_reload_context'
    ]);
    
    // Force save current state
    await scraper.saveProgress(true);
    
    console.log('✅ Current state force saved, old states cleared');
    
    // Verify
    setTimeout(async () => {
        console.log('🔍 Verification after force save:');
        await debugTGStatStorage();
    }, 1000);
}

// Export functions
window.debugTGStatStorage = debugTGStatStorage;
window.forceSaveCurrentState = forceSaveCurrentState;

console.log('🔧 Debug functions loaded:');
console.log('- debugTGStatStorage() - Show all storage contents');
console.log('- forceSaveCurrentState() - Clear old states and save current');

// Auto-run debug
debugTGStatStorage();

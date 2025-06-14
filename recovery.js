// Emergency Recovery Script for TGStat Scraper
// Use this if the scraper gets stuck or behaves unexpectedly after refresh

async function emergencyRecoveryScraper() {
    console.log('🚨 EMERGENCY RECOVERY MODE');
    console.log('===========================');
    
    try {
        // Get scraper instance
        const scraper = window.debugTGStatScraper || window.tgstatScraper;
        if (!scraper) {
            console.error('❌ Scraper not found. Reload the extension.');
            return;
        }
        
        // Stop any running operations
        console.log('🛑 Stopping scraper...');
        scraper.stopScraping();
        
        // Clear any problematic localStorage flags
        console.log('🧹 Clearing refresh flags...');
        localStorage.removeItem('tgstat_refresh_in_progress');
        localStorage.removeItem('tgstat_pre_refresh_state');
        
        // Get current saved state
        console.log('🔍 Checking saved state...');
        const currentState = await scraper.debugState();
        
        if (currentState.savedState) {
            console.log('📊 Found saved state:');
            console.log('- Current Page:', currentState.savedState.currentPage);
            console.log('- Load More Count:', currentState.savedState.loadMoreCount);
            console.log('- Channel Count:', currentState.savedState.channelCount);
            console.log('- Last Offset:', currentState.savedState.lastOffset);
            
            // Force reload the saved state
            console.log('🔄 Force reloading saved state...');
            await scraper.loadSavedProgress();
            
            // Update form fields
            scraper.updateFormFields();
            
            console.log('✅ Recovery completed. You can resume scraping now.');
            console.log('🚀 To resume: Click "Start Auto Scraping" in the extension popup');
            
        } else {
            console.log('⚠️ No saved state found. You may need to start fresh.');
        }
        
    } catch (error) {
        console.error('💥 Recovery failed:', error);
        console.log('🔧 Manual recovery steps:');
        console.log('1. Reload the page completely');
        console.log('2. Click "Reset Progress" in extension popup if needed');
        console.log('3. Start scraping fresh from the beginning');
    }
}

// Function to manually inspect and fix form fields
function fixFormFields() {
    const scraper = window.debugTGStatScraper || window.tgstatScraper;
    if (!scraper) {
        console.error('❌ Scraper not found');
        return;
    }
    
    const pageInput = document.querySelector('.lm-page');
    const offsetInput = document.querySelector('.lm-offset');
    
    console.log('📄 Current form state:');
    console.log('- Page input:', pageInput?.value);
    console.log('- Offset input:', offsetInput?.value);
    console.log('- Scraper currentPage:', scraper.stats.currentPage);
    console.log('- Scraper lastOffset:', scraper.stats.lastOffset);
    
    // Fix form fields to correct values
    const nextPage = scraper.stats.currentPage + 1;
    const nextOffset = scraper.stats.lastOffset + 20;
    
    if (pageInput) pageInput.value = nextPage.toString();
    if (offsetInput) offsetInput.value = nextOffset.toString();
    
    console.log('✅ Fixed form fields to:');
    console.log('- Page:', nextPage);
    console.log('- Offset:', nextOffset);
}

// Function to manually force save current state
async function forceSaveState() {
    const scraper = window.debugTGStatScraper || window.tgstatScraper;
    if (!scraper) {
        console.error('❌ Scraper not found');
        return;
    }
    
    console.log('💾 Force saving current state...');
    await scraper.saveProgress(true);
    console.log('✅ State saved successfully');
}

console.log('🚨 Emergency recovery functions loaded:');
console.log('- emergencyRecoveryScraper() - Full recovery process');
console.log('- fixFormFields() - Fix form field values');
console.log('- forceSaveState() - Force save current state');

// Export functions globally
window.emergencyRecoveryScraper = emergencyRecoveryScraper;
window.fixFormFields = fixFormFields;
window.forceSaveState = forceSaveState;

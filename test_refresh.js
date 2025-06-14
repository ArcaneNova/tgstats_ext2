// Manual Refresh Test Script for TGStat Scraper
// Copy and paste this into the browser console to test refresh state preservation

async function testRefreshStatePreservation() {
    console.log('🧪 TESTING MANUAL REFRESH STATE PRESERVATION');
    console.log('=============================================');
    
    // Get current scraper instance
    const scraper = window.debugTGStatScraper || window.tgstatScraper;
    if (!scraper) {
        console.error('❌ Scraper not found. Make sure the extension is loaded.');
        return;
    }
    
    // Check if scraper is currently running
    if (!scraper.isRunning) {
        console.log('⚠️ Scraper is not currently running. Start scraping first, then run this test.');
        return;
    }
    
    // Get current state before refresh
    const stateBefore = await scraper.debugState();
    console.log('📊 STATE BEFORE REFRESH:', stateBefore.memoryState);
    
    // Force save current state
    await scraper.saveProgress(true);
    console.log('💾 Forced state save completed');
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if beforeunload protection is set up
    const beforeUnloadEvents = window.getEventListeners ? window.getEventListeners(window) : 'Use DevTools to check';
    console.log('🔒 Refresh protection status:', beforeUnloadEvents);
    
    console.log('');
    console.log('🔄 MANUAL TEST INSTRUCTIONS:');
    console.log('1. Press F5 or Ctrl+R to refresh the page NOW');
    console.log('2. After refresh, open console and run: window.debugTGStatState()');
    console.log('3. Compare the stats - they should be IDENTICAL to:');
    console.log('   Current Page:', stateBefore.memoryState.currentPage);
    console.log('   Load More Count:', stateBefore.memoryState.loadMoreCount);
    console.log('   Channel Count:', stateBefore.memoryState.channelCount);
    console.log('   Last Offset:', stateBefore.memoryState.lastOffset);
    console.log('');
    console.log('❗ IF THE NUMBERS ARE DIFFERENT AFTER REFRESH, THE BUG IS NOT FIXED!');
    console.log('✅ IF THE NUMBERS ARE IDENTICAL AFTER REFRESH, THE FIX WORKS!');
    
    return stateBefore.memoryState;
}

// Run the test
testRefreshStatePreservation();

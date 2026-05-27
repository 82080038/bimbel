// Session Management Helper - Auto-injected
// Handles: Resume, Auto-save, Timer Sync, Session Check

(function() {
    'use strict';
    
    // Persist session when exam starts
    window.persistExamSession = function(sesiId, sessionToken) {
        localStorage.setItem('activeExamSession', sesiId);
        localStorage.setItem('activeExamSessionToken', sessionToken || '');
        localStorage.setItem('examStartTime', Date.now().toString());
        console.log('Exam session persisted:', sesiId);
    };
    
    // Check for active session
    window.checkActiveSession = async function() {
        const activeSession = localStorage.getItem('activeExamSession');
        if (!activeSession) return null;
        
        // Verify session is still valid with server
        try {
            const response = await fetch('api/soal.php?action=check_session&sesi_id=' + activeSession, {
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') }
            });
            const data = await response.json();
            return data.valid ? activeSession : null;
        } catch (e) {
            return null;
        }
    };
    
    // Clear session on completion
    window.clearExamSession = function() {
        localStorage.removeItem('activeExamSession');
        localStorage.removeItem('activeExamSessionToken');
        localStorage.removeItem('examStartTime');
        console.log('Exam session cleared');
    };
    
    // Auto-save progress
    window.initAutoSave = function(sesiId, getAnswersFunc, getQuestionIndexFunc, getTimeFunc) {
        if (!sesiId) return;
        
        setInterval(async function() {
            try {
                const answers = getAnswersFunc ? getAnswersFunc() : {};
                await fetch('api/soal.php?action=auto_save_progress', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('authToken')
                    },
                    body: JSON.stringify({
                        sesi_id: sesiId,
                        jawaban_data: answers,
                        current_question_index: getQuestionIndexFunc ? getQuestionIndexFunc() : 0,
                        time_remaining: getTimeFunc ? getTimeFunc() : 0
                    })
                });
                console.log('Progress auto-saved');
            } catch (e) {
                console.error('Auto-save failed:', e);
            }
        }, 120000); // Every 2 minutes
    };
    
    // Sync timer with server
    window.initServerTimerSync = function(sesiId, timeRemainingVar, updateDisplayFunc) {
        if (!sesiId) return;
        
        setInterval(async function() {
            try {
                const response = await fetch('api/soal.php?action=get_timer&sesi_id=' + sesiId, {
                    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') }
                });
                const data = await response.json();
                
                if (data.success && data.remaining_seconds !== undefined) {
                    // Update client timer if drift > 5 seconds
                    if (Math.abs(timeRemainingVar - data.remaining_seconds) > 5) {
                        timeRemainingVar = data.remaining_seconds;
                        if (updateDisplayFunc) updateDisplayFunc();
                        console.log('Timer synced with server');
                    }
                }
            } catch (e) {
                console.error('Timer sync failed:', e);
            }
        }, 60000); // Every minute
    };
    
    console.log('Session Management Helper loaded');
})();
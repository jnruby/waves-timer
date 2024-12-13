// Common timer functions
function formatTime(diffTime) {
    let isNegative = diffTime < 0;
    diffTime = Math.abs(diffTime);
    
    let h = new Date(diffTime).getUTCHours();
    let m = new Date(diffTime).getUTCMinutes();
    let s = new Date(diffTime).getUTCSeconds() % 60;
    
    h = h.toString().padStart(2, '0');
    m = m.toString().padStart(2, '0');
    s = s.toString().padStart(2, '0');
    
    return (isNegative ? '-' : '') + h + ':' + m + ':' + s;
}

function updateTimerDisplay(results, startTime) {
    if(results.started == 1) {
        startTime = new Date(results.start_time * 1000).getTime();
        curTime = new Date(results.unixtime * 1000).getTime();
        diffTime = curTime - startTime;
        
        $("#stopwatch").html(formatTime(diffTime));
        
        if (diffTime < 0) {
            $("#status").html("COUNTDOWN MODE - " + Math.abs(Math.floor(diffTime/1000)) + " seconds until start");
        } else {
            $("#status").html("ON!");
        }
    }
    
    if(results.started == 0) {
        startTime = 0;
        $("#status").html("stopwatch off");
    }
    
    return startTime;
}

// Timer check initialization
function initializeTimerCheck() {
    return setInterval(function(){
        $.ajax({
            url: "timecheck.php",
            type: "post",
            data: {action: "checkTimer"},
            success: function(results){
                results = $.parseJSON(results);
                $("#timer").html(results.curtime.toString());
                startTime = updateTimerDisplay(results, startTime);
            }
        });
    }, 100);
}

function parseTimeString(timeStr) {
    // Handle empty or invalid input
    if (!timeStr) return { hour: "0", minute: "0", second: "0" };
    
    // Parse the time string (now handling negative times)
    const isNegative = timeStr.startsWith('-');
    const cleanTime = timeStr.replace('-', '');
    const [hours, minutes, seconds] = cleanTime.split(':').map(num => num.padStart(2, '0'));
    
    // Apply negative sign if needed
    const multiplier = isNegative ? -1 : 1;
    
    return {
        hour: (parseInt(hours || 0) * multiplier).toString(),
        minute: (parseInt(minutes || 0) * multiplier).toString(),
        second: (parseInt(seconds || 0) * multiplier).toString()
    };
}

function startTimer() {
    const timeInput = document.getElementById('timeInput');
    console.log('Starting timer with input value:', timeInput?.value);
    
    if (!timeInput) {
        console.error('Time input element not found!');
        return;
    }
    
    const timeValues = parseTimeString(timeInput.value);
    console.log('Parsed time values:', timeValues);
    
    $.ajax({
        url: "timecheck.php",
        type: "post",
        data: {
            action: "startOrStopTimer",
            start: "1",
            hour: timeValues.hour,
            minute: timeValues.minute,
            second: timeValues.second
        },
        success: function(results) {
            console.log('Timer start response:', results);
        },
        error: function(xhr, status, error) {
            console.error('Timer start error:', error);
        }
    });
}

function stopTimer() {
    $.ajax({
        url: "timecheck.php",
        type: "post",
        data: {action: "startOrStopTimer", start: "0"},
        success: function(results){
            console.log(results);
        }
    });
}

// Get Ready functionality
function toggleGetReady() {
    var $getReadyBtn = $("#getReadyBtn");
    var currentStatus = $getReadyBtn.data('active') ? 1 : 0;
    
    $.ajax({
        url: "timecheck.php",
        type: "post",
        data: {
            action: "toggleGetReady",
            status: currentStatus ? 0 : 1
        },
        success: function(results) {
            console.log(results);
        }
    });
}

function initializeGetReadyCheck(isControlPanel = false) {
    return setInterval(function(){
        $.ajax({
            url: "timecheck.php",
            type: "post",
            data: {action: "checkGetReady"},
            success: function(results) {
                results = $.parseJSON(results);
                if (results.getReady == 1) {
                    $(".get-ready-display").show().addClass('flashing');
                    if (isControlPanel) {
                        $("#getReadyBtn").data('active', true)
                                       .text("Stop Get Ready")
                                       .removeClass('btn-primary')
                                       .addClass('btn-danger');
                    }
                } else {
                    $(".get-ready-display").hide().removeClass('flashing');
                    if (isControlPanel) {
                        $("#getReadyBtn").data('active', false)
                                       .text("Get Ready")
                                       .removeClass('btn-danger')
                                       .addClass('btn-primary');
                    }
                }
            }
        });
    }, 100);
}
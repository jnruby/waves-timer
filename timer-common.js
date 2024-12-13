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

// Get Ready check initialization
function initializeGetReadyCheck(isControlPanel = false) {
    return setInterval(function(){
        $.ajax({
            url: "timecheck.php",
            type: "post",
            data: {action: "checkGetReady"},
            success: function(results) {
                results = $.parseJSON(results);
                if (results.getReady == 1) {
                    $(".get-ready-display")
                        .show()
                        .addClass('flashing');  // Make sure flashing class is added
                    if (isControlPanel) {
                        $("#getReadyBtn")
                            .data('active', true)
                            .text("Stop Get Ready")
                            .removeClass('btn-primary')
                            .addClass('btn-danger');
                    }
                } else {
                    $(".get-ready-display")
                        .hide()
                        .removeClass('flashing');  // Remove flashing class when hidden
                    if (isControlPanel) {
                        $("#getReadyBtn")
                            .data('active', false)
                            .text("Get Ready")
                            .removeClass('btn-danger')
                            .addClass('btn-primary');
                    }
                }
            }
        });
    }, 100);
}

// Control panel specific functions
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

function startTimer() {
    if (!validateTimeInput()) return;
    
    const timeInput = document.getElementById('timeInput');
    const timeValues = parseTimeInput(timeInput.value || '00:00:00');
    
    if (!timeValues) {
        document.getElementById('timeInputError').style.display = 'block';
        return;
    }
    
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
        }
    });
}

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

// Time input handling functions
function parseTimeInput(timeStr) {
    const regex = /^(-)?(\d{1,2}):([0-5]\d):([0-5]\d)$/;
    const match = timeStr.match(regex);
    
    if (!match) return null;
    
    const [, negative, hours, minutes, seconds] = match;
    const multiplier = negative ? -1 : 1;
    
    return {
        hour: (parseInt(hours) * multiplier).toString(),
        minute: (parseInt(minutes) * multiplier).toString(),
        second: (parseInt(seconds) * multiplier).toString()
    };
}

function validateTimeInput() {
    const timeInput = document.getElementById('timeInput');
    const errorDiv = document.getElementById('timeInputError');
    const value = timeInput.value;
    
    if (!value) {
        errorDiv.style.display = 'none';
        return true;
    }
    
    const isValid = /^-?\d{1,2}:[0-5]\d:[0-5]\d$/.test(value);
    errorDiv.style.display = isValid ? 'none' : 'block';
    return isValid;
}

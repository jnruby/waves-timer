<?php
if($_POST['action']=="startOrStopTimer")
    startOrStopTimer($_POST);
if($_POST['action']=="checkTimer")
    checkTimer();
if($_POST['action']=="toggleGetReady")
    toggleGetReady($_POST);
if($_POST['action']=="checkGetReady")
    checkGetReady();

function connect(){
    try{
        if($conn = new PDO('mysql:host=localhost;dbname=synced_watch','root','timerbusinesstime')){
            $conn->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
            return $conn;
        }
        else{
            return "nope";
        }
    } catch(PDOException $e) {
        return 'Connection failed: ' . $e->getMessage();
    }
}

function checkTimer(){
    try{
        $conn = connect();
        $stmt = $conn->prepare("SELECT CURRENT_TIMESTAMP as curtime, UNIX_TIMESTAMP(CURRENT_TIMESTAMP) as unixtime, started, start_time from timer_on where id=1");
        $stmt->execute(array());
        $ret = $stmt->fetchAll(PDO::FETCH_ASSOC)[0];
        echo json_encode($ret);
    } catch(PDOException $e) {
        echo 'Connection failed: ' . $e->getMessage();
    }
}

function startOrStopTimer($timer_arr) {
    $starting = $timer_arr['start'];
    try {
        $conn = connect();
        if($starting == "0") {
            $start_time = ", start_time=0 ";
        } else {
            // Convert all inputs to integers
            $hour = (int)$timer_arr['hour'];
            $minute = (int)$timer_arr['minute'];
            $second = (int)$timer_arr['second'];
            
            if($hour == 0 && $minute == 0 && $second == 0) {
                $start_time = ", start_time=UNIX_TIMESTAMP(CURRENT_TIMESTAMP) ";
            } else {
                // Calculate the offset in seconds
                $total_seconds = ($hour * 3600) + ($minute * 60) + $second;
                
                // For negative times, add to current timestamp instead of subtracting
                if($total_seconds < 0) {
                    $start_time = ", start_time=UNIX_TIMESTAMP(CURRENT_TIMESTAMP) + " . abs($total_seconds) . " ";
                } else {
                    $start_time = ", start_time=UNIX_TIMESTAMP(CURRENT_TIMESTAMP) - " . $total_seconds . " ";
                }
            }
        }
        
        $stmt = $conn->prepare("UPDATE timer_on SET started=" . $starting . $start_time . " where id=1");
        $stmt->execute(array());
        echo $stmt->rowCount();
    }
    catch(PDOException $e) {
        echo 'Connection failed: ' . $e->getMessage();
    }
}

// New function to toggle Get Ready state
function toggleGetReady($post_data){
    try{
        $conn = connect();
        $status = intval($post_data['status']);
        
        // Check if get_ready column exists, if not, add it
        $stmt = $conn->prepare("SHOW COLUMNS FROM timer_on LIKE 'get_ready'");
        $stmt->execute();
        $column_exists = $stmt->fetch();
        
        if (!$column_exists) {
            // Add the column if it doesn't exist
            $stmt = $conn->prepare("ALTER TABLE timer_on ADD COLUMN get_ready TINYINT(1) DEFAULT 0");
            $stmt->execute();
        }
        
        // Update get ready status
        $stmt = $conn->prepare("UPDATE timer_on SET get_ready = ? WHERE id = 1");
        $stmt->execute([$status]);
        
        echo json_encode(['success' => true]);
    }
    catch(PDOException $e) {
        echo 'Connection failed: ' . $e->getMessage();
    }
}

// New function to check Get Ready state
function checkGetReady(){
    try{
        $conn = connect();
        $stmt = $conn->prepare("SELECT get_ready FROM timer_on WHERE id = 1");
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode(['getReady' => $result['get_ready'] ?? 0]);
    }
    catch(PDOException $e) {
        echo 'Connection failed: ' . $e->getMessage();
    }
}
?>

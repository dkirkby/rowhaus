var clientID = null;
var urlParams = null;
var resetting = false;
var fetcher = null;
var timer = null;

var start_time = null;
var count = null;
var stack = null;
const max_stack = 64;
const max_age = 10; // only use data more recent than this for current stats, in seconds
var graph_data = null;
var graph = null;
var graph_options = {
    title: null,
    legend: 'none',
    hAxis: { format: 'h:mm' },
    chartArea: {width: '90%', height: '95%' }
};

var theWorkout = null;
var workoutStepIndex = 0;
var workoutStepStart = 0;

function zeropad(value) {
    return (value < 10) ? "0" + value : "" + value;
}

function update_time() {
    if(resetting) return;
    let now = new Date();
    let tnow = now.getTime() / 1000;
    let elapsed = tnow - start_time;
    $("#hours").text(zeropad(Math.floor( (elapsed/(60*60)) % 24)));
    $("#mins").text(zeropad(Math.floor( (elapsed/60) % 60)));
    $("#secs").text(zeropad(Math.floor( elapsed % 60)));
    // Calculate summary statistics from the stored stack.
    let nwindow = 0, ncycle = 0;
    let first = null, last = null;
    for(let i = stack.length - 1; i >= 0; i--) {
        let age = tnow - stack[i].t;
        if(age > max_age) break;
        if(last == null) last = stack[i].t;
        if(nwindow % 2 == 0) {
            first = stack[i].t;
            if(nwindow > 0) ncycle++;
        }
        nwindow++;
    }
    let spm = 0;
    if(ncycle > 0) {
        spm = 60 * ncycle / (last - first);
    }
    $("#SPM").text(spm.toFixed(1));
    // Update the graph.
    graph_data.addRow([now, spm]);
    graph.draw(graph_data, graph_options);
    if(theWorkout != null) {
        // Update the workout.
        let elapsed = tnow - workoutStepStart;
        let stepResistance = theWorkout.steps[workoutStepIndex][0];
        let stepDuration = theWorkout.steps[workoutStepIndex][1];
        while(elapsed > stepDuration) {
            elapsed -= stepDuration;
            workoutStepIndex += 1;
            if(workoutStepIndex >= theWorkout.steps.length) {
                // Workout is done.
                $("#workout").text("Workout Completed!");
                theWorkout = null;
                break;
            }
            workoutStepStart = tnow - elapsed;
            stepDuration = theWorkout.steps[workoutStepIndex][1];
            stepResistance = theWorkout.steps[workoutStepIndex][0];
        }
        if(theWorkout != null) {
            $("#workout-step").text(workoutStepIndex + 1);
            $("#workout-resistance").text(stepResistance);
            $("#workout-remaining").text((stepDuration - elapsed).toFixed(0));
            if(workoutStepIndex < theWorkout.steps.length - 1) {
            $("#workout-next").text(theWorkout.steps[workoutStepIndex + 1][0]);
            }
            else {
            $("#workout-next").text("Done!");
            }
        }
    }
}

function update_data(data) {
    count++;
    $("#COUNT").text(Math.round(count/2, 0));
    while(stack.length >= max_stack) {
        // Remove the oldest entry from the front.
        stack.shift();
    }
    // Append the newest entry to the end.
    stack.push(data);
}

function init_graph() {
    graph_data = new google.visualization.DataTable();
    graph_data.addColumn('date', 'Time');
    graph_data.addColumn('number', 'SPM');
    graph = new google.visualization.LineChart(document.getElementById('graph'));
    graph.draw(graph_data, graph_options);
}

function loadWorkout(name) {
    $.get({
        url: 'workouts/' + name,
        dataType: 'json',
        success: function(workout) {
            nsteps = workout.steps.length;
            console.log('Loaded workout "' + workout.name + '" with ' + nsteps + ' steps.');
            $("#workout-name").text(workout.name);
            $("#workout-nsteps").text(nsteps);
            theWorkout = workout;
            workoutStepIndex = 0;
            let now = new Date();
            workoutStepStart = now.getTime() / 1000;
        },
        error: function(jqxhr, status) {
            console.log('WORKOUTS ERROR', status);
        }
    });
}

function fetch() {
    if(resetting) return;
    // Look for new data.
    $.ajax({
        url: 'monitor/' + clientID,
        dataType: 'json',
        timeout: 250,
        success: function(data) {
            if(data.dt1 != undefined) {
                update_data(data);
            }
            else if(data.busy != undefined) {
                clearInterval(fetcher);
                fetcher = null;
                clearInterval(timer);
                timer = null;
                alert("Server is busy with " + data.busy);
            }
        },
        error: function(jqxhr, status) {
            console.log('ERROR', status);
        }
    });
}

function debugfetch() {
    if(resetting) return;
    // Look for new data.
    $.ajax({
        url: 'monitor/' + clientID,
        dataType: 'json',
        timeout: 250,
        success: function(data) {
            if(data.count != undefined) {
                let line = $("<div>").text(
                    "count=" + data.count +
                    ", dt1=" + data.dt1.toFixed(3) +
                    ", dt2=" + data.dt2.toFixed(3) +
                    ", t=" + data.t.toFixed(3));
                line.appendTo("div#debug");
            }
            else if(data.busy != undefined) {
                clearInterval(fetcher);
                fetcher = null;
                alert("Server is busy with " + data.busy);
            }
        },
        error: function(jqxhr, status) {
            console.log('MONITOR ERROR', status);
        }
    });
}

function reset() {
    // Ignore a new reset request while we are still waiting for the response
    // from an earlier one.
    if(resetting) return;
    resetting = true;
    // Clear any existing interval timers.
    if(fetcher != null) {
        clearInterval(fetcher);
        fetcher = null;
    }
    if(timer != null) {
        clearInterval(timer);
        timer = null;
    }
    // Send a reset request to the server.
    $.get({
        url: 'reset/' + clientID,
        success: function(data) {
            console.log("Reset response:", data);
            if(data.status == 'busy') {
                alert("Server is busy with " + data.other);
            }
            else if($("div#debug").length) {
                fetcher = setInterval(debugfetch, 500);
            }
            else {
                stack = [];
                start_time = new Date().getTime() / 1000;
                if(graph_data != null) {
                    graph_data.removeRows(0, graph_data.getNumberOfRows());
                    graph.draw(graph_data, graph_options);
                }
                update_time();
                count = 0;
                $("#COUNT").text('0');
                // Load the Visualization API and the corechart package.
                google.charts.load('current', {'packages':['corechart']});
                google.charts.setOnLoadCallback(init_graph);
                $("#reset").click(reset);
                fetcher = setInterval(fetch, 500);
                timer = setInterval(update_time, 500);
                if(urlParams.has('workout')) {
                    // Load the requested workout.
                    loadWorkout(urlParams.get('workout'));
                }
                console.log('reset at', start_time);
            }
            resetting = false;
        },
        error: function(jqxhr, status) {
            console.log('RESET ERROR', status);
        }
    });
}

function run() {
    // Generate our client id which is just the current time with ms resolution.
    clientID = Date.now();
    console.log('Generated clientID', clientID);
    // Parse any query string.
    urlParams = new URLSearchParams(window.location.search);
    console.log('URL params', urlParams);
    // Perform an initial reset.
    reset();
}

$(document).ready(run);

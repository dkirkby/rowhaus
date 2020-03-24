var start_time = null;
var count = null;
var last_dt1 = null;
var dt1_history = null;
const max_history = 100;
const avg_cycles = 6;
var graph_data = null;
var graph = null;

function zeropad(value) {
    return (value < 10) ? "0" + value : "" + value;
}

function update_time() {
    let t = new Date() - start_time;
    $("#hours").text(zeropad(Math.floor( (t/(1000*60*60)) % 24)));
    $("#mins").text(zeropad(Math.floor( (t/1000/60) % 60)));
    $("#secs").text(zeropad(Math.floor( (t/1000) % 60)));
}

function update_data(data) {
    count++;
    $("#COUNT").text(Math.round(count/2, 0));
    if(dt1_history.length == avg_cycles) {
        // Remove the oldest entry from the front.
        dt1_history.shift();
    }
    // Append the newest entry to the end.
    dt1_history.push(data.dt1);
    if(dt1_history.length >= avg_cycles) {
        // Use the recent cycles to calculate the running SPM.
        let sum = dt1_history.slice(-avg_cycles).reduce(
            (acc, val) => acc + val, 0);
        let spm = 30 * avg_cycles / sum;
        $("#SPM").text(spm.toFixed(1));
        // Update the graph.
        graph_data.push({x: count, y: spm});
        graph.render();
    }
}

function fetch() {
    // Look for new data.
    $.ajax({
        url: 'monitor',
        dataType: 'json',
        timeout: 250,
        success: function(data) {
            if(data.dt1 != undefined) {
                update_data(data);
            }
        },
        error: function(jqxhr, status) {
            console.log('ERROR', status);
        }
    });
}

function reset() {
    $.get({
        url: 'reset',
        success: function(data) {
            start_time = new Date();
            update_time();
            count = 0;
            $("#COUNT").text('0');
            $("#SPM").text('0.0');
            dt1_history = [];
            graph_data = [];
            graph = new CanvasJS.Chart("graph", {
                theme: "light2",
                data: [{
                    type: "line",
                    dataPoints: graph_data
                }]
            });
        }
    });
    console.log('reset at', start_time);
}

function run() {
    reset();
    $("#reset").click(reset);
    let fetcher = setInterval(fetch, 1000);
    let timer = setInterval(update_time, 1000);
}

$(document).ready(run);

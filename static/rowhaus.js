var start_time = null;
var count = null;
var stack = null;
const max_stack = 64;
const max_age = 30; // only use data more recent than this for current stats, in seconds
var graph_data = null;
var graph = null;
var graph_options = {
    title: null,
    legend: 'none',
    hAxis: { format: 'h:mm' }
};
var gauge_data = null;
var gauge = null;
var gauge_options = {
    min: 0, max: 40,
    redFrom: 30, redTo: 40,
    yellowFrom: 20, yellowTo: 30,
    minorTicks: 5
};
var resetting = false;

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
    let nwindow = 0;
    for(let i = stack.length - 1; i >= 0; i--) {
        let age = tnow - stack[i].t;
        if(age > max_age) break;
        nwindow++;
    }
    let spm = 30 * nwindow / max_age;
    // Update the graph.
    graph_data.addRow([now, spm]);
    graph.draw(graph_data, graph_options);
    // Update the gauge.
    gauge_data.setValue(0, 1, spm);
    gauge.draw(gauge_data, gauge_options);
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

function fetch() {
    if(resetting) return;
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
    if(resetting) return;
    resetting = true;
    $.get({
        url: 'reset',
        success: function(data) {
            stack = [];
            start_time = new Date().getTime() / 1000;
            if(graph_data != null) {
                graph_data.removeRows(0, graph_data.getNumberOfRows());
                graph.draw(graph_data, graph_options);
            }
            update_time();
            count = 0;
            $("#COUNT").text('0');
            console.log('reset at', start_time);
            resetting = false;
        }
    });
}

function init_graph() {
    graph_data = new google.visualization.DataTable();
    graph_data.addColumn('date', 'Time');
    graph_data.addColumn('number', 'SPM');
    graph = new google.visualization.LineChart(document.getElementById('graph'));
    graph.draw(graph_data, graph_options);
    gauge_data = google.visualization.arrayToDataTable([
        ['Label', 'Value'],
        ['SPM', 0]
    ]);
    gauge = new google.visualization.Gauge(document.getElementById('gauge'));
    gauge.draw(gauge_data, gauge_options);
}

function run() {
    reset();
    // Load the Visualization API and the corechart package.
    google.charts.load('current', {'packages':['corechart', 'gauge']});
    google.charts.setOnLoadCallback(init_graph);
    $("#reset").click(reset);
    let fetcher = setInterval(fetch, 500);
    let timer = setInterval(update_time, 500);
}

$(document).ready(run);

var start_time = null;
var count = null;

function zeropad(value) {
    return (value < 10) ? "0" + value : "" + value;
}

function update_time() {
    var t = new Date() - start_time;
    $("#hours").text(zeropad(Math.floor( (t/(1000*60*60)) % 24)));
    $("#mins").text(zeropad(Math.floor( (t/1000/60) % 60)));
    $("#secs").text(zeropad(Math.floor( (t/1000) % 60)));
}

function update_data(data) {
    count++;
    $("#COUNT").text(Math.round(count/2, 0));
}

function fetch() {
    // Look for new data.
    $.ajax({
        url: 'monitor',
        dataType: 'json',
        timeout: 250,
        success: function(data) {
            console.log(data);
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
        }
    });
    console.log('reset at', start_time);
}

function run() {
    reset();
    $("#reset").click(reset);
    var fetcher = setInterval(fetch, 1000);
    var timer = setInterval(update_time, 1000);
}

$(document).ready(run);

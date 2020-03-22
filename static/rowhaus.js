var start_time = null;
var last_count = 0;
var start_count = null;

function zeropad(value) {
    if(value < 10) {
        return "0" + value;
    }
    return "" + value;
}

function update_time() {
    var t = new Date() - start_time;
    $("#hours").text(zeropad(Math.floor( (t/(1000*60*60)) % 24)));
    $("#mins").text(zeropad(Math.floor( (t/1000/60) % 60)));
    $("#secs").text(zeropad(Math.floor( (t/1000) % 60)));
}

function update_data(data) {
    last_count = data["count"];
    $("#COUNT").text(last_count - start_count);
}

function fetch() {
    console.log('fetch');
    // Look for new data.
    $.ajax({
        url: 'monitor',
        dataType: 'json',
        //timeout: 250,
        success: function(data) {
            update_data(data)
        },
        error: function(jqxhr, status) {
            console.log('ERROR', status);
        }
    });
}

function reset() {
    start_time = new Date();
    start_count = last_count;
    console.log('reset at', start_time);
}

function run() {
    reset();
    var fetcher = setInterval(fetch, 500);
    var timer = setInterval(update_time, 1000);
}

$( document ).ready(run);

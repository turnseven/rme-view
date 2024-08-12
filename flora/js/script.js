function showDelayed() {
    $( ".product-selection" ).fadeIn();
    scrollDown('#video');
}

function buttonDelayed() {
    $( ".product-selection" ).fadeIn();
    scrollDown('#purchase');
}

function scrollDown(target) {
    $('html, body').animate({
        scrollTop: $(target).offset().top
    });
}

// Test Drop Time
var dropDownTime = 8000;
// Actual Drop Time
// var dropDownTime = 283000;
var daysToCookieExpires = 30; // cookie stays in browser this many days
var pageCookieName = "radflora";

if(document.cookie.indexOf(pageCookieName) > -1) {
    // Already visited.
    console.log('button will drop in 5 seconds')
    setTimeout("showDelayed()", 5000);
} else {
    // First visit.
    console.log('button will drop in 8 seconds during testing, and 367 in production')
    setTimeout("buttonDelayed()", dropDownTime);
    CreateCookie(pageCookieName,"yes");
}

function CreateCookie(name, value) {
    var exp   = '';
    var today = new Date();
    var cookieExpirationDate = today.getTime() + (daysToCookieExpires * 24 * 60 * 60 * 1000);
    today.setTime(cookieExpirationDate);
    document.cookie = name + '=' + value + '; path=/; expires=' + today.toGMTString();
}
// GET ALL OFFERS ON PAGE
const offers             = document.querySelectorAll('.offer');
const summary            = document.querySelector('.summary');

const confirmation_email = document.querySelector('.confirmation_email');
const shipping_address   = document.querySelector('.shipping_address');
const shipping_city      = document.querySelector('.shipping_city');
const shipping_state     = document.querySelector('.shipping_state');
const shipping_zip       = document.querySelector('.shipping_zip');

let offer;

$(function() {

  if (Object.keys(CUSTOMER).length != 0) {
    // RENDER ORDER DETAILS
    confirmation_email.innerHTML = CUSTOMER.emailAddress;
    shipping_address.innerHTML   = CUSTOMER.shipping.address.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
    shipping_city.innerHTML      = CUSTOMER.shipping.city.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
    shipping_state.innerHTML     = CUSTOMER.shipping.state.toUpperCase();
    shipping_zip.innerHTML       = CUSTOMER.shipping.zip;
  }

  if (ORDER_SUMMARY.length != 0) {
    // RENDER ORDER SUMMARY
    createPurchaseSummary(ORDER_SUMMARY)    
  }


});  

// WHEN A NEW PURCHASE IS MADE:
$(function() {
  $('.one-click-purchase-cta').click(function (event) {
    event.preventDefault();

    // 1. GET OFFER ID FOR OFFER SCROLLING
    offer = $(this).data('offer-id');

    // 2. GET PRODUCT ID FOR ORDER PROCESSING
    let productId = $(this).data('product-id');

    // 3. PROCESS ORDER
    _ProcessPayment(productId, (response)=>{

      console.log(response)

      switch(response.error) {
        case false:
          success(productId, offer)
          ORDER_SUMMARY.push(response.product)
          break;
        case true:
          failure(productId, offer)
          break;          
        default:
          return
      }

      // RENDER FULL LIST OF PURCHASES
      createPurchaseSummary(ORDER_SUMMARY)      

    })

  });    

});


// END TEST OBJECT

// HELPERS

function createPurchaseSummary(purchaseArray) {
  let order_summary_pids = [];

  // GET DOM ELEMENT FOR PURCHASE LIST
    let purchaseList = document.getElementById("purchaseList");
    
  // IF DOM ELEMENT IS NOT EMPTY, CLEAR IT
    if (purchaseList.childElementCount > 0) {
      while (purchaseList.firstChild) {
        purchaseList.removeChild(purchaseList.firstChild);
      }      
    }

  // FOR EACH ELEMENT IN THE ORDER_SUMMARY ARRAY, RENDER A ROW AND ADD TO TABLE
  // THIS WILL INCLUDE COMPLETED PURCHASES (FROM PREVIOUS PAGES), AND NEW PURCHASES MADE ON THIS PAGE
    purchaseArray.forEach((item) => {
      order_summary_pids.push(item.id)

      let row = document.createElement('tr');

      // If image_url is empty, assign placeholder
      if (item.image_url == '') {
        item.image_url = "image/transparent-placeholder.png?fit=max&auto=format"
      }

      if (item.alternate_name && item.alternate_name != '') {
        item.name = item.alternate_name
      }

      row.innerHTML = '<tr><td><img loading="lazy" src="' + item.image_url + '" alt="' + item.name + '"></td><td class="product_name">' + item.name + '<br><span class="shipping_price"><img class="shipping_icon" alt="' + item.shipping_description + '" loading="lazy" src="image/upgrade-box-point-icon3-tan.svg?fit=max&amp;auto=format"> ' + formatValueToCurrency(item.shipping_price) + '</span></td><td class="purchase_price">' + formatValueToCurrency(item.price) + '</td></tr>';
      purchaseList.appendChild(row);
    });

    order_summary_pids.forEach((pid) => {
      disablePurchasedOffers(pid, 'Thank You for Your Purchase');
    })

}

function formatValueToCurrency(value) {
  let formattedValue = '$' + value.toFixed(2);

  switch(formattedValue) {
    case '$0.00':
      return 'FREE'
      break;
    default:
      return formattedValue
  }
}

function success(productId, offer) {

  // disable button. button message: "thank you for your purchase"
  disablePurchasedOffers(productId, 'Thank You for Your Purchase');

  // show green check  
  $( '#processing-modal .icon' ).attr("src","image/green-checkmark-icon.svg");

  // hide processing text
  $( '#processing-modal h4' ).hide();

  // wait a second and hide modal
  setTimeout(() => {
    $('#processing-modal').modal('hide');
  }, "1000");

  // scroll down to next offer
  setTimeout(() => {
    scrollToNextOffer(offer)
    resetModalIcon()
  }, "1500");  
}

function failure(productId, offer) {
  // disable button. button message: "Sorry, we couldn't process your purchase"
  disablePurchasedOffers(productId, 'Sorry, We Couldn\'t Process Your Purchase');

  // show red X
  $( '#processing-modal .icon' ).attr("src","image/red-x-icon.svg");

  // display error on modal: something along the lines of "Transaction Declined"
  $( '#processing-modal h4' ).html('Transaction Denied');

  // wait a second and hide modal
  setTimeout(() => {
    $('#processing-modal').modal('hide');
  }, "1000");

  // wait a second for customer to read disabled button, then scroll down to next offer
  setTimeout(() => {
    scrollToNextOffer(offer)
    resetModalIcon()
  }, "1500");

}

function resetModalIcon() {
  $( '#processing-modal .icon' ).attr("src","https://d1p10q174zjo77.cloudfront.net/template/order/img/processing-animation.gif");
  $( '#processing-modal h4' ).show();
  $( '#processing-modal h4' ).html('Processing');  
}

function scrollToNextOffer(offer) {
  switch(offer) {
    case (offers.length - 1):
      return summary.scrollIntoView({behavior: 'smooth'})
      break;
    default:
      return offers[offer + 1].scrollIntoView({behavior: 'smooth'})
  }
}

function disablePurchasedOffers(productId, message) {
    // 3. GREY AND DISABLE ALL BUTTONS WITH THIS PRODUCT ID
    $('a[data-product-id='+ productId +']').addClass('btn-disabled');

    // 4. CHANGE BUTTON TEXT FOR ALL BUTTONS WITH THIS PRODUCT ID
    $('a[data-product-id='+ productId +']').html(message);

}

// HELPERS

// TIMER

function getTimeRemaining(endtime) {
  var t = Date.parse(endtime) - Date.parse(new Date());
  var seconds = Math.floor((t / 1000) % 60);
  var minutes = Math.floor((t / 1000 / 60) % 60);
  var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
  var days = Math.floor(t / (1000 * 60 * 60 * 24));
  return {
    'total': t,
    'days': days,
    'hours': hours,
    'minutes': minutes,
    'seconds': seconds
  };
}

function initializeClock(id, endtime) {
  var clock = document.getElementById(id);
 // var daysSpan = clock.querySelector('.days');
 // var hoursSpan = clock.querySelector('.hours');
  var minutesSpan = clock.querySelector('.minutes');
  var secondsSpan = clock.querySelector('.seconds');

  function updateClock() {
    var t = getTimeRemaining(endtime);
   // daysSpan.innerHTML = t.days;
    //hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
    minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
    secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);

    if (t.total <= 0) {
      clearInterval(timeinterval);
      clock.classList.add("hidden")
    }
  }

  updateClock();
  var timeinterval = setInterval(updateClock, 1000);
}

var deadline = new Date(Date.parse(new Date()) + 15 * 60 * 1000);

initializeClock('clockdiv', deadline);

// END TIMER


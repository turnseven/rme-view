/**
 * Dynamically switch out State dropdown depending on Country selection
 * @type {Element}
 */
    // Get references to the dropdown and input fields
const countryDropdown = document.querySelector('#country')
const cityInput       = document.querySelector('#city')
const stateDropdown   = document.querySelector('#state')
const zipInput        = document.querySelector('#zip')
let dynamicShippingId


$(function () {

    let autocomplete
    let address1Field
    let address2Field
    let postalField
    let avoidCreditCardFieldFocus = false

    function initAutocomplete() {
        address1Field = document.getElementById('shipping-address')
        address2Field = document.getElementById('unit')
        postalField   = document.getElementById('zip')
        // Create the autocomplete object, restricting the search predictions to
        // addresses in the US and Canada.
        autocomplete = new google.maps.places.Autocomplete(address1Field, {
            componentRestrictions: {country: countryCodes},
            fields               : ['address_components', 'geometry'],
            types                : ['address']
        })
        // address1Field.focus();
        // When the user selects an address from the drop-down, populate the
        // address fields in the form.
        autocomplete.addListener('place_changed', fillInAddress)
    }

    function fillInAddress() {
        // Get the place details from the autocomplete object.
        const place  = autocomplete.getPlace()
        let address1 = ''
        let postcode = ''

        // Get each component of the address from the place details,
        // and then fill-in the corresponding field on the form.
        // place.address_components are google.maps.GeocoderAddressComponent objects
        // which are documented at http://goo.gle/3l5i5Mr
        for (const component of place.address_components) {
            // @ts-ignore remove once typings fixed
            const componentType = component.types[0]

            switch (componentType) {
                case 'street_number':
                    address1 = `${component.long_name} ${address1}`
                    break
                case 'route':
                    address1 += component.short_name
                    break
                case 'postal_code':
                    postcode = `${component.long_name}${postcode}`
                    break
                case 'postal_code_prefix':
                    postcode = `${component.long_name} ${postcode}`
                    break
                case 'postal_code_suffix':
                    postcode = `${postcode}-${component.long_name}`
                    break
                case 'locality':
                    // Normalize the string and remove accents
                    document.getElementById('city').value = component.long_name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                    break
                case 'administrative_area_level_1':
                    // Normalize the string and remove accents
                    let normalized                         = component.long_name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                    document.getElementById('state').value = normalized.toLowerCase()

                    // Check if the operation was successful
                    if (document.getElementById('state').value !== normalized.toLowerCase()) {
                        document.getElementById('state').focus()
                        avoidCreditCardFieldFocus = true
                    }
                    break
                case 'country':
                    if (countryDropdown.value !== component.short_name) {

                        document.getElementById('country').value = component.short_name
                        // Create a new 'change' event
                        let event                                = new Event('change', {
                            bubbles   : true,
                            cancelable: true
                        })

                        // Dispatch the event
                        document.getElementById('country').dispatchEvent(event)
                    }
                    break
            }
        }

        address1Field.value = address1
        postalField.value   = postcode
        // After filling the form with address components from the Autocomplete
        // prediction, set cursor focus on the second address line to encourage
        // entry of subpremise information such as apartment, unit, or floor number.
        if (!avoidCreditCardFieldFocus) {
            document.getElementById('card_number').focus()
        }
    }

    window.initAutocomplete = initAutocomplete

    google.maps.event.addDomListener(window, 'load', initAutocomplete)


    function getCreditCardType(cardNumber) {

        if (/^5[1-5]/.test(cardNumber)) {
            return 'master'
        } else if (/^4/.test(cardNumber)) {
            return 'visa'
        } else if (/^3[47]/.test(cardNumber)) {
            return 'amex'
        } else if (/^6(?:011|5[0-9]{2})[0-9]{3,}$/.test(cardNumber)) {
            return 'discover'
        } else if (/^35(?:2[89]|[3-8]\d)\d{12}$/.test(cardNumber)) {
            return 'jcb'
        } else {
            return 'unknown'
        }

    }

    function addCreditCardIcon(type) {

        switch (type) {
            case 'master':
                $('.payment-form__field--credit-card-icon').addClass('payment-form__field--mastercard-credit-card')
                break

            case 'visa':
                $('.payment-form__field--credit-card-icon').addClass('payment-form__field--visa-credit-card')
                break

            case 'amex':
                $('.payment-form__field--credit-card-icon').addClass('payment-form__field--amex-credit-card')
                break

            case 'discover':
                $('.payment-form__field--credit-card-icon').addClass('payment-form__field--discover-credit-card')
                break

            default:
                $('.payment-form__field--credit-card-icon').addClass('payment-form__field--unknown-credit-card')
                break
        }

    }

    function handleEvent(event) {

        var type = getCreditCardType($(this).val().replace(/-/g, ''))

        $('#credit-card-type').val(type)


        $(this).val($(this).val().replace(/\D/g, '').match(/.{1,4}|^$/g).join('-'))

        $('.payment-form__field--credit-card-icon').removeClass('payment-form__field--unknown-credit-card payment-form__field--discover-credit-card payment-form__field--mastercard-credit-card payment-form__field--visa-credit-card payment-form__field--amex-credit-card')

        addCreditCardIcon(type)


    }

    $(function () {
        // Format Credit Card Number field
        $(document).on('blur input keyup change', '[name="creditCardNumber"]', handleEvent)

        // Phone Number restrict to numbers only
        document.getElementsByName('phoneNumber')[0].addEventListener('input', function (e) {
            e.target.value = e.target.value.replace(/[^0-9]/g, '')
        })
    })

    /*$(function () {
        // Auto Focus on first input field
        $('[name=firstName]').focus()
    })*/


    var postUrl = '/api/limelight/payment'

    $(document).on('click', '.payment-form__next-button', function (e) {

        e.preventDefault()


        // fields & rule sets
        var fieldRules = {
            'firstName'   : ['required', 'numbers letters spaces periods hyphens'],
            'lastName'    : ['required', 'numbers letters spaces periods hyphens'],
            'emailAddress': ['required', 'email'],
            'phoneNumber' : ['required', 'numbers'],

            'shippingAddress1': ['required'],
            'shippingAddress2': ['not required'],
            'shippingCity'    : ['required', 'numbers letters spaces periods hyphens'],
            'shippingState'   : ['required', 'numbers letters spaces periods hyphens'],
            'shippingCountry' : ['required', 'numbers letters spaces periods hyphens'],
            'shippingZip'     : ['required', 'numbers letters spaces periods hyphens'],

            'creditCardNumber': ['required', 'credit card number'],
            'creditCardType'  : ['required', 'letters'],
            'expirationMonth' : ['required', 'numbers'],
            'expirationYear'  : ['required', 'numbers'],
            'cvv'             : ['required', 'numbers letters']

        }

        // Data to be submitted
        var formData = {}

        // Contains error messages
        var formError = []

        // Loop through rule set
        for (var fieldName in fieldRules) {

            // Get field value
            var value = $('[name=' + fieldName + ']').val()


            if (fieldName == 'creditCardNumber') {
                // If credit card remove
                value = value.replace(/\D/g, '')
            }

            console.log('value')
            console.log(value)
            console.log(fieldName)

            // Remove uppercase
            value = (value) ? value.toLowerCase() : ''


            // Remove previous border styling
            $('[name=' + fieldName + ']').css({'border': '1px solid #dedede'})


            // Get field rules
            var rule = fieldRules[fieldName]


            // Add form data to object
            formData[fieldName] = value


            // Check if Required
            if (rule.indexOf('required') !== -1) {

                if (value === '' || value == undefined) {

                    // field name
                    // failed rule
                    // failed message

                    var errorData = {
                        'fieldName'    : fieldName,
                        'failedRule'   : 'required',
                        'failedMessage': 'Field Required'
                    }

                    formError.push(errorData)

                }

            }


            // Check if Credit Card Number
            if (rule.indexOf('credit card number') !== -1) {

                if (!(/[0-9\-]/).test(value)) {

                    var errorData = {
                        'fieldName'    : fieldName,
                        'failed_Rule'  : 'credit card number',
                        'failedMessage': 'Field should only contain Numbers & hyphens'
                    }

                    formError.push(errorData)

                    console.log('field should only contain Numbers & hyphens')
                }

            }


            // Check if Number
            if (rule.indexOf('numbers') !== -1) {

                if (!(/^\d+$/).test(value)) {

                    var errorData = {
                        'fieldName'    : fieldName,
                        'failedRule'   : 'numbers',
                        'failedMessage': 'Field should only contain Numbers'
                    }

                    formError.push(errorData)

                    console.log('field should only contain numbers')
                }

            }

            // Check if is numbers & letters
            if (rule.indexOf('letters') !== -1) {

                if (!(/^[a-zA-Z]+$/).test(value)) {

                    var errorData = {
                        'fieldName'    : fieldName,
                        'failedRule'   : 'letters',
                        'failedMessage': 'Field should only contain Letters'
                    }

                    formError.push(errorData)

                    console.log('field should only contain letters')
                }

            }

            // Check if is numbers & letters
            if (rule.indexOf('numbers letters spaces periods hyphens') !== -1) {

                if (!(/^[0-9a-zA-Z\s-.']+$/).test(value)) {

                    var errorData = {
                        'fieldName'    : fieldName,
                        'failedRule'   : 'numbers letters',
                        'failedMessage': 'Field should only contain Numbers, Letters, Periods, Spaces & hyphens'
                    }

                    formError.push(errorData)

                    console.log('field should only contain numbers and letters')
                }

            }

            // Check if it is Email Address
            if (rule.indexOf('email') !== -1) {

                console.log('check email')

                if (!(/^([\w_\.\-\+])+\@([\w\-]+\.)+([\w]{2,10})+$/).test(value)) {
                    var errorData = {
                        'fieldName'    : fieldName,
                        'failedRule'   : 'email',
                        'failedMessage': 'Field should be formatted like an Email Address'
                    }

                    formError.push(errorData)


                    console.log('field should be formatted like an Email Address')
                }

            }


            // Check if Email Address matches
            if (rule.indexOf('match') !== -1) {

                console.log('check email match')

                if ($('[name=emailAddress]').val() !== $('[name=confirmEmailAddress]').val()) {

                    var errorData = {
                        'fieldName'    : fieldName,
                        'failedRule'   : 'match',
                        'failedMessage': 'Field should match Email Address'
                    }

                    formError.push(errorData)

                    console.log('field should be match Confirm Email Address')
                }

            }

        }


        console.log(formError)


        if (formError.length) {

            for (var error in formError) {

                // Select & add border to field with error
                var fieldSelect = $('[name=' + formError[error].fieldName + ']')

                fieldSelect.css({'border': '1px solid #ff0000'})

                // focus on the first field with an error
                if (error == 0) {
                    fieldSelect.focus()
                    $('.error-message').css({'display': 'block'})
                    $('.form-error').html(formError[error].failedMessage)
                }

            }


            return

        } else {
            // Clear error message
            $('.form-error').html('')
            $('.error-message').css({'display': 'none'})
        }


        // Processing Messages
        $('.payment-form__next-button').prop('disabled', true).text('Processing...')
        $('#processing-modal').modal('show')

        var formInformation = {

            // Shipping Details
            'firstName'       : $('[name=firstName]').val(),
            'lastName'        : $('[name=lastName]').val(),
            'emailAddress'    : $('[name=emailAddress]').val(),
            'phoneNumber'     : $('[name=phoneNumber]').val(),
            'shippingAddress1': $('[name=shippingAddress1]').val(),
            'shippingAddress2': $('[name=shippingAddress2]').val(),
            'shippingCountry' : $('[name=shippingCountry]').val(),
            'shippingCity'    : $('[name=shippingCity]').val(),
            'shippingZip'     : $('[name=shippingZip]').val(),
            'shippingState'   : $('[name=shippingState]').val(),

            // Payment Details
            'creditCardNumber': $('[name=creditCardNumber]').val().replace(/\D/g, ''),
            'creditCardType'  : $('[name=creditCardType]').val(),
            'expirationMonth' : $('[name=expirationMonth]').val(),
            'expirationYear'  : $('[name=expirationYear]').val(),
            'cvv'             : $('[name=cvv]').val()
            // 'billingZip'       : $('[name=billingZip]').val(),
            // 'shippingMethod'   : 2

        }

        if (typeof toggle !== 'undefined') {
            formInformation.switch = toggle
        }

        // Google Optimize
        if (typeof optimizeExperimentId !== 'undefined') {
            formInformation.optimizeExperimentId = optimizeExperimentId
        }

        if (typeof optimizeVariationId !== 'undefined') {
            formInformation.optimizeVariationId = optimizeVariationId
        }

        if (typeof domainId !== 'undefined') {
            formInformation.domainId = domainId
        }

        if (typeof pathId !== 'undefined') {
            formInformation.pathId = pathId
        }

        if (typeof pageId !== 'undefined') {
            formInformation.pageId = pageId
        }
        if (typeof ipCountry !== 'undefined') {
            formInformation.ipCountry = ipCountry
        }

        try {
            // Add Quiz Data
            let quizData = getCookie('quiz_cookie')

            if (quizData !== '') {
                quizData = JSON.parse(quizData)

                const properties = [
                    'rme_fatigue',
                    'rme_digestion',
                    'rme_exercise_frequency',
                    'rme_height',
                    'rme_goals',
                    'rme_nutrition',
                    'rme_issues_having',
                    'rme_life_changes',
                    'rme_weight',
                    'rme_age',
                    'rme_commitment'
                ]

                // Function to make strings URL safe
                function makeUrlSafe(str) {
                    // Remove double quotes
                    str = str.replace(/"/g, '')
                    // Replace spaces and parentheses with hyphens
                    str = str.replace(/[\s()]/g, '-')
                    // Remove commas
                    str = str.replace(/,/g, '_')
                    return str
                }

                properties.forEach(prop => {
                    if (quizData.hasOwnProperty(prop)) {
                        let safeValue         = JSON.stringify(quizData[prop])
                        // Make the value URL safe
                        safeValue             = makeUrlSafe(safeValue)
                        formInformation[prop] = safeValue
                    }
                })
            }

        } catch (e) {
            console.error(e)
        }

        // Actually Send
        $.ajax({
            type   : 'post',
            url    : postUrl,
            data   : formInformation,
            success: function (resp) {

                $('html, body').animate({
                    scrollTop: ($('.payment-form').first().offset().top)
                }, 500)

                // Success
                if (resp.status == true) {

                    var redirectPath = resp[0]

                    // Google Analytics Enhanced Ecommerce
                    if (typeof pushDataLayer === 'function' && window['google_tag_manager']) {
                        pushDataLayer(resp.transaction, resp.product, function (id) {
                            window.location.href = redirectPath
                        })
                    } else {
                        window.location.href = redirectPath
                    }


                } else {

                    $('.payment-form__next-button').prop('disabled', false).text('Complete Your Order')
                    $('#processing-modal').modal('hide')

                    $('.error-message').css({'display': 'block'})
                    $('.form-error').html(resp.errorMessage)
                }

            },
            error  : function () {
                console.log('error')
            }

        })


    })

})


document.addEventListener('DOMContentLoaded', function () {
    var yearDropdown = document.querySelector('select[name=\'expirationYear\']')
    while (yearDropdown.options.length > 1) {
        yearDropdown.remove(1)
    }

    var currentYear = new Date().getFullYear()

    for (var i = currentYear; i <= (currentYear + 10); i++) {
        var option       = document.createElement('option')
        option.innerHTML = i
        option.value     = i.toString().substring(2)
        yearDropdown.appendChild(option)
    }
})

var spd = 100;
    var spdVal = 10;
    var initialMinutes = 13;
    var initialSeconds = 34;
    var cntDown = (initialMinutes * 60 + initialSeconds) * spdVal;
   


    setInterval(function () {
        var mn, sc, ms;
        cntDown--;
        if(cntDown < 0) {
            return false;
        }
        mn = Math.floor((cntDown / spdVal) / 60 );
        mn = (mn < 10 ? '0' + mn : mn);
        sc = Math.floor((cntDown / spdVal) % 60);
        sc = (sc < 10 ? '0' + sc : sc);
        ms = Math.floor(cntDown % spdVal);
        ms = (ms < 10 ? '0' + ms : ms);
        var result = mn + ':' + sc;
        document.getElementById('stopwatch').innerHTML = result;
    }, spd);
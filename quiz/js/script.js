'use strict';

var userResponses = {};  // Object to store user responses
var results = [];        // Array to store results

// Extract URL search parameters
const _SEARCH_PARAMS = new URLSearchParams(window.location.search);

// Get specific URL parameters or set to false if not present
const _UTM_SOURCE = _SEARCH_PARAMS.get('utm_source') || false;
const _STEP_OVERRIDE = _SEARCH_PARAMS.get('step_override') || false;

// Split the UTM source if it exists, otherwise set to false
const _SPLIT_UTM_SOURCE = (_UTM_SOURCE) ? _UTM_SOURCE.split('_') : false;


if (_UTM_SOURCE) {
    // Convert the UTM source split array to lowercase
    const _LOWER_SPLIT_UTM_SOURCE = _SPLIT_UTM_SOURCE.map(lower => lower.toLowerCase());

    // Check if the UTM source includes 'facebook'
    if (_LOWER_SPLIT_UTM_SOURCE.includes('facebook')) {
        console.log('use FB mobile image');
        $('.banner').addClass('container-fluid-height--fb');
    } else {
        console.log('use control image');
        $('.banner').addClass('container-fluid-height--default');
    }

    // Log the traffic source and store it in userResponses
    console.log('traffic source: ' + _UTM_SOURCE);
    userResponses.traffic_source = _UTM_SOURCE;

} else {
    // Default case when UTM source is not present
    console.log('use FB mobile image -- default');
    $('.banner').addClass('container-fluid-height--fb');
}


var quizStep;
var vidalyticsPlayerAPI = null;
var EMBED_CODE_ID = null;
var PLAYER_INITIALIZED = false;

// Switch statement to handle different step overrides
switch (_STEP_OVERRIDE) {
    case 'videoVerification':
        quizStep = 10;
        initiateTechTest();
        break;

    case 'refresh':
        if (getQuizCookie('quiz_cookie')) {
            try {
                var parsedCookie = JSON.parse(getQuizCookie('quiz_cookie'));

                userResponses.rmrInfo = {};
                userResponses.rmrInfo.age = parsedCookie.rme_age;
                userResponses.rmrInfo.weight = parsedCookie.rme_weight;
                userResponses.rmrInfo.height = parsedCookie.rme_height;
                userResponses.rmr = parsedCookie.rme_rmr;
                userResponses.commitment = parsedCookie.rme_commitment;
                userResponses.digestion = parsedCookie.rme_digestion;
                userResponses.exerciseFrequency = parsedCookie.rme_exercise_frequency;
                userResponses.fatigue = parsedCookie.rme_fatigue;
                userResponses.goals = parsedCookie.rme_goals;
                userResponses.lifeChanges = parsedCookie.rme_life_changes;
                userResponses.nutrition = parsedCookie.rme_nutrition;
                userResponses.wholeBodyImpact = parsedCookie.rme_issues_having;
                userResponses.traffic_source = parsedCookie.rme_traffic;

            } catch (error) {
                console.error(error);
                window.location.replace("https://14daymetabolismreset.com/assessment/order");
            }

        } else {
            userResponses.rmrInfo = {};
            userResponses.rmrInfo.age = _SEARCH_PARAMS.get('age') || false;
            userResponses.rmrInfo.weight = _SEARCH_PARAMS.get('weight') || false;
            userResponses.rmrInfo.height = _SEARCH_PARAMS.get('height') || false;
            userResponses.rmr = _SEARCH_PARAMS.get('rmr') || false;
            userResponses.commitment = _SEARCH_PARAMS.get('commitment') || false;
            userResponses.goals = _SEARCH_PARAMS.get('goals') || false;
        }
        quizStep = 11;
        break;

    default:
        quizStep = 0;
}

// Store the referrer URL
var referrer = document.referrer;


$(function () {
    /**
     * Quiz object that handles the quiz flow, data storage, and rendering.
     */
    var a = {
        /**
         * Data structure holding the quiz steps, questions, answers, and directions.
         * @type {Array<Object>}
         */
        data: [
            {
                question: 'Step 1: What Is Your Resting Metabolic Rate?',
                answers: [],
                directions: {
                    title: '',
                    text: 'Your Resting Metabolic Rate (RMR) is how many calories it takes to “run” your body’s basic processes every day: breathing, circulation, digestion, etc.<br /><br />In other words, if you spend 24 hours sitting on the couch, doing nothing but watching Gilmore Girls, that’s your RMR.<br /><br /><img src=\'image/rmr-pie-chart.png?auto=format&w=475&h=189\' alt=\'RMR Pie Chart\' loading=\'lazy\' class=\'img-responsive center-block\'><br />Your RMR accounts for 70% of the calories you burn every day - so the key to healthy, lasting weight loss is to crank it up.<br /><br />Like a thermostat, if you turn up the dial on your RMR, your body will naturally burn more calories.<br /><br />Let’s calculate your RMR:'
                },
                type: '',
                selection: []
            },
            {
                question: 'Step 2: Your RMR Results',
                answers: [],
                directions: {
                    title: '',
                    text: 'Your RMR is about <span id=\'rmr\'></span> calories per day. This is based on data for the “average” American woman of your age, height, and weight. Please note that it could be up to 20% higher, or lower.<br><br>The biggest determinant of your RMR is the amount of lean muscle tissue on your body. Muscle tissue requires a lot of energy from your metabolism, whereas fat tissue requires much less. This is why weight gain is often a “vicious cycle” - the more fat on your body, the slower your RMR runs.<br><br>Losing fat alone will not increase your RMR. This is why many people who focus exclusively on diet and fat loss struggle to keep weight off. The key to lasting weight loss is to replace fat tissue, with lean muscle tissue.<br><br> That’s how the 14 Day Metabolism Reset Works. Let’s see how much you could boost your RMR, and how much weight you could lose.'
                },
                type: '',
                selection: []
            },
            {
                question: 'Step 3: Exercise Frequency',
                answers: [
                    { icon: '', option: 'I Exercise 5+ Days Per Week' },
                    { icon: '', option: 'I Exercise 3-5 Days Per Week' },
                    { icon: '', option: 'I Exercise Less Than 3 Days Per Week' }
                ],
                directions: {
                    title: '',
                    text: 'How often do you exercise every week?<br><br> I count exercise as anything that gets your heart rate up for at least 20 minutes a day. <br><br>Pro Tip: Not all exercise is created equal! Your body burns more calories in twenty minutes of sprinting or HIIT than it does in an hour on the treadmill at 6mph. And remember, the best types of exercise help you build muscle, at the same time as you burn fat. That’s the way to increase your RMR.'
                },
                type: 'radio',
                selection: []
            },
            {
                question: 'Step 4: Digestion',
                answers: [],
                directions: {
                    title: '',
                    text: 'Do you have any of the following issues with digestion? Any of the following can indicate that your metabolism is not processing food correctly.'
                },
                type: '',
                selection: []
            },
            {
                question: 'Step 5: Fatigue',
                answers: [],
                directions: {
                    title: '',
                    text: 'Do you frequently feel tired at any of the following points during the day? Occasional fatigue is expected during waking hours, during times of stress or intensity. But if your body is often tired at the same time every day, it could be linked to your metabolism, and more specifically, your blood sugar levels.'
                },
                type: '',
                selection: []
            },
            {
                question: 'Step 6: Life Changes',
                answers: [],
                directions: {
                    title: '',
                    text: 'Have you experienced any of the following major life events recently? Any of these could impact your resting metabolic rate, so it’s helpful to know about them.'
                },
                type: '',
                selection: []
            },
            {
                question: 'Step 7: Whole Body Impact',
                answers: [],
                directions: {
                    title: '',
                    text: 'Do you deal with any of the following issues? Since your resting metabolic rate is the “power plant” for your body’s energy, it can cause issues in other systems if it’s not working well.'
                },
                type: '',
                selection: []
            },
            {
                question: 'Step 8: Commitment',
                answers: [
                    { icon: '', option: '<b>Max Intensity:</b> Maximum Lean Muscle Growth &#x2b; Maximum Fat Burning' },
                    { icon: '', option: '<b>Medium Intensity:</b> Maximum Lean Muscle Growth &#x2b; Good Fat Burning' },
                    { icon: '', option: '<b>Low Intensity:</b> Good Lean Muscle Growth &#x2b; Low Fat Burning' }
                ],
                directions: {
                    title: '',
                    text: 'In the next 14 days, you’ll do an energy-boosting, 16-20 minute workout every day. This workout will burn fat while you’re doing it, and build lean muscle to crank up your RMR, for lasting results.<br><br> What intensity of workout can you commit to for the next 14 days?<br><br> (Tip: Days 7 and 14 are low-intensity days)'
                },
                type: 'radio',
                selection: []
            },
            {
                question: 'Step 9: Nutrition',
                answers: [],
                directions: {
                    title: '',
                    text: 'In the next 14 days, you’ll fuel your body with filling, delicious, strength-building meals. And don’t worry - even your family will love these plates! Every meal takes 30 minutes or less to prepare.<br><br> And trust me, you won\'t be hungry! The 14-Day Reset is NOT about deprivation. It\'s about eating the right food, at the right time, to boost your RMR and add lean muscle.<br><br> Please customize your nutrition plan by selecting your dietary preference:'
                },
                type: '',
                selection: []
            },
            {
                question: 'Step 10: Goals',
                answers: [
                    { icon: '', option: 'I Have More Than 10 Pounds To Lose' },
                    { icon: '', option: 'I Want To Lose That Last 5-10 Pounds' },
                    { icon: '', option: 'I Want To Get More Sculpted and Toned' }
                ],
                directions: {
                    title: '',
                    text: '<span class=\'center\'>What is your ideal body goal for the 14 Day Reset?</span>'
                },
                type: 'radio',
                selection: []
            },
            {
                question: 'Step 11: Generating Results',
                answers: [],
                directions: { title: '', text: '' },
                type: '',
                selection: []
            },
            {
                question: 'Step 12: Your Results',
                answers: [],
                directions: {
                    title: '',
                    text: '<span class=\'center\'>Congratulations! Since you are <span class="ageRange"></span>, if you can commit to one <span class="intensity"></span> twenty-minute workout per day, and a curated, healthy, delicious meal plan, here is what you could achieve:</span>'
                },
                type: '',
                selection: []
            }
        ],
        /**
         * The current step of the quiz.
         * @type {number}
         */
        step: quizStep,

        /**
         * Initializes the quiz by binding event listeners.
         */
        init: function init() {
            this._bind();
        },

        /**
         * Creates a cookie to store quiz data.
         * @param {string} name - The name of the cookie.
         * @param {string} value - The value of the cookie.
         */
        _createCookie: function (name, value) {
            var daysToCookieExpires = 30;
            var today = new Date();

            var cookieExpirationDate = today.getTime() + (daysToCookieExpires * 24 * 60 * 60 * 1000);
            today.setTime(cookieExpirationDate);

            document.cookie = name + '=' + value + '; path=/; expires=' + today.toGMTString();
        },

        /**
         * Binds event listeners for quiz interactions.
         * @private
         */
        _bind: function _bind() {
            var a = this,
                b = this,
                c = $(document);

            $('.assessment').fadeOut(500);
            $('.progress-bar, .quiz, .steps').fadeIn(500);
            this._renderStep(this.step);

            c.on('click', '.assessment__start-button', function () {
                $('.assessment').fadeOut(500);
                $('.progress-bar, .quiz, .steps').fadeIn(500);
                a._renderStep(a.step);
            });

            c.on('click', '.quiz__get-results', this._validateGetResults);

            c.on('click', '.quiz__backward', function () {
                0 === a.step || (--a.step, a._renderStep(), console.log('Backward Step: '.concat(a.step)));
                EMBED_CODE_ID = null;
                $('.video__container').empty();
                $('.quiz__results').css('display', 'none').css("visibility", "hidden !important");
                $('.quiz__results--alt').css('display', 'none');
                $('.customer-feedback').css('display', 'none');
                $('.guarantee').css('display', 'none');
                $('.quiz__questions').css('display', 'block');
            });

            c.on('click', '.quiz__forward', function () {
                var b = $('input[name="radio"]:checked').val();
                a._nextQuestion();
            });

            c.on('click', '.quiz__skip', function () {
                a._nextQuestion($('button.quiz__skip').data('index'));
            });

            c.on('click', '.quiz__radio', function (a) {
                if (a.target == this) {
                    $('.quiz__option').removeClass('quiz__option--selected');
                    $(this).addClass('quiz__option--selected');
                    var c = $('input[name="radio"]:checked').val();
                    c ||
                    ((c = $('input[name="checkbox"]:checked')
                        .map(function () {
                            return this.value;
                        })
                        .get()),
                    0 === c.length && (c = !1)),
                        (b.data[b.step].selection = c);
                }
            });

            c.on('click', '.quiz__multiple', function (a) {
                a.preventDefault();

                if ($(this).find('input')[0].checked) {
                    $(this).find('input').prop( 'checked', false );
                    $(this).removeClass('quiz__option--selected');
                } else {
                    $(this).find('input').prop( 'checked', true );
                    $(this).addClass('quiz__option--selected');
                }

                $('.quiz__multiple--none').find('input').prop( 'checked', false );
                $('.quiz__multiple--none').removeClass('quiz__option--selected');
            });

            c.on('click', '.quiz__multiple--none', function (a) {
                a.preventDefault();

                if ($(this).find('input')[0].checked) {
                    $(this).find('input').prop( 'checked', false );
                    $(this).removeClass('quiz__option--selected');
                } else {
                    $(this).find('input').prop( 'checked', true );
                    $(this).addClass('quiz__option--selected');
                }

                $('.quiz__multiple').find('input').prop( 'checked', false );
                $('.quiz__multiple').removeClass('quiz__option--selected');
            });

            c.on('click', '.opt-in__button', this._addMaropost);
        },

        /**
         * Renders the current step of the quiz.
         * @private
         */
        _renderStep: function _renderStep() {
            var a = this;
            a._updateProgressBar(function () {
                console.log('Current Step: '.concat(a.step));
                var b = a.data[a.step];
                if (b.directions.title == '' && b.directions.text == '') {
                    $('.quiz__directions').hide();
                } else {
                    $('.quiz__directions').hide();
                    $('.quiz__directions').show();
                    $('.quiz__directions-title').html(b.directions.title);
                    $('.quiz__directions-text').html(b.directions.text);
                }

                $('.quiz__question').html(b.question);
                for (var c, d = '', e = 0; e < b.answers.length; e++)
                    switch (((c = b.answers[e]), b.type)) {
                        case 'single':
                            d += '<div class="quiz__option"><button class="quiz__answer">'.concat(b.answers[e], '</button></div>');
                            break;
                        case 'radio':
                            d += '<label for="option__'
                                .concat(e, '"><div class="quiz__option quiz__radio quiz__forward"><span>')
                                .concat(c.option, '</span><input type="radio" id="option__')
                                .concat(e, '" class="quiz__answer" name="radio" value="')
                                .concat(e, '" tabindex="')
                                .concat(e + 1, '"></div></label>');
                            break;
                        case 'multiple':
                            d += '<label for="option__'
                                .concat(e, '"><div class="quiz__option quiz__multiple">')
                                .concat(c.option, '<input type="checkbox" id="option__')
                                .concat(e, '" class="quiz__answer" name="checkbox" value="')
                                .concat(e, '"></div></label>');
                            break;

                        default:
                            console.error('No type value found.');
                    }
                $('.quiz__answers').html(d);
                0 === a.step ? $('.quiz__controls').addClass('hidden') : $('.quiz__controls').removeClass('hidden');
                0 === a.step ? $('.quiz__backward').addClass('quiz__backward--hide') : $('.quiz__backward').removeClass('quiz__backward--hide');

                0 === a.step ? $('.progress-bar').addClass('hidden') : $('.progress-bar').removeClass('hidden');
                0 === a.step ? $('.desktop-logo').addClass('hidden') : $('.desktop-logo').removeClass('hidden');
                0 === a.step ? $('.banner').show() : $('.banner').hide();
                0 === a.step ? $('.footer').show() : $('.footer').hide();
                a.data.length === a.step + 1
                ? $('.quiz__forward').addClass('quiz__get-results').removeClass('quiz__forward')
                : $('.quiz__get-results')
                    .html(
                        '<svg viewBox="0 0 16 16" fill="none" rotate="0" width="23" height="23" class="css-1tb9nyc-SvgArrowRightIcon">\n                <path d="M.01 7.41H13.6L7.27 1.09 8.15.2l7.86 7.86-8.19 7.87-.86-.9 6.62-6.37H.01V7.41z" fill="currentColor"></path>\n            </svg>'
                    )
                    .removeClass('quiz__get-results')
                    .addClass('quiz__forward');
                // $("html, body").animate({ scrollTop: $(".quiz").offset().top }, 700);

                switch (a.step) {
                    case 0:
                        $('.quiz__answers').html('<form id="rmrCalculate" action="#"><div class="row"><div class="quiz__option quiz__option--alt quiz__input">Your Age:<span>In Years</span></div><div class="row__inner"><div class="row__inner__p">Age:<span class="rendered__value">18</span></div><div class="row__inner__p--alt visible-xs">In Years</div><div class="range-slider"><input class="range-slider__range" name="age" type="range" value="18" min="18" max="95" step="1"><span class="range-slider__value"> 0</span></div></div></div><div class="row"><div class="quiz__option quiz__option--alt quiz__input">Your Height:<span>Feet/Inches</span></div><div class="row__inner"><div class="row__inner__p">Height:<span class="rendered__value"> 4\'00"</span></div><div class="row__inner__p--alt visible-xs">Feet/Inches</div><div class="range-slider"><input class="range-slider__range" name="height" type="range" value="48" min="48" max="89" step="1"><span class="range-slider__value">0</span></div></div></div><div class="row"><div class="quiz__option quiz__option--alt quiz__input">Your Weight:<span>In Pounds</span></div><div class="row__inner"><div class="row__inner__p">Weight:<span class="rendered__value"> 90</span>lbs</div><div class="row__inner__p--alt visible-xs">In Pounds</div><div class="range-slider"><input class="range-slider__range" name="weight" type="range" value="90" min="90" max="400" step="1"><span class="range-slider__value">0</span></div></div></div><div class="spacer"></div><div class="text-center"><button data-index=0 type="submit" class="quiz__next">Calculate <img src="image/white-arrows.png?auto=format&w=20&h=19" loading="lazy" alt="Arrows" class="submit-arrows"></button></div></form>');

                        var rangeSlider = function () {
                            var slider = $('.range-slider'),
                                range = $('.range-slider__range'),
                                value = $('.range-slider__value'),
                                render;

                            slider.each(function () {
                                value.each(function () {
                                    var value = $(this).prev().attr('value');
                                    $(this).html(value);
                                });

                                range.on('input', function () {
                                    if ($(this).attr('name') === 'height') {
                                        render = a._convertInchesToFeetAndInches($('input[name=height]').val());
                                    } else {
                                        render = this.value;
                                    }

                                    $(this).closest('.row__inner').find('.rendered__value').html(' ' + render);
                                });
                            });
                        };

                        rangeSlider();

                        $('#rmrCalculate').submit(function (e) {
                            e.preventDefault();

                            var rmrInfo = {};

                            rmrInfo.age = $('input[name=age]').val();
                            rmrInfo.weight = $('input[name=weight]').val();
                            rmrInfo.height = $('input[name=height]').val();

                            userResponses.rmrInfo = rmrInfo;

                            var rmr = a._calculateRmr(rmrInfo.weight, rmrInfo.height, rmrInfo.age);

                            userResponses.rmr = rmr;
                            console.log(userResponses);

                            $('#overlay').show();

                            var wait = 1500;
                            var selector = '.overlay__processing';

                            setTimeout(function () {
                                $(selector).removeClass('rotate').attr('src', 'image/check-mark.png?auto=format&w=68&h=67');

                                setTimeout(function () {
                                    $('#overlay').fadeOut();
                                }, 500);
                                a._nextQuestion(0);
                            }, wait);
                        });
                        break;
                    case 1:
                        $('.quiz__answers').html('<div class="text-center"><button data-index=1 class="quiz__next quiz__skip" type="button">Let\'s Go <img src="image/white-arrows.png?auto=format&w=20&h=19" loading="lazy" alt="Arrows" class="submit-arrows"></button></div>');
                        $('#rmr').append(userResponses.rmr);
                        break;
                    case 2:
                        $('.quiz__answers').html('<div id="exerciseFrequency"> <label for="option__0"><div class="quiz__option quiz__radio"><span>I Exercise 5+ Days Per Week</span><input data-index=2 type="radio" id="option__0" class="quiz__answer" name="radio" value="0" tabindex="1" /></div> </label> <label for="option__1"><div class="quiz__option quiz__radio"><span>I Exercise 3-5 Days Per Week</span><input data-index=2 type="radio" id="option__1" class="quiz__answer" name="radio" value="1" tabindex="2" /></div> </label> <label for="option__2"><div class="quiz__option quiz__radio"><span>I Exercise Less Than 3 Days Per Week</span><input data-index=2 type="radio" id="option__2" class="quiz__answer" name="radio" value="2" tabindex="3" /></div> </label></div>');
                        a._saveSingleResponse('exerciseFrequency', 2);
                        break;
                    case 3:
                        $('.quiz__answers').html('<form action="#" id="digestion"><div class="row"><label for="option__0"><div class="quiz__multiple quiz__option"><span class="quiz__icon"></span><input class="quiz__answer" type="checkbox" value="Frequent Gas & Bloating" id="option__0" name="checkbox">Frequent Gas & Bloating</div></label><label for="option__1"><div class="quiz__multiple quiz__option"><span class="quiz__icon"></span><input class="quiz__answer" type="checkbox" value="Constipation" id="option__1" name="checkbox">Constipation</div></label><label for="option__2"><div class="quiz__multiple quiz__option"><span class="quiz__icon"></span><input class="quiz__answer" type="checkbox" value="Irregular Bowel Movements" id="option__2" name="checkbox">Irregular Bowel Movements</div></label><label for="option__3"><div class="quiz__multiple quiz__option"><span class="quiz__icon"></span><input class="quiz__answer" type="checkbox" value="Irregular Consistency" id="option__3" name="checkbox">Irregular Consistency</div></label><label for="option__4"><div id="none" class="quiz__multiple--none quiz__option"><span class="quiz__icon"></span><input class="quiz__answer" type="checkbox" value="None" id="option__4" name="checkbox">None Of The Above</div></label></div><div class="text-center"><button type="submit" data-index="3" class="quiz__next">Next <img src="image/white-arrows.png?auto=format&w=20&h=19" loading="lazy" alt="Arrows" class="submit-arrows"></button></div></form>');
                        a._saveMultipleResponses('digestion');
                        break;
                    case 4:
                        $('.quiz__answers').html('<form action="#" id="fatigue"><div class="row"><label for="option__0"><div class="quiz__multiple quiz__option"><span class="quiz__icon"></span><input class="quiz__answer" type="checkbox" value="When I Wake Up" id="option__0" name="checkbox">When I Wake Up</div></label><label for="option__1"><div class="quiz__multiple quiz__option"><span class="quiz__icon"></span><input class="quiz__answer" type="checkbox" value="Mid-Morning" id="option__1" name="checkbox">Mid-Morning</div></label><label for="option__2"><div class="quiz__multiple quiz__option"><span class="quiz__icon"></span><input class="quiz__answer" type="checkbox" value="After Lunch" id="option__2" name="checkbox">After Lunch</div></label><label for="option__3"><div class="quiz__multiple quiz__option"><span class="quiz__icon"></span><input class="quiz__answer" type="checkbox" value="Late-Afternoon" id="option__3" name="checkbox">Late-Afternoon</div></label><label for="option__4"><div id="none" class="quiz__multiple--none quiz__option"><span class="quiz__icon"></span><input class="quiz__answer" type="checkbox" value="None" id="option__4" name="checkbox">My Energy Is Great All Day</div></label></div><div class="text-center"><button data-index="4" type="submit" class="quiz__next">Next <img src="image/white-arrows.png?auto=format&w=20&h=19" loading="lazy" alt="Arrows" class="submit-arrows"></button></div></form>');
                        a._saveMultipleResponses('fatigue');
                        break;
                    case 5:
                        $('.quiz__answers').html('<form action="#" id="lifeChanges"><div class="row"><label for="option__0"><div class="quiz__multiple quiz__option"><span class="quiz__icon"></span><input class="quiz__answer" type="checkbox" value="Childbirth" id="option__0" name="checkbox">Childbirth</div></label><label for="option__1"><div class="quiz__multiple quiz__option"><span class="quiz__icon"></span><input class="quiz__answer" type="checkbox" value="Menopause" id="option__1" name="checkbox">Menopause</div></label><label for="option__2"><div class="quiz__multiple quiz__option"><span class="quiz__icon"></span><input class="quiz__answer" type="checkbox" value="Major Weight Gain (Over 15 Pounds)" id="option__2" name="checkbox">Major Weight Gain (Over 15 Pounds)</div></label><label for="option__3"><div class="quiz__multiple quiz__option"><span class="quiz__icon"></span><input class="quiz__answer" type="checkbox" value="Intense Stress" id="option__3" name="checkbox">Intense Stress</div></label><label for="option__4"><div id="none" class="quiz__multiple--none quiz__option"><span class="quiz__icon"></span><input class="quiz__answer" type="checkbox" value="None" id="option__4" name="checkbox">None Of The Above</div></label></div><div class="text-center"><button data-index="5" type="submit" class="quiz__next">Next <img src="image/white-arrows.png?auto=format&w=20&h=19" loading="lazy" alt="Arrows" class="submit-arrows"></button></div></form>');
                        a._saveMultipleResponses('lifeChanges');
                        break;
                    case 6:
                        $('.quiz__answers').html('<form action="#" id="wholeBodyImpact"><div class="row"><div class="col-xs-12 col-sm-6"><label for="option__0"><div class="quiz__multiple quiz__option"><span class="quiz__icon"></span><input class="quiz__answer" type="checkbox" value="Excessive Fatigue" id="option__0" name="checkbox">Excessive Fatigue</div></label><label for="option__1"><div class="quiz__multiple quiz__option"><span class="quiz__icon"></span><input class="quiz__answer" type="checkbox" value="Frequent Mood Swings" id="option__1" name="checkbox">Frequent Mood Swings</div></label><label for="option__2"><div class="quiz__multiple quiz__option"><span class="quiz__icon"></span><input class="quiz__answer" type="checkbox" value="Get Sick Often" id="option__2" name="checkbox">Get Sick Often</div></label><label for="option__3"><div class="quiz__multiple quiz__option"><span class="quiz__icon"></span><input class="quiz__answer" type="checkbox" value="Skin Splotches Or Discoloration" id="option__3" name="checkbox">Skin Splotches Or Discoloration</div></label></div><div class="col-xs-12 col-sm-6"><label for="option__5"><div class="quiz__multiple quiz__option"><span class="quiz__icon"></span><input class="quiz__answer" type="checkbox" value="Brain Fog" id="option__5" name="checkbox">Brain Fog</div></label><label for="option__6"><div class="quiz__multiple quiz__option"><span class="quiz__icon"></span><input class="quiz__answer" type="checkbox" value="Poor Circulation" id="option__6" name="checkbox">Poor Circulation</div></label><label for="option__7"><div class="quiz__multiple quiz__option"><span class="quiz__icon"></span><input class="quiz__answer" type="checkbox" value="Frequent Aches & Pains" id="option__7" name="checkbox">Frequent Aches & Pains</div></label><label for="option__8"><div class="quiz__multiple quiz__option"><span class="quiz__icon"></span><input class="quiz__answer" type="checkbox" value="Acne" id="option__8" name="checkbox">Acne</div></label><label for="option__9"><div id="none" class="quiz__multiple--none quiz__option"><span class="quiz__icon"></span><input class="quiz__answer" type="checkbox" value="None" id="option__9" name="checkbox">None Of The Above</div></label></div></div><div class="text-center"><button data-index="6" type="submit" class="quiz__next">Next <img src="image/white-arrows.png?auto=format&w=20&h=19" loading="lazy" alt="Arrows" class="submit-arrows"></button></div></form>');
                        a._saveMultipleResponses('wholeBodyImpact');
                        break;
                    case 7:
                        $('.quiz__answers').html('<div id="commitment"><label for="option__0"><div class="quiz__option quiz__radio"><span><b>Max Intensity:</b>Maximum Lean Muscle Growth &#x2b; Maximum Fat Burning</span><input data-index=7 type="radio" id="option__0" class="quiz__answer" name="radio" value="0" tabindex="1"></div></label><label for="option__1"><div class="quiz__option quiz__radio"><span><b>Medium Intensity:</b>Maximum Lean Muscle Growth &#x2b; Good Fat Burning</span><input data-index=7 type="radio" id="option__1" class="quiz__answer" name="radio" value="1" tabindex="2"></div></label><label for="option__2"><div class="quiz__option quiz__radio"><span><b>Low Intensity:</b>Good Lean Muscle Growth &#x2b; Low Fat Burning</span><input type="radio" data-index=7 id="option__2" class="quiz__answer" name="radio" value="2" tabindex="3"></div></label></div>');
                        a._saveSingleResponse('commitment', 7);
                        break;
                    case 8:
                        $('.quiz__answers').html('<form action="#" id="nutrition"><div class="row"><label for="option__0"><div class="quiz__multiple quiz__option"><span class="quiz__icon"></span><input class="quiz__answer" type="checkbox" value="Gluten-Free" id="option__0" name="checkbox">Gluten-Free</div></label><label for="option__1"><div class="quiz__multiple quiz__option"><span class="quiz__icon"></span><input class="quiz__answer" type="checkbox" value="Vegan / Vegetarian" id="option__1" name="checkbox">Vegan / Vegetarian</div></label><label for="option__2"><div class="quiz__multiple quiz__option"><span class="quiz__icon"></span><input class="quiz__answer" type="checkbox" value="Dairy-Free" id="option__2" name="checkbox">Dairy-Free</div></label><label for="option__4"><div class="quiz__multiple quiz__option"><span class="quiz__icon"></span><input class="quiz__answer" type="checkbox" value="No Red Meat" id="option__4" name="checkbox">No Red Meat</div></label><label for="option__3"><div id="none" class="quiz__multiple--none quiz__option"><span class="quiz__icon"></span><input class="quiz__answer" type="checkbox" value="None" id="option__3" name="checkbox">I Eat Anything!</div></label></div><div class="text-center"><button data-index="8" type="submit" class="quiz__next">Next <img src="image/white-arrows.png?auto=format&w=20&h=19" loading="lazy" alt="Arrows" class="submit-arrows"></button></div></form>');
                        a._saveMultipleResponses('nutrition');
                        break;
                    case 9:
                        $('.quiz__answers').html('<div id="goals"><label for="option__0"><div class="quiz__option quiz__radio"><span>I Have More Than 10 Pounds To Lose</span><input data-index="9" type="radio" id="option__0" class="quiz__answer" name="radio" value="0" tabindex="1"></div></label><label for="option__1"><div class="quiz__option quiz__radio"><span>I Want To Lose That Last 5-10 Pounds</span><input data-index="9" type="radio" id="option__1" class="quiz__answer" name="radio" value="1" tabindex="2"></div></label><label for="option__2"><div class="quiz__option quiz__radio"><span>I Want To Get More Sculpted and Toned</span><input data-index="9" type="radio" id="option__2" class="quiz__answer" name="radio" value="2" tabindex="3"></div></label></div>');
                        a._saveSingleResponse('goals', 9);
                        break;
                    case 10:
                        // Populate the quiz answers container with the processing and compatibility results HTML structure.
                        $('.quiz__answers').html(`
        <div class="results" id="processing">
            <div class="row">
                <div class="ticker">
                    <div id="progress" class="progress">
                        <div class="progress-percentage">
                            <p>0<span>%</span></p>
                        </div>
                    </div>
                    <p class="status status-1">
                        <span><img src="image/grey-checkmark.png?auto=format" alt="Checkmark"></span>
                        Analyzing Fitness Level
                    </p>
                    <p class="status status-2">
                        <span><img src="image/grey-checkmark.png?auto=format" alt="Checkmark"></span>
                        Analyzing Lifestyle Inputs
                    </p>
                    <p class="status status-3">
                        <span><img src="image/grey-checkmark.png?auto=format" alt="Checkmark"></span>
                        Calculating Exercise Impact
                    </p>
                    <p class="status status-4">
                        <span><img src="image/grey-checkmark.png?auto=format" alt="Checkmark"></span>
                        Building Workout Plan
                    </p>
                    <p class="status status-5">
                        <span><img src="image/grey-checkmark.png?auto=format" alt="Checkmark"></span>
                        Building Meal Plan
                    </p>
                    <p class="status status-6">
                        <span><img src="image/grey-checkmark.png?auto=format" alt="Checkmark"></span>
                        Checking Compatibility
                    </p>
                    <p class="review review-1 text-center">
                        <img src="image/testimonial-1.png?fit=max&auto=format" alt="Testimonial - Laura">
                    </p>
                    <p class="review review-2 text-center">
                        <img src="image/testimonial-2.png?fit=max&auto=format" alt="Testimonial - Renae & Mary">
                    </p>
                    <p class="review review-3 text-center">
                        <img src="image/testimonial-3.png?fit=max&auto=format" alt="Testimonial - Arielle">
                    </p>
                </div>
                <div class="compatibility">
                    <h3>Your 14 Day Reset Compatibility</h3>
                    <p class="text-center">Your compatibility is: <span class="green">High</span></p>
                    <div class="compatibility-bar">
                        <div class="barOverflow">
                            <span class="start">0</span>
                            <div class="bar"></div>
                            <span class="end">100</span>
                        </div>
                        <div class="compatibility-indicator">
                            <span class="comp-val" data-compatibilty=96.8>96.8</span>%
                            <div class="compatibility-desc">Compatibility</div>
                        </div>
                    </div>
                    <p>Based on your current fitness level, lifestyle, and goals, you have <span class="red">HIGH compatibility</span> with the 14 Day Metabolism Reset.</p>
                    <div class="text-center">
                        <button type="submit" data-index="10" class="quiz__next quiz__skip results__cta">
                            Show My Results <img loading="lazy" src="image/white-arrows.png?auto=format&w=20&h=19" alt="Arrows" class="submit-arrows">
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `);

                    /**
                     * Displays the compatibility results by hiding the ticker and showing the compatibility bar.
                     */
                    function showCompatibility() {
                        $('.ticker').hide();
                        $('.compatibility').show();

                        $(".compatibility-bar").each(function() {
                            let bar = $(this).find(".bar");
                            let value = $(this).find(".comp-val");
                            let assignedValue = value.attr('data-compatibilty');
                            console.log(assignedValue);

                            $({p:0}).animate({p:assignedValue}, {
                                duration: 1000,
                                step: function(p) {
                                    bar.css({
                                        transform: "rotate("+ (45+(p*1.8)) +"deg)"
                                    });
                                    value.text(p.toFixed(1));
                                }
                            }).delay(200);
                        });
                    }

                    /**
                     * Marks a step as complete by updating the font weight and changing the checkmark color.
                     * @param {string} target - The class name of the status step to mark as complete.
                     */
                    function markStepComplete(target) {
                        $('.' + target).css('font-weight', '400');
                        $('.' + target + ' span img').attr("src", "image/pink-checkmark.png?auto=format");
                    }

                    /**
                     * Replaces the current status step with the next one.
                     * @param {string} current - The class name of the current status step.
                     * @param {string} next - The class name of the next status step.
                     */
                    function replaceStatus(current, next) {
                        $('.' + current).hide();
                        $('.' + next).show();
                    }

                    /**
                     * Replaces the current review image with the next one.
                     * @param {string} current - The class name of the current review image.
                     * @param {string} next - The class name of the next review image.
                     */
                    function replaceReview(current, next) {
                        $('.' + current).hide();
                        $('.' + next).fadeIn();
                    }

                    /**
                     * Handles the progress bar animation and triggers updates at certain percentage values.
                     */
                    function tick() {
                        setTimeout(function() {
                            progress.style.setProperty('--value', pc + '%');
                            progress.querySelector('p').innerHTML = pc + '<span>%</span>';
                            pc++;
                            if (pc <= 100) tick();

                            if (pc === 17) {
                                markStepComplete('status-1');
                            } else if (pc === 20) {
                                replaceStatus('status-1', 'status-2');
                            } else if (pc === 34) {
                                markStepComplete('status-2');
                            } else if (pc === 37) {
                                replaceStatus('status-2', 'status-3');
                                replaceReview('review-1', 'review-2');
                            } else if (pc === 50) {
                                markStepComplete('status-3');
                            } else if (pc === 54) {
                                replaceStatus('status-3', 'status-4');
                            } else if (pc === 65) {
                                markStepComplete('status-4');
                            } else if (pc === 68) {
                                replaceStatus('status-4', 'status-5');
                                replaceReview('review-2', 'review-3');
                            } else if (pc === 82) {
                                markStepComplete('status-5');
                            } else if (pc === 85) {
                                replaceStatus('status-5', 'status-6');
                            } else if (pc === 100) {
                                markStepComplete('status-6');
                                setTimeout(showCompatibility, 2000);
                            }
                        }, 150);
                    }

                        let pc = 0; // Progress counter
                        let progress = document.querySelector('#progress'); // Progress bar element
                        tick(); // Start the progress bar animation

                        // Event listener for the "Show My Results" button to submit data and save cookies
                        $('.results__cta').on('click', function (event) {
                            var formData = {
                                'age'              : userResponses.rmrInfo.age,
                                'weight'           : userResponses.rmrInfo.weight,
                                'height'           : userResponses.rmrInfo.height,
                                'rmr'              : userResponses.rmr,
                                'commitment'       : userResponses.commitment,
                                'dietSuccess'      : 'disabled',
                                'digestion'        : userResponses.digestion,
                                'exerciseFrequency': userResponses.exerciseFrequency,
                                'fatigue'          : userResponses.fatigue,
                                'goals'            : userResponses.goals,
                                'lifeChanges'      : userResponses.lifeChanges,
                                'nutrition'        : userResponses.nutrition,
                                'wholeBodyImpact'  : userResponses.wholeBodyImpact,
                                'traffic_source'   : userResponses.traffic_source
                            };

                            var quizCookieData = {
                                'rme_age'               : userResponses.rmrInfo.age,
                                'rme_weight'            : userResponses.rmrInfo.weight,
                                'rme_height'            : userResponses.rmrInfo.height,
                                'rme_rmr'               : userResponses.rmr,
                                'rme_commitment'        : userResponses.commitment,
                                'rme_digestion'         : userResponses.digestion,
                                'rme_exercise_frequency': userResponses.exerciseFrequency,
                                'rme_fatigue'           : userResponses.fatigue,
                                'rme_goals'             : userResponses.goals,
                                'rme_life_changes'      : userResponses.lifeChanges,
                                'rme_nutrition'         : userResponses.nutrition,
                                'rme_issues_having'     : userResponses.wholeBodyImpact,
                                'rme_traffic'           : userResponses.traffic_source
                            };

                            console.log(formData);

                            // Create a cookie to store quiz data
                            a._createCookie('quiz_cookie', JSON.stringify(quizCookieData));

                            // Send data to the server for storage
                            fetch('https://api.funnelms.com/quiz/storage', {
                                method : 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body   : JSON.stringify({
                                    'brand': 'rad',
                                    'quiz' : 'kendago_124',
                                    'data' : formData
                                })
                            })
                                .then(response => response.json())
                                .then(data => {
                                    console.log('Success:', data);
                                })
                                .catch((error) => {
                                    console.error('Error:', error);
                                });
                        });
                        break;

                    case 11:
                        // Hide the quiz and desktop logo elements, then show the results container.
                        $('#quiz,.desktop-logo').hide();
                        $('.results__container').show();

                        // If the RMR (Resting Metabolic Rate) is not available in userResponses, calculate it.
                        if (userResponses.rmr == null) {
                            userResponses.rmr = a._calculateRmr(userResponses.rmrInfo.weight, userResponses.rmrInfo.height, userResponses.rmrInfo.age);
                        }

                        // Extract necessary user response data.
                        var commitment = userResponses.commitment.split(':');
                        var userAge = userResponses.rmrInfo.age;
                        var goal = userResponses.goals;
                        var age = userResponses.rmrInfo.age;
                        var currentWeight = userResponses.rmrInfo.weight;
                        var rmr = userResponses.rmr;
                        var afterWeight = userResponses.rmrInfo.weight - 12;  // Assuming a weight loss of 12 lbs.

                        // Generate the URL for the dynamic graph image.
                        var graphImgUrl = "https://radiant-me.imgix.net/graph/dynamic-numbers-graph.png?blend=https%3A%2F%2Fradiant-me.imgix.net%2Fgraph%2Fblk-rectangle.png%3Ftxt%3D" + currentWeight + "%2520lbs%26txt-color%3Dfff%26txt-font%3DVerdana-Bold%26txt-size%3D25%26txt-align%3Dmiddle%2Ccenter&mark=https%3A%2F%2Fradiant-me.imgix.net%2Fgraph%2Fpink-rectangle.png%3Ftxt%3D" + afterWeight + "%2520lbs%26txt-color%3Dfff%26txt-font%3DVerdana-Bold%26txt-size%3D25%26txt-align%3Dmiddle%2Ccenter&blend-mode=normal&mark-y=330&mark-x=760&blend-y=15&blend-x=13";

                        // Update the results page with the user's information.
                        $('.afterWeight').html(afterWeight);
                        $('.age').html(age);
                        $('.currentWeight').html(currentWeight);
                        $('.rmr').html(rmr);
                        $('.graph__img').attr("src", graphImgUrl);

                        // Select and render the appropriate video based on user commitment, age, and goals.
                        a._videoSelector(commitment[0], userAge, goal);

                        // Helper function to get the correct suffix for dates (st, nd, rd, th).
                        const nth = (d) => {
                            if (d > 3 && d < 21) return 'th';
                            switch (d % 10) {
                                case 1:  return "st";
                                case 2:  return "nd";
                                case 3:  return "rd";
                                default: return "th";
                            }
                        };

                        // Arrays for month names and their abbreviations.
                        const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                        const abbrMonth = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

                        // Get today's date and the date two weeks from now.
                        const today = new Date;
                        const todayDate = today.getDate();

                        const fortnightAway = new Date(+new Date + 12096e5);  // 12096e5 = 2 weeks in milliseconds
                        const fortnightAwayDate = fortnightAway.getDate();

                        // Update the results page with the calculated dates.
                        $('.afterDate').html(`${month[fortnightAway.getMonth()]} ${fortnightAwayDate}${nth(fortnightAwayDate)}`);
                        $('.today-date').html(`${abbrMonth[today.getMonth()]} ${todayDate}`);

                        // Set up a countdown timer (30 minutes) and update the display every 100ms.
                        var spd = 100;
                        var spdVal = 10;
                        var cntDown = 30 * 60 * spdVal;
                        setInterval(function () {
                            var mn, sc, ms;
                            cntDown--;
                            if (cntDown < 0) {
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
                            document.getElementById('stopwatch2').innerHTML = result;
                        }, spd);

                        // Replace the current history state with a new one that includes the user responses as URL parameters.
                        window.history.replaceState(null, null, '?step_override=refresh&age=' + userAge + '&weight=' + userResponses.rmrInfo.weight + '&height=' + userResponses.rmrInfo.height + '&rmr=' + userResponses.rmr + '&goals=' + goal + '&commitment=' + userResponses.commitment);
                        break;

                    default:
                        text = 'No value found';
                }
            });
        },

        /**
         * Converts height from inches to a formatted string of feet and inches.
         * @param {number} height - The height in inches.
         * @returns {string} The formatted height as feet and inches.
         */
        _convertInchesToFeetAndInches: function _convertInchesToFeetAndInches(height) {
            let feet = Math.floor(height / 12);
            let inches = (height - (feet * 12));
            var formattedHeight = feet + '\'' + inches + '"';
            return formattedHeight;
        },

        /**
         * Updates the progress bar based on the current step.
         * @param {Function} a - A callback function to be executed after the progress bar is updated.
         */
        _updateProgressBar: function _updateProgressBar(a) {
            this._updateStepCounter();
            var count = this.step + 1;
            var b = 100 * (count / this.data.length);
            $('.progress-bar__progress').animate({width: b + '%'}, a);
        },

        /**
         * Updates the step counter to display the current step and total steps.
         * @private
         */
        _updateStepCounter: function _updateStepCounter() {
            this.step < this.data.length && ($('.steps__quiz-step').html(this.step + 1), $('.steps__quiz-length').html(this.data.length));
        },

        /**
         * Validates the email input field.
         * @param {string} a - The email address to validate.
         * @returns {boolean} Returns true if the email is valid, otherwise false.
         */
        _validateEmail: function _validateEmail(a) {
            return a ? !!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(a) || (alert('You have entered an invalid email address!'), !1) : (alert('Email Address is required'), !1);
        },

        /**
         * Validates the selected answer before proceeding to get results.
         * @private
         */
        _validateGetResults: function _validateGetResults() {
            var b = $('input[name="radio"]:checked').val();
            return (
                b ||
                ((b = $('input[name="checkbox"]:checked')
                    .map(function () {
                        return this.value;
                    })
                    .get()),
                0 === b.length && (b = !1)),
                    b ? void a._getResults() : void console.log('Get results')
            );
        },

        /**
         * Proceeds to get results and shows the loading screen.
         * @private
         */
        _getResults: function _getResults() {
            ++a.step,
                a._updateProgressBar(function () {
                    a._showLoading();
                });
        },

        /**
         * Updates the result text based on the selected answers.
         * @param {Array<number>} a - Array of selected answer indices.
         * @returns {string} The formatted result text.
         */
        _updateResultText: function _updateResultText(a) {
            for (var b, c = [], d = 0; d < a.length; d++) (b = this.data[2].answers[a[d]].option), c.push(b);
            return 1 < c.length ? c.slice(0, -1).join(', ') + ', and ' + c.slice(-1) : c[0];
        },

        /**
         * Shows the loading screen while fetching results.
         * @private
         */
        _showLoading: function _showLoading() {
            $('.quiz,.progress-bar, .steps').fadeOut(100),
                $('.loading').fadeIn(300, function () {
                    setTimeout(function () {
                        $('.loading').fadeOut(300, function () {
                            window.location.href = '/get-results';
                        });
                    }, 4e3);
                });
        },

        /**
         * Switches the processing icon to a checkmark after a delay.
         * @param {number} wait - The delay time in milliseconds.
         * @param {string} selector - The CSS selector for the processing icon.
         */
        _switchProcessingToCheck: function _switchProcessingToCheck(wait, selector) {
            setTimeout(function () {
                $(selector).removeClass('rotate').attr('src', 'image/check-mark.png?auto=format');
            }, wait);
        },

        /**
         * Saves the user's single response to a question.
         * @param {string} selector - The key to store the response under in userResponses.
         * @param {number} index - The index of the step to move to next.
         */
        _saveSingleResponse: function _saveSingleResponse(selector, index) {
            $('.quiz__radio').click(function (e) {
                e.preventDefault();

                var selection = $(this)[0].outerText;
                userResponses[selector] = selection;

                a._nextQuestion(index);
            });
        },

        /**
         * Saves the user's multiple responses to a question.
         * @param {string} selector - The key to store the responses under in userResponses.
         */
        _saveMultipleResponses: function _saveMultipleResponses(selector) {
            $('#' + selector).submit(function (e) {
                e.preventDefault();
                var checkboxes = document.querySelectorAll('input[type=checkbox]:checked');

                var selection = [];
                for (var i = 0; i < checkboxes.length; i++) {
                    selection.push(checkboxes[i].value);
                }

                if (selection.length == 0) {
                    alert('Please make a selection');
                    return;
                }

                userResponses[selector] = selection;
                console.log(userResponses);

                a._nextQuestion($('button.quiz__next').data('index'));
            });
        },

        /**
         * Moves to the next question in the quiz.
         * @param {number} stepNumber - The current step number.
         * @private
         */
        _nextQuestion: function _nextQuestion(stepNumber) {
            console.log('Next Question');
            $('.quiz__container').fadeOut().effect('slide', {direction: 'right'}, 200);

            a.step = stepNumber + 1;
            console.log(a.step);
            a._renderStep(), console.log('Forward Step: '.concat(a.step));
            return;
        },

        /**
         * Calculates the Resting Metabolic Rate (RMR) based on weight, height, and age.
         * @param {number} weight - The weight in pounds.
         * @param {number} height - The height in inches.
         * @param {number} age - The age in years.
         * @returns {number} The calculated RMR.
         */
        _calculateRmr: function _calculateRmr(weight, height, age) {
            var rmr = (4.536 * weight) + (15.88 * height) - (5 * age) - 161;
            return Math.round(rmr);
        },

        /**
         * Selects the appropriate video based on the user's commitment, age, and goals.
         * @param {string} commitment - The user's commitment level.
         * @param {number} userAge - The user's age.
         * @param {string} goal - The user's goal.
         * @private
         */
        _videoSelector: function _videoSelector(commitment, userAge, goal) {
            switch (true) {
                case (commitment == 'Max Intensity'):
                    $('.intensity').html('high intensity');
                    break;
                case (commitment == 'Medium Intensity'):
                    $('.intensity').html('medium intensity');
                    break;
                case (commitment == 'Low Intensity'):
                    $('.intensity').html('low intensity');
                    break;
                default:
            }

            var videoId = 'test';
            var dropDownTime;
            var output;
            var videoTitle;

            switch (true) {
                case (userAge <= 29 && goal == 'I Have More Than 10 Pounds To Lose'):
                    $('.ageRange').html('in your twenties');
                    output = "customerAge: under 29 / customerGoal: more than 10 lbs to lose";
                    console.log(output);
                    videoTitle = "VSL-V14-20a-v";
                    dropDownTime = '1252000';
                    videoId = 'DsgGLCbH75zjLQfR';
                    break;
                case (userAge <= 29 && goal == 'I Want To Lose That Last 5-10 Pounds'):
                    $('.ageRange').html('in your twenties');
                    output = "customerAge: under 29 / customerGoal: 5-10 lbs to lose";
                    console.log(output);
                    videoTitle = "VSL-V14-20b-v";
                    dropDownTime = '1249000';
                    videoId = 'sDaH0RvRVK6nEmMX';
                    break;
                case (userAge <= 29 && goal == 'I Want To Get More Sculpted and Toned'):
                    $('.ageRange').html('in your twenties');
                    output = "customerAge: under 29 / customerGoal: get more sculpted and toned";
                    console.log(output);
                    videoTitle = "VSL-V14-20c-v";
                    dropDownTime = '1258000';
                    videoId = 'cuyTsnGeYSo7TCTF';
                    break;
                case ((userAge >= 30 && userAge <= 39) && goal == 'I Have More Than 10 Pounds To Lose'):
                    $('.ageRange').html('in your thirties');
                    output = "customerAge: between 30 and 39 / customerGoal: more than 10 lbs to lose";
                    console.log(output);
                    videoTitle = "VSL-V14-30a-v";
                    dropDownTime = '1254000';
                    videoId = 'FHGZ1_B0HB7aJfoJ';
                    break;
                case ((userAge >= 30 && userAge <= 39) && goal == 'I Want To Lose That Last 5-10 Pounds'):
                    $('.ageRange').html('in your thirties');
                    output = "customerAge: between 30 and 39 / customerGoal: 5-10 lbs to lose";
                    console.log(output);
                    videoTitle = "VSL-V14-30b-v";
                    dropDownTime = '1251000';
                    videoId = 'RYWpMFIbPA_gPIru';
                    break;
                case ((userAge >= 30 && userAge <= 39) && goal == 'I Want To Get More Sculpted and Toned'):
                    $('.ageRange').html('in your thirties');
                    output = "customerAge: between 30 and 39 / customerGoal: get more sculpted and toned";
                    console.log(output);
                    videoTitle = "VSL-V14-30c-v";
                    dropDownTime = '1260000';
                    videoId = '_8dL7OgFaCgJdtxc';
                    break;
                case ((userAge >= 40 && userAge <= 49) && goal == 'I Have More Than 10 Pounds To Lose'):
                    $('.ageRange').html('in your forties');
                    output = "customerAge: between 40 and 49 / customerGoal: more than 10 lbs to lose";
                    console.log(output);
                    videoTitle = "VSL-V14-40a-v";
                    dropDownTime = '1252000';
                    videoId = 'BF02G1ybpsFFy98y';
                    break;
                case ((userAge >= 40 && userAge <= 49) && goal == 'I Want To Lose That Last 5-10 Pounds'):
                    $('.ageRange').html('in your forties');
                    output = "customerAge: between 40 and 49 / customerGoal: 5-10 lbs to lose";
                    console.log(output);
                    videoTitle = "VSL-V14-40b-v";
                    dropDownTime = '1248000';
                    videoId = 'tkLLECdciEScBrYC';
                    break;
                case ((userAge >= 40 && userAge <= 49) && goal == 'I Want To Get More Sculpted and Toned'):
                    $('.ageRange').html('in your forties');
                    output = "customerAge: between 40 and 49 / customerGoal: get more sculpted and toned";
                    console.log(output);
                    videoTitle = "VSL-V14-40c-v";
                    dropDownTime = '1258000';
                    videoId = 'jnyKd5i8ZPWvU4wJ';
                    break;
                case (userAge >= 50 && goal == 'I Have More Than 10 Pounds To Lose'):
                    $('.ageRange').html('over fifty');
                    output = "customerAge: 50 and over / customerGoal: more than 10 lbs to lose";
                    console.log(output);
                    videoTitle = "VSL-V14-50a-v";
                    dropDownTime = '1253000';
                    videoId = 's5iRSAHz_DgkshUM';
                    break;
                case (userAge >= 50 && goal == 'I Want To Lose That Last 5-10 Pounds'):
                    $('.ageRange').html('over fifty');
                    output = "customerAge: 50 and over / customerGoal: 5-10 lbs to lose";
                    console.log(output);
                    videoTitle = "VSL-V14-50b-v";
                    dropDownTime = '1249000';
                    videoId = 'ADpMUmvTYZj1rfbH';
                    break;
                case (userAge >= 50 && goal == 'I Want To Get More Sculpted and Toned'):
                    $('.ageRange').html('over fifty');
                    output = "customerAge: 50 and over / customerGoal: get more sculpted and toned";
                    console.log(output);
                    videoTitle = "VSL-V14-50c-v";
                    dropDownTime = '1258000';
                    videoId = 'btX_n_IIGcmj8Nmx';
                    break;
                default:
            }

            $('.video__container').html('<div id=\'vidalytics_embed_' + videoId + '\' style=\'width: 100%; position:relative; padding-top: 100%;\'></div>');

            a._renderVideo(videoId);

            var params = '?interest=' + videoTitle + '&age=' + userAge;
            a._addParametersToCtas(params);
            a._dropDownButton(dropDownTime);
        },

        /**
         * Adds URL parameters to CTA buttons.
         * @param {string} params - The URL parameters to add.
         */
        _addParametersToCtas: function _addParametersToCtas(params) {
            $(`.packageBox__btn`).attr(`href`, `/assessment/order` + params);
        },

        /**
         * Shows the dropdown button after a delay.
         * @param {number} dropDownTime - The delay time in milliseconds.
         * @private
         */
        _dropDownButton: function _dropDownButton(dropDownTime) {
            console.log('Dropdown time is: ' + dropDownTime);

            var pageCookieName = 'quiz_results_visitedPage';

            if (document.cookie.indexOf(pageCookieName) > -1) {
                console.log('already visited');
                setTimeout(function () {
                    $('.hidden-content-part').fadeIn();
                    $('html, body').animate({
                        scrollTop: $("#purchase").offset().top
                    }, 2000);
                }, 7000);
            } else {
                console.log('first visit');
                a._createCookie(pageCookieName, 'yes');
                setTimeout(function () {
                    $('.hidden-content-part').fadeIn();
                    $('html, body').animate({
                        scrollTop: $("#purchase").offset().top
                    }, 2000);
                }, dropDownTime);
            }
        },

        /**
         * Renders the video on the results page.
         * @param {string} videoId - The ID of the video to render.
         * @private
         */
        _renderVideo: function _renderVideo(videoId) {
            console.log('Video ID is: ' + videoId);

            (function (v, i, d, a, l, y, t, c, s) {
                y='_'+d.toLowerCase();
                c=d+'L';
                if( !v[d]) {
                    v[d]= {}
                    ;
                }
                if( !v[c]) {
                    v[c]= {}
                    ;
                }
                if( !v[y]) {
                    v[y]= {}
                    ;
                }
                var vl='Loader', vli=v[y][vl], vsl=v[c][vl + 'Script'], vlf=v[c][vl + 'Loaded'], ve='Embed';
                if ( !vsl) {
                    vsl=function(u, cb) {
                        if(t) {
                            cb();
                            return;
                        }
                        s=i.createElement("script");
                        s.type="text/javascript";
                        s.async=1;
                        s.src=u;
                        if(s.readyState) {
                            s.onreadystatechange=function() {
                                if(s.readyState==="loaded"||s.readyState=="complete") {
                                    s.onreadystatechange=null;
                                    vlf=1;
                                    cb();
                                }
                            }
                            ;
                        }
                        else {
                            s.onload=function() {
                                vlf=1;
                                cb();
                            }
                            ;
                        }
                        i.getElementsByTagName("head")[0].appendChild(s);
                    }
                    ;
                }
                vsl(l+'loader.min.js', function() {
                        if( !vli) {
                            var vlc=v[c][vl];
                            vli=new vlc();
                        }
                        vli.loadScript(l+'player.min.js', function() {
                                var vec=v[d][ve];
                                t=new vec();
                                t.run(a);
                            }
                        );
                    }
                );
            })(window, document, 'Vidalytics', `vidalytics_embed_${videoId}`, `https://quick.vidalytics.com/embeds/dmpsCGvb/${videoId}/`);

            EMBED_CODE_ID = `vidalytics_embed_${videoId}`;

            function initializePlayerAPI() {
                var player = getPlayer();
                if (player._player) {
                    vidalyticsPlayerAPI = player;
                    if (PLAYER_INITIALIZED == false) {
                        console.log('player not yet initialized');
                        onPlayerAPIAvailableCallback();
                        PLAYER_INITIALIZED = true;
                    } else {
                        console.log('player already initialized');
                    }
                    return;
                }

                setTimeout(initializePlayerAPI, 100);
            }

            initializePlayerAPI();

            function getPlayer() {
                var embeds = (window._vidalytics || {}).embeds || {};
                if (embeds[EMBED_CODE_ID]) {
                    return embeds[EMBED_CODE_ID].player || {};
                }
                return {};
            }

            function onPlayerAPIAvailableCallback() {
                setTimeout(function () {
                    vidalyticsPlayerAPI.play();
                }, 500);
            }
        },

        /**
         * Adds the user to the Maropost email list.
         * @private
         */
        _addMaropost: function _addMaropost() {
            var b = {emailAddress: $('[name=\'emailAddress\']').val(), maropostList: 116818};
            a._validateEmail(b.emailAddress) &&
            $.ajax({
                url    : '/api/add/maropost',
                type   : 'POST',
                data   : b,
                success: function success(a) {
                    window.location.href = a.data.nextPagePaths[0];
                },
                error  : function error(a) {
                    alert(a.responseText);
                }
            });
        }
    }
    a.init();

})

function initiateTechTest() {
    setTimeout(() => {
        var verification      = $('#video-verification');
        verification.modal('show')
    }, "3000");
}


function techTest(age, goal) {
    var verification      = $('#video-verification');
    // verification.modal('hide')
    userResponses = {
        'commitment'       : 'Medium Intensity:Maximum Lean Muscle Growth + Good Fat Burning',
        'rmrInfo'          : {
            'age'   : age,
            'weight': '216',
            'height': '65'
        },
        'rmr'              : 1591,
        'exerciseFrequency': 'I Exercise 5+ Days Per Week',
        'nutrition'        : [
            'Vegan / Vegetarian',
            'Dairy-Free'
        ],
        'goals'            : goal,
        'traffic_source'   : 'testing'
    }

    $('.results__cta').click()
}

function getQuizCookie(cookieName) {
  let name = cookieName + "=";
  let decodedCookie = document.cookie;
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}


$(function () {
    /**
     * Converts the URL parameters into an object.
     * @returns {Object} An object containing the URL parameters as key-value pairs.
     */
    function urlParametersToObj() {
        const url = new URL(window.location);
        // Removes `?`
        const url_parameter_no_mark = url.search.slice(1);
        const params = new URLSearchParams(url_parameter_no_mark);

        let param_obj = {};
        for (var value of params.keys()) {
            param_obj[value] = params.get(value);
        }

        return param_obj;
    }

// Convert URL parameters to an object
    const param_obj = urlParametersToObj();

// Iterate over all links in the document and update their hrefs
    document.querySelectorAll('body [href]').forEach(link => _changeHref(link));

    /**
     * Appends key-value pairs from an object to the query string of a URL.
     * @param {string} link - The original link URL.
     * @param {Object} param_obj - The object containing key-value pairs to append to the query string.
     * @returns {string} The updated query string.
     * @throws Will throw an error if the link or param_obj is not provided or if param_obj is not an object.
     */
    function _appendQuery(link, param_obj) {
        if (!link) {
            throw new Error('link was expected.');
        }

        if (!param_obj) {
            throw new Error('param_obj was expected.');
        }

        if (typeof param_obj !== 'object') {
            throw new Error('param_obj should be an object.');
        }

        var url = new URL(link);
        var url_parameter_no_mark = url.search.slice(1);
        var params = new URLSearchParams(url_parameter_no_mark);

        for (const key in param_obj) {
            // Appends a specified key/value pair as a new search parameter.
            params.append(key, param_obj[key]);
        }

        return params.toString();
    }

    /**
     * Modifies the href attribute of a link by appending URL parameters.
     * @param {HTMLElement} link - The link element whose href attribute will be modified.
     * @returns {void}
     */
    function _changeHref(link) {
        const q = new URL(link.href);

        // Stop href modifications if hash is found
        if (q.hash !== '') {
            return;
        }

        // Stop href modifications for mailto and tel links
        if (q.protocol === 'mailto:') {
            return;
        }

        if (q.protocol === 'tel:') {
            return;
        }

        let new_query = _appendQuery(link.href, param_obj);
        link.href = `${q.origin}${q.pathname}?${new_query}`;
    }

})


// smooth scroll to anchor
$(document).ready(function () {

    /**
     * Adds a click event listener to all anchor (`<a>`) elements on the page.
     * If the anchor has a hash value, the default action is prevented, and the page smoothly scrolls to the target element.
     */
    $('a').on('click', function (event) {
        if (this.hash !== '') {
            event.preventDefault(); // Prevent default anchor click behavior

            var hash = this.hash;

            // Animate smooth scroll to the target element
            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 800, function () {
                // Update the URL hash when the scroll is complete
                window.location.hash = hash;
            });
        }
    });

})
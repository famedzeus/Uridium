//*
// payment.js used for new payments
// Dale Carter/Mike Harrison
// Spring/Summer 2008
//
// CR12642 and PR53481 - remove all references to issuing banks
//*
//*
// declare some global variables.
// a lot of global variables are also set from the xslt.
//*
// Value of the 'please select card' option in the card dropdown.
var DEFAULT_CARD_SCHEME_CODE = "XX";
var pageLoaded = false;
//Variable declared to check whether surcharged amount is added in the total price, for ImCapFuncSup n418294 incident #110321-000001
var isAddedSurcharge = false;
//*
// Card field switching stuff
// here and below, using = new Array() instead of = new Array(), as per jsLint
// Used for switching fields on/off depending on the card selected. Example declarations:
// cardSwitch["VD"]["CSCNumber"] = "Required";
// cardSwitch["VD"]["StartDate"] = "Optional";
//*
var cardSwitch = new Array();
//*
// array for the payment card fields that are needed during this execution.
// ie all the fields sent across from the BLS as being either Required or Optional.
// Used during field switching.
//*
var possibleCardFieldsThisXML = new Array();
//*
// Credit card info arrays
//
// Example declarations:
// CCSurcharge["VI"] = true;
// CCSurchargeAmount["VI"] = '3.00';
// CCTotalFlightPrice["VI"] = totalFlightPrice + 3.00;
// CCTotalPrice["VI"] = totalPrice + 3.00;
//
// Ensure that when the user chooses 'Please select...' (XX), any surcharge is taken off
//*
var CCSurcharge = new Array();
CCSurcharge[DEFAULT_CARD_SCHEME_CODE] = false;
var CCSurchargeAmount = new Array();
//var CCTotalFlightPrice = new Array();
var CCTotalPrice = new Array();
var oneCardSufficient = new Array();
//*
// stuff to do when the page loads
// especially: if a card (or two) are pre-selected (from a reload),
// make sure total price is changed, if required, and that mandatory fields are marked.
// if this is PayInPerson, then there won't be any card fields, so no need to do changeCardSchemeCode
// keep a track of where the rhs pods are on the page
//*
var headerHeight = 0;
var emailSent = false;

var io_bbout_element_id = 'ioBlackBox';
var io_enable_rip = true; // enable collection of Real IP

var io_install_flash = false; // do not require install of Flash

var io_install_stm = false; // do not require install of Active X

var io_exclude_stm = 12; // do not run Active X under IE 8 platforms

$(document)
    .ready(function () {

        //form validation
        $('[aria-required=true]').on('blur change', checkInlineValidation);

        //Perform VSG global validation and then extra valdiation, only progress if both successful.
        $('#paymentForm').submit(function () {

            $('#mfErrors').empty();
            var vsg_check = checkInputFields({formParam: this, mfErrorMsgArea: 'mfErrors'});
            var payment_check = submitPaymentForm();

            if (vsg_check == true && payment_check == true) {
                return true;
            }
            else {
                return false;
            }
        });

        donationRoundup();

        //Modals

        //Modal for 'cant save card'
        $('.cantSelectCard').on('click', function () {
            $('#cantSaveModal').initModalDialog();
            return false;
        });
        // Hide modal
        $('#cantSaveModal .modalReturn').on('click', function () {
            $('#cantSaveModal').hideModalDialog($('.cantSelectCard'));
            return false;
        });

        //Modal for 'why use a save card'
        $('#whySaveCard').on('click', function () {
            $('#whySaveModal').initModalDialog();
            return false;
        });
        // Hide modal
        $('#whySaveModal .modalReturn').on('click', function () {
            $('#whySaveModal').hideModalDialog($('#whySaveCard'));
            return false;
        });

        //Modal for 'about Charites'
        $('#openCharitiesDesc').on('click', function () {
            $('#aboutCharities').initModalDialog();
            return false;
        });
        // Hide modal
        $('#aboutCharities .modalReturn').on('click', function () {
            $('#aboutCharities').hideModalDialog($('#aboutCharities'));
            return false;
        });

        //Modal for 'about Charites'
        $('.charityTextA2').on('click', function () {
            $('#aboutCharities').initModalDialog();
            return false;
        });
        // Hide modal
        $('#aboutCharities .modalReturn').on('click', function () {
            $('#aboutCharities').hideModalDialog($('#aboutCharities'));
            return false;
        });

        //Default card - fire the card change event for the default card to show/hide fields
        if (showDefaultCard == 'true') {
            adjustFields(defaultScheme, 1, "normal");
            changeTotal('Card', defaultScheme);
            isAddedSurcharge = true;
        }

        // floaty pod stuff
        headerHeight = $("#a-small-right").offset().top - 2;
        $(window).bind('scroll', stickyHandle);

        // process incoming card details
        if (defaultMethodOfPayment == "Card") {
            changeCardSchemeCode(1);
            if (twoCardValidation == "true") {
                changeCardSchemeCode(2);
            }
        }
        //changeTotal method is called on reload only when surcharge is not added in total price, for ImCapFuncSup n418294 incident #110321-000001
        if (!isAddedSurcharge)
            changeTotal(defaultMethodOfPayment,
                DEFAULT_CARD_SCHEME_CODE);
        /*
         if ($("#BillingCountry").length > 0) {
         $("#BillingCountry").focus();
         } else if ($("#Card").length > 0) {
         $("#Card").focus();
         } else if ($("#PayInPerson").length > 0) {
         $("#PayInPerson").focus();
         } else if ($("#PaymentCardHolderTitle").length > 0) {
         $("#PaymentCardHolderTitle").focus();
         } else if ($("#PaymentCardHolder1").length > 0) {
         $("#PaymentCardHolder1").focus();
         } else {
         $("#CardSchemeCode1").focus();
         }
         */
        //replace PayPal label with logo
        $('#PayPalPayment')
            .hide()
            .after(
                '<img src="/cms/global/assets/images/logos/paypalMark.gif" border="0" alt="PayPal" title="PayPal" onclick="this.parentNode.click()"/>');

        //also add tracking
        if ($("input:radio[name=MethodOfPayment]:checked").val() == "PayPal") {
            trackingInfo["PaymentMethod"] = "PayPal";
        }
        //change form bottom if PayPal is selected and there isn't a person paying fieldset after the payment option
        if ($("input:radio[name=MethodOfPayment]:checked").val() == "PayPal"
            && ($("#paymentCardHolderDetails").length == 0)) {
            $('form[name=payment]').addClass('PayPal');
        } else {
            $('form[name=payment]').removeClass('PayPal');
        }

        pageLoaded = true;

        //Functions only loaded when required to prevent unneccesary variables and DOM requests
        //Load the code for the drop down menu
        if (amountOfCards > 1 & showDefaultCard == 'true') {
            initDropDown();
        }

        //Code for saved addresses
        if (savedAddresses.length > 0 && showDefaultCard != 'true') {
            changeBillingAddress();
        }

        //Tracking on save card check box
        $('#SaveCard').click(function () {
            if ($('#SaveCard').is(':checked')) {
                trackingInfo["newCardSaved"] = 'yes';
            } else {
                trackingInfo["newCardSaved"] = 'no';
            }
        });

        //Saved address defaults to new card
        if (showDefaultCard != 'true' && savedAddresses.length > 0 && applicationName != "PEGPAY" && errorOnPage != "0") {
            if (validBillingAddresses == 0 && homeBillingCountry != pageBillingCountry) {
                changeBillingAddress('NewCard');
            }
        }

        /* Scroll to the top of the form on refereshing due to payment option change  - if returning from an error
         it needs to be at the top so they can read it */
        if (selectedPaymentOption != '' && errorOnPage === "0") {
            var paymentFormOffset = $('#paymentForm').offset().top;
            //Only scroll if the user has not already scrolled down (the page might not be fully loaded when they scroll)
            if (paymentFormOffset > $(document).scrollTop()) {
                window.scroll(0, paymentFormOffset);
            }
        }

        //Initialise session expiry modal
        //FD1506: remove hardcoding value with the database driven value from AREA_INFO table
        var session_max_interval = 1190;
        $.ajax({
            url: '/main/session-timeout?eId=-1&v=' + (~~(Math.random() * 10001)),
            async: true,
            dataType: "text",
            success: function (response) {
                session_max_interval = response.trim() - 10;
                $("#timeoutModal").timeout({
                    sessionMax: session_max_interval, timeout: function () {
                        sendEmail();
                    }
                });
            },
            error: function () {
                $("#timeoutModal").timeout({
                    sessionMax: session_max_interval
                });
            }
        });

    });
/* modal for terms and conditions
 uses old style popups */
// This function sets the popUp for scrolling.
// This is done like this so that the bc() function does not take in too many values.
//this has been amended for mac enablement to make it work on netscape on OS9 mac 2dec2004

function popUpScrolling(url, w, h) {
    if (typeof w == 'undefined' || w == '') {
        w = '450'
    }
    if (typeof h == 'undefined' || h == '') {
        h = '350'
    }

    /* increase width for secCharge popup Beg */
    var ifSecCharge = new RegExp("seccharge", "i");
    if (ifSecCharge.test(url)) {
        w = 620;
        h = 580;
    }

    /* increase width for secCharge popup End */
    window.name = "BA_Main";
    var toolbar = "toolbar=no,location=no,directories=no,menubar=no,scrollbars=yes,resizable=yes,width=" + w + ",height=" + h;
    var myPopup = window.open(url, "BA_Popup", toolbar);
    myPopup.focus();
}
function checkEmail(email) {
    var filter = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!filter.test(email)) {
        return false;
    }
    return true;
}
//*
// Function to change eventid and submit the page when country of billing is changed
//*
function changeBillingCountry() {
    $("#eId").val($("#UpdateCountryOfBillingEventId").val());
    document.payment.submit();
}

//*
// Function to change eventid and submit the page when method of payment is changed
//*
function changeMethodOfPayment(methodOfPayment, defaultMethod) {
    if (methodOfPayment != defaultMethod) {

        //set the field to say which box was chosen
        $("#SelectedPaymentOption").val(methodOfPayment);

        //set 'Saved Card' to card
        //needs to be 'Saved Card' to trigger the change but 'Card' for payment purposes
        if (methodOfPayment == 'SavedCard') {
            methodOfPayment = 'Card';
            $("#SavedCard").val(methodOfPayment);
        }

        //set 'New Card' to card
        //needs to be 'New Card' to trigger the change but 'Card' for payment purposes
        if (methodOfPayment == 'NewCard') {
            methodOfPayment = 'Card';
            $("#Card").val(methodOfPayment);
        }

        $("#eId").val($("#UpdateMethodOfPaymentEventId").val());
        document.payment.submit();
    }
}

//*
// function invoked when the card changes - either if this is a reload, and the card is not the default XX,
// or when a card is selected from the dropdown.
// On entry to the page, if we're just dealing with the default, we don't need to change.
// Note that in two-card AVC, only the first card is actually used for paying.  Hence we only recalculate prices for the first card.
// By default, Pegasus doesn't see the CustomerReference field unless it is strictly applicable.
// It does see other optional fields by default.
//*
function changeCardSchemeCode(cardSequence) {
    var card;
    var fieldName = "";
    var saveCardInfo = $('#saveCardInfo2');
    //
    if (cardSequence == 1) {
        card = "#CardSchemeCode1";
    } else if (cardSequence == 2) {
        card = "#CardSchemeCode2";
    }
    if ($(card).length > 0) {
        card = $(card + " option:selected").val();

        //set the blank value to the default code
        if (card === "") {
            card = DEFAULT_CARD_SCHEME_CODE;
        }

        if (card != undefined
            && (pageLoaded || card != DEFAULT_CARD_SCHEME_CODE)) {
            // first change the total price, if necessary.
            if (cardSequence == 1) {
                changeTotal("Card", card);
                // track everytime the card is changed.
                trackingInfo["PDPaymentCard"] = card;
                if ($("#t-tracking-fragment").length > 0) {
                    $("#t-tracking-fragment").html(vsDoTracking());
                }
                // if this is 2-card avs, toggle second card as required.
                if (twoCardValidation == "true") {
                    card2 = $("#CardSchemeCode2 option:selected").val();

                    //set the blank value to the default code
                    if (card2 === "") {
                        card2 = DEFAULT_CARD_SCHEME_CODE;
                    }

                    if (oneCardSufficient[card] == "true") {
                        $("#card2").addClass('hidden');
                        adjustFields(card2, 2, "forceHide");
                    } else {
                        $("#card2").removeClass('hidden');
                        adjustFields(card2, 2, "normal");
                    }
                }
            }
            adjustFields(card, cardSequence, "normal");
            isAddedSurcharge = true; // isAddedSurcharge variable becomes true as surcharge is added in total price , for ImCapFuncSup n418294 incident 110321-000001

            /* Fix for swaping the mandatory field for the masetro card  - START */
            var cscNumber = $("#CSCNumber1");
            if (card == 'SW' && cscNumber.is('[aria-required="false"]')) {
                cscNumber.resetErrorState();
            }
            /* Fix for swaping the mandatory field for the masetro card  - END */
            //if the card is 'UATP', the second line of save new card information must be hidden
            if (showSaveCard == "true") {
                if (card == 'TP') {
                    saveCardInfo.hide();
                } else {
                    saveCardInfo.show();
                }
            }

        }
    }
}

//*
// Clicking on a card icon sets the corresponding field in the card dropdown.
// From this point the change is just as if the card had been changed in the dropdown.
//*
function changeCardSchemeCodeIcon(cardIcon, cardSequence) {

    var cardDropDown;

    //get the correct element
    if (cardSequence == 1) {
        cardDropDown = $("#CardSchemeCode1");
    } else if (cardSequence == 2) {
        cardDropDown = $("#CardSchemeCode2");
    }

    if (cardDropDown) {
        cardDropDown.val(cardIcon);
        changeCardSchemeCode(cardSequence);

        //trigger a blur event to do VSG inline validation
        cardDropDown.trigger('blur');
    }
}

//*
// Loop through the array containing all the card field names
// Remember to make customerReference invisible for XX - pegasus rules
// if we are here because of hiding card 2, automatically set all fields to hidden, which will turn off mandatory
// otherwise, check to see whether to turn fields on or off, depending on situation.
//*
function adjustFields(card, cardSequence, mode) {
    var cvs3 = "#CVS3_" + cardSequence;
    var cvs4 = "#CVS4_" + cardSequence;
    var cvsImg = "#CVSImg" + cardSequence;

    for (var i = 0; i < possibleCardFieldsThisXML.length; i++) {
        fieldName = possibleCardFieldsThisXML[i];
        if (mode == "forceHide") {
            //card scheme code is not in the array so has to be dealt with separately
            adjustFieldrow("CardSchemeCode", 2, "forceHide");
            adjustFieldrow(fieldName, cardSequence, "forceHide");
        } else {
            if (cardSwitch[card][fieldName] == "Required") {
                adjustFieldrow(fieldName, cardSequence, "Required");
            } else if (cardSwitch[card][fieldName] == "Optional") {
                if (card == DEFAULT_CARD_SCHEME_CODE
                    && fieldName == "CustomerReference") {
                    adjustFieldrow(fieldName, cardSequence, "Hidden");
                } else {
                    adjustFieldrow(fieldName, cardSequence, "Optional");
                }
            } else {
                adjustFieldrow(fieldName, cardSequence, "Hidden");
            }
        }
    }

    if ($(cvs3).val() != null || $(cvs4).length > 0) {
        //swop Amex CVS text or otherwise
        if (card.substring(0, 2) == "AX") {
            $(cvs3).hide();
            $(cvs4).show();
            $(cvsImg)
                .attr("src", "/cms/global/assets/images/logos/AMEXcvc.gif");
        } else {
            $(cvs4).hide();
            $(cvs3).show();
            $(cvsImg).attr("src", "/cms/global/images/logos/cvc.gif");
        }
    }
}

//*
// function to show/hide fieldrows, and make them compulsory/optional as required
// should only be one label for each fieldrow, but dates can have two entry fields, one for month, one for year.
// Entry fields (for payment.js) can only be either select or input.
//*
function adjustFieldrow(fieldName, cardSequence, state) {
    var fieldRow = "#" + fieldName + cardSequence + "fieldrow";
    var fieldLabels = fieldRow + " label";
    var fieldInputs = fieldRow + " input[type!='hidden']";
    var fieldSelects = fieldRow + " select[type!='hidden']";
    //
    switch (state) {
        case "Required":
            //remove the disabled attribute if it had been added before
            $(fieldInputs).removeAttr("disabled");
            $(fieldSelects).removeAttr("disabled");
            //hide, show and add mandatory class as required
            $(fieldRow).removeClass('hidden');
            $(fieldRow).addClass('mandatory');
            $(fieldLabels).addClass('mandatory');
            $(fieldInputs).addClass('ruleMandatory');
            $(fieldSelects).addClass('ruleMandatory');
            $(fieldInputs).attr("aria-required", "true");
            $(fieldSelects).attr("aria-required", "true");
            break;
        case "Optional":
            //remove the disabled attribute if it had been added before
            $(fieldInputs).removeAttr("disabled");
            $(fieldSelects).removeAttr("disabled");
            //hide, show and add mandatory class as required
            $(fieldRow).removeClass('hidden');
            $(fieldRow).removeClass('mandatory');
            /* Fix for swaping the mandatory field for the masetro card*/
            $(fieldLabels).removeClass('mandatory');
            $(fieldInputs).removeClass('ruleMandatory');
            $(fieldSelects).removeClass('ruleMandatory');
            $(fieldInputs).attr("aria-required", "false");
            $(fieldSelects).attr("aria-required", "false");
            break;
        case "Hidden":
            //Hidden and forceHide now the same
            //hidden fields need to be disabled too
            $(fieldInputs).attr("disabled", "disabled");
            $(fieldSelects).attr("disabled", "disabled");
            //hide, show and add mandatory class as required
            $(fieldRow).addClass('hidden');
            $(fieldLabels).removeClass('mandatory');
            $(fieldRow).removeClass('mandatory');
            $(fieldInputs).removeClass('ruleMandatory');
            $(fieldSelects).removeClass('ruleMandatory');
            $(fieldInputs).attr("aria-required", "false");
            $(fieldSelects).attr("aria-required", "false");
            break;
        case "forceHide":
            $(fieldRow).addClass('hidden');
            $(fieldLabels).removeClass('mandatory');
            $(fieldInputs).removeClass('ruleMandatory');
            $(fieldSelects).removeClass('ruleMandatory');
            // as well as hidding the fields,
            // set them to disabled so that they don't submit
            $(fieldInputs).attr("disabled", "disabled");
            $(fieldSelects).attr("disabled", "disabled");
            $(fieldInputs).attr("aria-required", "false");
            $(fieldSelects).attr("aria-required", "false");
            break;
        default:
            alert("Error, incorrect value " + state + " in adjustFieldrow");
            break;
    }
}

//*
// change total payment if required
// first of all check whether any of the cards for this transaction are surcharged.
// If not, we never need to make any adjustments up or down.
// first create formatted totals
// then set the html appropriately
//*
function changeTotal(type, selectedCC) {
    // someCardsSurcharged is a global variable, hence don't need to pass it as a parameter
    if (someCardsSurcharged || paymentMethodSurcharge > 0) {
        var totalPriceDisplay = "";
        var flightSurchargeMessage = "&nbsp;";
        // set up default totals if there is no surcharge for that card
        if (currencySymbolPlacement == "LEFT" || currencySymbolPlacement == "L") {
            totalPriceDisplay = currencySymbol + formatCurrency(totalPrice);
        } else {
            totalPriceDisplay = formatCurrency(totalPrice) + " "
                + currencySymbol;
        }
        // if there is a surcharge, set up new prices variables
        // for cards:
        if (type == "Card") {
            if (selectedCC != DEFAULT_CARD_SCHEME_CODE) {
                if (CCSurcharge[selectedCC] == true) {
                    if (currencySymbolPlacement == "LEFT"
                        || currencySymbolPlacement == "L") {
                        flightSurchargeMessage = "&nbsp;("
                            + includesSurchargeCard
                                .replace(/parameter0/, currencySymbol
                                    + CCSurchargeAmount[selectedCC])
                            + ")";
                        totalPriceDisplay = currencySymbol
                            + formatCurrency(CCTotalPrice[selectedCC]);
                    } else {
                        flightSurchargeMessage = "&nbsp;("
                            + includesSurchargeCard.replace(/parameter0/,
                                CCSurchargeAmount[selectedCC] + " "
                                + currencySymbol) + ")";
                        totalPriceDisplay = formatCurrency(CCTotalPrice[selectedCC])
                            + " " + currencySymbol;
                    }
                }
            }
        }
        //for other forms of payment
        else if (type == "PayPal") {
            if (currencySymbolPlacement == "LEFT"
                || currencySymbolPlacement == "L") {
                flightSurchargeMessage = "&nbsp;("
                    + includesSurchargePayPal
                        .replace(
                            /parameter0/,
                            currencySymbol
                            + formatCurrency(paymentMethodSurcharge))
                    + ")";
                totalPriceDisplay = currencySymbol
                    + formatCurrency(parseFloat(totalPrice)
                        + parseFloat(paymentMethodSurcharge));
            } else {
                flightSurchargeMessage = "&nbsp;("
                    + includesSurchargePayPal.replace(/parameter0/,
                        formatCurrency(paymentMethodSurcharge) + " "
                        + currencySymbol) + ")";
                totalPriceDisplay = formatCurrency(parseFloat(totalPrice)
                        + parseFloat(paymentMethodSurcharge))
                    + " " + currencySymbol;
            }
        }
        // plug totals and sentences into the page
        if (currencyCode != currencySymbol) {
            totalPriceDisplay = totalPriceDisplay + " (" + currencyCode + ")";
        }

        $("#detailsTotalPrice").html(totalPriceDisplay);
        $("#detailsTotalPriceSurcharge").html(flightSurchargeMessage);

        if ($("#totalPrice").length > 0) {
            $("#totalPrice").html(totalPriceDisplay);
        }
        if ($("#TotalPriceSurcharge").length > 0) {
            $("#TotalPriceSurcharge").html(flightSurchargeMessage);
        }
    }
}

//*
// format currency
// Dale asked for comment from js folk, but didn't receive any feedback.
// Note that toFixed only works in JS 1.5 / IE5.5+ - but we only support IE6+ anyway.
//*
function formatCurrency(amount) {
    if (amount.toFixed) {
        // This sorts out the decimal places properly first
        var amountString = '' + amount.toFixed(decimalPlaces);
        // Now we'll add the commas
        var amountArray = amountString.split('.');
        var amountInteger = amountArray[0];
        var amountFraction = amountArray.length > 1 ? '.' + amountArray[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(amountInteger)) {
            amountInteger = amountInteger.replace(rgx, '$1' + ',' + '$2');
        }
        return amountInteger + amountFraction;
    } else {
        return amount;
    }
}

//*
// submit form
// can be called from multiple applications, so could have application specific code here
// if so, use the javascript applicationName variable set up by xslt
//*
function submitPaymentForm() {
    var card1;
    var card2;
    var cardNumber1;
    var cardNumber2;
    var mfErrors;
    var errorHTML;
    var errorDiv = $("#mfErrors");
    var errorTitle = '<h4>Error</h4>';
    var errorFound = false;
    card1 = $("#CardSchemeCode1 option:selected").val();
    cardNumber1 = $("#CardNumber1").val();
    trackingInfo["interaction"] = "paymentsubmit";
    if (document.getElementById("t-tracking-fragment") !== null) {
        document.getElementById("t-tracking-fragment").innerHTML = vsDoTracking();
    }
    if (twoCardValidation == "true") {
        card2 = $("#CardSchemeCode2 option:selected").val();
        cardNumber2 = $("#CardNumber2").val();
    }

    if (card1 === "") {
        card1 = DEFAULT_CARD_SCHEME_CODE;
    }

    if (card2 === "") {
        card2 = DEFAULT_CARD_SCHEME_CODE;
    }

    errorHTML = "";
    // allow second card to be default if the first card is sufficient by itself for 2-card AVS.
    if (twoCardValidation == "true" && oneCardSufficient[card1] != "true" && card2 == DEFAULT_CARD_SCHEME_CODE) {
        errorFound = true;
        errorHTML += "<li>" + pleaseSelectCard + "</li>";
        //window.scrollTo(0, 0);
        trackingInfo["err_msg"] = pleaseSelectCard.substring(0, 99);
        if (document.getElementById("t-tracking-fragment") !== null) {
            document.getElementById("t-tracking-fragment").innerHTML = vsDoTracking();
        }

    }
    // two cards must be different
    if (twoCardValidation == "true" && cardNumber1 == cardNumber2
        && cardNumber1 != "") {
        errorFound = true;
        errorHTML += "<li>" + twoDifferentCardsPlease + "</li>";
    }
    // if there was an error, display it.
    if (errorFound) {

        //either add to existing list or create new
        if (errorDiv.find('li').length > 0) {
            errorDiv.find('ul').prepend(errorHTML);
        } else {
            errorHTML = "<ul>" + errorHTML + "</ul>";
            errorHTML = errorTitle + errorHTML;
            errorDiv.html(errorHTML);
            $('html,body').animate({scrollTop: $(errorDiv).offset().top - 10}, 'slow');
        }

        errorDiv.show();
        // position ourselves at the top of the page so folks can see the error messages
        //$("body").scrollTop(1);
        return false;
    } else {
        //hideBLSErrors();
        //errorDiv.hide();
        //PR52015
        //var selectedCard = $("#CardSchemeCode1").val();
        //if (selectedCard == "TP") {
        //  removeSecondCardFieldsFromSubmit();
        //}
        //removeContentFromOffFields();

        // Spanish surcharge temporary hack - Dale
        var billingCountry = $('#BillingCountry').val();
        var methodOfPayment = $("input:radio[name=MethodOfPayment]:checked").val();
        var storedCardToken = $('#storedCardToken').val();
        var selectedCard = $("#CardSchemeCode1").val();
        if (billingCountry == "ES" && methodOfPayment == "Card" && storedCardToken != null && (selectedCard == "VI" || selectedCard == "CA" || selectedCard == "AX")) {
            $('#CustomerReference1').val('CONSUMER');
        }

        return true;
        //return checkInputFields({formParam: this, mfErrorMsgArea: 'mfErrors'});
    }
}

//*
// remove content from fields that have been switched off
//
// The length of array is now 5(fixed in all type of card selection) and contains on / off value.
// For start month & year indicate by Start Date tag. Pls Notice fieldNameArray array contains Start Date as 'StartDate'
// as always not depends on user selected language.
// Pls see setCardcardSwitches() of com.ba.cap.payment.card.webchannel.presentationbeans.PaymentDetailsDisplay.java for details.
// As Start Date appear here as Label, * so we explicitly test with 'Start Date'field before remove the content.
// we need to remove content from Start Month & Start Year drop down field when it is off.
// Other than 'Start Date' all fields are TextField which are not common to all cards.
//
// TODO - this would need to be refactored if we decide we do want to use it.
//*
function removeContentFromOffFields() {
    var selectedCC = $("#CardSchemeCode1").options[$("#CardSchemeCode1").selectedIndex].value;
    var cardSwitchArray = CCFieldProfileList[selectedCC].split(separator);
    for (var i = 0; i < possibleCardFieldsThisXML.length; i++) {
        if (cardSwitchArray[i] == "off"
            && document.payment[possibleCardFieldsThisXML[i]]) {
            document.payment[possibleCardFieldsThisXML[i]].value = '';
        } else if (cardSwitchArray[i] == "off"
            && ($("#StartDateMonth").length > 0 || $("#StartDateYear").length > 0)
            && possibleCardFieldsThisXML[i] == 'StartDate') {
            $("#StartDateMonth").val('');
            $("#StartDateYear").val('');
        }
    }
    if (selectedCC == "TP") {
        $("#NameOnCard").val("UATP CARD");
    }
}

// next two functions are for floaty pod
function stickyHandle(oldScrollHeight) {
    var stickyJQElm = $('#a-small-right');
    var currScrollHeight = docScrollHeight();
    var docHeight = oldScrollHeight && oldScrollHeight < currScrollHeight ? oldScrollHeight
        : currScrollHeight;
    var scrollPos = $(window).scrollTop();
    var maxScrollTo = docHeight - stickyJQElm.height() - headerHeight;

    if (scrollPos > headerHeight) {
        var scrollItTo = scrollPos - headerHeight > maxScrollTo ? maxScrollTo
            : scrollPos - headerHeight;
    } else if (parseInt(stickyJQElm.css('top')) > 0) {
        var scrollItTo = 0;
    } else {
        return false;
    }
    stickyJQElm.stop().animate({
        top: scrollItTo
    }, 'slow');
    return false;
}

function docScrollHeight() {
    return document.getElementsByTagName("html")[0].scrollHeight;
}

function setMask(thisId, swapId) {
    var value = $('#' + thisId).val();
    $('#' + swapId).val(value);
    $('#' + thisId).hide();
    $('#' + swapId).show();
};

// --- Drop down menu for saved cards ---
function initDropDown() {
    "use strict";

    var cardOptions = $('#cardOptionContainer'),
        selectedOption = $("#selectedOption");

    //Display card details area
    var savedCardDetailsHolder = $('#savedCardDetailsHolder');

    var savedCardLogo = savedCardDetailsHolder.find('.cardLogo'),
        savedSchemeName = savedCardDetailsHolder.find('.cardSchemeName'),
        savedExpiryDate = savedCardDetailsHolder.find('.cardExpiryDate'),
        savedEndingNumber = savedCardDetailsHolder.find('.cardEndingNumber'),
        tokenField = $('#storedCardToken'),
        expiryYearField = $('#ExpiryDateYear1'),
        expiryMonthField = $('#ExpiryDateMonth1'),
        startYearField = $('#StartDateYear1'),
        startMonthField = $('#StartDateMonth1'),
        cardNumberField = $('#CardNumber1'),
        countryField = $('#DispCountry'),
        schemeField = $('#CardSchemeCode1'),
        address1Field = $('#AddressLine1'),
        address2Field = $('#AddressLine2'),
        address3Field = $('#AddressLine3'),
        postalField = $('#PostalCode'),
        stateField = $('#State');

    //Hide drop down when click out of it - mimic behaviour of an actual select menu
    function hideSelectMenu() {
        selectedOption.css({'z-index': 501});
        cardOptions.slideUp(300);
        $('body').off('click', hideSelectMenu);
    }

    //Show drop down
    selectedOption.click(function (event) {
        event.stopPropagation();
        selectedOption.css({'z-index': 499});
        cardOptions.slideDown(300);
        $('body').on('click', hideSelectMenu);
    });

    //set state manually - this is necessary beacuse a card address only gives state name and not code so the XSLT wont automatically set it
    var currentCard = savedCards[selectedOption.attr('data-token')];
    if (currentCard.state) {
        stateField.find('option').filter(function () {
            return this.text == currentCard.state;
        }).attr('selected', true);
    }

    //Select an option from the drop down menu
    $("#cardOptions li").click(function () {

        //chosen option
        var selectedText = $(this),
            selectedToken = $(this).attr('data-token');

        //Replace selected option text with the selection (if its a valid card).
        //The menu will close without doing anything if it is a disalowed card.
        if (!$(this).hasClass('disabledCard')) {

            var cardToUse = savedCards[selectedToken];
            var currentToken = tokenField.val();

            //set the visible form fields
            adjustFields(cardToUse.cardSchemeCode, 1, "normal");

            //update surcharge
            changeTotal('Card', cardToUse.cardSchemeCode);

            //Only perform the DOM updates if the user selected a card not already shown
            if (selectedToken != currentToken) {

                $("#cardOptions li.selectedCard").removeClass('selectedCard');
                $(this).addClass('selectedCard');

                //replace selected card div content
                selectedOption.attr('data-token', selectedText.attr('data-token'));
                selectedOption.find('.cardLogo').attr('class', selectedText.find('.cardLogo').attr('class'));
                selectedOption.find('p').html(selectedText.find('p').html());

                //visual details

                //get rid of the class for the card logo and replace it with the class for new image
                savedCardLogo[0].className = savedCardLogo[0].className.replace(/[ ]cardType[A-Z]+/, '');
                savedCardLogo.addClass('cardType' + cardToUse.cardSchemeCode);

                //Scheme name
                savedSchemeName.text(cardToUse.cardScheme);

                //Number (last 4 digits)
                savedEndingNumber.text(cardToUse.cardNumber.slice(-4));

                //Expiry
                savedExpiryDate.text(cardToUse.expiry);

                //hidden fields

                //address
                address1Field.val(cardToUse.addressLine1);
                address2Field.val(cardToUse.addressLine2);
                address3Field.val(cardToUse.addressLine3);
                postalField.val(cardToUse.postalCode);

                //state only in US
                if (cardToUse.state) {
                    stateField.find('option').filter(function () {
                        return this.text == cardToUse.state;
                    }).attr('selected', true);
                }

                //token
                tokenField.val(cardToUse.token);

                //expiry
                if (cardToUse.expiry) {
                    expiryMonthField.val(parseInt(cardToUse.expiry.substr(0, cardToUse.expiry.indexOf('/'))));
                    expiryYearField.val(cardToUse.expiry.substr(cardToUse.expiry.indexOf('/') + 1, cardToUse.expiry.length));
                } else {
                    expiryMonthField.val("");
                    expiryYearField.val("");
                }

                //start date
                if (cardToUse.start) {
                    startMonthField.val(parseInt(cardToUse.start.substr(0, cardToUse.start.indexOf('/'))));
                    startYearField.val(cardToUse.start.substr(cardToUse.start.indexOf('/') + 1, cardToUse.start.length));
                } else {
                    startMonthField.val("");
                    startYearField.val("");
                }

                //card number
                cardNumberField.val(cardToUse.cardNumber);

                //country
                countryField.val(cardToUse.country);

                //scheme code
                schemeField.val(cardToUse.cardSchemeCode);
                trackingInfo["savedCardType"] = cardToUse.cardSchemeCode;
            }
        }

    });

}

//Function to change billing address when using pre-saved addresses.
// @param preset string - a value to set the address to if needs to be manually set
function changeBillingAddress(preset) {

    var radioButtons = $('#savedAddress').find('input[type=radio]'),
        preSelected = $('#savedAddress').find('input[type=radio]:checked'),
        address1Field = $('#AddressLine1'),
        address2Field = $('#AddressLine2'),
        address3Field = $('#AddressLine3'),
        postalField = $('#PostalCode'),
        stateField = $('#State'),
        newAddressRadio = $('#savedAddressChoice');

    //when an option selected - do this
    function changeRadio(selectedOption) {

        if (selectedOption == 'NewCard') {
            //clear fields
            address1Field.add(address2Field).add(address3Field).add(postalField).add(stateField).val('');
        } else if (savedAddresses[selectedOption]) {

            var addressToUse = savedAddresses[selectedOption];

            address1Field.val(addressToUse.addressLine1);
            address2Field.val(addressToUse.addressLine2);
            address3Field.val(addressToUse.addressLine3);
            postalField.val(addressToUse.postalCode);

            //state only in US
            if (addressToUse.state) {

                stateField.find('option').filter(function () {
                    return this.text == addressToUse.state;
                }).attr('selected', true);

            }
        }
    }

    //set the 'new' option to being checked if nothing is checked and a checkbox exists
    if (preSelected.length == 0 && newAddressRadio.length > 0) {
        newAddressRadio.attr("checked", 'checked');
    }

    //change address
    radioButtons.change(function () {
        changeRadio($(this).attr('data-id'));
    });

    //if already selected populate this
    if (preSelected.length > 0) {
        if (preSelected.attr('data-id') != 'NewCard') {
            changeRadio(preSelected.attr('data-id'));
        }
    }

    //if a manually triggered change is required.
    if (preset) {
        changeRadio(preset);
    }

}

//function for removing and adding donations pod

function donationRoundup() {
    var totalPriceDonation = ""
    $("#donationBoxA2, input[type=radio]").click(function () {
        var $this = $(this);
        $this.siblings("input[type=radio]").prop("checked", false);

        var test = $this.attr("id");

        if (test == "r1A2") {
            $("#eId").val($("#donationOptInId").val());
            $('#donationAmount').val($this.val());
            document.payment.submit();

        }
        if (test == "r2A2") {

            $("#eId").val($("#donationOptInId").val());
            $('#donationAmount').val($this.val());
            document.payment.submit();
        }
        if (test == "r3A2") {

            $("#eId").val($("#donationOptInId").val());
            $('#donationAmount').val($this.val());
            document.payment.submit();
        }

        if (test == "r4A2") {
            $("#eId").val($("#donationOptOutId").val());

            document.payment.submit();

        }

    });
};

/* proactive email changes  */

function sendEmail() {
    var language = document.nav_form.language.value;
    var cor = document.nav_form.country.value;
    var emailEligible = checkEligbility();
    if (emailAddress != "" && checkEmail(emailAddress) && !emailSent && emailEligible != 'false') {
        if (!($("input[name='role']").val() == "ecagent")) {
            $.ajax({
                type: "POST",
                url: "/travel/timeout",
                data: {
                    yourEmail: emailAddress,
                    language: language,
                    countryOfResidence: cor,
                    pageIdentifier: 'Pay',
                    appName: appName
                }
            });
            emailSent = true;
        }
    }
}

function checkEligbility(emailEligible) {
    var agentType = $("input[name='role']").val();
    var loginType = $("input[name='logintype']").val();
    emailEligible = 'true';
    if (agentType == 'ecagent' || agentType == 'capagentmf' || agentType == 'capagentgs') {
        emailEligible = 'false';
    }
    if (loginType != 'inet' && loginType != 'execclub' && loginType != 'public') {
        emailEligible = 'false';
    }
    if (appName == 'FXHB') {
        emailEligible = 'false';
    }
    if (appName.indexOf("FX") == -1) {
        emailEligible = 'false';
    }
    return emailEligible;
}
function checkEmail(email) {
    var filter = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!filter.test(email)) {
        return false;
    }
    return true;
}
function addEmailEntry(addRemoveEventId) {
    var language = document.nav_form.language.value;
    var cor = document.nav_form.country.value;
    var emailEligible = checkEligbility();
    if (emailAddress != "" && checkEmail(emailAddress) && !emailSent && emailEligible == "true") {

        $.ajax({
            type: "POST",
            url: "/travel/fx/public/" + language + "_" + cor + "?eId=" + addRemoveEventId,
            data: {
                yourEmail: emailAddress,
                language: language,
                countryOfResidence: cor,
                sourcePage: 'Pay',
                appName: appName
            },
        });

    }
}

$(document).ready(function () {
    setTimeout(function () {
        this.addEmailEntry('111111');
    }, 5000);
});




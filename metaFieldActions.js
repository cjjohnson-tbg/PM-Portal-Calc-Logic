var operationsWithBuyout = [
    '129',  //Pre-Printing Front Laminate
    '144',   //Pre-Printing Back Laminate
    '131',   //Front Laminating
    '130'   //Back Laminating
]
var buyoutOperationItems = [
    '845',
    '846',
    '864',
    '865'
]

var metaMessage = '';
var disableCheckoutText = '';
var outsourcePriceMessageCount = 0;
var outsourcePriceMessage = '<p>All outsourcing costing needs to be added to configured price.</p>';

var cu = calcUtil;
var metaFieldsActions = {
    onCalcLoaded: function() {
        // apply datepicker to meta fields with Pace in label
        $('#additionalProductFields .additionalInformation div label:contains("Date")').parent().addClass('date');
        var dateInput = $('.date input');
        dateInput.datepicker({
            showAnim: "fold"
        });
        //Add ID for due date on SF field
        $('#additionalProductFields .additionalInformation div label:contains("Due Date")').parent().attr('id','dueDate');
        //Hide Actual Pace Inventory ID and Qty
        $('#additionalProductFields .additionalInformation div label:contains("Actual")').parent().hide();

        $('#additionalProductFields .additionalInformation div label:contains("Actual Pace Inventory ID")').parent().addClass('actualId');
        $('#additionalProductFields .additionalInformation div label:contains("Buy-out")').parent().addClass('buyout').hide()

        $('#additionalProductFields .additionalInformation div label:contains("Date Due to Fab")').parent().addClass('fabDate');
        $('#additionalProductFields .additionalInformation div label:contains("Date Due in Kitting")').parent().addClass('kitDate');
        $('#additionalProductFields .additionalInformation div label:contains("Soft Proof Date")').parent().addClass('softProofDate');
        $('#additionalProductFields .additionalInformation div label:contains("Sub-out Date")').parent().addClass('subOutDate');
        $('#additionalProductFields .additionalInformation div label:contains("SKU, if Sending to Fulfillment")').parent().addClass('sku');
        $('#additionalProductFields .additionalInformation div label:contains("Pace Estimate #")').parent().addClass('paceEstimate');
        $('#additionalProductFields .additionalInformation div label:contains("Color Critical")').parent().addClass('colorCritical');

        //Buyout Description Max 50 characters
        $('#additionalProductFields .additionalInformation div label:contains("Hard Proof")').parent().addClass('hardProof').hide();
        $('.buyout label:contains("Description")').parent().attr('id','buyoutDescription');
        $('.buyoutDescription').append('<div><span class="buyoutCharWarning" style="color:blue"></span></div>');
        $('.buyoutDescription input').attr('maxlength', '50');
        $('.buyoutDescription input').keypress(function() {
            if (this.value.length == 50) {
                $('.buyoutCharWarning').text('Description has a 50 Character Limit');
            } else {
                $('.buyoutCharWarning').text('');
            }
        });
        //Kitting Code Max 5 characters
        $('#additionalProductFields .additionalInformation div label:contains("Kitting Code")').parent().addClass('kittingCode');
        $('.kittingCode').append('<div><span class="kittingCodeCharWarning" style="color:blue"></span></div>');
        $('.kittingCode input').attr('maxlength', '5');
        $('.kittingCode input').keypress(function() {
            if (this.value.length == 5) {
                $('.kittingCodeCharWarning').text('Warning: Kitting Code has a 5 Character Limit');
            } else {
                $('.kittingCodeCharWarning').text('');
            }
        });
        //Remove all meta fields on re-order or duplicating jobs
        var previousPage = document.referrer;
        var previousPageWasCart = previousPage.indexOf('order/cart') != -1;
        if (previousPageWasCart) {
            $('.additionalInformation .hardProof input').val('');
        } else {
            $('.additionalInformation input').val('');
        }
    },
    onQuoteUpdated: function(updates, validation, product) {
        /*  SHOW AND REQUIRE HARD PROOF META FIELDS WHEN HARD PROOF SELECTED */
        //set variable to disable click action on checkout
        
        
        var disableCheckoutCount = 0;
        var checkoutButton = $('button.continueButton');

        var hardProofInput = $('.hardProof input');
        if (cu.getValue(fields.proof) == 40 || cu.getValue(fields.proof) == 43) {
            $('.hardProof').show();
            cu.setLabel(fields.proof,'Proof (Enter Hard Proof Due Date Below)');
            $('.hardProof').css('color','red');
            if (hardProofInput.val() == '') {
                disableCheckoutText += '<p>Please enter a Hard Proof Date below</p>';
                disableCheckoutCount++;
                hardProofInput.bind('blur', function(event) {
                    setTimeout(function() {
                        if (hardProofInput.val() !='') {
                            disableCheckoutCount--;
                            if (disableCheckoutCount < 1) {
                                enableCheckoutButton();
                            }
                        }
                    },1000);
                });
            }
        } else {
            $('.hardProof').hide();
        }
        //Disallow contintue button with Buyout as substrate
        var hasBuyout = false;
        var buyoutDescInput = $('#buyoutDescription input');
        if (cu.isSmallFormat(product)) {
            var paperType = fields.paperType;
            if (cu.getValue(fields.paperType) == 247) {
                hasBuyout = true;
                cu.setLabel(fields.paperType,'Substrate (Enter Desc and Size below)');
            }
            if (cu.operationInSetHasValueInSet(operationsWithBuyout, buyoutOperationItems)) {
                hasBuyout = true;
            }
        } else {  //LF calculator
            console.log("LF calc");
            if (cu.getValue(fields.printSubstrate) == 207) {
                console.log("has buyout");
                hasBuyout = true;
                cu.setLabel(fields.printSubstrate,'Substrate (Enter Desc and Size below)');
            } if (cu.getValue(fields.frontLaminate) == 34 || cu.getValue(fields.frontLaminate) == 35) {
                hasBuyout = true;
                cu.setLabel(fields.frontLaminate,'Front Laminate (Enter Desc and Size below)');
            } if (cu.getValue(fields.backLaminate) == 34 || cu.getValue(fields.backLaminate) == 35) {
                hasBuyout = true;
                cu.setLabel(fields.backLaminate,'Back Laminate (Enter Desc and Size below)');
            } if (cu.getValue(fields.operation67) == 324) {
                hasBuyout = true;
                cu.setLabel(fields.operation67,'Pre-Printing Front Laminate (Enter Desc and Size below)');
            }
            if (cu.getValue(fields.operation84) == 325) {
                hasBuyout = true;
                cu.setLabel(fields.operation84,'Pre-Printing Back Laminate (Enter Desc and Size below)');
            }
        }
        if (hasBuyout) {
            $('.buyout').show();
            $('.actualId').show();
            $('.buyout').css('color','red');
            
            if (buyoutDescInput.val() =='') {
                disableCheckoutCount++;
                disableCheckoutText += '<p>You have selected a Buy-out Material.  Please enter in a description of the material below or choose a different material.</p>';
                buyoutDescInput.bind('blur', function(event) {
                    if (buyoutDescInput.val() !='') {
                        disableCheckoutCount--;
                        if (disableCheckoutCount < 1) {
                            //set timeout for 
                            enableCheckoutButton();
                        }
                    }
                });
            }
        } else {
            $('.buyout').hide();
            $('.actualId').hide();
        }
        ///Only show Fab Date if Fabrication operation selects OR Cut at Fab is selected for Cutting Operation AND sub out if Outsourced selects
        if (!cu.isSmallFormat(product)) {
            var cuttingOp = fields.operation111;
            var fabLfOp = fields.operation113;
            if (fabLfOp || cuttingOp) {
                if (cu.hasValue(fabLfOp) || (cu.getValue(cuttingOp) == 495)) {
                    $('.fabDate').show();
                    if (cu.hasValue(fabLfOp)) {
                        cu.setLabel(fabLfOp, 'Fabrication (please enter date below)');
                        if (outsourcePriceMessageCount == 0) {
                            metaMessage += outsourcePriceMessage;
                            outsourcePriceMessageCount++;
                        }
                    }
                } else {
                    $('.fabDate').hide();
                    $('.fabDate input').val('');
                }
            }
            var outsourceLfOp = fields.operation104;
            if (outsourceLfOp) {
                if (cu.hasValue(outsourceLfOp)) {
                    $('.subOutDate').show();
                    cu.setLabel(outsourceLfOp, 'Outsource (please enter date below)');
                    if (outsourcePriceMessageCount == 0) {
                        metaMessage += outsourcePriceMessage;
                        outsourcePriceMessageCount++;
                    }
                } else {
                    $('.subOutDate').hide();
                    $('.subOutDate input').val('');
                }
            }
        } else {
            var fabOp = fields.operation172;
            if (fabOp) {
                if (cu.hasValue(fabOp)  || (cu.getValue(fields.operation170) == 1156)) {
                    $('.fabDate').show();
                    cu.setLabel(fabOp, 'Fabrication (please enter date below)');
                    if (outsourcePriceMessageCount == 0) {
                        metaMessage += outsourcePriceMessage;
                        outsourcePriceMessageCount++;
                    }
                } else {
                    $('.fabDate').hide();
                    $('.fabDate input').val('');
                }
            }
            var outsourceOp = fields.operation156;
            if (outsourceOp) {
                if (cu.hasValue(outsourceOp)) {
                    $('.subOutDate').show();
                    cu.setLabel(outsourceOp, 'Outsource (please enter date below)');
                    if (outsourcePriceMessageCount == 0) {
                        metaMessage += '<p>All outsourcing costing needs to be added to configured price.</p>';
                        outsourcePriceMessageCount++;
                    }
                } else {
                    $('.subOutDate').hide();
                    $('.subOutDate input').val('');
                }
            }
        }
        //Only show Color Critial field when Color Critical Operations is selected
        if (!cu.isSmallFormat(product)) {
            if (fields.operation130) {
                if (cu.hasValue(fields.operation130)) {
                    $('.colorCritical').show();
                    $('#lfVariousSettings').append($('.colorCritical'));
                } else {
                    $('.colorCritical').hide();
                }
            }
        }
        if (cu.getPjcId(product) != 458) { //Temp remove for bucket
            if (disableCheckoutCount > 0) {
                disableCheckoutButton(disableCheckoutText);
            } else {
                enableCheckoutButton();
            }
        }   
        showMetaMessages();
    }
}

function showMetaMessages() {
    if (metaMessage != '') {
        cu.alert(metaMessage);
        metaMessage = '';
    }
}   

function disableCheckoutButton(disableCheckoutText) {
    $('button.continueButton').removeAttr('onclick');
    $('button.continueButton').bind('click', function(event) {
        if (disableCheckoutText != '') {
            cu.alert('<h3>These issues must be resolved before continuing</h3>' + disableCheckoutText);
        }
    });
}
function enableCheckoutButton() {
    $('button.continueButton').unbind('click');
    $('button.continueButton').attr('onclick', 'common.continueClicked();');
}

configureEvents.registerOnCalcLoadedListener(metaFieldsActions);
configureEvents.registerOnQuoteUpdatedListener(metaFieldsActions);


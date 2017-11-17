
var metaFieldsActions = {
    onCalcLoaded: function() {

        //ADD classes to metaFields
        var metaFieldClass = [
            ['Date', 'date'],
            ['Actual Pace Inventory ID', 'actualId'],
            ['Buy-out', 'buyout'],
            ['Date Due to Fab', 'fabDate'],
            ['Date Due in Kitting', 'kitDate'],
            ['Soft Proof Date', 'softProofDate'],
            ['Sub-out Date', 'subOutDate'],
            ['SKU', 'sku'],
            ['Pace Estimate','paceEstimate'],
            ['Color Critical', 'colorCritical'],
            ['Hard Proof', 'hardProof'],
            ['Kitting Code','kittingCode']
        ]
        $.each(metaFieldClass , function (i, val) {
            $('#additionalProductFields .additionalInformation div label:contains("' + val[0] + '")').parent().addClass(val[1]);
        });

        // apply datepicker to meta fields with Pace in label
        var dateInput = $('.date input');
        dateInput.datepicker({
            showAnim: "fold"
        });

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
    onQuoteUpdated: function(product) {
        var disableCheckoutCount = 0;
        var metaMessage = '';
        /*  SHOW AND REQUIRE HARD PROOF META FIELDS WHEN HARD PROOF SELECTED */
        //set variable to disable click action on checkout
        var checkoutButton = $('button.continueButton');

        var disableCheckoutText = '';

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
        var outsourcePriceMessageCount = 0;
        var outsourcePriceMessage = '<p>All outsourcing costing needs to be added to configured price.</p>';
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
        if (cu.isSmallFormat(product)) {
            if (fields.operation205) {
                $('.colorCritical label:contains("Color Critical")').parent().attr('id','colorCriticalJobMeta');
                var colorCriticalJobInput = $('#colorCriticalJobMeta input');
                if (cu.hasValue(fields.operation205)) {
                    $('.colorCritical').show();
                    $('.colorCritical').css('color', 'red');
                    if (colorCriticalJobInput.val() == '') {
                        disableCheckoutCount++;
                        disableCheckoutText += '<p>You have selected a Color Critical Device.  Please declare a job Number below.</p>';
                        colorCriticalJobInput.bind('blur', function(event) {
                            if (colorCriticalJobInput.val() !='') {
                                disableCheckoutCount--;
                                if (disableCheckoutCount < 1) {
                                    //set timeout for 
                                    enableCheckoutButton();
                                }
                            }
                        });
                    }
                } else {
                    $('.colorCritical').hide();
                }
            }
        } else {  //large format products
            if (fields.operation130) {
                $('.colorCritical label:contains("Color Critical")').parent().attr('id','colorCriticalJobMeta');
                var colorCriticalJobInput = $('#colorCriticalJobMeta input');
                if (cu.hasValue(fields.operation130)) {
                    $('.colorCritical').show();
                    if (colorCriticalJobInput.val() == '') {
                        disableCheckoutCount++;
                        disableCheckoutText += '<p>You have selected a Color Critical Device.  Please declare a job Number below.</p>';
                        colorCriticalJobInput.bind('blur', function(event) {
                            if (colorCriticalJobInput.val() !='') {
                                disableCheckoutCount--;
                                if (disableCheckoutCount < 1) {
                                    //set timeout for 
                                    enableCheckoutButton();
                                }
                            }
                        });
                    }
                } else {
                    $('.colorCritical').hide();
                }
            }
        }
        if (cu.getPjcId(product) != 458) { //Temp remove for bucket
            console.log(disableCheckoutText);
            if (disableCheckoutCount > 0) {
                disableCheckoutButton(disableCheckoutText);
            } else {
                enableCheckoutButton();
            }
        }   
        
        //Show message, if populated
        if (metaMessage != '') {
            cu.alert(metaMessage);
            metaMessage = '';
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
    }
}




var metaFieldsActions = {
    onCalcLoaded: function() {
        
        addMetaClassNames();
        addDatePickers();
        characterMax();
        clearReorderMeta();

        bindCalcReInit();

        function addMetaClassNames() {
            //ADD classes to metaFields
            var metaFieldClass = [
                ['Date', 'date'],
                ['Actual Pace Inventory ID', 'actualId'],
                ['Buy-out', 'buyout'],
                ['Date Due to Fab', 'fabDate'],
                ['Date Due in Kitting', 'kitDate'],
                ['Finishing Due Date', 'finishingDate'],
                ['Soft Proof Date', 'softProofDate'],
                ['Sub-out Date', 'subOutDate'],
                ['SKU', 'sku'],
                ['Pace Estimate','paceEstimate'],
                ['Color Critical', 'colorCritical'],
                ['Hard Proof', 'hardProof'],
                ['Kitting Code','kittingCode'],
                ['Shipping Due Date','shipDate'],
                ['Planning', 'planning'],
                ['Estimated Final Quantity', 'estFinalQty'],
                ['Proof Quantity for PM', 'pmProofQty']
            ]
            $.each(metaFieldClass , function (i, val) {
                $('#additionalProductFields .additionalInformation div label:contains("' + val[0] + '")').parent().addClass(val[1]);
            });
        }
        function addDatePickers() {
            // apply datepicker to meta fields with Pace in label
            var dateInput = $('.date input');
            dateInput.datepicker({
                showAnim: "fold",
                onClose: function(e) {
                    //initiate calc logic script
                    //configureEvents.onQuoteUpdated();
                }
            });
        }
        function characterMax() {
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
        }
        function clearReorderMeta() {
            //Remove all meta fields on re-order or duplicating jobs
            var previousPage = document.referrer;
            var previousPageWasCart = previousPage.indexOf('order/cart') != -1;
            if (previousPageWasCart) {
                $('.additionalInformation .hardProof input').val('');
            } else {
                $('.additionalInformation input').val('');
            }
        }
        function bindCalcReInit() {
            var metaFields = $('.additionalInformation div.optionWrapperOn');
            var metaInputs = metaFields.find('input');
            $('.additionalInformation div.optionWrapperOn input').blur(function() {
                configureEvents.onQuoteUpdated();
            });
        }
    },
    onQuoteUpdated: function(product) {
        var metaMessage = '';

        hardProof();
        buyoutMaterial(product);
        outsourceOp();
        colorCritical();
        showMessages();

        function hardProof() {
            var hardProofDate = $('.hardProof');
            var pmQty = $('.pmProofQty');
            var estQtyMeta = $('.estFinalQty');
            var hardProofOptions = [
                '40',   //Printed Hard Proof - Internal
                '43',   //Printed Hard Proof - External
                '48',   //Prototype Proof - External
                '51',    //Prototype Proof - Internal
                '50'    //Printed Hard Proof - Unknown Quantity
            ]
            // hide items by default, show upon Require or other
            hardProofDate.hide();
            pmQty.hide();
            estQtyMeta.hide();
            
            if (cu.isValueInSet(fields.proof, hardProofOptions)) {
                //hide all dates but hard proof
                $('.date').hide();
                cu.setLabel(fields.proof,'Proof (Enter Hard Proof Due Date Below)');
                requireMetaField(hardProofDate, 'Please enter Hard Proof Date');
                if (cu.getValue(fields.proof) == 50) {
                    cu.setLabel(fields.proof,'Proof (Enter Estimated Qty Below)');
                    requireMetaField(estQtyMeta, 'Please enter Estimate Final Quantity');
                } else {
                    requireMetaField(pmQty, 'Please Enter Proof Quantity');
                }
                
            }
        }
        function buyoutMaterial(product) {
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
                requireMetaField($('.buyout'), 'You have selected a Buy-out Material.  Please enter in a description of the material below or choose a different material.');
                $('.actualId').show();
            } else {
                $('.buyout').hide();
                $('.actualId').hide();
            }
        }
        function outsourceOp() {
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
        }
        function colorCritical() {
            //Only show Color Critial field when Color Critical Operations is selected
            var jobIsColorCritical = false;
            var colorCritialMeta = $('.colorCritical input');
            if (cu.isSmallFormat(product)) {
                if (fields.operation205) {
                    if (cu.hasValue(fields.operation205)) {
                        jobIsColorCritical = true;
                    }
                }
            } else {  //large format products
                if (cu.hasValue(fields.operation130)) {
                    jobIsColorCritical = true;
                }
            }
            if (jobIsColorCritical) {
                $('.colorCritical').show();
                $('.colorCritical').css('color', 'red');
                if (colorCritialMeta.val() == '') {
                    disableCheckoutReasons.push('You have selected a Color Critical Device.  Please declare a job Number below.');
                }
                $('.colorCritical input').blur(function() {
                    configureEvents.onQuoteUpdated();
                });
            } else {
                $('.colorCritical').hide();
            }
        }
        function requireMetaField(metaField, message) {
            var metaInput = $(metaField).find('input');
            metaField.show();
            metaField.css('color','red');
            if (metaInput.val() == '') {
                disableCheckoutReasons.push(message);
            }
        } 
        function showMessages() {
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
    }
}



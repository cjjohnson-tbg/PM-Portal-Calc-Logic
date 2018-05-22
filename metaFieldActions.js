
var metaMessageCounts = {
    outsourcePriceMessageCount : 0
}

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
                ['Proof Quantity for PM', 'pmProofQty'],
                ['Color will be used for this art', 'colorArt'],
                ['Match to - Other', 'colorMatch'],
                ['Evaluation lighting', 'evalLighting'],
                ['Lighting environment', 'lightEnv'],
                ['Add to Slug', 'slug']
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
                //short time to allow for datepicker to enter into input field
                setTimeout(function() {
                    configureEvents.onQuoteUpdated();
                },100);
            });
        }
    },
    onQuoteUpdated: function(product) {
        var metaMessage = '';

        hardProof();
        buyoutMaterial(product);
        fabDate(product);
        subOutDate(product);
        colorCriticalDevice();
        colorWork(product);
        tileSlug();
        showMessages(product);

        function hardProof() {
            var hardProofDate = $('.hardProof');
            var pmQty = $('.pmProofQty');
            var estQtyMeta = $('.estFinalQty');
            var hardProofOptions = [
                '40',   //Printed Hard Proof - Internal
                '43',   //Printed Hard Proof - External
                '48',   //Prototype Proof - External
                '51'    //Prototype Proof - Internal
            ]
            // hide items by default, show upon Require or other
            hardProofDate.hide();
            pmQty.hide();
            estQtyMeta.hide();
            
            if (cu.isValueInSet(fields.proof, hardProofOptions)) {
                requireMetaField(pmQty, 'Please Enter Proof Quantity');
                cu.setLabel(fields.proof,'Proof (Enter Hard Proof Due Date Below)');
                requireMetaField(hardProofDate, 'Please enter Hard Proof Date');
            } else if (cu.getValue(fields.proof) == 50) {
                //hide all dates but hard proof and Ship By
                $('.date').hide();
                $('.shipDate').show();
                $('.softProofDate').show();
                cu.setLabel(fields.proof,'Proof (Enter Estimated Qty Below)');
                requireMetaField(estQtyMeta, 'Please enter Estimate Final Quantity');
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
        function subOutDate(product) {
            var isSmallFormat = cu.isSmallFormat(product);
            var outsourceOp = isSmallFormat ? fields.operation156 : fields.operation104;
            var outsourcePriceMessage = '<p>All outsourcing costing needs to be added to configured price.</p>';
            if (outsourceOp) {
                if (cu.hasValue(outsourceOp)) {
                    $('.subOutDate').show();
                    cu.setLabel(outsourceOp, 'Outsource (please enter date below)');
                    if (metaMessageCounts.outsourcePriceMessageCount == 0) {
                        metaMessage += outsourcePriceMessage;
                        metaMessageCounts.outsourcePriceMessageCount++;
                    }
                } else {
                    $('.subOutDate').hide();
                    $('.subOutDate input').val('');
                }
            }
        }
        function fabDate(product) {
            //Only show Fab Date if Fabrication operation selects OR Cut at Fab is selected for Cutting Operation 
            var hasFabChosen = false;
            var requireFabDate = false;

            var isSmallFormat = cu.isSmallFormat(product);
            var fabOp = isSmallFormat ? fields.operation172 : fields.operation113;
            var cuttingOp = isSmallFormat ? fields.operation170 : fields.operation111;

            var heatBendingVertOp = isSmallFormat ? fields.operation156 : fields.operation117;
            var headBendingHorizOp = isSmallFormat ? fields.operation249 : fields.operation162;

            if (cu.hasValue(fabOp)) {
                hasFabChosen = true;
            }

            if (cu.hasValue(cuttingOp)) {
                var cutChoice = cu.getSelectedOptionText(cuttingOp);
                if (cutChoice.indexOf('Fab') != -1) {
                    hasFabChosen = true;
                }
            }

            //if either heat bending options selected require 
            if (cu.hasValue(heatBendingVertOp)) {
                if (cu.getSelectedOptionText(heatBendingVertOp).indexOf('Fab') != -1) {
                    requireFabDate = true
                }
            }
            if (cu.hasValue(headBendingHorizOp)) {
                if (cu.getSelectedOptionText(headBendingHorizOp).indexOf('Fab') != -1) {
                    requireFabDate = true
                }
            }


            if (hasFabChosen || requireFabDate) {
                $('.fabDate').show();
                cu.setLabel(fabOp, 'Fabrication (please enter date below)');
                if (requireFabDate) {
                    requireMetaField($('.fabDate'),'Please enter Fab Date below')
                }
            } else {
                $('.fabDate').hide();
                $('.fabDate input').val('');
            }
        }
        function colorCriticalDevice() {
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
        function tileSlug() {
            var slugOp = fields.operation165;
            if (cu.getValue(slugOp) == 817) {
                requireMetaField($('.slug'), 'Please Enter Special Slug Size.')
            } else {
                $('.slug').hide();
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
        function colorWork(product) {
            var smallFormat = cu.isSmallFormat(product);

            var colorMatchOp = smallFormat ? fields.operation243 : fields.operation156;
            var colorMatchOpItems = smallFormat ? ['1711'] : ['766'];
            var colorArtOp = smallFormat ? fields.operation244 : fields.operation157;
            var colorArtOpItems = smallFormat ? ['1712', '1715'] : ['767', '770'];
            var evalLightOp = smallFormat ? fields.operation245 : fields.operation158;
            var evalLightOpItems = smallFormat ? ['1721'] : ['776'];
            var lightEnvOp = smallFormat ? fields.operation247 : fields.operation159;
            var lightEnvOpItems = smallFormat ? ['1725'] : ['782'];

            colorWorkOpCheck(colorArtOp, colorArtOpItems, $('.colorArt'), 'Please Enter Filepath below');
            colorWorkOpCheck(colorMatchOp, colorMatchOpItems, $('.colorMatch'), 'Please Enter Match To Description below');
            colorWorkOpCheck(evalLightOp, evalLightOpItems, $('.evalLighting'), 'Please Enter Evaluation Lighting Description below');
            
            lightingEnvironment();

            function colorWorkOpCheck(op, items, metaQuestion, message) {
                if (cu.isValueInSet(op, items)) {
                    requireMetaField(metaQuestion, message);
                } else {
                    metaQuestion.hide();
                }
            }
            function lightingEnvironment() {
                var lightEnvOp = fields.operation247;
                if (cu.getValue(lightEnvOp) == 1725) {
                    colorWorkOpCheck(lightEnvOp, lightEnvOpItems, $('.lightEnv'), 'Please Enter Lighting Environment: Non-Backlit Other description below');
                } else {
                    $('.lightEnv').hide();
                }
            }
        }
        
     },
}

var stockClassification = {
    clear : [
        'Buy-out',
        '5883',  //Aberdeen Stretch Knit Backlit - 5.4oz - Roll - 
        '3635',  //Acrylic Clear Cast - .118 - 
        '3605',  //Acrylic Clear Extruded - .118 - 
        '3608',  //Acrylic Clear Extruded - .220 - 
        '2128',  //Acrylic Clear Extruded - .472 - 
        '4058',  //Acrylic DP95 Frosted 2s - .236 - 
        '3614',  //Acrylic DP95 Frosted 2s - .236 - 
        '3642',  //Acrylic Mirror Clr - .125 - 
        '3615',  //Acrylic P95 Frosted 1s - .118 - 
        '3616',  //Acrylic P95 Frosted 1s - .236 - 
        '2714',  //Berger Samba Fabric UV - 6.87oz - Roll - 
        '2681',  //Berger Samba Fabric UV - 6.87oz - Roll - 
        '3110',  //Catalina Clear Enviro Static Cling - 8mil - Roll - 
        '4491',  //Clear Orientated Polyester - 7mil - Roll - 
        '3150',  //Duratex Backlit - 8mil - 
        '2463',  //Duratex Backlit - 8mil - 
        '4072',  //Duratex Backlit - 8mil - 
        '3122',  //Duratex Film - 8mil - Roll - 
        '3124',  //Duratex Film - 8mil - Roll - 
        '3123',  //Duratex Film - 8mil - Roll - 
        '5644',  //IJ8150 Clear - 2mil - Roll - 
        '4477',  //IJ8150 Clearview Film - 2mil - Roll - 
        '3194',  //Kodak Backlit - 8mil - Roll - 
        '3193',  //Kodak Backlit - 8mil - Roll - 
        '3192',  //Kodak Backlit - 8mil - Roll - 
        '3580',  //Optix DA Digital Acrylic - .118 - 
        '3582',  //Optix DA Digital Acrylic - .220 - 
        '3772',  //PETG - .020 - 
        '5445',  //PETG - .020 - 
        '3774',  //PETG - .030 - 
        '5623',  //PETG - .030 - 
        '3773',  //PETG - .030 - 
        '3776',  //PETG - .030 - 
        '3777',  //PETG - .040 - 
        '5577',  //PETG - .040 - 
        '3778',  //PETG - .060 - 
        '3779',  //PETG - .060 - 
        '3780',  //PETG - .080 - 
        '3781',  //PETG - .118 - 
        '5688',  //PETG - .118 - 
        '3783',  //PETG - .177 - 
        '4514',  //PETG Non-Glare - .020 - 
        '3784',  //PETG Non-Glare - .040 - 
        '4370',  //PETG Transilwrap - .010 - 
        '5520',  //Renoir 109T Backlit Pro - 5oz - Roll - 
        '2743',  //Ritrama Crystal Clear - 2mil - 
        '3233',  //Ritrama Crystal Clear Remo - 2mil - Roll - 
        '3236',  //Ritrama Gloss Clear Remo GLCLR - 3.5mil - Roll - 
        '3235'  //Ritrama Gloss Clear Remo GLCLR - 3.5mil - Roll - 
    ]
}


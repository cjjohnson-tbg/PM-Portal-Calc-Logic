var pmPortal = (location.hostname.indexOf("tbghub.com") != -1);
var estimatingSite = (location.hostname.indexOf("estimating.collaterate.com") != -1);
var coatingChoices = {  //standard item id : 10k item id
    260 : 256,  //Flat Matte U/V Coating - 1 sided
    261 : 257,  //Flat Matte U/V Coating - 2 sided
    291 : 293,  //Indigo Sheet Priming - 1 sided
    292 : 294,  //Indigo Sheet Priming - 2 sided
    306 : 308,  //Soft Touch Aqueous Coating - 1 sided
    307 : 309,  //Soft Touch Aqueous Coating - 2 sided
    258 : 254,  //Ultra-Gloss U/V Coating - 1 sided
    259 : 255  //Ultra-Gloss U/V Coating - 2 sided
}
var hasOutsideDieSelected;

var onQuoteUpdatedMessages = '';
var disableCheckoutReasons = [];

var cu = calcUtil;
var pu = pmCalcUtil;
var sfSheetCalcLogic = {
    onCalcLoaded: function(product) {
        //run meta field action
        metaFieldsActions.onCalcLoaded(product);
    },
    onCalcChanged: function(updates, product) {
        if (cu.isPOD(product)) {
            var message = '';
            var submessage = '';
        }
        // show an alert when necessary
        if (message != '' || submessage != '') {
            message += submessage;
            cu.alert(message);
        }
    },
    onQuoteUpdated: function(updates, validation, product) {
        if (cu.isPOD(product)) {
         /*re-init on every update*/
            cu.initFields();
            var submessage = '';

            //run meta field action
            metaFieldsActions.onQuoteUpdated(product);

            checkForColorCriticalDevice(validation);

            if (cu.isSmallFormat(product)) { 
                /************ ADD DIE LIST TO OUTSIDE FINISHING */
                var outsideDieOp = fields.operation153;
                if (outsideDieOp) {
                    if (cu.hasValue(outsideDieOp)) {
                        var dieListURL = 'https://docs.google.com/spreadsheets/d/1PytqvyI5dyH39MrIy2crx3e8z1eDLqVJely8cm9MD5E/pubhtml?gid=654821888&single=true';
                        var dieListLink = ': <a href=' + dieListURL + ' target="_blank" style="text-decoration: underline">Die List</a>';
                        var dieOpQuestion = $('#operation153 div.op label.opQuestion');
                        dieOpQuestion.append(dieListLink);
                        hasOutsideDieSelected = true;
                    }
                }
            	/************ TOGGLE COATING STANDARD AND 10K BY DEVICE TYPE */
          		var deviceType = cu.getDeviceType();
            	var coatingStandard = fields.operation67;
            	var coating10k = fields.operation66;

                if (coatingStandard && coating10k) {
                    if (deviceType == 4 || deviceType == 14) { 
                		if (cu.hasValue(coatingStandard)) {
                            var coating10kItemId = coatingChoices[cu.getValue(coatingStandard)] ? coatingChoices[cu.getValue(coatingStandard)] : '';
                            if (coating10kItemId == '') {
                                onQuoteUpdatedMessages += '<p>There is not a corresponding coating choice for the 10k sheet.  Please choose a different coating option or change the device.</p>';
                            } else if (cu.getValue(coating10k) != coating10kItemId) {
                                cu.changeField(coating10k, coating10kItemId, true);
                            }
                            cu.changeField(coatingStandard,'', true);
                        }
                        cu.hideField(coatingStandard);
                		cu.showField(coating10k);
                	} else {
                        if (cu.hasValue(coating10k)) {
                            var coatingStandardItemId = '';
                            for (key in coatingChoices) {
                                if (coatingChoices[key] == cu.getValue(coating10k)) {
                                    coatingStandardItemId = key;
                                }
                            }
                            if (coatingStandardItemId == '') {
                                onQuoteUpdatedMessages += '<p>There is not a corresponding coating choice for the standard size sheet.  Please choose a different coating option or change the device.</p>';
                            } else if (cu.getValue(coatingStandard) != coatingStandardItemId) {
                               cu.changeField(coatingStandard,coatingStandardItemId,true);
                            }
                            cu.changeField(coating10k,'', true);
                        }
                		cu.hideField(coating10k);
                		cu.showField(coatingStandard);
                	}
                }

                /**** CHANGE SRHINK WRAP QUESTION FOR SETS ****/
                if (cu.getPjcId(product) == 971) {
                    $('#operation14 label.opQuestion').text('How many sets to shrink wrap together');
                }

                setTopAndBottomPieceOps();
                linearOperationItemAnswers();

                ulineLabelDimSelector(updates, product);

                /********* Display Run Time information on Estimating Site for LF Board Estimating */
                $('#runTime span').text(cu.getTotalRuntime());
                $('#totalPressSheets span').text(cu.getTotalPressSheets());
                var piecesOnSheet = (cu.getTotalQuantity() / cu.getTotalPressSheets());
                piecesOnSheet = Math.ceil(piecesOnSheet);
                $('#piecesOnSheet span').text(piecesOnSheet);
                $('#smallFormatPrintSpecs').insertAfter('.quoteContinue');
                $('#smallFormatPrintSpecs').show();
                $('#pressSheetName span').text(cu.getPressSheetName()); 

            }  // END SMALL FORMAT      
        }
        updateUI(updates, product);
        showMessages();
        
        /********************************************* ALERTS */
        function  showMessages () {
            // show an alert when necessary
            if (onQuoteUpdatedMessages != '' || submessage != '') {
                onQuoteUpdatedMessages += submessage;
                cu.alert(onQuoteUpdatedMessages);
                onQuoteUpdatedMessages = '';
            }
        }
    }
}

function updateUI(updates, product) {

    $('#operation141').removeClass('costingOnly');

    var applicationOps = [
        176,  //LF Film Tape Application - Perimeter
        177,  //LF Film Tape Application - Top Only
        178,  //LF Film Tape Application - Top & Bottom
        179,  //LF Magnet Application - Perimeter
        180,  //LF Velcro Application - Top Only
        181,  //LF Magnet Application - Top & Bottom
        182,  //LF Velcro Application - Perimeter
        183,  //LF Magnet Application - Top Only
        184,  //LF Velcro Application - Top & Bottom
        263,  //LF Foam Tape Application - Perimeter
        264,  //LF Foam Tape Application - Top & Bottom
        265,  //LF Foam Tape Application - Top Only
        269,  //LF Film Tape Application - Custom
        270,  //LF Foam Tape Application - Custom
        271,  //LF Magnet Tape Application - Custom
        272  //LF Velcro Tape Application - Custom
    ]
    appendAppOpLabels(applicationOps);

    function appendAppOpLabels(opList) {
        if (!opList) {return}
        var textToAppend = ' at TBG1';
        for (var i = 0; i < opList.length; i++) {
            if ($('div#operation' + opList[i])) {
                var label = $('div#operation' + opList[i]  + ' label').text();
                if (label) {
                    $('div#operation' + opList[i]  + ' label').text(label + textToAppend);
                }
            }
            
        }
    }

}

function checkForColorCriticalDevice(validation) {
    //If color cricital operation selected, toggle off Auto Device and select device

    var getCriticalDeviceId = {
        1688 : 9,  //Indigo 7k
        1692 : 4,  //Indigo 10k
        1693 : 24   //Jpress
    }
    var colorCriticalOp = fields.operation238;
    var colorCriticalDevice = fields.operation237;
    if (colorCriticalOp && colorCriticalDevice) {
        //temp opacity on device - will hide after approved
        $('#device').css('display','none');
        $('#operation237 label').css('color', 'red');
        var hasQtyError = false;
        if (cu.hasValue(colorCriticalOp)) {
            //Show special message if quantity of device not hit
            if (calcValidation.hasErrorForField(validation, fields.quantity)) {
                hasQtyError = true;
            }
            cu.showField(colorCriticalDevice);
            cu.setLabel(colorCriticalOp,"Color Critical - Please Select Device");
            //cu.setLabel(colorCriticalOp,"Color Critical - please indicate job # below");
            if (cu.hasValue(colorCriticalDevice)) {
                if (configureglobals.cdevicemgr.autoDeviceSwitch) {
                    toggleAutoDeviceTypeButton();
                    $('select[name="DEVICEDD"]').trigger('focus').trigger('change');
                }
                var criticalDeviceId = getCriticalDeviceId[cu.getValue(colorCriticalDevice)] ? getCriticalDeviceId[cu.getValue(colorCriticalDevice)] : null;
                if (criticalDeviceId && !hasQtyError) {
                    if (cu.getDeviceType() != criticalDeviceId) {
                        setDevice(criticalDeviceId);
                    }
                }
            }
            if (hasQtyError) {
                cu.alert('<p>The default settings for this device cannot run with these specifications. Resubmit the specs with your Color Critical requirements, but do not select a device. Instead, enter a press note with the device required</p>');
            }
        } else {
            if (!configureglobals.cdevicemgr.autoDeviceSwitch) {
                toggleAutoDeviceTypeButton();
            }
            pu.validateValue(colorCriticalDevice,'');
            cu.hideField(colorCriticalDevice);
            cu.setSelectedOptionText(colorCriticalOp,'No');
        }
    }
}
function setTopAndBottomPieceOps() {
    var topInchIncreaserAnswer = fields.operation121_answer;
    var topInchDecreaserAnswer = fields.operation123_answer;
    var topLinInch = cu.getWidth();
    topLinInch = parseInt(topLinInch);
    if (topInchIncreaserAnswer && topInchDecreaserAnswer) {
        if (cu.getValue(topInchIncreaserAnswer) != topLinInch) {
            cu.changeField(topInchIncreaserAnswer, topLinInch, true);
        }
        if (cu.getValue(topInchDecreaserAnswer) != topLinInch) {
            cu.changeField(topInchDecreaserAnswer, topLinInch, true);
        }
    } 
}
function linearOperationItemAnswers () {
    var opsWithTopOnlyLinearAnswers = [
         '122',  //LF Tape, Mag, Velcro - Top Only
         '177',  //LF Film Tape Application - Top Only
         '265',  //LF Foam Tape Application - Top Only
         '183',  //LF Magnet Application - Top Only
         '180'  //LF Velcro Application - Top Only
    ]
    var opsWithTopAndBottomAnswers = [
         '124',  //LF Tape, Mag, Velcro - Top & Bottom
         '184',  //LF Velcro Application - Top & Bottom
         '178',  //LF Film Tape Application - Top & Bottom
         '181',  //LF Magnet Application - Top & Bottom
         '264'  //LF Foam Tape Application - Top & Bottom
    ]
    var width = cu.getWidth();

    insertWidth(opsWithTopOnlyLinearAnswers, parseInt(pu.roundTo(width,0)) );
    insertWidth(opsWithTopAndBottomAnswers, parseInt(pu.roundTo(width * 2,0)) );

    //pu.hideOperationQuestion(opsWithTopOnlyLinearAnswers);
    //pu.hideOperationQuestion(opsWithTopAndBottomAnswers);

    function insertWidth(opList, width) {
        for (var i = 0; i < opList.length; i++) {
            var fieldAnswer = fields['operation' + opList[i] + '_answer'];
            if (fieldAnswer) {
                pu.validateValue(fieldAnswer, width);
            }
        }
    }
}
function toggleAutoDeviceTypeButton() {
    $autoDeviceSelector = $('#device a.togglePreset');
    $autoDeviceButton = $autoDeviceSelector.length == 1 ? $autoDeviceSelector[0] : null;
    if ($autoDeviceButton) {
        // toggle the calculator device type mode
        // "click" the "Let me choose"/"Use best price" button by running it's href javascript
        eval($autoDeviceButton.href);
    }
}
function setDevice(deviceId) {
    var $deviceSelect = $('select[name="DEVICEDD"]');
    var availableValues = $.map($deviceSelect.children('option'), function(e) { return e.value; });
    if ($.inArray(deviceId.toString(), availableValues) != -1) {
        $deviceSelect.val(deviceId);
        $deviceSelect.trigger('focus').trigger('change');
    } else {
        console.log('device not available');
    }
}

function ulineLabelDimSelector(updates, product)  {
    if (cu.getPjcId(product) == 199) {
        var presetDims = fields.presetDimensions;
        var stockType = fields.paperType;

        if (cu.isLastChangedField(updates, stockType)) {
            var labelDims = {
                122 : 434,   //Uline Label 4x3.33
                123 : 393,   //Uline Label 4x2
                124 : 808,   //Uline Label 8.5x5.5
                125 : 392,   //Uline Label 2.625x1
                126 : 435,   //Uline Label 4x6
                108 : null   //Special Order Uline Labels
            }

            var presetDimId = labelDims[cu.getValue(stockType)] ? labelDims[cu.getValue(stockType)] : null;
            if (presetDimId) {
                pu.validateValue(presetDims, presetDimId);
            }
        }
    }
}

configureEvents.registerOnCalcLoadedListener(sfSheetCalcLogic);
//configureEvents.registerOnCalcChangedListener(sfSheetCalcLogic);
configureEvents.registerOnQuoteUpdatedListener(sfSheetCalcLogic);
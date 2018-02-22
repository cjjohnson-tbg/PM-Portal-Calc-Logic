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
var cu = calcUtil;
var pu = pmCalcUtil;
var sfSheetCalcLogic = {
    onCalcLoaded: function(product) {
        // $('.operation66').addClass('hideIt');
        // $('.operation67').addClass('hideIt');
        $('#operation141').removeClass('costingOnly');
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
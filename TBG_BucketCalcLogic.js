var planningOnlyOps = [
    55,   //
    125   //LF Bucket Job
]
var sfPlanningOnlyOperations = [
    150,    //LF Cutting
    154,    //LF Guillotine Cutting
    155,    //LF Fotoba Cutting
    102,    //LF Zund Cutting
    140,     //LF Mounting Adhesive
    165,    //LF Pre-Slit
    166,    //LF Pre-Cut
    168,    //LF No Cutting
    // 170,     //LF Hub Cutting
    174,     //LF TBG-Fab Cut
    193     //LF Bucket Job
]

var opsWithSubIds = [
    129,    //LF Pre-Printing Front Laminate
    130,    //LF Back Laminating
    131,    //LF Front Laminating
    144,    //LF Pre-Printing Back Laminate
    139,     //LF Mounting
    120,    //LF Tape, Mag, Velcro - Perimeter
    122,    //LF Tape, Mag, Velcro - Top Only
    124,     //LF Tape, Mag, Velcro - Top & Bottom
    133      //LF Premask
]
var lfOpsToTrimWithUnderscore = [
    67,  //Pre-Printing Front Laminate
    84,  //Pre-Printing Back Laminate
    58,   //TBG Tape, Mag, Velcro
    78  //LF Premask
]
var zundOpItemMapLoading = {
    1  : 202,    //Speed Factor 1
    2  : 203,    //Speed Factor 2
    3  : 204,    //Speed Factor 3
    4  : 205,    //Speed Factor 4
    5  : 206,    //Speed Factor 5
    6  : 207     //Speed Factor 6
}
var zundOpItemMapCutting = {
    1  : 195,    //Speed Factor 1
    2  : 196,    //Speed Factor 2
    3  : 197,    //Speed Factor 3
    4  : 198,    //Speed Factor 4
    5  : 199,    //Speed Factor 5
    6  : 200     //Speed Factor 6
}
var zundOpItemMapUnloading = {
    1  : 201,    //Speed Factor 1
    2  : 208,    //Speed Factor 2
    3  : 209,    //Speed Factor 3
    4  : 210,    //Speed Factor 4
    5  : 211,    //Speed Factor 5
    6  : 212     //Speed Factor 6 
}

//small format zund
var sfZundLoadingSelections = {
    1  :  645,   //Speed Factor 1
    2  :  646,   //Speed Factor 2
    3  :  647,   //Speed Factor 3
    4  :  648,   //Speed Factor 4
    5  :  649,   //Speed Factor 5
    6  :  650    //Speed Factor 6
}
var sfZundUnloadingSelections = {
    1  :  606,   //Speed Factor 1
    2  :  607,   //Speed Factor 2
    3  :  608,   //Speed Factor 3
    4  :  609,   //Speed Factor 4
    5  :  610,   //Speed Factor 5
    6  :  611    //Speed Factor 6
}
var sfZundCuttingSelections = {
    1  :  593,   //Speed Factor 1
    2  :  594,   //Speed Factor 2
    3  :  595,   //Speed Factor 3
    4  :  596,   //Speed Factor 4
    5  :  597,   //Speed Factor 5
    6  :  598    //Speed Factor 6
}
var side1InkMap = {
    56  : 587,    //Vutek HS100 - CMYK - 1000 DPI_HS
    57  : 612,    //Vutek HS 1000 CMYK + W
    58  : 614,    //Vutek HS100 - CMYK + W + CMYK (Flood / Second Surface) - 1000 DPI_HS
    99  : 614,    //Vutek HS100 - CMYK + W + CMYK (Spot / Second Surface) - 1000 DPI_HS
    120 : 614,    //Vutek HS100 - CMYK + W + CMYK (Flood / First Surface) - 1000 DPI_HS 
    122 : 614,    //Vutek HS100 - CMYK + W + CMYK (Spot / First Surface) - 1000 DPI_HS   
    67  : 691,    //Vutek HS100 - Backlit - 1000 DPI_HS
    61  : 615,    //Inca Q40 CMYK
    124 : 615,    //Vutek HS100 - CMYK (Second Surface) - 1000 DPI_HS
    62  : 616,    //Inca Q40 - CMYK + W (Spot / Second Surface)
    63  : 617,    //Inca Q40 - CMYK + W + CMYK (Flood / Second Surface)
    92  : 617,    //Inca Q40 - CMYK + W + CMYK (Spot / Second Surface)
    69  : 749,    //Vutek HS100 - White Only - 1000 DPI_HS
    72  : 769,    //Inca Q40 White Only
    76  : 616,    //Inca Q40 - CMYK + W (Flood / Second Surface)
    75  : 616,    //Inca Q40 - W + CMYK (Flood / First Surface)
    95  : 616,    //Inca Q40 - W + CMYK (Spot / First Surface)
    78  : 612,    //Vutek HS100 - CMYK + W (Flood / Second Surface) - 1000 DPI_HS
    97  : 612,    //Vutek HS100 - CMYK + W (Spot / Second Surface) - 1000 DPI_HS
    77  : 612,    //Vutek HS100 - W + CMYK (Flood / First Surface) - 1000 DPI_HS
    98  : 612,    //Vutek HS100 - W + CMYK (Spot / First Surface) - 1000 DPI_HS
    100 : 904,    //Vutek HS100 - CMYK + W + W (Flood / Second Surface) - 1000 DPI_HS   NEED NEW INK OP 
    103 : 904,    //Vutek HS100 - CMYK + W + W (Spot / Second Surface) - 1000 DPI_HS
    101 : 904,    //Vutek HS100 - W + W + CMYK (Flood / First Surface) - 1000 DPI_HS
    102 : 904,    //Vutek HS100 - W + W + CMYK (Spot / First Surface) - 1000 DPI_HS
    74  : 837,    //Inca X2 CMYK
    81  : 834,    //Inca Q40 Backlit
    89  : 890,    //Inca Q40 - CMYK + W + W (Flood / Second Surface)
    94  : 890,    //Inca Q40 - CMYK + W + W (Spot / Second Surface)
    88  : 890,    //Inca Q40 - W + W + CMYK (Flood / First Surface)
    93  : 890,    //Inca Q40 - W + W + CMYK (Spot / First Surface)
    117 : 834,    //Inca Q40 - CMYK (Second Surface)
    126 : 1038,  //Vutek HS100 - W + W Only (Spot / Second Surface) - 1000 DPI_HS
    96  : 1038,    //Vutek HS100 - W + W Only (Spot / First Surface) - 1000 DPI_HS
    125 : 749   //Vutek HS100 - White Only (Spot / Second Surface) - 1000 DPI_HS
}
var side2InkMap = {
    56  : 590,    //Vutek HS 1000 CMYK
    57  : 613,    //Vutek HS 1000 CMYK + W
    61  : 618,    //Inca Q40 CMYK
    62  : 621,    //Inca Q40 CMYK + W
    69  : 750,    //Vutek HS100 White Only
    72  : 770,    //Inca Q40 White Only
    76  : 621,    //Inca Q40 CMYK + W (Second Surface)
    75  : 621,    //Inca Q40 W + CMYK (First Surface)
    78  : 613,    //Vutek HS100 CMYK + W (Second Surface)
    77  : 613,    //Vutek HS100 Q40 W + CMYK (First Surface)
    74  : 838,     //Inca X2 CMYK
    6  : 881,      //none
    117 : 618,    //Inca Q40 - CMYK (Second Surface)
    63 : 891,    //Inca Q40 - CMYK + W + CMYK (Flood / Second Surface)
    92 : 891,    //Inca Q40 - CMYK + W + CMYK (Spot / Second Surface)
    89 : 891,    //Inca Q40 - CMYK + W + W (Flood / Second Surface)
    94 : 891,    //Inca Q40 - CMYK + W + W (Spot / Second Surface)
    95 : 621,    //Inca Q40 - W + CMYK (Spot / First Surface)
    91 : 891,    //Inca Q40 - W + W
    88 : 891,    //Inca Q40 - W + W + CMYK (Flood / First Surface)
    93 : 891,    //Inca Q40 - W + W + CMYK (Spot / First Surface)
    120 : 1041,    //Vutek HS100 - CMYK + W + CMYK (Flood / First Surface) - 1000 DPI_HS
    58 : 1041,    //Vutek HS100 - CMYK + W + CMYK (Flood / Second Surface) - 1000 DPI_HS
    122 : 1041,    //Vutek HS100 - CMYK + W + CMYK (Spot / First Surface) - 1000 DPI_HS
    99 : 1041,    //Vutek HS100 - CMYK + W + CMYK (Spot / Second Surface) - 1000 DPI_HS
    97 : 613,    //Vutek HS100 - CMYK + W (Spot / Second Surface) - 1000 DPI_HS
    100 : 1040,    //Vutek HS100 - CMYK + W + W (Flood / Second Surface) - 1000 DPI_HS
    103 : 1040,    //Vutek HS100 - CMYK + W + W (Spot / Second Surface) - 1000 DPI_HS
    98 : 613,    //Vutek HS100 - W + CMYK (Spot / First Surface) - 1000 DPI_HS
    101 : 1040,    //Vutek HS100 - W + W + CMYK (Flood / First Surface) - 1000 DPI_HS
    102 : 1040,    //Vutek HS100 - W + W + CMYK (Spot / First Surface) - 1000 DPI_HS
    96 : 1039    //Vutek HS100 - W + W Only (Spot / First Surface) - 1000 DPI_HS
}

var cu = calcUtil;

//grab zund data from zundSpeedFactors_sheets
getZundData();

var bucketCalcLogic = {
    onCalcLoaded: function(product) {
        //Add planning class to operations
        addClassToOperation(planningOnlyOps,'planning');
        trimOperationItemName(lfOpsToTrimWithUnderscore, '_');

        // apply datepicker to meta fields with Pace in label
        $('#additionalProductFields .additionalInformation div label:contains("Date")').parent().addClass('date');
        $('#additionalProductFields .additionalInformation div label:contains("Shipping Due Date")').parent().addClass('ship-date');
        $('.ship-date').removeClass('date');
        var dateInput = $('.date input');
        dateInput.datepicker({
            showAnim: "fold"
        });
        var shipDateInput = $('.ship-date input');
        shipDateInput.datepicker({
            showAnim: "fold",
            beforeShowDay: $.datepicker.noWeekends,  // disable weekends
            minDate: isNowBeforeCSTCutoffTime(13,15) ? 1 : 2 // if before 1:15, 1, if after 1:15 then 2
        });
        //Add ID for due date on SF field
        $('#additionalProductFields .additionalInformation div label:contains("Due Date")').parent().attr('id','dueDate');
        //Hide Actual Pace Inventory ID and Qty
        $('#additionalProductFields .additionalInformation div label:contains("Actual")').parent().hide();

        $('#additionalProductFields .additionalInformation div label:contains("Actual Pace Inventory ID")').parent().addClass('actualId');
        $('#additionalProductFields .additionalInformation div label:contains("Buy-out")').parent().addClass('buyout').hide()

        $('#additionalProductFields .additionalInformation div label:contains("Date Due to Fab")').parent().addClass('fabDate');
        $('#additionalProductFields .additionalInformation div label:contains("Date Due in Kitting")').parent().addClass('kitDate');
        $('#additionalProductFields .additionalInformation div label:contains("Kitting Code")').parent().addClass('kitCode');
        $('#additionalProductFields .additionalInformation div label:contains("Soft Proof Date")').parent().addClass('softProofDate');
        $('#additionalProductFields .additionalInformation div label:contains("Sub-out Date")').parent().addClass('subOutDate');
        $('#additionalProductFields .additionalInformation div label:contains("SKU, if Sending to Fulfillment")').parent().addClass('sku');
        $('#additionalProductFields .additionalInformation div label:contains("Pace Estimate #")').parent().addClass('paceEstimate');
    },
    onCalcChanged: function(updates, product) {
    },
    onQuoteUpdated: function(updates, validation, product) {
        /*re-init on every update*/
        cu.initFields();

        if (cu.isSmallFormat(product)) {
            /************** ADD STYLE TO CERTAIN ELEMENTS */
            addClassToOperation(sfPlanningOnlyOperations,'planning');

            trimOperationItemName(opsWithSubIds,'_');
            //Change Labels for Paper Type, Weight, Color
            cu.setLabel(fields.paperType,'Substrate');
            cu.setLabel(fields.pages,'Pieces per Set');
            //CHange label of pages for Setrs
            cu.setLabel(fields.paperWeight,'Thickness');
            //STOP IF QALCULATOR NOT RETURNING QUOTE
            if (!configureglobals.cquote.success) { return; }

            /********* Convert pieces for Operation Costing */
            var pieceWidth = cu.getWidth();
            var pieceHeight = cu.getHeight();
            var quantity = cu.getTotalQuantity();
            
            var SqInchIncreaserAnswer = fields.operation97_answer;
            var SqInchDecreaserAnswer = fields.operation100_answer;
            var LinInchIncreaserAnswer = fields.operation101_answer;
            var LinInchDecreaserAnswer = fields.operation103_answer;
            var topInchIncreaserAnswer = fields.operation121_answer;
            var topInchDecreaserAnswer = fields.operation123_answer;

            //Increase Operation Pieces to square inch with bleed
            var pieceSqInch = (parseFloat(pieceWidth) + .5) * (parseFloat(pieceHeight) + .5);
            pieceSqInch = parseInt(pieceSqInch);
            if (cu.getValue(SqInchIncreaserAnswer) != pieceSqInch) {
                cu.changeField(SqInchIncreaserAnswer, pieceSqInch, true);
                return
            }
            if (cu.getValue(SqInchDecreaserAnswer) != pieceSqInch) {
                cu.changeField(SqInchDecreaserAnswer, pieceSqInch, true);
                return
            }
            //Increase Operation Pieces to linear inch
            var pieceLinInch = (2 * (pieceWidth) + 2 * (pieceHeight));
            pieceLinInch = parseInt(pieceLinInch);
            if (cu.getValue(LinInchIncreaserAnswer) != pieceLinInch) {
                cu.changeField(LinInchIncreaserAnswer, pieceLinInch, true);
                return
            }
            if (cu.getValue(LinInchDecreaserAnswer) != pieceLinInch) {
                cu.changeField(LinInchDecreaserAnswer, pieceLinInch, true);
                return
            }
            //Increase Operation Pieces to Top Side Linear Inch
            var topLinInch = pieceWidth;
            topLinInch = parseInt(topLinInch);
            if (cu.getValue(topInchIncreaserAnswer) != topLinInch) {
                cu.changeField(topInchIncreaserAnswer, topLinInch, true);
                return
            }
            if (cu.getValue(topInchDecreaserAnswer) != topLinInch) {
                cu.changeField(topInchDecreaserAnswer, topLinInch, true);
                return
            }
            /********* Align Ink to Color in Operations */
            var sideOneInk = cu.getValue(fields.printingS1);
            var sideTwoInk = cu.getValue(fields.printingS2);
            var sideOneInkId = configureglobals.cquote.pjQuote.side1Ink.id;
            if (cu.hasValue(fields.printingS2)) {
                var sideTwoInkId = configureglobals.cquote.pjQuote.side2Ink.id;
            }
            var sideOneInkOp = fields.operation98;
            var sideTwoInkOp = fields.operation99;
            var shrinkOpTest = fields.operation143;  

            //NEW
            if (sideOneInkId && sideOneInkOp) {
                var sideOneInkOpId = side1InkMap[sideOneInkId];
                if (cu.getValue(sideOneInkOp) != sideOneInkOpId) {
                    cu.changeField(sideOneInkOp, sideOneInkOpId, true);
                    return
                }
            }
            if (sideTwoInkId && sideTwoInkOp) {
                var sideTwoInkOpId = side2InkMap[sideTwoInkId];
                if (cu.getValue(sideTwoInkOp) != sideTwoInkOpId) {
                    cu.changeField(sideTwoInkOp, sideTwoInkOpId, true);
                    return
                }
            }

            /********* CUTTING LOGIC */
            var cuttingOp = fields.operation170;
            if (cu.hasValue(cuttingOp)) {
                cutMethod = cutMethodId[cu.getValue(cuttingOp)];
            } else {
                cutMethod = 'zund'
            }
            var zundCuttingOp = fields.operation102;
            var zundLoadingOp = fields.operation104;
            var zundUnloadingOp = fields.operation105;
            var noCutOp = fields.operation168;
            var outsourceCutOp = fields.operation156;
            var guillotineCutOp = fields.operation154;
            var fabCutOp = fields.operation174;
            //zund Cutting
            if (cutMethod == 'zund') {
                var zundMaterialId = cu.getPressSheetId();
                var zundMaterialType = 'sfPressSheets';
                var speedFactor = getZundSpeedFactor(zundMaterialType,zundMaterialId);
                var zundLoadingFactor = sfZundLoadingSelections[speedFactor];
                var zundUnloadingFactor = sfZundUnloadingSelections[speedFactor];
                var zundCuttingFactor = sfZundCuttingSelections[speedFactor];

                if (cu.getValue(zundLoadingOp) != zundLoadingFactor) {cu.changeField(zundLoadingOp,zundLoadingFactor,true); return}
                if (cu.getValue(zundUnloadingOp) != zundUnloadingFactor) {cu.changeField(zundUnloadingOp,zundUnloadingFactor,true); return}
                if (cu.getValue(zundCuttingOp) != zundCuttingFactor) {cu.changeField(zundCuttingOp,zundCuttingFactor,true); return}
            } else {
                if (cu.hasValue(zundLoadingOp)) {cu.changeField(zundLoadingOp,'', true); return}
                if (cu.hasValue(zundUnloadingOp)) {cu.changeField(zundUnloadingOp,'', true); return}
                if (cu.hasValue(zundCuttingOp)) {cu.changeField(zundCuttingOp,'', true); return}
            }
            //no cutting -- ENTER IN NO CUT FOR noCut AND fabCut
            if (cutMethod == 'noCut') {
                if (!cu.hasValue(noCutOp)) {cu.changeField(noCutOp, 1076, true); return}
            } else {
                if (cu.hasValue(noCutOp)) {cu.changeField(noCutOp, '', true); return}
            }
            //Fab cut
            if (cutMethod == 'fabCut') {
                if (!cu.hasValue(fabCutOp)) {cu.changeField(fabCutOp, 1108, true); return}
                removeClassFromOp(174, 'planning');
            } else {
                if (cu.hasValue(fabCutOp)) {cu.changeField(fabCutOp, '', true); return}
            }
            //outsourced
            if (cutMethod == 'outsourceCut' || cutMethod == 'outsourceDieCut') {
                if (cutMethod == 'outsourceCut') {
                    if (!cu.hasValue(outsourceCutOp)) {cu.changeField(outsourceCutOp, 911, true); return}
                }
                if (cutMethod == 'outsourceDieCut') {
                    if (!cu.hasValue(outsourceCutOp)) {cu.changeField(outsourceCutOp, 1096, true); return}
                    if (!cu.hasValue(guillotineCutOp)) {cu.changeField(guillotineCutOp, 907, true); return}
                } else {
                    if (cu.hasValue(guillotineCutOp)) {cu.changeField(guillotineCutOp, '', true); return}
                }
            } else {
                if (cu.getSelectedOptionText(outsourceCutOp).indexOf('Cut') != -1) {
                    if (cu.hasValue(outsourceCutOp)) {
                        cu.changeField(outsourceCutOp,'',true);
                    }
                }
                removeOperationItemsWithString(156,'Cut');
            }
        } //END SMALL FORMAT
        else {
            var message = '';
            var submessage = '';

            addClassToOperation(planningOnlyOps,'planning');
            trimOperationItemName(lfOpsToTrimWithUnderscore, '_');
            
            /************************ SET ZUND LOADING, CUTTING, AND UNLOADING BASED ON SUBSTRATE */
            //determine cut method
            var cutMethod = 'zund';
            //Zund Cut
            var substrateId = cu.getValue(fields.printSubstrate);

            if (cutMethod == 'zund') {
                
                var zundFactor = getZundSpeedFactor('lfSubstrates', substrateId);

                var zundLoading = fields.operation53;
                var zundCutting = fields.operation55;
                var zundUnloading = fields.operation56;
                //Align Zund Loading Speed Factor
                if (zundLoading) {
                    var zundLoadingItem = !zundOpItemMapLoading[zundFactor] ? 202 : zundOpItemMapLoading[zundFactor];
                	if (cu.getValue(zundLoading) != zundLoadingItem) {
                		cu.changeField(zundLoading, zundLoadingItem, true);
                	}
                }
                //Align Zund Cutting Speed Factor
                if (zundCutting) {
                    var zundCuttingItem = !zundOpItemMapCutting[zundFactor] ? 195 : zundOpItemMapCutting[zundFactor];
                    if (cu.getValue(zundCutting) != zundCuttingItem) {
                		cu.changeField(zundCutting, zundCuttingItem, true);
                	}
                }
                //Align Zund Unloading Speed Factor
                if (zundUnloading) {
                    var zundUnloadingItem = !zundOpItemMapUnloading[zundFactor] ? 195 : zundOpItemMapUnloading[zundFactor];
                    if (cu.getValue(zundUnloading) != zundUnloadingItem) {
                    	cu.changeField(zundUnloading, zundUnloadingItem, true);
                	}
                }
            } 
            /************************ BOARD BUCKET LIMITATIONS */
            //limit to 200 sq ft
            var totalSquareFeet = (cu.getWidth() * cu.getHeight() * cu.getTotalQuantity())/144;
            var message = '';
            if (totalSquareFeet > 200 ) {
                bucketSizeMessage = '<p>The Board Bucket product is limited to jobs less than 200 sq ft.  For jobs greater than this please use the Board Printing Product.</p>';
                message += bucketSizeMessage;
                disableCheckoutButton(bucketSizeMessage);
            } else {
                enableCheckoutButton();
            }

            /********************************************* ALERTS */
            // show an alert when necessary
            if (message != '' || submessage != '') {
                message += submessage;
                cu.alert(message);
            }

	    } //END LARGE FORMAT
    }
}


function disableCheckoutButton(text) {
    $('button.continueButton').removeAttr('onclick');
    $('button.continueButton').bind('click', function(event) {
        if (text != '') {
            cu.alert('<h3>These issues must be resolved before continuing</h3>' + text);
        }
    });
}
function enableCheckoutButton() {
    $('button.continueButton').unbind('click');
    $('button.continueButton').attr('onclick', 'common.continueClicked();');
}
function addClassToOperation(opList, className) {
    for (var i = 0; i < opList.length; i++) {
        $('#operation' + opList[i]).addClass(className);
    }
}
function trimOperationItemName(opList, deliminater) {
    for (var i = 0; i < opList.length; i++) {
        $('select#operation' + opList[i] + ' option').each(function() {
            //var label = $(this).text;
            var label = this.text;
            var index = label.indexOf(deliminater);
            if (index != -1) {
                var newLabel = label.substring(0,index);
                $(this).text(newLabel);
            }
        });
    } 
}
function removeOperationItemsWithString(op, string) {
    $('select#operation' + op +' option').each(function() {
        var item = this.text;
        var index = item.indexOf(string);
        if (index != -1) {
            $(this).hide();
        }
    });
}
function isNowBeforeCSTCutoffTime(hour24, minutes) {
  var localOffsetMs = new Date().getTimezoneOffset()*60*-1000;
  var localVsServerOffsetMs = localOffsetMs - SERVER_TZ_OFFSET_MS;
  var localTime = new Date();
  var localCutoffTime = (new Date(localTime.getFullYear(), localTime.getMonth(), localTime.getDate(), hour24, minutes, 0, 0));
  var localCutoffTime = new Date(localCutoffTime.getTime() + localVsServerOffsetMs);
  var returnVal = localTime.getTime() < localCutoffTime.getTime();
  // console.log('server offset ms ', SERVER_TZ_OFFSET_MS);
  // console.log('local  offset ms ', localOffsetMs);
  // console.log('local vs server  ', SERVER_TZ_OFFSET_MS - localOffsetMs);
  // console.log('server vs local  ', localOffsetMs - SERVER_TZ_OFFSET_MS);
  // console.log('local time       ', localTime);
  // console.log('local cutoff time', localCutoffTime);
  // console.log('you have time before the cutoff?',returnVal);
  return returnVal;
}
configureEvents.registerOnCalcLoadedListener(bucketCalcLogic);
configureEvents.registerOnCalcChangedListener(bucketCalcLogic);
configureEvents.registerOnQuoteUpdatedListener(bucketCalcLogic);

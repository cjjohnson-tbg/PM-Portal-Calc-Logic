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
    125 : 749,   //Vutek HS100 - White Only (Spot / Second Surface) - 1000 DPI_HS
    133 : 1038,   //Vutek HS125 - W + W Only (Flood / First Surface) - 1000 GS-LS

    136 : 1038,   //Vutek HS125 - W + W Only (Flood / First Surface) - 600 DPI-HS
    138  : 749,    //Vutek HS125 - White Only - 600 DPI-HS
    111 : 904,    //Vutek HS125 - CMYK + W + W (Flood / Second Surface) - 600 DPI-HS
    137 : 1038,  //Vutek HS125 - W + W Only (Spot / Second Surface) - 600 DPI-HS
    136  : 890,    //Inca Q40 - W + W + CMYK (Flood / First Surface)
    135 : 904,    //Vutek HS125 - W + W + CMYK (Spot / First Surface) - 600 DPI-HS
    134 : 615,    //Vutek HS125 - CMYK (Second Surface) - 600 DPI-HS
    104 : 587,  //Vutek HS125 - CMYK (First Surface) - 600 DPI-HS
    115 : 614,  //Vutek HS125 - CMYK + W + CMYK (Flood / Second Surface) - 600 DPI-HS
    114 : 614,  //Vutek HS125 - CMYK + W + CMYK (Spot / Second Surface) - 600 DPI-HS
    121 : 614,  //Vutek HS125 - CMYK + W + CMYK (Flood / First Surface) - 600 DPI-HS
    123 : 614,  //Vutek HS125 - CMYK + W + CMYK (Spot / First Surface) - 600 DPI-HS
    105 : 691,  //Vutek HS125 - Backlit - 600 DPI-HS
    107 : 612,  //Vutek HS125 - CMYK + W (Flood / Second Surface) - 600 DPI-HS
    106 : 612,  //Vutek HS125 - CMYK + W (Spot / Second Surface) - 600 DPI-HS
    109 : 612,  //Vutek HS125 - W + CMYK (Flood / First Surface) - 600 DPI-HS
    108 : 612,  //Vutek HS125 - W + CMYK (Spot / First Surface) - 600 DPI-HS
    110 : 904,  //Vutek HS125 - CMYK + W + W (Spot / Second Surface) - 600 DPI-HS
    113 : 904,  //Vutek HS125 - W + W + CMYK (Flood / First Surface) - 600 DPI-HS
    112 : 904   //Vutek HS125 - W + W + CMYK (Spot / First Surface) - 600 DPI-HS

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
    
    109  : 613,    //Vutek HS100 Q40 W + CMYK (First Surface)
    133 : 1039,   //Vutek HS125 - W + W Only (Flood / First Surface) - 1000 GS-LS
    136 : 1039,  //Vutek HS125 - W + W Only (Flood / First Surface) - 600 DPI-HS
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
    96 : 1039,    //Vutek HS100 - W + W Only (Spot / First Surface) - 1000 DPI_HS
    138  : 750,    //Vutek HS125 - White Only (Spot / First Surface) - 600 DPI-HS
    137 : 1040,    //Vutek HS125 - W + W Only (Spot / Second Surface) - 600 DPI-HS
    135 : 1039,    //Vutek HS100 - W + W Only (Spot / First Surface) - 1000 DPI_HS
    136 : 1040,    //Vutek HS100 - W + W + CMYK (Flood / First Surface) - 1000 DPI_HS
    134  : 613,    //Vutek HS100 CMYK + W (Second Surface)
    104  : 590,    //Vutek HS125 - CMYK (First Surface) - 600 DPI-HS
    107  : 613,    //Vutek HS125 - CMYK + W (Flood / Second Surface) - 600 DPI-HS
    121 : 1041,    //Vutek HS100 - CMYK + W + CMYK (Flood / First Surface) - 600 DPI_HS
    115 : 1041,    //Vutek HS100 - CMYK + W + CMYK (Flood / Second Surface) - 600 DPI_HS
    123 : 1041,    //Vutek HS100 - CMYK + W + CMYK (Spot / First Surface) - 600 DPI_HS
    114 : 1041,    //Vutek HS100 - CMYK + W + CMYK (Spot / Second Surface) - 600 DPI_HS
    106 : 613,    //Vutek HS100 - CMYK + W (Spot / Second Surface) - 600 DPI_HS
    111 : 1040,    //Vutek HS100 - CMYK + W + W (Flood / Second Surface) - 600 DPI_HS\
    110 : 1040,    //Vutek HS100 - CMYK + W + W (Spot / Second Surface) - 600 DPI_HS
    108 : 613,    //Vutek HS100 - W + CMYK (Spot / First Surface) - 600 DPI_HS
    113 : 1040,    //Vutek HS100 - W + W + CMYK (Flood / First Surface) - 600 DPI_HS
    112 : 1040,    //Vutek HS100 - W + W + CMYK (Spot / First Surface) - 600 DPI_HS
}

var zundLoadingSelections = {
    1  :  645,   //Speed Factor 1
    2  :  646,   //Speed Factor 2
    3  :  647,   //Speed Factor 3
    4  :  648,   //Speed Factor 4
    5  :  649,   //Speed Factor 5
    6  :  650    //Speed Factor 6
}
var zundUnloadingSelections = {
    1  :  606,   //Speed Factor 1
    2  :  607,   //Speed Factor 2
    3  :  608,   //Speed Factor 3
    4  :  609,   //Speed Factor 4
    5  :  610,   //Speed Factor 5
    6  :  611    //Speed Factor 6
}
var zundCuttingSelections = {
    1  :  593,   //Speed Factor 1
    2  :  594,   //Speed Factor 2
    3  :  595,   //Speed Factor 3
    4  :  596,   //Speed Factor 4
    5  :  597,   //Speed Factor 5
    6  :  598    //Speed Factor 6
}

var substratesForceCMYKBacklit = [
    '220',   //Backlit Film
    '193'   //Styrene - translucent
]
var smLaminatingOps = [
    '130',  //LF Back Laminating
    '131'   //LF Front Laminating
]
var sfPrePrintLamOps = [
    '129',   //LF Pre-Printing Front Laminate
    '144'    //LF Pre-Printing Back Laminate
]

var flutedSubstrateNames = [
    'Coroplast',
    'Flute'
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
var mountsWithClearAdhesive = [
    '795',    //Optix DA Digital Acrylic .118_48X96-3580
    '796',    //Optix DA Digital Acrylic .22_48X96-3582
    '1031'    //Acrylic Clear Cast .118_48X96-3635
]
var subsratesTypesWithClearAdhesive = [
    '185',   //Optix DA Digital Acrylic
    '283',  //Acrylic Clear Cast
    '261',  //Acrylic Clear Extruded
    '259',  //Acrylic DP95 Frosted 2 Sides
    '253',   //Acrylic P95 Frosted 1 Side
    '182',  //PETG
    '228',  //PETG Non-Glare
    '262'   //PETG Transilwrap
]
var planningOnlyOperations = [
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
    193,     //LF Bucket Job
    187,    //LF Gloss Mode
    202,     //LF MCT Cutting
    215     //LF Gutter
]
var estimstingOnlyOperations = [
    218    //TBG Team Factor (temporary)
]
var trainingOps = [

]
var opsWithOther = [
    129,
    130,
    131,
    144,
    139
]
var boardTypesThatCanHeatBend = [
    '173',   // Styrene
    '189',   // Styrene - white
    '190',   // Styrene - black
    '193',   // Styrene - translucent
    '182',   // PETG
    '228',   // PETG Non-Glare
    '262',   // PETG Transilwrap
    '183',   // Sintra Expanded PVC - white
    '197',   // Sintra Expanded PVC - black
    '231',   // Komatex Expanded PVC - White
    '232',   // Komatex Expanded PVC - Black
    '138',   // Acrylic - non TBG*
    '185',   // Optix DA Digital Acrylic
    '253',   // Acrylic P95 Frosted 1 Side
    '255',   // Acrylic - White 3015
    '259',   // Acrylic DP95 Frosted 2 Sides
    '261',   // Acrylic Clear Extruded
    '263',   // Acrylic Extruded
    '264',   // Acrylic Black Extruded
    '268',   // Acrylic Black Cast
    '278',   // Acrylic White Extruded
    '283'    // Acrylic Clear Cast
]
var boardWeightsThatCanHeatBend = [
    '63',   // 1MM
    '64',   // 2MM
    '65',   // 3MM
    '55',   // .015
    '56',   // .020
    '57',   // .030
    '58',   // .040
    '59',   // .060
    '60',   // .080
    '61',   // .125
    '62',   // .118
    '77',   // .065
    '77',   // .065
    '79'    // .010
]
var cutMethodId = {
    1079: 'noCut' , //No Cutting
    1080: 'zund' , //Cut
    1081: 'outsourceCut' , //Outsource Cut
    1082: 'outsourceDieCut' , //Outsource Die-Cut
    1083: 'zund' , //Zund Cut
    1084: 'guillotineCut' , //Guillotine Cut
    1156: 'fabCut'  //Fab to Cut
}
var getCriticalDeviceId = {
    1466 : 6,  //Vutek HS101
    1467 : 6,  //Vutek HS102
    1468 : 6,   //Vutek HS103
    1469 : 6,  //Vutek HS104
    1470 : 15,  //Inca X2-A
    1471 : 15,  //Inca X2-B
    1472 : 7,  //Inca Q40
    1468 : 22,  //Vutek HS125
    1469 : 22  //Vutek HS125
}

var pmPortal = (location.hostname.indexOf("tbghub.com") != -1);
var estimatingSite = (location.hostname.indexOf("estimating.collaterate.com") != -1);

var onQuoteUpdatedMessages = '';
var hardProofMessageCount = 0;
var mountingEstimateMessageCount = 0;
var allowHeatBend = true;

// Operation Item Keys object - in window for testing
var operationItemKeys = new Object();  

var cu = calcUtil;

var cutMethod;
//grab zund data from zundSpeedFactors_sheets
getZundData();

var boardCalcLogic = {
    onCalcLoaded: function(product) {
        //Change Paper headline
        $('#paper h3').text('Substrate');
        $('#additionalProductFields .additionalInformation div label:contains("Override")').parent().addClass('overrideDevice');
        $('.overrideDevice').hide();
        trimOperationItemName(opsWithSubIds,'_');
        addClassToOperation(planningOnlyOperations,'planning');
        addClassToOperation(estimstingOnlyOperations,'estimating');
        removeClassFromOp(170,'costingOnly');
        removeClassFromOp(205,'costingOnly');
        addOtherOpClass(opsWithOther);
        removeOperationItemsWithString(156,'Print');
        removeOperationItemsWithString(133,'Other');
    },
    onCalcChanged: function(updates, product) {
        if (cu.isPOD(product)) {
            //Change Ink to Full Color - Backlit if Backlit Film or translucent styrene is Selected
            if (cu.isValueInSet(fields.paperType, substratesForceCMYKBacklit)) {
                console.log('trigger backlit on loaded logic');
                if (cu.getValue(fields.printingS1) != 55) {
                    cu.changeField(fields.printingS1, 55, true);
                    
                }
                //No printing on back side
                if (cu.hasValue(fields.printingS2)) {
                    cu.changeField(fields.printingS2, '', true);
                    onQuoteUpdatedMessages += '<p>Backlit Film cannot be printed on the back side.</p>';
                    return
                }
            }
        }
    },
    onQuoteUpdated: function(updates, validation, product) {
        if (cu.isPOD(product)) {
         /*re-init on every update*/
            cu.initFields();
            //TEMP ADD IN FIELDS.CHOICE UNTIL CREATED IN CALCULATORUTILIES.JS
            addOperationChoiceProperties();

            var submessage = ''; 
            
            if (cu.isSmallFormat(product)) { 
                addClassToOperation(planningOnlyOperations,'planning');
                addClassToOperation(estimstingOnlyOperations,'estimating');
                addClassToOperation(trainingOps,'training');
                addOtherOpClass(opsWithOther);
                removeClassFromOp(170,'costingOnly');
                removeClassFromOp(205,'costingOnly');

                //Change Labels for Paper Type, Weight, Color
                cu.setLabel(fields.paperType,'Substrate');
                if (fields.pages) {
                    cu.setLabel(fields.pages,'Pieces per Set');
                }
                //CHange label of pages for Setrs
                cu.setLabel(fields.paperWeight,'Thickness');

                /**************** OPERATION ITEM KEYS */
                //Create object from key value pairs inserted into operation Item Description surrounded by double brackets "{{ }}"
                //var operationItemKeys = new Object();  
                for (const prop of Object.keys(operationItemKeys)) {
                  delete operationItemKeys[prop];
                }
                var quote = configureglobals.cquote.pjQuote || configureglobals.cquote.lpjQuote ? configureglobals.cquote.pjQuote || configureglobals.cquote.lpjQuote : null;
                if (quote) {
                    var ops = quote.operationQuotes;
                    var descriptions = [];
                    ops.forEach(function(operationQuote) {
                        var opItemDescription = operationQuote.data.choice.description;
                        descriptions.push(opItemDescription);
                        //var opItemKeyText = opItemDescription.replace(/(^.*{{|}}.*$)/g, '' );
                        var opItemKeyText = /\[(.*?)\]/.exec(opItemDescription);
                        if (opItemKeyText) {
                            var opItemObj = JSON.parse(opItemKeyText[1]);
                            //push to calc object
                            Object.keys(opItemObj).forEach(function(key) {
                                operationItemKeys[key] = opItemObj[key];
                            });
                        }
                    });
                }

                /********* Color Critical Check */
                var colorCriticalOp = fields.operation205;
                var colorCriticalDevice = fields.operation206;
                if (colorCriticalOp && colorCriticalDevice) {
                    var hasQtyError = false;
                    if (cu.hasValue(colorCriticalOp)) {
                        //Show special message if quantity of device not hit
                        if (calcValidation.hasErrorForField(validation, fields.quantity)) {
                            hasQtyError = true;
                        }
                        cu.showField(colorCriticalDevice);
                        cu.setLabel(colorCriticalOp,"Color Critical - please indicate job # below");
                        if (cu.hasValue(colorCriticalDevice)) {
                            if (configureglobals.cdevicemgr.autoDeviceSwitch) {
                                toggleAutoDeviceTypeButton();
                                $('select[name="DEVICEDD"]').trigger('focus').trigger('change');
                                return
                            }
                            var criticalDeviceId = getCriticalDeviceId[cu.getValue(colorCriticalDevice)] ? getCriticalDeviceId[cu.getValue(colorCriticalDevice)] : null;
                            if (criticalDeviceId && !hasQtyError) {
                                if (cu.getDeviceType() != criticalDeviceId) {
                                    setDevice(criticalDeviceId);
                                    return
                                }
                            }
                        }
                        if (hasQtyError) {
                            cu.alert('<p>The default settings for this device cannot run with these specifications. Resubmit the specs with your Color Critical requirements, but do not select a device. Instead, enter a press note with the device required</p>');
                        }

                    } else {
                        if (cu.hasValue(colorCriticalDevice)) {
                            cu.changeField(colorCriticalDevice,'',true);
                        }
                        cu.hideField(colorCriticalDevice);
                        cu.setSelectedOptionText(colorCriticalOp,'No');
                         {
                            if (!configureglobals.cdevicemgr.autoDeviceSwitch) {
                                toggleAutoDeviceTypeButton();
                            }
                        }
                    }
                }


                //STOP IF QALCULATOR NOT RETURNING QUOTE
                if (!configureglobals.cquote) { return; }
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
                if (SqInchIncreaserAnswer && SqInchDecreaserAnswer) {
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
                }
                    
                //Increase Operation Pieces to linear inch
                if (LinInchIncreaserAnswer && LinInchDecreaserAnswer) {
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
                }
                    
                //Increase Operation Pieces to Top Side Linear Inch
                var topLinInch = pieceWidth;
                topLinInch = parseInt(topLinInch);
                if (topInchIncreaserAnswer && topInchDecreaserAnswer) {
                    if (cu.getValue(topInchIncreaserAnswer) != topLinInch) {
                        cu.changeField(topInchIncreaserAnswer, topLinInch, true);
                        return
                    }
                    if (cu.getValue(topInchDecreaserAnswer) != topLinInch) {
                        cu.changeField(topInchDecreaserAnswer, topLinInch, true);
                        return
                    }
                } 
                    
                /********* Align Ink to Color in Operations */
                var sideOneInk = cu.getValue(fields.printingS1);
                var sideTwoInk = cu.getValue(fields.printingS2);
                var sideOneInkId = configureglobals.cquote.pjQuote.side1Ink.id;
                var sideTwoInkId = null;
                if (cu.hasValue(fields.printingS2)) {
                    sideTwoInkId = configureglobals.cquote.pjQuote.side2Ink.id;
                }
                var sideOneInkOp = fields.operation98;
                var sideTwoInkOp = fields.operation99;
                var shrinkOpTest = fields.operation143;  

                //Change Ink to Full Color - Backlit if Backlit Film or translucent styrene is Selected
                if (cu.isValueInSet(fields.paperType, substratesForceCMYKBacklit)) {
                    console.log('trigger backlit logic');
                    if (cu.getValue(fields.printingS1) != 55) {
                        cu.changeField(fields.printingS1, 55, true);
                        return
                    }
                    //No printing on back side
                    if (cu.hasValue(fields.printingS2)) {
                        cu.changeField(fields.printingS2, '', true);
                        onQuoteUpdatedMessages += '<p>Backlit Film cannot be printed on the back side.</p>';
                        return
                    }
                }
                //NEW
                if (sideOneInkId) {
                    var sideOneInkOpId = side1InkMap[sideOneInkId] ? side1InkMap[sideOneInkId] : null;
                    if (sideOneInkOpId) {
                        if (cu.getValue(sideOneInkOp) != sideOneInkOpId) {
                            cu.changeField(sideOneInkOp, sideOneInkOpId, true);
                            return
                        }
                    } else {
                        console.log('Side 1 ink operation not mapping for ink ' + sideOneInkId);
                    }
                }
                if (sideTwoInkOp) {
                    if (sideTwoInkId) {
                        var sideTwoInkOpId = side2InkMap[sideTwoInkId] ? side2InkMap[sideTwoInkId] : null;
                        if (sideTwoInkOpId) {
                            if (cu.getValue(sideTwoInkOp) != sideTwoInkOpId) {
                                cu.changeField(sideTwoInkOp, sideTwoInkOpId, true);
                            }
                        } else {
                            if (cu.hasValue(sideTwoInkOp)) {
                                cu.changeField(sideTwoInkOp,'', true);
                            }
                        }
                    } else {
                        if (cu.hasValue(sideTwoInkOp)) {
                            cu.changeField(sideTwoInkOp,'', true);
                        }
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
                    var zundLoadingFactor = zundLoadingSelections[speedFactor];
                    var zundUnloadingFactor = zundUnloadingSelections[speedFactor];
                    var zundCuttingFactor = zundCuttingSelections[speedFactor];

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
                    //if Fab Laser Cut is chosen, force Pre-mask 2 sides=
                    if (cu.getValue(fabCutOp) == 1162) {
                        if (cu.getValue(fields.operation133) != 761) {
                            cu.changeField(fields.operation133, 761, true);
                            onQuoteUpdatedMessages += '<p>Fab Laser Cut requires Premask on both sides.  This has been chosen on your behalf.</p>';
                        }
                    }
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
                /********* Disallow Edge Banding for incorrect sizes */
                var edgeBanding = fields.operation119;
                if (edgeBanding) {
                    //disable field unless 1/2" or 1" substrate selected
                    if (cu.getValue(fields.paperWeight) == 52 || cu.getValue(fields.paperWeight) == 53) {   
                        cu.enableField(edgeBanding);
                    }
                    else {
                        cu.disableField(edgeBanding);
                        cu.setSelectedOptionText(edgeBanding,'Must Select 1" or 1/2" Substrate');
                    }
                    if (cu.hasValue(edgeBanding)) {
                        // .5" options
                        if (cu.getValue(edgeBanding) == 692 || cu.getValue(edgeBanding) == 693) {
                            if (cu.getValue(fields.paperWeight) != 52) {
                                cu.changeField(edgeBanding, '', true);
                                onQuoteUpdatedMessages += '<p>1/2" Edgebanding requires a 1/2" substrate.  Please choose an appropriate substrate and then add Edgebanding.</p>';
                                return
                            }
                        }
                        // 1" options
                        if (cu.getValue(edgeBanding) == 694 || cu.getValue(edgeBanding) == 695) {
                            if (cu.getValue(fields.paperWeight) != 53) {
                                cu.changeField(edgeBanding, '', true);
                                onQuoteUpdatedMessages += '<p>1/2" Edgebanding requires a 1/2" substrate.  Please choose an appropriate substrate and then add Edgebanding.</p>';
                                return
                            }
                        }
                    }
                }
                /************************* ADD LAMINATING RUN 1 AND 2 FOR LAMINATING, MOUNTING, AND PREMASK */
                var frontLamOp = fields.operation131;
                var backLamOp = fields.operation130;
                var mountOp = fields.operation139;
                var premaskOp = fields.operation133;
                var hasFrontLam = cu.hasValue(frontLamOp);
                var hasBackLam = cu.hasValue(backLamOp);
                var hasMount = cu.hasValue(mountOp);
                var hasPremask = cu.hasValue(premaskOp);

                if (frontLamOp) {
                    var hasColdFront = fields.operation131.choice ? fields.operation131.choice.frontLamType == 'Cold' : false;
                    var hasHotFront = fields.operation131.choice ? fields.operation131.choice.frontLamType == 'Hot' : false;
                    var hasAdhesiveFront = fields.operation131.choice ? fields.operation131.choice.frontLamType == 'Adhesive' : false;
                }
                if (backLamOp) {
                    var hasColdBack = fields.operation130.choice ? fields.operation130.choice.backLamType == 'Cold' : false;
                    var hasHotBack = fields.operation130.choice ? fields.operation130.choice.backLamType == 'Hot' : false;
                    var hasAdhesiveBack = fields.operation130.choice ? fields.operation130.choice.backLamType == 'Adhesive' : false;
                }
                var laminatingRun = fields.operation135;
                var laminatingRun2 = fields.operation221;
                if (laminatingRun && laminatingRun2) {
                    setLamRunOperations();
                }
                /************************* ADD PRE- PRINTING LAMINATING SETUP FEE AND RUN WHEN FRONT AND/OR BACK LAM CHOSEN */
                var sfPreLaminating = cu.findOperationFromSet(sfPrePrintLamOps);
                if (cu.hasValue(sfPreLaminating)) {
                    if (!cu.hasValue(fields.operation151)) {
                        cu.changeField(fields.operation151, 898, true);
                        return
                    }
                } else {
                    if (cu.hasValue(fields.operation151)) {
                        cu.changeField(fields.operation151, '', true);
                        return
                    }
                }
                /************************* HIDE OPERATION QUESTION */
                if (cu.hasValue(fields.operation133)) {
                    hideOperationQuestion('133');
                }

                /************************* SHOW HARD PROOF MESSAGE ON THROUGHPUT THRESHOLDS */
                if (pmPortal) {
                    var boardThroughput = cu.getTotalPressSheets();
                    var proofOp = fields.proof;
                    var proofSelection = cu.getValue(proofOp);
                    if (boardThroughput >= 20) {
                        if (hardProofMessageCount == 0) {
                            if (proofSelection != 40 && proofSelection != 43) {
                                onQuoteUpdatedMessages += '<p>Jobs with a throughput of 20 boards require to have a hard proof. We have changed the proofing option on your behalf.  Please remove if it is not required by your customer.</p>';
                                hardProofMessageCount = 1;
                                cu.changeField(proofOp, 40, true);
                                return
                            }
                        } 
                    }
                }
                /********* Show Flute/Grain Direction operation when Fluted substrate selected */
                var fluteDirectionOp = fields.operation152;
                if (fluteDirectionOp) {
                    var substrateName = $('#pressSheetType select[name="PRESSSHEETTYPEDD"] option:selected').text();
                    var hasFlutes = false;
                    for (names in flutedSubstrateNames) {
                        if (substrateName.indexOf(flutedSubstrateNames[names]) != -1) {
                            hasFlutes = true;
                        }
                    }
                    if (hasFlutes) {
                        cu.showField(fluteDirectionOp);
                        fluteDirectionOp.css('color','red');
                    } else {
                        cu.hideField(fluteDirectionOp);
                        if (cu.hasValue(fluteDirectionOp)) {
                            
                            cu.changeField(fluteDirectionOp,'',true);
                        }
                    }
                }

                /********* HEAT BENDING RULES */
                var heatBendingOp = fields.operation159;
                if (heatBendingOp) {
                    //Do not allwow with Post printing lam and mounting operations
                    //var previousAllowHeatBend = allowHeatBend;
                    var allowHeatBend = true;
                    var heatBendMessage = '';
                    //Do not allow with Lam or Mounting
                    var hasNonHeatBendOpSelected = false;
                    checkForNonHeatBendingOps([
                            fields.operation130,  //LF Back Laminating
                            fields.operation131,  //LF Front Laminating
                            fields.operation135   //LF Mounting
                        ]);
                    //only approved materials
                    if (!cu.isValueInSet(fields.paperType, boardTypesThatCanHeatBend)) {
                        allowHeatBend = false; 
                        heatBendMessage += '<p>The substrate selected is not able to Heat Bend.</p>';
                    }
                    //Cannot exceed 100 finished pieces.
                    if (cu.getTotalQuantity() > 100) {
                        allowHeatBend = false; 
                        heatBendMessage += '<p>Heat Bending is not allowed on quantities over 100 finishing pieces.</p>';
                    }
                    //Neither size dimension can exceed 40"
                    if (cu.getWidth() > 40 || cu.getHeight() > 40) {
                        allowHeatBend = false; 
                        heatBendMessage += '<p>Heat bending is not available for pieces with one edge longer than 40".</p>';
                    }
                    //must be .125 (3MM) or thinner boardWeightsThatCanHeatBend
                    if (!cu.isValueInSet(fields.paperWeight, boardWeightsThatCanHeatBend)) {
                        allowHeatBend = false; 
                        heatBendMessage += '<p>The substrate weight selected is not able to Heat Bend.</p>';
                    }

                    if (cu.hasValue(heatBendingOp)) {
                        if (!allowHeatBend) {
                            //onQuoteUpdatedMessages += heatBendMessage;
                            cu.alert(heatBendMessage);
                            cu.changeField(heatBendingOp,'',true);
                        }
                        if (cu.isLastChangedField(updates, heatBendingOp)) {
                            onQuoteUpdatedMessages += '<p>Because you selected the Heat Bending option you are required to provide art describing the piece and where the bend(s) goes. If you have any questions about this please speak to your training supervisor.</p>';
                        }
                        
                    }
                    if (allowHeatBend) {
                        cu.showField(heatBendingOp);
                    } else {
                        cu.hideField(heatBendingOp);
                    }
                }
                function checkForNonHeatBendingOps(fields) {
                    for (var i = 0; i < fields.length; i++) {
                        if (cu.hasValue(fields[i])) {
                            allowHeatBend = false; 
                            heatBendMessage += '<p>Heat Bending is not allowed with Laminating or Mounting</p>';
                        }
                    }
                    return 
                }
                /********* ADD SIDE 2 SETUP COST WHEN 2 SIDED CHOSEN */
                var sideTwoSetupOp = fields.operation210;
                if (sideTwoSetupOp) {
                    if (cu.hasValue(fields.printingS2)) {
                        if (!cu.hasValue(sideTwoSetupOp)) {
                            cu.changeField(sideTwoSetupOp, 1498, true);
                            return
                        }
                    } else {
                        if (cu.hasValue(sideTwoSetupOp)) {
                            cu.changeField(sideTwoSetupOp, '', true);
                            return
                        }
                    }
                }

                /********* Display Run Time information on Estimating Site for LF Board Estimating */
                $('#runTime span').text(cu.getTotalRuntime());
                $('#totalPressSheets span').text(cu.getTotalPressSheets());
                var piecesOnSheet = (cu.getTotalQuantity() / cu.getTotalPressSheets());
                piecesOnSheet = Math.ceil(piecesOnSheet);
                $('#piecesOnSheet span').text(piecesOnSheet);
                $('#smallFormatPrintSpecs').insertAfter('.quoteContinue');
                $('#smallFormatPrintSpecs').show();
                $('#pressSheetName span').text(cu.getPressSheetName()); 

                /******** If device overridden fill out meta field */
                var overrideDev = configureglobals.cdevicemgr.autoTypeSwitch;
                if (!overrideDev) {
                    $('.overrideDevice input').val('Device Overridden');
                } else {
                    $('.overrideDevice input').val('');
                }

                trimOperationItemName(opsWithSubIds,'_');
                removeOperationItemsWithString(156,'Print');
                removeOperationItemsWithString(133,'Other');

                /******************* TEAM MARKUP OPERATIONS */
                var estJobCostInc = fields.operation216;
                var estJobCostDec = fields.operation217;
                var teamMarkupOp = fields.operation218;
                if (estJobCostInc && estJobCostDec && teamMarkupOp) {
                //temp disable until device switch looping issue is resolved with fullQuoteMode
                /*
                    var markup = quote.markupPercent;
                    var teamPrice = getTeamPrice();
                    var estJobCost = ((quote.jobCostPrice + quote.operationsPrice - teamPrice) * 100) / quantity;
                    var estJobCostFactor = parseInt(estJobCost / (1 + quote.markupPercent));
                    var estJobCostIncAnswer = fields.operation216_answer;
                    var estJobCostDecAnswer = fields.operation217_answer;
                    if (cu.getValue(estJobCostIncAnswer) != estJobCostFactor) {
                        cu.changeField(estJobCostIncAnswer, estJobCostFactor, true);
                        return
                    }
                    if (cu.getValue(estJobCostDecAnswer) != estJobCostFactor) {
                        cu.changeField(estJobCostDecAnswer, estJobCostFactor, true);
                        return
                    }
                    console.log('estJobCost  = ' + estJobCost + ' estJobCostFacto = ' + estJobCostFactor);
                    */
                } 

                function getTeamPrice() {
                    var operationQuotes = quote.operationQuotes;
                    for (var i = 0; i < operationQuotes.length; i++) {
                        if (operationQuotes[i].data.heading == "TBG Team") {
                            return operationQuotes[i].price
                        }
                    }
                }

                renderExtendedCostBreakdown();

                showMessages();
            }  // END SMALL FORMAT      
        }
        /**********************
            functions called in onQuoteUpdated
        ****************/
        function setLamRunOperations() {
            if (hasMount || hasFrontLam || hasBackLam || hasPremask) {
                if (hasMount) {
                    if (hasPremask) {
                        if (!hasFrontLam && !hasBackLam) { // 1. Premask / Adhesive  2. Mount
                            validateValue(laminatingRun, 1600);
                            validateValue(laminatingRun2, 1604);
                        } else if (hasHotFront) { //  1. Hot / Adhesive  2. Mount + Premask
                            validateValue(laminatingRun, 1598);
                            validateValue(laminatingRun2, 1605);
                        } else if (hasColdFront) { //  1. Cold / Adhesive  2. Mount + Premask
                            validateValue(laminatingRun, 1597);
                            validateValue(laminatingRun2, 1605);
                        } else { // 1. Premask / Adhesive  2. Mount  --CATCH ALL UNFORESEEN
                            validateValue(laminatingRun, 1600);
                            validateValue(laminatingRun2, 1604);
                        } 
                    } else {  //mounted but no premask
                       if (!hasFrontLam && !hasBackLam) { // 1. Adhesive  2. Mount
                            validateValue(laminatingRun, 1595);
                            validateValue(laminatingRun2, 1604);
                        } else if (hasHotFront) { //  1. Hot / Adhesive  2. Mount
                            validateValue(laminatingRun, 1598);
                            validateValue(laminatingRun2, 1604);
                        } else if (hasColdFront) { //  1. Cold / Adhesive  2. Mount
                            validateValue(laminatingRun, 1597);
                            validateValue(laminatingRun2, 1604);
                        } else if (hasAdhesiveFront || hasAdhesiveFront) { // 1. Adhesive  2. Mount
                            validateValue(laminatingRun, 1597);
                            validateValue(laminatingRun2, 1604);
                        } else { // 1. Adhesive  2. Mount  --CATCH ALL UNFORESEEN
                            validateValue(laminatingRun, 1595);
                            validateValue(laminatingRun2, 1604);
                        }
                    }
                } else {  //everything not mounted
                    if (hasPremask) {
                        if (hasHotFront) {
                            if (hasAdhesiveBack) { // 1. Hot / Adhesive 2. Premask
                                validateValue(laminatingRun, 1598);
                                validateValue(laminatingRun2,1606);
                            } else if (hasHotBack) { // 1. Hot / Hot 2. Premask
                                validateValue(laminatingRun, 1529);
                                validateValue(laminatingRun2,1606);
                            } else { // 1. Hot / Hot 2. Premask
                                validateValue(laminatingRun, 1529);
                                validateValue(laminatingRun2,1606);
                            }
                        } else if (hasColdFront) {
                            if (hasColdBack) {  // 1. Cold  2. Premask
                                validateValue(laminatingRun, 777);
                                validateValue(laminatingRun2,1606);
                            } else if (hasAdhesiveBack) { // 1. Cold / Adhesive 2. Premask
                                validateValue(laminatingRun, 1597);
                                validateValue(laminatingRun2,1606);
                            } else { // 1. Cold  2. Pre-mask
                                validateValue(laminatingRun, 777);
                                validateValue(laminatingRun2,1606);
                            }
                        } else if (hasAdhesiveBack || hasAdhesiveFront) { // 1. Adhesive  2. Premask
                            validateValue(laminatingRun, 1595);
                            validateValue(laminatingRun2,1606);
                        } else { // 1. Premask
                            validateValue(laminatingRun, 1601);
                            validateValue(laminatingRun2,'');
                        }
                    } else {  // no mount, no premask
                        if (hasHotFront) {
                            if (hasHotBack) { // 1. Hot / Hot
                                validateValue(laminatingRun, 1529);
                                validateValue(laminatingRun2,'');
                            } else if (hasAdhesiveBack) {  // 1. Hot / Adhesive
                                validateValue(laminatingRun, 1598);
                                validateValue(laminatingRun2,'');
                            } else { // WARNING
                                validateValue(laminatingRun, '');
                                validateValue(laminatingRun2,'');
                                message += '<p> Must have a Hot Lam, Adhesive, or Mount on back side</p>';
                            }
                        } else if (hasColdFront) {
                            if (hasColdBack) {  // 1. Cold  2. Cold
                                validateValue(laminatingRun, 777);
                                validateValue(laminatingRun2, 1602); 
                            } else if (hasAdhesiveBack) { // 1. Adhesive
                                validateValue(laminatingRun, 1595);
                                validateValue(laminatingRun2,'');
                            } else {  // 1. Cold
                                validateValue(laminatingRun, 777);
                                validateValue(laminatingRun2, ''); 
                            }
                        } else if (hasAdhesiveBack || hasAdhesiveFront) { // 1. Adhesive
                            validateValue(laminatingRun, 1595);
                            validateValue(laminatingRun2,'');
                        }
                    }
                }
            } else {
                validateValue(laminatingRun,'');
                validateValue(laminatingRun2,'');
            }
        }
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

/******* remove size and substrate ID from operation items.  Searches for "_" in label */
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
function addClassToOperation(opList, className) {
    if (!(Array.isArray(opList))) {
        opList = [opList];
    }
    for (var i = 0; i < opList.length; i++) {
        $('#operation' + opList[i]).addClass(className);
    }
}
function removeClassFromOp(opList, className) {
    if (!(Array.isArray(opList))) {
        opList = [opList];
    }
    for (var i = 0; i < opList.length; i++) {
        $('#operation' + opList[i] + '').each(function() {
            $(this).removeClass('' + className + '');
        });
    }
}
function addOtherOpClass(opList) {
    for (var i = 0; i < opList.length; i++) {
        $('#operation' + opList[i]).addClass('otherOp');
        $('select#operation' + opList[i] + ' option').each(function() {
            if ($(this).text().indexOf('Other') != -1) {
                $(this).addClass('otherOpItem');
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
function hideOperationQuestion(operation) {
    var op = operation.toString();
    var opQuestion = $('#operation' + op + ' div.op');
    if (opQuestion) {
        opQuestion.hide()
    } else {
        console.log('operation question does not exist for ' + operation);
    }
    return
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
function getOperationsSet(ops) {
    if (ops) {
        var set = [];
        for (var i = 0; i < ops.length; i++) {
            var op = 'operation' + ops[i];
            set.push(fields[op]);
        }
        return set
    } else {
        console.log('no ops defined in set');
        return false
    }
}
function operationInSetHasValue(operationSet) {
    if (operationSet) {
        for (var i = 0; i < operationSet.length; i++) {
            if (hasValue(operationSet[i].val())) {
                return true
            }
        }
        //if make it through return false 
        return false;
     } else {
        console.log('OperationSet is not defined. Returning false for operationInSetHasValue.');
        return false;
    }
}
//simplifies changing values of operation items
function validateValue(field, value) {
    if (field) {
        if (cu.getValue(field) != value) {
            cu.changeField(field, value, true);
        }
    }
}

//TEMP UNTIL BUILT INTO CALCULATOR UTILITIES
function addOperationChoiceProperties() {
    /*  loop through all items in Fields, 
        check for a Operation field
        If selection made pull out any json in description or notes
    */
    if (fields) {
        var opsList = configureglobals.coperationsmgr.operations; //both calculators?
        for (prop in fields) {
            if (prop.indexOf('operation') != 1) {
                if (prop.value != "") {
                    fields[prop]['choice'] = {};
                    var opId = prop.replace(/(operation)/,'');
                    //loop through operations in configure global operations manager
                    for (var j = 0; j < opsList.length; j++) {
                        if (opsList[j].pjcOperation.operation.id == opId) {
                            var desc = opsList[j].choice ? opsList[j].choice.description : null;
                            //Json properties must be wrapped in "[{ }]"
                            var jsonBlock = /\{(.*?)\}/.exec(desc);
                            if (jsonBlock) {
                                var jsonStr = this.getJsonFromString(jsonBlock[0]);
                                for (property in jsonStr) {
                                    fields[prop].choice[property] = jsonStr[property];
                                }
                            }
                            break
                        }
                    }
                }
            }
        }
    } else {
        console.log('field not defined')
    }
}
function getJsonFromString (str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return false;
    }
}

configureEvents.registerOnCalcLoadedListener(boardCalcLogic);
configureEvents.registerOnCalcChangedListener(boardCalcLogic);
configureEvents.registerOnQuoteUpdatedListener(boardCalcLogic);


var cu = calcUtil;
var pu = pmCalcUtil;

var onQuoteUpdatedMessages = '';
var disableCheckoutReasons = [];

var bucketCalcLogic = {
    onCalcLoaded: function(product) {
        //run meta field action
       cu.initFields();
       metaFieldsActions.onCalcLoaded(product);
        if (cu.isSmallFormat(product)) {
            uiUpdatesSF();
        } else {
            uiUpdatesLF();
        }

    },
    onCalcChanged: function(updates, product) {
    },
    onQuoteUpdated: function(updates, validation, product) {
        /*re-init on every update*/
        cu.initFields();
        var message = '';
        var submessage = '';

        if (cu.isPOD(product)) {
            //STOP IF CALCULATOR NOT RETURNING QUOTE
            if (!configureglobals.cquote) { return; }
            if (!configureglobals.cquote.success) { return; }

            shipDateRestrictions();

            if (cu.isSmallFormat(product)) {
                var quote = configureglobals.cquote.pjQuote;
                if (!quote) { return; }
                var changeEventTriggered = bucketCalcLogic.onQuoteUpdated_POD_SmallFormat(updates, validation, product, quote);
            } else {
                var quote = configureglobals.cquote.lpjQuote;
                if (!quote) { return; }
                var changeEventTriggered = bucketCalcLogic.onQuoteUpdated_POD_LargeFormat(updates, validation, product, quote);
            }
        }
    },
    onQuoteUpdated_POD_SmallFormat: function(updates, validation, product, quote) {
        var changeEventTriggered = false;
        setTopAndBottomPieceOps();
        setInkConsumptionOps();
        setCuttingOperations(quote);
        sizeLimitation(product);
        uiUpdatesSF();
    },
    onQuoteUpdated_POD_LargeFormat: function(updates, validation, product, quote) {
        var changeEventTriggered = false;

        setCuttingOps(quote, product);
        sizeLimitation(product);
        side2Ink(product);
        uiUpdatesLF();
        requireLam(product);

    }
}

function shipDateRestrictions() {
    //Ship Date restriction 
    $('.shipDate').removeClass('date');
    $('.shipDate input').removeClass('hasDatepicker');
    $('.shipDate input').unbind();
    $('.shipDate input').datepicker({
        showAnim: "fold",
        beforeShowDay: $.datepicker.noWeekends,  // disable weekends
        minDate : isNowBeforeCSTCutoffTime(13,15) ? 1 : 2 // if before 1:15, 1, if after 1:15 then 2
    });
}

function uiUpdatesSF() {
    addClassesSF();
    trimOptionsSF();
    shipDateRestrictions();
    setLabels();
    pu.showMessages();
}
function uiUpdatesLF() {
    addClassesLF();
    trimOptionsLF();
    pu.showMessages();
}

function setLabels() {
    cu.setLabel(fields.paperType,'Substrate');
    cu.setLabel(fields.pages,'Pieces per Set');
    //CHange label of pages for Setrs
    cu.setLabel(fields.paperWeight,'Thickness');
}
function addClassesSF() {
    var planningOnlyOps = [
        55,   //
        125,   //LF Bucket Job
        281     //Ship in a Set
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

    pu.addClassToOperation(planningOnlyOps,'planning');
    pu.addClassToOperation(sfPlanningOnlyOperations,'planning');
}
function addClassesLF() {
    var planningOnlyOps = [
        55,   //
        125   //LF Bucket Job
    ]
    pu.addClassToOperation(planningOnlyOps,'planning');
}
function trimOptionsSF() {
    var lfOpsToTrimWithUnderscore = [
        67,  //Pre-Printing Front Laminate
        84,  //Pre-Printing Back Laminate
        58,   //TBG Tape, Mag, Velcro
        78  //LF Premask
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
    pu.trimOperationItemNames(lfOpsToTrimWithUnderscore, '_');
    pu.trimOperationItemNames(opsWithSubIds,'_');
}
function trimOptionsLF() {
    var lfOpsToTrimWithUnderscore = [
        67,  //Pre-Printing Front Laminate
        84,  //Pre-Printing Back Laminate
        58,   //TBG Tape, Mag, Velcro
        78  //LF Premask
    ]
    pu.trimOperationItemNames(lfOpsToTrimWithUnderscore, '_');
}

/**** CUTTING */
function setCuttingOps(quote, product) {
    var cutMethod = 'zund';
    setZundOps(quote, cutMethod);
}

function setZundOps(quote, cutMethod) {
    var zundFactors = {
        "K1" : {"name" : "Knife 1", "loadingOpItem" : 202, "unloadingOpItem" : 201 , "runOpItem": 195, "intCutOpItem": 773, "rank" : 1},
        "K2" : {"name" : "Knife 2", "loadingOpItem" : 202, "unloadingOpItem" : 201 , "runOpItem": 196, "intCutOpItem": 774, "rank" : 2},
        "R1" : {"name" : "Router 1", "loadingOpItem" : 204, "unloadingOpItem" : 201 , "runOpItem": 197, "intCutOpItem": 775, "rank" : 3},
        "R2" : {"name" : "Router 2", "loadingOpItem" : 204, "unloadingOpItem" : 201 , "runOpItem": 198, "intCutOpItem": 776, "rank" : 4},
        "R3" : {"name" : "Router 3", "loadingOpItem" : 204, "unloadingOpItem" : 201 , "runOpItem": 199, "intCutOpItem": 777, "rank" : 5},
        "R4" : {"name" : "Router 4", "loadingOpItem" : 204, "unloadingOpItem" : 201 , "runOpItem": 200, "intCutOpItem": 778, "rank" : 6}
    }

    var zundLoading = fields.operation53;
    var zundCutting = fields.operation55;
    var zundUnloading = fields.operation56;

    var zundChoice = getZundChoice(quote, zundFactors);

    if (cutMethod == 'zund') {
        if (zundLoading) {
            pu.validateValue(zundLoading, zundChoice.loadingOpItem);
        }
        if (zundCutting) {
            pu.validateValue(zundCutting, zundChoice.runOpItem);
        }
        if (zundUnloading) {
            pu.validateValue(zundUnloading,zundChoice.unloadingOpItem);
        }
    } else {
        pu.validateValue(zundLoading,'');
        pu.validateValue(zundCutting,'');
        pu.validateValue(zundUnloading,'');
        pu.validateValue(fields.operation179,'');
    }
    //Interior cut operations soon to be re-org
    //setZundInCutOp(cutMethod, zundChoice);
}
function getZundChoice(quote, zundFactors) {
    //check print substrate A and Mount for highest ranked factor
    var printSubFactor = getMaterialZundFactor(zundFactors, quote, 'aPrintSubstrate');
    var mountSubFactor = getMaterialZundFactor(zundFactors, quote, 'mountSubstrate');
    var result = getMaxZundRank(zundFactors, zundFactors.K1, printSubFactor, mountSubFactor);
    return result
}
function getMaterialZundFactor(zundFactors, quote, substrate) {
    var result;
    var mat = quote.piece[substrate];
    if (mat) {
        if (mat.zundFactor) {
            result = zundFactors[mat.zundFactor];
        }
    }
    return result
}
function getMaxZundRank(zundFactors, defaultFactor, printSubFactor, mountSubFactor) {
    var result = defaultFactor;
    if (printSubFactor) {
        if (printSubFactor.rank > result.rank) {
            result = printSubFactor;
        }
    }
    if (mountSubFactor) {
        if (mountSubFactor.rank > result.rank) {
            result = mountSubFactor;
        }
    }
    return result
}

function side2Ink(product) {
    //Disable side 2 ink for SCHEDULED ECOMEDIA PRINTING
    if (cu.getPjcId(product) == 499) {
        var side2inkOp = fields.operation137;
        if (cu.getValue(fields.sides) == '2') {
            if (!cu.hasValue(side2inkOp)) {
                cu.enableField(side2inkOp);
                cu.changeField(side2inkOp,641, true);
            }
        } else {
            pu.validateValue(side2inkOp,'');
            cu.disableField(side2inkOp);
            cu.setSelectedOptionText(fields.operation137,'Must Select 2 Sides');
        }
    }
}

function requireLam(product) {
    //Require front or back lam on SCHEDULED ECOMEDIA PRINTING
    if (cu.getPjcId(product) == 499) {
        if (!cu.hasValue(fields.frontLaminate) && !cu.hasValue(fields.backLaminate)) {
            onQuoteUpdatedMessages += '<p>This product requires Laminate on either front or back.  Back Lam has been set on your behalf.</p>';
            cu.changeField(fields.backLaminate, 49, true);
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

function setInkConsumptionOps() {
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
        141 : 837,    //Inca X2 CMYK
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
        138  : 749,    //Vutek HS125 - White Only (Spot / First Surface)
        142  : 749,    //Vutek HS125 - White Only (Spot / Second Surface)
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
    var substratesForceCMYKBacklit = [
        '220',   //Backlit Film
        '193'   //Styrene - translucent
    ]
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
        pu.validateValue(fields.printingS1, 55, true);
        //No printing on back side
        if (cu.hasValue(fields.printingS2)) {
            cu.changeField(fields.printingS2, '', true);
            onQuoteUpdatedMessages += '<p>Backlit Film cannot be printed on the back side.</p>';
        }
    }

    if (sideOneInkId) {
        var sideOneInkOpId = side1InkMap[sideOneInkId] ? side1InkMap[sideOneInkId] : null;
        if (sideOneInkOpId) {
            if (cu.getValue(sideOneInkOp) != sideOneInkOpId) {
                cu.changeField(sideOneInkOp, sideOneInkOpId, true);
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
}

function setCuttingOperations(quote) {
    /********* CUTTING LOGIC */
    var zundFactors = {
        "K1" : {"name" : "Knife 1", "loadingOpItem" : 645, "unloadingOpItem" : 606 , "runOpItem": 593, "intCutOpItem": 773, "rank" : 1},
        "K2" : {"name" : "Knife 2", "loadingOpItem" : 645, "unloadingOpItem" : 606 , "runOpItem": 594, "intCutOpItem": 774, "rank" : 2},
        "R1" : {"name" : "Router 1", "loadingOpItem" : 646, "unloadingOpItem" : 606 , "runOpItem": 595, "intCutOpItem": 775, "rank" : 3},
        "R2" : {"name" : "Router 2", "loadingOpItem" : 646, "unloadingOpItem" : 606 , "runOpItem": 596, "intCutOpItem": 776, "rank" : 4},
        "R3" : {"name" : "Router 3", "loadingOpItem" : 646, "unloadingOpItem" : 606 , "runOpItem": 597, "intCutOpItem": 777, "rank" : 5},
        "R4" : {"name" : "Router 4", "loadingOpItem" : 646, "unloadingOpItem" : 606 , "runOpItem": 598, "intCutOpItem": 778, "rank" : 6}
    }
    var cutMethodId = {
        1079: 'noCut' , //No Cutting
        1080: 'zund' , //Cut
        1081: 'outsourceCut' , //Outsource Cut
        1082: 'outsourceDieCut' , //Outsource Die-Cut
        1083: 'zund' , //Zund Cut
        1084: 'guillotineCut' , //Guillotine Cut
        1156: 'fabCut'  //Fab to Cut
    }
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
        //default zundFactor to K1, and check materials for largest index
        var zundChoice = zundFactors.K1;
        //check print substrate A and Mount for highest ranked factor
        if (quote.pressSheetQuote.pressSheet.zundFactor) {
            zundChoice = zundFactors[quote.pressSheetQuote.pressSheet.zundFactor];
        }
        pu.validateValue(zundLoadingOp, zundChoice.loadingOpItem);
        pu.validateValue(zundUnloadingOp, zundChoice.unloadingOpItem);
        pu.validateValue(zundCuttingOp, zundChoice.runOpItem)

    } else {
        pu.validateValue(zundLoadingOp,'');
        pu.validateValue(zundCuttingOp,'');
        pu.validateValue(zundUnloadingOp,'');
    }
    //no cutting -- ENTER IN NO CUT FOR noCut AND fabCut
    if (cutMethod == 'noCut') {
        pu.validateValue(noCutOp, 1076);
    } else {
        pu.validateValue(noCutOp,'');
    }
    //Fab cut
    if (cutMethod == 'fabCut') {
        if (!cu.hasValue(fabCutOp)) {cu.changeField(fabCutOp, 1108, true); }
        pu.removeClassFromOperation(174, 'planning');
        //if Fab Laser Cut is chosen, force Pre-mask 2 sides=
        if (cu.getValue(fabCutOp) == 1162) {
            if (cu.getValue(fields.operation133) != 761) {
                cu.changeField(fields.operation133, 761, true);
                onQuoteUpdatedMessages += '<p>Fab Laser Cut requires Premask on both sides.  This has been chosen on your behalf.</p>';
            }
        }
    } else {
        pu.validateValue(fabCutOp,'');
    }
    //outsourced
    if (cutMethod == 'outsourceCut' || cutMethod == 'outsourceDieCut') {
        if (cutMethod == 'outsourceCut') {
            pu.validateValue(outsourceCutOp, 911);
        }
        if (cutMethod == 'outsourceDieCut') {
            pu.validateValue(outsourceCutOp, 1096);
            pu.validateValue(guillotineCutOp, 907);
        } else {
            pu.validateValue(guillotineCutOp, '');
        }
    } else {
        if (cu.getSelectedOptionText(outsourceCutOp).indexOf('Cut') != -1) {
            if (cu.hasValue(outsourceCutOp)) {
                cu.changeField(outsourceCutOp,'',true);
            }
        }
        pu.removeOperationItemsWithString(156,'Cut');
    }
}

function isNowBeforeCSTCutoffTime(hour24, minutes) {
  var localOffsetMs = new Date().getTimezoneOffset()*60*-1000;
  var localVsServerOffsetMs = localOffsetMs - SERVER_TZ_OFFSET_MS;
  var localTime = new Date();
  var localCutoffTime = (new Date(localTime.getFullYear(), localTime.getMonth(), localTime.getDate(), hour24, minutes, 0, 0));
  var localCutoffTime = new Date(localCutoffTime.getTime() + localVsServerOffsetMs);
  var returnVal = localTime.getTime() < localCutoffTime.getTime();
  return returnVal;
}

function sizeLimitation(product) {
    var pjcSizeMax = {
        495 : 30
    }
    var totalSquareFeet = (cu.getWidth() * cu.getHeight() * cu.getTotalQuantity())/144;
    if (isNaN(totalSquareFeet)) {
        console.log('cannot compute total Sq Ft size limitation');
        return
    }
    var maxSq = pjcSizeMax[cu.getPjcId(product)] ? pjcSizeMax[cu.getPjcId(product)] : 200;
    if (totalSquareFeet > maxSq) {
        bucketSizeMessage = '<p>The Bucket product is limited to jobs less than ' + maxSq + ' sq ft.  For jobs greater than this please use the Board Printing Product.</p>';
        onQuoteUpdatedMessages += bucketSizeMessage;
        disableCheckoutButton(bucketSizeMessage);
    } else {
        enableCheckoutButton();
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

configureEvents.registerOnCalcLoadedListener(bucketCalcLogic);
configureEvents.registerOnCalcChangedListener(bucketCalcLogic);
configureEvents.registerOnQuoteUpdatedListener(bucketCalcLogic);
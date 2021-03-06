var cu = calcUtil;
var pu = pmCalcUtil;


var bucketPjcs = [
    //for new pjcs, add into metafield actions bucketPjcs object as well
    '1306',   //*TBG Magnet Buckets
    '1757',    //* TBG Backlit Buckets_new
    '1762'    //*TBG Board Buckets-NEW
]

var calcCount = 0;

var onQuoteUpdatedMessages = '';

var disableCheckoutReasons = [];


var boardCalcLogic = {
    onCalcLoaded: function(product) {
        cu.initFields();
        updateUI(product);
        //run meta field action
        metaFieldsActions.onCalcLoaded(product);
        $('#additionalProductFields .additionalInformation div label:contains("Override")').parent().addClass('overrideDevice');
        $('.overrideDevice').hide();
        //run default team as last function on calcLoaded, will trigger update
        setDefaultTeam();
    },
    onCalcChanged: function(updates, product) {
        console.log('onCalcChanged Start');
        if (cu.isPOD(product)) {
        }
        console.log('onCalcChanged End');
    },
    onQuoteUpdated: function(updates, validation, product) {
        console.log('onQuoteUpdated Start');
        calcCount++;
        console.log('Calc count: ', calcCount);
        cu.initFields();

        if (cu.isPOD(product)) {
            //Run before quote validation
            boardCalcLogic.preValidation_POD_SmallFormat(updates, validation, product, quote);
            
            //STOP IF CALCULATOR NOT RETURNING QUOTE
            if (!configureglobals.cquote) { return; }
            if (!configureglobals.cquote.success) { return; }

            if (cu.isSmallFormat(product)) {
                var quote = configureglobals.cquote.pjQuote;
                if (!quote) { return; }
                var changeEventTriggered = boardCalcLogic.onQuoteUpdated_POD_SmallFormat(updates, validation, product, quote);
            } else {
                var quote = configureglobals.cquote.lpjQuote;
                if (!quote) { return; }
                var changeEventTriggered = boardCalcLogic.onQuoteUpdated_POD_LargeFormat(updates, validation, product, quote);
            }
        }
        console.log('onQuoteUpdated End');
    },
    preValidation_POD_SmallFormat: function(updates, validation, product, quote) {
        backlitInkValidation();
    },
    onQuoteUpdated_POD_SmallFormat: function(updates, validation, product, quote) {
        var changeEventTriggered = false;

        //Add properties to global objects from embedded meta 
        setConfigGlobalProperties(quote);

        //functions that can change price
        controller.enterFullQuoteMode();
        functionsRanInFullQuote(updates, validation, product, quote);
        console.log('POD_SF validation finished. Pending change:', controller.fieldChangeQuotePending);
        pu.showMessages();
        var requoteInProgress = controller.fieldChangeQuotePending;
        controller.exitFullQuoteMode();
        if (requoteInProgress) {
            return true;
        }

        //functions that need results back from full quote and UI updates
        changeEventTriggered = functionsRanAfterFullQuote(updates, validation, product, quote);
        console.log('POD_SF post-full-quote changes triggered:',changeEventTriggered);

        return changeEventTriggered;
    },
    onQuoteUpdated_POD_LargeFormat: function(updates, validation, product, quote) {
        var changeEventTriggered = false;

        return changeEventTriggered;
    }
}

function functionsRanInFullQuote(updates, validation, product, quote) {
    checkForColorCriticalDevice(validation, product, quote);
    setInkConsumptionOps(quote);
    setCuttingOperations(quote);
    edgeBandingLogic();
    setLamOps(quote);
    setFluteDirectionOp();
    heatBendingRules(updates);
    twoSidedJobOp();
    linearOperationItemAnswers();
    mountAdhesive();
    jobCostSpoilage(quote);
    colorWork();
    bucketPrinting(product);
    magnetPrintMode();
}

function functionsRanAfterFullQuote(updates, validation, product, quote) {
    var changeEventTriggered = setSpecialMarkupOps(quote);
    //changeEventTriggered = changeEventTriggered ? true : checkForHardProofRequired();  --check with steve about best way to run Fn's in fieldquote and why use changeEvent
    checkForHardProofRequired();
    if (changeEventTriggered) {
        return true;
    }
    updateUI(product);
    return false;
}

function backlitInkValidation() {
    var isBacklit = false;
    var substratesForceCMYKBacklit = [
        '220',   //Backlit Film
        '193'   //Styrene - translucent
    ]
    //Change Ink to Full Color - Backlit if Backlit Film or translucent styrene is Selected
    if (cu.isValueInSet(fields.paperType, substratesForceCMYKBacklit)) {
        isBacklit = true;
        pu.validateValue(fields.printingS1, 55);
        //No printing on back side
        if (cu.hasValue(fields.printingS2)) {
            cu.changeField(fields.printingS2, '', true);
            onQuoteUpdatedMessages += '<p>Backlit Film cannot be printed on the back side.</p>';
        }
    }
    return isBacklit
}

// Functions called in Full Quote
function setConfigGlobalProperties(quote) {
    addOperationChoiceProperties();
    pu.setCustomProperties(quote.pressSheetQuote.pressSheet,"description","customProperties");
}
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
                                var jsonStr = pu.getJsonFromString(jsonBlock[0]);
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

function checkForColorCriticalDevice(validation, product) {
    //If color cricital operation selected, toggle off Auto Device and select device
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
    var colorCriticalOp = fields.operation205;
    var colorCriticalDevice = fields.operation206;
    var selectedDeviceType = cu.getDeviceType();
    if (colorCriticalOp && colorCriticalDevice) {
        var hasQtyError = false;
        if (cu.hasValue(colorCriticalOp)) {
            cu.showField(colorCriticalDevice);
            cu.setLabel(colorCriticalOp,"Color Critical - please indicate job # below");
            if (cu.hasValue(colorCriticalDevice)) {
                var criticalDeviceId = getCriticalDeviceId[cu.getValue(colorCriticalDevice)] ? getCriticalDeviceId[cu.getValue(colorCriticalDevice)] : null;
                // only run if device types are different
                if (criticalDeviceId != selectedDeviceType) {
                    if (configureglobals.cdevicemgr.autoDeviceSwitch) {
                        toggleAutoDeviceTypeButton();
                        $('select[name="DEVICEDD"]').trigger('focus').trigger('change');
                    }
                    setDevice(criticalDeviceId);
                }
            } else {
                //require device selection 
                disableCheckoutReasons.push('Please Select Color Critical Device');
                colorCriticalDevice.css('color','red');
                cu.setSelectedOptionText(colorCriticalDevice,'Select Device...')
            }
        } else {
            if (cu.hasValue(colorCriticalDevice)) {
                var changeEventTriggered = cu.changeField(colorCriticalDevice,'',true);
                if (changeEventTriggered) {
                    return true;
                }
            }
            if (!configureglobals.cdevicemgr.autoDeviceSwitch) {
                toggleAutoDeviceTypeButton();
            }
            cu.hideField(colorCriticalDevice);
            cu.setSelectedOptionText(colorCriticalOp,'No');
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

function setInkConsumptionOps(quote) {
    //pull ink material properties embedded in description json and add as property
    pu.setCustomProperties(quote.side1Ink, "description", "customProperties");
    if (quote.side2Ink) {
        pu.setCustomProperties(quote.side2Ink, "description", "customProperties");
    }
    var side1InkMatId = pu.getCustomProperties(quote.side1Ink, ["customProperties", "side1InkMatItem"]);
    var side2InkMatId = pu.getCustomProperties(quote.side2Ink, ["customProperties", "side2InkMatItem"]);

    var side1InkMatOp = fields.operation98;
    var side2InkMatOp = fields.operation99;

    //side 1 ink material
    if (cu.hasValue(side1InkMatOp)) {
        if (side1InkMatId) {
            pu.validateValue(side1InkMatOp, side1InkMatId);
        } else {
            console.log('Side 1 ink operation not mapping for ink ' + side1InkMatId);
        }
    }
    //side 2
    if (cu.hasValue(fields.printingS2)) {
        if (side2InkMatId) {
            pu.validateValue(side2InkMatOp, side2InkMatId)
        } else {
            console.log('Side 2 ink operation not mapping for ink ' + side2InkMatId);
        }
    } else {
        pu.validateValue(side2InkMatOp, '');
    }
}

function setCuttingOperations(quote) {
    /********* CUTTING LOGIC */
    var userDeclareCutOp = fields.operation170;

    var zundFactors = {
        "K1" : {"name" : "Knife 1", "loadingOpItem" : 645, "unloadingOpItem" : 606 , "runOpItem": 593, "intCutOpItem": 773, "userChoiceItem" : 1970, "rank" : 1},
        "K2" : {"name" : "Knife 2", "loadingOpItem" : 645, "unloadingOpItem" : 606 , "runOpItem": 594, "intCutOpItem": 774, "userChoiceItem" : 1971, "rank" : 2},
        "R1" : {"name" : "Router 1", "loadingOpItem" : 646, "unloadingOpItem" : 606 , "runOpItem": 595, "intCutOpItem": 775, "userChoiceItem" : 1972, "rank" : 3},
        "R2" : {"name" : "Router 2", "loadingOpItem" : 646, "unloadingOpItem" : 606 , "runOpItem": 596, "intCutOpItem": 776, "userChoiceItem" : 1973, "rank" : 4},
        "R3" : {"name" : "Router 3", "loadingOpItem" : 646, "unloadingOpItem" : 606 , "runOpItem": 597, "intCutOpItem": 777, "userChoiceItem" : 1974, "rank" : 5},
        "R4" : {"name" : "Router 4", "loadingOpItem" : 646, "unloadingOpItem" : 606 , "runOpItem": 598, "intCutOpItem": 778, "userChoiceItem" : 1975, "rank" : 6}
    }
    var fabCutOptions = [
        1793,  //Fab CNC
        1794,  //Fab Laser
        1792   //Fab Saw
    ]
    var isFabCut = cu.isValueInSet(userDeclareCutOp, fabCutOptions);
    var isFabLaser = cu.getValue(userDeclareCutOp) == 1794;
    var fabCutOp = fields.operation174;

    var isZundCut = cu.getSelectedOptionText(userDeclareCutOp).indexOf('Zund') != -1;

    var altCutMethodId = {
        1079: 'noCut' , //No Cutting
        1081: 'outsourceCut' , //Outsource Cut
        1082: 'outsourceDieCut' //Outsource Die-Cut
    }

    var altCutMethod = altCutMethodId[cu.getValue(userDeclareCutOp)] ? altCutMethodId[cu.getValue(userDeclareCutOp)] : null;
    var setZundCost = altCutMethod ? false : true;

    var zundCuttingOp = fields.operation102;
    var zundLoadingOp = fields.operation104;
    var zundUnloadingOp = fields.operation105;
    var outsourceCutOp = fields.operation156;
    
    //default zundFactor to K1, and check materials for largest index
    var zundChoice = zundFactors.K1;
    //check print substrate A and Mount for highest ranked factor
    if (quote.pressSheetQuote.pressSheet.zundFactor) {
        zundChoice = zundFactors[quote.pressSheetQuote.pressSheet.zundFactor];
    }

    //zund Cutting
    if (setZundCost) {
        pu.validateValue(zundLoadingOp, zundChoice.loadingOpItem);
        pu.validateValue(zundUnloadingOp, zundChoice.unloadingOpItem);
        pu.validateValue(zundCuttingOp, zundChoice.runOpItem)

        validateZundOption();

    } else {
        pu.validateValue(zundLoadingOp,'');
        pu.validateValue(zundCuttingOp,'');
        pu.validateValue(zundUnloadingOp,'');
    }

    //Fab cut
    if (isFabCut) {
        pu.removeClassFromOperation(174, 'planning');
        //if Fab Laser Cut is chosen, force Pre-mask 2 sides=
        if (isFabLaser) {
            if (cu.getValue(fields.operation133) != 761) {
                cu.changeField(fields.operation133, 761, true);
                onQuoteUpdatedMessages += '<p>Fab Laser Cut requires Premask on both sides.  This has been chosen on your behalf.</p>';
            }
        }
    } else {
        pu.validateValue(fabCutOp,'');
    }

    //outsource
    if (altCutMethod) {
        if (altCutMethod == 'outsourceCut' || altCutMethod == 'outsourceDieCut') {
            if (altCutMethod == 'outsourceCut') {
                pu.validateValue(outsourceCutOp, 911);
            }
            if (altCutMethod == 'outsourceDieCut') {
                pu.validateValue(outsourceCutOp, 1096);
            }
        } else {
            if (cu.getSelectedOptionText(outsourceCutOp).indexOf('Cut') != -1) {
                if (cu.hasValue(outsourceCutOp)) {
                    cu.changeField(outsourceCutOp,'',true);
                }
            }
            pu.removeOperationItemsWithString(156,'Cut');
        }
    } else {
        if (cu.getSelectedOptionText(outsourceCutOp).indexOf('Cut') != -1) {
            if (cu.hasValue(outsourceCutOp)) {
                cu.changeField(outsourceCutOp,'',true);
            }
        }
        pu.removeOperationItemsWithString(156,'Cut');
    }
    hideInvalidZundOptions();

    function validateZundOption() {
        if (zundChoice) {
            if (isZundCut) {
                pu.validateValue(userDeclareCutOp, zundChoice.userChoiceItem);
            }
        }
    }
    function hideInvalidZundOptions() {
        pu.addClassToOperationItemsWithString(170,'hide','Zund');
        //show availabel zund option
        $('option[value="' + zundChoice.userChoiceItem + '"]').removeClass('hide');
        pu.trimOperationItemNames(170,'_');
    }
}

function edgeBandingLogic() {
    /********* Disallow Edge Banding for incorrect sizes */
    var edgeBanding = fields.operation119;
    var substrateTypesCannotEdgeBand = [
        '308',  //Eagle Cell - White/Kraft/White
        '279'   //Eagle Cell - White
    ]
    var weightsThatCanHeatBend = [
        '53',   //1"
        '52'    //.5"
    ]
    if (edgeBanding) {
        //disable field unless 1/2" or 1" substrate selected
        if (cu.isValueInSet(fields.paperWeight, weightsThatCanHeatBend) && !cu.isValueInSet(fields.paperType,substrateTypesCannotEdgeBand)) {   
            cu.enableField(edgeBanding);
        }
        else {
            cu.disableField(edgeBanding);
            pu.validateValue(edgeBanding,'');
            cu.setSelectedOptionText(edgeBanding,'Must Select 1" or 1/2" Substrate');
        }
        if (cu.hasValue(edgeBanding)) {
            // .5" options
            if (cu.getValue(edgeBanding) == 692 || cu.getValue(edgeBanding) == 693) {
                if (cu.getValue(fields.paperWeight) != 52) {
                    cu.changeField(edgeBanding, '', true);
                    onQuoteUpdatedMessages += '<p>1/2" Edgebanding requires a 1/2" substrate.  Please choose an appropriate substrate and then add Edgebanding.</p>';
                }
            }
            // 1" options
            if (cu.getValue(edgeBanding) == 694 || cu.getValue(edgeBanding) == 695) {
                if (cu.getValue(fields.paperWeight) != 53) {
                    cu.changeField(edgeBanding, '', true);
                    onQuoteUpdatedMessages += '<p>1" Edgebanding requires a 1" substrate.  Please choose an appropriate substrate and then add Edgebanding.</p>';
                }
            }
        }
    }
}

function setLamOps(quote) {
    /************************* ADD LAMINATING RUN 1 AND 2 FOR LAMINATING, MOUNTING, AND PREMASK */
    var frontLamOp = fields.operation131;
    var backLamOp = fields.operation130;
    var mountOp = fields.operation139;
    var premaskOp = fields.operation133;
    var hasFrontLam = cu.hasValue(frontLamOp);
    var hasBackLam = cu.hasValue(backLamOp);
    var hasMount = cu.hasValue(mountOp);
    var hasPremask = cu.hasValue(premaskOp);

    var sfPrePrintLamOps = [
        '129',   //LF Pre-Printing Front Laminate
        '144'    //LF Pre-Printing Back Laminate
    ]
    var sfPreLaminating = cu.findOperationFromSet(sfPrePrintLamOps);

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
    var laminatingRun3 = fields.operation227;
    var laminatingRun_answer = fields.operation135_answer;
    var laminatingRun2_answer = fields.operation221_answer;
    var laminatingRun3_answer = fields.operation227_answer;
    var lamRollChangeOp = fields.operation232;
    var lamRollChangeOpAnswer = fields.operation232_answer;

    var boardLength = quote.pressSheetQuote.height ? quote.pressSheetQuote.height : 120;
    var boardCount = quote.pressSheetQuote.pressSheetCount;
    var totalBoardLF = pu.roundTo(boardLength * boardCount / 12, 1);

    setPreLamRunCosts(sfPrePrintLamOps, totalBoardLF);
    setLamMatCosts(totalBoardLF);
    setLamRunOperations();

    function setLamRunOperations() {
        if (hasMount || hasFrontLam || hasBackLam || hasPremask) {
            if (hasMount) {
                if (hasPremask) {
                    if (!hasFrontLam && !hasBackLam) { // 1. Premask / Adhesive  2. Mount
                        pu.validateValue(laminatingRun, 1600);
                        pu.validateValue(laminatingRun2, 1604);
                        pu.validateValue(laminatingRun3, '');
                    } else if (hasHotFront) { //  1. Hot / Adhesive  2. Mount + Premask
                        pu.validateValue(laminatingRun, 1598);
                        pu.validateValue(laminatingRun2, 1605);
                        pu.validateValue(laminatingRun3, '');
                    } else if (hasColdFront) { //  1. Cold / Adhesive 2. Mount / Premask
                        pu.validateValue(laminatingRun, 1597);
                        pu.validateValue(laminatingRun2, 1605);
                        pu.validateValue(laminatingRun3, '');
                    } else { // 1. Premask / Adhesive  2. Mount  --CATCH ALL UNFORESEEN
                        pu.validateValue(laminatingRun, 1600);
                        pu.validateValue(laminatingRun2, 1604);
                        pu.validateValue(laminatingRun3, '');
                    } 
                } else {  //mounted but no premask
                   if (!hasFrontLam && !hasBackLam) { // 1. Adhesive  2. Mount
                        pu.validateValue(laminatingRun, 1595);
                        pu.validateValue(laminatingRun2, 1604);
                        pu.validateValue(laminatingRun3, '');
                    } else if (hasHotFront) { //  1. Hot / Adhesive  2. Mount
                        pu.validateValue(laminatingRun, 1598);
                        pu.validateValue(laminatingRun2, 1604);
                        pu.validateValue(laminatingRun3, '');
                    } else if (hasColdFront) { //  1. Cold / Adhesive  2. Mount
                        pu.validateValue(laminatingRun, 1597);
                        pu.validateValue(laminatingRun2, 1604);
                        pu.validateValue(laminatingRun3, '');
                    } else if (hasAdhesiveFront || hasAdhesiveFront) { // 1. Adhesive  2. Mount
                        pu.validateValue(laminatingRun, 1597);
                        pu.validateValue(laminatingRun2, 1604);
                        pu.validateValue(laminatingRun3, '');
                    } else { // 1. Adhesive  2. Mount  --CATCH ALL UNFORESEEN
                        pu.validateValue(laminatingRun, 1595);
                        pu.validateValue(laminatingRun2, 1604);
                        pu.validateValue(laminatingRun3, '');
                    }
                }
            } else {  //everything not mounted
                if (hasPremask) {
                    if (hasHotFront) {
                        if (hasAdhesiveBack) { // 1. Hot / Adhesive 2. Premask
                            pu.validateValue(laminatingRun, 1598);
                            pu.validateValue(laminatingRun2,1606);
                            pu.validateValue(laminatingRun3, '');
                        } else if (hasHotBack) { // 1. Hot / Hot 2. Premask
                            pu.validateValue(laminatingRun, 1529);
                            pu.validateValue(laminatingRun2,1606);
                            pu.validateValue(laminatingRun3, '');
                        } else { // 1. Hot / Hot 2. Premask
                            pu.validateValue(laminatingRun, 1529);
                            pu.validateValue(laminatingRun2,1606);
                            pu.validateValue(laminatingRun3, '');
                        }
                    } else if (hasColdFront) {
                        if (hasColdBack) {  // 1. Cold  2. Cold 3. Premask
                            pu.validateValue(laminatingRun, 777);
                            pu.validateValue(laminatingRun2,1602);
                            pu.validateValue(laminatingRun3, 1641);
                        } else if (hasAdhesiveBack) { // 1. Cold / Adhesive 2. Premask
                            pu.validateValue(laminatingRun, 1597);
                            pu.validateValue(laminatingRun2,1606);
                            pu.validateValue(laminatingRun3, '');
                        } else { // 1. Cold  2. Pre-mask
                            pu.validateValue(laminatingRun, 777);
                            pu.validateValue(laminatingRun2,1606);
                            pu.validateValue(laminatingRun3, '');
                        }
                    } else if (hasAdhesiveBack || hasAdhesiveFront) { // 1. Adhesive  2. Premask
                        pu.validateValue(laminatingRun, 1595);
                        pu.validateValue(laminatingRun2,1606);
                        pu.validateValue(laminatingRun3, '');
                    } else { // 1. Premask
                        pu.validateValue(laminatingRun, 1601);
                        pu.validateValue(laminatingRun2,'');
                        pu.validateValue(laminatingRun3, '');
                    }
                } else {  // no mount, no premask
                    if (hasHotFront) {
                        if (hasHotBack) { // 1. Hot / Hot
                            pu.validateValue(laminatingRun, 1529);
                            pu.validateValue(laminatingRun2,'');
                            pu.validateValue(laminatingRun3, '');
                        } else if (hasAdhesiveBack) {  // 1. Hot / Adhesive
                            pu.validateValue(laminatingRun, 1598);
                            pu.validateValue(laminatingRun2,'');
                            pu.validateValue(laminatingRun3, '');
                        } else { // WARNING
                            onQuoteUpdatedMessages += '<p> Must have a Hot Lam, Adhesive, or Mount on back side</p>';
                            cu.changeField(backLamOp, '', true);
                            pu.validateValue(laminatingRun3, '');
                        }
                    } else if (hasColdFront) {
                        if (hasColdBack) {  // 1. Cold  2. Cold
                            pu.validateValue(laminatingRun, 777);
                            pu.validateValue(laminatingRun2, 1602); 
                            pu.validateValue(laminatingRun3, '');
                        } else if (hasAdhesiveBack) { // 1. Adhesive
                            pu.validateValue(laminatingRun, 1595);
                            pu.validateValue(laminatingRun2,'');
                            pu.validateValue(laminatingRun3, '');
                        } else if (hasHotBack) {
                            onQuoteUpdatedMessages += '<p>You have selected a Cold Front Lam and Hot Back Laminate. Please contact estimating for a special quote.</p>'
                            cu.changeField(backLamOp,'', true);
                        } else {  // 1. Cold
                            pu.validateValue(laminatingRun, 777);
                            pu.validateValue(laminatingRun2, '');
                            pu.validateValue(laminatingRun3, ''); 
                        }
                    } else if (hasAdhesiveBack || hasAdhesiveFront) { // 1. Adhesive
                        pu.validateValue(laminatingRun, 1595);
                        pu.validateValue(laminatingRun2,'');
                        pu.validateValue(laminatingRun3, '');
                    } else if (hasColdBack) { // 1. Cold
                        pu.validateValue(laminatingRun, 777);
                        pu.validateValue(laminatingRun2,'');
                        pu.validateValue(laminatingRun3, '');
                    }
                }
            }
            //insert total LF of boards into operation answer
            if (laminatingRun_answer) {
                pu.validateValue(laminatingRun_answer, totalBoardLF);
            }
            if (laminatingRun2_answer) {
                pu.validateValue(laminatingRun2_answer, totalBoardLF);
            }
            if (laminatingRun2_answer) {
                pu.validateValue(laminatingRun3_answer, totalBoardLF);
            }
            setLamRollChangeLabor(quote, lamRollChangeOp, lamRollChangeOpAnswer);
        } else {
            pu.validateValue(laminatingRun,'');
            pu.validateValue(laminatingRun2,'');
            pu.validateValue(laminatingRun3, '');
            pu.validateValue(lamRollChangeOp, '');
        }
    }
}
function setLamRollChangeLabor(quote, rollChangeOp, answer) {
    var rollChangeMins = getLamRollChangeOp(quote);
    if (rollChangeMins > 0) {
        pu.validateValue(rollChangeOp, 1664);
        if (answer) {
            pu.validateValue(answer, rollChangeMins);
        }
    } else {
        pu.validateValue(rollChangeOp,'');
    }

}
function getLamRollChangeOp(quote) {
    var result = 0;
    var rollChanges = 0;
    var minutesPerChange = 15;
    var rollLF = 150;
    var boardLength = quote.pressSheetQuote.height;
    var boards = quote.pressSheetQuote.pressSheetCount;
    rollChanges = Math.ceil(boards * boardLength / (rollLF * 12)) - 1;

    result = minutesPerChange * rollChanges;
    return result
}

function setPreLamRunCosts(pLamOps, lf) {
    var prePrintLamRunOp = fields.operation151;
    var prePrintLamRunOp_answer = fields.operation151_answer;
    var passes = 0;
    if (pLamOps) {
        passes = pu.countHasValueFromOpSet(pLamOps);
    }
    if (passes == 2) {
        pu.validateValue(prePrintLamRunOp, 1642);
    } else if (passes == 1) {
        pu.validateValue(prePrintLamRunOp, 898);
    } else {
        pu.validateValue(prePrintLamRunOp, '');
    }
    //insert LF into Answer
    if (prePrintLamRunOp_answer) {
        pu.validateValue(prePrintLamRunOp_answer, lf)
    }
}

function setLamMatCosts(lf) {
    var lamOpAnswers = [
        fields.operation129_answer,  //LF Pre-Printing Front Laminate
        fields.operation144_answer,  //LF Pre-Printing Back Laminate
        fields.operation131_answer,  //LF Front Laminating
        fields.operation130_answer,   //LF Back Laminating
        fields.operation133_answer,   //LF Premask
    ]

    for (var i = 0; i < lamOpAnswers.length; i++) {
        if (lamOpAnswers[i]) {
            pu.validateValue(lamOpAnswers[i],lf);
        }
    }

}

function setFluteDirectionOp() {
    /********* Show Flute/Grain Direction operation when Fluted substrate selected */
    var fluteDirectionOp = fields.operation152;
    var flutedSubstrateNames = [
        'Coroplast',
        'Flute',
        'Brushed Silver'
    ];
    var prePrintingLamOps = [
        129,
        144
    ]
    //skip if no Press Sheet Type select Shown
    if (!fields.pressSheetType) {
        return
    }
    if (fluteDirectionOp) {
        var substrateName = $('#pressSheetType select[name="PRESSSHEETTYPEDD"] option:selected').text();
        var hasFlutes = false;
        for (names in flutedSubstrateNames) {
            if (substrateName.indexOf(flutedSubstrateNames[names]) != -1) {
                hasFlutes = true;
            }
            //if in Pre-lam ops
            for (op in prePrintingLamOps) {
                if ($('#operation'+prePrintingLamOps[op])) {
                    var optionText = $('select#operation'+prePrintingLamOps[op]+' option:selected').text();
                    if (optionText) {
                        if (optionText.indexOf(flutedSubstrateNames[names]) != -1) {
                            hasFlutes = true;
                        }
                    }
                }
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
}

function heatBendingRules(updates) {
    
    var heatBendMessage = '';
    var heatBendingOpIds = [159, 249];
    var heatBendingOpVert = fields.operation159;
    var heatBendingOpVert_answer = fields.operation159_answer;
    var heatBendingOpHoriz = fields.operation249;
    var heatBendingOpHoriz_answer = fields.operation249_answer;
    var customHeatBendOpItem = 1742;
    
    
    var boardTypesThatCanHeatBend = [
        '247',   //Buy-out
        '173',   // Styrene
        '189',   // Styrene - white - 105
        '337',  //Styrene - white - 126
        '190',   // Styrene - black
        '193',   // Styrene - translucent
        '182',   // PETG
        '228',   // PETG Non-Glare
        '262',   // PETG Transilwrap
        '183',   // Sintra Expanded PVC - white
        '197',   // Sintra Expanded PVC - black
        '231',   // Komatex Expanded PVC - White
        '232',   // Komatex Expanded PVC - Black
        '301',    //EPVC Komatex - White
        '302',    //EPVC Komatex - Black
        '303',    //EPVC Sintra - Black
        '304',    //EPVC Sintra - White
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
    ];


    if (heatBendingOpVert && heatBendingOpHoriz) {
        //Do not allwow with Post printing lam and mounting operations
        //var previousAllowHeatBend = allowHeatBend;
        var allowHeatBend = true;
        var heatBendErrors = [];
        var heatBendLocation = getBendLocation();

        var hasMountLam = checkForNonHeatBendingOps([
                fields.operation130,  //LF Back Laminating
                fields.operation131,  //LF Front Laminating
                fields.operation135   //LF Mounting
            ]);

        var hasHeatBending = (cu.hasValue(heatBendingOpVert) || cu.hasValue(heatBendingOpHoriz));
    
        pu.addClassToOperationItemsWithString(heatBendingOpIds, 'heat-bend-fab', 'Bend_TBG Fab');
        pu.addClassToOperationItemsWithString(heatBendingOpIds, 'heat-bend-fab', 'Bends_TBG Fab');
        pu.addClassToOperationItemsWithString(heatBendingOpIds, 'heat-bend-one', 'Bend_TBG1');
        pu.addClassToOperationItemsWithString(heatBendingOpIds, 'heat-bend-one', 'Bends_TBG1');


        if (hasHeatBending) {
            if (cu.hasValue(heatBendingOpVert)) {
                validateLocationValue(heatBendingOpVert, heatBendLocation);
                validateJobConfig(heatBendingOpVert, 'vertical', hasMountLam);
            }
            if (cu.hasValue(heatBendingOpHoriz)) {
                validateLocationValue(heatBendingOpHoriz, heatBendLocation);
                validateJobConfig(heatBendingOpHoriz, 'horizontal', hasMountLam);
            }

            nVertBends = getBendCount(heatBendingOpVert);
            nHorizBends = getBendCount(heatBendingOpHoriz);
            if (nVertBends + nHorizBends > 2) {
                heatBendErrors.push('Cannot have more than 2 total bends.  Please go through central estimating for a valid price.');
            }

            heatBendErrorMessage(heatBendErrors);

            var hasVertMinutes = setHeatBendMinutes(heatBendingOpVert, heatBendingOpVert_answer, nVertBends);
            var hasHorizMinutes = setHeatBendMinutes(heatBendingOpHoriz, heatBendingOpHoriz_answer, nHorizBends, hasVertMinutes);
            pu.hideOperationQuestion(heatBendingOpIds);

        }

        
        updateBendOpItems(heatBendLocation);

        if (cu.getValue(heatBendingOpVert) == customHeatBendOpItem) {
            pu.validateValue(heatBendingOpHoriz,'');
        }

    }

    function getBendLocation() {
        var location = 'TBG1';
        if (cu.getTotalQuantity() > 200) {
            location = 'FAB';
        }
        if (cu.hasValue(heatBendingOpVert)) {
            if (cu.getHeight() <= 3) {
                location = 'FAB';
            }
        }
        if (cu.hasValue(heatBendingOpHoriz)) {
            if (cu.getWidth() <= 3) {
                location = 'FAB';
            }
        }
        return location
    }
    function getBendCount(op) {
        var result = 0;
        if (cu.hasValue(op)) {
            var choice = cu.getSelectedOptionText(op);
            result = (choice.indexOf('2 Bends') != -1) ? 2 : 1;
        }
        return result
    }

    function setHeatBendMinutes(op, answer, bends, hasVertical) {
        //calculate total estimated time to complete

        if (cu.hasValue(op)) {
            var choice = cu.getSelectedOptionText(op);
            if (choice.indexOf('Fab estimate') != -1) {
                //if has Fab estimate, set as 0 minutes
                pu.validateValue(answer,0);
            } else {
                var setupMinutes = getSetupMinutes(choice, bends, hasVertical);
                var minsPerPiece = (choice.indexOf('Vertical') != -1) ? getMinutesPerPiece(cu.getHeight()) : getMinutesPerPiece(cu.getWidth());
                var totalMinutes = setupMinutes + ( minsPerPiece * cu.getTotalQuantity() );
                pu.validateValue(answer, totalMinutes);
                pu.hideOperationQuestion
                return true
            }

        }
    }
    function getSetupMinutes(choice, bends, hasVertical) {
        //30 minutes setup for first bend, 15 for each thereafter
        if (hasVertical) {
            return bends * 15
        } else {
            return 30 + ( (bends - 1) * 15 )
        }
    }
    function getMinutesPerPiece(len) {
        if (len <= 18) {
            return .4
        } else if (len <= 24) {
            return .6
        } else if (len <= 36) {
            return .8
        } else if (len <= 48) {
            return 1.2
        }
        return 0
    }
    function checkForNonHeatBendingOps(fields) {
        for (var i = 0; i < fields.length; i++) {
            if (cu.hasValue(fields[i])) {
                return true
            }
        }
    }
    function validateJobConfig(op, orientation, hasMountLam) {
        var substrateCaliper = cu.getPressSheetCaliper();
        var bendLength = orientation == 'vertical' ? cu.getHeight() : cu.getWidth();
        var maxSubstrateCaliper = .237;
        var minSubstrateCaliper = .020;

        var isBuyOut = cu.getValue(fields.paperType) == '247';
        //only approved materials
        if (!cu.isValueInSet(fields.paperType, boardTypesThatCanHeatBend)) {
            heatBendErrors.push('The substrate selected is not able to Heat Bend.');
        }
        //bend length cannot be greater than 48"
        if (bendLength > 48) {
            heatBendErrors.push('Heat bending is not available for pieces with Bend Length longer than 48".');
        }
        if (isBuyOut) {
            heatBendErrors.push('Heat bending for Buy-out materials.');
        }
        //caliper restrictions, only if present and not a buyout
        if (substrateCaliper && !isBuyOut) {
            //max caliper of .118
            if (substrateCaliper > maxSubstrateCaliper) {
                heatBendErrors.push( 'Substrates with calipers greater than ' + maxSubstrateCaliper + '".');
            }
            if (substrateCaliper <  minSubstrateCaliper) {
                heatBendErrors.push( 'Substrates with calipers less than than ' + minSubstrateCaliper + '".');
            }
            if (bendLength > 24 && substrateCaliper <= .040) {
                heatBendErrors.push( 'Substrates with calipers of .040" or less must have a bend length 24" or less.');
            }
            if (hasMountLam && substrateCaliper < .060) {
                heatBendErrors.push( 'Substrates with calipers less than .060" with laminating or mounting.');
            }
        }
    }

    function validateLocationValue(op, location) {
        var opChoice = cu.getValue(op);
        // TBG1 (value) : FAB (key)
        var heatBendKeyPairs = {
            1750 : 1736,  //vertical 1 bend
            1751 : 1737,  //vertical 2 bend
            1746 : 1744,  //horizontal 1 bend
            1747 : 1745  //horizontal 2 bend
        }
        if (location == 'TBG1') {
            //if TBG1 check to see if in key - , if in value then set as key
            for (var key in heatBendKeyPairs) {
                if (opChoice == key) {
                    return
                }
                if (opChoice == heatBendKeyPairs[key]) {
                    cu.changeField(op, key, true);
                }
            }
        } else {
            //else for FAB check to see if in value - , if in key then set as value
            for (var key in heatBendKeyPairs) {
                if (opChoice == heatBendKeyPairs[key]) {
                    return
                }
                if (opChoice == key) {
                    cu.changeField(op, heatBendKeyPairs[key], true);
                }
            }
        }
    }
    function heatBendErrorMessage(errors) {
        if (errors.length > 0) {
            if (cu.getValue(heatBendingOpVert) != customHeatBendOpItem || cu.hasValue(heatBendingOpHoriz)) {
                pu.validateValue(heatBendingOpVert,customHeatBendOpItem);
                pu.validateValue(heatBendingOpHoriz, '');
                
                var errorMessage = '<p>Heat Bending with this configuration must be estimated through a Fab Estimate Request:</p><div><ul>';
                for (var i = 0; i < errors.length; i++ ) {
                    errorMessage += '<li>' + errors[i] + '</li>';
                }
                errorMessage += '</ul></div><p>A choice is still needed so the Heat Bending Operations have been adjusted to account for this.</p><p>For more information please visit the Help Tip.</p>'
                onQuoteUpdatedMessages += errorMessage;
            }
        }
    }
    function updateBendOpItems(location) {
        if (location == 'TBG1') {
            $('option.heat-bend-fab').hide()
        } else {
            $('option.heat-bend-one').hide()
        }
        pu.trimOperationItemNames(heatBendingOpIds,'_');
    }
}

function twoSidedJobOp() {
    /********* ADD SIDE 2 SETUP COST WHEN 2 SIDED CHOSEN */
    var sideTwoSetupOp = fields.operation210;
    if (sideTwoSetupOp) {
        if (cu.hasValue(fields.printingS2)) {
            pu.validateValue(sideTwoSetupOp, 1498);
        } else {
            pu.validateValue(sideTwoSetupOp,'');
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

function mountAdhesive() {
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
    var mountOp = fields.operation139;
    var adhesiveOp = fields.operation140;
    var adhesiveMatItem = '';
    var clearAdhesive = 1030;
    var defaulAdhesive = 797;
    
    if (mountOp && adhesiveOp) {
        if (cu.hasValue(mountOp)) {
            if (subsratesTypesWithClearAdhesive.indexOf(cu.getValue(fields.paperType)) != -1) {
                adhesiveMatItem = clearAdhesive;
            } else if (mountsWithClearAdhesive.indexOf(cu.getValue(mountOp)) != -1) {
                adhesiveMatItem = clearAdhesive;
            } else {
                adhesiveMatItem = defaulAdhesive;
            }
        }
    }
    pu.validateValue(adhesiveOp, adhesiveMatItem);
}
function jobCostSpoilage(quote) {
    var spoilageOp = fields.operation233;
    var spoilageOpAns = fields.operation233_answer;
    var spoilageCost = quote.jobCostPrice ? quote.jobCostPrice : 0;
    if (spoilageOp) {
        if (!cu.hasValue(spoilageOp)) {
            cu.changeField(spoilageOp, 1666, true);
        }
        pu.validateValue(spoilageOpAns, spoilageCost)
    }
}

function colorWork() {

    lightingEnvironmentColorWork();

    function lightingEnvironmentColorWork() {
        var lightEnvOp = fields.operation247;
        if (lightEnvOp) {
            var refId = pu.getMaterialReferenceId();
            if (stockClassification.clear.indexOf(refId) == -1) {
                cu.hideField(lightEnvOp);
                pu.validateValue(lightEnvOp, '');
            } else {
                cu.showField(lightEnvOp);
            }
        }
    }
}

function bucketPrinting(product) {
    var bucketOp = fields.operation193;
    if (!bucketOp) {return}

    //if product is Scheduled Product, then disable checkout on Invalid Configurations.
    //if on a standard product, this field would have to be selected by a Planner or have a re-order from a job where the planner selected Bucket Printing
    // in the later case, only deselect if new configuration is invalid.  Do not show warnings
    var scheduledProduct = $('body').hasClass('scheduledPrinting');

    var validBucketJob = bucketValidate();

    if (validBucketJob) {
        // auto turn on for Magnet Printing
        if (cu.getPjcId(product) == 1789 || scheduledProduct) {
            pu.validateValue(bucketOp, 1268);
        }
    } else {
        pu.validateValue(bucketOp, '');
    }


    function bucketValidate() {
        var hardProofOptions = [
            '40', '41', '43', '50'
        ] 

        var shipDate = new Date($('.shipDate input').val());
        var kitDate = new Date($('.kitDate input').val());

        var productionDays = {
            toKitting : pu.productionDaysFromNow(kitDate, 13),
            toShipping : pu.productionDaysFromNow(shipDate, 13),
            total : 0
        }

        if (productionDays.toKitting && productionDays.toShipping) {
            //if both are valid, take smallest
            productionDays.total = Math.min(productionDays.toKitting, productionDays.toShipping);
        } else if (productionDays.toKitting) {
            productionDays.total = productionDays.toKitting;
        } else if (productionDays.toShipping) {
            productionDays.total = productionDays.toShipping;
        }
        console.log(productionDays);

        // limited to 5 boards max
        if (cu.getTotalPressSheets() >= 6) {
            if (scheduledProduct) {
                var maxBoardMessage = '<p>Bucket Printing is limited to 5 boards.  Please use the standard Board Printing product.';
                onQuoteUpdatedMessages += (maxBoardMessage);
                disableCheckoutReasons.push(maxBoardMessage);
            }
            return false
        }
        // proofType NOT IN (40,41,43,50) //standing & hard proofs
        if (cu.isValueInSet(fields.proof,hardProofOptions)) {
            return false
        }
        // pressSheetWeight <> 55 //.015
        if (cu.getValue(fields.paperWeight) == 55) {
            return false
        }
        // operation 205 is not used //color critical
        if (cu.hasValue(fields.operation205)) {
            return false
        }
        // operation 187 <> opItem 2037 //other
        if (cu.getValue(fields.operation187) == 2037) {
            return false
        }
        //Need at least 1 Production Day.  Allow Next Day if before 1:00 pm
        if (productionDays.total > 0 && productionDays.total < 2) {
            if (scheduledProduct) {
                var maxProductionDayMessage = '<p>Bucket Printing requires at least 2 production days.  Cut off time is 1:00 pm to order for next day. Please use the standard Board Printing product.';
                onQuoteUpdatedMessages += (maxProductionDayMessage);
                disableCheckoutReasons.push(maxProductionDayMessage);
            }
            return false
        }
        return true
    }
    
}
function magnetPrintMode() {
    var magPaperTypes = ['51'];
    var magPrintModeOp = fields.operation187;
    //Standard Satin
    var defaultMode = 1259;

    if (magPrintModeOp) {
        if (cu.isValueInSet(fields.paperType, magPaperTypes)) {
            cu.showField(magPrintModeOp);
            if (!cu.hasValue(magPrintModeOp)) {
                cu.changeField(magPrintModeOp, defaultMode, true);
            }
        } else {
            pu.validateValue(magPrintModeOp, '');
            cu.hideField(magPrintModeOp);
        }
    }
        
}

//functions ran after completed full quote
function setSpecialMarkupOps(quote) {
    //calculates job costs and inserts into special costing operation answers
    var hasUpdate = false;
    
    var teamCost = Number(getOperationPrice(quote, "TBG Team"));
    var teamCostAnswer = Math.round( (quote.jobCostPrice + quote.operationsPrice - teamCost) * 100) / 100;
    
    var specCustCost = Number(getOperationPrice(quote, "TBG Special Customer"));
    var specCustCostAnswer = Math.round( (quote.jobCostPrice + quote.operationsPrice) * 100) / 100;
    
    if (cu.hasValue(fields.operation218)) {
        pu.validateValue(fields.operation218_answer, teamCostAnswer);
    }
    if (cu.hasValue(fields.operation226)) {
        pu.validateValue(fields.operation226_answer, specCustCostAnswer);
    }
    return hasUpdate
}
function getOperationPrice(quote, opHeader) {
    var operationQuotes = quote.operationQuotes;
    for (var i = 0; i < operationQuotes.length; i++) {
        if (operationQuotes[i].data.heading == opHeader) {
            return operationQuotes[i].price
        }
    }
    return 0;
}

function setDefaultTeam() {
    //ran only on calculator load
    var teamOp = fields.operation218;
    var tbgTeams = {
        "Team Andrew Clemens" : 1576,
        "Team Andrew Dyson" : 1583,
        "Team Beth Josub" : 1572,
        "Team Cindy Johnson" : 1570,
        "Team Craig Omdal" : 1575,
        "Team Jayson Hansen" : 2045,
        "Team Jim Olson" : 1580,
        "Team John Pihaly" : 1578,
        "Team Jordan Feddema" : 1574,
        "Team Perry Ludwig" : 1584,
        "Team Pete Ludwig" : 1568,
        "Team Rick Behncke" : 1581,
        "Team Rick Mirau" : 1585,
        "Team Tom Manthe" : 2065,
        "Team Tony Jones" : 1582,
        "Team Tracy Cogan" : 1577,
        "Team Vito Lombardo" : 1571,
        "Unassigned" : 1569
    }
    var userTeam = globalpageglobals.cuser.metadata["Default Team"];
    if (userTeam) {
        var teamId = tbgTeams[userTeam];
        if (teamId) {
            pu.validateValue(teamOp, teamId);
        } else {
            console.log('User assigned team ' + userTeam + ' not in TBG Team set in logic file.');
        }
    } else {
        console.log('User assigned team not assigned to default team');
    }
}

//UI Updates
function updateUI(product) {
    updateLabels();
    updateClasses();
    updateOpItems();
    metaFieldsActions.onQuoteUpdated(product);
    addBasicDetailsToPage();
    maxQuotedJob();
    pu.showMessages();
    pu.validateConfig(disableCheckoutReasons);
    renderExtendedCostBreakdown();
    inkOptGroup_surface(product);
    disableBoardType(product);
    //inkOptGroup_common(product);
}
function updateLabels() {
    cu.setLabel(fields.paperType,'Substrate');
    cu.setLabel(fields.paperWeight,'Thickness');
    $('#paper h3').text('Substrate');
}
function updateClasses() {
    var planningOnlyOperations = [
        150,    //LF Cutting
        154,    //LF Guillotine Cutting
        274,    //LF Guillotine Slip Sheets
        155,    //LF Fotoba Cutting
        102,    //LF Zund Cutting
        140,     //LF Mounting Adhesive
        165,    //LF Pre-Slit
        166,    //LF Pre-Cut
        168,    //LF No Cutting
        // 170,     //LF Hub Cutting
        174,     //LF TBG-Fab Cut
        193,     //LF Bucket Job
        // 187,    //LF Gloss Mode
        202,     //LF MCT Cutting
        215     //LF Gutter
    ]
    var estimstingOnlyOperations = [
        //218    //TBG Team Factor (temporary)
    ]
    var opsWithOther = [
        129,
        130,
        131,
        144,
        139,
        133
    ]
    var opsWithCalculatedAnswer = [
        133,    //Premask
        218,    //TBG Team
        226,    //TBG Special Customer
        129,    //Pre-Printing Front Laminate
        144,    //Pre-Printing Back Laminate
        131,    //Front Laminating
        130,    //Back Laminating
        139    //Mounting
    ]

    pu.addClassToOperation(planningOnlyOperations,'planning');
    pu.addClassToOperation(estimstingOnlyOperations,'estimating');
    pu.addClassToOperationItemsWithString(opsWithOther, 'otherOpItem', 'Other');
    pu.addClassToOperation(opsWithCalculatedAnswer,'calculatedAnswer');
    pu.removeClassFromOperation(170,'costingOnly');
    pu.removeClassFromOperation(205,'costingOnly');
}
function updateOpItems() {
    var opsWithUnderscoreItems = [
        120,  //LF Tape, Mag, Velcro - Perimeter
        122,  //LF Tape, Mag, Velcro - Top Only
        124,  //LF Tape, Mag, Velcro - Top & Bottom
        129,  //LF Pre-Printing Front Laminate
        130,  //LF Back Laminating
        131,  //LF Front Laminating
        133,  //LF Premask
        139,  //LF Mounting
        144,  //LF Pre-Printing Back Laminate
        176,  //LF Film Tape Application - Perimeter
        177,  //LF Film Tape Application - Top Only
        178,  //LF Film Tape Application - Top & Bottom
        179,  //LF Magnet Application - Perimeter
        180,  //LF Velcro Application - Top Only
        181,  //LF Magnet Application - Top & Bottom
        182,  //LF Velcro Application - Perimeter
        183,  //LF Magnet Application - Top Only
        184,  //LF Velcro Application - Top & Bottom
        243,  //Match Color to
        248,  //Can color team approve color without PM?
        263,  //LF Foam Tape Application - Perimeter
        264,  //LF Foam Tape Application - Top & Bottom
        265,  //LF Foam Tape Application - Top Only
        266,  //LF Bump-ons Application
        267,  //LF Sleeves Application
        268,  //LF Misc Hand Application
        269,  //LF Film Tape Application - Custom
        270,  //LF Foam Tape Application - Custom
        271,  //LF Magnet Tape Application - Custom
        272,  //LF Velcro Tape Application - Custom
        277,  //LF Grommet Color
        282,  //Variable Data Personalization - DO NOT USE
    ]
    var opsToHideOptions_z = [
        129, //LF Pre-Printing Front Laminate
        133, //LF Premask
        131, //LF Front Laminating
        139, //LF Mounting
        130, //LF Back Laminating
        144  //LF Pre-Printing Back Laminate
    ]
    pu.removeOperationItemsWithString(opsToHideOptions_z, 'z_');
    pu.trimOperationItemNames(opsWithUnderscoreItems,'_', '', 'z_');
    pu.removeOperationItemsWithString(156,'Print');
}
function inkOptGroup_surface(product) {

    insertOptGroup($('select[name="SIDE1DD"]'));
    insertOptGroup($('select[name="SIDE2DD"]'));

    var side1CommonInkTypes = [
        '64',   //Standard CMYK (First Surface)
        '58',   //Standard CMYK (Second Surface)
        '42',   //CMYK + W (Flood / Second Surface)
        '50',   //CMYK + W (Spot / Second Surface)
        '43',   //W + CMYK (Flood / First Surface)
        '51',   //W + CMYK (Spot / First Surface)
        '53',   //W + W + CMYK (Spot / First Surface)
        '60',   //W + W Only (Spot / First Surface)
        '62',   //White Only (Spot / First Surface)
        '55'   //CMYK (Backlit)
    ]
    var side2CommonInkTypes = [
        '64',   //Standard CMYK (First Surface)
    ]

    function insertOptGroup(inkSelect) {
      
        //Create opt groups for inks with Surfact in name
        //only for TBG Board Printing
        if (inkSelect.find('optGroup').length > 0) {
            return
        }
        var selectedOption = inkSelect.val();
        var firstSurfaceGroup = $('<optgroup label="First Surface"></optGroup>');
        var secondSurfaceGroup = $('<optgroup label="Second Surface"></optgroup>');
        var otherGroup = $('<optgroup label="other"></optgroup>');
        var items = inkSelect.find('option');
        for (var i = 0; i < items.length; i++) {
            //if none, push to top
            if (items[i].value == '') {
                inkSelect.append(items[i]);
                continue
            }
            var optionText = items[i].text;
            if (optionText.indexOf('First Surface') != -1) {
                firstSurfaceGroup.append(items[i]);
            } else if (optionText.indexOf('Second Surface') != -1) {
                secondSurfaceGroup.append(items[i])
            } else {
                otherGroup.append(items[i])
            }
        }
        firstSurfaceGroup.appendTo(inkSelect);
        if (secondSurfaceGroup.find('option').length > 0) {
            secondSurfaceGroup.appendTo(inkSelect);
        }
        if (otherGroup.find('option').length > 0) {
            otherGroup.appendTo(inkSelect);
        }

      inkSelect.val(selectedOption);
   }
}
function inkOptGroup_common(product) {
    //Create opt groups for COMMON inks ink list
    //only for TBG Board Printing
    if (cu.getPjcId(product) != 832) {return}

    var side1CommonInkTypes = [
        '64',   //Standard CMYK (First Surface)
        '58',   //Standard CMYK (Second Surface)
        '42',   //CMYK + W (Flood / Second Surface)
        '50',   //CMYK + W (Spot / Second Surface)
        '43',   //W + CMYK (Flood / First Surface)
        '51',   //W + CMYK (Spot / First Surface)
        '53',   //W + W + CMYK (Spot / First Surface)
        '60',   //W + W Only (Spot / First Surface)
        '62',   //White Only (Spot / First Surface)
        '55'   //CMYK (Backlit)
    ]
    var side2CommonInkTypes = [
        '64',   //Standard CMYK (First Surface)
    ]

    insertOptGroup($('select[name="SIDE1DD"]'), side1CommonInkTypes);
    insertOptGroup($('select[name="SIDE2DD"]'), side2CommonInkTypes);


    function insertOptGroup(inkSelect, list) {
        if (!inkSelect) { return }
        if (inkSelect.find('optGroup').length > 0) {
            return
        }
        var selectedOption = inkSelect.val();
        var commonInkGroup = $('<optgroup label="Common Inks"></optGroup>');
        var otherGroup = $('<optgroup label="other"></optgroup>');
        var items = inkSelect.find('option');
        for (var i = 0; i < items.length; i++) {
            //if none, push to top
            if (items[i].value == '') {
                inkSelect.append(items[i]);
                continue
            }
            if (list.indexOf(items[i].value) != -1) {
                commonInkGroup.append(items[i]);
            } else {
                otherGroup.append(items[i])
            }
        }
        if (commonInkGroup.find('option').length > 0) {
            commonInkGroup.appendTo(inkSelect);
        }
        if (otherGroup.find('option').length > 0) {
            otherGroup.appendTo(inkSelect);
        }
        inkSelect.val(selectedOption);
   }
}
function disableBoardType(product) {
    var pjcsDisableType = [
        '1826', //*TBG Simple Signs Productization
        '1827', //*TBG Simple Signs with Removable Adhesive Productization
        '1828'  //*TBG Simple Signs with Application Productization
    ]

    if (cu.isPjc(product, pjcsDisableType)) {
        //reset to Quote Override if changed
        var quoteDefault_json = pu.getQuoteDefaultJson();
        if (quoteDefault_json) {
            if (quoteDefault_json.pressSheetType) {
                pu.validateValue(fields.paperType, quoteDefault_json.pressSheetType);
            }
        }
        cu.disableField(fields.paperType);
    }
}

function addBasicDetailsToPage() {
   $('#runTime span').text(cu.getTotalRuntime());
    $('#totalPressSheets span').text(cu.getTotalPressSheets());
    var piecesOnSheet = (cu.getTotalQuantity() / cu.getTotalPressSheets());
    piecesOnSheet = Math.ceil(piecesOnSheet);
    $('#piecesOnSheet span').text(piecesOnSheet);
    $('#smallFormatPrintSpecs').insertAfter('.quoteContinue');
    $('#smallFormatPrintSpecs').show();
    $('#pressSheetName span').text(cu.getPressSheetName()); 
}
function maxQuotedJob() {
    var jobQuote = configureglobals.cquote.jobTotalPrice;
    var maxQuotaJobAmt = 5000;
    if (jobQuote > maxQuotaJobAmt) {
        $('#validation-message-container').html('<div class="ribbon-wrapper quote-warning">The total price of your job exceeds $' + maxQuotaJobAmt + '. Please contact Central Estimating to obtain a quote for your job.</div>')
    } else {
        $('#validation-message-container').html('');
    }
}
function checkForHardProofRequired() {
    // SHOW HARD PROOF MESSAGE ON THROUGHPUT THRESHOLDS 
    // do not run if user is admin
    if ($('#page').hasClass('userIsAdministrator')) {
        return
    }
    if (!window.hardProofMessageCount) {
        window.hardProofMessageCount = 0;
    }
    var boardThroughput = cu.getTotalPressSheets();
    var proofOp = fields.proof;
    var hardProofOptions = [
        '40', //Printed Hard Proof - Internal
        '43', //Printed Hard Proof - External
        '48', //Prototype Proof - External
        '51'  //
    ]
    if (boardThroughput >= 20) {
        if (hardProofMessageCount == 0) {
            if (!cu.isValueInSet(proofOp, hardProofOptions)) {
                onQuoteUpdatedMessages += '<p>Jobs with a throughput of 20 boards require to have a hard proof. We have changed the proofing option on your behalf.  Please remove if it is not required by your customer.</p>';
                hardProofMessageCount = 1;
                pu.showMessages();
                cu.changeField(proofOp, 40, true);
            }
        } 
    }
}



configureEvents.registerOnCalcLoadedListener(boardCalcLogic);
configureEvents.registerOnCalcChangedListener(boardCalcLogic);
configureEvents.registerOnQuoteUpdatedListener(boardCalcLogic);
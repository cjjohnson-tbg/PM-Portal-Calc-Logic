// Message holder
var onQuoteUpdatedMessages = '';

// Operation Item Keys object - in window for testing
var operationItemKeys = new Object();  

// Object for Lam and Mount choices
var printConfig = {};

var cu = calcUtil;
var pu = pmCalcUtil;
var cc = calcConfig;

var calcCount = 0;
var lastUIChangedFieldName = null;

var rollCalcLogic = {
    onCalcLoaded: function(product) {
        cu.initFields();
        uiUpdates(product);
        //run meta field action
        metaFieldsActions.onCalcLoaded();
    },
    onCalcChanged: function(updates, product) {
        if (updates) {
            lastUIChangedFieldName = updates.fieldName;
            // console.log('lastUIChangedFieldName', lastUIChangedFieldName);
        }
    },
    onQuoteUpdated: function(updates, validation, product) {
        if (cu.isPOD(product)) {
            //STOP IF CALCULATOR NOT RETURNING QUOTE
            if (!configureglobals.cquote) { return; }
            if (!configureglobals.cquote.success) { return; }

            if (cu.isSmallFormat(product)) {
                var quote = configureglobals.cquote.pjQuote;
                if (!quote) { return; }
                rollCalcLogic.onQuoteUpdated_POD_SmallFormat(updates, validation, product, quote);
            } else {
                var quote = configureglobals.cquote.lpjQuote;
                if (!quote) { return; }

                calcCount++;

                //STOP IF CALCULATOR GOT INTO A LOOP
                if (updates && updates.context && updates.context.contextLevel > 5) {
                    console.log('onQuoteUpdated', calcCount, 'POD_LF Stuck in a loop! Stopping.', updates);
                    return;
                }

                console.log('onQuoteUpdated', calcCount, 'POD_LF Begin', updates);
                rollCalcLogic.onQuoteUpdated_POD_LargeFormat(updates, validation, product, quote);
                console.log('onQuoteUpdated', calcCount, 'POD_LF End');
            }
        }
    },
    onQuoteUpdated_POD_LargeFormat: function(updates, validation, product, quote) {
        var changeEventTriggered = false;

        //re-init Fields 
        cu.initFields();

        //Add properties to global objects from embedded meta 
        setConfigGlobalProperties(quote);
        //Run Roll Imposition Engine
        cc.getUpdatedConfig(quote);
        //run meta field action
        metaFieldsActions.onQuoteUpdated(product);

        //Functions that are not inter-dependent
        controller.enterFullQuoteMode();
        functionsRanInFullQuote(updates, validation, product, quote);
        console.log('POD_SF validation finished. Pending change:', controller.fieldChangeQuotePending);
        var requoteInProgress = controller.fieldChangeQuotePending;
        controller.exitFullQuoteMode(updates);
        if (requoteInProgress) {
            return true;
        }

        //functions needing price results and UI changes
        /*changeEventTriggered = */
        functionsRanAfterFullQuote(updates, validation, product, quote);
        //console.log('POD_LF post-full-quote changes triggered:',changeEventTriggered);
        
        uiUpdates(product);

        //run meta field action
        metaFieldsActions.onCalcLoaded();

        //focusLastUIChangedField();

        return changeEventTriggered;

    }, 
    onQuoteUpdated_POD_SmallFormat: function(updates, validation, product, quote) {

    }
}

function focusLastUIChangedField() {
    $(getFormItem(lastUIChangedFieldName,document)).trigger('focus').triggerHandler('focus');
}

// Functions called in Full Quote
function setConfigGlobalProperties(quote) {
    pu.setCustomProperties(quote.device,"description","customProperties");
    addJobMaterialProperties(quote);
}
function addJobMaterialProperties(quote) {
    var jobMaterials = quote.piece;
    for (prop in jobMaterials) {
        if (jobMaterials.hasOwnProperty(prop)) {
            pu.setCustomProperties(jobMaterials[prop], "notes","customProperties")
        }
    }
}


function functionsRanInFullQuote(updates, validation, product, quote) {
    createOperationItemKey(quote);
    setWasteOperationCosts(quote);
    setCuttingOps(quote, product);

    setRollChangeCost(cc.printConfig);

    setInkMaterialCosts();
    setLamRunOps(quote, cc.printConfig);
    canonBacklitLogic(updates, product);
    checkSidesOpConflicts(quote);
    setVinylCuttingRules();
    fluteDirectionRules();
    backlitDoubleStike();
    heatBendingRules();
    fabrivuLogic(product);
    colorCritical();

}

function functionsRanAfterFullQuote(updates, validation, product, quote) {
    //require results from Quote update
    hardProofCheck(quote);
    setSpecialMarkupOps(quote);

    //UI changes
    uiUpdates(product);
    renderExtendedCostBreakdown();
    pu.showMessages();
}

function createOperationItemKey(quote) {
    /* Create object from key value pairs inserted into operation Item Description surrounded by double brackets "{{ }}" */
    //clear current keys
    for (const prop of Object.keys(operationItemKeys)) {
      delete operationItemKeys[prop];
    }
    var ops = quote.operationQuotes;
    if (ops) {
        ops.forEach(function(operationQuote) {
            var opItemDescription = operationQuote.operationItem.description;
            var opItemKeyText = /\{(.*?)\}/.exec(opItemDescription);
            if (opItemKeyText) {
                var opItemJSON = pu.getJsonFromString(opItemKeyText[0]);
                if (opItemJSON) {
                    for (prop in opItemJSON) {
                        if (opItemJSON.hasOwnProperty(prop)) {
                            operationItemKeys[prop] = opItemJSON[prop];
                        }
                    }
                } else {
                    console.log('invalid json string ' + opItemKeyText);
                }
            }
        });
    }
}
/**** WASTE CALCULATTONS */
function setWasteOperationCosts(quote) {
    //Compares Coll Calculated material costs against PrintConfig costs (Roll Impo calc) and inserts difference into operation answers
    var printConfig = cc.printConfig;
    if (!printConfig) { 
        console.log('no printConfig');
        return;
    }
    if (!printConfig.details.valid_quote) {
        console.log('no valid print configs');
        return;
    }
    var materials = printConfig.materials;

    // Roll Substrate Waste
    var calcPrintSubCost = (materials.aPrintSubstrate ? materials.aPrintSubstrate.totalRollMatCost : 0) + (materials.bPrintSubstrate ? materials.bPrintSubstrate.totalRollMatCost : 0);
    var printSubCost = (quote.aPrintSubstratePrice ? quote.aPrintSubstratePrice : 0) + (quote.bPrintSubstratePrice ? quote.bPrintSubstratePrice : 0);
    setWasteOperationAnswer(fields.operation135_answer, calcPrintSubCost, printSubCost);

    var calcLamCost = (materials.frontLaminate ? materials.frontLaminate.totalCost : 0) + (materials.backLaminate ? materials.backLaminate.totalCost : 0);
    var lamSubCost = (quote.frontLaminatePrice ? quote.frontLaminatePrice : 0) + (quote.backLaminatePrice ? quote.backLaminatePrice : 0);
    setWasteOperationAnswer(fields.operation146_answer, calcLamCost, lamSubCost);

    var calcMountCost = materials.mountSubstrate ? materials.mountSubstrate.totalCost : 0;
    var mountSubCost = quote.mountSubstratePrice ? quote.mountSubstratePrice : 0;
    setWasteOperationAnswer(fields.operation147_answer, calcMountCost, mountSubCost);

    var calcAdhesiveCost = (materials.aAdhesiveLaminate ? materials.aAdhesiveLaminate.totalCost : 0) + (materials.bAdhesiveLaminate ? materials.bAdhesiveLaminate.totalCost : 0);
    var adhesiveSubCost = (quote.aAdhesiveLaminatePrice ? quote.aAdhesiveLaminatePrice : 0) + (quote.bAdhesiveLaminatePrice ? quote.bAdhesiveLaminatePrice : 0);
    setWasteOperationAnswer(fields.operation148_answer, calcAdhesiveCost, adhesiveSubCost);
}
function setWasteOperationAnswer(opAnswer, calcCost, cost) {
    //calcCost is result from Roll Impo calculator held in printConfig
    //if answer not in DOM, break out
    if (!opAnswer) {
        console.log('waste operation answer not loaded');
        return
    }
    //convert from text to number
    currentValue = Number(cu.getValue(opAnswer));
    if (isNaN(currentValue)) {
        console.log('currentValue for Wastage not a number ' + opAnswer);
        return
    }
    var waste = pu.roundTo((calcCost - cost), 2);
    //if not cost, waste set waste to 0
    if (isNaN(waste)) { 
        waste = 0;
    }
    if (currentValue != waste) {
        cu.changeField(opAnswer, waste, true);
    }
}
function setRollChangeCost(printConfig) {
    //Roll Change Minutes
    var rollChangeOp = fields.operation138;
    var rollChangeOpAnswer = fields.operation138_answer;
    var rollChangeMins = 0;
    if (printConfig) {
        var printConfigMaterials = printConfig.materials;
        if (printConfigMaterials.aPrintSubstrate) {
            rollChangeMins += printConfigMaterials.aPrintSubstrate.rollChangeMins;
        }
        if (printConfigMaterials.bPrintSubstrate) {
            rollChangeMins += printConfigMaterials.bPrintSubstrate.rollChangeMins;
        }
    }
    if (rollChangeOp) {
        if (rollChangeMins > 0 && (!cu.hasValue(rollChangeOp))) {
            cu.changeField(rollChangeOp, 682, true);
        } 
        if (!isNaN(rollChangeMins)) {
            if (rollChangeOpAnswer) {
                if (cu.getValue(rollChangeOpAnswer) != rollChangeMins) {
                    cu.changeField(rollChangeOpAnswer, rollChangeMins, true);
                }
            }
        }
    }
}

/**** CUTTING */
function setCuttingOps(quote, product) {
    var cutMethod = getCutMethod();
    setZundOps(quote, cutMethod);
    setOutsourceCutOps(cutMethod);
    setMCTCutOp(cutMethod, product);
    setNoCutOp(cutMethod);
}
function getCutMethod() {
    var userDeclareCutOp = fields.operation111;
    var cutMethodId = {
        450 : 'noCutting',
        451 : 'zund',
        452 : 'outsourcedCut',
        495 : 'fabCut'
    }
    //default to zund
    var result = 'zund';
    if (cu.hasValue(fields.operation127)) {
        var result = 'mct';
        return result;
    }
    if (cu.hasValue(userDeclareCutOp)) {
        userDeclaredCutMethod = cutMethodId[cu.getValue(fields.operation111)];
        if (userDeclaredCutMethod) {
            var result = userDeclaredCutMethod;
            return result
        }
    }
    return result
}
function setZundOps(quote, cutMethod) {
    var zundLoading = fields.operation53;
    var zundCutting = fields.operation55;
    var zundUnloading = fields.operation56;
    var intCutOp = fields.operation112;
    var userItCutOpAnswer = fields.operation180_answer;

    if (cutMethod == 'zund') {
        var zundFactors = {
            "K1" : {"name" : "Knife 1", "loadingOpItem" : 202, "unloadingOpItem" : 201 , "runOpItem": 195, "intCutOpItem": 773, "rank" : 1},
            "K2" : {"name" : "Knife 2", "loadingOpItem" : 202, "unloadingOpItem" : 201 , "runOpItem": 196, "intCutOpItem": 774, "rank" : 2},
            "R1" : {"name" : "Router 1", "loadingOpItem" : 204, "unloadingOpItem" : 201 , "runOpItem": 197, "intCutOpItem": 775, "rank" : 3},
            "R2" : {"name" : "Router 2", "loadingOpItem" : 204, "unloadingOpItem" : 201 , "runOpItem": 198, "intCutOpItem": 776, "rank" : 4},
            "R3" : {"name" : "Router 3", "loadingOpItem" : 204, "unloadingOpItem" : 201 , "runOpItem": 199, "intCutOpItem": 777, "rank" : 5},
            "R4" : {"name" : "Router 4", "loadingOpItem" : 204, "unloadingOpItem" : 201 , "runOpItem": 200, "intCutOpItem": 778, "rank" : 6}
        }

        var zundChoice = getZundChoice(quote, zundFactors);
        if (zundChoice) {
            pu.validateValue(zundLoading, zundChoice.loadingOpItem);
            pu.validateValue(zundCutting, zundChoice.runOpItem);
            pu.validateValue(zundUnloading,zundChoice.unloadingOpItem);
        }
        //INTERNAL CUTTING - map to choice item and enter answer 
        /*if (userItCutOpAnswer) {
            var intCutInches = cu.getValue(userItCutOpAnswer);
            //must run 2 times: 1 to set operation, 2 to set answer value
            //pu.validateValue(fields.operation179, zundChoice.intCutOpItem);
            if (fields.operation179_answer) {
                pu.validateValue(fields.operation179_answer, intCutInches);
            }
        } */
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
    printConfig.zundFactor = result;
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
function setZundInCutOp(cutMethod, zundChoice) {
    //TO BE REWRITTEN WITH NEW OPERATIONS ASKING LINEAR INCH
    var intCutOp = fields.operation112;
    var intCutBladeOptions = [
        455,  // Complex_Blade
        454  // Simple_Blade
    ]
    var intCutRouteOptions = [
        457,  // Simple_Route
        456   // Complex_Route
    ]
    var intCutSetting = { 
        454 : 457,
        455 : 456
    }
    //trim and only show option for current zund factor
    pu.trimOperationItemNames(112, '_');
    if (zundChoice.rank > 3){
        pu.hideFieldOptions(intCutRouteOptions);
    } else {
        pu.hideFieldOptions(intCutBladeOptions);
    }
    if (cu.hasValue(intCutOp) && cutMethod == 'zund') {
        var intCutItem = cu.getValue(intCutOp);
        //blade cut
        if (zundChoice.rank > 3) {
            if (!(intCutItem in intCutSetting)) {
                for (var key in intCutSetting) {
                    if (intCutSetting[key] == intCutItem) {
                        cu.changeField(intCutOp, key, true);
                    }
                }
            }
        } 
        //Route Cut
        else {
            if (intCutItem in intCutSetting) {
                cu.changeField(intCutOp, intCutSetting[intCutItem], true);
            }
        }
    } else {
        if (cu.hasValue(intCutOp)) {
            cu.changeField(intCutOp,'',true);
        }
    }
}
function setOutsourceCutOps(cutMethod) {
    var outsourceCutOp = fields.operation104;
    if (cutMethod =='outsourcedCut') {
        //outourced cut set to default if nothing chosen yet
        if (!cu.hasValue(outsourceCutOp)) {
            cu.changeField(outsourceCutOp,412,true);
        }
    } else {
        pu.removeOperationItemsWithString(104,'Cut');
        if (cu.getSelectedOptionText(outsourceCutOp).indexOf('Cut') != -1) {
            cu.changeField(outsourceCutOp,'', true);
        }
    }
}
function setMCTCutOp(cutMethod) {
    var mctCutting = fields.operation127;
    var mctLoading = fields.operation128;
    var mctUnloading = fields.operation129;
    if (cutMethod != 'mct') {
        pu.validateValue(mctCutting,'');
    }
}
function setFabCutOp(cutMethod, product) {
    var fabCutOp = fields.operation116;
    if (cutMethod == 'fabCut') {
        //show TBG Fab Cut and Turn on Premask when Laser selected
        if (cu.getPjcId(product) == 389) {
            pu.removeClassFromOperation(116, 'planning');
            if (!cu.hasValue(fabCutOp)) {
                onQuoteUpdatedMessages+= '<p>Please select a Cutting Option in the TBG-Fab Cut operation.</p>'
            }
            if (cu.getValue(fabCutOp) == 508) {
                if (!cu.hasValue(fields.operation78)) {
                    onQuoteUpdatedMessages += '<p>Fab Laser Cut requires a Premask.  This has been chosen on your behalf.</p>';
                    cu.changeField(fields.operation78, 291, true);
                }
            }
        } else {  //or default to CNC Cut if not Finishing only
            if (cu.getValue(fabCutOp) != 478) {
                cu.changeField(fabCutOp, 478, true);
            }
        }
    } else if (cu.hasValue(fabCutOp)) {
        cu.changeField(fabCutOp, '', true);
    }
}
function setNoCutOp(cutMethod) {
    var noCutOp = fields.operation110;
    if (cutMethod == 'noCutting' || cutMethod == 'suma') {
        //validate user Declare cut operation set to No Cutting
        pu.validateValue(fields.operation111,450);
        pu.validateValue(noCutOp,448);
    } else {
        pu.validateValue(noCutOp,'');
    }
}
/*** END CUTTING */

function setInkMaterialCosts() {
    // ALIGN INK MATERIAL COSTS WITH DEVICE RUN
    var deviceId = configureglobals.cquotedata.device.id ? configureglobals.cquotedata.device.id : null;
    var lfDeviceInk = {
        45 : {
            'inkMaterialOpId' : 132,
            'inkMaterialOpIdSide2' : 136,
            'inkConfigOpSide2' : 137,
            'defaultOpItem' : 608, //TBG Vutek HS125
            'defaultInkConfigSide2OpItem' : 641 //TBG Vutek HS125
        },
        46 : {
            'inkMaterialOpId' : 133,
            'defaultOpItem' : 622 //CMYK
        },
        54 : {
            'inkMaterialOpId' : 143,
            'defaultOpItem' : 720 //CMYK
        }
    }
    var devRunConfig = lfDeviceInk[deviceId];
    if (devRunConfig) {
        var inkMatOp = fields['operation' + devRunConfig.inkMaterialOpId];
        var defaultInkOpItem = lfDeviceInk[deviceId].defaultOpItem ? lfDeviceInk[deviceId].defaultOpItem : null;
        var inkMatOpSide2 = fields['operation' + devRunConfig.inkMaterialOpIdSide2];
        var inkConfigOpSide2 = devRunConfig.inkConfigOpSide2 ? fields['operation' + devRunConfig.inkConfigOpSide2] : null;
        var defaultInkConfigSide2OpItem = lfDeviceInk[deviceId].defaultInkConfigSide2OpItem ? lfDeviceInk[deviceId].defaultInkConfigSide2OpItem : null;
        //Grab op item id from operation Item Keys object. If nothing, then use default
        var inkMatOpItemId = operationItemKeys.inkMatOpItem ? operationItemKeys.inkMatOpItem : defaultInkOpItem;
        var inkMatOpSide2ItemId = operationItemKeys.inkMatOpItemSide2 ? operationItemKeys.inkMatOpItemSide2 : '';
        if (cu.getValue(inkMatOp) != inkMatOpItemId) {
            pu.validateValue(inkMatOp, inkMatOpItemId);
        }
        //side 2
        if (inkConfigOpSide2) {
            if (cu.getValue(fields.sides) == "2") {
                //default if sides was last changed
                if (!cu.hasValue(inkConfigOpSide2)) {
                    pu.validateValue(inkConfigOpSide2, defaultInkConfigSide2OpItem);
                }
                if (operationItemKeys.inkMatOpItemSide2) {
                    pu.validateValue(inkMatOpSide2,inkMatOpSide2ItemId);
                }
                cu.showField(inkConfigOpSide2);
            } else {
                pu.validateValue(inkConfigOpSide2, ''); 
                pu.validateValue(inkMatOpSide2, ''); 
                cu.hideField(inkConfigOpSide2);
            }
        } 
    }
}

function setLamRunOps(quote, config) {
    if (!config) {
        return 
    }
    var lamLfWithSpoilage = config.details.lamLfWithSpoilage
    var hasFrontLam = cu.hasValue(fields.frontLaminate);
    var hasBackLam = cu.hasValue(fields.backLaminate);
    var hasMount = cu.hasValue(fields.mountSubstrate);

    var laminatingRun = fields.operation96;
    var laminatingRunAnswer = fields.operation96_answer;
    var laminatingRun2 = fields.operation141;
    var laminatingRunAnswer2 = fields.operation141_answer;
    var laminatingRun3 = fields.operation153;
    var laminatingRunAnswer3 = fields.operation153_answer;
    var premask = fields.operation78;
    var premaskRunAnswer = fields.operation78_answer;
    var rollChangeOp = fields.operation154;
    var rollChangeOpAnswer = fields.operation154_answer;

    var frontLamType = (hasFrontLam && quote.piece.frontLaminate) ? quote.piece.frontLaminate.type.name : null;
    var backLamType = (hasBackLam && quote.piece.backLaminate) ? quote.piece.backLaminate.type.name : null;

    var hasColdFront = frontLamType == 'Cold';
    var hasColdBack = backLamType == 'Cold';
    var hasHotFront = frontLamType == 'Hot';
    var hasHotBack = backLamType == 'Hot';
    var hasAdhesiveBack = backLamType == 'Adhesive';
    var hasAdhesiveFront = frontLamType == 'Adhesive';
    var hasPremask = cu.hasValue(fields.operation78);
    var selfAdhesive = configureglobals.cprintsubstratesmgr.choice ? configureglobals.cprintsubstratesmgr.choice.selfAdhesive : false;

    var invalidLamMessage = '<p>The mounting and laminating choices in this job is not valid.  If you need this configuration please consult Estimating and/or Planning</p>';
    if (hasMount || hasFrontLam || hasBackLam || hasPremask) {
        if (hasMount) {
            if (hasPremask) {
                if (!hasFrontLam && !hasBackLam) { 
                    if (selfAdhesive) {  // 1. Mount  2. Premask 
                        pu.validateValue(laminatingRun, 712);
                        pu.validateValue(laminatingRun2,716);
                        pu.validateValue(laminatingRun3,'');
                    } else { // 1. Adhesive  2. Mount + Premask
                        pu.validateValue(laminatingRun, 706);
                        pu.validateValue(laminatingRun2, 717);
                        pu.validateValue(laminatingRun3,'');
                    }
                } else if (hasHotFront) { 
                    if (selfAdhesive) { // 1. Mount  2. Hot  3. Premask
                        pu.validateValue(laminatingRun, 710);
                        pu.validateValue(laminatingRun2, 718);
                        pu.validateValue(laminatingRun3,'');
                    }
                    else { //  1. Hot / Adhesive  2. Mount + Premask
                        pu.validateValue(laminatingRun, 709);
                        pu.validateValue(laminatingRun2, 717);
                        pu.validateValue(laminatingRun3,'');
                    }
                } else if (hasColdFront) {
                    if (selfAdhesive) { // 1. Cold  2.  Mount  3. Premask
                        pu.validateValue(laminatingRun, 363);
                        pu.validateValue(laminatingRun2, 716);
                        pu.validateValue(laminatingRun3, 758);
                    }
                    else { //  1. Cold / Adhesive  2. Mount + Premask
                        pu.validateValue(laminatingRun, 708);
                        pu.validateValue(laminatingRun2, 717);
                        pu.validateValue(laminatingRun3, '');
                    }
                }
            } else {  //mounted but no premask
               if (!hasFrontLam && !hasBackLam) { 
                    if (selfAdhesive) {  // 1. Mount 
                        pu.validateValue(laminatingRun, 710);
                        pu.validateValue(laminatingRun2,'');
                        pu.validateValue(laminatingRun3,'');
                    } else { // 1. Adhesive  2. Mount
                        pu.validateValue(laminatingRun, 706);
                        pu.validateValue(laminatingRun2, 716);
                        pu.validateValue(laminatingRun3,'');
                    }
                } else if (hasHotFront) { 
                    if (selfAdhesive) { // 1. Mount  2. Hot 
                        pu.validateValue(laminatingRun, 710);
                        pu.validateValue(laminatingRun2, 715);
                        pu.validateValue(laminatingRun3,'');
                    }
                    else { //  1. Hot / Adhesive  2. Mount
                        pu.validateValue(laminatingRun, 709);
                        pu.validateValue(laminatingRun2, 716);
                        pu.validateValue(laminatingRun3,'');
                    }
                } else if (hasColdFront) {
                    if (selfAdhesive) { // 1. Mount  2. Cold 
                        pu.validateValue(laminatingRun, 710);
                        pu.validateValue(laminatingRun2, 714);
                        pu.validateValue(laminatingRun3,'');
                    }
                    else { //  1. Cold / Adhesive  2. Mount
                        pu.validateValue(laminatingRun, 708);
                        pu.validateValue(laminatingRun2, 716);
                        pu.validateValue(laminatingRun3,'');
                    }
                }
            }
        } else {  //everything not mounted
            if (hasPremask) {
                if (hasHotFront) {
                    if (hasAdhesiveBack) { // 1. Hot / Adhesive 2. Premask
                        pu.validateValue(laminatingRun, 709);
                        pu.validateValue(laminatingRun2,718);
                        pu.validateValue(laminatingRun3,'');
                    } else if (hasHotBack) { // 1. Hot / Hot 2. Premask
                        pu.validateValue(laminatingRun, 364);
                        pu.validateValue(laminatingRun2,718);
                        pu.validateValue(laminatingRun3,'');
                    }
                } else if (hasColdFront) {
                    if (hasColdBack) {  // 1. Cold  2. Cold 3. Premask
                        pu.validateValue(laminatingRun, 363);
                        pu.validateValue(laminatingRun2, 714);
                        pu.validateValue(laminatingRun3, 758);
                    } else if (hasAdhesiveBack) { // 1. Cold / Adhesive 2. Premask
                        pu.validateValue(laminatingRun, 708);
                        pu.validateValue(laminatingRun2,718);
                        pu.validateValue(laminatingRun3,'');
                    } else { // 1. Cold  2. Pre-mask
                        pu.validateValue(laminatingRun, 363);
                        pu.validateValue(laminatingRun2,718);
                        pu.validateValue(laminatingRun3,'');
                    }
                } else if (hasAdhesiveBack) { // 1. Adhesive  2. Premask
                    pu.validateValue(laminatingRun, 706);
                    pu.validateValue(laminatingRun2,718);
                    pu.validateValue(laminatingRun3,'');
                } else { // 1. Premask
                    pu.validateValue(laminatingRun, 712);
                    pu.validateValue(laminatingRun2,'');
                    pu.validateValue(laminatingRun3,'');
                }
            } else {  // no mount, no premask
                if (hasHotFront) {
                    if (hasHotBack) { // 1. Hot / Hot
                        pu.validateValue(laminatingRun, 364);
                        pu.validateValue(laminatingRun2,'');
                        pu.validateValue(laminatingRun3,'');
                    } else if (hasAdhesiveBack) {  // 1. Hot / Adhesive
                        pu.validateValue(laminatingRun, 709);
                        pu.validateValue(laminatingRun2,'');
                        pu.validateValue(laminatingRun3,'');
                    } else {
                        onQuoteUpdatedMessages += invalidLamMessage;
                    }
                } else if (hasColdFront) {
                    if (hasColdBack) {  // 1. Cold  2. Cold
                        pu.validateValue(laminatingRun, 363);
                        pu.validateValue(laminatingRun2, 714);
                        pu.validateValue(laminatingRun3,'');
                    } else if (hasAdhesiveBack) {  // 1. Cold / Adhesive
                        pu.validateValue(laminatingRun, 708);
                        pu.validateValue(laminatingRun2,'');
                        pu.validateValue(laminatingRun3,'');
                    } else {  // 1. Cold
                        pu.validateValue(laminatingRun, 363);
                        pu.validateValue(laminatingRun2,'');
                        pu.validateValue(laminatingRun3,'');
                    }
                } else if (hasAdhesiveBack) { // 1. Adhesive
                    pu.validateValue(laminatingRun, 706);
                    pu.validateValue(laminatingRun2,'');
                    pu.validateValue(laminatingRun3,'');
                } else if (hasColdBack) {  // 1.colc
                    pu.validateValue(laminatingRun, 363);
                    pu.validateValue(laminatingRun2, '');
                    pu.validateValue(laminatingRun3, '');
                }
            }
        }
        
        if (lamLfWithSpoilage) {
            if (cu.hasValue(laminatingRun)) {
                if (laminatingRunAnswer) {
                    pu.validateValue(laminatingRunAnswer, lamLfWithSpoilage);
                }
            }
            if (cu.hasValue(laminatingRun2)) {
                if (laminatingRunAnswer2) {
                    pu.validateValue(laminatingRunAnswer2, lamLfWithSpoilage);
                }
            }
            if (cu.hasValue(laminatingRun3)) {
                if (laminatingRunAnswer3) {
                    pu.validateValue(laminatingRunAnswer3, lamLfWithSpoilage);
                }
            }
        }
    } else {
        pu.validateValue(laminatingRun, '');
        pu.validateValue(laminatingRun2,'');
        pu.validateValue(laminatingRun3,'');
    }
    var rollChangeMins = getLamRollChangeOp(config.materials);
    if (rollChangeMins > 0) {
        pu.validateValue(rollChangeOp, 760);
        pu.validateValue(rollChangeOpAnswer, rollChangeMins);
    } else {
        pu.validateValue(rollChangeOp,'');
    }
}
function getLamRollChangeOp(materials) {
    var result = 0;
    var rollChanges = 0;
    var minutesPerChange = 15;
    var hasAdhesive = false;
    for (mat in materials) {
        if (mat != 'aPrintSubstrate' && mat != 'bPrintSubstrate') {
            rollChanges += materials[mat].rollChanges ? materials[mat].rollChanges : 0;
        }
    }
    result = minutesPerChange * rollChanges;
    return result
}

function canonBacklitLogic(updates, product) {
    if (cu.getPjcId(product) == 94) {
        // add Ink Configuration and Lam for Kodak Backlit
        var inkConfig = fields.operation72;
        if (cu.getValue(fields.printSubstrate) == 131) {
            if (cu.isLastChangedField(updates, fields.printSubstrate)) { 
                if (!cu.hasValue(fields.frontLaminate) || !cu.getValue(fields.frontLaminate)) {
                    onQuoteUpdatedMessages += '<p>Front and Back Laminating is suggested for Kodak Backlit Graphics.  Please add Laminating options.</p>';
                }
            }
            if (cu.getValue(inkConfig) != 264) {
                cu.changeField(inkConfig, 264, true);
            }
            cu.disableField(inkConfig);
        }
        else if (cu.getValue(inkConfig) == 264) {
            cu.enableField(inkConfig);
            cu.changeField(inkConfig, '', true);
        }
    }
}

function canvasOperationDisplay() {
    var canvasSubstrates = [
        '144',  //6.5oz. Ultraflex Mult-tex Canvas
        '83'   //Canvas - Matte Finish
    ]
    var canvasOperations = [
        65, //TBG Canvas Frame Assembly
        66  //TBG Canvas Stretching
    ]
    //hide operations only pertaining to canvas substrates
    if (!cu.isValueInSet(fields.printSubstrate, canvasSubstrates)) {
        pu.addClassToOperation(canvasOperations, 'planning');
        pu.validateValue(fields.operation65,'');
        pu.validateValue(fields.operation66,'');
    }
}

function bannerFinishingOperationDisplay(product) {
    var substratesWithBannerFinishing = [
        '23',    //13 oz. Scrim Vinyl Matte (for outdoor use)
        '26',    //13 oz. Smooth Vinyl - Opaque Matte (for indoor use)
        '73',    //18 oz. Smooth Vinyl - Opaque Matte (for heavy duty outdoor use)
        '114',   //8 oz. Mesh
        '167',    //15 oz. Smooth Vinyl Banner
        '146',     //Berger Samba Fabric 6.87oz.
        '210',  //SBR-DURA-WHT-BLKBK-13OZ-126X164
        '100',  //Ultraflex Poplin 7oz.
        '177',   //Verseidag Nightdrop 10oz.
        '125',   //ULTRAFLEX-MULTITEX 220-6.5OZ CANVAS-122"X164'-3257
        '175',   //3.4oz. Aberdeen Soft Flag
        '171',   //4.5oz. Aberdeen Simplicity
        '170',   //Aberdeen Outdoor Flag
        '173',   //Aberdeen Luminary 9111
        '174',   //Aberdeen Trinity
        '172',   //Top Value Heavy Knit
        '270',   //Heavy Kit Fabric - Top Value 7.3oz
        '394'    //Aberdeen Triple White
    ]
    var bannerFinishingOperations = [
        60,   //TBG Grommets
        61,   //TBG Hemming
        62,   //TBG Pole Pockets
        63,   //TBG Keder Sewing
        73    //TBG Grommet Color
    ]
    //always show with Dye Sub materials
    if (cu.getPjcId(product) == 450) {
        return;
    }
    //hide operstions if substrate not in list
    if (!cu.isValueInSet(fields.printSubstrate, substratesWithBannerFinishing)) {
        pu.addClassToOperation(bannerFinishingOperations, 'planning');
    } else {
        pu.removeClassFromOperation(bannerFinishingOperations, 'planning');
    }

    //clearOperations(bannerFinishingOperations)  --FUTURE PM CALCUTILS
}
function bannerStandLogic() {
    //Only show Banner stands with 13 oz scrim or smooth
    var bannerStandMaterial = [
        '23',    //13 oz. Scrim Vinyl Matte (for outdoor use)
        '26',    //13 oz. Smooth Vinyl - Opaque Matte (for indoor use)
        '73'    //18 oz. Smooth Vinyl - Opaque Matte (for heavy duty outdoor use)
    ]
    var bannerStandOp = fields.operation75;
    if (bannerStandOp) {
        if (!cu.isValueInSet(fields.printSubstrate, bannerStandMaterial)) {
            //cu.hideField(bannerStandOp);
            pu.addClassToOperation(75,'planning');
            if (cu.hasValue(bannerStandOp)) {
                onQuoteUpdatedMessages += '<p>Banners stands can only be ordered with 13 oz Vinyl.</p>';
                cu.changeField(bannerStandOp,'',true);
            }
        } else {
            pu.removeClassFromOperation(75,'planning');
        }
    }
}

function checkSidesOpConflicts(quote) {
    /*** NOT FULLY BUILT OUT.  JUST SUPPORTS BANNER HEMS AND POLE POCKETS*/
    var sameSideMessage = '';
    if (cu.hasValue(fields.operation61) && cu.hasValue(fields.operation62)) {
        var operationDetails = getSideOperationDetails(quote);   //Building inside validation function.... can't figure out why not working
        var sameSideMessage = validateOpSidesNotTheSame(operationDetails,61,62);
        if (sameSideMessage != '') {
            onQuoteUpdatedMessages += sameSideMessage;
        }
    }
}
function getSideOperationDetails(quote) {
    var ops = quote.operationQuotes;
    var result = {};
    for (var i = 0; i < ops.length; i++) {
        var opId = ops[i].operation.id;
        var data = ops[i].data;
        result['op' + opId] = {
            'id' : opId,
            'name' : ops[i].operation.heading,
            'left' : data.leftSide,
            'right' : data.rightSide,
            'bottom' : data.bottomSide,
            'top' : data.topSide
        }
    } 
    return result
}
function validateOpSidesNotTheSame(opDetails, op1, op2) {
    var object1 = opDetails['op' + op1];
    var object2 = opDetails['op' + op2];
    var sidesMatch = [];
    var message = '';
    for (var key in object1) {
        if (object1[key] == true && object2[key] == true) {
            sidesMatch.push(key);
        }
    }
    if (sidesMatch.length > 0) {
        message += '<p>The following sides match for operations ' + object1['name'] + ' and ' + object2['name'] + ' : ' 
            + sidesMatch.join(', ') + '.</p><p>Please make adjustments as these operations cannot be done on the same sides.</p>';
    }
    return message
}

function setVinylCuttingRules() {
    var sumaCuttingOp = fields.operation82;
    var weedingOp = fields.operation94;
    var premaskOp = fields.operation78;
    var cuttingDesc = {
        302: 356 , //simple
        355: 357,  //Complex
        '' : ''
    }
    if (sumaCuttingOp && weedingOp) {
        var cuttingChoice = cu.getValue(sumaCuttingOp);
        var weedingResult = cuttingDesc[cuttingChoice];
        if (cu.getValue(weedingOp) != weedingResult) {
            cu.changeField(weedingOp, weedingResult, true);
        }
        if (premaskOp) {
            if (cu.hasValue(sumaCuttingOp)) {
                if (cu.getValue(premaskOp) != 361) {
                    cu.changeField(premaskOp,361,true);
                }
                cu.disableField(premaskOp);
            } else {
                cu.enableField(premaskOp);
            }
        }
        cu.disableField(weedingOp);
    }
}

function fluteDirectionRules() {
    var fluteDirectionOp = fields.operation101;
    var flutedSubstrateNames = [
        'Coroplast',
        'Flute'
    ]
    if (fluteDirectionOp) {
        var hasFlutes = false;
        var mountSubstrateName = $('#mountSubstrates select[name="MOUNTSUBSTRATEDD"] option:selected').text();
        var printSubstrateName = $('#printSubstrates select[name="PRINTSUBSTRATEDD"] option:selected').text();
        for (names in flutedSubstrateNames) {
            if (printSubstrateName.indexOf(flutedSubstrateNames[names]) != -1) {
                hasFlutes = true;
            }
            if (mountSubstrateName.indexOf(flutedSubstrateNames[names]) != -1) {
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
                return
            }
        }
    }
}

function backlitDoubleStike() {
    var vutekInks = fields.operation52;
    var utrlaCanvasBacklitInks = [
        '241'  //Backlit (Double Strike)
    ]
    if (vutekInks) {
        if (cu.getValue(fields.printSubstrate) == 308) {
            if (!cu.isValueInSet(vutekInks, utrlaCanvasBacklitInks)) {
                cu.changeField(vutekInks, utrlaCanvasBacklitInks[0], true);
            }
        } else {
            if (cu.isValueInSet(vutekInks, utrlaCanvasBacklitInks)) {
                onQuoteUpdatedMessages += '<p>Double Strike backlit ink is only available on the Ultra Canvas Backlit.</p>';
                cu.changeField(vutekInks,261, true);
            }
        }
    }
}

function heatBendingRules() {
    var heatBendingOp = fields.operation117;
    var substratesThatCanHeatBend =[
        '4',     //Styrene 020
        '5',     //Styrene 030
        '178',   //Styrene 015
        '59',    //Expanded PVC Foamboard - .125in-3mm - White
        '188',   //Expanded PVC Foamboard 2 MM - White
        '113',   //Expanded PVC Foamboard 1 MM - White
        '117',   //Expanded PVC Foamboard - .125in-3mm - Black
        '354',   //Acrylic Clear Extruded .118
        '417',   //Acrylic Black Extruded .118"
        '39',   //PETG .020
        '158',   //PETG .030
        '40',   //PETG .040
        '199',   //PETG .040 Non-Glare
        '41',   //PETG .060
        '69',   //PETG .080
        '159'   //PETG .118
    ]
    if (heatBendingOp) {
        if (cu.hasValue(heatBendingOp)) {
            //cannot exceed 100 pieces
            if (cu.getTotalQuantity() > 100) {
                onQuoteUpdatedMessages += '<p>Heat Bending is limited to 100 pieces.  This option has been removed from your selects.</p>';
                cu.changeField(heatBendingOp,'', true);
            }
            //No PreLam, Lam, Mount or Adhesive can be applied
            if (hasFrontLam || hasBackLam || cu.hasValue(fields.mountSubstrate)) {
                onQuoteUpdatedMessages += '<p>Heat Bending cannot be chosen with Laminating or mounting</p>';
                cu.changeField(heatBendingOp,'',true);
            }
            if (cu.hasValue(fields.operation84) || cu.hasValue(fields.operation67)) {
                onQuoteUpdatedMessages += '<p>Heat Bending cannot be chosen with Laminating or mounting</p>';
                cu.changeField(heatBendingOp,'',true);
            }
            //Neight side can be lower than 36"
            if (cu.getWidth() > 36 || cu.getHeight() > 36) {
                onQuoteUpdatedMessages += '<p>Heat Bending cannot be chosen with either side longer than 36"</p>';
                cu.changeField(heatBendingOp,'',true);
            }
            //
            if (substratesThatCanHeatBend.indexOf(cu.getValue(fields.printSubstrate)) == -1) {
                onQuoteUpdatedMessages += '<p>Heat Bending can only be chosen for Styrene, EPVC, Acrylic, or PETG in calipers less than .125" (3MM).</p>';
                cu.changeField(heatBendingOp,'',true);
            }
        }
    }
}

function fabrivuLogic(product) {
    var fabrivuDirectMaterials = [
        '398'   //Berger Flag Fabric White 4oz
    ]
    var dyeSubTransferOp = fields.operation88;
    if (cu.getPjcId(product) == 450) {
        //Choose none option for dye sub transfer material if substrate in list
        if (cu.isValueInSet(fields.printSubstrate,fabrivuDirectMaterials)) {
                pu.validateValue(dyeSubTransferOp, 442, true);
        } else {
            pu.validateValue(dyeSubTransferOp, 428, true);
        }
    }
}

function colorCritical() {
    var colorCriticalOp = fields.operation130;
    var colorCriticalDevice = fields.operation131;
    if (colorCriticalOp && colorCriticalDevice) {
        if (cu.hasValue(colorCriticalOp)) {
            cu.showField(colorCriticalDevice);
            cu.setLabel(colorCriticalOp,"Color Critical - please indicate job # below");
            if (cu.getValue(colorCriticalOp) == 592) {
                cu.setLabel(colorCriticalOp,"Color Critical (Enter in Job # To Match Below)");
            }
        } else {
            if (cu.hasValue(colorCriticalDevice)) {
                cu.changeField(colorCriticalDevice,'',true);
            }
            cu.hideField(colorCriticalDevice);
            cu.setSelectedOptionText(colorCriticalOp,'No');
        }
    }
}

function hardProofCheck(quote) {
    if (!window.hardProofMessageCount) {
        window.hardProofMessageCount = 0
    }
    // do not run if user is admin
    if ($('#page').hasClass('userIsAdministrator')) {
        return
    }
    var pieceWidth = quote.piece.width;
    var pieceHeight = quote.piece.height;
    var totalSquareFeet = (pieceWidth * pieceHeight * cu.getTotalQuantity())/144;
    var proofOp = fields.proof;
    var proofSelection = configureglobals.cquotedata.proof.name;
    if (totalSquareFeet >= 700) {
        if (hardProofMessageCount == 0) {
            if (proofSelection.indexOf('Hard') == -1) {
                onQuoteUpdatedMessages += '<p>Jobs with a printable area over 700 square feet require to have a hard proof. We have changed the proofing option on your behalf.  Please remove if it is not required by your customer.</p>';
                pu.showMessages();
                hardProofMessageCount = 1;
                cu.changeField(proofOp, 40, true);
            }
        } 
    }
}

function setSpecialMarkupOps(quote) {
    //calculates job costs and inserts into special costing operation answers
    var teamCost = getOperationPrice(quote, 139);
    var specCustCost = getOperationPrice(quote, 152);
    var jobCost = parseInt((quote.jobCostPrice + quote.operationsPrice - teamCost - specCustCost));
    if (cu.hasValue(fields.operation139)) {
        pu.validateValue(fields.operation139_answer, jobCost);
    }
    if (cu.hasValue(fields.operation152)) {
        pu.validateValue(fields.operation152_answer, jobCost);
    }
}
function getOperationPrice(quote, opId) {
    var operationQuotes = quote.operationQuotes;
    for (var i = 0; i < operationQuotes.length; i++) {
        if (operationQuotes[i].operation.id == opId) {
            return operationQuotes[i].price
        }
    }
    return 0;
}

function uiUpdates(product) {
    var planningOnlyOps = [
        99,  //TBGCutting
        55,  //TBGZundCutting
        102,  //TBGGuillotineCutting
        103,  //TBGFotobaCutting
        88,   //DyeSubTransferPaper
        100,  //TBGMountingRun
        112,  //TBGInternalCuts
        110,  //TBGNoCutting
        115,  //TBGPre-cut
        109,  //TBGPre-Sheet
        108,  //TBGPre-Sl
        116,  //TBGTBG-FabCut
        125,  //TBGBucketJob
        127,  //TBGMCTCutting
        134    //TBG Gutter
    ]
    var estimatingOnlyOps = [
        139     //TBG Team Factor
    ]
    var inkOpsWithDPI = [
        52  //TBG Ink Configuration - Vutek HS100
    ]
    var opsToTrimWithUnderscore = [
        67,  //Pre-Printing Front Laminate
        84,  //Pre-Printing Back Laminate
        58,   //TBG Tape, Mag, Velcro
        78  //LF Premask
    ]
    pu.trimOperationItemNames(inkOpsWithDPI, ' - ');
    pu.trimOperationItemNames(opsToTrimWithUnderscore, '_');
    pu.removeOperationItemsWithString(104,'Print');
    pu.removeClassFromOperation(111,'costingOnly');
    pu.addClassToOperation(planningOnlyOps, 'planning');
    pu.addClassToOperation(estimatingOnlyOps,'estimating');

    canvasOperationDisplay();
    bannerFinishingOperationDisplay(product);
    bannerStandLogic();
}



configureEvents.registerOnCalcLoadedListener(rollCalcLogic);
configureEvents.registerOnCalcChangedListener(rollCalcLogic);
configureEvents.registerOnQuoteUpdatedListener(rollCalcLogic);
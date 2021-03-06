// Message holder
var onQuoteUpdatedMessages = '';
var disableCheckoutReasons = [];

// Operation Item Keys object - in window for testing
var operationItemKeys = new Object();  

// Object for Lam and Mount choices
var printConfig = {};

var cu = calcUtil;
var pu = pmCalcUtil;
var cc = calcConfig;

var calcCount = 0;
var lastUIChangedFieldName = null;

var bucketPjcs = [
    '458',   //*TBG Board Buckets
    '495',   //*TBG Lexjet Buckets
    '496',   //*TBG Banner Buckets
    '499',   //*TBG Ecomedia Buckets
    '551',   //* TBG Backlit Buckets
    '556'   //*TBG Finishing Only Bucket
]

var rollCalcLogic = {
    onCalcLoaded: function(product) {
        cu.initFields();
        uiUpdates(product);

        //run meta field action
        metaFieldsActions.onCalcLoaded();
        //run default team as last function on calcLoaded, will trigger update
        setDefaultTeam();
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
    fotobaBannerCut(product);

    setRollChangeCost(cc.printConfig);

    setInkMaterialCosts();
    setLamRunOps(quote, cc.printConfig);
    setPrePrintLamOps(quote, cc.printConfig);
    canonBacklitLogic(updates, product);
    checkSidesOpConflicts(quote);
    setVinylCuttingRules();
    fluteDirectionRules();
    backlitDoubleStike();
    heatBendingRules(updates);
    fabrivuTransferPaper(product);
    fabrivuBacklitInk();
    colorCritical();
    woodDowelQtyMax();
    setMaterialPackaging(product, updates);
    bucketPrinting(product);
    canvasFrameRestriction(product);

}

function functionsRanAfterFullQuote(updates, validation, product, quote) {
    //require results from Quote update
    hardProofCheck(quote);
    setSpecialMarkupOps(quote);

    //UI changes
    uiUpdates(product);
    renderExtendedCostBreakdown();
    lightingEnvironmentColorWork();

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
    var pjc = configureglobals.clpjc.id;
    var deviceId = cu.getDeviceId();
    var rollChangeOp = fields.operation138;
    var rollChangeOpAnswer = fields.operation138_answer;

    var deviceIdOpItemMap = {
        54 : 1032,  // FabriVu Roll Change
        46 : 1121   // HP/ Canon Roll Change
    }

    var rollChangeOpItem = deviceIdOpItemMap[deviceId] ? deviceIdOpItemMap[deviceId] : 682;

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
        if (rollChangeMins > 0) {
            pu.validateValue(rollChangeOp, rollChangeOpItem);
            pu.updateOperationQuestion(138,'Roll Change Minutes');
        } else { 
            pu.validateValue(rollChangeOp,'');
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
function setCuttingOps(quote, updates, product) {
    var userDeclareCutOp = fields.operation111;
    
    var altCutMethodId = {
        450 : 'noCutting',
        452 : 'outsourcedCut',
        866 : 'outsourceDieCut'
    }
    var altCutMethod = altCutMethodId[cu.getValue(fields.operation111)] ? altCutMethodId[cu.getValue(fields.operation111)] : null;

    //Set To MCT Cut if in MCT Substrate List ONLY.  User Cannot Select this option
    var mctCutSubstrates = [
        '394',  //Aberdeen Triple White
        '482'  //Aberdeen 7599 - White/Black/White
    ]
    var shouldMctCut = cu.isValueInSet(fields.printSubstrate, mctCutSubstrates);
    if (shouldMctCut && !altCutMethod) {
        pu.validateValue(userDeclareCutOp, 808)
    } else {
        if (cu.getValue(userDeclareCutOp) == 808) {
            //default to Zund if set to MCT Cut
            cu.changeField(userDeclareCutOp, 968)
        }
    }

    var setZundCost = altCutMethod ? false : true;  
    var isZundCut = cu.getSelectedOptionText(userDeclareCutOp).indexOf('Zund') != -1;

    setZundOps(quote, setZundCost, isZundCut);
    setAltCutMethod(updates, altCutMethod); 
}
function setZundOps(quote, setZundCost, isZundCut) {
    var zundLoading = fields.operation53;
    var zundCutting = fields.operation55;
    var zundUnloading = fields.operation56;
    
    var zundFactors = {
        "K1" : {"name" : "Knife 1", "loadingOpItem" : 202, "unloadingOpItem" : 201 , "runOpItem": 195, "intCutOpItem": 773, "userChoiceItem" : 968, "rank" : 1},
        "K2" : {"name" : "Knife 2", "loadingOpItem" : 202, "unloadingOpItem" : 201 , "runOpItem": 196, "intCutOpItem": 774, "userChoiceItem" : 969, "rank" : 2},
        "R1" : {"name" : "Router 1", "loadingOpItem" : 204, "unloadingOpItem" : 201 , "runOpItem": 197, "intCutOpItem": 775, "userChoiceItem" : 970, "rank" : 3},
        "R2" : {"name" : "Router 2", "loadingOpItem" : 204, "unloadingOpItem" : 201 , "runOpItem": 198, "intCutOpItem": 776, "userChoiceItem" : 971, "rank" : 4},
        "R3" : {"name" : "Router 3", "loadingOpItem" : 204, "unloadingOpItem" : 201 , "runOpItem": 199, "intCutOpItem": 777, "userChoiceItem" : 972, "rank" : 5},
        "R4" : {"name" : "Router 4", "loadingOpItem" : 204, "unloadingOpItem" : 201 , "runOpItem": 200, "intCutOpItem": 778, "userChoiceItem" : 973, "rank" : 6}
    }

    var zundChoice = getZundChoice(quote, zundFactors);

    if (setZundCost) {
        if (zundChoice) {
            pu.validateValue(zundLoading, zundChoice.loadingOpItem);
            pu.validateValue(zundCutting, zundChoice.runOpItem);
            pu.validateValue(zundUnloading,zundChoice.unloadingOpItem);
        }
    } else {
        pu.validateValue(zundLoading,'');
        pu.validateValue(zundCutting,'');
        pu.validateValue(zundUnloading,'');
        pu.validateValue(fields.operation179,'');
    }

    validateZundOption();
    hideInvalidZundOptions();

    function validateZundOption() {
        if (zundChoice) {
            if (isZundCut) {
                pu.validateValue(fields.operation111, zundChoice.userChoiceItem);
            }

        }
    }
    function hideInvalidZundOptions() {
        pu.addClassToOperationItemsWithString(111,'hide','Zund');
        //show availabel zund option
        $('option[value="' + zundChoice.userChoiceItem + '"]').removeClass('hide');
        pu.trimOperationItemNames(111,'_');
    }
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
function setAltCutMethod(updates, cutMethod) {
    var cuttingOp = fields.operation111;
    var outsourceCutOp = fields.operation104;
    
    if (cutMethod =='outsourcedCut' || cutMethod == 'outsourceDieCut') {
        //outourced cut set to default if nothing chosen yet
        if (cu.isLastChangedField(updates, cuttingOp)) {
            if (!cu.hasValue(outsourceCutOp)) {
                if (cutMethod == 'outsourcedCut') {
                    cu.changeField(outsourceCutOp,412,true);    
                } else if (cutMethod == 'outsourceDieCut') {
                    cu.changeField(outsourceCutOp,463,true);    
                }
            }
        }
    } else {
        pu.removeOperationItemsWithString(104,'Cut');
        if (cu.getSelectedOptionText(outsourceCutOp).indexOf('Cut') != -1) {
            cu.changeField(outsourceCutOp,'', true);
        }
    }
}
function fotobaBannerCut(product) {
    var bannerPjcs = [
        '577', //*TBG Hanging Banners Productization
        '576' //*TBG Retractable Banners Productization
    ]

    var cuttingOp = fields.operation111;
    var defaultZundId = 968;
    var fotobaCutId = 864;
    
    var qty = cu.getTotalQuantity();
    var isOneSided = cu.getValue(fields.sides) > 1 ? false : true;
    
    if (cu.isPjc(product, bannerPjcs)) {
        if (qty > 6 && isOneSided) {
            pu.validateValue(fields.operation111, fotobaCutId);
        } else {
            pu.validateValue(fields.operation111, defaultZundId);
        }
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
        },
        50 : {
            'inkMaterialOpId' : 132,
            'inkMaterialOpIdSide2' : 136,
            'inkConfigOpSide2' : 137,
            'defaultOpItem' : 608, //TBG Vutek HS125
            'defaultInkConfigSide2OpItem' : 641 //TBG Vutek HS125
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
    var lamLfWithSpoilage = config.details.lamLfWithSpoilage;
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
    var premaskChoice = cu.getSelectedOptionText(fields.operation78);
    var hasPremaskSumma = hasPremask ? premaskChoice.indexOf('SUMMA') != -1 : false;
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
                } else if (hasPremaskSumma) { // 1. Premask Summa
                    pu.validateValue(laminatingRun, 1140);
                    pu.validateValue(laminatingRun2,'');
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
    //if cold over cold, then 
    var hasColdOverCold = hasColdFront && hasColdBack;
    var rollChangeMins = getLamRollChangeOp(config.materials, hasColdOverCold);
    if (rollChangeMins > 0) {
        pu.validateValue(rollChangeOp, 760);
        pu.validateValue(rollChangeOpAnswer, rollChangeMins);
    } else {
        pu.validateValue(rollChangeOp,'');
    }

}
function setPrePrintLamOps(quote, config) {
    if (!config) {
        return 
    }
    var lamLfWithSpoilage = config.details.lamLfWithSpoilage;

    var prePrintFrontLamAnswer = fields.operation67_answer;
    var prePrintBackLamAnswer = fields.operation84_answer;
    var premaskAnswer = fields.operation78_answer;

    if (cu.hasValue(prePrintFrontLamAnswer)) {
        pu.validateValue(prePrintFrontLamAnswer, lamLfWithSpoilage);
    }
    if (cu.hasValue(prePrintBackLamAnswer)) {
        pu.validateValue(prePrintBackLamAnswer, lamLfWithSpoilage);
    }
    if (cu.hasValue(premaskAnswer)) {
        pu.validateValue(premaskAnswer, lamLfWithSpoilage);
    }


}

function getLamRollChangeOp(materials, hasColdOverCold) {
    var result = 0;
    var rollChanges = 0;
    var minutesPerChange = 15;
    var hasAdhesive = false;
    for (mat in materials) {
        if (mat != 'aPrintSubstrate' && mat != 'bPrintSubstrate') {
            //if cold over cold then add times together, otherwise take largest (will do on same run)
            var materialRollChanges = materials[mat].rollChanges ? materials[mat].rollChanges : 0;
            if (hasColdOverCold) {
                rollChanges += materialRollChanges;
            } else {
                rollChanges = Math.max(rollChanges, materialRollChanges)
            }
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
    //Skip if no Print SUbstrate chosen
    if (!fields.printSubstrate) {
        return
    }
    //hide operations only pertaining to canvas substrates
    if (!cu.isValueInSet(fields.printSubstrate, canvasSubstrates)) {
        pu.addClassToOperation(canvasOperations, 'planning');
        pu.validateValue(fields.operation65,'');
        pu.validateValue(fields.operation66,'');
    }
}
function woodDowelQtyMax() {
    var woodDowelOp = fields.operation172;
    if (cu.hasValue(woodDowelOp)) {
        var pieceQty = cu.getTotalQuantity();
        var dowelQty = cu.getValue(fields.operation172_answer);
        if ( (pieceQty * dowelQty) > 200 ) {
            onQuoteUpdatedMessages += '<p>Your total Dowel quantity for this job is over 200.  Please route this finishing operation through Central Estimating or Purchasing</p>';
            cu.changeField(woodDowelOp,'', true);
        }
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
        '394',    //Aberdeen Triple White
        '399',  //Aberdeen Soft Knit 4.5oz
        '421',  //Aberdeen Heavy Knit 10oz
        '207'     //Buy-out
    ]
    var bannerFinishingOperations = [
        60,   //TBG Grommets
        61,   //TBG Hemming
        62,   //TBG Pole Pockets
        //63,   //TBG Keder Sewing
        73    //TBG Grommet Color
    ]
    //always show with Dye Sub materials
    if (cu.getPjcId(product) == 450) {
        return;
    }
    //do not run if no substrate field 
    if (!fields.printSubstrate) {
        return
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
        '73',    //18 oz. Smooth Vinyl - Opaque Matte (for heavy duty outdoor use)
        '357',   //Ecomedia 8mil - Roll
        '508'   //Synthetic Paper 8mil - White (replaced Ecomedia)
    ]
    //do not run if no substrate field 
    if (!fields.printSubstrate) {
        return
    }
    var bannerStandOp = fields.operation75;
    if (bannerStandOp) {
        if (!cu.isValueInSet(fields.printSubstrate, bannerStandMaterial)) {
            //cu.hideField(bannerStandOp);
            pu.addClassToOperation(75,'planning');
            if (cu.hasValue(bannerStandOp)) {
                onQuoteUpdatedMessages += '<p>Banners stands can only be ordered with Vinyl or Ecomedia.</p>';
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
        'Flute',
        'Brushed Silver'
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

function heatBendingRules(updates) {
    
    var heatBendMessage = '';
    var totalBends = 0;

    var heatBendingOpIds = [117, 162];
    var heatBendingOpVert = fields.operation117;
    var heatBendingOpVert_answer = fields.operation117_answer;
    var heatBendingOpHoriz = fields.operation162;
    var heatBendingOpHoriz_answer = fields.operation162_answer;
    var customHeatBendOpItem = 800;
    
    var substratesThatCanHeatBend =[
        '207',   //Buy-out
        '5',    //Styrene 030
        '211',     //Styrene 040
        '221',     //Styrene 060
        '7',     //Styrene 080
        '191',   //Styrene 040 Black
        '192',   //Styrene 060 Black
        '380',   //EPVC Komatex - White - 3mm
        '390',    //EPVC Sintra - black - 3mm
        '386',   //EPVC Sintra - White - 1mm
        '391',   //EPVC Sintra - White - 3mm
        '388',   //EPVC Sintra - White - 2mm
        '385',   //EPVC Komatex - White - 1mm
        '379',   //EPVC Komatex - Black - 3mm
        '59',    //Expanded PVC Foamboard - .125in-3mm - White
        '188',   //Expanded PVC Foamboard 2 MM - White
        '113',   //Expanded PVC Foamboard 1 MM - White
        '117',   //Expanded PVC Foamboard - .125in-3mm - Black
        '354',   //Acrylic Clear Extruded .118
        '417',   //Acrylic Black Extruded .118"
        '158',  //PETG .030
        '40',    //PETG .040
        '199',   //PETG .040 Non-Glare
        '41',    //PETG .060
        '69',    //PETG .080
        '159',    //PETG .118
        '8',    //Styrene 125"
        '487',  //Styrene 030
        '486',  //Styrene 040
        '562',  //Styrene 060
        '54', //Expanded PVC Foamboard - 6mm - White"
        '116', //Expanded PVC Foamboard - 6mm - Black"
        '129', //Optix Acrylic .220 Clear"
        '193', //Styrene 125 Black"
        '229', //Acrylic Clear Frosted 2 sides DP95 .236"
        '230', //Acrylic Clear Extruded .220"
        '382', //EPVC Komatex - Black - 6mm"
        '384' //EPVC Sintra - White - 6mm"
    ]
    var mountsThatCanHeatBend = [
        '65',    //Buy-out
        '61',    //EPVC - 1mm - White
        '71',    //EPVC - 2mm - White
        '46',    //EPVC - 3mm - Black
        '124',    //EPVC - 3mm - Black
        '32',    //EPVC - 3mm - White
        '98',    //PETG .080 Clear
        '1',     //Styrene 040
        '49',    //Styrene 040 Black
        '6',     //Styrene 060
        '50',    //Styrene 060 Black
        '7',    //Styrene 080
        '58',    //Styrene 080 Black
        '82',    //Acrylic Black Cast .118
        '102',    //Acrylic Clear Cast .118
        '8',    //Styrene 125"
        '28', //EPVC - 6mm - White"
        '37', //EPVC - 6mm - Black"
        '51', //Styrene 125 Black"
        '105' //Optix DA Clear .220"

    ]
    var thinHeatBendSubstrates = [
        '385',   //EPVC Komatex - White - 1mm
        '386',   //EPVC Sintra - White - 1mm
        '211',     //Styrene 040
        '199',   //PETG .040 Non-Glare
        '113',   //Expanded PVC Foamboard 1 MM - White`
        '486'   //Styrene 040
    ]


    if (heatBendingOpVert && heatBendingOpHoriz) {
        //Do not allwow with Post printing lam and mounting operations
        //var previousAllowHeatBend = allowHeatBend;
        var allowHeatBend = true;
        var heatBendErrors = [];
        var hasMountLam = cu.hasValue(fields.mountSubstrate) || cu.hasValue(fields.frontLaminate) || cu.hasValue(fields.backLaminate);
        var hasHeatBending = (cu.hasValue(heatBendingOpVert) || cu.hasValue(heatBendingOpHoriz));
        var heatBendLocation = getBendLocation();
        
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
            
            var hasVertMinutes = setHeatBendMinutes(heatBendingOpVert, heatBendingOpVert_answer, nVertBends);
            var hasHorizMinutes = setHeatBendMinutes(heatBendingOpHoriz, heatBendingOpHoriz_answer, nHorizBends, hasVertMinutes);
            pu.hideOperationQuestion(heatBendingOpIds);
            heatBendErrorMessage(heatBendErrors);

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
    function validateJobConfig(op, orientation, hasMountLam) {
        var bendLength = orientation == 'vertical' ? cu.getHeight() : cu.getWidth();
        var hasBuyoutMaterial = (cu.getValue(fields.printSubstrate) == '207' || cu.getValue(fields.mountSubstrate) == '65') ? true : false;
        
        if (bendLength > 48) {
            heatBendErrors.push('Heat bending is not available for pieces with Bend Length longer than 48".');
        }
        if (!cu.isValueInSet(fields.printSubstrate, substratesThatCanHeatBend) && !cu.hasValue(fields.mountSubstrate)) {
            heatBendErrors.push('The Print substrate selected is not able to Heat Bend.');
        } 
        if (cu.hasValue(fields.mountSubstrate) && !cu.isValueInSet(fields.mountSubstrate, mountsThatCanHeatBend)) {
            heatBendErrors.push('The Mount substrate selected is not able to Heat Bend.');
        }
        if (hasMountLam && cu.isValueInSet(fields.printSubstrate, thinHeatBendSubstrates) ) {
            heatBendErrors.push('The substrate selected is not able to Heat Bend with Mount or Laminating.');
        }
        if (hasBuyoutMaterial) {
            heatBendErrors.push('Heat bending for Buy-out materials.');
        } else {
            //bend length must be less than 24" for thin materials
            if (bendLength > 24 && cu.isValueInSet(fields.printSubstrates,thinHeatBendSubstrates)) {
                heatBendErrors.push( 'Substrates with calipers less than .060" must have a bend length 24" or less .');
            }
        }

    }
    function validateLocationValue(op, location) {
        var opChoice = cu.getValue(op);
        // TBG1 (value) : FAB (key)
        var heatBendKeyPairs = {
            821 : 796,  //vertical 1 bend
            820 : 797,  //vertical 2 bend
            804 : 803,  //horizontal 1 bend
            801 : 802  //horizontal 2 bend
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
                pu.validateValue(heatBendingOpVert, customHeatBendOpItem);
                pu.validateValue(heatBendingOpHoriz, '');
                
                var errorMessage = '<p>Heat Bending with this configuration must be estimated through an Fab Estimate Request.</p><div><ul>';
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

function fabrivuTransferPaper(product) {

    //set transfer paper to JETCOL DYE SUB TRANSFER PAPER, but leave none for planning to override
    var dyeSubTransferOp = fields.operation88;
    if (dyeSubTransferOp) {
        pu.validateValue(dyeSubTransferOp, 428, true);
    }
    

    //insert LF needed into Tranfer Paper material and labor operation Answers
    if (!cc.printConfig) { 
        console.log('no printConfig');
        return;
    }
    if (!cc.printConfig.details.valid_quote) {
        console.log('no valid print configs');
        return;
    }

    var totalLf = cc.printConfig.materials.aPrintSubstrate.totalRollLF;
    totalLf = roundTo(totalLf,0);
    if (!totalLf) { return };
    
    var transferMatOpAnswer = fields.operation88_answer;
    if (transferMatOpAnswer) {
        pu.validateValue(transferMatOpAnswer,totalLf);
    }

    var tissueMatOpAnswer = fields.operation155_answer;
    if (tissueMatOpAnswer) {
        pu.validateValue(tissueMatOpAnswer,totalLf);
    }

    var transferLaborAnswer = fields.operation196_answer;
    if (transferLaborAnswer) {
        pu.validateValue(transferLaborAnswer,totalLf);
    }

}
function fabrivuBacklitInk() {
    //if Aberdeen Stretch Knit Backlit selected, change ink operation to Fabrivu Backlit
    var fabrivuInkOp = fields.operation142;
    var fabrivuLaborOp = fields.operation196;
    var backlitSubstrates = [
        '371',    //Aberdeen Stretch Knit Backlit
        '527'    //Berger Starlite Backlit
    ]
    if (fabrivuInkOp) {
        if (cu.isValueInSet(fields.printSubstrate,backlitSubstrates)) {
            pu.validateValue(fabrivuInkOp, 722);
            pu.validateValue(fabrivuLaborOp, 1203);
        } else {
            pu.validateValue(fabrivuInkOp, 719);
            pu.validateValue(fabrivuLaborOp, 1014);
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
            //require color Critical device
            if (!cu.hasValue(colorCriticalDevice)) {
                colorCriticalDevice.css('color','red');
                cu.setSelectedOptionText(colorCriticalDevice,'Select Device...')
                disableCheckoutReasons.push('Please Select Color Critical Device.')
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
function lightingEnvironmentColorWork() {
    var lightEnvOp = fields.operation159;
    if (lightEnvOp) {
        var refId = pu.getMaterialReferenceId('aPrintSubstrate');
        if (stockClassification.clear.indexOf(refId) == -1) {
            cu.hideField(lightEnvOp);
            pu.validateValue(lightEnvOp, '');
        } else {
            cu.showField(lightEnvOp);
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
    //return if first time through calculator (re-configuration or Re-order)
    if (calcCount == 1) {
        hardProofMessageCount = 1;
        return
    }
    var pieceWidth = quote.piece.width;
    var pieceHeight = quote.piece.height;
    var totalSquareFeet = (pieceWidth * pieceHeight * cu.getTotalQuantity())/144;
    var proofOp = fields.proof;
    var proofSelection = configureglobals.cquotedata.proof.name;
    
    var hardProofOptions = [
    '40', //Printed Hard Proof - Internal
    '43', //Printed Hard Proof - External
    '48', //Prototype Proof - External
    '51',  //Prototype Proof - Internal
    '50'    //Printed Hard Proof - Unknown Quantity
    ]
    if (totalSquareFeet >= 700) {
        if (hardProofMessageCount == 0) {
            if (!cu.isValueInSet(proofOp, hardProofOptions)) {
                onQuoteUpdatedMessages += '<p>Jobs with a printable area over 700 square feet require to have a hard proof. We have changed the proofing option on your behalf.  Please remove if it is not required by your customer.</p>';
                pu.showMessages();
                hardProofMessageCount = 1;
                cu.changeField(proofOp, 40, true);
            }
        } 
    }
}
function setDefaultTeam() {
    //ran only on calculator load
    var teamOp = fields.operation139;
    var tbgTeams = {
        "Team Cindy Johnson" : 687,
        "Team Andrew Clemens" : 689,
        "Team Andrew Dyson" : 690,
        "Team Beth Josub" : 691,
        "Team Craig Omdal" : 692,
        "Team Jayson Hansen" : 1010,
        "Team Jim Olson" : 694,
        "Team John Pihaly" : 695,
        "Team Jordan Feddema" : 696,
        "Team Perry Ludwig" : 697,
        "Team Pete Ludwig" : 698,
        "Team Rick Behncke" : 699,
        "Team Rick Mirau" : 700,
        "Team Tom Manthe" : 1027,
        "Team Tony Jones" : 701,
        "Team Tracy Cogan" : 702,
        "Team Vito Lombardo" : 703
    }
    var userTeam = globalpageglobals.cuser.metadata["Default Team"];
    if (userTeam) {
        var teamId = tbgTeams[userTeam];
        if (teamId) {
            cu.changeField(teamOp, teamId, true);
        } else {
            console.log('User assigned team ' + userTeam + ' not in TBG Team set in logic file.');
        }
    } else {
        console.log('User assigned team not assigned to default team');
    }
}
function setSpecialMarkupOps(quote) {
    //calculates job costs and inserts into special costing operation answers
    
    var teamCost = getOperationPrice(quote, 139);
    var jobCost = Math.round( (quote.jobCostPrice + quote.operationsPrice - teamCost) * 100) / 100;

    var specCustCostAnswer = Math.round( (quote.jobCostPrice + quote.operationsPrice) * 100) / 100;

    if (cu.hasValue(fields.operation139)) {
        pu.validateValue(fields.operation139_answer, jobCost);
    }

    if (cu.hasValue(fields.operation152)) {
        pu.validateValue(fields.operation152_answer, specCustCostAnswer);
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

function maxQuotedJob() {
    var jobQuote = configureglobals.cquote.jobTotalPrice;
    var maxQuotaJobAmt = 5000;
    if (jobQuote > maxQuotaJobAmt) {
        $('#validation-message-container').html('<div class="ribbon-wrapper quote-warning">The total price of your job exceeds $' + maxQuotaJobAmt + '. Please contact Central Estimating to obtain a quote for your job.</div>')
    } else {
        $('#validation-message-container').html('');
    }
}
function bucketPrinting(product) {
    var bucketOp = fields.operation125;
    if (!bucketOp) {return}

    var bucketOpSelected = cu.hasValue(bucketOp);
 
    //if product is Scheduled Product, then disable checkout on Invalid Configurations.
    //if on a standard product, this field would have to be selected by a Planner or have a re-order from a job where the planner selected Bucket Printing
    // in the later case, only deselect if new configuration is invalid.  Do not show warnings
    var scheduledProduct = $('body').hasClass('scheduledPrinting');

    var validBucketJob = bucketValidate();

    if (validBucketJob) {
        if (scheduledProduct) {
            pu.validateValue(bucketOp, 542);
        }
    } else {
        pu.validateValue(bucketOp, '');
    }

    function bucketValidate() {
        // Max of 250 sq ft, unless *TBG Lexjet Buckets (30 sq ft)
        var pjcSizeMax = {
            495 : 30
        }
        var totalSquareFeet = (cu.getWidth() * cu.getHeight() * cu.getTotalQuantity())/144;
        if (isNaN(totalSquareFeet)) {
            console.log('cannot compute total Sq Ft size limitation');
            return
        }
        var maxSq = pjcSizeMax[cu.getPjcId(product)] ? pjcSizeMax[cu.getPjcId(product)] : 250;

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

        if (totalSquareFeet > maxSq) {
            if (bucketOpSelected) {
                var bucketSizeMessage = '<p>The Bucket product is limited to jobs less than ' + maxSq + ' sq ft.  For jobs greater than this please use the UV Roll Printing Product.</p>';
                onQuoteUpdatedMessages += bucketSizeMessage;
                disableCheckoutReasons.push(bucketSizeMessage);
            }
            return false
        }
        // proofType NOT IN (40,41,43,50) //standing & hard proofs
        if (cu.isValueInSet(fields.proof,hardProofOptions)) {
            return false
        }

        //Need at least 1 Production Day.  Allow Next Day if before 1:00 pm
        if (productionDays.total > 0 && productionDays.total < 2) {
            if (scheduledProduct) {
                var maxProductionDayMessage = '<p>Bucket Printing requires at least 2 production days.  Cut off time is 1:00 pm to order for next day. Please use the standard Roll Printing product.';
                onQuoteUpdatedMessages += (maxProductionDayMessage);
                disableCheckoutReasons.push(maxProductionDayMessage);
            }
            return false
        }
        return true
    }

}
function canvasFrameRestriction(product) {
	var frameOp = fields.operation65;
	if (frameOp) {
		var maxLength = 36;
		var longestLength = Math.max( Number(cu.getWidth()), Number(cu.getHeight()) );
		if (longestLength > maxLength) {
			if (cu.getValue(frameOp) == 354) {
				onQuoteUpdatedMessages += '<p>Canvas prints with the largets side greater than ' + maxLength + '" requires 1.5" Frames.  This has been updated for you.<p>';
				cu.changeField(frameOp, 225, true);
			}
		}
	}
}

function vutekInkOptGroups() {
    var side1CommonInks = [
        '366',   //CMYK + W + CMYK (Flood / Second Surface)
        '406',   //CMYK + W + CMYK (Spot / First Surface)
        '391',   //CMYK + W + CMYK (Spot / Second Surface)
        '249',   //CMYK + W (Flood / Second Surface)
        '476',   //CMYK + W (Spot / First Surface)
        '389',   //CMYK + W (Spot / Second Surface)
        '374',   //Standard CMYK (First Surface)
        '261',   //Standard CMYK (First Surface)
        '239',   //W + CMYK (Flood / First Surface)
        '396',   //W + CMYK (Spot / First Surface)
        '306',   //White Only (Spot / First Surface)
        '418',   //White Only (Spot / Second Surface)
        '398',   //W + W + CMYK (Spot / First Surface)
        '382',   //W + W Only (Spot / First Surface)
    ]
    var side2CommonInks = [
        '641'   //Standard CMYK (First Surface)
    ]


    insertOptGroup($('select#operation52'), side1CommonInks);
    insertOptGroup($('select#operation137'), side2CommonInks);

    function insertOptGroup(operation, list) {
      
    if (operation.find('optGroup').length > 0) {
      return
    }
    var selectedOption = operation.val();
    var recommendedGroup = $('<optgroup label="Standard"></optGroup>');
    var otherGroup = $('<optgroup label="Rare"></optgroup>');
    var items = operation.find('option');
    for (var i = 0; i < items.length; i++) {
        if (list.indexOf(items[i].value) != -1) {
            recommendedGroup.append(items[i]);
        } else {
            otherGroup.append(items[i])
        }
    }
    recommendedGroup.appendTo(operation);
    otherGroup.appendTo(operation);
    operation.val(selectedOption);
   }
}
function vutekInkOptGroups_surface() {

    //Create opt groups only for TBG Board Printing

    var side1Ink = $('select#operation52');
    var side2Ink = $('select#operation137');

    if (side1Ink) {
        insertOptGroup($('select#operation52'));
    }
    if (side2Ink) {
        insertOptGroup($('select#operation52'));
    }

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
function setMaterialPackaging(product, updates) {
    var matPackageTypeOp = fields.operation190;
    var matBaggingOp = fields.operation191;
    var softFoldOpItems = [
        '986'
    ]
    var finishingOps = [
        60,  //TBG Grommets
        61,  //TBG Hemming
        61,  //TBG Hemming
        62,  //TBG Pole Pockets
        62,  //TBG Pole Pockets
        63,  //TBG Keder Sewing
        64,  //TBG Velcro Sewing
        73,  //TBG Grommet Color
        161,  //TBG Dye Sub Silver Liner - 2 sided only
        187,  //TBG Test Fit in Frame
        188  //TBG Rope
    ]
    var finishOpCount = pu.countHasValueFromOpSet(finishingOps);

    if (matPackageTypeOp && matBaggingOp) {
        //always run unless field has been manually overridden
        if (window.matPackagingOverridden) { return }
        if (cu.isLastChangedField(updates, matPackageTypeOp) || cu.isLastChangedField(updates, matBaggingOp)) {
            window.matPackagingOverridden = true;
            return
        }
        //must have a finishing option selected
        if (finishOpCount > 0) {

            var rollOnCoreRefIds = [
                2681, 2714, 7852, 4270, 3125, 7737, 9035, 3260, 2770, 7732, 3259, 3261, 6118, 4089, 7738, 3269, 3270, 3268, 2772, 3129, 3134, 3131, 3130, 6044, 6049, 3132, 5593, 3132, 4089
            ]
            var softFoldRefIds = [
                3271, 3273, 2297
            ]
            var softRollRefIds = [
                2297
            ]
            var dyeSubFabricPjcs = [
                    '450',  //*TBG Dye Sub Fabric Printing
                    '521'   //*TBG Dye Sub Fabric - Tiled
            ]

            var baggingOptionsToHide = [
                1008,   //18 x 42 Poly Bag
                1036,   //Poly Bag_18x42" - 2647
                1037,   //Poly Bag_20x26" - 7024
                1038,   //Poly Bag_24x54" - 7023
                1039,   //Poly Bag_28x42" - 7025
                1040,   //Poly Bag_36x54" - 7026
                1065,   //20x20 Poly Bag
                1062
            ]

            var substrateRefId = Number(pu.getMaterialReferenceId('aPrintSubstrate'));
            var height = Number(cu.getHeight());
            var totalQty = cu.getTotalQuantity();

            //When Soft Fold update Bagging material
            if (cu.isValueInSet(matPackageTypeOp, softFoldOpItems)) {
                pu.validateValue(matBaggingOp, 994);
            } else {
                pu.validateValue(matBaggingOp, '')
            }

            //material Operation Items
            var rollOnCoreOpItem = getRollOnCoreid(height);
            var materialOpItem = getMaterialOpItemId();

            pu.validateValue(matPackageTypeOp, materialOpItem);

            //hide invalid roll on core options
            hideInvalidCoreOptions(rollOnCoreOpItem);

            //hide all options but 994 
            pu.hideFieldOptions(baggingOptionsToHide); 
        } else {
            pu.validateValue(matPackageTypeOp, '');
            pu.validateValue(matBaggingOp, '');
        }

        function getMaterialOpItemId() {
            //soft fold on all dye sub fabric
            if (cu.isPjc(product, dyeSubFabricPjcs)) {
                return 986
            }
            if (softFoldRefIds.indexOf(substrateRefId) != -1) {
                return 986
            }
            if (softRollRefIds.indexOf(substrateRefId) != -1) {
                return 987
            }
            if (rollOnCoreRefIds.indexOf(substrateRefId) != -1) {
                //Soft Fold if under 25 qty
                if (totalQty < 25) {
                    return 987
                }
                return rollOnCoreOpItem
            }
            return ''
        }

        function getRollOnCoreid(height) {
            //return option based on height.  all others will get hidden
            if (height > 94) {
                    return 986
                } else if (height > 78) {
                    return 992
                } else if (height > 62) {
                    return 991
                } else if (height > 50) {
                    return 990
                } else if (height > 36) {
                    return 989
                }
            return 988
        }

        function hideInvalidCoreOptions(rollOnCoreOpItem) {
            pu.addClassToOperationItemsWithString(190,'hide','Roll on Core');
            //show Roll on Core Option for Size
            if (cu.hasValue(matPackageTypeOp)) {
                $('#operation190 option[value="' + rollOnCoreOpItem + '"]').removeClass('hide');
            }
            //trim only rollOnCoreOption
            pu.trimOperationItemNames(190,'_', rollOnCoreOpItem);
        }
    } else {

    }
}

function operationQuestionTextChange() {
    var applicationOps = [
        120,   //TBG Film Tape Application
        121,   //TBG Magnet Application
        122,   //TBG Velcro Application
        183   //TBG Foam Tape Application
    ];
    var applicationQuestion = 'How many linear inches is needed per piece?';
    pu.updateOperationQuestion(applicationOps, applicationQuestion);
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
        134,   //TBG Gutter
        155   //TBG Dye Sub Tissue Paper
    ]
    var estimatingOnlyOps = [
        //139     //TBG Team Factor
    ]
    var inkOpsWithDPI = [
        52  //TBG Ink Configuration - Vutek HS100
    ]
    var opsToTrimWithUnderscore = [
        67,  //Pre-Printing Front Laminate
        84,  //Pre-Printing Back Laminate
        58,   //TBG Tape, Mag, Velcro
        78,  //LF Premask
        160,  //Can color team approve color without PM?
        156,   //Match color to
        120,   //TBG Film Tape Application
        121,   //TBG Magnet Application
        122,     //TBG Velcro Application
        183,    //TBG Foam Tape Application
        186,     //TBG Bump-on Application
        63    //Keder Sewing
    ]
    var opsWithCalculatedAnswer = [
        139,    //TBG Team
        152     //TBG Special Customer
    ]

    metaFieldsActions.onQuoteUpdated(product);
    
    pu.trimOperationItemNames(inkOpsWithDPI, ' - ');
    pu.trimOperationItemNames(opsToTrimWithUnderscore, '_');
    pu.removeClassFromOperation(111,'costingOnly');
    pu.addClassToOperation(planningOnlyOps, 'planning');
    pu.addClassToOperation(estimatingOnlyOps,'estimating');
    pu.addClassToOperation(opsWithCalculatedAnswer,'calculatedAnswer');
    
    if (cu.getPjcId(product) != 389) {
        //exclude for TBG Finishing Only
        pu.removeOperationItemsWithString(104,'Print');
    }

    canvasOperationDisplay();
    bannerFinishingOperationDisplay(product);
    bannerStandLogic();
    operationQuestionTextChange();

    vutekInkOptGroups_surface();

    pu.validateConfig(disableCheckoutReasons, 'rollCalcLogic');
    maxQuotedJob();
}



configureEvents.registerOnCalcLoadedListener(rollCalcLogic);
configureEvents.registerOnCalcChangedListener(rollCalcLogic);
configureEvents.registerOnQuoteUpdatedListener(rollCalcLogic);
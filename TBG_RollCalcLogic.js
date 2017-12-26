var planningOnlyOps = [
    99,  //TBGCutting
    55,  //TBGZundCutting
    102,  //TBGGuillotineCutting
    103,  //TBGFotobaCutting
    88,  //DyeSubTransferPaper
    100,  //TBGMountingRun
    112,  //TBGInternalCuts
    110,  //TBGNoCutting
    115,  //TBGPre-cut
    109,  //TBGPre-Sheet
    108,  //TBGPre-Slit
    116,  //TBGTBG-FabCut
    125,  //TBGBucketJob
    127,  //TBGMCTCutting
    134    //TBG Gutter
]
var estimatingOnlyOps = [
    139     //TBG Team Factor
]
var zundFactors = {
    "K1" : {"name" : "Knife 1", "loadingOpItem" : 202, "unloadingOpItem" : 201 , "runOpItem": 195, "intCutOpItem": 773, "rank" : 1},
    "K2" : {"name" : "Knife 2", "loadingOpItem" : 202, "unloadingOpItem" : 201 , "runOpItem": 196, "intCutOpItem": 774, "rank" : 2},
    "R1" : {"name" : "Router 1", "loadingOpItem" : 204, "unloadingOpItem" : 201 , "runOpItem": 197, "intCutOpItem": 775, "rank" : 3},
    "R2" : {"name" : "Router 2", "loadingOpItem" : 204, "unloadingOpItem" : 201 , "runOpItem": 198, "intCutOpItem": 776, "rank" : 4},
    "R3" : {"name" : "Router 3", "loadingOpItem" : 204, "unloadingOpItem" : 201 , "runOpItem": 199, "intCutOpItem": 777, "rank" : 5},
    "R4" : {"name" : "Router 4", "loadingOpItem" : 204, "unloadingOpItem" : 201 , "runOpItem": 200, "intCutOpItem": 778, "rank" : 6}
}
var canvasSubstrates = [
'144',  //6.5oz. Ultraflex Mult-tex Canvas
'83'   //Canvas - Matte Finish
]
var canvasOperations = [
65, //TBG Canvas Frame Assembly
66  //TBG Canvas Stretching
]
var pjcsWithBannerMaterial = [
'76',  // TBG HP 30000 Roll
'337'  // TBG Vutek HS 100 Roll
]
var substratesWithBannerFinishing = [
    '23',    //13 oz. Scrim Vinyl Matte (for outdoor use)
    '26',    //13 oz. Smooth Vinyl - Opaque Matte (for indoor use)
    '73',    //18 oz. Smooth Vinyl - Opaque Matte (for heavy duty outdoor use)
    '114',   //8 oz. Mesh
    '167',     //15 oz. Smooth Vinyl Banner
    '146',      //Berger Samba Fabric 6.87oz.
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
    '270'   //Heavy Kit Fabric - Top Value 7.3oz
]
var bannerStandMaterial = [
    '23',    //13 oz. Scrim Vinyl Matte (for outdoor use)
    '26',    //13 oz. Smooth Vinyl - Opaque Matte (for indoor use)
    '73'    //18 oz. Smooth Vinyl - Opaque Matte (for heavy duty outdoor use)
]
var bannerFinishingOperations = [
    '60',   //TBG Grommets
    '61',   //TBG Hemming
    '62',   //TBG Pole Pockets
    '63',   //TBG Keder Sewing
    '73'    //TBG Grommet Color
]
var cuttingDesc = {
    302: 356 , //simple
    355: 357,  //Complex
    '' : ''
}
var cutMethodId = {
    450 : 'noCutting',
    451 : 'zund',
    452 : 'outsourcedCut',
    495 : 'fabCut'
}
var flutedSubstrateNames = [
    'Coroplast',
    'Flute'
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
var fabrivuDirectMaterials = [
    '398'   //Berger Flag Fabric White 4oz
]
var utrlaCanvasBacklitInks = [
    '241',  //Backlit (Double Strike)
    '239'   //W + CMYK (Flood / First Surface)
]

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

var calcCount = 0;

var pmPortal = ((location.hostname.indexOf("tbg-pm.collaterate.com") != -1) || (location.hostname.indexOf("tbghub.com") != -1));
var estimatingSite = (location.hostname.indexOf("estimating.collaterate.com") != -1);

// Message Counts
var hardProofMessageCount = 0;
var sameSideMessage = '';

// Operation Item Keys object - in window for testing
var operationItemKeys = new Object();  

// Object for Lam and Mount choices
var printConfig = {};
var lc = new Object();

var cu = calcUtil;
var cc = calcConfig;


var rollCalcLogic = {
    onCalcLoaded: function(product) {
        hideCanvasOperations();  
        trimOperationItemName(inkOpsWithDPI, ' - ');
        trimOperationItemName(opsToTrimWithUnderscore, '_');
        if (cu.getPjcId(product) != 389) {
            removeOperationItemsWithString(104,'Print');
        }
        removeClassFromOp(111,'costingOnly');
        addClassToOperation(planningOnlyOps,'planning');
        addClassToOperation(estimatingOnlyOps,'estimating');
        //run meta field action
        metaFieldsActions.onCalcLoaded();
    },
    onCalcChanged: function(updates, product) {

    },
    onQuoteUpdated: function(updates, validation, product) {
        if (!cu.isSmallFormat(product)) {
            calcCount++;
            console.log('count is ' + calcCount);

            if (cu.isPOD(product)) {
                //STOP IF CALCULATOR NOT RETURNING QUOTE
                if (!configureglobals.cquote) { return; }
                if (!configureglobals.cquote.success) { return; }

                if (cu.isSmallFormat(product)) {
                    var quote = configureglobals.cquote.pjQuote;
                    if (!quote) { return; }
                    var changeEventTriggered = rollCalcLogic.onQuoteUpdated_POD_SmallFormat(updates, validation, product, quote);
                } else {
                    var quote = configureglobals.cquote.lpjQuote;
                    if (!quote) { return; }
                    var changeEventTriggered = rollCalcLogic.onQuoteUpdated_POD_LargeFormat(updates, validation, product, quote);
                }
            }
            console.log('onQuoteUpdated End');
        }
    },
    onQuoteUpdated_POD_LargeFormat: function(updates, validation, product, quote) {
        var changeEventTriggered = false;

        /*re-init on every update*/
        cu.initFields();

        //Add properties to global objects from embedded meta 
        setConfigGlobalProperties(quote);
        //Run Roll Imposition Engine
        calcConfig.getUpdatedConfig(quote);

        //Functions that are not inter-dependent
        controller.enterFullQuoteMode();
        functionsRanInFullQuote(updates, validation, product, quote);
        
        console.log('POD_SF validation finished. Pending change:', controller.fieldChangeQuotePending);
        var requoteInProgress = controller.fieldChangeQuotePending;
        controller.exitFullQuoteMode();
        if (requoteInProgress) {
            return true;
        }
        setWasteOperationCosts(quote);

        //functions needing price results and UI changes
        changeEventTriggered = functionsRanAfterFullQuote(updates, validation, product, quote);
        console.log('POD_LF post-full-quote changes triggered:',changeEventTriggered);
        return changeEventTriggered;

    }, 
    onQuoteUpdated_POD_SmallFormat: function(updates, validation, product, quote) {

    }
}

// Functions called in Full Quote
function setConfigGlobalProperties(quote) {
    setCustomProperties(quote.device,"description","customProperties");
    addJobMaterialProperties(quote);
}
function addJobMaterialProperties(quote) {
    var jobMaterials = quote.piece;
    for (prop in jobMaterials) {
        if (jobMaterials.hasOwnProperty(prop)) {
            setCustomProperties(jobMaterials[prop], "notes","customProperties")
        }
    }
}


function functionsRanInFullQuote(updates, validation, product, quote) {
    createOperationItemKey(quote);
    setCuttingOps(quote, product);
}

function functionsRanAfterFullQuote(updates, validation, product, quote) {
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
                var opItemJSON = getJsonFromString(opItemKeyText[0]);
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

function setWasteOperationCosts(quote) {
    //Compares Coll Calculated material costs against PrintConfig costs (Roll Impo calc) and inserts difference into operation answers
    if (!printConfig) { 
        console.log('no printConfig');
        return;
    }
    if (!printConfig.valid_quote) {
        console.log('no valid print configs');
        return;
    }

    // Roll Substrate Waste
    var calcPrintSubCost = (printConfig.aPrintSubstrate ? printConfig.aPrintSubstrate.totalRollMatCost : 0) + (printConfig.bPrintSubstrate ? printConfig.bPrintSubstrate.totalRollMatCost : 0);
    var printSubCost = (quote.aPrintSubstratePrice ? quote.aPrintSubstratePrice : 0) + (quote.aPrintSubstratePrice ? quote.aPrintSubstratePrice : 0);
    setWasteOperationAnswer(fields.operation135_answer, calcPrintSubCost, printSubCost);

    var calcLamCost = (printConfig.frontLaminate ? printConfig.frontLaminate.totalCost : 0) + (printConfig.backLaminate ? printConfig.backLaminate.totalCost : 0);
    var lamSubCost = (quote.frontLaminatePrice ? quote.frontLaminatePrice : 0) + (quote.frontLaminatePrice ? quote.frontLaminatePrice : 0);
    setWasteOperationAnswer(fields.operation146_answer, calcLamCost, lamSubCost);

    var calcMountCost = printConfig.mountSubstrate ? printConfig.mountSubstrate.totalCost : 0;
    var mountSubCost = quote.mountSubstratePrice ? quote.mountSubstratePrice : 0;
    setWasteOperationAnswer(fields.operation147_answer, calcMountCost, mountSubCost);

    var calcAdhesiveCost = (printConfig.aAdhesiveLaminate ? printConfig.aAdhesiveLaminate.totalCost : 0) + (printConfig.bAdhesiveLaminate ? printConfig.bAdhesiveLaminate.totalCost : 0);
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
    
    var waste = roundTo(calcCost - cost);
    //if not cost, waste set waste to 0
    if (isNaN(waste)) { 
        waste = 0;
    }
    if (cu.getValue(opAnswer) != waste) {
        cu.changeField(opAnswer, waste, true);
    }
}
function setRollChangeCost() {
    //Roll Change Minutes
    var rollChangeOp = fields.operation138;
    var rollChangeOpAnswer = fields.operation138_answer;
    var rollChangeMins = 0;
    if (printConfig.aPrintSubstrate) {
        rollChangeMins += printConfig.aPrintSubstrate.rollChangeMins;
    }
    if (printConfig.bPrintSubstrate) {
        rollChangeMins += printConfig.bPrintSubstrate.rollChangeMins;
    } 
    if (rollChangeOp) {
        if (!isNaN(rollChangeMins)) {
            if (rollChangeOpAnswer) {
                if (cu.getValue(rollChangeOpAnswer) != rollChangeMins) {
                    cu.changeField(rollChangeOpAnswer, rollChangeMins, true);
                    return
                }
            }
        }
    }
}
function setCuttingOps(quote, product) {

    var noCutOp = fields.operation110;
    var fabCutOp = fields.operation116;

    var cutMethod = getCutMethod();
    //no cut
    if (cutMethod == 'noCutting') {
        validateValue(noCutOp,448);
    } else {
        validateValue(noCutOp,'');
    }
    //zund
    setZundOps(quote, cutMethod);
    setOutsourceCutOps(cutMethod);
    setMCTCutOp(cutMethod, product);

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
        result = 'mct';
        return result;
    }
    if (cu.hasValue(userDeclareCutOp)) {
        userDeclaredCutMethod = cutMethodId[cu.getValue(fields.operation111)];
        if (userDeclaredCutMethod) {
            result = userDeclaredCutMethod;
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

    var zundChoice = getZundChoice(quote);

    if (cutMethod == 'zund') {
        if (zundLoading) {
            validateValue(zundLoading, zundChoice.loadingOpItem);
        }
        if (zundCutting) {
            validateValue(zundCutting, zundChoice.runOpItem);
        }
        if (zundUnloading) {
            validateValue(zundUnloading,zundChoice.unloadingOpItem);
        }
        //INTERNAL CUTTING - map to choice item and enter answer 
        if (cu.hasValue(userItCutOpAnswer)) {
            var intCutInches = cu.getValue(userItCutOpAnswer);
            //must run 2 times: 1 to set operation, 2 to set answer value
            validateValue(fields.operation179, zundChoice.intCutOpItem);
            if (fields.operation179_answer) {
                validateValue(fields.operation179_answer, intCutInches);
            }
        }
    } else {
        validateValue(zundLoading,'');
        validateValue(zundCutting,'');
        validateValue(zundUnloading,'');
        validateValue(fields.operation179,'');
    }
    //Interior cut operations soon to be re-org
    setZundInCutOp(zundChoice);
}
function getZundChoice(quote) {
    //default to K1
    result = zundFactors.K1;
    //check print substrate A and Mount for highest ranked factor
    setZundFactor('aPrintSubstrate');
    setZundFactor('mountSubstrate');
    //insert zund into printConfig to display on page for estimators
    function setZundFactor (substrate) {
        var mat = quote.piece[substrate];
        if (mat) {
            if (mat.zundFactor) {
                var matZundFactor = zundFactors[mat.zundFactor];
                if (matZundFactor.rank > result.rank) {
                    result = matZundFactor;
                } else {
                    console.log('no zundfactor assigned on ' + mat.name);
                }
            }
        }
    }
    printConfig.zundFactor = result;
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
    trimOperationItemName(112, '_');
    if (zundChoice.rank.indexOf('k') != -1){
        hideOperationItems(intCutRouteOptions);
    } else {
        hideOperationItems(intCutBladeOptions);
    }
    if (cu.hasValue(intCutOp) && cutMethod == 'zund') {
        var intCutItem = cu.getValue(intCutOp);
        //blade cut
        if (zundChoice.rank.indexOf('k') != -1) {
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
                cu.changeField(intCutOp, intCutSetting[intCutItem], '');
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
        removeOperationItemsWithString(104,'Cut');
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
        validateValue(mctCutting,'');
    }
}
function setFabCutOp(cutMethod, product) {
    if (cutMethod == 'fabCut') {
        //show TBG Fab Cut and Turn on Premask when Laser selected
        if (cu.getPjcId(product) == 389) {
            removeClassFromOp(116, 'planning');
            if (!cu.hasValue(fabCutOp)) {
                message += '<p>Please select a Cutting Option in the TBG-Fab Cut operation.</p>'
            }
            if (cu.getValue(fabCutOp) == 508) {
                if (!cu.hasValue(fields.operation78)) {
                    message += '<p>Fab Laser Cut requires a Premask.  This has been chosen on your behalf.</p>';
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



//simplifies changing values of operation items
function validateValue(field, value) {
    if (field) {
        if (cu.getValue(field) != value) {
            cu.changeField(field, value, true);
        }
    }
}
function createStyleBlock(elements, styleText) {
    var x = '<style type="text/css">' + elements.join(", ") + ' {' + styleText + '}</style>';
    return x
}
function addClassToList(elements, newClassName) {
    for (var i = 0; i < elements.length; i++) {
        $(elements[i]).addClass('newClassName');
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

function hideCanvasOperations() {
    $.each(canvasOperations, function() {
        $('#operation' + this).hide();
    });
}
function showCanvasOperations() {
    $.each(canvasOperations, function() {
        $('#operation' + this).show();
    });
}
function hideBannerOperations() {
    $.each(bannerFinishingOperations, function() {
        $('#operation' + this).hide();
    });
}
function showBannerOperations() {
    $.each(bannerFinishingOperations, function() {
        $('#operation' + this).show();
    });
}
function trimOperationItemName(opList, deliminater) {
    //change single operation to array
    if (!(Array.isArray(opList))) {
        opList = [opList];
    }
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
function hideOperationItems(itemList, operation) {
    //change single operation to array
    if (!(Array.isArray(itemList))) {
        itemList = [itemList];
    }
    for (var i = 0; i < itemList.length; i++) {
        $('option[value="' + itemList[i] + '"]').hide();
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
function removeOperationItemsWithString(op, string) {
    $('select#operation' + op +' option').each(function() {
        var item = this.text;
        var index = item.indexOf(string);
        if (index != -1) {
            $(this).hide();
        }
    });
}

function getOperationDetails() {
    var quote = configureglobals.cquote.lpjQuote ? configureglobals.cquote.lpjQuote : null;
    var operations = quote.operationQuotes;
    var ops = { };
    for (var i = 0; i < operations.length; i++) {
        var opId = operations[i].operation.id;
        var data = operations[i].data;
        ops['op' + opId] = {
            'id' : opId,
            'name' : operations[i].operation.heading,
            'left' : data.leftSide,
            'right' : data.rightSide,
            'bottom' : data.bottomSide,
            'top' : data.topSide
        }
        return ops
    } return false
}
function validateSidesNotTheSame(opDetails, op1, op2) {
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
        message += '<p>The following sides match for operations ' + object1['name'] + ' and ' + object2['name'] + ' : ' + sidesMatch.join(', ') + '.</p><p>Please make adjustments as these operations cannot be done on the same sides.</p>';
    }
    return message
}

/*
sends in text from a text block to search for a Json object
convert to json object
add properties to target window object for 
*/

function setPropertyFromTextJson(text, targetObj) {
    if (!text) {
        console.log('no text to search for property');
        return
    }
    var jsonBlock = /\{(.*?)\}/.exec(text);
    if (jsonBlock) {
        var jsonStr = getJsonFromString(jsonBlock[0]);
        if (jsonStr) {
            //create objects and properties if not exists on window
            if (!window.targetObj) {
                window[targetObj] = {};
            }
            if (!targetObj.property) {
                target.property;
            }
            for (prop in jsonStr) {
                targetObj[prop] = jsonStr[prop];
            }
        } else {
            console.log('invalid json string ' + opItemKeyText);
        }
    }
}

// for each property in object search for text property for JSON written text and insert into customProperties properties, if designated
function setCustomProperties (obj, textProp, newProp) {
    if (!obj) {
        return
    }
    if (!obj[textProp]) {
        return
    }
    //create new property if newProp defined
    if (newProp) {
        obj[newProp] = {};
    }
    var text = obj[textProp];
    // remove line breaks 
    text = text.replace(/[\n\r]/g, '');
    //Json properties must be property formed and wrapped in "[[{ }]]"
    var taggedBlock = /\[{2}(.*?)\]{2}/.exec(text);
    if (taggedBlock) {
        var jsonBlock = taggedBlock[0].slice(2,-2);
        var jsonStr = getJsonFromString(jsonBlock);
        for (property in jsonStr) {
            //if new property inputted insert there otherwise AND on original object (make querying results easier)
            if (newProp) {
                obj[newProp][property] = jsonStr[property];
            } 
            obj[property] = jsonStr[property]; 
        }
    }
}

function getJsonFromString (str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return false;
    }
}

function roundTo(n, digits) {
    var negative = false;
    if (digits === undefined) {
        digits = 0;
    }
    if( n < 0) {
        negative = true;
      n = n * -1;
    }
    var multiplicator = Math.pow(10, digits);
    n = parseFloat((n * multiplicator).toFixed(11));
    n = (Math.round(n) / multiplicator).toFixed(2);
    if( negative ) {    
        n = (n * -1).toFixed(2);
    }
    return n;
}

configureEvents.registerOnCalcLoadedListener(rollCalcLogic);
configureEvents.registerOnCalcChangedListener(rollCalcLogic);
configureEvents.registerOnQuoteUpdatedListener(rollCalcLogic);
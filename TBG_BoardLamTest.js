
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
    },
    onCalcChanged: function(updates, product) {
    },
    onQuoteUpdated: function(updates, validation, product) {
        cu.initFields();
        var submessage = ''; 
        /********* Convert pieces for Operation Costing */
        var pieceWidth = cu.getWidth();
        var pieceHeight = cu.getHeight();
        var quantity = cu.getTotalQuantity();
        
        var SqInchIncreaserAnswer = fields.operation97_answer;
        var SqInchDecreaserAnswer = fields.operation100_answer;

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

        for (const prop of Object.keys(lc)) {
          delete lc[prop];
        }
        lc["frontLamType"]= (hasFrontLam && quote.piece.frontLaminate) ? quote.piece.frontLaminate.type.name : null;
        lc["backLamType"]= (hasBackLam && quote.piece.backLaminate) ? quote.piece.backLaminate.type.name : null;
        lc["hasMount"] = hasMount;
        lc["hasFrontLam"] = hasFrontLam;
        lc["hasBackLam"] = hasBackLam;

        lc["hasColdFront"]= frontLamType == 'Cold';
        lc["hasColdBack"]= backLamType == 'Cold';
        lc["hasHotFront"]= frontLamType == 'Hot';
        lc["hasHotBack"]= backLamType == 'Hot';
        lc["hasAdhesiveBack"]= cu.getValue(fields.backLaminate) == 38;
        lc["hasAdhesiveFront"]= cu.getValue(fields.frontLaminate) == 38;
        lc["hasPremask"]= cu.hasValue(fields.operation78);
        lc["selfAdhesive"]= configureglobals.cprintsubstratesmgr.choice ? configureglobals.cprintsubstratesmgr.choice.selfAdhesive : false;

        var frontLamType = (hasFrontLam && quote.piece.frontLaminate) ? quote.piece.frontLaminate.type.name : null;
        var backLamType = (hasBackLam && quote.piece.backLaminate) ? quote.piece.backLaminate.type.name : null;

        var hasColdFront = frontLamType == 'Cold';
        var hasColdBack = backLamType == 'Cold';
        var hasHotFront = frontLamType == 'Hot';
        var hasHotBack = backLamType == 'Hot';
        var hasAdhesiveBack = cu.getValue(fields.backLaminate) == 38;
        var hasAdhesiveFront = cu.getValue(fields.frontLaminate) == 38;
        var hasPremask = cu.hasValue(fields.operation78);
        var selfAdhesive = configureglobals.cprintsubstratesmgr.choice ? configureglobals.cprintsubstratesmgr.choice.selfAdhesive : false;


        if (hasMount || hasFrontLam || hasBackLam) {
            if (hasMount) {
                if (hasPremask) {
                    if (!hasFrontLam && !hasBackLam) { 
                        if (selfAdhesive) {  // 1. Mount + Premask 
                            validateValue(laminatingRun, 711);
                            validateValue(laminatingRun2,'');
                        } else { // 1. Adhesive  2. Mount + Premask
                            validateValue(laminatingRun, 706);
                            validateValue(laminatingRun2, 717);
                        }
                    } else if (hasHotFront) { 
                        if (selfAdhesive) { // 1. Mount  2. Hot  3. Premask
                            validateValue(laminatingRun, 710);
                            validateValue(laminatingRun2, 718);
                        }
                        else { //  1. Hot / Adhesive  2. Mount + Premask
                            validateValue(laminatingRun, 709);
                            validateValue(laminatingRun2, 717);
                        }
                    } else if (hasColdFront) {
                        if (selfAdhesive) { // 1. Cold / Adhesive  2.  Mount + Premask
                            validateValue(laminatingRun, 708);
                            validateValue(laminatingRun2, 717);
                        }
                        else { //  1. Cold / Adhesive  2. Mount + Premask
                            validateValue(laminatingRun, 708);
                            validateValue(laminatingRun2, 717);
                        }
                    }
                } else {  //mounted but no premask
                   if (!hasFrontLam && !hasBackLam) { 
                        if (selfAdhesive) {  // 1. Mount 
                            validateValue(laminatingRun, 710);
                            validateValue(laminatingRun2,'');
                        } else { // 1. Adhesive  2. Mount
                            validateValue(laminatingRun, 706);
                            validateValue(laminatingRun2, 716);
                        }
                    } else if (hasHotFront) { 
                        if (selfAdhesive) { // 1. Mount  2. Hot 
                            validateValue(laminatingRun, 710);
                            validateValue(laminatingRun2, 715);
                        }
                        else { //  1. Hot / Adhesive  2. Mount
                            validateValue(laminatingRun, 709);
                            validateValue(laminatingRun2, 716);
                        }
                    } else if (hasColdFront) {
                        if (selfAdhesive) { // 1. Mount  2. Cold 
                            validateValue(laminatingRun, 710);
                            validateValue(laminatingRun2, 714);
                        }
                        else { //  1. Cold / Adhesive  2. Mount
                            validateValue(laminatingRun, 708);
                            validateValue(laminatingRun2, 716);
                        }
                    }
                }
            } else {  //everything not mounted
                if (hasPremask) {
                    if (hasHotFront) {
                        if (hasAdhesiveBack) { // 1. Hot / Adhesive 2. Premask
                            validateValue(laminatingRun, 709);
                            validateValue(laminatingRun2,718);
                        } else if (hasHotBack) { // 1. Hot / Hot 2. Premask
                            validateValue(laminatingRun, 364);
                            validateValue(laminatingRun2,718);
                        }
                    } else if (hasColdFront) {
                        if (hasColdBack) {  // 1. Cold  2. Premask
                            validateValue(laminatingRun, 363);
                            validateValue(laminatingRun2,718);
                        } else if (hasAdhesiveBack) { // 1. Cold / Adhesive 2. Premask
                            validateValue(laminatingRun, 708);
                            validateValue(laminatingRun2,718);
                        } else { // 1. Cold  2. Pre-mask
                            validateValue(laminatingRun, 363);
                            validateValue(laminatingRun2,718);
                        }
                    } else if (hasAdhesiveBack) { // 1. Adhesive  2. Premask
                        validateValue(laminatingRun, 706);
                        validateValue(laminatingRun2,718);
                    } else { // 1. Premask
                        validateValue(laminatingRun, 712);
                        validateValue(laminatingRun2,'');
                    }
                } else {  // no mount, no premask
                    if (hasHotFront) {
                        if (hasHotBack) { // 1. Hot / Hot
                            validateValue(laminatingRun, 364);
                            validateValue(laminatingRun2,'');
                        } else if (hasAdhesiveBack) {  // 1. Hot / Adhesive
                            validateValue(laminatingRun, 709);
                            validateValue(laminatingRun2,'');
                        } else {
                            message += invalidLamMessage;
                        }
                    } else if (hasColdFront) {
                        if (hasColdBack) {  // 1. Cold / Adhesive
                            validateValue(laminatingRun, 708);
                            validateValue(laminatingRun2,'');
                        } else if (hasAdhesiveBack) {  // 1. Cold / Adhesive
                            validateValue(laminatingRun, 708);
                            validateValue(laminatingRun2,'');
                        } else {  // 1. Cold
                            validateValue(laminatingRun, 363);
                            validateValue(laminatingRun2,'');
                        }
                    } else if (hasAdhesiveBack) { // 1. Adhesive
                        validateValue(laminatingRun, 706);
                        validateValue(laminatingRun2,'');
                    }
                }
            }
            //Get LF needed and enter in .01LF per piece as operation answer
            //NOT APPLICABLE FOR SFC UNTIL NEW OPERATION COSTING 
        /*                    var lamRunWithSpoil = getLamWithSpoilage();
            printConfig['lam_lf_with_spoilage'] = lamRunWithSpoil;
            if (!isNaN(lamRunWithSpoil)) {
                var lamRunFactor = parseInt(lamRunWithSpoil / totalQuantity * 100);
                if (cu.hasValue(laminatingRun)) {
                    validateValue(laminatingRunAnswer, lamRunFactor);
                }
                if (cu.hasValue(laminatingRun2)) {
                    validateValue(laminatingRunAnswer2, lamRunFactor);
                }
            }*/
        } 
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

// Operation Item Keys object - in window for testing
var operationItemKeys = new Object();  

var cu = calcUtil;

var lc = {};

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

        var quote = configureglobals.cquote.lpjQuote ? configureglobals.cquote.lpjQuote : null;

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

function setLamRunOperations() {
    if (hasMount || hasFrontLam || hasBackLam || hasPremask) {
        if (hasMount) {
            if (hasPremask) {
                if (!hasFrontLam && !hasBackLam) { // 1. Adhesive  2. Mount + Premask
                    validateValue(laminatingRun, 1595);
                    validateValue(laminatingRun2, 1605);
                } else if (hasHotFront) { //  1. Hot / Adhesive  2. Mount + Premask
                    validateValue(laminatingRun, 1598);
                    validateValue(laminatingRun2, 1605);
                } else if (hasColdFront) { //  1. Cold / Adhesive  2. Mount + Premask
                    validateValue(laminatingRun, 1597);
                    validateValue(laminatingRun2, 1605);
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
                } else if (hasAdhesiveBack) { // 1. Adhesive  2. Premask
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
                    } else {// 1. Hot 
                        validateValue(laminatingRun, 1607);
                        validateValue(laminatingRun2,'');
                    }
                } else if (hasColdFront) {
                    if (hasColdBack) {  // 1. Cold / Adhesive
                        validateValue(laminatingRun, 1597);
                        validateValue(laminatingRun2,'');
                    } else if (hasAdhesiveBack) {  // 1. Cold / Adhesive
                        validateValue(laminatingRun, 1597);
                        validateValue(laminatingRun2,'');
                    } else {  // 1. Cold
                        validateValue(laminatingRun, 777);
                        validateValue(laminatingRun2,'');
                    }
                } else if (hasAdhesiveBack) { // 1. Adhesive
                    validateValue(laminatingRun, 1595);
                    validateValue(laminatingRun2,'');
                } else if (hasAdhesiveFront) { // 1. Adhesive
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




configureEvents.registerOnCalcLoadedListener(boardCalcLogic);
configureEvents.registerOnCalcChangedListener(boardCalcLogic);
configureEvents.registerOnQuoteUpdatedListener(boardCalcLogic);
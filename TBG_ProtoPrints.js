
var subTier = {
	15 : 1,   //Card Stock 12pt Coated 1 Side
	16 : 1,   //Card Stock 24pt Coated 1 Side
	37 : 1,   //Corrugated Plastic 4 mil
	14 : 1,   //Foamcore 3/16"
	178 : 1,   //Styrene 015
	4 : 1,   //Styrene 020
	5 : 1,   //Styrene 030
	211 : 1,   //Styrene 040
	221 : 1,   //Styrene 060
	113 : 1,   //Expanded PVC Foamboard 1 MM - White
	188 : 1,   //Expanded PVC Foamboard 2 MM - White
	59 : 1,   //Expanded PVC Foamboard - .125in-3mm - White
	39 : 1,   //PETG .020
	158 : 1,   //PETG .030
	40 : 1,   //PETG .040
	7 : 2,   //Styrene 080
	41 : 2,   //PETG .060
	69 : 2,   //PETG .080
	52 : 2,   //Ultraboard 1/2" - White
	70 : 2,   //Ultraboard 3/16" - White
	8 : 2,   //Styrene 125
	54 : 2,   //Expanded PVC Foamboard - .25in-6mm - White
	10 : 3,   //Gator Foam 1/2" - White
	11 : 3,   //Gator Foam 1" - White
	120 : 3,   //Alumaboard (Dibond Alternative) - White
	272 : 3,   //Expanded PVC Foamboard 10 MM - White
	53 : 3,   //Expanded PVC Foamboard - .5in-12.7mm - White
	104 : 3,   //Gator Foam 1"- Black
	129 : 3   //Optix Acrylic .220 Clear
}

var tierOpItems = {
	1 : 498,  
	2 : 499,
	3 : 500
}


var cu = calcUtil;
var customLogic = {
    onCalcLoaded: function(product) {
    	
    },
    onQuoteUpdated: function(updates, validation, product) {
        if (cu.isPOD(product)) {
         /*re-init on every update*/
            cu.initFields();
            var message = '';
            var submessage = '';

            var tierOp = fields.operation118;
            var tier = subTier[cu.getValue(fields.printSubstrate)];
            var tierOpItem = tierOpItems[tier];
            if (cu.getValue(tierOp) != tierOpItem) {
            	cu.changeField(tierOp, tierOpItem, true);
            }
            insertTierBreak();
        }
    }
}

configureEvents.registerOnCalcLoadedListener(customLogic);
configureEvents.registerOnQuoteUpdatedListener(customLogic);

function insertTierBreak() {
	var $lastInTier1 = $('#printSubstrates select option[value="40"');
	var $tier1Break = $('<option>****END OF TIER 1****</option>');
	$lastInTier1.after($tier1Break);

	var $lastInTier2= $('#printSubstrates select option[value="54"');
	var $tier2Break = $('<option>****END OF TIER 2****</option>');
$lastInTier2.after($tier2Break);
}
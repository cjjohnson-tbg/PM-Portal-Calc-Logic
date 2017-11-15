var deviceDetails = {
	"45" : {
		"name" : "TBG Vutek HS125 Roll",
		"leadWasteLF" : 8,
		"bleed" : .25,
		"margin" : 1,
		"gutter" : 0,
		"attrition" : .02,
		"rollChangeMins" : 10,
		"hourlyRate" : 149
	},
	"46" : {
		"name" : "TBG Canon",
		"leadWasteLF" : 6,
		"bleed" : .25,
		"margin" : 1,
		"gutter" : 0,
		"attrition" : .02,
		"rollChangeMins" : 3,
		"hourlyRate" : 149
	},
	"54" : {
		"name" : "TBG FabriVu 340",
		"leadWasteLF" : 20,
		"bleed" : .25,
		"margin" : 1,
		"gutter" : 0,
		"attrition" : .02,
		"rollChangeMins" : 40,
		"hourlyRate" : 149
	}
}

//Create altRolls Object through Alt Roll Worksheet in Google Drive - PM Portal - Substrate Management to get 1 line retult
var altRolls = {"137":[{"paceId":"3105","name":"SBR-3M-WHT-IJ3552C-02MIL-54X150","width":54,"length":1800}],"146":[{"paceId":"2681","name":"SBR-BRGR SMB-FAB-UV-1SD-6.87OZ-102X330","width":102,"length":3960}],"26":[{"paceId":"3130","name":"SBR-DURA-WHT-MAT-13OZ2SD-38X164","width":38,"length":1968},{"paceId":"3131","name":"SBR-DURA-WHT-MAT-13OZ2SD-54X164","width":54,"length":1968},{"paceId":"3134","name":"SBR-DURA-WHT-MAT-13OZ2SD-80X164","width":80,"length":1968},{"paceId":"6044","name":"SBR-DURA-WHT-MAT-13OZ2SD-63X164","width":63,"length":1968},{"paceId":"6049","name":"SBR-DURA-WHT-MAT-13OZ2SD-100X164","width":100,"length":1968}],"2":[{"paceId":"3123","name":"SBR-DURATEX BACKLIT 8MIL 72X1200","width":72,"length":1200},{"paceId":"3124","name":"SBR-DURATEX BACKLIT 8MIL 80X1200","width":80,"length":1200}],"282":[{"paceId":"5572","name":"SBR-3M-WHT-IJ180C10-02MIL-60X150","width":60,"length":1800}],"134":[{"paceId":"5850","name":"SBR-3M-WHT-IJ180CV3-02MIL-60X150","width":60,"length":1800}],"200":[{"paceId":"3242","name":"SBR-SIL-SLV-SAT-08MIL-42X165","width":42,"length":1980}],"73":[{"paceId":"3268","name":"SBR-ULTFX-MTWHT-18OZ-2SD-38X164","width":38,"length":1968},{"paceId":"3269","name":"SBR-ULTFX-MTWHT-18OZ-2SD-54X164","width":54,"length":1968},{"paceId":"3270","name":"SBR-ULTFX-MTWHT-18OZ-2SD-80X164","width":80,"length":1968}],"329":[{"paceId":"6169","name":"SUB-ULTRAFLEX-TEXTURED-2MM-78X98.4","width":78,"length":1180}],"23":[{"paceId":"3259","name":"SBR-ULTFX-MTWHT-13OZ-1SD-38X164","width":38,"length":1968},{"paceId":"3260","name":"SBR-ULTFX-MTWHT-13OZ-1SD-54X164","width":54,"length":1968},{"paceId":"3262","name":"SBR-ULTFX-MTWHT-13OZ-1SD-80X164","width":80,"length":1968}]};


var printConfig = {};
var deviceDefaults;


var cu = calcUtil;
var testLogic = {
	onCalcLoaded: function() {
		// get Device defaults from id
		var deviceId = configureglobals.cquote.lpjQuote.device.id;
		deviceDefaults = deviceDetails[deviceId] ? deviceDetails[deviceId] : null;
		$('#additionalProductFields .additionalInformation div label:contains("Optimum Roll Substrate Name")').parent().attr('id','optimum-substrate');
		$('#additionalProductFields .additionalInformation div label:contains("Optimum Roll Substrate ID")').parent().attr('id','optimum-substrate-id');
	},
	onQuoteUpdated: function(updates, validation, product) {
		cu.initFields();

		//if no device default the break out
		if (!deviceDefaults) {
			console.log('no device defaults defined');
			return
		}
		
		var rollWasteOp = fields.opeation135;
		if (rollWasteOp) {

		}
		var quote = configureglobals.cquote.lpjQuote ? configureglobals.cquote.lpjQuote : null;
		var pieceWidth = Number(cu.getWidth());
		var pieceHeight = Number(cu.getHeight());
		var pieceQty = cu.getTotalQuantity();
		var qty = Math.ceil(pieceQty * (1 + deviceDefaults.attrition));
		
		var totalSubCost = quote.aPrintSubstratePrice;
		var totalSquareFeet = quote.piece.totalSquareFeet;
		var subSqFtCost = totalSubCost / totalSquareFeet / pieceQty;

		var bleed = deviceDefaults.bleed;
		var devMargin = deviceDefaults.margin;
		var leadWasteLF = deviceDefaults.leadWasteLF;
		var gutter = deviceDefaults.gutter;

		//establish chosen default susbtrate config
		var defaultRoll = {
			"id" : configureglobals.cprintsubstratesmgr.choice.id,
			"name" : configureglobals.cprintsubstratesmgr.choice.productionName,
			"width" : configureglobals.cprintsubstratesmgr.choice.width,
			"length" : configureglobals.cprintsubstratesmgr.choice.height,
			"paceId" : configureglobals.cprintsubstratesmgr.choice.referenceId
		}
		console.log(defaultRoll.id);
		//get default roll config
		printConfig = getBestPrintConfig(defaultRoll);
		/*
		IF altRoll exist for substrate then Loop through each alternateRolls and check for best imposition 
		*/
		if (altRolls[defaultRoll.id]) {
			for (var i = 0; i < altRolls[defaultRoll.id].length; i++) {
				var rollConfig = getBestPrintConfig(altRolls[defaultRoll.id][i]);
				//if better cost value then overwrite printConfig
				if (rollConfig) {
					if (rollConfig.total_roll_cost < printConfig.total_roll_cost) {
						printConfig = rollConfig;
					}
				}
			}
		}

		//Paste difference from total_roll_cost - printed_roll_cost
		printConfig['roll_wastage'] = printConfig.total_roll_cost - totalSubCost;
		printConfig['roll_wastage_factor'] = Math.ceil( (printConfig.roll_wastage * 100) / pieceQty );
		if (fields.operation135_answer) {
			if (cu.getValue(fields.operation135_answer) != printConfig.roll_wastage_factor) {
				cu.changeField(fields.operation135_answer,printConfig.roll_wastage_factor,true);
				$('#optimum-substrate input').val(printConfig.substrate);
				$('#optimum-substrate-id input').val(printConfig.substrate_pace_id);
			}
		}
		var rollChangeOp = fields.operation138;
		var rollChangeOpAnswer = fields.operation138_answer;
		if (rollChangeOp) {
			if (printConfig.roll_change_cost > 0) {
				if (!cu.hasValue(rollChangeOp)) {
					cu.changeField(rollChangeOp, 682, true);
					return
				}
				var rollChangeFactor = parseInt(printConfig.roll_change_cost * 100000 / pieceQty);
				if (cu.getValue(rollChangeOpAnswer) != rollChangeFactor) {
					cu.changeField(rollChangeOpAnswer, rollChangeFactor, true);
					return
				}
			} else {
				if (cu.hasValue(rollChangeOp)) {
					cu.changeField(rollChangeOp, '', true);
					return
				}
			}
		}


		function getBestPrintConfig(roll) {
			var bestConfig;

			var horizontalPrintConfig = getPrintConfig(roll, pieceWidth, pieceHeight);
			horizontalPrintConfig['vertical_piece_orienation'] = false;
			var vertPrintConfig = getPrintConfig(roll, pieceHeight, pieceWidth);
			vertPrintConfig['vertical_piece_orienation'] = true;
			//Test which orientation yields the lowest susbtrate cost
			if (horizontalPrintConfig.valid && !vertPrintConfig.valid) {
				bestConfig = horizontalPrintConfig;
			} else if (!horizontalPrintConfig.valid && vertPrintConfig.valid) {
				bestConfig = vertPrintConfig;
			} else if (horizontalPrintConfig.total_roll_cost_plus_labor < vertPrintConfig.total_roll_cost_plus_labor) {
				bestConfig = horizontalPrintConfig;
			} else {
				bestConfig = vertPrintConfig;
			}
			return bestConfig
		}
		
		function getPrintConfig(roll, width, height) {
			var numDown, numRolls, printLfNeeded, numDownPerRoll, rollsNeeded, fullRolls, numDownLastRoll, lastRollLf, lastRollSqFt, rollChangeCost;
			var config = {};
			var vertical_piece_orienation = false;

			var printableLF = (roll.length / 12) - leadWasteLF;
			var fullRollArea = roll.width * roll.length / 144;
			var fullRollCost = fullRollArea * subSqFtCost; 

			//horizontal orientation
			var numAcross = Math.floor( (roll.width - (devMargin * 2)) / (width + (bleed * 2)) );
			var valid_quote = false;
			if (numAcross > 0) {
				valid_quote = true;
				numDown = Math.ceil(qty / numAcross);
				numRolls = Math.ceil( (numDown * (height + (bleed * 2))) / (roll.length - (leadWasteLF * 12)) );
				printLfNeeded = numDown * (height + (2 * bleed)) / 12 ;
				numDownPerRoll = Math.floor(printableLF / ((height + (2 * bleed)) / 12));
				rollsNeeded = Math.ceil(numDown / numDownPerRoll);
				fullRolls = Math.floor(numDown / numDownPerRoll);
				numDownLastRoll = numDown % numDownPerRoll;
				lastRollLf = numDownLastRoll * (height + (2 * bleed)) / 12;
				lastRollSqFt = (lastRollLf + leadWasteLF) * roll.width / 12;
				rollChangeCost = (rollsNeeded - 1) * deviceDefaults.rollChangeMins * deviceDefaults.hourlyRate / 60;
			}

			config = {
				'valid' : valid_quote,
				'roll_printable_LF' : printableLF,
				'piece_width_across' : width,
				'piece_width_down' : height,
				'piece_number_across' : numAcross,
				'piece_number_down' : numDown,
				'print_LF_needed' : printLfNeeded,
				'total_rolls' : rollsNeeded,
				'full_rolls' : fullRolls,
				'roll_change_cost' : rollChangeCost,
				'numDown_down_on_last_roll' : numDownLastRoll,
				'full_rolls_area' : fullRollArea * fullRolls,
				'full_rolls_cost' : fullRollCost * fullRolls,
				'last_roll_lf' : lastRollLf,
				'last_roll_square_feet' : lastRollSqFt,
				'last_roll_cost' : lastRollSqFt * subSqFtCost,
				'total_roll_square_feet' : (fullRollArea * fullRolls) + lastRollSqFt,
				'total_roll_cost' : (fullRolls * fullRollCost) + (lastRollSqFt * subSqFtCost),
				'total_roll_cost_plus_labor' : (fullRolls * fullRollCost) + (lastRollSqFt * subSqFtCost) + rollChangeCost,
				'substrate' : roll.name,
				'substrate_width' : roll.width,
				'substrate_length' : roll.length,
				'substrate_pace_id' : roll.paceId ? roll.paceId : null
			}
			//calculate roll 

			return config
		}
	}
}



configureEvents.registerOnCalcLoadedListener(testLogic);
//configureEvents.registerOnCalcChangedListener(testLogic);
configureEvents.registerOnQuoteUpdatedListener(testLogic);
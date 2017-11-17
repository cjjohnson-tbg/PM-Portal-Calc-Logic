
var calcConfig = {
	getUpdatedConfig: function(quote) {
		//clear out existing print config
		for (const prop of Object.keys(printConfig)) {
        	delete config[prop];
        }
		var deviceDefaults = quote.device;

		//if no device default the break out
		if (!deviceDefaults.customProperties) {
			console.log('no device custom properties defined');
			return
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
		//get default roll config
		printConfig = getBestPrintConfig(defaultRoll);
		/*
		IF altRoll exist for substrate then Loop through each alternateRolls and check for best imposition 
		*/
		var altRolls = quote.device.altRolls;
		if (altRolls) {
			for (var i = 0; i < altRolls.length; i++) {
				var altRollConfig = getBestPrintConfig(altRolls[i]);
				//if better cost value then overwrite printConfig
				if (altRollConfig) {
					if (altRollConfig.total_roll_cost < printConfig.total_roll_cost) {
						printConfig = altRollConfig;
					}
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
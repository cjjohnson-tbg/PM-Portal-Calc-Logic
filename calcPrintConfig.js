
var calcConfig = {
	getUpdatedConfig: function(quote) {
		//clear out existing print config
		for (const prop of Object.keys(printConfig)) {
        	delete printConfig[prop];
        }
		var deviceDefaults = quote.device;

		//if no device default the break out
		if (!deviceDefaults.customProperties) {
			console.log('no device custom properties defined');
			return
		}
		var quote = configureglobals.cquote.lpjQuote ? configureglobals.cquote.lpjQuote : null;
		var piece = quote.piece;
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
		var rollOptions = [];
		var defaultRoll = {
			"id" : configureglobals.cprintsubstratesmgr.choice.id,
			"name" : configureglobals.cprintsubstratesmgr.choice.productionName,
			"width" : configureglobals.cprintsubstratesmgr.choice.width,
			"length" : configureglobals.cprintsubstratesmgr.choice.height,
			"paceId" : configureglobals.cprintsubstratesmgr.choice.referenceId
		}
		rollOptions.push(defaultRoll);
		//Add in Roll Substrate Options
		var altRolls = quote.piece.aPrintSubstrate.altRolls;
		if (altRolls) {
			for (roll in altRolls) {
				rollOptions.push(altRolls[roll]);
			}
		}

		var materialOptions = {};
		var frontLams = quote.piece.frontLaminate ? quote.piece.frontLaminate.options : null;
		var backLams = quote.piece.backLaminate ? quote.piece.backLaminate.options : null;
		var mounts = quote.piece.mountSubstrate ? quote.piece.mountSubstrate.options : null;
		var aAdhesives = quote.piece.aAdhesiveLaminate ? quote.piece.aAdhesiveLaminate.options : null;
		var bAdhesives = quote.piece.bAdhesiveLaminate ? quote.piece.bAdhesiveLaminate.options : null;

		//Loop through all possible combinations ot options
		for (var roll = 0; roll < rollOptions.length; roll++) {
			for (var frontLam = 0; frontLam < (frontLams ? frontLams.length : 1); frontLam++) {
				for (var backLam = 0; backLam < (backLams ? backLams.length : 1); backLam++ ) {
					for (var mount = 0; mount < (mounts ? mounts.length : 1); mount++ ) {
						for (var aAdhesive = 0; aAdhesive < (aAdhesives ? aAdhesives.length : 1); aAdhesive++ ) {
							for (var bAdhesive = 0; bAdhesive < (bAdhesives ? bAdhesives.length : 1); bAdhesive++ ) {
								var materials = {
									"roll" : rollOptions[roll],
									"frontLam" : (frontLams ? frontLams[frontLam] : null),
									"backLam" : (backLams ? backLams[backLam] : null),
									"mount" : (mounts ? mounts[mount] : null),
									"aAdhesive" : (aAdhesives ? aAdhesives[backLam] : null),
									"bAdhesive" : (bAdhesives ? bAdhesives[backLam] : null)
								}
								setBestPrintConfig(materials);
							}
						}
					}
				}
			}
		}

		function setBestPrintConfig(materials) {
			var vertical_piece_orienation = false;
			getPrintConfig(materials, vertical_piece_orienation);

			//toggle orientation and rerun
			if (!vertical_piece_orienation) {
				vertical_piece_orienation = true;
				getPrintConfig(materials, vertical_piece_orienation);
			}
		}

		function getPrintConfig(materials, vertical_piece_orienation) {
			var numDown, numRolls, printLfNeeded, numDownPerRoll, rollsNeeded, fullRolls, numDownLastRoll, lastRollLf, lastRollSqFt, rollChangeCost, vertical_piece_orienation;
			var config = {};

			var roll = materials.roll;

			var pieceWidth = vertical_piece_orienation ? piece.width : piece.height;
			var pieceHeight = vertical_piece_orienation ? piece.height : piece.width;

			var printableLF = (roll.length / 12) - leadWasteLF;
			//set printable width as smallest width of all materials
			var printableWidth = getPrintableWidth(materials);
			printableWidth = printableWidth - (devMargin *2);
			var fullRollArea = roll.width * roll.length / 144;
			var fullRollCost = fullRollArea * subSqFtCost;

			var numAcross = Math.floor( (printableWidth - (devMargin * 2)) / (pieceWidth + (bleed * 2)) );
			var valid_quote = false;
			if (numAcross > 0) {
				valid_quote = true;
				numDown = Math.ceil(qty / numAcross);
				numRolls = Math.ceil( (numDown * (pieceHeight + (bleed * 2))) / (roll.length - (leadWasteLF * 12)) );
				printLfNeeded = numDown * (pieceHeight + (2 * bleed)) / 12 ;
				numDownPerRoll = Math.floor(printableLF / ((pieceHeight + (2 * bleed)) / 12));
				rollsNeeded = Math.ceil(numDown / numDownPerRoll);
				fullRolls = Math.floor(numDown / numDownPerRoll);
				numDownLastRoll = numDown % numDownPerRoll;
				lastRollLf = numDownLastRoll * (pieceHeight + (2 * bleed)) / 12;
				lastRollSqFt = (lastRollLf + leadWasteLF) * printableWidth / 12;
				rollChangeCost = (rollsNeeded - 1) * deviceDefaults.rollChangeMins * deviceDefaults.hourlyRate / 60;
			}

			config = {
				'valid' : valid_quote,
				'roll_printable_LF' : printableLF,
				'roll_printable_width' : printableWidth,
				'piece_width_across' : pieceWidth,
				'piece_width_down' : pieceHeight,
				'piece_number_across' : numAcross,
				'piece_number_down' : numDown,
				'print_LF_needed' : printLfNeeded,
				'total_rolls' : rollsNeeded,
				'full_rolls' : fullRolls,
				'roll_change_cost' : rollChangeCost,
				'roll_change_mins' : (rollsNeeded - 1) * deviceDefaults.rollChangeMins,
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
				'substrate_pace_id' : roll.paceId ? roll.paceId : null,
				'materials' : {}
			}
			//insert material to config 
			for (mat in materials) {
				if (materials[mat]) {
					config.materials[mat] = materials[mat];
				}
			}

			//if total cost is less, reassign to new config
			if (config.valid) {
				//if first time ran and printConfig has no properties
				if (Object.keys(printConfig).length == 0) {
					window.printConfig = config;
				} else if (config.total_roll_cost_plus_labor < printConfig.total_roll_cost_plus_labor) {
					window.printConfig = config;
				}
			}
		}

		function getPrintableWidth(materials) {
			//loop through each of the materials and set printable width equal to smallest number
			var result;
			for (mat in materials) {
				if (materials[mat]) {
					if (materials[mat].hasOwnProperty('width')) {
						var matWidth = materials[mat].width;
						if (matWidth) {
							if (result === undefined) {
								result = matWidth;
							} else if (matWidth < result) {
								result = matWidth;
							}
						}
					}
				}
			}
			return result
		}

	}
}

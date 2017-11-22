
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
		var altRolls = quote.piece.aPrintSubstrate.options;
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
			var printableWidth = getPrintableDim(materials, 'width', devMargin);
			config.printableWidth = printableWidth;
			var printableLen = getPrintableDim(materials, 'length', devMargin);
			config.printableLen = printableLen;

			var fullRollArea = roll.width * roll.length / 144;
			var fullRollCost = fullRollArea * subSqFtCost;

			//insert materials to config 
			for (mat in materials) {
				if (materials[mat]) {
					config[mat] = materials[mat];
				}
			}

			var numAcross = Math.floor( printableWidth / (pieceWidth + (bleed * 2)) );
			
			config.valid_quote = false;
			if (numAcross > 0) {
				config.valid_quote  = true;
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



			config.roll_printable_LF = printableLF;
			config.roll_printable_width = printableWidth;
			config.piece_width_across = pieceWidth;
			config.piece_width_down = pieceHeight;
			config.piece_number_across = numAcross;
			config.piece_number_down = numDown;
			config.print_LF_needed = printLfNeeded;
			config.total_rolls = rollsNeeded;
			config.full_rolls = fullRolls;
			config.roll_change_cost = rollChangeCost;
			config.roll_change_mins = (rollsNeeded - 1) * deviceDefaults.rollChangeMins;
			config.numDown_down_on_last_roll = numDownLastRoll;
			config.full_rolls_area = fullRollArea * fullRolls;
			config.full_rolls_cost = fullRollCost * fullRolls;
			config.last_roll_lf = lastRollLf;
			config.last_roll_square_feet = lastRollSqFt;
			config.last_roll_cost = lastRollSqFt * subSqFtCost;
			config.total_roll_square_feet = (fullRollArea * fullRolls) + lastRollSqFt;
			config.total_roll_cost = (fullRolls * fullRollCost) + (lastRollSqFt * subSqFtCost);
			config.total_roll_cost_plus_labor = (fullRolls * fullRollCost) + (lastRollSqFt * subSqFtCost) + rollChangeCost;
			config.substrate = roll.name;
			config.substrate_width = roll.width;
			config.substrate_length = roll.length;
			config.substrate_pace_id = roll.paceId ? roll.paceId : null;

			//Create quote property to hold pricing for each 

			//if total cost is less, reassign to new config
			if (config.valid_quote) {
				//if first time ran and printConfig has no properties
				if (Object.keys(printConfig).length == 0) {
					window.printConfig = config;
				} else if (config.total_roll_cost_plus_labor < printConfig.total_roll_cost_plus_labor) {
					window.printConfig = config;
				}
			}
		}

		function getPrintableDim(materials, dim, margin) {
			//loop through each of the materials and set printable variable equal to smallest number
			var result;
			for (mat in materials) {
				if (materials[mat]) {
					if (materials[mat].hasOwnProperty(dim)) {
						var matDim = materials[mat][dim];
						if (matDim) {
							if (result === undefined) {
								result = matDim;
							} else if (matDim < result) {
								result = matDim;
							}
						}
					}
				}
			}
			return margin ? (result - (margin *2)) : result
		}
	},

	getLamWaste : function(quote) {
		//pulls calculated lam materials needed from printConfig and compare against Coll calculation
		var collFrontLamCost = quote.frontLaminatePrice ? quote.frontLaminatePrice : 0;
		var collBackLamCost = quote.backLaminatePrice ? quote.backLaminatePrice : 0;
		var ccFrontLamCost = 0;
		var ccBackLamCost = 0;
		if (printConfig.frontLam) {
			ccFrontLamCost = printConfig.frontLam.price * printConfig.lam_lf_with_spoilage;
		}
		if (printConfig.backLam) {
			ccBackLamCost = printConfig.backLam.price * printConfig.lam_lf_with_spoilage;
		}
		return ccFrontLamCost + ccBackLamCost - collFrontLamCost - collBackLamCost
	}
}

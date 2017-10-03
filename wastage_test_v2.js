var deviceDefaults = {
    "leadWasteLF" : 10,
	"bleed" : .25,
	"margin" : 1,
	"gutter" : 0,
	"attrition" : .02
}
var x = {
	"alternateRolls" : 
		[
			{ 
				"id" : 3259,
				"name" : "13OZ-38X164-ULTRAFLEX BANNER SCRIM-1 SIDED-WHITE",
				"width" : 38,
				"length" : 1968
			},
			{ 
				"id" : 3620,
				"name" : "13OZ-54X164-ULTRAFLEX BANNER SCRIM-1 SIDED-WHITE",
				"width" : 54,
				"length" : 1968
			},
			{ 
				"id" : 3262,
				"name" : "13OZ-80X164-ULTRAFLEX BANNER SCRIM-1 SIDED-WHITE",
				"width" : 80,
				"length" : 1968
			},
			{ 
				"id" : 3258,
				"name" : "13OZ-126X164-ULTRAFLEX BANNER SCRIM-1 SIDED-WHITE",
				"width" : 126,
				"length" : 1968
			}
		]
}

var printConfig = {};

var cu = calcUtil;
var testLogic = {
	onCalcLoaded: function() {
		$('#additionalProductFields .additionalInformation div label:contains("Optimum")').parent().attr('id','optimum-substrate');
	},
	onQuoteUpdated: function(updates, validation, product) {
		cu.initFields();
		var pieceWidth = Number(cu.getWidth());
		var pieceHeight = Number(cu.getHeight());
		var pieceQty = cu.getTotalQuantity();
		var qty = Math.ceil(pieceQty * (1 + deviceDefaults.attrition));
		
		var totalSubCost = configureglobals.cquote.lpjQuote.aPrintSubstratePrice;
		var totalSquareFeet = configureglobals.cquote.lpjQuote.piece.totalSquareFeet;
		var subSqFtCost = totalSubCost / totalSquareFeet / qty;

		var bleed = deviceDefaults.bleed;
		var devMargin = deviceDefaults.margin;
		var leadWasteLF = deviceDefaults.leadWasteLF;
		var gutter = deviceDefaults.gutter;

		//establish chosen default susbtrate config
		var defaultRoll = {
			"id" : configureglobals.cprintsubstratesmgr.choice.id,
			"name" : configureglobals.cprintsubstratesmgr.choice.productionName,
			"width" : configureglobals.cprintsubstratesmgr.choice.width,
			"length" : configureglobals.cprintsubstratesmgr.choice.height
		}
		printConfig = getBestPrintConfig(defaultRoll);
		console.log(printConfig);

		/*
		Loop through each alternateRolls and check for best imposition 
		*/
		
		for (var i = 0; i < x.alternateRolls.length; i++) {
			var rollConfig = getBestPrintConfig(x.alternateRolls[i]);
			//if better cost value then overwrite printConfig
			if (rollConfig) {
				if (rollConfig.total_roll_cost < printConfig.total_roll_cost) {
					printConfig = rollConfig;
				}
			}
		}

		//Paste difference from total_roll_cost - printed_roll_cost
		printConfig['roll_wastage'] = Math.ceil( ((printConfig.total_roll_cost - totalSubCost) * 100) / pieceQty );
		if (cu.getValue(fields.operation166_answer) != printConfig.roll_wastage) {
			cu.changeField(fields.operation166_answer,printConfig.roll_wastage,true);
			$('#optimum-substrate input').val(printConfig.substrate);
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
			} else if (horizontalPrintConfig.total_roll_cost < vertPrintConfig.total_roll_cost) {
				bestConfig = horizontalPrintConfig;
			} else {
				bestConfig = vertPrintConfig;
			}
			return bestConfig
		}
		
		function getPrintConfig(roll, width, height) {
			var numDown, numRolls, printLfNeeded, numDownPerRoll, rollsNeeded, fullRolls, numDownLastRoll, lastRollLf, lastRollSqFt;
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
				fullRolls = rollsNeeded - 1;
				numDownLastRoll = numDown % numDownPerRoll;
				lastRollLf = numDownLastRoll * (height + (2 * bleed)) / 12;
				lastRollSqFt = (lastRollLf + leadWasteLF) * roll.width / 12;
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
				'numDown_down_on_last_roll' : numDownLastRoll,
				'full_rolls_area' : fullRollArea * fullRolls,
				'full_rolls_cost' : fullRollCost * fullRolls,
				'last_roll_lf' : lastRollLf,
				'last_roll_square_feet' : lastRollSqFt,
				'last_roll_cost' : lastRollSqFt * subSqFtCost,
				'total_roll_square_feet' : (fullRollArea * fullRolls) + lastRollSqFt,
				'total_roll_cost' : (fullRolls * fullRollCost) + (lastRollSqFt * subSqFtCost),
				'substrate_id' : roll.id,
				'substrate' : roll.name,
				'substrate_width' : roll.width,
				'substrate_length' : roll.length
			}

			return config
		}
	}
}



configureEvents.registerOnCalcLoadedListener(testLogic);
//configureEvents.registerOnCalcChangedListener(testLogic);
configureEvents.registerOnQuoteUpdatedListener(testLogic);
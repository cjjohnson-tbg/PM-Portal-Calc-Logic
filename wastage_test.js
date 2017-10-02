var deviceDefaults = {
	"leadWasteLF" : 10,
	"bleed" : .25,
	"margin" : 1
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
};

var printConfig = {};

var cu = calcUtil;
var testLogic = {
	onQuoteUpdated: function(updates, validation, product) {
		cu.initFields();
		var pieceWidth = Number(cu.getWidth());
		var pieceHeight = Number(cu.getHeight());
		var qty = cu.getTotalQuantity();
		
		var totalSubCost = configureglobals.cquote.lpjQuote.aPrintSubstratePrice;
		var totalSquareFeet = configureglobals.cquote.lpjQuote.piece.totalSquareFeet;
		var subSqFtCost = totalSubCost / totalSquareFeet / qty;

		var bleed = deviceDefaults.bleed;
		var devMargin = deviceDefaults.margin;
		var leadWasteLF = deviceDefaults.leadWasteLF;

		//establish chosen config
		var defaultRoll = {
			"id" : configureglobals.cprintsubstratesmgr.choice.id,
			"name" : configureglobals.cprintsubstratesmgr.choice.name,
			"width" : configureglobals.cprintsubstratesmgr.choice.width,
			"height" : configureglobals.cprintsubstratesmgr.choice.height
		}
		printConfig = getPrintConfig(defaultRoll);
		console.log(printConfig);

		/*
		Loop through each availableRoll, 
		determine imposisition
		determine total substrate sq ft needed
		waste = total finished - total needed
		after loop, enter waste $ into operation
		*/
		
		x.alternateRolls.forEach(function(roll) {
			var rollConfig = getPrintConfig(roll);
			if (rollConfig.total_substrate_cost < printConfig.total_substrate_cost && rollConfig.valid) {
				printConfig = rollConfig;
			}
		});


		function getPrintConfig(roll) {
			var config = {};
			var vertical_piece_orienation = false;

			//horizontal orientation
			var numAcross = Math.floor( (roll.width - (devMargin * 2)) / (pieceWidth + (bleed * 2)) );
			var hValid = false;
			if (numAcross > 0) {
				hValid = true;
				var numDown = Math.ceil(qty / numAcross);
				var numRolls = Math.ceil((numDown * pieceHeight + (bleed * 2)) / (roll.height - leadWasteLF));
				// wastage + print
				//var totalSubsSqFoot = (roll.width * (pieceHeight + (bleed * 2)) * numDown / 144) + (leadWasteLF * numRolls * 12);

				//##### STOPING HERE FOR THE NIGHT.  NEED TO FIGURE OUT EQUATION FOR NUMBER OF ROLLS AND REMAINDER ON LAST ROLL ###
				
				var totalSubsSqFoot = FullRollCost - remainder;
				var totalSubsSqFoot = ((numRolls - 1) * (roll.width * roll.height) * subSqFtCost) 
					+ ((roll.width / 12));
			}

			//vertical orientiation
			var vertNumAcross = Math.floor( (roll.width - (devMargin * 2)) / (pieceHeight + (bleed * 2)) );
			var vValid = false
			if (vertNumAcross > 0) {
				vValid = true;
				var vertNumDown = Math.ceil(qty / vertNumAcross);
				var vertNumRolls = Math.ceil((vertNumDown * pieceWidth + (bleed * 2)) / (roll.height -leadWasteLF));
				var vertTotalSubsSqFoot = (roll.width * (pieceWidth + (bleed * 2)) * numDown / 144) + (leadWasteLF * numRolls * 12);
			}
			
			if (vertTotalSubsSqFoot < totalSubsSqFoot) {
				vertical_piece_orienation = true;
			}
			config = {
				'valid' : (!hValid && !vValid) ? false : true,
				'vertical_piece_orienation' : vertical_piece_orienation,
				'piece_width_across' : vertical_piece_orienation ? pieceWidth : pieceHeight,
				'piece_width_down' : vertical_piece_orienation ? pieceHeight : pieceWidth,
				'piece_number_across' : vertical_piece_orienation ? vertNumAcross : numDown,
				'piece_number_down' : vertical_piece_orienation ? vertNumDown : vertNumDown,
				'total_substrate_square_feet' : vertical_piece_orienation ? vertTotalSubsSqFoot : totalSubsSqFoot ,
				'total_substrate_cost' : vertical_piece_orienation ? vertTotalSubsSqFoot * subSqFtCost : totalSubsSqFoot * subSqFtCost,
				'number_rolls' : vertical_piece_orienation ? vertNumRolls : numRolls,
				'substrate_id' : roll.id,
				'substrate' : roll.name,
				'substrate_width' : roll.width,
				'substrate_length' : roll.length
			}

			return config
		}
	}
}



//configureEvents.registerOnCalcLoadedListener(testLogic);
//configureEvents.registerOnCalcChangedListener(testLogic);
configureEvents.registerOnQuoteUpdatedListener(testLogic);
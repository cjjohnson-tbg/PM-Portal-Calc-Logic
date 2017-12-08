
var calcConfig = {
	getUpdatedConfig: function(quote) {
		//clear out existing print config
		for (const prop of Object.keys(printConfig)) {
        	delete printConfig[prop];
        }
		var deviceDefaults = quote.device;

		//declare all configs to capture data for analysis
		window.allConfigs = [];
		window.allTotalCost = [];

		//if no device default the break out
		if (!deviceDefaults.customProperties) {
			console.log('no device custom properties defined');
			return
		}
		var quote = configureglobals.cquote.lpjQuote ? configureglobals.cquote.lpjQuote : null;
		var piece = quote.piece;
		var pieceQty = cu.getTotalQuantity();
		var productionQty = Math.ceil(pieceQty * (1 + deviceDefaults.attrition));
		
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
									"frontLaminate" : (frontLams ? frontLams[frontLam] : null),
									"backLaminate" : (backLams ? backLams[backLam] : null),
									"mountSubstrate" : (mounts ? mounts[mount] : null),
									"aAdhesiveLaminate" : (aAdhesives ? aAdhesives[backLam] : null),
									"bAdhesiveLaminate" : (bAdhesives ? bAdhesives[backLam] : null)
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

			//toggle orientation and rerun if sides different
			if (piece.width != piece.height) {
				if (!vertical_piece_orienation) {
					vertical_piece_orienation = true;
					getPrintConfig(materials, vertical_piece_orienation);
				}
			}
		}

		function getPrintConfig(materials, vertical_piece_orienation) {
			var nDownTotal, numRolls, printLfNeeded, nDownTotalPerRoll, rollsNeeded, fullRolls, nDownTotalLastRoll, lastRollLf, lastRollSqFt, rollChangeCost, vertical_piece_orienation;
			var config = {};
			config.vertPiece = vertical_piece_orienation;

			var roll = materials.roll;

			var pieceWidth = vertical_piece_orienation ? piece.width : piece.height;
			var pieceHeight = vertical_piece_orienation ? piece.height : piece.width;
			
			config.productionQty = productionQty;

			//set printable width as smallest width of all materials
			config.formWidth = getSignatureDim(materials, 'width');
			config.printableWidth = config.formWidth - (2 * devMargin);

			//special Exception, if 126" roll form Length = 200, else 120 or min set by subsrate
			config.formLength = roll.width == 126 ? Math.max(pieceHeight, 200) : Math.max(pieceHeight, 120);
			//if limited by substrates, update formLength
			var minMatLength = getSignatureDim(materials, 'length');
			if (config.formLength > minMatLength) {
				config.formLength = minMatLength;
			}

			config.printableLength = config.formLength - (2 * devMargin);

			//insert materials to config 
			for (mat in materials) {
				if (materials[mat]) {
					config[mat] = materials[mat];
				}
			}

			config.nAcrossForm = Math.floor( config.printableWidth / (pieceWidth + ( (bleed + gutter) * 2)) );
			config.nDownForm = Math.floor( config.printableLength / (pieceHeight + ( (bleed + gutter) * 2)) );
			config.nUpPerForm = config.nAcrossForm * config.nDownForm;

			config.nDownTotal = Math.ceil(productionQty / config.nAcrossForm);


			//production quantity must round up if not equal to # across to fill up 1 full signature
			config.totalForms = Math.ceil( config.productionQty / config.nUpPerForm );
			config.totalFormLF = config.totalForms * config.formLength / 12;
			config.totalFullForms = Math.floor( config.productionQty / config.nUpPerForm );
			
			config.nDownLastForm =  config.nDownTotal % config.nDownForm;
			config.lastPartialFormLF = config.nDownLastForm * (pieceHeight + (2 * (bleed + gutter) )) / 12;

			config.valid_quote = (config.nAcrossForm > 0 && config.nDownForm > 0) ? true : false;

			/***** 
			  calculate materials usage based on signature 
			******/
			// Substrate
			if (config.roll) {
				var cr = config.roll;
				if (!cr.price) {
					cr.price = subSqFtCost * cr.width / 12;
				}
				cr.leadWasteLF = leadWasteLF;
				cr.printableRollLen = cr.length - (leadWasteLF * 12);
				cr.formsPerRoll = Math.floor(cr.printableRollLen / config.formLength);
				cr.fullRolls = Math.floor(config.totalForms / cr.formsPerRoll);

				cr.formsOnLastRoll = config.totalForms % cr.formsPerRoll;
				cr.fullFormsOnLastRoll = config.totalFullForms % cr.formsPerRoll;
				cr.lastPartialFormLF = config.lastPartialFormLF;
				cr.lastRollLf = leadWasteLF + (cr.fullFormsOnLastRoll * config.formLength) / 12 + cr.lastPartialFormLF;
				cr.totalRollLF = cr.fullRolls * (cr.length / 12) + cr.lastRollLf;
				cr.totalRollMatCost = cr.totalRollLF * cr.price;

				//calc roll change
				cr.rollChangeMins = cr.fullRolls * deviceDefaults.rollChangeMins;
				cr.rollChangeCost = cr.fullRolls * deviceDefaults.rollChangeMins * deviceDefaults.hourlyRate / 60;
				//temp check for roll change calc error
				if (isNaN(cr.rollChangeCost)) {
					var stop = 1;
				}
				cr.totalCost = cr.totalRollMatCost + cr.rollChangeCost;

				//now assign roll calculations to aPrintSusbtrate and bPrintSubstrate, if present
				if (quote.piece.aPrintSubstrate) {
					config.aPrintSubstrate = {};
					var ca = config.aPrintSubstrate;
					//assign all properties of Roll to aPrintSubstrate
					for (prop in config.roll) {
						config.aPrintSubstrate[prop] = config.roll[prop];
					}
				}
				if (quote.piece.bPrintSubstrate) {
					config.bPrintSubstrate = {};
					var cb = config.bPrintSubstrate;
					//assign all properties of Roll to aPrintSubstrate
					for (prop in config.roll) {
						config.bPrintSubstrate[prop] = config.roll[prop];
					}
				}
			}

			// Laminates
			//Build in lamLF and spoilage even if no lam involved
			config.lamLf = (config.formLength * config.totalFullForms) / 12 + config.lastPartialFormLF;
			var lamLfWithSpoilage = getLamWithSpoilage(config.lamLf);
			if (!isNaN(lamLfWithSpoilage)) {
				config.lamLfWithSpoilage = roundTo(lamLfWithSpoilage, 1);
			}
			//laminates based on total LF of full signatures plus partial LF 
			if (config.frontLaminate) {
				var cf = config.frontLaminate;
				if (!cf.price) {
					cf.price = (quote.frontLaminatePrice / totalSquareFeet) * cf.width / 12;
				}
				cf.frontLamLF = config.lamLfWithSpoilage ? config.lamLfWithSpoilage : config.formLength + config.lastPartialFormLF;
				cf.totalCost = cf.frontLamLF * cf.price;
			}
			if (config.backLaminate) {
				var cb = config.backLaminate;
				if (!cb.price) {
					cb.price = (quote.backLaminatePrice / totalSquareFeet) * cb.width / 12;
				}
				cb.backLamLF = config.lamLfWithSpoilage ? config.lamLfWithSpoilage : config.formLength + config.lastPartialFormLF;
				cb.totalCost = cb.backLamLF * cb.price;
			}

			// Mounts
			// Cost based on full sheets used.  Partials count as 1 full
			if (config.mountSubstrate) {
				var cm = config.mountSubstrate;
				if (!cm.price) {
					cm.price = (quote.mountSubstratePrice / totalSquareFeet) * cm.width * cm.length / 144;
				}
				cm.totalMountSubstrates = config.totalForms;
				cm.totalCost = cm.totalMountSubstrates * cm.price;
			}

			// Adhesives
			// Cost based on total LF of Signatures
			if (config.aAdhesiveLaminate) {
				var caa = config.aAdhesiveLaminate;
				if (!caa.price) {
					caa.price = (quote.aAdhesiveLaminatePrice / totalSquareFeet) + caa.width / 12;
				}
				caa.lfNeeded = config.totalFormLF;
				caa.totalCost = caa.lfNeeded * caa.price;
			}
			if (config.bAdhesiveLaminate) {
				var cba = config.bAdhesiveLaminate;
				if (!cba.price) {
					cba.price = (quote.aAdhesiveLaminatePrice / totalSquareFeet) + cba.width / 12;
				}
				cba.lfNeeded = config.totalFormLF;
				cba.totalCost = cba.lfNeeded * cba.price;
			}

			//Combine all costs into a single quote area
			config.quote = {
				'aPrintSubstrateCost' : (config.aPrintSubstrate ? config.aPrintSubstrate.totalCost : 0),
				'bPrintSubstrateCost' : (config.bPrintSubstrate ? config.bPrintSubstrate.totalCost : 0),
				'frontLaminateCost' : (config.frontLaminate ? config.frontLaminate.totalCost : 0),
				'backLaminateCost' : (config.backLaminate ? config.backLaminate.totalCost : 0),
				'mountSubstrateCost' : (config.mountSubstrate ? config.mountSubstrate.totalCost : 0),
				'aAdhesiveLaminateCost' : (config.aAdhesiveLaminate ? config.aAdhesiveLaminate.totalCost : 0),
				'bAdhesiveLaminateCost' : (config.bAdhesiveLaminate ? config.bAdhesiveLaminate.totalCost : 0)
			}
			//add up all values 
			config.totalCost = 0;
			for (prop in config.quote) {
				config.totalCost += config.quote[prop]
			}
			config.totalCost = Math.round(config.totalCost * 100) / 100;

			//push config to all configs for review
			window.allConfigs.push(config);
			window.allTotalCost.push(config.totalCost);
			//if total cost is less, reassign to new config
			if (config.valid_quote) {
				//if first time ran and printConfig has no properties
				if (Object.keys(printConfig).length == 0) {
					window.printConfig = config;
				} else if (config.totalCost < printConfig.totalCost) {
					window.printConfig = config;
				}
			}
		}

		function getSignatureDim(materials, dim) {
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
			return result
		}

		//loop through points to create cumulative spoilage
		function getLamWithSpoilage(matLength) {
			var spoilPoints = [[999, .06],[1999, .04],[2999, .03],[3999,.025],[4999,.02],[5000,.015]];
			var spoilLf = 0;
			var lastPt = 0;
			for (var i = 0; i < spoilPoints.length; i++) {
				if (matLength < spoilPoints[i][0]) {
					spoilLf += ((matLength - lastPt) * spoilPoints[i][1]);
				break
				} else if (i == (spoilPoints.length - 1)) {
					spoilLf += (matLength - spoilPoints[i][0]) * spoilPoints[i][1];
					break
				} else {
					spoilLf += (spoilPoints[i][0] - lastPt) * spoilPoints[i][1];
					lastPt = spoilPoints[i][0];
				}
			}
			return Number(matLength + spoilLf)
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


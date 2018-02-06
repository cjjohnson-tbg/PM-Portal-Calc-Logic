var calcConfig = {
	getUpdatedConfig: function(quote) {
		this.initDatFields();
		this.setDatFields(quote);
		this.setMaterials(quote);  //SHOULD THIS BE A HELPER FUNCTOIN ASSIGNED TO this.materials ??
		this.allConfigs = this.getAllConfigs(this.materials, quote, this.dat);
		this.printConfig = this.getBestPrintConfig(this.allConfigs);
	},
	getBestPrintConfig: function(configs) {
		//loop through allConfigs and choose best.  assign to this.printConfig
		var result;
		var index = 0;
		for (var i = 0; i < configs.length; i++) {
			configs[i].index = index;
			if (!configs[i].details) {
				continue
			}
			if (!configs[i].details.valid_quote) {
				continue
			}
			if (result === undefined) {
				result = configs[i];
			} else {
				if (configs[i].quote.totalCost < result.quote.totalCost) {
					result = configs[i];
				}
			}
			index++;
		}
		if (!result) {
			console.log('alert not a valid quote generated');
		}
		return result
	},
	initDatFields: function() {
		this.printConfig  = {};
		this.dat = {};
		this.materials = {};
	},
	setDatFields: function(quote) {
		this.dat.devDefaults = quote.device.customProperties ? quote.device.customProperties : '';
		this.dat.productionQty = configureglobals.cquote.lpjQuote.productionQuantity;
		this.dat.totalSquareFeet = quote.piece.totalSquareFeet;
		this.dat.subSqFtCost = quote.aPrintSubstratePrice / (this.dat.totalSquareFeet * this.dat.productionQty);
	},
	setMaterials: function(quote) {
		if (!this.materials) {
			console.log('no materials defined');
			return
		}
		this.materials.aPrintSubstrates = matHelper.getAllSubstrateOptions(quote.piece.aPrintSubstrate, configureglobals);
		this.materials.bPrintSubstrates = quote.piece.bPrintSubstrate ? matHelper.getAllSubstrateOptions(quote.piece.bPrintSubstrate, configureglobals) : null;
		this.materials.frontLams = quote.piece.frontLaminate ? quote.piece.frontLaminate.options : null;
		this.materials.backLams = quote.piece.backLaminate ? quote.piece.backLaminate.options : null;
		this.materials.mounts = quote.piece.mountSubstrate ? quote.piece.mountSubstrate.options : null;
		this.materials.aAdhesives = quote.piece.aAdhesiveLaminate ? quote.piece.aAdhesiveLaminate.options : null;
		this.materials.bAdhesives = quote.piece.bAdhesiveLaminate ? quote.piece.bAdhesiveLaminate.options : null;
	},
	getAllConfigs: function(materialList, quote, dat) {
		var allConfigOptions = configHelper.getAllMaterialConfigOptions(materialList);
		var allConfigs = configHelper.getAllConfigsFromList(allConfigOptions, quote, dat);
		return allConfigs
	}
}

var configHelper = {
	getAllMaterialConfigOptions: function(materialList) {
		var result = [];
		for (var aPrintSub = 0; aPrintSub < materialList.aPrintSubstrates.length; aPrintSub++) {
			for (var bPrintSub = 0; bPrintSub < (materialList.bPrintSubstrates ? materialList.bPrintSubstrates.length : 1); bPrintSub++) {
				for (var frontLam = 0; frontLam < (materialList.frontLams ? materialList.frontLams.length : 1); frontLam++) {
					for (var backLam = 0; backLam < (materialList.backLams ? materialList.backLams.length : 1); backLam++ ) {
						for (var mount = 0; mount < (materialList.mounts ? materialList.mounts.length : 1); mount++ ) {
							for (var aAdhesive = 0; aAdhesive < (materialList.aAdhesives ? materialList.aAdhesives.length : 1); aAdhesive++ ) {
								for (var bAdhesive = 0; bAdhesive < (materialList.bAdhesives ? materialList.bAdhesives.length : 1); bAdhesive++ ) {
									var materials = {
										"aPrintSubstrate" : materialList.aPrintSubstrates[aPrintSub],
										"bPrintSubstrate" : (materialList.bPrintSubstrates ? materialList.bPrintSubstrates[bPrintSub] : null),
										"frontLaminate" : (materialList.frontLams ? materialList.frontLams[frontLam] : null),
										"backLaminate" : (materialList.backLams ? materialList.backLams[backLam] : null),
										"mountSubstrate" : (materialList.mounts ? materialList.mounts[mount] : null),
										"aAdhesiveLaminate" : (materialList.aAdhesives ? materialList.aAdhesives[aAdhesive] : null),
										"bAdhesiveLaminate" : (materialList.bAdhesives ? materialList.bAdhesives[bAdhesive] : null)
									}
									result.push(materials);
								}
							}
						}
					}
				}
			}
		}
		return result
	},
	getAllConfigsFromList: function(configs, quote, dat) {
		var results = [];
		for (var i = 0; i < configs.length; i++) {
			var vertical_piece_orienation = false;
			var horizConfig = this.getPrintConfig(configs[i], quote, dat, vertical_piece_orienation);
			results.push(horizConfig);
			//toggle orientation and rerun if sides different
			if (quote.piece.width != quote.piece.height) {
				vertical_piece_orienation = true;
				var vertConfig = this.getPrintConfig(configs[i], quote, dat, vertical_piece_orienation);
				results.push(vertConfig);
			}
		}
		return results
	},
	getPrintConfig: function(materials, quote, dat, vertical_piece_orienation) {
		var results = {};
		var jobDetails = this.getConfigDetails(materials, quote.piece, dat, vertical_piece_orienation);
		results.details = jobDetails;
		var configMaterials = this.getConfigMaterials(materials); //removes empty materials
		var matCalculatedFields = matHelper.getMaterialCalculedFields(configMaterials, jobDetails, quote, dat);
		//add new fields to material list
		for (var material in matCalculatedFields) {
			for (var field in matCalculatedFields[material]) {
				configMaterials[material][field] = matCalculatedFields[material][field];
			}
		}
		results.materials = configMaterials;
		results.quote = this.getTotalCosts(configMaterials);
		var stop = 1;
		return results
	},
	getTotalCosts: function(materials) {
		var costs = {};
		var totalCost = 0;
		for (var material in materials) {
			costs[material] = materials[material].totalCost;
			if (!isNaN(materials[material].totalCost)) {
				totalCost += materials[material].totalCost;
			}
		}
		costs.totalCost = totalCost;
		return costs
	},
	getConfigDetails: function(mats, piece, dat, vertical_piece_orienation) {
		var details = {};
		details.vertPiece = vertical_piece_orienation;
		var pieceWidth = vertical_piece_orienation ? piece.height : piece.width;
		var pieceHeight = vertical_piece_orienation ? piece.width : piece.height;

		details.pieceWidth = pieceWidth;
		details.pieceHeight = pieceHeight;

		details.productionQty = dat.productionQty;
		details.sides = piece.sides;
		//set printable width as smallest width of all materials
		details.formWidth = this.getSignatureDim(mats, 'width');
		details.printableWidth = details.formWidth - (2 * dat.devDefaults.margin);

		details.formLengthMax = this.getFormLength(mats, pieceHeight);
		details.printableLength = details.formLengthMax - (2 * dat.devDefaults.margin);

		details.nAcrossForm = Math.floor( details.printableWidth / (pieceWidth + ( (dat.devDefaults.bleed + dat.devDefaults.gutter) * 2)) );
		details.nDownForm = Math.floor( details.printableLength / (pieceHeight + ( (dat.devDefaults.bleed + dat.devDefaults.gutter) * 2)) );
		details.nUpPerForm = details.nAcrossForm * details.nDownForm;
		details.nDownTotal = Math.ceil(dat.productionQty / details.nAcrossForm);
		details.formLength = details.nDownForm * (pieceHeight + ( (dat.devDefaults.bleed + dat.devDefaults.gutter) * 2) );

		//production quantity must round up if not equal to # across to fill up 1 full signature
		details.totalForms = Math.ceil( dat.productionQty / details.nUpPerForm );
		details.totalFormLF = details.totalForms * details.formLength / 12;
		details.totalFullForms = Math.floor( details.nDownTotal / details.nDownForm );
		details.nDownLastForm =  details.nDownTotal % details.nDownForm;
		details.lastPartialFormLF = details.nDownLastForm * (pieceHeight + (2 * (dat.devDefaults.bleed + dat.devDefaults.gutter) )) / 12;
		details.valid_quote = (details.nAcrossForm > 0 && details.nDownForm > 0) ? true : false;

		//Attrition for Lamainating
		details.lamLf = (details.formLength * details.totalFullForms) / 12 + details.lastPartialFormLF;
		details.lamLfWithSpoilage = roundTo(this.getLamWithSpoilage(details.lamLf), 1);

		return details
	},
	getLamWithSpoilage: function(matLength) {
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
	},
	getConfigMaterials: function(mats) {
		//insert materials to details 
		var results = {};
		for (var mat in mats) {
			if (mats[mat]) {
				results[mat] = {};
				for (var key in mats[mat]) {
					results[mat][key] = mats[mat][key];
				}
			}
		}
		return results
	},
	getFormLength: function(mats, pieceHeight) {
		var defaultLen = 126;
		var result = defaultLen;
		//Special rule, if width of roll is 126" then use 200"
		if (mats.aPrintSubstrate.width == 126) {
			result = 200
		}
		if (pieceHeight > result) {
			result = pieceHeight
		}
		var minMatLength = this.getSignatureDim(mats, 'length');
		if (minMatLength < result) {
			result = minMatLength;
		}
		//error out if min material length is less than pieceHeight
		if (minMatLength < pieceHeight) {
			return null
		}
		return result
	},
	getSignatureDim: function(materials, dim) {
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
}


var matHelper = {
	getAllSubstrateOptions: function(substrate, configuration) {
		var results = [];
		if (substrate) {
			results.push({
				"id" : configuration.cprintsubstratesmgr.choice.id,
				"name" : configuration.cprintsubstratesmgr.choice.productionName,
				"width" : configuration.cprintsubstratesmgr.choice.width,
				"length" : configuration.cprintsubstratesmgr.choice.height,
				"paceId" : configuration.cprintsubstratesmgr.choice.referenceId
			});
			//Add in Roll Substrate Options inserted in substrate notes (property created in rollCalc script)
			var altRolls = substrate.options;
			if (altRolls) {
				for (var roll in altRolls) {
					results.push(altRolls[roll]);
				}
			}
		}
		return results
	},
	getMaterialCalculedFields: function(jobMaterials, details, quote, dat) {
		var results = {};
		for (var material in jobMaterials) {
			var materialCalcs = {};
			results[material] = {};
			if (material == 'aPrintSubstrate' || material == 'bPrintSubstrate') {
				materialCalcs = this.getPrintSubstrateCalcs(jobMaterials[material], details, dat);
			}
			else {
				materialCalcs = this.getSubstrateCalcs(jobMaterials[material], material, details, quote, dat);
			}
			//Add properties to material
			for (var prop in materialCalcs) {
				results[material][prop] = materialCalcs[prop];
			}
		}
		return results
	},
	getPrintSubstrateCalcs: function(printSubstrate, details, dat) {
		if (!printSubstrate) {return}
		var props = {};
		if (!printSubstrate.price) {
			printSubstrate.price = dat.subSqFtCost * printSubstrate.width / 12;
		}
		props.price = printSubstrate.price;
		props.leadWasteLF = dat.devDefaults.leadWasteLF;
		props.printableRollLen = printSubstrate.length - (props.leadWasteLF * 12);
		props.formsPerRoll = Math.floor(props.printableRollLen / details.formLength);
		props.fullRolls = Math.floor(details.totalForms / props.formsPerRoll);
		props.totalRolls = Math.ceil(details.totalForms / props.formsPerRoll);

		props.formsOnLastRoll = details.totalForms % props.formsPerRoll;
		props.fullFormsOnLastRoll = details.totalFullForms % props.formsPerRoll;
		props.lastPartialFormLF = details.lastPartialFormLF;
		props.lastRollLf = dat.devDefaults.leadWasteLF + (props.fullFormsOnLastRoll * details.formLength) / 12 + props.lastPartialFormLF;
		props.totalRollLF = props.fullRolls * (printSubstrate.length / 12) + props.lastRollLf;
		props.totalRollMatCost = props.totalRollLF * props.price;

		//calc roll change -- Full rolls plus all rolls if 2 sides
		props.rollChangeMins = dat.devDefaults.rollChangeMins * (props.fullRolls + (props.totalRolls * (details.sides - 1)));
		props.rollChangeCost = props.fullRolls * dat.devDefaults.rollChangeMins * dat.devDefaults.hourlyRate / 60;

		props.totalCost = props.totalRollMatCost + props.rollChangeCost;

		return props
	},
	getSubstrateCalcs: function(jobMaterial, matType, details, quote, dat) {
		var props = {};
		if (jobMaterial) {
			if (matType == 'mountSubstrate') {
				if (!jobMaterial.price) {
					jobMaterial.price = (quote.mountSubstratePrice / dat.totalSquareFeet) * jobMaterial.width * jobMaterial.length / 144;
				}
				props.price = jobMaterial.price;
				props.mounts = details.totalForms;
				props.totalCost = props.mounts * jobMaterial.price;
			} else {
				if (!jobMaterial.price) {
					jobMaterial.price = (quote[matType + 'Price'] / dat.totalSquareFeet) * jobMaterial.width / 12;
					props.price = jobMaterial.price;
				}
				if (matType.indexOf('Adhesive') != -1) {
					props.linearFeet = details.totalFormLF;
				} else {
					props.linearFeet = details.lamLfWithSpoilage ? details.lamLfWithSpoilage : details.formLength /12 + details.lastPartialFormLF;
				}
				var materialLength = jobMaterial.length ? jobMaterial.length : 1800;
				props.rollChanges = Math.floor( props.linearFeet * 12 / materialLength);
				props.totalCost = props.linearFeet * jobMaterial.price;
			}
		}
		return props;
	},
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
return Number(n);
}



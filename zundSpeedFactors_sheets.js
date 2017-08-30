window.zundSubstrateSpeeds = [];

function getZundData() {
	var spreadsheetID = "10LSajeyYzJbylOwyVoUTTx090DDtDGw263OoM6mVu4c";
	var url = "https://spreadsheets.google.com/feeds/list/" + spreadsheetID + "/od6/public/values?alt=json";
	$.getJSON(url, function(data) {
		var entry = data.feed.entry;
		$(entry).each(function() {
			var sheetVal = {"materialType": this.gsx$materialtype.$t,"id": this.gsx$id.$t,"zundSpeedFactor": this.gsx$zundspeedfactor.$t,"materialName": this.gsx$materialname.$t}; 
			zundSubstrateSpeeds.push(sheetVal);
		});
	});
	//if nothing loaded show message to user -- needs a timeout for time to load to window
	setTimeout(function() {
		console.log('zundSubstrateSpeeds loaded with lenght of ' + zundSubstrateSpeeds.length);
	}, 5000);
}

function getZundSpeedFactor(type, id) {
	var z = 1;
	for (var r = 0; r < zundSubstrateSpeeds.length; r++) {
		if (zundSubstrateSpeeds[r].materialType == type && zundSubstrateSpeeds[r].id == id) {
			console.log('speed is ' + zundSubstrateSpeeds[r].zundSpeedFactor);
			z = zundSubstrateSpeeds[r].zundSpeedFactor;
			break
		} 
		//if completes loop without match log item not found
		
	}
	if (z == 1) {
		console.log('substrate not found in Collaterate Zund Speed Factors sheet. Assuming speed factor of 1.');
	}
	return z
}

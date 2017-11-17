/*** small format objects ***/
var smallFormatBoardPjc = [
'832',    //Large Format Board Estimating
'1002',  //Ralph Lauren PMS Board Printing
'1081', 	//TBG Board Finishing Only
'1090',    //Sephora Misc 020 Magnet
'1089',    //Sephora Towers 020 Magnet
'1088',    //Sephora BOTF 020 Magnet
'1087',    //Sephora Misc 3MM Komatex
'1086',    //Sephora Towers 3MM Komatex
'1085',    //Sephora POV FOU EC 030 Styrene
'1084',    //Sephora POV FOU EC 1 MM Komatex
'1083'    //Sephora POV FOU EC 3MM Komatex
]
var HS100DSmallFormatDevices = [
27,    //Vutek HS100
28,    //Vutek HS100 CMYK + W
29,    //Vutek HS 100 CWC
40,    //Vutek HS100 Backlit
43     //Vutek HS100 White Only
]
var incaSmallFormatDevices = [
30,    //Inca Q40
32,    //Inca Q40 CMYK + W
33,    //Inca Q40 CWC
37,     //Inca Q40 Magnet
45,     //Inca Q40 White Only
50		//Inca Q40 Backlit
]
var HS100SideOneInkOpItems = {
2 : 587,   //Full Color - HS100 CMYK 80% Coverage
34 : 612,   //HS100 CMYK + W 80%
35 : 614,   //HS100 CWC 80% coverage
39 : 691,    //HS100 Backlit
32 : 749    //HS100 White Only
}
var IncaQ40SideOneInkOpItems = {
2 : 615,   //Inca Q40 CMYK 80% Coverage
34 : 616,  //Inca Q40 CMYK + W
35 : 617,   //Inca Q40 CWV
32 : 769,    //Inca Q40 White Only
39 : 834    //Inca Q40 Backlit
}
var HS100SideTwoInkOpItems = {
2 : 590,  //Full Color - HS100 CMYK 80% Coverage
34 : 613,  //HS100 CMYK + W 80%
32 : 750    //HS100 White Only
}
var IncaQ40SideTwoInkOpItems = {
2 : 618,   //Inca Q40 CMYK 80% Coverage
34 : 621,  //Inca Q40 CMYK CMYK + W
32 : 770    //Inca Q40 White Only
}

var zundLoadingSelections = {
1  :  645,   //Speed Factor 1
2  :  646,   //Speed Factor 2
3  :  647,   //Speed Factor 3
4  :  648,   //Speed Factor 4
5  :  649,   //Speed Factor 5
6  :  650    //Speed Factor 6
}
var zundUnloadingSelections = {
1  :  606,   //Speed Factor 1
2  :  607,   //Speed Factor 2
3  :  608,   //Speed Factor 3
4  :  609,   //Speed Factor 4
5  :  610,   //Speed Factor 5
6  :  611    //Speed Factor 6
}
var zundCuttingSelections = {
1  :  593,   //Speed Factor 1
2  :  594,   //Speed Factor 2
3  :  595,   //Speed Factor 3
4  :  596,   //Speed Factor 4
5  :  597,   //Speed Factor 5
6  :  598    //Speed Factor 6
}

var pjcsWithMounting = [
	'1081', 	//TBG Board Finishing Only		
	'832'	//Large Format Board Estimating
]

var substratesForceCMYKBacklit = [
'220',   //Backlit Film
'193'   //Styrene - translucent
]
var smLaminatingOps = [
'130',  //LF Back Laminating
'131'   //LF Front Laminating
]

//Run this when date blur event 
// $("#dueDate input").bind("onblur", function () {
//     var dueDate = new Date($('#dueDate input').val());
//     var turnTimeDays = configureglobals.cquotedata.turnaroundTime.businessDays;
//     var dueDateDays = getBusinessDatesCount(today, dueDate);
//     if (dueDateDays < turnTimeDays) {
//         cu.alert('please change your turn time to match your due date');
//     }
// });

var today = new Date();
var dueDateDays = 0;
$('#dueDate input').datepicker({
    onClose: function() {
        var dueDate = new Date($('#dueDate input').val());
        var turnTimeDays = configureglobals.cquotedata.turnaroundTime.businessDays;
        dueDateDays = getBusinessDatesCount(today, dueDate);
        if (dueDateDays < turnTimeDays) {
            cu.alert('please change your turn time to match your due date');
        }
    }
});

function getBusinessDatesCount(startDate, endDate) {
    var count = 0;
    var curDate = startDate;
    while (curDate <= endDate) {
        var dayOfWeek = curDate.getDay();
        if(!((dayOfWeek == 6) || (dayOfWeek == 0)))
           count++;
        curDate.setDate(curDate.getDate() + 1);
    }
    return count;
}

var pmPortal = (location.hostname.indexOf("tbghub.com") != -1);
var estimatingSite = (location.hostname.indexOf("estimating.collaterate.com") != -1);

var onQuoteUpdatedMessages = '';
var cu = calcUtil;
var sfCalcLogic = {
    onCalcLoaded: function(product) {
        //Change Paper headline
        if (cu.isPjc(product, smallFormatBoardPjc)) {
            $('#paper h3').text('Substrate');
        }
        //run meta field action
        metaFieldsActions.onCalcLoaded(product);
    },
    onCalcChanged: function(updates, product) {
        if (cu.isPOD(product)) {
            var message = '';
            var submessage = '';
//              if (cu.getPjcId(product) == 832) { 
//              // Display warning if White Ink used on White Device
//              if (cu.getValue(fields.printingS1) == 34) {
//                  if (cu.getValue(fields.paperColor) == 9) {
//                      if (cu.isLastChangedField(updates, fields.printingS1) || cu.isLastChangedField(updates, fields.paperType)) {
//                          message += '<p>You have a White Substrate Selected and a White Ink Selected.  Please be aware this may not be your desired substrate or ink choice.</p>';
//                      }
//                  }
//              }
//          }
        }
        // show an alert when necessary
        if (message != '' || submessage != '') {
            message += submessage;
            cu.alert(message);
        }
    },
    onQuoteUpdated: function(updates, validation, product) {
        if (cu.isPOD(product)) {
         /*re-init on every update*/
            cu.initFields();
            var submessage = '';

            //run meta field action
            metaFieldsActions.onQuoteUpdated(product);
            
            if (cu.isSmallFormat(product)) { 
                /************** Large Format Board Estimating PJC in small format */
                if (cu.isPjc(product, smallFormatBoardPjc)) {
                    //Change Labels for Paper Type, Weight, Color
                    cu.setLabel(fields.paperType,'Substrate');
                    cu.setLabel(fields.paperWeight,'Thickness');
                    cu.setLabel(fields.paperColor,'Color');
        
                    /********* Convert pieces for Operation Costing */
                    var pieceWidth = cu.getWidth();
                    var pieceHeight = cu.getHeight();
                    var quantity = cu.getTotalQuantity();
            
                    var SqInchIncreaser = fields.operation97;
                    var SqInchIncreaserAnswer = fields.operation97_answer;
                    var SqInchDescreaser = fields.operation100;
                    var SqInchDescreaserAnswer = fields.operation100_answer;
                    var LinInchIncreaser = fields.operation101;
                    var LinInchIncreaserAnswer = fields.operation101_answer;
                    var LinInchDecreaser = fields.operation103;
                    var LinInchDecreaserAnswer = fields.operation103_answer;
                    var topInchIncreaser = fields.operation121;
                    var topInchIncreaserAnswer = fields.operation121_answer;
                    var topInchDecreaser = fields.operation123;
                    var topInchDecreaserAnswer = fields.operation123_answer;

                    //Increase Operation Pieces to square inch with bleed
                    pieceSqInch = (parseFloat(pieceWidth) + .5) * (parseFloat(pieceHeight) + .5);
                    pieceSqInch = parseInt(pieceSqInch);
                    if (cu.getValue(SqInchIncreaserAnswer) != pieceSqInch) {
                        cu.changeField(SqInchIncreaserAnswer, pieceSqInch, true);
                        return
                    }
                    if (cu.getValue(SqInchDescreaserAnswer) != pieceSqInch) {
                        cu.changeField(SqInchDescreaserAnswer, pieceSqInch, true);
                        return
                    }
                    //Increase Operation Pieces to linear inch
                    pieceLinInch = (2 * (pieceWidth) + 2 * (pieceHeight));
                    pieceLinInch = parseInt(pieceLinInch);
                    if (cu.getValue(LinInchIncreaserAnswer) != pieceLinInch) {
                        cu.changeField(LinInchIncreaserAnswer, pieceLinInch, true);
                        return
                    }
                    if (cu.getValue(LinInchDecreaserAnswer) != pieceLinInch) {
                        cu.changeField(LinInchDecreaserAnswer, pieceLinInch, true);
                        return
                    }
                    //Increase Operation Pieces to Top Side Linear Inch
                    topLinInch = pieceWidth;
                    topLinInch = parseInt(topLinInch);
                    if (cu.getValue(topInchIncreaserAnswer) != topLinInch) {
                        cu.changeField(topInchIncreaserAnswer, topLinInch, true);
                        return
                    }
                    if (cu.getValue(topInchDecreaserAnswer) != topLinInch) {
                        cu.changeField(topInchDecreaserAnswer, topLinInch, true);
                        return
                    }
                    /********* Align Ink to Color in Operations */
                    if (cu.getPjcId(product) != 1081) {
						var sideOneInk = cu.getValue(fields.printingS1);
						var sideTwoInk = cu.getValue(fields.printingS2);
						var deviceId = cu.getDeviceId();
						var sideOneInkOp;
						var sideTwoInkOp;
						//Change Ink to Full Color - Backlit if Backlit Film or translucent styrene is Selected
						if (cu.isValueInSet(fields.paperType, substratesForceCMYKBacklit)) {
							if (sideOneInk != 39) {
								cu.changeField(fields.printingS1, 39, true);
								return
							}
							//No printing on back side
							if (sideTwoInk != '') {
								cu.changeField(fields.printingS2, '', true);
								onQuoteUpdatedMessages += '<p>Backlit Film cannot be printed on the back side.</p>';
								return
							}
						}
						//check device
						if (HS100DSmallFormatDevices.indexOf(deviceId) != -1) {
							var sideOneInkOp = HS100SideOneInkOpItems[sideOneInk];
							var sideTwoInkOp = HS100SideTwoInkOpItems[sideTwoInk];
						}
						else if (incaSmallFormatDevices.indexOf(deviceId) != -1) {
							var sideOneInkOp = IncaQ40SideOneInkOpItems[sideOneInk];
							var sideTwoInkOp = IncaQ40SideTwoInkOpItems[sideTwoInk];
						}
						//printing side 1
						if (cu.getValue(fields.operation98) != sideOneInkOp) {
							cu.changeField(fields.operation98,sideOneInkOp,true);
							return
						}
						//printing side 2
						if (sideTwoInk) {
							if (cu.hasValue(fields.printingS2)) {
								if (cu.getValue(fields.operation99) != sideTwoInkOp) {
									cu.changeField(fields.operation99,sideTwoInkOp,true);
									return
								}
							}
							else if (cu.hasValue(fields.operation99)) {
								cu.changeField(fields.operation99,'',true);
								return
							}
						}
					}
                    /********* CHANGE SPEED FACTORS AND COSTING BASED ON SUBSTRATE */
                    var pressSheetId = cu.getPressSheetId();
                    var speedFactor = sfPressSheetZundFactors[pressSheetId] ? sfPressSheetZundFactors[pressSheetId] : 1;
                    var zundLoadingFactor = zundLoadingSelections[speedFactor];
                    if (cu.getValue(fields.operation104) != zundLoadingFactor) {
                        cu.changeField(fields.operation104,zundLoadingFactor,true);
                        return
                    }
                    var zundUnloadingFactor = zundUnloadingSelections[speedFactor];
                    if (cu.getValue(fields.operation105) != zundUnloadingFactor) {
                        cu.changeField(fields.operation105,zundUnloadingFactor,true);
                        return
                    }
                    var zundCuttingFactor = zundCuttingSelections[speedFactor];
                    if (cu.getValue(fields.operation102) != zundCuttingFactor) {
                        cu.changeField(fields.operation102,zundCuttingFactor,true);
                        return
                    }
                    /********* Disallow Edge Banding for incorrect sizes */
                    var edgeBanding = fields.operation119;
                    if (edgeBanding.length > 0) {
                        //disable field unless 1/2" or 1" substrate selected
                        if (cu.getValue(fields.paperWeight) == 52 || cu.getValue(fields.paperWeight) == 53) {   
                            cu.enableField(edgeBanding);
                        }
                        else {
                            cu.disableField(edgeBanding);
                            cu.setSelectedOptionText(edgeBanding,'Must Select 1" or 1/2" Substrate');
                        }
                        if (cu.hasValue(edgeBanding)) {
                            // .5" options
                            if (cu.getValue(edgeBanding) == 692 || cu.getValue(edgeBanding) == 693) {
                                if (cu.getValue(fields.paperWeight) != 52) {
                                    cu.changeField(edgeBanding, '', true);
                                    onQuoteUpdatedMessages += '<p>1/2" Edgebanding requires a 1/2" substrate.  Please choose an appropriate substrate and then add Edgebanding.</p>';
                                    return
                                }
                            }
                            // 1" options
                            if (cu.getValue(edgeBanding) == 694 || cu.getValue(edgeBanding) == 695) {
                                if (cu.getValue(fields.paperWeight) != 53) {
                                    cu.changeField(edgeBanding, '', true);
                                    onQuoteUpdatedMessages += '<p>1/2" Edgebanding requires a 1/2" substrate.  Please choose an appropriate substrate and then add Edgebanding.</p>';
                                    return
                                }
                            }
                        }
                    }
                    /************************* ADD LAMINATING SETUP FEE WHEN FRONT AND/OR BACK LAM CHOSEN */
                    var sfLaminating = cu.findOperationFromSet(smLaminatingOps);
                    if (cu.hasValue(sfLaminating)) {
                        if (!cu.hasValue(fields.operation135)) {
                            cu.changeField(fields.operation135, 777, true);
                            return
                        }
                    } else {
                        if (cu.hasValue(fields.operation135)) {
                            cu.changeField(fields.operation135, '', true);
                            return
                        }
                    }
                    /************************* ADD MOUNTING SETUP FEE WHEN MOUNT CHOSEN */
                    var mountingOp = fields.operation139;
                    if (mountingOp.length > 0) {
                    	var mountingSetup = fields.operation140;
                    	if (cu.hasValue(mountingOp)) {
                    		console.log('mounting has been chosen');
                    		if (cu.getValue(mountingSetup) != 797) {
                    			cu.changeField(mountingSetup, 797, true);
                    			return;
                    		}
                    		//display pricing warning with 
                    		onQuoteUpdatedMessages += '<p>Mounting costs in this tool are brought in per square inch.  It is highly recommended to obtain an estimate from the Estimating Team for pricing.</p>';                    		
                    	} else if (cu.hasValue(mountingSetup)) {
                    		cu.changeField(mountingSetup, '', true);
                    	}
                    }
                    /************************* SHOW HARD PROOF MESSAGE ON THROUGHPUT THRESHOLDS */
                    if (pmPortal) {
                        var boardThroughput = cu.getTotalPressSheets();
                        var proofOp = fields.proof;
                        var proofSelection = cu.getValue(proofOp);
                        console.log('boardThroughput is ' + boardThroughput);
                        if (boardThroughput >= 10) {
                            console.log('over 10');
                            if (hardProofMessageCount == 0) {
                                if (proofSelection != 40) {
                                    onQuoteUpdatedMessages += '<p>Jobs with a throughput of 10 boards require to have a hard proof. We have changed the proofing option on your behalf.  Please remove if it is not required by your customer.</p>';
                                    hardProofMessageCount = 1;
                                    cu.changeField(proofOp, 40, true);
                                    return
                                }
                            } 
                        }
                    }
                                        
                    /********* Show buyout Meta fields when Buy-out Type selected */
                    if (cu.getValue(fields.paperType) == 247) {
                        $('.buyout').show();
                        cu.setLabel(fields.paperType,'Substrate (Enter Desc and Size below)');
                        $('.buyout').css('color','red');
                    } else {
                        $('.buyout').hide();
                    }
					if (cu.getValue(fields.proof) == 40 || cu.getValue(fields.proof) == 43) {
                        $('.hardProof').show();
                        cu.setLabel(fields.proof,'Proof (Enter Hard Proof Due Date Below)');
                        $('.hardProof').css('color','red');
                    } else {
                        $('.hardProof').hide();
                    }
                    
                    /********* Display Run Time information on Estimating Site for LF Board Estimating */
                    $('#runTime span').text(cu.getTotalRuntime());
                    $('#totalPressSheets span').text(cu.getTotalPressSheets());
                    var piecesOnSheet = (cu.getTotalQuantity() / cu.getTotalPressSheets());
                    piecesOnSheet = Math.ceil(piecesOnSheet);
                    $('#piecesOnSheet span').text(piecesOnSheet);
                    $('#smallFormatPrintSpecs').insertAfter('.quoteContinue');
                    $('#smallFormatPrintSpecs').show();
                    $('#pressSheetName span').text(cu.getPressSheetName()); 

                    // renderExtendedCostBreakdown();
                    showMessages();

                }  //End Large Format Board Estimating in small format              
            }  // END SMALL FORMAT      
        }
        
        /********************************************* ALERTS */
        function  showMessages () {
            // show an alert when necessary
            if (onQuoteUpdatedMessages != '' || submessage != '') {
                onQuoteUpdatedMessages += submessage;
                cu.alert(onQuoteUpdatedMessages);
                onQuoteUpdatedMessages = '';
            }
        }
    }
}



configureEvents.registerOnCalcLoadedListener(sfCalcLogic);
//configureEvents.registerOnCalcChangedListener(sfCalcLogic);
configureEvents.registerOnQuoteUpdatedListener(sfCalcLogic);
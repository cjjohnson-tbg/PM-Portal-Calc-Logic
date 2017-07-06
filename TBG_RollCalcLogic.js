var planningOnlyOps = [
    99,  //TBGCutting
    55,  //TBGZundCutting
    102,  //TBGGuillotineCutting
    103,  //TBGFotobaCutting
    88,  //DyeSubTransferPaper
    100,  //TBGMountingRun
    112,  //TBGInternalCuts
    110,  //TBGNoCutting
    115,  //TBGPre-cut
    109,  //TBGPre-Sheet
    108,  //TBGPre-Slit
    116,  //TBGTBG-FabCut
    125,  //TBGBucketJob
    127  //TBGMCTCutting
]
/*var planningOpsStyleBlock = createStyleBlock(planningOnlyOps, 'display: none;');
$(function() {
    $('head').append(planningOpsStyleBlock);
});*/

var zundOpItemMapLoading = {
1  : 202,    //Speed Factor 1
2  : 203,    //Speed Factor 2
3  : 204,    //Speed Factor 3
4  : 205,    //Speed Factor 4
5  : 206,    //Speed Factor 5
6  : 207     //Speed Factor 6
}
var zundOpItemMapCutting = {
1  : 195,    //Speed Factor 1
2  : 196,    //Speed Factor 2
3  : 197,    //Speed Factor 3
4  : 198,    //Speed Factor 4
5  : 199,    //Speed Factor 5
6  : 200     //Speed Factor 6
}
var zundOpItemMapUnloading = {
1  : 201,    //Speed Factor 1
2  : 208,    //Speed Factor 2
3  : 209,    //Speed Factor 3
4  : 210,    //Speed Factor 4
5  : 211,    //Speed Factor 5
6  : 212     //Speed Factor 6 
}
var canvasSubstrates = [
'144',  //6.5oz. Ultraflex Mult-tex Canvas
'83'   //Canvas - Matte Finish
]
var canvasOperations = [
65, //TBG Canvas Frame Assembly
66  //TBG Canvas Stretching
]
var pjcsWithBannerMaterial = [
'76',  // TBG HP 30000 Roll
'337'  // TBG Vutek HS 100 Roll
]
var substratesWithBannerFinishing = [
    '23',    //13 oz. Scrim Vinyl Matte (for outdoor use)
    '26',    //13 oz. Smooth Vinyl - Opaque Matte (for indoor use)
    '73',    //18 oz. Smooth Vinyl - Opaque Matte (for heavy duty outdoor use)
    '114',   //8 oz. Mesh
    '167',     //15 oz. Smooth Vinyl Banner
    '146',      //Berger Samba Fabric 6.87oz.
    '210',  //SBR-DURA-WHT-BLKBK-13OZ-126X164
    '100',  //Ultraflex Poplin 7oz.
    '177',   //Verseidag Nightdrop 10oz.
    '125',   //ULTRAFLEX-MULTITEX 220-6.5OZ CANVAS-122"X164'-3257
    '175',   //3.4oz. Aberdeen Soft Flag
    '171',   //4.5oz. Aberdeen Simplicity
    '170',   //Aberdeen Outdoor Flag
    '173',   //Aberdeen Luminary 9111
    '174',   //Aberdeen Trinity
    '172',   //Top Value Heavy Knit
    '270'   //Heavy Kit Fabric - Top Value 7.3oz
]
var bannerStandMaterial = [
    '23',    //13 oz. Scrim Vinyl Matte (for outdoor use)
    '26',    //13 oz. Smooth Vinyl - Opaque Matte (for indoor use)
    '73'    //18 oz. Smooth Vinyl - Opaque Matte (for heavy duty outdoor use)
]
var bannerFinishingOperations = [
    '60',   //TBG Grommets
    '61',   //TBG Hemming
    '62',   //TBG Pole Pockets
    '63',   //TBG Keder Sewing
    '73'    //TBG Grommet Color
]
var cuttingDesc = {
    302: 356 , //simple
    355: 357,  //Complex
    '' : ''
}
var cutMethodId = {
    450 : 'noCutting',
    451 : 'zund',
    452 : 'outsourcedCut',
    495 : 'fabCut'
}
var flutedSubstrateNames = [
    'Coroplast',
    'Flute'
]
var inkOpsWithDPI = [
    52  //TBG Ink Configuration - Vutek HS100
]
var opsToTrimWithUnderscore = [
    67,  //Pre-Printing Front Laminate
    84,  //Pre-Printing Back Laminate
    58,   //TBG Tape, Mag, Velcro
    78  //LF Premask
]
var intCutBladeOptions = [
    455,  // Complex_Blade
    454  // Simple_Blade
]
var intCutRouteOptions = [
    457,  // Simple_Route
    456   // Complex_Route
]
var noneLamintingOptions = [
    '18',     //No Front Laminating
    '40',     //For Back Laminating
    '46'      //For back laminating with Hot as front
]
var substratesThatCanHeatBend =[
    '4',     //Styrene 020
    '5',     //Styrene 030
    '178',   //Styrene 015
    '59',    //Expanded PVC Foamboard - .125in-3mm - White
    '188',   //Expanded PVC Foamboard 2 MM - White
    '113',   //Expanded PVC Foamboard 1 MM - White
    '117',   //Expanded PVC Foamboard - .125in-3mm - Black
    '354',   //Acrylic Clear Extruded .118
    '417',   //Acrylic Black Extruded .118"
    '39',   //PETG .020
    '158',   //PETG .030
    '40',   //PETG .040
    '199',   //PETG .040 Non-Glare
    '41',   //PETG .060
    '69',   //PETG .080
    '159'   //PETG .118
]
var fabrivuDirectMaterials = [
    '398'   //Berger Flag Fabric White 4oz
]


var pmPortal = ((location.hostname.indexOf("tbg-pm.collaterate.com") != -1) || (location.hostname.indexOf("tbghub.com") != -1));
var estimatingSite = (location.hostname.indexOf("estimating.collaterate.com") != -1);

// Message Counts
var hardProofMessageCount = 0;
var sameSideMessage = '';

var cu = calcUtil;

//grab zund data from zundSpeedFactors_sheets
var cutMethod;
var lfMountZundFactor;
getZundData();

var rollCalcLogic = {
    onCalcLoaded: function(product) {
        hideCanvasOperations();  
        trimOperationItemName(inkOpsWithDPI, ' - ');
        trimOperationItemName(opsToTrimWithUnderscore, '_');
        if (cu.getPjcId(product) != 389) {
            removeOperationItemsWithString(104,'Print');
        }
        removeClassFromOp(111,'costingOnly');
        addClassToOperation(planningOnlyOps,'planning');
        //show error message if zund object does not load
        if (zundSubstrateSpeeds.length == 0) {
            cu.alert('Collaterate Zund Speed Factors list did not load propertly.  Please contact Support to ensure accurate costing.');
        }
    },
    onCalcChanged: function(updates, product) {

    },
    onQuoteUpdated: function(updates, validation, product) {
        if (!cu.isSmallFormat(product)) {
            /*re-init on every update*/
            cu.initFields();
            var operationDetails = getOperationDetails();
            var message = '';
            var submessage = '';

            removeClassFromOp(111,'costingOnly');
            addClassToOperation(planningOnlyOps, 'planning');

            /***************** GLOBAL VARIABLES */
            
            var substrateId = cu.getValue(fields.printSubstrate);
            var mountId = cu.getValue(fields.mountSubstrate);
            var zundFactor = 1;
            var totalSquareFeet = (cu.getWidth() * cu.getHeight() * cu.getTotalQuantity())/144;
            
            var hasFrontLam = (cu.hasValue(fields.frontLaminate) && (noneLamintingOptions.indexOf(cu.getValue(fields.frontLaminate)) == -1));
            var hasBackLam = (cu.hasValue(fields.backLaminate) && (noneLamintingOptions.indexOf(cu.getValue(fields.backLaminate)) == -1));
            
            /************************* LATEX ROLL */
            if (cu.getPjcId(product) == 76) {
                //show message on samba products 
                if (cu.isLastChangedField(fields.printSubstrate)) {
                    if (cu.getValue(fields.printSubstrate) == 146) {
                        message += '<p>Please be aware that printing on Samba materials is not Backlit Printing.</p>';
                    }
                }
            }
            /************************ SET ZUND LOADING, CUTTING, AND UNLOADING BASED ON SUBSTRATE */
            //determine cut method
            //if Suma selected set cutting Op to No Cutting
            if (cu.hasValue(fields.operation82)) {
                if (cu.isLastChangedField(updates, fields.operation82)) {
                    console.log('suma is last change ');
                    if (cu.getValue(fields.operation111) != 450) {
                        cu.changeField(fields.operation111,450,true);
                    }
                }
            }
            cutMethod = 'zund';
            if (cu.hasValue(fields.operation111)) {
                cutMethod = cutMethodId[cu.getValue(fields.operation111)];
            }
            var zundLoading = fields.operation53;
            var zundCutting = fields.operation55;
            var zundUnloading = fields.operation56;
            var outsourceCutOp = fields.operation104;
            var noCutOp = fields.operation110;
            var fabCutOp = fields.operation116;
            //no cut
            if (cutMethod == 'noCutting') {
                if (!cu.hasValue(noCutOp)) {
                    cu.changeField(noCutOp,448, true);
                }
            } else {
                if (cu.hasValue(noCutOp)) {
                    cu.changeField(noCutOp,'',true);
                }
            }
            //Zund Cut
            if (cutMethod == 'zund') {
                var lfSubstrateZundFactor = getZundSpeedFactor('lfSubstrates', substrateId);
                if (cu.hasValue(fields.mountSubstrate)) {
                    lfMountZundFactor = getZundSpeedFactor('lfMounts', mountId);
                } else {
                    lfMountZundFactor = 0;
                }
                zundFactor = Math.max(lfMountZundFactor, lfSubstrateZundFactor);
                //Align Zund Loading Speed Factor
                if (zundLoading) {
                    var zundLoadingItem = !zundOpItemMapLoading[zundFactor] ? 202 : zundOpItemMapLoading[zundFactor];
                    if (cu.getValue(zundLoading) != zundLoadingItem) {
                        cu.changeField(zundLoading, zundLoadingItem, true);
                    }
                }
                //Align Zund Cutting Speed Factor
                    if (zundCutting) {
                    var zundCuttingItem = !zundOpItemMapCutting[zundFactor] ? 195 : zundOpItemMapCutting[zundFactor];
                    if (cu.getValue(zundCutting) != zundCuttingItem) {
                        cu.changeField(zundCutting, zundCuttingItem, true);
                    }
                }
                //Align Zund Unloading Speed Factor
                if (zundUnloading) {
                    var zundUnloadingItem = !zundOpItemMapUnloading[zundFactor] ? 195 : zundOpItemMapUnloading[zundFactor];
                    if (cu.getValue(zundUnloading) != zundUnloadingItem) {
                        cu.changeField(zundUnloading, zundUnloadingItem, true);
                    }
                }
            } else {
                if (cu.hasValue(zundLoading)) {
                    cu.changeField(zundLoading, '', true);
                }
                if (cu.hasValue(zundCutting)) {
                    cu.changeField(zundCutting, '', true);
                }
                if (cu.hasValue(zundUnloading)) {
                    cu.changeField(zundUnloading, '', true);
                }
            }
            //outourced cut set to default if nothing chosen yet
            if (cutMethod =='outsourcedCut') {
                if (!cu.hasValue(outsourceCutOp)) {
                    cu.changeField(outsourceCutOp,412,true);
                }
            } else {
                removeOperationItemsWithString(104,'Cut');
                if (cu.getSelectedOptionText(outsourceCutOp).indexOf('Cut') != -1) {
                    cu.changeField(outsourceCutOp,'', true);
                }
            }
            //Change Interior cutting options.  Blade cut only speed factors 1-2
            var intCutOp = fields.operation112;
            //trim and only show option for current zund factor
            trimOperationItemName(112, '_');
            if (zundFactor < 3) {
                hideOperationItems(intCutRouteOptions);
            } else {
                hideOperationItems(intCutBladeOptions);
            }
            
            if (cu.hasValue(intCutOp) && cutMethod == 'zund') {
                var intCutSetting = { 
                    454 : 457,
                    455 : 456
                }
                var intCutItem = cu.getValue(intCutOp);
                //blade cut
                if (zundFactor < 3) {
                    if (!(intCutItem in intCutSetting)) {
                        for (var key in intCutSetting) {
                            if (intCutSetting[key] == intCutItem) {
                                cu.changeField(intCutOp, key, true);
                            }
                        }
                    }
                } 
                //Route Cut
                else {
                    if (intCutItem in intCutSetting) {
                        cu.changeField(intCutOp, intCutSetting[intCutItem], '');
                    }
                }
            } else {
                if (cu.hasValue(intCutOp)) {
                    cu.changeField(intCutOp,'',true)
                }
            }
            if (cutMethod == 'fabCut') {
                if (cu.getValue(fabCutOp) != 478) {
                    cu.changeField(fabCutOp, 478, true);
                    //show TBG Fab Cut and Turn on Premask when Laser selected
                    if (cu.getPjcId(product) == 389) {
                        removeClassFromOp('planning', 116);
                        if (cu.getValue(fabCutOp) == 508) {
                            message += '<p>Fab Laser Cut requires a Premask.  This has been chosen on your behalf.</p>'
                            cu.changeField(fields.operation78, 291, true);
                        }
                    }
                }
            } else if (cu.hasValue(fabCutOp)) {
                cu.changeField(fabCutOp, '', true);
            }
            /************************ LEAD AND TAIL COST THROUGH OPERATION */
            var leadAndTailOp = fields.operation79;
            if (leadAndTailOp) {
                var leadAndTailCost = getLeadAndTailCost();
                console.log(leadAndTailCost + ' lead and tail cost')
                if (fields.operation79_answer != leadAndTailCost) {
                    cu.changeField(fields.operation79_answer, leadAndTailCost, true);
                }
            }
            /************************ APPLY LAM SETUP FEE WHEN LAM SELECTED */
            //Note: "none" operation item is id 18 (front) AND 40 (back) for products using this function
            var laminatingSetup = fields.operation57;
            //create variable that ignores "None" operation Items
            var hasLaminatingChosen = (cu.hasValue(fields.frontLaminate) && cu.getValue(fields.frontLaminate) != 18) || (cu.hasValue(fields.backLaminate) && cu.getValue(fields.backLaminate) != 40 && cu.getValue(fields.backLaminate) != 18);
            if (laminatingSetup) {
                if (hasLaminatingChosen) {
                    if (!cu.hasValue(laminatingSetup)) {
                        cu.changeField(laminatingSetup,213,true);
                    }
                }
                else if (cu.hasValue(laminatingSetup)) {
                    cu.changeField(laminatingSetup,'',true);
                }
            }
            //add laminating run operatoin
            var laminatingRun = fields.operation96;
            if (laminatingRun) {
                if (hasLaminatingChosen) {
                    if (configureglobals.cquote == null) { return; }
                    var frontLamType = configureglobals.cquote.lpjQuote.piece.frontLaminate.type.name;
                    if (frontLamType == 'Cold') {
                        if (cu.getValue(laminatingRun) != 363) {
                            cu.changeField(laminatingRun, 363, true);
                        }
                    } else {
                        if (cu.getValue(laminatingRun) != 364) {
                            cu.changeField(laminatingRun, 364, true);
                        }
                    }
                }
                else if (cu.hasValue(laminatingRun)) {
                    cu.changeField(laminatingRun,'',true);
                }
            }
            //pre-printing lam run
            var prePrintingLamRun = fields.operation106;
            var prePrintingLamMatl = fields.operation105;
            if (prePrintingLamRun && prePrintingLamMatl) {
                if (cu.hasValue(prePrintingLamMatl)) {
                    if (!cu.hasValue(prePrintingLamRun)) {
                        cu.changeField(prePrintingLamRun, 422, true)
                    }
                } else if (cu.hasValue(prePrintingLamRun)) {
                    cu.changeField(prePrintingLamRun, '', true)
                }
            }
            /************************ APPLY MOUNT SETUP FEE WHEN LAM SELECTED */
            var mountingSetup = fields.operation59;
            if (mountingSetup) {
                if(cu.hasValue(fields.mountSubstrate)) {
                    if (!cu.hasValue(mountingSetup)) {
                        cu.changeField(mountingSetup,215,true);
                    }
                }
                else if (cu.hasValue(mountingSetup)) {
                    cu.changeField(mountingSetup,'',true);
                }
            }
            var mountingRun = fields.operation100;
            if (mountingRun) {
                //Turn on Mounting Run only when No laminating is selected (run costs come in through Lam Run)
                var turnMtRunOn = false;
                var turnMtRunOff = false;
                if (laminatingRun) {
                    if (cu.hasValue(fields.mountSubstrate)) {
                        if (!cu.hasValue(laminatingRun)) {
                            if (!cu.hasValue(mountingRun)) {
                                cu.changeField(mountingRun,388, true);
                            } else {
                                
                            }
                        }
                    }
                }
            }
            /************************ CANNON PRINTS */
            if (cu.getPjcId(product) == 94) {
                // add Ink Configuration and Lam for Kodak Backlit
                var inkConfig = fields.operation72;
                if (cu.getValue(fields.printSubstrate) == 131) {
                    if (cu.isLastChangedField(updates, fields.printSubstrate)) { 
                        if (!cu.hasValue(fields.frontLaminate) || cu.getValue(fields.frontLaminate) == 18) {
                            // cu.changeField(fields.frontLaminate, 4, false);
                            // cu.changeField(fields.backLaminate, 3, true);
                            message += '<p>Front and Back Laminating is suggested for Kodak Backlit Graphics.  Please add Laminating options.</p>';
                        }
                    }
                    if (cu.getValue(inkConfig) != 264) {
                        cu.changeField(inkConfig, 264, true);
                    }
                    cu.disableField(inkConfig);
                }
                else if (cu.getValue(inkConfig) == 264) {
                    cu.changeField(inkConfig, '', true);
                    cu.enableField(inkConfig);
                }
            }
            /************************* HP INK CONFIGURATION */
            var hpInkOp = fields.operation98;
            if (hpInkOp) {
                if (cu.getValue(fields.sides) == 2 ) {
                    if (cu.getValue(hpInkOp) != 509) {cu.changeField(hpInkOp, 509, true);}
                } else if (cu.getSelectedOptionText(fields.printSubstrate).indexOf('Backlit') != -1) {
                    if (cu.getValue(hpInkOp) != 384) {cu.changeField(hpInkOp, 384, true);}
                } else {
                    if (cu.getValue(hpInkOp) != 383) {cu.changeField(hpInkOp, 383, true);}
                }
                cu.disableField(hpInkOp);
            }
            /************************* SHOW HARD PROOF MESSAGE ON SQUARE FOOTAGE THRESHOLDS */
            if (pmPortal) {
                var proofOp = fields.proof;
                var proofSelection = cu.getValue(proofOp);
                if (totalSquareFeet >= 320) {
                    if (hardProofMessageCount == 0) {
                        if (proofSelection != 40) {
                            message += '<p>Jobs with a printable area over 320 square feet require to have a hard proof. We have changed the proofing option on your behalf.  Please remove if it is not required by your customer.</p>';
                            hardProofMessageCount = 1;
                            cu.changeField(proofOp, 40, true);
                        }
                    } 
                }
            }
            /************************* SHOW CANVAS OPTIONS ONLY WHEN CANVAS SELECTED */
            if (pmPortal) {
                if (!cu.isValueInSet(fields.printSubstrate, canvasSubstrates)) {
                    hideCanvasOperations();
                }
                else {
                    showCanvasOperations();
                }
            }
            /************************* SHOW BANNER FINISHING OPTIONS ONLY WHEN CANVAS SELECTED */
            //always show with Dye Sub materials
            if (!cu.getPjcId(product) == 392) {
                if (pmPortal) {
                    if (!cu.isValueInSet(fields.printSubstrate, substratesWithBannerFinishing)) {
                        hideBannerOperations();
                    }
                    else {
                        showBannerOperations();
                    }
                }
            }
            //Only show Banner stands with 13 oz scrim or smooth
            var bannerStandOp = fields.operation75;
            if (bannerStandOp) {
                if (!cu.isValueInSet(fields.printSubstrate, bannerStandMaterial)) {
                    cu.hideField(bannerStandOp);
                    if (cu.hasValue(bannerStandOp)) {
                        cu.changeField(bannerStandOp,'',true);
                        message += '<p>Banners stands can only be ordered with 13 oz Vinyl.</p>';
                    }
                } else {
                    cu.showField(bannerStandOp);
                }
            }
            /************************* DO NOT ALLOW SAME SIDE FINISHING ON CERTAIN SELECTIONS */
            if (cu.hasValue(fields.operation61) && cu.hasValue(fields.operation62)) {
                var sameSideMessage = validateSidesNotTheSame(operationDetails,61,62);
                if (sameSideMessage != '') {
                    message += sameSideMessage;
                }
            }
            /************************* VINYL CUTTING RULES */
            var sumaCuttingOp = fields.operation82;
            var weedingOp = fields.operation94;
            var premaskOp = fields.operation78;
            if (sumaCuttingOp && weedingOp) {
                var cuttingChoice = cu.getValue(sumaCuttingOp);
                var weedingResult = cuttingDesc[cuttingChoice];
                if (cu.getValue(weedingOp) != weedingResult) {
                    cu.changeField(weedingOp, weedingResult, true);
                }
                if (premaskOp) {
                    if (cu.hasValue(sumaCuttingOp)) {
                        if (cu.getValue(premaskOp) != 361) {
                            cu.changeField(premaskOp,361,true);
                        }
                        cu.disableField(premaskOp);
                    } else {
                        cu.enableField(premaskOp);
                    }
                }
                cu.disableField(weedingOp);
                
            }
            /************************ show Flute Directoin operations when Fluted substate chosed */
            var fluteDirectionOp = fields.operation101;
            if (fluteDirectionOp) {
                var hasFlutes = false;
                var mountSubstrateName = $('#mountSubstrates select[name="MOUNTSUBSTRATEDD"] option:selected').text();
                var printSubstrateName = $('#printSubstrates select[name="PRINTSUBSTRATEDD"] option:selected').text();
                for (names in flutedSubstrateNames) {
                    if (printSubstrateName.indexOf(flutedSubstrateNames[names]) != -1) {
                        hasFlutes = true;
                    }
                    if (mountSubstrateName.indexOf(flutedSubstrateNames[names]) != -1) {
                        hasFlutes = true;
                    }
                }
                if (hasFlutes) {
                    cu.showField(fluteDirectionOp);
                    fluteDirectionOp.css('color','red');
                    if (!cu.hasValue(fluteDirectionOp)) {
                        cu.changeField(fluteDirectionOp, 401, true);
                    }
                } else {
                    cu.hideField(fluteDirectionOp);
                    if (cu.hasValue(fluteDirectionOp)) {
                        cu.changeField(fluteDirectionOp,'',true)
                    }
                }
            }
            /************************* FORCE BACKLIT DOUBLE STRIKE INK FOR ULTRACANVAS BACKLIT */
            var vutekInks = fields.operation52;
            if (vutekInks) {
                if (cu.getValue(fields.printSubstrate) == 308) {
                    if (cu.getValue(vutekInks) != 241) {
                        cu.changeField(vutekInks, 241, true);
                    }
                } else {
                    if (cu.getValue(vutekInks) == 241) {
                        message += '<p>Double Strike backlit ink is only available on the Ultra Canvas Backlit.</p>';
                        cu.changeField(vutekInks,261, true);
                    }
                }
            }
            /************************ HEAT BENDING RULES */
            var heatBendingOp = fields.operation117;
            if (heatBendingOp) {
                if (cu.hasValue(heatBendingOp)) {
                    //cannot exceed 100 pieces
                    if (cu.getTotalQuantity() > 100) {
                        message += '<p>Heat Bending is limited to 100 pieces.  This option has been removed from your selects.</p>';
                        cu.changeField(heatBendingOp,'', true);
                    }
                    //No PreLam, Lam, Mount or Adhesive can be applied
                    if (hasFrontLam || hasBackLam || cu.hasValue(fields.mountSubstrate)) {
                        message += '<p>Heat Bending cannot be chosen with Laminating or mounting</p>';
                        cu.changeField(heatBendingOp,'',true);
                    }
                    if (cu.hasValue(fields.operation84) || cu.hasValue(fields.operation67)) {
                        message += '<p>Heat Bending cannot be chosen with Laminating or mounting</p>';
                        cu.changeField(heatBendingOp,'',true);
                    }
                    //Neight side can be lower than 36"
                    if (cu.getWidth() > 36 || cu.getHeight() > 36) {
                        message += '<p>Heat Bending cannot be chosen with either side longer than 36"</p>';
                        cu.changeField(heatBendingOp,'',true);
                    }
                    //
                    if (substratesThatCanHeatBend.indexOf(cu.getValue(fields.printSubstrate)) == -1) {
                        message += '<p>Heat Bending can only be chosen for Styrene, EPVC, Acrylic, or PETG in calipers less than .125" (3MM).</p>';
                        cu.changeField(heatBendingOp,'',true);
                    }
                }
            }
            /************************ FABRIVU LOGIC */
            if (cu.getPjcId(product) == 450) {
                //Choose none option for dye sub transfer material if substrate in list
                var dyeSubTransferOp = fields.operation88;
                if (cu.isValueInSet(fields.printSubstrate,fabrivuDirectMaterials)) {
                    if (cu.getValue(dyeSubTransferOp) != 442) {
                        cu.changeField(dyeSubTransferOp, 442, true);
                    }
                } else {
                    if (cu.getValue(dyeSubTransferOp) != 428) {
                        cu.changeField(dyeSubTransferOp, 428, true);
                    }
                }
            }
            /************************ HIDE OPERTION ITEMS */
            //INK RESOLUTION ON INK CONFIGURATION OPERATIONS
            trimOperationItemName(inkOpsWithDPI, ' - ');
            //material name
            trimOperationItemName(opsToTrimWithUnderscore, '_');
            //Hide Op Items
            if (cu.getPjcId(product) != 389) {
                removeOperationItemsWithString(104,'Print');
            }  
            /************************* REQUIRE VERSION NAMES WHEN MORE THAN ONE */
            if (cu.isMultipleVersion()) {
                $('input.versionName').attr('required',true);
            }
            /********************************************* ALERTS */
            // show an alert when necessary
            if (message != '' || submessage != '') {
                message += submessage;
                cu.alert(message);
            }

        } // is POD
    }
}
function createStyleBlock(elements, styleText) {
    var x = '<style type="text/css">' + elements.join(", ") + ' {' + styleText + '}</style>';
    return x
}
function addClassToList(elements, newClassName) {
    for (var i = 0; i < elements.length; i++) {
        $(elements[i]).addClass('newClassName');
    }
}
function addClassToOperation(opList, className) {
    if (!(Array.isArray(opList))) {
        opList = [opList];
    }
    for (var i = 0; i < opList.length; i++) {
        $('#operation' + opList[i]).addClass(className);
    }
}
function disableCheckoutButton(disableCheckoutText) {
    $('button.continueButton').removeAttr('onclick');
    $('button.continueButton').bind('click', function(event) {
        if (disableCheckoutText != '') {
            cu.alert('<h3>These issues must be resolved before continuing</h3>' + disableCheckoutText);
        }
    });
}
function enableCheckoutButton() {
    $('button.continueButton').unbind('click');
    $('button.continueButton').attr('onclick', 'common.continueClicked();');
}

function hideCanvasOperations() {
    $.each(canvasOperations, function() {
        $('#operation' + this).hide();
    });
}
function showCanvasOperations() {
    $.each(canvasOperations, function() {
        $('#operation' + this).show();
    });
}
function hideBannerOperations() {
    $.each(bannerFinishingOperations, function() {
        $('#operation' + this).hide();
    });
}
function showBannerOperations() {
    $.each(bannerFinishingOperations, function() {
        $('#operation' + this).show();
    });
}
function getLeadAndTailCost() {
    var totalSubCost = configureglobals.cquote.lpjQuote.aPrintSubstratePrice;
    var totalSquareFeet = configureglobals.cquote.lpjQuote.piece.totalSquareFeet;
    var subSqFtCost = totalSubCost / totalSquareFeet;
    var subWidth = configureglobals.cquote.lpjQuote.piece.aPrintSubstrate.width;
    var subLinearFootCost = subWidth * subSqFtCost / 12;
    var totalQuantity = configureglobals.cquote.lpjQuote.productionQuantity;
    var leadTailCost = parseInt(subLinearFootCost * 10 / totalQuantity);
return leadTailCost;
}
function trimOperationItemName(opList, deliminater) {
    //change single operation to array
    if (!(Array.isArray(opList))) {
        opList = [opList];
    }
    for (var i = 0; i < opList.length; i++) {
        $('select#operation' + opList[i] + ' option').each(function() {
            //var label = $(this).text;
            var label = this.text;
            var index = label.indexOf(deliminater);
            if (index != -1) {
                var newLabel = label.substring(0,index);
                $(this).text(newLabel);
            }
        });
    }
}
function hideOperationItems(itemList, operation) {
    //change single operation to array
    if (!(Array.isArray(itemList))) {
        itemList = [itemList];
    }
    for (var i = 0; i < itemList.length; i++) {
        $('option[value="' + itemList[i] + '"]').hide();
    }
}
function removeClassFromOp(opList, className) {
    if (!(Array.isArray(opList))) {
        opList = [opList];
    }
    for (var i = 0; i < opList.length; i++) {
        $('#operation' + opList[i] + '').each(function() {
            $(this).removeClass('' + className + '');
        });
    }
}
function removeOperationItemsWithString(op, string) {
    $('select#operation' + op +' option').each(function() {
        var item = this.text;
        var index = item.indexOf(string);
        if (index != -1) {
            $(this).hide();
        }
    });
}

function getOperationDetails() {
    var operations = configureglobals.cquote.lpjQuote.operationQuotes;
    var ops = { };
    for (var i = 0; i < operations.length; i++) {
        var opId = operations[i].operation.id;
        var data = operations[i].data;
        ops['op' + opId] = {
            'id' : opId,
            'name' : operations[i].operation.heading,
            'left' : data.leftSide,
            'right' : data.rightSide,
            'bottom' : data.bottomSide,
            'top' : data.topSide
        }
    }
    return ops
}
function validateSidesNotTheSame(opDetails, op1, op2) {
    var object1 = opDetails['op' + op1];
    var object2 = opDetails['op' + op2];
    var sidesMatch = [];
    var message = '';
    for (var key in object1) {
        if (object1[key] == true && object2[key] == true) {
            sidesMatch.push(key);
        }
    }
    if (sidesMatch.length > 0) {
        message += '<p>The following sides match for operations ' + object1['name'] + ' and ' + object2['name'] + ' : ' + sidesMatch.join(', ') + '.</p><p>Please make adjustments as these operations cannot be done on the same sides.</p>';
    }
    return message
}

configureEvents.registerOnCalcLoadedListener(rollCalcLogic);
configureEvents.registerOnCalcChangedListener(rollCalcLogic);
configureEvents.registerOnQuoteUpdatedListener(rollCalcLogic);
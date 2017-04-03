var planningOnlyOps = [
    55   //
]

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

var cu = calcUtil;

var bucketCalcLogic = {
    onCalcLoaded: function(product) {
        //Add planning class to operations
        addClassToOperation(planningOnlyOps,'planning');

        // apply datepicker to meta fields with Pace in label
        $('#additionalProductFields .additionalInformation div label:contains("Date")').parent().addClass('date');
        $('#additionalProductFields .additionalInformation div label:contains("Shipping Due Date")').parent().addClass('ship-date');
        $('.ship-date').removeClass('date');
        var dateInput = $('.date input');
        dateInput.datepicker({
            showAnim: "fold"
        });
        var shipDateInput = $('.ship-date input');
        shipDateInput.datepicker({
            showAnim: "fold",
            beforeShowDay: $.datepicker.noWeekends,  // disable weekends
            minDate: isNowBeforeCSTCutoffTime(13,15) ? 1 : 2 // if before 1:15, 1, if after 1:15 then 2
        });
        //Add ID for due date on SF field
        $('#additionalProductFields .additionalInformation div label:contains("Due Date")').parent().attr('id','dueDate');
        //Hide Actual Pace Inventory ID and Qty
        $('#additionalProductFields .additionalInformation div label:contains("Actual")').parent().hide();

        $('#additionalProductFields .additionalInformation div label:contains("Actual Pace Inventory ID")').parent().addClass('actualId');
        $('#additionalProductFields .additionalInformation div label:contains("Buy-out")').parent().addClass('buyout').hide()

        $('#additionalProductFields .additionalInformation div label:contains("Date Due to Fab")').parent().addClass('fabDate');
        $('#additionalProductFields .additionalInformation div label:contains("Date Due in Kitting")').parent().addClass('kitDate');
        $('#additionalProductFields .additionalInformation div label:contains("Soft Proof Date")').parent().addClass('softProofDate');
        $('#additionalProductFields .additionalInformation div label:contains("Sub-out Date")').parent().addClass('subOutDate');
        $('#additionalProductFields .additionalInformation div label:contains("SKU, if Sending to Fulfillment")').parent().addClass('sku');
        $('#additionalProductFields .additionalInformation div label:contains("Pace Estimate #")').parent().addClass('paceEstimate');
    },
    onCalcChanged: function(updates, product) {
    },
    onQuoteUpdated: function(updates, validation, product) {
        if (!cu.isSmallFormat(product)) {
            /*re-init on every update*/
            cu.initFields();

            var message = '';
            var submessage = '';

            addClassToOperation(planningOnlyOps,'planning');
            /************************ SET ZUND LOADING, CUTTING, AND UNLOADING BASED ON SUBSTRATE */
            //determine cut method
            var cutMethod = 'zund';
            //Zund Cut
            var substrateId = cu.getValue(fields.printSubstrate);

            if (cutMethod == 'zund') {
                
                var zundFactor = zundFactors.lfSubstrates[substrateId] ? zundFactors.lfSubstrates[substrateId] : 1;
                var zundLoading = fields.operation53;
                var zundCutting = fields.operation55;
                var zundUnloading = fields.operation56;
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
            } 
            /************************ BOARD BUCKET LIMITATIONS */
            //limit to 200 sq ft
            var totalSquareFeet = (cu.getWidth() * cu.getHeight() * cu.getTotalQuantity())/144;
            var message = '';
            if (totalSquareFeet > 200 ) {
                bucketSizeMessage = '<p>The Board Bucket product is limited to jobs less than 200 sq ft.  For jobs greater than this please use the Board Printing Product.</p>';
                message += bucketSizeMessage;
                disableCheckoutButton(bucketSizeMessage);
            } else {
                enableCheckoutButton();
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


function disableCheckoutButton(text) {
    $('button.continueButton').removeAttr('onclick');
    $('button.continueButton').bind('click', function(event) {
        if (text != '') {
            cu.alert('<h3>These issues must be resolved before continuing</h3>' + text);
        }
    });
}
function enableCheckoutButton() {
    $('button.continueButton').unbind('click');
    $('button.continueButton').attr('onclick', 'common.continueClicked();');
}
function addClassToOperation(opList, className) {
    for (var i = 0; i < opList.length; i++) {
        $('#operation' + opList[i]).addClass(className);
    }
}
function isNowBeforeCSTCutoffTime(hour24, minutes) {
  var localOffsetMs = new Date().getTimezoneOffset()*60*-1000;
  var localVsServerOffsetMs = localOffsetMs - SERVER_TZ_OFFSET_MS;
  var localTime = new Date();
  var localCutoffTime = (new Date(localTime.getFullYear(), localTime.getMonth(), localTime.getDate(), hour24, minutes, 0, 0));
  var localCutoffTime = new Date(localCutoffTime.getTime() + localVsServerOffsetMs);
  var returnVal = localTime.getTime() < localCutoffTime.getTime();
  // console.log('server offset ms ', SERVER_TZ_OFFSET_MS);
  // console.log('local  offset ms ', localOffsetMs);
  // console.log('local vs server  ', SERVER_TZ_OFFSET_MS - localOffsetMs);
  // console.log('server vs local  ', localOffsetMs - SERVER_TZ_OFFSET_MS);
  // console.log('local time       ', localTime);
  // console.log('local cutoff time', localCutoffTime);
  // console.log('you have time before the cutoff?',returnVal);
  return returnVal;
}
configureEvents.registerOnCalcLoadedListener(bucketCalcLogic);
configureEvents.registerOnCalcChangedListener(bucketCalcLogic);
configureEvents.registerOnQuoteUpdatedListener(bucketCalcLogic);

var cu = calcUtil;
var pu = pmCalcUtil;


var rollCalcLogic = {
    onCalcLoaded: function(product) {
        cu.initFields();
        uiUpdates(product);
        //run meta field action
        metaFieldsActions.onCalcLoaded();
    },
    onCalcChanged: function(updates, product) {
        if (updates) {
            //lastUIChangedFieldName = updates.fieldName;
            // console.log('lastUIChangedFieldName', lastUIChangedFieldName);
        }
    },
    onQuoteUpdated: function(updates, validation, product) {
        if (cu.isPOD(product)) {
            //STOP IF CALCULATOR NOT RETURNING QUOTE
            controller.enterFullQuoteMode();
            testFieldChange();
            controller.exitFullQuoteMode(updates);
            
        }
function testFieldChange() {
    var hasMount = cu.hasValue(fields.mountSubstrate);
    if (hasMount) {
        pu.validateValue(fields.operation59, 215);
    }
}

configureEvents.registerOnCalcLoadedListener(rollCalcLogic);
configureEvents.registerOnCalcChangedListener(rollCalcLogic);
configureEvents.registerOnQuoteUpdatedListener(rollCalcLogic);
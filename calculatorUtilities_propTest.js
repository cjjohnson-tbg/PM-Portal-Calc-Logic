if (!window.console) console = {log:function(){}};
var calcUtil = {
    initFields: function() {
        var quote = configureglobals.cquote.pjc ? configureglobals.cquote.lpjQuote : null;
        var constants = {device:'DEVICEDD',
                      coverType:'COVERPRESSSHEETTYPEDD',
                      coverWeight:'COVERPRESSSHEETWEIGHTDD',
                      coverColor:'COVERPRESSSHEETCOLORDD',
                      paperType:'PRESSSHEETTYPEDD',
                      paperWeight:'PRESSSHEETWEIGHTDD',
                      paperColor:'PRESSSHEETCOLORDD',
                      coverPrintingS1:'COVERSIDE1DD',
                      coverPrintingS2:'COVERSIDE2DD',
                      printingS1:'SIDE1DD',
                      printingS2:'SIDE2DD',
                      pages:'PAGESEF',
                      bleed:'BLEEDDD',
                      width:'WIDTHEF',
                      height:'HEIGHTEF',
                      presetDimensions:'PRESETDIMENSIONSDD',
                      quantity:'QUANTITYEF',
                      // lf specific
                      sides: 'SIDESDD',
                      printSubstrate: 'PRINTSUBSTRATEDD',
                      mountSubstrate: 'MOUNTSUBSTRATEDD',
                      frontLaminate: 'FRONTLAMINATEDD',
                      backLaminate: 'BACKLAMINATEDD',
                      // production
                      proof:'PROOFDD',
                      turnTime:'TURNAROUNDTIMEDD'
                      // operations added dynamically
                      // versions added dynamically
                      };
        var operations = $("fieldset.operationsGroup select");
        var operationAnswers = $("fieldset.operationsGroup input");
        var opsList = configureglobals.coperationsmgr.operations;

        var versions = $("div[name='versionHolder']");
        window["fields"] = {};
        window["previousValues"] = {};
        for (var key in constants) {
            if (constants.hasOwnProperty(key)) {
                //insert jquery object into the fields object
                var obj = $("[name='"+constants[key]+"']");
                if (obj.length > 0) {
                    fields[key] = obj;
                    //insert previous value into previous values object
                    previousValues[key] = obj.val();
                }
            }
        }
        for (var i = 0; i < operations.length; i++) {
            key = $(operations[i]).attr("id");
            fields[key] = $(operations[i]);
            //insert previous value into the previous values object
            previousValues[key] = $(operations[i]).val();
            //check for properties of Choice in configureglobals and add to 'choice'
            if ($(operations[i].value)) {
                fields[key]['choice'] = {};
                var opId = key.replace(/(operation)/,'');
                //loop through operations in configure global operations manager
                for (var j = 0; j < opsList.length; j++) {
                    if (opsList[j].pjcOperation.operation.id == opId) {
                        var desc = opsList[j].choice ? opsList[j].choice.description : null;
                        //Json properties must be wrapped in "[{ }]"
                        var jsonBlock = /\{(.*?)\}/.exec(desc);
                        if (jsonBlock) {
                            var jsonStr = this.getJsonFromString(jsonBlock[0]);
                            for (prop in jsonStr) {
                                fields[key].choice[prop] = jsonStr[prop];
                            }
                        }
                        break
                    }
                }
            }
        }
        for (var i = 0; i < operationAnswers.length; i++) {
            key = $(operationAnswers[i]).parents("div.optionWrapperOn").attr("id") + "_answer";
            fields[key] = $(operationAnswers[i]);
            //insert previous value into the previous values object
            previousValues[key] = $(operationAnswers[i]).val();
        }
        if (versions.length != 0) {
            for (var i = 0; i < versions.length; i++) {
                var x = i+1;
                nameKey = "v"+x+"Name"; //v1Name
                qtyKey = "v"+x+"Quantity"; //v1Quantity
                fields[nameKey] = $("div[name='versionHolder'] input[name='VERSIONNAMEEF"+i+"']");
                fields[qtyKey] = $("div[name='versionHolder'] input[name='QUANTITYEF"+i+"']");
            }
        }
    },
    isPOD: function(product) {
        if (product.systemLevelOffering && product.systemOffering.isServiceTypePOD()) {
            return true;
        } else {
            return false;
        }
    },
    isSmallFormat: function(product) {
        if (product.overridePricing) {
            if (product.pricingPrintJobClassification) {
                return true;
            } else {
                return false;
            }
        } else {
            if (product.systemOffering.pricingPrintJobClassification) {
                return true;
            } else {
                return false;
            }
        }
    },
    isPjc: function(product, pjcs) {
        var pjc = calcUtil.getPjcId(product).toString();
        if ($.inArray(pjc, pjcs) != -1) {
            return true;
        } else {
            return false;
        }
    },
    getPjcId: function(product) {
        if (product.overridePricing) {
            if (product.pricingPrintJobClassification) {
                return product.pricingPrintJobClassification.id;
            }
            if (product.pricingLargeFormatPrintJobClassification) {
                return product.pricingLargeFormatPrintJobClassification.id;
            }
        } else {
            if (product.systemOffering.pricingPrintJobClassification) {
                return product.systemOffering.pricingPrintJobClassification.id;
            }
            if (product.systemOffering.pricingLargeFormatPrintJobClassification) {
                return product.systemOffering.pricingLargeFormatPrintJobClassification.id;
            }
        }
    },
    hasValue: function(field) {
        if (field) {
            if (hasValue(field.val())) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
            console.log("Field not found while checking hasValue. Returning false.");
        }
    },
    getValue: function(field) {
        if (field) {
            return field.val();
        } else {
            return '';
        }
    },
    setLabel: function(field,label) {
        if (typeof field == "string") {
            // allows you to pass in the parent div of a static field, such as "pressSheetWeight"
            field = $("#"+field+" .noEdit");
        }
        if (typeof field == "object") {
            field.prev("label.config").text(label);
        } else {
            console.log('Could not set label to "'+ label +'". Field not found.');
        }
    },
    isInit: function(updates) {
        if (updates['context'] == "init") {
            return true;
        } else {
            return null;
        }
    },
    lastChangedField: function(updates) {
        if (updates['context'] != "init") {
            if (updates['context'] == "setOperation") {
                return $("select[name='"+updates['fieldNamePrefix']+updates['fieldIndex']+"']");
            } else {
                return $("[name='"+updates['fieldName']+"']");
            }
        } else {
            return null;
        }
    },
    isLastChangedField: function(updates,field) {
        if (field) {
            if (updates['context'] == "init" || !field) {
                return false;
            } else {
                lastChanged = calcUtil.lastChangedField(updates);
                if (lastChanged.attr('name') == field.attr('name')) {
                    return true;
                } else {
                    return false;
                }
            }
        } else {
            console.log('Field is not defined. Returning false.');
            return false;
        }
    },
    isValueInSet: function(field, valueSet, includeBlank) {
        if (field) {
            if (includeBlank && field.val() == '') {
                return true;
            } else if ($.inArray(field.val(), valueSet) != -1) {
                return true;
            } else {
                return false;
            }
        } else {
            console.log('Field is not defined. Returning false.');
            return false;
        }
    },
    findOperationFromSet: function(operations) {
        //use this when you have multiple operations of the same basic type for different PJCs (UV Coating, for example)
        for (var key in fields) {
            if (key.substring(0,4) === 'oper') {
                id = key.substring(9);
                if ($.inArray(id, operations) != -1) {
                    return fields[key];
                }
            }
        }
        console.log("No matching operations found.");
        return null;
    },
    operationInSetHasValueInSet: function(operationSet, valueSet) {
        if (operationSet) {
            if (valueSet) {
                for (var i = 0; i < operationSet.length; i++) {
                    //use [i] and add 
                    var key = 'operation' + operationSet[i];
                    if (fields[key]){
                        if ($.inArray(fields[key].val(), valueSet) != -1) {
                            return true
                        }
                    }
                }
                return false;
            } else {
                console.log('ValueSet is not defined. Returning false for operationInSetHasValueInSet.');
                return false;
            }

        } else {
            console.log('OperationSet is not defined. Returning false for operationInSetHasValueInSet.');
            return false;
        }
    },
    changeField: function(field,value,requote) {
        if (field.is("select")) {
            var availableValues = $.map(field.children('option'), function(e) { return e.value; });
            if ($.inArray(value.toString(), availableValues) != -1) {
                field.val(value);
                if (requote) {
                    field.trigger('focus').trigger('change');
                }
            } else {
                console.log("Could not change field. The value " +value + " was not found in the options.");
            }
        } else {
            field.triggerHandler('focus');
            field.val(value);
            if (requote) {
                field.triggerHandler('blur');
            }
        }
    },
    changeFieldv2: function(field,value,requote) {
        //this method is a variation of the standard change field but works for some versions of IE.
        if (field.is("select")) {
            var availableValues = $.map(field.children('option'), function(e) { return e.value; });
            if ($.inArray(value.toString(), availableValues) != -1) {
                field.val(value);
                if (requote) {
                    field.trigger('focus').trigger('change');
                }
            } else {
                console.log("Could not change field. The value " +value + " was not found in the options.");
            }
        } else {
            field.focusin();
            field.val(value);
            if (requote) {
                var blurProp = field.prop("onblur");
                field.on('blur',blurProp)
                field.trigger('blur');
            }
        }
    },
    disableField: function(field) {
        if (field) {
            field.prop('disabled',true);
        } else {
            console.log('Could not disable field. Field not defined.');
        }
    },
    enableField: function(field) {
        if (field) {
            field.prop('disabled',false);
        } else {
            console.log('Could not enable field. Field not defined.');
        }
    },
    hideField: function(field, reserveSpace) {
        if (!reserveSpace) {
            field.parent("div").hide();
        } else {
            field.parent("div").css('visibility','hidden');
        }
    },
    showField: function(field) {
        field.parent("div").css({'visibility':'visible','display':''});
    },
    setTurnTime: function(value) {
        if ($("select[name='TURNAROUNDTIMEDD']").val() != value) {
            $("select[name='TURNAROUNDTIMEDD']").trigger('focus').val(value).trigger('change');
        }
    },
    getSelectedOptionText: function(field) {
        if (field) {
            if (field.is("select")) {
                var fieldName = field.attr('name');
                return $('select[name='+fieldName+'] option:selected').text();
            } else {
                return "";
            }
        } else {
            return "";
            console.log('Could not get selected option text. Field not defined.');
        }
    },
    setSelectedOptionText: function(field, text) {
        if (field) {
            if (field.is("select")) {
                var fieldName = field.attr('name');
                $('select[name='+fieldName+'] option:selected').text(text);
            }
        } else {
            console.log('Could not set selected option text to "'+text+'". Field not defined.');
        }
    },
    setSelectOptionText: function(field, option, text) {
        if (field) {
            if (field.is("select")) {
                var fieldName = field.attr('name');
                $('select[name='+fieldName+'] option[value='+option+']').text(text);
            }
        } else {
            console.log('Could not set selected option text to "'+text+'". Field not defined.');
        }
    },
    isValueInSelect: function(field, value) {
        if (field) {
            var options = field.children('option');
            var optionValues = $.map(field.children('option'), function(e) { return e.value; });
            if ($.inArray(value, optionValues) != -1) {
                return true;
            } else {
                return false;
            }
        } else {
            console.log('Could not find '+value+' in values for select. Field not defined.');
            return false;
        }
    },
    changeFieldFromValueSet: function(field, valueSet, requote) {
        if (field) {
            if (field.is("select")) {
                for (var i = 0; i < valueSet.length; i++) {
                    if (this.isValueInSelect(field, valueSet[i])) {
                        this.changeField(field, valueSet[i], requote);
                    }
                }
            } else {
                console.log('Could not change field from value set. Field is not a select.');
            }
        } else {
            console.log('Could change field from value set. Field not defined.');
        }
    },
    changeFieldByText: function(field, text) {
        //options might have varying ID's like with preset dimensions and the option text is more reliable
        if (field) {
            if (field.is("select")) {
                var options = field.children('option');
                for (var i = 0; i < options.length; i++) {
                    option = $(options[i]);
                    optionText = option.text();
                    if (optionText == text) {
                        value = option.attr('value');
                        this.changeField(field, value, true);
                    }
                }
            }
        }
    },
    putOptionsandValuesInObject: function(field, objectName) {
        //create an object from select options' values and text
        if (field) {
            if (objectName) {
                if (field.is("select")) {
                    window[objectName] = {};
                    objectName = eval(objectName);
                    var options = field.children('option');
                    for (var i = 0; i < options.length; i++) {
                        option = $(options[i]);
                        console.log(option);
                        key = option.attr('value'); //value
                        console.log(key);
                        console.log(option.text());
                        objectName[key] = option.text();
                    }
                } else {
                    console.log('Could not create object "'+objectName+'". Field is not a select.');
                }
            } else {
                console.log('Could not create object. Object name not provided.');
            }
        } else {
            console.log('Could not create object. Field not defined.');
        }
    },
    getTotalQuantity: function() {
        //get current quantity even if supplying versions
        if (configureglobals.cquotedata) {
            return configureglobals.cquotedata.quantity;
        }
    },
    isMultipleVersion: function() {
        // true or false depending on whether there is more than one version
        if (configureglobals.cquotedata) {
            return configureglobals.cquotedata.multipleVersions;
        } else {
            return false;
        }
    },
    getWidth: function() {
        //get width regardless if in custom or preset dimensions mode
        if ($("select[name='PRESETDIMENSIONSDD']").length == 1) {
            var presetSelection = $("select[name='PRESETDIMENSIONSDD'] option:selected").text();
            if (presetSelection.indexOf("X") != -1) {
                var dimensions = presetSelection.split(' X ');
            }
            else {
                var dimensions = presetSelection.split(' x ');
            }
            return dimensions[0];
        } else if ($("input[name='WIDTHEF']").length == 1) {
            return $("input[name='WIDTHEF']").val();
        } else {
            return NULL;
        }
    },
    getHeight: function() {
        //get height regardless if in custom or preset dimensions mode
        if ($("select[name='PRESETDIMENSIONSDD']").length == 1) {
            var presetSelection = $("select[name='PRESETDIMENSIONSDD'] option:selected").text();
            if (presetSelection.indexOf("X") != -1) {
                var dimensions = presetSelection.split(' X ');
            }
            else {
                var dimensions = presetSelection.split(' x ');
            }
            return dimensions[1];
        } else if ($("input[name='HEIGHTEF']").length == 1) {
            return $("input[name='HEIGHTEF']").val();
        } else {
            return NULL;
        }
    },
    getPressSheetName: function() {
        return configureglobals.cquote.pjQuote.pressSheetQuote.pressSheet.name;
    },
    togglePresetDimensions: function() {
        var isPreset = (fields.presetDimensions ? true : false)
        controller.setCustomDimensionsOption(isPreset);
    },
    replaceFieldError: function(validation, field, errorMessage) {
        if (calcValidation.hasErrorForField(validation, field)) {
            field.parents("div.optionWrapperOn").children(".fieldErrorNote").html(errorMessage);
        }
    },
    appendFieldError: function(validation, field, errorMessage) {
        if (calcValidation.hasErrorForField(validation, field)) {
            field.parents("div.optionWrapperOn").children(".fieldErrorNote").append(errorMessage);
        }
    },
    alert: function(content,fieldName) {
        $.fancybox(
            '<h2 class="calcAlertHeader">Please Note:</h2>'+content+
            '<div style="text-align:center"><button type="button" class="save" onclick="$.fancybox.close()">OK</button></div>',
            {
                'autoDimensions'    : false,
                'width'             : 400,
                'height'            : 'auto',
                'transitionIn'      : 'none',
                'transitionOut'     : 'none',
                'hideOnContentClick': false,
                'hideOnOverlayClick': false,
                'overlayShow'       : true,
                'onClosed'          : function() { calcUtil.focusOn(fieldName) }
            }
        )
    },
    alertConfirm: function(content,callback) {
        var ret;
        $.fancybox(
            '<h2 class="calcAlertHeader">Please Note:</h2>'+content+
            '<div style="text-align:center"><button type="button" class="save" id="contentConfirm">OK</button></div>',
            {
                'modal' : true,
                'autoDimensions'    : false,
                'width'             : 400,
                'height'            : 'auto',
                'transitionIn'      : 'none',
                'transitionOut'     : 'none',
                onComplete : function() {
                    $("#contentConfirm").click(function() {
                        ret = true; 
                        $.fancybox.close();
                    })
                },
                onClosed : function() {
                    callback.call(this,ret);
                }
            }
        )
    },
    focusOn: function(fieldName) {
        if (hasValue(fieldName)) {
            $("input[name="+fieldName+"]").focus();
        }
    },
    getTotalThroughput: function() {
        if (configureglobals.cquote) {
            if (configureglobals.cquote.pjQuote) {
                return configureglobals.cquote.pjQuote.pressSheetsThroughDevice;
            } else {
                console.log('Total throughput is not valid for large format quotes');
                return 0;
            }
        } else {
            return 0;
        }
    },
    getTotalRuntime: function() {
        if (configureglobals.cquote) {
            if (configureglobals.cquote.pjQuote) {
                return configureglobals.cquote.pjQuote.runtime;
            } else {
                console.log('Total runtime is not valid for large format quotes');
                return 0;
            }
        } else {
            return 0;
        }
    },
    getTotalPressSheets: function() {
        if (configureglobals.cquote) {
            if (configureglobals.cquote.pjQuote) {
                return configureglobals.cquote.pjQuote.totalPressSheetCount;
            } else {
                console.log('Total press sheets is not valid for large format quotes');
                return 0;
            }
        } else {
            return 0;
        }
    },
    getPressSheetId: function() {
        if (configureglobals.cquote) {
            if (configureglobals.cquote.pjQuote) {
                return configureglobals.cquote.pjQuote.pressSheetQuote.pressSheet.id;
            } else {
                console.log('Large format quotes do not have press sheets');
                return 0;
            }
        } else {
            return 0;
        }
    },
    getCoverPressSheetId: function() {
        if (configureglobals.cquote) {
            if (configureglobals.cquote.pjQuote) {
                if (configureglobals.cquote.pjQuote.coverPressSheetQuote) {
                    return configureglobals.cquote.pjQuote.coverPressSheetQuote.pressSheet.id;
                } else {
                    console.log('No Cover Stock selected or offered on product')
                }
            } else {
                console.log('Large format quotes do not have press sheets');
                return 0;
            }
        } else {
            return 0;
        }
    },
    getDeviceId: function() {
        if (configureglobals.cquote) {
            if (configureglobals.cquote.pjQuote) {
                return configureglobals.cquote.pjQuote.device.id;
            } else {
                console.log('Large format quotes do not devices');
                return 0;
            }
        } else {
            return 0;
        }
    },
    getDeviceType: function() {
        if (configureglobals.cquote) {
            if (configureglobals.cquote.pjQuote) {
                return configureglobals.cquote.pjQuote.device.type.id;
            } else {
                console.log('Large format quotes do not devices');
                return 0;
            }
        } else {
            return 0;
        }
    },
    getJsonFromString: function(str) {
        try {
            return JSON.parse(str);
        } catch (e) {
            return false;
        }
    }
}
var calcValidation = {
    hasMessages: function(validation) {
        return validation.cvalidation.hasMessages;
    },
    hasJobQuoteMessages: function(validation) {
        return validation.cvalidation.hasJobQuoteMessages;
    },
    fieldNames: function(validation) {
        var fieldNames = [];
        var messages = validation.cvalidation.jobQuoteFieldMessages;
        if (messages) {
            for (var i = 0; i < messages.length; i++) {
                fieldNames.push(messages[i].fieldName);
            }
        }
        return fieldNames;
    },
    hasErrorForField: function(validation, field) {
        if (field) {
            var fieldName = field.attr('name');
            if (validation.cvalidation.jobQuoteFieldMessages) {
                var fieldNames = calcValidation.fieldNames(validation);
                if ($.inArray(fieldName, fieldNames) != -1) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    },
    fieldMessage: function(validation, field) {
        if (field) {
            var fieldName = field.attr('name');
            if (calcValidation.hasErrorForField(validation, field)) {
                var theMessage = '';
                var messages = validation.cvalidation.jobQuoteFieldMessages;
                for (var i = 0; i < messages.length; i++) {
                    if (messages[i].fieldName == fieldName) {
                        theMessage += messages[i].value;
                    }
                }
                return theMessage;
            } else {
                return '';
            }
        } else {
            return '';
        }
    },
    hasRequoteErrorMessages: function() {
        if (configureglobals.cquotedata.requoteInitMessages) {
            if (configureglobals.cquotedata.requoteInitMessages.list) {
                return true
            }
            return false
        }
        return false
    },
    getRequoteErrorMessages: function() {
        var requoteMessages = configureglobals.cquotedata.requoteInitMessages;
        var messages = [];
        if (requoteMessages) {
            for (var i = 0; i < requoteMessages.list.length; i++) {
                messages.push(requoteMessages.list[i].value);
            }
        }
        return messages;
    },
    hasRequoteMessageContaining: function(text) {
        if (text) {
            if (!calcValidation.hasRequoteErrorMessages) {
                return false
            }
            var requoteMessages = calcValidation.getRequoteErrorMessages();
            if (requoteMessages.length > 0) {
                for (var i = 0; i < requoteMessages[i].length; i++) {
                    if (requoteMessages[i].indexOf(text) != -1) {
                        return true;
                    }
                } return false;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
}
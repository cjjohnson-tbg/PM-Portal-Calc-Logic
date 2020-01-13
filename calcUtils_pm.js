
var pmCalcUtil = {
    showMessages: function() {
        // show an alert when necessary
        if (onQuoteUpdatedMessages) {
            if (onQuoteUpdatedMessages != '') {
                cu.alert(onQuoteUpdatedMessages);
                onQuoteUpdatedMessages = '';
            }
        }
    },
    validateValue: function (field, value) {
        if (field) {
            if (cu.getValue(field) != value) {
                cu.changeField(field, value, true);
            }
        }
    },
    addClassToOperation: function (opList, className) {
        if (!(Array.isArray(opList))) {
            opList = [opList];
        }
        for (var i = 0; i < opList.length; i++) {
            $('#operation' + opList[i]).addClass(className);
        }
    },
    addClassToOperationItemsWithString: function (opList, className, string) {
        if (!(Array.isArray(opList))) {
            opList = [opList];
        }
        for (var i = 0; i < opList.length; i++) {
            //$('#operation' + opList[i]).addClass('otherOp');
            $('select#operation' + opList[i] + ' option').each(function() {
                if ($(this).text().indexOf(string) != -1) {
                    $(this).addClass(className);
                }
            });
        }
    },
    trimOperationItemNames: function(opList, deliminater, opItemsList, excludeText) {
        //change single operation to array
        if (!(Array.isArray(opList))) {
            opList = [opList];
        }
        //Op Items List Optional.  default to empty array
        opItemsList = opItemsList || [];
        if (!(Array.isArray(opItemsList))) {
            opItemsList = [opItemsList];
        }
        for (var i = 0; i < opList.length; i++) {
            $('select#operation' + opList[i] + ' option').each(function() {
                //If item list is present, check if option in list
                if (opItemsList.length > 0) {
                    if (opItemsList.indexOf(Number(this.value)) == -1) {
                        return
                    }
                }

                var label = this.text;
                
                //if excludeText declared, skip if option has text
                if (excludeText) {
                    if (label.indexOf(excludeText) != -1) {
                        return
                    }
                }
                var index = label.indexOf(deliminater);
                if (index != -1) {
                    var newLabel = label.substring(0,index);
                    $(this).text(newLabel);
                }
            });
        }
    },
    hideFieldOptions: function(fieldList, operation) {
        //change single operation to array
        if (!(Array.isArray(fieldList))) {
            fieldList = [fieldList];
        }
        for (var i = 0; i < fieldList.length; i++) {
            $('option[value="' + fieldList[i] + '"]').hide();
        }
    },
    removeClassFromOperation: function (opList, className) {
        if (!(Array.isArray(opList))) {
            opList = [opList];
        }
        for (var i = 0; i < opList.length; i++) {
            $('#operation' + opList[i] + '').each(function() {
                $(this).removeClass('' + className + '');
            });
        }
    },
    removeOperationItemsWithString: function (opList, string) {
        //change single operation to array
        if (!(Array.isArray(opList))) {
            opList = [opList];
        }
        for (var i = 0; i < opList.length; i++) {
            $('select#operation' + opList[i] +' option').each(function() {
                var optionText = this.text;
                var index = optionText.indexOf(string);
                if (index != -1 && !this.selected) {
                    $(this).hide();
                }
            });
        }
    },
    hideOperationQuestion: function (opList) {
        if (!(Array.isArray(opList))) {
            opList = [opList];
        }
        for (var i = 0; i < opList.length; i++) {
            var opQuestion = $('#operation' + opList[i] + ' div.op');
            if (opQuestion) {
                opQuestion.hide()
            } else {
                console.log('operation question does not exist for ' + operation);
            }
        }
    },
    updateOperationQuestion: function(opList, questionText) {
        if (!(Array.isArray(opList))) {
            opList = [opList];
        }
        for (var i = 0; i < opList.length; i++) {
            var opQuestion = $('#operation' + opList[i] + ' div.op div label.opQuestion');
            if (opQuestion) {
                var opQuestionText = $(opQuestion).text(questionText);
            }
        }
    },
    roundTo: function (n, digits) {
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
        n = Number(n);
        return n;
    },
    setPropertyFromTextJson: function (text, targetObj) {
        if (!text) {
            console.log('no text to search for property');
            return
        }
        var jsonBlock = /\{(.*?)\}/.exec(text);
        if (jsonBlock) {
            var jsonStr = this.getJsonFromString(jsonBlock[0]);
            if (jsonStr) {
                //create objects and properties if not exists on window
                if (!window.targetObj) {
                    window[targetObj] = {};
                }
                if (!targetObj.property) {
                    target.property;
                }
                for (prop in jsonStr) {
                    targetObj[prop] = jsonStr[prop];
                }
            } else {
                console.log('invalid json string ' + opItemKeyText);
            }
        }
    },
    setCustomProperties: function (obj, textProp, newProp) {
        if (!obj) {
            return
        }
        if (!obj[textProp]) {
            return
        }
        //create new property if newProp defined
        if (newProp) {
            obj[newProp] = {};
        }
        var text = obj[textProp];
        // remove line breaks 
        text = text.replace(/[\n\r]/g, '');
        //Json properties must be property formed and wrapped in "[[{ }]]"
        var taggedBlock = /\[{2}(.*?)\]{2}/.exec(text);
        if (taggedBlock) {
            var jsonBlock = taggedBlock[0].slice(2,-2);
            var jsonStr = this.getJsonFromString(jsonBlock);
            for (property in jsonStr) {
                //if new property inputted insert there otherwise AND on original object (make querying results easier)
                if (newProp) {
                    obj[newProp][property] = jsonStr[property];
                } 
                obj[property] = jsonStr[property]; 
            }
        }
    },
    getJsonFromString: function (str) {
        try {
            return JSON.parse(str);
        } catch (e) {
            return false;
        }
    },
    getCustomProperties: function (obj, properties) {
        var result = null;
        if (!obj) {
            //console.log('object in getCustomProperties is not defined');
            return result
        }
        //if properties not array, create array for loop
        if (!(Array.isArray(properties))) {
            properties = [properties];
        }
        //dive into each child property
        for (var i = 0; i < properties.length; i++) {
            if (obj[properties[i]]) {
                obj = obj[properties[i]];
            }
        }
        if (obj) {
            result = obj;
        }
        return result
    }, 
    countHasValueFromOpSet: function (operations) {
        var opsWithValue = 0;
        for (var i = 0; i < operations.length; i++) {
            var key = 'operation' + operations[i];
            if (fields[key]) {
                if (cu.hasValue(fields[key])) {
                    opsWithValue++;
                }
            }
        }
        return opsWithValue
    }, 
    validateConfig: function (reasons) {
        //call function at end of logic scripts
        if (reasons.length > 0) {
            $('button.continueButton').removeAttr('onclick');
            $('button.continueButton').unbind('click');
            var checkoutErrorMessage = '<p><strong>These issues must be resolved before continuing:</strong></p><div><ul>';
            for (var i = 0; i < reasons.length; i++) {
                checkoutErrorMessage += '<li>' + reasons[i] + '</li>'
            }
            checkoutErrorMessage += '</ul></div>'
            $('button.continueButton').removeAttr('onclick');
            $('button.continueButton').bind('click', function(event) {
                cu.alert(checkoutErrorMessage);
            });
        } else {
            $('button.continueButton').unbind('click');
            $('button.continueButton').attr('onclick', 'common.continueClicked();');
        }
        disableCheckoutReasons = [];
    },
    getMaterialReferenceId: function (type) {
        var result = '';
        if (configureglobals.cquote.lpjQuote) {
            var material = configureglobals.cquote.lpjQuote.piece[type];
            if (material) {
                result = material.referenceId
            }
        } else if (configureglobals.cquote.pjQuote) {
            //for now just search for press sheet
            if (configureglobals.cquote.pjQuote.pressSheetQuote) {
                var result = configureglobals.cquote.pjQuote.pressSheetQuote.pressSheet.referenceId;
            }
            
        }
        return result
    },
    isNowBeforeCSTCutoffTime: function(hour24, minutes) {
        var localOffsetMs = new Date().getTimezoneOffset()*60*-1000;
        var localVsServerOffsetMs = localOffsetMs - SERVER_TZ_OFFSET_MS;
        var localTime = new Date();
        var localCutoffTime = (new Date(localTime.getFullYear(), localTime.getMonth(), localTime.getDate(), hour24, minutes, 0, 0));
        var localCutoffTime = new Date(localCutoffTime.getTime() + localVsServerOffsetMs);
        var returnVal = localTime.getTime() < localCutoffTime.getTime();
        return returnVal;
    },
    productionDaysFromNow: function(endDate, cutOffHour, saturday, sunday) {
        //End Date and Today (if before cutt off hour) = 1 Production day each
        var cutOffHour = cutOffHour ? cutOffHour : 0;
        var localTime = new Date();
        var daysToAdd = 0;

        //default to not include Saturday and Sunday unless defined in function call
        if (!saturday) {
            saturday = false
        }
        if (!sunday) {
            sunday = false
        }

        if (!pu.isValidDate(endDate)) {
            return null
        }

        //Add a day if past Cut-off Time
        if (cutOffHour) {
            if (localTime.getHours() >= cutOffHour) {
                daysToAdd++;
            }
        }
        var startDate = new Date(localTime.getFullYear(), localTime.getMonth(), localTime.getDate() + daysToAdd, 0, 0, 0, 0);

        var timeDiff = endDate.getTime() - startDate.getTime();
        var daysBetweenDates = timeDiff / 86400000;
        
        // loop through daysBetweenDates to check if a Weekend date
        var productionDays = 0;
        for (var dayCount = 0; dayCount <= daysBetweenDates; dayCount++) {
            var runningDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + dayCount, 0, 0, 0, 0);
            var dayOfWeek = runningDate.getDay();
            //Check if Weekend Day is set as Production Day
            if (dayOfWeek == 6) {
                if (saturday) {
                    productionDays++
                }
            } else if (dayOfWeek == 0) {
                if (sunday) {
                    productionDays++
                }
            } else {
                productionDays++;
            }
        }
        return productionDays
    },
    isValidDate: function(date) {
        return date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date);
    },
    getQuoteDefaultJson: function() {
        try {
            var quoteDefault = configureglobals.coffering.quoteDefaults;
            var objKeysRegex = /({|,)(?:\s*)(?:')?([A-Za-z_$\.][A-Za-z0-9_ \-\.$]*)(?:')?(?:\s*):/g;// look for object names
            var newQuotedKeysString = quoteDefault.replace(objKeysRegex, "$1\"$2\":");// all object names should be double quoted
            var newObject = JSON.parse(newQuotedKeysString);
            return newObject
        } catch (e) {
            return false
        }
    }
}

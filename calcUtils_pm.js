
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
    trimOperationItemNames: function(opList, deliminater) {
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
    removeOperationItemsWithString: function (op, string) {
        $('select#operation' + op +' option').each(function() {
            var item = this.text;
            var index = item.indexOf(string);
            if (index != -1) {
                $(this).hide();
            }
        });
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
    }
}

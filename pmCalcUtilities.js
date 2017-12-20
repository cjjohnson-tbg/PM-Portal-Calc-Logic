
var pmCalcUtil = {
    showMessages: function() {
            // show an alert when necessary
        if (onQuoteUpdatedMessages != '' || submessage != '') {
            onQuoteUpdatedMessages += submessage;
            cu.alert(onQuoteUpdatedMessages);
            onQuoteUpdatedMessages = '';
        }
    },
    addClassToFields: function (fieldList, className) {
        if (!(Array.isArray(fieldList))) {
            fieldList = [fieldList];
        }
        for (var i = 0; i < fieldList.length; i++) {
            $('#operation' + fieldList[i]).addClass(className);
        }
    },
    removeClassFromFields: function (fieldList, className) {
        if (!(Array.isArray(fieldList))) {
            fieldList = [fieldList];
        }
        for (var i = 0; i < fieldList.length; i++) {
            $('#operation' + fieldList[i] + '').each(function() {
                $(this).removeClass('' + className + '');
            });
        }
    },
    trimOptionItemsName: function(fieldList, deliminater) {
        if (!(Array.isArray(fieldList))) {
            fieldList = [fieldList];
        }
        for (var i = 0; i < fieldList.length; i++) {
            $('select#operation' + fieldList[i] + ' option').each(function() {
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
    removeFieldItemsWithString: function(fieldList, string) {
        //change single operation to array
        if (!(Array.isArray(fieldList))) {
            fieldList = [fieldList];
        }
        for (var i = 0; i < fieldList.length; i++) {
            $('select#operation' + op +' option').each(function() {
                var item = this.text;
                var index = item.indexOf(string);
                if (index != -1) {
                    $(this).hide();
                }
            });
        }
    }
}

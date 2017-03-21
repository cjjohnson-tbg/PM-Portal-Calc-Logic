
var pmCalcUtil = {
    showMessages: function() {
            // show an alert when necessary
        if (onQuoteUpdatedMessages != '' || submessage != '') {
            onQuoteUpdatedMessages += submessage;
            cu.alert(onQuoteUpdatedMessages);
            onQuoteUpdatedMessages = '';
        }
    }
    trimOperationItemName: function(opList, deliminater) {
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
    hideAllOperationItemsWithText: function(objectList, identifyer) {
        if (!objectList.is('select')) {
            console.log('object list is not a select for hiding operation items with ' + identifyer );
            return
        }
        for (var i = 0; i < objectList.length; i++) {
            $(objectList +' select option').each(function() {
                var item = this.text;
                var index = item.indexOf(identifyer);
                if (index != -1) {
                    $(this).hide();
                }
            });
        }
    }
    hideOperationItemsWithText: function(opList, identifyer) {
        if (!(Array.isArray(opList))) {
            opList = [opList];
        }
        $('select#operation' + opList +' option').each(function() {
            var item = this.text;
            var index = item.indexOf(identifyer);
            if (index != -1) {
                $(this).hide();
            }
        });
    }
    addClassToOperation: function (opList, className) {
        if (!(Array.isArray(opList))) {
            opList = [opList];
        }
        for (var i = 0; i < opList.length; i++) {
            $('#operation' + opList[i]).addClass(className);
        }
    }
    removeClassFromOperation: function (opList, className) {
        if (!(Array.isArray(opList))) {
            opList = [opList];
        }
        for (var i = 0; i < opList.length; i++) {
            $('#operation' + opList[i] + '').each(function() {
                $(this).removeClass('' + className + '');
            });
        }
    }
    addClassToOperationItem: function (opList, className, identifyer) {
        if (!(Array.isArray(opList))) {
            opList = [opList];
        }
        for (var i = 0; i < opList.length; i++) {
            $('select#operation' + opList[i] + ' option').each(function() {
                if ($(this).text().indexOf(identifyer) != -1) {
                    $(this).addClass(className);
                }
            });
        }
    }
    removeClassFromOperationItem: function (opList, className, identifyer) {
        if (!(Array.isArray(opList))) {
            opList = [opList];
        }
        for (var i = 0; i < opList.length; i++) {
            $('select#operation' + opList[i] + ' option').each(function() {
                if ($(this).text().indexOf(identifyer) != -1) {
                    $(this).addClass(className);
                }
            });
        }
    } 
}

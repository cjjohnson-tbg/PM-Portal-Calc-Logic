function renderExtendedCostBreakdown () {
    // stop for stock product
    if (configureglobals.cstockoffering) { return } 
    // added the following line because when a validation issue happens, var quote wasn't populating on line 4. error showed in the console but it blocked futher calc processing, creating quote issues.
    if (!configureglobals.cquote) { return }
    
    var quote = configureglobals.cquote.pjQuote || configureglobals.cquote.lpjQuote ? configureglobals.cquote.pjQuote || configureglobals.cquote.lpjQuote : null;
    if (!quote) { return }
    if (!configureglobals.cquote.success) { return }

    var isSmallFormatCalc = configureglobals.cquote.pjQuote ? true : false;
    var isLargeFormatFulfillment = configureglobals.coffering.systemOffering.fulfillmentCenter.id == 5 ? true : false;
    
    var costAndMarginData = [
        { 
            key: "Total Job Cost",
            value: "$" + (quote.jobCostPrice + quote.operationsPrice).toFixed(2)
        },
        {
            key: "Markup Percent",
            value: (quote.markupPercent * 100).toFixed() + "%"
        },
        {
            key: "Margin",
            value: (quote.markupPercent/(1+quote.markupPercent)).toFixed(2) + "%"
        },
        {
            key: "Margin $",
            value: "$" + quote.markupPrice.toFixed(2)
        },
        {
            key: "Proofing Price",
            value: "$" + quote.proofPrice.toFixed(2)
        }
    ];

    var estimateDetailsData = [
        {
            cost: quote.versionsPrice,
            name: "Desktop",
            item: '',
            cost_basis: '',
            description: '',
            shouldDisplay: true,
            costingOnly: true
        },
        {
            cost: quote.pressSheetQuote ? quote.pressSheetPrice : null,
            name: "Substrate",
            item: quote.pressSheetQuote ? quote.pressSheetQuote.pressSheet.name : null,
            cost_basis: quote.pressSheetQuote ? quote.pressSheetQuote.pressSheetCount + ' boards' : '',
            description: quote.pressSheetQuote ? quote.pressSheetQuote.piecesOnSheet + ' pieces per board' : '',
            shouldDisplay: quote.pressSheetQuote ? true : false,
            costingOnly: false
        },
        {
            cost: quote.devicePrice + (quote.side1Ink ? quote.side1InkPrice : 0) + (quote.side2Ink ? quote.side2InkPrice : null),
            name: "Total Device Cost",
            item: quote.device.name,
            cost_basis: '',
            description: (quote.side1Ink ? quote.side1Ink.name : '') + (quote.side2Ink ? ' / ' + quote.side2Ink.name : ''),
            shouldDisplay : true,
            costingOnly : false
        }
    ];

    init();
    return;

    function init () {
        var $el = $('#extended-cost-breakdown');
        var $ps = $('#print-specifications-detail');

        var $costAndMarginTable;
        var $estimateDetailsTable;
        var $printSpecificationsTable;
        
        addOperationsData();
        buildCostAndMarginTable();
        buildEstimateDetailTable();
        buildPrintSpecificationsTable();
        updateUI();

        return;

        function addOperationsData () {
            //create new array from operations manager only if there is a choice.  That new array can be used to return values
            var selectedOperations = $.map(getLargeOrSmallFormatOperationChoices(), function(w) { if (w.choice) {return w;} });
            
            if (quote.operationQuotes) {
                for (var i = 0; i < selectedOperations.length; i++) {
                    //if pre-press operation push to desktop with version change
                    if (selectedOperations[i].pjcOperation.operation.id == 95) {
                        for (var j = 0; j < estimateDetailsData.length; j++) {
                            if (estimateDetailsData[j].name == 'Desktop') {
                                estimateDetailsData[j].cost += (quote.operationQuotes[i].price ? quote.operationQuotes[i].price : 0);
                                break
                            }
                        }
                        continue
                    }
                    //else push new line
                    if (!selectedOperations[i]) {
                        console.log("error on selectedOperations for " + quote.operationQuotes[i])
                    } else {
                        estimateDetailsData.push({
                            cost: quote.operationQuotes[i].price ? quote.operationQuotes[i].price : 0,
                            name: quote.operationQuotes[i].data.heading || quote.operationQuotes[i].operation.heading,
                            item: selectedOperations[i].choice.name,
                            cost_basis: quote.operationQuotes[i].pieces || quote.operationQuotes[i].data.quantity,
                            description: selectedOperations[i].choice.description,
                            shouldDisplay: true,
                            costingOnly: selectedOperations[i].pjcOperation ? selectedOperations[i].pjcOperation.operation.costingOnly : quote.operationQuotes[i].operation.costingOnly
                        });

                    }
                }
            }
        }

        function buildCostAndMarginTable () {
            var $wrapper = $('<div><h4>Cost and Margin</h4></div>');
            var $table = $('<table class="debug-table cost-and-margin-table"></table>');
            var rows = '';

            for (var i = 0; i < costAndMarginData.length; i++) {
                rows += '<tr><td>' + costAndMarginData[i].value + '</td><th>' + costAndMarginData[i].key + '</th></tr>';
            }

            $table.append(rows);
            $wrapper.append($table);
            $costAndMarginTable = $wrapper;
        }

        function buildEstimateDetailTable () {
            var $wrapper = $('<div><h4>Estimate Details</h4></div>');
            var $table = $('<table class="debug-table estimate-detail-table"><tr><th class="cell-cost">Cost</th><th class="cell-name">Name</th><th class="cell-item">Item</th><th class="cell-cost-basis">Cost Basis</th><th class="cell-description">Description</th></tr></table>');
            var rows = '';

            for (var i = 0; i < estimateDetailsData.length; i++) {
                if (estimateDetailsData[i].shouldDisplay && estimateDetailsData[i].cost != 0){
                    rows += '<tr><td class="cell-cost">$' + estimateDetailsData[i].cost.toFixed(2) + '</td><td class="cell-name">' + estimateDetailsData[i].name + '</td><td class="cell-item">' + estimateDetailsData[i].item + '</td><td class="cell-cost-basis">' + estimateDetailsData[i].cost_basis + '</td><td class="cell-description">' + estimateDetailsData[i].description + '</td></tr>';                    
                }
                
            }

            $table.append(rows);
            $wrapper.append($table);
            $estimateDetailsTable = $wrapper;
        }

        function buildPrintSpecificationsTable () {
            var $wrapper = $('<div><h4>Print Specifications</h4></div>');
            var $table = $('<table class="debug-table print-specifications-table"><tr><th class="cell-name">Name</th><th class="cell-item">Item</th><th class="cell-description">Description</th></tr></table>');
            var rows = '';

            for (var i = 0; i < estimateDetailsData.length; i++) {
                if (estimateDetailsData[i].shouldDisplay && !estimateDetailsData[i].costingOnly){
                    rows += '<tr><td class="cell-name">' + estimateDetailsData[i].name + '</td><td class="cell-item">' + estimateDetailsData[i].item + '</td><td class="cell-description">' + estimateDetailsData[i].description + '</td></tr>';                    
                }
                
            }

            $table.append(rows);
            $wrapper.append($table);
            $printSpecificationsTable = $wrapper;
        }

        function updateUI () {
            var $container = $('#calculator').length ? $('#calculator') : $('#lfCalculator');

            if (!$el.length) {
                $el = $('<div id="extended-cost-breakdown" class="fill"></div>')
                $container.after($el);
            } else {
                $el.empty();
            }

            if (!$ps.length) {
                $ps = $('<div id="print-specifications-detail"></div>')
                $container.after($ps);
            } else {
                $ps.empty();
            } 

            $el.append($costAndMarginTable);
            $el.append($estimateDetailsTable);
            $container.after($el);
            $('body').append($ps);
            $ps.append($printSpecificationsTable);
        }

        function isLargeFormat () {
            return configureglobals.coperationsmgr ? true : false;
        }

        function getLargeOrSmallFormatOperationChoices () {
            return configureglobals.coperationsmgr ? configureglobals.coperationsmgr.operations : configureglobals.coperationdata.list;
        }

    }

}
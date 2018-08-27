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
            cost: quote.devicePrice,
            name: "Device Setup",
            item: quote.device.name,
            cost_basis: '',
            description: '',
            shouldDisplay: true,
            costingOnly: false
        },
        //Largeformat objects
        {
            cost: quote.frontLaminatePrice,
            name: "Front Laminate",
            item: quote.piece.frontLaminate ? quote.piece.frontLaminate.productionName : null,
            cost_basis: '',
            description: quote.piece.frontLaminate ? quote.piece.frontLaminate.referenceId : null,
            shouldDisplay: quote.piece.frontLaminate ? true : false,
            costingOnly: false
        },
        {
            cost: quote.aPrintSubstratePrice,
            name: "Print Substrate",
            item: quote.piece.aPrintSubstrate.productionName ? quote.piece.aPrintSubstrate.productionName : null,
            item: quote.piece.aPrintSubstrate ? quote.piece.aPrintSubstrate.productionName : null,
            cost_basis: '',
            description: printConfig ? printConfig.aPrintSubstrate ? 'OPTIMUM ROLL ' + printConfig.aPrintSubstrate.name : quote.piece.aPrintSubstrate.referenceId  : null,
            shouldDisplay: quote.piece.aPrintSubstrate ? true : false,
            costingOnly: false
        },
        {
            cost: quote.aAdhesiveLaminatePrice,
            name: "Adhesive Laminate",
            item: quote.piece.aAdhesiveLaminate ? quote.piece.aAdhesiveLaminate.productionName : null,
            cost_basis: '',
            description: quote.piece.aAdhesiveLaminate ? quote.piece.aAdhesiveLaminate.referenceId : null,
            shouldDisplay: quote.piece.aAdhesiveLaminate ? true : false,
            costingOnly: false
        },
        {
            cost: quote.mountSubstratePrice,
            name: "Mount Substrate",
            item: quote.piece.mountSubstrate ? quote.piece.mountSubstrate.productionName : null,
            cost_basis: '',
            description: quote.piece.mountSubstrate ? quote.piece.mountSubstrate.referenceId : null,
            shouldDisplay: quote.piece.mountSubstrate ? true : false,
            costingOnly: false
        },
        {
            cost: quote.bAdhesiveLaminatePrice,
            name: "Back Adhesive Laminate",
            item: quote.piece.bAdhesiveLaminate ? quote.piece.bAdhesiveLaminate.productionName : null,
            cost_basis: '',
            description: quote.piece.bAdhesiveLaminate ? quote.piece.bAdhesiveLaminate.referenceId : null,
            shouldDiplay: quote.piece.bAdhesiveLaminate ? true : false,
            costingOnly: false
        },
        {
            cost: quote.bPrintSubstratePrice,
            name: "Print Substrate",
            item: quote.piece.bPrintSubstrate ? quote.piece.bPrintSubstrate.productionName : null,
            cost_basis: '',
            description: quote.piece.bPrintSubstrate ? quote.piece.bPrintSubstrate.referenceId : null,
            shouldDisplay: quote.piece.bPrintSubstrate ? true : false,
            costingOnly: false
        },
        {
            cost: quote.backLaminatePrice,
            name: "Back Laminate",
            item: quote.piece.backLaminate ? quote.piece.backLaminate.productionName : null,
            cost_basis: '',
            description: quote.piece.backLaminate ? quote.piece.backLaminate.referenceId : null,
            shouldDisplay: quote.piece.backLaminate ? true : false,
            costingOnly: false
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
        var $printConfigs;
        var $configTable;
        var $materialsConfigTable;
        
        addOperationsData();
        buildCostAndMarginTable();
        buildEstimateDetailTable();
        buildPrintSpecificationsTable();
        buildPrintConfigurationTable();
        updateUI();

        return;

        function addOperationsData () {
            //create new array from operations manager only if there is a choice.  That new array can be used to return values
            var selectedOperations = $.map(getLargeOrSmallFormatOperationChoices(), function(w) { if (w.choice) {return w;} });
            
            if (quote.operationQuotes) {
                //if pre-press, Add to Desktop estimate details
                for (var i = 0; i < quote.operationQuotes.length; i++) {
                    //if pre-press operation push to desktop with version change
                    if (selectedOperations[i]) {
                        if (selectedOperations[i].lpjcOperation.operation.id == 69) {
                            for (var j = 0; j < estimateDetailsData.length; j++) {
                                if (estimateDetailsData[j].name == 'Desktop') {
                                    estimateDetailsData[j].cost += (quote.operationQuotes[i].price ? quote.operationQuotes[i].price : 0);
                                    break
                                }
                            }
                            continue
                        }
                    }
                    if (!selectedOperations[i]) {
                        console.log("error on selectedOperations for " + quote.operationQuotes[i])
                    } else {
                        estimateDetailsData.push({
                            cost: quote.operationQuotes[i].price ? quote.operationQuotes[i].price : 0,
                            name: quote.operationQuotes[i].operation.id == 52 ? 'Device Run ' : quote.operationQuotes[i].operation.heading,
                            item: selectedOperations[i].choice.name ? selectedOperations[i].choice.name : null,
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
                if (estimateDetailsData[i].shouldDisplay && estimateDetailsData[i].cost > 0){
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

        function buildPrintConfigurationTable() {
            var $wrapper = $('<div class="print-material-configuration"><h4>Print Material Configuration Details</h4></div>');
            
            if (window.cc.printConfig) {
                var pc = window.cc.printConfig;
                if (pc.details.valid_quote) {
                    var configDetails = pc.details;
                    var configMaterials = pc.materials;
                    var configQuote = pc.quote;
                    //loop through each printConfig property to check if xCost is in pc.quote and create materials, else push into general config table
                    var $configContainer = $('<div><h5>Job Configuration</h5></div>');
                    var $deviceContainer = $('<div><h6>Device Configuration</h6></div>');
                    var quote = configureglobals.cquote.lpjQuote ? configureglobals.cquote.lpjQuote : null;
                    if (quote.device) {
                        if (quote.device.customProperties) {
                            var $table = $('<table class="debug-table print-specifications-table"><tr><th class="cell-property">Property</th><th class="cell-property-value">Item</th></tr></table>');
                            var rows = '';
                            var devProperties = quote.device.customProperties;
                            for (prop in devProperties) {
                                rows += '<tr><td class="cell-property">' + prop + '</td><td class="cell-property-value">' + devProperties[prop] + '</td></tr>';
                            }
                            $table.append(rows);
                            $deviceContainer.append($table);
                        }
                    }
                    var $matConfigContainer = $('<div><h5>Material Details</h5></div>');
                    var $configTable = $('<table class="debug-table"><tr><th>Property</th><th>Value</th></tr></table>');
                    var configRows = '';
                    for (prop in configDetails) {
                        configRows += '<tr><td class="cell-property">' + prop + '</td><td class="cell-property-value">' + roundTo(configDetails[prop],2) + '</td></tr>';
                    }
                    for (mat in configMaterials) {
                        if (!jQuery.isEmptyObject(configMaterials[mat])) {
                            var $tableContainer = $('<div><h6>' + mat + '</h6></div>');
                            var $table = $('<table class="debug-table print-specifications-table"><tr><th class="cell-property">Property</th><th class="cell-property-value">Item</th></tr></table>');
                            var materialRows = '';
                            var material = configMaterials[mat];
                            for (prop in material) {
                                if (material[prop]) {
                                    materialRows += '<tr><td class="cell-property">' + prop + '</td><td class="cell-property-value">' +roundTo(material[prop],2) + '</td></tr>';
                                }
                            }
                            
                            $table.append(materialRows);
                            $tableContainer.append($table);
                            $matConfigContainer.append($tableContainer);
                        }
                    }
                    $configTable.append(configRows);
                    $configContainer.append($configTable);
                    $configContainer.append($deviceContainer);
                    $wrapper.append($configContainer);
                    $wrapper.append($matConfigContainer);
                }
            }

            $printConfigs = $wrapper;
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
            $el.append($printConfigs);
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

        function roundTo(n, digits) {
            if (isNaN(n)) {
                return n
            }
            if (typeof n === 'boolean') {
                return n
            }
            if (n % 1 === 0) {
                return n
            }
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
            return n;
        }

    }

}
/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [1.0, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "GET /character/24"], "isController": false}, {"data": [1.0, 500, 1500, "DELETE /character/24"], "isController": false}, {"data": [1.0, 500, 1500, "DELETE /character/25"], "isController": false}, {"data": [1.0, 500, 1500, "GET /characters"], "isController": false}, {"data": [1.0, 500, 1500, "GET /character/26"], "isController": false}, {"data": [1.0, 500, 1500, "GET /character/25"], "isController": false}, {"data": [1.0, 500, 1500, "PUT /character/28 (update)"], "isController": false}, {"data": [1.0, 500, 1500, "DELETE /character/28"], "isController": false}, {"data": [1.0, 500, 1500, "POST /character (create)"], "isController": false}, {"data": [1.0, 500, 1500, "DELETE /character/26"], "isController": false}, {"data": [1.0, 500, 1500, "DELETE /character/27"], "isController": false}, {"data": [1.0, 500, 1500, "PUT /character/26 (update)"], "isController": false}, {"data": [1.0, 500, 1500, "PUT /character/27 (update)"], "isController": false}, {"data": [1.0, 500, 1500, "PUT /character/24 (update)"], "isController": false}, {"data": [1.0, 500, 1500, "GET /character/28"], "isController": false}, {"data": [1.0, 500, 1500, "GET /character/27"], "isController": false}, {"data": [1.0, 500, 1500, "PUT /character/25 (update)"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 86600, 0, 0.0, 1.1128290993071643, 0, 16, 1.0, 2.0, 2.0, 3.0, 4330.43304330433, 1954.9183922298478, 892.3036834933492], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET /character/24", 721, 0, 0.0, 0.9514563106796106, 0, 4, 1.0, 2.0, 2.0, 2.7799999999999727, 36.212958312405824, 9.654431268834756, 6.613108598066298], "isController": false}, {"data": ["DELETE /character/24", 721, 0, 0.0, 1.0568654646324531, 0, 4, 1.0, 2.0, 2.0, 3.0, 36.212958312405824, 10.361715610873933, 7.391121374309392], "isController": false}, {"data": ["DELETE /character/25", 3460, 0, 0.0, 1.0687861271676302, 0, 4, 1.0, 2.0, 2.0, 3.0, 173.1385108086469, 49.540609049739786, 35.33784058496797], "isController": false}, {"data": ["GET /characters", 17322, 0, 0.0, 1.3123773236346945, 0, 16, 1.0, 3.0, 3.0, 4.0, 866.1866186618662, 1012.118741170992, 156.48879341059106], "isController": false}, {"data": ["GET /character/26", 6420, 0, 0.0, 0.9774143302180687, 0, 14, 1.0, 2.0, 2.0, 3.0, 321.19271562937763, 85.51683744621774, 58.655310373724234], "isController": false}, {"data": ["GET /character/25", 3460, 0, 0.0, 1.0028901734104059, 0, 16, 1.0, 2.0, 2.0, 3.0, 173.12984738553916, 46.1262939392044, 31.61648580185139], "isController": false}, {"data": ["PUT /character/28 (update)", 1406, 0, 0.0, 1.0021337126600274, 0, 4, 1.0, 2.0, 2.0, 2.0, 70.40208302037955, 18.63180126808873, 16.29423210530269], "isController": false}, {"data": ["DELETE /character/28", 1406, 0, 0.0, 0.8990042674253201, 0, 4, 1.0, 1.0, 2.0, 2.9300000000000637, 70.40208302037955, 20.144346020479695, 14.369175147714186], "isController": false}, {"data": ["POST /character (create)", 17320, 0, 0.0, 1.1693995381062325, 0, 16, 1.0, 2.0, 2.0, 3.0, 866.3898754439498, 235.21131384122856, 200.52187546896104], "isController": false}, {"data": ["DELETE /character/26", 6420, 0, 0.0, 0.9995327102803742, 0, 5, 1.0, 2.0, 2.0, 3.0, 321.17664715593577, 91.89917736004803, 65.55265552303767], "isController": false}, {"data": ["DELETE /character/27", 5311, 0, 0.0, 0.9875729617774424, 0, 4, 1.0, 2.0, 2.0, 3.0, 265.8158158158158, 76.05862698636136, 54.25342334522022], "isController": false}, {"data": ["PUT /character/26 (update)", 6420, 0, 0.0, 1.0579439252336418, 0, 5, 1.0, 2.0, 2.0, 3.0, 321.17664715593577, 84.99889783130722, 74.33482946870778], "isController": false}, {"data": ["PUT /character/27 (update)", 5313, 0, 0.0, 1.0920383963862241, 0, 5, 1.0, 2.0, 2.0, 3.0, 265.8360852596818, 70.35310459509157, 61.526515826703694], "isController": false}, {"data": ["PUT /character/24 (update)", 721, 0, 0.0, 1.1109570041608885, 0, 5, 1.0, 2.0, 2.0, 3.0, 36.212958312405824, 9.583702834630838, 8.38131945316424], "isController": false}, {"data": ["GET /character/28", 1406, 0, 0.0, 1.095305832147936, 0, 4, 1.0, 2.0, 2.0, 3.0, 70.40208302037955, 18.767544971458616, 12.856630395323219], "isController": false}, {"data": ["GET /character/27", 5313, 0, 0.0, 1.0278562017692452, 0, 5, 1.0, 2.0, 2.0, 3.0, 265.79618790334683, 70.7823384892941, 48.53895228313072], "isController": false}, {"data": ["PUT /character/25 (update)", 3460, 0, 0.0, 1.0872832369942198, 0, 5, 1.0, 2.0, 2.0, 3.0, 173.1385108086469, 45.82083635658526, 40.07209673989191], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 86600, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});

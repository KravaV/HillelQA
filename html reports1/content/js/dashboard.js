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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [1.0, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "GET /characters"], "isController": false}, {"data": [1.0, 500, 1500, "DELETE /character/4"], "isController": false}, {"data": [1.0, 500, 1500, "PUT /character/6 (update)"], "isController": false}, {"data": [1.0, 500, 1500, "POST /character (create)"], "isController": false}, {"data": [1.0, 500, 1500, "DELETE /character/5"], "isController": false}, {"data": [1.0, 500, 1500, "DELETE /character/6"], "isController": false}, {"data": [1.0, 500, 1500, "PUT /character/4 (update)"], "isController": false}, {"data": [1.0, 500, 1500, "GET /character/5"], "isController": false}, {"data": [1.0, 500, 1500, "GET /character/6"], "isController": false}, {"data": [1.0, 500, 1500, "PUT /character/5 (update)"], "isController": false}, {"data": [1.0, 500, 1500, "GET /character/4"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 500, 0, 0.0, 1.23, 0, 7, 1.0, 2.0, 2.9499999999999886, 3.0, 500.50050050050055, 142.32591966966967, 102.83721221221221], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET /characters", 100, 0, 0.0, 1.6300000000000003, 0, 7, 1.0, 3.0, 3.0, 6.989999999999995, 100.70493454179255, 33.826630161127895, 18.19376258811682], "isController": false}, {"data": ["DELETE /character/4", 96, 0, 0.0, 0.9999999999999996, 0, 4, 1.0, 2.0, 2.0, 4.0, 96.87184661957617, 27.71821392532795, 19.677093844601412], "isController": false}, {"data": ["PUT /character/6 (update)", 2, 0, 0.0, 2.0, 1, 3, 2.0, 3.0, 3.0, 3.0, 3.883495145631068, 1.0239684466019416, 0.8950242718446602], "isController": false}, {"data": ["POST /character (create)", 100, 0, 0.0, 1.39, 0, 3, 1.0, 2.0, 2.9499999999999886, 3.0, 100.90817356205852, 27.296449293642784, 23.354723763874873], "isController": false}, {"data": ["DELETE /character/5", 2, 0, 0.0, 2.0, 1, 3, 2.0, 3.0, 3.0, 3.0, 3.8684719535783367, 1.1068967601547388, 0.7857833655705996], "isController": false}, {"data": ["DELETE /character/6", 2, 0, 0.0, 1.5, 1, 2, 1.5, 2.0, 2.0, 2.0, 3.883495145631068, 1.1111953883495145, 0.7888349514563107], "isController": false}, {"data": ["PUT /character/4 (update)", 96, 0, 0.0, 1.0833333333333335, 0, 3, 1.0, 2.0, 2.0, 3.0, 96.87184661957617, 25.542381432896065, 22.32593340060545], "isController": false}, {"data": ["GET /character/5", 2, 0, 0.0, 0.5, 0, 1, 0.5, 1.0, 1.0, 1.0, 3.90625, 1.03759765625, 0.70953369140625], "isController": false}, {"data": ["GET /character/6", 2, 0, 0.0, 1.5, 1, 2, 1.5, 2.0, 2.0, 2.0, 3.898635477582846, 1.0355750487329434, 0.7081505847953217], "isController": false}, {"data": ["PUT /character/5 (update)", 2, 0, 0.0, 2.5, 1, 4, 2.5, 4.0, 4.0, 4.0, 3.883495145631068, 1.0239684466019416, 0.8950242718446602], "isController": false}, {"data": ["GET /character/4", 96, 0, 0.0, 0.9687499999999999, 0, 3, 1.0, 2.0, 2.0, 3.0, 96.77419354838709, 25.705645161290324, 17.578125], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 500, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});

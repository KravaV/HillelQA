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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [1.0, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "GET /characters"], "isController": false}, {"data": [1.0, 500, 1500, "PUT /character/32 (update)"], "isController": false}, {"data": [1.0, 500, 1500, "PUT /character/28 (update)"], "isController": false}, {"data": [1.0, 500, 1500, "DELETE /character/28"], "isController": false}, {"data": [1.0, 500, 1500, "GET /character/31"], "isController": false}, {"data": [1.0, 500, 1500, "POST /character (create)"], "isController": false}, {"data": [1.0, 500, 1500, "DELETE /character/29"], "isController": false}, {"data": [1.0, 500, 1500, "GET /character/30"], "isController": false}, {"data": [1.0, 500, 1500, "GET /character/32"], "isController": false}, {"data": [1.0, 500, 1500, "PUT /character/30 (update)"], "isController": false}, {"data": [1.0, 500, 1500, "PUT /character/29 (update)"], "isController": false}, {"data": [1.0, 500, 1500, "PUT /character/31 (update)"], "isController": false}, {"data": [1.0, 500, 1500, "GET /character/28"], "isController": false}, {"data": [1.0, 500, 1500, "DELETE /character/31"], "isController": false}, {"data": [1.0, 500, 1500, "DELETE /character/32"], "isController": false}, {"data": [1.0, 500, 1500, "GET /character/29"], "isController": false}, {"data": [1.0, 500, 1500, "DELETE /character/30"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 162316, 0, 0.0, 1.03576357229109, 0, 40, 1.0, 1.0, 2.0, 3.0, 4162.695868489216, 2004.804698519606, 857.7411430416997], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET /characters", 32466, 0, 0.0, 1.2103123267418234, 0, 40, 1.0, 2.0, 3.0, 4.0, 832.6109814582104, 1098.4879798136844, 150.42288239235248], "isController": false}, {"data": ["PUT /character/32 (update)", 2164, 0, 0.0, 1.0545286506469516, 0, 32, 1.0, 2.0, 2.0, 3.0, 67.66940804903219, 17.90860310672629, 15.661767292598268], "isController": false}, {"data": ["PUT /character/28 (update)", 2192, 0, 0.0, 0.7851277372262765, 0, 27, 1.0, 1.0, 2.0, 2.0, 62.74869035009876, 16.606342856324964, 14.522890247044343], "isController": false}, {"data": ["DELETE /character/28", 2192, 0, 0.0, 0.8261861313868611, 0, 36, 1.0, 1.0, 2.0, 3.0, 62.74869035009876, 17.954459250565368, 12.80710574528383], "isController": false}, {"data": ["GET /character/31", 9924, 0, 0.0, 0.9604997984683536, 0, 39, 1.0, 2.0, 2.0, 3.0, 275.7202789431278, 73.43886745339371, 50.351261877309476], "isController": false}, {"data": ["POST /character (create)", 32464, 0, 0.0, 1.0873891079349476, 0, 39, 1.0, 2.0, 2.0, 3.0, 832.6664614753257, 226.05593387709038, 192.71674938442598], "isController": false}, {"data": ["DELETE /character/29", 6745, 0, 0.0, 0.9779095626389898, 0, 38, 1.0, 2.0, 2.0, 3.0, 187.43921078227038, 53.63250855391135, 38.256635794428234], "isController": false}, {"data": ["GET /character/30", 11438, 0, 0.0, 0.937576499388005, 0, 39, 1.0, 2.0, 2.0, 3.0, 317.8105029174771, 84.62392982425673, 58.0376602007502], "isController": false}, {"data": ["GET /character/32", 2164, 0, 0.0, 1.0998151571164496, 0, 35, 1.0, 2.0, 2.0, 3.0, 67.66940804903219, 18.039181963163326, 12.35759697770412], "isController": false}, {"data": ["PUT /character/30 (update)", 11438, 0, 0.0, 1.0425773736667199, 0, 38, 1.0, 2.0, 2.0, 3.0, 317.8105029174771, 84.1080530181995, 73.55575116351764], "isController": false}, {"data": ["PUT /character/29 (update)", 6745, 0, 0.0, 1.0351371386212027, 0, 36, 1.0, 2.0, 2.0, 3.0, 187.43921078227038, 49.60549425976101, 43.38192671425594], "isController": false}, {"data": ["PUT /character/31 (update)", 9923, 0, 0.0, 0.9922402499244187, 0, 38, 1.0, 2.0, 2.0, 3.0, 275.69249576306504, 72.96158823417053, 63.80773583578751], "isController": false}, {"data": ["GET /character/28", 2192, 0, 0.0, 0.7007299270072983, 0, 34, 1.0, 1.0, 2.0, 2.0, 62.74869035009876, 16.728898892165002, 11.458989351043426], "isController": false}, {"data": ["DELETE /character/31", 9922, 0, 0.0, 0.9261237653698804, 0, 37, 1.0, 1.0, 2.0, 3.0, 275.68003111889084, 78.88110265413576, 56.266725101414245], "isController": false}, {"data": ["DELETE /character/32", 2164, 0, 0.0, 0.8978743068391868, 0, 36, 1.0, 1.0, 2.0, 3.0, 67.67152417286884, 19.363043537744698, 13.81186382043905], "isController": false}, {"data": ["GET /character/29", 6745, 0, 0.0, 0.9027427724240167, 0, 33, 1.0, 2.0, 2.0, 3.0, 187.43921078227038, 49.94298297033486, 34.229621500277894], "isController": false}, {"data": ["DELETE /character/30", 11438, 0, 0.0, 0.9590837559013817, 0, 37, 1.0, 2.0, 2.0, 3.0, 317.81933368529275, 90.9385398142488, 64.86742259787714], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 162316, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});

// jshint devel:true
$.material.init();

var dataUrl = 'https://data.qld.gov.au/api/action/datastore_search?resource_id=4ebc1cf0-22fb-45d1-a1f3-93dfe198b687';
$.ajax(
  {
    url: dataUrl,
    success: loadData
  });
var priorityMap = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1
};
var statusMap = {
  A: '#AFA',
  G: '#FAA',
}
function loadData(response){
  google.charts.load('current', {'packages':['corechart','table']});

  google.charts.setOnLoadCallback(drawChart);
  function drawChart() {
    var dataTable = dashboardResponseToDataTable(response.result);
    var view = new google.visualization.DataView(dataTable);
    view.setColumns([
        {
          calc: getRevisedEstimate,
          type: 'number'
        },
        {
          calc: getPriority,
          label: 'Priority Value',
          type: 'number'
        }, {
          calc: getStyle,
          type: 'string',
          role: 'style'
        }]);
    var options = {
      title: 'data.qld.gov projects dashboards',
        hAxis : {
          title: 'Estimated expenditure ($)'
        },
        vAxis: {
          title :'Priority (Low to Critical)',
        },
      legend: 'none',
      sortColumns: 0
    };

    var chart = new google.visualization.ScatterChart(document.getElementById('chart_div'));

    chart.draw(view, options);

    var table = new google.visualization.Table(document.getElementById('table_div'));
    table.draw(dataTable,{showRowNumber: true, width: '100%', height: '100%'});
  }
}
function getRevisedEstimate(dataTable, rowNum){
  var estimate =  dataTable.getValue(rowNum,18); // current revised estimate
  return parseInt(estimate) || 0;
}

function getPriority(dataTable, rowNum){
  var priority = dataTable.getValue(rowNum,3); //priority
  return priorityMap[priority] || 0;
}

function getStyle(dataTable, rowNum){
  var overallStatus = dataTable.getValue(rowNum,13); //overall status
  var statusColor = statusMap[overallStatus] || '#ccc';
  return `point { size: 18; fill-color: ${statusColor}; }`
}

function dashboardResponseToDataTable(dashboardResult){
  var fields = _.map(dashboardResult.fields, function (field){
    return field.id;
  });

  var dataContent = _.map(dashboardResult.records, function(record){
    // return an array, the order of the elements corresponds to the order of fields
    var dataTableRecord = []
    _.forEach(fields, function(fieldName){
      if(undefined !== record[fieldName]){
        dataTableRecord.push(record[fieldName]);
      }
    })
    return dataTableRecord;
  });
  var dataArray = [];
  dataArray.push( fields);
  dataArray= dataArray.concat(dataContent);
  return google.visualization.arrayToDataTable(dataArray);
}

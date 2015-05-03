var everlive = new Everlive({
  apiKey: "GN5HrV1nzDwl8GsK",
  scheme: "https"
});

var sensorSource = new kendo.data.DataSource({
  type: 'everlive',
  transport: {
    typeName: 'sensors'
  },
  requestEnd: function(result) {
    var res = result.response;
    updateModel(res.count, res.result);
  },
  schema: {
    model: {
      id: Everlive.idField,
      fields: {
        CreatedAt:  { type: 'date' },
        light: { type: 'number' },
        location: { type: 'geopoint' },
        temperature: { type: 'number' },
        humidity: { type: 'number' },
        pressure: { type: 'number' },
      }
    }
  },
  serverSorting: true,
  sort: { field: 'CreatedAt', dir: 'asc'},
  serverPaging: 1,
  pageSize: 1000
});

var viewModel = kendo.observable({
  totalCount: null,
  latestTemp: null,
  latestLight: null,
  latestHumidity: null,
  latestPressue: null
});

function updateModel(total, data) {
  var last = data.length-1;
  viewModel.set("totalCount", kendo.toString(total, "n0"));
  viewModel.set("latestTemp", data[last].temperature);
  viewModel.set("latestLight", data[last].light);
  viewModel.set("latestHumidity", data[last].humidity);
  viewModel.set("latestPressure", Math.round(data[last].pressure/1000));
}

function createCharts() {
    // Temp sparkline
    $("#temp-log").kendoSparkline({
        theme: "material",
        dataSource: sensorSource,
        tooltip: {
            format: "{0} &deg;F"
        },
        series: [{
            type: "area",
            field: "temperature",
            color: "#ff5722"
        }]
    });

    // Light Sparkline
    $("#light-log").kendoSparkline({
        theme: "material",
        dataSource: sensorSource,
        tooltip: {
            format: "{0}"
        },
        series: [{
            type: "area",
            field: "light",
            color: "#f44336"
        }]
    });

    // Humidity Sparkline
    $("#humidity-log").kendoSparkline({
        theme: "material",
        dataSource: sensorSource,
        tooltip: {
            format: "{0}"
        },
        series: [{
            type: "area",
            field: "humidity",
            color: "#43a047"
        }]
    });

    // Pressure Sparkline
    $("#pressure-log").kendoSparkline({
        theme: "material",
        dataSource: sensorSource,
        tooltip: {
            format: "{0} bar"
        },
        series: [{
            type: "area",
            field: "pressure",
            color: "#673ab7"
        }]
    });

    // Create Scatter Chart
    $("#chart").kendoChart({
        theme: "material",
        legend: {
            visible: false
        },
        dataSource:  sensorSource,
        seriesDefaults: {
            type: "scatter"
        },
        series: [{
            name: "Light to Temperature",
            xField: "temperature",
            yField: "light",
            tooltip: {
                format: "{1} @ {0} &deg;F"
            }
        }, {
            name: "Humidity to Temperature",
            xField: "temperature",
            yField: "humidity",
            yAxis: "humidity",
            tooltip: {
                format: "{1}% @ {0} &deg;F"
            }
        }],
        xAxis: {
            title: "Temperature",
            axisCrossingValues: [0, 10000],
            labels: {
                format: "N0"
            }
        },
        yAxes: [{
            title: {
                text: "Light Level"
            }
        }, {
            name: "humidity",
            title: {
                text: "Humidity (Bar)"
            }
        }],
        tooltip: {
            visible: true
        }
    });

    setInterval(function() {
      sensorSource.read().then(function() {
        updateModel(sensorSource._pristineTotal, sensorSource.data());
      });
    }, 5000);
}

$.material.init();
$(document).ready(createCharts);

kendo.bind($('#main'), viewModel);

// TODO Add logic to read and update the source automatically every 5 seconds

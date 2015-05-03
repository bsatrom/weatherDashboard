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
  pageSize: 50
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

function createChart() {
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

    // HERE
    // Create Scatter Chart
    $("#chart").kendoChart({
        title: {
            text: "Last 50 Readings"
        },
        legend: {
            visible: false
        },
        dataSource: {
            data: sensorSource
        },
        seriesDefaults: {
            type: "scatterLine",
            scatterLine: {
                width: 2
            }
        },
        series: [{
            name: "Power",
            xField: "CreatedAt",
            yField: "temperature",
            tooltip: {
                format: "{1} @ {0}"
            }
        }/*, {
            name: "Torque",
            xField: "rpm",
            yField: "torque",
            yAxis: "torque",
            tooltip: {
                format: "{1} lb-ft @ {0:N0} rpm"
            }
        }],
        xAxis: {
            title: "Engine rpm",
            // Align torque axis to the right by specifying
            // a crossing value greater than or equal to the axis maximum.
            axisCrossingValues: [0, 10000],
            labels: {
                format: "N0"
            }
        },
        yAxes: [{
            title: {
                text: "Power (bhp)"
            }
        }, {
            name: "torque",
            title: {
                text: "Torque (lb-ft)"
            }
        }*/],
        tooltip: {
            visible: true
        }
    });

    // Create Chart
    /*$("#chart").kendoChart({
        theme: "material",
        dataSource: sensorSource,
        title: {
            text: "Weather Sensor Data Over Time"
        },
        legend: {
            position: "bottom"
        },
        seriesDefaults: {
            type: "area",
            area: {
                line: {
                    style: "smooth"
                }
            }
        },
        series: [{
            field: "light",
            title: "Light Level"
        }, {
            field: "pressure",
            title: "Pressure"
        }, {
            field: "humidity",
            title: "Humidity"
        }, {
            field: "temperature",
            title: "Temperature"
        }],
        valueAxis: {
            line: {
                visible: false
            },
            axisCrossingValue: -10
        },
        categoryAxis: {
            field: 'CreatedAt',
            majorGridLines: {
                visible: false
            }
        },
        tooltip: {
            visible: true,
            format: "{0}",
            template: "#= series.name #: #= value #"
        }
    });*/
}

$.material.init();
$(document).ready(createChart);

kendo.bind($('#main'), viewModel);

// TODO Add logic to read and update the source automatically every 5 seconds

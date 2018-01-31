var channel = require('../channel')
var Chart = require('harel')

module.exports = function Statechart (config) {
  var chart = Chart.create(config)
  var chartChan = channel(chart.states)
  chartChan.event = function (name) {
    chart = chart.event(name)
    chartChan.send(chart.states)
    console.log('chartChan', chartChan)
  }
  console.log('chartChan', chartChan)
  return chartChan
}

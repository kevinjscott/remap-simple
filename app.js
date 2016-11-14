fixy = require('fixy');
fs = require('fs');
_ = require('lodash');
XLSX = require('xlsx');

var infile = 'PAY21ALLison   ABC\nPAY21Kev       aaa\nPAY23Audrey    ALS'
// var row = 'PAY21Allison   ABC';
var rows = _.split(infile, '\n');
var maps = [];
var inmaps = [];
var outmaps = [];
var transforms = [];
var internaldata = [];

var workbook = XLSX.readFile('data.xlsx');
var xl = XLSX.utils.sheet_to_json(workbook.Sheets["Sheet1"])

var transformfunctions = {
    lookup: function (input, data) {
        return data[input] || input;
    },

    toUpper: function (input, data) {
        return _.toUpper(input);
    },

    toLower: function (input, data) {
        return _.toLower(input);
    },

    capitalize: function (input, data) {
        return _.capitalize(input);
    },

    constant: function (input, data) {
        return data;
    },

    excelLookup: function (input, data) {
        var matchingrecord = _.find(xl, [data.lookupfield, input]);

        return matchingrecord ? matchingrecord[data.resultfield] : '';
    },

    excelLookupProduct: function (input, data, result) {
      var matchingrecord = _.find(xl, [data.lookupfield, result[data.varname]]);
      var multiplier = matchingrecord ? matchingrecord[data.resultfield] : 0;
      var product = multiplier * input;

      return _.ceil(product, data.decimalplaces);
    }
};



fs.readFile('maps.json', 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }
    maps = eval(data);
 
    for (var i = 0; i < maps.length; i++) {
      var map = maps[i];

      inmaps.push(
        {
          name: map.name,
          width: map.inwidth,
          start: map.instart,
          type: map.type,
          sourcerow: map.sourcerow
        }
      );

      outmaps.push(
        {
          name: map.name,
          width: map.outwidth,
          padding_position: map.padding_position,
          padding_symbol: map.padding_symbol
        }
      );

      if (map.transform) {
        transforms.push(
          {
            name: map.name,
            type: map.transform.type,
            data: map.transform.data
          }
        );
      }
    }

    internalize();
    externalize();
});

function internalize() {
  var row = [];

  for (var j = 0; j < rows.length; j++) {
    row = rows[j];
    var result = fixy.parse({
      map: inmaps,
      options:{
        fullwidth: row.length,
        skiplines: null,
        format: "json"
      }
    }, row);

    for (var i = 0; i < transforms.length; i++) {
      var t = transforms[i];
      var parsedrow = result[0];

      result[0][t.name] = transformfunctions[t.type](parsedrow[t.name], t.data, result[0]);
    }

    internaldata.push(result[0]);
  }
  console.log(JSON.stringify(internaldata, null, 2));
}

function externalize() {
  console.log(outmaps);
  var output = fixy.unparse(outmaps, internaldata);
  output = output.replace(/(\n)/g, '\r\n') + '\r\n';
  console.log(output);

  fs.writeFile('output.txt', output, function (err) {
    if (err) return console.log(err);
    console.log('\nResults saved to output.txt');
  });

}
fixy = require('fixy');
fs = require('fs');
_ = require('lodash');

var row = 'PAY21Allison   ABC';
var maps = [];
var inmaps = [];
var outmaps = [];
var transforms = [];

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

    doit();
});

function doit() {
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

    parsedrow[t.name] = transformfunctions[t.type](parsedrow[t.name], t.data);
  }

  console.log(JSON.stringify(result, null, 2));
}

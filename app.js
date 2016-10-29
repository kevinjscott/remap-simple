fixy = require('fixy');
fs = require('fs');

var row = 'PAY21Allison   ABC';
var maps = [];
var inmaps = [];
var outmaps = [];
var transforms = [];

fs.readFile('maps.json', 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }
    maps = eval(data);
 
    for (var i = 0; i < maps.length; i++) {
      inmaps.push(
        {
          name: maps[i].name,
          width: maps[i].inwidth,
          start: maps[i].instart,
          type: maps[i].type,
          sourcerow: maps[i].sourcerow
        }
      );

      outmaps.push(
        {
          name: maps[i].name,
          width: maps[i].outwidth,
          padding_position: maps[i].padding_position,
          padding_symbol: maps[i].padding_symbol
        }
      );

      if (maps[i].transform) {
        if (maps[i].transform.lookup) {
          transforms.push(
            {
              lookup: maps[i].transform.lookup,
              name: maps[i].name
            }
          );
        }
      }
    }
// console.log(JSON.stringify(transforms, null, 2));
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
    var name = transforms[i].name;
    var t = transforms[i].lookup;
    if (t) {
      result[0][name] = t[result[0][name]] || 'ERR';
    }
  }

  console.log(JSON.stringify(result, null, 2));
}

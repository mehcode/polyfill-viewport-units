(function(Polyfill, $, window) {
  var $window = $(window);
  var vuPattern = /(vmin|vmax|vw|vh|vm)/;
  var pattern = /[\d]+(.\d*?)?(vmin|vmax|vw|vh|vm)/g;

  // Convert viewport-units to their pixel equivalents
  var convertValue = function(vu) {
    var percent = vu.match(/[\d.]+/)[0] / 100;
    var unit = vu.match(vuPattern)[0];

    var width = $window.width();
    var height = $window.height();
    var min = window.Math.min(width, height);
    var max = window.Math.max(width, height);

    switch (unit) {
      case "vh":
        // vh -- 1/100th of the height of the viewport.
        return percent * height + "px";

      case "vw":
        // vw -- 1/100th of the width of the viewport.
        return percent * width + "px";

      case "vm":
      case "vmin":
        // vmin -- 1/100th of the minimum value between the height
        //         and the width of the viewport.
        return percent * min + "px";

      case "vmax":
        // vmax -- 1/100th of the maximum value between the height and
        //         the width of the viewport.
        return percent * max + "px";

      default:
        // Unreachable
    }
  };

  // Gather any propeties containing viewport units
  // and return their converted values
  var convertDecl = function(decl) {
    for (var name in decl) {
      var value = decl[name];

      if (pattern.test(value)) {
        value = value.replace(pattern, function(match) {
          return convertValue(match);
        });

        decl[name] = value;
      } else {
        delete decl[name];
      }
    }

    return decl;
  };

  $(function() {

    // Hide <body/> for now
    $("body").css({"visibility": "hidden", "display": "none"});

    var options = {
      keywords: {
        declarations: [
          "*:*vh",
          "*:*vw",
          "*:*vmax",
          "*:*vmin",
          "*:*vm",  // NOTE: 'vm' is 'vmin' in IE9
        ]
      }
    };

    var rules = [];
    var update = function() {
      var lines = [];

      // Iterate through each matched rule
      rules.each(function (rule) {

        // Gather the properties and get an object of the declaration
        var decl = rule.getDeclaration();

        // Convert any matched viewport-units in the declaration to their
        // equiv. pixel values
        decl = convertDecl(decl);

        // Push the converted declaration
        lines.push(rule.getSelectors());
        lines.push("{");

        for (var name in decl) {
          lines.push(name + ": " + decl[name] + ";");
        }

        lines.push("}");
      });

      // Build a <style/> element and attach it to <head>/
      var text = lines.join("\n");

      // Append the new style element
      $("head").append("<style type='text/css'>" + text + "</style>");

      // Show <body/> again
      $("body").css({"visibility": "visible", "display": "block"});
    };

    Polyfill(options)
      .doMatched(function(rules_) {
        rules = rules_;

        // Add a 'resize' listener to update styles
        $(window).off('.polyfill-viewport-units');
        $(window).on('resize.polyfill-viewport-units', update);

        // Update immediately
        update();
      });

  });

}(Polyfill, jQuery, window));

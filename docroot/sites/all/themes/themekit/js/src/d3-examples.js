/**
 * @file
 * A JavaScript file for the theme.
 */

// JavaScript should be made compatible with libraries other than jQuery by
// wrapping it with an "anonymous closure". See:
// - http://drupal.org/node/1446420
// - http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth
!function ($) {
  // Always use strict mode to enable better error handling in modern browsers.
  "use strict";

  $(document).ready(function() {





    /**********************************************************************************
     * Example3
     *********************************************************************************/

    (function () {

      var data;

      function renderJSON() {
        d3.json("articles/with-popularity", function(error, dataJSON) {
          console.log(dataJSON);
          data = dataJSON;
          render(data, compareByMostPopular);
        });
      }


      function render(data, comparator, category) {
        d3.select("#example3 .chart").selectAll("div.h-bar")
          .data(data)
          .enter().append("div")
          .attr("class", "h-bar")
          .append("span");

        d3.select("#example3 .chart").selectAll("div.h-bar")
          .data(data)
          .exit().remove();

        d3.select("#example3 .chart").selectAll("div.h-bar")
          .data(data)
          .attr("class", "h-bar")
          .style("width", function (d) {
            return (d.popularity * 2) + "px";
          })
          .select("span")
          .text(function (d) {
            return d.title;
          });

        if (comparator) {
          console.log(comparator);
          d3.select("#example3 .chart")
            .selectAll("div.h-bar")
            .sort(comparator);
        }

        if (category) {
          d3.select("#example3 .chart").selectAll("div.h-bar")
            .filter(function (d, i) {
              return d.category == category;
            })
            .classed("selected", true);
        }

      }

      var compareByMostPopular = function (a, b) {
        return a.popularity > b.popularity ? -1 : 1;
      };

      renderJSON();
      setInterval(function() {
        console.log("WAPOW");
        renderJSON();
      }, 10000);



    })();







  });

}(jQuery);

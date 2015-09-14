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
      var data = [
        {expense: 10, category: "Retail"},
        {expense: 15, category: "Gas"},
        {expense: 30, category: "Retail"},
        {expense: 50, category: "Dining"},
        {expense: 80, category: "Gas"},
        {expense: 65, category: "Retail"},
        {expense: 55, category: "Gas"},
        {expense: 30, category: "Dining"},
        {expense: 20, category: "Retail"},
        {expense: 10, category: "Dining"},
        {expense: 8, category: "Gas"}
      ];

      function render(data, comparator) {
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
            return (d.expense * 5) + "px";
          })
          .select("span")
          .text(function (d) {
            return d.category;
          });

        if (comparator)
          d3.select("#example3 .chart")
            .selectAll("div.h-bar")
            .sort(comparator);
      }

      var compareByExpense = function (a, b) {
        return a.expense < b.expense ? -1 : 1;
      };
      var compareByCategory = function (a, b) {
        return a.category < b.category ? -1 : 1;
      };

      render(data);

      function sort(comparator) {
        switch (comparator) {
          case 'compareByExpense':
            render(data, compareByExpense);
            break;
          case 'compareByCategory':
            render(data, compareByCategory);
            break;
          default:
            render(data);
            break;
        }
      }

      $('#example3 .sorters button').on("click", function (e) {
        sort($(this).attr('data-comparator'));
      });

    })();







  });

}(jQuery);

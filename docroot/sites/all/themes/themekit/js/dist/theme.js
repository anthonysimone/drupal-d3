/*
 * Foundation Responsive Library
 * http://foundation.zurb.com
 * Copyright 2014, ZURB
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
*/

(function ($, window, document, undefined) {
  'use strict';

  var header_helpers = function (class_array) {
    var i = class_array.length;
    var head = $('head');

    while (i--) {
      if (head.has('.' + class_array[i]).length === 0) {
        head.append('<meta class="' + class_array[i] + '" />');
      }
    }
  };

  header_helpers([
    'foundation-mq-small',
    'foundation-mq-small-only',
    'foundation-mq-medium',
    'foundation-mq-medium-only',
    'foundation-mq-large',
    'foundation-mq-large-only',
    'foundation-mq-xlarge',
    'foundation-mq-xlarge-only',
    'foundation-mq-xxlarge',
    'foundation-data-attribute-namespace']);

  // Enable FastClick if present

  $(function () {
    if (typeof FastClick !== 'undefined') {
      // Don't attach to body if undefined
      if (typeof document.body !== 'undefined') {
        FastClick.attach(document.body);
      }
    }
  });

  // private Fast Selector wrapper,
  // returns jQuery object. Only use where
  // getElementById is not available.
  var S = function (selector, context) {
    if (typeof selector === 'string') {
      if (context) {
        var cont;
        if (context.jquery) {
          cont = context[0];
          if (!cont) {
            return context;
          }
        } else {
          cont = context;
        }
        return $(cont.querySelectorAll(selector));
      }

      return $(document.querySelectorAll(selector));
    }

    return $(selector, context);
  };

  // Namespace functions.

  var attr_name = function (init) {
    var arr = [];
    if (!init) {
      arr.push('data');
    }
    if (this.namespace.length > 0) {
      arr.push(this.namespace);
    }
    arr.push(this.name);

    return arr.join('-');
  };

  var add_namespace = function (str) {
    var parts = str.split('-'),
        i = parts.length,
        arr = [];

    while (i--) {
      if (i !== 0) {
        arr.push(parts[i]);
      } else {
        if (this.namespace.length > 0) {
          arr.push(this.namespace, parts[i]);
        } else {
          arr.push(parts[i]);
        }
      }
    }

    return arr.reverse().join('-');
  };

  // Event binding and data-options updating.

  var bindings = function (method, options) {
    var self = this,
        bind = function(){
          var $this = S(this),
              should_bind_events = !$this.data(self.attr_name(true) + '-init');
          $this.data(self.attr_name(true) + '-init', $.extend({}, self.settings, (options || method), self.data_options($this)));

          if (should_bind_events) {
            self.events(this);
          }
        };

    if (S(this.scope).is('[' + this.attr_name() +']')) {
      bind.call(this.scope);
    } else {
      S('[' + this.attr_name() +']', this.scope).each(bind);
    }
    // # Patch to fix #5043 to move this *after* the if/else clause in order for Backbone and similar frameworks to have improved control over event binding and data-options updating.
    if (typeof method === 'string') {
      return this[method].call(this, options);
    }

  };

  var single_image_loaded = function (image, callback) {
    function loaded () {
      callback(image[0]);
    }

    function bindLoad () {
      this.one('load', loaded);

      if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
        var src = this.attr( 'src' ),
            param = src.match( /\?/ ) ? '&' : '?';

        param += 'random=' + (new Date()).getTime();
        this.attr('src', src + param);
      }
    }

    if (!image.attr('src')) {
      loaded();
      return;
    }

    if (image[0].complete || image[0].readyState === 4) {
      loaded();
    } else {
      bindLoad.call(image);
    }
  };

  /*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license */

  window.matchMedia || (window.matchMedia = function() {
      "use strict";

      // For browsers that support matchMedium api such as IE 9 and webkit
      var styleMedia = (window.styleMedia || window.media);

      // For those that don't support matchMedium
      if (!styleMedia) {
          var style       = document.createElement('style'),
              script      = document.getElementsByTagName('script')[0],
              info        = null;

          style.type  = 'text/css';
          style.id    = 'matchmediajs-test';

          script.parentNode.insertBefore(style, script);

          // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
          info = ('getComputedStyle' in window) && window.getComputedStyle(style, null) || style.currentStyle;

          styleMedia = {
              matchMedium: function(media) {
                  var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

                  // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
                  if (style.styleSheet) {
                      style.styleSheet.cssText = text;
                  } else {
                      style.textContent = text;
                  }

                  // Test if media query is true or false
                  return info.width === '1px';
              }
          };
      }

      return function(media) {
          return {
              matches: styleMedia.matchMedium(media || 'all'),
              media: media || 'all'
          };
      };
  }());

  /*
   * jquery.requestAnimationFrame
   * https://github.com/gnarf37/jquery-requestAnimationFrame
   * Requires jQuery 1.8+
   *
   * Copyright (c) 2012 Corey Frang
   * Licensed under the MIT license.
   */

  (function(jQuery) {


  // requestAnimationFrame polyfill adapted from Erik Möller
  // fixes from Paul Irish and Tino Zijdel
  // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

  var animating,
      lastTime = 0,
      vendors = ['webkit', 'moz'],
      requestAnimationFrame = window.requestAnimationFrame,
      cancelAnimationFrame = window.cancelAnimationFrame,
      jqueryFxAvailable = 'undefined' !== typeof jQuery.fx;

  for (; lastTime < vendors.length && !requestAnimationFrame; lastTime++) {
    requestAnimationFrame = window[ vendors[lastTime] + 'RequestAnimationFrame' ];
    cancelAnimationFrame = cancelAnimationFrame ||
      window[ vendors[lastTime] + 'CancelAnimationFrame' ] ||
      window[ vendors[lastTime] + 'CancelRequestAnimationFrame' ];
  }

  function raf() {
    if (animating) {
      requestAnimationFrame(raf);

      if (jqueryFxAvailable) {
        jQuery.fx.tick();
      }
    }
  }

  if (requestAnimationFrame) {
    // use rAF
    window.requestAnimationFrame = requestAnimationFrame;
    window.cancelAnimationFrame = cancelAnimationFrame;

    if (jqueryFxAvailable) {
      jQuery.fx.timer = function (timer) {
        if (timer() && jQuery.timers.push(timer) && !animating) {
          animating = true;
          raf();
        }
      };

      jQuery.fx.stop = function () {
        animating = false;
      };
    }
  } else {
    // polyfill
    window.requestAnimationFrame = function (callback) {
      var currTime = new Date().getTime(),
        timeToCall = Math.max(0, 16 - (currTime - lastTime)),
        id = window.setTimeout(function () {
          callback(currTime + timeToCall);
        }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };

    window.cancelAnimationFrame = function (id) {
      clearTimeout(id);
    };

  }

  }( $ ));

  function removeQuotes (string) {
    if (typeof string === 'string' || string instanceof String) {
      string = string.replace(/^['\\/"]+|(;\s?})+|['\\/"]+$/g, '');
    }

    return string;
  }

  window.Foundation = {
    name : 'Foundation',

    version : '5.5.2',

    media_queries : {
      'small'       : S('.foundation-mq-small').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
      'small-only'  : S('.foundation-mq-small-only').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
      'medium'      : S('.foundation-mq-medium').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
      'medium-only' : S('.foundation-mq-medium-only').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
      'large'       : S('.foundation-mq-large').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
      'large-only'  : S('.foundation-mq-large-only').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
      'xlarge'      : S('.foundation-mq-xlarge').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
      'xlarge-only' : S('.foundation-mq-xlarge-only').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
      'xxlarge'     : S('.foundation-mq-xxlarge').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, '')
    },

    stylesheet : $('<style></style>').appendTo('head')[0].sheet,

    global : {
      namespace : undefined
    },

    init : function (scope, libraries, method, options, response) {
      var args = [scope, method, options, response],
          responses = [];

      // check RTL
      this.rtl = /rtl/i.test(S('html').attr('dir'));

      // set foundation global scope
      this.scope = scope || this.scope;

      this.set_namespace();

      if (libraries && typeof libraries === 'string' && !/reflow/i.test(libraries)) {
        if (this.libs.hasOwnProperty(libraries)) {
          responses.push(this.init_lib(libraries, args));
        }
      } else {
        for (var lib in this.libs) {
          responses.push(this.init_lib(lib, libraries));
        }
      }

      S(window).load(function () {
        S(window)
          .trigger('resize.fndtn.clearing')
          .trigger('resize.fndtn.dropdown')
          .trigger('resize.fndtn.equalizer')
          .trigger('resize.fndtn.interchange')
          .trigger('resize.fndtn.joyride')
          .trigger('resize.fndtn.magellan')
          .trigger('resize.fndtn.topbar')
          .trigger('resize.fndtn.slider');
      });

      return scope;
    },

    init_lib : function (lib, args) {
      if (this.libs.hasOwnProperty(lib)) {
        this.patch(this.libs[lib]);

        if (args && args.hasOwnProperty(lib)) {
            if (typeof this.libs[lib].settings !== 'undefined') {
              $.extend(true, this.libs[lib].settings, args[lib]);
            } else if (typeof this.libs[lib].defaults !== 'undefined') {
              $.extend(true, this.libs[lib].defaults, args[lib]);
            }
          return this.libs[lib].init.apply(this.libs[lib], [this.scope, args[lib]]);
        }

        args = args instanceof Array ? args : new Array(args);
        return this.libs[lib].init.apply(this.libs[lib], args);
      }

      return function () {};
    },

    patch : function (lib) {
      lib.scope = this.scope;
      lib.namespace = this.global.namespace;
      lib.rtl = this.rtl;
      lib['data_options'] = this.utils.data_options;
      lib['attr_name'] = attr_name;
      lib['add_namespace'] = add_namespace;
      lib['bindings'] = bindings;
      lib['S'] = this.utils.S;
    },

    inherit : function (scope, methods) {
      var methods_arr = methods.split(' '),
          i = methods_arr.length;

      while (i--) {
        if (this.utils.hasOwnProperty(methods_arr[i])) {
          scope[methods_arr[i]] = this.utils[methods_arr[i]];
        }
      }
    },

    set_namespace : function () {

      // Description:
      //    Don't bother reading the namespace out of the meta tag
      //    if the namespace has been set globally in javascript
      //
      // Example:
      //    Foundation.global.namespace = 'my-namespace';
      // or make it an empty string:
      //    Foundation.global.namespace = '';
      //
      //

      // If the namespace has not been set (is undefined), try to read it out of the meta element.
      // Otherwise use the globally defined namespace, even if it's empty ('')
      var namespace = ( this.global.namespace === undefined ) ? $('.foundation-data-attribute-namespace').css('font-family') : this.global.namespace;

      // Finally, if the namsepace is either undefined or false, set it to an empty string.
      // Otherwise use the namespace value.
      this.global.namespace = ( namespace === undefined || /false/i.test(namespace) ) ? '' : namespace;
    },

    libs : {},

    // methods that can be inherited in libraries
    utils : {

      // Description:
      //    Fast Selector wrapper returns jQuery object. Only use where getElementById
      //    is not available.
      //
      // Arguments:
      //    Selector (String): CSS selector describing the element(s) to be
      //    returned as a jQuery object.
      //
      //    Scope (String): CSS selector describing the area to be searched. Default
      //    is document.
      //
      // Returns:
      //    Element (jQuery Object): jQuery object containing elements matching the
      //    selector within the scope.
      S : S,

      // Description:
      //    Executes a function a max of once every n milliseconds
      //
      // Arguments:
      //    Func (Function): Function to be throttled.
      //
      //    Delay (Integer): Function execution threshold in milliseconds.
      //
      // Returns:
      //    Lazy_function (Function): Function with throttling applied.
      throttle : function (func, delay) {
        var timer = null;

        return function () {
          var context = this, args = arguments;

          if (timer == null) {
            timer = setTimeout(function () {
              func.apply(context, args);
              timer = null;
            }, delay);
          }
        };
      },

      // Description:
      //    Executes a function when it stops being invoked for n seconds
      //    Modified version of _.debounce() http://underscorejs.org
      //
      // Arguments:
      //    Func (Function): Function to be debounced.
      //
      //    Delay (Integer): Function execution threshold in milliseconds.
      //
      //    Immediate (Bool): Whether the function should be called at the beginning
      //    of the delay instead of the end. Default is false.
      //
      // Returns:
      //    Lazy_function (Function): Function with debouncing applied.
      debounce : function (func, delay, immediate) {
        var timeout, result;
        return function () {
          var context = this, args = arguments;
          var later = function () {
            timeout = null;
            if (!immediate) {
              result = func.apply(context, args);
            }
          };
          var callNow = immediate && !timeout;
          clearTimeout(timeout);
          timeout = setTimeout(later, delay);
          if (callNow) {
            result = func.apply(context, args);
          }
          return result;
        };
      },

      // Description:
      //    Parses data-options attribute
      //
      // Arguments:
      //    El (jQuery Object): Element to be parsed.
      //
      // Returns:
      //    Options (Javascript Object): Contents of the element's data-options
      //    attribute.
      data_options : function (el, data_attr_name) {
        data_attr_name = data_attr_name || 'options';
        var opts = {}, ii, p, opts_arr,
            data_options = function (el) {
              var namespace = Foundation.global.namespace;

              if (namespace.length > 0) {
                return el.data(namespace + '-' + data_attr_name);
              }

              return el.data(data_attr_name);
            };

        var cached_options = data_options(el);

        if (typeof cached_options === 'object') {
          return cached_options;
        }

        opts_arr = (cached_options || ':').split(';');
        ii = opts_arr.length;

        function isNumber (o) {
          return !isNaN (o - 0) && o !== null && o !== '' && o !== false && o !== true;
        }

        function trim (str) {
          if (typeof str === 'string') {
            return $.trim(str);
          }
          return str;
        }

        while (ii--) {
          p = opts_arr[ii].split(':');
          p = [p[0], p.slice(1).join(':')];

          if (/true/i.test(p[1])) {
            p[1] = true;
          }
          if (/false/i.test(p[1])) {
            p[1] = false;
          }
          if (isNumber(p[1])) {
            if (p[1].indexOf('.') === -1) {
              p[1] = parseInt(p[1], 10);
            } else {
              p[1] = parseFloat(p[1]);
            }
          }

          if (p.length === 2 && p[0].length > 0) {
            opts[trim(p[0])] = trim(p[1]);
          }
        }

        return opts;
      },

      // Description:
      //    Adds JS-recognizable media queries
      //
      // Arguments:
      //    Media (String): Key string for the media query to be stored as in
      //    Foundation.media_queries
      //
      //    Class (String): Class name for the generated <meta> tag
      register_media : function (media, media_class) {
        if (Foundation.media_queries[media] === undefined) {
          $('head').append('<meta class="' + media_class + '"/>');
          Foundation.media_queries[media] = removeQuotes($('.' + media_class).css('font-family'));
        }
      },

      // Description:
      //    Add custom CSS within a JS-defined media query
      //
      // Arguments:
      //    Rule (String): CSS rule to be appended to the document.
      //
      //    Media (String): Optional media query string for the CSS rule to be
      //    nested under.
      add_custom_rule : function (rule, media) {
        if (media === undefined && Foundation.stylesheet) {
          Foundation.stylesheet.insertRule(rule, Foundation.stylesheet.cssRules.length);
        } else {
          var query = Foundation.media_queries[media];

          if (query !== undefined) {
            Foundation.stylesheet.insertRule('@media ' +
              Foundation.media_queries[media] + '{ ' + rule + ' }', Foundation.stylesheet.cssRules.length);
          }
        }
      },

      // Description:
      //    Performs a callback function when an image is fully loaded
      //
      // Arguments:
      //    Image (jQuery Object): Image(s) to check if loaded.
      //
      //    Callback (Function): Function to execute when image is fully loaded.
      image_loaded : function (images, callback) {
        var self = this,
            unloaded = images.length;

        function pictures_has_height(images) {
          var pictures_number = images.length;

          for (var i = pictures_number - 1; i >= 0; i--) {
            if(images.attr('height') === undefined) {
              return false;
            };
          };

          return true;
        }

        if (unloaded === 0 || pictures_has_height(images)) {
          callback(images);
        }

        images.each(function () {
          single_image_loaded(self.S(this), function () {
            unloaded -= 1;
            if (unloaded === 0) {
              callback(images);
            }
          });
        });
      },

      // Description:
      //    Returns a random, alphanumeric string
      //
      // Arguments:
      //    Length (Integer): Length of string to be generated. Defaults to random
      //    integer.
      //
      // Returns:
      //    Rand (String): Pseudo-random, alphanumeric string.
      random_str : function () {
        if (!this.fidx) {
          this.fidx = 0;
        }
        this.prefix = this.prefix || [(this.name || 'F'), (+new Date).toString(36)].join('-');

        return this.prefix + (this.fidx++).toString(36);
      },

      // Description:
      //    Helper for window.matchMedia
      //
      // Arguments:
      //    mq (String): Media query
      //
      // Returns:
      //    (Boolean): Whether the media query passes or not
      match : function (mq) {
        return window.matchMedia(mq).matches;
      },

      // Description:
      //    Helpers for checking Foundation default media queries with JS
      //
      // Returns:
      //    (Boolean): Whether the media query passes or not

      is_small_up : function () {
        return this.match(Foundation.media_queries.small);
      },

      is_medium_up : function () {
        return this.match(Foundation.media_queries.medium);
      },

      is_large_up : function () {
        return this.match(Foundation.media_queries.large);
      },

      is_xlarge_up : function () {
        return this.match(Foundation.media_queries.xlarge);
      },

      is_xxlarge_up : function () {
        return this.match(Foundation.media_queries.xxlarge);
      },

      is_small_only : function () {
        return !this.is_medium_up() && !this.is_large_up() && !this.is_xlarge_up() && !this.is_xxlarge_up();
      },

      is_medium_only : function () {
        return this.is_medium_up() && !this.is_large_up() && !this.is_xlarge_up() && !this.is_xxlarge_up();
      },

      is_large_only : function () {
        return this.is_medium_up() && this.is_large_up() && !this.is_xlarge_up() && !this.is_xxlarge_up();
      },

      is_xlarge_only : function () {
        return this.is_medium_up() && this.is_large_up() && this.is_xlarge_up() && !this.is_xxlarge_up();
      },

      is_xxlarge_only : function () {
        return this.is_medium_up() && this.is_large_up() && this.is_xlarge_up() && this.is_xxlarge_up();
      }
    }
  };

  $.fn.foundation = function () {
    var args = Array.prototype.slice.call(arguments, 0);

    return this.each(function () {
      Foundation.init.apply(Foundation, [this].concat(args));
      return this;
    });
  };

}(jQuery, window, window.document));

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.topbar = {
    name : 'topbar',

    version : '5.5.2',

    settings : {
      index : 0,
      start_offset : 0,
      sticky_class : 'sticky',
      custom_back_text : true,
      back_text : 'Back',
      mobile_show_parent_link : true,
      is_hover : true,
      scrolltop : true, // jump to top when sticky nav menu toggle is clicked
      sticky_on : 'all',
      dropdown_autoclose: true
    },

    init : function (section, method, options) {
      Foundation.inherit(this, 'add_custom_rule register_media throttle');
      var self = this;

      self.register_media('topbar', 'foundation-mq-topbar');

      this.bindings(method, options);

      self.S('[' + this.attr_name() + ']', this.scope).each(function () {
        var topbar = $(this),
            settings = topbar.data(self.attr_name(true) + '-init'),
            section = self.S('section, .top-bar-section', this);
        topbar.data('index', 0);
        var topbarContainer = topbar.parent();
        if (topbarContainer.hasClass('fixed') || self.is_sticky(topbar, topbarContainer, settings) ) {
          self.settings.sticky_class = settings.sticky_class;
          self.settings.sticky_topbar = topbar;
          topbar.data('height', topbarContainer.outerHeight());
          topbar.data('stickyoffset', topbarContainer.offset().top);
        } else {
          topbar.data('height', topbar.outerHeight());
        }

        if (!settings.assembled) {
          self.assemble(topbar);
        }

        if (settings.is_hover) {
          self.S('.has-dropdown', topbar).addClass('not-click');
        } else {
          self.S('.has-dropdown', topbar).removeClass('not-click');
        }

        // Pad body when sticky (scrolled) or fixed.
        self.add_custom_rule('.f-topbar-fixed { padding-top: ' + topbar.data('height') + 'px }');

        if (topbarContainer.hasClass('fixed')) {
          self.S('body').addClass('f-topbar-fixed');
        }
      });

    },

    is_sticky : function (topbar, topbarContainer, settings) {
      var sticky     = topbarContainer.hasClass(settings.sticky_class);
      var smallMatch = matchMedia(Foundation.media_queries.small).matches;
      var medMatch   = matchMedia(Foundation.media_queries.medium).matches;
      var lrgMatch   = matchMedia(Foundation.media_queries.large).matches;

      if (sticky && settings.sticky_on === 'all') {
        return true;
      }
      if (sticky && this.small() && settings.sticky_on.indexOf('small') !== -1) {
        if (smallMatch && !medMatch && !lrgMatch) { return true; }
      }
      if (sticky && this.medium() && settings.sticky_on.indexOf('medium') !== -1) {
        if (smallMatch && medMatch && !lrgMatch) { return true; }
      }
      if (sticky && this.large() && settings.sticky_on.indexOf('large') !== -1) {
        if (smallMatch && medMatch && lrgMatch) { return true; }
      }

       return false;
    },

    toggle : function (toggleEl) {
      var self = this,
          topbar;

      if (toggleEl) {
        topbar = self.S(toggleEl).closest('[' + this.attr_name() + ']');
      } else {
        topbar = self.S('[' + this.attr_name() + ']');
      }

      var settings = topbar.data(this.attr_name(true) + '-init');

      var section = self.S('section, .top-bar-section', topbar);

      if (self.breakpoint()) {
        if (!self.rtl) {
          section.css({left : '0%'});
          $('>.name', section).css({left : '100%'});
        } else {
          section.css({right : '0%'});
          $('>.name', section).css({right : '100%'});
        }

        self.S('li.moved', section).removeClass('moved');
        topbar.data('index', 0);

        topbar
          .toggleClass('expanded')
          .css('height', '');
      }

      if (settings.scrolltop) {
        if (!topbar.hasClass('expanded')) {
          if (topbar.hasClass('fixed')) {
            topbar.parent().addClass('fixed');
            topbar.removeClass('fixed');
            self.S('body').addClass('f-topbar-fixed');
          }
        } else if (topbar.parent().hasClass('fixed')) {
          if (settings.scrolltop) {
            topbar.parent().removeClass('fixed');
            topbar.addClass('fixed');
            self.S('body').removeClass('f-topbar-fixed');

            window.scrollTo(0, 0);
          } else {
            topbar.parent().removeClass('expanded');
          }
        }
      } else {
        if (self.is_sticky(topbar, topbar.parent(), settings)) {
          topbar.parent().addClass('fixed');
        }

        if (topbar.parent().hasClass('fixed')) {
          if (!topbar.hasClass('expanded')) {
            topbar.removeClass('fixed');
            topbar.parent().removeClass('expanded');
            self.update_sticky_positioning();
          } else {
            topbar.addClass('fixed');
            topbar.parent().addClass('expanded');
            self.S('body').addClass('f-topbar-fixed');
          }
        }
      }
    },

    timer : null,

    events : function (bar) {
      var self = this,
          S = this.S;

      S(this.scope)
        .off('.topbar')
        .on('click.fndtn.topbar', '[' + this.attr_name() + '] .toggle-topbar', function (e) {
          e.preventDefault();
          self.toggle(this);
        })
        .on('click.fndtn.topbar contextmenu.fndtn.topbar', '.top-bar .top-bar-section li a[href^="#"],[' + this.attr_name() + '] .top-bar-section li a[href^="#"]', function (e) {
            var li = $(this).closest('li'),
                topbar = li.closest('[' + self.attr_name() + ']'),
                settings = topbar.data(self.attr_name(true) + '-init');

            if (settings.dropdown_autoclose && settings.is_hover) {
              var hoverLi = $(this).closest('.hover');
              hoverLi.removeClass('hover');
            }
            if (self.breakpoint() && !li.hasClass('back') && !li.hasClass('has-dropdown')) {
              self.toggle();
            }

        })
        .on('click.fndtn.topbar', '[' + this.attr_name() + '] li.has-dropdown', function (e) {
          var li = S(this),
              target = S(e.target),
              topbar = li.closest('[' + self.attr_name() + ']'),
              settings = topbar.data(self.attr_name(true) + '-init');

          if (target.data('revealId')) {
            self.toggle();
            return;
          }

          if (self.breakpoint()) {
            return;
          }

          if (settings.is_hover && !Modernizr.touch) {
            return;
          }

          e.stopImmediatePropagation();

          if (li.hasClass('hover')) {
            li
              .removeClass('hover')
              .find('li')
              .removeClass('hover');

            li.parents('li.hover')
              .removeClass('hover');
          } else {
            li.addClass('hover');

            $(li).siblings().removeClass('hover');

            if (target[0].nodeName === 'A' && target.parent().hasClass('has-dropdown')) {
              e.preventDefault();
            }
          }
        })
        .on('click.fndtn.topbar', '[' + this.attr_name() + '] .has-dropdown>a', function (e) {
          if (self.breakpoint()) {

            e.preventDefault();

            var $this = S(this),
                topbar = $this.closest('[' + self.attr_name() + ']'),
                section = topbar.find('section, .top-bar-section'),
                dropdownHeight = $this.next('.dropdown').outerHeight(),
                $selectedLi = $this.closest('li');

            topbar.data('index', topbar.data('index') + 1);
            $selectedLi.addClass('moved');

            if (!self.rtl) {
              section.css({left : -(100 * topbar.data('index')) + '%'});
              section.find('>.name').css({left : 100 * topbar.data('index') + '%'});
            } else {
              section.css({right : -(100 * topbar.data('index')) + '%'});
              section.find('>.name').css({right : 100 * topbar.data('index') + '%'});
            }

            topbar.css('height', $this.siblings('ul').outerHeight(true) + topbar.data('height'));
          }
        });

      S(window).off('.topbar').on('resize.fndtn.topbar', self.throttle(function () {
          self.resize.call(self);
      }, 50)).trigger('resize.fndtn.topbar').load(function () {
          // Ensure that the offset is calculated after all of the pages resources have loaded
          S(this).trigger('resize.fndtn.topbar');
      });

      S('body').off('.topbar').on('click.fndtn.topbar', function (e) {
        var parent = S(e.target).closest('li').closest('li.hover');

        if (parent.length > 0) {
          return;
        }

        S('[' + self.attr_name() + '] li.hover').removeClass('hover');
      });

      // Go up a level on Click
      S(this.scope).on('click.fndtn.topbar', '[' + this.attr_name() + '] .has-dropdown .back', function (e) {
        e.preventDefault();

        var $this = S(this),
            topbar = $this.closest('[' + self.attr_name() + ']'),
            section = topbar.find('section, .top-bar-section'),
            settings = topbar.data(self.attr_name(true) + '-init'),
            $movedLi = $this.closest('li.moved'),
            $previousLevelUl = $movedLi.parent();

        topbar.data('index', topbar.data('index') - 1);

        if (!self.rtl) {
          section.css({left : -(100 * topbar.data('index')) + '%'});
          section.find('>.name').css({left : 100 * topbar.data('index') + '%'});
        } else {
          section.css({right : -(100 * topbar.data('index')) + '%'});
          section.find('>.name').css({right : 100 * topbar.data('index') + '%'});
        }

        if (topbar.data('index') === 0) {
          topbar.css('height', '');
        } else {
          topbar.css('height', $previousLevelUl.outerHeight(true) + topbar.data('height'));
        }

        setTimeout(function () {
          $movedLi.removeClass('moved');
        }, 300);
      });

      // Show dropdown menus when their items are focused
      S(this.scope).find('.dropdown a')
        .focus(function () {
          $(this).parents('.has-dropdown').addClass('hover');
        })
        .blur(function () {
          $(this).parents('.has-dropdown').removeClass('hover');
        });
    },

    resize : function () {
      var self = this;
      self.S('[' + this.attr_name() + ']').each(function () {
        var topbar = self.S(this),
            settings = topbar.data(self.attr_name(true) + '-init');

        var stickyContainer = topbar.parent('.' + self.settings.sticky_class);
        var stickyOffset;

        if (!self.breakpoint()) {
          var doToggle = topbar.hasClass('expanded');
          topbar
            .css('height', '')
            .removeClass('expanded')
            .find('li')
            .removeClass('hover');

            if (doToggle) {
              self.toggle(topbar);
            }
        }

        if (self.is_sticky(topbar, stickyContainer, settings)) {
          if (stickyContainer.hasClass('fixed')) {
            // Remove the fixed to allow for correct calculation of the offset.
            stickyContainer.removeClass('fixed');

            stickyOffset = stickyContainer.offset().top;
            if (self.S(document.body).hasClass('f-topbar-fixed')) {
              stickyOffset -= topbar.data('height');
            }

            topbar.data('stickyoffset', stickyOffset);
            stickyContainer.addClass('fixed');
          } else {
            stickyOffset = stickyContainer.offset().top;
            topbar.data('stickyoffset', stickyOffset);
          }
        }

      });
    },

    breakpoint : function () {
      return !matchMedia(Foundation.media_queries['topbar']).matches;
    },

    small : function () {
      return matchMedia(Foundation.media_queries['small']).matches;
    },

    medium : function () {
      return matchMedia(Foundation.media_queries['medium']).matches;
    },

    large : function () {
      return matchMedia(Foundation.media_queries['large']).matches;
    },

    assemble : function (topbar) {
      var self = this,
          settings = topbar.data(this.attr_name(true) + '-init'),
          section = self.S('section, .top-bar-section', topbar);

      // Pull element out of the DOM for manipulation
      section.detach();

      self.S('.has-dropdown>a', section).each(function () {
        var $link = self.S(this),
            $dropdown = $link.siblings('.dropdown'),
            url = $link.attr('href'),
            $titleLi;

        if (!$dropdown.find('.title.back').length) {

          if (settings.mobile_show_parent_link == true && url) {
            $titleLi = $('<li class="title back js-generated"><h5><a href="javascript:void(0)"></a></h5></li><li class="parent-link hide-for-medium-up"><a class="parent-link js-generated" href="' + url + '">' + $link.html() +'</a></li>');
          } else {
            $titleLi = $('<li class="title back js-generated"><h5><a href="javascript:void(0)"></a></h5>');
          }

          // Copy link to subnav
          if (settings.custom_back_text == true) {
            $('h5>a', $titleLi).html(settings.back_text);
          } else {
            $('h5>a', $titleLi).html('&laquo; ' + $link.html());
          }
          $dropdown.prepend($titleLi);
        }
      });

      // Put element back in the DOM
      section.appendTo(topbar);

      // check for sticky
      this.sticky();

      this.assembled(topbar);
    },

    assembled : function (topbar) {
      topbar.data(this.attr_name(true), $.extend({}, topbar.data(this.attr_name(true)), {assembled : true}));
    },

    height : function (ul) {
      var total = 0,
          self = this;

      $('> li', ul).each(function () {
        total += self.S(this).outerHeight(true);
      });

      return total;
    },

    sticky : function () {
      var self = this;

      this.S(window).on('scroll', function () {
        self.update_sticky_positioning();
      });
    },

    update_sticky_positioning : function () {
      var klass = '.' + this.settings.sticky_class,
          $window = this.S(window),
          self = this;

      if (self.settings.sticky_topbar && self.is_sticky(this.settings.sticky_topbar,this.settings.sticky_topbar.parent(), this.settings)) {
        var distance = this.settings.sticky_topbar.data('stickyoffset') + this.settings.start_offset;
        if (!self.S(klass).hasClass('expanded')) {
          if ($window.scrollTop() > (distance)) {
            if (!self.S(klass).hasClass('fixed')) {
              self.S(klass).addClass('fixed');
              self.S('body').addClass('f-topbar-fixed');
            }
          } else if ($window.scrollTop() <= distance) {
            if (self.S(klass).hasClass('fixed')) {
              self.S(klass).removeClass('fixed');
              self.S('body').removeClass('f-topbar-fixed');
            }
          }
        }
      }
    },

    off : function () {
      this.S(this.scope).off('.fndtn.topbar');
      this.S(window).off('.fndtn.topbar');
    },

    reflow : function () {}
  };
}(jQuery, window, window.document));

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

  // Place your code here.

}(jQuery);

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
    $(document).foundation();
  });

}(jQuery);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZvdW5kYXRpb24uanMiLCJmb3VuZGF0aW9uLnRvcGJhci5qcyIsImV4YW1wbGUuanMiLCJ0ZXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3J0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMWNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoidGhlbWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogRm91bmRhdGlvbiBSZXNwb25zaXZlIExpYnJhcnlcbiAqIGh0dHA6Ly9mb3VuZGF0aW9uLnp1cmIuY29tXG4gKiBDb3B5cmlnaHQgMjAxNCwgWlVSQlxuICogRnJlZSB0byB1c2UgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuICogaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiovXG5cbihmdW5jdGlvbiAoJCwgd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgaGVhZGVyX2hlbHBlcnMgPSBmdW5jdGlvbiAoY2xhc3NfYXJyYXkpIHtcbiAgICB2YXIgaSA9IGNsYXNzX2FycmF5Lmxlbmd0aDtcbiAgICB2YXIgaGVhZCA9ICQoJ2hlYWQnKTtcblxuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIGlmIChoZWFkLmhhcygnLicgKyBjbGFzc19hcnJheVtpXSkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGhlYWQuYXBwZW5kKCc8bWV0YSBjbGFzcz1cIicgKyBjbGFzc19hcnJheVtpXSArICdcIiAvPicpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBoZWFkZXJfaGVscGVycyhbXG4gICAgJ2ZvdW5kYXRpb24tbXEtc21hbGwnLFxuICAgICdmb3VuZGF0aW9uLW1xLXNtYWxsLW9ubHknLFxuICAgICdmb3VuZGF0aW9uLW1xLW1lZGl1bScsXG4gICAgJ2ZvdW5kYXRpb24tbXEtbWVkaXVtLW9ubHknLFxuICAgICdmb3VuZGF0aW9uLW1xLWxhcmdlJyxcbiAgICAnZm91bmRhdGlvbi1tcS1sYXJnZS1vbmx5JyxcbiAgICAnZm91bmRhdGlvbi1tcS14bGFyZ2UnLFxuICAgICdmb3VuZGF0aW9uLW1xLXhsYXJnZS1vbmx5JyxcbiAgICAnZm91bmRhdGlvbi1tcS14eGxhcmdlJyxcbiAgICAnZm91bmRhdGlvbi1kYXRhLWF0dHJpYnV0ZS1uYW1lc3BhY2UnXSk7XG5cbiAgLy8gRW5hYmxlIEZhc3RDbGljayBpZiBwcmVzZW50XG5cbiAgJChmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHR5cGVvZiBGYXN0Q2xpY2sgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAvLyBEb24ndCBhdHRhY2ggdG8gYm9keSBpZiB1bmRlZmluZWRcbiAgICAgIGlmICh0eXBlb2YgZG9jdW1lbnQuYm9keSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgRmFzdENsaWNrLmF0dGFjaChkb2N1bWVudC5ib2R5KTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIC8vIHByaXZhdGUgRmFzdCBTZWxlY3RvciB3cmFwcGVyLFxuICAvLyByZXR1cm5zIGpRdWVyeSBvYmplY3QuIE9ubHkgdXNlIHdoZXJlXG4gIC8vIGdldEVsZW1lbnRCeUlkIGlzIG5vdCBhdmFpbGFibGUuXG4gIHZhciBTID0gZnVuY3Rpb24gKHNlbGVjdG9yLCBjb250ZXh0KSB7XG4gICAgaWYgKHR5cGVvZiBzZWxlY3RvciA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmIChjb250ZXh0KSB7XG4gICAgICAgIHZhciBjb250O1xuICAgICAgICBpZiAoY29udGV4dC5qcXVlcnkpIHtcbiAgICAgICAgICBjb250ID0gY29udGV4dFswXTtcbiAgICAgICAgICBpZiAoIWNvbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0O1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb250ID0gY29udGV4dDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJChjb250LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuICQoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpO1xuICAgIH1cblxuICAgIHJldHVybiAkKHNlbGVjdG9yLCBjb250ZXh0KTtcbiAgfTtcblxuICAvLyBOYW1lc3BhY2UgZnVuY3Rpb25zLlxuXG4gIHZhciBhdHRyX25hbWUgPSBmdW5jdGlvbiAoaW5pdCkge1xuICAgIHZhciBhcnIgPSBbXTtcbiAgICBpZiAoIWluaXQpIHtcbiAgICAgIGFyci5wdXNoKCdkYXRhJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLm5hbWVzcGFjZS5sZW5ndGggPiAwKSB7XG4gICAgICBhcnIucHVzaCh0aGlzLm5hbWVzcGFjZSk7XG4gICAgfVxuICAgIGFyci5wdXNoKHRoaXMubmFtZSk7XG5cbiAgICByZXR1cm4gYXJyLmpvaW4oJy0nKTtcbiAgfTtcblxuICB2YXIgYWRkX25hbWVzcGFjZSA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICB2YXIgcGFydHMgPSBzdHIuc3BsaXQoJy0nKSxcbiAgICAgICAgaSA9IHBhcnRzLmxlbmd0aCxcbiAgICAgICAgYXJyID0gW107XG5cbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICBpZiAoaSAhPT0gMCkge1xuICAgICAgICBhcnIucHVzaChwYXJ0c1tpXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodGhpcy5uYW1lc3BhY2UubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGFyci5wdXNoKHRoaXMubmFtZXNwYWNlLCBwYXJ0c1tpXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYXJyLnB1c2gocGFydHNbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGFyci5yZXZlcnNlKCkuam9pbignLScpO1xuICB9O1xuXG4gIC8vIEV2ZW50IGJpbmRpbmcgYW5kIGRhdGEtb3B0aW9ucyB1cGRhdGluZy5cblxuICB2YXIgYmluZGluZ3MgPSBmdW5jdGlvbiAobWV0aG9kLCBvcHRpb25zKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBiaW5kID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICB2YXIgJHRoaXMgPSBTKHRoaXMpLFxuICAgICAgICAgICAgICBzaG91bGRfYmluZF9ldmVudHMgPSAhJHRoaXMuZGF0YShzZWxmLmF0dHJfbmFtZSh0cnVlKSArICctaW5pdCcpO1xuICAgICAgICAgICR0aGlzLmRhdGEoc2VsZi5hdHRyX25hbWUodHJ1ZSkgKyAnLWluaXQnLCAkLmV4dGVuZCh7fSwgc2VsZi5zZXR0aW5ncywgKG9wdGlvbnMgfHwgbWV0aG9kKSwgc2VsZi5kYXRhX29wdGlvbnMoJHRoaXMpKSk7XG5cbiAgICAgICAgICBpZiAoc2hvdWxkX2JpbmRfZXZlbnRzKSB7XG4gICAgICAgICAgICBzZWxmLmV2ZW50cyh0aGlzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICBpZiAoUyh0aGlzLnNjb3BlKS5pcygnWycgKyB0aGlzLmF0dHJfbmFtZSgpICsnXScpKSB7XG4gICAgICBiaW5kLmNhbGwodGhpcy5zY29wZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIFMoJ1snICsgdGhpcy5hdHRyX25hbWUoKSArJ10nLCB0aGlzLnNjb3BlKS5lYWNoKGJpbmQpO1xuICAgIH1cbiAgICAvLyAjIFBhdGNoIHRvIGZpeCAjNTA0MyB0byBtb3ZlIHRoaXMgKmFmdGVyKiB0aGUgaWYvZWxzZSBjbGF1c2UgaW4gb3JkZXIgZm9yIEJhY2tib25lIGFuZCBzaW1pbGFyIGZyYW1ld29ya3MgdG8gaGF2ZSBpbXByb3ZlZCBjb250cm9sIG92ZXIgZXZlbnQgYmluZGluZyBhbmQgZGF0YS1vcHRpb25zIHVwZGF0aW5nLlxuICAgIGlmICh0eXBlb2YgbWV0aG9kID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHRoaXNbbWV0aG9kXS5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuICAgIH1cblxuICB9O1xuXG4gIHZhciBzaW5nbGVfaW1hZ2VfbG9hZGVkID0gZnVuY3Rpb24gKGltYWdlLCBjYWxsYmFjaykge1xuICAgIGZ1bmN0aW9uIGxvYWRlZCAoKSB7XG4gICAgICBjYWxsYmFjayhpbWFnZVswXSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYmluZExvYWQgKCkge1xuICAgICAgdGhpcy5vbmUoJ2xvYWQnLCBsb2FkZWQpO1xuXG4gICAgICBpZiAoL01TSUUgKFxcZCtcXC5cXGQrKTsvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkpIHtcbiAgICAgICAgdmFyIHNyYyA9IHRoaXMuYXR0ciggJ3NyYycgKSxcbiAgICAgICAgICAgIHBhcmFtID0gc3JjLm1hdGNoKCAvXFw/LyApID8gJyYnIDogJz8nO1xuXG4gICAgICAgIHBhcmFtICs9ICdyYW5kb209JyArIChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7XG4gICAgICAgIHRoaXMuYXR0cignc3JjJywgc3JjICsgcGFyYW0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghaW1hZ2UuYXR0cignc3JjJykpIHtcbiAgICAgIGxvYWRlZCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChpbWFnZVswXS5jb21wbGV0ZSB8fCBpbWFnZVswXS5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICBsb2FkZWQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYmluZExvYWQuY2FsbChpbWFnZSk7XG4gICAgfVxuICB9O1xuXG4gIC8qISBtYXRjaE1lZGlhKCkgcG9seWZpbGwgLSBUZXN0IGEgQ1NTIG1lZGlhIHR5cGUvcXVlcnkgaW4gSlMuIEF1dGhvcnMgJiBjb3B5cmlnaHQgKGMpIDIwMTI6IFNjb3R0IEplaGwsIFBhdWwgSXJpc2gsIE5pY2hvbGFzIFpha2FzLCBEYXZpZCBLbmlnaHQuIER1YWwgTUlUL0JTRCBsaWNlbnNlICovXG5cbiAgd2luZG93Lm1hdGNoTWVkaWEgfHwgKHdpbmRvdy5tYXRjaE1lZGlhID0gZnVuY3Rpb24oKSB7XG4gICAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgICAgLy8gRm9yIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBtYXRjaE1lZGl1bSBhcGkgc3VjaCBhcyBJRSA5IGFuZCB3ZWJraXRcbiAgICAgIHZhciBzdHlsZU1lZGlhID0gKHdpbmRvdy5zdHlsZU1lZGlhIHx8IHdpbmRvdy5tZWRpYSk7XG5cbiAgICAgIC8vIEZvciB0aG9zZSB0aGF0IGRvbid0IHN1cHBvcnQgbWF0Y2hNZWRpdW1cbiAgICAgIGlmICghc3R5bGVNZWRpYSkge1xuICAgICAgICAgIHZhciBzdHlsZSAgICAgICA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyksXG4gICAgICAgICAgICAgIHNjcmlwdCAgICAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpWzBdLFxuICAgICAgICAgICAgICBpbmZvICAgICAgICA9IG51bGw7XG5cbiAgICAgICAgICBzdHlsZS50eXBlICA9ICd0ZXh0L2Nzcyc7XG4gICAgICAgICAgc3R5bGUuaWQgICAgPSAnbWF0Y2htZWRpYWpzLXRlc3QnO1xuXG4gICAgICAgICAgc2NyaXB0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHN0eWxlLCBzY3JpcHQpO1xuXG4gICAgICAgICAgLy8gJ3N0eWxlLmN1cnJlbnRTdHlsZScgaXMgdXNlZCBieSBJRSA8PSA4IGFuZCAnd2luZG93LmdldENvbXB1dGVkU3R5bGUnIGZvciBhbGwgb3RoZXIgYnJvd3NlcnNcbiAgICAgICAgICBpbmZvID0gKCdnZXRDb21wdXRlZFN0eWxlJyBpbiB3aW5kb3cpICYmIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHN0eWxlLCBudWxsKSB8fCBzdHlsZS5jdXJyZW50U3R5bGU7XG5cbiAgICAgICAgICBzdHlsZU1lZGlhID0ge1xuICAgICAgICAgICAgICBtYXRjaE1lZGl1bTogZnVuY3Rpb24obWVkaWEpIHtcbiAgICAgICAgICAgICAgICAgIHZhciB0ZXh0ID0gJ0BtZWRpYSAnICsgbWVkaWEgKyAneyAjbWF0Y2htZWRpYWpzLXRlc3QgeyB3aWR0aDogMXB4OyB9IH0nO1xuXG4gICAgICAgICAgICAgICAgICAvLyAnc3R5bGUuc3R5bGVTaGVldCcgaXMgdXNlZCBieSBJRSA8PSA4IGFuZCAnc3R5bGUudGV4dENvbnRlbnQnIGZvciBhbGwgb3RoZXIgYnJvd3NlcnNcbiAgICAgICAgICAgICAgICAgIGlmIChzdHlsZS5zdHlsZVNoZWV0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgc3R5bGUuc3R5bGVTaGVldC5jc3NUZXh0ID0gdGV4dDtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgc3R5bGUudGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAvLyBUZXN0IGlmIG1lZGlhIHF1ZXJ5IGlzIHRydWUgb3IgZmFsc2VcbiAgICAgICAgICAgICAgICAgIHJldHVybiBpbmZvLndpZHRoID09PSAnMXB4JztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmdW5jdGlvbihtZWRpYSkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIG1hdGNoZXM6IHN0eWxlTWVkaWEubWF0Y2hNZWRpdW0obWVkaWEgfHwgJ2FsbCcpLFxuICAgICAgICAgICAgICBtZWRpYTogbWVkaWEgfHwgJ2FsbCdcbiAgICAgICAgICB9O1xuICAgICAgfTtcbiAgfSgpKTtcblxuICAvKlxuICAgKiBqcXVlcnkucmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9nbmFyZjM3L2pxdWVyeS1yZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgICogUmVxdWlyZXMgalF1ZXJ5IDEuOCtcbiAgICpcbiAgICogQ29weXJpZ2h0IChjKSAyMDEyIENvcmV5IEZyYW5nXG4gICAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAgICovXG5cbiAgKGZ1bmN0aW9uKGpRdWVyeSkge1xuXG5cbiAgLy8gcmVxdWVzdEFuaW1hdGlvbkZyYW1lIHBvbHlmaWxsIGFkYXB0ZWQgZnJvbSBFcmlrIE3DtmxsZXJcbiAgLy8gZml4ZXMgZnJvbSBQYXVsIElyaXNoIGFuZCBUaW5vIFppamRlbFxuICAvLyBodHRwOi8vcGF1bGlyaXNoLmNvbS8yMDExL3JlcXVlc3RhbmltYXRpb25mcmFtZS1mb3Itc21hcnQtYW5pbWF0aW5nL1xuICAvLyBodHRwOi8vbXkub3BlcmEuY29tL2Vtb2xsZXIvYmxvZy8yMDExLzEyLzIwL3JlcXVlc3RhbmltYXRpb25mcmFtZS1mb3Itc21hcnQtZXItYW5pbWF0aW5nXG5cbiAgdmFyIGFuaW1hdGluZyxcbiAgICAgIGxhc3RUaW1lID0gMCxcbiAgICAgIHZlbmRvcnMgPSBbJ3dlYmtpdCcsICdtb3onXSxcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUsXG4gICAgICBjYW5jZWxBbmltYXRpb25GcmFtZSA9IHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSxcbiAgICAgIGpxdWVyeUZ4QXZhaWxhYmxlID0gJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBqUXVlcnkuZng7XG5cbiAgZm9yICg7IGxhc3RUaW1lIDwgdmVuZG9ycy5sZW5ndGggJiYgIXJlcXVlc3RBbmltYXRpb25GcmFtZTsgbGFzdFRpbWUrKykge1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvd1sgdmVuZG9yc1tsYXN0VGltZV0gKyAnUmVxdWVzdEFuaW1hdGlvbkZyYW1lJyBdO1xuICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lID0gY2FuY2VsQW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgIHdpbmRvd1sgdmVuZG9yc1tsYXN0VGltZV0gKyAnQ2FuY2VsQW5pbWF0aW9uRnJhbWUnIF0gfHxcbiAgICAgIHdpbmRvd1sgdmVuZG9yc1tsYXN0VGltZV0gKyAnQ2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lJyBdO1xuICB9XG5cbiAgZnVuY3Rpb24gcmFmKCkge1xuICAgIGlmIChhbmltYXRpbmcpIHtcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyYWYpO1xuXG4gICAgICBpZiAoanF1ZXJ5RnhBdmFpbGFibGUpIHtcbiAgICAgICAgalF1ZXJ5LmZ4LnRpY2soKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAocmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgLy8gdXNlIHJBRlxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG4gICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gY2FuY2VsQW5pbWF0aW9uRnJhbWU7XG5cbiAgICBpZiAoanF1ZXJ5RnhBdmFpbGFibGUpIHtcbiAgICAgIGpRdWVyeS5meC50aW1lciA9IGZ1bmN0aW9uICh0aW1lcikge1xuICAgICAgICBpZiAodGltZXIoKSAmJiBqUXVlcnkudGltZXJzLnB1c2godGltZXIpICYmICFhbmltYXRpbmcpIHtcbiAgICAgICAgICBhbmltYXRpbmcgPSB0cnVlO1xuICAgICAgICAgIHJhZigpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBqUXVlcnkuZnguc3RvcCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgYW5pbWF0aW5nID0gZmFsc2U7XG4gICAgICB9O1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBwb2x5ZmlsbFxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgIHZhciBjdXJyVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpLFxuICAgICAgICB0aW1lVG9DYWxsID0gTWF0aC5tYXgoMCwgMTYgLSAoY3VyclRpbWUgLSBsYXN0VGltZSkpLFxuICAgICAgICBpZCA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBjYWxsYmFjayhjdXJyVGltZSArIHRpbWVUb0NhbGwpO1xuICAgICAgICB9LCB0aW1lVG9DYWxsKTtcbiAgICAgIGxhc3RUaW1lID0gY3VyclRpbWUgKyB0aW1lVG9DYWxsO1xuICAgICAgcmV0dXJuIGlkO1xuICAgIH07XG5cbiAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgIGNsZWFyVGltZW91dChpZCk7XG4gICAgfTtcblxuICB9XG5cbiAgfSggJCApKTtcblxuICBmdW5jdGlvbiByZW1vdmVRdW90ZXMgKHN0cmluZykge1xuICAgIGlmICh0eXBlb2Ygc3RyaW5nID09PSAnc3RyaW5nJyB8fCBzdHJpbmcgaW5zdGFuY2VvZiBTdHJpbmcpIHtcbiAgICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKC9eWydcXFxcL1wiXSt8KDtcXHM/fSkrfFsnXFxcXC9cIl0rJC9nLCAnJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0cmluZztcbiAgfVxuXG4gIHdpbmRvdy5Gb3VuZGF0aW9uID0ge1xuICAgIG5hbWUgOiAnRm91bmRhdGlvbicsXG5cbiAgICB2ZXJzaW9uIDogJzUuNS4yJyxcblxuICAgIG1lZGlhX3F1ZXJpZXMgOiB7XG4gICAgICAnc21hbGwnICAgICAgIDogUygnLmZvdW5kYXRpb24tbXEtc21hbGwnKS5jc3MoJ2ZvbnQtZmFtaWx5JykucmVwbGFjZSgvXltcXC9cXFxcJ1wiXSt8KDtcXHM/fSkrfFtcXC9cXFxcJ1wiXSskL2csICcnKSxcbiAgICAgICdzbWFsbC1vbmx5JyAgOiBTKCcuZm91bmRhdGlvbi1tcS1zbWFsbC1vbmx5JykuY3NzKCdmb250LWZhbWlseScpLnJlcGxhY2UoL15bXFwvXFxcXCdcIl0rfCg7XFxzP30pK3xbXFwvXFxcXCdcIl0rJC9nLCAnJyksXG4gICAgICAnbWVkaXVtJyAgICAgIDogUygnLmZvdW5kYXRpb24tbXEtbWVkaXVtJykuY3NzKCdmb250LWZhbWlseScpLnJlcGxhY2UoL15bXFwvXFxcXCdcIl0rfCg7XFxzP30pK3xbXFwvXFxcXCdcIl0rJC9nLCAnJyksXG4gICAgICAnbWVkaXVtLW9ubHknIDogUygnLmZvdW5kYXRpb24tbXEtbWVkaXVtLW9ubHknKS5jc3MoJ2ZvbnQtZmFtaWx5JykucmVwbGFjZSgvXltcXC9cXFxcJ1wiXSt8KDtcXHM/fSkrfFtcXC9cXFxcJ1wiXSskL2csICcnKSxcbiAgICAgICdsYXJnZScgICAgICAgOiBTKCcuZm91bmRhdGlvbi1tcS1sYXJnZScpLmNzcygnZm9udC1mYW1pbHknKS5yZXBsYWNlKC9eW1xcL1xcXFwnXCJdK3woO1xccz99KSt8W1xcL1xcXFwnXCJdKyQvZywgJycpLFxuICAgICAgJ2xhcmdlLW9ubHknICA6IFMoJy5mb3VuZGF0aW9uLW1xLWxhcmdlLW9ubHknKS5jc3MoJ2ZvbnQtZmFtaWx5JykucmVwbGFjZSgvXltcXC9cXFxcJ1wiXSt8KDtcXHM/fSkrfFtcXC9cXFxcJ1wiXSskL2csICcnKSxcbiAgICAgICd4bGFyZ2UnICAgICAgOiBTKCcuZm91bmRhdGlvbi1tcS14bGFyZ2UnKS5jc3MoJ2ZvbnQtZmFtaWx5JykucmVwbGFjZSgvXltcXC9cXFxcJ1wiXSt8KDtcXHM/fSkrfFtcXC9cXFxcJ1wiXSskL2csICcnKSxcbiAgICAgICd4bGFyZ2Utb25seScgOiBTKCcuZm91bmRhdGlvbi1tcS14bGFyZ2Utb25seScpLmNzcygnZm9udC1mYW1pbHknKS5yZXBsYWNlKC9eW1xcL1xcXFwnXCJdK3woO1xccz99KSt8W1xcL1xcXFwnXCJdKyQvZywgJycpLFxuICAgICAgJ3h4bGFyZ2UnICAgICA6IFMoJy5mb3VuZGF0aW9uLW1xLXh4bGFyZ2UnKS5jc3MoJ2ZvbnQtZmFtaWx5JykucmVwbGFjZSgvXltcXC9cXFxcJ1wiXSt8KDtcXHM/fSkrfFtcXC9cXFxcJ1wiXSskL2csICcnKVxuICAgIH0sXG5cbiAgICBzdHlsZXNoZWV0IDogJCgnPHN0eWxlPjwvc3R5bGU+JykuYXBwZW5kVG8oJ2hlYWQnKVswXS5zaGVldCxcblxuICAgIGdsb2JhbCA6IHtcbiAgICAgIG5hbWVzcGFjZSA6IHVuZGVmaW5lZFxuICAgIH0sXG5cbiAgICBpbml0IDogZnVuY3Rpb24gKHNjb3BlLCBsaWJyYXJpZXMsIG1ldGhvZCwgb3B0aW9ucywgcmVzcG9uc2UpIHtcbiAgICAgIHZhciBhcmdzID0gW3Njb3BlLCBtZXRob2QsIG9wdGlvbnMsIHJlc3BvbnNlXSxcbiAgICAgICAgICByZXNwb25zZXMgPSBbXTtcblxuICAgICAgLy8gY2hlY2sgUlRMXG4gICAgICB0aGlzLnJ0bCA9IC9ydGwvaS50ZXN0KFMoJ2h0bWwnKS5hdHRyKCdkaXInKSk7XG5cbiAgICAgIC8vIHNldCBmb3VuZGF0aW9uIGdsb2JhbCBzY29wZVxuICAgICAgdGhpcy5zY29wZSA9IHNjb3BlIHx8IHRoaXMuc2NvcGU7XG5cbiAgICAgIHRoaXMuc2V0X25hbWVzcGFjZSgpO1xuXG4gICAgICBpZiAobGlicmFyaWVzICYmIHR5cGVvZiBsaWJyYXJpZXMgPT09ICdzdHJpbmcnICYmICEvcmVmbG93L2kudGVzdChsaWJyYXJpZXMpKSB7XG4gICAgICAgIGlmICh0aGlzLmxpYnMuaGFzT3duUHJvcGVydHkobGlicmFyaWVzKSkge1xuICAgICAgICAgIHJlc3BvbnNlcy5wdXNoKHRoaXMuaW5pdF9saWIobGlicmFyaWVzLCBhcmdzKSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAodmFyIGxpYiBpbiB0aGlzLmxpYnMpIHtcbiAgICAgICAgICByZXNwb25zZXMucHVzaCh0aGlzLmluaXRfbGliKGxpYiwgbGlicmFyaWVzKSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgUyh3aW5kb3cpLmxvYWQoZnVuY3Rpb24gKCkge1xuICAgICAgICBTKHdpbmRvdylcbiAgICAgICAgICAudHJpZ2dlcigncmVzaXplLmZuZHRuLmNsZWFyaW5nJylcbiAgICAgICAgICAudHJpZ2dlcigncmVzaXplLmZuZHRuLmRyb3Bkb3duJylcbiAgICAgICAgICAudHJpZ2dlcigncmVzaXplLmZuZHRuLmVxdWFsaXplcicpXG4gICAgICAgICAgLnRyaWdnZXIoJ3Jlc2l6ZS5mbmR0bi5pbnRlcmNoYW5nZScpXG4gICAgICAgICAgLnRyaWdnZXIoJ3Jlc2l6ZS5mbmR0bi5qb3lyaWRlJylcbiAgICAgICAgICAudHJpZ2dlcigncmVzaXplLmZuZHRuLm1hZ2VsbGFuJylcbiAgICAgICAgICAudHJpZ2dlcigncmVzaXplLmZuZHRuLnRvcGJhcicpXG4gICAgICAgICAgLnRyaWdnZXIoJ3Jlc2l6ZS5mbmR0bi5zbGlkZXInKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gc2NvcGU7XG4gICAgfSxcblxuICAgIGluaXRfbGliIDogZnVuY3Rpb24gKGxpYiwgYXJncykge1xuICAgICAgaWYgKHRoaXMubGlicy5oYXNPd25Qcm9wZXJ0eShsaWIpKSB7XG4gICAgICAgIHRoaXMucGF0Y2godGhpcy5saWJzW2xpYl0pO1xuXG4gICAgICAgIGlmIChhcmdzICYmIGFyZ3MuaGFzT3duUHJvcGVydHkobGliKSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmxpYnNbbGliXS5zZXR0aW5ncyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgJC5leHRlbmQodHJ1ZSwgdGhpcy5saWJzW2xpYl0uc2V0dGluZ3MsIGFyZ3NbbGliXSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLmxpYnNbbGliXS5kZWZhdWx0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgJC5leHRlbmQodHJ1ZSwgdGhpcy5saWJzW2xpYl0uZGVmYXVsdHMsIGFyZ3NbbGliXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRoaXMubGlic1tsaWJdLmluaXQuYXBwbHkodGhpcy5saWJzW2xpYl0sIFt0aGlzLnNjb3BlLCBhcmdzW2xpYl1dKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFyZ3MgPSBhcmdzIGluc3RhbmNlb2YgQXJyYXkgPyBhcmdzIDogbmV3IEFycmF5KGFyZ3MpO1xuICAgICAgICByZXR1cm4gdGhpcy5saWJzW2xpYl0uaW5pdC5hcHBseSh0aGlzLmxpYnNbbGliXSwgYXJncyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7fTtcbiAgICB9LFxuXG4gICAgcGF0Y2ggOiBmdW5jdGlvbiAobGliKSB7XG4gICAgICBsaWIuc2NvcGUgPSB0aGlzLnNjb3BlO1xuICAgICAgbGliLm5hbWVzcGFjZSA9IHRoaXMuZ2xvYmFsLm5hbWVzcGFjZTtcbiAgICAgIGxpYi5ydGwgPSB0aGlzLnJ0bDtcbiAgICAgIGxpYlsnZGF0YV9vcHRpb25zJ10gPSB0aGlzLnV0aWxzLmRhdGFfb3B0aW9ucztcbiAgICAgIGxpYlsnYXR0cl9uYW1lJ10gPSBhdHRyX25hbWU7XG4gICAgICBsaWJbJ2FkZF9uYW1lc3BhY2UnXSA9IGFkZF9uYW1lc3BhY2U7XG4gICAgICBsaWJbJ2JpbmRpbmdzJ10gPSBiaW5kaW5ncztcbiAgICAgIGxpYlsnUyddID0gdGhpcy51dGlscy5TO1xuICAgIH0sXG5cbiAgICBpbmhlcml0IDogZnVuY3Rpb24gKHNjb3BlLCBtZXRob2RzKSB7XG4gICAgICB2YXIgbWV0aG9kc19hcnIgPSBtZXRob2RzLnNwbGl0KCcgJyksXG4gICAgICAgICAgaSA9IG1ldGhvZHNfYXJyLmxlbmd0aDtcblxuICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICBpZiAodGhpcy51dGlscy5oYXNPd25Qcm9wZXJ0eShtZXRob2RzX2FycltpXSkpIHtcbiAgICAgICAgICBzY29wZVttZXRob2RzX2FycltpXV0gPSB0aGlzLnV0aWxzW21ldGhvZHNfYXJyW2ldXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBzZXRfbmFtZXNwYWNlIDogZnVuY3Rpb24gKCkge1xuXG4gICAgICAvLyBEZXNjcmlwdGlvbjpcbiAgICAgIC8vICAgIERvbid0IGJvdGhlciByZWFkaW5nIHRoZSBuYW1lc3BhY2Ugb3V0IG9mIHRoZSBtZXRhIHRhZ1xuICAgICAgLy8gICAgaWYgdGhlIG5hbWVzcGFjZSBoYXMgYmVlbiBzZXQgZ2xvYmFsbHkgaW4gamF2YXNjcmlwdFxuICAgICAgLy9cbiAgICAgIC8vIEV4YW1wbGU6XG4gICAgICAvLyAgICBGb3VuZGF0aW9uLmdsb2JhbC5uYW1lc3BhY2UgPSAnbXktbmFtZXNwYWNlJztcbiAgICAgIC8vIG9yIG1ha2UgaXQgYW4gZW1wdHkgc3RyaW5nOlxuICAgICAgLy8gICAgRm91bmRhdGlvbi5nbG9iYWwubmFtZXNwYWNlID0gJyc7XG4gICAgICAvL1xuICAgICAgLy9cblxuICAgICAgLy8gSWYgdGhlIG5hbWVzcGFjZSBoYXMgbm90IGJlZW4gc2V0IChpcyB1bmRlZmluZWQpLCB0cnkgdG8gcmVhZCBpdCBvdXQgb2YgdGhlIG1ldGEgZWxlbWVudC5cbiAgICAgIC8vIE90aGVyd2lzZSB1c2UgdGhlIGdsb2JhbGx5IGRlZmluZWQgbmFtZXNwYWNlLCBldmVuIGlmIGl0J3MgZW1wdHkgKCcnKVxuICAgICAgdmFyIG5hbWVzcGFjZSA9ICggdGhpcy5nbG9iYWwubmFtZXNwYWNlID09PSB1bmRlZmluZWQgKSA/ICQoJy5mb3VuZGF0aW9uLWRhdGEtYXR0cmlidXRlLW5hbWVzcGFjZScpLmNzcygnZm9udC1mYW1pbHknKSA6IHRoaXMuZ2xvYmFsLm5hbWVzcGFjZTtcblxuICAgICAgLy8gRmluYWxseSwgaWYgdGhlIG5hbXNlcGFjZSBpcyBlaXRoZXIgdW5kZWZpbmVkIG9yIGZhbHNlLCBzZXQgaXQgdG8gYW4gZW1wdHkgc3RyaW5nLlxuICAgICAgLy8gT3RoZXJ3aXNlIHVzZSB0aGUgbmFtZXNwYWNlIHZhbHVlLlxuICAgICAgdGhpcy5nbG9iYWwubmFtZXNwYWNlID0gKCBuYW1lc3BhY2UgPT09IHVuZGVmaW5lZCB8fCAvZmFsc2UvaS50ZXN0KG5hbWVzcGFjZSkgKSA/ICcnIDogbmFtZXNwYWNlO1xuICAgIH0sXG5cbiAgICBsaWJzIDoge30sXG5cbiAgICAvLyBtZXRob2RzIHRoYXQgY2FuIGJlIGluaGVyaXRlZCBpbiBsaWJyYXJpZXNcbiAgICB1dGlscyA6IHtcblxuICAgICAgLy8gRGVzY3JpcHRpb246XG4gICAgICAvLyAgICBGYXN0IFNlbGVjdG9yIHdyYXBwZXIgcmV0dXJucyBqUXVlcnkgb2JqZWN0LiBPbmx5IHVzZSB3aGVyZSBnZXRFbGVtZW50QnlJZFxuICAgICAgLy8gICAgaXMgbm90IGF2YWlsYWJsZS5cbiAgICAgIC8vXG4gICAgICAvLyBBcmd1bWVudHM6XG4gICAgICAvLyAgICBTZWxlY3RvciAoU3RyaW5nKTogQ1NTIHNlbGVjdG9yIGRlc2NyaWJpbmcgdGhlIGVsZW1lbnQocykgdG8gYmVcbiAgICAgIC8vICAgIHJldHVybmVkIGFzIGEgalF1ZXJ5IG9iamVjdC5cbiAgICAgIC8vXG4gICAgICAvLyAgICBTY29wZSAoU3RyaW5nKTogQ1NTIHNlbGVjdG9yIGRlc2NyaWJpbmcgdGhlIGFyZWEgdG8gYmUgc2VhcmNoZWQuIERlZmF1bHRcbiAgICAgIC8vICAgIGlzIGRvY3VtZW50LlxuICAgICAgLy9cbiAgICAgIC8vIFJldHVybnM6XG4gICAgICAvLyAgICBFbGVtZW50IChqUXVlcnkgT2JqZWN0KTogalF1ZXJ5IG9iamVjdCBjb250YWluaW5nIGVsZW1lbnRzIG1hdGNoaW5nIHRoZVxuICAgICAgLy8gICAgc2VsZWN0b3Igd2l0aGluIHRoZSBzY29wZS5cbiAgICAgIFMgOiBTLFxuXG4gICAgICAvLyBEZXNjcmlwdGlvbjpcbiAgICAgIC8vICAgIEV4ZWN1dGVzIGEgZnVuY3Rpb24gYSBtYXggb2Ygb25jZSBldmVyeSBuIG1pbGxpc2Vjb25kc1xuICAgICAgLy9cbiAgICAgIC8vIEFyZ3VtZW50czpcbiAgICAgIC8vICAgIEZ1bmMgKEZ1bmN0aW9uKTogRnVuY3Rpb24gdG8gYmUgdGhyb3R0bGVkLlxuICAgICAgLy9cbiAgICAgIC8vICAgIERlbGF5IChJbnRlZ2VyKTogRnVuY3Rpb24gZXhlY3V0aW9uIHRocmVzaG9sZCBpbiBtaWxsaXNlY29uZHMuXG4gICAgICAvL1xuICAgICAgLy8gUmV0dXJuczpcbiAgICAgIC8vICAgIExhenlfZnVuY3Rpb24gKEZ1bmN0aW9uKTogRnVuY3Rpb24gd2l0aCB0aHJvdHRsaW5nIGFwcGxpZWQuXG4gICAgICB0aHJvdHRsZSA6IGZ1bmN0aW9uIChmdW5jLCBkZWxheSkge1xuICAgICAgICB2YXIgdGltZXIgPSBudWxsO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdmFyIGNvbnRleHQgPSB0aGlzLCBhcmdzID0gYXJndW1lbnRzO1xuXG4gICAgICAgICAgaWYgKHRpbWVyID09IG51bGwpIHtcbiAgICAgICAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgICAgIHRpbWVyID0gbnVsbDtcbiAgICAgICAgICAgIH0sIGRlbGF5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9LFxuXG4gICAgICAvLyBEZXNjcmlwdGlvbjpcbiAgICAgIC8vICAgIEV4ZWN1dGVzIGEgZnVuY3Rpb24gd2hlbiBpdCBzdG9wcyBiZWluZyBpbnZva2VkIGZvciBuIHNlY29uZHNcbiAgICAgIC8vICAgIE1vZGlmaWVkIHZlcnNpb24gb2YgXy5kZWJvdW5jZSgpIGh0dHA6Ly91bmRlcnNjb3JlanMub3JnXG4gICAgICAvL1xuICAgICAgLy8gQXJndW1lbnRzOlxuICAgICAgLy8gICAgRnVuYyAoRnVuY3Rpb24pOiBGdW5jdGlvbiB0byBiZSBkZWJvdW5jZWQuXG4gICAgICAvL1xuICAgICAgLy8gICAgRGVsYXkgKEludGVnZXIpOiBGdW5jdGlvbiBleGVjdXRpb24gdGhyZXNob2xkIGluIG1pbGxpc2Vjb25kcy5cbiAgICAgIC8vXG4gICAgICAvLyAgICBJbW1lZGlhdGUgKEJvb2wpOiBXaGV0aGVyIHRoZSBmdW5jdGlvbiBzaG91bGQgYmUgY2FsbGVkIGF0IHRoZSBiZWdpbm5pbmdcbiAgICAgIC8vICAgIG9mIHRoZSBkZWxheSBpbnN0ZWFkIG9mIHRoZSBlbmQuIERlZmF1bHQgaXMgZmFsc2UuXG4gICAgICAvL1xuICAgICAgLy8gUmV0dXJuczpcbiAgICAgIC8vICAgIExhenlfZnVuY3Rpb24gKEZ1bmN0aW9uKTogRnVuY3Rpb24gd2l0aCBkZWJvdW5jaW5nIGFwcGxpZWQuXG4gICAgICBkZWJvdW5jZSA6IGZ1bmN0aW9uIChmdW5jLCBkZWxheSwgaW1tZWRpYXRlKSB7XG4gICAgICAgIHZhciB0aW1lb3V0LCByZXN1bHQ7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdmFyIGNvbnRleHQgPSB0aGlzLCBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgIHZhciBsYXRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgICAgICAgaWYgKCFpbW1lZGlhdGUpIHtcbiAgICAgICAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICAgIHZhciBjYWxsTm93ID0gaW1tZWRpYXRlICYmICF0aW1lb3V0O1xuICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgZGVsYXkpO1xuICAgICAgICAgIGlmIChjYWxsTm93KSB7XG4gICAgICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9O1xuICAgICAgfSxcblxuICAgICAgLy8gRGVzY3JpcHRpb246XG4gICAgICAvLyAgICBQYXJzZXMgZGF0YS1vcHRpb25zIGF0dHJpYnV0ZVxuICAgICAgLy9cbiAgICAgIC8vIEFyZ3VtZW50czpcbiAgICAgIC8vICAgIEVsIChqUXVlcnkgT2JqZWN0KTogRWxlbWVudCB0byBiZSBwYXJzZWQuXG4gICAgICAvL1xuICAgICAgLy8gUmV0dXJuczpcbiAgICAgIC8vICAgIE9wdGlvbnMgKEphdmFzY3JpcHQgT2JqZWN0KTogQ29udGVudHMgb2YgdGhlIGVsZW1lbnQncyBkYXRhLW9wdGlvbnNcbiAgICAgIC8vICAgIGF0dHJpYnV0ZS5cbiAgICAgIGRhdGFfb3B0aW9ucyA6IGZ1bmN0aW9uIChlbCwgZGF0YV9hdHRyX25hbWUpIHtcbiAgICAgICAgZGF0YV9hdHRyX25hbWUgPSBkYXRhX2F0dHJfbmFtZSB8fCAnb3B0aW9ucyc7XG4gICAgICAgIHZhciBvcHRzID0ge30sIGlpLCBwLCBvcHRzX2FycixcbiAgICAgICAgICAgIGRhdGFfb3B0aW9ucyA9IGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgICB2YXIgbmFtZXNwYWNlID0gRm91bmRhdGlvbi5nbG9iYWwubmFtZXNwYWNlO1xuXG4gICAgICAgICAgICAgIGlmIChuYW1lc3BhY2UubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlbC5kYXRhKG5hbWVzcGFjZSArICctJyArIGRhdGFfYXR0cl9uYW1lKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHJldHVybiBlbC5kYXRhKGRhdGFfYXR0cl9uYW1lKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgdmFyIGNhY2hlZF9vcHRpb25zID0gZGF0YV9vcHRpb25zKGVsKTtcblxuICAgICAgICBpZiAodHlwZW9mIGNhY2hlZF9vcHRpb25zID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgIHJldHVybiBjYWNoZWRfb3B0aW9ucztcbiAgICAgICAgfVxuXG4gICAgICAgIG9wdHNfYXJyID0gKGNhY2hlZF9vcHRpb25zIHx8ICc6Jykuc3BsaXQoJzsnKTtcbiAgICAgICAgaWkgPSBvcHRzX2Fyci5sZW5ndGg7XG5cbiAgICAgICAgZnVuY3Rpb24gaXNOdW1iZXIgKG8pIHtcbiAgICAgICAgICByZXR1cm4gIWlzTmFOIChvIC0gMCkgJiYgbyAhPT0gbnVsbCAmJiBvICE9PSAnJyAmJiBvICE9PSBmYWxzZSAmJiBvICE9PSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gdHJpbSAoc3RyKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBzdHIgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICByZXR1cm4gJC50cmltKHN0cik7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBzdHI7XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZSAoaWktLSkge1xuICAgICAgICAgIHAgPSBvcHRzX2FycltpaV0uc3BsaXQoJzonKTtcbiAgICAgICAgICBwID0gW3BbMF0sIHAuc2xpY2UoMSkuam9pbignOicpXTtcblxuICAgICAgICAgIGlmICgvdHJ1ZS9pLnRlc3QocFsxXSkpIHtcbiAgICAgICAgICAgIHBbMV0gPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoL2ZhbHNlL2kudGVzdChwWzFdKSkge1xuICAgICAgICAgICAgcFsxXSA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaXNOdW1iZXIocFsxXSkpIHtcbiAgICAgICAgICAgIGlmIChwWzFdLmluZGV4T2YoJy4nKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgcFsxXSA9IHBhcnNlSW50KHBbMV0sIDEwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHBbMV0gPSBwYXJzZUZsb2F0KHBbMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChwLmxlbmd0aCA9PT0gMiAmJiBwWzBdLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIG9wdHNbdHJpbShwWzBdKV0gPSB0cmltKHBbMV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvcHRzO1xuICAgICAgfSxcblxuICAgICAgLy8gRGVzY3JpcHRpb246XG4gICAgICAvLyAgICBBZGRzIEpTLXJlY29nbml6YWJsZSBtZWRpYSBxdWVyaWVzXG4gICAgICAvL1xuICAgICAgLy8gQXJndW1lbnRzOlxuICAgICAgLy8gICAgTWVkaWEgKFN0cmluZyk6IEtleSBzdHJpbmcgZm9yIHRoZSBtZWRpYSBxdWVyeSB0byBiZSBzdG9yZWQgYXMgaW5cbiAgICAgIC8vICAgIEZvdW5kYXRpb24ubWVkaWFfcXVlcmllc1xuICAgICAgLy9cbiAgICAgIC8vICAgIENsYXNzIChTdHJpbmcpOiBDbGFzcyBuYW1lIGZvciB0aGUgZ2VuZXJhdGVkIDxtZXRhPiB0YWdcbiAgICAgIHJlZ2lzdGVyX21lZGlhIDogZnVuY3Rpb24gKG1lZGlhLCBtZWRpYV9jbGFzcykge1xuICAgICAgICBpZiAoRm91bmRhdGlvbi5tZWRpYV9xdWVyaWVzW21lZGlhXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgJCgnaGVhZCcpLmFwcGVuZCgnPG1ldGEgY2xhc3M9XCInICsgbWVkaWFfY2xhc3MgKyAnXCIvPicpO1xuICAgICAgICAgIEZvdW5kYXRpb24ubWVkaWFfcXVlcmllc1ttZWRpYV0gPSByZW1vdmVRdW90ZXMoJCgnLicgKyBtZWRpYV9jbGFzcykuY3NzKCdmb250LWZhbWlseScpKTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgLy8gRGVzY3JpcHRpb246XG4gICAgICAvLyAgICBBZGQgY3VzdG9tIENTUyB3aXRoaW4gYSBKUy1kZWZpbmVkIG1lZGlhIHF1ZXJ5XG4gICAgICAvL1xuICAgICAgLy8gQXJndW1lbnRzOlxuICAgICAgLy8gICAgUnVsZSAoU3RyaW5nKTogQ1NTIHJ1bGUgdG8gYmUgYXBwZW5kZWQgdG8gdGhlIGRvY3VtZW50LlxuICAgICAgLy9cbiAgICAgIC8vICAgIE1lZGlhIChTdHJpbmcpOiBPcHRpb25hbCBtZWRpYSBxdWVyeSBzdHJpbmcgZm9yIHRoZSBDU1MgcnVsZSB0byBiZVxuICAgICAgLy8gICAgbmVzdGVkIHVuZGVyLlxuICAgICAgYWRkX2N1c3RvbV9ydWxlIDogZnVuY3Rpb24gKHJ1bGUsIG1lZGlhKSB7XG4gICAgICAgIGlmIChtZWRpYSA9PT0gdW5kZWZpbmVkICYmIEZvdW5kYXRpb24uc3R5bGVzaGVldCkge1xuICAgICAgICAgIEZvdW5kYXRpb24uc3R5bGVzaGVldC5pbnNlcnRSdWxlKHJ1bGUsIEZvdW5kYXRpb24uc3R5bGVzaGVldC5jc3NSdWxlcy5sZW5ndGgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBxdWVyeSA9IEZvdW5kYXRpb24ubWVkaWFfcXVlcmllc1ttZWRpYV07XG5cbiAgICAgICAgICBpZiAocXVlcnkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgRm91bmRhdGlvbi5zdHlsZXNoZWV0Lmluc2VydFJ1bGUoJ0BtZWRpYSAnICtcbiAgICAgICAgICAgICAgRm91bmRhdGlvbi5tZWRpYV9xdWVyaWVzW21lZGlhXSArICd7ICcgKyBydWxlICsgJyB9JywgRm91bmRhdGlvbi5zdHlsZXNoZWV0LmNzc1J1bGVzLmxlbmd0aCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICAvLyBEZXNjcmlwdGlvbjpcbiAgICAgIC8vICAgIFBlcmZvcm1zIGEgY2FsbGJhY2sgZnVuY3Rpb24gd2hlbiBhbiBpbWFnZSBpcyBmdWxseSBsb2FkZWRcbiAgICAgIC8vXG4gICAgICAvLyBBcmd1bWVudHM6XG4gICAgICAvLyAgICBJbWFnZSAoalF1ZXJ5IE9iamVjdCk6IEltYWdlKHMpIHRvIGNoZWNrIGlmIGxvYWRlZC5cbiAgICAgIC8vXG4gICAgICAvLyAgICBDYWxsYmFjayAoRnVuY3Rpb24pOiBGdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gaW1hZ2UgaXMgZnVsbHkgbG9hZGVkLlxuICAgICAgaW1hZ2VfbG9hZGVkIDogZnVuY3Rpb24gKGltYWdlcywgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgdW5sb2FkZWQgPSBpbWFnZXMubGVuZ3RoO1xuXG4gICAgICAgIGZ1bmN0aW9uIHBpY3R1cmVzX2hhc19oZWlnaHQoaW1hZ2VzKSB7XG4gICAgICAgICAgdmFyIHBpY3R1cmVzX251bWJlciA9IGltYWdlcy5sZW5ndGg7XG5cbiAgICAgICAgICBmb3IgKHZhciBpID0gcGljdHVyZXNfbnVtYmVyIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIGlmKGltYWdlcy5hdHRyKCdoZWlnaHQnKSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHVubG9hZGVkID09PSAwIHx8IHBpY3R1cmVzX2hhc19oZWlnaHQoaW1hZ2VzKSkge1xuICAgICAgICAgIGNhbGxiYWNrKGltYWdlcyk7XG4gICAgICAgIH1cblxuICAgICAgICBpbWFnZXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgc2luZ2xlX2ltYWdlX2xvYWRlZChzZWxmLlModGhpcyksIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHVubG9hZGVkIC09IDE7XG4gICAgICAgICAgICBpZiAodW5sb2FkZWQgPT09IDApIHtcbiAgICAgICAgICAgICAgY2FsbGJhY2soaW1hZ2VzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuXG4gICAgICAvLyBEZXNjcmlwdGlvbjpcbiAgICAgIC8vICAgIFJldHVybnMgYSByYW5kb20sIGFscGhhbnVtZXJpYyBzdHJpbmdcbiAgICAgIC8vXG4gICAgICAvLyBBcmd1bWVudHM6XG4gICAgICAvLyAgICBMZW5ndGggKEludGVnZXIpOiBMZW5ndGggb2Ygc3RyaW5nIHRvIGJlIGdlbmVyYXRlZC4gRGVmYXVsdHMgdG8gcmFuZG9tXG4gICAgICAvLyAgICBpbnRlZ2VyLlxuICAgICAgLy9cbiAgICAgIC8vIFJldHVybnM6XG4gICAgICAvLyAgICBSYW5kIChTdHJpbmcpOiBQc2V1ZG8tcmFuZG9tLCBhbHBoYW51bWVyaWMgc3RyaW5nLlxuICAgICAgcmFuZG9tX3N0ciA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmZpZHgpIHtcbiAgICAgICAgICB0aGlzLmZpZHggPSAwO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucHJlZml4ID0gdGhpcy5wcmVmaXggfHwgWyh0aGlzLm5hbWUgfHwgJ0YnKSwgKCtuZXcgRGF0ZSkudG9TdHJpbmcoMzYpXS5qb2luKCctJyk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMucHJlZml4ICsgKHRoaXMuZmlkeCsrKS50b1N0cmluZygzNik7XG4gICAgICB9LFxuXG4gICAgICAvLyBEZXNjcmlwdGlvbjpcbiAgICAgIC8vICAgIEhlbHBlciBmb3Igd2luZG93Lm1hdGNoTWVkaWFcbiAgICAgIC8vXG4gICAgICAvLyBBcmd1bWVudHM6XG4gICAgICAvLyAgICBtcSAoU3RyaW5nKTogTWVkaWEgcXVlcnlcbiAgICAgIC8vXG4gICAgICAvLyBSZXR1cm5zOlxuICAgICAgLy8gICAgKEJvb2xlYW4pOiBXaGV0aGVyIHRoZSBtZWRpYSBxdWVyeSBwYXNzZXMgb3Igbm90XG4gICAgICBtYXRjaCA6IGZ1bmN0aW9uIChtcSkge1xuICAgICAgICByZXR1cm4gd2luZG93Lm1hdGNoTWVkaWEobXEpLm1hdGNoZXM7XG4gICAgICB9LFxuXG4gICAgICAvLyBEZXNjcmlwdGlvbjpcbiAgICAgIC8vICAgIEhlbHBlcnMgZm9yIGNoZWNraW5nIEZvdW5kYXRpb24gZGVmYXVsdCBtZWRpYSBxdWVyaWVzIHdpdGggSlNcbiAgICAgIC8vXG4gICAgICAvLyBSZXR1cm5zOlxuICAgICAgLy8gICAgKEJvb2xlYW4pOiBXaGV0aGVyIHRoZSBtZWRpYSBxdWVyeSBwYXNzZXMgb3Igbm90XG5cbiAgICAgIGlzX3NtYWxsX3VwIDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXRjaChGb3VuZGF0aW9uLm1lZGlhX3F1ZXJpZXMuc21hbGwpO1xuICAgICAgfSxcblxuICAgICAgaXNfbWVkaXVtX3VwIDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXRjaChGb3VuZGF0aW9uLm1lZGlhX3F1ZXJpZXMubWVkaXVtKTtcbiAgICAgIH0sXG5cbiAgICAgIGlzX2xhcmdlX3VwIDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXRjaChGb3VuZGF0aW9uLm1lZGlhX3F1ZXJpZXMubGFyZ2UpO1xuICAgICAgfSxcblxuICAgICAgaXNfeGxhcmdlX3VwIDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXRjaChGb3VuZGF0aW9uLm1lZGlhX3F1ZXJpZXMueGxhcmdlKTtcbiAgICAgIH0sXG5cbiAgICAgIGlzX3h4bGFyZ2VfdXAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hdGNoKEZvdW5kYXRpb24ubWVkaWFfcXVlcmllcy54eGxhcmdlKTtcbiAgICAgIH0sXG5cbiAgICAgIGlzX3NtYWxsX29ubHkgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAhdGhpcy5pc19tZWRpdW1fdXAoKSAmJiAhdGhpcy5pc19sYXJnZV91cCgpICYmICF0aGlzLmlzX3hsYXJnZV91cCgpICYmICF0aGlzLmlzX3h4bGFyZ2VfdXAoKTtcbiAgICAgIH0sXG5cbiAgICAgIGlzX21lZGl1bV9vbmx5IDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc19tZWRpdW1fdXAoKSAmJiAhdGhpcy5pc19sYXJnZV91cCgpICYmICF0aGlzLmlzX3hsYXJnZV91cCgpICYmICF0aGlzLmlzX3h4bGFyZ2VfdXAoKTtcbiAgICAgIH0sXG5cbiAgICAgIGlzX2xhcmdlX29ubHkgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzX21lZGl1bV91cCgpICYmIHRoaXMuaXNfbGFyZ2VfdXAoKSAmJiAhdGhpcy5pc194bGFyZ2VfdXAoKSAmJiAhdGhpcy5pc194eGxhcmdlX3VwKCk7XG4gICAgICB9LFxuXG4gICAgICBpc194bGFyZ2Vfb25seSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNfbWVkaXVtX3VwKCkgJiYgdGhpcy5pc19sYXJnZV91cCgpICYmIHRoaXMuaXNfeGxhcmdlX3VwKCkgJiYgIXRoaXMuaXNfeHhsYXJnZV91cCgpO1xuICAgICAgfSxcblxuICAgICAgaXNfeHhsYXJnZV9vbmx5IDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc19tZWRpdW1fdXAoKSAmJiB0aGlzLmlzX2xhcmdlX3VwKCkgJiYgdGhpcy5pc194bGFyZ2VfdXAoKSAmJiB0aGlzLmlzX3h4bGFyZ2VfdXAoKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgJC5mbi5mb3VuZGF0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKTtcblxuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgRm91bmRhdGlvbi5pbml0LmFwcGx5KEZvdW5kYXRpb24sIFt0aGlzXS5jb25jYXQoYXJncykpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSk7XG4gIH07XG5cbn0oalF1ZXJ5LCB3aW5kb3csIHdpbmRvdy5kb2N1bWVudCkpO1xuIiwiOyhmdW5jdGlvbiAoJCwgd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBGb3VuZGF0aW9uLmxpYnMudG9wYmFyID0ge1xuICAgIG5hbWUgOiAndG9wYmFyJyxcblxuICAgIHZlcnNpb24gOiAnNS41LjInLFxuXG4gICAgc2V0dGluZ3MgOiB7XG4gICAgICBpbmRleCA6IDAsXG4gICAgICBzdGFydF9vZmZzZXQgOiAwLFxuICAgICAgc3RpY2t5X2NsYXNzIDogJ3N0aWNreScsXG4gICAgICBjdXN0b21fYmFja190ZXh0IDogdHJ1ZSxcbiAgICAgIGJhY2tfdGV4dCA6ICdCYWNrJyxcbiAgICAgIG1vYmlsZV9zaG93X3BhcmVudF9saW5rIDogdHJ1ZSxcbiAgICAgIGlzX2hvdmVyIDogdHJ1ZSxcbiAgICAgIHNjcm9sbHRvcCA6IHRydWUsIC8vIGp1bXAgdG8gdG9wIHdoZW4gc3RpY2t5IG5hdiBtZW51IHRvZ2dsZSBpcyBjbGlja2VkXG4gICAgICBzdGlja3lfb24gOiAnYWxsJyxcbiAgICAgIGRyb3Bkb3duX2F1dG9jbG9zZTogdHJ1ZVxuICAgIH0sXG5cbiAgICBpbml0IDogZnVuY3Rpb24gKHNlY3Rpb24sIG1ldGhvZCwgb3B0aW9ucykge1xuICAgICAgRm91bmRhdGlvbi5pbmhlcml0KHRoaXMsICdhZGRfY3VzdG9tX3J1bGUgcmVnaXN0ZXJfbWVkaWEgdGhyb3R0bGUnKTtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgc2VsZi5yZWdpc3Rlcl9tZWRpYSgndG9wYmFyJywgJ2ZvdW5kYXRpb24tbXEtdG9wYmFyJyk7XG5cbiAgICAgIHRoaXMuYmluZGluZ3MobWV0aG9kLCBvcHRpb25zKTtcblxuICAgICAgc2VsZi5TKCdbJyArIHRoaXMuYXR0cl9uYW1lKCkgKyAnXScsIHRoaXMuc2NvcGUpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdG9wYmFyID0gJCh0aGlzKSxcbiAgICAgICAgICAgIHNldHRpbmdzID0gdG9wYmFyLmRhdGEoc2VsZi5hdHRyX25hbWUodHJ1ZSkgKyAnLWluaXQnKSxcbiAgICAgICAgICAgIHNlY3Rpb24gPSBzZWxmLlMoJ3NlY3Rpb24sIC50b3AtYmFyLXNlY3Rpb24nLCB0aGlzKTtcbiAgICAgICAgdG9wYmFyLmRhdGEoJ2luZGV4JywgMCk7XG4gICAgICAgIHZhciB0b3BiYXJDb250YWluZXIgPSB0b3BiYXIucGFyZW50KCk7XG4gICAgICAgIGlmICh0b3BiYXJDb250YWluZXIuaGFzQ2xhc3MoJ2ZpeGVkJykgfHwgc2VsZi5pc19zdGlja3kodG9wYmFyLCB0b3BiYXJDb250YWluZXIsIHNldHRpbmdzKSApIHtcbiAgICAgICAgICBzZWxmLnNldHRpbmdzLnN0aWNreV9jbGFzcyA9IHNldHRpbmdzLnN0aWNreV9jbGFzcztcbiAgICAgICAgICBzZWxmLnNldHRpbmdzLnN0aWNreV90b3BiYXIgPSB0b3BiYXI7XG4gICAgICAgICAgdG9wYmFyLmRhdGEoJ2hlaWdodCcsIHRvcGJhckNvbnRhaW5lci5vdXRlckhlaWdodCgpKTtcbiAgICAgICAgICB0b3BiYXIuZGF0YSgnc3RpY2t5b2Zmc2V0JywgdG9wYmFyQ29udGFpbmVyLm9mZnNldCgpLnRvcCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG9wYmFyLmRhdGEoJ2hlaWdodCcsIHRvcGJhci5vdXRlckhlaWdodCgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghc2V0dGluZ3MuYXNzZW1ibGVkKSB7XG4gICAgICAgICAgc2VsZi5hc3NlbWJsZSh0b3BiYXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNldHRpbmdzLmlzX2hvdmVyKSB7XG4gICAgICAgICAgc2VsZi5TKCcuaGFzLWRyb3Bkb3duJywgdG9wYmFyKS5hZGRDbGFzcygnbm90LWNsaWNrJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VsZi5TKCcuaGFzLWRyb3Bkb3duJywgdG9wYmFyKS5yZW1vdmVDbGFzcygnbm90LWNsaWNrJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBQYWQgYm9keSB3aGVuIHN0aWNreSAoc2Nyb2xsZWQpIG9yIGZpeGVkLlxuICAgICAgICBzZWxmLmFkZF9jdXN0b21fcnVsZSgnLmYtdG9wYmFyLWZpeGVkIHsgcGFkZGluZy10b3A6ICcgKyB0b3BiYXIuZGF0YSgnaGVpZ2h0JykgKyAncHggfScpO1xuXG4gICAgICAgIGlmICh0b3BiYXJDb250YWluZXIuaGFzQ2xhc3MoJ2ZpeGVkJykpIHtcbiAgICAgICAgICBzZWxmLlMoJ2JvZHknKS5hZGRDbGFzcygnZi10b3BiYXItZml4ZWQnKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICB9LFxuXG4gICAgaXNfc3RpY2t5IDogZnVuY3Rpb24gKHRvcGJhciwgdG9wYmFyQ29udGFpbmVyLCBzZXR0aW5ncykge1xuICAgICAgdmFyIHN0aWNreSAgICAgPSB0b3BiYXJDb250YWluZXIuaGFzQ2xhc3Moc2V0dGluZ3Muc3RpY2t5X2NsYXNzKTtcbiAgICAgIHZhciBzbWFsbE1hdGNoID0gbWF0Y2hNZWRpYShGb3VuZGF0aW9uLm1lZGlhX3F1ZXJpZXMuc21hbGwpLm1hdGNoZXM7XG4gICAgICB2YXIgbWVkTWF0Y2ggICA9IG1hdGNoTWVkaWEoRm91bmRhdGlvbi5tZWRpYV9xdWVyaWVzLm1lZGl1bSkubWF0Y2hlcztcbiAgICAgIHZhciBscmdNYXRjaCAgID0gbWF0Y2hNZWRpYShGb3VuZGF0aW9uLm1lZGlhX3F1ZXJpZXMubGFyZ2UpLm1hdGNoZXM7XG5cbiAgICAgIGlmIChzdGlja3kgJiYgc2V0dGluZ3Muc3RpY2t5X29uID09PSAnYWxsJykge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmIChzdGlja3kgJiYgdGhpcy5zbWFsbCgpICYmIHNldHRpbmdzLnN0aWNreV9vbi5pbmRleE9mKCdzbWFsbCcpICE9PSAtMSkge1xuICAgICAgICBpZiAoc21hbGxNYXRjaCAmJiAhbWVkTWF0Y2ggJiYgIWxyZ01hdGNoKSB7IHJldHVybiB0cnVlOyB9XG4gICAgICB9XG4gICAgICBpZiAoc3RpY2t5ICYmIHRoaXMubWVkaXVtKCkgJiYgc2V0dGluZ3Muc3RpY2t5X29uLmluZGV4T2YoJ21lZGl1bScpICE9PSAtMSkge1xuICAgICAgICBpZiAoc21hbGxNYXRjaCAmJiBtZWRNYXRjaCAmJiAhbHJnTWF0Y2gpIHsgcmV0dXJuIHRydWU7IH1cbiAgICAgIH1cbiAgICAgIGlmIChzdGlja3kgJiYgdGhpcy5sYXJnZSgpICYmIHNldHRpbmdzLnN0aWNreV9vbi5pbmRleE9mKCdsYXJnZScpICE9PSAtMSkge1xuICAgICAgICBpZiAoc21hbGxNYXRjaCAmJiBtZWRNYXRjaCAmJiBscmdNYXRjaCkgeyByZXR1cm4gdHJ1ZTsgfVxuICAgICAgfVxuXG4gICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICB0b2dnbGUgOiBmdW5jdGlvbiAodG9nZ2xlRWwpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICB0b3BiYXI7XG5cbiAgICAgIGlmICh0b2dnbGVFbCkge1xuICAgICAgICB0b3BiYXIgPSBzZWxmLlModG9nZ2xlRWwpLmNsb3Nlc3QoJ1snICsgdGhpcy5hdHRyX25hbWUoKSArICddJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0b3BiYXIgPSBzZWxmLlMoJ1snICsgdGhpcy5hdHRyX25hbWUoKSArICddJyk7XG4gICAgICB9XG5cbiAgICAgIHZhciBzZXR0aW5ncyA9IHRvcGJhci5kYXRhKHRoaXMuYXR0cl9uYW1lKHRydWUpICsgJy1pbml0Jyk7XG5cbiAgICAgIHZhciBzZWN0aW9uID0gc2VsZi5TKCdzZWN0aW9uLCAudG9wLWJhci1zZWN0aW9uJywgdG9wYmFyKTtcblxuICAgICAgaWYgKHNlbGYuYnJlYWtwb2ludCgpKSB7XG4gICAgICAgIGlmICghc2VsZi5ydGwpIHtcbiAgICAgICAgICBzZWN0aW9uLmNzcyh7bGVmdCA6ICcwJSd9KTtcbiAgICAgICAgICAkKCc+Lm5hbWUnLCBzZWN0aW9uKS5jc3Moe2xlZnQgOiAnMTAwJSd9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZWN0aW9uLmNzcyh7cmlnaHQgOiAnMCUnfSk7XG4gICAgICAgICAgJCgnPi5uYW1lJywgc2VjdGlvbikuY3NzKHtyaWdodCA6ICcxMDAlJ30pO1xuICAgICAgICB9XG5cbiAgICAgICAgc2VsZi5TKCdsaS5tb3ZlZCcsIHNlY3Rpb24pLnJlbW92ZUNsYXNzKCdtb3ZlZCcpO1xuICAgICAgICB0b3BiYXIuZGF0YSgnaW5kZXgnLCAwKTtcblxuICAgICAgICB0b3BiYXJcbiAgICAgICAgICAudG9nZ2xlQ2xhc3MoJ2V4cGFuZGVkJylcbiAgICAgICAgICAuY3NzKCdoZWlnaHQnLCAnJyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChzZXR0aW5ncy5zY3JvbGx0b3ApIHtcbiAgICAgICAgaWYgKCF0b3BiYXIuaGFzQ2xhc3MoJ2V4cGFuZGVkJykpIHtcbiAgICAgICAgICBpZiAodG9wYmFyLmhhc0NsYXNzKCdmaXhlZCcpKSB7XG4gICAgICAgICAgICB0b3BiYXIucGFyZW50KCkuYWRkQ2xhc3MoJ2ZpeGVkJyk7XG4gICAgICAgICAgICB0b3BiYXIucmVtb3ZlQ2xhc3MoJ2ZpeGVkJyk7XG4gICAgICAgICAgICBzZWxmLlMoJ2JvZHknKS5hZGRDbGFzcygnZi10b3BiYXItZml4ZWQnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodG9wYmFyLnBhcmVudCgpLmhhc0NsYXNzKCdmaXhlZCcpKSB7XG4gICAgICAgICAgaWYgKHNldHRpbmdzLnNjcm9sbHRvcCkge1xuICAgICAgICAgICAgdG9wYmFyLnBhcmVudCgpLnJlbW92ZUNsYXNzKCdmaXhlZCcpO1xuICAgICAgICAgICAgdG9wYmFyLmFkZENsYXNzKCdmaXhlZCcpO1xuICAgICAgICAgICAgc2VsZi5TKCdib2R5JykucmVtb3ZlQ2xhc3MoJ2YtdG9wYmFyLWZpeGVkJyk7XG5cbiAgICAgICAgICAgIHdpbmRvdy5zY3JvbGxUbygwLCAwKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdG9wYmFyLnBhcmVudCgpLnJlbW92ZUNsYXNzKCdleHBhbmRlZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHNlbGYuaXNfc3RpY2t5KHRvcGJhciwgdG9wYmFyLnBhcmVudCgpLCBzZXR0aW5ncykpIHtcbiAgICAgICAgICB0b3BiYXIucGFyZW50KCkuYWRkQ2xhc3MoJ2ZpeGVkJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodG9wYmFyLnBhcmVudCgpLmhhc0NsYXNzKCdmaXhlZCcpKSB7XG4gICAgICAgICAgaWYgKCF0b3BiYXIuaGFzQ2xhc3MoJ2V4cGFuZGVkJykpIHtcbiAgICAgICAgICAgIHRvcGJhci5yZW1vdmVDbGFzcygnZml4ZWQnKTtcbiAgICAgICAgICAgIHRvcGJhci5wYXJlbnQoKS5yZW1vdmVDbGFzcygnZXhwYW5kZWQnKTtcbiAgICAgICAgICAgIHNlbGYudXBkYXRlX3N0aWNreV9wb3NpdGlvbmluZygpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0b3BiYXIuYWRkQ2xhc3MoJ2ZpeGVkJyk7XG4gICAgICAgICAgICB0b3BiYXIucGFyZW50KCkuYWRkQ2xhc3MoJ2V4cGFuZGVkJyk7XG4gICAgICAgICAgICBzZWxmLlMoJ2JvZHknKS5hZGRDbGFzcygnZi10b3BiYXItZml4ZWQnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgdGltZXIgOiBudWxsLFxuXG4gICAgZXZlbnRzIDogZnVuY3Rpb24gKGJhcikge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgIFMgPSB0aGlzLlM7XG5cbiAgICAgIFModGhpcy5zY29wZSlcbiAgICAgICAgLm9mZignLnRvcGJhcicpXG4gICAgICAgIC5vbignY2xpY2suZm5kdG4udG9wYmFyJywgJ1snICsgdGhpcy5hdHRyX25hbWUoKSArICddIC50b2dnbGUtdG9wYmFyJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgc2VsZi50b2dnbGUodGhpcyk7XG4gICAgICAgIH0pXG4gICAgICAgIC5vbignY2xpY2suZm5kdG4udG9wYmFyIGNvbnRleHRtZW51LmZuZHRuLnRvcGJhcicsICcudG9wLWJhciAudG9wLWJhci1zZWN0aW9uIGxpIGFbaHJlZl49XCIjXCJdLFsnICsgdGhpcy5hdHRyX25hbWUoKSArICddIC50b3AtYmFyLXNlY3Rpb24gbGkgYVtocmVmXj1cIiNcIl0nLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyIGxpID0gJCh0aGlzKS5jbG9zZXN0KCdsaScpLFxuICAgICAgICAgICAgICAgIHRvcGJhciA9IGxpLmNsb3Nlc3QoJ1snICsgc2VsZi5hdHRyX25hbWUoKSArICddJyksXG4gICAgICAgICAgICAgICAgc2V0dGluZ3MgPSB0b3BiYXIuZGF0YShzZWxmLmF0dHJfbmFtZSh0cnVlKSArICctaW5pdCcpO1xuXG4gICAgICAgICAgICBpZiAoc2V0dGluZ3MuZHJvcGRvd25fYXV0b2Nsb3NlICYmIHNldHRpbmdzLmlzX2hvdmVyKSB7XG4gICAgICAgICAgICAgIHZhciBob3ZlckxpID0gJCh0aGlzKS5jbG9zZXN0KCcuaG92ZXInKTtcbiAgICAgICAgICAgICAgaG92ZXJMaS5yZW1vdmVDbGFzcygnaG92ZXInKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzZWxmLmJyZWFrcG9pbnQoKSAmJiAhbGkuaGFzQ2xhc3MoJ2JhY2snKSAmJiAhbGkuaGFzQ2xhc3MoJ2hhcy1kcm9wZG93bicpKSB7XG4gICAgICAgICAgICAgIHNlbGYudG9nZ2xlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSlcbiAgICAgICAgLm9uKCdjbGljay5mbmR0bi50b3BiYXInLCAnWycgKyB0aGlzLmF0dHJfbmFtZSgpICsgJ10gbGkuaGFzLWRyb3Bkb3duJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICB2YXIgbGkgPSBTKHRoaXMpLFxuICAgICAgICAgICAgICB0YXJnZXQgPSBTKGUudGFyZ2V0KSxcbiAgICAgICAgICAgICAgdG9wYmFyID0gbGkuY2xvc2VzdCgnWycgKyBzZWxmLmF0dHJfbmFtZSgpICsgJ10nKSxcbiAgICAgICAgICAgICAgc2V0dGluZ3MgPSB0b3BiYXIuZGF0YShzZWxmLmF0dHJfbmFtZSh0cnVlKSArICctaW5pdCcpO1xuXG4gICAgICAgICAgaWYgKHRhcmdldC5kYXRhKCdyZXZlYWxJZCcpKSB7XG4gICAgICAgICAgICBzZWxmLnRvZ2dsZSgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzZWxmLmJyZWFrcG9pbnQoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzZXR0aW5ncy5pc19ob3ZlciAmJiAhTW9kZXJuaXpyLnRvdWNoKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcblxuICAgICAgICAgIGlmIChsaS5oYXNDbGFzcygnaG92ZXInKSkge1xuICAgICAgICAgICAgbGlcbiAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdob3ZlcicpXG4gICAgICAgICAgICAgIC5maW5kKCdsaScpXG4gICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnaG92ZXInKTtcblxuICAgICAgICAgICAgbGkucGFyZW50cygnbGkuaG92ZXInKVxuICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ2hvdmVyJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxpLmFkZENsYXNzKCdob3ZlcicpO1xuXG4gICAgICAgICAgICAkKGxpKS5zaWJsaW5ncygpLnJlbW92ZUNsYXNzKCdob3ZlcicpO1xuXG4gICAgICAgICAgICBpZiAodGFyZ2V0WzBdLm5vZGVOYW1lID09PSAnQScgJiYgdGFyZ2V0LnBhcmVudCgpLmhhc0NsYXNzKCdoYXMtZHJvcGRvd24nKSkge1xuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAub24oJ2NsaWNrLmZuZHRuLnRvcGJhcicsICdbJyArIHRoaXMuYXR0cl9uYW1lKCkgKyAnXSAuaGFzLWRyb3Bkb3duPmEnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIGlmIChzZWxmLmJyZWFrcG9pbnQoKSkge1xuXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgIHZhciAkdGhpcyA9IFModGhpcyksXG4gICAgICAgICAgICAgICAgdG9wYmFyID0gJHRoaXMuY2xvc2VzdCgnWycgKyBzZWxmLmF0dHJfbmFtZSgpICsgJ10nKSxcbiAgICAgICAgICAgICAgICBzZWN0aW9uID0gdG9wYmFyLmZpbmQoJ3NlY3Rpb24sIC50b3AtYmFyLXNlY3Rpb24nKSxcbiAgICAgICAgICAgICAgICBkcm9wZG93bkhlaWdodCA9ICR0aGlzLm5leHQoJy5kcm9wZG93bicpLm91dGVySGVpZ2h0KCksXG4gICAgICAgICAgICAgICAgJHNlbGVjdGVkTGkgPSAkdGhpcy5jbG9zZXN0KCdsaScpO1xuXG4gICAgICAgICAgICB0b3BiYXIuZGF0YSgnaW5kZXgnLCB0b3BiYXIuZGF0YSgnaW5kZXgnKSArIDEpO1xuICAgICAgICAgICAgJHNlbGVjdGVkTGkuYWRkQ2xhc3MoJ21vdmVkJyk7XG5cbiAgICAgICAgICAgIGlmICghc2VsZi5ydGwpIHtcbiAgICAgICAgICAgICAgc2VjdGlvbi5jc3Moe2xlZnQgOiAtKDEwMCAqIHRvcGJhci5kYXRhKCdpbmRleCcpKSArICclJ30pO1xuICAgICAgICAgICAgICBzZWN0aW9uLmZpbmQoJz4ubmFtZScpLmNzcyh7bGVmdCA6IDEwMCAqIHRvcGJhci5kYXRhKCdpbmRleCcpICsgJyUnfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzZWN0aW9uLmNzcyh7cmlnaHQgOiAtKDEwMCAqIHRvcGJhci5kYXRhKCdpbmRleCcpKSArICclJ30pO1xuICAgICAgICAgICAgICBzZWN0aW9uLmZpbmQoJz4ubmFtZScpLmNzcyh7cmlnaHQgOiAxMDAgKiB0b3BiYXIuZGF0YSgnaW5kZXgnKSArICclJ30pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0b3BiYXIuY3NzKCdoZWlnaHQnLCAkdGhpcy5zaWJsaW5ncygndWwnKS5vdXRlckhlaWdodCh0cnVlKSArIHRvcGJhci5kYXRhKCdoZWlnaHQnKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgUyh3aW5kb3cpLm9mZignLnRvcGJhcicpLm9uKCdyZXNpemUuZm5kdG4udG9wYmFyJywgc2VsZi50aHJvdHRsZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgc2VsZi5yZXNpemUuY2FsbChzZWxmKTtcbiAgICAgIH0sIDUwKSkudHJpZ2dlcigncmVzaXplLmZuZHRuLnRvcGJhcicpLmxvYWQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIC8vIEVuc3VyZSB0aGF0IHRoZSBvZmZzZXQgaXMgY2FsY3VsYXRlZCBhZnRlciBhbGwgb2YgdGhlIHBhZ2VzIHJlc291cmNlcyBoYXZlIGxvYWRlZFxuICAgICAgICAgIFModGhpcykudHJpZ2dlcigncmVzaXplLmZuZHRuLnRvcGJhcicpO1xuICAgICAgfSk7XG5cbiAgICAgIFMoJ2JvZHknKS5vZmYoJy50b3BiYXInKS5vbignY2xpY2suZm5kdG4udG9wYmFyJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgdmFyIHBhcmVudCA9IFMoZS50YXJnZXQpLmNsb3Nlc3QoJ2xpJykuY2xvc2VzdCgnbGkuaG92ZXInKTtcblxuICAgICAgICBpZiAocGFyZW50Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBTKCdbJyArIHNlbGYuYXR0cl9uYW1lKCkgKyAnXSBsaS5ob3ZlcicpLnJlbW92ZUNsYXNzKCdob3ZlcicpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIEdvIHVwIGEgbGV2ZWwgb24gQ2xpY2tcbiAgICAgIFModGhpcy5zY29wZSkub24oJ2NsaWNrLmZuZHRuLnRvcGJhcicsICdbJyArIHRoaXMuYXR0cl9uYW1lKCkgKyAnXSAuaGFzLWRyb3Bkb3duIC5iYWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIHZhciAkdGhpcyA9IFModGhpcyksXG4gICAgICAgICAgICB0b3BiYXIgPSAkdGhpcy5jbG9zZXN0KCdbJyArIHNlbGYuYXR0cl9uYW1lKCkgKyAnXScpLFxuICAgICAgICAgICAgc2VjdGlvbiA9IHRvcGJhci5maW5kKCdzZWN0aW9uLCAudG9wLWJhci1zZWN0aW9uJyksXG4gICAgICAgICAgICBzZXR0aW5ncyA9IHRvcGJhci5kYXRhKHNlbGYuYXR0cl9uYW1lKHRydWUpICsgJy1pbml0JyksXG4gICAgICAgICAgICAkbW92ZWRMaSA9ICR0aGlzLmNsb3Nlc3QoJ2xpLm1vdmVkJyksXG4gICAgICAgICAgICAkcHJldmlvdXNMZXZlbFVsID0gJG1vdmVkTGkucGFyZW50KCk7XG5cbiAgICAgICAgdG9wYmFyLmRhdGEoJ2luZGV4JywgdG9wYmFyLmRhdGEoJ2luZGV4JykgLSAxKTtcblxuICAgICAgICBpZiAoIXNlbGYucnRsKSB7XG4gICAgICAgICAgc2VjdGlvbi5jc3Moe2xlZnQgOiAtKDEwMCAqIHRvcGJhci5kYXRhKCdpbmRleCcpKSArICclJ30pO1xuICAgICAgICAgIHNlY3Rpb24uZmluZCgnPi5uYW1lJykuY3NzKHtsZWZ0IDogMTAwICogdG9wYmFyLmRhdGEoJ2luZGV4JykgKyAnJSd9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZWN0aW9uLmNzcyh7cmlnaHQgOiAtKDEwMCAqIHRvcGJhci5kYXRhKCdpbmRleCcpKSArICclJ30pO1xuICAgICAgICAgIHNlY3Rpb24uZmluZCgnPi5uYW1lJykuY3NzKHtyaWdodCA6IDEwMCAqIHRvcGJhci5kYXRhKCdpbmRleCcpICsgJyUnfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodG9wYmFyLmRhdGEoJ2luZGV4JykgPT09IDApIHtcbiAgICAgICAgICB0b3BiYXIuY3NzKCdoZWlnaHQnLCAnJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG9wYmFyLmNzcygnaGVpZ2h0JywgJHByZXZpb3VzTGV2ZWxVbC5vdXRlckhlaWdodCh0cnVlKSArIHRvcGJhci5kYXRhKCdoZWlnaHQnKSk7XG4gICAgICAgIH1cblxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAkbW92ZWRMaS5yZW1vdmVDbGFzcygnbW92ZWQnKTtcbiAgICAgICAgfSwgMzAwKTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBTaG93IGRyb3Bkb3duIG1lbnVzIHdoZW4gdGhlaXIgaXRlbXMgYXJlIGZvY3VzZWRcbiAgICAgIFModGhpcy5zY29wZSkuZmluZCgnLmRyb3Bkb3duIGEnKVxuICAgICAgICAuZm9jdXMoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICQodGhpcykucGFyZW50cygnLmhhcy1kcm9wZG93bicpLmFkZENsYXNzKCdob3ZlcicpO1xuICAgICAgICB9KVxuICAgICAgICAuYmx1cihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgJCh0aGlzKS5wYXJlbnRzKCcuaGFzLWRyb3Bkb3duJykucmVtb3ZlQ2xhc3MoJ2hvdmVyJyk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICByZXNpemUgOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICBzZWxmLlMoJ1snICsgdGhpcy5hdHRyX25hbWUoKSArICddJykuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB0b3BiYXIgPSBzZWxmLlModGhpcyksXG4gICAgICAgICAgICBzZXR0aW5ncyA9IHRvcGJhci5kYXRhKHNlbGYuYXR0cl9uYW1lKHRydWUpICsgJy1pbml0Jyk7XG5cbiAgICAgICAgdmFyIHN0aWNreUNvbnRhaW5lciA9IHRvcGJhci5wYXJlbnQoJy4nICsgc2VsZi5zZXR0aW5ncy5zdGlja3lfY2xhc3MpO1xuICAgICAgICB2YXIgc3RpY2t5T2Zmc2V0O1xuXG4gICAgICAgIGlmICghc2VsZi5icmVha3BvaW50KCkpIHtcbiAgICAgICAgICB2YXIgZG9Ub2dnbGUgPSB0b3BiYXIuaGFzQ2xhc3MoJ2V4cGFuZGVkJyk7XG4gICAgICAgICAgdG9wYmFyXG4gICAgICAgICAgICAuY3NzKCdoZWlnaHQnLCAnJylcbiAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnZXhwYW5kZWQnKVxuICAgICAgICAgICAgLmZpbmQoJ2xpJylcbiAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnaG92ZXInKTtcblxuICAgICAgICAgICAgaWYgKGRvVG9nZ2xlKSB7XG4gICAgICAgICAgICAgIHNlbGYudG9nZ2xlKHRvcGJhcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2VsZi5pc19zdGlja3kodG9wYmFyLCBzdGlja3lDb250YWluZXIsIHNldHRpbmdzKSkge1xuICAgICAgICAgIGlmIChzdGlja3lDb250YWluZXIuaGFzQ2xhc3MoJ2ZpeGVkJykpIHtcbiAgICAgICAgICAgIC8vIFJlbW92ZSB0aGUgZml4ZWQgdG8gYWxsb3cgZm9yIGNvcnJlY3QgY2FsY3VsYXRpb24gb2YgdGhlIG9mZnNldC5cbiAgICAgICAgICAgIHN0aWNreUNvbnRhaW5lci5yZW1vdmVDbGFzcygnZml4ZWQnKTtcblxuICAgICAgICAgICAgc3RpY2t5T2Zmc2V0ID0gc3RpY2t5Q29udGFpbmVyLm9mZnNldCgpLnRvcDtcbiAgICAgICAgICAgIGlmIChzZWxmLlMoZG9jdW1lbnQuYm9keSkuaGFzQ2xhc3MoJ2YtdG9wYmFyLWZpeGVkJykpIHtcbiAgICAgICAgICAgICAgc3RpY2t5T2Zmc2V0IC09IHRvcGJhci5kYXRhKCdoZWlnaHQnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdG9wYmFyLmRhdGEoJ3N0aWNreW9mZnNldCcsIHN0aWNreU9mZnNldCk7XG4gICAgICAgICAgICBzdGlja3lDb250YWluZXIuYWRkQ2xhc3MoJ2ZpeGVkJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0aWNreU9mZnNldCA9IHN0aWNreUNvbnRhaW5lci5vZmZzZXQoKS50b3A7XG4gICAgICAgICAgICB0b3BiYXIuZGF0YSgnc3RpY2t5b2Zmc2V0Jywgc3RpY2t5T2Zmc2V0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGJyZWFrcG9pbnQgOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gIW1hdGNoTWVkaWEoRm91bmRhdGlvbi5tZWRpYV9xdWVyaWVzWyd0b3BiYXInXSkubWF0Y2hlcztcbiAgICB9LFxuXG4gICAgc21hbGwgOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbWF0Y2hNZWRpYShGb3VuZGF0aW9uLm1lZGlhX3F1ZXJpZXNbJ3NtYWxsJ10pLm1hdGNoZXM7XG4gICAgfSxcblxuICAgIG1lZGl1bSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBtYXRjaE1lZGlhKEZvdW5kYXRpb24ubWVkaWFfcXVlcmllc1snbWVkaXVtJ10pLm1hdGNoZXM7XG4gICAgfSxcblxuICAgIGxhcmdlIDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG1hdGNoTWVkaWEoRm91bmRhdGlvbi5tZWRpYV9xdWVyaWVzWydsYXJnZSddKS5tYXRjaGVzO1xuICAgIH0sXG5cbiAgICBhc3NlbWJsZSA6IGZ1bmN0aW9uICh0b3BiYXIpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICBzZXR0aW5ncyA9IHRvcGJhci5kYXRhKHRoaXMuYXR0cl9uYW1lKHRydWUpICsgJy1pbml0JyksXG4gICAgICAgICAgc2VjdGlvbiA9IHNlbGYuUygnc2VjdGlvbiwgLnRvcC1iYXItc2VjdGlvbicsIHRvcGJhcik7XG5cbiAgICAgIC8vIFB1bGwgZWxlbWVudCBvdXQgb2YgdGhlIERPTSBmb3IgbWFuaXB1bGF0aW9uXG4gICAgICBzZWN0aW9uLmRldGFjaCgpO1xuXG4gICAgICBzZWxmLlMoJy5oYXMtZHJvcGRvd24+YScsIHNlY3Rpb24pLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgJGxpbmsgPSBzZWxmLlModGhpcyksXG4gICAgICAgICAgICAkZHJvcGRvd24gPSAkbGluay5zaWJsaW5ncygnLmRyb3Bkb3duJyksXG4gICAgICAgICAgICB1cmwgPSAkbGluay5hdHRyKCdocmVmJyksXG4gICAgICAgICAgICAkdGl0bGVMaTtcblxuICAgICAgICBpZiAoISRkcm9wZG93bi5maW5kKCcudGl0bGUuYmFjaycpLmxlbmd0aCkge1xuXG4gICAgICAgICAgaWYgKHNldHRpbmdzLm1vYmlsZV9zaG93X3BhcmVudF9saW5rID09IHRydWUgJiYgdXJsKSB7XG4gICAgICAgICAgICAkdGl0bGVMaSA9ICQoJzxsaSBjbGFzcz1cInRpdGxlIGJhY2sganMtZ2VuZXJhdGVkXCI+PGg1PjxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMClcIj48L2E+PC9oNT48L2xpPjxsaSBjbGFzcz1cInBhcmVudC1saW5rIGhpZGUtZm9yLW1lZGl1bS11cFwiPjxhIGNsYXNzPVwicGFyZW50LWxpbmsganMtZ2VuZXJhdGVkXCIgaHJlZj1cIicgKyB1cmwgKyAnXCI+JyArICRsaW5rLmh0bWwoKSArJzwvYT48L2xpPicpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkdGl0bGVMaSA9ICQoJzxsaSBjbGFzcz1cInRpdGxlIGJhY2sganMtZ2VuZXJhdGVkXCI+PGg1PjxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMClcIj48L2E+PC9oNT4nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBDb3B5IGxpbmsgdG8gc3VibmF2XG4gICAgICAgICAgaWYgKHNldHRpbmdzLmN1c3RvbV9iYWNrX3RleHQgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgJCgnaDU+YScsICR0aXRsZUxpKS5odG1sKHNldHRpbmdzLmJhY2tfdGV4dCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQoJ2g1PmEnLCAkdGl0bGVMaSkuaHRtbCgnJmxhcXVvOyAnICsgJGxpbmsuaHRtbCgpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgJGRyb3Bkb3duLnByZXBlbmQoJHRpdGxlTGkpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gUHV0IGVsZW1lbnQgYmFjayBpbiB0aGUgRE9NXG4gICAgICBzZWN0aW9uLmFwcGVuZFRvKHRvcGJhcik7XG5cbiAgICAgIC8vIGNoZWNrIGZvciBzdGlja3lcbiAgICAgIHRoaXMuc3RpY2t5KCk7XG5cbiAgICAgIHRoaXMuYXNzZW1ibGVkKHRvcGJhcik7XG4gICAgfSxcblxuICAgIGFzc2VtYmxlZCA6IGZ1bmN0aW9uICh0b3BiYXIpIHtcbiAgICAgIHRvcGJhci5kYXRhKHRoaXMuYXR0cl9uYW1lKHRydWUpLCAkLmV4dGVuZCh7fSwgdG9wYmFyLmRhdGEodGhpcy5hdHRyX25hbWUodHJ1ZSkpLCB7YXNzZW1ibGVkIDogdHJ1ZX0pKTtcbiAgICB9LFxuXG4gICAgaGVpZ2h0IDogZnVuY3Rpb24gKHVsKSB7XG4gICAgICB2YXIgdG90YWwgPSAwLFxuICAgICAgICAgIHNlbGYgPSB0aGlzO1xuXG4gICAgICAkKCc+IGxpJywgdWwpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICB0b3RhbCArPSBzZWxmLlModGhpcykub3V0ZXJIZWlnaHQodHJ1ZSk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHRvdGFsO1xuICAgIH0sXG5cbiAgICBzdGlja3kgOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHRoaXMuUyh3aW5kb3cpLm9uKCdzY3JvbGwnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYudXBkYXRlX3N0aWNreV9wb3NpdGlvbmluZygpO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIHVwZGF0ZV9zdGlja3lfcG9zaXRpb25pbmcgOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIga2xhc3MgPSAnLicgKyB0aGlzLnNldHRpbmdzLnN0aWNreV9jbGFzcyxcbiAgICAgICAgICAkd2luZG93ID0gdGhpcy5TKHdpbmRvdyksXG4gICAgICAgICAgc2VsZiA9IHRoaXM7XG5cbiAgICAgIGlmIChzZWxmLnNldHRpbmdzLnN0aWNreV90b3BiYXIgJiYgc2VsZi5pc19zdGlja3kodGhpcy5zZXR0aW5ncy5zdGlja3lfdG9wYmFyLHRoaXMuc2V0dGluZ3Muc3RpY2t5X3RvcGJhci5wYXJlbnQoKSwgdGhpcy5zZXR0aW5ncykpIHtcbiAgICAgICAgdmFyIGRpc3RhbmNlID0gdGhpcy5zZXR0aW5ncy5zdGlja3lfdG9wYmFyLmRhdGEoJ3N0aWNreW9mZnNldCcpICsgdGhpcy5zZXR0aW5ncy5zdGFydF9vZmZzZXQ7XG4gICAgICAgIGlmICghc2VsZi5TKGtsYXNzKS5oYXNDbGFzcygnZXhwYW5kZWQnKSkge1xuICAgICAgICAgIGlmICgkd2luZG93LnNjcm9sbFRvcCgpID4gKGRpc3RhbmNlKSkge1xuICAgICAgICAgICAgaWYgKCFzZWxmLlMoa2xhc3MpLmhhc0NsYXNzKCdmaXhlZCcpKSB7XG4gICAgICAgICAgICAgIHNlbGYuUyhrbGFzcykuYWRkQ2xhc3MoJ2ZpeGVkJyk7XG4gICAgICAgICAgICAgIHNlbGYuUygnYm9keScpLmFkZENsYXNzKCdmLXRvcGJhci1maXhlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAoJHdpbmRvdy5zY3JvbGxUb3AoKSA8PSBkaXN0YW5jZSkge1xuICAgICAgICAgICAgaWYgKHNlbGYuUyhrbGFzcykuaGFzQ2xhc3MoJ2ZpeGVkJykpIHtcbiAgICAgICAgICAgICAgc2VsZi5TKGtsYXNzKS5yZW1vdmVDbGFzcygnZml4ZWQnKTtcbiAgICAgICAgICAgICAgc2VsZi5TKCdib2R5JykucmVtb3ZlQ2xhc3MoJ2YtdG9wYmFyLWZpeGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIG9mZiA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuUyh0aGlzLnNjb3BlKS5vZmYoJy5mbmR0bi50b3BiYXInKTtcbiAgICAgIHRoaXMuUyh3aW5kb3cpLm9mZignLmZuZHRuLnRvcGJhcicpO1xuICAgIH0sXG5cbiAgICByZWZsb3cgOiBmdW5jdGlvbiAoKSB7fVxuICB9O1xufShqUXVlcnksIHdpbmRvdywgd2luZG93LmRvY3VtZW50KSk7XG4iLCIvKipcbiAqIEBmaWxlXG4gKiBBIEphdmFTY3JpcHQgZmlsZSBmb3IgdGhlIHRoZW1lLlxuICovXG5cbi8vIEphdmFTY3JpcHQgc2hvdWxkIGJlIG1hZGUgY29tcGF0aWJsZSB3aXRoIGxpYnJhcmllcyBvdGhlciB0aGFuIGpRdWVyeSBieVxuLy8gd3JhcHBpbmcgaXQgd2l0aCBhbiBcImFub255bW91cyBjbG9zdXJlXCIuIFNlZTpcbi8vIC0gaHR0cDovL2RydXBhbC5vcmcvbm9kZS8xNDQ2NDIwXG4vLyAtIGh0dHA6Ly93d3cuYWRlcXVhdGVseWdvb2QuY29tLzIwMTAvMy9KYXZhU2NyaXB0LU1vZHVsZS1QYXR0ZXJuLUluLURlcHRoXG4hZnVuY3Rpb24gKCQpIHtcbiAgLy8gQWx3YXlzIHVzZSBzdHJpY3QgbW9kZSB0byBlbmFibGUgYmV0dGVyIGVycm9yIGhhbmRsaW5nIGluIG1vZGVybiBicm93c2Vycy5cbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gUGxhY2UgeW91ciBjb2RlIGhlcmUuXG5cbn0oalF1ZXJ5KTtcbiIsIi8qKlxuICogQGZpbGVcbiAqIEEgSmF2YVNjcmlwdCBmaWxlIGZvciB0aGUgdGhlbWUuXG4gKi9cblxuLy8gSmF2YVNjcmlwdCBzaG91bGQgYmUgbWFkZSBjb21wYXRpYmxlIHdpdGggbGlicmFyaWVzIG90aGVyIHRoYW4galF1ZXJ5IGJ5XG4vLyB3cmFwcGluZyBpdCB3aXRoIGFuIFwiYW5vbnltb3VzIGNsb3N1cmVcIi4gU2VlOlxuLy8gLSBodHRwOi8vZHJ1cGFsLm9yZy9ub2RlLzE0NDY0MjBcbi8vIC0gaHR0cDovL3d3dy5hZGVxdWF0ZWx5Z29vZC5jb20vMjAxMC8zL0phdmFTY3JpcHQtTW9kdWxlLVBhdHRlcm4tSW4tRGVwdGhcbiFmdW5jdGlvbiAoJCkge1xuICAvLyBBbHdheXMgdXNlIHN0cmljdCBtb2RlIHRvIGVuYWJsZSBiZXR0ZXIgZXJyb3IgaGFuZGxpbmcgaW4gbW9kZXJuIGJyb3dzZXJzLlxuICBcInVzZSBzdHJpY3RcIjtcblxuICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICAkKGRvY3VtZW50KS5mb3VuZGF0aW9uKCk7XG4gIH0pO1xuXG59KGpRdWVyeSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
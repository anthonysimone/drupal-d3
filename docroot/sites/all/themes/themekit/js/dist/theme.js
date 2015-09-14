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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZvdW5kYXRpb24uanMiLCJmb3VuZGF0aW9uLnRvcGJhci5qcyIsImV4YW1wbGUuanMiLCJmb3VuZGF0aW9uLWluaXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcnRCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxY0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJ0aGVtZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBGb3VuZGF0aW9uIFJlc3BvbnNpdmUgTGlicmFyeVxuICogaHR0cDovL2ZvdW5kYXRpb24uenVyYi5jb21cbiAqIENvcHlyaWdodCAyMDE0LCBaVVJCXG4gKiBGcmVlIHRvIHVzZSB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuKi9cblxuKGZ1bmN0aW9uICgkLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBoZWFkZXJfaGVscGVycyA9IGZ1bmN0aW9uIChjbGFzc19hcnJheSkge1xuICAgIHZhciBpID0gY2xhc3NfYXJyYXkubGVuZ3RoO1xuICAgIHZhciBoZWFkID0gJCgnaGVhZCcpO1xuXG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgaWYgKGhlYWQuaGFzKCcuJyArIGNsYXNzX2FycmF5W2ldKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgaGVhZC5hcHBlbmQoJzxtZXRhIGNsYXNzPVwiJyArIGNsYXNzX2FycmF5W2ldICsgJ1wiIC8+Jyk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGhlYWRlcl9oZWxwZXJzKFtcbiAgICAnZm91bmRhdGlvbi1tcS1zbWFsbCcsXG4gICAgJ2ZvdW5kYXRpb24tbXEtc21hbGwtb25seScsXG4gICAgJ2ZvdW5kYXRpb24tbXEtbWVkaXVtJyxcbiAgICAnZm91bmRhdGlvbi1tcS1tZWRpdW0tb25seScsXG4gICAgJ2ZvdW5kYXRpb24tbXEtbGFyZ2UnLFxuICAgICdmb3VuZGF0aW9uLW1xLWxhcmdlLW9ubHknLFxuICAgICdmb3VuZGF0aW9uLW1xLXhsYXJnZScsXG4gICAgJ2ZvdW5kYXRpb24tbXEteGxhcmdlLW9ubHknLFxuICAgICdmb3VuZGF0aW9uLW1xLXh4bGFyZ2UnLFxuICAgICdmb3VuZGF0aW9uLWRhdGEtYXR0cmlidXRlLW5hbWVzcGFjZSddKTtcblxuICAvLyBFbmFibGUgRmFzdENsaWNrIGlmIHByZXNlbnRcblxuICAkKGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodHlwZW9mIEZhc3RDbGljayAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8vIERvbid0IGF0dGFjaCB0byBib2R5IGlmIHVuZGVmaW5lZFxuICAgICAgaWYgKHR5cGVvZiBkb2N1bWVudC5ib2R5ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBGYXN0Q2xpY2suYXR0YWNoKGRvY3VtZW50LmJvZHkpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgLy8gcHJpdmF0ZSBGYXN0IFNlbGVjdG9yIHdyYXBwZXIsXG4gIC8vIHJldHVybnMgalF1ZXJ5IG9iamVjdC4gT25seSB1c2Ugd2hlcmVcbiAgLy8gZ2V0RWxlbWVudEJ5SWQgaXMgbm90IGF2YWlsYWJsZS5cbiAgdmFyIFMgPSBmdW5jdGlvbiAoc2VsZWN0b3IsIGNvbnRleHQpIHtcbiAgICBpZiAodHlwZW9mIHNlbGVjdG9yID09PSAnc3RyaW5nJykge1xuICAgICAgaWYgKGNvbnRleHQpIHtcbiAgICAgICAgdmFyIGNvbnQ7XG4gICAgICAgIGlmIChjb250ZXh0LmpxdWVyeSkge1xuICAgICAgICAgIGNvbnQgPSBjb250ZXh0WzBdO1xuICAgICAgICAgIGlmICghY29udCkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnQgPSBjb250ZXh0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAkKGNvbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gJChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuICQoc2VsZWN0b3IsIGNvbnRleHQpO1xuICB9O1xuXG4gIC8vIE5hbWVzcGFjZSBmdW5jdGlvbnMuXG5cbiAgdmFyIGF0dHJfbmFtZSA9IGZ1bmN0aW9uIChpbml0KSB7XG4gICAgdmFyIGFyciA9IFtdO1xuICAgIGlmICghaW5pdCkge1xuICAgICAgYXJyLnB1c2goJ2RhdGEnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMubmFtZXNwYWNlLmxlbmd0aCA+IDApIHtcbiAgICAgIGFyci5wdXNoKHRoaXMubmFtZXNwYWNlKTtcbiAgICB9XG4gICAgYXJyLnB1c2godGhpcy5uYW1lKTtcblxuICAgIHJldHVybiBhcnIuam9pbignLScpO1xuICB9O1xuXG4gIHZhciBhZGRfbmFtZXNwYWNlID0gZnVuY3Rpb24gKHN0cikge1xuICAgIHZhciBwYXJ0cyA9IHN0ci5zcGxpdCgnLScpLFxuICAgICAgICBpID0gcGFydHMubGVuZ3RoLFxuICAgICAgICBhcnIgPSBbXTtcblxuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIGlmIChpICE9PSAwKSB7XG4gICAgICAgIGFyci5wdXNoKHBhcnRzW2ldKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLm5hbWVzcGFjZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgYXJyLnB1c2godGhpcy5uYW1lc3BhY2UsIHBhcnRzW2ldKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhcnIucHVzaChwYXJ0c1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYXJyLnJldmVyc2UoKS5qb2luKCctJyk7XG4gIH07XG5cbiAgLy8gRXZlbnQgYmluZGluZyBhbmQgZGF0YS1vcHRpb25zIHVwZGF0aW5nLlxuXG4gIHZhciBiaW5kaW5ncyA9IGZ1bmN0aW9uIChtZXRob2QsIG9wdGlvbnMpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIGJpbmQgPSBmdW5jdGlvbigpe1xuICAgICAgICAgIHZhciAkdGhpcyA9IFModGhpcyksXG4gICAgICAgICAgICAgIHNob3VsZF9iaW5kX2V2ZW50cyA9ICEkdGhpcy5kYXRhKHNlbGYuYXR0cl9uYW1lKHRydWUpICsgJy1pbml0Jyk7XG4gICAgICAgICAgJHRoaXMuZGF0YShzZWxmLmF0dHJfbmFtZSh0cnVlKSArICctaW5pdCcsICQuZXh0ZW5kKHt9LCBzZWxmLnNldHRpbmdzLCAob3B0aW9ucyB8fCBtZXRob2QpLCBzZWxmLmRhdGFfb3B0aW9ucygkdGhpcykpKTtcblxuICAgICAgICAgIGlmIChzaG91bGRfYmluZF9ldmVudHMpIHtcbiAgICAgICAgICAgIHNlbGYuZXZlbnRzKHRoaXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgIGlmIChTKHRoaXMuc2NvcGUpLmlzKCdbJyArIHRoaXMuYXR0cl9uYW1lKCkgKyddJykpIHtcbiAgICAgIGJpbmQuY2FsbCh0aGlzLnNjb3BlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgUygnWycgKyB0aGlzLmF0dHJfbmFtZSgpICsnXScsIHRoaXMuc2NvcGUpLmVhY2goYmluZCk7XG4gICAgfVxuICAgIC8vICMgUGF0Y2ggdG8gZml4ICM1MDQzIHRvIG1vdmUgdGhpcyAqYWZ0ZXIqIHRoZSBpZi9lbHNlIGNsYXVzZSBpbiBvcmRlciBmb3IgQmFja2JvbmUgYW5kIHNpbWlsYXIgZnJhbWV3b3JrcyB0byBoYXZlIGltcHJvdmVkIGNvbnRyb2wgb3ZlciBldmVudCBiaW5kaW5nIGFuZCBkYXRhLW9wdGlvbnMgdXBkYXRpbmcuXG4gICAgaWYgKHR5cGVvZiBtZXRob2QgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gdGhpc1ttZXRob2RdLmNhbGwodGhpcywgb3B0aW9ucyk7XG4gICAgfVxuXG4gIH07XG5cbiAgdmFyIHNpbmdsZV9pbWFnZV9sb2FkZWQgPSBmdW5jdGlvbiAoaW1hZ2UsIGNhbGxiYWNrKSB7XG4gICAgZnVuY3Rpb24gbG9hZGVkICgpIHtcbiAgICAgIGNhbGxiYWNrKGltYWdlWzBdKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBiaW5kTG9hZCAoKSB7XG4gICAgICB0aGlzLm9uZSgnbG9hZCcsIGxvYWRlZCk7XG5cbiAgICAgIGlmICgvTVNJRSAoXFxkK1xcLlxcZCspOy8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSkge1xuICAgICAgICB2YXIgc3JjID0gdGhpcy5hdHRyKCAnc3JjJyApLFxuICAgICAgICAgICAgcGFyYW0gPSBzcmMubWF0Y2goIC9cXD8vICkgPyAnJicgOiAnPyc7XG5cbiAgICAgICAgcGFyYW0gKz0gJ3JhbmRvbT0nICsgKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcbiAgICAgICAgdGhpcy5hdHRyKCdzcmMnLCBzcmMgKyBwYXJhbSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFpbWFnZS5hdHRyKCdzcmMnKSkge1xuICAgICAgbG9hZGVkKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGltYWdlWzBdLmNvbXBsZXRlIHx8IGltYWdlWzBdLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgIGxvYWRlZCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBiaW5kTG9hZC5jYWxsKGltYWdlKTtcbiAgICB9XG4gIH07XG5cbiAgLyohIG1hdGNoTWVkaWEoKSBwb2x5ZmlsbCAtIFRlc3QgYSBDU1MgbWVkaWEgdHlwZS9xdWVyeSBpbiBKUy4gQXV0aG9ycyAmIGNvcHlyaWdodCAoYykgMjAxMjogU2NvdHQgSmVobCwgUGF1bCBJcmlzaCwgTmljaG9sYXMgWmFrYXMsIERhdmlkIEtuaWdodC4gRHVhbCBNSVQvQlNEIGxpY2Vuc2UgKi9cblxuICB3aW5kb3cubWF0Y2hNZWRpYSB8fCAod2luZG93Lm1hdGNoTWVkaWEgPSBmdW5jdGlvbigpIHtcbiAgICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgICAvLyBGb3IgYnJvd3NlcnMgdGhhdCBzdXBwb3J0IG1hdGNoTWVkaXVtIGFwaSBzdWNoIGFzIElFIDkgYW5kIHdlYmtpdFxuICAgICAgdmFyIHN0eWxlTWVkaWEgPSAod2luZG93LnN0eWxlTWVkaWEgfHwgd2luZG93Lm1lZGlhKTtcblxuICAgICAgLy8gRm9yIHRob3NlIHRoYXQgZG9uJ3Qgc3VwcG9ydCBtYXRjaE1lZGl1bVxuICAgICAgaWYgKCFzdHlsZU1lZGlhKSB7XG4gICAgICAgICAgdmFyIHN0eWxlICAgICAgID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKSxcbiAgICAgICAgICAgICAgc2NyaXB0ICAgICAgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylbMF0sXG4gICAgICAgICAgICAgIGluZm8gICAgICAgID0gbnVsbDtcblxuICAgICAgICAgIHN0eWxlLnR5cGUgID0gJ3RleHQvY3NzJztcbiAgICAgICAgICBzdHlsZS5pZCAgICA9ICdtYXRjaG1lZGlhanMtdGVzdCc7XG5cbiAgICAgICAgICBzY3JpcHQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoc3R5bGUsIHNjcmlwdCk7XG5cbiAgICAgICAgICAvLyAnc3R5bGUuY3VycmVudFN0eWxlJyBpcyB1c2VkIGJ5IElFIDw9IDggYW5kICd3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZScgZm9yIGFsbCBvdGhlciBicm93c2Vyc1xuICAgICAgICAgIGluZm8gPSAoJ2dldENvbXB1dGVkU3R5bGUnIGluIHdpbmRvdykgJiYgd2luZG93LmdldENvbXB1dGVkU3R5bGUoc3R5bGUsIG51bGwpIHx8IHN0eWxlLmN1cnJlbnRTdHlsZTtcblxuICAgICAgICAgIHN0eWxlTWVkaWEgPSB7XG4gICAgICAgICAgICAgIG1hdGNoTWVkaXVtOiBmdW5jdGlvbihtZWRpYSkge1xuICAgICAgICAgICAgICAgICAgdmFyIHRleHQgPSAnQG1lZGlhICcgKyBtZWRpYSArICd7ICNtYXRjaG1lZGlhanMtdGVzdCB7IHdpZHRoOiAxcHg7IH0gfSc7XG5cbiAgICAgICAgICAgICAgICAgIC8vICdzdHlsZS5zdHlsZVNoZWV0JyBpcyB1c2VkIGJ5IElFIDw9IDggYW5kICdzdHlsZS50ZXh0Q29udGVudCcgZm9yIGFsbCBvdGhlciBicm93c2Vyc1xuICAgICAgICAgICAgICAgICAgaWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICBzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSB0ZXh0O1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICBzdHlsZS50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIC8vIFRlc3QgaWYgbWVkaWEgcXVlcnkgaXMgdHJ1ZSBvciBmYWxzZVxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGluZm8ud2lkdGggPT09ICcxcHgnO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKG1lZGlhKSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgbWF0Y2hlczogc3R5bGVNZWRpYS5tYXRjaE1lZGl1bShtZWRpYSB8fCAnYWxsJyksXG4gICAgICAgICAgICAgIG1lZGlhOiBtZWRpYSB8fCAnYWxsJ1xuICAgICAgICAgIH07XG4gICAgICB9O1xuICB9KCkpO1xuXG4gIC8qXG4gICAqIGpxdWVyeS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgICogaHR0cHM6Ly9naXRodWIuY29tL2duYXJmMzcvanF1ZXJ5LXJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgKiBSZXF1aXJlcyBqUXVlcnkgMS44K1xuICAgKlxuICAgKiBDb3B5cmlnaHQgKGMpIDIwMTIgQ29yZXkgRnJhbmdcbiAgICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuICAgKi9cblxuICAoZnVuY3Rpb24oalF1ZXJ5KSB7XG5cblxuICAvLyByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgcG9seWZpbGwgYWRhcHRlZCBmcm9tIEVyaWsgTcO2bGxlclxuICAvLyBmaXhlcyBmcm9tIFBhdWwgSXJpc2ggYW5kIFRpbm8gWmlqZGVsXG4gIC8vIGh0dHA6Ly9wYXVsaXJpc2guY29tLzIwMTEvcmVxdWVzdGFuaW1hdGlvbmZyYW1lLWZvci1zbWFydC1hbmltYXRpbmcvXG4gIC8vIGh0dHA6Ly9teS5vcGVyYS5jb20vZW1vbGxlci9ibG9nLzIwMTEvMTIvMjAvcmVxdWVzdGFuaW1hdGlvbmZyYW1lLWZvci1zbWFydC1lci1hbmltYXRpbmdcblxuICB2YXIgYW5pbWF0aW5nLFxuICAgICAgbGFzdFRpbWUgPSAwLFxuICAgICAgdmVuZG9ycyA9IFsnd2Via2l0JywgJ21veiddLFxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSxcbiAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lID0gd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lLFxuICAgICAganF1ZXJ5RnhBdmFpbGFibGUgPSAndW5kZWZpbmVkJyAhPT0gdHlwZW9mIGpRdWVyeS5meDtcblxuICBmb3IgKDsgbGFzdFRpbWUgPCB2ZW5kb3JzLmxlbmd0aCAmJiAhcmVxdWVzdEFuaW1hdGlvbkZyYW1lOyBsYXN0VGltZSsrKSB7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93WyB2ZW5kb3JzW2xhc3RUaW1lXSArICdSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnIF07XG4gICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBjYW5jZWxBbmltYXRpb25GcmFtZSB8fFxuICAgICAgd2luZG93WyB2ZW5kb3JzW2xhc3RUaW1lXSArICdDYW5jZWxBbmltYXRpb25GcmFtZScgXSB8fFxuICAgICAgd2luZG93WyB2ZW5kb3JzW2xhc3RUaW1lXSArICdDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnIF07XG4gIH1cblxuICBmdW5jdGlvbiByYWYoKSB7XG4gICAgaWYgKGFuaW1hdGluZykge1xuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJhZik7XG5cbiAgICAgIGlmIChqcXVlcnlGeEF2YWlsYWJsZSkge1xuICAgICAgICBqUXVlcnkuZngudGljaygpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChyZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHtcbiAgICAvLyB1c2UgckFGXG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHJlcXVlc3RBbmltYXRpb25GcmFtZTtcbiAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBjYW5jZWxBbmltYXRpb25GcmFtZTtcblxuICAgIGlmIChqcXVlcnlGeEF2YWlsYWJsZSkge1xuICAgICAgalF1ZXJ5LmZ4LnRpbWVyID0gZnVuY3Rpb24gKHRpbWVyKSB7XG4gICAgICAgIGlmICh0aW1lcigpICYmIGpRdWVyeS50aW1lcnMucHVzaCh0aW1lcikgJiYgIWFuaW1hdGluZykge1xuICAgICAgICAgIGFuaW1hdGluZyA9IHRydWU7XG4gICAgICAgICAgcmFmKCk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGpRdWVyeS5meC5zdG9wID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBhbmltYXRpbmcgPSBmYWxzZTtcbiAgICAgIH07XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIHBvbHlmaWxsXG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgdmFyIGN1cnJUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCksXG4gICAgICAgIHRpbWVUb0NhbGwgPSBNYXRoLm1heCgwLCAxNiAtIChjdXJyVGltZSAtIGxhc3RUaW1lKSksXG4gICAgICAgIGlkID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGNhbGxiYWNrKGN1cnJUaW1lICsgdGltZVRvQ2FsbCk7XG4gICAgICAgIH0sIHRpbWVUb0NhbGwpO1xuICAgICAgbGFzdFRpbWUgPSBjdXJyVGltZSArIHRpbWVUb0NhbGw7XG4gICAgICByZXR1cm4gaWQ7XG4gICAgfTtcblxuICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgY2xlYXJUaW1lb3V0KGlkKTtcbiAgICB9O1xuXG4gIH1cblxuICB9KCAkICkpO1xuXG4gIGZ1bmN0aW9uIHJlbW92ZVF1b3RlcyAoc3RyaW5nKSB7XG4gICAgaWYgKHR5cGVvZiBzdHJpbmcgPT09ICdzdHJpbmcnIHx8IHN0cmluZyBpbnN0YW5jZW9mIFN0cmluZykge1xuICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UoL15bJ1xcXFwvXCJdK3woO1xccz99KSt8WydcXFxcL1wiXSskL2csICcnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc3RyaW5nO1xuICB9XG5cbiAgd2luZG93LkZvdW5kYXRpb24gPSB7XG4gICAgbmFtZSA6ICdGb3VuZGF0aW9uJyxcblxuICAgIHZlcnNpb24gOiAnNS41LjInLFxuXG4gICAgbWVkaWFfcXVlcmllcyA6IHtcbiAgICAgICdzbWFsbCcgICAgICAgOiBTKCcuZm91bmRhdGlvbi1tcS1zbWFsbCcpLmNzcygnZm9udC1mYW1pbHknKS5yZXBsYWNlKC9eW1xcL1xcXFwnXCJdK3woO1xccz99KSt8W1xcL1xcXFwnXCJdKyQvZywgJycpLFxuICAgICAgJ3NtYWxsLW9ubHknICA6IFMoJy5mb3VuZGF0aW9uLW1xLXNtYWxsLW9ubHknKS5jc3MoJ2ZvbnQtZmFtaWx5JykucmVwbGFjZSgvXltcXC9cXFxcJ1wiXSt8KDtcXHM/fSkrfFtcXC9cXFxcJ1wiXSskL2csICcnKSxcbiAgICAgICdtZWRpdW0nICAgICAgOiBTKCcuZm91bmRhdGlvbi1tcS1tZWRpdW0nKS5jc3MoJ2ZvbnQtZmFtaWx5JykucmVwbGFjZSgvXltcXC9cXFxcJ1wiXSt8KDtcXHM/fSkrfFtcXC9cXFxcJ1wiXSskL2csICcnKSxcbiAgICAgICdtZWRpdW0tb25seScgOiBTKCcuZm91bmRhdGlvbi1tcS1tZWRpdW0tb25seScpLmNzcygnZm9udC1mYW1pbHknKS5yZXBsYWNlKC9eW1xcL1xcXFwnXCJdK3woO1xccz99KSt8W1xcL1xcXFwnXCJdKyQvZywgJycpLFxuICAgICAgJ2xhcmdlJyAgICAgICA6IFMoJy5mb3VuZGF0aW9uLW1xLWxhcmdlJykuY3NzKCdmb250LWZhbWlseScpLnJlcGxhY2UoL15bXFwvXFxcXCdcIl0rfCg7XFxzP30pK3xbXFwvXFxcXCdcIl0rJC9nLCAnJyksXG4gICAgICAnbGFyZ2Utb25seScgIDogUygnLmZvdW5kYXRpb24tbXEtbGFyZ2Utb25seScpLmNzcygnZm9udC1mYW1pbHknKS5yZXBsYWNlKC9eW1xcL1xcXFwnXCJdK3woO1xccz99KSt8W1xcL1xcXFwnXCJdKyQvZywgJycpLFxuICAgICAgJ3hsYXJnZScgICAgICA6IFMoJy5mb3VuZGF0aW9uLW1xLXhsYXJnZScpLmNzcygnZm9udC1mYW1pbHknKS5yZXBsYWNlKC9eW1xcL1xcXFwnXCJdK3woO1xccz99KSt8W1xcL1xcXFwnXCJdKyQvZywgJycpLFxuICAgICAgJ3hsYXJnZS1vbmx5JyA6IFMoJy5mb3VuZGF0aW9uLW1xLXhsYXJnZS1vbmx5JykuY3NzKCdmb250LWZhbWlseScpLnJlcGxhY2UoL15bXFwvXFxcXCdcIl0rfCg7XFxzP30pK3xbXFwvXFxcXCdcIl0rJC9nLCAnJyksXG4gICAgICAneHhsYXJnZScgICAgIDogUygnLmZvdW5kYXRpb24tbXEteHhsYXJnZScpLmNzcygnZm9udC1mYW1pbHknKS5yZXBsYWNlKC9eW1xcL1xcXFwnXCJdK3woO1xccz99KSt8W1xcL1xcXFwnXCJdKyQvZywgJycpXG4gICAgfSxcblxuICAgIHN0eWxlc2hlZXQgOiAkKCc8c3R5bGU+PC9zdHlsZT4nKS5hcHBlbmRUbygnaGVhZCcpWzBdLnNoZWV0LFxuXG4gICAgZ2xvYmFsIDoge1xuICAgICAgbmFtZXNwYWNlIDogdW5kZWZpbmVkXG4gICAgfSxcblxuICAgIGluaXQgOiBmdW5jdGlvbiAoc2NvcGUsIGxpYnJhcmllcywgbWV0aG9kLCBvcHRpb25zLCByZXNwb25zZSkge1xuICAgICAgdmFyIGFyZ3MgPSBbc2NvcGUsIG1ldGhvZCwgb3B0aW9ucywgcmVzcG9uc2VdLFxuICAgICAgICAgIHJlc3BvbnNlcyA9IFtdO1xuXG4gICAgICAvLyBjaGVjayBSVExcbiAgICAgIHRoaXMucnRsID0gL3J0bC9pLnRlc3QoUygnaHRtbCcpLmF0dHIoJ2RpcicpKTtcblxuICAgICAgLy8gc2V0IGZvdW5kYXRpb24gZ2xvYmFsIHNjb3BlXG4gICAgICB0aGlzLnNjb3BlID0gc2NvcGUgfHwgdGhpcy5zY29wZTtcblxuICAgICAgdGhpcy5zZXRfbmFtZXNwYWNlKCk7XG5cbiAgICAgIGlmIChsaWJyYXJpZXMgJiYgdHlwZW9mIGxpYnJhcmllcyA9PT0gJ3N0cmluZycgJiYgIS9yZWZsb3cvaS50ZXN0KGxpYnJhcmllcykpIHtcbiAgICAgICAgaWYgKHRoaXMubGlicy5oYXNPd25Qcm9wZXJ0eShsaWJyYXJpZXMpKSB7XG4gICAgICAgICAgcmVzcG9uc2VzLnB1c2godGhpcy5pbml0X2xpYihsaWJyYXJpZXMsIGFyZ3MpKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yICh2YXIgbGliIGluIHRoaXMubGlicykge1xuICAgICAgICAgIHJlc3BvbnNlcy5wdXNoKHRoaXMuaW5pdF9saWIobGliLCBsaWJyYXJpZXMpKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBTKHdpbmRvdykubG9hZChmdW5jdGlvbiAoKSB7XG4gICAgICAgIFMod2luZG93KVxuICAgICAgICAgIC50cmlnZ2VyKCdyZXNpemUuZm5kdG4uY2xlYXJpbmcnKVxuICAgICAgICAgIC50cmlnZ2VyKCdyZXNpemUuZm5kdG4uZHJvcGRvd24nKVxuICAgICAgICAgIC50cmlnZ2VyKCdyZXNpemUuZm5kdG4uZXF1YWxpemVyJylcbiAgICAgICAgICAudHJpZ2dlcigncmVzaXplLmZuZHRuLmludGVyY2hhbmdlJylcbiAgICAgICAgICAudHJpZ2dlcigncmVzaXplLmZuZHRuLmpveXJpZGUnKVxuICAgICAgICAgIC50cmlnZ2VyKCdyZXNpemUuZm5kdG4ubWFnZWxsYW4nKVxuICAgICAgICAgIC50cmlnZ2VyKCdyZXNpemUuZm5kdG4udG9wYmFyJylcbiAgICAgICAgICAudHJpZ2dlcigncmVzaXplLmZuZHRuLnNsaWRlcicpO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBzY29wZTtcbiAgICB9LFxuXG4gICAgaW5pdF9saWIgOiBmdW5jdGlvbiAobGliLCBhcmdzKSB7XG4gICAgICBpZiAodGhpcy5saWJzLmhhc093blByb3BlcnR5KGxpYikpIHtcbiAgICAgICAgdGhpcy5wYXRjaCh0aGlzLmxpYnNbbGliXSk7XG5cbiAgICAgICAgaWYgKGFyZ3MgJiYgYXJncy5oYXNPd25Qcm9wZXJ0eShsaWIpKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMubGlic1tsaWJdLnNldHRpbmdzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAkLmV4dGVuZCh0cnVlLCB0aGlzLmxpYnNbbGliXS5zZXR0aW5ncywgYXJnc1tsaWJdKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMubGlic1tsaWJdLmRlZmF1bHRzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAkLmV4dGVuZCh0cnVlLCB0aGlzLmxpYnNbbGliXS5kZWZhdWx0cywgYXJnc1tsaWJdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdGhpcy5saWJzW2xpYl0uaW5pdC5hcHBseSh0aGlzLmxpYnNbbGliXSwgW3RoaXMuc2NvcGUsIGFyZ3NbbGliXV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgYXJncyA9IGFyZ3MgaW5zdGFuY2VvZiBBcnJheSA/IGFyZ3MgOiBuZXcgQXJyYXkoYXJncyk7XG4gICAgICAgIHJldHVybiB0aGlzLmxpYnNbbGliXS5pbml0LmFwcGx5KHRoaXMubGlic1tsaWJdLCBhcmdzKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHt9O1xuICAgIH0sXG5cbiAgICBwYXRjaCA6IGZ1bmN0aW9uIChsaWIpIHtcbiAgICAgIGxpYi5zY29wZSA9IHRoaXMuc2NvcGU7XG4gICAgICBsaWIubmFtZXNwYWNlID0gdGhpcy5nbG9iYWwubmFtZXNwYWNlO1xuICAgICAgbGliLnJ0bCA9IHRoaXMucnRsO1xuICAgICAgbGliWydkYXRhX29wdGlvbnMnXSA9IHRoaXMudXRpbHMuZGF0YV9vcHRpb25zO1xuICAgICAgbGliWydhdHRyX25hbWUnXSA9IGF0dHJfbmFtZTtcbiAgICAgIGxpYlsnYWRkX25hbWVzcGFjZSddID0gYWRkX25hbWVzcGFjZTtcbiAgICAgIGxpYlsnYmluZGluZ3MnXSA9IGJpbmRpbmdzO1xuICAgICAgbGliWydTJ10gPSB0aGlzLnV0aWxzLlM7XG4gICAgfSxcblxuICAgIGluaGVyaXQgOiBmdW5jdGlvbiAoc2NvcGUsIG1ldGhvZHMpIHtcbiAgICAgIHZhciBtZXRob2RzX2FyciA9IG1ldGhvZHMuc3BsaXQoJyAnKSxcbiAgICAgICAgICBpID0gbWV0aG9kc19hcnIubGVuZ3RoO1xuXG4gICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIGlmICh0aGlzLnV0aWxzLmhhc093blByb3BlcnR5KG1ldGhvZHNfYXJyW2ldKSkge1xuICAgICAgICAgIHNjb3BlW21ldGhvZHNfYXJyW2ldXSA9IHRoaXMudXRpbHNbbWV0aG9kc19hcnJbaV1dO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIHNldF9uYW1lc3BhY2UgOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIC8vIERlc2NyaXB0aW9uOlxuICAgICAgLy8gICAgRG9uJ3QgYm90aGVyIHJlYWRpbmcgdGhlIG5hbWVzcGFjZSBvdXQgb2YgdGhlIG1ldGEgdGFnXG4gICAgICAvLyAgICBpZiB0aGUgbmFtZXNwYWNlIGhhcyBiZWVuIHNldCBnbG9iYWxseSBpbiBqYXZhc2NyaXB0XG4gICAgICAvL1xuICAgICAgLy8gRXhhbXBsZTpcbiAgICAgIC8vICAgIEZvdW5kYXRpb24uZ2xvYmFsLm5hbWVzcGFjZSA9ICdteS1uYW1lc3BhY2UnO1xuICAgICAgLy8gb3IgbWFrZSBpdCBhbiBlbXB0eSBzdHJpbmc6XG4gICAgICAvLyAgICBGb3VuZGF0aW9uLmdsb2JhbC5uYW1lc3BhY2UgPSAnJztcbiAgICAgIC8vXG4gICAgICAvL1xuXG4gICAgICAvLyBJZiB0aGUgbmFtZXNwYWNlIGhhcyBub3QgYmVlbiBzZXQgKGlzIHVuZGVmaW5lZCksIHRyeSB0byByZWFkIGl0IG91dCBvZiB0aGUgbWV0YSBlbGVtZW50LlxuICAgICAgLy8gT3RoZXJ3aXNlIHVzZSB0aGUgZ2xvYmFsbHkgZGVmaW5lZCBuYW1lc3BhY2UsIGV2ZW4gaWYgaXQncyBlbXB0eSAoJycpXG4gICAgICB2YXIgbmFtZXNwYWNlID0gKCB0aGlzLmdsb2JhbC5uYW1lc3BhY2UgPT09IHVuZGVmaW5lZCApID8gJCgnLmZvdW5kYXRpb24tZGF0YS1hdHRyaWJ1dGUtbmFtZXNwYWNlJykuY3NzKCdmb250LWZhbWlseScpIDogdGhpcy5nbG9iYWwubmFtZXNwYWNlO1xuXG4gICAgICAvLyBGaW5hbGx5LCBpZiB0aGUgbmFtc2VwYWNlIGlzIGVpdGhlciB1bmRlZmluZWQgb3IgZmFsc2UsIHNldCBpdCB0byBhbiBlbXB0eSBzdHJpbmcuXG4gICAgICAvLyBPdGhlcndpc2UgdXNlIHRoZSBuYW1lc3BhY2UgdmFsdWUuXG4gICAgICB0aGlzLmdsb2JhbC5uYW1lc3BhY2UgPSAoIG5hbWVzcGFjZSA9PT0gdW5kZWZpbmVkIHx8IC9mYWxzZS9pLnRlc3QobmFtZXNwYWNlKSApID8gJycgOiBuYW1lc3BhY2U7XG4gICAgfSxcblxuICAgIGxpYnMgOiB7fSxcblxuICAgIC8vIG1ldGhvZHMgdGhhdCBjYW4gYmUgaW5oZXJpdGVkIGluIGxpYnJhcmllc1xuICAgIHV0aWxzIDoge1xuXG4gICAgICAvLyBEZXNjcmlwdGlvbjpcbiAgICAgIC8vICAgIEZhc3QgU2VsZWN0b3Igd3JhcHBlciByZXR1cm5zIGpRdWVyeSBvYmplY3QuIE9ubHkgdXNlIHdoZXJlIGdldEVsZW1lbnRCeUlkXG4gICAgICAvLyAgICBpcyBub3QgYXZhaWxhYmxlLlxuICAgICAgLy9cbiAgICAgIC8vIEFyZ3VtZW50czpcbiAgICAgIC8vICAgIFNlbGVjdG9yIChTdHJpbmcpOiBDU1Mgc2VsZWN0b3IgZGVzY3JpYmluZyB0aGUgZWxlbWVudChzKSB0byBiZVxuICAgICAgLy8gICAgcmV0dXJuZWQgYXMgYSBqUXVlcnkgb2JqZWN0LlxuICAgICAgLy9cbiAgICAgIC8vICAgIFNjb3BlIChTdHJpbmcpOiBDU1Mgc2VsZWN0b3IgZGVzY3JpYmluZyB0aGUgYXJlYSB0byBiZSBzZWFyY2hlZC4gRGVmYXVsdFxuICAgICAgLy8gICAgaXMgZG9jdW1lbnQuXG4gICAgICAvL1xuICAgICAgLy8gUmV0dXJuczpcbiAgICAgIC8vICAgIEVsZW1lbnQgKGpRdWVyeSBPYmplY3QpOiBqUXVlcnkgb2JqZWN0IGNvbnRhaW5pbmcgZWxlbWVudHMgbWF0Y2hpbmcgdGhlXG4gICAgICAvLyAgICBzZWxlY3RvciB3aXRoaW4gdGhlIHNjb3BlLlxuICAgICAgUyA6IFMsXG5cbiAgICAgIC8vIERlc2NyaXB0aW9uOlxuICAgICAgLy8gICAgRXhlY3V0ZXMgYSBmdW5jdGlvbiBhIG1heCBvZiBvbmNlIGV2ZXJ5IG4gbWlsbGlzZWNvbmRzXG4gICAgICAvL1xuICAgICAgLy8gQXJndW1lbnRzOlxuICAgICAgLy8gICAgRnVuYyAoRnVuY3Rpb24pOiBGdW5jdGlvbiB0byBiZSB0aHJvdHRsZWQuXG4gICAgICAvL1xuICAgICAgLy8gICAgRGVsYXkgKEludGVnZXIpOiBGdW5jdGlvbiBleGVjdXRpb24gdGhyZXNob2xkIGluIG1pbGxpc2Vjb25kcy5cbiAgICAgIC8vXG4gICAgICAvLyBSZXR1cm5zOlxuICAgICAgLy8gICAgTGF6eV9mdW5jdGlvbiAoRnVuY3Rpb24pOiBGdW5jdGlvbiB3aXRoIHRocm90dGxpbmcgYXBwbGllZC5cbiAgICAgIHRocm90dGxlIDogZnVuY3Rpb24gKGZ1bmMsIGRlbGF5KSB7XG4gICAgICAgIHZhciB0aW1lciA9IG51bGw7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgY29udGV4dCA9IHRoaXMsIGFyZ3MgPSBhcmd1bWVudHM7XG5cbiAgICAgICAgICBpZiAodGltZXIgPT0gbnVsbCkge1xuICAgICAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICAgICAgdGltZXIgPSBudWxsO1xuICAgICAgICAgICAgfSwgZGVsYXkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIERlc2NyaXB0aW9uOlxuICAgICAgLy8gICAgRXhlY3V0ZXMgYSBmdW5jdGlvbiB3aGVuIGl0IHN0b3BzIGJlaW5nIGludm9rZWQgZm9yIG4gc2Vjb25kc1xuICAgICAgLy8gICAgTW9kaWZpZWQgdmVyc2lvbiBvZiBfLmRlYm91bmNlKCkgaHR0cDovL3VuZGVyc2NvcmVqcy5vcmdcbiAgICAgIC8vXG4gICAgICAvLyBBcmd1bWVudHM6XG4gICAgICAvLyAgICBGdW5jIChGdW5jdGlvbik6IEZ1bmN0aW9uIHRvIGJlIGRlYm91bmNlZC5cbiAgICAgIC8vXG4gICAgICAvLyAgICBEZWxheSAoSW50ZWdlcik6IEZ1bmN0aW9uIGV4ZWN1dGlvbiB0aHJlc2hvbGQgaW4gbWlsbGlzZWNvbmRzLlxuICAgICAgLy9cbiAgICAgIC8vICAgIEltbWVkaWF0ZSAoQm9vbCk6IFdoZXRoZXIgdGhlIGZ1bmN0aW9uIHNob3VsZCBiZSBjYWxsZWQgYXQgdGhlIGJlZ2lubmluZ1xuICAgICAgLy8gICAgb2YgdGhlIGRlbGF5IGluc3RlYWQgb2YgdGhlIGVuZC4gRGVmYXVsdCBpcyBmYWxzZS5cbiAgICAgIC8vXG4gICAgICAvLyBSZXR1cm5zOlxuICAgICAgLy8gICAgTGF6eV9mdW5jdGlvbiAoRnVuY3Rpb24pOiBGdW5jdGlvbiB3aXRoIGRlYm91bmNpbmcgYXBwbGllZC5cbiAgICAgIGRlYm91bmNlIDogZnVuY3Rpb24gKGZ1bmMsIGRlbGF5LCBpbW1lZGlhdGUpIHtcbiAgICAgICAgdmFyIHRpbWVvdXQsIHJlc3VsdDtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgY29udGV4dCA9IHRoaXMsIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgdmFyIGxhdGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgICAgICBpZiAoIWltbWVkaWF0ZSkge1xuICAgICAgICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgICAgdmFyIGNhbGxOb3cgPSBpbW1lZGlhdGUgJiYgIXRpbWVvdXQ7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCBkZWxheSk7XG4gICAgICAgICAgaWYgKGNhbGxOb3cpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgICB9LFxuXG4gICAgICAvLyBEZXNjcmlwdGlvbjpcbiAgICAgIC8vICAgIFBhcnNlcyBkYXRhLW9wdGlvbnMgYXR0cmlidXRlXG4gICAgICAvL1xuICAgICAgLy8gQXJndW1lbnRzOlxuICAgICAgLy8gICAgRWwgKGpRdWVyeSBPYmplY3QpOiBFbGVtZW50IHRvIGJlIHBhcnNlZC5cbiAgICAgIC8vXG4gICAgICAvLyBSZXR1cm5zOlxuICAgICAgLy8gICAgT3B0aW9ucyAoSmF2YXNjcmlwdCBPYmplY3QpOiBDb250ZW50cyBvZiB0aGUgZWxlbWVudCdzIGRhdGEtb3B0aW9uc1xuICAgICAgLy8gICAgYXR0cmlidXRlLlxuICAgICAgZGF0YV9vcHRpb25zIDogZnVuY3Rpb24gKGVsLCBkYXRhX2F0dHJfbmFtZSkge1xuICAgICAgICBkYXRhX2F0dHJfbmFtZSA9IGRhdGFfYXR0cl9uYW1lIHx8ICdvcHRpb25zJztcbiAgICAgICAgdmFyIG9wdHMgPSB7fSwgaWksIHAsIG9wdHNfYXJyLFxuICAgICAgICAgICAgZGF0YV9vcHRpb25zID0gZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICAgIHZhciBuYW1lc3BhY2UgPSBGb3VuZGF0aW9uLmdsb2JhbC5uYW1lc3BhY2U7XG5cbiAgICAgICAgICAgICAgaWYgKG5hbWVzcGFjZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsLmRhdGEobmFtZXNwYWNlICsgJy0nICsgZGF0YV9hdHRyX25hbWUpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcmV0dXJuIGVsLmRhdGEoZGF0YV9hdHRyX25hbWUpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICB2YXIgY2FjaGVkX29wdGlvbnMgPSBkYXRhX29wdGlvbnMoZWwpO1xuXG4gICAgICAgIGlmICh0eXBlb2YgY2FjaGVkX29wdGlvbnMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgcmV0dXJuIGNhY2hlZF9vcHRpb25zO1xuICAgICAgICB9XG5cbiAgICAgICAgb3B0c19hcnIgPSAoY2FjaGVkX29wdGlvbnMgfHwgJzonKS5zcGxpdCgnOycpO1xuICAgICAgICBpaSA9IG9wdHNfYXJyLmxlbmd0aDtcblxuICAgICAgICBmdW5jdGlvbiBpc051bWJlciAobykge1xuICAgICAgICAgIHJldHVybiAhaXNOYU4gKG8gLSAwKSAmJiBvICE9PSBudWxsICYmIG8gIT09ICcnICYmIG8gIT09IGZhbHNlICYmIG8gIT09IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiB0cmltIChzdHIpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHN0ciA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHJldHVybiAkLnRyaW0oc3RyKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHN0cjtcbiAgICAgICAgfVxuXG4gICAgICAgIHdoaWxlIChpaS0tKSB7XG4gICAgICAgICAgcCA9IG9wdHNfYXJyW2lpXS5zcGxpdCgnOicpO1xuICAgICAgICAgIHAgPSBbcFswXSwgcC5zbGljZSgxKS5qb2luKCc6JyldO1xuXG4gICAgICAgICAgaWYgKC90cnVlL2kudGVzdChwWzFdKSkge1xuICAgICAgICAgICAgcFsxXSA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICgvZmFsc2UvaS50ZXN0KHBbMV0pKSB7XG4gICAgICAgICAgICBwWzFdID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChpc051bWJlcihwWzFdKSkge1xuICAgICAgICAgICAgaWYgKHBbMV0uaW5kZXhPZignLicpID09PSAtMSkge1xuICAgICAgICAgICAgICBwWzFdID0gcGFyc2VJbnQocFsxXSwgMTApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcFsxXSA9IHBhcnNlRmxvYXQocFsxXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHAubGVuZ3RoID09PSAyICYmIHBbMF0ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgb3B0c1t0cmltKHBbMF0pXSA9IHRyaW0ocFsxXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG9wdHM7XG4gICAgICB9LFxuXG4gICAgICAvLyBEZXNjcmlwdGlvbjpcbiAgICAgIC8vICAgIEFkZHMgSlMtcmVjb2duaXphYmxlIG1lZGlhIHF1ZXJpZXNcbiAgICAgIC8vXG4gICAgICAvLyBBcmd1bWVudHM6XG4gICAgICAvLyAgICBNZWRpYSAoU3RyaW5nKTogS2V5IHN0cmluZyBmb3IgdGhlIG1lZGlhIHF1ZXJ5IHRvIGJlIHN0b3JlZCBhcyBpblxuICAgICAgLy8gICAgRm91bmRhdGlvbi5tZWRpYV9xdWVyaWVzXG4gICAgICAvL1xuICAgICAgLy8gICAgQ2xhc3MgKFN0cmluZyk6IENsYXNzIG5hbWUgZm9yIHRoZSBnZW5lcmF0ZWQgPG1ldGE+IHRhZ1xuICAgICAgcmVnaXN0ZXJfbWVkaWEgOiBmdW5jdGlvbiAobWVkaWEsIG1lZGlhX2NsYXNzKSB7XG4gICAgICAgIGlmIChGb3VuZGF0aW9uLm1lZGlhX3F1ZXJpZXNbbWVkaWFdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAkKCdoZWFkJykuYXBwZW5kKCc8bWV0YSBjbGFzcz1cIicgKyBtZWRpYV9jbGFzcyArICdcIi8+Jyk7XG4gICAgICAgICAgRm91bmRhdGlvbi5tZWRpYV9xdWVyaWVzW21lZGlhXSA9IHJlbW92ZVF1b3RlcygkKCcuJyArIG1lZGlhX2NsYXNzKS5jc3MoJ2ZvbnQtZmFtaWx5JykpO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICAvLyBEZXNjcmlwdGlvbjpcbiAgICAgIC8vICAgIEFkZCBjdXN0b20gQ1NTIHdpdGhpbiBhIEpTLWRlZmluZWQgbWVkaWEgcXVlcnlcbiAgICAgIC8vXG4gICAgICAvLyBBcmd1bWVudHM6XG4gICAgICAvLyAgICBSdWxlIChTdHJpbmcpOiBDU1MgcnVsZSB0byBiZSBhcHBlbmRlZCB0byB0aGUgZG9jdW1lbnQuXG4gICAgICAvL1xuICAgICAgLy8gICAgTWVkaWEgKFN0cmluZyk6IE9wdGlvbmFsIG1lZGlhIHF1ZXJ5IHN0cmluZyBmb3IgdGhlIENTUyBydWxlIHRvIGJlXG4gICAgICAvLyAgICBuZXN0ZWQgdW5kZXIuXG4gICAgICBhZGRfY3VzdG9tX3J1bGUgOiBmdW5jdGlvbiAocnVsZSwgbWVkaWEpIHtcbiAgICAgICAgaWYgKG1lZGlhID09PSB1bmRlZmluZWQgJiYgRm91bmRhdGlvbi5zdHlsZXNoZWV0KSB7XG4gICAgICAgICAgRm91bmRhdGlvbi5zdHlsZXNoZWV0Lmluc2VydFJ1bGUocnVsZSwgRm91bmRhdGlvbi5zdHlsZXNoZWV0LmNzc1J1bGVzLmxlbmd0aCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIHF1ZXJ5ID0gRm91bmRhdGlvbi5tZWRpYV9xdWVyaWVzW21lZGlhXTtcblxuICAgICAgICAgIGlmIChxdWVyeSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBGb3VuZGF0aW9uLnN0eWxlc2hlZXQuaW5zZXJ0UnVsZSgnQG1lZGlhICcgK1xuICAgICAgICAgICAgICBGb3VuZGF0aW9uLm1lZGlhX3F1ZXJpZXNbbWVkaWFdICsgJ3sgJyArIHJ1bGUgKyAnIH0nLCBGb3VuZGF0aW9uLnN0eWxlc2hlZXQuY3NzUnVsZXMubGVuZ3RoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIC8vIERlc2NyaXB0aW9uOlxuICAgICAgLy8gICAgUGVyZm9ybXMgYSBjYWxsYmFjayBmdW5jdGlvbiB3aGVuIGFuIGltYWdlIGlzIGZ1bGx5IGxvYWRlZFxuICAgICAgLy9cbiAgICAgIC8vIEFyZ3VtZW50czpcbiAgICAgIC8vICAgIEltYWdlIChqUXVlcnkgT2JqZWN0KTogSW1hZ2UocykgdG8gY2hlY2sgaWYgbG9hZGVkLlxuICAgICAgLy9cbiAgICAgIC8vICAgIENhbGxiYWNrIChGdW5jdGlvbik6IEZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiBpbWFnZSBpcyBmdWxseSBsb2FkZWQuXG4gICAgICBpbWFnZV9sb2FkZWQgOiBmdW5jdGlvbiAoaW1hZ2VzLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICB1bmxvYWRlZCA9IGltYWdlcy5sZW5ndGg7XG5cbiAgICAgICAgZnVuY3Rpb24gcGljdHVyZXNfaGFzX2hlaWdodChpbWFnZXMpIHtcbiAgICAgICAgICB2YXIgcGljdHVyZXNfbnVtYmVyID0gaW1hZ2VzLmxlbmd0aDtcblxuICAgICAgICAgIGZvciAodmFyIGkgPSBwaWN0dXJlc19udW1iZXIgLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgaWYoaW1hZ2VzLmF0dHIoJ2hlaWdodCcpID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodW5sb2FkZWQgPT09IDAgfHwgcGljdHVyZXNfaGFzX2hlaWdodChpbWFnZXMpKSB7XG4gICAgICAgICAgY2FsbGJhY2soaW1hZ2VzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGltYWdlcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBzaW5nbGVfaW1hZ2VfbG9hZGVkKHNlbGYuUyh0aGlzKSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdW5sb2FkZWQgLT0gMTtcbiAgICAgICAgICAgIGlmICh1bmxvYWRlZCA9PT0gMCkge1xuICAgICAgICAgICAgICBjYWxsYmFjayhpbWFnZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIERlc2NyaXB0aW9uOlxuICAgICAgLy8gICAgUmV0dXJucyBhIHJhbmRvbSwgYWxwaGFudW1lcmljIHN0cmluZ1xuICAgICAgLy9cbiAgICAgIC8vIEFyZ3VtZW50czpcbiAgICAgIC8vICAgIExlbmd0aCAoSW50ZWdlcik6IExlbmd0aCBvZiBzdHJpbmcgdG8gYmUgZ2VuZXJhdGVkLiBEZWZhdWx0cyB0byByYW5kb21cbiAgICAgIC8vICAgIGludGVnZXIuXG4gICAgICAvL1xuICAgICAgLy8gUmV0dXJuczpcbiAgICAgIC8vICAgIFJhbmQgKFN0cmluZyk6IFBzZXVkby1yYW5kb20sIGFscGhhbnVtZXJpYyBzdHJpbmcuXG4gICAgICByYW5kb21fc3RyIDogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIXRoaXMuZmlkeCkge1xuICAgICAgICAgIHRoaXMuZmlkeCA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wcmVmaXggPSB0aGlzLnByZWZpeCB8fCBbKHRoaXMubmFtZSB8fCAnRicpLCAoK25ldyBEYXRlKS50b1N0cmluZygzNildLmpvaW4oJy0nKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5wcmVmaXggKyAodGhpcy5maWR4KyspLnRvU3RyaW5nKDM2KTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIERlc2NyaXB0aW9uOlxuICAgICAgLy8gICAgSGVscGVyIGZvciB3aW5kb3cubWF0Y2hNZWRpYVxuICAgICAgLy9cbiAgICAgIC8vIEFyZ3VtZW50czpcbiAgICAgIC8vICAgIG1xIChTdHJpbmcpOiBNZWRpYSBxdWVyeVxuICAgICAgLy9cbiAgICAgIC8vIFJldHVybnM6XG4gICAgICAvLyAgICAoQm9vbGVhbik6IFdoZXRoZXIgdGhlIG1lZGlhIHF1ZXJ5IHBhc3NlcyBvciBub3RcbiAgICAgIG1hdGNoIDogZnVuY3Rpb24gKG1xKSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cubWF0Y2hNZWRpYShtcSkubWF0Y2hlcztcbiAgICAgIH0sXG5cbiAgICAgIC8vIERlc2NyaXB0aW9uOlxuICAgICAgLy8gICAgSGVscGVycyBmb3IgY2hlY2tpbmcgRm91bmRhdGlvbiBkZWZhdWx0IG1lZGlhIHF1ZXJpZXMgd2l0aCBKU1xuICAgICAgLy9cbiAgICAgIC8vIFJldHVybnM6XG4gICAgICAvLyAgICAoQm9vbGVhbik6IFdoZXRoZXIgdGhlIG1lZGlhIHF1ZXJ5IHBhc3NlcyBvciBub3RcblxuICAgICAgaXNfc21hbGxfdXAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hdGNoKEZvdW5kYXRpb24ubWVkaWFfcXVlcmllcy5zbWFsbCk7XG4gICAgICB9LFxuXG4gICAgICBpc19tZWRpdW1fdXAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hdGNoKEZvdW5kYXRpb24ubWVkaWFfcXVlcmllcy5tZWRpdW0pO1xuICAgICAgfSxcblxuICAgICAgaXNfbGFyZ2VfdXAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hdGNoKEZvdW5kYXRpb24ubWVkaWFfcXVlcmllcy5sYXJnZSk7XG4gICAgICB9LFxuXG4gICAgICBpc194bGFyZ2VfdXAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hdGNoKEZvdW5kYXRpb24ubWVkaWFfcXVlcmllcy54bGFyZ2UpO1xuICAgICAgfSxcblxuICAgICAgaXNfeHhsYXJnZV91cCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWF0Y2goRm91bmRhdGlvbi5tZWRpYV9xdWVyaWVzLnh4bGFyZ2UpO1xuICAgICAgfSxcblxuICAgICAgaXNfc21hbGxfb25seSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICF0aGlzLmlzX21lZGl1bV91cCgpICYmICF0aGlzLmlzX2xhcmdlX3VwKCkgJiYgIXRoaXMuaXNfeGxhcmdlX3VwKCkgJiYgIXRoaXMuaXNfeHhsYXJnZV91cCgpO1xuICAgICAgfSxcblxuICAgICAgaXNfbWVkaXVtX29ubHkgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzX21lZGl1bV91cCgpICYmICF0aGlzLmlzX2xhcmdlX3VwKCkgJiYgIXRoaXMuaXNfeGxhcmdlX3VwKCkgJiYgIXRoaXMuaXNfeHhsYXJnZV91cCgpO1xuICAgICAgfSxcblxuICAgICAgaXNfbGFyZ2Vfb25seSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNfbWVkaXVtX3VwKCkgJiYgdGhpcy5pc19sYXJnZV91cCgpICYmICF0aGlzLmlzX3hsYXJnZV91cCgpICYmICF0aGlzLmlzX3h4bGFyZ2VfdXAoKTtcbiAgICAgIH0sXG5cbiAgICAgIGlzX3hsYXJnZV9vbmx5IDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc19tZWRpdW1fdXAoKSAmJiB0aGlzLmlzX2xhcmdlX3VwKCkgJiYgdGhpcy5pc194bGFyZ2VfdXAoKSAmJiAhdGhpcy5pc194eGxhcmdlX3VwKCk7XG4gICAgICB9LFxuXG4gICAgICBpc194eGxhcmdlX29ubHkgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzX21lZGl1bV91cCgpICYmIHRoaXMuaXNfbGFyZ2VfdXAoKSAmJiB0aGlzLmlzX3hsYXJnZV91cCgpICYmIHRoaXMuaXNfeHhsYXJnZV91cCgpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAkLmZuLmZvdW5kYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuXG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICBGb3VuZGF0aW9uLmluaXQuYXBwbHkoRm91bmRhdGlvbiwgW3RoaXNdLmNvbmNhdChhcmdzKSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9KTtcbiAgfTtcblxufShqUXVlcnksIHdpbmRvdywgd2luZG93LmRvY3VtZW50KSk7XG4iLCI7KGZ1bmN0aW9uICgkLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIEZvdW5kYXRpb24ubGlicy50b3BiYXIgPSB7XG4gICAgbmFtZSA6ICd0b3BiYXInLFxuXG4gICAgdmVyc2lvbiA6ICc1LjUuMicsXG5cbiAgICBzZXR0aW5ncyA6IHtcbiAgICAgIGluZGV4IDogMCxcbiAgICAgIHN0YXJ0X29mZnNldCA6IDAsXG4gICAgICBzdGlja3lfY2xhc3MgOiAnc3RpY2t5JyxcbiAgICAgIGN1c3RvbV9iYWNrX3RleHQgOiB0cnVlLFxuICAgICAgYmFja190ZXh0IDogJ0JhY2snLFxuICAgICAgbW9iaWxlX3Nob3dfcGFyZW50X2xpbmsgOiB0cnVlLFxuICAgICAgaXNfaG92ZXIgOiB0cnVlLFxuICAgICAgc2Nyb2xsdG9wIDogdHJ1ZSwgLy8ganVtcCB0byB0b3Agd2hlbiBzdGlja3kgbmF2IG1lbnUgdG9nZ2xlIGlzIGNsaWNrZWRcbiAgICAgIHN0aWNreV9vbiA6ICdhbGwnLFxuICAgICAgZHJvcGRvd25fYXV0b2Nsb3NlOiB0cnVlXG4gICAgfSxcblxuICAgIGluaXQgOiBmdW5jdGlvbiAoc2VjdGlvbiwgbWV0aG9kLCBvcHRpb25zKSB7XG4gICAgICBGb3VuZGF0aW9uLmluaGVyaXQodGhpcywgJ2FkZF9jdXN0b21fcnVsZSByZWdpc3Rlcl9tZWRpYSB0aHJvdHRsZScpO1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICBzZWxmLnJlZ2lzdGVyX21lZGlhKCd0b3BiYXInLCAnZm91bmRhdGlvbi1tcS10b3BiYXInKTtcblxuICAgICAgdGhpcy5iaW5kaW5ncyhtZXRob2QsIG9wdGlvbnMpO1xuXG4gICAgICBzZWxmLlMoJ1snICsgdGhpcy5hdHRyX25hbWUoKSArICddJywgdGhpcy5zY29wZSkuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB0b3BiYXIgPSAkKHRoaXMpLFxuICAgICAgICAgICAgc2V0dGluZ3MgPSB0b3BiYXIuZGF0YShzZWxmLmF0dHJfbmFtZSh0cnVlKSArICctaW5pdCcpLFxuICAgICAgICAgICAgc2VjdGlvbiA9IHNlbGYuUygnc2VjdGlvbiwgLnRvcC1iYXItc2VjdGlvbicsIHRoaXMpO1xuICAgICAgICB0b3BiYXIuZGF0YSgnaW5kZXgnLCAwKTtcbiAgICAgICAgdmFyIHRvcGJhckNvbnRhaW5lciA9IHRvcGJhci5wYXJlbnQoKTtcbiAgICAgICAgaWYgKHRvcGJhckNvbnRhaW5lci5oYXNDbGFzcygnZml4ZWQnKSB8fCBzZWxmLmlzX3N0aWNreSh0b3BiYXIsIHRvcGJhckNvbnRhaW5lciwgc2V0dGluZ3MpICkge1xuICAgICAgICAgIHNlbGYuc2V0dGluZ3Muc3RpY2t5X2NsYXNzID0gc2V0dGluZ3Muc3RpY2t5X2NsYXNzO1xuICAgICAgICAgIHNlbGYuc2V0dGluZ3Muc3RpY2t5X3RvcGJhciA9IHRvcGJhcjtcbiAgICAgICAgICB0b3BiYXIuZGF0YSgnaGVpZ2h0JywgdG9wYmFyQ29udGFpbmVyLm91dGVySGVpZ2h0KCkpO1xuICAgICAgICAgIHRvcGJhci5kYXRhKCdzdGlja3lvZmZzZXQnLCB0b3BiYXJDb250YWluZXIub2Zmc2V0KCkudG9wKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0b3BiYXIuZGF0YSgnaGVpZ2h0JywgdG9wYmFyLm91dGVySGVpZ2h0KCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFzZXR0aW5ncy5hc3NlbWJsZWQpIHtcbiAgICAgICAgICBzZWxmLmFzc2VtYmxlKHRvcGJhcik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2V0dGluZ3MuaXNfaG92ZXIpIHtcbiAgICAgICAgICBzZWxmLlMoJy5oYXMtZHJvcGRvd24nLCB0b3BiYXIpLmFkZENsYXNzKCdub3QtY2xpY2snKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZWxmLlMoJy5oYXMtZHJvcGRvd24nLCB0b3BiYXIpLnJlbW92ZUNsYXNzKCdub3QtY2xpY2snKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFBhZCBib2R5IHdoZW4gc3RpY2t5IChzY3JvbGxlZCkgb3IgZml4ZWQuXG4gICAgICAgIHNlbGYuYWRkX2N1c3RvbV9ydWxlKCcuZi10b3BiYXItZml4ZWQgeyBwYWRkaW5nLXRvcDogJyArIHRvcGJhci5kYXRhKCdoZWlnaHQnKSArICdweCB9Jyk7XG5cbiAgICAgICAgaWYgKHRvcGJhckNvbnRhaW5lci5oYXNDbGFzcygnZml4ZWQnKSkge1xuICAgICAgICAgIHNlbGYuUygnYm9keScpLmFkZENsYXNzKCdmLXRvcGJhci1maXhlZCcpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIH0sXG5cbiAgICBpc19zdGlja3kgOiBmdW5jdGlvbiAodG9wYmFyLCB0b3BiYXJDb250YWluZXIsIHNldHRpbmdzKSB7XG4gICAgICB2YXIgc3RpY2t5ICAgICA9IHRvcGJhckNvbnRhaW5lci5oYXNDbGFzcyhzZXR0aW5ncy5zdGlja3lfY2xhc3MpO1xuICAgICAgdmFyIHNtYWxsTWF0Y2ggPSBtYXRjaE1lZGlhKEZvdW5kYXRpb24ubWVkaWFfcXVlcmllcy5zbWFsbCkubWF0Y2hlcztcbiAgICAgIHZhciBtZWRNYXRjaCAgID0gbWF0Y2hNZWRpYShGb3VuZGF0aW9uLm1lZGlhX3F1ZXJpZXMubWVkaXVtKS5tYXRjaGVzO1xuICAgICAgdmFyIGxyZ01hdGNoICAgPSBtYXRjaE1lZGlhKEZvdW5kYXRpb24ubWVkaWFfcXVlcmllcy5sYXJnZSkubWF0Y2hlcztcblxuICAgICAgaWYgKHN0aWNreSAmJiBzZXR0aW5ncy5zdGlja3lfb24gPT09ICdhbGwnKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKHN0aWNreSAmJiB0aGlzLnNtYWxsKCkgJiYgc2V0dGluZ3Muc3RpY2t5X29uLmluZGV4T2YoJ3NtYWxsJykgIT09IC0xKSB7XG4gICAgICAgIGlmIChzbWFsbE1hdGNoICYmICFtZWRNYXRjaCAmJiAhbHJnTWF0Y2gpIHsgcmV0dXJuIHRydWU7IH1cbiAgICAgIH1cbiAgICAgIGlmIChzdGlja3kgJiYgdGhpcy5tZWRpdW0oKSAmJiBzZXR0aW5ncy5zdGlja3lfb24uaW5kZXhPZignbWVkaXVtJykgIT09IC0xKSB7XG4gICAgICAgIGlmIChzbWFsbE1hdGNoICYmIG1lZE1hdGNoICYmICFscmdNYXRjaCkgeyByZXR1cm4gdHJ1ZTsgfVxuICAgICAgfVxuICAgICAgaWYgKHN0aWNreSAmJiB0aGlzLmxhcmdlKCkgJiYgc2V0dGluZ3Muc3RpY2t5X29uLmluZGV4T2YoJ2xhcmdlJykgIT09IC0xKSB7XG4gICAgICAgIGlmIChzbWFsbE1hdGNoICYmIG1lZE1hdGNoICYmIGxyZ01hdGNoKSB7IHJldHVybiB0cnVlOyB9XG4gICAgICB9XG5cbiAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIHRvZ2dsZSA6IGZ1bmN0aW9uICh0b2dnbGVFbCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgIHRvcGJhcjtcblxuICAgICAgaWYgKHRvZ2dsZUVsKSB7XG4gICAgICAgIHRvcGJhciA9IHNlbGYuUyh0b2dnbGVFbCkuY2xvc2VzdCgnWycgKyB0aGlzLmF0dHJfbmFtZSgpICsgJ10nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRvcGJhciA9IHNlbGYuUygnWycgKyB0aGlzLmF0dHJfbmFtZSgpICsgJ10nKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHNldHRpbmdzID0gdG9wYmFyLmRhdGEodGhpcy5hdHRyX25hbWUodHJ1ZSkgKyAnLWluaXQnKTtcblxuICAgICAgdmFyIHNlY3Rpb24gPSBzZWxmLlMoJ3NlY3Rpb24sIC50b3AtYmFyLXNlY3Rpb24nLCB0b3BiYXIpO1xuXG4gICAgICBpZiAoc2VsZi5icmVha3BvaW50KCkpIHtcbiAgICAgICAgaWYgKCFzZWxmLnJ0bCkge1xuICAgICAgICAgIHNlY3Rpb24uY3NzKHtsZWZ0IDogJzAlJ30pO1xuICAgICAgICAgICQoJz4ubmFtZScsIHNlY3Rpb24pLmNzcyh7bGVmdCA6ICcxMDAlJ30pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlY3Rpb24uY3NzKHtyaWdodCA6ICcwJSd9KTtcbiAgICAgICAgICAkKCc+Lm5hbWUnLCBzZWN0aW9uKS5jc3Moe3JpZ2h0IDogJzEwMCUnfSk7XG4gICAgICAgIH1cblxuICAgICAgICBzZWxmLlMoJ2xpLm1vdmVkJywgc2VjdGlvbikucmVtb3ZlQ2xhc3MoJ21vdmVkJyk7XG4gICAgICAgIHRvcGJhci5kYXRhKCdpbmRleCcsIDApO1xuXG4gICAgICAgIHRvcGJhclxuICAgICAgICAgIC50b2dnbGVDbGFzcygnZXhwYW5kZWQnKVxuICAgICAgICAgIC5jc3MoJ2hlaWdodCcsICcnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNldHRpbmdzLnNjcm9sbHRvcCkge1xuICAgICAgICBpZiAoIXRvcGJhci5oYXNDbGFzcygnZXhwYW5kZWQnKSkge1xuICAgICAgICAgIGlmICh0b3BiYXIuaGFzQ2xhc3MoJ2ZpeGVkJykpIHtcbiAgICAgICAgICAgIHRvcGJhci5wYXJlbnQoKS5hZGRDbGFzcygnZml4ZWQnKTtcbiAgICAgICAgICAgIHRvcGJhci5yZW1vdmVDbGFzcygnZml4ZWQnKTtcbiAgICAgICAgICAgIHNlbGYuUygnYm9keScpLmFkZENsYXNzKCdmLXRvcGJhci1maXhlZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0b3BiYXIucGFyZW50KCkuaGFzQ2xhc3MoJ2ZpeGVkJykpIHtcbiAgICAgICAgICBpZiAoc2V0dGluZ3Muc2Nyb2xsdG9wKSB7XG4gICAgICAgICAgICB0b3BiYXIucGFyZW50KCkucmVtb3ZlQ2xhc3MoJ2ZpeGVkJyk7XG4gICAgICAgICAgICB0b3BiYXIuYWRkQ2xhc3MoJ2ZpeGVkJyk7XG4gICAgICAgICAgICBzZWxmLlMoJ2JvZHknKS5yZW1vdmVDbGFzcygnZi10b3BiYXItZml4ZWQnKTtcblxuICAgICAgICAgICAgd2luZG93LnNjcm9sbFRvKDAsIDApO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0b3BiYXIucGFyZW50KCkucmVtb3ZlQ2xhc3MoJ2V4cGFuZGVkJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoc2VsZi5pc19zdGlja3kodG9wYmFyLCB0b3BiYXIucGFyZW50KCksIHNldHRpbmdzKSkge1xuICAgICAgICAgIHRvcGJhci5wYXJlbnQoKS5hZGRDbGFzcygnZml4ZWQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0b3BiYXIucGFyZW50KCkuaGFzQ2xhc3MoJ2ZpeGVkJykpIHtcbiAgICAgICAgICBpZiAoIXRvcGJhci5oYXNDbGFzcygnZXhwYW5kZWQnKSkge1xuICAgICAgICAgICAgdG9wYmFyLnJlbW92ZUNsYXNzKCdmaXhlZCcpO1xuICAgICAgICAgICAgdG9wYmFyLnBhcmVudCgpLnJlbW92ZUNsYXNzKCdleHBhbmRlZCcpO1xuICAgICAgICAgICAgc2VsZi51cGRhdGVfc3RpY2t5X3Bvc2l0aW9uaW5nKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRvcGJhci5hZGRDbGFzcygnZml4ZWQnKTtcbiAgICAgICAgICAgIHRvcGJhci5wYXJlbnQoKS5hZGRDbGFzcygnZXhwYW5kZWQnKTtcbiAgICAgICAgICAgIHNlbGYuUygnYm9keScpLmFkZENsYXNzKCdmLXRvcGJhci1maXhlZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICB0aW1lciA6IG51bGwsXG5cbiAgICBldmVudHMgOiBmdW5jdGlvbiAoYmFyKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgUyA9IHRoaXMuUztcblxuICAgICAgUyh0aGlzLnNjb3BlKVxuICAgICAgICAub2ZmKCcudG9wYmFyJylcbiAgICAgICAgLm9uKCdjbGljay5mbmR0bi50b3BiYXInLCAnWycgKyB0aGlzLmF0dHJfbmFtZSgpICsgJ10gLnRvZ2dsZS10b3BiYXInLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICBzZWxmLnRvZ2dsZSh0aGlzKTtcbiAgICAgICAgfSlcbiAgICAgICAgLm9uKCdjbGljay5mbmR0bi50b3BiYXIgY29udGV4dG1lbnUuZm5kdG4udG9wYmFyJywgJy50b3AtYmFyIC50b3AtYmFyLXNlY3Rpb24gbGkgYVtocmVmXj1cIiNcIl0sWycgKyB0aGlzLmF0dHJfbmFtZSgpICsgJ10gLnRvcC1iYXItc2VjdGlvbiBsaSBhW2hyZWZePVwiI1wiXScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgbGkgPSAkKHRoaXMpLmNsb3Nlc3QoJ2xpJyksXG4gICAgICAgICAgICAgICAgdG9wYmFyID0gbGkuY2xvc2VzdCgnWycgKyBzZWxmLmF0dHJfbmFtZSgpICsgJ10nKSxcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA9IHRvcGJhci5kYXRhKHNlbGYuYXR0cl9uYW1lKHRydWUpICsgJy1pbml0Jyk7XG5cbiAgICAgICAgICAgIGlmIChzZXR0aW5ncy5kcm9wZG93bl9hdXRvY2xvc2UgJiYgc2V0dGluZ3MuaXNfaG92ZXIpIHtcbiAgICAgICAgICAgICAgdmFyIGhvdmVyTGkgPSAkKHRoaXMpLmNsb3Nlc3QoJy5ob3ZlcicpO1xuICAgICAgICAgICAgICBob3ZlckxpLnJlbW92ZUNsYXNzKCdob3ZlcicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNlbGYuYnJlYWtwb2ludCgpICYmICFsaS5oYXNDbGFzcygnYmFjaycpICYmICFsaS5oYXNDbGFzcygnaGFzLWRyb3Bkb3duJykpIHtcbiAgICAgICAgICAgICAgc2VsZi50b2dnbGUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KVxuICAgICAgICAub24oJ2NsaWNrLmZuZHRuLnRvcGJhcicsICdbJyArIHRoaXMuYXR0cl9uYW1lKCkgKyAnXSBsaS5oYXMtZHJvcGRvd24nLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIHZhciBsaSA9IFModGhpcyksXG4gICAgICAgICAgICAgIHRhcmdldCA9IFMoZS50YXJnZXQpLFxuICAgICAgICAgICAgICB0b3BiYXIgPSBsaS5jbG9zZXN0KCdbJyArIHNlbGYuYXR0cl9uYW1lKCkgKyAnXScpLFxuICAgICAgICAgICAgICBzZXR0aW5ncyA9IHRvcGJhci5kYXRhKHNlbGYuYXR0cl9uYW1lKHRydWUpICsgJy1pbml0Jyk7XG5cbiAgICAgICAgICBpZiAodGFyZ2V0LmRhdGEoJ3JldmVhbElkJykpIHtcbiAgICAgICAgICAgIHNlbGYudG9nZ2xlKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNlbGYuYnJlYWtwb2ludCgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNldHRpbmdzLmlzX2hvdmVyICYmICFNb2Rlcm5penIudG91Y2gpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgICAgaWYgKGxpLmhhc0NsYXNzKCdob3ZlcicpKSB7XG4gICAgICAgICAgICBsaVxuICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ2hvdmVyJylcbiAgICAgICAgICAgICAgLmZpbmQoJ2xpJylcbiAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdob3ZlcicpO1xuXG4gICAgICAgICAgICBsaS5wYXJlbnRzKCdsaS5ob3ZlcicpXG4gICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnaG92ZXInKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGkuYWRkQ2xhc3MoJ2hvdmVyJyk7XG5cbiAgICAgICAgICAgICQobGkpLnNpYmxpbmdzKCkucmVtb3ZlQ2xhc3MoJ2hvdmVyJyk7XG5cbiAgICAgICAgICAgIGlmICh0YXJnZXRbMF0ubm9kZU5hbWUgPT09ICdBJyAmJiB0YXJnZXQucGFyZW50KCkuaGFzQ2xhc3MoJ2hhcy1kcm9wZG93bicpKSB7XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5vbignY2xpY2suZm5kdG4udG9wYmFyJywgJ1snICsgdGhpcy5hdHRyX25hbWUoKSArICddIC5oYXMtZHJvcGRvd24+YScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgaWYgKHNlbGYuYnJlYWtwb2ludCgpKSB7XG5cbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgdmFyICR0aGlzID0gUyh0aGlzKSxcbiAgICAgICAgICAgICAgICB0b3BiYXIgPSAkdGhpcy5jbG9zZXN0KCdbJyArIHNlbGYuYXR0cl9uYW1lKCkgKyAnXScpLFxuICAgICAgICAgICAgICAgIHNlY3Rpb24gPSB0b3BiYXIuZmluZCgnc2VjdGlvbiwgLnRvcC1iYXItc2VjdGlvbicpLFxuICAgICAgICAgICAgICAgIGRyb3Bkb3duSGVpZ2h0ID0gJHRoaXMubmV4dCgnLmRyb3Bkb3duJykub3V0ZXJIZWlnaHQoKSxcbiAgICAgICAgICAgICAgICAkc2VsZWN0ZWRMaSA9ICR0aGlzLmNsb3Nlc3QoJ2xpJyk7XG5cbiAgICAgICAgICAgIHRvcGJhci5kYXRhKCdpbmRleCcsIHRvcGJhci5kYXRhKCdpbmRleCcpICsgMSk7XG4gICAgICAgICAgICAkc2VsZWN0ZWRMaS5hZGRDbGFzcygnbW92ZWQnKTtcblxuICAgICAgICAgICAgaWYgKCFzZWxmLnJ0bCkge1xuICAgICAgICAgICAgICBzZWN0aW9uLmNzcyh7bGVmdCA6IC0oMTAwICogdG9wYmFyLmRhdGEoJ2luZGV4JykpICsgJyUnfSk7XG4gICAgICAgICAgICAgIHNlY3Rpb24uZmluZCgnPi5uYW1lJykuY3NzKHtsZWZ0IDogMTAwICogdG9wYmFyLmRhdGEoJ2luZGV4JykgKyAnJSd9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHNlY3Rpb24uY3NzKHtyaWdodCA6IC0oMTAwICogdG9wYmFyLmRhdGEoJ2luZGV4JykpICsgJyUnfSk7XG4gICAgICAgICAgICAgIHNlY3Rpb24uZmluZCgnPi5uYW1lJykuY3NzKHtyaWdodCA6IDEwMCAqIHRvcGJhci5kYXRhKCdpbmRleCcpICsgJyUnfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRvcGJhci5jc3MoJ2hlaWdodCcsICR0aGlzLnNpYmxpbmdzKCd1bCcpLm91dGVySGVpZ2h0KHRydWUpICsgdG9wYmFyLmRhdGEoJ2hlaWdodCcpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICBTKHdpbmRvdykub2ZmKCcudG9wYmFyJykub24oJ3Jlc2l6ZS5mbmR0bi50b3BiYXInLCBzZWxmLnRocm90dGxlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBzZWxmLnJlc2l6ZS5jYWxsKHNlbGYpO1xuICAgICAgfSwgNTApKS50cmlnZ2VyKCdyZXNpemUuZm5kdG4udG9wYmFyJykubG9hZChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgLy8gRW5zdXJlIHRoYXQgdGhlIG9mZnNldCBpcyBjYWxjdWxhdGVkIGFmdGVyIGFsbCBvZiB0aGUgcGFnZXMgcmVzb3VyY2VzIGhhdmUgbG9hZGVkXG4gICAgICAgICAgUyh0aGlzKS50cmlnZ2VyKCdyZXNpemUuZm5kdG4udG9wYmFyJyk7XG4gICAgICB9KTtcblxuICAgICAgUygnYm9keScpLm9mZignLnRvcGJhcicpLm9uKCdjbGljay5mbmR0bi50b3BiYXInLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICB2YXIgcGFyZW50ID0gUyhlLnRhcmdldCkuY2xvc2VzdCgnbGknKS5jbG9zZXN0KCdsaS5ob3ZlcicpO1xuXG4gICAgICAgIGlmIChwYXJlbnQubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIFMoJ1snICsgc2VsZi5hdHRyX25hbWUoKSArICddIGxpLmhvdmVyJykucmVtb3ZlQ2xhc3MoJ2hvdmVyJyk7XG4gICAgICB9KTtcblxuICAgICAgLy8gR28gdXAgYSBsZXZlbCBvbiBDbGlja1xuICAgICAgUyh0aGlzLnNjb3BlKS5vbignY2xpY2suZm5kdG4udG9wYmFyJywgJ1snICsgdGhpcy5hdHRyX25hbWUoKSArICddIC5oYXMtZHJvcGRvd24gLmJhY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgdmFyICR0aGlzID0gUyh0aGlzKSxcbiAgICAgICAgICAgIHRvcGJhciA9ICR0aGlzLmNsb3Nlc3QoJ1snICsgc2VsZi5hdHRyX25hbWUoKSArICddJyksXG4gICAgICAgICAgICBzZWN0aW9uID0gdG9wYmFyLmZpbmQoJ3NlY3Rpb24sIC50b3AtYmFyLXNlY3Rpb24nKSxcbiAgICAgICAgICAgIHNldHRpbmdzID0gdG9wYmFyLmRhdGEoc2VsZi5hdHRyX25hbWUodHJ1ZSkgKyAnLWluaXQnKSxcbiAgICAgICAgICAgICRtb3ZlZExpID0gJHRoaXMuY2xvc2VzdCgnbGkubW92ZWQnKSxcbiAgICAgICAgICAgICRwcmV2aW91c0xldmVsVWwgPSAkbW92ZWRMaS5wYXJlbnQoKTtcblxuICAgICAgICB0b3BiYXIuZGF0YSgnaW5kZXgnLCB0b3BiYXIuZGF0YSgnaW5kZXgnKSAtIDEpO1xuXG4gICAgICAgIGlmICghc2VsZi5ydGwpIHtcbiAgICAgICAgICBzZWN0aW9uLmNzcyh7bGVmdCA6IC0oMTAwICogdG9wYmFyLmRhdGEoJ2luZGV4JykpICsgJyUnfSk7XG4gICAgICAgICAgc2VjdGlvbi5maW5kKCc+Lm5hbWUnKS5jc3Moe2xlZnQgOiAxMDAgKiB0b3BiYXIuZGF0YSgnaW5kZXgnKSArICclJ30pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlY3Rpb24uY3NzKHtyaWdodCA6IC0oMTAwICogdG9wYmFyLmRhdGEoJ2luZGV4JykpICsgJyUnfSk7XG4gICAgICAgICAgc2VjdGlvbi5maW5kKCc+Lm5hbWUnKS5jc3Moe3JpZ2h0IDogMTAwICogdG9wYmFyLmRhdGEoJ2luZGV4JykgKyAnJSd9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0b3BiYXIuZGF0YSgnaW5kZXgnKSA9PT0gMCkge1xuICAgICAgICAgIHRvcGJhci5jc3MoJ2hlaWdodCcsICcnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0b3BiYXIuY3NzKCdoZWlnaHQnLCAkcHJldmlvdXNMZXZlbFVsLm91dGVySGVpZ2h0KHRydWUpICsgdG9wYmFyLmRhdGEoJ2hlaWdodCcpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICRtb3ZlZExpLnJlbW92ZUNsYXNzKCdtb3ZlZCcpO1xuICAgICAgICB9LCAzMDApO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIFNob3cgZHJvcGRvd24gbWVudXMgd2hlbiB0aGVpciBpdGVtcyBhcmUgZm9jdXNlZFxuICAgICAgUyh0aGlzLnNjb3BlKS5maW5kKCcuZHJvcGRvd24gYScpXG4gICAgICAgIC5mb2N1cyhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgJCh0aGlzKS5wYXJlbnRzKCcuaGFzLWRyb3Bkb3duJykuYWRkQ2xhc3MoJ2hvdmVyJyk7XG4gICAgICAgIH0pXG4gICAgICAgIC5ibHVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAkKHRoaXMpLnBhcmVudHMoJy5oYXMtZHJvcGRvd24nKS5yZW1vdmVDbGFzcygnaG92ZXInKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlc2l6ZSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHNlbGYuUygnWycgKyB0aGlzLmF0dHJfbmFtZSgpICsgJ10nKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHRvcGJhciA9IHNlbGYuUyh0aGlzKSxcbiAgICAgICAgICAgIHNldHRpbmdzID0gdG9wYmFyLmRhdGEoc2VsZi5hdHRyX25hbWUodHJ1ZSkgKyAnLWluaXQnKTtcblxuICAgICAgICB2YXIgc3RpY2t5Q29udGFpbmVyID0gdG9wYmFyLnBhcmVudCgnLicgKyBzZWxmLnNldHRpbmdzLnN0aWNreV9jbGFzcyk7XG4gICAgICAgIHZhciBzdGlja3lPZmZzZXQ7XG5cbiAgICAgICAgaWYgKCFzZWxmLmJyZWFrcG9pbnQoKSkge1xuICAgICAgICAgIHZhciBkb1RvZ2dsZSA9IHRvcGJhci5oYXNDbGFzcygnZXhwYW5kZWQnKTtcbiAgICAgICAgICB0b3BiYXJcbiAgICAgICAgICAgIC5jc3MoJ2hlaWdodCcsICcnKVxuICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdleHBhbmRlZCcpXG4gICAgICAgICAgICAuZmluZCgnbGknKVxuICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdob3ZlcicpO1xuXG4gICAgICAgICAgICBpZiAoZG9Ub2dnbGUpIHtcbiAgICAgICAgICAgICAgc2VsZi50b2dnbGUodG9wYmFyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZWxmLmlzX3N0aWNreSh0b3BiYXIsIHN0aWNreUNvbnRhaW5lciwgc2V0dGluZ3MpKSB7XG4gICAgICAgICAgaWYgKHN0aWNreUNvbnRhaW5lci5oYXNDbGFzcygnZml4ZWQnKSkge1xuICAgICAgICAgICAgLy8gUmVtb3ZlIHRoZSBmaXhlZCB0byBhbGxvdyBmb3IgY29ycmVjdCBjYWxjdWxhdGlvbiBvZiB0aGUgb2Zmc2V0LlxuICAgICAgICAgICAgc3RpY2t5Q29udGFpbmVyLnJlbW92ZUNsYXNzKCdmaXhlZCcpO1xuXG4gICAgICAgICAgICBzdGlja3lPZmZzZXQgPSBzdGlja3lDb250YWluZXIub2Zmc2V0KCkudG9wO1xuICAgICAgICAgICAgaWYgKHNlbGYuUyhkb2N1bWVudC5ib2R5KS5oYXNDbGFzcygnZi10b3BiYXItZml4ZWQnKSkge1xuICAgICAgICAgICAgICBzdGlja3lPZmZzZXQgLT0gdG9wYmFyLmRhdGEoJ2hlaWdodCcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0b3BiYXIuZGF0YSgnc3RpY2t5b2Zmc2V0Jywgc3RpY2t5T2Zmc2V0KTtcbiAgICAgICAgICAgIHN0aWNreUNvbnRhaW5lci5hZGRDbGFzcygnZml4ZWQnKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RpY2t5T2Zmc2V0ID0gc3RpY2t5Q29udGFpbmVyLm9mZnNldCgpLnRvcDtcbiAgICAgICAgICAgIHRvcGJhci5kYXRhKCdzdGlja3lvZmZzZXQnLCBzdGlja3lPZmZzZXQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgYnJlYWtwb2ludCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiAhbWF0Y2hNZWRpYShGb3VuZGF0aW9uLm1lZGlhX3F1ZXJpZXNbJ3RvcGJhciddKS5tYXRjaGVzO1xuICAgIH0sXG5cbiAgICBzbWFsbCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBtYXRjaE1lZGlhKEZvdW5kYXRpb24ubWVkaWFfcXVlcmllc1snc21hbGwnXSkubWF0Y2hlcztcbiAgICB9LFxuXG4gICAgbWVkaXVtIDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG1hdGNoTWVkaWEoRm91bmRhdGlvbi5tZWRpYV9xdWVyaWVzWydtZWRpdW0nXSkubWF0Y2hlcztcbiAgICB9LFxuXG4gICAgbGFyZ2UgOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbWF0Y2hNZWRpYShGb3VuZGF0aW9uLm1lZGlhX3F1ZXJpZXNbJ2xhcmdlJ10pLm1hdGNoZXM7XG4gICAgfSxcblxuICAgIGFzc2VtYmxlIDogZnVuY3Rpb24gKHRvcGJhcikge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgIHNldHRpbmdzID0gdG9wYmFyLmRhdGEodGhpcy5hdHRyX25hbWUodHJ1ZSkgKyAnLWluaXQnKSxcbiAgICAgICAgICBzZWN0aW9uID0gc2VsZi5TKCdzZWN0aW9uLCAudG9wLWJhci1zZWN0aW9uJywgdG9wYmFyKTtcblxuICAgICAgLy8gUHVsbCBlbGVtZW50IG91dCBvZiB0aGUgRE9NIGZvciBtYW5pcHVsYXRpb25cbiAgICAgIHNlY3Rpb24uZGV0YWNoKCk7XG5cbiAgICAgIHNlbGYuUygnLmhhcy1kcm9wZG93bj5hJywgc2VjdGlvbikuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciAkbGluayA9IHNlbGYuUyh0aGlzKSxcbiAgICAgICAgICAgICRkcm9wZG93biA9ICRsaW5rLnNpYmxpbmdzKCcuZHJvcGRvd24nKSxcbiAgICAgICAgICAgIHVybCA9ICRsaW5rLmF0dHIoJ2hyZWYnKSxcbiAgICAgICAgICAgICR0aXRsZUxpO1xuXG4gICAgICAgIGlmICghJGRyb3Bkb3duLmZpbmQoJy50aXRsZS5iYWNrJykubGVuZ3RoKSB7XG5cbiAgICAgICAgICBpZiAoc2V0dGluZ3MubW9iaWxlX3Nob3dfcGFyZW50X2xpbmsgPT0gdHJ1ZSAmJiB1cmwpIHtcbiAgICAgICAgICAgICR0aXRsZUxpID0gJCgnPGxpIGNsYXNzPVwidGl0bGUgYmFjayBqcy1nZW5lcmF0ZWRcIj48aDU+PGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiPjwvYT48L2g1PjwvbGk+PGxpIGNsYXNzPVwicGFyZW50LWxpbmsgaGlkZS1mb3ItbWVkaXVtLXVwXCI+PGEgY2xhc3M9XCJwYXJlbnQtbGluayBqcy1nZW5lcmF0ZWRcIiBocmVmPVwiJyArIHVybCArICdcIj4nICsgJGxpbmsuaHRtbCgpICsnPC9hPjwvbGk+Jyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICR0aXRsZUxpID0gJCgnPGxpIGNsYXNzPVwidGl0bGUgYmFjayBqcy1nZW5lcmF0ZWRcIj48aDU+PGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiPjwvYT48L2g1PicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIENvcHkgbGluayB0byBzdWJuYXZcbiAgICAgICAgICBpZiAoc2V0dGluZ3MuY3VzdG9tX2JhY2tfdGV4dCA9PSB0cnVlKSB7XG4gICAgICAgICAgICAkKCdoNT5hJywgJHRpdGxlTGkpLmh0bWwoc2V0dGluZ3MuYmFja190ZXh0KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJCgnaDU+YScsICR0aXRsZUxpKS5odG1sKCcmbGFxdW87ICcgKyAkbGluay5odG1sKCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAkZHJvcGRvd24ucHJlcGVuZCgkdGl0bGVMaSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBQdXQgZWxlbWVudCBiYWNrIGluIHRoZSBET01cbiAgICAgIHNlY3Rpb24uYXBwZW5kVG8odG9wYmFyKTtcblxuICAgICAgLy8gY2hlY2sgZm9yIHN0aWNreVxuICAgICAgdGhpcy5zdGlja3koKTtcblxuICAgICAgdGhpcy5hc3NlbWJsZWQodG9wYmFyKTtcbiAgICB9LFxuXG4gICAgYXNzZW1ibGVkIDogZnVuY3Rpb24gKHRvcGJhcikge1xuICAgICAgdG9wYmFyLmRhdGEodGhpcy5hdHRyX25hbWUodHJ1ZSksICQuZXh0ZW5kKHt9LCB0b3BiYXIuZGF0YSh0aGlzLmF0dHJfbmFtZSh0cnVlKSksIHthc3NlbWJsZWQgOiB0cnVlfSkpO1xuICAgIH0sXG5cbiAgICBoZWlnaHQgOiBmdW5jdGlvbiAodWwpIHtcbiAgICAgIHZhciB0b3RhbCA9IDAsXG4gICAgICAgICAgc2VsZiA9IHRoaXM7XG5cbiAgICAgICQoJz4gbGknLCB1bCkuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRvdGFsICs9IHNlbGYuUyh0aGlzKS5vdXRlckhlaWdodCh0cnVlKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gdG90YWw7XG4gICAgfSxcblxuICAgIHN0aWNreSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgdGhpcy5TKHdpbmRvdykub24oJ3Njcm9sbCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VsZi51cGRhdGVfc3RpY2t5X3Bvc2l0aW9uaW5nKCk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgdXBkYXRlX3N0aWNreV9wb3NpdGlvbmluZyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBrbGFzcyA9ICcuJyArIHRoaXMuc2V0dGluZ3Muc3RpY2t5X2NsYXNzLFxuICAgICAgICAgICR3aW5kb3cgPSB0aGlzLlMod2luZG93KSxcbiAgICAgICAgICBzZWxmID0gdGhpcztcblxuICAgICAgaWYgKHNlbGYuc2V0dGluZ3Muc3RpY2t5X3RvcGJhciAmJiBzZWxmLmlzX3N0aWNreSh0aGlzLnNldHRpbmdzLnN0aWNreV90b3BiYXIsdGhpcy5zZXR0aW5ncy5zdGlja3lfdG9wYmFyLnBhcmVudCgpLCB0aGlzLnNldHRpbmdzKSkge1xuICAgICAgICB2YXIgZGlzdGFuY2UgPSB0aGlzLnNldHRpbmdzLnN0aWNreV90b3BiYXIuZGF0YSgnc3RpY2t5b2Zmc2V0JykgKyB0aGlzLnNldHRpbmdzLnN0YXJ0X29mZnNldDtcbiAgICAgICAgaWYgKCFzZWxmLlMoa2xhc3MpLmhhc0NsYXNzKCdleHBhbmRlZCcpKSB7XG4gICAgICAgICAgaWYgKCR3aW5kb3cuc2Nyb2xsVG9wKCkgPiAoZGlzdGFuY2UpKSB7XG4gICAgICAgICAgICBpZiAoIXNlbGYuUyhrbGFzcykuaGFzQ2xhc3MoJ2ZpeGVkJykpIHtcbiAgICAgICAgICAgICAgc2VsZi5TKGtsYXNzKS5hZGRDbGFzcygnZml4ZWQnKTtcbiAgICAgICAgICAgICAgc2VsZi5TKCdib2R5JykuYWRkQ2xhc3MoJ2YtdG9wYmFyLWZpeGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmICgkd2luZG93LnNjcm9sbFRvcCgpIDw9IGRpc3RhbmNlKSB7XG4gICAgICAgICAgICBpZiAoc2VsZi5TKGtsYXNzKS5oYXNDbGFzcygnZml4ZWQnKSkge1xuICAgICAgICAgICAgICBzZWxmLlMoa2xhc3MpLnJlbW92ZUNsYXNzKCdmaXhlZCcpO1xuICAgICAgICAgICAgICBzZWxmLlMoJ2JvZHknKS5yZW1vdmVDbGFzcygnZi10b3BiYXItZml4ZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgb2ZmIDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5TKHRoaXMuc2NvcGUpLm9mZignLmZuZHRuLnRvcGJhcicpO1xuICAgICAgdGhpcy5TKHdpbmRvdykub2ZmKCcuZm5kdG4udG9wYmFyJyk7XG4gICAgfSxcblxuICAgIHJlZmxvdyA6IGZ1bmN0aW9uICgpIHt9XG4gIH07XG59KGpRdWVyeSwgd2luZG93LCB3aW5kb3cuZG9jdW1lbnQpKTtcbiIsIi8qKlxuICogQGZpbGVcbiAqIEEgSmF2YVNjcmlwdCBmaWxlIGZvciB0aGUgdGhlbWUuXG4gKi9cblxuLy8gSmF2YVNjcmlwdCBzaG91bGQgYmUgbWFkZSBjb21wYXRpYmxlIHdpdGggbGlicmFyaWVzIG90aGVyIHRoYW4galF1ZXJ5IGJ5XG4vLyB3cmFwcGluZyBpdCB3aXRoIGFuIFwiYW5vbnltb3VzIGNsb3N1cmVcIi4gU2VlOlxuLy8gLSBodHRwOi8vZHJ1cGFsLm9yZy9ub2RlLzE0NDY0MjBcbi8vIC0gaHR0cDovL3d3dy5hZGVxdWF0ZWx5Z29vZC5jb20vMjAxMC8zL0phdmFTY3JpcHQtTW9kdWxlLVBhdHRlcm4tSW4tRGVwdGhcbiFmdW5jdGlvbiAoJCkge1xuICAvLyBBbHdheXMgdXNlIHN0cmljdCBtb2RlIHRvIGVuYWJsZSBiZXR0ZXIgZXJyb3IgaGFuZGxpbmcgaW4gbW9kZXJuIGJyb3dzZXJzLlxuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBQbGFjZSB5b3VyIGNvZGUgaGVyZS5cblxufShqUXVlcnkpO1xuIiwiLyoqXG4gKiBAZmlsZVxuICogQSBKYXZhU2NyaXB0IGZpbGUgZm9yIHRoZSB0aGVtZS5cbiAqL1xuXG4vLyBKYXZhU2NyaXB0IHNob3VsZCBiZSBtYWRlIGNvbXBhdGlibGUgd2l0aCBsaWJyYXJpZXMgb3RoZXIgdGhhbiBqUXVlcnkgYnlcbi8vIHdyYXBwaW5nIGl0IHdpdGggYW4gXCJhbm9ueW1vdXMgY2xvc3VyZVwiLiBTZWU6XG4vLyAtIGh0dHA6Ly9kcnVwYWwub3JnL25vZGUvMTQ0NjQyMFxuLy8gLSBodHRwOi8vd3d3LmFkZXF1YXRlbHlnb29kLmNvbS8yMDEwLzMvSmF2YVNjcmlwdC1Nb2R1bGUtUGF0dGVybi1Jbi1EZXB0aFxuIWZ1bmN0aW9uICgkKSB7XG4gIC8vIEFsd2F5cyB1c2Ugc3RyaWN0IG1vZGUgdG8gZW5hYmxlIGJldHRlciBlcnJvciBoYW5kbGluZyBpbiBtb2Rlcm4gYnJvd3NlcnMuXG4gIFwidXNlIHN0cmljdFwiO1xuXG4gICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgICQoZG9jdW1lbnQpLmZvdW5kYXRpb24oKTtcbiAgfSk7XG5cbn0oalF1ZXJ5KTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
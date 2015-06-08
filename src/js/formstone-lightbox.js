/**
 * @plugin
 * @name Core
 * @description Formstone Library core. Required for all plugins.
 */

var Formstone = this.Formstone = (function ($, window, document, undefined) {

	/* global ga */

	"use strict";

	// Namespace

	var Core = function() {
			this.Version = '@version';
			this.Plugins = {};
			this.ResizeHandlers = [];

			// Globals

			this.window               = window;
			this.$window              = $(window);
			this.document             = document;
			this.$document            = $(document);
			this.$body                = null;

			this.windowWidth          = 0;
			this.windowHeight         = 0;
			this.userAgent            = window.navigator.userAgent || window.navigator.vendor || window.opera;
			this.isFirefox            = /Firefox/i.test(this.userAgent);
			this.isChrome             = /Chrome/i.test(this.userAgent);
			this.isSafari             = /Safari/i.test(this.userAgent) && !this.isChrome;
			this.isMobile             = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test( this.userAgent );
			this.isFirefoxMobile      = (this.isFirefox && this.isMobile);
			this.transform            = null;
			this.transition           = null;

			this.support = {
				file          : !!(window.File && window.FileList && window.FileReader),
				history       : !!(window.history && window.history.pushState && window.history.replaceState),
				matchMedia    : !!(window.matchMedia || window.msMatchMedia),
				raf           : !!(window.requestAnimationFrame && window.cancelAnimationFrame),
				touch         : !!(("ontouchstart" in window) || window.DocumentTouch && document instanceof window.DocumentTouch),
				transition    : false,
				transform     : false
			};
		},

		Functions = {

			/**
			 * @method private
			 * @name killEvent
			 * @description Stops event action and bubble.
			 * @param e [object] "Event data"
			 */

			killEvent: function(e, immediate) {
				try {
					e.preventDefault();
					e.stopPropagation();

					if (immediate) {
						e.stopImmediatePropagation();
					}
				} catch(error) {
					//
				}
			},

			/**
			 * @method private
			 * @name startTimer
			 * @description Starts an internal timer.
			 * @param timer [int] "Timer ID"
			 * @param time [int] "Time until execution"
			 * @param callback [function] "Function to execute"
			 * @return [int] "Timer ID"
			 */

			startTimer: function(timer, time, callback, interval) {
				Functions.clearTimer(timer);

				return (interval) ? setInterval(callback, time) : setTimeout(callback, time);
			},

			/**
			 * @method private
			 * @name clearTimer
			 * @description Clears an internal timer.
			 * @param timer [int] "Timer ID"
			 */

			clearTimer: function(timer, interval) {
				if (timer) {
					if (interval) {
						clearInterval(timer);
					} else {
						clearTimeout(timer);
					}

					timer = null;
				}
			},

			/**
			 * @method private
			 * @name sortAsc
			 * @description Sorts an array (ascending).
			 * @param a [mixed] "First value"
			 * @param b [mixed] "Second value"
			 * @return Difference between second and first values
			 */

			sortAsc: function(a, b) {
				return (parseInt(b) - parseInt(a));
			},

			/**
			 * @method private
			 * @name sortDesc
			 * @description Sorts an array (descending).
			 * @param a [mixed] "First value"
			 * @param b [mixed] "Second value"
			 * @return Difference between second and first values
			 */

			sortDesc: function(a, b) {
				return (parseInt(b) - parseInt(a));
			}
		},

		Formstone = new Core(),

		// Classes

		Classes = {
			base                 : "{ns}",
			element              : "{ns}-element"
		},

		// Events

		Events = {
			namespace            : ".{ns}",
			blur                 : "blur.{ns}",
			change               : "change.{ns}",
			click                : "click.{ns}",
			dblClick             : "dblclick.{ns}",
			drag                 : "drag.{ns}",
			dragEnd              : "dragend.{ns}",
			dragEnter            : "dragenter.{ns}",
			dragLeave            : "dragleave.{ns}",
			dragOver             : "dragover.{ns}",
			dragStart            : "dragstart.{ns}",
			drop                 : "drop.{ns}",
			error                : "error.{ns}",
			focus                : "focus.{ns}",
			focusIn              : "focusin.{ns}",
			focusOut             : "focusout.{ns}",
			input                : "input.{ns}",
			keyDown              : "keydown.{ns}",
			keyPress             : "keypress.{ns}",
			keyUp                : "keyup.{ns}",
			load                 : "load.{ns}",
			mouseDown            : "mousedown.{ns}",
			mouseEnter           : "mouseenter.{ns}",
			mouseLeave           : "mouseleave.{ns}",
			mouseMove            : "mousemove.{ns}",
			mouseOut             : "mouseout.{ns}",
			mouseOver            : "mouseover.{ns}",
			mouseUp              : "mouseup.{ns}",
			resize               : "resize.{ns}",
			scroll               : "scroll.{ns}",
			select               : "select.{ns}",
			touchCancel          : "touchcancel.{ns}",
			touchEnd             : "touchend.{ns}",
			touchLeave           : "touchleave.{ns}",
			touchMove            : "touchmove.{ns}",
			touchStart           : "touchstart.{ns}"
		};

	/**
	 * @method
	 * @name Plugin
	 * @description Builds a plugin and registers it with jQuery.
	 * @param namespace [string] "Plugin namespace"
	 * @param settings [object] "Plugin settings"
	 * @return [object] "Plugin properties. Includes `defaults`, `classes`, `events`, `functions`, `methods` and `utilities` keys"
	 * @example Formstone.Plugin("namespace", { ... });
	 */

	Core.prototype.Plugin = function(namespace, settings) {
		Formstone.Plugins[namespace] = (function(namespace, settings) {

			var namespaceDash = "fs-" + namespace,
				namespaceDot  = "fs." + namespace;

			/**
			 * @method private
			 * @name initialize
			 * @description Creates plugin instance by adding base classname, creating data and scoping a _construct call.
			 * @param options [object] <{}> "Instance options"
			 */

			function initialize(options) {
				// Extend Defaults

				var hasOptions = $.type(options) === "object";

				options = $.extend(true, {}, settings.defaults || {}, (hasOptions ? options : {}));

				// Maintain Chain

				var $targets = this;

				for (var i = 0, count = $targets.length; i < count; i++) {
					var $element = $targets.eq(i);

					// Gaurd Against Exiting Instances

					if (!getData($element)) {

						// Extend w/ Local Options

						var localOptions = $element.data(namespace + "-options"),
							data = $.extend(true, {
								$el : $element
							}, options, ($.type(localOptions) === "object" ? localOptions : {}) );

						// Cache Instance

						$element.addClass(settings.classes.raw.element)
						        .data(namespaceDash, data);

						// Setup

						setupPlugin(namespace);

						// Constructor

						settings.methods._construct.apply($element, [ data ].concat(Array.prototype.slice.call(arguments, (hasOptions ? 1 : 0) )));
					}

				}

				return $targets;
			}

			/**
			 * @method private
			 * @name destroy
			 * @description Removes plugin instance by scoping a _destruct call, and removing the base classname and data.
			 * @param data [object] <{}> "Instance data"
			 */

			/**
			 * @method widget
			 * @name destroy
			 * @description Removes plugin instance.
			 * @example $(".target").{ns}("destroy");
			 */

			function destroy(data) {
				settings.functions.iterate.apply(this, [ settings.methods._destruct ].concat(Array.prototype.slice.call(arguments, 1)));

				this.removeClass(settings.classes.raw.element)
					.removeData(namespaceDash);
			}

			/**
			 * @method private
			 * @name getData
			 * @description Creates class selector from text.
			 * @param $element [jQuery] "Target jQuery object"
			 * @return [object] "Instance data"
			 */

			function getData($element) {
				return $element.data(namespaceDash);
			}

			/**
			 * @method private
			 * @name delegateWidget
			 * @description Delegates public methods.
			 * @param method [string] "Method to execute"
			 * @return [jQuery] "jQuery object"
			 */

			function delegateWidget(method) {

				// If jQuery object

				if (this instanceof $) {

					var _method = settings.methods[method];

					// Public method OR false

					if ($.type(method) === "object" || !method) {

						// Initialize

						return initialize.apply(this, arguments);
					} else if (_method && method.indexOf("_") !== 0) {

						// Wrap Public Methods

						return settings.functions.iterate.apply(this, [ _method ].concat(Array.prototype.slice.call(arguments, 1)));
					}

					return this;
				}
			}

			/**
			 * @method private
			 * @name delegateUtility
			 * @description Delegates utility methods.
			 * @param method [string] "Method to execute"
			 */

			function delegateUtility(method) {

				// public utility OR utility init OR false

				var _method = settings.utilities[method] || settings.utilities._initialize || false;

				if (_method) {

					// Wrap Utility Methods

					return _method.apply(window, Array.prototype.slice.call(arguments, ($.type(method) === "object" ? 0 : 1) ));
				}
			}

			/**
			 * @method utility
			 * @name defaults
			 * @description Extends plugin default settings; effects instances created hereafter.
			 * @param options [object] <{}> "New plugin defaults"
			 * @example $.{ns}("defaults", { ... });
			 */

			function defaults(options) {
				settings.defaults = $.extend(true, settings.defaults, options || {});
			}

			/**
			 * @method private
			 * @name iterate
			 * @description Loops scoped function calls over jQuery object with instance data as first parameter.
			 * @param func [function] "Function to execute"
			 * @return [jQuery] "jQuery object"
			 */

			function iterate(fn) {
				var $targets = this;

				for (var i = 0, count = $targets.length; i < count; i++) {
					var $element = $targets.eq(i),
						data = getData($element) || {};

					if ($.type(data.$el) !== "undefined") {
						fn.apply($element, [ data ].concat(Array.prototype.slice.call(arguments, 1)));
					}
				}

				return $targets;
			}

			// Locals

			settings.initialized = false;
			settings.priority    = settings.priority || 10;

			// Namespace Classes & Events

			settings.classes   = namespaceProperties("classes", namespaceDash, Classes, settings.classes);
			settings.events    = namespaceProperties("events",  namespace,     Events,  settings.events);

			// Extend Functions

			settings.functions = $.extend({
				getData    : getData,
				iterate    : iterate
			}, Functions, settings.functions);

			// Extend Methods

			settings.methods = $.extend(true, {

				// Private Methods

				_setup         : $.noop,    // Document ready
				_construct     : $.noop,    // Constructor
				_destruct      : $.noop,    // Destructor
				_resize        : false,    // Window resize

				// Public Methods

				destroy        : destroy

			}, settings.methods);

			// Extend Utilities

			settings.utilities = $.extend(true, {

				// Private Utilities

				_initialize    : false,    // First Run
				_delegate      : false,    // Custom Delegation

				// Public Utilities

				defaults       : defaults

			}, settings.utilities);

			// Register Plugin

			// Widget

			if (settings.widget) {

				// Widget Delegation: $(".target").plugin("method", ...);
				$.fn[namespace] = delegateWidget;
			}

			// Utility

				// Utility Delegation: $.plugin("method", ... );
				$[namespace] = settings.utilities._delegate || delegateUtility;

			// Run Setup

			settings.namespace = namespace;

			// Resize handler

			if (settings.methods._resize) {
				Formstone.ResizeHandlers.push({
					namespace: namespace,
					priority: settings.priority,
					callback: settings.methods._resize
				});

				// Sort handlers on push
				Formstone.ResizeHandlers.sort(sortPriority);
			}

			return settings;
		})(namespace, settings);

		return Formstone.Plugins[namespace];
	};

	// Setup Plugins

	function setupPlugin(namespace) {
		if (!Formstone.Plugins[namespace].initialized) {
			Formstone.Plugins[namespace].methods._setup.call(document);
			Formstone.Plugins[namespace].initialized = true;
		}
	}

	// Namespace Properties

	function namespaceProperties(type, namespace, globalProps, customProps) {
		var _props = {
				raw: {}
			},
			i;

		customProps = customProps || {};

		for (i in customProps) {
			if (customProps.hasOwnProperty(i)) {
				if (type === "classes") {

					// Custom classes
					_props.raw[ customProps[i] ] = namespace + "-" + customProps[i];
					_props[ customProps[i] ]     = "." + namespace + "-" + customProps[i];
				} else {
					// Custom events
					_props.raw[ i ] = customProps[i];
					_props[ i ]     = customProps[i] + "." + namespace;
				}
			}
		}

		for (i in globalProps) {
			if (globalProps.hasOwnProperty(i)) {
				if (type === "classes") {

					// Global classes
					_props.raw[ i ] = globalProps[i].replace(/{ns}/g, namespace);
					_props[ i ]     = globalProps[i].replace(/{ns}/g, "." + namespace);
				} else {
					// Global events
					_props.raw[ i ] = globalProps[i].replace(/.{ns}/g, "");
					_props[ i ]     = globalProps[i].replace(/{ns}/g, namespace);
				}
			}
		}

		return _props;
	}

	// Set Transition Information

	function setTransitionInformation() {
		var transitionEvents = {
				"transition"          : "transitionend",
				"MozTransition"       : "transitionend",
				"OTransition"         : "otransitionend",
				"WebkitTransition"    : "webkitTransitionEnd"
			},
			transitionProperties = [
				"transition",
				"-webkit-transition"
			],
			transformProperties = {
				'transform'          : 'transform',
				'MozTransform'       : '-moz-transform',
				'OTransform'         : '-o-transform',
				'msTransform'        : '-ms-transform',
				'webkitTransform'    : '-webkit-transform'
			},
			transitionEvent       = "transitionend",
			transitionProperty    = "",
			transformProperty     = "",
			test                  = document.createElement("div"),
			i;


		for (i in transitionEvents) {
			if (transitionEvents.hasOwnProperty(i) && i in test.style) {
				transitionEvent = transitionEvents[i];
				Formstone.support.transition = true;
				break;
			}
		}

		Events.transitionEnd = transitionEvent + ".{ns}";

		for (i in transitionProperties) {
			if (transitionProperties.hasOwnProperty(i) && transitionProperties[i] in test.style) {
				transitionProperty = transitionProperties[i];
				break;
			}
		}

		Formstone.transition = transitionProperty;

		for (i in transformProperties) {
			if (transformProperties.hasOwnProperty(i) && transformProperties[i] in test.style) {
				Formstone.support.transform = true;
				transformProperty = transformProperties[i];
				break;
			}
		}

		Formstone.transform = transformProperty;
	}

	// Window resize

	var ResizeTimer = null,
		Debounce = 20;

	function onWindowResize() {
		Formstone.windowWidth  = Formstone.$window.width();
		Formstone.windowHeight = Formstone.$window.height();

		ResizeTimer = Functions.startTimer(ResizeTimer, Debounce, handleWindowResize);
	}

	function handleWindowResize() {
		for (var i in Formstone.ResizeHandlers) {
			if (Formstone.ResizeHandlers.hasOwnProperty(i)) {
				Formstone.ResizeHandlers[i].callback.call(window, Formstone.windowWidth, Formstone.windowHeight);
			}
		}
	}

	Formstone.$window.on("resize.fs", onWindowResize);
	onWindowResize();

	// Sort Priority

	function sortPriority(a, b) {
		return (parseInt(a.priority) - parseInt(b.priority));
	}

	// Document Ready

	$(function() {
		Formstone.$body = $("body");

		for (var i in Formstone.Plugins) {
			if (Formstone.Plugins.hasOwnProperty(i)) {
				setupPlugin(i);
			}
		}
	});

	// Custom Events

	Events.clickTouchStart = Events.click + " " + Events.touchStart;

	// Transitions

	setTransitionInformation();

	return Formstone;

})(jQuery, this, document);


;(function ($, Formstone, undefined) {

	"use strict";

	/**
	 * @method private
	 * @name construct
	 * @description Builds instance.
	 * @param data [object] "Instance Data"
	 * @param callback [object] "Function to call"
	 */

	function construct(data, callback) {
		if (callback) {
			// Target child element, for event delegation

			data.$target     = this.find(data.target);
			data.$check      = data.target ? data.$target : this;
			data.callback    = callback;
			data.styles      = getStyles(data.$check);
			data.timer       = null;

			var duration = data.$check.css( Formstone.transition + "-duration" ),
				durationValue = parseFloat(duration);

			if (Formstone.support.transition && duration && durationValue) {
				// If transitions supported and active

				this.on(Events.transitionEnd, data, onTranistionEnd);
			} else {
				data.timer = Functions.startTimer(data.timer, 50, function() {
					checkStyles(data);
				}, true);
			}
		}
	}

	/**
	 * @method private
	 * @name destruct
	 * @description Tears down instance.
	 * @param data [object] "Instance data"
	 */

	function destruct(data) {
		Functions.clearTimer(data.timer, true);

		this.off(Events.namespace);
	}

	/**
	 * @method private
	 * @name onTransitionEnd
	 * @description Handles transition end events.
	 * @param e [object] "Event data"
	 */

	function onTranistionEnd(e) {
		e.stopPropagation();
		e.preventDefault();

		var data           = e.data,
			oe             = e.originalEvent,
			$target        = data.target ? data.$target : data.$el;

		// Check property and target
		if ( (!data.property || oe.propertyName === data.property) && $(oe.target).is($target) ) {
			resolve(data);
		}
	}

	/**
	 * @method private
	 * @name resolve
	 * @description Resolves transition end events.
	 * @param e [object] "Event data"
	 */
	/**
	 * @method
	 * @name resolve
	 * @description Resolves current transition end events.
	 * @example $(".target").transition("resolve");
	 */

	function resolve(data) {
		if (!data.always) {
			// Unbind events, clear timers, similiar to .one()

			data.$el[Plugin.namespace]("destroy"); // clean up old data?
		}

		// fire callback

		data.callback.apply(data.$el);
	}

	/**
	 * @method private
	 * @name checkStyles
	 * @description Compares current CSS to previous styles.
	 * @param data [object] "Instance data"
	 */

	function checkStyles(data) {
		var styles = getStyles(data.$check);

		if (!isEqual(data.styles, styles)) {
			resolve(data);
		}

		data.styles = styles;
	}

	/**
	 * @method private
	 * @name getStyles
	 * @description Returns element's styles.
	 * @param el [DOM] "Element to check"
	 */

	function getStyles(el) {
		var computed,
			styles = {},
			prop,
			val;

		if (el instanceof $) {
			el = el[0];
		}

		if (Window.getComputedStyle) {
			// FireFox, Chrome, Safari

			computed = Window.getComputedStyle(el, null);

			for (var i = 0, count = computed.length; i < count; i++) {
				prop = computed[i];
				val = computed.getPropertyValue(prop);

				styles[prop] = val;
			}
		} else if (el.currentStyle) {
			// IE, Opera

			computed = el.currentStyle;

			for (prop in computed) {
				if (computed[prop]) { // ie8...
					styles[prop] = computed[prop];
				}
			}
		}

		return styles;
	}

	/**
	 * @method private
	 * @name isEqual
	 * @description Compares two obejcts.
	 * @param a [object] "Object to compare"
	 * @param b [object] "Object to compare"
	 */

	function isEqual(a, b) {
		if ($.type(a) !== $.type(b)) {
			return false;
		}

		for (var i in a) {
			if ( !(a.hasOwnProperty(i) && b.hasOwnProperty(i) && a[i] === b[i]) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * @plugin
	 * @name Transition
	 * @description A jQuery plugin for CSS transition events.
	 * @type widget
	 * @dependency core.js
	 */

	var Plugin = Formstone.Plugin("transition", {
			widget: true,

			/**
			 * @options
			 * @param always [boolean] <False> "Flag to always react to transition end (.on vs .one)"
			 * @param property [string] <null> "Property to react to"
			 * @param target [string] <null> "Target child selector"
			 */

			defaults: {
				always      : false,
				property    : null,
				target      : null
			},

			methods : {
				_construct    : construct,
				_destruct     : destruct,
				resolve       : resolve
			}
		}),

		// Localize References

		Events       = Plugin.events,
		Functions    = Plugin.functions,

		Window       = Formstone.window;

})(jQuery, Formstone);

;(function ($, Formstone, undefined) {

	"use strict";

	/**
	 * @method private
	 * @name setup
	 * @description Setup plugin.
	 */

	function setup() {
		$Body = Formstone.$body;
		$Locks = $("html, body");
	}

	/**
	 * @method private
	 * @name resize
	 * @description Handles window resize
	 */

	function resize() {
		if (Instance) {
			resizeLightbox();
		}
	}

	/**
	 * @method private
	 * @name construct
	 * @description Builds instance.
	 * @param data [object] "Instance data"
	 */

	function construct(data) {
		this.on(Events.click, data, buildLightbox);
	}

	/**
	 * @method private
	 * @name destruct
	 * @description Tears down instance.
	 * @param data [object] "Instance data"
	 */

	function destruct(data) {
		closeLightbox();

		this.off(Events.namespace);
	}

	/**
	 * @method private
	 * @name initialize
	 * @description Builds instance from $target.
	 * @param $target [jQuery] "Target jQuery object"
	 */

	function initialize($target, options) {
		if ($target instanceof $) {

			// Emulate event

			buildLightbox.apply(Window, [{ data: $.extend({}, {
				$object: $target
			}, Defaults, options || {}) }]);
		}
	}

	/**
	 * @method private
	 * @name buildLightbox
	 * @description Builds new lightbox.
	 * @param e [object] "Event data"
	 */

	function buildLightbox(e) {
		if (!Instance) {
			// Check target type
			var data           = e.data,
				$el            = data.$el,
				$object        = data.$object,
				source         = ($el && $el[0].href) ? $el[0].href || "" : "",
				hash           = ($el && $el[0].hash) ? $el[0].hash || "" : "",
				sourceParts    = source.toLowerCase().split(".").pop().split(/\#|\?/),
				extension      = sourceParts[0],
				type           = ($el) ? $el.data(Namespace + "-type") : "",
				isImage	       = ( (type === "image") || ($.inArray(extension, data.extensions) > -1 || source.substr(0, 10) === "data:image") ),
				isVideo	       = checkVideo(source),
				isUrl	       = ( (type === "url") || (!isImage && !isVideo && source.substr(0, 4) === "http" && !hash) ),
				isElement      = ( (type === "element") || (!isImage && !isVideo && !isUrl && (hash.substr(0, 1) === "#")) ),
				isObject       = ( (typeof $object !== "undefined") );

			if (isElement) {
				source = hash;
			}

			// Retain default click
			if ( !(isImage || isVideo || isUrl || isElement || isObject) ) {
				return;
			}

			// Kill event
			Functions.killEvent(e);

			// Cache internal data
			Instance = $.extend({}, {
				visible            : false,
				gallery: {
					active         : false
				},
				isMobile           : (Formstone.isMobile || data.mobile),
				isTouch            : Formstone.support.touch,
				isAnimating        : true,
				oldContentHeight   : 0,
				oldContentWidth    : 0
			}, data);

			// Double the margin
			Instance.margin *= 2;

			if (isImage) {
				Instance.type = "image";
			} else if (isVideo) {
				Instance.type = "video";
			} else {
				Instance.type = "element";
			}

			if (isImage || isVideo) {
				// Check for gallery
				var id = $el.data(Namespace + "-gallery");

				if (id) {
					Instance.gallery.active    = true;
					Instance.gallery.id        = id;
					Instance.gallery.$items    = $("a[data-lightbox-gallery= " + Instance.gallery.id + "], a[rel= " + Instance.gallery.id + "]"); // backwards compatibility
					Instance.gallery.index     = Instance.gallery.$items.index(Instance.$el);
					Instance.gallery.total     = Instance.gallery.$items.length - 1;
				}
			}

			// Assemble HTML
			var html = '';
			if (!Instance.isMobile) {
				html += '<div class="' + [Classes.raw.overlay, Instance.customClass].join(" ") + '"></div>';
			}
			var lightboxClasses = [
				Classes.raw.base,
				Classes.raw.loading,
				Classes.raw.animating,
				Instance.customClass
			];

			if (Instance.fixed) {
				lightboxClasses.push(Classes.raw.fixed);
			}
			if (Instance.isMobile) {
				lightboxClasses.push(Classes.raw.mobile);
			}
			if (Instance.isTouch) {
				lightboxClasses.push(Classes.raw.touch);
			}
			if (isUrl) {
				lightboxClasses.push(Classes.raw.iframed);
			}
			if (isElement || isObject) {
				lightboxClasses.push(Classes.raw.inline);
			}

			html += '<div class="' + lightboxClasses.join(" ") + '">';
			html += '<button type="button" class="' + Classes.raw.close + '">' + Instance.labels.close + '</button>';
			html += '<span class="' + Classes.raw.loading_icon + '"></span>';
			html += '<div class="' + Classes.raw.container + '">';
			html += '<div class="' + Classes.raw.content + '">';
			if (isImage || isVideo) {
				html += '<div class="' + Classes.raw.tools + '">';

				html += '<div class="' + Classes.raw.controls + '">';
				if (Instance.gallery.active) {
					html += '<button type="button" class="' + [Classes.raw.control, Classes.raw.control_previous].join(" ") + '">' + Instance.labels.previous + '</button>';
					html += '<button type="button" class="' + [Classes.raw.control, Classes.raw.control_next].join(" ") + '">' + Instance.labels.next + '</button>';
				}
				if (Instance.isMobile && Instance.isTouch) {
					html += '<button type="button" class="' + [Classes.raw.caption_toggle].join(" ") + '">' + Instance.labels.captionClosed + '</button>';
				}
				html += '</div>'; // controls

				html += '<div class="' + Classes.raw.meta + '">';
				if (Instance.gallery.active) {
					html += '<p class="' + Classes.raw.position + '"';
					if (Instance.gallery.total < 1) {
						html += ' style="display: none;"';
					}
					html += '>';
					html += '<span class="' + Classes.raw.position_current + '">' + (Instance.gallery.index + 1) + '</span> ';
					html += Instance.labels.count;
					html += ' <span class="' + Classes.raw.position_total + '">' + (Instance.gallery.total + 1) + '</span>';
					html += '</p>';
				}
				html += '<div class="' + Classes.raw.caption + '">';
				html += Instance.formatter.call($el, data);
				html += '</div></div>'; // caption, meta

				html += '</div>'; // tools
			}
			html += '</div></div></div>'; //container, content, lightbox

			// Modify Dom
			$Body.append(html);

			// Cache jquery objects
			Instance.$overlay          = $(Classes.overlay);
			Instance.$lightbox         = $(Classes.base);
			Instance.$close            = $(Classes.close);
			Instance.$container        = $(Classes.container);
			Instance.$content          = $(Classes.content);
			Instance.$tools            = $(Classes.tools);
			Instance.$meta             = $(Classes.meta);
			Instance.$position         = $(Classes.position);
			Instance.$caption          = $(Classes.caption);
			Instance.$controlBox       = $(Classes.controls);
			Instance.$controls         = $(Classes.control);

			if (Instance.isMobile) {
				Instance.paddingVertical   = Instance.$close.outerHeight();
				Instance.paddingHorizontal = 0;

				Instance.mobilePaddingVertical   = parseInt(Instance.$content.css("paddingTop"), 10)  + parseInt(Instance.$content.css("paddingBottom"), 10);
				Instance.mobilePaddingHorizontal = parseInt(Instance.$content.css("paddingLeft"), 10) + parseInt(Instance.$content.css("paddingRight"), 10);
			} else {
				Instance.paddingVertical   = parseInt(Instance.$lightbox.css("paddingTop"), 10)  + parseInt(Instance.$lightbox.css("paddingBottom"), 10);
				Instance.paddingHorizontal = parseInt(Instance.$lightbox.css("paddingLeft"), 10) + parseInt(Instance.$lightbox.css("paddingRight"), 10);

				Instance.mobilePaddingVertical   = 0;
				Instance.mobilePaddingHorizontal = 0;
			}

			Instance.contentHeight     = Instance.$lightbox.outerHeight() - Instance.paddingVertical;
			Instance.contentWidth      = Instance.$lightbox.outerWidth()  - Instance.paddingHorizontal;
			Instance.controlHeight     = Instance.$controls.outerHeight();

			// Center
			centerLightbox();

			// Update gallery
			if (Instance.gallery.active) {
				updateGalleryControls();
			}

			// Bind events
			$Window.on(Events.keyDown, onKeyDown);

			$Body.on(Events.clickTouchStart, [Classes.overlay, Classes.close].join(", "), closeLightbox);

			if (Instance.gallery.active) {
				Instance.$lightbox.on(Events.clickTouchStart, Classes.control, advanceGallery);
			}

			if (Instance.isMobile && Instance.isTouch) {
				Instance.$lightbox.on(Events.clickTouchStart, Classes.caption_toggle, toggleCaption);
			}

			Instance.$lightbox.transition({
				property: "opacity"
			},
			function() {
				if (isImage) {
					loadImage(source);
				} else if (isVideo) {
					loadVideo(source);
				} else if (isUrl) {
					loadURL(source);
				} else if (isElement) {
					cloneElement(source);
				} else if (isObject) {
					appendObject(Instance.$object);
				}
			}).addClass(Classes.raw.open);

			Instance.$overlay.addClass(Classes.raw.open);
		}
	}

	/**
	 * @method
	 * @name resize
	 * @description Resizes lightbox.
	 * @example $.lightbox("resize");
	 * @param height [int | false] "Target height or false to auto size"
	 * @param width [int | false] "Target width or false to auto size"
	 */

	/**
	 * @method private
	 * @name resizeLightbox
	 * @description Triggers resize of instance.
	 */

	function resizeLightbox(e) {
		if (typeof e !== "object") {
			Instance.targetHeight = arguments[0];
			Instance.targetWidth  = arguments[1];
		}

		if (Instance.type === "element") {
			sizeContent(Instance.$content.find("> :first-child"));
		} else if (Instance.type === "image") {
			sizeImage();
		} else if (Instance.type === "video") {
			sizeVideo();
		}

		sizeLightbox();
	}

	/**
	 * @method
	 * @name close
	 * @description Closes active instance.
	 * @example $.lightbox("close");
	 */

	/**
	 * @method private
	 * @name closeLightbox
	 * @description Closes active instance.
	 * @param e [object] "Event data"
	 */

	function closeLightbox(e) {
		Functions.killEvent(e);

		if (Instance) {
			Instance.$lightbox.transition("destroy");
			Instance.$container.transition("destroy");

			Instance.$lightbox.addClass(Classes.raw.animating).transition({
				property: "opacity"
			},
			function(e) {
				// Clean up
				Instance.$lightbox.off(Events.namespace);
				Instance.$container.off(Events.namespace);
				$Window.off(Events.namespace);
				$Body.off(Events.namespace);

				Instance.$overlay.remove();
				Instance.$lightbox.remove();

				// Reset Instance
				Instance = null;

				$Window.trigger(Events.close);
			});

			Instance.$lightbox.removeClass(Classes.raw.open);
			Instance.$overlay.removeClass(Classes.raw.open);

			if (Instance.isMobile) {
				$Locks.removeClass(RawClasses.lock);
			}
		}
	}

	/**
	 * @method private
	 * @name openLightbox
	 * @description Opens active instance.
	 */

	function openLightbox() {
		var position = calculatePosition(),
			durration = Instance.isMobile ? 0 : Instance.duration;

		if (!Instance.isMobile) {
			Instance.$controls.css({
				marginTop: ((Instance.contentHeight - Instance.controlHeight - Instance.metaHeight) / 2)
			});
		}

		if (!Instance.visible && Instance.isMobile && Instance.gallery.active) {
			Instance.$content.touch({
				axis: "x",
				swipe: true
			}).on(Events.swipe, onSwipe);
		}

		Instance.$lightbox.transition({
			property: (Instance.contentHeight !== Instance.oldContentHeight) ? "height" : "width"
		},
		function() {
			Instance.$container.transition({
				property: "opacity"
			},
			function() {
				Instance.$lightbox.removeClass(Classes.raw.animating);
				Instance.isAnimating = false;
			});

			Instance.$lightbox.removeClass(Classes.raw.loading);

			Instance.visible = true;

			// Fire open event
			$Window.trigger(Events.open);

			// Start preloading
			if (Instance.gallery.active) {
				preloadGallery();
			}
		});

		if (!Instance.isMobile) {
			Instance.$lightbox.css({
				height: Instance.contentHeight + Instance.paddingVertical,
				width:  Instance.contentWidth  + Instance.paddingHorizontal,
				top:    (!Instance.fixed) ? position.top : 0
			});
		}

		// Trigger event in case the content size hasn't changed
		var contentHasChanged = (Instance.oldContentHeight !== Instance.contentHeight || Instance.oldContentWidth !== Instance.contentWidth);

		if (Instance.isMobile || !contentHasChanged) {
			Instance.$lightbox.transition("resolve");
		}

		// Track content size changes
		Instance.oldContentHeight = Instance.contentHeight;
		Instance.oldContentWidth  = Instance.contentWidth;

		if (Instance.isMobile) {
			$Locks.addClass(RawClasses.lock);
		}
	}

	/**
	 * @method private
	 * @name sizeLightbox
	 * @description Sizes active instance.
	 */

	function sizeLightbox() {
		if (Instance.visible && !Instance.isMobile) {
			var position = calculatePosition();

			Instance.$controls.css({
				marginTop: ((Instance.contentHeight - Instance.controlHeight - Instance.metaHeight) / 2)
			});

			Instance.$lightbox.css({
				height: Instance.contentHeight + Instance.paddingVertical,
				width:  Instance.contentWidth  + Instance.paddingHorizontal,
				top:    (!Instance.fixed) ? position.top : 0
			});
		}
	}

	/**
	 * @method private
	 * @name centerLightbox
	 * @description Centers instance.
	 */

	function centerLightbox() {
		var position = calculatePosition();

		Instance.$lightbox.css({
			top: (!Instance.fixed) ? position.top : 0
		});
	}

	/**
	 * @method private
	 * @name calculatePosition
	 * @description Calculates positions.
	 * @return [object] "Object containing top and left positions"
	 */

	function calculatePosition() {
		if (Instance.isMobile) {
			return {
				left: 0,
				top: 0
			};
		}

		var pos = {
			left: (Formstone.windowWidth - Instance.contentWidth - Instance.paddingHorizontal) / 2,
			top: (Instance.top <= 0) ? ((Formstone.windowHeight - Instance.contentHeight - Instance.paddingVertical) / 2) : Instance.top
		};

		if (Instance.fixed !== true) {
			pos.top += $Window.scrollTop();
		}

		return pos;
	}


	/**
	 * @method private
	 * @name toggleCaption
	 * @description Toggle caption.
	 */

	function toggleCaption(e) {
		Functions.killEvent(e);

		if (Instance.captionOpen) {
			closeCaption();
		} else {
			Instance.$lightbox.addClass(Classes.raw.caption_open)
				.find(Classes.caption_toggle).text(Instance.labels.captionOpen);
			Instance.captionOpen = true;
		}
	}

	/**
	 * @method private
	 * @name closeCaption
	 * @description Close caption.
	 */

	function closeCaption() {
		Instance.$lightbox.removeClass(Classes.raw.caption_open)
			.find(Classes.caption_toggle).text(Instance.labels.captionClosed);
		Instance.captionOpen = false;
	}

	/**
	 * @method private
	 * @name formatCaption
	 * @description Formats caption.
	 * @param $target [jQuery object] "Target element"
	 */

	function formatCaption() {
		var title = this.attr("title"),
			t = (title !== undefined && title) ? title.replace(/^\s+|\s+$/g,'') : false;

		return t ? '<p class="caption">' + t + '</p>' : "";
	}

	/**
	 * @method private
	 * @name loadImage
	 * @description Loads source image.
	 * @param source [string] "Source image URL"
	 */

	function loadImage(source) {
		// Cache current image
		Instance.$image = $("<img>");

		Instance.$image.one(Events.load, function() {
			var naturalSize = calculateNaturalSize(Instance.$image);

			Instance.naturalHeight = naturalSize.naturalHeight;
			Instance.naturalWidth  = naturalSize.naturalWidth;

			if (Instance.retina) {
				Instance.naturalHeight /= 2;
				Instance.naturalWidth  /= 2;
			}

			Instance.$content.prepend(Instance.$image);

			if (Instance.$caption.html() === "") {
				Instance.$caption.hide();
			} else {
				Instance.$caption.show();
			}

			// Size content to be sure it fits the viewport
			sizeImage();

			openLightbox();

		}).error(loadError)
		  .attr("src", source)
		  .addClass(Classes.raw.image);

		// If image has already loaded into cache, trigger load event
		if (Instance.$image[0].complete || Instance.$image[0].readyState === 4) {
			Instance.$image.trigger(Events.load);
		}
	}

	/**
	 * @method private
	 * @name sizeImage
	 * @description Sizes image to fit in viewport.
	 * @param count [int] "Number of resize attempts"
	 */

	function sizeImage() {
		var count = 0;

		Instance.windowHeight = Instance.viewportHeight = Formstone.windowHeight - Instance.mobilePaddingVertical   - Instance.paddingVertical;
		Instance.windowWidth  = Instance.viewportWidth  = Formstone.windowWidth  - Instance.mobilePaddingHorizontal - Instance.paddingHorizontal;

		Instance.contentHeight = Infinity;
		Instance.contentWidth = Infinity;

		Instance.imageMarginTop  = 0;
		Instance.imageMarginLeft = 0;

		while (Instance.contentHeight > Instance.viewportHeight && count < 2) {
			Instance.imageHeight   = (count === 0) ? Instance.naturalHeight : Instance.$image.outerHeight();
			Instance.imageWidth    = (count === 0) ? Instance.naturalWidth  : Instance.$image.outerWidth();
			Instance.metaHeight    = (count === 0) ? 0 : Instance.metaHeight;
			Instance.spacerHeight  = (count === 0) ? 0 : Instance.spacerHeight;

			if (count === 0) {
				Instance.ratioHorizontal = Instance.imageHeight / Instance.imageWidth;
				Instance.ratioVertical   = Instance.imageWidth  / Instance.imageHeight;

				Instance.isWide = (Instance.imageWidth > Instance.imageHeight);
			}

			// Double check min and max
			if (Instance.imageHeight < Instance.minHeight) {
				Instance.minHeight = Instance.imageHeight;
			}
			if (Instance.imageWidth < Instance.minWidth) {
				Instance.minWidth = Instance.imageWidth;
			}

			if (Instance.isMobile) {
				if (Instance.isTouch) {
					Instance.$controlBox.css({
						width: Formstone.windowWidth
					});
					Instance.spacerHeight = Instance.$controls.outerHeight(true);
				} else {
					Instance.$tools.css({
						width: Formstone.windowWidth
					});
					Instance.spacerHeight = Instance.$tools.outerHeight(true);
				}

				// Content match viewport
				Instance.contentHeight = Instance.viewportHeight;
				Instance.contentWidth  = Instance.viewportWidth;

				fitImage();

				Instance.imageMarginTop  = (Instance.contentHeight - Instance.targetImageHeight - Instance.spacerHeight) / 2;
				Instance.imageMarginLeft = (Instance.contentWidth  - Instance.targetImageWidth) / 2;
			} else {
				// Viewport should match window, less margin, padding and meta
				if (count === 0) {
					Instance.viewportHeight -= (Instance.margin + Instance.paddingVertical);
					Instance.viewportWidth  -= (Instance.margin + Instance.paddingHorizontal);
				}
				Instance.viewportHeight -= Instance.metaHeight;

				fitImage();

				Instance.contentHeight = Instance.targetImageHeight;
				Instance.contentWidth  = Instance.targetImageWidth;
			}

			// Modify DOM
			if (!Instance.isMobile && !Instance.isTouch) {
				Instance.$meta.css({
					width: Instance.contentWidth
				});
			}

			Instance.$image.css({
				height: Instance.targetImageHeight,
				width:  Instance.targetImageWidth,
				marginTop:  Instance.imageMarginTop,
				marginLeft: Instance.imageMarginLeft
			});

			if (!Instance.isMobile) {
				Instance.metaHeight = Instance.$meta.outerHeight(true);
				Instance.contentHeight += Instance.metaHeight;
			}

			count ++;
		}
	}

	/**
	 * @method private
	 * @name fitImage
	 * @description Calculates target image size.
	 */

	function fitImage() {
		var height = (!Instance.isMobile) ? Instance.viewportHeight : Instance.contentHeight - Instance.spacerHeight,
			width  = (!Instance.isMobile) ? Instance.viewportWidth  : Instance.contentWidth;

		if (Instance.isWide) {
			//WIDE
			Instance.targetImageWidth  = width;
			Instance.targetImageHeight = Instance.targetImageWidth * Instance.ratioHorizontal;

			if (Instance.targetImageHeight > height) {
				Instance.targetImageHeight = height;
				Instance.targetImageWidth  = Instance.targetImageHeight * Instance.ratioVertical;
			}
		} else {
			//TALL
			Instance.targetImageHeight = height;
			Instance.targetImageWidth  = Instance.targetImageHeight * Instance.ratioVertical;

			if (Instance.targetImageWidth > width) {
				Instance.targetImageWidth  = width;
				Instance.targetImageHeight = Instance.targetImageWidth * Instance.ratioHorizontal;
			}
		}

		// MAX
		if (Instance.targetImageWidth > Instance.imageWidth || Instance.targetImageHeight > Instance.imageHeight) {
			Instance.targetImageHeight = Instance.imageHeight;
			Instance.targetImageWidth  = Instance.imageWidth;
		}

		// MIN
		if (Instance.targetImageWidth < Instance.minWidth || Instance.targetImageHeight < Instance.minHeight) {
			if (Instance.targetImageWidth < Instance.minWidth) {
				Instance.targetImageWidth  = Instance.minWidth;
				Instance.targetImageHeight = Instance.targetImageWidth * Instance.ratioHorizontal;
			} else {
				Instance.targetImageHeight = Instance.minHeight;
				Instance.targetImageWidth  = Instance.targetImageHeight * Instance.ratioVertical;
			}
		}
	}

	/**
	 * @method private
	 * @name loadVideo
	 * @description Loads source video.
	 * @param source [string] "Source video URL"
	 */

	function loadVideo(source) {
		var youtubeParts = source.match( /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i ), // 1
			vimeoParts   = source.match( /(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/ ), // 3
			url = (youtubeParts !== null) ? "//www.youtube.com/embed/" + youtubeParts[1] : "//player.vimeo.com/video/" + vimeoParts[3];

		Instance.$videoWrapper = $('<div class="' + Classes.raw.videoWrapper + '"></div>');
		Instance.$video = $('<iframe class="' + Classes.raw.video + '" seamless="seamless"></iframe>');

		Instance.$video.attr("src", url)
				   .addClass(Classes.raw.video)
				   .prependTo(Instance.$videoWrapper);

		Instance.$content.prepend(Instance.$videoWrapper);

		sizeVideo();
		openLightbox();
	}

	/**
	 * @method private
	 * @name sizeVideo
	 * @description Sizes video to fit in viewport.
	 */

	function sizeVideo() {
		// Set initial vars

		Instance.windowHeight = Instance.viewportHeight = Formstone.windowHeight - Instance.mobilePaddingVertical   - Instance.paddingVertical;
		Instance.windowWidth  = Instance.viewportWidth  = Formstone.windowWidth  - Instance.mobilePaddingHorizontal - Instance.paddingHorizontal;
		Instance.videoMarginTop = 0;
		Instance.videoMarginLeft = 0;

		if (Instance.isMobile) {
			if (Instance.isTouch) {
				Instance.$controlBox.css({
					width: Formstone.windowWidth
				});
				Instance.spacerHeight = Instance.$controls.outerHeight(true);
			} else {
				Instance.$tools.css({
					width: Formstone.windowWidth
				});
				Instance.spacerHeight = Instance.$tools.outerHeight(true);
			}
			Instance.viewportHeight -= Instance.spacerHeight;

			Instance.targetVideoWidth  = Instance.viewportWidth;
			Instance.targetVideoHeight = Instance.targetVideoWidth * Instance.videoRatio;

			if (Instance.targetVideoHeight > Instance.viewportHeight) {
				Instance.targetVideoHeight = Instance.viewportHeight;
				Instance.targetVideoWidth  = Instance.targetVideoHeight / Instance.videoRatio;
			}

			Instance.videoMarginTop = (Instance.viewportHeight - Instance.targetVideoHeight) / 2;
			Instance.videoMarginLeft = (Instance.viewportWidth - Instance.targetVideoWidth) / 2;
		} else {
			Instance.viewportHeight = Instance.windowHeight - Instance.margin;
			Instance.viewportWidth  = Instance.windowWidth - Instance.margin;

			Instance.targetVideoWidth  = (Instance.videoWidth > Instance.viewportWidth) ? Instance.viewportWidth : Instance.videoWidth;
			if (Instance.targetVideoWidth < Instance.minWidth) {
				Instance.targetVideoWidth = Instance.minWidth;
			}
			Instance.targetVideoHeight = Instance.targetVideoWidth * Instance.videoRatio;

			Instance.contentHeight = Instance.targetVideoHeight;
			Instance.contentWidth  = Instance.targetVideoWidth;
		}

		// Update dom
		if (!Instance.isMobile && !Instance.isTouch) {
			Instance.$meta.css({
				width: Instance.contentWidth
			});
		}

		Instance.$videoWrapper.css({
			height: Instance.targetVideoHeight,
			width: Instance.targetVideoWidth,
			marginTop: Instance.videoMarginTop,
			marginLeft: Instance.videoMarginLeft
		});

		if (!Instance.isMobile) {
			Instance.metaHeight = Instance.$meta.outerHeight(true);
			Instance.contentHeight = Instance.targetVideoHeight + Instance.metaHeight;
		}
	}

	/**
	 * @method private
	 * @name preloadGallery
	 * @description Preloads previous and next images in gallery for faster rendering.
	 * @param e [object] "Event Data"
	 */

	function preloadGallery(e) {
		var source = '';

		if (Instance.gallery.index > 0) {
			source = Instance.gallery.$items.eq(Instance.gallery.index - 1).attr("href");
			if (!checkVideo(source)) {
				$('<img src="' + source + '">');
			}
		}
		if (Instance.gallery.index < Instance.gallery.total) {
			source = Instance.gallery.$items.eq(Instance.gallery.index + 1).attr("href");
			if (!checkVideo(source)) {
				$('<img src="' + source + '">');
			}
		}
	}

	/**
	 * @method private
	 * @name advanceGallery
	 * @description Advances gallery base on direction.
	 * @param e [object] "Event Data"
	 */

	function advanceGallery(e) {
		Functions.killEvent(e);

		var $control = $(e.currentTarget);

		if (!Instance.isAnimating && !$control.hasClass(Classes.raw.control_disabled)) {
			Instance.isAnimating = true;

			closeCaption();

			Instance.gallery.index += ($control.hasClass(Classes.raw.control_next)) ? 1 : -1;
			if (Instance.gallery.index > Instance.gallery.total) {
				Instance.gallery.index = (Instance.infinite) ? 0 : Instance.gallery.total;
			}
			if (Instance.gallery.index < 0) {
				Instance.gallery.index = (Instance.infinite) ? Instance.gallery.total : 0;
			}

			Instance.$lightbox.addClass( [Classes.raw.loading, Classes.raw.animating].join(" "));

			Instance.$container.transition({
				property: "opacity"
			},
			function() {
				if (typeof Instance.$image !== 'undefined') {
					Instance.$image.remove();
				}
				if (typeof Instance.$videoWrapper !== 'undefined') {
					Instance.$videoWrapper.remove();
				}
				Instance.$el = Instance.gallery.$items.eq(Instance.gallery.index);

				Instance.$caption.html(Instance.formatter.call(Instance.$el, Instance));
				Instance.$position.find(Classes.position_current).html(Instance.gallery.index + 1);

				var source = Instance.$el.attr("href"),
					isVideo = checkVideo(source);

				if (isVideo) {
					loadVideo(source);
				} else {
					loadImage(source);
				}

				updateGalleryControls();

			});
		}
	}

	/**
	 * @method private
	 * @name updateGalleryControls
	 * @description Updates gallery control states.
	 */

	function updateGalleryControls() {
		Instance.$controls.removeClass(Classes.raw.control_disabled);

		if (!Instance.infinite) {
			if (Instance.gallery.index === 0) {
				Instance.$controls.filter(Classes.control_previous).addClass(RawClasses.control_disabled);
			}
			if (Instance.gallery.index === Instance.gallery.total) {
				Instance.$controls.filter(Classes.control_next).addClass(RawClasses.control_disabled);
			}
		}
	}

	/**
	 * @method private
	 * @name onKeyDown
	 * @description Handles keypress in gallery.
	 * @param e [object] "Event data"
	 */

	function onKeyDown(e) {
		if (Instance.gallery.active && (e.keyCode === 37 || e.keyCode === 39)) {
			Functions.killEvent(e);

			Instance.$controls.filter((e.keyCode === 37) ? Classes.control_previous : Classes.control_next).trigger(Events.click);
		} else if (e.keyCode === 27) {
			Instance.$close.trigger(Events.click);
		}
	}

	/**
	 * @method private
	 * @name cloneElement
	 * @description Clones target inline element.
	 * @param id [string] "Target element id"
	 */

	function cloneElement(id) {
		var $clone = $(id).find("> :first-child").clone();
		appendObject($clone);
	}

	/**
	 * @method private
	 * @name loadURL
	 * @description Load URL into iframe.
	 * @param source [string] "Target URL"
	 */

	function loadURL(source) {
		source = source + ((source.indexOf("?") > -1) ? "&" + Instance.requestKey + "=true" : "?" + Instance.requestKey + "=true");
		var $iframe = $('<iframe class="' + Classes.raw.iframe + '" src="' + source + '"></iframe>');
		appendObject($iframe);
	}

	/**
	 * @method private
	 * @name appendObject
	 * @description Appends and sizes object.
	 * @param $object [jQuery Object] "Object to append"
	 */

	function appendObject($object) {
		Instance.$content.append($object);
		sizeContent($object);
		openLightbox();
	}

	/**
	 * @method private
	 * @name sizeContent
	 * @description Sizes jQuery object to fir in viewport.
	 * @param $object [jQuery Object] "Object to size"
	 */

	function sizeContent($object) {
		Instance.windowHeight	  = Formstone.windowHeight - Instance.mobilePaddingVertical   - Instance.paddingVertical;
		Instance.windowWidth	  = Formstone.windowWidth  - Instance.mobilePaddingHorizontal - Instance.paddingHorizontal;

		Instance.objectHeight	  = $object.outerHeight(true);
		Instance.objectWidth	  = $object.outerWidth(true);
		Instance.targetHeight	  = Instance.targetHeight || (Instance.$el ? Instance.$el.data(Namespace + "-height") : null);
		Instance.targetWidth	  = Instance.targetWidth  || (Instance.$el ? Instance.$el.data(Namespace + "-width")  : null);
		Instance.maxHeight		  = (Instance.windowHeight < 0) ? Instance.minHeight : Instance.windowHeight;
		Instance.isIframe		  = $object.is("iframe");
		Instance.objectMarginTop  = 0;
		Instance.objectMarginLeft = 0;

		if (!Instance.isMobile) {
			Instance.windowHeight -= Instance.margin;
			Instance.windowWidth  -= Instance.margin;
		}

		Instance.contentHeight = (Instance.targetHeight) ? Instance.targetHeight : (Instance.isIframe || Instance.isMobile) ? Instance.windowHeight : Instance.objectHeight;
		Instance.contentWidth  = (Instance.targetWidth)  ? Instance.targetWidth  : (Instance.isIframe || Instance.isMobile) ? Instance.windowWidth  : Instance.objectWidth;

		if ((Instance.isIframe || Instance.isObject) && Instance.isMobile) {
			Instance.contentHeight = Instance.windowHeight;
			Instance.contentWidth  = Instance.windowWidth;
		} else if (Instance.isObject) {
			Instance.contentHeight = (Instance.contentHeight > Instance.windowHeight) ? Instance.windowHeight : Instance.contentHeight;
			Instance.contentWidth  = (Instance.contentWidth  > Instance.windowWidth)  ? Instance.windowWidth  : Instance.contentWidth;
		}
	}

	/**
	 * @method private
	 * @name loadError
	 * @description Error when resource fails to load.
	 * @param e [object] "Event data"
	 */

	function loadError(e) {
		var $error = $('<div class="' + Classes.raw.error + '"><p>Error Loading Resource</p></div>');

		// Clean up
		Instance.type = "element";
		Instance.$tools.remove();

		Instance.$image.off(Events.namespace);

		appendObject($error);
	}

	/**
	 * @method private
	 * @name onSwipe
	 * @description Handles swipe event
	 * @param e [object] "Event data"
	 */

	function onSwipe(e) {
		if (!Instance.captionOpen) {
			Instance.$controls.filter((e.directionX === "left") ? Classes.control_next : Classes.control_previous).trigger(Events.click);
		}
	}

	/**
	 * @method private
	 * @name calculateNaturalSize
	 * @description Determines natural size of target image.
	 * @param $img [jQuery object] "Source image object"
	 * @return [object | boolean] "Object containing natural height and width values or false"
	 */

	function calculateNaturalSize($img) {
		var node = $img[0],
			img = new Image();

		if (typeof node.naturalHeight !== "undefined") {
			return {
				naturalHeight: node.naturalHeight,
				naturalWidth:  node.naturalWidth
			};
		} else {
			if (node.tagName.toLowerCase() === 'img') {
				img.src = node.src;
				return {
					naturalHeight: img.height,
					naturalWidth:  img.width
				};
			}
		}

		return false;
	}

	/**
	 * @method private
	 * @name checkVideo
	 * @description Determines if url is a YouTube or Vimeo url.
	 * @param source [string] "Source url"
	 * @return [boolean] "True if YouTube or Vimeo url"
	 */

	function checkVideo(source) {
		return ( source.indexOf("youtube.com") > -1 || source.indexOf("youtu.be") > -1 || source.indexOf("vimeo.com") > -1 );
	}

	/**
	 * @plugin
	 * @name Lightbox
	 * @description A jQuery plugin for simple modals.
	 * @type widget
	 * @dependency core.js
	 * @dependency touch.js
	 * @dependency transition.js
	 */

	var Plugin = Formstone.Plugin("lightbox", {
			widget: true,

			/**
			 * @options
			 * @param customClass [string] <''> "Class applied to instance"
			 * @param extensions [array] <"jpg", "sjpg", "jpeg", "png", "gif"> "Image type extensions"
			 * @param fixed [boolean] <false> "Flag for fixed positioning"
			 * @param formatter [function] <$.noop> "Caption format function"
			 * @param infinite [boolean] <false> "Flag for infinite galleries"
			 * @param labels.close [string] <'Close'> "Close button text"
			 * @param labels.count [string] <'of'> "Gallery count separator text"
			 * @param labels.next [string] <'Next'> "Gallery control text"
			 * @param labels.previous [string] <'Previous'> "Gallery control text"
			 * @param labels.captionClosed [string] <'View Caption'> "Mobile caption toggle text, closed state"
			 * @param labels.captionOpen [string] <'View Caption'> "Mobile caption toggle text, open state"
			 * @param margin [int] <50> "Margin used when sizing (single side)"
			 * @param minHeight [int] <100> "Minimum height of modal"
			 * @param minWidth [int] <100> "Minimum width of modal"
			 * @param mobile [boolean] <false> "Flag to force 'mobile' rendering"
			 * @param retina [boolean] <false> "Flag to use 'retina' sizing (halves natural sizes)"
			 * @param requestKey [string] <'fs-lightbox'> "GET variable for ajax / iframe requests"
			 * @param top [int] <0> "Target top position; over-rides centering"
			 * @param videoRadio [number] <0.5625> "Video height / width ratio (9 / 16 = 0.5625)"
			 * @param videoWidth [int] <800> "Video max width"
			 */

			defaults: {
				customClass    : "",
				extensions     : [ "jpg", "sjpg", "jpeg", "png", "gif" ],
				fixed          : false,
				formatter      : formatCaption,
				infinite       : false,
				labels: {
					close         : "Close",
					count         : "of",
					next          : "Next",
					previous      : "Previous",
					captionClosed : "View Caption",
					captionOpen   : "Close Caption"
				},
				margin         : 50,
				minHeight      : 100,
				minWidth       : 100,
				mobile         : false,
				retina         : false,
				requestKey     : "fs-lightbox",
				top            : 0,
				videoRatio     : 0.5625,
				videoWidth     : 800
			},

			classes: [
				"loading",
				"animating",
				"fixed",
				"mobile",
				"touch",
				"inline",
				"iframed",
				"open",
				"overlay",
				"close",
				"loading_icon",
				"container",
				"content",
				"image",
				"video",
				"video_wrapper",
				"tools",
				"meta",
				"controls",
				"control",
				"control_previous",
				"control_next",
				"control_disabled",
				"position",
				"position_current",
				"position_total",
				"caption_toggle",
				"caption",
				"caption_open",
				"iframe",
				"error",
				"lock"
			],

			/**
			 * @events
			 * @event open.lightbox "Lightbox opened; Triggered on window"
			 * @event close.lightbox "Lightbox closed; Triggered on window"
			 */

			events: {
				open     : "open",
				close    : "close",

				swipe    : "swipe"
			},

			methods: {
				_setup        : setup,
				_construct    : construct,
				_destruct     : destruct,
				_resize       : resize,

				resize        : resizeLightbox
			},

			utilities: {
				_initialize    : initialize,

				close          : closeLightbox
			}
		}),

		// Localize References

		Namespace     = Plugin.namespace,
		Defaults      = Plugin.defaults,
		Classes       = Plugin.classes,
		RawClasses    = Classes.raw,
		Events        = Plugin.events,
		Functions     = Plugin.functions,
		Window        = Formstone.window,
		$Window       = Formstone.$window,
		$Body         = null,

		// Internal

		$Locks        = null,

		// Singleton

		Instance      = null;

})(jQuery, Formstone);
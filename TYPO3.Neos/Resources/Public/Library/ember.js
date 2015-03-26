define(["Library/jquery-with-dependencies", "Library/handlebars"], function(jQuery, Handlebars) {  var Ember = {exports: {}};  var ENV = {LOG_VERSION: false};  Ember.imports = {jQuery: jQuery, Handlebars: Handlebars};  Ember.lookup = { Ember: Ember, T3: window.T3};  window.Ember = Ember;(function() {
	var define, requireModule;

	(function() {
		var registry = {}, seen = {};

		define = function(name, deps, callback) {
			registry[name] = { deps: deps, callback: callback };
		};

		requireModule = function(name) {
			if (seen[name]) { return seen[name]; }
			seen[name] = {};

			var mod, deps, callback, reified, exports;

			mod = registry[name];

			if (!mod) {
				throw new Error("Module '" + name + "' not found.");
			}

			deps = mod.deps;
			callback = mod.callback;
			reified = [];

			for (var i=0, l=deps.length; i<l; i++) {
				if (deps[i] === 'exports') {
					reified.push(exports = {});
				} else {
					reified.push(requireModule(deps[i]));
				}
			}

			var value = callback.apply(this, reified);
			return seen[name] = exports || value;
		};
	})();
	(function() {
		/*globals Em:true ENV */

		/**
		 @module ember
		 @submodule ember-metal
		 */

		/**
		 All Ember methods and functions are defined inside of this namespace. You
		 generally should not add new properties to this namespace as it may be
		 overwritten by future versions of Ember.

		 You can also use the shorthand `Em` instead of `Ember`.

		 Ember-Runtime is a framework that provides core functions for Ember including
		 cross-platform functions, support for property observing and objects. Its
		 focus is on small size and performance. You can use this in place of or
		 along-side other cross-platform libraries such as jQuery.

		 The core Runtime framework is based on the jQuery API with a number of
		 performance optimizations.

		 @class Ember
		 @static
		 @version 1.0.0
		 */

		if ('undefined' === typeof Ember) {
			// Create core object. Make it act like an instance of Ember.Namespace so that
			// objects assigned to it are given a sane string representation.
			Ember = {};
		}

// Default imports, exports and lookup to the global object;
		var imports = Ember.imports = Ember.imports || this;
		var exports = Ember.exports = Ember.exports || this;
		var lookup  = Ember.lookup  = Ember.lookup  || this;

// aliases needed to keep minifiers from removing the global context
		exports.Em = exports.Ember = Em = Ember;

// Make sure these are set whether Ember was already defined or not

		Ember.isNamespace = true;

		Ember.toString = function() { return "Ember"; };


		/**
		 @property VERSION
		 @type String
		 @default '1.0.0'
		 @final
		 */
		Ember.VERSION = '1.0.0';

		/**
		 Standard environmental variables. You can define these in a global `ENV`
		 variable before loading Ember to control various configuration
		 settings.

		 @property ENV
		 @type Hash
		 */

		if ('undefined' === typeof ENV) {
			exports.ENV = {};
		}

// We disable the RANGE API by default for performance reasons
		if ('undefined' === typeof ENV.DISABLE_RANGE_API) {
			ENV.DISABLE_RANGE_API = true;
		}


		Ember.ENV = Ember.ENV || ENV;

		Ember.config = Ember.config || {};

// ..........................................................
// BOOTSTRAP
//

		/**
		 Determines whether Ember should enhances some built-in object prototypes to
		 provide a more friendly API. If enabled, a few methods will be added to
		 `Function`, `String`, and `Array`. `Object.prototype` will not be enhanced,
		 which is the one that causes most trouble for people.

		 In general we recommend leaving this option set to true since it rarely
		 conflicts with other code. If you need to turn it off however, you can
		 define an `ENV.EXTEND_PROTOTYPES` config to disable it.

		 @property EXTEND_PROTOTYPES
		 @type Boolean
		 @default true
		 */
		Ember.EXTEND_PROTOTYPES = Ember.ENV.EXTEND_PROTOTYPES;

		if (typeof Ember.EXTEND_PROTOTYPES === 'undefined') {
			Ember.EXTEND_PROTOTYPES = true;
		}

		/**
		 Determines whether Ember logs a full stack trace during deprecation warnings

		 @property LOG_STACKTRACE_ON_DEPRECATION
		 @type Boolean
		 @default true
		 */
		Ember.LOG_STACKTRACE_ON_DEPRECATION = (Ember.ENV.LOG_STACKTRACE_ON_DEPRECATION !== false);

		/**
		 Determines whether Ember should add ECMAScript 5 shims to older browsers.

		 @property SHIM_ES5
		 @type Boolean
		 @default Ember.EXTEND_PROTOTYPES
		 */
		Ember.SHIM_ES5 = (Ember.ENV.SHIM_ES5 === false) ? false : Ember.EXTEND_PROTOTYPES;

		/**
		 Determines whether Ember logs info about version of used libraries

		 @property LOG_VERSION
		 @type Boolean
		 @default true
		 */
		Ember.LOG_VERSION = (Ember.ENV.LOG_VERSION === false) ? false : true;

		/**
		 Empty function. Useful for some operations. Always returns `this`.

		 @method K
		 @private
		 @return {Object}
		 */
		Ember.K = function() { return this; };


// Stub out the methods defined by the ember-debug package in case it's not loaded

		if ('undefined' === typeof Ember.assert) { Ember.assert = Ember.K; }
		if ('undefined' === typeof Ember.warn) { Ember.warn = Ember.K; }
		if ('undefined' === typeof Ember.debug) { Ember.debug = Ember.K; }
		if ('undefined' === typeof Ember.deprecate) { Ember.deprecate = Ember.K; }
		if ('undefined' === typeof Ember.deprecateFunc) {
			Ember.deprecateFunc = function(_, func) { return func; };
		}

		/**
		 Previously we used `Ember.$.uuid`, however `$.uuid` has been removed from
		 jQuery master. We'll just bootstrap our own uuid now.

		 @property uuid
		 @type Number
		 @private
		 */
		Ember.uuid = 0;

// ..........................................................
// LOGGER
//

		function consoleMethod(name) {
			var consoleObj;
			if (imports.console) {
				consoleObj = imports.console;
			} else if (typeof console !== 'undefined') {
				consoleObj = console;
			}

			var method = typeof consoleObj === 'object' ? consoleObj[name] : null;

			if (method) {
				// Older IE doesn't support apply, but Chrome needs it
				if (method.apply) {
					return function() {
						method.apply(consoleObj, arguments);
					};
				} else {
					return function() {
						var message = Array.prototype.join.call(arguments, ', ');
						method(message);
					};
				}
			}
		}

		function assertPolyfill(test, message) {
			if (!test) {
				try {
					// attempt to preserve the stack
					throw new Error("assertion failed: " + message);
				} catch(error) {
					setTimeout(function() {
						throw error;
					}, 0);
				}
			}
		}

		/**
		 Inside Ember-Metal, simply uses the methods from `imports.console`.
		 Override this to provide more robust logging functionality.

		 @class Logger
		 @namespace Ember
		 */
		Ember.Logger = {
			/**
			 Logs the arguments to the console.
			 You can pass as many arguments as you want and they will be joined together with a space.

			 ```javascript
			 var foo = 1;
			 Ember.Logger.log('log value of foo:', foo); // "log value of foo: 1" will be printed to the console
			 ```

			 @method log
			 @for Ember.Logger
			 @param {*} arguments
			 */
			log:   consoleMethod('log')   || Ember.K,
			/**
			 Prints the arguments to the console with a warning icon.
			 You can pass as many arguments as you want and they will be joined together with a space.

			 ```javascript
			 Ember.Logger.warn('Something happened!'); // "Something happened!" will be printed to the console with a warning icon.
			 ```

			 @method warn
			 @for Ember.Logger
			 @param {*} arguments
			 */
			warn:  consoleMethod('warn')  || Ember.K,
			/**
			 Prints the arguments to the console with an error icon, red text and a stack race.
			 You can pass as many arguments as you want and they will be joined together with a space.

			 ```javascript
			 Ember.Logger.error('Danger! Danger!'); // "Danger! Danger!" will be printed to the console in red text.
			 ```

			 @method error
			 @for Ember.Logger
			 @param {*} arguments
			 */
			error: consoleMethod('error') || Ember.K,
			/**
			 Logs the arguments to the console.
			 You can pass as many arguments as you want and they will be joined together with a space.

			 ```javascript
			 var foo = 1;
			 Ember.Logger.info('log value of foo:', foo); // "log value of foo: 1" will be printed to the console
			 ```

			 @method info
			 @for Ember.Logger
			 @param {*} arguments
			 */
			info:  consoleMethod('info')  || Ember.K,
			/**
			 Logs the arguments to the console in blue text.
			 You can pass as many arguments as you want and they will be joined together with a space.

			 ```javascript
			 var foo = 1;
			 Ember.Logger.debug('log value of foo:', foo); // "log value of foo: 1" will be printed to the console
			 ```

			 @method debug
			 @for Ember.Logger
			 @param {*} arguments
			 */
			debug: consoleMethod('debug') || consoleMethod('info') || Ember.K,
			/**

			 If the value passed into Ember.Logger.assert is not truthy it will throw an error with a stack trace.

			 ```javascript
			 Ember.Logger.assert(true); // undefined
			 Ember.Logger.assert(true === false); // Throws an Assertion failed error.
			 ```

			 @method assert
			 @for Ember.Logger
			 @param @param {Boolean} bool Value to test
			 */
			assert: consoleMethod('assert') || assertPolyfill
		};


// ..........................................................
// ERROR HANDLING
//

		/**
		 A function may be assigned to `Ember.onerror` to be called when Ember
		 internals encounter an error. This is useful for specialized error handling
		 and reporting code.

		 ```javascript
		 Ember.onerror = function(error) {
    Em.$.ajax('/report-error', 'POST', {
      stack: error.stack,
      otherInformation: 'whatever app state you want to provide'
    });
  };
		 ```

		 @event onerror
		 @for Ember
		 @param {Exception} error the error object
		 */
		Ember.onerror = null;

		/**
		 @private

		 Wrap code block in a try/catch if `Ember.onerror` is set.

		 @method handleErrors
		 @for Ember
		 @param {Function} func
		 @param [context]
		 */
		Ember.handleErrors = function(func, context) {
			// Unfortunately in some browsers we lose the backtrace if we rethrow the existing error,
			// so in the event that we don't have an `onerror` handler we don't wrap in a try/catch
			if ('function' === typeof Ember.onerror) {
				try {
					return func.call(context || this);
				} catch (error) {
					Ember.onerror(error);
				}
			} else {
				return func.call(context || this);
			}
		};

		/**
		 Merge the contents of two objects together into the first object.

		 ```javascript
		 Ember.merge({first: 'Tom'}, {last: 'Dale'}); // {first: 'Tom', last: 'Dale'}
		 var a = {first: 'Yehuda'}, b = {last: 'Katz'};
		 Ember.merge(a, b); // a == {first: 'Yehuda', last: 'Katz'}, b == {last: 'Katz'}
		 ```

		 @method merge
		 @for Ember
		 @param {Object} original The object to merge into
		 @param {Object} updates The object to copy properties from
		 @return {Object}
		 */
		Ember.merge = function(original, updates) {
			for (var prop in updates) {
				if (!updates.hasOwnProperty(prop)) { continue; }
				original[prop] = updates[prop];
			}
			return original;
		};

		/**
		 Returns true if the passed value is null or undefined. This avoids errors
		 from JSLint complaining about use of ==, which can be technically
		 confusing.

		 ```javascript
		 Ember.isNone();              // true
		 Ember.isNone(null);          // true
		 Ember.isNone(undefined);     // true
		 Ember.isNone('');            // false
		 Ember.isNone([]);            // false
		 Ember.isNone(function() {});  // false
		 ```

		 @method isNone
		 @for Ember
		 @param {Object} obj Value to test
		 @return {Boolean}
		 */
		Ember.isNone = function(obj) {
			return obj === null || obj === undefined;
		};
		Ember.none = Ember.deprecateFunc("Ember.none is deprecated. Please use Ember.isNone instead.", Ember.isNone);

		/**
		 Verifies that a value is `null` or an empty string, empty array,
		 or empty function.

		 Constrains the rules on `Ember.isNone` by returning false for empty
		 string and empty arrays.

		 ```javascript
		 Ember.isEmpty();                // true
		 Ember.isEmpty(null);            // true
		 Ember.isEmpty(undefined);       // true
		 Ember.isEmpty('');              // true
		 Ember.isEmpty([]);              // true
		 Ember.isEmpty('Adam Hawkins');  // false
		 Ember.isEmpty([0,1,2]);         // false
		 ```

		 @method isEmpty
		 @for Ember
		 @param {Object} obj Value to test
		 @return {Boolean}
		 */
		Ember.isEmpty = function(obj) {
			return Ember.isNone(obj) || (obj.length === 0 && typeof obj !== 'function') || (typeof obj === 'object' && Ember.get(obj, 'length') === 0);
		};
		Ember.empty = Ember.deprecateFunc("Ember.empty is deprecated. Please use Ember.isEmpty instead.", Ember.isEmpty) ;


	})();



	(function() {
		/*globals Node */
		/**
		 @module ember-metal
		 */

		/**
		 Platform specific methods and feature detectors needed by the framework.

		 @class platform
		 @namespace Ember
		 @static
		 */
		var platform = Ember.platform = {};


		/**
		 Identical to `Object.create()`. Implements if not available natively.

		 @method create
		 @for Ember
		 */
		Ember.create = Object.create;

// IE8 has Object.create but it couldn't treat property descripters.
		if (Ember.create) {
			if (Ember.create({a: 1}, {a: {value: 2}}).a !== 2) {
				Ember.create = null;
			}
		}

// STUB_OBJECT_CREATE allows us to override other libraries that stub
// Object.create different than we would prefer
		if (!Ember.create || Ember.ENV.STUB_OBJECT_CREATE) {
			var K = function() {};

			Ember.create = function(obj, props) {
				K.prototype = obj;
				obj = new K();
				if (props) {
					K.prototype = obj;
					for (var prop in props) {
						K.prototype[prop] = props[prop].value;
					}
					obj = new K();
				}
				K.prototype = null;

				return obj;
			};

			Ember.create.isSimulated = true;
		}

		var defineProperty = Object.defineProperty;
		var canRedefineProperties, canDefinePropertyOnDOM;

// Catch IE8 where Object.defineProperty exists but only works on DOM elements
		if (defineProperty) {
			try {
				defineProperty({}, 'a',{get:function() {}});
			} catch (e) {
				defineProperty = null;
			}
		}

		if (defineProperty) {
			// Detects a bug in Android <3.2 where you cannot redefine a property using
			// Object.defineProperty once accessors have already been set.
			canRedefineProperties = (function() {
				var obj = {};

				defineProperty(obj, 'a', {
					configurable: true,
					enumerable: true,
					get: function() { },
					set: function() { }
				});

				defineProperty(obj, 'a', {
					configurable: true,
					enumerable: true,
					writable: true,
					value: true
				});

				return obj.a === true;
			})();

			// This is for Safari 5.0, which supports Object.defineProperty, but not
			// on DOM nodes.
			canDefinePropertyOnDOM = (function() {
				try {
					defineProperty(document.createElement('div'), 'definePropertyOnDOM', {});
					return true;
				} catch(e) { }

				return false;
			})();

			if (!canRedefineProperties) {
				defineProperty = null;
			} else if (!canDefinePropertyOnDOM) {
				defineProperty = function(obj, keyName, desc) {
					var isNode;

					if (typeof Node === "object") {
						isNode = obj instanceof Node;
					} else {
						isNode = typeof obj === "object" && typeof obj.nodeType === "number" && typeof obj.nodeName === "string";
					}

					if (isNode) {
						// TODO: Should we have a warning here?
						return (obj[keyName] = desc.value);
					} else {
						return Object.defineProperty(obj, keyName, desc);
					}
				};
			}
		}

		/**
		 @class platform
		 @namespace Ember
		 */

		/**
		 Identical to `Object.defineProperty()`. Implements as much functionality
		 as possible if not available natively.

		 @method defineProperty
		 @param {Object} obj The object to modify
		 @param {String} keyName property name to modify
		 @param {Object} desc descriptor hash
		 @return {void}
		 */
		platform.defineProperty = defineProperty;

		/**
		 Set to true if the platform supports native getters and setters.

		 @property hasPropertyAccessors
		 @final
		 */
		platform.hasPropertyAccessors = true;

		if (!platform.defineProperty) {
			platform.hasPropertyAccessors = false;

			platform.defineProperty = function(obj, keyName, desc) {
				if (!desc.get) { obj[keyName] = desc.value; }
			};

			platform.defineProperty.isSimulated = true;
		}

		if (Ember.ENV.MANDATORY_SETTER && !platform.hasPropertyAccessors) {
			Ember.ENV.MANDATORY_SETTER = false;
		}

	})();



	(function() {
		/*jshint newcap:false*/
		/**
		 @module ember-metal
		 */

// NOTE: There is a bug in jshint that doesn't recognize `Object()` without `new`
// as being ok unless both `newcap:false` and not `use strict`.
// https://github.com/jshint/jshint/issues/392

// Testing this is not ideal, but we want to use native functions
// if available, but not to use versions created by libraries like Prototype
		var isNativeFunc = function(func) {
			// This should probably work in all browsers likely to have ES5 array methods
			return func && Function.prototype.toString.call(func).indexOf('[native code]') > -1;
		};

// From: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/map
		var arrayMap = isNativeFunc(Array.prototype.map) ? Array.prototype.map : function(fun /*, thisp */) {
			//"use strict";

			if (this === void 0 || this === null) {
				throw new TypeError();
			}

			var t = Object(this);
			var len = t.length >>> 0;
			if (typeof fun !== "function") {
				throw new TypeError();
			}

			var res = new Array(len);
			var thisp = arguments[1];
			for (var i = 0; i < len; i++) {
				if (i in t) {
					res[i] = fun.call(thisp, t[i], i, t);
				}
			}

			return res;
		};

// From: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/foreach
		var arrayForEach = isNativeFunc(Array.prototype.forEach) ? Array.prototype.forEach : function(fun /*, thisp */) {
			//"use strict";

			if (this === void 0 || this === null) {
				throw new TypeError();
			}

			var t = Object(this);
			var len = t.length >>> 0;
			if (typeof fun !== "function") {
				throw new TypeError();
			}

			var thisp = arguments[1];
			for (var i = 0; i < len; i++) {
				if (i in t) {
					fun.call(thisp, t[i], i, t);
				}
			}
		};

		var arrayIndexOf = isNativeFunc(Array.prototype.indexOf) ? Array.prototype.indexOf : function (obj, fromIndex) {
			if (fromIndex === null || fromIndex === undefined) { fromIndex = 0; }
			else if (fromIndex < 0) { fromIndex = Math.max(0, this.length + fromIndex); }
			for (var i = fromIndex, j = this.length; i < j; i++) {
				if (this[i] === obj) { return i; }
			}
			return -1;
		};

		/**
		 Array polyfills to support ES5 features in older browsers.

		 @namespace Ember
		 @property ArrayPolyfills
		 */
		Ember.ArrayPolyfills = {
			map: arrayMap,
			forEach: arrayForEach,
			indexOf: arrayIndexOf
		};

		if (Ember.SHIM_ES5) {
			if (!Array.prototype.map) {
				Array.prototype.map = arrayMap;
			}

			if (!Array.prototype.forEach) {
				Array.prototype.forEach = arrayForEach;
			}

			if (!Array.prototype.indexOf) {
				Array.prototype.indexOf = arrayIndexOf;
			}
		}

	})();



	(function() {
		/**
		 @module ember-metal
		 */


		var o_defineProperty = Ember.platform.defineProperty,
			o_create = Ember.create,
		// Used for guid generation...
			GUID_KEY = '__ember'+ (+ new Date()),
			uuid         = 0,
			numberCache  = [],
			stringCache  = {};

		var MANDATORY_SETTER = Ember.ENV.MANDATORY_SETTER;

		/**
		 @private

		 A unique key used to assign guids and other private metadata to objects.
		 If you inspect an object in your browser debugger you will often see these.
		 They can be safely ignored.

		 On browsers that support it, these properties are added with enumeration
		 disabled so they won't show up when you iterate over your properties.

		 @property GUID_KEY
		 @for Ember
		 @type String
		 @final
		 */
		Ember.GUID_KEY = GUID_KEY;

		var GUID_DESC = {
			writable:    false,
			configurable: false,
			enumerable:  false,
			value: null
		};

		/**
		 @private

		 Generates a new guid, optionally saving the guid to the object that you
		 pass in. You will rarely need to use this method. Instead you should
		 call `Ember.guidFor(obj)`, which return an existing guid if available.

		 @method generateGuid
		 @for Ember
		 @param {Object} [obj] Object the guid will be used for. If passed in, the guid will
		 be saved on the object and reused whenever you pass the same object
		 again.

		 If no object is passed, just generate a new guid.
		 @param {String} [prefix] Prefix to place in front of the guid. Useful when you want to
		 separate the guid into separate namespaces.
		 @return {String} the guid
		 */
		Ember.generateGuid = function generateGuid(obj, prefix) {
			if (!prefix) prefix = 'ember';
			var ret = (prefix + (uuid++));
			if (obj) {
				GUID_DESC.value = ret;
				o_defineProperty(obj, GUID_KEY, GUID_DESC);
			}
			return ret ;
		};

		/**
		 @private

		 Returns a unique id for the object. If the object does not yet have a guid,
		 one will be assigned to it. You can call this on any object,
		 `Ember.Object`-based or not, but be aware that it will add a `_guid`
		 property.

		 You can also use this method on DOM Element objects.

		 @method guidFor
		 @for Ember
		 @param {Object} obj any object, string, number, Element, or primitive
		 @return {String} the unique guid for this instance.
		 */
		Ember.guidFor = function guidFor(obj) {

			// special cases where we don't want to add a key to object
			if (obj === undefined) return "(undefined)";
			if (obj === null) return "(null)";

			var ret;
			var type = typeof obj;

			// Don't allow prototype changes to String etc. to change the guidFor
			switch(type) {
				case 'number':
					ret = numberCache[obj];
					if (!ret) ret = numberCache[obj] = 'nu'+obj;
					return ret;

				case 'string':
					ret = stringCache[obj];
					if (!ret) ret = stringCache[obj] = 'st'+(uuid++);
					return ret;

				case 'boolean':
					return obj ? '(true)' : '(false)';

				default:
					if (obj[GUID_KEY]) return obj[GUID_KEY];
					if (obj === Object) return '(Object)';
					if (obj === Array)  return '(Array)';
					ret = 'ember'+(uuid++);
					GUID_DESC.value = ret;
					o_defineProperty(obj, GUID_KEY, GUID_DESC);
					return ret;
			}
		};

// ..........................................................
// META
//

		var META_DESC = {
			writable:    true,
			configurable: false,
			enumerable:  false,
			value: null
		};

		var META_KEY = Ember.GUID_KEY+'_meta';

		/**
		 The key used to store meta information on object for property observing.

		 @property META_KEY
		 @for Ember
		 @private
		 @final
		 @type String
		 */
		Ember.META_KEY = META_KEY;

// Placeholder for non-writable metas.
		var EMPTY_META = {
			descs: {},
			watching: {}
		};

		if (MANDATORY_SETTER) { EMPTY_META.values = {}; }

		Ember.EMPTY_META = EMPTY_META;

		if (Object.freeze) Object.freeze(EMPTY_META);

		var isDefinePropertySimulated = Ember.platform.defineProperty.isSimulated;

		function Meta(obj) {
			this.descs = {};
			this.watching = {};
			this.cache = {};
			this.source = obj;
		}

		if (isDefinePropertySimulated) {
			// on platforms that don't support enumerable false
			// make meta fail jQuery.isPlainObject() to hide from
			// jQuery.extend() by having a property that fails
			// hasOwnProperty check.
			Meta.prototype.__preventPlainObject__ = true;

			// Without non-enumerable properties, meta objects will be output in JSON
			// unless explicitly suppressed
			Meta.prototype.toJSON = function () { };
		}

		/**
		 Retrieves the meta hash for an object. If `writable` is true ensures the
		 hash is writable for this object as well.

		 The meta object contains information about computed property descriptors as
		 well as any watched properties and other information. You generally will
		 not access this information directly but instead work with higher level
		 methods that manipulate this hash indirectly.

		 @method meta
		 @for Ember
		 @private

		 @param {Object} obj The object to retrieve meta for
		 @param {Boolean} [writable=true] Pass `false` if you do not intend to modify
		 the meta hash, allowing the method to avoid making an unnecessary copy.
		 @return {Object} the meta hash for an object
		 */
		Ember.meta = function meta(obj, writable) {

			var ret = obj[META_KEY];
			if (writable===false) return ret || EMPTY_META;

			if (!ret) {
				if (!isDefinePropertySimulated) o_defineProperty(obj, META_KEY, META_DESC);

				ret = new Meta(obj);

				if (MANDATORY_SETTER) { ret.values = {}; }

				obj[META_KEY] = ret;

				// make sure we don't accidentally try to create constructor like desc
				ret.descs.constructor = null;

			} else if (ret.source !== obj) {
				if (!isDefinePropertySimulated) o_defineProperty(obj, META_KEY, META_DESC);

				ret = o_create(ret);
				ret.descs    = o_create(ret.descs);
				ret.watching = o_create(ret.watching);
				ret.cache    = {};
				ret.source   = obj;

				if (MANDATORY_SETTER) { ret.values = o_create(ret.values); }

				obj[META_KEY] = ret;
			}
			return ret;
		};

		Ember.getMeta = function getMeta(obj, property) {
			var meta = Ember.meta(obj, false);
			return meta[property];
		};

		Ember.setMeta = function setMeta(obj, property, value) {
			var meta = Ember.meta(obj, true);
			meta[property] = value;
			return value;
		};

		/**
		 @deprecated
		 @private

		 In order to store defaults for a class, a prototype may need to create
		 a default meta object, which will be inherited by any objects instantiated
		 from the class's constructor.

		 However, the properties of that meta object are only shallow-cloned,
		 so if a property is a hash (like the event system's `listeners` hash),
		 it will by default be shared across all instances of that class.

		 This method allows extensions to deeply clone a series of nested hashes or
		 other complex objects. For instance, the event system might pass
		 `['listeners', 'foo:change', 'ember157']` to `prepareMetaPath`, which will
		 walk down the keys provided.

		 For each key, if the key does not exist, it is created. If it already
		 exists and it was inherited from its constructor, the constructor's
		 key is cloned.

		 You can also pass false for `writable`, which will simply return
		 undefined if `prepareMetaPath` discovers any part of the path that
		 shared or undefined.

		 @method metaPath
		 @for Ember
		 @param {Object} obj The object whose meta we are examining
		 @param {Array} path An array of keys to walk down
		 @param {Boolean} writable whether or not to create a new meta
		 (or meta property) if one does not already exist or if it's
		 shared with its constructor
		 */
		Ember.metaPath = function metaPath(obj, path, writable) {

			var meta = Ember.meta(obj, writable), keyName, value;

			for (var i=0, l=path.length; i<l; i++) {
				keyName = path[i];
				value = meta[keyName];

				if (!value) {
					if (!writable) { return undefined; }
					value = meta[keyName] = { __ember_source__: obj };
				} else if (value.__ember_source__ !== obj) {
					if (!writable) { return undefined; }
					value = meta[keyName] = o_create(value);
					value.__ember_source__ = obj;
				}

				meta = value;
			}

			return value;
		};

		/**
		 @private

		 Wraps the passed function so that `this._super` will point to the superFunc
		 when the function is invoked. This is the primitive we use to implement
		 calls to super.

		 @method wrap
		 @for Ember
		 @param {Function} func The function to call
		 @param {Function} superFunc The super function.
		 @return {Function} wrapped function.
		 */
		Ember.wrap = function(func, superFunc) {
			function K() {}

			function superWrapper() {
				var ret, sup = this._super;
				this._super = superFunc || K;
				ret = func.apply(this, arguments);
				this._super = sup;
				return ret;
			}

			superWrapper.wrappedFunction = func;
			superWrapper.__ember_observes__ = func.__ember_observes__;
			superWrapper.__ember_observesBefore__ = func.__ember_observesBefore__;
			superWrapper.__ember_listens__ = func.__ember_listens__;

			return superWrapper;
		};

		/**
		 Returns true if the passed object is an array or Array-like.

		 Ember Array Protocol:

		 - the object has an objectAt property
		 - the object is a native Array
		 - the object is an Object, and has a length property

		 Unlike `Ember.typeOf` this method returns true even if the passed object is
		 not formally array but appears to be array-like (i.e. implements `Ember.Array`)

		 ```javascript
		 Ember.isArray();                                            // false
		 Ember.isArray([]);                                          // true
		 Ember.isArray( Ember.ArrayProxy.create({ content: [] }) );  // true
		 ```

		 @method isArray
		 @for Ember
		 @param {Object} obj The object to test
		 @return {Boolean} true if the passed object is an array or Array-like
		 */
		Ember.isArray = function(obj) {
			if (!obj || obj.setInterval) { return false; }
			if (Array.isArray && Array.isArray(obj)) { return true; }
			if (Ember.Array && Ember.Array.detect(obj)) { return true; }
			if ((obj.length !== undefined) && 'object'===typeof obj) { return true; }
			return false;
		};

		/**
		 Forces the passed object to be part of an array. If the object is already
		 an array or array-like, returns the object. Otherwise adds the object to
		 an array. If obj is `null` or `undefined`, returns an empty array.

		 ```javascript
		 Ember.makeArray();                           // []
		 Ember.makeArray(null);                       // []
		 Ember.makeArray(undefined);                  // []
		 Ember.makeArray('lindsay');                  // ['lindsay']
		 Ember.makeArray([1,2,42]);                   // [1,2,42]

		 var controller = Ember.ArrayProxy.create({ content: [] });
		 Ember.makeArray(controller) === controller;  // true
		 ```

		 @method makeArray
		 @for Ember
		 @param {Object} obj the object
		 @return {Array}
		 */
		Ember.makeArray = function(obj) {
			if (obj === null || obj === undefined) { return []; }
			return Ember.isArray(obj) ? obj : [obj];
		};

		function canInvoke(obj, methodName) {
			return !!(obj && typeof obj[methodName] === 'function');
		}

		/**
		 Checks to see if the `methodName` exists on the `obj`.

		 ```javascript
		 var foo = {bar: Ember.K, baz: null};
		 Ember.canInvoke(foo, 'bar'); // true
		 Ember.canInvoke(foo, 'baz'); // false
		 Ember.canInvoke(foo, 'bat'); // false
		 ```

		 @method canInvoke
		 @for Ember
		 @param {Object} obj The object to check for the method
		 @param {String} methodName The method name to check for
		 @return {Boolean}
		 */
		Ember.canInvoke = canInvoke;

		/**
		 Checks to see if the `methodName` exists on the `obj`,
		 and if it does, invokes it with the arguments passed.

		 ```javascript
		 var d = new Date('03/15/2013');
		 Ember.tryInvoke(d, 'getTime'); // 1363320000000
		 Ember.tryInvoke(d, 'setFullYear', [2014]); // 1394856000000
		 Ember.tryInvoke(d, 'noSuchMethod', [2014]); // undefined
		 ```

		 @method tryInvoke
		 @for Ember
		 @param {Object} obj The object to check for the method
		 @param {String} methodName The method name to check for
		 @param {Array} [args] The arguments to pass to the method
		 @return {*} the return value of the invoked method or undefined if it cannot be invoked
		 */
		Ember.tryInvoke = function(obj, methodName, args) {
			if (canInvoke(obj, methodName)) {
				return obj[methodName].apply(obj, args || []);
			}
		};

// https://github.com/emberjs/ember.js/pull/1617
		var needsFinallyFix = (function() {
			var count = 0;
			try{
				try { }
				finally {
					count++;
					throw new Error('needsFinallyFixTest');
				}
			} catch (e) {}

			return count !== 1;
		})();

		/**
		 Provides try { } finally { } functionality, while working
		 around Safari's double finally bug.

		 ```javascript
		 var tryable = function() {
    someResource.lock();
    runCallback(); // May throw error.
  };
		 var finalizer = function() {
    someResource.unlock();
  };
		 Ember.tryFinally(tryable, finalizer);
		 ```

		 @method tryFinally
		 @for Ember
		 @param {Function} tryable The function to run the try callback
		 @param {Function} finalizer The function to run the finally callback
		 @param {Object} [binding] The optional calling object. Defaults to 'this'
		 @return {*} The return value is the that of the finalizer,
		 unless that value is undefined, in which case it is the return value
		 of the tryable
		 */

		if (needsFinallyFix) {
			Ember.tryFinally = function(tryable, finalizer, binding) {
				var result, finalResult, finalError;

				binding = binding || this;

				try {
					result = tryable.call(binding);
				} finally {
					try {
						finalResult = finalizer.call(binding);
					} catch (e) {
						finalError = e;
					}
				}

				if (finalError) { throw finalError; }

				return (finalResult === undefined) ? result : finalResult;
			};
		} else {
			Ember.tryFinally = function(tryable, finalizer, binding) {
				var result, finalResult;

				binding = binding || this;

				try {
					result = tryable.call(binding);
				} finally {
					finalResult = finalizer.call(binding);
				}

				return (finalResult === undefined) ? result : finalResult;
			};
		}

		/**
		 Provides try { } catch finally { } functionality, while working
		 around Safari's double finally bug.

		 ```javascript
		 var tryable = function() {
    for (i=0, l=listeners.length; i<l; i++) {
      listener = listeners[i];
      beforeValues[i] = listener.before(name, time(), payload);
    }

    return callback.call(binding);
  };

		 var catchable = function(e) {
    payload = payload || {};
    payload.exception = e;
  };

		 var finalizer = function() {
    for (i=0, l=listeners.length; i<l; i++) {
      listener = listeners[i];
      listener.after(name, time(), payload, beforeValues[i]);
    }
  };
		 Ember.tryCatchFinally(tryable, catchable, finalizer);
		 ```

		 @method tryCatchFinally
		 @for Ember
		 @param {Function} tryable The function to run the try callback
		 @param {Function} catchable The function to run the catchable callback
		 @param {Function} finalizer The function to run the finally callback
		 @param {Object} [binding] The optional calling object. Defaults to 'this'
		 @return {*} The return value is the that of the finalizer,
		 unless that value is undefined, in which case it is the return value
		 of the tryable.
		 */
		if (needsFinallyFix) {
			Ember.tryCatchFinally = function(tryable, catchable, finalizer, binding) {
				var result, finalResult, finalError;

				binding = binding || this;

				try {
					result = tryable.call(binding);
				} catch(error) {
					result = catchable.call(binding, error);
				} finally {
					try {
						finalResult = finalizer.call(binding);
					} catch (e) {
						finalError = e;
					}
				}

				if (finalError) { throw finalError; }

				return (finalResult === undefined) ? result : finalResult;
			};
		} else {
			Ember.tryCatchFinally = function(tryable, catchable, finalizer, binding) {
				var result, finalResult;

				binding = binding || this;

				try {
					result = tryable.call(binding);
				} catch(error) {
					result = catchable.call(binding, error);
				} finally {
					finalResult = finalizer.call(binding);
				}

				return (finalResult === undefined) ? result : finalResult;
			};
		}

// ........................................
// TYPING & ARRAY MESSAGING
//

		var TYPE_MAP = {};
		var t = "Boolean Number String Function Array Date RegExp Object".split(" ");
		Ember.ArrayPolyfills.forEach.call(t, function(name) {
			TYPE_MAP[ "[object " + name + "]" ] = name.toLowerCase();
		});

		var toString = Object.prototype.toString;

		/**
		 Returns a consistent type for the passed item.

		 Use this instead of the built-in `typeof` to get the type of an item.
		 It will return the same result across all browsers and includes a bit
		 more detail. Here is what will be returned:

		 | Return Value  | Meaning                                              |
		 |---------------|------------------------------------------------------|
		 | 'string'      | String primitive                                     |
		 | 'number'      | Number primitive                                     |
		 | 'boolean'     | Boolean primitive                                    |
		 | 'null'        | Null value                                           |
		 | 'undefined'   | Undefined value                                      |
		 | 'function'    | A function                                           |
		 | 'array'       | An instance of Array                                 |
		 | 'class'       | An Ember class (created using Ember.Object.extend()) |
		 | 'instance'    | An Ember object instance                             |
		 | 'error'       | An instance of the Error object                      |
		 | 'object'      | A JavaScript object not inheriting from Ember.Object |

		 Examples:

		 ```javascript
		 Ember.typeOf();                       // 'undefined'
		 Ember.typeOf(null);                   // 'null'
		 Ember.typeOf(undefined);              // 'undefined'
		 Ember.typeOf('michael');              // 'string'
		 Ember.typeOf(101);                    // 'number'
		 Ember.typeOf(true);                   // 'boolean'
		 Ember.typeOf(Ember.makeArray);        // 'function'
		 Ember.typeOf([1,2,90]);               // 'array'
		 Ember.typeOf(Ember.Object.extend());  // 'class'
		 Ember.typeOf(Ember.Object.create());  // 'instance'
		 Ember.typeOf(new Error('teamocil'));  // 'error'

		 // "normal" JavaScript object
		 Ember.typeOf({a: 'b'});              // 'object'
		 ```

		 @method typeOf
		 @for Ember
		 @param {Object} item the item to check
		 @return {String} the type
		 */
		Ember.typeOf = function(item) {
			var ret;

			ret = (item === null || item === undefined) ? String(item) : TYPE_MAP[toString.call(item)] || 'object';

			if (ret === 'function') {
				if (Ember.Object && Ember.Object.detect(item)) ret = 'class';
			} else if (ret === 'object') {
				if (item instanceof Error) ret = 'error';
				else if (Ember.Object && item instanceof Ember.Object) ret = 'instance';
				else ret = 'object';
			}

			return ret;
		};

	})();



	(function() {
// Ember.tryCatchFinally

		/**
		 The purpose of the Ember Instrumentation module is
		 to provide efficient, general-purpose instrumentation
		 for Ember.

		 Subscribe to a listener by using `Ember.subscribe`:

		 ```javascript
		 Ember.subscribe("render", {
    before: function(name, timestamp, payload) {

    },

    after: function(name, timestamp, payload) {

    }
  });
		 ```

		 If you return a value from the `before` callback, that same
		 value will be passed as a fourth parameter to the `after`
		 callback.

		 Instrument a block of code by using `Ember.instrument`:

		 ```javascript
		 Ember.instrument("render.handlebars", payload, function() {
    // rendering logic
  }, binding);
		 ```

		 Event names passed to `Ember.instrument` are namespaced
		 by periods, from more general to more specific. Subscribers
		 can listen for events by whatever level of granularity they
		 are interested in.

		 In the above example, the event is `render.handlebars`,
		 and the subscriber listened for all events beginning with
		 `render`. It would receive callbacks for events named
		 `render`, `render.handlebars`, `render.container`, or
		 even `render.handlebars.layout`.

		 @class Instrumentation
		 @namespace Ember
		 @static
		 */
		Ember.Instrumentation = {};

		var subscribers = [], cache = {};

		var populateListeners = function(name) {
			var listeners = [], subscriber;

			for (var i=0, l=subscribers.length; i<l; i++) {
				subscriber = subscribers[i];
				if (subscriber.regex.test(name)) {
					listeners.push(subscriber.object);
				}
			}

			cache[name] = listeners;
			return listeners;
		};

		var time = (function() {
			var perf = 'undefined' !== typeof window ? window.performance || {} : {};
			var fn = perf.now || perf.mozNow || perf.webkitNow || perf.msNow || perf.oNow;
			// fn.bind will be available in all the browsers that support the advanced window.performance... ;-)
			return fn ? fn.bind(perf) : function() { return +new Date(); };
		})();

		/**
		 Notifies event's subscribers, calls `before` and `after` hooks.

		 @method instrument
		 @namespace Ember.Instrumentation

		 @param {String} [name] Namespaced event name.
		 @param {Object} payload
		 @param {Function} callback Function that you're instrumenting.
		 @param {Object} binding Context that instrument function is called with.
		 */
		Ember.Instrumentation.instrument = function(name, payload, callback, binding) {
			var listeners = cache[name], timeName, ret;

			if (Ember.STRUCTURED_PROFILE) {
				timeName = name + ": " + payload.object;
				console.time(timeName);
			}

			if (!listeners) {
				listeners = populateListeners(name);
			}

			if (listeners.length === 0) {
				ret = callback.call(binding);
				if (Ember.STRUCTURED_PROFILE) { console.timeEnd(timeName); }
				return ret;
			}

			var beforeValues = [], listener, i, l;

			function tryable() {
				for (i=0, l=listeners.length; i<l; i++) {
					listener = listeners[i];
					beforeValues[i] = listener.before(name, time(), payload);
				}

				return callback.call(binding);
			}

			function catchable(e) {
				payload = payload || {};
				payload.exception = e;
			}

			function finalizer() {
				for (i=0, l=listeners.length; i<l; i++) {
					listener = listeners[i];
					listener.after(name, time(), payload, beforeValues[i]);
				}

				if (Ember.STRUCTURED_PROFILE) {
					console.timeEnd(timeName);
				}
			}

			return Ember.tryCatchFinally(tryable, catchable, finalizer);
		};

		/**
		 Subscribes to a particular event or instrumented block of code.

		 @method subscribe
		 @namespace Ember.Instrumentation

		 @param {String} [pattern] Namespaced event name.
		 @param {Object} [object] Before and After hooks.
		 */
		Ember.Instrumentation.subscribe = function(pattern, object) {
			var paths = pattern.split("."), path, regex = [];

			for (var i=0, l=paths.length; i<l; i++) {
				path = paths[i];
				if (path === "*") {
					regex.push("[^\\.]*");
				} else {
					regex.push(path);
				}
			}

			regex = regex.join("\\.");
			regex = regex + "(\\..*)?";

			var subscriber = {
				pattern: pattern,
				regex: new RegExp("^" + regex + "$"),
				object: object
			};

			subscribers.push(subscriber);
			cache = {};

			return subscriber;
		};

		/**
		 Unsubscribes from a particular event or instrumented block of code.

		 @method unsubscribe
		 @namespace Ember.Instrumentation

		 @param {Object} [subscriber]
		 */
		Ember.Instrumentation.unsubscribe = function(subscriber) {
			var index;

			for (var i=0, l=subscribers.length; i<l; i++) {
				if (subscribers[i] === subscriber) {
					index = i;
				}
			}

			subscribers.splice(index, 1);
			cache = {};
		};

		/**
		 Resets `Ember.Instrumentation` by flushing list of subscribers.

		 @method reset
		 @namespace Ember.Instrumentation
		 */
		Ember.Instrumentation.reset = function() {
			subscribers = [];
			cache = {};
		};

		Ember.instrument = Ember.Instrumentation.instrument;
		Ember.subscribe = Ember.Instrumentation.subscribe;
	})();



	(function() {
		var map, forEach, indexOf, splice;
		map     = Array.prototype.map     || Ember.ArrayPolyfills.map;
		forEach = Array.prototype.forEach || Ember.ArrayPolyfills.forEach;
		indexOf = Array.prototype.indexOf || Ember.ArrayPolyfills.indexOf;
		splice = Array.prototype.splice;

		var utils = Ember.EnumerableUtils = {
			map: function(obj, callback, thisArg) {
				return obj.map ? obj.map.call(obj, callback, thisArg) : map.call(obj, callback, thisArg);
			},

			forEach: function(obj, callback, thisArg) {
				return obj.forEach ? obj.forEach.call(obj, callback, thisArg) : forEach.call(obj, callback, thisArg);
			},

			indexOf: function(obj, element, index) {
				return obj.indexOf ? obj.indexOf.call(obj, element, index) : indexOf.call(obj, element, index);
			},

			indexesOf: function(obj, elements) {
				return elements === undefined ? [] : utils.map(elements, function(item) {
					return utils.indexOf(obj, item);
				});
			},

			addObject: function(array, item) {
				var index = utils.indexOf(array, item);
				if (index === -1) { array.push(item); }
			},

			removeObject: function(array, item) {
				var index = utils.indexOf(array, item);
				if (index !== -1) { array.splice(index, 1); }
			},

			_replace: function(array, idx, amt, objects) {
				var args = [].concat(objects), chunk, ret = [],
				// https://code.google.com/p/chromium/issues/detail?id=56588
					size = 60000, start = idx, ends = amt, count;

				while (args.length) {
					count = ends > size ? size : ends;
					if (count <= 0) { count = 0; }

					chunk = args.splice(0, size);
					chunk = [start, count].concat(chunk);

					start += size;
					ends -= count;

					ret = ret.concat(splice.apply(array, chunk));
				}
				return ret;
			},

			replace: function(array, idx, amt, objects) {
				if (array.replace) {
					return array.replace(idx, amt, objects);
				} else {
					return utils._replace(array, idx, amt, objects);
				}
			},

			intersection: function(array1, array2) {
				var intersection = [];

				utils.forEach(array1, function(element) {
					if (utils.indexOf(array2, element) >= 0) {
						intersection.push(element);
					}
				});

				return intersection;
			}
		};

	})();



	(function() {
		/**
		 @module ember-metal
		 */

		var META_KEY = Ember.META_KEY, get;

		var MANDATORY_SETTER = Ember.ENV.MANDATORY_SETTER;

		var IS_GLOBAL_PATH = /^([A-Z$]|([0-9][A-Z$])).*[\.\*]/;
		var HAS_THIS  = /^this[\.\*]/;
		var FIRST_KEY = /^([^\.\*]+)/;

// ..........................................................
// GET AND SET
//
// If we are on a platform that supports accessors we can use those.
// Otherwise simulate accessors by looking up the property directly on the
// object.

		/**
		 Gets the value of a property on an object. If the property is computed,
		 the function will be invoked. If the property is not defined but the
		 object implements the `unknownProperty` method then that will be invoked.

		 If you plan to run on IE8 and older browsers then you should use this
		 method anytime you want to retrieve a property on an object that you don't
		 know for sure is private. (Properties beginning with an underscore '_'
		 are considered private.)

		 On all newer browsers, you only need to use this method to retrieve
		 properties if the property might not be defined on the object and you want
		 to respect the `unknownProperty` handler. Otherwise you can ignore this
		 method.

		 Note that if the object itself is `undefined`, this method will throw
		 an error.

		 @method get
		 @for Ember
		 @param {Object} obj The object to retrieve from.
		 @param {String} keyName The property key to retrieve
		 @return {Object} the property value or `null`.
		 */
		get = function get(obj, keyName) {
			// Helpers that operate with 'this' within an #each
			if (keyName === '') {
				return obj;
			}

			if (!keyName && 'string'===typeof obj) {
				keyName = obj;
				obj = null;
			}



			if (obj === null || keyName.indexOf('.') !== -1) {
				return getPath(obj, keyName);
			}

			var meta = obj[META_KEY], desc = meta && meta.descs[keyName], ret;
			if (desc) {
				return desc.get(obj, keyName);
			} else {
				if (MANDATORY_SETTER && meta && meta.watching[keyName] > 0) {
					ret = meta.values[keyName];
				} else {
					ret = obj[keyName];
				}

				if (ret === undefined &&
					'object' === typeof obj && !(keyName in obj) && 'function' === typeof obj.unknownProperty) {
					return obj.unknownProperty(keyName);
				}

				return ret;
			}
		};

// Currently used only by Ember Data tests
		if (Ember.config.overrideAccessors) {
			Ember.get = get;
			Ember.config.overrideAccessors();
			get = Ember.get;
		}

		/**
		 @private

		 Normalizes a target/path pair to reflect that actual target/path that should
		 be observed, etc. This takes into account passing in global property
		 paths (i.e. a path beginning with a captial letter not defined on the
		 target) and * separators.

		 @method normalizeTuple
		 @for Ember
		 @param {Object} target The current target. May be `null`.
		 @param {String} path A path on the target or a global property path.
		 @return {Array} a temporary array with the normalized target/path pair.
		 */
		var normalizeTuple = Ember.normalizeTuple = function(target, path) {
			var hasThis  = HAS_THIS.test(path),
				isGlobal = !hasThis && IS_GLOBAL_PATH.test(path),
				key;

			if (!target || isGlobal) target = Ember.lookup;
			if (hasThis) path = path.slice(5);

			if (target === Ember.lookup) {
				key = path.match(FIRST_KEY)[0];
				target = get(target, key);
				path   = path.slice(key.length+1);
			}

			// must return some kind of path to be valid else other things will break.
			if (!path || path.length===0) throw new Error('Invalid Path');

			return [ target, path ];
		};

		var getPath = Ember._getPath = function(root, path) {
			var hasThis, parts, tuple, idx, len;

			// If there is no root and path is a key name, return that
			// property from the global object.
			// E.g. get('Ember') -> Ember
			if (root === null && path.indexOf('.') === -1) { return get(Ember.lookup, path); }

			// detect complicated paths and normalize them
			hasThis  = HAS_THIS.test(path);

			if (!root || hasThis) {
				tuple = normalizeTuple(root, path);
				root = tuple[0];
				path = tuple[1];
				tuple.length = 0;
			}

			parts = path.split(".");
			len = parts.length;
			for (idx = 0; root != null && idx < len; idx++) {
				root = get(root, parts[idx], true);
				if (root && root.isDestroyed) { return undefined; }
			}
			return root;
		};

		Ember.getWithDefault = function(root, key, defaultValue) {
			var value = get(root, key);

			if (value === undefined) { return defaultValue; }
			return value;
		};


		Ember.get = get;
		Ember.getPath = Ember.deprecateFunc('getPath is deprecated since get now supports paths', Ember.get);

	})();



	(function() {
		/**
		 @module ember-metal
		 */

		var o_create = Ember.create,
			metaFor = Ember.meta,
			META_KEY = Ember.META_KEY,
			a_slice = [].slice,
		/* listener flags */
			ONCE = 1, SUSPENDED = 2;

		/*
		 The event system uses a series of nested hashes to store listeners on an
		 object. When a listener is registered, or when an event arrives, these
		 hashes are consulted to determine which target and action pair to invoke.

		 The hashes are stored in the object's meta hash, and look like this:

		 // Object's meta hash
		 {
		 listeners: {       // variable name: `listenerSet`
		 "foo:changed": [ // variable name: `actions`
		 target, method, flags
		 ]
		 }
		 }

		 */

		function indexOf(array, target, method) {
			var index = -1;
			for (var i = 0, l = array.length; i < l; i += 3) {
				if (target === array[i] && method === array[i+1]) { index = i; break; }
			}
			return index;
		}

		function actionsFor(obj, eventName) {
			var meta = metaFor(obj, true),
				actions;

			if (!meta.listeners) { meta.listeners = {}; }

			if (!meta.hasOwnProperty('listeners')) {
				// setup inherited copy of the listeners object
				meta.listeners = o_create(meta.listeners);
			}

			actions = meta.listeners[eventName];

			// if there are actions, but the eventName doesn't exist in our listeners, then copy them from the prototype
			if (actions && !meta.listeners.hasOwnProperty(eventName)) {
				actions = meta.listeners[eventName] = meta.listeners[eventName].slice();
			} else if (!actions) {
				actions = meta.listeners[eventName] = [];
			}

			return actions;
		}

		function actionsUnion(obj, eventName, otherActions) {
			var meta = obj[META_KEY],
				actions = meta && meta.listeners && meta.listeners[eventName];

			if (!actions) { return; }
			for (var i = actions.length - 3; i >= 0; i -= 3) {
				var target = actions[i],
					method = actions[i+1],
					flags = actions[i+2],
					actionIndex = indexOf(otherActions, target, method);

				if (actionIndex === -1) {
					otherActions.push(target, method, flags);
				}
			}
		}

		function actionsDiff(obj, eventName, otherActions) {
			var meta = obj[META_KEY],
				actions = meta && meta.listeners && meta.listeners[eventName],
				diffActions = [];

			if (!actions) { return; }
			for (var i = actions.length - 3; i >= 0; i -= 3) {
				var target = actions[i],
					method = actions[i+1],
					flags = actions[i+2],
					actionIndex = indexOf(otherActions, target, method);

				if (actionIndex !== -1) { continue; }

				otherActions.push(target, method, flags);
				diffActions.push(target, method, flags);
			}

			return diffActions;
		}

		/**
		 Add an event listener

		 @method addListener
		 @for Ember
		 @param obj
		 @param {String} eventName
		 @param {Object|Function} targetOrMethod A target object or a function
		 @param {Function|String} method A function or the name of a function to be called on `target`
		 @param {Boolean} once A flag whether a function should only be called once
		 */
		function addListener(obj, eventName, target, method, once) {


			if (!method && 'function' === typeof target) {
				method = target;
				target = null;
			}

			var actions = actionsFor(obj, eventName),
				actionIndex = indexOf(actions, target, method),
				flags = 0;

			if (once) flags |= ONCE;

			if (actionIndex !== -1) { return; }

			actions.push(target, method, flags);

			if ('function' === typeof obj.didAddListener) {
				obj.didAddListener(eventName, target, method);
			}
		}

		/**
		 Remove an event listener

		 Arguments should match those passed to `Ember.addListener`.

		 @method removeListener
		 @for Ember
		 @param obj
		 @param {String} eventName
		 @param {Object|Function} targetOrMethod A target object or a function
		 @param {Function|String} method A function or the name of a function to be called on `target`
		 */
		function removeListener(obj, eventName, target, method) {


			if (!method && 'function' === typeof target) {
				method = target;
				target = null;
			}

			function _removeListener(target, method) {
				var actions = actionsFor(obj, eventName),
					actionIndex = indexOf(actions, target, method);

				// action doesn't exist, give up silently
				if (actionIndex === -1) { return; }

				actions.splice(actionIndex, 3);

				if ('function' === typeof obj.didRemoveListener) {
					obj.didRemoveListener(eventName, target, method);
				}
			}

			if (method) {
				_removeListener(target, method);
			} else {
				var meta = obj[META_KEY],
					actions = meta && meta.listeners && meta.listeners[eventName];

				if (!actions) { return; }
				for (var i = actions.length - 3; i >= 0; i -= 3) {
					_removeListener(actions[i], actions[i+1]);
				}
			}
		}

		/**
		 @private

		 Suspend listener during callback.

		 This should only be used by the target of the event listener
		 when it is taking an action that would cause the event, e.g.
		 an object might suspend its property change listener while it is
		 setting that property.

		 @method suspendListener
		 @for Ember
		 @param obj
		 @param {String} eventName
		 @param {Object|Function} targetOrMethod A target object or a function
		 @param {Function|String} method A function or the name of a function to be called on `target`
		 @param {Function} callback
		 */
		function suspendListener(obj, eventName, target, method, callback) {
			if (!method && 'function' === typeof target) {
				method = target;
				target = null;
			}

			var actions = actionsFor(obj, eventName),
				actionIndex = indexOf(actions, target, method);

			if (actionIndex !== -1) {
				actions[actionIndex+2] |= SUSPENDED; // mark the action as suspended
			}

			function tryable()   { return callback.call(target); }
			function finalizer() { if (actionIndex !== -1) { actions[actionIndex+2] &= ~SUSPENDED; } }

			return Ember.tryFinally(tryable, finalizer);
		}

		/**
		 @private

		 Suspends multiple listeners during a callback.


		 @method suspendListeners
		 @for Ember
		 @param obj
		 @param {Array} eventName Array of event names
		 @param {Object|Function} targetOrMethod A target object or a function
		 @param {Function|String} method A function or the name of a function to be called on `target`
		 @param {Function} callback
		 */
		function suspendListeners(obj, eventNames, target, method, callback) {
			if (!method && 'function' === typeof target) {
				method = target;
				target = null;
			}

			var suspendedActions = [],
				eventName, actions, i, l;

			for (i=0, l=eventNames.length; i<l; i++) {
				eventName = eventNames[i];
				actions = actionsFor(obj, eventName);
				var actionIndex = indexOf(actions, target, method);

				if (actionIndex !== -1) {
					actions[actionIndex+2] |= SUSPENDED;
					suspendedActions.push(actionIndex);
				}
			}

			function tryable() { return callback.call(target); }

			function finalizer() {
				for (var i = 0, l = suspendedActions.length; i < l; i++) {
					var actionIndex = suspendedActions[i];
					actions[actionIndex+2] &= ~SUSPENDED;
				}
			}

			return Ember.tryFinally(tryable, finalizer);
		}

		/**
		 @private

		 Return a list of currently watched events

		 @method watchedEvents
		 @for Ember
		 @param obj
		 */
		function watchedEvents(obj) {
			var listeners = obj[META_KEY].listeners, ret = [];

			if (listeners) {
				for(var eventName in listeners) {
					if (listeners[eventName]) { ret.push(eventName); }
				}
			}
			return ret;
		}

		/**
		 Send an event. The execution of suspended listeners
		 is skipped, and once listeners are removed. A listener without
		 a target is executed on the passed object. If an array of actions
		 is not passed, the actions stored on the passed object are invoked.

		 @method sendEvent
		 @for Ember
		 @param obj
		 @param {String} eventName
		 @param {Array} params Optional parameters for each listener.
		 @param {Array} actions Optional array of actions (listeners).
		 @return true
		 */
		function sendEvent(obj, eventName, params, actions) {
			// first give object a chance to handle it
			if (obj !== Ember && 'function' === typeof obj.sendEvent) {
				obj.sendEvent(eventName, params);
			}

			if (!actions) {
				var meta = obj[META_KEY];
				actions = meta && meta.listeners && meta.listeners[eventName];
			}

			if (!actions) { return; }

			for (var i = actions.length - 3; i >= 0; i -= 3) { // looping in reverse for once listeners
				var target = actions[i], method = actions[i+1], flags = actions[i+2];
				if (!method) { continue; }
				if (flags & SUSPENDED) { continue; }
				if (flags & ONCE) { removeListener(obj, eventName, target, method); }
				if (!target) { target = obj; }
				if ('string' === typeof method) { method = target[method]; }
				if (params) {
					method.apply(target, params);
				} else {
					method.call(target);
				}
			}
			return true;
		}

		/**
		 @private
		 @method hasListeners
		 @for Ember
		 @param obj
		 @param {String} eventName
		 */
		function hasListeners(obj, eventName) {
			var meta = obj[META_KEY],
				actions = meta && meta.listeners && meta.listeners[eventName];

			return !!(actions && actions.length);
		}

		/**
		 @private
		 @method listenersFor
		 @for Ember
		 @param obj
		 @param {String} eventName
		 */
		function listenersFor(obj, eventName) {
			var ret = [];
			var meta = obj[META_KEY],
				actions = meta && meta.listeners && meta.listeners[eventName];

			if (!actions) { return ret; }

			for (var i = 0, l = actions.length; i < l; i += 3) {
				var target = actions[i],
					method = actions[i+1];
				ret.push([target, method]);
			}

			return ret;
		}

		/**
		 Define a property as a function that should be executed when
		 a specified event or events are triggered.

		 var Job = Ember.Object.extend({
        logCompleted: Ember.on('completed', function(){
          console.log('Job completed!');
        })
      });
		 var job = Job.create();
		 Ember.sendEvent(job, 'completed'); // Logs "Job completed!"

		 @method on
		 @for Ember
		 @param {String} eventNames*
		 @param {Function} func
		 @return func
		 */
		Ember.on = function(){
			var func = a_slice.call(arguments, -1)[0],
				events = a_slice.call(arguments, 0, -1);
			func.__ember_listens__ = events;
			return func;
		};

		Ember.addListener = addListener;
		Ember.removeListener = removeListener;
		Ember._suspendListener = suspendListener;
		Ember._suspendListeners = suspendListeners;
		Ember.sendEvent = sendEvent;
		Ember.hasListeners = hasListeners;
		Ember.watchedEvents = watchedEvents;
		Ember.listenersFor = listenersFor;
		Ember.listenersDiff = actionsDiff;
		Ember.listenersUnion = actionsUnion;

	})();



	(function() {
		var guidFor = Ember.guidFor,
			sendEvent = Ember.sendEvent;

		/*
		 this.observerSet = {
		 [senderGuid]: { // variable name: `keySet`
		 [keyName]: listIndex
		 }
		 },
		 this.observers = [
		 {
		 sender: obj,
		 keyName: keyName,
		 eventName: eventName,
		 listeners: [
		 [target, method, flags]
		 ]
		 },
		 ...
		 ]
		 */
		var ObserverSet = Ember._ObserverSet = function() {
			this.clear();
		};

		ObserverSet.prototype.add = function(sender, keyName, eventName) {
			var observerSet = this.observerSet,
				observers = this.observers,
				senderGuid = guidFor(sender),
				keySet = observerSet[senderGuid],
				index;

			if (!keySet) {
				observerSet[senderGuid] = keySet = {};
			}
			index = keySet[keyName];
			if (index === undefined) {
				index = observers.push({
					sender: sender,
					keyName: keyName,
					eventName: eventName,
					listeners: []
				}) - 1;
				keySet[keyName] = index;
			}
			return observers[index].listeners;
		};

		ObserverSet.prototype.flush = function() {
			var observers = this.observers, i, len, observer, sender;
			this.clear();
			for (i=0, len=observers.length; i < len; ++i) {
				observer = observers[i];
				sender = observer.sender;
				if (sender.isDestroying || sender.isDestroyed) { continue; }
				sendEvent(sender, observer.eventName, [sender, observer.keyName], observer.listeners);
			}
		};

		ObserverSet.prototype.clear = function() {
			this.observerSet = {};
			this.observers = [];
		};
	})();



	(function() {
		var metaFor = Ember.meta,
			guidFor = Ember.guidFor,
			tryFinally = Ember.tryFinally,
			sendEvent = Ember.sendEvent,
			listenersUnion = Ember.listenersUnion,
			listenersDiff = Ember.listenersDiff,
			ObserverSet = Ember._ObserverSet,
			beforeObserverSet = new ObserverSet(),
			observerSet = new ObserverSet(),
			deferred = 0;

// ..........................................................
// PROPERTY CHANGES
//

		/**
		 This function is called just before an object property is about to change.
		 It will notify any before observers and prepare caches among other things.

		 Normally you will not need to call this method directly but if for some
		 reason you can't directly watch a property you can invoke this method
		 manually along with `Ember.propertyDidChange()` which you should call just
		 after the property value changes.

		 @method propertyWillChange
		 @for Ember
		 @param {Object} obj The object with the property that will change
		 @param {String} keyName The property key (or path) that will change.
		 @return {void}
		 */
		function propertyWillChange(obj, keyName) {
			var m = metaFor(obj, false),
				watching = m.watching[keyName] > 0 || keyName === 'length',
				proto = m.proto,
				desc = m.descs[keyName];

			if (!watching) { return; }
			if (proto === obj) { return; }
			if (desc && desc.willChange) { desc.willChange(obj, keyName); }
			dependentKeysWillChange(obj, keyName, m);
			chainsWillChange(obj, keyName, m);
			notifyBeforeObservers(obj, keyName);
		}
		Ember.propertyWillChange = propertyWillChange;

		/**
		 This function is called just after an object property has changed.
		 It will notify any observers and clear caches among other things.

		 Normally you will not need to call this method directly but if for some
		 reason you can't directly watch a property you can invoke this method
		 manually along with `Ember.propertyWillChange()` which you should call just
		 before the property value changes.

		 @method propertyDidChange
		 @for Ember
		 @param {Object} obj The object with the property that will change
		 @param {String} keyName The property key (or path) that will change.
		 @return {void}
		 */
		function propertyDidChange(obj, keyName) {
			var m = metaFor(obj, false),
				watching = m.watching[keyName] > 0 || keyName === 'length',
				proto = m.proto,
				desc = m.descs[keyName];

			if (proto === obj) { return; }

			// shouldn't this mean that we're watching this key?
			if (desc && desc.didChange) { desc.didChange(obj, keyName); }
			if (!watching && keyName !== 'length') { return; }

			dependentKeysDidChange(obj, keyName, m);
			chainsDidChange(obj, keyName, m, false);
			notifyObservers(obj, keyName);
		}
		Ember.propertyDidChange = propertyDidChange;

		var WILL_SEEN, DID_SEEN;

// called whenever a property is about to change to clear the cache of any dependent keys (and notify those properties of changes, etc...)
		function dependentKeysWillChange(obj, depKey, meta) {
			if (obj.isDestroying) { return; }

			var seen = WILL_SEEN, top = !seen;
			if (top) { seen = WILL_SEEN = {}; }
			iterDeps(propertyWillChange, obj, depKey, seen, meta);
			if (top) { WILL_SEEN = null; }
		}

// called whenever a property has just changed to update dependent keys
		function dependentKeysDidChange(obj, depKey, meta) {
			if (obj.isDestroying) { return; }

			var seen = DID_SEEN, top = !seen;
			if (top) { seen = DID_SEEN = {}; }
			iterDeps(propertyDidChange, obj, depKey, seen, meta);
			if (top) { DID_SEEN = null; }
		}

		function iterDeps(method, obj, depKey, seen, meta) {
			var guid = guidFor(obj);
			if (!seen[guid]) seen[guid] = {};
			if (seen[guid][depKey]) return;
			seen[guid][depKey] = true;

			var deps = meta.deps;
			deps = deps && deps[depKey];
			if (deps) {
				for(var key in deps) {
					var desc = meta.descs[key];
					if (desc && desc._suspended === obj) continue;
					method(obj, key);
				}
			}
		}

		function chainsWillChange(obj, keyName, m) {
			if (!(m.hasOwnProperty('chainWatchers') &&
				m.chainWatchers[keyName])) {
				return;
			}

			var nodes = m.chainWatchers[keyName],
				events = [],
				i, l;

			for(i = 0, l = nodes.length; i < l; i++) {
				nodes[i].willChange(events);
			}

			for (i = 0, l = events.length; i < l; i += 2) {
				propertyWillChange(events[i], events[i+1]);
			}
		}

		function chainsDidChange(obj, keyName, m, suppressEvents) {
			if (!(m.hasOwnProperty('chainWatchers') &&
				m.chainWatchers[keyName])) {
				return;
			}

			var nodes = m.chainWatchers[keyName],
				events = suppressEvents ? null : [],
				i, l;

			for(i = 0, l = nodes.length; i < l; i++) {
				nodes[i].didChange(events);
			}

			if (suppressEvents) {
				return;
			}

			for (i = 0, l = events.length; i < l; i += 2) {
				propertyDidChange(events[i], events[i+1]);
			}
		}

		Ember.overrideChains = function(obj, keyName, m) {
			chainsDidChange(obj, keyName, m, true);
		};

		/**
		 @method beginPropertyChanges
		 @chainable
		 */
		function beginPropertyChanges() {
			deferred++;
		}

		Ember.beginPropertyChanges = beginPropertyChanges;

		/**
		 @method endPropertyChanges
		 */
		function endPropertyChanges() {
			deferred--;
			if (deferred<=0) {
				beforeObserverSet.clear();
				observerSet.flush();
			}
		}

		Ember.endPropertyChanges = endPropertyChanges;

		/**
		 Make a series of property changes together in an
		 exception-safe way.

		 ```javascript
		 Ember.changeProperties(function() {
    obj1.set('foo', mayBlowUpWhenSet);
    obj2.set('bar', baz);
  });
		 ```

		 @method changeProperties
		 @param {Function} callback
		 @param [binding]
		 */
		Ember.changeProperties = function(cb, binding) {
			beginPropertyChanges();
			tryFinally(cb, endPropertyChanges, binding);
		};

		function notifyBeforeObservers(obj, keyName) {
			if (obj.isDestroying) { return; }

			var eventName = keyName + ':before', listeners, diff;
			if (deferred) {
				listeners = beforeObserverSet.add(obj, keyName, eventName);
				diff = listenersDiff(obj, eventName, listeners);
				sendEvent(obj, eventName, [obj, keyName], diff);
			} else {
				sendEvent(obj, eventName, [obj, keyName]);
			}
		}

		function notifyObservers(obj, keyName) {
			if (obj.isDestroying) { return; }

			var eventName = keyName + ':change', listeners;
			if (deferred) {
				listeners = observerSet.add(obj, keyName, eventName);
				listenersUnion(obj, eventName, listeners);
			} else {
				sendEvent(obj, eventName, [obj, keyName]);
			}
		}

	})();



	(function() {
// META_KEY
// _getPath
// propertyWillChange, propertyDidChange

		var META_KEY = Ember.META_KEY,
			MANDATORY_SETTER = Ember.ENV.MANDATORY_SETTER,
			IS_GLOBAL = /^([A-Z$]|([0-9][A-Z$]))/,
			getPath = Ember._getPath;

		/**
		 Sets the value of a property on an object, respecting computed properties
		 and notifying observers and other listeners of the change. If the
		 property is not defined but the object implements the `setUnknownProperty`
		 method then that will be invoked as well.

		 If you plan to run on IE8 and older browsers then you should use this
		 method anytime you want to set a property on an object that you don't
		 know for sure is private. (Properties beginning with an underscore '_'
		 are considered private.)

		 On all newer browsers, you only need to use this method to set
		 properties if the property might not be defined on the object and you want
		 to respect the `setUnknownProperty` handler. Otherwise you can ignore this
		 method.

		 @method set
		 @for Ember
		 @param {Object} obj The object to modify.
		 @param {String} keyName The property key to set
		 @param {Object} value The value to set
		 @return {Object} the passed value.
		 */
		var set = function set(obj, keyName, value, tolerant) {
			if (typeof obj === 'string') {

				value = keyName;
				keyName = obj;
				obj = null;
			}


			if (!obj || keyName.indexOf('.') !== -1) {
				return setPath(obj, keyName, value, tolerant);
			}



			var meta = obj[META_KEY], desc = meta && meta.descs[keyName],
				isUnknown, currentValue;
			if (desc) {
				desc.set(obj, keyName, value);
			} else {
				isUnknown = 'object' === typeof obj && !(keyName in obj);

				// setUnknownProperty is called if `obj` is an object,
				// the property does not already exist, and the
				// `setUnknownProperty` method exists on the object
				if (isUnknown && 'function' === typeof obj.setUnknownProperty) {
					obj.setUnknownProperty(keyName, value);
				} else if (meta && meta.watching[keyName] > 0) {
					if (MANDATORY_SETTER) {
						currentValue = meta.values[keyName];
					} else {
						currentValue = obj[keyName];
					}
					// only trigger a change if the value has changed
					if (value !== currentValue) {
						Ember.propertyWillChange(obj, keyName);
						if (MANDATORY_SETTER) {
							if (currentValue === undefined && !(keyName in obj)) {
								Ember.defineProperty(obj, keyName, null, value); // setup mandatory setter
							} else {
								meta.values[keyName] = value;
							}
						} else {
							obj[keyName] = value;
						}
						Ember.propertyDidChange(obj, keyName);
					}
				} else {
					obj[keyName] = value;
				}
			}
			return value;
		};

// Currently used only by Ember Data tests
		if (Ember.config.overrideAccessors) {
			Ember.set = set;
			Ember.config.overrideAccessors();
			set = Ember.set;
		}

		function setPath(root, path, value, tolerant) {
			var keyName;

			// get the last part of the path
			keyName = path.slice(path.lastIndexOf('.') + 1);

			// get the first part of the part
			path    = path.slice(0, path.length-(keyName.length+1));

			// unless the path is this, look up the first part to
			// get the root
			if (path !== 'this') {
				root = getPath(root, path);
			}

			if (!keyName || keyName.length === 0) {
				throw new Error('You passed an empty path');
			}

			if (!root) {
				if (tolerant) { return; }
				else { throw new Error('Object in path '+path+' could not be found or was destroyed.'); }
			}

			return set(root, keyName, value);
		}

		Ember.set = set;
		Ember.setPath = Ember.deprecateFunc('setPath is deprecated since set now supports paths', Ember.set);

		/**
		 Error-tolerant form of `Ember.set`. Will not blow up if any part of the
		 chain is `undefined`, `null`, or destroyed.

		 This is primarily used when syncing bindings, which may try to update after
		 an object has been destroyed.

		 @method trySet
		 @for Ember
		 @param {Object} obj The object to modify.
		 @param {String} path The property path to set
		 @param {Object} value The value to set
		 */
		Ember.trySet = function(root, path, value) {
			return set(root, path, value, true);
		};
		Ember.trySetPath = Ember.deprecateFunc('trySetPath has been renamed to trySet', Ember.trySet);

	})();



	(function() {
		/**
		 @module ember-metal
		 */

		/*
		 JavaScript (before ES6) does not have a Map implementation. Objects,
		 which are often used as dictionaries, may only have Strings as keys.

		 Because Ember has a way to get a unique identifier for every object
		 via `Ember.guidFor`, we can implement a performant Map with arbitrary
		 keys. Because it is commonly used in low-level bookkeeping, Map is
		 implemented as a pure JavaScript object for performance.

		 This implementation follows the current iteration of the ES6 proposal for
		 maps (http://wiki.ecmascript.org/doku.php?id=harmony:simple_maps_and_sets),
		 with two exceptions. First, because we need our implementation to be pleasant
		 on older browsers, we do not use the `delete` name (using `remove` instead).
		 Second, as we do not have the luxury of in-VM iteration, we implement a
		 forEach method for iteration.

		 Map is mocked out to look like an Ember object, so you can do
		 `Ember.Map.create()` for symmetry with other Ember classes.
		 */
		var set = Ember.set,
			guidFor = Ember.guidFor,
			indexOf = Ember.ArrayPolyfills.indexOf;

		var copy = function(obj) {
			var output = {};

			for (var prop in obj) {
				if (obj.hasOwnProperty(prop)) { output[prop] = obj[prop]; }
			}

			return output;
		};

		var copyMap = function(original, newObject) {
			var keys = original.keys.copy(),
				values = copy(original.values);

			newObject.keys = keys;
			newObject.values = values;
			newObject.length = original.length;

			return newObject;
		};

		/**
		 This class is used internally by Ember and Ember Data.
		 Please do not use it at this time. We plan to clean it up
		 and add many tests soon.

		 @class OrderedSet
		 @namespace Ember
		 @constructor
		 @private
		 */
		var OrderedSet = Ember.OrderedSet = function() {
			this.clear();
		};

		/**
		 @method create
		 @static
		 @return {Ember.OrderedSet}
		 */
		OrderedSet.create = function() {
			return new OrderedSet();
		};


		OrderedSet.prototype = {
			/**
			 @method clear
			 */
			clear: function() {
				this.presenceSet = {};
				this.list = [];
			},

			/**
			 @method add
			 @param obj
			 */
			add: function(obj) {
				var guid = guidFor(obj),
					presenceSet = this.presenceSet,
					list = this.list;

				if (guid in presenceSet) { return; }

				presenceSet[guid] = true;
				list.push(obj);
			},

			/**
			 @method remove
			 @param obj
			 */
			remove: function(obj) {
				var guid = guidFor(obj),
					presenceSet = this.presenceSet,
					list = this.list;

				delete presenceSet[guid];

				var index = indexOf.call(list, obj);
				if (index > -1) {
					list.splice(index, 1);
				}
			},

			/**
			 @method isEmpty
			 @return {Boolean}
			 */
			isEmpty: function() {
				return this.list.length === 0;
			},

			/**
			 @method has
			 @param obj
			 @return {Boolean}
			 */
			has: function(obj) {
				var guid = guidFor(obj),
					presenceSet = this.presenceSet;

				return guid in presenceSet;
			},

			/**
			 @method forEach
			 @param {Function} fn
			 @param self
			 */
			forEach: function(fn, self) {
				// allow mutation during iteration
				var list = this.toArray();

				for (var i = 0, j = list.length; i < j; i++) {
					fn.call(self, list[i]);
				}
			},

			/**
			 @method toArray
			 @return {Array}
			 */
			toArray: function() {
				return this.list.slice();
			},

			/**
			 @method copy
			 @return {Ember.OrderedSet}
			 */
			copy: function() {
				var set = new OrderedSet();

				set.presenceSet = copy(this.presenceSet);
				set.list = this.toArray();

				return set;
			}
		};

		/**
		 A Map stores values indexed by keys. Unlike JavaScript's
		 default Objects, the keys of a Map can be any JavaScript
		 object.

		 Internally, a Map has two data structures:

		 1. `keys`: an OrderedSet of all of the existing keys
		 2. `values`: a JavaScript Object indexed by the `Ember.guidFor(key)`

		 When a key/value pair is added for the first time, we
		 add the key to the `keys` OrderedSet, and create or
		 replace an entry in `values`. When an entry is deleted,
		 we delete its entry in `keys` and `values`.

		 @class Map
		 @namespace Ember
		 @private
		 @constructor
		 */
		var Map = Ember.Map = function() {
			this.keys = Ember.OrderedSet.create();
			this.values = {};
		};

		/**
		 @method create
		 @static
		 */
		Map.create = function() {
			return new Map();
		};

		Map.prototype = {
			/**
			 This property will change as the number of objects in the map changes.

			 @property length
			 @type number
			 @default 0
			 */
			length: 0,


			/**
			 Retrieve the value associated with a given key.

			 @method get
			 @param {*} key
			 @return {*} the value associated with the key, or `undefined`
			 */
			get: function(key) {
				var values = this.values,
					guid = guidFor(key);

				return values[guid];
			},

			/**
			 Adds a value to the map. If a value for the given key has already been
			 provided, the new value will replace the old value.

			 @method set
			 @param {*} key
			 @param {*} value
			 */
			set: function(key, value) {
				var keys = this.keys,
					values = this.values,
					guid = guidFor(key);

				keys.add(key);
				values[guid] = value;
				set(this, 'length', keys.list.length);
			},

			/**
			 Removes a value from the map for an associated key.

			 @method remove
			 @param {*} key
			 @return {Boolean} true if an item was removed, false otherwise
			 */
			remove: function(key) {
				// don't use ES6 "delete" because it will be annoying
				// to use in browsers that are not ES6 friendly;
				var keys = this.keys,
					values = this.values,
					guid = guidFor(key);

				if (values.hasOwnProperty(guid)) {
					keys.remove(key);
					delete values[guid];
					set(this, 'length', keys.list.length);
					return true;
				} else {
					return false;
				}
			},

			/**
			 Check whether a key is present.

			 @method has
			 @param {*} key
			 @return {Boolean} true if the item was present, false otherwise
			 */
			has: function(key) {
				var values = this.values,
					guid = guidFor(key);

				return values.hasOwnProperty(guid);
			},

			/**
			 Iterate over all the keys and values. Calls the function once
			 for each key, passing in the key and value, in that order.

			 The keys are guaranteed to be iterated over in insertion order.

			 @method forEach
			 @param {Function} callback
			 @param {*} self if passed, the `this` value inside the
			 callback. By default, `this` is the map.
			 */
			forEach: function(callback, self) {
				var keys = this.keys,
					values = this.values;

				keys.forEach(function(key) {
					var guid = guidFor(key);
					callback.call(self, key, values[guid]);
				});
			},

			/**
			 @method copy
			 @return {Ember.Map}
			 */
			copy: function() {
				return copyMap(this, new Map());
			}
		};

		/**
		 @class MapWithDefault
		 @namespace Ember
		 @extends Ember.Map
		 @private
		 @constructor
		 @param [options]
		 @param {*} [options.defaultValue]
		 */
		var MapWithDefault = Ember.MapWithDefault = function(options) {
			Map.call(this);
			this.defaultValue = options.defaultValue;
		};

		/**
		 @method create
		 @static
		 @param [options]
		 @param {*} [options.defaultValue]
		 @return {Ember.MapWithDefault|Ember.Map} If options are passed, returns
		 `Ember.MapWithDefault` otherwise returns `Ember.Map`
		 */
		MapWithDefault.create = function(options) {
			if (options) {
				return new MapWithDefault(options);
			} else {
				return new Map();
			}
		};

		MapWithDefault.prototype = Ember.create(Map.prototype);

		/**
		 Retrieve the value associated with a given key.

		 @method get
		 @param {*} key
		 @return {*} the value associated with the key, or the default value
		 */
		MapWithDefault.prototype.get = function(key) {
			var hasValue = this.has(key);

			if (hasValue) {
				return Map.prototype.get.call(this, key);
			} else {
				var defaultValue = this.defaultValue(key);
				this.set(key, defaultValue);
				return defaultValue;
			}
		};

		/**
		 @method copy
		 @return {Ember.MapWithDefault}
		 */
		MapWithDefault.prototype.copy = function() {
			return copyMap(this, new MapWithDefault({
				defaultValue: this.defaultValue
			}));
		};

	})();



	(function() {
		/**
		 @module ember-metal
		 */

		var META_KEY = Ember.META_KEY,
			metaFor = Ember.meta,
			objectDefineProperty = Ember.platform.defineProperty;

		var MANDATORY_SETTER = Ember.ENV.MANDATORY_SETTER;

// ..........................................................
// DESCRIPTOR
//

		/**
		 Objects of this type can implement an interface to respond to requests to
		 get and set. The default implementation handles simple properties.

		 You generally won't need to create or subclass this directly.

		 @class Descriptor
		 @namespace Ember
		 @private
		 @constructor
		 */
		Ember.Descriptor = function() {};

// ..........................................................
// DEFINING PROPERTIES API
//

		var MANDATORY_SETTER_FUNCTION = Ember.MANDATORY_SETTER_FUNCTION = function(value) {

		};

		var DEFAULT_GETTER_FUNCTION = Ember.DEFAULT_GETTER_FUNCTION = function(name) {
			return function() {
				var meta = this[META_KEY];
				return meta && meta.values[name];
			};
		};

		/**
		 @private

		 NOTE: This is a low-level method used by other parts of the API. You almost
		 never want to call this method directly. Instead you should use
		 `Ember.mixin()` to define new properties.

		 Defines a property on an object. This method works much like the ES5
		 `Object.defineProperty()` method except that it can also accept computed
		 properties and other special descriptors.

		 Normally this method takes only three parameters. However if you pass an
		 instance of `Ember.Descriptor` as the third param then you can pass an
		 optional value as the fourth parameter. This is often more efficient than
		 creating new descriptor hashes for each property.

		 ## Examples

		 ```javascript
		 // ES5 compatible mode
		 Ember.defineProperty(contact, 'firstName', {
    writable: true,
    configurable: false,
    enumerable: true,
    value: 'Charles'
  });

		 // define a simple property
		 Ember.defineProperty(contact, 'lastName', undefined, 'Jolley');

		 // define a computed property
		 Ember.defineProperty(contact, 'fullName', Ember.computed(function() {
    return this.firstName+' '+this.lastName;
  }).property('firstName', 'lastName'));
		 ```

		 @method defineProperty
		 @for Ember
		 @param {Object} obj the object to define this property on. This may be a prototype.
		 @param {String} keyName the name of the property
		 @param {Ember.Descriptor} [desc] an instance of `Ember.Descriptor` (typically a
		 computed property) or an ES5 descriptor.
		 You must provide this or `data` but not both.
		 @param {*} [data] something other than a descriptor, that will
		 become the explicit value of this property.
		 */
		Ember.defineProperty = function(obj, keyName, desc, data, meta) {
			var descs, existingDesc, watching, value;

			if (!meta) meta = metaFor(obj);
			descs = meta.descs;
			existingDesc = meta.descs[keyName];
			watching = meta.watching[keyName] > 0;

			if (existingDesc instanceof Ember.Descriptor) {
				existingDesc.teardown(obj, keyName);
			}

			if (desc instanceof Ember.Descriptor) {
				value = desc;

				descs[keyName] = desc;
				if (MANDATORY_SETTER && watching) {
					objectDefineProperty(obj, keyName, {
						configurable: true,
						enumerable: true,
						writable: true,
						value: undefined // make enumerable
					});
				} else {
					obj[keyName] = undefined; // make enumerable
				}
			} else {
				descs[keyName] = undefined; // shadow descriptor in proto
				if (desc == null) {
					value = data;

					if (MANDATORY_SETTER && watching) {
						meta.values[keyName] = data;
						objectDefineProperty(obj, keyName, {
							configurable: true,
							enumerable: true,
							set: MANDATORY_SETTER_FUNCTION,
							get: DEFAULT_GETTER_FUNCTION(keyName)
						});
					} else {
						obj[keyName] = data;
					}
				} else {
					value = desc;

					// compatibility with ES5
					objectDefineProperty(obj, keyName, desc);
				}
			}

			// if key is being watched, override chains that
			// were initialized with the prototype
			if (watching) { Ember.overrideChains(obj, keyName, meta); }

			// The `value` passed to the `didDefineProperty` hook is
			// either the descriptor or data, whichever was passed.
			if (obj.didDefineProperty) { obj.didDefineProperty(obj, keyName, value); }

			return this;
		};


	})();



	(function() {
		var get = Ember.get;

		/**
		 To get multiple properties at once, call `Ember.getProperties`
		 with an object followed by a list of strings or an array:

		 ```javascript
		 Ember.getProperties(record, 'firstName', 'lastName', 'zipCode');  // { firstName: 'John', lastName: 'Doe', zipCode: '10011' }
		 ```

		 is equivalent to:

		 ```javascript
		 Ember.getProperties(record, ['firstName', 'lastName', 'zipCode']);  // { firstName: 'John', lastName: 'Doe', zipCode: '10011' }
		 ```

		 @method getProperties
		 @param obj
		 @param {String...|Array} list of keys to get
		 @return {Hash}
		 */
		Ember.getProperties = function(obj) {
			var ret = {},
				propertyNames = arguments,
				i = 1;

			if (arguments.length === 2 && Ember.typeOf(arguments[1]) === 'array') {
				i = 0;
				propertyNames = arguments[1];
			}
			for(var len = propertyNames.length; i < len; i++) {
				ret[propertyNames[i]] = get(obj, propertyNames[i]);
			}
			return ret;
		};

	})();



	(function() {
		var changeProperties = Ember.changeProperties,
			set = Ember.set;

		/**
		 Set a list of properties on an object. These properties are set inside
		 a single `beginPropertyChanges` and `endPropertyChanges` batch, so
		 observers will be buffered.

		 ```javascript
		 anObject.setProperties({
    firstName: "Stanley",
    lastName: "Stuart",
    age: "21"
  })
		 ```

		 @method setProperties
		 @param self
		 @param {Object} hash
		 @return self
		 */
		Ember.setProperties = function(self, hash) {
			changeProperties(function() {
				for(var prop in hash) {
					if (hash.hasOwnProperty(prop)) { set(self, prop, hash[prop]); }
				}
			});
			return self;
		};

	})();



	(function() {
		var metaFor = Ember.meta, // utils.js
			typeOf = Ember.typeOf, // utils.js
			MANDATORY_SETTER = Ember.ENV.MANDATORY_SETTER,
			o_defineProperty = Ember.platform.defineProperty;

		Ember.watchKey = function(obj, keyName) {
			// can't watch length on Array - it is special...
			if (keyName === 'length' && typeOf(obj) === 'array') { return; }

			var m = metaFor(obj), watching = m.watching;

			// activate watching first time
			if (!watching[keyName]) {
				watching[keyName] = 1;

				if ('function' === typeof obj.willWatchProperty) {
					obj.willWatchProperty(keyName);
				}

				if (MANDATORY_SETTER && keyName in obj) {
					m.values[keyName] = obj[keyName];
					o_defineProperty(obj, keyName, {
						configurable: true,
						enumerable: true,
						set: Ember.MANDATORY_SETTER_FUNCTION,
						get: Ember.DEFAULT_GETTER_FUNCTION(keyName)
					});
				}
			} else {
				watching[keyName] = (watching[keyName] || 0) + 1;
			}
		};


		Ember.unwatchKey = function(obj, keyName) {
			var m = metaFor(obj), watching = m.watching;

			if (watching[keyName] === 1) {
				watching[keyName] = 0;

				if ('function' === typeof obj.didUnwatchProperty) {
					obj.didUnwatchProperty(keyName);
				}

				if (MANDATORY_SETTER && keyName in obj) {
					o_defineProperty(obj, keyName, {
						configurable: true,
						enumerable: true,
						writable: true,
						value: m.values[keyName]
					});
					delete m.values[keyName];
				}
			} else if (watching[keyName] > 1) {
				watching[keyName]--;
			}
		};

	})();



	(function() {
		var metaFor = Ember.meta, // utils.js
			get = Ember.get, // property_get.js
			normalizeTuple = Ember.normalizeTuple, // property_get.js
			forEach = Ember.ArrayPolyfills.forEach, // array.js
			warn = Ember.warn,
			watchKey = Ember.watchKey,
			unwatchKey = Ember.unwatchKey,
			FIRST_KEY = /^([^\.\*]+)/;

		function firstKey(path) {
			return path.match(FIRST_KEY)[0];
		}

		var pendingQueue = [];

// attempts to add the pendingQueue chains again. If some of them end up
// back in the queue and reschedule is true, schedules a timeout to try
// again.
		Ember.flushPendingChains = function() {
			if (pendingQueue.length === 0) { return; } // nothing to do

			var queue = pendingQueue;
			pendingQueue = [];

			forEach.call(queue, function(q) { q[0].add(q[1]); });

			warn('Watching an undefined global, Ember expects watched globals to be setup by the time the run loop is flushed, check for typos', pendingQueue.length === 0);
		};


		function addChainWatcher(obj, keyName, node) {
			if (!obj || ('object' !== typeof obj)) { return; } // nothing to do

			var m = metaFor(obj), nodes = m.chainWatchers;

			if (!m.hasOwnProperty('chainWatchers')) {
				nodes = m.chainWatchers = {};
			}

			if (!nodes[keyName]) { nodes[keyName] = []; }
			nodes[keyName].push(node);
			watchKey(obj, keyName);
		}

		var removeChainWatcher = Ember.removeChainWatcher = function(obj, keyName, node) {
			if (!obj || 'object' !== typeof obj) { return; } // nothing to do

			var m = metaFor(obj, false);
			if (!m.hasOwnProperty('chainWatchers')) { return; } // nothing to do

			var nodes = m.chainWatchers;

			if (nodes[keyName]) {
				nodes = nodes[keyName];
				for (var i = 0, l = nodes.length; i < l; i++) {
					if (nodes[i] === node) { nodes.splice(i, 1); }
				}
			}
			unwatchKey(obj, keyName);
		};

// A ChainNode watches a single key on an object. If you provide a starting
// value for the key then the node won't actually watch it. For a root node
// pass null for parent and key and object for value.
		var ChainNode = Ember._ChainNode = function(parent, key, value) {
			this._parent = parent;
			this._key    = key;

			// _watching is true when calling get(this._parent, this._key) will
			// return the value of this node.
			//
			// It is false for the root of a chain (because we have no parent)
			// and for global paths (because the parent node is the object with
			// the observer on it)
			this._watching = value===undefined;

			this._value  = value;
			this._paths = {};
			if (this._watching) {
				this._object = parent.value();
				if (this._object) { addChainWatcher(this._object, this._key, this); }
			}

			// Special-case: the EachProxy relies on immediate evaluation to
			// establish its observers.
			//
			// TODO: Replace this with an efficient callback that the EachProxy
			// can implement.
			if (this._parent && this._parent._key === '@each') {
				this.value();
			}
		};

		var ChainNodePrototype = ChainNode.prototype;

		function lazyGet(obj, key) {
			if (!obj) return undefined;

			var meta = metaFor(obj, false);
			// check if object meant only to be a prototype
			if (meta.proto === obj) return undefined;

			if (key === "@each") return get(obj, key);

			// if a CP only return cached value
			var desc = meta.descs[key];
			if (desc && desc._cacheable) {
				if (key in meta.cache) {
					return meta.cache[key];
				} else {
					return undefined;
				}
			}

			return get(obj, key);
		}

		ChainNodePrototype.value = function() {
			if (this._value === undefined && this._watching) {
				var obj = this._parent.value();
				this._value = lazyGet(obj, this._key);
			}
			return this._value;
		};

		ChainNodePrototype.destroy = function() {
			if (this._watching) {
				var obj = this._object;
				if (obj) { removeChainWatcher(obj, this._key, this); }
				this._watching = false; // so future calls do nothing
			}
		};

// copies a top level object only
		ChainNodePrototype.copy = function(obj) {
			var ret = new ChainNode(null, null, obj),
				paths = this._paths, path;
			for (path in paths) {
				if (paths[path] <= 0) { continue; } // this check will also catch non-number vals.
				ret.add(path);
			}
			return ret;
		};

// called on the root node of a chain to setup watchers on the specified
// path.
		ChainNodePrototype.add = function(path) {
			var obj, tuple, key, src, paths;

			paths = this._paths;
			paths[path] = (paths[path] || 0) + 1;

			obj = this.value();
			tuple = normalizeTuple(obj, path);

			// the path was a local path
			if (tuple[0] && tuple[0] === obj) {
				path = tuple[1];
				key  = firstKey(path);
				path = path.slice(key.length+1);

				// global path, but object does not exist yet.
				// put into a queue and try to connect later.
			} else if (!tuple[0]) {
				pendingQueue.push([this, path]);
				tuple.length = 0;
				return;

				// global path, and object already exists
			} else {
				src  = tuple[0];
				key  = path.slice(0, 0-(tuple[1].length+1));
				path = tuple[1];
			}

			tuple.length = 0;
			this.chain(key, path, src);
		};

// called on the root node of a chain to teardown watcher on the specified
// path
		ChainNodePrototype.remove = function(path) {
			var obj, tuple, key, src, paths;

			paths = this._paths;
			if (paths[path] > 0) { paths[path]--; }

			obj = this.value();
			tuple = normalizeTuple(obj, path);
			if (tuple[0] === obj) {
				path = tuple[1];
				key  = firstKey(path);
				path = path.slice(key.length+1);
			} else {
				src  = tuple[0];
				key  = path.slice(0, 0-(tuple[1].length+1));
				path = tuple[1];
			}

			tuple.length = 0;
			this.unchain(key, path);
		};

		ChainNodePrototype.count = 0;

		ChainNodePrototype.chain = function(key, path, src) {
			var chains = this._chains, node;
			if (!chains) { chains = this._chains = {}; }

			node = chains[key];
			if (!node) { node = chains[key] = new ChainNode(this, key, src); }
			node.count++; // count chains...

			// chain rest of path if there is one
			if (path && path.length>0) {
				key = firstKey(path);
				path = path.slice(key.length+1);
				node.chain(key, path); // NOTE: no src means it will observe changes...
			}
		};

		ChainNodePrototype.unchain = function(key, path) {
			var chains = this._chains, node = chains[key];

			// unchain rest of path first...
			if (path && path.length>1) {
				key  = firstKey(path);
				path = path.slice(key.length+1);
				node.unchain(key, path);
			}

			// delete node if needed.
			node.count--;
			if (node.count<=0) {
				delete chains[node._key];
				node.destroy();
			}

		};

		ChainNodePrototype.willChange = function(events) {
			var chains = this._chains;
			if (chains) {
				for(var key in chains) {
					if (!chains.hasOwnProperty(key)) { continue; }
					chains[key].willChange(events);
				}
			}

			if (this._parent) { this._parent.chainWillChange(this, this._key, 1, events); }
		};

		ChainNodePrototype.chainWillChange = function(chain, path, depth, events) {
			if (this._key) { path = this._key + '.' + path; }

			if (this._parent) {
				this._parent.chainWillChange(this, path, depth+1, events);
			} else {
				if (depth > 1) {
					events.push(this.value(), path);
				}
				path = 'this.' + path;
				if (this._paths[path] > 0) {
					events.push(this.value(), path);
				}
			}
		};

		ChainNodePrototype.chainDidChange = function(chain, path, depth, events) {
			if (this._key) { path = this._key + '.' + path; }
			if (this._parent) {
				this._parent.chainDidChange(this, path, depth+1, events);
			} else {
				if (depth > 1) {
					events.push(this.value(), path);
				}
				path = 'this.' + path;
				if (this._paths[path] > 0) {
					events.push(this.value(), path);
				}
			}
		};

		ChainNodePrototype.didChange = function(events) {
			// invalidate my own value first.
			if (this._watching) {
				var obj = this._parent.value();
				if (obj !== this._object) {
					removeChainWatcher(this._object, this._key, this);
					this._object = obj;
					addChainWatcher(obj, this._key, this);
				}
				this._value  = undefined;

				// Special-case: the EachProxy relies on immediate evaluation to
				// establish its observers.
				if (this._parent && this._parent._key === '@each')
					this.value();
			}

			// then notify chains...
			var chains = this._chains;
			if (chains) {
				for(var key in chains) {
					if (!chains.hasOwnProperty(key)) { continue; }
					chains[key].didChange(events);
				}
			}

			// if no events are passed in then we only care about the above wiring update
			if (events === null) { return; }

			// and finally tell parent about my path changing...
			if (this._parent) { this._parent.chainDidChange(this, this._key, 1, events); }
		};

		Ember.finishChains = function(obj) {
			var m = metaFor(obj, false), chains = m.chains;
			if (chains) {
				if (chains.value() !== obj) {
					m.chains = chains = chains.copy(obj);
				}
				chains.didChange(null);
			}
		};

	})();



	(function() {
		var metaFor = Ember.meta, // utils.js
			typeOf = Ember.typeOf, // utils.js
			ChainNode = Ember._ChainNode; // chains.js

// get the chains for the current object. If the current object has
// chains inherited from the proto they will be cloned and reconfigured for
// the current object.
		function chainsFor(obj) {
			var m = metaFor(obj), ret = m.chains;
			if (!ret) {
				ret = m.chains = new ChainNode(null, null, obj);
			} else if (ret.value() !== obj) {
				ret = m.chains = ret.copy(obj);
			}
			return ret;
		}

		Ember.watchPath = function(obj, keyPath) {
			// can't watch length on Array - it is special...
			if (keyPath === 'length' && typeOf(obj) === 'array') { return; }

			var m = metaFor(obj), watching = m.watching;

			if (!watching[keyPath]) { // activate watching first time
				watching[keyPath] = 1;
				chainsFor(obj).add(keyPath);
			} else {
				watching[keyPath] = (watching[keyPath] || 0) + 1;
			}
		};

		Ember.unwatchPath = function(obj, keyPath) {
			var m = metaFor(obj), watching = m.watching;

			if (watching[keyPath] === 1) {
				watching[keyPath] = 0;
				chainsFor(obj).remove(keyPath);
			} else if (watching[keyPath] > 1) {
				watching[keyPath]--;
			}
		};
	})();



	(function() {
		/**
		 @module ember-metal
		 */

		var metaFor = Ember.meta, // utils.js
			GUID_KEY = Ember.GUID_KEY, // utils.js
			META_KEY = Ember.META_KEY, // utils.js
			removeChainWatcher = Ember.removeChainWatcher,
			watchKey = Ember.watchKey, // watch_key.js
			unwatchKey = Ember.unwatchKey,
			watchPath = Ember.watchPath, // watch_path.js
			unwatchPath = Ember.unwatchPath,
			typeOf = Ember.typeOf, // utils.js
			generateGuid = Ember.generateGuid,
			IS_PATH = /[\.\*]/;

// returns true if the passed path is just a keyName
		function isKeyName(path) {
			return path==='*' || !IS_PATH.test(path);
		}

		/**
		 @private

		 Starts watching a property on an object. Whenever the property changes,
		 invokes `Ember.propertyWillChange` and `Ember.propertyDidChange`. This is the
		 primitive used by observers and dependent keys; usually you will never call
		 this method directly but instead use higher level methods like
		 `Ember.addObserver()`

		 @method watch
		 @for Ember
		 @param obj
		 @param {String} keyName
		 */
		Ember.watch = function(obj, keyPath) {
			// can't watch length on Array - it is special...
			if (keyPath === 'length' && typeOf(obj) === 'array') { return; }

			if (isKeyName(keyPath)) {
				watchKey(obj, keyPath);
			} else {
				watchPath(obj, keyPath);
			}
		};

		Ember.isWatching = function isWatching(obj, key) {
			var meta = obj[META_KEY];
			return (meta && meta.watching[key]) > 0;
		};

		Ember.watch.flushPending = Ember.flushPendingChains;

		Ember.unwatch = function(obj, keyPath) {
			// can't watch length on Array - it is special...
			if (keyPath === 'length' && typeOf(obj) === 'array') { return; }

			if (isKeyName(keyPath)) {
				unwatchKey(obj, keyPath);
			} else {
				unwatchPath(obj, keyPath);
			}
		};

		/**
		 @private

		 Call on an object when you first beget it from another object. This will
		 setup any chained watchers on the object instance as needed. This method is
		 safe to call multiple times.

		 @method rewatch
		 @for Ember
		 @param obj
		 */
		Ember.rewatch = function(obj) {
			var m = metaFor(obj, false), chains = m.chains;

			// make sure the object has its own guid.
			if (GUID_KEY in obj && !obj.hasOwnProperty(GUID_KEY)) {
				generateGuid(obj, 'ember');
			}

			// make sure any chained watchers update.
			if (chains && chains.value() !== obj) {
				m.chains = chains.copy(obj);
			}
		};

		var NODE_STACK = [];

		/**
		 Tears down the meta on an object so that it can be garbage collected.
		 Multiple calls will have no effect.

		 @method destroy
		 @for Ember
		 @param {Object} obj  the object to destroy
		 @return {void}
		 */
		Ember.destroy = function (obj) {
			var meta = obj[META_KEY], node, nodes, key, nodeObject;
			if (meta) {
				obj[META_KEY] = null;
				// remove chainWatchers to remove circular references that would prevent GC
				node = meta.chains;
				if (node) {
					NODE_STACK.push(node);
					// process tree
					while (NODE_STACK.length > 0) {
						node = NODE_STACK.pop();
						// push children
						nodes = node._chains;
						if (nodes) {
							for (key in nodes) {
								if (nodes.hasOwnProperty(key)) {
									NODE_STACK.push(nodes[key]);
								}
							}
						}
						// remove chainWatcher in node object
						if (node._watching) {
							nodeObject = node._object;
							if (nodeObject) {
								removeChainWatcher(nodeObject, node._key, node);
							}
						}
					}
				}
			}
		};

	})();



	(function() {
		/**
		 @module ember-metal
		 */



		var get = Ember.get,
			set = Ember.set,
			metaFor = Ember.meta,
			a_slice = [].slice,
			o_create = Ember.create,
			META_KEY = Ember.META_KEY,
			watch = Ember.watch,
			unwatch = Ember.unwatch;

// ..........................................................
// DEPENDENT KEYS
//

// data structure:
//  meta.deps = {
//   'depKey': {
//     'keyName': count,
//   }
//  }

		/*
		 This function returns a map of unique dependencies for a
		 given object and key.
		 */
		function keysForDep(depsMeta, depKey) {
			var keys = depsMeta[depKey];
			if (!keys) {
				// if there are no dependencies yet for a the given key
				// create a new empty list of dependencies for the key
				keys = depsMeta[depKey] = {};
			} else if (!depsMeta.hasOwnProperty(depKey)) {
				// otherwise if the dependency list is inherited from
				// a superclass, clone the hash
				keys = depsMeta[depKey] = o_create(keys);
			}
			return keys;
		}

		function metaForDeps(meta) {
			return keysForDep(meta, 'deps');
		}

		function addDependentKeys(desc, obj, keyName, meta) {
			// the descriptor has a list of dependent keys, so
			// add all of its dependent keys.
			var depKeys = desc._dependentKeys, depsMeta, idx, len, depKey, keys;
			if (!depKeys) return;

			depsMeta = metaForDeps(meta);

			for(idx = 0, len = depKeys.length; idx < len; idx++) {
				depKey = depKeys[idx];
				// Lookup keys meta for depKey
				keys = keysForDep(depsMeta, depKey);
				// Increment the number of times depKey depends on keyName.
				keys[keyName] = (keys[keyName] || 0) + 1;
				// Watch the depKey
				watch(obj, depKey);
			}
		}

		function removeDependentKeys(desc, obj, keyName, meta) {
			// the descriptor has a list of dependent keys, so
			// add all of its dependent keys.
			var depKeys = desc._dependentKeys, depsMeta, idx, len, depKey, keys;
			if (!depKeys) return;

			depsMeta = metaForDeps(meta);

			for(idx = 0, len = depKeys.length; idx < len; idx++) {
				depKey = depKeys[idx];
				// Lookup keys meta for depKey
				keys = keysForDep(depsMeta, depKey);
				// Increment the number of times depKey depends on keyName.
				keys[keyName] = (keys[keyName] || 0) - 1;
				// Watch the depKey
				unwatch(obj, depKey);
			}
		}

// ..........................................................
// COMPUTED PROPERTY
//

		/**
		 A computed property transforms an objects function into a property.

		 By default the function backing the computed property will only be called
		 once and the result will be cached. You can specify various properties
		 that your computed property is dependent on. This will force the cached
		 result to be recomputed if the dependencies are modified.

		 In the following example we declare a computed property (by calling
		 `.property()` on the fullName function) and setup the properties
		 dependencies (depending on firstName and lastName). The fullName function
		 will be called once (regardless of how many times it is accessed) as long
		 as it's dependencies have not been changed. Once firstName or lastName are updated
		 any future calls (or anything bound) to fullName will incorporate the new
		 values.

		 ```javascript
		 Person = Ember.Object.extend({
    // these will be supplied by `create`
    firstName: null,
    lastName: null,

    fullName: function() {
      var firstName = this.get('firstName');
      var lastName = this.get('lastName');

     return firstName + ' ' + lastName;
    }.property('firstName', 'lastName')
  });

		 var tom = Person.create({
    firstName: "Tom",
    lastName: "Dale"
  });

		 tom.get('fullName') // "Tom Dale"
		 ```

		 You can also define what Ember should do when setting a computed property.
		 If you try to set a computed property, it will be invoked with the key and
		 value you want to set it to. You can also accept the previous value as the
		 third parameter.

		 ```javascript

		 Person = Ember.Object.extend({
    // these will be supplied by `create`
    firstName: null,
    lastName: null,

    fullName: function(key, value, oldValue) {
      // getter
      if (arguments.length === 1) {
        var firstName = this.get('firstName');
        var lastName = this.get('lastName');

        return firstName + ' ' + lastName;

      // setter
      } else {
        var name = value.split(" ");

        this.set('firstName', name[0]);
        this.set('lastName', name[1]);

        return value;
      }
    }.property('firstName', 'lastName')
  });

		 var person = Person.create();
		 person.set('fullName', "Peter Wagenet");
		 person.get('firstName') // Peter
		 person.get('lastName') // Wagenet
		 ```

		 @class ComputedProperty
		 @namespace Ember
		 @extends Ember.Descriptor
		 @constructor
		 */
		function ComputedProperty(func, opts) {
			this.func = func;

			this._cacheable = (opts && opts.cacheable !== undefined) ? opts.cacheable : true;
			this._dependentKeys = opts && opts.dependentKeys;
			this._readOnly = opts && (opts.readOnly !== undefined || !!opts.readOnly);
		}

		Ember.ComputedProperty = ComputedProperty;
		ComputedProperty.prototype = new Ember.Descriptor();

		var ComputedPropertyPrototype = ComputedProperty.prototype;

		/**
		 Properties are cacheable by default. Computed property will automatically
		 cache the return value of your function until one of the dependent keys changes.

		 Call `volatile()` to set it into non-cached mode. When in this mode
		 the computed property will not automatically cache the return value.

		 However, if a property is properly observable, there is no reason to disable
		 caching.

		 @method cacheable
		 @param {Boolean} aFlag optional set to `false` to disable caching
		 @return {Ember.ComputedProperty} this
		 @chainable
		 */
		ComputedPropertyPrototype.cacheable = function(aFlag) {
			this._cacheable = aFlag !== false;
			return this;
		};

		/**
		 Call on a computed property to set it into non-cached mode. When in this
		 mode the computed property will not automatically cache the return value.

		 ```javascript
		 MyApp.outsideService = Ember.Object.create({
    value: function() {
      return OutsideService.getValue();
    }.property().volatile()
  });
		 ```

		 @method volatile
		 @return {Ember.ComputedProperty} this
		 @chainable
		 */
		ComputedPropertyPrototype.volatile = function() {
			return this.cacheable(false);
		};

		/**
		 Call on a computed property to set it into read-only mode. When in this
		 mode the computed property will throw an error when set.

		 ```javascript
		 MyApp.person = Ember.Object.create({
    guid: function() {
      return 'guid-guid-guid';
    }.property().readOnly()
  });

		 MyApp.person.set('guid', 'new-guid'); // will throw an exception
		 ```

		 @method readOnly
		 @return {Ember.ComputedProperty} this
		 @chainable
		 */
		ComputedPropertyPrototype.readOnly = function(readOnly) {
			this._readOnly = readOnly === undefined || !!readOnly;
			return this;
		};

		/**
		 Sets the dependent keys on this computed property. Pass any number of
		 arguments containing key paths that this computed property depends on.

		 ```javascript
		 MyApp.president = Ember.Object.create({
    fullName: Ember.computed(function() {
      return this.get('firstName') + ' ' + this.get('lastName');

      // Tell Ember that this computed property depends on firstName
      // and lastName
    }).property('firstName', 'lastName')
  });
		 ```

		 @method property
		 @param {String} path* zero or more property paths
		 @return {Ember.ComputedProperty} this
		 @chainable
		 */
		ComputedPropertyPrototype.property = function() {
			var args = [];
			for (var i = 0, l = arguments.length; i < l; i++) {
				args.push(arguments[i]);
			}
			this._dependentKeys = args;
			return this;
		};

		/**
		 In some cases, you may want to annotate computed properties with additional
		 metadata about how they function or what values they operate on. For example,
		 computed property functions may close over variables that are then no longer
		 available for introspection.

		 You can pass a hash of these values to a computed property like this:

		 ```
		 person: function() {
    var personId = this.get('personId');
    return App.Person.create({ id: personId });
  }.property().meta({ type: App.Person })
		 ```

		 The hash that you pass to the `meta()` function will be saved on the
		 computed property descriptor under the `_meta` key. Ember runtime
		 exposes a public API for retrieving these values from classes,
		 via the `metaForProperty()` function.

		 @method meta
		 @param {Hash} meta
		 @chainable
		 */

		ComputedPropertyPrototype.meta = function(meta) {
			if (arguments.length === 0) {
				return this._meta || {};
			} else {
				this._meta = meta;
				return this;
			}
		};

		/* impl descriptor API */
		ComputedPropertyPrototype.didChange = function(obj, keyName) {
			// _suspended is set via a CP.set to ensure we don't clear
			// the cached value set by the setter
			if (this._cacheable && this._suspended !== obj) {
				var meta = metaFor(obj);
				if (keyName in meta.cache) {
					delete meta.cache[keyName];
					removeDependentKeys(this, obj, keyName, meta);
				}
			}
		};

		function finishChains(chainNodes)
		{
			for (var i=0, l=chainNodes.length; i<l; i++) {
				chainNodes[i].didChange(null);
			}
		}

		/**
		 Access the value of the function backing the computed property.
		 If this property has already been cached, return the cached result.
		 Otherwise, call the function passing the property name as an argument.

		 ```javascript
		 Person = Ember.Object.extend({
    fullName: function(keyName) {
      // the keyName parameter is 'fullName' in this case.

      return this.get('firstName') + ' ' + this.get('lastName');
    }.property('firstName', 'lastName')
  });


		 var tom = Person.create({
    firstName: "Tom",
    lastName: "Dale"
  });

		 tom.get('fullName') // "Tom Dale"
		 ```

		 @method get
		 @param {String} keyName The key being accessed.
		 @return {Object} The return value of the function backing the CP.
		 */
		ComputedPropertyPrototype.get = function(obj, keyName) {
			var ret, cache, meta, chainNodes;
			if (this._cacheable) {
				meta = metaFor(obj);
				cache = meta.cache;
				if (keyName in cache) { return cache[keyName]; }
				ret = cache[keyName] = this.func.call(obj, keyName);
				chainNodes = meta.chainWatchers && meta.chainWatchers[keyName];
				if (chainNodes) { finishChains(chainNodes); }
				addDependentKeys(this, obj, keyName, meta);
			} else {
				ret = this.func.call(obj, keyName);
			}
			return ret;
		};

		/**
		 Set the value of a computed property. If the function that backs your
		 computed property does not accept arguments then the default action for
		 setting would be to define the property on the current object, and set
		 the value of the property to the value being set.

		 Generally speaking if you intend for your computed property to be set
		 your backing function should accept either two or three arguments.

		 @method set
		 @param {String} keyName The key being accessed.
		 @param {Object} newValue The new value being assigned.
		 @param {String} oldValue The old value being replaced.
		 @return {Object} The return value of the function backing the CP.
		 */
		ComputedPropertyPrototype.set = function(obj, keyName, value) {
			var cacheable = this._cacheable,
				func = this.func,
				meta = metaFor(obj, cacheable),
				watched = meta.watching[keyName],
				oldSuspended = this._suspended,
				hadCachedValue = false,
				cache = meta.cache,
				funcArgLength, cachedValue, ret;

			if (this._readOnly) {
				throw new Error('Cannot Set: ' + keyName + ' on: ' + obj.toString() );
			}

			this._suspended = obj;

			try {

				if (cacheable && cache.hasOwnProperty(keyName)) {
					cachedValue = cache[keyName];
					hadCachedValue = true;
				}

				// Check if the CP has been wrapped. If if has, use the
				// length from the wrapped function.
				funcArgLength = (func.wrappedFunction ? func.wrappedFunction.length : func.length);

				// For backwards-compatibility with computed properties
				// that check for arguments.length === 2 to determine if
				// they are being get or set, only pass the old cached
				// value if the computed property opts into a third
				// argument.
				if (funcArgLength === 3) {
					ret = func.call(obj, keyName, value, cachedValue);
				} else if (funcArgLength === 2) {
					ret = func.call(obj, keyName, value);
				} else {
					Ember.defineProperty(obj, keyName, null, cachedValue);
					Ember.set(obj, keyName, value);
					return;
				}

				if (hadCachedValue && cachedValue === ret) { return; }

				if (watched) { Ember.propertyWillChange(obj, keyName); }

				if (hadCachedValue) {
					delete cache[keyName];
				}

				if (cacheable) {
					if (!hadCachedValue) {
						addDependentKeys(this, obj, keyName, meta);
					}
					cache[keyName] = ret;
				}

				if (watched) { Ember.propertyDidChange(obj, keyName); }
			} finally {
				this._suspended = oldSuspended;
			}
			return ret;
		};

		/* called before property is overridden */
		ComputedPropertyPrototype.teardown = function(obj, keyName) {
			var meta = metaFor(obj);

			if (keyName in meta.cache) {
				removeDependentKeys(this, obj, keyName, meta);
			}

			if (this._cacheable) { delete meta.cache[keyName]; }

			return null; // no value to restore
		};


		/**
		 This helper returns a new property descriptor that wraps the passed
		 computed property function. You can use this helper to define properties
		 with mixins or via `Ember.defineProperty()`.

		 The function you pass will be used to both get and set property values.
		 The function should accept two parameters, key and value. If value is not
		 undefined you should set the value first. In either case return the
		 current value of the property.
		 @method computed
		 @for Ember
		 @param {Function} func The computed property function.
		 @return {Ember.ComputedProperty} property descriptor instance
		 */
		Ember.computed = function(func) {
			var args;

			if (arguments.length > 1) {
				args = a_slice.call(arguments, 0, -1);
				func = a_slice.call(arguments, -1)[0];
			}

			if (typeof func !== "function") {
				throw new Error("Computed Property declared without a property function");
			}

			var cp = new ComputedProperty(func);

			if (args) {
				cp.property.apply(cp, args);
			}

			return cp;
		};

		/**
		 Returns the cached value for a property, if one exists.
		 This can be useful for peeking at the value of a computed
		 property that is generated lazily, without accidentally causing
		 it to be created.

		 @method cacheFor
		 @for Ember
		 @param {Object} obj the object whose property you want to check
		 @param {String} key the name of the property whose cached value you want
		 to return
		 @return {*} the cached value
		 */
		Ember.cacheFor = function cacheFor(obj, key) {
			var cache = metaFor(obj, false).cache;

			if (cache && key in cache) {
				return cache[key];
			}
		};

		function getProperties(self, propertyNames) {
			var ret = {};
			for(var i = 0; i < propertyNames.length; i++) {
				ret[propertyNames[i]] = get(self, propertyNames[i]);
			}
			return ret;
		}

		function registerComputed(name, macro) {
			Ember.computed[name] = function(dependentKey) {
				var args = a_slice.call(arguments);
				return Ember.computed(dependentKey, function() {
					return macro.apply(this, args);
				});
			};
		}

		function registerComputedWithProperties(name, macro) {
			Ember.computed[name] = function() {
				var properties = a_slice.call(arguments);

				var computed = Ember.computed(function() {
					return macro.apply(this, [getProperties(this, properties)]);
				});

				return computed.property.apply(computed, properties);
			};
		}

		/**
		 A computed property that returns true of the value of the dependent
		 property is null, an empty string, empty array, or empty function.

		 Note: When using `Ember.computed.empty` to watch an array make sure to
		 use the `array.length` syntax so the computed can subscribe to transitions
		 from empty to non-empty states.

		 Example

		 ```javascript
		 var ToDoList = Ember.Object.extend({
    done: Ember.computed.empty('todos.length')
  });
		 var todoList = ToDoList.create({todos: ['Unit Test', 'Documentation', 'Release']});
		 todoList.get('done'); // false
		 todoList.get('todos').clear(); // []
		 todoList.get('done'); // true
		 ```

		 @method computed.empty
		 @for Ember
		 @param {String} dependentKey
		 @return {Ember.ComputedProperty} computed property which negate
		 the original value for property
		 */
		registerComputed('empty', function(dependentKey) {
			return Ember.isEmpty(get(this, dependentKey));
		});

		/**
		 A computed property that returns true of the value of the dependent
		 property is NOT null, an empty string, empty array, or empty function.

		 Example

		 ```javascript
		 var Hampster = Ember.Object.extend({
    hasStuff: Ember.computed.notEmpty('backpack')
  });
		 var hampster = Hampster.create({backpack: ['Food', 'Sleeping Bag', 'Tent']});
		 hampster.get('hasStuff'); // true
		 hampster.get('backpack').clear(); // []
		 hampster.get('hasStuff'); // false
		 ```

		 @method computed.notEmpty
		 @for Ember
		 @param {String} dependentKey
		 @return {Ember.ComputedProperty} computed property which returns true if
		 original value for property is not empty.
		 */
		registerComputed('notEmpty', function(dependentKey) {
			return !Ember.isEmpty(get(this, dependentKey));
		});

		/**
		 A computed property that returns true of the value of the dependent
		 property is null or undefined. This avoids errors from JSLint complaining
		 about use of ==, which can be technically confusing.

		 Example

		 ```javascript
		 var Hampster = Ember.Object.extend({
    isHungry: Ember.computed.none('food')
  });
		 var hampster = Hampster.create();
		 hampster.get('isHungry'); // true
		 hampster.set('food', 'Banana');
		 hampster.get('isHungry'); // false
		 hampster.set('food', null);
		 hampster.get('isHungry'); // true
		 ```

		 @method computed.none
		 @for Ember
		 @param {String} dependentKey
		 @return {Ember.ComputedProperty} computed property which
		 returns true if original value for property is null or undefined.
		 */
		registerComputed('none', function(dependentKey) {
			return Ember.isNone(get(this, dependentKey));
		});

		/**
		 A computed property that returns the inverse boolean value
		 of the original value for the dependent property.

		 Example

		 ```javascript
		 var User = Ember.Object.extend({
    isAnonymous: Ember.computed.not('loggedIn')
  });
		 var user = User.create({loggedIn: false});
		 user.get('isAnonymous'); // false
		 user.set('loggedIn', true);
		 user.get('isAnonymous'); // true
		 ```

		 @method computed.not
		 @for Ember
		 @param {String} dependentKey
		 @return {Ember.ComputedProperty} computed property which returns
		 inverse of the original value for property
		 */
		registerComputed('not', function(dependentKey) {
			return !get(this, dependentKey);
		});

		/**
		 A computed property that converts the provided dependent property
		 into a boolean value.

		 ```javascript
		 var Hampster = Ember.Object.extend({
    hasBananas: Ember.computed.bool('numBananas')
  });
		 var hampster = Hampster.create();
		 hampster.get('hasBananas'); // false
		 hampster.set('numBananas', 0);
		 hampster.get('hasBananas'); // false
		 hampster.set('numBananas', 1);
		 hampster.get('hasBananas'); // true
		 hampster.set('numBananas', null);
		 hampster.get('hasBananas'); // false
		 ```

		 @method computed.bool
		 @for Ember
		 @param {String} dependentKey
		 @return {Ember.ComputedProperty} computed property which convert
		 to boolean the original value for property
		 */
		registerComputed('bool', function(dependentKey) {
			return !!get(this, dependentKey);
		});

		/**
		 A computed property which matches the original value for the
		 dependent property against a given RegExp, returning `true`
		 if they values matches the RegExp and `false` if it does not.

		 Example

		 ```javascript
		 var User = Ember.Object.extend({
    hasValidEmail: Ember.computed.match('email', /^.+@.+\..+$/)
		 });
		 var user = User.create({loggedIn: false});
		 user.get('hasValidEmail'); // false
		 user.set('email', '');
		 user.get('hasValidEmail'); // false
		 user.set('email', 'ember_hampster@example.com');
		 user.get('hasValidEmail'); // true
		 ```

		 @method computed.match
		 @for Ember
		 @param {String} dependentKey
		 @param {RegExp} regexp
		 @return {Ember.ComputedProperty} computed property which match
		 the original value for property against a given RegExp
		 */
		registerComputed('match', function(dependentKey, regexp) {
			var value = get(this, dependentKey);
			return typeof value === 'string' ? !!value.match(regexp) : false;
		});

		/**
		 A computed property that returns true if the provided dependent property
		 is equal to the given value.

		 Example

		 ```javascript
		 var Hampster = Ember.Object.extend({
    napTime: Ember.computed.equal('state', 'sleepy')
  });
		 var hampster = Hampster.create();
		 hampster.get('napTime'); // false
		 hampster.set('state', 'sleepy');
		 hampster.get('napTime'); // false
		 hampster.set('state', 'hungry');
		 hampster.get('napTime'); // false
		 ```

		 @method computed.equal
		 @for Ember
		 @param {String} dependentKey
		 @param {String|Number|Object} value
		 @return {Ember.ComputedProperty} computed property which returns true if
		 the original value for property is equal to the given value.
		 */
		registerComputed('equal', function(dependentKey, value) {
			return get(this, dependentKey) === value;
		});

		/**
		 A computed property that returns true if the provied dependent property
		 is greater than the provided value.

		 Example

		 ```javascript
		 var Hampster = Ember.Object.extend({
    hasTooManyBananas: Ember.computed.gt('numBananas', 10)
  });
		 var hampster = Hampster.create();
		 hampster.get('hasTooManyBananas'); // false
		 hampster.set('numBananas', 3);
		 hampster.get('hasTooManyBananas'); // false
		 hampster.set('numBananas', 11);
		 hampster.get('hasTooManyBananas'); // true
		 ```

		 @method computed.gt
		 @for Ember
		 @param {String} dependentKey
		 @param {Number} value
		 @return {Ember.ComputedProperty} computed property which returns true if
		 the original value for property is greater then given value.
		 */
		registerComputed('gt', function(dependentKey, value) {
			return get(this, dependentKey) > value;
		});

		/**
		 A computed property that returns true if the provided dependent property
		 is greater than or equal to the provided value.

		 Example

		 ```javascript
		 var Hampster = Ember.Object.extend({
    hasTooManyBananas: Ember.computed.gte('numBananas', 10)
  });
		 var hampster = Hampster.create();
		 hampster.get('hasTooManyBananas'); // false
		 hampster.set('numBananas', 3);
		 hampster.get('hasTooManyBananas'); // false
		 hampster.set('numBananas', 10);
		 hampster.get('hasTooManyBananas'); // true
		 ```

		 @method computed.gte
		 @for Ember
		 @param {String} dependentKey
		 @param {Number} value
		 @return {Ember.ComputedProperty} computed property which returns true if
		 the original value for property is greater or equal then given value.
		 */
		registerComputed('gte', function(dependentKey, value) {
			return get(this, dependentKey) >= value;
		});

		/**
		 A computed property that returns true if the provided dependent property
		 is less than the provided value.

		 Example

		 ```javascript
		 var Hampster = Ember.Object.extend({
    needsMoreBananas: Ember.computed.lt('numBananas', 3)
  });
		 var hampster = Hampster.create();
		 hampster.get('needsMoreBananas'); // true
		 hampster.set('numBananas', 3);
		 hampster.get('needsMoreBananas'); // false
		 hampster.set('numBananas', 2);
		 hampster.get('needsMoreBananas'); // true
		 ```

		 @method computed.lt
		 @for Ember
		 @param {String} dependentKey
		 @param {Number} value
		 @return {Ember.ComputedProperty} computed property which returns true if
		 the original value for property is less then given value.
		 */
		registerComputed('lt', function(dependentKey, value) {
			return get(this, dependentKey) < value;
		});

		/**
		 A computed property that returns true if the provided dependent property
		 is less than or equal to the provided value.

		 Example

		 ```javascript
		 var Hampster = Ember.Object.extend({
    needsMoreBananas: Ember.computed.lte('numBananas', 3)
  });
		 var hampster = Hampster.create();
		 hampster.get('needsMoreBananas'); // true
		 hampster.set('numBananas', 5);
		 hampster.get('needsMoreBananas'); // false
		 hampster.set('numBananas', 3);
		 hampster.get('needsMoreBananas'); // true
		 ```

		 @method computed.lte
		 @for Ember
		 @param {String} dependentKey
		 @param {Number} value
		 @return {Ember.ComputedProperty} computed property which returns true if
		 the original value for property is less or equal then given value.
		 */
		registerComputed('lte', function(dependentKey, value) {
			return get(this, dependentKey) <= value;
		});

		/**
		 A computed property that performs a logical `and` on the
		 original values for the provided dependent properties.


		 Example

		 ```javascript
		 var Hampster = Ember.Object.extend({
    readyForCamp: Ember.computed.and('hasTent', 'hasBackpack')
  });
		 var hampster = Hampster.create();
		 hampster.get('readyForCamp'); // false
		 hampster.set('hasTent', true);
		 hampster.get('readyForCamp'); // false
		 hampster.set('hasBackpack', true);
		 hampster.get('readyForCamp'); // true
		 ```

		 @method computed.and
		 @for Ember
		 @param {String} dependentKey, [dependentKey...]
		 @return {Ember.ComputedProperty} computed property which performs
		 a logical `and` on the values of all the original values for properties.
		 */
		registerComputedWithProperties('and', function(properties) {
			for (var key in properties) {
				if (properties.hasOwnProperty(key) && !properties[key]) {
					return false;
				}
			}
			return true;
		});

		/**
		 A computed property that which performs a logical `or` on the
		 original values for the provided dependent properties.

		 Example

		 ```javascript
		 var Hampster = Ember.Object.extend({
    readyForRain: Ember.computed.or('hasJacket', 'hasUmbrella')
  });
		 var hampster = Hampster.create();
		 hampster.get('readyForRain'); // false
		 hampster.set('hasJacket', true);
		 hampster.get('readyForRain'); // true
		 ```

		 @method computed.or
		 @for Ember
		 @param {String} dependentKey, [dependentKey...]
		 @return {Ember.ComputedProperty} computed property which performs
		 a logical `or` on the values of all the original values for properties.
		 */
		registerComputedWithProperties('or', function(properties) {
			for (var key in properties) {
				if (properties.hasOwnProperty(key) && properties[key]) {
					return true;
				}
			}
			return false;
		});

		/**
		 A computed property that returns the first truthy value
		 from a list of dependent properties.

		 Example

		 ```javascript
		 var Hampster = Ember.Object.extend({
    hasClothes: Ember.computed.any('hat', 'shirt')
  });
		 var hampster = Hampster.create();
		 hampster.get('hasClothes'); // null
		 hampster.set('shirt', 'Hawaiian Shirt');
		 hampster.get('hasClothes'); // 'Hawaiian Shirt'
		 ```

		 @method computed.any
		 @for Ember
		 @param {String} dependentKey, [dependentKey...]
		 @return {Ember.ComputedProperty} computed property which returns
		 the first truthy value of given list of properties.
		 */
		registerComputedWithProperties('any', function(properties) {
			for (var key in properties) {
				if (properties.hasOwnProperty(key) && properties[key]) {
					return properties[key];
				}
			}
			return null;
		});

		/**
		 A computed property that returns the array of values
		 for the provided dependent properties.

		 Example

		 ```javascript
		 var Hampster = Ember.Object.extend({
    clothes: Ember.computed.map('hat', 'shirt')
  });
		 var hampster = Hampster.create();
		 hampster.get('clothes'); // [null, null]
		 hampster.set('hat', 'Camp Hat');
		 hampster.set('shirt', 'Camp Shirt');
		 hampster.get('clothes'); // ['Camp Hat', 'Camp Shirt']
		 ```

		 @method computed.map
		 @for Ember
		 @param {String} dependentKey, [dependentKey...]
		 @return {Ember.ComputedProperty} computed property which maps
		 values of all passed properties in to an array.
		 */
		registerComputedWithProperties('collect', function(properties) {
			var res = [];
			for (var key in properties) {
				if (properties.hasOwnProperty(key)) {
					if (Ember.isNone(properties[key])) {
						res.push(null);
					} else {
						res.push(properties[key]);
					}
				}
			}
			return res;
		});

		/**
		 Creates a new property that is an alias for another property
		 on an object. Calls to `get` or `set` this property behave as
		 though they were called on the original property.

		 ```javascript
		 Person = Ember.Object.extend({
    name: 'Alex Matchneer',
    nomen: Ember.computed.alias('name')
  });

		 alex = Person.create();
		 alex.get('nomen'); // 'Alex Matchneer'
		 alex.get('name');  // 'Alex Matchneer'

		 alex.set('nomen', '@machty');
		 alex.get('name');  // '@machty'
		 ```
		 @method computed.alias
		 @for Ember
		 @param {String} dependentKey
		 @return {Ember.ComputedProperty} computed property which creates an
		 alias to the original value for property.
		 */
		Ember.computed.alias = function(dependentKey) {
			return Ember.computed(dependentKey, function(key, value) {
				if (arguments.length > 1) {
					set(this, dependentKey, value);
					return value;
				} else {
					return get(this, dependentKey);
				}
			});
		};

		/**
		 Where `computed.alias` aliases `get` and `set`, and allows for bidirectional
		 data flow, `computed.oneWay` only provides an aliased `get`. The `set` will
		 not mutate the upstream property, rather causes the current property to
		 become the value set. This causes the downstream property to permentantly
		 diverge from the upstream property.

		 Example

		 ```javascript
		 User = Ember.Object.extend({
    firstName: null,
    lastName: null,
    nickName: Ember.computed.oneWay('firstName')
  });

		 user = User.create({
    firstName: 'Teddy',
    lastName:  'Zeenny'
  });

		 user.get('nickName');
		 # 'Teddy'

		 user.set('nickName', 'TeddyBear');
		 # 'TeddyBear'

		 user.get('firstName');
		 # 'Teddy'
		 ```

		 @method computed.oneWay
		 @for Ember
		 @param {String} dependentKey
		 @return {Ember.ComputedProperty} computed property which creates an
		 one way computed property to the original value for property.
		 */
		Ember.computed.oneWay = function(dependentKey) {
			return Ember.computed(dependentKey, function() {
				return get(this, dependentKey);
			});
		};


		/**
		 A computed property that acts like a standard getter and setter,
		 but retruns the value at the provided `defaultPath` if the
		 property itself has not been set to a value

		 Example

		 ```javascript
		 var Hampster = Ember.Object.extend({
    wishList: Ember.computed.defaultTo('favoriteFood')
  });
		 var hampster = Hampster.create({favoriteFood: 'Banana'});
		 hampster.get('wishList'); // 'Banana'
		 hampster.set('wishList', 'More Unit Tests');
		 hampster.get('wishList'); // 'More Unit Tests'
		 hampster.get('favoriteFood'); // 'Banana'
		 ```

		 @method computed.defaultTo
		 @for Ember
		 @param {String} defaultPath
		 @return {Ember.ComputedProperty} computed property which acts like
		 a standard getter and setter, but defaults to the value from `defaultPath`.
		 */
		Ember.computed.defaultTo = function(defaultPath) {
			return Ember.computed(function(key, newValue, cachedValue) {
				if (arguments.length === 1) {
					return cachedValue != null ? cachedValue : get(this, defaultPath);
				}
				return newValue != null ? newValue : get(this, defaultPath);
			});
		};



	})();



	(function() {
// Ember.tryFinally
		/**
		 @module ember-metal
		 */

		var AFTER_OBSERVERS = ':change';
		var BEFORE_OBSERVERS = ':before';

		function changeEvent(keyName) {
			return keyName+AFTER_OBSERVERS;
		}

		function beforeEvent(keyName) {
			return keyName+BEFORE_OBSERVERS;
		}

		/**
		 @method addObserver
		 @param obj
		 @param {String} path
		 @param {Object|Function} targetOrMethod
		 @param {Function|String} [method]
		 */
		Ember.addObserver = function(obj, path, target, method) {
			Ember.addListener(obj, changeEvent(path), target, method);
			Ember.watch(obj, path);
			return this;
		};

		Ember.observersFor = function(obj, path) {
			return Ember.listenersFor(obj, changeEvent(path));
		};

		/**
		 @method removeObserver
		 @param obj
		 @param {String} path
		 @param {Object|Function} targetOrMethod
		 @param {Function|String} [method]
		 */
		Ember.removeObserver = function(obj, path, target, method) {
			Ember.unwatch(obj, path);
			Ember.removeListener(obj, changeEvent(path), target, method);
			return this;
		};

		/**
		 @method addBeforeObserver
		 @param obj
		 @param {String} path
		 @param {Object|Function} targetOrMethod
		 @param {Function|String} [method]
		 */
		Ember.addBeforeObserver = function(obj, path, target, method) {
			Ember.addListener(obj, beforeEvent(path), target, method);
			Ember.watch(obj, path);
			return this;
		};

// Suspend observer during callback.
//
// This should only be used by the target of the observer
// while it is setting the observed path.
		Ember._suspendBeforeObserver = function(obj, path, target, method, callback) {
			return Ember._suspendListener(obj, beforeEvent(path), target, method, callback);
		};

		Ember._suspendObserver = function(obj, path, target, method, callback) {
			return Ember._suspendListener(obj, changeEvent(path), target, method, callback);
		};

		var map = Ember.ArrayPolyfills.map;

		Ember._suspendBeforeObservers = function(obj, paths, target, method, callback) {
			var events = map.call(paths, beforeEvent);
			return Ember._suspendListeners(obj, events, target, method, callback);
		};

		Ember._suspendObservers = function(obj, paths, target, method, callback) {
			var events = map.call(paths, changeEvent);
			return Ember._suspendListeners(obj, events, target, method, callback);
		};

		Ember.beforeObserversFor = function(obj, path) {
			return Ember.listenersFor(obj, beforeEvent(path));
		};

		/**
		 @method removeBeforeObserver
		 @param obj
		 @param {String} path
		 @param {Object|Function} targetOrMethod
		 @param {Function|String} [method]
		 */
		Ember.removeBeforeObserver = function(obj, path, target, method) {
			Ember.unwatch(obj, path);
			Ember.removeListener(obj, beforeEvent(path), target, method);
			return this;
		};
	})();



	(function() {
		define("backburner/queue",
			["exports"],
			function(__exports__) {
				"use strict";
				function Queue(daq, name, options) {
					this.daq = daq;
					this.name = name;
					this.options = options;
					this._queue = [];
				}

				Queue.prototype = {
					daq: null,
					name: null,
					options: null,
					_queue: null,

					push: function(target, method, args, stack) {
						var queue = this._queue;
						queue.push(target, method, args, stack);
						return {queue: this, target: target, method: method};
					},

					pushUnique: function(target, method, args, stack) {
						var queue = this._queue, currentTarget, currentMethod, i, l;

						for (i = 0, l = queue.length; i < l; i += 4) {
							currentTarget = queue[i];
							currentMethod = queue[i+1];

							if (currentTarget === target && currentMethod === method) {
								queue[i+2] = args; // replace args
								queue[i+3] = stack; // replace stack
								return {queue: this, target: target, method: method}; // TODO: test this code path
							}
						}

						this._queue.push(target, method, args, stack);
						return {queue: this, target: target, method: method};
					},

					// TODO: remove me, only being used for Ember.run.sync
					flush: function() {
						var queue = this._queue,
							options = this.options,
							before = options && options.before,
							after = options && options.after,
							target, method, args, stack, i, l = queue.length;

						if (l && before) { before(); }
						for (i = 0; i < l; i += 4) {
							target = queue[i];
							method = queue[i+1];
							args   = queue[i+2];
							stack  = queue[i+3]; // Debugging assistance

							// TODO: error handling
							if (args && args.length > 0) {
								method.apply(target, args);
							} else {
								method.call(target);
							}
						}
						if (l && after) { after(); }

						// check if new items have been added
						if (queue.length > l) {
							this._queue = queue.slice(l);
							this.flush();
						} else {
							this._queue.length = 0;
						}
					},

					cancel: function(actionToCancel) {
						var queue = this._queue, currentTarget, currentMethod, i, l;

						for (i = 0, l = queue.length; i < l; i += 4) {
							currentTarget = queue[i];
							currentMethod = queue[i+1];

							if (currentTarget === actionToCancel.target && currentMethod === actionToCancel.method) {
								queue.splice(i, 4);
								return true;
							}
						}

						// if not found in current queue
						// could be in the queue that is being flushed
						queue = this._queueBeingFlushed;
						if (!queue) {
							return;
						}
						for (i = 0, l = queue.length; i < l; i += 4) {
							currentTarget = queue[i];
							currentMethod = queue[i+1];

							if (currentTarget === actionToCancel.target && currentMethod === actionToCancel.method) {
								// don't mess with array during flush
								// just nullify the method
								queue[i+1] = null;
								return true;
							}
						}
					}
				};


				__exports__.Queue = Queue;
			});

		define("backburner/deferred_action_queues",
			["backburner/queue","exports"],
			function(__dependency1__, __exports__) {
				"use strict";
				var Queue = __dependency1__.Queue;

				function DeferredActionQueues(queueNames, options) {
					var queues = this.queues = {};
					this.queueNames = queueNames = queueNames || [];

					var queueName;
					for (var i = 0, l = queueNames.length; i < l; i++) {
						queueName = queueNames[i];
						queues[queueName] = new Queue(this, queueName, options[queueName]);
					}
				}

				DeferredActionQueues.prototype = {
					queueNames: null,
					queues: null,

					schedule: function(queueName, target, method, args, onceFlag, stack) {
						var queues = this.queues,
							queue = queues[queueName];

						if (!queue) { throw new Error("You attempted to schedule an action in a queue (" + queueName + ") that doesn't exist"); }

						if (onceFlag) {
							return queue.pushUnique(target, method, args, stack);
						} else {
							return queue.push(target, method, args, stack);
						}
					},

					flush: function() {
						var queues = this.queues,
							queueNames = this.queueNames,
							queueName, queue, queueItems, priorQueueNameIndex,
							queueNameIndex = 0, numberOfQueues = queueNames.length;

						outerloop:
							while (queueNameIndex < numberOfQueues) {
								queueName = queueNames[queueNameIndex];
								queue = queues[queueName];
								queueItems = queue._queueBeingFlushed = queue._queue.slice();
								queue._queue = [];

								var options = queue.options,
									before = options && options.before,
									after = options && options.after,
									target, method, args, stack,
									queueIndex = 0, numberOfQueueItems = queueItems.length;

								if (numberOfQueueItems && before) { before(); }
								while (queueIndex < numberOfQueueItems) {
									target = queueItems[queueIndex];
									method = queueItems[queueIndex+1];
									args   = queueItems[queueIndex+2];
									stack  = queueItems[queueIndex+3]; // Debugging assistance

									if (typeof method === 'string') { method = target[method]; }

									// method could have been nullified / canceled during flush
									if (method) {
										// TODO: error handling
										if (args && args.length > 0) {
											method.apply(target, args);
										} else {
											method.call(target);
										}
									}

									queueIndex += 4;
								}
								queue._queueBeingFlushed = null;
								if (numberOfQueueItems && after) { after(); }

								if ((priorQueueNameIndex = indexOfPriorQueueWithActions(this, queueNameIndex)) !== -1) {
									queueNameIndex = priorQueueNameIndex;
									continue outerloop;
								}

								queueNameIndex++;
							}
					}
				};

				function indexOfPriorQueueWithActions(daq, currentQueueIndex) {
					var queueName, queue;

					for (var i = 0, l = currentQueueIndex; i <= l; i++) {
						queueName = daq.queueNames[i];
						queue = daq.queues[queueName];
						if (queue._queue.length) { return i; }
					}

					return -1;
				}


				__exports__.DeferredActionQueues = DeferredActionQueues;
			});

		define("backburner",
			["backburner/deferred_action_queues","exports"],
			function(__dependency1__, __exports__) {
				"use strict";
				var DeferredActionQueues = __dependency1__.DeferredActionQueues;

				var slice = [].slice,
					pop = [].pop,
					throttlers = [],
					debouncees = [],
					timers = [],
					autorun, laterTimer, laterTimerExpiresAt,
					global = this;

				function Backburner(queueNames, options) {
					this.queueNames = queueNames;
					this.options = options || {};
					if (!this.options.defaultQueue) {
						this.options.defaultQueue = queueNames[0];
					}
					this.instanceStack = [];
				}

				Backburner.prototype = {
					queueNames: null,
					options: null,
					currentInstance: null,
					instanceStack: null,

					begin: function() {
						var onBegin = this.options && this.options.onBegin,
							previousInstance = this.currentInstance;

						if (previousInstance) {
							this.instanceStack.push(previousInstance);
						}

						this.currentInstance = new DeferredActionQueues(this.queueNames, this.options);
						if (onBegin) {
							onBegin(this.currentInstance, previousInstance);
						}
					},

					end: function() {
						var onEnd = this.options && this.options.onEnd,
							currentInstance = this.currentInstance,
							nextInstance = null;

						try {
							currentInstance.flush();
						} finally {
							this.currentInstance = null;

							if (this.instanceStack.length) {
								nextInstance = this.instanceStack.pop();
								this.currentInstance = nextInstance;
							}

							if (onEnd) {
								onEnd(currentInstance, nextInstance);
							}
						}
					},

					run: function(target, method /*, args */) {
						var ret;
						this.begin();

						if (!method) {
							method = target;
							target = null;
						}

						if (typeof method === 'string') {
							method = target[method];
						}

						// Prevent Safari double-finally.
						var finallyAlreadyCalled = false;
						try {
							if (arguments.length > 2) {
								ret = method.apply(target, slice.call(arguments, 2));
							} else {
								ret = method.call(target);
							}
						} finally {
							if (!finallyAlreadyCalled) {
								finallyAlreadyCalled = true;
								this.end();
							}
						}
						return ret;
					},

					defer: function(queueName, target, method /* , args */) {
						if (!method) {
							method = target;
							target = null;
						}

						if (typeof method === 'string') {
							method = target[method];
						}

						var stack = this.DEBUG ? new Error().stack : undefined,
							args = arguments.length > 3 ? slice.call(arguments, 3) : undefined;
						if (!this.currentInstance) { createAutorun(this); }
						return this.currentInstance.schedule(queueName, target, method, args, false, stack);
					},

					deferOnce: function(queueName, target, method /* , args */) {
						if (!method) {
							method = target;
							target = null;
						}

						if (typeof method === 'string') {
							method = target[method];
						}

						var stack = this.DEBUG ? new Error().stack : undefined,
							args = arguments.length > 3 ? slice.call(arguments, 3) : undefined;
						if (!this.currentInstance) { createAutorun(this); }
						return this.currentInstance.schedule(queueName, target, method, args, true, stack);
					},

					setTimeout: function() {
						var self = this,
							wait = pop.call(arguments),
							target = arguments[0],
							method = arguments[1],
							executeAt = (+new Date()) + wait;

						if (!method) {
							method = target;
							target = null;
						}

						if (typeof method === 'string') {
							method = target[method];
						}

						var fn, args;
						if (arguments.length > 2) {
							args = slice.call(arguments, 2);

							fn = function() {
								method.apply(target, args);
							};
						} else {
							fn = function() {
								method.call(target);
							};
						}

						// find position to insert - TODO: binary search
						var i, l;
						for (i = 0, l = timers.length; i < l; i += 2) {
							if (executeAt < timers[i]) { break; }
						}

						timers.splice(i, 0, executeAt, fn);

						if (laterTimer && laterTimerExpiresAt < executeAt) { return fn; }

						if (laterTimer) {
							clearTimeout(laterTimer);
							laterTimer = null;
						}
						laterTimer = global.setTimeout(function() {
							executeTimers(self);
							laterTimer = null;
							laterTimerExpiresAt = null;
						}, wait);
						laterTimerExpiresAt = executeAt;

						return fn;
					},

					throttle: function(target, method /* , args, wait */) {
						var self = this,
							args = arguments,
							wait = pop.call(args),
							throttler;

						for (var i = 0, l = throttlers.length; i < l; i++) {
							throttler = throttlers[i];
							if (throttler[0] === target && throttler[1] === method) { return; } // do nothing
						}

						var timer = global.setTimeout(function() {
							self.run.apply(self, args);

							// remove throttler
							var index = -1;
							for (var i = 0, l = throttlers.length; i < l; i++) {
								throttler = throttlers[i];
								if (throttler[0] === target && throttler[1] === method) {
									index = i;
									break;
								}
							}

							if (index > -1) { throttlers.splice(index, 1); }
						}, wait);

						throttlers.push([target, method, timer]);
					},

					debounce: function(target, method /* , args, wait, [immediate] */) {
						var self = this,
							args = arguments,
							immediate = pop.call(args),
							wait,
							index,
							debouncee;

						if (typeof immediate === "number") {
							wait = immediate;
							immediate = false;
						} else {
							wait = pop.call(args);
						}

						// Remove debouncee
						index = findDebouncee(target, method);

						if (index !== -1) {
							debouncee = debouncees[index];
							debouncees.splice(index, 1);
							clearTimeout(debouncee[2]);
						}

						var timer = global.setTimeout(function() {
							if (!immediate) {
								self.run.apply(self, args);
							}
							index = findDebouncee(target, method);
							if (index) {
								debouncees.splice(index, 1);
							}
						}, wait);

						if (immediate && index === -1) {
							self.run.apply(self, args);
						}

						debouncees.push([target, method, timer]);
					},

					cancelTimers: function() {
						var i, len;

						for (i = 0, len = throttlers.length; i < len; i++) {
							clearTimeout(throttlers[i][2]);
						}
						throttlers = [];

						for (i = 0, len = debouncees.length; i < len; i++) {
							clearTimeout(debouncees[i][2]);
						}
						debouncees = [];

						if (laterTimer) {
							clearTimeout(laterTimer);
							laterTimer = null;
						}
						timers = [];

						if (autorun) {
							clearTimeout(autorun);
							autorun = null;
						}
					},

					hasTimers: function() {
						return !!timers.length || autorun;
					},

					cancel: function(timer) {
						if (timer && typeof timer === 'object' && timer.queue && timer.method) { // we're cancelling a deferOnce
							return timer.queue.cancel(timer);
						} else if (typeof timer === 'function') { // we're cancelling a setTimeout
							for (var i = 0, l = timers.length; i < l; i += 2) {
								if (timers[i + 1] === timer) {
									timers.splice(i, 2); // remove the two elements
									return true;
								}
							}
						} else {
							return; // timer was null or not a timer
						}
					}
				};

				Backburner.prototype.schedule = Backburner.prototype.defer;
				Backburner.prototype.scheduleOnce = Backburner.prototype.deferOnce;
				Backburner.prototype.later = Backburner.prototype.setTimeout;

				function createAutorun(backburner) {
					backburner.begin();
					autorun = global.setTimeout(function() {
						autorun = null;
						backburner.end();
					});
				}

				function executeTimers(self) {
					var now = +new Date(),
						time, fns, i, l;

					self.run(function() {
						// TODO: binary search
						for (i = 0, l = timers.length; i < l; i += 2) {
							time = timers[i];
							if (time > now) { break; }
						}

						fns = timers.splice(0, i);

						for (i = 1, l = fns.length; i < l; i += 2) {
							self.schedule(self.options.defaultQueue, null, fns[i]);
						}
					});

					if (timers.length) {
						laterTimer = global.setTimeout(function() {
							executeTimers(self);
							laterTimer = null;
							laterTimerExpiresAt = null;
						}, timers[0] - now);
						laterTimerExpiresAt = timers[0];
					}
				}

				function findDebouncee(target, method) {
					var debouncee,
						index = -1;

					for (var i = 0, l = debouncees.length; i < l; i++) {
						debouncee = debouncees[i];
						if (debouncee[0] === target && debouncee[1] === method) {
							index = i;
							break;
						}
					}

					return index;
				}


				__exports__.Backburner = Backburner;
			});
	})();



	(function() {
		var onBegin = function(current) {
			Ember.run.currentRunLoop = current;
		};

		var onEnd = function(current, next) {
			Ember.run.currentRunLoop = next;
		};

		var Backburner = requireModule('backburner').Backburner,
			backburner = new Backburner(['sync', 'actions', 'destroy'], {
				sync: {
					before: Ember.beginPropertyChanges,
					after: Ember.endPropertyChanges
				},
				defaultQueue: 'actions',
				onBegin: onBegin,
				onEnd: onEnd
			}),
			slice = [].slice;

// ..........................................................
// Ember.run - this is ideally the only public API the dev sees
//

		/**
		 Runs the passed target and method inside of a RunLoop, ensuring any
		 deferred actions including bindings and views updates are flushed at the
		 end.

		 Normally you should not need to invoke this method yourself. However if
		 you are implementing raw event handlers when interfacing with other
		 libraries or plugins, you should probably wrap all of your code inside this
		 call.

		 ```javascript
		 Ember.run(function() {
    // code to be execute within a RunLoop
  });
		 ```

		 @class run
		 @namespace Ember
		 @static
		 @constructor
		 @param {Object} [target] target of method to call
		 @param {Function|String} method Method to invoke.
		 May be a function or a string. If you pass a string
		 then it will be looked up on the passed target.
		 @param {Object} [args*] Any additional arguments you wish to pass to the method.
		 @return {Object} return value from invoking the passed function.
		 */
		Ember.run = function(target, method) {
			var ret;

			if (Ember.onerror) {
				try {
					ret = backburner.run.apply(backburner, arguments);
				} catch (e) {
					Ember.onerror(e);
				}
			} else {
				ret = backburner.run.apply(backburner, arguments);
			}

			return ret;
		};

		/**

		 If no run-loop is present, it creates a new one. If a run loop is
		 present it will queue itself to run on the existing run-loops action
		 queue.

		 Please note: This is not for normal usage, and should be used sparingly.

		 If invoked when not within a run loop:

		 ```javascript
		 Ember.run.join(function() {
    // creates a new run-loop
  });
		 ```

		 Alternatively, if called within an existing run loop:

		 ```javascript
		 Ember.run(function() {
    // creates a new run-loop
    Ember.run.join(function() {
      // joins with the existing run-loop, and queues for invocation on
      // the existing run-loops action queue.
    });
  });
		 ```

		 @method join
		 @namespace Ember
		 @param {Object} [target] target of method to call
		 @param {Function|String} method Method to invoke.
		 May be a function or a string. If you pass a string
		 then it will be looked up on the passed target.
		 @param {Object} [args*] Any additional arguments you wish to pass to the method.
		 @return {Object} return value from invoking the passed function. Please note,
		 when called within an existing loop, no return value is possible.
		 */
		Ember.run.join = function(target, method) {
			if (!Ember.run.currentRunLoop) {
				return Ember.run.apply(Ember.run, arguments);
			}

			var args = slice.call(arguments);
			args.unshift('actions');
			Ember.run.schedule.apply(Ember.run, args);
		};

		Ember.run.backburner = backburner;

		var run = Ember.run;

		Ember.run.currentRunLoop = null;

		Ember.run.queues = backburner.queueNames;

		/**
		 Begins a new RunLoop. Any deferred actions invoked after the begin will
		 be buffered until you invoke a matching call to `Ember.run.end()`. This is
		 a lower-level way to use a RunLoop instead of using `Ember.run()`.

		 ```javascript
		 Ember.run.begin();
		 // code to be execute within a RunLoop
		 Ember.run.end();
		 ```

		 @method begin
		 @return {void}
		 */
		Ember.run.begin = function() {
			backburner.begin();
		};

		/**
		 Ends a RunLoop. This must be called sometime after you call
		 `Ember.run.begin()` to flush any deferred actions. This is a lower-level way
		 to use a RunLoop instead of using `Ember.run()`.

		 ```javascript
		 Ember.run.begin();
		 // code to be execute within a RunLoop
		 Ember.run.end();
		 ```

		 @method end
		 @return {void}
		 */
		Ember.run.end = function() {
			backburner.end();
		};

		/**
		 Array of named queues. This array determines the order in which queues
		 are flushed at the end of the RunLoop. You can define your own queues by
		 simply adding the queue name to this array. Normally you should not need
		 to inspect or modify this property.

		 @property queues
		 @type Array
		 @default ['sync', 'actions', 'destroy']
		 */

		/**
		 Adds the passed target/method and any optional arguments to the named
		 queue to be executed at the end of the RunLoop. If you have not already
		 started a RunLoop when calling this method one will be started for you
		 automatically.

		 At the end of a RunLoop, any methods scheduled in this way will be invoked.
		 Methods will be invoked in an order matching the named queues defined in
		 the `Ember.run.queues` property.

		 ```javascript
		 Ember.run.schedule('sync', this, function() {
    // this will be executed in the first RunLoop queue, when bindings are synced
    console.log("scheduled on sync queue");
  });

		 Ember.run.schedule('actions', this, function() {
    // this will be executed in the 'actions' queue, after bindings have synced.
    console.log("scheduled on actions queue");
  });

		 // Note the functions will be run in order based on the run queues order. Output would be:
		 //   scheduled on sync queue
		 //   scheduled on actions queue
		 ```

		 @method schedule
		 @param {String} queue The name of the queue to schedule against.
		 Default queues are 'sync' and 'actions'
		 @param {Object} [target] target object to use as the context when invoking a method.
		 @param {String|Function} method The method to invoke. If you pass a string it
		 will be resolved on the target object at the time the scheduled item is
		 invoked allowing you to change the target function.
		 @param {Object} [arguments*] Optional arguments to be passed to the queued method.
		 @return {void}
		 */
		Ember.run.schedule = function(queue, target, method) {
			checkAutoRun();
			backburner.schedule.apply(backburner, arguments);
		};

// Used by global test teardown
		Ember.run.hasScheduledTimers = function() {
			return backburner.hasTimers();
		};

// Used by global test teardown
		Ember.run.cancelTimers = function () {
			backburner.cancelTimers();
		};

		/**
		 Immediately flushes any events scheduled in the 'sync' queue. Bindings
		 use this queue so this method is a useful way to immediately force all
		 bindings in the application to sync.

		 You should call this method anytime you need any changed state to propagate
		 throughout the app immediately without repainting the UI (which happens
		 in the later 'render' queue added by the `ember-views` package).

		 ```javascript
		 Ember.run.sync();
		 ```

		 @method sync
		 @return {void}
		 */
		Ember.run.sync = function() {
			if (backburner.currentInstance) {
				backburner.currentInstance.queues.sync.flush();
			}
		};

		/**
		 Invokes the passed target/method and optional arguments after a specified
		 period if time. The last parameter of this method must always be a number
		 of milliseconds.

		 You should use this method whenever you need to run some action after a
		 period of time instead of using `setTimeout()`. This method will ensure that
		 items that expire during the same script execution cycle all execute
		 together, which is often more efficient than using a real setTimeout.

		 ```javascript
		 Ember.run.later(myContext, function() {
    // code here will execute within a RunLoop in about 500ms with this == myContext
  }, 500);
		 ```

		 @method later
		 @param {Object} [target] target of method to invoke
		 @param {Function|String} method The method to invoke.
		 If you pass a string it will be resolved on the
		 target at the time the method is invoked.
		 @param {Object} [args*] Optional arguments to pass to the timeout.
		 @param {Number} wait Number of milliseconds to wait.
		 @return {String} a string you can use to cancel the timer in
		 `Ember.run.cancel` later.
		 */
		Ember.run.later = function(target, method) {
			return backburner.later.apply(backburner, arguments);
		};

		/**
		 Schedule a function to run one time during the current RunLoop. This is equivalent
		 to calling `scheduleOnce` with the "actions" queue.

		 @method once
		 @param {Object} [target] The target of the method to invoke.
		 @param {Function|String} method The method to invoke.
		 If you pass a string it will be resolved on the
		 target at the time the method is invoked.
		 @param {Object} [args*] Optional arguments to pass to the timeout.
		 @return {Object} timer
		 */
		Ember.run.once = function(target, method) {
			checkAutoRun();
			var args = slice.call(arguments);
			args.unshift('actions');
			return backburner.scheduleOnce.apply(backburner, args);
		};

		/**
		 Schedules a function to run one time in a given queue of the current RunLoop.
		 Calling this method with the same queue/target/method combination will have
		 no effect (past the initial call).

		 Note that although you can pass optional arguments these will not be
		 considered when looking for duplicates. New arguments will replace previous
		 calls.

		 ```javascript
		 Ember.run(function() {
    var sayHi = function() { console.log('hi'); }
    Ember.run.scheduleOnce('afterRender', myContext, sayHi);
    Ember.run.scheduleOnce('afterRender', myContext, sayHi);
    // sayHi will only be executed once, in the afterRender queue of the RunLoop
  });
		 ```

		 Also note that passing an anonymous function to `Ember.run.scheduleOnce` will
		 not prevent additional calls with an identical anonymous function from
		 scheduling the items multiple times, e.g.:

		 ```javascript
		 function scheduleIt() {
    Ember.run.scheduleOnce('actions', myContext, function() { console.log("Closure"); });
  }
		 scheduleIt();
		 scheduleIt();
		 // "Closure" will print twice, even though we're using `Ember.run.scheduleOnce`,
		 // because the function we pass to it is anonymous and won't match the
		 // previously scheduled operation.
		 ```

		 Available queues, and their order, can be found at `Ember.run.queues`

		 @method scheduleOnce
		 @param {String} [queue] The name of the queue to schedule against. Default queues are 'sync' and 'actions'.
		 @param {Object} [target] The target of the method to invoke.
		 @param {Function|String} method The method to invoke.
		 If you pass a string it will be resolved on the
		 target at the time the method is invoked.
		 @param {Object} [args*] Optional arguments to pass to the timeout.
		 @return {Object} timer
		 */
		Ember.run.scheduleOnce = function(queue, target, method) {
			checkAutoRun();
			return backburner.scheduleOnce.apply(backburner, arguments);
		};

		/**
		 Schedules an item to run from within a separate run loop, after
		 control has been returned to the system. This is equivalent to calling
		 `Ember.run.later` with a wait time of 1ms.

		 ```javascript
		 Ember.run.next(myContext, function() {
    // code to be executed in the next run loop, which will be scheduled after the current one
  });
		 ```

		 Multiple operations scheduled with `Ember.run.next` will coalesce
		 into the same later run loop, along with any other operations
		 scheduled by `Ember.run.later` that expire right around the same
		 time that `Ember.run.next` operations will fire.

		 Note that there are often alternatives to using `Ember.run.next`.
		 For instance, if you'd like to schedule an operation to happen
		 after all DOM element operations have completed within the current
		 run loop, you can make use of the `afterRender` run loop queue (added
		 by the `ember-views` package, along with the preceding `render` queue
		 where all the DOM element operations happen). Example:

		 ```javascript
		 App.MyCollectionView = Ember.CollectionView.extend({
    didInsertElement: function() {
      Ember.run.scheduleOnce('afterRender', this, 'processChildElements');
    },
    processChildElements: function() {
      // ... do something with collectionView's child view
      // elements after they've finished rendering, which
      // can't be done within the CollectionView's
      // `didInsertElement` hook because that gets run
      // before the child elements have been added to the DOM.
    }
  });
		 ```

		 One benefit of the above approach compared to using `Ember.run.next` is
		 that you will be able to perform DOM/CSS operations before unprocessed
		 elements are rendered to the screen, which may prevent flickering or
		 other artifacts caused by delaying processing until after rendering.

		 The other major benefit to the above approach is that `Ember.run.next`
		 introduces an element of non-determinism, which can make things much
		 harder to test, due to its reliance on `setTimeout`; it's much harder
		 to guarantee the order of scheduled operations when they are scheduled
		 outside of the current run loop, i.e. with `Ember.run.next`.

		 @method next
		 @param {Object} [target] target of method to invoke
		 @param {Function|String} method The method to invoke.
		 If you pass a string it will be resolved on the
		 target at the time the method is invoked.
		 @param {Object} [args*] Optional arguments to pass to the timeout.
		 @return {Object} timer
		 */
		Ember.run.next = function() {
			var args = slice.call(arguments);
			args.push(1);
			return backburner.later.apply(backburner, args);
		};

		/**
		 Cancels a scheduled item. Must be a value returned by `Ember.run.later()`,
		 `Ember.run.once()`, or `Ember.run.next()`.

		 ```javascript
		 var runNext = Ember.run.next(myContext, function() {
    // will not be executed
  });
		 Ember.run.cancel(runNext);

		 var runLater = Ember.run.later(myContext, function() {
    // will not be executed
  }, 500);
		 Ember.run.cancel(runLater);

		 var runOnce = Ember.run.once(myContext, function() {
    // will not be executed
  });
		 Ember.run.cancel(runOnce);
		 ```

		 @method cancel
		 @param {Object} timer Timer object to cancel
		 @return {void}
		 */
		Ember.run.cancel = function(timer) {
			return backburner.cancel(timer);
		};

		/**
		 Delay calling the target method until the debounce period has elapsed
		 with no additional debounce calls. If `debounce` is called again before
		 the specified time has elapsed, the timer is reset and the entire period
		 must pass again before the target method is called.

		 This method should be used when an event may be called multiple times
		 but the action should only be called once when the event is done firing.
		 A common example is for scroll events where you only want updates to
		 happen once scrolling has ceased.

		 ```javascript
		 var myFunc = function() { console.log(this.name + ' ran.'); };
		 var myContext = {name: 'debounce'};

		 Ember.run.debounce(myContext, myFunc, 150);

		 // less than 150ms passes

		 Ember.run.debounce(myContext, myFunc, 150);

		 // 150ms passes
		 // myFunc is invoked with context myContext
		 // console logs 'debounce ran.' one time.
		 ```

		 @method debounce
		 @param {Object} [target] target of method to invoke
		 @param {Function|String} method The method to invoke.
		 May be a function or a string. If you pass a string
		 then it will be looked up on the passed target.
		 @param {Object} [args*] Optional arguments to pass to the timeout.
		 @param {Number} wait Number of milliseconds to wait.
		 @param {Boolean} immediate Trigger the function on the leading instead of the trailing edge of the wait interval.
		 @return {void}
		 */
		Ember.run.debounce = function() {
			return backburner.debounce.apply(backburner, arguments);
		};

		/**
		 Ensure that the target method is never called more frequently than
		 the specified spacing period.

		 ```javascript
		 var myFunc = function() { console.log(this.name + ' ran.'); };
		 var myContext = {name: 'throttle'};

		 Ember.run.throttle(myContext, myFunc, 150);

		 // 50ms passes
		 Ember.run.throttle(myContext, myFunc, 150);

		 // 50ms passes
		 Ember.run.throttle(myContext, myFunc, 150);

		 // 50ms passes
		 Ember.run.throttle(myContext, myFunc, 150);

		 // 150ms passes
		 // myFunc is invoked with context myContext
		 // console logs 'throttle ran.' twice, 150ms apart.
		 ```

		 @method throttle
		 @param {Object} [target] target of method to invoke
		 @param {Function|String} method The method to invoke.
		 May be a function or a string. If you pass a string
		 then it will be looked up on the passed target.
		 @param {Object} [args*] Optional arguments to pass to the timeout.
		 @param {Number} spacing Number of milliseconds to space out requests.
		 @return {void}
		 */
		Ember.run.throttle = function() {
			return backburner.throttle.apply(backburner, arguments);
		};

// Make sure it's not an autorun during testing
		function checkAutoRun() {
			if (!Ember.run.currentRunLoop) {

			}
		}

	})();



	(function() {
// Ember.Logger
// get
// set
// guidFor, meta
// addObserver, removeObserver
// Ember.run.schedule
		/**
		 @module ember-metal
		 */

// ..........................................................
// CONSTANTS
//

		/**
		 Debug parameter you can turn on. This will log all bindings that fire to
		 the console. This should be disabled in production code. Note that you
		 can also enable this from the console or temporarily.

		 @property LOG_BINDINGS
		 @for Ember
		 @type Boolean
		 @default false
		 */
		Ember.LOG_BINDINGS = false || !!Ember.ENV.LOG_BINDINGS;

		var get     = Ember.get,
			set     = Ember.set,
			guidFor = Ember.guidFor,
			IS_GLOBAL = /^([A-Z$]|([0-9][A-Z$]))/;

		/**
		 Returns true if the provided path is global (e.g., `MyApp.fooController.bar`)
		 instead of local (`foo.bar.baz`).

		 @method isGlobalPath
		 @for Ember
		 @private
		 @param {String} path
		 @return Boolean
		 */
		var isGlobalPath = Ember.isGlobalPath = function(path) {
			return IS_GLOBAL.test(path);
		};

		function getWithGlobals(obj, path) {
			return get(isGlobalPath(path) ? Ember.lookup : obj, path);
		}

// ..........................................................
// BINDING
//

		var Binding = function(toPath, fromPath) {
			this._direction = 'fwd';
			this._from = fromPath;
			this._to   = toPath;
			this._directionMap = Ember.Map.create();
		};

		/**
		 @class Binding
		 @namespace Ember
		 */

		Binding.prototype = {
			/**
			 This copies the Binding so it can be connected to another object.

			 @method copy
			 @return {Ember.Binding} `this`
			 */
			copy: function () {
				var copy = new Binding(this._to, this._from);
				if (this._oneWay) { copy._oneWay = true; }
				return copy;
			},

			// ..........................................................
			// CONFIG
			//

			/**
			 This will set `from` property path to the specified value. It will not
			 attempt to resolve this property path to an actual object until you
			 connect the binding.

			 The binding will search for the property path starting at the root object
			 you pass when you `connect()` the binding. It follows the same rules as
			 `get()` - see that method for more information.

			 @method from
			 @param {String} path the property path to connect to
			 @return {Ember.Binding} `this`
			 */
			from: function(path) {
				this._from = path;
				return this;
			},

			/**
			 This will set the `to` property path to the specified value. It will not
			 attempt to resolve this property path to an actual object until you
			 connect the binding.

			 The binding will search for the property path starting at the root object
			 you pass when you `connect()` the binding. It follows the same rules as
			 `get()` - see that method for more information.

			 @method to
			 @param {String|Tuple} path A property path or tuple
			 @return {Ember.Binding} `this`
			 */
			to: function(path) {
				this._to = path;
				return this;
			},

			/**
			 Configures the binding as one way. A one-way binding will relay changes
			 on the `from` side to the `to` side, but not the other way around. This
			 means that if you change the `to` side directly, the `from` side may have
			 a different value.

			 @method oneWay
			 @return {Ember.Binding} `this`
			 */
			oneWay: function() {
				this._oneWay = true;
				return this;
			},

			/**
			 @method toString
			 @return {String} string representation of binding
			 */
			toString: function() {
				var oneWay = this._oneWay ? '[oneWay]' : '';
				return "Ember.Binding<" + guidFor(this) + ">(" + this._from + " -> " + this._to + ")" + oneWay;
			},

			// ..........................................................
			// CONNECT AND SYNC
			//

			/**
			 Attempts to connect this binding instance so that it can receive and relay
			 changes. This method will raise an exception if you have not set the
			 from/to properties yet.

			 @method connect
			 @param {Object} obj The root object for this binding.
			 @return {Ember.Binding} `this`
			 */
			connect: function(obj) {


				var fromPath = this._from, toPath = this._to;
				Ember.trySet(obj, toPath, getWithGlobals(obj, fromPath));

				// add an observer on the object to be notified when the binding should be updated
				Ember.addObserver(obj, fromPath, this, this.fromDidChange);

				// if the binding is a two-way binding, also set up an observer on the target
				if (!this._oneWay) { Ember.addObserver(obj, toPath, this, this.toDidChange); }

				this._readyToSync = true;

				return this;
			},

			/**
			 Disconnects the binding instance. Changes will no longer be relayed. You
			 will not usually need to call this method.

			 @method disconnect
			 @param {Object} obj The root object you passed when connecting the binding.
			 @return {Ember.Binding} `this`
			 */
			disconnect: function(obj) {


				var twoWay = !this._oneWay;

				// remove an observer on the object so we're no longer notified of
				// changes that should update bindings.
				Ember.removeObserver(obj, this._from, this, this.fromDidChange);

				// if the binding is two-way, remove the observer from the target as well
				if (twoWay) { Ember.removeObserver(obj, this._to, this, this.toDidChange); }

				this._readyToSync = false; // disable scheduled syncs...
				return this;
			},

			// ..........................................................
			// PRIVATE
			//

			/* called when the from side changes */
			fromDidChange: function(target) {
				this._scheduleSync(target, 'fwd');
			},

			/* called when the to side changes */
			toDidChange: function(target) {
				this._scheduleSync(target, 'back');
			},

			_scheduleSync: function(obj, dir) {
				var directionMap = this._directionMap;
				var existingDir = directionMap.get(obj);

				// if we haven't scheduled the binding yet, schedule it
				if (!existingDir) {
					Ember.run.schedule('sync', this, this._sync, obj);
					directionMap.set(obj, dir);
				}

				// If both a 'back' and 'fwd' sync have been scheduled on the same object,
				// default to a 'fwd' sync so that it remains deterministic.
				if (existingDir === 'back' && dir === 'fwd') {
					directionMap.set(obj, 'fwd');
				}
			},

			_sync: function(obj) {
				var log = Ember.LOG_BINDINGS;

				// don't synchronize destroyed objects or disconnected bindings
				if (obj.isDestroyed || !this._readyToSync) { return; }

				// get the direction of the binding for the object we are
				// synchronizing from
				var directionMap = this._directionMap;
				var direction = directionMap.get(obj);

				var fromPath = this._from, toPath = this._to;

				directionMap.remove(obj);

				// if we're synchronizing from the remote object...
				if (direction === 'fwd') {
					var fromValue = getWithGlobals(obj, this._from);
					if (log) {
						Ember.Logger.log(' ', this.toString(), '->', fromValue, obj);
					}
					if (this._oneWay) {
						Ember.trySet(obj, toPath, fromValue);
					} else {
						Ember._suspendObserver(obj, toPath, this, this.toDidChange, function () {
							Ember.trySet(obj, toPath, fromValue);
						});
					}
					// if we're synchronizing *to* the remote object
				} else if (direction === 'back') {
					var toValue = get(obj, this._to);
					if (log) {
						Ember.Logger.log(' ', this.toString(), '<-', toValue, obj);
					}
					Ember._suspendObserver(obj, fromPath, this, this.fromDidChange, function () {
						Ember.trySet(Ember.isGlobalPath(fromPath) ? Ember.lookup : obj, fromPath, toValue);
					});
				}
			}

		};

		function mixinProperties(to, from) {
			for (var key in from) {
				if (from.hasOwnProperty(key)) {
					to[key] = from[key];
				}
			}
		}

		mixinProperties(Binding, {

			/*
			 See `Ember.Binding.from`.

			 @method from
			 @static
			 */
			from: function() {
				var C = this, binding = new C();
				return binding.from.apply(binding, arguments);
			},

			/*
			 See `Ember.Binding.to`.

			 @method to
			 @static
			 */
			to: function() {
				var C = this, binding = new C();
				return binding.to.apply(binding, arguments);
			},

			/**
			 Creates a new Binding instance and makes it apply in a single direction.
			 A one-way binding will relay changes on the `from` side object (supplied
			 as the `from` argument) the `to` side, but not the other way around.
			 This means that if you change the "to" side directly, the "from" side may have
			 a different value.

			 See `Binding.oneWay`.

			 @method oneWay
			 @param {String} from from path.
			 @param {Boolean} [flag] (Optional) passing nothing here will make the
			 binding `oneWay`. You can instead pass `false` to disable `oneWay`, making the
			 binding two way again.
			 @return {Ember.Binding} `this`
			 */
			oneWay: function(from, flag) {
				var C = this, binding = new C(null, from);
				return binding.oneWay(flag);
			}

		});

		/**
		 An `Ember.Binding` connects the properties of two objects so that whenever
		 the value of one property changes, the other property will be changed also.

		 ## Automatic Creation of Bindings with `/^*Binding/`-named Properties

		 You do not usually create Binding objects directly but instead describe
		 bindings in your class or object definition using automatic binding
		 detection.

		 Properties ending in a `Binding` suffix will be converted to `Ember.Binding`
		 instances. The value of this property should be a string representing a path
		 to another object or a custom binding instanced created using Binding helpers
		 (see "One Way Bindings"):

		 ```
		 valueBinding: "MyApp.someController.title"
		 ```

		 This will create a binding from `MyApp.someController.title` to the `value`
		 property of your object instance automatically. Now the two values will be
		 kept in sync.

		 ## One Way Bindings

		 One especially useful binding customization you can use is the `oneWay()`
		 helper. This helper tells Ember that you are only interested in
		 receiving changes on the object you are binding from. For example, if you
		 are binding to a preference and you want to be notified if the preference
		 has changed, but your object will not be changing the preference itself, you
		 could do:

		 ```
		 bigTitlesBinding: Ember.Binding.oneWay("MyApp.preferencesController.bigTitles")
		 ```

		 This way if the value of `MyApp.preferencesController.bigTitles` changes the
		 `bigTitles` property of your object will change also. However, if you
		 change the value of your `bigTitles` property, it will not update the
		 `preferencesController`.

		 One way bindings are almost twice as fast to setup and twice as fast to
		 execute because the binding only has to worry about changes to one side.

		 You should consider using one way bindings anytime you have an object that
		 may be created frequently and you do not intend to change a property; only
		 to monitor it for changes (such as in the example above).

		 ## Adding Bindings Manually

		 All of the examples above show you how to configure a custom binding, but the
		 result of these customizations will be a binding template, not a fully active
		 Binding instance. The binding will actually become active only when you
		 instantiate the object the binding belongs to. It is useful however, to
		 understand what actually happens when the binding is activated.

		 For a binding to function it must have at least a `from` property and a `to`
		 property. The `from` property path points to the object/key that you want to
		 bind from while the `to` path points to the object/key you want to bind to.

		 When you define a custom binding, you are usually describing the property
		 you want to bind from (such as `MyApp.someController.value` in the examples
		 above). When your object is created, it will automatically assign the value
		 you want to bind `to` based on the name of your binding key. In the
		 examples above, during init, Ember objects will effectively call
		 something like this on your binding:

		 ```javascript
		 binding = Ember.Binding.from(this.valueBinding).to("value");
		 ```

		 This creates a new binding instance based on the template you provide, and
		 sets the to path to the `value` property of the new object. Now that the
		 binding is fully configured with a `from` and a `to`, it simply needs to be
		 connected to become active. This is done through the `connect()` method:

		 ```javascript
		 binding.connect(this);
		 ```

		 Note that when you connect a binding you pass the object you want it to be
		 connected to. This object will be used as the root for both the from and
		 to side of the binding when inspecting relative paths. This allows the
		 binding to be automatically inherited by subclassed objects as well.

		 Now that the binding is connected, it will observe both the from and to side
		 and relay changes.

		 If you ever needed to do so (you almost never will, but it is useful to
		 understand this anyway), you could manually create an active binding by
		 using the `Ember.bind()` helper method. (This is the same method used by
		 to setup your bindings on objects):

		 ```javascript
		 Ember.bind(MyApp.anotherObject, "value", "MyApp.someController.value");
		 ```

		 Both of these code fragments have the same effect as doing the most friendly
		 form of binding creation like so:

		 ```javascript
		 MyApp.anotherObject = Ember.Object.create({
    valueBinding: "MyApp.someController.value",

    // OTHER CODE FOR THIS OBJECT...
  });
		 ```

		 Ember's built in binding creation method makes it easy to automatically
		 create bindings for you. You should always use the highest-level APIs
		 available, even if you understand how it works underneath.

		 @class Binding
		 @namespace Ember
		 @since Ember 0.9
		 */
		Ember.Binding = Binding;


		/**
		 Global helper method to create a new binding. Just pass the root object
		 along with a `to` and `from` path to create and connect the binding.

		 @method bind
		 @for Ember
		 @param {Object} obj The root object of the transform.
		 @param {String} to The path to the 'to' side of the binding.
		 Must be relative to obj.
		 @param {String} from The path to the 'from' side of the binding.
		 Must be relative to obj or a global path.
		 @return {Ember.Binding} binding instance
		 */
		Ember.bind = function(obj, to, from) {
			return new Ember.Binding(to, from).connect(obj);
		};

		/**
		 @method oneWay
		 @for Ember
		 @param {Object} obj The root object of the transform.
		 @param {String} to The path to the 'to' side of the binding.
		 Must be relative to obj.
		 @param {String} from The path to the 'from' side of the binding.
		 Must be relative to obj or a global path.
		 @return {Ember.Binding} binding instance
		 */
		Ember.oneWay = function(obj, to, from) {
			return new Ember.Binding(to, from).oneWay().connect(obj);
		};

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-metal
		 */

		var Mixin, REQUIRED, Alias,
			a_map = Ember.ArrayPolyfills.map,
			a_indexOf = Ember.ArrayPolyfills.indexOf,
			a_forEach = Ember.ArrayPolyfills.forEach,
			a_slice = [].slice,
			o_create = Ember.create,
			defineProperty = Ember.defineProperty,
			guidFor = Ember.guidFor;

		function mixinsMeta(obj) {
			var m = Ember.meta(obj, true), ret = m.mixins;
			if (!ret) {
				ret = m.mixins = {};
			} else if (!m.hasOwnProperty('mixins')) {
				ret = m.mixins = o_create(ret);
			}
			return ret;
		}

		function initMixin(mixin, args) {
			if (args && args.length > 0) {
				mixin.mixins = a_map.call(args, function(x) {
					if (x instanceof Mixin) { return x; }

					// Note: Manually setup a primitive mixin here. This is the only
					// way to actually get a primitive mixin. This way normal creation
					// of mixins will give you combined mixins...
					var mixin = new Mixin();
					mixin.properties = x;
					return mixin;
				});
			}
			return mixin;
		}

		function isMethod(obj) {
			return 'function' === typeof obj &&
				obj.isMethod !== false &&
				obj !== Boolean && obj !== Object && obj !== Number && obj !== Array && obj !== Date && obj !== String;
		}

		var CONTINUE = {};

		function mixinProperties(mixinsMeta, mixin) {
			var guid;

			if (mixin instanceof Mixin) {
				guid = guidFor(mixin);
				if (mixinsMeta[guid]) { return CONTINUE; }
				mixinsMeta[guid] = mixin;
				return mixin.properties;
			} else {
				return mixin; // apply anonymous mixin properties
			}
		}

		function concatenatedMixinProperties(concatProp, props, values, base) {
			var concats;

			// reset before adding each new mixin to pickup concats from previous
			concats = values[concatProp] || base[concatProp];
			if (props[concatProp]) {
				concats = concats ? concats.concat(props[concatProp]) : props[concatProp];
			}

			return concats;
		}

		function giveDescriptorSuper(meta, key, property, values, descs) {
			var superProperty;

			// Computed properties override methods, and do not call super to them
			if (values[key] === undefined) {
				// Find the original descriptor in a parent mixin
				superProperty = descs[key];
			}

			// If we didn't find the original descriptor in a parent mixin, find
			// it on the original object.
			superProperty = superProperty || meta.descs[key];

			if (!superProperty || !(superProperty instanceof Ember.ComputedProperty)) {
				return property;
			}

			// Since multiple mixins may inherit from the same parent, we need
			// to clone the computed property so that other mixins do not receive
			// the wrapped version.
			property = o_create(property);
			property.func = Ember.wrap(property.func, superProperty.func);

			return property;
		}

		function giveMethodSuper(obj, key, method, values, descs) {
			var superMethod;

			// Methods overwrite computed properties, and do not call super to them.
			if (descs[key] === undefined) {
				// Find the original method in a parent mixin
				superMethod = values[key];
			}

			// If we didn't find the original value in a parent mixin, find it in
			// the original object
			superMethod = superMethod || obj[key];

			// Only wrap the new method if the original method was a function
			if ('function' !== typeof superMethod) {
				return method;
			}

			return Ember.wrap(method, superMethod);
		}

		function applyConcatenatedProperties(obj, key, value, values) {
			var baseValue = values[key] || obj[key];

			if (baseValue) {
				if ('function' === typeof baseValue.concat) {
					return baseValue.concat(value);
				} else {
					return Ember.makeArray(baseValue).concat(value);
				}
			} else {
				return Ember.makeArray(value);
			}
		}

		function applyMergedProperties(obj, key, value, values) {
			var baseValue = values[key] || obj[key];

			if (!baseValue) { return value; }

			var newBase = Ember.merge({}, baseValue);
			for (var prop in value) {
				if (!value.hasOwnProperty(prop)) { continue; }

				var propValue = value[prop];
				if (isMethod(propValue)) {
					// TODO: support for Computed Properties, etc?
					newBase[prop] = giveMethodSuper(obj, prop, propValue, baseValue, {});
				} else {
					newBase[prop] = propValue;
				}
			}

			return newBase;
		}

		function addNormalizedProperty(base, key, value, meta, descs, values, concats, mergings) {
			if (value instanceof Ember.Descriptor) {
				if (value === REQUIRED && descs[key]) { return CONTINUE; }

				// Wrap descriptor function to implement
				// _super() if needed
				if (value.func) {
					value = giveDescriptorSuper(meta, key, value, values, descs);
				}

				descs[key]  = value;
				values[key] = undefined;
			} else {
				// impl super if needed...
				if (isMethod(value)) {
					value = giveMethodSuper(base, key, value, values, descs);
				} else if ((concats && a_indexOf.call(concats, key) >= 0) ||
					key === 'concatenatedProperties' ||
					key === 'mergedProperties') {
					value = applyConcatenatedProperties(base, key, value, values);
				} else if ((mergings && a_indexOf.call(mergings, key) >= 0)) {
					value = applyMergedProperties(base, key, value, values);
				}

				descs[key] = undefined;
				values[key] = value;
			}
		}

		function mergeMixins(mixins, m, descs, values, base, keys) {
			var mixin, props, key, concats, mergings, meta;

			function removeKeys(keyName) {
				delete descs[keyName];
				delete values[keyName];
			}

			for(var i=0, l=mixins.length; i<l; i++) {
				mixin = mixins[i];


				props = mixinProperties(m, mixin);
				if (props === CONTINUE) { continue; }

				if (props) {
					meta = Ember.meta(base);
					if (base.willMergeMixin) { base.willMergeMixin(props); }
					concats = concatenatedMixinProperties('concatenatedProperties', props, values, base);
					mergings = concatenatedMixinProperties('mergedProperties', props, values, base);

					for (key in props) {
						if (!props.hasOwnProperty(key)) { continue; }
						keys.push(key);
						addNormalizedProperty(base, key, props[key], meta, descs, values, concats, mergings);
					}

					// manually copy toString() because some JS engines do not enumerate it
					if (props.hasOwnProperty('toString')) { base.toString = props.toString; }
				} else if (mixin.mixins) {
					mergeMixins(mixin.mixins, m, descs, values, base, keys);
					if (mixin._without) { a_forEach.call(mixin._without, removeKeys); }
				}
			}
		}

		var IS_BINDING = Ember.IS_BINDING = /^.+Binding$/;

		function detectBinding(obj, key, value, m) {
			if (IS_BINDING.test(key)) {
				var bindings = m.bindings;
				if (!bindings) {
					bindings = m.bindings = {};
				} else if (!m.hasOwnProperty('bindings')) {
					bindings = m.bindings = o_create(m.bindings);
				}
				bindings[key] = value;
			}
		}

		function connectBindings(obj, m) {
			// TODO Mixin.apply(instance) should disconnect binding if exists
			var bindings = m.bindings, key, binding, to;
			if (bindings) {
				for (key in bindings) {
					binding = bindings[key];
					if (binding) {
						to = key.slice(0, -7); // strip Binding off end
						if (binding instanceof Ember.Binding) {
							binding = binding.copy(); // copy prototypes' instance
							binding.to(to);
						} else { // binding is string path
							binding = new Ember.Binding(to, binding);
						}
						binding.connect(obj);
						obj[key] = binding;
					}
				}
				// mark as applied
				m.bindings = {};
			}
		}

		function finishPartial(obj, m) {
			connectBindings(obj, m || Ember.meta(obj));
			return obj;
		}

		function followAlias(obj, desc, m, descs, values) {
			var altKey = desc.methodName, value;
			if (descs[altKey] || values[altKey]) {
				value = values[altKey];
				desc  = descs[altKey];
			} else if (m.descs[altKey]) {
				desc  = m.descs[altKey];
				value = undefined;
			} else {
				desc = undefined;
				value = obj[altKey];
			}

			return { desc: desc, value: value };
		}

		function updateObserversAndListeners(obj, key, observerOrListener, pathsKey, updateMethod) {
			var paths = observerOrListener[pathsKey];

			if (paths) {
				for (var i=0, l=paths.length; i<l; i++) {
					Ember[updateMethod](obj, paths[i], null, key);
				}
			}
		}

		function replaceObserversAndListeners(obj, key, observerOrListener) {
			var prev = obj[key];

			if ('function' === typeof prev) {
				updateObserversAndListeners(obj, key, prev, '__ember_observesBefore__', 'removeBeforeObserver');
				updateObserversAndListeners(obj, key, prev, '__ember_observes__', 'removeObserver');
				updateObserversAndListeners(obj, key, prev, '__ember_listens__', 'removeListener');
			}

			if ('function' === typeof observerOrListener) {
				updateObserversAndListeners(obj, key, observerOrListener, '__ember_observesBefore__', 'addBeforeObserver');
				updateObserversAndListeners(obj, key, observerOrListener, '__ember_observes__', 'addObserver');
				updateObserversAndListeners(obj, key, observerOrListener, '__ember_listens__', 'addListener');
			}
		}

		function applyMixin(obj, mixins, partial) {
			var descs = {}, values = {}, m = Ember.meta(obj),
				key, value, desc, keys = [];

			// Go through all mixins and hashes passed in, and:
			//
			// * Handle concatenated properties
			// * Handle merged properties
			// * Set up _super wrapping if necessary
			// * Set up computed property descriptors
			// * Copying `toString` in broken browsers
			mergeMixins(mixins, mixinsMeta(obj), descs, values, obj, keys);

			for(var i = 0, l = keys.length; i < l; i++) {
				key = keys[i];
				if (key === 'constructor' || !values.hasOwnProperty(key)) { continue; }

				desc = descs[key];
				value = values[key];

				if (desc === REQUIRED) { continue; }

				while (desc && desc instanceof Alias) {
					var followed = followAlias(obj, desc, m, descs, values);
					desc = followed.desc;
					value = followed.value;
				}

				if (desc === undefined && value === undefined) { continue; }

				replaceObserversAndListeners(obj, key, value);
				detectBinding(obj, key, value, m);
				defineProperty(obj, key, desc, value, m);
			}

			if (!partial) { // don't apply to prototype
				finishPartial(obj, m);
			}

			return obj;
		}

		/**
		 @method mixin
		 @for Ember
		 @param obj
		 @param mixins*
		 @return obj
		 */
		Ember.mixin = function(obj) {
			var args = a_slice.call(arguments, 1);
			applyMixin(obj, args, false);
			return obj;
		};

		/**
		 The `Ember.Mixin` class allows you to create mixins, whose properties can be
		 added to other classes. For instance,

		 ```javascript
		 App.Editable = Ember.Mixin.create({
    edit: function() {
      console.log('starting to edit');
      this.set('isEditing', true);
    },
    isEditing: false
  });

		 // Mix mixins into classes by passing them as the first arguments to
		 // .extend.
		 App.CommentView = Ember.View.extend(App.Editable, {
    template: Ember.Handlebars.compile('{{#if view.isEditing}}...{{else}}...{{/if}}')
  });

		 commentView = App.CommentView.create();
		 commentView.edit(); // outputs 'starting to edit'
		 ```

		 Note that Mixins are created with `Ember.Mixin.create`, not
		 `Ember.Mixin.extend`.

		 Note that mixins extend a constructor's prototype so arrays and object literals
		 defined as properties will be shared amongst objects that implement the mixin.
		 If you want to define an property in a mixin that is not shared, you can define
		 it either as a computed property or have it be created on initialization of the object.

		 ```javascript
		 //filters array will be shared amongst any object implementing mixin
		 App.Filterable = Ember.Mixin.create({
    filters: Ember.A()
  });

		 //filters will be a separate  array for every object implementing the mixin
		 App.Filterable = Ember.Mixin.create({
    filters: Ember.computed(function(){return Ember.A();})
  });

		 //filters will be created as a separate array during the object's initialization
		 App.Filterable = Ember.Mixin.create({
    init: function() {
      this._super();
      this.set("filters", Ember.A());
    }
  });
		 ```

		 @class Mixin
		 @namespace Ember
		 */
		Ember.Mixin = function() { return initMixin(this, arguments); };

		Mixin = Ember.Mixin;

		Mixin.prototype = {
			properties: null,
			mixins: null,
			ownerConstructor: null
		};

		Mixin._apply = applyMixin;

		Mixin.applyPartial = function(obj) {
			var args = a_slice.call(arguments, 1);
			return applyMixin(obj, args, true);
		};

		Mixin.finishPartial = finishPartial;

		Ember.anyUnprocessedMixins = false;

		/**
		 @method create
		 @static
		 @param arguments*
		 */
		Mixin.create = function() {
			Ember.anyUnprocessedMixins = true;
			var M = this;
			return initMixin(new M(), arguments);
		};

		var MixinPrototype = Mixin.prototype;

		/**
		 @method reopen
		 @param arguments*
		 */
		MixinPrototype.reopen = function() {
			var mixin, tmp;

			if (this.properties) {
				mixin = Mixin.create();
				mixin.properties = this.properties;
				delete this.properties;
				this.mixins = [mixin];
			} else if (!this.mixins) {
				this.mixins = [];
			}

			var len = arguments.length, mixins = this.mixins, idx;

			for(idx=0; idx < len; idx++) {
				mixin = arguments[idx];


				if (mixin instanceof Mixin) {
					mixins.push(mixin);
				} else {
					tmp = Mixin.create();
					tmp.properties = mixin;
					mixins.push(tmp);
				}
			}

			return this;
		};

		/**
		 @method apply
		 @param obj
		 @return applied object
		 */
		MixinPrototype.apply = function(obj) {
			return applyMixin(obj, [this], false);
		};

		MixinPrototype.applyPartial = function(obj) {
			return applyMixin(obj, [this], true);
		};

		function _detect(curMixin, targetMixin, seen) {
			var guid = guidFor(curMixin);

			if (seen[guid]) { return false; }
			seen[guid] = true;

			if (curMixin === targetMixin) { return true; }
			var mixins = curMixin.mixins, loc = mixins ? mixins.length : 0;
			while (--loc >= 0) {
				if (_detect(mixins[loc], targetMixin, seen)) { return true; }
			}
			return false;
		}

		/**
		 @method detect
		 @param obj
		 @return {Boolean}
		 */
		MixinPrototype.detect = function(obj) {
			if (!obj) { return false; }
			if (obj instanceof Mixin) { return _detect(obj, this, {}); }
			var mixins = Ember.meta(obj, false).mixins;
			if (mixins) {
				return !!mixins[guidFor(this)];
			}
			return false;
		};

		MixinPrototype.without = function() {
			var ret = new Mixin(this);
			ret._without = a_slice.call(arguments);
			return ret;
		};

		function _keys(ret, mixin, seen) {
			if (seen[guidFor(mixin)]) { return; }
			seen[guidFor(mixin)] = true;

			if (mixin.properties) {
				var props = mixin.properties;
				for (var key in props) {
					if (props.hasOwnProperty(key)) { ret[key] = true; }
				}
			} else if (mixin.mixins) {
				a_forEach.call(mixin.mixins, function(x) { _keys(ret, x, seen); });
			}
		}

		MixinPrototype.keys = function() {
			var keys = {}, seen = {}, ret = [];
			_keys(keys, this, seen);
			for(var key in keys) {
				if (keys.hasOwnProperty(key)) { ret.push(key); }
			}
			return ret;
		};

// returns the mixins currently applied to the specified object
// TODO: Make Ember.mixin
		Mixin.mixins = function(obj) {
			var mixins = Ember.meta(obj, false).mixins, ret = [];

			if (!mixins) { return ret; }

			for (var key in mixins) {
				var mixin = mixins[key];

				// skip primitive mixins since these are always anonymous
				if (!mixin.properties) { ret.push(mixin); }
			}

			return ret;
		};

		REQUIRED = new Ember.Descriptor();
		REQUIRED.toString = function() { return '(Required Property)'; };

		/**
		 Denotes a required property for a mixin

		 @method required
		 @for Ember
		 */
		Ember.required = function() {
			return REQUIRED;
		};

		Alias = function(methodName) {
			this.methodName = methodName;
		};
		Alias.prototype = new Ember.Descriptor();

		/**
		 Makes a property or method available via an additional name.

		 ```javascript
		 App.PaintSample = Ember.Object.extend({
    color: 'red',
    colour: Ember.alias('color'),
    name: function() {
      return "Zed";
    },
    moniker: Ember.alias("name")
  });

		 var paintSample = App.PaintSample.create()
		 paintSample.get('colour');  // 'red'
		 paintSample.moniker();      // 'Zed'
		 ```

		 @method alias
		 @for Ember
		 @param {String} methodName name of the method or property to alias
		 @return {Ember.Descriptor}
		 @deprecated Use `Ember.aliasMethod` or `Ember.computed.alias` instead
		 */
		Ember.alias = function(methodName) {
			return new Alias(methodName);
		};

		Ember.alias = Ember.deprecateFunc("Ember.alias is deprecated. Please use Ember.aliasMethod or Ember.computed.alias instead.", Ember.alias);

		/**
		 Makes a method available via an additional name.

		 ```javascript
		 App.Person = Ember.Object.extend({
    name: function() {
      return 'Tomhuda Katzdale';
    },
    moniker: Ember.aliasMethod('name')
  });

		 var goodGuy = App.Person.create()
		 ```

		 @method aliasMethod
		 @for Ember
		 @param {String} methodName name of the method to alias
		 @return {Ember.Descriptor}
		 */
		Ember.aliasMethod = function(methodName) {
			return new Alias(methodName);
		};

// ..........................................................
// OBSERVER HELPER
//

		/**
		 Specify a method that observes property changes.

		 ```javascript
		 Ember.Object.extend({
    valueObserver: Ember.observer(function() {
      // Executes whenever the "value" property changes
    }, 'value')
  });
		 ```

		 In the future this method may become asynchronous. If you want to ensure
		 synchronous behavior, use `immediateObserver`.

		 Also available as `Function.prototype.observes` if prototype extensions are
		 enabled.

		 @method observer
		 @for Ember
		 @param {Function} func
		 @param {String} propertyNames*
		 @return func
		 */
		Ember.observer = function(func) {
			var paths = a_slice.call(arguments, 1);
			func.__ember_observes__ = paths;
			return func;
		};

		/**
		 Specify a method that observes property changes.

		 ```javascript
		 Ember.Object.extend({
    valueObserver: Ember.immediateObserver(function() {
      // Executes whenever the "value" property changes
    }, 'value')
  });
		 ```

		 In the future, `Ember.observer` may become asynchronous. In this event,
		 `Ember.immediateObserver` will maintain the synchronous behavior.

		 Also available as `Function.prototype.observesImmediately` if prototype extensions are
		 enabled.

		 @method immediateObserver
		 @for Ember
		 @param {Function} func
		 @param {String} propertyNames*
		 @return func
		 */
		Ember.immediateObserver = function() {
			for (var i=0, l=arguments.length; i<l; i++) {
				var arg = arguments[i];

			}

			return Ember.observer.apply(this, arguments);
		};

		/**
		 When observers fire, they are called with the arguments `obj`, `keyName`.

		 Note, `@each.property` observer is called per each add or replace of an element
		 and it's not called with a specific enumeration item.

		 A `beforeObserver` fires before a property changes.

		 A `beforeObserver` is an alternative form of `.observesBefore()`.

		 ```javascript
		 App.PersonView = Ember.View.extend({

    friends: [{ name: 'Tom' }, { name: 'Stefan' }, { name: 'Kris' }],

    valueWillChange: Ember.beforeObserver(function(obj, keyName) {
      this.changingFrom = obj.get(keyName);
    }, 'content.value'),

    valueDidChange: Ember.observer(function(obj, keyName) {
        // only run if updating a value already in the DOM
        if (this.get('state') === 'inDOM') {
          var color = obj.get(keyName) > this.changingFrom ? 'green' : 'red';
          // logic
        }
    }, 'content.value'),

    friendsDidChange: Ember.observer(function(obj, keyName) {
      // some logic
      // obj.get(keyName) returns friends array
    }, 'friends.@each.name')
		 });
		 ```

		 Also available as `Function.prototype.observesBefore` if prototype extensions are
		 enabled.

		 @method beforeObserver
		 @for Ember
		 @param {Function} func
		 @param {String} propertyNames*
		 @return func
		 */
		Ember.beforeObserver = function(func) {
			var paths = a_slice.call(arguments, 1);
			func.__ember_observesBefore__ = paths;
			return func;
		};

	})();



	(function() {
		/**
		 Ember Metal

		 @module ember
		 @submodule ember-metal
		 */

	})();

	(function() {
		define("rsvp/all",
			["rsvp/promise","exports"],
			function(__dependency1__, __exports__) {
				"use strict";
				var Promise = __dependency1__.Promise;
				/* global toString */


				function all(promises) {
					if (Object.prototype.toString.call(promises) !== "[object Array]") {
						throw new TypeError('You must pass an array to all.');
					}

					return new Promise(function(resolve, reject) {
						var results = [], remaining = promises.length,
							promise;

						if (remaining === 0) {
							resolve([]);
						}

						function resolver(index) {
							return function(value) {
								resolveAll(index, value);
							};
						}

						function resolveAll(index, value) {
							results[index] = value;
							if (--remaining === 0) {
								resolve(results);
							}
						}

						for (var i = 0; i < promises.length; i++) {
							promise = promises[i];

							if (promise && typeof promise.then === 'function') {
								promise.then(resolver(i), reject);
							} else {
								resolveAll(i, promise);
							}
						}
					});
				}


				__exports__.all = all;
			});
		define("rsvp/async",
			["exports"],
			function(__exports__) {
				"use strict";
				var browserGlobal = (typeof window !== 'undefined') ? window : {};
				var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
				var async;
				var local = (typeof global !== 'undefined') ? global : this;

				// old node
				function useNextTick() {
					return function(callback, arg) {
						process.nextTick(function() {
							callback(arg);
						});
					};
				}

				// node >= 0.10.x
				function useSetImmediate() {
					return function(callback, arg) {
						/* global  setImmediate */
						setImmediate(function(){
							callback(arg);
						});
					};
				}

				function useMutationObserver() {
					var queue = [];

					var observer = new BrowserMutationObserver(function() {
						var toProcess = queue.slice();
						queue = [];

						toProcess.forEach(function(tuple) {
							var callback = tuple[0], arg= tuple[1];
							callback(arg);
						});
					});

					var element = document.createElement('div');
					observer.observe(element, { attributes: true });

					// Chrome Memory Leak: https://bugs.webkit.org/show_bug.cgi?id=93661
					window.addEventListener('unload', function(){
						observer.disconnect();
						observer = null;
					}, false);

					return function(callback, arg) {
						queue.push([callback, arg]);
						element.setAttribute('drainQueue', 'drainQueue');
					};
				}

				function useSetTimeout() {
					return function(callback, arg) {
						local.setTimeout(function() {
							callback(arg);
						}, 1);
					};
				}

				if (typeof setImmediate === 'function') {
					async = useSetImmediate();
				} else if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
					async = useNextTick();
				} else if (BrowserMutationObserver) {
					async = useMutationObserver();
				} else {
					async = useSetTimeout();
				}


				__exports__.async = async;
			});
		define("rsvp/config",
			["rsvp/async","exports"],
			function(__dependency1__, __exports__) {
				"use strict";
				var async = __dependency1__.async;

				var config = {};
				config.async = async;


				__exports__.config = config;
			});
		define("rsvp/defer",
			["rsvp/promise","exports"],
			function(__dependency1__, __exports__) {
				"use strict";
				var Promise = __dependency1__.Promise;

				function defer() {
					var deferred = {
						// pre-allocate shape
						resolve: undefined,
						reject:  undefined,
						promise: undefined
					};

					deferred.promise = new Promise(function(resolve, reject) {
						deferred.resolve = resolve;
						deferred.reject = reject;
					});

					return deferred;
				}


				__exports__.defer = defer;
			});
		define("rsvp/events",
			["exports"],
			function(__exports__) {
				"use strict";
				var Event = function(type, options) {
					this.type = type;

					for (var option in options) {
						if (!options.hasOwnProperty(option)) { continue; }

						this[option] = options[option];
					}
				};

				var indexOf = function(callbacks, callback) {
					for (var i=0, l=callbacks.length; i<l; i++) {
						if (callbacks[i][0] === callback) { return i; }
					}

					return -1;
				};

				var callbacksFor = function(object) {
					var callbacks = object._promiseCallbacks;

					if (!callbacks) {
						callbacks = object._promiseCallbacks = {};
					}

					return callbacks;
				};

				var EventTarget = {
					mixin: function(object) {
						object.on = this.on;
						object.off = this.off;
						object.trigger = this.trigger;
						return object;
					},

					on: function(eventNames, callback, binding) {
						var allCallbacks = callbacksFor(this), callbacks, eventName;
						eventNames = eventNames.split(/\s+/);
						binding = binding || this;

						while (eventName = eventNames.shift()) {
							callbacks = allCallbacks[eventName];

							if (!callbacks) {
								callbacks = allCallbacks[eventName] = [];
							}

							if (indexOf(callbacks, callback) === -1) {
								callbacks.push([callback, binding]);
							}
						}
					},

					off: function(eventNames, callback) {
						var allCallbacks = callbacksFor(this), callbacks, eventName, index;
						eventNames = eventNames.split(/\s+/);

						while (eventName = eventNames.shift()) {
							if (!callback) {
								allCallbacks[eventName] = [];
								continue;
							}

							callbacks = allCallbacks[eventName];

							index = indexOf(callbacks, callback);

							if (index !== -1) { callbacks.splice(index, 1); }
						}
					},

					trigger: function(eventName, options) {
						var allCallbacks = callbacksFor(this),
							callbacks, callbackTuple, callback, binding, event;

						if (callbacks = allCallbacks[eventName]) {
							// Don't cache the callbacks.length since it may grow
							for (var i=0; i<callbacks.length; i++) {
								callbackTuple = callbacks[i];
								callback = callbackTuple[0];
								binding = callbackTuple[1];

								if (typeof options !== 'object') {
									options = { detail: options };
								}

								event = new Event(eventName, options);
								callback.call(binding, event);
							}
						}
					}
				};


				__exports__.EventTarget = EventTarget;
			});
		define("rsvp/hash",
			["rsvp/defer","exports"],
			function(__dependency1__, __exports__) {
				"use strict";
				var defer = __dependency1__.defer;

				function size(object) {
					var s = 0;

					for (var prop in object) {
						s++;
					}

					return s;
				}

				function hash(promises) {
					var results = {}, deferred = defer(), remaining = size(promises);

					if (remaining === 0) {
						deferred.resolve({});
					}

					var resolver = function(prop) {
						return function(value) {
							resolveAll(prop, value);
						};
					};

					var resolveAll = function(prop, value) {
						results[prop] = value;
						if (--remaining === 0) {
							deferred.resolve(results);
						}
					};

					var rejectAll = function(error) {
						deferred.reject(error);
					};

					for (var prop in promises) {
						if (promises[prop] && typeof promises[prop].then === 'function') {
							promises[prop].then(resolver(prop), rejectAll);
						} else {
							resolveAll(prop, promises[prop]);
						}
					}

					return deferred.promise;
				}


				__exports__.hash = hash;
			});
		define("rsvp/node",
			["rsvp/promise","rsvp/all","exports"],
			function(__dependency1__, __dependency2__, __exports__) {
				"use strict";
				var Promise = __dependency1__.Promise;
				var all = __dependency2__.all;

				function makeNodeCallbackFor(resolve, reject) {
					return function (error, value) {
						if (error) {
							reject(error);
						} else if (arguments.length > 2) {
							resolve(Array.prototype.slice.call(arguments, 1));
						} else {
							resolve(value);
						}
					};
				}

				function denodeify(nodeFunc) {
					return function()  {
						var nodeArgs = Array.prototype.slice.call(arguments), resolve, reject;
						var thisArg = this;

						var promise = new Promise(function(nodeResolve, nodeReject) {
							resolve = nodeResolve;
							reject = nodeReject;
						});

						all(nodeArgs).then(function(nodeArgs) {
							nodeArgs.push(makeNodeCallbackFor(resolve, reject));

							try {
								nodeFunc.apply(thisArg, nodeArgs);
							} catch(e) {
								reject(e);
							}
						});

						return promise;
					};
				}


				__exports__.denodeify = denodeify;
			});
		define("rsvp/promise",
			["rsvp/config","rsvp/events","exports"],
			function(__dependency1__, __dependency2__, __exports__) {
				"use strict";
				var config = __dependency1__.config;
				var EventTarget = __dependency2__.EventTarget;

				function objectOrFunction(x) {
					return isFunction(x) || (typeof x === "object" && x !== null);
				}

				function isFunction(x){
					return typeof x === "function";
				}

				var Promise = function(resolver) {
					var promise = this,
						resolved = false;

					if (typeof resolver !== 'function') {
						throw new TypeError('You must pass a resolver function as the sole argument to the promise constructor');
					}

					if (!(promise instanceof Promise)) {
						return new Promise(resolver);
					}

					var resolvePromise = function(value) {
						if (resolved) { return; }
						resolved = true;
						resolve(promise, value);
					};

					var rejectPromise = function(value) {
						if (resolved) { return; }
						resolved = true;
						reject(promise, value);
					};

					this.on('promise:resolved', function(event) {
						this.trigger('success', { detail: event.detail });
					}, this);

					this.on('promise:failed', function(event) {
						this.trigger('error', { detail: event.detail });
					}, this);

					this.on('error', onerror);

					try {
						resolver(resolvePromise, rejectPromise);
					} catch(e) {
						rejectPromise(e);
					}
				};

				function onerror(event) {
					if (config.onerror) {
						config.onerror(event.detail);
					}
				}

				var invokeCallback = function(type, promise, callback, event) {
					var hasCallback = isFunction(callback),
						value, error, succeeded, failed;

					if (hasCallback) {
						try {
							value = callback(event.detail);
							succeeded = true;
						} catch(e) {
							failed = true;
							error = e;
						}
					} else {
						value = event.detail;
						succeeded = true;
					}

					if (handleThenable(promise, value)) {
						return;
					} else if (hasCallback && succeeded) {
						resolve(promise, value);
					} else if (failed) {
						reject(promise, error);
					} else if (type === 'resolve') {
						resolve(promise, value);
					} else if (type === 'reject') {
						reject(promise, value);
					}
				};

				Promise.prototype = {
					constructor: Promise,

					isRejected: undefined,
					isFulfilled: undefined,
					rejectedReason: undefined,
					fulfillmentValue: undefined,

					then: function(done, fail) {
						this.off('error', onerror);

						var thenPromise = new this.constructor(function() {});

						if (this.isFulfilled) {
							config.async(function(promise) {
								invokeCallback('resolve', thenPromise, done, { detail: promise.fulfillmentValue });
							}, this);
						}

						if (this.isRejected) {
							config.async(function(promise) {
								invokeCallback('reject', thenPromise, fail, { detail: promise.rejectedReason });
							}, this);
						}

						this.on('promise:resolved', function(event) {
							invokeCallback('resolve', thenPromise, done, event);
						});

						this.on('promise:failed', function(event) {
							invokeCallback('reject', thenPromise, fail, event);
						});

						return thenPromise;
					},

					fail: function(fail) {
						return this.then(null, fail);
					}
				};

				EventTarget.mixin(Promise.prototype);

				function resolve(promise, value) {
					if (promise === value) {
						fulfill(promise, value);
					} else if (!handleThenable(promise, value)) {
						fulfill(promise, value);
					}
				}

				function handleThenable(promise, value) {
					var then = null,
						resolved;

					try {
						if (promise === value) {
							throw new TypeError("A promises callback cannot return that same promise.");
						}

						if (objectOrFunction(value)) {
							then = value.then;

							if (isFunction(then)) {
								then.call(value, function(val) {
									if (resolved) { return true; }
									resolved = true;

									if (value !== val) {
										resolve(promise, val);
									} else {
										fulfill(promise, val);
									}
								}, function(val) {
									if (resolved) { return true; }
									resolved = true;

									reject(promise, val);
								});

								return true;
							}
						}
					} catch (error) {
						reject(promise, error);
						return true;
					}

					return false;
				}

				function fulfill(promise, value) {
					config.async(function() {
						promise.trigger('promise:resolved', { detail: value });
						promise.isFulfilled = true;
						promise.fulfillmentValue = value;
					});
				}

				function reject(promise, value) {
					config.async(function() {
						promise.trigger('promise:failed', { detail: value });
						promise.isRejected = true;
						promise.rejectedReason = value;
					});
				}


				__exports__.Promise = Promise;
			});
		define("rsvp/reject",
			["rsvp/promise","exports"],
			function(__dependency1__, __exports__) {
				"use strict";
				var Promise = __dependency1__.Promise;

				function reject(reason) {
					return new Promise(function (resolve, reject) {
						reject(reason);
					});
				}


				__exports__.reject = reject;
			});
		define("rsvp/resolve",
			["rsvp/promise","exports"],
			function(__dependency1__, __exports__) {
				"use strict";
				var Promise = __dependency1__.Promise;

				function resolve(thenable) {
					return new Promise(function(resolve, reject) {
						resolve(thenable);
					});
				}


				__exports__.resolve = resolve;
			});
		define("rsvp/rethrow",
			["exports"],
			function(__exports__) {
				"use strict";
				var local = (typeof global === "undefined") ? this : global;

				function rethrow(reason) {
					local.setTimeout(function() {
						throw reason;
					});
					throw reason;
				}


				__exports__.rethrow = rethrow;
			});
		define("rsvp",
			["rsvp/events","rsvp/promise","rsvp/node","rsvp/all","rsvp/hash","rsvp/rethrow","rsvp/defer","rsvp/config","rsvp/resolve","rsvp/reject","exports"],
			function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __dependency8__, __dependency9__, __dependency10__, __exports__) {
				"use strict";
				var EventTarget = __dependency1__.EventTarget;
				var Promise = __dependency2__.Promise;
				var denodeify = __dependency3__.denodeify;
				var all = __dependency4__.all;
				var hash = __dependency5__.hash;
				var rethrow = __dependency6__.rethrow;
				var defer = __dependency7__.defer;
				var config = __dependency8__.config;
				var resolve = __dependency9__.resolve;
				var reject = __dependency10__.reject;

				function configure(name, value) {
					config[name] = value;
				}


				__exports__.Promise = Promise;
				__exports__.EventTarget = EventTarget;
				__exports__.all = all;
				__exports__.hash = hash;
				__exports__.rethrow = rethrow;
				__exports__.defer = defer;
				__exports__.denodeify = denodeify;
				__exports__.configure = configure;
				__exports__.resolve = resolve;
				__exports__.reject = reject;
			});
	})();

	(function() {
		/**
		 Flag to enable/disable model factory injections (disabled by default)
		 If model factory injections are enabled, models should not be
		 accessed globally (only through `container.lookupFactory('model:modelName'))`);
		 */
		Ember.MODEL_FACTORY_INJECTIONS = false || !!Ember.ENV.MODEL_FACTORY_INJECTIONS;

		define("container",
			[],
			function() {

				/**
				 A safe and simple inheriting object.

				 @class InheritingDict
				 */
				function InheritingDict(parent) {
					this.parent = parent;
					this.dict = {};
				}

				InheritingDict.prototype = {

					/**
					 @property parent
					 @type InheritingDict
					 @default null
					 */

					parent: null,

					/**
					 Object used to store the current nodes data.

					 @property dict
					 @type Object
					 @default Object
					 */
					dict: null,

					/**
					 Retrieve the value given a key, if the value is present at the current
					 level use it, otherwise walk up the parent hierarchy and try again. If
					 no matching key is found, return undefined.

					 @method get
					 @return {any}
					 */
					get: function(key) {
						var dict = this.dict;

						if (dict.hasOwnProperty(key)) {
							return dict[key];
						}

						if (this.parent) {
							return this.parent.get(key);
						}
					},

					/**
					 Set the given value for the given key, at the current level.

					 @method set
					 @param {String} key
					 @param {Any} value
					 */
					set: function(key, value) {
						this.dict[key] = value;
					},

					/**
					 Delete the given key

					 @method remove
					 @param {String} key
					 */
					remove: function(key) {
						delete this.dict[key];
					},

					/**
					 Check for the existence of given a key, if the key is present at the current
					 level return true, otherwise walk up the parent hierarchy and try again. If
					 no matching key is found, return false.

					 @method has
					 @param {String} key
					 @returns {Boolean}
					 */
					has: function(key) {
						var dict = this.dict;

						if (dict.hasOwnProperty(key)) {
							return true;
						}

						if (this.parent) {
							return this.parent.has(key);
						}

						return false;
					},

					/**
					 Iterate and invoke a callback for each local key-value pair.

					 @method eachLocal
					 @param {Function} callback
					 @param {Object} binding
					 */
					eachLocal: function(callback, binding) {
						var dict = this.dict;

						for (var prop in dict) {
							if (dict.hasOwnProperty(prop)) {
								callback.call(binding, prop, dict[prop]);
							}
						}
					}
				};

				/**
				 A lightweight container that helps to assemble and decouple components.

				 @class Container
				 */
				function Container(parent) {
					this.parent = parent;
					this.children = [];

					this.resolver = parent && parent.resolver || function() {};

					this.registry = new InheritingDict(parent && parent.registry);
					this.cache = new InheritingDict(parent && parent.cache);
					this.factoryCache = new InheritingDict(parent && parent.cache);
					this.typeInjections = new InheritingDict(parent && parent.typeInjections);
					this.injections = {};

					this.factoryTypeInjections = new InheritingDict(parent && parent.factoryTypeInjections);
					this.factoryInjections = {};

					this._options = new InheritingDict(parent && parent._options);
					this._typeOptions = new InheritingDict(parent && parent._typeOptions);
				}

				Container.prototype = {

					/**
					 @property parent
					 @type Container
					 @default null
					 */
					parent: null,

					/**
					 @property children
					 @type Array
					 @default []
					 */
					children: null,

					/**
					 @property resolver
					 @type function
					 */
					resolver: null,

					/**
					 @property registry
					 @type InheritingDict
					 */
					registry: null,

					/**
					 @property cache
					 @type InheritingDict
					 */
					cache: null,

					/**
					 @property typeInjections
					 @type InheritingDict
					 */
					typeInjections: null,

					/**
					 @property injections
					 @type Object
					 @default {}
					 */
					injections: null,

					/**
					 @private

					 @property _options
					 @type InheritingDict
					 @default null
					 */
					_options: null,

					/**
					 @private

					 @property _typeOptions
					 @type InheritingDict
					 */
					_typeOptions: null,

					/**
					 Returns a new child of the current container. These children are configured
					 to correctly inherit from the current container.

					 @method child
					 @returns {Container}
					 */
					child: function() {
						var container = new Container(this);
						this.children.push(container);
						return container;
					},

					/**
					 Sets a key-value pair on the current container. If a parent container,
					 has the same key, once set on a child, the parent and child will diverge
					 as expected.

					 @method set
					 @param {Object} object
					 @param {String} key
					 @param {any} value
					 */
					set: function(object, key, value) {
						object[key] = value;
					},

					/**
					 Registers a factory for later injection.

					 Example:

					 ```javascript
					 var container = new Container();

					 container.register('model:user', Person, {singleton: false });
					 container.register('fruit:favorite', Orange);
					 container.register('communication:main', Email, {singleton: false});
					 ```

					 @method register
					 @param {String} type
					 @param {String} name
					 @param {Function} factory
					 @param {Object} options
					 */
					register: function(type, name, factory, options) {
						var fullName;

						if (type.indexOf(':') !== -1) {
							options = factory;
							factory = name;
							fullName = type;
						} else {

							fullName = type + ":" + name;
						}

						var normalizedName = this.normalize(fullName);

						this.registry.set(normalizedName, factory);
						this._options.set(normalizedName, options || {});
					},

					/**
					 Unregister a fullName

					 ```javascript
					 var container = new Container();
					 container.register('model:user', User);

					 container.lookup('model:user') instanceof User //=> true

					 container.unregister('model:user')
					 container.lookup('model:user') === undefined //=> true
					 ```

					 @method unregister
					 @param {String} fullName
					 */
					unregister: function(fullName) {
						var normalizedName = this.normalize(fullName);

						this.registry.remove(normalizedName);
						this.cache.remove(normalizedName);
						this.factoryCache.remove(normalizedName);
						this._options.remove(normalizedName);
					},

					/**
					 Given a fullName return the corresponding factory.

					 By default `resolve` will retrieve the factory from
					 its container's registry.

					 ```javascript
					 var container = new Container();
					 container.register('api:twitter', Twitter);

					 container.resolve('api:twitter') // => Twitter
					 ```

					 Optionally the container can be provided with a custom resolver.
					 If provided, `resolve` will first provide the custom resolver
					 the oppertunity to resolve the fullName, otherwise it will fallback
					 to the registry.

					 ```javascript
					 var container = new Container();
					 container.resolver = function(fullName) {
          // lookup via the module system of choice
        };

					 // the twitter factory is added to the module system
					 container.resolve('api:twitter') // => Twitter
					 ```

					 @method resolve
					 @param {String} fullName
					 @returns {Function} fullName's factory
					 */
					resolve: function(fullName) {
						return this.resolver(fullName) || this.registry.get(fullName);
					},

					/**
					 A hook that can be used to describe how the resolver will
					 attempt to find the factory.

					 For example, the default Ember `.describe` returns the full
					 class name (including namespace) where Ember's resolver expects
					 to find the `fullName`.

					 @method describe
					 */
					describe: function(fullName) {
						return fullName;
					},

					/**
					 A hook to enable custom fullName normalization behaviour

					 @method normalize
					 @param {String} fullName
					 @return {string} normalized fullName
					 */
					normalize: function(fullName) {
						return fullName;
					},

					/**
					 @method makeToString

					 @param {any} factory
					 @param {string} fullNae
					 @return {function} toString function
					 */
					makeToString: function(factory, fullName) {
						return factory.toString();
					},

					/**
					 Given a fullName return a corresponding instance.

					 The default behaviour is for lookup to return a singleton instance.
					 The singleton is scoped to the container, allowing multiple containers
					 to all have their own locally scoped singletons.

					 ```javascript
					 var container = new Container();
					 container.register('api:twitter', Twitter);

					 var twitter = container.lookup('api:twitter');

					 twitter instanceof Twitter; // => true

					 // by default the container will return singletons
					 twitter2 = container.lookup('api:twitter');
					 twitter instanceof Twitter; // => true

					 twitter === twitter2; //=> true
					 ```

					 If singletons are not wanted an optional flag can be provided at lookup.

					 ```javascript
					 var container = new Container();
					 container.register('api:twitter', Twitter);

					 var twitter = container.lookup('api:twitter', { singleton: false });
					 var twitter2 = container.lookup('api:twitter', { singleton: false });

					 twitter === twitter2; //=> false
					 ```

					 @method lookup
					 @param {String} fullName
					 @param {Object} options
					 @return {any}
					 */
					lookup: function(fullName, options) {
						fullName = this.normalize(fullName);

						options = options || {};

						if (this.cache.has(fullName) && options.singleton !== false) {
							return this.cache.get(fullName);
						}

						var value = instantiate(this, fullName);

						if (!value) { return; }

						if (isSingleton(this, fullName) && options.singleton !== false) {
							this.cache.set(fullName, value);
						}

						return value;
					},

					/**
					 Given a fullName return the corresponding factory.

					 @method lookupFactory
					 @param {String} fullName
					 @return {any}
					 */
					lookupFactory: function(fullName) {
						return factoryFor(this, fullName);
					},

					/**
					 Given a fullName check if the container is aware of its factory
					 or singleton instance.

					 @method has
					 @param {String} fullName
					 @return {Boolean}
					 */
					has: function(fullName) {
						if (this.cache.has(fullName)) {
							return true;
						}

						return !!factoryFor(this, fullName);
					},

					/**
					 Allow registering options for all factories of a type.

					 ```javascript
					 var container = new Container();

					 // if all of type `connection` must not be singletons
					 container.optionsForType('connection', { singleton: false });

					 container.register('connection:twitter', TwitterConnection);
					 container.register('connection:facebook', FacebookConnection);

					 var twitter = container.lookup('connection:twitter');
					 var twitter2 = container.lookup('connection:twitter');

					 twitter === twitter2; // => false

					 var facebook = container.lookup('connection:facebook');
					 var facebook2 = container.lookup('connection:facebook');

					 facebook === facebook2; // => false
					 ```

					 @method optionsForType
					 @param {String} type
					 @param {Object} options
					 */
					optionsForType: function(type, options) {
						if (this.parent) { illegalChildOperation('optionsForType'); }

						this._typeOptions.set(type, options);
					},

					/**
					 @method options
					 @param {String} type
					 @param {Object} options
					 */
					options: function(type, options) {
						this.optionsForType(type, options);
					},

					/*
					 @private

					 Used only via `injection`.

					 Provides a specialized form of injection, specifically enabling
					 all objects of one type to be injected with a reference to another
					 object.

					 For example, provided each object of type `controller` needed a `router`.
					 one would do the following:

					 ```javascript
					 var container = new Container();

					 container.register('router:main', Router);
					 container.register('controller:user', UserController);
					 container.register('controller:post', PostController);

					 container.typeInjection('controller', 'router', 'router:main');

					 var user = container.lookup('controller:user');
					 var post = container.lookup('controller:post');

					 user.router instanceof Router; //=> true
					 post.router instanceof Router; //=> true

					 // both controllers share the same router
					 user.router === post.router; //=> true
					 ```

					 @method typeInjection
					 @param {String} type
					 @param {String} property
					 @param {String} fullName
					 */
					typeInjection: function(type, property, fullName) {
						if (this.parent) { illegalChildOperation('typeInjection'); }

						addTypeInjection(this.typeInjections, type, property, fullName);
					},

					/*
					 Defines injection rules.

					 These rules are used to inject dependencies onto objects when they
					 are instantiated.

					 Two forms of injections are possible:

					 * Injecting one fullName on another fullName
					 * Injecting one fullName on a type

					 Example:

					 ```javascript
					 var container = new Container();

					 container.register('source:main', Source);
					 container.register('model:user', User);
					 container.register('model:post', Post);

					 // injecting one fullName on another fullName
					 // eg. each user model gets a post model
					 container.injection('model:user', 'post', 'model:post');

					 // injecting one fullName on another type
					 container.injection('model', 'source', 'source:main');

					 var user = container.lookup('model:user');
					 var post = container.lookup('model:post');

					 user.source instanceof Source; //=> true
					 post.source instanceof Source; //=> true

					 user.post instanceof Post; //=> true

					 // and both models share the same source
					 user.source === post.source; //=> true
					 ```

					 @method injection
					 @param {String} factoryName
					 @param {String} property
					 @param {String} injectionName
					 */
					injection: function(factoryName, property, injectionName) {
						if (this.parent) { illegalChildOperation('injection'); }

						if (factoryName.indexOf(':') === -1) {
							return this.typeInjection(factoryName, property, injectionName);
						}

						addInjection(this.injections, factoryName, property, injectionName);
					},


					/*
					 @private

					 Used only via `factoryInjection`.

					 Provides a specialized form of injection, specifically enabling
					 all factory of one type to be injected with a reference to another
					 object.

					 For example, provided each factory of type `model` needed a `store`.
					 one would do the following:

					 ```javascript
					 var container = new Container();

					 container.registerFactory('model:user', User);
					 container.register('store:main', SomeStore);

					 container.factoryTypeInjection('model', 'store', 'store:main');

					 var store = container.lookup('store:main');
					 var UserFactory = container.lookupFactory('model:user');

					 UserFactory.store instanceof SomeStore; //=> true
					 ```

					 @method factoryTypeInjection
					 @param {String} type
					 @param {String} property
					 @param {String} fullName
					 */
					factoryTypeInjection: function(type, property, fullName) {
						if (this.parent) { illegalChildOperation('factoryTypeInjection'); }

						addTypeInjection(this.factoryTypeInjections, type, property, fullName);
					},

					/*
					 Defines factory injection rules.

					 Similar to regular injection rules, but are run against factories, via
					 `Container#lookupFactory`.

					 These rules are used to inject objects onto factories when they
					 are looked up.

					 Two forms of injections are possible:

					 * Injecting one fullName on another fullName
					 * Injecting one fullName on a type

					 Example:

					 ```javascript
					 var container = new Container();

					 container.register('store:main', Store);
					 container.register('store:secondary', OtherStore);
					 container.register('model:user', User);
					 container.register('model:post', Post);

					 // injecting one fullName on another type
					 container.factoryInjection('model', 'store', 'store:main');

					 // injecting one fullName on another fullName
					 container.factoryInjection('model:post', 'secondaryStore', 'store:secondary');

					 var UserFactory = container.lookupFactory('model:user');
					 var PostFactory = container.lookupFactory('model:post');
					 var store = container.lookup('store:main');

					 UserFactory.store instanceof Store; //=> true
					 UserFactory.secondaryStore instanceof OtherStore; //=> false

					 PostFactory.store instanceof Store; //=> true
					 PostFactory.secondaryStore instanceof OtherStore; //=> true

					 // and both models share the same source instance
					 UserFactory.store === PostFactory.store; //=> true
					 ```

					 @method factoryInjection
					 @param {String} factoryName
					 @param {String} property
					 @param {String} injectionName
					 */
					factoryInjection: function(factoryName, property, injectionName) {
						if (this.parent) { illegalChildOperation('injection'); }

						if (factoryName.indexOf(':') === -1) {
							return this.factoryTypeInjection(factoryName, property, injectionName);
						}

						addInjection(this.factoryInjections, factoryName, property, injectionName);
					},

					/**
					 A depth first traversal, destroying the container, its descendant containers and all
					 their managed objects.

					 @method destroy
					 */
					destroy: function() {
						this.isDestroyed = true;

						for (var i=0, l=this.children.length; i<l; i++) {
							this.children[i].destroy();
						}

						this.children = [];

						eachDestroyable(this, function(item) {
							item.destroy();
						});

						this.parent = undefined;
						this.isDestroyed = true;
					},

					/**
					 @method reset
					 */
					reset: function() {
						for (var i=0, l=this.children.length; i<l; i++) {
							resetCache(this.children[i]);
						}
						resetCache(this);
					}
				};

				function illegalChildOperation(operation) {
					throw new Error(operation + " is not currently supported on child containers");
				}

				function isSingleton(container, fullName) {
					var singleton = option(container, fullName, 'singleton');

					return singleton !== false;
				}

				function buildInjections(container, injections) {
					var hash = {};

					if (!injections) { return hash; }

					var injection, lookup;

					for (var i=0, l=injections.length; i<l; i++) {
						injection = injections[i];
						lookup = container.lookup(injection.fullName);

						if (lookup) {
							hash[injection.property] = lookup;
						} else {
							throw new Error('Attempting to inject an unknown injection: `' + injection.fullName + '`');
						}
					}

					return hash;
				}

				function option(container, fullName, optionName) {
					var options = container._options.get(fullName);

					if (options && options[optionName] !== undefined) {
						return options[optionName];
					}

					var type = fullName.split(":")[0];
					options = container._typeOptions.get(type);

					if (options) {
						return options[optionName];
					}
				}

				function factoryFor(container, fullName) {
					var name = container.normalize(fullName);
					var factory = container.resolve(name);
					var injectedFactory;
					var cache = container.factoryCache;
					var type = fullName.split(":")[0];

					if (!factory) { return; }

					if (cache.has(fullName)) {
						return cache.get(fullName);
					}

					if (typeof factory.extend !== 'function' || (!Ember.MODEL_FACTORY_INJECTIONS && type === 'model')) {
						// TODO: think about a 'safe' merge style extension
						// for now just fallback to create time injection
						return factory;
					} else {

						var injections        = injectionsFor(container, fullName);
						var factoryInjections = factoryInjectionsFor(container, fullName);

						factoryInjections._toString = container.makeToString(factory, fullName);

						injectedFactory = factory.extend(injections);
						injectedFactory.reopenClass(factoryInjections);

						cache.set(fullName, injectedFactory);

						return injectedFactory;
					}
				}

				function injectionsFor(container ,fullName) {
					var splitName = fullName.split(":"),
						type = splitName[0],
						injections = [];

					injections = injections.concat(container.typeInjections.get(type) || []);
					injections = injections.concat(container.injections[fullName] || []);

					injections = buildInjections(container, injections);
					injections._debugContainerKey = fullName;
					injections.container = container;

					return injections;
				}

				function factoryInjectionsFor(container, fullName) {
					var splitName = fullName.split(":"),
						type = splitName[0],
						factoryInjections = [];

					factoryInjections = factoryInjections.concat(container.factoryTypeInjections.get(type) || []);
					factoryInjections = factoryInjections.concat(container.factoryInjections[fullName] || []);

					factoryInjections = buildInjections(container, factoryInjections);
					factoryInjections._debugContainerKey = fullName;

					return factoryInjections;
				}

				function instantiate(container, fullName) {
					var factory = factoryFor(container, fullName);

					if (option(container, fullName, 'instantiate') === false) {
						return factory;
					}

					if (factory) {
						if (typeof factory.extend === 'function') {
							// assume the factory was extendable and is already injected
							return factory.create();
						} else {
							// assume the factory was extendable
							// to create time injections
							// TODO: support new'ing for instantiation and merge injections for pure JS Functions
							return factory.create(injectionsFor(container, fullName));
						}
					}
				}

				function eachDestroyable(container, callback) {
					container.cache.eachLocal(function(key, value) {
						if (option(container, key, 'instantiate') === false) { return; }
						callback(value);
					});
				}

				function resetCache(container) {
					container.cache.eachLocal(function(key, value) {
						if (option(container, key, 'instantiate') === false) { return; }
						value.destroy();
					});
					container.cache.dict = {};
				}

				function addTypeInjection(rules, type, property, fullName) {
					var injections = rules.get(type);

					if (!injections) {
						injections = [];
						rules.set(type, injections);
					}

					injections.push({
						property: property,
						fullName: fullName
					});
				}

				function addInjection(rules, factoryName, property, injectionName) {
					var injections = rules[factoryName] = rules[factoryName] || [];
					injections.push({ property: property, fullName: injectionName });
				}

				return Container;
			});

	})();

	(function() {
		/*globals ENV */
		/**
		 @module ember
		 @submodule ember-runtime
		 */

		var indexOf = Ember.EnumerableUtils.indexOf;

		/**
		 This will compare two javascript values of possibly different types.
		 It will tell you which one is greater than the other by returning:

		 - -1 if the first is smaller than the second,
		 - 0 if both are equal,
		 - 1 if the first is greater than the second.

		 The order is calculated based on `Ember.ORDER_DEFINITION`, if types are different.
		 In case they have the same type an appropriate comparison for this type is made.

		 ```javascript
		 Ember.compare('hello', 'hello');  // 0
		 Ember.compare('abc', 'dfg');      // -1
		 Ember.compare(2, 1);              // 1
		 ```

		 @method compare
		 @for Ember
		 @param {Object} v First value to compare
		 @param {Object} w Second value to compare
		 @return {Number} -1 if v < w, 0 if v = w and 1 if v > w.
		 */
		Ember.compare = function compare(v, w) {
			if (v === w) { return 0; }

			var type1 = Ember.typeOf(v);
			var type2 = Ember.typeOf(w);

			var Comparable = Ember.Comparable;
			if (Comparable) {
				if (type1==='instance' && Comparable.detect(v.constructor)) {
					return v.constructor.compare(v, w);
				}

				if (type2 === 'instance' && Comparable.detect(w.constructor)) {
					return 1-w.constructor.compare(w, v);
				}
			}

			// If we haven't yet generated a reverse-mapping of Ember.ORDER_DEFINITION,
			// do so now.
			var mapping = Ember.ORDER_DEFINITION_MAPPING;
			if (!mapping) {
				var order = Ember.ORDER_DEFINITION;
				mapping = Ember.ORDER_DEFINITION_MAPPING = {};
				var idx, len;
				for (idx = 0, len = order.length; idx < len;  ++idx) {
					mapping[order[idx]] = idx;
				}

				// We no longer need Ember.ORDER_DEFINITION.
				delete Ember.ORDER_DEFINITION;
			}

			var type1Index = mapping[type1];
			var type2Index = mapping[type2];

			if (type1Index < type2Index) { return -1; }
			if (type1Index > type2Index) { return 1; }

			// types are equal - so we have to check values now
			switch (type1) {
				case 'boolean':
				case 'number':
					if (v < w) { return -1; }
					if (v > w) { return 1; }
					return 0;

				case 'string':
					var comp = v.localeCompare(w);
					if (comp < 0) { return -1; }
					if (comp > 0) { return 1; }
					return 0;

				case 'array':
					var vLen = v.length;
					var wLen = w.length;
					var l = Math.min(vLen, wLen);
					var r = 0;
					var i = 0;
					while (r === 0 && i < l) {
						r = compare(v[i],w[i]);
						i++;
					}
					if (r !== 0) { return r; }

					// all elements are equal now
					// shorter array should be ordered first
					if (vLen < wLen) { return -1; }
					if (vLen > wLen) { return 1; }
					// arrays are equal now
					return 0;

				case 'instance':
					if (Ember.Comparable && Ember.Comparable.detect(v)) {
						return v.compare(v, w);
					}
					return 0;

				case 'date':
					var vNum = v.getTime();
					var wNum = w.getTime();
					if (vNum < wNum) { return -1; }
					if (vNum > wNum) { return 1; }
					return 0;

				default:
					return 0;
			}
		};

		function _copy(obj, deep, seen, copies) {
			var ret, loc, key;

			// primitive data types are immutable, just return them.
			if ('object' !== typeof obj || obj===null) return obj;

			// avoid cyclical loops
			if (deep && (loc=indexOf(seen, obj))>=0) return copies[loc];


			// IMPORTANT: this specific test will detect a native array only. Any other
			// object will need to implement Copyable.
			if (Ember.typeOf(obj) === 'array') {
				ret = obj.slice();
				if (deep) {
					loc = ret.length;
					while(--loc>=0) ret[loc] = _copy(ret[loc], deep, seen, copies);
				}
			} else if (Ember.Copyable && Ember.Copyable.detect(obj)) {
				ret = obj.copy(deep, seen, copies);
			} else {
				ret = {};
				for(key in obj) {
					if (!obj.hasOwnProperty(key)) continue;

					// Prevents browsers that don't respect non-enumerability from
					// copying internal Ember properties
					if (key.substring(0,2) === '__') continue;

					ret[key] = deep ? _copy(obj[key], deep, seen, copies) : obj[key];
				}
			}

			if (deep) {
				seen.push(obj);
				copies.push(ret);
			}

			return ret;
		}

		/**
		 Creates a clone of the passed object. This function can take just about
		 any type of object and create a clone of it, including primitive values
		 (which are not actually cloned because they are immutable).

		 If the passed object implements the `clone()` method, then this function
		 will simply call that method and return the result.

		 @method copy
		 @for Ember
		 @param {Object} obj The object to clone
		 @param {Boolean} deep If true, a deep copy of the object is made
		 @return {Object} The cloned object
		 */
		Ember.copy = function(obj, deep) {
			// fast paths
			if ('object' !== typeof obj || obj===null) return obj; // can't copy primitives
			if (Ember.Copyable && Ember.Copyable.detect(obj)) return obj.copy(deep);
			return _copy(obj, deep, deep ? [] : null, deep ? [] : null);
		};

		/**
		 Convenience method to inspect an object. This method will attempt to
		 convert the object into a useful string description.

		 It is a pretty simple implementation. If you want something more robust,
		 use something like JSDump: https://github.com/NV/jsDump

		 @method inspect
		 @for Ember
		 @param {Object} obj The object you want to inspect.
		 @return {String} A description of the object
		 */
		Ember.inspect = function(obj) {
			var type = Ember.typeOf(obj);
			if (type === 'array') {
				return '[' + obj + ']';
			}
			if (type !== 'object') {
				return obj + '';
			}

			var v, ret = [];
			for(var key in obj) {
				if (obj.hasOwnProperty(key)) {
					v = obj[key];
					if (v === 'toString') { continue; } // ignore useless items
					if (Ember.typeOf(v) === 'function') { v = "function() { ... }"; }
					ret.push(key + ": " + v);
				}
			}
			return "{" + ret.join(", ") + "}";
		};

		/**
		 Compares two objects, returning true if they are logically equal. This is
		 a deeper comparison than a simple triple equal. For sets it will compare the
		 internal objects. For any other object that implements `isEqual()` it will
		 respect that method.

		 ```javascript
		 Ember.isEqual('hello', 'hello');  // true
		 Ember.isEqual(1, 2);              // false
		 Ember.isEqual([4,2], [4,2]);      // false
		 ```

		 @method isEqual
		 @for Ember
		 @param {Object} a first object to compare
		 @param {Object} b second object to compare
		 @return {Boolean}
		 */
		Ember.isEqual = function(a, b) {
			if (a && 'function'===typeof a.isEqual) return a.isEqual(b);
			return a === b;
		};

// Used by Ember.compare
		Ember.ORDER_DEFINITION = Ember.ENV.ORDER_DEFINITION || [
			'undefined',
			'null',
			'boolean',
			'number',
			'string',
			'array',
			'object',
			'instance',
			'function',
			'class',
			'date'
		];

		/**
		 Returns all of the keys defined on an object or hash. This is useful
		 when inspecting objects for debugging. On browsers that support it, this
		 uses the native `Object.keys` implementation.

		 @method keys
		 @for Ember
		 @param {Object} obj
		 @return {Array} Array containing keys of obj
		 */
		Ember.keys = Object.keys;

		if (!Ember.keys || Ember.create.isSimulated) {
			Ember.keys = function(obj) {
				var ret = [];
				for(var key in obj) {
					// Prevents browsers that don't respect non-enumerability from
					// copying internal Ember properties
					if (key.substring(0,2) === '__') continue;
					if (key === '_super') continue;

					if (obj.hasOwnProperty(key)) { ret.push(key); }
				}
				return ret;
			};
		}

// ..........................................................
// ERROR
//

		var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

		/**
		 A subclass of the JavaScript Error object for use in Ember.

		 @class Error
		 @namespace Ember
		 @extends Error
		 @constructor
		 */
		Ember.Error = function() {
			var tmp = Error.apply(this, arguments);

			// Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
			for (var idx = 0; idx < errorProps.length; idx++) {
				this[errorProps[idx]] = tmp[errorProps[idx]];
			}
		};

		Ember.Error.prototype = Ember.create(Error.prototype);

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-runtime
		 */

// ..........................................................
// HELPERS
//

		var get = Ember.get, set = Ember.set;
		var a_slice = Array.prototype.slice;
		var a_indexOf = Ember.EnumerableUtils.indexOf;

		var contexts = [];

		function popCtx() {
			return contexts.length===0 ? {} : contexts.pop();
		}

		function pushCtx(ctx) {
			contexts.push(ctx);
			return null;
		}

		function iter(key, value) {
			var valueProvided = arguments.length === 2;

			function i(item) {
				var cur = get(item, key);
				return valueProvided ? value===cur : !!cur;
			}
			return i ;
		}

		/**
		 This mixin defines the common interface implemented by enumerable objects
		 in Ember. Most of these methods follow the standard Array iteration
		 API defined up to JavaScript 1.8 (excluding language-specific features that
		 cannot be emulated in older versions of JavaScript).

		 This mixin is applied automatically to the Array class on page load, so you
		 can use any of these methods on simple arrays. If Array already implements
		 one of these methods, the mixin will not override them.

		 ## Writing Your Own Enumerable

		 To make your own custom class enumerable, you need two items:

		 1. You must have a length property. This property should change whenever
		 the number of items in your enumerable object changes. If you using this
		 with an `Ember.Object` subclass, you should be sure to change the length
		 property using `set().`

		 2. If you must implement `nextObject().` See documentation.

		 Once you have these two methods implement, apply the `Ember.Enumerable` mixin
		 to your class and you will be able to enumerate the contents of your object
		 like any other collection.

		 ## Using Ember Enumeration with Other Libraries

		 Many other libraries provide some kind of iterator or enumeration like
		 facility. This is often where the most common API conflicts occur.
		 Ember's API is designed to be as friendly as possible with other
		 libraries by implementing only methods that mostly correspond to the
		 JavaScript 1.8 API.

		 @class Enumerable
		 @namespace Ember
		 @since Ember 0.9
		 */
		Ember.Enumerable = Ember.Mixin.create({

			/**
			 Implement this method to make your class enumerable.

			 This method will be call repeatedly during enumeration. The index value
			 will always begin with 0 and increment monotonically. You don't have to
			 rely on the index value to determine what object to return, but you should
			 always check the value and start from the beginning when you see the
			 requested index is 0.

			 The `previousObject` is the object that was returned from the last call
			 to `nextObject` for the current iteration. This is a useful way to
			 manage iteration if you are tracing a linked list, for example.

			 Finally the context parameter will always contain a hash you can use as
			 a "scratchpad" to maintain any other state you need in order to iterate
			 properly. The context object is reused and is not reset between
			 iterations so make sure you setup the context with a fresh state whenever
			 the index parameter is 0.

			 Generally iterators will continue to call `nextObject` until the index
			 reaches the your current length-1. If you run out of data before this
			 time for some reason, you should simply return undefined.

			 The default implementation of this method simply looks up the index.
			 This works great on any Array-like objects.

			 @method nextObject
			 @param {Number} index the current index of the iteration
			 @param {Object} previousObject the value returned by the last call to
			 `nextObject`.
			 @param {Object} context a context object you can use to maintain state.
			 @return {Object} the next object in the iteration or undefined
			 */
			nextObject: Ember.required(Function),

			/**
			 Helper method returns the first object from a collection. This is usually
			 used by bindings and other parts of the framework to extract a single
			 object if the enumerable contains only one item.

			 If you override this method, you should implement it so that it will
			 always return the same value each time it is called. If your enumerable
			 contains only one object, this method should always return that object.
			 If your enumerable is empty, this method should return `undefined`.

			 ```javascript
			 var arr = ["a", "b", "c"];
			 arr.get('firstObject');  // "a"

			 var arr = [];
			 arr.get('firstObject');  // undefined
			 ```

			 @property firstObject
			 @return {Object} the object or undefined
			 */
			firstObject: Ember.computed(function() {
				if (get(this, 'length')===0) return undefined ;

				// handle generic enumerables
				var context = popCtx(), ret;
				ret = this.nextObject(0, null, context);
				pushCtx(context);
				return ret ;
			}).property('[]'),

			/**
			 Helper method returns the last object from a collection. If your enumerable
			 contains only one object, this method should always return that object.
			 If your enumerable is empty, this method should return `undefined`.

			 ```javascript
			 var arr = ["a", "b", "c"];
			 arr.get('lastObject');  // "c"

			 var arr = [];
			 arr.get('lastObject');  // undefined
			 ```

			 @property lastObject
			 @return {Object} the last object or undefined
			 */
			lastObject: Ember.computed(function() {
				var len = get(this, 'length');
				if (len===0) return undefined ;
				var context = popCtx(), idx=0, cur, last = null;
				do {
					last = cur;
					cur = this.nextObject(idx++, last, context);
				} while (cur !== undefined);
				pushCtx(context);
				return last;
			}).property('[]'),

			/**
			 Returns `true` if the passed object can be found in the receiver. The
			 default version will iterate through the enumerable until the object
			 is found. You may want to override this with a more efficient version.

			 ```javascript
			 var arr = ["a", "b", "c"];
			 arr.contains("a"); // true
			 arr.contains("z"); // false
			 ```

			 @method contains
			 @param {Object} obj The object to search for.
			 @return {Boolean} `true` if object is found in enumerable.
			 */
			contains: function(obj) {
				return this.find(function(item) { return item===obj; }) !== undefined;
			},

			/**
			 Iterates through the enumerable, calling the passed function on each
			 item. This method corresponds to the `forEach()` method defined in
			 JavaScript 1.6.

			 The callback method you provide should have the following signature (all
			 parameters are optional):

			 ```javascript
			 function(item, index, enumerable);
			 ```

			 - `item` is the current item in the iteration.
			 - `index` is the current index in the iteration.
			 - `enumerable` is the enumerable object itself.

			 Note that in addition to a callback, you can also pass an optional target
			 object that will be set as `this` on the context. This is a good way
			 to give your iterator function access to the current object.

			 @method forEach
			 @param {Function} callback The callback to execute
			 @param {Object} [target] The target object to use
			 @return {Object} receiver
			 */
			forEach: function(callback, target) {
				if (typeof callback !== "function") throw new TypeError() ;
				var len = get(this, 'length'), last = null, context = popCtx();

				if (target === undefined) target = null;

				for(var idx=0;idx<len;idx++) {
					var next = this.nextObject(idx, last, context) ;
					callback.call(target, next, idx, this);
					last = next ;
				}
				last = null ;
				context = pushCtx(context);
				return this ;
			},

			/**
			 Alias for `mapBy`

			 @method getEach
			 @param {String} key name of the property
			 @return {Array} The mapped array.
			 */
			getEach: function(key) {
				return this.mapBy(key);
			},

			/**
			 Sets the value on the named property for each member. This is more
			 efficient than using other methods defined on this helper. If the object
			 implements Ember.Observable, the value will be changed to `set(),` otherwise
			 it will be set directly. `null` objects are skipped.

			 @method setEach
			 @param {String} key The key to set
			 @param {Object} value The object to set
			 @return {Object} receiver
			 */
			setEach: function(key, value) {
				return this.forEach(function(item) {
					set(item, key, value);
				});
			},

			/**
			 Maps all of the items in the enumeration to another value, returning
			 a new array. This method corresponds to `map()` defined in JavaScript 1.6.

			 The callback method you provide should have the following signature (all
			 parameters are optional):

			 ```javascript
			 function(item, index, enumerable);
			 ```

			 - `item` is the current item in the iteration.
			 - `index` is the current index in the iteration.
			 - `enumerable` is the enumerable object itself.

			 It should return the mapped value.

			 Note that in addition to a callback, you can also pass an optional target
			 object that will be set as `this` on the context. This is a good way
			 to give your iterator function access to the current object.

			 @method map
			 @param {Function} callback The callback to execute
			 @param {Object} [target] The target object to use
			 @return {Array} The mapped array.
			 */
			map: function(callback, target) {
				var ret = Ember.A();
				this.forEach(function(x, idx, i) {
					ret[idx] = callback.call(target, x, idx,i);
				});
				return ret ;
			},

			/**
			 Similar to map, this specialized function returns the value of the named
			 property on all items in the enumeration.

			 @method mapBy
			 @param {String} key name of the property
			 @return {Array} The mapped array.
			 */
			mapBy: function(key) {
				return this.map(function(next) {
					return get(next, key);
				});
			},

			/**
			 Similar to map, this specialized function returns the value of the named
			 property on all items in the enumeration.

			 @method mapProperty
			 @param {String} key name of the property
			 @return {Array} The mapped array.
			 @deprecated Use `mapBy` instead
			 */

			mapProperty: Ember.aliasMethod('mapBy'),

			/**
			 Returns an array with all of the items in the enumeration that the passed
			 function returns true for. This method corresponds to `filter()` defined in
			 JavaScript 1.6.

			 The callback method you provide should have the following signature (all
			 parameters are optional):

			 ```javascript
			 function(item, index, enumerable);
			 ```

			 - `item` is the current item in the iteration.
			 - `index` is the current index in the iteration.
			 - `enumerable` is the enumerable object itself.

			 It should return the `true` to include the item in the results, `false`
			 otherwise.

			 Note that in addition to a callback, you can also pass an optional target
			 object that will be set as `this` on the context. This is a good way
			 to give your iterator function access to the current object.

			 @method filter
			 @param {Function} callback The callback to execute
			 @param {Object} [target] The target object to use
			 @return {Array} A filtered array.
			 */
			filter: function(callback, target) {
				var ret = Ember.A();
				this.forEach(function(x, idx, i) {
					if (callback.call(target, x, idx, i)) ret.push(x);
				});
				return ret ;
			},

			/**
			 Returns an array with all of the items in the enumeration where the passed
			 function returns false for. This method is the inverse of filter().

			 The callback method you provide should have the following signature (all
			 parameters are optional):

			 function(item, index, enumerable);

			 - *item* is the current item in the iteration.
			 - *index* is the current index in the iteration
			 - *enumerable* is the enumerable object itself.

			 It should return the a falsey value to include the item in the results.

			 Note that in addition to a callback, you can also pass an optional target
			 object that will be set as "this" on the context. This is a good way
			 to give your iterator function access to the current object.

			 @method reject
			 @param {Function} callback The callback to execute
			 @param {Object} [target] The target object to use
			 @return {Array} A rejected array.
			 */
			reject: function(callback, target) {
				return this.filter(function() {
					return !(callback.apply(target, arguments));
				});
			},

			/**
			 Returns an array with just the items with the matched property. You
			 can pass an optional second argument with the target value. Otherwise
			 this will match any property that evaluates to `true`.

			 @method filterBy
			 @param {String} key the property to test
			 @param {String} [value] optional value to test against.
			 @return {Array} filtered array
			 */
			filterBy: function(key, value) {
				return this.filter(iter.apply(this, arguments));
			},

			/**
			 Returns an array with just the items with the matched property. You
			 can pass an optional second argument with the target value. Otherwise
			 this will match any property that evaluates to `true`.

			 @method filterProperty
			 @param {String} key the property to test
			 @param {String} [value] optional value to test against.
			 @return {Array} filtered array
			 @deprecated Use `filterBy` instead
			 */
			filterProperty: Ember.aliasMethod('filterBy'),

			/**
			 Returns an array with the items that do not have truthy values for
			 key.  You can pass an optional second argument with the target value.  Otherwise
			 this will match any property that evaluates to false.

			 @method rejectBy
			 @param {String} key the property to test
			 @param {String} [value] optional value to test against.
			 @return {Array} rejected array
			 */
			rejectBy: function(key, value) {
				var exactValue = function(item) { return get(item, key) === value; },
					hasValue = function(item) { return !!get(item, key); },
					use = (arguments.length === 2 ? exactValue : hasValue);

				return this.reject(use);
			},

			/**
			 Returns an array with the items that do not have truthy values for
			 key.  You can pass an optional second argument with the target value.  Otherwise
			 this will match any property that evaluates to false.

			 @method rejectProperty
			 @param {String} key the property to test
			 @param {String} [value] optional value to test against.
			 @return {Array} rejected array
			 @deprecated Use `rejectBy` instead
			 */
			rejectProperty: Ember.aliasMethod('rejectBy'),

			/**
			 Returns the first item in the array for which the callback returns true.
			 This method works similar to the `filter()` method defined in JavaScript 1.6
			 except that it will stop working on the array once a match is found.

			 The callback method you provide should have the following signature (all
			 parameters are optional):

			 ```javascript
			 function(item, index, enumerable);
			 ```

			 - `item` is the current item in the iteration.
			 - `index` is the current index in the iteration.
			 - `enumerable` is the enumerable object itself.

			 It should return the `true` to include the item in the results, `false`
			 otherwise.

			 Note that in addition to a callback, you can also pass an optional target
			 object that will be set as `this` on the context. This is a good way
			 to give your iterator function access to the current object.

			 @method find
			 @param {Function} callback The callback to execute
			 @param {Object} [target] The target object to use
			 @return {Object} Found item or `undefined`.
			 */
			find: function(callback, target) {
				var len = get(this, 'length') ;
				if (target === undefined) target = null;

				var last = null, next, found = false, ret ;
				var context = popCtx();
				for(var idx=0;idx<len && !found;idx++) {
					next = this.nextObject(idx, last, context) ;
					if (found = callback.call(target, next, idx, this)) ret = next ;
					last = next ;
				}
				next = last = null ;
				context = pushCtx(context);
				return ret ;
			},

			/**
			 Returns the first item with a property matching the passed value. You
			 can pass an optional second argument with the target value. Otherwise
			 this will match any property that evaluates to `true`.

			 This method works much like the more generic `find()` method.

			 @method findBy
			 @param {String} key the property to test
			 @param {String} [value] optional value to test against.
			 @return {Object} found item or `undefined`
			 */
			findBy: function(key, value) {
				return this.find(iter.apply(this, arguments));
			},

			/**
			 Returns the first item with a property matching the passed value. You
			 can pass an optional second argument with the target value. Otherwise
			 this will match any property that evaluates to `true`.

			 This method works much like the more generic `find()` method.

			 @method findProperty
			 @param {String} key the property to test
			 @param {String} [value] optional value to test against.
			 @return {Object} found item or `undefined`
			 @deprecated Use `findBy` instead
			 */
			findProperty: Ember.aliasMethod('findBy'),

			/**
			 Returns `true` if the passed function returns true for every item in the
			 enumeration. This corresponds with the `every()` method in JavaScript 1.6.

			 The callback method you provide should have the following signature (all
			 parameters are optional):

			 ```javascript
			 function(item, index, enumerable);
			 ```

			 - `item` is the current item in the iteration.
			 - `index` is the current index in the iteration.
			 - `enumerable` is the enumerable object itself.

			 It should return the `true` or `false`.

			 Note that in addition to a callback, you can also pass an optional target
			 object that will be set as `this` on the context. This is a good way
			 to give your iterator function access to the current object.

			 Example Usage:

			 ```javascript
			 if (people.every(isEngineer)) { Paychecks.addBigBonus(); }
			 ```

			 @method every
			 @param {Function} callback The callback to execute
			 @param {Object} [target] The target object to use
			 @return {Boolean}
			 */
			every: function(callback, target) {
				return !this.find(function(x, idx, i) {
					return !callback.call(target, x, idx, i);
				});
			},

			/**
			 Returns `true` if the passed property resolves to `true` for all items in
			 the enumerable. This method is often simpler/faster than using a callback.

			 @method everyBy
			 @param {String} key the property to test
			 @param {String} [value] optional value to test against.
			 @return {Boolean}
			 */
			everyBy: function(key, value) {
				return this.every(iter.apply(this, arguments));
			},

			/**
			 Returns `true` if the passed property resolves to `true` for all items in
			 the enumerable. This method is often simpler/faster than using a callback.

			 @method everyProperty
			 @param {String} key the property to test
			 @param {String} [value] optional value to test against.
			 @return {Boolean}
			 @deprecated Use `everyBy` instead
			 */
			everyProperty: Ember.aliasMethod('everyBy'),

			/**
			 Returns `true` if the passed function returns true for any item in the
			 enumeration. This corresponds with the `some()` method in JavaScript 1.6.

			 The callback method you provide should have the following signature (all
			 parameters are optional):

			 ```javascript
			 function(item, index, enumerable);
			 ```

			 - `item` is the current item in the iteration.
			 - `index` is the current index in the iteration.
			 - `enumerable` is the enumerable object itself.

			 It should return the `true` to include the item in the results, `false`
			 otherwise.

			 Note that in addition to a callback, you can also pass an optional target
			 object that will be set as `this` on the context. This is a good way
			 to give your iterator function access to the current object.

			 Usage Example:

			 ```javascript
			 if (people.any(isManager)) { Paychecks.addBiggerBonus(); }
			 ```

			 @method any
			 @param {Function} callback The callback to execute
			 @param {Object} [target] The target object to use
			 @return {Boolean} `true` if the passed function returns `true` for any item
			 */
			any: function(callback, target) {
				return !!this.find(function(x, idx, i) {
					return !!callback.call(target, x, idx, i);
				});
			},

			/**
			 Returns `true` if the passed function returns true for any item in the
			 enumeration. This corresponds with the `some()` method in JavaScript 1.6.

			 The callback method you provide should have the following signature (all
			 parameters are optional):

			 ```javascript
			 function(item, index, enumerable);
			 ```

			 - `item` is the current item in the iteration.
			 - `index` is the current index in the iteration.
			 - `enumerable` is the enumerable object itself.

			 It should return the `true` to include the item in the results, `false`
			 otherwise.

			 Note that in addition to a callback, you can also pass an optional target
			 object that will be set as `this` on the context. This is a good way
			 to give your iterator function access to the current object.

			 Usage Example:

			 ```javascript
			 if (people.some(isManager)) { Paychecks.addBiggerBonus(); }
			 ```

			 @method some
			 @param {Function} callback The callback to execute
			 @param {Object} [target] The target object to use
			 @return {Boolean} `true` if the passed function returns `true` for any item
			 @deprecated Use `any` instead
			 */
			some: Ember.aliasMethod('any'),

			/**
			 Returns `true` if the passed property resolves to `true` for any item in
			 the enumerable. This method is often simpler/faster than using a callback.

			 @method anyBy
			 @param {String} key the property to test
			 @param {String} [value] optional value to test against.
			 @return {Boolean} `true` if the passed function returns `true` for any item
			 */
			anyBy: function(key, value) {
				return this.any(iter.apply(this, arguments));
			},

			/**
			 Returns `true` if the passed property resolves to `true` for any item in
			 the enumerable. This method is often simpler/faster than using a callback.

			 @method someProperty
			 @param {String} key the property to test
			 @param {String} [value] optional value to test against.
			 @return {Boolean} `true` if the passed function returns `true` for any item
			 @deprecated Use `anyBy` instead
			 */
			someProperty: Ember.aliasMethod('anyBy'),

			/**
			 This will combine the values of the enumerator into a single value. It
			 is a useful way to collect a summary value from an enumeration. This
			 corresponds to the `reduce()` method defined in JavaScript 1.8.

			 The callback method you provide should have the following signature (all
			 parameters are optional):

			 ```javascript
			 function(previousValue, item, index, enumerable);
			 ```

			 - `previousValue` is the value returned by the last call to the iterator.
			 - `item` is the current item in the iteration.
			 - `index` is the current index in the iteration.
			 - `enumerable` is the enumerable object itself.

			 Return the new cumulative value.

			 In addition to the callback you can also pass an `initialValue`. An error
			 will be raised if you do not pass an initial value and the enumerator is
			 empty.

			 Note that unlike the other methods, this method does not allow you to
			 pass a target object to set as this for the callback. It's part of the
			 spec. Sorry.

			 @method reduce
			 @param {Function} callback The callback to execute
			 @param {Object} initialValue Initial value for the reduce
			 @param {String} reducerProperty internal use only.
			 @return {Object} The reduced value.
			 */
			reduce: function(callback, initialValue, reducerProperty) {
				if (typeof callback !== "function") { throw new TypeError(); }

				var ret = initialValue;

				this.forEach(function(item, i) {
					ret = callback.call(null, ret, item, i, this, reducerProperty);
				}, this);

				return ret;
			},

			/**
			 Invokes the named method on every object in the receiver that
			 implements it. This method corresponds to the implementation in
			 Prototype 1.6.

			 @method invoke
			 @param {String} methodName the name of the method
			 @param {Object...} args optional arguments to pass as well.
			 @return {Array} return values from calling invoke.
			 */
			invoke: function(methodName) {
				var args, ret = Ember.A();
				if (arguments.length>1) args = a_slice.call(arguments, 1);

				this.forEach(function(x, idx) {
					var method = x && x[methodName];
					if ('function' === typeof method) {
						ret[idx] = args ? method.apply(x, args) : method.call(x);
					}
				}, this);

				return ret;
			},

			/**
			 Simply converts the enumerable into a genuine array. The order is not
			 guaranteed. Corresponds to the method implemented by Prototype.

			 @method toArray
			 @return {Array} the enumerable as an array.
			 */
			toArray: function() {
				var ret = Ember.A();
				this.forEach(function(o, idx) { ret[idx] = o; });
				return ret ;
			},

			/**
			 Returns a copy of the array with all null and undefined elements removed.

			 ```javascript
			 var arr = ["a", null, "c", undefined];
			 arr.compact();  // ["a", "c"]
			 ```

			 @method compact
			 @return {Array} the array without null and undefined elements.
			 */
			compact: function() {
				return this.filter(function(value) { return value != null; });
			},

			/**
			 Returns a new enumerable that excludes the passed value. The default
			 implementation returns an array regardless of the receiver type unless
			 the receiver does not contain the value.

			 ```javascript
			 var arr = ["a", "b", "a", "c"];
			 arr.without("a");  // ["b", "c"]
			 ```

			 @method without
			 @param {Object} value
			 @return {Ember.Enumerable}
			 */
			without: function(value) {
				if (!this.contains(value)) return this; // nothing to do
				var ret = Ember.A();
				this.forEach(function(k) {
					if (k !== value) ret[ret.length] = k;
				}) ;
				return ret ;
			},

			/**
			 Returns a new enumerable that contains only unique values. The default
			 implementation returns an array regardless of the receiver type.

			 ```javascript
			 var arr = ["a", "a", "b", "b"];
			 arr.uniq();  // ["a", "b"]
			 ```

			 @method uniq
			 @return {Ember.Enumerable}
			 */
			uniq: function() {
				var ret = Ember.A();
				this.forEach(function(k) {
					if (a_indexOf(ret, k)<0) ret.push(k);
				});
				return ret;
			},

			/**
			 This property will trigger anytime the enumerable's content changes.
			 You can observe this property to be notified of changes to the enumerables
			 content.

			 For plain enumerables, this property is read only. `Ember.Array` overrides
			 this method.

			 @property []
			 @type Ember.Array
			 @return this
			 */
			'[]': Ember.computed(function(key, value) {
				return this;
			}),

			// ..........................................................
			// ENUMERABLE OBSERVERS
			//

			/**
			 Registers an enumerable observer. Must implement `Ember.EnumerableObserver`
			 mixin.

			 @method addEnumerableObserver
			 @param {Object} target
			 @param {Hash} [opts]
			 @return this
			 */
			addEnumerableObserver: function(target, opts) {
				var willChange = (opts && opts.willChange) || 'enumerableWillChange',
					didChange  = (opts && opts.didChange) || 'enumerableDidChange';

				var hasObservers = get(this, 'hasEnumerableObservers');
				if (!hasObservers) Ember.propertyWillChange(this, 'hasEnumerableObservers');
				Ember.addListener(this, '@enumerable:before', target, willChange);
				Ember.addListener(this, '@enumerable:change', target, didChange);
				if (!hasObservers) Ember.propertyDidChange(this, 'hasEnumerableObservers');
				return this;
			},

			/**
			 Removes a registered enumerable observer.

			 @method removeEnumerableObserver
			 @param {Object} target
			 @param {Hash} [opts]
			 @return this
			 */
			removeEnumerableObserver: function(target, opts) {
				var willChange = (opts && opts.willChange) || 'enumerableWillChange',
					didChange  = (opts && opts.didChange) || 'enumerableDidChange';

				var hasObservers = get(this, 'hasEnumerableObservers');
				if (hasObservers) Ember.propertyWillChange(this, 'hasEnumerableObservers');
				Ember.removeListener(this, '@enumerable:before', target, willChange);
				Ember.removeListener(this, '@enumerable:change', target, didChange);
				if (hasObservers) Ember.propertyDidChange(this, 'hasEnumerableObservers');
				return this;
			},

			/**
			 Becomes true whenever the array currently has observers watching changes
			 on the array.

			 @property hasEnumerableObservers
			 @type Boolean
			 */
			hasEnumerableObservers: Ember.computed(function() {
				return Ember.hasListeners(this, '@enumerable:change') || Ember.hasListeners(this, '@enumerable:before');
			}),


			/**
			 Invoke this method just before the contents of your enumerable will
			 change. You can either omit the parameters completely or pass the objects
			 to be removed or added if available or just a count.

			 @method enumerableContentWillChange
			 @param {Ember.Enumerable|Number} removing An enumerable of the objects to
			 be removed or the number of items to be removed.
			 @param {Ember.Enumerable|Number} adding An enumerable of the objects to be
			 added or the number of items to be added.
			 @chainable
			 */
			enumerableContentWillChange: function(removing, adding) {

				var removeCnt, addCnt, hasDelta;

				if ('number' === typeof removing) removeCnt = removing;
				else if (removing) removeCnt = get(removing, 'length');
				else removeCnt = removing = -1;

				if ('number' === typeof adding) addCnt = adding;
				else if (adding) addCnt = get(adding,'length');
				else addCnt = adding = -1;

				hasDelta = addCnt<0 || removeCnt<0 || addCnt-removeCnt!==0;

				if (removing === -1) removing = null;
				if (adding   === -1) adding   = null;

				Ember.propertyWillChange(this, '[]');
				if (hasDelta) Ember.propertyWillChange(this, 'length');
				Ember.sendEvent(this, '@enumerable:before', [this, removing, adding]);

				return this;
			},

			/**
			 Invoke this method when the contents of your enumerable has changed.
			 This will notify any observers watching for content changes. If your are
			 implementing an ordered enumerable (such as an array), also pass the
			 start and end values where the content changed so that it can be used to
			 notify range observers.

			 @method enumerableContentDidChange
			 @param {Number} [start] optional start offset for the content change.
			 For unordered enumerables, you should always pass -1.
			 @param {Ember.Enumerable|Number} removing An enumerable of the objects to
			 be removed or the number of items to be removed.
			 @param {Ember.Enumerable|Number} adding  An enumerable of the objects to
			 be added or the number of items to be added.
			 @chainable
			 */
			enumerableContentDidChange: function(removing, adding) {
				var removeCnt, addCnt, hasDelta;

				if ('number' === typeof removing) removeCnt = removing;
				else if (removing) removeCnt = get(removing, 'length');
				else removeCnt = removing = -1;

				if ('number' === typeof adding) addCnt = adding;
				else if (adding) addCnt = get(adding, 'length');
				else addCnt = adding = -1;

				hasDelta = addCnt<0 || removeCnt<0 || addCnt-removeCnt!==0;

				if (removing === -1) removing = null;
				if (adding   === -1) adding   = null;

				Ember.sendEvent(this, '@enumerable:change', [this, removing, adding]);
				if (hasDelta) Ember.propertyDidChange(this, 'length');
				Ember.propertyDidChange(this, '[]');

				return this ;
			}

		}) ;

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-runtime
		 */

// ..........................................................
// HELPERS
//

		var get = Ember.get, set = Ember.set, isNone = Ember.isNone, map = Ember.EnumerableUtils.map, cacheFor = Ember.cacheFor;

// ..........................................................
// ARRAY
//
		/**
		 This module implements Observer-friendly Array-like behavior. This mixin is
		 picked up by the Array class as well as other controllers, etc. that want to
		 appear to be arrays.

		 Unlike `Ember.Enumerable,` this mixin defines methods specifically for
		 collections that provide index-ordered access to their contents. When you
		 are designing code that needs to accept any kind of Array-like object, you
		 should use these methods instead of Array primitives because these will
		 properly notify observers of changes to the array.

		 Although these methods are efficient, they do add a layer of indirection to
		 your application so it is a good idea to use them only when you need the
		 flexibility of using both true JavaScript arrays and "virtual" arrays such
		 as controllers and collections.

		 You can use the methods defined in this module to access and modify array
		 contents in a KVO-friendly way. You can also be notified whenever the
		 membership of an array changes by changing the syntax of the property to
		 `.observes('*myProperty.[]')`.

		 To support `Ember.Array` in your own class, you must override two
		 primitives to use it: `replace()` and `objectAt()`.

		 Note that the Ember.Array mixin also incorporates the `Ember.Enumerable`
		 mixin. All `Ember.Array`-like objects are also enumerable.

		 @class Array
		 @namespace Ember
		 @uses Ember.Enumerable
		 @since Ember 0.9.0
		 */
		Ember.Array = Ember.Mixin.create(Ember.Enumerable, /** @scope Ember.Array.prototype */ {

			/**
			 Your array must support the `length` property. Your replace methods should
			 set this property whenever it changes.

			 @property {Number} length
			 */
			length: Ember.required(),

			/**
			 Returns the object at the given `index`. If the given `index` is negative
			 or is greater or equal than the array length, returns `undefined`.

			 This is one of the primitives you must implement to support `Ember.Array`.
			 If your object supports retrieving the value of an array item using `get()`
			 (i.e. `myArray.get(0)`), then you do not need to implement this method
			 yourself.

			 ```javascript
			 var arr = ['a', 'b', 'c', 'd'];
			 arr.objectAt(0);   // "a"
			 arr.objectAt(3);   // "d"
			 arr.objectAt(-1);  // undefined
			 arr.objectAt(4);   // undefined
			 arr.objectAt(5);   // undefined
			 ```

			 @method objectAt
			 @param {Number} idx The index of the item to return.
			 @return {*} item at index or undefined
			 */
			objectAt: function(idx) {
				if ((idx < 0) || (idx>=get(this, 'length'))) return undefined ;
				return get(this, idx);
			},

			/**
			 This returns the objects at the specified indexes, using `objectAt`.

			 ```javascript
			 var arr = ['a', 'b', 'c', 'd'];
			 arr.objectsAt([0, 1, 2]);  // ["a", "b", "c"]
			 arr.objectsAt([2, 3, 4]);  // ["c", "d", undefined]
			 ```

			 @method objectsAt
			 @param {Array} indexes An array of indexes of items to return.
			 @return {Array}
			 */
			objectsAt: function(indexes) {
				var self = this;
				return map(indexes, function(idx) { return self.objectAt(idx); });
			},

			// overrides Ember.Enumerable version
			nextObject: function(idx) {
				return this.objectAt(idx);
			},

			/**
			 This is the handler for the special array content property. If you get
			 this property, it will return this. If you set this property it a new
			 array, it will replace the current content.

			 This property overrides the default property defined in `Ember.Enumerable`.

			 @property []
			 @return this
			 */
			'[]': Ember.computed(function(key, value) {
				if (value !== undefined) this.replace(0, get(this, 'length'), value) ;
				return this ;
			}),

			firstObject: Ember.computed(function() {
				return this.objectAt(0);
			}),

			lastObject: Ember.computed(function() {
				return this.objectAt(get(this, 'length')-1);
			}),

			// optimized version from Enumerable
			contains: function(obj) {
				return this.indexOf(obj) >= 0;
			},

			// Add any extra methods to Ember.Array that are native to the built-in Array.
			/**
			 Returns a new array that is a slice of the receiver. This implementation
			 uses the observable array methods to retrieve the objects for the new
			 slice.

			 ```javascript
			 var arr = ['red', 'green', 'blue'];
			 arr.slice(0);       // ['red', 'green', 'blue']
			 arr.slice(0, 2);    // ['red', 'green']
			 arr.slice(1, 100);  // ['green', 'blue']
			 ```

			 @method slice
			 @param {Integer} beginIndex (Optional) index to begin slicing from.
			 @param {Integer} endIndex (Optional) index to end the slice at.
			 @return {Array} New array with specified slice
			 */
			slice: function(beginIndex, endIndex) {
				var ret = Ember.A();
				var length = get(this, 'length') ;
				if (isNone(beginIndex)) beginIndex = 0 ;
				if (isNone(endIndex) || (endIndex > length)) endIndex = length ;

				if (beginIndex < 0) beginIndex = length + beginIndex;
				if (endIndex < 0) endIndex = length + endIndex;

				while(beginIndex < endIndex) {
					ret[ret.length] = this.objectAt(beginIndex++) ;
				}
				return ret ;
			},

			/**
			 Returns the index of the given object's first occurrence.
			 If no `startAt` argument is given, the starting location to
			 search is 0. If it's negative, will count backward from
			 the end of the array. Returns -1 if no match is found.

			 ```javascript
			 var arr = ["a", "b", "c", "d", "a"];
			 arr.indexOf("a");       //  0
			 arr.indexOf("z");       // -1
			 arr.indexOf("a", 2);    //  4
			 arr.indexOf("a", -1);   //  4
			 arr.indexOf("b", 3);    // -1
			 arr.indexOf("a", 100);  // -1
			 ```

			 @method indexOf
			 @param {Object} object the item to search for
			 @param {Number} startAt optional starting location to search, default 0
			 @return {Number} index or -1 if not found
			 */
			indexOf: function(object, startAt) {
				var idx, len = get(this, 'length');

				if (startAt === undefined) startAt = 0;
				if (startAt < 0) startAt += len;

				for(idx=startAt;idx<len;idx++) {
					if (this.objectAt(idx) === object) return idx ;
				}
				return -1;
			},

			/**
			 Returns the index of the given object's last occurrence.
			 If no `startAt` argument is given, the search starts from
			 the last position. If it's negative, will count backward
			 from the end of the array. Returns -1 if no match is found.

			 ```javascript
			 var arr = ["a", "b", "c", "d", "a"];
			 arr.lastIndexOf("a");       //  4
			 arr.lastIndexOf("z");       // -1
			 arr.lastIndexOf("a", 2);    //  0
			 arr.lastIndexOf("a", -1);   //  4
			 arr.lastIndexOf("b", 3);    //  1
			 arr.lastIndexOf("a", 100);  //  4
			 ```

			 @method lastIndexOf
			 @param {Object} object the item to search for
			 @param {Number} startAt optional starting location to search, default 0
			 @return {Number} index or -1 if not found
			 */
			lastIndexOf: function(object, startAt) {
				var idx, len = get(this, 'length');

				if (startAt === undefined || startAt >= len) startAt = len-1;
				if (startAt < 0) startAt += len;

				for(idx=startAt;idx>=0;idx--) {
					if (this.objectAt(idx) === object) return idx ;
				}
				return -1;
			},

			// ..........................................................
			// ARRAY OBSERVERS
			//

			/**
			 Adds an array observer to the receiving array. The array observer object
			 normally must implement two methods:

			 * `arrayWillChange(observedObj, start, removeCount, addCount)` - This method will be
			 called just before the array is modified.
			 * `arrayDidChange(observedObj, start, removeCount, addCount)` - This method will be
			 called just after the array is modified.

			 Both callbacks will be passed the observed object, starting index of the
			 change as well a a count of the items to be removed and added. You can use
			 these callbacks to optionally inspect the array during the change, clear
			 caches, or do any other bookkeeping necessary.

			 In addition to passing a target, you can also include an options hash
			 which you can use to override the method names that will be invoked on the
			 target.

			 @method addArrayObserver
			 @param {Object} target The observer object.
			 @param {Hash} opts Optional hash of configuration options including
			 `willChange` and `didChange` option.
			 @return {Ember.Array} receiver
			 */
			addArrayObserver: function(target, opts) {
				var willChange = (opts && opts.willChange) || 'arrayWillChange',
					didChange  = (opts && opts.didChange) || 'arrayDidChange';

				var hasObservers = get(this, 'hasArrayObservers');
				if (!hasObservers) Ember.propertyWillChange(this, 'hasArrayObservers');
				Ember.addListener(this, '@array:before', target, willChange);
				Ember.addListener(this, '@array:change', target, didChange);
				if (!hasObservers) Ember.propertyDidChange(this, 'hasArrayObservers');
				return this;
			},

			/**
			 Removes an array observer from the object if the observer is current
			 registered. Calling this method multiple times with the same object will
			 have no effect.

			 @method removeArrayObserver
			 @param {Object} target The object observing the array.
			 @param {Hash} opts Optional hash of configuration options including
			 `willChange` and `didChange` option.
			 @return {Ember.Array} receiver
			 */
			removeArrayObserver: function(target, opts) {
				var willChange = (opts && opts.willChange) || 'arrayWillChange',
					didChange  = (opts && opts.didChange) || 'arrayDidChange';

				var hasObservers = get(this, 'hasArrayObservers');
				if (hasObservers) Ember.propertyWillChange(this, 'hasArrayObservers');
				Ember.removeListener(this, '@array:before', target, willChange);
				Ember.removeListener(this, '@array:change', target, didChange);
				if (hasObservers) Ember.propertyDidChange(this, 'hasArrayObservers');
				return this;
			},

			/**
			 Becomes true whenever the array currently has observers watching changes
			 on the array.

			 @property Boolean
			 */
			hasArrayObservers: Ember.computed(function() {
				return Ember.hasListeners(this, '@array:change') || Ember.hasListeners(this, '@array:before');
			}),

			/**
			 If you are implementing an object that supports `Ember.Array`, call this
			 method just before the array content changes to notify any observers and
			 invalidate any related properties. Pass the starting index of the change
			 as well as a delta of the amounts to change.

			 @method arrayContentWillChange
			 @param {Number} startIdx The starting index in the array that will change.
			 @param {Number} removeAmt The number of items that will be removed. If you
			 pass `null` assumes 0
			 @param {Number} addAmt The number of items that will be added. If you
			 pass `null` assumes 0.
			 @return {Ember.Array} receiver
			 */
			arrayContentWillChange: function(startIdx, removeAmt, addAmt) {

				// if no args are passed assume everything changes
				if (startIdx===undefined) {
					startIdx = 0;
					removeAmt = addAmt = -1;
				} else {
					if (removeAmt === undefined) removeAmt=-1;
					if (addAmt    === undefined) addAmt=-1;
				}

				// Make sure the @each proxy is set up if anyone is observing @each
				if (Ember.isWatching(this, '@each')) { get(this, '@each'); }

				Ember.sendEvent(this, '@array:before', [this, startIdx, removeAmt, addAmt]);

				var removing, lim;
				if (startIdx>=0 && removeAmt>=0 && get(this, 'hasEnumerableObservers')) {
					removing = [];
					lim = startIdx+removeAmt;
					for(var idx=startIdx;idx<lim;idx++) removing.push(this.objectAt(idx));
				} else {
					removing = removeAmt;
				}

				this.enumerableContentWillChange(removing, addAmt);

				return this;
			},

			/**
			 If you are implementing an object that supports `Ember.Array`, call this
			 method just after the array content changes to notify any observers and
			 invalidate any related properties. Pass the starting index of the change
			 as well as a delta of the amounts to change.

			 @method arrayContentDidChange
			 @param {Number} startIdx The starting index in the array that did change.
			 @param {Number} removeAmt The number of items that were removed. If you
			 pass `null` assumes 0
			 @param {Number} addAmt The number of items that were added. If you
			 pass `null` assumes 0.
			 @return {Ember.Array} receiver
			 */
			arrayContentDidChange: function(startIdx, removeAmt, addAmt) {

				// if no args are passed assume everything changes
				if (startIdx===undefined) {
					startIdx = 0;
					removeAmt = addAmt = -1;
				} else {
					if (removeAmt === undefined) removeAmt=-1;
					if (addAmt    === undefined) addAmt=-1;
				}

				var adding, lim;
				if (startIdx>=0 && addAmt>=0 && get(this, 'hasEnumerableObservers')) {
					adding = [];
					lim = startIdx+addAmt;
					for(var idx=startIdx;idx<lim;idx++) adding.push(this.objectAt(idx));
				} else {
					adding = addAmt;
				}

				this.enumerableContentDidChange(removeAmt, adding);
				Ember.sendEvent(this, '@array:change', [this, startIdx, removeAmt, addAmt]);

				var length      = get(this, 'length'),
					cachedFirst = cacheFor(this, 'firstObject'),
					cachedLast  = cacheFor(this, 'lastObject');
				if (this.objectAt(0) !== cachedFirst) {
					Ember.propertyWillChange(this, 'firstObject');
					Ember.propertyDidChange(this, 'firstObject');
				}
				if (this.objectAt(length-1) !== cachedLast) {
					Ember.propertyWillChange(this, 'lastObject');
					Ember.propertyDidChange(this, 'lastObject');
				}

				return this;
			},

			// ..........................................................
			// ENUMERATED PROPERTIES
			//

			/**
			 Returns a special object that can be used to observe individual properties
			 on the array. Just get an equivalent property on this object and it will
			 return an enumerable that maps automatically to the named key on the
			 member objects.

			 If you merely want to watch for any items being added or removed to the array,
			 use the `[]` property instead of `@each`.

			 @property @each
			 */
			'@each': Ember.computed(function() {
				if (!this.__each) this.__each = new Ember.EachProxy(this);
				return this.__each;
			})

		}) ;

	})();



	(function() {
		var get = Ember.get,
			set = Ember.set,
			guidFor = Ember.guidFor,
			metaFor = Ember.meta,
			addBeforeObserver = Ember.addBeforeObserver,
			removeBeforeObserver = Ember.removeBeforeObserver,
			addObserver = Ember.addObserver,
			removeObserver = Ember.removeObserver,
			ComputedProperty = Ember.ComputedProperty,
			a_slice = [].slice,
			o_create = Ember.create,
			forEach = Ember.EnumerableUtils.forEach,
		// Here we explicitly don't allow `@each.foo`; it would require some special
		// testing, but there's no particular reason why it should be disallowed.
			eachPropertyPattern = /^(.*)\.@each\.(.*)/,
			doubleEachPropertyPattern = /(.*\.@each){2,}/;

		/*
		 Tracks changes to dependent arrays, as well as to properties of items in
		 dependent arrays.

		 @class DependentArraysObserver
		 */
		function DependentArraysObserver(callbacks, cp, instanceMeta, context, propertyName, sugarMeta) {
			// user specified callbacks for `addedItem` and `removedItem`
			this.callbacks = callbacks;

			// the computed property: remember these are shared across instances
			this.cp = cp;

			// the ReduceComputedPropertyInstanceMeta this DependentArraysObserver is
			// associated with
			this.instanceMeta = instanceMeta;

			// A map of array guids to dependentKeys, for the given context.  We track
			// this because we want to set up the computed property potentially before the
			// dependent array even exists, but when the array observer fires, we lack
			// enough context to know what to update: we can recover that context by
			// getting the dependentKey.
			this.dependentKeysByGuid = {};

			// a map of dependent array guids -> Ember.TrackedArray instances.  We use
			// this to lazily recompute indexes for item property observers.
			this.trackedArraysByGuid = {};

			// This is used to coalesce item changes from property observers.
			this.changedItems = {};
		}

		function ItemPropertyObserverContext (dependentArray, index, trackedArray) {


			this.dependentArray = dependentArray;
			this.index = index;
			this.item = dependentArray.objectAt(index);
			this.trackedArray = trackedArray;
			this.beforeObserver = null;
			this.observer = null;
		}

		DependentArraysObserver.prototype = {
			setValue: function (newValue) {
				this.instanceMeta.setValue(newValue);
			},
			getValue: function () {
				return this.instanceMeta.getValue();
			},

			setupObservers: function (dependentArray, dependentKey) {


				this.dependentKeysByGuid[guidFor(dependentArray)] = dependentKey;

				dependentArray.addArrayObserver(this, {
					willChange: 'dependentArrayWillChange',
					didChange: 'dependentArrayDidChange'
				});

				if (this.cp._itemPropertyKeys[dependentKey]) {
					this.setupPropertyObservers(dependentKey, this.cp._itemPropertyKeys[dependentKey]);
				}
			},

			teardownObservers: function (dependentArray, dependentKey) {
				var itemPropertyKeys = this.cp._itemPropertyKeys[dependentKey] || [];

				delete this.dependentKeysByGuid[guidFor(dependentArray)];

				this.teardownPropertyObservers(dependentKey, itemPropertyKeys);

				dependentArray.removeArrayObserver(this, {
					willChange: 'dependentArrayWillChange',
					didChange: 'dependentArrayDidChange'
				});
			},

			setupPropertyObservers: function (dependentKey, itemPropertyKeys) {
				var dependentArray = get(this.instanceMeta.context, dependentKey),
					length = get(dependentArray, 'length'),
					observerContexts = new Array(length);

				this.resetTransformations(dependentKey, observerContexts);

				forEach(dependentArray, function (item, index) {
					var observerContext = this.createPropertyObserverContext(dependentArray, index, this.trackedArraysByGuid[dependentKey]);
					observerContexts[index] = observerContext;

					forEach(itemPropertyKeys, function (propertyKey) {
						addBeforeObserver(item, propertyKey, this, observerContext.beforeObserver);
						addObserver(item, propertyKey, this, observerContext.observer);
					}, this);
				}, this);
			},

			teardownPropertyObservers: function (dependentKey, itemPropertyKeys) {
				var dependentArrayObserver = this,
					trackedArray = this.trackedArraysByGuid[dependentKey],
					beforeObserver,
					observer,
					item;

				if (!trackedArray) { return; }

				trackedArray.apply(function (observerContexts, offset, operation) {
					if (operation === Ember.TrackedArray.DELETE) { return; }

					forEach(observerContexts, function (observerContext) {
						beforeObserver = observerContext.beforeObserver;
						observer = observerContext.observer;
						item = observerContext.item;

						forEach(itemPropertyKeys, function (propertyKey) {
							removeBeforeObserver(item, propertyKey, dependentArrayObserver, beforeObserver);
							removeObserver(item, propertyKey, dependentArrayObserver, observer);
						});
					});
				});
			},

			createPropertyObserverContext: function (dependentArray, index, trackedArray) {
				var observerContext = new ItemPropertyObserverContext(dependentArray, index, trackedArray);

				this.createPropertyObserver(observerContext);

				return observerContext;
			},

			createPropertyObserver: function (observerContext) {
				var dependentArrayObserver = this;

				observerContext.beforeObserver = function (obj, keyName) {
					dependentArrayObserver.updateIndexes(observerContext.trackedArray, observerContext.dependentArray);
					return dependentArrayObserver.itemPropertyWillChange(obj, keyName, observerContext.dependentArray, observerContext.index);
				};
				observerContext.observer = function (obj, keyName) {
					return dependentArrayObserver.itemPropertyDidChange(obj, keyName, observerContext.dependentArray, observerContext.index);
				};
			},

			resetTransformations: function (dependentKey, observerContexts) {
				this.trackedArraysByGuid[dependentKey] = new Ember.TrackedArray(observerContexts);
			},

			addTransformation: function (dependentKey, index, newItems) {
				var trackedArray = this.trackedArraysByGuid[dependentKey];
				if (trackedArray) {
					trackedArray.addItems(index, newItems);
				}
			},

			removeTransformation: function (dependentKey, index, removedCount) {
				var trackedArray = this.trackedArraysByGuid[dependentKey];

				if (trackedArray) {
					return trackedArray.removeItems(index, removedCount);
				}

				return [];
			},

			updateIndexes: function (trackedArray, array) {
				var length = get(array, 'length');
				// OPTIMIZE: we could stop updating once we hit the object whose observer
				// fired; ie partially apply the transformations
				trackedArray.apply(function (observerContexts, offset, operation) {
					// we don't even have observer contexts for removed items, even if we did,
					// they no longer have any index in the array
					if (operation === Ember.TrackedArray.DELETE) { return; }
					if (operation === Ember.TrackedArray.RETAIN && observerContexts.length === length && offset === 0) {
						// If we update many items we don't want to walk the array each time: we
						// only need to update the indexes at most once per run loop.
						return;
					}

					forEach(observerContexts, function (context, index) {
						context.index = index + offset;
					});
				});
			},

			dependentArrayWillChange: function (dependentArray, index, removedCount, addedCount) {
				var removedItem = this.callbacks.removedItem,
					changeMeta,
					guid = guidFor(dependentArray),
					dependentKey = this.dependentKeysByGuid[guid],
					itemPropertyKeys = this.cp._itemPropertyKeys[dependentKey] || [],
					item,
					itemIndex,
					sliceIndex,
					observerContexts;

				observerContexts = this.removeTransformation(dependentKey, index, removedCount);


				function removeObservers(propertyKey) {
					removeBeforeObserver(item, propertyKey, this, observerContexts[sliceIndex].beforeObserver);
					removeObserver(item, propertyKey, this, observerContexts[sliceIndex].observer);
				}

				for (sliceIndex = removedCount - 1; sliceIndex >= 0; --sliceIndex) {
					itemIndex = index + sliceIndex;
					item = dependentArray.objectAt(itemIndex);

					forEach(itemPropertyKeys, removeObservers, this);

					changeMeta = createChangeMeta(dependentArray, item, itemIndex, this.instanceMeta.propertyName, this.cp);
					this.setValue( removedItem.call(
						this.instanceMeta.context, this.getValue(), item, changeMeta, this.instanceMeta.sugarMeta));
				}
			},

			dependentArrayDidChange: function (dependentArray, index, removedCount, addedCount) {
				var addedItem = this.callbacks.addedItem,
					guid = guidFor(dependentArray),
					dependentKey = this.dependentKeysByGuid[guid],
					observerContexts = new Array(addedCount),
					itemPropertyKeys = this.cp._itemPropertyKeys[dependentKey],
					changeMeta,
					observerContext;

				forEach(dependentArray.slice(index, index + addedCount), function (item, sliceIndex) {
					if (itemPropertyKeys) {
						observerContext =
							observerContexts[sliceIndex] =
								this.createPropertyObserverContext(dependentArray, index + sliceIndex, this.trackedArraysByGuid[dependentKey]);
						forEach(itemPropertyKeys, function (propertyKey) {
							addBeforeObserver(item, propertyKey, this, observerContext.beforeObserver);
							addObserver(item, propertyKey, this, observerContext.observer);
						}, this);
					}

					changeMeta = createChangeMeta(dependentArray, item, index + sliceIndex, this.instanceMeta.propertyName, this.cp);
					this.setValue( addedItem.call(
						this.instanceMeta.context, this.getValue(), item, changeMeta, this.instanceMeta.sugarMeta));
				}, this);

				this.addTransformation(dependentKey, index, observerContexts);
			},

			itemPropertyWillChange: function (obj, keyName, array, index) {
				var guid = guidFor(obj);

				if (!this.changedItems[guid]) {
					this.changedItems[guid] = {
						array:          array,
						index:          index,
						obj:            obj,
						previousValues: {}
					};
				}

				this.changedItems[guid].previousValues[keyName] = get(obj, keyName);
			},

			itemPropertyDidChange: function(obj, keyName, array, index) {
				Ember.run.once(this, 'flushChanges');
			},

			flushChanges: function() {
				var changedItems = this.changedItems, key, c, changeMeta;
				for (key in changedItems) {
					c = changedItems[key];
					changeMeta = createChangeMeta(c.array, c.obj, c.index, this.instanceMeta.propertyName, this.cp, c.previousValues);
					this.setValue(
						this.callbacks.removedItem.call(this.instanceMeta.context, this.getValue(), c.obj, changeMeta, this.instanceMeta.sugarMeta));
					this.setValue(
						this.callbacks.addedItem.call(this.instanceMeta.context, this.getValue(), c.obj, changeMeta, this.instanceMeta.sugarMeta));
				}
				this.changedItems = {};
			}
		};

		function createChangeMeta(dependentArray, item, index, propertyName, property, previousValues) {
			var meta = {
				arrayChanged: dependentArray,
				index: index,
				item: item,
				propertyName: propertyName,
				property: property
			};

			if (previousValues) {
				// previous values only available for item property changes
				meta.previousValues = previousValues;
			}

			return meta;
		}

		function addItems (dependentArray, callbacks, cp, propertyName, meta) {
			forEach(dependentArray, function (item, index) {
				meta.setValue( callbacks.addedItem.call(
					this, meta.getValue(), item, createChangeMeta(dependentArray, item, index, propertyName, cp), meta.sugarMeta));
			}, this);
		}

		function reset(cp, propertyName) {
			var callbacks = cp._callbacks(),
				meta;

			if (cp._hasInstanceMeta(this, propertyName)) {
				meta = cp._instanceMeta(this, propertyName);
				meta.setValue(cp.resetValue(meta.getValue()));
			} else {
				meta = cp._instanceMeta(this, propertyName);
			}

			if (cp.options.initialize) {
				cp.options.initialize.call(this, meta.getValue(), { property: cp, propertyName: propertyName }, meta.sugarMeta);
			}
		}

		function ReduceComputedPropertyInstanceMeta(context, propertyName, initialValue) {
			this.context = context;
			this.propertyName = propertyName;
			this.cache = metaFor(context).cache;

			this.dependentArrays = {};
			this.sugarMeta = {};

			this.initialValue = initialValue;
		}

		ReduceComputedPropertyInstanceMeta.prototype = {
			getValue: function () {
				if (this.propertyName in this.cache) {
					return this.cache[this.propertyName];
				} else {
					return this.initialValue;
				}
			},

			setValue: function(newValue) {
				// This lets sugars force a recomputation, handy for very simple
				// implementations of eg max.
				if (newValue !== undefined) {
					this.cache[this.propertyName] = newValue;
				} else {
					delete this.cache[this.propertyName];
				}
			}
		};

		/**
		 A computed property whose dependent keys are arrays and which is updated with
		 "one at a time" semantics.

		 @class ReduceComputedProperty
		 @namespace Ember
		 @extends Ember.ComputedProperty
		 @constructor
		 */
		function ReduceComputedProperty(options) {
			var cp = this;

			this.options = options;
			this._instanceMetas = {};

			this._dependentKeys = null;
			// A map of dependentKey -> [itemProperty, ...] that tracks what properties of
			// items in the array we must track to update this property.
			this._itemPropertyKeys = {};
			this._previousItemPropertyKeys = {};

			this.readOnly();
			this.cacheable();

			this.recomputeOnce = function(propertyName) {
				// What we really want to do is coalesce by <cp, propertyName>.
				// We need a form of `scheduleOnce` that accepts an arbitrary token to
				// coalesce by, in addition to the target and method.
				Ember.run.once(this, recompute, propertyName);
			};
			var recompute = function(propertyName) {
				var dependentKeys = cp._dependentKeys,
					meta = cp._instanceMeta(this, propertyName),
					callbacks = cp._callbacks();

				reset.call(this, cp, propertyName);

				forEach(cp._dependentKeys, function (dependentKey) {
					var dependentArray = get(this, dependentKey),
						previousDependentArray = meta.dependentArrays[dependentKey];

					if (dependentArray === previousDependentArray) {
						// The array may be the same, but our item property keys may have
						// changed, so we set them up again.  We can't easily tell if they've
						// changed: the array may be the same object, but with different
						// contents.
						if (cp._previousItemPropertyKeys[dependentKey]) {
							delete cp._previousItemPropertyKeys[dependentKey];
							meta.dependentArraysObserver.setupPropertyObservers(dependentKey, cp._itemPropertyKeys[dependentKey]);
						}
					} else {
						meta.dependentArrays[dependentKey] = dependentArray;

						if (previousDependentArray) {
							meta.dependentArraysObserver.teardownObservers(previousDependentArray, dependentKey);
						}

						if (dependentArray) {
							meta.dependentArraysObserver.setupObservers(dependentArray, dependentKey);
						}
					}
				}, this);

				forEach(cp._dependentKeys, function(dependentKey) {
					var dependentArray = get(this, dependentKey);
					if (dependentArray) {
						addItems.call(this, dependentArray, callbacks, cp, propertyName, meta);
					}
				}, this);
			};

			this.func = function (propertyName) {


				recompute.call(this, propertyName);

				return cp._instanceMeta(this, propertyName).getValue();
			};
		}

		Ember.ReduceComputedProperty = ReduceComputedProperty;
		ReduceComputedProperty.prototype = o_create(ComputedProperty.prototype);

		function defaultCallback(computedValue) {
			return computedValue;
		}

		ReduceComputedProperty.prototype._callbacks = function () {
			if (!this.callbacks) {
				var options = this.options;
				this.callbacks = {
					removedItem: options.removedItem || defaultCallback,
					addedItem: options.addedItem || defaultCallback
				};
			}
			return this.callbacks;
		};

		ReduceComputedProperty.prototype._hasInstanceMeta = function (context, propertyName) {
			var guid = guidFor(context),
				key = guid + ':' + propertyName;

			return !!this._instanceMetas[key];
		};

		ReduceComputedProperty.prototype._instanceMeta = function (context, propertyName) {
			var guid = guidFor(context),
				key = guid + ':' + propertyName,
				meta = this._instanceMetas[key];

			if (!meta) {
				meta = this._instanceMetas[key] = new ReduceComputedPropertyInstanceMeta(context, propertyName, this.initialValue());
				meta.dependentArraysObserver = new DependentArraysObserver(this._callbacks(), this, meta, context, propertyName, meta.sugarMeta);
			}

			return meta;
		};

		ReduceComputedProperty.prototype.initialValue = function () {
			switch (typeof this.options.initialValue) {
				case 'undefined':
					throw new Error("reduce computed properties require an initial value: did you forget to pass one to Ember.reduceComputed?");
				case  'function':
					return this.options.initialValue();
				default:
					return this.options.initialValue;
			}
		};

		ReduceComputedProperty.prototype.resetValue = function (value) {
			return this.initialValue();
		};

		ReduceComputedProperty.prototype.itemPropertyKey = function (dependentArrayKey, itemPropertyKey) {
			this._itemPropertyKeys[dependentArrayKey] = this._itemPropertyKeys[dependentArrayKey] || [];
			this._itemPropertyKeys[dependentArrayKey].push(itemPropertyKey);
		};

		ReduceComputedProperty.prototype.clearItemPropertyKeys = function (dependentArrayKey) {
			if (this._itemPropertyKeys[dependentArrayKey]) {
				this._previousItemPropertyKeys[dependentArrayKey] = this._itemPropertyKeys[dependentArrayKey];
				this._itemPropertyKeys[dependentArrayKey] = [];
			}
		};

		ReduceComputedProperty.prototype.property = function () {
			var cp = this,
				args = a_slice.call(arguments),
				propertyArgs = [],
				match,
				dependentArrayKey,
				itemPropertyKey;

			forEach(a_slice.call(arguments), function (dependentKey) {
				if (doubleEachPropertyPattern.test(dependentKey)) {
					throw new Error("Nested @each properties not supported: " + dependentKey);
				} else if (match = eachPropertyPattern.exec(dependentKey)) {
					dependentArrayKey = match[1];
					itemPropertyKey = match[2];
					cp.itemPropertyKey(dependentArrayKey, itemPropertyKey);
					propertyArgs.push(dependentArrayKey);
				} else {
					propertyArgs.push(dependentKey);
				}
			});

			return ComputedProperty.prototype.property.apply(this, propertyArgs);
		};

		/**
		 Creates a computed property which operates on dependent arrays and
		 is updated with "one at a time" semantics. When items are added or
		 removed from the dependent array(s) a reduce computed only operates
		 on the change instead of re-evaluating the entire array.

		 If there are more than one arguments the first arguments are
		 considered to be dependent property keys. The last argument is
		 required to be an options object. The options object can have the
		 following four properties.

		 `initialValue` - A value or function that will be used as the initial
		 value for the computed. If this property is a function the result of calling
		 the function will be used as the initial value. This property is required.

		 `initialize` - An optional initialize function. Typically this will be used
		 to set up state on the instanceMeta object.

		 `removedItem` - A function that is called each time an element is removed
		 from the array.

		 `addedItem` - A function that is called each time an element is added to
		 the array.


		 The `initialize` function has the following signature:

		 ```javascript
		 function (initialValue, changeMeta, instanceMeta)
		 ```

		 `initialValue` - The value of the `initialValue` property from the
		 options object.

		 `changeMeta` - An object which contains meta information about the
		 computed. It contains the following properties:

		 - `property` the computed property
		 - `propertyName` the name of the property on the object

		 `instanceMeta` - An object that can be used to store meta
		 information needed for calculating your computed. For example a
		 unique computed might use this to store the number of times a given
		 element is found in the dependent array.


		 The `removedItem` and `addedItem` functions both have the following signature:

		 ```javascript
		 function (accumulatedValue, item, changeMeta, instanceMeta)
		 ```

		 `accumulatedValue` - The value returned from the last time
		 `removedItem` or `addedItem` was called or `initialValue`.

		 `item` - the element added or removed from the array

		 `changeMeta` - An object which contains meta information about the
		 change. It contains the following properties:

		 - `property` the computed property
		 - `propertyName` the name of the property on the object
		 - `index` the index of the added or removed item
		 - `item` the added or removed item: this is exactly the same as
		 the second arg
		 - `arrayChanged` the array that triggered the change. Can be
		 useful when depending on multiple arrays.

		 For property changes triggered on an item property change (when
		 depKey is something like `someArray.@each.someProperty`),
		 `changeMeta` will also contain the following property:

		 - `previousValues` an object whose keys are the properties that changed on
		 the item, and whose values are the item's previous values.

		 `previousValues` is important Ember coalesces item property changes via
		 Ember.run.once. This means that by the time removedItem gets called, item has
		 the new values, but you may need the previous value (eg for sorting &
		 filtering).

		 `instanceMeta` - An object that can be used to store meta
		 information needed for calculating your computed. For example a
		 unique computed might use this to store the number of times a given
		 element is found in the dependent array.

		 The `removedItem` and `addedItem` functions should return the accumulated
		 value. It is acceptable to not return anything (ie return undefined)
		 to invalidate the computation. This is generally not a good idea for
		 arrayComputed but it's used in eg max and min.

		 Example

		 ```javascript
		 Ember.computed.max = function (dependentKey) {
    return Ember.reduceComputed.call(null, dependentKey, {
      initialValue: -Infinity,

      addedItem: function (accumulatedValue, item, changeMeta, instanceMeta) {
        return Math.max(accumulatedValue, item);
      },

      removedItem: function (accumulatedValue, item, changeMeta, instanceMeta) {
        if (item < accumulatedValue) {
          return accumulatedValue;
        }
      }
    });
  };
		 ```

		 @method reduceComputed
		 @for Ember
		 @param {String} [dependentKeys*]
		 @param {Object} options
		 @returns {Ember.ComputedProperty}
		 */
		Ember.reduceComputed = function (options) {
			var args;

			if (arguments.length > 1) {
				args = a_slice.call(arguments, 0, -1);
				options = a_slice.call(arguments, -1)[0];
			}

			if (typeof options !== "object") {
				throw new Error("Reduce Computed Property declared without an options hash");
			}

			if (!options.initialValue) {
				throw new Error("Reduce Computed Property declared without an initial value");
			}

			var cp = new ReduceComputedProperty(options);

			if (args) {
				cp.property.apply(cp, args);
			}

			return cp;
		};

	})();



	(function() {
		var ReduceComputedProperty = Ember.ReduceComputedProperty,
			a_slice = [].slice,
			o_create = Ember.create,
			forEach = Ember.EnumerableUtils.forEach;

		function ArrayComputedProperty() {
			var cp = this;

			ReduceComputedProperty.apply(this, arguments);

			this.func = (function(reduceFunc) {
				return function (propertyName) {
					if (!cp._hasInstanceMeta(this, propertyName)) {
						// When we recompute an array computed property, we need already
						// retrieved arrays to be updated; we can't simply empty the cache and
						// hope the array is re-retrieved.
						forEach(cp._dependentKeys, function(dependentKey) {
							Ember.addObserver(this, dependentKey, function() {
								cp.recomputeOnce.call(this, propertyName);
							});
						}, this);
					}

					return reduceFunc.apply(this, arguments);
				};
			})(this.func);

			return this;
		}
		Ember.ArrayComputedProperty = ArrayComputedProperty;
		ArrayComputedProperty.prototype = o_create(ReduceComputedProperty.prototype);
		ArrayComputedProperty.prototype.initialValue = function () {
			return Ember.A();
		};
		ArrayComputedProperty.prototype.resetValue = function (array) {
			array.clear();
			return array;
		};

		/**
		 Creates a computed property which operates on dependent arrays and
		 is updated with "one at a time" semantics. When items are added or
		 removed from the dependent array(s) an array computed only operates
		 on the change instead of re-evaluating the entire array. This should
		 return an array, if you'd like to use "one at a time" semantics and
		 compute some value other then an array look at
		 `Ember.reduceComputed`.

		 If there are more than one arguments the first arguments are
		 considered to be dependent property keys. The last argument is
		 required to be an options object. The options object can have the
		 following three properties.

		 `initialize` - An optional initialize function. Typically this will be used
		 to set up state on the instanceMeta object.

		 `removedItem` - A function that is called each time an element is
		 removed from the array.

		 `addedItem` - A function that is called each time an element is
		 added to the array.


		 The `initialize` function has the following signature:

		 ```javascript
		 function (array, changeMeta, instanceMeta)
		 ```

		 `array` - The initial value of the arrayComputed, an empty array.

		 `changeMeta` - An object which contains meta information about the
		 computed. It contains the following properties:

		 - `property` the computed property
		 - `propertyName` the name of the property on the object

		 `instanceMeta` - An object that can be used to store meta
		 information needed for calculating your computed. For example a
		 unique computed might use this to store the number of times a given
		 element is found in the dependent array.


		 The `removedItem` and `addedItem` functions both have the following signature:

		 ```javascript
		 function (accumulatedValue, item, changeMeta, instanceMeta)
		 ```

		 `accumulatedValue` - The value returned from the last time
		 `removedItem` or `addedItem` was called or an empty array.

		 `item` - the element added or removed from the array

		 `changeMeta` - An object which contains meta information about the
		 change. It contains the following properties:

		 - `property` the computed property
		 - `propertyName` the name of the property on the object
		 - `index` the index of the added or removed item
		 - `item` the added or removed item: this is exactly the same as
		 the second arg
		 - `arrayChanged` the array that triggered the change. Can be
		 useful when depending on multiple arrays.

		 For property changes triggered on an item property change (when
		 depKey is something like `someArray.@each.someProperty`),
		 `changeMeta` will also contain the following property:

		 - `previousValues` an object whose keys are the properties that changed on
		 the item, and whose values are the item's previous values.

		 `previousValues` is important Ember coalesces item property changes via
		 Ember.run.once. This means that by the time removedItem gets called, item has
		 the new values, but you may need the previous value (eg for sorting &
		 filtering).

		 `instanceMeta` - An object that can be used to store meta
		 information needed for calculating your computed. For example a
		 unique computed might use this to store the number of times a given
		 element is found in the dependent array.

		 The `removedItem` and `addedItem` functions should return the accumulated
		 value. It is acceptable to not return anything (ie return undefined)
		 to invalidate the computation. This is generally not a good idea for
		 arrayComputed but it's used in eg max and min.

		 Example

		 ```javascript
		 Ember.computed.map = function(dependentKey, callback) {
    var options = {
      addedItem: function(array, item, changeMeta, instanceMeta) {
        var mapped = callback(item);
        array.insertAt(changeMeta.index, mapped);
        return array;
      },
      removedItem: function(array, item, changeMeta, instanceMeta) {
        array.removeAt(changeMeta.index, 1);
        return array;
      }
    };

    return Ember.arrayComputed(dependentKey, options);
  };
		 ```

		 @method arrayComputed
		 @for Ember
		 @param {String} [dependentKeys*]
		 @param {Object} options
		 @returns {Ember.ComputedProperty}
		 */
		Ember.arrayComputed = function (options) {
			var args;

			if (arguments.length > 1) {
				args = a_slice.call(arguments, 0, -1);
				options = a_slice.call(arguments, -1)[0];
			}

			if (typeof options !== "object") {
				throw new Error("Array Computed Property declared without an options hash");
			}

			var cp = new ArrayComputedProperty(options);

			if (args) {
				cp.property.apply(cp, args);
			}

			return cp;
		};

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-runtime
		 */

		var get = Ember.get,
			set = Ember.set,
			guidFor = Ember.guidFor,
			merge = Ember.merge,
			a_slice = [].slice,
			forEach = Ember.EnumerableUtils.forEach,
			map = Ember.EnumerableUtils.map;

		/**
		 A computed property that calculates the maximum value in the
		 dependent array. This will return `-Infinity` when the dependent
		 array is empty.

		 Example

		 ```javascript
		 App.Person = Ember.Object.extend({
    childAges: Ember.computed.mapBy('children', 'age'),
    maxChildAge: Ember.computed.max('childAges')
  });

		 var lordByron = App.Person.create({children: []});
		 lordByron.get('maxChildAge'); // -Infinity
		 lordByron.get('children').pushObject({name: 'Augusta Ada Byron', age: 7});
		 lordByron.get('maxChildAge'); // 7
		 lordByron.get('children').pushObjects([{name: 'Allegra Byron', age: 5}, {name: 'Elizabeth Medora Leigh', age: 8}]);
		 lordByron.get('maxChildAge'); // 8
		 ```

		 @method computed.max
		 @for Ember
		 @param {String} dependentKey
		 @return {Ember.ComputedProperty} computes the largest value in the dependentKey's array
		 */
		Ember.computed.max = function (dependentKey) {
			return Ember.reduceComputed.call(null, dependentKey, {
				initialValue: -Infinity,

				addedItem: function (accumulatedValue, item, changeMeta, instanceMeta) {
					return Math.max(accumulatedValue, item);
				},

				removedItem: function (accumulatedValue, item, changeMeta, instanceMeta) {
					if (item < accumulatedValue) {
						return accumulatedValue;
					}
				}
			});
		};

		/**
		 A computed property that calculates the minimum value in the
		 dependent array. This will return `Infinity` when the dependent
		 array is empty.

		 Example

		 ```javascript
		 App.Person = Ember.Object.extend({
    childAges: Ember.computed.mapBy('children', 'age'),
    minChildAge: Ember.computed.min('childAges')
  });

		 var lordByron = App.Person.create({children: []});
		 lordByron.get('minChildAge'); // Infinity
		 lordByron.get('children').pushObject({name: 'Augusta Ada Byron', age: 7});
		 lordByron.get('minChildAge'); // 7
		 lordByron.get('children').pushObjects([{name: 'Allegra Byron', age: 5}, {name: 'Elizabeth Medora Leigh', age: 8}]);
		 lordByron.get('minChildAge'); // 5
		 ```

		 @method computed.min
		 @for Ember
		 @param {String} dependentKey
		 @return {Ember.ComputedProperty} computes the smallest value in the dependentKey's array
		 */
		Ember.computed.min = function (dependentKey) {
			return Ember.reduceComputed.call(null, dependentKey, {
				initialValue: Infinity,

				addedItem: function (accumulatedValue, item, changeMeta, instanceMeta) {
					return Math.min(accumulatedValue, item);
				},

				removedItem: function (accumulatedValue, item, changeMeta, instanceMeta) {
					if (item > accumulatedValue) {
						return accumulatedValue;
					}
				}
			});
		};

		/**
		 Returns an array mapped via the callback

		 The callback method you provide should have the following signature:

		 ```javascript
		 function(item);
		 ```

		 - `item` is the current item in the iteration.

		 Example

		 ```javascript
		 App.Hampster = Ember.Object.extend({
    excitingChores: Ember.computed.map('chores', function(chore) {
      return chore.toUpperCase() + '!';
    })
  });

		 var hampster = App.Hampster.create({chores: ['cook', 'clean', 'write more unit tests']});
		 hampster.get('excitingChores'); // ['COOK!', 'CLEAN!', 'WRITE MORE UNIT TESTS!']
		 ```

		 @method computed.map
		 @for Ember
		 @param {String} dependentKey
		 @param {Function} callback
		 @return {Ember.ComputedProperty} an array mapped via the callback
		 */
		Ember.computed.map = function(dependentKey, callback) {
			var options = {
				addedItem: function(array, item, changeMeta, instanceMeta) {
					var mapped = callback(item);
					array.insertAt(changeMeta.index, mapped);
					return array;
				},
				removedItem: function(array, item, changeMeta, instanceMeta) {
					array.removeAt(changeMeta.index, 1);
					return array;
				}
			};

			return Ember.arrayComputed(dependentKey, options);
		};

		/**
		 Returns an array mapped to the specified key.

		 Example

		 ```javascript
		 App.Person = Ember.Object.extend({
    childAges: Ember.computed.mapBy('children', 'age'),
    minChildAge: Ember.computed.min('childAges')
  });

		 var lordByron = App.Person.create({children: []});
		 lordByron.get('childAge'); // []
		 lordByron.get('children').pushObject({name: 'Augusta Ada Byron', age: 7});
		 lordByron.get('childAge'); // [7]
		 lordByron.get('children').pushObjects([{name: 'Allegra Byron', age: 5}, {name: 'Elizabeth Medora Leigh', age: 8}]);
		 lordByron.get('childAge'); // [7, 5, 8]
		 ```

		 @method computed.mapBy
		 @for Ember
		 @param {String} dependentKey
		 @param {String} propertyKey
		 @return {Ember.ComputedProperty} an array mapped to the specified key
		 */
		Ember.computed.mapBy = function(dependentKey, propertyKey) {
			var callback = function(item) { return get(item, propertyKey); };
			return Ember.computed.map(dependentKey + '.@each.' + propertyKey, callback);
		};

		/**
		 @method computed.mapProperty
		 @for Ember
		 @deprecated Use `Ember.computed.mapBy` instead
		 @param dependentKey
		 @param propertyKey
		 */
		Ember.computed.mapProperty = Ember.computed.mapBy;

		/**
		 Filters the array by the callback.

		 The callback method you provide should have the following signature:

		 ```javascript
		 function(item);
		 ```

		 - `item` is the current item in the iteration.

		 Example

		 ```javascript
		 App.Hampster = Ember.Object.extend({
    remainingChores: Ember.computed.filter('chores', function(chore) {
      return !chore.done;
    })
  });

		 var hampster = App.Hampster.create({chores: [
    {name: 'cook', done: true},
    {name: 'clean', done: true},
    {name: 'write more unit tests', done: false}
  ]});
		 hampster.get('remainingChores'); // [{name: 'write more unit tests', done: false}]
		 ```

		 @method computed.filter
		 @for Ember
		 @param {String} dependentKey
		 @param {Function} callback
		 @return {Ember.ComputedProperty} the filtered array
		 */
		Ember.computed.filter = function(dependentKey, callback) {
			var options = {
				initialize: function (array, changeMeta, instanceMeta) {
					instanceMeta.filteredArrayIndexes = new Ember.SubArray();
				},

				addedItem: function(array, item, changeMeta, instanceMeta) {
					var match = !!callback(item),
						filterIndex = instanceMeta.filteredArrayIndexes.addItem(changeMeta.index, match);

					if (match) {
						array.insertAt(filterIndex, item);
					}

					return array;
				},

				removedItem: function(array, item, changeMeta, instanceMeta) {
					var filterIndex = instanceMeta.filteredArrayIndexes.removeItem(changeMeta.index);

					if (filterIndex > -1) {
						array.removeAt(filterIndex);
					}

					return array;
				}
			};

			return Ember.arrayComputed(dependentKey, options);
		};

		/**
		 Filters the array by the property and value

		 Example

		 ```javascript
		 App.Hampster = Ember.Object.extend({
    remainingChores: Ember.computed.filterBy('chores', 'done', false)
  });

		 var hampster = App.Hampster.create({chores: [
    {name: 'cook', done: true},
    {name: 'clean', done: true},
    {name: 'write more unit tests', done: false}
  ]});
		 hampster.get('remainingChores'); // [{name: 'write more unit tests', done: false}]
		 ```

		 @method computed.filterBy
		 @for Ember
		 @param {String} dependentKey
		 @param {String} propertyKey
		 @param {String} value
		 @return {Ember.ComputedProperty} the filtered array
		 */
		Ember.computed.filterBy = function(dependentKey, propertyKey, value) {
			var callback;

			if (arguments.length === 2) {
				callback = function(item) {
					return get(item, propertyKey);
				};
			} else {
				callback = function(item) {
					return get(item, propertyKey) === value;
				};
			}

			return Ember.computed.filter(dependentKey + '.@each.' + propertyKey, callback);
		};

		/**
		 @method computed.filterProperty
		 @for Ember
		 @param dependentKey
		 @param propertyKey
		 @param value
		 @deprecated Use `Ember.computed.filterBy` instead
		 */
		Ember.computed.filterProperty = Ember.computed.filterBy;

		/**
		 A computed property which returns a new array with all the unique
		 elements from one or more dependent arrays.

		 Example

		 ```javascript
		 App.Hampster = Ember.Object.extend({
    uniqueFruits: Ember.computed.uniq('fruits')
  });

		 var hampster = App.Hampster.create({fruits: [
    'banana',
    'grape',
    'kale',
    'banana'
  ]});
		 hampster.get('uniqueFruits'); // ['banana', 'grape', 'kale']
		 ```

		 @method computed.uniq
		 @for Ember
		 @param {String} propertyKey*
		 @return {Ember.ComputedProperty} computes a new array with all the
		 unique elements from the dependent array
		 */
		Ember.computed.uniq = function() {
			var args = a_slice.call(arguments);
			args.push({
				initialize: function(array, changeMeta, instanceMeta) {
					instanceMeta.itemCounts = {};
				},

				addedItem: function(array, item, changeMeta, instanceMeta) {
					var guid = guidFor(item);

					if (!instanceMeta.itemCounts[guid]) {
						instanceMeta.itemCounts[guid] = 1;
					} else {
						++instanceMeta.itemCounts[guid];
					}
					array.addObject(item);
					return array;
				},
				removedItem: function(array, item, _, instanceMeta) {
					var guid = guidFor(item),
						itemCounts = instanceMeta.itemCounts;

					if (--itemCounts[guid] === 0) {
						array.removeObject(item);
					}
					return array;
				}
			});
			return Ember.arrayComputed.apply(null, args);
		};

		/**
		 Alias for [Ember.computed.uniq](/api/#method_computed_uniq).

		 @method computed.union
		 @for Ember
		 @param {String} propertyKey*
		 @return {Ember.ComputedProperty} computes a new array with all the
		 unique elements from the dependent array
		 */
		Ember.computed.union = Ember.computed.uniq;

		/**
		 A computed property which returns a new array with all the duplicated
		 elements from two or more dependeny arrays.

		 Example

		 ```javascript
		 var obj = Ember.Object.createWithMixins({
    adaFriends: ['Charles Babbage', 'John Hobhouse', 'William King', 'Mary Somerville'],
    charlesFriends: ['William King', 'Mary Somerville', 'Ada Lovelace', 'George Peacock'],
    friendsInCommon: Ember.computed.intersect('adaFriends', 'charlesFriends')
  });

		 obj.get('friendsInCommon'); // ['William King', 'Mary Somerville']
		 ```

		 @method computed.intersect
		 @for Ember
		 @param {String} propertyKey*
		 @return {Ember.ComputedProperty} computes a new array with all the
		 duplicated elements from the dependent arrays
		 */
		Ember.computed.intersect = function () {
			var getDependentKeyGuids = function (changeMeta) {
				return map(changeMeta.property._dependentKeys, function (dependentKey) {
					return guidFor(dependentKey);
				});
			};

			var args = a_slice.call(arguments);
			args.push({
				initialize: function (array, changeMeta, instanceMeta) {
					instanceMeta.itemCounts = {};
				},

				addedItem: function(array, item, changeMeta, instanceMeta) {
					var itemGuid = guidFor(item),
						dependentGuids = getDependentKeyGuids(changeMeta),
						dependentGuid = guidFor(changeMeta.arrayChanged),
						numberOfDependentArrays = changeMeta.property._dependentKeys.length,
						itemCounts = instanceMeta.itemCounts;

					if (!itemCounts[itemGuid]) { itemCounts[itemGuid] = {}; }
					if (itemCounts[itemGuid][dependentGuid] === undefined) { itemCounts[itemGuid][dependentGuid] = 0; }

					if (++itemCounts[itemGuid][dependentGuid] === 1 &&
						numberOfDependentArrays === Ember.keys(itemCounts[itemGuid]).length) {

						array.addObject(item);
					}
					return array;
				},
				removedItem: function(array, item, changeMeta, instanceMeta) {
					var itemGuid = guidFor(item),
						dependentGuids = getDependentKeyGuids(changeMeta),
						dependentGuid = guidFor(changeMeta.arrayChanged),
						numberOfDependentArrays = changeMeta.property._dependentKeys.length,
						numberOfArraysItemAppearsIn,
						itemCounts = instanceMeta.itemCounts;

					if (itemCounts[itemGuid][dependentGuid] === undefined) { itemCounts[itemGuid][dependentGuid] = 0; }
					if (--itemCounts[itemGuid][dependentGuid] === 0) {
						delete itemCounts[itemGuid][dependentGuid];
						numberOfArraysItemAppearsIn = Ember.keys(itemCounts[itemGuid]).length;

						if (numberOfArraysItemAppearsIn === 0) {
							delete itemCounts[itemGuid];
						}
						array.removeObject(item);
					}
					return array;
				}
			});
			return Ember.arrayComputed.apply(null, args);
		};

		/**
		 A computed property which returns a new array with all the
		 properties from the first dependent array that are not in the second
		 dependent array.

		 Example

		 ```javascript
		 App.Hampster = Ember.Object.extend({
    likes: ['banana', 'grape', 'kale'],
    wants: Ember.computed.setDiff('likes', 'fruits')
  });

		 var hampster = App.Hampster.create({fruits: [
    'grape',
    'kale',
  ]});
		 hampster.get('wants'); // ['banana']
		 ```

		 @method computed.setDiff
		 @for Ember
		 @param {String} setAProperty
		 @param {String} setBProperty
		 @return {Ember.ComputedProperty} computes a new array with all the
		 items from the first dependent array that are not in the second
		 dependent array
		 */
		Ember.computed.setDiff = function (setAProperty, setBProperty) {
			if (arguments.length !== 2) {
				throw new Error("setDiff requires exactly two dependent arrays.");
			}
			return Ember.arrayComputed.call(null, setAProperty, setBProperty, {
				addedItem: function (array, item, changeMeta, instanceMeta) {
					var setA = get(this, setAProperty),
						setB = get(this, setBProperty);

					if (changeMeta.arrayChanged === setA) {
						if (!setB.contains(item)) {
							array.addObject(item);
						}
					} else {
						array.removeObject(item);
					}
					return array;
				},

				removedItem: function (array, item, changeMeta, instanceMeta) {
					var setA = get(this, setAProperty),
						setB = get(this, setBProperty);

					if (changeMeta.arrayChanged === setB) {
						if (setA.contains(item)) {
							array.addObject(item);
						}
					} else {
						array.removeObject(item);
					}
					return array;
				}
			});
		};

		function binarySearch(array, item, low, high) {
			var mid, midItem, res, guidMid, guidItem;

			if (arguments.length < 4) { high = get(array, 'length'); }
			if (arguments.length < 3) { low = 0; }

			if (low === high) {
				return low;
			}

			mid = low + Math.floor((high - low) / 2);
			midItem = array.objectAt(mid);

			guidMid = _guidFor(midItem);
			guidItem = _guidFor(item);

			if (guidMid === guidItem) {
				return mid;
			}

			res = this.order(midItem, item);
			if (res === 0) {
				res = guidMid < guidItem ? -1 : 1;
			}


			if (res < 0) {
				return this.binarySearch(array, item, mid+1, high);
			} else if (res > 0) {
				return this.binarySearch(array, item, low, mid);
			}

			return mid;

			function _guidFor(item) {
				if (Ember.ObjectProxy.detectInstance(item)) {
					return guidFor(get(item, 'content'));
				}
				return guidFor(item);
			}
		}

		/**
		 A computed property which returns a new array with all the
		 properties from the first dependent array sorted based on a property
		 or sort function.

		 The callback method you provide should have the following signature:

		 ```javascript
		 function(itemA, itemB);
		 ```

		 - `itemA` the first item to compare.
		 - `itemB` the second item to compare.

		 This function should return `-1` when `itemA` should come before
		 `itemB`. It should return `1` when `itemA` should come after
		 `itemB`. If the `itemA` and `itemB` are equal this function should return `0`.

		 Example

		 ```javascript
		 var ToDoList = Ember.Object.extend({
    todosSorting: ['name'],
    sortedTodos: Ember.computed.sort('todos', 'todosSorting'),
    priorityTodos: Ember.computed.sort('todos', function(a, b){
      if (a.priority > b.priority) {
        return 1;
      } else if (a.priority < b.priority) {
        return -1;
      }
      return 0;
    }),
  });
		 var todoList = ToDoList.create({todos: [
    {name: 'Unit Test', priority: 2},
    {name: 'Documentation', priority: 3},
    {name: 'Release', priority: 1}
  ]});

		 todoList.get('sortedTodos'); // [{name:'Documentation', priority:3}, {name:'Release', priority:1}, {name:'Unit Test', priority:2}]
		 todoList.get('priroityTodos'); // [{name:'Release', priority:1}, {name:'Unit Test', priority:2}, {name:'Documentation', priority:3}]
		 ```

		 @method computed.sort
		 @for Ember
		 @param {String} dependentKey
		 @param {String or Function} sortDefinition a dependent key to an
		 array of sort properties or a function to use when sorting
		 @return {Ember.ComputedProperty} computes a new sorted array based
		 on the sort property array or callback function
		 */
		Ember.computed.sort = function (itemsKey, sortDefinition) {


			var initFn, sortPropertiesKey;

			if (typeof sortDefinition === 'function') {
				initFn = function (array, changeMeta, instanceMeta) {
					instanceMeta.order = sortDefinition;
					instanceMeta.binarySearch = binarySearch;
				};
			} else {
				sortPropertiesKey = sortDefinition;
				initFn = function (array, changeMeta, instanceMeta) {
					function setupSortProperties() {
						var sortPropertyDefinitions = get(this, sortPropertiesKey),
							sortProperty,
							sortProperties = instanceMeta.sortProperties = [],
							sortPropertyAscending = instanceMeta.sortPropertyAscending = {},
							idx,
							asc;


						changeMeta.property.clearItemPropertyKeys(itemsKey);

						forEach(sortPropertyDefinitions, function (sortPropertyDefinition) {
							if ((idx = sortPropertyDefinition.indexOf(':')) !== -1) {
								sortProperty = sortPropertyDefinition.substring(0, idx);
								asc = sortPropertyDefinition.substring(idx+1).toLowerCase() !== 'desc';
							} else {
								sortProperty = sortPropertyDefinition;
								asc = true;
							}

							sortProperties.push(sortProperty);
							sortPropertyAscending[sortProperty] = asc;
							changeMeta.property.itemPropertyKey(itemsKey, sortProperty);
						});

						sortPropertyDefinitions.addObserver('@each', this, updateSortPropertiesOnce);
					}

					function updateSortPropertiesOnce() {
						Ember.run.once(this, updateSortProperties, changeMeta.propertyName);
					}

					function updateSortProperties(propertyName) {
						setupSortProperties.call(this);
						changeMeta.property.recomputeOnce.call(this, propertyName);
					}

					Ember.addObserver(this, sortPropertiesKey, updateSortPropertiesOnce);

					setupSortProperties.call(this);


					instanceMeta.order = function (itemA, itemB) {
						var sortProperty, result, asc;
						for (var i = 0; i < this.sortProperties.length; ++i) {
							sortProperty = this.sortProperties[i];
							result = Ember.compare(get(itemA, sortProperty), get(itemB, sortProperty));

							if (result !== 0) {
								asc = this.sortPropertyAscending[sortProperty];
								return asc ? result : (-1 * result);
							}
						}

						return 0;
					};

					instanceMeta.binarySearch = binarySearch;
				};
			}

			return Ember.arrayComputed.call(null, itemsKey, {
				initialize: initFn,

				addedItem: function (array, item, changeMeta, instanceMeta) {
					var index = instanceMeta.binarySearch(array, item);
					array.insertAt(index, item);
					return array;
				},

				removedItem: function (array, item, changeMeta, instanceMeta) {
					var proxyProperties, index, searchItem;

					if (changeMeta.previousValues) {
						proxyProperties = merge({ content: item }, changeMeta.previousValues);

						searchItem = Ember.ObjectProxy.create(proxyProperties);
					} else {
						searchItem = item;
					}

					index = instanceMeta.binarySearch(array, searchItem);
					array.removeAt(index);
					return array;
				}
			});
		};

	})();



	(function() {
		/**
		 Expose RSVP implementation

		 Documentation can be found here: https://github.com/tildeio/rsvp.js/blob/master/README.md

		 @class RSVP
		 @namespace Ember
		 @constructor
		 */
		Ember.RSVP = requireModule('rsvp');

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-runtime
		 */

		var STRING_DASHERIZE_REGEXP = (/[ _]/g);
		var STRING_DASHERIZE_CACHE = {};
		var STRING_DECAMELIZE_REGEXP = (/([a-z])([A-Z])/g);
		var STRING_CAMELIZE_REGEXP = (/(\-|_|\.|\s)+(.)?/g);
		var STRING_UNDERSCORE_REGEXP_1 = (/([a-z\d])([A-Z]+)/g);
		var STRING_UNDERSCORE_REGEXP_2 = (/\-|\s+/g);

		/**
		 Defines the hash of localized strings for the current language. Used by
		 the `Ember.String.loc()` helper. To localize, add string values to this
		 hash.

		 @property STRINGS
		 @for Ember
		 @type Hash
		 */
		Ember.STRINGS = {};

		/**
		 Defines string helper methods including string formatting and localization.
		 Unless `Ember.EXTEND_PROTOTYPES.String` is `false` these methods will also be
		 added to the `String.prototype` as well.

		 @class String
		 @namespace Ember
		 @static
		 */
		Ember.String = {

			/**
			 Apply formatting options to the string. This will look for occurrences
			 of "%@" in your string and substitute them with the arguments you pass into
			 this method. If you want to control the specific order of replacement,
			 you can add a number after the key as well to indicate which argument
			 you want to insert.

			 Ordered insertions are most useful when building loc strings where values
			 you need to insert may appear in different orders.

			 ```javascript
			 "Hello %@ %@".fmt('John', 'Doe');     // "Hello John Doe"
			 "Hello %@2, %@1".fmt('John', 'Doe');  // "Hello Doe, John"
			 ```

			 @method fmt
			 @param {String} str The string to format
			 @param {Array} formats An array of parameters to interpolate into string.
			 @return {String} formatted string
			 */
			fmt: function(str, formats) {
				// first, replace any ORDERED replacements.
				var idx  = 0; // the current index for non-numerical replacements
				return str.replace(/%@([0-9]+)?/g, function(s, argIndex) {
					argIndex = (argIndex) ? parseInt(argIndex, 10) - 1 : idx++;
					s = formats[argIndex];
					return (s === null) ? '(null)' : (s === undefined) ? '' : Ember.inspect(s);
				}) ;
			},

			/**
			 Formats the passed string, but first looks up the string in the localized
			 strings hash. This is a convenient way to localize text. See
			 `Ember.String.fmt()` for more information on formatting.

			 Note that it is traditional but not required to prefix localized string
			 keys with an underscore or other character so you can easily identify
			 localized strings.

			 ```javascript
			 Ember.STRINGS = {
      '_Hello World': 'Bonjour le monde',
      '_Hello %@ %@': 'Bonjour %@ %@'
			 };

			 Ember.String.loc("_Hello World");  // 'Bonjour le monde';
			 Ember.String.loc("_Hello %@ %@", ["John", "Smith"]);  // "Bonjour John Smith";
			 ```

			 @method loc
			 @param {String} str The string to format
			 @param {Array} formats Optional array of parameters to interpolate into string.
			 @return {String} formatted string
			 */
			loc: function(str, formats) {
				str = Ember.STRINGS[str] || str;
				return Ember.String.fmt(str, formats) ;
			},

			/**
			 Splits a string into separate units separated by spaces, eliminating any
			 empty strings in the process. This is a convenience method for split that
			 is mostly useful when applied to the `String.prototype`.

			 ```javascript
			 Ember.String.w("alpha beta gamma").forEach(function(key) {
      console.log(key);
    });

			 // > alpha
			 // > beta
			 // > gamma
			 ```

			 @method w
			 @param {String} str The string to split
			 @return {String} split string
			 */
			w: function(str) { return str.split(/\s+/); },

			/**
			 Converts a camelized string into all lower case separated by underscores.

			 ```javascript
			 'innerHTML'.decamelize();           // 'inner_html'
			 'action_name'.decamelize();        // 'action_name'
			 'css-class-name'.decamelize();     // 'css-class-name'
			 'my favorite items'.decamelize();  // 'my favorite items'
			 ```

			 @method decamelize
			 @param {String} str The string to decamelize.
			 @return {String} the decamelized string.
			 */
			decamelize: function(str) {
				return str.replace(STRING_DECAMELIZE_REGEXP, '$1_$2').toLowerCase();
			},

			/**
			 Replaces underscores, spaces, or camelCase with dashes.

			 ```javascript
			 'innerHTML'.dasherize();          // 'inner-html'
			 'action_name'.dasherize();        // 'action-name'
			 'css-class-name'.dasherize();     // 'css-class-name'
			 'my favorite items'.dasherize();  // 'my-favorite-items'
			 ```

			 @method dasherize
			 @param {String} str The string to dasherize.
			 @return {String} the dasherized string.
			 */
			dasherize: function(str) {
				var cache = STRING_DASHERIZE_CACHE,
					hit   = cache.hasOwnProperty(str),
					ret;

				if (hit) {
					return cache[str];
				} else {
					ret = Ember.String.decamelize(str).replace(STRING_DASHERIZE_REGEXP,'-');
					cache[str] = ret;
				}

				return ret;
			},

			/**
			 Returns the lowerCamelCase form of a string.

			 ```javascript
			 'innerHTML'.camelize();          // 'innerHTML'
			 'action_name'.camelize();        // 'actionName'
			 'css-class-name'.camelize();     // 'cssClassName'
			 'my favorite items'.camelize();  // 'myFavoriteItems'
			 'My Favorite Items'.camelize();  // 'myFavoriteItems'
			 ```

			 @method camelize
			 @param {String} str The string to camelize.
			 @return {String} the camelized string.
			 */
			camelize: function(str) {
				return str.replace(STRING_CAMELIZE_REGEXP, function(match, separator, chr) {
					return chr ? chr.toUpperCase() : '';
				}).replace(/^([A-Z])/, function(match, separator, chr) {
						return match.toLowerCase();
					});
			},

			/**
			 Returns the UpperCamelCase form of a string.

			 ```javascript
			 'innerHTML'.classify();          // 'InnerHTML'
			 'action_name'.classify();        // 'ActionName'
			 'css-class-name'.classify();     // 'CssClassName'
			 'my favorite items'.classify();  // 'MyFavoriteItems'
			 ```

			 @method classify
			 @param {String} str the string to classify
			 @return {String} the classified string
			 */
			classify: function(str) {
				var parts = str.split("."),
					out = [];

				for (var i=0, l=parts.length; i<l; i++) {
					var camelized = Ember.String.camelize(parts[i]);
					out.push(camelized.charAt(0).toUpperCase() + camelized.substr(1));
				}

				return out.join(".");
			},

			/**
			 More general than decamelize. Returns the lower\_case\_and\_underscored
			 form of a string.

			 ```javascript
			 'innerHTML'.underscore();          // 'inner_html'
			 'action_name'.underscore();        // 'action_name'
			 'css-class-name'.underscore();     // 'css_class_name'
			 'my favorite items'.underscore();  // 'my_favorite_items'
			 ```

			 @method underscore
			 @param {String} str The string to underscore.
			 @return {String} the underscored string.
			 */
			underscore: function(str) {
				return str.replace(STRING_UNDERSCORE_REGEXP_1, '$1_$2').
					replace(STRING_UNDERSCORE_REGEXP_2, '_').toLowerCase();
			},

			/**
			 Returns the Capitalized form of a string

			 ```javascript
			 'innerHTML'.capitalize()         // 'InnerHTML'
			 'action_name'.capitalize()       // 'Action_name'
			 'css-class-name'.capitalize()    // 'Css-class-name'
			 'my favorite items'.capitalize() // 'My favorite items'
			 ```

			 @method capitalize
			 @param {String} str The string to capitalize.
			 @return {String} The capitalized string.
			 */
			capitalize: function(str) {
				return str.charAt(0).toUpperCase() + str.substr(1);
			}

		};

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-runtime
		 */



		var fmt = Ember.String.fmt,
			w   = Ember.String.w,
			loc = Ember.String.loc,
			camelize = Ember.String.camelize,
			decamelize = Ember.String.decamelize,
			dasherize = Ember.String.dasherize,
			underscore = Ember.String.underscore,
			capitalize = Ember.String.capitalize,
			classify = Ember.String.classify;

		if (Ember.EXTEND_PROTOTYPES === true || Ember.EXTEND_PROTOTYPES.String) {

			/**
			 See [Ember.String.fmt](/api/classes/Ember.String.html#method_fmt).

			 @method fmt
			 @for String
			 */
			String.prototype.fmt = function() {
				return fmt(this, arguments);
			};

			/**
			 See [Ember.String.w](/api/classes/Ember.String.html#method_w).

			 @method w
			 @for String
			 */
			String.prototype.w = function() {
				return w(this);
			};

			/**
			 See [Ember.String.loc](/api/classes/Ember.String.html#method_loc).

			 @method loc
			 @for String
			 */
			String.prototype.loc = function() {
				return loc(this, arguments);
			};

			/**
			 See [Ember.String.camelize](/api/classes/Ember.String.html#method_camelize).

			 @method camelize
			 @for String
			 */
			String.prototype.camelize = function() {
				return camelize(this);
			};

			/**
			 See [Ember.String.decamelize](/api/classes/Ember.String.html#method_decamelize).

			 @method decamelize
			 @for String
			 */
			String.prototype.decamelize = function() {
				return decamelize(this);
			};

			/**
			 See [Ember.String.dasherize](/api/classes/Ember.String.html#method_dasherize).

			 @method dasherize
			 @for String
			 */
			String.prototype.dasherize = function() {
				return dasherize(this);
			};

			/**
			 See [Ember.String.underscore](/api/classes/Ember.String.html#method_underscore).

			 @method underscore
			 @for String
			 */
			String.prototype.underscore = function() {
				return underscore(this);
			};

			/**
			 See [Ember.String.classify](/api/classes/Ember.String.html#method_classify).

			 @method classify
			 @for String
			 */
			String.prototype.classify = function() {
				return classify(this);
			};

			/**
			 See [Ember.String.capitalize](/api/classes/Ember.String.html#method_capitalize).

			 @method capitalize
			 @for String
			 */
			String.prototype.capitalize = function() {
				return capitalize(this);
			};

		}


	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-runtime
		 */

		var a_slice = Array.prototype.slice;

		if (Ember.EXTEND_PROTOTYPES === true || Ember.EXTEND_PROTOTYPES.Function) {

			/**
			 The `property` extension of Javascript's Function prototype is available
			 when `Ember.EXTEND_PROTOTYPES` or `Ember.EXTEND_PROTOTYPES.Function` is
			 `true`, which is the default.

			 Computed properties allow you to treat a function like a property:

			 ```javascript
			 MyApp.President = Ember.Object.extend({
      firstName: '',
      lastName:  '',

      fullName: function() {
        return this.get('firstName') + ' ' + this.get('lastName');

        // Call this flag to mark the function as a property
      }.property()
    });

			 var president = MyApp.President.create({
      firstName: "Barack",
      lastName: "Obama"
    });

			 president.get('fullName');    // "Barack Obama"
			 ```

			 Treating a function like a property is useful because they can work with
			 bindings, just like any other property.

			 Many computed properties have dependencies on other properties. For
			 example, in the above example, the `fullName` property depends on
			 `firstName` and `lastName` to determine its value. You can tell Ember
			 about these dependencies like this:

			 ```javascript
			 MyApp.President = Ember.Object.extend({
      firstName: '',
      lastName:  '',

      fullName: function() {
        return this.get('firstName') + ' ' + this.get('lastName');

        // Tell Ember.js that this computed property depends on firstName
        // and lastName
      }.property('firstName', 'lastName')
    });
			 ```

			 Make sure you list these dependencies so Ember knows when to update
			 bindings that connect to a computed property. Changing a dependency
			 will not immediately trigger an update of the computed property, but
			 will instead clear the cache so that it is updated when the next `get`
			 is called on the property.

			 See [Ember.ComputedProperty](/api/classes/Ember.ComputedProperty.html), [Ember.computed](/api/#method_computed).

			 @method property
			 @for Function
			 */
			Function.prototype.property = function() {
				var ret = Ember.computed(this);
				return ret.property.apply(ret, arguments);
			};

			/**
			 The `observes` extension of Javascript's Function prototype is available
			 when `Ember.EXTEND_PROTOTYPES` or `Ember.EXTEND_PROTOTYPES.Function` is
			 true, which is the default.

			 You can observe property changes simply by adding the `observes`
			 call to the end of your method declarations in classes that you write.
			 For example:

			 ```javascript
			 Ember.Object.extend({
      valueObserver: function() {
        // Executes whenever the "value" property changes
      }.observes('value')
    });
			 ```

			 In the future this method may become asynchronous. If you want to ensure
			 synchronous behavior, use `observesImmediately`.

			 See `Ember.observer`.

			 @method observes
			 @for Function
			 */
			Function.prototype.observes = function() {
				this.__ember_observes__ = a_slice.call(arguments);
				return this;
			};

			/**
			 The `observesImmediately` extension of Javascript's Function prototype is
			 available when `Ember.EXTEND_PROTOTYPES` or
			 `Ember.EXTEND_PROTOTYPES.Function` is true, which is the default.

			 You can observe property changes simply by adding the `observesImmediately`
			 call to the end of your method declarations in classes that you write.
			 For example:

			 ```javascript
			 Ember.Object.extend({
      valueObserver: function() {
        // Executes immediately after the "value" property changes
      }.observesImmediately('value')
    });
			 ```

			 In the future, `observes` may become asynchronous. In this event,
			 `observesImmediately` will maintain the synchronous behavior.

			 See `Ember.immediateObserver`.

			 @method observesImmediately
			 @for Function
			 */
			Function.prototype.observesImmediately = function() {
				for (var i=0, l=arguments.length; i<l; i++) {
					var arg = arguments[i];

				}

				return this.observes.apply(this, arguments);
			};

			/**
			 The `observesBefore` extension of Javascript's Function prototype is
			 available when `Ember.EXTEND_PROTOTYPES` or
			 `Ember.EXTEND_PROTOTYPES.Function` is true, which is the default.

			 You can get notified when a property change is about to happen by
			 by adding the `observesBefore` call to the end of your method
			 declarations in classes that you write. For example:

			 ```javascript
			 Ember.Object.extend({
      valueObserver: function() {
        // Executes whenever the "value" property is about to change
      }.observesBefore('value')
    });
			 ```

			 See `Ember.beforeObserver`.

			 @method observesBefore
			 @for Function
			 */
			Function.prototype.observesBefore = function() {
				this.__ember_observesBefore__ = a_slice.call(arguments);
				return this;
			};

			/**
			 The `on` extension of Javascript's Function prototype is available
			 when `Ember.EXTEND_PROTOTYPES` or `Ember.EXTEND_PROTOTYPES.Function` is
			 true, which is the default.

			 You can listen for events simply by adding the `on` call to the end of
			 your method declarations in classes or mixins that you write. For example:

			 ```javascript
			 Ember.Mixin.create({
      doSomethingWithElement: function() {
        // Executes whenever the "didInsertElement" event fires
      }.on('didInsertElement')
    });
			 ```

			 See `Ember.on`.

			 @method on
			 @for Function
			 */
			Function.prototype.on = function() {
				var events = a_slice.call(arguments);
				this.__ember_listens__ = events;
				return this;
			};
		}


	})();



	(function() {

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-runtime
		 */


		/**
		 Implements some standard methods for comparing objects. Add this mixin to
		 any class you create that can compare its instances.

		 You should implement the `compare()` method.

		 @class Comparable
		 @namespace Ember
		 @since Ember 0.9
		 */
		Ember.Comparable = Ember.Mixin.create( /** @scope Ember.Comparable.prototype */{

			/**
			 Override to return the result of the comparison of the two parameters. The
			 compare method should return:

			 - `-1` if `a < b`
			 - `0` if `a == b`
			 - `1` if `a > b`

			 Default implementation raises an exception.

			 @method compare
			 @param a {Object} the first object to compare
			 @param b {Object} the second object to compare
			 @return {Integer} the result of the comparison
			 */
			compare: Ember.required(Function)

		});


	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-runtime
		 */



		var get = Ember.get, set = Ember.set;

		/**
		 Implements some standard methods for copying an object. Add this mixin to
		 any object you create that can create a copy of itself. This mixin is
		 added automatically to the built-in array.

		 You should generally implement the `copy()` method to return a copy of the
		 receiver.

		 Note that `frozenCopy()` will only work if you also implement
		 `Ember.Freezable`.

		 @class Copyable
		 @namespace Ember
		 @since Ember 0.9
		 */
		Ember.Copyable = Ember.Mixin.create(/** @scope Ember.Copyable.prototype */ {

			/**
			 Override to return a copy of the receiver. Default implementation raises
			 an exception.

			 @method copy
			 @param {Boolean} deep if `true`, a deep copy of the object should be made
			 @return {Object} copy of receiver
			 */
			copy: Ember.required(Function),

			/**
			 If the object implements `Ember.Freezable`, then this will return a new
			 copy if the object is not frozen and the receiver if the object is frozen.

			 Raises an exception if you try to call this method on a object that does
			 not support freezing.

			 You should use this method whenever you want a copy of a freezable object
			 since a freezable object can simply return itself without actually
			 consuming more memory.

			 @method frozenCopy
			 @return {Object} copy of receiver or receiver
			 */
			frozenCopy: function() {
				if (Ember.Freezable && Ember.Freezable.detect(this)) {
					return get(this, 'isFrozen') ? this : this.copy().freeze();
				} else {
					throw new Error(Ember.String.fmt("%@ does not support freezing", [this]));
				}
			}
		});

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-runtime
		 */


		var get = Ember.get, set = Ember.set;

		/**
		 The `Ember.Freezable` mixin implements some basic methods for marking an
		 object as frozen. Once an object is frozen it should be read only. No changes
		 may be made the internal state of the object.

		 ## Enforcement

		 To fully support freezing in your subclass, you must include this mixin and
		 override any method that might alter any property on the object to instead
		 raise an exception. You can check the state of an object by checking the
		 `isFrozen` property.

		 Although future versions of JavaScript may support language-level freezing
		 object objects, that is not the case today. Even if an object is freezable,
		 it is still technically possible to modify the object, even though it could
		 break other parts of your application that do not expect a frozen object to
		 change. It is, therefore, very important that you always respect the
		 `isFrozen` property on all freezable objects.

		 ## Example Usage

		 The example below shows a simple object that implement the `Ember.Freezable`
		 protocol.

		 ```javascript
		 Contact = Ember.Object.extend(Ember.Freezable, {
    firstName: null,
    lastName: null,

    // swaps the names
    swapNames: function() {
      if (this.get('isFrozen')) throw Ember.FROZEN_ERROR;
      var tmp = this.get('firstName');
      this.set('firstName', this.get('lastName'));
      this.set('lastName', tmp);
      return this;
    }

  });

		 c = Context.create({ firstName: "John", lastName: "Doe" });
		 c.swapNames();  // returns c
		 c.freeze();
		 c.swapNames();  // EXCEPTION
		 ```

		 ## Copying

		 Usually the `Ember.Freezable` protocol is implemented in cooperation with the
		 `Ember.Copyable` protocol, which defines a `frozenCopy()` method that will
		 return a frozen object, if the object implements this method as well.

		 @class Freezable
		 @namespace Ember
		 @since Ember 0.9
		 */
		Ember.Freezable = Ember.Mixin.create(/** @scope Ember.Freezable.prototype */ {

			/**
			 Set to `true` when the object is frozen. Use this property to detect
			 whether your object is frozen or not.

			 @property isFrozen
			 @type Boolean
			 */
			isFrozen: false,

			/**
			 Freezes the object. Once this method has been called the object should
			 no longer allow any properties to be edited.

			 @method freeze
			 @return {Object} receiver
			 */
			freeze: function() {
				if (get(this, 'isFrozen')) return this;
				set(this, 'isFrozen', true);
				return this;
			}

		});

		Ember.FROZEN_ERROR = "Frozen object cannot be modified.";

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-runtime
		 */

		var forEach = Ember.EnumerableUtils.forEach;

		/**
		 This mixin defines the API for modifying generic enumerables. These methods
		 can be applied to an object regardless of whether it is ordered or
		 unordered.

		 Note that an Enumerable can change even if it does not implement this mixin.
		 For example, a MappedEnumerable cannot be directly modified but if its
		 underlying enumerable changes, it will change also.

		 ## Adding Objects

		 To add an object to an enumerable, use the `addObject()` method. This
		 method will only add the object to the enumerable if the object is not
		 already present and is of a type supported by the enumerable.

		 ```javascript
		 set.addObject(contact);
		 ```

		 ## Removing Objects

		 To remove an object from an enumerable, use the `removeObject()` method. This
		 will only remove the object if it is present in the enumerable, otherwise
		 this method has no effect.

		 ```javascript
		 set.removeObject(contact);
		 ```

		 ## Implementing In Your Own Code

		 If you are implementing an object and want to support this API, just include
		 this mixin in your class and implement the required methods. In your unit
		 tests, be sure to apply the Ember.MutableEnumerableTests to your object.

		 @class MutableEnumerable
		 @namespace Ember
		 @uses Ember.Enumerable
		 */
		Ember.MutableEnumerable = Ember.Mixin.create(Ember.Enumerable, {

			/**
			 __Required.__ You must implement this method to apply this mixin.

			 Attempts to add the passed object to the receiver if the object is not
			 already present in the collection. If the object is present, this method
			 has no effect.

			 If the passed object is of a type not supported by the receiver,
			 then this method should raise an exception.

			 @method addObject
			 @param {Object} object The object to add to the enumerable.
			 @return {Object} the passed object
			 */
			addObject: Ember.required(Function),

			/**
			 Adds each object in the passed enumerable to the receiver.

			 @method addObjects
			 @param {Ember.Enumerable} objects the objects to add.
			 @return {Object} receiver
			 */
			addObjects: function(objects) {
				Ember.beginPropertyChanges(this);
				forEach(objects, function(obj) { this.addObject(obj); }, this);
				Ember.endPropertyChanges(this);
				return this;
			},

			/**
			 __Required.__ You must implement this method to apply this mixin.

			 Attempts to remove the passed object from the receiver collection if the
			 object is present in the collection. If the object is not present,
			 this method has no effect.

			 If the passed object is of a type not supported by the receiver,
			 then this method should raise an exception.

			 @method removeObject
			 @param {Object} object The object to remove from the enumerable.
			 @return {Object} the passed object
			 */
			removeObject: Ember.required(Function),


			/**
			 Removes each object in the passed enumerable from the receiver.

			 @method removeObjects
			 @param {Ember.Enumerable} objects the objects to remove
			 @return {Object} receiver
			 */
			removeObjects: function(objects) {
				Ember.beginPropertyChanges(this);
				forEach(objects, function(obj) { this.removeObject(obj); }, this);
				Ember.endPropertyChanges(this);
				return this;
			}

		});

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-runtime
		 */
// ..........................................................
// CONSTANTS
//

		var OUT_OF_RANGE_EXCEPTION = "Index out of range" ;
		var EMPTY = [];

// ..........................................................
// HELPERS
//

		var get = Ember.get, set = Ember.set;

		/**
		 This mixin defines the API for modifying array-like objects. These methods
		 can be applied only to a collection that keeps its items in an ordered set.

		 Note that an Array can change even if it does not implement this mixin.
		 For example, one might implement a SparseArray that cannot be directly
		 modified, but if its underlying enumerable changes, it will change also.

		 @class MutableArray
		 @namespace Ember
		 @uses Ember.Array
		 @uses Ember.MutableEnumerable
		 */
		Ember.MutableArray = Ember.Mixin.create(Ember.Array, Ember.MutableEnumerable,/** @scope Ember.MutableArray.prototype */ {

			/**
			 __Required.__ You must implement this method to apply this mixin.

			 This is one of the primitives you must implement to support `Ember.Array`.
			 You should replace amt objects started at idx with the objects in the
			 passed array. You should also call `this.enumerableContentDidChange()`

			 @method replace
			 @param {Number} idx Starting index in the array to replace. If
			 idx >= length, then append to the end of the array.
			 @param {Number} amt Number of elements that should be removed from
			 the array, starting at *idx*.
			 @param {Array} objects An array of zero or more objects that should be
			 inserted into the array at *idx*
			 */
			replace: Ember.required(),

			/**
			 Remove all elements from self. This is useful if you
			 want to reuse an existing array without having to recreate it.

			 ```javascript
			 var colors = ["red", "green", "blue"];
			 color.length();   //  3
			 colors.clear();   //  []
			 colors.length();  //  0
			 ```

			 @method clear
			 @return {Ember.Array} An empty Array.
			 */
			clear: function () {
				var len = get(this, 'length');
				if (len === 0) return this;
				this.replace(0, len, EMPTY);
				return this;
			},

			/**
			 This will use the primitive `replace()` method to insert an object at the
			 specified index.

			 ```javascript
			 var colors = ["red", "green", "blue"];
			 colors.insertAt(2, "yellow");  // ["red", "green", "yellow", "blue"]
			 colors.insertAt(5, "orange");  // Error: Index out of range
			 ```

			 @method insertAt
			 @param {Number} idx index of insert the object at.
			 @param {Object} object object to insert
			 @return this
			 */
			insertAt: function(idx, object) {
				if (idx > get(this, 'length')) throw new Error(OUT_OF_RANGE_EXCEPTION) ;
				this.replace(idx, 0, [object]) ;
				return this ;
			},

			/**
			 Remove an object at the specified index using the `replace()` primitive
			 method. You can pass either a single index, or a start and a length.

			 If you pass a start and length that is beyond the
			 length this method will throw an `OUT_OF_RANGE_EXCEPTION`

			 ```javascript
			 var colors = ["red", "green", "blue", "yellow", "orange"];
			 colors.removeAt(0);     // ["green", "blue", "yellow", "orange"]
			 colors.removeAt(2, 2);  // ["green", "blue"]
			 colors.removeAt(4, 2);  // Error: Index out of range
			 ```

			 @method removeAt
			 @param {Number} start index, start of range
			 @param {Number} len length of passing range
			 @return {Object} receiver
			 */
			removeAt: function(start, len) {
				if ('number' === typeof start) {

					if ((start < 0) || (start >= get(this, 'length'))) {
						throw new Error(OUT_OF_RANGE_EXCEPTION);
					}

					// fast case
					if (len === undefined) len = 1;
					this.replace(start, len, EMPTY);
				}

				return this ;
			},

			/**
			 Push the object onto the end of the array. Works just like `push()` but it
			 is KVO-compliant.

			 ```javascript
			 var colors = ["red", "green", "blue"];
			 colors.pushObject("black");               // ["red", "green", "blue", "black"]
			 colors.pushObject(["yellow", "orange"]);  // ["red", "green", "blue", "black", ["yellow", "orange"]]
			 ```

			 @method pushObject
			 @param {*} obj object to push
			 @return {*} the same obj passed as param
			 */
			pushObject: function(obj) {
				this.insertAt(get(this, 'length'), obj) ;
				return obj ;
			},

			/**
			 Add the objects in the passed numerable to the end of the array. Defers
			 notifying observers of the change until all objects are added.

			 ```javascript
			 var colors = ["red", "green", "blue"];
			 colors.pushObjects(["black"]);               // ["red", "green", "blue", "black"]
			 colors.pushObjects(["yellow", "orange"]);  // ["red", "green", "blue", "black", "yellow", "orange"]
			 ```

			 @method pushObjects
			 @param {Ember.Enumerable} objects the objects to add
			 @return {Ember.Array} receiver
			 */
			pushObjects: function(objects) {
				if (!(Ember.Enumerable.detect(objects) || Ember.isArray(objects))) {
					throw new TypeError("Must pass Ember.Enumerable to Ember.MutableArray#pushObjects");
				}
				this.replace(get(this, 'length'), 0, objects);
				return this;
			},

			/**
			 Pop object from array or nil if none are left. Works just like `pop()` but
			 it is KVO-compliant.

			 ```javascript
			 var colors = ["red", "green", "blue"];
			 colors.popObject();   // "blue"
			 console.log(colors);  // ["red", "green"]
			 ```

			 @method popObject
			 @return object
			 */
			popObject: function() {
				var len = get(this, 'length') ;
				if (len === 0) return null ;

				var ret = this.objectAt(len-1) ;
				this.removeAt(len-1, 1) ;
				return ret ;
			},

			/**
			 Shift an object from start of array or nil if none are left. Works just
			 like `shift()` but it is KVO-compliant.

			 ```javascript
			 var colors = ["red", "green", "blue"];
			 colors.shiftObject();  // "red"
			 console.log(colors);   // ["green", "blue"]
			 ```

			 @method shiftObject
			 @return object
			 */
			shiftObject: function() {
				if (get(this, 'length') === 0) return null ;
				var ret = this.objectAt(0) ;
				this.removeAt(0) ;
				return ret ;
			},

			/**
			 Unshift an object to start of array. Works just like `unshift()` but it is
			 KVO-compliant.

			 ```javascript
			 var colors = ["red", "green", "blue"];
			 colors.unshiftObject("yellow");             // ["yellow", "red", "green", "blue"]
			 colors.unshiftObject(["black", "white"]);   // [["black", "white"], "yellow", "red", "green", "blue"]
			 ```

			 @method unshiftObject
			 @param {*} obj object to unshift
			 @return {*} the same obj passed as param
			 */
			unshiftObject: function(obj) {
				this.insertAt(0, obj) ;
				return obj ;
			},

			/**
			 Adds the named objects to the beginning of the array. Defers notifying
			 observers until all objects have been added.

			 ```javascript
			 var colors = ["red", "green", "blue"];
			 colors.unshiftObjects(["black", "white"]);   // ["black", "white", "red", "green", "blue"]
			 colors.unshiftObjects("yellow");             // Type Error: 'undefined' is not a function
			 ```

			 @method unshiftObjects
			 @param {Ember.Enumerable} objects the objects to add
			 @return {Ember.Array} receiver
			 */
			unshiftObjects: function(objects) {
				this.replace(0, 0, objects);
				return this;
			},

			/**
			 Reverse objects in the array. Works just like `reverse()` but it is
			 KVO-compliant.

			 @method reverseObjects
			 @return {Ember.Array} receiver
			 */
			reverseObjects: function() {
				var len = get(this, 'length');
				if (len === 0) return this;
				var objects = this.toArray().reverse();
				this.replace(0, len, objects);
				return this;
			},

			/**
			 Replace all the the receiver's content with content of the argument.
			 If argument is an empty array receiver will be cleared.

			 ```javascript
			 var colors = ["red", "green", "blue"];
			 colors.setObjects(["black", "white"]);  // ["black", "white"]
			 colors.setObjects([]);                  // []
			 ```

			 @method setObjects
			 @param {Ember.Array} objects array whose content will be used for replacing
			 the content of the receiver
			 @return {Ember.Array} receiver with the new content
			 */
			setObjects: function(objects) {
				if (objects.length === 0) return this.clear();

				var len = get(this, 'length');
				this.replace(0, len, objects);
				return this;
			},

			// ..........................................................
			// IMPLEMENT Ember.MutableEnumerable
			//

			removeObject: function(obj) {
				var loc = get(this, 'length') || 0;
				while(--loc >= 0) {
					var curObject = this.objectAt(loc) ;
					if (curObject === obj) this.removeAt(loc) ;
				}
				return this ;
			},

			addObject: function(obj) {
				if (!this.contains(obj)) this.pushObject(obj);
				return this ;
			}

		});

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-runtime
		 */

		var get = Ember.get,
			set = Ember.set,
			slice = Array.prototype.slice,
			getProperties = Ember.getProperties;

		/**
		 ## Overview

		 This mixin provides properties and property observing functionality, core
		 features of the Ember object model.

		 Properties and observers allow one object to observe changes to a
		 property on another object. This is one of the fundamental ways that
		 models, controllers and views communicate with each other in an Ember
		 application.

		 Any object that has this mixin applied can be used in observer
		 operations. That includes `Ember.Object` and most objects you will
		 interact with as you write your Ember application.

		 Note that you will not generally apply this mixin to classes yourself,
		 but you will use the features provided by this module frequently, so it
		 is important to understand how to use it.

		 ## Using `get()` and `set()`

		 Because of Ember's support for bindings and observers, you will always
		 access properties using the get method, and set properties using the
		 set method. This allows the observing objects to be notified and
		 computed properties to be handled properly.

		 More documentation about `get` and `set` are below.

		 ## Observing Property Changes

		 You typically observe property changes simply by adding the `observes`
		 call to the end of your method declarations in classes that you write.
		 For example:

		 ```javascript
		 Ember.Object.extend({
    valueObserver: function() {
      // Executes whenever the "value" property changes
    }.observes('value')
  });
		 ```

		 Although this is the most common way to add an observer, this capability
		 is actually built into the `Ember.Object` class on top of two methods
		 defined in this mixin: `addObserver` and `removeObserver`. You can use
		 these two methods to add and remove observers yourself if you need to
		 do so at runtime.

		 To add an observer for a property, call:

		 ```javascript
		 object.addObserver('propertyKey', targetObject, targetAction)
		 ```

		 This will call the `targetAction` method on the `targetObject` whenever
		 the value of the `propertyKey` changes.

		 Note that if `propertyKey` is a computed property, the observer will be
		 called when any of the property dependencies are changed, even if the
		 resulting value of the computed property is unchanged. This is necessary
		 because computed properties are not computed until `get` is called.

		 @class Observable
		 @namespace Ember
		 */
		Ember.Observable = Ember.Mixin.create({

			/**
			 Retrieves the value of a property from the object.

			 This method is usually similar to using `object[keyName]` or `object.keyName`,
			 however it supports both computed properties and the unknownProperty
			 handler.

			 Because `get` unifies the syntax for accessing all these kinds
			 of properties, it can make many refactorings easier, such as replacing a
			 simple property with a computed property, or vice versa.

			 ### Computed Properties

			 Computed properties are methods defined with the `property` modifier
			 declared at the end, such as:

			 ```javascript
			 fullName: function() {
      return this.getEach('firstName', 'lastName').compact().join(' ');
    }.property('firstName', 'lastName')
			 ```

			 When you call `get` on a computed property, the function will be
			 called and the return value will be returned instead of the function
			 itself.

			 ### Unknown Properties

			 Likewise, if you try to call `get` on a property whose value is
			 `undefined`, the `unknownProperty()` method will be called on the object.
			 If this method returns any value other than `undefined`, it will be returned
			 instead. This allows you to implement "virtual" properties that are
			 not defined upfront.

			 @method get
			 @param {String} keyName The property to retrieve
			 @return {Object} The property value or undefined.
			 */
			get: function(keyName) {
				return get(this, keyName);
			},

			/**
			 To get multiple properties at once, call `getProperties`
			 with a list of strings or an array:

			 ```javascript
			 record.getProperties('firstName', 'lastName', 'zipCode');  // { firstName: 'John', lastName: 'Doe', zipCode: '10011' }
			 ```

			 is equivalent to:

			 ```javascript
			 record.getProperties(['firstName', 'lastName', 'zipCode']);  // { firstName: 'John', lastName: 'Doe', zipCode: '10011' }
			 ```

			 @method getProperties
			 @param {String...|Array} list of keys to get
			 @return {Hash}
			 */
			getProperties: function() {
				return getProperties.apply(null, [this].concat(slice.call(arguments)));
			},

			/**
			 Sets the provided key or path to the value.

			 This method is generally very similar to calling `object[key] = value` or
			 `object.key = value`, except that it provides support for computed
			 properties, the `setUnknownProperty()` method and property observers.

			 ### Computed Properties

			 If you try to set a value on a key that has a computed property handler
			 defined (see the `get()` method for an example), then `set()` will call
			 that method, passing both the value and key instead of simply changing
			 the value itself. This is useful for those times when you need to
			 implement a property that is composed of one or more member
			 properties.

			 ### Unknown Properties

			 If you try to set a value on a key that is undefined in the target
			 object, then the `setUnknownProperty()` handler will be called instead. This
			 gives you an opportunity to implement complex "virtual" properties that
			 are not predefined on the object. If `setUnknownProperty()` returns
			 undefined, then `set()` will simply set the value on the object.

			 ### Property Observers

			 In addition to changing the property, `set()` will also register a property
			 change with the object. Unless you have placed this call inside of a
			 `beginPropertyChanges()` and `endPropertyChanges(),` any "local" observers
			 (i.e. observer methods declared on the same object), will be called
			 immediately. Any "remote" observers (i.e. observer methods declared on
			 another object) will be placed in a queue and called at a later time in a
			 coalesced manner.

			 ### Chaining

			 In addition to property changes, `set()` returns the value of the object
			 itself so you can do chaining like this:

			 ```javascript
			 record.set('firstName', 'Charles').set('lastName', 'Jolley');
			 ```

			 @method set
			 @param {String} keyName The property to set
			 @param {Object} value The value to set or `null`.
			 @return {Ember.Observable}
			 */
			set: function(keyName, value) {
				set(this, keyName, value);
				return this;
			},

			/**
			 To set multiple properties at once, call `setProperties`
			 with a Hash:

			 ```javascript
			 record.setProperties({ firstName: 'Charles', lastName: 'Jolley' });
			 ```

			 @method setProperties
			 @param {Hash} hash the hash of keys and values to set
			 @return {Ember.Observable}
			 */
			setProperties: function(hash) {
				return Ember.setProperties(this, hash);
			},

			/**
			 Begins a grouping of property changes.

			 You can use this method to group property changes so that notifications
			 will not be sent until the changes are finished. If you plan to make a
			 large number of changes to an object at one time, you should call this
			 method at the beginning of the changes to begin deferring change
			 notifications. When you are done making changes, call
			 `endPropertyChanges()` to deliver the deferred change notifications and end
			 deferring.

			 @method beginPropertyChanges
			 @return {Ember.Observable}
			 */
			beginPropertyChanges: function() {
				Ember.beginPropertyChanges();
				return this;
			},

			/**
			 Ends a grouping of property changes.

			 You can use this method to group property changes so that notifications
			 will not be sent until the changes are finished. If you plan to make a
			 large number of changes to an object at one time, you should call
			 `beginPropertyChanges()` at the beginning of the changes to defer change
			 notifications. When you are done making changes, call this method to
			 deliver the deferred change notifications and end deferring.

			 @method endPropertyChanges
			 @return {Ember.Observable}
			 */
			endPropertyChanges: function() {
				Ember.endPropertyChanges();
				return this;
			},

			/**
			 Notify the observer system that a property is about to change.

			 Sometimes you need to change a value directly or indirectly without
			 actually calling `get()` or `set()` on it. In this case, you can use this
			 method and `propertyDidChange()` instead. Calling these two methods
			 together will notify all observers that the property has potentially
			 changed value.

			 Note that you must always call `propertyWillChange` and `propertyDidChange`
			 as a pair. If you do not, it may get the property change groups out of
			 order and cause notifications to be delivered more often than you would
			 like.

			 @method propertyWillChange
			 @param {String} keyName The property key that is about to change.
			 @return {Ember.Observable}
			 */
			propertyWillChange: function(keyName) {
				Ember.propertyWillChange(this, keyName);
				return this;
			},

			/**
			 Notify the observer system that a property has just changed.

			 Sometimes you need to change a value directly or indirectly without
			 actually calling `get()` or `set()` on it. In this case, you can use this
			 method and `propertyWillChange()` instead. Calling these two methods
			 together will notify all observers that the property has potentially
			 changed value.

			 Note that you must always call `propertyWillChange` and `propertyDidChange`
			 as a pair. If you do not, it may get the property change groups out of
			 order and cause notifications to be delivered more often than you would
			 like.

			 @method propertyDidChange
			 @param {String} keyName The property key that has just changed.
			 @return {Ember.Observable}
			 */
			propertyDidChange: function(keyName) {
				Ember.propertyDidChange(this, keyName);
				return this;
			},

			/**
			 Convenience method to call `propertyWillChange` and `propertyDidChange` in
			 succession.

			 @method notifyPropertyChange
			 @param {String} keyName The property key to be notified about.
			 @return {Ember.Observable}
			 */
			notifyPropertyChange: function(keyName) {
				this.propertyWillChange(keyName);
				this.propertyDidChange(keyName);
				return this;
			},

			addBeforeObserver: function(key, target, method) {
				Ember.addBeforeObserver(this, key, target, method);
			},

			/**
			 Adds an observer on a property.

			 This is the core method used to register an observer for a property.

			 Once you call this method, any time the key's value is set, your observer
			 will be notified. Note that the observers are triggered any time the
			 value is set, regardless of whether it has actually changed. Your
			 observer should be prepared to handle that.

			 You can also pass an optional context parameter to this method. The
			 context will be passed to your observer method whenever it is triggered.
			 Note that if you add the same target/method pair on a key multiple times
			 with different context parameters, your observer will only be called once
			 with the last context you passed.

			 ### Observer Methods

			 Observer methods you pass should generally have the following signature if
			 you do not pass a `context` parameter:

			 ```javascript
			 fooDidChange: function(sender, key, value, rev) { };
			 ```

			 The sender is the object that changed. The key is the property that
			 changes. The value property is currently reserved and unused. The rev
			 is the last property revision of the object when it changed, which you can
			 use to detect if the key value has really changed or not.

			 If you pass a `context` parameter, the context will be passed before the
			 revision like so:

			 ```javascript
			 fooDidChange: function(sender, key, value, context, rev) { };
			 ```

			 Usually you will not need the value, context or revision parameters at
			 the end. In this case, it is common to write observer methods that take
			 only a sender and key value as parameters or, if you aren't interested in
			 any of these values, to write an observer that has no parameters at all.

			 @method addObserver
			 @param {String} key The key to observer
			 @param {Object} target The target object to invoke
			 @param {String|Function} method The method to invoke.
			 @return {Ember.Object} self
			 */
			addObserver: function(key, target, method) {
				Ember.addObserver(this, key, target, method);
			},

			/**
			 Remove an observer you have previously registered on this object. Pass
			 the same key, target, and method you passed to `addObserver()` and your
			 target will no longer receive notifications.

			 @method removeObserver
			 @param {String} key The key to observer
			 @param {Object} target The target object to invoke
			 @param {String|Function} method The method to invoke.
			 @return {Ember.Observable} receiver
			 */
			removeObserver: function(key, target, method) {
				Ember.removeObserver(this, key, target, method);
			},

			/**
			 Returns `true` if the object currently has observers registered for a
			 particular key. You can use this method to potentially defer performing
			 an expensive action until someone begins observing a particular property
			 on the object.

			 @method hasObserverFor
			 @param {String} key Key to check
			 @return {Boolean}
			 */
			hasObserverFor: function(key) {
				return Ember.hasListeners(this, key+':change');
			},

			/**
			 @deprecated
			 @method getPath
			 @param {String} path The property path to retrieve
			 @return {Object} The property value or undefined.
			 */
			getPath: function(path) {

				return this.get(path);
			},

			/**
			 @deprecated
			 @method setPath
			 @param {String} path The path to the property that will be set
			 @param {Object} value The value to set or `null`.
			 @return {Ember.Observable}
			 */
			setPath: function(path, value) {

				return this.set(path, value);
			},

			/**
			 Retrieves the value of a property, or a default value in the case that the
			 property returns `undefined`.

			 ```javascript
			 person.getWithDefault('lastName', 'Doe');
			 ```

			 @method getWithDefault
			 @param {String} keyName The name of the property to retrieve
			 @param {Object} defaultValue The value to return if the property value is undefined
			 @return {Object} The property value or the defaultValue.
			 */
			getWithDefault: function(keyName, defaultValue) {
				return Ember.getWithDefault(this, keyName, defaultValue);
			},

			/**
			 Set the value of a property to the current value plus some amount.

			 ```javascript
			 person.incrementProperty('age');
			 team.incrementProperty('score', 2);
			 ```

			 @method incrementProperty
			 @param {String} keyName The name of the property to increment
			 @param {Number} increment The amount to increment by. Defaults to 1
			 @return {Number} The new property value
			 */
			incrementProperty: function(keyName, increment) {
				if (Ember.isNone(increment)) { increment = 1; }

				set(this, keyName, (get(this, keyName) || 0) + increment);
				return get(this, keyName);
			},

			/**
			 Set the value of a property to the current value minus some amount.

			 ```javascript
			 player.decrementProperty('lives');
			 orc.decrementProperty('health', 5);
			 ```

			 @method decrementProperty
			 @param {String} keyName The name of the property to decrement
			 @param {Number} decrement The amount to decrement by. Defaults to 1
			 @return {Number} The new property value
			 */
			decrementProperty: function(keyName, decrement) {
				if (Ember.isNone(decrement)) { decrement = 1; }

				set(this, keyName, (get(this, keyName) || 0) - decrement);
				return get(this, keyName);
			},

			/**
			 Set the value of a boolean property to the opposite of it's
			 current value.

			 ```javascript
			 starship.toggleProperty('warpDriveEngaged');
			 ```

			 @method toggleProperty
			 @param {String} keyName The name of the property to toggle
			 @return {Object} The new property value
			 */
			toggleProperty: function(keyName) {
				set(this, keyName, !get(this, keyName));
				return get(this, keyName);
			},

			/**
			 Returns the cached value of a computed property, if it exists.
			 This allows you to inspect the value of a computed property
			 without accidentally invoking it if it is intended to be
			 generated lazily.

			 @method cacheFor
			 @param {String} keyName
			 @return {Object} The cached value of the computed property, if any
			 */
			cacheFor: function(keyName) {
				return Ember.cacheFor(this, keyName);
			},

			// intended for debugging purposes
			observersForKey: function(keyName) {
				return Ember.observersFor(this, keyName);
			}
		});

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-runtime
		 */

		var get = Ember.get, set = Ember.set;

		/**
		 `Ember.TargetActionSupport` is a mixin that can be included in a class
		 to add a `triggerAction` method with semantics similar to the Handlebars
		 `{{action}}` helper. In normal Ember usage, the `{{action}}` helper is
		 usually the best choice. This mixin is most often useful when you are
		 doing more complex event handling in View objects.

		 See also `Ember.ViewTargetActionSupport`, which has
		 view-aware defaults for target and actionContext.

		 @class TargetActionSupport
		 @namespace Ember
		 @extends Ember.Mixin
		 */
		Ember.TargetActionSupport = Ember.Mixin.create({
			target: null,
			action: null,
			actionContext: null,

			targetObject: Ember.computed(function() {
				var target = get(this, 'target');

				if (Ember.typeOf(target) === "string") {
					var value = get(this, target);
					if (value === undefined) { value = get(Ember.lookup, target); }
					return value;
				} else {
					return target;
				}
			}).property('target'),

			actionContextObject: Ember.computed(function() {
				var actionContext = get(this, 'actionContext');

				if (Ember.typeOf(actionContext) === "string") {
					var value = get(this, actionContext);
					if (value === undefined) { value = get(Ember.lookup, actionContext); }
					return value;
				} else {
					return actionContext;
				}
			}).property('actionContext'),

			/**
			 Send an "action" with an "actionContext" to a "target". The action, actionContext
			 and target will be retrieved from properties of the object. For example:

			 ```javascript
			 App.SaveButtonView = Ember.View.extend(Ember.TargetActionSupport, {
    target: Ember.computed.alias('controller'),
    action: 'save',
    actionContext: Ember.computed.alias('context'),
    click: function() {
      this.triggerAction(); // Sends the `save` action, along with the current context
                            // to the current controller
    }
  });
			 ```

			 The `target`, `action`, and `actionContext` can be provided as properties of
			 an optional object argument to `triggerAction` as well.

			 ```javascript
			 App.SaveButtonView = Ember.View.extend(Ember.TargetActionSupport, {
    click: function() {
      this.triggerAction({
        action: 'save',
        target: this.get('controller'),
        actionContext: this.get('context'),
      }); // Sends the `save` action, along with the current context
          // to the current controller
    }
  });
			 ```

			 The `actionContext` defaults to the object you mixing `TargetActionSupport` into.
			 But `target` and `action` must be specified either as properties or with the argument
			 to `triggerAction`, or a combination:

			 ```javascript
			 App.SaveButtonView = Ember.View.extend(Ember.TargetActionSupport, {
    target: Ember.computed.alias('controller'),
    click: function() {
      this.triggerAction({
        action: 'save'
      }); // Sends the `save` action, along with a reference to `this`,
          // to the current controller
    }
  });
			 ```

			 @method triggerAction
			 @param opts {Hash} (optional, with the optional keys action, target and/or actionContext)
			 @return {Boolean} true if the action was sent successfully and did not return false
			 */
			triggerAction: function(opts) {
				opts = opts || {};
				var action = opts['action'] || get(this, 'action'),
					target = opts['target'] || get(this, 'targetObject'),
					actionContext = opts['actionContext'] || get(this, 'actionContextObject') || this;

				if (target && action) {
					var ret;

					if (target.send) {
						ret = target.send.apply(target, [action, actionContext]);
					} else {

						ret = target[action].apply(target, [actionContext]);
					}

					if (ret !== false) ret = true;

					return ret;
				} else {
					return false;
				}
			}
		});

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-runtime
		 */

		/**
		 This mixin allows for Ember objects to subscribe to and emit events.

		 ```javascript
		 App.Person = Ember.Object.extend(Ember.Evented, {
    greet: function() {
      // ...
      this.trigger('greet');
    }
  });

		 var person = App.Person.create();

		 person.on('greet', function() {
    console.log('Our person has greeted');
  });

		 person.greet();

		 // outputs: 'Our person has greeted'
		 ```

		 You can also chain multiple event subscriptions:

		 ```javascript
		 person.on('greet', function() {
    console.log('Our person has greeted');
  }).one('greet', function() {
    console.log('Offer one-time special');
  }).off('event', this, forgetThis);
		 ```

		 @class Evented
		 @namespace Ember
		 */
		Ember.Evented = Ember.Mixin.create({

			/**
			 Subscribes to a named event with given function.

			 ```javascript
			 person.on('didLoad', function() {
     // fired once the person has loaded
   });
			 ```

			 An optional target can be passed in as the 2nd argument that will
			 be set as the "this" for the callback. This is a good way to give your
			 function access to the object triggering the event. When the target
			 parameter is used the callback becomes the third argument.

			 @method on
			 @param {String} name The name of the event
			 @param {Object} [target] The "this" binding for the callback
			 @param {Function} method The callback to execute
			 @return this
			 */
			on: function(name, target, method) {
				Ember.addListener(this, name, target, method);
				return this;
			},

			/**
			 Subscribes a function to a named event and then cancels the subscription
			 after the first time the event is triggered. It is good to use ``one`` when
			 you only care about the first time an event has taken place.

			 This function takes an optional 2nd argument that will become the "this"
			 value for the callback. If this argument is passed then the 3rd argument
			 becomes the function.

			 @method one
			 @param {String} name The name of the event
			 @param {Object} [target] The "this" binding for the callback
			 @param {Function} method The callback to execute
			 @return this
			 */
			one: function(name, target, method) {
				if (!method) {
					method = target;
					target = null;
				}

				Ember.addListener(this, name, target, method, true);
				return this;
			},

			/**
			 Triggers a named event for the object. Any additional arguments
			 will be passed as parameters to the functions that are subscribed to the
			 event.

			 ```javascript
			 person.on('didEat', function(food) {
      console.log('person ate some ' + food);
    });

			 person.trigger('didEat', 'broccoli');

			 // outputs: person ate some broccoli
			 ```
			 @method trigger
			 @param {String} name The name of the event
			 @param {Object...} args Optional arguments to pass on
			 */
			trigger: function(name) {
				var args = [], i, l;
				for (i = 1, l = arguments.length; i < l; i++) {
					args.push(arguments[i]);
				}
				Ember.sendEvent(this, name, args);
			},

			/**
			 Cancels subscription for given name, target, and method.

			 @method off
			 @param {String} name The name of the event
			 @param {Object} target The target of the subscription
			 @param {Function} method The function of the subscription
			 @return this
			 */
			off: function(name, target, method) {
				Ember.removeListener(this, name, target, method);
				return this;
			},

			/**
			 Checks to see if object has any subscriptions for named event.

			 @method has
			 @param {String} name The name of the event
			 @return {Boolean} does the object have a subscription for event
			 */
			has: function(name) {
				return Ember.hasListeners(this, name);
			}
		});

	})();



	(function() {
		var RSVP = requireModule("rsvp");

		RSVP.configure('async', function(callback, promise) {
			Ember.run.schedule('actions', promise, callback, promise);
		});

		/**
		 @module ember
		 @submodule ember-runtime
		 */

		var get = Ember.get;

		/**
		 @class Deferred
		 @namespace Ember
		 */
		Ember.DeferredMixin = Ember.Mixin.create({
			/**
			 Add handlers to be called when the Deferred object is resolved or rejected.

			 @method then
			 @param {Function} resolve a callback function to be called when done
			 @param {Function} reject  a callback function to be called when failed
			 */
			then: function(resolve, reject) {
				var deferred, promise, entity;

				entity = this;
				deferred = get(this, '_deferred');
				promise = deferred.promise;

				function fulfillmentHandler(fulfillment) {
					if (fulfillment === promise) {
						return resolve(entity);
					} else {
						return resolve(fulfillment);
					}
				}

				return promise.then(resolve && fulfillmentHandler, reject);
			},

			/**
			 Resolve a Deferred object and call any `doneCallbacks` with the given args.

			 @method resolve
			 */
			resolve: function(value) {
				var deferred, promise;

				deferred = get(this, '_deferred');
				promise = deferred.promise;

				if (value === this) {
					deferred.resolve(promise);
				} else {
					deferred.resolve(value);
				}
			},

			/**
			 Reject a Deferred object and call any `failCallbacks` with the given args.

			 @method reject
			 */
			reject: function(value) {
				get(this, '_deferred').reject(value);
			},

			_deferred: Ember.computed(function() {
				return RSVP.defer();
			})
		});


	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-runtime
		 */

		var get = Ember.get;

		/**
		 The `Ember.ActionHandler` mixin implements support for moving an `actions`
		 property to an `_actions` property at extend time, and adding `_actions`
		 to the object's mergedProperties list.

		 `Ember.ActionHandler` is used internally by Ember in  `Ember.View`,
		 `Ember.Controller`, and `Ember.Route`.

		 @class ActionHandler
		 @namespace Ember
		 */
		Ember.ActionHandler = Ember.Mixin.create({
			mergedProperties: ['_actions'],

			/**
			 @private

			 Moves `actions` to `_actions` at extend time. Note that this currently
			 modifies the mixin themselves, which is technically dubious but
			 is practically of little consequence. This may change in the future.

			 @method willMergeMixin
			 */
			willMergeMixin: function(props) {
				if (props.actions && !props._actions) {
					props._actions = Ember.merge(props._actions || {}, props.actions);
					delete props.actions;
				}
			},

			send: function(actionName) {
				var args = [].slice.call(arguments, 1), target;

				if (this._actions && this._actions[actionName]) {
					if (this._actions[actionName].apply(this, args) === true) {
						// handler returned true, so this action will bubble
					} else {
						return;
					}
				} else if (this.deprecatedSend && this.deprecatedSendHandles && this.deprecatedSendHandles(actionName)) {
					if (this.deprecatedSend.apply(this, [].slice.call(arguments)) === true) {
						// handler return true, so this action will bubble
					} else {
						return;
					}
				}

				if (target = get(this, 'target')) {

					target.send.apply(target, arguments);
				}
			}

		});

	})();



	(function() {
		var set = Ember.set, get = Ember.get,
			resolve = Ember.RSVP.resolve,
			rethrow = Ember.RSVP.rethrow,
			not = Ember.computed.not,
			or = Ember.computed.or;

		/**
		 @module ember
		 @submodule ember-runtime
		 */

		function installPromise(proxy, promise) {
			promise.then(function(value) {
				set(proxy, 'isFulfilled', true);
				set(proxy, 'content', value);

				return value;
			}, function(reason) {
				set(proxy, 'isRejected', true);
				set(proxy, 'reason', reason);
			}).fail(rethrow);
		}

		/**
		 A low level mixin making ObjectProxy, ObjectController or ArrayController's promise aware.

		 ```javascript
		 var ObjectPromiseController = Ember.ObjectController.extend(Ember.PromiseProxyMixin);

		 var controller = ObjectPromiseController.create({
    promise: $.getJSON('/some/remote/data.json')
  });

		 controller.then(function(json){
     // the json
  }, function(reason) {
     // the reason why you have no json
  });
		 ```

		 the controller has bindable attributes which
		 track the promises life cycle

		 ```javascript
		 controller.get('isPending')   //=> true
		 controller.get('isSettled')  //=> false
		 controller.get('isRejected')  //=> false
		 controller.get('isFulfilled') //=> false
		 ```

		 When the the $.getJSON completes, and the promise is fulfilled
		 with json, the life cycle attributes will update accordingly.

		 ```javascript
		 controller.get('isPending')   //=> false
		 controller.get('isSettled')   //=> true
		 controller.get('isRejected')  //=> false
		 controller.get('isFulfilled') //=> true
		 ```

		 As the controller is an ObjectController, and the json now its content,
		 all the json properties will be available directly from the controller.

		 ```javascript
		 // Assuming the following json:
		 {
    firstName: 'Stefan',
    lastName: 'Penner'
  }

		 // both properties will accessible on the controller
		 controller.get('firstName') //=> 'Stefan'
		 controller.get('lastName')  //=> 'Penner'
		 ```

		 If the controller is backing a template, the attributes are
		 bindable from within that template
		 ```handlebars
		 {{#if isPending}}
		 loading...
		 {{else}}
		 firstName: {{firstName}}
		 lastName: {{lastName}}
		 {{/if}}
		 ```
		 @class Ember.PromiseProxyMixin
		 */
		Ember.PromiseProxyMixin = Ember.Mixin.create({
			reason:    null,
			isPending:  not('isSettled').readOnly(),
			isSettled:  or('isRejected', 'isFulfilled').readOnly(),
			isRejected:  false,
			isFulfilled: false,

			promise: Ember.computed(function(key, promise) {
				if (arguments.length === 2) {
					promise = resolve(promise);
					installPromise(this, promise);
					return promise;
				} else {
					throw new Error("PromiseProxy's promise must be set");
				}
			}),

			then: function(fulfill, reject) {
				return get(this, 'promise').then(fulfill, reject);
			}
		});


	})();



	(function() {

	})();



	(function() {
		var get = Ember.get,
			forEach = Ember.EnumerableUtils.forEach,
			RETAIN = 'r',
			INSERT = 'i',
			DELETE = 'd';

		/**
		 An `Ember.TrackedArray` tracks array operations.  It's useful when you want to
		 lazily compute the indexes of items in an array after they've been shifted by
		 subsequent operations.

		 @class TrackedArray
		 @namespace Ember
		 @param {array} [items=[]] The array to be tracked.  This is used just to get
		 the initial items for the starting state of retain:n.
		 */
		Ember.TrackedArray = function (items) {
			if (arguments.length < 1) { items = []; }

			var length = get(items, 'length');

			if (length) {
				this._content = [new ArrayOperation(RETAIN, length, items)];
			} else {
				this._content = [];
			}
		};

		Ember.TrackedArray.RETAIN = RETAIN;
		Ember.TrackedArray.INSERT = INSERT;
		Ember.TrackedArray.DELETE = DELETE;

		Ember.TrackedArray.prototype = {

			/**
			 Track that `newItems` were added to the tracked array at `index`.

			 @method addItems
			 @param index
			 @param newItems
			 */
			addItems: function (index, newItems) {
				var count = get(newItems, 'length'),
					match = this._findArrayOperation(index),
					arrayOperation = match.operation,
					arrayOperationIndex = match.index,
					arrayOperationRangeStart = match.rangeStart,
					composeIndex,
					splitIndex,
					splitItems,
					splitArrayOperation,
					newArrayOperation;

				newArrayOperation = new ArrayOperation(INSERT, count, newItems);

				if (arrayOperation) {
					if (!match.split) {
						// insert left of arrayOperation
						this._content.splice(arrayOperationIndex, 0, newArrayOperation);
						composeIndex = arrayOperationIndex;
					} else {
						this._split(arrayOperationIndex, index - arrayOperationRangeStart, newArrayOperation);
						composeIndex = arrayOperationIndex + 1;
					}
				} else {
					// insert at end
					this._content.push(newArrayOperation);
					composeIndex = arrayOperationIndex;
				}

				this._composeInsert(composeIndex);
			},

			/**
			 Track that `count` items were removed at `index`.

			 @method removeItems
			 @param index
			 @param count
			 */
			removeItems: function (index, count) {
				var match = this._findArrayOperation(index),
					arrayOperation = match.operation,
					arrayOperationIndex = match.index,
					arrayOperationRangeStart = match.rangeStart,
					newArrayOperation,
					composeIndex;

				newArrayOperation = new ArrayOperation(DELETE, count);
				if (!match.split) {
					// insert left of arrayOperation
					this._content.splice(arrayOperationIndex, 0, newArrayOperation);
					composeIndex = arrayOperationIndex;
				} else {
					this._split(arrayOperationIndex, index - arrayOperationRangeStart, newArrayOperation);
					composeIndex = arrayOperationIndex + 1;
				}

				return this._composeDelete(composeIndex);
			},

			/**
			 Apply all operations, reducing them to retain:n, for `n`, the number of
			 items in the array.

			 `callback` will be called for each operation and will be passed the following arguments:
			 - {array} items The items for the given operation
			 - {number} offset The computed offset of the items, ie the index in the
			 array of the first item for this operation.
			 - {string} operation The type of the operation.  One of
			 `Ember.TrackedArray.{RETAIN, DELETE, INSERT}`

			 @method apply

			 @param {function} callback
			 */
			apply: function (callback) {
				var items = [],
					offset = 0;

				forEach(this._content, function (arrayOperation) {
					callback(arrayOperation.items, offset, arrayOperation.operation);

					if (arrayOperation.operation !== DELETE) {
						offset += arrayOperation.count;
						items = items.concat(arrayOperation.items);
					}
				});

				this._content = [new ArrayOperation(RETAIN, items.length, items)];
			},

			/**
			 Return an ArrayOperationMatch for the operation that contains the item at `index`.

			 @method _findArrayOperation

			 @param {number} index the index of the item whose operation information
			 should be returned.
			 @private
			 */
			_findArrayOperation: function (index) {
				var arrayOperationIndex,
					len,
					split = false,
					arrayOperation,
					arrayOperationRangeStart,
					arrayOperationRangeEnd;

				// OPTIMIZE: we could search these faster if we kept a balanced tree.
				// find leftmost arrayOperation to the right of `index`
				for (arrayOperationIndex = arrayOperationRangeStart = 0, len = this._content.length; arrayOperationIndex < len; ++arrayOperationIndex) {
					arrayOperation = this._content[arrayOperationIndex];

					if (arrayOperation.operation === DELETE) { continue; }

					arrayOperationRangeEnd = arrayOperationRangeStart + arrayOperation.count - 1;

					if (index === arrayOperationRangeStart) {
						break;
					} else if (index > arrayOperationRangeStart && index <= arrayOperationRangeEnd) {
						split = true;
						break;
					} else {
						arrayOperationRangeStart = arrayOperationRangeEnd + 1;
					}
				}

				return new ArrayOperationMatch(arrayOperation, arrayOperationIndex, split, arrayOperationRangeStart);
			},

			_split: function (arrayOperationIndex, splitIndex, newArrayOperation) {
				var arrayOperation = this._content[arrayOperationIndex],
					splitItems = arrayOperation.items.slice(splitIndex),
					splitArrayOperation = new ArrayOperation(arrayOperation.operation, splitItems.length, splitItems);

				// truncate LHS
				arrayOperation.count = splitIndex;
				arrayOperation.items = arrayOperation.items.slice(0, splitIndex);

				this._content.splice(arrayOperationIndex + 1, 0, newArrayOperation, splitArrayOperation);
			},

			// TODO: unify _composeInsert, _composeDelete
			// see SubArray for a better implementation.
			_composeInsert: function (index) {
				var newArrayOperation = this._content[index],
					leftArrayOperation = this._content[index-1], // may be undefined
					rightArrayOperation = this._content[index+1], // may be undefined
					leftOp = leftArrayOperation && leftArrayOperation.operation,
					rightOp = rightArrayOperation && rightArrayOperation.operation;

				if (leftOp === INSERT) {
					// merge left
					leftArrayOperation.count += newArrayOperation.count;
					leftArrayOperation.items = leftArrayOperation.items.concat(newArrayOperation.items);

					if (rightOp === INSERT) {
						// also merge right
						leftArrayOperation.count += rightArrayOperation.count;
						leftArrayOperation.items = leftArrayOperation.items.concat(rightArrayOperation.items);
						this._content.splice(index, 2);
					} else {
						// only merge left
						this._content.splice(index, 1);
					}
				} else if (rightOp === INSERT) {
					// merge right
					newArrayOperation.count += rightArrayOperation.count;
					newArrayOperation.items = newArrayOperation.items.concat(rightArrayOperation.items);
					this._content.splice(index + 1, 1);
				}
			},

			_composeDelete: function (index) {
				var arrayOperation = this._content[index],
					deletesToGo = arrayOperation.count,
					leftArrayOperation = this._content[index-1], // may be undefined
					leftOp = leftArrayOperation && leftArrayOperation.operation,
					nextArrayOperation,
					nextOp,
					nextCount,
					removedItems = [];

				if (leftOp === DELETE) {
					arrayOperation = leftArrayOperation;
					index -= 1;
				}

				for (var i = index + 1; deletesToGo > 0; ++i) {
					nextArrayOperation = this._content[i];
					nextOp = nextArrayOperation.operation;
					nextCount = nextArrayOperation.count;

					if (nextOp === DELETE) {
						arrayOperation.count += nextCount;
						continue;
					}

					if (nextCount > deletesToGo) {
						removedItems = removedItems.concat(nextArrayOperation.items.splice(0, deletesToGo));
						nextArrayOperation.count -= deletesToGo;

						// In the case where we truncate the last arrayOperation, we don't need to
						// remove it; also the deletesToGo reduction is not the entirety of
						// nextCount
						i -= 1;
						nextCount = deletesToGo;

						deletesToGo = 0;
					} else {
						removedItems = removedItems.concat(nextArrayOperation.items);
						deletesToGo -= nextCount;
					}

					if (nextOp === INSERT) {
						arrayOperation.count -= nextCount;
					}
				}

				if (arrayOperation.count > 0) {
					this._content.splice(index+1, i-1-index);
				} else {
					// The delete operation can go away; it has merely reduced some other
					// operation, as in D:3 I:4
					this._content.splice(index, 1);
				}

				return removedItems;
			}
		};

		function ArrayOperation (operation, count, items) {
			this.operation = operation; // RETAIN | INSERT | DELETE
			this.count = count;
			this.items = items;
		}

		/**
		 Internal data structure used to include information when looking up operations
		 by item index.

		 @method ArrayOperationMatch
		 @private
		 @property {ArrayOperation} operation
		 @property {number} index The index of `operation` in the array of operations.
		 @property {boolean} split Whether or not the item index searched for would
		 require a split for a new operation type.
		 @property {number} rangeStart The index of the first item in the operation,
		 with respect to the tracked array.  The index of the last item can be computed
		 from `rangeStart` and `operation.count`.
		 */
		function ArrayOperationMatch(operation, index, split, rangeStart) {
			this.operation = operation;
			this.index = index;
			this.split = split;
			this.rangeStart = rangeStart;
		}

	})();



	(function() {
		var get = Ember.get,
			forEach = Ember.EnumerableUtils.forEach,
			RETAIN = 'r',
			FILTER = 'f';

		function Operation (type, count) {
			this.type = type;
			this.count = count;
		}

		/**
		 An `Ember.SubArray` tracks an array in a way similar to, but more specialized
		 than, `Ember.TrackedArray`.  It is useful for keeping track of the indexes of
		 items within a filtered array.

		 @class SubArray
		 @namespace Ember
		 */
		Ember.SubArray = function (length) {
			if (arguments.length < 1) { length = 0; }

			if (length > 0) {
				this._operations = [new Operation(RETAIN, length)];
			} else {
				this._operations = [];
			}
		};

		Ember.SubArray.prototype = {
			/**
			 Track that an item was added to the tracked array.

			 @method addItem

			 @param {number} index The index of the item in the tracked array.
			 @param {boolean} match `true` iff the item is included in the subarray.

			 @returns {number} The index of the item in the subarray.
			 */
			addItem: function(index, match) {
				var returnValue = -1,
					itemType = match ? RETAIN : FILTER,
					self = this;

				this._findOperation(index, function(operation, operationIndex, rangeStart, rangeEnd, seenInSubArray) {
					var newOperation, splitOperation;

					if (itemType === operation.type) {
						++operation.count;
					} else if (index === rangeStart) {
						// insert to the left of `operation`
						self._operations.splice(operationIndex, 0, new Operation(itemType, 1));
					} else {
						newOperation = new Operation(itemType, 1);
						splitOperation = new Operation(operation.type, rangeEnd - index + 1);
						operation.count = index - rangeStart;

						self._operations.splice(operationIndex + 1, 0, newOperation, splitOperation);
					}

					if (match) {
						if (operation.type === RETAIN) {
							returnValue = seenInSubArray + (index - rangeStart);
						} else {
							returnValue = seenInSubArray;
						}
					}

					self._composeAt(operationIndex);
				}, function(seenInSubArray) {
					self._operations.push(new Operation(itemType, 1));

					if (match) {
						returnValue = seenInSubArray;
					}

					self._composeAt(self._operations.length-1);
				});

				return returnValue;
			},

			/**
			 Track that an item was removed from the tracked array.

			 @method removeItem

			 @param {number} index The index of the item in the tracked array.

			 @returns {number} The index of the item in the subarray, or `-1` if the item
			 was not in the subarray.
			 */
			removeItem: function(index) {
				var returnValue = -1,
					self = this;

				this._findOperation(index, function (operation, operationIndex, rangeStart, rangeEnd, seenInSubArray) {
					if (operation.type === RETAIN) {
						returnValue = seenInSubArray + (index - rangeStart);
					}

					if (operation.count > 1) {
						--operation.count;
					} else {
						self._operations.splice(operationIndex, 1);
						self._composeAt(operationIndex);
					}
				});

				return returnValue;
			},


			_findOperation: function (index, foundCallback, notFoundCallback) {
				var operationIndex,
					len,
					operation,
					rangeStart,
					rangeEnd,
					seenInSubArray = 0;

				// OPTIMIZE: change to balanced tree
				// find leftmost operation to the right of `index`
				for (operationIndex = rangeStart = 0, len = this._operations.length; operationIndex < len; rangeStart = rangeEnd + 1, ++operationIndex) {
					operation = this._operations[operationIndex];
					rangeEnd = rangeStart + operation.count - 1;

					if (index >= rangeStart && index <= rangeEnd) {
						foundCallback(operation, operationIndex, rangeStart, rangeEnd, seenInSubArray);
						return;
					} else if (operation.type === RETAIN) {
						seenInSubArray += operation.count;
					}
				}

				notFoundCallback(seenInSubArray);
			},

			_composeAt: function(index) {
				var op = this._operations[index],
					otherOp;

				if (!op) {
					// Composing out of bounds is a no-op, as when removing the last operation
					// in the list.
					return;
				}

				if (index > 0) {
					otherOp = this._operations[index-1];
					if (otherOp.type === op.type) {
						op.count += otherOp.count;
						this._operations.splice(index-1, 1);
					}
				}

				if (index < this._operations.length-1) {
					otherOp = this._operations[index+1];
					if (otherOp.type === op.type) {
						op.count += otherOp.count;
						this._operations.splice(index+1, 1);
					}
				}
			}
		};

	})();



	(function() {
		Ember.Container = requireModule('container');
		Ember.Container.set = Ember.set;

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-runtime
		 */


// NOTE: this object should never be included directly. Instead use `Ember.Object`.
// We only define this separately so that `Ember.Set` can depend on it.


		var set = Ember.set, get = Ember.get,
			o_create = Ember.create,
			o_defineProperty = Ember.platform.defineProperty,
			GUID_KEY = Ember.GUID_KEY,
			guidFor = Ember.guidFor,
			generateGuid = Ember.generateGuid,
			meta = Ember.meta,
			rewatch = Ember.rewatch,
			finishChains = Ember.finishChains,
			sendEvent = Ember.sendEvent,
			destroy = Ember.destroy,
			schedule = Ember.run.schedule,
			Mixin = Ember.Mixin,
			applyMixin = Mixin._apply,
			finishPartial = Mixin.finishPartial,
			reopen = Mixin.prototype.reopen,
			MANDATORY_SETTER = Ember.ENV.MANDATORY_SETTER,
			indexOf = Ember.EnumerableUtils.indexOf;

		var undefinedDescriptor = {
			configurable: true,
			writable: true,
			enumerable: false,
			value: undefined
		};

		function makeCtor() {

			// Note: avoid accessing any properties on the object since it makes the
			// method a lot faster. This is glue code so we want it to be as fast as
			// possible.

			var wasApplied = false, initMixins, initProperties;

			var Class = function() {
				if (!wasApplied) {
					Class.proto(); // prepare prototype...
				}
				o_defineProperty(this, GUID_KEY, undefinedDescriptor);
				o_defineProperty(this, '_super', undefinedDescriptor);
				var m = meta(this), proto = m.proto;
				m.proto = this;
				if (initMixins) {
					// capture locally so we can clear the closed over variable
					var mixins = initMixins;
					initMixins = null;
					this.reopen.apply(this, mixins);
				}
				if (initProperties) {
					// capture locally so we can clear the closed over variable
					var props = initProperties;
					initProperties = null;

					var concatenatedProperties = this.concatenatedProperties;

					for (var i = 0, l = props.length; i < l; i++) {
						var properties = props[i];


						for (var keyName in properties) {
							if (!properties.hasOwnProperty(keyName)) { continue; }

							var value = properties[keyName],
								IS_BINDING = Ember.IS_BINDING;

							if (IS_BINDING.test(keyName)) {
								var bindings = m.bindings;
								if (!bindings) {
									bindings = m.bindings = {};
								} else if (!m.hasOwnProperty('bindings')) {
									bindings = m.bindings = o_create(m.bindings);
								}
								bindings[keyName] = value;
							}

							var desc = m.descs[keyName];




							if (concatenatedProperties && indexOf(concatenatedProperties, keyName) >= 0) {
								var baseValue = this[keyName];

								if (baseValue) {
									if ('function' === typeof baseValue.concat) {
										value = baseValue.concat(value);
									} else {
										value = Ember.makeArray(baseValue).concat(value);
									}
								} else {
									value = Ember.makeArray(value);
								}
							}

							if (desc) {
								desc.set(this, keyName, value);
							} else {
								if (typeof this.setUnknownProperty === 'function' && !(keyName in this)) {
									this.setUnknownProperty(keyName, value);
								} else if (MANDATORY_SETTER) {
									Ember.defineProperty(this, keyName, null, value); // setup mandatory setter
								} else {
									this[keyName] = value;
								}
							}
						}
					}
				}
				finishPartial(this, m);
				this.init.apply(this, arguments);
				m.proto = proto;
				finishChains(this);
				sendEvent(this, "init");
			};

			Class.toString = Mixin.prototype.toString;
			Class.willReopen = function() {
				if (wasApplied) {
					Class.PrototypeMixin = Mixin.create(Class.PrototypeMixin);
				}

				wasApplied = false;
			};
			Class._initMixins = function(args) { initMixins = args; };
			Class._initProperties = function(args) { initProperties = args; };

			Class.proto = function() {
				var superclass = Class.superclass;
				if (superclass) { superclass.proto(); }

				if (!wasApplied) {
					wasApplied = true;
					Class.PrototypeMixin.applyPartial(Class.prototype);
					rewatch(Class.prototype);
				}

				return this.prototype;
			};

			return Class;

		}

		/**
		 @class CoreObject
		 @namespace Ember
		 */
		var CoreObject = makeCtor();
		CoreObject.toString = function() { return "Ember.CoreObject"; };

		CoreObject.PrototypeMixin = Mixin.create({
			reopen: function() {
				applyMixin(this, arguments, true);
				return this;
			},

			/**
			 An overridable method called when objects are instantiated. By default,
			 does nothing unless it is overridden during class definition.

			 Example:

			 ```javascript
			 App.Person = Ember.Object.extend({
      init: function() {
        this._super();
        alert('Name is ' + this.get('name'));
      }
    });

			 var steve = App.Person.create({
      name: "Steve"
    });

			 // alerts 'Name is Steve'.
			 ```

			 NOTE: If you do override `init` for a framework class like `Ember.View` or
			 `Ember.ArrayController`, be sure to call `this._super()` in your
			 `init` declaration! If you don't, Ember may not have an opportunity to
			 do important setup work, and you'll see strange behavior in your
			 application.

			 @method init
			 */
			init: function() {},

			/**
			 Defines the properties that will be concatenated from the superclass
			 (instead of overridden).

			 By default, when you extend an Ember class a property defined in
			 the subclass overrides a property with the same name that is defined
			 in the superclass. However, there are some cases where it is preferable
			 to build up a property's value by combining the superclass' property
			 value with the subclass' value. An example of this in use within Ember
			 is the `classNames` property of `Ember.View`.

			 Here is some sample code showing the difference between a concatenated
			 property and a normal one:

			 ```javascript
			 App.BarView = Ember.View.extend({
      someNonConcatenatedProperty: ['bar'],
      classNames: ['bar']
    });

			 App.FooBarView = App.BarView.extend({
      someNonConcatenatedProperty: ['foo'],
      classNames: ['foo'],
    });

			 var fooBarView = App.FooBarView.create();
			 fooBarView.get('someNonConcatenatedProperty'); // ['foo']
			 fooBarView.get('classNames'); // ['ember-view', 'bar', 'foo']
			 ```

			 This behavior extends to object creation as well. Continuing the
			 above example:

			 ```javascript
			 var view = App.FooBarView.create({
      someNonConcatenatedProperty: ['baz'],
      classNames: ['baz']
    })
			 view.get('someNonConcatenatedProperty'); // ['baz']
			 view.get('classNames'); // ['ember-view', 'bar', 'foo', 'baz']
			 ```
			 Adding a single property that is not an array will just add it in the array:

			 ```javascript
			 var view = App.FooBarView.create({
      classNames: 'baz'
    })
			 view.get('classNames'); // ['ember-view', 'bar', 'foo', 'baz']
			 ```

			 Using the `concatenatedProperties` property, we can tell to Ember that mix
			 the content of the properties.

			 In `Ember.View` the `classNameBindings` and `attributeBindings` properties
			 are also concatenated, in addition to `classNames`.

			 This feature is available for you to use throughout the Ember object model,
			 although typical app developers are likely to use it infrequently.

			 @property concatenatedProperties
			 @type Array
			 @default null
			 */
			concatenatedProperties: null,

			/**
			 Destroyed object property flag.

			 if this property is `true` the observers and bindings were already
			 removed by the effect of calling the `destroy()` method.

			 @property isDestroyed
			 @default false
			 */
			isDestroyed: false,

			/**
			 Destruction scheduled flag. The `destroy()` method has been called.

			 The object stays intact until the end of the run loop at which point
			 the `isDestroyed` flag is set.

			 @property isDestroying
			 @default false
			 */
			isDestroying: false,

			/**
			 Destroys an object by setting the `isDestroyed` flag and removing its
			 metadata, which effectively destroys observers and bindings.

			 If you try to set a property on a destroyed object, an exception will be
			 raised.

			 Note that destruction is scheduled for the end of the run loop and does not
			 happen immediately.  It will set an isDestroying flag immediately.

			 @method destroy
			 @return {Ember.Object} receiver
			 */
			destroy: function() {
				if (this.isDestroying) { return; }
				this.isDestroying = true;

				schedule('actions', this, this.willDestroy);
				schedule('destroy', this, this._scheduledDestroy);
				return this;
			},

			/**
			 Override to implement teardown.

			 @method willDestroy
			 */
			willDestroy: Ember.K,

			/**
			 @private

			 Invoked by the run loop to actually destroy the object. This is
			 scheduled for execution by the `destroy` method.

			 @method _scheduledDestroy
			 */
			_scheduledDestroy: function() {
				if (this.isDestroyed) { return; }
				destroy(this);
				this.isDestroyed = true;
			},

			bind: function(to, from) {
				if (!(from instanceof Ember.Binding)) { from = Ember.Binding.from(from); }
				from.to(to).connect(this);
				return from;
			},

			/**
			 Returns a string representation which attempts to provide more information
			 than Javascript's `toString` typically does, in a generic way for all Ember
			 objects.

			 App.Person = Em.Object.extend()
			 person = App.Person.create()
			 person.toString() //=> "<App.Person:ember1024>"

			 If the object's class is not defined on an Ember namespace, it will
			 indicate it is a subclass of the registered superclass:

			 Student = App.Person.extend()
			 student = Student.create()
			 student.toString() //=> "<(subclass of App.Person):ember1025>"

			 If the method `toStringExtension` is defined, its return value will be
			 included in the output.

			 App.Teacher = App.Person.extend({
          toStringExtension: function() {
            return this.get('fullName');
          }
        });
			 teacher = App.Teacher.create()
			 teacher.toString(); //=> "<App.Teacher:ember1026:Tom Dale>"

			 @method toString
			 @return {String} string representation
			 */
			toString: function toString() {
				var hasToStringExtension = typeof this.toStringExtension === 'function',
					extension = hasToStringExtension ? ":" + this.toStringExtension() : '';
				var ret = '<'+this.constructor.toString()+':'+guidFor(this)+extension+'>';
				this.toString = makeToString(ret);
				return ret;
			}
		});

		CoreObject.PrototypeMixin.ownerConstructor = CoreObject;

		function makeToString(ret) {
			return function() { return ret; };
		}

		if (Ember.config.overridePrototypeMixin) {
			Ember.config.overridePrototypeMixin(CoreObject.PrototypeMixin);
		}

		CoreObject.__super__ = null;

		var ClassMixin = Mixin.create({

			ClassMixin: Ember.required(),

			PrototypeMixin: Ember.required(),

			isClass: true,

			isMethod: false,

			extend: function() {
				var Class = makeCtor(), proto;
				Class.ClassMixin = Mixin.create(this.ClassMixin);
				Class.PrototypeMixin = Mixin.create(this.PrototypeMixin);

				Class.ClassMixin.ownerConstructor = Class;
				Class.PrototypeMixin.ownerConstructor = Class;

				reopen.apply(Class.PrototypeMixin, arguments);

				Class.superclass = this;
				Class.__super__  = this.prototype;

				proto = Class.prototype = o_create(this.prototype);
				proto.constructor = Class;
				generateGuid(proto, 'ember');
				meta(proto).proto = proto; // this will disable observers on prototype

				Class.ClassMixin.apply(Class);
				return Class;
			},

			/**
			 Equivalent to doing `extend(arguments).create()`.
			 If possible use the normal `create` method instead.

			 @method createWithMixins
			 @static
			 @param [arguments]*
			 */
			createWithMixins: function() {
				var C = this;
				if (arguments.length>0) { this._initMixins(arguments); }
				return new C();
			},

			/**
			 Creates an instance of a class. Accepts either no arguments, or an object
			 containing values to initialize the newly instantiated object with.

			 ```javascript
			 App.Person = Ember.Object.extend({
      helloWorld: function() {
        alert("Hi, my name is " + this.get('name'));
      }
    });

			 var tom = App.Person.create({
      name: 'Tom Dale'
    });

			 tom.helloWorld(); // alerts "Hi, my name is Tom Dale".
			 ```

			 `create` will call the `init` function if defined during
			 `Ember.AnyObject.extend`

			 If no arguments are passed to `create`, it will not set values to the new
			 instance during initialization:

			 ```javascript
			 var noName = App.Person.create();
			 noName.helloWorld(); // alerts undefined
			 ```

			 NOTE: For performance reasons, you cannot declare methods or computed
			 properties during `create`. You should instead declare methods and computed
			 properties when using `extend` or use the `createWithMixins` shorthand.

			 @method create
			 @static
			 @param [arguments]*
			 */
			create: function() {
				var C = this;
				if (arguments.length>0) { this._initProperties(arguments); }
				return new C();
			},

			/**

			 Augments a constructor's prototype with additional
			 properties and functions:

			 ```javascript
			 MyObject = Ember.Object.extend({
      name: 'an object'
    });

			 o = MyObject.create();
			 o.get('name'); // 'an object'

			 MyObject.reopen({
      say: function(msg){
        console.log(msg);
      }
    })

			 o2 = MyObject.create();
			 o2.say("hello"); // logs "hello"

			 o.say("goodbye"); // logs "goodbye"
			 ```

			 To add functions and properties to the constructor itself,
			 see `reopenClass`

			 @method reopen
			 */
			reopen: function() {
				this.willReopen();
				reopen.apply(this.PrototypeMixin, arguments);
				return this;
			},

			/**
			 Augments a constructor's own properties and functions:

			 ```javascript
			 MyObject = Ember.Object.extend({
      name: 'an object'
    });


			 MyObject.reopenClass({
      canBuild: false
    });

			 MyObject.canBuild; // false
			 o = MyObject.create();
			 ```

			 To add functions and properties to instances of
			 a constructor by extending the constructor's prototype
			 see `reopen`

			 @method reopenClass
			 */
			reopenClass: function() {
				reopen.apply(this.ClassMixin, arguments);
				applyMixin(this, arguments, false);
				return this;
			},

			detect: function(obj) {
				if ('function' !== typeof obj) { return false; }
				while(obj) {
					if (obj===this) { return true; }
					obj = obj.superclass;
				}
				return false;
			},

			detectInstance: function(obj) {
				return obj instanceof this;
			},

			/**
			 In some cases, you may want to annotate computed properties with additional
			 metadata about how they function or what values they operate on. For
			 example, computed property functions may close over variables that are then
			 no longer available for introspection.

			 You can pass a hash of these values to a computed property like this:

			 ```javascript
			 person: function() {
      var personId = this.get('personId');
      return App.Person.create({ id: personId });
    }.property().meta({ type: App.Person })
			 ```

			 Once you've done this, you can retrieve the values saved to the computed
			 property from your class like this:

			 ```javascript
			 MyClass.metaForProperty('person');
			 ```

			 This will return the original hash that was passed to `meta()`.

			 @method metaForProperty
			 @param key {String} property name
			 */
			metaForProperty: function(key) {
				var desc = meta(this.proto(), false).descs[key];

				return desc._meta || {};
			},

			/**
			 Iterate over each computed property for the class, passing its name
			 and any associated metadata (see `metaForProperty`) to the callback.

			 @method eachComputedProperty
			 @param {Function} callback
			 @param {Object} binding
			 */
			eachComputedProperty: function(callback, binding) {
				var proto = this.proto(),
					descs = meta(proto).descs,
					empty = {},
					property;

				for (var name in descs) {
					property = descs[name];

					if (property instanceof Ember.ComputedProperty) {
						callback.call(binding || this, name, property._meta || empty);
					}
				}
			}

		});

		ClassMixin.ownerConstructor = CoreObject;

		if (Ember.config.overrideClassMixin) {
			Ember.config.overrideClassMixin(ClassMixin);
		}

		CoreObject.ClassMixin = ClassMixin;
		ClassMixin.apply(CoreObject);

		Ember.CoreObject = CoreObject;

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-runtime
		 */

		/**
		 `Ember.Object` is the main base class for all Ember objects. It is a subclass
		 of `Ember.CoreObject` with the `Ember.Observable` mixin applied. For details,
		 see the documentation for each of these.

		 @class Object
		 @namespace Ember
		 @extends Ember.CoreObject
		 @uses Ember.Observable
		 */
		Ember.Object = Ember.CoreObject.extend(Ember.Observable);
		Ember.Object.toString = function() { return "Ember.Object"; };

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-runtime
		 */

		var get = Ember.get, indexOf = Ember.ArrayPolyfills.indexOf;

		/**
		 A Namespace is an object usually used to contain other objects or methods
		 such as an application or framework. Create a namespace anytime you want
		 to define one of these new containers.

		 # Example Usage

		 ```javascript
		 MyFramework = Ember.Namespace.create({
    VERSION: '1.0.0'
  });
		 ```

		 @class Namespace
		 @namespace Ember
		 @extends Ember.Object
		 */
		var Namespace = Ember.Namespace = Ember.Object.extend({
			isNamespace: true,

			init: function() {
				Ember.Namespace.NAMESPACES.push(this);
				Ember.Namespace.PROCESSED = false;
			},

			toString: function() {
				var name = get(this, 'name');
				if (name) { return name; }

				findNamespaces();
				return this[Ember.GUID_KEY+'_name'];
			},

			nameClasses: function() {
				processNamespace([this.toString()], this, {});
			},

			destroy: function() {
				var namespaces = Ember.Namespace.NAMESPACES;
				Ember.lookup[this.toString()] = undefined;
				namespaces.splice(indexOf.call(namespaces, this), 1);
				this._super();
			}
		});

		Namespace.reopenClass({
			NAMESPACES: [Ember],
			NAMESPACES_BY_ID: {},
			PROCESSED: false,
			processAll: processAllNamespaces,
			byName: function(name) {
				if (!Ember.BOOTED) {
					processAllNamespaces();
				}

				return NAMESPACES_BY_ID[name];
			}
		});

		var NAMESPACES_BY_ID = Namespace.NAMESPACES_BY_ID;

		var hasOwnProp = ({}).hasOwnProperty,
			guidFor = Ember.guidFor;

		function processNamespace(paths, root, seen) {
			var idx = paths.length;

			NAMESPACES_BY_ID[paths.join('.')] = root;

			// Loop over all of the keys in the namespace, looking for classes
			for(var key in root) {
				if (!hasOwnProp.call(root, key)) { continue; }
				var obj = root[key];

				// If we are processing the `Ember` namespace, for example, the
				// `paths` will start with `["Ember"]`. Every iteration through
				// the loop will update the **second** element of this list with
				// the key, so processing `Ember.View` will make the Array
				// `['Ember', 'View']`.
				paths[idx] = key;

				// If we have found an unprocessed class
				if (obj && obj.toString === classToString) {
					// Replace the class' `toString` with the dot-separated path
					// and set its `NAME_KEY`
					obj.toString = makeToString(paths.join('.'));
					obj[NAME_KEY] = paths.join('.');

					// Support nested namespaces
				} else if (obj && obj.isNamespace) {
					// Skip aliased namespaces
					if (seen[guidFor(obj)]) { continue; }
					seen[guidFor(obj)] = true;

					// Process the child namespace
					processNamespace(paths, obj, seen);
				}
			}

			paths.length = idx; // cut out last item
		}

		function findNamespaces() {
			var Namespace = Ember.Namespace, lookup = Ember.lookup, obj, isNamespace;

			if (Namespace.PROCESSED) { return; }

			for (var prop in lookup) {
				// These don't raise exceptions but can cause warnings
				if (prop === "parent" || prop === "top" || prop === "frameElement" || prop === "webkitStorageInfo") { continue; }

				//  get(window.globalStorage, 'isNamespace') would try to read the storage for domain isNamespace and cause exception in Firefox.
				// globalStorage is a storage obsoleted by the WhatWG storage specification. See https://developer.mozilla.org/en/DOM/Storage#globalStorage
				if (prop === "globalStorage" && lookup.StorageList && lookup.globalStorage instanceof lookup.StorageList) { continue; }
				// Unfortunately, some versions of IE don't support window.hasOwnProperty
				if (lookup.hasOwnProperty && !lookup.hasOwnProperty(prop)) { continue; }

				// At times we are not allowed to access certain properties for security reasons.
				// There are also times where even if we can access them, we are not allowed to access their properties.
				try {
					obj = Ember.lookup[prop];
					isNamespace = obj && obj.isNamespace;
				} catch (e) {
					continue;
				}

				if (isNamespace) {

					obj[NAME_KEY] = prop;
				}
			}
		}

		var NAME_KEY = Ember.NAME_KEY = Ember.GUID_KEY + '_name';

		function superClassString(mixin) {
			var superclass = mixin.superclass;
			if (superclass) {
				if (superclass[NAME_KEY]) { return superclass[NAME_KEY]; }
				else { return superClassString(superclass); }
			} else {
				return;
			}
		}

		function classToString() {
			if (!Ember.BOOTED && !this[NAME_KEY]) {
				processAllNamespaces();
			}

			var ret;

			if (this[NAME_KEY]) {
				ret = this[NAME_KEY];
			} else if (this._toString) {
				ret = this._toString;
			} else {
				var str = superClassString(this);
				if (str) {
					ret = "(subclass of " + str + ")";
				} else {
					ret = "(unknown mixin)";
				}
				this.toString = makeToString(ret);
			}

			return ret;
		}

		function processAllNamespaces() {
			var unprocessedNamespaces = !Namespace.PROCESSED,
				unprocessedMixins = Ember.anyUnprocessedMixins;

			if (unprocessedNamespaces) {
				findNamespaces();
				Namespace.PROCESSED = true;
			}

			if (unprocessedNamespaces || unprocessedMixins) {
				var namespaces = Namespace.NAMESPACES, namespace;
				for (var i=0, l=namespaces.length; i<l; i++) {
					namespace = namespaces[i];
					processNamespace([namespace.toString()], namespace, {});
				}

				Ember.anyUnprocessedMixins = false;
			}
		}

		function makeToString(ret) {
			return function() { return ret; };
		}

		Ember.Mixin.prototype.toString = classToString;

	})();



	(function() {
		Ember.Application = Ember.Namespace.extend();

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-runtime
		 */

		var OUT_OF_RANGE_EXCEPTION = "Index out of range";
		var EMPTY = [];

		var get = Ember.get, set = Ember.set;

		/**
		 An ArrayProxy wraps any other object that implements `Ember.Array` and/or
		 `Ember.MutableArray,` forwarding all requests. This makes it very useful for
		 a number of binding use cases or other cases where being able to swap
		 out the underlying array is useful.

		 A simple example of usage:

		 ```javascript
		 var pets = ['dog', 'cat', 'fish'];
		 var ap = Ember.ArrayProxy.create({ content: Ember.A(pets) });

		 ap.get('firstObject');                        // 'dog'
		 ap.set('content', ['amoeba', 'paramecium']);
		 ap.get('firstObject');                        // 'amoeba'
		 ```

		 This class can also be useful as a layer to transform the contents of
		 an array, as they are accessed. This can be done by overriding
		 `objectAtContent`:

		 ```javascript
		 var pets = ['dog', 'cat', 'fish'];
		 var ap = Ember.ArrayProxy.create({
      content: Ember.A(pets),
      objectAtContent: function(idx) {
          return this.get('content').objectAt(idx).toUpperCase();
      }
  });

		 ap.get('firstObject'); // . 'DOG'
		 ```

		 @class ArrayProxy
		 @namespace Ember
		 @extends Ember.Object
		 @uses Ember.MutableArray
		 */
		Ember.ArrayProxy = Ember.Object.extend(Ember.MutableArray,/** @scope Ember.ArrayProxy.prototype */ {

			/**
			 The content array. Must be an object that implements `Ember.Array` and/or
			 `Ember.MutableArray.`

			 @property content
			 @type Ember.Array
			 */
			content: null,

			/**
			 The array that the proxy pretends to be. In the default `ArrayProxy`
			 implementation, this and `content` are the same. Subclasses of `ArrayProxy`
			 can override this property to provide things like sorting and filtering.

			 @property arrangedContent
			 */
			arrangedContent: Ember.computed.alias('content'),

			/**
			 Should actually retrieve the object at the specified index from the
			 content. You can override this method in subclasses to transform the
			 content item to something new.

			 This method will only be called if content is non-`null`.

			 @method objectAtContent
			 @param {Number} idx The index to retrieve.
			 @return {Object} the value or undefined if none found
			 */
			objectAtContent: function(idx) {
				return get(this, 'arrangedContent').objectAt(idx);
			},

			/**
			 Should actually replace the specified objects on the content array.
			 You can override this method in subclasses to transform the content item
			 into something new.

			 This method will only be called if content is non-`null`.

			 @method replaceContent
			 @param {Number} idx The starting index
			 @param {Number} amt The number of items to remove from the content.
			 @param {Array} objects Optional array of objects to insert or null if no
			 objects.
			 @return {void}
			 */
			replaceContent: function(idx, amt, objects) {
				get(this, 'content').replace(idx, amt, objects);
			},

			/**
			 @private

			 Invoked when the content property is about to change. Notifies observers that the
			 entire array content will change.

			 @method _contentWillChange
			 */
			_contentWillChange: Ember.beforeObserver(function() {
				this._teardownContent();
			}, 'content'),

			_teardownContent: function() {
				var content = get(this, 'content');

				if (content) {
					content.removeArrayObserver(this, {
						willChange: 'contentArrayWillChange',
						didChange: 'contentArrayDidChange'
					});
				}
			},

			contentArrayWillChange: Ember.K,
			contentArrayDidChange: Ember.K,

			/**
			 @private

			 Invoked when the content property changes. Notifies observers that the
			 entire array content has changed.

			 @method _contentDidChange
			 */
			_contentDidChange: Ember.observer(function() {
				var content = get(this, 'content');


				this._setupContent();
			}, 'content'),

			_setupContent: function() {
				var content = get(this, 'content');

				if (content) {
					content.addArrayObserver(this, {
						willChange: 'contentArrayWillChange',
						didChange: 'contentArrayDidChange'
					});
				}
			},

			_arrangedContentWillChange: Ember.beforeObserver(function() {
				var arrangedContent = get(this, 'arrangedContent'),
					len = arrangedContent ? get(arrangedContent, 'length') : 0;

				this.arrangedContentArrayWillChange(this, 0, len, undefined);
				this.arrangedContentWillChange(this);

				this._teardownArrangedContent(arrangedContent);
			}, 'arrangedContent'),

			_arrangedContentDidChange: Ember.observer(function() {
				var arrangedContent = get(this, 'arrangedContent'),
					len = arrangedContent ? get(arrangedContent, 'length') : 0;


				this._setupArrangedContent();

				this.arrangedContentDidChange(this);
				this.arrangedContentArrayDidChange(this, 0, undefined, len);
			}, 'arrangedContent'),

			_setupArrangedContent: function() {
				var arrangedContent = get(this, 'arrangedContent');

				if (arrangedContent) {
					arrangedContent.addArrayObserver(this, {
						willChange: 'arrangedContentArrayWillChange',
						didChange: 'arrangedContentArrayDidChange'
					});
				}
			},

			_teardownArrangedContent: function() {
				var arrangedContent = get(this, 'arrangedContent');

				if (arrangedContent) {
					arrangedContent.removeArrayObserver(this, {
						willChange: 'arrangedContentArrayWillChange',
						didChange: 'arrangedContentArrayDidChange'
					});
				}
			},

			arrangedContentWillChange: Ember.K,
			arrangedContentDidChange: Ember.K,

			objectAt: function(idx) {
				return get(this, 'content') && this.objectAtContent(idx);
			},

			length: Ember.computed(function() {
				var arrangedContent = get(this, 'arrangedContent');
				return arrangedContent ? get(arrangedContent, 'length') : 0;
				// No dependencies since Enumerable notifies length of change
			}),

			_replace: function(idx, amt, objects) {
				var content = get(this, 'content');

				if (content) this.replaceContent(idx, amt, objects);
				return this;
			},

			replace: function() {
				if (get(this, 'arrangedContent') === get(this, 'content')) {
					this._replace.apply(this, arguments);
				} else {
					throw new Ember.Error("Using replace on an arranged ArrayProxy is not allowed.");
				}
			},

			_insertAt: function(idx, object) {
				if (idx > get(this, 'content.length')) throw new Error(OUT_OF_RANGE_EXCEPTION);
				this._replace(idx, 0, [object]);
				return this;
			},

			insertAt: function(idx, object) {
				if (get(this, 'arrangedContent') === get(this, 'content')) {
					return this._insertAt(idx, object);
				} else {
					throw new Ember.Error("Using insertAt on an arranged ArrayProxy is not allowed.");
				}
			},

			removeAt: function(start, len) {
				if ('number' === typeof start) {
					var content = get(this, 'content'),
						arrangedContent = get(this, 'arrangedContent'),
						indices = [], i;

					if ((start < 0) || (start >= get(this, 'length'))) {
						throw new Error(OUT_OF_RANGE_EXCEPTION);
					}

					if (len === undefined) len = 1;

					// Get a list of indices in original content to remove
					for (i=start; i<start+len; i++) {
						// Use arrangedContent here so we avoid confusion with objects transformed by objectAtContent
						indices.push(content.indexOf(arrangedContent.objectAt(i)));
					}

					// Replace in reverse order since indices will change
					indices.sort(function(a,b) { return b - a; });

					Ember.beginPropertyChanges();
					for (i=0; i<indices.length; i++) {
						this._replace(indices[i], 1, EMPTY);
					}
					Ember.endPropertyChanges();
				}

				return this ;
			},

			pushObject: function(obj) {
				this._insertAt(get(this, 'content.length'), obj) ;
				return obj ;
			},

			pushObjects: function(objects) {
				if (!(Ember.Enumerable.detect(objects) || Ember.isArray(objects))) {
					throw new TypeError("Must pass Ember.Enumerable to Ember.MutableArray#pushObjects");
				}
				this._replace(get(this, 'length'), 0, objects);
				return this;
			},

			setObjects: function(objects) {
				if (objects.length === 0) return this.clear();

				var len = get(this, 'length');
				this._replace(0, len, objects);
				return this;
			},

			unshiftObject: function(obj) {
				this._insertAt(0, obj) ;
				return obj ;
			},

			unshiftObjects: function(objects) {
				this._replace(0, 0, objects);
				return this;
			},

			slice: function() {
				var arr = this.toArray();
				return arr.slice.apply(arr, arguments);
			},

			arrangedContentArrayWillChange: function(item, idx, removedCnt, addedCnt) {
				this.arrayContentWillChange(idx, removedCnt, addedCnt);
			},

			arrangedContentArrayDidChange: function(item, idx, removedCnt, addedCnt) {
				this.arrayContentDidChange(idx, removedCnt, addedCnt);
			},

			init: function() {
				this._super();
				this._setupContent();
				this._setupArrangedContent();
			},

			willDestroy: function() {
				this._teardownArrangedContent();
				this._teardownContent();
			}
		});

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-runtime
		 */

		var get = Ember.get,
			set = Ember.set,
			fmt = Ember.String.fmt,
			addBeforeObserver = Ember.addBeforeObserver,
			addObserver = Ember.addObserver,
			removeBeforeObserver = Ember.removeBeforeObserver,
			removeObserver = Ember.removeObserver,
			propertyWillChange = Ember.propertyWillChange,
			propertyDidChange = Ember.propertyDidChange,
			meta = Ember.meta,
			defineProperty = Ember.defineProperty;

		function contentPropertyWillChange(content, contentKey) {
			var key = contentKey.slice(8); // remove "content."
			if (key in this) { return; }  // if shadowed in proxy
			propertyWillChange(this, key);
		}

		function contentPropertyDidChange(content, contentKey) {
			var key = contentKey.slice(8); // remove "content."
			if (key in this) { return; } // if shadowed in proxy
			propertyDidChange(this, key);
		}

		/**
		 `Ember.ObjectProxy` forwards all properties not defined by the proxy itself
		 to a proxied `content` object.

		 ```javascript
		 object = Ember.Object.create({
    name: 'Foo'
  });

		 proxy = Ember.ObjectProxy.create({
    content: object
  });

		 // Access and change existing properties
		 proxy.get('name')          // 'Foo'
		 proxy.set('name', 'Bar');
		 object.get('name')         // 'Bar'

		 // Create new 'description' property on `object`
		 proxy.set('description', 'Foo is a whizboo baz');
		 object.get('description')  // 'Foo is a whizboo baz'
		 ```

		 While `content` is unset, setting a property to be delegated will throw an
		 Error.

		 ```javascript
		 proxy = Ember.ObjectProxy.create({
    content: null,
    flag: null
  });
		 proxy.set('flag', true);
		 proxy.get('flag');         // true
		 proxy.get('foo');          // undefined
		 proxy.set('foo', 'data');  // throws Error
		 ```

		 Delegated properties can be bound to and will change when content is updated.

		 Computed properties on the proxy itself can depend on delegated properties.

		 ```javascript
		 ProxyWithComputedProperty = Ember.ObjectProxy.extend({
    fullName: function () {
      var firstName = this.get('firstName'),
          lastName = this.get('lastName');
      if (firstName && lastName) {
        return firstName + ' ' + lastName;
      }
      return firstName || lastName;
    }.property('firstName', 'lastName')
  });

		 proxy = ProxyWithComputedProperty.create();

		 proxy.get('fullName');  // undefined
		 proxy.set('content', {
    firstName: 'Tom', lastName: 'Dale'
  }); // triggers property change for fullName on proxy

		 proxy.get('fullName');  // 'Tom Dale'
		 ```

		 @class ObjectProxy
		 @namespace Ember
		 @extends Ember.Object
		 */
		Ember.ObjectProxy = Ember.Object.extend(/** @scope Ember.ObjectProxy.prototype */ {
			/**
			 The object whose properties will be forwarded.

			 @property content
			 @type Ember.Object
			 @default null
			 */
			content: null,
			_contentDidChange: Ember.observer(function() {

			}, 'content'),

			isTruthy: Ember.computed.bool('content'),

			_debugContainerKey: null,

			willWatchProperty: function (key) {
				var contentKey = 'content.' + key;
				addBeforeObserver(this, contentKey, null, contentPropertyWillChange);
				addObserver(this, contentKey, null, contentPropertyDidChange);
			},

			didUnwatchProperty: function (key) {
				var contentKey = 'content.' + key;
				removeBeforeObserver(this, contentKey, null, contentPropertyWillChange);
				removeObserver(this, contentKey, null, contentPropertyDidChange);
			},

			unknownProperty: function (key) {
				var content = get(this, 'content');
				if (content) {
					return get(content, key);
				}
			},

			setUnknownProperty: function (key, value) {
				var m = meta(this);
				if (m.proto === this) {
					// if marked as prototype then just defineProperty
					// rather than delegate
					defineProperty(this, key, null, value);
					return value;
				}

				var content = get(this, 'content');

				return set(content, key, value);
			}

		});

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-runtime
		 */


		var set = Ember.set, get = Ember.get, guidFor = Ember.guidFor;
		var forEach = Ember.EnumerableUtils.forEach,
			indexOf = Ember.ArrayPolyfills.indexOf;

		var EachArray = Ember.Object.extend(Ember.Array, {

			init: function(content, keyName, owner) {
				this._super();
				this._keyName = keyName;
				this._owner   = owner;
				this._content = content;
			},

			objectAt: function(idx) {
				var item = this._content.objectAt(idx);
				return item && get(item, this._keyName);
			},

			length: Ember.computed(function() {
				var content = this._content;
				return content ? get(content, 'length') : 0;
			})

		});

		var IS_OBSERVER = /^.+:(before|change)$/;

		function addObserverForContentKey(content, keyName, proxy, idx, loc) {
			var objects = proxy._objects, guid;
			if (!objects) objects = proxy._objects = {};

			while(--loc>=idx) {
				var item = content.objectAt(loc);
				if (item) {

					Ember.addBeforeObserver(item, keyName, proxy, 'contentKeyWillChange');
					Ember.addObserver(item, keyName, proxy, 'contentKeyDidChange');

					// keep track of the index each item was found at so we can map
					// it back when the obj changes.
					guid = guidFor(item);
					if (!objects[guid]) objects[guid] = [];
					objects[guid].push(loc);
				}
			}
		}

		function removeObserverForContentKey(content, keyName, proxy, idx, loc) {
			var objects = proxy._objects;
			if (!objects) objects = proxy._objects = {};
			var indicies, guid;

			while(--loc>=idx) {
				var item = content.objectAt(loc);
				if (item) {
					Ember.removeBeforeObserver(item, keyName, proxy, 'contentKeyWillChange');
					Ember.removeObserver(item, keyName, proxy, 'contentKeyDidChange');

					guid = guidFor(item);
					indicies = objects[guid];
					indicies[indexOf.call(indicies, loc)] = null;
				}
			}
		}

		/**
		 This is the object instance returned when you get the `@each` property on an
		 array. It uses the unknownProperty handler to automatically create
		 EachArray instances for property names.

		 @private
		 @class EachProxy
		 @namespace Ember
		 @extends Ember.Object
		 */
		Ember.EachProxy = Ember.Object.extend({

			init: function(content) {
				this._super();
				this._content = content;
				content.addArrayObserver(this);

				// in case someone is already observing some keys make sure they are
				// added
				forEach(Ember.watchedEvents(this), function(eventName) {
					this.didAddListener(eventName);
				}, this);
			},

			/**
			 You can directly access mapped properties by simply requesting them.
			 The `unknownProperty` handler will generate an EachArray of each item.

			 @method unknownProperty
			 @param keyName {String}
			 @param value {*}
			 */
			unknownProperty: function(keyName, value) {
				var ret;
				ret = new EachArray(this._content, keyName, this);
				Ember.defineProperty(this, keyName, null, ret);
				this.beginObservingContentKey(keyName);
				return ret;
			},

			// ..........................................................
			// ARRAY CHANGES
			// Invokes whenever the content array itself changes.

			arrayWillChange: function(content, idx, removedCnt, addedCnt) {
				var keys = this._keys, key, lim;

				lim = removedCnt>0 ? idx+removedCnt : -1;
				Ember.beginPropertyChanges(this);

				for(key in keys) {
					if (!keys.hasOwnProperty(key)) { continue; }

					if (lim>0) { removeObserverForContentKey(content, key, this, idx, lim); }

					Ember.propertyWillChange(this, key);
				}

				Ember.propertyWillChange(this._content, '@each');
				Ember.endPropertyChanges(this);
			},

			arrayDidChange: function(content, idx, removedCnt, addedCnt) {
				var keys = this._keys, lim;

				lim = addedCnt>0 ? idx+addedCnt : -1;
				Ember.changeProperties(function() {
					for(var key in keys) {
						if (!keys.hasOwnProperty(key)) { continue; }

						if (lim>0) { addObserverForContentKey(content, key, this, idx, lim); }

						Ember.propertyDidChange(this, key);
					}

					Ember.propertyDidChange(this._content, '@each');
				}, this);
			},

			// ..........................................................
			// LISTEN FOR NEW OBSERVERS AND OTHER EVENT LISTENERS
			// Start monitoring keys based on who is listening...

			didAddListener: function(eventName) {
				if (IS_OBSERVER.test(eventName)) {
					this.beginObservingContentKey(eventName.slice(0, -7));
				}
			},

			didRemoveListener: function(eventName) {
				if (IS_OBSERVER.test(eventName)) {
					this.stopObservingContentKey(eventName.slice(0, -7));
				}
			},

			// ..........................................................
			// CONTENT KEY OBSERVING
			// Actual watch keys on the source content.

			beginObservingContentKey: function(keyName) {
				var keys = this._keys;
				if (!keys) keys = this._keys = {};
				if (!keys[keyName]) {
					keys[keyName] = 1;
					var content = this._content,
						len = get(content, 'length');
					addObserverForContentKey(content, keyName, this, 0, len);
				} else {
					keys[keyName]++;
				}
			},

			stopObservingContentKey: function(keyName) {
				var keys = this._keys;
				if (keys && (keys[keyName]>0) && (--keys[keyName]<=0)) {
					var content = this._content,
						len     = get(content, 'length');
					removeObserverForContentKey(content, keyName, this, 0, len);
				}
			},

			contentKeyWillChange: function(obj, keyName) {
				Ember.propertyWillChange(this, keyName);
			},

			contentKeyDidChange: function(obj, keyName) {
				Ember.propertyDidChange(this, keyName);
			}

		});



	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-runtime
		 */


		var get = Ember.get, set = Ember.set, replace = Ember.EnumerableUtils._replace;

// Add Ember.Array to Array.prototype. Remove methods with native
// implementations and supply some more optimized versions of generic methods
// because they are so common.
		var NativeArray = Ember.Mixin.create(Ember.MutableArray, Ember.Observable, Ember.Copyable, {

			// because length is a built-in property we need to know to just get the
			// original property.
			get: function(key) {
				if (key==='length') return this.length;
				else if ('number' === typeof key) return this[key];
				else return this._super(key);
			},

			objectAt: function(idx) {
				return this[idx];
			},

			// primitive for array support.
			replace: function(idx, amt, objects) {

				if (this.isFrozen) throw Ember.FROZEN_ERROR;

				// if we replaced exactly the same number of items, then pass only the
				// replaced range. Otherwise, pass the full remaining array length
				// since everything has shifted
				var len = objects ? get(objects, 'length') : 0;
				this.arrayContentWillChange(idx, amt, len);

				if (!objects || objects.length === 0) {
					this.splice(idx, amt);
				} else {
					replace(this, idx, amt, objects);
				}

				this.arrayContentDidChange(idx, amt, len);
				return this;
			},

			// If you ask for an unknown property, then try to collect the value
			// from member items.
			unknownProperty: function(key, value) {
				var ret;// = this.reducedProperty(key, value) ;
				if ((value !== undefined) && ret === undefined) {
					ret = this[key] = value;
				}
				return ret ;
			},

			// If browser did not implement indexOf natively, then override with
			// specialized version
			indexOf: function(object, startAt) {
				var idx, len = this.length;

				if (startAt === undefined) startAt = 0;
				else startAt = (startAt < 0) ? Math.ceil(startAt) : Math.floor(startAt);
				if (startAt < 0) startAt += len;

				for(idx=startAt;idx<len;idx++) {
					if (this[idx] === object) return idx ;
				}
				return -1;
			},

			lastIndexOf: function(object, startAt) {
				var idx, len = this.length;

				if (startAt === undefined) startAt = len-1;
				else startAt = (startAt < 0) ? Math.ceil(startAt) : Math.floor(startAt);
				if (startAt < 0) startAt += len;

				for(idx=startAt;idx>=0;idx--) {
					if (this[idx] === object) return idx ;
				}
				return -1;
			},

			copy: function(deep) {
				if (deep) {
					return this.map(function(item) { return Ember.copy(item, true); });
				}

				return this.slice();
			}
		});

// Remove any methods implemented natively so we don't override them
		var ignore = ['length'];
		Ember.EnumerableUtils.forEach(NativeArray.keys(), function(methodName) {
			if (Array.prototype[methodName]) ignore.push(methodName);
		});

		if (ignore.length>0) {
			NativeArray = NativeArray.without.apply(NativeArray, ignore);
		}

		/**
		 The NativeArray mixin contains the properties needed to to make the native
		 Array support Ember.MutableArray and all of its dependent APIs. Unless you
		 have `Ember.EXTEND_PROTOTYPES` or `Ember.EXTEND_PROTOTYPES.Array` set to
		 false, this will be applied automatically. Otherwise you can apply the mixin
		 at anytime by calling `Ember.NativeArray.activate`.

		 @class NativeArray
		 @namespace Ember
		 @uses Ember.MutableArray
		 @uses Ember.Observable
		 @uses Ember.Copyable
		 */
		Ember.NativeArray = NativeArray;

		/**
		 Creates an `Ember.NativeArray` from an Array like object.
		 Does not modify the original object. Ember.A is not needed if
		 `Ember.EXTEND_PROTOTYPES` is `true` (the default value). However,
		 it is recommended that you use Ember.A when creating addons for
		 ember or when you can not garentee that `Ember.EXTEND_PROTOTYPES`
		 will be `true`.

		 Example

		 ```js
		 var Pagination = Ember.CollectionView.extend({
    tagName: 'ul',
    classNames: ['pagination'],
    init: function() {
      this._super();
      if (!this.get('content')) {
        this.set('content', Ember.A([]));
      }
    }
  });
		 ```

		 @method A
		 @for Ember
		 @return {Ember.NativeArray}
		 */
		Ember.A = function(arr) {
			if (arr === undefined) { arr = []; }
			return Ember.Array.detect(arr) ? arr : Ember.NativeArray.apply(arr);
		};

		/**
		 Activates the mixin on the Array.prototype if not already applied. Calling
		 this method more than once is safe. This will be called when ember is loaded
		 unless you have `Ember.EXTEND_PROTOTYPES` or `Ember.EXTEND_PROTOTYPES.Array`
		 set to `false`.

		 Example

		 ```js
		 if (Ember.EXTEND_PROTOTYPES === true || Ember.EXTEND_PROTOTYPES.Array) {
    Ember.NativeArray.activate();
  }
		 ```

		 @method activate
		 @for Ember.NativeArray
		 @static
		 @return {void}
		 */
		Ember.NativeArray.activate = function() {
			NativeArray.apply(Array.prototype);

			Ember.A = function(arr) { return arr || []; };
		};

		if (Ember.EXTEND_PROTOTYPES === true || Ember.EXTEND_PROTOTYPES.Array) {
			Ember.NativeArray.activate();
		}


	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-runtime
		 */

		var get = Ember.get, set = Ember.set, guidFor = Ember.guidFor, isNone = Ember.isNone, fmt = Ember.String.fmt;

		/**
		 An unordered collection of objects.

		 A Set works a bit like an array except that its items are not ordered. You
		 can create a set to efficiently test for membership for an object. You can
		 also iterate through a set just like an array, even accessing objects by
		 index, however there is no guarantee as to their order.

		 All Sets are observable via the Enumerable Observer API - which works
		 on any enumerable object including both Sets and Arrays.

		 ## Creating a Set

		 You can create a set like you would most objects using
		 `new Ember.Set()`. Most new sets you create will be empty, but you can
		 also initialize the set with some content by passing an array or other
		 enumerable of objects to the constructor.

		 Finally, you can pass in an existing set and the set will be copied. You
		 can also create a copy of a set by calling `Ember.Set#copy()`.

		 ```javascript
		 // creates a new empty set
		 var foundNames = new Ember.Set();

		 // creates a set with four names in it.
		 var names = new Ember.Set(["Charles", "Tom", "Juan", "Alex"]); // :P

		 // creates a copy of the names set.
		 var namesCopy = new Ember.Set(names);

		 // same as above.
		 var anotherNamesCopy = names.copy();
		 ```

		 ## Adding/Removing Objects

		 You generally add or remove objects from a set using `add()` or
		 `remove()`. You can add any type of object including primitives such as
		 numbers, strings, and booleans.

		 Unlike arrays, objects can only exist one time in a set. If you call `add()`
		 on a set with the same object multiple times, the object will only be added
		 once. Likewise, calling `remove()` with the same object multiple times will
		 remove the object the first time and have no effect on future calls until
		 you add the object to the set again.

		 NOTE: You cannot add/remove `null` or `undefined` to a set. Any attempt to do
		 so will be ignored.

		 In addition to add/remove you can also call `push()`/`pop()`. Push behaves
		 just like `add()` but `pop()`, unlike `remove()` will pick an arbitrary
		 object, remove it and return it. This is a good way to use a set as a job
		 queue when you don't care which order the jobs are executed in.

		 ## Testing for an Object

		 To test for an object's presence in a set you simply call
		 `Ember.Set#contains()`.

		 ## Observing changes

		 When using `Ember.Set`, you can observe the `"[]"` property to be
		 alerted whenever the content changes. You can also add an enumerable
		 observer to the set to be notified of specific objects that are added and
		 removed from the set. See [Ember.Enumerable](/api/classes/Ember.Enumerable.html)
		 for more information on enumerables.

		 This is often unhelpful. If you are filtering sets of objects, for instance,
		 it is very inefficient to re-filter all of the items each time the set
		 changes. It would be better if you could just adjust the filtered set based
		 on what was changed on the original set. The same issue applies to merging
		 sets, as well.

		 ## Other Methods

		 `Ember.Set` primary implements other mixin APIs. For a complete reference
		 on the methods you will use with `Ember.Set`, please consult these mixins.
		 The most useful ones will be `Ember.Enumerable` and
		 `Ember.MutableEnumerable` which implement most of the common iterator
		 methods you are used to on Array.

		 Note that you can also use the `Ember.Copyable` and `Ember.Freezable`
		 APIs on `Ember.Set` as well. Once a set is frozen it can no longer be
		 modified. The benefit of this is that when you call `frozenCopy()` on it,
		 Ember will avoid making copies of the set. This allows you to write
		 code that can know with certainty when the underlying set data will or
		 will not be modified.

		 @class Set
		 @namespace Ember
		 @extends Ember.CoreObject
		 @uses Ember.MutableEnumerable
		 @uses Ember.Copyable
		 @uses Ember.Freezable
		 @since Ember 0.9
		 */
		Ember.Set = Ember.CoreObject.extend(Ember.MutableEnumerable, Ember.Copyable, Ember.Freezable,
			/** @scope Ember.Set.prototype */ {

				// ..........................................................
				// IMPLEMENT ENUMERABLE APIS
				//

				/**
				 This property will change as the number of objects in the set changes.

				 @property length
				 @type number
				 @default 0
				 */
				length: 0,

				/**
				 Clears the set. This is useful if you want to reuse an existing set
				 without having to recreate it.

				 ```javascript
				 var colors = new Ember.Set(["red", "green", "blue"]);
				 colors.length;  // 3
				 colors.clear();
				 colors.length;  // 0
				 ```

				 @method clear
				 @return {Ember.Set} An empty Set
				 */
				clear: function() {
					if (this.isFrozen) { throw new Error(Ember.FROZEN_ERROR); }

					var len = get(this, 'length');
					if (len === 0) { return this; }

					var guid;

					this.enumerableContentWillChange(len, 0);
					Ember.propertyWillChange(this, 'firstObject');
					Ember.propertyWillChange(this, 'lastObject');

					for (var i=0; i < len; i++) {
						guid = guidFor(this[i]);
						delete this[guid];
						delete this[i];
					}

					set(this, 'length', 0);

					Ember.propertyDidChange(this, 'firstObject');
					Ember.propertyDidChange(this, 'lastObject');
					this.enumerableContentDidChange(len, 0);

					return this;
				},

				/**
				 Returns true if the passed object is also an enumerable that contains the
				 same objects as the receiver.

				 ```javascript
				 var colors = ["red", "green", "blue"],
				 same_colors = new Ember.Set(colors);

				 same_colors.isEqual(colors);               // true
				 same_colors.isEqual(["purple", "brown"]);  // false
				 ```

				 @method isEqual
				 @param {Ember.Set} obj the other object.
				 @return {Boolean}
				 */
				isEqual: function(obj) {
					// fail fast
					if (!Ember.Enumerable.detect(obj)) return false;

					var loc = get(this, 'length');
					if (get(obj, 'length') !== loc) return false;

					while(--loc >= 0) {
						if (!obj.contains(this[loc])) return false;
					}

					return true;
				},

				/**
				 Adds an object to the set. Only non-`null` objects can be added to a set
				 and those can only be added once. If the object is already in the set or
				 the passed value is null this method will have no effect.

				 This is an alias for `Ember.MutableEnumerable.addObject()`.

				 ```javascript
				 var colors = new Ember.Set();
				 colors.add("blue");     // ["blue"]
				 colors.add("blue");     // ["blue"]
				 colors.add("red");      // ["blue", "red"]
				 colors.add(null);       // ["blue", "red"]
				 colors.add(undefined);  // ["blue", "red"]
				 ```

				 @method add
				 @param {Object} obj The object to add.
				 @return {Ember.Set} The set itself.
				 */
				add: Ember.aliasMethod('addObject'),

				/**
				 Removes the object from the set if it is found. If you pass a `null` value
				 or an object that is already not in the set, this method will have no
				 effect. This is an alias for `Ember.MutableEnumerable.removeObject()`.

				 ```javascript
				 var colors = new Ember.Set(["red", "green", "blue"]);
				 colors.remove("red");     // ["blue", "green"]
				 colors.remove("purple");  // ["blue", "green"]
				 colors.remove(null);      // ["blue", "green"]
				 ```

				 @method remove
				 @param {Object} obj The object to remove
				 @return {Ember.Set} The set itself.
				 */
				remove: Ember.aliasMethod('removeObject'),

				/**
				 Removes the last element from the set and returns it, or `null` if it's empty.

				 ```javascript
				 var colors = new Ember.Set(["green", "blue"]);
				 colors.pop();  // "blue"
				 colors.pop();  // "green"
				 colors.pop();  // null
				 ```

				 @method pop
				 @return {Object} The removed object from the set or null.
				 */
				pop: function() {
					if (get(this, 'isFrozen')) throw new Error(Ember.FROZEN_ERROR);
					var obj = this.length > 0 ? this[this.length-1] : null;
					this.remove(obj);
					return obj;
				},

				/**
				 Inserts the given object on to the end of the set. It returns
				 the set itself.

				 This is an alias for `Ember.MutableEnumerable.addObject()`.

				 ```javascript
				 var colors = new Ember.Set();
				 colors.push("red");   // ["red"]
				 colors.push("green"); // ["red", "green"]
				 colors.push("blue");  // ["red", "green", "blue"]
				 ```

				 @method push
				 @return {Ember.Set} The set itself.
				 */
				push: Ember.aliasMethod('addObject'),

				/**
				 Removes the last element from the set and returns it, or `null` if it's empty.

				 This is an alias for `Ember.Set.pop()`.

				 ```javascript
				 var colors = new Ember.Set(["green", "blue"]);
				 colors.shift();  // "blue"
				 colors.shift();  // "green"
				 colors.shift();  // null
				 ```

				 @method shift
				 @return {Object} The removed object from the set or null.
				 */
				shift: Ember.aliasMethod('pop'),

				/**
				 Inserts the given object on to the end of the set. It returns
				 the set itself.

				 This is an alias of `Ember.Set.push()`

				 ```javascript
				 var colors = new Ember.Set();
				 colors.unshift("red");    // ["red"]
				 colors.unshift("green");  // ["red", "green"]
				 colors.unshift("blue");   // ["red", "green", "blue"]
				 ```

				 @method unshift
				 @return {Ember.Set} The set itself.
				 */
				unshift: Ember.aliasMethod('push'),

				/**
				 Adds each object in the passed enumerable to the set.

				 This is an alias of `Ember.MutableEnumerable.addObjects()`

				 ```javascript
				 var colors = new Ember.Set();
				 colors.addEach(["red", "green", "blue"]);  // ["red", "green", "blue"]
				 ```

				 @method addEach
				 @param {Ember.Enumerable} objects the objects to add.
				 @return {Ember.Set} The set itself.
				 */
				addEach: Ember.aliasMethod('addObjects'),

				/**
				 Removes each object in the passed enumerable to the set.

				 This is an alias of `Ember.MutableEnumerable.removeObjects()`

				 ```javascript
				 var colors = new Ember.Set(["red", "green", "blue"]);
				 colors.removeEach(["red", "blue"]);  //  ["green"]
				 ```

				 @method removeEach
				 @param {Ember.Enumerable} objects the objects to remove.
				 @return {Ember.Set} The set itself.
				 */
				removeEach: Ember.aliasMethod('removeObjects'),

				// ..........................................................
				// PRIVATE ENUMERABLE SUPPORT
				//

				init: function(items) {
					this._super();
					if (items) this.addObjects(items);
				},

				// implement Ember.Enumerable
				nextObject: function(idx) {
					return this[idx];
				},

				// more optimized version
				firstObject: Ember.computed(function() {
					return this.length > 0 ? this[0] : undefined;
				}),

				// more optimized version
				lastObject: Ember.computed(function() {
					return this.length > 0 ? this[this.length-1] : undefined;
				}),

				// implements Ember.MutableEnumerable
				addObject: function(obj) {
					if (get(this, 'isFrozen')) throw new Error(Ember.FROZEN_ERROR);
					if (isNone(obj)) return this; // nothing to do

					var guid = guidFor(obj),
						idx  = this[guid],
						len  = get(this, 'length'),
						added ;

					if (idx>=0 && idx<len && (this[idx] === obj)) return this; // added

					added = [obj];

					this.enumerableContentWillChange(null, added);
					Ember.propertyWillChange(this, 'lastObject');

					len = get(this, 'length');
					this[guid] = len;
					this[len] = obj;
					set(this, 'length', len+1);

					Ember.propertyDidChange(this, 'lastObject');
					this.enumerableContentDidChange(null, added);

					return this;
				},

				// implements Ember.MutableEnumerable
				removeObject: function(obj) {
					if (get(this, 'isFrozen')) throw new Error(Ember.FROZEN_ERROR);
					if (isNone(obj)) return this; // nothing to do

					var guid = guidFor(obj),
						idx  = this[guid],
						len = get(this, 'length'),
						isFirst = idx === 0,
						isLast = idx === len-1,
						last, removed;


					if (idx>=0 && idx<len && (this[idx] === obj)) {
						removed = [obj];

						this.enumerableContentWillChange(removed, null);
						if (isFirst) { Ember.propertyWillChange(this, 'firstObject'); }
						if (isLast)  { Ember.propertyWillChange(this, 'lastObject'); }

						// swap items - basically move the item to the end so it can be removed
						if (idx < len-1) {
							last = this[len-1];
							this[idx] = last;
							this[guidFor(last)] = idx;
						}

						delete this[guid];
						delete this[len-1];
						set(this, 'length', len-1);

						if (isFirst) { Ember.propertyDidChange(this, 'firstObject'); }
						if (isLast)  { Ember.propertyDidChange(this, 'lastObject'); }
						this.enumerableContentDidChange(removed, null);
					}

					return this;
				},

				// optimized version
				contains: function(obj) {
					return this[guidFor(obj)]>=0;
				},

				copy: function() {
					var C = this.constructor, ret = new C(), loc = get(this, 'length');
					set(ret, 'length', loc);
					while(--loc>=0) {
						ret[loc] = this[loc];
						ret[guidFor(this[loc])] = loc;
					}
					return ret;
				},

				toString: function() {
					var len = this.length, idx, array = [];
					for(idx = 0; idx < len; idx++) {
						array[idx] = this[idx];
					}
					return fmt("Ember.Set<%@>", [array.join(',')]);
				}

			});

	})();



	(function() {
		var DeferredMixin = Ember.DeferredMixin, // mixins/deferred
			get = Ember.get;

		var Deferred = Ember.Object.extend(DeferredMixin);

		Deferred.reopenClass({
			promise: function(callback, binding) {
				var deferred = Deferred.create();
				callback.call(binding, deferred);
				return deferred;
			}
		});

		Ember.Deferred = Deferred;

	})();



	(function() {
		var forEach = Ember.ArrayPolyfills.forEach;

		/**
		 @module ember
		 @submodule ember-runtime
		 */

		var loadHooks = Ember.ENV.EMBER_LOAD_HOOKS || {};
		var loaded = {};

		/**

		 Detects when a specific package of Ember (e.g. 'Ember.Handlebars')
		 has fully loaded and is available for extension.

		 The provided `callback` will be called with the `name` passed
		 resolved from a string into the object:

		 ```javascript
		 Ember.onLoad('Ember.Handlebars' function(hbars){
  hbars.registerHelper(...);
});
		 ```


		 @method onLoad
		 @for Ember
		 @param name {String} name of hook
		 @param callback {Function} callback to be called
		 */
		Ember.onLoad = function(name, callback) {
			var object;

			loadHooks[name] = loadHooks[name] || Ember.A();
			loadHooks[name].pushObject(callback);

			if (object = loaded[name]) {
				callback(object);
			}
		};

		/**

		 Called when an Ember.js package (e.g Ember.Handlebars) has finished
		 loading. Triggers any callbacks registered for this event.

		 @method runLoadHooks
		 @for Ember
		 @param name {String} name of hook
		 @param object {Object} object to pass to callbacks
		 */
		Ember.runLoadHooks = function(name, object) {
			loaded[name] = object;

			if (loadHooks[name]) {
				forEach.call(loadHooks[name], function(callback) {
					callback(object);
				});
			}
		};

	})();



	(function() {

	})();



	(function() {
		var get = Ember.get;

		/**
		 @module ember
		 @submodule ember-runtime
		 */

		/**
		 `Ember.ControllerMixin` provides a standard interface for all classes that
		 compose Ember's controller layer: `Ember.Controller`,
		 `Ember.ArrayController`, and `Ember.ObjectController`.

		 @class ControllerMixin
		 @namespace Ember
		 */
		Ember.ControllerMixin = Ember.Mixin.create(Ember.ActionHandler, {
			/* ducktype as a controller */
			isController: true,

			/**
			 The object to which actions from the view should be sent.

			 For example, when a Handlebars template uses the `{{action}}` helper,
			 it will attempt to send the action to the view's controller's `target`.

			 By default, a controller's `target` is set to the router after it is
			 instantiated by `Ember.Application#initialize`.

			 @property target
			 @default null
			 */
			target: null,

			container: null,

			parentController: null,

			store: null,

			model: Ember.computed.alias('content'),

			deprecatedSendHandles: function(actionName) {
				return !!this[actionName];
			},

			deprecatedSend: function(actionName) {
				var args = [].slice.call(arguments, 1);


				this[actionName].apply(this, args);
				return;
			}
		});

		/**
		 @class Controller
		 @namespace Ember
		 @extends Ember.Object
		 @uses Ember.ControllerMixin
		 */
		Ember.Controller = Ember.Object.extend(Ember.ControllerMixin);

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-runtime
		 */

		var get = Ember.get, set = Ember.set, forEach = Ember.EnumerableUtils.forEach;

		/**
		 `Ember.SortableMixin` provides a standard interface for array proxies
		 to specify a sort order and maintain this sorting when objects are added,
		 removed, or updated without changing the implicit order of their underlying
		 content array:

		 ```javascript
		 songs = [
		 {trackNumber: 4, title: 'Ob-La-Di, Ob-La-Da'},
		 {trackNumber: 2, title: 'Back in the U.S.S.R.'},
		 {trackNumber: 3, title: 'Glass Onion'},
		 ];

		 songsController = Ember.ArrayController.create({
    content: songs,
    sortProperties: ['trackNumber'],
    sortAscending: true
  });

		 songsController.get('firstObject');  // {trackNumber: 2, title: 'Back in the U.S.S.R.'}

		 songsController.addObject({trackNumber: 1, title: 'Dear Prudence'});
		 songsController.get('firstObject');  // {trackNumber: 1, title: 'Dear Prudence'}
		 ```

		 If you add or remove the properties to sort by or change the sort direction the content
		 sort order will be automatically updated.

		 ```javascript
		 songsController.set('sortProperties', ['title']);
		 songsController.get('firstObject'); // {trackNumber: 2, title: 'Back in the U.S.S.R.'}

		 songsController.toggleProperty('sortAscending');
		 songsController.get('firstObject'); // {trackNumber: 4, title: 'Ob-La-Di, Ob-La-Da'}
		 ```

		 SortableMixin works by sorting the arrangedContent array, which is the array that
		 arrayProxy displays. Due to the fact that the underlying 'content' array is not changed, that
		 array will not display the sorted list:

		 ```javascript
		 songsController.get('content').get('firstObject'); // Returns the unsorted original content
		 songsController.get('firstObject'); // Returns the sorted content.
		 ```

		 Although the sorted content can also be accessed through the arrangedContent property,
		 it is preferable to use the proxied class and not the arrangedContent array directly.

		 @class SortableMixin
		 @namespace Ember
		 @uses Ember.MutableEnumerable
		 */
		Ember.SortableMixin = Ember.Mixin.create(Ember.MutableEnumerable, {

			/**
			 Specifies which properties dictate the arrangedContent's sort order.

			 When specifying multiple properties the sorting will use properties
			 from the `sortProperties` array prioritized from first to last.

			 @property {Array} sortProperties
			 */
			sortProperties: null,

			/**
			 Specifies the arrangedContent's sort direction

			 @property {Boolean} sortAscending
			 */
			sortAscending: true,

			/**
			 The function used to compare two values. You can override this if you
			 want to do custom comparisons. Functions must be of the type expected by
			 Array#sort, i.e.
			 return 0 if the two parameters are equal,
			 return a negative value if the first parameter is smaller than the second or
			 return a positive value otherwise:

			 ```javascript
			 function(x,y) { // These are assumed to be integers
      if (x === y)
        return 0;
      return x < y ? -1 : 1;
    }
			 ```

			 @property sortFunction
			 @type {Function}
			 @default Ember.compare
			 */
			sortFunction: Ember.compare,

			orderBy: function(item1, item2) {
				var result = 0,
					sortProperties = get(this, 'sortProperties'),
					sortAscending = get(this, 'sortAscending'),
					sortFunction = get(this, 'sortFunction');


				forEach(sortProperties, function(propertyName) {
					if (result === 0) {
						result = sortFunction(get(item1, propertyName), get(item2, propertyName));
						if ((result !== 0) && !sortAscending) {
							result = (-1) * result;
						}
					}
				});

				return result;
			},

			destroy: function() {
				var content = get(this, 'content'),
					sortProperties = get(this, 'sortProperties');

				if (content && sortProperties) {
					forEach(content, function(item) {
						forEach(sortProperties, function(sortProperty) {
							Ember.removeObserver(item, sortProperty, this, 'contentItemSortPropertyDidChange');
						}, this);
					}, this);
				}

				return this._super();
			},

			isSorted: Ember.computed.bool('sortProperties'),

			/**
			 Overrides the default arrangedContent from arrayProxy in order to sort by sortFunction.
			 Also sets up observers for each sortProperty on each item in the content Array.

			 @property arrangedContent
			 */

			arrangedContent: Ember.computed('content', 'sortProperties.@each', function(key, value) {
				var content = get(this, 'content'),
					isSorted = get(this, 'isSorted'),
					sortProperties = get(this, 'sortProperties'),
					self = this;

				if (content && isSorted) {
					content = content.slice();
					content.sort(function(item1, item2) {
						return self.orderBy(item1, item2);
					});
					forEach(content, function(item) {
						forEach(sortProperties, function(sortProperty) {
							Ember.addObserver(item, sortProperty, this, 'contentItemSortPropertyDidChange');
						}, this);
					}, this);
					return Ember.A(content);
				}

				return content;
			}),

			_contentWillChange: Ember.beforeObserver(function() {
				var content = get(this, 'content'),
					sortProperties = get(this, 'sortProperties');

				if (content && sortProperties) {
					forEach(content, function(item) {
						forEach(sortProperties, function(sortProperty) {
							Ember.removeObserver(item, sortProperty, this, 'contentItemSortPropertyDidChange');
						}, this);
					}, this);
				}

				this._super();
			}, 'content'),

			sortAscendingWillChange: Ember.beforeObserver(function() {
				this._lastSortAscending = get(this, 'sortAscending');
			}, 'sortAscending'),

			sortAscendingDidChange: Ember.observer(function() {
				if (get(this, 'sortAscending') !== this._lastSortAscending) {
					var arrangedContent = get(this, 'arrangedContent');
					arrangedContent.reverseObjects();
				}
			}, 'sortAscending'),

			contentArrayWillChange: function(array, idx, removedCount, addedCount) {
				var isSorted = get(this, 'isSorted');

				if (isSorted) {
					var arrangedContent = get(this, 'arrangedContent');
					var removedObjects = array.slice(idx, idx+removedCount);
					var sortProperties = get(this, 'sortProperties');

					forEach(removedObjects, function(item) {
						arrangedContent.removeObject(item);

						forEach(sortProperties, function(sortProperty) {
							Ember.removeObserver(item, sortProperty, this, 'contentItemSortPropertyDidChange');
						}, this);
					}, this);
				}

				return this._super(array, idx, removedCount, addedCount);
			},

			contentArrayDidChange: function(array, idx, removedCount, addedCount) {
				var isSorted = get(this, 'isSorted'),
					sortProperties = get(this, 'sortProperties');

				if (isSorted) {
					var addedObjects = array.slice(idx, idx+addedCount);

					forEach(addedObjects, function(item) {
						this.insertItemSorted(item);

						forEach(sortProperties, function(sortProperty) {
							Ember.addObserver(item, sortProperty, this, 'contentItemSortPropertyDidChange');
						}, this);
					}, this);
				}

				return this._super(array, idx, removedCount, addedCount);
			},

			insertItemSorted: function(item) {
				var arrangedContent = get(this, 'arrangedContent');
				var length = get(arrangedContent, 'length');

				var idx = this._binarySearch(item, 0, length);
				arrangedContent.insertAt(idx, item);
			},

			contentItemSortPropertyDidChange: function(item) {
				var arrangedContent = get(this, 'arrangedContent'),
					oldIndex = arrangedContent.indexOf(item),
					leftItem = arrangedContent.objectAt(oldIndex - 1),
					rightItem = arrangedContent.objectAt(oldIndex + 1),
					leftResult = leftItem && this.orderBy(item, leftItem),
					rightResult = rightItem && this.orderBy(item, rightItem);

				if (leftResult < 0 || rightResult > 0) {
					arrangedContent.removeObject(item);
					this.insertItemSorted(item);
				}
			},

			_binarySearch: function(item, low, high) {
				var mid, midItem, res, arrangedContent;

				if (low === high) {
					return low;
				}

				arrangedContent = get(this, 'arrangedContent');

				mid = low + Math.floor((high - low) / 2);
				midItem = arrangedContent.objectAt(mid);

				res = this.orderBy(midItem, item);

				if (res < 0) {
					return this._binarySearch(item, mid+1, high);
				} else if (res > 0) {
					return this._binarySearch(item, low, mid);
				}

				return mid;
			}
		});

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-runtime
		 */

		var get = Ember.get, set = Ember.set, forEach = Ember.EnumerableUtils.forEach,
			replace = Ember.EnumerableUtils.replace;

		/**
		 `Ember.ArrayController` provides a way for you to publish a collection of
		 objects so that you can easily bind to the collection from a Handlebars
		 `#each` helper, an `Ember.CollectionView`, or other controllers.

		 The advantage of using an `ArrayController` is that you only have to set up
		 your view bindings once; to change what's displayed, simply swap out the
		 `content` property on the controller.

		 For example, imagine you wanted to display a list of items fetched via an XHR
		 request. Create an `Ember.ArrayController` and set its `content` property:

		 ```javascript
		 MyApp.listController = Ember.ArrayController.create();

		 $.get('people.json', function(data) {
    MyApp.listController.set('content', data);
  });
		 ```

		 Then, create a view that binds to your new controller:

		 ```handlebars
		 {{#each MyApp.listController}}
		 {{firstName}} {{lastName}}
		 {{/each}}
		 ```

		 Although you are binding to the controller, the behavior of this controller
		 is to pass through any methods or properties to the underlying array. This
		 capability comes from `Ember.ArrayProxy`, which this class inherits from.

		 Sometimes you want to display computed properties within the body of an
		 `#each` helper that depend on the underlying items in `content`, but are not
		 present on those items.   To do this, set `itemController` to the name of a
		 controller (probably an `ObjectController`) that will wrap each individual item.

		 For example:

		 ```handlebars
		 {{#each post in controller}}
		 <li>{{title}} ({{titleLength}} characters)</li>
		 {{/each}}
		 ```

		 ```javascript
		 App.PostsController = Ember.ArrayController.extend({
    itemController: 'post'
  });

		 App.PostController = Ember.ObjectController.extend({
    // the `title` property will be proxied to the underlying post.

    titleLength: function() {
      return this.get('title').length;
    }.property('title')
  });
		 ```

		 In some cases it is helpful to return a different `itemController` depending
		 on the particular item.  Subclasses can do this by overriding
		 `lookupItemController`.

		 For example:

		 ```javascript
		 App.MyArrayController = Ember.ArrayController.extend({
    lookupItemController: function( object ) {
      if (object.get('isSpecial')) {
        return "special"; // use App.SpecialController
      } else {
        return "regular"; // use App.RegularController
      }
    }
  });
		 ```

		 The itemController instances will have a `parentController` property set to
		 either the the `parentController` property of the `ArrayController`
		 or to the `ArrayController` instance itself.

		 @class ArrayController
		 @namespace Ember
		 @extends Ember.ArrayProxy
		 @uses Ember.SortableMixin
		 @uses Ember.ControllerMixin
		 */

		Ember.ArrayController = Ember.ArrayProxy.extend(Ember.ControllerMixin,
			Ember.SortableMixin, {

				/**
				 The controller used to wrap items, if any.

				 @property itemController
				 @type String
				 @default null
				 */
				itemController: null,

				/**
				 Return the name of the controller to wrap items, or `null` if items should
				 be returned directly.  The default implementation simply returns the
				 `itemController` property, but subclasses can override this method to return
				 different controllers for different objects.

				 For example:

				 ```javascript
				 App.MyArrayController = Ember.ArrayController.extend({
      lookupItemController: function( object ) {
        if (object.get('isSpecial')) {
          return "special"; // use App.SpecialController
        } else {
          return "regular"; // use App.RegularController
        }
      }
    });
				 ```

				 @method lookupItemController
				 @param {Object} object
				 @return {String}
				 */
				lookupItemController: function(object) {
					return get(this, 'itemController');
				},

				objectAtContent: function(idx) {
					var length = get(this, 'length'),
						arrangedContent = get(this,'arrangedContent'),
						object = arrangedContent && arrangedContent.objectAt(idx);

					if (idx >= 0 && idx < length) {
						var controllerClass = this.lookupItemController(object);
						if (controllerClass) {
							return this.controllerAt(idx, object, controllerClass);
						}
					}

					// When `controllerClass` is falsy, we have not opted in to using item
					// controllers, so return the object directly.

					// When the index is out of range, we want to return the "out of range"
					// value, whatever that might be.  Rather than make assumptions
					// (e.g. guessing `null` or `undefined`) we defer this to `arrangedContent`.
					return object;
				},

				arrangedContentDidChange: function() {
					this._super();
					this._resetSubControllers();
				},

				arrayContentDidChange: function(idx, removedCnt, addedCnt) {
					var subControllers = get(this, '_subControllers'),
						subControllersToRemove = subControllers.slice(idx, idx+removedCnt);

					forEach(subControllersToRemove, function(subController) {
						if (subController) { subController.destroy(); }
					});

					replace(subControllers, idx, removedCnt, new Array(addedCnt));

					// The shadow array of subcontrollers must be updated before we trigger
					// observers, otherwise observers will get the wrong subcontainer when
					// calling `objectAt`
					this._super(idx, removedCnt, addedCnt);
				},

				init: function() {
					this._super();

					this.set('_subControllers', Ember.A());
				},

				content: Ember.computed(function () {
					return Ember.A();
				}),

				controllerAt: function(idx, object, controllerClass) {
					var container = get(this, 'container'),
						subControllers = get(this, '_subControllers'),
						subController = subControllers[idx],
						factory, fullName;

					if (subController) { return subController; }

					fullName = "controller:" + controllerClass;

					if (!container.has(fullName)) {
						throw new Error('Could not resolve itemController: "' + controllerClass + '"');
					}

					subController = container.lookupFactory(fullName).create({
						target: this,
						parentController: get(this, 'parentController') || this,
						content: object
					});

					subControllers[idx] = subController;

					return subController;
				},

				_subControllers: null,

				_resetSubControllers: function() {
					var subControllers = get(this, '_subControllers');
					if (subControllers) {
						forEach(subControllers, function(subController) {
							if (subController) { subController.destroy(); }
						});
					}

					this.set('_subControllers', Ember.A());
				}
			});

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-runtime
		 */

		/**
		 `Ember.ObjectController` is part of Ember's Controller layer. It is intended
		 to wrap a single object, proxying unhandled attempts to `get` and `set` to the underlying
		 content object, and to forward unhandled action attempts to its `target`.

		 `Ember.ObjectController` derives this functionality from its superclass
		 `Ember.ObjectProxy` and the `Ember.ControllerMixin` mixin.

		 @class ObjectController
		 @namespace Ember
		 @extends Ember.ObjectProxy
		 @uses Ember.ControllerMixin
		 **/
		Ember.ObjectController = Ember.ObjectProxy.extend(Ember.ControllerMixin);

	})();



	(function() {

	})();



	(function() {
		/**
		 Ember Runtime

		 @module ember
		 @submodule ember-runtime
		 @requires ember-metal
		 */

	})();

	(function() {
		/**
		 @module ember
		 @submodule ember-views
		 */

		var jQuery = Ember.imports.jQuery;


		/**
		 Alias for jQuery

		 @method $
		 @for Ember
		 */
		Ember.$ = jQuery;

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-views
		 */
		if (Ember.$) {
			// http://www.whatwg.org/specs/web-apps/current-work/multipage/dnd.html#dndevents
			var dragEvents = Ember.String.w('dragstart drag dragenter dragleave dragover drop dragend');

			// Copies the `dataTransfer` property from a browser event object onto the
			// jQuery event object for the specified events
			Ember.EnumerableUtils.forEach(dragEvents, function(eventName) {
				Ember.$.event.fixHooks[eventName] = { props: ['dataTransfer'] };
			});
		}

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-views
		 */

		/* BEGIN METAMORPH HELPERS */

// Internet Explorer prior to 9 does not allow setting innerHTML if the first element
// is a "zero-scope" element. This problem can be worked around by making
// the first node an invisible text node. We, like Modernizr, use &shy;

		var needsShy = this.document && (function() {
			var testEl = document.createElement('div');
			testEl.innerHTML = "<div></div>";
			testEl.firstChild.innerHTML = "<script></script>";
			return testEl.firstChild.innerHTML === '';
		})();

// IE 8 (and likely earlier) likes to move whitespace preceeding
// a script tag to appear after it. This means that we can
// accidentally remove whitespace when updating a morph.
		var movesWhitespace = this.document && (function() {
			var testEl = document.createElement('div');
			testEl.innerHTML = "Test: <script type='text/x-placeholder'></script>Value";
			return testEl.childNodes[0].nodeValue === 'Test:' &&
				testEl.childNodes[2].nodeValue === ' Value';
		})();

// Use this to find children by ID instead of using jQuery
		var findChildById = function(element, id) {
			if (element.getAttribute('id') === id) { return element; }

			var len = element.childNodes.length, idx, node, found;
			for (idx=0; idx<len; idx++) {
				node = element.childNodes[idx];
				found = node.nodeType === 1 && findChildById(node, id);
				if (found) { return found; }
			}
		};

		var setInnerHTMLWithoutFix = function(element, html) {
			if (needsShy) {
				html = '&shy;' + html;
			}

			var matches = [];
			if (movesWhitespace) {
				// Right now we only check for script tags with ids with the
				// goal of targeting morphs.
				html = html.replace(/(\s+)(<script id='([^']+)')/g, function(match, spaces, tag, id) {
					matches.push([id, spaces]);
					return tag;
				});
			}

			element.innerHTML = html;

			// If we have to do any whitespace adjustments do them now
			if (matches.length > 0) {
				var len = matches.length, idx;
				for (idx=0; idx<len; idx++) {
					var script = findChildById(element, matches[idx][0]),
						node = document.createTextNode(matches[idx][1]);
					script.parentNode.insertBefore(node, script);
				}
			}

			if (needsShy) {
				var shyElement = element.firstChild;
				while (shyElement.nodeType === 1 && !shyElement.nodeName) {
					shyElement = shyElement.firstChild;
				}
				if (shyElement.nodeType === 3 && shyElement.nodeValue.charAt(0) === "\u00AD") {
					shyElement.nodeValue = shyElement.nodeValue.slice(1);
				}
			}
		};

		/* END METAMORPH HELPERS */


		var innerHTMLTags = {};
		var canSetInnerHTML = function(tagName) {
			if (innerHTMLTags[tagName] !== undefined) {
				return innerHTMLTags[tagName];
			}

			var canSet = true;

			// IE 8 and earlier don't allow us to do innerHTML on select
			if (tagName.toLowerCase() === 'select') {
				var el = document.createElement('select');
				setInnerHTMLWithoutFix(el, '<option value="test">Test</option>');
				canSet = el.options.length === 1;
			}

			innerHTMLTags[tagName] = canSet;

			return canSet;
		};

		var setInnerHTML = function(element, html) {
			var tagName = element.tagName;

			if (canSetInnerHTML(tagName)) {
				setInnerHTMLWithoutFix(element, html);
			} else {
				// Firefox versions < 11 do not have support for element.outerHTML.
				var outerHTML = element.outerHTML || new XMLSerializer().serializeToString(element);


				var startTag = outerHTML.match(new RegExp("<"+tagName+"([^>]*)>", 'i'))[0],
					endTag = '</'+tagName+'>';

				var wrapper = document.createElement('div');
				setInnerHTMLWithoutFix(wrapper, startTag + html + endTag);
				element = wrapper.firstChild;
				while (element.tagName !== tagName) {
					element = element.nextSibling;
				}
			}

			return element;
		};

		function isSimpleClick(event) {
			var modifier = event.shiftKey || event.metaKey || event.altKey || event.ctrlKey,
				secondaryClick = event.which > 1; // IE9 may return undefined

			return !modifier && !secondaryClick;
		}

		Ember.ViewUtils = {
			setInnerHTML: setInnerHTML,
			isSimpleClick: isSimpleClick
		};

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-views
		 */

		var get = Ember.get, set = Ember.set;

		var ClassSet = function() {
			this.seen = {};
			this.list = [];
		};

		ClassSet.prototype = {
			add: function(string) {
				if (string in this.seen) { return; }
				this.seen[string] = true;

				this.list.push(string);
			},

			toDOM: function() {
				return this.list.join(" ");
			}
		};

		var BAD_TAG_NAME_TEST_REGEXP = /[^a-zA-Z0-9\-]/;
		var BAD_TAG_NAME_REPLACE_REGEXP = /[^a-zA-Z0-9\-]/g;

		function stripTagName(tagName) {
			if (!tagName) {
				return tagName;
			}

			if (!BAD_TAG_NAME_TEST_REGEXP.test(tagName)) {
				return tagName;
			}

			return tagName.replace(BAD_TAG_NAME_REPLACE_REGEXP, '');
		}

		var BAD_CHARS_REGEXP = /&(?!\w+;)|[<>"'`]/g;
		var POSSIBLE_CHARS_REGEXP = /[&<>"'`]/;

		function escapeAttribute(value) {
			// Stolen shamelessly from Handlebars

			var escape = {
				"<": "&lt;",
				">": "&gt;",
				'"': "&quot;",
				"'": "&#x27;",
				"`": "&#x60;"
			};

			var escapeChar = function(chr) {
				return escape[chr] || "&amp;";
			};

			var string = value.toString();

			if(!POSSIBLE_CHARS_REGEXP.test(string)) { return string; }
			return string.replace(BAD_CHARS_REGEXP, escapeChar);
		}

		/**
		 `Ember.RenderBuffer` gathers information regarding the a view and generates the
		 final representation. `Ember.RenderBuffer` will generate HTML which can be pushed
		 to the DOM.

		 ```javascript
		 var buffer = Ember.RenderBuffer('div');
		 ```

		 @class RenderBuffer
		 @namespace Ember
		 @constructor
		 @param {String} tagName tag name (such as 'div' or 'p') used for the buffer
		 */
		Ember.RenderBuffer = function(tagName) {
			return new Ember._RenderBuffer(tagName);
		};

		Ember._RenderBuffer = function(tagName) {
			this.tagNames = [tagName || null];
			this.buffer = "";
		};

		Ember._RenderBuffer.prototype =
		/** @scope Ember.RenderBuffer.prototype */ {

			// The root view's element
			_element: null,

			_hasElement: true,

			/**
			 @private

			 An internal set used to de-dupe class names when `addClass()` is
			 used. After each call to `addClass()`, the `classes` property
			 will be updated.

			 @property elementClasses
			 @type Array
			 @default []
			 */
			elementClasses: null,

			/**
			 Array of class names which will be applied in the class attribute.

			 You can use `setClasses()` to set this property directly. If you
			 use `addClass()`, it will be maintained for you.

			 @property classes
			 @type Array
			 @default []
			 */
			classes: null,

			/**
			 The id in of the element, to be applied in the id attribute.

			 You should not set this property yourself, rather, you should use
			 the `id()` method of `Ember.RenderBuffer`.

			 @property elementId
			 @type String
			 @default null
			 */
			elementId: null,

			/**
			 A hash keyed on the name of the attribute and whose value will be
			 applied to that attribute. For example, if you wanted to apply a
			 `data-view="Foo.bar"` property to an element, you would set the
			 elementAttributes hash to `{'data-view':'Foo.bar'}`.

			 You should not maintain this hash yourself, rather, you should use
			 the `attr()` method of `Ember.RenderBuffer`.

			 @property elementAttributes
			 @type Hash
			 @default {}
			 */
			elementAttributes: null,

			/**
			 A hash keyed on the name of the properties and whose value will be
			 applied to that property. For example, if you wanted to apply a
			 `checked=true` property to an element, you would set the
			 elementProperties hash to `{'checked':true}`.

			 You should not maintain this hash yourself, rather, you should use
			 the `prop()` method of `Ember.RenderBuffer`.

			 @property elementProperties
			 @type Hash
			 @default {}
			 */
			elementProperties: null,

			/**
			 The tagname of the element an instance of `Ember.RenderBuffer` represents.

			 Usually, this gets set as the first parameter to `Ember.RenderBuffer`. For
			 example, if you wanted to create a `p` tag, then you would call

			 ```javascript
			 Ember.RenderBuffer('p')
			 ```

			 @property elementTag
			 @type String
			 @default null
			 */
			elementTag: null,

			/**
			 A hash keyed on the name of the style attribute and whose value will
			 be applied to that attribute. For example, if you wanted to apply a
			 `background-color:black;` style to an element, you would set the
			 elementStyle hash to `{'background-color':'black'}`.

			 You should not maintain this hash yourself, rather, you should use
			 the `style()` method of `Ember.RenderBuffer`.

			 @property elementStyle
			 @type Hash
			 @default {}
			 */
			elementStyle: null,

			/**
			 Nested `RenderBuffers` will set this to their parent `RenderBuffer`
			 instance.

			 @property parentBuffer
			 @type Ember._RenderBuffer
			 */
			parentBuffer: null,

			/**
			 Adds a string of HTML to the `RenderBuffer`.

			 @method push
			 @param {String} string HTML to push into the buffer
			 @chainable
			 */
			push: function(string) {
				this.buffer += string;
				return this;
			},

			/**
			 Adds a class to the buffer, which will be rendered to the class attribute.

			 @method addClass
			 @param {String} className Class name to add to the buffer
			 @chainable
			 */
			addClass: function(className) {
				// lazily create elementClasses
				this.elementClasses = (this.elementClasses || new ClassSet());
				this.elementClasses.add(className);
				this.classes = this.elementClasses.list;

				return this;
			},

			setClasses: function(classNames) {
				this.classes = classNames;
			},

			/**
			 Sets the elementID to be used for the element.

			 @method id
			 @param {String} id
			 @chainable
			 */
			id: function(id) {
				this.elementId = id;
				return this;
			},

			// duck type attribute functionality like jQuery so a render buffer
			// can be used like a jQuery object in attribute binding scenarios.

			/**
			 Adds an attribute which will be rendered to the element.

			 @method attr
			 @param {String} name The name of the attribute
			 @param {String} value The value to add to the attribute
			 @chainable
			 @return {Ember.RenderBuffer|String} this or the current attribute value
			 */
			attr: function(name, value) {
				var attributes = this.elementAttributes = (this.elementAttributes || {});

				if (arguments.length === 1) {
					return attributes[name];
				} else {
					attributes[name] = value;
				}

				return this;
			},

			/**
			 Remove an attribute from the list of attributes to render.

			 @method removeAttr
			 @param {String} name The name of the attribute
			 @chainable
			 */
			removeAttr: function(name) {
				var attributes = this.elementAttributes;
				if (attributes) { delete attributes[name]; }

				return this;
			},

			/**
			 Adds an property which will be rendered to the element.

			 @method prop
			 @param {String} name The name of the property
			 @param {String} value The value to add to the property
			 @chainable
			 @return {Ember.RenderBuffer|String} this or the current property value
			 */
			prop: function(name, value) {
				var properties = this.elementProperties = (this.elementProperties || {});

				if (arguments.length === 1) {
					return properties[name];
				} else {
					properties[name] = value;
				}

				return this;
			},

			/**
			 Remove an property from the list of properties to render.

			 @method removeProp
			 @param {String} name The name of the property
			 @chainable
			 */
			removeProp: function(name) {
				var properties = this.elementProperties;
				if (properties) { delete properties[name]; }

				return this;
			},

			/**
			 Adds a style to the style attribute which will be rendered to the element.

			 @method style
			 @param {String} name Name of the style
			 @param {String} value
			 @chainable
			 */
			style: function(name, value) {
				this.elementStyle = (this.elementStyle || {});

				this.elementStyle[name] = value;
				return this;
			},

			begin: function(tagName) {
				this.tagNames.push(tagName || null);
				return this;
			},

			pushOpeningTag: function() {
				var tagName = this.currentTagName();
				if (!tagName) { return; }

				if (this._hasElement && !this._element && this.buffer.length === 0) {
					this._element = this.generateElement();
					return;
				}

				var buffer = this.buffer,
					id = this.elementId,
					classes = this.classes,
					attrs = this.elementAttributes,
					props = this.elementProperties,
					style = this.elementStyle,
					attr, prop;

				buffer += '<' + stripTagName(tagName);

				if (id) {
					buffer += ' id="' + escapeAttribute(id) + '"';
					this.elementId = null;
				}
				if (classes) {
					buffer += ' class="' + escapeAttribute(classes.join(' ')) + '"';
					this.classes = null;
				}

				if (style) {
					buffer += ' style="';

					for (prop in style) {
						if (style.hasOwnProperty(prop)) {
							buffer += prop + ':' + escapeAttribute(style[prop]) + ';';
						}
					}

					buffer += '"';

					this.elementStyle = null;
				}

				if (attrs) {
					for (attr in attrs) {
						if (attrs.hasOwnProperty(attr)) {
							buffer += ' ' + attr + '="' + escapeAttribute(attrs[attr]) + '"';
						}
					}

					this.elementAttributes = null;
				}

				if (props) {
					for (prop in props) {
						if (props.hasOwnProperty(prop)) {
							var value = props[prop];
							if (value || typeof(value) === 'number') {
								if (value === true) {
									buffer += ' ' + prop + '="' + prop + '"';
								} else {
									buffer += ' ' + prop + '="' + escapeAttribute(props[prop]) + '"';
								}
							}
						}
					}

					this.elementProperties = null;
				}

				buffer += '>';
				this.buffer = buffer;
			},

			pushClosingTag: function() {
				var tagName = this.tagNames.pop();
				if (tagName) { this.buffer += '</' + stripTagName(tagName) + '>'; }
			},

			currentTagName: function() {
				return this.tagNames[this.tagNames.length-1];
			},

			generateElement: function() {
				var tagName = this.tagNames.pop(), // pop since we don't need to close
					element = document.createElement(tagName),
					$element = Ember.$(element),
					id = this.elementId,
					classes = this.classes,
					attrs = this.elementAttributes,
					props = this.elementProperties,
					style = this.elementStyle,
					styleBuffer = '', attr, prop;

				if (id) {
					$element.attr('id', id);
					this.elementId = null;
				}
				if (classes) {
					$element.attr('class', classes.join(' '));
					this.classes = null;
				}

				if (style) {
					for (prop in style) {
						if (style.hasOwnProperty(prop)) {
							styleBuffer += (prop + ':' + style[prop] + ';');
						}
					}

					$element.attr('style', styleBuffer);

					this.elementStyle = null;
				}

				if (attrs) {
					for (attr in attrs) {
						if (attrs.hasOwnProperty(attr)) {
							$element.attr(attr, attrs[attr]);
						}
					}

					this.elementAttributes = null;
				}

				if (props) {
					for (prop in props) {
						if (props.hasOwnProperty(prop)) {
							$element.prop(prop, props[prop]);
						}
					}

					this.elementProperties = null;
				}

				return element;
			},

			/**
			 @method element
			 @return {DOMElement} The element corresponding to the generated HTML
			 of this buffer
			 */
			element: function() {
				var html = this.innerString();

				if (html) {
					this._element = Ember.ViewUtils.setInnerHTML(this._element, html);
				}

				return this._element;
			},

			/**
			 Generates the HTML content for this buffer.

			 @method string
			 @return {String} The generated HTML
			 */
			string: function() {
				if (this._hasElement && this._element) {
					// Firefox versions < 11 do not have support for element.outerHTML.
					var thisElement = this.element(), outerHTML = thisElement.outerHTML;
					if (typeof outerHTML === 'undefined') {
						return Ember.$('<div/>').append(thisElement).html();
					}
					return outerHTML;
				} else {
					return this.innerString();
				}
			},

			innerString: function() {
				return this.buffer;
			}
		};

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-views
		 */

		var get = Ember.get, set = Ember.set, fmt = Ember.String.fmt;

		/**
		 `Ember.EventDispatcher` handles delegating browser events to their
		 corresponding `Ember.Views.` For example, when you click on a view,
		 `Ember.EventDispatcher` ensures that that view's `mouseDown` method gets
		 called.

		 @class EventDispatcher
		 @namespace Ember
		 @private
		 @extends Ember.Object
		 */
		Ember.EventDispatcher = Ember.Object.extend(/** @scope Ember.EventDispatcher.prototype */{

			/**
			 The set of events names (and associated handler function names) to be setup
			 and dispatched by the `EventDispatcher`. Custom events can added to this list at setup
			 time, generally via the `Ember.Application.customEvents` hash. Only override this
			 default set to prevent the EventDispatcher from listening on some events all together.

			 This set will be modified by `setup` to also include any events added at that time.

			 @property events
			 @type Object
			 */
			events: {
				touchstart  : 'touchStart',
				touchmove   : 'touchMove',
				touchend    : 'touchEnd',
				touchcancel : 'touchCancel',
				keydown     : 'keyDown',
				keyup       : 'keyUp',
				keypress    : 'keyPress',
				mousedown   : 'mouseDown',
				mouseup     : 'mouseUp',
				contextmenu : 'contextMenu',
				click       : 'click',
				dblclick    : 'doubleClick',
				mousemove   : 'mouseMove',
				focusin     : 'focusIn',
				focusout    : 'focusOut',
				mouseenter  : 'mouseEnter',
				mouseleave  : 'mouseLeave',
				submit      : 'submit',
				input       : 'input',
				change      : 'change',
				dragstart   : 'dragStart',
				drag        : 'drag',
				dragenter   : 'dragEnter',
				dragleave   : 'dragLeave',
				dragover    : 'dragOver',
				drop        : 'drop',
				dragend     : 'dragEnd'
			},

			/**
			 @private

			 The root DOM element to which event listeners should be attached. Event
			 listeners will be attached to the document unless this is overridden.

			 Can be specified as a DOMElement or a selector string.

			 The default body is a string since this may be evaluated before document.body
			 exists in the DOM.

			 @property rootElement
			 @type DOMElement
			 @default 'body'
			 */
			rootElement: 'body',

			/**
			 @private

			 Sets up event listeners for standard browser events.

			 This will be called after the browser sends a `DOMContentReady` event. By
			 default, it will set up all of the listeners on the document body. If you
			 would like to register the listeners on a different element, set the event
			 dispatcher's `root` property.

			 @method setup
			 @param addedEvents {Hash}
			 */
			setup: function(addedEvents, rootElement) {
				var event, events = get(this, 'events');

				Ember.$.extend(events, addedEvents || {});


				if (!Ember.isNone(rootElement)) {
					set(this, 'rootElement', rootElement);
				}

				rootElement = Ember.$(get(this, 'rootElement'));




				rootElement.addClass('ember-application');


				for (event in events) {
					if (events.hasOwnProperty(event)) {
						this.setupHandler(rootElement, event, events[event]);
					}
				}
			},

			/**
			 @private

			 Registers an event listener on the document. If the given event is
			 triggered, the provided event handler will be triggered on the target view.

			 If the target view does not implement the event handler, or if the handler
			 returns `false`, the parent view will be called. The event will continue to
			 bubble to each successive parent view until it reaches the top.

			 For example, to have the `mouseDown` method called on the target view when
			 a `mousedown` event is received from the browser, do the following:

			 ```javascript
			 setupHandler('mousedown', 'mouseDown');
			 ```

			 @method setupHandler
			 @param {Element} rootElement
			 @param {String} event the browser-originated event to listen to
			 @param {String} eventName the name of the method to call on the view
			 */
			setupHandler: function(rootElement, event, eventName) {
				var self = this;

				rootElement.on(event + '.ember', '.ember-view', function(evt, triggeringManager) {
					return Ember.handleErrors(function() {
						var view = Ember.View.views[this.id],
							result = true, manager = null;

						manager = self._findNearestEventManager(view,eventName);

						if (manager && manager !== triggeringManager) {
							result = self._dispatchEvent(manager, evt, eventName, view);
						} else if (view) {
							result = self._bubbleEvent(view,evt,eventName);
						} else {
							evt.stopPropagation();
						}

						return result;
					}, this);
				});

				rootElement.on(event + '.ember', '[data-ember-action]', function(evt) {
					return Ember.handleErrors(function() {
						var actionId = Ember.$(evt.currentTarget).attr('data-ember-action'),
							action   = Ember.Handlebars.ActionHelper.registeredActions[actionId];

						// We have to check for action here since in some cases, jQuery will trigger
						// an event on `removeChild` (i.e. focusout) after we've already torn down the
						// action handlers for the view.
						if (action && action.eventName === eventName) {
							return action.handler(evt);
						}
					}, this);
				});
			},

			_findNearestEventManager: function(view, eventName) {
				var manager = null;

				while (view) {
					manager = get(view, 'eventManager');
					if (manager && manager[eventName]) { break; }

					view = get(view, 'parentView');
				}

				return manager;
			},

			_dispatchEvent: function(object, evt, eventName, view) {
				var result = true;

				var handler = object[eventName];
				if (Ember.typeOf(handler) === 'function') {
					result = Ember.run(function() {
						return handler.call(object, evt, view);
					});
					// Do not preventDefault in eventManagers.
					evt.stopPropagation();
				}
				else {
					result = this._bubbleEvent(view, evt, eventName);
				}

				return result;
			},

			_bubbleEvent: function(view, evt, eventName) {
				return Ember.run(function() {
					return view.handleEvent(eventName, evt);
				});
			},

			destroy: function() {
				var rootElement = get(this, 'rootElement');
				Ember.$(rootElement).off('.ember', '**').removeClass('ember-application');
				return this._super();
			}
		});

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-views
		 */

// Add a new named queue for rendering views that happens
// after bindings have synced, and a queue for scheduling actions
// that that should occur after view rendering.
		var queues = Ember.run.queues,
			indexOf = Ember.ArrayPolyfills.indexOf;
		queues.splice(indexOf.call(queues, 'actions')+1, 0, 'render', 'afterRender');

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-views
		 */

		var get = Ember.get, set = Ember.set;

// Original class declaration and documentation in runtime/lib/controllers/controller.js
// NOTE: It may be possible with YUIDoc to combine docs in two locations

		/**
		 Additional methods for the ControllerMixin

		 @class ControllerMixin
		 @namespace Ember
		 */
		Ember.ControllerMixin.reopen({
			target: null,
			namespace: null,
			view: null,
			container: null,
			_childContainers: null,

			init: function() {
				this._super();
				set(this, '_childContainers', {});
			},

			_modelDidChange: Ember.observer(function() {
				var containers = get(this, '_childContainers');

				for (var prop in containers) {
					if (!containers.hasOwnProperty(prop)) { continue; }
					containers[prop].destroy();
				}

				set(this, '_childContainers', {});
			}, 'model')
		});

	})();



	(function() {

	})();



	(function() {
		var states = {};

		/**
		 @module ember
		 @submodule ember-views
		 */

		var get = Ember.get, set = Ember.set;
		var guidFor = Ember.guidFor;
		var a_forEach = Ember.EnumerableUtils.forEach;
		var a_addObject = Ember.EnumerableUtils.addObject;

		var childViewsProperty = Ember.computed(function() {
			var childViews = this._childViews, ret = Ember.A(), view = this;

			a_forEach(childViews, function(view) {
				var currentChildViews;
				if (view.isVirtual) {
					if (currentChildViews = get(view, 'childViews')) {
						ret.pushObjects(currentChildViews);
					}
				} else {
					ret.push(view);
				}
			});

			ret.replace = function (idx, removedCount, addedViews) {
				if (view instanceof Ember.ContainerView) {

					return view.replace(idx, removedCount, addedViews);
				}
				throw new Error("childViews is immutable");
			};

			return ret;
		});


		/**
		 Global hash of shared templates. This will automatically be populated
		 by the build tools so that you can store your Handlebars templates in
		 separate files that get loaded into JavaScript at buildtime.

		 @property TEMPLATES
		 @for Ember
		 @type Hash
		 */
		Ember.TEMPLATES = {};

		/**
		 `Ember.CoreView` is an abstract class that exists to give view-like behavior
		 to both Ember's main view class `Ember.View` and other classes like
		 `Ember._SimpleMetamorphView` that don't need the fully functionaltiy of
		 `Ember.View`.

		 Unless you have specific needs for `CoreView`, you will use `Ember.View`
		 in your applications.

		 @class CoreView
		 @namespace Ember
		 @extends Ember.Object
		 @uses Ember.Evented
		 */

		Ember.CoreView = Ember.Object.extend(Ember.Evented, Ember.ActionHandler, {
			isView: true,

			states: states,

			init: function() {
				this._super();
				this.transitionTo('preRender');
			},

			/**
			 If the view is currently inserted into the DOM of a parent view, this
			 property will point to the parent of the view.

			 @property parentView
			 @type Ember.View
			 @default null
			 */
			parentView: Ember.computed(function() {
				var parent = this._parentView;

				if (parent && parent.isVirtual) {
					return get(parent, 'parentView');
				} else {
					return parent;
				}
			}).property('_parentView'),

			state: null,

			_parentView: null,

			// return the current view, not including virtual views
			concreteView: Ember.computed(function() {
				if (!this.isVirtual) { return this; }
				else { return get(this, 'parentView'); }
			}).property('parentView'),

			instrumentName: 'core_view',

			instrumentDetails: function(hash) {
				hash.object = this.toString();
			},

			/**
			 @private

			 Invoked by the view system when this view needs to produce an HTML
			 representation. This method will create a new render buffer, if needed,
			 then apply any default attributes, such as class names and visibility.
			 Finally, the `render()` method is invoked, which is responsible for
			 doing the bulk of the rendering.

			 You should not need to override this method; instead, implement the
			 `template` property, or if you need more control, override the `render`
			 method.

			 @method renderToBuffer
			 @param {Ember.RenderBuffer} buffer the render buffer. If no buffer is
			 passed, a default buffer, using the current view's `tagName`, will
			 be used.
			 */
			renderToBuffer: function(parentBuffer, bufferOperation) {
				var name = 'render.' + this.instrumentName,
					details = {};

				this.instrumentDetails(details);

				return Ember.instrument(name, details, function() {
					return this._renderToBuffer(parentBuffer, bufferOperation);
				}, this);
			},

			_renderToBuffer: function(parentBuffer, bufferOperation) {
				// If this is the top-most view, start a new buffer. Otherwise,
				// create a new buffer relative to the original using the
				// provided buffer operation (for example, `insertAfter` will
				// insert a new buffer after the "parent buffer").
				var tagName = this.tagName;

				if (tagName === null || tagName === undefined) {
					tagName = 'div';
				}

				var buffer = this.buffer = parentBuffer && parentBuffer.begin(tagName) || Ember.RenderBuffer(tagName);
				this.transitionTo('inBuffer', false);

				this.beforeRender(buffer);
				this.render(buffer);
				this.afterRender(buffer);

				return buffer;
			},

			/**
			 @private

			 Override the default event firing from `Ember.Evented` to
			 also call methods with the given name.

			 @method trigger
			 @param name {String}
			 */
			trigger: function(name) {
				this._super.apply(this, arguments);
				var method = this[name];
				if (method) {
					var args = [], i, l;
					for (i = 1, l = arguments.length; i < l; i++) {
						args.push(arguments[i]);
					}
					return method.apply(this, args);
				}
			},

			deprecatedSendHandles: function(actionName) {
				return !!this[actionName];
			},

			deprecatedSend: function(actionName) {
				var args = [].slice.call(arguments, 1);


				this[actionName].apply(this, args);
				return;
			},

			has: function(name) {
				return Ember.typeOf(this[name]) === 'function' || this._super(name);
			},

			destroy: function() {
				var parent = this._parentView;

				if (!this._super()) { return; }

				// destroy the element -- this will avoid each child view destroying
				// the element over and over again...
				if (!this.removedFromDOM) { this.destroyElement(); }

				// remove from parent if found. Don't call removeFromParent,
				// as removeFromParent will try to remove the element from
				// the DOM again.
				if (parent) { parent.removeChild(this); }

				this.transitionTo('destroying', false);

				return this;
			},

			clearRenderedChildren: Ember.K,
			triggerRecursively: Ember.K,
			invokeRecursively: Ember.K,
			transitionTo: Ember.K,
			destroyElement: Ember.K
		});

		var ViewCollection = Ember._ViewCollection = function(initialViews) {
			var views = this.views = initialViews || [];
			this.length = views.length;
		};

		ViewCollection.prototype = {
			length: 0,

			trigger: function(eventName) {
				var views = this.views, view;
				for (var i = 0, l = views.length; i < l; i++) {
					view = views[i];
					if (view.trigger) { view.trigger(eventName); }
				}
			},

			triggerRecursively: function(eventName) {
				var views = this.views;
				for (var i = 0, l = views.length; i < l; i++) {
					views[i].triggerRecursively(eventName);
				}
			},

			invokeRecursively: function(fn) {
				var views = this.views, view;

				for (var i = 0, l = views.length; i < l; i++) {
					view = views[i];
					fn(view);
				}
			},

			transitionTo: function(state, children) {
				var views = this.views;
				for (var i = 0, l = views.length; i < l; i++) {
					views[i].transitionTo(state, children);
				}
			},

			push: function() {
				this.length += arguments.length;
				var views = this.views;
				return views.push.apply(views, arguments);
			},

			objectAt: function(idx) {
				return this.views[idx];
			},

			forEach: function(callback) {
				var views = this.views;
				return a_forEach(views, callback);
			},

			clear: function() {
				this.length = 0;
				this.views.length = 0;
			}
		};

		var EMPTY_ARRAY = [];

		/**
		 `Ember.View` is the class in Ember responsible for encapsulating templates of
		 HTML content, combining templates with data to render as sections of a page's
		 DOM, and registering and responding to user-initiated events.

		 ## HTML Tag

		 The default HTML tag name used for a view's DOM representation is `div`. This
		 can be customized by setting the `tagName` property. The following view
		 class:

		 ```javascript
		 ParagraphView = Ember.View.extend({
    tagName: 'em'
  });
		 ```

		 Would result in instances with the following HTML:

		 ```html
		 <em id="ember1" class="ember-view"></em>
		 ```

		 ## HTML `class` Attribute

		 The HTML `class` attribute of a view's tag can be set by providing a
		 `classNames` property that is set to an array of strings:

		 ```javascript
		 MyView = Ember.View.extend({
    classNames: ['my-class', 'my-other-class']
  });
		 ```

		 Will result in view instances with an HTML representation of:

		 ```html
		 <div id="ember1" class="ember-view my-class my-other-class"></div>
		 ```

		 `class` attribute values can also be set by providing a `classNameBindings`
		 property set to an array of properties names for the view. The return value
		 of these properties will be added as part of the value for the view's `class`
		 attribute. These properties can be computed properties:

		 ```javascript
		 MyView = Ember.View.extend({
    classNameBindings: ['propertyA', 'propertyB'],
    propertyA: 'from-a',
    propertyB: function() {
      if (someLogic) { return 'from-b'; }
    }.property()
  });
		 ```

		 Will result in view instances with an HTML representation of:

		 ```html
		 <div id="ember1" class="ember-view from-a from-b"></div>
		 ```

		 If the value of a class name binding returns a boolean the property name
		 itself will be used as the class name if the property is true. The class name
		 will not be added if the value is `false` or `undefined`.

		 ```javascript
		 MyView = Ember.View.extend({
    classNameBindings: ['hovered'],
    hovered: true
  });
		 ```

		 Will result in view instances with an HTML representation of:

		 ```html
		 <div id="ember1" class="ember-view hovered"></div>
		 ```

		 When using boolean class name bindings you can supply a string value other
		 than the property name for use as the `class` HTML attribute by appending the
		 preferred value after a ":" character when defining the binding:

		 ```javascript
		 MyView = Ember.View.extend({
    classNameBindings: ['awesome:so-very-cool'],
    awesome: true
  });
		 ```

		 Will result in view instances with an HTML representation of:

		 ```html
		 <div id="ember1" class="ember-view so-very-cool"></div>
		 ```

		 Boolean value class name bindings whose property names are in a
		 camelCase-style format will be converted to a dasherized format:

		 ```javascript
		 MyView = Ember.View.extend({
    classNameBindings: ['isUrgent'],
    isUrgent: true
  });
		 ```

		 Will result in view instances with an HTML representation of:

		 ```html
		 <div id="ember1" class="ember-view is-urgent"></div>
		 ```

		 Class name bindings can also refer to object values that are found by
		 traversing a path relative to the view itself:

		 ```javascript
		 MyView = Ember.View.extend({
    classNameBindings: ['messages.empty']
    messages: Ember.Object.create({
      empty: true
    })
  });
		 ```

		 Will result in view instances with an HTML representation of:

		 ```html
		 <div id="ember1" class="ember-view empty"></div>
		 ```

		 If you want to add a class name for a property which evaluates to true and
		 and a different class name if it evaluates to false, you can pass a binding
		 like this:

		 ```javascript
		 // Applies 'enabled' class when isEnabled is true and 'disabled' when isEnabled is false
		 Ember.View.extend({
    classNameBindings: ['isEnabled:enabled:disabled']
    isEnabled: true
  });
		 ```

		 Will result in view instances with an HTML representation of:

		 ```html
		 <div id="ember1" class="ember-view enabled"></div>
		 ```

		 When isEnabled is `false`, the resulting HTML reprensentation looks like
		 this:

		 ```html
		 <div id="ember1" class="ember-view disabled"></div>
		 ```

		 This syntax offers the convenience to add a class if a property is `false`:

		 ```javascript
		 // Applies no class when isEnabled is true and class 'disabled' when isEnabled is false
		 Ember.View.extend({
    classNameBindings: ['isEnabled::disabled']
    isEnabled: true
  });
		 ```

		 Will result in view instances with an HTML representation of:

		 ```html
		 <div id="ember1" class="ember-view"></div>
		 ```

		 When the `isEnabled` property on the view is set to `false`, it will result
		 in view instances with an HTML representation of:

		 ```html
		 <div id="ember1" class="ember-view disabled"></div>
		 ```

		 Updates to the the value of a class name binding will result in automatic
		 update of the  HTML `class` attribute in the view's rendered HTML
		 representation. If the value becomes `false` or `undefined` the class name
		 will be removed.

		 Both `classNames` and `classNameBindings` are concatenated properties. See
		 [Ember.Object](/api/classes/Ember.Object.html) documentation for more
		 information about concatenated properties.

		 ## HTML Attributes

		 The HTML attribute section of a view's tag can be set by providing an
		 `attributeBindings` property set to an array of property names on the view.
		 The return value of these properties will be used as the value of the view's
		 HTML associated attribute:

		 ```javascript
		 AnchorView = Ember.View.extend({
    tagName: 'a',
    attributeBindings: ['href'],
    href: 'http://google.com'
  });
		 ```

		 Will result in view instances with an HTML representation of:

		 ```html
		 <a id="ember1" class="ember-view" href="http://google.com"></a>
		 ```

		 If the return value of an `attributeBindings` monitored property is a boolean
		 the property will follow HTML's pattern of repeating the attribute's name as
		 its value:

		 ```javascript
		 MyTextInput = Ember.View.extend({
    tagName: 'input',
    attributeBindings: ['disabled'],
    disabled: true
  });
		 ```

		 Will result in view instances with an HTML representation of:

		 ```html
		 <input id="ember1" class="ember-view" disabled="disabled" />
		 ```

		 `attributeBindings` can refer to computed properties:

		 ```javascript
		 MyTextInput = Ember.View.extend({
    tagName: 'input',
    attributeBindings: ['disabled'],
    disabled: function() {
      if (someLogic) {
        return true;
      } else {
        return false;
      }
    }.property()
  });
		 ```

		 Updates to the the property of an attribute binding will result in automatic
		 update of the  HTML attribute in the view's rendered HTML representation.

		 `attributeBindings` is a concatenated property. See [Ember.Object](/api/classes/Ember.Object.html)
		 documentation for more information about concatenated properties.

		 ## Templates

		 The HTML contents of a view's rendered representation are determined by its
		 template. Templates can be any function that accepts an optional context
		 parameter and returns a string of HTML that will be inserted within the
		 view's tag. Most typically in Ember this function will be a compiled
		 `Ember.Handlebars` template.

		 ```javascript
		 AView = Ember.View.extend({
    template: Ember.Handlebars.compile('I am the template')
  });
		 ```

		 Will result in view instances with an HTML representation of:

		 ```html
		 <div id="ember1" class="ember-view">I am the template</div>
		 ```

		 Within an Ember application is more common to define a Handlebars templates as
		 part of a page:

		 ```html
		 <script type='text/x-handlebars' data-template-name='some-template'>
		 Hello
		 </script>
		 ```

		 And associate it by name using a view's `templateName` property:

		 ```javascript
		 AView = Ember.View.extend({
    templateName: 'some-template'
  });
		 ```

		 Using a value for `templateName` that does not have a Handlebars template
		 with a matching `data-template-name` attribute will throw an error.

		 For views classes that may have a template later defined (e.g. as the block
		 portion of a `{{view}}` Handlebars helper call in another template or in
		 a subclass), you can provide a `defaultTemplate` property set to compiled
		 template function. If a template is not later provided for the view instance
		 the `defaultTemplate` value will be used:

		 ```javascript
		 AView = Ember.View.extend({
    defaultTemplate: Ember.Handlebars.compile('I was the default'),
    template: null,
    templateName: null
  });
		 ```

		 Will result in instances with an HTML representation of:

		 ```html
		 <div id="ember1" class="ember-view">I was the default</div>
		 ```

		 If a `template` or `templateName` is provided it will take precedence over
		 `defaultTemplate`:

		 ```javascript
		 AView = Ember.View.extend({
    defaultTemplate: Ember.Handlebars.compile('I was the default')
  });

		 aView = AView.create({
    template: Ember.Handlebars.compile('I was the template, not default')
  });
		 ```

		 Will result in the following HTML representation when rendered:

		 ```html
		 <div id="ember1" class="ember-view">I was the template, not default</div>
		 ```

		 ## View Context

		 The default context of the compiled template is the view's controller:

		 ```javascript
		 AView = Ember.View.extend({
    template: Ember.Handlebars.compile('Hello {{excitedGreeting}}')
  });

		 aController = Ember.Object.create({
    firstName: 'Barry',
    excitedGreeting: function() {
      return this.get("content.firstName") + "!!!"
    }.property()
  });

		 aView = AView.create({
    controller: aController,
  });
		 ```

		 Will result in an HTML representation of:

		 ```html
		 <div id="ember1" class="ember-view">Hello Barry!!!</div>
		 ```

		 A context can also be explicitly supplied through the view's `context`
		 property. If the view has neither `context` nor `controller` properties, the
		 `parentView`'s context will be used.

		 ## Layouts

		 Views can have a secondary template that wraps their main template. Like
		 primary templates, layouts can be any function that  accepts an optional
		 context parameter and returns a string of HTML that will be inserted inside
		 view's tag. Views whose HTML element is self closing (e.g. `<input />`)
		 cannot have a layout and this property will be ignored.

		 Most typically in Ember a layout will be a compiled `Ember.Handlebars`
		 template.

		 A view's layout can be set directly with the `layout` property or reference
		 an existing Handlebars template by name with the `layoutName` property.

		 A template used as a layout must contain a single use of the Handlebars
		 `{{yield}}` helper. The HTML contents of a view's rendered `template` will be
		 inserted at this location:

		 ```javascript
		 AViewWithLayout = Ember.View.extend({
    layout: Ember.Handlebars.compile("<div class='my-decorative-class'>{{yield}}</div>")
    template: Ember.Handlebars.compile("I got wrapped"),
  });
		 ```

		 Will result in view instances with an HTML representation of:

		 ```html
		 <div id="ember1" class="ember-view">
		 <div class="my-decorative-class">
		 I got wrapped
		 </div>
		 </div>
		 ```

		 See [Ember.Handlebars.helpers.yield](/api/classes/Ember.Handlebars.helpers.html#method_yield)
		 for more information.

		 ## Responding to Browser Events

		 Views can respond to user-initiated events in one of three ways: method
		 implementation, through an event manager, and through `{{action}}` helper use
		 in their template or layout.

		 ### Method Implementation

		 Views can respond to user-initiated events by implementing a method that
		 matches the event name. A `jQuery.Event` object will be passed as the
		 argument to this method.

		 ```javascript
		 AView = Ember.View.extend({
    click: function(event) {
      // will be called when when an instance's
      // rendered element is clicked
    }
  });
		 ```

		 ### Event Managers

		 Views can define an object as their `eventManager` property. This object can
		 then implement methods that match the desired event names. Matching events
		 that occur on the view's rendered HTML or the rendered HTML of any of its DOM
		 descendants will trigger this method. A `jQuery.Event` object will be passed
		 as the first argument to the method and an  `Ember.View` object as the
		 second. The `Ember.View` will be the view whose rendered HTML was interacted
		 with. This may be the view with the `eventManager` property or one of its
		 descendent views.

		 ```javascript
		 AView = Ember.View.extend({
    eventManager: Ember.Object.create({
      doubleClick: function(event, view) {
        // will be called when when an instance's
        // rendered element or any rendering
        // of this views's descendent
        // elements is clicked
      }
    })
  });
		 ```

		 An event defined for an event manager takes precedence over events of the
		 same name handled through methods on the view.

		 ```javascript
		 AView = Ember.View.extend({
    mouseEnter: function(event) {
      // will never trigger.
    },
    eventManager: Ember.Object.create({
      mouseEnter: function(event, view) {
        // takes precedence over AView#mouseEnter
      }
    })
  });
		 ```

		 Similarly a view's event manager will take precedence for events of any views
		 rendered as a descendent. A method name that matches an event name will not
		 be called if the view instance was rendered inside the HTML representation of
		 a view that has an `eventManager` property defined that handles events of the
		 name. Events not handled by the event manager will still trigger method calls
		 on the descendent.

		 ```javascript
		 OuterView = Ember.View.extend({
    template: Ember.Handlebars.compile("outer {{#view InnerView}}inner{{/view}} outer"),
    eventManager: Ember.Object.create({
      mouseEnter: function(event, view) {
        // view might be instance of either
        // OuterView or InnerView depending on
        // where on the page the user interaction occured
      }
    })
  });

		 InnerView = Ember.View.extend({
    click: function(event) {
      // will be called if rendered inside
      // an OuterView because OuterView's
      // eventManager doesn't handle click events
    },
    mouseEnter: function(event) {
      // will never be called if rendered inside
      // an OuterView.
    }
  });
		 ```

		 ### Handlebars `{{action}}` Helper

		 See [Handlebars.helpers.action](/api/classes/Ember.Handlebars.helpers.html#method_action).

		 ### Event Names

		 All of the event handling approaches described above respond to the same set
		 of events. The names of the built-in events are listed below. (The hash of
		 built-in events exists in `Ember.EventDispatcher`.) Additional, custom events
		 can be registered by using `Ember.Application.customEvents`.

		 Touch events:

		 * `touchStart`
		 * `touchMove`
		 * `touchEnd`
		 * `touchCancel`

		 Keyboard events

		 * `keyDown`
		 * `keyUp`
		 * `keyPress`

		 Mouse events

		 * `mouseDown`
		 * `mouseUp`
		 * `contextMenu`
		 * `click`
		 * `doubleClick`
		 * `mouseMove`
		 * `focusIn`
		 * `focusOut`
		 * `mouseEnter`
		 * `mouseLeave`

		 Form events:

		 * `submit`
		 * `change`
		 * `focusIn`
		 * `focusOut`
		 * `input`

		 HTML5 drag and drop events:

		 * `dragStart`
		 * `drag`
		 * `dragEnter`
		 * `dragLeave`
		 * `drop`
		 * `dragEnd`

		 ## Handlebars `{{view}}` Helper

		 Other `Ember.View` instances can be included as part of a view's template by
		 using the `{{view}}` Handlebars helper. See [Ember.Handlebars.helpers.view](/api/classes/Ember.Handlebars.helpers.html#method_view)
		 for additional information.

		 @class View
		 @namespace Ember
		 @extends Ember.CoreView
		 */
		Ember.View = Ember.CoreView.extend(
			/** @scope Ember.View.prototype */ {

				concatenatedProperties: ['classNames', 'classNameBindings', 'attributeBindings'],

				/**
				 @property isView
				 @type Boolean
				 @default true
				 @final
				 */
				isView: true,

				// ..........................................................
				// TEMPLATE SUPPORT
				//

				/**
				 The name of the template to lookup if no template is provided.

				 `Ember.View` will look for a template with this name in this view's
				 `templates` object. By default, this will be a global object
				 shared in `Ember.TEMPLATES`.

				 @property templateName
				 @type String
				 @default null
				 */
				templateName: null,

				/**
				 The name of the layout to lookup if no layout is provided.

				 `Ember.View` will look for a template with this name in this view's
				 `templates` object. By default, this will be a global object
				 shared in `Ember.TEMPLATES`.

				 @property layoutName
				 @type String
				 @default null
				 */
				layoutName: null,

				/**
				 The hash in which to look for `templateName`.

				 @property templates
				 @type Ember.Object
				 @default Ember.TEMPLATES
				 */
				templates: Ember.TEMPLATES,

				/**
				 The template used to render the view. This should be a function that
				 accepts an optional context parameter and returns a string of HTML that
				 will be inserted into the DOM relative to its parent view.

				 In general, you should set the `templateName` property instead of setting
				 the template yourself.

				 @property template
				 @type Function
				 */
				template: Ember.computed(function(key, value) {
					if (value !== undefined) { return value; }

					var templateName = get(this, 'templateName'),
						template = this.templateForName(templateName, 'template');


					return template || get(this, 'defaultTemplate');
				}).property('templateName'),

				/**
				 The controller managing this view. If this property is set, it will be
				 made available for use by the template.

				 @property controller
				 @type Object
				 */
				controller: Ember.computed(function(key) {
					var parentView = get(this, '_parentView');
					return parentView ? get(parentView, 'controller') : null;
				}).property('_parentView'),

				/**
				 A view may contain a layout. A layout is a regular template but
				 supersedes the `template` property during rendering. It is the
				 responsibility of the layout template to retrieve the `template`
				 property from the view (or alternatively, call `Handlebars.helpers.yield`,
				 `{{yield}}`) to render it in the correct location.

				 This is useful for a view that has a shared wrapper, but which delegates
				 the rendering of the contents of the wrapper to the `template` property
				 on a subclass.

				 @property layout
				 @type Function
				 */
				layout: Ember.computed(function(key) {
					var layoutName = get(this, 'layoutName'),
						layout = this.templateForName(layoutName, 'layout');


					return layout || get(this, 'defaultLayout');
				}).property('layoutName'),

				_yield: function(context, options) {
					var template = get(this, 'template');
					if (template) { template(context, options); }
				},

				templateForName: function(name, type) {
					if (!name) { return; }


					// the defaultContainer is deprecated
					var container = this.container || (Ember.Container && Ember.Container.defaultContainer);
					return container && container.lookup('template:' + name);
				},

				/**
				 The object from which templates should access properties.

				 This object will be passed to the template function each time the render
				 method is called, but it is up to the individual function to decide what
				 to do with it.

				 By default, this will be the view's controller.

				 @property context
				 @type Object
				 */
				context: Ember.computed(function(key, value) {
					if (arguments.length === 2) {
						set(this, '_context', value);
						return value;
					} else {
						return get(this, '_context');
					}
				}).volatile(),

				/**
				 @private

				 Private copy of the view's template context. This can be set directly
				 by Handlebars without triggering the observer that causes the view
				 to be re-rendered.

				 The context of a view is looked up as follows:

				 1. Supplied context (usually by Handlebars)
				 2. Specified controller
				 3. `parentView`'s context (for a child of a ContainerView)

				 The code in Handlebars that overrides the `_context` property first
				 checks to see whether the view has a specified controller. This is
				 something of a hack and should be revisited.

				 @property _context
				 */
				_context: Ember.computed(function(key) {
					var parentView, controller;

					if (controller = get(this, 'controller')) {
						return controller;
					}

					parentView = this._parentView;
					if (parentView) {
						return get(parentView, '_context');
					}

					return null;
				}),

				/**
				 @private

				 If a value that affects template rendering changes, the view should be
				 re-rendered to reflect the new value.

				 @method _contextDidChange
				 */
				_contextDidChange: Ember.observer(function() {
					this.rerender();
				}, 'context'),

				/**
				 If `false`, the view will appear hidden in DOM.

				 @property isVisible
				 @type Boolean
				 @default null
				 */
				isVisible: true,

				/**
				 @private

				 Array of child views. You should never edit this array directly.
				 Instead, use `appendChild` and `removeFromParent`.

				 @property childViews
				 @type Array
				 @default []
				 */
				childViews: childViewsProperty,

				_childViews: EMPTY_ARRAY,

				// When it's a virtual view, we need to notify the parent that their
				// childViews will change.
				_childViewsWillChange: Ember.beforeObserver(function() {
					if (this.isVirtual) {
						var parentView = get(this, 'parentView');
						if (parentView) { Ember.propertyWillChange(parentView, 'childViews'); }
					}
				}, 'childViews'),

				// When it's a virtual view, we need to notify the parent that their
				// childViews did change.
				_childViewsDidChange: Ember.observer(function() {
					if (this.isVirtual) {
						var parentView = get(this, 'parentView');
						if (parentView) { Ember.propertyDidChange(parentView, 'childViews'); }
					}
				}, 'childViews'),

				/**
				 Return the nearest ancestor that is an instance of the provided
				 class.

				 @property nearestInstanceOf
				 @param {Class} klass Subclass of Ember.View (or Ember.View itself)
				 @return Ember.View
				 @deprecated
				 */
				nearestInstanceOf: function(klass) {

					var view = get(this, 'parentView');

					while (view) {
						if (view instanceof klass) { return view; }
						view = get(view, 'parentView');
					}
				},

				/**
				 Return the nearest ancestor that is an instance of the provided
				 class or mixin.

				 @property nearestOfType
				 @param {Class,Mixin} klass Subclass of Ember.View (or Ember.View itself),
				 or an instance of Ember.Mixin.
				 @return Ember.View
				 */
				nearestOfType: function(klass) {
					var view = get(this, 'parentView'),
						isOfType = klass instanceof Ember.Mixin ?
							function(view) { return klass.detect(view); } :
							function(view) { return klass.detect(view.constructor); };

					while (view) {
						if (isOfType(view)) { return view; }
						view = get(view, 'parentView');
					}
				},

				/**
				 Return the nearest ancestor that has a given property.

				 @property nearestWithProperty
				 @param {String} property A property name
				 @return Ember.View
				 */
				nearestWithProperty: function(property) {
					var view = get(this, 'parentView');

					while (view) {
						if (property in view) { return view; }
						view = get(view, 'parentView');
					}
				},

				/**
				 Return the nearest ancestor whose parent is an instance of
				 `klass`.

				 @property nearestChildOf
				 @param {Class} klass Subclass of Ember.View (or Ember.View itself)
				 @return Ember.View
				 */
				nearestChildOf: function(klass) {
					var view = get(this, 'parentView');

					while (view) {
						if (get(view, 'parentView') instanceof klass) { return view; }
						view = get(view, 'parentView');
					}
				},

				/**
				 @private

				 When the parent view changes, recursively invalidate `controller`

				 @method _parentViewDidChange
				 */
				_parentViewDidChange: Ember.observer(function() {
					if (this.isDestroying) { return; }

					this.trigger('parentViewDidChange');

					if (get(this, 'parentView.controller') && !get(this, 'controller')) {
						this.notifyPropertyChange('controller');
					}
				}, '_parentView'),

				_controllerDidChange: Ember.observer(function() {
					if (this.isDestroying) { return; }

					this.rerender();

					this.forEachChildView(function(view) {
						view.propertyDidChange('controller');
					});
				}, 'controller'),

				cloneKeywords: function() {
					var templateData = get(this, 'templateData');

					var keywords = templateData ? Ember.copy(templateData.keywords) : {};
					set(keywords, 'view', get(this, 'concreteView'));
					set(keywords, '_view', this);
					set(keywords, 'controller', get(this, 'controller'));

					return keywords;
				},

				/**
				 Called on your view when it should push strings of HTML into a
				 `Ember.RenderBuffer`. Most users will want to override the `template`
				 or `templateName` properties instead of this method.

				 By default, `Ember.View` will look for a function in the `template`
				 property and invoke it with the value of `context`. The value of
				 `context` will be the view's controller unless you override it.

				 @method render
				 @param {Ember.RenderBuffer} buffer The render buffer
				 */
				render: function(buffer) {
					// If this view has a layout, it is the responsibility of the
					// the layout to render the view's template. Otherwise, render the template
					// directly.
					var template = get(this, 'layout') || get(this, 'template');

					if (template) {
						var context = get(this, 'context');
						var keywords = this.cloneKeywords();
						var output;

						var data = {
							view: this,
							buffer: buffer,
							isRenderData: true,
							keywords: keywords,
							insideGroup: get(this, 'templateData.insideGroup')
						};

						// Invoke the template with the provided template context, which
						// is the view's controller by default. A hash of data is also passed that provides
						// the template with access to the view and render buffer.

						// The template should write directly to the render buffer instead
						// of returning a string.
						output = template(context, { data: data });

						// If the template returned a string instead of writing to the buffer,
						// push the string onto the buffer.
						if (output !== undefined) { buffer.push(output); }
					}
				},

				/**
				 Renders the view again. This will work regardless of whether the
				 view is already in the DOM or not. If the view is in the DOM, the
				 rendering process will be deferred to give bindings a chance
				 to synchronize.

				 If children were added during the rendering process using `appendChild`,
				 `rerender` will remove them, because they will be added again
				 if needed by the next `render`.

				 In general, if the display of your view changes, you should modify
				 the DOM element directly instead of manually calling `rerender`, which can
				 be slow.

				 @method rerender
				 */
				rerender: function() {
					return this.currentState.rerender(this);
				},

				clearRenderedChildren: function() {
					var lengthBefore = this.lengthBeforeRender,
						lengthAfter  = this.lengthAfterRender;

					// If there were child views created during the last call to render(),
					// remove them under the assumption that they will be re-created when
					// we re-render.

					// VIEW-TODO: Unit test this path.
					var childViews = this._childViews;
					for (var i=lengthAfter-1; i>=lengthBefore; i--) {
						if (childViews[i]) { childViews[i].destroy(); }
					}
				},

				/**
				 @private

				 Iterates over the view's `classNameBindings` array, inserts the value
				 of the specified property into the `classNames` array, then creates an
				 observer to update the view's element if the bound property ever changes
				 in the future.

				 @method _applyClassNameBindings
				 */
				_applyClassNameBindings: function(classBindings) {
					var classNames = this.classNames,
						elem, newClass, dasherizedClass;

					// Loop through all of the configured bindings. These will be either
					// property names ('isUrgent') or property paths relative to the view
					// ('content.isUrgent')
					a_forEach(classBindings, function(binding) {

						// Variable in which the old class value is saved. The observer function
						// closes over this variable, so it knows which string to remove when
						// the property changes.
						var oldClass;
						// Extract just the property name from bindings like 'foo:bar'
						var parsedPath = Ember.View._parsePropertyPath(binding);

						// Set up an observer on the context. If the property changes, toggle the
						// class name.
						var observer = function() {
							// Get the current value of the property
							newClass = this._classStringForProperty(binding);
							elem = this.$();

							// If we had previously added a class to the element, remove it.
							if (oldClass) {
								elem.removeClass(oldClass);
								// Also remove from classNames so that if the view gets rerendered,
								// the class doesn't get added back to the DOM.
								classNames.removeObject(oldClass);
							}

							// If necessary, add a new class. Make sure we keep track of it so
							// it can be removed in the future.
							if (newClass) {
								elem.addClass(newClass);
								oldClass = newClass;
							} else {
								oldClass = null;
							}
						};

						// Get the class name for the property at its current value
						dasherizedClass = this._classStringForProperty(binding);

						if (dasherizedClass) {
							// Ensure that it gets into the classNames array
							// so it is displayed when we render.
							a_addObject(classNames, dasherizedClass);

							// Save a reference to the class name so we can remove it
							// if the observer fires. Remember that this variable has
							// been closed over by the observer.
							oldClass = dasherizedClass;
						}

						this.registerObserver(this, parsedPath.path, observer);
						// Remove className so when the view is rerendered,
						// the className is added based on binding reevaluation
						this.one('willClearRender', function() {
							if (oldClass) {
								classNames.removeObject(oldClass);
								oldClass = null;
							}
						});

					}, this);
				},

				/**
				 @private

				 Iterates through the view's attribute bindings, sets up observers for each,
				 then applies the current value of the attributes to the passed render buffer.

				 @method _applyAttributeBindings
				 @param {Ember.RenderBuffer} buffer
				 */
				_applyAttributeBindings: function(buffer, attributeBindings) {
					var attributeValue, elem;

					a_forEach(attributeBindings, function(binding) {
						var split = binding.split(':'),
							property = split[0],
							attributeName = split[1] || property;

						// Create an observer to add/remove/change the attribute if the
						// JavaScript property changes.
						var observer = function() {
							elem = this.$();

							attributeValue = get(this, property);

							Ember.View.applyAttributeBindings(elem, attributeName, attributeValue);
						};

						this.registerObserver(this, property, observer);

						// Determine the current value and add it to the render buffer
						// if necessary.
						attributeValue = get(this, property);
						Ember.View.applyAttributeBindings(buffer, attributeName, attributeValue);
					}, this);
				},

				/**
				 @private

				 Given a property name, returns a dasherized version of that
				 property name if the property evaluates to a non-falsy value.

				 For example, if the view has property `isUrgent` that evaluates to true,
				 passing `isUrgent` to this method will return `"is-urgent"`.

				 @method _classStringForProperty
				 @param property
				 */
				_classStringForProperty: function(property) {
					var parsedPath = Ember.View._parsePropertyPath(property);
					var path = parsedPath.path;

					var val = get(this, path);
					if (val === undefined && Ember.isGlobalPath(path)) {
						val = get(Ember.lookup, path);
					}

					return Ember.View._classStringForValue(path, val, parsedPath.className, parsedPath.falsyClassName);
				},

				// ..........................................................
				// ELEMENT SUPPORT
				//

				/**
				 Returns the current DOM element for the view.

				 @property element
				 @type DOMElement
				 */
				element: Ember.computed(function(key, value) {
					if (value !== undefined) {
						return this.currentState.setElement(this, value);
					} else {
						return this.currentState.getElement(this);
					}
				}).property('_parentView'),

				/**
				 Returns a jQuery object for this view's element. If you pass in a selector
				 string, this method will return a jQuery object, using the current element
				 as its buffer.

				 For example, calling `view.$('li')` will return a jQuery object containing
				 all of the `li` elements inside the DOM element of this view.

				 @method $
				 @param {String} [selector] a jQuery-compatible selector string
				 @return {jQuery} the jQuery object for the DOM node
				 */
				$: function(sel) {
					return this.currentState.$(this, sel);
				},

				mutateChildViews: function(callback) {
					var childViews = this._childViews,
						idx = childViews.length,
						view;

					while(--idx >= 0) {
						view = childViews[idx];
						callback(this, view, idx);
					}

					return this;
				},

				forEachChildView: function(callback) {
					var childViews = this._childViews;

					if (!childViews) { return this; }

					var len = childViews.length,
						view, idx;

					for (idx = 0; idx < len; idx++) {
						view = childViews[idx];
						callback(view);
					}

					return this;
				},

				/**
				 Appends the view's element to the specified parent element.

				 If the view does not have an HTML representation yet, `createElement()`
				 will be called automatically.

				 Note that this method just schedules the view to be appended; the DOM
				 element will not be appended to the given element until all bindings have
				 finished synchronizing.

				 This is not typically a function that you will need to call directly when
				 building your application. You might consider using `Ember.ContainerView`
				 instead. If you do need to use `appendTo`, be sure that the target element
				 you are providing is associated with an `Ember.Application` and does not
				 have an ancestor element that is associated with an Ember view.

				 @method appendTo
				 @param {String|DOMElement|jQuery} A selector, element, HTML string, or jQuery object
				 @return {Ember.View} receiver
				 */
				appendTo: function(target) {
					// Schedule the DOM element to be created and appended to the given
					// element after bindings have synchronized.
					this._insertElementLater(function() {


						this.$().appendTo(target);
					});

					return this;
				},

				/**
				 Replaces the content of the specified parent element with this view's
				 element. If the view does not have an HTML representation yet,
				 `createElement()` will be called automatically.

				 Note that this method just schedules the view to be appended; the DOM
				 element will not be appended to the given element until all bindings have
				 finished synchronizing

				 @method replaceIn
				 @param {String|DOMElement|jQuery} A selector, element, HTML string, or jQuery object
				 @return {Ember.View} received
				 */
				replaceIn: function(target) {



					this._insertElementLater(function() {
						Ember.$(target).empty();
						this.$().appendTo(target);
					});

					return this;
				},

				/**
				 @private

				 Schedules a DOM operation to occur during the next render phase. This
				 ensures that all bindings have finished synchronizing before the view is
				 rendered.

				 To use, pass a function that performs a DOM operation.

				 Before your function is called, this view and all child views will receive
				 the `willInsertElement` event. After your function is invoked, this view
				 and all of its child views will receive the `didInsertElement` event.

				 ```javascript
				 view._insertElementLater(function() {
      this.createElement();
      this.$().appendTo('body');
    });
				 ```

				 @method _insertElementLater
				 @param {Function} fn the function that inserts the element into the DOM
				 */
				_insertElementLater: function(fn) {
					this._scheduledInsert = Ember.run.scheduleOnce('render', this, '_insertElement', fn);
				},

				_insertElement: function (fn) {
					this._scheduledInsert = null;
					this.currentState.insertElement(this, fn);
				},

				/**
				 Appends the view's element to the document body. If the view does
				 not have an HTML representation yet, `createElement()` will be called
				 automatically.

				 If your application uses the `rootElement` property, you must append
				 the view within that element. Rendering views outside of the `rootElement`
				 is not supported.

				 Note that this method just schedules the view to be appended; the DOM
				 element will not be appended to the document body until all bindings have
				 finished synchronizing.

				 @method append
				 @return {Ember.View} receiver
				 */
				append: function() {
					return this.appendTo(document.body);
				},

				/**
				 Removes the view's element from the element to which it is attached.

				 @method remove
				 @return {Ember.View} receiver
				 */
				remove: function() {
					// What we should really do here is wait until the end of the run loop
					// to determine if the element has been re-appended to a different
					// element.
					// In the interim, we will just re-render if that happens. It is more
					// important than elements get garbage collected.
					if (!this.removedFromDOM) { this.destroyElement(); }
					this.invokeRecursively(function(view) {
						if (view.clearRenderedChildren) { view.clearRenderedChildren(); }
					});
				},

				elementId: null,

				/**
				 Attempts to discover the element in the parent element. The default
				 implementation looks for an element with an ID of `elementId` (or the
				 view's guid if `elementId` is null). You can override this method to
				 provide your own form of lookup. For example, if you want to discover your
				 element using a CSS class name instead of an ID.

				 @method findElementInParentElement
				 @param {DOMElement} parentElement The parent's DOM element
				 @return {DOMElement} The discovered element
				 */
				findElementInParentElement: function(parentElem) {
					var id = "#" + this.elementId;
					return Ember.$(id)[0] || Ember.$(id, parentElem)[0];
				},

				/**
				 Creates a DOM representation of the view and all of its
				 child views by recursively calling the `render()` method.

				 After the element has been created, `didInsertElement` will
				 be called on this view and all of its child views.

				 @method createElement
				 @return {Ember.View} receiver
				 */
				createElement: function() {
					if (get(this, 'element')) { return this; }

					var buffer = this.renderToBuffer();
					set(this, 'element', buffer.element());

					return this;
				},

				/**
				 Called when a view is going to insert an element into the DOM.

				 @event willInsertElement
				 */
				willInsertElement: Ember.K,

				/**
				 Called when the element of the view has been inserted into the DOM
				 or after the view was re-rendered. Override this function to do any
				 set up that requires an element in the document body.

				 @event didInsertElement
				 */
				didInsertElement: Ember.K,

				/**
				 Called when the view is about to rerender, but before anything has
				 been torn down. This is a good opportunity to tear down any manual
				 observers you have installed based on the DOM state

				 @event willClearRender
				 */
				willClearRender: Ember.K,

				/**
				 @private

				 Run this callback on the current view (unless includeSelf is false) and recursively on child views.

				 @method invokeRecursively
				 @param fn {Function}
				 @param includeSelf (optional, default true)
				 */
				invokeRecursively: function(fn, includeSelf) {
					var childViews = (includeSelf === false) ? this._childViews : [this];
					var currentViews, view, currentChildViews;

					while (childViews.length) {
						currentViews = childViews.slice();
						childViews = [];

						for (var i=0, l=currentViews.length; i<l; i++) {
							view = currentViews[i];
							currentChildViews = view._childViews ? view._childViews.slice(0) : null;
							fn(view);
							if (currentChildViews) {
								childViews.push.apply(childViews, currentChildViews);
							}
						}
					}
				},

				triggerRecursively: function(eventName) {
					var childViews = [this], currentViews, view, currentChildViews;

					while (childViews.length) {
						currentViews = childViews.slice();
						childViews = [];

						for (var i=0, l=currentViews.length; i<l; i++) {
							view = currentViews[i];
							currentChildViews = view._childViews ? view._childViews.slice(0) : null;
							if (view.trigger) { view.trigger(eventName); }
							if (currentChildViews) {
								childViews.push.apply(childViews, currentChildViews);
							}

						}
					}
				},

				viewHierarchyCollection: function() {
					var currentView, viewCollection = new ViewCollection([this]);

					for (var i = 0; i < viewCollection.length; i++) {
						currentView = viewCollection.objectAt(i);
						if (currentView._childViews) {
							viewCollection.push.apply(viewCollection, currentView._childViews);
						}
					}

					return viewCollection;
				},

				/**
				 Destroys any existing element along with the element for any child views
				 as well. If the view does not currently have a element, then this method
				 will do nothing.

				 If you implement `willDestroyElement()` on your view, then this method will
				 be invoked on your view before your element is destroyed to give you a
				 chance to clean up any event handlers, etc.

				 If you write a `willDestroyElement()` handler, you can assume that your
				 `didInsertElement()` handler was called earlier for the same element.

				 Normally you will not call or override this method yourself, but you may
				 want to implement the above callbacks when it is run.

				 @method destroyElement
				 @return {Ember.View} receiver
				 */
				destroyElement: function() {
					return this.currentState.destroyElement(this);
				},

				/**
				 Called when the element of the view is going to be destroyed. Override
				 this function to do any teardown that requires an element, like removing
				 event listeners.

				 @event willDestroyElement
				 */
				willDestroyElement: Ember.K,

				/**
				 @private

				 Triggers the `willDestroyElement` event (which invokes the
				 `willDestroyElement()` method if it exists) on this view and all child
				 views.

				 Before triggering `willDestroyElement`, it first triggers the
				 `willClearRender` event recursively.

				 @method _notifyWillDestroyElement
				 */
				_notifyWillDestroyElement: function() {
					var viewCollection = this.viewHierarchyCollection();
					viewCollection.trigger('willClearRender');
					viewCollection.trigger('willDestroyElement');
					return viewCollection;
				},

				_elementWillChange: Ember.beforeObserver(function() {
					this.forEachChildView(function(view) {
						Ember.propertyWillChange(view, 'element');
					});
				}, 'element'),

				/**
				 @private

				 If this view's element changes, we need to invalidate the caches of our
				 child views so that we do not retain references to DOM elements that are
				 no longer needed.

				 @method _elementDidChange
				 */
				_elementDidChange: Ember.observer(function() {
					this.forEachChildView(function(view) {
						Ember.propertyDidChange(view, 'element');
					});
				}, 'element'),

				/**
				 Called when the parentView property has changed.

				 @event parentViewDidChange
				 */
				parentViewDidChange: Ember.K,

				instrumentName: 'view',

				instrumentDetails: function(hash) {
					hash.template = get(this, 'templateName');
					this._super(hash);
				},

				_renderToBuffer: function(parentBuffer, bufferOperation) {
					this.lengthBeforeRender = this._childViews.length;
					var buffer = this._super(parentBuffer, bufferOperation);
					this.lengthAfterRender = this._childViews.length;

					return buffer;
				},

				renderToBufferIfNeeded: function (buffer) {
					return this.currentState.renderToBufferIfNeeded(this, buffer);
				},

				beforeRender: function(buffer) {
					this.applyAttributesToBuffer(buffer);
					buffer.pushOpeningTag();
				},

				afterRender: function(buffer) {
					buffer.pushClosingTag();
				},

				applyAttributesToBuffer: function(buffer) {
					// Creates observers for all registered class name and attribute bindings,
					// then adds them to the element.
					var classNameBindings = get(this, 'classNameBindings');
					if (classNameBindings.length) {
						this._applyClassNameBindings(classNameBindings);
					}

					// Pass the render buffer so the method can apply attributes directly.
					// This isn't needed for class name bindings because they use the
					// existing classNames infrastructure.
					var attributeBindings = get(this, 'attributeBindings');
					if (attributeBindings.length) {
						this._applyAttributeBindings(buffer, attributeBindings);
					}

					buffer.setClasses(this.classNames);
					buffer.id(this.elementId);

					var role = get(this, 'ariaRole');
					if (role) {
						buffer.attr('role', role);
					}

					if (get(this, 'isVisible') === false) {
						buffer.style('display', 'none');
					}
				},

				// ..........................................................
				// STANDARD RENDER PROPERTIES
				//

				/**
				 Tag name for the view's outer element. The tag name is only used when an
				 element is first created. If you change the `tagName` for an element, you
				 must destroy and recreate the view element.

				 By default, the render buffer will use a `<div>` tag for views.

				 @property tagName
				 @type String
				 @default null
				 */

				// We leave this null by default so we can tell the difference between
				// the default case and a user-specified tag.
				tagName: null,

				/**
				 The WAI-ARIA role of the control represented by this view. For example, a
				 button may have a role of type 'button', or a pane may have a role of
				 type 'alertdialog'. This property is used by assistive software to help
				 visually challenged users navigate rich web applications.

				 The full list of valid WAI-ARIA roles is available at:
				 [http://www.w3.org/TR/wai-aria/roles#roles_categorization](http://www.w3.org/TR/wai-aria/roles#roles_categorization)

				 @property ariaRole
				 @type String
				 @default null
				 */
				ariaRole: null,

				/**
				 Standard CSS class names to apply to the view's outer element. This
				 property automatically inherits any class names defined by the view's
				 superclasses as well.

				 @property classNames
				 @type Array
				 @default ['ember-view']
				 */
				classNames: ['ember-view'],

				/**
				 A list of properties of the view to apply as class names. If the property
				 is a string value, the value of that string will be applied as a class
				 name.

				 ```javascript
				 // Applies the 'high' class to the view element
				 Ember.View.extend({
      classNameBindings: ['priority']
      priority: 'high'
    });
				 ```

				 If the value of the property is a Boolean, the name of that property is
				 added as a dasherized class name.

				 ```javascript
				 // Applies the 'is-urgent' class to the view element
				 Ember.View.extend({
      classNameBindings: ['isUrgent']
      isUrgent: true
    });
				 ```

				 If you would prefer to use a custom value instead of the dasherized
				 property name, you can pass a binding like this:

				 ```javascript
				 // Applies the 'urgent' class to the view element
				 Ember.View.extend({
      classNameBindings: ['isUrgent:urgent']
      isUrgent: true
    });
				 ```

				 This list of properties is inherited from the view's superclasses as well.

				 @property classNameBindings
				 @type Array
				 @default []
				 */
				classNameBindings: EMPTY_ARRAY,

				/**
				 A list of properties of the view to apply as attributes. If the property is
				 a string value, the value of that string will be applied as the attribute.

				 ```javascript
				 // Applies the type attribute to the element
				 // with the value "button", like <div type="button">
				 Ember.View.extend({
      attributeBindings: ['type'],
      type: 'button'
    });
				 ```

				 If the value of the property is a Boolean, the name of that property is
				 added as an attribute.

				 ```javascript
				 // Renders something like <div enabled="enabled">
				 Ember.View.extend({
      attributeBindings: ['enabled'],
      enabled: true
    });
				 ```

				 @property attributeBindings
				 */
				attributeBindings: EMPTY_ARRAY,

				// .......................................................
				// CORE DISPLAY METHODS
				//

				/**
				 @private

				 Setup a view, but do not finish waking it up.
				 - configure `childViews`
				 - register the view with the global views hash, which is used for event
				 dispatch

				 @method init
				 */
				init: function() {
					this.elementId = this.elementId || guidFor(this);

					this._super();

					// setup child views. be sure to clone the child views array first
					this._childViews = this._childViews.slice();

					this.classNameBindings = Ember.A(this.classNameBindings.slice());

					this.classNames = Ember.A(this.classNames.slice());
				},

				appendChild: function(view, options) {
					return this.currentState.appendChild(this, view, options);
				},

				/**
				 Removes the child view from the parent view.

				 @method removeChild
				 @param {Ember.View} view
				 @return {Ember.View} receiver
				 */
				removeChild: function(view) {
					// If we're destroying, the entire subtree will be
					// freed, and the DOM will be handled separately,
					// so no need to mess with childViews.
					if (this.isDestroying) { return; }

					// update parent node
					set(view, '_parentView', null);

					// remove view from childViews array.
					var childViews = this._childViews;

					Ember.EnumerableUtils.removeObject(childViews, view);

					this.propertyDidChange('childViews'); // HUH?! what happened to will change?

					return this;
				},

				/**
				 Removes all children from the `parentView`.

				 @method removeAllChildren
				 @return {Ember.View} receiver
				 */
				removeAllChildren: function() {
					return this.mutateChildViews(function(parentView, view) {
						parentView.removeChild(view);
					});
				},

				destroyAllChildren: function() {
					return this.mutateChildViews(function(parentView, view) {
						view.destroy();
					});
				},

				/**
				 Removes the view from its `parentView`, if one is found. Otherwise
				 does nothing.

				 @method removeFromParent
				 @return {Ember.View} receiver
				 */
				removeFromParent: function() {
					var parent = this._parentView;

					// Remove DOM element from parent
					this.remove();

					if (parent) { parent.removeChild(this); }
					return this;
				},

				/**
				 You must call `destroy` on a view to destroy the view (and all of its
				 child views). This will remove the view from any parent node, then make
				 sure that the DOM element managed by the view can be released by the
				 memory manager.

				 @method destroy
				 */
				destroy: function() {
					var childViews = this._childViews,
					// get parentView before calling super because it'll be destroyed
						nonVirtualParentView = get(this, 'parentView'),
						viewName = this.viewName,
						childLen, i;

					if (!this._super()) { return; }

					childLen = childViews.length;
					for (i=childLen-1; i>=0; i--) {
						childViews[i].removedFromDOM = true;
					}

					// remove from non-virtual parent view if viewName was specified
					if (viewName && nonVirtualParentView) {
						nonVirtualParentView.set(viewName, null);
					}

					childLen = childViews.length;
					for (i=childLen-1; i>=0; i--) {
						childViews[i].destroy();
					}

					return this;
				},

				/**
				 Instantiates a view to be added to the childViews array during view
				 initialization. You generally will not call this method directly unless
				 you are overriding `createChildViews()`. Note that this method will
				 automatically configure the correct settings on the new view instance to
				 act as a child of the parent.

				 @method createChildView
				 @param {Class|String} viewClass
				 @param {Hash} [attrs] Attributes to add
				 @return {Ember.View} new instance
				 */
				createChildView: function(view, attrs) {
					if (!view) {
						throw new TypeError("createChildViews first argument must exist");
					}

					if (view.isView && view._parentView === this && view.container === this.container) {
						return view;
					}

					attrs = attrs || {};
					attrs._parentView = this;

					if (Ember.CoreView.detect(view)) {
						attrs.templateData = attrs.templateData || get(this, 'templateData');

						attrs.container = this.container;
						view = view.create(attrs);

						// don't set the property on a virtual view, as they are invisible to
						// consumers of the view API
						if (view.viewName) {
							set(get(this, 'concreteView'), view.viewName, view);
						}
					} else if ('string' === typeof view) {
						var fullName = 'view:' + view;
						var View = this.container.lookupFactory(fullName);


						attrs.templateData = get(this, 'templateData');
						view = View.create(attrs);
					} else {

						attrs.container = this.container;

						if (!get(view, 'templateData')) {
							attrs.templateData = get(this, 'templateData');
						}

						Ember.setProperties(view, attrs);

					}

					return view;
				},

				becameVisible: Ember.K,
				becameHidden: Ember.K,

				/**
				 @private

				 When the view's `isVisible` property changes, toggle the visibility
				 element of the actual DOM element.

				 @method _isVisibleDidChange
				 */
				_isVisibleDidChange: Ember.observer(function() {
					var $el = this.$();
					if (!$el) { return; }

					var isVisible = get(this, 'isVisible');

					$el.toggle(isVisible);

					if (this._isAncestorHidden()) { return; }

					if (isVisible) {
						this._notifyBecameVisible();
					} else {
						this._notifyBecameHidden();
					}
				}, 'isVisible'),

				_notifyBecameVisible: function() {
					this.trigger('becameVisible');

					this.forEachChildView(function(view) {
						var isVisible = get(view, 'isVisible');

						if (isVisible || isVisible === null) {
							view._notifyBecameVisible();
						}
					});
				},

				_notifyBecameHidden: function() {
					this.trigger('becameHidden');
					this.forEachChildView(function(view) {
						var isVisible = get(view, 'isVisible');

						if (isVisible || isVisible === null) {
							view._notifyBecameHidden();
						}
					});
				},

				_isAncestorHidden: function() {
					var parent = get(this, 'parentView');

					while (parent) {
						if (get(parent, 'isVisible') === false) { return true; }

						parent = get(parent, 'parentView');
					}

					return false;
				},

				clearBuffer: function() {
					this.invokeRecursively(function(view) {
						view.buffer = null;
					});
				},

				transitionTo: function(state, children) {
					var priorState = this.currentState,
						currentState = this.currentState = this.states[state];
					this.state = state;

					if (priorState && priorState.exit) { priorState.exit(this); }
					if (currentState.enter) { currentState.enter(this); }

					if (children !== false) {
						this.forEachChildView(function(view) {
							view.transitionTo(state);
						});
					}
				},

				// .......................................................
				// EVENT HANDLING
				//

				/**
				 @private

				 Handle events from `Ember.EventDispatcher`

				 @method handleEvent
				 @param eventName {String}
				 @param evt {Event}
				 */
				handleEvent: function(eventName, evt) {
					return this.currentState.handleEvent(this, eventName, evt);
				},

				registerObserver: function(root, path, target, observer) {
					if (!observer && 'function' === typeof target) {
						observer = target;
						target = null;
					}

					var view = this,
						stateCheckedObserver = function() {
							view.currentState.invokeObserver(this, observer);
						},
						scheduledObserver = function() {
							Ember.run.scheduleOnce('render', this, stateCheckedObserver);
						};

					Ember.addObserver(root, path, target, scheduledObserver);

					this.one('willClearRender', function() {
						Ember.removeObserver(root, path, target, scheduledObserver);
					});
				}

			});

		/*
		 Describe how the specified actions should behave in the various
		 states that a view can exist in. Possible states:

		 * preRender: when a view is first instantiated, and after its
		 element was destroyed, it is in the preRender state
		 * inBuffer: once a view has been rendered, but before it has
		 been inserted into the DOM, it is in the inBuffer state
		 * inDOM: once a view has been inserted into the DOM it is in
		 the inDOM state. A view spends the vast majority of its
		 existence in this state.
		 * destroyed: once a view has been destroyed (using the destroy
		 method), it is in this state. No further actions can be invoked
		 on a destroyed view.
		 */

		// in the destroyed state, everything is illegal

		// before rendering has begun, all legal manipulations are noops.

		// inside the buffer, legal manipulations are done on the buffer

		// once the view has been inserted into the DOM, legal manipulations
		// are done on the DOM element.

		function notifyMutationListeners() {
			Ember.run.once(Ember.View, 'notifyMutationListeners');
		}

		var DOMManager = {
			prepend: function(view, html) {
				view.$().prepend(html);
				notifyMutationListeners();
			},

			after: function(view, html) {
				view.$().after(html);
				notifyMutationListeners();
			},

			html: function(view, html) {
				view.$().html(html);
				notifyMutationListeners();
			},

			replace: function(view) {
				var element = get(view, 'element');

				set(view, 'element', null);

				view._insertElementLater(function() {
					Ember.$(element).replaceWith(get(view, 'element'));
					notifyMutationListeners();
				});
			},

			remove: function(view) {
				view.$().remove();
				notifyMutationListeners();
			},

			empty: function(view) {
				view.$().empty();
				notifyMutationListeners();
			}
		};

		Ember.View.reopen({
			domManager: DOMManager
		});

		Ember.View.reopenClass({

			/**
			 @private

			 Parse a path and return an object which holds the parsed properties.

			 For example a path like "content.isEnabled:enabled:disabled" will return the
			 following object:

			 ```javascript
			 {
      path: "content.isEnabled",
      className: "enabled",
      falsyClassName: "disabled",
      classNames: ":enabled:disabled"
    }
			 ```

			 @method _parsePropertyPath
			 @static
			 */
			_parsePropertyPath: function(path) {
				var split = path.split(':'),
					propertyPath = split[0],
					classNames = "",
					className,
					falsyClassName;

				// check if the property is defined as prop:class or prop:trueClass:falseClass
				if (split.length > 1) {
					className = split[1];
					if (split.length === 3) { falsyClassName = split[2]; }

					classNames = ':' + className;
					if (falsyClassName) { classNames += ":" + falsyClassName; }
				}

				return {
					path: propertyPath,
					classNames: classNames,
					className: (className === '') ? undefined : className,
					falsyClassName: falsyClassName
				};
			},

			/**
			 @private

			 Get the class name for a given value, based on the path, optional
			 `className` and optional `falsyClassName`.

			 - if a `className` or `falsyClassName` has been specified:
			 - if the value is truthy and `className` has been specified,
			 `className` is returned
			 - if the value is falsy and `falsyClassName` has been specified,
			 `falsyClassName` is returned
			 - otherwise `null` is returned
			 - if the value is `true`, the dasherized last part of the supplied path
			 is returned
			 - if the value is not `false`, `undefined` or `null`, the `value`
			 is returned
			 - if none of the above rules apply, `null` is returned

			 @method _classStringForValue
			 @param path
			 @param val
			 @param className
			 @param falsyClassName
			 @static
			 */
			_classStringForValue: function(path, val, className, falsyClassName) {
				// When using the colon syntax, evaluate the truthiness or falsiness
				// of the value to determine which className to return
				if (className || falsyClassName) {
					if (className && !!val) {
						return className;

					} else if (falsyClassName && !val) {
						return falsyClassName;

					} else {
						return null;
					}

					// If value is a Boolean and true, return the dasherized property
					// name.
				} else if (val === true) {
					// Normalize property path to be suitable for use
					// as a class name. For exaple, content.foo.barBaz
					// becomes bar-baz.
					var parts = path.split('.');
					return Ember.String.dasherize(parts[parts.length-1]);

					// If the value is not false, undefined, or null, return the current
					// value of the property.
				} else if (val !== false && val != null) {
					return val;

					// Nothing to display. Return null so that the old class is removed
					// but no new class is added.
				} else {
					return null;
				}
			}
		});

		var mutation = Ember.Object.extend(Ember.Evented).create();

		Ember.View.addMutationListener = function(callback) {
			mutation.on('change', callback);
		};

		Ember.View.removeMutationListener = function(callback) {
			mutation.off('change', callback);
		};

		Ember.View.notifyMutationListeners = function() {
			mutation.trigger('change');
		};

		/**
		 Global views hash

		 @property views
		 @static
		 @type Hash
		 */
		Ember.View.views = {};

// If someone overrides the child views computed property when
// defining their class, we want to be able to process the user's
// supplied childViews and then restore the original computed property
// at view initialization time. This happens in Ember.ContainerView's init
// method.
		Ember.View.childViewsProperty = childViewsProperty;

		Ember.View.applyAttributeBindings = function(elem, name, value) {
			var type = Ember.typeOf(value);

			// if this changes, also change the logic in ember-handlebars/lib/helpers/binding.js
			if (name !== 'value' && (type === 'string' || (type === 'number' && !isNaN(value)))) {
				if (value !== elem.attr(name)) {
					elem.attr(name, value);
				}
			} else if (name === 'value' || type === 'boolean') {
				// We can't set properties to undefined or null
				if (Ember.isNone(value)) { value = ''; }

				if (value !== elem.prop(name)) {
					// value and booleans should always be properties
					elem.prop(name, value);
				}
			} else if (!value) {
				elem.removeAttr(name);
			}
		};

		Ember.View.states = states;

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-views
		 */

		var get = Ember.get, set = Ember.set;

		Ember.View.states._default = {
			// appendChild is only legal while rendering the buffer.
			appendChild: function() {
				throw "You can't use appendChild outside of the rendering process";
			},

			$: function() {
				return undefined;
			},

			getElement: function() {
				return null;
			},

			// Handle events from `Ember.EventDispatcher`
			handleEvent: function() {
				return true; // continue event propagation
			},

			destroyElement: function(view) {
				set(view, 'element', null);
				if (view._scheduledInsert) {
					Ember.run.cancel(view._scheduledInsert);
					view._scheduledInsert = null;
				}
				return view;
			},

			renderToBufferIfNeeded: function () {
				return false;
			},

			rerender: Ember.K,
			invokeObserver: Ember.K
		};

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-views
		 */

		var preRender = Ember.View.states.preRender = Ember.create(Ember.View.states._default);

		Ember.merge(preRender, {
			// a view leaves the preRender state once its element has been
			// created (createElement).
			insertElement: function(view, fn) {
				view.createElement();
				var viewCollection = view.viewHierarchyCollection();

				viewCollection.trigger('willInsertElement');
				// after createElement, the view will be in the hasElement state.
				fn.call(view);
				viewCollection.transitionTo('inDOM', false);
				viewCollection.trigger('didInsertElement');
			},

			renderToBufferIfNeeded: function(view, buffer) {
				view.renderToBuffer(buffer);
				return true;
			},

			empty: Ember.K,

			setElement: function(view, value) {
				if (value !== null) {
					view.transitionTo('hasElement');
				}
				return value;
			}
		});

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-views
		 */

		var get = Ember.get, set = Ember.set;

		var inBuffer = Ember.View.states.inBuffer = Ember.create(Ember.View.states._default);

		Ember.merge(inBuffer, {
			$: function(view, sel) {
				// if we don't have an element yet, someone calling this.$() is
				// trying to update an element that isn't in the DOM. Instead,
				// rerender the view to allow the render method to reflect the
				// changes.
				view.rerender();
				return Ember.$();
			},

			// when a view is rendered in a buffer, rerendering it simply
			// replaces the existing buffer with a new one
			rerender: function(view) {
				throw new Ember.Error("Something you did caused a view to re-render after it rendered but before it was inserted into the DOM.");
			},

			// when a view is rendered in a buffer, appending a child
			// view will render that view and append the resulting
			// buffer into its buffer.
			appendChild: function(view, childView, options) {
				var buffer = view.buffer, _childViews = view._childViews;

				childView = view.createChildView(childView, options);
				if (!_childViews.length) { _childViews = view._childViews = _childViews.slice(); }
				_childViews.push(childView);

				childView.renderToBuffer(buffer);

				view.propertyDidChange('childViews');

				return childView;
			},

			// when a view is rendered in a buffer, destroying the
			// element will simply destroy the buffer and put the
			// state back into the preRender state.
			destroyElement: function(view) {
				view.clearBuffer();
				var viewCollection = view._notifyWillDestroyElement();
				viewCollection.transitionTo('preRender', false);

				return view;
			},

			empty: function() {

			},

			renderToBufferIfNeeded: function (view, buffer) {
				return false;
			},

			// It should be impossible for a rendered view to be scheduled for
			// insertion.
			insertElement: function() {
				throw "You can't insert an element that has already been rendered";
			},

			setElement: function(view, value) {
				if (value === null) {
					view.transitionTo('preRender');
				} else {
					view.clearBuffer();
					view.transitionTo('hasElement');
				}

				return value;
			},

			invokeObserver: function(target, observer) {
				observer.call(target);
			}
		});


	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-views
		 */

		var get = Ember.get, set = Ember.set;

		var hasElement = Ember.View.states.hasElement = Ember.create(Ember.View.states._default);

		Ember.merge(hasElement, {
			$: function(view, sel) {
				var elem = get(view, 'element');
				return sel ? Ember.$(sel, elem) : Ember.$(elem);
			},

			getElement: function(view) {
				var parent = get(view, 'parentView');
				if (parent) { parent = get(parent, 'element'); }
				if (parent) { return view.findElementInParentElement(parent); }
				return Ember.$("#" + get(view, 'elementId'))[0];
			},

			setElement: function(view, value) {
				if (value === null) {
					view.transitionTo('preRender');
				} else {
					throw "You cannot set an element to a non-null value when the element is already in the DOM.";
				}

				return value;
			},

			// once the view has been inserted into the DOM, rerendering is
			// deferred to allow bindings to synchronize.
			rerender: function(view) {
				view.triggerRecursively('willClearRender');

				view.clearRenderedChildren();

				view.domManager.replace(view);
				return view;
			},

			// once the view is already in the DOM, destroying it removes it
			// from the DOM, nukes its element, and puts it back into the
			// preRender state if inDOM.

			destroyElement: function(view) {
				view._notifyWillDestroyElement();
				view.domManager.remove(view);
				set(view, 'element', null);
				if (view._scheduledInsert) {
					Ember.run.cancel(view._scheduledInsert);
					view._scheduledInsert = null;
				}
				return view;
			},

			empty: function(view) {
				var _childViews = view._childViews, len, idx;
				if (_childViews) {
					len = _childViews.length;
					for (idx = 0; idx < len; idx++) {
						_childViews[idx]._notifyWillDestroyElement();
					}
				}
				view.domManager.empty(view);
			},

			// Handle events from `Ember.EventDispatcher`
			handleEvent: function(view, eventName, evt) {
				if (view.has(eventName)) {
					// Handler should be able to re-dispatch events, so we don't
					// preventDefault or stopPropagation.
					return view.trigger(eventName, evt);
				} else {
					return true; // continue event propagation
				}
			},

			invokeObserver: function(target, observer) {
				observer.call(target);
			}
		});

		var inDOM = Ember.View.states.inDOM = Ember.create(hasElement);

		Ember.merge(inDOM, {
			enter: function(view) {
				// Register the view for event handling. This hash is used by
				// Ember.EventDispatcher to dispatch incoming events.
				if (!view.isVirtual) {

					Ember.View.views[view.elementId] = view;
				}

				view.addBeforeObserver('elementId', function() {
					throw new Error("Changing a view's elementId after creation is not allowed");
				});
			},

			exit: function(view) {
				if (!this.isVirtual) delete Ember.View.views[view.elementId];
			},

			insertElement: function(view, fn) {
				throw "You can't insert an element into the DOM that has already been inserted";
			}
		});

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-views
		 */

		var destroyingError = "You can't call %@ on a view being destroyed", fmt = Ember.String.fmt;

		var destroying = Ember.View.states.destroying = Ember.create(Ember.View.states._default);

		Ember.merge(destroying, {
			appendChild: function() {
				throw fmt(destroyingError, ['appendChild']);
			},
			rerender: function() {
				throw fmt(destroyingError, ['rerender']);
			},
			destroyElement: function() {
				throw fmt(destroyingError, ['destroyElement']);
			},
			empty: function() {
				throw fmt(destroyingError, ['empty']);
			},

			setElement: function() {
				throw fmt(destroyingError, ["set('element', ...)"]);
			},

			renderToBufferIfNeeded: function() {
				return false;
			},

			// Since element insertion is scheduled, don't do anything if
			// the view has been destroyed between scheduling and execution
			insertElement: Ember.K
		});


	})();



	(function() {
		Ember.View.cloneStates = function(from) {
			var into = {};

			into._default = {};
			into.preRender = Ember.create(into._default);
			into.destroying = Ember.create(into._default);
			into.inBuffer = Ember.create(into._default);
			into.hasElement = Ember.create(into._default);
			into.inDOM = Ember.create(into.hasElement);

			for (var stateName in from) {
				if (!from.hasOwnProperty(stateName)) { continue; }
				Ember.merge(into[stateName], from[stateName]);
			}

			return into;
		};

	})();



	(function() {
		var states = Ember.View.cloneStates(Ember.View.states);

		/**
		 @module ember
		 @submodule ember-views
		 */

		var get = Ember.get, set = Ember.set;
		var forEach = Ember.EnumerableUtils.forEach;
		var ViewCollection = Ember._ViewCollection;

		/**
		 A `ContainerView` is an `Ember.View` subclass that implements `Ember.MutableArray`
		 allowing programatic management of its child views.

		 ## Setting Initial Child Views

		 The initial array of child views can be set in one of two ways. You can
		 provide a `childViews` property at creation time that contains instance of
		 `Ember.View`:

		 ```javascript
		 aContainer = Ember.ContainerView.create({
    childViews: [Ember.View.create(), Ember.View.create()]
  });
		 ```

		 You can also provide a list of property names whose values are instances of
		 `Ember.View`:

		 ```javascript
		 aContainer = Ember.ContainerView.create({
    childViews: ['aView', 'bView', 'cView'],
    aView: Ember.View.create(),
    bView: Ember.View.create(),
    cView: Ember.View.create()
  });
		 ```

		 The two strategies can be combined:

		 ```javascript
		 aContainer = Ember.ContainerView.create({
    childViews: ['aView', Ember.View.create()],
    aView: Ember.View.create()
  });
		 ```

		 Each child view's rendering will be inserted into the container's rendered
		 HTML in the same order as its position in the `childViews` property.

		 ## Adding and Removing Child Views

		 The container view implements `Ember.MutableArray` allowing programatic management of its child views.

		 To remove a view, pass that view into a `removeObject` call on the container view.

		 Given an empty `<body>` the following code

		 ```javascript
		 aContainer = Ember.ContainerView.create({
    classNames: ['the-container'],
    childViews: ['aView', 'bView'],
    aView: Ember.View.create({
      template: Ember.Handlebars.compile("A")
    }),
    bView: Ember.View.create({
      template: Ember.Handlebars.compile("B")
    })
  });

		 aContainer.appendTo('body');
		 ```

		 Results in the HTML

		 ```html
		 <div class="ember-view the-container">
		 <div class="ember-view">A</div>
		 <div class="ember-view">B</div>
		 </div>
		 ```

		 Removing a view

		 ```javascript
		 aContainer.toArray();  // [aContainer.aView, aContainer.bView]
		 aContainer.removeObject(aContainer.get('bView'));
		 aContainer.toArray();  // [aContainer.aView]
		 ```

		 Will result in the following HTML

		 ```html
		 <div class="ember-view the-container">
		 <div class="ember-view">A</div>
		 </div>
		 ```

		 Similarly, adding a child view is accomplished by adding `Ember.View` instances to the
		 container view.

		 Given an empty `<body>` the following code

		 ```javascript
		 aContainer = Ember.ContainerView.create({
    classNames: ['the-container'],
    childViews: ['aView', 'bView'],
    aView: Ember.View.create({
      template: Ember.Handlebars.compile("A")
    }),
    bView: Ember.View.create({
      template: Ember.Handlebars.compile("B")
    })
  });

		 aContainer.appendTo('body');
		 ```

		 Results in the HTML

		 ```html
		 <div class="ember-view the-container">
		 <div class="ember-view">A</div>
		 <div class="ember-view">B</div>
		 </div>
		 ```

		 Adding a view

		 ```javascript
		 AnotherViewClass = Ember.View.extend({
    template: Ember.Handlebars.compile("Another view")
  });

		 aContainer.toArray();  // [aContainer.aView, aContainer.bView]
		 aContainer.pushObject(AnotherViewClass.create());
		 aContainer.toArray(); // [aContainer.aView, aContainer.bView, <AnotherViewClass instance>]
		 ```

		 Will result in the following HTML

		 ```html
		 <div class="ember-view the-container">
		 <div class="ember-view">A</div>
		 <div class="ember-view">B</div>
		 <div class="ember-view">Another view</div>
		 </div>
		 ```

		 ## Templates and Layout

		 A `template`, `templateName`, `defaultTemplate`, `layout`, `layoutName` or
		 `defaultLayout` property on a container view will not result in the template
		 or layout being rendered. The HTML contents of a `Ember.ContainerView`'s DOM
		 representation will only be the rendered HTML of its child views.

		 ## Binding a View to Display

		 If you would like to display a single view in your ContainerView, you can set
		 its `currentView` property. When the `currentView` property is set to a view
		 instance, it will be added to the ContainerView. If the `currentView` property
		 is later changed to a different view, the new view will replace the old view.
		 If `currentView` is set to `null`, the last `currentView` will be removed.

		 This functionality is useful for cases where you want to bind the display of
		 a ContainerView to a controller or state manager. For example, you can bind
		 the `currentView` of a container to a controller like this:

		 ```javascript
		 App.appController = Ember.Object.create({
    view: Ember.View.create({
      templateName: 'person_template'
    })
  });
		 ```

		 ```handlebars
		 {{view Ember.ContainerView currentViewBinding="App.appController.view"}}
		 ```

		 @class ContainerView
		 @namespace Ember
		 @extends Ember.View
		 */
		Ember.ContainerView = Ember.View.extend(Ember.MutableArray, {
			states: states,

			init: function() {
				this._super();

				var childViews = get(this, 'childViews');

				// redefine view's childViews property that was obliterated
				Ember.defineProperty(this, 'childViews', Ember.View.childViewsProperty);

				var _childViews = this._childViews;

				forEach(childViews, function(viewName, idx) {
					var view;

					if ('string' === typeof viewName) {
						view = get(this, viewName);
						view = this.createChildView(view);
						set(this, viewName, view);
					} else {
						view = this.createChildView(viewName);
					}

					_childViews[idx] = view;
				}, this);

				var currentView = get(this, 'currentView');
				if (currentView) {
					if (!_childViews.length) { _childViews = this._childViews = this._childViews.slice(); }
					_childViews.push(this.createChildView(currentView));
				}
			},

			replace: function(idx, removedCount, addedViews) {
				var addedCount = addedViews ? get(addedViews, 'length') : 0;
				var self = this;


				this.arrayContentWillChange(idx, removedCount, addedCount);
				this.childViewsWillChange(this._childViews, idx, removedCount);

				if (addedCount === 0) {
					this._childViews.splice(idx, removedCount) ;
				} else {
					var args = [idx, removedCount].concat(addedViews);
					if (addedViews.length && !this._childViews.length) { this._childViews = this._childViews.slice(); }
					this._childViews.splice.apply(this._childViews, args);
				}

				this.arrayContentDidChange(idx, removedCount, addedCount);
				this.childViewsDidChange(this._childViews, idx, removedCount, addedCount);

				return this;
			},

			objectAt: function(idx) {
				return this._childViews[idx];
			},

			length: Ember.computed(function () {
				return this._childViews.length;
			}).volatile(),

			/**
			 @private

			 Instructs each child view to render to the passed render buffer.

			 @method render
			 @param {Ember.RenderBuffer} buffer the buffer to render to
			 */
			render: function(buffer) {
				this.forEachChildView(function(view) {
					view.renderToBuffer(buffer);
				});
			},

			instrumentName: 'container',

			/**
			 @private

			 When a child view is removed, destroy its element so that
			 it is removed from the DOM.

			 The array observer that triggers this action is set up in the
			 `renderToBuffer` method.

			 @method childViewsWillChange
			 @param {Ember.Array} views the child views array before mutation
			 @param {Number} start the start position of the mutation
			 @param {Number} removed the number of child views removed
			 **/
			childViewsWillChange: function(views, start, removed) {
				this.propertyWillChange('childViews');

				if (removed > 0) {
					var changedViews = views.slice(start, start+removed);
					// transition to preRender before clearing parentView
					this.currentState.childViewsWillChange(this, views, start, removed);
					this.initializeViews(changedViews, null, null);
				}
			},

			removeChild: function(child) {
				this.removeObject(child);
				return this;
			},

			/**
			 @private

			 When a child view is added, make sure the DOM gets updated appropriately.

			 If the view has already rendered an element, we tell the child view to
			 create an element and insert it into the DOM. If the enclosing container
			 view has already written to a buffer, but not yet converted that buffer
			 into an element, we insert the string representation of the child into the
			 appropriate place in the buffer.

			 @method childViewsDidChange
			 @param {Ember.Array} views the array of child views afte the mutation has occurred
			 @param {Number} start the start position of the mutation
			 @param {Number} removed the number of child views removed
			 @param {Number} the number of child views added
			 */
			childViewsDidChange: function(views, start, removed, added) {
				if (added > 0) {
					var changedViews = views.slice(start, start+added);
					this.initializeViews(changedViews, this, get(this, 'templateData'));
					this.currentState.childViewsDidChange(this, views, start, added);
				}
				this.propertyDidChange('childViews');
			},

			initializeViews: function(views, parentView, templateData) {
				forEach(views, function(view) {
					set(view, '_parentView', parentView);

					if (!view.container && parentView) {
						set(view, 'container', parentView.container);
					}

					if (!get(view, 'templateData')) {
						set(view, 'templateData', templateData);
					}
				});
			},

			currentView: null,

			_currentViewWillChange: Ember.beforeObserver(function() {
				var currentView = get(this, 'currentView');
				if (currentView) {
					currentView.destroy();
				}
			}, 'currentView'),

			_currentViewDidChange: Ember.observer(function() {
				var currentView = get(this, 'currentView');
				if (currentView) {

					this.pushObject(currentView);
				}
			}, 'currentView'),

			_ensureChildrenAreInDOM: function () {
				this.currentState.ensureChildrenAreInDOM(this);
			}
		});

		Ember.merge(states._default, {
			childViewsWillChange: Ember.K,
			childViewsDidChange: Ember.K,
			ensureChildrenAreInDOM: Ember.K
		});

		Ember.merge(states.inBuffer, {
			childViewsDidChange: function(parentView, views, start, added) {
				throw new Error('You cannot modify child views while in the inBuffer state');
			}
		});

		Ember.merge(states.hasElement, {
			childViewsWillChange: function(view, views, start, removed) {
				for (var i=start; i<start+removed; i++) {
					views[i].remove();
				}
			},

			childViewsDidChange: function(view, views, start, added) {
				Ember.run.scheduleOnce('render', view, '_ensureChildrenAreInDOM');
			},

			ensureChildrenAreInDOM: function(view) {
				var childViews = view._childViews, i, len, childView, previous, buffer, viewCollection = new ViewCollection();

				for (i = 0, len = childViews.length; i < len; i++) {
					childView = childViews[i];

					if (!buffer) { buffer = Ember.RenderBuffer(); buffer._hasElement = false; }

					if (childView.renderToBufferIfNeeded(buffer)) {
						viewCollection.push(childView);
					} else if (viewCollection.length) {
						insertViewCollection(view, viewCollection, previous, buffer);
						buffer = null;
						previous = childView;
						viewCollection.clear();
					} else {
						previous = childView;
					}
				}

				if (viewCollection.length) {
					insertViewCollection(view, viewCollection, previous, buffer);
				}
			}
		});

		function insertViewCollection(view, viewCollection, previous, buffer) {
			viewCollection.triggerRecursively('willInsertElement');

			if (previous) {
				previous.domManager.after(previous, buffer.string());
			} else {
				view.domManager.prepend(view, buffer.string());
			}

			viewCollection.forEach(function(v) {
				v.transitionTo('inDOM');
				v.propertyDidChange('element');
				v.triggerRecursively('didInsertElement');
			});
		}


	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-views
		 */

		var get = Ember.get, set = Ember.set, fmt = Ember.String.fmt;

		/**
		 `Ember.CollectionView` is an `Ember.View` descendent responsible for managing
		 a collection (an array or array-like object) by maintaining a child view object
		 and associated DOM representation for each item in the array and ensuring
		 that child views and their associated rendered HTML are updated when items in
		 the array are added, removed, or replaced.

		 ## Setting content

		 The managed collection of objects is referenced as the `Ember.CollectionView`
		 instance's `content` property.

		 ```javascript
		 someItemsView = Ember.CollectionView.create({
    content: ['A', 'B','C']
  })
		 ```

		 The view for each item in the collection will have its `content` property set
		 to the item.

		 ## Specifying itemViewClass

		 By default the view class for each item in the managed collection will be an
		 instance of `Ember.View`. You can supply a different class by setting the
		 `CollectionView`'s `itemViewClass` property.

		 Given an empty `<body>` and the following code:

		 ```javascript
		 someItemsView = Ember.CollectionView.create({
    classNames: ['a-collection'],
    content: ['A','B','C'],
    itemViewClass: Ember.View.extend({
      template: Ember.Handlebars.compile("the letter: {{view.content}}")
    })
  });

		 someItemsView.appendTo('body');
		 ```

		 Will result in the following HTML structure

		 ```html
		 <div class="ember-view a-collection">
		 <div class="ember-view">the letter: A</div>
		 <div class="ember-view">the letter: B</div>
		 <div class="ember-view">the letter: C</div>
		 </div>
		 ```

		 ## Automatic matching of parent/child tagNames

		 Setting the `tagName` property of a `CollectionView` to any of
		 "ul", "ol", "table", "thead", "tbody", "tfoot", "tr", or "select" will result
		 in the item views receiving an appropriately matched `tagName` property.

		 Given an empty `<body>` and the following code:

		 ```javascript
		 anUndorderedListView = Ember.CollectionView.create({
    tagName: 'ul',
    content: ['A','B','C'],
    itemViewClass: Ember.View.extend({
      template: Ember.Handlebars.compile("the letter: {{view.content}}")
    })
  });

		 anUndorderedListView.appendTo('body');
		 ```

		 Will result in the following HTML structure

		 ```html
		 <ul class="ember-view a-collection">
		 <li class="ember-view">the letter: A</li>
		 <li class="ember-view">the letter: B</li>
		 <li class="ember-view">the letter: C</li>
		 </ul>
		 ```

		 Additional `tagName` pairs can be provided by adding to
		 `Ember.CollectionView.CONTAINER_MAP `

		 ```javascript
		 Ember.CollectionView.CONTAINER_MAP['article'] = 'section'
		 ```

		 ## Programatic creation of child views

		 For cases where additional customization beyond the use of a single
		 `itemViewClass` or `tagName` matching is required CollectionView's
		 `createChildView` method can be overidden:

		 ```javascript
		 CustomCollectionView = Ember.CollectionView.extend({
    createChildView: function(viewClass, attrs) {
      if (attrs.content.kind == 'album') {
        viewClass = App.AlbumView;
      } else {
        viewClass = App.SongView;
      }
      return this._super(viewClass, attrs);
    }
  });
		 ```

		 ## Empty View

		 You can provide an `Ember.View` subclass to the `Ember.CollectionView`
		 instance as its `emptyView` property. If the `content` property of a
		 `CollectionView` is set to `null` or an empty array, an instance of this view
		 will be the `CollectionView`s only child.

		 ```javascript
		 aListWithNothing = Ember.CollectionView.create({
    classNames: ['nothing']
    content: null,
    emptyView: Ember.View.extend({
      template: Ember.Handlebars.compile("The collection is empty")
    })
  });

		 aListWithNothing.appendTo('body');
		 ```

		 Will result in the following HTML structure

		 ```html
		 <div class="ember-view nothing">
		 <div class="ember-view">
		 The collection is empty
		 </div>
		 </div>
		 ```

		 ## Adding and Removing items

		 The `childViews` property of a `CollectionView` should not be directly
		 manipulated. Instead, add, remove, replace items from its `content` property.
		 This will trigger appropriate changes to its rendered HTML.


		 @class CollectionView
		 @namespace Ember
		 @extends Ember.ContainerView
		 @since Ember 0.9
		 */
		Ember.CollectionView = Ember.ContainerView.extend(/** @scope Ember.CollectionView.prototype */ {

			/**
			 A list of items to be displayed by the `Ember.CollectionView`.

			 @property content
			 @type Ember.Array
			 @default null
			 */
			content: null,

			/**
			 @private

			 This provides metadata about what kind of empty view class this
			 collection would like if it is being instantiated from another
			 system (like Handlebars)

			 @property emptyViewClass
			 */
			emptyViewClass: Ember.View,

			/**
			 An optional view to display if content is set to an empty array.

			 @property emptyView
			 @type Ember.View
			 @default null
			 */
			emptyView: null,

			/**
			 @property itemViewClass
			 @type Ember.View
			 @default Ember.View
			 */
			itemViewClass: Ember.View,

			/**
			 Setup a CollectionView

			 @method init
			 */
			init: function() {
				var ret = this._super();
				this._contentDidChange();
				return ret;
			},

			/**
			 @private

			 Invoked when the content property is about to change. Notifies observers that the
			 entire array content will change.

			 @method _contentWillChange
			 */
			_contentWillChange: Ember.beforeObserver(function() {
				var content = this.get('content');

				if (content) { content.removeArrayObserver(this); }
				var len = content ? get(content, 'length') : 0;
				this.arrayWillChange(content, 0, len);
			}, 'content'),

			/**
			 @private

			 Check to make sure that the content has changed, and if so,
			 update the children directly. This is always scheduled
			 asynchronously, to allow the element to be created before
			 bindings have synchronized and vice versa.

			 @method _contentDidChange
			 */
			_contentDidChange: Ember.observer(function() {
				var content = get(this, 'content');

				if (content) {
					this._assertArrayLike(content);
					content.addArrayObserver(this);
				}

				var len = content ? get(content, 'length') : 0;
				this.arrayDidChange(content, 0, null, len);
			}, 'content'),

			/**
			 @private

			 Ensure that the content implements Ember.Array

			 @method _assertArrayLike
			 */
			_assertArrayLike: function(content) {

			},

			/**
			 Removes the content and content observers.

			 @method destroy
			 */
			destroy: function() {
				if (!this._super()) { return; }

				var content = get(this, 'content');
				if (content) { content.removeArrayObserver(this); }

				if (this._createdEmptyView) {
					this._createdEmptyView.destroy();
				}

				return this;
			},

			/**
			 Called when a mutation to the underlying content array will occur.

			 This method will remove any views that are no longer in the underlying
			 content array.

			 Invokes whenever the content array itself will change.

			 @method arrayWillChange
			 @param {Array} content the managed collection of objects
			 @param {Number} start the index at which the changes will occurr
			 @param {Number} removed number of object to be removed from content
			 */
			arrayWillChange: function(content, start, removedCount) {
				// If the contents were empty before and this template collection has an
				// empty view remove it now.
				var emptyView = get(this, 'emptyView');
				if (emptyView && emptyView instanceof Ember.View) {
					emptyView.removeFromParent();
				}

				// Loop through child views that correspond with the removed items.
				// Note that we loop from the end of the array to the beginning because
				// we are mutating it as we go.
				var childViews = this._childViews, childView, idx, len;

				len = this._childViews.length;

				var removingAll = removedCount === len;

				if (removingAll) {
					this.currentState.empty(this);
					this.invokeRecursively(function(view) {
						view.removedFromDOM = true;
					}, false);
				}

				for (idx = start + removedCount - 1; idx >= start; idx--) {
					childView = childViews[idx];
					childView.destroy();
				}
			},

			/**
			 Called when a mutation to the underlying content array occurs.

			 This method will replay that mutation against the views that compose the
			 `Ember.CollectionView`, ensuring that the view reflects the model.

			 This array observer is added in `contentDidChange`.

			 @method arrayDidChange
			 @param {Array} content the managed collection of objects
			 @param {Number} start the index at which the changes occurred
			 @param {Number} removed number of object removed from content
			 @param {Number} added number of object added to content
			 */
			arrayDidChange: function(content, start, removed, added) {
				var addedViews = [], view, item, idx, len, itemViewClass,
					emptyView;

				len = content ? get(content, 'length') : 0;

				if (len) {
					itemViewClass = get(this, 'itemViewClass');

					if ('string' === typeof itemViewClass) {
						itemViewClass = get(itemViewClass) || itemViewClass;
					}


					for (idx = start; idx < start+added; idx++) {
						item = content.objectAt(idx);

						view = this.createChildView(itemViewClass, {
							content: item,
							contentIndex: idx
						});

						addedViews.push(view);
					}
				} else {
					emptyView = get(this, 'emptyView');

					if (!emptyView) { return; }

					if ('string' === typeof emptyView) {
						emptyView = get(emptyView) || emptyView;
					}

					emptyView = this.createChildView(emptyView);
					addedViews.push(emptyView);
					set(this, 'emptyView', emptyView);

					if (Ember.CoreView.detect(emptyView)) {
						this._createdEmptyView = emptyView;
					}
				}

				this.replace(start, 0, addedViews);
			},

			/**
			 Instantiates a view to be added to the childViews array during view
			 initialization. You generally will not call this method directly unless
			 you are overriding `createChildViews()`. Note that this method will
			 automatically configure the correct settings on the new view instance to
			 act as a child of the parent.

			 The tag name for the view will be set to the tagName of the viewClass
			 passed in.

			 @method createChildView
			 @param {Class} viewClass
			 @param {Hash} [attrs] Attributes to add
			 @return {Ember.View} new instance
			 */
			createChildView: function(view, attrs) {
				view = this._super(view, attrs);

				var itemTagName = get(view, 'tagName');

				if (itemTagName === null || itemTagName === undefined) {
					itemTagName = Ember.CollectionView.CONTAINER_MAP[get(this, 'tagName')];
					set(view, 'tagName', itemTagName);
				}

				return view;
			}
		});

		/**
		 A map of parent tags to their default child tags. You can add
		 additional parent tags if you want collection views that use
		 a particular parent tag to default to a child tag.

		 @property CONTAINER_MAP
		 @type Hash
		 @static
		 @final
		 */
		Ember.CollectionView.CONTAINER_MAP = {
			ul: 'li',
			ol: 'li',
			table: 'tr',
			thead: 'tr',
			tbody: 'tr',
			tfoot: 'tr',
			tr: 'td',
			select: 'option'
		};

	})();



	(function() {
		var get = Ember.get, set = Ember.set, isNone = Ember.isNone;

		/**
		 @module ember
		 @submodule ember-views
		 */

		/**
		 An `Ember.Component` is a view that is completely
		 isolated. Property access in its templates go
		 to the view object and actions are targeted at
		 the view object. There is no access to the
		 surrounding context or outer controller; all
		 contextual information is passed in.

		 The easiest way to create an `Ember.Component` is via
		 a template. If you name a template
		 `components/my-foo`, you will be able to use
		 `{{my-foo}}` in other templates, which will make
		 an instance of the isolated component.

		 ```html
		 {{app-profile person=currentUser}}
		 ```

		 ```html
		 <!-- app-profile template -->
		 <h1>{{person.title}}</h1>
		 <img {{bind-attr src=person.avatar}}>
		 <p class='signature'>{{person.signature}}</p>
		 ```

		 You can also use `yield` inside a template to
		 include the **contents** of the custom tag:

		 ```html
		 {{#app-profile person=currentUser}}
		 <p>Admin mode</p>
		 {{/app-profile}}
		 ```

		 ```html
		 <!-- app-profile template -->
		 <h1>{{person.title}}</h1>
		 {{yield}} <!-- block contents -->
		 ```

		 If you want to customize the component, in order to
		 handle events or actions, you implement a subclass
		 of `Ember.Component` named after the name of the
		 component. Note that `Component` needs to be appended to the name of
		 your subclass like `AppProfileComponent`.

		 For example, you could implement the action
		 `hello` for the `app-profile` component:

		 ```javascript
		 App.AppProfileComponent = Ember.Component.extend({
    hello: function(name) {
      console.log("Hello", name);
    }
  });
		 ```

		 And then use it in the component's template:

		 ```html
		 <!-- app-profile template -->

		 <h1>{{person.title}}</h1>
		 {{yield}} <!-- block contents -->

		 <button {{action 'hello' person.name}}>
		 Say Hello to {{person.name}}
		 </button>
		 ```

		 Components must have a `-` in their name to avoid
		 conflicts with built-in controls that wrap HTML
		 elements. This is consistent with the same
		 requirement in web components.

		 @class Component
		 @namespace Ember
		 @extends Ember.View
		 */
		Ember.Component = Ember.View.extend(Ember.TargetActionSupport, {
			init: function() {
				this._super();
				set(this, 'context', this);
				set(this, 'controller', this);
			},

			// during render, isolate keywords
			cloneKeywords: function() {
				return {
					view: this,
					controller: this
				};
			},

			_yield: function(context, options) {
				var view = options.data.view,
					parentView = this._parentView,
					template = get(this, 'template');

				if (template) {


					view.appendChild(Ember.View, {
						isVirtual: true,
						tagName: '',
						_contextView: parentView,
						template: get(this, 'template'),
						context: get(parentView, 'context'),
						controller: get(parentView, 'controller'),
						templateData: { keywords: parentView.cloneKeywords() }
					});
				}
			},

			/**
			 If the component is currently inserted into the DOM of a parent view, this
			 property will point to the controller of the parent view.

			 @property targetObject
			 @type Ember.Controller
			 @default null
			 */
			targetObject: Ember.computed(function(key) {
				var parentView = get(this, '_parentView');
				return parentView ? get(parentView, 'controller') : null;
			}).property('_parentView'),

			/**
			 Sends an action to component's controller. A component inherits its
			 controller from the context in which it is used.

			 By default, calling `sendAction()` will send an action with the name
			 of the component's `action` property.

			 For example, if the component had a property `action` with the value
			 `"addItem"`, calling `sendAction()` would send the `addItem` action
			 to the component's controller.

			 If you provide the `action` argument to `sendAction()`, that key will
			 be used to look up the action name.

			 For example, if the component had a property `playing` with the value
			 `didStartPlaying`, calling `sendAction('playing')` would send the
			 `didStartPlaying` action to the component's controller.

			 Whether or not you are using the default action or a named action, if
			 the action name is not defined on the component, calling `sendAction()`
			 does not have any effect.

			 For example, if you call `sendAction()` on a component that does not have
			 an `action` property defined, no action will be sent to the controller,
			 nor will an exception be raised.

			 You can send a context object with the action by supplying the `context`
			 argument. The context will be supplied as the first argument in the
			 target's action method. Example:

			 ```javascript
			 App.MyTreeComponent = Ember.Component.extend({
      click: function() {
        this.sendAction('didClickTreeNode', this.get('node'));
      }
    });

			 App.CategoriesController = Ember.Controller.extend({
      didClickCategory: function(category) {
        //Do something with the node/category that was clicked
      }
    });
			 ```

			 ```handlebars
			 {{! categories.hbs}}
			 {{my-tree didClickTreeNode='didClickCategory'}}
			 ```

			 @method sendAction
			 @param [action] {String} the action to trigger
			 @param [context] {*} a context to send with the action
			 */
			sendAction: function(action, context) {
				var actionName;

				// Send the default action
				if (action === undefined) {
					actionName = get(this, 'action');

				} else {
					actionName = get(this, action);

				}

				// If no action name for that action could be found, just abort.
				if (actionName === undefined) { return; }

				this.triggerAction({
					action: actionName,
					actionContext: context
				});
			}
		});

	})();



	(function() {

	})();



	(function() {
		/**
		 `Ember.ViewTargetActionSupport` is a mixin that can be included in a
		 view class to add a `triggerAction` method with semantics similar to
		 the Handlebars `{{action}}` helper. It provides intelligent defaults
		 for the action's target: the view's controller; and the context that is
		 sent with the action: the view's context.

		 Note: In normal Ember usage, the `{{action}}` helper is usually the best
		 choice. This mixin is most often useful when you are doing more complex
		 event handling in custom View subclasses.

		 For example:

		 ```javascript
		 App.SaveButtonView = Ember.View.extend(Ember.ViewTargetActionSupport, {
  action: 'save',
  click: function() {
    this.triggerAction(); // Sends the `save` action, along with the current context
                          // to the current controller
  }
});
		 ```

		 The `action` can be provided as properties of an optional object argument
		 to `triggerAction` as well.

		 ```javascript
		 App.SaveButtonView = Ember.View.extend(Ember.ViewTargetActionSupport, {
  click: function() {
    this.triggerAction({
      action: 'save'
    }); // Sends the `save` action, along with the current context
        // to the current controller
  }
});
		 ```

		 @class ViewTargetActionSupport
		 @namespace Ember
		 @extends Ember.TargetActionSupport
		 */
		Ember.ViewTargetActionSupport = Ember.Mixin.create(Ember.TargetActionSupport, {
			/**
			 @property target
			 */
			target: Ember.computed.alias('controller'),
			/**
			 @property actionContext
			 */
			actionContext: Ember.computed.alias('context')
		});

	})();



	(function() {

	})();



	(function() {
		/**
		 Ember Views

		 @module ember
		 @submodule ember-views
		 @requires ember-runtime
		 @main ember-views
		 */

	})();

	(function() {
		define("metamorph",
			[],
			function() {
				"use strict";
				// ==========================================================================
				// Project:   metamorph
				// Copyright: ©2011 My Company Inc. All rights reserved.
				// ==========================================================================

				var K = function() {},
					guid = 0,
					document = this.document,
					disableRange = ('undefined' === typeof ENV ? {} : ENV).DISABLE_RANGE_API,

				// Feature-detect the W3C range API, the extended check is for IE9 which only partially supports ranges
					supportsRange = (!disableRange) && document && ('createRange' in document) && (typeof Range !== 'undefined') && Range.prototype.createContextualFragment,

				// Internet Explorer prior to 9 does not allow setting innerHTML if the first element
				// is a "zero-scope" element. This problem can be worked around by making
				// the first node an invisible text node. We, like Modernizr, use &shy;
					needsShy = document && (function() {
						var testEl = document.createElement('div');
						testEl.innerHTML = "<div></div>";
						testEl.firstChild.innerHTML = "<script></script>";
						return testEl.firstChild.innerHTML === '';
					})(),


				// IE 8 (and likely earlier) likes to move whitespace preceeding
				// a script tag to appear after it. This means that we can
				// accidentally remove whitespace when updating a morph.
					movesWhitespace = document && (function() {
						var testEl = document.createElement('div');
						testEl.innerHTML = "Test: <script type='text/x-placeholder'></script>Value";
						return testEl.childNodes[0].nodeValue === 'Test:' &&
							testEl.childNodes[2].nodeValue === ' Value';
					})();

				// Constructor that supports either Metamorph('foo') or new
				// Metamorph('foo');
				//
				// Takes a string of HTML as the argument.

				var Metamorph = function(html) {
					var self;

					if (this instanceof Metamorph) {
						self = this;
					} else {
						self = new K();
					}

					self.innerHTML = html;
					var myGuid = 'metamorph-'+(guid++);
					self.start = myGuid + '-start';
					self.end = myGuid + '-end';

					return self;
				};

				K.prototype = Metamorph.prototype;

				var rangeFor, htmlFunc, removeFunc, outerHTMLFunc, appendToFunc, afterFunc, prependFunc, startTagFunc, endTagFunc;

				outerHTMLFunc = function() {
					return this.startTag() + this.innerHTML + this.endTag();
				};

				startTagFunc = function() {
					/*
					 * We replace chevron by its hex code in order to prevent escaping problems.
					 * Check this thread for more explaination:
					 * http://stackoverflow.com/questions/8231048/why-use-x3c-instead-of-when-generating-html-from-javascript
					 */
					return "<script id='" + this.start + "' type='text/x-placeholder'>\x3C/script>";
				};

				endTagFunc = function() {
					/*
					 * We replace chevron by its hex code in order to prevent escaping problems.
					 * Check this thread for more explaination:
					 * http://stackoverflow.com/questions/8231048/why-use-x3c-instead-of-when-generating-html-from-javascript
					 */
					return "<script id='" + this.end + "' type='text/x-placeholder'>\x3C/script>";
				};

				// If we have the W3C range API, this process is relatively straight forward.
				if (supportsRange) {

					// Get a range for the current morph. Optionally include the starting and
					// ending placeholders.
					rangeFor = function(morph, outerToo) {
						var range = document.createRange();
						var before = document.getElementById(morph.start);
						var after = document.getElementById(morph.end);

						if (outerToo) {
							range.setStartBefore(before);
							range.setEndAfter(after);
						} else {
							range.setStartAfter(before);
							range.setEndBefore(after);
						}

						return range;
					};

					htmlFunc = function(html, outerToo) {
						// get a range for the current metamorph object
						var range = rangeFor(this, outerToo);

						// delete the contents of the range, which will be the
						// nodes between the starting and ending placeholder.
						range.deleteContents();

						// create a new document fragment for the HTML
						var fragment = range.createContextualFragment(html);

						// insert the fragment into the range
						range.insertNode(fragment);
					};

					removeFunc = function() {
						// get a range for the current metamorph object including
						// the starting and ending placeholders.
						var range = rangeFor(this, true);

						// delete the entire range.
						range.deleteContents();
					};

					appendToFunc = function(node) {
						var range = document.createRange();
						range.setStart(node);
						range.collapse(false);
						var frag = range.createContextualFragment(this.outerHTML());
						node.appendChild(frag);
					};

					afterFunc = function(html) {
						var range = document.createRange();
						var after = document.getElementById(this.end);

						range.setStartAfter(after);
						range.setEndAfter(after);

						var fragment = range.createContextualFragment(html);
						range.insertNode(fragment);
					};

					prependFunc = function(html) {
						var range = document.createRange();
						var start = document.getElementById(this.start);

						range.setStartAfter(start);
						range.setEndAfter(start);

						var fragment = range.createContextualFragment(html);
						range.insertNode(fragment);
					};

				} else {
					/**
					 * This code is mostly taken from jQuery, with one exception. In jQuery's case, we
					 * have some HTML and we need to figure out how to convert it into some nodes.
					 *
					 * In this case, jQuery needs to scan the HTML looking for an opening tag and use
					 * that as the key for the wrap map. In our case, we know the parent node, and
					 * can use its type as the key for the wrap map.
					 **/
					var wrapMap = {
						select: [ 1, "<select multiple='multiple'>", "</select>" ],
						fieldset: [ 1, "<fieldset>", "</fieldset>" ],
						table: [ 1, "<table>", "</table>" ],
						tbody: [ 2, "<table><tbody>", "</tbody></table>" ],
						tr: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
						colgroup: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
						map: [ 1, "<map>", "</map>" ],
						_default: [ 0, "", "" ]
					};

					var findChildById = function(element, id) {
						if (element.getAttribute('id') === id) { return element; }

						var len = element.childNodes.length, idx, node, found;
						for (idx=0; idx<len; idx++) {
							node = element.childNodes[idx];
							found = node.nodeType === 1 && findChildById(node, id);
							if (found) { return found; }
						}
					};

					var setInnerHTML = function(element, html) {
						var matches = [];
						if (movesWhitespace) {
							// Right now we only check for script tags with ids with the
							// goal of targeting morphs.
							html = html.replace(/(\s+)(<script id='([^']+)')/g, function(match, spaces, tag, id) {
								matches.push([id, spaces]);
								return tag;
							});
						}

						element.innerHTML = html;

						// If we have to do any whitespace adjustments do them now
						if (matches.length > 0) {
							var len = matches.length, idx;
							for (idx=0; idx<len; idx++) {
								var script = findChildById(element, matches[idx][0]),
									node = document.createTextNode(matches[idx][1]);
								script.parentNode.insertBefore(node, script);
							}
						}
					};

					/**
					 * Given a parent node and some HTML, generate a set of nodes. Return the first
					 * node, which will allow us to traverse the rest using nextSibling.
					 *
					 * We need to do this because innerHTML in IE does not really parse the nodes.
					 **/
					var firstNodeFor = function(parentNode, html) {
						var arr = wrapMap[parentNode.tagName.toLowerCase()] || wrapMap._default;
						var depth = arr[0], start = arr[1], end = arr[2];

						if (needsShy) { html = '&shy;'+html; }

						var element = document.createElement('div');

						setInnerHTML(element, start + html + end);

						for (var i=0; i<=depth; i++) {
							element = element.firstChild;
						}

						// Look for &shy; to remove it.
						if (needsShy) {
							var shyElement = element;

							// Sometimes we get nameless elements with the shy inside
							while (shyElement.nodeType === 1 && !shyElement.nodeName) {
								shyElement = shyElement.firstChild;
							}

							// At this point it's the actual unicode character.
							if (shyElement.nodeType === 3 && shyElement.nodeValue.charAt(0) === "\u00AD") {
								shyElement.nodeValue = shyElement.nodeValue.slice(1);
							}
						}

						return element;
					};

					/**
					 * In some cases, Internet Explorer can create an anonymous node in
					 * the hierarchy with no tagName. You can create this scenario via:
					 *
					 *     div = document.createElement("div");
					 *     div.innerHTML = "<table>&shy<script></script><tr><td>hi</td></tr></table>";
					 *     div.firstChild.firstChild.tagName //=> ""
					 *
					 * If our script markers are inside such a node, we need to find that
					 * node and use *it* as the marker.
					 **/
					var realNode = function(start) {
						while (start.parentNode.tagName === "") {
							start = start.parentNode;
						}

						return start;
					};

					/**
					 * When automatically adding a tbody, Internet Explorer inserts the
					 * tbody immediately before the first <tr>. Other browsers create it
					 * before the first node, no matter what.
					 *
					 * This means the the following code:
					 *
					 *     div = document.createElement("div");
					 *     div.innerHTML = "<table><script id='first'></script><tr><td>hi</td></tr><script id='last'></script></table>
					 *
					 * Generates the following DOM in IE:
					 *
					 *     + div
					 *       + table
					 *         - script id='first'
					 *         + tbody
					 *           + tr
					 *             + td
					 *               - "hi"
					 *           - script id='last'
					 *
					 * Which means that the two script tags, even though they were
					 * inserted at the same point in the hierarchy in the original
					 * HTML, now have different parents.
					 *
					 * This code reparents the first script tag by making it the tbody's
					 * first child.
					 **/
					var fixParentage = function(start, end) {
						if (start.parentNode !== end.parentNode) {
							end.parentNode.insertBefore(start, end.parentNode.firstChild);
						}
					};

					htmlFunc = function(html, outerToo) {
						// get the real starting node. see realNode for details.
						var start = realNode(document.getElementById(this.start));
						var end = document.getElementById(this.end);
						var parentNode = end.parentNode;
						var node, nextSibling, last;

						// make sure that the start and end nodes share the same
						// parent. If not, fix it.
						fixParentage(start, end);

						// remove all of the nodes after the starting placeholder and
						// before the ending placeholder.
						node = start.nextSibling;
						while (node) {
							nextSibling = node.nextSibling;
							last = node === end;

							// if this is the last node, and we want to remove it as well,
							// set the `end` node to the next sibling. This is because
							// for the rest of the function, we insert the new nodes
							// before the end (note that insertBefore(node, null) is
							// the same as appendChild(node)).
							//
							// if we do not want to remove it, just break.
							if (last) {
								if (outerToo) { end = node.nextSibling; } else { break; }
							}

							node.parentNode.removeChild(node);

							// if this is the last node and we didn't break before
							// (because we wanted to remove the outer nodes), break
							// now.
							if (last) { break; }

							node = nextSibling;
						}

						// get the first node for the HTML string, even in cases like
						// tables and lists where a simple innerHTML on a div would
						// swallow some of the content.
						node = firstNodeFor(start.parentNode, html);

						// copy the nodes for the HTML between the starting and ending
						// placeholder.
						while (node) {
							nextSibling = node.nextSibling;
							parentNode.insertBefore(node, end);
							node = nextSibling;
						}
					};

					// remove the nodes in the DOM representing this metamorph.
					//
					// this includes the starting and ending placeholders.
					removeFunc = function() {
						var start = realNode(document.getElementById(this.start));
						var end = document.getElementById(this.end);

						this.html('');
						start.parentNode.removeChild(start);
						end.parentNode.removeChild(end);
					};

					appendToFunc = function(parentNode) {
						var node = firstNodeFor(parentNode, this.outerHTML());
						var nextSibling;

						while (node) {
							nextSibling = node.nextSibling;
							parentNode.appendChild(node);
							node = nextSibling;
						}
					};

					afterFunc = function(html) {
						// get the real starting node. see realNode for details.
						var end = document.getElementById(this.end);
						var insertBefore = end.nextSibling;
						var parentNode = end.parentNode;
						var nextSibling;
						var node;

						// get the first node for the HTML string, even in cases like
						// tables and lists where a simple innerHTML on a div would
						// swallow some of the content.
						node = firstNodeFor(parentNode, html);

						// copy the nodes for the HTML between the starting and ending
						// placeholder.
						while (node) {
							nextSibling = node.nextSibling;
							parentNode.insertBefore(node, insertBefore);
							node = nextSibling;
						}
					};

					prependFunc = function(html) {
						var start = document.getElementById(this.start);
						var parentNode = start.parentNode;
						var nextSibling;
						var node;

						node = firstNodeFor(parentNode, html);
						var insertBefore = start.nextSibling;

						while (node) {
							nextSibling = node.nextSibling;
							parentNode.insertBefore(node, insertBefore);
							node = nextSibling;
						}
					};
				}

				Metamorph.prototype.html = function(html) {
					this.checkRemoved();
					if (html === undefined) { return this.innerHTML; }

					htmlFunc.call(this, html);

					this.innerHTML = html;
				};

				Metamorph.prototype.replaceWith = function(html) {
					this.checkRemoved();
					htmlFunc.call(this, html, true);
				};

				Metamorph.prototype.remove = removeFunc;
				Metamorph.prototype.outerHTML = outerHTMLFunc;
				Metamorph.prototype.appendTo = appendToFunc;
				Metamorph.prototype.after = afterFunc;
				Metamorph.prototype.prepend = prependFunc;
				Metamorph.prototype.startTag = startTagFunc;
				Metamorph.prototype.endTag = endTagFunc;

				Metamorph.prototype.isRemoved = function() {
					var before = document.getElementById(this.start);
					var after = document.getElementById(this.end);

					return !before || !after;
				};

				Metamorph.prototype.checkRemoved = function() {
					if (this.isRemoved()) {
						throw new Error("Cannot perform operations on a Metamorph that is not in the DOM.");
					}
				};

				return Metamorph;
			});

	})();

	(function() {
		/**
		 @module ember
		 @submodule ember-handlebars-compiler
		 */

// Eliminate dependency on any Ember to simplify precompilation workflow
		var objectCreate = Object.create || function(parent) {
			function F() {}
			F.prototype = parent;
			return new F();
		};

		var Handlebars = (Ember.imports && Ember.imports.Handlebars) || (this && this.Handlebars);
		if (!Handlebars && typeof require === 'function') {
			Handlebars = require('handlebars');
		}



		/**
		 Prepares the Handlebars templating library for use inside Ember's view
		 system.

		 The `Ember.Handlebars` object is the standard Handlebars library, extended to
		 use Ember's `get()` method instead of direct property access, which allows
		 computed properties to be used inside templates.

		 To create an `Ember.Handlebars` template, call `Ember.Handlebars.compile()`.
		 This will return a function that can be used by `Ember.View` for rendering.

		 @class Handlebars
		 @namespace Ember
		 */
		Ember.Handlebars = objectCreate(Handlebars);

		function makeBindings(options) {
			var hash = options.hash,
				hashType = options.hashTypes;

			for (var prop in hash) {
				if (hashType[prop] === 'ID') {
					hash[prop + 'Binding'] = hash[prop];
					hashType[prop + 'Binding'] = 'STRING';
					delete hash[prop];
					delete hashType[prop];
				}
			}
		}

		/**
		 Register a bound helper or custom view helper.

		 ## Simple bound helper example

		 ```javascript
		 Ember.Handlebars.helper('capitalize', function(value) {
    return value.toUpperCase();
  });
		 ```

		 The above bound helper can be used inside of templates as follows:

		 ```handlebars
		 {{capitalize name}}
		 ```

		 In this case, when the `name` property of the template's context changes,
		 the rendered value of the helper will update to reflect this change.

		 For more examples of bound helpers, see documentation for
		 `Ember.Handlebars.registerBoundHelper`.

		 ## Custom view helper example

		 Assuming a view subclass named `App.CalendarView` were defined, a helper
		 for rendering instances of this view could be registered as follows:

		 ```javascript
		 Ember.Handlebars.helper('calendar', App.CalendarView):
		 ```

		 The above bound helper can be used inside of templates as follows:

		 ```handlebars
		 {{calendar}}
		 ```

		 Which is functionally equivalent to:

		 ```handlebars
		 {{view App.CalendarView}}
		 ```

		 Options in the helper will be passed to the view in exactly the same
		 manner as with the `view` helper.

		 @method helper
		 @for Ember.Handlebars
		 @param {String} name
		 @param {Function|Ember.View} function or view class constructor
		 @param {String} dependentKeys*
		 */
		Ember.Handlebars.helper = function(name, value) {


			if (Ember.View.detect(value)) {
				Ember.Handlebars.registerHelper(name, function(options) {

					makeBindings(options);
					return Ember.Handlebars.helpers.view.call(this, value, options);
				});
			} else {
				Ember.Handlebars.registerBoundHelper.apply(null, arguments);
			}
		};

		/**
		 @class helpers
		 @namespace Ember.Handlebars
		 */
		Ember.Handlebars.helpers = objectCreate(Handlebars.helpers);

		/**
		 Override the the opcode compiler and JavaScript compiler for Handlebars.

		 @class Compiler
		 @namespace Ember.Handlebars
		 @private
		 @constructor
		 */
		Ember.Handlebars.Compiler = function() {};

// Handlebars.Compiler doesn't exist in runtime-only
		if (Handlebars.Compiler) {
			Ember.Handlebars.Compiler.prototype = objectCreate(Handlebars.Compiler.prototype);
		}

		Ember.Handlebars.Compiler.prototype.compiler = Ember.Handlebars.Compiler;

		/**
		 @class JavaScriptCompiler
		 @namespace Ember.Handlebars
		 @private
		 @constructor
		 */
		Ember.Handlebars.JavaScriptCompiler = function() {};

// Handlebars.JavaScriptCompiler doesn't exist in runtime-only
		if (Handlebars.JavaScriptCompiler) {
			Ember.Handlebars.JavaScriptCompiler.prototype = objectCreate(Handlebars.JavaScriptCompiler.prototype);
			Ember.Handlebars.JavaScriptCompiler.prototype.compiler = Ember.Handlebars.JavaScriptCompiler;
		}


		Ember.Handlebars.JavaScriptCompiler.prototype.namespace = "Ember.Handlebars";


		Ember.Handlebars.JavaScriptCompiler.prototype.initializeBuffer = function() {
			return "''";
		};

		/**
		 @private

		 Override the default buffer for Ember Handlebars. By default, Handlebars
		 creates an empty String at the beginning of each invocation and appends to
		 it. Ember's Handlebars overrides this to append to a single shared buffer.

		 @method appendToBuffer
		 @param string {String}
		 */
		Ember.Handlebars.JavaScriptCompiler.prototype.appendToBuffer = function(string) {
			return "data.buffer.push("+string+");";
		};

		var prefix = "ember" + (+new Date()), incr = 1;

		/**
		 @private

		 Rewrite simple mustaches from `{{foo}}` to `{{bind "foo"}}`. This means that
		 all simple mustaches in Ember's Handlebars will also set up an observer to
		 keep the DOM up to date when the underlying property changes.

		 @method mustache
		 @for Ember.Handlebars.Compiler
		 @param mustache
		 */
		Ember.Handlebars.Compiler.prototype.mustache = function(mustache) {
			if (mustache.isHelper && mustache.id.string === 'control') {
				mustache.hash = mustache.hash || new Handlebars.AST.HashNode([]);
				mustache.hash.pairs.push(["controlID", new Handlebars.AST.StringNode(prefix + incr++)]);
			} else if (mustache.params.length || mustache.hash) {
				// no changes required
			} else {
				var id = new Handlebars.AST.IdNode([{ part: '_triageMustache' }]);

				// Update the mustache node to include a hash value indicating whether the original node
				// was escaped. This will allow us to properly escape values when the underlying value
				// changes and we need to re-render the value.
				if (!mustache.escaped) {
					mustache.hash = mustache.hash || new Handlebars.AST.HashNode([]);
					mustache.hash.pairs.push(["unescaped", new Handlebars.AST.StringNode("true")]);
				}
				mustache = new Handlebars.AST.MustacheNode([id].concat([mustache.id]), mustache.hash, !mustache.escaped);
			}

			return Handlebars.Compiler.prototype.mustache.call(this, mustache);
		};

		/**
		 Used for precompilation of Ember Handlebars templates. This will not be used
		 during normal app execution.

		 @method precompile
		 @for Ember.Handlebars
		 @static
		 @param {String} string The template to precompile
		 */
		Ember.Handlebars.precompile = function(string) {
			var ast = Handlebars.parse(string);

			var options = {
				knownHelpers: {
					action: true,
					unbound: true,
					bindAttr: true,
					template: true,
					view: true,
					_triageMustache: true
				},
				data: true,
				stringParams: true
			};

			var environment = new Ember.Handlebars.Compiler().compile(ast, options);
			return new Ember.Handlebars.JavaScriptCompiler().compile(environment, options, undefined, true);
		};

// We don't support this for Handlebars runtime-only
		if (Handlebars.compile) {
			/**
			 The entry point for Ember Handlebars. This replaces the default
			 `Handlebars.compile` and turns on template-local data and String
			 parameters.

			 @method compile
			 @for Ember.Handlebars
			 @static
			 @param {String} string The template to compile
			 @return {Function}
			 */
			Ember.Handlebars.compile = function(string) {
				var ast = Handlebars.parse(string);
				var options = { data: true, stringParams: true };
				var environment = new Ember.Handlebars.Compiler().compile(ast, options);
				var templateSpec = new Ember.Handlebars.JavaScriptCompiler().compile(environment, options, undefined, true);

				var template = Ember.Handlebars.template(templateSpec);
				template.isMethod = false; //Make sure we don't wrap templates with ._super

				return template;
			};
		}


	})();

	(function() {
		var slice = Array.prototype.slice;

		/**
		 @private

		 If a path starts with a reserved keyword, returns the root
		 that should be used.

		 @method normalizePath
		 @for Ember
		 @param root {Object}
		 @param path {String}
		 @param data {Hash}
		 */
		var normalizePath = Ember.Handlebars.normalizePath = function(root, path, data) {
			var keywords = (data && data.keywords) || {},
				keyword, isKeyword;

			// Get the first segment of the path. For example, if the
			// path is "foo.bar.baz", returns "foo".
			keyword = path.split('.', 1)[0];

			// Test to see if the first path is a keyword that has been
			// passed along in the view's data hash. If so, we will treat
			// that object as the new root.
			if (keywords.hasOwnProperty(keyword)) {
				// Look up the value in the template's data hash.
				root = keywords[keyword];
				isKeyword = true;

				// Handle cases where the entire path is the reserved
				// word. In that case, return the object itself.
				if (path === keyword) {
					path = '';
				} else {
					// Strip the keyword from the path and look up
					// the remainder from the newly found root.
					path = path.substr(keyword.length+1);
				}
			}

			return { root: root, path: path, isKeyword: isKeyword };
		};


		/**
		 Lookup both on root and on window. If the path starts with
		 a keyword, the corresponding object will be looked up in the
		 template's data hash and used to resolve the path.

		 @method get
		 @for Ember.Handlebars
		 @param {Object} root The object to look up the property on
		 @param {String} path The path to be lookedup
		 @param {Object} options The template's option hash
		 */
		var handlebarsGet = Ember.Handlebars.get = function(root, path, options) {
			var data = options && options.data,
				normalizedPath = normalizePath(root, path, data),
				value;

			// In cases where the path begins with a keyword, change the
			// root to the value represented by that keyword, and ensure
			// the path is relative to it.
			root = normalizedPath.root;
			path = normalizedPath.path;

			value = Ember.get(root, path);

			// If the path starts with a capital letter, look it up on Ember.lookup,
			// which defaults to the `window` object in browsers.
			if (value === undefined && root !== Ember.lookup && Ember.isGlobalPath(path)) {
				value = Ember.get(Ember.lookup, path);
			}
			return value;
		};
		Ember.Handlebars.getPath = Ember.deprecateFunc('`Ember.Handlebars.getPath` has been changed to `Ember.Handlebars.get` for consistency.', Ember.Handlebars.get);

		Ember.Handlebars.resolveParams = function(context, params, options) {
			var resolvedParams = [], types = options.types, param, type;

			for (var i=0, l=params.length; i<l; i++) {
				param = params[i];
				type = types[i];

				if (type === 'ID') {
					resolvedParams.push(handlebarsGet(context, param, options));
				} else {
					resolvedParams.push(param);
				}
			}

			return resolvedParams;
		};

		Ember.Handlebars.resolveHash = function(context, hash, options) {
			var resolvedHash = {}, types = options.hashTypes, type;

			for (var key in hash) {
				if (!hash.hasOwnProperty(key)) { continue; }

				type = types[key];

				if (type === 'ID') {
					resolvedHash[key] = handlebarsGet(context, hash[key], options);
				} else {
					resolvedHash[key] = hash[key];
				}
			}

			return resolvedHash;
		};

		/**
		 @private

		 Registers a helper in Handlebars that will be called if no property with the
		 given name can be found on the current context object, and no helper with
		 that name is registered.

		 This throws an exception with a more helpful error message so the user can
		 track down where the problem is happening.

		 @method helperMissing
		 @for Ember.Handlebars.helpers
		 @param {String} path
		 @param {Hash} options
		 */
		Ember.Handlebars.registerHelper('helperMissing', function(path, options) {
			var error, view = "";

			error = "%@ Handlebars error: Could not find property '%@' on object %@.";
			if (options.data) {
				view = options.data.view;
			}
			throw new Ember.Error(Ember.String.fmt(error, [view, path, this]));
		});

		/**
		 Register a bound handlebars helper. Bound helpers behave similarly to regular
		 handlebars helpers, with the added ability to re-render when the underlying data
		 changes.

		 ## Simple example

		 ```javascript
		 Ember.Handlebars.registerBoundHelper('capitalize', function(value) {
    return value.toUpperCase();
  });
		 ```

		 The above bound helper can be used inside of templates as follows:

		 ```handlebars
		 {{capitalize name}}
		 ```

		 In this case, when the `name` property of the template's context changes,
		 the rendered value of the helper will update to reflect this change.

		 ## Example with options

		 Like normal handlebars helpers, bound helpers have access to the options
		 passed into the helper call.

		 ```javascript
		 Ember.Handlebars.registerBoundHelper('repeat', function(value, options) {
    var count = options.hash.count;
    var a = [];
    while(a.length < count) {
        a.push(value);
    }
    return a.join('');
  });
		 ```

		 This helper could be used in a template as follows:

		 ```handlebars
		 {{repeat text count=3}}
		 ```

		 ## Example with bound options

		 Bound hash options are also supported. Example:

		 ```handlebars
		 {{repeat text countBinding="numRepeats"}}
		 ```

		 In this example, count will be bound to the value of
		 the `numRepeats` property on the context. If that property
		 changes, the helper will be re-rendered.

		 ## Example with extra dependencies

		 The `Ember.Handlebars.registerBoundHelper` method takes a variable length
		 third parameter which indicates extra dependencies on the passed in value.
		 This allows the handlebars helper to update when these dependencies change.

		 ```javascript
		 Ember.Handlebars.registerBoundHelper('capitalizeName', function(value) {
    return value.get('name').toUpperCase();
  }, 'name');
		 ```

		 ## Example with multiple bound properties

		 `Ember.Handlebars.registerBoundHelper` supports binding to
		 multiple properties, e.g.:

		 ```javascript
		 Ember.Handlebars.registerBoundHelper('concatenate', function() {
    var values = Array.prototype.slice.call(arguments, 0, -1);
    return values.join('||');
  });
		 ```

		 Which allows for template syntax such as `{{concatenate prop1 prop2}}` or
		 `{{concatenate prop1 prop2 prop3}}`. If any of the properties change,
		 the helpr will re-render.  Note that dependency keys cannot be
		 using in conjunction with multi-property helpers, since it is ambiguous
		 which property the dependent keys would belong to.

		 ## Use with unbound helper

		 The `{{unbound}}` helper can be used with bound helper invocations
		 to render them in their unbound form, e.g.

		 ```handlebars
		 {{unbound capitalize name}}
		 ```

		 In this example, if the name property changes, the helper
		 will not re-render.

		 ## Use with blocks not supported

		 Bound helpers do not support use with Handlebars blocks or
		 the addition of child views of any kind.

		 @method registerBoundHelper
		 @for Ember.Handlebars
		 @param {String} name
		 @param {Function} function
		 @param {String} dependentKeys*
		 */
		Ember.Handlebars.registerBoundHelper = function(name, fn) {
			var dependentKeys = slice.call(arguments, 2);

			function helper() {
				var properties = slice.call(arguments, 0, -1),
					numProperties = properties.length,
					options = arguments[arguments.length - 1],
					normalizedProperties = [],
					types = options.types,
					data = options.data,
					hash = options.hash,
					view = data.view,
					currentContext = (options.contexts && options.contexts[0]) || this,
					prefixPathForDependentKeys = '',
					loc, len, hashOption,
					boundOption, property,
					normalizedValue = Ember._SimpleHandlebarsView.prototype.normalizedValue;


				// Detect bound options (e.g. countBinding="otherCount")
				var boundOptions = hash.boundOptions = {};
				for (hashOption in hash) {
					if (Ember.IS_BINDING.test(hashOption)) {
						// Lop off 'Binding' suffix.
						boundOptions[hashOption.slice(0, -7)] = hash[hashOption];
					}
				}

				// Expose property names on data.properties object.
				var watchedProperties = [];
				data.properties = [];
				for (loc = 0; loc < numProperties; ++loc) {
					data.properties.push(properties[loc]);
					if (types[loc] === 'ID') {
						var normalizedProp = normalizePath(currentContext, properties[loc], data);
						normalizedProperties.push(normalizedProp);
						watchedProperties.push(normalizedProp);
					} else {
						normalizedProperties.push(null);
					}
				}

				// Handle case when helper invocation is preceded by `unbound`, e.g.
				// {{unbound myHelper foo}}
				if (data.isUnbound) {
					return evaluateUnboundHelper(this, fn, normalizedProperties, options);
				}

				var bindView = new Ember._SimpleHandlebarsView(null, null, !options.hash.unescaped, options.data);

				// Override SimpleHandlebarsView's method for generating the view's content.
				bindView.normalizedValue = function() {
					var args = [], boundOption;

					// Copy over bound hash options.
					for (boundOption in boundOptions) {
						if (!boundOptions.hasOwnProperty(boundOption)) { continue; }
						property = normalizePath(currentContext, boundOptions[boundOption], data);
						bindView.path = property.path;
						bindView.pathRoot = property.root;
						hash[boundOption] = normalizedValue.call(bindView);
					}

					for (loc = 0; loc < numProperties; ++loc) {
						property = normalizedProperties[loc];
						if (property) {
							bindView.path = property.path;
							bindView.pathRoot = property.root;
							args.push(normalizedValue.call(bindView));
						} else {
							args.push(properties[loc]);
						}
					}
					args.push(options);

					// Run the supplied helper function.
					return fn.apply(currentContext, args);
				};

				view.appendChild(bindView);

				// Assemble list of watched properties that'll re-render this helper.
				for (boundOption in boundOptions) {
					if (boundOptions.hasOwnProperty(boundOption)) {
						watchedProperties.push(normalizePath(currentContext, boundOptions[boundOption], data));
					}
				}

				// Observe each property.
				for (loc = 0, len = watchedProperties.length; loc < len; ++loc) {
					property = watchedProperties[loc];
					view.registerObserver(property.root, property.path, bindView, bindView.rerender);
				}

				if (types[0] !== 'ID' || normalizedProperties.length === 0) {
					return;
				}

				// Add dependent key observers to the first param
				var normalized = normalizedProperties[0],
					pathRoot = normalized.root,
					path = normalized.path;

				if(!Ember.isEmpty(path)) {
					prefixPathForDependentKeys = path + '.';
				}
				for (var i=0, l=dependentKeys.length; i<l; i++) {
					view.registerObserver(pathRoot, prefixPathForDependentKeys + dependentKeys[i], bindView, bindView.rerender);
				}
			}

			helper._rawFunction = fn;
			Ember.Handlebars.registerHelper(name, helper);
		};

		/**
		 @private

		 Renders the unbound form of an otherwise bound helper function.

		 @method evaluateUnboundHelper
		 @param {Function} fn
		 @param {Object} context
		 @param {Array} normalizedProperties
		 @param {String} options
		 */
		function evaluateUnboundHelper(context, fn, normalizedProperties, options) {
			var args = [], hash = options.hash, boundOptions = hash.boundOptions, loc, len, property, boundOption;

			for (boundOption in boundOptions) {
				if (!boundOptions.hasOwnProperty(boundOption)) { continue; }
				hash[boundOption] = Ember.Handlebars.get(context, boundOptions[boundOption], options);
			}

			for(loc = 0, len = normalizedProperties.length; loc < len; ++loc) {
				property = normalizedProperties[loc];
				args.push(Ember.Handlebars.get(context, property.path, options));
			}
			args.push(options);
			return fn.apply(context, args);
		}

		/**
		 @private

		 Overrides Handlebars.template so that we can distinguish
		 user-created, top-level templates from inner contexts.

		 @method template
		 @for Ember.Handlebars
		 @param {String} template spec
		 */
		Ember.Handlebars.template = function(spec) {
			var t = Handlebars.template(spec);
			t.isTop = true;
			return t;
		};

	})();



	(function() {
		/**
		 Mark a string as safe for unescaped output with Handlebars. If you
		 return HTML from a Handlebars helper, use this function to
		 ensure Handlebars does not escape the HTML.

		 ```javascript
		 Ember.String.htmlSafe('<div>someString</div>')
		 ```

		 @method htmlSafe
		 @for Ember.String
		 @static
		 @return {Handlebars.SafeString} a string that will not be html escaped by Handlebars
		 */
		Ember.String.htmlSafe = function(str) {
			return new Handlebars.SafeString(str);
		};

		var htmlSafe = Ember.String.htmlSafe;

		if (Ember.EXTEND_PROTOTYPES === true || Ember.EXTEND_PROTOTYPES.String) {

			/**
			 Mark a string as being safe for unescaped output with Handlebars.

			 ```javascript
			 '<div>someString</div>'.htmlSafe()
			 ```

			 See [Ember.String.htmlSafe](/api/classes/Ember.String.html#method_htmlSafe).

			 @method htmlSafe
			 @for String
			 @return {Handlebars.SafeString} a string that will not be html escaped by Handlebars
			 */
			String.prototype.htmlSafe = function() {
				return htmlSafe(this);
			};
		}

	})();



	(function() {
		Ember.Handlebars.resolvePaths = function(options) {
			var ret = [],
				contexts = options.contexts,
				roots = options.roots,
				data = options.data;

			for (var i=0, l=contexts.length; i<l; i++) {
				ret.push( Ember.Handlebars.get(roots[i], contexts[i], { data: data }) );
			}

			return ret;
		};

	})();



	(function() {
		/*jshint newcap:false*/
		/**
		 @module ember
		 @submodule ember-handlebars
		 */

		var set = Ember.set, get = Ember.get;
		var Metamorph = requireModule('metamorph');

		function notifyMutationListeners() {
			Ember.run.once(Ember.View, 'notifyMutationListeners');
		}

// DOMManager should just abstract dom manipulation between jquery and metamorph
		var DOMManager = {
			remove: function(view) {
				view.morph.remove();
				notifyMutationListeners();
			},

			prepend: function(view, html) {
				view.morph.prepend(html);
				notifyMutationListeners();
			},

			after: function(view, html) {
				view.morph.after(html);
				notifyMutationListeners();
			},

			html: function(view, html) {
				view.morph.html(html);
				notifyMutationListeners();
			},

			// This is messed up.
			replace: function(view) {
				var morph = view.morph;

				view.transitionTo('preRender');

				Ember.run.schedule('render', this, function() {
					if (view.isDestroying) { return; }

					view.clearRenderedChildren();
					var buffer = view.renderToBuffer();

					view.invokeRecursively(function(view) {
						view.propertyWillChange('element');
					});
					view.triggerRecursively('willInsertElement');

					morph.replaceWith(buffer.string());
					view.transitionTo('inDOM');

					view.invokeRecursively(function(view) {
						view.propertyDidChange('element');
					});
					view.triggerRecursively('didInsertElement');

					notifyMutationListeners();
				});
			},

			empty: function(view) {
				view.morph.html("");
				notifyMutationListeners();
			}
		};

// The `morph` and `outerHTML` properties are internal only
// and not observable.

		/**
		 @class _Metamorph
		 @namespace Ember
		 @private
		 */
		Ember._Metamorph = Ember.Mixin.create({
			isVirtual: true,
			tagName: '',

			instrumentName: 'metamorph',

			init: function() {
				this._super();
				this.morph = Metamorph();

			},

			beforeRender: function(buffer) {
				buffer.push(this.morph.startTag());
				buffer.pushOpeningTag();
			},

			afterRender: function(buffer) {
				buffer.pushClosingTag();
				buffer.push(this.morph.endTag());
			},

			createElement: function() {
				var buffer = this.renderToBuffer();
				this.outerHTML = buffer.string();
				this.clearBuffer();
			},

			domManager: DOMManager
		});

		/**
		 @class _MetamorphView
		 @namespace Ember
		 @extends Ember.View
		 @uses Ember._Metamorph
		 @private
		 */
		Ember._MetamorphView = Ember.View.extend(Ember._Metamorph);

		/**
		 @class _SimpleMetamorphView
		 @namespace Ember
		 @extends Ember.CoreView
		 @uses Ember._Metamorph
		 @private
		 */
		Ember._SimpleMetamorphView = Ember.CoreView.extend(Ember._Metamorph);


	})();



	(function() {
		/*globals Handlebars */
		/*jshint newcap:false*/
		/**
		 @module ember
		 @submodule ember-handlebars
		 */

		var get = Ember.get, set = Ember.set, handlebarsGet = Ember.Handlebars.get;
		var Metamorph = requireModule('metamorph');
		function SimpleHandlebarsView(path, pathRoot, isEscaped, templateData) {
			this.path = path;
			this.pathRoot = pathRoot;
			this.isEscaped = isEscaped;
			this.templateData = templateData;

			this.morph = Metamorph();
			this.state = 'preRender';
			this.updateId = null;
			this._parentView = null;
			this.buffer = null;
		}

		Ember._SimpleHandlebarsView = SimpleHandlebarsView;

		SimpleHandlebarsView.prototype = {
			isVirtual: true,
			isView: true,

			destroy: function () {
				if (this.updateId) {
					Ember.run.cancel(this.updateId);
					this.updateId = null;
				}
				if (this._parentView) {
					this._parentView.removeChild(this);
				}
				this.morph = null;
				this.state = 'destroyed';
			},

			propertyWillChange: Ember.K,

			propertyDidChange: Ember.K,

			normalizedValue: function() {
				var path = this.path,
					pathRoot = this.pathRoot,
					result, templateData;

				// Use the pathRoot as the result if no path is provided. This
				// happens if the path is `this`, which gets normalized into
				// a `pathRoot` of the current Handlebars context and a path
				// of `''`.
				if (path === '') {
					result = pathRoot;
				} else {
					templateData = this.templateData;
					result = handlebarsGet(pathRoot, path, { data: templateData });
				}

				return result;
			},

			renderToBuffer: function(buffer) {
				var string = '';

				string += this.morph.startTag();
				string += this.render();
				string += this.morph.endTag();

				buffer.push(string);
			},

			render: function() {
				// If not invoked via a triple-mustache ({{{foo}}}), escape
				// the content of the template.
				var escape = this.isEscaped;
				var result = this.normalizedValue();

				if (result === null || result === undefined) {
					result = "";
				} else if (!(result instanceof Handlebars.SafeString)) {
					result = String(result);
				}

				if (escape) { result = Handlebars.Utils.escapeExpression(result); }
				return result;
			},

			rerender: function() {
				switch(this.state) {
					case 'preRender':
					case 'destroyed':
						break;
					case 'inBuffer':
						throw new Ember.Error("Something you did tried to replace an {{expression}} before it was inserted into the DOM.");
					case 'hasElement':
					case 'inDOM':
						this.updateId = Ember.run.scheduleOnce('render', this, 'update');
						break;
				}

				return this;
			},

			update: function () {
				this.updateId = null;
				this.morph.html(this.render());
			},

			transitionTo: function(state) {
				this.state = state;
			}
		};

		var states = Ember.View.cloneStates(Ember.View.states), merge = Ember.merge;

		merge(states._default, {
			rerenderIfNeeded: Ember.K
		});

		merge(states.inDOM, {
			rerenderIfNeeded: function(view) {
				if (view.normalizedValue() !== view._lastNormalizedValue) {
					view.rerender();
				}
			}
		});

		/**
		 `Ember._HandlebarsBoundView` is a private view created by the Handlebars
		 `{{bind}}` helpers that is used to keep track of bound properties.

		 Every time a property is bound using a `{{mustache}}`, an anonymous subclass
		 of `Ember._HandlebarsBoundView` is created with the appropriate sub-template
		 and context set up. When the associated property changes, just the template
		 for this view will re-render.

		 @class _HandlebarsBoundView
		 @namespace Ember
		 @extends Ember._MetamorphView
		 @private
		 */
		Ember._HandlebarsBoundView = Ember._MetamorphView.extend({
			instrumentName: 'boundHandlebars',
			states: states,

			/**
			 The function used to determine if the `displayTemplate` or
			 `inverseTemplate` should be rendered. This should be a function that takes
			 a value and returns a Boolean.

			 @property shouldDisplayFunc
			 @type Function
			 @default null
			 */
			shouldDisplayFunc: null,

			/**
			 Whether the template rendered by this view gets passed the context object
			 of its parent template, or gets passed the value of retrieving `path`
			 from the `pathRoot`.

			 For example, this is true when using the `{{#if}}` helper, because the
			 template inside the helper should look up properties relative to the same
			 object as outside the block. This would be `false` when used with `{{#with
    foo}}` because the template should receive the object found by evaluating
			 `foo`.

			 @property preserveContext
			 @type Boolean
			 @default false
			 */
			preserveContext: false,

			/**
			 If `preserveContext` is true, this is the object that will be used
			 to render the template.

			 @property previousContext
			 @type Object
			 */
			previousContext: null,

			/**
			 The template to render when `shouldDisplayFunc` evaluates to `true`.

			 @property displayTemplate
			 @type Function
			 @default null
			 */
			displayTemplate: null,

			/**
			 The template to render when `shouldDisplayFunc` evaluates to `false`.

			 @property inverseTemplate
			 @type Function
			 @default null
			 */
			inverseTemplate: null,


			/**
			 The path to look up on `pathRoot` that is passed to
			 `shouldDisplayFunc` to determine which template to render.

			 In addition, if `preserveContext` is `false,` the object at this path will
			 be passed to the template when rendering.

			 @property path
			 @type String
			 @default null
			 */
			path: null,

			/**
			 The object from which the `path` will be looked up. Sometimes this is the
			 same as the `previousContext`, but in cases where this view has been
			 generated for paths that start with a keyword such as `view` or
			 `controller`, the path root will be that resolved object.

			 @property pathRoot
			 @type Object
			 */
			pathRoot: null,

			normalizedValue: function() {
				var path = get(this, 'path'),
					pathRoot  = get(this, 'pathRoot'),
					valueNormalizer = get(this, 'valueNormalizerFunc'),
					result, templateData;

				// Use the pathRoot as the result if no path is provided. This
				// happens if the path is `this`, which gets normalized into
				// a `pathRoot` of the current Handlebars context and a path
				// of `''`.
				if (path === '') {
					result = pathRoot;
				} else {
					templateData = get(this, 'templateData');
					result = handlebarsGet(pathRoot, path, { data: templateData });
				}

				return valueNormalizer ? valueNormalizer(result) : result;
			},

			rerenderIfNeeded: function() {
				this.currentState.rerenderIfNeeded(this);
			},

			/**
			 Determines which template to invoke, sets up the correct state based on
			 that logic, then invokes the default `Ember.View` `render` implementation.

			 This method will first look up the `path` key on `pathRoot`,
			 then pass that value to the `shouldDisplayFunc` function. If that returns
			 `true,` the `displayTemplate` function will be rendered to DOM. Otherwise,
			 `inverseTemplate`, if specified, will be rendered.

			 For example, if this `Ember._HandlebarsBoundView` represented the `{{#with
    foo}}` helper, it would look up the `foo` property of its context, and
			 `shouldDisplayFunc` would always return true. The object found by looking
			 up `foo` would be passed to `displayTemplate`.

			 @method render
			 @param {Ember.RenderBuffer} buffer
			 */
			render: function(buffer) {
				// If not invoked via a triple-mustache ({{{foo}}}), escape
				// the content of the template.
				var escape = get(this, 'isEscaped');

				var shouldDisplay = get(this, 'shouldDisplayFunc'),
					preserveContext = get(this, 'preserveContext'),
					context = get(this, 'previousContext');

				var inverseTemplate = get(this, 'inverseTemplate'),
					displayTemplate = get(this, 'displayTemplate');

				var result = this.normalizedValue();
				this._lastNormalizedValue = result;

				// First, test the conditional to see if we should
				// render the template or not.
				if (shouldDisplay(result)) {
					set(this, 'template', displayTemplate);

					// If we are preserving the context (for example, if this
					// is an #if block, call the template with the same object.
					if (preserveContext) {
						set(this, '_context', context);
					} else {
						// Otherwise, determine if this is a block bind or not.
						// If so, pass the specified object to the template
						if (displayTemplate) {
							set(this, '_context', result);
						} else {
							// This is not a bind block, just push the result of the
							// expression to the render context and return.
							if (result === null || result === undefined) {
								result = "";
							} else if (!(result instanceof Handlebars.SafeString)) {
								result = String(result);
							}

							if (escape) { result = Handlebars.Utils.escapeExpression(result); }
							buffer.push(result);
							return;
						}
					}
				} else if (inverseTemplate) {
					set(this, 'template', inverseTemplate);

					if (preserveContext) {
						set(this, '_context', context);
					} else {
						set(this, '_context', result);
					}
				} else {
					set(this, 'template', function() { return ''; });
				}

				return this._super(buffer);
			}
		});

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-handlebars
		 */

		var get = Ember.get, set = Ember.set, fmt = Ember.String.fmt;
		var handlebarsGet = Ember.Handlebars.get, normalizePath = Ember.Handlebars.normalizePath;
		var forEach = Ember.ArrayPolyfills.forEach;

		var EmberHandlebars = Ember.Handlebars, helpers = EmberHandlebars.helpers;

		function exists(value) {
			return !Ember.isNone(value);
		}

// Binds a property into the DOM. This will create a hook in DOM that the
// KVO system will look for and update if the property changes.
		function bind(property, options, preserveContext, shouldDisplay, valueNormalizer, childProperties) {
			var data = options.data,
				fn = options.fn,
				inverse = options.inverse,
				view = data.view,
				currentContext = this,
				normalized, observer, i;

			normalized = normalizePath(currentContext, property, data);

			// Set up observers for observable objects
			if ('object' === typeof this) {
				if (data.insideGroup) {
					observer = function() {
						Ember.run.once(view, 'rerender');
					};

					var template, context, result = handlebarsGet(currentContext, property, options);

					result = valueNormalizer ? valueNormalizer(result) : result;

					context = preserveContext ? currentContext : result;
					if (shouldDisplay(result)) {
						template = fn;
					} else if (inverse) {
						template = inverse;
					}

					template(context, { data: options.data });
				} else {
					// Create the view that will wrap the output of this template/property
					// and add it to the nearest view's childViews array.
					// See the documentation of Ember._HandlebarsBoundView for more.
					var bindView = view.createChildView(Ember._HandlebarsBoundView, {
						preserveContext: preserveContext,
						shouldDisplayFunc: shouldDisplay,
						valueNormalizerFunc: valueNormalizer,
						displayTemplate: fn,
						inverseTemplate: inverse,
						path: property,
						pathRoot: currentContext,
						previousContext: currentContext,
						isEscaped: !options.hash.unescaped,
						templateData: options.data
					});

					view.appendChild(bindView);

					observer = function() {
						Ember.run.scheduleOnce('render', bindView, 'rerenderIfNeeded');
					};
				}

				// Observes the given property on the context and
				// tells the Ember._HandlebarsBoundView to re-render. If property
				// is an empty string, we are printing the current context
				// object ({{this}}) so updating it is not our responsibility.
				if (normalized.path !== '') {
					view.registerObserver(normalized.root, normalized.path, observer);
					if (childProperties) {
						for (i=0; i<childProperties.length; i++) {
							view.registerObserver(normalized.root, normalized.path+'.'+childProperties[i], observer);
						}
					}
				}
			} else {
				// The object is not observable, so just render it out and
				// be done with it.
				data.buffer.push(handlebarsGet(currentContext, property, options));
			}
		}

		function simpleBind(property, options) {
			var data = options.data,
				view = data.view,
				currentContext = this,
				normalized, observer;

			normalized = normalizePath(currentContext, property, data);

			// Set up observers for observable objects
			if ('object' === typeof this) {
				if (data.insideGroup) {
					observer = function() {
						Ember.run.once(view, 'rerender');
					};

					var result = handlebarsGet(currentContext, property, options);
					if (result === null || result === undefined) { result = ""; }
					data.buffer.push(result);
				} else {
					var bindView = new Ember._SimpleHandlebarsView(
						property, currentContext, !options.hash.unescaped, options.data
					);

					bindView._parentView = view;
					view.appendChild(bindView);

					observer = function() {
						Ember.run.scheduleOnce('render', bindView, 'rerender');
					};
				}

				// Observes the given property on the context and
				// tells the Ember._HandlebarsBoundView to re-render. If property
				// is an empty string, we are printing the current context
				// object ({{this}}) so updating it is not our responsibility.
				if (normalized.path !== '') {
					view.registerObserver(normalized.root, normalized.path, observer);
				}
			} else {
				// The object is not observable, so just render it out and
				// be done with it.
				data.buffer.push(handlebarsGet(currentContext, property, options));
			}
		}

		/**
		 @private

		 '_triageMustache' is used internally select between a binding and helper for
		 the given context. Until this point, it would be hard to determine if the
		 mustache is a property reference or a regular helper reference. This triage
		 helper resolves that.

		 This would not be typically invoked by directly.

		 @method _triageMustache
		 @for Ember.Handlebars.helpers
		 @param {String} property Property/helperID to triage
		 @param {Function} fn Context to provide for rendering
		 @return {String} HTML string
		 */
		EmberHandlebars.registerHelper('_triageMustache', function(property, fn) {

			if (helpers[property]) {
				return helpers[property].call(this, fn);
			}
			else {
				return helpers.bind.apply(this, arguments);
			}
		});

		/**
		 @private

		 `bind` can be used to display a value, then update that value if it
		 changes. For example, if you wanted to print the `title` property of
		 `content`:

		 ```handlebars
		 {{bind "content.title"}}
		 ```

		 This will return the `title` property as a string, then create a new observer
		 at the specified path. If it changes, it will update the value in DOM. Note
		 that if you need to support IE7 and IE8 you must modify the model objects
		 properties using `Ember.get()` and `Ember.set()` for this to work as it
		 relies on Ember's KVO system. For all other browsers this will be handled for
		 you automatically.

		 @method bind
		 @for Ember.Handlebars.helpers
		 @param {String} property Property to bind
		 @param {Function} fn Context to provide for rendering
		 @return {String} HTML string
		 */
		EmberHandlebars.registerHelper('bind', function(property, options) {


			var context = (options.contexts && options.contexts[0]) || this;

			if (!options.fn) {
				return simpleBind.call(context, property, options);
			}

			return bind.call(context, property, options, false, exists);
		});

		/**
		 @private

		 Use the `boundIf` helper to create a conditional that re-evaluates
		 whenever the truthiness of the bound value changes.

		 ```handlebars
		 {{#boundIf "content.shouldDisplayTitle"}}
		 {{content.title}}
		 {{/boundIf}}
		 ```

		 @method boundIf
		 @for Ember.Handlebars.helpers
		 @param {String} property Property to bind
		 @param {Function} fn Context to provide for rendering
		 @return {String} HTML string
		 */
		EmberHandlebars.registerHelper('boundIf', function(property, fn) {
			var context = (fn.contexts && fn.contexts[0]) || this;
			var func = function(result) {
				var truthy = result && get(result, 'isTruthy');
				if (typeof truthy === 'boolean') { return truthy; }

				if (Ember.isArray(result)) {
					return get(result, 'length') !== 0;
				} else {
					return !!result;
				}
			};

			return bind.call(context, property, fn, true, func, func, ['isTruthy', 'length']);
		});

		/**
		 @method with
		 @for Ember.Handlebars.helpers
		 @param {Function} context
		 @param {Hash} options
		 @return {String} HTML string
		 */
		EmberHandlebars.registerHelper('with', function(context, options) {
			if (arguments.length === 4) {
				var keywordName, path, rootPath, normalized;

				options = arguments[3];
				keywordName = arguments[2];
				path = arguments[0];


				if (Ember.isGlobalPath(path)) {
					Ember.bind(options.data.keywords, keywordName, path);
				} else {
					normalized = normalizePath(this, path, options.data);
					path = normalized.path;
					rootPath = normalized.root;

					// This is a workaround for the fact that you cannot bind separate objects
					// together. When we implement that functionality, we should use it here.
					var contextKey = Ember.$.expando + Ember.guidFor(rootPath);
					options.data.keywords[contextKey] = rootPath;

					// if the path is '' ("this"), just bind directly to the current context
					var contextPath = path ? contextKey + '.' + path : contextKey;
					Ember.bind(options.data.keywords, keywordName, contextPath);
				}

				return bind.call(this, path, options, true, exists);
			} else {


				return helpers.bind.call(options.contexts[0], context, options);
			}
		});


		/**
		 See [boundIf](/api/classes/Ember.Handlebars.helpers.html#method_boundIf)

		 @method if
		 @for Ember.Handlebars.helpers
		 @param {Function} context
		 @param {Hash} options
		 @return {String} HTML string
		 */
		EmberHandlebars.registerHelper('if', function(context, options) {



			return helpers.boundIf.call(options.contexts[0], context, options);
		});

		/**
		 @method unless
		 @for Ember.Handlebars.helpers
		 @param {Function} context
		 @param {Hash} options
		 @return {String} HTML string
		 */
		EmberHandlebars.registerHelper('unless', function(context, options) {



			var fn = options.fn, inverse = options.inverse;

			options.fn = inverse;
			options.inverse = fn;

			return helpers.boundIf.call(options.contexts[0], context, options);
		});

		/**
		 `bind-attr` allows you to create a binding between DOM element attributes and
		 Ember objects. For example:

		 ```handlebars
		 <img {{bind-attr src="imageUrl" alt="imageTitle"}}>
		 ```

		 The above handlebars template will fill the `<img>`'s `src` attribute will
		 the value of the property referenced with `"imageUrl"` and its `alt`
		 attribute with the value of the property referenced with `"imageTitle"`.

		 If the rendering context of this template is the following object:

		 ```javascript
		 {
    imageUrl: 'http://lolcats.info/haz-a-funny',
    imageTitle: 'A humorous image of a cat'
  }
		 ```

		 The resulting HTML output will be:

		 ```html
		 <img src="http://lolcats.info/haz-a-funny" alt="A humorous image of a cat">
		 ```

		 `bind-attr` cannot redeclare existing DOM element attributes. The use of `src`
		 in the following `bind-attr` example will be ignored and the hard coded value
		 of `src="/failwhale.gif"` will take precedence:

		 ```handlebars
		 <img src="/failwhale.gif" {{bind-attr src="imageUrl" alt="imageTitle"}}>
		 ```

		 ### `bind-attr` and the `class` attribute

		 `bind-attr` supports a special syntax for handling a number of cases unique
		 to the `class` DOM element attribute. The `class` attribute combines
		 multiple discreet values into a single attribute as a space-delimited
		 list of strings. Each string can be:

		 * a string return value of an object's property.
		 * a boolean return value of an object's property
		 * a hard-coded value

		 A string return value works identically to other uses of `bind-attr`. The
		 return value of the property will become the value of the attribute. For
		 example, the following view and template:

		 ```javascript
		 AView = Ember.View.extend({
      someProperty: function() {
        return "aValue";
      }.property()
    })
		 ```

		 ```handlebars
		 <img {{bind-attr class="view.someProperty}}>
		 ```

		 Result in the following rendered output:

		 ```html
		 <img class="aValue">
		 ```

		 A boolean return value will insert a specified class name if the property
		 returns `true` and remove the class name if the property returns `false`.

		 A class name is provided via the syntax
		 `somePropertyName:class-name-if-true`.

		 ```javascript
		 AView = Ember.View.extend({
    someBool: true
  })
		 ```

		 ```handlebars
		 <img {{bind-attr class="view.someBool:class-name-if-true"}}>
		 ```

		 Result in the following rendered output:

		 ```html
		 <img class="class-name-if-true">
		 ```

		 An additional section of the binding can be provided if you want to
		 replace the existing class instead of removing it when the boolean
		 value changes:

		 ```handlebars
		 <img {{bind-attr class="view.someBool:class-name-if-true:class-name-if-false"}}>
		 ```

		 A hard-coded value can be used by prepending `:` to the desired
		 class name: `:class-name-to-always-apply`.

		 ```handlebars
		 <img {{bind-attr class=":class-name-to-always-apply"}}>
		 ```

		 Results in the following rendered output:

		 ```html
		 <img class="class-name-to-always-apply">
		 ```

		 All three strategies - string return value, boolean return value, and
		 hard-coded value – can be combined in a single declaration:

		 ```handlebars
		 <img {{bind-attr class=":class-name-to-always-apply view.someBool:class-name-if-true view.someProperty"}}>
		 ```

		 @method bind-attr
		 @for Ember.Handlebars.helpers
		 @param {Hash} options
		 @return {String} HTML string
		 */
		EmberHandlebars.registerHelper('bind-attr', function(options) {

			var attrs = options.hash;


			var view = options.data.view;
			var ret = [];
			var ctx = this;

			// Generate a unique id for this element. This will be added as a
			// data attribute to the element so it can be looked up when
			// the bound property changes.
			var dataId = ++Ember.uuid;

			// Handle classes differently, as we can bind multiple classes
			var classBindings = attrs['class'];
			if (classBindings != null) {
				var classResults = EmberHandlebars.bindClasses(this, classBindings, view, dataId, options);

				ret.push('class="' + Handlebars.Utils.escapeExpression(classResults.join(' ')) + '"');
				delete attrs['class'];
			}

			var attrKeys = Ember.keys(attrs);

			// For each attribute passed, create an observer and emit the
			// current value of the property as an attribute.
			forEach.call(attrKeys, function(attr) {
				var path = attrs[attr],
					normalized;


				normalized = normalizePath(ctx, path, options.data);

				var value = (path === 'this') ? normalized.root : handlebarsGet(ctx, path, options),
					type = Ember.typeOf(value);


				var observer, invoker;

				observer = function observer() {
					var result = handlebarsGet(ctx, path, options);


					var elem = view.$("[data-bindattr-" + dataId + "='" + dataId + "']");

					// If we aren't able to find the element, it means the element
					// to which we were bound has been removed from the view.
					// In that case, we can assume the template has been re-rendered
					// and we need to clean up the observer.
					if (!elem || elem.length === 0) {
						Ember.removeObserver(normalized.root, normalized.path, invoker);
						return;
					}

					Ember.View.applyAttributeBindings(elem, attr, result);
				};

				// Add an observer to the view for when the property changes.
				// When the observer fires, find the element using the
				// unique data id and update the attribute to the new value.
				// Note: don't add observer when path is 'this' or path
				// is whole keyword e.g. {{#each x in list}} ... {{bind-attr attr="x"}}
				if (path !== 'this' && !(normalized.isKeyword && normalized.path === '' )) {
					view.registerObserver(normalized.root, normalized.path, observer);
				}

				// if this changes, also change the logic in ember-views/lib/views/view.js
				if ((type === 'string' || (type === 'number' && !isNaN(value)))) {
					ret.push(attr + '="' + Handlebars.Utils.escapeExpression(value) + '"');
				} else if (value && type === 'boolean') {
					// The developer controls the attr name, so it should always be safe
					ret.push(attr + '="' + attr + '"');
				}
			}, this);

			// Add the unique identifier
			// NOTE: We use all lower-case since Firefox has problems with mixed case in SVG
			ret.push('data-bindattr-' + dataId + '="' + dataId + '"');
			return new EmberHandlebars.SafeString(ret.join(' '));
		});

		/**
		 See `bind-attr`

		 @method bindAttr
		 @for Ember.Handlebars.helpers
		 @deprecated
		 @param {Function} context
		 @param {Hash} options
		 @return {String} HTML string
		 */
		EmberHandlebars.registerHelper('bindAttr', EmberHandlebars.helpers['bind-attr']);

		/**
		 @private

		 Helper that, given a space-separated string of property paths and a context,
		 returns an array of class names. Calling this method also has the side
		 effect of setting up observers at those property paths, such that if they
		 change, the correct class name will be reapplied to the DOM element.

		 For example, if you pass the string "fooBar", it will first look up the
		 "fooBar" value of the context. If that value is true, it will add the
		 "foo-bar" class to the current element (i.e., the dasherized form of
		 "fooBar"). If the value is a string, it will add that string as the class.
		 Otherwise, it will not add any new class name.

		 @method bindClasses
		 @for Ember.Handlebars
		 @param {Ember.Object} context The context from which to lookup properties
		 @param {String} classBindings A string, space-separated, of class bindings
		 to use
		 @param {Ember.View} view The view in which observers should look for the
		 element to update
		 @param {Srting} bindAttrId Optional bindAttr id used to lookup elements
		 @return {Array} An array of class names to add
		 */
		EmberHandlebars.bindClasses = function(context, classBindings, view, bindAttrId, options) {
			var ret = [], newClass, value, elem;

			// Helper method to retrieve the property from the context and
			// determine which class string to return, based on whether it is
			// a Boolean or not.
			var classStringForPath = function(root, parsedPath, options) {
				var val,
					path = parsedPath.path;

				if (path === 'this') {
					val = root;
				} else if (path === '') {
					val = true;
				} else {
					val = handlebarsGet(root, path, options);
				}

				return Ember.View._classStringForValue(path, val, parsedPath.className, parsedPath.falsyClassName);
			};

			// For each property passed, loop through and setup
			// an observer.
			forEach.call(classBindings.split(' '), function(binding) {

				// Variable in which the old class value is saved. The observer function
				// closes over this variable, so it knows which string to remove when
				// the property changes.
				var oldClass;

				var observer, invoker;

				var parsedPath = Ember.View._parsePropertyPath(binding),
					path = parsedPath.path,
					pathRoot = context,
					normalized;

				if (path !== '' && path !== 'this') {
					normalized = normalizePath(context, path, options.data);

					pathRoot = normalized.root;
					path = normalized.path;
				}

				// Set up an observer on the context. If the property changes, toggle the
				// class name.
				observer = function() {
					// Get the current value of the property
					newClass = classStringForPath(context, parsedPath, options);
					elem = bindAttrId ? view.$("[data-bindattr-" + bindAttrId + "='" + bindAttrId + "']") : view.$();

					// If we can't find the element anymore, a parent template has been
					// re-rendered and we've been nuked. Remove the observer.
					if (!elem || elem.length === 0) {
						Ember.removeObserver(pathRoot, path, invoker);
					} else {
						// If we had previously added a class to the element, remove it.
						if (oldClass) {
							elem.removeClass(oldClass);
						}

						// If necessary, add a new class. Make sure we keep track of it so
						// it can be removed in the future.
						if (newClass) {
							elem.addClass(newClass);
							oldClass = newClass;
						} else {
							oldClass = null;
						}
					}
				};

				if (path !== '' && path !== 'this') {
					view.registerObserver(pathRoot, path, observer);
				}

				// We've already setup the observer; now we just need to figure out the
				// correct behavior right now on the first pass through.
				value = classStringForPath(context, parsedPath, options);

				if (value) {
					ret.push(value);

					// Make sure we save the current value so that it can be removed if the
					// observer fires.
					oldClass = value;
				}
			});

			return ret;
		};


	})();



	(function() {
		/*globals Handlebars */

// TODO: Don't require the entire module
		/**
		 @module ember
		 @submodule ember-handlebars
		 */

		var get = Ember.get, set = Ember.set;
		var EmberHandlebars = Ember.Handlebars;
		var LOWERCASE_A_Z = /^[a-z]/;
		var VIEW_PREFIX = /^view\./;

		EmberHandlebars.ViewHelper = Ember.Object.create({

			propertiesFromHTMLOptions: function(options, thisContext) {
				var hash = options.hash, data = options.data;
				var extensions = {},
					classes = hash['class'],
					dup = false;

				if (hash.id) {
					extensions.elementId = hash.id;
					dup = true;
				}

				if (hash.tag) {
					extensions.tagName = hash.tag;
					dup = true;
				}

				if (classes) {
					classes = classes.split(' ');
					extensions.classNames = classes;
					dup = true;
				}

				if (hash.classBinding) {
					extensions.classNameBindings = hash.classBinding.split(' ');
					dup = true;
				}

				if (hash.classNameBindings) {
					if (extensions.classNameBindings === undefined) extensions.classNameBindings = [];
					extensions.classNameBindings = extensions.classNameBindings.concat(hash.classNameBindings.split(' '));
					dup = true;
				}

				if (hash.attributeBindings) {

					extensions.attributeBindings = null;
					dup = true;
				}

				if (dup) {
					hash = Ember.$.extend({}, hash);
					delete hash.id;
					delete hash.tag;
					delete hash['class'];
					delete hash.classBinding;
				}

				// Set the proper context for all bindings passed to the helper. This applies to regular attribute bindings
				// as well as class name bindings. If the bindings are local, make them relative to the current context
				// instead of the view.
				var path;

				// Evaluate the context of regular attribute bindings:
				for (var prop in hash) {
					if (!hash.hasOwnProperty(prop)) { continue; }

					// Test if the property ends in "Binding"
					if (Ember.IS_BINDING.test(prop) && typeof hash[prop] === 'string') {
						path = this.contextualizeBindingPath(hash[prop], data);
						if (path) { hash[prop] = path; }
					}
				}

				// Evaluate the context of class name bindings:
				if (extensions.classNameBindings) {
					for (var b in extensions.classNameBindings) {
						var full = extensions.classNameBindings[b];
						if (typeof full === 'string') {
							// Contextualize the path of classNameBinding so this:
							//
							//     classNameBinding="isGreen:green"
							//
							// is converted to this:
							//
							//     classNameBinding="_parentView.context.isGreen:green"
							var parsedPath = Ember.View._parsePropertyPath(full);
							path = this.contextualizeBindingPath(parsedPath.path, data);
							if (path) { extensions.classNameBindings[b] = path + parsedPath.classNames; }
						}
					}
				}

				return Ember.$.extend(hash, extensions);
			},

			// Transform bindings from the current context to a context that can be evaluated within the view.
			// Returns null if the path shouldn't be changed.
			//
			// TODO: consider the addition of a prefix that would allow this method to return `path`.
			contextualizeBindingPath: function(path, data) {
				var normalized = Ember.Handlebars.normalizePath(null, path, data);
				if (normalized.isKeyword) {
					return 'templateData.keywords.' + path;
				} else if (Ember.isGlobalPath(path)) {
					return null;
				} else if (path === 'this') {
					return '_parentView.context';
				} else {
					return '_parentView.context.' + path;
				}
			},

			helper: function(thisContext, path, options) {
				var data = options.data,
					fn = options.fn,
					newView;

				if ('string' === typeof path) {

					// TODO: this is a lame conditional, this should likely change
					// but something along these lines will likely need to be added
					// as deprecation warnings
					//
					if (options.types[0] === 'STRING' && LOWERCASE_A_Z.test(path) && !VIEW_PREFIX.test(path)) {

						newView = data.view.container.lookupFactory('view:' + path);
					} else {
						newView = EmberHandlebars.get(thisContext, path, options);
					}

				} else {
					newView = path;
				}


				var viewOptions = this.propertiesFromHTMLOptions(options, thisContext);
				var currentView = data.view;
				viewOptions.templateData = data;
				var newViewProto = newView.proto ? newView.proto() : newView;

				if (fn) {

					viewOptions.template = fn;
				}

				// We only want to override the `_context` computed property if there is
				// no specified controller. See View#_context for more information.
				if (!newViewProto.controller && !newViewProto.controllerBinding && !viewOptions.controller && !viewOptions.controllerBinding) {
					viewOptions._context = thisContext;
				}

				currentView.appendChild(newView, viewOptions);
			}
		});

		/**
		 `{{view}}` inserts a new instance of `Ember.View` into a template passing its
		 options to the `Ember.View`'s `create` method and using the supplied block as
		 the view's own template.

		 An empty `<body>` and the following template:

		 ```handlebars
		 A span:
		 {{#view tagName="span"}}
		 hello.
		 {{/view}}
		 ```

		 Will result in HTML structure:

		 ```html
		 <body>
		 <!-- Note: the handlebars template script
		 also results in a rendered Ember.View
		 which is the outer <div> here -->

		 <div class="ember-view">
		 A span:
		 <span id="ember1" class="ember-view">
		 Hello.
		 </span>
		 </div>
		 </body>
		 ```

		 ### `parentView` setting

		 The `parentView` property of the new `Ember.View` instance created through
		 `{{view}}` will be set to the `Ember.View` instance of the template where
		 `{{view}}` was called.

		 ```javascript
		 aView = Ember.View.create({
    template: Ember.Handlebars.compile("{{#view}} my parent: {{parentView.elementId}} {{/view}}")
  });

		 aView.appendTo('body');
		 ```

		 Will result in HTML structure:

		 ```html
		 <div id="ember1" class="ember-view">
		 <div id="ember2" class="ember-view">
		 my parent: ember1
		 </div>
		 </div>
		 ```

		 ### Setting CSS id and class attributes

		 The HTML `id` attribute can be set on the `{{view}}`'s resulting element with
		 the `id` option. This option will _not_ be passed to `Ember.View.create`.

		 ```handlebars
		 {{#view tagName="span" id="a-custom-id"}}
		 hello.
		 {{/view}}
		 ```

		 Results in the following HTML structure:

		 ```html
		 <div class="ember-view">
		 <span id="a-custom-id" class="ember-view">
		 hello.
		 </span>
		 </div>
		 ```

		 The HTML `class` attribute can be set on the `{{view}}`'s resulting element
		 with the `class` or `classNameBindings` options. The `class` option will
		 directly set the CSS `class` attribute and will not be passed to
		 `Ember.View.create`. `classNameBindings` will be passed to `create` and use
		 `Ember.View`'s class name binding functionality:

		 ```handlebars
		 {{#view tagName="span" class="a-custom-class"}}
		 hello.
		 {{/view}}
		 ```

		 Results in the following HTML structure:

		 ```html
		 <div class="ember-view">
		 <span id="ember2" class="ember-view a-custom-class">
		 hello.
		 </span>
		 </div>
		 ```

		 ### Supplying a different view class

		 `{{view}}` can take an optional first argument before its supplied options to
		 specify a path to a custom view class.

		 ```handlebars
		 {{#view "MyApp.CustomView"}}
		 hello.
		 {{/view}}
		 ```

		 The first argument can also be a relative path accessible from the current
		 context.

		 ```javascript
		 MyApp = Ember.Application.create({});
		 MyApp.OuterView = Ember.View.extend({
    innerViewClass: Ember.View.extend({
      classNames: ['a-custom-view-class-as-property']
    }),
    template: Ember.Handlebars.compile('{{#view "view.innerViewClass"}} hi {{/view}}')
  });

		 MyApp.OuterView.create().appendTo('body');
		 ```

		 Will result in the following HTML:

		 ```html
		 <div id="ember1" class="ember-view">
		 <div id="ember2" class="ember-view a-custom-view-class-as-property">
		 hi
		 </div>
		 </div>
		 ```

		 ### Blockless use

		 If you supply a custom `Ember.View` subclass that specifies its own template
		 or provide a `templateName` option to `{{view}}` it can be used without
		 supplying a block. Attempts to use both a `templateName` option and supply a
		 block will throw an error.

		 ```handlebars
		 {{view "MyApp.ViewWithATemplateDefined"}}
		 ```

		 ### `viewName` property

		 You can supply a `viewName` option to `{{view}}`. The `Ember.View` instance
		 will be referenced as a property of its parent view by this name.

		 ```javascript
		 aView = Ember.View.create({
    template: Ember.Handlebars.compile('{{#view viewName="aChildByName"}} hi {{/view}}')
  });

		 aView.appendTo('body');
		 aView.get('aChildByName') // the instance of Ember.View created by {{view}} helper
		 ```

		 @method view
		 @for Ember.Handlebars.helpers
		 @param {String} path
		 @param {Hash} options
		 @return {String} HTML string
		 */
		EmberHandlebars.registerHelper('view', function(path, options) {


			// If no path is provided, treat path param as options.
			if (path && path.data && path.data.isRenderData) {
				options = path;
				path = "Ember.View";
			}

			return EmberHandlebars.ViewHelper.helper(this, path, options);
		});


	})();



	(function() {
		/*globals Handlebars */

// TODO: Don't require all of this module
		/**
		 @module ember
		 @submodule ember-handlebars
		 */

		var get = Ember.get, handlebarsGet = Ember.Handlebars.get, fmt = Ember.String.fmt;

		/**
		 `{{collection}}` is a `Ember.Handlebars` helper for adding instances of
		 `Ember.CollectionView` to a template. See [Ember.CollectionView](/api/classes/Ember.CollectionView.html)
		 for additional information on how a `CollectionView` functions.

		 `{{collection}}`'s primary use is as a block helper with a `contentBinding`
		 option pointing towards an `Ember.Array`-compatible object. An `Ember.View`
		 instance will be created for each item in its `content` property. Each view
		 will have its own `content` property set to the appropriate item in the
		 collection.

		 The provided block will be applied as the template for each item's view.

		 Given an empty `<body>` the following template:

		 ```handlebars
		 {{#collection contentBinding="App.items"}}
		 Hi {{view.content.name}}
		 {{/collection}}
		 ```

		 And the following application code

		 ```javascript
		 App = Ember.Application.create()
		 App.items = [
		 Ember.Object.create({name: 'Dave'}),
		 Ember.Object.create({name: 'Mary'}),
		 Ember.Object.create({name: 'Sara'})
		 ]
		 ```

		 Will result in the HTML structure below

		 ```html
		 <div class="ember-view">
		 <div class="ember-view">Hi Dave</div>
		 <div class="ember-view">Hi Mary</div>
		 <div class="ember-view">Hi Sara</div>
		 </div>
		 ```

		 ### Blockless Use

		 If you provide an `itemViewClass` option that has its own `template` you can
		 omit the block.

		 The following template:

		 ```handlebars
		 {{collection contentBinding="App.items" itemViewClass="App.AnItemView"}}
		 ```

		 And application code

		 ```javascript
		 App = Ember.Application.create();
		 App.items = [
		 Ember.Object.create({name: 'Dave'}),
		 Ember.Object.create({name: 'Mary'}),
		 Ember.Object.create({name: 'Sara'})
		 ];

		 App.AnItemView = Ember.View.extend({
    template: Ember.Handlebars.compile("Greetings {{view.content.name}}")
  });
		 ```

		 Will result in the HTML structure below

		 ```html
		 <div class="ember-view">
		 <div class="ember-view">Greetings Dave</div>
		 <div class="ember-view">Greetings Mary</div>
		 <div class="ember-view">Greetings Sara</div>
		 </div>
		 ```

		 ### Specifying a CollectionView subclass

		 By default the `{{collection}}` helper will create an instance of
		 `Ember.CollectionView`. You can supply a `Ember.CollectionView` subclass to
		 the helper by passing it as the first argument:

		 ```handlebars
		 {{#collection App.MyCustomCollectionClass contentBinding="App.items"}}
		 Hi {{view.content.name}}
		 {{/collection}}
		 ```

		 ### Forwarded `item.*`-named Options

		 As with the `{{view}}`, helper options passed to the `{{collection}}` will be
		 set on the resulting `Ember.CollectionView` as properties. Additionally,
		 options prefixed with `item` will be applied to the views rendered for each
		 item (note the camelcasing):

		 ```handlebars
		 {{#collection contentBinding="App.items"
                itemTagName="p"
                itemClassNames="greeting"}}
		 Howdy {{view.content.name}}
		 {{/collection}}
		 ```

		 Will result in the following HTML structure:

		 ```html
		 <div class="ember-view">
		 <p class="ember-view greeting">Howdy Dave</p>
		 <p class="ember-view greeting">Howdy Mary</p>
		 <p class="ember-view greeting">Howdy Sara</p>
		 </div>
		 ```

		 @method collection
		 @for Ember.Handlebars.helpers
		 @param {String} path
		 @param {Hash} options
		 @return {String} HTML string
		 @deprecated Use `{{each}}` helper instead.
		 */
		Ember.Handlebars.registerHelper('collection', function(path, options) {


			// If no path is provided, treat path param as options.
			if (path && path.data && path.data.isRenderData) {
				options = path;
				path = undefined;

			} else {

			}

			var fn = options.fn;
			var data = options.data;
			var inverse = options.inverse;
			var view = options.data.view;

			// If passed a path string, convert that into an object.
			// Otherwise, just default to the standard class.
			var collectionClass;
			collectionClass = path ? handlebarsGet(this, path, options) : Ember.CollectionView;


			var hash = options.hash, itemHash = {}, match;

			// Extract item view class if provided else default to the standard class
			var collectionPrototype = collectionClass.proto(),
				itemViewClass;

			if (hash.itemView) {
				var controller = data.keywords.controller;

				var container = controller.container;
				itemViewClass = container.resolve('view:' + Ember.String.camelize(hash.itemView));

			} else if (hash.itemViewClass) {
				itemViewClass = handlebarsGet(collectionPrototype, hash.itemViewClass, options);
			} else {
				itemViewClass = collectionPrototype.itemViewClass;
			}


			delete hash.itemViewClass;
			delete hash.itemView;

			// Go through options passed to the {{collection}} helper and extract options
			// that configure item views instead of the collection itself.
			for (var prop in hash) {
				if (hash.hasOwnProperty(prop)) {
					match = prop.match(/^item(.)(.*)$/);

					if (match && prop !== 'itemController') {
						// Convert itemShouldFoo -> shouldFoo
						itemHash[match[1].toLowerCase() + match[2]] = hash[prop];
						// Delete from hash as this will end up getting passed to the
						// {{view}} helper method.
						delete hash[prop];
					}
				}
			}

			if (fn) {
				itemHash.template = fn;
				delete options.fn;
			}

			var emptyViewClass;
			if (inverse && inverse !== Handlebars.VM.noop) {
				emptyViewClass = get(collectionPrototype, 'emptyViewClass');
				emptyViewClass = emptyViewClass.extend({
					template: inverse,
					tagName: itemHash.tagName
				});
			} else if (hash.emptyViewClass) {
				emptyViewClass = handlebarsGet(this, hash.emptyViewClass, options);
			}
			if (emptyViewClass) { hash.emptyView = emptyViewClass; }

			if (!hash.keyword) {
				itemHash._context = Ember.computed.alias('content');
			}

			var viewOptions = Ember.Handlebars.ViewHelper.propertiesFromHTMLOptions({ data: data, hash: itemHash }, this);
			hash.itemViewClass = itemViewClass.extend(viewOptions);

			return Ember.Handlebars.helpers.view.call(this, collectionClass, options);
		});


	})();



	(function() {
		/*globals Handlebars */
		/**
		 @module ember
		 @submodule ember-handlebars
		 */

		var handlebarsGet = Ember.Handlebars.get;

		/**
		 `unbound` allows you to output a property without binding. *Important:* The
		 output will not be updated if the property changes. Use with caution.

		 ```handlebars
		 <div>{{unbound somePropertyThatDoesntChange}}</div>
		 ```

		 `unbound` can also be used in conjunction with a bound helper to
		 render it in its unbound form:

		 ```handlebars
		 <div>{{unbound helperName somePropertyThatDoesntChange}}</div>
		 ```

		 @method unbound
		 @for Ember.Handlebars.helpers
		 @param {String} property
		 @return {String} HTML string
		 */
		Ember.Handlebars.registerHelper('unbound', function(property, fn) {
			var options = arguments[arguments.length - 1], helper, context, out;

			if (arguments.length > 2) {
				// Unbound helper call.
				options.data.isUnbound = true;
				helper = Ember.Handlebars.helpers[arguments[0]] || Ember.Handlebars.helperMissing;
				out = helper.apply(this, Array.prototype.slice.call(arguments, 1));
				delete options.data.isUnbound;
				return out;
			}

			context = (fn.contexts && fn.contexts[0]) || this;
			return handlebarsGet(context, property, fn);
		});

	})();



	(function() {
		/*jshint debug:true*/
		/**
		 @module ember
		 @submodule ember-handlebars
		 */

		var handlebarsGet = Ember.Handlebars.get, normalizePath = Ember.Handlebars.normalizePath;

		/**
		 `log` allows you to output the value of a variable in the current rendering
		 context.

		 ```handlebars
		 {{log myVariable}}
		 ```

		 @method log
		 @for Ember.Handlebars.helpers
		 @param {String} property
		 */
		Ember.Handlebars.registerHelper('log', function(property, options) {
			var context = (options.contexts && options.contexts[0]) || this,
				normalized = normalizePath(context, property, options.data),
				pathRoot = normalized.root,
				path = normalized.path,
				value = (path === 'this') ? pathRoot : handlebarsGet(pathRoot, path, options);
			Ember.Logger.log(value);
		});

		/**
		 Execute the `debugger` statement in the current context.

		 ```handlebars
		 {{debugger}}
		 ```

		 @method debugger
		 @for Ember.Handlebars.helpers
		 @param {String} property
		 */
		Ember.Handlebars.registerHelper('debugger', function(options) {
			debugger;
		});

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-handlebars
		 */

		var get = Ember.get, set = Ember.set;

		Ember.Handlebars.EachView = Ember.CollectionView.extend(Ember._Metamorph, {
			init: function() {
				var itemController = get(this, 'itemController');
				var binding;

				if (itemController) {
					var controller = get(this, 'controller.container').lookupFactory('controller:array').create({
						parentController: get(this, 'controller'),
						itemController: itemController,
						target: get(this, 'controller'),
						_eachView: this
					});

					this.disableContentObservers(function() {
						set(this, 'content', controller);
						binding = new Ember.Binding('content', '_eachView.dataSource').oneWay();
						binding.connect(controller);
					});

					set(this, '_arrayController', controller);
				} else {
					this.disableContentObservers(function() {
						binding = new Ember.Binding('content', 'dataSource').oneWay();
						binding.connect(this);
					});
				}

				return this._super();
			},

			_assertArrayLike: function(content) {


			},

			disableContentObservers: function(callback) {
				Ember.removeBeforeObserver(this, 'content', null, '_contentWillChange');
				Ember.removeObserver(this, 'content', null, '_contentDidChange');

				callback.call(this);

				Ember.addBeforeObserver(this, 'content', null, '_contentWillChange');
				Ember.addObserver(this, 'content', null, '_contentDidChange');
			},

			itemViewClass: Ember._MetamorphView,
			emptyViewClass: Ember._MetamorphView,

			createChildView: function(view, attrs) {
				view = this._super(view, attrs);

				// At the moment, if a container view subclass wants
				// to insert keywords, it is responsible for cloning
				// the keywords hash. This will be fixed momentarily.
				var keyword = get(this, 'keyword');
				var content = get(view, 'content');

				if (keyword) {
					var data = get(view, 'templateData');

					data = Ember.copy(data);
					data.keywords = view.cloneKeywords();
					set(view, 'templateData', data);

					// In this case, we do not bind, because the `content` of
					// a #each item cannot change.
					data.keywords[keyword] = content;
				}

				// If {{#each}} is looping over an array of controllers,
				// point each child view at their respective controller.
				if (content && get(content, 'isController')) {
					set(view, 'controller', content);
				}

				return view;
			},

			destroy: function() {
				if (!this._super()) { return; }

				var arrayController = get(this, '_arrayController');

				if (arrayController) {
					arrayController.destroy();
				}

				return this;
			}
		});

		var GroupedEach = Ember.Handlebars.GroupedEach = function(context, path, options) {
			var self = this,
				normalized = Ember.Handlebars.normalizePath(context, path, options.data);

			this.context = context;
			this.path = path;
			this.options = options;
			this.template = options.fn;
			this.containingView = options.data.view;
			this.normalizedRoot = normalized.root;
			this.normalizedPath = normalized.path;
			this.content = this.lookupContent();

			this.addContentObservers();
			this.addArrayObservers();

			this.containingView.on('willClearRender', function() {
				self.destroy();
			});
		};

		GroupedEach.prototype = {
			contentWillChange: function() {
				this.removeArrayObservers();
			},

			contentDidChange: function() {
				this.content = this.lookupContent();
				this.addArrayObservers();
				this.rerenderContainingView();
			},

			contentArrayWillChange: Ember.K,

			contentArrayDidChange: function() {
				this.rerenderContainingView();
			},

			lookupContent: function() {
				return Ember.Handlebars.get(this.normalizedRoot, this.normalizedPath, this.options);
			},

			addArrayObservers: function() {
				if (!this.content) { return; }

				this.content.addArrayObserver(this, {
					willChange: 'contentArrayWillChange',
					didChange: 'contentArrayDidChange'
				});
			},

			removeArrayObservers: function() {
				if (!this.content) { return; }

				this.content.removeArrayObserver(this, {
					willChange: 'contentArrayWillChange',
					didChange: 'contentArrayDidChange'
				});
			},

			addContentObservers: function() {
				Ember.addBeforeObserver(this.normalizedRoot, this.normalizedPath, this, this.contentWillChange);
				Ember.addObserver(this.normalizedRoot, this.normalizedPath, this, this.contentDidChange);
			},

			removeContentObservers: function() {
				Ember.removeBeforeObserver(this.normalizedRoot, this.normalizedPath, this.contentWillChange);
				Ember.removeObserver(this.normalizedRoot, this.normalizedPath, this.contentDidChange);
			},

			render: function() {
				if (!this.content) { return; }

				var content = this.content,
					contentLength = get(content, 'length'),
					data = this.options.data,
					template = this.template;

				data.insideEach = true;
				for (var i = 0; i < contentLength; i++) {
					template(content.objectAt(i), { data: data });
				}
			},

			rerenderContainingView: function() {
				var self = this;
				Ember.run.scheduleOnce('render', this, function() {
					// It's possible it's been destroyed after we enqueued a re-render call.
					if (!self.destroyed) {
						self.containingView.rerender();
					}
				});
			},

			destroy: function() {
				this.removeContentObservers();
				if (this.content) {
					this.removeArrayObservers();
				}
				this.destroyed = true;
			}
		};

		/**
		 The `{{#each}}` helper loops over elements in a collection, rendering its
		 block once for each item. It is an extension of the base Handlebars `{{#each}}`
		 helper:

		 ```javascript
		 Developers = [{name: 'Yehuda'},{name: 'Tom'}, {name: 'Paul'}];
		 ```

		 ```handlebars
		 {{#each Developers}}
		 {{name}}
		 {{/each}}
		 ```

		 `{{each}}` supports an alternative syntax with element naming:

		 ```handlebars
		 {{#each person in Developers}}
		 {{person.name}}
		 {{/each}}
		 ```

		 When looping over objects that do not have properties, `{{this}}` can be used
		 to render the object:

		 ```javascript
		 DeveloperNames = ['Yehuda', 'Tom', 'Paul']
		 ```

		 ```handlebars
		 {{#each DeveloperNames}}
		 {{this}}
		 {{/each}}
		 ```
		 ### {{else}} condition
		 `{{#each}}` can have a matching `{{else}}`. The contents of this block will render
		 if the collection is empty.

		 ```
		 {{#each person in Developers}}
		 {{person.name}}
		 {{else}}
		 <p>Sorry, nobody is available for this task.</p>
		 {{/each}}
		 ```
		 ### Specifying a View class for items
		 If you provide an `itemViewClass` option that references a view class
		 with its own `template` you can omit the block.

		 The following template:

		 ```handlebars
		 {{#view App.MyView }}
		 {{each view.items itemViewClass="App.AnItemView"}}
		 {{/view}}
		 ```

		 And application code

		 ```javascript
		 App = Ember.Application.create({
    MyView: Ember.View.extend({
      items: [
        Ember.Object.create({name: 'Dave'}),
        Ember.Object.create({name: 'Mary'}),
        Ember.Object.create({name: 'Sara'})
      ]
    })
  });

		 App.AnItemView = Ember.View.extend({
    template: Ember.Handlebars.compile("Greetings {{name}}")
  });
		 ```

		 Will result in the HTML structure below

		 ```html
		 <div class="ember-view">
		 <div class="ember-view">Greetings Dave</div>
		 <div class="ember-view">Greetings Mary</div>
		 <div class="ember-view">Greetings Sara</div>
		 </div>
		 ```

		 If an `itemViewClass` is defined on the helper, and therefore the helper is not
		 being used as a block, an `emptyViewClass` can also be provided optionally.
		 The `emptyViewClass` will match the behavior of the `{{else}}` condition
		 described above. That is, the `emptyViewClass` will render if the collection
		 is empty.

		 ### Representing each item with a Controller.
		 By default the controller lookup within an `{{#each}}` block will be
		 the controller of the template where the `{{#each}}` was used. If each
		 item needs to be presented by a custom controller you can provide a
		 `itemController` option which references a controller by lookup name.
		 Each item in the loop will be wrapped in an instance of this controller
		 and the item itself will be set to the `content` property of that controller.

		 This is useful in cases where properties of model objects need transformation
		 or synthesis for display:

		 ```javascript
		 App.DeveloperController = Ember.ObjectController.extend({
    isAvailableForHire: function() {
      return !this.get('content.isEmployed') && this.get('content.isSeekingWork');
    }.property('isEmployed', 'isSeekingWork')
  })
		 ```

		 ```handlebars
		 {{#each person in developers itemController="developer"}}
		 {{person.name}} {{#if person.isAvailableForHire}}Hire me!{{/if}}
		 {{/each}}
		 ```

		 Each itemController will receive a reference to the current controller as
		 a `parentController` property.

		 ### (Experimental) Grouped Each

		 When used in conjunction with the experimental [group helper](https://github.com/emberjs/group-helper),
		 you can inform Handlebars to re-render an entire group of items instead of
		 re-rendering them one at a time (in the event that they are changed en masse
		 or an item is added/removed).

		 ```handlebars
		 {{#group}}
		 {{#each people}}
		 {{firstName}} {{lastName}}
		 {{/each}}
		 {{/group}}
		 ```

		 This can be faster than the normal way that Handlebars re-renders items
		 in some cases.

		 If for some reason you have a group with more than one `#each`, you can make
		 one of the collections be updated in normal (non-grouped) fashion by setting
		 the option `groupedRows=true` (counter-intuitive, I know).

		 For example,

		 ```handlebars
		 {{dealershipName}}

		 {{#group}}
		 {{#each dealers}}
		 {{firstName}} {{lastName}}
		 {{/each}}

		 {{#each car in cars groupedRows=true}}
		 {{car.make}} {{car.model}} {{car.color}}
		 {{/each}}
		 {{/group}}
		 ```
		 Any change to `dealershipName` or the `dealers` collection will cause the
		 entire group to be re-rendered. However, changes to the `cars` collection
		 will be re-rendered individually (as normal).

		 Note that `group` behavior is also disabled by specifying an `itemViewClass`.

		 @method each
		 @for Ember.Handlebars.helpers
		 @param [name] {String} name for item (used with `in`)
		 @param [path] {String} path
		 @param [options] {Object} Handlebars key/value pairs of options
		 @param [options.itemViewClass] {String} a path to a view class used for each item
		 @param [options.itemController] {String} name of a controller to be created for each item
		 @param [options.groupedRows] {boolean} enable normal item-by-item rendering when inside a `#group` helper
		 */
		Ember.Handlebars.registerHelper('each', function(path, options) {
			if (arguments.length === 4) {


				var keywordName = arguments[0];

				options = arguments[3];
				path = arguments[2];
				if (path === '') { path = "this"; }

				options.hash.keyword = keywordName;
			}

			if (arguments.length === 1) {
				options = path;
				path = 'this';
			}

			options.hash.dataSourceBinding = path;
			// Set up emptyView as a metamorph with no tag
			//options.hash.emptyViewClass = Ember._MetamorphView;

			if (options.data.insideGroup && !options.hash.groupedRows && !options.hash.itemViewClass) {
				new Ember.Handlebars.GroupedEach(this, path, options).render();
			} else {
				return Ember.Handlebars.helpers.collection.call(this, 'Ember.Handlebars.EachView', options);
			}
		});

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-handlebars
		 */

		/**
		 `template` allows you to render a template from inside another template.
		 This allows you to re-use the same template in multiple places. For example:

		 ```html
		 <script type="text/x-handlebars" data-template-name="logged_in_user">
		 {{#with loggedInUser}}
		 Last Login: {{lastLogin}}
		 User Info: {{template "user_info"}}
		 {{/with}}
		 </script>
		 ```

		 ```html
		 <script type="text/x-handlebars" data-template-name="user_info">
		 Name: <em>{{name}}</em>
		 Karma: <em>{{karma}}</em>
		 </script>
		 ```

		 ```handlebars
		 {{#if isUser}}
		 {{template "user_info"}}
		 {{else}}
		 {{template "unlogged_user_info"}}
		 {{/if}}
		 ```

		 This helper looks for templates in the global `Ember.TEMPLATES` hash. If you
		 add `<script>` tags to your page with the `data-template-name` attribute set,
		 they will be compiled and placed in this hash automatically.

		 You can also manually register templates by adding them to the hash:

		 ```javascript
		 Ember.TEMPLATES["my_cool_template"] = Ember.Handlebars.compile('<b>{{user}}</b>');
		 ```

		 @deprecated
		 @method template
		 @for Ember.Handlebars.helpers
		 @param {String} templateName the template to render
		 */

		Ember.Handlebars.registerHelper('template', function(name, options) {

			return Ember.Handlebars.helpers.partial.apply(this, arguments);
		});

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-handlebars
		 */

		/**
		 `partial` renders a template directly using the current context.
		 If needed the context can be set using the `{{#with foo}}` helper.

		 ```html
		 <script type="text/x-handlebars" data-template-name="header_bar">
		 {{#with currentUser}}
		 {{partial user_info}}
		 {{/with}}
		 </script>
		 ```

		 The `data-template-name` attribute of a partial template
		 is prefixed with an underscore.

		 ```html
		 <script type="text/x-handlebars" data-template-name="_user_info">
		 <span>Hello {{username}}!</span>
		 </script>
		 ```

		 @method partial
		 @for Ember.Handlebars.helpers
		 @param {String} partialName the name of the template to render minus the leading underscore
		 */

		Ember.Handlebars.registerHelper('partial', function(name, options) {
			var nameParts = name.split("/"),
				lastPart = nameParts[nameParts.length - 1];

			nameParts[nameParts.length - 1] = "_" + lastPart;

			var view = options.data.view,
				underscoredName = nameParts.join("/"),
				template = view.templateForName(underscoredName),
				deprecatedTemplate = !template && view.templateForName(name);


			template = template || deprecatedTemplate;

			template(this, { data: options.data });
		});

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-handlebars
		 */

		var get = Ember.get, set = Ember.set;

		/**

		 `{{yield}}` denotes an area of a template that will be rendered inside
		 of another template. It has two main uses:

		 ### Use with `layout`
		 When used in a Handlebars template that is assigned to an `Ember.View`
		 instance's `layout` property Ember will render the layout template first,
		 inserting the view's own rendered output at the `{{yield}}` location.

		 An empty `<body>` and the following application code:

		 ```javascript
		 AView = Ember.View.extend({
    classNames: ['a-view-with-layout'],
    layout: Ember.Handlebars.compile('<div class="wrapper">{{yield}}</div>'),
    template: Ember.Handlebars.compile('<span>I am wrapped</span>')
  });

		 aView = AView.create();
		 aView.appendTo('body');
		 ```

		 Will result in the following HTML output:

		 ```html
		 <body>
		 <div class='ember-view a-view-with-layout'>
		 <div class="wrapper">
		 <span>I am wrapped</span>
		 </div>
		 </div>
		 </body>
		 ```

		 The `yield` helper cannot be used outside of a template assigned to an
		 `Ember.View`'s `layout` property and will throw an error if attempted.

		 ```javascript
		 BView = Ember.View.extend({
    classNames: ['a-view-with-layout'],
    template: Ember.Handlebars.compile('{{yield}}')
  });

		 bView = BView.create();
		 bView.appendTo('body');

		 // throws
		 // Uncaught Error: assertion failed:
		 // You called yield in a template that was not a layout
		 ```

		 ### Use with Ember.Component
		 When designing components `{{yield}}` is used to denote where, inside the component's
		 template, an optional block passed to the component should render:

		 ```handlebars
		 <!-- application.hbs -->
		 {{#labeled-textfield value=someProperty}}
		 First name:
		 {{/my-component}}
		 ```

		 ```handlebars
		 <!-- components/my-component.hbs -->
		 <label>
		 {{yield}} {{input value=value}}
		 </label>
		 ```

		 Result:

		 ```html
		 <label>
		 First name: <input type="text" />
		 <label>
		 ```

		 @method yield
		 @for Ember.Handlebars.helpers
		 @param {Hash} options
		 @return {String} HTML string
		 */
		Ember.Handlebars.registerHelper('yield', function(options) {
			var view = options.data.view;

			while (view && !get(view, 'layout')) {
				if (view._contextView) {
					view = view._contextView;
				} else {
					view = get(view, 'parentView');
				}
			}


			view._yield(this, options);
		});

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-handlebars
		 */

		/**
		 `loc` looks up the string in the localized strings hash.
		 This is a convenient way to localize text. For example:

		 ```html
		 <script type="text/x-handlebars" data-template-name="home">
		 {{loc "welcome"}}
		 </script>
		 ```

		 Take note that `"welcome"` is a string and not an object
		 reference.

		 @method loc
		 @for Ember.Handlebars.helpers
		 @param {String} str The string to format
		 */

		Ember.Handlebars.registerHelper('loc', function(str) {
			return Ember.String.loc(str);
		});

	})();



	(function() {

	})();



	(function() {

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-handlebars
		 */

		var set = Ember.set, get = Ember.get;

		/**
		 The internal class used to create text inputs when the `{{input}}`
		 helper is used with `type` of `checkbox`.

		 See Handlebars.helpers.input for usage details.

		 ## Direct manipulation of `checked`

		 The `checked` attribute of an `Ember.Checkbox` object should always be set
		 through the Ember object or by interacting with its rendered element
		 representation via the mouse, keyboard, or touch. Updating the value of the
		 checkbox via jQuery will result in the checked value of the object and its
		 element losing synchronization.

		 ## Layout and LayoutName properties

		 Because HTML `input` elements are self closing `layout` and `layoutName`
		 properties will not be applied. See [Ember.View](/api/classes/Ember.View.html)'s
		 layout section for more information.

		 @class Checkbox
		 @namespace Ember
		 @extends Ember.View
		 */
		Ember.Checkbox = Ember.View.extend({
			classNames: ['ember-checkbox'],

			tagName: 'input',

			attributeBindings: ['type', 'checked', 'indeterminate', 'disabled', 'tabindex', 'name'],

			type: "checkbox",
			checked: false,
			disabled: false,
			indeterminate: false,

			init: function() {
				this._super();
				this.on("change", this, this._updateElementValue);
			},

			didInsertElement: function() {
				this._super();
				this.get('element').indeterminate = !!this.get('indeterminate');
			},

			_updateElementValue: function() {
				set(this, 'checked', this.$().prop('checked'));
			}
		});

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-handlebars
		 */

		var get = Ember.get, set = Ember.set;

		/**
		 Shared mixin used by `Ember.TextField` and `Ember.TextArea`.

		 @class TextSupport
		 @namespace Ember
		 @private
		 */
		Ember.TextSupport = Ember.Mixin.create({
			value: "",

			attributeBindings: ['placeholder', 'disabled', 'maxlength', 'tabindex'],
			placeholder: null,
			disabled: false,
			maxlength: null,

			init: function() {
				this._super();
				this.on("focusOut", this, this._elementValueDidChange);
				this.on("change", this, this._elementValueDidChange);
				this.on("paste", this, this._elementValueDidChange);
				this.on("cut", this, this._elementValueDidChange);
				this.on("input", this, this._elementValueDidChange);
				this.on("keyUp", this, this.interpretKeyEvents);
			},

			/**
			 The action to be sent when the user presses the return key.

			 This is similar to the `{{action}}` helper, but is fired when
			 the user presses the return key when editing a text field, and sends
			 the value of the field as the context.

			 @property action
			 @type String
			 @default null
			 */
			action: null,

			/**
			 The event that should send the action.

			 Options are:

			 * `enter`: the user pressed enter
			 * `keypress`: the user pressed a key

			 @property onEvent
			 @type String
			 @default enter
			 */
			onEvent: 'enter',

			/**
			 Whether they `keyUp` event that triggers an `action` to be sent continues
			 propagating to other views.

			 By default, when the user presses the return key on their keyboard and
			 the text field has an `action` set, the action will be sent to the view's
			 controller and the key event will stop propagating.

			 If you would like parent views to receive the `keyUp` event even after an
			 action has been dispatched, set `bubbles` to true.

			 @property bubbles
			 @type Boolean
			 @default false
			 */
			bubbles: false,

			interpretKeyEvents: function(event) {
				var map = Ember.TextSupport.KEY_EVENTS;
				var method = map[event.keyCode];

				this._elementValueDidChange();
				if (method) { return this[method](event); }
			},

			_elementValueDidChange: function() {
				set(this, 'value', this.$().val());
			},

			/**
			 The action to be sent when the user inserts a new line.

			 Called by the `Ember.TextSupport` mixin on keyUp if keycode matches 13.
			 Uses sendAction to send the `enter` action to the controller.

			 @method insertNewLine
			 @param {Event} event
			 */
			insertNewline: function(event) {
				sendAction('enter', this, event);
				sendAction('insert-newline', this, event);
			},

			/**
			 Called when the user hits escape.

			 Called by the `Ember.TextSupport` mixin on keyUp if keycode matches 13.
			 Uses sendAction to send the `enter` action to the controller.

			 @method cancel
			 @param {Event} event
			 */
			cancel: function(event) {
				sendAction('escape-press', this, event);
			},

			/**
			 Called when the text area is focused.

			 @method focusIn
			 @param {Event} event
			 */
			focusIn: function(event) {
				sendAction('focus-in', this, event);
			},

			/**
			 Called when the text area is blurred.

			 @method focusOut
			 @param {Event} event
			 */
			focusOut: function(event) {
				sendAction('focus-out', this, event);
			},

			/**
			 The action to be sent when the user presses a key. Enabled by setting
			 the `onEvent` property to `keyPress`.

			 Uses sendAction to send the `keyPress` action to the controller.

			 @method keyPress
			 @param {Event} event
			 */
			keyPress: function(event) {
				sendAction('key-press', this, event);
			}

		});

		Ember.TextSupport.KEY_EVENTS = {
			13: 'insertNewline',
			27: 'cancel'
		};

// In principle, this shouldn't be necessary, but the legacy
// sectionAction semantics for TextField are different from
// the component semantics so this method normalizes them.
		function sendAction(eventName, view, event) {
			var action = get(view, eventName),
				on = get(view, 'onEvent'),
				value = get(view, 'value');

			// back-compat support for keyPress as an event name even though
			// it's also a method name that consumes the event (and therefore
			// incompatible with sendAction semantics).
			if (on === eventName || (on === 'keyPress' && eventName === 'key-press')) {
				view.sendAction('action', value);
			}

			view.sendAction(eventName, value);

			if (action || on === eventName) {
				if(!get(view, 'bubbles')) {
					event.stopPropagation();
				}
			}
		}

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-handlebars
		 */

		var get = Ember.get, set = Ember.set;

		/**

		 The internal class used to create text inputs when the `{{input}}`
		 helper is used with `type` of `text`.

		 See Handlebars.helpers.input for usage details.

		 ## Layout and LayoutName properties

		 Because HTML `input` elements are self closing `layout` and `layoutName`
		 properties will not be applied. See [Ember.View](/api/classes/Ember.View.html)'s
		 layout section for more information.

		 @class TextField
		 @namespace Ember
		 @extends Ember.View
		 @uses Ember.TextSupport
		 */
		Ember.TextField = Ember.Component.extend(Ember.TextSupport,
			/** @scope Ember.TextField.prototype */ {

				classNames: ['ember-text-field'],
				tagName: "input",
				attributeBindings: ['type', 'value', 'size', 'pattern', 'name'],

				/**
				 The `value` attribute of the input element. As the user inputs text, this
				 property is updated live.

				 @property value
				 @type String
				 @default ""
				 */
				value: "",

				/**
				 The `type` attribute of the input element.

				 @property type
				 @type String
				 @default "text"
				 */
				type: "text",

				/**
				 The `size` of the text field in characters.

				 @property size
				 @type String
				 @default null
				 */
				size: null,

				/**
				 The `pattern` the pattern attribute of input element.

				 @property pattern
				 @type String
				 @default null
				 */
				pattern: null
			});

	})();



	(function() {
		/*
		 @module ember
		 @submodule ember-handlebars
		 */

		var get = Ember.get, set = Ember.set;

		/*
		 @class Button
		 @namespace Ember
		 @extends Ember.View
		 @uses Ember.TargetActionSupport
		 @deprecated
		 */
		Ember.Button = Ember.View.extend(Ember.TargetActionSupport, {
			classNames: ['ember-button'],
			classNameBindings: ['isActive'],

			tagName: 'button',

			propagateEvents: false,

			attributeBindings: ['type', 'disabled', 'href', 'tabindex'],

			/*
			 @private

			 Overrides `TargetActionSupport`'s `targetObject` computed
			 property to use Handlebars-specific path resolution.

			 @property targetObject
			 */
			targetObject: Ember.computed(function() {
				var target = get(this, 'target'),
					root = get(this, 'context'),
					data = get(this, 'templateData');

				if (typeof target !== 'string') { return target; }

				return Ember.Handlebars.get(root, target, { data: data });
			}).property('target'),

			// Defaults to 'button' if tagName is 'input' or 'button'
			type: Ember.computed(function(key) {
				var tagName = this.tagName;
				if (tagName === 'input' || tagName === 'button') { return 'button'; }
			}),

			disabled: false,

			// Allow 'a' tags to act like buttons
			href: Ember.computed(function() {
				return this.tagName === 'a' ? '#' : null;
			}),

			mouseDown: function() {
				if (!get(this, 'disabled')) {
					set(this, 'isActive', true);
					this._mouseDown = true;
					this._mouseEntered = true;
				}
				return get(this, 'propagateEvents');
			},

			mouseLeave: function() {
				if (this._mouseDown) {
					set(this, 'isActive', false);
					this._mouseEntered = false;
				}
			},

			mouseEnter: function() {
				if (this._mouseDown) {
					set(this, 'isActive', true);
					this._mouseEntered = true;
				}
			},

			mouseUp: function(event) {
				if (get(this, 'isActive')) {
					// Actually invoke the button's target and action.
					// This method comes from the Ember.TargetActionSupport mixin.
					this.triggerAction();
					set(this, 'isActive', false);
				}

				this._mouseDown = false;
				this._mouseEntered = false;
				return get(this, 'propagateEvents');
			},

			keyDown: function(event) {
				// Handle space or enter
				if (event.keyCode === 13 || event.keyCode === 32) {
					this.mouseDown();
				}
			},

			keyUp: function(event) {
				// Handle space or enter
				if (event.keyCode === 13 || event.keyCode === 32) {
					this.mouseUp();
				}
			},

			// TODO: Handle proper touch behavior. Including should make inactive when
			// finger moves more than 20x outside of the edge of the button (vs mouse
			// which goes inactive as soon as mouse goes out of edges.)

			touchStart: function(touch) {
				return this.mouseDown(touch);
			},

			touchEnd: function(touch) {
				return this.mouseUp(touch);
			},

			init: function() {

				this._super();
			}
		});

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-handlebars
		 */

		var get = Ember.get, set = Ember.set;

		/**
		 The internal class used to create textarea element when the `{{textarea}}`
		 helper is used.

		 See handlebars.helpers.textarea for usage details.

		 ## Layout and LayoutName properties

		 Because HTML `textarea` elements do not contain inner HTML the `layout` and
		 `layoutName` properties will not be applied. See [Ember.View](/api/classes/Ember.View.html)'s
		 layout section for more information.

		 @class TextArea
		 @namespace Ember
		 @extends Ember.View
		 @uses Ember.TextSupport
		 */
		Ember.TextArea = Ember.Component.extend(Ember.TextSupport, {
			classNames: ['ember-text-area'],

			tagName: "textarea",
			attributeBindings: ['rows', 'cols', 'name'],
			rows: null,
			cols: null,

			_updateElementValue: Ember.observer(function() {
				// We do this check so cursor position doesn't get affected in IE
				var value = get(this, 'value'),
					$el = this.$();
				if ($el && value !== $el.val()) {
					$el.val(value);
				}
			}, 'value'),

			init: function() {
				this._super();
				this.on("didInsertElement", this, this._updateElementValue);
			}

		});

	})();



	(function() {
		/*jshint eqeqeq:false */

		/**
		 @module ember
		 @submodule ember-handlebars
		 */

		var set = Ember.set,
			get = Ember.get,
			indexOf = Ember.EnumerableUtils.indexOf,
			indexesOf = Ember.EnumerableUtils.indexesOf,
			forEach = Ember.EnumerableUtils.forEach,
			replace = Ember.EnumerableUtils.replace,
			isArray = Ember.isArray,
			precompileTemplate = Ember.Handlebars.compile;

		Ember.SelectOption = Ember.View.extend({
			tagName: 'option',
			attributeBindings: ['value', 'selected'],

			defaultTemplate: function(context, options) {
				options = { data: options.data, hash: {} };
				Ember.Handlebars.helpers.bind.call(context, "view.label", options);
			},

			init: function() {
				this.labelPathDidChange();
				this.valuePathDidChange();

				this._super();
			},

			selected: Ember.computed(function() {
				var content = get(this, 'content'),
					selection = get(this, 'parentView.selection');
				if (get(this, 'parentView.multiple')) {
					return selection && indexOf(selection, content.valueOf()) > -1;
				} else {
					// Primitives get passed through bindings as objects... since
					// `new Number(4) !== 4`, we use `==` below
					return content == selection;
				}
			}).property('content', 'parentView.selection'),

			labelPathDidChange: Ember.observer(function() {
				var labelPath = get(this, 'parentView.optionLabelPath');

				if (!labelPath) { return; }

				Ember.defineProperty(this, 'label', Ember.computed(function() {
					return get(this, labelPath);
				}).property(labelPath));
			}, 'parentView.optionLabelPath'),

			valuePathDidChange: Ember.observer(function() {
				var valuePath = get(this, 'parentView.optionValuePath');

				if (!valuePath) { return; }

				Ember.defineProperty(this, 'value', Ember.computed(function() {
					return get(this, valuePath);
				}).property(valuePath));
			}, 'parentView.optionValuePath')
		});

		Ember.SelectOptgroup = Ember.CollectionView.extend({
			tagName: 'optgroup',
			attributeBindings: ['label'],

			selectionBinding: 'parentView.selection',
			multipleBinding: 'parentView.multiple',
			optionLabelPathBinding: 'parentView.optionLabelPath',
			optionValuePathBinding: 'parentView.optionValuePath',

			itemViewClassBinding: 'parentView.optionView'
		});

		/**
		 The `Ember.Select` view class renders a
		 [select](https://developer.mozilla.org/en/HTML/Element/select) HTML element,
		 allowing the user to choose from a list of options.

		 The text and `value` property of each `<option>` element within the
		 `<select>` element are populated from the objects in the `Element.Select`'s
		 `content` property. The underlying data object of the selected `<option>` is
		 stored in the `Element.Select`'s `value` property.

		 ### `content` as an array of Strings

		 The simplest version of an `Ember.Select` takes an array of strings as its
		 `content` property. The string will be used as both the `value` property and
		 the inner text of each `<option>` element inside the rendered `<select>`.

		 Example:

		 ```javascript
		 App.ApplicationController = Ember.Controller.extend({
    names: ["Yehuda", "Tom"]
  });
		 ```

		 ```handlebars
		 {{view Ember.Select contentBinding="names"}}
		 ```

		 Would result in the following HTML:

		 ```html
		 <select class="ember-select">
		 <option value="Yehuda">Yehuda</option>
		 <option value="Tom">Tom</option>
		 </select>
		 ```

		 You can control which `<option>` is selected through the `Ember.Select`'s
		 `value` property directly or as a binding:

		 ```javascript
		 App.ApplicationController = Ember.Controller.extend({
    selectedName: 'Tom',
    names: ["Yehuda", "Tom"]
  });
		 ```

		 ```handlebars
		 {{view Ember.Select
         contentBinding="names"
         valueBinding="selectedName"
  }}
		 ```

		 Would result in the following HTML with the `<option>` for 'Tom' selected:

		 ```html
		 <select class="ember-select">
		 <option value="Yehuda">Yehuda</option>
		 <option value="Tom" selected="selected">Tom</option>
		 </select>
		 ```

		 A user interacting with the rendered `<select>` to choose "Yehuda" would
		 update the value of `selectedName` to "Yehuda".

		 ### `content` as an Array of Objects

		 An `Ember.Select` can also take an array of JavaScript or Ember objects as
		 its `content` property.

		 When using objects you need to tell the `Ember.Select` which property should
		 be accessed on each object to supply the `value` attribute of the `<option>`
		 and which property should be used to supply the element text.

		 The `optionValuePath` option is used to specify the path on each object to
		 the desired property for the `value` attribute. The `optionLabelPath`
		 specifies the path on each object to the desired property for the
		 element's text. Both paths must reference each object itself as `content`:

		 ```javascript
		 App.ApplicationController = Ember.Controller.extend({
    programmers: [
      {firstName: "Yehuda", id: 1},
      {firstName: "Tom",    id: 2}
    ]
  });
		 ```

		 ```handlebars
		 {{view Ember.Select
         contentBinding="programmers"
         optionValuePath="content.id"
         optionLabelPath="content.firstName"}}
		 ```

		 Would result in the following HTML:

		 ```html
		 <select class="ember-select">
		 <option value="1">Yehuda</option>
		 <option value="2">Tom</option>
		 </select>
		 ```

		 The `value` attribute of the selected `<option>` within an `Ember.Select`
		 can be bound to a property on another object by providing a
		 `valueBinding` option:

		 ```javascript
		 App.ApplicationController = Ember.Controller.extend({
    programmers: [
      {firstName: "Yehuda", id: 1},
      {firstName: "Tom",    id: 2}
    ],
    currentProgrammer: {
      id: 2
    }
  });
		 ```

		 ```handlebars
		 {{view Ember.Select
         contentBinding="programmers"
         optionValuePath="content.id"
         optionLabelPath="content.firstName"
         valueBinding="currentProgrammer.id"}}
		 ```

		 Would result in the following HTML with a selected option:

		 ```html
		 <select class="ember-select">
		 <option value="1">Yehuda</option>
		 <option value="2" selected="selected">Tom</option>
		 </select>
		 ```

		 Interacting with the rendered element by selecting the first option
		 ('Yehuda') will update the `id` of `currentProgrammer`
		 to match the `value` property of the newly selected `<option>`.

		 Alternatively, you can control selection through the underlying objects
		 used to render each object providing a `selectionBinding`. When the selected
		 `<option>` is changed, the property path provided to `selectionBinding`
		 will be updated to match the content object of the rendered `<option>`
		 element:

		 ```javascript
		 App.ApplicationController = Ember.Controller.extend({
    selectedPerson: null,
    programmers: [
      {firstName: "Yehuda", id: 1},
      {firstName: "Tom",    id: 2}
    ]
  });
		 ```

		 ```handlebars
		 {{view Ember.Select
         contentBinding="programmers"
         optionValuePath="content.id"
         optionLabelPath="content.firstName"
         selectionBinding="selectedPerson"}}
		 ```

		 Would result in the following HTML with a selected option:

		 ```html
		 <select class="ember-select">
		 <option value="1">Yehuda</option>
		 <option value="2" selected="selected">Tom</option>
		 </select>
		 ```

		 Interacting with the rendered element by selecting the first option
		 ('Yehuda') will update the `selectedPerson` to match the object of
		 the newly selected `<option>`. In this case it is the first object
		 in the `programmers`

		 ### Supplying a Prompt

		 A `null` value for the `Ember.Select`'s `value` or `selection` property
		 results in there being no `<option>` with a `selected` attribute:

		 ```javascript
		 App.ApplicationController = Ember.Controller.extend({
    selectedProgrammer: null,
    programmers: [
      "Yehuda",
      "Tom"
    ]
  });
		 ```

		 ``` handlebars
		 {{view Ember.Select
         contentBinding="programmers"
         valueBinding="selectedProgrammer"
  }}
		 ```

		 Would result in the following HTML:

		 ```html
		 <select class="ember-select">
		 <option value="Yehuda">Yehuda</option>
		 <option value="Tom">Tom</option>
		 </select>
		 ```

		 Although `selectedProgrammer` is `null` and no `<option>`
		 has a `selected` attribute the rendered HTML will display the
		 first item as though it were selected. You can supply a string
		 value for the `Ember.Select` to display when there is no selection
		 with the `prompt` option:

		 ```javascript
		 App.ApplicationController = Ember.Controller.extend({
    selectedProgrammer: null,
    programmers: [
      "Yehuda",
      "Tom"
    ]
  });
		 ```

		 ```handlebars
		 {{view Ember.Select
         contentBinding="programmers"
         valueBinding="selectedProgrammer"
         prompt="Please select a name"
  }}
		 ```

		 Would result in the following HTML:

		 ```html
		 <select class="ember-select">
		 <option>Please select a name</option>
		 <option value="Yehuda">Yehuda</option>
		 <option value="Tom">Tom</option>
		 </select>
		 ```

		 @class Select
		 @namespace Ember
		 @extends Ember.View
		 */
		Ember.Select = Ember.View.extend(
			/** @scope Ember.Select.prototype */ {

				tagName: 'select',
				classNames: ['ember-select'],
				defaultTemplate: Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
					this.compilerInfo = [4,'>= 1.0.0'];
					helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
					var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

					function program1(depth0,data) {

						var buffer = '', hashTypes, hashContexts;
						data.buffer.push("<option value=\"\">");
						hashTypes = {};
						hashContexts = {};
						data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.prompt", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
						data.buffer.push("</option>");
						return buffer;
					}

					function program3(depth0,data) {

						var stack1, hashTypes, hashContexts;
						hashTypes = {};
						hashContexts = {};
						stack1 = helpers.each.call(depth0, "view.groupedContent", {hash:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
						if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
						else { data.buffer.push(''); }
					}
					function program4(depth0,data) {

						var hashContexts, hashTypes;
						hashContexts = {'contentBinding': depth0,'labelBinding': depth0};
						hashTypes = {'contentBinding': "ID",'labelBinding': "ID"};
						data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.groupView", {hash:{
							'contentBinding': ("content"),
							'labelBinding': ("label")
						},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
					}

					function program6(depth0,data) {

						var stack1, hashTypes, hashContexts;
						hashTypes = {};
						hashContexts = {};
						stack1 = helpers.each.call(depth0, "view.content", {hash:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
						if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
						else { data.buffer.push(''); }
					}
					function program7(depth0,data) {

						var hashContexts, hashTypes;
						hashContexts = {'contentBinding': depth0};
						hashTypes = {'contentBinding': "STRING"};
						data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.optionView", {hash:{
							'contentBinding': ("this")
						},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
					}

					hashTypes = {};
					hashContexts = {};
					stack1 = helpers['if'].call(depth0, "view.prompt", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
					if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
					hashTypes = {};
					hashContexts = {};
					stack1 = helpers['if'].call(depth0, "view.optionGroupPath", {hash:{},inverse:self.program(6, program6, data),fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
					if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
					return buffer;

				}),
				attributeBindings: ['multiple', 'disabled', 'tabindex', 'name'],

				/**
				 The `multiple` attribute of the select element. Indicates whether multiple
				 options can be selected.

				 @property multiple
				 @type Boolean
				 @default false
				 */
				multiple: false,

				/**
				 The `disabled` attribute of the select element. Indicates whether
				 the element is disabled from interactions.

				 @property multiple
				 @type Boolean
				 @default false
				 */
				disabled: false,

				/**
				 The list of options.

				 If `optionLabelPath` and `optionValuePath` are not overridden, this should
				 be a list of strings, which will serve simultaneously as labels and values.

				 Otherwise, this should be a list of objects. For instance:

				 ```javascript
				 Ember.Select.create({
      content: Ember.A([
          { id: 1, firstName: 'Yehuda' },
          { id: 2, firstName: 'Tom' }
        ]),
      optionLabelPath: 'content.firstName',
      optionValuePath: 'content.id'
    });
				 ```

				 @property content
				 @type Array
				 @default null
				 */
				content: null,

				/**
				 When `multiple` is `false`, the element of `content` that is currently
				 selected, if any.

				 When `multiple` is `true`, an array of such elements.

				 @property selection
				 @type Object or Array
				 @default null
				 */
				selection: null,

				/**
				 In single selection mode (when `multiple` is `false`), value can be used to
				 get the current selection's value or set the selection by it's value.

				 It is not currently supported in multiple selection mode.

				 @property value
				 @type String
				 @default null
				 */
				value: Ember.computed(function(key, value) {
					if (arguments.length === 2) { return value; }
					var valuePath = get(this, 'optionValuePath').replace(/^content\.?/, '');
					return valuePath ? get(this, 'selection.' + valuePath) : get(this, 'selection');
				}).property('selection'),

				/**
				 If given, a top-most dummy option will be rendered to serve as a user
				 prompt.

				 @property prompt
				 @type String
				 @default null
				 */
				prompt: null,

				/**
				 The path of the option labels. See [content](/api/classes/Ember.Select.html#property_content).

				 @property optionLabelPath
				 @type String
				 @default 'content'
				 */
				optionLabelPath: 'content',

				/**
				 The path of the option values. See [content](/api/classes/Ember.Select.html#property_content).

				 @property optionValuePath
				 @type String
				 @default 'content'
				 */
				optionValuePath: 'content',

				/**
				 The path of the option group.
				 When this property is used, `content` should be sorted by `optionGroupPath`.

				 @property optionGroupPath
				 @type String
				 @default null
				 */
				optionGroupPath: null,

				/**
				 The view class for optgroup.

				 @property groupView
				 @type Ember.View
				 @default Ember.SelectOptgroup
				 */
				groupView: Ember.SelectOptgroup,

				groupedContent: Ember.computed(function() {
					var groupPath = get(this, 'optionGroupPath');
					var groupedContent = Ember.A();

					forEach(get(this, 'content'), function(item) {
						var label = get(item, groupPath);

						if (get(groupedContent, 'lastObject.label') !== label) {
							groupedContent.pushObject({
								label: label,
								content: Ember.A()
							});
						}

						get(groupedContent, 'lastObject.content').push(item);
					});

					return groupedContent;
				}).property('optionGroupPath', 'content.@each'),

				/**
				 The view class for option.

				 @property optionView
				 @type Ember.View
				 @default Ember.SelectOption
				 */
				optionView: Ember.SelectOption,

				_change: function() {
					if (get(this, 'multiple')) {
						this._changeMultiple();
					} else {
						this._changeSingle();
					}
				},

				selectionDidChange: Ember.observer(function() {
					var selection = get(this, 'selection');
					if (get(this, 'multiple')) {
						if (!isArray(selection)) {
							set(this, 'selection', Ember.A([selection]));
							return;
						}
						this._selectionDidChangeMultiple();
					} else {
						this._selectionDidChangeSingle();
					}
				}, 'selection.@each'),

				valueDidChange: Ember.observer(function() {
					var content = get(this, 'content'),
						value = get(this, 'value'),
						valuePath = get(this, 'optionValuePath').replace(/^content\.?/, ''),
						selectedValue = (valuePath ? get(this, 'selection.' + valuePath) : get(this, 'selection')),
						selection;

					if (value !== selectedValue) {
						selection = content ? content.find(function(obj) {
							return value === (valuePath ? get(obj, valuePath) : obj);
						}) : null;

						this.set('selection', selection);
					}
				}, 'value'),


				_triggerChange: function() {
					var selection = get(this, 'selection');
					var value = get(this, 'value');

					if (!Ember.isNone(selection)) { this.selectionDidChange(); }
					if (!Ember.isNone(value)) { this.valueDidChange(); }

					this._change();
				},

				_changeSingle: function() {
					var selectedIndex = this.$()[0].selectedIndex,
						content = get(this, 'content'),
						prompt = get(this, 'prompt');

					if (!content || !get(content, 'length')) { return; }
					if (prompt && selectedIndex === 0) { set(this, 'selection', null); return; }

					if (prompt) { selectedIndex -= 1; }
					set(this, 'selection', content.objectAt(selectedIndex));
				},


				_changeMultiple: function() {
					var options = this.$('option:selected'),
						prompt = get(this, 'prompt'),
						offset = prompt ? 1 : 0,
						content = get(this, 'content'),
						selection = get(this, 'selection');

					if (!content) { return; }
					if (options) {
						var selectedIndexes = options.map(function() {
							return this.index - offset;
						}).toArray();
						var newSelection = content.objectsAt(selectedIndexes);

						if (isArray(selection)) {
							replace(selection, 0, get(selection, 'length'), newSelection);
						} else {
							set(this, 'selection', newSelection);
						}
					}
				},

				_selectionDidChangeSingle: function() {
					var el = this.get('element');
					if (!el) { return; }

					var content = get(this, 'content'),
						selection = get(this, 'selection'),
						selectionIndex = content ? indexOf(content, selection) : -1,
						prompt = get(this, 'prompt');

					if (prompt) { selectionIndex += 1; }
					if (el) { el.selectedIndex = selectionIndex; }
				},

				_selectionDidChangeMultiple: function() {
					var content = get(this, 'content'),
						selection = get(this, 'selection'),
						selectedIndexes = content ? indexesOf(content, selection) : [-1],
						prompt = get(this, 'prompt'),
						offset = prompt ? 1 : 0,
						options = this.$('option'),
						adjusted;

					if (options) {
						options.each(function() {
							adjusted = this.index > -1 ? this.index - offset : -1;
							this.selected = indexOf(selectedIndexes, adjusted) > -1;
						});
					}
				},

				init: function() {
					this._super();
					this.on("didInsertElement", this, this._triggerChange);
					this.on("change", this, this._change);
				}
			});

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-handlebars
		 */

		function normalizeHash(hash, hashTypes) {
			for (var prop in hash) {
				if (hashTypes[prop] === 'ID') {
					hash[prop + 'Binding'] = hash[prop];
					delete hash[prop];
				}
			}
		}

		/**

		 The `{{input}}` helper inserts an HTML `<input>` tag into the template,
		 with a `type` value of either `text` or `checkbox`. If no `type` is provided,
		 `text` will be the default value applied. The attributes of `{{input}}`
		 match those of the native HTML tag as closely as possible for these two types.

		 ## Use as text field
		 An `{{input}}` with no `type` or a `type` of `text` will render an HTML text input.
		 The following HTML attributes can be set via the helper:

		 * `value`
		 * `size`
		 * `name`
		 * `pattern`
		 * `placeholder`
		 * `disabled`
		 * `maxlength`
		 * `tabindex`

		 When set to a quoted string, these values will be directly applied to the HTML
		 element. When left unquoted, these values will be bound to a property on the
		 template's current rendering context (most typically a controller instance).

		 Unbound:

		 ```handlebars
		 {{input value="http://www.facebook.com"}}
		 ```

		 ```html
		 <input type="text" value="http://www.facebook.com"/>
		 ```

		 Bound:

		 ```javascript
		 App.ApplicationController = Ember.Controller.extend({
    firstName: "Stanley",
    entryNotAllowed: true
  });
		 ```

		 ```handlebars
		 {{input type="text" value=firstName disabled=entryNotAllowed size="50"}}
		 ```

		 ```html
		 <input type="text" value="Stanley" disabled="disabled" size="50"/>
		 ```

		 ### Extension
		 Internally, `{{input type="text"}}` creates an instance of `Ember.TextField`, passing
		 arguments from the helper to `Ember.TextField`'s `create` method. You can extend the
		 capablilties of text inputs in your applications by reopening this class. For example,
		 if you are deploying to browsers where the `required` attribute is used, you
		 can add this to the `TextField`'s `attributeBindings` property:

		 ```javascript
		 Ember.TextField.reopen({
    attributeBindings: ['required']
  });
		 ```

		 ## Use as checkbox
		 An `{{input}}` with a `type` of `checkbox` will render an HTML checkbox input.
		 The following HTML attributes can be set via the helper:

		 * `checked`
		 * `disabled`
		 * `tabindex`
		 * `indeterminate`
		 * `name`

		 When set to a quoted string, these values will be directly applied to the HTML
		 element. When left unquoted, these values will be bound to a property on the
		 template's current rendering context (most typically a controller instance).

		 Unbound:

		 ```handlebars
		 {{input type="checkbox" name="isAdmin"}}
		 ```

		 ```html
		 <input type="checkbox" name="isAdmin" />
		 ```

		 Bound:

		 ```javascript
		 App.ApplicationController = Ember.Controller.extend({
    isAdmin: true
  });
		 ```

		 ```handlebars
		 {{input type="checkbox" checked=isAdmin }}
		 ```

		 ```html
		 <input type="checkbox" checked="checked" />
		 ```

		 ### Extension
		 Internally, `{{input type="checkbox"}}` creates an instance of `Ember.Checkbox`, passing
		 arguments from the helper to `Ember.Checkbox`'s `create` method. You can extend the
		 capablilties of checkbox inputs in your applications by reopening this class. For example,
		 if you wanted to add a css class to all checkboxes in your application:

		 ```javascript
		 Ember.Checkbox.reopen({
    classNames: ['my-app-checkbox']
  });
		 ```

		 @method input
		 @for Ember.Handlebars.helpers
		 @param {Hash} options
		 */
		Ember.Handlebars.registerHelper('input', function(options) {


			var hash = options.hash,
				types = options.hashTypes,
				inputType = hash.type,
				onEvent = hash.on;

			delete hash.type;
			delete hash.on;

			normalizeHash(hash, types);

			if (inputType === 'checkbox') {
				return Ember.Handlebars.helpers.view.call(this, Ember.Checkbox, options);
			} else {
				if (inputType) { hash.type = inputType; }
				hash.onEvent = onEvent || 'enter';
				return Ember.Handlebars.helpers.view.call(this, Ember.TextField, options);
			}
		});

		/**
		 `{{textarea}}` inserts a new instance of `<textarea>` tag into the template.
		 The attributes of `{{textarea}}` match those of the native HTML tags as
		 closely as possible.

		 The following HTML attributes can be set:

		 * `value`
		 * `name`
		 * `rows`
		 * `cols`
		 * `placeholder`
		 * `disabled`
		 * `maxlength`
		 * `tabindex`

		 When set to a quoted string, these value will be directly applied to the HTML
		 element. When left unquoted, these values will be bound to a property on the
		 template's current rendering context (most typically a controller instance).

		 Unbound:

		 ```handlebars
		 {{textarea value="Lots of static text that ISN'T bound"}}
		 ```

		 Would result in the following HTML:

		 ```html
		 <textarea class="ember-text-area">
		 Lots of static text that ISN'T bound
		 </textarea>
		 ```

		 Bound:

		 In the following example, the `writtenWords` property on `App.ApplicationController`
		 will be updated live as the user types 'Lots of text that IS bound' into
		 the text area of their browser's window.

		 ```javascript
		 App.ApplicationController = Ember.Controller.extend({
    writtenWords: "Lots of text that IS bound"
  });
		 ```

		 ```handlebars
		 {{textarea value=writtenWords}}
		 ```

		 Would result in the following HTML:

		 ```html
		 <textarea class="ember-text-area">
		 Lots of text that IS bound
		 </textarea>
		 ```

		 If you wanted a one way binding between the text area and a div tag
		 somewhere else on your screen, you could use `Ember.computed.oneWay`:

		 ```javascript
		 App.ApplicationController = Ember.Controller.extend({
    writtenWords: "Lots of text that IS bound",
    outputWrittenWords: Ember.computed.oneWay("writtenWords")
  });
		 ```

		 ```handlebars
		 {{textarea value=writtenWords}}

		 <div>
		 {{outputWrittenWords}}
		 </div>
		 ```

		 Would result in the following HTML:

		 ```html
		 <textarea class="ember-text-area">
		 Lots of text that IS bound
		 </textarea>

		 <-- the following div will be updated in real time as you type -->

		 <div>
		 Lots of text that IS bound
		 </div>
		 ```

		 Finally, this example really shows the power and ease of Ember when two
		 properties are bound to eachother via `Ember.computed.alias`. Type into
		 either text area box and they'll both stay in sync. Note that
		 `Ember.computed.alias` costs more in terms of performance, so only use it when
		 your really binding in both directions:

		 ```javascript
		 App.ApplicationController = Ember.Controller.extend({
    writtenWords: "Lots of text that IS bound",
    twoWayWrittenWords: Ember.computed.alias("writtenWords")
  });
		 ```

		 ```handlebars
		 {{textarea value=writtenWords}}
		 {{textarea value=twoWayWrittenWords}}
		 ```

		 ```html
		 <textarea id="ember1" class="ember-text-area">
		 Lots of text that IS bound
		 </textarea>

		 <-- both updated in real time -->

		 <textarea id="ember2" class="ember-text-area">
		 Lots of text that IS bound
		 </textarea>
		 ```

		 ### Extension

		 Internally, `{{textarea}}` creates an instance of `Ember.TextArea`, passing
		 arguments from the helper to `Ember.TextArea`'s `create` method. You can
		 extend the capabilities of text areas in your application by reopening this
		 class. For example, if you are deploying to browsers where the `required`
		 attribute is used, you can globally add support for the `required` attribute
		 on all {{textarea}}'s' in your app by reopening `Ember.TextArea` or
		 `Ember.TextSupport` and adding it to the `attributeBindings` concatenated
		 property:

		 ```javascript
		 Ember.TextArea.reopen({
    attributeBindings: ['required']
  });
		 ```

		 @method textarea
		 @for Ember.Handlebars.helpers
		 @param {Hash} options
		 */
		Ember.Handlebars.registerHelper('textarea', function(options) {


			var hash = options.hash,
				types = options.hashTypes;

			normalizeHash(hash, types);
			return Ember.Handlebars.helpers.view.call(this, Ember.TextArea, options);
		});

	})();



	(function() {
		/*globals Handlebars */
		/**
		 @module ember
		 @submodule ember-handlebars
		 */

		/**
		 @private

		 Find templates stored in the head tag as script tags and make them available
		 to `Ember.CoreView` in the global `Ember.TEMPLATES` object. This will be run
		 as as jQuery DOM-ready callback.

		 Script tags with `text/x-handlebars` will be compiled
		 with Ember's Handlebars and are suitable for use as a view's template.
		 Those with type `text/x-raw-handlebars` will be compiled with regular
		 Handlebars and are suitable for use in views' computed properties.

		 @method bootstrap
		 @for Ember.Handlebars
		 @static
		 @param ctx
		 */
		Ember.Handlebars.bootstrap = function(ctx) {
			var selectors = 'script[type="text/x-handlebars"], script[type="text/x-raw-handlebars"]';

			Ember.$(selectors, ctx)
				.each(function() {
					// Get a reference to the script tag
					var script = Ember.$(this);

					var compile = (script.attr('type') === 'text/x-raw-handlebars') ?
							Ember.$.proxy(Handlebars.compile, Handlebars) :
							Ember.$.proxy(Ember.Handlebars.compile, Ember.Handlebars),
					// Get the name of the script, used by Ember.View's templateName property.
					// First look for data-template-name attribute, then fall back to its
					// id if no name is found.
						templateName = script.attr('data-template-name') || script.attr('id') || 'application',
						template = compile(script.html());

					// Check if template of same name already exists
					if (Ember.TEMPLATES[templateName] !== undefined) {
						throw new Error('Template named "' + templateName  + '" already exists.');
					}

					// For templates which have a name, we save them and then remove them from the DOM
					Ember.TEMPLATES[templateName] = template;

					// Remove script tag from DOM
					script.remove();
				});
		};

		function bootstrap() {
			Ember.Handlebars.bootstrap( Ember.$(document) );
		}

		function registerComponents(container) {
			var templates = Ember.TEMPLATES, match;
			if (!templates) { return; }

			for (var prop in templates) {
				if (match = prop.match(/^components\/(.*)$/)) {
					registerComponent(container, match[1]);
				}
			}
		}


		function registerComponent(container, name) {


			container.injection('component:' + name, 'layout', 'template:components/' + name);

			var fullName = 'component:' + name;
			var Component = container.lookupFactory(fullName);

			if (!Component) {
				container.register('component:' + name, Ember.Component);
				Component = container.lookupFactory(fullName);
			}

			Ember.Handlebars.helper(name, Component);
		}

		/*
		 We tie this to application.load to ensure that we've at least
		 attempted to bootstrap at the point that the application is loaded.

		 We also tie this to document ready since we're guaranteed that all
		 the inline templates are present at this point.

		 There's no harm to running this twice, since we remove the templates
		 from the DOM after processing.
		 */

		Ember.onLoad('Ember.Application', function(Application) {
			Application.initializer({
				name: 'domTemplates',
				initialize: bootstrap
			});

			Application.initializer({
				name: 'registerComponents',
				after: 'domTemplates',
				initialize: registerComponents
			});
		});

	})();



	(function() {
		/**
		 Ember Handlebars

		 @module ember
		 @submodule ember-handlebars
		 @requires ember-views
		 */

		Ember.runLoadHooks('Ember.Handlebars', Ember.Handlebars);

	})();

	(function() {
		define("route-recognizer",
			[],
			function() {
				"use strict";
				var specials = [
					'/', '.', '*', '+', '?', '|',
					'(', ')', '[', ']', '{', '}', '\\'
				];

				var escapeRegex = new RegExp('(\\' + specials.join('|\\') + ')', 'g');

				// A Segment represents a segment in the original route description.
				// Each Segment type provides an `eachChar` and `regex` method.
				//
				// The `eachChar` method invokes the callback with one or more character
				// specifications. A character specification consumes one or more input
				// characters.
				//
				// The `regex` method returns a regex fragment for the segment. If the
				// segment is a dynamic of star segment, the regex fragment also includes
				// a capture.
				//
				// A character specification contains:
				//
				// * `validChars`: a String with a list of all valid characters, or
				// * `invalidChars`: a String with a list of all invalid characters
				// * `repeat`: true if the character specification can repeat

				function StaticSegment(string) { this.string = string; }
				StaticSegment.prototype = {
					eachChar: function(callback) {
						var string = this.string, char;

						for (var i=0, l=string.length; i<l; i++) {
							char = string.charAt(i);
							callback({ validChars: char });
						}
					},

					regex: function() {
						return this.string.replace(escapeRegex, '\\$1');
					},

					generate: function() {
						return this.string;
					}
				};

				function DynamicSegment(name) { this.name = name; }
				DynamicSegment.prototype = {
					eachChar: function(callback) {
						callback({ invalidChars: "/", repeat: true });
					},

					regex: function() {
						return "([^/]+)";
					},

					generate: function(params) {
						return params[this.name];
					}
				};

				function StarSegment(name) { this.name = name; }
				StarSegment.prototype = {
					eachChar: function(callback) {
						callback({ invalidChars: "", repeat: true });
					},

					regex: function() {
						return "(.+)";
					},

					generate: function(params) {
						return params[this.name];
					}
				};

				function EpsilonSegment() {}
				EpsilonSegment.prototype = {
					eachChar: function() {},
					regex: function() { return ""; },
					generate: function() { return ""; }
				};

				function parse(route, names, types) {
					// normalize route as not starting with a "/". Recognition will
					// also normalize.
					if (route.charAt(0) === "/") { route = route.substr(1); }

					var segments = route.split("/"), results = [];

					for (var i=0, l=segments.length; i<l; i++) {
						var segment = segments[i], match;

						if (match = segment.match(/^:([^\/]+)$/)) {
							results.push(new DynamicSegment(match[1]));
							names.push(match[1]);
							types.dynamics++;
						} else if (match = segment.match(/^\*([^\/]+)$/)) {
							results.push(new StarSegment(match[1]));
							names.push(match[1]);
							types.stars++;
						} else if (segment === "") {
							results.push(new EpsilonSegment());
						} else {
							results.push(new StaticSegment(segment));
							types.statics++;
						}
					}

					return results;
				}

				// A State has a character specification and (`charSpec`) and a list of possible
				// subsequent states (`nextStates`).
				//
				// If a State is an accepting state, it will also have several additional
				// properties:
				//
				// * `regex`: A regular expression that is used to extract parameters from paths
				//   that reached this accepting state.
				// * `handlers`: Information on how to convert the list of captures into calls
				//   to registered handlers with the specified parameters
				// * `types`: How many static, dynamic or star segments in this route. Used to
				//   decide which route to use if multiple registered routes match a path.
				//
				// Currently, State is implemented naively by looping over `nextStates` and
				// comparing a character specification against a character. A more efficient
				// implementation would use a hash of keys pointing at one or more next states.

				function State(charSpec) {
					this.charSpec = charSpec;
					this.nextStates = [];
				}

				State.prototype = {
					get: function(charSpec) {
						var nextStates = this.nextStates;

						for (var i=0, l=nextStates.length; i<l; i++) {
							var child = nextStates[i];

							var isEqual = child.charSpec.validChars === charSpec.validChars;
							isEqual = isEqual && child.charSpec.invalidChars === charSpec.invalidChars;

							if (isEqual) { return child; }
						}
					},

					put: function(charSpec) {
						var state;

						// If the character specification already exists in a child of the current
						// state, just return that state.
						if (state = this.get(charSpec)) { return state; }

						// Make a new state for the character spec
						state = new State(charSpec);

						// Insert the new state as a child of the current state
						this.nextStates.push(state);

						// If this character specification repeats, insert the new state as a child
						// of itself. Note that this will not trigger an infinite loop because each
						// transition during recognition consumes a character.
						if (charSpec.repeat) {
							state.nextStates.push(state);
						}

						// Return the new state
						return state;
					},

					// Find a list of child states matching the next character
					match: function(char) {
						// DEBUG "Processing `" + char + "`:"
						var nextStates = this.nextStates,
							child, charSpec, chars;

						// DEBUG "  " + debugState(this)
						var returned = [];

						for (var i=0, l=nextStates.length; i<l; i++) {
							child = nextStates[i];

							charSpec = child.charSpec;

							if (typeof (chars = charSpec.validChars) !== 'undefined') {
								if (chars.indexOf(char) !== -1) { returned.push(child); }
							} else if (typeof (chars = charSpec.invalidChars) !== 'undefined') {
								if (chars.indexOf(char) === -1) { returned.push(child); }
							}
						}

						return returned;
					}

					/** IF DEBUG
					 , debug: function() {
        var charSpec = this.charSpec,
            debug = "[",
            chars = charSpec.validChars || charSpec.invalidChars;

        if (charSpec.invalidChars) { debug += "^"; }
        debug += chars;
        debug += "]";

        if (charSpec.repeat) { debug += "+"; }

        return debug;
      }
					 END IF **/
				};

				/** IF DEBUG
				 function debug(log) {
      console.log(log);
    }

				 function debugState(state) {
      return state.nextStates.map(function(n) {
        if (n.nextStates.length === 0) { return "( " + n.debug() + " [accepting] )"; }
        return "( " + n.debug() + " <then> " + n.nextStates.map(function(s) { return s.debug() }).join(" or ") + " )";
      }).join(", ")
    }
				 END IF **/

					// This is a somewhat naive strategy, but should work in a lot of cases
					// A better strategy would properly resolve /posts/:id/new and /posts/edit/:id
				function sortSolutions(states) {
					return states.sort(function(a, b) {
						if (a.types.stars !== b.types.stars) { return a.types.stars - b.types.stars; }
						if (a.types.dynamics !== b.types.dynamics) { return a.types.dynamics - b.types.dynamics; }
						if (a.types.statics !== b.types.statics) { return a.types.statics - b.types.statics; }

						return 0;
					});
				}

				function recognizeChar(states, char) {
					var nextStates = [];

					for (var i=0, l=states.length; i<l; i++) {
						var state = states[i];

						nextStates = nextStates.concat(state.match(char));
					}

					return nextStates;
				}

				function findHandler(state, path) {
					var handlers = state.handlers, regex = state.regex;
					var captures = path.match(regex), currentCapture = 1;
					var result = [];

					for (var i=0, l=handlers.length; i<l; i++) {
						var handler = handlers[i], names = handler.names, params = {};

						for (var j=0, m=names.length; j<m; j++) {
							params[names[j]] = captures[currentCapture++];
						}

						result.push({ handler: handler.handler, params: params, isDynamic: !!names.length });
					}

					return result;
				}

				function addSegment(currentState, segment) {
					segment.eachChar(function(char) {
						var state;

						currentState = currentState.put(char);
					});

					return currentState;
				}

				// The main interface

				var RouteRecognizer = function() {
					this.rootState = new State();
					this.names = {};
				};


				RouteRecognizer.prototype = {
					add: function(routes, options) {
						var currentState = this.rootState, regex = "^",
							types = { statics: 0, dynamics: 0, stars: 0 },
							handlers = [], allSegments = [], name;

						var isEmpty = true;

						for (var i=0, l=routes.length; i<l; i++) {
							var route = routes[i], names = [];

							var segments = parse(route.path, names, types);

							allSegments = allSegments.concat(segments);

							for (var j=0, m=segments.length; j<m; j++) {
								var segment = segments[j];

								if (segment instanceof EpsilonSegment) { continue; }

								isEmpty = false;

								// Add a "/" for the new segment
								currentState = currentState.put({ validChars: "/" });
								regex += "/";

								// Add a representation of the segment to the NFA and regex
								currentState = addSegment(currentState, segment);
								regex += segment.regex();
							}

							handlers.push({ handler: route.handler, names: names });
						}

						if (isEmpty) {
							currentState = currentState.put({ validChars: "/" });
							regex += "/";
						}

						currentState.handlers = handlers;
						currentState.regex = new RegExp(regex + "$");
						currentState.types = types;

						if (name = options && options.as) {
							this.names[name] = {
								segments: allSegments,
								handlers: handlers
							};
						}
					},

					handlersFor: function(name) {
						var route = this.names[name], result = [];
						if (!route) { throw new Error("There is no route named " + name); }

						for (var i=0, l=route.handlers.length; i<l; i++) {
							result.push(route.handlers[i]);
						}

						return result;
					},

					hasRoute: function(name) {
						return !!this.names[name];
					},

					generate: function(name, params) {
						var route = this.names[name], output = "";
						if (!route) { throw new Error("There is no route named " + name); }

						var segments = route.segments;

						for (var i=0, l=segments.length; i<l; i++) {
							var segment = segments[i];

							if (segment instanceof EpsilonSegment) { continue; }

							output += "/";
							output += segment.generate(params);
						}

						if (output.charAt(0) !== '/') { output = '/' + output; }

						return output;
					},

					recognize: function(path) {
						var states = [ this.rootState ],
							pathLen, i, l;

						// DEBUG GROUP path

						if (path.charAt(0) !== "/") { path = "/" + path; }

						pathLen = path.length;
						if (pathLen > 1 && path.charAt(pathLen - 1) === "/") {
							path = path.substr(0, pathLen - 1);
						}

						for (i=0, l=path.length; i<l; i++) {
							states = recognizeChar(states, path.charAt(i));
							if (!states.length) { break; }
						}

						// END DEBUG GROUP

						var solutions = [];
						for (i=0, l=states.length; i<l; i++) {
							if (states[i].handlers) { solutions.push(states[i]); }
						}

						states = sortSolutions(solutions);

						var state = solutions[0];

						if (state && state.handlers) {
							return findHandler(state, path);
						}
					}
				};

				function Target(path, matcher, delegate) {
					this.path = path;
					this.matcher = matcher;
					this.delegate = delegate;
				}

				Target.prototype = {
					to: function(target, callback) {
						var delegate = this.delegate;

						if (delegate && delegate.willAddRoute) {
							target = delegate.willAddRoute(this.matcher.target, target);
						}

						this.matcher.add(this.path, target);

						if (callback) {
							if (callback.length === 0) { throw new Error("You must have an argument in the function passed to `to`"); }
							this.matcher.addChild(this.path, target, callback, this.delegate);
						}
					}
				};

				function Matcher(target) {
					this.routes = {};
					this.children = {};
					this.target = target;
				}

				Matcher.prototype = {
					add: function(path, handler) {
						this.routes[path] = handler;
					},

					addChild: function(path, target, callback, delegate) {
						var matcher = new Matcher(target);
						this.children[path] = matcher;

						var match = generateMatch(path, matcher, delegate);

						if (delegate && delegate.contextEntered) {
							delegate.contextEntered(target, match);
						}

						callback(match);
					}
				};

				function generateMatch(startingPath, matcher, delegate) {
					return function(path, nestedCallback) {
						var fullPath = startingPath + path;

						if (nestedCallback) {
							nestedCallback(generateMatch(fullPath, matcher, delegate));
						} else {
							return new Target(startingPath + path, matcher, delegate);
						}
					};
				}

				function addRoute(routeArray, path, handler) {
					var len = 0;
					for (var i=0, l=routeArray.length; i<l; i++) {
						len += routeArray[i].path.length;
					}

					path = path.substr(len);
					routeArray.push({ path: path, handler: handler });
				}

				function eachRoute(baseRoute, matcher, callback, binding) {
					var routes = matcher.routes;

					for (var path in routes) {
						if (routes.hasOwnProperty(path)) {
							var routeArray = baseRoute.slice();
							addRoute(routeArray, path, routes[path]);

							if (matcher.children[path]) {
								eachRoute(routeArray, matcher.children[path], callback, binding);
							} else {
								callback.call(binding, routeArray);
							}
						}
					}
				}

				RouteRecognizer.prototype.map = function(callback, addRouteCallback) {
					var matcher = new Matcher();

					callback(generateMatch("", matcher, this.delegate));

					eachRoute([], matcher, function(route) {
						if (addRouteCallback) { addRouteCallback(this, route); }
						else { this.add(route); }
					}, this);
				};
				return RouteRecognizer;
			});

	})();



	(function() {
		define("router",
			["route-recognizer","rsvp"],
			function(RouteRecognizer, RSVP) {
				"use strict";
				/**
				 @private

				 This file references several internal structures:

				 ## `RecognizedHandler`

				 * `{String} handler`: A handler name
				 * `{Object} params`: A hash of recognized parameters

				 ## `HandlerInfo`

				 * `{Boolean} isDynamic`: whether a handler has any dynamic segments
				 * `{String} name`: the name of a handler
				 * `{Object} handler`: a handler object
				 * `{Object} context`: the active context for the handler
				 */


				var slice = Array.prototype.slice;



				/**
				 @private

				 A Transition is a thennable (a promise-like object) that represents
				 an attempt to transition to another route. It can be aborted, either
				 explicitly via `abort` or by attempting another transition while a
				 previous one is still underway. An aborted transition can also
				 be `retry()`d later.
				 */

				function Transition(router, promise) {
					this.router = router;
					this.promise = promise;
					this.data = {};
					this.resolvedModels = {};
					this.providedModels = {};
					this.providedModelsArray = [];
					this.sequence = ++Transition.currentSequence;
					this.params = {};
				}

				Transition.currentSequence = 0;

				Transition.prototype = {
					targetName: null,
					urlMethod: 'update',
					providedModels: null,
					resolvedModels: null,
					params: null,

					/**
					 The Transition's internal promise. Calling `.then` on this property
					 is that same as calling `.then` on the Transition object itself, but
					 this property is exposed for when you want to pass around a
					 Transition's promise, but not the Transition object itself, since
					 Transition object can be externally `abort`ed, while the promise
					 cannot.
					 */
					promise: null,

					/**
					 Custom state can be stored on a Transition's `data` object.
					 This can be useful for decorating a Transition within an earlier
					 hook and shared with a later hook. Properties set on `data` will
					 be copied to new transitions generated by calling `retry` on this
					 transition.
					 */
					data: null,

					/**
					 A standard promise hook that resolves if the transition
					 succeeds and rejects if it fails/redirects/aborts.

					 Forwards to the internal `promise` property which you can
					 use in situations where you want to pass around a thennable,
					 but not the Transition itself.

					 @param {Function} success
					 @param {Function} failure
					 */
					then: function(success, failure) {
						return this.promise.then(success, failure);
					},

					/**
					 Aborts the Transition. Note you can also implicitly abort a transition
					 by initiating another transition while a previous one is underway.
					 */
					abort: function() {
						if (this.isAborted) { return this; }
						log(this.router, this.sequence, this.targetName + ": transition was aborted");
						this.isAborted = true;
						this.router.activeTransition = null;
						return this;
					},

					/**
					 Retries a previously-aborted transition (making sure to abort the
					 transition if it's still active). Returns a new transition that
					 represents the new attempt to transition.
					 */
					retry: function() {
						this.abort();

						var recogHandlers = this.router.recognizer.handlersFor(this.targetName),
							newTransition = performTransition(this.router, recogHandlers, this.providedModelsArray, this.params, this.data);

						return newTransition;
					},

					/**
					 Sets the URL-changing method to be employed at the end of a
					 successful transition. By default, a new Transition will just
					 use `updateURL`, but passing 'replace' to this method will
					 cause the URL to update using 'replaceWith' instead. Omitting
					 a parameter will disable the URL change, allowing for transitions
					 that don't update the URL at completion (this is also used for
					 handleURL, since the URL has already changed before the
					 transition took place).

					 @param {String} method the type of URL-changing method to use
					 at the end of a transition. Accepted values are 'replace',
					 falsy values, or any other non-falsy value (which is
					 interpreted as an updateURL transition).

					 @return {Transition} this transition
					 */
					method: function(method) {
						this.urlMethod = method;
						return this;
					}
				};

				function Router() {
					this.recognizer = new RouteRecognizer();
				}



				/**
				 Promise reject reasons passed to promise rejection
				 handlers for failed transitions.
				 */
				Router.UnrecognizedURLError = function(message) {
					this.message = (message || "UnrecognizedURLError");
					this.name = "UnrecognizedURLError";
				};

				Router.TransitionAborted = function(message) {
					this.message = (message || "TransitionAborted");
					this.name = "TransitionAborted";
				};

				function errorTransition(router, reason) {
					return new Transition(router, RSVP.reject(reason));
				}


				Router.prototype = {
					/**
					 The main entry point into the router. The API is essentially
					 the same as the `map` method in `route-recognizer`.

					 This method extracts the String handler at the last `.to()`
					 call and uses it as the name of the whole route.

					 @param {Function} callback
					 */
					map: function(callback) {
						this.recognizer.delegate = this.delegate;

						this.recognizer.map(callback, function(recognizer, route) {
							var lastHandler = route[route.length - 1].handler;
							var args = [route, { as: lastHandler }];
							recognizer.add.apply(recognizer, args);
						});
					},

					hasRoute: function(route) {
						return this.recognizer.hasRoute(route);
					},

					/**
					 Clears the current and target route handlers and triggers exit
					 on each of them starting at the leaf and traversing up through
					 its ancestors.
					 */
					reset: function() {
						eachHandler(this.currentHandlerInfos || [], function(handlerInfo) {
							var handler = handlerInfo.handler;
							if (handler.exit) {
								handler.exit();
							}
						});
						this.currentHandlerInfos = null;
						this.targetHandlerInfos = null;
					},

					activeTransition: null,

					/**
					 var handler = handlerInfo.handler;
					 The entry point for handling a change to the URL (usually
					 via the back and forward button).

					 Returns an Array of handlers and the parameters associated
					 with those parameters.

					 @param {String} url a URL to process

					 @return {Array} an Array of `[handler, parameter]` tuples
					 */
					handleURL: function(url) {
						// Perform a URL-based transition, but don't change
						// the URL afterward, since it already happened.
						var args = slice.call(arguments);
						if (url.charAt(0) !== '/') { args[0] = '/' + url; }
						return doTransition(this, args).method(null);
					},

					/**
					 Hook point for updating the URL.

					 @param {String} url a URL to update to
					 */
					updateURL: function() {
						throw new Error("updateURL is not implemented");
					},

					/**
					 Hook point for replacing the current URL, i.e. with replaceState

					 By default this behaves the same as `updateURL`

					 @param {String} url a URL to update to
					 */
					replaceURL: function(url) {
						this.updateURL(url);
					},

					/**
					 Transition into the specified named route.

					 If necessary, trigger the exit callback on any handlers
					 that are no longer represented by the target route.

					 @param {String} name the name of the route
					 */
					transitionTo: function(name) {
						return doTransition(this, arguments);
					},

					/**
					 Identical to `transitionTo` except that the current URL will be replaced
					 if possible.

					 This method is intended primarily for use with `replaceState`.

					 @param {String} name the name of the route
					 */
					replaceWith: function(name) {
						return doTransition(this, arguments).method('replace');
					},

					/**
					 @private

					 This method takes a handler name and a list of contexts and returns
					 a serialized parameter hash suitable to pass to `recognizer.generate()`.

					 @param {String} handlerName
					 @param {Array[Object]} contexts
					 @return {Object} a serialized parameter hash
					 */
					paramsForHandler: function(handlerName, contexts) {
						return paramsForHandler(this, handlerName, slice.call(arguments, 1));
					},

					/**
					 Take a named route and context objects and generate a
					 URL.

					 @param {String} name the name of the route to generate
					 a URL for
					 @param {...Object} objects a list of objects to serialize

					 @return {String} a URL
					 */
					generate: function(handlerName) {
						var params = paramsForHandler(this, handlerName, slice.call(arguments, 1));
						return this.recognizer.generate(handlerName, params);
					},

					isActive: function(handlerName) {
						var contexts = slice.call(arguments, 1);

						var targetHandlerInfos = this.targetHandlerInfos,
							found = false, names, object, handlerInfo, handlerObj;

						if (!targetHandlerInfos) { return false; }

						var recogHandlers = this.recognizer.handlersFor(targetHandlerInfos[targetHandlerInfos.length - 1].name);

						for (var i=targetHandlerInfos.length-1; i>=0; i--) {
							handlerInfo = targetHandlerInfos[i];
							if (handlerInfo.name === handlerName) { found = true; }

							if (found) {
								if (contexts.length === 0) { break; }

								if (handlerInfo.isDynamic) {
									object = contexts.pop();

									if (isParam(object)) {
										var recogHandler = recogHandlers[i], name = recogHandler.names[0];
										if ("" + object !== this.currentParams[name]) { return false; }
									} else if (handlerInfo.context !== object) {
										return false;
									}
								}
							}
						}

						return contexts.length === 0 && found;
					},

					trigger: function(name) {
						var args = slice.call(arguments);
						trigger(this, this.currentHandlerInfos, false, args);
					},

					/**
					 Hook point for logging transition status updates.

					 @param {String} message The message to log.
					 */
					log: null
				};

				/**
				 @private

				 Used internally for both URL and named transition to determine
				 a shared pivot parent route and other data necessary to perform
				 a transition.
				 */
				function getMatchPoint(router, handlers, objects, inputParams) {

					var matchPoint = handlers.length,
						providedModels = {}, i,
						currentHandlerInfos = router.currentHandlerInfos || [],
						params = {},
						oldParams = router.currentParams || {},
						activeTransition = router.activeTransition,
						handlerParams = {},
						obj;

					objects = slice.call(objects);
					merge(params, inputParams);

					for (i = handlers.length - 1; i >= 0; i--) {
						var handlerObj = handlers[i],
							handlerName = handlerObj.handler,
							oldHandlerInfo = currentHandlerInfos[i],
							hasChanged = false;

						// Check if handler names have changed.
						if (!oldHandlerInfo || oldHandlerInfo.name !== handlerObj.handler) { hasChanged = true; }

						if (handlerObj.isDynamic) {
							// URL transition.

							if (obj = getMatchPointObject(objects, handlerName, activeTransition, true, params)) {
								hasChanged = true;
								providedModels[handlerName] = obj;
							} else {
								handlerParams[handlerName] = {};
								for (var prop in handlerObj.params) {
									if (!handlerObj.params.hasOwnProperty(prop)) { continue; }
									var newParam = handlerObj.params[prop];
									if (oldParams[prop] !== newParam) { hasChanged = true; }
									handlerParams[handlerName][prop] = params[prop] = newParam;
								}
							}
						} else if (handlerObj.hasOwnProperty('names')) {
							// Named transition.

							if (objects.length) { hasChanged = true; }

							if (obj = getMatchPointObject(objects, handlerName, activeTransition, handlerObj.names[0], params)) {
								providedModels[handlerName] = obj;
							} else {
								var names = handlerObj.names;
								handlerParams[handlerName] = {};
								for (var j = 0, len = names.length; j < len; ++j) {
									var name = names[j];
									handlerParams[handlerName][name] = params[name] = params[name] || oldParams[name];
								}
							}
						}

						if (hasChanged) { matchPoint = i; }
					}

					if (objects.length > 0) {
						throw new Error("More context objects were passed than there are dynamic segments for the route: " + handlers[handlers.length - 1].handler);
					}

					return { matchPoint: matchPoint, providedModels: providedModels, params: params, handlerParams: handlerParams };
				}

				function getMatchPointObject(objects, handlerName, activeTransition, paramName, params) {

					if (objects.length && paramName) {

						var object = objects.pop();

						// If provided object is string or number, treat as param.
						if (isParam(object)) {
							params[paramName] = object.toString();
						} else {
							return object;
						}
					} else if (activeTransition) {
						// Use model from previous transition attempt, preferably the resolved one.
						return activeTransition.resolvedModels[handlerName] ||
							(paramName && activeTransition.providedModels[handlerName]);
					}
				}

				function isParam(object) {
					return (typeof object === "string" || object instanceof String || !isNaN(object));
				}

				/**
				 @private

				 This method takes a handler name and a list of contexts and returns
				 a serialized parameter hash suitable to pass to `recognizer.generate()`.

				 @param {Router} router
				 @param {String} handlerName
				 @param {Array[Object]} objects
				 @return {Object} a serialized parameter hash
				 */
				function paramsForHandler(router, handlerName, objects) {

					var handlers = router.recognizer.handlersFor(handlerName),
						params = {},
						matchPoint = getMatchPoint(router, handlers, objects).matchPoint,
						object, handlerObj, handler, names, i;

					for (i=0; i<handlers.length; i++) {
						handlerObj = handlers[i];
						handler = router.getHandler(handlerObj.handler);
						names = handlerObj.names;

						// If it's a dynamic segment
						if (names.length) {
							// If we have objects, use them
							if (i >= matchPoint) {
								object = objects.shift();
								// Otherwise use existing context
							} else {
								object = handler.context;
							}

							// Serialize to generate params
							merge(params, serialize(handler, object, names));
						}
					}
					return params;
				}

				function merge(hash, other) {
					for (var prop in other) {
						if (other.hasOwnProperty(prop)) { hash[prop] = other[prop]; }
					}
				}

				/**
				 @private
				 */
				function createNamedTransition(router, args) {
					var handlers = router.recognizer.handlersFor(args[0]);

					log(router, "Attempting transition to " + args[0]);

					return performTransition(router, handlers, slice.call(args, 1), router.currentParams);
				}

				/**
				 @private
				 */
				function createURLTransition(router, url) {

					var results = router.recognizer.recognize(url),
						currentHandlerInfos = router.currentHandlerInfos;

					log(router, "Attempting URL transition to " + url);

					if (!results) {
						return errorTransition(router, new Router.UnrecognizedURLError(url));
					}

					return performTransition(router, results, [], {});
				}


				/**
				 @private

				 Takes an Array of `HandlerInfo`s, figures out which ones are
				 exiting, entering, or changing contexts, and calls the
				 proper handler hooks.

				 For example, consider the following tree of handlers. Each handler is
				 followed by the URL segment it handles.

				 ```
				 |~index ("/")
				 | |~posts ("/posts")
				 | | |-showPost ("/:id")
				 | | |-newPost ("/new")
				 | | |-editPost ("/edit")
				 | |~about ("/about/:id")
				 ```

				 Consider the following transitions:

				 1. A URL transition to `/posts/1`.
				 1. Triggers the `*model` callbacks on the
				 `index`, `posts`, and `showPost` handlers
				 2. Triggers the `enter` callback on the same
				 3. Triggers the `setup` callback on the same
				 2. A direct transition to `newPost`
				 1. Triggers the `exit` callback on `showPost`
				 2. Triggers the `enter` callback on `newPost`
				 3. Triggers the `setup` callback on `newPost`
				 3. A direct transition to `about` with a specified
				 context object
				 1. Triggers the `exit` callback on `newPost`
				 and `posts`
				 2. Triggers the `serialize` callback on `about`
				 3. Triggers the `enter` callback on `about`
				 4. Triggers the `setup` callback on `about`

				 @param {Transition} transition
				 @param {Array[HandlerInfo]} handlerInfos
				 */
				function setupContexts(transition, handlerInfos) {
					var router = transition.router,
						partition = partitionHandlers(router.currentHandlerInfos || [], handlerInfos);

					router.targetHandlerInfos = handlerInfos;

					eachHandler(partition.exited, function(handlerInfo) {
						var handler = handlerInfo.handler;
						delete handler.context;
						if (handler.exit) { handler.exit(); }
					});

					var currentHandlerInfos = partition.unchanged.slice();
					router.currentHandlerInfos = currentHandlerInfos;

					eachHandler(partition.updatedContext, function(handlerInfo) {
						handlerEnteredOrUpdated(transition, currentHandlerInfos, handlerInfo, false);
					});

					eachHandler(partition.entered, function(handlerInfo) {
						handlerEnteredOrUpdated(transition, currentHandlerInfos, handlerInfo, true);
					});
				}

				/**
				 @private

				 Helper method used by setupContexts. Handles errors or redirects
				 that may happen in enter/setup.
				 */
				function handlerEnteredOrUpdated(transition, currentHandlerInfos, handlerInfo, enter) {
					var handler = handlerInfo.handler,
						context = handlerInfo.context;

					try {
						if (enter && handler.enter) { handler.enter(); }
						checkAbort(transition);

						setContext(handler, context);

						if (handler.setup) { handler.setup(context); }
						checkAbort(transition);
					} catch(e) {
						if (!(e instanceof Router.TransitionAborted)) {
							// Trigger the `error` event starting from this failed handler.
							trigger(transition.router, currentHandlerInfos.concat(handlerInfo), true, ['error', e, transition]);
						}

						// Propagate the error so that the transition promise will reject.
						throw e;
					}

					currentHandlerInfos.push(handlerInfo);
				}


				/**
				 @private

				 Iterates over an array of `HandlerInfo`s, passing the handler
				 and context into the callback.

				 @param {Array[HandlerInfo]} handlerInfos
				 @param {Function(Object, Object)} callback
				 */
				function eachHandler(handlerInfos, callback) {
					for (var i=0, l=handlerInfos.length; i<l; i++) {
						callback(handlerInfos[i]);
					}
				}

				/**
				 @private

				 This function is called when transitioning from one URL to
				 another to determine which handlers are not longer active,
				 which handlers are newly active, and which handlers remain
				 active but have their context changed.

				 Take a list of old handlers and new handlers and partition
				 them into four buckets:

				 * unchanged: the handler was active in both the old and
				 new URL, and its context remains the same
				 * updated context: the handler was active in both the
				 old and new URL, but its context changed. The handler's
				 `setup` method, if any, will be called with the new
				 context.
				 * exited: the handler was active in the old URL, but is
				 no longer active.
				 * entered: the handler was not active in the old URL, but
				 is now active.

				 The PartitionedHandlers structure has four fields:

				 * `updatedContext`: a list of `HandlerInfo` objects that
				 represent handlers that remain active but have a changed
				 context
				 * `entered`: a list of `HandlerInfo` objects that represent
				 handlers that are newly active
				 * `exited`: a list of `HandlerInfo` objects that are no
				 longer active.
				 * `unchanged`: a list of `HanderInfo` objects that remain active.

				 @param {Array[HandlerInfo]} oldHandlers a list of the handler
				 information for the previous URL (or `[]` if this is the
				 first handled transition)
				 @param {Array[HandlerInfo]} newHandlers a list of the handler
				 information for the new URL

				 @return {Partition}
				 */
				function partitionHandlers(oldHandlers, newHandlers) {
					var handlers = {
						updatedContext: [],
						exited: [],
						entered: [],
						unchanged: []
					};

					var handlerChanged, contextChanged, i, l;

					for (i=0, l=newHandlers.length; i<l; i++) {
						var oldHandler = oldHandlers[i], newHandler = newHandlers[i];

						if (!oldHandler || oldHandler.handler !== newHandler.handler) {
							handlerChanged = true;
						}

						if (handlerChanged) {
							handlers.entered.push(newHandler);
							if (oldHandler) { handlers.exited.unshift(oldHandler); }
						} else if (contextChanged || oldHandler.context !== newHandler.context) {
							contextChanged = true;
							handlers.updatedContext.push(newHandler);
						} else {
							handlers.unchanged.push(oldHandler);
						}
					}

					for (i=newHandlers.length, l=oldHandlers.length; i<l; i++) {
						handlers.exited.unshift(oldHandlers[i]);
					}

					return handlers;
				}

				function trigger(router, handlerInfos, ignoreFailure, args) {
					if (router.triggerEvent) {
						router.triggerEvent(handlerInfos, ignoreFailure, args);
						return;
					}

					var name = args.shift();

					if (!handlerInfos) {
						if (ignoreFailure) { return; }
						throw new Error("Could not trigger event '" + name + "'. There are no active handlers");
					}

					var eventWasHandled = false;

					for (var i=handlerInfos.length-1; i>=0; i--) {
						var handlerInfo = handlerInfos[i],
							handler = handlerInfo.handler;

						if (handler.events && handler.events[name]) {
							if (handler.events[name].apply(handler, args) === true) {
								eventWasHandled = true;
							} else {
								return;
							}
						}
					}

					if (!eventWasHandled && !ignoreFailure) {
						throw new Error("Nothing handled the event '" + name + "'.");
					}
				}

				function setContext(handler, context) {
					handler.context = context;
					if (handler.contextDidChange) { handler.contextDidChange(); }
				}

				/**
				 @private

				 Creates, begins, and returns a Transition.
				 */
				function performTransition(router, recogHandlers, providedModelsArray, params, data) {

					var matchPointResults = getMatchPoint(router, recogHandlers, providedModelsArray, params),
						targetName = recogHandlers[recogHandlers.length - 1].handler,
						wasTransitioning = false,
						currentHandlerInfos = router.currentHandlerInfos;

					// Check if there's already a transition underway.
					if (router.activeTransition) {
						if (transitionsIdentical(router.activeTransition, targetName, providedModelsArray)) {
							return router.activeTransition;
						}
						router.activeTransition.abort();
						wasTransitioning = true;
					}

					var deferred = RSVP.defer(),
						transition = new Transition(router, deferred.promise);

					transition.targetName = targetName;
					transition.providedModels = matchPointResults.providedModels;
					transition.providedModelsArray = providedModelsArray;
					transition.params = matchPointResults.params;
					transition.data = data || {};
					router.activeTransition = transition;

					var handlerInfos = generateHandlerInfos(router, recogHandlers);

					// Fire 'willTransition' event on current handlers, but don't fire it
					// if a transition was already underway.
					if (!wasTransitioning) {
						trigger(router, currentHandlerInfos, true, ['willTransition', transition]);
					}

					log(router, transition.sequence, "Beginning validation for transition to " + transition.targetName);
					validateEntry(transition, handlerInfos, 0, matchPointResults.matchPoint, matchPointResults.handlerParams)
						.then(transitionSuccess, transitionFailure);

					return transition;

					function transitionSuccess() {
						checkAbort(transition);

						try {
							log(router, transition.sequence, "Validation succeeded, finalizing transition;");

							// Don't overwrite contexts / update URL if this was a noop transition.
							if (!currentHandlerInfos || !currentHandlerInfos.length ||
								!router.recognizer.hasRoute(currentHandlerInfos[currentHandlerInfos.length - 1].name) ||
								currentHandlerInfos.length !== matchPointResults.matchPoint) {
								finalizeTransition(transition, handlerInfos);
							}

							if (router.didTransition) {
								router.didTransition(handlerInfos);
							}

							log(router, transition.sequence, "TRANSITION COMPLETE.");

							// Resolve with the final handler.
							deferred.resolve(handlerInfos[handlerInfos.length - 1].handler);
						} catch(e) {
							deferred.reject(e);
						}

						// Don't nullify if another transition is underway (meaning
						// there was a transition initiated with enter/setup).
						if (!transition.isAborted) {
							router.activeTransition = null;
						}
					}

					function transitionFailure(reason) {
						deferred.reject(reason);
					}
				}

				/**
				 @private

				 Accepts handlers in Recognizer format, either returned from
				 recognize() or handlersFor(), and returns unified
				 `HandlerInfo`s.
				 */
				function generateHandlerInfos(router, recogHandlers) {
					var handlerInfos = [];
					for (var i = 0, len = recogHandlers.length; i < len; ++i) {
						var handlerObj = recogHandlers[i],
							isDynamic = handlerObj.isDynamic || (handlerObj.names && handlerObj.names.length);

						handlerInfos.push({
							isDynamic: !!isDynamic,
							name: handlerObj.handler,
							handler: router.getHandler(handlerObj.handler)
						});
					}
					return handlerInfos;
				}

				/**
				 @private
				 */
				function transitionsIdentical(oldTransition, targetName, providedModelsArray) {

					if (oldTransition.targetName !== targetName) { return false; }

					var oldModels = oldTransition.providedModelsArray;
					if (oldModels.length !== providedModelsArray.length) { return false; }

					for (var i = 0, len = oldModels.length; i < len; ++i) {
						if (oldModels[i] !== providedModelsArray[i]) { return false; }
					}
					return true;
				}

				/**
				 @private

				 Updates the URL (if necessary) and calls `setupContexts`
				 to update the router's array of `currentHandlerInfos`.
				 */
				function finalizeTransition(transition, handlerInfos) {

					var router = transition.router,
						seq = transition.sequence,
						handlerName = handlerInfos[handlerInfos.length - 1].name;

					// Collect params for URL.
					var objects = [], providedModels = transition.providedModelsArray.slice();
					for (var i = handlerInfos.length - 1; i>=0; --i) {
						var handlerInfo = handlerInfos[i];
						if (handlerInfo.isDynamic) {
							var providedModel = providedModels.pop();
							objects.unshift(isParam(providedModel) ? providedModel.toString() : handlerInfo.context);
						}
					}

					var params = paramsForHandler(router, handlerName, objects);

					router.currentParams = params;

					var urlMethod = transition.urlMethod;
					if (urlMethod) {
						var url = router.recognizer.generate(handlerName, params);

						if (urlMethod === 'replace') {
							router.replaceURL(url);
						} else {
							// Assume everything else is just a URL update for now.
							router.updateURL(url);
						}
					}

					setupContexts(transition, handlerInfos);
				}

				/**
				 @private

				 Internal function used to construct the chain of promises used
				 to validate a transition. Wraps calls to `beforeModel`, `model`,
				 and `afterModel` in promises, and checks for redirects/aborts
				 between each.
				 */
				function validateEntry(transition, handlerInfos, index, matchPoint, handlerParams) {

					if (index === handlerInfos.length) {
						// No more contexts to resolve.
						return RSVP.resolve(transition.resolvedModels);
					}

					var router = transition.router,
						handlerInfo = handlerInfos[index],
						handler = handlerInfo.handler,
						handlerName = handlerInfo.name,
						seq = transition.sequence;

					if (index < matchPoint) {
						log(router, seq, handlerName + ": using context from already-active handler");

						// We're before the match point, so don't run any hooks,
						// just use the already resolved context from the handler.
						transition.resolvedModels[handlerInfo.name] =
							transition.providedModels[handlerInfo.name] ||
								handlerInfo.handler.context;
						return proceed();
					}

					return RSVP.resolve().then(handleAbort)
						.then(beforeModel)
						.then(handleAbort)
						.then(model)
						.then(handleAbort)
						.then(afterModel)
						.then(handleAbort)
						.then(null, handleError)
						.then(proceed);

					function handleAbort(result) {
						if (transition.isAborted) {
							log(transition.router, transition.sequence, "detected abort.");
							return RSVP.reject(new Router.TransitionAborted());
						}

						return result;
					}

					function handleError(reason) {
						if (reason instanceof Router.TransitionAborted) {
							// if the transition was aborted and *no additional* error was thrown,
							// reject with the Router.TransitionAborted instance
							return RSVP.reject(reason);
						}

						// otherwise, we're here because of a different error
						transition.abort();

						log(router, seq, handlerName + ": handling error: " + reason);

						// An error was thrown / promise rejected, so fire an
						// `error` event from this handler info up to root.
						trigger(router, handlerInfos.slice(0, index + 1), true, ['error', reason, transition]);

						// Propagate the original error.
						return RSVP.reject(reason);
					}

					function beforeModel() {

						log(router, seq, handlerName + ": calling beforeModel hook");

						var p = handler.beforeModel && handler.beforeModel(transition);
						return (p instanceof Transition) ? null : p;
					}

					function model() {
						log(router, seq, handlerName + ": resolving model");

						var p = getModel(handlerInfo, transition, handlerParams[handlerName], index >= matchPoint);
						return (p instanceof Transition) ? null : p;
					}

					function afterModel(context) {

						log(router, seq, handlerName + ": calling afterModel hook");

						// Pass the context and resolved parent contexts to afterModel, but we don't
						// want to use the value returned from `afterModel` in any way, but rather
						// always resolve with the original `context` object.

						transition.resolvedModels[handlerInfo.name] = context;

						var p = handler.afterModel && handler.afterModel(context, transition);
						return (p instanceof Transition) ? null : p;
					}

					function proceed() {
						log(router, seq, handlerName + ": validation succeeded, proceeding");

						handlerInfo.context = transition.resolvedModels[handlerInfo.name];
						return validateEntry(transition, handlerInfos, index + 1, matchPoint, handlerParams);
					}
				}

				/**
				 @private

				 Throws a TransitionAborted if the provided transition has been aborted.
				 */
				function checkAbort(transition) {
					if (transition.isAborted) {
						log(transition.router, transition.sequence, "detected abort.");
						throw new Router.TransitionAborted();
					}
				}

				/**
				 @private

				 Encapsulates the logic for whether to call `model` on a route,
				 or use one of the models provided to `transitionTo`.
				 */
				function getModel(handlerInfo, transition, handlerParams, needsUpdate) {

					var handler = handlerInfo.handler,
						handlerName = handlerInfo.name;

					if (!needsUpdate && handler.hasOwnProperty('context')) {
						return handler.context;
					}

					if (transition.providedModels.hasOwnProperty(handlerName)) {
						var providedModel = transition.providedModels[handlerName];
						return typeof providedModel === 'function' ? providedModel() : providedModel;
					}

					return handler.model && handler.model(handlerParams || {}, transition);
				}

				/**
				 @private
				 */
				function log(router, sequence, msg) {

					if (!router.log) { return; }

					if (arguments.length === 3) {
						router.log("Transition #" + sequence + ": " + msg);
					} else {
						msg = sequence;
						router.log(msg);
					}
				}

				/**
				 @private

				 Begins and returns a Transition based on the provided
				 arguments. Accepts arguments in the form of both URL
				 transitions and named transitions.

				 @param {Router} router
				 @param {Array[Object]} args arguments passed to transitionTo,
				 replaceWith, or handleURL
				 */
				function doTransition(router, args) {
					// Normalize blank transitions to root URL transitions.
					var name = args[0] || '/';

					if (name.charAt(0) === '/') {
						return createURLTransition(router, name);
					} else {
						return createNamedTransition(router, args);
					}
				}

				/**
				 @private

				 Serializes a handler using its custom `serialize` method or
				 by a default that looks up the expected property name from
				 the dynamic segment.

				 @param {Object} handler a router handler
				 @param {Object} model the model to be serialized for this handler
				 @param {Array[Object]} names the names array attached to an
				 handler object returned from router.recognizer.handlersFor()
				 */
				function serialize(handler, model, names) {

					var object = {};
					if (isParam(model)) {
						object[names[0]] = model;
						return object;
					}

					// Use custom serialize if it exists.
					if (handler.serialize) {
						return handler.serialize(model, names);
					}

					if (names.length !== 1) { return; }

					var name = names[0];

					if (/_id$/.test(name)) {
						object[name] = model.id;
					} else {
						object[name] = model;
					}
					return object;
				}


				return Router;
			});

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-routing
		 */

		function DSL(name) {
			this.parent = name;
			this.matches = [];
		}

		DSL.prototype = {
			resource: function(name, options, callback) {
				if (arguments.length === 2 && typeof options === 'function') {
					callback = options;
					options = {};
				}

				if (arguments.length === 1) {
					options = {};
				}

				if (typeof options.path !== 'string') {
					options.path = "/" + name;
				}

				if (callback) {
					var dsl = new DSL(name);
					callback.call(dsl);
					this.push(options.path, name, dsl.generate());
				} else {
					this.push(options.path, name);
				}
			},

			push: function(url, name, callback) {
				var parts = name.split('.');
				if (url === "" || url === "/" || parts[parts.length-1] === "index") { this.explicitIndex = true; }

				this.matches.push([url, name, callback]);
			},

			route: function(name, options) {


				options = options || {};

				if (typeof options.path !== 'string') {
					options.path = "/" + name;
				}

				if (this.parent && this.parent !== 'application') {
					name = this.parent + "." + name;
				}

				this.push(options.path, name);
			},

			generate: function() {
				var dslMatches = this.matches;

				if (!this.explicitIndex) {
					this.route("index", { path: "/" });
				}

				return function(match) {
					for (var i=0, l=dslMatches.length; i<l; i++) {
						var dslMatch = dslMatches[i];
						match(dslMatch[0]).to(dslMatch[1], dslMatch[2]);
					}
				};
			}
		};

		DSL.map = function(callback) {
			var dsl = new DSL();
			callback.call(dsl);
			return dsl;
		};

		Ember.RouterDSL = DSL;

	})();



	(function() {
		var get = Ember.get;

		/**
		 @module ember
		 @submodule ember-routing
		 */

		/**

		 Finds a controller instance.

		 @for Ember
		 @method controllerFor
		 @private
		 */
		Ember.controllerFor = function(container, controllerName, lookupOptions) {
			return container.lookup('controller:' + controllerName, lookupOptions);
		};

		/**
		 Generates a controller automatically if none was provided.
		 The type of generated controller depends on the context.
		 You can customize your generated controllers by defining
		 `App.ObjectController` and `App.ArrayController`

		 @for Ember
		 @method generateController
		 @private
		 */
		Ember.generateController = function(container, controllerName, context) {
			var ControllerFactory, fullName, instance, name, factoryName, controllerType;

			if (context && Ember.isArray(context)) {
				controllerType = 'array';
			} else if (context) {
				controllerType = 'object';
			} else {
				controllerType = 'basic';
			}

			factoryName = 'controller:' + controllerType;

			ControllerFactory = container.lookupFactory(factoryName).extend({
				isGenerated: true,
				toString: function() {
					return "(generated " + controllerName + " controller)";
				}
			});

			fullName = 'controller:' + controllerName;

			container.register(fullName, ControllerFactory);

			instance = container.lookup(fullName);

			if (get(instance, 'namespace.LOG_ACTIVE_GENERATION')) {
				Ember.Logger.info("generated -> " + fullName, { fullName: fullName });
			}

			return instance;
		};

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-routing
		 */

		var Router = requireModule("router");
		var get = Ember.get, set = Ember.set;
		var defineProperty = Ember.defineProperty;

		var DefaultView = Ember._MetamorphView;
		/**
		 The `Ember.Router` class manages the application state and URLs. Refer to
		 the [routing guide](http://emberjs.com/guides/routing/) for documentation.

		 @class Router
		 @namespace Ember
		 @extends Ember.Object
		 */
		Ember.Router = Ember.Object.extend({
			location: 'hash',

			init: function() {
				this.router = this.constructor.router || this.constructor.map(Ember.K);
				this._activeViews = {};
				this._setupLocation();
			},

			url: Ember.computed(function() {
				return get(this, 'location').getURL();
			}),

			startRouting: function() {
				this.router = this.router || this.constructor.map(Ember.K);

				var router = this.router,
					location = get(this, 'location'),
					container = this.container,
					self = this;

				this._setupRouter(router, location);

				container.register('view:default', DefaultView);
				container.register('view:toplevel', Ember.View.extend());

				location.onUpdateURL(function(url) {
					self.handleURL(url);
				});

				this.handleURL(location.getURL());
			},

			didTransition: function(infos) {
				var appController = this.container.lookup('controller:application'),
					path = Ember.Router._routePath(infos);

				if (!('currentPath' in appController)) { defineProperty(appController, 'currentPath'); }
				set(appController, 'currentPath', path);

				if (!('currentRouteName' in appController)) { defineProperty(appController, 'currentRouteName'); }
				set(appController, 'currentRouteName', infos[infos.length - 1].name);

				this.notifyPropertyChange('url');

				if (get(this, 'namespace').LOG_TRANSITIONS) {
					Ember.Logger.log("Transitioned into '" + path + "'");
				}
			},

			handleURL: function(url) {
				return this._doTransition('handleURL', [url]);
			},

			transitionTo: function() {
				return this._doTransition('transitionTo', arguments);
			},

			replaceWith: function() {
				return this._doTransition('replaceWith', arguments);
			},

			generate: function() {
				var url = this.router.generate.apply(this.router, arguments);
				return this.location.formatURL(url);
			},

			isActive: function(routeName) {
				var router = this.router;
				return router.isActive.apply(router, arguments);
			},

			send: function(name, context) {
				this.router.trigger.apply(this.router, arguments);
			},

			hasRoute: function(route) {
				return this.router.hasRoute(route);
			},

			/**
			 @private

			 Resets the state of the router by clearing the current route
			 handlers and deactivating them.

			 @method reset
			 */
			reset: function() {
				this.router.reset();
			},

			_lookupActiveView: function(templateName) {
				var active = this._activeViews[templateName];
				return active && active[0];
			},

			_connectActiveView: function(templateName, view) {
				var existing = this._activeViews[templateName];

				if (existing) {
					existing[0].off('willDestroyElement', this, existing[1]);
				}

				var disconnect = function() {
					delete this._activeViews[templateName];
				};

				this._activeViews[templateName] = [view, disconnect];
				view.one('willDestroyElement', this, disconnect);
			},

			_setupLocation: function() {
				var location = get(this, 'location'),
					rootURL = get(this, 'rootURL'),
					options = {};

				if (typeof rootURL === 'string') {
					options.rootURL = rootURL;
				}

				if ('string' === typeof location) {
					options.implementation = location;
					location = set(this, 'location', Ember.Location.create(options));
				}
			},

			_getHandlerFunction: function() {
				var seen = {}, container = this.container,
					DefaultRoute = container.lookupFactory('route:basic'),
					self = this;

				return function(name) {
					var routeName = 'route:' + name,
						handler = container.lookup(routeName);

					if (seen[name]) { return handler; }

					seen[name] = true;

					if (!handler) {
						if (name === 'loading') { return {}; }

						container.register(routeName, DefaultRoute.extend());
						handler = container.lookup(routeName);

						if (get(self, 'namespace.LOG_ACTIVE_GENERATION')) {
							Ember.Logger.info("generated -> " + routeName, { fullName: routeName });
						}
					}

					if (name === 'application') {
						// Inject default `error` handler.
						handler.events = handler.events || {};
						handler.events.error = handler.events.error || Ember.Router._defaultErrorHandler;
					}

					handler.routeName = name;
					return handler;
				};
			},

			_setupRouter: function(router, location) {
				var lastURL, emberRouter = this;

				router.getHandler = this._getHandlerFunction();

				var doUpdateURL = function() {
					location.setURL(lastURL);
				};

				router.updateURL = function(path) {
					lastURL = path;
					Ember.run.once(doUpdateURL);
				};

				if (location.replaceURL) {
					var doReplaceURL = function() {
						location.replaceURL(lastURL);
					};

					router.replaceURL = function(path) {
						lastURL = path;
						Ember.run.once(doReplaceURL);
					};
				}

				router.didTransition = function(infos) {
					emberRouter.didTransition(infos);
				};
			},

			_doTransition: function(method, args) {
				// Normalize blank route to root URL.
				args = [].slice.call(args);
				args[0] = args[0] || '/';

				var passedName = args[0], name, self = this;

				if (passedName.charAt(0) === '/') {
					name = passedName;
				} else {

					if (!this.router.hasRoute(passedName)) {
						name = args[0] = passedName + '.index';
					} else {
						name = passedName;
					}

				}

				var transitionPromise = this.router[method].apply(this.router, args);

				// Don't schedule loading state entry if user has already aborted the transition.
				if (this.router.activeTransition) {
					this._scheduleLoadingStateEntry();
				}

				transitionPromise.then(function(route) {
					self._transitionCompleted(route);
				}, function(error){

				});

				// We want to return the configurable promise object
				// so that callers of this function can use `.method()` on it,
				// which obviously doesn't exist for normal RSVP promises.
				return transitionPromise;
			},

			_scheduleLoadingStateEntry: function() {
				if (this._loadingStateActive) { return; }
				this._shouldEnterLoadingState = true;
				Ember.run.scheduleOnce('routerTransitions', this, this._enterLoadingState);
			},

			_enterLoadingState: function() {
				if (this._loadingStateActive || !this._shouldEnterLoadingState) { return; }

				var loadingRoute = this.router.getHandler('loading');
				if (loadingRoute) {
					if (loadingRoute.enter) { loadingRoute.enter(); }
					if (loadingRoute.setup) { loadingRoute.setup(); }
					this._loadingStateActive = true;
				}
			},

			_exitLoadingState: function () {
				this._shouldEnterLoadingState = false;
				if (!this._loadingStateActive) { return; }

				var loadingRoute = this.router.getHandler('loading');
				if (loadingRoute && loadingRoute.exit) { loadingRoute.exit(); }
				this._loadingStateActive = false;
			},

			_transitionCompleted: function(route) {
				this.notifyPropertyChange('url');
				this._exitLoadingState();
			}
		});

		function triggerEvent(handlerInfos, ignoreFailure, args) {
			var name = args.shift();

			if (!handlerInfos) {
				if (ignoreFailure) { return; }
				throw new Error("Could not trigger event '" + name + "'. There are no active handlers");
			}

			var eventWasHandled = false;

			for (var i=handlerInfos.length-1; i>=0; i--) {
				var handlerInfo = handlerInfos[i],
					handler = handlerInfo.handler;

				if (handler._actions && handler._actions[name]) {
					if (handler._actions[name].apply(handler, args) === true) {
						eventWasHandled = true;
					} else {
						return;
					}
				} else if (handler.events && handler.events[name]) {

					if (handler.events[name].apply(handler, args) === true) {
						eventWasHandled = true;
					} else {
						return;
					}
				}
			}

			if (!eventWasHandled && !ignoreFailure) {
				throw new Error("Nothing handled the event '" + name + "'.");
			}
		}

		Ember.Router.reopenClass({
			router: null,
			map: function(callback) {
				var router = this.router;
				if (!router) {
					router = new Router();
					router.callbacks = [];
					router.triggerEvent = triggerEvent;
					this.reopenClass({ router: router });
				}

				if (get(this, 'namespace.LOG_TRANSITIONS_INTERNAL')) {
					router.log = Ember.Logger.debug;
				}

				var dsl = Ember.RouterDSL.map(function() {
					this.resource('application', { path: "/" }, function() {
						for (var i=0; i < router.callbacks.length; i++) {
							router.callbacks[i].call(this);
						}
						callback.call(this);
					});
				});

				router.callbacks.push(callback);
				router.map(dsl.generate());
				return router;
			},

			_defaultErrorHandler: function(error, transition) {
				Ember.Logger.error('Error while loading route:', error);

				// Using setTimeout allows us to escape from the Promise's try/catch block
				setTimeout(function() { throw error; });
			},

			_routePath: function(handlerInfos) {
				var path = [];

				for (var i=1, l=handlerInfos.length; i<l; i++) {
					var name = handlerInfos[i].name,
						nameParts = name.split(".");

					path.push(nameParts[nameParts.length - 1]);
				}

				return path.join(".");
			}
		});


	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-routing
		 */

		var get = Ember.get, set = Ember.set,
			getProperties = Ember.getProperties,
			classify = Ember.String.classify,
			fmt = Ember.String.fmt,
			a_forEach = Ember.EnumerableUtils.forEach,
			a_replace = Ember.EnumerableUtils.replace;

		/**
		 The `Ember.Route` class is used to define individual routes. Refer to
		 the [routing guide](http://emberjs.com/guides/routing/) for documentation.

		 @class Route
		 @namespace Ember
		 @extends Ember.Object
		 */
		Ember.Route = Ember.Object.extend(Ember.ActionHandler, {
			/**
			 @private

			 @method exit
			 */
			exit: function() {
				this.deactivate();
				this.teardownViews();
			},

			/**
			 @private

			 @method enter
			 */
			enter: function() {
				this.activate();
			},

			/**
			 The collection of functions, keyed by name, available on this route as
			 action targets.

			 These functions will be invoked when a matching `{{action}}` is triggered
			 from within a template and the application's current route is this route.

			 Actions can also be invoked from other parts of your application via `Route#send`
			 or `Controller#send`.

			 The `actions` hash will inherit action handlers from
			 the `actions` hash defined on extended Route parent classes
			 or mixins rather than just replace the entire hash, e.g.:

			 ```js
			 App.CanDisplayBanner = Ember.Mixin.create({
      actions: {
        displayBanner: function(msg) {
          // ...
        }
      }
    });

			 App.WelcomeRoute = Ember.Route.extend(App.CanDisplayBanner, {
      actions: {
        playMusic: function() {
          // ...
        }
      }
    });

			 // `WelcomeRoute`, when active, will be able to respond
			 // to both actions, since the actions hash is merged rather
			 // then replaced when extending mixins / parent classes.
			 this.send('displayBanner');
			 this.send('playMusic');
			 ```

			 Within a route's action handler, the value of the `this` context
			 is the Route object:

			 ```js
			 App.SongRoute = Ember.Route.extend({
      actions: {
        myAction: function() {
          this.controllerFor("song");
          this.transitionTo("other.route");
          ...
        }
      }
    });
			 ```

			 It is also possible to call `this._super()` from within an
			 action handler if it overrides a handler defined on a parent
			 class or mixin:

			 Take for example the following routes:

			 ```js
			 App.DebugRoute = Ember.Mixin.create({
      actions: {
        debugRouteInformation: function() {
          console.debug("trololo");
        }
      }
    });

			 App.AnnoyingDebugRoute = Ember.Route.extend(App.DebugRoute, {
      actions: {
        debugRouteInformation: function() {
          // also call the debugRouteInformation of mixed in App.DebugRoute
          this._super();

          // show additional annoyance
          window.alert(...);
        }
      }
    });
			 ```

			 ## Bubbling

			 By default, an action will stop bubbling once a handler defined
			 on the `actions` hash handles it. To continue bubbling the action,
			 you must return `true` from the handler:

			 ```js
			 App.Router.map(function() {
      this.resource("album", function() {
        this.route("song");
      });
    });

			 App.AlbumRoute = Ember.Route.extend({
      actions: {
        startPlaying: function() {
        }
      }
    });

			 App.AlbumSongRoute = Ember.Route.extend({
      actions: {
        startPlaying: function() {
          // ...

          if (actionShouldAlsoBeTriggeredOnParentRoute) {
            return true;
          }
        }
      }
    });
			 ```

			 ## Built-in actions

			 There are a few built-in actions pertaining to transitions that you
			 can use to customize transition behavior: `willTransition` and
			 `error`.

			 ### `willTransition`

			 The `willTransition` action is fired at the beginning of any
			 attempted transition with a `Transition` object as the sole
			 argument. This action can be used for aborting, redirecting,
			 or decorating the transition from the currently active routes.

			 A good example is preventing navigation when a form is
			 half-filled out:

			 ```js
			 App.ContactFormRoute = Ember.Route.extend({
      actions: {
        willTransition: function(transition) {
          if (this.controller.get('userHasEnteredData')) {
            this.controller.displayNavigationConfirm();
            transition.abort();
          }
        }
      }
    });
			 ```

			 You can also redirect elsewhere by calling
			 `this.transitionTo('elsewhere')` from within `willTransition`.
			 Note that `willTransition` will not be fired for the
			 redirecting `transitionTo`, since `willTransition` doesn't
			 fire when there is already a transition underway. If you want
			 subsequent `willTransition` actions to fire for the redirecting
			 transition, you must first explicitly call
			 `transition.abort()`.

			 ### `error`

			 When attempting to transition into a route, any of the hooks
			 may throw an error, or return a promise that rejects, at which
			 point an `error` action will be fired on the partially-entered
			 routes, allowing for per-route error handling logic, or shared
			 error handling logic defined on a parent route.

			 Here is an example of an error handler that will be invoked
			 for rejected promises / thrown errors from the various hooks
			 on the route, as well as any unhandled errors from child
			 routes:

			 ```js
			 App.AdminRoute = Ember.Route.extend({
      beforeModel: function() {
        throw "bad things!";
        // ...or, equivalently:
        return Ember.RSVP.reject("bad things!");
      },

      actions: {
        error: function(error, transition) {
          // Assuming we got here due to the error in `beforeModel`,
          // we can expect that error === "bad things!",
          // but a promise model rejecting would also
          // call this hook, as would any errors encountered
          // in `afterModel`.

          // The `error` hook is also provided the failed
          // `transition`, which can be stored and later
          // `.retry()`d if desired.

          this.transitionTo('login');
        }
      }
    });
			 ```

			 `error` actions that bubble up all the way to `ApplicationRoute`
			 will fire a default error handler that logs the error. You can
			 specify your own global default error handler by overriding the
			 `error` handler on `ApplicationRoute`:

			 ```js
			 App.ApplicationRoute = Ember.Route.extend({
      actions: {
        error: function(error, transition) {
          this.controllerFor('banner').displayError(error.message);
        }
      }
    });
			 ```

			 @see {Ember.Route#send}
			 @see {Handlebars.helpers.action}

			 @property actions
			 @type Hash
			 @default null
			 */
			actions: null,

			/**
			 @deprecated

			 Please use `actions` instead.
			 */
			events: null,

			mergedProperties: ['events'],

			/**
			 This hook is executed when the router completely exits this route. It is
			 not executed when the model for the route changes.

			 @method deactivate
			 */
			deactivate: Ember.K,

			/**
			 This hook is executed when the router enters the route for the first time.
			 It is not executed when the model for the route changes.

			 @method activate
			 */
			activate: Ember.K,

			/**
			 Transition into another route. Optionally supply a model for the
			 route in question. The model will be serialized into the URL
			 using the `serialize` hook.

			 Example

			 ```javascript
			 App.Router.map(function() {
      this.route("index");
      this.route("secret");
      this.route("fourOhFour", { path: "*:"});
    });

			 App.IndexRoute = Ember.Route.extend({
      actions: {
        moveToSecret: function(context){
          if (authorized()){
            this.transitionTo('secret', context);
          }
            this.transitionTo('fourOhFour');
        }
      }
    });
			 ```

			 @method transitionTo
			 @param {String} name the name of the route
			 @param {...Object} models
			 */
			transitionTo: function(name, context) {
				var router = this.router;
				return router.transitionTo.apply(router, arguments);
			},

			/**
			 Transition into another route while replacing the current URL if
			 possible. Identical to `transitionTo` in all other respects.

			 Example

			 ```javascript
			 App.Router.map(function() {
      this.route("index");
      this.route("secret");
    });

			 App.SecretRoute = Ember.Route.extend({
      afterModel: function() {
        if (!authorized()){
          this.replaceWith('index');
        }
      }
    });
			 ```

			 @method replaceWith
			 @param {String} name the name of the route
			 @param {...Object} models
			 */
			replaceWith: function() {
				var router = this.router;
				return this.router.replaceWith.apply(this.router, arguments);
			},

			/**
			 Sends an action to the router, which will delegate it to the currently
			 active route hierarchy per the bubbling rules explained under `actions`.

			 Example

			 ```javascript
			 App.Router.map(function() {
      this.route("index");
    });

			 App.ApplicationRoute = Ember.Route.extend({
      actions: {
        track: function(arg) {
          console.log(arg, 'was clicked');
        }
      }
    });

			 App.IndexRoute = Ember.Route.extend({
      actions: {
        trackIfDebug: function(arg) {
          if (debug) {
            this.send('track', arg);
          }
        }
      }
    });
			 ```

			 @method send
			 @param {String} name the name of the action to trigger
			 @param {...*} args
			 */
			send: function() {
				return this.router.send.apply(this.router, arguments);
			},

			/**
			 @private

			 This hook is the entry point for router.js

			 @method setup
			 */
			setup: function(context) {
				var controllerName = this.controllerName || this.routeName,
					controller = this.controllerFor(controllerName, true);
				if (!controller) {
					controller =  this.generateController(controllerName, context);
				}

				// Assign the route's controller so that it can more easily be
				// referenced in action handlers
				this.controller = controller;

				if (this.setupControllers) {

					this.setupControllers(controller, context);
				} else {
					this.setupController(controller, context);
				}

				if (this.renderTemplates) {

					this.renderTemplates(context);
				} else {
					this.renderTemplate(controller, context);
				}
			},

			/**
			 @deprecated

			 A hook you can implement to optionally redirect to another route.

			 If you call `this.transitionTo` from inside of this hook, this route
			 will not be entered in favor of the other hook.

			 This hook is deprecated in favor of using the `afterModel` hook
			 for performing redirects after the model has resolved.

			 @method redirect
			 @param {Object} model the model for this route
			 */
			redirect: Ember.K,

			/**
			 This hook is the first of the route entry validation hooks
			 called when an attempt is made to transition into a route
			 or one of its children. It is called before `model` and
			 `afterModel`, and is appropriate for cases when:

			 1) A decision can be made to redirect elsewhere without
			 needing to resolve the model first.
			 2) Any async operations need to occur first before the
			 model is attempted to be resolved.

			 This hook is provided the current `transition` attempt
			 as a parameter, which can be used to `.abort()` the transition,
			 save it for a later `.retry()`, or retrieve values set
			 on it from a previous hook. You can also just call
			 `this.transitionTo` to another route to implicitly
			 abort the `transition`.

			 You can return a promise from this hook to pause the
			 transition until the promise resolves (or rejects). This could
			 be useful, for instance, for retrieving async code from
			 the server that is required to enter a route.

			 ```js
			 App.PostRoute = Ember.Route.extend({
      beforeModel: function(transition) {
        if (!App.Post) {
          return Ember.$.getScript('/models/post.js');
        }
      }
    });
			 ```

			 If `App.Post` doesn't exist in the above example,
			 `beforeModel` will use jQuery's `getScript`, which
			 returns a promise that resolves after the server has
			 successfully retrieved and executed the code from the
			 server. Note that if an error were to occur, it would
			 be passed to the `error` hook on `Ember.Route`, but
			 it's also possible to handle errors specific to
			 `beforeModel` right from within the hook (to distinguish
			 from the shared error handling behavior of the `error`
			 hook):

			 ```js
			 App.PostRoute = Ember.Route.extend({
      beforeModel: function(transition) {
        if (!App.Post) {
          var self = this;
          return Ember.$.getScript('post.js').then(null, function(e) {
            self.transitionTo('help');

            // Note that the above transitionTo will implicitly
            // halt the transition. If you were to return
            // nothing from this promise reject handler,
            // according to promise semantics, that would
            // convert the reject into a resolve and the
            // transition would continue. To propagate the
            // error so that it'd be handled by the `error`
            // hook, you would have to either
            return Ember.RSVP.reject(e);
            // or
            throw e;
          });
        }
      }
    });
			 ```

			 @method beforeModel
			 @param {Transition} transition
			 @return {Promise} if the value returned from this hook is
			 a promise, the transition will pause until the transition
			 resolves. Otherwise, non-promise return values are not
			 utilized in any way.
			 */
			beforeModel: Ember.K,

			/**
			 This hook is called after this route's model has resolved.
			 It follows identical async/promise semantics to `beforeModel`
			 but is provided the route's resolved model in addition to
			 the `transition`, and is therefore suited to performing
			 logic that can only take place after the model has already
			 resolved.

			 ```js
			 App.PostRoute = Ember.Route.extend({
      afterModel: function(posts, transition) {
        if (posts.length === 1) {
          this.transitionTo('post.show', posts[0]);
        }
      }
    });
			 ```

			 Refer to documentation for `beforeModel` for a description
			 of transition-pausing semantics when a promise is returned
			 from this hook.

			 @method afterModel
			 @param {Object} resolvedModel the value returned from `model`,
			 or its resolved value if it was a promise
			 @param {Transition} transition
			 @return {Promise} if the value returned from this hook is
			 a promise, the transition will pause until the transition
			 resolves. Otherwise, non-promise return values are not
			 utilized in any way.
			 */
			afterModel: function(resolvedModel, transition) {
				this.redirect(resolvedModel, transition);
			},


			/**
			 @private

			 Called when the context is changed by router.js.

			 @method contextDidChange
			 */
			contextDidChange: function() {
				this.currentModel = this.context;
			},

			/**
			 A hook you can implement to convert the URL into the model for
			 this route.

			 ```js
			 App.Router.map(function() {
      this.resource('post', {path: '/posts/:post_id'});
    });
			 ```

			 The model for the `post` route is `App.Post.find(params.post_id)`.

			 By default, if your route has a dynamic segment ending in `_id`:

			 * The model class is determined from the segment (`post_id`'s
			 class is `App.Post`)
			 * The find method is called on the model class with the value of
			 the dynamic segment.

			 Note that for routes with dynamic segments, this hook is only
			 executed when entered via the URL. If the route is entered
			 through a transition (e.g. when using the `linkTo` Handlebars
			 helper), then a model context is already provided and this hook
			 is not called. Routes without dynamic segments will always
			 execute the model hook.

			 This hook follows the asynchronous/promise semantics
			 described in the documentation for `beforeModel`. In particular,
			 if a promise returned from `model` fails, the error will be
			 handled by the `error` hook on `Ember.Route`.

			 Example

			 ```js
			 App.PostRoute = Ember.Route.extend({
      model: function(params) {
        return App.Post.find(params.post_id);
      }
    });
			 ```

			 @method model
			 @param {Object} params the parameters extracted from the URL
			 @param {Transition} transition
			 @return {Object|Promise} the model for this route. If
			 a promise is returned, the transition will pause until
			 the promise resolves, and the resolved value of the promise
			 will be used as the model for this route.
			 */
			model: function(params, transition) {
				var match, name, sawParams, value;

				for (var prop in params) {
					if (match = prop.match(/^(.*)_id$/)) {
						name = match[1];
						value = params[prop];
					}
					sawParams = true;
				}

				if (!name && sawParams) { return params; }
				else if (!name) { return; }

				return this.findModel(name, value);
			},

			/**

			 @method findModel
			 @param {String} type the model type
			 @param {Object} value the value passed to find
			 */
			findModel: function(){
				var store = get(this, 'store');
				return store.find.apply(store, arguments);
			},

			/**
			 Store property provides a hook for data persistence libraries to inject themselves.

			 By default, this store property provides the exact same functionality previously
			 in the model hook.

			 Currently, the required interface is:

			 `store.find(modelName, findArguments)`

			 @method store
			 @param {Object} store
			 */
			store: Ember.computed(function(){
				var container = this.container;
				var routeName = this.routeName;
				var namespace = get(this, 'router.namespace');

				return {
					find: function(name, value) {
						var modelClass = container.lookupFactory('model:' + name);


						return modelClass.find(value);
					}
				};
			}),

			/**
			 A hook you can implement to convert the route's model into parameters
			 for the URL.

			 ```js
			 App.Router.map(function() {
      this.resource('post', {path: '/posts/:post_id'});
    });

			 App.PostRoute = Ember.Route.extend({
      model: function(params) {
        // the server returns `{ id: 12 }`
        return jQuery.getJSON("/posts/" + params.post_id);
      },

      serialize: function(model) {
        // this will make the URL `/posts/12`
        return { post_id: model.id };
      }
    });
			 ```

			 The default `serialize` method will insert the model's `id` into the
			 route's dynamic segment (in this case, `:post_id`) if the segment contains '_id'.
			 If the route has multiple dynamic segments or does not contain '_id', `serialize`
			 will return `Ember.getProperties(model, params)`

			 This method is called when `transitionTo` is called with a context
			 in order to populate the URL.

			 @method serialize
			 @param {Object} model the route's model
			 @param {Array} params an Array of parameter names for the current
			 route (in the example, `['post_id']`.
			 @return {Object} the serialized parameters
			 */
			serialize: function(model, params) {
				if (params.length < 1) { return; }

				var name = params[0], object = {};

				if (/_id$/.test(name) && params.length === 1) {
					object[name] = get(model, "id");
				} else {
					object = getProperties(model, params);
				}

				return object;
			},

			/**
			 A hook you can use to setup the controller for the current route.

			 This method is called with the controller for the current route and the
			 model supplied by the `model` hook.

			 By default, the `setupController` hook sets the `content` property of
			 the controller to the `model`.

			 This means that your template will get a proxy for the model as its
			 context, and you can act as though the model itself was the context.

			 The provided controller will be one resolved based on the name
			 of this route.

			 If no explicit controller is defined, Ember will automatically create
			 an appropriate controller for the model.

			 * if the model is an `Ember.Array` (including record arrays from Ember
			 Data), the controller is an `Ember.ArrayController`.
			 * otherwise, the controller is an `Ember.ObjectController`.

			 As an example, consider the router:

			 ```js
			 App.Router.map(function() {
      this.resource('post', {path: '/posts/:post_id'});
    });
			 ```

			 For the `post` route, a controller named `App.PostController` would
			 be used if it is defined. If it is not defined, an `Ember.ObjectController`
			 instance would be used.

			 Example
			 ```js
			 App.PostRoute = Ember.Route.extend({
      setupController: function(controller, model) {
        controller.set('model', model);
      }
    });
			 ```

			 @method setupController
			 @param {Controller} controller instance
			 @param {Object} model
			 */
			setupController: function(controller, context) {
				if (controller && (context !== undefined)) {
					set(controller, 'model', context);
				}
			},

			/**
			 Returns the controller for a particular route or name.

			 The controller instance must already have been created, either through entering the
			 associated route or using `generateController`.

			 ```js
			 App.PostRoute = Ember.Route.extend({
      setupController: function(controller, post) {
        this._super(controller, post);
        this.controllerFor('posts').set('currentPost', post);
      }
    });
			 ```

			 @method controllerFor
			 @param {String} name the name of the route or controller
			 @return {Ember.Controller}
			 */
			controllerFor: function(name, _skipAssert) {
				var container = this.container,
					route = container.lookup('route:'+name),
					controller;

				if (route && route.controllerName) {
					name = route.controllerName;
				}

				controller = container.lookup('controller:' + name);

				// NOTE: We're specifically checking that skipAssert is true, because according
				//   to the old API the second parameter was model. We do not want people who
				//   passed a model to skip the assertion.


				return controller;
			},

			/**
			 Generates a controller for a route.

			 If the optional model is passed then the controller type is determined automatically,
			 e.g., an ArrayController for arrays.

			 Example

			 ```js
			 App.PostRoute = Ember.Route.extend({
      setupController: function(controller, post) {
        this._super(controller, post);
        this.generateController('posts', post);
      }
    });
			 ```

			 @method generateController
			 @param {String} name the name of the controller
			 @param {Object} model the model to infer the type of the controller (optional)
			 */
			generateController: function(name, model) {
				var container = this.container;

				model = model || this.modelFor(name);

				return Ember.generateController(container, name, model);
			},

			/**
			 Returns the current model for a given route.

			 This is the object returned by the `model` hook of the route
			 in question.

			 Example

			 ```js
			 App.Router.map(function() {
        this.resource('post', { path: '/post/:post_id' }, function() {
            this.resource('comments');
        });
    });

			 App.CommentsRoute = Ember.Route.extend({
        afterModel: function() {
            this.set('post', this.modelFor('post'));
        }
    });
			 ```

			 @method modelFor
			 @param {String} name the name of the route
			 @return {Object} the model object
			 */
			modelFor: function(name) {

				var route = this.container.lookup('route:' + name),
					transition = this.router.router.activeTransition;

				// If we are mid-transition, we want to try and look up
				// resolved parent contexts on the current transitionEvent.
				if (transition) {
					var modelLookupName = (route && route.routeName) || name;
					if (transition.resolvedModels.hasOwnProperty(modelLookupName)) {
						return transition.resolvedModels[modelLookupName];
					}
				}

				return route && route.currentModel;
			},

			/**
			 A hook you can use to render the template for the current route.

			 This method is called with the controller for the current route and the
			 model supplied by the `model` hook. By default, it renders the route's
			 template, configured with the controller for the route.

			 This method can be overridden to set up and render additional or
			 alternative templates.

			 ```js
			 App.PostsRoute = Ember.Route.extend({
      renderTemplate: function(controller, model) {
        var favController = this.controllerFor('favoritePost');

        // Render the `favoritePost` template into
        // the outlet `posts`, and display the `favoritePost`
        // controller.
        this.render('favoritePost', {
          outlet: 'posts',
          controller: favController
        });
      }
    });
			 ```

			 @method renderTemplate
			 @param {Object} controller the route's controller
			 @param {Object} model the route's model
			 */
			renderTemplate: function(controller, model) {
				this.render();
			},

			/**
			 Renders a template into an outlet.

			 This method has a number of defaults, based on the name of the
			 route specified in the router.

			 For example:

			 ```js
			 App.Router.map(function() {
      this.route('index');
      this.resource('post', {path: '/posts/:post_id'});
    });

			 App.PostRoute = App.Route.extend({
      renderTemplate: function() {
        this.render();
      }
    });
			 ```

			 The name of the `PostRoute`, as defined by the router, is `post`.

			 By default, render will:

			 * render the `post` template
			 * with the `post` view (`PostView`) for event handling, if one exists
			 * and the `post` controller (`PostController`), if one exists
			 * into the `main` outlet of the `application` template

			 You can override this behavior:

			 ```js
			 App.PostRoute = App.Route.extend({
      renderTemplate: function() {
        this.render('myPost', {   // the template to render
          into: 'index',          // the template to render into
          outlet: 'detail',       // the name of the outlet in that template
          controller: 'blogPost'  // the controller to use for the template
        });
      }
    });
			 ```

			 Remember that the controller's `content` will be the route's model. In
			 this case, the default model will be `App.Post.find(params.post_id)`.

			 @method render
			 @param {String} name the name of the template to render
			 @param {Object} options the options
			 */
			render: function(name, options) {


				var namePassed = !!name;

				if (typeof name === 'object' && !options) {
					options = name;
					name = this.routeName;
				}

				options = options || {};
				name = name ? name.replace(/\//g, '.') : this.routeName;
				var viewName = options.view || this.viewName || name;
				var templateName = this.templateName || name;

				var container = this.container,
					view = container.lookup('view:' + viewName),
					template = view ? view.get('template') : null;

				if (!template) {
					template = container.lookup('template:' + templateName);
				}

				if (!view && !template) {

					if (get(this.router, 'namespace.LOG_VIEW_LOOKUPS')) {
						Ember.Logger.info("Could not find \"" + name + "\" template or view. Nothing will be rendered", { fullName: 'template:' + name });
					}
					return;
				}

				options = normalizeOptions(this, name, template, options);
				view = setupView(view, container, options);

				if (options.outlet === 'main') { this.lastRenderedTemplate = name; }

				appendView(this, view, options);
			},

			/**
			 Disconnects a view that has been rendered into an outlet.

			 You may pass any or all of the following options to `disconnectOutlet`:

			 * `outlet`: the name of the outlet to clear (default: 'main')
			 * `parentView`: the name of the view containing the outlet to clear
			 (default: the view rendered by the parent route)

			 Example:

			 ```js
			 App.ApplicationRoute = App.Route.extend({
      actions: {
        showModal: function(evt) {
          this.render(evt.modalName, {
            outlet: 'modal',
            into: 'application'
          });
        },
        hideModal: function(evt) {
          this.disconnectOutlet({
            outlet: 'modal',
            parentView: 'application'
          });
        }
      }
    });
			 ```

			 @method disconnectOutlet
			 @param {Object} options the options
			 */
			disconnectOutlet: function(options) {
				options = options || {};
				options.parentView = options.parentView ? options.parentView.replace(/\//g, '.') : parentTemplate(this);
				options.outlet = options.outlet || 'main';

				var parentView = this.router._lookupActiveView(options.parentView);
				parentView.disconnectOutlet(options.outlet);
			},

			willDestroy: function() {
				this.teardownViews();
			},

			/**
			 @private

			 @method teardownViews
			 */
			teardownViews: function() {
				// Tear down the top level view
				if (this.teardownTopLevelView) { this.teardownTopLevelView(); }

				// Tear down any outlets rendered with 'into'
				var teardownOutletViews = this.teardownOutletViews || [];
				a_forEach(teardownOutletViews, function(teardownOutletView) {
					teardownOutletView();
				});

				delete this.teardownTopLevelView;
				delete this.teardownOutletViews;
				delete this.lastRenderedTemplate;
			}
		});

		function parentRoute(route) {
			var handlerInfos = route.router.router.targetHandlerInfos;

			if (!handlerInfos) { return; }

			var parent, current;

			for (var i=0, l=handlerInfos.length; i<l; i++) {
				current = handlerInfos[i].handler;
				if (current === route) { return parent; }
				parent = current;
			}
		}

		function parentTemplate(route) {
			var parent = parentRoute(route), template;

			if (!parent) { return; }

			if (template = parent.lastRenderedTemplate) {
				return template;
			} else {
				return parentTemplate(parent);
			}
		}

		function normalizeOptions(route, name, template, options) {
			options = options || {};
			options.into = options.into ? options.into.replace(/\//g, '.') : parentTemplate(route);
			options.outlet = options.outlet || 'main';
			options.name = name;
			options.template = template;
			options.LOG_VIEW_LOOKUPS = get(route.router, 'namespace.LOG_VIEW_LOOKUPS');


			var controller = options.controller, namedController;

			if (options.controller) {
				controller = options.controller;
			} else if (namedController = route.container.lookup('controller:' + name)) {
				controller = namedController;
			} else {
				controller = route.controllerName || route.routeName;
			}

			if (typeof controller === 'string') {
				controller = route.container.lookup('controller:' + controller);
			}

			options.controller = controller;

			return options;
		}

		function setupView(view, container, options) {
			if (view) {
				if (options.LOG_VIEW_LOOKUPS) {
					Ember.Logger.info("Rendering " + options.name + " with " + view, { fullName: 'view:' + options.name });
				}
			} else {
				var defaultView = options.into ? 'view:default' : 'view:toplevel';
				view = container.lookup(defaultView);
				if (options.LOG_VIEW_LOOKUPS) {
					Ember.Logger.info("Rendering " + options.name + " with default view " + view, { fullName: 'view:' + options.name });
				}
			}

			if (!get(view, 'templateName')) {
				set(view, 'template', options.template);

				set(view, '_debugTemplateName', options.name);
			}

			set(view, 'renderedName', options.name);
			set(view, 'controller', options.controller);

			return view;
		}

		function appendView(route, view, options) {
			if (options.into) {
				var parentView = route.router._lookupActiveView(options.into);
				var teardownOutletView = generateOutletTeardown(parentView, options.outlet);
				if (!route.teardownOutletViews) { route.teardownOutletViews = []; }
				a_replace(route.teardownOutletViews, 0, 0, [teardownOutletView]);
				parentView.connectOutlet(options.outlet, view);
			} else {
				var rootElement = get(route, 'router.namespace.rootElement');
				// tear down view if one is already rendered
				if (route.teardownTopLevelView) {
					route.teardownTopLevelView();
				}
				route.router._connectActiveView(options.name, view);
				route.teardownTopLevelView = generateTopLevelTeardown(view);
				view.appendTo(rootElement);
			}
		}

		function generateTopLevelTeardown(view) {
			return function() { view.destroy(); };
		}

		function generateOutletTeardown(parentView, outlet) {
			return function() { parentView.disconnectOutlet(outlet); };
		}

	})();



	(function() {

	})();



	(function() {
		Ember.onLoad('Ember.Handlebars', function() {
			var handlebarsResolve = Ember.Handlebars.resolveParams,
				map = Ember.ArrayPolyfills.map,
				get = Ember.get,
				handlebarsGet = Ember.Handlebars.get;

			function resolveParams(context, params, options) {
				return map.call(resolvePaths(context, params, options), function(path, i) {
					if (null === path) {
						// Param was string/number, not a path, so just return raw string/number.
						return params[i];
					} else {
						return handlebarsGet(context, path, options);
					}
				});
			}

			function resolvePaths(context, params, options) {
				var resolved = handlebarsResolve(context, params, options),
					types = options.types;

				return map.call(resolved, function(object, i) {
					if (types[i] === 'ID') {
						return unwrap(object, params[i]);
					} else {
						return null;
					}
				});

				function unwrap(object, path) {
					if (path === 'controller') { return path; }

					if (Ember.ControllerMixin.detect(object)) {
						return unwrap(get(object, 'model'), path ? path + '.model' : 'model');
					} else {
						return path;
					}
				}
			}

			Ember.Router.resolveParams = resolveParams;
			Ember.Router.resolvePaths = resolvePaths;
		});

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-routing
		 */

		var get = Ember.get, set = Ember.set, fmt = Ember.String.fmt;
		Ember.onLoad('Ember.Handlebars', function(Handlebars) {

			var resolveParams = Ember.Router.resolveParams,
				resolvePaths  = Ember.Router.resolvePaths,
				isSimpleClick = Ember.ViewUtils.isSimpleClick;

			function fullRouteName(router, name) {
				if (!router.hasRoute(name)) {
					name = name + '.index';
				}

				return name;
			}

			function getResolvedPaths(options) {

				var types = options.options.types,
					data = options.options.data;

				return resolvePaths(options.context, options.params, { types: types, data: data });
			}

			/**
			 `Ember.LinkView` renders an element whose `click` event triggers a
			 transition of the application's instance of `Ember.Router` to
			 a supplied route by name.

			 Instances of `LinkView` will most likely be created through
			 the `link-to` Handlebars helper, but properties of this class
			 can be overridden to customize application-wide behavior.

			 @class LinkView
			 @namespace Ember
			 @extends Ember.View
			 @see {Handlebars.helpers.link-to}
			 **/
			var LinkView = Ember.LinkView = Ember.View.extend({
				tagName: 'a',
				currentWhen: null,

				/**
				 Sets the `title` attribute of the `LinkView`'s HTML element.

				 @property title
				 @default null
				 **/
				title: null,

				/**
				 Sets the `rel` attribute of the `LinkView`'s HTML element.

				 @property rel
				 @default null
				 **/
				rel: null,

				/**
				 The CSS class to apply to `LinkView`'s element when its `active`
				 property is `true`.

				 @property activeClass
				 @type String
				 @default active
				 **/
				activeClass: 'active',

				/**
				 The CSS class to apply to `LinkView`'s element when its `loading`
				 property is `true`.

				 @property loadingClass
				 @type String
				 @default loading
				 **/
				loadingClass: 'loading',

				/**
				 The CSS class to apply to a `LinkView`'s element when its `disabled`
				 property is `true`.

				 @property disabledClass
				 @type String
				 @default disabled
				 **/
				disabledClass: 'disabled',
				_isDisabled: false,

				/**
				 Determines whether the `LinkView` will trigger routing via
				 the `replaceWith` routing strategy.

				 @property replace
				 @type Boolean
				 @default false
				 **/
				replace: false,

				/**
				 By default the `{{link-to}}` helper will bind to the `href` and
				 `title` attributes. It's discourage that you override these defaults,
				 however you can push onto the array if needed.

				 @property attributeBindings
				 @type Array | String
				 @default ['href', 'title', 'rel']
				 **/
				attributeBindings: ['href', 'title', 'rel'],

				/**
				 By default the `{{link-to}}` helper will bind to the `active`, `loading`, and
				 `disabled` classes. It is discouraged to override these directly.

				 @property classNameBindings
				 @type Array
				 @default ['active', 'loading', 'disabled']
				 **/
				classNameBindings: ['active', 'loading', 'disabled'],

				/**
				 By default the `{{link-to}}` helper responds to the `click` event. You
				 can override this globally by setting this property to your custom
				 event name.

				 This is particularly useful on mobile when one wants to avoid the 300ms
				 click delay using some sort of custom `tap` event.

				 @property eventName
				 @type String
				 @default click
				 */
				eventName: 'click',

				// this is doc'ed here so it shows up in the events
				// section of the API documentation, which is where
				// people will likely go looking for it.
				/**
				 Triggers the `LinkView`'s routing behavior. If
				 `eventName` is changed to a value other than `click`
				 the routing behavior will trigger on that custom event
				 instead.

				 @event click
				 **/

				/**
				 An overridable method called when LinkView objects are instantiated.

				 Example:

				 ```javascript
				 App.MyLinkView = Ember.LinkView.extend({
        init: function() {
          this._super();
          Ember.Logger.log('Event is ' + this.get('eventName'));
        }
      });
				 ```

				 NOTE: If you do override `init` for a framework class like `Ember.View` or
				 `Ember.ArrayController`, be sure to call `this._super()` in your
				 `init` declaration! If you don't, Ember may not have an opportunity to
				 do important setup work, and you'll see strange behavior in your
				 application.

				 @method init
				 */
				init: function() {
					this._super.apply(this, arguments);

					// Map desired event name to invoke function
					var eventName = get(this, 'eventName');
					this.on(eventName, this, this._invoke);

					var helperParameters = this.parameters,
						templateContext = helperParameters.context,
						paths = getResolvedPaths(helperParameters),
						length = paths.length,
						path, i;

					for(i=0; i < length; i++) {
						path = paths[i];
						if (null === path) {
							// A literal value was provided, not a path, so nothing to observe.
							continue;
						}

						var normalizedPath =
							Ember.Handlebars.normalizePath(templateContext, path, helperParameters.options.data);
						this.registerObserver(normalizedPath.root, normalizedPath.path, this, this._paramsChanged);
					}
				},

				/**
				 @private

				 This method is invoked by observers installed during `init` that fire
				 whenever the helpers
				 */
				_paramsChanged: function() {
					this.notifyPropertyChange('resolvedParams');
				},

				/**
				 @private

				 Even though this isn't a virtual view, we want to treat it as if it is
				 so that you can access the parent with {{view.prop}}

				 @method concreteView
				 **/
				concreteView: Ember.computed(function() {
					return get(this, 'parentView');
				}).property('parentView'),

				/**

				 Accessed as a classname binding to apply the `LinkView`'s `disabledClass`
				 CSS `class` to the element when the link is disabled.

				 When `true` interactions with the element will not trigger route changes.
				 @property disabled
				 */
				disabled: Ember.computed(function(key, value) {
					if (value !== undefined) { this.set('_isDisabled', value); }

					return value ? get(this, 'disabledClass') : false;
				}),

				/**
				 Accessed as a classname binding to apply the `LinkView`'s `activeClass`
				 CSS `class` to the element when the link is active.

				 A `LinkView` is considered active when its `currentWhen` property is `true`
				 or the application's current route is the route the `LinkView` would trigger
				 transitions into.

				 @property active
				 **/
				active: Ember.computed(function() {
					if (get(this, 'loading')) { return false; }

					var router = get(this, 'router'),
						routeArgs = get(this, 'routeArgs'),
						contexts = routeArgs.slice(1),
						resolvedParams = get(this, 'resolvedParams'),
						currentWhen = this.currentWhen || resolvedParams[0],
						currentWithIndex = currentWhen + '.index',
						isActive = router.isActive.apply(router, [currentWhen].concat(contexts)) ||
							router.isActive.apply(router, [currentWithIndex].concat(contexts));

					if (isActive) { return get(this, 'activeClass'); }
				}).property('resolvedParams', 'routeArgs', 'router.url'),

				/**
				 Accessed as a classname binding to apply the `LinkView`'s `loadingClass`
				 CSS `class` to the element when the link is loading.

				 A `LinkView` is considered loading when it has at least one
				 parameter whose value is currently null or undefined. During
				 this time, clicking the link will perform no transition and
				 emit a warning that the link is still in a loading state.

				 @property loading
				 **/
				loading: Ember.computed(function() {
					if (!get(this, 'routeArgs')) { return get(this, 'loadingClass'); }
				}).property('routeArgs'),

				/**
				 @private

				 Returns the application's main router from the container.

				 @property router
				 **/
				router: Ember.computed(function() {
					return get(this, 'controller').container.lookup('router:main');
				}),

				/**
				 @private

				 Event handler that invokes the link, activating the associated route.

				 @method _invoke
				 @param {Event} event
				 */
				_invoke: function(event) {
					if (!isSimpleClick(event)) { return true; }

					event.preventDefault();
					if (this.bubbles === false) { event.stopPropagation(); }

					if (get(this, '_isDisabled')) { return false; }

					if (get(this, 'loading')) {
						Ember.Logger.warn("This link-to is in an inactive loading state because at least one of its parameters presently has a null/undefined value, or the provided route name is invalid.");
						return false;
					}

					var router = get(this, 'router'),
						routeArgs = get(this, 'routeArgs');

					if (get(this, 'replace')) {
						router.replaceWith.apply(router, routeArgs);
					} else {
						router.transitionTo.apply(router, routeArgs);
					}
				},

				/**
				 @private

				 Computed property that returns the resolved parameters.

				 @property
				 @return {Array}
				 */
				resolvedParams: Ember.computed(function() {
					var parameters = this.parameters,
						options = parameters.options,
						types = options.types,
						data = options.data;

					return resolveParams(parameters.context, parameters.params, { types: types, data: data });
				}).property(),

				/**
				 @private

				 Computed property that returns the current route name and
				 any dynamic segments.

				 @property
				 @return {Array} An array with the route name and any dynamic segments
				 */
				routeArgs: Ember.computed(function() {

					var resolvedParams = get(this, 'resolvedParams').slice(0),
						router = get(this, 'router'),
						namedRoute = resolvedParams[0];

					if (!namedRoute) { return; }

					namedRoute = fullRouteName(router, namedRoute);
					resolvedParams[0] = namedRoute;


					for (var i = 1, len = resolvedParams.length; i < len; ++i) {
						var param = resolvedParams[i];
						if (param === null || typeof param === 'undefined') {
							// If contexts aren't present, consider the linkView unloaded.
							return;
						}
					}

					return resolvedParams;
				}).property('resolvedParams'),

				/**
				 Sets the element's `href` attribute to the url for
				 the `LinkView`'s targeted route.

				 If the `LinkView`'s `tagName` is changed to a value other
				 than `a`, this property will be ignored.

				 @property href
				 **/
				href: Ember.computed(function() {
					if (get(this, 'tagName') !== 'a') { return false; }

					var router = get(this, 'router'),
						routeArgs = get(this, 'routeArgs');

					return routeArgs ? router.generate.apply(router, routeArgs) : get(this, 'loadingHref');
				}).property('routeArgs'),

				/**
				 The default href value to use while a link-to is loading.
				 Only applies when tagName is 'a'

				 @property loadingHref
				 @type String
				 @default #
				 */
				loadingHref: '#'
			});

			LinkView.toString = function() { return "LinkView"; };

			/**
			 The `{{link-to}}` helper renders a link to the supplied
			 `routeName` passing an optionally supplied model to the
			 route as its `model` context of the route. The block
			 for `{{link-to}}` becomes the innerHTML of the rendered
			 element:

			 ```handlebars
			 {{#link-to 'photoGallery'}}
			 Great Hamster Photos
			 {{/link-to}}
			 ```

			 ```html
			 <a href="/hamster-photos">
			 Great Hamster Photos
			 </a>
			 ```

			 ### Supplying a tagName
			 By default `{{link-to}}` renders an `<a>` element. This can
			 be overridden for a single use of `{{link-to}}` by supplying
			 a `tagName` option:

			 ```handlebars
			 {{#link-to 'photoGallery' tagName="li"}}
			 Great Hamster Photos
			 {{/link-to}}
			 ```

			 ```html
			 <li>
			 Great Hamster Photos
			 </li>
			 ```

			 To override this option for your entire application, see
			 "Overriding Application-wide Defaults".

			 ### Handling `href`
			 `{{link-to}}` will use your application's Router to
			 fill the element's `href` property with a url that
			 matches the path to the supplied `routeName` for your
			 routers's configured `Location` scheme, which defaults
			 to Ember.HashLocation.

			 ### Handling current route
			 `{{link-to}}` will apply a CSS class name of 'active'
			 when the application's current route matches
			 the supplied routeName. For example, if the application's
			 current route is 'photoGallery.recent' the following
			 use of `{{link-to}}`:

			 ```handlebars
			 {{#link-to 'photoGallery.recent'}}
			 Great Hamster Photos from the last week
			 {{/link-to}}
			 ```

			 will result in

			 ```html
			 <a href="/hamster-photos/this-week" class="active">
			 Great Hamster Photos
			 </a>
			 ```

			 The CSS class name used for active classes can be customized
			 for a single use of `{{link-to}}` by passing an `activeClass`
			 option:

			 ```handlebars
			 {{#link-to 'photoGallery.recent' activeClass="current-url"}}
			 Great Hamster Photos from the last week
			 {{/link-to}}
			 ```

			 ```html
			 <a href="/hamster-photos/this-week" class="current-url">
			 Great Hamster Photos
			 </a>
			 ```

			 To override this option for your entire application, see
			 "Overriding Application-wide Defaults".

			 ### Supplying a model
			 An optional model argument can be used for routes whose
			 paths contain dynamic segments. This argument will become
			 the model context of the linked route:

			 ```javascript
			 App.Router.map(function() {
      this.resource("photoGallery", {path: "hamster-photos/:photo_id"});
    })
			 ```

			 ```handlebars
			 {{#link-to 'photoGallery' aPhoto}}
			 {{aPhoto.title}}
			 {{/link-to}}
			 ```

			 ```html
			 <a href="/hamster-photos/42">
			 Tomster
			 </a>
			 ```

			 ### Supplying multiple models
			 For deep-linking to route paths that contain multiple
			 dynamic segments, multiple model arguments can be used.
			 As the router transitions through the route path, each
			 supplied model argument will become the context for the
			 route with the dynamic segments:

			 ```javascript
			 App.Router.map(function() {
      this.resource("photoGallery", {path: "hamster-photos/:photo_id"}, function() {
        this.route("comment", {path: "comments/:comment_id"});
      });
    });
			 ```
			 This argument will become the model context of the linked route:

			 ```handlebars
			 {{#link-to 'photoGallery.comment' aPhoto comment}}
			 {{comment.body}}
			 {{/link-to}}
			 ```

			 ```html
			 <a href="/hamster-photos/42/comment/718">
			 A+++ would snuggle again.
			 </a>
			 ```
			 ### Overriding attributes
			 You can override any given property of the Ember.LinkView
			 that is generated by the `{{link-to}}` helper by passing
			 key/value pairs, like so:

			 ```handlebars
			 {{#link-to  aPhoto tagName='li' title='Following this link will change your life' classNames=['pic', 'sweet']}}
			 Uh-mazing!
			 {{/link-to}}

			 See {{#crossLink "Ember.LinkView"}}{{/crossLink}} for a
			 complete list of overrideable properties. Be sure to also
			 check out inherited properties of `LinkView`.

			 ### Overriding Application-wide Defaults
			 ``{{link-to}}`` creates an instance of Ember.LinkView
			 for rendering. To override options for your entire
			 application, reopen Ember.LinkView and supply the
			 desired values:

			 ``` javascript
			 Ember.LinkView.reopen({
      activeClass: "is-active",
      tagName: 'li'
    })
			 ```

			 It is also possible to override the default event in
			 this manner:

			 ``` javascript
			 Ember.LinkView.reopen({
      eventName: 'customEventName'
    });
			 ```

			 @method link-to
			 @for Ember.Handlebars.helpers
			 @param {String} routeName
			 @param {Object} [context]*
			 @param [options] {Object} Handlebars key/value pairs of options, you can over-ride any property of {{#crossLink "Ember.LinkView"}}{{/crossLink}}
			 @return {String} HTML string
			 @see {Ember.LinkView}
			 */
			Ember.Handlebars.registerHelper('link-to', function(name) {
				var options = [].slice.call(arguments, -1)[0],
					params = [].slice.call(arguments, 0, -1),
					hash = options.hash;

				hash.disabledBinding = hash.disabledWhen;

				hash.parameters = {
					context: this,
					options: options,
					params: params
				};

				return Ember.Handlebars.helpers.view.call(this, LinkView, options);
			});

			/**
			 See `link-to`

			 @method linkTo
			 @for Ember.Handlebars.helpers
			 @deprecated
			 @param {String} routeName
			 @param {Object} [context]*
			 @return {String} HTML string
			 */
			Ember.Handlebars.registerHelper('linkTo', Ember.Handlebars.helpers['link-to']);
		});



	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-routing
		 */

		var get = Ember.get, set = Ember.set;
		Ember.onLoad('Ember.Handlebars', function(Handlebars) {
			/**
			 @module ember
			 @submodule ember-routing
			 */

			Handlebars.OutletView = Ember.ContainerView.extend(Ember._Metamorph);

			/**
			 The `outlet` helper is a placeholder that the router will fill in with
			 the appropriate template based on the current state of the application.

			 ``` handlebars
			 {{outlet}}
			 ```

			 By default, a template based on Ember's naming conventions will be rendered
			 into the `outlet` (e.g. `App.PostsRoute` will render the `posts` template).

			 You can render a different template by using the `render()` method in the
			 route's `renderTemplate` hook. The following will render the `favoritePost`
			 template into the `outlet`.

			 ``` javascript
			 App.PostsRoute = Ember.Route.extend({
      renderTemplate: function() {
        this.render('favoritePost');
      }
    });
			 ```

			 You can create custom named outlets for more control.

			 ``` handlebars
			 {{outlet 'favoritePost'}}
			 {{outlet 'posts'}}
			 ```

			 Then you can define what template is rendered into each outlet in your
			 route.


			 ``` javascript
			 App.PostsRoute = Ember.Route.extend({
      renderTemplate: function() {
        this.render('favoritePost', { outlet: 'favoritePost' });
        this.render('posts', { outlet: 'posts' });
      }
    });
			 ```

			 You can specify the view class that the outlet uses to contain and manage the
			 templates rendered into it.

			 ``` handlebars
			 {{outlet viewClass=App.SectionContainer}}
			 ```

			 ``` javascript
			 App.SectionContainer = Ember.ContainerView.extend({
      tagName: 'section',
      classNames: ['special']
    });
			 ```

			 @method outlet
			 @for Ember.Handlebars.helpers
			 @param {String} property the property on the controller
			 that holds the view for this outlet
			 @return {String} HTML string
			 */
			Handlebars.registerHelper('outlet', function(property, options) {
				var outletSource, outletContainerClass;

				if (property && property.data && property.data.isRenderData) {
					options = property;
					property = 'main';
				}

				outletSource = options.data.view;
				while (!outletSource.get('template.isTop')) {
					outletSource = outletSource.get('_parentView');
				}

				outletContainerClass = options.hash.viewClass || Handlebars.OutletView;

				options.data.view.set('outletSource', outletSource);
				options.hash.currentViewBinding = '_view.outletSource._outlets.' + property;

				return Handlebars.helpers.view.call(this, outletContainerClass, options);
			});
		});

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-routing
		 */

		var get = Ember.get, set = Ember.set;
		Ember.onLoad('Ember.Handlebars', function(Handlebars) {

			/**
			 Calling ``{{render}}`` from within a template will insert another
			 template that matches the provided name. The inserted template will
			 access its properties on its own controller (rather than the controller
			 of the parent template).

			 If a view class with the same name exists, the view class also will be used.

			 Note: A given controller may only be used *once* in your app in this manner.
			 A singleton instance of the controller will be created for you.

			 Example:

			 ```javascript
			 App.NavigationController = Ember.Controller.extned({
      who: "world"
    });
			 ```

			 ```handelbars
			 <!-- navigation.hbs -->
			 Hello, {{who}}.
			 ```

			 ```handelbars
			 <!-- applications.hbs -->
			 <h1>My great app</h1>
			 {{render navigaton}}
			 ```

			 ```html
			 <h1>My great app</h1>
			 <div class='ember-view'>
			 Hello, world.
			 </div>
			 ```

			 Optionally you may provide a  second argument: a property path
			 that will be bound to the `model` property of the controller.

			 If a `model` property path is specified, then a new instance of the
			 controller will be created and `{{render}}` can be used multiple times
			 with the same name.

			 For example if you had this `author` template.

			 ```handlebars
			 <div class="author">
			 Written by {{firstName}} {{lastName}}.
			 Total Posts: {{postCount}}
			 </div>
			 ```

			 You could render it inside the `post` template using the `render` helper.

			 ```handlebars
			 <div class="post">
			 <h1>{{title}}</h1>
			 <div>{{body}}</div>
			 {{render "author" author}}
			 </div>
			 ```

			 @method render
			 @for Ember.Handlebars.helpers
			 @param {String} name
			 @param {Object?} contextString
			 @param {Hash} options
			 @return {String} HTML string
			 */
			Ember.Handlebars.registerHelper('render', function(name, contextString, options) {

				var contextProvided = arguments.length === 3,
					container, router, controller, view, context, lookupOptions;

				if (arguments.length === 2) {
					options = contextString;
					contextString = undefined;
				}

				if (typeof contextString === 'string') {
					context = Ember.Handlebars.get(options.contexts[1], contextString, options);
					lookupOptions = { singleton: false };
				}

				name = name.replace(/\//g, '.');
				container = options.data.keywords.controller.container;
				router = container.lookup('router:main');


				view = container.lookup('view:' + name) || container.lookup('view:default');

				var controllerName = options.hash.controller;

				// Look up the controller by name, if provided.
				if (controllerName) {
					controller = container.lookup('controller:' + controllerName, lookupOptions);

				} else {
					controller = container.lookup('controller:' + name, lookupOptions) ||
						Ember.generateController(container, name, context);
				}

				if (controller && contextProvided) {
					controller.set('model', context);
				}

				var root = options.contexts[1];

				if (root) {
					view.registerObserver(root, contextString, function() {
						controller.set('model', Ember.Handlebars.get(root, contextString, options));
					});
				}

				controller.set('target', options.data.keywords.controller);

				options.hash.viewName = Ember.String.camelize(name);
				options.hash.template = container.lookup('template:' + name);
				options.hash.controller = controller;

				if (router && !context) {
					router._connectActiveView(name, view);
				}

				Ember.Handlebars.helpers.view.call(this, view, options);
			});

		});

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-routing
		 */
		Ember.onLoad('Ember.Handlebars', function(Handlebars) {

			var resolveParams = Ember.Router.resolveParams,
				isSimpleClick = Ember.ViewUtils.isSimpleClick;

			var EmberHandlebars = Ember.Handlebars,
				handlebarsGet = EmberHandlebars.get,
				SafeString = EmberHandlebars.SafeString,
				forEach = Ember.ArrayPolyfills.forEach,
				get = Ember.get,
				a_slice = Array.prototype.slice;

			function args(options, actionName) {
				var ret = [];
				if (actionName) { ret.push(actionName); }

				var types = options.options.types.slice(1),
					data = options.options.data;

				return ret.concat(resolveParams(options.context, options.params, { types: types, data: data }));
			}

			var ActionHelper = EmberHandlebars.ActionHelper = {
				registeredActions: {}
			};

			var keys = ["alt", "shift", "meta", "ctrl"];

			var isAllowedClick = function(event, allowedKeys) {
				if (typeof allowedKeys === "undefined") {
					return isSimpleClick(event);
				}

				var allowed = true;

				forEach.call(keys, function(key) {
					if (event[key + "Key"] && allowedKeys.indexOf(key) === -1) {
						allowed = false;
					}
				});

				return allowed;
			};

			ActionHelper.registerAction = function(actionName, options, allowedKeys) {
				var actionId = (++Ember.uuid).toString();

				ActionHelper.registeredActions[actionId] = {
					eventName: options.eventName,
					handler: function(event) {
						if (!isAllowedClick(event, allowedKeys)) { return true; }

						event.preventDefault();

						if (options.bubbles === false) {
							event.stopPropagation();
						}

						var target = options.target;

						if (target.target) {
							target = handlebarsGet(target.root, target.target, target.options);
						} else {
							target = target.root;
						}

						Ember.run(function() {
							if (target.send) {
								target.send.apply(target, args(options.parameters, actionName));
							} else {

								target[actionName].apply(target, args(options.parameters));
							}
						});
					}
				};

				options.view.on('willClearRender', function() {
					delete ActionHelper.registeredActions[actionId];
				});

				return actionId;
			};

			/**
			 The `{{action}}` helper registers an HTML element within a template for DOM
			 event handling and forwards that interaction to the view's controller
			 or supplied `target` option (see 'Specifying a Target').

			 If the view's controller does not implement the event, the event is sent
			 to the current route, and it bubbles up the route hierarchy from there.

			 User interaction with that element will invoke the supplied action name on
			 the appropriate target.

			 Given the following Handlebars template on the page

			 ```handlebars
			 <div {{action 'anActionName'}}>
			 click me
			 </div>
			 ```

			 And application code

			 ```javascript
			 AController = Ember.Controller.extend({
      anActionName: function() {}
    });

			 AView = Ember.View.extend({
      controller: AController.create(),
      templateName: 'a-template'
    });

			 aView = AView.create();
			 aView.appendTo('body');
			 ```

			 Will result in the following rendered HTML

			 ```html
			 <div class="ember-view">
			 <div data-ember-action="1">
			 click me
			 </div>
			 </div>
			 ```

			 Clicking "click me" will trigger the `anActionName` method of the
			 `AController`. In this case, no additional parameters will be passed.

			 If you provide additional parameters to the helper:

			 ```handlebars
			 <button {{action 'edit' post}}>Edit</button>
			 ```

			 Those parameters will be passed along as arguments to the JavaScript
			 function implementing the action.

			 ### Event Propagation

			 Events triggered through the action helper will automatically have
			 `.preventDefault()` called on them. You do not need to do so in your event
			 handlers.

			 To also disable bubbling, pass `bubbles=false` to the helper:

			 ```handlebars
			 <button {{action 'edit' post bubbles=false}}>Edit</button>
			 ```

			 If you need the default handler to trigger you should either register your
			 own event handler, or use event methods on your view class. See [Ember.View](/api/classes/Ember.View.html)
			 'Responding to Browser Events' for more information.

			 ### Specifying DOM event type

			 By default the `{{action}}` helper registers for DOM `click` events. You can
			 supply an `on` option to the helper to specify a different DOM event name:

			 ```handlebars
			 <script type="text/x-handlebars" data-template-name='a-template'>
			 <div {{action 'anActionName' on="doubleClick"}}>
			 click me
			 </div>
			 </script>
			 ```

			 See `Ember.View` 'Responding to Browser Events' for a list of
			 acceptable DOM event names.

			 NOTE: Because `{{action}}` depends on Ember's event dispatch system it will
			 only function if an `Ember.EventDispatcher` instance is available. An
			 `Ember.EventDispatcher` instance will be created when a new `Ember.Application`
			 is created. Having an instance of `Ember.Application` will satisfy this
			 requirement.

			 ### Specifying whitelisted modifier keys

			 By default the `{{action}}` helper will ignore click event with pressed modifier
			 keys. You can supply an `allowedKeys` option to specify which keys should not be ignored.

			 ```handlebars
			 <script type="text/x-handlebars" data-template-name='a-template'>
			 <div {{action 'anActionName' allowedKeys="alt"}}>
			 click me
			 </div>
			 </script>
			 ```

			 This way the `{{action}}` will fire when clicking with the alt key pressed down.

			 ### Specifying a Target

			 There are several possible target objects for `{{action}}` helpers:

			 In a typical Ember application, where views are managed through use of the
			 `{{outlet}}` helper, actions will bubble to the current controller, then
			 to the current route, and then up the route hierarchy.

			 Alternatively, a `target` option can be provided to the helper to change
			 which object will receive the method call. This option must be a path
			 to an object, accessible in the current context:

			 ```handlebars
			 <script type="text/x-handlebars" data-template-name='a-template'>
			 <div {{action 'anActionName' target="MyApplication.someObject"}}>
			 click me
			 </div>
			 </script>
			 ```

			 Clicking "click me" in the rendered HTML of the above template will trigger
			 the  `anActionName` method of the object at `MyApplication.someObject`.

			 If an action's target does not implement a method that matches the supplied
			 action name an error will be thrown.

			 ```handlebars
			 <script type="text/x-handlebars" data-template-name='a-template'>
			 <div {{action 'aMethodNameThatIsMissing'}}>
			 click me
			 </div>
			 </script>
			 ```

			 With the following application code

			 ```javascript
			 AView = Ember.View.extend({
      templateName; 'a-template',
      // note: no method 'aMethodNameThatIsMissing'
      anActionName: function(event) {}
    });

			 aView = AView.create();
			 aView.appendTo('body');
			 ```

			 Will throw `Uncaught TypeError: Cannot call method 'call' of undefined` when
			 "click me" is clicked.

			 ### Additional Parameters

			 You may specify additional parameters to the `{{action}}` helper. These
			 parameters are passed along as the arguments to the JavaScript function
			 implementing the action.

			 ```handlebars
			 <script type="text/x-handlebars" data-template-name='a-template'>
			 {{#each person in people}}
			 <div {{action 'edit' person}}>
			 click me
			 </div>
			 {{/each}}
			 </script>
			 ```

			 Clicking "click me" will trigger the `edit` method on the current view's
			 controller with the current person as a parameter.

			 @method action
			 @for Ember.Handlebars.helpers
			 @param {String} actionName
			 @param {Object} [context]*
			 @param {Hash} options
			 */
			EmberHandlebars.registerHelper('action', function(actionName) {
				var options = arguments[arguments.length - 1],
					contexts = a_slice.call(arguments, 1, -1);

				var hash = options.hash,
					controller;

				// create a hash to pass along to registerAction
				var action = {
					eventName: hash.on || "click"
				};

				action.parameters = {
					context: this,
					options: options,
					params: contexts
				};

				action.view = options.data.view;

				var root, target;

				if (hash.target) {
					root = this;
					target = hash.target;
				} else if (controller = options.data.keywords.controller) {
					root = controller;
				}

				action.target = { root: root, target: target, options: options };
				action.bubbles = hash.bubbles;

				var actionId = ActionHelper.registerAction(actionName, action, hash.allowedKeys);
				return new SafeString('data-ember-action="' + actionId + '"');
			});

		});

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-routing
		 */

		if (Ember.ENV.EXPERIMENTAL_CONTROL_HELPER) {
			var get = Ember.get, set = Ember.set;

			/**
			 `{{control}}` works like render, except it uses a new controller instance for every call, instead of reusing the singleton controller.

			 The control helper is currently under development and is considered experimental.
			 To enable it, set `ENV.EXPERIMENTAL_CONTROL_HELPER = true` before requiring Ember.

			 For example if you had this `author` template.

			 ```handlebars
			 <div class="author">
			 Written by {{firstName}} {{lastName}}.
			 Total Posts: {{postCount}}
			 </div>
			 ```

			 You could render it inside the `post` template using the `control` helper.

			 ```handlebars
			 <div class="post">
			 <h1>{{title}}</h1>
			 <div>{{body}}</div>
			 {{control "author" author}}
			 </div>
			 ```

			 @method control
			 @for Ember.Handlebars.helpers
			 @param {String} path
			 @param {String} modelPath
			 @param {Hash} options
			 @return {String} HTML string
			 */
			Ember.Handlebars.registerHelper('control', function(path, modelPath, options) {
				if (arguments.length === 2) {
					options = modelPath;
					modelPath = undefined;
				}

				var model;

				if (modelPath) {
					model = Ember.Handlebars.get(this, modelPath, options);
				}

				var controller = options.data.keywords.controller,
					view = options.data.keywords.view,
					children = get(controller, '_childContainers'),
					controlID = options.hash.controlID,
					container, subContainer;

				if (children.hasOwnProperty(controlID)) {
					subContainer = children[controlID];
				} else {
					container = get(controller, 'container'),
						subContainer = container.child();
					children[controlID] = subContainer;
				}

				var normalizedPath = path.replace(/\//g, '.');

				var childView = subContainer.lookup('view:' + normalizedPath) || subContainer.lookup('view:default'),
					childController = subContainer.lookup('controller:' + normalizedPath),
					childTemplate = subContainer.lookup('template:' + path);



				set(childController, 'target', controller);
				set(childController, 'model', model);

				options.hash.template = childTemplate;
				options.hash.controller = childController;

				function observer() {
					var model = Ember.Handlebars.get(this, modelPath, options);
					set(childController, 'model', model);
					childView.rerender();
				}

				if (modelPath) {
					Ember.addObserver(this, modelPath, observer);
					childView.one('willDestroyElement', this, function() {
						Ember.removeObserver(this, modelPath, observer);
					});
				}

				Ember.Handlebars.helpers.view.call(this, childView, options);
			});
		}

	})();



	(function() {

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-routing
		 */

		var get = Ember.get, set = Ember.set;

		Ember.ControllerMixin.reopen({
			/**
			 Transition the application into another route. The route may
			 be either a single route or route path:

			 ```javascript
			 aController.transitionToRoute('blogPosts');
			 aController.transitionToRoute('blogPosts.recentEntries');
			 ```

			 Optionally supply a model for the route in question. The model
			 will be serialized into the URL using the `serialize` hook of
			 the route:

			 ```javascript
			 aController.transitionToRoute('blogPost', aPost);
			 ```

			 @param {String} name the name of the route
			 @param {...Object} models the
			 @for Ember.ControllerMixin
			 @method transitionToRoute
			 */
			transitionToRoute: function() {
				// target may be either another controller or a router
				var target = get(this, 'target'),
					method = target.transitionToRoute || target.transitionTo;
				return method.apply(target, arguments);
			},

			/**
			 @deprecated
			 @for Ember.ControllerMixin
			 @method transitionTo
			 */
			transitionTo: function() {

				return this.transitionToRoute.apply(this, arguments);
			},

			/**
			 Alernative to `transitionToRoute`.  Transition the application into another route. The route may
			 be either a single route or route path:

			 ```javascript
			 aController.replaceRoute('blogPosts');
			 aController.replaceRoute('blogPosts.recentEntries');
			 ```

			 Optionally supply a model for the route in question. The model
			 will be serialized into the URL using the `serialize` hook of
			 the route:

			 ```javascript
			 aController.replaceRoute('blogPost', aPost);
			 ```

			 @param {String} name the name of the route
			 @param {...Object} models the
			 @for Ember.ControllerMixin
			 @method replaceRoute
			 */
			replaceRoute: function() {
				// target may be either another controller or a router
				var target = get(this, 'target'),
					method = target.replaceRoute || target.replaceWith;
				return method.apply(target, arguments);
			},

			/**
			 @deprecated
			 @for Ember.ControllerMixin
			 @method replaceWith
			 */
			replaceWith: function() {

				return this.replaceRoute.apply(this, arguments);
			}
		});

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-routing
		 */

		var get = Ember.get, set = Ember.set;

		Ember.View.reopen({

			/**
			 Sets the private `_outlets` object on the view.

			 @method init
			 */
			init: function() {
				set(this, '_outlets', {});
				this._super();
			},

			/**
			 Manually fill any of a view's `{{outlet}}` areas with the
			 supplied view.

			 Example

			 ```javascript
			 var MyView = Ember.View.extend({
      template: Ember.Handlebars.compile('Child view: {{outlet "main"}} ')
    });
			 var myView = MyView.create();
			 myView.appendTo('body');
			 // The html for myView now looks like:
			 // <div id="ember228" class="ember-view">Child view: </div>

			 myView.connectOutlet('main', Ember.View.extend({
      template: Ember.Handlebars.compile('<h1>Foo</h1> ')
    }));
			 // The html for myView now looks like:
			 // <div id="ember228" class="ember-view">Child view:
			 //   <div id="ember234" class="ember-view"><h1>Foo</h1> </div>
			 // </div>
			 ```
			 @method connectOutlet
			 @param  {String} outletName A unique name for the outlet
			 @param  {Object} view       An Ember.View
			 */
			connectOutlet: function(outletName, view) {
				if (this._pendingDisconnections) {
					delete this._pendingDisconnections[outletName];
				}

				if (this._hasEquivalentView(outletName, view)) {
					view.destroy();
					return;
				}

				var outlets = get(this, '_outlets'),
					container = get(this, 'container'),
					router = container && container.lookup('router:main'),
					renderedName = get(view, 'renderedName');

				set(outlets, outletName, view);

				if (router && renderedName) {
					router._connectActiveView(renderedName, view);
				}
			},

			/**
			 @private

			 Determines if the view has already been created by checking if
			 the view has the same constructor, template, and context as the
			 view in the `_outlets` object.

			 @method _hasEquivalentView
			 @param  {String} outletName The name of the outlet we are checking
			 @param  {Object} view       An Ember.View
			 @return {Boolean}
			 */
			_hasEquivalentView: function(outletName, view) {
				var existingView = get(this, '_outlets.'+outletName);
				return existingView &&
					existingView.constructor === view.constructor &&
					existingView.get('template') === view.get('template') &&
					existingView.get('context') === view.get('context');
			},

			/**
			 Removes an outlet from the view.

			 Example

			 ```javascript
			 var MyView = Ember.View.extend({
      template: Ember.Handlebars.compile('Child view: {{outlet "main"}} ')
    });
			 var myView = MyView.create();
			 myView.appendTo('body');
			 // myView's html:
			 // <div id="ember228" class="ember-view">Child view: </div>

			 myView.connectOutlet('main', Ember.View.extend({
      template: Ember.Handlebars.compile('<h1>Foo</h1> ')
    }));
			 // myView's html:
			 // <div id="ember228" class="ember-view">Child view:
			 //   <div id="ember234" class="ember-view"><h1>Foo</h1> </div>
			 // </div>

			 myView.disconnectOutlet('main');
			 // myView's html:
			 // <div id="ember228" class="ember-view">Child view: </div>
			 ```

			 @method disconnectOutlet
			 @param  {String} outletName The name of the outlet to be removed
			 */
			disconnectOutlet: function(outletName) {
				if (!this._pendingDisconnections) {
					this._pendingDisconnections = {};
				}
				this._pendingDisconnections[outletName] = true;
				Ember.run.once(this, '_finishDisconnections');
			},

			/**
			 @private

			 Gets an outlet that is pending disconnection and then
			 nullifys the object on the `_outlet` object.

			 @method _finishDisconnections
			 */
			_finishDisconnections: function() {
				var outlets = get(this, '_outlets');
				var pendingDisconnections = this._pendingDisconnections;
				this._pendingDisconnections = null;

				for (var outletName in pendingDisconnections) {
					set(outlets, outletName, null);
				}
			}
		});

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-views
		 */

// Add a new named queue after the 'actions' queue (where RSVP promises
// resolve), which is used in router transitions to prevent unnecessary
// loading state entry if all context promises resolve on the
// 'actions' queue first.

		var queues = Ember.run.queues,
			indexOf = Ember.ArrayPolyfills.indexOf;
		queues.splice(indexOf.call(queues, 'actions') + 1, 0, 'routerTransitions');

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-routing
		 */

		var get = Ember.get, set = Ember.set;

		/*
		 This file implements the `location` API used by Ember's router.

		 That API is:

		 getURL: returns the current URL
		 setURL(path): sets the current URL
		 replaceURL(path): replace the current URL (optional)
		 onUpdateURL(callback): triggers the callback when the URL changes
		 formatURL(url): formats `url` to be placed into `href` attribute

		 Calling setURL or replaceURL will not trigger onUpdateURL callbacks.

		 TODO: This should perhaps be moved so that it's visible in the doc output.
		 */

		/**
		 Ember.Location returns an instance of the correct implementation of
		 the `location` API.

		 You can pass it a `implementation` ('hash', 'history', 'none') to force a
		 particular implementation.

		 @class Location
		 @namespace Ember
		 @static
		 */
		Ember.Location = {
			/**
			 Create an instance of a an implementation of the `location` API. Requires
			 an options object with an `implementation` property.

			 Example

			 ```javascript
			 var hashLocation = Ember.Location.create({implementation: 'hash'});
			 var historyLocation = Ember.Location.create({implementation: 'history'});
			 var noneLocation = Ember.Location.create({implementation: 'none'});
			 ```

			 @method create
			 @param {Object} options
			 @return {Object} an instance of an implementation of the `location` API
			 */
			create: function(options) {
				var implementation = options && options.implementation;


				var implementationClass = this.implementations[implementation];


				return implementationClass.create.apply(implementationClass, arguments);
			},

			/**
			 Registers a class that implements the `location` API with an implementation
			 name. This implementation name can then be specified by the location property on
			 the application's router class.

			 Example

			 ```javascript
			 Ember.Location.registerImplementation('history', Ember.HistoryLocation);

			 App.Router.reopen({
     location: 'history'
   });
			 ```

			 @method registerImplementation
			 @param {String} name
			 @param {Object} implementation of the `location` API
			 */
			registerImplementation: function(name, implementation) {
				this.implementations[name] = implementation;
			},

			implementations: {}
		};

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-routing
		 */

		var get = Ember.get, set = Ember.set;

		/**
		 Ember.NoneLocation does not interact with the browser. It is useful for
		 testing, or when you need to manage state with your Router, but temporarily
		 don't want it to muck with the URL (for example when you embed your
		 application in a larger page).

		 @class NoneLocation
		 @namespace Ember
		 @extends Ember.Object
		 */
		Ember.NoneLocation = Ember.Object.extend({
			path: '',

			/**
			 @private

			 Returns the current path.

			 @method getURL
			 @return {String} path
			 */
			getURL: function() {
				return get(this, 'path');
			},

			/**
			 @private

			 Set the path and remembers what was set. Using this method
			 to change the path will not invoke the `updateURL` callback.

			 @method setURL
			 @param path {String}
			 */
			setURL: function(path) {
				set(this, 'path', path);
			},

			/**
			 @private

			 Register a callback to be invoked when the path changes. These
			 callbacks will execute when the user presses the back or forward
			 button, but not after `setURL` is invoked.

			 @method onUpdateURL
			 @param callback {Function}
			 */
			onUpdateURL: function(callback) {
				this.updateCallback = callback;
			},

			/**
			 @private

			 Sets the path and calls the `updateURL` callback.

			 @method handleURL
			 @param callback {Function}
			 */
			handleURL: function(url) {
				set(this, 'path', url);
				this.updateCallback(url);
			},

			/**
			 @private

			 Given a URL, formats it to be placed into the page as part
			 of an element's `href` attribute.

			 This is used, for example, when using the {{action}} helper
			 to generate a URL based on an event.

			 @method formatURL
			 @param url {String}
			 @return {String} url
			 */
			formatURL: function(url) {
				// The return value is not overly meaningful, but we do not want to throw
				// errors when test code renders templates containing {{action href=true}}
				// helpers.
				return url;
			}
		});

		Ember.Location.registerImplementation('none', Ember.NoneLocation);

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-routing
		 */

		var get = Ember.get, set = Ember.set;

		/**
		 Ember.HashLocation implements the location API using the browser's
		 hash. At present, it relies on a hashchange event existing in the
		 browser.

		 @class HashLocation
		 @namespace Ember
		 @extends Ember.Object
		 */
		Ember.HashLocation = Ember.Object.extend({

			init: function() {
				set(this, 'location', get(this, 'location') || window.location);
			},

			/**
			 @private

			 Returns the current `location.hash`, minus the '#' at the front.

			 @method getURL
			 */
			getURL: function() {
				return get(this, 'location').hash.substr(1);
			},

			/**
			 @private

			 Set the `location.hash` and remembers what was set. This prevents
			 `onUpdateURL` callbacks from triggering when the hash was set by
			 `HashLocation`.

			 @method setURL
			 @param path {String}
			 */
			setURL: function(path) {
				get(this, 'location').hash = path;
				set(this, 'lastSetURL', path);
			},

			/**
			 @private

			 Uses location.replace to update the url without a page reload
			 or history modification.

			 @method replaceURL
			 @param path {String}
			 */
			replaceURL: function(path) {
				get(this, 'location').replace('#' + path);
			},

			/**
			 @private

			 Register a callback to be invoked when the hash changes. These
			 callbacks will execute when the user presses the back or forward
			 button, but not after `setURL` is invoked.

			 @method onUpdateURL
			 @param callback {Function}
			 */
			onUpdateURL: function(callback) {
				var self = this;
				var guid = Ember.guidFor(this);

				Ember.$(window).on('hashchange.ember-location-'+guid, function() {
					Ember.run(function() {
						var path = location.hash.substr(1);
						if (get(self, 'lastSetURL') === path) { return; }

						set(self, 'lastSetURL', null);

						callback(path);
					});
				});
			},

			/**
			 @private

			 Given a URL, formats it to be placed into the page as part
			 of an element's `href` attribute.

			 This is used, for example, when using the {{action}} helper
			 to generate a URL based on an event.

			 @method formatURL
			 @param url {String}
			 */
			formatURL: function(url) {
				return '#'+url;
			},

			/**
			 @private

			 Cleans up the HashLocation event listener.

			 @method willDestroy
			 */
			willDestroy: function() {
				var guid = Ember.guidFor(this);

				Ember.$(window).off('hashchange.ember-location-'+guid);
			}
		});

		Ember.Location.registerImplementation('hash', Ember.HashLocation);

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-routing
		 */

		var get = Ember.get, set = Ember.set;
		var popstateFired = false;
		var supportsHistoryState = window.history && 'state' in window.history;

		/**
		 Ember.HistoryLocation implements the location API using the browser's
		 history.pushState API.

		 @class HistoryLocation
		 @namespace Ember
		 @extends Ember.Object
		 */
		Ember.HistoryLocation = Ember.Object.extend({

			init: function() {
				set(this, 'location', get(this, 'location') || window.location);
				this.initState();
			},

			/**
			 @private

			 Used to set state on first call to setURL

			 @method initState
			 */
			initState: function() {
				set(this, 'history', get(this, 'history') || window.history);
				this.replaceState(this.formatURL(this.getURL()));
			},

			/**
			 Will be pre-pended to path upon state change

			 @property rootURL
			 @default '/'
			 */
			rootURL: '/',

			/**
			 @private

			 Returns the current `location.pathname` without rootURL

			 @method getURL
			 @return url {String}
			 */
			getURL: function() {
				var rootURL = get(this, 'rootURL'),
					url = get(this, 'location').pathname;

				rootURL = rootURL.replace(/\/$/, '');
				url = url.replace(rootURL, '');

				return url;
			},

			/**
			 @private

			 Uses `history.pushState` to update the url without a page reload.

			 @method setURL
			 @param path {String}
			 */
			setURL: function(path) {
				var state = this.getState();
				path = this.formatURL(path);

				if (state && state.path !== path) {
					this.pushState(path);
				}
			},

			/**
			 @private

			 Uses `history.replaceState` to update the url without a page reload
			 or history modification.

			 @method replaceURL
			 @param path {String}
			 */
			replaceURL: function(path) {
				var state = this.getState();
				path = this.formatURL(path);

				if (state && state.path !== path) {
					this.replaceState(path);
				}
			},

			/**
			 @private

			 Get the current `history.state`
			 Polyfill checks for native browser support and falls back to retrieving
			 from a private _historyState variable

			 @method getState
			 @return state {Object}
			 */
			getState: function() {
				return supportsHistoryState ? get(this, 'history').state : this._historyState;
			},

			/**
			 @private

			 Pushes a new state

			 @method pushState
			 @param path {String}
			 */
			pushState: function(path) {
				var state = { path: path };

				get(this, 'history').pushState(state, null, path);

				// store state if browser doesn't support `history.state`
				if (!supportsHistoryState) {
					this._historyState = state;
				}

				// used for webkit workaround
				this._previousURL = this.getURL();
			},

			/**
			 @private

			 Replaces the current state

			 @method replaceState
			 @param path {String}
			 */
			replaceState: function(path) {
				var state = { path: path };

				get(this, 'history').replaceState(state, null, path);

				// store state if browser doesn't support `history.state`
				if (!supportsHistoryState) {
					this._historyState = state;
				}

				// used for webkit workaround
				this._previousURL = this.getURL();
			},

			/**
			 @private

			 Register a callback to be invoked whenever the browser
			 history changes, including using forward and back buttons.

			 @method onUpdateURL
			 @param callback {Function}
			 */
			onUpdateURL: function(callback) {
				var guid = Ember.guidFor(this),
					self = this;

				Ember.$(window).on('popstate.ember-location-'+guid, function(e) {
					// Ignore initial page load popstate event in Chrome
					if (!popstateFired) {
						popstateFired = true;
						if (self.getURL() === self._previousURL) { return; }
					}
					callback(self.getURL());
				});
			},

			/**
			 @private

			 Used when using `{{action}}` helper.  The url is always appended to the rootURL.

			 @method formatURL
			 @param url {String}
			 @return formatted url {String}
			 */
			formatURL: function(url) {
				var rootURL = get(this, 'rootURL');

				if (url !== '') {
					rootURL = rootURL.replace(/\/$/, '');
				}

				return rootURL + url;
			},

			/**
			 @private

			 Cleans up the HistoryLocation event listener.

			 @method willDestroy
			 */
			willDestroy: function() {
				var guid = Ember.guidFor(this);

				Ember.$(window).off('popstate.ember-location-'+guid);
			}
		});

		Ember.Location.registerImplementation('history', Ember.HistoryLocation);

	})();



	(function() {

	})();



	(function() {
		/**
		 Ember Routing

		 @module ember
		 @submodule ember-routing
		 @requires ember-views
		 */

	})();

	(function() {
		function visit(vertex, fn, visited, path) {
			var name = vertex.name,
				vertices = vertex.incoming,
				names = vertex.incomingNames,
				len = names.length,
				i;
			if (!visited) {
				visited = {};
			}
			if (!path) {
				path = [];
			}
			if (visited.hasOwnProperty(name)) {
				return;
			}
			path.push(name);
			visited[name] = true;
			for (i = 0; i < len; i++) {
				visit(vertices[names[i]], fn, visited, path);
			}
			fn(vertex, path);
			path.pop();
		}

		function DAG() {
			this.names = [];
			this.vertices = {};
		}

		DAG.prototype.add = function(name) {
			if (!name) { return; }
			if (this.vertices.hasOwnProperty(name)) {
				return this.vertices[name];
			}
			var vertex = {
				name: name, incoming: {}, incomingNames: [], hasOutgoing: false, value: null
			};
			this.vertices[name] = vertex;
			this.names.push(name);
			return vertex;
		};

		DAG.prototype.map = function(name, value) {
			this.add(name).value = value;
		};

		DAG.prototype.addEdge = function(fromName, toName) {
			if (!fromName || !toName || fromName === toName) {
				return;
			}
			var from = this.add(fromName), to = this.add(toName);
			if (to.incoming.hasOwnProperty(fromName)) {
				return;
			}
			function checkCycle(vertex, path) {
				if (vertex.name === toName) {
					throw new Error("cycle detected: " + toName + " <- " + path.join(" <- "));
				}
			}
			visit(from, checkCycle);
			from.hasOutgoing = true;
			to.incoming[fromName] = from;
			to.incomingNames.push(fromName);
		};

		DAG.prototype.topsort = function(fn) {
			var visited = {},
				vertices = this.vertices,
				names = this.names,
				len = names.length,
				i, vertex;
			for (i = 0; i < len; i++) {
				vertex = vertices[names[i]];
				if (!vertex.hasOutgoing) {
					visit(vertex, fn, visited);
				}
			}
		};

		DAG.prototype.addEdges = function(name, value, before, after) {
			var i;
			this.map(name, value);
			if (before) {
				if (typeof before === 'string') {
					this.addEdge(name, before);
				} else {
					for (i = 0; i < before.length; i++) {
						this.addEdge(name, before[i]);
					}
				}
			}
			if (after) {
				if (typeof after === 'string') {
					this.addEdge(after, name);
				} else {
					for (i = 0; i < after.length; i++) {
						this.addEdge(after[i], name);
					}
				}
			}
		};

		Ember.DAG = DAG;

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-application
		 */

		var get = Ember.get,
			classify = Ember.String.classify,
			capitalize = Ember.String.capitalize,
			decamelize = Ember.String.decamelize;

		/**
		 The DefaultResolver defines the default lookup rules to resolve
		 container lookups before consulting the container for registered
		 items:

		 * templates are looked up on `Ember.TEMPLATES`
		 * other names are looked up on the application after converting
		 the name. For example, `controller:post` looks up
		 `App.PostController` by default.
		 * there are some nuances (see examples below)

		 ### How Resolving Works

		 The container calls this object's `resolve` method with the
		 `fullName` argument.

		 It first parses the fullName into an object using `parseName`.

		 Then it checks for the presence of a type-specific instance
		 method of the form `resolve[Type]` and calls it if it exists.
		 For example if it was resolving 'template:post', it would call
		 the `resolveTemplate` method.

		 Its last resort is to call the `resolveOther` method.

		 The methods of this object are designed to be easy to override
		 in a subclass. For example, you could enhance how a template
		 is resolved like so:

		 ```javascript
		 App = Ember.Application.create({
    Resolver: Ember.DefaultResolver.extend({
      resolveTemplate: function(parsedName) {
        var resolvedTemplate = this._super(parsedName);
        if (resolvedTemplate) { return resolvedTemplate; }
        return Ember.TEMPLATES['not_found'];
      }
    })
  });
		 ```

		 Some examples of how names are resolved:

		 ```
		 'template:post' //=> Ember.TEMPLATES['post']
		 'template:posts/byline' //=> Ember.TEMPLATES['posts/byline']
		 'template:posts.byline' //=> Ember.TEMPLATES['posts/byline']
		 'template:blogPost' //=> Ember.TEMPLATES['blogPost']
		 //   OR
		 //   Ember.TEMPLATES['blog_post']
		 'controller:post' //=> App.PostController
		 'controller:posts.index' //=> App.PostsIndexController
		 'controller:blog/post' //=> Blog.PostController
		 'controller:basic' //=> Ember.Controller
		 'route:post' //=> App.PostRoute
		 'route:posts.index' //=> App.PostsIndexRoute
		 'route:blog/post' //=> Blog.PostRoute
		 'route:basic' //=> Ember.Route
		 'view:post' //=> App.PostView
		 'view:posts.index' //=> App.PostsIndexView
		 'view:blog/post' //=> Blog.PostView
		 'view:basic' //=> Ember.View
		 'foo:post' //=> App.PostFoo
		 'model:post' //=> App.Post
		 ```

		 @class DefaultResolver
		 @namespace Ember
		 @extends Ember.Object
		 */
		Ember.DefaultResolver = Ember.Object.extend({
			/**
			 This will be set to the Application instance when it is
			 created.

			 @property namespace
			 */
			namespace: null,

			normalize: function(fullName) {
				var split = fullName.split(':', 2),
					type = split[0],
					name = split[1];


				if (type !== 'template') {
					var result = name;

					if (result.indexOf('.') > -1) {
						result = result.replace(/\.(.)/g, function(m) { return m.charAt(1).toUpperCase(); });
					}

					if (name.indexOf('_') > -1) {
						result = result.replace(/_(.)/g, function(m) { return m.charAt(1).toUpperCase(); });
					}

					return type + ':' + result;
				} else {
					return fullName;
				}
			},


			/**
			 This method is called via the container's resolver method.
			 It parses the provided `fullName` and then looks up and
			 returns the appropriate template or class.

			 @method resolve
			 @param {String} fullName the lookup string
			 @return {Object} the resolved factory
			 */
			resolve: function(fullName) {
				var parsedName = this.parseName(fullName),
					typeSpecificResolveMethod = this[parsedName.resolveMethodName];

				if (!parsedName.name || !parsedName.type) {
					throw new TypeError("Invalid fullName: `" + fullName + "`, must of of the form `type:name` ");
				}

				if (typeSpecificResolveMethod) {
					var resolved = typeSpecificResolveMethod.call(this, parsedName);
					if (resolved) { return resolved; }
				}
				return this.resolveOther(parsedName);
			},
			/**
			 Convert the string name of the form "type:name" to
			 a Javascript object with the parsed aspects of the name
			 broken out.

			 @protected
			 @param {String} fullName the lookup string
			 @method parseName
			 */
			parseName: function(fullName) {
				var nameParts = fullName.split(":"),
					type = nameParts[0], fullNameWithoutType = nameParts[1],
					name = fullNameWithoutType,
					namespace = get(this, 'namespace'),
					root = namespace;

				if (type !== 'template' && name.indexOf('/') !== -1) {
					var parts = name.split('/');
					name = parts[parts.length - 1];
					var namespaceName = capitalize(parts.slice(0, -1).join('.'));
					root = Ember.Namespace.byName(namespaceName);

				}

				return {
					fullName: fullName,
					type: type,
					fullNameWithoutType: fullNameWithoutType,
					name: name,
					root: root,
					resolveMethodName: "resolve" + classify(type)
				};
			},
			/**
			 Look up the template in Ember.TEMPLATES

			 @protected
			 @param {Object} parsedName a parseName object with the parsed
			 fullName lookup string
			 @method resolveTemplate
			 */
			resolveTemplate: function(parsedName) {
				var templateName = parsedName.fullNameWithoutType.replace(/\./g, '/');

				if (Ember.TEMPLATES[templateName]) {
					return Ember.TEMPLATES[templateName];
				}

				templateName = decamelize(templateName);
				if (Ember.TEMPLATES[templateName]) {
					return Ember.TEMPLATES[templateName];
				}
			},
			/**
			 Given a parseName object (output from `parseName`), apply
			 the conventions expected by `Ember.Router`

			 @protected
			 @param {Object} parsedName a parseName object with the parsed
			 fullName lookup string
			 @method useRouterNaming
			 */
			useRouterNaming: function(parsedName) {
				parsedName.name = parsedName.name.replace(/\./g, '_');
				if (parsedName.name === 'basic') {
					parsedName.name = '';
				}
			},
			/**
			 Lookup the controller using `resolveOther`

			 @protected
			 @param {Object} parsedName a parseName object with the parsed
			 fullName lookup string
			 @method resolveController
			 */
			resolveController: function(parsedName) {
				this.useRouterNaming(parsedName);
				return this.resolveOther(parsedName);
			},
			/**
			 Lookup the route using `resolveOther`

			 @protected
			 @param {Object} parsedName a parseName object with the parsed
			 fullName lookup string
			 @method resolveRoute
			 */
			resolveRoute: function(parsedName) {
				this.useRouterNaming(parsedName);
				return this.resolveOther(parsedName);
			},
			/**
			 Lookup the view using `resolveOther`

			 @protected
			 @param {Object} parsedName a parseName object with the parsed
			 fullName lookup string
			 @method resolveView
			 */
			resolveView: function(parsedName) {
				this.useRouterNaming(parsedName);
				return this.resolveOther(parsedName);
			},

			/**
			 Lookup the model on the Application namespace

			 @protected
			 @param {Object} parsedName a parseName object with the parsed
			 fullName lookup string
			 @method resolveModel
			 */
			resolveModel: function(parsedName) {
				var className = classify(parsedName.name),
					factory = get(parsedName.root, className);

				if (factory) { return factory; }
			},
			/**
			 Look up the specified object (from parsedName) on the appropriate
			 namespace (usually on the Application)

			 @protected
			 @param {Object} parsedName a parseName object with the parsed
			 fullName lookup string
			 @method resolveOther
			 */
			resolveOther: function(parsedName) {
				var className = classify(parsedName.name) + classify(parsedName.type),
					factory = get(parsedName.root, className);
				if (factory) { return factory; }
			},

			/**
			 Returns a human-readable description for a fullName. Used by the
			 Application namespace in assertions to describe the
			 precise name of the class that Ember is looking for, rather than
			 container keys.

			 @protected
			 @param {String} fullName the lookup string
			 @method lookupDescription
			 */
			lookupDescription: function(fullName) {
				var parsedName = this.parseName(fullName);

				if (parsedName.type === 'template') {
					return "template at " + parsedName.fullNameWithoutType.replace(/\./g, '/');
				}

				var description = parsedName.root + "." + classify(parsedName.name);
				if (parsedName.type !== 'model') { description += classify(parsedName.type); }

				return description;
			},

			makeToString: function(factory, fullName) {
				return factory.toString();
			}
		});

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-application
		 */

		var get = Ember.get, set = Ember.set;

		function DeprecatedContainer(container) {
			this._container = container;
		}

		DeprecatedContainer.deprecate = function(method) {
			return function() {
				var container = this._container;

				return container[method].apply(container, arguments);
			};
		};

		DeprecatedContainer.prototype = {
			_container: null,
			lookup: DeprecatedContainer.deprecate('lookup'),
			resolve: DeprecatedContainer.deprecate('resolve'),
			register: DeprecatedContainer.deprecate('register')
		};

		/**
		 An instance of `Ember.Application` is the starting point for every Ember
		 application. It helps to instantiate, initialize and coordinate the many
		 objects that make up your app.

		 Each Ember app has one and only one `Ember.Application` object. In fact, the
		 very first thing you should do in your application is create the instance:

		 ```javascript
		 window.App = Ember.Application.create();
		 ```

		 Typically, the application object is the only global variable. All other
		 classes in your app should be properties on the `Ember.Application` instance,
		 which highlights its first role: a global namespace.

		 For example, if you define a view class, it might look like this:

		 ```javascript
		 App.MyView = Ember.View.extend();
		 ```

		 By default, calling `Ember.Application.create()` will automatically initialize
		 your application by calling the `Ember.Application.initialize()` method. If
		 you need to delay initialization, you can call your app's `deferReadiness()`
		 method. When you are ready for your app to be initialized, call its
		 `advanceReadiness()` method.

		 You can define a `ready` method on the `Ember.Application` instance, which
		 will be run by Ember when the application is initialized.

		 Because `Ember.Application` inherits from `Ember.Namespace`, any classes
		 you create will have useful string representations when calling `toString()`.
		 See the `Ember.Namespace` documentation for more information.

		 While you can think of your `Ember.Application` as a container that holds the
		 other classes in your application, there are several other responsibilities
		 going on under-the-hood that you may want to understand.

		 ### Event Delegation

		 Ember uses a technique called _event delegation_. This allows the framework
		 to set up a global, shared event listener instead of requiring each view to
		 do it manually. For example, instead of each view registering its own
		 `mousedown` listener on its associated element, Ember sets up a `mousedown`
		 listener on the `body`.

		 If a `mousedown` event occurs, Ember will look at the target of the event and
		 start walking up the DOM node tree, finding corresponding views and invoking
		 their `mouseDown` method as it goes.

		 `Ember.Application` has a number of default events that it listens for, as
		 well as a mapping from lowercase events to camel-cased view method names. For
		 example, the `keypress` event causes the `keyPress` method on the view to be
		 called, the `dblclick` event causes `doubleClick` to be called, and so on.

		 If there is a browser event that Ember does not listen for by default, you
		 can specify custom events and their corresponding view method names by
		 setting the application's `customEvents` property:

		 ```javascript
		 App = Ember.Application.create({
    customEvents: {
      // add support for the loadedmetadata media
      // player event
      'loadedmetadata': "loadedMetadata"
    }
  });
		 ```

		 By default, the application sets up these event listeners on the document
		 body. However, in cases where you are embedding an Ember application inside
		 an existing page, you may want it to set up the listeners on an element
		 inside the body.

		 For example, if only events inside a DOM element with the ID of `ember-app`
		 should be delegated, set your application's `rootElement` property:

		 ```javascript
		 window.App = Ember.Application.create({
    rootElement: '#ember-app'
  });
		 ```

		 The `rootElement` can be either a DOM element or a jQuery-compatible selector
		 string. Note that *views appended to the DOM outside the root element will
		 not receive events.* If you specify a custom root element, make sure you only
		 append views inside it!

		 To learn more about the advantages of event delegation and the Ember view
		 layer, and a list of the event listeners that are setup by default, visit the
		 [Ember View Layer guide](http://emberjs.com/guides/understanding-ember/the-view-layer/#toc_event-delegation).

		 ### Initializers

		 Libraries on top of Ember can register additional initializers, like so:

		 ```javascript
		 Ember.Application.initializer({
    name: "store",

    initialize: function(container, application) {
      container.register('store:main', application.Store);
    }
  });
		 ```

		 ### Routing

		 In addition to creating your application's router, `Ember.Application` is
		 also responsible for telling the router when to start routing. Transitions
		 between routes can be logged with the `LOG_TRANSITIONS` flag, and more
		 detailed intra-transition logging can be logged with
		 the `LOG_TRANSITIONS_INTERNAL` flag:

		 ```javascript
		 window.App = Ember.Application.create({
    LOG_TRANSITIONS: true, // basic logging of successful transitions
    LOG_TRANSITIONS_INTERNAL: true // detailed logging of all routing steps
  });
		 ```

		 By default, the router will begin trying to translate the current URL into
		 application state once the browser emits the `DOMContentReady` event. If you
		 need to defer routing, you can call the application's `deferReadiness()`
		 method. Once routing can begin, call the `advanceReadiness()` method.

		 If there is any setup required before routing begins, you can implement a
		 `ready()` method on your app that will be invoked immediately before routing
		 begins.
		 ```

		 @class Application
		 @namespace Ember
		 @extends Ember.Namespace
		 */

		var Application = Ember.Application = Ember.Namespace.extend(Ember.DeferredMixin, {

			/**
			 The root DOM element of the Application. This can be specified as an
			 element or a
			 [jQuery-compatible selector string](http://api.jquery.com/category/selectors/).

			 This is the element that will be passed to the Application's,
			 `eventDispatcher`, which sets up the listeners for event delegation. Every
			 view in your application should be a child of the element you specify here.

			 @property rootElement
			 @type DOMElement
			 @default 'body'
			 */
			rootElement: 'body',

			/**
			 The `Ember.EventDispatcher` responsible for delegating events to this
			 application's views.

			 The event dispatcher is created by the application at initialization time
			 and sets up event listeners on the DOM element described by the
			 application's `rootElement` property.

			 See the documentation for `Ember.EventDispatcher` for more information.

			 @property eventDispatcher
			 @type Ember.EventDispatcher
			 @default null
			 */
			eventDispatcher: null,

			/**
			 The DOM events for which the event dispatcher should listen.

			 By default, the application's `Ember.EventDispatcher` listens
			 for a set of standard DOM events, such as `mousedown` and
			 `keyup`, and delegates them to your application's `Ember.View`
			 instances.

			 If you would like additional events to be delegated to your
			 views, set your `Ember.Application`'s `customEvents` property
			 to a hash containing the DOM event name as the key and the
			 corresponding view method name as the value. For example:

			 ```javascript
			 App = Ember.Application.create({
      customEvents: {
        // add support for the loadedmetadata media
        // player event
        'loadedmetadata': "loadedMetadata"
      }
    });
			 ```

			 @property customEvents
			 @type Object
			 @default null
			 */
			customEvents: null,

			// Start off the number of deferrals at 1. This will be
			// decremented by the Application's own `initialize` method.
			_readinessDeferrals: 1,

			init: function() {
				if (!this.$) { this.$ = Ember.$; }
				this.__container__ = this.buildContainer();

				this.Router = this.Router || this.defaultRouter();
				if (this.Router) { this.Router.namespace = this; }

				this._super();

				this.scheduleInitialize();

				if (Ember.LOG_VERSION) {
					Ember.LOG_VERSION = false; // we only need to see this once per Application#init





				}
			},

			/**
			 @private

			 Build the container for the current application.

			 Also register a default application view in case the application
			 itself does not.

			 @method buildContainer
			 @return {Ember.Container} the configured container
			 */
			buildContainer: function() {
				var container = this.__container__ = Application.buildContainer(this);

				return container;
			},

			/**
			 @private

			 If the application has not opted out of routing and has not explicitly
			 defined a router, supply a default router for the application author
			 to configure.

			 This allows application developers to do:

			 ```javascript
			 var App = Ember.Application.create();

			 App.Router.map(function() {
      this.resource('posts');
    });
			 ```

			 @method defaultRouter
			 @return {Ember.Router} the default router
			 */
			defaultRouter: function() {
				// Create a default App.Router if one was not supplied to make
				// it possible to do App.Router.map(...) without explicitly
				// creating a router first.
				if (this.router === undefined) {
					return Ember.Router.extend();
				}
			},

			/**
			 @private

			 Automatically initialize the application once the DOM has
			 become ready.

			 The initialization itself is scheduled on the actions queue
			 which ensures that application loading finishes before
			 booting.

			 If you are asynchronously loading code, you should call
			 `deferReadiness()` to defer booting, and then call
			 `advanceReadiness()` once all of your code has finished
			 loading.

			 @method scheduleInitialize
			 */
			scheduleInitialize: function() {
				var self = this;

				if (!this.$ || this.$.isReady) {
					Ember.run.schedule('actions', self, '_initialize');
				} else {
					this.$().ready(function() {
						Ember.run(self, '_initialize');
					});
				}
			},

			/**
			 Use this to defer readiness until some condition is true.

			 Example:

			 ```javascript
			 App = Ember.Application.create();
			 App.deferReadiness();

			 jQuery.getJSON("/auth-token", function(token) {
      App.token = token;
      App.advanceReadiness();
    });
			 ```

			 This allows you to perform asynchronous setup logic and defer
			 booting your application until the setup has finished.

			 However, if the setup requires a loading UI, it might be better
			 to use the router for this purpose.

			 @method deferReadiness
			 */
			deferReadiness: function() {


				this._readinessDeferrals++;
			},

			/**
			 Call `advanceReadiness` after any asynchronous setup logic has completed.
			 Each call to `deferReadiness` must be matched by a call to `advanceReadiness`
			 or the application will never become ready and routing will not begin.

			 @method advanceReadiness
			 @see {Ember.Application#deferReadiness}
			 */
			advanceReadiness: function() {

				this._readinessDeferrals--;

				if (this._readinessDeferrals === 0) {
					Ember.run.once(this, this.didBecomeReady);
				}
			},

			/**
			 registers a factory for later injection

			 Example:

			 ```javascript
			 App = Ember.Application.create();

			 App.Person = Ember.Object.extend({});
			 App.Orange = Ember.Object.extend({});
			 App.Email  = Ember.Object.extend({});

			 App.register('model:user', App.Person, {singleton: false });
			 App.register('fruit:favorite', App.Orange);
			 App.register('communication:main', App.Email, {singleton: false});
			 ```

			 @method register
			 @param  type {String}
			 @param  name {String}
			 @param  factory {String}
			 @param  options {String} (optional)
			 **/
			register: function() {
				var container = this.__container__;
				container.register.apply(container, arguments);
			},
			/**
			 defines an injection or typeInjection

			 Example:

			 ```javascript
			 App.inject(<full_name or type>, <property name>, <full_name>)
			 App.inject('model:user', 'email', 'model:email')
			 App.inject('model', 'source', 'source:main')
			 ```

			 @method inject
			 @param  factoryNameOrType {String}
			 @param  property {String}
			 @param  injectionName {String}
			 **/
			inject: function() {
				var container = this.__container__;
				container.injection.apply(container, arguments);
			},

			/**
			 @private
			 @deprecated

			 Calling initialize manually is not supported.

			 Please see Ember.Application#advanceReadiness and
			 Ember.Application#deferReadiness.

			 @method initialize
			 **/
			initialize: function() {

			},
			/**
			 @private

			 Initialize the application. This happens automatically.

			 Run any initializers and run the application load hook. These hooks may
			 choose to defer readiness. For example, an authentication hook might want
			 to defer readiness until the auth token has been retrieved.

			 @method _initialize
			 */
			_initialize: function() {
				if (this.isDestroyed) { return; }

				// At this point, the App.Router must already be assigned
				this.register('router:main', this.Router);

				this.runInitializers();
				Ember.runLoadHooks('application', this);

				// At this point, any initializers or load hooks that would have wanted
				// to defer readiness have fired. In general, advancing readiness here
				// will proceed to didBecomeReady.
				this.advanceReadiness();

				return this;
			},

			/**
			 Reset the application. This is typically used only in tests. It cleans up
			 the application in the following order:

			 1. Deactivate existing routes
			 2. Destroy all objects in the container
			 3. Create a new application container
			 4. Re-route to the existing url

			 Typical Example:

			 ```javascript

			 var App;

			 Ember.run(function() {
      App = Ember.Application.create();
    });

			 module("acceptance test", {
      setup: function() {
        App.reset();
      }
    });

			 test("first test", function() {
      // App is freshly reset
    });

			 test("first test", function() {
      // App is again freshly reset
    });
			 ```

			 Advanced Example:

			 Occasionally you may want to prevent the app from initializing during
			 setup. This could enable extra configuration, or enable asserting prior
			 to the app becoming ready.

			 ```javascript

			 var App;

			 Ember.run(function() {
      App = Ember.Application.create();
    });

			 module("acceptance test", {
      setup: function() {
        Ember.run(function() {
          App.reset();
          App.deferReadiness();
        });
      }
    });

			 test("first test", function() {
      ok(true, 'something before app is initialized');

      Ember.run(function() {
        App.advanceReadiness();
      });
      ok(true, 'something after app is initialized');
    });
			 ```

			 @method reset
			 **/
			reset: function() {
				this._readinessDeferrals = 1;

				function handleReset() {
					var router = this.__container__.lookup('router:main');
					router.reset();

					Ember.run(this.__container__, 'destroy');

					this.buildContainer();

					Ember.run.schedule('actions', this, function() {
						this._initialize();
					});
				}

				Ember.run.join(this, handleReset);
			},

			/**
			 @private
			 @method runInitializers
			 */
			runInitializers: function() {
				var initializers = get(this.constructor, 'initializers'),
					container = this.__container__,
					graph = new Ember.DAG(),
					namespace = this,
					i, initializer;

				for (i=0; i<initializers.length; i++) {
					initializer = initializers[i];
					graph.addEdges(initializer.name, initializer.initialize, initializer.before, initializer.after);
				}

				graph.topsort(function (vertex) {
					var initializer = vertex.value;

					initializer(container, namespace);
				});
			},

			/**
			 @private
			 @method didBecomeReady
			 */
			didBecomeReady: function() {
				this.setupEventDispatcher();
				this.ready(); // user hook
				this.startRouting();

				if (!Ember.testing) {
					// Eagerly name all classes that are already loaded
					Ember.Namespace.processAll();
					Ember.BOOTED = true;
				}

				this.resolve(this);
			},

			/**
			 @private

			 Setup up the event dispatcher to receive events on the
			 application's `rootElement` with any registered
			 `customEvents`.

			 @method setupEventDispatcher
			 */
			setupEventDispatcher: function() {
				var customEvents = get(this, 'customEvents'),
					rootElement = get(this, 'rootElement'),
					dispatcher = this.__container__.lookup('event_dispatcher:main');

				set(this, 'eventDispatcher', dispatcher);
				dispatcher.setup(customEvents, rootElement);
			},

			/**
			 @private

			 If the application has a router, use it to route to the current URL, and
			 trigger a new call to `route` whenever the URL changes.

			 @method startRouting
			 @property router {Ember.Router}
			 */
			startRouting: function() {
				var router = this.__container__.lookup('router:main');
				if (!router) { return; }

				router.startRouting();
			},

			handleURL: function(url) {
				var router = this.__container__.lookup('router:main');

				router.handleURL(url);
			},

			/**
			 Called when the Application has become ready.
			 The call will be delayed until the DOM has become ready.

			 @event ready
			 */
			ready: Ember.K,

			/**

			 @deprecated Use 'Resolver' instead
			 Set this to provide an alternate class to `Ember.DefaultResolver`

			 @property resolver
			 */
			resolver: null,

			/**
			 Set this to provide an alternate class to `Ember.DefaultResolver`

			 @property resolver
			 */
			Resolver: null,

			willDestroy: function() {
				Ember.BOOTED = false;

				this.__container__.destroy();
			},

			initializer: function(options) {
				this.constructor.initializer(options);
			}
		});

		Ember.Application.reopenClass({
			concatenatedProperties: ['initializers'],
			initializers: Ember.A(),
			initializer: function(initializer) {
				var initializers = get(this, 'initializers');




				initializers.push(initializer);
			},

			/**
			 @private

			 This creates a container with the default Ember naming conventions.

			 It also configures the container:

			 * registered views are created every time they are looked up (they are
			 not singletons)
			 * registered templates are not factories; the registered value is
			 returned directly.
			 * the router receives the application as its `namespace` property
			 * all controllers receive the router as their `target` and `controllers`
			 properties
			 * all controllers receive the application as their `namespace` property
			 * the application view receives the application controller as its
			 `controller` property
			 * the application view receives the application template as its
			 `defaultTemplate` property

			 @method buildContainer
			 @static
			 @param {Ember.Application} namespace the application to build the
			 container for.
			 @return {Ember.Container} the built container
			 */
			buildContainer: function(namespace) {
				var container = new Ember.Container();

				Ember.Container.defaultContainer = new DeprecatedContainer(container);

				container.set = Ember.set;
				container.resolver  = resolverFor(namespace);
				container.normalize = container.resolver.normalize;
				container.describe  = container.resolver.describe;
				container.makeToString = container.resolver.makeToString;

				container.optionsForType('component', { singleton: false });
				container.optionsForType('view', { singleton: false });
				container.optionsForType('template', { instantiate: false });
				container.register('application:main', namespace, { instantiate: false });

				container.register('controller:basic', Ember.Controller, { instantiate: false });
				container.register('controller:object', Ember.ObjectController, { instantiate: false });
				container.register('controller:array', Ember.ArrayController, { instantiate: false });
				container.register('route:basic', Ember.Route, { instantiate: false });
				container.register('event_dispatcher:main', Ember.EventDispatcher);

				container.injection('router:main', 'namespace', 'application:main');

				container.injection('controller', 'target', 'router:main');
				container.injection('controller', 'namespace', 'application:main');

				container.injection('route', 'router', 'router:main');

				return container;
			}
		});

		/**
		 @private

		 This function defines the default lookup rules for container lookups:

		 * templates are looked up on `Ember.TEMPLATES`
		 * other names are looked up on the application after classifying the name.
		 For example, `controller:post` looks up `App.PostController` by default.
		 * if the default lookup fails, look for registered classes on the container

		 This allows the application to register default injections in the container
		 that could be overridden by the normal naming convention.

		 @method resolverFor
		 @param {Ember.Namespace} namespace the namespace to look for classes
		 @return {*} the resolved value for a given lookup
		 */
		function resolverFor(namespace) {
			if (namespace.get('resolver')) {

			}

			var ResolverClass = namespace.get('resolver') || namespace.get('Resolver') || Ember.DefaultResolver;
			var resolver = ResolverClass.create({
				namespace: namespace
			});

			function resolve(fullName) {
				return resolver.resolve(fullName);
			}

			resolve.describe = function(fullName) {
				return resolver.lookupDescription(fullName);
			};

			resolve.makeToString = function(factory, fullName) {
				return resolver.makeToString(factory, fullName);
			};

			resolve.normalize = function(fullName) {
				if (resolver.normalize) {
					return resolver.normalize(fullName);
				} else {

					return fullName;
				}
			};

			return resolve;
		}

		Ember.runLoadHooks('Ember.Application', Ember.Application);

	})();



	(function() {

	})();



	(function() {
		/**
		 @module ember
		 @submodule ember-application
		 */

		var get = Ember.get, set = Ember.set;

		function verifyNeedsDependencies(controller, container, needs) {
			var dependency, i, l;

			for (i=0, l=needs.length; i<l; i++) {
				dependency = needs[i];
				if (dependency.indexOf(':') === -1) {
					dependency = "controller:" + dependency;
				}

				// Structure assert to still do verification but not string concat in production
				if (!container.has(dependency)) {

				}
			}
		}

		/**
		 @class ControllerMixin
		 @namespace Ember
		 */
		Ember.ControllerMixin.reopen({
			concatenatedProperties: ['needs'],

			/**
			 An array of other controller objects available inside
			 instances of this controller via the `controllers`
			 property:

			 For example, when you define a controller:

			 ```javascript
			 App.CommentsController = Ember.ArrayController.extend({
      needs: ['post']
    });
			 ```

			 The application's single instance of these other
			 controllers are accessible by name through the
			 `controllers` property:

			 ```javascript
			 this.get('controllers.post'); // instance of App.PostController
			 ```

			 This is only available for singleton controllers.

			 @property {Array} needs
			 @default []
			 */
			needs: [],

			init: function() {
				var needs = get(this, 'needs'),
					length = get(needs, 'length');

				if (length > 0) {
					verifyNeedsDependencies(this, this.container, needs);

					// if needs then initialize controllers proxy
					get(this, 'controllers');
				}

				this._super.apply(this, arguments);
			},

			controllerFor: function(controllerName) {

				return Ember.controllerFor(get(this, 'container'), controllerName);
			},

			/**
			 Stores the instances of other controllers available from within
			 this controller. Any controller listed by name in the `needs`
			 property will be accessible by name through this property.

			 ```javascript
			 App.CommentsController = Ember.ArrayController.extend({
      needs: ['post'],
      postTitle: function(){
        var currentPost = this.get('controllers.post'); // instance of App.PostController
        return currentPost.get('title');
      }.property('controllers.post.title')
    });
			 ```

			 @see {Ember.ControllerMixin#needs}
			 @property {Object} controllers
			 @default null
			 */
			controllers: Ember.computed(function() {
				var controller = this;

				return {
					needs: get(controller, 'needs'),
					container: get(controller, 'container'),
					unknownProperty: function(controllerName) {
						var needs = this.needs,
							dependency, i, l;
						for (i=0, l=needs.length; i<l; i++) {
							dependency = needs[i];
							if (dependency === controllerName) {
								return this.container.lookup('controller:' + controllerName);
							}
						}

						var errorMessage = Ember.inspect(controller) + '#needs does not include `' + controllerName + '`. To access the ' + controllerName + ' controller from ' + Ember.inspect(controller) + ', ' + Ember.inspect(controller) + ' should have a `needs` property that is an array of the controllers it has access to.';
						throw new ReferenceError(errorMessage);
					}
				};
			}).readOnly()
		});

	})();



	(function() {

	})();



	(function() {
		/**
		 Ember Application

		 @module ember
		 @submodule ember-application
		 @requires ember-views, ember-routing
		 */

	})();

	(function() {
		/**
		 @module ember
		 @submodule ember-extension-support
		 */
		/**
		 The `DataAdapter` helps a data persistence library
		 interface with tools that debug Ember such
		 as the Chrome Ember Extension.

		 This class will be extended by a persistence library
		 which will override some of the methods with
		 library-specific code.

		 The methods likely to be overriden are
		 `getFilters`, `detect`, `columnsForType`,
		 `getRecords`, `getRecordColumnValues`,
		 `getRecordKeywords`, `getRecordFilterValues`,
		 `getRecordColor`, `observeRecord`

		 The adapter will need to be registered
		 in the application's container as `dataAdapter:main`

		 Example:
		 ```javascript
		 Application.initializer({
    name: "dataAdapter",

    initialize: function(container, application) {
      application.register('dataAdapter:main', DS.DataAdapter);
    }
  });
		 ```

		 @class DataAdapter
		 @namespace Ember
		 @extends Ember.Object
		 */
		Ember.DataAdapter = Ember.Object.extend({
			init: function() {
				this._super();
				this.releaseMethods = Ember.A();
			},

			/**
			 The container of the application being debugged.
			 This property will be injected
			 on creation.
			 */
			container: null,

			/**
			 @private

			 Number of attributes to send
			 as columns. (Enough to make the record
			 identifiable).
			 */
			attributeLimit: 3,

			/**
			 @private

			 Stores all methods that clear observers.
			 These methods will be called on destruction.
			 */
			releaseMethods: Ember.A(),

			/**
			 @public

			 Specifies how records can be filtered.
			 Records returned will need to have a `filterValues`
			 property with a key for every name in the returned array.

			 @method getFilters
			 @return {Array} List of objects defining filters.
			 The object should have a `name` and `desc` property.
			 */
			getFilters: function() {
				return Ember.A();
			},

			/**
			 @public

			 Fetch the model types and observe them for changes.

			 @method watchModelTypes

			 @param {Function} typesAdded Callback to call to add types.
			 Takes an array of objects containing wrapped types (returned from `wrapModelType`).

			 @param {Function} typesUpdated Callback to call when a type has changed.
			 Takes an array of objects containing wrapped types.

			 @return {Function} Method to call to remove all observers
			 */
			watchModelTypes: function(typesAdded, typesUpdated) {
				var modelTypes = this.getModelTypes(),
					self = this, typesToSend, releaseMethods = Ember.A();

				typesToSend = modelTypes.map(function(type) {
					var wrapped = self.wrapModelType(type);
					releaseMethods.push(self.observeModelType(type, typesUpdated));
					return wrapped;
				});

				typesAdded(typesToSend);

				var release = function() {
					releaseMethods.forEach(function(fn) { fn(); });
					self.releaseMethods.removeObject(release);
				};
				this.releaseMethods.pushObject(release);
				return release;
			},

			/**
			 @public

			 Fetch the records of a given type and observe them for changes.

			 @method watchRecords

			 @param {Function} recordsAdded Callback to call to add records.
			 Takes an array of objects containing wrapped records.
			 The object should have the following properties:
			 columnValues: {Object} key and value of a table cell
			 object: {Object} the actual record object

			 @param {Function} recordsUpdated Callback to call when a record has changed.
			 Takes an array of objects containing wrapped records.

			 @param {Function} recordsRemoved Callback to call when a record has removed.
			 Takes the following parameters:
			 index: the array index where the records were removed
			 count: the number of records removed

			 @return {Function} Method to call to remove all observers
			 */
			watchRecords: function(type, recordsAdded, recordsUpdated, recordsRemoved) {
				var self = this, releaseMethods = Ember.A(), records = this.getRecords(type), release;

				var recordUpdated = function(updatedRecord) {
					recordsUpdated([updatedRecord]);
				};

				var recordsToSend = records.map(function(record) {
					releaseMethods.push(self.observeRecord(record, recordUpdated));
					return self.wrapRecord(record);
				});


				var contentDidChange = function(array, idx, removedCount, addedCount) {
					for (var i = idx; i < idx + addedCount; i++) {
						var record = array.objectAt(i);
						var wrapped = self.wrapRecord(record);
						releaseMethods.push(self.observeRecord(record, recordUpdated));
						recordsAdded([wrapped]);
					}

					if (removedCount) {
						recordsRemoved(idx, removedCount);
					}
				};

				var observer = { didChange: contentDidChange, willChange: Ember.K };
				records.addArrayObserver(self, observer);

				release = function() {
					releaseMethods.forEach(function(fn) { fn(); });
					records.removeArrayObserver(self, observer);
					self.releaseMethods.removeObject(release);
				};

				recordsAdded(recordsToSend);

				this.releaseMethods.pushObject(release);
				return release;
			},

			/**
			 @private

			 Clear all observers before destruction
			 */
			willDestroy: function() {
				this._super();
				this.releaseMethods.forEach(function(fn) {
					fn();
				});
			},

			/**
			 @private

			 Detect whether a class is a model.

			 Test that against the model class
			 of your persistence library

			 @method detect
			 @param {Class} klass The class to test
			 @return boolean Whether the class is a model class or not
			 */
			detect: function(klass) {
				return false;
			},

			/**
			 @private

			 Get the columns for a given model type.

			 @method columnsForType
			 @param {Class} type The model type
			 @return {Array} An array of columns of the following format:
			 name: {String} name of the column
			 desc: {String} Humanized description (what would show in a table column name)
			 */
			columnsForType: function(type) {
				return Ember.A();
			},

			/**
			 @private

			 Adds observers to a model type class.

			 @method observeModelType
			 @param {Class} type The model type class
			 @param {Function} typesUpdated Called when a type is modified.
			 @return {Function} The function to call to remove observers
			 */

			observeModelType: function(type, typesUpdated) {
				var self = this, records = this.getRecords(type);

				var onChange = function() {
					typesUpdated([self.wrapModelType(type)]);
				};
				var observer = {
					didChange: function() {
						Ember.run.scheduleOnce('actions', this, onChange);
					},
					willChange: Ember.K
				};

				records.addArrayObserver(this, observer);

				var release = function() {
					records.removeArrayObserver(self, observer);
				};

				return release;
			},


			/**
			 @private

			 Wraps a given model type and observes changes to it.

			 @method wrapModelType
			 @param {Class} type A model class
			 @param {Function} typesUpdated callback to call when the type changes
			 @return {Object} contains the wrapped type and the function to remove observers
			 Format:
			 type: {Object} the wrapped type
			 The wrapped type has the following format:
			 name: {String} name of the type
			 count: {Integer} number of records available
			 columns: {Columns} array of columns to describe the record
			 object: {Class} the actual Model type class
			 release: {Function} The function to remove observers
			 */
			wrapModelType: function(type, typesUpdated) {
				var release, records = this.getRecords(type),
					typeToSend, self = this;

				typeToSend = {
					name: type.toString(),
					count: Ember.get(records, 'length'),
					columns: this.columnsForType(type),
					object: type
				};


				return typeToSend;
			},


			/**
			 @private

			 Fetches all models defined in the application.
			 TODO: Use the resolver instead of looping over namespaces.

			 @method getModelTypes
			 @return {Array} Array of model types
			 */
			getModelTypes: function() {
				var namespaces = Ember.A(Ember.Namespace.NAMESPACES), types = Ember.A(), self = this;

				namespaces.forEach(function(namespace) {
					for (var key in namespace) {
						if (!namespace.hasOwnProperty(key)) { continue; }
						var klass = namespace[key];
						if (self.detect(klass)) {
							types.push(klass);
						}
					}
				});
				return types;
			},

			/**
			 @private

			 Fetches all loaded records for a given type.

			 @method getRecords
			 @return {Array} array of records.
			 This array will be observed for changes,
			 so it should update when new records are added/removed.
			 */
			getRecords: function(type) {
				return Ember.A();
			},

			/**
			 @private

			 Wraps a record and observers changes to it

			 @method wrapRecord
			 @param {Object} record The record instance
			 @return {Object} the wrapped record. Format:
			 columnValues: {Array}
			 searchKeywords: {Array}
			 */
			wrapRecord: function(record) {
				var recordToSend = { object: record }, columnValues = {}, self = this;

				recordToSend.columnValues = this.getRecordColumnValues(record);
				recordToSend.searchKeywords = this.getRecordKeywords(record);
				recordToSend.filterValues = this.getRecordFilterValues(record);
				recordToSend.color = this.getRecordColor(record);

				return recordToSend;
			},

			/**
			 @private

			 Gets the values for each column.

			 @method getRecordColumnValues
			 @return {Object} Keys should match column names defined
			 by the model type.
			 */
			getRecordColumnValues: function(record) {
				return {};
			},

			/**
			 @private

			 Returns keywords to match when searching records.

			 @method getRecordKeywords
			 @return {Array} Relevant keywords for search.
			 */
			getRecordKeywords: function(record) {
				return Ember.A();
			},

			/**
			 @private

			 Returns the values of filters defined by `getFilters`.

			 @method getRecordFilterValues
			 @param {Object} record The record instance
			 @return {Object} The filter values
			 */
			getRecordFilterValues: function(record) {
				return {};
			},

			/**
			 @private

			 Each record can have a color that represents its state.

			 @method getRecordColor
			 @param {Object} record The record instance
			 @return {String} The record's color
			 Possible options: black, red, blue, green
			 */
			getRecordColor: function(record) {
				return null;
			},

			/**
			 @private

			 Observes all relevant properties and re-sends the wrapped record
			 when a change occurs.

			 @method observerRecord
			 @param {Object} record The record instance
			 @param {Function} recordUpdated The callback to call when a record is updated.
			 @return {Function} The function to call to remove all observers.
			 */
			observeRecord: function(record, recordUpdated) {
				return function(){};
			}

		});


	})();



	(function() {
		/**
		 Ember Extension Support

		 @module ember
		 @submodule ember-extension-support
		 @requires ember-application
		 */

	})();


})();


if (typeof location !== 'undefined' && (location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
	Ember.Logger.warn("You are running a production build of Ember on localhost and won't receive detailed error messages. "+
		"If you want full error messages please use the non-minified build provided on the Ember website.");
}  return Ember;});
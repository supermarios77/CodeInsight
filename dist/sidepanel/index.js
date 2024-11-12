(function () {
  'use strict';

  /*! @license DOMPurify 3.1.7 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.1.7/LICENSE */

  const {
    entries,
    setPrototypeOf,
    isFrozen,
    getPrototypeOf,
    getOwnPropertyDescriptor
  } = Object;
  let {
    freeze,
    seal,
    create
  } = Object; // eslint-disable-line import/no-mutable-exports
  let {
    apply,
    construct
  } = typeof Reflect !== 'undefined' && Reflect;
  if (!freeze) {
    freeze = function freeze(x) {
      return x;
    };
  }
  if (!seal) {
    seal = function seal(x) {
      return x;
    };
  }
  if (!apply) {
    apply = function apply(fun, thisValue, args) {
      return fun.apply(thisValue, args);
    };
  }
  if (!construct) {
    construct = function construct(Func, args) {
      return new Func(...args);
    };
  }
  const arrayForEach = unapply(Array.prototype.forEach);
  const arrayPop = unapply(Array.prototype.pop);
  const arrayPush = unapply(Array.prototype.push);
  const stringToLowerCase = unapply(String.prototype.toLowerCase);
  const stringToString = unapply(String.prototype.toString);
  const stringMatch = unapply(String.prototype.match);
  const stringReplace = unapply(String.prototype.replace);
  const stringIndexOf = unapply(String.prototype.indexOf);
  const stringTrim = unapply(String.prototype.trim);
  const objectHasOwnProperty = unapply(Object.prototype.hasOwnProperty);
  const regExpTest = unapply(RegExp.prototype.test);
  const typeErrorCreate = unconstruct(TypeError);

  /**
   * Creates a new function that calls the given function with a specified thisArg and arguments.
   *
   * @param {Function} func - The function to be wrapped and called.
   * @returns {Function} A new function that calls the given function with a specified thisArg and arguments.
   */
  function unapply(func) {
    return function (thisArg) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      return apply(func, thisArg, args);
    };
  }

  /**
   * Creates a new function that constructs an instance of the given constructor function with the provided arguments.
   *
   * @param {Function} func - The constructor function to be wrapped and called.
   * @returns {Function} A new function that constructs an instance of the given constructor function with the provided arguments.
   */
  function unconstruct(func) {
    return function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      return construct(func, args);
    };
  }

  /**
   * Add properties to a lookup table
   *
   * @param {Object} set - The set to which elements will be added.
   * @param {Array} array - The array containing elements to be added to the set.
   * @param {Function} transformCaseFunc - An optional function to transform the case of each element before adding to the set.
   * @returns {Object} The modified set with added elements.
   */
  function addToSet(set, array) {
    let transformCaseFunc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : stringToLowerCase;
    if (setPrototypeOf) {
      // Make 'in' and truthy checks like Boolean(set.constructor)
      // independent of any properties defined on Object.prototype.
      // Prevent prototype setters from intercepting set as a this value.
      setPrototypeOf(set, null);
    }
    let l = array.length;
    while (l--) {
      let element = array[l];
      if (typeof element === 'string') {
        const lcElement = transformCaseFunc(element);
        if (lcElement !== element) {
          // Config presets (e.g. tags.js, attrs.js) are immutable.
          if (!isFrozen(array)) {
            array[l] = lcElement;
          }
          element = lcElement;
        }
      }
      set[element] = true;
    }
    return set;
  }

  /**
   * Clean up an array to harden against CSPP
   *
   * @param {Array} array - The array to be cleaned.
   * @returns {Array} The cleaned version of the array
   */
  function cleanArray(array) {
    for (let index = 0; index < array.length; index++) {
      const isPropertyExist = objectHasOwnProperty(array, index);
      if (!isPropertyExist) {
        array[index] = null;
      }
    }
    return array;
  }

  /**
   * Shallow clone an object
   *
   * @param {Object} object - The object to be cloned.
   * @returns {Object} A new object that copies the original.
   */
  function clone(object) {
    const newObject = create(null);
    for (const [property, value] of entries(object)) {
      const isPropertyExist = objectHasOwnProperty(object, property);
      if (isPropertyExist) {
        if (Array.isArray(value)) {
          newObject[property] = cleanArray(value);
        } else if (value && typeof value === 'object' && value.constructor === Object) {
          newObject[property] = clone(value);
        } else {
          newObject[property] = value;
        }
      }
    }
    return newObject;
  }

  /**
   * This method automatically checks if the prop is function or getter and behaves accordingly.
   *
   * @param {Object} object - The object to look up the getter function in its prototype chain.
   * @param {String} prop - The property name for which to find the getter function.
   * @returns {Function} The getter function found in the prototype chain or a fallback function.
   */
  function lookupGetter(object, prop) {
    while (object !== null) {
      const desc = getOwnPropertyDescriptor(object, prop);
      if (desc) {
        if (desc.get) {
          return unapply(desc.get);
        }
        if (typeof desc.value === 'function') {
          return unapply(desc.value);
        }
      }
      object = getPrototypeOf(object);
    }
    function fallbackValue() {
      return null;
    }
    return fallbackValue;
  }

  const html$1 = freeze(['a', 'abbr', 'acronym', 'address', 'area', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo', 'big', 'blink', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'content', 'data', 'datalist', 'dd', 'decorator', 'del', 'details', 'dfn', 'dialog', 'dir', 'div', 'dl', 'dt', 'element', 'em', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'main', 'map', 'mark', 'marquee', 'menu', 'menuitem', 'meter', 'nav', 'nobr', 'ol', 'optgroup', 'option', 'output', 'p', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'section', 'select', 'shadow', 'small', 'source', 'spacer', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'tr', 'track', 'tt', 'u', 'ul', 'var', 'video', 'wbr']);

  // SVG
  const svg$1 = freeze(['svg', 'a', 'altglyph', 'altglyphdef', 'altglyphitem', 'animatecolor', 'animatemotion', 'animatetransform', 'circle', 'clippath', 'defs', 'desc', 'ellipse', 'filter', 'font', 'g', 'glyph', 'glyphref', 'hkern', 'image', 'line', 'lineargradient', 'marker', 'mask', 'metadata', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialgradient', 'rect', 'stop', 'style', 'switch', 'symbol', 'text', 'textpath', 'title', 'tref', 'tspan', 'view', 'vkern']);
  const svgFilters = freeze(['feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feDropShadow', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence']);

  // List of SVG elements that are disallowed by default.
  // We still need to know them so that we can do namespace
  // checks properly in case one wants to add them to
  // allow-list.
  const svgDisallowed = freeze(['animate', 'color-profile', 'cursor', 'discard', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri', 'foreignobject', 'hatch', 'hatchpath', 'mesh', 'meshgradient', 'meshpatch', 'meshrow', 'missing-glyph', 'script', 'set', 'solidcolor', 'unknown', 'use']);
  const mathMl$1 = freeze(['math', 'menclose', 'merror', 'mfenced', 'mfrac', 'mglyph', 'mi', 'mlabeledtr', 'mmultiscripts', 'mn', 'mo', 'mover', 'mpadded', 'mphantom', 'mroot', 'mrow', 'ms', 'mspace', 'msqrt', 'mstyle', 'msub', 'msup', 'msubsup', 'mtable', 'mtd', 'mtext', 'mtr', 'munder', 'munderover', 'mprescripts']);

  // Similarly to SVG, we want to know all MathML elements,
  // even those that we disallow by default.
  const mathMlDisallowed = freeze(['maction', 'maligngroup', 'malignmark', 'mlongdiv', 'mscarries', 'mscarry', 'msgroup', 'mstack', 'msline', 'msrow', 'semantics', 'annotation', 'annotation-xml', 'mprescripts', 'none']);
  const text = freeze(['#text']);

  const html$2 = freeze(['accept', 'action', 'align', 'alt', 'autocapitalize', 'autocomplete', 'autopictureinpicture', 'autoplay', 'background', 'bgcolor', 'border', 'capture', 'cellpadding', 'cellspacing', 'checked', 'cite', 'class', 'clear', 'color', 'cols', 'colspan', 'controls', 'controlslist', 'coords', 'crossorigin', 'datetime', 'decoding', 'default', 'dir', 'disabled', 'disablepictureinpicture', 'disableremoteplayback', 'download', 'draggable', 'enctype', 'enterkeyhint', 'face', 'for', 'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'id', 'inputmode', 'integrity', 'ismap', 'kind', 'label', 'lang', 'list', 'loading', 'loop', 'low', 'max', 'maxlength', 'media', 'method', 'min', 'minlength', 'multiple', 'muted', 'name', 'nonce', 'noshade', 'novalidate', 'nowrap', 'open', 'optimum', 'pattern', 'placeholder', 'playsinline', 'popover', 'popovertarget', 'popovertargetaction', 'poster', 'preload', 'pubdate', 'radiogroup', 'readonly', 'rel', 'required', 'rev', 'reversed', 'role', 'rows', 'rowspan', 'spellcheck', 'scope', 'selected', 'shape', 'size', 'sizes', 'span', 'srclang', 'start', 'src', 'srcset', 'step', 'style', 'summary', 'tabindex', 'title', 'translate', 'type', 'usemap', 'valign', 'value', 'width', 'wrap', 'xmlns', 'slot']);
  const svg = freeze(['accent-height', 'accumulate', 'additive', 'alignment-baseline', 'amplitude', 'ascent', 'attributename', 'attributetype', 'azimuth', 'basefrequency', 'baseline-shift', 'begin', 'bias', 'by', 'class', 'clip', 'clippathunits', 'clip-path', 'clip-rule', 'color', 'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering', 'cx', 'cy', 'd', 'dx', 'dy', 'diffuseconstant', 'direction', 'display', 'divisor', 'dur', 'edgemode', 'elevation', 'end', 'exponent', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'filterunits', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'fx', 'fy', 'g1', 'g2', 'glyph-name', 'glyphref', 'gradientunits', 'gradienttransform', 'height', 'href', 'id', 'image-rendering', 'in', 'in2', 'intercept', 'k', 'k1', 'k2', 'k3', 'k4', 'kerning', 'keypoints', 'keysplines', 'keytimes', 'lang', 'lengthadjust', 'letter-spacing', 'kernelmatrix', 'kernelunitlength', 'lighting-color', 'local', 'marker-end', 'marker-mid', 'marker-start', 'markerheight', 'markerunits', 'markerwidth', 'maskcontentunits', 'maskunits', 'max', 'mask', 'media', 'method', 'mode', 'min', 'name', 'numoctaves', 'offset', 'operator', 'opacity', 'order', 'orient', 'orientation', 'origin', 'overflow', 'paint-order', 'path', 'pathlength', 'patterncontentunits', 'patterntransform', 'patternunits', 'points', 'preservealpha', 'preserveaspectratio', 'primitiveunits', 'r', 'rx', 'ry', 'radius', 'refx', 'refy', 'repeatcount', 'repeatdur', 'restart', 'result', 'rotate', 'scale', 'seed', 'shape-rendering', 'slope', 'specularconstant', 'specularexponent', 'spreadmethod', 'startoffset', 'stddeviation', 'stitchtiles', 'stop-color', 'stop-opacity', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke', 'stroke-width', 'style', 'surfacescale', 'systemlanguage', 'tabindex', 'tablevalues', 'targetx', 'targety', 'transform', 'transform-origin', 'text-anchor', 'text-decoration', 'text-rendering', 'textlength', 'type', 'u1', 'u2', 'unicode', 'values', 'viewbox', 'visibility', 'version', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'width', 'word-spacing', 'wrap', 'writing-mode', 'xchannelselector', 'ychannelselector', 'x', 'x1', 'x2', 'xmlns', 'y', 'y1', 'y2', 'z', 'zoomandpan']);
  const mathMl = freeze(['accent', 'accentunder', 'align', 'bevelled', 'close', 'columnsalign', 'columnlines', 'columnspan', 'denomalign', 'depth', 'dir', 'display', 'displaystyle', 'encoding', 'fence', 'frame', 'height', 'href', 'id', 'largeop', 'length', 'linethickness', 'lspace', 'lquote', 'mathbackground', 'mathcolor', 'mathsize', 'mathvariant', 'maxsize', 'minsize', 'movablelimits', 'notation', 'numalign', 'open', 'rowalign', 'rowlines', 'rowspacing', 'rowspan', 'rspace', 'rquote', 'scriptlevel', 'scriptminsize', 'scriptsizemultiplier', 'selection', 'separator', 'separators', 'stretchy', 'subscriptshift', 'supscriptshift', 'symmetric', 'voffset', 'width', 'xmlns']);
  const xml = freeze(['xlink:href', 'xml:id', 'xlink:title', 'xml:space', 'xmlns:xlink']);

  // eslint-disable-next-line unicorn/better-regex
  const MUSTACHE_EXPR = seal(/\{\{[\w\W]*|[\w\W]*\}\}/gm); // Specify template detection regex for SAFE_FOR_TEMPLATES mode
  const ERB_EXPR = seal(/<%[\w\W]*|[\w\W]*%>/gm);
  const TMPLIT_EXPR = seal(/\${[\w\W]*}/gm);
  const DATA_ATTR = seal(/^data-[\-\w.\u00B7-\uFFFF]/); // eslint-disable-line no-useless-escape
  const ARIA_ATTR = seal(/^aria-[\-\w]+$/); // eslint-disable-line no-useless-escape
  const IS_ALLOWED_URI = seal(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i // eslint-disable-line no-useless-escape
  );
  const IS_SCRIPT_OR_DATA = seal(/^(?:\w+script|data):/i);
  const ATTR_WHITESPACE = seal(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g // eslint-disable-line no-control-regex
  );
  const DOCTYPE_NAME = seal(/^html$/i);
  const CUSTOM_ELEMENT = seal(/^[a-z][.\w]*(-[.\w]+)+$/i);

  var EXPRESSIONS = /*#__PURE__*/Object.freeze({
    __proto__: null,
    MUSTACHE_EXPR: MUSTACHE_EXPR,
    ERB_EXPR: ERB_EXPR,
    TMPLIT_EXPR: TMPLIT_EXPR,
    DATA_ATTR: DATA_ATTR,
    ARIA_ATTR: ARIA_ATTR,
    IS_ALLOWED_URI: IS_ALLOWED_URI,
    IS_SCRIPT_OR_DATA: IS_SCRIPT_OR_DATA,
    ATTR_WHITESPACE: ATTR_WHITESPACE,
    DOCTYPE_NAME: DOCTYPE_NAME,
    CUSTOM_ELEMENT: CUSTOM_ELEMENT
  });

  // https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
  const NODE_TYPE = {
    element: 1,
    attribute: 2,
    text: 3,
    cdataSection: 4,
    entityReference: 5,
    // Deprecated
    entityNode: 6,
    // Deprecated
    progressingInstruction: 7,
    comment: 8,
    document: 9,
    documentType: 10,
    documentFragment: 11,
    notation: 12 // Deprecated
  };
  const getGlobal = function getGlobal() {
    return typeof window === 'undefined' ? null : window;
  };

  /**
   * Creates a no-op policy for internal use only.
   * Don't export this function outside this module!
   * @param {TrustedTypePolicyFactory} trustedTypes The policy factory.
   * @param {HTMLScriptElement} purifyHostElement The Script element used to load DOMPurify (to determine policy name suffix).
   * @return {TrustedTypePolicy} The policy created (or null, if Trusted Types
   * are not supported or creating the policy failed).
   */
  const _createTrustedTypesPolicy = function _createTrustedTypesPolicy(trustedTypes, purifyHostElement) {
    if (typeof trustedTypes !== 'object' || typeof trustedTypes.createPolicy !== 'function') {
      return null;
    }

    // Allow the callers to control the unique policy name
    // by adding a data-tt-policy-suffix to the script element with the DOMPurify.
    // Policy creation with duplicate names throws in Trusted Types.
    let suffix = null;
    const ATTR_NAME = 'data-tt-policy-suffix';
    if (purifyHostElement && purifyHostElement.hasAttribute(ATTR_NAME)) {
      suffix = purifyHostElement.getAttribute(ATTR_NAME);
    }
    const policyName = 'dompurify' + (suffix ? '#' + suffix : '');
    try {
      return trustedTypes.createPolicy(policyName, {
        createHTML(html) {
          return html;
        },
        createScriptURL(scriptUrl) {
          return scriptUrl;
        }
      });
    } catch (_) {
      // Policy creation failed (most likely another DOMPurify script has
      // already run). Skip creating the policy, as this will only cause errors
      // if TT are enforced.
      console.warn('TrustedTypes policy ' + policyName + ' could not be created.');
      return null;
    }
  };
  function createDOMPurify() {
    let window = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getGlobal();
    const DOMPurify = root => createDOMPurify(root);

    /**
     * Version label, exposed for easier checks
     * if DOMPurify is up to date or not
     */
    DOMPurify.version = '3.1.7';

    /**
     * Array of elements that DOMPurify removed during sanitation.
     * Empty if nothing was removed.
     */
    DOMPurify.removed = [];
    if (!window || !window.document || window.document.nodeType !== NODE_TYPE.document) {
      // Not running in a browser, provide a factory function
      // so that you can pass your own Window
      DOMPurify.isSupported = false;
      return DOMPurify;
    }
    let {
      document
    } = window;
    const originalDocument = document;
    const currentScript = originalDocument.currentScript;
    const {
      DocumentFragment,
      HTMLTemplateElement,
      Node,
      Element,
      NodeFilter,
      NamedNodeMap = window.NamedNodeMap || window.MozNamedAttrMap,
      HTMLFormElement,
      DOMParser,
      trustedTypes
    } = window;
    const ElementPrototype = Element.prototype;
    const cloneNode = lookupGetter(ElementPrototype, 'cloneNode');
    const remove = lookupGetter(ElementPrototype, 'remove');
    const getNextSibling = lookupGetter(ElementPrototype, 'nextSibling');
    const getChildNodes = lookupGetter(ElementPrototype, 'childNodes');
    const getParentNode = lookupGetter(ElementPrototype, 'parentNode');

    // As per issue #47, the web-components registry is inherited by a
    // new document created via createHTMLDocument. As per the spec
    // (http://w3c.github.io/webcomponents/spec/custom/#creating-and-passing-registries)
    // a new empty registry is used when creating a template contents owner
    // document, so we use that as our parent document to ensure nothing
    // is inherited.
    if (typeof HTMLTemplateElement === 'function') {
      const template = document.createElement('template');
      if (template.content && template.content.ownerDocument) {
        document = template.content.ownerDocument;
      }
    }
    let trustedTypesPolicy;
    let emptyHTML = '';
    const {
      implementation,
      createNodeIterator,
      createDocumentFragment,
      getElementsByTagName
    } = document;
    const {
      importNode
    } = originalDocument;
    let hooks = {};

    /**
     * Expose whether this browser supports running the full DOMPurify.
     */
    DOMPurify.isSupported = typeof entries === 'function' && typeof getParentNode === 'function' && implementation && implementation.createHTMLDocument !== undefined;
    const {
      MUSTACHE_EXPR,
      ERB_EXPR,
      TMPLIT_EXPR,
      DATA_ATTR,
      ARIA_ATTR,
      IS_SCRIPT_OR_DATA,
      ATTR_WHITESPACE,
      CUSTOM_ELEMENT
    } = EXPRESSIONS;
    let {
      IS_ALLOWED_URI: IS_ALLOWED_URI$1
    } = EXPRESSIONS;

    /**
     * We consider the elements and attributes below to be safe. Ideally
     * don't add any new ones but feel free to remove unwanted ones.
     */

    /* allowed element names */
    let ALLOWED_TAGS = null;
    const DEFAULT_ALLOWED_TAGS = addToSet({}, [...html$1, ...svg$1, ...svgFilters, ...mathMl$1, ...text]);

    /* Allowed attribute names */
    let ALLOWED_ATTR = null;
    const DEFAULT_ALLOWED_ATTR = addToSet({}, [...html$2, ...svg, ...mathMl, ...xml]);

    /*
     * Configure how DOMPUrify should handle custom elements and their attributes as well as customized built-in elements.
     * @property {RegExp|Function|null} tagNameCheck one of [null, regexPattern, predicate]. Default: `null` (disallow any custom elements)
     * @property {RegExp|Function|null} attributeNameCheck one of [null, regexPattern, predicate]. Default: `null` (disallow any attributes not on the allow list)
     * @property {boolean} allowCustomizedBuiltInElements allow custom elements derived from built-ins if they pass CUSTOM_ELEMENT_HANDLING.tagNameCheck. Default: `false`.
     */
    let CUSTOM_ELEMENT_HANDLING = Object.seal(create(null, {
      tagNameCheck: {
        writable: true,
        configurable: false,
        enumerable: true,
        value: null
      },
      attributeNameCheck: {
        writable: true,
        configurable: false,
        enumerable: true,
        value: null
      },
      allowCustomizedBuiltInElements: {
        writable: true,
        configurable: false,
        enumerable: true,
        value: false
      }
    }));

    /* Explicitly forbidden tags (overrides ALLOWED_TAGS/ADD_TAGS) */
    let FORBID_TAGS = null;

    /* Explicitly forbidden attributes (overrides ALLOWED_ATTR/ADD_ATTR) */
    let FORBID_ATTR = null;

    /* Decide if ARIA attributes are okay */
    let ALLOW_ARIA_ATTR = true;

    /* Decide if custom data attributes are okay */
    let ALLOW_DATA_ATTR = true;

    /* Decide if unknown protocols are okay */
    let ALLOW_UNKNOWN_PROTOCOLS = false;

    /* Decide if self-closing tags in attributes are allowed.
     * Usually removed due to a mXSS issue in jQuery 3.0 */
    let ALLOW_SELF_CLOSE_IN_ATTR = true;

    /* Output should be safe for common template engines.
     * This means, DOMPurify removes data attributes, mustaches and ERB
     */
    let SAFE_FOR_TEMPLATES = false;

    /* Output should be safe even for XML used within HTML and alike.
     * This means, DOMPurify removes comments when containing risky content.
     */
    let SAFE_FOR_XML = true;

    /* Decide if document with <html>... should be returned */
    let WHOLE_DOCUMENT = false;

    /* Track whether config is already set on this instance of DOMPurify. */
    let SET_CONFIG = false;

    /* Decide if all elements (e.g. style, script) must be children of
     * document.body. By default, browsers might move them to document.head */
    let FORCE_BODY = false;

    /* Decide if a DOM `HTMLBodyElement` should be returned, instead of a html
     * string (or a TrustedHTML object if Trusted Types are supported).
     * If `WHOLE_DOCUMENT` is enabled a `HTMLHtmlElement` will be returned instead
     */
    let RETURN_DOM = false;

    /* Decide if a DOM `DocumentFragment` should be returned, instead of a html
     * string  (or a TrustedHTML object if Trusted Types are supported) */
    let RETURN_DOM_FRAGMENT = false;

    /* Try to return a Trusted Type object instead of a string, return a string in
     * case Trusted Types are not supported  */
    let RETURN_TRUSTED_TYPE = false;

    /* Output should be free from DOM clobbering attacks?
     * This sanitizes markups named with colliding, clobberable built-in DOM APIs.
     */
    let SANITIZE_DOM = true;

    /* Achieve full DOM Clobbering protection by isolating the namespace of named
     * properties and JS variables, mitigating attacks that abuse the HTML/DOM spec rules.
     *
     * HTML/DOM spec rules that enable DOM Clobbering:
     *   - Named Access on Window (§7.3.3)
     *   - DOM Tree Accessors (§3.1.5)
     *   - Form Element Parent-Child Relations (§4.10.3)
     *   - Iframe srcdoc / Nested WindowProxies (§4.8.5)
     *   - HTMLCollection (§4.2.10.2)
     *
     * Namespace isolation is implemented by prefixing `id` and `name` attributes
     * with a constant string, i.e., `user-content-`
     */
    let SANITIZE_NAMED_PROPS = false;
    const SANITIZE_NAMED_PROPS_PREFIX = 'user-content-';

    /* Keep element content when removing element? */
    let KEEP_CONTENT = true;

    /* If a `Node` is passed to sanitize(), then performs sanitization in-place instead
     * of importing it into a new Document and returning a sanitized copy */
    let IN_PLACE = false;

    /* Allow usage of profiles like html, svg and mathMl */
    let USE_PROFILES = {};

    /* Tags to ignore content of when KEEP_CONTENT is true */
    let FORBID_CONTENTS = null;
    const DEFAULT_FORBID_CONTENTS = addToSet({}, ['annotation-xml', 'audio', 'colgroup', 'desc', 'foreignobject', 'head', 'iframe', 'math', 'mi', 'mn', 'mo', 'ms', 'mtext', 'noembed', 'noframes', 'noscript', 'plaintext', 'script', 'style', 'svg', 'template', 'thead', 'title', 'video', 'xmp']);

    /* Tags that are safe for data: URIs */
    let DATA_URI_TAGS = null;
    const DEFAULT_DATA_URI_TAGS = addToSet({}, ['audio', 'video', 'img', 'source', 'image', 'track']);

    /* Attributes safe for values like "javascript:" */
    let URI_SAFE_ATTRIBUTES = null;
    const DEFAULT_URI_SAFE_ATTRIBUTES = addToSet({}, ['alt', 'class', 'for', 'id', 'label', 'name', 'pattern', 'placeholder', 'role', 'summary', 'title', 'value', 'style', 'xmlns']);
    const MATHML_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';
    const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
    const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
    /* Document namespace */
    let NAMESPACE = HTML_NAMESPACE;
    let IS_EMPTY_INPUT = false;

    /* Allowed XHTML+XML namespaces */
    let ALLOWED_NAMESPACES = null;
    const DEFAULT_ALLOWED_NAMESPACES = addToSet({}, [MATHML_NAMESPACE, SVG_NAMESPACE, HTML_NAMESPACE], stringToString);

    /* Parsing of strict XHTML documents */
    let PARSER_MEDIA_TYPE = null;
    const SUPPORTED_PARSER_MEDIA_TYPES = ['application/xhtml+xml', 'text/html'];
    const DEFAULT_PARSER_MEDIA_TYPE = 'text/html';
    let transformCaseFunc = null;

    /* Keep a reference to config to pass to hooks */
    let CONFIG = null;

    /* Ideally, do not touch anything below this line */
    /* ______________________________________________ */

    const formElement = document.createElement('form');
    const isRegexOrFunction = function isRegexOrFunction(testValue) {
      return testValue instanceof RegExp || testValue instanceof Function;
    };

    /**
     * _parseConfig
     *
     * @param  {Object} cfg optional config literal
     */
    // eslint-disable-next-line complexity
    const _parseConfig = function _parseConfig() {
      let cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      if (CONFIG && CONFIG === cfg) {
        return;
      }

      /* Shield configuration object from tampering */
      if (!cfg || typeof cfg !== 'object') {
        cfg = {};
      }

      /* Shield configuration object from prototype pollution */
      cfg = clone(cfg);
      PARSER_MEDIA_TYPE =
      // eslint-disable-next-line unicorn/prefer-includes
      SUPPORTED_PARSER_MEDIA_TYPES.indexOf(cfg.PARSER_MEDIA_TYPE) === -1 ? DEFAULT_PARSER_MEDIA_TYPE : cfg.PARSER_MEDIA_TYPE;

      // HTML tags and attributes are not case-sensitive, converting to lowercase. Keeping XHTML as is.
      transformCaseFunc = PARSER_MEDIA_TYPE === 'application/xhtml+xml' ? stringToString : stringToLowerCase;

      /* Set configuration parameters */
      ALLOWED_TAGS = objectHasOwnProperty(cfg, 'ALLOWED_TAGS') ? addToSet({}, cfg.ALLOWED_TAGS, transformCaseFunc) : DEFAULT_ALLOWED_TAGS;
      ALLOWED_ATTR = objectHasOwnProperty(cfg, 'ALLOWED_ATTR') ? addToSet({}, cfg.ALLOWED_ATTR, transformCaseFunc) : DEFAULT_ALLOWED_ATTR;
      ALLOWED_NAMESPACES = objectHasOwnProperty(cfg, 'ALLOWED_NAMESPACES') ? addToSet({}, cfg.ALLOWED_NAMESPACES, stringToString) : DEFAULT_ALLOWED_NAMESPACES;
      URI_SAFE_ATTRIBUTES = objectHasOwnProperty(cfg, 'ADD_URI_SAFE_ATTR') ? addToSet(clone(DEFAULT_URI_SAFE_ATTRIBUTES),
      // eslint-disable-line indent
      cfg.ADD_URI_SAFE_ATTR,
      // eslint-disable-line indent
      transformCaseFunc // eslint-disable-line indent
      ) // eslint-disable-line indent
      : DEFAULT_URI_SAFE_ATTRIBUTES;
      DATA_URI_TAGS = objectHasOwnProperty(cfg, 'ADD_DATA_URI_TAGS') ? addToSet(clone(DEFAULT_DATA_URI_TAGS),
      // eslint-disable-line indent
      cfg.ADD_DATA_URI_TAGS,
      // eslint-disable-line indent
      transformCaseFunc // eslint-disable-line indent
      ) // eslint-disable-line indent
      : DEFAULT_DATA_URI_TAGS;
      FORBID_CONTENTS = objectHasOwnProperty(cfg, 'FORBID_CONTENTS') ? addToSet({}, cfg.FORBID_CONTENTS, transformCaseFunc) : DEFAULT_FORBID_CONTENTS;
      FORBID_TAGS = objectHasOwnProperty(cfg, 'FORBID_TAGS') ? addToSet({}, cfg.FORBID_TAGS, transformCaseFunc) : {};
      FORBID_ATTR = objectHasOwnProperty(cfg, 'FORBID_ATTR') ? addToSet({}, cfg.FORBID_ATTR, transformCaseFunc) : {};
      USE_PROFILES = objectHasOwnProperty(cfg, 'USE_PROFILES') ? cfg.USE_PROFILES : false;
      ALLOW_ARIA_ATTR = cfg.ALLOW_ARIA_ATTR !== false; // Default true
      ALLOW_DATA_ATTR = cfg.ALLOW_DATA_ATTR !== false; // Default true
      ALLOW_UNKNOWN_PROTOCOLS = cfg.ALLOW_UNKNOWN_PROTOCOLS || false; // Default false
      ALLOW_SELF_CLOSE_IN_ATTR = cfg.ALLOW_SELF_CLOSE_IN_ATTR !== false; // Default true
      SAFE_FOR_TEMPLATES = cfg.SAFE_FOR_TEMPLATES || false; // Default false
      SAFE_FOR_XML = cfg.SAFE_FOR_XML !== false; // Default true
      WHOLE_DOCUMENT = cfg.WHOLE_DOCUMENT || false; // Default false
      RETURN_DOM = cfg.RETURN_DOM || false; // Default false
      RETURN_DOM_FRAGMENT = cfg.RETURN_DOM_FRAGMENT || false; // Default false
      RETURN_TRUSTED_TYPE = cfg.RETURN_TRUSTED_TYPE || false; // Default false
      FORCE_BODY = cfg.FORCE_BODY || false; // Default false
      SANITIZE_DOM = cfg.SANITIZE_DOM !== false; // Default true
      SANITIZE_NAMED_PROPS = cfg.SANITIZE_NAMED_PROPS || false; // Default false
      KEEP_CONTENT = cfg.KEEP_CONTENT !== false; // Default true
      IN_PLACE = cfg.IN_PLACE || false; // Default false
      IS_ALLOWED_URI$1 = cfg.ALLOWED_URI_REGEXP || IS_ALLOWED_URI;
      NAMESPACE = cfg.NAMESPACE || HTML_NAMESPACE;
      CUSTOM_ELEMENT_HANDLING = cfg.CUSTOM_ELEMENT_HANDLING || {};
      if (cfg.CUSTOM_ELEMENT_HANDLING && isRegexOrFunction(cfg.CUSTOM_ELEMENT_HANDLING.tagNameCheck)) {
        CUSTOM_ELEMENT_HANDLING.tagNameCheck = cfg.CUSTOM_ELEMENT_HANDLING.tagNameCheck;
      }
      if (cfg.CUSTOM_ELEMENT_HANDLING && isRegexOrFunction(cfg.CUSTOM_ELEMENT_HANDLING.attributeNameCheck)) {
        CUSTOM_ELEMENT_HANDLING.attributeNameCheck = cfg.CUSTOM_ELEMENT_HANDLING.attributeNameCheck;
      }
      if (cfg.CUSTOM_ELEMENT_HANDLING && typeof cfg.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements === 'boolean') {
        CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements = cfg.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements;
      }
      if (SAFE_FOR_TEMPLATES) {
        ALLOW_DATA_ATTR = false;
      }
      if (RETURN_DOM_FRAGMENT) {
        RETURN_DOM = true;
      }

      /* Parse profile info */
      if (USE_PROFILES) {
        ALLOWED_TAGS = addToSet({}, text);
        ALLOWED_ATTR = [];
        if (USE_PROFILES.html === true) {
          addToSet(ALLOWED_TAGS, html$1);
          addToSet(ALLOWED_ATTR, html$2);
        }
        if (USE_PROFILES.svg === true) {
          addToSet(ALLOWED_TAGS, svg$1);
          addToSet(ALLOWED_ATTR, svg);
          addToSet(ALLOWED_ATTR, xml);
        }
        if (USE_PROFILES.svgFilters === true) {
          addToSet(ALLOWED_TAGS, svgFilters);
          addToSet(ALLOWED_ATTR, svg);
          addToSet(ALLOWED_ATTR, xml);
        }
        if (USE_PROFILES.mathMl === true) {
          addToSet(ALLOWED_TAGS, mathMl$1);
          addToSet(ALLOWED_ATTR, mathMl);
          addToSet(ALLOWED_ATTR, xml);
        }
      }

      /* Merge configuration parameters */
      if (cfg.ADD_TAGS) {
        if (ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS) {
          ALLOWED_TAGS = clone(ALLOWED_TAGS);
        }
        addToSet(ALLOWED_TAGS, cfg.ADD_TAGS, transformCaseFunc);
      }
      if (cfg.ADD_ATTR) {
        if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR) {
          ALLOWED_ATTR = clone(ALLOWED_ATTR);
        }
        addToSet(ALLOWED_ATTR, cfg.ADD_ATTR, transformCaseFunc);
      }
      if (cfg.ADD_URI_SAFE_ATTR) {
        addToSet(URI_SAFE_ATTRIBUTES, cfg.ADD_URI_SAFE_ATTR, transformCaseFunc);
      }
      if (cfg.FORBID_CONTENTS) {
        if (FORBID_CONTENTS === DEFAULT_FORBID_CONTENTS) {
          FORBID_CONTENTS = clone(FORBID_CONTENTS);
        }
        addToSet(FORBID_CONTENTS, cfg.FORBID_CONTENTS, transformCaseFunc);
      }

      /* Add #text in case KEEP_CONTENT is set to true */
      if (KEEP_CONTENT) {
        ALLOWED_TAGS['#text'] = true;
      }

      /* Add html, head and body to ALLOWED_TAGS in case WHOLE_DOCUMENT is true */
      if (WHOLE_DOCUMENT) {
        addToSet(ALLOWED_TAGS, ['html', 'head', 'body']);
      }

      /* Add tbody to ALLOWED_TAGS in case tables are permitted, see #286, #365 */
      if (ALLOWED_TAGS.table) {
        addToSet(ALLOWED_TAGS, ['tbody']);
        delete FORBID_TAGS.tbody;
      }
      if (cfg.TRUSTED_TYPES_POLICY) {
        if (typeof cfg.TRUSTED_TYPES_POLICY.createHTML !== 'function') {
          throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
        }
        if (typeof cfg.TRUSTED_TYPES_POLICY.createScriptURL !== 'function') {
          throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
        }

        // Overwrite existing TrustedTypes policy.
        trustedTypesPolicy = cfg.TRUSTED_TYPES_POLICY;

        // Sign local variables required by `sanitize`.
        emptyHTML = trustedTypesPolicy.createHTML('');
      } else {
        // Uninitialized policy, attempt to initialize the internal dompurify policy.
        if (trustedTypesPolicy === undefined) {
          trustedTypesPolicy = _createTrustedTypesPolicy(trustedTypes, currentScript);
        }

        // If creating the internal policy succeeded sign internal variables.
        if (trustedTypesPolicy !== null && typeof emptyHTML === 'string') {
          emptyHTML = trustedTypesPolicy.createHTML('');
        }
      }

      // Prevent further manipulation of configuration.
      // Not available in IE8, Safari 5, etc.
      if (freeze) {
        freeze(cfg);
      }
      CONFIG = cfg;
    };
    const MATHML_TEXT_INTEGRATION_POINTS = addToSet({}, ['mi', 'mo', 'mn', 'ms', 'mtext']);
    const HTML_INTEGRATION_POINTS = addToSet({}, ['annotation-xml']);

    // Certain elements are allowed in both SVG and HTML
    // namespace. We need to specify them explicitly
    // so that they don't get erroneously deleted from
    // HTML namespace.
    const COMMON_SVG_AND_HTML_ELEMENTS = addToSet({}, ['title', 'style', 'font', 'a', 'script']);

    /* Keep track of all possible SVG and MathML tags
     * so that we can perform the namespace checks
     * correctly. */
    const ALL_SVG_TAGS = addToSet({}, [...svg$1, ...svgFilters, ...svgDisallowed]);
    const ALL_MATHML_TAGS = addToSet({}, [...mathMl$1, ...mathMlDisallowed]);

    /**
     * @param  {Element} element a DOM element whose namespace is being checked
     * @returns {boolean} Return false if the element has a
     *  namespace that a spec-compliant parser would never
     *  return. Return true otherwise.
     */
    const _checkValidNamespace = function _checkValidNamespace(element) {
      let parent = getParentNode(element);

      // In JSDOM, if we're inside shadow DOM, then parentNode
      // can be null. We just simulate parent in this case.
      if (!parent || !parent.tagName) {
        parent = {
          namespaceURI: NAMESPACE,
          tagName: 'template'
        };
      }
      const tagName = stringToLowerCase(element.tagName);
      const parentTagName = stringToLowerCase(parent.tagName);
      if (!ALLOWED_NAMESPACES[element.namespaceURI]) {
        return false;
      }
      if (element.namespaceURI === SVG_NAMESPACE) {
        // The only way to switch from HTML namespace to SVG
        // is via <svg>. If it happens via any other tag, then
        // it should be killed.
        if (parent.namespaceURI === HTML_NAMESPACE) {
          return tagName === 'svg';
        }

        // The only way to switch from MathML to SVG is via`
        // svg if parent is either <annotation-xml> or MathML
        // text integration points.
        if (parent.namespaceURI === MATHML_NAMESPACE) {
          return tagName === 'svg' && (parentTagName === 'annotation-xml' || MATHML_TEXT_INTEGRATION_POINTS[parentTagName]);
        }

        // We only allow elements that are defined in SVG
        // spec. All others are disallowed in SVG namespace.
        return Boolean(ALL_SVG_TAGS[tagName]);
      }
      if (element.namespaceURI === MATHML_NAMESPACE) {
        // The only way to switch from HTML namespace to MathML
        // is via <math>. If it happens via any other tag, then
        // it should be killed.
        if (parent.namespaceURI === HTML_NAMESPACE) {
          return tagName === 'math';
        }

        // The only way to switch from SVG to MathML is via
        // <math> and HTML integration points
        if (parent.namespaceURI === SVG_NAMESPACE) {
          return tagName === 'math' && HTML_INTEGRATION_POINTS[parentTagName];
        }

        // We only allow elements that are defined in MathML
        // spec. All others are disallowed in MathML namespace.
        return Boolean(ALL_MATHML_TAGS[tagName]);
      }
      if (element.namespaceURI === HTML_NAMESPACE) {
        // The only way to switch from SVG to HTML is via
        // HTML integration points, and from MathML to HTML
        // is via MathML text integration points
        if (parent.namespaceURI === SVG_NAMESPACE && !HTML_INTEGRATION_POINTS[parentTagName]) {
          return false;
        }
        if (parent.namespaceURI === MATHML_NAMESPACE && !MATHML_TEXT_INTEGRATION_POINTS[parentTagName]) {
          return false;
        }

        // We disallow tags that are specific for MathML
        // or SVG and should never appear in HTML namespace
        return !ALL_MATHML_TAGS[tagName] && (COMMON_SVG_AND_HTML_ELEMENTS[tagName] || !ALL_SVG_TAGS[tagName]);
      }

      // For XHTML and XML documents that support custom namespaces
      if (PARSER_MEDIA_TYPE === 'application/xhtml+xml' && ALLOWED_NAMESPACES[element.namespaceURI]) {
        return true;
      }

      // The code should never reach this place (this means
      // that the element somehow got namespace that is not
      // HTML, SVG, MathML or allowed via ALLOWED_NAMESPACES).
      // Return false just in case.
      return false;
    };

    /**
     * _forceRemove
     *
     * @param  {Node} node a DOM node
     */
    const _forceRemove = function _forceRemove(node) {
      arrayPush(DOMPurify.removed, {
        element: node
      });
      try {
        // eslint-disable-next-line unicorn/prefer-dom-node-remove
        getParentNode(node).removeChild(node);
      } catch (_) {
        remove(node);
      }
    };

    /**
     * _removeAttribute
     *
     * @param  {String} name an Attribute name
     * @param  {Node} node a DOM node
     */
    const _removeAttribute = function _removeAttribute(name, node) {
      try {
        arrayPush(DOMPurify.removed, {
          attribute: node.getAttributeNode(name),
          from: node
        });
      } catch (_) {
        arrayPush(DOMPurify.removed, {
          attribute: null,
          from: node
        });
      }
      node.removeAttribute(name);

      // We void attribute values for unremovable "is"" attributes
      if (name === 'is' && !ALLOWED_ATTR[name]) {
        if (RETURN_DOM || RETURN_DOM_FRAGMENT) {
          try {
            _forceRemove(node);
          } catch (_) {}
        } else {
          try {
            node.setAttribute(name, '');
          } catch (_) {}
        }
      }
    };

    /**
     * _initDocument
     *
     * @param  {String} dirty a string of dirty markup
     * @return {Document} a DOM, filled with the dirty markup
     */
    const _initDocument = function _initDocument(dirty) {
      /* Create a HTML document */
      let doc = null;
      let leadingWhitespace = null;
      if (FORCE_BODY) {
        dirty = '<remove></remove>' + dirty;
      } else {
        /* If FORCE_BODY isn't used, leading whitespace needs to be preserved manually */
        const matches = stringMatch(dirty, /^[\r\n\t ]+/);
        leadingWhitespace = matches && matches[0];
      }
      if (PARSER_MEDIA_TYPE === 'application/xhtml+xml' && NAMESPACE === HTML_NAMESPACE) {
        // Root of XHTML doc must contain xmlns declaration (see https://www.w3.org/TR/xhtml1/normative.html#strict)
        dirty = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + dirty + '</body></html>';
      }
      const dirtyPayload = trustedTypesPolicy ? trustedTypesPolicy.createHTML(dirty) : dirty;
      /*
       * Use the DOMParser API by default, fallback later if needs be
       * DOMParser not work for svg when has multiple root element.
       */
      if (NAMESPACE === HTML_NAMESPACE) {
        try {
          doc = new DOMParser().parseFromString(dirtyPayload, PARSER_MEDIA_TYPE);
        } catch (_) {}
      }

      /* Use createHTMLDocument in case DOMParser is not available */
      if (!doc || !doc.documentElement) {
        doc = implementation.createDocument(NAMESPACE, 'template', null);
        try {
          doc.documentElement.innerHTML = IS_EMPTY_INPUT ? emptyHTML : dirtyPayload;
        } catch (_) {
          // Syntax error if dirtyPayload is invalid xml
        }
      }
      const body = doc.body || doc.documentElement;
      if (dirty && leadingWhitespace) {
        body.insertBefore(document.createTextNode(leadingWhitespace), body.childNodes[0] || null);
      }

      /* Work on whole document or just its body */
      if (NAMESPACE === HTML_NAMESPACE) {
        return getElementsByTagName.call(doc, WHOLE_DOCUMENT ? 'html' : 'body')[0];
      }
      return WHOLE_DOCUMENT ? doc.documentElement : body;
    };

    /**
     * Creates a NodeIterator object that you can use to traverse filtered lists of nodes or elements in a document.
     *
     * @param  {Node} root The root element or node to start traversing on.
     * @return {NodeIterator} The created NodeIterator
     */
    const _createNodeIterator = function _createNodeIterator(root) {
      return createNodeIterator.call(root.ownerDocument || root, root,
      // eslint-disable-next-line no-bitwise
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT | NodeFilter.SHOW_PROCESSING_INSTRUCTION | NodeFilter.SHOW_CDATA_SECTION, null);
    };

    /**
     * _isClobbered
     *
     * @param  {Node} elm element to check for clobbering attacks
     * @return {Boolean} true if clobbered, false if safe
     */
    const _isClobbered = function _isClobbered(elm) {
      return elm instanceof HTMLFormElement && (typeof elm.nodeName !== 'string' || typeof elm.textContent !== 'string' || typeof elm.removeChild !== 'function' || !(elm.attributes instanceof NamedNodeMap) || typeof elm.removeAttribute !== 'function' || typeof elm.setAttribute !== 'function' || typeof elm.namespaceURI !== 'string' || typeof elm.insertBefore !== 'function' || typeof elm.hasChildNodes !== 'function');
    };

    /**
     * Checks whether the given object is a DOM node.
     *
     * @param  {Node} object object to check whether it's a DOM node
     * @return {Boolean} true is object is a DOM node
     */
    const _isNode = function _isNode(object) {
      return typeof Node === 'function' && object instanceof Node;
    };

    /**
     * _executeHook
     * Execute user configurable hooks
     *
     * @param  {String} entryPoint  Name of the hook's entry point
     * @param  {Node} currentNode node to work on with the hook
     * @param  {Object} data additional hook parameters
     */
    const _executeHook = function _executeHook(entryPoint, currentNode, data) {
      if (!hooks[entryPoint]) {
        return;
      }
      arrayForEach(hooks[entryPoint], hook => {
        hook.call(DOMPurify, currentNode, data, CONFIG);
      });
    };

    /**
     * _sanitizeElements
     *
     * @protect nodeName
     * @protect textContent
     * @protect removeChild
     *
     * @param   {Node} currentNode to check for permission to exist
     * @return  {Boolean} true if node was killed, false if left alive
     */
    const _sanitizeElements = function _sanitizeElements(currentNode) {
      let content = null;

      /* Execute a hook if present */
      _executeHook('beforeSanitizeElements', currentNode, null);

      /* Check if element is clobbered or can clobber */
      if (_isClobbered(currentNode)) {
        _forceRemove(currentNode);
        return true;
      }

      /* Now let's check the element's type and name */
      const tagName = transformCaseFunc(currentNode.nodeName);

      /* Execute a hook if present */
      _executeHook('uponSanitizeElement', currentNode, {
        tagName,
        allowedTags: ALLOWED_TAGS
      });

      /* Detect mXSS attempts abusing namespace confusion */
      if (currentNode.hasChildNodes() && !_isNode(currentNode.firstElementChild) && regExpTest(/<[/\w]/g, currentNode.innerHTML) && regExpTest(/<[/\w]/g, currentNode.textContent)) {
        _forceRemove(currentNode);
        return true;
      }

      /* Remove any occurrence of processing instructions */
      if (currentNode.nodeType === NODE_TYPE.progressingInstruction) {
        _forceRemove(currentNode);
        return true;
      }

      /* Remove any kind of possibly harmful comments */
      if (SAFE_FOR_XML && currentNode.nodeType === NODE_TYPE.comment && regExpTest(/<[/\w]/g, currentNode.data)) {
        _forceRemove(currentNode);
        return true;
      }

      /* Remove element if anything forbids its presence */
      if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
        /* Check if we have a custom element to handle */
        if (!FORBID_TAGS[tagName] && _isBasicCustomElement(tagName)) {
          if (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, tagName)) {
            return false;
          }
          if (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(tagName)) {
            return false;
          }
        }

        /* Keep content except for bad-listed elements */
        if (KEEP_CONTENT && !FORBID_CONTENTS[tagName]) {
          const parentNode = getParentNode(currentNode) || currentNode.parentNode;
          const childNodes = getChildNodes(currentNode) || currentNode.childNodes;
          if (childNodes && parentNode) {
            const childCount = childNodes.length;
            for (let i = childCount - 1; i >= 0; --i) {
              const childClone = cloneNode(childNodes[i], true);
              childClone.__removalCount = (currentNode.__removalCount || 0) + 1;
              parentNode.insertBefore(childClone, getNextSibling(currentNode));
            }
          }
        }
        _forceRemove(currentNode);
        return true;
      }

      /* Check whether element has a valid namespace */
      if (currentNode instanceof Element && !_checkValidNamespace(currentNode)) {
        _forceRemove(currentNode);
        return true;
      }

      /* Make sure that older browsers don't get fallback-tag mXSS */
      if ((tagName === 'noscript' || tagName === 'noembed' || tagName === 'noframes') && regExpTest(/<\/no(script|embed|frames)/i, currentNode.innerHTML)) {
        _forceRemove(currentNode);
        return true;
      }

      /* Sanitize element content to be template-safe */
      if (SAFE_FOR_TEMPLATES && currentNode.nodeType === NODE_TYPE.text) {
        /* Get the element's text content */
        content = currentNode.textContent;
        arrayForEach([MUSTACHE_EXPR, ERB_EXPR, TMPLIT_EXPR], expr => {
          content = stringReplace(content, expr, ' ');
        });
        if (currentNode.textContent !== content) {
          arrayPush(DOMPurify.removed, {
            element: currentNode.cloneNode()
          });
          currentNode.textContent = content;
        }
      }

      /* Execute a hook if present */
      _executeHook('afterSanitizeElements', currentNode, null);
      return false;
    };

    /**
     * _isValidAttribute
     *
     * @param  {string} lcTag Lowercase tag name of containing element.
     * @param  {string} lcName Lowercase attribute name.
     * @param  {string} value Attribute value.
     * @return {Boolean} Returns true if `value` is valid, otherwise false.
     */
    // eslint-disable-next-line complexity
    const _isValidAttribute = function _isValidAttribute(lcTag, lcName, value) {
      /* Make sure attribute cannot clobber */
      if (SANITIZE_DOM && (lcName === 'id' || lcName === 'name') && (value in document || value in formElement)) {
        return false;
      }

      /* Allow valid data-* attributes: At least one character after "-"
          (https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes)
          XML-compatible (https://html.spec.whatwg.org/multipage/infrastructure.html#xml-compatible and http://www.w3.org/TR/xml/#d0e804)
          We don't need to check the value; it's always URI safe. */
      if (ALLOW_DATA_ATTR && !FORBID_ATTR[lcName] && regExpTest(DATA_ATTR, lcName)) ; else if (ALLOW_ARIA_ATTR && regExpTest(ARIA_ATTR, lcName)) ; else if (!ALLOWED_ATTR[lcName] || FORBID_ATTR[lcName]) {
        if (
        // First condition does a very basic check if a) it's basically a valid custom element tagname AND
        // b) if the tagName passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
        // and c) if the attribute name passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.attributeNameCheck
        _isBasicCustomElement(lcTag) && (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, lcTag) || CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(lcTag)) && (CUSTOM_ELEMENT_HANDLING.attributeNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.attributeNameCheck, lcName) || CUSTOM_ELEMENT_HANDLING.attributeNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.attributeNameCheck(lcName)) ||
        // Alternative, second condition checks if it's an `is`-attribute, AND
        // the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
        lcName === 'is' && CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements && (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, value) || CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(value))) ; else {
          return false;
        }
        /* Check value is safe. First, is attr inert? If so, is safe */
      } else if (URI_SAFE_ATTRIBUTES[lcName]) ; else if (regExpTest(IS_ALLOWED_URI$1, stringReplace(value, ATTR_WHITESPACE, ''))) ; else if ((lcName === 'src' || lcName === 'xlink:href' || lcName === 'href') && lcTag !== 'script' && stringIndexOf(value, 'data:') === 0 && DATA_URI_TAGS[lcTag]) ; else if (ALLOW_UNKNOWN_PROTOCOLS && !regExpTest(IS_SCRIPT_OR_DATA, stringReplace(value, ATTR_WHITESPACE, ''))) ; else if (value) {
        return false;
      } else ;
      return true;
    };

    /**
     * _isBasicCustomElement
     * checks if at least one dash is included in tagName, and it's not the first char
     * for more sophisticated checking see https://github.com/sindresorhus/validate-element-name
     *
     * @param {string} tagName name of the tag of the node to sanitize
     * @returns {boolean} Returns true if the tag name meets the basic criteria for a custom element, otherwise false.
     */
    const _isBasicCustomElement = function _isBasicCustomElement(tagName) {
      return tagName !== 'annotation-xml' && stringMatch(tagName, CUSTOM_ELEMENT);
    };

    /**
     * _sanitizeAttributes
     *
     * @protect attributes
     * @protect nodeName
     * @protect removeAttribute
     * @protect setAttribute
     *
     * @param  {Node} currentNode to sanitize
     */
    const _sanitizeAttributes = function _sanitizeAttributes(currentNode) {
      /* Execute a hook if present */
      _executeHook('beforeSanitizeAttributes', currentNode, null);
      const {
        attributes
      } = currentNode;

      /* Check if we have attributes; if not we might have a text node */
      if (!attributes) {
        return;
      }
      const hookEvent = {
        attrName: '',
        attrValue: '',
        keepAttr: true,
        allowedAttributes: ALLOWED_ATTR
      };
      let l = attributes.length;

      /* Go backwards over all attributes; safely remove bad ones */
      while (l--) {
        const attr = attributes[l];
        const {
          name,
          namespaceURI,
          value: attrValue
        } = attr;
        const lcName = transformCaseFunc(name);
        let value = name === 'value' ? attrValue : stringTrim(attrValue);

        /* Execute a hook if present */
        hookEvent.attrName = lcName;
        hookEvent.attrValue = value;
        hookEvent.keepAttr = true;
        hookEvent.forceKeepAttr = undefined; // Allows developers to see this is a property they can set
        _executeHook('uponSanitizeAttribute', currentNode, hookEvent);
        value = hookEvent.attrValue;

        /* Did the hooks approve of the attribute? */
        if (hookEvent.forceKeepAttr) {
          continue;
        }

        /* Remove attribute */
        _removeAttribute(name, currentNode);

        /* Did the hooks approve of the attribute? */
        if (!hookEvent.keepAttr) {
          continue;
        }

        /* Work around a security issue in jQuery 3.0 */
        if (!ALLOW_SELF_CLOSE_IN_ATTR && regExpTest(/\/>/i, value)) {
          _removeAttribute(name, currentNode);
          continue;
        }

        /* Sanitize attribute content to be template-safe */
        if (SAFE_FOR_TEMPLATES) {
          arrayForEach([MUSTACHE_EXPR, ERB_EXPR, TMPLIT_EXPR], expr => {
            value = stringReplace(value, expr, ' ');
          });
        }

        /* Is `value` valid for this attribute? */
        const lcTag = transformCaseFunc(currentNode.nodeName);
        if (!_isValidAttribute(lcTag, lcName, value)) {
          continue;
        }

        /* Full DOM Clobbering protection via namespace isolation,
         * Prefix id and name attributes with `user-content-`
         */
        if (SANITIZE_NAMED_PROPS && (lcName === 'id' || lcName === 'name')) {
          // Remove the attribute with this value
          _removeAttribute(name, currentNode);

          // Prefix the value and later re-create the attribute with the sanitized value
          value = SANITIZE_NAMED_PROPS_PREFIX + value;
        }

        /* Work around a security issue with comments inside attributes */
        if (SAFE_FOR_XML && regExpTest(/((--!?|])>)|<\/(style|title)/i, value)) {
          _removeAttribute(name, currentNode);
          continue;
        }

        /* Handle attributes that require Trusted Types */
        if (trustedTypesPolicy && typeof trustedTypes === 'object' && typeof trustedTypes.getAttributeType === 'function') {
          if (namespaceURI) ; else {
            switch (trustedTypes.getAttributeType(lcTag, lcName)) {
              case 'TrustedHTML':
                {
                  value = trustedTypesPolicy.createHTML(value);
                  break;
                }
              case 'TrustedScriptURL':
                {
                  value = trustedTypesPolicy.createScriptURL(value);
                  break;
                }
            }
          }
        }

        /* Handle invalid data-* attribute set by try-catching it */
        try {
          if (namespaceURI) {
            currentNode.setAttributeNS(namespaceURI, name, value);
          } else {
            /* Fallback to setAttribute() for browser-unrecognized namespaces e.g. "x-schema". */
            currentNode.setAttribute(name, value);
          }
          if (_isClobbered(currentNode)) {
            _forceRemove(currentNode);
          } else {
            arrayPop(DOMPurify.removed);
          }
        } catch (_) {}
      }

      /* Execute a hook if present */
      _executeHook('afterSanitizeAttributes', currentNode, null);
    };

    /**
     * _sanitizeShadowDOM
     *
     * @param  {DocumentFragment} fragment to iterate over recursively
     */
    const _sanitizeShadowDOM = function _sanitizeShadowDOM(fragment) {
      let shadowNode = null;
      const shadowIterator = _createNodeIterator(fragment);

      /* Execute a hook if present */
      _executeHook('beforeSanitizeShadowDOM', fragment, null);
      while (shadowNode = shadowIterator.nextNode()) {
        /* Execute a hook if present */
        _executeHook('uponSanitizeShadowNode', shadowNode, null);

        /* Sanitize tags and elements */
        if (_sanitizeElements(shadowNode)) {
          continue;
        }

        /* Deep shadow DOM detected */
        if (shadowNode.content instanceof DocumentFragment) {
          _sanitizeShadowDOM(shadowNode.content);
        }

        /* Check attributes, sanitize if necessary */
        _sanitizeAttributes(shadowNode);
      }

      /* Execute a hook if present */
      _executeHook('afterSanitizeShadowDOM', fragment, null);
    };

    /**
     * Sanitize
     * Public method providing core sanitation functionality
     *
     * @param {String|Node} dirty string or DOM node
     * @param {Object} cfg object
     */
    // eslint-disable-next-line complexity
    DOMPurify.sanitize = function (dirty) {
      let cfg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      let body = null;
      let importedNode = null;
      let currentNode = null;
      let returnNode = null;
      /* Make sure we have a string to sanitize.
        DO NOT return early, as this will return the wrong type if
        the user has requested a DOM object rather than a string */
      IS_EMPTY_INPUT = !dirty;
      if (IS_EMPTY_INPUT) {
        dirty = '<!-->';
      }

      /* Stringify, in case dirty is an object */
      if (typeof dirty !== 'string' && !_isNode(dirty)) {
        if (typeof dirty.toString === 'function') {
          dirty = dirty.toString();
          if (typeof dirty !== 'string') {
            throw typeErrorCreate('dirty is not a string, aborting');
          }
        } else {
          throw typeErrorCreate('toString is not a function');
        }
      }

      /* Return dirty HTML if DOMPurify cannot run */
      if (!DOMPurify.isSupported) {
        return dirty;
      }

      /* Assign config vars */
      if (!SET_CONFIG) {
        _parseConfig(cfg);
      }

      /* Clean up removed elements */
      DOMPurify.removed = [];

      /* Check if dirty is correctly typed for IN_PLACE */
      if (typeof dirty === 'string') {
        IN_PLACE = false;
      }
      if (IN_PLACE) {
        /* Do some early pre-sanitization to avoid unsafe root nodes */
        if (dirty.nodeName) {
          const tagName = transformCaseFunc(dirty.nodeName);
          if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
            throw typeErrorCreate('root node is forbidden and cannot be sanitized in-place');
          }
        }
      } else if (dirty instanceof Node) {
        /* If dirty is a DOM element, append to an empty document to avoid
           elements being stripped by the parser */
        body = _initDocument('<!---->');
        importedNode = body.ownerDocument.importNode(dirty, true);
        if (importedNode.nodeType === NODE_TYPE.element && importedNode.nodeName === 'BODY') {
          /* Node is already a body, use as is */
          body = importedNode;
        } else if (importedNode.nodeName === 'HTML') {
          body = importedNode;
        } else {
          // eslint-disable-next-line unicorn/prefer-dom-node-append
          body.appendChild(importedNode);
        }
      } else {
        /* Exit directly if we have nothing to do */
        if (!RETURN_DOM && !SAFE_FOR_TEMPLATES && !WHOLE_DOCUMENT &&
        // eslint-disable-next-line unicorn/prefer-includes
        dirty.indexOf('<') === -1) {
          return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(dirty) : dirty;
        }

        /* Initialize the document to work on */
        body = _initDocument(dirty);

        /* Check we have a DOM node from the data */
        if (!body) {
          return RETURN_DOM ? null : RETURN_TRUSTED_TYPE ? emptyHTML : '';
        }
      }

      /* Remove first element node (ours) if FORCE_BODY is set */
      if (body && FORCE_BODY) {
        _forceRemove(body.firstChild);
      }

      /* Get node iterator */
      const nodeIterator = _createNodeIterator(IN_PLACE ? dirty : body);

      /* Now start iterating over the created document */
      while (currentNode = nodeIterator.nextNode()) {
        /* Sanitize tags and elements */
        if (_sanitizeElements(currentNode)) {
          continue;
        }

        /* Shadow DOM detected, sanitize it */
        if (currentNode.content instanceof DocumentFragment) {
          _sanitizeShadowDOM(currentNode.content);
        }

        /* Check attributes, sanitize if necessary */
        _sanitizeAttributes(currentNode);
      }

      /* If we sanitized `dirty` in-place, return it. */
      if (IN_PLACE) {
        return dirty;
      }

      /* Return sanitized string or DOM */
      if (RETURN_DOM) {
        if (RETURN_DOM_FRAGMENT) {
          returnNode = createDocumentFragment.call(body.ownerDocument);
          while (body.firstChild) {
            // eslint-disable-next-line unicorn/prefer-dom-node-append
            returnNode.appendChild(body.firstChild);
          }
        } else {
          returnNode = body;
        }
        if (ALLOWED_ATTR.shadowroot || ALLOWED_ATTR.shadowrootmode) {
          /*
            AdoptNode() is not used because internal state is not reset
            (e.g. the past names map of a HTMLFormElement), this is safe
            in theory but we would rather not risk another attack vector.
            The state that is cloned by importNode() is explicitly defined
            by the specs.
          */
          returnNode = importNode.call(originalDocument, returnNode, true);
        }
        return returnNode;
      }
      let serializedHTML = WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;

      /* Serialize doctype if allowed */
      if (WHOLE_DOCUMENT && ALLOWED_TAGS['!doctype'] && body.ownerDocument && body.ownerDocument.doctype && body.ownerDocument.doctype.name && regExpTest(DOCTYPE_NAME, body.ownerDocument.doctype.name)) {
        serializedHTML = '<!DOCTYPE ' + body.ownerDocument.doctype.name + '>\n' + serializedHTML;
      }

      /* Sanitize final string template-safe */
      if (SAFE_FOR_TEMPLATES) {
        arrayForEach([MUSTACHE_EXPR, ERB_EXPR, TMPLIT_EXPR], expr => {
          serializedHTML = stringReplace(serializedHTML, expr, ' ');
        });
      }
      return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(serializedHTML) : serializedHTML;
    };

    /**
     * Public method to set the configuration once
     * setConfig
     *
     * @param {Object} cfg configuration object
     */
    DOMPurify.setConfig = function () {
      let cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      _parseConfig(cfg);
      SET_CONFIG = true;
    };

    /**
     * Public method to remove the configuration
     * clearConfig
     *
     */
    DOMPurify.clearConfig = function () {
      CONFIG = null;
      SET_CONFIG = false;
    };

    /**
     * Public method to check if an attribute value is valid.
     * Uses last set config, if any. Otherwise, uses config defaults.
     * isValidAttribute
     *
     * @param  {String} tag Tag name of containing element.
     * @param  {String} attr Attribute name.
     * @param  {String} value Attribute value.
     * @return {Boolean} Returns true if `value` is valid. Otherwise, returns false.
     */
    DOMPurify.isValidAttribute = function (tag, attr, value) {
      /* Initialize shared config vars if necessary. */
      if (!CONFIG) {
        _parseConfig({});
      }
      const lcTag = transformCaseFunc(tag);
      const lcName = transformCaseFunc(attr);
      return _isValidAttribute(lcTag, lcName, value);
    };

    /**
     * AddHook
     * Public method to add DOMPurify hooks
     *
     * @param {String} entryPoint entry point for the hook to add
     * @param {Function} hookFunction function to execute
     */
    DOMPurify.addHook = function (entryPoint, hookFunction) {
      if (typeof hookFunction !== 'function') {
        return;
      }
      hooks[entryPoint] = hooks[entryPoint] || [];
      arrayPush(hooks[entryPoint], hookFunction);
    };

    /**
     * RemoveHook
     * Public method to remove a DOMPurify hook at a given entryPoint
     * (pops it from the stack of hooks if more are present)
     *
     * @param {String} entryPoint entry point for the hook to remove
     * @return {Function} removed(popped) hook
     */
    DOMPurify.removeHook = function (entryPoint) {
      if (hooks[entryPoint]) {
        return arrayPop(hooks[entryPoint]);
      }
    };

    /**
     * RemoveHooks
     * Public method to remove all DOMPurify hooks at a given entryPoint
     *
     * @param  {String} entryPoint entry point for the hooks to remove
     */
    DOMPurify.removeHooks = function (entryPoint) {
      if (hooks[entryPoint]) {
        hooks[entryPoint] = [];
      }
    };

    /**
     * RemoveAllHooks
     * Public method to remove all DOMPurify hooks
     */
    DOMPurify.removeAllHooks = function () {
      hooks = {};
    };
    return DOMPurify;
  }
  var purify = createDOMPurify();

  /**
   * marked v14.1.4 - a markdown parser
   * Copyright (c) 2011-2024, Christopher Jeffrey. (MIT Licensed)
   * https://github.com/markedjs/marked
   */

  /**
   * DO NOT EDIT THIS FILE
   * The code in this file is generated from files in ./src/
   */

  /**
   * Gets the original marked default options.
   */
  function _getDefaults() {
      return {
          async: false,
          breaks: false,
          extensions: null,
          gfm: true,
          hooks: null,
          pedantic: false,
          renderer: null,
          silent: false,
          tokenizer: null,
          walkTokens: null,
      };
  }
  let _defaults = _getDefaults();
  function changeDefaults(newDefaults) {
      _defaults = newDefaults;
  }

  /**
   * Helpers
   */
  const escapeTest = /[&<>"']/;
  const escapeReplace = new RegExp(escapeTest.source, 'g');
  const escapeTestNoEncode = /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/;
  const escapeReplaceNoEncode = new RegExp(escapeTestNoEncode.source, 'g');
  const escapeReplacements = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
  };
  const getEscapeReplacement = (ch) => escapeReplacements[ch];
  function escape$1(html, encode) {
      if (encode) {
          if (escapeTest.test(html)) {
              return html.replace(escapeReplace, getEscapeReplacement);
          }
      }
      else {
          if (escapeTestNoEncode.test(html)) {
              return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
          }
      }
      return html;
  }
  const caret = /(^|[^\[])\^/g;
  function edit(regex, opt) {
      let source = typeof regex === 'string' ? regex : regex.source;
      opt = opt || '';
      const obj = {
          replace: (name, val) => {
              let valSource = typeof val === 'string' ? val : val.source;
              valSource = valSource.replace(caret, '$1');
              source = source.replace(name, valSource);
              return obj;
          },
          getRegex: () => {
              return new RegExp(source, opt);
          },
      };
      return obj;
  }
  function cleanUrl(href) {
      try {
          href = encodeURI(href).replace(/%25/g, '%');
      }
      catch {
          return null;
      }
      return href;
  }
  const noopTest = { exec: () => null };
  function splitCells(tableRow, count) {
      // ensure that every cell-delimiting pipe has a space
      // before it to distinguish it from an escaped pipe
      const row = tableRow.replace(/\|/g, (match, offset, str) => {
          let escaped = false;
          let curr = offset;
          while (--curr >= 0 && str[curr] === '\\')
              escaped = !escaped;
          if (escaped) {
              // odd number of slashes means | is escaped
              // so we leave it alone
              return '|';
          }
          else {
              // add space before unescaped |
              return ' |';
          }
      }), cells = row.split(/ \|/);
      let i = 0;
      // First/last cell in a row cannot be empty if it has no leading/trailing pipe
      if (!cells[0].trim()) {
          cells.shift();
      }
      if (cells.length > 0 && !cells[cells.length - 1].trim()) {
          cells.pop();
      }
      if (count) {
          if (cells.length > count) {
              cells.splice(count);
          }
          else {
              while (cells.length < count)
                  cells.push('');
          }
      }
      for (; i < cells.length; i++) {
          // leading or trailing whitespace is ignored per the gfm spec
          cells[i] = cells[i].trim().replace(/\\\|/g, '|');
      }
      return cells;
  }
  /**
   * Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
   * /c*$/ is vulnerable to REDOS.
   *
   * @param str
   * @param c
   * @param invert Remove suffix of non-c chars instead. Default falsey.
   */
  function rtrim(str, c, invert) {
      const l = str.length;
      if (l === 0) {
          return '';
      }
      // Length of suffix matching the invert condition.
      let suffLen = 0;
      // Step left until we fail to match the invert condition.
      while (suffLen < l) {
          const currChar = str.charAt(l - suffLen - 1);
          if (currChar === c && !invert) {
              suffLen++;
          }
          else if (currChar !== c && invert) {
              suffLen++;
          }
          else {
              break;
          }
      }
      return str.slice(0, l - suffLen);
  }
  function findClosingBracket(str, b) {
      if (str.indexOf(b[1]) === -1) {
          return -1;
      }
      let level = 0;
      for (let i = 0; i < str.length; i++) {
          if (str[i] === '\\') {
              i++;
          }
          else if (str[i] === b[0]) {
              level++;
          }
          else if (str[i] === b[1]) {
              level--;
              if (level < 0) {
                  return i;
              }
          }
      }
      return -1;
  }

  function outputLink(cap, link, raw, lexer) {
      const href = link.href;
      const title = link.title ? escape$1(link.title) : null;
      const text = cap[1].replace(/\\([\[\]])/g, '$1');
      if (cap[0].charAt(0) !== '!') {
          lexer.state.inLink = true;
          const token = {
              type: 'link',
              raw,
              href,
              title,
              text,
              tokens: lexer.inlineTokens(text),
          };
          lexer.state.inLink = false;
          return token;
      }
      return {
          type: 'image',
          raw,
          href,
          title,
          text: escape$1(text),
      };
  }
  function indentCodeCompensation(raw, text) {
      const matchIndentToCode = raw.match(/^(\s+)(?:```)/);
      if (matchIndentToCode === null) {
          return text;
      }
      const indentToCode = matchIndentToCode[1];
      return text
          .split('\n')
          .map(node => {
          const matchIndentInNode = node.match(/^\s+/);
          if (matchIndentInNode === null) {
              return node;
          }
          const [indentInNode] = matchIndentInNode;
          if (indentInNode.length >= indentToCode.length) {
              return node.slice(indentToCode.length);
          }
          return node;
      })
          .join('\n');
  }
  /**
   * Tokenizer
   */
  class _Tokenizer {
      options;
      rules; // set by the lexer
      lexer; // set by the lexer
      constructor(options) {
          this.options = options || _defaults;
      }
      space(src) {
          const cap = this.rules.block.newline.exec(src);
          if (cap && cap[0].length > 0) {
              return {
                  type: 'space',
                  raw: cap[0],
              };
          }
      }
      code(src) {
          const cap = this.rules.block.code.exec(src);
          if (cap) {
              const text = cap[0].replace(/^(?: {1,4}| {0,3}\t)/gm, '');
              return {
                  type: 'code',
                  raw: cap[0],
                  codeBlockStyle: 'indented',
                  text: !this.options.pedantic
                      ? rtrim(text, '\n')
                      : text,
              };
          }
      }
      fences(src) {
          const cap = this.rules.block.fences.exec(src);
          if (cap) {
              const raw = cap[0];
              const text = indentCodeCompensation(raw, cap[3] || '');
              return {
                  type: 'code',
                  raw,
                  lang: cap[2] ? cap[2].trim().replace(this.rules.inline.anyPunctuation, '$1') : cap[2],
                  text,
              };
          }
      }
      heading(src) {
          const cap = this.rules.block.heading.exec(src);
          if (cap) {
              let text = cap[2].trim();
              // remove trailing #s
              if (/#$/.test(text)) {
                  const trimmed = rtrim(text, '#');
                  if (this.options.pedantic) {
                      text = trimmed.trim();
                  }
                  else if (!trimmed || / $/.test(trimmed)) {
                      // CommonMark requires space before trailing #s
                      text = trimmed.trim();
                  }
              }
              return {
                  type: 'heading',
                  raw: cap[0],
                  depth: cap[1].length,
                  text,
                  tokens: this.lexer.inline(text),
              };
          }
      }
      hr(src) {
          const cap = this.rules.block.hr.exec(src);
          if (cap) {
              return {
                  type: 'hr',
                  raw: rtrim(cap[0], '\n'),
              };
          }
      }
      blockquote(src) {
          const cap = this.rules.block.blockquote.exec(src);
          if (cap) {
              let lines = rtrim(cap[0], '\n').split('\n');
              let raw = '';
              let text = '';
              const tokens = [];
              while (lines.length > 0) {
                  let inBlockquote = false;
                  const currentLines = [];
                  let i;
                  for (i = 0; i < lines.length; i++) {
                      // get lines up to a continuation
                      if (/^ {0,3}>/.test(lines[i])) {
                          currentLines.push(lines[i]);
                          inBlockquote = true;
                      }
                      else if (!inBlockquote) {
                          currentLines.push(lines[i]);
                      }
                      else {
                          break;
                      }
                  }
                  lines = lines.slice(i);
                  const currentRaw = currentLines.join('\n');
                  const currentText = currentRaw
                      // precede setext continuation with 4 spaces so it isn't a setext
                      .replace(/\n {0,3}((?:=+|-+) *)(?=\n|$)/g, '\n    $1')
                      .replace(/^ {0,3}>[ \t]?/gm, '');
                  raw = raw ? `${raw}\n${currentRaw}` : currentRaw;
                  text = text ? `${text}\n${currentText}` : currentText;
                  // parse blockquote lines as top level tokens
                  // merge paragraphs if this is a continuation
                  const top = this.lexer.state.top;
                  this.lexer.state.top = true;
                  this.lexer.blockTokens(currentText, tokens, true);
                  this.lexer.state.top = top;
                  // if there is no continuation then we are done
                  if (lines.length === 0) {
                      break;
                  }
                  const lastToken = tokens[tokens.length - 1];
                  if (lastToken?.type === 'code') {
                      // blockquote continuation cannot be preceded by a code block
                      break;
                  }
                  else if (lastToken?.type === 'blockquote') {
                      // include continuation in nested blockquote
                      const oldToken = lastToken;
                      const newText = oldToken.raw + '\n' + lines.join('\n');
                      const newToken = this.blockquote(newText);
                      tokens[tokens.length - 1] = newToken;
                      raw = raw.substring(0, raw.length - oldToken.raw.length) + newToken.raw;
                      text = text.substring(0, text.length - oldToken.text.length) + newToken.text;
                      break;
                  }
                  else if (lastToken?.type === 'list') {
                      // include continuation in nested list
                      const oldToken = lastToken;
                      const newText = oldToken.raw + '\n' + lines.join('\n');
                      const newToken = this.list(newText);
                      tokens[tokens.length - 1] = newToken;
                      raw = raw.substring(0, raw.length - lastToken.raw.length) + newToken.raw;
                      text = text.substring(0, text.length - oldToken.raw.length) + newToken.raw;
                      lines = newText.substring(tokens[tokens.length - 1].raw.length).split('\n');
                      continue;
                  }
              }
              return {
                  type: 'blockquote',
                  raw,
                  tokens,
                  text,
              };
          }
      }
      list(src) {
          let cap = this.rules.block.list.exec(src);
          if (cap) {
              let bull = cap[1].trim();
              const isordered = bull.length > 1;
              const list = {
                  type: 'list',
                  raw: '',
                  ordered: isordered,
                  start: isordered ? +bull.slice(0, -1) : '',
                  loose: false,
                  items: [],
              };
              bull = isordered ? `\\d{1,9}\\${bull.slice(-1)}` : `\\${bull}`;
              if (this.options.pedantic) {
                  bull = isordered ? bull : '[*+-]';
              }
              // Get next list item
              const itemRegex = new RegExp(`^( {0,3}${bull})((?:[\t ][^\\n]*)?(?:\\n|$))`);
              let endsWithBlankLine = false;
              // Check if current bullet point can start a new List Item
              while (src) {
                  let endEarly = false;
                  let raw = '';
                  let itemContents = '';
                  if (!(cap = itemRegex.exec(src))) {
                      break;
                  }
                  if (this.rules.block.hr.test(src)) { // End list if bullet was actually HR (possibly move into itemRegex?)
                      break;
                  }
                  raw = cap[0];
                  src = src.substring(raw.length);
                  let line = cap[2].split('\n', 1)[0].replace(/^\t+/, (t) => ' '.repeat(3 * t.length));
                  let nextLine = src.split('\n', 1)[0];
                  let blankLine = !line.trim();
                  let indent = 0;
                  if (this.options.pedantic) {
                      indent = 2;
                      itemContents = line.trimStart();
                  }
                  else if (blankLine) {
                      indent = cap[1].length + 1;
                  }
                  else {
                      indent = cap[2].search(/[^ ]/); // Find first non-space char
                      indent = indent > 4 ? 1 : indent; // Treat indented code blocks (> 4 spaces) as having only 1 indent
                      itemContents = line.slice(indent);
                      indent += cap[1].length;
                  }
                  if (blankLine && /^[ \t]*$/.test(nextLine)) { // Items begin with at most one blank line
                      raw += nextLine + '\n';
                      src = src.substring(nextLine.length + 1);
                      endEarly = true;
                  }
                  if (!endEarly) {
                      const nextBulletRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ \t][^\\n]*)?(?:\\n|$))`);
                      const hrRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`);
                      const fencesBeginRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:\`\`\`|~~~)`);
                      const headingBeginRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}#`);
                      const htmlBeginRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}<(?:[a-z].*>|!--)`, 'i');
                      // Check if following lines should be included in List Item
                      while (src) {
                          const rawLine = src.split('\n', 1)[0];
                          let nextLineWithoutTabs;
                          nextLine = rawLine;
                          // Re-align to follow commonmark nesting rules
                          if (this.options.pedantic) {
                              nextLine = nextLine.replace(/^ {1,4}(?=( {4})*[^ ])/g, '  ');
                              nextLineWithoutTabs = nextLine;
                          }
                          else {
                              nextLineWithoutTabs = nextLine.replace(/\t/g, '    ');
                          }
                          // End list item if found code fences
                          if (fencesBeginRegex.test(nextLine)) {
                              break;
                          }
                          // End list item if found start of new heading
                          if (headingBeginRegex.test(nextLine)) {
                              break;
                          }
                          // End list item if found start of html block
                          if (htmlBeginRegex.test(nextLine)) {
                              break;
                          }
                          // End list item if found start of new bullet
                          if (nextBulletRegex.test(nextLine)) {
                              break;
                          }
                          // Horizontal rule found
                          if (hrRegex.test(nextLine)) {
                              break;
                          }
                          if (nextLineWithoutTabs.search(/[^ ]/) >= indent || !nextLine.trim()) { // Dedent if possible
                              itemContents += '\n' + nextLineWithoutTabs.slice(indent);
                          }
                          else {
                              // not enough indentation
                              if (blankLine) {
                                  break;
                              }
                              // paragraph continuation unless last line was a different block level element
                              if (line.replace(/\t/g, '    ').search(/[^ ]/) >= 4) { // indented code block
                                  break;
                              }
                              if (fencesBeginRegex.test(line)) {
                                  break;
                              }
                              if (headingBeginRegex.test(line)) {
                                  break;
                              }
                              if (hrRegex.test(line)) {
                                  break;
                              }
                              itemContents += '\n' + nextLine;
                          }
                          if (!blankLine && !nextLine.trim()) { // Check if current line is blank
                              blankLine = true;
                          }
                          raw += rawLine + '\n';
                          src = src.substring(rawLine.length + 1);
                          line = nextLineWithoutTabs.slice(indent);
                      }
                  }
                  if (!list.loose) {
                      // If the previous item ended with a blank line, the list is loose
                      if (endsWithBlankLine) {
                          list.loose = true;
                      }
                      else if (/\n[ \t]*\n[ \t]*$/.test(raw)) {
                          endsWithBlankLine = true;
                      }
                  }
                  let istask = null;
                  let ischecked;
                  // Check for task list items
                  if (this.options.gfm) {
                      istask = /^\[[ xX]\] /.exec(itemContents);
                      if (istask) {
                          ischecked = istask[0] !== '[ ] ';
                          itemContents = itemContents.replace(/^\[[ xX]\] +/, '');
                      }
                  }
                  list.items.push({
                      type: 'list_item',
                      raw,
                      task: !!istask,
                      checked: ischecked,
                      loose: false,
                      text: itemContents,
                      tokens: [],
                  });
                  list.raw += raw;
              }
              // Do not consume newlines at end of final item. Alternatively, make itemRegex *start* with any newlines to simplify/speed up endsWithBlankLine logic
              list.items[list.items.length - 1].raw = list.items[list.items.length - 1].raw.trimEnd();
              list.items[list.items.length - 1].text = list.items[list.items.length - 1].text.trimEnd();
              list.raw = list.raw.trimEnd();
              // Item child tokens handled here at end because we needed to have the final item to trim it first
              for (let i = 0; i < list.items.length; i++) {
                  this.lexer.state.top = false;
                  list.items[i].tokens = this.lexer.blockTokens(list.items[i].text, []);
                  if (!list.loose) {
                      // Check if list should be loose
                      const spacers = list.items[i].tokens.filter(t => t.type === 'space');
                      const hasMultipleLineBreaks = spacers.length > 0 && spacers.some(t => /\n.*\n/.test(t.raw));
                      list.loose = hasMultipleLineBreaks;
                  }
              }
              // Set all items to loose if list is loose
              if (list.loose) {
                  for (let i = 0; i < list.items.length; i++) {
                      list.items[i].loose = true;
                  }
              }
              return list;
          }
      }
      html(src) {
          const cap = this.rules.block.html.exec(src);
          if (cap) {
              const token = {
                  type: 'html',
                  block: true,
                  raw: cap[0],
                  pre: cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style',
                  text: cap[0],
              };
              return token;
          }
      }
      def(src) {
          const cap = this.rules.block.def.exec(src);
          if (cap) {
              const tag = cap[1].toLowerCase().replace(/\s+/g, ' ');
              const href = cap[2] ? cap[2].replace(/^<(.*)>$/, '$1').replace(this.rules.inline.anyPunctuation, '$1') : '';
              const title = cap[3] ? cap[3].substring(1, cap[3].length - 1).replace(this.rules.inline.anyPunctuation, '$1') : cap[3];
              return {
                  type: 'def',
                  tag,
                  raw: cap[0],
                  href,
                  title,
              };
          }
      }
      table(src) {
          const cap = this.rules.block.table.exec(src);
          if (!cap) {
              return;
          }
          if (!/[:|]/.test(cap[2])) {
              // delimiter row must have a pipe (|) or colon (:) otherwise it is a setext heading
              return;
          }
          const headers = splitCells(cap[1]);
          const aligns = cap[2].replace(/^\||\| *$/g, '').split('|');
          const rows = cap[3] && cap[3].trim() ? cap[3].replace(/\n[ \t]*$/, '').split('\n') : [];
          const item = {
              type: 'table',
              raw: cap[0],
              header: [],
              align: [],
              rows: [],
          };
          if (headers.length !== aligns.length) {
              // header and align columns must be equal, rows can be different.
              return;
          }
          for (const align of aligns) {
              if (/^ *-+: *$/.test(align)) {
                  item.align.push('right');
              }
              else if (/^ *:-+: *$/.test(align)) {
                  item.align.push('center');
              }
              else if (/^ *:-+ *$/.test(align)) {
                  item.align.push('left');
              }
              else {
                  item.align.push(null);
              }
          }
          for (let i = 0; i < headers.length; i++) {
              item.header.push({
                  text: headers[i],
                  tokens: this.lexer.inline(headers[i]),
                  header: true,
                  align: item.align[i],
              });
          }
          for (const row of rows) {
              item.rows.push(splitCells(row, item.header.length).map((cell, i) => {
                  return {
                      text: cell,
                      tokens: this.lexer.inline(cell),
                      header: false,
                      align: item.align[i],
                  };
              }));
          }
          return item;
      }
      lheading(src) {
          const cap = this.rules.block.lheading.exec(src);
          if (cap) {
              return {
                  type: 'heading',
                  raw: cap[0],
                  depth: cap[2].charAt(0) === '=' ? 1 : 2,
                  text: cap[1],
                  tokens: this.lexer.inline(cap[1]),
              };
          }
      }
      paragraph(src) {
          const cap = this.rules.block.paragraph.exec(src);
          if (cap) {
              const text = cap[1].charAt(cap[1].length - 1) === '\n'
                  ? cap[1].slice(0, -1)
                  : cap[1];
              return {
                  type: 'paragraph',
                  raw: cap[0],
                  text,
                  tokens: this.lexer.inline(text),
              };
          }
      }
      text(src) {
          const cap = this.rules.block.text.exec(src);
          if (cap) {
              return {
                  type: 'text',
                  raw: cap[0],
                  text: cap[0],
                  tokens: this.lexer.inline(cap[0]),
              };
          }
      }
      escape(src) {
          const cap = this.rules.inline.escape.exec(src);
          if (cap) {
              return {
                  type: 'escape',
                  raw: cap[0],
                  text: escape$1(cap[1]),
              };
          }
      }
      tag(src) {
          const cap = this.rules.inline.tag.exec(src);
          if (cap) {
              if (!this.lexer.state.inLink && /^<a /i.test(cap[0])) {
                  this.lexer.state.inLink = true;
              }
              else if (this.lexer.state.inLink && /^<\/a>/i.test(cap[0])) {
                  this.lexer.state.inLink = false;
              }
              if (!this.lexer.state.inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
                  this.lexer.state.inRawBlock = true;
              }
              else if (this.lexer.state.inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
                  this.lexer.state.inRawBlock = false;
              }
              return {
                  type: 'html',
                  raw: cap[0],
                  inLink: this.lexer.state.inLink,
                  inRawBlock: this.lexer.state.inRawBlock,
                  block: false,
                  text: cap[0],
              };
          }
      }
      link(src) {
          const cap = this.rules.inline.link.exec(src);
          if (cap) {
              const trimmedUrl = cap[2].trim();
              if (!this.options.pedantic && /^</.test(trimmedUrl)) {
                  // commonmark requires matching angle brackets
                  if (!(/>$/.test(trimmedUrl))) {
                      return;
                  }
                  // ending angle bracket cannot be escaped
                  const rtrimSlash = rtrim(trimmedUrl.slice(0, -1), '\\');
                  if ((trimmedUrl.length - rtrimSlash.length) % 2 === 0) {
                      return;
                  }
              }
              else {
                  // find closing parenthesis
                  const lastParenIndex = findClosingBracket(cap[2], '()');
                  if (lastParenIndex > -1) {
                      const start = cap[0].indexOf('!') === 0 ? 5 : 4;
                      const linkLen = start + cap[1].length + lastParenIndex;
                      cap[2] = cap[2].substring(0, lastParenIndex);
                      cap[0] = cap[0].substring(0, linkLen).trim();
                      cap[3] = '';
                  }
              }
              let href = cap[2];
              let title = '';
              if (this.options.pedantic) {
                  // split pedantic href and title
                  const link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href);
                  if (link) {
                      href = link[1];
                      title = link[3];
                  }
              }
              else {
                  title = cap[3] ? cap[3].slice(1, -1) : '';
              }
              href = href.trim();
              if (/^</.test(href)) {
                  if (this.options.pedantic && !(/>$/.test(trimmedUrl))) {
                      // pedantic allows starting angle bracket without ending angle bracket
                      href = href.slice(1);
                  }
                  else {
                      href = href.slice(1, -1);
                  }
              }
              return outputLink(cap, {
                  href: href ? href.replace(this.rules.inline.anyPunctuation, '$1') : href,
                  title: title ? title.replace(this.rules.inline.anyPunctuation, '$1') : title,
              }, cap[0], this.lexer);
          }
      }
      reflink(src, links) {
          let cap;
          if ((cap = this.rules.inline.reflink.exec(src))
              || (cap = this.rules.inline.nolink.exec(src))) {
              const linkString = (cap[2] || cap[1]).replace(/\s+/g, ' ');
              const link = links[linkString.toLowerCase()];
              if (!link) {
                  const text = cap[0].charAt(0);
                  return {
                      type: 'text',
                      raw: text,
                      text,
                  };
              }
              return outputLink(cap, link, cap[0], this.lexer);
          }
      }
      emStrong(src, maskedSrc, prevChar = '') {
          let match = this.rules.inline.emStrongLDelim.exec(src);
          if (!match)
              return;
          // _ can't be between two alphanumerics. \p{L}\p{N} includes non-english alphabet/numbers as well
          if (match[3] && prevChar.match(/[\p{L}\p{N}]/u))
              return;
          const nextChar = match[1] || match[2] || '';
          if (!nextChar || !prevChar || this.rules.inline.punctuation.exec(prevChar)) {
              // unicode Regex counts emoji as 1 char; spread into array for proper count (used multiple times below)
              const lLength = [...match[0]].length - 1;
              let rDelim, rLength, delimTotal = lLength, midDelimTotal = 0;
              const endReg = match[0][0] === '*' ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
              endReg.lastIndex = 0;
              // Clip maskedSrc to same section of string as src (move to lexer?)
              maskedSrc = maskedSrc.slice(-1 * src.length + lLength);
              while ((match = endReg.exec(maskedSrc)) != null) {
                  rDelim = match[1] || match[2] || match[3] || match[4] || match[5] || match[6];
                  if (!rDelim)
                      continue; // skip single * in __abc*abc__
                  rLength = [...rDelim].length;
                  if (match[3] || match[4]) { // found another Left Delim
                      delimTotal += rLength;
                      continue;
                  }
                  else if (match[5] || match[6]) { // either Left or Right Delim
                      if (lLength % 3 && !((lLength + rLength) % 3)) {
                          midDelimTotal += rLength;
                          continue; // CommonMark Emphasis Rules 9-10
                      }
                  }
                  delimTotal -= rLength;
                  if (delimTotal > 0)
                      continue; // Haven't found enough closing delimiters
                  // Remove extra characters. *a*** -> *a*
                  rLength = Math.min(rLength, rLength + delimTotal + midDelimTotal);
                  // char length can be >1 for unicode characters;
                  const lastCharLength = [...match[0]][0].length;
                  const raw = src.slice(0, lLength + match.index + lastCharLength + rLength);
                  // Create `em` if smallest delimiter has odd char count. *a***
                  if (Math.min(lLength, rLength) % 2) {
                      const text = raw.slice(1, -1);
                      return {
                          type: 'em',
                          raw,
                          text,
                          tokens: this.lexer.inlineTokens(text),
                      };
                  }
                  // Create 'strong' if smallest delimiter has even char count. **a***
                  const text = raw.slice(2, -2);
                  return {
                      type: 'strong',
                      raw,
                      text,
                      tokens: this.lexer.inlineTokens(text),
                  };
              }
          }
      }
      codespan(src) {
          const cap = this.rules.inline.code.exec(src);
          if (cap) {
              let text = cap[2].replace(/\n/g, ' ');
              const hasNonSpaceChars = /[^ ]/.test(text);
              const hasSpaceCharsOnBothEnds = /^ /.test(text) && / $/.test(text);
              if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
                  text = text.substring(1, text.length - 1);
              }
              text = escape$1(text, true);
              return {
                  type: 'codespan',
                  raw: cap[0],
                  text,
              };
          }
      }
      br(src) {
          const cap = this.rules.inline.br.exec(src);
          if (cap) {
              return {
                  type: 'br',
                  raw: cap[0],
              };
          }
      }
      del(src) {
          const cap = this.rules.inline.del.exec(src);
          if (cap) {
              return {
                  type: 'del',
                  raw: cap[0],
                  text: cap[2],
                  tokens: this.lexer.inlineTokens(cap[2]),
              };
          }
      }
      autolink(src) {
          const cap = this.rules.inline.autolink.exec(src);
          if (cap) {
              let text, href;
              if (cap[2] === '@') {
                  text = escape$1(cap[1]);
                  href = 'mailto:' + text;
              }
              else {
                  text = escape$1(cap[1]);
                  href = text;
              }
              return {
                  type: 'link',
                  raw: cap[0],
                  text,
                  href,
                  tokens: [
                      {
                          type: 'text',
                          raw: text,
                          text,
                      },
                  ],
              };
          }
      }
      url(src) {
          let cap;
          if (cap = this.rules.inline.url.exec(src)) {
              let text, href;
              if (cap[2] === '@') {
                  text = escape$1(cap[0]);
                  href = 'mailto:' + text;
              }
              else {
                  // do extended autolink path validation
                  let prevCapZero;
                  do {
                      prevCapZero = cap[0];
                      cap[0] = this.rules.inline._backpedal.exec(cap[0])?.[0] ?? '';
                  } while (prevCapZero !== cap[0]);
                  text = escape$1(cap[0]);
                  if (cap[1] === 'www.') {
                      href = 'http://' + cap[0];
                  }
                  else {
                      href = cap[0];
                  }
              }
              return {
                  type: 'link',
                  raw: cap[0],
                  text,
                  href,
                  tokens: [
                      {
                          type: 'text',
                          raw: text,
                          text,
                      },
                  ],
              };
          }
      }
      inlineText(src) {
          const cap = this.rules.inline.text.exec(src);
          if (cap) {
              let text;
              if (this.lexer.state.inRawBlock) {
                  text = cap[0];
              }
              else {
                  text = escape$1(cap[0]);
              }
              return {
                  type: 'text',
                  raw: cap[0],
                  text,
              };
          }
      }
  }

  /**
   * Block-Level Grammar
   */
  const newline = /^(?:[ \t]*(?:\n|$))+/;
  const blockCode = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/;
  const fences = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/;
  const hr = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/;
  const heading = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/;
  const bullet = /(?:[*+-]|\d{1,9}[.)])/;
  const lheading = edit(/^(?!bull |blockCode|fences|blockquote|heading|html)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html))+?)\n {0,3}(=+|-+) *(?:\n+|$)/)
      .replace(/bull/g, bullet) // lists can interrupt
      .replace(/blockCode/g, /(?: {4}| {0,3}\t)/) // indented code blocks can interrupt
      .replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/) // fenced code blocks can interrupt
      .replace(/blockquote/g, / {0,3}>/) // blockquote can interrupt
      .replace(/heading/g, / {0,3}#{1,6}/) // ATX heading can interrupt
      .replace(/html/g, / {0,3}<[^\n>]+>\n/) // block html can interrupt
      .getRegex();
  const _paragraph = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/;
  const blockText = /^[^\n]+/;
  const _blockLabel = /(?!\s*\])(?:\\.|[^\[\]\\])+/;
  const def = edit(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/)
      .replace('label', _blockLabel)
      .replace('title', /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/)
      .getRegex();
  const list = edit(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/)
      .replace(/bull/g, bullet)
      .getRegex();
  const _tag = 'address|article|aside|base|basefont|blockquote|body|caption'
      + '|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption'
      + '|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe'
      + '|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option'
      + '|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title'
      + '|tr|track|ul';
  const _comment = /<!--(?:-?>|[\s\S]*?(?:-->|$))/;
  const html = edit('^ {0,3}(?:' // optional indentation
      + '<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)' // (1)
      + '|comment[^\\n]*(\\n+|$)' // (2)
      + '|<\\?[\\s\\S]*?(?:\\?>\\n*|$)' // (3)
      + '|<![A-Z][\\s\\S]*?(?:>\\n*|$)' // (4)
      + '|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)' // (5)
      + '|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$)' // (6)
      + '|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$)' // (7) open tag
      + '|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$)' // (7) closing tag
      + ')', 'i')
      .replace('comment', _comment)
      .replace('tag', _tag)
      .replace('attribute', / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/)
      .getRegex();
  const paragraph = edit(_paragraph)
      .replace('hr', hr)
      .replace('heading', ' {0,3}#{1,6}(?:\\s|$)')
      .replace('|lheading', '') // setext headings don't interrupt commonmark paragraphs
      .replace('|table', '')
      .replace('blockquote', ' {0,3}>')
      .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
      .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)')
      .replace('tag', _tag) // pars can be interrupted by type (6) html blocks
      .getRegex();
  const blockquote = edit(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/)
      .replace('paragraph', paragraph)
      .getRegex();
  /**
   * Normal Block Grammar
   */
  const blockNormal = {
      blockquote,
      code: blockCode,
      def,
      fences,
      heading,
      hr,
      html,
      lheading,
      list,
      newline,
      paragraph,
      table: noopTest,
      text: blockText,
  };
  /**
   * GFM Block Grammar
   */
  const gfmTable = edit('^ *([^\\n ].*)\\n' // Header
      + ' {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)' // Align
      + '(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)') // Cells
      .replace('hr', hr)
      .replace('heading', ' {0,3}#{1,6}(?:\\s|$)')
      .replace('blockquote', ' {0,3}>')
      .replace('code', '(?: {4}| {0,3}\t)[^\\n]')
      .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
      .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)')
      .replace('tag', _tag) // tables can be interrupted by type (6) html blocks
      .getRegex();
  const blockGfm = {
      ...blockNormal,
      table: gfmTable,
      paragraph: edit(_paragraph)
          .replace('hr', hr)
          .replace('heading', ' {0,3}#{1,6}(?:\\s|$)')
          .replace('|lheading', '') // setext headings don't interrupt commonmark paragraphs
          .replace('table', gfmTable) // interrupt paragraphs with table
          .replace('blockquote', ' {0,3}>')
          .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
          .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
          .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)')
          .replace('tag', _tag) // pars can be interrupted by type (6) html blocks
          .getRegex(),
  };
  /**
   * Pedantic grammar (original John Gruber's loose markdown specification)
   */
  const blockPedantic = {
      ...blockNormal,
      html: edit('^ *(?:comment *(?:\\n|\\s*$)'
          + '|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)' // closed tag
          + '|<tag(?:"[^"]*"|\'[^\']*\'|\\s[^\'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))')
          .replace('comment', _comment)
          .replace(/tag/g, '(?!(?:'
          + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub'
          + '|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)'
          + '\\b)\\w+(?!:|[^\\w\\s@]*@)\\b')
          .getRegex(),
      def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
      heading: /^(#{1,6})(.*)(?:\n+|$)/,
      fences: noopTest, // fences not supported
      lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
      paragraph: edit(_paragraph)
          .replace('hr', hr)
          .replace('heading', ' *#{1,6} *[^\n]')
          .replace('lheading', lheading)
          .replace('|table', '')
          .replace('blockquote', ' {0,3}>')
          .replace('|fences', '')
          .replace('|list', '')
          .replace('|html', '')
          .replace('|tag', '')
          .getRegex(),
  };
  /**
   * Inline-Level Grammar
   */
  const escape = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/;
  const inlineCode = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/;
  const br = /^( {2,}|\\)\n(?!\s*$)/;
  const inlineText = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/;
  // list of unicode punctuation marks, plus any missing characters from CommonMark spec
  const _punctuation = '\\p{P}\\p{S}';
  const punctuation = edit(/^((?![*_])[\spunctuation])/, 'u')
      .replace(/punctuation/g, _punctuation).getRegex();
  // sequences em should skip over [title](link), `code`, <html>
  const blockSkip = /\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g;
  const emStrongLDelim = edit(/^(?:\*+(?:((?!\*)[punct])|[^\s*]))|^_+(?:((?!_)[punct])|([^\s_]))/, 'u')
      .replace(/punct/g, _punctuation)
      .getRegex();
  const emStrongRDelimAst = edit('^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)' // Skip orphan inside strong
      + '|[^*]+(?=[^*])' // Consume to delim
      + '|(?!\\*)[punct](\\*+)(?=[\\s]|$)' // (1) #*** can only be a Right Delimiter
      + '|[^punct\\s](\\*+)(?!\\*)(?=[punct\\s]|$)' // (2) a***#, a*** can only be a Right Delimiter
      + '|(?!\\*)[punct\\s](\\*+)(?=[^punct\\s])' // (3) #***a, ***a can only be Left Delimiter
      + '|[\\s](\\*+)(?!\\*)(?=[punct])' // (4) ***# can only be Left Delimiter
      + '|(?!\\*)[punct](\\*+)(?!\\*)(?=[punct])' // (5) #***# can be either Left or Right Delimiter
      + '|[^punct\\s](\\*+)(?=[^punct\\s])', 'gu') // (6) a***a can be either Left or Right Delimiter
      .replace(/punct/g, _punctuation)
      .getRegex();
  // (6) Not allowed for _
  const emStrongRDelimUnd = edit('^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)' // Skip orphan inside strong
      + '|[^_]+(?=[^_])' // Consume to delim
      + '|(?!_)[punct](_+)(?=[\\s]|$)' // (1) #___ can only be a Right Delimiter
      + '|[^punct\\s](_+)(?!_)(?=[punct\\s]|$)' // (2) a___#, a___ can only be a Right Delimiter
      + '|(?!_)[punct\\s](_+)(?=[^punct\\s])' // (3) #___a, ___a can only be Left Delimiter
      + '|[\\s](_+)(?!_)(?=[punct])' // (4) ___# can only be Left Delimiter
      + '|(?!_)[punct](_+)(?!_)(?=[punct])', 'gu') // (5) #___# can be either Left or Right Delimiter
      .replace(/punct/g, _punctuation)
      .getRegex();
  const anyPunctuation = edit(/\\([punct])/, 'gu')
      .replace(/punct/g, _punctuation)
      .getRegex();
  const autolink = edit(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/)
      .replace('scheme', /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/)
      .replace('email', /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/)
      .getRegex();
  const _inlineComment = edit(_comment).replace('(?:-->|$)', '-->').getRegex();
  const tag = edit('^comment'
      + '|^</[a-zA-Z][\\w:-]*\\s*>' // self-closing tag
      + '|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>' // open tag
      + '|^<\\?[\\s\\S]*?\\?>' // processing instruction, e.g. <?php ?>
      + '|^<![a-zA-Z]+\\s[\\s\\S]*?>' // declaration, e.g. <!DOCTYPE html>
      + '|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>') // CDATA section
      .replace('comment', _inlineComment)
      .replace('attribute', /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/)
      .getRegex();
  const _inlineLabel = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
  const link = edit(/^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/)
      .replace('label', _inlineLabel)
      .replace('href', /<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/)
      .replace('title', /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/)
      .getRegex();
  const reflink = edit(/^!?\[(label)\]\[(ref)\]/)
      .replace('label', _inlineLabel)
      .replace('ref', _blockLabel)
      .getRegex();
  const nolink = edit(/^!?\[(ref)\](?:\[\])?/)
      .replace('ref', _blockLabel)
      .getRegex();
  const reflinkSearch = edit('reflink|nolink(?!\\()', 'g')
      .replace('reflink', reflink)
      .replace('nolink', nolink)
      .getRegex();
  /**
   * Normal Inline Grammar
   */
  const inlineNormal = {
      _backpedal: noopTest, // only used for GFM url
      anyPunctuation,
      autolink,
      blockSkip,
      br,
      code: inlineCode,
      del: noopTest,
      emStrongLDelim,
      emStrongRDelimAst,
      emStrongRDelimUnd,
      escape,
      link,
      nolink,
      punctuation,
      reflink,
      reflinkSearch,
      tag,
      text: inlineText,
      url: noopTest,
  };
  /**
   * Pedantic Inline Grammar
   */
  const inlinePedantic = {
      ...inlineNormal,
      link: edit(/^!?\[(label)\]\((.*?)\)/)
          .replace('label', _inlineLabel)
          .getRegex(),
      reflink: edit(/^!?\[(label)\]\s*\[([^\]]*)\]/)
          .replace('label', _inlineLabel)
          .getRegex(),
  };
  /**
   * GFM Inline Grammar
   */
  const inlineGfm = {
      ...inlineNormal,
      escape: edit(escape).replace('])', '~|])').getRegex(),
      url: edit(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/, 'i')
          .replace('email', /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/)
          .getRegex(),
      _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
      del: /^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,
      text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/,
  };
  /**
   * GFM + Line Breaks Inline Grammar
   */
  const inlineBreaks = {
      ...inlineGfm,
      br: edit(br).replace('{2,}', '*').getRegex(),
      text: edit(inlineGfm.text)
          .replace('\\b_', '\\b_| {2,}\\n')
          .replace(/\{2,\}/g, '*')
          .getRegex(),
  };
  /**
   * exports
   */
  const block = {
      normal: blockNormal,
      gfm: blockGfm,
      pedantic: blockPedantic,
  };
  const inline = {
      normal: inlineNormal,
      gfm: inlineGfm,
      breaks: inlineBreaks,
      pedantic: inlinePedantic,
  };

  /**
   * Block Lexer
   */
  class _Lexer {
      tokens;
      options;
      state;
      tokenizer;
      inlineQueue;
      constructor(options) {
          // TokenList cannot be created in one go
          this.tokens = [];
          this.tokens.links = Object.create(null);
          this.options = options || _defaults;
          this.options.tokenizer = this.options.tokenizer || new _Tokenizer();
          this.tokenizer = this.options.tokenizer;
          this.tokenizer.options = this.options;
          this.tokenizer.lexer = this;
          this.inlineQueue = [];
          this.state = {
              inLink: false,
              inRawBlock: false,
              top: true,
          };
          const rules = {
              block: block.normal,
              inline: inline.normal,
          };
          if (this.options.pedantic) {
              rules.block = block.pedantic;
              rules.inline = inline.pedantic;
          }
          else if (this.options.gfm) {
              rules.block = block.gfm;
              if (this.options.breaks) {
                  rules.inline = inline.breaks;
              }
              else {
                  rules.inline = inline.gfm;
              }
          }
          this.tokenizer.rules = rules;
      }
      /**
       * Expose Rules
       */
      static get rules() {
          return {
              block,
              inline,
          };
      }
      /**
       * Static Lex Method
       */
      static lex(src, options) {
          const lexer = new _Lexer(options);
          return lexer.lex(src);
      }
      /**
       * Static Lex Inline Method
       */
      static lexInline(src, options) {
          const lexer = new _Lexer(options);
          return lexer.inlineTokens(src);
      }
      /**
       * Preprocessing
       */
      lex(src) {
          src = src
              .replace(/\r\n|\r/g, '\n');
          this.blockTokens(src, this.tokens);
          for (let i = 0; i < this.inlineQueue.length; i++) {
              const next = this.inlineQueue[i];
              this.inlineTokens(next.src, next.tokens);
          }
          this.inlineQueue = [];
          return this.tokens;
      }
      blockTokens(src, tokens = [], lastParagraphClipped = false) {
          if (this.options.pedantic) {
              src = src.replace(/\t/g, '    ').replace(/^ +$/gm, '');
          }
          let token;
          let lastToken;
          let cutSrc;
          while (src) {
              if (this.options.extensions
                  && this.options.extensions.block
                  && this.options.extensions.block.some((extTokenizer) => {
                      if (token = extTokenizer.call({ lexer: this }, src, tokens)) {
                          src = src.substring(token.raw.length);
                          tokens.push(token);
                          return true;
                      }
                      return false;
                  })) {
                  continue;
              }
              // newline
              if (token = this.tokenizer.space(src)) {
                  src = src.substring(token.raw.length);
                  if (token.raw.length === 1 && tokens.length > 0) {
                      // if there's a single \n as a spacer, it's terminating the last line,
                      // so move it there so that we don't get unnecessary paragraph tags
                      tokens[tokens.length - 1].raw += '\n';
                  }
                  else {
                      tokens.push(token);
                  }
                  continue;
              }
              // code
              if (token = this.tokenizer.code(src)) {
                  src = src.substring(token.raw.length);
                  lastToken = tokens[tokens.length - 1];
                  // An indented code block cannot interrupt a paragraph.
                  if (lastToken && (lastToken.type === 'paragraph' || lastToken.type === 'text')) {
                      lastToken.raw += '\n' + token.raw;
                      lastToken.text += '\n' + token.text;
                      this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
                  }
                  else {
                      tokens.push(token);
                  }
                  continue;
              }
              // fences
              if (token = this.tokenizer.fences(src)) {
                  src = src.substring(token.raw.length);
                  tokens.push(token);
                  continue;
              }
              // heading
              if (token = this.tokenizer.heading(src)) {
                  src = src.substring(token.raw.length);
                  tokens.push(token);
                  continue;
              }
              // hr
              if (token = this.tokenizer.hr(src)) {
                  src = src.substring(token.raw.length);
                  tokens.push(token);
                  continue;
              }
              // blockquote
              if (token = this.tokenizer.blockquote(src)) {
                  src = src.substring(token.raw.length);
                  tokens.push(token);
                  continue;
              }
              // list
              if (token = this.tokenizer.list(src)) {
                  src = src.substring(token.raw.length);
                  tokens.push(token);
                  continue;
              }
              // html
              if (token = this.tokenizer.html(src)) {
                  src = src.substring(token.raw.length);
                  tokens.push(token);
                  continue;
              }
              // def
              if (token = this.tokenizer.def(src)) {
                  src = src.substring(token.raw.length);
                  lastToken = tokens[tokens.length - 1];
                  if (lastToken && (lastToken.type === 'paragraph' || lastToken.type === 'text')) {
                      lastToken.raw += '\n' + token.raw;
                      lastToken.text += '\n' + token.raw;
                      this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
                  }
                  else if (!this.tokens.links[token.tag]) {
                      this.tokens.links[token.tag] = {
                          href: token.href,
                          title: token.title,
                      };
                  }
                  continue;
              }
              // table (gfm)
              if (token = this.tokenizer.table(src)) {
                  src = src.substring(token.raw.length);
                  tokens.push(token);
                  continue;
              }
              // lheading
              if (token = this.tokenizer.lheading(src)) {
                  src = src.substring(token.raw.length);
                  tokens.push(token);
                  continue;
              }
              // top-level paragraph
              // prevent paragraph consuming extensions by clipping 'src' to extension start
              cutSrc = src;
              if (this.options.extensions && this.options.extensions.startBlock) {
                  let startIndex = Infinity;
                  const tempSrc = src.slice(1);
                  let tempStart;
                  this.options.extensions.startBlock.forEach((getStartIndex) => {
                      tempStart = getStartIndex.call({ lexer: this }, tempSrc);
                      if (typeof tempStart === 'number' && tempStart >= 0) {
                          startIndex = Math.min(startIndex, tempStart);
                      }
                  });
                  if (startIndex < Infinity && startIndex >= 0) {
                      cutSrc = src.substring(0, startIndex + 1);
                  }
              }
              if (this.state.top && (token = this.tokenizer.paragraph(cutSrc))) {
                  lastToken = tokens[tokens.length - 1];
                  if (lastParagraphClipped && lastToken?.type === 'paragraph') {
                      lastToken.raw += '\n' + token.raw;
                      lastToken.text += '\n' + token.text;
                      this.inlineQueue.pop();
                      this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
                  }
                  else {
                      tokens.push(token);
                  }
                  lastParagraphClipped = (cutSrc.length !== src.length);
                  src = src.substring(token.raw.length);
                  continue;
              }
              // text
              if (token = this.tokenizer.text(src)) {
                  src = src.substring(token.raw.length);
                  lastToken = tokens[tokens.length - 1];
                  if (lastToken && lastToken.type === 'text') {
                      lastToken.raw += '\n' + token.raw;
                      lastToken.text += '\n' + token.text;
                      this.inlineQueue.pop();
                      this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
                  }
                  else {
                      tokens.push(token);
                  }
                  continue;
              }
              if (src) {
                  const errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);
                  if (this.options.silent) {
                      console.error(errMsg);
                      break;
                  }
                  else {
                      throw new Error(errMsg);
                  }
              }
          }
          this.state.top = true;
          return tokens;
      }
      inline(src, tokens = []) {
          this.inlineQueue.push({ src, tokens });
          return tokens;
      }
      /**
       * Lexing/Compiling
       */
      inlineTokens(src, tokens = []) {
          let token, lastToken, cutSrc;
          // String with links masked to avoid interference with em and strong
          let maskedSrc = src;
          let match;
          let keepPrevChar, prevChar;
          // Mask out reflinks
          if (this.tokens.links) {
              const links = Object.keys(this.tokens.links);
              if (links.length > 0) {
                  while ((match = this.tokenizer.rules.inline.reflinkSearch.exec(maskedSrc)) != null) {
                      if (links.includes(match[0].slice(match[0].lastIndexOf('[') + 1, -1))) {
                          maskedSrc = maskedSrc.slice(0, match.index) + '[' + 'a'.repeat(match[0].length - 2) + ']' + maskedSrc.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex);
                      }
                  }
              }
          }
          // Mask out other blocks
          while ((match = this.tokenizer.rules.inline.blockSkip.exec(maskedSrc)) != null) {
              maskedSrc = maskedSrc.slice(0, match.index) + '[' + 'a'.repeat(match[0].length - 2) + ']' + maskedSrc.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
          }
          // Mask out escaped characters
          while ((match = this.tokenizer.rules.inline.anyPunctuation.exec(maskedSrc)) != null) {
              maskedSrc = maskedSrc.slice(0, match.index) + '++' + maskedSrc.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);
          }
          while (src) {
              if (!keepPrevChar) {
                  prevChar = '';
              }
              keepPrevChar = false;
              // extensions
              if (this.options.extensions
                  && this.options.extensions.inline
                  && this.options.extensions.inline.some((extTokenizer) => {
                      if (token = extTokenizer.call({ lexer: this }, src, tokens)) {
                          src = src.substring(token.raw.length);
                          tokens.push(token);
                          return true;
                      }
                      return false;
                  })) {
                  continue;
              }
              // escape
              if (token = this.tokenizer.escape(src)) {
                  src = src.substring(token.raw.length);
                  tokens.push(token);
                  continue;
              }
              // tag
              if (token = this.tokenizer.tag(src)) {
                  src = src.substring(token.raw.length);
                  lastToken = tokens[tokens.length - 1];
                  if (lastToken && token.type === 'text' && lastToken.type === 'text') {
                      lastToken.raw += token.raw;
                      lastToken.text += token.text;
                  }
                  else {
                      tokens.push(token);
                  }
                  continue;
              }
              // link
              if (token = this.tokenizer.link(src)) {
                  src = src.substring(token.raw.length);
                  tokens.push(token);
                  continue;
              }
              // reflink, nolink
              if (token = this.tokenizer.reflink(src, this.tokens.links)) {
                  src = src.substring(token.raw.length);
                  lastToken = tokens[tokens.length - 1];
                  if (lastToken && token.type === 'text' && lastToken.type === 'text') {
                      lastToken.raw += token.raw;
                      lastToken.text += token.text;
                  }
                  else {
                      tokens.push(token);
                  }
                  continue;
              }
              // em & strong
              if (token = this.tokenizer.emStrong(src, maskedSrc, prevChar)) {
                  src = src.substring(token.raw.length);
                  tokens.push(token);
                  continue;
              }
              // code
              if (token = this.tokenizer.codespan(src)) {
                  src = src.substring(token.raw.length);
                  tokens.push(token);
                  continue;
              }
              // br
              if (token = this.tokenizer.br(src)) {
                  src = src.substring(token.raw.length);
                  tokens.push(token);
                  continue;
              }
              // del (gfm)
              if (token = this.tokenizer.del(src)) {
                  src = src.substring(token.raw.length);
                  tokens.push(token);
                  continue;
              }
              // autolink
              if (token = this.tokenizer.autolink(src)) {
                  src = src.substring(token.raw.length);
                  tokens.push(token);
                  continue;
              }
              // url (gfm)
              if (!this.state.inLink && (token = this.tokenizer.url(src))) {
                  src = src.substring(token.raw.length);
                  tokens.push(token);
                  continue;
              }
              // text
              // prevent inlineText consuming extensions by clipping 'src' to extension start
              cutSrc = src;
              if (this.options.extensions && this.options.extensions.startInline) {
                  let startIndex = Infinity;
                  const tempSrc = src.slice(1);
                  let tempStart;
                  this.options.extensions.startInline.forEach((getStartIndex) => {
                      tempStart = getStartIndex.call({ lexer: this }, tempSrc);
                      if (typeof tempStart === 'number' && tempStart >= 0) {
                          startIndex = Math.min(startIndex, tempStart);
                      }
                  });
                  if (startIndex < Infinity && startIndex >= 0) {
                      cutSrc = src.substring(0, startIndex + 1);
                  }
              }
              if (token = this.tokenizer.inlineText(cutSrc)) {
                  src = src.substring(token.raw.length);
                  if (token.raw.slice(-1) !== '_') { // Track prevChar before string of ____ started
                      prevChar = token.raw.slice(-1);
                  }
                  keepPrevChar = true;
                  lastToken = tokens[tokens.length - 1];
                  if (lastToken && lastToken.type === 'text') {
                      lastToken.raw += token.raw;
                      lastToken.text += token.text;
                  }
                  else {
                      tokens.push(token);
                  }
                  continue;
              }
              if (src) {
                  const errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);
                  if (this.options.silent) {
                      console.error(errMsg);
                      break;
                  }
                  else {
                      throw new Error(errMsg);
                  }
              }
          }
          return tokens;
      }
  }

  /**
   * Renderer
   */
  class _Renderer {
      options;
      parser; // set by the parser
      constructor(options) {
          this.options = options || _defaults;
      }
      space(token) {
          return '';
      }
      code({ text, lang, escaped }) {
          const langString = (lang || '').match(/^\S*/)?.[0];
          const code = text.replace(/\n$/, '') + '\n';
          if (!langString) {
              return '<pre><code>'
                  + (escaped ? code : escape$1(code, true))
                  + '</code></pre>\n';
          }
          return '<pre><code class="language-'
              + escape$1(langString)
              + '">'
              + (escaped ? code : escape$1(code, true))
              + '</code></pre>\n';
      }
      blockquote({ tokens }) {
          const body = this.parser.parse(tokens);
          return `<blockquote>\n${body}</blockquote>\n`;
      }
      html({ text }) {
          return text;
      }
      heading({ tokens, depth }) {
          return `<h${depth}>${this.parser.parseInline(tokens)}</h${depth}>\n`;
      }
      hr(token) {
          return '<hr>\n';
      }
      list(token) {
          const ordered = token.ordered;
          const start = token.start;
          let body = '';
          for (let j = 0; j < token.items.length; j++) {
              const item = token.items[j];
              body += this.listitem(item);
          }
          const type = ordered ? 'ol' : 'ul';
          const startAttr = (ordered && start !== 1) ? (' start="' + start + '"') : '';
          return '<' + type + startAttr + '>\n' + body + '</' + type + '>\n';
      }
      listitem(item) {
          let itemBody = '';
          if (item.task) {
              const checkbox = this.checkbox({ checked: !!item.checked });
              if (item.loose) {
                  if (item.tokens.length > 0 && item.tokens[0].type === 'paragraph') {
                      item.tokens[0].text = checkbox + ' ' + item.tokens[0].text;
                      if (item.tokens[0].tokens && item.tokens[0].tokens.length > 0 && item.tokens[0].tokens[0].type === 'text') {
                          item.tokens[0].tokens[0].text = checkbox + ' ' + item.tokens[0].tokens[0].text;
                      }
                  }
                  else {
                      item.tokens.unshift({
                          type: 'text',
                          raw: checkbox + ' ',
                          text: checkbox + ' ',
                      });
                  }
              }
              else {
                  itemBody += checkbox + ' ';
              }
          }
          itemBody += this.parser.parse(item.tokens, !!item.loose);
          return `<li>${itemBody}</li>\n`;
      }
      checkbox({ checked }) {
          return '<input '
              + (checked ? 'checked="" ' : '')
              + 'disabled="" type="checkbox">';
      }
      paragraph({ tokens }) {
          return `<p>${this.parser.parseInline(tokens)}</p>\n`;
      }
      table(token) {
          let header = '';
          // header
          let cell = '';
          for (let j = 0; j < token.header.length; j++) {
              cell += this.tablecell(token.header[j]);
          }
          header += this.tablerow({ text: cell });
          let body = '';
          for (let j = 0; j < token.rows.length; j++) {
              const row = token.rows[j];
              cell = '';
              for (let k = 0; k < row.length; k++) {
                  cell += this.tablecell(row[k]);
              }
              body += this.tablerow({ text: cell });
          }
          if (body)
              body = `<tbody>${body}</tbody>`;
          return '<table>\n'
              + '<thead>\n'
              + header
              + '</thead>\n'
              + body
              + '</table>\n';
      }
      tablerow({ text }) {
          return `<tr>\n${text}</tr>\n`;
      }
      tablecell(token) {
          const content = this.parser.parseInline(token.tokens);
          const type = token.header ? 'th' : 'td';
          const tag = token.align
              ? `<${type} align="${token.align}">`
              : `<${type}>`;
          return tag + content + `</${type}>\n`;
      }
      /**
       * span level renderer
       */
      strong({ tokens }) {
          return `<strong>${this.parser.parseInline(tokens)}</strong>`;
      }
      em({ tokens }) {
          return `<em>${this.parser.parseInline(tokens)}</em>`;
      }
      codespan({ text }) {
          return `<code>${text}</code>`;
      }
      br(token) {
          return '<br>';
      }
      del({ tokens }) {
          return `<del>${this.parser.parseInline(tokens)}</del>`;
      }
      link({ href, title, tokens }) {
          const text = this.parser.parseInline(tokens);
          const cleanHref = cleanUrl(href);
          if (cleanHref === null) {
              return text;
          }
          href = cleanHref;
          let out = '<a href="' + href + '"';
          if (title) {
              out += ' title="' + title + '"';
          }
          out += '>' + text + '</a>';
          return out;
      }
      image({ href, title, text }) {
          const cleanHref = cleanUrl(href);
          if (cleanHref === null) {
              return text;
          }
          href = cleanHref;
          let out = `<img src="${href}" alt="${text}"`;
          if (title) {
              out += ` title="${title}"`;
          }
          out += '>';
          return out;
      }
      text(token) {
          return 'tokens' in token && token.tokens ? this.parser.parseInline(token.tokens) : token.text;
      }
  }

  /**
   * TextRenderer
   * returns only the textual part of the token
   */
  class _TextRenderer {
      // no need for block level renderers
      strong({ text }) {
          return text;
      }
      em({ text }) {
          return text;
      }
      codespan({ text }) {
          return text;
      }
      del({ text }) {
          return text;
      }
      html({ text }) {
          return text;
      }
      text({ text }) {
          return text;
      }
      link({ text }) {
          return '' + text;
      }
      image({ text }) {
          return '' + text;
      }
      br() {
          return '';
      }
  }

  /**
   * Parsing & Compiling
   */
  class _Parser {
      options;
      renderer;
      textRenderer;
      constructor(options) {
          this.options = options || _defaults;
          this.options.renderer = this.options.renderer || new _Renderer();
          this.renderer = this.options.renderer;
          this.renderer.options = this.options;
          this.renderer.parser = this;
          this.textRenderer = new _TextRenderer();
      }
      /**
       * Static Parse Method
       */
      static parse(tokens, options) {
          const parser = new _Parser(options);
          return parser.parse(tokens);
      }
      /**
       * Static Parse Inline Method
       */
      static parseInline(tokens, options) {
          const parser = new _Parser(options);
          return parser.parseInline(tokens);
      }
      /**
       * Parse Loop
       */
      parse(tokens, top = true) {
          let out = '';
          for (let i = 0; i < tokens.length; i++) {
              const anyToken = tokens[i];
              // Run any renderer extensions
              if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[anyToken.type]) {
                  const genericToken = anyToken;
                  const ret = this.options.extensions.renderers[genericToken.type].call({ parser: this }, genericToken);
                  if (ret !== false || !['space', 'hr', 'heading', 'code', 'table', 'blockquote', 'list', 'html', 'paragraph', 'text'].includes(genericToken.type)) {
                      out += ret || '';
                      continue;
                  }
              }
              const token = anyToken;
              switch (token.type) {
                  case 'space': {
                      out += this.renderer.space(token);
                      continue;
                  }
                  case 'hr': {
                      out += this.renderer.hr(token);
                      continue;
                  }
                  case 'heading': {
                      out += this.renderer.heading(token);
                      continue;
                  }
                  case 'code': {
                      out += this.renderer.code(token);
                      continue;
                  }
                  case 'table': {
                      out += this.renderer.table(token);
                      continue;
                  }
                  case 'blockquote': {
                      out += this.renderer.blockquote(token);
                      continue;
                  }
                  case 'list': {
                      out += this.renderer.list(token);
                      continue;
                  }
                  case 'html': {
                      out += this.renderer.html(token);
                      continue;
                  }
                  case 'paragraph': {
                      out += this.renderer.paragraph(token);
                      continue;
                  }
                  case 'text': {
                      let textToken = token;
                      let body = this.renderer.text(textToken);
                      while (i + 1 < tokens.length && tokens[i + 1].type === 'text') {
                          textToken = tokens[++i];
                          body += '\n' + this.renderer.text(textToken);
                      }
                      if (top) {
                          out += this.renderer.paragraph({
                              type: 'paragraph',
                              raw: body,
                              text: body,
                              tokens: [{ type: 'text', raw: body, text: body }],
                          });
                      }
                      else {
                          out += body;
                      }
                      continue;
                  }
                  default: {
                      const errMsg = 'Token with "' + token.type + '" type was not found.';
                      if (this.options.silent) {
                          console.error(errMsg);
                          return '';
                      }
                      else {
                          throw new Error(errMsg);
                      }
                  }
              }
          }
          return out;
      }
      /**
       * Parse Inline Tokens
       */
      parseInline(tokens, renderer) {
          renderer = renderer || this.renderer;
          let out = '';
          for (let i = 0; i < tokens.length; i++) {
              const anyToken = tokens[i];
              // Run any renderer extensions
              if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[anyToken.type]) {
                  const ret = this.options.extensions.renderers[anyToken.type].call({ parser: this }, anyToken);
                  if (ret !== false || !['escape', 'html', 'link', 'image', 'strong', 'em', 'codespan', 'br', 'del', 'text'].includes(anyToken.type)) {
                      out += ret || '';
                      continue;
                  }
              }
              const token = anyToken;
              switch (token.type) {
                  case 'escape': {
                      out += renderer.text(token);
                      break;
                  }
                  case 'html': {
                      out += renderer.html(token);
                      break;
                  }
                  case 'link': {
                      out += renderer.link(token);
                      break;
                  }
                  case 'image': {
                      out += renderer.image(token);
                      break;
                  }
                  case 'strong': {
                      out += renderer.strong(token);
                      break;
                  }
                  case 'em': {
                      out += renderer.em(token);
                      break;
                  }
                  case 'codespan': {
                      out += renderer.codespan(token);
                      break;
                  }
                  case 'br': {
                      out += renderer.br(token);
                      break;
                  }
                  case 'del': {
                      out += renderer.del(token);
                      break;
                  }
                  case 'text': {
                      out += renderer.text(token);
                      break;
                  }
                  default: {
                      const errMsg = 'Token with "' + token.type + '" type was not found.';
                      if (this.options.silent) {
                          console.error(errMsg);
                          return '';
                      }
                      else {
                          throw new Error(errMsg);
                      }
                  }
              }
          }
          return out;
      }
  }

  class _Hooks {
      options;
      block;
      constructor(options) {
          this.options = options || _defaults;
      }
      static passThroughHooks = new Set([
          'preprocess',
          'postprocess',
          'processAllTokens',
      ]);
      /**
       * Process markdown before marked
       */
      preprocess(markdown) {
          return markdown;
      }
      /**
       * Process HTML after marked is finished
       */
      postprocess(html) {
          return html;
      }
      /**
       * Process all tokens before walk tokens
       */
      processAllTokens(tokens) {
          return tokens;
      }
      /**
       * Provide function to tokenize markdown
       */
      provideLexer() {
          return this.block ? _Lexer.lex : _Lexer.lexInline;
      }
      /**
       * Provide function to parse tokens
       */
      provideParser() {
          return this.block ? _Parser.parse : _Parser.parseInline;
      }
  }

  class Marked {
      defaults = _getDefaults();
      options = this.setOptions;
      parse = this.parseMarkdown(true);
      parseInline = this.parseMarkdown(false);
      Parser = _Parser;
      Renderer = _Renderer;
      TextRenderer = _TextRenderer;
      Lexer = _Lexer;
      Tokenizer = _Tokenizer;
      Hooks = _Hooks;
      constructor(...args) {
          this.use(...args);
      }
      /**
       * Run callback for every token
       */
      walkTokens(tokens, callback) {
          let values = [];
          for (const token of tokens) {
              values = values.concat(callback.call(this, token));
              switch (token.type) {
                  case 'table': {
                      const tableToken = token;
                      for (const cell of tableToken.header) {
                          values = values.concat(this.walkTokens(cell.tokens, callback));
                      }
                      for (const row of tableToken.rows) {
                          for (const cell of row) {
                              values = values.concat(this.walkTokens(cell.tokens, callback));
                          }
                      }
                      break;
                  }
                  case 'list': {
                      const listToken = token;
                      values = values.concat(this.walkTokens(listToken.items, callback));
                      break;
                  }
                  default: {
                      const genericToken = token;
                      if (this.defaults.extensions?.childTokens?.[genericToken.type]) {
                          this.defaults.extensions.childTokens[genericToken.type].forEach((childTokens) => {
                              const tokens = genericToken[childTokens].flat(Infinity);
                              values = values.concat(this.walkTokens(tokens, callback));
                          });
                      }
                      else if (genericToken.tokens) {
                          values = values.concat(this.walkTokens(genericToken.tokens, callback));
                      }
                  }
              }
          }
          return values;
      }
      use(...args) {
          const extensions = this.defaults.extensions || { renderers: {}, childTokens: {} };
          args.forEach((pack) => {
              // copy options to new object
              const opts = { ...pack };
              // set async to true if it was set to true before
              opts.async = this.defaults.async || opts.async || false;
              // ==-- Parse "addon" extensions --== //
              if (pack.extensions) {
                  pack.extensions.forEach((ext) => {
                      if (!ext.name) {
                          throw new Error('extension name required');
                      }
                      if ('renderer' in ext) { // Renderer extensions
                          const prevRenderer = extensions.renderers[ext.name];
                          if (prevRenderer) {
                              // Replace extension with func to run new extension but fall back if false
                              extensions.renderers[ext.name] = function (...args) {
                                  let ret = ext.renderer.apply(this, args);
                                  if (ret === false) {
                                      ret = prevRenderer.apply(this, args);
                                  }
                                  return ret;
                              };
                          }
                          else {
                              extensions.renderers[ext.name] = ext.renderer;
                          }
                      }
                      if ('tokenizer' in ext) { // Tokenizer Extensions
                          if (!ext.level || (ext.level !== 'block' && ext.level !== 'inline')) {
                              throw new Error("extension level must be 'block' or 'inline'");
                          }
                          const extLevel = extensions[ext.level];
                          if (extLevel) {
                              extLevel.unshift(ext.tokenizer);
                          }
                          else {
                              extensions[ext.level] = [ext.tokenizer];
                          }
                          if (ext.start) { // Function to check for start of token
                              if (ext.level === 'block') {
                                  if (extensions.startBlock) {
                                      extensions.startBlock.push(ext.start);
                                  }
                                  else {
                                      extensions.startBlock = [ext.start];
                                  }
                              }
                              else if (ext.level === 'inline') {
                                  if (extensions.startInline) {
                                      extensions.startInline.push(ext.start);
                                  }
                                  else {
                                      extensions.startInline = [ext.start];
                                  }
                              }
                          }
                      }
                      if ('childTokens' in ext && ext.childTokens) { // Child tokens to be visited by walkTokens
                          extensions.childTokens[ext.name] = ext.childTokens;
                      }
                  });
                  opts.extensions = extensions;
              }
              // ==-- Parse "overwrite" extensions --== //
              if (pack.renderer) {
                  const renderer = this.defaults.renderer || new _Renderer(this.defaults);
                  for (const prop in pack.renderer) {
                      if (!(prop in renderer)) {
                          throw new Error(`renderer '${prop}' does not exist`);
                      }
                      if (['options', 'parser'].includes(prop)) {
                          // ignore options property
                          continue;
                      }
                      const rendererProp = prop;
                      const rendererFunc = pack.renderer[rendererProp];
                      const prevRenderer = renderer[rendererProp];
                      // Replace renderer with func to run extension, but fall back if false
                      renderer[rendererProp] = (...args) => {
                          let ret = rendererFunc.apply(renderer, args);
                          if (ret === false) {
                              ret = prevRenderer.apply(renderer, args);
                          }
                          return ret || '';
                      };
                  }
                  opts.renderer = renderer;
              }
              if (pack.tokenizer) {
                  const tokenizer = this.defaults.tokenizer || new _Tokenizer(this.defaults);
                  for (const prop in pack.tokenizer) {
                      if (!(prop in tokenizer)) {
                          throw new Error(`tokenizer '${prop}' does not exist`);
                      }
                      if (['options', 'rules', 'lexer'].includes(prop)) {
                          // ignore options, rules, and lexer properties
                          continue;
                      }
                      const tokenizerProp = prop;
                      const tokenizerFunc = pack.tokenizer[tokenizerProp];
                      const prevTokenizer = tokenizer[tokenizerProp];
                      // Replace tokenizer with func to run extension, but fall back if false
                      // @ts-expect-error cannot type tokenizer function dynamically
                      tokenizer[tokenizerProp] = (...args) => {
                          let ret = tokenizerFunc.apply(tokenizer, args);
                          if (ret === false) {
                              ret = prevTokenizer.apply(tokenizer, args);
                          }
                          return ret;
                      };
                  }
                  opts.tokenizer = tokenizer;
              }
              // ==-- Parse Hooks extensions --== //
              if (pack.hooks) {
                  const hooks = this.defaults.hooks || new _Hooks();
                  for (const prop in pack.hooks) {
                      if (!(prop in hooks)) {
                          throw new Error(`hook '${prop}' does not exist`);
                      }
                      if (['options', 'block'].includes(prop)) {
                          // ignore options and block properties
                          continue;
                      }
                      const hooksProp = prop;
                      const hooksFunc = pack.hooks[hooksProp];
                      const prevHook = hooks[hooksProp];
                      if (_Hooks.passThroughHooks.has(prop)) {
                          // @ts-expect-error cannot type hook function dynamically
                          hooks[hooksProp] = (arg) => {
                              if (this.defaults.async) {
                                  return Promise.resolve(hooksFunc.call(hooks, arg)).then(ret => {
                                      return prevHook.call(hooks, ret);
                                  });
                              }
                              const ret = hooksFunc.call(hooks, arg);
                              return prevHook.call(hooks, ret);
                          };
                      }
                      else {
                          // @ts-expect-error cannot type hook function dynamically
                          hooks[hooksProp] = (...args) => {
                              let ret = hooksFunc.apply(hooks, args);
                              if (ret === false) {
                                  ret = prevHook.apply(hooks, args);
                              }
                              return ret;
                          };
                      }
                  }
                  opts.hooks = hooks;
              }
              // ==-- Parse WalkTokens extensions --== //
              if (pack.walkTokens) {
                  const walkTokens = this.defaults.walkTokens;
                  const packWalktokens = pack.walkTokens;
                  opts.walkTokens = function (token) {
                      let values = [];
                      values.push(packWalktokens.call(this, token));
                      if (walkTokens) {
                          values = values.concat(walkTokens.call(this, token));
                      }
                      return values;
                  };
              }
              this.defaults = { ...this.defaults, ...opts };
          });
          return this;
      }
      setOptions(opt) {
          this.defaults = { ...this.defaults, ...opt };
          return this;
      }
      lexer(src, options) {
          return _Lexer.lex(src, options ?? this.defaults);
      }
      parser(tokens, options) {
          return _Parser.parse(tokens, options ?? this.defaults);
      }
      parseMarkdown(blockType) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const parse = (src, options) => {
              const origOpt = { ...options };
              const opt = { ...this.defaults, ...origOpt };
              const throwError = this.onError(!!opt.silent, !!opt.async);
              // throw error if an extension set async to true but parse was called with async: false
              if (this.defaults.async === true && origOpt.async === false) {
                  return throwError(new Error('marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise.'));
              }
              // throw error in case of non string input
              if (typeof src === 'undefined' || src === null) {
                  return throwError(new Error('marked(): input parameter is undefined or null'));
              }
              if (typeof src !== 'string') {
                  return throwError(new Error('marked(): input parameter is of type '
                      + Object.prototype.toString.call(src) + ', string expected'));
              }
              if (opt.hooks) {
                  opt.hooks.options = opt;
                  opt.hooks.block = blockType;
              }
              const lexer = opt.hooks ? opt.hooks.provideLexer() : (blockType ? _Lexer.lex : _Lexer.lexInline);
              const parser = opt.hooks ? opt.hooks.provideParser() : (blockType ? _Parser.parse : _Parser.parseInline);
              if (opt.async) {
                  return Promise.resolve(opt.hooks ? opt.hooks.preprocess(src) : src)
                      .then(src => lexer(src, opt))
                      .then(tokens => opt.hooks ? opt.hooks.processAllTokens(tokens) : tokens)
                      .then(tokens => opt.walkTokens ? Promise.all(this.walkTokens(tokens, opt.walkTokens)).then(() => tokens) : tokens)
                      .then(tokens => parser(tokens, opt))
                      .then(html => opt.hooks ? opt.hooks.postprocess(html) : html)
                      .catch(throwError);
              }
              try {
                  if (opt.hooks) {
                      src = opt.hooks.preprocess(src);
                  }
                  let tokens = lexer(src, opt);
                  if (opt.hooks) {
                      tokens = opt.hooks.processAllTokens(tokens);
                  }
                  if (opt.walkTokens) {
                      this.walkTokens(tokens, opt.walkTokens);
                  }
                  let html = parser(tokens, opt);
                  if (opt.hooks) {
                      html = opt.hooks.postprocess(html);
                  }
                  return html;
              }
              catch (e) {
                  return throwError(e);
              }
          };
          return parse;
      }
      onError(silent, async) {
          return (e) => {
              e.message += '\nPlease report this to https://github.com/markedjs/marked.';
              if (silent) {
                  const msg = '<p>An error occurred:</p><pre>'
                      + escape$1(e.message + '', true)
                      + '</pre>';
                  if (async) {
                      return Promise.resolve(msg);
                  }
                  return msg;
              }
              if (async) {
                  return Promise.reject(e);
              }
              throw e;
          };
      }
  }

  const markedInstance = new Marked();
  function marked(src, opt) {
      return markedInstance.parse(src, opt);
  }
  /**
   * Sets the default options.
   *
   * @param options Hash of options
   */
  marked.options =
      marked.setOptions = function (options) {
          markedInstance.setOptions(options);
          marked.defaults = markedInstance.defaults;
          changeDefaults(marked.defaults);
          return marked;
      };
  /**
   * Gets the original marked default options.
   */
  marked.getDefaults = _getDefaults;
  marked.defaults = _defaults;
  /**
   * Use Extension
   */
  marked.use = function (...args) {
      markedInstance.use(...args);
      marked.defaults = markedInstance.defaults;
      changeDefaults(marked.defaults);
      return marked;
  };
  /**
   * Run callback for every token
   */
  marked.walkTokens = function (tokens, callback) {
      return markedInstance.walkTokens(tokens, callback);
  };
  /**
   * Compiles markdown to HTML without enclosing `p` tag.
   *
   * @param src String of markdown source to be compiled
   * @param options Hash of options
   * @return String of compiled HTML
   */
  marked.parseInline = markedInstance.parseInline;
  /**
   * Expose
   */
  marked.Parser = _Parser;
  marked.parser = _Parser.parse;
  marked.Renderer = _Renderer;
  marked.TextRenderer = _TextRenderer;
  marked.Lexer = _Lexer;
  marked.lexer = _Lexer.lex;
  marked.Tokenizer = _Tokenizer;
  marked.Hooks = _Hooks;
  marked.parse = marked;
  marked.options;
  marked.setOptions;
  marked.use;
  marked.walkTokens;
  marked.parseInline;
  _Parser.parse;
  _Lexer.lex;

  // The underlying model has a context of 1,024 tokens, out of which 26 are used by the internal prompt,
  // leaving about 998 tokens for the input text. Each token corresponds, roughly, to about 4 characters, so 4,000
  // is used as a limit to warn the user the content might be too long to summarize.
  const MAX_MODEL_CHARS = 4000;

  let pageContent = '';

  const summaryElement = document.body.querySelector('#summary');
  const warningElement = document.body.querySelector('#warning');
  const summaryTypeSelect = document.querySelector('#type');
  const summaryFormatSelect = document.querySelector('#format');
  const summaryLengthSelect = document.querySelector('#length');

  function onConfigChange() {
    const oldContent = pageContent;
    pageContent = '';
    onContentChange(oldContent);
  }

  [summaryTypeSelect, summaryFormatSelect, summaryLengthSelect].forEach((e) =>
    e.addEventListener('change', onConfigChange)
  );

  chrome.storage.session.get('pageContent', ({ pageContent }) => {
    onContentChange(pageContent);
  });

  chrome.storage.session.onChanged.addListener((changes) => {
    const pageContent = changes['pageContent'];
    onContentChange(pageContent.newValue);
  });

  async function onContentChange(newContent) {
    if (pageContent == newContent) {
      // no new content, do nothing
      return;
    }
    pageContent = newContent;
    let summary;
    if (newContent) {
      if (newContent.length > MAX_MODEL_CHARS) {
        updateWarning(
          `Text is too long for summarization with ${newContent.length} characters (maximum supported content length is ~4000 characters).`
        );
      } else {
        updateWarning('');
      }
      showSummary('Loading...');
      summary = await generateSummary(newContent);
    } else {
      summary = "There's nothing to summarize";
    }
    showSummary(summary);
  }

  async function generateSummary(text) {
    try {
      const session = await createSummarizer(
        {
          type: summaryTypeSelect.value,
          format: summaryFormatSelect.value,
          length: length.value
        },
        (message, progress) => {
          console.log(`${message} (${progress.loaded}/${progress.total})`);
        }
      );
      const summary = await session.summarize(text);
      session.destroy();
      return summary;
    } catch (e) {
      console.log('Summary generation failed');
      console.error(e);
      return 'Error: ' + e.message;
    }
  }

  async function createSummarizer(config, downloadProgressCallback) {
    if (!window.ai || !window.ai.summarizer) {
      throw new Error('AI Summarization is not supported in this browser');
    }
    const canSummarize = await window.ai.summarizer.capabilities();
    if (canSummarize.available === 'no') {
      throw new Error('AI Summarization is not supported');
    }
    const summarizationSession = await self.ai.summarizer.create(
      config,
      downloadProgressCallback
    );
    if (canSummarize.available === 'after-download') {
      summarizationSession.addEventListener(
        'downloadprogress',
        downloadProgressCallback
      );
      await summarizationSession.ready;
    }
    return summarizationSession;
  }

  async function showSummary(text) {
    summaryElement.innerHTML = purify.sanitize(marked.parse(text));
  }

  async function updateWarning(warning) {
    warningElement.textContent = warning;
    if (warning) {
      warningElement.removeAttribute('hidden');
    } else {
      warningElement.setAttribute('hidden', '');
    }
  }

})();

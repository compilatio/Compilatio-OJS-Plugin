(function(vue) {
  "use strict";
  /*!
    * shared v9.14.5
    * (c) 2025 kazuya kawaguchi
    * Released under the MIT License.
    */
  function warn(msg, err) {
    if (typeof console !== "undefined") {
      console.warn(`[intlify] ` + msg);
      if (err) {
        console.warn(err.stack);
      }
    }
  }
  const inBrowser = typeof window !== "undefined";
  const makeSymbol = (name, shareable = false) => !shareable ? Symbol(name) : Symbol.for(name);
  const generateFormatCacheKey = (locale, key, source) => friendlyJSONstringify({ l: locale, k: key, s: source });
  const friendlyJSONstringify = (json) => JSON.stringify(json).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029").replace(/\u0027/g, "\\u0027");
  const isNumber = (val) => typeof val === "number" && isFinite(val);
  const isDate = (val) => toTypeString(val) === "[object Date]";
  const isRegExp = (val) => toTypeString(val) === "[object RegExp]";
  const isEmptyObject = (val) => isPlainObject(val) && Object.keys(val).length === 0;
  const assign$1 = Object.assign;
  const _create = Object.create;
  const create = (obj = null) => _create(obj);
  let _globalThis;
  const getGlobalThis = () => {
    return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : create());
  };
  function escapeHtml(rawText) {
    return rawText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/\//g, "&#x2F;").replace(/=/g, "&#x3D;");
  }
  function escapeAttributeValue(value) {
    return value.replace(/&(?![a-zA-Z0-9#]{2,6};)/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function sanitizeTranslatedHtml(html) {
    html = html.replace(/(\w+)\s*=\s*"([^"]*)"/g, (_, attrName, attrValue) => `${attrName}="${escapeAttributeValue(attrValue)}"`);
    html = html.replace(/(\w+)\s*=\s*'([^']*)'/g, (_, attrName, attrValue) => `${attrName}='${escapeAttributeValue(attrValue)}'`);
    const eventHandlerPattern = /\s*on\w+\s*=\s*["']?[^"'>]+["']?/gi;
    if (eventHandlerPattern.test(html)) {
      html = html.replace(/(\s+)(on)(\w+\s*=)/gi, "$1&#111;n$3");
    }
    const javascriptUrlPattern = [
      // In href, src, action, formaction attributes
      /(\s+(?:href|src|action|formaction)\s*=\s*["']?)\s*javascript:/gi,
      // In style attributes within url()
      /(style\s*=\s*["'][^"']*url\s*\(\s*)javascript:/gi
    ];
    javascriptUrlPattern.forEach((pattern) => {
      html = html.replace(pattern, "$1javascript&#58;");
    });
    return html;
  }
  const hasOwnProperty = Object.prototype.hasOwnProperty;
  function hasOwn(obj, key) {
    return hasOwnProperty.call(obj, key);
  }
  const isArray = Array.isArray;
  const isFunction = (val) => typeof val === "function";
  const isString$1 = (val) => typeof val === "string";
  const isBoolean = (val) => typeof val === "boolean";
  const isObject$1 = (val) => val !== null && typeof val === "object";
  const isPromise = (val) => {
    return isObject$1(val) && isFunction(val.then) && isFunction(val.catch);
  };
  const objectToString = Object.prototype.toString;
  const toTypeString = (value) => objectToString.call(value);
  const isPlainObject = (val) => {
    if (!isObject$1(val))
      return false;
    const proto = Object.getPrototypeOf(val);
    return proto === null || proto.constructor === Object;
  };
  const toDisplayString = (val) => {
    return val == null ? "" : isArray(val) || isPlainObject(val) && val.toString === objectToString ? JSON.stringify(val, null, 2) : String(val);
  };
  function join$1(items, separator = "") {
    return items.reduce((str, item, index) => index === 0 ? str + item : str + separator + item, "");
  }
  function incrementer(code2) {
    let current = code2;
    return () => ++current;
  }
  const isNotObjectOrIsArray = (val) => !isObject$1(val) || isArray(val);
  function deepCopy(src, des) {
    if (isNotObjectOrIsArray(src) || isNotObjectOrIsArray(des)) {
      throw new Error("Invalid value");
    }
    const stack = [{ src, des }];
    while (stack.length) {
      const { src: src2, des: des2 } = stack.pop();
      Object.keys(src2).forEach((key) => {
        if (key === "__proto__") {
          return;
        }
        if (isObject$1(src2[key]) && !isObject$1(des2[key])) {
          des2[key] = Array.isArray(src2[key]) ? [] : create();
        }
        if (isNotObjectOrIsArray(des2[key]) || isNotObjectOrIsArray(src2[key])) {
          des2[key] = src2[key];
        } else {
          stack.push({ src: src2[key], des: des2[key] });
        }
      });
    }
  }
  /*!
    * message-compiler v9.14.5
    * (c) 2025 kazuya kawaguchi
    * Released under the MIT License.
    */
  function createPosition(line, column, offset) {
    return { line, column, offset };
  }
  function createLocation(start, end2, source) {
    const loc = { start, end: end2 };
    return loc;
  }
  const RE_ARGS = /\{([0-9a-zA-Z]+)\}/g;
  function format$1(message, ...args) {
    if (args.length === 1 && isObject(args[0])) {
      args = args[0];
    }
    if (!args || !args.hasOwnProperty) {
      args = {};
    }
    return message.replace(RE_ARGS, (match, identifier) => {
      return args.hasOwnProperty(identifier) ? args[identifier] : "";
    });
  }
  const assign = Object.assign;
  const isString = (val) => typeof val === "string";
  const isObject = (val) => val !== null && typeof val === "object";
  function join(items, separator = "") {
    return items.reduce((str, item, index) => index === 0 ? str + item : str + separator + item, "");
  }
  const CompileWarnCodes = {
    USE_MODULO_SYNTAX: 1,
    __EXTEND_POINT__: 2
  };
  const warnMessages = {
    [CompileWarnCodes.USE_MODULO_SYNTAX]: `Use modulo before '{{0}}'.`
  };
  function createCompileWarn(code2, loc, ...args) {
    const msg = format$1(warnMessages[code2], ...args || []);
    const message = { message: String(msg), code: code2 };
    if (loc) {
      message.location = loc;
    }
    return message;
  }
  const CompileErrorCodes = {
    // tokenizer error codes
    EXPECTED_TOKEN: 1,
    INVALID_TOKEN_IN_PLACEHOLDER: 2,
    UNTERMINATED_SINGLE_QUOTE_IN_PLACEHOLDER: 3,
    UNKNOWN_ESCAPE_SEQUENCE: 4,
    INVALID_UNICODE_ESCAPE_SEQUENCE: 5,
    UNBALANCED_CLOSING_BRACE: 6,
    UNTERMINATED_CLOSING_BRACE: 7,
    EMPTY_PLACEHOLDER: 8,
    NOT_ALLOW_NEST_PLACEHOLDER: 9,
    INVALID_LINKED_FORMAT: 10,
    // parser error codes
    MUST_HAVE_MESSAGES_IN_PLURAL: 11,
    UNEXPECTED_EMPTY_LINKED_MODIFIER: 12,
    UNEXPECTED_EMPTY_LINKED_KEY: 13,
    UNEXPECTED_LEXICAL_ANALYSIS: 14,
    // generator error codes
    UNHANDLED_CODEGEN_NODE_TYPE: 15,
    // minifier error codes
    UNHANDLED_MINIFIER_NODE_TYPE: 16,
    // Special value for higher-order compilers to pick up the last code
    // to avoid collision of error codes. This should always be kept as the last
    // item.
    __EXTEND_POINT__: 17
  };
  const errorMessages = {
    // tokenizer error messages
    [CompileErrorCodes.EXPECTED_TOKEN]: `Expected token: '{0}'`,
    [CompileErrorCodes.INVALID_TOKEN_IN_PLACEHOLDER]: `Invalid token in placeholder: '{0}'`,
    [CompileErrorCodes.UNTERMINATED_SINGLE_QUOTE_IN_PLACEHOLDER]: `Unterminated single quote in placeholder`,
    [CompileErrorCodes.UNKNOWN_ESCAPE_SEQUENCE]: `Unknown escape sequence: \\{0}`,
    [CompileErrorCodes.INVALID_UNICODE_ESCAPE_SEQUENCE]: `Invalid unicode escape sequence: {0}`,
    [CompileErrorCodes.UNBALANCED_CLOSING_BRACE]: `Unbalanced closing brace`,
    [CompileErrorCodes.UNTERMINATED_CLOSING_BRACE]: `Unterminated closing brace`,
    [CompileErrorCodes.EMPTY_PLACEHOLDER]: `Empty placeholder`,
    [CompileErrorCodes.NOT_ALLOW_NEST_PLACEHOLDER]: `Not allowed nest placeholder`,
    [CompileErrorCodes.INVALID_LINKED_FORMAT]: `Invalid linked format`,
    // parser error messages
    [CompileErrorCodes.MUST_HAVE_MESSAGES_IN_PLURAL]: `Plural must have messages`,
    [CompileErrorCodes.UNEXPECTED_EMPTY_LINKED_MODIFIER]: `Unexpected empty linked modifier`,
    [CompileErrorCodes.UNEXPECTED_EMPTY_LINKED_KEY]: `Unexpected empty linked key`,
    [CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS]: `Unexpected lexical analysis in token: '{0}'`,
    // generator error messages
    [CompileErrorCodes.UNHANDLED_CODEGEN_NODE_TYPE]: `unhandled codegen node type: '{0}'`,
    // minimizer error messages
    [CompileErrorCodes.UNHANDLED_MINIFIER_NODE_TYPE]: `unhandled mimifier node type: '{0}'`
  };
  function createCompileError(code2, loc, options = {}) {
    const { domain, messages, args } = options;
    const msg = format$1((messages || errorMessages)[code2] || "", ...args || []);
    const error = new SyntaxError(String(msg));
    error.code = code2;
    if (loc) {
      error.location = loc;
    }
    error.domain = domain;
    return error;
  }
  function defaultOnError(error) {
    throw error;
  }
  const CHAR_SP = " ";
  const CHAR_CR = "\r";
  const CHAR_LF = "\n";
  const CHAR_LS = String.fromCharCode(8232);
  const CHAR_PS = String.fromCharCode(8233);
  function createScanner(str) {
    const _buf = str;
    let _index = 0;
    let _line = 1;
    let _column = 1;
    let _peekOffset = 0;
    const isCRLF = (index2) => _buf[index2] === CHAR_CR && _buf[index2 + 1] === CHAR_LF;
    const isLF = (index2) => _buf[index2] === CHAR_LF;
    const isPS = (index2) => _buf[index2] === CHAR_PS;
    const isLS = (index2) => _buf[index2] === CHAR_LS;
    const isLineEnd = (index2) => isCRLF(index2) || isLF(index2) || isPS(index2) || isLS(index2);
    const index = () => _index;
    const line = () => _line;
    const column = () => _column;
    const peekOffset = () => _peekOffset;
    const charAt = (offset) => isCRLF(offset) || isPS(offset) || isLS(offset) ? CHAR_LF : _buf[offset];
    const currentChar = () => charAt(_index);
    const currentPeek = () => charAt(_index + _peekOffset);
    function next() {
      _peekOffset = 0;
      if (isLineEnd(_index)) {
        _line++;
        _column = 0;
      }
      if (isCRLF(_index)) {
        _index++;
      }
      _index++;
      _column++;
      return _buf[_index];
    }
    function peek() {
      if (isCRLF(_index + _peekOffset)) {
        _peekOffset++;
      }
      _peekOffset++;
      return _buf[_index + _peekOffset];
    }
    function reset() {
      _index = 0;
      _line = 1;
      _column = 1;
      _peekOffset = 0;
    }
    function resetPeek(offset = 0) {
      _peekOffset = offset;
    }
    function skipToPeek() {
      const target = _index + _peekOffset;
      while (target !== _index) {
        next();
      }
      _peekOffset = 0;
    }
    return {
      index,
      line,
      column,
      peekOffset,
      charAt,
      currentChar,
      currentPeek,
      next,
      peek,
      reset,
      resetPeek,
      skipToPeek
    };
  }
  const EOF = void 0;
  const DOT = ".";
  const LITERAL_DELIMITER = "'";
  const ERROR_DOMAIN$3 = "tokenizer";
  function createTokenizer(source, options = {}) {
    const location = options.location !== false;
    const _scnr = createScanner(source);
    const currentOffset = () => _scnr.index();
    const currentPosition = () => createPosition(_scnr.line(), _scnr.column(), _scnr.index());
    const _initLoc = currentPosition();
    const _initOffset = currentOffset();
    const _context = {
      currentType: 14,
      offset: _initOffset,
      startLoc: _initLoc,
      endLoc: _initLoc,
      lastType: 14,
      lastOffset: _initOffset,
      lastStartLoc: _initLoc,
      lastEndLoc: _initLoc,
      braceNest: 0,
      inLinked: false,
      text: ""
    };
    const context = () => _context;
    const { onError } = options;
    function emitError(code2, pos, offset, ...args) {
      const ctx = context();
      pos.column += offset;
      pos.offset += offset;
      if (onError) {
        const loc = location ? createLocation(ctx.startLoc, pos) : null;
        const err = createCompileError(code2, loc, {
          domain: ERROR_DOMAIN$3,
          args
        });
        onError(err);
      }
    }
    function getToken(context2, type, value) {
      context2.endLoc = currentPosition();
      context2.currentType = type;
      const token = { type };
      if (location) {
        token.loc = createLocation(context2.startLoc, context2.endLoc);
      }
      if (value != null) {
        token.value = value;
      }
      return token;
    }
    const getEndToken = (context2) => getToken(
      context2,
      14
      /* TokenTypes.EOF */
    );
    function eat(scnr, ch) {
      if (scnr.currentChar() === ch) {
        scnr.next();
        return ch;
      } else {
        emitError(CompileErrorCodes.EXPECTED_TOKEN, currentPosition(), 0, ch);
        return "";
      }
    }
    function peekSpaces(scnr) {
      let buf = "";
      while (scnr.currentPeek() === CHAR_SP || scnr.currentPeek() === CHAR_LF) {
        buf += scnr.currentPeek();
        scnr.peek();
      }
      return buf;
    }
    function skipSpaces(scnr) {
      const buf = peekSpaces(scnr);
      scnr.skipToPeek();
      return buf;
    }
    function isIdentifierStart(ch) {
      if (ch === EOF) {
        return false;
      }
      const cc = ch.charCodeAt(0);
      return cc >= 97 && cc <= 122 || // a-z
      cc >= 65 && cc <= 90 || // A-Z
      cc === 95;
    }
    function isNumberStart(ch) {
      if (ch === EOF) {
        return false;
      }
      const cc = ch.charCodeAt(0);
      return cc >= 48 && cc <= 57;
    }
    function isNamedIdentifierStart(scnr, context2) {
      const { currentType } = context2;
      if (currentType !== 2) {
        return false;
      }
      peekSpaces(scnr);
      const ret = isIdentifierStart(scnr.currentPeek());
      scnr.resetPeek();
      return ret;
    }
    function isListIdentifierStart(scnr, context2) {
      const { currentType } = context2;
      if (currentType !== 2) {
        return false;
      }
      peekSpaces(scnr);
      const ch = scnr.currentPeek() === "-" ? scnr.peek() : scnr.currentPeek();
      const ret = isNumberStart(ch);
      scnr.resetPeek();
      return ret;
    }
    function isLiteralStart(scnr, context2) {
      const { currentType } = context2;
      if (currentType !== 2) {
        return false;
      }
      peekSpaces(scnr);
      const ret = scnr.currentPeek() === LITERAL_DELIMITER;
      scnr.resetPeek();
      return ret;
    }
    function isLinkedDotStart(scnr, context2) {
      const { currentType } = context2;
      if (currentType !== 8) {
        return false;
      }
      peekSpaces(scnr);
      const ret = scnr.currentPeek() === ".";
      scnr.resetPeek();
      return ret;
    }
    function isLinkedModifierStart(scnr, context2) {
      const { currentType } = context2;
      if (currentType !== 9) {
        return false;
      }
      peekSpaces(scnr);
      const ret = isIdentifierStart(scnr.currentPeek());
      scnr.resetPeek();
      return ret;
    }
    function isLinkedDelimiterStart(scnr, context2) {
      const { currentType } = context2;
      if (!(currentType === 8 || currentType === 12)) {
        return false;
      }
      peekSpaces(scnr);
      const ret = scnr.currentPeek() === ":";
      scnr.resetPeek();
      return ret;
    }
    function isLinkedReferStart(scnr, context2) {
      const { currentType } = context2;
      if (currentType !== 10) {
        return false;
      }
      const fn = () => {
        const ch = scnr.currentPeek();
        if (ch === "{") {
          return isIdentifierStart(scnr.peek());
        } else if (ch === "@" || ch === "%" || ch === "|" || ch === ":" || ch === "." || ch === CHAR_SP || !ch) {
          return false;
        } else if (ch === CHAR_LF) {
          scnr.peek();
          return fn();
        } else {
          return isTextStart(scnr, false);
        }
      };
      const ret = fn();
      scnr.resetPeek();
      return ret;
    }
    function isPluralStart(scnr) {
      peekSpaces(scnr);
      const ret = scnr.currentPeek() === "|";
      scnr.resetPeek();
      return ret;
    }
    function detectModuloStart(scnr) {
      const spaces = peekSpaces(scnr);
      const ret = scnr.currentPeek() === "%" && scnr.peek() === "{";
      scnr.resetPeek();
      return {
        isModulo: ret,
        hasSpace: spaces.length > 0
      };
    }
    function isTextStart(scnr, reset = true) {
      const fn = (hasSpace = false, prev = "", detectModulo = false) => {
        const ch = scnr.currentPeek();
        if (ch === "{") {
          return prev === "%" ? false : hasSpace;
        } else if (ch === "@" || !ch) {
          return prev === "%" ? true : hasSpace;
        } else if (ch === "%") {
          scnr.peek();
          return fn(hasSpace, "%", true);
        } else if (ch === "|") {
          return prev === "%" || detectModulo ? true : !(prev === CHAR_SP || prev === CHAR_LF);
        } else if (ch === CHAR_SP) {
          scnr.peek();
          return fn(true, CHAR_SP, detectModulo);
        } else if (ch === CHAR_LF) {
          scnr.peek();
          return fn(true, CHAR_LF, detectModulo);
        } else {
          return true;
        }
      };
      const ret = fn();
      reset && scnr.resetPeek();
      return ret;
    }
    function takeChar(scnr, fn) {
      const ch = scnr.currentChar();
      if (ch === EOF) {
        return EOF;
      }
      if (fn(ch)) {
        scnr.next();
        return ch;
      }
      return null;
    }
    function isIdentifier(ch) {
      const cc = ch.charCodeAt(0);
      return cc >= 97 && cc <= 122 || // a-z
      cc >= 65 && cc <= 90 || // A-Z
      cc >= 48 && cc <= 57 || // 0-9
      cc === 95 || // _
      cc === 36;
    }
    function takeIdentifierChar(scnr) {
      return takeChar(scnr, isIdentifier);
    }
    function isNamedIdentifier(ch) {
      const cc = ch.charCodeAt(0);
      return cc >= 97 && cc <= 122 || // a-z
      cc >= 65 && cc <= 90 || // A-Z
      cc >= 48 && cc <= 57 || // 0-9
      cc === 95 || // _
      cc === 36 || // $
      cc === 45;
    }
    function takeNamedIdentifierChar(scnr) {
      return takeChar(scnr, isNamedIdentifier);
    }
    function isDigit(ch) {
      const cc = ch.charCodeAt(0);
      return cc >= 48 && cc <= 57;
    }
    function takeDigit(scnr) {
      return takeChar(scnr, isDigit);
    }
    function isHexDigit(ch) {
      const cc = ch.charCodeAt(0);
      return cc >= 48 && cc <= 57 || // 0-9
      cc >= 65 && cc <= 70 || // A-F
      cc >= 97 && cc <= 102;
    }
    function takeHexDigit(scnr) {
      return takeChar(scnr, isHexDigit);
    }
    function getDigits(scnr) {
      let ch = "";
      let num = "";
      while (ch = takeDigit(scnr)) {
        num += ch;
      }
      return num;
    }
    function readModulo(scnr) {
      skipSpaces(scnr);
      const ch = scnr.currentChar();
      if (ch !== "%") {
        emitError(CompileErrorCodes.EXPECTED_TOKEN, currentPosition(), 0, ch);
      }
      scnr.next();
      return "%";
    }
    function readText(scnr) {
      let buf = "";
      while (true) {
        const ch = scnr.currentChar();
        if (ch === "{" || ch === "}" || ch === "@" || ch === "|" || !ch) {
          break;
        } else if (ch === "%") {
          if (isTextStart(scnr)) {
            buf += ch;
            scnr.next();
          } else {
            break;
          }
        } else if (ch === CHAR_SP || ch === CHAR_LF) {
          if (isTextStart(scnr)) {
            buf += ch;
            scnr.next();
          } else if (isPluralStart(scnr)) {
            break;
          } else {
            buf += ch;
            scnr.next();
          }
        } else {
          buf += ch;
          scnr.next();
        }
      }
      return buf;
    }
    function readNamedIdentifier(scnr) {
      skipSpaces(scnr);
      let ch = "";
      let name = "";
      while (ch = takeNamedIdentifierChar(scnr)) {
        name += ch;
      }
      if (scnr.currentChar() === EOF) {
        emitError(CompileErrorCodes.UNTERMINATED_CLOSING_BRACE, currentPosition(), 0);
      }
      return name;
    }
    function readListIdentifier(scnr) {
      skipSpaces(scnr);
      let value = "";
      if (scnr.currentChar() === "-") {
        scnr.next();
        value += `-${getDigits(scnr)}`;
      } else {
        value += getDigits(scnr);
      }
      if (scnr.currentChar() === EOF) {
        emitError(CompileErrorCodes.UNTERMINATED_CLOSING_BRACE, currentPosition(), 0);
      }
      return value;
    }
    function isLiteral2(ch) {
      return ch !== LITERAL_DELIMITER && ch !== CHAR_LF;
    }
    function readLiteral(scnr) {
      skipSpaces(scnr);
      eat(scnr, `'`);
      let ch = "";
      let literal = "";
      while (ch = takeChar(scnr, isLiteral2)) {
        if (ch === "\\") {
          literal += readEscapeSequence(scnr);
        } else {
          literal += ch;
        }
      }
      const current = scnr.currentChar();
      if (current === CHAR_LF || current === EOF) {
        emitError(CompileErrorCodes.UNTERMINATED_SINGLE_QUOTE_IN_PLACEHOLDER, currentPosition(), 0);
        if (current === CHAR_LF) {
          scnr.next();
          eat(scnr, `'`);
        }
        return literal;
      }
      eat(scnr, `'`);
      return literal;
    }
    function readEscapeSequence(scnr) {
      const ch = scnr.currentChar();
      switch (ch) {
        case "\\":
        case `'`:
          scnr.next();
          return `\\${ch}`;
        case "u":
          return readUnicodeEscapeSequence(scnr, ch, 4);
        case "U":
          return readUnicodeEscapeSequence(scnr, ch, 6);
        default:
          emitError(CompileErrorCodes.UNKNOWN_ESCAPE_SEQUENCE, currentPosition(), 0, ch);
          return "";
      }
    }
    function readUnicodeEscapeSequence(scnr, unicode, digits) {
      eat(scnr, unicode);
      let sequence = "";
      for (let i = 0; i < digits; i++) {
        const ch = takeHexDigit(scnr);
        if (!ch) {
          emitError(CompileErrorCodes.INVALID_UNICODE_ESCAPE_SEQUENCE, currentPosition(), 0, `\\${unicode}${sequence}${scnr.currentChar()}`);
          break;
        }
        sequence += ch;
      }
      return `\\${unicode}${sequence}`;
    }
    function isInvalidIdentifier(ch) {
      return ch !== "{" && ch !== "}" && ch !== CHAR_SP && ch !== CHAR_LF;
    }
    function readInvalidIdentifier(scnr) {
      skipSpaces(scnr);
      let ch = "";
      let identifiers = "";
      while (ch = takeChar(scnr, isInvalidIdentifier)) {
        identifiers += ch;
      }
      return identifiers;
    }
    function readLinkedModifier(scnr) {
      let ch = "";
      let name = "";
      while (ch = takeIdentifierChar(scnr)) {
        name += ch;
      }
      return name;
    }
    function readLinkedRefer(scnr) {
      const fn = (buf) => {
        const ch = scnr.currentChar();
        if (ch === "{" || ch === "%" || ch === "@" || ch === "|" || ch === "(" || ch === ")" || !ch) {
          return buf;
        } else if (ch === CHAR_SP) {
          return buf;
        } else if (ch === CHAR_LF || ch === DOT) {
          buf += ch;
          scnr.next();
          return fn(buf);
        } else {
          buf += ch;
          scnr.next();
          return fn(buf);
        }
      };
      return fn("");
    }
    function readPlural(scnr) {
      skipSpaces(scnr);
      const plural = eat(
        scnr,
        "|"
        /* TokenChars.Pipe */
      );
      skipSpaces(scnr);
      return plural;
    }
    function readTokenInPlaceholder(scnr, context2) {
      let token = null;
      const ch = scnr.currentChar();
      switch (ch) {
        case "{":
          if (context2.braceNest >= 1) {
            emitError(CompileErrorCodes.NOT_ALLOW_NEST_PLACEHOLDER, currentPosition(), 0);
          }
          scnr.next();
          token = getToken(
            context2,
            2,
            "{"
            /* TokenChars.BraceLeft */
          );
          skipSpaces(scnr);
          context2.braceNest++;
          return token;
        case "}":
          if (context2.braceNest > 0 && context2.currentType === 2) {
            emitError(CompileErrorCodes.EMPTY_PLACEHOLDER, currentPosition(), 0);
          }
          scnr.next();
          token = getToken(
            context2,
            3,
            "}"
            /* TokenChars.BraceRight */
          );
          context2.braceNest--;
          context2.braceNest > 0 && skipSpaces(scnr);
          if (context2.inLinked && context2.braceNest === 0) {
            context2.inLinked = false;
          }
          return token;
        case "@":
          if (context2.braceNest > 0) {
            emitError(CompileErrorCodes.UNTERMINATED_CLOSING_BRACE, currentPosition(), 0);
          }
          token = readTokenInLinked(scnr, context2) || getEndToken(context2);
          context2.braceNest = 0;
          return token;
        default: {
          let validNamedIdentifier = true;
          let validListIdentifier = true;
          let validLiteral = true;
          if (isPluralStart(scnr)) {
            if (context2.braceNest > 0) {
              emitError(CompileErrorCodes.UNTERMINATED_CLOSING_BRACE, currentPosition(), 0);
            }
            token = getToken(context2, 1, readPlural(scnr));
            context2.braceNest = 0;
            context2.inLinked = false;
            return token;
          }
          if (context2.braceNest > 0 && (context2.currentType === 5 || context2.currentType === 6 || context2.currentType === 7)) {
            emitError(CompileErrorCodes.UNTERMINATED_CLOSING_BRACE, currentPosition(), 0);
            context2.braceNest = 0;
            return readToken(scnr, context2);
          }
          if (validNamedIdentifier = isNamedIdentifierStart(scnr, context2)) {
            token = getToken(context2, 5, readNamedIdentifier(scnr));
            skipSpaces(scnr);
            return token;
          }
          if (validListIdentifier = isListIdentifierStart(scnr, context2)) {
            token = getToken(context2, 6, readListIdentifier(scnr));
            skipSpaces(scnr);
            return token;
          }
          if (validLiteral = isLiteralStart(scnr, context2)) {
            token = getToken(context2, 7, readLiteral(scnr));
            skipSpaces(scnr);
            return token;
          }
          if (!validNamedIdentifier && !validListIdentifier && !validLiteral) {
            token = getToken(context2, 13, readInvalidIdentifier(scnr));
            emitError(CompileErrorCodes.INVALID_TOKEN_IN_PLACEHOLDER, currentPosition(), 0, token.value);
            skipSpaces(scnr);
            return token;
          }
          break;
        }
      }
      return token;
    }
    function readTokenInLinked(scnr, context2) {
      const { currentType } = context2;
      let token = null;
      const ch = scnr.currentChar();
      if ((currentType === 8 || currentType === 9 || currentType === 12 || currentType === 10) && (ch === CHAR_LF || ch === CHAR_SP)) {
        emitError(CompileErrorCodes.INVALID_LINKED_FORMAT, currentPosition(), 0);
      }
      switch (ch) {
        case "@":
          scnr.next();
          token = getToken(
            context2,
            8,
            "@"
            /* TokenChars.LinkedAlias */
          );
          context2.inLinked = true;
          return token;
        case ".":
          skipSpaces(scnr);
          scnr.next();
          return getToken(
            context2,
            9,
            "."
            /* TokenChars.LinkedDot */
          );
        case ":":
          skipSpaces(scnr);
          scnr.next();
          return getToken(
            context2,
            10,
            ":"
            /* TokenChars.LinkedDelimiter */
          );
        default:
          if (isPluralStart(scnr)) {
            token = getToken(context2, 1, readPlural(scnr));
            context2.braceNest = 0;
            context2.inLinked = false;
            return token;
          }
          if (isLinkedDotStart(scnr, context2) || isLinkedDelimiterStart(scnr, context2)) {
            skipSpaces(scnr);
            return readTokenInLinked(scnr, context2);
          }
          if (isLinkedModifierStart(scnr, context2)) {
            skipSpaces(scnr);
            return getToken(context2, 12, readLinkedModifier(scnr));
          }
          if (isLinkedReferStart(scnr, context2)) {
            skipSpaces(scnr);
            if (ch === "{") {
              return readTokenInPlaceholder(scnr, context2) || token;
            } else {
              return getToken(context2, 11, readLinkedRefer(scnr));
            }
          }
          if (currentType === 8) {
            emitError(CompileErrorCodes.INVALID_LINKED_FORMAT, currentPosition(), 0);
          }
          context2.braceNest = 0;
          context2.inLinked = false;
          return readToken(scnr, context2);
      }
    }
    function readToken(scnr, context2) {
      let token = {
        type: 14
        /* TokenTypes.EOF */
      };
      if (context2.braceNest > 0) {
        return readTokenInPlaceholder(scnr, context2) || getEndToken(context2);
      }
      if (context2.inLinked) {
        return readTokenInLinked(scnr, context2) || getEndToken(context2);
      }
      const ch = scnr.currentChar();
      switch (ch) {
        case "{":
          return readTokenInPlaceholder(scnr, context2) || getEndToken(context2);
        case "}":
          emitError(CompileErrorCodes.UNBALANCED_CLOSING_BRACE, currentPosition(), 0);
          scnr.next();
          return getToken(
            context2,
            3,
            "}"
            /* TokenChars.BraceRight */
          );
        case "@":
          return readTokenInLinked(scnr, context2) || getEndToken(context2);
        default: {
          if (isPluralStart(scnr)) {
            token = getToken(context2, 1, readPlural(scnr));
            context2.braceNest = 0;
            context2.inLinked = false;
            return token;
          }
          const { isModulo, hasSpace } = detectModuloStart(scnr);
          if (isModulo) {
            return hasSpace ? getToken(context2, 0, readText(scnr)) : getToken(context2, 4, readModulo(scnr));
          }
          if (isTextStart(scnr)) {
            return getToken(context2, 0, readText(scnr));
          }
          break;
        }
      }
      return token;
    }
    function nextToken() {
      const { currentType, offset, startLoc, endLoc } = _context;
      _context.lastType = currentType;
      _context.lastOffset = offset;
      _context.lastStartLoc = startLoc;
      _context.lastEndLoc = endLoc;
      _context.offset = currentOffset();
      _context.startLoc = currentPosition();
      if (_scnr.currentChar() === EOF) {
        return getToken(
          _context,
          14
          /* TokenTypes.EOF */
        );
      }
      return readToken(_scnr, _context);
    }
    return {
      nextToken,
      currentOffset,
      currentPosition,
      context
    };
  }
  const ERROR_DOMAIN$2 = "parser";
  const KNOWN_ESCAPES = /(?:\\\\|\\'|\\u([0-9a-fA-F]{4})|\\U([0-9a-fA-F]{6}))/g;
  function fromEscapeSequence(match, codePoint4, codePoint6) {
    switch (match) {
      case `\\\\`:
        return `\\`;
      case `\\'`:
        return `'`;
      default: {
        const codePoint = parseInt(codePoint4 || codePoint6, 16);
        if (codePoint <= 55295 || codePoint >= 57344) {
          return String.fromCodePoint(codePoint);
        }
        return "�";
      }
    }
  }
  function createParser(options = {}) {
    const location = options.location !== false;
    const { onError, onWarn } = options;
    function emitError(tokenzer, code2, start, offset, ...args) {
      const end2 = tokenzer.currentPosition();
      end2.offset += offset;
      end2.column += offset;
      if (onError) {
        const loc = location ? createLocation(start, end2) : null;
        const err = createCompileError(code2, loc, {
          domain: ERROR_DOMAIN$2,
          args
        });
        onError(err);
      }
    }
    function emitWarn(tokenzer, code2, start, offset, ...args) {
      const end2 = tokenzer.currentPosition();
      end2.offset += offset;
      end2.column += offset;
      if (onWarn) {
        const loc = location ? createLocation(start, end2) : null;
        onWarn(createCompileWarn(code2, loc, args));
      }
    }
    function startNode(type, offset, loc) {
      const node = { type };
      if (location) {
        node.start = offset;
        node.end = offset;
        node.loc = { start: loc, end: loc };
      }
      return node;
    }
    function endNode(node, offset, pos, type) {
      if (location) {
        node.end = offset;
        if (node.loc) {
          node.loc.end = pos;
        }
      }
    }
    function parseText(tokenizer, value) {
      const context = tokenizer.context();
      const node = startNode(3, context.offset, context.startLoc);
      node.value = value;
      endNode(node, tokenizer.currentOffset(), tokenizer.currentPosition());
      return node;
    }
    function parseList(tokenizer, index) {
      const context = tokenizer.context();
      const { lastOffset: offset, lastStartLoc: loc } = context;
      const node = startNode(5, offset, loc);
      node.index = parseInt(index, 10);
      tokenizer.nextToken();
      endNode(node, tokenizer.currentOffset(), tokenizer.currentPosition());
      return node;
    }
    function parseNamed(tokenizer, key, modulo) {
      const context = tokenizer.context();
      const { lastOffset: offset, lastStartLoc: loc } = context;
      const node = startNode(4, offset, loc);
      node.key = key;
      if (modulo === true) {
        node.modulo = true;
      }
      tokenizer.nextToken();
      endNode(node, tokenizer.currentOffset(), tokenizer.currentPosition());
      return node;
    }
    function parseLiteral(tokenizer, value) {
      const context = tokenizer.context();
      const { lastOffset: offset, lastStartLoc: loc } = context;
      const node = startNode(9, offset, loc);
      node.value = value.replace(KNOWN_ESCAPES, fromEscapeSequence);
      tokenizer.nextToken();
      endNode(node, tokenizer.currentOffset(), tokenizer.currentPosition());
      return node;
    }
    function parseLinkedModifier(tokenizer) {
      const token = tokenizer.nextToken();
      const context = tokenizer.context();
      const { lastOffset: offset, lastStartLoc: loc } = context;
      const node = startNode(8, offset, loc);
      if (token.type !== 12) {
        emitError(tokenizer, CompileErrorCodes.UNEXPECTED_EMPTY_LINKED_MODIFIER, context.lastStartLoc, 0);
        node.value = "";
        endNode(node, offset, loc);
        return {
          nextConsumeToken: token,
          node
        };
      }
      if (token.value == null) {
        emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
      }
      node.value = token.value || "";
      endNode(node, tokenizer.currentOffset(), tokenizer.currentPosition());
      return {
        node
      };
    }
    function parseLinkedKey(tokenizer, value) {
      const context = tokenizer.context();
      const node = startNode(7, context.offset, context.startLoc);
      node.value = value;
      endNode(node, tokenizer.currentOffset(), tokenizer.currentPosition());
      return node;
    }
    function parseLinked(tokenizer) {
      const context = tokenizer.context();
      const linkedNode = startNode(6, context.offset, context.startLoc);
      let token = tokenizer.nextToken();
      if (token.type === 9) {
        const parsed = parseLinkedModifier(tokenizer);
        linkedNode.modifier = parsed.node;
        token = parsed.nextConsumeToken || tokenizer.nextToken();
      }
      if (token.type !== 10) {
        emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
      }
      token = tokenizer.nextToken();
      if (token.type === 2) {
        token = tokenizer.nextToken();
      }
      switch (token.type) {
        case 11:
          if (token.value == null) {
            emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
          }
          linkedNode.key = parseLinkedKey(tokenizer, token.value || "");
          break;
        case 5:
          if (token.value == null) {
            emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
          }
          linkedNode.key = parseNamed(tokenizer, token.value || "");
          break;
        case 6:
          if (token.value == null) {
            emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
          }
          linkedNode.key = parseList(tokenizer, token.value || "");
          break;
        case 7:
          if (token.value == null) {
            emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
          }
          linkedNode.key = parseLiteral(tokenizer, token.value || "");
          break;
        default: {
          emitError(tokenizer, CompileErrorCodes.UNEXPECTED_EMPTY_LINKED_KEY, context.lastStartLoc, 0);
          const nextContext = tokenizer.context();
          const emptyLinkedKeyNode = startNode(7, nextContext.offset, nextContext.startLoc);
          emptyLinkedKeyNode.value = "";
          endNode(emptyLinkedKeyNode, nextContext.offset, nextContext.startLoc);
          linkedNode.key = emptyLinkedKeyNode;
          endNode(linkedNode, nextContext.offset, nextContext.startLoc);
          return {
            nextConsumeToken: token,
            node: linkedNode
          };
        }
      }
      endNode(linkedNode, tokenizer.currentOffset(), tokenizer.currentPosition());
      return {
        node: linkedNode
      };
    }
    function parseMessage(tokenizer) {
      const context = tokenizer.context();
      const startOffset = context.currentType === 1 ? tokenizer.currentOffset() : context.offset;
      const startLoc = context.currentType === 1 ? context.endLoc : context.startLoc;
      const node = startNode(2, startOffset, startLoc);
      node.items = [];
      let nextToken = null;
      let modulo = null;
      do {
        const token = nextToken || tokenizer.nextToken();
        nextToken = null;
        switch (token.type) {
          case 0:
            if (token.value == null) {
              emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
            }
            node.items.push(parseText(tokenizer, token.value || ""));
            break;
          case 6:
            if (token.value == null) {
              emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
            }
            node.items.push(parseList(tokenizer, token.value || ""));
            break;
          case 4:
            modulo = true;
            break;
          case 5:
            if (token.value == null) {
              emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
            }
            node.items.push(parseNamed(tokenizer, token.value || "", !!modulo));
            if (modulo) {
              emitWarn(tokenizer, CompileWarnCodes.USE_MODULO_SYNTAX, context.lastStartLoc, 0, getTokenCaption(token));
              modulo = null;
            }
            break;
          case 7:
            if (token.value == null) {
              emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
            }
            node.items.push(parseLiteral(tokenizer, token.value || ""));
            break;
          case 8: {
            const parsed = parseLinked(tokenizer);
            node.items.push(parsed.node);
            nextToken = parsed.nextConsumeToken || null;
            break;
          }
        }
      } while (context.currentType !== 14 && context.currentType !== 1);
      const endOffset = context.currentType === 1 ? context.lastOffset : tokenizer.currentOffset();
      const endLoc = context.currentType === 1 ? context.lastEndLoc : tokenizer.currentPosition();
      endNode(node, endOffset, endLoc);
      return node;
    }
    function parsePlural(tokenizer, offset, loc, msgNode) {
      const context = tokenizer.context();
      let hasEmptyMessage = msgNode.items.length === 0;
      const node = startNode(1, offset, loc);
      node.cases = [];
      node.cases.push(msgNode);
      do {
        const msg = parseMessage(tokenizer);
        if (!hasEmptyMessage) {
          hasEmptyMessage = msg.items.length === 0;
        }
        node.cases.push(msg);
      } while (context.currentType !== 14);
      if (hasEmptyMessage) {
        emitError(tokenizer, CompileErrorCodes.MUST_HAVE_MESSAGES_IN_PLURAL, loc, 0);
      }
      endNode(node, tokenizer.currentOffset(), tokenizer.currentPosition());
      return node;
    }
    function parseResource(tokenizer) {
      const context = tokenizer.context();
      const { offset, startLoc } = context;
      const msgNode = parseMessage(tokenizer);
      if (context.currentType === 14) {
        return msgNode;
      } else {
        return parsePlural(tokenizer, offset, startLoc, msgNode);
      }
    }
    function parse2(source) {
      const tokenizer = createTokenizer(source, assign({}, options));
      const context = tokenizer.context();
      const node = startNode(0, context.offset, context.startLoc);
      if (location && node.loc) {
        node.loc.source = source;
      }
      node.body = parseResource(tokenizer);
      if (options.onCacheKey) {
        node.cacheKey = options.onCacheKey(source);
      }
      if (context.currentType !== 14) {
        emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, source[context.offset] || "");
      }
      endNode(node, tokenizer.currentOffset(), tokenizer.currentPosition());
      return node;
    }
    return { parse: parse2 };
  }
  function getTokenCaption(token) {
    if (token.type === 14) {
      return "EOF";
    }
    const name = (token.value || "").replace(/\r?\n/gu, "\\n");
    return name.length > 10 ? name.slice(0, 9) + "…" : name;
  }
  function createTransformer(ast, options = {}) {
    const _context = {
      ast,
      helpers: /* @__PURE__ */ new Set()
    };
    const context = () => _context;
    const helper = (name) => {
      _context.helpers.add(name);
      return name;
    };
    return { context, helper };
  }
  function traverseNodes(nodes, transformer) {
    for (let i = 0; i < nodes.length; i++) {
      traverseNode(nodes[i], transformer);
    }
  }
  function traverseNode(node, transformer) {
    switch (node.type) {
      case 1:
        traverseNodes(node.cases, transformer);
        transformer.helper(
          "plural"
          /* HelperNameMap.PLURAL */
        );
        break;
      case 2:
        traverseNodes(node.items, transformer);
        break;
      case 6: {
        const linked = node;
        traverseNode(linked.key, transformer);
        transformer.helper(
          "linked"
          /* HelperNameMap.LINKED */
        );
        transformer.helper(
          "type"
          /* HelperNameMap.TYPE */
        );
        break;
      }
      case 5:
        transformer.helper(
          "interpolate"
          /* HelperNameMap.INTERPOLATE */
        );
        transformer.helper(
          "list"
          /* HelperNameMap.LIST */
        );
        break;
      case 4:
        transformer.helper(
          "interpolate"
          /* HelperNameMap.INTERPOLATE */
        );
        transformer.helper(
          "named"
          /* HelperNameMap.NAMED */
        );
        break;
    }
  }
  function transform(ast, options = {}) {
    const transformer = createTransformer(ast);
    transformer.helper(
      "normalize"
      /* HelperNameMap.NORMALIZE */
    );
    ast.body && traverseNode(ast.body, transformer);
    const context = transformer.context();
    ast.helpers = Array.from(context.helpers);
  }
  function optimize(ast) {
    const body = ast.body;
    if (body.type === 2) {
      optimizeMessageNode(body);
    } else {
      body.cases.forEach((c) => optimizeMessageNode(c));
    }
    return ast;
  }
  function optimizeMessageNode(message) {
    if (message.items.length === 1) {
      const item = message.items[0];
      if (item.type === 3 || item.type === 9) {
        message.static = item.value;
        delete item.value;
      }
    } else {
      const values = [];
      for (let i = 0; i < message.items.length; i++) {
        const item = message.items[i];
        if (!(item.type === 3 || item.type === 9)) {
          break;
        }
        if (item.value == null) {
          break;
        }
        values.push(item.value);
      }
      if (values.length === message.items.length) {
        message.static = join(values);
        for (let i = 0; i < message.items.length; i++) {
          const item = message.items[i];
          if (item.type === 3 || item.type === 9) {
            delete item.value;
          }
        }
      }
    }
  }
  const ERROR_DOMAIN$1 = "minifier";
  function minify(node) {
    node.t = node.type;
    switch (node.type) {
      case 0: {
        const resource = node;
        minify(resource.body);
        resource.b = resource.body;
        delete resource.body;
        break;
      }
      case 1: {
        const plural = node;
        const cases = plural.cases;
        for (let i = 0; i < cases.length; i++) {
          minify(cases[i]);
        }
        plural.c = cases;
        delete plural.cases;
        break;
      }
      case 2: {
        const message = node;
        const items = message.items;
        for (let i = 0; i < items.length; i++) {
          minify(items[i]);
        }
        message.i = items;
        delete message.items;
        if (message.static) {
          message.s = message.static;
          delete message.static;
        }
        break;
      }
      case 3:
      case 9:
      case 8:
      case 7: {
        const valueNode = node;
        if (valueNode.value) {
          valueNode.v = valueNode.value;
          delete valueNode.value;
        }
        break;
      }
      case 6: {
        const linked = node;
        minify(linked.key);
        linked.k = linked.key;
        delete linked.key;
        if (linked.modifier) {
          minify(linked.modifier);
          linked.m = linked.modifier;
          delete linked.modifier;
        }
        break;
      }
      case 5: {
        const list = node;
        list.i = list.index;
        delete list.index;
        break;
      }
      case 4: {
        const named = node;
        named.k = named.key;
        delete named.key;
        break;
      }
      default: {
        throw createCompileError(CompileErrorCodes.UNHANDLED_MINIFIER_NODE_TYPE, null, {
          domain: ERROR_DOMAIN$1,
          args: [node.type]
        });
      }
    }
    delete node.type;
  }
  const ERROR_DOMAIN = "parser";
  function createCodeGenerator(ast, options) {
    const { filename, breakLineCode, needIndent: _needIndent } = options;
    const location = options.location !== false;
    const _context = {
      filename,
      code: "",
      column: 1,
      line: 1,
      offset: 0,
      map: void 0,
      breakLineCode,
      needIndent: _needIndent,
      indentLevel: 0
    };
    if (location && ast.loc) {
      _context.source = ast.loc.source;
    }
    const context = () => _context;
    function push(code2, node) {
      _context.code += code2;
    }
    function _newline(n, withBreakLine = true) {
      const _breakLineCode = withBreakLine ? breakLineCode : "";
      push(_needIndent ? _breakLineCode + `  `.repeat(n) : _breakLineCode);
    }
    function indent(withNewLine = true) {
      const level = ++_context.indentLevel;
      withNewLine && _newline(level);
    }
    function deindent(withNewLine = true) {
      const level = --_context.indentLevel;
      withNewLine && _newline(level);
    }
    function newline() {
      _newline(_context.indentLevel);
    }
    const helper = (key) => `_${key}`;
    const needIndent = () => _context.needIndent;
    return {
      context,
      push,
      indent,
      deindent,
      newline,
      helper,
      needIndent
    };
  }
  function generateLinkedNode(generator, node) {
    const { helper } = generator;
    generator.push(`${helper(
      "linked"
      /* HelperNameMap.LINKED */
    )}(`);
    generateNode(generator, node.key);
    if (node.modifier) {
      generator.push(`, `);
      generateNode(generator, node.modifier);
      generator.push(`, _type`);
    } else {
      generator.push(`, undefined, _type`);
    }
    generator.push(`)`);
  }
  function generateMessageNode(generator, node) {
    const { helper, needIndent } = generator;
    generator.push(`${helper(
      "normalize"
      /* HelperNameMap.NORMALIZE */
    )}([`);
    generator.indent(needIndent());
    const length = node.items.length;
    for (let i = 0; i < length; i++) {
      generateNode(generator, node.items[i]);
      if (i === length - 1) {
        break;
      }
      generator.push(", ");
    }
    generator.deindent(needIndent());
    generator.push("])");
  }
  function generatePluralNode(generator, node) {
    const { helper, needIndent } = generator;
    if (node.cases.length > 1) {
      generator.push(`${helper(
        "plural"
        /* HelperNameMap.PLURAL */
      )}([`);
      generator.indent(needIndent());
      const length = node.cases.length;
      for (let i = 0; i < length; i++) {
        generateNode(generator, node.cases[i]);
        if (i === length - 1) {
          break;
        }
        generator.push(", ");
      }
      generator.deindent(needIndent());
      generator.push(`])`);
    }
  }
  function generateResource(generator, node) {
    if (node.body) {
      generateNode(generator, node.body);
    } else {
      generator.push("null");
    }
  }
  function generateNode(generator, node) {
    const { helper } = generator;
    switch (node.type) {
      case 0:
        generateResource(generator, node);
        break;
      case 1:
        generatePluralNode(generator, node);
        break;
      case 2:
        generateMessageNode(generator, node);
        break;
      case 6:
        generateLinkedNode(generator, node);
        break;
      case 8:
        generator.push(JSON.stringify(node.value), node);
        break;
      case 7:
        generator.push(JSON.stringify(node.value), node);
        break;
      case 5:
        generator.push(`${helper(
          "interpolate"
          /* HelperNameMap.INTERPOLATE */
        )}(${helper(
          "list"
          /* HelperNameMap.LIST */
        )}(${node.index}))`, node);
        break;
      case 4:
        generator.push(`${helper(
          "interpolate"
          /* HelperNameMap.INTERPOLATE */
        )}(${helper(
          "named"
          /* HelperNameMap.NAMED */
        )}(${JSON.stringify(node.key)}))`, node);
        break;
      case 9:
        generator.push(JSON.stringify(node.value), node);
        break;
      case 3:
        generator.push(JSON.stringify(node.value), node);
        break;
      default: {
        throw createCompileError(CompileErrorCodes.UNHANDLED_CODEGEN_NODE_TYPE, null, {
          domain: ERROR_DOMAIN,
          args: [node.type]
        });
      }
    }
  }
  const generate = (ast, options = {}) => {
    const mode = isString(options.mode) ? options.mode : "normal";
    const filename = isString(options.filename) ? options.filename : "message.intl";
    !!options.sourceMap;
    const breakLineCode = options.breakLineCode != null ? options.breakLineCode : mode === "arrow" ? ";" : "\n";
    const needIndent = options.needIndent ? options.needIndent : mode !== "arrow";
    const helpers = ast.helpers || [];
    const generator = createCodeGenerator(ast, {
      filename,
      breakLineCode,
      needIndent
    });
    generator.push(mode === "normal" ? `function __msg__ (ctx) {` : `(ctx) => {`);
    generator.indent(needIndent);
    if (helpers.length > 0) {
      generator.push(`const { ${join(helpers.map((s2) => `${s2}: _${s2}`), ", ")} } = ctx`);
      generator.newline();
    }
    generator.push(`return `);
    generateNode(generator, ast);
    generator.deindent(needIndent);
    generator.push(`}`);
    delete ast.helpers;
    const { code: code2, map } = generator.context();
    return {
      ast,
      code: code2,
      map: map ? map.toJSON() : void 0
      // eslint-disable-line @typescript-eslint/no-explicit-any
    };
  };
  function baseCompile$1(source, options = {}) {
    const assignedOptions = assign({}, options);
    const jit = !!assignedOptions.jit;
    const enalbeMinify = !!assignedOptions.minify;
    const enambeOptimize = assignedOptions.optimize == null ? true : assignedOptions.optimize;
    const parser = createParser(assignedOptions);
    const ast = parser.parse(source);
    if (!jit) {
      transform(ast, assignedOptions);
      return generate(ast, assignedOptions);
    } else {
      enambeOptimize && optimize(ast);
      enalbeMinify && minify(ast);
      return { ast, code: "" };
    }
  }
  /*!
    * core-base v9.14.5
    * (c) 2025 kazuya kawaguchi
    * Released under the MIT License.
    */
  function initFeatureFlags$1() {
    if (typeof __INTLIFY_JIT_COMPILATION__ !== "boolean") {
      getGlobalThis().__INTLIFY_JIT_COMPILATION__ = false;
    }
    if (typeof __INTLIFY_DROP_MESSAGE_COMPILER__ !== "boolean") {
      getGlobalThis().__INTLIFY_DROP_MESSAGE_COMPILER__ = false;
    }
  }
  function isMessageAST(val) {
    return isObject$1(val) && resolveType(val) === 0 && (hasOwn(val, "b") || hasOwn(val, "body"));
  }
  const PROPS_BODY = ["b", "body"];
  function resolveBody(node) {
    return resolveProps(node, PROPS_BODY);
  }
  const PROPS_CASES = ["c", "cases"];
  function resolveCases(node) {
    return resolveProps(node, PROPS_CASES, []);
  }
  const PROPS_STATIC = ["s", "static"];
  function resolveStatic(node) {
    return resolveProps(node, PROPS_STATIC);
  }
  const PROPS_ITEMS = ["i", "items"];
  function resolveItems(node) {
    return resolveProps(node, PROPS_ITEMS, []);
  }
  const PROPS_TYPE = ["t", "type"];
  function resolveType(node) {
    return resolveProps(node, PROPS_TYPE);
  }
  const PROPS_VALUE = ["v", "value"];
  function resolveValue$1(node, type) {
    const resolved = resolveProps(node, PROPS_VALUE);
    if (resolved != null) {
      return resolved;
    } else {
      throw createUnhandleNodeError(type);
    }
  }
  const PROPS_MODIFIER = ["m", "modifier"];
  function resolveLinkedModifier(node) {
    return resolveProps(node, PROPS_MODIFIER);
  }
  const PROPS_KEY = ["k", "key"];
  function resolveLinkedKey(node) {
    const resolved = resolveProps(node, PROPS_KEY);
    if (resolved) {
      return resolved;
    } else {
      throw createUnhandleNodeError(
        6
        /* NodeTypes.Linked */
      );
    }
  }
  function resolveProps(node, props, defaultValue) {
    for (let i = 0; i < props.length; i++) {
      const prop = props[i];
      if (hasOwn(node, prop) && node[prop] != null) {
        return node[prop];
      }
    }
    return defaultValue;
  }
  const AST_NODE_PROPS_KEYS = [
    ...PROPS_BODY,
    ...PROPS_CASES,
    ...PROPS_STATIC,
    ...PROPS_ITEMS,
    ...PROPS_KEY,
    ...PROPS_MODIFIER,
    ...PROPS_VALUE,
    ...PROPS_TYPE
  ];
  function createUnhandleNodeError(type) {
    return new Error(`unhandled node type: ${type}`);
  }
  const pathStateMachine = [];
  pathStateMachine[
    0
    /* States.BEFORE_PATH */
  ] = {
    [
      "w"
      /* PathCharTypes.WORKSPACE */
    ]: [
      0
      /* States.BEFORE_PATH */
    ],
    [
      "i"
      /* PathCharTypes.IDENT */
    ]: [
      3,
      0
      /* Actions.APPEND */
    ],
    [
      "["
      /* PathCharTypes.LEFT_BRACKET */
    ]: [
      4
      /* States.IN_SUB_PATH */
    ],
    [
      "o"
      /* PathCharTypes.END_OF_FAIL */
    ]: [
      7
      /* States.AFTER_PATH */
    ]
  };
  pathStateMachine[
    1
    /* States.IN_PATH */
  ] = {
    [
      "w"
      /* PathCharTypes.WORKSPACE */
    ]: [
      1
      /* States.IN_PATH */
    ],
    [
      "."
      /* PathCharTypes.DOT */
    ]: [
      2
      /* States.BEFORE_IDENT */
    ],
    [
      "["
      /* PathCharTypes.LEFT_BRACKET */
    ]: [
      4
      /* States.IN_SUB_PATH */
    ],
    [
      "o"
      /* PathCharTypes.END_OF_FAIL */
    ]: [
      7
      /* States.AFTER_PATH */
    ]
  };
  pathStateMachine[
    2
    /* States.BEFORE_IDENT */
  ] = {
    [
      "w"
      /* PathCharTypes.WORKSPACE */
    ]: [
      2
      /* States.BEFORE_IDENT */
    ],
    [
      "i"
      /* PathCharTypes.IDENT */
    ]: [
      3,
      0
      /* Actions.APPEND */
    ],
    [
      "0"
      /* PathCharTypes.ZERO */
    ]: [
      3,
      0
      /* Actions.APPEND */
    ]
  };
  pathStateMachine[
    3
    /* States.IN_IDENT */
  ] = {
    [
      "i"
      /* PathCharTypes.IDENT */
    ]: [
      3,
      0
      /* Actions.APPEND */
    ],
    [
      "0"
      /* PathCharTypes.ZERO */
    ]: [
      3,
      0
      /* Actions.APPEND */
    ],
    [
      "w"
      /* PathCharTypes.WORKSPACE */
    ]: [
      1,
      1
      /* Actions.PUSH */
    ],
    [
      "."
      /* PathCharTypes.DOT */
    ]: [
      2,
      1
      /* Actions.PUSH */
    ],
    [
      "["
      /* PathCharTypes.LEFT_BRACKET */
    ]: [
      4,
      1
      /* Actions.PUSH */
    ],
    [
      "o"
      /* PathCharTypes.END_OF_FAIL */
    ]: [
      7,
      1
      /* Actions.PUSH */
    ]
  };
  pathStateMachine[
    4
    /* States.IN_SUB_PATH */
  ] = {
    [
      "'"
      /* PathCharTypes.SINGLE_QUOTE */
    ]: [
      5,
      0
      /* Actions.APPEND */
    ],
    [
      '"'
      /* PathCharTypes.DOUBLE_QUOTE */
    ]: [
      6,
      0
      /* Actions.APPEND */
    ],
    [
      "["
      /* PathCharTypes.LEFT_BRACKET */
    ]: [
      4,
      2
      /* Actions.INC_SUB_PATH_DEPTH */
    ],
    [
      "]"
      /* PathCharTypes.RIGHT_BRACKET */
    ]: [
      1,
      3
      /* Actions.PUSH_SUB_PATH */
    ],
    [
      "o"
      /* PathCharTypes.END_OF_FAIL */
    ]: 8,
    [
      "l"
      /* PathCharTypes.ELSE */
    ]: [
      4,
      0
      /* Actions.APPEND */
    ]
  };
  pathStateMachine[
    5
    /* States.IN_SINGLE_QUOTE */
  ] = {
    [
      "'"
      /* PathCharTypes.SINGLE_QUOTE */
    ]: [
      4,
      0
      /* Actions.APPEND */
    ],
    [
      "o"
      /* PathCharTypes.END_OF_FAIL */
    ]: 8,
    [
      "l"
      /* PathCharTypes.ELSE */
    ]: [
      5,
      0
      /* Actions.APPEND */
    ]
  };
  pathStateMachine[
    6
    /* States.IN_DOUBLE_QUOTE */
  ] = {
    [
      '"'
      /* PathCharTypes.DOUBLE_QUOTE */
    ]: [
      4,
      0
      /* Actions.APPEND */
    ],
    [
      "o"
      /* PathCharTypes.END_OF_FAIL */
    ]: 8,
    [
      "l"
      /* PathCharTypes.ELSE */
    ]: [
      6,
      0
      /* Actions.APPEND */
    ]
  };
  const literalValueRE = /^\s?(?:true|false|-?[\d.]+|'[^']*'|"[^"]*")\s?$/;
  function isLiteral(exp) {
    return literalValueRE.test(exp);
  }
  function stripQuotes(str) {
    const a = str.charCodeAt(0);
    const b = str.charCodeAt(str.length - 1);
    return a === b && (a === 34 || a === 39) ? str.slice(1, -1) : str;
  }
  function getPathCharType(ch) {
    if (ch === void 0 || ch === null) {
      return "o";
    }
    const code2 = ch.charCodeAt(0);
    switch (code2) {
      case 91:
      case 93:
      case 46:
      case 34:
      case 39:
        return ch;
      case 95:
      case 36:
      case 45:
        return "i";
      case 9:
      case 10:
      case 13:
      case 160:
      case 65279:
      case 8232:
      case 8233:
        return "w";
    }
    return "i";
  }
  function formatSubPath(path) {
    const trimmed = path.trim();
    if (path.charAt(0) === "0" && isNaN(parseInt(path))) {
      return false;
    }
    return isLiteral(trimmed) ? stripQuotes(trimmed) : "*" + trimmed;
  }
  function parse$2(path) {
    const keys = [];
    let index = -1;
    let mode = 0;
    let subPathDepth = 0;
    let c;
    let key;
    let newChar;
    let type;
    let transition;
    let action;
    let typeMap;
    const actions = [];
    actions[
      0
      /* Actions.APPEND */
    ] = () => {
      if (key === void 0) {
        key = newChar;
      } else {
        key += newChar;
      }
    };
    actions[
      1
      /* Actions.PUSH */
    ] = () => {
      if (key !== void 0) {
        keys.push(key);
        key = void 0;
      }
    };
    actions[
      2
      /* Actions.INC_SUB_PATH_DEPTH */
    ] = () => {
      actions[
        0
        /* Actions.APPEND */
      ]();
      subPathDepth++;
    };
    actions[
      3
      /* Actions.PUSH_SUB_PATH */
    ] = () => {
      if (subPathDepth > 0) {
        subPathDepth--;
        mode = 4;
        actions[
          0
          /* Actions.APPEND */
        ]();
      } else {
        subPathDepth = 0;
        if (key === void 0) {
          return false;
        }
        key = formatSubPath(key);
        if (key === false) {
          return false;
        } else {
          actions[
            1
            /* Actions.PUSH */
          ]();
        }
      }
    };
    function maybeUnescapeQuote() {
      const nextChar = path[index + 1];
      if (mode === 5 && nextChar === "'" || mode === 6 && nextChar === '"') {
        index++;
        newChar = "\\" + nextChar;
        actions[
          0
          /* Actions.APPEND */
        ]();
        return true;
      }
    }
    while (mode !== null) {
      index++;
      c = path[index];
      if (c === "\\" && maybeUnescapeQuote()) {
        continue;
      }
      type = getPathCharType(c);
      typeMap = pathStateMachine[mode];
      transition = typeMap[type] || typeMap[
        "l"
        /* PathCharTypes.ELSE */
      ] || 8;
      if (transition === 8) {
        return;
      }
      mode = transition[0];
      if (transition[1] !== void 0) {
        action = actions[transition[1]];
        if (action) {
          newChar = c;
          if (action() === false) {
            return;
          }
        }
      }
      if (mode === 7) {
        return keys;
      }
    }
  }
  const cache = /* @__PURE__ */ new Map();
  function resolveWithKeyValue(obj, path) {
    return isObject$1(obj) ? obj[path] : null;
  }
  function resolveValue(obj, path) {
    if (!isObject$1(obj)) {
      return null;
    }
    let hit = cache.get(path);
    if (!hit) {
      hit = parse$2(path);
      if (hit) {
        cache.set(path, hit);
      }
    }
    if (!hit) {
      return null;
    }
    const len = hit.length;
    let last = obj;
    let i = 0;
    while (i < len) {
      const key = hit[i];
      if (AST_NODE_PROPS_KEYS.includes(key) && isMessageAST(last)) {
        return null;
      }
      const val = last[key];
      if (val === void 0) {
        return null;
      }
      if (isFunction(last)) {
        return null;
      }
      last = val;
      i++;
    }
    return last;
  }
  const DEFAULT_MODIFIER = (str) => str;
  const DEFAULT_MESSAGE = (ctx) => "";
  const DEFAULT_MESSAGE_DATA_TYPE = "text";
  const DEFAULT_NORMALIZE = (values) => values.length === 0 ? "" : join$1(values);
  const DEFAULT_INTERPOLATE = toDisplayString;
  function pluralDefault(choice, choicesLength) {
    choice = Math.abs(choice);
    if (choicesLength === 2) {
      return choice ? choice > 1 ? 1 : 0 : 1;
    }
    return choice ? Math.min(choice, 2) : 0;
  }
  function getPluralIndex(options) {
    const index = isNumber(options.pluralIndex) ? options.pluralIndex : -1;
    return options.named && (isNumber(options.named.count) || isNumber(options.named.n)) ? isNumber(options.named.count) ? options.named.count : isNumber(options.named.n) ? options.named.n : index : index;
  }
  function normalizeNamed(pluralIndex, props) {
    if (!props.count) {
      props.count = pluralIndex;
    }
    if (!props.n) {
      props.n = pluralIndex;
    }
  }
  function createMessageContext(options = {}) {
    const locale = options.locale;
    const pluralIndex = getPluralIndex(options);
    const pluralRule = isObject$1(options.pluralRules) && isString$1(locale) && isFunction(options.pluralRules[locale]) ? options.pluralRules[locale] : pluralDefault;
    const orgPluralRule = isObject$1(options.pluralRules) && isString$1(locale) && isFunction(options.pluralRules[locale]) ? pluralDefault : void 0;
    const plural = (messages) => {
      return messages[pluralRule(pluralIndex, messages.length, orgPluralRule)];
    };
    const _list = options.list || [];
    const list = (index) => _list[index];
    const _named = options.named || create();
    isNumber(options.pluralIndex) && normalizeNamed(pluralIndex, _named);
    const named = (key) => _named[key];
    function message(key) {
      const msg = isFunction(options.messages) ? options.messages(key) : isObject$1(options.messages) ? options.messages[key] : false;
      return !msg ? options.parent ? options.parent.message(key) : DEFAULT_MESSAGE : msg;
    }
    const _modifier = (name) => options.modifiers ? options.modifiers[name] : DEFAULT_MODIFIER;
    const normalize = isPlainObject(options.processor) && isFunction(options.processor.normalize) ? options.processor.normalize : DEFAULT_NORMALIZE;
    const interpolate = isPlainObject(options.processor) && isFunction(options.processor.interpolate) ? options.processor.interpolate : DEFAULT_INTERPOLATE;
    const type = isPlainObject(options.processor) && isString$1(options.processor.type) ? options.processor.type : DEFAULT_MESSAGE_DATA_TYPE;
    const linked = (key, ...args) => {
      const [arg1, arg2] = args;
      let type2 = "text";
      let modifier = "";
      if (args.length === 1) {
        if (isObject$1(arg1)) {
          modifier = arg1.modifier || modifier;
          type2 = arg1.type || type2;
        } else if (isString$1(arg1)) {
          modifier = arg1 || modifier;
        }
      } else if (args.length === 2) {
        if (isString$1(arg1)) {
          modifier = arg1 || modifier;
        }
        if (isString$1(arg2)) {
          type2 = arg2 || type2;
        }
      }
      const ret = message(key)(ctx);
      const msg = (
        // The message in vnode resolved with linked are returned as an array by processor.nomalize
        type2 === "vnode" && isArray(ret) && modifier ? ret[0] : ret
      );
      return modifier ? _modifier(modifier)(msg, type2) : msg;
    };
    const ctx = {
      [
        "list"
        /* HelperNameMap.LIST */
      ]: list,
      [
        "named"
        /* HelperNameMap.NAMED */
      ]: named,
      [
        "plural"
        /* HelperNameMap.PLURAL */
      ]: plural,
      [
        "linked"
        /* HelperNameMap.LINKED */
      ]: linked,
      [
        "message"
        /* HelperNameMap.MESSAGE */
      ]: message,
      [
        "type"
        /* HelperNameMap.TYPE */
      ]: type,
      [
        "interpolate"
        /* HelperNameMap.INTERPOLATE */
      ]: interpolate,
      [
        "normalize"
        /* HelperNameMap.NORMALIZE */
      ]: normalize,
      [
        "values"
        /* HelperNameMap.VALUES */
      ]: assign$1(create(), _list, _named)
    };
    return ctx;
  }
  const code$1$1 = CompileWarnCodes.__EXTEND_POINT__;
  const inc$1$1 = incrementer(code$1$1);
  const CoreWarnCodes = {
    // 2
    FALLBACK_TO_TRANSLATE: inc$1$1(),
    // 3
    CANNOT_FORMAT_NUMBER: inc$1$1(),
    // 4
    FALLBACK_TO_NUMBER_FORMAT: inc$1$1(),
    // 5
    CANNOT_FORMAT_DATE: inc$1$1(),
    // 6
    FALLBACK_TO_DATE_FORMAT: inc$1$1(),
    // 7
    EXPERIMENTAL_CUSTOM_MESSAGE_COMPILER: inc$1$1(),
    // 8
    __EXTEND_POINT__: inc$1$1()
    // 9
  };
  const code$2 = CompileErrorCodes.__EXTEND_POINT__;
  const inc$2 = incrementer(code$2);
  const CoreErrorCodes = {
    INVALID_ARGUMENT: code$2,
    // 17
    INVALID_DATE_ARGUMENT: inc$2(),
    // 18
    INVALID_ISO_DATE_ARGUMENT: inc$2(),
    // 19
    NOT_SUPPORT_NON_STRING_MESSAGE: inc$2(),
    // 20
    NOT_SUPPORT_LOCALE_PROMISE_VALUE: inc$2(),
    // 21
    NOT_SUPPORT_LOCALE_ASYNC_FUNCTION: inc$2(),
    // 22
    NOT_SUPPORT_LOCALE_TYPE: inc$2(),
    // 23
    __EXTEND_POINT__: inc$2()
    // 24
  };
  function createCoreError(code2) {
    return createCompileError(code2, null, void 0);
  }
  function getLocale(context, options) {
    return options.locale != null ? resolveLocale(options.locale) : resolveLocale(context.locale);
  }
  let _resolveLocale;
  function resolveLocale(locale) {
    if (isString$1(locale)) {
      return locale;
    } else {
      if (isFunction(locale)) {
        if (locale.resolvedOnce && _resolveLocale != null) {
          return _resolveLocale;
        } else if (locale.constructor.name === "Function") {
          const resolve = locale();
          if (isPromise(resolve)) {
            throw createCoreError(CoreErrorCodes.NOT_SUPPORT_LOCALE_PROMISE_VALUE);
          }
          return _resolveLocale = resolve;
        } else {
          throw createCoreError(CoreErrorCodes.NOT_SUPPORT_LOCALE_ASYNC_FUNCTION);
        }
      } else {
        throw createCoreError(CoreErrorCodes.NOT_SUPPORT_LOCALE_TYPE);
      }
    }
  }
  function fallbackWithSimple(ctx, fallback, start) {
    return [.../* @__PURE__ */ new Set([
      start,
      ...isArray(fallback) ? fallback : isObject$1(fallback) ? Object.keys(fallback) : isString$1(fallback) ? [fallback] : [start]
    ])];
  }
  function fallbackWithLocaleChain(ctx, fallback, start) {
    const startLocale = isString$1(start) ? start : DEFAULT_LOCALE;
    const context = ctx;
    if (!context.__localeChainCache) {
      context.__localeChainCache = /* @__PURE__ */ new Map();
    }
    let chain = context.__localeChainCache.get(startLocale);
    if (!chain) {
      chain = [];
      let block = [start];
      while (isArray(block)) {
        block = appendBlockToChain(chain, block, fallback);
      }
      const defaults = isArray(fallback) || !isPlainObject(fallback) ? fallback : fallback["default"] ? fallback["default"] : null;
      block = isString$1(defaults) ? [defaults] : defaults;
      if (isArray(block)) {
        appendBlockToChain(chain, block, false);
      }
      context.__localeChainCache.set(startLocale, chain);
    }
    return chain;
  }
  function appendBlockToChain(chain, block, blocks) {
    let follow = true;
    for (let i = 0; i < block.length && isBoolean(follow); i++) {
      const locale = block[i];
      if (isString$1(locale)) {
        follow = appendLocaleToChain(chain, block[i], blocks);
      }
    }
    return follow;
  }
  function appendLocaleToChain(chain, locale, blocks) {
    let follow;
    const tokens = locale.split("-");
    do {
      const target = tokens.join("-");
      follow = appendItemToChain(chain, target, blocks);
      tokens.splice(-1, 1);
    } while (tokens.length && follow === true);
    return follow;
  }
  function appendItemToChain(chain, target, blocks) {
    let follow = false;
    if (!chain.includes(target)) {
      follow = true;
      if (target) {
        follow = target[target.length - 1] !== "!";
        const locale = target.replace(/!/g, "");
        chain.push(locale);
        if ((isArray(blocks) || isPlainObject(blocks)) && blocks[locale]) {
          follow = blocks[locale];
        }
      }
    }
    return follow;
  }
  const VERSION$1 = "9.14.5";
  const NOT_REOSLVED = -1;
  const DEFAULT_LOCALE = "en-US";
  const MISSING_RESOLVE_VALUE = "";
  const capitalize = (str) => `${str.charAt(0).toLocaleUpperCase()}${str.substr(1)}`;
  function getDefaultLinkedModifiers() {
    return {
      upper: (val, type) => {
        return type === "text" && isString$1(val) ? val.toUpperCase() : type === "vnode" && isObject$1(val) && "__v_isVNode" in val ? val.children.toUpperCase() : val;
      },
      lower: (val, type) => {
        return type === "text" && isString$1(val) ? val.toLowerCase() : type === "vnode" && isObject$1(val) && "__v_isVNode" in val ? val.children.toLowerCase() : val;
      },
      capitalize: (val, type) => {
        return type === "text" && isString$1(val) ? capitalize(val) : type === "vnode" && isObject$1(val) && "__v_isVNode" in val ? capitalize(val.children) : val;
      }
    };
  }
  let _compiler;
  function registerMessageCompiler(compiler) {
    _compiler = compiler;
  }
  let _resolver;
  function registerMessageResolver(resolver) {
    _resolver = resolver;
  }
  let _fallbacker;
  function registerLocaleFallbacker(fallbacker) {
    _fallbacker = fallbacker;
  }
  const setAdditionalMeta = /* @__NO_SIDE_EFFECTS__ */ (meta) => {
  };
  let _fallbackContext = null;
  const setFallbackContext = (context) => {
    _fallbackContext = context;
  };
  const getFallbackContext = () => _fallbackContext;
  let _cid = 0;
  function createCoreContext(options = {}) {
    const onWarn = isFunction(options.onWarn) ? options.onWarn : warn;
    const version = isString$1(options.version) ? options.version : VERSION$1;
    const locale = isString$1(options.locale) || isFunction(options.locale) ? options.locale : DEFAULT_LOCALE;
    const _locale = isFunction(locale) ? DEFAULT_LOCALE : locale;
    const fallbackLocale = isArray(options.fallbackLocale) || isPlainObject(options.fallbackLocale) || isString$1(options.fallbackLocale) || options.fallbackLocale === false ? options.fallbackLocale : _locale;
    const messages = isPlainObject(options.messages) ? options.messages : createResources(_locale);
    const datetimeFormats = isPlainObject(options.datetimeFormats) ? options.datetimeFormats : createResources(_locale);
    const numberFormats = isPlainObject(options.numberFormats) ? options.numberFormats : createResources(_locale);
    const modifiers = assign$1(create(), options.modifiers, getDefaultLinkedModifiers());
    const pluralRules = options.pluralRules || create();
    const missing = isFunction(options.missing) ? options.missing : null;
    const missingWarn = isBoolean(options.missingWarn) || isRegExp(options.missingWarn) ? options.missingWarn : true;
    const fallbackWarn = isBoolean(options.fallbackWarn) || isRegExp(options.fallbackWarn) ? options.fallbackWarn : true;
    const fallbackFormat = !!options.fallbackFormat;
    const unresolving = !!options.unresolving;
    const postTranslation = isFunction(options.postTranslation) ? options.postTranslation : null;
    const processor = isPlainObject(options.processor) ? options.processor : null;
    const warnHtmlMessage = isBoolean(options.warnHtmlMessage) ? options.warnHtmlMessage : true;
    const escapeParameter = !!options.escapeParameter;
    const messageCompiler = isFunction(options.messageCompiler) ? options.messageCompiler : _compiler;
    const messageResolver = isFunction(options.messageResolver) ? options.messageResolver : _resolver || resolveWithKeyValue;
    const localeFallbacker = isFunction(options.localeFallbacker) ? options.localeFallbacker : _fallbacker || fallbackWithSimple;
    const fallbackContext = isObject$1(options.fallbackContext) ? options.fallbackContext : void 0;
    const internalOptions = options;
    const __datetimeFormatters = isObject$1(internalOptions.__datetimeFormatters) ? internalOptions.__datetimeFormatters : /* @__PURE__ */ new Map();
    const __numberFormatters = isObject$1(internalOptions.__numberFormatters) ? internalOptions.__numberFormatters : /* @__PURE__ */ new Map();
    const __meta = isObject$1(internalOptions.__meta) ? internalOptions.__meta : {};
    _cid++;
    const context = {
      version,
      cid: _cid,
      locale,
      fallbackLocale,
      messages,
      modifiers,
      pluralRules,
      missing,
      missingWarn,
      fallbackWarn,
      fallbackFormat,
      unresolving,
      postTranslation,
      processor,
      warnHtmlMessage,
      escapeParameter,
      messageCompiler,
      messageResolver,
      localeFallbacker,
      fallbackContext,
      onWarn,
      __meta
    };
    {
      context.datetimeFormats = datetimeFormats;
      context.numberFormats = numberFormats;
      context.__datetimeFormatters = __datetimeFormatters;
      context.__numberFormatters = __numberFormatters;
    }
    return context;
  }
  const createResources = (locale) => ({ [locale]: create() });
  function handleMissing(context, key, locale, missingWarn, type) {
    const { missing, onWarn } = context;
    if (missing !== null) {
      const ret = missing(context, locale, key, type);
      return isString$1(ret) ? ret : key;
    } else {
      return key;
    }
  }
  function updateFallbackLocale(ctx, locale, fallback) {
    const context = ctx;
    context.__localeChainCache = /* @__PURE__ */ new Map();
    ctx.localeFallbacker(ctx, fallback, locale);
  }
  function isAlmostSameLocale(locale, compareLocale) {
    if (locale === compareLocale)
      return false;
    return locale.split("-")[0] === compareLocale.split("-")[0];
  }
  function isImplicitFallback(targetLocale, locales) {
    const index = locales.indexOf(targetLocale);
    if (index === -1) {
      return false;
    }
    for (let i = index + 1; i < locales.length; i++) {
      if (isAlmostSameLocale(targetLocale, locales[i])) {
        return true;
      }
    }
    return false;
  }
  function format(ast) {
    const msg = (ctx) => formatParts(ctx, ast);
    return msg;
  }
  function formatParts(ctx, ast) {
    const body = resolveBody(ast);
    if (body == null) {
      throw createUnhandleNodeError(
        0
        /* NodeTypes.Resource */
      );
    }
    const type = resolveType(body);
    if (type === 1) {
      const plural = body;
      const cases = resolveCases(plural);
      return ctx.plural(cases.reduce((messages, c) => [
        ...messages,
        formatMessageParts(ctx, c)
      ], []));
    } else {
      return formatMessageParts(ctx, body);
    }
  }
  function formatMessageParts(ctx, node) {
    const static_ = resolveStatic(node);
    if (static_ != null) {
      return ctx.type === "text" ? static_ : ctx.normalize([static_]);
    } else {
      const messages = resolveItems(node).reduce((acm, c) => [...acm, formatMessagePart(ctx, c)], []);
      return ctx.normalize(messages);
    }
  }
  function formatMessagePart(ctx, node) {
    const type = resolveType(node);
    switch (type) {
      case 3: {
        return resolveValue$1(node, type);
      }
      case 9: {
        return resolveValue$1(node, type);
      }
      case 4: {
        const named = node;
        if (hasOwn(named, "k") && named.k) {
          return ctx.interpolate(ctx.named(named.k));
        }
        if (hasOwn(named, "key") && named.key) {
          return ctx.interpolate(ctx.named(named.key));
        }
        throw createUnhandleNodeError(type);
      }
      case 5: {
        const list = node;
        if (hasOwn(list, "i") && isNumber(list.i)) {
          return ctx.interpolate(ctx.list(list.i));
        }
        if (hasOwn(list, "index") && isNumber(list.index)) {
          return ctx.interpolate(ctx.list(list.index));
        }
        throw createUnhandleNodeError(type);
      }
      case 6: {
        const linked = node;
        const modifier = resolveLinkedModifier(linked);
        const key = resolveLinkedKey(linked);
        return ctx.linked(formatMessagePart(ctx, key), modifier ? formatMessagePart(ctx, modifier) : void 0, ctx.type);
      }
      case 7: {
        return resolveValue$1(node, type);
      }
      case 8: {
        return resolveValue$1(node, type);
      }
      default:
        throw new Error(`unhandled node on format message part: ${type}`);
    }
  }
  const defaultOnCacheKey = (message) => message;
  let compileCache = create();
  function baseCompile(message, options = {}) {
    let detectError = false;
    const onError = options.onError || defaultOnError;
    options.onError = (err) => {
      detectError = true;
      onError(err);
    };
    return { ...baseCompile$1(message, options), detectError };
  }
  const compileToFunction = /* @__NO_SIDE_EFFECTS__ */ (message, context) => {
    if (!isString$1(message)) {
      throw createCoreError(CoreErrorCodes.NOT_SUPPORT_NON_STRING_MESSAGE);
    }
    {
      isBoolean(context.warnHtmlMessage) ? context.warnHtmlMessage : true;
      const onCacheKey = context.onCacheKey || defaultOnCacheKey;
      const cacheKey = onCacheKey(message);
      const cached = compileCache[cacheKey];
      if (cached) {
        return cached;
      }
      const { code: code2, detectError } = baseCompile(message, context);
      const msg = new Function(`return ${code2}`)();
      return !detectError ? compileCache[cacheKey] = msg : msg;
    }
  };
  function compile(message, context) {
    if (__INTLIFY_JIT_COMPILATION__ && !__INTLIFY_DROP_MESSAGE_COMPILER__ && isString$1(message)) {
      isBoolean(context.warnHtmlMessage) ? context.warnHtmlMessage : true;
      const onCacheKey = context.onCacheKey || defaultOnCacheKey;
      const cacheKey = onCacheKey(message);
      const cached = compileCache[cacheKey];
      if (cached) {
        return cached;
      }
      const { ast, detectError } = baseCompile(message, {
        ...context,
        location: false,
        jit: true
      });
      const msg = format(ast);
      return !detectError ? compileCache[cacheKey] = msg : msg;
    } else {
      const cacheKey = message.cacheKey;
      if (cacheKey) {
        const cached = compileCache[cacheKey];
        if (cached) {
          return cached;
        }
        return compileCache[cacheKey] = format(message);
      } else {
        return format(message);
      }
    }
  }
  const NOOP_MESSAGE_FUNCTION = () => "";
  const isMessageFunction = (val) => isFunction(val);
  function translate(context, ...args) {
    const { fallbackFormat, postTranslation, unresolving, messageCompiler, fallbackLocale, messages } = context;
    const [key, options] = parseTranslateArgs(...args);
    const missingWarn = isBoolean(options.missingWarn) ? options.missingWarn : context.missingWarn;
    const fallbackWarn = isBoolean(options.fallbackWarn) ? options.fallbackWarn : context.fallbackWarn;
    const escapeParameter = isBoolean(options.escapeParameter) ? options.escapeParameter : context.escapeParameter;
    const resolvedMessage = !!options.resolvedMessage;
    const defaultMsgOrKey = isString$1(options.default) || isBoolean(options.default) ? !isBoolean(options.default) ? options.default : !messageCompiler ? () => key : key : fallbackFormat ? !messageCompiler ? () => key : key : "";
    const enableDefaultMsg = fallbackFormat || defaultMsgOrKey !== "";
    const locale = getLocale(context, options);
    escapeParameter && escapeParams(options);
    let [formatScope, targetLocale, message] = !resolvedMessage ? resolveMessageFormat(context, key, locale, fallbackLocale, fallbackWarn, missingWarn) : [
      key,
      locale,
      messages[locale] || create()
    ];
    let format2 = formatScope;
    let cacheBaseKey = key;
    if (!resolvedMessage && !(isString$1(format2) || isMessageAST(format2) || isMessageFunction(format2))) {
      if (enableDefaultMsg) {
        format2 = defaultMsgOrKey;
        cacheBaseKey = format2;
      }
    }
    if (!resolvedMessage && (!(isString$1(format2) || isMessageAST(format2) || isMessageFunction(format2)) || !isString$1(targetLocale))) {
      return unresolving ? NOT_REOSLVED : key;
    }
    let occurred = false;
    const onError = () => {
      occurred = true;
    };
    const msg = !isMessageFunction(format2) ? compileMessageFormat(context, key, targetLocale, format2, cacheBaseKey, onError) : format2;
    if (occurred) {
      return format2;
    }
    const ctxOptions = getMessageContextOptions(context, targetLocale, message, options);
    const msgContext = createMessageContext(ctxOptions);
    const messaged = evaluateMessage(context, msg, msgContext);
    let ret = postTranslation ? postTranslation(messaged, key) : messaged;
    if (escapeParameter && isString$1(ret)) {
      ret = sanitizeTranslatedHtml(ret);
    }
    return ret;
  }
  function escapeParams(options) {
    if (isArray(options.list)) {
      options.list = options.list.map((item) => isString$1(item) ? escapeHtml(item) : item);
    } else if (isObject$1(options.named)) {
      Object.keys(options.named).forEach((key) => {
        if (isString$1(options.named[key])) {
          options.named[key] = escapeHtml(options.named[key]);
        }
      });
    }
  }
  function resolveMessageFormat(context, key, locale, fallbackLocale, fallbackWarn, missingWarn) {
    const { messages, onWarn, messageResolver: resolveValue2, localeFallbacker } = context;
    const locales = localeFallbacker(context, fallbackLocale, locale);
    let message = create();
    let targetLocale;
    let format2 = null;
    const type = "translate";
    for (let i = 0; i < locales.length; i++) {
      targetLocale = locales[i];
      message = messages[targetLocale] || create();
      if ((format2 = resolveValue2(message, key)) === null) {
        format2 = message[key];
      }
      if (isString$1(format2) || isMessageAST(format2) || isMessageFunction(format2)) {
        break;
      }
      if (!isImplicitFallback(targetLocale, locales)) {
        const missingRet = handleMissing(
          context,
          // eslint-disable-line @typescript-eslint/no-explicit-any
          key,
          targetLocale,
          missingWarn,
          type
        );
        if (missingRet !== key) {
          format2 = missingRet;
        }
      }
    }
    return [format2, targetLocale, message];
  }
  function compileMessageFormat(context, key, targetLocale, format2, cacheBaseKey, onError) {
    const { messageCompiler, warnHtmlMessage } = context;
    if (isMessageFunction(format2)) {
      const msg2 = format2;
      msg2.locale = msg2.locale || targetLocale;
      msg2.key = msg2.key || key;
      return msg2;
    }
    if (messageCompiler == null) {
      const msg2 = () => format2;
      msg2.locale = targetLocale;
      msg2.key = key;
      return msg2;
    }
    const msg = messageCompiler(format2, getCompileContext(context, targetLocale, cacheBaseKey, format2, warnHtmlMessage, onError));
    msg.locale = targetLocale;
    msg.key = key;
    msg.source = format2;
    return msg;
  }
  function evaluateMessage(context, msg, msgCtx) {
    const messaged = msg(msgCtx);
    return messaged;
  }
  function parseTranslateArgs(...args) {
    const [arg1, arg2, arg3] = args;
    const options = create();
    if (!isString$1(arg1) && !isNumber(arg1) && !isMessageFunction(arg1) && !isMessageAST(arg1)) {
      throw createCoreError(CoreErrorCodes.INVALID_ARGUMENT);
    }
    const key = isNumber(arg1) ? String(arg1) : isMessageFunction(arg1) ? arg1 : arg1;
    if (isNumber(arg2)) {
      options.plural = arg2;
    } else if (isString$1(arg2)) {
      options.default = arg2;
    } else if (isPlainObject(arg2) && !isEmptyObject(arg2)) {
      options.named = arg2;
    } else if (isArray(arg2)) {
      options.list = arg2;
    }
    if (isNumber(arg3)) {
      options.plural = arg3;
    } else if (isString$1(arg3)) {
      options.default = arg3;
    } else if (isPlainObject(arg3)) {
      assign$1(options, arg3);
    }
    return [key, options];
  }
  function getCompileContext(context, locale, key, source, warnHtmlMessage, onError) {
    return {
      locale,
      key,
      warnHtmlMessage,
      onError: (err) => {
        onError && onError(err);
        {
          throw err;
        }
      },
      onCacheKey: (source2) => generateFormatCacheKey(locale, key, source2)
    };
  }
  function getMessageContextOptions(context, locale, message, options) {
    const { modifiers, pluralRules, messageResolver: resolveValue2, fallbackLocale, fallbackWarn, missingWarn, fallbackContext } = context;
    const resolveMessage = (key) => {
      let val = resolveValue2(message, key);
      if (val == null && fallbackContext) {
        const [, , message2] = resolveMessageFormat(fallbackContext, key, locale, fallbackLocale, fallbackWarn, missingWarn);
        val = resolveValue2(message2, key);
      }
      if (isString$1(val) || isMessageAST(val)) {
        let occurred = false;
        const onError = () => {
          occurred = true;
        };
        const msg = compileMessageFormat(context, key, locale, val, key, onError);
        return !occurred ? msg : NOOP_MESSAGE_FUNCTION;
      } else if (isMessageFunction(val)) {
        return val;
      } else {
        return NOOP_MESSAGE_FUNCTION;
      }
    };
    const ctxOptions = {
      locale,
      modifiers,
      pluralRules,
      messages: resolveMessage
    };
    if (context.processor) {
      ctxOptions.processor = context.processor;
    }
    if (options.list) {
      ctxOptions.list = options.list;
    }
    if (options.named) {
      ctxOptions.named = options.named;
    }
    if (isNumber(options.plural)) {
      ctxOptions.pluralIndex = options.plural;
    }
    return ctxOptions;
  }
  function datetime(context, ...args) {
    const { datetimeFormats, unresolving, fallbackLocale, onWarn, localeFallbacker } = context;
    const { __datetimeFormatters } = context;
    const [key, value, options, overrides] = parseDateTimeArgs(...args);
    const missingWarn = isBoolean(options.missingWarn) ? options.missingWarn : context.missingWarn;
    isBoolean(options.fallbackWarn) ? options.fallbackWarn : context.fallbackWarn;
    const part = !!options.part;
    const locale = getLocale(context, options);
    const locales = localeFallbacker(
      context,
      // eslint-disable-line @typescript-eslint/no-explicit-any
      fallbackLocale,
      locale
    );
    if (!isString$1(key) || key === "") {
      return new Intl.DateTimeFormat(locale, overrides).format(value);
    }
    let datetimeFormat = {};
    let targetLocale;
    let format2 = null;
    const type = "datetime format";
    for (let i = 0; i < locales.length; i++) {
      targetLocale = locales[i];
      datetimeFormat = datetimeFormats[targetLocale] || {};
      format2 = datetimeFormat[key];
      if (isPlainObject(format2))
        break;
      handleMissing(context, key, targetLocale, missingWarn, type);
    }
    if (!isPlainObject(format2) || !isString$1(targetLocale)) {
      return unresolving ? NOT_REOSLVED : key;
    }
    let id = `${targetLocale}__${key}`;
    if (!isEmptyObject(overrides)) {
      id = `${id}__${JSON.stringify(overrides)}`;
    }
    let formatter = __datetimeFormatters.get(id);
    if (!formatter) {
      formatter = new Intl.DateTimeFormat(targetLocale, assign$1({}, format2, overrides));
      __datetimeFormatters.set(id, formatter);
    }
    return !part ? formatter.format(value) : formatter.formatToParts(value);
  }
  const DATETIME_FORMAT_OPTIONS_KEYS = [
    "localeMatcher",
    "weekday",
    "era",
    "year",
    "month",
    "day",
    "hour",
    "minute",
    "second",
    "timeZoneName",
    "formatMatcher",
    "hour12",
    "timeZone",
    "dateStyle",
    "timeStyle",
    "calendar",
    "dayPeriod",
    "numberingSystem",
    "hourCycle",
    "fractionalSecondDigits"
  ];
  function parseDateTimeArgs(...args) {
    const [arg1, arg2, arg3, arg4] = args;
    const options = create();
    let overrides = create();
    let value;
    if (isString$1(arg1)) {
      const matches = arg1.match(/(\d{4}-\d{2}-\d{2})(T|\s)?(.*)/);
      if (!matches) {
        throw createCoreError(CoreErrorCodes.INVALID_ISO_DATE_ARGUMENT);
      }
      const dateTime = matches[3] ? matches[3].trim().startsWith("T") ? `${matches[1].trim()}${matches[3].trim()}` : `${matches[1].trim()}T${matches[3].trim()}` : matches[1].trim();
      value = new Date(dateTime);
      try {
        value.toISOString();
      } catch (e) {
        throw createCoreError(CoreErrorCodes.INVALID_ISO_DATE_ARGUMENT);
      }
    } else if (isDate(arg1)) {
      if (isNaN(arg1.getTime())) {
        throw createCoreError(CoreErrorCodes.INVALID_DATE_ARGUMENT);
      }
      value = arg1;
    } else if (isNumber(arg1)) {
      value = arg1;
    } else {
      throw createCoreError(CoreErrorCodes.INVALID_ARGUMENT);
    }
    if (isString$1(arg2)) {
      options.key = arg2;
    } else if (isPlainObject(arg2)) {
      Object.keys(arg2).forEach((key) => {
        if (DATETIME_FORMAT_OPTIONS_KEYS.includes(key)) {
          overrides[key] = arg2[key];
        } else {
          options[key] = arg2[key];
        }
      });
    }
    if (isString$1(arg3)) {
      options.locale = arg3;
    } else if (isPlainObject(arg3)) {
      overrides = arg3;
    }
    if (isPlainObject(arg4)) {
      overrides = arg4;
    }
    return [options.key || "", value, options, overrides];
  }
  function clearDateTimeFormat(ctx, locale, format2) {
    const context = ctx;
    for (const key in format2) {
      const id = `${locale}__${key}`;
      if (!context.__datetimeFormatters.has(id)) {
        continue;
      }
      context.__datetimeFormatters.delete(id);
    }
  }
  function number(context, ...args) {
    const { numberFormats, unresolving, fallbackLocale, onWarn, localeFallbacker } = context;
    const { __numberFormatters } = context;
    const [key, value, options, overrides] = parseNumberArgs(...args);
    const missingWarn = isBoolean(options.missingWarn) ? options.missingWarn : context.missingWarn;
    isBoolean(options.fallbackWarn) ? options.fallbackWarn : context.fallbackWarn;
    const part = !!options.part;
    const locale = getLocale(context, options);
    const locales = localeFallbacker(
      context,
      // eslint-disable-line @typescript-eslint/no-explicit-any
      fallbackLocale,
      locale
    );
    if (!isString$1(key) || key === "") {
      return new Intl.NumberFormat(locale, overrides).format(value);
    }
    let numberFormat = {};
    let targetLocale;
    let format2 = null;
    const type = "number format";
    for (let i = 0; i < locales.length; i++) {
      targetLocale = locales[i];
      numberFormat = numberFormats[targetLocale] || {};
      format2 = numberFormat[key];
      if (isPlainObject(format2))
        break;
      handleMissing(context, key, targetLocale, missingWarn, type);
    }
    if (!isPlainObject(format2) || !isString$1(targetLocale)) {
      return unresolving ? NOT_REOSLVED : key;
    }
    let id = `${targetLocale}__${key}`;
    if (!isEmptyObject(overrides)) {
      id = `${id}__${JSON.stringify(overrides)}`;
    }
    let formatter = __numberFormatters.get(id);
    if (!formatter) {
      formatter = new Intl.NumberFormat(targetLocale, assign$1({}, format2, overrides));
      __numberFormatters.set(id, formatter);
    }
    return !part ? formatter.format(value) : formatter.formatToParts(value);
  }
  const NUMBER_FORMAT_OPTIONS_KEYS = [
    "localeMatcher",
    "style",
    "currency",
    "currencyDisplay",
    "currencySign",
    "useGrouping",
    "minimumIntegerDigits",
    "minimumFractionDigits",
    "maximumFractionDigits",
    "minimumSignificantDigits",
    "maximumSignificantDigits",
    "compactDisplay",
    "notation",
    "signDisplay",
    "unit",
    "unitDisplay",
    "roundingMode",
    "roundingPriority",
    "roundingIncrement",
    "trailingZeroDisplay"
  ];
  function parseNumberArgs(...args) {
    const [arg1, arg2, arg3, arg4] = args;
    const options = create();
    let overrides = create();
    if (!isNumber(arg1)) {
      throw createCoreError(CoreErrorCodes.INVALID_ARGUMENT);
    }
    const value = arg1;
    if (isString$1(arg2)) {
      options.key = arg2;
    } else if (isPlainObject(arg2)) {
      Object.keys(arg2).forEach((key) => {
        if (NUMBER_FORMAT_OPTIONS_KEYS.includes(key)) {
          overrides[key] = arg2[key];
        } else {
          options[key] = arg2[key];
        }
      });
    }
    if (isString$1(arg3)) {
      options.locale = arg3;
    } else if (isPlainObject(arg3)) {
      overrides = arg3;
    }
    if (isPlainObject(arg4)) {
      overrides = arg4;
    }
    return [options.key || "", value, options, overrides];
  }
  function clearNumberFormat(ctx, locale, format2) {
    const context = ctx;
    for (const key in format2) {
      const id = `${locale}__${key}`;
      if (!context.__numberFormatters.has(id)) {
        continue;
      }
      context.__numberFormatters.delete(id);
    }
  }
  {
    initFeatureFlags$1();
  }
  /*!
    * vue-i18n v9.14.5
    * (c) 2025 kazuya kawaguchi
    * Released under the MIT License.
    */
  const VERSION = "9.14.5";
  function initFeatureFlags() {
    if (typeof __INTLIFY_JIT_COMPILATION__ !== "boolean") {
      getGlobalThis().__INTLIFY_JIT_COMPILATION__ = false;
    }
    if (typeof __INTLIFY_DROP_MESSAGE_COMPILER__ !== "boolean") {
      getGlobalThis().__INTLIFY_DROP_MESSAGE_COMPILER__ = false;
    }
  }
  const code$1 = CoreWarnCodes.__EXTEND_POINT__;
  const inc$1 = incrementer(code$1);
  ({
    // 9
    NOT_SUPPORTED_PRESERVE: inc$1(),
    // 10
    NOT_SUPPORTED_FORMATTER: inc$1(),
    // 11
    NOT_SUPPORTED_PRESERVE_DIRECTIVE: inc$1(),
    // 12
    NOT_SUPPORTED_GET_CHOICE_INDEX: inc$1(),
    // 13
    COMPONENT_NAME_LEGACY_COMPATIBLE: inc$1(),
    // 14
    NOT_FOUND_PARENT_SCOPE: inc$1(),
    // 15
    IGNORE_OBJ_FLATTEN: inc$1(),
    // 16
    NOTICE_DROP_ALLOW_COMPOSITION: inc$1(),
    // 17
    NOTICE_DROP_TRANSLATE_EXIST_COMPATIBLE_FLAG: inc$1()
    // 18
  });
  const code = CoreErrorCodes.__EXTEND_POINT__;
  const inc = incrementer(code);
  const I18nErrorCodes = {
    // composer module errors
    UNEXPECTED_RETURN_TYPE: code,
    // 24
    // legacy module errors
    INVALID_ARGUMENT: inc(),
    // 25
    // i18n module errors
    MUST_BE_CALL_SETUP_TOP: inc(),
    // 26
    NOT_INSTALLED: inc(),
    // 27
    NOT_AVAILABLE_IN_LEGACY_MODE: inc(),
    // 28
    // directive module errors
    REQUIRED_VALUE: inc(),
    // 29
    INVALID_VALUE: inc(),
    // 30
    // vue-devtools errors
    CANNOT_SETUP_VUE_DEVTOOLS_PLUGIN: inc(),
    // 31
    NOT_INSTALLED_WITH_PROVIDE: inc(),
    // 32
    // unexpected error
    UNEXPECTED_ERROR: inc(),
    // 33
    // not compatible legacy vue-i18n constructor
    NOT_COMPATIBLE_LEGACY_VUE_I18N: inc(),
    // 34
    // bridge support vue 2.x only
    BRIDGE_SUPPORT_VUE_2_ONLY: inc(),
    // 35
    // need to define `i18n` option in `allowComposition: true` and `useScope: 'local' at `useI18n``
    MUST_DEFINE_I18N_OPTION_IN_ALLOW_COMPOSITION: inc(),
    // 36
    // Not available Compostion API in Legacy API mode. Please make sure that the legacy API mode is working properly
    NOT_AVAILABLE_COMPOSITION_IN_LEGACY: inc(),
    // 37
    // for enhancement
    __EXTEND_POINT__: inc()
    // 38
  };
  function createI18nError(code2, ...args) {
    return createCompileError(code2, null, void 0);
  }
  const TranslateVNodeSymbol = /* @__PURE__ */ makeSymbol("__translateVNode");
  const DatetimePartsSymbol = /* @__PURE__ */ makeSymbol("__datetimeParts");
  const NumberPartsSymbol = /* @__PURE__ */ makeSymbol("__numberParts");
  const SetPluralRulesSymbol = makeSymbol("__setPluralRules");
  const InejctWithOptionSymbol = /* @__PURE__ */ makeSymbol("__injectWithOption");
  const DisposeSymbol = /* @__PURE__ */ makeSymbol("__dispose");
  function handleFlatJson(obj) {
    if (!isObject$1(obj)) {
      return obj;
    }
    if (isMessageAST(obj)) {
      return obj;
    }
    for (const key in obj) {
      if (!hasOwn(obj, key)) {
        continue;
      }
      if (!key.includes(".")) {
        if (isObject$1(obj[key])) {
          handleFlatJson(obj[key]);
        }
      } else {
        const subKeys = key.split(".");
        const lastIndex = subKeys.length - 1;
        let currentObj = obj;
        let hasStringValue = false;
        for (let i = 0; i < lastIndex; i++) {
          if (subKeys[i] === "__proto__") {
            throw new Error(`unsafe key: ${subKeys[i]}`);
          }
          if (!(subKeys[i] in currentObj)) {
            currentObj[subKeys[i]] = create();
          }
          if (!isObject$1(currentObj[subKeys[i]])) {
            hasStringValue = true;
            break;
          }
          currentObj = currentObj[subKeys[i]];
        }
        if (!hasStringValue) {
          if (!isMessageAST(currentObj)) {
            currentObj[subKeys[lastIndex]] = obj[key];
            delete obj[key];
          } else {
            if (!AST_NODE_PROPS_KEYS.includes(subKeys[lastIndex])) {
              delete obj[key];
            }
          }
        }
        if (!isMessageAST(currentObj)) {
          const target = currentObj[subKeys[lastIndex]];
          if (isObject$1(target)) {
            handleFlatJson(target);
          }
        }
      }
    }
    return obj;
  }
  function getLocaleMessages(locale, options) {
    const { messages, __i18n, messageResolver, flatJson } = options;
    const ret = isPlainObject(messages) ? messages : isArray(__i18n) ? create() : { [locale]: create() };
    if (isArray(__i18n)) {
      __i18n.forEach((custom) => {
        if ("locale" in custom && "resource" in custom) {
          const { locale: locale2, resource } = custom;
          if (locale2) {
            ret[locale2] = ret[locale2] || create();
            deepCopy(resource, ret[locale2]);
          } else {
            deepCopy(resource, ret);
          }
        } else {
          isString$1(custom) && deepCopy(JSON.parse(custom), ret);
        }
      });
    }
    if (messageResolver == null && flatJson) {
      for (const key in ret) {
        if (hasOwn(ret, key)) {
          handleFlatJson(ret[key]);
        }
      }
    }
    return ret;
  }
  function getComponentOptions(instance) {
    return instance.type;
  }
  function adjustI18nResources(gl, options, componentOptions) {
    let messages = isObject$1(options.messages) ? options.messages : create();
    if ("__i18nGlobal" in componentOptions) {
      messages = getLocaleMessages(gl.locale.value, {
        messages,
        __i18n: componentOptions.__i18nGlobal
      });
    }
    const locales = Object.keys(messages);
    if (locales.length) {
      locales.forEach((locale) => {
        gl.mergeLocaleMessage(locale, messages[locale]);
      });
    }
    {
      if (isObject$1(options.datetimeFormats)) {
        const locales2 = Object.keys(options.datetimeFormats);
        if (locales2.length) {
          locales2.forEach((locale) => {
            gl.mergeDateTimeFormat(locale, options.datetimeFormats[locale]);
          });
        }
      }
      if (isObject$1(options.numberFormats)) {
        const locales2 = Object.keys(options.numberFormats);
        if (locales2.length) {
          locales2.forEach((locale) => {
            gl.mergeNumberFormat(locale, options.numberFormats[locale]);
          });
        }
      }
    }
  }
  function createTextNode(key) {
    return vue.createVNode(vue.Text, null, key, 0);
  }
  const DEVTOOLS_META = "__INTLIFY_META__";
  const NOOP_RETURN_ARRAY = () => [];
  const NOOP_RETURN_FALSE = () => false;
  let composerID = 0;
  function defineCoreMissingHandler(missing) {
    return (ctx, locale, key, type) => {
      return missing(locale, key, vue.getCurrentInstance() || void 0, type);
    };
  }
  const getMetaInfo = /* @__NO_SIDE_EFFECTS__ */ () => {
    const instance = vue.getCurrentInstance();
    let meta = null;
    return instance && (meta = getComponentOptions(instance)[DEVTOOLS_META]) ? { [DEVTOOLS_META]: meta } : null;
  };
  function createComposer(options = {}, VueI18nLegacy) {
    const { __root, __injectWithOption } = options;
    const _isGlobal = __root === void 0;
    const flatJson = options.flatJson;
    const _ref = inBrowser ? vue.ref : vue.shallowRef;
    const translateExistCompatible = !!options.translateExistCompatible;
    let _inheritLocale = isBoolean(options.inheritLocale) ? options.inheritLocale : true;
    const _locale = _ref(
      // prettier-ignore
      __root && _inheritLocale ? __root.locale.value : isString$1(options.locale) ? options.locale : DEFAULT_LOCALE
    );
    const _fallbackLocale = _ref(
      // prettier-ignore
      __root && _inheritLocale ? __root.fallbackLocale.value : isString$1(options.fallbackLocale) || isArray(options.fallbackLocale) || isPlainObject(options.fallbackLocale) || options.fallbackLocale === false ? options.fallbackLocale : _locale.value
    );
    const _messages = _ref(getLocaleMessages(_locale.value, options));
    const _datetimeFormats = _ref(isPlainObject(options.datetimeFormats) ? options.datetimeFormats : { [_locale.value]: {} });
    const _numberFormats = _ref(isPlainObject(options.numberFormats) ? options.numberFormats : { [_locale.value]: {} });
    let _missingWarn = __root ? __root.missingWarn : isBoolean(options.missingWarn) || isRegExp(options.missingWarn) ? options.missingWarn : true;
    let _fallbackWarn = __root ? __root.fallbackWarn : isBoolean(options.fallbackWarn) || isRegExp(options.fallbackWarn) ? options.fallbackWarn : true;
    let _fallbackRoot = __root ? __root.fallbackRoot : isBoolean(options.fallbackRoot) ? options.fallbackRoot : true;
    let _fallbackFormat = !!options.fallbackFormat;
    let _missing = isFunction(options.missing) ? options.missing : null;
    let _runtimeMissing = isFunction(options.missing) ? defineCoreMissingHandler(options.missing) : null;
    let _postTranslation = isFunction(options.postTranslation) ? options.postTranslation : null;
    let _warnHtmlMessage = __root ? __root.warnHtmlMessage : isBoolean(options.warnHtmlMessage) ? options.warnHtmlMessage : true;
    let _escapeParameter = !!options.escapeParameter;
    const _modifiers = __root ? __root.modifiers : isPlainObject(options.modifiers) ? options.modifiers : {};
    let _pluralRules = options.pluralRules || __root && __root.pluralRules;
    let _context;
    const getCoreContext = () => {
      _isGlobal && setFallbackContext(null);
      const ctxOptions = {
        version: VERSION,
        locale: _locale.value,
        fallbackLocale: _fallbackLocale.value,
        messages: _messages.value,
        modifiers: _modifiers,
        pluralRules: _pluralRules,
        missing: _runtimeMissing === null ? void 0 : _runtimeMissing,
        missingWarn: _missingWarn,
        fallbackWarn: _fallbackWarn,
        fallbackFormat: _fallbackFormat,
        unresolving: true,
        postTranslation: _postTranslation === null ? void 0 : _postTranslation,
        warnHtmlMessage: _warnHtmlMessage,
        escapeParameter: _escapeParameter,
        messageResolver: options.messageResolver,
        messageCompiler: options.messageCompiler,
        __meta: { framework: "vue" }
      };
      {
        ctxOptions.datetimeFormats = _datetimeFormats.value;
        ctxOptions.numberFormats = _numberFormats.value;
        ctxOptions.__datetimeFormatters = isPlainObject(_context) ? _context.__datetimeFormatters : void 0;
        ctxOptions.__numberFormatters = isPlainObject(_context) ? _context.__numberFormatters : void 0;
      }
      const ctx = createCoreContext(ctxOptions);
      _isGlobal && setFallbackContext(ctx);
      return ctx;
    };
    _context = getCoreContext();
    updateFallbackLocale(_context, _locale.value, _fallbackLocale.value);
    function trackReactivityValues() {
      return [
        _locale.value,
        _fallbackLocale.value,
        _messages.value,
        _datetimeFormats.value,
        _numberFormats.value
      ];
    }
    const locale = vue.computed({
      get: () => _locale.value,
      set: (val) => {
        _locale.value = val;
        _context.locale = _locale.value;
      }
    });
    const fallbackLocale = vue.computed({
      get: () => _fallbackLocale.value,
      set: (val) => {
        _fallbackLocale.value = val;
        _context.fallbackLocale = _fallbackLocale.value;
        updateFallbackLocale(_context, _locale.value, val);
      }
    });
    const messages = vue.computed(() => _messages.value);
    const datetimeFormats = /* @__PURE__ */ vue.computed(() => _datetimeFormats.value);
    const numberFormats = /* @__PURE__ */ vue.computed(() => _numberFormats.value);
    function getPostTranslationHandler() {
      return isFunction(_postTranslation) ? _postTranslation : null;
    }
    function setPostTranslationHandler(handler) {
      _postTranslation = handler;
      _context.postTranslation = handler;
    }
    function getMissingHandler() {
      return _missing;
    }
    function setMissingHandler(handler) {
      if (handler !== null) {
        _runtimeMissing = defineCoreMissingHandler(handler);
      }
      _missing = handler;
      _context.missing = _runtimeMissing;
    }
    const wrapWithDeps = (fn, argumentParser, warnType, fallbackSuccess, fallbackFail, successCondition) => {
      trackReactivityValues();
      let ret;
      try {
        if (false) ;
        if (!_isGlobal) {
          _context.fallbackContext = __root ? getFallbackContext() : void 0;
        }
        ret = fn(_context);
      } finally {
        if (!_isGlobal) {
          _context.fallbackContext = void 0;
        }
      }
      if (warnType !== "translate exists" && // for not `te` (e.g `t`)
      isNumber(ret) && ret === NOT_REOSLVED || warnType === "translate exists" && !ret) {
        const [key, arg2] = argumentParser();
        return __root && _fallbackRoot ? fallbackSuccess(__root) : fallbackFail(key);
      } else if (successCondition(ret)) {
        return ret;
      } else {
        throw createI18nError(I18nErrorCodes.UNEXPECTED_RETURN_TYPE);
      }
    };
    function t2(...args) {
      return wrapWithDeps((context) => Reflect.apply(translate, null, [context, ...args]), () => parseTranslateArgs(...args), "translate", (root) => Reflect.apply(root.t, root, [...args]), (key) => key, (val) => isString$1(val));
    }
    function rt(...args) {
      const [arg1, arg2, arg3] = args;
      if (arg3 && !isObject$1(arg3)) {
        throw createI18nError(I18nErrorCodes.INVALID_ARGUMENT);
      }
      return t2(...[arg1, arg2, assign$1({ resolvedMessage: true }, arg3 || {})]);
    }
    function d(...args) {
      return wrapWithDeps((context) => Reflect.apply(datetime, null, [context, ...args]), () => parseDateTimeArgs(...args), "datetime format", (root) => Reflect.apply(root.d, root, [...args]), () => MISSING_RESOLVE_VALUE, (val) => isString$1(val));
    }
    function n(...args) {
      return wrapWithDeps((context) => Reflect.apply(number, null, [context, ...args]), () => parseNumberArgs(...args), "number format", (root) => Reflect.apply(root.n, root, [...args]), () => MISSING_RESOLVE_VALUE, (val) => isString$1(val));
    }
    function normalize(values) {
      return values.map((val) => isString$1(val) || isNumber(val) || isBoolean(val) ? createTextNode(String(val)) : val);
    }
    const interpolate = (val) => val;
    const processor = {
      normalize,
      interpolate,
      type: "vnode"
    };
    function translateVNode(...args) {
      return wrapWithDeps(
        (context) => {
          let ret;
          const _context2 = context;
          try {
            _context2.processor = processor;
            ret = Reflect.apply(translate, null, [_context2, ...args]);
          } finally {
            _context2.processor = null;
          }
          return ret;
        },
        () => parseTranslateArgs(...args),
        "translate",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (root) => root[TranslateVNodeSymbol](...args),
        (key) => [createTextNode(key)],
        (val) => isArray(val)
      );
    }
    function numberParts(...args) {
      return wrapWithDeps(
        (context) => Reflect.apply(number, null, [context, ...args]),
        () => parseNumberArgs(...args),
        "number format",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (root) => root[NumberPartsSymbol](...args),
        NOOP_RETURN_ARRAY,
        (val) => isString$1(val) || isArray(val)
      );
    }
    function datetimeParts(...args) {
      return wrapWithDeps(
        (context) => Reflect.apply(datetime, null, [context, ...args]),
        () => parseDateTimeArgs(...args),
        "datetime format",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (root) => root[DatetimePartsSymbol](...args),
        NOOP_RETURN_ARRAY,
        (val) => isString$1(val) || isArray(val)
      );
    }
    function setPluralRules(rules) {
      _pluralRules = rules;
      _context.pluralRules = _pluralRules;
    }
    function te(key, locale2) {
      return wrapWithDeps(() => {
        if (!key) {
          return false;
        }
        const targetLocale = isString$1(locale2) ? locale2 : _locale.value;
        const message = getLocaleMessage(targetLocale);
        const resolved = _context.messageResolver(message, key);
        return !translateExistCompatible ? isMessageAST(resolved) || isMessageFunction(resolved) || isString$1(resolved) : resolved != null;
      }, () => [key], "translate exists", (root) => {
        return Reflect.apply(root.te, root, [key, locale2]);
      }, NOOP_RETURN_FALSE, (val) => isBoolean(val));
    }
    function resolveMessages(key) {
      let messages2 = null;
      const locales = fallbackWithLocaleChain(_context, _fallbackLocale.value, _locale.value);
      for (let i = 0; i < locales.length; i++) {
        const targetLocaleMessages = _messages.value[locales[i]] || {};
        const messageValue = _context.messageResolver(targetLocaleMessages, key);
        if (messageValue != null) {
          messages2 = messageValue;
          break;
        }
      }
      return messages2;
    }
    function tm(key) {
      const messages2 = resolveMessages(key);
      return messages2 != null ? messages2 : __root ? __root.tm(key) || {} : {};
    }
    function getLocaleMessage(locale2) {
      return _messages.value[locale2] || {};
    }
    function setLocaleMessage(locale2, message) {
      if (flatJson) {
        const _message = { [locale2]: message };
        for (const key in _message) {
          if (hasOwn(_message, key)) {
            handleFlatJson(_message[key]);
          }
        }
        message = _message[locale2];
      }
      _messages.value[locale2] = message;
      _context.messages = _messages.value;
    }
    function mergeLocaleMessage(locale2, message) {
      _messages.value[locale2] = _messages.value[locale2] || {};
      const _message = { [locale2]: message };
      if (flatJson) {
        for (const key in _message) {
          if (hasOwn(_message, key)) {
            handleFlatJson(_message[key]);
          }
        }
      }
      message = _message[locale2];
      deepCopy(message, _messages.value[locale2]);
      _context.messages = _messages.value;
    }
    function getDateTimeFormat(locale2) {
      return _datetimeFormats.value[locale2] || {};
    }
    function setDateTimeFormat(locale2, format2) {
      _datetimeFormats.value[locale2] = format2;
      _context.datetimeFormats = _datetimeFormats.value;
      clearDateTimeFormat(_context, locale2, format2);
    }
    function mergeDateTimeFormat(locale2, format2) {
      _datetimeFormats.value[locale2] = assign$1(_datetimeFormats.value[locale2] || {}, format2);
      _context.datetimeFormats = _datetimeFormats.value;
      clearDateTimeFormat(_context, locale2, format2);
    }
    function getNumberFormat(locale2) {
      return _numberFormats.value[locale2] || {};
    }
    function setNumberFormat(locale2, format2) {
      _numberFormats.value[locale2] = format2;
      _context.numberFormats = _numberFormats.value;
      clearNumberFormat(_context, locale2, format2);
    }
    function mergeNumberFormat(locale2, format2) {
      _numberFormats.value[locale2] = assign$1(_numberFormats.value[locale2] || {}, format2);
      _context.numberFormats = _numberFormats.value;
      clearNumberFormat(_context, locale2, format2);
    }
    composerID++;
    if (__root && inBrowser) {
      vue.watch(__root.locale, (val) => {
        if (_inheritLocale) {
          _locale.value = val;
          _context.locale = val;
          updateFallbackLocale(_context, _locale.value, _fallbackLocale.value);
        }
      });
      vue.watch(__root.fallbackLocale, (val) => {
        if (_inheritLocale) {
          _fallbackLocale.value = val;
          _context.fallbackLocale = val;
          updateFallbackLocale(_context, _locale.value, _fallbackLocale.value);
        }
      });
    }
    const composer = {
      id: composerID,
      locale,
      fallbackLocale,
      get inheritLocale() {
        return _inheritLocale;
      },
      set inheritLocale(val) {
        _inheritLocale = val;
        if (val && __root) {
          _locale.value = __root.locale.value;
          _fallbackLocale.value = __root.fallbackLocale.value;
          updateFallbackLocale(_context, _locale.value, _fallbackLocale.value);
        }
      },
      get availableLocales() {
        return Object.keys(_messages.value).sort();
      },
      messages,
      get modifiers() {
        return _modifiers;
      },
      get pluralRules() {
        return _pluralRules || {};
      },
      get isGlobal() {
        return _isGlobal;
      },
      get missingWarn() {
        return _missingWarn;
      },
      set missingWarn(val) {
        _missingWarn = val;
        _context.missingWarn = _missingWarn;
      },
      get fallbackWarn() {
        return _fallbackWarn;
      },
      set fallbackWarn(val) {
        _fallbackWarn = val;
        _context.fallbackWarn = _fallbackWarn;
      },
      get fallbackRoot() {
        return _fallbackRoot;
      },
      set fallbackRoot(val) {
        _fallbackRoot = val;
      },
      get fallbackFormat() {
        return _fallbackFormat;
      },
      set fallbackFormat(val) {
        _fallbackFormat = val;
        _context.fallbackFormat = _fallbackFormat;
      },
      get warnHtmlMessage() {
        return _warnHtmlMessage;
      },
      set warnHtmlMessage(val) {
        _warnHtmlMessage = val;
        _context.warnHtmlMessage = val;
      },
      get escapeParameter() {
        return _escapeParameter;
      },
      set escapeParameter(val) {
        _escapeParameter = val;
        _context.escapeParameter = val;
      },
      t: t2,
      getLocaleMessage,
      setLocaleMessage,
      mergeLocaleMessage,
      getPostTranslationHandler,
      setPostTranslationHandler,
      getMissingHandler,
      setMissingHandler,
      [SetPluralRulesSymbol]: setPluralRules
    };
    {
      composer.datetimeFormats = datetimeFormats;
      composer.numberFormats = numberFormats;
      composer.rt = rt;
      composer.te = te;
      composer.tm = tm;
      composer.d = d;
      composer.n = n;
      composer.getDateTimeFormat = getDateTimeFormat;
      composer.setDateTimeFormat = setDateTimeFormat;
      composer.mergeDateTimeFormat = mergeDateTimeFormat;
      composer.getNumberFormat = getNumberFormat;
      composer.setNumberFormat = setNumberFormat;
      composer.mergeNumberFormat = mergeNumberFormat;
      composer[InejctWithOptionSymbol] = __injectWithOption;
      composer[TranslateVNodeSymbol] = translateVNode;
      composer[DatetimePartsSymbol] = datetimeParts;
      composer[NumberPartsSymbol] = numberParts;
    }
    return composer;
  }
  const baseFormatProps = {
    tag: {
      type: [String, Object]
    },
    locale: {
      type: String
    },
    scope: {
      type: String,
      // NOTE: avoid https://github.com/microsoft/rushstack/issues/1050
      validator: (val) => val === "parent" || val === "global",
      default: "parent"
      /* ComponentI18nScope */
    },
    i18n: {
      type: Object
    }
  };
  function getInterpolateArg({ slots }, keys) {
    if (keys.length === 1 && keys[0] === "default") {
      const ret = slots.default ? slots.default() : [];
      return ret.reduce((slot, current) => {
        return [
          ...slot,
          // prettier-ignore
          ...current.type === vue.Fragment ? current.children : [current]
        ];
      }, []);
    } else {
      return keys.reduce((arg, key) => {
        const slot = slots[key];
        if (slot) {
          arg[key] = slot();
        }
        return arg;
      }, create());
    }
  }
  function getFragmentableTag(tag) {
    return vue.Fragment;
  }
  const TranslationImpl = /* @__PURE__ */ vue.defineComponent({
    /* eslint-disable */
    name: "i18n-t",
    props: assign$1({
      keypath: {
        type: String,
        required: true
      },
      plural: {
        type: [Number, String],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        validator: (val) => isNumber(val) || !isNaN(val)
      }
    }, baseFormatProps),
    /* eslint-enable */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setup(props, context) {
      const { slots, attrs } = context;
      const i18n = props.i18n || useI18n({
        useScope: props.scope,
        __useComponent: true
      });
      return () => {
        const keys = Object.keys(slots).filter((key) => key !== "_");
        const options = create();
        if (props.locale) {
          options.locale = props.locale;
        }
        if (props.plural !== void 0) {
          options.plural = isString$1(props.plural) ? +props.plural : props.plural;
        }
        const arg = getInterpolateArg(context, keys);
        const children = i18n[TranslateVNodeSymbol](props.keypath, arg, options);
        const assignedAttrs = assign$1(create(), attrs);
        const tag = isString$1(props.tag) || isObject$1(props.tag) ? props.tag : getFragmentableTag();
        return vue.h(tag, assignedAttrs, children);
      };
    }
  });
  const Translation = TranslationImpl;
  function isVNode(target) {
    return isArray(target) && !isString$1(target[0]);
  }
  function renderFormatter(props, context, slotKeys, partFormatter) {
    const { slots, attrs } = context;
    return () => {
      const options = { part: true };
      let overrides = create();
      if (props.locale) {
        options.locale = props.locale;
      }
      if (isString$1(props.format)) {
        options.key = props.format;
      } else if (isObject$1(props.format)) {
        if (isString$1(props.format.key)) {
          options.key = props.format.key;
        }
        overrides = Object.keys(props.format).reduce((options2, prop) => {
          return slotKeys.includes(prop) ? assign$1(create(), options2, { [prop]: props.format[prop] }) : options2;
        }, create());
      }
      const parts = partFormatter(...[props.value, options, overrides]);
      let children = [options.key];
      if (isArray(parts)) {
        children = parts.map((part, index) => {
          const slot = slots[part.type];
          const node = slot ? slot({ [part.type]: part.value, index, parts }) : [part.value];
          if (isVNode(node)) {
            node[0].key = `${part.type}-${index}`;
          }
          return node;
        });
      } else if (isString$1(parts)) {
        children = [parts];
      }
      const assignedAttrs = assign$1(create(), attrs);
      const tag = isString$1(props.tag) || isObject$1(props.tag) ? props.tag : getFragmentableTag();
      return vue.h(tag, assignedAttrs, children);
    };
  }
  const NumberFormatImpl = /* @__PURE__ */ vue.defineComponent({
    /* eslint-disable */
    name: "i18n-n",
    props: assign$1({
      value: {
        type: Number,
        required: true
      },
      format: {
        type: [String, Object]
      }
    }, baseFormatProps),
    /* eslint-enable */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setup(props, context) {
      const i18n = props.i18n || useI18n({
        useScope: props.scope,
        __useComponent: true
      });
      return renderFormatter(props, context, NUMBER_FORMAT_OPTIONS_KEYS, (...args) => (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        i18n[NumberPartsSymbol](...args)
      ));
    }
  });
  const NumberFormat = NumberFormatImpl;
  const DatetimeFormatImpl = /* @__PURE__ */ vue.defineComponent({
    /* eslint-disable */
    name: "i18n-d",
    props: assign$1({
      value: {
        type: [Number, Date],
        required: true
      },
      format: {
        type: [String, Object]
      }
    }, baseFormatProps),
    /* eslint-enable */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setup(props, context) {
      const i18n = props.i18n || useI18n({
        useScope: props.scope,
        __useComponent: true
      });
      return renderFormatter(props, context, DATETIME_FORMAT_OPTIONS_KEYS, (...args) => (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        i18n[DatetimePartsSymbol](...args)
      ));
    }
  });
  const DatetimeFormat = DatetimeFormatImpl;
  function getComposer$2(i18n, instance) {
    const i18nInternal = i18n;
    if (i18n.mode === "composition") {
      return i18nInternal.__getInstance(instance) || i18n.global;
    } else {
      const vueI18n = i18nInternal.__getInstance(instance);
      return vueI18n != null ? vueI18n.__composer : i18n.global.__composer;
    }
  }
  function vTDirective(i18n) {
    const _process = (binding) => {
      const { instance, modifiers, value } = binding;
      if (!instance || !instance.$) {
        throw createI18nError(I18nErrorCodes.UNEXPECTED_ERROR);
      }
      const composer = getComposer$2(i18n, instance.$);
      const parsedValue = parseValue(value);
      return [
        Reflect.apply(composer.t, composer, [...makeParams(parsedValue)]),
        composer
      ];
    };
    const register = (el, binding) => {
      const [textContent, composer] = _process(binding);
      if (inBrowser && i18n.global === composer) {
        el.__i18nWatcher = vue.watch(composer.locale, () => {
          binding.instance && binding.instance.$forceUpdate();
        });
      }
      el.__composer = composer;
      el.textContent = textContent;
    };
    const unregister = (el) => {
      if (inBrowser && el.__i18nWatcher) {
        el.__i18nWatcher();
        el.__i18nWatcher = void 0;
        delete el.__i18nWatcher;
      }
      if (el.__composer) {
        el.__composer = void 0;
        delete el.__composer;
      }
    };
    const update = (el, { value }) => {
      if (el.__composer) {
        const composer = el.__composer;
        const parsedValue = parseValue(value);
        el.textContent = Reflect.apply(composer.t, composer, [
          ...makeParams(parsedValue)
        ]);
      }
    };
    const getSSRProps = (binding) => {
      const [textContent] = _process(binding);
      return { textContent };
    };
    return {
      created: register,
      unmounted: unregister,
      beforeUpdate: update,
      getSSRProps
    };
  }
  function parseValue(value) {
    if (isString$1(value)) {
      return { path: value };
    } else if (isPlainObject(value)) {
      if (!("path" in value)) {
        throw createI18nError(I18nErrorCodes.REQUIRED_VALUE, "path");
      }
      return value;
    } else {
      throw createI18nError(I18nErrorCodes.INVALID_VALUE);
    }
  }
  function makeParams(value) {
    const { path, locale, args, choice, plural } = value;
    const options = {};
    const named = args || {};
    if (isString$1(locale)) {
      options.locale = locale;
    }
    if (isNumber(choice)) {
      options.plural = choice;
    }
    if (isNumber(plural)) {
      options.plural = plural;
    }
    return [path, named, options];
  }
  function apply(app, i18n, ...options) {
    const pluginOptions = isPlainObject(options[0]) ? options[0] : {};
    const useI18nComponentName = !!pluginOptions.useI18nComponentName;
    const globalInstall = isBoolean(pluginOptions.globalInstall) ? pluginOptions.globalInstall : true;
    if (globalInstall) {
      [!useI18nComponentName ? Translation.name : "i18n", "I18nT"].forEach((name) => app.component(name, Translation));
      [NumberFormat.name, "I18nN"].forEach((name) => app.component(name, NumberFormat));
      [DatetimeFormat.name, "I18nD"].forEach((name) => app.component(name, DatetimeFormat));
    }
    {
      app.directive("t", vTDirective(i18n));
    }
  }
  const I18nInjectionKey = /* @__PURE__ */ makeSymbol("global-vue-i18n");
  function createI18n(options = {}, VueI18nLegacy) {
    const __globalInjection = isBoolean(options.globalInjection) ? options.globalInjection : true;
    const __allowComposition = true;
    const __instances = /* @__PURE__ */ new Map();
    const [globalScope, __global] = createGlobal(options);
    const symbol = /* @__PURE__ */ makeSymbol("");
    function __getInstance(component) {
      return __instances.get(component) || null;
    }
    function __setInstance(component, instance) {
      __instances.set(component, instance);
    }
    function __deleteInstance(component) {
      __instances.delete(component);
    }
    {
      const i18n = {
        // mode
        get mode() {
          return "composition";
        },
        // allowComposition
        get allowComposition() {
          return __allowComposition;
        },
        // install plugin
        async install(app, ...options2) {
          app.__VUE_I18N_SYMBOL__ = symbol;
          app.provide(app.__VUE_I18N_SYMBOL__, i18n);
          if (isPlainObject(options2[0])) {
            const opts = options2[0];
            i18n.__composerExtend = opts.__composerExtend;
            i18n.__vueI18nExtend = opts.__vueI18nExtend;
          }
          let globalReleaseHandler = null;
          if (__globalInjection) {
            globalReleaseHandler = injectGlobalFields(app, i18n.global);
          }
          {
            apply(app, i18n, ...options2);
          }
          const unmountApp = app.unmount;
          app.unmount = () => {
            globalReleaseHandler && globalReleaseHandler();
            i18n.dispose();
            unmountApp();
          };
        },
        // global accessor
        get global() {
          return __global;
        },
        dispose() {
          globalScope.stop();
        },
        // @internal
        __instances,
        // @internal
        __getInstance,
        // @internal
        __setInstance,
        // @internal
        __deleteInstance
      };
      return i18n;
    }
  }
  function useI18n(options = {}) {
    const instance = vue.getCurrentInstance();
    if (instance == null) {
      throw createI18nError(I18nErrorCodes.MUST_BE_CALL_SETUP_TOP);
    }
    if (!instance.isCE && instance.appContext.app != null && !instance.appContext.app.__VUE_I18N_SYMBOL__) {
      throw createI18nError(I18nErrorCodes.NOT_INSTALLED);
    }
    const i18n = getI18nInstance(instance);
    const gl = getGlobalComposer(i18n);
    const componentOptions = getComponentOptions(instance);
    const scope = getScope(options, componentOptions);
    if (scope === "global") {
      adjustI18nResources(gl, options, componentOptions);
      return gl;
    }
    if (scope === "parent") {
      let composer2 = getComposer(i18n, instance, options.__useComponent);
      if (composer2 == null) {
        composer2 = gl;
      }
      return composer2;
    }
    const i18nInternal = i18n;
    let composer = i18nInternal.__getInstance(instance);
    if (composer == null) {
      const composerOptions = assign$1({}, options);
      if ("__i18n" in componentOptions) {
        composerOptions.__i18n = componentOptions.__i18n;
      }
      if (gl) {
        composerOptions.__root = gl;
      }
      composer = createComposer(composerOptions);
      if (i18nInternal.__composerExtend) {
        composer[DisposeSymbol] = i18nInternal.__composerExtend(composer);
      }
      setupLifeCycle(i18nInternal, instance, composer);
      i18nInternal.__setInstance(instance, composer);
    }
    return composer;
  }
  function createGlobal(options, legacyMode, VueI18nLegacy) {
    const scope = vue.effectScope();
    {
      const obj = scope.run(() => createComposer(options));
      if (obj == null) {
        throw createI18nError(I18nErrorCodes.UNEXPECTED_ERROR);
      }
      return [scope, obj];
    }
  }
  function getI18nInstance(instance) {
    {
      const i18n = vue.inject(!instance.isCE ? instance.appContext.app.__VUE_I18N_SYMBOL__ : I18nInjectionKey);
      if (!i18n) {
        throw createI18nError(!instance.isCE ? I18nErrorCodes.UNEXPECTED_ERROR : I18nErrorCodes.NOT_INSTALLED_WITH_PROVIDE);
      }
      return i18n;
    }
  }
  function getScope(options, componentOptions) {
    return isEmptyObject(options) ? "__i18n" in componentOptions ? "local" : "global" : !options.useScope ? "local" : options.useScope;
  }
  function getGlobalComposer(i18n) {
    return i18n.mode === "composition" ? i18n.global : i18n.global.__composer;
  }
  function getComposer(i18n, target, useComponent = false) {
    let composer = null;
    const root = target.root;
    let current = getParentComponentInstance(target, useComponent);
    while (current != null) {
      const i18nInternal = i18n;
      if (i18n.mode === "composition") {
        composer = i18nInternal.__getInstance(current);
      }
      if (composer != null) {
        break;
      }
      if (root === current) {
        break;
      }
      current = current.parent;
    }
    return composer;
  }
  function getParentComponentInstance(target, useComponent = false) {
    if (target == null) {
      return null;
    }
    {
      return !useComponent ? target.parent : target.vnode.ctx || target.parent;
    }
  }
  function setupLifeCycle(i18n, target, composer) {
    {
      vue.onMounted(() => {
      }, target);
      vue.onUnmounted(() => {
        const _composer = composer;
        i18n.__deleteInstance(target);
        const dispose = _composer[DisposeSymbol];
        if (dispose) {
          dispose();
          delete _composer[DisposeSymbol];
        }
      }, target);
    }
  }
  const globalExportProps = [
    "locale",
    "fallbackLocale",
    "availableLocales"
  ];
  const globalExportMethods = ["t", "rt", "d", "n", "tm", "te"];
  function injectGlobalFields(app, composer) {
    const i18n = /* @__PURE__ */ Object.create(null);
    globalExportProps.forEach((prop) => {
      const desc = Object.getOwnPropertyDescriptor(composer, prop);
      if (!desc) {
        throw createI18nError(I18nErrorCodes.UNEXPECTED_ERROR);
      }
      const wrap = vue.isRef(desc.value) ? {
        get() {
          return desc.value.value;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set(val) {
          desc.value.value = val;
        }
      } : {
        get() {
          return desc.get && desc.get();
        }
      };
      Object.defineProperty(i18n, prop, wrap);
    });
    app.config.globalProperties.$i18n = i18n;
    globalExportMethods.forEach((method) => {
      const desc = Object.getOwnPropertyDescriptor(composer, method);
      if (!desc || !desc.value) {
        throw createI18nError(I18nErrorCodes.UNEXPECTED_ERROR);
      }
      Object.defineProperty(app.config.globalProperties, `$${method}`, desc);
    });
    const dispose = () => {
      delete app.config.globalProperties.$i18n;
      globalExportMethods.forEach((method) => {
        delete app.config.globalProperties[`$${method}`];
      });
    };
    return dispose;
  }
  {
    initFeatureFlags();
  }
  if (__INTLIFY_JIT_COMPILATION__) {
    registerMessageCompiler(compile);
  } else {
    registerMessageCompiler(compileToFunction);
  }
  registerMessageResolver(resolveValue);
  registerLocaleFallbacker(fallbackWithLocaleChain);
  const _imports_0 = "data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='UTF-8'?%3e%3csvg%20id='Calque_1'%20data-name='Calque%201'%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%201509.47%20214'%3e%3cdefs%3e%3cstyle%3e%20.cls-1%20{%20fill:%20%23ef83b3;%20}%20.cls-2%20{%20fill:%20%23e62d38;%20}%20%3c/style%3e%3c/defs%3e%3cg%3e%3cpath%20class='cls-2'%20d='M98.65,114.47c-6.1-6.15-14.77-9.72-24.81-9.72-20.09,0-34.65,14.67-34.65,34.89s14.57,34.89,34.65,34.89c10.04,0,18.71-3.57,24.81-9.91l27.57,27.36c-13.39,13.48-31.9,22.01-52.38,22.01C33.08,214,0,180.69,0,139.65s33.08-74.35,73.84-74.35c20.28,0,38.59,8.13,51.98,21.61l-27.17,27.56Z'/%3e%3cpath%20class='cls-2'%20d='M221.98,65.31c40.76,0,73.84,33.51,73.84,74.55s-33.08,74.15-73.84,74.15-73.65-33.11-73.65-74.15,32.88-74.55,73.65-74.55ZM221.98,104.16c-19.3,0-35.05,15.86-35.05,35.49s15.75,35.49,35.05,35.49,35.25-16.06,35.25-35.49-15.75-35.49-35.25-35.49Z'/%3e%3cpath%20class='cls-2'%20d='M406.67,120.42l60.06-55.12h17.53v148.7h-38.99v-76.33l-38.59,35.49-38.79-35.29v76.13h-38.99V65.31h17.53l60.25,55.12Z'/%3e%3cpath%20class='cls-2'%20d='M530.28,65.31h62.22c29.93,0,54.35,24.58,54.35,54.72s-24.22,54.52-53.56,54.52h-24.22v39.45h-38.79V65.31ZM568.82,140.84h19.22c11.82,0,21.27-9.32,21.27-21.21s-9.45-21.41-21.27-21.41h-19.22v42.63Z'/%3e%3cpath%20class='cls-2'%20d='M680.42,65.31h38.79v148.7h-38.79V65.31Z'/%3e%3cpath%20class='cls-2'%20d='M873.77,214l68.92-148.7h17.53l69.51,148.7h-38.79l-9.06-19.43h-60.45l-8.86,19.43h-38.79ZM936.58,161.66h30.13l-14.96-32.71-15.16,32.71Z'/%3e%3cpath%20class='cls-2'%20d='M1036.24,65.31h116.37v38.66h-39.19v110.03h-38.79v-110.03h-38.4v-38.66Z'/%3e%3cpath%20class='cls-2'%20d='M1191.29,65.31h38.79v148.7h-38.79V65.31Z'/%3e%3cpath%20class='cls-2'%20d='M1346.39,65.31c40.76,0,73.84,33.51,73.84,74.55s-33.08,74.15-73.84,74.15-73.64-33.11-73.64-74.15,32.88-74.55,73.64-74.55ZM1346.39,104.16c-19.3,0-35.05,15.86-35.05,35.49s15.75,35.49,35.05,35.49,35.25-16.06,35.25-35.49-15.75-35.49-35.25-35.49Z'/%3e%3cpolygon%20class='cls-2'%20points='804.5%20174.75%20804.5%2065.31%20765.71%2065.31%20765.71%20214%20836.88%20214%20855.57%20174.75%20804.5%20174.75'/%3e%3c/g%3e%3cg%3e%3cpolygon%20class='cls-2'%20points='1509.47%2065.25%201509.46%2065.26%201509.47%2065.26%201509.47%2065.25'/%3e%3cpolygon%20class='cls-2'%20points='1444.21%200%201444.21%2065.26%201509.46%2065.26%201509.47%2065.25%201509.47%200%201444.21%200'/%3e%3c/g%3e%3cpolygon%20class='cls-1'%20points='1471.55%2065.26%201509.46%2065.26%201471.55%20103.16%201471.55%2065.26'/%3e%3c/svg%3e";
  const _hoisted_1$a = ["aria-checked", "disabled"];
  const _sfc_main$a = /* @__PURE__ */ vue.defineComponent({
    __name: "AppSwitch",
    props: {
      modelValue: { type: Boolean, required: true },
      disabled: { type: Boolean, default: false }
    },
    emits: ["update:modelValue"],
    setup(__props) {
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("button", {
          type: "button",
          class: vue.normalizeClass(["group relative inline-flex h-5 w-10 shrink-0 items-center justify-center rounded-full bg-transparent focus:outline-none [&>[data-circle]]:focus:ring-1 [&>[data-circle]]:focus:ring-blue-500 [&>[data-circle]]:focus:ring-offset-2", __props.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"]),
          role: "switch",
          "aria-checked": __props.modelValue,
          disabled: __props.disabled,
          onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("update:modelValue", !__props.modelValue))
        }, [
          vue.createElementVNode("span", {
            "aria-hidden": "true",
            class: vue.normalizeClass(["pointer-events-none absolute mx-auto h-4 w-9 rounded-full transition-colors duration-200 ease-in-out", __props.modelValue ? "bg-blue-400" : "bg-gray-200"])
          }, null, 2),
          vue.createElementVNode("span", {
            "data-circle": "",
            "aria-hidden": "true",
            class: vue.normalizeClass(["pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full border border-gray-300 bg-white shadow transition-transform duration-200 ease-in-out", __props.modelValue ? "translate-x-5" : "translate-x-0"])
          }, null, 2)
        ], 10, _hoisted_1$a);
      };
    }
  });
  const _hoisted_1$9 = ["autocomplete", "disabled", "name", "placeholder", "required", "type", "value"];
  const _sfc_main$9 = /* @__PURE__ */ vue.defineComponent({
    __name: "AppTextInput",
    props: {
      autocomplete: { type: String, default: void 0 },
      disabled: { type: Boolean, default: false },
      modelValue: { type: String, required: true },
      name: { type: String, default: void 0 },
      placeholder: { type: String, default: void 0 },
      required: { type: Boolean, default: false },
      type: { type: String, default: "text" }
    },
    emits: ["update:modelValue"],
    setup(__props, { emit: __emit }) {
      const emit = __emit;
      const handleInput = (event) => {
        emit("update:modelValue", event.target.value);
      };
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("input", {
          class: "block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
          autocomplete: __props.autocomplete,
          disabled: __props.disabled,
          name: __props.name,
          placeholder: __props.placeholder,
          required: __props.required,
          type: __props.type,
          value: __props.modelValue,
          onInput: handleInput
        }, null, 40, _hoisted_1$9);
      };
    }
  });
  const _hoisted_1$8 = ["checked", "disabled", "name", "value"];
  const _sfc_main$8 = /* @__PURE__ */ vue.defineComponent({
    __name: "AppRadio",
    props: {
      checked: { type: Boolean, required: true },
      disabled: { type: Boolean, default: false },
      name: { type: String, required: true },
      value: { type: String, required: true }
    },
    emits: ["select"],
    setup(__props) {
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("input", {
          type: "radio",
          class: "mt-1 h-4 w-4 shrink-0 border-slate-300 text-blue-600 focus:ring-blue-500",
          checked: __props.checked,
          disabled: __props.disabled,
          name: __props.name,
          value: __props.value,
          onChange: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("select", __props.value))
        }, null, 40, _hoisted_1$8);
      };
    }
  });
  const _hoisted_1$7 = { class: "flex cursor-pointer items-start gap-3 border-t border-slate-200 px-4 py-3 transition first:border-t-0 hover:bg-slate-50" };
  const _hoisted_2$7 = { class: "block text-sm font-medium text-slate-900" };
  const _hoisted_3$6 = { class: "mt-0.5 block text-sm leading-5 text-slate-500" };
  const _sfc_main$7 = /* @__PURE__ */ vue.defineComponent({
    __name: "LaunchModeOption",
    props: {
      description: { type: String, required: true },
      disabled: { type: Boolean, default: false },
      label: { type: String, required: true },
      modelValue: { type: String, required: true },
      value: { type: String, required: true }
    },
    emits: ["update:modelValue"],
    setup(__props, { emit: __emit }) {
      const emit = __emit;
      const selectMode = (value) => {
        emit("update:modelValue", value);
      };
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("label", _hoisted_1$7, [
          vue.createVNode(_sfc_main$8, {
            name: "analysisLaunchMode",
            checked: __props.modelValue === __props.value,
            disabled: __props.disabled,
            value: __props.value,
            onSelect: selectMode
          }, null, 8, ["checked", "disabled", "value"]),
          vue.createElementVNode("span", null, [
            vue.createElementVNode("span", _hoisted_2$7, vue.toDisplayString(__props.label), 1),
            vue.createElementVNode("span", _hoisted_3$6, vue.toDisplayString(__props.description), 1)
          ])
        ]);
      };
    }
  });
  /*!
   * Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com
   * License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)
   * Copyright 2024 Fonticons, Inc.
   */
  function _defineProperty$1(e, r2, t2) {
    return (r2 = _toPropertyKey$1(r2)) in e ? Object.defineProperty(e, r2, {
      value: t2,
      enumerable: true,
      configurable: true,
      writable: true
    }) : e[r2] = t2, e;
  }
  function ownKeys$1(e, r2) {
    var t2 = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o2 = Object.getOwnPropertySymbols(e);
      r2 && (o2 = o2.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t2.push.apply(t2, o2);
    }
    return t2;
  }
  function _objectSpread2$1(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t2 = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$1(Object(t2), true).forEach(function(r3) {
        _defineProperty$1(e, r3, t2[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t2)) : ownKeys$1(Object(t2)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t2, r3));
      });
    }
    return e;
  }
  function _toPrimitive$1(t2, r2) {
    if ("object" != typeof t2 || !t2) return t2;
    var e = t2[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t2, r2);
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t2);
  }
  function _toPropertyKey$1(t2) {
    var i = _toPrimitive$1(t2, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  const noop = () => {
  };
  let _WINDOW = {};
  let _DOCUMENT = {};
  let _MUTATION_OBSERVER = null;
  let _PERFORMANCE = {
    mark: noop,
    measure: noop
  };
  try {
    if (typeof window !== "undefined") _WINDOW = window;
    if (typeof document !== "undefined") _DOCUMENT = document;
    if (typeof MutationObserver !== "undefined") _MUTATION_OBSERVER = MutationObserver;
    if (typeof performance !== "undefined") _PERFORMANCE = performance;
  } catch (e) {
  }
  const {
    userAgent = ""
  } = _WINDOW.navigator || {};
  const WINDOW = _WINDOW;
  const DOCUMENT = _DOCUMENT;
  const MUTATION_OBSERVER = _MUTATION_OBSERVER;
  const PERFORMANCE = _PERFORMANCE;
  !!WINDOW.document;
  const IS_DOM = !!DOCUMENT.documentElement && !!DOCUMENT.head && typeof DOCUMENT.addEventListener === "function" && typeof DOCUMENT.createElement === "function";
  const IS_IE = ~userAgent.indexOf("MSIE") || ~userAgent.indexOf("Trident/");
  var p = /fa(s|r|l|t|d|dr|dl|dt|b|k|kd|ss|sr|sl|st|sds|sdr|sdl|sdt)?[\-\ ]/, g = /Font ?Awesome ?([56 ]*)(Solid|Regular|Light|Thin|Duotone|Brands|Free|Pro|Sharp Duotone|Sharp|Kit)?.*/i;
  var S = {
    classic: {
      fa: "solid",
      fas: "solid",
      "fa-solid": "solid",
      far: "regular",
      "fa-regular": "regular",
      fal: "light",
      "fa-light": "light",
      fat: "thin",
      "fa-thin": "thin",
      fab: "brands",
      "fa-brands": "brands"
    },
    duotone: {
      fa: "solid",
      fad: "solid",
      "fa-solid": "solid",
      "fa-duotone": "solid",
      fadr: "regular",
      "fa-regular": "regular",
      fadl: "light",
      "fa-light": "light",
      fadt: "thin",
      "fa-thin": "thin"
    },
    sharp: {
      fa: "solid",
      fass: "solid",
      "fa-solid": "solid",
      fasr: "regular",
      "fa-regular": "regular",
      fasl: "light",
      "fa-light": "light",
      fast: "thin",
      "fa-thin": "thin"
    },
    "sharp-duotone": {
      fa: "solid",
      fasds: "solid",
      "fa-solid": "solid",
      fasdr: "regular",
      "fa-regular": "regular",
      fasdl: "light",
      "fa-light": "light",
      fasdt: "thin",
      "fa-thin": "thin"
    }
  }, A = {
    GROUP: "duotone-group",
    PRIMARY: "primary",
    SECONDARY: "secondary"
  }, P = ["fa-classic", "fa-duotone", "fa-sharp", "fa-sharp-duotone"];
  var s = "classic", t = "duotone", r = "sharp", o = "sharp-duotone", L = [s, t, r, o];
  var G = {
    classic: {
      900: "fas",
      400: "far",
      normal: "far",
      300: "fal",
      100: "fat"
    },
    duotone: {
      900: "fad",
      400: "fadr",
      300: "fadl",
      100: "fadt"
    },
    sharp: {
      900: "fass",
      400: "fasr",
      300: "fasl",
      100: "fast"
    },
    "sharp-duotone": {
      900: "fasds",
      400: "fasdr",
      300: "fasdl",
      100: "fasdt"
    }
  };
  var lt = {
    "Font Awesome 6 Free": {
      900: "fas",
      400: "far"
    },
    "Font Awesome 6 Pro": {
      900: "fas",
      400: "far",
      normal: "far",
      300: "fal",
      100: "fat"
    },
    "Font Awesome 6 Brands": {
      400: "fab",
      normal: "fab"
    },
    "Font Awesome 6 Duotone": {
      900: "fad",
      400: "fadr",
      normal: "fadr",
      300: "fadl",
      100: "fadt"
    },
    "Font Awesome 6 Sharp": {
      900: "fass",
      400: "fasr",
      normal: "fasr",
      300: "fasl",
      100: "fast"
    },
    "Font Awesome 6 Sharp Duotone": {
      900: "fasds",
      400: "fasdr",
      normal: "fasdr",
      300: "fasdl",
      100: "fasdt"
    }
  };
  var pt = /* @__PURE__ */ new Map([["classic", {
    defaultShortPrefixId: "fas",
    defaultStyleId: "solid",
    styleIds: ["solid", "regular", "light", "thin", "brands"],
    futureStyleIds: [],
    defaultFontWeight: 900
  }], ["sharp", {
    defaultShortPrefixId: "fass",
    defaultStyleId: "solid",
    styleIds: ["solid", "regular", "light", "thin"],
    futureStyleIds: [],
    defaultFontWeight: 900
  }], ["duotone", {
    defaultShortPrefixId: "fad",
    defaultStyleId: "solid",
    styleIds: ["solid", "regular", "light", "thin"],
    futureStyleIds: [],
    defaultFontWeight: 900
  }], ["sharp-duotone", {
    defaultShortPrefixId: "fasds",
    defaultStyleId: "solid",
    styleIds: ["solid", "regular", "light", "thin"],
    futureStyleIds: [],
    defaultFontWeight: 900
  }]]), xt = {
    classic: {
      solid: "fas",
      regular: "far",
      light: "fal",
      thin: "fat",
      brands: "fab"
    },
    duotone: {
      solid: "fad",
      regular: "fadr",
      light: "fadl",
      thin: "fadt"
    },
    sharp: {
      solid: "fass",
      regular: "fasr",
      light: "fasl",
      thin: "fast"
    },
    "sharp-duotone": {
      solid: "fasds",
      regular: "fasdr",
      light: "fasdl",
      thin: "fasdt"
    }
  };
  var Ft = ["fak", "fa-kit", "fakd", "fa-kit-duotone"], St = {
    kit: {
      fak: "kit",
      "fa-kit": "kit"
    },
    "kit-duotone": {
      fakd: "kit-duotone",
      "fa-kit-duotone": "kit-duotone"
    }
  }, At = ["kit"];
  var Ct = {
    kit: {
      "fa-kit": "fak"
    }
  };
  var Lt = ["fak", "fakd"], Wt = {
    kit: {
      fak: "fa-kit"
    }
  };
  var Et = {
    kit: {
      kit: "fak"
    },
    "kit-duotone": {
      "kit-duotone": "fakd"
    }
  };
  var t$1 = {
    GROUP: "duotone-group",
    SWAP_OPACITY: "swap-opacity",
    PRIMARY: "primary",
    SECONDARY: "secondary"
  }, r$1 = ["fa-classic", "fa-duotone", "fa-sharp", "fa-sharp-duotone"];
  var bt$1 = ["fak", "fa-kit", "fakd", "fa-kit-duotone"];
  var Yt = {
    "Font Awesome Kit": {
      400: "fak",
      normal: "fak"
    },
    "Font Awesome Kit Duotone": {
      400: "fakd",
      normal: "fakd"
    }
  };
  var ua = {
    classic: {
      "fa-brands": "fab",
      "fa-duotone": "fad",
      "fa-light": "fal",
      "fa-regular": "far",
      "fa-solid": "fas",
      "fa-thin": "fat"
    },
    duotone: {
      "fa-regular": "fadr",
      "fa-light": "fadl",
      "fa-thin": "fadt"
    },
    sharp: {
      "fa-solid": "fass",
      "fa-regular": "fasr",
      "fa-light": "fasl",
      "fa-thin": "fast"
    },
    "sharp-duotone": {
      "fa-solid": "fasds",
      "fa-regular": "fasdr",
      "fa-light": "fasdl",
      "fa-thin": "fasdt"
    }
  }, I$1 = {
    classic: ["fas", "far", "fal", "fat", "fad"],
    duotone: ["fadr", "fadl", "fadt"],
    sharp: ["fass", "fasr", "fasl", "fast"],
    "sharp-duotone": ["fasds", "fasdr", "fasdl", "fasdt"]
  }, ga = {
    classic: {
      fab: "fa-brands",
      fad: "fa-duotone",
      fal: "fa-light",
      far: "fa-regular",
      fas: "fa-solid",
      fat: "fa-thin"
    },
    duotone: {
      fadr: "fa-regular",
      fadl: "fa-light",
      fadt: "fa-thin"
    },
    sharp: {
      fass: "fa-solid",
      fasr: "fa-regular",
      fasl: "fa-light",
      fast: "fa-thin"
    },
    "sharp-duotone": {
      fasds: "fa-solid",
      fasdr: "fa-regular",
      fasdl: "fa-light",
      fasdt: "fa-thin"
    }
  }, x = ["fa-solid", "fa-regular", "fa-light", "fa-thin", "fa-duotone", "fa-brands"], Ia = ["fa", "fas", "far", "fal", "fat", "fad", "fadr", "fadl", "fadt", "fab", "fass", "fasr", "fasl", "fast", "fasds", "fasdr", "fasdl", "fasdt", ...r$1, ...x], m$1 = ["solid", "regular", "light", "thin", "duotone", "brands"], c$1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], F$1 = c$1.concat([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]), ma = [...Object.keys(I$1), ...m$1, "2xs", "xs", "sm", "lg", "xl", "2xl", "beat", "border", "fade", "beat-fade", "bounce", "flip-both", "flip-horizontal", "flip-vertical", "flip", "fw", "inverse", "layers-counter", "layers-text", "layers", "li", "pull-left", "pull-right", "pulse", "rotate-180", "rotate-270", "rotate-90", "rotate-by", "shake", "spin-pulse", "spin-reverse", "spin", "stack-1x", "stack-2x", "stack", "ul", t$1.GROUP, t$1.SWAP_OPACITY, t$1.PRIMARY, t$1.SECONDARY].concat(c$1.map((a) => "".concat(a, "x"))).concat(F$1.map((a) => "w-".concat(a)));
  var wa = {
    "Font Awesome 5 Free": {
      900: "fas",
      400: "far"
    },
    "Font Awesome 5 Pro": {
      900: "fas",
      400: "far",
      normal: "far",
      300: "fal"
    },
    "Font Awesome 5 Brands": {
      400: "fab",
      normal: "fab"
    },
    "Font Awesome 5 Duotone": {
      900: "fad"
    }
  };
  const NAMESPACE_IDENTIFIER = "___FONT_AWESOME___";
  const UNITS_IN_GRID = 16;
  const DEFAULT_CSS_PREFIX = "fa";
  const DEFAULT_REPLACEMENT_CLASS = "svg-inline--fa";
  const DATA_FA_I2SVG = "data-fa-i2svg";
  const DATA_FA_PSEUDO_ELEMENT = "data-fa-pseudo-element";
  const DATA_FA_PSEUDO_ELEMENT_PENDING = "data-fa-pseudo-element-pending";
  const DATA_PREFIX = "data-prefix";
  const DATA_ICON = "data-icon";
  const HTML_CLASS_I2SVG_BASE_CLASS = "fontawesome-i2svg";
  const MUTATION_APPROACH_ASYNC = "async";
  const TAGNAMES_TO_SKIP_FOR_PSEUDOELEMENTS = ["HTML", "HEAD", "STYLE", "SCRIPT"];
  const PRODUCTION$1 = (() => {
    try {
      return true;
    } catch (e$$1) {
      return false;
    }
  })();
  function familyProxy(obj) {
    return new Proxy(obj, {
      get(target, prop) {
        return prop in target ? target[prop] : target[s];
      }
    });
  }
  const _PREFIX_TO_STYLE = _objectSpread2$1({}, S);
  _PREFIX_TO_STYLE[s] = _objectSpread2$1(_objectSpread2$1(_objectSpread2$1(_objectSpread2$1({}, {
    "fa-duotone": "duotone"
  }), S[s]), St["kit"]), St["kit-duotone"]);
  const PREFIX_TO_STYLE = familyProxy(_PREFIX_TO_STYLE);
  const _STYLE_TO_PREFIX = _objectSpread2$1({}, xt);
  _STYLE_TO_PREFIX[s] = _objectSpread2$1(_objectSpread2$1(_objectSpread2$1(_objectSpread2$1({}, {
    duotone: "fad"
  }), _STYLE_TO_PREFIX[s]), Et["kit"]), Et["kit-duotone"]);
  const STYLE_TO_PREFIX = familyProxy(_STYLE_TO_PREFIX);
  const _PREFIX_TO_LONG_STYLE = _objectSpread2$1({}, ga);
  _PREFIX_TO_LONG_STYLE[s] = _objectSpread2$1(_objectSpread2$1({}, _PREFIX_TO_LONG_STYLE[s]), Wt["kit"]);
  const PREFIX_TO_LONG_STYLE = familyProxy(_PREFIX_TO_LONG_STYLE);
  const _LONG_STYLE_TO_PREFIX = _objectSpread2$1({}, ua);
  _LONG_STYLE_TO_PREFIX[s] = _objectSpread2$1(_objectSpread2$1({}, _LONG_STYLE_TO_PREFIX[s]), Ct["kit"]);
  familyProxy(_LONG_STYLE_TO_PREFIX);
  const ICON_SELECTION_SYNTAX_PATTERN = p;
  const LAYERS_TEXT_CLASSNAME = "fa-layers-text";
  const FONT_FAMILY_PATTERN = g;
  const _FONT_WEIGHT_TO_PREFIX = _objectSpread2$1({}, G);
  familyProxy(_FONT_WEIGHT_TO_PREFIX);
  const ATTRIBUTES_WATCHED_FOR_MUTATION = ["class", "data-prefix", "data-icon", "data-fa-transform", "data-fa-mask"];
  const DUOTONE_CLASSES = A;
  const RESERVED_CLASSES = [...At, ...ma];
  const initial = WINDOW.FontAwesomeConfig || {};
  function getAttrConfig(attr) {
    var element = DOCUMENT.querySelector("script[" + attr + "]");
    if (element) {
      return element.getAttribute(attr);
    }
  }
  function coerce(val) {
    if (val === "") return true;
    if (val === "false") return false;
    if (val === "true") return true;
    return val;
  }
  if (DOCUMENT && typeof DOCUMENT.querySelector === "function") {
    const attrs = [["data-family-prefix", "familyPrefix"], ["data-css-prefix", "cssPrefix"], ["data-family-default", "familyDefault"], ["data-style-default", "styleDefault"], ["data-replacement-class", "replacementClass"], ["data-auto-replace-svg", "autoReplaceSvg"], ["data-auto-add-css", "autoAddCss"], ["data-auto-a11y", "autoA11y"], ["data-search-pseudo-elements", "searchPseudoElements"], ["data-observe-mutations", "observeMutations"], ["data-mutate-approach", "mutateApproach"], ["data-keep-original-source", "keepOriginalSource"], ["data-measure-performance", "measurePerformance"], ["data-show-missing-icons", "showMissingIcons"]];
    attrs.forEach((_ref) => {
      let [attr, key] = _ref;
      const val = coerce(getAttrConfig(attr));
      if (val !== void 0 && val !== null) {
        initial[key] = val;
      }
    });
  }
  const _default = {
    styleDefault: "solid",
    familyDefault: s,
    cssPrefix: DEFAULT_CSS_PREFIX,
    replacementClass: DEFAULT_REPLACEMENT_CLASS,
    autoReplaceSvg: true,
    autoAddCss: true,
    autoA11y: true,
    searchPseudoElements: false,
    observeMutations: true,
    mutateApproach: "async",
    keepOriginalSource: true,
    measurePerformance: false,
    showMissingIcons: true
  };
  if (initial.familyPrefix) {
    initial.cssPrefix = initial.familyPrefix;
  }
  const _config = _objectSpread2$1(_objectSpread2$1({}, _default), initial);
  if (!_config.autoReplaceSvg) _config.observeMutations = false;
  const config = {};
  Object.keys(_default).forEach((key) => {
    Object.defineProperty(config, key, {
      enumerable: true,
      set: function(val) {
        _config[key] = val;
        _onChangeCb.forEach((cb) => cb(config));
      },
      get: function() {
        return _config[key];
      }
    });
  });
  Object.defineProperty(config, "familyPrefix", {
    enumerable: true,
    set: function(val) {
      _config.cssPrefix = val;
      _onChangeCb.forEach((cb) => cb(config));
    },
    get: function() {
      return _config.cssPrefix;
    }
  });
  WINDOW.FontAwesomeConfig = config;
  const _onChangeCb = [];
  function onChange(cb) {
    _onChangeCb.push(cb);
    return () => {
      _onChangeCb.splice(_onChangeCb.indexOf(cb), 1);
    };
  }
  const d$2 = UNITS_IN_GRID;
  const meaninglessTransform = {
    size: 16,
    x: 0,
    y: 0,
    rotate: 0,
    flipX: false,
    flipY: false
  };
  function insertCss(css2) {
    if (!css2 || !IS_DOM) {
      return;
    }
    const style = DOCUMENT.createElement("style");
    style.setAttribute("type", "text/css");
    style.innerHTML = css2;
    const headChildren = DOCUMENT.head.childNodes;
    let beforeChild = null;
    for (let i = headChildren.length - 1; i > -1; i--) {
      const child = headChildren[i];
      const tagName = (child.tagName || "").toUpperCase();
      if (["STYLE", "LINK"].indexOf(tagName) > -1) {
        beforeChild = child;
      }
    }
    DOCUMENT.head.insertBefore(style, beforeChild);
    return css2;
  }
  const idPool = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  function nextUniqueId() {
    let size = 12;
    let id = "";
    while (size-- > 0) {
      id += idPool[Math.random() * 62 | 0];
    }
    return id;
  }
  function toArray(obj) {
    const array = [];
    for (let i = (obj || []).length >>> 0; i--; ) {
      array[i] = obj[i];
    }
    return array;
  }
  function classArray(node) {
    if (node.classList) {
      return toArray(node.classList);
    } else {
      return (node.getAttribute("class") || "").split(" ").filter((i) => i);
    }
  }
  function htmlEscape(str) {
    return "".concat(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function joinAttributes(attributes) {
    return Object.keys(attributes || {}).reduce((acc, attributeName) => {
      return acc + "".concat(attributeName, '="').concat(htmlEscape(attributes[attributeName]), '" ');
    }, "").trim();
  }
  function joinStyles(styles2) {
    return Object.keys(styles2 || {}).reduce((acc, styleName) => {
      return acc + "".concat(styleName, ": ").concat(styles2[styleName].trim(), ";");
    }, "");
  }
  function transformIsMeaningful(transform2) {
    return transform2.size !== meaninglessTransform.size || transform2.x !== meaninglessTransform.x || transform2.y !== meaninglessTransform.y || transform2.rotate !== meaninglessTransform.rotate || transform2.flipX || transform2.flipY;
  }
  function transformForSvg(_ref) {
    let {
      transform: transform2,
      containerWidth,
      iconWidth
    } = _ref;
    const outer = {
      transform: "translate(".concat(containerWidth / 2, " 256)")
    };
    const innerTranslate = "translate(".concat(transform2.x * 32, ", ").concat(transform2.y * 32, ") ");
    const innerScale = "scale(".concat(transform2.size / 16 * (transform2.flipX ? -1 : 1), ", ").concat(transform2.size / 16 * (transform2.flipY ? -1 : 1), ") ");
    const innerRotate = "rotate(".concat(transform2.rotate, " 0 0)");
    const inner = {
      transform: "".concat(innerTranslate, " ").concat(innerScale, " ").concat(innerRotate)
    };
    const path = {
      transform: "translate(".concat(iconWidth / 2 * -1, " -256)")
    };
    return {
      outer,
      inner,
      path
    };
  }
  function transformForCss(_ref2) {
    let {
      transform: transform2,
      width = UNITS_IN_GRID,
      height = UNITS_IN_GRID,
      startCentered = false
    } = _ref2;
    let val = "";
    if (startCentered && IS_IE) {
      val += "translate(".concat(transform2.x / d$2 - width / 2, "em, ").concat(transform2.y / d$2 - height / 2, "em) ");
    } else if (startCentered) {
      val += "translate(calc(-50% + ".concat(transform2.x / d$2, "em), calc(-50% + ").concat(transform2.y / d$2, "em)) ");
    } else {
      val += "translate(".concat(transform2.x / d$2, "em, ").concat(transform2.y / d$2, "em) ");
    }
    val += "scale(".concat(transform2.size / d$2 * (transform2.flipX ? -1 : 1), ", ").concat(transform2.size / d$2 * (transform2.flipY ? -1 : 1), ") ");
    val += "rotate(".concat(transform2.rotate, "deg) ");
    return val;
  }
  var baseStyles = ':root, :host {\n  --fa-font-solid: normal 900 1em/1 "Font Awesome 6 Free";\n  --fa-font-regular: normal 400 1em/1 "Font Awesome 6 Free";\n  --fa-font-light: normal 300 1em/1 "Font Awesome 6 Pro";\n  --fa-font-thin: normal 100 1em/1 "Font Awesome 6 Pro";\n  --fa-font-duotone: normal 900 1em/1 "Font Awesome 6 Duotone";\n  --fa-font-duotone-regular: normal 400 1em/1 "Font Awesome 6 Duotone";\n  --fa-font-duotone-light: normal 300 1em/1 "Font Awesome 6 Duotone";\n  --fa-font-duotone-thin: normal 100 1em/1 "Font Awesome 6 Duotone";\n  --fa-font-brands: normal 400 1em/1 "Font Awesome 6 Brands";\n  --fa-font-sharp-solid: normal 900 1em/1 "Font Awesome 6 Sharp";\n  --fa-font-sharp-regular: normal 400 1em/1 "Font Awesome 6 Sharp";\n  --fa-font-sharp-light: normal 300 1em/1 "Font Awesome 6 Sharp";\n  --fa-font-sharp-thin: normal 100 1em/1 "Font Awesome 6 Sharp";\n  --fa-font-sharp-duotone-solid: normal 900 1em/1 "Font Awesome 6 Sharp Duotone";\n  --fa-font-sharp-duotone-regular: normal 400 1em/1 "Font Awesome 6 Sharp Duotone";\n  --fa-font-sharp-duotone-light: normal 300 1em/1 "Font Awesome 6 Sharp Duotone";\n  --fa-font-sharp-duotone-thin: normal 100 1em/1 "Font Awesome 6 Sharp Duotone";\n}\n\nsvg:not(:root).svg-inline--fa, svg:not(:host).svg-inline--fa {\n  overflow: visible;\n  box-sizing: content-box;\n}\n\n.svg-inline--fa {\n  display: var(--fa-display, inline-block);\n  height: 1em;\n  overflow: visible;\n  vertical-align: -0.125em;\n}\n.svg-inline--fa.fa-2xs {\n  vertical-align: 0.1em;\n}\n.svg-inline--fa.fa-xs {\n  vertical-align: 0em;\n}\n.svg-inline--fa.fa-sm {\n  vertical-align: -0.0714285705em;\n}\n.svg-inline--fa.fa-lg {\n  vertical-align: -0.2em;\n}\n.svg-inline--fa.fa-xl {\n  vertical-align: -0.25em;\n}\n.svg-inline--fa.fa-2xl {\n  vertical-align: -0.3125em;\n}\n.svg-inline--fa.fa-pull-left {\n  margin-right: var(--fa-pull-margin, 0.3em);\n  width: auto;\n}\n.svg-inline--fa.fa-pull-right {\n  margin-left: var(--fa-pull-margin, 0.3em);\n  width: auto;\n}\n.svg-inline--fa.fa-li {\n  width: var(--fa-li-width, 2em);\n  top: 0.25em;\n}\n.svg-inline--fa.fa-fw {\n  width: var(--fa-fw-width, 1.25em);\n}\n\n.fa-layers svg.svg-inline--fa {\n  bottom: 0;\n  left: 0;\n  margin: auto;\n  position: absolute;\n  right: 0;\n  top: 0;\n}\n\n.fa-layers-counter, .fa-layers-text {\n  display: inline-block;\n  position: absolute;\n  text-align: center;\n}\n\n.fa-layers {\n  display: inline-block;\n  height: 1em;\n  position: relative;\n  text-align: center;\n  vertical-align: -0.125em;\n  width: 1em;\n}\n.fa-layers svg.svg-inline--fa {\n  transform-origin: center center;\n}\n\n.fa-layers-text {\n  left: 50%;\n  top: 50%;\n  transform: translate(-50%, -50%);\n  transform-origin: center center;\n}\n\n.fa-layers-counter {\n  background-color: var(--fa-counter-background-color, #ff253a);\n  border-radius: var(--fa-counter-border-radius, 1em);\n  box-sizing: border-box;\n  color: var(--fa-inverse, #fff);\n  line-height: var(--fa-counter-line-height, 1);\n  max-width: var(--fa-counter-max-width, 5em);\n  min-width: var(--fa-counter-min-width, 1.5em);\n  overflow: hidden;\n  padding: var(--fa-counter-padding, 0.25em 0.5em);\n  right: var(--fa-right, 0);\n  text-overflow: ellipsis;\n  top: var(--fa-top, 0);\n  transform: scale(var(--fa-counter-scale, 0.25));\n  transform-origin: top right;\n}\n\n.fa-layers-bottom-right {\n  bottom: var(--fa-bottom, 0);\n  right: var(--fa-right, 0);\n  top: auto;\n  transform: scale(var(--fa-layers-scale, 0.25));\n  transform-origin: bottom right;\n}\n\n.fa-layers-bottom-left {\n  bottom: var(--fa-bottom, 0);\n  left: var(--fa-left, 0);\n  right: auto;\n  top: auto;\n  transform: scale(var(--fa-layers-scale, 0.25));\n  transform-origin: bottom left;\n}\n\n.fa-layers-top-right {\n  top: var(--fa-top, 0);\n  right: var(--fa-right, 0);\n  transform: scale(var(--fa-layers-scale, 0.25));\n  transform-origin: top right;\n}\n\n.fa-layers-top-left {\n  left: var(--fa-left, 0);\n  right: auto;\n  top: var(--fa-top, 0);\n  transform: scale(var(--fa-layers-scale, 0.25));\n  transform-origin: top left;\n}\n\n.fa-1x {\n  font-size: 1em;\n}\n\n.fa-2x {\n  font-size: 2em;\n}\n\n.fa-3x {\n  font-size: 3em;\n}\n\n.fa-4x {\n  font-size: 4em;\n}\n\n.fa-5x {\n  font-size: 5em;\n}\n\n.fa-6x {\n  font-size: 6em;\n}\n\n.fa-7x {\n  font-size: 7em;\n}\n\n.fa-8x {\n  font-size: 8em;\n}\n\n.fa-9x {\n  font-size: 9em;\n}\n\n.fa-10x {\n  font-size: 10em;\n}\n\n.fa-2xs {\n  font-size: 0.625em;\n  line-height: 0.1em;\n  vertical-align: 0.225em;\n}\n\n.fa-xs {\n  font-size: 0.75em;\n  line-height: 0.0833333337em;\n  vertical-align: 0.125em;\n}\n\n.fa-sm {\n  font-size: 0.875em;\n  line-height: 0.0714285718em;\n  vertical-align: 0.0535714295em;\n}\n\n.fa-lg {\n  font-size: 1.25em;\n  line-height: 0.05em;\n  vertical-align: -0.075em;\n}\n\n.fa-xl {\n  font-size: 1.5em;\n  line-height: 0.0416666682em;\n  vertical-align: -0.125em;\n}\n\n.fa-2xl {\n  font-size: 2em;\n  line-height: 0.03125em;\n  vertical-align: -0.1875em;\n}\n\n.fa-fw {\n  text-align: center;\n  width: 1.25em;\n}\n\n.fa-ul {\n  list-style-type: none;\n  margin-left: var(--fa-li-margin, 2.5em);\n  padding-left: 0;\n}\n.fa-ul > li {\n  position: relative;\n}\n\n.fa-li {\n  left: calc(-1 * var(--fa-li-width, 2em));\n  position: absolute;\n  text-align: center;\n  width: var(--fa-li-width, 2em);\n  line-height: inherit;\n}\n\n.fa-border {\n  border-color: var(--fa-border-color, #eee);\n  border-radius: var(--fa-border-radius, 0.1em);\n  border-style: var(--fa-border-style, solid);\n  border-width: var(--fa-border-width, 0.08em);\n  padding: var(--fa-border-padding, 0.2em 0.25em 0.15em);\n}\n\n.fa-pull-left {\n  float: left;\n  margin-right: var(--fa-pull-margin, 0.3em);\n}\n\n.fa-pull-right {\n  float: right;\n  margin-left: var(--fa-pull-margin, 0.3em);\n}\n\n.fa-beat {\n  animation-name: fa-beat;\n  animation-delay: var(--fa-animation-delay, 0s);\n  animation-direction: var(--fa-animation-direction, normal);\n  animation-duration: var(--fa-animation-duration, 1s);\n  animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  animation-timing-function: var(--fa-animation-timing, ease-in-out);\n}\n\n.fa-bounce {\n  animation-name: fa-bounce;\n  animation-delay: var(--fa-animation-delay, 0s);\n  animation-direction: var(--fa-animation-direction, normal);\n  animation-duration: var(--fa-animation-duration, 1s);\n  animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.28, 0.84, 0.42, 1));\n}\n\n.fa-fade {\n  animation-name: fa-fade;\n  animation-delay: var(--fa-animation-delay, 0s);\n  animation-direction: var(--fa-animation-direction, normal);\n  animation-duration: var(--fa-animation-duration, 1s);\n  animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));\n}\n\n.fa-beat-fade {\n  animation-name: fa-beat-fade;\n  animation-delay: var(--fa-animation-delay, 0s);\n  animation-direction: var(--fa-animation-direction, normal);\n  animation-duration: var(--fa-animation-duration, 1s);\n  animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));\n}\n\n.fa-flip {\n  animation-name: fa-flip;\n  animation-delay: var(--fa-animation-delay, 0s);\n  animation-direction: var(--fa-animation-direction, normal);\n  animation-duration: var(--fa-animation-duration, 1s);\n  animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  animation-timing-function: var(--fa-animation-timing, ease-in-out);\n}\n\n.fa-shake {\n  animation-name: fa-shake;\n  animation-delay: var(--fa-animation-delay, 0s);\n  animation-direction: var(--fa-animation-direction, normal);\n  animation-duration: var(--fa-animation-duration, 1s);\n  animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  animation-timing-function: var(--fa-animation-timing, linear);\n}\n\n.fa-spin {\n  animation-name: fa-spin;\n  animation-delay: var(--fa-animation-delay, 0s);\n  animation-direction: var(--fa-animation-direction, normal);\n  animation-duration: var(--fa-animation-duration, 2s);\n  animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  animation-timing-function: var(--fa-animation-timing, linear);\n}\n\n.fa-spin-reverse {\n  --fa-animation-direction: reverse;\n}\n\n.fa-pulse,\n.fa-spin-pulse {\n  animation-name: fa-spin;\n  animation-direction: var(--fa-animation-direction, normal);\n  animation-duration: var(--fa-animation-duration, 1s);\n  animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  animation-timing-function: var(--fa-animation-timing, steps(8));\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .fa-beat,\n.fa-bounce,\n.fa-fade,\n.fa-beat-fade,\n.fa-flip,\n.fa-pulse,\n.fa-shake,\n.fa-spin,\n.fa-spin-pulse {\n    animation-delay: -1ms;\n    animation-duration: 1ms;\n    animation-iteration-count: 1;\n    transition-delay: 0s;\n    transition-duration: 0s;\n  }\n}\n@keyframes fa-beat {\n  0%, 90% {\n    transform: scale(1);\n  }\n  45% {\n    transform: scale(var(--fa-beat-scale, 1.25));\n  }\n}\n@keyframes fa-bounce {\n  0% {\n    transform: scale(1, 1) translateY(0);\n  }\n  10% {\n    transform: scale(var(--fa-bounce-start-scale-x, 1.1), var(--fa-bounce-start-scale-y, 0.9)) translateY(0);\n  }\n  30% {\n    transform: scale(var(--fa-bounce-jump-scale-x, 0.9), var(--fa-bounce-jump-scale-y, 1.1)) translateY(var(--fa-bounce-height, -0.5em));\n  }\n  50% {\n    transform: scale(var(--fa-bounce-land-scale-x, 1.05), var(--fa-bounce-land-scale-y, 0.95)) translateY(0);\n  }\n  57% {\n    transform: scale(1, 1) translateY(var(--fa-bounce-rebound, -0.125em));\n  }\n  64% {\n    transform: scale(1, 1) translateY(0);\n  }\n  100% {\n    transform: scale(1, 1) translateY(0);\n  }\n}\n@keyframes fa-fade {\n  50% {\n    opacity: var(--fa-fade-opacity, 0.4);\n  }\n}\n@keyframes fa-beat-fade {\n  0%, 100% {\n    opacity: var(--fa-beat-fade-opacity, 0.4);\n    transform: scale(1);\n  }\n  50% {\n    opacity: 1;\n    transform: scale(var(--fa-beat-fade-scale, 1.125));\n  }\n}\n@keyframes fa-flip {\n  50% {\n    transform: rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), var(--fa-flip-angle, -180deg));\n  }\n}\n@keyframes fa-shake {\n  0% {\n    transform: rotate(-15deg);\n  }\n  4% {\n    transform: rotate(15deg);\n  }\n  8%, 24% {\n    transform: rotate(-18deg);\n  }\n  12%, 28% {\n    transform: rotate(18deg);\n  }\n  16% {\n    transform: rotate(-22deg);\n  }\n  20% {\n    transform: rotate(22deg);\n  }\n  32% {\n    transform: rotate(-12deg);\n  }\n  36% {\n    transform: rotate(12deg);\n  }\n  40%, 100% {\n    transform: rotate(0deg);\n  }\n}\n@keyframes fa-spin {\n  0% {\n    transform: rotate(0deg);\n  }\n  100% {\n    transform: rotate(360deg);\n  }\n}\n.fa-rotate-90 {\n  transform: rotate(90deg);\n}\n\n.fa-rotate-180 {\n  transform: rotate(180deg);\n}\n\n.fa-rotate-270 {\n  transform: rotate(270deg);\n}\n\n.fa-flip-horizontal {\n  transform: scale(-1, 1);\n}\n\n.fa-flip-vertical {\n  transform: scale(1, -1);\n}\n\n.fa-flip-both,\n.fa-flip-horizontal.fa-flip-vertical {\n  transform: scale(-1, -1);\n}\n\n.fa-rotate-by {\n  transform: rotate(var(--fa-rotate-angle, 0));\n}\n\n.fa-stack {\n  display: inline-block;\n  vertical-align: middle;\n  height: 2em;\n  position: relative;\n  width: 2.5em;\n}\n\n.fa-stack-1x,\n.fa-stack-2x {\n  bottom: 0;\n  left: 0;\n  margin: auto;\n  position: absolute;\n  right: 0;\n  top: 0;\n  z-index: var(--fa-stack-z-index, auto);\n}\n\n.svg-inline--fa.fa-stack-1x {\n  height: 1em;\n  width: 1.25em;\n}\n.svg-inline--fa.fa-stack-2x {\n  height: 2em;\n  width: 2.5em;\n}\n\n.fa-inverse {\n  color: var(--fa-inverse, #fff);\n}\n\n.sr-only,\n.fa-sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  border-width: 0;\n}\n\n.sr-only-focusable:not(:focus),\n.fa-sr-only-focusable:not(:focus) {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  border-width: 0;\n}\n\n.svg-inline--fa .fa-primary {\n  fill: var(--fa-primary-color, currentColor);\n  opacity: var(--fa-primary-opacity, 1);\n}\n\n.svg-inline--fa .fa-secondary {\n  fill: var(--fa-secondary-color, currentColor);\n  opacity: var(--fa-secondary-opacity, 0.4);\n}\n\n.svg-inline--fa.fa-swap-opacity .fa-primary {\n  opacity: var(--fa-secondary-opacity, 0.4);\n}\n\n.svg-inline--fa.fa-swap-opacity .fa-secondary {\n  opacity: var(--fa-primary-opacity, 1);\n}\n\n.svg-inline--fa mask .fa-primary,\n.svg-inline--fa mask .fa-secondary {\n  fill: black;\n}';
  function css() {
    const dcp = DEFAULT_CSS_PREFIX;
    const drc = DEFAULT_REPLACEMENT_CLASS;
    const fp = config.cssPrefix;
    const rc = config.replacementClass;
    let s2 = baseStyles;
    if (fp !== dcp || rc !== drc) {
      const dPatt = new RegExp("\\.".concat(dcp, "\\-"), "g");
      const customPropPatt = new RegExp("\\--".concat(dcp, "\\-"), "g");
      const rPatt = new RegExp("\\.".concat(drc), "g");
      s2 = s2.replace(dPatt, ".".concat(fp, "-")).replace(customPropPatt, "--".concat(fp, "-")).replace(rPatt, ".".concat(rc));
    }
    return s2;
  }
  let _cssInserted = false;
  function ensureCss() {
    if (config.autoAddCss && !_cssInserted) {
      insertCss(css());
      _cssInserted = true;
    }
  }
  var InjectCSS = {
    mixout() {
      return {
        dom: {
          css,
          insertCss: ensureCss
        }
      };
    },
    hooks() {
      return {
        beforeDOMElementCreation() {
          ensureCss();
        },
        beforeI2svg() {
          ensureCss();
        }
      };
    }
  };
  const w = WINDOW || {};
  if (!w[NAMESPACE_IDENTIFIER]) w[NAMESPACE_IDENTIFIER] = {};
  if (!w[NAMESPACE_IDENTIFIER].styles) w[NAMESPACE_IDENTIFIER].styles = {};
  if (!w[NAMESPACE_IDENTIFIER].hooks) w[NAMESPACE_IDENTIFIER].hooks = {};
  if (!w[NAMESPACE_IDENTIFIER].shims) w[NAMESPACE_IDENTIFIER].shims = [];
  var namespace = w[NAMESPACE_IDENTIFIER];
  const functions = [];
  const listener = function() {
    DOCUMENT.removeEventListener("DOMContentLoaded", listener);
    loaded = 1;
    functions.map((fn) => fn());
  };
  let loaded = false;
  if (IS_DOM) {
    loaded = (DOCUMENT.documentElement.doScroll ? /^loaded|^c/ : /^loaded|^i|^c/).test(DOCUMENT.readyState);
    if (!loaded) DOCUMENT.addEventListener("DOMContentLoaded", listener);
  }
  function domready(fn) {
    if (!IS_DOM) return;
    loaded ? setTimeout(fn, 0) : functions.push(fn);
  }
  function toHtml(abstractNodes) {
    const {
      tag,
      attributes = {},
      children = []
    } = abstractNodes;
    if (typeof abstractNodes === "string") {
      return htmlEscape(abstractNodes);
    } else {
      return "<".concat(tag, " ").concat(joinAttributes(attributes), ">").concat(children.map(toHtml).join(""), "</").concat(tag, ">");
    }
  }
  function iconFromMapping(mapping, prefix, iconName) {
    if (mapping && mapping[prefix] && mapping[prefix][iconName]) {
      return {
        prefix,
        iconName,
        icon: mapping[prefix][iconName]
      };
    }
  }
  var reduce = function fastReduceObject(subject, fn, initialValue, thisContext) {
    var keys = Object.keys(subject), length = keys.length, iterator = fn, i, key, result;
    if (initialValue === void 0) {
      i = 1;
      result = subject[keys[0]];
    } else {
      i = 0;
      result = initialValue;
    }
    for (; i < length; i++) {
      key = keys[i];
      result = iterator(result, subject[key], key, subject);
    }
    return result;
  };
  function ucs2decode(string) {
    const output = [];
    let counter2 = 0;
    const length = string.length;
    while (counter2 < length) {
      const value = string.charCodeAt(counter2++);
      if (value >= 55296 && value <= 56319 && counter2 < length) {
        const extra = string.charCodeAt(counter2++);
        if ((extra & 64512) == 56320) {
          output.push(((value & 1023) << 10) + (extra & 1023) + 65536);
        } else {
          output.push(value);
          counter2--;
        }
      } else {
        output.push(value);
      }
    }
    return output;
  }
  function toHex(unicode) {
    const decoded = ucs2decode(unicode);
    return decoded.length === 1 ? decoded[0].toString(16) : null;
  }
  function codePointAt(string, index) {
    const size = string.length;
    let first = string.charCodeAt(index);
    let second;
    if (first >= 55296 && first <= 56319 && size > index + 1) {
      second = string.charCodeAt(index + 1);
      if (second >= 56320 && second <= 57343) {
        return (first - 55296) * 1024 + second - 56320 + 65536;
      }
    }
    return first;
  }
  function normalizeIcons(icons) {
    return Object.keys(icons).reduce((acc, iconName) => {
      const icon2 = icons[iconName];
      const expanded = !!icon2.icon;
      if (expanded) {
        acc[icon2.iconName] = icon2.icon;
      } else {
        acc[iconName] = icon2;
      }
      return acc;
    }, {});
  }
  function defineIcons(prefix, icons) {
    let params = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    const {
      skipHooks = false
    } = params;
    const normalized = normalizeIcons(icons);
    if (typeof namespace.hooks.addPack === "function" && !skipHooks) {
      namespace.hooks.addPack(prefix, normalizeIcons(icons));
    } else {
      namespace.styles[prefix] = _objectSpread2$1(_objectSpread2$1({}, namespace.styles[prefix] || {}), normalized);
    }
    if (prefix === "fas") {
      defineIcons("fa", icons);
    }
  }
  const {
    styles,
    shims
  } = namespace;
  const FAMILY_NAMES = Object.keys(PREFIX_TO_LONG_STYLE);
  const PREFIXES_FOR_FAMILY = FAMILY_NAMES.reduce((acc, familyId) => {
    acc[familyId] = Object.keys(PREFIX_TO_LONG_STYLE[familyId]);
    return acc;
  }, {});
  let _defaultUsablePrefix = null;
  let _byUnicode = {};
  let _byLigature = {};
  let _byOldName = {};
  let _byOldUnicode = {};
  let _byAlias = {};
  function isReserved(name) {
    return ~RESERVED_CLASSES.indexOf(name);
  }
  function getIconName(cssPrefix, cls) {
    const parts = cls.split("-");
    const prefix = parts[0];
    const iconName = parts.slice(1).join("-");
    if (prefix === cssPrefix && iconName !== "" && !isReserved(iconName)) {
      return iconName;
    } else {
      return null;
    }
  }
  const build = () => {
    const lookup = (reducer) => {
      return reduce(styles, (o$$1, style, prefix) => {
        o$$1[prefix] = reduce(style, reducer, {});
        return o$$1;
      }, {});
    };
    _byUnicode = lookup((acc, icon2, iconName) => {
      if (icon2[3]) {
        acc[icon2[3]] = iconName;
      }
      if (icon2[2]) {
        const aliases = icon2[2].filter((a$$1) => {
          return typeof a$$1 === "number";
        });
        aliases.forEach((alias) => {
          acc[alias.toString(16)] = iconName;
        });
      }
      return acc;
    });
    _byLigature = lookup((acc, icon2, iconName) => {
      acc[iconName] = iconName;
      if (icon2[2]) {
        const aliases = icon2[2].filter((a$$1) => {
          return typeof a$$1 === "string";
        });
        aliases.forEach((alias) => {
          acc[alias] = iconName;
        });
      }
      return acc;
    });
    _byAlias = lookup((acc, icon2, iconName) => {
      const aliases = icon2[2];
      acc[iconName] = iconName;
      aliases.forEach((alias) => {
        acc[alias] = iconName;
      });
      return acc;
    });
    const hasRegular = "far" in styles || config.autoFetchSvg;
    const shimLookups = reduce(shims, (acc, shim) => {
      const maybeNameMaybeUnicode = shim[0];
      let prefix = shim[1];
      const iconName = shim[2];
      if (prefix === "far" && !hasRegular) {
        prefix = "fas";
      }
      if (typeof maybeNameMaybeUnicode === "string") {
        acc.names[maybeNameMaybeUnicode] = {
          prefix,
          iconName
        };
      }
      if (typeof maybeNameMaybeUnicode === "number") {
        acc.unicodes[maybeNameMaybeUnicode.toString(16)] = {
          prefix,
          iconName
        };
      }
      return acc;
    }, {
      names: {},
      unicodes: {}
    });
    _byOldName = shimLookups.names;
    _byOldUnicode = shimLookups.unicodes;
    _defaultUsablePrefix = getCanonicalPrefix(config.styleDefault, {
      family: config.familyDefault
    });
  };
  onChange((c$$1) => {
    _defaultUsablePrefix = getCanonicalPrefix(c$$1.styleDefault, {
      family: config.familyDefault
    });
  });
  build();
  function byUnicode(prefix, unicode) {
    return (_byUnicode[prefix] || {})[unicode];
  }
  function byLigature(prefix, ligature) {
    return (_byLigature[prefix] || {})[ligature];
  }
  function byAlias(prefix, alias) {
    return (_byAlias[prefix] || {})[alias];
  }
  function byOldName(name) {
    return _byOldName[name] || {
      prefix: null,
      iconName: null
    };
  }
  function byOldUnicode(unicode) {
    const oldUnicode = _byOldUnicode[unicode];
    const newUnicode = byUnicode("fas", unicode);
    return oldUnicode || (newUnicode ? {
      prefix: "fas",
      iconName: newUnicode
    } : null) || {
      prefix: null,
      iconName: null
    };
  }
  function getDefaultUsablePrefix() {
    return _defaultUsablePrefix;
  }
  const emptyCanonicalIcon = () => {
    return {
      prefix: null,
      iconName: null,
      rest: []
    };
  };
  function getFamilyId(values) {
    let family = s;
    const famProps = FAMILY_NAMES.reduce((acc, familyId) => {
      acc[familyId] = "".concat(config.cssPrefix, "-").concat(familyId);
      return acc;
    }, {});
    L.forEach((familyId) => {
      if (values.includes(famProps[familyId]) || values.some((v$$1) => PREFIXES_FOR_FAMILY[familyId].includes(v$$1))) {
        family = familyId;
      }
    });
    return family;
  }
  function getCanonicalPrefix(styleOrPrefix) {
    let params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    const {
      family = s
    } = params;
    const style = PREFIX_TO_STYLE[family][styleOrPrefix];
    if (family === t && !styleOrPrefix) {
      return "fad";
    }
    const prefix = STYLE_TO_PREFIX[family][styleOrPrefix] || STYLE_TO_PREFIX[family][style];
    const defined = styleOrPrefix in namespace.styles ? styleOrPrefix : null;
    const result = prefix || defined || null;
    return result;
  }
  function moveNonFaClassesToRest(classNames) {
    let rest = [];
    let iconName = null;
    classNames.forEach((cls) => {
      const result = getIconName(config.cssPrefix, cls);
      if (result) {
        iconName = result;
      } else if (cls) {
        rest.push(cls);
      }
    });
    return {
      iconName,
      rest
    };
  }
  function sortedUniqueValues(arr) {
    return arr.sort().filter((value, index, arr2) => {
      return arr2.indexOf(value) === index;
    });
  }
  function getCanonicalIcon(values) {
    let params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    const {
      skipLookups = false
    } = params;
    let givenPrefix = null;
    const faCombinedClasses = Ia.concat(bt$1);
    const faStyleOrFamilyClasses = sortedUniqueValues(values.filter((cls) => faCombinedClasses.includes(cls)));
    const nonStyleOrFamilyClasses = sortedUniqueValues(values.filter((cls) => !Ia.includes(cls)));
    const faStyles = faStyleOrFamilyClasses.filter((cls) => {
      givenPrefix = cls;
      return !P.includes(cls);
    });
    const [styleFromValues = null] = faStyles;
    const family = getFamilyId(faStyleOrFamilyClasses);
    const canonical = _objectSpread2$1(_objectSpread2$1({}, moveNonFaClassesToRest(nonStyleOrFamilyClasses)), {}, {
      prefix: getCanonicalPrefix(styleFromValues, {
        family
      })
    });
    return _objectSpread2$1(_objectSpread2$1(_objectSpread2$1({}, canonical), getDefaultCanonicalPrefix({
      values,
      family,
      styles,
      config,
      canonical,
      givenPrefix
    })), applyShimAndAlias(skipLookups, givenPrefix, canonical));
  }
  function applyShimAndAlias(skipLookups, givenPrefix, canonical) {
    let {
      prefix,
      iconName
    } = canonical;
    if (skipLookups || !prefix || !iconName) {
      return {
        prefix,
        iconName
      };
    }
    const shim = givenPrefix === "fa" ? byOldName(iconName) : {};
    const aliasIconName = byAlias(prefix, iconName);
    iconName = shim.iconName || aliasIconName || iconName;
    prefix = shim.prefix || prefix;
    if (prefix === "far" && !styles["far"] && styles["fas"] && !config.autoFetchSvg) {
      prefix = "fas";
    }
    return {
      prefix,
      iconName
    };
  }
  const newCanonicalFamilies = L.filter((familyId) => {
    return familyId !== s || familyId !== t;
  });
  const newCanonicalStyles = Object.keys(ga).filter((key) => key !== s).map((key) => Object.keys(ga[key])).flat();
  function getDefaultCanonicalPrefix(prefixOptions) {
    const {
      values,
      family,
      canonical,
      givenPrefix = "",
      styles: styles2 = {},
      config: config$$1 = {}
    } = prefixOptions;
    const isDuotoneFamily = family === t;
    const valuesHasDuotone = values.includes("fa-duotone") || values.includes("fad");
    const defaultFamilyIsDuotone = config$$1.familyDefault === "duotone";
    const canonicalPrefixIsDuotone = canonical.prefix === "fad" || canonical.prefix === "fa-duotone";
    if (!isDuotoneFamily && (valuesHasDuotone || defaultFamilyIsDuotone || canonicalPrefixIsDuotone)) {
      canonical.prefix = "fad";
    }
    if (values.includes("fa-brands") || values.includes("fab")) {
      canonical.prefix = "fab";
    }
    if (!canonical.prefix && newCanonicalFamilies.includes(family)) {
      const validPrefix = Object.keys(styles2).find((key) => newCanonicalStyles.includes(key));
      if (validPrefix || config$$1.autoFetchSvg) {
        const defaultPrefix = pt.get(family).defaultShortPrefixId;
        canonical.prefix = defaultPrefix;
        canonical.iconName = byAlias(canonical.prefix, canonical.iconName) || canonical.iconName;
      }
    }
    if (canonical.prefix === "fa" || givenPrefix === "fa") {
      canonical.prefix = getDefaultUsablePrefix() || "fas";
    }
    return canonical;
  }
  class Library {
    constructor() {
      this.definitions = {};
    }
    add() {
      for (var _len = arguments.length, definitions = new Array(_len), _key = 0; _key < _len; _key++) {
        definitions[_key] = arguments[_key];
      }
      const additions = definitions.reduce(this._pullDefinitions, {});
      Object.keys(additions).forEach((key) => {
        this.definitions[key] = _objectSpread2$1(_objectSpread2$1({}, this.definitions[key] || {}), additions[key]);
        defineIcons(key, additions[key]);
        const longPrefix = PREFIX_TO_LONG_STYLE[s][key];
        if (longPrefix) defineIcons(longPrefix, additions[key]);
        build();
      });
    }
    reset() {
      this.definitions = {};
    }
    _pullDefinitions(additions, definition) {
      const normalized = definition.prefix && definition.iconName && definition.icon ? {
        0: definition
      } : definition;
      Object.keys(normalized).map((key) => {
        const {
          prefix,
          iconName,
          icon: icon2
        } = normalized[key];
        const aliases = icon2[2];
        if (!additions[prefix]) additions[prefix] = {};
        if (aliases.length > 0) {
          aliases.forEach((alias) => {
            if (typeof alias === "string") {
              additions[prefix][alias] = icon2;
            }
          });
        }
        additions[prefix][iconName] = icon2;
      });
      return additions;
    }
  }
  let _plugins = [];
  let _hooks = {};
  const providers = {};
  const defaultProviderKeys = Object.keys(providers);
  function registerPlugins(nextPlugins, _ref) {
    let {
      mixoutsTo: obj
    } = _ref;
    _plugins = nextPlugins;
    _hooks = {};
    Object.keys(providers).forEach((k) => {
      if (defaultProviderKeys.indexOf(k) === -1) {
        delete providers[k];
      }
    });
    _plugins.forEach((plugin) => {
      const mixout = plugin.mixout ? plugin.mixout() : {};
      Object.keys(mixout).forEach((tk) => {
        if (typeof mixout[tk] === "function") {
          obj[tk] = mixout[tk];
        }
        if (typeof mixout[tk] === "object") {
          Object.keys(mixout[tk]).forEach((sk) => {
            if (!obj[tk]) {
              obj[tk] = {};
            }
            obj[tk][sk] = mixout[tk][sk];
          });
        }
      });
      if (plugin.hooks) {
        const hooks = plugin.hooks();
        Object.keys(hooks).forEach((hook) => {
          if (!_hooks[hook]) {
            _hooks[hook] = [];
          }
          _hooks[hook].push(hooks[hook]);
        });
      }
      if (plugin.provides) {
        plugin.provides(providers);
      }
    });
    return obj;
  }
  function chainHooks(hook, accumulator) {
    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }
    const hookFns = _hooks[hook] || [];
    hookFns.forEach((hookFn) => {
      accumulator = hookFn.apply(null, [accumulator, ...args]);
    });
    return accumulator;
  }
  function callHooks(hook) {
    for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }
    const hookFns = _hooks[hook] || [];
    hookFns.forEach((hookFn) => {
      hookFn.apply(null, args);
    });
    return void 0;
  }
  function callProvided() {
    const hook = arguments[0];
    const args = Array.prototype.slice.call(arguments, 1);
    return providers[hook] ? providers[hook].apply(null, args) : void 0;
  }
  function findIconDefinition(iconLookup) {
    if (iconLookup.prefix === "fa") {
      iconLookup.prefix = "fas";
    }
    let {
      iconName
    } = iconLookup;
    const prefix = iconLookup.prefix || getDefaultUsablePrefix();
    if (!iconName) return;
    iconName = byAlias(prefix, iconName) || iconName;
    return iconFromMapping(library.definitions, prefix, iconName) || iconFromMapping(namespace.styles, prefix, iconName);
  }
  const library = new Library();
  const noAuto = () => {
    config.autoReplaceSvg = false;
    config.observeMutations = false;
    callHooks("noAuto");
  };
  const dom = {
    i2svg: function() {
      let params = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      if (IS_DOM) {
        callHooks("beforeI2svg", params);
        callProvided("pseudoElements2svg", params);
        return callProvided("i2svg", params);
      } else {
        return Promise.reject(new Error("Operation requires a DOM of some kind."));
      }
    },
    watch: function() {
      let params = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      const {
        autoReplaceSvgRoot
      } = params;
      if (config.autoReplaceSvg === false) {
        config.autoReplaceSvg = true;
      }
      config.observeMutations = true;
      domready(() => {
        autoReplace({
          autoReplaceSvgRoot
        });
        callHooks("watch", params);
      });
    }
  };
  const parse = {
    icon: (icon2) => {
      if (icon2 === null) {
        return null;
      }
      if (typeof icon2 === "object" && icon2.prefix && icon2.iconName) {
        return {
          prefix: icon2.prefix,
          iconName: byAlias(icon2.prefix, icon2.iconName) || icon2.iconName
        };
      }
      if (Array.isArray(icon2) && icon2.length === 2) {
        const iconName = icon2[1].indexOf("fa-") === 0 ? icon2[1].slice(3) : icon2[1];
        const prefix = getCanonicalPrefix(icon2[0]);
        return {
          prefix,
          iconName: byAlias(prefix, iconName) || iconName
        };
      }
      if (typeof icon2 === "string" && (icon2.indexOf("".concat(config.cssPrefix, "-")) > -1 || icon2.match(ICON_SELECTION_SYNTAX_PATTERN))) {
        const canonicalIcon = getCanonicalIcon(icon2.split(" "), {
          skipLookups: true
        });
        return {
          prefix: canonicalIcon.prefix || getDefaultUsablePrefix(),
          iconName: byAlias(canonicalIcon.prefix, canonicalIcon.iconName) || canonicalIcon.iconName
        };
      }
      if (typeof icon2 === "string") {
        const prefix = getDefaultUsablePrefix();
        return {
          prefix,
          iconName: byAlias(prefix, icon2) || icon2
        };
      }
    }
  };
  const api = {
    noAuto,
    config,
    dom,
    parse,
    library,
    findIconDefinition,
    toHtml
  };
  const autoReplace = function() {
    let params = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    const {
      autoReplaceSvgRoot = DOCUMENT
    } = params;
    if ((Object.keys(namespace.styles).length > 0 || config.autoFetchSvg) && IS_DOM && config.autoReplaceSvg) api.dom.i2svg({
      node: autoReplaceSvgRoot
    });
  };
  function domVariants(val, abstractCreator) {
    Object.defineProperty(val, "abstract", {
      get: abstractCreator
    });
    Object.defineProperty(val, "html", {
      get: function() {
        return val.abstract.map((a) => toHtml(a));
      }
    });
    Object.defineProperty(val, "node", {
      get: function() {
        if (!IS_DOM) return;
        const container = DOCUMENT.createElement("div");
        container.innerHTML = val.html;
        return container.children;
      }
    });
    return val;
  }
  function asIcon(_ref) {
    let {
      children,
      main,
      mask,
      attributes,
      styles: styles2,
      transform: transform2
    } = _ref;
    if (transformIsMeaningful(transform2) && main.found && !mask.found) {
      const {
        width,
        height
      } = main;
      const offset = {
        x: width / height / 2,
        y: 0.5
      };
      attributes["style"] = joinStyles(_objectSpread2$1(_objectSpread2$1({}, styles2), {}, {
        "transform-origin": "".concat(offset.x + transform2.x / 16, "em ").concat(offset.y + transform2.y / 16, "em")
      }));
    }
    return [{
      tag: "svg",
      attributes,
      children
    }];
  }
  function asSymbol(_ref) {
    let {
      prefix,
      iconName,
      children,
      attributes,
      symbol
    } = _ref;
    const id = symbol === true ? "".concat(prefix, "-").concat(config.cssPrefix, "-").concat(iconName) : symbol;
    return [{
      tag: "svg",
      attributes: {
        style: "display: none;"
      },
      children: [{
        tag: "symbol",
        attributes: _objectSpread2$1(_objectSpread2$1({}, attributes), {}, {
          id
        }),
        children
      }]
    }];
  }
  function makeInlineSvgAbstract(params) {
    const {
      icons: {
        main,
        mask
      },
      prefix,
      iconName,
      transform: transform2,
      symbol,
      title,
      maskId,
      titleId,
      extra,
      watchable = false
    } = params;
    const {
      width,
      height
    } = mask.found ? mask : main;
    const isUploadedIcon = Lt.includes(prefix);
    const attrClass = [config.replacementClass, iconName ? "".concat(config.cssPrefix, "-").concat(iconName) : ""].filter((c$$1) => extra.classes.indexOf(c$$1) === -1).filter((c$$1) => c$$1 !== "" || !!c$$1).concat(extra.classes).join(" ");
    let content = {
      children: [],
      attributes: _objectSpread2$1(_objectSpread2$1({}, extra.attributes), {}, {
        "data-prefix": prefix,
        "data-icon": iconName,
        "class": attrClass,
        "role": extra.attributes.role || "img",
        "xmlns": "http://www.w3.org/2000/svg",
        "viewBox": "0 0 ".concat(width, " ").concat(height)
      })
    };
    const uploadedIconWidthStyle = isUploadedIcon && !~extra.classes.indexOf("fa-fw") ? {
      width: "".concat(width / height * 16 * 0.0625, "em")
    } : {};
    if (watchable) {
      content.attributes[DATA_FA_I2SVG] = "";
    }
    if (title) {
      content.children.push({
        tag: "title",
        attributes: {
          id: content.attributes["aria-labelledby"] || "title-".concat(titleId || nextUniqueId())
        },
        children: [title]
      });
      delete content.attributes.title;
    }
    const args = _objectSpread2$1(_objectSpread2$1({}, content), {}, {
      prefix,
      iconName,
      main,
      mask,
      maskId,
      transform: transform2,
      symbol,
      styles: _objectSpread2$1(_objectSpread2$1({}, uploadedIconWidthStyle), extra.styles)
    });
    const {
      children,
      attributes
    } = mask.found && main.found ? callProvided("generateAbstractMask", args) || {
      children: [],
      attributes: {}
    } : callProvided("generateAbstractIcon", args) || {
      children: [],
      attributes: {}
    };
    args.children = children;
    args.attributes = attributes;
    if (symbol) {
      return asSymbol(args);
    } else {
      return asIcon(args);
    }
  }
  function makeLayersTextAbstract(params) {
    const {
      content,
      width,
      height,
      transform: transform2,
      title,
      extra,
      watchable = false
    } = params;
    const attributes = _objectSpread2$1(_objectSpread2$1(_objectSpread2$1({}, extra.attributes), title ? {
      "title": title
    } : {}), {}, {
      "class": extra.classes.join(" ")
    });
    if (watchable) {
      attributes[DATA_FA_I2SVG] = "";
    }
    const styles2 = _objectSpread2$1({}, extra.styles);
    if (transformIsMeaningful(transform2)) {
      styles2["transform"] = transformForCss({
        transform: transform2,
        startCentered: true,
        width,
        height
      });
      styles2["-webkit-transform"] = styles2["transform"];
    }
    const styleString = joinStyles(styles2);
    if (styleString.length > 0) {
      attributes["style"] = styleString;
    }
    const val = [];
    val.push({
      tag: "span",
      attributes,
      children: [content]
    });
    if (title) {
      val.push({
        tag: "span",
        attributes: {
          class: "sr-only"
        },
        children: [title]
      });
    }
    return val;
  }
  function makeLayersCounterAbstract(params) {
    const {
      content,
      title,
      extra
    } = params;
    const attributes = _objectSpread2$1(_objectSpread2$1(_objectSpread2$1({}, extra.attributes), title ? {
      "title": title
    } : {}), {}, {
      "class": extra.classes.join(" ")
    });
    const styleString = joinStyles(extra.styles);
    if (styleString.length > 0) {
      attributes["style"] = styleString;
    }
    const val = [];
    val.push({
      tag: "span",
      attributes,
      children: [content]
    });
    if (title) {
      val.push({
        tag: "span",
        attributes: {
          class: "sr-only"
        },
        children: [title]
      });
    }
    return val;
  }
  const {
    styles: styles$1
  } = namespace;
  function asFoundIcon(icon2) {
    const width = icon2[0];
    const height = icon2[1];
    const [vectorData] = icon2.slice(4);
    let element = null;
    if (Array.isArray(vectorData)) {
      element = {
        tag: "g",
        attributes: {
          class: "".concat(config.cssPrefix, "-").concat(DUOTONE_CLASSES.GROUP)
        },
        children: [{
          tag: "path",
          attributes: {
            class: "".concat(config.cssPrefix, "-").concat(DUOTONE_CLASSES.SECONDARY),
            fill: "currentColor",
            d: vectorData[0]
          }
        }, {
          tag: "path",
          attributes: {
            class: "".concat(config.cssPrefix, "-").concat(DUOTONE_CLASSES.PRIMARY),
            fill: "currentColor",
            d: vectorData[1]
          }
        }]
      };
    } else {
      element = {
        tag: "path",
        attributes: {
          fill: "currentColor",
          d: vectorData
        }
      };
    }
    return {
      found: true,
      width,
      height,
      icon: element
    };
  }
  const missingIconResolutionMixin = {
    found: false,
    width: 512,
    height: 512
  };
  function maybeNotifyMissing(iconName, prefix) {
    if (!PRODUCTION$1 && !config.showMissingIcons && iconName) {
      console.error('Icon with name "'.concat(iconName, '" and prefix "').concat(prefix, '" is missing.'));
    }
  }
  function findIcon(iconName, prefix) {
    let givenPrefix = prefix;
    if (prefix === "fa" && config.styleDefault !== null) {
      prefix = getDefaultUsablePrefix();
    }
    return new Promise((resolve, reject) => {
      if (givenPrefix === "fa") {
        const shim = byOldName(iconName) || {};
        iconName = shim.iconName || iconName;
        prefix = shim.prefix || prefix;
      }
      if (iconName && prefix && styles$1[prefix] && styles$1[prefix][iconName]) {
        const icon2 = styles$1[prefix][iconName];
        return resolve(asFoundIcon(icon2));
      }
      maybeNotifyMissing(iconName, prefix);
      resolve(_objectSpread2$1(_objectSpread2$1({}, missingIconResolutionMixin), {}, {
        icon: config.showMissingIcons && iconName ? callProvided("missingIconAbstract") || {} : {}
      }));
    });
  }
  const noop$1 = () => {
  };
  const p$2 = config.measurePerformance && PERFORMANCE && PERFORMANCE.mark && PERFORMANCE.measure ? PERFORMANCE : {
    mark: noop$1,
    measure: noop$1
  };
  const preamble = 'FA "6.7.2"';
  const begin = (name) => {
    p$2.mark("".concat(preamble, " ").concat(name, " begins"));
    return () => end(name);
  };
  const end = (name) => {
    p$2.mark("".concat(preamble, " ").concat(name, " ends"));
    p$2.measure("".concat(preamble, " ").concat(name), "".concat(preamble, " ").concat(name, " begins"), "".concat(preamble, " ").concat(name, " ends"));
  };
  var perf = {
    begin,
    end
  };
  const noop$2 = () => {
  };
  function isWatched(node) {
    const i2svg = node.getAttribute ? node.getAttribute(DATA_FA_I2SVG) : null;
    return typeof i2svg === "string";
  }
  function hasPrefixAndIcon(node) {
    const prefix = node.getAttribute ? node.getAttribute(DATA_PREFIX) : null;
    const icon2 = node.getAttribute ? node.getAttribute(DATA_ICON) : null;
    return prefix && icon2;
  }
  function hasBeenReplaced(node) {
    return node && node.classList && node.classList.contains && node.classList.contains(config.replacementClass);
  }
  function getMutator() {
    if (config.autoReplaceSvg === true) {
      return mutators.replace;
    }
    const mutator = mutators[config.autoReplaceSvg];
    return mutator || mutators.replace;
  }
  function createElementNS(tag) {
    return DOCUMENT.createElementNS("http://www.w3.org/2000/svg", tag);
  }
  function createElement(tag) {
    return DOCUMENT.createElement(tag);
  }
  function convertSVG(abstractObj) {
    let params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    const {
      ceFn = abstractObj.tag === "svg" ? createElementNS : createElement
    } = params;
    if (typeof abstractObj === "string") {
      return DOCUMENT.createTextNode(abstractObj);
    }
    const tag = ceFn(abstractObj.tag);
    Object.keys(abstractObj.attributes || []).forEach(function(key) {
      tag.setAttribute(key, abstractObj.attributes[key]);
    });
    const children = abstractObj.children || [];
    children.forEach(function(child) {
      tag.appendChild(convertSVG(child, {
        ceFn
      }));
    });
    return tag;
  }
  function nodeAsComment(node) {
    let comment = " ".concat(node.outerHTML, " ");
    comment = "".concat(comment, "Font Awesome fontawesome.com ");
    return comment;
  }
  const mutators = {
    replace: function(mutation) {
      const node = mutation[0];
      if (node.parentNode) {
        mutation[1].forEach((abstract) => {
          node.parentNode.insertBefore(convertSVG(abstract), node);
        });
        if (node.getAttribute(DATA_FA_I2SVG) === null && config.keepOriginalSource) {
          let comment = DOCUMENT.createComment(nodeAsComment(node));
          node.parentNode.replaceChild(comment, node);
        } else {
          node.remove();
        }
      }
    },
    nest: function(mutation) {
      const node = mutation[0];
      const abstract = mutation[1];
      if (~classArray(node).indexOf(config.replacementClass)) {
        return mutators.replace(mutation);
      }
      const forSvg = new RegExp("".concat(config.cssPrefix, "-.*"));
      delete abstract[0].attributes.id;
      if (abstract[0].attributes.class) {
        const splitClasses = abstract[0].attributes.class.split(" ").reduce((acc, cls) => {
          if (cls === config.replacementClass || cls.match(forSvg)) {
            acc.toSvg.push(cls);
          } else {
            acc.toNode.push(cls);
          }
          return acc;
        }, {
          toNode: [],
          toSvg: []
        });
        abstract[0].attributes.class = splitClasses.toSvg.join(" ");
        if (splitClasses.toNode.length === 0) {
          node.removeAttribute("class");
        } else {
          node.setAttribute("class", splitClasses.toNode.join(" "));
        }
      }
      const newInnerHTML = abstract.map((a) => toHtml(a)).join("\n");
      node.setAttribute(DATA_FA_I2SVG, "");
      node.innerHTML = newInnerHTML;
    }
  };
  function performOperationSync(op) {
    op();
  }
  function perform(mutations, callback) {
    const callbackFunction = typeof callback === "function" ? callback : noop$2;
    if (mutations.length === 0) {
      callbackFunction();
    } else {
      let frame = performOperationSync;
      if (config.mutateApproach === MUTATION_APPROACH_ASYNC) {
        frame = WINDOW.requestAnimationFrame || performOperationSync;
      }
      frame(() => {
        const mutator = getMutator();
        const mark = perf.begin("mutate");
        mutations.map(mutator);
        mark();
        callbackFunction();
      });
    }
  }
  let disabled = false;
  function disableObservation() {
    disabled = true;
  }
  function enableObservation() {
    disabled = false;
  }
  let mo = null;
  function observe(options) {
    if (!MUTATION_OBSERVER) {
      return;
    }
    if (!config.observeMutations) {
      return;
    }
    const {
      treeCallback = noop$2,
      nodeCallback = noop$2,
      pseudoElementsCallback = noop$2,
      observeMutationsRoot = DOCUMENT
    } = options;
    mo = new MUTATION_OBSERVER((objects) => {
      if (disabled) return;
      const defaultPrefix = getDefaultUsablePrefix();
      toArray(objects).forEach((mutationRecord) => {
        if (mutationRecord.type === "childList" && mutationRecord.addedNodes.length > 0 && !isWatched(mutationRecord.addedNodes[0])) {
          if (config.searchPseudoElements) {
            pseudoElementsCallback(mutationRecord.target);
          }
          treeCallback(mutationRecord.target);
        }
        if (mutationRecord.type === "attributes" && mutationRecord.target.parentNode && config.searchPseudoElements) {
          pseudoElementsCallback(mutationRecord.target.parentNode);
        }
        if (mutationRecord.type === "attributes" && isWatched(mutationRecord.target) && ~ATTRIBUTES_WATCHED_FOR_MUTATION.indexOf(mutationRecord.attributeName)) {
          if (mutationRecord.attributeName === "class" && hasPrefixAndIcon(mutationRecord.target)) {
            const {
              prefix,
              iconName
            } = getCanonicalIcon(classArray(mutationRecord.target));
            mutationRecord.target.setAttribute(DATA_PREFIX, prefix || defaultPrefix);
            if (iconName) mutationRecord.target.setAttribute(DATA_ICON, iconName);
          } else if (hasBeenReplaced(mutationRecord.target)) {
            nodeCallback(mutationRecord.target);
          }
        }
      });
    });
    if (!IS_DOM) return;
    mo.observe(observeMutationsRoot, {
      childList: true,
      attributes: true,
      characterData: true,
      subtree: true
    });
  }
  function disconnect() {
    if (!mo) return;
    mo.disconnect();
  }
  function styleParser(node) {
    const style = node.getAttribute("style");
    let val = [];
    if (style) {
      val = style.split(";").reduce((acc, style2) => {
        const styles2 = style2.split(":");
        const prop = styles2[0];
        const value = styles2.slice(1);
        if (prop && value.length > 0) {
          acc[prop] = value.join(":").trim();
        }
        return acc;
      }, {});
    }
    return val;
  }
  function classParser(node) {
    const existingPrefix = node.getAttribute("data-prefix");
    const existingIconName = node.getAttribute("data-icon");
    const innerText = node.innerText !== void 0 ? node.innerText.trim() : "";
    let val = getCanonicalIcon(classArray(node));
    if (!val.prefix) {
      val.prefix = getDefaultUsablePrefix();
    }
    if (existingPrefix && existingIconName) {
      val.prefix = existingPrefix;
      val.iconName = existingIconName;
    }
    if (val.iconName && val.prefix) {
      return val;
    }
    if (val.prefix && innerText.length > 0) {
      val.iconName = byLigature(val.prefix, node.innerText) || byUnicode(val.prefix, toHex(node.innerText));
    }
    if (!val.iconName && config.autoFetchSvg && node.firstChild && node.firstChild.nodeType === Node.TEXT_NODE) {
      val.iconName = node.firstChild.data;
    }
    return val;
  }
  function attributesParser(node) {
    const extraAttributes = toArray(node.attributes).reduce((acc, attr) => {
      if (acc.name !== "class" && acc.name !== "style") {
        acc[attr.name] = attr.value;
      }
      return acc;
    }, {});
    const title = node.getAttribute("title");
    const titleId = node.getAttribute("data-fa-title-id");
    if (config.autoA11y) {
      if (title) {
        extraAttributes["aria-labelledby"] = "".concat(config.replacementClass, "-title-").concat(titleId || nextUniqueId());
      } else {
        extraAttributes["aria-hidden"] = "true";
        extraAttributes["focusable"] = "false";
      }
    }
    return extraAttributes;
  }
  function blankMeta() {
    return {
      iconName: null,
      title: null,
      titleId: null,
      prefix: null,
      transform: meaninglessTransform,
      symbol: false,
      mask: {
        iconName: null,
        prefix: null,
        rest: []
      },
      maskId: null,
      extra: {
        classes: [],
        styles: {},
        attributes: {}
      }
    };
  }
  function parseMeta(node) {
    let parser = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {
      styleParser: true
    };
    const {
      iconName,
      prefix,
      rest: extraClasses
    } = classParser(node);
    const extraAttributes = attributesParser(node);
    const pluginMeta = chainHooks("parseNodeAttributes", {}, node);
    let extraStyles = parser.styleParser ? styleParser(node) : [];
    return _objectSpread2$1({
      iconName,
      title: node.getAttribute("title"),
      titleId: node.getAttribute("data-fa-title-id"),
      prefix,
      transform: meaninglessTransform,
      mask: {
        iconName: null,
        prefix: null,
        rest: []
      },
      maskId: null,
      symbol: false,
      extra: {
        classes: extraClasses,
        styles: extraStyles,
        attributes: extraAttributes
      }
    }, pluginMeta);
  }
  const {
    styles: styles$2
  } = namespace;
  function generateMutation(node) {
    const nodeMeta = config.autoReplaceSvg === "nest" ? parseMeta(node, {
      styleParser: false
    }) : parseMeta(node);
    if (~nodeMeta.extra.classes.indexOf(LAYERS_TEXT_CLASSNAME)) {
      return callProvided("generateLayersText", node, nodeMeta);
    } else {
      return callProvided("generateSvgReplacementMutation", node, nodeMeta);
    }
  }
  function getKnownPrefixes() {
    return [...Ft, ...Ia];
  }
  function onTree(root) {
    let callback = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
    if (!IS_DOM) return Promise.resolve();
    const htmlClassList = DOCUMENT.documentElement.classList;
    const hclAdd = (suffix) => htmlClassList.add("".concat(HTML_CLASS_I2SVG_BASE_CLASS, "-").concat(suffix));
    const hclRemove = (suffix) => htmlClassList.remove("".concat(HTML_CLASS_I2SVG_BASE_CLASS, "-").concat(suffix));
    const prefixes = config.autoFetchSvg ? getKnownPrefixes() : P.concat(Object.keys(styles$2));
    if (!prefixes.includes("fa")) {
      prefixes.push("fa");
    }
    const prefixesDomQuery = [".".concat(LAYERS_TEXT_CLASSNAME, ":not([").concat(DATA_FA_I2SVG, "])")].concat(prefixes.map((p$$1) => ".".concat(p$$1, ":not([").concat(DATA_FA_I2SVG, "])"))).join(", ");
    if (prefixesDomQuery.length === 0) {
      return Promise.resolve();
    }
    let candidates = [];
    try {
      candidates = toArray(root.querySelectorAll(prefixesDomQuery));
    } catch (e$$1) {
    }
    if (candidates.length > 0) {
      hclAdd("pending");
      hclRemove("complete");
    } else {
      return Promise.resolve();
    }
    const mark = perf.begin("onTree");
    const mutations = candidates.reduce((acc, node) => {
      try {
        const mutation = generateMutation(node);
        if (mutation) {
          acc.push(mutation);
        }
      } catch (e$$1) {
        if (!PRODUCTION$1) {
          if (e$$1.name === "MissingIcon") {
            console.error(e$$1);
          }
        }
      }
      return acc;
    }, []);
    return new Promise((resolve, reject) => {
      Promise.all(mutations).then((resolvedMutations) => {
        perform(resolvedMutations, () => {
          hclAdd("active");
          hclAdd("complete");
          hclRemove("pending");
          if (typeof callback === "function") callback();
          mark();
          resolve();
        });
      }).catch((e$$1) => {
        mark();
        reject(e$$1);
      });
    });
  }
  function onNode(node) {
    let callback = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
    generateMutation(node).then((mutation) => {
      if (mutation) {
        perform([mutation], callback);
      }
    });
  }
  function resolveIcons(next) {
    return function(maybeIconDefinition) {
      let params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      const iconDefinition = (maybeIconDefinition || {}).icon ? maybeIconDefinition : findIconDefinition(maybeIconDefinition || {});
      let {
        mask
      } = params;
      if (mask) {
        mask = (mask || {}).icon ? mask : findIconDefinition(mask || {});
      }
      return next(iconDefinition, _objectSpread2$1(_objectSpread2$1({}, params), {}, {
        mask
      }));
    };
  }
  const render = function(iconDefinition) {
    let params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    const {
      transform: transform2 = meaninglessTransform,
      symbol = false,
      mask = null,
      maskId = null,
      title = null,
      titleId = null,
      classes = [],
      attributes = {},
      styles: styles2 = {}
    } = params;
    if (!iconDefinition) return;
    const {
      prefix,
      iconName,
      icon: icon2
    } = iconDefinition;
    return domVariants(_objectSpread2$1({
      type: "icon"
    }, iconDefinition), () => {
      callHooks("beforeDOMElementCreation", {
        iconDefinition,
        params
      });
      if (config.autoA11y) {
        if (title) {
          attributes["aria-labelledby"] = "".concat(config.replacementClass, "-title-").concat(titleId || nextUniqueId());
        } else {
          attributes["aria-hidden"] = "true";
          attributes["focusable"] = "false";
        }
      }
      return makeInlineSvgAbstract({
        icons: {
          main: asFoundIcon(icon2),
          mask: mask ? asFoundIcon(mask.icon) : {
            found: false,
            width: null,
            height: null,
            icon: {}
          }
        },
        prefix,
        iconName,
        transform: _objectSpread2$1(_objectSpread2$1({}, meaninglessTransform), transform2),
        symbol,
        title,
        maskId,
        titleId,
        extra: {
          attributes,
          styles: styles2,
          classes
        }
      });
    });
  };
  var ReplaceElements = {
    mixout() {
      return {
        icon: resolveIcons(render)
      };
    },
    hooks() {
      return {
        mutationObserverCallbacks(accumulator) {
          accumulator.treeCallback = onTree;
          accumulator.nodeCallback = onNode;
          return accumulator;
        }
      };
    },
    provides(providers$$1) {
      providers$$1.i2svg = function(params) {
        const {
          node = DOCUMENT,
          callback = () => {
          }
        } = params;
        return onTree(node, callback);
      };
      providers$$1.generateSvgReplacementMutation = function(node, nodeMeta) {
        const {
          iconName,
          title,
          titleId,
          prefix,
          transform: transform2,
          symbol,
          mask,
          maskId,
          extra
        } = nodeMeta;
        return new Promise((resolve, reject) => {
          Promise.all([findIcon(iconName, prefix), mask.iconName ? findIcon(mask.iconName, mask.prefix) : Promise.resolve({
            found: false,
            width: 512,
            height: 512,
            icon: {}
          })]).then((_ref) => {
            let [main, mask2] = _ref;
            resolve([node, makeInlineSvgAbstract({
              icons: {
                main,
                mask: mask2
              },
              prefix,
              iconName,
              transform: transform2,
              symbol,
              maskId,
              title,
              titleId,
              extra,
              watchable: true
            })]);
          }).catch(reject);
        });
      };
      providers$$1.generateAbstractIcon = function(_ref2) {
        let {
          children,
          attributes,
          main,
          transform: transform2,
          styles: styles2
        } = _ref2;
        const styleString = joinStyles(styles2);
        if (styleString.length > 0) {
          attributes["style"] = styleString;
        }
        let nextChild;
        if (transformIsMeaningful(transform2)) {
          nextChild = callProvided("generateAbstractTransformGrouping", {
            main,
            transform: transform2,
            containerWidth: main.width,
            iconWidth: main.width
          });
        }
        children.push(nextChild || main.icon);
        return {
          children,
          attributes
        };
      };
    }
  };
  var Layers = {
    mixout() {
      return {
        layer(assembler) {
          let params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          const {
            classes = []
          } = params;
          return domVariants({
            type: "layer"
          }, () => {
            callHooks("beforeDOMElementCreation", {
              assembler,
              params
            });
            let children = [];
            assembler((args) => {
              Array.isArray(args) ? args.map((a) => {
                children = children.concat(a.abstract);
              }) : children = children.concat(args.abstract);
            });
            return [{
              tag: "span",
              attributes: {
                class: ["".concat(config.cssPrefix, "-layers"), ...classes].join(" ")
              },
              children
            }];
          });
        }
      };
    }
  };
  var LayersCounter = {
    mixout() {
      return {
        counter(content) {
          let params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          const {
            title = null,
            classes = [],
            attributes = {},
            styles: styles2 = {}
          } = params;
          return domVariants({
            type: "counter",
            content
          }, () => {
            callHooks("beforeDOMElementCreation", {
              content,
              params
            });
            return makeLayersCounterAbstract({
              content: content.toString(),
              title,
              extra: {
                attributes,
                styles: styles2,
                classes: ["".concat(config.cssPrefix, "-layers-counter"), ...classes]
              }
            });
          });
        }
      };
    }
  };
  var LayersText = {
    mixout() {
      return {
        text(content) {
          let params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          const {
            transform: transform2 = meaninglessTransform,
            title = null,
            classes = [],
            attributes = {},
            styles: styles2 = {}
          } = params;
          return domVariants({
            type: "text",
            content
          }, () => {
            callHooks("beforeDOMElementCreation", {
              content,
              params
            });
            return makeLayersTextAbstract({
              content,
              transform: _objectSpread2$1(_objectSpread2$1({}, meaninglessTransform), transform2),
              title,
              extra: {
                attributes,
                styles: styles2,
                classes: ["".concat(config.cssPrefix, "-layers-text"), ...classes]
              }
            });
          });
        }
      };
    },
    provides(providers$$1) {
      providers$$1.generateLayersText = function(node, nodeMeta) {
        const {
          title,
          transform: transform2,
          extra
        } = nodeMeta;
        let width = null;
        let height = null;
        if (IS_IE) {
          const computedFontSize = parseInt(getComputedStyle(node).fontSize, 10);
          const boundingClientRect = node.getBoundingClientRect();
          width = boundingClientRect.width / computedFontSize;
          height = boundingClientRect.height / computedFontSize;
        }
        if (config.autoA11y && !title) {
          extra.attributes["aria-hidden"] = "true";
        }
        return Promise.resolve([node, makeLayersTextAbstract({
          content: node.innerHTML,
          width,
          height,
          transform: transform2,
          title,
          extra,
          watchable: true
        })]);
      };
    }
  };
  const CLEAN_CONTENT_PATTERN = new RegExp('"', "ug");
  const SECONDARY_UNICODE_RANGE = [1105920, 1112319];
  const _FONT_FAMILY_WEIGHT_TO_PREFIX = _objectSpread2$1(_objectSpread2$1(_objectSpread2$1(_objectSpread2$1({}, {
    FontAwesome: {
      normal: "fas",
      400: "fas"
    }
  }), lt), wa), Yt);
  const FONT_FAMILY_WEIGHT_TO_PREFIX = Object.keys(_FONT_FAMILY_WEIGHT_TO_PREFIX).reduce((acc, key) => {
    acc[key.toLowerCase()] = _FONT_FAMILY_WEIGHT_TO_PREFIX[key];
    return acc;
  }, {});
  const FONT_FAMILY_WEIGHT_FALLBACK = Object.keys(FONT_FAMILY_WEIGHT_TO_PREFIX).reduce((acc, fontFamily) => {
    const weights = FONT_FAMILY_WEIGHT_TO_PREFIX[fontFamily];
    acc[fontFamily] = weights[900] || [...Object.entries(weights)][0][1];
    return acc;
  }, {});
  function hexValueFromContent(content) {
    const cleaned = content.replace(CLEAN_CONTENT_PATTERN, "");
    const codePoint = codePointAt(cleaned, 0);
    const isPrependTen = codePoint >= SECONDARY_UNICODE_RANGE[0] && codePoint <= SECONDARY_UNICODE_RANGE[1];
    const isDoubled = cleaned.length === 2 ? cleaned[0] === cleaned[1] : false;
    return {
      value: isDoubled ? toHex(cleaned[0]) : toHex(cleaned),
      isSecondary: isPrependTen || isDoubled
    };
  }
  function getPrefix(fontFamily, fontWeight) {
    const fontFamilySanitized = fontFamily.replace(/^['"]|['"]$/g, "").toLowerCase();
    const fontWeightInteger = parseInt(fontWeight);
    const fontWeightSanitized = isNaN(fontWeightInteger) ? "normal" : fontWeightInteger;
    return (FONT_FAMILY_WEIGHT_TO_PREFIX[fontFamilySanitized] || {})[fontWeightSanitized] || FONT_FAMILY_WEIGHT_FALLBACK[fontFamilySanitized];
  }
  function replaceForPosition(node, position) {
    const pendingAttribute = "".concat(DATA_FA_PSEUDO_ELEMENT_PENDING).concat(position.replace(":", "-"));
    return new Promise((resolve, reject) => {
      if (node.getAttribute(pendingAttribute) !== null) {
        return resolve();
      }
      const children = toArray(node.children);
      const alreadyProcessedPseudoElement = children.filter((c$$1) => c$$1.getAttribute(DATA_FA_PSEUDO_ELEMENT) === position)[0];
      const styles2 = WINDOW.getComputedStyle(node, position);
      const fontFamily = styles2.getPropertyValue("font-family");
      const fontFamilyMatch = fontFamily.match(FONT_FAMILY_PATTERN);
      const fontWeight = styles2.getPropertyValue("font-weight");
      const content = styles2.getPropertyValue("content");
      if (alreadyProcessedPseudoElement && !fontFamilyMatch) {
        node.removeChild(alreadyProcessedPseudoElement);
        return resolve();
      } else if (fontFamilyMatch && content !== "none" && content !== "") {
        const content2 = styles2.getPropertyValue("content");
        let prefix = getPrefix(fontFamily, fontWeight);
        const {
          value: hexValue,
          isSecondary
        } = hexValueFromContent(content2);
        const isV4 = fontFamilyMatch[0].startsWith("FontAwesome");
        let iconName = byUnicode(prefix, hexValue);
        let iconIdentifier = iconName;
        if (isV4) {
          const iconName4 = byOldUnicode(hexValue);
          if (iconName4.iconName && iconName4.prefix) {
            iconName = iconName4.iconName;
            prefix = iconName4.prefix;
          }
        }
        if (iconName && !isSecondary && (!alreadyProcessedPseudoElement || alreadyProcessedPseudoElement.getAttribute(DATA_PREFIX) !== prefix || alreadyProcessedPseudoElement.getAttribute(DATA_ICON) !== iconIdentifier)) {
          node.setAttribute(pendingAttribute, iconIdentifier);
          if (alreadyProcessedPseudoElement) {
            node.removeChild(alreadyProcessedPseudoElement);
          }
          const meta = blankMeta();
          const {
            extra
          } = meta;
          extra.attributes[DATA_FA_PSEUDO_ELEMENT] = position;
          findIcon(iconName, prefix).then((main) => {
            const abstract = makeInlineSvgAbstract(_objectSpread2$1(_objectSpread2$1({}, meta), {}, {
              icons: {
                main,
                mask: emptyCanonicalIcon()
              },
              prefix,
              iconName: iconIdentifier,
              extra,
              watchable: true
            }));
            const element = DOCUMENT.createElementNS("http://www.w3.org/2000/svg", "svg");
            if (position === "::before") {
              node.insertBefore(element, node.firstChild);
            } else {
              node.appendChild(element);
            }
            element.outerHTML = abstract.map((a$$1) => toHtml(a$$1)).join("\n");
            node.removeAttribute(pendingAttribute);
            resolve();
          }).catch(reject);
        } else {
          resolve();
        }
      } else {
        resolve();
      }
    });
  }
  function replace(node) {
    return Promise.all([replaceForPosition(node, "::before"), replaceForPosition(node, "::after")]);
  }
  function processable(node) {
    return node.parentNode !== document.head && !~TAGNAMES_TO_SKIP_FOR_PSEUDOELEMENTS.indexOf(node.tagName.toUpperCase()) && !node.getAttribute(DATA_FA_PSEUDO_ELEMENT) && (!node.parentNode || node.parentNode.tagName !== "svg");
  }
  function searchPseudoElements(root) {
    if (!IS_DOM) return;
    return new Promise((resolve, reject) => {
      const operations = toArray(root.querySelectorAll("*")).filter(processable).map(replace);
      const end2 = perf.begin("searchPseudoElements");
      disableObservation();
      Promise.all(operations).then(() => {
        end2();
        enableObservation();
        resolve();
      }).catch(() => {
        end2();
        enableObservation();
        reject();
      });
    });
  }
  var PseudoElements = {
    hooks() {
      return {
        mutationObserverCallbacks(accumulator) {
          accumulator.pseudoElementsCallback = searchPseudoElements;
          return accumulator;
        }
      };
    },
    provides(providers2) {
      providers2.pseudoElements2svg = function(params) {
        const {
          node = DOCUMENT
        } = params;
        if (config.searchPseudoElements) {
          searchPseudoElements(node);
        }
      };
    }
  };
  let _unwatched = false;
  var MutationObserver$1 = {
    mixout() {
      return {
        dom: {
          unwatch() {
            disableObservation();
            _unwatched = true;
          }
        }
      };
    },
    hooks() {
      return {
        bootstrap() {
          observe(chainHooks("mutationObserverCallbacks", {}));
        },
        noAuto() {
          disconnect();
        },
        watch(params) {
          const {
            observeMutationsRoot
          } = params;
          if (_unwatched) {
            enableObservation();
          } else {
            observe(chainHooks("mutationObserverCallbacks", {
              observeMutationsRoot
            }));
          }
        }
      };
    }
  };
  const parseTransformString = (transformString) => {
    let transform2 = {
      size: 16,
      x: 0,
      y: 0,
      flipX: false,
      flipY: false,
      rotate: 0
    };
    return transformString.toLowerCase().split(" ").reduce((acc, n) => {
      const parts = n.toLowerCase().split("-");
      const first = parts[0];
      let rest = parts.slice(1).join("-");
      if (first && rest === "h") {
        acc.flipX = true;
        return acc;
      }
      if (first && rest === "v") {
        acc.flipY = true;
        return acc;
      }
      rest = parseFloat(rest);
      if (isNaN(rest)) {
        return acc;
      }
      switch (first) {
        case "grow":
          acc.size = acc.size + rest;
          break;
        case "shrink":
          acc.size = acc.size - rest;
          break;
        case "left":
          acc.x = acc.x - rest;
          break;
        case "right":
          acc.x = acc.x + rest;
          break;
        case "up":
          acc.y = acc.y - rest;
          break;
        case "down":
          acc.y = acc.y + rest;
          break;
        case "rotate":
          acc.rotate = acc.rotate + rest;
          break;
      }
      return acc;
    }, transform2);
  };
  var PowerTransforms = {
    mixout() {
      return {
        parse: {
          transform: (transformString) => {
            return parseTransformString(transformString);
          }
        }
      };
    },
    hooks() {
      return {
        parseNodeAttributes(accumulator, node) {
          const transformString = node.getAttribute("data-fa-transform");
          if (transformString) {
            accumulator.transform = parseTransformString(transformString);
          }
          return accumulator;
        }
      };
    },
    provides(providers2) {
      providers2.generateAbstractTransformGrouping = function(_ref) {
        let {
          main,
          transform: transform2,
          containerWidth,
          iconWidth
        } = _ref;
        const outer = {
          transform: "translate(".concat(containerWidth / 2, " 256)")
        };
        const innerTranslate = "translate(".concat(transform2.x * 32, ", ").concat(transform2.y * 32, ") ");
        const innerScale = "scale(".concat(transform2.size / 16 * (transform2.flipX ? -1 : 1), ", ").concat(transform2.size / 16 * (transform2.flipY ? -1 : 1), ") ");
        const innerRotate = "rotate(".concat(transform2.rotate, " 0 0)");
        const inner = {
          transform: "".concat(innerTranslate, " ").concat(innerScale, " ").concat(innerRotate)
        };
        const path = {
          transform: "translate(".concat(iconWidth / 2 * -1, " -256)")
        };
        const operations = {
          outer,
          inner,
          path
        };
        return {
          tag: "g",
          attributes: _objectSpread2$1({}, operations.outer),
          children: [{
            tag: "g",
            attributes: _objectSpread2$1({}, operations.inner),
            children: [{
              tag: main.icon.tag,
              children: main.icon.children,
              attributes: _objectSpread2$1(_objectSpread2$1({}, main.icon.attributes), operations.path)
            }]
          }]
        };
      };
    }
  };
  const ALL_SPACE = {
    x: 0,
    y: 0,
    width: "100%",
    height: "100%"
  };
  function fillBlack(abstract) {
    let force = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
    if (abstract.attributes && (abstract.attributes.fill || force)) {
      abstract.attributes.fill = "black";
    }
    return abstract;
  }
  function deGroup(abstract) {
    if (abstract.tag === "g") {
      return abstract.children;
    } else {
      return [abstract];
    }
  }
  var Masks = {
    hooks() {
      return {
        parseNodeAttributes(accumulator, node) {
          const maskData = node.getAttribute("data-fa-mask");
          const mask = !maskData ? emptyCanonicalIcon() : getCanonicalIcon(maskData.split(" ").map((i) => i.trim()));
          if (!mask.prefix) {
            mask.prefix = getDefaultUsablePrefix();
          }
          accumulator.mask = mask;
          accumulator.maskId = node.getAttribute("data-fa-mask-id");
          return accumulator;
        }
      };
    },
    provides(providers2) {
      providers2.generateAbstractMask = function(_ref) {
        let {
          children,
          attributes,
          main,
          mask,
          maskId: explicitMaskId,
          transform: transform2
        } = _ref;
        const {
          width: mainWidth,
          icon: mainPath
        } = main;
        const {
          width: maskWidth,
          icon: maskPath
        } = mask;
        const trans = transformForSvg({
          transform: transform2,
          containerWidth: maskWidth,
          iconWidth: mainWidth
        });
        const maskRect = {
          tag: "rect",
          attributes: _objectSpread2$1(_objectSpread2$1({}, ALL_SPACE), {}, {
            fill: "white"
          })
        };
        const maskInnerGroupChildrenMixin = mainPath.children ? {
          children: mainPath.children.map(fillBlack)
        } : {};
        const maskInnerGroup = {
          tag: "g",
          attributes: _objectSpread2$1({}, trans.inner),
          children: [fillBlack(_objectSpread2$1({
            tag: mainPath.tag,
            attributes: _objectSpread2$1(_objectSpread2$1({}, mainPath.attributes), trans.path)
          }, maskInnerGroupChildrenMixin))]
        };
        const maskOuterGroup = {
          tag: "g",
          attributes: _objectSpread2$1({}, trans.outer),
          children: [maskInnerGroup]
        };
        const maskId = "mask-".concat(explicitMaskId || nextUniqueId());
        const clipId = "clip-".concat(explicitMaskId || nextUniqueId());
        const maskTag = {
          tag: "mask",
          attributes: _objectSpread2$1(_objectSpread2$1({}, ALL_SPACE), {}, {
            id: maskId,
            maskUnits: "userSpaceOnUse",
            maskContentUnits: "userSpaceOnUse"
          }),
          children: [maskRect, maskOuterGroup]
        };
        const defs = {
          tag: "defs",
          children: [{
            tag: "clipPath",
            attributes: {
              id: clipId
            },
            children: deGroup(maskPath)
          }, maskTag]
        };
        children.push(defs, {
          tag: "rect",
          attributes: _objectSpread2$1({
            fill: "currentColor",
            "clip-path": "url(#".concat(clipId, ")"),
            mask: "url(#".concat(maskId, ")")
          }, ALL_SPACE)
        });
        return {
          children,
          attributes
        };
      };
    }
  };
  var MissingIconIndicator = {
    provides(providers2) {
      let reduceMotion = false;
      if (WINDOW.matchMedia) {
        reduceMotion = WINDOW.matchMedia("(prefers-reduced-motion: reduce)").matches;
      }
      providers2.missingIconAbstract = function() {
        const gChildren = [];
        const FILL = {
          fill: "currentColor"
        };
        const ANIMATION_BASE = {
          attributeType: "XML",
          repeatCount: "indefinite",
          dur: "2s"
        };
        gChildren.push({
          tag: "path",
          attributes: _objectSpread2$1(_objectSpread2$1({}, FILL), {}, {
            d: "M156.5,447.7l-12.6,29.5c-18.7-9.5-35.9-21.2-51.5-34.9l22.7-22.7C127.6,430.5,141.5,440,156.5,447.7z M40.6,272H8.5 c1.4,21.2,5.4,41.7,11.7,61.1L50,321.2C45.1,305.5,41.8,289,40.6,272z M40.6,240c1.4-18.8,5.2-37,11.1-54.1l-29.5-12.6 C14.7,194.3,10,216.7,8.5,240H40.6z M64.3,156.5c7.8-14.9,17.2-28.8,28.1-41.5L69.7,92.3c-13.7,15.6-25.5,32.8-34.9,51.5 L64.3,156.5z M397,419.6c-13.9,12-29.4,22.3-46.1,30.4l11.9,29.8c20.7-9.9,39.8-22.6,56.9-37.6L397,419.6z M115,92.4 c13.9-12,29.4-22.3,46.1-30.4l-11.9-29.8c-20.7,9.9-39.8,22.6-56.8,37.6L115,92.4z M447.7,355.5c-7.8,14.9-17.2,28.8-28.1,41.5 l22.7,22.7c13.7-15.6,25.5-32.9,34.9-51.5L447.7,355.5z M471.4,272c-1.4,18.8-5.2,37-11.1,54.1l29.5,12.6 c7.5-21.1,12.2-43.5,13.6-66.8H471.4z M321.2,462c-15.7,5-32.2,8.2-49.2,9.4v32.1c21.2-1.4,41.7-5.4,61.1-11.7L321.2,462z M240,471.4c-18.8-1.4-37-5.2-54.1-11.1l-12.6,29.5c21.1,7.5,43.5,12.2,66.8,13.6V471.4z M462,190.8c5,15.7,8.2,32.2,9.4,49.2h32.1 c-1.4-21.2-5.4-41.7-11.7-61.1L462,190.8z M92.4,397c-12-13.9-22.3-29.4-30.4-46.1l-29.8,11.9c9.9,20.7,22.6,39.8,37.6,56.9 L92.4,397z M272,40.6c18.8,1.4,36.9,5.2,54.1,11.1l12.6-29.5C317.7,14.7,295.3,10,272,8.5V40.6z M190.8,50 c15.7-5,32.2-8.2,49.2-9.4V8.5c-21.2,1.4-41.7,5.4-61.1,11.7L190.8,50z M442.3,92.3L419.6,115c12,13.9,22.3,29.4,30.5,46.1 l29.8-11.9C470,128.5,457.3,109.4,442.3,92.3z M397,92.4l22.7-22.7c-15.6-13.7-32.8-25.5-51.5-34.9l-12.6,29.5 C370.4,72.1,384.4,81.5,397,92.4z"
          })
        });
        const OPACITY_ANIMATE = _objectSpread2$1(_objectSpread2$1({}, ANIMATION_BASE), {}, {
          attributeName: "opacity"
        });
        const dot = {
          tag: "circle",
          attributes: _objectSpread2$1(_objectSpread2$1({}, FILL), {}, {
            cx: "256",
            cy: "364",
            r: "28"
          }),
          children: []
        };
        if (!reduceMotion) {
          dot.children.push({
            tag: "animate",
            attributes: _objectSpread2$1(_objectSpread2$1({}, ANIMATION_BASE), {}, {
              attributeName: "r",
              values: "28;14;28;28;14;28;"
            })
          }, {
            tag: "animate",
            attributes: _objectSpread2$1(_objectSpread2$1({}, OPACITY_ANIMATE), {}, {
              values: "1;0;1;1;0;1;"
            })
          });
        }
        gChildren.push(dot);
        gChildren.push({
          tag: "path",
          attributes: _objectSpread2$1(_objectSpread2$1({}, FILL), {}, {
            opacity: "1",
            d: "M263.7,312h-16c-6.6,0-12-5.4-12-12c0-71,77.4-63.9,77.4-107.8c0-20-17.8-40.2-57.4-40.2c-29.1,0-44.3,9.6-59.2,28.7 c-3.9,5-11.1,6-16.2,2.4l-13.1-9.2c-5.6-3.9-6.9-11.8-2.6-17.2c21.2-27.2,46.4-44.7,91.2-44.7c52.3,0,97.4,29.8,97.4,80.2 c0,67.6-77.4,63.5-77.4,107.8C275.7,306.6,270.3,312,263.7,312z"
          }),
          children: reduceMotion ? [] : [{
            tag: "animate",
            attributes: _objectSpread2$1(_objectSpread2$1({}, OPACITY_ANIMATE), {}, {
              values: "1;0;0;0;0;1;"
            })
          }]
        });
        if (!reduceMotion) {
          gChildren.push({
            tag: "path",
            attributes: _objectSpread2$1(_objectSpread2$1({}, FILL), {}, {
              opacity: "0",
              d: "M232.5,134.5l7,168c0.3,6.4,5.6,11.5,12,11.5h9c6.4,0,11.7-5.1,12-11.5l7-168c0.3-6.8-5.2-12.5-12-12.5h-23 C237.7,122,232.2,127.7,232.5,134.5z"
            }),
            children: [{
              tag: "animate",
              attributes: _objectSpread2$1(_objectSpread2$1({}, OPACITY_ANIMATE), {}, {
                values: "0;0;1;1;0;0;"
              })
            }]
          });
        }
        return {
          tag: "g",
          attributes: {
            "class": "missing"
          },
          children: gChildren
        };
      };
    }
  };
  var SvgSymbols = {
    hooks() {
      return {
        parseNodeAttributes(accumulator, node) {
          const symbolData = node.getAttribute("data-fa-symbol");
          const symbol = symbolData === null ? false : symbolData === "" ? true : symbolData;
          accumulator["symbol"] = symbol;
          return accumulator;
        }
      };
    }
  };
  var plugins = [InjectCSS, ReplaceElements, Layers, LayersCounter, LayersText, PseudoElements, MutationObserver$1, PowerTransforms, Masks, MissingIconIndicator, SvgSymbols];
  registerPlugins(plugins, {
    mixoutsTo: api
  });
  api.noAuto;
  const config$1 = api.config;
  api.library;
  api.dom;
  const parse$1 = api.parse;
  api.findIconDefinition;
  api.toHtml;
  const icon = api.icon;
  api.layer;
  const text = api.text;
  api.counter;
  function _arrayLikeToArray(r2, a) {
    (null == a || a > r2.length) && (a = r2.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r2[e];
    return n;
  }
  function _arrayWithoutHoles(r2) {
    if (Array.isArray(r2)) return _arrayLikeToArray(r2);
  }
  function _defineProperty(e, r2, t2) {
    return (r2 = _toPropertyKey(r2)) in e ? Object.defineProperty(e, r2, {
      value: t2,
      enumerable: true,
      configurable: true,
      writable: true
    }) : e[r2] = t2, e;
  }
  function _iterableToArray(r2) {
    if ("undefined" != typeof Symbol && null != r2[Symbol.iterator] || null != r2["@@iterator"]) return Array.from(r2);
  }
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function ownKeys(e, r2) {
    var t2 = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o2 = Object.getOwnPropertySymbols(e);
      r2 && (o2 = o2.filter(function(r22) {
        return Object.getOwnPropertyDescriptor(e, r22).enumerable;
      })), t2.push.apply(t2, o2);
    }
    return t2;
  }
  function _objectSpread2(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t2 = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys(Object(t2), true).forEach(function(r22) {
        _defineProperty(e, r22, t2[r22]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t2)) : ownKeys(Object(t2)).forEach(function(r22) {
        Object.defineProperty(e, r22, Object.getOwnPropertyDescriptor(t2, r22));
      });
    }
    return e;
  }
  function _objectWithoutProperties(e, t2) {
    if (null == e) return {};
    var o2, r2, i = _objectWithoutPropertiesLoose(e, t2);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r2 = 0; r2 < n.length; r2++) o2 = n[r2], -1 === t2.indexOf(o2) && {}.propertyIsEnumerable.call(e, o2) && (i[o2] = e[o2]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose(r2, e) {
    if (null == r2) return {};
    var t2 = {};
    for (var n in r2) if ({}.hasOwnProperty.call(r2, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t2[n] = r2[n];
    }
    return t2;
  }
  function _toConsumableArray(r2) {
    return _arrayWithoutHoles(r2) || _iterableToArray(r2) || _unsupportedIterableToArray(r2) || _nonIterableSpread();
  }
  function _toPrimitive(t2, r2) {
    if ("object" != typeof t2 || !t2) return t2;
    var e = t2[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t2, r2);
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t2);
  }
  function _toPropertyKey(t2) {
    var i = _toPrimitive(t2, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _typeof(o2) {
    "@babel/helpers - typeof";
    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o22) {
      return typeof o22;
    } : function(o22) {
      return o22 && "function" == typeof Symbol && o22.constructor === Symbol && o22 !== Symbol.prototype ? "symbol" : typeof o22;
    }, _typeof(o2);
  }
  function _unsupportedIterableToArray(r2, a) {
    if (r2) {
      if ("string" == typeof r2) return _arrayLikeToArray(r2, a);
      var t2 = {}.toString.call(r2).slice(8, -1);
      return "Object" === t2 && r2.constructor && (t2 = r2.constructor.name), "Map" === t2 || "Set" === t2 ? Array.from(r2) : "Arguments" === t2 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t2) ? _arrayLikeToArray(r2, a) : void 0;
    }
  }
  function objectWithKey(key, value) {
    return Array.isArray(value) && value.length > 0 || !Array.isArray(value) && value ? _defineProperty({}, key, value) : {};
  }
  function classList(props) {
    var _classes;
    var classes = (_classes = {
      "fa-spin": props.spin,
      "fa-pulse": props.pulse,
      // the fixedWidth property has been deprecated as of version 7.0.0
      "fa-fw": props.fixedWidth,
      "fa-border": props.border,
      "fa-li": props.listItem,
      "fa-inverse": props.inverse,
      "fa-flip": props.flip === true,
      "fa-flip-horizontal": props.flip === "horizontal" || props.flip === "both",
      "fa-flip-vertical": props.flip === "vertical" || props.flip === "both"
    }, _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_classes, "fa-".concat(props.size), props.size !== null), "fa-rotate-".concat(props.rotation), props.rotation !== null), "fa-rotate-by", props.rotateBy), "fa-pull-".concat(props.pull), props.pull !== null), "fa-swap-opacity", props.swapOpacity), "fa-bounce", props.bounce), "fa-shake", props.shake), "fa-beat", props.beat), "fa-fade", props.fade), "fa-beat-fade", props.beatFade), _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_classes, "fa-flash", props.flash), "fa-spin-pulse", props.spinPulse), "fa-spin-reverse", props.spinReverse), "fa-width-auto", props.widthAuto), "fa-canvas-square", props.canvasSquare), "fa-canvas-roomy", props.canvasRoomy), "fa-flip-360", props.flip360), "fa-buzz", props.buzz), "fa-float", props.float), "fa-jello", props.jello), _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_classes, "fa-spin-snap", props.spinSnap), "fa-spin-snap-4", props.spinSnap4), "fa-spin-snap-8", props.spinSnap8), "fa-swing", props.swing), "fa-wag", props.wag));
    return Object.keys(classes).map(function(key) {
      return classes[key] ? key : null;
    }).filter(function(key) {
      return key;
    });
  }
  var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
  var humps$1 = { exports: {} };
  (function(module) {
    (function(global2) {
      var _processKeys = function(convert2, obj, options) {
        if (!_isObject(obj) || _isDate(obj) || _isRegExp(obj) || _isBoolean(obj) || _isFunction(obj)) {
          return obj;
        }
        var output, i = 0, l = 0;
        if (_isArray(obj)) {
          output = [];
          for (l = obj.length; i < l; i++) {
            output.push(_processKeys(convert2, obj[i], options));
          }
        } else {
          output = {};
          for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
              output[convert2(key, options)] = _processKeys(convert2, obj[key], options);
            }
          }
        }
        return output;
      };
      var separateWords = function(string, options) {
        options = options || {};
        var separator = options.separator || "_";
        var split = options.split || /(?=[A-Z])/;
        return string.split(split).join(separator);
      };
      var camelize = function(string) {
        if (_isNumerical(string)) {
          return string;
        }
        string = string.replace(/[\-_\s]+(.)?/g, function(match, chr) {
          return chr ? chr.toUpperCase() : "";
        });
        return string.substr(0, 1).toLowerCase() + string.substr(1);
      };
      var pascalize = function(string) {
        var camelized = camelize(string);
        return camelized.substr(0, 1).toUpperCase() + camelized.substr(1);
      };
      var decamelize = function(string, options) {
        return separateWords(string, options).toLowerCase();
      };
      var toString = Object.prototype.toString;
      var _isFunction = function(obj) {
        return typeof obj === "function";
      };
      var _isObject = function(obj) {
        return obj === Object(obj);
      };
      var _isArray = function(obj) {
        return toString.call(obj) == "[object Array]";
      };
      var _isDate = function(obj) {
        return toString.call(obj) == "[object Date]";
      };
      var _isRegExp = function(obj) {
        return toString.call(obj) == "[object RegExp]";
      };
      var _isBoolean = function(obj) {
        return toString.call(obj) == "[object Boolean]";
      };
      var _isNumerical = function(obj) {
        obj = obj - 0;
        return obj === obj;
      };
      var _processor = function(convert2, options) {
        var callback = options && "process" in options ? options.process : options;
        if (typeof callback !== "function") {
          return convert2;
        }
        return function(string, options2) {
          return callback(string, convert2, options2);
        };
      };
      var humps2 = {
        camelize,
        decamelize,
        pascalize,
        depascalize: decamelize,
        camelizeKeys: function(object, options) {
          return _processKeys(_processor(camelize, options), object);
        },
        decamelizeKeys: function(object, options) {
          return _processKeys(_processor(decamelize, options), object, options);
        },
        pascalizeKeys: function(object, options) {
          return _processKeys(_processor(pascalize, options), object);
        },
        depascalizeKeys: function() {
          return this.decamelizeKeys.apply(this, arguments);
        }
      };
      if (module.exports) {
        module.exports = humps2;
      } else {
        global2.humps = humps2;
      }
    })(commonjsGlobal);
  })(humps$1);
  var humps = humps$1.exports;
  var _excluded = ["gradientFill"], _excluded2 = ["class", "style"], _excluded3 = ["type", "stops", "id"];
  function styleToObject(style) {
    return style.split(";").map(function(s2) {
      return s2.trim();
    }).filter(function(s2) {
      return s2;
    }).reduce(function(output, pair) {
      var idx = pair.indexOf(":");
      var prop = humps.camelize(pair.slice(0, idx));
      var value = pair.slice(idx + 1).trim();
      output[prop] = value;
      return output;
    }, {});
  }
  function classToObject(classes) {
    return classes.split(/\s+/).reduce(function(output, className) {
      output[className] = true;
      return output;
    }, {});
  }
  function createGradientStop(stop, index) {
    return vue.h("stop", _objectSpread2({
      "key": "".concat(index, "-").concat(stop.offset),
      "offset": stop.offset,
      "stop-color": stop.color
    }, stop.opacity !== void 0 && {
      "stop-opacity": stop.opacity
    }));
  }
  function stripFillsFromPaths(abstractElement) {
    if (typeof abstractElement === "string") return abstractElement;
    var children = (abstractElement.children || []).map(stripFillsFromPaths);
    if (abstractElement.tag === "path" && abstractElement.attributes && "fill" in abstractElement.attributes) {
      return _objectSpread2(_objectSpread2({}, abstractElement), {}, {
        attributes: _objectSpread2(_objectSpread2({}, abstractElement.attributes), {}, {
          fill: void 0
        }),
        children
      });
    }
    return _objectSpread2(_objectSpread2({}, abstractElement), {}, {
      children
    });
  }
  function convert(abstractElement) {
    var props = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    var attrs = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    if (typeof abstractElement === "string") {
      return abstractElement;
    }
    var _props$gradientFill = props.gradientFill, gradientFill = _props$gradientFill === void 0 ? null : _props$gradientFill, renderProps = _objectWithoutProperties(props, _excluded);
    var shouldStripFills = !!gradientFill || "fill" in attrs;
    var element = shouldStripFills ? stripFillsFromPaths(abstractElement) : abstractElement;
    var children = (element.children || []).map(function(child) {
      return convert(child, {}, {});
    });
    var mixins = Object.keys(element.attributes || {}).reduce(function(mixins2, key) {
      var value = element.attributes[key];
      switch (key) {
        case "class":
          mixins2.class = classToObject(value);
          break;
        case "style":
          mixins2.style = styleToObject(value);
          break;
        default:
          mixins2.attrs[key] = value;
      }
      return mixins2;
    }, {
      attrs: {},
      class: {},
      style: {}
    });
    attrs.class;
    var _attrs$style = attrs.style, aStyle = _attrs$style === void 0 ? {} : _attrs$style, otherAttrs = _objectWithoutProperties(attrs, _excluded2);
    if (gradientFill && gradientFill.id && (gradientFill.type === "linear" || gradientFill.type === "radial")) {
      var gradientType = gradientFill.type, _gradientFill$stops = gradientFill.stops, stops = _gradientFill$stops === void 0 ? [] : _gradientFill$stops, id = gradientFill.id, gradientProps = _objectWithoutProperties(gradientFill, _excluded3);
      var gradientTag = gradientType === "linear" ? "linearGradient" : "radialGradient";
      var gradientVNode = vue.h(gradientTag, _objectSpread2(_objectSpread2({}, gradientProps), {}, {
        id
      }), stops.map(createGradientStop));
      return vue.h(element.tag, _objectSpread2(_objectSpread2(_objectSpread2(_objectSpread2({}, renderProps), {}, {
        class: mixins.class,
        style: _objectSpread2(_objectSpread2({}, mixins.style), aStyle)
      }, mixins.attrs), otherAttrs), {}, {
        fill: "url(#".concat(id, ")")
      }), [gradientVNode].concat(_toConsumableArray(children)));
    }
    return vue.h(abstractElement.tag, _objectSpread2(_objectSpread2(_objectSpread2({}, renderProps), {}, {
      class: mixins.class,
      style: _objectSpread2(_objectSpread2({}, mixins.style), aStyle)
    }, mixins.attrs), otherAttrs), children);
  }
  var PRODUCTION = false;
  try {
    PRODUCTION = true;
  } catch (e) {
  }
  function log() {
    if (!PRODUCTION && console && typeof console.error === "function") {
      var _console;
      (_console = console).error.apply(_console, arguments);
    }
  }
  function normalizeIconArgs(icon2) {
    if (icon2 && _typeof(icon2) === "object" && icon2.prefix && icon2.iconName && icon2.icon) {
      return icon2;
    }
    if (parse$1.icon) {
      return parse$1.icon(icon2);
    }
    if (icon2 === null) {
      return null;
    }
    if (_typeof(icon2) === "object" && icon2.prefix && icon2.iconName) {
      return icon2;
    }
    if (Array.isArray(icon2) && icon2.length === 2) {
      return {
        prefix: icon2[0],
        iconName: icon2[1]
      };
    }
    if (typeof icon2 === "string") {
      return {
        prefix: "fas",
        iconName: icon2
      };
    }
  }
  var FontAwesomeIcon = vue.defineComponent({
    name: "FontAwesomeIcon",
    props: {
      border: {
        type: Boolean,
        default: false
      },
      // the fixedWidth property has been deprecated as of version 7
      fixedWidth: {
        type: Boolean,
        default: false
      },
      flip: {
        type: [Boolean, String],
        default: false,
        validator: function validator(value) {
          return [true, false, "horizontal", "vertical", "both"].indexOf(value) > -1;
        }
      },
      icon: {
        type: [Object, Array, String],
        required: true
      },
      mask: {
        type: [Object, Array, String],
        default: null
      },
      maskId: {
        type: String,
        default: null
      },
      listItem: {
        type: Boolean,
        default: false
      },
      pull: {
        type: String,
        default: null,
        validator: function validator2(value) {
          return ["right", "left"].indexOf(value) > -1;
        }
      },
      pulse: {
        type: Boolean,
        default: false
      },
      rotation: {
        type: [String, Number],
        default: null,
        validator: function validator3(value) {
          return [90, 180, 270].indexOf(Number.parseInt(value, 10)) > -1;
        }
      },
      // the rotateBy property is only supported in version 7.0.0 and later
      rotateBy: {
        type: Boolean,
        default: false
      },
      swapOpacity: {
        type: Boolean,
        default: false
      },
      size: {
        type: String,
        default: null,
        validator: function validator4(value) {
          return ["2xs", "xs", "sm", "lg", "xl", "2xl", "1x", "2x", "3x", "4x", "5x", "6x", "7x", "8x", "9x", "10x"].indexOf(value) > -1;
        }
      },
      spin: {
        type: Boolean,
        default: false
      },
      transform: {
        type: [String, Object],
        default: null
      },
      symbol: {
        type: [Boolean, String],
        default: false
      },
      title: {
        type: String,
        default: null
      },
      titleId: {
        type: String,
        default: null
      },
      inverse: {
        type: Boolean,
        default: false
      },
      bounce: {
        type: Boolean,
        default: false
      },
      shake: {
        type: Boolean,
        default: false
      },
      beat: {
        type: Boolean,
        default: false
      },
      fade: {
        type: Boolean,
        default: false
      },
      beatFade: {
        type: Boolean,
        default: false
      },
      flash: {
        type: Boolean,
        default: false
      },
      spinPulse: {
        type: Boolean,
        default: false
      },
      spinReverse: {
        type: Boolean,
        default: false
      },
      // the widthAuto property is only supported in version 7.0.0 and later
      widthAuto: {
        type: Boolean,
        default: false
      },
      // the canvasSquare and canvasRoomy properties are only supported in version 7.3.0 and later
      canvasSquare: {
        type: Boolean,
        default: false
      },
      canvasRoomy: {
        type: Boolean,
        default: false
      },
      gradientFill: {
        type: Object,
        default: null,
        validator: function validator5(value) {
          if (typeof value.id !== "string" || !value.id) {
            console.warn("FontAwesomeIcon: gradientFill.id must be a non-empty string");
            return false;
          }
          if (value.type !== "linear" && value.type !== "radial") {
            console.warn('FontAwesomeIcon: gradientFill.type must be "linear" or "radial"');
            return false;
          }
          return true;
        }
      },
      // the following animation properties are only supported in version 7.3.0 and later
      flip360: {
        type: Boolean,
        default: false
      },
      buzz: {
        type: Boolean,
        default: false
      },
      float: {
        type: Boolean,
        default: false
      },
      jello: {
        type: Boolean,
        default: false
      },
      spinSnap: {
        type: Boolean,
        default: false
      },
      spinSnap4: {
        type: Boolean,
        default: false
      },
      spinSnap8: {
        type: Boolean,
        default: false
      },
      swing: {
        type: Boolean,
        default: false
      },
      wag: {
        type: Boolean,
        default: false
      }
    },
    setup: function setup(props, _ref) {
      var attrs = _ref.attrs;
      var icon$1 = vue.computed(function() {
        return normalizeIconArgs(props.icon);
      });
      var classes = vue.computed(function() {
        return objectWithKey("classes", classList(props));
      });
      var transform2 = vue.computed(function() {
        return objectWithKey("transform", typeof props.transform === "string" ? parse$1.transform(props.transform) : props.transform);
      });
      var mask = vue.computed(function() {
        return objectWithKey("mask", normalizeIconArgs(props.mask));
      });
      var renderedIcon = vue.computed(function() {
        var iconProps = _objectSpread2(_objectSpread2(_objectSpread2(_objectSpread2({}, classes.value), transform2.value), mask.value), {}, {
          symbol: props.symbol,
          maskId: props.maskId
        });
        iconProps.title = props.title;
        iconProps.titleId = props.titleId;
        return icon(icon$1.value, iconProps);
      });
      vue.watch(renderedIcon, function(value) {
        if (!value) {
          return log("Could not find one or more icon(s)", icon$1.value, mask.value);
        }
      }, {
        immediate: true
      });
      if (props.gradientFill && props.symbol) {
        log("gradientFill is not supported when symbol is true and will be ignored");
      }
      var vnode = vue.computed(function() {
        return renderedIcon.value ? convert(renderedIcon.value.abstract[0], {
          gradientFill: props.symbol ? null : props.gradientFill
        }, attrs) : null;
      });
      return function() {
        return vnode.value;
      };
    }
  });
  vue.defineComponent({
    name: "FontAwesomeLayers",
    props: {
      fixedWidth: {
        type: Boolean,
        default: false
      }
    },
    setup: function setup2(props, _ref) {
      var slots = _ref.slots;
      var familyPrefix = config$1.familyPrefix;
      var className = vue.computed(function() {
        return ["".concat(familyPrefix, "-layers")].concat(_toConsumableArray(props.fixedWidth ? ["".concat(familyPrefix, "-fw")] : []));
      });
      return function() {
        return vue.h("div", {
          class: className.value
        }, slots.default ? slots.default() : []);
      };
    }
  });
  vue.defineComponent({
    name: "FontAwesomeLayersText",
    props: {
      value: {
        type: [String, Number],
        default: ""
      },
      transform: {
        type: [String, Object],
        default: null
      },
      counter: {
        type: Boolean,
        default: false
      },
      position: {
        type: String,
        default: null,
        validator: function validator6(value) {
          return ["bottom-left", "bottom-right", "top-left", "top-right"].indexOf(value) > -1;
        }
      }
    },
    setup: function setup3(props, _ref) {
      var attrs = _ref.attrs;
      var familyPrefix = config$1.familyPrefix;
      var classes = vue.computed(function() {
        return objectWithKey("classes", [].concat(_toConsumableArray(props.counter ? ["".concat(familyPrefix, "-layers-counter")] : []), _toConsumableArray(props.position ? ["".concat(familyPrefix, "-layers-").concat(props.position)] : [])));
      });
      var transform2 = vue.computed(function() {
        return objectWithKey("transform", typeof props.transform === "string" ? parse$1.transform(props.transform) : props.transform);
      });
      var abstractElement = vue.computed(function() {
        var _text = text(props.value.toString(), _objectSpread2(_objectSpread2({}, transform2.value), classes.value)), abstract = _text.abstract;
        if (props.counter) {
          abstract[0].attributes.class = abstract[0].attributes.class.replace("fa-layers-text", "");
        }
        return abstract[0];
      });
      var vnode = vue.computed(function() {
        return convert(abstractElement.value, {}, attrs);
      });
      return function() {
        return vnode.value;
      };
    }
  });
  /*!
   * Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com
   * License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)
   * Copyright 2024 Fonticons, Inc.
   */
  const faCircleQuestion = {
    prefix: "fas",
    iconName: "circle-question",
    icon: [512, 512, [62108, "question-circle"], "f059", "M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM169.8 165.3c7.9-22.3 29.1-37.3 52.8-37.3l58.3 0c34.9 0 63.1 28.3 63.1 63.1c0 22.6-12.1 43.5-31.7 54.8L280 264.4c-.2 13-10.9 23.6-24 23.6c-13.3 0-24-10.7-24-24l0-13.5c0-8.6 4.6-16.5 12.1-20.8l44.3-25.4c4.7-2.7 7.6-7.7 7.6-13.1c0-8.4-6.8-15.1-15.1-15.1l-58.3 0c-3.4 0-6.4 2.1-7.5 5.3l-.4 1.2c-4.4 12.5-18.2 19-30.6 14.6s-19-18.2-14.6-30.6l.4-1.2zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"]
  };
  const _hoisted_1$6 = { class: "grid gap-4 border-b border-slate-200 py-6 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:gap-8" };
  const _hoisted_2$6 = { class: "min-w-0" };
  const _hoisted_3$5 = { class: "flex items-start gap-2" };
  const _hoisted_4$4 = ["aria-expanded"];
  const _hoisted_5$3 = {
    key: 0,
    class: "mt-2 text-xs leading-5 text-slate-500"
  };
  const _hoisted_6$3 = { class: "min-w-0 self-center" };
  const _sfc_main$6 = /* @__PURE__ */ vue.defineComponent({
    __name: "SettingsField",
    setup(__props) {
      const slots = vue.useSlots();
      const displayHelp = vue.ref(false);
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("div", _hoisted_1$6, [
          vue.createElementVNode("div", _hoisted_2$6, [
            vue.createElementVNode("div", _hoisted_3$5, [
              vue.renderSlot(_ctx.$slots, "label"),
              vue.unref(slots).help ? (vue.openBlock(), vue.createElementBlock("button", {
                key: 0,
                type: "button",
                class: "mt-0.5 text-blue-600 hover:text-blue-700",
                "aria-expanded": displayHelp.value,
                onClick: _cache[0] || (_cache[0] = ($event) => displayHelp.value = !displayHelp.value)
              }, [
                vue.createVNode(vue.unref(FontAwesomeIcon), { icon: vue.unref(faCircleQuestion) }, null, 8, ["icon"])
              ], 8, _hoisted_4$4)) : vue.createCommentVNode("", true)
            ]),
            displayHelp.value ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_5$3, [
              vue.renderSlot(_ctx.$slots, "help")
            ])) : vue.createCommentVNode("", true)
          ]),
          vue.createElementVNode("div", _hoisted_6$3, [
            vue.renderSlot(_ctx.$slots, "default")
          ])
        ]);
      };
    }
  });
  const _hoisted_1$5 = { class: "text-sm font-medium text-slate-900" };
  const _hoisted_2$5 = { class: "mt-1 text-sm leading-5 text-slate-500" };
  const _hoisted_3$4 = { class: "flex items-center gap-3" };
  const _hoisted_4$3 = {
    for: "automatic-indexing",
    class: "cursor-pointer text-sm text-slate-700"
  };
  const _hoisted_5$2 = { class: "text-sm font-medium text-slate-900" };
  const _hoisted_6$2 = { class: "mt-1 text-sm leading-5 text-slate-500" };
  const _hoisted_7$2 = { class: "overflow-hidden rounded-md border border-slate-200" };
  const _hoisted_8$2 = {
    for: "compilatio-scheduled-at",
    class: "block text-sm font-medium text-slate-900"
  };
  const _hoisted_9$2 = { class: "mt-1 text-sm leading-5 text-slate-500" };
  const _sfc_main$5 = /* @__PURE__ */ vue.defineComponent({
    __name: "AnalysisLaunchSettings",
    props: {
      automaticIndexingEnabled: { type: Boolean, required: true },
      disabled: { type: Boolean, default: false },
      launchMode: { type: String, required: true },
      scheduledAt: { type: String, required: true }
    },
    emits: ["update:automaticIndexingEnabled", "update:launchMode", "update:scheduledAt"],
    setup(__props) {
      const { t: t2 } = useI18n();
      const launchModes = [
        {
          value: "automatic",
          labelKey: "settings_launch_mode_automatic",
          descriptionKey: "settings_launch_mode_automatic_description"
        },
        {
          value: "manual",
          labelKey: "settings_launch_mode_manual",
          descriptionKey: "settings_launch_mode_manual_description"
        },
        {
          value: "scheduled",
          labelKey: "settings_launch_mode_scheduled",
          descriptionKey: "settings_launch_mode_scheduled_description"
        }
      ];
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock(vue.Fragment, null, [
          vue.createVNode(_sfc_main$6, null, {
            label: vue.withCtx(() => [
              vue.createElementVNode("div", null, [
                vue.createElementVNode("p", _hoisted_1$5, vue.toDisplayString(vue.unref(t2)("settings_automatic_indexing")), 1),
                vue.createElementVNode("p", _hoisted_2$5, vue.toDisplayString(vue.unref(t2)("settings_automatic_indexing_description")), 1)
              ])
            ]),
            default: vue.withCtx(() => [
              vue.createElementVNode("div", _hoisted_3$4, [
                vue.createVNode(_sfc_main$a, {
                  id: "automatic-indexing",
                  disabled: __props.disabled,
                  "model-value": __props.automaticIndexingEnabled,
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => _ctx.$emit("update:automaticIndexingEnabled", $event))
                }, null, 8, ["disabled", "model-value"]),
                vue.createElementVNode("label", _hoisted_4$3, vue.toDisplayString(__props.automaticIndexingEnabled ? vue.unref(t2)("common_enabled") : vue.unref(t2)("common_disabled")), 1)
              ])
            ]),
            _: 1
          }),
          vue.createVNode(_sfc_main$6, null, {
            label: vue.withCtx(() => [
              vue.createElementVNode("div", null, [
                vue.createElementVNode("p", _hoisted_5$2, vue.toDisplayString(vue.unref(t2)("settings_launch_mode")), 1),
                vue.createElementVNode("p", _hoisted_6$2, vue.toDisplayString(vue.unref(t2)("settings_launch_mode_description")), 1)
              ])
            ]),
            default: vue.withCtx(() => [
              vue.createElementVNode("div", _hoisted_7$2, [
                (vue.openBlock(), vue.createElementBlock(vue.Fragment, null, vue.renderList(launchModes, (mode) => {
                  return vue.createVNode(_sfc_main$7, {
                    key: mode.value,
                    description: vue.unref(t2)(mode.descriptionKey),
                    disabled: __props.disabled,
                    label: vue.unref(t2)(mode.labelKey),
                    "model-value": __props.launchMode,
                    value: mode.value,
                    "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => _ctx.$emit("update:launchMode", $event))
                  }, null, 8, ["description", "disabled", "label", "model-value", "value"]);
                }), 64))
              ])
            ]),
            _: 1
          }),
          __props.launchMode === "scheduled" ? (vue.openBlock(), vue.createBlock(_sfc_main$6, { key: 0 }, {
            label: vue.withCtx(() => [
              vue.createElementVNode("div", null, [
                vue.createElementVNode("label", _hoisted_8$2, vue.toDisplayString(vue.unref(t2)("settings_scheduled_at")), 1),
                vue.createElementVNode("p", _hoisted_9$2, vue.toDisplayString(vue.unref(t2)("settings_scheduled_at_description")), 1)
              ])
            ]),
            default: vue.withCtx(() => [
              vue.createVNode(_sfc_main$9, {
                id: "compilatio-scheduled-at",
                disabled: __props.disabled,
                "model-value": __props.scheduledAt,
                required: "",
                type: "datetime-local",
                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => _ctx.$emit("update:scheduledAt", $event))
              }, null, 8, ["disabled", "model-value"])
            ]),
            _: 1
          })) : vue.createCommentVNode("", true)
        ], 64);
      };
    }
  });
  const _hoisted_1$4 = {
    for: "compilatio-api-key",
    class: "block text-sm font-medium text-slate-900"
  };
  const _hoisted_2$4 = { class: "mt-1 text-sm leading-5 text-slate-500" };
  const _sfc_main$4 = /* @__PURE__ */ vue.defineComponent({
    __name: "ApiKeySettings",
    props: {
      disabled: { type: Boolean, default: false },
      modelValue: { type: String, required: true }
    },
    emits: ["update:modelValue"],
    setup(__props) {
      const { t: t2 } = useI18n();
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createBlock(_sfc_main$6, null, {
          label: vue.withCtx(() => [
            vue.createElementVNode("div", null, [
              vue.createElementVNode("label", _hoisted_1$4, vue.toDisplayString(vue.unref(t2)("settings_api_key")), 1),
              vue.createElementVNode("p", _hoisted_2$4, vue.toDisplayString(vue.unref(t2)("settings_api_key_description")), 1)
            ])
          ]),
          default: vue.withCtx(() => [
            vue.createVNode(_sfc_main$9, {
              id: "compilatio-api-key",
              autocomplete: "new-password",
              disabled: __props.disabled,
              "model-value": __props.modelValue,
              name: "apiKey",
              placeholder: vue.unref(t2)("settings_api_key_placeholder"),
              type: "text",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => _ctx.$emit("update:modelValue", $event))
            }, null, 8, ["disabled", "model-value", "placeholder"])
          ]),
          _: 1
        });
      };
    }
  });
  const _hoisted_1$3 = { class: "flex min-h-12 items-center justify-between gap-4 border-t border-slate-200 py-3 first:border-t-0" };
  const _hoisted_2$3 = ["for"];
  const _hoisted_3$3 = {
    key: 0,
    class: "mt-0.5 block text-xs italic text-slate-500"
  };
  const _hoisted_4$2 = {
    key: 1,
    class: "mt-0.5 block text-xs italic text-slate-500"
  };
  const _sfc_main$3 = /* @__PURE__ */ vue.defineComponent({
    __name: "DetectionOption",
    props: {
      detection: { type: Object, required: true },
      disabled: { type: Boolean, default: false }
    },
    emits: ["change"],
    setup(__props, { emit: __emit }) {
      const emit = __emit;
      const { t: t2 } = useI18n();
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("div", _hoisted_1$3, [
          vue.createElementVNode("label", {
            for: `detection_${__props.detection.process}`,
            class: vue.normalizeClass(["text-sm text-slate-800", __props.detection.configurable && __props.detection.availableInSubscription ? "cursor-pointer" : ""])
          }, [
            vue.createTextVNode(vue.toDisplayString(vue.unref(t2)(`detection_${__props.detection.process}`)) + " ", 1),
            !__props.detection.availableInSubscription ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_3$3, vue.toDisplayString(vue.unref(t2)("detection_not_in_subscription")), 1)) : !__props.detection.configurable ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_4$2, vue.toDisplayString(__props.detection.enabled ? vue.unref(t2)("detection_always_enabled") : vue.unref(t2)("detection_disabled_by_admin")), 1)) : vue.createCommentVNode("", true)
          ], 10, _hoisted_2$3),
          vue.createVNode(_sfc_main$a, {
            id: `detection_${__props.detection.process}`,
            "model-value": __props.detection.enabled,
            disabled: __props.disabled || !__props.detection.configurable || !__props.detection.availableInSubscription,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => emit("change", $event))
          }, null, 8, ["id", "model-value", "disabled"])
        ]);
      };
    }
  });
  const _hoisted_1$2 = { class: "text-sm font-medium text-slate-900" };
  const _hoisted_2$2 = { class: "mt-1 text-sm leading-5 text-slate-500" };
  const _hoisted_3$2 = { class: "overflow-hidden rounded-md border border-slate-200 px-4" };
  const _sfc_main$2 = /* @__PURE__ */ vue.defineComponent({
    __name: "DetectionSettings",
    props: {
      detections: { type: Array, required: true },
      disabled: { type: Boolean, default: false }
    },
    emits: ["change"],
    setup(__props, { emit: __emit }) {
      const props = __props;
      const emit = __emit;
      const { t: t2 } = useI18n();
      const visibleDetections = vue.computed(
        () => props.detections.map((detection, index) => ({ detection, index })).filter(({ detection }) => detection.process !== "rich_extraction")
      );
      return (_ctx, _cache) => {
        return visibleDetections.value.length ? (vue.openBlock(), vue.createBlock(_sfc_main$6, { key: 0 }, {
          label: vue.withCtx(() => [
            vue.createElementVNode("div", null, [
              vue.createElementVNode("p", _hoisted_1$2, vue.toDisplayString(vue.unref(t2)("settings_detections")), 1),
              vue.createElementVNode("p", _hoisted_2$2, vue.toDisplayString(vue.unref(t2)("settings_detections_description")), 1)
            ])
          ]),
          default: vue.withCtx(() => [
            vue.createElementVNode("div", _hoisted_3$2, [
              (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(visibleDetections.value, (item) => {
                return vue.openBlock(), vue.createBlock(_sfc_main$3, {
                  key: item.detection.process,
                  detection: item.detection,
                  disabled: __props.disabled,
                  onChange: ($event) => emit("change", item.index, $event)
                }, null, 8, ["detection", "disabled", "onChange"]);
              }), 128))
            ])
          ]),
          _: 1
        })) : vue.createCommentVNode("", true);
      };
    }
  });
  const _hoisted_1$1 = { class: "text-sm font-medium text-slate-900" };
  const _hoisted_2$1 = { class: "mt-1 text-sm leading-5 text-slate-500" };
  const _hoisted_3$1 = { class: "grid gap-4 sm:grid-cols-2" };
  const _hoisted_4$1 = { class: "block text-sm text-slate-700" };
  const _hoisted_5$1 = { class: "mb-1 block font-medium" };
  const _hoisted_6$1 = ["disabled", "value"];
  const _hoisted_7$1 = { class: "block text-sm text-slate-700" };
  const _hoisted_8$1 = { class: "mb-1 block font-medium" };
  const _hoisted_9$1 = ["disabled", "min", "value"];
  const _hoisted_10$1 = {
    key: 0,
    class: "mt-3 text-sm font-medium text-red-700",
    role: "alert"
  };
  const _sfc_main$1 = /* @__PURE__ */ vue.defineComponent({
    __name: "ThresholdSettings",
    props: {
      critical: { type: Number, required: true },
      disabled: { type: Boolean, default: false },
      warning: { type: Number, required: true }
    },
    emits: ["update:critical", "update:warning"],
    setup(__props, { emit: __emit }) {
      const props = __props;
      const emit = __emit;
      const { t: t2 } = useI18n();
      const warningExceedsCritical = vue.computed(() => props.warning > props.critical);
      const updateNumber = (field, event) => {
        const value = Number(event.target.value);
        const normalizedValue = Number.isFinite(value) ? value : 0;
        if (field === "warning") {
          emit("update:warning", normalizedValue);
          return;
        }
        emit("update:critical", normalizedValue);
      };
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createBlock(_sfc_main$6, null, {
          label: vue.withCtx(() => [
            vue.createElementVNode("div", null, [
              vue.createElementVNode("p", _hoisted_1$1, vue.toDisplayString(vue.unref(t2)("settings_thresholds")), 1),
              vue.createElementVNode("p", _hoisted_2$1, vue.toDisplayString(vue.unref(t2)("settings_thresholds_description")), 1)
            ])
          ]),
          default: vue.withCtx(() => [
            vue.createElementVNode("div", _hoisted_3$1, [
              vue.createElementVNode("label", _hoisted_4$1, [
                vue.createElementVNode("span", _hoisted_5$1, vue.toDisplayString(vue.unref(t2)("settings_threshold_warning")), 1),
                vue.createElementVNode("input", {
                  class: "block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                  disabled: __props.disabled,
                  max: "100",
                  min: "0",
                  value: __props.warning,
                  type: "number",
                  onInput: _cache[0] || (_cache[0] = ($event) => updateNumber("warning", $event))
                }, null, 40, _hoisted_6$1)
              ]),
              vue.createElementVNode("label", _hoisted_7$1, [
                vue.createElementVNode("span", _hoisted_8$1, vue.toDisplayString(vue.unref(t2)("settings_threshold_critical")), 1),
                vue.createElementVNode("input", {
                  class: "block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                  disabled: __props.disabled,
                  max: "100",
                  min: __props.warning,
                  value: __props.critical,
                  type: "number",
                  onInput: _cache[1] || (_cache[1] = ($event) => updateNumber("critical", $event))
                }, null, 40, _hoisted_9$1)
              ])
            ]),
            warningExceedsCritical.value ? (vue.openBlock(), vue.createElementBlock("p", _hoisted_10$1, vue.toDisplayString(vue.unref(t2)("settings_error_threshold_order")), 1)) : vue.createCommentVNode("", true)
          ]),
          _: 1
        });
      };
    }
  });
  const _hoisted_1 = { class: "overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm" };
  const _hoisted_2 = { class: "border-b border-slate-200 px-6 py-5 sm:px-8" };
  const _hoisted_3 = ["alt"];
  const _hoisted_4 = { class: "mt-5" };
  const _hoisted_5 = { class: "text-xl font-semibold tracking-tight" };
  const _hoisted_6 = { class: "mt-1 max-w-2xl text-sm leading-6 text-slate-600" };
  const _hoisted_7 = {
    key: 0,
    class: "flex items-center gap-3 px-6 py-10 text-sm text-slate-600 sm:px-8"
  };
  const _hoisted_8 = { class: "px-6 sm:px-8" };
  const _hoisted_9 = { class: "flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4 sm:px-8" };
  const _hoisted_10 = ["disabled"];
  const _sfc_main = /* @__PURE__ */ vue.defineComponent({
    __name: "SettingsPanel",
    setup(__props) {
      const { t: t2 } = useI18n();
      const defaultThresholds = { warning: 10, critical: 20 };
      const unavailableSubscriptionDetections = [
        {
          process: "similarity",
          enabled: true,
          configurable: false,
          availableInSubscription: true
        },
        {
          process: "unrecognized_text_language",
          enabled: false,
          configurable: false,
          availableInSubscription: false
        },
        {
          process: "ai_detection",
          enabled: false,
          configurable: false,
          availableInSubscription: false
        },
        {
          process: "spellchecker",
          enabled: false,
          configurable: false,
          availableInSubscription: false
        },
        {
          process: "rewording",
          enabled: false,
          configurable: false,
          availableInSubscription: false
        }
      ];
      const data = vue.reactive({
        apiKey: "",
        apiUrl: "",
        analysisLaunchMode: "manual",
        automaticIndexingEnabled: false,
        bundleDetections: [],
        csrfToken: "",
        hasError: false,
        hasFolderRecipeParameters: false,
        isLoading: true,
        isSaving: false,
        message: "",
        scheduledAnalysisAt: "",
        thresholds: { ...defaultThresholds }
      });
      const canSave = vue.computed(() => {
        if (!data.apiKey.trim()) {
          return false;
        }
        const scheduledDateIsValid = data.analysisLaunchMode !== "scheduled" || Boolean(data.scheduledAnalysisAt);
        const thresholdsAreValid = Number.isInteger(data.thresholds.warning) && Number.isInteger(data.thresholds.critical) && data.thresholds.warning >= 0 && data.thresholds.critical <= 100 && data.thresholds.warning <= data.thresholds.critical;
        return scheduledDateIsValid && thresholdsAreValid;
      });
      vue.onMounted(() => {
        const root = document.querySelector("#compilatioSettingsPanelRoot");
        if (!root) {
          setError(t2("settings_error_initialization"));
          data.isLoading = false;
          return;
        }
        data.apiUrl = root.dataset.apiUrl || "";
        data.csrfToken = root.dataset.csrfToken || "";
        loadSettings();
      });
      const loadSettings = async () => {
        if (!data.apiUrl) {
          setError(t2("settings_error_missing_api_url"));
          data.isLoading = false;
          return;
        }
        try {
          const response = await fetch(data.apiUrl, {
            credentials: "same-origin",
            headers: { Accept: "application/json" }
          });
          const result = await response.json();
          if (!response.ok) {
            throw new Error(getErrorMessage(result, t2("settings_error_loading")));
          }
          applySettings(result);
        } catch (error) {
          setError(error instanceof Error ? error.message : t2("settings_error_loading"));
        } finally {
          data.isLoading = false;
        }
      };
      const saveSettings = async () => {
        if (!data.apiUrl || !data.csrfToken || !canSave.value) {
          setError(t2("settings_error_required_fields"));
          return;
        }
        data.hasError = false;
        data.isSaving = true;
        data.message = "";
        try {
          const response = await fetch(data.apiUrl, {
            method: "PUT",
            credentials: "same-origin",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "X-Csrf-Token": data.csrfToken
            },
            body: JSON.stringify({
              apiKey: data.apiKey.trim(),
              automaticIndexingEnabled: data.automaticIndexingEnabled,
              analysisLaunchMode: data.analysisLaunchMode,
              bundleDetections: serializeDetections(data.bundleDetections),
              thresholds: data.thresholds,
              scheduledAnalysisAt: data.analysisLaunchMode === "scheduled" ? new Date(data.scheduledAnalysisAt).toISOString() : null
            })
          });
          const result = await response.json();
          if (!response.ok) {
            throw new Error(getErrorMessage(result, t2("settings_error_saving")));
          }
          applySettings(result);
          data.message = t2("settings_saved");
        } catch (error) {
          setError(error instanceof Error ? error.message : t2("settings_error_saving"));
        } finally {
          data.isSaving = false;
        }
      };
      const applySettings = (settings) => {
        if (typeof settings.apiKey === "string") {
          data.apiKey = settings.apiKey;
        }
        data.automaticIndexingEnabled = settings.automaticIndexingEnabled === true;
        data.analysisLaunchMode = isLaunchMode(settings.analysisLaunchMode) ? settings.analysisLaunchMode : "manual";
        data.scheduledAnalysisAt = toLocalDateTime(
          typeof settings.scheduledAnalysisAt === "string" ? settings.scheduledAnalysisAt : null
        );
        data.hasFolderRecipeParameters = settings.hasFolderRecipeParameters === true;
        data.bundleDetections = normalizeDetections(
          settings.bundleDetections,
          data.hasFolderRecipeParameters
        );
        data.thresholds = normalizeThresholds(settings.thresholds);
      };
      const normalizeThresholds = (value) => {
        if (!isRecord(value)) {
          return { ...defaultThresholds };
        }
        return {
          warning: typeof value.warning === "number" ? value.warning : defaultThresholds.warning,
          critical: typeof value.critical === "number" ? value.critical : defaultThresholds.critical
        };
      };
      const serializeDetections = (detections) => Object.fromEntries(
        detections.map((detection) => [
          detection.process,
          { enabled: detection.enabled }
        ])
      );
      const normalizeDetections = (value, canConfigureDetections) => {
        if (!canConfigureDetections) {
          return unavailableSubscriptionDetections.map((detection) => ({ ...detection }));
        }
        if (Array.isArray(value)) {
          return value.filter(isApiDetection).map((detection) => ({
            ...detection,
            availableInSubscription: true
          }));
        }
        if (!isRecord(value)) {
          return [];
        }
        return Object.entries(value).flatMap(([process, configuration]) => {
          if (!isRecord(configuration)) {
            return [];
          }
          return [{
            process,
            enabled: configuration.enabled === true,
            configurable: configuration.configurable === true,
            availableInSubscription: true
          }];
        });
      };
      const isApiDetection = (value) => isRecord(value) && typeof value.process === "string" && typeof value.enabled === "boolean" && typeof value.configurable === "boolean";
      const isRecord = (value) => typeof value === "object" && value !== null;
      const updateDetection = (index, enabled) => {
        const detection = data.bundleDetections[index];
        if (detection == null ? void 0 : detection.configurable) {
          detection.enabled = enabled;
        }
      };
      const isLaunchMode = (value) => value === "automatic" || value === "manual" || value === "scheduled";
      const setError = (message) => {
        data.hasError = true;
        data.message = message;
      };
      const getErrorMessage = (result, fallback) => {
        if (typeof (result == null ? void 0 : result.errorMessage) === "string") {
          return result.errorMessage;
        }
        if (typeof (result == null ? void 0 : result.error) === "string") {
          return result.error;
        }
        const firstError = (result == null ? void 0 : result.errors) ? Object.values(result.errors).flat()[0] : null;
        return typeof firstError === "string" ? firstError : fallback;
      };
      const toLocalDateTime = (value) => {
        if (!value) {
          return "";
        }
        const date = new Date(value);
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 6e4);
        return localDate.toISOString().slice(0, 16);
      };
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("section", _hoisted_1, [
          vue.createElementVNode("header", _hoisted_2, [
            vue.createElementVNode("img", {
              src: _imports_0,
              alt: vue.unref(t2)("settings_logo_alt"),
              class: "h-10 w-auto"
            }, null, 8, _hoisted_3),
            vue.createElementVNode("div", _hoisted_4, [
              vue.createElementVNode("h2", _hoisted_5, vue.toDisplayString(vue.unref(t2)("settings_title")), 1),
              vue.createElementVNode("p", _hoisted_6, vue.toDisplayString(vue.unref(t2)("settings_description")), 1)
            ])
          ]),
          data.isLoading ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_7, [
            _cache[6] || (_cache[6] = vue.createElementVNode("span", { class: "h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" }, null, -1)),
            vue.createTextVNode(" " + vue.toDisplayString(vue.unref(t2)("settings_loading")), 1)
          ])) : (vue.openBlock(), vue.createElementBlock("form", {
            key: 1,
            onSubmit: vue.withModifiers(saveSettings, ["prevent"])
          }, [
            vue.createElementVNode("div", _hoisted_8, [
              vue.createVNode(_sfc_main$4, {
                modelValue: data.apiKey,
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => data.apiKey = $event),
                disabled: data.isSaving
              }, null, 8, ["modelValue", "disabled"]),
              data.apiKey ? (vue.openBlock(), vue.createBlock(_sfc_main$1, {
                key: 0,
                warning: data.thresholds.warning,
                "onUpdate:warning": _cache[1] || (_cache[1] = ($event) => data.thresholds.warning = $event),
                critical: data.thresholds.critical,
                "onUpdate:critical": _cache[2] || (_cache[2] = ($event) => data.thresholds.critical = $event),
                disabled: data.isSaving
              }, null, 8, ["warning", "critical", "disabled"])) : vue.createCommentVNode("", true),
              data.apiKey ? (vue.openBlock(), vue.createBlock(_sfc_main$5, {
                key: 1,
                "automatic-indexing-enabled": data.automaticIndexingEnabled,
                "onUpdate:automaticIndexingEnabled": _cache[3] || (_cache[3] = ($event) => data.automaticIndexingEnabled = $event),
                "launch-mode": data.analysisLaunchMode,
                "onUpdate:launchMode": _cache[4] || (_cache[4] = ($event) => data.analysisLaunchMode = $event),
                "scheduled-at": data.scheduledAnalysisAt,
                "onUpdate:scheduledAt": _cache[5] || (_cache[5] = ($event) => data.scheduledAnalysisAt = $event),
                disabled: data.isSaving
              }, null, 8, ["automatic-indexing-enabled", "launch-mode", "scheduled-at", "disabled"])) : vue.createCommentVNode("", true),
              data.apiKey ? (vue.openBlock(), vue.createBlock(_sfc_main$2, {
                key: 2,
                detections: data.bundleDetections,
                disabled: data.isSaving,
                onChange: updateDetection
              }, null, 8, ["detections", "disabled"])) : vue.createCommentVNode("", true)
            ]),
            data.message ? (vue.openBlock(), vue.createElementBlock("div", {
              key: 0,
              role: "status",
              class: vue.normalizeClass(["mx-6 mb-5 rounded-md border px-4 py-3 text-sm sm:mx-8", data.hasError ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"])
            }, vue.toDisplayString(data.message), 3)) : vue.createCommentVNode("", true),
            vue.createElementVNode("footer", _hoisted_9, [
              vue.createElementVNode("button", {
                type: "submit",
                class: "inline-flex min-w-36 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                disabled: data.isSaving || !canSave.value
              }, vue.toDisplayString(data.isSaving ? vue.unref(t2)("settings_saving") : vue.unref(t2)("settings_save")), 9, _hoisted_10)
            ])
          ], 32))
        ]);
      };
    }
  });
  const en = {
    common_disabled: "Disabled",
    common_enabled: "Enabled",
    detection_similarity: "Similarity detection",
    detection_unrecognized_text_language: "Unrecognized text language",
    detection_ai_detection: "AI-generated content detection",
    detection_spellchecker: "Spell checker",
    detection_rewording: "Rewording detection",
    detection_always_enabled: "Always enabled",
    detection_disabled_by_admin: "Disabled by the administrator",
    detection_not_in_subscription: "Not included in your subscription",
    settings_api_key: "Compilatio API key",
    settings_api_key_description: "Authenticates this journal with Compilatio services.",
    settings_api_key_placeholder: "Enter the API key",
    settings_automatic_indexing: "Automatic indexing",
    settings_automatic_indexing_description: "Automatically sends eligible documents to Compilatio.",
    settings_description: "Configure the connection, analysis launch mode and detections available for this journal.",
    settings_detections: "Analysis options",
    settings_detections_description: "Enable the detections available with your Compilatio plan.",
    settings_error_initialization: "Unable to initialize the plugin settings.",
    settings_error_loading: "Unable to load the settings.",
    settings_error_missing_api_url: "The settings API URL is missing.",
    settings_error_required_fields: "The API key and, in scheduled mode, the launch date are required.",
    settings_error_saving: "Unable to save the settings.",
    settings_error_threshold_order: "The warning threshold must not be greater than the critical threshold.",
    settings_launch_mode: "Analysis launch",
    settings_launch_mode_automatic: "Automatic",
    settings_launch_mode_automatic_description: "The analysis starts as soon as the document is indexed.",
    settings_launch_mode_description: "Choose when analyses should begin.",
    settings_launch_mode_manual: "Manual",
    settings_launch_mode_manual_description: "An authorized user starts each analysis.",
    settings_launch_mode_scheduled: "Scheduled",
    settings_launch_mode_scheduled_description: "Analyses start at the configured date and time.",
    settings_loading: "Loading settings…",
    settings_logo_alt: "Compilatio",
    settings_save: "Save settings",
    settings_saved: "The settings have been saved.",
    settings_saving: "Saving…",
    settings_scheduled_at: "Launch date and time",
    settings_scheduled_at_description: "The date uses your browser’s time zone.",
    settings_title: "Compilatio settings",
    settings_thresholds: "Similarity thresholds",
    settings_thresholds_description: "Set the warning and critical similarity levels, from 0 to 100.",
    settings_threshold_warning: "Warning threshold (%)",
    settings_threshold_critical: "Critical threshold (%)"
  };
  const fr = {
    common_disabled: "Désactivé",
    common_enabled: "Activé",
    detection_similarity: "Détection de similitudes",
    detection_unrecognized_text_language: "Langue du texte non reconnue",
    detection_ai_detection: "Détection de contenus générés par IA",
    detection_spellchecker: "Correcteur orthographique",
    detection_rewording: "Détection de reformulations",
    detection_always_enabled: "Toujours activée",
    detection_disabled_by_admin: "Désactivée par l’administrateur",
    detection_not_in_subscription: "Non compris dans votre abonnement",
    settings_api_key: "Clé API Compilatio",
    settings_api_key_description: "Authentifie cette revue auprès des services Compilatio.",
    settings_api_key_placeholder: "Saisir la clé API",
    settings_automatic_indexing: "Indexation automatique",
    settings_automatic_indexing_description: "Envoie automatiquement les documents éligibles vers Compilatio.",
    settings_description: "Configurez la connexion, le déclenchement des analyses et les détections disponibles pour cette revue.",
    settings_detections: "Options d’analyse",
    settings_detections_description: "Activez les détections autorisées par votre offre Compilatio.",
    settings_error_initialization: "Impossible de charger la configuration du plugin.",
    settings_error_loading: "Impossible de charger la configuration.",
    settings_error_missing_api_url: "L’URL de l’API de configuration est absente.",
    settings_error_required_fields: "La clé API et, en mode planifié, la date de lancement sont obligatoires.",
    settings_error_saving: "Impossible d’enregistrer les paramètres.",
    settings_error_threshold_order: "Le seuil d’avertissement ne doit pas être supérieur au seuil critique.",
    settings_launch_mode: "Lancement des analyses",
    settings_launch_mode_automatic: "Automatique",
    settings_launch_mode_automatic_description: "L’analyse démarre dès que le document est indexé.",
    settings_launch_mode_description: "Définissez quand les analyses doivent commencer.",
    settings_launch_mode_manual: "Manuel",
    settings_launch_mode_manual_description: "Un utilisateur autorisé déclenche chaque analyse.",
    settings_launch_mode_scheduled: "Planifié",
    settings_launch_mode_scheduled_description: "Les analyses démarrent à la date et à l’heure configurées.",
    settings_loading: "Chargement de la configuration…",
    settings_logo_alt: "Compilatio",
    settings_save: "Enregistrer les paramètres",
    settings_saved: "Les paramètres ont été enregistrés.",
    settings_saving: "Enregistrement…",
    settings_scheduled_at: "Date et heure de lancement",
    settings_scheduled_at_description: "La date utilise le fuseau horaire de votre navigateur.",
    settings_title: "Paramètres Compilatio",
    settings_thresholds: "Seuils de similarité",
    settings_thresholds_description: "Définissez les niveaux de similarité d’avertissement et critique, de 0 à 100.",
    settings_threshold_warning: "Seuil d’avertissement (%)",
    settings_threshold_critical: "Seuil critique (%)"
  };
  window.mountCompilatioSettingsApp = (target) => {
    const documentLocale = document.documentElement.lang || "fr";
    const locale = documentLocale.replace("_", "-").split("-")[0];
    const i18n = createI18n({
      locale,
      fallbackLocale: "fr",
      messages: { en, fr }
    });
    const app = window.pkp.pkpCreateVueApp(_sfc_main);
    app.use(i18n);
    app.mount(target);
    return app;
  };
})(pkp.modules.vue);

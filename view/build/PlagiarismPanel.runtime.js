(function(vue) {
	//#region \0rolldown/runtime.js
	var __create = Object.create;
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __getProtoOf = Object.getPrototypeOf;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __esmMin = (fn, res, err) => () => {
		if (err) throw err[0];
		try {
			return fn && (res = fn(fn = 0)), res;
		} catch (e) {
			throw err = [e], e;
		}
	};
	var __exportAll = (all, no_symbols) => {
		let target = {};
		for (var name in all) __defProp(target, name, {
			get: all[name],
			enumerable: true
		});
		if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
		return target;
	};
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
			key = keys[i];
			if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
				get: ((k) => from[k]).bind(null, key),
				enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
			});
		}
		return to;
	};
	var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
		value: mod,
		enumerable: true
	}) : target, mod));
	//#endregion
	vue = __toESM(vue, 1);
	//#region view/compilatioDocumentsApi.ts
	(function() {
		function getConfig() {
			return window.pkpCompilatioDocuments;
		}
		function addActionUrls(documentData) {
			const documentUrl = window.pkpCompilatioDocuments.apiUrl + "/" + documentData.submissionFileId;
			documentData.retryUrl = documentUrl + "/retry";
			documentData.analyseUrl = documentUrl + "/analyse";
			documentData.reportUrl = documentUrl + "/report";
			documentData.indexingUrl = documentUrl + "/indexing";
			return documentData;
		}
		async function getErrorMessage(response) {
			try {
				return (await response.json()).errorMessage || window.pkpCompilatioDocuments.messages.apiError + " (" + response.status + ")";
			} catch {
				return window.pkpCompilatioDocuments.messages.apiError + " (" + response.status + ")";
			}
		}
		async function request(url, options) {
			const response = await fetch(url, options);
			if (!response.ok) throw new Error(await getErrorMessage(response));
			return response.json();
		}
		function getSubmissionDocuments(submissionId) {
			const config = window.pkpCompilatioDocuments;
			return request(config.apiUrl + "/submission/" + encodeURIComponent(submissionId), {
				credentials: "same-origin",
				headers: { Accept: "application/json" }
			});
		}
		function patch(url, payload) {
			return request(url, {
				method: "PATCH",
				credentials: "same-origin",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					"X-Csrf-Token": window.pkp && window.pkp.currentUser ? window.pkp.currentUser.csrfToken : ""
				},
				body: JSON.stringify(payload)
			});
		}
		function post(url) {
			return request(url, {
				method: "POST",
				credentials: "same-origin",
				headers: {
					Accept: "application/json",
					"X-Csrf-Token": window.pkp && window.pkp.currentUser ? window.pkp.currentUser.csrfToken : ""
				}
			});
		}
		window.pkpCompilatioDocumentsApi = {
			addActionUrls,
			getConfig,
			getSubmissionDocuments,
			post,
			patch
		};
	})();
	//#endregion
	//#region view/compilatioDocumentsTable.ts
	(function() {
		const mountedApps = /* @__PURE__ */ new Map();
		function addCompilatioHeader(row) {
			const table = row.closest("table");
			const headerRow = table ? table.querySelector("thead tr") : null;
			if (!headerRow || headerRow.querySelector(".compilatio-document-header")) return;
			const currentHeader = headerRow.children.length > 2 ? headerRow.children[2] : null;
			if (!currentHeader) return;
			const header = document.createElement("th");
			header.className = currentHeader.className;
			header.classList.add("compilatio-document-header", "w-52", "min-w-52", "text-start");
			header.scope = "col";
			header.textContent = "Compilatio";
			headerRow.insertBefore(header, currentHeader);
		}
		function getFileRow(submissionFileId) {
			const fileLink = document.querySelector("a[href*=\"submissionFileId=" + submissionFileId + "\"]");
			if (!fileLink) return null;
			const row = fileLink.closest("tr");
			const filenameCell = fileLink.closest("th");
			return row && filenameCell ? {
				row,
				filenameCell
			} : null;
		}
		function getOrCreateCompilatioCell(row, filenameCell) {
			const existingCell = row.querySelector(".compilatio-document-cell");
			if (existingCell) return existingCell;
			const dateCell = filenameCell.nextElementSibling;
			const cell = document.createElement("td");
			cell.className = dateCell ? dateCell.className : "";
			cell.classList.add("compilatio-document-cell", "w-52", "min-w-52", "text-start");
			row.insertBefore(cell, dateCell);
			return cell;
		}
		function cleanup(documentsByFileId) {
			mountedApps.forEach(function(entry, target) {
				if (!target.isConnected || !documentsByFileId.has(entry.fileId)) {
					entry.app.unmount();
					target.remove();
					mountedApps.delete(target);
				}
			});
		}
		function renderDocuments(documentsByFileId) {
			cleanup(documentsByFileId);
			const mountDocumentApp = window.mountCompilatioDocumentApp;
			if (!mountDocumentApp) return;
			documentsByFileId.forEach(function(documentData, submissionFileId) {
				const fileRow = getFileRow(submissionFileId);
				if (!fileRow) return;
				addCompilatioHeader(fileRow.row);
				const cell = getOrCreateCompilatioCell(fileRow.row, fileRow.filenameCell);
				const current = cell.querySelector(".compilatio-document-app");
				if (current) {
					const existing = mountedApps.get(current);
					if (existing && existing.fileId === submissionFileId) return;
					if (existing) {
						existing.app.unmount();
						mountedApps.delete(current);
					}
					current.remove();
				}
				const target = document.createElement("span");
				target.className = "compilatio-document-app";
				cell.appendChild(target);
				const app = mountDocumentApp(target, documentData, function(updated) {
					documentsByFileId.set(submissionFileId, updated);
				});
				mountedApps.set(target, {
					app,
					fileId: submissionFileId
				});
			});
		}
		function unmountAll() {
			mountedApps.forEach(function(entry, target) {
				entry.app.unmount();
				target.remove();
			});
			mountedApps.clear();
		}
		window.pkpCompilatioDocumentsTable = {
			renderDocuments,
			unmountAll
		};
	})();
	//#endregion
	//#region view/compilatioDocuments.ts
	(function() {
		const documentsByFileId = /* @__PURE__ */ new Map();
		let activeSubmissionId = null;
		function renderDocuments() {
			window.pkpCompilatioDocumentsTable.renderDocuments(documentsByFileId);
		}
		async function loadDocuments(submissionId) {
			try {
				const documents = await window.pkpCompilatioDocumentsApi.getSubmissionDocuments(submissionId);
				if (submissionId !== activeSubmissionId) return;
				documents.forEach(function(documentData) {
					window.pkpCompilatioDocumentsApi.addActionUrls(documentData);
					documentsByFileId.set(documentData.submissionFileId, documentData);
				});
				renderDocuments();
			} catch (error) {
				window.console.error("[Compilatio] Unable to load submission documents.", error);
			}
		}
		function synchronizeSubmission() {
			const config = window.pkpCompilatioDocumentsApi.getConfig();
			const submissionId = new URLSearchParams(window.location.search).get("workflowSubmissionId");
			if (!config || !config.apiUrl || !submissionId) {
				if (null === activeSubmissionId) return;
				activeSubmissionId = null;
				documentsByFileId.clear();
				window.pkpCompilatioDocumentsTable.unmountAll();
				return;
			}
			if (submissionId === activeSubmissionId) {
				renderDocuments();
				return;
			}
			window.pkpCompilatioDocumentsTable.unmountAll();
			activeSubmissionId = submissionId;
			documentsByFileId.clear();
			loadDocuments(submissionId);
		}
		function initialize() {
			window.addEventListener("compilatio:document-app-ready", renderDocuments);
			new MutationObserver(synchronizeSubmission).observe(document.body, {
				childList: true,
				subtree: true
			});
			window.addEventListener("popstate", synchronizeSubmission);
			synchronizeSubmission();
		}
		if ("loading" === document.readyState) document.addEventListener("DOMContentLoaded", initialize);
		else initialize();
	})();
	//#endregion
	//#region node_modules/@intlify/shared/dist/shared.mjs
	/*!
	* shared v9.14.5
	* (c) 2025 kazuya kawaguchi
	* Released under the MIT License.
	*/
	function warn(msg, err) {
		if (typeof console !== "undefined") {
			console.warn(`[intlify] ` + msg);
			/* istanbul ignore if */
			if (err) console.warn(err.stack);
		}
	}
	/**
	* Original Utilities
	* written by kazuya kawaguchi
	*/
	var inBrowser = typeof window !== "undefined";
	var makeSymbol = (name, shareable = false) => !shareable ? Symbol(name) : Symbol.for(name);
	var generateFormatCacheKey = (locale, key, source) => friendlyJSONstringify({
		l: locale,
		k: key,
		s: source
	});
	var friendlyJSONstringify = (json) => JSON.stringify(json).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029").replace(/\u0027/g, "\\u0027");
	var isNumber = (val) => typeof val === "number" && isFinite(val);
	var isDate = (val) => toTypeString(val) === "[object Date]";
	var isRegExp = (val) => toTypeString(val) === "[object RegExp]";
	var isEmptyObject = (val) => isPlainObject(val) && Object.keys(val).length === 0;
	var assign$1 = Object.assign;
	var _create = Object.create;
	var create = (obj = null) => _create(obj);
	var _globalThis;
	var getGlobalThis = () => {
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
		if (/\s*on\w+\s*=\s*["']?[^"'>]+["']?/gi.test(html)) html = html.replace(/(\s+)(on)(\w+\s*=)/gi, "$1&#111;n$3");
		[/(\s+(?:href|src|action|formaction)\s*=\s*["']?)\s*javascript:/gi, /(style\s*=\s*["'][^"']*url\s*\(\s*)javascript:/gi].forEach((pattern) => {
			html = html.replace(pattern, "$1javascript&#58;");
		});
		return html;
	}
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	function hasOwn(obj, key) {
		return hasOwnProperty.call(obj, key);
	}
	/**
	* Useful Utilities By Evan you
	* Modified by kazuya kawaguchi
	* MIT License
	* https://github.com/vuejs/vue-next/blob/master/packages/shared/src/index.ts
	* https://github.com/vuejs/vue-next/blob/master/packages/shared/src/codeframe.ts
	*/
	var isArray = Array.isArray;
	var isFunction = (val) => typeof val === "function";
	var isString$1 = (val) => typeof val === "string";
	var isBoolean = (val) => typeof val === "boolean";
	var isObject$1 = (val) => val !== null && typeof val === "object";
	var isPromise = (val) => {
		return isObject$1(val) && isFunction(val.then) && isFunction(val.catch);
	};
	var objectToString = Object.prototype.toString;
	var toTypeString = (value) => objectToString.call(value);
	var isPlainObject = (val) => {
		if (!isObject$1(val)) return false;
		const proto = Object.getPrototypeOf(val);
		return proto === null || proto.constructor === Object;
	};
	var toDisplayString = (val) => {
		return val == null ? "" : isArray(val) || isPlainObject(val) && val.toString === objectToString ? JSON.stringify(val, null, 2) : String(val);
	};
	function join$1(items, separator = "") {
		return items.reduce((str, item, index) => index === 0 ? str + item : str + separator + item, "");
	}
	function incrementer(code) {
		let current = code;
		return () => ++current;
	}
	var isNotObjectOrIsArray = (val) => !isObject$1(val) || isArray(val);
	function deepCopy(src, des) {
		if (isNotObjectOrIsArray(src) || isNotObjectOrIsArray(des)) throw new Error("Invalid value");
		const stack = [{
			src,
			des
		}];
		while (stack.length) {
			const { src, des } = stack.pop();
			Object.keys(src).forEach((key) => {
				if (key === "__proto__") return;
				if (isObject$1(src[key]) && !isObject$1(des[key])) des[key] = Array.isArray(src[key]) ? [] : create();
				if (isNotObjectOrIsArray(des[key]) || isNotObjectOrIsArray(src[key])) des[key] = src[key];
				else stack.push({
					src: src[key],
					des: des[key]
				});
			});
		}
	}
	//#endregion
	//#region node_modules/@intlify/message-compiler/dist/message-compiler.esm-browser.js
	/*!
	* message-compiler v9.14.5
	* (c) 2025 kazuya kawaguchi
	* Released under the MIT License.
	*/
	function createPosition(line, column, offset) {
		return {
			line,
			column,
			offset
		};
	}
	function createLocation(start, end, source) {
		const loc = {
			start,
			end
		};
		if (source != null) loc.source = source;
		return loc;
	}
	/**
	* Original Utilities
	* written by kazuya kawaguchi
	*/
	var RE_ARGS = /\{([0-9a-zA-Z]+)\}/g;
	function format$1(message, ...args) {
		if (args.length === 1 && isObject(args[0])) args = args[0];
		if (!args || !args.hasOwnProperty) args = {};
		return message.replace(RE_ARGS, (match, identifier) => {
			return args.hasOwnProperty(identifier) ? args[identifier] : "";
		});
	}
	var assign = Object.assign;
	var isString = (val) => typeof val === "string";
	var isObject = (val) => val !== null && typeof val === "object";
	function join(items, separator = "") {
		return items.reduce((str, item, index) => index === 0 ? str + item : str + separator + item, "");
	}
	var CompileWarnCodes = {
		USE_MODULO_SYNTAX: 1,
		__EXTEND_POINT__: 2
	};
	/** @internal */
	var warnMessages$1 = { [CompileWarnCodes.USE_MODULO_SYNTAX]: `Use modulo before '{{0}}'.` };
	function createCompileWarn(code, loc, ...args) {
		const msg = format$1(warnMessages$1[code] || "", ...args || []);
		const message = {
			message: String(msg),
			code
		};
		if (loc) message.location = loc;
		return message;
	}
	var CompileErrorCodes = {
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
		MUST_HAVE_MESSAGES_IN_PLURAL: 11,
		UNEXPECTED_EMPTY_LINKED_MODIFIER: 12,
		UNEXPECTED_EMPTY_LINKED_KEY: 13,
		UNEXPECTED_LEXICAL_ANALYSIS: 14,
		UNHANDLED_CODEGEN_NODE_TYPE: 15,
		UNHANDLED_MINIFIER_NODE_TYPE: 16,
		__EXTEND_POINT__: 17
	};
	/** @internal */
	var errorMessages = {
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
		[CompileErrorCodes.MUST_HAVE_MESSAGES_IN_PLURAL]: `Plural must have messages`,
		[CompileErrorCodes.UNEXPECTED_EMPTY_LINKED_MODIFIER]: `Unexpected empty linked modifier`,
		[CompileErrorCodes.UNEXPECTED_EMPTY_LINKED_KEY]: `Unexpected empty linked key`,
		[CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS]: `Unexpected lexical analysis in token: '{0}'`,
		[CompileErrorCodes.UNHANDLED_CODEGEN_NODE_TYPE]: `unhandled codegen node type: '{0}'`,
		[CompileErrorCodes.UNHANDLED_MINIFIER_NODE_TYPE]: `unhandled mimifier node type: '{0}'`
	};
	function createCompileError(code, loc, options = {}) {
		const { domain, messages, args } = options;
		const msg = format$1((messages || errorMessages)[code] || "", ...args || []);
		const error = new SyntaxError(String(msg));
		error.code = code;
		if (loc) error.location = loc;
		error.domain = domain;
		return error;
	}
	/** @internal */
	function defaultOnError(error) {
		throw error;
	}
	var CHAR_SP = " ";
	var CHAR_CR = "\r";
	var CHAR_LF = "\n";
	var CHAR_LS = String.fromCharCode(8232);
	var CHAR_PS = String.fromCharCode(8233);
	function createScanner(str) {
		const _buf = str;
		let _index = 0;
		let _line = 1;
		let _column = 1;
		let _peekOffset = 0;
		const isCRLF = (index) => _buf[index] === CHAR_CR && _buf[index + 1] === CHAR_LF;
		const isLF = (index) => _buf[index] === CHAR_LF;
		const isPS = (index) => _buf[index] === CHAR_PS;
		const isLS = (index) => _buf[index] === CHAR_LS;
		const isLineEnd = (index) => isCRLF(index) || isLF(index) || isPS(index) || isLS(index);
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
			if (isCRLF(_index)) _index++;
			_index++;
			_column++;
			return _buf[_index];
		}
		function peek() {
			if (isCRLF(_index + _peekOffset)) _peekOffset++;
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
			while (target !== _index) next();
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
	var EOF = void 0;
	var DOT = ".";
	var LITERAL_DELIMITER = "'";
	var ERROR_DOMAIN$3 = "tokenizer";
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
		function emitError(code, pos, offset, ...args) {
			const ctx = context();
			pos.column += offset;
			pos.offset += offset;
			if (onError) {
				const err = createCompileError(code, location ? createLocation(ctx.startLoc, pos) : null, {
					domain: ERROR_DOMAIN$3,
					args
				});
				onError(err);
			}
		}
		function getToken(context, type, value) {
			context.endLoc = currentPosition();
			context.currentType = type;
			const token = { type };
			if (location) token.loc = createLocation(context.startLoc, context.endLoc);
			if (value != null) token.value = value;
			return token;
		}
		const getEndToken = (context) => getToken(context, 14);
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
			if (ch === EOF) return false;
			const cc = ch.charCodeAt(0);
			return cc >= 97 && cc <= 122 || cc >= 65 && cc <= 90 || cc === 95;
		}
		function isNumberStart(ch) {
			if (ch === EOF) return false;
			const cc = ch.charCodeAt(0);
			return cc >= 48 && cc <= 57;
		}
		function isNamedIdentifierStart(scnr, context) {
			const { currentType } = context;
			if (currentType !== 2) return false;
			peekSpaces(scnr);
			const ret = isIdentifierStart(scnr.currentPeek());
			scnr.resetPeek();
			return ret;
		}
		function isListIdentifierStart(scnr, context) {
			const { currentType } = context;
			if (currentType !== 2) return false;
			peekSpaces(scnr);
			const ret = isNumberStart(scnr.currentPeek() === "-" ? scnr.peek() : scnr.currentPeek());
			scnr.resetPeek();
			return ret;
		}
		function isLiteralStart(scnr, context) {
			const { currentType } = context;
			if (currentType !== 2) return false;
			peekSpaces(scnr);
			const ret = scnr.currentPeek() === LITERAL_DELIMITER;
			scnr.resetPeek();
			return ret;
		}
		function isLinkedDotStart(scnr, context) {
			const { currentType } = context;
			if (currentType !== 8) return false;
			peekSpaces(scnr);
			const ret = scnr.currentPeek() === ".";
			scnr.resetPeek();
			return ret;
		}
		function isLinkedModifierStart(scnr, context) {
			const { currentType } = context;
			if (currentType !== 9) return false;
			peekSpaces(scnr);
			const ret = isIdentifierStart(scnr.currentPeek());
			scnr.resetPeek();
			return ret;
		}
		function isLinkedDelimiterStart(scnr, context) {
			const { currentType } = context;
			if (!(currentType === 8 || currentType === 12)) return false;
			peekSpaces(scnr);
			const ret = scnr.currentPeek() === ":";
			scnr.resetPeek();
			return ret;
		}
		function isLinkedReferStart(scnr, context) {
			const { currentType } = context;
			if (currentType !== 10) return false;
			const fn = () => {
				const ch = scnr.currentPeek();
				if (ch === "{") return isIdentifierStart(scnr.peek());
				else if (ch === "@" || ch === "%" || ch === "|" || ch === ":" || ch === "." || ch === CHAR_SP || !ch) return false;
				else if (ch === CHAR_LF) {
					scnr.peek();
					return fn();
				} else return isTextStart(scnr, false);
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
				if (ch === "{") return prev === "%" ? false : hasSpace;
				else if (ch === "@" || !ch) return prev === "%" ? true : hasSpace;
				else if (ch === "%") {
					scnr.peek();
					return fn(hasSpace, "%", true);
				} else if (ch === "|") return prev === "%" || detectModulo ? true : !(prev === CHAR_SP || prev === CHAR_LF);
				else if (ch === CHAR_SP) {
					scnr.peek();
					return fn(true, CHAR_SP, detectModulo);
				} else if (ch === CHAR_LF) {
					scnr.peek();
					return fn(true, CHAR_LF, detectModulo);
				} else return true;
			};
			const ret = fn();
			reset && scnr.resetPeek();
			return ret;
		}
		function takeChar(scnr, fn) {
			const ch = scnr.currentChar();
			if (ch === EOF) return;
			if (fn(ch)) {
				scnr.next();
				return ch;
			}
			return null;
		}
		function isIdentifier(ch) {
			const cc = ch.charCodeAt(0);
			return cc >= 97 && cc <= 122 || cc >= 65 && cc <= 90 || cc >= 48 && cc <= 57 || cc === 95 || cc === 36;
		}
		function takeIdentifierChar(scnr) {
			return takeChar(scnr, isIdentifier);
		}
		function isNamedIdentifier(ch) {
			const cc = ch.charCodeAt(0);
			return cc >= 97 && cc <= 122 || cc >= 65 && cc <= 90 || cc >= 48 && cc <= 57 || cc === 95 || cc === 36 || cc === 45;
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
			return cc >= 48 && cc <= 57 || cc >= 65 && cc <= 70 || cc >= 97 && cc <= 102;
		}
		function takeHexDigit(scnr) {
			return takeChar(scnr, isHexDigit);
		}
		function getDigits(scnr) {
			let ch = "";
			let num = "";
			while (ch = takeDigit(scnr)) num += ch;
			return num;
		}
		function readModulo(scnr) {
			skipSpaces(scnr);
			const ch = scnr.currentChar();
			if (ch !== "%") emitError(CompileErrorCodes.EXPECTED_TOKEN, currentPosition(), 0, ch);
			scnr.next();
			return "%";
		}
		function readText(scnr) {
			let buf = "";
			while (true) {
				const ch = scnr.currentChar();
				if (ch === "{" || ch === "}" || ch === "@" || ch === "|" || !ch) break;
				else if (ch === "%") {
					if (isTextStart(scnr)) {
						buf += ch;
						scnr.next();
					} else break;
				} else if (ch === CHAR_SP || ch === CHAR_LF) {
					if (isTextStart(scnr)) {
						buf += ch;
						scnr.next();
					} else if (isPluralStart(scnr)) break;
					else {
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
			while (ch = takeNamedIdentifierChar(scnr)) name += ch;
			if (scnr.currentChar() === EOF) emitError(CompileErrorCodes.UNTERMINATED_CLOSING_BRACE, currentPosition(), 0);
			return name;
		}
		function readListIdentifier(scnr) {
			skipSpaces(scnr);
			let value = "";
			if (scnr.currentChar() === "-") {
				scnr.next();
				value += `-${getDigits(scnr)}`;
			} else value += getDigits(scnr);
			if (scnr.currentChar() === EOF) emitError(CompileErrorCodes.UNTERMINATED_CLOSING_BRACE, currentPosition(), 0);
			return value;
		}
		function isLiteral(ch) {
			return ch !== LITERAL_DELIMITER && ch !== CHAR_LF;
		}
		function readLiteral(scnr) {
			skipSpaces(scnr);
			eat(scnr, `\'`);
			let ch = "";
			let literal = "";
			while (ch = takeChar(scnr, isLiteral)) if (ch === "\\") literal += readEscapeSequence(scnr);
			else literal += ch;
			const current = scnr.currentChar();
			if (current === CHAR_LF || current === EOF) {
				emitError(CompileErrorCodes.UNTERMINATED_SINGLE_QUOTE_IN_PLACEHOLDER, currentPosition(), 0);
				if (current === CHAR_LF) {
					scnr.next();
					eat(scnr, `\'`);
				}
				return literal;
			}
			eat(scnr, `\'`);
			return literal;
		}
		function readEscapeSequence(scnr) {
			const ch = scnr.currentChar();
			switch (ch) {
				case "\\":
				case `\'`:
					scnr.next();
					return `\\${ch}`;
				case "u": return readUnicodeEscapeSequence(scnr, ch, 4);
				case "U": return readUnicodeEscapeSequence(scnr, ch, 6);
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
			while (ch = takeChar(scnr, isInvalidIdentifier)) identifiers += ch;
			return identifiers;
		}
		function readLinkedModifier(scnr) {
			let ch = "";
			let name = "";
			while (ch = takeIdentifierChar(scnr)) name += ch;
			return name;
		}
		function readLinkedRefer(scnr) {
			const fn = (buf) => {
				const ch = scnr.currentChar();
				if (ch === "{" || ch === "%" || ch === "@" || ch === "|" || ch === "(" || ch === ")" || !ch) return buf;
				else if (ch === CHAR_SP) return buf;
				else if (ch === CHAR_LF || ch === DOT) {
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
			const plural = eat(scnr, "|");
			skipSpaces(scnr);
			return plural;
		}
		function readTokenInPlaceholder(scnr, context) {
			let token = null;
			switch (scnr.currentChar()) {
				case "{":
					if (context.braceNest >= 1) emitError(CompileErrorCodes.NOT_ALLOW_NEST_PLACEHOLDER, currentPosition(), 0);
					scnr.next();
					token = getToken(context, 2, "{");
					skipSpaces(scnr);
					context.braceNest++;
					return token;
				case "}":
					if (context.braceNest > 0 && context.currentType === 2) emitError(CompileErrorCodes.EMPTY_PLACEHOLDER, currentPosition(), 0);
					scnr.next();
					token = getToken(context, 3, "}");
					context.braceNest--;
					context.braceNest > 0 && skipSpaces(scnr);
					if (context.inLinked && context.braceNest === 0) context.inLinked = false;
					return token;
				case "@":
					if (context.braceNest > 0) emitError(CompileErrorCodes.UNTERMINATED_CLOSING_BRACE, currentPosition(), 0);
					token = readTokenInLinked(scnr, context) || getEndToken(context);
					context.braceNest = 0;
					return token;
				default: {
					let validNamedIdentifier = true;
					let validListIdentifier = true;
					let validLiteral = true;
					if (isPluralStart(scnr)) {
						if (context.braceNest > 0) emitError(CompileErrorCodes.UNTERMINATED_CLOSING_BRACE, currentPosition(), 0);
						token = getToken(context, 1, readPlural(scnr));
						context.braceNest = 0;
						context.inLinked = false;
						return token;
					}
					if (context.braceNest > 0 && (context.currentType === 5 || context.currentType === 6 || context.currentType === 7)) {
						emitError(CompileErrorCodes.UNTERMINATED_CLOSING_BRACE, currentPosition(), 0);
						context.braceNest = 0;
						return readToken(scnr, context);
					}
					if (validNamedIdentifier = isNamedIdentifierStart(scnr, context)) {
						token = getToken(context, 5, readNamedIdentifier(scnr));
						skipSpaces(scnr);
						return token;
					}
					if (validListIdentifier = isListIdentifierStart(scnr, context)) {
						token = getToken(context, 6, readListIdentifier(scnr));
						skipSpaces(scnr);
						return token;
					}
					if (validLiteral = isLiteralStart(scnr, context)) {
						token = getToken(context, 7, readLiteral(scnr));
						skipSpaces(scnr);
						return token;
					}
					if (!validNamedIdentifier && !validListIdentifier && !validLiteral) {
						token = getToken(context, 13, readInvalidIdentifier(scnr));
						emitError(CompileErrorCodes.INVALID_TOKEN_IN_PLACEHOLDER, currentPosition(), 0, token.value);
						skipSpaces(scnr);
						return token;
					}
					break;
				}
			}
			return token;
		}
		function readTokenInLinked(scnr, context) {
			const { currentType } = context;
			let token = null;
			const ch = scnr.currentChar();
			if ((currentType === 8 || currentType === 9 || currentType === 12 || currentType === 10) && (ch === CHAR_LF || ch === CHAR_SP)) emitError(CompileErrorCodes.INVALID_LINKED_FORMAT, currentPosition(), 0);
			switch (ch) {
				case "@":
					scnr.next();
					token = getToken(context, 8, "@");
					context.inLinked = true;
					return token;
				case ".":
					skipSpaces(scnr);
					scnr.next();
					return getToken(context, 9, ".");
				case ":":
					skipSpaces(scnr);
					scnr.next();
					return getToken(context, 10, ":");
				default:
					if (isPluralStart(scnr)) {
						token = getToken(context, 1, readPlural(scnr));
						context.braceNest = 0;
						context.inLinked = false;
						return token;
					}
					if (isLinkedDotStart(scnr, context) || isLinkedDelimiterStart(scnr, context)) {
						skipSpaces(scnr);
						return readTokenInLinked(scnr, context);
					}
					if (isLinkedModifierStart(scnr, context)) {
						skipSpaces(scnr);
						return getToken(context, 12, readLinkedModifier(scnr));
					}
					if (isLinkedReferStart(scnr, context)) {
						skipSpaces(scnr);
						if (ch === "{") return readTokenInPlaceholder(scnr, context) || token;
						else return getToken(context, 11, readLinkedRefer(scnr));
					}
					if (currentType === 8) emitError(CompileErrorCodes.INVALID_LINKED_FORMAT, currentPosition(), 0);
					context.braceNest = 0;
					context.inLinked = false;
					return readToken(scnr, context);
			}
		}
		function readToken(scnr, context) {
			let token = { type: 14 };
			if (context.braceNest > 0) return readTokenInPlaceholder(scnr, context) || getEndToken(context);
			if (context.inLinked) return readTokenInLinked(scnr, context) || getEndToken(context);
			switch (scnr.currentChar()) {
				case "{": return readTokenInPlaceholder(scnr, context) || getEndToken(context);
				case "}":
					emitError(CompileErrorCodes.UNBALANCED_CLOSING_BRACE, currentPosition(), 0);
					scnr.next();
					return getToken(context, 3, "}");
				case "@": return readTokenInLinked(scnr, context) || getEndToken(context);
				default: {
					if (isPluralStart(scnr)) {
						token = getToken(context, 1, readPlural(scnr));
						context.braceNest = 0;
						context.inLinked = false;
						return token;
					}
					const { isModulo, hasSpace } = detectModuloStart(scnr);
					if (isModulo) return hasSpace ? getToken(context, 0, readText(scnr)) : getToken(context, 4, readModulo(scnr));
					if (isTextStart(scnr)) return getToken(context, 0, readText(scnr));
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
			if (_scnr.currentChar() === EOF) return getToken(_context, 14);
			return readToken(_scnr, _context);
		}
		return {
			nextToken,
			currentOffset,
			currentPosition,
			context
		};
	}
	var ERROR_DOMAIN$2 = "parser";
	var KNOWN_ESCAPES = /(?:\\\\|\\'|\\u([0-9a-fA-F]{4})|\\U([0-9a-fA-F]{6}))/g;
	function fromEscapeSequence(match, codePoint4, codePoint6) {
		switch (match) {
			case `\\\\`: return `\\`;
			case `\\\'`: return `\'`;
			default: {
				const codePoint = parseInt(codePoint4 || codePoint6, 16);
				if (codePoint <= 55295 || codePoint >= 57344) return String.fromCodePoint(codePoint);
				return "�";
			}
		}
	}
	function createParser(options = {}) {
		const location = options.location !== false;
		const { onError, onWarn } = options;
		function emitError(tokenzer, code, start, offset, ...args) {
			const end = tokenzer.currentPosition();
			end.offset += offset;
			end.column += offset;
			if (onError) {
				const err = createCompileError(code, location ? createLocation(start, end) : null, {
					domain: ERROR_DOMAIN$2,
					args
				});
				onError(err);
			}
		}
		function emitWarn(tokenzer, code, start, offset, ...args) {
			const end = tokenzer.currentPosition();
			end.offset += offset;
			end.column += offset;
			if (onWarn) {
				const loc = location ? createLocation(start, end) : null;
				onWarn(createCompileWarn(code, loc, args));
			}
		}
		function startNode(type, offset, loc) {
			const node = { type };
			if (location) {
				node.start = offset;
				node.end = offset;
				node.loc = {
					start: loc,
					end: loc
				};
			}
			return node;
		}
		function endNode(node, offset, pos, type) {
			if (type) node.type = type;
			if (location) {
				node.end = offset;
				if (node.loc) node.loc.end = pos;
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
			const { lastOffset: offset, lastStartLoc: loc } = tokenizer.context();
			const node = startNode(5, offset, loc);
			node.index = parseInt(index, 10);
			tokenizer.nextToken();
			endNode(node, tokenizer.currentOffset(), tokenizer.currentPosition());
			return node;
		}
		function parseNamed(tokenizer, key, modulo) {
			const { lastOffset: offset, lastStartLoc: loc } = tokenizer.context();
			const node = startNode(4, offset, loc);
			node.key = key;
			if (modulo === true) node.modulo = true;
			tokenizer.nextToken();
			endNode(node, tokenizer.currentOffset(), tokenizer.currentPosition());
			return node;
		}
		function parseLiteral(tokenizer, value) {
			const { lastOffset: offset, lastStartLoc: loc } = tokenizer.context();
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
			if (token.value == null) emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
			node.value = token.value || "";
			endNode(node, tokenizer.currentOffset(), tokenizer.currentPosition());
			return { node };
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
			if (token.type !== 10) emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
			token = tokenizer.nextToken();
			if (token.type === 2) token = tokenizer.nextToken();
			switch (token.type) {
				case 11:
					if (token.value == null) emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
					linkedNode.key = parseLinkedKey(tokenizer, token.value || "");
					break;
				case 5:
					if (token.value == null) emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
					linkedNode.key = parseNamed(tokenizer, token.value || "");
					break;
				case 6:
					if (token.value == null) emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
					linkedNode.key = parseList(tokenizer, token.value || "");
					break;
				case 7:
					if (token.value == null) emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
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
			return { node: linkedNode };
		}
		function parseMessage(tokenizer) {
			const context = tokenizer.context();
			const node = startNode(2, context.currentType === 1 ? tokenizer.currentOffset() : context.offset, context.currentType === 1 ? context.endLoc : context.startLoc);
			node.items = [];
			let nextToken = null;
			let modulo = null;
			do {
				const token = nextToken || tokenizer.nextToken();
				nextToken = null;
				switch (token.type) {
					case 0:
						if (token.value == null) emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
						node.items.push(parseText(tokenizer, token.value || ""));
						break;
					case 6:
						if (token.value == null) emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
						node.items.push(parseList(tokenizer, token.value || ""));
						break;
					case 4:
						modulo = true;
						break;
					case 5:
						if (token.value == null) emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
						node.items.push(parseNamed(tokenizer, token.value || "", !!modulo));
						if (modulo) {
							emitWarn(tokenizer, CompileWarnCodes.USE_MODULO_SYNTAX, context.lastStartLoc, 0, getTokenCaption(token));
							modulo = null;
						}
						break;
					case 7:
						if (token.value == null) emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
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
			endNode(node, context.currentType === 1 ? context.lastOffset : tokenizer.currentOffset(), context.currentType === 1 ? context.lastEndLoc : tokenizer.currentPosition());
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
				if (!hasEmptyMessage) hasEmptyMessage = msg.items.length === 0;
				node.cases.push(msg);
			} while (context.currentType !== 14);
			if (hasEmptyMessage) emitError(tokenizer, CompileErrorCodes.MUST_HAVE_MESSAGES_IN_PLURAL, loc, 0);
			endNode(node, tokenizer.currentOffset(), tokenizer.currentPosition());
			return node;
		}
		function parseResource(tokenizer) {
			const context = tokenizer.context();
			const { offset, startLoc } = context;
			const msgNode = parseMessage(tokenizer);
			if (context.currentType === 14) return msgNode;
			else return parsePlural(tokenizer, offset, startLoc, msgNode);
		}
		function parse(source) {
			const tokenizer = createTokenizer(source, assign({}, options));
			const context = tokenizer.context();
			const node = startNode(0, context.offset, context.startLoc);
			if (location && node.loc) node.loc.source = source;
			node.body = parseResource(tokenizer);
			if (options.onCacheKey) node.cacheKey = options.onCacheKey(source);
			if (context.currentType !== 14) emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, source[context.offset] || "");
			endNode(node, tokenizer.currentOffset(), tokenizer.currentPosition());
			return node;
		}
		return { parse };
	}
	function getTokenCaption(token) {
		if (token.type === 14) return "EOF";
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
		return {
			context,
			helper
		};
	}
	function traverseNodes(nodes, transformer) {
		for (let i = 0; i < nodes.length; i++) traverseNode(nodes[i], transformer);
	}
	function traverseNode(node, transformer) {
		switch (node.type) {
			case 1:
				traverseNodes(node.cases, transformer);
				transformer.helper("plural");
				break;
			case 2:
				traverseNodes(node.items, transformer);
				break;
			case 6:
				traverseNode(node.key, transformer);
				transformer.helper("linked");
				transformer.helper("type");
				break;
			case 5:
				transformer.helper("interpolate");
				transformer.helper("list");
				break;
			case 4:
				transformer.helper("interpolate");
				transformer.helper("named");
		}
	}
	function transform(ast, options = {}) {
		const transformer = createTransformer(ast);
		transformer.helper("normalize");
		ast.body && traverseNode(ast.body, transformer);
		const context = transformer.context();
		ast.helpers = Array.from(context.helpers);
	}
	function optimize(ast) {
		const body = ast.body;
		if (body.type === 2) optimizeMessageNode(body);
		else body.cases.forEach((c) => optimizeMessageNode(c));
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
				if (!(item.type === 3 || item.type === 9)) break;
				if (item.value == null) break;
				values.push(item.value);
			}
			if (values.length === message.items.length) {
				message.static = join(values);
				for (let i = 0; i < message.items.length; i++) {
					const item = message.items[i];
					if (item.type === 3 || item.type === 9) delete item.value;
				}
			}
		}
	}
	var ERROR_DOMAIN$1 = "minifier";
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
				for (let i = 0; i < cases.length; i++) minify(cases[i]);
				plural.c = cases;
				delete plural.cases;
				break;
			}
			case 2: {
				const message = node;
				const items = message.items;
				for (let i = 0; i < items.length; i++) minify(items[i]);
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
			default: throw createCompileError(CompileErrorCodes.UNHANDLED_MINIFIER_NODE_TYPE, null, {
				domain: ERROR_DOMAIN$1,
				args: [node.type]
			});
		}
		delete node.type;
	}
	var ERROR_DOMAIN = "parser";
	function createCodeGenerator(ast, options) {
		const { sourceMap, filename, breakLineCode, needIndent: _needIndent } = options;
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
		if (location && ast.loc) _context.source = ast.loc.source;
		const context = () => _context;
		function push(code, node) {
			_context.code += code;
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
		generator.push(`${helper("linked")}(`);
		generateNode(generator, node.key);
		if (node.modifier) {
			generator.push(`, `);
			generateNode(generator, node.modifier);
			generator.push(`, _type`);
		} else generator.push(`, undefined, _type`);
		generator.push(`)`);
	}
	function generateMessageNode(generator, node) {
		const { helper, needIndent } = generator;
		generator.push(`${helper("normalize")}([`);
		generator.indent(needIndent());
		const length = node.items.length;
		for (let i = 0; i < length; i++) {
			generateNode(generator, node.items[i]);
			if (i === length - 1) break;
			generator.push(", ");
		}
		generator.deindent(needIndent());
		generator.push("])");
	}
	function generatePluralNode(generator, node) {
		const { helper, needIndent } = generator;
		if (node.cases.length > 1) {
			generator.push(`${helper("plural")}([`);
			generator.indent(needIndent());
			const length = node.cases.length;
			for (let i = 0; i < length; i++) {
				generateNode(generator, node.cases[i]);
				if (i === length - 1) break;
				generator.push(", ");
			}
			generator.deindent(needIndent());
			generator.push(`])`);
		}
	}
	function generateResource(generator, node) {
		if (node.body) generateNode(generator, node.body);
		else generator.push("null");
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
				generator.push(`${helper("interpolate")}(${helper("list")}(${node.index}))`, node);
				break;
			case 4:
				generator.push(`${helper("interpolate")}(${helper("named")}(${JSON.stringify(node.key)}))`, node);
				break;
			case 9:
				generator.push(JSON.stringify(node.value), node);
				break;
			case 3:
				generator.push(JSON.stringify(node.value), node);
				break;
			default: throw createCompileError(CompileErrorCodes.UNHANDLED_CODEGEN_NODE_TYPE, null, {
				domain: ERROR_DOMAIN,
				args: [node.type]
			});
		}
	}
	var generate = (ast, options = {}) => {
		const mode = isString(options.mode) ? options.mode : "normal";
		const filename = isString(options.filename) ? options.filename : "message.intl";
		const sourceMap = !!options.sourceMap;
		const breakLineCode = options.breakLineCode != null ? options.breakLineCode : mode === "arrow" ? ";" : "\n";
		const needIndent = options.needIndent ? options.needIndent : mode !== "arrow";
		const helpers = ast.helpers || [];
		const generator = createCodeGenerator(ast, {
			mode,
			filename,
			sourceMap,
			breakLineCode,
			needIndent
		});
		generator.push(mode === "normal" ? `function __msg__ (ctx) {` : `(ctx) => {`);
		generator.indent(needIndent);
		if (helpers.length > 0) {
			generator.push(`const { ${join(helpers.map((s) => `${s}: _${s}`), ", ")} } = ctx`);
			generator.newline();
		}
		generator.push(`return `);
		generateNode(generator, ast);
		generator.deindent(needIndent);
		generator.push(`}`);
		delete ast.helpers;
		const { code, map } = generator.context();
		return {
			ast,
			code,
			map: map ? map.toJSON() : void 0
		};
	};
	function baseCompile$1(source, options = {}) {
		const assignedOptions = assign({}, options);
		const jit = !!assignedOptions.jit;
		const enalbeMinify = !!assignedOptions.minify;
		const enambeOptimize = assignedOptions.optimize == null ? true : assignedOptions.optimize;
		const ast = createParser(assignedOptions).parse(source);
		if (!jit) {
			transform(ast, assignedOptions);
			return generate(ast, assignedOptions);
		} else {
			enambeOptimize && optimize(ast);
			enalbeMinify && minify(ast);
			return {
				ast,
				code: ""
			};
		}
	}
	//#endregion
	//#region node_modules/@intlify/core-base/dist/core-base.mjs
	/*!
	* core-base v9.14.5
	* (c) 2025 kazuya kawaguchi
	* Released under the MIT License.
	*/
	/**
	* This is only called in esm-bundler builds.
	* istanbul-ignore-next
	*/
	function initFeatureFlags$1() {
		if (typeof __INTLIFY_JIT_COMPILATION__ !== "boolean") getGlobalThis().__INTLIFY_JIT_COMPILATION__ = false;
		if (typeof __INTLIFY_DROP_MESSAGE_COMPILER__ !== "boolean") getGlobalThis().__INTLIFY_DROP_MESSAGE_COMPILER__ = false;
	}
	function isMessageAST(val) {
		return isObject$1(val) && resolveType(val) === 0 && (hasOwn(val, "b") || hasOwn(val, "body"));
	}
	var PROPS_BODY = ["b", "body"];
	function resolveBody(node) {
		return resolveProps(node, PROPS_BODY);
	}
	var PROPS_CASES = ["c", "cases"];
	function resolveCases(node) {
		return resolveProps(node, PROPS_CASES, []);
	}
	var PROPS_STATIC = ["s", "static"];
	function resolveStatic(node) {
		return resolveProps(node, PROPS_STATIC);
	}
	var PROPS_ITEMS = ["i", "items"];
	function resolveItems(node) {
		return resolveProps(node, PROPS_ITEMS, []);
	}
	var PROPS_TYPE = ["t", "type"];
	function resolveType(node) {
		return resolveProps(node, PROPS_TYPE);
	}
	var PROPS_VALUE = ["v", "value"];
	function resolveValue$1(node, type) {
		const resolved = resolveProps(node, PROPS_VALUE);
		if (resolved != null) return resolved;
		else throw createUnhandleNodeError(type);
	}
	var PROPS_MODIFIER = ["m", "modifier"];
	function resolveLinkedModifier(node) {
		return resolveProps(node, PROPS_MODIFIER);
	}
	var PROPS_KEY = ["k", "key"];
	function resolveLinkedKey(node) {
		const resolved = resolveProps(node, PROPS_KEY);
		if (resolved) return resolved;
		else throw createUnhandleNodeError(6);
	}
	function resolveProps(node, props, defaultValue) {
		for (let i = 0; i < props.length; i++) {
			const prop = props[i];
			if (hasOwn(node, prop) && node[prop] != null) return node[prop];
		}
		return defaultValue;
	}
	var AST_NODE_PROPS_KEYS = [
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
		return /* @__PURE__ */ new Error(`unhandled node type: ${type}`);
	}
	var pathStateMachine = [];
	pathStateMachine[0] = {
		["w"]: [0],
		["i"]: [3, 0],
		["["]: [4],
		["o"]: [7]
	};
	pathStateMachine[1] = {
		["w"]: [1],
		["."]: [2],
		["["]: [4],
		["o"]: [7]
	};
	pathStateMachine[2] = {
		["w"]: [2],
		["i"]: [3, 0],
		["0"]: [3, 0]
	};
	pathStateMachine[3] = {
		["i"]: [3, 0],
		["0"]: [3, 0],
		["w"]: [1, 1],
		["."]: [2, 1],
		["["]: [4, 1],
		["o"]: [7, 1]
	};
	pathStateMachine[4] = {
		["'"]: [5, 0],
		["\""]: [6, 0],
		["["]: [4, 2],
		["]"]: [1, 3],
		["o"]: 8,
		["l"]: [4, 0]
	};
	pathStateMachine[5] = {
		["'"]: [4, 0],
		["o"]: 8,
		["l"]: [5, 0]
	};
	pathStateMachine[6] = {
		["\""]: [4, 0],
		["o"]: 8,
		["l"]: [6, 0]
	};
	/**
	* Check if an expression is a literal value.
	*/
	var literalValueRE = /^\s?(?:true|false|-?[\d.]+|'[^']*'|"[^"]*")\s?$/;
	function isLiteral(exp) {
		return literalValueRE.test(exp);
	}
	/**
	* Strip quotes from a string
	*/
	function stripQuotes(str) {
		const a = str.charCodeAt(0);
		return a === str.charCodeAt(str.length - 1) && (a === 34 || a === 39) ? str.slice(1, -1) : str;
	}
	/**
	* Determine the type of a character in a keypath.
	*/
	function getPathCharType(ch) {
		if (ch === void 0 || ch === null) return "o";
		switch (ch.charCodeAt(0)) {
			case 91:
			case 93:
			case 46:
			case 34:
			case 39: return ch;
			case 95:
			case 36:
			case 45: return "i";
			case 9:
			case 10:
			case 13:
			case 160:
			case 65279:
			case 8232:
			case 8233: return "w";
		}
		return "i";
	}
	/**
	* Format a subPath, return its plain form if it is
	* a literal string or number. Otherwise prepend the
	* dynamic indicator (*).
	*/
	function formatSubPath(path) {
		const trimmed = path.trim();
		if (path.charAt(0) === "0" && isNaN(parseInt(path))) return false;
		return isLiteral(trimmed) ? stripQuotes(trimmed) : "*" + trimmed;
	}
	/**
	* Parse a string path into an array of segments
	*/
	function parse(path) {
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
		actions[0] = () => {
			if (key === void 0) key = newChar;
			else key += newChar;
		};
		actions[1] = () => {
			if (key !== void 0) {
				keys.push(key);
				key = void 0;
			}
		};
		actions[2] = () => {
			actions[0]();
			subPathDepth++;
		};
		actions[3] = () => {
			if (subPathDepth > 0) {
				subPathDepth--;
				mode = 4;
				actions[0]();
			} else {
				subPathDepth = 0;
				if (key === void 0) return false;
				key = formatSubPath(key);
				if (key === false) return false;
				else actions[1]();
			}
		};
		function maybeUnescapeQuote() {
			const nextChar = path[index + 1];
			if (mode === 5 && nextChar === "'" || mode === 6 && nextChar === "\"") {
				index++;
				newChar = "\\" + nextChar;
				actions[0]();
				return true;
			}
		}
		while (mode !== null) {
			index++;
			c = path[index];
			if (c === "\\" && maybeUnescapeQuote()) continue;
			type = getPathCharType(c);
			typeMap = pathStateMachine[mode];
			transition = typeMap[type] || typeMap["l"] || 8;
			if (transition === 8) return;
			mode = transition[0];
			if (transition[1] !== void 0) {
				action = actions[transition[1]];
				if (action) {
					newChar = c;
					if (action() === false) return;
				}
			}
			if (mode === 7) return keys;
		}
	}
	var cache = /* @__PURE__ */ new Map();
	/**
	* key-value message resolver
	*
	* @remarks
	* Resolves messages with the key-value structure. Note that messages with a hierarchical structure such as objects cannot be resolved
	*
	* @param obj - A target object to be resolved with path
	* @param path - A {@link Path | path} to resolve the value of message
	*
	* @returns A resolved {@link PathValue | path value}
	*
	* @VueI18nGeneral
	*/
	function resolveWithKeyValue(obj, path) {
		return isObject$1(obj) ? obj[path] : null;
	}
	/**
	* message resolver
	*
	* @remarks
	* Resolves messages. messages with a hierarchical structure such as objects can be resolved. This resolver is used in VueI18n as default.
	*
	* @param obj - A target object to be resolved with path
	* @param path - A {@link Path | path} to resolve the value of message
	*
	* @returns A resolved {@link PathValue | path value}
	*
	* @VueI18nGeneral
	*/
	function resolveValue(obj, path) {
		if (!isObject$1(obj)) return null;
		let hit = cache.get(path);
		if (!hit) {
			hit = parse(path);
			if (hit) cache.set(path, hit);
		}
		if (!hit) return null;
		const len = hit.length;
		let last = obj;
		let i = 0;
		while (i < len) {
			const key = hit[i];
			/**
			* NOTE:
			* if `key` is intlify message format AST node key and `last` is intlify message format AST, skip it.
			* because the AST node is not a key-value structure.
			*/
			if (AST_NODE_PROPS_KEYS.includes(key) && isMessageAST(last)) return null;
			const val = last[key];
			if (val === void 0) return null;
			if (isFunction(last)) return null;
			last = val;
			i++;
		}
		return last;
	}
	var DEFAULT_MODIFIER = (str) => str;
	var DEFAULT_MESSAGE = (ctx) => "";
	var DEFAULT_MESSAGE_DATA_TYPE = "text";
	var DEFAULT_NORMALIZE = (values) => values.length === 0 ? "" : join$1(values);
	var DEFAULT_INTERPOLATE = toDisplayString;
	function pluralDefault(choice, choicesLength) {
		choice = Math.abs(choice);
		if (choicesLength === 2) return choice ? choice > 1 ? 1 : 0 : 1;
		return choice ? Math.min(choice, 2) : 0;
	}
	function getPluralIndex(options) {
		const index = isNumber(options.pluralIndex) ? options.pluralIndex : -1;
		return options.named && (isNumber(options.named.count) || isNumber(options.named.n)) ? isNumber(options.named.count) ? options.named.count : isNumber(options.named.n) ? options.named.n : index : index;
	}
	function normalizeNamed(pluralIndex, props) {
		if (!props.count) props.count = pluralIndex;
		if (!props.n) props.n = pluralIndex;
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
			let type = "text";
			let modifier = "";
			if (args.length === 1) {
				if (isObject$1(arg1)) {
					modifier = arg1.modifier || modifier;
					type = arg1.type || type;
				} else if (isString$1(arg1)) modifier = arg1 || modifier;
			} else if (args.length === 2) {
				if (isString$1(arg1)) modifier = arg1 || modifier;
				if (isString$1(arg2)) type = arg2 || type;
			}
			const ret = message(key)(ctx);
			const msg = type === "vnode" && isArray(ret) && modifier ? ret[0] : ret;
			return modifier ? _modifier(modifier)(msg, type) : msg;
		};
		const ctx = {
			["list"]: list,
			["named"]: named,
			["plural"]: plural,
			["linked"]: linked,
			["message"]: message,
			["type"]: type,
			["interpolate"]: interpolate,
			["normalize"]: normalize,
			["values"]: assign$1(create(), _list, _named)
		};
		return ctx;
	}
	var code$1$1 = CompileWarnCodes.__EXTEND_POINT__;
	var inc$1$1 = incrementer(code$1$1);
	var CoreWarnCodes = {
		NOT_FOUND_KEY: code$1$1,
		FALLBACK_TO_TRANSLATE: inc$1$1(),
		CANNOT_FORMAT_NUMBER: inc$1$1(),
		FALLBACK_TO_NUMBER_FORMAT: inc$1$1(),
		CANNOT_FORMAT_DATE: inc$1$1(),
		FALLBACK_TO_DATE_FORMAT: inc$1$1(),
		EXPERIMENTAL_CUSTOM_MESSAGE_COMPILER: inc$1$1(),
		__EXTEND_POINT__: inc$1$1()
	};
	CoreWarnCodes.NOT_FOUND_KEY, CoreWarnCodes.FALLBACK_TO_TRANSLATE, CoreWarnCodes.CANNOT_FORMAT_NUMBER, CoreWarnCodes.FALLBACK_TO_NUMBER_FORMAT, CoreWarnCodes.CANNOT_FORMAT_DATE, CoreWarnCodes.FALLBACK_TO_DATE_FORMAT, CoreWarnCodes.EXPERIMENTAL_CUSTOM_MESSAGE_COMPILER;
	var code$2 = CompileErrorCodes.__EXTEND_POINT__;
	var inc$2 = incrementer(code$2);
	var CoreErrorCodes = {
		INVALID_ARGUMENT: code$2,
		INVALID_DATE_ARGUMENT: inc$2(),
		INVALID_ISO_DATE_ARGUMENT: inc$2(),
		NOT_SUPPORT_NON_STRING_MESSAGE: inc$2(),
		NOT_SUPPORT_LOCALE_PROMISE_VALUE: inc$2(),
		NOT_SUPPORT_LOCALE_ASYNC_FUNCTION: inc$2(),
		NOT_SUPPORT_LOCALE_TYPE: inc$2(),
		__EXTEND_POINT__: inc$2()
	};
	function createCoreError(code) {
		return createCompileError(code, null, void 0);
	}
	CoreErrorCodes.INVALID_ARGUMENT, CoreErrorCodes.INVALID_DATE_ARGUMENT, CoreErrorCodes.INVALID_ISO_DATE_ARGUMENT, CoreErrorCodes.NOT_SUPPORT_NON_STRING_MESSAGE, CoreErrorCodes.NOT_SUPPORT_LOCALE_PROMISE_VALUE, CoreErrorCodes.NOT_SUPPORT_LOCALE_ASYNC_FUNCTION, CoreErrorCodes.NOT_SUPPORT_LOCALE_TYPE;
	/** @internal */
	function getLocale(context, options) {
		return options.locale != null ? resolveLocale(options.locale) : resolveLocale(context.locale);
	}
	var _resolveLocale;
	/** @internal */
	function resolveLocale(locale) {
		if (isString$1(locale)) return locale;
		else if (isFunction(locale)) {
			if (locale.resolvedOnce && _resolveLocale != null) return _resolveLocale;
			else if (locale.constructor.name === "Function") {
				const resolve = locale();
				if (isPromise(resolve)) throw createCoreError(CoreErrorCodes.NOT_SUPPORT_LOCALE_PROMISE_VALUE);
				return _resolveLocale = resolve;
			} else throw createCoreError(CoreErrorCodes.NOT_SUPPORT_LOCALE_ASYNC_FUNCTION);
		} else throw createCoreError(CoreErrorCodes.NOT_SUPPORT_LOCALE_TYPE);
	}
	/**
	* Fallback with simple implemenation
	*
	* @remarks
	* A fallback locale function implemented with a simple fallback algorithm.
	*
	* Basically, it returns the value as specified in the `fallbackLocale` props, and is processed with the fallback inside intlify.
	*
	* @param ctx - A {@link CoreContext | context}
	* @param fallback - A {@link FallbackLocale | fallback locale}
	* @param start - A starting {@link Locale | locale}
	*
	* @returns Fallback locales
	*
	* @VueI18nGeneral
	*/
	function fallbackWithSimple(ctx, fallback, start) {
		return [.../* @__PURE__ */ new Set([start, ...isArray(fallback) ? fallback : isObject$1(fallback) ? Object.keys(fallback) : isString$1(fallback) ? [fallback] : [start]])];
	}
	/**
	* Fallback with locale chain
	*
	* @remarks
	* A fallback locale function implemented with a fallback chain algorithm. It's used in VueI18n as default.
	*
	* @param ctx - A {@link CoreContext | context}
	* @param fallback - A {@link FallbackLocale | fallback locale}
	* @param start - A starting {@link Locale | locale}
	*
	* @returns Fallback locales
	*
	* @VueI18nSee [Fallbacking](../guide/essentials/fallback)
	*
	* @VueI18nGeneral
	*/
	function fallbackWithLocaleChain(ctx, fallback, start) {
		const startLocale = isString$1(start) ? start : DEFAULT_LOCALE;
		const context = ctx;
		if (!context.__localeChainCache) context.__localeChainCache = /* @__PURE__ */ new Map();
		let chain = context.__localeChainCache.get(startLocale);
		if (!chain) {
			chain = [];
			let block = [start];
			while (isArray(block)) block = appendBlockToChain(chain, block, fallback);
			const defaults = isArray(fallback) || !isPlainObject(fallback) ? fallback : fallback["default"] ? fallback["default"] : null;
			block = isString$1(defaults) ? [defaults] : defaults;
			if (isArray(block)) appendBlockToChain(chain, block, false);
			context.__localeChainCache.set(startLocale, chain);
		}
		return chain;
	}
	function appendBlockToChain(chain, block, blocks) {
		let follow = true;
		for (let i = 0; i < block.length && isBoolean(follow); i++) {
			const locale = block[i];
			if (isString$1(locale)) follow = appendLocaleToChain(chain, block[i], blocks);
		}
		return follow;
	}
	function appendLocaleToChain(chain, locale, blocks) {
		let follow;
		const tokens = locale.split("-");
		do {
			follow = appendItemToChain(chain, tokens.join("-"), blocks);
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
				if ((isArray(blocks) || isPlainObject(blocks)) && blocks[locale]) follow = blocks[locale];
			}
		}
		return follow;
	}
	/**
	* Intlify core-base version
	* @internal
	*/
	var VERSION$1 = "9.14.5";
	var DEFAULT_LOCALE = "en-US";
	var capitalize = (str) => `${str.charAt(0).toLocaleUpperCase()}${str.substr(1)}`;
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
	var _compiler;
	function registerMessageCompiler(compiler) {
		_compiler = compiler;
	}
	var _resolver;
	/**
	* Register the message resolver
	*
	* @param resolver - A {@link MessageResolver} function
	*
	* @VueI18nGeneral
	*/
	function registerMessageResolver(resolver) {
		_resolver = resolver;
	}
	var _fallbacker;
	/**
	* Register the locale fallbacker
	*
	* @param fallbacker - A {@link LocaleFallbacker} function
	*
	* @VueI18nGeneral
	*/
	function registerLocaleFallbacker(fallbacker) {
		_fallbacker = fallbacker;
	}
	var _fallbackContext = null;
	var setFallbackContext = (context) => {
		_fallbackContext = context;
	};
	var getFallbackContext = () => _fallbackContext;
	var _cid = 0;
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
		context.datetimeFormats = datetimeFormats;
		context.numberFormats = numberFormats;
		context.__datetimeFormatters = __datetimeFormatters;
		context.__numberFormatters = __numberFormatters;
		return context;
	}
	var createResources = (locale) => ({ [locale]: create() });
	/** @internal */
	function handleMissing(context, key, locale, missingWarn, type) {
		const { missing, onWarn } = context;
		if (missing !== null) {
			const ret = missing(context, locale, key, type);
			return isString$1(ret) ? ret : key;
		} else return key;
	}
	/** @internal */
	function updateFallbackLocale(ctx, locale, fallback) {
		const context = ctx;
		context.__localeChainCache = /* @__PURE__ */ new Map();
		ctx.localeFallbacker(ctx, fallback, locale);
	}
	/** @internal */
	function isAlmostSameLocale(locale, compareLocale) {
		if (locale === compareLocale) return false;
		return locale.split("-")[0] === compareLocale.split("-")[0];
	}
	/** @internal */
	function isImplicitFallback(targetLocale, locales) {
		const index = locales.indexOf(targetLocale);
		if (index === -1) return false;
		for (let i = index + 1; i < locales.length; i++) if (isAlmostSameLocale(targetLocale, locales[i])) return true;
		return false;
	}
	function format(ast) {
		const msg = (ctx) => formatParts(ctx, ast);
		return msg;
	}
	function formatParts(ctx, ast) {
		const body = resolveBody(ast);
		if (body == null) throw createUnhandleNodeError(0);
		if (resolveType(body) === 1) {
			const cases = resolveCases(body);
			return ctx.plural(cases.reduce((messages, c) => [...messages, formatMessageParts(ctx, c)], []));
		} else return formatMessageParts(ctx, body);
	}
	function formatMessageParts(ctx, node) {
		const static_ = resolveStatic(node);
		if (static_ != null) return ctx.type === "text" ? static_ : ctx.normalize([static_]);
		else {
			const messages = resolveItems(node).reduce((acm, c) => [...acm, formatMessagePart(ctx, c)], []);
			return ctx.normalize(messages);
		}
	}
	function formatMessagePart(ctx, node) {
		const type = resolveType(node);
		switch (type) {
			case 3: return resolveValue$1(node, type);
			case 9: return resolveValue$1(node, type);
			case 4: {
				const named = node;
				if (hasOwn(named, "k") && named.k) return ctx.interpolate(ctx.named(named.k));
				if (hasOwn(named, "key") && named.key) return ctx.interpolate(ctx.named(named.key));
				throw createUnhandleNodeError(type);
			}
			case 5: {
				const list = node;
				if (hasOwn(list, "i") && isNumber(list.i)) return ctx.interpolate(ctx.list(list.i));
				if (hasOwn(list, "index") && isNumber(list.index)) return ctx.interpolate(ctx.list(list.index));
				throw createUnhandleNodeError(type);
			}
			case 6: {
				const linked = node;
				const modifier = resolveLinkedModifier(linked);
				const key = resolveLinkedKey(linked);
				return ctx.linked(formatMessagePart(ctx, key), modifier ? formatMessagePart(ctx, modifier) : void 0, ctx.type);
			}
			case 7: return resolveValue$1(node, type);
			case 8: return resolveValue$1(node, type);
			default: throw new Error(`unhandled node on format message part: ${type}`);
		}
	}
	var defaultOnCacheKey = (message) => message;
	var compileCache = create();
	function baseCompile(message, options = {}) {
		let detectError = false;
		const onError = options.onError || defaultOnError;
		options.onError = (err) => {
			detectError = true;
			onError(err);
		};
		return {
			...baseCompile$1(message, options),
			detectError
		};
	}
	var compileToFunction = /* @__NO_SIDE_EFFECTS__ */ (message, context) => {
		if (!isString$1(message)) throw createCoreError(CoreErrorCodes.NOT_SUPPORT_NON_STRING_MESSAGE);
		{
			isBoolean(context.warnHtmlMessage) && context.warnHtmlMessage;
			const cacheKey = (context.onCacheKey || defaultOnCacheKey)(message);
			const cached = compileCache[cacheKey];
			if (cached) return cached;
			const { code, detectError } = baseCompile(message, context);
			const msg = new Function(`return ${code}`)();
			return !detectError ? compileCache[cacheKey] = msg : msg;
		}
	};
	function compile(message, context) {
		if (__INTLIFY_JIT_COMPILATION__ && !__INTLIFY_DROP_MESSAGE_COMPILER__ && isString$1(message)) {
			isBoolean(context.warnHtmlMessage) && context.warnHtmlMessage;
			const cacheKey = (context.onCacheKey || defaultOnCacheKey)(message);
			const cached = compileCache[cacheKey];
			if (cached) return cached;
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
				if (cached) return cached;
				return compileCache[cacheKey] = format(message);
			} else return format(message);
		}
	}
	var NOOP_MESSAGE_FUNCTION = () => "";
	var isMessageFunction = (val) => isFunction(val);
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
		let format = formatScope;
		let cacheBaseKey = key;
		if (!resolvedMessage && !(isString$1(format) || isMessageAST(format) || isMessageFunction(format))) {
			if (enableDefaultMsg) {
				format = defaultMsgOrKey;
				cacheBaseKey = format;
			}
		}
		if (!resolvedMessage && (!(isString$1(format) || isMessageAST(format) || isMessageFunction(format)) || !isString$1(targetLocale))) return unresolving ? -1 : key;
		let occurred = false;
		const onError = () => {
			occurred = true;
		};
		const msg = !isMessageFunction(format) ? compileMessageFormat(context, key, targetLocale, format, cacheBaseKey, onError) : format;
		if (occurred) return format;
		const messaged = evaluateMessage(context, msg, createMessageContext(getMessageContextOptions(context, targetLocale, message, options)));
		let ret = postTranslation ? postTranslation(messaged, key) : messaged;
		if (escapeParameter && isString$1(ret)) ret = sanitizeTranslatedHtml(ret);
		return ret;
	}
	function escapeParams(options) {
		if (isArray(options.list)) options.list = options.list.map((item) => isString$1(item) ? escapeHtml(item) : item);
		else if (isObject$1(options.named)) Object.keys(options.named).forEach((key) => {
			if (isString$1(options.named[key])) options.named[key] = escapeHtml(options.named[key]);
		});
	}
	function resolveMessageFormat(context, key, locale, fallbackLocale, fallbackWarn, missingWarn) {
		const { messages, onWarn, messageResolver: resolveValue, localeFallbacker } = context;
		const locales = localeFallbacker(context, fallbackLocale, locale);
		let message = create();
		let targetLocale;
		let format = null;
		const type = "translate";
		for (let i = 0; i < locales.length; i++) {
			targetLocale = locales[i];
			message = messages[targetLocale] || create();
			if ((format = resolveValue(message, key)) === null) format = message[key];
			if (isString$1(format) || isMessageAST(format) || isMessageFunction(format)) break;
			if (!isImplicitFallback(targetLocale, locales)) {
				const missingRet = handleMissing(context, key, targetLocale, missingWarn, type);
				if (missingRet !== key) format = missingRet;
			}
		}
		return [
			format,
			targetLocale,
			message
		];
	}
	function compileMessageFormat(context, key, targetLocale, format, cacheBaseKey, onError) {
		const { messageCompiler, warnHtmlMessage } = context;
		if (isMessageFunction(format)) {
			const msg = format;
			msg.locale = msg.locale || targetLocale;
			msg.key = msg.key || key;
			return msg;
		}
		if (messageCompiler == null) {
			const msg = (() => format);
			msg.locale = targetLocale;
			msg.key = key;
			return msg;
		}
		const msg = messageCompiler(format, getCompileContext(context, targetLocale, cacheBaseKey, format, warnHtmlMessage, onError));
		msg.locale = targetLocale;
		msg.key = key;
		msg.source = format;
		return msg;
	}
	function evaluateMessage(context, msg, msgCtx) {
		return msg(msgCtx);
	}
	/** @internal */
	function parseTranslateArgs(...args) {
		const [arg1, arg2, arg3] = args;
		const options = create();
		if (!isString$1(arg1) && !isNumber(arg1) && !isMessageFunction(arg1) && !isMessageAST(arg1)) throw createCoreError(CoreErrorCodes.INVALID_ARGUMENT);
		const key = isNumber(arg1) ? String(arg1) : isMessageFunction(arg1) ? arg1 : arg1;
		if (isNumber(arg2)) options.plural = arg2;
		else if (isString$1(arg2)) options.default = arg2;
		else if (isPlainObject(arg2) && !isEmptyObject(arg2)) options.named = arg2;
		else if (isArray(arg2)) options.list = arg2;
		if (isNumber(arg3)) options.plural = arg3;
		else if (isString$1(arg3)) options.default = arg3;
		else if (isPlainObject(arg3)) assign$1(options, arg3);
		return [key, options];
	}
	function getCompileContext(context, locale, key, source, warnHtmlMessage, onError) {
		return {
			locale,
			key,
			warnHtmlMessage,
			onError: (err) => {
				onError && onError(err);
				throw err;
			},
			onCacheKey: (source) => generateFormatCacheKey(locale, key, source)
		};
	}
	function getMessageContextOptions(context, locale, message, options) {
		const { modifiers, pluralRules, messageResolver: resolveValue, fallbackLocale, fallbackWarn, missingWarn, fallbackContext } = context;
		const resolveMessage = (key) => {
			let val = resolveValue(message, key);
			if (val == null && fallbackContext) {
				const [, , message] = resolveMessageFormat(fallbackContext, key, locale, fallbackLocale, fallbackWarn, missingWarn);
				val = resolveValue(message, key);
			}
			if (isString$1(val) || isMessageAST(val)) {
				let occurred = false;
				const onError = () => {
					occurred = true;
				};
				const msg = compileMessageFormat(context, key, locale, val, key, onError);
				return !occurred ? msg : NOOP_MESSAGE_FUNCTION;
			} else if (isMessageFunction(val)) return val;
			else return NOOP_MESSAGE_FUNCTION;
		};
		const ctxOptions = {
			locale,
			modifiers,
			pluralRules,
			messages: resolveMessage
		};
		if (context.processor) ctxOptions.processor = context.processor;
		if (options.list) ctxOptions.list = options.list;
		if (options.named) ctxOptions.named = options.named;
		if (isNumber(options.plural)) ctxOptions.pluralIndex = options.plural;
		return ctxOptions;
	}
	var intlDefined = typeof Intl !== "undefined";
	intlDefined && Intl.DateTimeFormat, intlDefined && Intl.NumberFormat;
	function datetime(context, ...args) {
		const { datetimeFormats, unresolving, fallbackLocale, onWarn, localeFallbacker } = context;
		const { __datetimeFormatters } = context;
		const [key, value, options, overrides] = parseDateTimeArgs(...args);
		const missingWarn = isBoolean(options.missingWarn) ? options.missingWarn : context.missingWarn;
		isBoolean(options.fallbackWarn) ? options.fallbackWarn : context.fallbackWarn;
		const part = !!options.part;
		const locale = getLocale(context, options);
		const locales = localeFallbacker(context, fallbackLocale, locale);
		if (!isString$1(key) || key === "") return new Intl.DateTimeFormat(locale, overrides).format(value);
		let datetimeFormat = {};
		let targetLocale;
		let format = null;
		const type = "datetime format";
		for (let i = 0; i < locales.length; i++) {
			targetLocale = locales[i];
			datetimeFormat = datetimeFormats[targetLocale] || {};
			format = datetimeFormat[key];
			if (isPlainObject(format)) break;
			handleMissing(context, key, targetLocale, missingWarn, type);
		}
		if (!isPlainObject(format) || !isString$1(targetLocale)) return unresolving ? -1 : key;
		let id = `${targetLocale}__${key}`;
		if (!isEmptyObject(overrides)) id = `${id}__${JSON.stringify(overrides)}`;
		let formatter = __datetimeFormatters.get(id);
		if (!formatter) {
			formatter = new Intl.DateTimeFormat(targetLocale, assign$1({}, format, overrides));
			__datetimeFormatters.set(id, formatter);
		}
		return !part ? formatter.format(value) : formatter.formatToParts(value);
	}
	/** @internal */
	var DATETIME_FORMAT_OPTIONS_KEYS = [
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
	/** @internal */
	function parseDateTimeArgs(...args) {
		const [arg1, arg2, arg3, arg4] = args;
		const options = create();
		let overrides = create();
		let value;
		if (isString$1(arg1)) {
			const matches = arg1.match(/(\d{4}-\d{2}-\d{2})(T|\s)?(.*)/);
			if (!matches) throw createCoreError(CoreErrorCodes.INVALID_ISO_DATE_ARGUMENT);
			const dateTime = matches[3] ? matches[3].trim().startsWith("T") ? `${matches[1].trim()}${matches[3].trim()}` : `${matches[1].trim()}T${matches[3].trim()}` : matches[1].trim();
			value = new Date(dateTime);
			try {
				value.toISOString();
			} catch (e) {
				throw createCoreError(CoreErrorCodes.INVALID_ISO_DATE_ARGUMENT);
			}
		} else if (isDate(arg1)) {
			if (isNaN(arg1.getTime())) throw createCoreError(CoreErrorCodes.INVALID_DATE_ARGUMENT);
			value = arg1;
		} else if (isNumber(arg1)) value = arg1;
		else throw createCoreError(CoreErrorCodes.INVALID_ARGUMENT);
		if (isString$1(arg2)) options.key = arg2;
		else if (isPlainObject(arg2)) Object.keys(arg2).forEach((key) => {
			if (DATETIME_FORMAT_OPTIONS_KEYS.includes(key)) overrides[key] = arg2[key];
			else options[key] = arg2[key];
		});
		if (isString$1(arg3)) options.locale = arg3;
		else if (isPlainObject(arg3)) overrides = arg3;
		if (isPlainObject(arg4)) overrides = arg4;
		return [
			options.key || "",
			value,
			options,
			overrides
		];
	}
	/** @internal */
	function clearDateTimeFormat(ctx, locale, format) {
		const context = ctx;
		for (const key in format) {
			const id = `${locale}__${key}`;
			if (!context.__datetimeFormatters.has(id)) continue;
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
		const locales = localeFallbacker(context, fallbackLocale, locale);
		if (!isString$1(key) || key === "") return new Intl.NumberFormat(locale, overrides).format(value);
		let numberFormat = {};
		let targetLocale;
		let format = null;
		const type = "number format";
		for (let i = 0; i < locales.length; i++) {
			targetLocale = locales[i];
			numberFormat = numberFormats[targetLocale] || {};
			format = numberFormat[key];
			if (isPlainObject(format)) break;
			handleMissing(context, key, targetLocale, missingWarn, type);
		}
		if (!isPlainObject(format) || !isString$1(targetLocale)) return unresolving ? -1 : key;
		let id = `${targetLocale}__${key}`;
		if (!isEmptyObject(overrides)) id = `${id}__${JSON.stringify(overrides)}`;
		let formatter = __numberFormatters.get(id);
		if (!formatter) {
			formatter = new Intl.NumberFormat(targetLocale, assign$1({}, format, overrides));
			__numberFormatters.set(id, formatter);
		}
		return !part ? formatter.format(value) : formatter.formatToParts(value);
	}
	/** @internal */
	var NUMBER_FORMAT_OPTIONS_KEYS = [
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
	/** @internal */
	function parseNumberArgs(...args) {
		const [arg1, arg2, arg3, arg4] = args;
		const options = create();
		let overrides = create();
		if (!isNumber(arg1)) throw createCoreError(CoreErrorCodes.INVALID_ARGUMENT);
		const value = arg1;
		if (isString$1(arg2)) options.key = arg2;
		else if (isPlainObject(arg2)) Object.keys(arg2).forEach((key) => {
			if (NUMBER_FORMAT_OPTIONS_KEYS.includes(key)) overrides[key] = arg2[key];
			else options[key] = arg2[key];
		});
		if (isString$1(arg3)) options.locale = arg3;
		else if (isPlainObject(arg3)) overrides = arg3;
		if (isPlainObject(arg4)) overrides = arg4;
		return [
			options.key || "",
			value,
			options,
			overrides
		];
	}
	/** @internal */
	function clearNumberFormat(ctx, locale, format) {
		const context = ctx;
		for (const key in format) {
			const id = `${locale}__${key}`;
			if (!context.__numberFormatters.has(id)) continue;
			context.__numberFormatters.delete(id);
		}
	}
	initFeatureFlags$1();
	//#endregion
	//#region node_modules/vue-i18n/dist/vue-i18n.mjs
	/*!
	* vue-i18n v9.14.5
	* (c) 2025 kazuya kawaguchi
	* Released under the MIT License.
	*/
	/**
	* Vue I18n Version
	*
	* @remarks
	* Semver format. Same format as the package.json `version` field.
	*
	* @VueI18nGeneral
	*/
	var VERSION = "9.14.5";
	/**
	* This is only called in esm-bundler builds.
	* istanbul-ignore-next
	*/
	function initFeatureFlags() {
		if (typeof __INTLIFY_JIT_COMPILATION__ !== "boolean") getGlobalThis().__INTLIFY_JIT_COMPILATION__ = false;
		if (typeof __INTLIFY_DROP_MESSAGE_COMPILER__ !== "boolean") getGlobalThis().__INTLIFY_DROP_MESSAGE_COMPILER__ = false;
	}
	var code$1 = CoreWarnCodes.__EXTEND_POINT__;
	var inc$1 = incrementer(code$1);
	var I18nWarnCodes = {
		FALLBACK_TO_ROOT: code$1,
		NOT_SUPPORTED_PRESERVE: inc$1(),
		NOT_SUPPORTED_FORMATTER: inc$1(),
		NOT_SUPPORTED_PRESERVE_DIRECTIVE: inc$1(),
		NOT_SUPPORTED_GET_CHOICE_INDEX: inc$1(),
		COMPONENT_NAME_LEGACY_COMPATIBLE: inc$1(),
		NOT_FOUND_PARENT_SCOPE: inc$1(),
		IGNORE_OBJ_FLATTEN: inc$1(),
		NOTICE_DROP_ALLOW_COMPOSITION: inc$1(),
		NOTICE_DROP_TRANSLATE_EXIST_COMPATIBLE_FLAG: inc$1()
	};
	I18nWarnCodes.FALLBACK_TO_ROOT, I18nWarnCodes.NOT_SUPPORTED_PRESERVE, I18nWarnCodes.NOT_SUPPORTED_FORMATTER, I18nWarnCodes.NOT_SUPPORTED_PRESERVE_DIRECTIVE, I18nWarnCodes.NOT_SUPPORTED_GET_CHOICE_INDEX, I18nWarnCodes.COMPONENT_NAME_LEGACY_COMPATIBLE, I18nWarnCodes.NOT_FOUND_PARENT_SCOPE, I18nWarnCodes.IGNORE_OBJ_FLATTEN, I18nWarnCodes.NOTICE_DROP_ALLOW_COMPOSITION, I18nWarnCodes.NOTICE_DROP_TRANSLATE_EXIST_COMPATIBLE_FLAG;
	var code = CoreErrorCodes.__EXTEND_POINT__;
	var inc = incrementer(code);
	var I18nErrorCodes = {
		UNEXPECTED_RETURN_TYPE: code,
		INVALID_ARGUMENT: inc(),
		MUST_BE_CALL_SETUP_TOP: inc(),
		NOT_INSTALLED: inc(),
		NOT_AVAILABLE_IN_LEGACY_MODE: inc(),
		REQUIRED_VALUE: inc(),
		INVALID_VALUE: inc(),
		CANNOT_SETUP_VUE_DEVTOOLS_PLUGIN: inc(),
		NOT_INSTALLED_WITH_PROVIDE: inc(),
		UNEXPECTED_ERROR: inc(),
		NOT_COMPATIBLE_LEGACY_VUE_I18N: inc(),
		BRIDGE_SUPPORT_VUE_2_ONLY: inc(),
		MUST_DEFINE_I18N_OPTION_IN_ALLOW_COMPOSITION: inc(),
		NOT_AVAILABLE_COMPOSITION_IN_LEGACY: inc(),
		__EXTEND_POINT__: inc()
	};
	function createI18nError(code, ...args) {
		return createCompileError(code, null, void 0);
	}
	I18nErrorCodes.UNEXPECTED_RETURN_TYPE, I18nErrorCodes.INVALID_ARGUMENT, I18nErrorCodes.MUST_BE_CALL_SETUP_TOP, I18nErrorCodes.NOT_INSTALLED, I18nErrorCodes.UNEXPECTED_ERROR, I18nErrorCodes.NOT_AVAILABLE_IN_LEGACY_MODE, I18nErrorCodes.REQUIRED_VALUE, I18nErrorCodes.INVALID_VALUE, I18nErrorCodes.CANNOT_SETUP_VUE_DEVTOOLS_PLUGIN, I18nErrorCodes.NOT_INSTALLED_WITH_PROVIDE, I18nErrorCodes.NOT_COMPATIBLE_LEGACY_VUE_I18N, I18nErrorCodes.BRIDGE_SUPPORT_VUE_2_ONLY, I18nErrorCodes.MUST_DEFINE_I18N_OPTION_IN_ALLOW_COMPOSITION, I18nErrorCodes.NOT_AVAILABLE_COMPOSITION_IN_LEGACY;
	var TranslateVNodeSymbol = /* #__PURE__*/ makeSymbol("__translateVNode");
	var DatetimePartsSymbol = /* #__PURE__*/ makeSymbol("__datetimeParts");
	var NumberPartsSymbol = /* #__PURE__*/ makeSymbol("__numberParts");
	var SetPluralRulesSymbol = makeSymbol("__setPluralRules");
	makeSymbol("__intlifyMeta");
	var InejctWithOptionSymbol = /* #__PURE__*/ makeSymbol("__injectWithOption");
	var DisposeSymbol = /* #__PURE__*/ makeSymbol("__dispose");
	/**
	* Transform flat json in obj to normal json in obj
	*/
	function handleFlatJson(obj) {
		if (!isObject$1(obj)) return obj;
		if (isMessageAST(obj)) return obj;
		for (const key in obj) {
			if (!hasOwn(obj, key)) continue;
			if (!key.includes(".")) {
				if (isObject$1(obj[key])) handleFlatJson(obj[key]);
			} else {
				const subKeys = key.split(".");
				const lastIndex = subKeys.length - 1;
				let currentObj = obj;
				let hasStringValue = false;
				for (let i = 0; i < lastIndex; i++) {
					if (subKeys[i] === "__proto__") throw new Error(`unsafe key: ${subKeys[i]}`);
					if (!(subKeys[i] in currentObj)) currentObj[subKeys[i]] = create();
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
					} else if (!AST_NODE_PROPS_KEYS.includes(subKeys[lastIndex])) delete obj[key];
				}
				if (!isMessageAST(currentObj)) {
					const target = currentObj[subKeys[lastIndex]];
					if (isObject$1(target)) handleFlatJson(target);
				}
			}
		}
		return obj;
	}
	function getLocaleMessages(locale, options) {
		const { messages, __i18n, messageResolver, flatJson } = options;
		const ret = isPlainObject(messages) ? messages : isArray(__i18n) ? create() : { [locale]: create() };
		if (isArray(__i18n)) __i18n.forEach((custom) => {
			if ("locale" in custom && "resource" in custom) {
				const { locale, resource } = custom;
				if (locale) {
					ret[locale] = ret[locale] || create();
					deepCopy(resource, ret[locale]);
				} else deepCopy(resource, ret);
			} else isString$1(custom) && deepCopy(JSON.parse(custom), ret);
		});
		if (messageResolver == null && flatJson) {
			for (const key in ret) if (hasOwn(ret, key)) handleFlatJson(ret[key]);
		}
		return ret;
	}
	function getComponentOptions(instance) {
		return instance.type;
	}
	function adjustI18nResources(gl, options, componentOptions) {
		let messages = isObject$1(options.messages) ? options.messages : create();
		if ("__i18nGlobal" in componentOptions) messages = getLocaleMessages(gl.locale.value, {
			messages,
			__i18n: componentOptions.__i18nGlobal
		});
		const locales = Object.keys(messages);
		if (locales.length) locales.forEach((locale) => {
			gl.mergeLocaleMessage(locale, messages[locale]);
		});
		if (isObject$1(options.datetimeFormats)) {
			const locales = Object.keys(options.datetimeFormats);
			if (locales.length) locales.forEach((locale) => {
				gl.mergeDateTimeFormat(locale, options.datetimeFormats[locale]);
			});
		}
		if (isObject$1(options.numberFormats)) {
			const locales = Object.keys(options.numberFormats);
			if (locales.length) locales.forEach((locale) => {
				gl.mergeNumberFormat(locale, options.numberFormats[locale]);
			});
		}
	}
	function createTextNode(key) {
		return (0, vue.createVNode)(vue.Text, null, key, 0);
	}
	var NOOP_RETURN_ARRAY = () => [];
	var NOOP_RETURN_FALSE = () => false;
	var composerID = 0;
	function defineCoreMissingHandler(missing) {
		return ((ctx, locale, key, type) => {
			return missing(locale, key, (0, vue.getCurrentInstance)() || void 0, type);
		});
	}
	/**
	* Create composer interface factory
	*
	* @internal
	*/
	function createComposer(options = {}, VueI18nLegacy) {
		const { __root, __injectWithOption } = options;
		const _isGlobal = __root === void 0;
		const flatJson = options.flatJson;
		const _ref = inBrowser ? vue.ref : vue.shallowRef;
		const translateExistCompatible = !!options.translateExistCompatible;
		let _inheritLocale = isBoolean(options.inheritLocale) ? options.inheritLocale : true;
		const _locale = _ref(__root && _inheritLocale ? __root.locale.value : isString$1(options.locale) ? options.locale : DEFAULT_LOCALE);
		const _fallbackLocale = _ref(__root && _inheritLocale ? __root.fallbackLocale.value : isString$1(options.fallbackLocale) || isArray(options.fallbackLocale) || isPlainObject(options.fallbackLocale) || options.fallbackLocale === false ? options.fallbackLocale : _locale.value);
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
			ctxOptions.datetimeFormats = _datetimeFormats.value;
			ctxOptions.numberFormats = _numberFormats.value;
			ctxOptions.__datetimeFormatters = isPlainObject(_context) ? _context.__datetimeFormatters : void 0;
			ctxOptions.__numberFormatters = isPlainObject(_context) ? _context.__numberFormatters : void 0;
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
		const locale = (0, vue.computed)({
			get: () => _locale.value,
			set: (val) => {
				_locale.value = val;
				_context.locale = _locale.value;
			}
		});
		const fallbackLocale = (0, vue.computed)({
			get: () => _fallbackLocale.value,
			set: (val) => {
				_fallbackLocale.value = val;
				_context.fallbackLocale = _fallbackLocale.value;
				updateFallbackLocale(_context, _locale.value, val);
			}
		});
		const messages = (0, vue.computed)(() => _messages.value);
		const datetimeFormats = /* #__PURE__*/ (0, vue.computed)(() => _datetimeFormats.value);
		const numberFormats = /* #__PURE__*/ (0, vue.computed)(() => _numberFormats.value);
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
			if (handler !== null) _runtimeMissing = defineCoreMissingHandler(handler);
			_missing = handler;
			_context.missing = _runtimeMissing;
		}
		const wrapWithDeps = (fn, argumentParser, warnType, fallbackSuccess, fallbackFail, successCondition) => {
			trackReactivityValues();
			let ret;
			try {
				if (!_isGlobal) _context.fallbackContext = __root ? getFallbackContext() : void 0;
				ret = fn(_context);
			} finally {
				if (!_isGlobal) _context.fallbackContext = void 0;
			}
			if (warnType !== "translate exists" && isNumber(ret) && ret === -1 || warnType === "translate exists" && !ret) {
				const [key, arg2] = argumentParser();
				return __root && _fallbackRoot ? fallbackSuccess(__root) : fallbackFail(key);
			} else if (successCondition(ret)) return ret;
			else
 /* istanbul ignore next */
			throw createI18nError(I18nErrorCodes.UNEXPECTED_RETURN_TYPE);
		};
		function t(...args) {
			return wrapWithDeps((context) => Reflect.apply(translate, null, [context, ...args]), () => parseTranslateArgs(...args), "translate", (root) => Reflect.apply(root.t, root, [...args]), (key) => key, (val) => isString$1(val));
		}
		function rt(...args) {
			const [arg1, arg2, arg3] = args;
			if (arg3 && !isObject$1(arg3)) throw createI18nError(I18nErrorCodes.INVALID_ARGUMENT);
			return t(...[
				arg1,
				arg2,
				assign$1({ resolvedMessage: true }, arg3 || {})
			]);
		}
		function d(...args) {
			return wrapWithDeps((context) => Reflect.apply(datetime, null, [context, ...args]), () => parseDateTimeArgs(...args), "datetime format", (root) => Reflect.apply(root.d, root, [...args]), () => "", (val) => isString$1(val));
		}
		function n(...args) {
			return wrapWithDeps((context) => Reflect.apply(number, null, [context, ...args]), () => parseNumberArgs(...args), "number format", (root) => Reflect.apply(root.n, root, [...args]), () => "", (val) => isString$1(val));
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
			return wrapWithDeps((context) => {
				let ret;
				const _context = context;
				try {
					_context.processor = processor;
					ret = Reflect.apply(translate, null, [_context, ...args]);
				} finally {
					_context.processor = null;
				}
				return ret;
			}, () => parseTranslateArgs(...args), "translate", (root) => root[TranslateVNodeSymbol](...args), (key) => [createTextNode(key)], (val) => isArray(val));
		}
		function numberParts(...args) {
			return wrapWithDeps((context) => Reflect.apply(number, null, [context, ...args]), () => parseNumberArgs(...args), "number format", (root) => root[NumberPartsSymbol](...args), NOOP_RETURN_ARRAY, (val) => isString$1(val) || isArray(val));
		}
		function datetimeParts(...args) {
			return wrapWithDeps((context) => Reflect.apply(datetime, null, [context, ...args]), () => parseDateTimeArgs(...args), "datetime format", (root) => root[DatetimePartsSymbol](...args), NOOP_RETURN_ARRAY, (val) => isString$1(val) || isArray(val));
		}
		function setPluralRules(rules) {
			_pluralRules = rules;
			_context.pluralRules = _pluralRules;
		}
		function te(key, locale) {
			return wrapWithDeps(() => {
				if (!key) return false;
				const message = getLocaleMessage(isString$1(locale) ? locale : _locale.value);
				const resolved = _context.messageResolver(message, key);
				return !translateExistCompatible ? isMessageAST(resolved) || isMessageFunction(resolved) || isString$1(resolved) : resolved != null;
			}, () => [key], "translate exists", (root) => {
				return Reflect.apply(root.te, root, [key, locale]);
			}, NOOP_RETURN_FALSE, (val) => isBoolean(val));
		}
		function resolveMessages(key) {
			let messages = null;
			const locales = fallbackWithLocaleChain(_context, _fallbackLocale.value, _locale.value);
			for (let i = 0; i < locales.length; i++) {
				const targetLocaleMessages = _messages.value[locales[i]] || {};
				const messageValue = _context.messageResolver(targetLocaleMessages, key);
				if (messageValue != null) {
					messages = messageValue;
					break;
				}
			}
			return messages;
		}
		function tm(key) {
			const messages = resolveMessages(key);
			return messages != null ? messages : __root ? __root.tm(key) || {} : {};
		}
		function getLocaleMessage(locale) {
			return _messages.value[locale] || {};
		}
		function setLocaleMessage(locale, message) {
			if (flatJson) {
				const _message = { [locale]: message };
				for (const key in _message) if (hasOwn(_message, key)) handleFlatJson(_message[key]);
				message = _message[locale];
			}
			_messages.value[locale] = message;
			_context.messages = _messages.value;
		}
		function mergeLocaleMessage(locale, message) {
			_messages.value[locale] = _messages.value[locale] || {};
			const _message = { [locale]: message };
			if (flatJson) {
				for (const key in _message) if (hasOwn(_message, key)) handleFlatJson(_message[key]);
			}
			message = _message[locale];
			deepCopy(message, _messages.value[locale]);
			_context.messages = _messages.value;
		}
		function getDateTimeFormat(locale) {
			return _datetimeFormats.value[locale] || {};
		}
		function setDateTimeFormat(locale, format) {
			_datetimeFormats.value[locale] = format;
			_context.datetimeFormats = _datetimeFormats.value;
			clearDateTimeFormat(_context, locale, format);
		}
		function mergeDateTimeFormat(locale, format) {
			_datetimeFormats.value[locale] = assign$1(_datetimeFormats.value[locale] || {}, format);
			_context.datetimeFormats = _datetimeFormats.value;
			clearDateTimeFormat(_context, locale, format);
		}
		function getNumberFormat(locale) {
			return _numberFormats.value[locale] || {};
		}
		function setNumberFormat(locale, format) {
			_numberFormats.value[locale] = format;
			_context.numberFormats = _numberFormats.value;
			clearNumberFormat(_context, locale, format);
		}
		function mergeNumberFormat(locale, format) {
			_numberFormats.value[locale] = assign$1(_numberFormats.value[locale] || {}, format);
			_context.numberFormats = _numberFormats.value;
			clearNumberFormat(_context, locale, format);
		}
		composerID++;
		if (__root && inBrowser) {
			(0, vue.watch)(__root.locale, (val) => {
				if (_inheritLocale) {
					_locale.value = val;
					_context.locale = val;
					updateFallbackLocale(_context, _locale.value, _fallbackLocale.value);
				}
			});
			(0, vue.watch)(__root.fallbackLocale, (val) => {
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
			t,
			getLocaleMessage,
			setLocaleMessage,
			mergeLocaleMessage,
			getPostTranslationHandler,
			setPostTranslationHandler,
			getMissingHandler,
			setMissingHandler,
			[SetPluralRulesSymbol]: setPluralRules
		};
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
		return composer;
	}
	var baseFormatProps = {
		tag: { type: [String, Object] },
		locale: { type: String },
		scope: {
			type: String,
			validator: (val) => val === "parent" || val === "global",
			default: "parent"
		},
		i18n: { type: Object }
	};
	function getInterpolateArg({ slots }, keys) {
		if (keys.length === 1 && keys[0] === "default") return (slots.default ? slots.default() : []).reduce((slot, current) => {
			return [...slot, ...current.type === vue.Fragment ? current.children : [current]];
		}, []);
		else return keys.reduce((arg, key) => {
			const slot = slots[key];
			if (slot) arg[key] = slot();
			return arg;
		}, create());
	}
	function getFragmentableTag(tag) {
		return vue.Fragment;
	}
	/**
	* export the public type for h/tsx inference
	* also to avoid inline import() in generated d.ts files
	*/
	/**
	* Translation Component
	*
	* @remarks
	* See the following items for property about details
	*
	* @VueI18nSee [TranslationProps](component#translationprops)
	* @VueI18nSee [BaseFormatProps](component#baseformatprops)
	* @VueI18nSee [Component Interpolation](../guide/advanced/component)
	*
	* @example
	* ```html
	* <div id="app">
	*   <!-- ... -->
	*   <i18n keypath="term" tag="label" for="tos">
	*     <a :href="url" target="_blank">{{ $t('tos') }}</a>
	*   </i18n>
	*   <!-- ... -->
	* </div>
	* ```
	* ```js
	* import { createApp } from 'vue'
	* import { createI18n } from 'vue-i18n'
	*
	* const messages = {
	*   en: {
	*     tos: 'Term of Service',
	*     term: 'I accept xxx {0}.'
	*   },
	*   ja: {
	*     tos: '利用規約',
	*     term: '私は xxx の{0}に同意します。'
	*   }
	* }
	*
	* const i18n = createI18n({
	*   locale: 'en',
	*   messages
	* })
	*
	* const app = createApp({
	*   data: {
	*     url: '/term'
	*   }
	* }).use(i18n).mount('#app')
	* ```
	*
	* @VueI18nComponent
	*/
	var Translation = /* @__PURE__ */ (0, vue.defineComponent)({
		name: "i18n-t",
		props: assign$1({
			keypath: {
				type: String,
				required: true
			},
			plural: {
				type: [Number, String],
				validator: (val) => isNumber(val) || !isNaN(val)
			}
		}, baseFormatProps),
		setup(props, context) {
			const { slots, attrs } = context;
			const i18n = props.i18n || useI18n({
				useScope: props.scope,
				__useComponent: true
			});
			return () => {
				const keys = Object.keys(slots).filter((key) => key !== "_");
				const options = create();
				if (props.locale) options.locale = props.locale;
				if (props.plural !== void 0) options.plural = isString$1(props.plural) ? +props.plural : props.plural;
				const arg = getInterpolateArg(context, keys);
				const children = i18n[TranslateVNodeSymbol](props.keypath, arg, options);
				const assignedAttrs = assign$1(create(), attrs);
				const tag = isString$1(props.tag) || isObject$1(props.tag) ? props.tag : getFragmentableTag();
				return (0, vue.h)(tag, assignedAttrs, children);
			};
		}
	});
	function isVNode(target) {
		return isArray(target) && !isString$1(target[0]);
	}
	function renderFormatter(props, context, slotKeys, partFormatter) {
		const { slots, attrs } = context;
		return () => {
			const options = { part: true };
			let overrides = create();
			if (props.locale) options.locale = props.locale;
			if (isString$1(props.format)) options.key = props.format;
			else if (isObject$1(props.format)) {
				if (isString$1(props.format.key)) options.key = props.format.key;
				overrides = Object.keys(props.format).reduce((options, prop) => {
					return slotKeys.includes(prop) ? assign$1(create(), options, { [prop]: props.format[prop] }) : options;
				}, create());
			}
			const parts = partFormatter(...[
				props.value,
				options,
				overrides
			]);
			let children = [options.key];
			if (isArray(parts)) children = parts.map((part, index) => {
				const slot = slots[part.type];
				const node = slot ? slot({
					[part.type]: part.value,
					index,
					parts
				}) : [part.value];
				if (isVNode(node)) node[0].key = `${part.type}-${index}`;
				return node;
			});
			else if (isString$1(parts)) children = [parts];
			const assignedAttrs = assign$1(create(), attrs);
			const tag = isString$1(props.tag) || isObject$1(props.tag) ? props.tag : getFragmentableTag();
			return (0, vue.h)(tag, assignedAttrs, children);
		};
	}
	/**
	* export the public type for h/tsx inference
	* also to avoid inline import() in generated d.ts files
	*/
	/**
	* Number Format Component
	*
	* @remarks
	* See the following items for property about details
	*
	* @VueI18nSee [FormattableProps](component#formattableprops)
	* @VueI18nSee [BaseFormatProps](component#baseformatprops)
	* @VueI18nSee [Custom Formatting](../guide/essentials/number#custom-formatting)
	*
	* @VueI18nDanger
	* Not supported IE, due to no support `Intl.NumberFormat#formatToParts` in [IE](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/formatToParts)
	*
	* If you want to use it, you need to use [polyfill](https://github.com/formatjs/formatjs/tree/main/packages/intl-numberformat)
	*
	* @VueI18nComponent
	*/
	var NumberFormat = /* @__PURE__ */ (0, vue.defineComponent)({
		name: "i18n-n",
		props: assign$1({
			value: {
				type: Number,
				required: true
			},
			format: { type: [String, Object] }
		}, baseFormatProps),
		setup(props, context) {
			const i18n = props.i18n || useI18n({
				useScope: props.scope,
				__useComponent: true
			});
			return renderFormatter(props, context, NUMBER_FORMAT_OPTIONS_KEYS, (...args) => i18n[NumberPartsSymbol](...args));
		}
	});
	/**
	* Datetime Format Component
	*
	* @remarks
	* See the following items for property about details
	*
	* @VueI18nSee [FormattableProps](component#formattableprops)
	* @VueI18nSee [BaseFormatProps](component#baseformatprops)
	* @VueI18nSee [Custom Formatting](../guide/essentials/datetime#custom-formatting)
	*
	* @VueI18nDanger
	* Not supported IE, due to no support `Intl.DateTimeFormat#formatToParts` in [IE](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/formatToParts)
	*
	* If you want to use it, you need to use [polyfill](https://github.com/formatjs/formatjs/tree/main/packages/intl-datetimeformat)
	*
	* @VueI18nComponent
	*/
	var DatetimeFormat = /* @__PURE__ */ (0, vue.defineComponent)({
		name: "i18n-d",
		props: assign$1({
			value: {
				type: [Number, Date],
				required: true
			},
			format: { type: [String, Object] }
		}, baseFormatProps),
		setup(props, context) {
			const i18n = props.i18n || useI18n({
				useScope: props.scope,
				__useComponent: true
			});
			return renderFormatter(props, context, DATETIME_FORMAT_OPTIONS_KEYS, (...args) => i18n[DatetimePartsSymbol](...args));
		}
	});
	function getComposer$2(i18n, instance) {
		const i18nInternal = i18n;
		if (i18n.mode === "composition") return i18nInternal.__getInstance(instance) || i18n.global;
		else {
			const vueI18n = i18nInternal.__getInstance(instance);
			return vueI18n != null ? vueI18n.__composer : i18n.global.__composer;
		}
	}
	function vTDirective(i18n) {
		const _process = (binding) => {
			const { instance, modifiers, value } = binding;
			/* istanbul ignore if */
			if (!instance || !instance.$) throw createI18nError(I18nErrorCodes.UNEXPECTED_ERROR);
			const composer = getComposer$2(i18n, instance.$);
			const parsedValue = parseValue(value);
			return [Reflect.apply(composer.t, composer, [...makeParams(parsedValue)]), composer];
		};
		const register = (el, binding) => {
			const [textContent, composer] = _process(binding);
			if (inBrowser && i18n.global === composer) el.__i18nWatcher = (0, vue.watch)(composer.locale, () => {
				binding.instance && binding.instance.$forceUpdate();
			});
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
				el.textContent = Reflect.apply(composer.t, composer, [...makeParams(parsedValue)]);
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
		if (isString$1(value)) return { path: value };
		else if (isPlainObject(value)) {
			if (!("path" in value)) throw createI18nError(I18nErrorCodes.REQUIRED_VALUE, "path");
			return value;
		} else throw createI18nError(I18nErrorCodes.INVALID_VALUE);
	}
	function makeParams(value) {
		const { path, locale, args, choice, plural } = value;
		const options = {};
		const named = args || {};
		if (isString$1(locale)) options.locale = locale;
		if (isNumber(choice)) options.plural = choice;
		if (isNumber(plural)) options.plural = plural;
		return [
			path,
			named,
			options
		];
	}
	function apply(app, i18n, ...options) {
		const pluginOptions = isPlainObject(options[0]) ? options[0] : {};
		const useI18nComponentName = !!pluginOptions.useI18nComponentName;
		if (isBoolean(pluginOptions.globalInstall) ? pluginOptions.globalInstall : true) {
			[!useI18nComponentName ? Translation.name : "i18n", "I18nT"].forEach((name) => app.component(name, Translation));
			[NumberFormat.name, "I18nN"].forEach((name) => app.component(name, NumberFormat));
			[DatetimeFormat.name, "I18nD"].forEach((name) => app.component(name, DatetimeFormat));
		}
		app.directive("t", vTDirective(i18n));
	}
	/**
	* Injection key for {@link useI18n}
	*
	* @remarks
	* The global injection key for I18n instances with `useI18n`. this injection key is used in Web Components.
	* Specify the i18n instance created by {@link createI18n} together with `provide` function.
	*
	* @VueI18nGeneral
	*/
	var I18nInjectionKey = /* #__PURE__*/ makeSymbol("global-vue-i18n");
	function createI18n(options = {}, VueI18nLegacy) {
		const __legacyMode = false;
		const __globalInjection = isBoolean(options.globalInjection) ? options.globalInjection : true;
		const __allowComposition = true;
		const __instances = /* @__PURE__ */ new Map();
		const [globalScope, __global] = createGlobal(options, __legacyMode);
		const symbol = /* #__PURE__*/ makeSymbol("");
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
				get mode() {
					return "composition";
				},
				get allowComposition() {
					return __allowComposition;
				},
				async install(app, ...options) {
					app.__VUE_I18N_SYMBOL__ = symbol;
					app.provide(app.__VUE_I18N_SYMBOL__, i18n);
					if (isPlainObject(options[0])) {
						const opts = options[0];
						i18n.__composerExtend = opts.__composerExtend;
						i18n.__vueI18nExtend = opts.__vueI18nExtend;
					}
					let globalReleaseHandler = null;
					if (__globalInjection) globalReleaseHandler = injectGlobalFields(app, i18n.global);
					apply(app, i18n, ...options);
					const unmountApp = app.unmount;
					app.unmount = () => {
						globalReleaseHandler && globalReleaseHandler();
						i18n.dispose();
						unmountApp();
					};
				},
				get global() {
					return __global;
				},
				dispose() {
					globalScope.stop();
				},
				__instances,
				__getInstance,
				__setInstance,
				__deleteInstance
			};
			return i18n;
		}
	}
	function useI18n(options = {}) {
		const instance = (0, vue.getCurrentInstance)();
		if (instance == null) throw createI18nError(I18nErrorCodes.MUST_BE_CALL_SETUP_TOP);
		if (!instance.isCE && instance.appContext.app != null && !instance.appContext.app.__VUE_I18N_SYMBOL__) throw createI18nError(I18nErrorCodes.NOT_INSTALLED);
		const i18n = getI18nInstance(instance);
		const gl = getGlobalComposer(i18n);
		const componentOptions = getComponentOptions(instance);
		const scope = getScope(options, componentOptions);
		if (scope === "global") {
			adjustI18nResources(gl, options, componentOptions);
			return gl;
		}
		if (scope === "parent") {
			let composer = getComposer(i18n, instance, options.__useComponent);
			if (composer == null) composer = gl;
			return composer;
		}
		const i18nInternal = i18n;
		let composer = i18nInternal.__getInstance(instance);
		if (composer == null) {
			const composerOptions = assign$1({}, options);
			if ("__i18n" in componentOptions) composerOptions.__i18n = componentOptions.__i18n;
			if (gl) composerOptions.__root = gl;
			composer = createComposer(composerOptions);
			if (i18nInternal.__composerExtend) composer[DisposeSymbol] = i18nInternal.__composerExtend(composer);
			setupLifeCycle(i18nInternal, instance, composer);
			i18nInternal.__setInstance(instance, composer);
		}
		return composer;
	}
	function createGlobal(options, legacyMode, VueI18nLegacy) {
		const scope = (0, vue.effectScope)();
		{
			const obj = scope.run(() => createComposer(options));
			if (obj == null) throw createI18nError(I18nErrorCodes.UNEXPECTED_ERROR);
			return [scope, obj];
		}
	}
	function getI18nInstance(instance) {
		{
			const i18n = (0, vue.inject)(!instance.isCE ? instance.appContext.app.__VUE_I18N_SYMBOL__ : I18nInjectionKey);
			/* istanbul ignore if */
			if (!i18n) throw createI18nError(!instance.isCE ? I18nErrorCodes.UNEXPECTED_ERROR : I18nErrorCodes.NOT_INSTALLED_WITH_PROVIDE);
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
			if (i18n.mode === "composition") composer = i18nInternal.__getInstance(current);
			if (composer != null) break;
			if (root === current) break;
			current = current.parent;
		}
		return composer;
	}
	function getParentComponentInstance(target, useComponent = false) {
		if (target == null) return null;
		return !useComponent ? target.parent : target.vnode.ctx || target.parent;
	}
	function setupLifeCycle(i18n, target, composer) {
		(0, vue.onMounted)(() => {}, target);
		(0, vue.onUnmounted)(() => {
			const _composer = composer;
			i18n.__deleteInstance(target);
			const dispose = _composer[DisposeSymbol];
			if (dispose) {
				dispose();
				delete _composer[DisposeSymbol];
			}
		}, target);
	}
	var globalExportProps = [
		"locale",
		"fallbackLocale",
		"availableLocales"
	];
	var globalExportMethods = [
		"t",
		"rt",
		"d",
		"n",
		"tm",
		"te"
	];
	function injectGlobalFields(app, composer) {
		const i18n = Object.create(null);
		globalExportProps.forEach((prop) => {
			const desc = Object.getOwnPropertyDescriptor(composer, prop);
			if (!desc) throw createI18nError(I18nErrorCodes.UNEXPECTED_ERROR);
			const wrap = (0, vue.isRef)(desc.value) ? {
				get() {
					return desc.value.value;
				},
				set(val) {
					desc.value.value = val;
				}
			} : { get() {
				return desc.get && desc.get();
			} };
			Object.defineProperty(i18n, prop, wrap);
		});
		app.config.globalProperties.$i18n = i18n;
		globalExportMethods.forEach((method) => {
			const desc = Object.getOwnPropertyDescriptor(composer, method);
			if (!desc || !desc.value) throw createI18nError(I18nErrorCodes.UNEXPECTED_ERROR);
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
	initFeatureFlags();
	if (__INTLIFY_JIT_COMPILATION__) registerMessageCompiler(compile);
	else registerMessageCompiler(compileToFunction);
	registerMessageResolver(resolveValue);
	registerLocaleFallbacker(fallbackWithLocaleChain);
	//#endregion
	//#region view/components/atoms/DocumentScore.vue
	var DocumentScore_default = /* @__PURE__ */ (0, vue.defineComponent)({
		__name: "DocumentScore",
		props: {
			score: {
				type: [Number, String],
				default: null
			},
			thresholds: {
				type: Object,
				required: true
			}
		},
		setup(__props) {
			const props = __props;
			const { locale } = useI18n();
			const formattedScore = (0, vue.computed)(() => {
				const value = props.score;
				return null !== value && void 0 !== value && Number.isFinite(Number(value)) ? new Intl.NumberFormat(locale.value.replace("_", "-"), { maximumFractionDigits: 1 }).format(Number(value)) + "%" : "";
			});
			const scoreColor = (0, vue.computed)(() => {
				const value = Number(props.score);
				if (value >= props.thresholds.critical) return "text-danger-500";
				if (value >= props.thresholds.warning) return "text-warning-600";
				return "text-success-600";
			});
			return (_ctx, _cache) => {
				return (0, vue.openBlock)(), (0, vue.createElementBlock)("span", { class: (0, vue.normalizeClass)(["compilatio-document-score whitespace-nowrap text-center text-xl font-bold", scoreColor.value]) }, (0, vue.toDisplayString)(formattedScore.value), 3);
			};
		}
	});
	//#endregion
	//#region view/components/atoms/DocumentButton.vue?vue&type=script&setup=true&lang.ts
	var _hoisted_1$13 = [
		"title",
		"aria-label",
		"disabled"
	];
	//#endregion
	//#region view/components/atoms/DocumentButton.vue
	var DocumentButton_default = /* @__PURE__ */ (0, vue.defineComponent)({
		__name: "DocumentButton",
		props: {
			label: {
				type: String,
				required: true
			},
			disabled: {
				type: Boolean,
				default: false
			}
		},
		emits: ["click"],
		setup(__props) {
			return (_ctx, _cache) => {
				return (0, vue.openBlock)(), (0, vue.createElementBlock)("button", {
					type: "button",
					class: "pkp_button compilatio-icon-button compilatio-focus disabled:cursor-default disabled:opacity-65",
					title: __props.label,
					"aria-label": __props.label,
					disabled: __props.disabled,
					onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("click", $event))
				}, [(0, vue.renderSlot)(_ctx.$slots, "default")], 8, _hoisted_1$13);
			};
		}
	});
	//#endregion
	//#region node_modules/@elastisafe/components/dist/brightspace-D1T12s-p.js
	var brightspace_D1T12s_p_exports = /* @__PURE__ */ __exportAll({ default: () => e$206 });
	var e$206;
	var init_brightspace_D1T12s_p = __esmMin((() => {
		e$206 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\" fill=\"currentColor\">\n    <path d=\"M 448.98 575.999 L 552 575.999 L 511.46 463.514 L 409.77 463.514 L 448.98 575.999 Z\" />\n    <path d=\"M 228.82 463.514 L 128.54 463.514 L 88 575.999 L 189.66 575.999 L 228.82 463.514 Z\" />\n    <path\n        d=\"M 415.87 383.702 C 435.45 371.643 452.82 356.302 467.19 338.351 L 368.24 64.001 L 271.73 64.001 L 174.35 334.194 C 190.02 356.771 209.98 376.038 233.1 390.894 C 215.76 351.362 228.95 297.905 250.73 261.533 C 256 285.518 266.62 296.409 278.95 304.639 C 270.65 293.707 264.13 277.162 266.5 253.51 C 270.4 214.934 308.74 184.672 344.71 172.202 C 330.73 205.457 349.4 221.502 357.41 245.944 C 371.27 236.559 386.29 229.014 402.09 223.497 C 376.2 285.31 435.29 301.563 421.01 367.408 C 419.8 372.985 418.08 378.439 415.87 383.702 Z\"\n    />\n</svg>\n";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/cairn-C-cR0Aiu.js
	var cairn_C_cR0Aiu_exports = /* @__PURE__ */ __exportAll({ default: () => e$205 });
	var e$205;
	var init_cairn_C_cR0Aiu = __esmMin((() => {
		e$205 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\" fill=\"currentColor\">\n    <path\n        fill=\"#AE9A64\"\n        d=\"M 319.529 153.034 L 246.521 226.962 L 319.529 300.995 L 392.536 226.962 L 319.529 153.034 Z\"\n    />\n    <path\n        fill=\"#89CCCA\"\n        d=\"M 228.216 393.458 L 155.208 319.53 L 228.216 245.497 L 301.225 319.53 L 228.216 393.458 Z\"\n    />\n    <path\n        fill=\"#B66668\"\n        d=\"M 410.736 393.458 L 337.729 319.53 L 410.736 245.497 L 483.746 319.53 L 410.736 393.458 Z\"\n    />\n    <path fill=\"#A4CD84\" d=\"M 137.008 485.92 L 64 411.992 L 137.008 337.958 L 210.016 411.992 L 137.008 485.92 Z\" />\n    <path\n        fill=\"#D1C900\"\n        d=\"M 320.261 485.711 L 247.253 411.678 L 320.261 337.645 L 393.269 411.678 L 320.261 485.711 Z\"\n    />\n    <path fill=\"#C2C6CA\" d=\"M 502.991 486.966 L 429.984 413.04 L 502.991 339.006 L 576 413.04 L 502.991 486.966 Z\" />\n</svg>\n";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/canvas-C6SWyRCE.js
	var canvas_C6SWyRCE_exports = /* @__PURE__ */ __exportAll({ default: () => e$204 });
	var e$204;
	var init_canvas_C6SWyRCE = __esmMin((() => {
		e$204 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\" fill=\"currentColor\">\n    <path\n        d=\"M 138.285 319.437 C 138.285 282.114 110.455 250.58 73.285 246.075 C 60.905 294.199 60.905 344.675 73.285 392.799 C 110.455 388.293 138.285 356.922 138.285 319.437 Z\"\n    />\n    <path\n        d=\"M 181.235 296.27 C 168.365 296.27 157.915 306.566 157.915 319.437 C 157.915 332.307 168.205 342.764 181.075 342.764 C 193.945 342.764 204.405 332.468 204.405 319.597 L 204.405 319.437 C 204.565 306.727 194.115 296.27 181.235 296.27 Z\"\n    />\n    <path\n        d=\"M 501.715 319.437 C 501.715 356.761 529.545 388.293 566.715 392.799 C 579.095 344.675 579.095 294.199 566.715 246.075 C 529.545 250.741 501.715 282.115 501.715 319.437 Z\"\n    />\n    <path\n        d=\"M 458.595 296.27 C 445.725 296.109 435.265 306.405 435.105 319.276 C 434.945 332.146 445.245 342.603 458.115 342.764 C 470.985 342.925 481.445 332.629 481.605 319.758 L 481.605 319.437 C 481.605 306.727 471.305 296.429 458.595 296.27 Z\"\n    />\n    <path\n        d=\"M 319.435 501.714 C 282.115 501.714 250.575 529.546 246.075 566.709 C 294.195 579.097 344.675 579.097 392.795 566.709 C 388.295 529.546 356.755 501.714 319.435 501.714 Z\"\n    />\n    <path\n        d=\"M 319.435 435.592 C 306.565 435.592 296.105 445.888 296.105 458.759 C 296.105 471.629 306.405 482.086 319.275 482.086 C 332.145 482.086 342.605 471.79 342.605 458.919 L 342.605 458.759 C 342.605 446.051 332.305 435.592 319.435 435.592 Z\"\n    />\n    <path\n        d=\"M 319.435 138.286 C 356.755 138.286 388.295 110.454 392.795 73.292 C 344.675 60.903 294.195 60.903 246.075 73.292 C 250.575 110.454 282.115 138.286 319.435 138.286 Z\"\n    />\n    <path\n        d=\"M 319.435 158.074 C 306.565 158.074 296.265 168.531 296.265 181.241 C 296.265 194.111 306.725 204.407 319.435 204.407 C 332.145 204.407 342.605 193.95 342.605 181.241 C 342.605 168.531 332.305 158.074 319.435 158.074 Z\"\n    />\n    <path\n        d=\"M 448.145 448.14 C 421.755 474.525 419.185 516.354 442.185 545.795 C 484.985 520.529 520.685 484.829 545.955 442.027 C 516.515 419.343 474.525 421.917 448.145 448.141 L 448.145 448.14 Z\"\n    />\n    <path\n        d=\"M 401.325 401.324 C 392.315 410.334 392.315 425.134 401.325 434.144 C 410.335 443.154 425.135 443.154 434.145 434.144 C 443.155 425.134 443.155 410.334 434.145 401.324 C 425.135 392.315 410.335 392.315 401.325 401.324 Z\"\n    />\n    <path\n        d=\"M 191.215 191.215 C 217.595 164.829 220.175 123.002 197.325 93.561 C 154.525 118.827 118.825 154.528 93.565 197.33 C 122.845 220.175 164.835 217.6 191.215 191.216 L 191.215 191.215 Z\"\n    />\n    <path\n        d=\"M 205.215 205.212 C 196.205 214.222 196.205 229.022 205.215 238.032 C 214.225 247.041 229.025 247.041 238.035 238.032 C 247.035 229.022 247.035 214.222 238.035 205.212 C 229.025 196.202 214.225 196.202 205.215 205.212 Z\"\n    />\n    <path\n        d=\"M 447.975 190.894 C 474.365 217.278 516.355 219.85 545.635 197.007 C 520.365 154.205 484.665 118.505 441.865 93.239 C 419.015 122.68 421.595 164.509 447.975 190.894 Z\"\n    />\n    <path\n        d=\"M 433.985 237.87 C 442.995 228.863 443.155 214.06 433.985 205.051 C 424.975 196.041 410.175 195.881 401.165 205.051 C 392.155 214.061 391.995 228.863 401.165 237.871 C 410.175 246.88 424.975 246.88 433.985 237.871 L 433.985 237.87 Z\"\n    />\n    <path\n        d=\"M 191.055 447.98 C 164.675 421.595 122.845 419.021 93.405 441.866 C 118.655 484.66 154.215 520.376 197.005 545.634 C 219.855 516.193 217.435 474.364 191.055 447.98 Z\"\n    />\n    <path\n        d=\"M 205.045 401.003 C 196.045 410.012 196.045 424.813 205.045 433.823 C 214.055 442.831 228.865 442.831 237.875 433.823 C 246.885 424.813 246.885 410.012 237.875 401.003 C 228.865 391.993 214.225 391.993 205.045 401.003 Z\"\n    />\n</svg>\n";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/file-lines-slash-regular-C9fu7Nra.js
	var file_lines_slash_regular_C9fu7Nra_exports = /* @__PURE__ */ __exportAll({ default: () => e$203 });
	var e$203;
	var init_file_lines_slash_regular_C9fu7Nra = __esmMin((() => {
		e$203 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><path fill=\"currentColor\" d=\"M39 39.2C29.7 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L511.9 478.2L511.9 250.5C511.9 233.5 505.2 217.2 493.2 205.2L370.7 82.7C358.7 70.7 342.5 64 325.5 64L192 64C166.6 64 144.6 78.9 134.2 100.4L134.2 100.4L72.9 39.1C63.5 29.7 48.3 29.7 39 39.1zM176 128C176 119.2 183.2 112 192 112L304 112L304 200C304 239.8 336.2 272 376 272L464 272L464 430.2L464 430.2L400.3 366.5C409.5 363.1 416 354.3 416 344C416 330.7 405.3 320 392 320L353.8 320L176 142.2L176 128zM352 200L352 131.9L444.1 224L376 224C362.7 224 352 213.3 352 200zM128 229.8L128 512C128 547.3 156.7 576 192 576L448 576C455.8 576 463.3 574.6 470.2 572L426.2 528L192 528C183.2 528 176 520.8 176 512L176 277.8L128 229.8zM228.4 330.2C225.7 334.1 224 338.9 224 344C224 357.3 234.7 368 248 368L266.2 368L228.4 330.2zM248 416C234.7 416 224 426.7 224 440C224 453.3 234.7 464 248 464L362.2 464L314.2 416L248 416z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/file-lines-slash-solid-BEKYfBqQ.js
	var file_lines_slash_solid_BEKYfBqQ_exports = /* @__PURE__ */ __exportAll({ default: () => e$202 });
	var e$202;
	var init_file_lines_slash_solid_BEKYfBqQ = __esmMin((() => {
		e$202 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><path fill=\"currentColor\" d=\"M39 39.2C29.7 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L511.9 478.2L511.9 234.6C511.9 217.6 505.2 201.3 493.2 189.3L386.8 82.7C374.8 70.7 358.5 64 341.5 64L192 64C166.6 64 144.6 78.9 134.2 100.4L134.2 100.4L72.9 39.1C63.5 29.7 48.3 29.7 39 39.1zM336 216L336 122.5L453.5 240L360 240C346.7 240 336 229.3 336 216zM128 229.8L128 512C128 547.3 156.7 576 192 576L448 576C455.8 576 463.3 574.6 470.2 572L362.2 464L248 464C234.7 464 224 453.3 224 440C224 426.7 234.7 416 248 416L314.2 416L266.2 368L248 368C234.7 368 224 357.3 224 344C224 338.8 225.6 334.1 228.4 330.2L128 229.8zM400.3 366.5L353.8 320L392 320C405.3 320 416 330.7 416 344C416 354.4 409.5 363.2 400.3 366.5L400.3 366.5z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/memo-magnifying-glass-regular-CXfS_3Wr.js
	var memo_magnifying_glass_regular_CXfS_3Wr_exports = /* @__PURE__ */ __exportAll({ default: () => e$201 });
	var e$201;
	var init_memo_magnifying_glass_regular_CXfS_3Wr = __esmMin((() => {
		e$201 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><path fill=\"currentColor\" d=\"M192 64C156.7 64 128 92.7 128 128L128 512C128 547.3 156.7 576 192 576L341.3 576C323.5 563.1 308.4 546.8 296.8 528L191.9 528L191.9 528C183.1 528 175.9 520.8 175.9 512L175.9 128C175.9 119.2 183.1 112 191.9 112L447.9 112C456.7 112 463.9 119.2 463.9 128L463.9 273.7C480.8 276.1 497 281.1 511.9 288.2L512 128C512 92.7 483.3 64 448 64L192 64zM248 192C234.7 192 224 202.7 224 216C224 229.3 234.7 240 248 240L392 240C405.3 240 416 229.3 416 216C416 202.7 405.3 192 392 192L248 192zM248 288C234.7 288 224 298.7 224 312C224 325.3 234.7 336 248 336L308.1 336C324.1 315.7 344.8 299.2 368.4 288L248 288zM440 320.1C373.7 320.1 320 373.8 320 440.1C320 506.4 373.7 560.1 440 560.1C464.5 560.1 487.2 552.7 506.2 540.2L567 601C576.4 610.4 591.6 610.4 600.9 601C610.3 591.6 610.3 576.4 600.9 567.1L540 506.2C552.6 487.2 559.9 464.5 559.9 440.1C559.9 373.8 506.2 320.1 439.9 320.1zM368 440.1C368 400.3 400.2 368.1 440 368.1C479.8 368.1 512 400.3 512 440.1C512 479.9 479.8 512.1 440 512.1C400.2 512.1 368 479.9 368 440.1zM248 384C234.7 384 224 394.7 224 408C224 421.3 234.7 432 248 432L272.2 432C273 415.2 276.2 399.1 281.6 384L248 384z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/moodle-CkAlgpvF.js
	var moodle_CkAlgpvF_exports = /* @__PURE__ */ __exportAll({ default: () => e$200 });
	var e$200;
	var init_moodle_CkAlgpvF = __esmMin((() => {
		e$200 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\" fill=\"currentColor\">\n    <path\n        d=\"M 494.141 492.918 L 494.141 333.783 C 494.141 300.523 480.261 283.883 452.491 283.883 C 424.721 283.873 410.831 300.513 410.821 333.783 L 410.821 492.918 L 328.961 492.918 L 328.961 333.783 C 328.961 300.523 315.321 283.883 288.041 283.883 C 260.261 283.883 246.378 300.513 246.388 333.783 L 246.388 492.918 L 164.537 492.918 L 164.537 324.393 C 164.537 289.683 176.718 263.393 201.078 245.563 C 222.518 229.653 251.508 221.683 288.051 221.673 C 325.091 221.673 352.381 231.083 369.901 249.893 C 385.001 231.083 412.531 221.673 452.501 221.673 C 489.041 221.673 518.031 229.643 539.461 245.563 C 563.821 263.383 576.001 289.663 576.001 324.393 L 576.001 492.918 L 494.141 492.918 Z\"\n        opacity=\".8\"\n    />\n    <path\n        d=\"M 323.521 209.423 L 404.831 150.673 L 403.781 147.083 C 257.111 164.843 190.358 177.463 63.999 249.943 L 65.168 253.243 L 75.218 253.333 C 74.286 263.353 72.686 288.093 74.745 325.293 C 60.721 365.453 74.386 392.74 87.217 422.4 C 89.242 391.504 89.031 357.723 79.454 324.083 C 77.462 287.143 79.108 262.833 80.007 253.383 L 163.778 254.173 C 163.778 254.173 163.225 279.233 166.258 302.783 C 241.118 328.813 316.401 302.693 356.341 238.523 C 345.271 226.213 323.521 209.423 323.521 209.423 Z\"\n    />\n</svg>\n";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/receipt-slash-solid-B0X8G5yD.js
	var receipt_slash_solid_B0X8G5yD_exports = /* @__PURE__ */ __exportAll({ default: () => e$199 });
	var e$199;
	var init_receipt_slash_solid_B0X8G5yD = __esmMin((() => {
		e$199 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><path fill=\"currentColor\" d=\"M39 39.2C29.7 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L511.9 478.2L511.9 88C511.9 78.6 506.4 70.1 497.9 66.2C489.4 62.3 479.5 63.7 472.4 69.8L432 104.4L391.6 69.8C382.6 62.1 369.4 62.1 360.4 69.8L320 104.4L279.6 69.8C270.7 62.1 257.4 62.1 248.4 69.8L208 104.4L167.6 69.8C160.5 63.7 150.5 62.3 142 66.2C133.5 70.1 128 78.6 128 88L128 94.2L73 39.2C63.6 29.8 48.4 29.8 39.1 39.2zM281.8 248L233.8 200L408 200C421.3 200 432 210.7 432 224C432 237.3 421.3 248 408 248L281.8 248zM128 229.8L128 552C128 561.4 133.5 569.9 142 573.8C150.5 577.7 160.5 576.3 167.6 570.2L208 535.6L248.4 570.2C257.3 577.9 270.6 577.9 279.6 570.2L320 535.6L360.4 570.2C369.4 577.9 382.6 577.9 391.6 570.2L432 535.6L444.4 546.2L444.4 546.2L338.2 440L232 440C218.7 440 208 429.3 208 416C208 402.7 218.7 392 232 392L290.2 392L242.2 344L232 344C218.7 344 208 333.3 208 320C208 317 208.6 314.1 209.6 311.4L128 229.8zM377.8 344L329.8 296L408 296C421.3 296 432 306.7 432 320C432 333.3 421.3 344 408 344L377.8 344z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/rewording-slash-BFjU_Tzk.js
	var rewording_slash_BFjU_Tzk_exports = /* @__PURE__ */ __exportAll({ default: () => e$198 });
	var e$198;
	var init_rewording_slash_BFjU_Tzk = __esmMin((() => {
		e$198 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><path fill=\"currentColor\" d=\"M449.2 214C466.6 214.2 484.3 221.3 497 233.2L554.8 288.6C568 301.5 575.8 320 576 338.4L576 507C575.9 517 573.6 526.9 569.6 535.7L601 567.1L602.7 568.9C610.4 578.3 609.8 592.2 601 601C596.3 605.7 590.1 608 584 608C578.6 608 573.3 606.2 568.9 602.7L567 601L39 72.9L37.3 71.1C29.7 61.7 30.2 47.8 39 39C43.7 34.3 49.9 32 56 32C61.4 32 66.7 33.8 71.1 37.3L72.9 39L125.9 92L144.6 92C155.9 75.1 175.1 64 197 64L267 64C288.9 64 308.1 75.1 319.4 92L344 92C374.9 92 400 117.1 400 148L400 176L358 176L358 148C358 140.3 351.7 134 344 134L329.6 134C326.1 165.5 299.4 190 267 190L223.9 190L285.7 251.8C289 245.2 293.3 239.3 298.3 234.3C300.3 232.3 302.5 230.4 304.8 228.6C316.4 219.7 331.5 214.2 347.1 214.1zM534 338.4C534.2 330.7 531.5 324.1 525.8 318.9L468 263.5C462.8 258.3 456.6 255.8 449.3 256L347 256C339.2 255.8 333.1 258.7 327.9 263.9C322.7 269.1 319.8 275.2 320 283L320 286.1L376.4 342.5C390.6 332.1 408.1 326 427 326C450.7 326 472.2 335.6 487.7 351.1L491.5 354.7L491.5 336.8C491.5 330.9 496.3 326.1 502.2 326.1C508.1 326.1 512.9 330.9 512.9 336.8L512.9 379.8C512.9 385.7 508.1 390.5 502.2 390.5L459.2 390.5C453.3 390.5 448.5 385.7 448.5 379.8C448.5 373.9 453.3 369.1 459.2 369.1L475.3 369.1L472.7 366.7C472.6 366.6 472.6 366.6 472.5 366.5C460.8 354.8 444.7 347.6 426.9 347.6C413.9 347.6 401.8 351.4 391.7 358L481 447.2C486 439.5 489.4 430.7 490.8 421.2L490.8 421.2C491.6 415.4 497.1 411.3 503 412.1C508.9 412.9 512.9 418.4 512.1 424.3C510.1 438.5 504.6 451.6 496.5 462.7L534 500.1zM347 576C328.3 575.8 310.4 568 298.2 555.8C286 543.6 278.2 525.7 278 507L278 379.3L320 421.3L320 507C319.8 514.8 322.7 520.9 327.9 526.1C333.1 531.3 339.2 534.2 347 534L432.7 534L474.7 576zM106 456C106 463.7 112.3 470 120 470L240 470L240 512L120 512C89.1 512 64 486.9 64 456L64 165.3L106 207.3zM288 127C288 115.4 278.6 106 267 106L197 106C185.4 106 176 115.4 176 127C176 138.6 185.4 148 197 148L267 148C278.6 148 288 138.6 288 127zM366.3 472.9L362.7 469.5L362.8 486.8C362.9 492.7 358.1 497.6 352.2 497.6C346.3 497.6 341.4 492.9 341.4 487L341.1 444.3C341.1 443.6 341.1 443 341.3 442.4L386.7 488C379.2 484 372.3 478.9 366.3 472.9z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/rewording-mEvB1WjS.js
	var rewording_mEvB1WjS_exports = /* @__PURE__ */ __exportAll({ default: () => e$197 });
	var e$197;
	var init_rewording_mEvB1WjS = __esmMin((() => {
		e$197 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><path fill=\"currentColor\" d=\"M347 214L449.2 214C466.6 214.2 484.3 221.3 497 233.2L554.8 288.6C568 301.5 575.8 320 576 338.4L576 507C575.8 525.7 568 543.6 555.8 555.8C543.6 568 525.7 575.8 507 576L347 576C328.3 575.8 310.4 568 298.2 555.8C286 543.6 278.2 525.7 278 507L278 283C278.2 264.3 286 246.4 298.2 234.2C300.2 232.2 302.4 230.3 304.7 228.5C316.3 219.6 331.4 214.1 347 214zM197 190C164.5 190 137.8 165.5 134.3 134L120 134C112.3 134 106 140.3 106 148L106 456C106 463.7 112.3 470 120 470L240 470L240 512L120 512C89.1 512 64 486.9 64 456L64 148C64 117.1 89.1 92 120 92L144.6 92C155.9 75.1 175.1 64 197 64L267 64C288.9 64 308.1 75.1 319.4 92L344 92C374.9 92 400 117.1 400 148L400 176L358 176L358 148C358 140.3 351.7 134 344 134L329.6 134C326.1 165.5 299.4 190 267 190L197 190zM288 127C288 115.4 278.6 106 267 106L197 106C191.4 106 186.1 108.2 182.1 112.1C178.1 116 176 121.4 176 127C176 138.6 185.4 148 197 148L267 148C278.6 148 288 138.6 288 127zM363.1 402.8C362.3 408.6 356.8 412.7 350.9 411.9C345 411.1 341 405.6 341.8 399.7C347.7 358 383.6 326 426.9 326C450.6 326 472.1 335.6 487.6 351.1L491.4 354.7L491.4 336.8C491.4 333.9 492.5 331.2 494.5 329.2C496.5 327.2 499.3 326.1 502.1 326.1C504.9 326.1 507.7 327.2 509.7 329.2C511.7 331.2 512.8 334 512.8 336.8L512.8 379.8C512.8 382.7 511.7 385.4 509.7 387.4C507.7 389.4 504.9 390.5 502.1 390.5L459.1 390.5C456.2 390.5 453.5 389.4 451.5 387.4C449.5 385.4 448.4 382.6 448.4 379.8C448.4 377 449.5 374.2 451.5 372.2C453.5 370.2 456.3 369.1 459.1 369.1L475.2 369.1L472.6 366.7L472.4 366.5C460.7 354.8 444.6 347.6 426.8 347.6C394.3 347.6 367.4 371.6 363 402.9L363 402.9zM427 498C403.3 498 381.9 488.4 366.3 472.9L362.7 469.5L362.8 486.8C362.9 492.7 358.1 497.6 352.2 497.6C346.3 497.6 341.4 492.9 341.4 487L341.1 444.3C341.1 441.4 342.2 438.7 344.2 436.6C346.2 434.5 349 433.4 351.8 433.4L394.8 433.4C397.7 433.4 400.4 434.5 402.4 436.5C404.4 438.5 405.5 441.3 405.5 444.1C405.5 446.9 404.4 449.7 402.4 451.7C400.4 453.7 397.6 454.8 394.8 454.8L378.7 454.8L381.3 457.2L381.5 457.4C393.2 469.1 409.3 476.3 427.1 476.3C459.6 476.3 486.5 452.3 490.9 421C491.7 415.2 497.2 411.1 503.1 411.9C509 412.7 513 418.2 512.2 424.1C506.1 465.9 470.3 498 427 498zM526.1 526.1C531.3 520.9 534.2 514.8 534 507L534 338.4C534.2 330.7 531.5 324.1 525.8 318.9L468 263.5C462.8 258.3 456.6 255.8 449.3 256L347 256C339.2 255.8 333.1 258.7 327.9 263.9C322.7 269.1 319.8 275.2 320 283L320 507C319.8 514.8 322.7 520.9 327.9 526.1C333.1 531.3 339.2 534.2 347 534L507 534C514.8 534.2 520.9 531.3 526.1 526.1z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/same-meaning-slash-CK84JT0F.js
	var same_meaning_slash_CK84JT0F_exports = /* @__PURE__ */ __exportAll({ default: () => e$196 });
	var e$196;
	var init_same_meaning_slash_CK84JT0F = __esmMin((() => {
		e$196 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><path fill=\"currentColor\" d=\"M108.7 29.1L110.5 30.8L157.5 77.8C168.3 69.2 182.1 64 197 64L267 64C288.9 64 308.1 75.1 319.4 92L344 92C374.9 92 400 117.1 400 148L400 176L358 176L358 148C358 140.3 351.7 134 344 134L329.6 134C326.2 164.6 300.9 188.7 269.6 189.9L306.7 227C318 219 332.2 214.1 346.9 214L449.1 214C466.5 214.2 484.2 221.3 496.9 233.2L554.7 288.6C567.9 301.5 575.7 320 575.9 338.4L575.9 496.3L638.4 558.8L640.1 560.6C647.8 570 647.2 583.9 638.4 592.7C633.7 597.4 627.5 599.7 621.4 599.7C616 599.7 610.7 597.9 606.3 594.4L604.5 592.7L76.5 64.7L74.8 62.9C67.2 53.5 67.7 39.6 76.5 30.8C81.2 26.1 87.4 23.8 93.5 23.8C98.9 23.8 104.2 25.6 108.6 29.1zM106 456C106 463.7 112.3 470 120 470L240 470L240 512L120 512C89.1 512 64 486.9 64 456L64 148C64 139.4 66 131.2 69.5 123.9L106 160.4zM288 127C288 115.4 278.6 106 267 106L197 106C193.7 106 190.6 106.8 187.8 108.1L227.7 148L267 148C278.6 148 288 138.6 288 127zM165 341.1L176.5 315.2L202.6 257L224.1 278.5L194.6 344.3L269.4 344.3L252.7 307L320 374.3L320 506.9C319.8 514.7 322.7 520.8 327.9 526C333.1 531.2 339.2 534.1 347 533.9L479.6 533.9L520.2 574.5C515.9 575.4 511.5 575.9 507 575.9L347 575.9C328.3 575.7 310.4 567.9 298.2 555.7C286 543.5 278.2 525.6 278 506.9L278 372.6L181.9 372.6L164.5 411.5C161.3 418.7 152.9 421.8 145.7 418.7C138.5 415.6 135.4 407.2 138.6 400zM534 338.4C534.2 330.7 531.5 324.1 525.8 318.9L468 263.5C462.8 258.3 456.6 255.8 449.3 256L347 256C343.4 255.9 340.2 256.5 337.3 257.6L411.4 331.7L411.4 330C411.4 326.9 412.6 323.9 414.8 321.7C417 319.5 420 318.3 423.1 318.3L423.1 318.3C426.2 318.3 429.2 319.5 431.4 321.7C433.6 323.9 434.8 326.9 434.8 330L434.8 355.2L437 357.4L501.3 357.4C504.4 357.4 507.4 358.6 509.6 360.8C511.8 363 513 366 513 369.1C513 372.2 511.8 375.2 509.6 377.4C507.4 379.6 504.4 380.8 501.3 380.8L493.4 380.8L485.3 399.6C484.7 401 484.1 402.4 483.4 403.8L534 454.3zM467.8 380.7L460.4 380.7L465.6 385.9zM401.8 489.8L373.8 504.5C368.1 507.5 361 505.3 358 499.6C355 493.9 357.2 486.8 362.9 483.8L390.9 469C396 466.3 401 463.3 405.8 460.1L422.7 477C416 481.7 409.1 486 401.9 489.7z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/same-meaning-Cr-kKY80.js
	var same_meaning_Cr_kKY80_exports = /* @__PURE__ */ __exportAll({ default: () => e$195 });
	var e$195;
	var init_same_meaning_Cr_kKY80 = __esmMin((() => {
		e$195 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><path fill=\"currentColor\" d=\"M197 190C164.5 190 137.8 165.5 134.3 134L120 134C112.3 134 106 140.3 106 148L106 456C106 463.7 112.3 470 120 470L240 470L240 512L120 512C89.1 512 64 486.9 64 456L64 148C64 117.1 89.1 92 120 92L144.6 92C155.9 75.1 175.1 64 197 64L267 64C288.9 64 308.1 75.1 319.4 92L344 92C374.9 92 400 117.1 400 148L400 176L358 176L358 148C358 140.3 351.7 134 344 134L329.6 134C326.1 165.5 299.4 190 267 190zM288 127C288 115.4 278.6 106 267 106L197 106C185.4 106 176 115.4 176 127C176 138.6 185.4 148 197 148L267 148C278.6 148 288 138.6 288 127zM165 341.1L176.5 315.2L219 220.4C221.3 215.3 226.3 212 231.9 212C237.5 212 242.6 215.3 244.9 220.4L278 294.2L278 283C278.2 264.3 286 246.4 298.2 234.2L298.2 234.2C310.4 222 328.3 214.2 347 214L449.2 214C466.6 214.2 484.3 221.3 497 233.2L554.8 288.6C568 301.5 575.8 320 576 338.4L576 507C575.8 525.7 568 543.6 555.8 555.8C543.6 568 525.7 575.8 507 576L347 576C328.3 575.8 310.4 568 298.2 555.8C286 543.6 278.2 525.7 278 507L278 372.7L181.9 372.7L164.5 411.6C161.3 418.8 152.9 421.9 145.7 418.8C138.5 415.7 135.4 407.2 138.6 400zM269.4 344.3L232 260.9L194.6 344.3zM526.1 526.1C531.3 520.9 534.2 514.8 534 507L534 338.4C534.2 330.7 531.5 324.1 525.8 318.9L468 263.5C462.8 258.3 456.6 255.8 449.3 256L347 256C339.2 255.8 333.1 258.7 327.9 263.9C322.7 269.1 319.8 275.2 320 283L320 507C319.8 514.8 322.7 520.9 327.9 526.1C333.1 531.3 339.2 534.2 347 534L507 534C514.8 534.2 520.9 531.3 526.1 526.1zM423.1 318.2C429.6 318.2 434.8 323.4 434.8 329.9L434.8 357.3L501.2 357.3C507.7 357.3 512.9 362.5 512.9 369C512.9 375.5 507.7 380.7 501.2 380.7L493.3 380.7L485.2 399.5C476.1 420.8 463.1 439.9 447.1 456.2C453.9 460.7 461.1 464.7 468.6 468.1C468.6 468.1 498.4 481.7 498.4 481.7C504.4 484.4 506.9 491.4 504.2 497.3C501.5 503.1 494.7 505.6 488.9 503.1C488.9 503.1 459 489.4 459 489.4C448.5 484.6 438.5 478.8 429.2 472.2C420.7 478.8 411.5 484.8 401.7 489.8L373.7 504.5C368 507.5 360.9 505.3 357.9 499.6C354.9 493.9 357.1 486.8 362.8 483.8L390.9 469C397.7 465.4 404.3 461.3 410.5 456.9C397.1 444.4 385.5 429.9 376.3 413.9C373.1 408.3 375 401.1 380.6 397.9C386.2 394.7 393.4 396.6 396.6 402.2C405.1 417 415.9 430.3 428.5 441.6C443.4 427 455.4 409.6 463.8 390.2L467.9 380.7L352.8 380.7C346.3 380.7 341.1 375.5 341.1 369C341.1 362.5 346.4 357.3 352.8 357.3L411.4 357.3L411.4 329.9C411.4 323.4 416.6 318.2 423.1 318.2z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/teams-Pm4MsyNQ.js
	var teams_Pm4MsyNQ_exports = /* @__PURE__ */ __exportAll({ default: () => e$194 });
	var e$194;
	var init_teams_Pm4MsyNQ = __esmMin((() => {
		e$194 = "<svg\n  xmlns=\"http://www.w3.org/2000/svg\"\n  viewBox=\"0 0 640 640\"\n  fill=\"currentColor\"\n>\n  <path\n    opacity=\".5\"\n    d=\"M135.68 336c0-44.186 35.814-80 80-80h108.019c44.186 0 80 35.814 80 80v160c0 44.186 35.815 80 80 80H269.018c-73.639 0-133.338-59.699-133.338-133.338zm98.048 52.89v-22.81H139.52v22.81h33.114v101.542h27.955V388.89z\"\n  />\n  <path\n    d=\"M483.2 281.6c44.186 0 80 35.814 80 80V496c0 44.186-35.814 80-80 80s-80-35.814-80-80V336c0-21.005-8.102-40.128-21.338-54.4zM467.533 252.634c37.209 0 67.366-30.157 67.366-67.367 0-37.209-30.157-67.366-67.366-67.366s-67.367 30.157-67.367 67.366 30.157 67.367 67.367 67.367\"\n  />\n  <path\n    opacity=\".5\"\n    d=\"M265.434 225.69c44.646 0 80.844-36.199 80.844-80.845S310.08 64 265.434 64c-44.647 0-80.845 36.198-80.845 80.845s36.198 80.845 80.845 80.845\"\n  />\n  <path\n    d=\"M121.6 320h128c24.742 0 44.8 20.058 44.8 44.8v128c0 24.742-20.058 44.8-44.8 44.8h-128c-24.742 0-44.8-20.058-44.8-44.8v-128c0-24.742 20.058-44.8 44.8-44.8m111.616 69.427v-22.809h-94.208v22.809h33.114V490.97h27.955V389.427z\"\n  />\n</svg>\n";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/triangle-exclamation-pen-regular-Dt0-btDy.js
	var triangle_exclamation_pen_regular_Dt0_btDy_exports = /* @__PURE__ */ __exportAll({ default: () => e$193 });
	var e$193;
	var init_triangle_exclamation_pen_regular_Dt0_btDy = __esmMin((() => {
		e$193 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--!Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.--><path d=\"M69.4 485L285.4 85C292.4 72.1 305.9 64 320.6 64L320.5 64C335.2 64 348.7 72.1 355.7 85L485.9 326.1L450.5 361.5L320.5 120.8L117.9 496L315.9 496L315.8 496.1C302.5 509.5 292.7 526 287.5 544L104.5 544C90.4 544 77.4 536.6 70.2 524.5C63 512.4 62.7 497.4 69.4 485zM288.5 424C288.5 406.3 302.8 392 320.5 392C338.2 392 352.5 406.3 352.5 424C352.5 441.7 338.2 456 320.5 456C302.8 456 288.5 441.7 288.5 424zM289.6 282.6C287.6 264.1 302 248 320.6 248L320.5 248C339.1 248 353.5 264.1 351.5 282.6L344.4 346.7C343 358.8 332.7 368 320.5 368C308.3 368 298 358.8 296.7 346.7L289.6 282.6zM320.1 622.5L332 562.9C334.5 550.5 340.6 539.1 349.5 530.2L468.4 411.3L548.4 491.3L548.5 491.2L429.5 610.2C420.6 619.1 409.2 625.2 396.8 627.7L337.2 639.6C327.4 641.6 318.1 632.4 320.1 622.5zM491.1 388.6L519.8 359.9C541.9 337.8 577.7 337.8 599.8 359.9C621.9 382 621.9 417.8 599.8 439.9L571.1 468.6L491.1 388.6z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/users-circle-check-regular-C9fm-GlC.js
	var users_circle_check_regular_C9fm_GlC_exports = /* @__PURE__ */ __exportAll({ default: () => e$192 });
	var e$192;
	var init_users_circle_check_regular_C9fm_GlC = __esmMin((() => {
		e$192 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><path fill=\"currentColor\" d=\"M320 80C258.1 80 208 130.1 208 192C208 253.9 258.1 304 320 304C381.9 304 432 253.9 432 192C432 130.1 381.9 80 320 80zM160 128C107 128 64 171 64 224C64 277 107 320 160 320C177.8 320 194.4 315.2 208.6 306.8C196.9 295.5 187 282.4 179.2 268C173.3 270.6 166.8 272 160 272C133.5 272 112 250.5 112 224C112 197.5 133.5 176 160 176L160.8 176C162.4 159.5 166.6 143.6 172.9 128.9C168.7 128.3 164.4 128 160 128zM256 192C256 156.7 284.7 128 320 128L320 128C355.3 128 384 156.7 384 192C384 227.3 355.3 256 320 256C284.7 256 256 227.3 256 192zM480 128C475.7 128 471.3 128.3 467.1 128.9C473.4 143.6 477.6 159.4 479.2 176L480 176C506.5 176 528 197.5 528 224C528 250.5 506.5 272 480 272C473.2 272 466.7 270.6 460.8 268C453 282.4 443.1 295.5 431.4 306.8C434.6 308.7 437.9 310.4 441.3 311.9C458.6 306.8 477 304 496 304C507.1 304 518 304.9 528.6 306.8C556.9 290.1 576 259.3 576 224C576 171 533 128 480 128zM296 352C212.1 352 144 420.1 144 504L144 520C144 533.3 154.7 544 168 544C181.3 544 192 533.3 192 520L192 504C192 446.6 238.6 400 296 400L329.7 400C339.7 382.7 352.4 367.1 367.1 353.7C359.6 352.6 351.9 352 344 352L296 352zM496 352C416.5 352 352 416.5 352 496C352 575.5 416.5 640 496 640C575.5 640 640 575.5 640 496C640 416.5 575.5 352 496 352zM149.3 368C66.6 369.4 0 436.9 0 520C0 533.3 10.7 544 24 544C37.3 544 48 533.3 48 520C48 476.4 74.8 439.1 112.8 423.6C121.8 403 134.2 384.3 149.3 368zM531.1 438.6C536.3 431.5 546.3 429.9 553.4 435.1C560.5 440.3 562.1 450.3 556.9 457.4L492.9 545.4C490.1 549.2 485.9 551.6 481.2 551.9C476.5 552.2 471.9 550.6 468.6 547.3L428.6 507.3C422.4 501.1 422.3 490.9 428.6 484.7C434.9 478.5 445 478.5 451.2 484.7L478 511.4L531 438.6z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/users-circle-check-solid-32rf413N.js
	var users_circle_check_solid_32rf413N_exports = /* @__PURE__ */ __exportAll({ default: () => e$191 });
	var e$191;
	var init_users_circle_check_solid_32rf413N = __esmMin((() => {
		e$191 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><path fill=\"currentColor\" d=\"M320 80C262.6 80 216 126.6 216 184C216 241.4 262.6 288 320 288L320 288C377.4 288 424 241.4 424 184C424 126.6 377.4 80 320 80zM96 152Q96 152 96 152L96 152C56.2 152 24 184.2 24 224C24 263.8 56.2 296 96 296C135.8 296 168 263.8 168 224C168 184.2 135.8 152 96 152Q96 152 96 152zM544 152Q544 152 544 152C504.2 152 472 184.2 472 224C472 263.8 504.2 296 544 296C583.8 296 616 263.8 616 224C616 184.2 583.8 152 544 152Q544 152 544 152zM320 336C231.6 336 160 407.6 160 496L160 512C160 529.7 174.3 544 192 544L192 544L310.1 544C306.1 528.7 304 512.6 304 496C304 435.3 332.1 381.3 376 346.1C358.6 339.6 339.7 336 320 336zM128 352Q128 352 128 352C57.3 352 0 409.3 0 480L0 512C0 529.7 14.3 544 32 544L32 544L118.7 544C114.4 534.2 112 523.4 112 512L112 496C112 442.8 132 394.2 164.9 357.4C153.2 353.9 140.8 352 128 352Q128 352 128 352zM496 352C416.5 352 352 416.5 352 496C352 575.5 416.5 640 496 640C575.5 640 640 575.5 640 496C640 416.5 575.5 352 496 352zM531.1 438.6C536.3 431.5 546.3 429.9 553.4 435.1C560.5 440.3 562.1 450.3 556.9 457.4L492.9 545.4C490.1 549.2 485.9 551.6 481.2 551.9C476.5 552.2 471.9 550.6 468.6 547.3L428.6 507.3C422.4 501.1 422.3 490.9 428.6 484.7C434.9 478.5 445 478.5 451.2 484.7L478 511.4L531 438.6z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/users-circle-xmark-regular-Evqzcsz0.js
	var users_circle_xmark_regular_Evqzcsz0_exports = /* @__PURE__ */ __exportAll({ default: () => e$190 });
	var e$190;
	var init_users_circle_xmark_regular_Evqzcsz0 = __esmMin((() => {
		e$190 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><path fill=\"currentColor\" d=\"M320 80C258.1 80 208 130.1 208 192C208 253.9 258.1 304 320 304C381.9 304 432 253.9 432 192C432 130.1 381.9 80 320 80zM160 128C107 128 64 171 64 224C64 277 107 320 160 320C177.8 320 194.4 315.2 208.6 306.8C196.9 295.5 187 282.4 179.2 268C173.3 270.6 166.8 272 160 272C133.5 272 112 250.5 112 224C112 197.5 133.5 176 160 176L160.8 176C162.4 159.5 166.6 143.6 172.9 128.9C168.7 128.3 164.4 128 160 128zM256 192C256 156.7 284.7 128 320 128L320 128C355.3 128 384 156.7 384 192C384 227.3 355.3 256 320 256C284.7 256 256 227.3 256 192zM480 128C475.7 128 471.3 128.3 467.1 128.9C473.4 143.6 477.6 159.4 479.2 176L480 176C506.5 176 528 197.5 528 224C528 250.5 506.5 272 480 272C473.2 272 466.7 270.6 460.8 268C453 282.4 443.1 295.5 431.4 306.8C434.6 308.7 437.9 310.4 441.3 311.9C458.6 306.8 477 304 496 304C507.1 304 518 304.9 528.6 306.8C556.9 290.1 576 259.3 576 224C576 171 533 128 480 128zM296 352C212.1 352 144 420.1 144 504L144 520C144 533.3 154.7 544 168 544C181.3 544 192 533.3 192 520L192 504C192 446.6 238.6 400 296 400L329.7 400C339.7 382.7 352.4 367.1 367.1 353.7C359.6 352.6 351.9 352 344 352L296 352zM496 352C416.5 352 352 416.5 352 496C352 575.5 416.5 640 496 640C575.5 640 640 575.5 640 496C640 416.5 575.5 352 496 352zM149.3 368C66.6 369.4 0 436.9 0 520C0 533.3 10.7 544 24 544C37.3 544 48 533.3 48 520C48 476.4 74.8 439.1 112.8 423.6C121.8 403 134.2 384.3 149.3 368zM436.7 436.7C442.9 430.4 453.1 430.4 459.3 436.7L496 473.4L532.7 436.7C538.9 430.4 549.1 430.4 555.3 436.7C561.5 443 561.6 453.1 555.3 459.3L518.6 496L555.3 532.7C561.6 538.9 561.6 549.1 555.3 555.3C549 561.5 538.9 561.6 532.7 555.3L496 518.6L459.3 555.3C453.1 561.6 442.9 561.6 436.7 555.3C430.5 549 430.4 538.9 436.7 532.7L473.4 496L436.7 459.3C430.4 453.1 430.4 442.9 436.7 436.7z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/users-circle-xmark-solid-B-u_2hvw.js
	var users_circle_xmark_solid_B_u_2hvw_exports = /* @__PURE__ */ __exportAll({ default: () => e$189 });
	var e$189;
	var init_users_circle_xmark_solid_B_u_2hvw = __esmMin((() => {
		e$189 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><path fill=\"currentColor\" d=\"M320 80C262.6 80 216 126.6 216 184C216 241.4 262.6 288 320 288L320 288C377.4 288 424 241.4 424 184C424 126.6 377.4 80 320 80zM96 152Q96 152 96 152L96 152C56.2 152 24 184.2 24 224C24 263.8 56.2 296 96 296C135.8 296 168 263.8 168 224C168 184.2 135.8 152 96 152Q96 152 96 152zM544 152Q544 152 544 152C504.2 152 472 184.2 472 224C472 263.8 504.2 296 544 296C583.8 296 616 263.8 616 224C616 184.2 583.8 152 544 152Q544 152 544 152zM320 336C231.6 336 160 407.6 160 496L160 512C160 529.7 174.3 544 192 544L192 544L310.1 544C306.1 528.7 304 512.6 304 496C304 435.3 332.1 381.3 376 346.1C358.6 339.6 339.7 336 320 336zM128 352Q128 352 128 352C57.3 352 0 409.3 0 480L0 512C0 529.7 14.3 544 32 544L32 544L118.7 544C114.4 534.2 112 523.4 112 512L112 496C112 442.8 132 394.2 164.9 357.4C153.2 353.9 140.8 352 128 352Q128 352 128 352zM496 352C416.5 352 352 416.5 352 496C352 575.5 416.5 640 496 640C575.5 640 640 575.5 640 496C640 416.5 575.5 352 496 352zM436.7 436.7C442.9 430.4 453.1 430.4 459.3 436.7L496 473.4L532.7 436.7C538.9 430.4 549.1 430.4 555.3 436.7C561.5 443 561.6 453.1 555.3 459.3L518.6 496L555.3 532.7C561.6 538.9 561.6 549.1 555.3 555.3C549 561.5 538.9 561.6 532.7 555.3L496 518.6L459.3 555.3C453.1 561.6 442.9 561.6 436.7 555.3C430.5 549 430.4 538.9 436.7 532.7L473.4 496L436.7 459.3C430.4 453.1 430.4 442.9 436.7 436.7z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/arrow-down-arrow-up-DKKtxpCv.js
	var arrow_down_arrow_up_DKKtxpCv_exports = /* @__PURE__ */ __exportAll({ default: () => e$188 });
	var e$188;
	var init_arrow_down_arrow_up_DKKtxpCv = __esmMin((() => {
		e$188 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M214.6 566.6L310.6 470.6C323.1 458.1 323.1 437.8 310.6 425.3C298.1 412.8 277.8 412.8 265.3 425.3L224 466.7L224 96C224 78.3 209.7 64 192 64C174.3 64 160 78.3 160 96L160 466.7L118.6 425.3C106.1 412.8 85.8 412.8 73.3 425.3C60.8 437.8 60.8 458.1 73.3 470.6L169.3 566.6C181.8 579.1 202.1 579.1 214.6 566.6zM470.6 73.4C458.1 60.9 437.8 60.9 425.3 73.4L329.3 169.4C316.8 181.9 316.8 202.2 329.3 214.7C341.8 227.2 362.1 227.2 374.6 214.7L416 173.3L416 544C416 561.7 430.3 576 448 576C465.7 576 480 561.7 480 544L480 173.3L521.4 214.7C533.9 227.2 554.2 227.2 566.7 214.7C579.2 202.2 579.2 181.9 566.7 169.4L470.7 73.4z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/arrow-down-short-wide-C6OjNjkn.js
	var arrow_down_short_wide_C6OjNjkn_exports = /* @__PURE__ */ __exportAll({ default: () => e$187 });
	var e$187;
	var init_arrow_down_short_wide_C6OjNjkn = __esmMin((() => {
		e$187 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M278.6 438.6L182.6 534.6C170.1 547.1 149.8 547.1 137.3 534.6L41.3 438.6C28.8 426.1 28.8 405.8 41.3 393.3C53.8 380.8 74.1 380.8 86.6 393.3L128 434.7L128 128C128 110.3 142.3 96 160 96C177.7 96 192 110.3 192 128L192 434.7L233.4 393.3C245.9 380.8 266.2 380.8 278.7 393.3C291.2 405.8 291.2 426.1 278.7 438.6zM352 96L384 96C401.7 96 416 110.3 416 128C416 145.7 401.7 160 384 160L352 160C334.3 160 320 145.7 320 128C320 110.3 334.3 96 352 96zM352 224L448 224C465.7 224 480 238.3 480 256C480 273.7 465.7 288 448 288L352 288C334.3 288 320 273.7 320 256C320 238.3 334.3 224 352 224zM352 352L512 352C529.7 352 544 366.3 544 384C544 401.7 529.7 416 512 416L352 416C334.3 416 320 401.7 320 384C320 366.3 334.3 352 352 352zM352 480L576 480C593.7 480 608 494.3 608 512C608 529.7 593.7 544 576 544L352 544C334.3 544 320 529.7 320 512C320 494.3 334.3 480 352 480z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/arrow-down-wide-short-L7q8rRJU.js
	var arrow_down_wide_short_L7q8rRJU_exports = /* @__PURE__ */ __exportAll({ default: () => e$186 });
	var e$186;
	var init_arrow_down_wide_short_L7q8rRJU = __esmMin((() => {
		e$186 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M278.6 438.6L182.6 534.6C170.1 547.1 149.8 547.1 137.3 534.6L41.3 438.6C28.8 426.1 28.8 405.8 41.3 393.3C53.8 380.8 74.1 380.8 86.6 393.3L128 434.7L128 128C128 110.3 142.3 96 160 96C177.7 96 192 110.3 192 128L192 434.7L233.4 393.3C245.9 380.8 266.2 380.8 278.7 393.3C291.2 405.8 291.2 426.1 278.7 438.6zM352 544C334.3 544 320 529.7 320 512C320 494.3 334.3 480 352 480L384 480C401.7 480 416 494.3 416 512C416 529.7 401.7 544 384 544L352 544zM352 416C334.3 416 320 401.7 320 384C320 366.3 334.3 352 352 352L448 352C465.7 352 480 366.3 480 384C480 401.7 465.7 416 448 416L352 416zM352 288C334.3 288 320 273.7 320 256C320 238.3 334.3 224 352 224L512 224C529.7 224 544 238.3 544 256C544 273.7 529.7 288 512 288L352 288zM352 160C334.3 160 320 145.7 320 128C320 110.3 334.3 96 352 96L576 96C593.7 96 608 110.3 608 128C608 145.7 593.7 160 576 160L352 160z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/arrow-down-CHP75nxp.js
	var arrow_down_CHP75nxp_exports = /* @__PURE__ */ __exportAll({ default: () => e$185 });
	var e$185;
	var init_arrow_down_CHP75nxp = __esmMin((() => {
		e$185 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M297.4 566.6C309.9 579.1 330.2 579.1 342.7 566.6L502.7 406.6C515.2 394.1 515.2 373.8 502.7 361.3C490.2 348.8 469.9 348.8 457.4 361.3L352 466.7L352 96C352 78.3 337.7 64 320 64C302.3 64 288 78.3 288 96L288 466.7L182.6 361.3C170.1 348.8 149.8 348.8 137.3 361.3C124.8 373.8 124.8 394.1 137.3 406.6L297.3 566.6z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/arrow-left-WvQhFJoQ.js
	var arrow_left_WvQhFJoQ_exports = /* @__PURE__ */ __exportAll({ default: () => e$184 });
	var e$184;
	var init_arrow_left_WvQhFJoQ = __esmMin((() => {
		e$184 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M73.4 297.4C60.9 309.9 60.9 330.2 73.4 342.7L233.4 502.7C245.9 515.2 266.2 515.2 278.7 502.7C291.2 490.2 291.2 469.9 278.7 457.4L173.3 352L544 352C561.7 352 576 337.7 576 320C576 302.3 561.7 288 544 288L173.3 288L278.7 182.6C291.2 170.1 291.2 149.8 278.7 137.3C266.2 124.8 245.9 124.8 233.4 137.3L73.4 297.3z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/arrow-right-BGjLFdxQ.js
	var arrow_right_BGjLFdxQ_exports = /* @__PURE__ */ __exportAll({ default: () => e$183 });
	var e$183;
	var init_arrow_right_BGjLFdxQ = __esmMin((() => {
		e$183 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M566.6 342.6C579.1 330.1 579.1 309.8 566.6 297.3L406.6 137.3C394.1 124.8 373.8 124.8 361.3 137.3C348.8 149.8 348.8 170.1 361.3 182.6L466.7 288L96 288C78.3 288 64 302.3 64 320C64 337.7 78.3 352 96 352L466.7 352L361.3 457.4C348.8 469.9 348.8 490.2 361.3 502.7C373.8 515.2 394.1 515.2 406.6 502.7L566.6 342.7z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/arrow-rotate-left-B9-2vahA.js
	var arrow_rotate_left_B9_2vahA_exports = /* @__PURE__ */ __exportAll({ default: () => e$182 });
	var e$182;
	var init_arrow_rotate_left_B9_2vahA = __esmMin((() => {
		e$182 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M320 128C263.2 128 212.1 152.7 176.9 192L224 192C241.7 192 256 206.3 256 224C256 241.7 241.7 256 224 256L96 256C78.3 256 64 241.7 64 224L64 96C64 78.3 78.3 64 96 64C113.7 64 128 78.3 128 96L128 150.7C174.9 97.6 243.5 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C233 576 156.1 532.6 109.9 466.3C99.8 451.8 103.3 431.9 117.8 421.7C132.3 411.5 152.2 415.1 162.4 429.6C197.2 479.4 254.8 511.9 320 511.9C426 511.9 512 425.9 512 319.9C512 213.9 426 128 320 128z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/arrow-rotate-right-CkhIAYQ1.js
	var arrow_rotate_right_CkhIAYQ1_exports = /* @__PURE__ */ __exportAll({ default: () => e$181 });
	var e$181;
	var init_arrow_rotate_right_CkhIAYQ1 = __esmMin((() => {
		e$181 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M500.7 138.7L512 149.4L512 96C512 78.3 526.3 64 544 64C561.7 64 576 78.3 576 96L576 224C576 241.7 561.7 256 544 256L416 256C398.3 256 384 241.7 384 224C384 206.3 398.3 192 416 192L463.9 192L456.3 184.8C456.1 184.6 455.9 184.4 455.7 184.2C380.7 109.2 259.2 109.2 184.2 184.2C109.2 259.2 109.2 380.7 184.2 455.7C259.2 530.7 380.7 530.7 455.7 455.7C463.9 447.5 471.2 438.8 477.6 429.6C487.7 415.1 507.7 411.6 522.2 421.7C536.7 431.8 540.2 451.8 530.1 466.3C521.6 478.5 511.9 490.1 501 501C401 601 238.9 601 139 501C39.1 401 39 239 139 139C238.9 39.1 400.7 39 500.7 138.7z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/arrow-up-right-from-square-Dwau3xi5.js
	var arrow_up_right_from_square_Dwau3xi5_exports = /* @__PURE__ */ __exportAll({ default: () => e$180 });
	var e$180;
	var init_arrow_up_right_from_square_Dwau3xi5 = __esmMin((() => {
		e$180 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M384 64C366.3 64 352 78.3 352 96C352 113.7 366.3 128 384 128L466.7 128L265.3 329.4C252.8 341.9 252.8 362.2 265.3 374.7C277.8 387.2 298.1 387.2 310.6 374.7L512 173.3L512 256C512 273.7 526.3 288 544 288C561.7 288 576 273.7 576 256L576 96C576 78.3 561.7 64 544 64L384 64zM144 160C99.8 160 64 195.8 64 240L64 496C64 540.2 99.8 576 144 576L400 576C444.2 576 480 540.2 480 496L480 416C480 398.3 465.7 384 448 384C430.3 384 416 398.3 416 416L416 496C416 504.8 408.8 512 400 512L144 512C135.2 512 128 504.8 128 496L128 240C128 231.2 135.2 224 144 224L224 224C241.7 224 256 209.7 256 192C256 174.3 241.7 160 224 160L144 160z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/arrow-up-PDEGQcb7.js
	var arrow_up_PDEGQcb7_exports = /* @__PURE__ */ __exportAll({ default: () => e$179 });
	var e$179;
	var init_arrow_up_PDEGQcb7 = __esmMin((() => {
		e$179 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M342.6 73.4C330.1 60.9 309.8 60.9 297.3 73.4L137.3 233.4C124.8 245.9 124.8 266.2 137.3 278.7C149.8 291.2 170.1 291.2 182.6 278.7L288 173.3L288 544C288 561.7 302.3 576 320 576C337.7 576 352 561.7 352 544L352 173.3L457.4 278.7C469.9 291.2 490.2 291.2 502.7 278.7C515.2 266.2 515.2 245.9 502.7 233.4L342.7 73.4z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/ban-DfcLgI7I.js
	var ban_DfcLgI7I_exports = /* @__PURE__ */ __exportAll({ default: () => e$178 });
	var e$178;
	var init_ban_DfcLgI7I = __esmMin((() => {
		e$178 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M431.2 476.5L163.5 208.8C141.1 240.2 128 278.6 128 320C128 426 214 512 320 512C361.5 512 399.9 498.9 431.2 476.5zM476.5 431.2C498.9 399.8 512 361.4 512 320C512 214 426 128 320 128C278.5 128 240.1 141.1 208.8 163.5L476.5 431.2zM64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/bars-wzKz7v0w.js
	var bars_wzKz7v0w_exports = /* @__PURE__ */ __exportAll({ default: () => e$177 });
	var e$177;
	var init_bars_wzKz7v0w = __esmMin((() => {
		e$177 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M96 160C96 142.3 110.3 128 128 128L512 128C529.7 128 544 142.3 544 160C544 177.7 529.7 192 512 192L128 192C110.3 192 96 177.7 96 160zM96 320C96 302.3 110.3 288 128 288L512 288C529.7 288 544 302.3 544 320C544 337.7 529.7 352 512 352L128 352C110.3 352 96 337.7 96 320zM544 480C544 497.7 529.7 512 512 512L128 512C110.3 512 96 497.7 96 480C96 462.3 110.3 448 128 448L512 448C529.7 448 544 462.3 544 480z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/bell--embu37w.js
	var bell__embu37w_exports = /* @__PURE__ */ __exportAll({ default: () => e$176 });
	var e$176;
	var init_bell__embu37w = __esmMin((() => {
		e$176 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M320 64C302.3 64 288 78.3 288 96L288 99.2C215 114 160 178.6 160 256L160 277.7C160 325.8 143.6 372.5 113.6 410.1L103.8 422.3C98.7 428.6 96 436.4 96 444.5C96 464.1 111.9 480 131.5 480L508.4 480C528 480 543.9 464.1 543.9 444.5C543.9 436.4 541.2 428.6 536.1 422.3L526.3 410.1C496.4 372.5 480 325.8 480 277.7L480 256C480 178.6 425 114 352 99.2L352 96C352 78.3 337.7 64 320 64zM258 528C265.1 555.6 290.2 576 320 576C349.8 576 374.9 555.6 382 528L258 528z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/block-quote-BARVThCJ.js
	var block_quote_BARVThCJ_exports = /* @__PURE__ */ __exportAll({ default: () => e$175 });
	var e$175;
	var init_block_quote_BARVThCJ = __esmMin((() => {
		e$175 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M128 128C110.3 128 96 142.3 96 160C96 177.7 110.3 192 128 192L512 192C529.7 192 544 177.7 544 160C544 142.3 529.7 128 512 128L128 128zM256 288C238.3 288 224 302.3 224 320C224 337.7 238.3 352 256 352L512 352C529.7 352 544 337.7 544 320C544 302.3 529.7 288 512 288L256 288zM224 480C224 497.7 238.3 512 256 512L512 512C529.7 512 544 497.7 544 480C544 462.3 529.7 448 512 448L256 448C238.3 448 224 462.3 224 480zM128 288C110.3 288 96 302.3 96 320L96 480C96 497.7 110.3 512 128 512C145.7 512 160 497.7 160 480L160 320C160 302.3 145.7 288 128 288z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/bolt-BJGrxZaK.js
	var bolt_BJGrxZaK_exports = /* @__PURE__ */ __exportAll({ default: () => e$174 });
	var e$174;
	var init_bolt_BJGrxZaK = __esmMin((() => {
		e$174 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M434.8 54.1C446.7 62.7 451.1 78.3 445.7 91.9L367.3 288L512 288C525.5 288 537.5 296.4 542.1 309.1C546.7 321.8 542.8 336 532.5 344.6L244.5 584.6C233.2 594 217.1 594.5 205.2 585.9C193.3 577.3 188.9 561.7 194.3 548.1L272.7 352L128 352C114.5 352 102.5 343.6 97.9 330.9C93.3 318.2 97.2 304 107.5 295.4L395.5 55.4C406.8 46 422.9 45.5 434.8 54.1z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/book-copy-BBG9PKO7.js
	var book_copy_BBG9PKO7_exports = /* @__PURE__ */ __exportAll({ default: () => e$173 });
	var e$173;
	var init_book_copy_BBG9PKO7 = __esmMin((() => {
		e$173 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M352 448L576 448C593.7 448 608 433.7 608 416C608 398.3 593.7 384 576 384L576 317.3C594.6 310.7 608 292.9 608 272L608 112C608 85.5 586.5 64 560 64L352 64C299 64 256 107 256 160L256 352C256 405 299 448 352 448zM320 352C320 334.3 334.3 320 352 320L512 320L512 384L352 384C334.3 384 320 369.7 320 352zM128 192C75 192 32 235 32 288L32 480C32 533 75 576 128 576L352 576C369.7 576 384 561.7 384 544C384 526.3 369.7 512 352 512L128 512C110.3 512 96 497.7 96 480C96 462.3 110.3 448 128 448L244.7 448C221.9 422.5 208 388.9 208 352L208 192L128 192z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/book-open-lines-DL8kKwyp.js
	var book_open_lines_DL8kKwyp_exports = /* @__PURE__ */ __exportAll({ default: () => e$172 });
	var e$172;
	var init_book_open_lines_DL8kKwyp = __esmMin((() => {
		e$172 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M320 205.3L320 514.6L320.5 514.4C375.1 491.7 433.7 480 492.8 480L512 480L512 160L492.8 160C450.6 160 408.7 168.4 369.7 184.6C352.9 191.6 336.3 198.5 320 205.3zM294.9 125.5L320 136L345.1 125.5C391.9 106 442.1 96 492.8 96L528 96C554.5 96 576 117.5 576 144L576 496C576 522.5 554.5 544 528 544L492.8 544C442.1 544 391.9 554 345.1 573.5L332.3 578.8C324.4 582.1 315.6 582.1 307.7 578.8L294.9 573.5C248.1 554 197.9 544 147.2 544L112 544C85.5 544 64 522.5 64 496L64 144C64 117.5 85.5 96 112 96L147.2 96C197.9 96 248.1 106 294.9 125.5zM373.3 218.5C397.7 206.3 424.6 200 451.8 200L456 200C469.3 200 480 210.7 480 224C480 237.3 469.3 248 456 248L451.8 248C432 248 412.5 252.6 394.8 261.5C382.9 267.4 368.5 262.6 362.6 250.8C356.7 239 361.5 224.5 373.3 218.6zM373.3 314.5C397.7 302.3 424.6 296 451.8 296L456 296C469.3 296 480 306.7 480 320C480 333.3 469.3 344 456 344L451.8 344C432 344 412.5 348.6 394.8 357.5C382.9 363.4 368.5 358.6 362.6 346.8C356.7 335 361.5 320.5 373.3 314.6zM373.3 410.5C397.7 398.3 424.6 392 451.8 392L456 392C469.3 392 480 402.7 480 416C480 429.3 469.3 440 456 440L451.8 440C432 440 412.5 444.6 394.8 453.5C382.9 459.4 368.5 454.6 362.6 442.8C356.7 431 361.5 416.5 373.3 410.6zM152 200C138.7 200 128 210.7 128 224C128 237.3 138.7 248 152 248L172.2 248C192 248 211.5 252.6 229.2 261.5C241.1 267.4 255.5 262.6 261.4 250.8C267.3 239 262.5 224.5 250.7 218.6C226.3 206.4 199.4 200.1 172.2 200.1L152 200zM152 296C138.7 296 128 306.7 128 320C128 333.3 138.7 344 152 344L172.2 344C192 344 211.5 348.6 229.2 357.5C241.1 363.4 255.5 358.6 261.4 346.8C267.3 335 262.5 320.5 250.7 314.6C226.3 302.4 199.4 296.1 172.2 296.1L152 296zM152 392C138.7 392 128 402.7 128 416C128 429.3 138.7 440 152 440L172.2 440C192 440 211.5 444.6 229.2 453.5C241.1 459.4 255.5 454.6 261.4 442.8C267.3 431 262.5 416.5 250.7 410.6C226.3 398.4 199.4 392.1 172.2 392.1L152 392z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/books-3Rf2Jrrr.js
	var books_3Rf2Jrrr_exports = /* @__PURE__ */ __exportAll({ default: () => e$171 });
	var e$171;
	var init_books_3Rf2Jrrr = __esmMin((() => {
		e$171 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M391.2 81C374.1 85.6 364 103.1 368.6 120.2L381 166.6L504.6 133.5L492.2 87.1C487.7 70 470.1 59.9 453 64.4L391.2 81zM517.1 179.8L393.5 212.9L459.8 460.2L583.4 427.1L517.1 179.8zM484.5 552.9C489.1 570 506.6 580.1 523.7 575.5L585.6 559C602.7 554.4 612.8 536.9 608.2 519.8L595.8 473.4L472.2 506.5L484.6 552.9zM64.4 96L64.4 144L192.4 144L192.4 96C192.4 78.3 178.1 64 160.4 64L96.4 64C78.7 64 64.4 78.3 64.4 96zM64.4 192L64.4 448L192.4 448L192.4 192L64.4 192zM64.4 496L64.4 544C64.4 561.7 78.7 576 96.4 576L160.4 576C178.1 576 192.4 561.7 192.4 544L192.4 496L64.4 496zM240.4 192L240.4 544C240.4 561.7 254.7 576 272.4 576L320.4 576C338.1 576 352.4 561.7 352.4 544L352.4 192C352.4 174.3 338.1 160 320.4 160L272.4 160C254.7 160 240.4 174.3 240.4 192z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/box-archive-CiGxsdSR.js
	var box_archive_CiGxsdSR_exports = /* @__PURE__ */ __exportAll({ default: () => e$170 });
	var e$170;
	var init_box_archive_CiGxsdSR = __esmMin((() => {
		e$170 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M64 128C64 110.3 78.3 96 96 96L544 96C561.7 96 576 110.3 576 128L576 160C576 177.7 561.7 192 544 192L96 192C78.3 192 64 177.7 64 160L64 128zM96 240L544 240L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 240zM248 304C234.7 304 224 314.7 224 328C224 341.3 234.7 352 248 352L392 352C405.3 352 416 341.3 416 328C416 314.7 405.3 304 392 304L248 304z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/brake-warning-BQ-_b2Em.js
	var brake_warning_BQ__b2Em_exports = /* @__PURE__ */ __exportAll({ default: () => e$169 });
	var e$169;
	var init_brake_warning_BQ__b2Em = __esmMin((() => {
		e$169 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M320 544C196.3 544 96 443.7 96 320C96 196.3 196.3 96 320 96C443.7 96 544 196.3 544 320C544 443.7 443.7 544 320 544zM50.8 147C58 135.9 72.8 132.6 84 139.8C95.1 147 98.4 161.8 91.2 173C63.9 215.4 48.1 265.8 48.1 320C48.1 374.2 63.8 424.6 91.1 467C98.3 478.1 95.1 493 83.9 500.2C72.8 507.4 57.9 504.1 50.7 493C18.6 443.1-.1 383.7-.1 320C-.1 256.3 18.6 196.9 50.8 147zM556.1 139.8C567.2 132.6 582.1 135.9 589.3 147C621.4 196.9 640 256.3 640 320C640 383.7 621.4 443.1 589.3 493C582.1 504.1 567.3 507.4 556.1 500.2C545 493 541.7 478.2 548.9 467C576.2 424.6 592 374.2 592 320C592 265.8 576.2 215.4 548.9 173C541.7 161.9 544.9 147 556.1 139.8zM320 384C302.3 384 288 398.3 288 416C288 433.7 302.3 448 320 448C337.7 448 352 433.7 352 416C352 398.3 337.7 384 320 384zM320 192C301.8 192 287.3 207.5 288.6 225.7L296 329.7C296.9 342.3 307.4 352 319.9 352C332.5 352 342.9 342.3 343.8 329.7L351.2 225.7C352.5 207.5 338.1 192 319.8 192z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/bug-BsMECbyP.js
	var bug_BsMECbyP_exports = /* @__PURE__ */ __exportAll({ default: () => e$168 });
	var e$168;
	var init_bug_BsMECbyP = __esmMin((() => {
		e$168 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M224 160C224 107 267 64 320 64C373 64 416 107 416 160L416 163.6C416 179.3 403.3 192 387.6 192L252.5 192C236.8 192 224.1 179.3 224.1 163.6L224.1 160zM569.6 172.8C580.2 186.9 577.3 207 563.2 217.6L465.4 290.9C470.7 299.8 474.7 309.6 477.2 320L576 320C593.7 320 608 334.3 608 352C608 369.7 593.7 384 576 384L480 384L480 416C480 418.6 479.9 421.3 479.8 423.9L563.2 486.4C577.3 497 580.2 517.1 569.6 531.2C559 545.3 538.9 548.2 524.8 537.6L461.7 490.3C438.5 534.5 395.2 566.5 344 574.2L344 344C344 330.7 333.3 320 320 320C306.7 320 296 330.7 296 344L296 574.2C244.8 566.5 201.5 534.5 178.3 490.3L115.2 537.6C101.1 548.2 81 545.3 70.4 531.2C59.8 517.1 62.7 497 76.8 486.4L160.2 423.9C160.1 421.3 160 418.7 160 416L160 384L64 384C46.3 384 32 369.7 32 352C32 334.3 46.3 320 64 320L162.8 320C165.3 309.6 169.3 299.8 174.6 290.9L76.8 217.6C62.7 207 59.8 186.9 70.4 172.8C81 158.7 101.1 155.8 115.2 166.4L224 248C236.3 242.9 249.8 240 264 240L376 240C390.2 240 403.7 242.8 416 248L524.8 166.4C538.9 155.8 559 158.7 569.6 172.8z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/calendar-days-Bk9Y8sgz.js
	var calendar_days_Bk9Y8sgz_exports = /* @__PURE__ */ __exportAll({ default: () => e$167 });
	var e$167;
	var init_calendar_days_Bk9Y8sgz = __esmMin((() => {
		e$167 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M224 64C241.7 64 256 78.3 256 96L256 128L384 128L384 96C384 78.3 398.3 64 416 64C433.7 64 448 78.3 448 96L448 128L480 128C515.3 128 544 156.7 544 192L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 192C96 156.7 124.7 128 160 128L192 128L192 96C192 78.3 206.3 64 224 64zM160 304L160 336C160 344.8 167.2 352 176 352L208 352C216.8 352 224 344.8 224 336L224 304C224 295.2 216.8 288 208 288L176 288C167.2 288 160 295.2 160 304zM288 304L288 336C288 344.8 295.2 352 304 352L336 352C344.8 352 352 344.8 352 336L352 304C352 295.2 344.8 288 336 288L304 288C295.2 288 288 295.2 288 304zM432 288C423.2 288 416 295.2 416 304L416 336C416 344.8 423.2 352 432 352L464 352C472.8 352 480 344.8 480 336L480 304C480 295.2 472.8 288 464 288L432 288zM160 432L160 464C160 472.8 167.2 480 176 480L208 480C216.8 480 224 472.8 224 464L224 432C224 423.2 216.8 416 208 416L176 416C167.2 416 160 423.2 160 432zM304 416C295.2 416 288 423.2 288 432L288 464C288 472.8 295.2 480 304 480L336 480C344.8 480 352 472.8 352 464L352 432C352 423.2 344.8 416 336 416L304 416zM416 432L416 464C416 472.8 423.2 480 432 480L464 480C472.8 480 480 472.8 480 464L480 432C480 423.2 472.8 416 464 416L432 416C423.2 416 416 423.2 416 432z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/calendar-xmark-C9S6X-zn.js
	var calendar_xmark_C9S6X_zn_exports = /* @__PURE__ */ __exportAll({ default: () => e$166 });
	var e$166;
	var init_calendar_xmark_C9S6X_zn = __esmMin((() => {
		e$166 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M224 64C241.7 64 256 78.3 256 96L256 128L384 128L384 96C384 78.3 398.3 64 416 64C433.7 64 448 78.3 448 96L448 128L480 128C515.3 128 544 156.7 544 192L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 192C96 156.7 124.7 128 160 128L192 128L192 96C192 78.3 206.3 64 224 64zM387.9 284.1C378.5 274.7 363.3 274.7 354 284.1L320.1 318L286.2 284.1C276.8 274.7 261.6 274.7 252.3 284.1C243 293.5 242.9 308.7 252.3 318L286.2 351.9L252.3 385.8C242.9 395.2 242.9 410.4 252.3 419.7C261.7 429 276.9 429.1 286.2 419.7L320.1 385.8L354 419.7C363.4 429.1 378.6 429.1 387.9 419.7C397.2 410.3 397.3 395.1 387.9 385.8L354 351.9L387.9 318C397.3 308.6 397.3 293.4 387.9 284.1z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/cart-shopping-B4NhSLRq.js
	var cart_shopping_B4NhSLRq_exports = /* @__PURE__ */ __exportAll({ default: () => e$165 });
	var e$165;
	var init_cart_shopping_B4NhSLRq = __esmMin((() => {
		e$165 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M24 48C10.7 48 0 58.7 0 72C0 85.3 10.7 96 24 96L69.3 96C73.2 96 76.5 98.8 77.2 102.6L129.3 388.9C135.5 423.1 165.3 448 200.1 448L456 448C469.3 448 480 437.3 480 424C480 410.7 469.3 400 456 400L200.1 400C188.5 400 178.6 391.7 176.5 380.3L171.4 352L475 352C505.8 352 532.2 330.1 537.9 299.8L568.9 133.9C572.6 114.2 557.5 96 537.4 96L124.7 96L124.3 94C119.5 67.4 96.3 48 69.2 48L24 48zM208 576C234.5 576 256 554.5 256 528C256 501.5 234.5 480 208 480C181.5 480 160 501.5 160 528C160 554.5 181.5 576 208 576zM432 576C458.5 576 480 554.5 480 528C480 501.5 458.5 480 432 480C405.5 480 384 501.5 384 528C384 554.5 405.5 576 432 576z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/chart-line-up-BHQThhU0.js
	var chart_line_up_BHQThhU0_exports = /* @__PURE__ */ __exportAll({ default: () => e$164 });
	var e$164;
	var init_chart_line_up_BHQThhU0 = __esmMin((() => {
		e$164 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M96 96C113.7 96 128 110.3 128 128L128 464C128 472.8 135.2 480 144 480L544 480C561.7 480 576 494.3 576 512C576 529.7 561.7 544 544 544L144 544C99.8 544 64 508.2 64 464L64 128C64 110.3 78.3 96 96 96zM425.4 265.4L393 233C377.9 217.9 388.6 192 410 192L520 192C533.3 192 544 202.7 544 216L544 326.1C544 347.5 518.1 358.2 503 343.1L470.6 310.7L390.6 390.7C378.1 403.2 357.8 403.2 345.3 390.7L271.9 317.3L230.5 358.7C218 371.2 197.7 371.2 185.2 358.7C172.7 346.2 172.7 325.9 185.2 313.4L249.2 249.4C261.7 236.9 282 236.9 294.5 249.4L367.9 322.8L425.3 265.4z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/check-DRDNqshc.js
	var check_DRDNqshc_exports = /* @__PURE__ */ __exportAll({ default: () => e$163 });
	var e$163;
	var init_check_DRDNqshc = __esmMin((() => {
		e$163 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M530.8 134.1C545.1 144.5 548.3 164.5 537.9 178.8L281.9 530.8C276.4 538.4 267.9 543.1 258.5 543.9C249.1 544.7 240 541.2 233.4 534.6L105.4 406.6C92.9 394.1 92.9 373.8 105.4 361.3C117.9 348.8 138.2 348.8 150.7 361.3L252.2 462.8L486.2 141.1C496.6 126.8 516.6 123.6 530.9 134z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/chevron-down-Bqj19e1x.js
	var chevron_down_Bqj19e1x_exports = /* @__PURE__ */ __exportAll({ default: () => e$162 });
	var e$162;
	var init_chevron_down_Bqj19e1x = __esmMin((() => {
		e$162 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M297.4 470.6C309.9 483.1 330.2 483.1 342.7 470.6L534.7 278.6C547.2 266.1 547.2 245.8 534.7 233.3C522.2 220.8 501.9 220.8 489.4 233.3L320 402.7L150.6 233.4C138.1 220.9 117.8 220.9 105.3 233.4C92.8 245.9 92.8 266.2 105.3 278.7L297.3 470.7z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/chevron-left-B-tJfouO.js
	var chevron_left_B_tJfouO_exports = /* @__PURE__ */ __exportAll({ default: () => e$161 });
	var e$161;
	var init_chevron_left_B_tJfouO = __esmMin((() => {
		e$161 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M169.4 297.4C156.9 309.9 156.9 330.2 169.4 342.7L361.4 534.7C373.9 547.2 394.2 547.2 406.7 534.7C419.2 522.2 419.2 501.9 406.7 489.4L237.3 320L406.6 150.6C419.1 138.1 419.1 117.8 406.6 105.3C394.1 92.8 373.8 92.8 361.3 105.3L169.3 297.3z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/chevron-right-DGN_w03i.js
	var chevron_right_DGN_w03i_exports = /* @__PURE__ */ __exportAll({ default: () => e$160 });
	var e$160;
	var init_chevron_right_DGN_w03i = __esmMin((() => {
		e$160 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.2 297.3z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/chevron-up-DP8_qbDD.js
	var chevron_up_DP8_qbDD_exports = /* @__PURE__ */ __exportAll({ default: () => e$159 });
	var e$159;
	var init_chevron_up_DP8_qbDD = __esmMin((() => {
		e$159 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M297.4 169.4C309.9 156.9 330.2 156.9 342.7 169.4L534.7 361.4C547.2 373.9 547.2 394.2 534.7 406.7C522.2 419.2 501.9 419.2 489.4 406.7L320 237.3L150.6 406.6C138.1 419.1 117.8 419.1 105.3 406.6C92.8 394.1 92.8 373.8 105.3 361.3L297.3 169.3z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/chevrons-left-BO9uCLT8.js
	var chevrons_left_BO9uCLT8_exports = /* @__PURE__ */ __exportAll({ default: () => e$158 });
	var e$158;
	var init_chevrons_left_BO9uCLT8 = __esmMin((() => {
		e$158 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M105.4 297.4C92.9 309.9 92.9 330.2 105.4 342.7L297.4 534.7C309.9 547.2 330.2 547.2 342.7 534.7C355.2 522.2 355.2 501.9 342.7 489.4L173.3 320L342.6 150.6C355.1 138.1 355.1 117.8 342.6 105.3C330.1 92.8 309.8 92.8 297.3 105.3L105.3 297.3zM489.4 105.4L297.4 297.4C284.9 309.9 284.9 330.2 297.4 342.7L489.4 534.7C501.9 547.2 522.2 547.2 534.7 534.7C547.2 522.2 547.2 501.9 534.7 489.4L365.3 320L534.6 150.6C547.1 138.1 547.1 117.8 534.6 105.3C522.1 92.8 501.8 92.8 489.3 105.3z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/chevrons-right-P77jzbHw.js
	var chevrons_right_P77jzbHw_exports = /* @__PURE__ */ __exportAll({ default: () => e$157 });
	var e$157;
	var init_chevrons_right_P77jzbHw = __esmMin((() => {
		e$157 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M534.6 342.6C547.1 330.1 547.1 309.8 534.6 297.3L342.6 105.3C330.1 92.8 309.8 92.8 297.3 105.3C284.8 117.8 284.8 138.1 297.3 150.6L466.7 320L297.4 489.4C284.9 501.9 284.9 522.2 297.4 534.7C309.9 547.2 330.2 547.2 342.7 534.7L534.7 342.7zM150.6 534.6L342.6 342.6C355.1 330.1 355.1 309.8 342.6 297.3L150.6 105.3C138.1 92.8 117.8 92.8 105.3 105.3C92.8 117.8 92.8 138.1 105.3 150.6L274.7 320L105.4 489.4C92.9 501.9 92.9 522.2 105.4 534.7C117.9 547.2 138.2 547.2 150.7 534.7z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/circle-check-DkzlPZcu.js
	var circle_check_DkzlPZcu_exports = /* @__PURE__ */ __exportAll({ default: () => e$156 });
	var e$156;
	var init_circle_check_DkzlPZcu = __esmMin((() => {
		e$156 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576zM438 209.7C427.3 201.9 412.3 204.3 404.5 215L285.1 379.2L233 327.1C223.6 317.7 208.4 317.7 199.1 327.1C189.8 336.5 189.7 351.7 199.1 361L271.1 433C276.1 438 282.9 440.5 289.9 440C296.9 439.5 303.3 435.9 307.4 430.2L443.3 243.2C451.1 232.5 448.7 217.5 438 209.7z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/circle-exclamation-ePtdzI6y.js
	var circle_exclamation_ePtdzI6y_exports = /* @__PURE__ */ __exportAll({ default: () => e$155 });
	var e$155;
	var init_circle_exclamation_ePtdzI6y = __esmMin((() => {
		e$155 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576zM320 384C302.3 384 288 398.3 288 416C288 433.7 302.3 448 320 448C337.7 448 352 433.7 352 416C352 398.3 337.7 384 320 384zM320 192C301.8 192 287.3 207.5 288.6 225.7L296 329.7C296.9 342.3 307.4 352 319.9 352C332.5 352 342.9 342.3 343.8 329.7L351.2 225.7C352.5 207.5 338.1 192 319.8 192z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/circle-info-B3hoWb19.js
	var circle_info_B3hoWb19_exports = /* @__PURE__ */ __exportAll({ default: () => e$154 });
	var e$154;
	var init_circle_info_B3hoWb19 = __esmMin((() => {
		e$154 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM288 224C288 206.3 302.3 192 320 192C337.7 192 352 206.3 352 224C352 241.7 337.7 256 320 256C302.3 256 288 241.7 288 224zM280 288L328 288C341.3 288 352 298.7 352 312L352 400L360 400C373.3 400 384 410.7 384 424C384 437.3 373.3 448 360 448L280 448C266.7 448 256 437.3 256 424C256 410.7 266.7 400 280 400L304 400L304 336L280 336C266.7 336 256 325.3 256 312C256 298.7 266.7 288 280 288z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/circle-question-CMjmZbEN.js
	var circle_question_CMjmZbEN_exports = /* @__PURE__ */ __exportAll({ default: () => e$153 });
	var e$153;
	var init_circle_question_CMjmZbEN = __esmMin((() => {
		e$153 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM320 240C302.3 240 288 254.3 288 272C288 285.3 277.3 296 264 296C250.7 296 240 285.3 240 272C240 227.8 275.8 192 320 192C364.2 192 400 227.8 400 272C400 319.2 364 339.2 344 346.5L344 350.3C344 363.6 333.3 374.3 320 374.3C306.7 374.3 296 363.6 296 350.3L296 342.2C296 321.7 310.8 307 326.1 302C332.5 299.9 339.3 296.5 344.3 291.7C348.6 287.5 352 281.7 352 272.1C352 254.4 337.7 240.1 320 240.1zM288 432C288 414.3 302.3 400 320 400C337.7 400 352 414.3 352 432C352 449.7 337.7 464 320 464C302.3 464 288 449.7 288 432z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/circle-CK9obxW-.js
	var circle_CK9obxW__exports = /* @__PURE__ */ __exportAll({ default: () => e$152 });
	var e$152;
	var init_circle_CK9obxW_ = __esmMin((() => {
		e$152 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/clipboard-list-obFg7GYf.js
	var clipboard_list_obFg7GYf_exports = /* @__PURE__ */ __exportAll({ default: () => e$151 });
	var e$151;
	var init_clipboard_list_obFg7GYf = __esmMin((() => {
		e$151 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M439.4 96L448 96C483.3 96 512 124.7 512 160L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 160C128 124.7 156.7 96 192 96L200.6 96C211.6 76.9 232.3 64 256 64L384 64C407.7 64 428.4 76.9 439.4 96zM376 176C389.3 176 400 165.3 400 152C400 138.7 389.3 128 376 128L264 128C250.7 128 240 138.7 240 152C240 165.3 250.7 176 264 176L376 176zM256 320C256 302.3 241.7 288 224 288C206.3 288 192 302.3 192 320C192 337.7 206.3 352 224 352C241.7 352 256 337.7 256 320zM288 320C288 333.3 298.7 344 312 344L424 344C437.3 344 448 333.3 448 320C448 306.7 437.3 296 424 296L312 296C298.7 296 288 306.7 288 320zM288 448C288 461.3 298.7 472 312 472L424 472C437.3 472 448 461.3 448 448C448 434.7 437.3 424 424 424L312 424C298.7 424 288 434.7 288 448zM224 480C241.7 480 256 465.7 256 448C256 430.3 241.7 416 224 416C206.3 416 192 430.3 192 448C192 465.7 206.3 480 224 480z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/clock-rotate-left-Cl3ne6V5.js
	var clock_rotate_left_Cl3ne6V5_exports = /* @__PURE__ */ __exportAll({ default: () => e$150 });
	var e$150;
	var init_clock_rotate_left_Cl3ne6V5 = __esmMin((() => {
		e$150 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M320 128C426 128 512 214 512 320C512 426 426 512 320 512C254.8 512 197.1 479.5 162.4 429.7C152.3 415.2 132.3 411.7 117.8 421.8C103.3 431.9 99.8 451.9 109.9 466.4C156.1 532.6 233 576 320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C234.3 64 158.5 106.1 112 170.7L112 144C112 126.3 97.7 112 80 112C62.3 112 48 126.3 48 144L48 256C48 273.7 62.3 288 80 288L104.6 288C105.1 288 105.6 288 106.1 288L192.1 288C209.8 288 224.1 273.7 224.1 256C224.1 238.3 209.8 224 192.1 224L153.8 224C186.9 166.6 249 128 320 128zM344 216C344 202.7 333.3 192 320 192C306.7 192 296 202.7 296 216L296 320C296 326.4 298.5 332.5 303 337L375 409C384.4 418.4 399.6 418.4 408.9 409C418.2 399.6 418.3 384.4 408.9 375.1L343.9 310.1L343.9 216z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/clock-4qiXfc4j.js
	var clock_4qiXfc4j_exports = /* @__PURE__ */ __exportAll({ default: () => e$149 });
	var e$149;
	var init_clock_4qiXfc4j = __esmMin((() => {
		e$149 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64zM296 184L296 320C296 328 300 335.5 306.7 340L402.7 404C413.7 411.4 428.6 408.4 436 397.3C443.4 386.2 440.4 371.4 429.3 364L344 307.2L344 184C344 170.7 333.3 160 320 160C306.7 160 296 170.7 296 184z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/coins-BvIJMAce.js
	var coins_BvIJMAce_exports = /* @__PURE__ */ __exportAll({ default: () => e$148 });
	var e$148;
	var init_coins_BvIJMAce = __esmMin((() => {
		e$148 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M192 160L192 144C192 99.8 278 64 384 64C490 64 576 99.8 576 144L576 160C576 190.6 534.7 217.2 474 230.7C471.6 227.9 469.1 225.2 466.6 222.7C451.1 207.4 431.1 195.8 410.2 187.2C368.3 169.7 313.7 160.1 256 160.1C234.1 160.1 212.7 161.5 192.2 164.2C192 162.9 192 161.5 192 160.1zM496 417L496 370.8C511.1 366.9 525.3 362.3 538.2 356.9C551.4 351.4 564.3 344.7 576 336.6L576 352C576 378.8 544.5 402.5 496 417zM496 321L496 288C496 283.5 495.6 279.2 495 275C510.5 271.1 525 266.4 538.2 260.8C551.4 255.2 564.3 248.6 576 240.5L576 255.9C576 282.7 544.5 306.4 496 320.9zM64 304L64 288C64 243.8 150 208 256 208C362 208 448 243.8 448 288L448 304C448 348.2 362 384 256 384C150 384 64 348.2 64 304zM448 400C448 444.2 362 480 256 480C150 480 64 444.2 64 400L64 384.6C75.6 392.7 88.5 399.3 101.8 404.9C143.7 422.4 198.3 432 256 432C313.7 432 368.3 422.3 410.2 404.9C423.4 399.4 436.3 392.7 448 384.6L448 400zM448 480.6L448 496C448 540.2 362 576 256 576C150 576 64 540.2 64 496L64 480.6C75.6 488.7 88.5 495.3 101.8 500.9C143.7 518.4 198.3 528 256 528C313.7 528 368.3 518.3 410.2 500.9C423.4 495.4 436.3 488.7 448 480.6z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/copy-DymzQxcG.js
	var copy_DymzQxcG_exports = /* @__PURE__ */ __exportAll({ default: () => e$147 });
	var e$147;
	var init_copy_DymzQxcG = __esmMin((() => {
		e$147 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M288 64C252.7 64 224 92.7 224 128L224 384C224 419.3 252.7 448 288 448L480 448C515.3 448 544 419.3 544 384L544 183.4C544 166 536.9 149.3 524.3 137.2L466.6 81.8C454.7 70.4 438.8 64 422.3 64L288 64zM160 192C124.7 192 96 220.7 96 256L96 512C96 547.3 124.7 576 160 576L352 576C387.3 576 416 547.3 416 512L416 496L352 496L352 512L160 512L160 256L176 256L176 192L160 192z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/dolly-BWLrxUbu.js
	var dolly_BWLrxUbu_exports = /* @__PURE__ */ __exportAll({ default: () => e$146 });
	var e$146;
	var init_dolly_BWLrxUbu = __esmMin((() => {
		e$146 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M64 64C46.3 64 32 78.3 32 96C32 113.7 46.3 128 64 128L136.9 128L229 404.2C206.5 421.8 192 449.2 192 480C192 533 235 576 288 576C340.4 576 383.1 534 384 481.7L586.1 414.3C602.9 408.7 611.9 390.6 606.3 373.8C600.7 357 582.6 348 565.8 353.6L363.8 421C346.6 398.9 319.9 384.5 289.8 384L197.7 107.8C188.9 81.6 164.5 64 136.9 64L64 64zM240 480C240 453.5 261.5 432 288 432C314.5 432 336 453.5 336 480C336 506.5 314.5 528 288 528C261.5 528 240 506.5 240 480zM312.5 153.3C287.3 161.5 273.5 188.6 281.7 213.8L321.3 335.5C329.5 360.7 356.6 374.5 381.8 366.3L503.5 326.7C528.7 318.5 542.5 291.4 534.3 266.2L494.8 144.5C486.6 119.3 459.5 105.5 434.3 113.7L312.5 153.3z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/download-Cq1rorlu.js
	var download_Cq1rorlu_exports = /* @__PURE__ */ __exportAll({ default: () => e$145 });
	var e$145;
	var init_download_Cq1rorlu = __esmMin((() => {
		e$145 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M352 96C352 78.3 337.7 64 320 64C302.3 64 288 78.3 288 96L288 306.7L246.6 265.3C234.1 252.8 213.8 252.8 201.3 265.3C188.8 277.8 188.8 298.1 201.3 310.6L297.3 406.6C309.8 419.1 330.1 419.1 342.6 406.6L438.6 310.6C451.1 298.1 451.1 277.8 438.6 265.3C426.1 252.8 405.8 252.8 393.3 265.3L352 306.7L352 96zM160 384C124.7 384 96 412.7 96 448L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 448C544 412.7 515.3 384 480 384L433.1 384L376.5 440.6C345.3 471.8 294.6 471.8 263.4 440.6L206.9 384L160 384zM464 440C477.3 440 488 450.7 488 464C488 477.3 477.3 488 464 488C450.7 488 440 477.3 440 464C440 450.7 450.7 440 464 440z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/earth-americas-lazab6VE.js
	var earth_americas_lazab6VE_exports = /* @__PURE__ */ __exportAll({ default: () => e$144 });
	var e$144;
	var init_earth_americas_lazab6VE = __esmMin((() => {
		e$144 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M119.7 263.7L150.6 294.6C156.6 300.6 164.7 304 173.2 304L194.7 304C203.2 304 211.3 307.4 217.3 313.4L246.6 342.7C252.6 348.7 256 356.8 256 365.3L256 402.8C256 411.3 259.4 419.4 265.4 425.4L278.7 438.7C284.7 444.7 288.1 452.8 288.1 461.3L288.1 480C288.1 497.7 302.4 512 320.1 512C337.8 512 352.1 497.7 352.1 480L352.1 477.3C352.1 468.8 355.5 460.7 361.5 454.7L406.8 409.4C412.8 403.4 416.2 395.3 416.2 386.8L416.2 352.1C416.2 334.4 401.9 320.1 384.2 320.1L301.5 320.1C293 320.1 284.9 316.7 278.9 310.7L262.9 294.7C258.7 290.5 256.3 284.7 256.3 278.7C256.3 266.2 266.4 256.1 278.9 256.1L313.6 256.1C326.1 256.1 336.2 246 336.2 233.5C336.2 227.5 333.8 221.7 329.6 217.5L309.9 197.8C306 194 304 189.1 304 184C304 178.9 306 174 309.7 170.3L327 153C332.8 147.2 336.1 139.3 336.1 131.1C336.1 123.9 333.7 117.4 329.7 112.2C326.5 112.1 323.3 112 320.1 112C224.7 112 144.4 176.2 119.8 263.7zM528 320C528 285.4 519.6 252.8 504.6 224.2C498.2 225.1 491.9 228.1 486.7 233.3L473.3 246.7C467.3 252.7 463.9 260.8 463.9 269.3L463.9 304C463.9 321.7 478.2 336 495.9 336L520 336C522.5 336 525 335.7 527.3 335.2C527.7 330.2 527.8 325.1 527.8 320zM64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/ellipsis-vertical-CpD59bWA.js
	var ellipsis_vertical_CpD59bWA_exports = /* @__PURE__ */ __exportAll({ default: () => e$143 });
	var e$143;
	var init_ellipsis_vertical_CpD59bWA = __esmMin((() => {
		e$143 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M320 208C289.1 208 264 182.9 264 152C264 121.1 289.1 96 320 96C350.9 96 376 121.1 376 152C376 182.9 350.9 208 320 208zM320 432C350.9 432 376 457.1 376 488C376 518.9 350.9 544 320 544C289.1 544 264 518.9 264 488C264 457.1 289.1 432 320 432zM376 320C376 350.9 350.9 376 320 376C289.1 376 264 350.9 264 320C264 289.1 289.1 264 320 264C350.9 264 376 289.1 376 320z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/ellipsis-BKc75KAm.js
	var ellipsis_BKc75KAm_exports = /* @__PURE__ */ __exportAll({ default: () => e$142 });
	var e$142;
	var init_ellipsis_BKc75KAm = __esmMin((() => {
		e$142 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M96 320C96 289.1 121.1 264 152 264C182.9 264 208 289.1 208 320C208 350.9 182.9 376 152 376C121.1 376 96 350.9 96 320zM264 320C264 289.1 289.1 264 320 264C350.9 264 376 289.1 376 320C376 350.9 350.9 376 320 376C289.1 376 264 350.9 264 320zM488 264C518.9 264 544 289.1 544 320C544 350.9 518.9 376 488 376C457.1 376 432 350.9 432 320C432 289.1 457.1 264 488 264z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/empty-set-XdUk3gbp.js
	var empty_set_XdUk3gbp_exports = /* @__PURE__ */ __exportAll({ default: () => e$141 });
	var e$141;
	var init_empty_set_XdUk3gbp = __esmMin((() => {
		e$141 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M566.6 118.6C579.1 106.1 579.1 85.8 566.6 73.3C554.1 60.8 533.8 60.8 521.3 73.3L477 117.8C433.6 84.1 379.2 64 320 64C178.6 64 64 178.6 64 320C64 379.2 84.1 433.6 117.8 477L73.4 521.4C60.9 533.9 60.9 554.2 73.4 566.7C85.9 579.2 106.2 579.2 118.7 566.7L163 522.2C206.3 555.9 260.8 576 320 576C461.4 576 576 461.4 576 320C576 260.8 555.9 206.4 522.2 163L566.6 118.6zM431.2 163.5L163.5 431.2C141.1 399.9 128 361.5 128 320C128 214 214 128 320 128C361.5 128 399.9 141.1 431.2 163.5zM208.7 476.5L476.5 208.8C498.9 240.2 512 278.6 512 320C512 426 426 512 320 512C278.5 512 240.1 498.9 208.8 476.5z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/envelope-open-B8SVB9mh.js
	var envelope_open_B8SVB9mh_exports = /* @__PURE__ */ __exportAll({ default: () => e$140 });
	var e$140;
	var init_envelope_open_B8SVB9mh = __esmMin((() => {
		e$140 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M128.4 239.8L320 97.9L511.6 239.8L353.5 357C343.8 364.2 332.1 368 320 368C307.9 368 296.2 364.1 286.5 357L128.4 239.8zM320 32C307.9 32 296.2 35.9 286.5 43L89.9 188.7C73.6 200.8 64 219.8 64 240.1L64 480C64 515.3 92.7 544 128 544L512 544C547.3 544 576 515.3 576 480L576 240.1C576 219.8 566.4 200.7 550.1 188.7L353.5 43C343.8 35.8 332.1 32 320 32z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/eye-slash-BWbctBSy.js
	var eye_slash_BWbctBSy_exports = /* @__PURE__ */ __exportAll({ default: () => e$139 });
	var e$139;
	var init_eye_slash_BWbctBSy = __esmMin((() => {
		e$139 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L504.5 470.8C507.2 468.4 509.9 466 512.5 463.6C559.3 420.1 590.6 368.2 605.5 332.5C608.8 324.6 608.8 315.8 605.5 307.9C590.6 272.2 559.3 220.2 512.5 176.8C465.4 133.1 400.7 96.2 319.9 96.2C263.1 96.2 214.3 114.4 173.9 140.4L73 39.1zM236.5 202.7C260 185.9 288.9 176 320 176C399.5 176 464 240.5 464 320C464 351.1 454.1 379.9 437.3 403.5L402.6 368.8C415.3 347.4 419.6 321.1 412.7 295.1C399 243.9 346.3 213.5 295.1 227.2C286.5 229.5 278.4 232.9 271.1 237.2L236.4 202.5zM357.3 459.1C345.4 462.3 332.9 464 320 464C240.5 464 176 399.5 176 320C176 307.1 177.7 294.6 180.9 282.7L101.4 203.2C68.8 240 46.4 279 34.5 307.7C31.2 315.6 31.2 324.4 34.5 332.3C49.4 368 80.7 420 127.5 463.4C174.6 507.1 239.3 544 320.1 544C357.4 544 391.3 536.1 421.6 523.4L357.4 459.2z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/eye-C8udaNJp.js
	var eye_C8udaNJp_exports = /* @__PURE__ */ __exportAll({ default: () => e$138 });
	var e$138;
	var init_eye_C8udaNJp = __esmMin((() => {
		e$138 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M320 96C239.2 96 174.5 132.8 127.4 176.6C80.6 220.1 49.3 272 34.4 307.7C31.1 315.6 31.1 324.4 34.4 332.3C49.3 368 80.6 420 127.4 463.4C174.5 507.1 239.2 544 320 544C400.8 544 465.5 507.2 512.6 463.4C559.4 419.9 590.7 368 605.6 332.3C608.9 324.4 608.9 315.6 605.6 307.7C590.7 272 559.4 220 512.6 176.6C465.5 132.9 400.8 96 320 96zM176 320C176 240.5 240.5 176 320 176C399.5 176 464 240.5 464 320C464 399.5 399.5 464 320 464C240.5 464 176 399.5 176 320zM320 256C320 291.3 291.3 320 256 320C244.5 320 233.7 317 224.3 311.6C223.3 322.5 224.2 333.7 227.2 344.8C240.9 396 293.6 426.4 344.8 412.7C396 399 426.4 346.3 412.7 295.1C400.5 249.4 357.2 220.3 311.6 224.3C316.9 233.6 320 244.4 320 256z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/feather-CsIkAoz7.js
	var feather_CsIkAoz7_exports = /* @__PURE__ */ __exportAll({ default: () => e$137 });
	var e$137;
	var init_feather_CsIkAoz7 = __esmMin((() => {
		e$137 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M416 64C457 64 496.3 80.3 525.2 109.2L530.7 114.7C559.7 143.7 576 183 576 223.9C576 248 570.3 271.5 559.8 292.7C557.9 296.4 554.5 299.2 550.5 300.4L438.5 334C434.6 335.2 432 338.7 432 342.8C432 347.9 436.1 352 441.2 352L473.4 352C487.7 352 494.8 369.2 484.7 379.3L462.3 401.7C460.4 403.6 458.1 404.9 455.6 405.7L374.6 430C370.7 431.2 368.1 434.7 368.1 438.8C368.1 443.9 372.2 448 377.3 448C390.5 448 396.2 463.7 385.1 470.9C344 497.5 295.8 512 246.1 512L160.1 512L112.1 560C103.3 568.8 88.9 568.8 80.1 560C71.3 551.2 71.3 536.8 80.1 528L320 288C328.8 279.2 328.8 264.8 320 256C311.2 247.2 296.8 247.2 288 256L143.5 400.5C137.8 406.2 128 402.2 128 394.1C128 326.2 155 261.1 203 213.1L306.8 109.2C335.7 80.3 375 64 416 64z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/file-export-CtHpVa-D.js
	var file_export_CtHpVa_D_exports = /* @__PURE__ */ __exportAll({ default: () => e$136 });
	var e$136;
	var init_file_export_CtHpVa_D = __esmMin((() => {
		e$136 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M128.5 64C93.2 64 64.5 92.7 64.5 128L64.5 512C64.5 547.3 93.2 576 128.5 576L384.5 576C419.8 576 448.5 547.3 448.5 512L448.5 416L526.6 416L495.6 447C486.2 456.4 486.2 471.6 495.6 480.9C505 490.2 520.2 490.3 529.5 480.9L601.5 408.9C610.9 399.5 610.9 384.3 601.5 375L529.5 303C520.1 293.6 504.9 293.6 495.6 303C486.3 312.4 486.2 327.6 495.6 336.9L526.6 367.9L448.5 367.9L448.5 234.4C448.5 217.4 441.8 201.1 429.8 189.1L323.2 82.7C311.2 70.7 295 64 278 64L128.5 64zM390 240L296.5 240C283.2 240 272.5 229.3 272.5 216L272.5 122.5L390 240zM256.5 392C256.5 378.7 267.2 368 280.5 368L384.5 368L384.5 416L280.5 416C267.2 416 256.5 405.3 256.5 392z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/file-lines-DG1HCzpY.js
	var file_lines_DG1HCzpY_exports = /* @__PURE__ */ __exportAll({ default: () => e$135 });
	var e$135;
	var init_file_lines_DG1HCzpY = __esmMin((() => {
		e$135 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M128 128C128 92.7 156.7 64 192 64L341.5 64C358.5 64 374.8 70.7 386.8 82.7L493.3 189.3C505.3 201.3 512 217.6 512 234.6L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 128zM336 122.5L336 216C336 229.3 346.7 240 360 240L453.5 240L336 122.5zM248 320C234.7 320 224 330.7 224 344C224 357.3 234.7 368 248 368L392 368C405.3 368 416 357.3 416 344C416 330.7 405.3 320 392 320L248 320zM248 416C234.7 416 224 426.7 224 440C224 453.3 234.7 464 248 464L392 464C405.3 464 416 453.3 416 440C416 426.7 405.3 416 392 416L248 416z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/file-magnifying-glass-BdFfusd0.js
	var file_magnifying_glass_BdFfusd0_exports = /* @__PURE__ */ __exportAll({ default: () => e$134 });
	var e$134;
	var init_file_magnifying_glass_BdFfusd0 = __esmMin((() => {
		e$134 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M128 128C128 92.7 156.7 64 192 64L341.5 64C358.5 64 374.8 70.7 386.8 82.7L493.3 189.3C505.3 201.3 512 217.6 512 234.6L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 128zM336 122.5L336 216C336 229.3 346.7 240 360 240L453.5 240L336 122.5zM400 384C400 331 357 288 304 288C251 288 208 331 208 384C208 437 251 480 304 480C321.8 480 338.4 475.2 352.7 466.8L391 505.1C400.4 514.5 415.6 514.5 424.9 505.1C434.2 495.7 434.3 480.5 424.9 471.2L386.6 432.9C395.1 418.6 399.9 401.9 399.9 384zM304 336C330.5 336 352 357.5 352 384C352 410.5 330.5 432 304 432C277.5 432 256 410.5 256 384C256 357.5 277.5 336 304 336z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/file-pdf-DhRtwyGV.js
	var file_pdf_DhRtwyGV_exports = /* @__PURE__ */ __exportAll({ default: () => e$133 });
	var e$133;
	var init_file_pdf_DhRtwyGV = __esmMin((() => {
		e$133 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M128 64C92.7 64 64 92.7 64 128L64 512C64 547.3 92.7 576 128 576L208 576L208 464C208 428.7 236.7 400 272 400L448 400L448 234.5C448 217.5 441.3 201.2 429.3 189.2L322.7 82.7C310.7 70.7 294.5 64 277.5 64L128 64zM389.5 240L296 240C282.7 240 272 229.3 272 216L272 122.5L389.5 240zM272 444C261 444 252 453 252 464L252 592C252 603 261 612 272 612C283 612 292 603 292 592L292 564L304 564C337.1 564 364 537.1 364 504C364 470.9 337.1 444 304 444L272 444zM304 524L292 524L292 484L304 484C315 484 324 493 324 504C324 515 315 524 304 524zM400 444C389 444 380 453 380 464L380 592C380 603 389 612 400 612L432 612C460.7 612 484 588.7 484 560L484 496C484 467.3 460.7 444 432 444L400 444zM420 572L420 484L432 484C438.6 484 444 489.4 444 496L444 560C444 566.6 438.6 572 432 572L420 572zM508 464L508 592C508 603 517 612 528 612C539 612 548 603 548 592L548 548L576 548C587 548 596 539 596 528C596 517 587 508 576 508L548 508L548 484L576 484C587 484 596 475 596 464C596 453 587 444 576 444L528 444C517 444 508 453 508 464z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/filter-slash-Bqmb0trt.js
	var filter_slash_Bqmb0trt_exports = /* @__PURE__ */ __exportAll({ default: () => e$132 });
	var e$132;
	var init_filter_slash_Bqmb0trt = __esmMin((() => {
		e$132 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L391.6 357.7L566.6 182.6C575.8 173.4 578.5 159.7 573.5 147.7C568.5 135.7 556.9 128 544 128L161.8 128L73 39.1zM256 365.3L256 365.3L256 480C256 488.5 259.4 496.6 265.4 502.6L329.4 566.6C338.6 575.8 352.3 578.5 364.3 573.5C376.3 568.5 384 556.9 384 544L384 485.8L256 357.8L256 365.2z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/filter-B4TbeTSI.js
	var filter_B4TbeTSI_exports = /* @__PURE__ */ __exportAll({ default: () => e$131 });
	var e$131;
	var init_filter_B4TbeTSI = __esmMin((() => {
		e$131 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M96 128C83.1 128 71.4 135.8 66.4 147.8C61.4 159.8 64.2 173.5 73.4 182.6L256 365.3L256 480C256 488.5 259.4 496.6 265.4 502.6L329.4 566.6C338.6 575.8 352.3 578.5 364.3 573.5C376.3 568.5 384 556.9 384 544L384 365.3L566.6 182.7C575.8 173.5 578.5 159.8 573.5 147.8C568.5 135.8 556.9 128 544 128L96 128z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/folder-open-gHGYh_zw.js
	var folder_open_gHGYh_zw_exports = /* @__PURE__ */ __exportAll({ default: () => e$130 });
	var e$130;
	var init_folder_open_gHGYh_zw = __esmMin((() => {
		e$130 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M88 289.6L64.4 360.2L64.4 160C64.4 124.7 93.1 96 128.4 96L267.1 96C280.9 96 294.4 100.5 305.5 108.8L343.9 137.6C349.4 141.8 356.2 144 363.1 144L480.4 144C515.7 144 544.4 172.7 544.4 208L544.4 224L179 224C137.7 224 101 250.4 87.9 289.6zM509.8 512L131 512C98.2 512 75.1 479.9 85.5 448.8L133.5 304.8C140 285.2 158.4 272 179 272L557.8 272C590.6 272 613.7 304.1 603.3 335.2L555.3 479.2C548.8 498.8 530.4 512 509.8 512z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/folder-user-DSLVqJgP.js
	var folder_user_DSLVqJgP_exports = /* @__PURE__ */ __exportAll({ default: () => e$129 });
	var e$129;
	var init_folder_user_DSLVqJgP = __esmMin((() => {
		e$129 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M512 512L128 512C92.7 512 64 483.3 64 448L64 160C64 124.7 92.7 96 128 96L266.7 96C280.5 96 294 100.5 305.1 108.8L343.5 137.6C349 141.8 355.8 144 362.7 144L512 144C547.3 144 576 172.7 576 208L576 448C576 483.3 547.3 512 512 512zM320 344C350.9 344 376 318.9 376 288C376 257.1 350.9 232 320 232C289.1 232 264 257.1 264 288C264 318.9 289.1 344 320 344zM226.3 413C213.4 428.6 228.5 448 248.7 448L391.2 448C411.4 448 426.5 428.6 413.6 413C398.9 395.3 376.7 384 351.9 384L287.9 384C263.1 384 240.9 395.3 226.2 413z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/folder-C9K9xnmx.js
	var folder_C9K9xnmx_exports = /* @__PURE__ */ __exportAll({ default: () => e$128 });
	var e$128;
	var init_folder_C9K9xnmx = __esmMin((() => {
		e$128 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M128 512L512 512C547.3 512 576 483.3 576 448L576 208C576 172.7 547.3 144 512 144L362.7 144C355.8 144 349 141.8 343.5 137.6L305.1 108.8C294 100.5 280.5 96 266.7 96L128 96C92.7 96 64 124.7 64 160L64 448C64 483.3 92.7 512 128 512z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/gauge-max-DViMoL2-.js
	var gauge_max_DViMoL2__exports = /* @__PURE__ */ __exportAll({ default: () => e$127 });
	var e$127;
	var init_gauge_max_DViMoL2_ = __esmMin((() => {
		e$127 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320zM352 160C352 142.3 337.7 128 320 128C302.3 128 288 142.3 288 160C288 177.7 302.3 192 320 192C337.7 192 352 177.7 352 160zM320 480C355.3 480 384 451.3 384 416C384 412.6 383.7 409.3 383.2 406.1L492.3 340.6C503.7 333.8 507.3 319 500.5 307.7C493.7 296.4 478.9 292.6 467.6 299.5L358.5 364.9C347.8 356.8 334.4 352 320 352C284.7 352 256 380.7 256 416C256 451.3 284.7 480 320 480zM240 208C240 190.3 225.7 176 208 176C190.3 176 176 190.3 176 208C176 225.7 190.3 240 208 240C225.7 240 240 225.7 240 208zM160 352C177.7 352 192 337.7 192 320C192 302.3 177.7 288 160 288C142.3 288 128 302.3 128 320C128 337.7 142.3 352 160 352zM464 208C464 190.3 449.7 176 432 176C414.3 176 400 190.3 400 208C400 225.7 414.3 240 432 240C449.7 240 464 225.7 464 208z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/gauge-min-C4DgCWSI.js
	var gauge_min_C4DgCWSI_exports = /* @__PURE__ */ __exportAll({ default: () => e$126 });
	var e$126;
	var init_gauge_min_C4DgCWSI = __esmMin((() => {
		e$126 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320zM352 160C352 142.3 337.7 128 320 128C302.3 128 288 142.3 288 160C288 177.7 302.3 192 320 192C337.7 192 352 177.7 352 160zM320 480C355.3 480 384 451.3 384 416C384 380.7 355.3 352 320 352C305.5 352 292.2 356.8 281.5 364.9L172.3 299.4C160.9 292.6 146.2 296.3 139.4 307.6C132.6 318.9 136.3 333.7 147.6 340.5L256.7 406C256.2 409.2 255.9 412.6 255.9 415.9C255.9 451.2 284.6 479.9 319.9 479.9zM240 208C240 190.3 225.7 176 208 176C190.3 176 176 190.3 176 208C176 225.7 190.3 240 208 240C225.7 240 240 225.7 240 208zM480 352C497.7 352 512 337.7 512 320C512 302.3 497.7 288 480 288C462.3 288 448 302.3 448 320C448 337.7 462.3 352 480 352zM464 208C464 190.3 449.7 176 432 176C414.3 176 400 190.3 400 208C400 225.7 414.3 240 432 240C449.7 240 464 225.7 464 208z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/gear-CgfoWG1S.js
	var gear_CgfoWG1S_exports = /* @__PURE__ */ __exportAll({ default: () => e$125 });
	var e$125;
	var init_gear_CgfoWG1S = __esmMin((() => {
		e$125 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M259.1 73.5C262.1 58.7 275.2 48 290.4 48L350.2 48C365.4 48 378.5 58.7 381.5 73.5L396 143.5C410.1 149.5 423.3 157.2 435.3 166.3L503.1 143.8C517.5 139 533.3 145 540.9 158.2L570.8 210C578.4 223.2 575.7 239.8 564.3 249.9L511 297.3C511.9 304.7 512.3 312.3 512.3 320C512.3 327.7 511.8 335.3 511 342.7L564.4 390.2C575.8 400.3 578.4 417 570.9 430.1L541 481.9C533.4 495 517.6 501.1 503.2 496.3L435.4 473.8C423.3 482.9 410.1 490.5 396.1 496.6L381.7 566.5C378.6 581.4 365.5 592 350.4 592L290.6 592C275.4 592 262.3 581.3 259.3 566.5L244.9 496.6C230.8 490.6 217.7 482.9 205.6 473.8L137.5 496.3C123.1 501.1 107.3 495.1 99.7 481.9L69.8 430.1C62.2 416.9 64.9 400.3 76.3 390.2L129.7 342.7C128.8 335.3 128.4 327.7 128.4 320C128.4 312.3 128.9 304.7 129.7 297.3L76.3 249.8C64.9 239.7 62.3 223 69.8 209.9L99.7 158.1C107.3 144.9 123.1 138.9 137.5 143.7L205.3 166.2C217.4 157.1 230.6 149.5 244.6 143.4L259.1 73.5zM320.3 400C364.5 399.8 400.2 363.9 400 319.7C399.8 275.5 363.9 239.8 319.7 240C275.5 240.2 239.8 276.1 240 320.3C240.2 364.5 276.1 400.2 320.3 400z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/gift-BYsYVXig.js
	var gift_BYsYVXig_exports = /* @__PURE__ */ __exportAll({ default: () => e$124 });
	var e$124;
	var init_gift_BYsYVXig = __esmMin((() => {
		e$124 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M385.5 132.8C393.1 119.9 406.9 112 421.8 112L424 112C446.1 112 464 129.9 464 152C464 174.1 446.1 192 424 192L350.7 192L385.5 132.8zM254.5 132.8L289.3 192L216 192C193.9 192 176 174.1 176 152C176 129.9 193.9 112 216 112L218.2 112C233.1 112 247 119.9 254.5 132.8zM344.1 108.5L320 149.5L295.9 108.5C279.7 80.9 250.1 64 218.2 64L216 64C167.4 64 128 103.4 128 152C128 166.4 131.5 180 137.6 192L96 192C78.3 192 64 206.3 64 224L64 256C64 273.7 78.3 288 96 288L544 288C561.7 288 576 273.7 576 256L576 224C576 206.3 561.7 192 544 192L502.4 192C508.5 180 512 166.4 512 152C512 103.4 472.6 64 424 64L421.8 64C389.9 64 360.3 80.9 344.1 108.4zM544 336L344 336L344 544L480 544C515.3 544 544 515.3 544 480L544 336zM296 336L96 336L96 480C96 515.3 124.7 544 160 544L296 544L296 336z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/grid-2-CeuWmRcs.js
	var grid_2_CeuWmRcs_exports = /* @__PURE__ */ __exportAll({ default: () => e$123 });
	var e$123;
	var init_grid_2_CeuWmRcs = __esmMin((() => {
		e$123 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M288 144C288 117.5 266.5 96 240 96L144 96C117.5 96 96 117.5 96 144L96 240C96 266.5 117.5 288 144 288L240 288C266.5 288 288 266.5 288 240L288 144zM288 400C288 373.5 266.5 352 240 352L144 352C117.5 352 96 373.5 96 400L96 496C96 522.5 117.5 544 144 544L240 544C266.5 544 288 522.5 288 496L288 400zM352 144L352 240C352 266.5 373.5 288 400 288L496 288C522.5 288 544 266.5 544 240L544 144C544 117.5 522.5 96 496 96L400 96C373.5 96 352 117.5 352 144zM544 400C544 373.5 522.5 352 496 352L400 352C373.5 352 352 373.5 352 400L352 496C352 522.5 373.5 544 400 544L496 544C522.5 544 544 522.5 544 496L544 400z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/hashtag-BF3RCoD3.js
	var hashtag_BF3RCoD3_exports = /* @__PURE__ */ __exportAll({ default: () => e$122 });
	var e$122;
	var init_hashtag_BF3RCoD3 = __esmMin((() => {
		e$122 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M278.7 64.7C296 68.4 307 85.4 303.3 102.7L284.2 192L410.7 192L432.7 89.3C436.4 72 453.4 61 470.7 64.7C488 68.4 499 85.4 495.3 102.7L476.2 192L544 192C561.7 192 576 206.3 576 224C576 241.7 561.7 256 544 256L462.4 256L435 384L502.8 384C520.5 384 534.8 398.3 534.8 416C534.8 433.7 520.5 448 502.8 448L421.2 448L399.2 550.7C395.5 568 378.5 579 361.2 575.3C343.9 571.6 332.9 554.6 336.6 537.3L355.7 448L229.2 448L207.2 550.7C203.5 568 186.5 579 169.2 575.3C151.9 571.6 140.9 554.6 144.6 537.3L163.8 448L96 448C78.3 448 64 433.7 64 416C64 398.3 78.3 384 96 384L177.6 384L205 256L137.2 256C119.5 256 105.2 241.7 105.2 224C105.2 206.3 119.5 192 137.2 192L218.8 192L240.8 89.3C244.4 72 261.4 61 278.7 64.7zM270.4 256L243 384L369.5 384L396.9 256L270.4 256z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/inbox-TWYcJCbF.js
	var inbox_TWYcJCbF_exports = /* @__PURE__ */ __exportAll({ default: () => e$121 });
	var e$121;
	var init_inbox_TWYcJCbF = __esmMin((() => {
		e$121 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M155.8 96C123.9 96 96.9 119.4 92.4 150.9L64.6 345.2C64.2 348.2 64 351.2 64 354.3L64 480C64 515.3 92.7 544 128 544L512 544C547.3 544 576 515.3 576 480L576 354.3C576 351.3 575.8 348.2 575.4 345.2L547.6 150.9C543.1 119.4 516.1 96 484.2 96L155.8 96zM155.8 160L484.3 160L511.7 352L451.8 352C439.7 352 428.6 358.8 423.2 369.7L408.9 398.3C403.5 409.1 392.4 416 380.3 416L259.9 416C247.8 416 236.7 409.2 231.3 398.3L217 369.7C211.6 358.9 200.5 352 188.4 352L128.3 352L155.8 160z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/life-ring-DFCsKq0t.js
	var life_ring_DFCsKq0t_exports = /* @__PURE__ */ __exportAll({ default: () => e$120 });
	var e$120;
	var init_life_ring_DFCsKq0t = __esmMin((() => {
		e$120 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M431.2 476.5C399.9 498.9 361.5 512 320 512C278.5 512 240.1 498.9 208.8 476.5L266.8 418.5C282.6 427.1 300.8 432 320.1 432C339.4 432 357.5 427.1 373.4 418.5L431.4 476.5zM521.9 477.3C555.7 433.9 575.9 379.3 575.9 320C575.9 260.7 555.8 206.1 522 162.7C531 150.2 529.9 132.6 518.6 121.4C507.3 110.2 489.8 109 477.3 118C433.9 84.2 379.3 64 320 64C260.7 64 206.1 84.2 162.7 118C150.2 109 132.6 110.1 121.4 121.4C110.2 132.7 109 150.2 118 162.7C84.2 206.1 64 260.7 64 320C64 379.3 84.2 433.9 118 477.3C109 489.8 110.1 507.4 121.4 518.6C132.7 529.8 150.2 531 162.7 522C206.1 555.8 260.7 576 320 576C379.3 576 433.9 555.8 477.3 522C489.8 531 507.4 529.9 518.6 518.6C529.8 507.3 531 489.8 522 477.3zM476.4 431.2L418.4 373.2C427 357.4 431.9 339.2 431.9 319.9C431.9 300.6 427 282.5 418.4 266.6L476.4 208.6C498.9 240.1 512 278.5 512 320C512 361.5 498.9 399.9 476.5 431.2zM431.2 163.5L373.2 221.5C357.4 212.9 339.2 208 319.9 208C300.6 208 282.5 212.9 266.6 221.5L208.6 163.5C240.1 141.1 278.5 128 320 128C361.5 128 399.9 141.1 431.2 163.5zM221.5 373.3L163.5 431.3C141.1 399.9 128 361.5 128 320C128 278.5 141.1 240.1 163.5 208.8L221.5 266.8C212.9 282.6 208 300.8 208 320.1C208 339.4 212.9 357.5 221.5 373.4zM272 320C272 293.5 293.5 272 320 272C346.5 272 368 293.5 368 320C368 346.5 346.5 368 320 368C293.5 368 272 346.5 272 320z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/lightbulb-CzcQ28JA.js
	var lightbulb_CzcQ28JA_exports = /* @__PURE__ */ __exportAll({ default: () => e$119 });
	var e$119;
	var init_lightbulb_CzcQ28JA = __esmMin((() => {
		e$119 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M420.9 448C428.2 425.7 442.8 405.5 459.3 388.1C492 353.7 512 307.2 512 256C512 150 426 64 320 64C214 64 128 150 128 256C128 307.2 148 353.7 180.7 388.1C197.2 405.5 211.9 425.7 219.1 448L420.8 448zM416 496L224 496L224 512C224 556.2 259.8 592 304 592L336 592C380.2 592 416 556.2 416 512L416 496zM312 176C272.2 176 240 208.2 240 248C240 261.3 229.3 272 216 272C202.7 272 192 261.3 192 248C192 181.7 245.7 128 312 128C325.3 128 336 138.7 336 152C336 165.3 325.3 176 312 176z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/link-slash-DfYFJeps.js
	var link_slash_DfYFJeps_exports = /* @__PURE__ */ __exportAll({ default: () => e$118 });
	var e$118;
	var init_link_slash_DfYFJeps = __esmMin((() => {
		e$118 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L478.9 445.2C483.1 441.8 487.2 438.1 491 434.3L562.1 363.2C591.4 333.9 607.9 294.1 607.9 252.6C607.9 166.2 537.9 96.1 451.4 96.1C414.1 96.1 378.3 109.4 350.1 133.3C370.4 143.4 388.8 156.8 404.6 172.8C418.7 164.5 434.8 160.1 451.4 160.1C502.5 160.1 543.9 201.5 543.9 252.6C543.9 277.1 534.2 300.6 516.8 318L445.7 389.1C441.8 393 437.6 396.5 433.1 399.6L385.6 352.1C402.1 351.2 415.3 337.7 415.8 321C415.8 319.7 415.8 318.4 415.8 317.1C415.8 230.8 345.9 160.2 259.3 160.2C240.1 160.2 221.4 163.7 203.8 170.4L73 39.1zM257.9 224C258.5 224 259 224 259.6 224C274.7 224 289.1 227.7 301.7 234.2C303.5 235.4 305.3 236.5 307.2 237.3C334 253.6 352 283.2 352 316.9C352 317.3 352 317.7 352 318.1L257.9 224zM378.2 480L224 325.8C225.2 410.4 293.6 478.7 378.1 479.9zM171.7 273.5L126.4 228.2L77.8 276.8C48.5 306.1 32 345.9 32 387.4C32 473.8 102 543.9 188.5 543.9C225.7 543.9 261.6 530.6 289.8 506.7C269.5 496.6 251 483.2 235.2 467.2C221.2 475.4 205.1 479.8 188.5 479.8C137.4 479.8 96 438.4 96 387.3C96 362.8 105.7 339.3 123.1 321.9L171.7 273.3z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/link-Vfa8FspI.js
	var link_Vfa8FspI_exports = /* @__PURE__ */ __exportAll({ default: () => e$117 });
	var e$117;
	var init_link_Vfa8FspI = __esmMin((() => {
		e$117 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M451.5 160C434.9 160 418.8 164.5 404.7 172.7C388.9 156.7 370.5 143.3 350.2 133.2C378.4 109.2 414.3 96 451.5 96C537.9 96 608 166 608 252.5C608 294 591.5 333.8 562.2 363.1L491.1 434.2C461.8 463.5 422 480 380.5 480C294.1 480 224 410 224 323.5C224 322 224 320.5 224.1 319C224.6 301.3 239.3 287.4 257 287.9C274.7 288.4 288.6 303.1 288.1 320.8C288.1 321.7 288.1 322.6 288.1 323.4C288.1 374.5 329.5 415.9 380.6 415.9C405.1 415.9 428.6 406.2 446 388.8L517.1 317.7C534.4 300.4 544.2 276.8 544.2 252.3C544.2 201.2 502.8 159.8 451.7 159.8zM307.2 237.3C305.3 236.5 303.4 235.4 301.7 234.2C289.1 227.7 274.7 224 259.6 224C235.1 224 211.6 233.7 194.2 251.1L123.1 322.2C105.8 339.5 96 363.1 96 387.6C96 438.7 137.4 480.1 188.5 480.1C205 480.1 221.1 475.7 235.2 467.5C251 483.5 269.4 496.9 289.8 507C261.6 530.9 225.8 544.2 188.5 544.2C102.1 544.2 32 474.2 32 387.7C32 346.2 48.5 306.4 77.8 277.1L148.9 206C178.2 176.7 218 160.2 259.5 160.2C346.1 160.2 416 230.8 416 317.1C416 318.4 416 319.7 416 321C415.6 338.7 400.9 352.6 383.2 352.2C365.5 351.8 351.6 337.1 352 319.4C352 318.6 352 317.9 352 317.1C352 283.4 334 253.8 307.2 237.5z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/list-tree-BSKmPCjd.js
	var list_tree_BSKmPCjd_exports = /* @__PURE__ */ __exportAll({ default: () => e$116 });
	var e$116;
	var init_list_tree_BSKmPCjd = __esmMin((() => {
		e$116 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M112 112C85.5 112 64 133.5 64 160C64 177.8 73.7 193.3 88 201.6L88 448C88 478.9 113.1 504 144 504L198.4 504C206.7 518.3 222.2 528 240 528C266.5 528 288 506.5 288 480C288 453.5 266.5 432 240 432C222.2 432 206.7 441.7 198.4 456L144 456C139.6 456 136 452.4 136 448L136 344L198.4 344C206.7 358.3 222.2 368 240 368C266.5 368 288 346.5 288 320C288 293.5 266.5 272 240 272C222.2 272 206.7 281.7 198.4 296L136 296L136 201.6C150.3 193.3 160 177.8 160 160C160 133.5 138.5 112 112 112zM224 160C224 177.7 238.3 192 256 192L544 192C561.7 192 576 177.7 576 160C576 142.3 561.7 128 544 128L256 128C238.3 128 224 142.3 224 160zM352 320C352 337.7 366.3 352 384 352L544 352C561.7 352 576 337.7 576 320C576 302.3 561.7 288 544 288L384 288C366.3 288 352 302.3 352 320zM352 480C352 497.7 366.3 512 384 512L544 512C561.7 512 576 497.7 576 480C576 462.3 561.7 448 544 448L384 448C366.3 448 352 462.3 352 480z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/location-dot-slash-Ca4NpTMa.js
	var location_dot_slash_Ca4NpTMa_exports = /* @__PURE__ */ __exportAll({ default: () => e$115 });
	var e$115;
	var init_location_dot_slash_Ca4NpTMa = __esmMin((() => {
		e$115 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L454.6 420.8C486.8 366.9 512 307.3 512 252.6C512 148.4 426.1 64 320 64C259 64 204.6 92 169.4 135.6L73 39.1zM262.2 228.4C272.5 206.9 294.5 192 320 192C355.3 192 384 220.7 384 256C384 281.5 369.1 303.4 347.6 313.8L262.2 228.4zM129.2 231.1C128.4 238.2 128 245.3 128 252.6C128 371.9 248.2 514.9 298.4 569.4C310.2 582.2 329.9 582.2 341.7 569.4C356.5 553.4 377.3 529.7 399.4 501.2L129.3 231.1z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/location-dot-Cevl0QIT.js
	var location_dot_Cevl0QIT_exports = /* @__PURE__ */ __exportAll({ default: () => e$114 });
	var e$114;
	var init_location_dot_Cevl0QIT = __esmMin((() => {
		e$114 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M128 252.6C128 148.4 214 64 320 64C426 64 512 148.4 512 252.6C512 371.9 391.8 514.9 341.6 569.4C329.8 582.2 310.1 582.2 298.3 569.4C248.1 514.9 127.9 371.9 127.9 252.6zM320 320C355.3 320 384 291.3 384 256C384 220.7 355.3 192 320 192C284.7 192 256 220.7 256 256C256 291.3 284.7 320 320 320z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/lock-keyhole-open-oE32nUKL.js
	var lock_keyhole_open_oE32nUKL_exports = /* @__PURE__ */ __exportAll({ default: () => e$113 });
	var e$113;
	var init_lock_keyhole_open_oE32nUKL = __esmMin((() => {
		e$113 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M480 96C444.7 96 416 124.7 416 160L416 224L448 224C483.3 224 512 252.7 512 288L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 288C128 252.7 156.7 224 192 224L352 224L352 160C352 89.3 409.3 32 480 32C550.7 32 608 89.3 608 160L608 192C608 209.7 593.7 224 576 224C558.3 224 544 209.7 544 192L544 160C544 124.7 515.3 96 480 96zM360 424C373.3 424 384 413.3 384 400C384 386.7 373.3 376 360 376L280 376C266.7 376 256 386.7 256 400C256 413.3 266.7 424 280 424L360 424z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/lock-keyhole-Cwwkafy9.js
	var lock_keyhole_Cwwkafy9_exports = /* @__PURE__ */ __exportAll({ default: () => e$112 });
	var e$112;
	var init_lock_keyhole_Cwwkafy9 = __esmMin((() => {
		e$112 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M320 96C355.3 96 384 124.7 384 160L384 224L256 224L256 160C256 124.7 284.7 96 320 96zM192 160L192 224C156.7 224 128 252.7 128 288L128 512C128 547.3 156.7 576 192 576L448 576C483.3 576 512 547.3 512 512L512 288C512 252.7 483.3 224 448 224L448 160C448 89.3 390.7 32 320 32C249.3 32 192 89.3 192 160zM344 360L344 440C344 453.3 333.3 464 320 464C306.7 464 296 453.3 296 440L296 360C296 346.7 306.7 336 320 336C333.3 336 344 346.7 344 360z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/magnifying-glass-chart-DOmgGNYv.js
	var magnifying_glass_chart_DOmgGNYv_exports = /* @__PURE__ */ __exportAll({ default: () => e$111 });
	var e$111;
	var init_magnifying_glass_chart_DOmgGNYv = __esmMin((() => {
		e$111 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM168 280L168 344C168 357.3 178.7 368 192 368C205.3 368 216 357.3 216 344L216 280C216 266.7 205.3 256 192 256C178.7 256 168 266.7 168 280zM248 184L248 344C248 357.3 258.7 368 272 368C285.3 368 296 357.3 296 344L296 184C296 170.7 285.3 160 272 160C258.7 160 248 170.7 248 184zM328 248L328 344C328 357.3 338.7 368 352 368C365.3 368 376 357.3 376 344L376 248C376 234.7 365.3 224 352 224C338.7 224 328 234.7 328 248z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/magnifying-glass-Bl8g-W0e.js
	var magnifying_glass_Bl8g_W0e_exports = /* @__PURE__ */ __exportAll({ default: () => e$110 });
	var e$110;
	var init_magnifying_glass_Bl8g_W0e = __esmMin((() => {
		e$110 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/map-location-dot-BjSozhbd.js
	var map_location_dot_BjSozhbd_exports = /* @__PURE__ */ __exportAll({ default: () => e$109 });
	var e$109;
	var init_map_location_dot_BjSozhbd = __esmMin((() => {
		e$109 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M576 112C576 100.9 570.3 90.6 560.8 84.8C551.3 79 539.6 78.4 529.7 83.4L413.5 141.5L234.1 81.6C226 78.9 217.3 79.5 209.7 83.3L81.7 147.3C70.8 152.8 64 163.9 64 176L64 528C64 539.1 69.7 549.4 79.2 555.2C88.7 561 100.4 561.6 110.3 556.6L226.4 498.5L399.7 556.3C395.4 549.9 391.2 543.2 387.1 536.4C376.1 518.1 365.2 497.1 357.1 474.6L255.9 440.9L255.9 156.4L383.9 199.1L383.9 298.4C414.9 262.6 460.9 240 511.9 240C534.5 240 556.1 244.4 575.9 252.5L576 112zM512 288C445.7 288 392 340.8 392 405.9C392 474.8 456.1 556.3 490.6 595.2C502.2 608.2 521.9 608.2 533.5 595.2C568 556.3 632.1 474.8 632.1 405.9C632.1 340.8 578.4 288 512.1 288zM472 408C472 385.9 489.9 368 512 368C534.1 368 552 385.9 552 408C552 430.1 534.1 448 512 448C489.9 448 472 430.1 472 408z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/map-h2-GH2UD.js
	var map_h2_GH2UD_exports = /* @__PURE__ */ __exportAll({ default: () => e$108 });
	var e$108;
	var init_map_h2_GH2UD = __esmMin((() => {
		e$108 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M576 112C576 100.9 570.3 90.6 560.8 84.8C551.3 79 539.6 78.4 529.7 83.4L413.5 141.5L234.1 81.6C226 78.9 217.3 79.5 209.7 83.3L81.7 147.3C70.8 152.8 64 163.9 64 176L64 528C64 539.1 69.7 549.4 79.2 555.2C88.7 561 100.4 561.6 110.3 556.6L226.4 498.5L405.8 558.3C413.9 561 422.6 560.4 430.2 556.6L558.2 492.6C569 487.2 575.9 476.1 575.9 464L575.9 112zM256 440.9L256 156.4L384 199.1L384 483.6L256 440.9z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/masks-theater-BtWnYFfO.js
	var masks_theater_BtWnYFfO_exports = /* @__PURE__ */ __exportAll({ default: () => e$107 });
	var e$107;
	var init_masks_theater_BtWnYFfO = __esmMin((() => {
		e$107 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M27 182L55.5 343.7C69.5 423.2 131.8 485.5 211.3 499.5L224 501.7C207.5 473.1 196.9 441 193.4 407.2L169.3 411.5C159.6 413.2 150.5 405.7 152.4 396C157.2 371.3 171.5 349.4 192.1 335.1L192.1 260.5C190.7 261.3 189.1 261.8 187.4 262.1L124.4 273.2C115.7 274.7 107.1 268.8 108.5 260.1C111.6 240.5 126.9 224.1 147.6 220.4C164.8 217.4 181.5 223.9 192.2 236.2L192.2 213.5C192.2 191 199.1 161.1 224.5 140.1C250.5 118.6 292.2 96.2 349.4 85.9C318.9 69.6 263.1 53.9 185.6 67.5C105.3 81.7 57.6 117.6 35.5 143.6C26.5 154.1 24.7 168.5 27.1 182.1zM240 202.7L240 377.5C240 458.2 290.5 530.4 366.4 557.9L394.1 568C408.2 573.1 423.7 573.1 437.8 568L465.6 558C541.5 530.4 592 458.3 592 377.5L592 202.7C592 195.8 589.9 188.9 585 184.1C562.4 161.6 506.8 128.1 416 128.1C325.2 128.1 269.6 161.7 247 184.1C242.1 189 240 195.8 240 202.7zM306.1 389.8C304.7 382.8 313.1 378.8 318.8 383.2C345.7 403.8 379.4 416.1 416 416.1C452.6 416.1 486.2 403.8 513.2 383.2C518.9 378.8 527.3 382.8 525.9 389.8C515.8 441.2 470.4 480.1 416 480.1C361.6 480.1 316.2 441.3 306.1 389.8zM306.6 288.3C313.2 269.5 331 256 352 256C373 256 390.9 269.5 397.4 288.3C400.3 296.7 392.9 304 384 304L320 304C311.2 304 303.7 296.6 306.6 288.3zM512 304L448 304C439.2 304 431.7 296.6 434.6 288.3C441.1 269.5 459 256 480 256C501 256 518.9 269.5 525.4 288.3C528.3 296.7 520.9 304 512 304z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/minus-D3906KJ-.js
	var minus_D3906KJ__exports = /* @__PURE__ */ __exportAll({ default: () => e$106 });
	var e$106;
	var init_minus_D3906KJ_ = __esmMin((() => {
		e$106 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M96 320C96 302.3 110.3 288 128 288L512 288C529.7 288 544 302.3 544 320C544 337.7 529.7 352 512 352L128 352C110.3 352 96 337.7 96 320z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/moon-BjDzSOM1.js
	var moon_BjDzSOM1_exports = /* @__PURE__ */ __exportAll({ default: () => e$105 });
	var e$105;
	var init_moon_BjDzSOM1 = __esmMin((() => {
		e$105 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576C388.8 576 451.3 548.8 497.3 504.6C504.6 497.6 506.7 486.7 502.6 477.5C498.5 468.3 488.9 462.6 478.8 463.4C473.9 463.8 469 464 464 464C362.4 464 280 381.6 280 280C280 207.9 321.5 145.4 382.1 115.2C391.2 110.7 396.4 100.9 395.2 90.8C394 80.7 386.6 72.5 376.7 70.3C358.4 66.2 339.4 64 320 64z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/newspaper-BdcSDPhT.js
	var newspaper_BdcSDPhT_exports = /* @__PURE__ */ __exportAll({ default: () => e$104 });
	var e$104;
	var init_newspaper_BdcSDPhT = __esmMin((() => {
		e$104 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M64 480L64 184C64 170.7 74.7 160 88 160C101.3 160 112 170.7 112 184L112 472C112 485.3 122.7 496 136 496C149.3 496 160 485.3 160 472L160 160C160 124.7 188.7 96 224 96L512 96C547.3 96 576 124.7 576 160L576 480C576 515.3 547.3 544 512 544L128 544C92.7 544 64 515.3 64 480zM224 192L224 256C224 273.7 238.3 288 256 288L320 288C337.7 288 352 273.7 352 256L352 192C352 174.3 337.7 160 320 160L256 160C238.3 160 224 174.3 224 192zM248 432C234.7 432 224 442.7 224 456C224 469.3 234.7 480 248 480L488 480C501.3 480 512 469.3 512 456C512 442.7 501.3 432 488 432L248 432zM224 360C224 373.3 234.7 384 248 384L488 384C501.3 384 512 373.3 512 360C512 346.7 501.3 336 488 336L248 336C234.7 336 224 346.7 224 360zM424 240C410.7 240 400 250.7 400 264C400 277.3 410.7 288 424 288L488 288C501.3 288 512 277.3 512 264C512 250.7 501.3 240 488 240L424 240z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/paste-Be7BZIAO.js
	var paste_Be7BZIAO_exports = /* @__PURE__ */ __exportAll({ default: () => e$103 });
	var e$103;
	var init_paste_Be7BZIAO = __esmMin((() => {
		e$103 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M128 64C92.7 64 64 92.7 64 128L64 448C64 483.3 92.7 512 128 512L240 512L240 288C240 226.1 290.1 176 352 176L416 176L416 128C416 92.7 387.3 64 352 64L128 64zM312 176L168 176C154.7 176 144 165.3 144 152C144 138.7 154.7 128 168 128L312 128C325.3 128 336 138.7 336 152C336 165.3 325.3 176 312 176zM352 224C316.7 224 288 252.7 288 288L288 512C288 547.3 316.7 576 352 576L512 576C547.3 576 576 547.3 576 512L576 346.5C576 329.5 569.3 313.2 557.3 301.2L498.8 242.7C486.8 230.7 470.5 224 453.5 224L352 224z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/pause-BTsboZRm.js
	var pause_BTsboZRm_exports = /* @__PURE__ */ __exportAll({ default: () => e$102 });
	var e$102;
	var init_pause_BTsboZRm = __esmMin((() => {
		e$102 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M176 96C149.5 96 128 117.5 128 144L128 496C128 522.5 149.5 544 176 544L240 544C266.5 544 288 522.5 288 496L288 144C288 117.5 266.5 96 240 96L176 96zM400 96C373.5 96 352 117.5 352 144L352 496C352 522.5 373.5 544 400 544L464 544C490.5 544 512 522.5 512 496L512 144C512 117.5 490.5 96 464 96L400 96z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/pen-nib-CjeUmzA1.js
	var pen_nib_CjeUmzA1_exports = /* @__PURE__ */ __exportAll({ default: () => e$101 });
	var e$101;
	var init_pen_nib_CjeUmzA1 = __esmMin((() => {
		e$101 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M432.5 82.3L382.4 132.4L507.7 257.7L557.8 207.6C579.7 185.7 579.7 150.3 557.8 128.4L511.7 82.3C489.8 60.4 454.4 60.4 432.5 82.3zM343.3 161.2L342.8 161.3L198.7 204.5C178.8 210.5 163 225.7 156.4 245.5L67.8 509.8C64.9 518.5 65.9 528 70.3 535.8L225.7 380.4C224.6 376.4 224.1 372.3 224.1 368C224.1 341.5 245.6 320 272.1 320C298.6 320 320.1 341.5 320.1 368C320.1 394.5 298.6 416 272.1 416C267.8 416 263.6 415.4 259.7 414.4L104.3 569.7C112.1 574.1 121.5 575.1 130.3 572.2L394.6 483.6C414.3 477 429.6 461.2 435.6 441.3L478.8 297.2L478.9 296.7L343.4 161.2z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/pen-DgZaeAUN.js
	var pen_DgZaeAUN_exports = /* @__PURE__ */ __exportAll({ default: () => e$100 });
	var e$100;
	var init_pen_DgZaeAUN = __esmMin((() => {
		e$100 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M416.9 85.2L372 130.1L509.9 268L554.8 223.1C568.4 209.6 576 191.2 576 172C576 152.8 568.4 134.4 554.8 120.9L519.1 85.2C505.6 71.6 487.2 64 468 64C448.8 64 430.4 71.6 416.9 85.2zM338.1 164L122.9 379.1C112.2 389.8 104.4 403.2 100.3 417.8L64.9 545.6C62.6 553.9 64.9 562.9 71.1 569C77.3 575.1 86.2 577.5 94.5 575.2L222.3 539.7C236.9 535.6 250.2 527.9 261 517.1L476 301.9L338.1 164z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/piggy-bank-C0-XPzRn.js
	var piggy_bank_C0_XPzRn_exports = /* @__PURE__ */ __exportAll({ default: () => e$99 });
	var e$99;
	var init_piggy_bank_C0_XPzRn = __esmMin((() => {
		e$99 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M320 32C373 32 416 75 416 128C416 181 373 224 320 224C267 224 224 181 224 128C224 75 267 32 320 32zM80 368C80 297.9 127 236.6 197.1 203.1C222.4 244.4 268 272 320 272C375.7 272 424.1 240.3 448 194C463.8 182.7 483.1 176 504 176L523.5 176C533.9 176 541.5 185.8 539 195.9L521.9 264.2C531.8 276.6 540.1 289.9 546.3 304L568 304C581.3 304 592 314.7 592 328L592 440C592 453.3 581.3 464 568 464L528 464C511.5 486 489.5 503.6 464 514.7L464 544C464 561.7 449.7 576 432 576L399 576C384.7 576 372.2 566.5 368.2 552.8L361.1 528L278.8 528L271.7 552.8C267.8 566.5 255.3 576 241 576L208 576C190.3 576 176 561.7 176 544L176 514.7C119.5 490 80 433.6 80 368zM456 384C469.3 384 480 373.3 480 360C480 346.7 469.3 336 456 336C442.7 336 432 346.7 432 360C432 373.3 442.7 384 456 384z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/play-DReOgv1l.js
	var play_DReOgv1l_exports = /* @__PURE__ */ __exportAll({ default: () => e$98 });
	var e$98;
	var init_play_DReOgv1l = __esmMin((() => {
		e$98 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6C135.4 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/plus-DrVgAxHl.js
	var plus_DrVgAxHl_exports = /* @__PURE__ */ __exportAll({ default: () => e$97 });
	var e$97;
	var init_plus_DrVgAxHl = __esmMin((() => {
		e$97 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M352 128C352 110.3 337.7 96 320 96C302.3 96 288 110.3 288 128L288 288L128 288C110.3 288 96 302.3 96 320C96 337.7 110.3 352 128 352L288 352L288 512C288 529.7 302.3 544 320 544C337.7 544 352 529.7 352 512L352 352L512 352C529.7 352 544 337.7 544 320C544 302.3 529.7 288 512 288L352 288L352 128z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/right-from-bracket-igRO63UN.js
	var right_from_bracket_igRO63UN_exports = /* @__PURE__ */ __exportAll({ default: () => e$96 });
	var e$96;
	var init_right_from_bracket_igRO63UN = __esmMin((() => {
		e$96 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M569 337C578.4 327.6 578.4 312.4 569 303.1L425 159C418.1 152.1 407.8 150.1 398.8 153.8C389.8 157.5 384 166.3 384 176L384 256L272 256C245.5 256 224 277.5 224 304L224 336C224 362.5 245.5 384 272 384L384 384L384 464C384 473.7 389.8 482.5 398.8 486.2C407.8 489.9 418.1 487.9 425 481L569 337zM224 160C241.7 160 256 145.7 256 128C256 110.3 241.7 96 224 96L160 96C107 96 64 139 64 192L64 448C64 501 107 544 160 544L224 544C241.7 544 256 529.7 256 512C256 494.3 241.7 480 224 480L160 480C142.3 480 128 465.7 128 448L128 192C128 174.3 142.3 160 160 160L224 160z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/right-to-bracket-Crvv0LJV.js
	var right_to_bracket_Crvv0LJV_exports = /* @__PURE__ */ __exportAll({ default: () => e$95 });
	var e$95;
	var init_right_to_bracket_Crvv0LJV = __esmMin((() => {
		e$95 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M409 337C418.4 327.6 418.4 312.4 409 303.1L265 159C258.1 152.1 247.8 150.1 238.8 153.8C229.8 157.5 224 166.3 224 176L224 256L112 256C85.5 256 64 277.5 64 304L64 336C64 362.5 85.5 384 112 384L224 384L224 464C224 473.7 229.8 482.5 238.8 486.2C247.8 489.9 258.1 487.9 265 481L409 337zM416 480C398.3 480 384 494.3 384 512C384 529.7 398.3 544 416 544L480 544C533 544 576 501 576 448L576 192C576 139 533 96 480 96L416 96C398.3 96 384 110.3 384 128C384 145.7 398.3 160 416 160L480 160C497.7 160 512 174.3 512 192L512 448C512 465.7 497.7 480 480 480L416 480z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/school-DXlU5n2F.js
	var school_DXlU5n2F_exports = /* @__PURE__ */ __exportAll({ default: () => e$94 });
	var e$94;
	var init_school_DXlU5n2F = __esmMin((() => {
		e$94 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M32 256C32 220.7 60.7 192 96 192L160 192L287.9 76.9C306.2 60.5 333.9 60.5 352.1 76.9L480 192L544 192C579.3 192 608 220.7 608 256L608 512C608 547.3 579.3 576 544 576L96 576C60.7 576 32 547.3 32 512L32 256zM256 440L256 528L384 528L384 440C384 417.9 366.1 400 344 400L296 400C273.9 400 256 417.9 256 440zM144 448C152.8 448 160 440.8 160 432L160 400C160 391.2 152.8 384 144 384L112 384C103.2 384 96 391.2 96 400L96 432C96 440.8 103.2 448 112 448L144 448zM160 304L160 272C160 263.2 152.8 256 144 256L112 256C103.2 256 96 263.2 96 272L96 304C96 312.8 103.2 320 112 320L144 320C152.8 320 160 312.8 160 304zM528 448C536.8 448 544 440.8 544 432L544 400C544 391.2 536.8 384 528 384L496 384C487.2 384 480 391.2 480 400L480 432C480 440.8 487.2 448 496 448L528 448zM544 304L544 272C544 263.2 536.8 256 528 256L496 256C487.2 256 480 263.2 480 272L480 304C480 312.8 487.2 320 496 320L528 320C536.8 320 544 312.8 544 304zM320 320C355.3 320 384 291.3 384 256C384 220.7 355.3 192 320 192C284.7 192 256 220.7 256 256C256 291.3 284.7 320 320 320z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/screwdriver-wrench-BgMLbs4D.js
	var screwdriver_wrench_BgMLbs4D_exports = /* @__PURE__ */ __exportAll({ default: () => e$93 });
	var e$93;
	var init_screwdriver_wrench_BgMLbs4D = __esmMin((() => {
		e$93 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M102.8 57.3C108.2 51.9 116.6 51.1 123 55.3L241.9 134.5C250.8 140.4 256.1 150.4 256.1 161.1L256.1 210.7L346.9 301.5C380.2 286.5 420.8 292.6 448.1 320L574.2 446.1C592.9 464.8 592.9 495.2 574.2 514L514.1 574.1C495.4 592.8 465 592.8 446.2 574.1L320.1 448C292.7 420.6 286.6 380.1 301.6 346.8L210.8 256L161.2 256C150.5 256 140.5 250.7 134.6 241.8L55.4 122.9C51.2 116.6 52 108.1 57.4 102.7L102.8 57.3zM247.8 360.8C241.5 397.7 250.1 436.7 274 468L179.1 563C151 591.1 105.4 591.1 77.3 563C49.2 534.9 49.2 489.3 77.3 461.2L212.7 325.7L247.9 360.8zM416.1 64C436.2 64 455.5 67.7 473.2 74.5C483.2 78.3 485 91 477.5 98.6L420.8 155.3C417.8 158.3 416.1 162.4 416.1 166.6L416.1 208C416.1 216.8 423.3 224 432.1 224L473.5 224C477.7 224 481.8 222.3 484.8 219.3L541.5 162.6C549.1 155.1 561.8 156.9 565.6 166.9C572.4 184.6 576.1 203.9 576.1 224C576.1 267.2 558.9 306.3 531.1 335.1L482 286C448.9 253 403.5 240.3 360.9 247.6L304.1 190.8L304.1 161.1L303.9 156.1C303.1 143.7 299.5 131.8 293.4 121.2C322.8 86.2 366.8 64 416.1 63.9z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/signature-CzsyWKuW.js
	var signature_CzsyWKuW_exports = /* @__PURE__ */ __exportAll({ default: () => e$92 });
	var e$92;
	var init_signature_CzsyWKuW = __esmMin((() => {
		e$92 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M192 192C192 174.3 206.3 160 224 160C241.7 160 256 174.3 256 192L256 199.8C256 227.5 253.6 255.1 248.9 282.3L164.5 307.6C123.9 319.8 96.1 357.2 96.1 399.6L96.1 432L24.1 432C10.8 432 .1 442.7 .1 456C.1 469.3 10.8 480 24.1 480L96.6 480C100.8 516 131.4 544 168.6 544C194.6 544 218.6 530.1 231.5 507.5L245.4 483.2C272.2 436.2 291.9 385.5 303.8 332.7L398.2 304.4L385.7 341.9C382.4 351.7 384.1 362.4 390.1 370.7C396.1 379 405.7 384 416 384L544 384C561.7 384 576 369.7 576 352C576 334.3 561.7 320 544 320L460.4 320L478.4 266.1C482.2 254.8 479.3 242.3 471 233.7C462.7 225.1 450.3 221.9 438.8 225.3L316.4 262.1C318.8 241.4 320 220.7 320 199.8L320 192C320 139 277 96 224 96C171 96 128 139 128 192L128 224C128 241.7 142.3 256 160 256C177.7 256 192 241.7 192 224L192 192zM182.8 369L231.8 354.3C221.4 388.1 207.3 420.7 189.7 451.5L175.8 475.8C174.3 478.4 171.5 480.1 168.4 480.1C163.7 480.1 159.9 476.3 159.9 471.6L159.9 399.7C159.9 385.6 169.2 373.1 182.7 369zM616 480C629.3 480 640 469.3 640 456C640 442.7 629.3 432 616 432L323.1 432C316.6 448.3 309.4 464.3 301.5 480L616 480z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/sliders-D3E8Jgqn.js
	var sliders_D3E8Jgqn_exports = /* @__PURE__ */ __exportAll({ default: () => e$91 });
	var e$91;
	var init_sliders_D3E8Jgqn = __esmMin((() => {
		e$91 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M96 128C78.3 128 64 142.3 64 160C64 177.7 78.3 192 96 192L182.7 192C195 220.3 223.2 240 256 240C288.8 240 317 220.3 329.3 192L544 192C561.7 192 576 177.7 576 160C576 142.3 561.7 128 544 128L329.3 128C317 99.7 288.8 80 256 80C223.2 80 195 99.7 182.7 128L96 128zM96 288C78.3 288 64 302.3 64 320C64 337.7 78.3 352 96 352L342.7 352C355 380.3 383.2 400 416 400C448.8 400 477 380.3 489.3 352L544 352C561.7 352 576 337.7 576 320C576 302.3 561.7 288 544 288L489.3 288C477 259.7 448.8 240 416 240C383.2 240 355 259.7 342.7 288L96 288zM96 448C78.3 448 64 462.3 64 480C64 497.7 78.3 512 96 512L150.7 512C163 540.3 191.2 560 224 560C256.8 560 285 540.3 297.3 512L544 512C561.7 512 576 497.7 576 480C576 462.3 561.7 448 544 448L297.3 448C285 419.7 256.8 400 224 400C191.2 400 163 419.7 150.7 448L96 448z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/snowflake-Dw4MlfCK.js
	var snowflake_Dw4MlfCK_exports = /* @__PURE__ */ __exportAll({ default: () => e$90 });
	var e$90;
	var init_snowflake_Dw4MlfCK = __esmMin((() => {
		e$90 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M352.2 64C352.2 46.3 337.9 32 320.2 32C302.5 32 288.2 46.3 288.2 64L288.2 126.1L273.2 111.1C263.8 101.7 248.6 101.7 239.3 111.1C230 120.5 229.9 135.7 239.3 145L288.3 194L288.3 264.6L227.1 229.3L209.2 162.4C205.8 149.6 192.6 142 179.8 145.4C167 148.8 159.3 162 162.7 174.8L168.2 195.3L114.5 164.3C99.2 155.5 79.6 160.7 70.8 176C62 191.3 67.2 210.9 82.5 219.7L136.2 250.7L115.7 256.2C102.9 259.6 95.3 272.8 98.7 285.6C102.1 298.4 115.3 306 128.1 302.6L195 284.7L256.2 320L195 355.3L128.1 337.4C115.3 334 102.1 341.6 98.7 354.4C95.3 367.2 102.9 380.4 115.7 383.8L136.2 389.3L82.5 420.3C67.2 429.1 62 448.7 70.8 464C79.6 479.3 99.2 484.6 114.5 475.7L168.2 444.7L162.7 465.2C159.3 478 166.9 491.2 179.7 494.6C192.5 498 205.7 490.4 209.1 477.6L227 410.7L288.2 375.4L288.2 446L239.2 495C229.8 504.4 229.8 519.6 239.2 528.9C248.6 538.2 263.8 538.3 273.1 528.9L288.1 513.9L288.1 576C288.1 593.7 302.4 608 320.1 608C337.8 608 352.1 593.7 352.1 576L352.1 513.9L367.1 528.9C376.5 538.3 391.7 538.3 401 528.9C410.3 519.5 410.4 504.3 401 495L352 446L352 375.4L413.2 410.7L431.1 477.6C434.5 490.4 447.7 498 460.5 494.6C473.3 491.2 480.9 478 477.5 465.2L472 444.7L525.7 475.7C541 484.5 560.6 479.3 569.4 464C578.2 448.7 573 429.1 557.7 420.3L504 389.3L524.5 383.8C537.3 380.4 544.9 367.2 541.5 354.4C538.1 341.6 524.9 334 512.1 337.4L445.2 355.3L384 320L445.2 284.7L512.1 302.6C524.9 306 538.1 298.4 541.5 285.6C544.9 272.8 537.3 259.6 524.5 256.2L504 250.7L557.7 219.7C573 210.9 578.3 191.3 569.4 176C560.5 160.7 541 155.5 525.7 164.3L472 195.3L477.5 174.8C480.9 162 473.3 148.8 460.5 145.4C447.7 142 434.5 149.6 431.1 162.4L413.2 229.3L352 264.6L352 194L401 145C410.4 135.6 410.4 120.4 401 111.1C391.6 101.8 376.4 101.7 367.1 111.1L352.1 126.1L352.1 64z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/spell-check-Che8oy8R.js
	var spell_check_Che8oy8R_exports = /* @__PURE__ */ __exportAll({ default: () => e$89 });
	var e$89;
	var init_spell_check_Che8oy8R = __esmMin((() => {
		e$89 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M152 96C103.4 96 64 135.4 64 184L64 352C64 369.7 78.3 384 96 384C113.7 384 128 369.7 128 352L128 288L192 288L192 352C192 369.7 206.3 384 224 384C241.7 384 256 369.7 256 352L256 184C256 135.4 216.6 96 168 96L152 96zM192 224L128 224L128 184C128 170.7 138.7 160 152 160L168 160C181.3 160 192 170.7 192 184L192 224zM336 96C318.3 96 304 110.3 304 128L304 352C304 369.7 318.3 384 336 384L408 384C456.6 384 496 344.6 496 296C496 272.4 486.7 251 471.6 235.2C481.9 220.8 488 203.1 488 184C488 135.4 448.6 96 400 96L336 96zM400 208L368 208L368 160L400 160C413.3 160 424 170.7 424 184C424 197.3 413.3 208 400 208zM368 320L368 272L408 272C421.3 272 432 282.7 432 296C432 309.3 421.3 320 408 320L368 320zM601 404C612 390.2 609.8 370.1 596 359C582.2 347.9 562.1 350.2 551 364L445.3 496.1L406.6 457.4C394.1 444.9 373.8 444.9 361.3 457.4C348.8 469.9 348.8 490.2 361.3 502.7L425.3 566.7C431.7 573.1 440.6 576.5 449.7 576C458.8 575.5 467.2 571.1 472.9 564L601 404z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/spinner-B_nV7Uuk.js
	var spinner_B_nV7Uuk_exports = /* @__PURE__ */ __exportAll({ default: () => e$88 });
	var e$88;
	var init_spinner_B_nV7Uuk = __esmMin((() => {
		e$88 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M272 112C272 85.5 293.5 64 320 64C346.5 64 368 85.5 368 112C368 138.5 346.5 160 320 160C293.5 160 272 138.5 272 112zM272 528C272 501.5 293.5 480 320 480C346.5 480 368 501.5 368 528C368 554.5 346.5 576 320 576C293.5 576 272 554.5 272 528zM112 272C138.5 272 160 293.5 160 320C160 346.5 138.5 368 112 368C85.5 368 64 346.5 64 320C64 293.5 85.5 272 112 272zM480 320C480 293.5 501.5 272 528 272C554.5 272 576 293.5 576 320C576 346.5 554.5 368 528 368C501.5 368 480 346.5 480 320zM139 433.1C157.8 414.3 188.1 414.3 206.9 433.1C225.7 451.9 225.7 482.2 206.9 501C188.1 519.8 157.8 519.8 139 501C120.2 482.2 120.2 451.9 139 433.1zM139 139C157.8 120.2 188.1 120.2 206.9 139C225.7 157.8 225.7 188.1 206.9 206.9C188.1 225.7 157.8 225.7 139 206.9C120.2 188.1 120.2 157.8 139 139zM501 433.1C519.8 451.9 519.8 482.2 501 501C482.2 519.8 451.9 519.8 433.1 501C414.3 482.2 414.3 451.9 433.1 433.1C451.9 414.3 482.2 414.3 501 433.1z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/stop-BpCOKHxg.js
	var stop_BpCOKHxg_exports = /* @__PURE__ */ __exportAll({ default: () => e$87 });
	var e$87;
	var init_stop_BpCOKHxg = __esmMin((() => {
		e$87 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M160 96L480 96C515.3 96 544 124.7 544 160L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 160C96 124.7 124.7 96 160 96z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/sun-DtxBlK4W.js
	var sun_DtxBlK4W_exports = /* @__PURE__ */ __exportAll({ default: () => e$86 });
	var e$86;
	var init_sun_DtxBlK4W = __esmMin((() => {
		e$86 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M320 32C328.4 32 336.3 36.4 340.6 43.7L396.1 136.3L500.9 110C509.1 108 517.8 110.4 523.7 116.3C529.6 122.2 532 131 530 139.1L503.7 243.8L596.4 299.3C603.6 303.6 608.1 311.5 608.1 319.9C608.1 328.3 603.7 336.2 596.4 340.5L503.7 396.1L530 500.8C532 509 529.6 517.7 523.7 523.6C517.8 529.5 509 532 500.9 530L396.2 503.7L340.7 596.4C336.4 603.6 328.5 608.1 320.1 608.1C311.7 608.1 303.8 603.7 299.5 596.4L243.9 503.7L139.2 530C131 532 122.4 529.6 116.4 523.7C110.4 517.8 108 509 110 500.8L136.2 396.1L43.6 340.6C36.4 336.2 32 328.4 32 320C32 311.6 36.4 303.7 43.7 299.4L136.3 243.9L110 139.1C108 130.9 110.3 122.3 116.3 116.3C122.3 110.3 131 108 139.2 110L243.9 136.2L299.4 43.6L301.2 41C305.7 35.3 312.6 31.9 320 31.9zM320 176C240.5 176 176 240.5 176 320C176 399.5 240.5 464 320 464C399.5 464 464 399.5 464 320C464 240.5 399.5 176 320 176zM320 416C267 416 224 373 224 320C224 267 267 224 320 224C373 224 416 267 416 320C416 373 373 416 320 416z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/tag-rZw8vML1.js
	var tag_rZw8vML1_exports = /* @__PURE__ */ __exportAll({ default: () => e$85 });
	var e$85;
	var init_tag_rZw8vML1 = __esmMin((() => {
		e$85 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M96.5 160L96.5 309.5C96.5 326.5 103.2 342.8 115.2 354.8L307.2 546.8C332.2 571.8 372.7 571.8 397.7 546.8L547.2 397.3C572.2 372.3 572.2 331.8 547.2 306.8L355.2 114.8C343.2 102.7 327 96 310 96L160.5 96C125.2 96 96.5 124.7 96.5 160zM208.5 176C226.2 176 240.5 190.3 240.5 208C240.5 225.7 226.2 240 208.5 240C190.8 240 176.5 225.7 176.5 208C176.5 190.3 190.8 176 208.5 176z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/trash-can-arrow-up-C1YpdzEK.js
	var trash_can_arrow_up_C1YpdzEK_exports = /* @__PURE__ */ __exportAll({ default: () => e$84 });
	var e$84;
	var init_trash_can_arrow_up_C1YpdzEK = __esmMin((() => {
		e$84 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M263.1 48L377 48C390.8 48 403 56.8 407.4 69.9L416 96L512 96C529.7 96 544 110.3 544 128C544 145.7 529.7 160 512 160L128 160C110.3 160 96 145.7 96 128C96 110.3 110.3 96 128 96L224 96L232.7 69.9C237.1 56.8 249.3 48 263.1 48zM128 208L512 208L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 208zM337 287C327.6 277.6 312.4 277.6 303.1 287L231.1 359C221.7 368.4 221.7 383.6 231.1 392.9C240.5 402.2 255.7 402.3 265 392.9L296 361.9L296 464C296 477.3 306.7 488 320 488C333.3 488 344 477.3 344 464L344 361.9L375 392.9C384.4 402.3 399.6 402.3 408.9 392.9C418.2 383.5 418.3 368.3 408.9 359L336.9 287z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/trash-can-CAwatGyo.js
	var trash_can_CAwatGyo_exports = /* @__PURE__ */ __exportAll({ default: () => e$83 });
	var e$83;
	var init_trash_can_CAwatGyo = __esmMin((() => {
		e$83 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M232.7 69.9C237.1 56.8 249.3 48 263.1 48L377 48C390.8 48 403 56.8 407.4 69.9L416 96L512 96C529.7 96 544 110.3 544 128C544 145.7 529.7 160 512 160L128 160C110.3 160 96 145.7 96 128C96 110.3 110.3 96 128 96L224 96L232.7 69.9zM128 208L512 208L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 208zM216 272C202.7 272 192 282.7 192 296L192 488C192 501.3 202.7 512 216 512C229.3 512 240 501.3 240 488L240 296C240 282.7 229.3 272 216 272zM320 272C306.7 272 296 282.7 296 296L296 488C296 501.3 306.7 512 320 512C333.3 512 344 501.3 344 488L344 296C344 282.7 333.3 272 320 272zM424 272C410.7 272 400 282.7 400 296L400 488C400 501.3 410.7 512 424 512C437.3 512 448 501.3 448 488L448 296C448 282.7 437.3 272 424 272z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/triangle-exclamation-BN5cU1XS.js
	var triangle_exclamation_BN5cU1XS_exports = /* @__PURE__ */ __exportAll({ default: () => e$82 });
	var e$82;
	var init_triangle_exclamation_BN5cU1XS = __esmMin((() => {
		e$82 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M320 64C334.7 64 348.2 72.1 355.2 85L571.2 485C577.9 497.4 577.6 512.4 570.4 524.5C563.2 536.6 550.1 544 536 544L104 544C89.9 544 76.8 536.6 69.6 524.5C62.4 512.4 62.1 497.4 68.8 485L284.8 85C291.8 72.1 305.3 64 320 64zM320 416C302.3 416 288 430.3 288 448C288 465.7 302.3 480 320 480C337.7 480 352 465.7 352 448C352 430.3 337.7 416 320 416zM320 224C301.8 224 287.3 239.5 288.6 257.7L296 361.7C296.9 374.2 307.4 384 319.9 384C332.5 384 342.9 374.3 343.8 361.7L351.2 257.7C352.5 239.5 338.1 224 319.8 224z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/universal-access-T8WpSzGi.js
	var universal_access_T8WpSzGi_exports = /* @__PURE__ */ __exportAll({ default: () => e$81 });
	var e$81;
	var init_universal_access_T8WpSzGi = __esmMin((() => {
		e$81 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320zM225.5 233.9C213.3 228.7 199.2 234.3 194 246.5C188.8 258.7 194.4 272.8 206.6 278L218.5 283.1C235.8 290.5 253.7 296 272.1 299.4L272.1 349.5C272.1 353.8 271.4 358.1 270 362.1L241.3 448.2C237.1 460.8 243.9 474.4 256.5 478.6C269.1 482.8 282.7 476 286.9 463.4L311.3 390.2C312.6 386.4 316.1 383.8 320.1 383.8C324.1 383.8 327.7 386.4 328.9 390.2L353.3 463.4C357.5 476 371.1 482.8 383.7 478.6C396.3 474.4 403 461 398.8 448.4L370.1 362.3C368.7 358.2 368 354 368 349.7L368 299.6C386.4 296.1 404.3 290.7 421.6 283.3L433.5 278.2C445.7 273 451.3 258.9 446.1 246.7C440.9 234.5 426.8 228.9 414.6 234.1L402.7 239C376.6 250.2 348.5 256 320 256C291.5 256 263.5 250.2 237.3 239L225.4 233.9zM320 224C342.1 224 360 206.1 360 184C360 161.9 342.1 144 320 144C297.9 144 280 161.9 280 184C280 206.1 297.9 224 320 224z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/user-gear-D8w2iwsB.js
	var user_gear_D8w2iwsB_exports = /* @__PURE__ */ __exportAll({ default: () => e$80 });
	var e$80;
	var init_user_gear_D8w2iwsB = __esmMin((() => {
		e$80 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M256.5 72C322.8 72 376.5 125.7 376.5 192C376.5 258.3 322.8 312 256.5 312C190.2 312 136.5 258.3 136.5 192C136.5 125.7 190.2 72 256.5 72zM226.7 368L286.1 368L287.6 368C274.7 394.8 279.8 426.2 299.1 447.5C278.9 469.8 274.3 503.3 289.7 530.9L312.2 571.3C313.1 572.9 314.1 574.5 315.1 576L78.1 576C61.7 576 48.4 562.7 48.4 546.3C48.4 447.8 128.2 368 226.7 368zM432.6 311.6C432.6 298.3 443.3 287.6 456.6 287.6L504.6 287.6C517.9 287.6 528.6 298.3 528.6 311.6L528.6 317.7C528.6 336.6 552.7 350.5 569.1 341.1L574.1 338.2C585.7 331.5 600.6 335.6 607.1 347.3L629.5 387.5C635.7 398.7 632.1 412.7 621.3 419.5L616.6 422.4C600.4 432.5 600.4 462.3 616.6 472.5L621.2 475.4C632 482.2 635.7 496.2 629.5 507.4L607 547.8C600.5 559.5 585.6 563.7 574 556.9L569.1 554C552.7 544.5 528.6 558.5 528.6 577.4L528.6 583.5C528.6 596.8 517.9 607.5 504.6 607.5L456.6 607.5C443.3 607.5 432.6 596.8 432.6 583.5L432.6 577.6C432.6 558.6 408.4 544.6 391.9 554.1L387.1 556.9C375.5 563.6 360.7 559.5 354.1 547.8L331.5 507.4C325.3 496.2 328.9 482.1 339.8 475.3L344.2 472.6C360.5 462.5 360.5 432.5 344.2 422.4L339.7 419.6C328.8 412.8 325.2 398.7 331.4 387.5L353.9 347.2C360.4 335.5 375.3 331.4 386.8 338.1L391.6 340.9C408.1 350.4 432.3 336.4 432.3 317.4L432.3 311.5zM532.5 447.8C532.5 419.1 509.2 395.8 480.5 395.8C451.8 395.8 428.5 419.1 428.5 447.8C428.5 476.5 451.8 499.8 480.5 499.8C509.2 499.8 532.5 476.5 532.5 447.8z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/user-minus-CIlkj7Gz.js
	var user_minus_CIlkj7Gz_exports = /* @__PURE__ */ __exportAll({ default: () => e$79 });
	var e$79;
	var init_user_minus_CIlkj7Gz = __esmMin((() => {
		e$79 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M285.7 368C384.2 368 464 447.8 464 546.3C464 562.7 450.7 576 434.3 576L77.7 576C61.3 576 48 562.7 48 546.3C48 447.8 127.8 368 226.3 368L285.7 368zM256 312C189.7 312 136 258.3 136 192C136 125.7 189.7 72 256 72C322.3 72 376 125.7 376 192C376 258.3 322.3 312 256 312zM600 216C613.3 216 624 226.7 624 240C624 253.3 613.3 264 600 264L456 264C442.7 264 432 253.3 432 240C432 226.7 442.7 216 456 216L600 216z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/user-plus-DnAEQGGj.js
	var user_plus_DnAEQGGj_exports = /* @__PURE__ */ __exportAll({ default: () => e$78 });
	var e$78;
	var init_user_plus_DnAEQGGj = __esmMin((() => {
		e$78 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M285.7 368C384.2 368 464 447.8 464 546.3C464 562.7 450.7 576 434.3 576L77.7 576C61.3 576 48 562.7 48 546.3C48 447.8 127.8 368 226.3 368L285.7 368zM528 144C541.3 144 552 154.7 552 168L552 216L600 216C613.3 216 624 226.7 624 240C624 253.3 613.3 264 600 264L552 264L552 312C552 325.3 541.3 336 528 336C514.7 336 504 325.3 504 312L504 264L456 264C442.7 264 432 253.3 432 240C432 226.7 442.7 216 456 216L504 216L504 168C504 154.7 514.7 144 528 144zM256 312C189.7 312 136 258.3 136 192C136 125.7 189.7 72 256 72C322.3 72 376 125.7 376 192C376 258.3 322.3 312 256 312z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/user-shield-DZSvuf-O.js
	var user_shield_DZSvuf_O_exports = /* @__PURE__ */ __exportAll({ default: () => e$77 });
	var e$77;
	var init_user_shield_DZSvuf_O = __esmMin((() => {
		e$77 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M256 312C322.3 312 376 258.3 376 192C376 125.7 322.3 72 256 72C189.7 72 136 125.7 136 192C136 258.3 189.7 312 256 312zM226.3 368C127.8 368 48 447.8 48 546.3C48 562.7 61.3 576 77.7 576L329.2 576C293 533.4 272 478.5 272 420.4L272 389.3C272 382 273 374.8 274.9 368L226.3 368zM477.3 552.5L464 558.8L464 370.7L560 402.7L560 422.3C560 478.1 527.8 528.8 477.3 552.6zM453.9 323.5L341.9 360.8C328.8 365.2 320 377.4 320 391.2L320 422.3C320 496.7 363 564.4 430.2 596L448.7 604.7C453.5 606.9 458.7 608.1 463.9 608.1C469.1 608.1 474.4 606.9 479.1 604.7L497.6 596C565 564.3 608 496.6 608 422.2L608 391.1C608 377.3 599.2 365.1 586.1 360.7L474.1 323.4C467.5 321.2 460.4 321.2 453.9 323.4z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/user-Dbawbhc8.js
	var user_Dbawbhc8_exports = /* @__PURE__ */ __exportAll({ default: () => e$76 });
	var e$76;
	var init_user_Dbawbhc8 = __esmMin((() => {
		e$76 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M320 312C386.3 312 440 258.3 440 192C440 125.7 386.3 72 320 72C253.7 72 200 125.7 200 192C200 258.3 253.7 312 320 312zM290.3 368C191.8 368 112 447.8 112 546.3C112 562.7 125.3 576 141.7 576L498.3 576C514.7 576 528 562.7 528 546.3C528 447.8 448.2 368 349.7 368L290.3 368z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/users-BuC3Q-Ub.js
	var users_BuC3Q_Ub_exports = /* @__PURE__ */ __exportAll({ default: () => e$75 });
	var e$75;
	var init_users_BuC3Q_Ub = __esmMin((() => {
		e$75 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M320 80C377.4 80 424 126.6 424 184C424 241.4 377.4 288 320 288C262.6 288 216 241.4 216 184C216 126.6 262.6 80 320 80zM96 152C135.8 152 168 184.2 168 224C168 263.8 135.8 296 96 296C56.2 296 24 263.8 24 224C24 184.2 56.2 152 96 152zM0 480C0 409.3 57.3 352 128 352C140.8 352 153.2 353.9 164.9 357.4C132 394.2 112 442.8 112 496L112 512C112 523.4 114.4 534.2 118.7 544L32 544C14.3 544 0 529.7 0 512L0 480zM521.3 544C525.6 534.2 528 523.4 528 512L528 496C528 442.8 508 394.2 475.1 357.4C486.8 353.9 499.2 352 512 352C582.7 352 640 409.3 640 480L640 512C640 529.7 625.7 544 608 544L521.3 544zM472 224C472 184.2 504.2 152 544 152C583.8 152 616 184.2 616 224C616 263.8 583.8 296 544 296C504.2 296 472 263.8 472 224zM160 496C160 407.6 231.6 336 320 336C408.4 336 480 407.6 480 496L480 512C480 529.7 465.7 544 448 544L192 544C174.3 544 160 529.7 160 512L160 496z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/xmark-BZTIYV9s.js
	var xmark_BZTIYV9s_exports = /* @__PURE__ */ __exportAll({ default: () => e$74 });
	var e$74;
	var init_xmark_BZTIYV9s = __esmMin((() => {
		e$74 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--!Font Awesome Free 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d=\"M183.1 137.4C170.6 124.9 150.3 124.9 137.8 137.4C125.3 149.9 125.3 170.2 137.8 182.7L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7L320.5 365.3L457.9 502.6C470.4 515.1 490.7 515.1 503.2 502.6C515.7 490.1 515.7 469.8 503.2 457.3L365.8 320L503.1 182.6C515.6 170.1 515.6 149.8 503.1 137.3C490.6 124.8 470.3 124.8 457.8 137.3L320.5 274.7L183.1 137.4z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/bell-e5MrnlWO.js
	var bell_e5MrnlWO_exports = /* @__PURE__ */ __exportAll({ default: () => e$73 });
	var e$73;
	var init_bell_e5MrnlWO = __esmMin((() => {
		e$73 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M320 64C306.7 64 296 74.7 296 88L296 97.7C214.6 109.3 152 179.4 152 264L152 278.5C152 316.2 142 353.2 123 385.8L101.1 423.2C97.8 429 96 435.5 96 442.2C96 463.1 112.9 480 133.8 480L506.2 480C527.1 480 544 463.1 544 442.2C544 435.5 542.2 428.9 538.9 423.2L517 385.7C498 353.1 488 316.1 488 278.4L488 263.9C488 179.3 425.4 109.2 344 97.6L344 87.9C344 74.6 333.3 63.9 320 63.9zM488.4 432L151.5 432L164.4 409.9C187.7 370 200 324.6 200 278.5L200 264C200 197.7 253.7 144 320 144C386.3 144 440 197.7 440 264L440 278.5C440 324.7 452.3 370 475.5 409.9L488.4 432zM252.1 528C262 556 288.7 576 320 576C351.3 576 378 556 387.9 528L252.1 528z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/bolt-v2RhFbf7.js
	var bolt_v2RhFbf7_exports = /* @__PURE__ */ __exportAll({ default: () => e$72 });
	var e$72;
	var init_bolt_v2RhFbf7 = __esmMin((() => {
		e$72 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M437.2 51.9C446.3 57.9 450.2 69.2 446.8 79.5L388 256L508.9 256C528.3 256 544 271.7 544 291.1C544 301.1 539.8 310.6 532.3 317.2L232 585.9C223.9 593.2 211.9 594.1 202.8 588.1C193.7 582.1 189.8 570.8 193.2 560.5L252 384L131.1 384C111.7 384 96 368.3 96 348.9C96 339 100.2 329.5 107.7 322.8L408 54.1C416.1 46.8 428.1 46 437.2 51.9zM164.9 336L285.3 336C293 336 300.3 339.7 304.8 346C309.3 352.3 310.5 360.3 308.1 367.6L267.3 489.9L475.1 304L354.7 304C347 304 339.7 300.3 335.2 294C330.7 287.7 329.5 279.7 331.9 272.4L372.7 150.1L164.9 336z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/book-copy-BF5w1D3i.js
	var book_copy_BF5w1D3i_exports = /* @__PURE__ */ __exportAll({ default: () => e$71 });
	var e$71;
	var init_book_copy_BF5w1D3i = __esmMin((() => {
		e$71 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M256 152C256 103.4 295.4 64 344 64L536 64C575.8 64 608 96.2 608 136L608 264C608 289 595.3 311 576 323.9L576 400L584 400C597.3 400 608 410.7 608 424C608 437.3 597.3 448 584 448L336 448C291.8 448 256 412.2 256 368L256 152zM336 336C318.3 336 304 350.3 304 368C304 385.7 318.3 400 336 400L528 400L528 336L336 336zM304 294.7C313.8 290.4 324.6 288 336 288L536 288C549.3 288 560 277.3 560 264L560 136C560 122.7 549.3 112 536 112L344 112C321.9 112 304 129.9 304 152L304 294.7zM120 192L208 192L208 240L120 240C97.9 240 80 257.9 80 280L80 422.7C89.8 418.4 100.6 416 112 416L217.3 416C224.8 434.6 236.6 451 251.3 464L112 464C94.3 464 80 478.3 80 496C80 513.7 94.3 528 112 528L304 528L304 492C314.2 494.6 325 496 336 496L352 496L352 528L360 528C373.3 528 384 538.7 384 552C384 565.3 373.3 576 360 576L112 576C67.8 576 32 540.2 32 496L32 280C32 231.4 71.4 192 120 192z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/book-open-lines-CVPng4Mb.js
	var book_open_lines_CVPng4Mb_exports = /* @__PURE__ */ __exportAll({ default: () => e$70 });
	var e$70;
	var init_book_open_lines_CVPng4Mb = __esmMin((() => {
		e$70 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M276.4 169.8L296 178L296 522.4C248.4 505 198 496 147.2 496L112 496L112 144L147.2 144C191.6 144 235.5 152.8 276.4 169.8zM492.8 496C442 496 391.6 505 344 522.4L344 178L363.6 169.8C404.5 152.8 448.4 144 492.8 144L528 144L528 496L492.8 496zM320 136L294.9 125.5C248.1 106 197.9 96 147.2 96L112 96C85.5 96 64 117.5 64 144L64 496C64 522.5 85.5 544 112 544L147.2 544C197.9 544 248.1 554 294.9 573.5L307.7 578.8C315.6 582.1 324.4 582.1 332.3 578.8L345.1 573.5C391.9 554 442.1 544 492.8 544L528 544C554.5 544 576 522.5 576 496L576 144C576 117.5 554.5 96 528 96L492.8 96C442.1 96 391.9 106 345.1 125.5L320 136zM168 192C154.7 192 144 202.7 144 216C144 229.3 154.7 240 168 240L172.2 240C192 240 211.5 244.6 229.2 253.5C241.1 259.4 255.5 254.6 261.4 242.8C267.3 231 262.5 216.5 250.7 210.6C226.3 198.4 199.4 192.1 172.2 192.1L168 192.1zM467.8 192C440.5 192 413.7 198.3 389.3 210.5C377.4 216.4 372.6 230.8 378.6 242.7C384.6 254.6 398.9 259.4 410.8 253.4C428.5 244.5 448 239.9 467.8 239.9L472 239.9C485.3 239.9 496 229.2 496 215.9C496 202.6 485.3 191.9 472 191.9L467.8 191.9zM168 288C154.7 288 144 298.7 144 312C144 325.3 154.7 336 168 336L172.2 336C192 336 211.5 340.6 229.2 349.5C241.1 355.4 255.5 350.6 261.4 338.8C267.3 327 262.5 312.5 250.7 306.6C226.3 294.4 199.4 288.1 172.2 288.1L168 288.1zM467.8 288C440.5 288 413.7 294.3 389.3 306.5C377.4 312.4 372.6 326.8 378.6 338.7C384.6 350.6 398.9 355.4 410.8 349.4C428.5 340.5 448 335.9 467.8 335.9L472 335.9C485.3 335.9 496 325.2 496 311.9C496 298.6 485.3 287.9 472 287.9L467.8 287.9zM168 384C154.7 384 144 394.7 144 408C144 421.3 154.7 432 168 432L172.2 432C192 432 211.5 436.6 229.2 445.5C241.1 451.4 255.5 446.6 261.4 434.8C267.3 423 262.5 408.5 250.7 402.6C226.3 390.4 199.4 384.1 172.2 384.1L168 384.1zM467.8 384C440.5 384 413.7 390.3 389.3 402.5C377.4 408.4 372.6 422.8 378.6 434.7C384.6 446.6 398.9 451.4 410.8 445.4C428.5 436.5 448 431.9 467.8 431.9L472 431.9C485.3 431.9 496 421.2 496 407.9C496 394.6 485.3 383.9 472 383.9L467.8 383.9z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/books-XjOCaF3o.js
	var books_XjOCaF3o_exports = /* @__PURE__ */ __exportAll({ default: () => e$69 });
	var e$69;
	var init_books_XjOCaF3o = __esmMin((() => {
		e$69 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M128.3 112L176.3 112C185.1 112 192.3 119.2 192.3 128L192.3 160L112.3 160L112.3 128C112.3 119.2 119.5 112 128.3 112zM112.3 208L192.3 208L192.3 432L112.3 432L112.3 208zM240.3 130L240.3 128C240.3 92.7 211.6 64 176.3 64L128.3 64C93 64 64.3 92.7 64.3 128L64.3 512C64.3 547.3 93 576 128.3 576L176.3 576C191.4 576 205.3 570.7 216.3 562C227.3 570.8 241.2 576 256.3 576L304.3 576C339.6 576 368.3 547.3 368.3 512L368.3 347.6L416.9 528.8C426 562.9 461.1 583.2 495.3 574.1L541.7 561.7C575.8 552.6 596.1 517.5 587 483.3L487.4 112.3C478.3 78.2 443.2 57.9 409 67.1L362.7 79.5C338.3 86 320.9 105.9 316.4 129.2C312.5 128.4 308.4 128.1 304.3 128.1L256.3 128.1C250.8 128.1 245.4 128.8 240.3 130.1zM240.3 192C240.3 183.2 247.5 176 256.3 176L304.3 176C313.1 176 320.3 183.2 320.3 192L320.3 512C320.3 520.8 313.1 528 304.3 528L256.3 528C247.5 528 240.3 520.8 240.3 512L240.3 192zM192.3 512C192.3 520.8 185.1 528 176.3 528L128.3 528C119.5 528 112.3 520.8 112.3 512L112.3 480L192.3 480L192.3 512zM421.5 113.4C430 111.1 438.8 116.2 441.1 124.7L449.4 155.6L372.1 176.3L363.8 145.4C361.5 136.9 366.6 128.1 375.1 125.8L421.5 113.4zM442.5 439.1L384.5 222.7L461.8 202L519.8 418.4L442.5 439.1zM454.9 485.5L532.2 464.8L540.5 495.7C542.8 504.2 537.7 513 529.2 515.3L482.8 527.7C474.3 530 465.5 524.9 463.2 516.4L454.9 485.5z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/box-archive-BlLuAmbT.js
	var box_archive_BlLuAmbT_exports = /* @__PURE__ */ __exportAll({ default: () => e$68 });
	var e$68;
	var init_box_archive_BlLuAmbT = __esmMin((() => {
		e$68 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M528 144L528 208L112 208L112 144L528 144zM64 208C64 228.9 77.4 246.7 96 253.3L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 253.3C562.6 246.7 576 228.9 576 208L576 144C576 117.5 554.5 96 528 96L112 96C85.5 96 64 117.5 64 144L64 208zM144 480L144 256L496 256L496 480C496 488.8 488.8 496 480 496L160 496C151.2 496 144 488.8 144 480zM248 304C234.7 304 224 314.7 224 328C224 341.3 234.7 352 248 352L392 352C405.3 352 416 341.3 416 328C416 314.7 405.3 304 392 304L248 304z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/brake-warning-DQ41PPaA.js
	var brake_warning_DQ41PPaA_exports = /* @__PURE__ */ __exportAll({ default: () => e$67 });
	var e$67;
	var init_brake_warning_DQ41PPaA = __esmMin((() => {
		e$67 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M320 544C196.3 544 96 443.7 96 320C96 196.3 196.3 96 320 96C443.7 96 544 196.3 544 320C544 443.7 443.7 544 320 544zM50.8 147C58 135.9 72.8 132.6 84 139.8C95.1 147 98.4 161.8 91.2 173C63.9 215.4 48.1 265.8 48.1 320C48.1 374.2 63.8 424.6 91.1 467C98.3 478.1 95.1 493 83.9 500.2C72.8 507.4 57.9 504.1 50.7 493C18.6 443.1-.1 383.7-.1 320C-.1 256.3 18.6 196.9 50.8 147zM556.1 139.8C567.2 132.6 582.1 135.9 589.3 147C621.4 196.9 640 256.3 640 320C640 383.7 621.4 443.1 589.3 493C582.1 504.1 567.3 507.4 556.1 500.2C545 493 541.7 478.2 548.9 467C576.2 424.6 592 374.2 592 320C592 265.8 576.2 215.4 548.9 173C541.7 161.9 544.9 147 556.1 139.8zM320 144C222.8 144 144 222.8 144 320C144 417.2 222.8 496 320 496C417.2 496 496 417.2 496 320C496 222.8 417.2 144 320 144zM320 448C302.3 448 288 433.7 288 416C288 398.3 302.3 384 320 384C337.7 384 352 398.3 352 416C352 433.7 337.7 448 320 448zM320 192C338.2 192 352.7 207.5 351.4 225.7L344 329.7C343.1 342.3 332.6 352 320.1 352C307.5 352 297.1 342.3 296.2 329.7L288.8 225.7C287.3 207.5 301.8 192 320 192z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/bug-Z2-E6KK1.js
	var bug_Z2_E6KK1_exports = /* @__PURE__ */ __exportAll({ default: () => e$66 });
	var e$66;
	var init_bug_Z2_E6KK1 = __esmMin((() => {
		e$66 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M320 64C267 64 224 107 224 160L224 163.6C224 179.3 236.7 192 252.4 192L387.5 192C403.2 192 415.9 179.3 415.9 163.6L415.9 160C415.9 107 372.9 64 319.9 64zM432 344L432 416C432 469.6 394.3 514.4 344 525.4L344 360C344 346.7 333.3 336 320 336C306.7 336 296 346.7 296 360L296 525.4C245.7 514.4 208 469.6 208 416L208 344C208 313.1 233.1 288 264 288L376 288C406.9 288 432 313.1 432 344zM179.8 282.9C170.3 296 163.8 311.3 161.2 328L56 328C42.7 328 32 338.7 32 352C32 365.3 42.7 376 56 376L160 376L160 416C160 422.5 160.4 428.9 161.1 435.1L73.6 500.8C63 508.8 60.8 523.8 68.8 534.4C76.8 545 91.8 547.2 102.4 539.2L175.4 484.5C201 538.6 256.1 576 320 576C383.9 576 439 538.6 464.6 484.5L537.6 539.2C548.2 547.2 563.2 545 571.2 534.4C579.2 523.8 577 508.8 566.4 500.8L478.9 435.1C479.6 428.8 480 422.4 480 416L480 376L584 376C597.3 376 608 365.3 608 352C608 338.7 597.3 328 584 328L478.8 328C476.2 311.3 469.7 296 460.2 282.9L566.4 203.2C577 195.2 579.2 180.2 571.2 169.6C563.2 159 548.2 156.8 537.6 164.8L422.6 251C408.6 243.9 392.7 240 376 240L264 240C247.2 240 231.4 244 217.4 251L102.4 164.8C91.8 156.8 76.8 159 68.8 169.6C60.8 180.2 63 195.2 73.6 203.2L179.8 282.9z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/calendar-days-CZDQ_8k8.js
	var calendar_days_CZDQ_8k8_exports = /* @__PURE__ */ __exportAll({ default: () => e$65 });
	var e$65;
	var init_calendar_days_CZDQ_8k8 = __esmMin((() => {
		e$65 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M216 64C229.3 64 240 74.7 240 88L240 128L400 128L400 88C400 74.7 410.7 64 424 64C437.3 64 448 74.7 448 88L448 128L480 128C515.3 128 544 156.7 544 192L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 192C96 156.7 124.7 128 160 128L192 128L192 88C192 74.7 202.7 64 216 64zM480 496C488.8 496 496 488.8 496 480L496 416L408 416L408 496L480 496zM496 368L496 288L408 288L408 368L496 368zM360 368L360 288L280 288L280 368L360 368zM232 368L232 288L144 288L144 368L232 368zM144 416L144 480C144 488.8 151.2 496 160 496L232 496L232 416L144 416zM280 416L280 496L360 496L360 416L280 416zM216 176L160 176C151.2 176 144 183.2 144 192L144 240L496 240L496 192C496 183.2 488.8 176 480 176L216 176z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/calendar-xmark-DL26Mjko.js
	var calendar_xmark_DL26Mjko_exports = /* @__PURE__ */ __exportAll({ default: () => e$64 });
	var e$64;
	var init_calendar_xmark_DL26Mjko = __esmMin((() => {
		e$64 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M216 64C229.3 64 240 74.7 240 88L240 128L400 128L400 88C400 74.7 410.7 64 424 64C437.3 64 448 74.7 448 88L448 128L480 128C515.3 128 544 156.7 544 192L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 192C96 156.7 124.7 128 160 128L192 128L192 88C192 74.7 202.7 64 216 64zM216 176L160 176C151.2 176 144 183.2 144 192L144 480C144 488.8 151.2 496 160 496L480 496C488.8 496 496 488.8 496 480L496 192C496 183.2 488.8 176 480 176L216 176zM387.9 268.1C397.3 277.5 397.3 292.7 387.9 302L354 335.9L387.9 369.8C397.3 379.2 397.3 394.4 387.9 403.7C378.5 413 363.3 413.1 354 403.7L320.1 369.8L286.2 403.7C276.8 413.1 261.6 413.1 252.3 403.7C243 394.3 242.9 379.1 252.3 369.8L286.2 335.9L252.3 302C242.9 292.6 242.9 277.4 252.3 268.1C261.7 258.8 276.9 258.7 286.2 268.1L320.1 302L354 268.1C363.4 258.7 378.6 258.7 387.9 268.1z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/cart-shopping-CnSBnQky.js
	var cart_shopping_CnSBnQky_exports = /* @__PURE__ */ __exportAll({ default: () => e$63 });
	var e$63;
	var init_cart_shopping_CnSBnQky = __esmMin((() => {
		e$63 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M0 72C0 58.7 10.7 48 24 48L69.3 48C96.4 48 119.6 67.4 124.4 94L124.8 96L524.7 96C549.8 96 568.7 118.9 564 143.6L537.6 280.6C529.6 322 493.4 352 451.2 352L171.4 352L176.5 380.3C178.6 391.7 188.5 400 200.1 400L456 400C469.3 400 480 410.7 480 424C480 437.3 469.3 448 456 448L200.1 448C165.3 448 135.5 423.1 129.3 388.9L77.2 102.6C76.5 98.8 73.2 96 69.3 96L24 96C10.7 96 0 85.3 0 72zM162.6 304L451.2 304C470.4 304 486.9 290.4 490.5 271.6L514.9 144L133.5 144L162.6 304zM208 480C234.5 480 256 501.5 256 528C256 554.5 234.5 576 208 576C181.5 576 160 554.5 160 528C160 501.5 181.5 480 208 480zM432 480C458.5 480 480 501.5 480 528C480 554.5 458.5 576 432 576C405.5 576 384 554.5 384 528C384 501.5 405.5 480 432 480z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/circle-check-CHVlSwVT.js
	var circle_check_CHVlSwVT_exports = /* @__PURE__ */ __exportAll({ default: () => e$62 });
	var e$62;
	var init_circle_check_CHVlSwVT = __esmMin((() => {
		e$62 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576zM320 112C205.1 112 112 205.1 112 320C112 434.9 205.1 528 320 528C434.9 528 528 434.9 528 320C528 205.1 434.9 112 320 112zM390.7 233.9C398.5 223.2 413.5 220.8 424.2 228.6C434.9 236.4 437.3 251.4 429.5 262.1L307.4 430.1C303.3 435.8 296.9 439.4 289.9 439.9C282.9 440.4 276 437.9 271.1 433L215.2 377.1C205.8 367.7 205.8 352.5 215.2 343.2C224.6 333.9 239.8 333.8 249.1 343.2L285.1 379.2L390.7 234z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/circle-exclamation-CIuOM0Tl.js
	var circle_exclamation_CIuOM0Tl_exports = /* @__PURE__ */ __exportAll({ default: () => e$61 });
	var e$61;
	var init_circle_exclamation_CIuOM0Tl = __esmMin((() => {
		e$61 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576zM320 112C205.1 112 112 205.1 112 320C112 434.9 205.1 528 320 528C434.9 528 528 434.9 528 320C528 205.1 434.9 112 320 112zM320 448C302.3 448 288 433.7 288 416C288 398.3 302.3 384 320 384C337.7 384 352 398.3 352 416C352 433.7 337.7 448 320 448zM320 192C338.2 192 352.7 207.5 351.4 225.7L344 329.7C343.1 342.3 332.6 352 320.1 352C307.5 352 297.1 342.3 296.2 329.7L288.8 225.7C287.3 207.5 301.8 192 320 192z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/circle-info-D2b-QMvU.js
	var circle_info_D2b_QMvU_exports = /* @__PURE__ */ __exportAll({ default: () => e$60 });
	var e$60;
	var init_circle_info_D2b_QMvU = __esmMin((() => {
		e$60 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M320 112C434.9 112 528 205.1 528 320C528 434.9 434.9 528 320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112zM320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM280 400C266.7 400 256 410.7 256 424C256 437.3 266.7 448 280 448L360 448C373.3 448 384 437.3 384 424C384 410.7 373.3 400 360 400L352 400L352 312C352 298.7 341.3 288 328 288L280 288C266.7 288 256 298.7 256 312C256 325.3 266.7 336 280 336L304 336L304 400L280 400zM320 256C337.7 256 352 241.7 352 224C352 206.3 337.7 192 320 192C302.3 192 288 206.3 288 224C288 241.7 302.3 256 320 256z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/circle-question-BxXZZFMr.js
	var circle_question_BxXZZFMr_exports = /* @__PURE__ */ __exportAll({ default: () => e$59 });
	var e$59;
	var init_circle_question_BxXZZFMr = __esmMin((() => {
		e$59 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M528 320C528 205.1 434.9 112 320 112C205.1 112 112 205.1 112 320C112 434.9 205.1 528 320 528C434.9 528 528 434.9 528 320zM64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320zM320 240C302.3 240 288 254.3 288 272C288 285.3 277.3 296 264 296C250.7 296 240 285.3 240 272C240 227.8 275.8 192 320 192C364.2 192 400 227.8 400 272C400 319.2 364 339.2 344 346.5L344 350.3C344 363.6 333.3 374.3 320 374.3C306.7 374.3 296 363.6 296 350.3L296 342.2C296 321.7 310.8 307 326.1 302C332.5 299.9 339.3 296.5 344.3 291.7C348.6 287.5 352 281.7 352 272.1C352 254.4 337.7 240.1 320 240.1zM288 432C288 414.3 302.3 400 320 400C337.7 400 352 414.3 352 432C352 449.7 337.7 464 320 464C302.3 464 288 449.7 288 432z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/circle-Cho_Vemi.js
	var circle_Cho_Vemi_exports = /* @__PURE__ */ __exportAll({ default: () => e$58 });
	var e$58;
	var init_circle_Cho_Vemi = __esmMin((() => {
		e$58 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M528 320C528 205.1 434.9 112 320 112C205.1 112 112 205.1 112 320C112 434.9 205.1 528 320 528C434.9 528 528 434.9 528 320zM64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/clipboard-list-6arODTov.js
	var clipboard_list_6arODTov_exports = /* @__PURE__ */ __exportAll({ default: () => e$57 });
	var e$57;
	var init_clipboard_list_6arODTov = __esmMin((() => {
		e$57 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M280 160L360 160C373.3 160 384 149.3 384 136C384 122.7 373.3 112 360 112L280 112C266.7 112 256 122.7 256 136C256 149.3 266.7 160 280 160zM280 208C242.9 208 212.4 180 208.4 144L192 144C183.2 144 176 151.2 176 160L176 512C176 520.8 183.2 528 192 528L448 528C456.8 528 464 520.8 464 512L464 160C464 151.2 456.8 144 448 144L431.6 144C427.6 180 397.1 208 360 208L280 208zM360 64C385 64 407 76.7 419.9 96L448 96C483.3 96 512 124.7 512 160L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 160C128 124.7 156.7 96 192 96L220.1 96C233 76.7 255 64 280 64L360 64zM208 320C208 302.3 222.3 288 240 288C257.7 288 272 302.3 272 320C272 337.7 257.7 352 240 352C222.3 352 208 337.7 208 320zM304 320C304 306.7 314.7 296 328 296L408 296C421.3 296 432 306.7 432 320C432 333.3 421.3 344 408 344L328 344C314.7 344 304 333.3 304 320zM304 416C304 402.7 314.7 392 328 392L408 392C421.3 392 432 402.7 432 416C432 429.3 421.3 440 408 440L328 440C314.7 440 304 429.3 304 416zM240 384C257.7 384 272 398.3 272 416C272 433.7 257.7 448 240 448C222.3 448 208 433.7 208 416C208 398.3 222.3 384 240 384z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/clock-DNvJIAIL.js
	var clock_DNvJIAIL_exports = /* @__PURE__ */ __exportAll({ default: () => e$56 });
	var e$56;
	var init_clock_DNvJIAIL = __esmMin((() => {
		e$56 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M528 320C528 434.9 434.9 528 320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112C434.9 112 528 205.1 528 320zM64 320C64 461.4 178.6 576 320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320zM296 184L296 320C296 328 300 335.5 306.7 340L402.7 404C413.7 411.4 428.6 408.4 436 397.3C443.4 386.2 440.4 371.4 429.3 364L344 307.2L344 184C344 170.7 333.3 160 320 160C306.7 160 296 170.7 296 184z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/coins-DlK4cVCs.js
	var coins_DlK4cVCs_exports = /* @__PURE__ */ __exportAll({ default: () => e$55 });
	var e$55;
	var init_coins_DlK4cVCs = __esmMin((() => {
		e$55 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M384 64C432.9 64 477.9 72.4 511.6 85.7C528.3 92.3 543.4 100.6 554.7 110.5C565.7 120.2 576 134.2 576 152L576 360C576 377.8 565.6 391.8 554.7 401.5C543.4 411.5 528.4 419.7 511.6 426.3C506.6 428.3 501.4 430.1 496 431.8L496 380.8C508.6 375.6 517.5 370.2 522.9 365.4C526.8 362 527.8 360 528 359.4L528 319.2C518.2 323.3 507.4 326.9 496 330L496 279.9C503.8 277.3 510.7 274.6 516.5 271.7C521.4 269.3 525.1 267 528 265L528 212.3C522.7 214.9 517.1 217.3 511.3 219.5C502.2 223 492.2 226.1 481.6 228.7C474.9 217.5 466.7 208.4 458.9 201.4C453.6 196.6 448 192.3 442.1 188.4C492.6 182.2 527.9 168.1 527.9 151.8C527.9 131.8 463.4 111.8 383.9 111.8C314.8 111.8 257.1 126.9 243.1 144C225.7 144.4 208.6 145.7 192 147.9C193.4 132 203 119.3 213.2 110.4C224.5 100.4 239.5 92.2 256.3 85.6C290 72.3 335 63.9 383.9 63.9zM128.4 213.7C162.1 200.4 207.1 192 256 192C304.9 192 349.9 200.4 383.6 213.7C400.3 220.3 415.4 228.6 426.7 238.5C437.7 248.2 448 262.2 448 280L448 488C448 505.8 437.6 519.8 426.7 529.5C415.4 539.5 400.4 547.7 383.6 554.3C349.9 567.6 304.9 576 256 576C207.1 576 162.1 567.6 128.4 554.3C111.7 547.7 96.6 539.4 85.3 529.5C74.3 519.8 64 505.8 64 488L64 280C64 262.2 74.4 248.2 85.3 238.5C96.6 228.5 111.6 220.3 128.4 213.7zM383.3 347.7C349.6 360.5 304.5 368 256 368C207.5 368 162.4 360.5 128.7 347.7C122.9 345.5 117.3 343.1 112 340.5L112 393.2C114.8 395.3 118.6 397.5 123.5 399.9C132.6 404.4 144.3 408.6 158.2 412.3C185.9 419.6 220.4 424.1 256 424.1C291.6 424.1 326.1 419.6 353.8 412.3C367.7 408.6 379.4 404.4 388.5 399.9C393.4 397.5 397.1 395.2 400 393.2L400 340.5C394.7 343.1 389.1 345.5 383.3 347.7zM112 447.3L112 487.5C112.2 488.1 113.2 490.1 117.1 493.5C122.8 498.5 132.4 504.3 146 509.7C173.1 520.4 212.1 528 256 528C299.9 528 338.8 520.4 366 509.7C379.7 504.3 389.2 498.6 394.9 493.5C398.8 490.1 399.8 488.1 400 487.5L400 447.3C389.6 451.7 378.2 455.4 366.1 458.6C334 467.1 295.3 471.9 256 471.9C216.7 471.9 178.1 467 146 458.6C133.9 455.4 122.4 451.6 112 447.3zM400 280C400 260 335.5 240 256 240C176.5 240 112 260 112 280C112 302.1 176.5 320 256 320C335.5 320 400 302.1 400 280z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/copy-DACr2-w5.js
	var copy_DACr2_w5_exports = /* @__PURE__ */ __exportAll({ default: () => e$54 });
	var e$54;
	var init_copy_DACr2_w5 = __esmMin((() => {
		e$54 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M480 400L288 400C279.2 400 272 392.8 272 384L272 128C272 119.2 279.2 112 288 112L421.5 112C425.7 112 429.8 113.7 432.8 116.7L491.3 175.2C494.3 178.2 496 182.3 496 186.5L496 384C496 392.8 488.8 400 480 400zM288 448L480 448C515.3 448 544 419.3 544 384L544 186.5C544 169.5 537.3 153.2 525.3 141.2L466.7 82.7C454.7 70.7 438.5 64 421.5 64L288 64C252.7 64 224 92.7 224 128L224 384C224 419.3 252.7 448 288 448zM160 192C124.7 192 96 220.7 96 256L96 512C96 547.3 124.7 576 160 576L352 576C387.3 576 416 547.3 416 512L416 496L368 496L368 512C368 520.8 360.8 528 352 528L160 528C151.2 528 144 520.8 144 512L144 256C144 247.2 151.2 240 160 240L176 240L176 192L160 192z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/download-QTjjWPQU.js
	var download_QTjjWPQU_exports = /* @__PURE__ */ __exportAll({ default: () => e$53 });
	var e$53;
	var init_download_QTjjWPQU = __esmMin((() => {
		e$53 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M344 88C344 74.7 333.3 64 320 64C306.7 64 296 74.7 296 88L296 334.1L233 271.1C223.6 261.7 208.4 261.7 199.1 271.1C189.8 280.5 189.7 295.7 199.1 305L303 409C312.4 418.4 327.6 418.4 336.9 409L441 305C450.4 295.6 450.4 280.4 441 271.1C431.6 261.8 416.4 261.7 407.1 271.1L344.1 334.1L344.1 88zM162.2 336L160 336C124.7 336 96 364.7 96 400L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 400C544 364.7 515.3 336 480 336L477.8 336L429.8 384L480 384C488.8 384 496 391.2 496 400L496 480C496 488.8 488.8 496 480 496L160 496C151.2 496 144 488.8 144 480L144 400C144 391.2 151.2 384 160 384L210.2 384L162.2 336zM464 440C464 426.7 453.3 416 440 416C426.7 416 416 426.7 416 440C416 453.3 426.7 464 440 464C453.3 464 464 453.3 464 440z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/earth-americas-C_ZJ_ghj.js
	var earth_americas_C_ZJ_ghj_exports = /* @__PURE__ */ __exportAll({ default: () => e$52 });
	var e$52;
	var init_earth_americas_C_ZJ_ghj = __esmMin((() => {
		e$52 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M320 528C205.1 528 112 434.9 112 320C112 298 115.4 276.9 121.7 257L131.1 273.4C139.4 287.9 153 298.6 169.1 303.2L227 319.7C244.2 324.6 256 340.3 256 358.2L256 398.1C256 409.1 262.2 419.1 272 424C281.8 428.9 288 438.9 288 449.9L288 480.3C288 496.2 303.2 507.6 318.5 503.3C334.4 498.8 346.8 486.3 351.3 470.5L352.8 465.1C357.4 449 368.1 435.4 382.6 427.1L391.8 421.8C406.8 413.3 416 397.3 416 380.1L416 371.8C416 359.1 410.9 346.9 401.9 337.9L398 334C389 325 376.8 319.9 364.1 319.9L321 320C309.9 320 298.9 317.1 289.2 311.6L254.7 291.9C250.4 289.4 247.1 285.4 245.5 280.7C242.3 271.1 246.6 260.7 255.7 256.2L261.6 253.2C268.2 249.9 275.9 249.3 282.9 251.7L306.1 259.4C314.3 262.1 323.3 259 328 251.9C332.7 244.9 332.2 235.6 326.8 229.1L313.2 212.8C303.2 200.8 303.3 183.3 313.5 171.5L329.2 153.2C338 142.9 339.4 128.2 332.7 116.5L330.3 112.3C403.9 115.9 467.5 157.9 501.5 218.6L476 228.8C460.3 235.1 452.2 252.6 457.5 268.6L474.4 319.3C477.9 329.7 486.4 337.6 497 340.2L526.1 347.5C512.7 449.4 425.5 528 320 528zM320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/envelope-open-Czvww-my.js
	var envelope_open_Czvww_my_exports = /* @__PURE__ */ __exportAll({ default: () => e$51 });
	var e$51;
	var init_envelope_open_Czvww_my = __esmMin((() => {
		e$51 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M576 480C576 515.3 547.5 544 512.1 544L128 544C92.6 544 64 515.3 64 480L64 228C64.1 212.5 71.8 198 84.5 189.2L270 61.3C300.1 40.6 339.8 40.6 369.9 61.3L555.5 189.2C568.3 198 575.9 212.5 576 228L576 480zM128 496L512.1 496C520.9 496 528 488.9 528 480L528 288.3L373.2 405.7C341.8 429.6 298.3 429.6 266.8 405.7L112 288.3L112 480C112 488.9 119.2 496 128 496zM527.6 228.4L342.7 100.8C329 91.4 311 91.4 297.3 100.8L112.4 228.4L295.8 367.5C310.1 378.3 329.9 378.3 344.2 367.5L527.6 228.4z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/eye-slash-Bwe6zXbJ.js
	var eye_slash_Bwe6zXbJ_exports = /* @__PURE__ */ __exportAll({ default: () => e$50 });
	var e$50;
	var init_eye_slash_Bwe6zXbJ = __esmMin((() => {
		e$50 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L504.5 470.8C507.2 468.4 509.9 466 512.5 463.6C559.3 420.1 590.6 368.2 605.5 332.5C608.8 324.6 608.8 315.8 605.5 307.9C590.6 272.2 559.3 220.2 512.5 176.8C465.4 133.1 400.7 96.2 319.9 96.2C263.1 96.2 214.3 114.4 173.9 140.4L73 39.1zM208.9 175.1C241 156.2 278.1 144 320 144C385.2 144 438.8 173.6 479.9 211.7C518.4 247.4 545 290 558.5 320C544.9 350 518.3 392.5 479.9 428.3C476.8 431.1 473.7 433.9 470.5 436.7L425.8 392C439.8 371.5 448 346.7 448 320C448 249.3 390.7 192 320 192C293.3 192 268.5 200.2 248 214.2L208.9 175.1zM390.9 357.1L282.9 249.1C294 243.3 306.6 240 320 240C364.2 240 400 275.8 400 320C400 333.4 396.7 346 390.9 357.1zM135.4 237.2L101.4 203.2C68.8 240 46.4 279 34.5 307.7C31.2 315.6 31.2 324.4 34.5 332.3C49.4 368 80.7 420 127.5 463.4C174.6 507.1 239.3 544 320.1 544C357.4 544 391.3 536.1 421.6 523.4L384.2 486C364.2 492.4 342.8 496 320 496C254.8 496 201.2 466.4 160.1 428.3C121.6 392.6 95 350 81.5 320C91.9 296.9 110.1 266.4 135.5 237.2z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/eye-CB-xpcOG.js
	var eye_CB_xpcOG_exports = /* @__PURE__ */ __exportAll({ default: () => e$49 });
	var e$49;
	var init_eye_CB_xpcOG = __esmMin((() => {
		e$49 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M320 144C254.8 144 201.2 173.6 160.1 211.7C121.6 247.5 95 290 81.4 320C95 350 121.6 392.5 160.1 428.3C201.2 466.4 254.8 496 320 496C385.2 496 438.8 466.4 479.9 428.3C518.4 392.5 545 350 558.6 320C545 290 518.4 247.5 479.9 211.7C438.8 173.6 385.2 144 320 144zM127.4 176.6C174.5 132.8 239.2 96 320 96C400.8 96 465.5 132.8 512.6 176.6C559.4 220.1 590.7 272 605.6 307.7C608.9 315.6 608.9 324.4 605.6 332.3C590.7 368 559.4 420 512.6 463.4C465.5 507.1 400.8 544 320 544C239.2 544 174.5 507.2 127.4 463.4C80.6 419.9 49.3 368 34.4 332.3C31.1 324.4 31.1 315.6 34.4 307.7C49.3 272 80.6 220 127.4 176.6zM320 400C364.2 400 400 364.2 400 320C400 290.4 383.9 264.5 360 250.7C358.6 310.4 310.4 358.6 250.7 360C264.5 383.9 290.4 400 320 400zM240.4 311.6C242.9 311.9 245.4 312 248 312C283.3 312 312 283.3 312 248C312 245.4 311.8 242.9 311.6 240.4C274.2 244.3 244.4 274.1 240.5 311.5zM286 196.6C296.8 193.6 308.2 192.1 319.9 192.1C328.7 192.1 337.4 193 345.7 194.7C346 194.8 346.2 194.8 346.5 194.9C404.4 207.1 447.9 258.6 447.9 320.1C447.9 390.8 390.6 448.1 319.9 448.1C258.3 448.1 206.9 404.6 194.7 346.7C192.9 338.1 191.9 329.2 191.9 320.1C191.9 309.1 193.3 298.3 195.9 288.1C196.1 287.4 196.2 286.8 196.4 286.2C208.3 242.8 242.5 208.6 285.9 196.7z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/feather-BCpP7wmd.js
	var feather_BCpP7wmd_exports = /* @__PURE__ */ __exportAll({ default: () => e$48 });
	var e$48;
	var init_feather_BCpP7wmd = __esmMin((() => {
		e$48 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M375.9 230.1L176 430.1L176 394C176 338.8 197.9 285.9 236.9 246.9L340.7 143.2C360.7 123.2 387.8 112 416 112C444.2 112 471.3 123.2 491.3 143.2L496.8 148.7C516.8 168.7 528 195.8 528 224C528 240.8 524 257.3 516.6 272L402 272L409.9 264.1C419.3 254.7 419.3 239.5 409.9 230.2C400.5 220.9 385.3 220.8 376 230.2zM353.9 320L476.1 320L428.1 368L305.9 368L353.9 320zM378.8 416C341.6 446.9 294.6 464 245.9 464L209.9 464L257.9 416L378.8 416zM128 394L128 478L71 535C61.6 544.4 61.6 559.6 71 568.9C80.4 578.2 95.6 578.3 104.9 568.9L161.9 511.9L245.9 511.9C313.8 511.9 378.9 484.9 426.9 436.9L530.7 333.3C559.7 304.3 576 265 576 224C576 183 559.7 143.7 530.7 114.7L525.2 109.2C496.3 80.3 457 64 416 64C375 64 335.7 80.3 306.7 109.3L203 213C155 261 128 326.1 128 394z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/file-export-BUqKuCEF.js
	var file_export_BUqKuCEF_exports = /* @__PURE__ */ __exportAll({ default: () => e$47 });
	var e$47;
	var init_file_export_BUqKuCEF = __esmMin((() => {
		e$47 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M240.5 112L128.5 112C119.7 112 112.5 119.2 112.5 128L112.5 512C112.5 520.8 119.7 528 128.5 528L384.5 528C393.3 528 400.5 520.8 400.5 512L400.5 464L448.5 464L448.5 512C448.5 547.3 419.8 576 384.5 576L128.5 576C93.2 576 64.5 547.3 64.5 512L64.5 128C64.5 92.7 93.2 64 128.5 64L262 64C279 64 295.3 70.7 307.3 82.7L429.8 205.3C441.8 217.3 448.5 233.6 448.5 250.6L448.5 320.1L400.5 320.1L400.5 272.1L312.5 272.1C272.7 272.1 240.5 239.9 240.5 200.1L240.5 112.1zM312.5 368L526.6 368L495.6 337C486.2 327.6 486.2 312.4 495.6 303.1C505 293.8 520.2 293.7 529.5 303.1L601.5 375.1C610.9 384.5 610.9 399.7 601.5 409L529.5 481C520.1 490.4 504.9 490.4 495.6 481C486.3 471.6 486.2 456.4 495.6 447.1L526.6 416.1L312.5 416.1C299.2 416.1 288.5 405.4 288.5 392.1C288.5 378.8 299.2 368.1 312.5 368.1zM380.6 224L288.5 131.9L288.5 200C288.5 213.3 299.2 224 312.5 224L380.6 224z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/file-lines-7Qakw2FC.js
	var file_lines_7Qakw2FC_exports = /* @__PURE__ */ __exportAll({ default: () => e$46 });
	var e$46;
	var init_file_lines_7Qakw2FC = __esmMin((() => {
		e$46 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M192 112L304 112L304 200C304 239.8 336.2 272 376 272L464 272L464 512C464 520.8 456.8 528 448 528L192 528C183.2 528 176 520.8 176 512L176 128C176 119.2 183.2 112 192 112zM352 131.9L444.1 224L376 224C362.7 224 352 213.3 352 200L352 131.9zM192 64C156.7 64 128 92.7 128 128L128 512C128 547.3 156.7 576 192 576L448 576C483.3 576 512 547.3 512 512L512 250.5C512 233.5 505.3 217.2 493.3 205.2L370.7 82.7C358.7 70.7 342.5 64 325.5 64L192 64zM248 320C234.7 320 224 330.7 224 344C224 357.3 234.7 368 248 368L392 368C405.3 368 416 357.3 416 344C416 330.7 405.3 320 392 320L248 320zM248 416C234.7 416 224 426.7 224 440C224 453.3 234.7 464 248 464L392 464C405.3 464 416 453.3 416 440C416 426.7 405.3 416 392 416L248 416z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/file-magnifying-glass-DPPJVXvG.js
	var file_magnifying_glass_DPPJVXvG_exports = /* @__PURE__ */ __exportAll({ default: () => e$45 });
	var e$45;
	var init_file_magnifying_glass_DPPJVXvG = __esmMin((() => {
		e$45 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M192 112L304 112L304 200C304 239.8 336.2 272 376 272L464 272L464 512C464 520.8 456.8 528 448 528L192 528C183.2 528 176 520.8 176 512L176 128C176 119.2 183.2 112 192 112zM352 131.9L444.1 224L376 224C362.7 224 352 213.3 352 200L352 131.9zM192 64C156.7 64 128 92.7 128 128L128 512C128 547.3 156.7 576 192 576L448 576C483.3 576 512 547.3 512 512L512 250.5C512 233.5 505.3 217.2 493.3 205.2L370.7 82.7C358.7 70.7 342.5 64 325.5 64L192 64zM390.5 384C390.5 336.2 351.8 297.5 304 297.5C256.2 297.5 217.5 336.2 217.5 384C217.5 431.8 256.2 470.5 304 470.5C319.2 470.5 333.4 466.6 345.8 459.8L383 497.1C392.4 506.5 407.6 506.5 416.9 497.2C426.2 487.9 426.3 472.6 417 463.3L379.8 425.9C386.7 413.5 390.6 399.2 390.6 384.1zM304 342C327.2 342 346 360.8 346 384C346 407.2 327.2 426 304 426C280.8 426 262 407.2 262 384C262 360.8 280.8 342 304 342z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/file-pdf-BZk9go-v.js
	var file_pdf_BZk9go_v_exports = /* @__PURE__ */ __exportAll({ default: () => e$44 });
	var e$44;
	var init_file_pdf_BZk9go_v = __esmMin((() => {
		e$44 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M240 112L128 112C119.2 112 112 119.2 112 128L112 512C112 520.8 119.2 528 128 528L208 528L208 576L128 576C92.7 576 64 547.3 64 512L64 128C64 92.7 92.7 64 128 64L261.5 64C278.5 64 294.8 70.7 306.8 82.7L429.3 205.3C441.3 217.3 448 233.6 448 250.6L448 400.1L400 400.1L400 272.1L312 272.1C272.2 272.1 240 239.9 240 200.1L240 112.1zM380.1 224L288 131.9L288 200C288 213.3 298.7 224 312 224L380.1 224zM272 444L304 444C337.1 444 364 470.9 364 504C364 537.1 337.1 564 304 564L292 564L292 592C292 603 283 612 272 612C261 612 252 603 252 592L252 464C252 453 261 444 272 444zM304 524C315 524 324 515 324 504C324 493 315 484 304 484L292 484L292 524L304 524zM400 444L432 444C460.7 444 484 467.3 484 496L484 560C484 588.7 460.7 612 432 612L400 612C389 612 380 603 380 592L380 464C380 453 389 444 400 444zM432 572C438.6 572 444 566.6 444 560L444 496C444 489.4 438.6 484 432 484L420 484L420 572L432 572zM508 464C508 453 517 444 528 444L576 444C587 444 596 453 596 464C596 475 587 484 576 484L548 484L548 508L576 508C587 508 596 517 596 528C596 539 587 548 576 548L548 548L548 592C548 603 539 612 528 612C517 612 508 603 508 592L508 464z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/filter-slash-B0v_aw-_.js
	var filter_slash_B0v_aw___exports = /* @__PURE__ */ __exportAll({ default: () => e$43 });
	var e$43;
	var init_filter_slash_B0v_aw__ = __esmMin((() => {
		e$43 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L399.9 366.2L399.9 346L567.2 178.7C572.8 173.1 575.9 165.6 575.9 157.7C575.9 141.3 562.6 128 546.2 128L161.8 128L73 39.1zM209.8 176L502 176L359 319L355.9 322.1L209.8 176zM240 345.9L240 345.9L240 448C240 454.4 242.5 460.5 247 465L349.4 567.3C355 572.9 362.5 576 370.4 576C386.8 576 400.1 562.7 400.1 546.3L400.1 501.8L352.1 453.8L352.1 502L288.1 438L288.1 389.8L240.1 341.8L240.1 345.9z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/filter-F3rVsP6f.js
	var filter_F3rVsP6f_exports = /* @__PURE__ */ __exportAll({ default: () => e$42 });
	var e$42;
	var init_filter_F3rVsP6f = __esmMin((() => {
		e$42 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M64 157.7C64 141.3 77.3 128 93.7 128L546.4 128C562.8 128 576.1 141.3 576.1 157.7C576.1 165.6 573 173.1 567.4 178.7L400 345.9L400 546.3C400 562.7 386.7 576 370.3 576C362.4 576 354.9 572.9 349.3 567.3L247 465C242.5 460.5 240 454.4 240 448L240 345.9L72.7 178.6C67.1 173.1 64 165.5 64 157.7zM137.9 176L281 319C285.5 323.5 288 329.6 288 336L288 438.1L352 502.1L352 336C352 329.6 354.5 323.5 359 319L502 176L137.9 176z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/folder-open-w_vZrsM1.js
	var folder_open_w_vZrsM1_exports = /* @__PURE__ */ __exportAll({ default: () => e$41 });
	var e$41;
	var init_folder_open_w_vZrsM1 = __esmMin((() => {
		e$41 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M129.5 464L179.5 304L558.9 304L508.9 464L129.5 464zM320.2 512L509 512C530 512 548.6 498.4 554.8 478.3L604.8 318.3C614.5 287.4 591.4 256 559 256L179.6 256C158.6 256 140 269.6 133.8 289.7L112.2 358.4L112.2 160C112.2 151.2 119.4 144 128.2 144L266.9 144C270.4 144 273.7 145.1 276.5 147.2L314.9 176C328.7 186.4 345.6 192 362.9 192L480.2 192C489 192 496.2 199.2 496.2 208L544.2 208C544.2 172.7 515.5 144 480.2 144L362.9 144C356 144 349.2 141.8 343.7 137.6L305.3 108.8C294.2 100.5 280.8 96 266.9 96L128.2 96C92.9 96 64.2 124.7 64.2 160L64.2 448C64.2 483.3 92.9 512 128.2 512L320.2 512z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/folder-user-DKrzEqKO.js
	var folder_user_DKrzEqKO_exports = /* @__PURE__ */ __exportAll({ default: () => e$40 });
	var e$40;
	var init_folder_user_DKrzEqKO = __esmMin((() => {
		e$40 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M512 464L128 464C119.2 464 112 456.8 112 448L112 160C112 151.2 119.2 144 128 144L266.7 144C270.2 144 273.5 145.1 276.3 147.2L314.7 176C328.5 186.4 345.4 192 362.7 192L512 192C520.8 192 528 199.2 528 208L528 448C528 456.8 520.8 464 512 464zM128 512L512 512C547.3 512 576 483.3 576 448L576 208C576 172.7 547.3 144 512 144L362.7 144C355.8 144 349 141.8 343.5 137.6L305.1 108.8C294 100.5 280.5 96 266.7 96L128 96C92.7 96 64 124.7 64 160L64 448C64 483.3 92.7 512 128 512zM320 336C346.5 336 368 314.5 368 288C368 261.5 346.5 240 320 240C293.5 240 272 261.5 272 288C272 314.5 293.5 336 320 336zM242.5 388.6C231.4 400.2 242.6 416 258.6 416L381.3 416C397.3 416 408.5 400.1 397.4 388.6C385.3 375.9 368.2 368 349.2 368L290.5 368C271.6 368 254.5 375.9 242.3 388.6z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/folder-BWoXBYdf.js
	var folder_BWoXBYdf_exports = /* @__PURE__ */ __exportAll({ default: () => e$39 });
	var e$39;
	var init_folder_BWoXBYdf = __esmMin((() => {
		e$39 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M128 464L512 464C520.8 464 528 456.8 528 448L528 208C528 199.2 520.8 192 512 192L362.7 192C345.4 192 328.5 186.4 314.7 176L276.3 147.2C273.5 145.1 270.2 144 266.7 144L128 144C119.2 144 112 151.2 112 160L112 448C112 456.8 119.2 464 128 464zM512 512L128 512C92.7 512 64 483.3 64 448L64 160C64 124.7 92.7 96 128 96L266.7 96C280.5 96 294 100.5 305.1 108.8L343.5 137.6C349 141.8 355.8 144 362.7 144L512 144C547.3 144 576 172.7 576 208L576 448C576 483.3 547.3 512 512 512z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/gauge-max-BbhG4Anh.js
	var gauge_max_BbhG4Anh_exports = /* @__PURE__ */ __exportAll({ default: () => e$38 });
	var e$38;
	var init_gauge_max_BbhG4Anh = __esmMin((() => {
		e$38 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M320 528C434.9 528 528 434.9 528 320C528 205.1 434.9 112 320 112C205.1 112 112 205.1 112 320C112 434.9 205.1 528 320 528zM320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64zM352 176C352 193.7 337.7 208 320 208C302.3 208 288 193.7 288 176C288 158.3 302.3 144 320 144C337.7 144 352 158.3 352 176zM320 472C289.1 472 264 446.9 264 416C264 385.1 289.1 360 320 360C329.4 360 338.3 362.3 346.1 366.4L433.6 300.8C444.2 292.8 459.2 295 467.2 305.6C475.2 316.2 473 331.2 462.4 339.2L374.9 404.8C375.6 408.4 376 412.1 376 416C376 446.9 350.9 472 320 472zM448 224C448 241.7 433.7 256 416 256C398.3 256 384 241.7 384 224C384 206.3 398.3 192 416 192C433.7 192 448 206.3 448 224zM176 288C193.7 288 208 302.3 208 320C208 337.7 193.7 352 176 352C158.3 352 144 337.7 144 320C144 302.3 158.3 288 176 288zM256 224C256 241.7 241.7 256 224 256C206.3 256 192 241.7 192 224C192 206.3 206.3 192 224 192C241.7 192 256 206.3 256 224z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/gauge-min-DPoyiw6g.js
	var gauge_min_DPoyiw6g_exports = /* @__PURE__ */ __exportAll({ default: () => e$37 });
	var e$37;
	var init_gauge_min_DPoyiw6g = __esmMin((() => {
		e$37 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M320 112C434.9 112 528 205.1 528 320C528 434.9 434.9 528 320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112zM320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM352 176C352 158.3 337.7 144 320 144C302.3 144 288 158.3 288 176C288 193.7 302.3 208 320 208C337.7 208 352 193.7 352 176zM320 472C350.9 472 376 446.9 376 416C376 385.1 350.9 360 320 360C310.6 360 301.7 362.3 293.9 366.4L206.4 300.8C195.8 292.8 180.8 295 172.8 305.6C164.8 316.2 167 331.2 177.6 339.2L265.1 404.8C264.4 408.4 264 412.1 264 416C264 446.9 289.1 472 320 472zM256 224C256 206.3 241.7 192 224 192C206.3 192 192 206.3 192 224C192 241.7 206.3 256 224 256C241.7 256 256 241.7 256 224zM464 352C481.7 352 496 337.7 496 320C496 302.3 481.7 288 464 288C446.3 288 432 302.3 432 320C432 337.7 446.3 352 464 352zM448 224C448 206.3 433.7 192 416 192C398.3 192 384 206.3 384 224C384 241.7 398.3 256 416 256C433.7 256 448 241.7 448 224z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/gear-CQjg3jBA.js
	var gear_CQjg3jBA_exports = /* @__PURE__ */ __exportAll({ default: () => e$36 });
	var e$36;
	var init_gear_CQjg3jBA = __esmMin((() => {
		e$36 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M269.5 156.7L283.2 96L356.8 96L370.5 156.7C372.2 164.1 377.3 170.3 384.3 173.4C395.1 178.2 405.3 184.1 414.7 191C420.8 195.5 428.8 196.9 436.1 194.6L495.6 176.1L532.4 239.9L486.6 282.2C481 287.4 478.2 294.9 479 302.4C480.3 313.9 480.3 326.1 479 337.6C478.2 345.2 481 352.7 486.6 357.8L532.4 400.1L495.6 463.9L436.1 445.4C428.8 443.1 420.9 444.5 414.7 449C405.3 455.9 395.1 461.9 384.3 466.6C377.3 469.7 372.2 475.9 370.5 483.3L356.8 544L283.2 544L269.5 483.3C267.8 475.9 262.7 469.7 255.7 466.6C244.9 461.8 234.7 455.9 225.3 449C219.2 444.5 211.2 443.1 203.9 445.4L144.4 463.9L107.6 400.1L153.4 357.8C159 352.6 161.8 345.1 161 337.6C159.7 326.1 159.7 313.9 161 302.4C161.8 294.8 159 287.3 153.4 282.2L107.6 239.9L144.4 176.1L203.9 194.6C211.2 196.9 219.1 195.5 225.3 191C234.7 184.1 244.9 178.1 255.7 173.4C262.7 170.3 267.8 164.1 269.5 156.7zM276.8 48C258.1 48 241.9 61 237.8 79.2L225.2 134.8C218.9 138 212.9 141.5 207 145.3L152.6 128.4C134.7 122.8 115.4 130.4 106.1 146.6L62.9 221.4C53.6 237.6 56.7 258.1 70.4 270.8L112.3 309.5C112 316.4 112 323.5 112.3 330.5L70.4 369.2C56.7 381.9 53.5 402.4 62.9 418.6L106.1 493.4C115.4 509.6 134.8 517.1 152.6 511.6L207.1 494.7C213 498.5 219 502 225.3 505.2L237.9 560.8C242 579 258.2 592 276.9 592L363.3 592C382 592 398.2 579 402.3 560.8L414.9 505.2C421.2 502 427.2 498.5 433.1 494.7L487.6 511.6C505.5 517.2 524.8 509.6 534.1 493.4L577.3 418.6C586.6 402.4 583.5 381.9 569.8 369.2L527.9 330.5C528.2 323.6 528.2 316.5 527.9 309.5L569.8 270.8C583.5 258.1 586.6 237.6 577.3 221.4L534 146.6C524.6 130.4 505.3 122.9 487.5 128.4L433 145.3C427.1 141.5 421.1 138 414.8 134.8L402.3 79.2C398.1 61 381.9 48 363.2 48L276.8 48zM368 320C368 346.5 346.5 368 320 368C293.5 368 272 346.5 272 320C272 293.5 293.5 272 320 272C346.5 272 368 293.5 368 320zM320 224C267 224 224 267 224 320C224 373 267 416 320 416C373 416 416 373 416 320C416 267 373 224 320 224z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/gift-C7JdBh8a.js
	var gift_C7JdBh8a_exports = /* @__PURE__ */ __exportAll({ default: () => e$35 });
	var e$35;
	var init_gift_C7JdBh8a = __esmMin((() => {
		e$35 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M385.5 132.8C393.1 119.9 406.9 112 421.8 112L424 112C446.1 112 464 129.9 464 152C464 174.1 446.1 192 424 192L350.7 192L385.5 132.8zM254.5 132.8L289.3 192L216 192C193.9 192 176 174.1 176 152C176 129.9 193.9 112 216 112L218.2 112C233.1 112 247 119.9 254.5 132.8zM344.1 108.5L320 149.5L295.9 108.5C279.7 80.9 250.1 64 218.2 64L216 64C167.4 64 128 103.4 128 152C128 166.4 131.5 180 137.6 192L96 192C78.3 192 64 206.3 64 224L64 256C64 273.7 78.3 288 96 288L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 288C561.7 288 576 273.7 576 256L576 224C576 206.3 561.7 192 544 192L502.4 192C508.5 180 512 166.4 512 152C512 103.4 472.6 64 424 64L421.8 64C389.9 64 360.3 80.9 344.1 108.4zM144 288L296 288L296 496L160 496C151.2 496 144 488.8 144 480L144 288zM344 288L496 288L496 480C496 488.8 488.8 496 480 496L344 496L344 288z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/grid-2-BogLMdkK.js
	var grid_2_BogLMdkK_exports = /* @__PURE__ */ __exportAll({ default: () => e$34 });
	var e$34;
	var init_grid_2_BogLMdkK = __esmMin((() => {
		e$34 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M144 144L144 240L240 240L240 144L144 144zM96 144C96 117.5 117.5 96 144 96L240 96C266.5 96 288 117.5 288 144L288 240C288 266.5 266.5 288 240 288L144 288C117.5 288 96 266.5 96 240L96 144zM144 400L144 496L240 496L240 400L144 400zM96 400C96 373.5 117.5 352 144 352L240 352C266.5 352 288 373.5 288 400L288 496C288 522.5 266.5 544 240 544L144 544C117.5 544 96 522.5 96 496L96 400zM496 144L400 144L400 240L496 240L496 144zM400 96L496 96C522.5 96 544 117.5 544 144L544 240C544 266.5 522.5 288 496 288L400 288C373.5 288 352 266.5 352 240L352 144C352 117.5 373.5 96 400 96zM400 400L400 496L496 496L496 400L400 400zM352 400C352 373.5 373.5 352 400 352L496 352C522.5 352 544 373.5 544 400L544 496C544 522.5 522.5 544 496 544L400 544C373.5 544 352 522.5 352 496L352 400z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/inbox-CJ5O811s.js
	var inbox_CJ5O811s_exports = /* @__PURE__ */ __exportAll({ default: () => e$33 });
	var e$33;
	var init_inbox_CJ5O811s = __esmMin((() => {
		e$33 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M139.3 158C140.3 150 147.1 144 155.2 144L484.9 144C492.9 144 499.7 150 500.8 158L525.8 352L440.6 352C427.2 352 414.7 358.7 407.3 369.8L387.2 400L252.9 400L232.8 369.8C225.4 358.7 212.9 352 199.5 352L114.3 352L139.3 158zM112 400L195.2 400L215.3 430.2C222.7 441.3 235.2 448 248.6 448L391.5 448C404.9 448 417.4 441.3 424.8 430.2L444.9 400L528.1 400L528.1 480C528.1 488.8 520.9 496 512.1 496L128 496C119.2 496 112 488.8 112 480L112 400zM155.2 96C123 96 95.8 119.9 91.7 151.8L64.2 364.9L64 366.5L64 480C64 515.3 92.7 544 128 544L512 544C547.3 544 576 515.3 576 480L576 366.5L575.8 365L548.3 151.9C544.2 119.9 517 96 484.8 96L155.2 96z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/lightbulb-Bq8Nq8re.js
	var lightbulb_Bq8Nq8re_exports = /* @__PURE__ */ __exportAll({ default: () => e$32 });
	var e$32;
	var init_lightbulb_Bq8Nq8re = __esmMin((() => {
		e$32 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M424.5 355.1C449 329.2 464 294.4 464 256C464 176.5 399.5 112 320 112C240.5 112 176 176.5 176 256C176 294.4 191 329.2 215.5 355.1C236.8 377.5 260.4 409.1 268.8 448L371.2 448C379.6 409 403.2 377.5 424.5 355.1zM459.3 388.1C435.7 413 416 443.4 416 477.7L416 496C416 540.2 380.2 576 336 576L304 576C259.8 576 224 540.2 224 496L224 477.7C224 443.4 204.3 413 180.7 388.1C148 353.7 128 307.2 128 256C128 150 214 64 320 64C426 64 512 150 512 256C512 307.2 492 353.7 459.3 388.1zM272 248C272 261.3 261.3 272 248 272C234.7 272 224 261.3 224 248C224 199.4 263.4 160 312 160C325.3 160 336 170.7 336 184C336 197.3 325.3 208 312 208C289.9 208 272 225.9 272 248z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/location-dot-slash-B5cKa6cn.js
	var location_dot_slash_B5cKa6cn_exports = /* @__PURE__ */ __exportAll({ default: () => e$31 });
	var e$31;
	var init_location_dot_slash_B5cKa6cn = __esmMin((() => {
		e$31 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L454.6 420.7C486.8 366.9 512 307.3 512 252.6C512 148.4 426 64 320 64C259 64 204.6 92 169.4 135.6L73 39.1zM203.6 169.8C229.7 134.9 271.8 112 320 112C400.3 112 464 175.7 464 252.6C464 291.6 446.5 338.2 419.5 385.7L359.5 325.7C383.7 311.9 400 285.9 400 256.1C400 211.9 364.2 176.1 320 176.1C290.2 176.1 264.1 192.4 250.4 216.6L203.6 169.8zM321.8 288L288 254.2C288.9 237.4 302.9 224 320 224C337.7 224 352 238.3 352 256C352 273.1 338.6 287 321.8 288zM365.1 466.9C348.9 488.1 333.2 506.8 320 521.7C295.9 494.4 263.3 454.5 234.9 409.6C206.7 364.9 185.7 320 178.6 280.4L129.2 231.1C128.4 238.2 128 245.3 128 252.6C128 371.9 248.2 514.9 298.4 569.4C310.2 582.2 329.9 582.2 341.7 569.4C356.5 553.4 377.3 529.7 399.4 501.2L365.2 467z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/location-dot-UmU_3DzA.js
	var location_dot_UmU_3DzA_exports = /* @__PURE__ */ __exportAll({ default: () => e$30 });
	var e$30;
	var init_location_dot_UmU_3DzA = __esmMin((() => {
		e$30 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M176 252.6C176 175.7 239.7 112 320 112C400.3 112 464 175.7 464 252.6C464 298.2 440.2 354.1 405.1 409.7C376.8 454.5 344.1 494.5 320 521.8C295.9 494.5 263.3 454.6 234.9 409.7C199.8 354.2 176 298.2 176 252.6zM320 64C214 64 128 148.4 128 252.6C128 371.9 248.2 514.9 298.4 569.4C310.2 582.2 329.8 582.2 341.6 569.4C391.8 514.9 512 371.9 512 252.6C512 148.4 426 64 320 64zM288 256C288 238.3 302.3 224 320 224C337.7 224 352 238.3 352 256C352 273.7 337.7 288 320 288C302.3 288 288 273.7 288 256zM400 256C400 211.8 364.2 176 320 176C275.8 176 240 211.8 240 256C240 300.2 275.8 336 320 336C364.2 336 400 300.2 400 256z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/lock-keyhole-open-D8_uSzB-.js
	var lock_keyhole_open_D8_uSzB__exports = /* @__PURE__ */ __exportAll({ default: () => e$29 });
	var e$29;
	var init_lock_keyhole_open_D8_uSzB_ = __esmMin((() => {
		e$29 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M480 80C435.8 80 400 115.8 400 160L400 224L448 224C483.3 224 512 252.7 512 288L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 288C128 252.7 156.7 224 192 224L352 224L352 160C352 89.3 409.3 32 480 32C550.7 32 608 89.3 608 160L608 200C608 213.3 597.3 224 584 224C570.7 224 560 213.3 560 200L560 160C560 115.8 524.2 80 480 80zM352 272L352 272L192 272C183.2 272 176 279.2 176 288L176 512C176 520.8 183.2 528 192 528L448 528C456.8 528 464 520.8 464 512L464 288C464 279.2 456.8 272 448 272L400 272L400 272L352 272zM360 424L280 424C266.7 424 256 413.3 256 400C256 386.7 266.7 376 280 376L360 376C373.3 376 384 386.7 384 400C384 413.3 373.3 424 360 424z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/lock-keyhole-Bvc0RJtr.js
	var lock_keyhole_Bvc0RJtr_exports = /* @__PURE__ */ __exportAll({ default: () => e$28 });
	var e$28;
	var init_lock_keyhole_Bvc0RJtr = __esmMin((() => {
		e$28 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M320 80C364.2 80 400 115.8 400 160L400 224L240 224L240 160C240 115.8 275.8 80 320 80zM192 160L192 224C156.7 224 128 252.7 128 288L128 512C128 547.3 156.7 576 192 576L448 576C483.3 576 512 547.3 512 512L512 288C512 252.7 483.3 224 448 224L448 160C448 89.3 390.7 32 320 32C249.3 32 192 89.3 192 160zM400 272L448 272L448 272C456.8 272 464 279.2 464 288L464 512C464 520.8 456.8 528 448 528L192 528C183.2 528 176 520.8 176 512L176 288C176 279.2 183.2 272 192 272L192 272L240 272L240 272L400 272L400 272zM344 360C344 346.7 333.3 336 320 336C306.7 336 296 346.7 296 360L296 440C296 453.3 306.7 464 320 464C333.3 464 344 453.3 344 440L344 360z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/magnifying-glass-chart-C5MrYyo2.js
	var magnifying_glass_chart_C5MrYyo2_exports = /* @__PURE__ */ __exportAll({ default: () => e$27 });
	var e$27;
	var init_magnifying_glass_chart_C5MrYyo2 = __esmMin((() => {
		e$27 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M272 112C360.4 112 432 183.6 432 272C432 360.4 360.4 432 272 432C183.6 432 112 360.4 112 272C112 183.6 183.6 112 272 112zM272 480C320.8 480 365.7 463.2 401.1 435.1L535 569C544.4 578.4 559.6 578.4 568.9 569C578.2 559.6 578.3 544.4 568.9 535.1L435.1 401.1C463.2 365.7 480 320.8 480 272C480 157.1 386.9 64 272 64C157.1 64 64 157.1 64 272C64 386.9 157.1 480 272 480zM168 280L168 328C168 341.3 178.7 352 192 352C205.3 352 216 341.3 216 328L216 280C216 266.7 205.3 256 192 256C178.7 256 168 266.7 168 280zM248 184L248 328C248 341.3 258.7 352 272 352C285.3 352 296 341.3 296 328L296 184C296 170.7 285.3 160 272 160C258.7 160 248 170.7 248 184zM328 248L328 328C328 341.3 338.7 352 352 352C365.3 352 376 341.3 376 328L376 248C376 234.7 365.3 224 352 224C338.7 224 328 234.7 328 248z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/map-location-dot-35-yr6SF.js
	var map_location_dot_35_yr6SF_exports = /* @__PURE__ */ __exportAll({ default: () => e$26 });
	var e$26;
	var init_map_location_dot_35_yr6SF = __esmMin((() => {
		e$26 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M576 112C576 103.7 571.7 96 564.7 91.6C557.7 87.2 548.8 86.8 541.4 90.5L416.5 152.1L244 93.4C230.3 88.7 215.3 89.6 202.1 95.7L77.8 154.3C69.4 158.2 64 166.7 64 176L64 528C64 536.2 68.2 543.9 75.1 548.3C82 552.7 90.7 553.2 98.2 549.7L225.5 489.8L392.8 545.6C390.9 542.6 389 539.6 387.2 536.5C377.8 520.9 368.4 503.2 360.9 484.4L256 449.4L256 148.3L384 191.8L384 298.5C397.4 282.9 413.7 269.9 432 260.1L432 198.1L528 150.7L528 240.8C544.8 242.4 560.9 246.4 576 252.5L576 112zM208 146.1L208 445.1L112 490.3L112 191.3L208 146.1zM512 288C445.7 288 392 340.8 392 405.9C392 474.8 456.1 556.3 490.6 595.2C502.2 608.2 521.9 608.2 533.5 595.2C568 556.3 632.1 474.8 632.1 405.9C632.1 340.8 578.4 288 512.1 288zM472 408C472 385.9 489.9 368 512 368C534.1 368 552 385.9 552 408C552 430.1 534.1 448 512 448C489.9 448 472 430.1 472 408z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/map-BkL6_XZk.js
	var map_BkL6_XZk_exports = /* @__PURE__ */ __exportAll({ default: () => e$25 });
	var e$25;
	var init_map_BkL6_XZk = __esmMin((() => {
		e$25 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M576 112C576 103.7 571.7 96 564.7 91.6C557.7 87.2 548.8 86.8 541.4 90.5L416.5 152.1L244 93.4C230.3 88.7 215.3 89.6 202.1 95.7L77.8 154.3C69.4 158.2 64 166.7 64 176L64 528C64 536.2 68.2 543.9 75.1 548.3C82 552.7 90.7 553.2 98.2 549.7L225.5 489.8L396.2 546.7C409.9 551.3 424.7 550.4 437.8 544.2L562.2 485.7C570.6 481.7 576 473.3 576 464L576 112zM208 146.1L208 445.1L112 490.3L112 191.3L208 146.1zM256 449.4L256 148.3L384 191.8L384 492.1L256 449.4zM432 198L528 150.6L528 448.8L432 494L432 198z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/masks-theater-CbuXPiO6.js
	var masks_theater_CbuXPiO6_exports = /* @__PURE__ */ __exportAll({ default: () => e$24 });
	var e$24;
	var init_masks_theater_CbuXPiO6 = __esmMin((() => {
		e$24 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M145.3 220.5C124.6 224.1 109.4 240.5 106.2 260.2C104.8 268.9 113.4 274.9 122.1 273.4L176.3 263.8L176.3 225.5C167.1 220.6 156.3 218.6 145.3 220.5zM131.4 380.4C129.5 390.1 138.6 397.6 148.3 395.9L177.4 390.8C176.7 383.1 176.3 375.3 176.3 367.5L176.3 316.1C152.9 330.1 136.5 353.6 131.4 380.4zM86.7 348.5L58.6 189.3C58.5 188.6 58.5 188.2 58.5 187.9C72.5 167.7 113.2 128.7 191.7 114.9C204.3 112.7 216.3 111.4 227.5 110.9C248.3 95.8 275.4 81.6 308.6 71.5C275.8 62.7 233.6 58.8 183.3 67.7C91.4 83.9 39.5 130.7 18.6 161.3C10.5 173.1 9.3 186.6 11.3 197.8L39.4 356.9C54.9 444.8 124.9 512.8 213.1 525.9L234 529C220.3 512.2 208.7 493.7 199.7 474C141.8 457.4 97.4 409.1 86.8 348.6zM416.3 104C323 104 263.8 141 237.8 167.6C227.8 177.8 224.3 191 224.3 202.2L224.3 363.9C224.3 453.1 281.4 532.3 366 560.5L389.4 568.3C406.9 574.1 425.7 574.1 443.2 568.3L466.6 560.5C551.2 532.3 608.3 453.1 608.3 363.9L608.3 202.2C608.3 190.9 604.8 177.8 594.8 167.6C568.8 141.1 509.6 104 416.3 104zM272.3 202.2C272.3 201.5 272.4 201.1 272.4 200.8C289.7 183.3 336.6 152 416.3 152C496 152 542.8 183.3 560.1 200.8C560.2 201 560.3 201.5 560.3 202.2L560.3 363.9C560.3 432.5 516.4 493.3 451.4 515L428 522.8C420.4 525.3 412.2 525.3 404.5 522.8L381.3 515C316.3 493.3 272.4 432.5 272.4 363.9L272.4 202.2zM307 288.3C304.1 296.7 311.5 304 320.4 304L384.4 304C393.2 304 400.7 296.6 397.8 288.3C391.3 269.5 373.4 256 352.4 256C331.4 256 313.5 269.5 307 288.3zM512.3 304C521.1 304 528.6 296.6 525.7 288.3C519.2 269.5 501.3 256 480.3 256C459.3 256 441.4 269.5 434.9 288.3C432 296.7 439.4 304 448.3 304L512.3 304zM306.5 373.7C316.6 425.1 362 464 416.4 464C470.8 464 516.2 425.2 526.3 373.7C527.7 366.7 519.3 362.7 513.6 367.1C486.7 387.7 453 400 416.4 400C379.8 400 346.2 387.7 319.2 367.1C313.5 362.7 305.1 366.7 306.5 373.7z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/moon-DWuv9XJD.js
	var moon_DWuv9XJD_exports = /* @__PURE__ */ __exportAll({ default: () => e$23 });
	var e$23;
	var init_moon_DWuv9XJD = __esmMin((() => {
		e$23 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M303.3 112.7C196.2 121.2 112 210.8 112 320C112 434.9 205.1 528 320 528C353.3 528 384.7 520.2 412.6 506.3C309.2 482.9 232 390.5 232 280C232 214.2 259.4 154.9 303.3 112.7zM64 320C64 178.6 178.6 64 320 64C339.4 64 358.4 66.2 376.7 70.3C386.6 72.5 394 80.8 395.2 90.8C396.4 100.8 391.2 110.6 382.1 115.2C321.5 145.4 280 207.9 280 280C280 381.6 362.4 464 464 464C469 464 473.9 463.8 478.8 463.4C488.9 462.6 498.4 468.2 502.6 477.5C506.8 486.8 504.6 497.6 497.3 504.6C451.3 548.8 388.8 576 320 576C178.6 576 64 461.4 64 320z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/newspaper-JzlU71UV.js
	var newspaper_JzlU71UV_exports = /* @__PURE__ */ __exportAll({ default: () => e$22 });
	var e$22;
	var init_newspaper_JzlU71UV = __esmMin((() => {
		e$22 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M232 144C218.7 144 208 154.7 208 168L208 472C208 480.4 206.6 488.5 203.9 496L504 496C517.3 496 528 485.3 528 472L528 168C528 154.7 517.3 144 504 144L232 144zM136 544C96.2 544 64 511.8 64 472L64 176C64 162.7 74.7 152 88 152C101.3 152 112 162.7 112 176L112 472C112 485.3 122.7 496 136 496C149.3 496 160 485.3 160 472L160 168C160 128.2 192.2 96 232 96L504 96C543.8 96 576 128.2 576 168L576 472C576 511.8 543.8 544 504 544L136 544zM256 216C256 202.7 266.7 192 280 192L328 192C341.3 192 352 202.7 352 216L352 264C352 277.3 341.3 288 328 288L280 288C266.7 288 256 277.3 256 264L256 216zM408 240L456 240C469.3 240 480 250.7 480 264C480 277.3 469.3 288 456 288L408 288C394.7 288 384 277.3 384 264C384 250.7 394.7 240 408 240zM280 320L456 320C469.3 320 480 330.7 480 344C480 357.3 469.3 368 456 368L280 368C266.7 368 256 357.3 256 344C256 330.7 266.7 320 280 320zM280 400L456 400C469.3 400 480 410.7 480 424C480 437.3 469.3 448 456 448L280 448C266.7 448 256 437.3 256 424C256 410.7 266.7 400 280 400z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/paste-BP-qzKT6.js
	var paste_BP_qzKT6_exports = /* @__PURE__ */ __exportAll({ default: () => e$21 });
	var e$21;
	var init_paste_BP_qzKT6 = __esmMin((() => {
		e$21 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M128 112L352 112C360.8 112 368 119.2 368 128L368 176L416 176L416 128C416 92.7 387.3 64 352 64L128 64C92.7 64 64 92.7 64 128L64 448C64 483.3 92.7 512 128 512L240 512L240 464L128 464C119.2 464 112 456.8 112 448L112 128C112 119.2 119.2 112 128 112zM304 184C304 170.7 293.3 160 280 160L168 160C154.7 160 144 170.7 144 184C144 197.3 154.7 208 168 208L273.6 208C282.4 199.4 292.6 192.2 303.8 186.9C303.9 186 304 185 304 184zM512 528L352 528C343.2 528 336 520.8 336 512L336 288C336 279.2 343.2 272 352 272L453.5 272C457.7 272 461.8 273.7 464.8 276.7L523.3 335.2C526.3 338.2 528 342.3 528 346.5L528 512C528 520.8 520.8 528 512 528zM288 288L288 512C288 547.3 316.7 576 352 576L512 576C547.3 576 576 547.3 576 512L576 346.5C576 329.5 569.3 313.2 557.3 301.2L498.8 242.7C486.8 230.7 470.5 224 453.5 224L352 224C316.7 224 288 252.7 288 288z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/pause-YhXwIa0Q.js
	var pause_YhXwIa0Q_exports = /* @__PURE__ */ __exportAll({ default: () => e$20 });
	var e$20;
	var init_pause_YhXwIa0Q = __esmMin((() => {
		e$20 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M176 144L176 496L240 496L240 144L176 144zM128 144C128 117.5 149.5 96 176 96L240 96C266.5 96 288 117.5 288 144L288 496C288 522.5 266.5 544 240 544L176 544C149.5 544 128 522.5 128 496L128 144zM400 144L400 496L464 496L464 144L400 144zM352 144C352 117.5 373.5 96 400 96L464 96C490.5 96 512 117.5 512 144L512 496C512 522.5 490.5 544 464 544L400 544C373.5 544 352 522.5 352 496L352 144z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/pen-nib-DHkofnWk.js
	var pen_nib_DHkofnWk_exports = /* @__PURE__ */ __exportAll({ default: () => e$19 });
	var e$19;
	var init_pen_nib_DHkofnWk = __esmMin((() => {
		e$19 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M432.5 82.3C454.4 60.4 489.8 60.4 511.7 82.3L557.8 128.4C579.7 150.3 579.7 185.7 557.8 207.6L486.8 278.6L476.4 289L435.7 438.1C430.9 455.9 417.6 470.1 400.2 476.2L136 569C117.5 575.5 96.9 570.8 83.1 557C69.3 543.2 64.5 522.5 71 504L163.8 239.9C169.9 222.5 184.1 209.3 201.9 204.4L351 163.7L361.4 153.3L432.4 82.3zM360.9 210.8L214.6 250.7C212.1 251.4 210 253.3 209.2 255.8L129.6 482.2L227 384.7C225.1 379.5 224 373.9 224 368C224 341.5 245.5 320 272 320C298.5 320 320 341.5 320 368C320 394.5 298.5 416 272 416C266.1 416 260.5 414.9 255.3 413L157.8 510.5L384.2 431C386.7 430.1 388.6 428.1 389.3 425.6L429.2 279.2L360.9 210.9z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/pen-BFaC7vbv.js
	var pen_BFaC7vbv_exports = /* @__PURE__ */ __exportAll({ default: () => e$18 });
	var e$18;
	var init_pen_BFaC7vbv = __esmMin((() => {
		e$18 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M100.4 417.8C104.5 403.2 112.2 389.9 123 379.1L417 85.1C430.4 71.6 448.8 64 468 64C487.2 64 505.6 71.6 519.1 85.2L554.8 120.9C568.4 134.4 576 152.8 576 172C576 191.2 568.4 209.6 554.8 223.1L260.8 517.1C250.1 527.8 236.7 535.6 222.1 539.7L94.4 575.1C86.1 577.4 77.1 575.1 71 568.9C64.9 562.7 62.5 553.8 64.8 545.5L100.4 417.8zM450.8 119.1L397.9 172L468 242.1L520.9 189.2C525.5 184.6 528 178.5 528 172C528 165.5 525.4 159.4 520.9 154.8L485.2 119.1C480.6 114.6 474.4 112 468 112C461.6 112 455.4 114.6 450.8 119.1zM364 205.9L156.9 413.1C152 418 148.5 424 146.6 430.7L122.5 517.6L209.4 493.5C216 491.7 222.1 488.1 227 483.2L434.1 276L364 205.9z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/piggy-bank-DXBVFif5.js
	var piggy_bank_DXBVFif5_exports = /* @__PURE__ */ __exportAll({ default: () => e$17 });
	var e$17;
	var init_piggy_bank_DXBVFif5 = __esmMin((() => {
		e$17 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M224 128C224 75 267 32 320 32C373 32 416 75 416 128C416 181 373 224 320 224C267 224 224 181 224 128zM72 350.5C72 277.6 119 217.3 186.9 183C193.1 198 201.8 211.7 212.4 223.6C155.5 251.3 120 299.8 120 350.5C120 396.3 147.8 437.8 195.9 465.1C203.4 469.4 208 477.3 208 486L208 520C208 524.4 211.6 528 216 528L246.1 528C249 528 251.7 526.4 253.1 523.8L262.5 506.4C267.2 497.7 276.7 492.8 286.5 494C297.4 495.3 308.6 496 320.1 496C331.6 496 342.8 495.3 353.7 494C363.5 492.8 373 497.8 377.7 506.4L387.1 523.8C388.5 526.4 391.2 528 394.1 528L424.2 528C428.6 528 432.2 524.4 432.2 520L432.2 486C432.2 477.4 436.8 469.4 444.3 465.1C457.9 457.4 469.9 448.5 480.1 438.6C484.6 434.3 490.5 431.9 496.7 431.9L560.1 431.9L560.1 335.9L538.6 335.9C527.9 335.9 518.5 328.8 515.5 318.6C512.5 308.4 508.2 298.5 502.5 289C499 283.1 498.1 276 500.2 269.5L519.4 208L512 208C493.8 208 477.3 214.7 464.6 225.8C457 232.4 446.1 233.6 437.3 228.8C434.1 227.1 430.9 225.4 427.6 223.8C440.5 209.4 450.5 192.3 456.7 173.5C473.3 164.9 492.1 160 512 160L530.2 160C557.2 160 576.4 186.2 568.4 211.9L549 274C551.4 278.6 553.5 283.2 555.5 288L560 288C586.5 288 608 309.5 608 336L608 432C608 458.5 586.5 480 560 480L505.9 480C497.9 487 489.2 493.6 480 499.5L480 520C480 550.9 454.9 576 424 576L393.9 576C373.3 576 354.4 564.7 344.6 546.6L342.8 543.2C327.8 544.2 312.1 544.2 297.1 543.2L295.3 546.6C285.5 564.7 266.6 576 246 576L216 576C185.1 576 160 550.9 160 520L160 499.5C107.6 465.5 72 413.1 72 350.5zM456 336C469.3 336 480 346.7 480 360C480 373.3 469.3 384 456 384C442.7 384 432 373.3 432 360C432 346.7 442.7 336 456 336zM248 256L392 256C405.3 256 416 266.7 416 280C416 293.3 405.3 304 392 304L248 304C234.7 304 224 293.3 224 280C224 266.7 234.7 256 248 256z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/play-DA-Yljec.js
	var play_DA_Yljec_exports = /* @__PURE__ */ __exportAll({ default: () => e$16 });
	var e$16;
	var init_play_DA_Yljec = __esmMin((() => {
		e$16 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M147.6 101.6C135.5 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6zM176 490.5L176 149.5L487.3 320L176 490.5z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/school-Dw6F8hrb.js
	var school_Dw6F8hrb_exports = /* @__PURE__ */ __exportAll({ default: () => e$15 });
	var e$15;
	var init_school_Dw6F8hrb = __esmMin((() => {
		e$15 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M305.1 77.2C313.8 70.3 326.1 70.3 334.8 77.2L480.3 192L544 192C579.3 192 608 220.7 608 256L608 512C608 547.3 579.3 576 544 576L96 576C60.7 576 32 547.3 32 512L32 256C32 220.7 60.7 192 96 192L159.7 192L305.2 77.2zM320 126.6L182.9 234.8C178.7 238.1 173.4 240 168 240L96 240C87.2 240 80 247.2 80 256L80 512C80 520.8 87.2 528 96 528L256 528L256 448C256 421.5 277.5 400 304 400L336 400C362.5 400 384 421.5 384 448L384 528L544 528C552.8 528 560 520.8 560 512L560 256C560 247.2 552.8 240 544 240L472 240C466.6 240 461.4 238.2 457.1 234.8L320 126.6zM176 480L144 480C135.2 480 128 472.8 128 464L128 432C128 423.2 135.2 416 144 416L176 416C184.8 416 192 423.2 192 432L192 464C192 472.8 184.8 480 176 480zM192 336C192 344.8 184.8 352 176 352L144 352C135.2 352 128 344.8 128 336L128 304C128 295.2 135.2 288 144 288L176 288C184.8 288 192 295.2 192 304L192 336zM496 480L464 480C455.2 480 448 472.8 448 464L448 432C448 423.2 455.2 416 464 416L496 416C504.8 416 512 423.2 512 432L512 464C512 472.8 504.8 480 496 480zM512 336C512 344.8 504.8 352 496 352L464 352C455.2 352 448 344.8 448 336L448 304C448 295.2 455.2 288 464 288L496 288C504.8 288 512 295.2 512 304L512 336zM320 192C355.3 192 384 220.7 384 256C384 291.3 355.3 320 320 320C284.7 320 256 291.3 256 256C256 220.7 284.7 192 320 192z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/screwdriver-wrench-CsHKJX45.js
	var screwdriver_wrench_CsHKJX45_exports = /* @__PURE__ */ __exportAll({ default: () => e$14 });
	var e$14;
	var init_screwdriver_wrench_CsHKJX45 = __esmMin((() => {
		e$14 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M102.7 57.3C108.1 51.9 116.5 51.1 122.9 55.3L241.7 134.5C250.6 140.4 255.9 150.4 255.9 161.1L255.9 222L339.1 305.2C373.6 285.5 418.4 290.4 447.9 319.9L574.1 446.1C592.8 464.8 592.8 495.2 574.1 514L514 574.1C495.3 592.8 464.9 592.8 446.1 574.1L320 448C290.5 418.5 285.6 373.8 305.3 339.2L222.1 256L161.2 256C150.5 256 140.5 250.7 134.6 241.8L55.3 122.9C51.1 116.6 51.9 108.1 57.3 102.7L102.7 57.3zM208 208L208 169.7L118.1 109.8L109.8 118.1L169.7 208L208 208zM480 540.1L540.1 480L414.1 353.9C397.5 337.3 370.6 337.3 354 353.9C337.4 370.5 337.4 397.4 354 414L480 540.1zM71.4 455.4L212.5 314.3L246.4 348.2L105.3 489.3L105.3 489.3C92.8 501.8 92.8 522.1 105.3 534.6C117.8 547.1 138.1 547.1 150.6 534.6L253.8 431.4C259.4 446.7 267.7 461.2 278.9 474.2L184.6 568.5C153.4 599.7 102.7 599.7 71.5 568.5C40.3 537.3 40.3 486.6 71.5 455.4zM304 161.1C304 143.9 298.5 127.4 288.5 113.8C319 83 361.2 63.9 408 63.9C435.1 63.9 460.8 70.3 483.5 81.8C490.4 85.3 495.2 91.8 496.4 99.4C497.6 107 495.1 114.7 489.7 120.2L416 193.9L416 224L446.1 224L519.8 150.3C525.2 144.9 533 142.4 540.6 143.6C548.2 144.8 554.8 149.6 558.2 156.5C569.6 179.2 576.1 204.9 576.1 232C576.1 273.3 561.2 311.2 536.4 340.4L502.3 306.3C518.4 285.9 528.1 260 528.1 232C528.1 225.1 527.5 218.3 526.4 211.7L473 265C470.4 267.6 467.2 269.6 463.8 270.7C435.4 250.7 401.2 242.6 368.1 246.4L368.1 184C368.1 177.6 370.6 171.5 375.1 167L428.4 113.7C421.8 112.6 415 112 408.1 112C363.6 112 324.8 136.2 304.1 172.1L304.1 161.1z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/sliders-apvy1RIg.js
	var sliders_apvy1RIg_exports = /* @__PURE__ */ __exportAll({ default: () => e$13 });
	var e$13;
	var init_sliders_apvy1RIg = __esmMin((() => {
		e$13 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M88 136C74.7 136 64 146.7 64 160C64 173.3 74.7 184 88 184L179.7 184C189.9 216.5 220.2 240 256 240C291.8 240 322.1 216.5 332.3 184L552 184C565.3 184 576 173.3 576 160C576 146.7 565.3 136 552 136L332.3 136C322.1 103.5 291.8 80 256 80C220.2 80 189.9 103.5 179.7 136L88 136zM88 296C74.7 296 64 306.7 64 320C64 333.3 74.7 344 88 344L339.7 344C349.9 376.5 380.2 400 416 400C451.8 400 482.1 376.5 492.3 344L552 344C565.3 344 576 333.3 576 320C576 306.7 565.3 296 552 296L492.3 296C482.1 263.5 451.8 240 416 240C380.2 240 349.9 263.5 339.7 296L88 296zM88 456C74.7 456 64 466.7 64 480C64 493.3 74.7 504 88 504L147.7 504C157.9 536.5 188.2 560 224 560C259.8 560 290.1 536.5 300.3 504L552 504C565.3 504 576 493.3 576 480C576 466.7 565.3 456 552 456L300.3 456C290.1 423.5 259.8 400 224 400C188.2 400 157.9 423.5 147.7 456L88 456zM224 512C206.3 512 192 497.7 192 480C192 462.3 206.3 448 224 448C241.7 448 256 462.3 256 480C256 497.7 241.7 512 224 512zM416 352C398.3 352 384 337.7 384 320C384 302.3 398.3 288 416 288C433.7 288 448 302.3 448 320C448 337.7 433.7 352 416 352zM224 160C224 142.3 238.3 128 256 128C273.7 128 288 142.3 288 160C288 177.7 273.7 192 256 192C238.3 192 224 177.7 224 160z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/stop-CKIwsk4t.js
	var stop_CKIwsk4t_exports = /* @__PURE__ */ __exportAll({ default: () => e$12 });
	var e$12;
	var init_stop_CKIwsk4t = __esmMin((() => {
		e$12 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M480 144C488.8 144 496 151.2 496 160L496 480C496 488.8 488.8 496 480 496L160 496C151.2 496 144 488.8 144 480L144 160C144 151.2 151.2 144 160 144L480 144zM160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 160C544 124.7 515.3 96 480 96L160 96z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/sun-BZmXflp7.js
	var sun_BZmXflp7_exports = /* @__PURE__ */ __exportAll({ default: () => e$11 });
	var e$11;
	var init_sun_BZmXflp7 = __esmMin((() => {
		e$11 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M320 32C328 32 335.4 36 339.9 42.6L398.7 130L502.1 109.8C509.9 108.3 518 110.7 523.7 116.4C529.4 122.1 531.8 130.2 530.3 138L510 241.3L597.4 300.1C604 304.5 608 312 608 320C608 328 604 335.4 597.4 339.9L510 398.7L530.2 502C531.7 509.8 529.3 517.9 523.6 523.6C517.9 529.3 509.8 531.7 502 530.2L398.7 510L339.9 597.4C335.4 604 328 608 320 608C312 608 304.6 604 300.1 597.4L241.3 510L137.9 530.2C130.1 531.7 122 529.3 116.3 523.6C110.6 517.9 108.2 509.8 109.7 502L130 398.7L42.6 339.9C36 335.4 32 328 32 320C32 312 36 304.6 42.6 300.1L130 241.3L109.8 137.9C108.3 130.1 110.7 122 116.4 116.3C122.1 110.6 130.2 108.2 138 109.7L241.3 129.9L300.1 42.5L301.9 40.2C306.4 35 313 32 320 32zM272.2 170C266.8 178 257.2 182 247.7 180.2L163.7 163.8L180.1 247.8C181.9 257.3 177.9 266.9 169.9 272.3L99 320L170 367.8C178 373.2 182 382.8 180.2 392.3L163.8 476.3L247.8 459.9L251.3 459.5C259.6 459.1 267.6 463.1 272.3 470.1L320.1 541.1L367.9 470.1L370.1 467.3C375.7 461.2 384.1 458.3 392.4 460L476.4 476.4L460 392.4C458.2 382.9 462.2 373.3 470.2 367.9L541.2 320.1L470.2 272.3C462.2 266.9 458.2 257.3 460 247.8L476.4 163.8L392.4 180.2C382.9 182 373.3 178 367.9 170L320.1 99L272.3 170zM320 440C253.7 440 200 386.3 200 320C200 253.7 253.7 200 320 200C386.3 200 440 253.7 440 320C440 386.3 386.3 440 320 440zM320 248C280.2 248 248 280.2 248 320C248 359.8 280.2 392 320 392C359.8 392 392 359.8 392 320C392 280.2 359.8 248 320 248z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/tag-BzdweFtQ.js
	var tag_BzdweFtQ_exports = /* @__PURE__ */ __exportAll({ default: () => e$10 });
	var e$10;
	var init_tag_BzdweFtQ = __esmMin((() => {
		e$10 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M128.1 152C128.1 138.7 138.8 128 152.1 128L308.2 128C314.6 128 320.7 130.5 325.2 135L533.2 343C542.6 352.4 542.6 367.6 533.2 376.9L377.1 533.1C367.7 542.5 352.5 542.5 343.2 533.1L135.2 325.1C130.7 320.6 128.2 314.5 128.2 308.1L128.1 152zM152.1 80C112.3 80 80.1 112.2 80.1 152L80.1 308.1C80.1 327.2 87.7 345.5 101.2 359L309.2 567C337.3 595.1 382.9 595.1 411 567L567.1 410.9C595.2 382.8 595.2 337.2 567.1 309.1L359.1 101.1C345.6 87.6 327.3 80 308.2 80L152.1 80zM208.1 240C225.8 240 240.1 225.7 240.1 208C240.1 190.3 225.8 176 208.1 176C190.4 176 176.1 190.3 176.1 208C176.1 225.7 190.4 240 208.1 240z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/trash-can-arrow-up-YGwFfpFx.js
	var trash_can_arrow_up_YGwFfpFx_exports = /* @__PURE__ */ __exportAll({ default: () => e$9 });
	var e$9;
	var init_trash_can_arrow_up_YGwFfpFx = __esmMin((() => {
		e$9 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M262.2 48C248.9 48 236.9 56.3 232.2 68.8L216 112L120 112C106.7 112 96 122.7 96 136C96 149.3 106.7 160 120 160L520 160C533.3 160 544 149.3 544 136C544 122.7 533.3 112 520 112L424 112L407.8 68.8C403.1 56.3 391.2 48 377.8 48L262.2 48zM128 208L128 512C128 547.3 156.7 576 192 576L448 576C483.3 576 512 547.3 512 512L512 208L464 208L464 512C464 520.8 456.8 528 448 528L192 528C183.2 528 176 520.8 176 512L176 208L128 208zM337 263C327.6 253.6 312.4 253.6 303.1 263L239.1 327C229.7 336.4 229.7 351.6 239.1 360.9C248.5 370.2 263.7 370.3 273 360.9L296 337.9L296 424C296 437.3 306.7 448 320 448C333.3 448 344 437.3 344 424L344 337.9L367 360.9C376.4 370.3 391.6 370.3 400.9 360.9C410.2 351.5 410.3 336.3 400.9 327L336.9 263z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/trash-can-xRh5eGda.js
	var trash_can_xRh5eGda_exports = /* @__PURE__ */ __exportAll({ default: () => e$8 });
	var e$8;
	var init_trash_can_xRh5eGda = __esmMin((() => {
		e$8 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M262.2 48C248.9 48 236.9 56.3 232.2 68.8L216 112L120 112C106.7 112 96 122.7 96 136C96 149.3 106.7 160 120 160L520 160C533.3 160 544 149.3 544 136C544 122.7 533.3 112 520 112L424 112L407.8 68.8C403.1 56.3 391.2 48 377.8 48L262.2 48zM128 208L128 512C128 547.3 156.7 576 192 576L448 576C483.3 576 512 547.3 512 512L512 208L464 208L464 512C464 520.8 456.8 528 448 528L192 528C183.2 528 176 520.8 176 512L176 208L128 208zM288 280C288 266.7 277.3 256 264 256C250.7 256 240 266.7 240 280L240 456C240 469.3 250.7 480 264 480C277.3 480 288 469.3 288 456L288 280zM400 280C400 266.7 389.3 256 376 256C362.7 256 352 266.7 352 280L352 456C352 469.3 362.7 480 376 480C389.3 480 400 469.3 400 456L400 280z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/triangle-exclamation-CprZO6A8.js
	var triangle_exclamation_CprZO6A8_exports = /* @__PURE__ */ __exportAll({ default: () => e$7 });
	var e$7;
	var init_triangle_exclamation_CprZO6A8 = __esmMin((() => {
		e$7 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M320.5 64C335.2 64 348.7 72.1 355.7 85L571.7 485C578.4 497.4 578.1 512.4 570.9 524.5C563.7 536.6 550.6 544 536.5 544L104.5 544C90.4 544 77.4 536.6 70.2 524.5C63 512.4 62.7 497.4 69.4 485L285.4 85C292.4 72.1 305.9 64 320.6 64zM117.9 496L523.1 496L320.5 120.8L117.9 496zM320.5 456C302.8 456 288.5 441.7 288.5 424C288.5 406.3 302.8 392 320.5 392C338.2 392 352.5 406.3 352.5 424C352.5 441.7 338.2 456 320.5 456zM320.5 248C339.1 248 353.5 264.1 351.5 282.6L344.4 346.7C343 358.8 332.7 368 320.5 368C308.3 368 298 358.8 296.7 346.7L289.6 282.6C287.6 264.1 302 248 320.6 248z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/universal-access-TddPPo2q.js
	var universal_access_TddPPo2q_exports = /* @__PURE__ */ __exportAll({ default: () => e$6 });
	var e$6;
	var init_universal_access_TddPPo2q = __esmMin((() => {
		e$6 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M528 320C528 205.1 434.9 112 320 112C205.1 112 112 205.1 112 320C112 434.9 205.1 528 320 528C434.9 528 528 434.9 528 320zM64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320zM225.5 233.9L237.4 239C263.5 250.2 291.6 256 320.1 256C348.6 256 376.6 250.2 402.8 239L414.7 233.9C426.9 228.7 441 234.3 446.2 246.5C451.4 258.7 445.8 272.8 433.6 278L421.7 283.1C404.4 290.5 386.5 296 368.1 299.4L368.1 349.5C368.1 353.8 368.8 358.1 370.2 362.1L398.9 448.2C403.1 460.8 396.3 474.4 383.7 478.6C371.1 482.8 357.5 476 353.3 463.4L328.9 390.2C327.6 386.4 324.1 383.8 320.1 383.8C316.1 383.8 312.5 386.4 311.3 390.2L286.9 463.4C282.7 476 269.1 482.8 256.5 478.6C243.9 474.4 237 461 241.2 448.4L269.9 362.3C271.3 358.2 272 354 272 349.7L272 299.6C253.6 296.1 235.7 290.7 218.4 283.3L206.5 278.2C194.3 273 188.7 258.9 193.9 246.7C199.1 234.5 213.2 228.9 225.4 234.1zM320 144C342.1 144 360 161.9 360 184C360 206.1 342.1 224 320 224C297.9 224 280 206.1 280 184C280 161.9 297.9 144 320 144z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/user-gear-BhRaDoRG.js
	var user_gear_BhRaDoRG_exports = /* @__PURE__ */ __exportAll({ default: () => e$5 });
	var e$5;
	var init_user_gear_BhRaDoRG = __esmMin((() => {
		e$5 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M336.5 192C336.5 147.8 300.7 112 256.5 112C212.3 112 176.5 147.8 176.5 192C176.5 236.2 212.3 272 256.5 272C300.7 272 336.5 236.2 336.5 192zM128.5 192C128.5 121.3 185.8 64 256.5 64C327.2 64 384.5 121.3 384.5 192C384.5 262.7 327.2 320 256.5 320C185.8 320 128.5 262.7 128.5 192zM80.5 544L80.5 552C80.5 565.3 69.8 576 56.5 576C43.2 576 32.5 565.3 32.5 552L32.5 544C32.5 446.8 111.3 368 208.5 368L287.7 368C280.3 383.4 278.8 400.3 282.6 416L208.5 416C137.8 416 80.5 473.3 80.5 544zM432.6 311.6C432.6 298.3 443.3 287.6 456.6 287.6L504.6 287.6C517.9 287.6 528.6 298.3 528.6 311.6L528.6 317.7C528.6 336.6 552.7 350.5 569.1 341.1L574.1 338.2C585.7 331.5 600.6 335.6 607.1 347.3L629.5 387.5C635.7 398.7 632.1 412.7 621.3 419.5L616.6 422.4C600.4 432.5 600.4 462.3 616.6 472.5L621.2 475.4C632 482.2 635.7 496.2 629.5 507.4L607 547.8C600.5 559.5 585.6 563.7 574 556.9L569.1 554C552.7 544.5 528.6 558.5 528.6 577.4L528.6 583.5C528.6 596.8 517.9 607.5 504.6 607.5L456.6 607.5C443.3 607.5 432.6 596.8 432.6 583.5L432.6 577.6C432.6 558.6 408.4 544.6 391.9 554.1L387.1 556.9C375.5 563.6 360.7 559.5 354.1 547.8L331.5 507.4C325.3 496.2 328.9 482.1 339.8 475.3L344.2 472.6C360.5 462.5 360.5 432.5 344.2 422.4L339.7 419.6C328.8 412.8 325.2 398.7 331.4 387.5L353.9 347.2C360.4 335.5 375.3 331.4 386.8 338.1L391.6 340.9C408.1 350.4 432.3 336.4 432.3 317.4L432.3 311.5zM532.5 447.8C532.5 419.1 509.2 395.8 480.5 395.8C451.8 395.8 428.5 419.1 428.5 447.8C428.5 476.5 451.8 499.8 480.5 499.8C509.2 499.8 532.5 476.5 532.5 447.8z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/user-minus-Bs05q1BI.js
	var user_minus_Bs05q1BI_exports = /* @__PURE__ */ __exportAll({ default: () => e$4 });
	var e$4;
	var init_user_minus_Bs05q1BI = __esmMin((() => {
		e$4 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M304 368C401.2 368 480 446.8 480 544L480 552C480 565.3 469.3 576 456 576C442.7 576 432 565.3 432 552L432 544C432 473.3 374.7 416 304 416L208 416C137.3 416 80 473.3 80 544L80 552C80 565.3 69.3 576 56 576C42.7 576 32 565.3 32 552L32 544C32 446.8 110.8 368 208 368L304 368zM256 320C185.3 320 128 262.7 128 192C128 121.3 185.3 64 256 64C326.7 64 384 121.3 384 192C384 262.7 326.7 320 256 320zM256 112C211.8 112 176 147.8 176 192C176 236.2 211.8 272 256 272C300.2 272 336 236.2 336 192C336 147.8 300.2 112 256 112zM600 216C613.3 216 624 226.7 624 240C624 253.3 613.3 264 600 264L456 264C442.7 264 432 253.3 432 240C432 226.7 442.7 216 456 216L600 216z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/user-plus-CHQVg8vJ.js
	var user_plus_CHQVg8vJ_exports = /* @__PURE__ */ __exportAll({ default: () => e$3 });
	var e$3;
	var init_user_plus_CHQVg8vJ = __esmMin((() => {
		e$3 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M304 368C401.2 368 480 446.8 480 544L480 552C480 565.3 469.3 576 456 576C442.7 576 432 565.3 432 552L432 544C432 473.3 374.7 416 304 416L208 416C137.3 416 80 473.3 80 544L80 552C80 565.3 69.3 576 56 576C42.7 576 32 565.3 32 552L32 544C32 446.8 110.8 368 208 368L304 368zM528 144C541.3 144 552 154.7 552 168L552 216L600 216C613.3 216 624 226.7 624 240C624 253.3 613.3 264 600 264L552 264L552 312C552 325.3 541.3 336 528 336C514.7 336 504 325.3 504 312L504 264L456 264C442.7 264 432 253.3 432 240C432 226.7 442.7 216 456 216L504 216L504 168C504 154.7 514.7 144 528 144zM256 320C185.3 320 128 262.7 128 192C128 121.3 185.3 64 256 64C326.7 64 384 121.3 384 192C384 262.7 326.7 320 256 320zM256 112C211.8 112 176 147.8 176 192C176 236.2 211.8 272 256 272C300.2 272 336 236.2 336 192C336 147.8 300.2 112 256 112z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/user-shield-CgAjh-2i.js
	var user_shield_CgAjh_2i_exports = /* @__PURE__ */ __exportAll({ default: () => e$2 });
	var e$2;
	var init_user_shield_CgAjh_2i = __esmMin((() => {
		e$2 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M176 192C176 147.8 211.8 112 256 112C300.2 112 336 147.8 336 192C336 236.2 300.2 272 256 272C211.8 272 176 236.2 176 192zM384 192C384 121.3 326.7 64 256 64C185.3 64 128 121.3 128 192C128 262.7 185.3 320 256 320C326.7 320 384 262.7 384 192zM80 544C80 473.3 137.3 416 208 416L272 416L272 389.3C272 382 273 374.8 274.9 368L208 368C110.8 368 32 446.8 32 544L32 552C32 565.3 42.7 576 56 576C69.3 576 80 565.3 80 552L80 544zM477.3 552.5L464 558.8L464 370.7L560 402.7L560 422.3C560 478.1 527.8 528.8 477.3 552.6zM453.9 323.5L341.9 360.8C328.8 365.2 320 377.4 320 391.2L320 422.3C320 496.7 363 564.4 430.2 596L448.7 604.7C453.5 606.9 458.7 608.1 463.9 608.1C469.1 608.1 474.4 606.9 479.1 604.7L497.6 596C565 564.3 608 496.6 608 422.2L608 391.1C608 377.3 599.2 365.1 586.1 360.7L474.1 323.4C467.5 321.2 460.4 321.2 453.9 323.4z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/user-D-zw7BEo.js
	var user_D_zw7BEo_exports = /* @__PURE__ */ __exportAll({ default: () => e$1 });
	var e$1;
	var init_user_D_zw7BEo = __esmMin((() => {
		e$1 = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M240 192C240 147.8 275.8 112 320 112C364.2 112 400 147.8 400 192C400 236.2 364.2 272 320 272C275.8 272 240 236.2 240 192zM448 192C448 121.3 390.7 64 320 64C249.3 64 192 121.3 192 192C192 262.7 249.3 320 320 320C390.7 320 448 262.7 448 192zM144 544C144 473.3 201.3 416 272 416L368 416C438.7 416 496 473.3 496 544L496 552C496 565.3 506.7 576 520 576C533.3 576 544 565.3 544 552L544 544C544 446.8 465.2 368 368 368L272 368C174.8 368 96 446.8 96 544L96 552C96 565.3 106.7 576 120 576C133.3 576 144 565.3 144 552L144 544z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/users-D64F_GLf.js
	var users_D64F_GLf_exports = /* @__PURE__ */ __exportAll({ default: () => e });
	var e;
	var init_users_D64F_GLf = __esmMin((() => {
		e = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><!--! Font Awesome Pro 7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M320 256C355.3 256 384 227.3 384 192C384 156.7 355.3 128 320 128C284.7 128 256 156.7 256 192C256 227.3 284.7 256 320 256zM320 80C381.9 80 432 130.1 432 192C432 253.9 381.9 304 320 304C258.1 304 208 253.9 208 192C208 130.1 258.1 80 320 80zM296 400C238.6 400 192 446.6 192 504L192 520C192 533.3 181.3 544 168 544C154.7 544 144 533.3 144 520L144 504C144 420.1 212.1 352 296 352L344 352C427.9 352 496 420.1 496 504L496 520C496 533.3 485.3 544 472 544C458.7 544 448 533.3 448 520L448 504C448 446.6 401.4 400 344 400L296 400zM431.4 306.8C443.1 295.5 453 282.4 460.8 268C466.7 270.6 473.2 272 480 272C506.5 272 528 250.5 528 224C528 197.5 506.5 176 480 176L479.2 176C477.6 159.4 473.4 143.6 467.1 128.9C471.3 128.3 475.7 128 480 128C533 128 576 171 576 224C576 277 533 320 480 320C462.3 320 445.7 315.2 431.4 306.8zM160 128C164.4 128 168.7 128.3 172.9 128.9C166.6 143.6 162.4 159.5 160.8 176L160 176C133.5 176 112 197.5 112 224C112 250.5 133.5 272 160 272C166.8 272 173.3 270.6 179.2 268C187 282.4 196.9 295.5 208.6 306.8C194.4 315.2 177.8 320 160 320C107 320 64 277 64 224C64 171 107 128 160 128zM149.3 368C134.2 384.3 121.8 403 112.8 423.6C74.8 439.1 48 476.4 48 520C48 533.3 37.3 544 24 544C10.7 544 0 533.3 0 520C0 436.9 66.6 369.4 149.3 368zM527.2 423.6C518.2 403 505.7 384.2 490.7 368C573.4 369.4 640 436.9 640 520C640 533.3 629.3 544 616 544C602.7 544 592 533.3 592 520C592 476.4 565.2 439.1 527.2 423.6z\"/></svg>";
	}));
	//#endregion
	//#region node_modules/@elastisafe/components/dist/components.es.js
	function ce(e) {
		var t, n, r = "";
		if (typeof e == "string" || typeof e == "number") r += e;
		else if (typeof e == "object") if (Array.isArray(e)) {
			var i = e.length;
			for (t = 0; t < i; t++) e[t] && (n = ce(e[t])) && (r && (r += " "), r += n);
		} else for (n in e) e[n] && (r && (r += " "), r += n);
		return r;
	}
	function le() {
		for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = ce(e)) && (r && (r += " "), r += t);
		return r;
	}
	var de = (e, t) => {
		let n = Array(e.length + t.length);
		for (let t = 0; t < e.length; t++) n[t] = e[t];
		for (let r = 0; r < t.length; r++) n[e.length + r] = t[r];
		return n;
	};
	var fe = (e, t) => ({
		classGroupId: e,
		validator: t
	});
	var M = (e = /* @__PURE__ */ new Map(), t = null, n) => ({
		nextPart: e,
		validators: t,
		classGroupId: n
	});
	var pe = "-";
	var me = [];
	var he = "arbitrary..";
	var ge = (e) => {
		let t = ye(e), { conflictingClassGroups: n, conflictingClassGroupModifiers: r } = e;
		return {
			getClassGroupId: (e) => {
				if (e.startsWith("[") && e.endsWith("]")) return ve(e);
				let n = e.split(pe);
				return _e(n, +(n[0] === "" && n.length > 1), t);
			},
			getConflictingClassGroupIds: (e, t) => {
				if (t) {
					let t = r[e], i = n[e];
					return t ? i ? de(i, t) : t : i || me;
				}
				return n[e] || me;
			}
		};
	};
	var _e = (e, t, n) => {
		if (e.length - t === 0) return n.classGroupId;
		let r = e[t], i = n.nextPart.get(r);
		if (i) {
			let n = _e(e, t + 1, i);
			if (n) return n;
		}
		let a = n.validators;
		if (a === null) return;
		let o = t === 0 ? e.join(pe) : e.slice(t).join(pe), s = a.length;
		for (let e = 0; e < s; e++) {
			let t = a[e];
			if (t.validator(o)) return t.classGroupId;
		}
	};
	var ve = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
		let t = e.slice(1, -1), n = t.indexOf(":"), r = t.slice(0, n);
		return r ? he + r : void 0;
	})();
	var ye = (e) => {
		let { theme: t, classGroups: n } = e;
		return be(n, t);
	};
	var be = (e, t) => {
		let n = M();
		for (let r in e) {
			let i = e[r];
			xe(i, n, r, t);
		}
		return n;
	};
	var xe = (e, t, n, r) => {
		let i = e.length;
		for (let a = 0; a < i; a++) {
			let i = e[a];
			Se(i, t, n, r);
		}
	};
	var Se = (e, t, n, r) => {
		if (typeof e == "string") {
			Ce(e, t, n);
			return;
		}
		if (typeof e == "function") {
			we(e, t, n, r);
			return;
		}
		Te(e, t, n, r);
	};
	var Ce = (e, t, n) => {
		let r = e === "" ? t : Ee(t, e);
		r.classGroupId = n;
	};
	var we = (e, t, n, r) => {
		if (De(e)) {
			xe(e(r), t, n, r);
			return;
		}
		t.validators === null && (t.validators = []), t.validators.push(fe(n, e));
	};
	var Te = (e, t, n, r) => {
		let i = Object.entries(e), a = i.length;
		for (let e = 0; e < a; e++) {
			let [a, o] = i[e];
			xe(o, Ee(t, a), n, r);
		}
	};
	var Ee = (e, t) => {
		let n = e, r = t.split(pe), i = r.length;
		for (let e = 0; e < i; e++) {
			let t = r[e], i = n.nextPart.get(t);
			i || (i = M(), n.nextPart.set(t, i)), n = i;
		}
		return n;
	};
	var De = (e) => "isThemeGetter" in e && e.isThemeGetter === !0;
	var Oe = (e) => {
		if (e < 1) return {
			get: () => void 0,
			set: () => {}
		};
		let t = 0, n = Object.create(null), r = Object.create(null), i = (i, a) => {
			n[i] = a, t++, t > e && (t = 0, r = n, n = Object.create(null));
		};
		return {
			get(e) {
				let t = n[e];
				if (t !== void 0) return t;
				if ((t = r[e]) !== void 0) return i(e, t), t;
			},
			set(e, t) {
				e in n ? n[e] = t : i(e, t);
			}
		};
	};
	var N = "!";
	var ke = ":";
	var Ae = [];
	var je = (e, t, n, r, i) => ({
		modifiers: e,
		hasImportantModifier: t,
		baseClassName: n,
		maybePostfixModifierPosition: r,
		isExternal: i
	});
	var Me = (e) => {
		let { prefix: t, experimentalParseClassName: n } = e, r = (e) => {
			let t = [], n = 0, r = 0, i = 0, a, o = e.length;
			for (let s = 0; s < o; s++) {
				let o = e[s];
				if (n === 0 && r === 0) {
					if (o === ke) {
						t.push(e.slice(i, s)), i = s + 1;
						continue;
					}
					if (o === "/") {
						a = s;
						continue;
					}
				}
				o === "[" ? n++ : o === "]" ? n-- : o === "(" ? r++ : o === ")" && r--;
			}
			let s = t.length === 0 ? e : e.slice(i), c = s, l = !1;
			s.endsWith(N) ? (c = s.slice(0, -1), l = !0) : s.startsWith(N) && (c = s.slice(1), l = !0);
			let u = a && a > i ? a - i : void 0;
			return je(t, l, c, u);
		};
		if (t) {
			let e = t + ke, n = r;
			r = (t) => t.startsWith(e) ? n(t.slice(e.length)) : je(Ae, !1, t, void 0, !0);
		}
		if (n) {
			let e = r;
			r = (t) => n({
				className: t,
				parseClassName: e
			});
		}
		return r;
	};
	var Ne = (e) => {
		let t = /* @__PURE__ */ new Map();
		return e.orderSensitiveModifiers.forEach((e, n) => {
			t.set(e, 1e6 + n);
		}), (e) => {
			let n = [], r = [];
			for (let i = 0; i < e.length; i++) {
				let a = e[i], o = a[0] === "[", s = t.has(a);
				o || s ? (r.length > 0 && (r.sort(), n.push(...r), r = []), n.push(a)) : r.push(a);
			}
			return r.length > 0 && (r.sort(), n.push(...r)), n;
		};
	};
	var Pe = (e) => ({
		cache: Oe(e.cacheSize),
		parseClassName: Me(e),
		sortModifiers: Ne(e),
		postfixLookupClassGroupIds: Fe(e),
		...ge(e)
	});
	var Fe = (e) => {
		let t = Object.create(null), n = e.postfixLookupClassGroups;
		if (n) for (let e = 0; e < n.length; e++) t[n[e]] = !0;
		return t;
	};
	var Ie = /\s+/;
	var Le = (e, t) => {
		let { parseClassName: n, getClassGroupId: r, getConflictingClassGroupIds: i, sortModifiers: a, postfixLookupClassGroupIds: o } = t, s = [], c = e.trim().split(Ie), l = "";
		for (let e = c.length - 1; e >= 0; --e) {
			let t = c[e], { isExternal: u, modifiers: d, hasImportantModifier: f, baseClassName: p, maybePostfixModifierPosition: m } = n(t);
			if (u) {
				l = t + (l.length > 0 ? " " + l : l);
				continue;
			}
			let h = !!m, g;
			if (h) {
				g = r(p.substring(0, m));
				let e = g && o[g] ? r(p) : void 0;
				e && e !== g && (g = e, h = !1);
			} else g = r(p);
			if (!g) {
				if (!h) {
					l = t + (l.length > 0 ? " " + l : l);
					continue;
				}
				if (g = r(p), !g) {
					l = t + (l.length > 0 ? " " + l : l);
					continue;
				}
				h = !1;
			}
			let _ = d.length === 0 ? "" : d.length === 1 ? d[0] : a(d).join(":"), v = f ? _ + N : _, y = v + g;
			if (s.indexOf(y) > -1) continue;
			s.push(y);
			let b = i(g, h);
			for (let e = 0; e < b.length; ++e) {
				let t = b[e];
				s.push(v + t);
			}
			l = t + (l.length > 0 ? " " + l : l);
		}
		return l;
	};
	var Re = (...e) => {
		let t = 0, n, r, i = "";
		for (; t < e.length;) (n = e[t++]) && (r = ze(n)) && (i && (i += " "), i += r);
		return i;
	};
	var ze = (e) => {
		if (typeof e == "string") return e;
		let t, n = "";
		for (let r = 0; r < e.length; r++) e[r] && (t = ze(e[r])) && (n && (n += " "), n += t);
		return n;
	};
	var Be = (e, ...t) => {
		let n, r, i, a, o = (o) => (n = Pe(t.reduce((e, t) => t(e), e())), r = n.cache.get, i = n.cache.set, a = s, s(o)), s = (e) => {
			let t = r(e);
			if (t) return t;
			let a = Le(e, n);
			return i(e, a), a;
		};
		return a = o, (...e) => a(Re(...e));
	};
	var Ve = [];
	var P = (e) => {
		let t = (t) => t[e] || Ve;
		return t.isThemeGetter = !0, t;
	};
	var He = /^\[(?:(\w[\w-]*):)?(.+)\]$/i;
	var Ue = /^\((?:(\w[\w-]*):)?(.+)\)$/i;
	var We = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/;
	var Ge = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/;
	var Ke = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/;
	var qe = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/;
	var Je = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/;
	var Ye = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/;
	var Xe = (e) => We.test(e);
	var F = (e) => !!e && !Number.isNaN(Number(e));
	var Ze = (e) => !!e && Number.isInteger(Number(e));
	var Qe = (e) => e.endsWith("%") && F(e.slice(0, -1));
	var $e = (e) => Ge.test(e);
	var et = () => !0;
	var tt = (e) => Ke.test(e) && !qe.test(e);
	var nt = () => !1;
	var rt = (e) => Je.test(e);
	var it = (e) => Ye.test(e);
	var at = (e) => !I(e) && !L(e);
	var ot = (e) => e.startsWith("@container") && (e[10] === "/" && e[11] !== void 0 || e[11] === "s" && e[16] !== void 0 && e.startsWith("-size/", 10) || e[11] === "n" && e[18] !== void 0 && e.startsWith("-normal/", 10));
	var st = (e) => St(e, Et, nt);
	var I = (e) => He.test(e);
	var ct = (e) => St(e, Dt, tt);
	var lt = (e) => St(e, Ot, F);
	var ut = (e) => St(e, At, et);
	var dt = (e) => St(e, kt, nt);
	var ft = (e) => St(e, wt, nt);
	var pt = (e) => St(e, Tt, it);
	var mt = (e) => St(e, jt, rt);
	var L = (e) => Ue.test(e);
	var ht = (e) => Ct(e, Dt);
	var gt = (e) => Ct(e, kt);
	var _t = (e) => Ct(e, wt);
	var vt = (e) => Ct(e, Et);
	var yt = (e) => Ct(e, Tt);
	var bt = (e) => Ct(e, jt, !0);
	var xt = (e) => Ct(e, At, !0);
	var St = (e, t, n) => {
		let r = He.exec(e);
		return r ? r[1] ? t(r[1]) : n(r[2]) : !1;
	};
	var Ct = (e, t, n = !1) => {
		let r = Ue.exec(e);
		return r ? r[1] ? t(r[1]) : n : !1;
	};
	var wt = (e) => e === "position" || e === "percentage";
	var Tt = (e) => e === "image" || e === "url";
	var Et = (e) => e === "length" || e === "size" || e === "bg-size";
	var Dt = (e) => e === "length";
	var Ot = (e) => e === "number";
	var kt = (e) => e === "family-name";
	var At = (e) => e === "number" || e === "weight";
	var jt = (e) => e === "shadow";
	var Mt = /*#__PURE__*/ Be(() => {
		let e = P("color"), t = P("font"), n = P("text"), r = P("font-weight"), i = P("tracking"), a = P("leading"), o = P("breakpoint"), s = P("container"), c = P("spacing"), l = P("radius"), u = P("shadow"), d = P("inset-shadow"), f = P("text-shadow"), p = P("drop-shadow"), m = P("blur"), h = P("perspective"), g = P("aspect"), _ = P("ease"), v = P("animate"), y = () => [
			"auto",
			"avoid",
			"all",
			"avoid-page",
			"page",
			"left",
			"right",
			"column"
		], b = () => [
			"center",
			"top",
			"bottom",
			"left",
			"right",
			"top-left",
			"left-top",
			"top-right",
			"right-top",
			"bottom-right",
			"right-bottom",
			"bottom-left",
			"left-bottom"
		], x = () => [
			...b(),
			L,
			I
		], S = () => [
			"auto",
			"hidden",
			"clip",
			"visible",
			"scroll"
		], C = () => [
			"auto",
			"contain",
			"none"
		], w = () => [
			L,
			I,
			c
		], T = () => [
			Xe,
			"full",
			"auto",
			...w()
		], ee = () => [
			Ze,
			"none",
			"subgrid",
			L,
			I
		], te = () => [
			"auto",
			{ span: [
				"full",
				Ze,
				L,
				I
			] },
			Ze,
			L,
			I
		], E = () => [
			Ze,
			"auto",
			L,
			I
		], ne = () => [
			"auto",
			"min",
			"max",
			"fr",
			L,
			I
		], re = () => [
			"start",
			"end",
			"center",
			"between",
			"around",
			"evenly",
			"stretch",
			"baseline",
			"center-safe",
			"end-safe"
		], D = () => [
			"start",
			"end",
			"center",
			"stretch",
			"center-safe",
			"end-safe"
		], O = () => ["auto", ...w()], ie = () => [
			Xe,
			"auto",
			"full",
			"dvw",
			"dvh",
			"lvw",
			"lvh",
			"svw",
			"svh",
			"min",
			"max",
			"fit",
			...w()
		], ae = () => [
			Xe,
			"screen",
			"full",
			"dvw",
			"lvw",
			"svw",
			"min",
			"max",
			"fit",
			...w()
		], oe = () => [
			Xe,
			"screen",
			"full",
			"lh",
			"dvh",
			"lvh",
			"svh",
			"min",
			"max",
			"fit",
			...w()
		], k = () => [
			e,
			L,
			I
		], se = () => [
			...b(),
			_t,
			ft,
			{ position: [L, I] }
		], ce = () => ["no-repeat", { repeat: [
			"",
			"x",
			"y",
			"space",
			"round"
		] }], le = () => [
			"auto",
			"cover",
			"contain",
			vt,
			st,
			{ size: [L, I] }
		], ue = () => [
			Qe,
			ht,
			ct
		], A = () => [
			"",
			"none",
			"full",
			l,
			L,
			I
		], j = () => [
			"",
			F,
			ht,
			ct
		], de = () => [
			"solid",
			"dashed",
			"dotted",
			"double"
		], fe = () => [
			"normal",
			"multiply",
			"screen",
			"overlay",
			"darken",
			"lighten",
			"color-dodge",
			"color-burn",
			"hard-light",
			"soft-light",
			"difference",
			"exclusion",
			"hue",
			"saturation",
			"color",
			"luminosity"
		], M = () => [
			F,
			Qe,
			_t,
			ft
		], pe = () => [
			"",
			"none",
			m,
			L,
			I
		], me = () => [
			"none",
			F,
			L,
			I
		], he = () => [
			"none",
			F,
			L,
			I
		], ge = () => [
			F,
			L,
			I
		], _e = () => [
			Xe,
			"full",
			...w()
		];
		return {
			cacheSize: 500,
			theme: {
				animate: [
					"spin",
					"ping",
					"pulse",
					"bounce"
				],
				aspect: ["video"],
				blur: [$e],
				breakpoint: [$e],
				color: [et],
				container: [$e],
				"drop-shadow": [$e],
				ease: [
					"in",
					"out",
					"in-out"
				],
				font: [at],
				"font-weight": [
					"thin",
					"extralight",
					"light",
					"normal",
					"medium",
					"semibold",
					"bold",
					"extrabold",
					"black"
				],
				"inset-shadow": [$e],
				leading: [
					"none",
					"tight",
					"snug",
					"normal",
					"relaxed",
					"loose"
				],
				perspective: [
					"dramatic",
					"near",
					"normal",
					"midrange",
					"distant",
					"none"
				],
				radius: [$e],
				shadow: [$e],
				spacing: ["px", F],
				text: [$e],
				"text-shadow": [$e],
				tracking: [
					"tighter",
					"tight",
					"normal",
					"wide",
					"wider",
					"widest"
				]
			},
			classGroups: {
				aspect: [{ aspect: [
					"auto",
					"square",
					Xe,
					I,
					L,
					g
				] }],
				container: ["container"],
				"container-type": [{ "@container": [
					"",
					"normal",
					"size",
					L,
					I
				] }],
				"container-named": [ot],
				columns: [{ columns: [
					F,
					I,
					L,
					s
				] }],
				"break-after": [{ "break-after": y() }],
				"break-before": [{ "break-before": y() }],
				"break-inside": [{ "break-inside": [
					"auto",
					"avoid",
					"avoid-page",
					"avoid-column"
				] }],
				"box-decoration": [{ "box-decoration": ["slice", "clone"] }],
				box: [{ box: ["border", "content"] }],
				display: [
					"block",
					"inline-block",
					"inline",
					"flex",
					"inline-flex",
					"table",
					"inline-table",
					"table-caption",
					"table-cell",
					"table-column",
					"table-column-group",
					"table-footer-group",
					"table-header-group",
					"table-row-group",
					"table-row",
					"flow-root",
					"grid",
					"inline-grid",
					"contents",
					"list-item",
					"hidden"
				],
				sr: ["sr-only", "not-sr-only"],
				float: [{ float: [
					"right",
					"left",
					"none",
					"start",
					"end"
				] }],
				clear: [{ clear: [
					"left",
					"right",
					"both",
					"none",
					"start",
					"end"
				] }],
				isolation: ["isolate", "isolation-auto"],
				"object-fit": [{ object: [
					"contain",
					"cover",
					"fill",
					"none",
					"scale-down"
				] }],
				"object-position": [{ object: x() }],
				overflow: [{ overflow: S() }],
				"overflow-x": [{ "overflow-x": S() }],
				"overflow-y": [{ "overflow-y": S() }],
				overscroll: [{ overscroll: C() }],
				"overscroll-x": [{ "overscroll-x": C() }],
				"overscroll-y": [{ "overscroll-y": C() }],
				position: [
					"static",
					"fixed",
					"absolute",
					"relative",
					"sticky"
				],
				inset: [{ inset: T() }],
				"inset-x": [{ "inset-x": T() }],
				"inset-y": [{ "inset-y": T() }],
				start: [{
					"inset-s": T(),
					start: T()
				}],
				end: [{
					"inset-e": T(),
					end: T()
				}],
				"inset-bs": [{ "inset-bs": T() }],
				"inset-be": [{ "inset-be": T() }],
				top: [{ top: T() }],
				right: [{ right: T() }],
				bottom: [{ bottom: T() }],
				left: [{ left: T() }],
				visibility: [
					"visible",
					"invisible",
					"collapse"
				],
				z: [{ z: [
					Ze,
					"auto",
					L,
					I
				] }],
				basis: [{ basis: [
					Xe,
					"full",
					"auto",
					s,
					...w()
				] }],
				"flex-direction": [{ flex: [
					"row",
					"row-reverse",
					"col",
					"col-reverse"
				] }],
				"flex-wrap": [{ flex: [
					"nowrap",
					"wrap",
					"wrap-reverse"
				] }],
				flex: [{ flex: [
					F,
					Xe,
					"auto",
					"initial",
					"none",
					I
				] }],
				grow: [{ grow: [
					"",
					F,
					L,
					I
				] }],
				shrink: [{ shrink: [
					"",
					F,
					L,
					I
				] }],
				order: [{ order: [
					Ze,
					"first",
					"last",
					"none",
					L,
					I
				] }],
				"grid-cols": [{ "grid-cols": ee() }],
				"col-start-end": [{ col: te() }],
				"col-start": [{ "col-start": E() }],
				"col-end": [{ "col-end": E() }],
				"grid-rows": [{ "grid-rows": ee() }],
				"row-start-end": [{ row: te() }],
				"row-start": [{ "row-start": E() }],
				"row-end": [{ "row-end": E() }],
				"grid-flow": [{ "grid-flow": [
					"row",
					"col",
					"dense",
					"row-dense",
					"col-dense"
				] }],
				"auto-cols": [{ "auto-cols": ne() }],
				"auto-rows": [{ "auto-rows": ne() }],
				gap: [{ gap: w() }],
				"gap-x": [{ "gap-x": w() }],
				"gap-y": [{ "gap-y": w() }],
				"justify-content": [{ justify: [...re(), "normal"] }],
				"justify-items": [{ "justify-items": [...D(), "normal"] }],
				"justify-self": [{ "justify-self": ["auto", ...D()] }],
				"align-content": [{ content: ["normal", ...re()] }],
				"align-items": [{ items: [...D(), { baseline: ["", "last"] }] }],
				"align-self": [{ self: [
					"auto",
					...D(),
					{ baseline: ["", "last"] }
				] }],
				"place-content": [{ "place-content": re() }],
				"place-items": [{ "place-items": [...D(), "baseline"] }],
				"place-self": [{ "place-self": ["auto", ...D()] }],
				p: [{ p: w() }],
				px: [{ px: w() }],
				py: [{ py: w() }],
				ps: [{ ps: w() }],
				pe: [{ pe: w() }],
				pbs: [{ pbs: w() }],
				pbe: [{ pbe: w() }],
				pt: [{ pt: w() }],
				pr: [{ pr: w() }],
				pb: [{ pb: w() }],
				pl: [{ pl: w() }],
				m: [{ m: O() }],
				mx: [{ mx: O() }],
				my: [{ my: O() }],
				ms: [{ ms: O() }],
				me: [{ me: O() }],
				mbs: [{ mbs: O() }],
				mbe: [{ mbe: O() }],
				mt: [{ mt: O() }],
				mr: [{ mr: O() }],
				mb: [{ mb: O() }],
				ml: [{ ml: O() }],
				"space-x": [{ "space-x": w() }],
				"space-x-reverse": ["space-x-reverse"],
				"space-y": [{ "space-y": w() }],
				"space-y-reverse": ["space-y-reverse"],
				size: [{ size: ie() }],
				"inline-size": [{ inline: ["auto", ...ae()] }],
				"min-inline-size": [{ "min-inline": ["auto", ...ae()] }],
				"max-inline-size": [{ "max-inline": ["none", ...ae()] }],
				"block-size": [{ block: ["auto", ...oe()] }],
				"min-block-size": [{ "min-block": ["auto", ...oe()] }],
				"max-block-size": [{ "max-block": ["none", ...oe()] }],
				w: [{ w: [
					s,
					"screen",
					...ie()
				] }],
				"min-w": [{ "min-w": [
					s,
					"screen",
					"none",
					...ie()
				] }],
				"max-w": [{ "max-w": [
					s,
					"screen",
					"none",
					"prose",
					{ screen: [o] },
					...ie()
				] }],
				h: [{ h: [
					"screen",
					"lh",
					...ie()
				] }],
				"min-h": [{ "min-h": [
					"screen",
					"lh",
					"none",
					...ie()
				] }],
				"max-h": [{ "max-h": [
					"screen",
					"lh",
					...ie()
				] }],
				"font-size": [{ text: [
					"base",
					n,
					ht,
					ct
				] }],
				"font-smoothing": ["antialiased", "subpixel-antialiased"],
				"font-style": ["italic", "not-italic"],
				"font-weight": [{ font: [
					r,
					xt,
					ut
				] }],
				"font-stretch": [{ "font-stretch": [
					"ultra-condensed",
					"extra-condensed",
					"condensed",
					"semi-condensed",
					"normal",
					"semi-expanded",
					"expanded",
					"extra-expanded",
					"ultra-expanded",
					Qe,
					I
				] }],
				"font-family": [{ font: [
					gt,
					dt,
					t
				] }],
				"font-features": [{ "font-features": [I] }],
				"fvn-normal": ["normal-nums"],
				"fvn-ordinal": ["ordinal"],
				"fvn-slashed-zero": ["slashed-zero"],
				"fvn-figure": ["lining-nums", "oldstyle-nums"],
				"fvn-spacing": ["proportional-nums", "tabular-nums"],
				"fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
				tracking: [{ tracking: [
					i,
					L,
					I
				] }],
				"line-clamp": [{ "line-clamp": [
					F,
					"none",
					L,
					lt
				] }],
				leading: [{ leading: [a, ...w()] }],
				"list-image": [{ "list-image": [
					"none",
					L,
					I
				] }],
				"list-style-position": [{ list: ["inside", "outside"] }],
				"list-style-type": [{ list: [
					"disc",
					"decimal",
					"none",
					L,
					I
				] }],
				"text-alignment": [{ text: [
					"left",
					"center",
					"right",
					"justify",
					"start",
					"end"
				] }],
				"placeholder-color": [{ placeholder: k() }],
				"text-color": [{ text: k() }],
				"text-decoration": [
					"underline",
					"overline",
					"line-through",
					"no-underline"
				],
				"text-decoration-style": [{ decoration: [...de(), "wavy"] }],
				"text-decoration-thickness": [{ decoration: [
					F,
					"from-font",
					"auto",
					L,
					ct
				] }],
				"text-decoration-color": [{ decoration: k() }],
				"underline-offset": [{ "underline-offset": [
					F,
					"auto",
					L,
					I
				] }],
				"text-transform": [
					"uppercase",
					"lowercase",
					"capitalize",
					"normal-case"
				],
				"text-overflow": [
					"truncate",
					"text-ellipsis",
					"text-clip"
				],
				"text-wrap": [{ text: [
					"wrap",
					"nowrap",
					"balance",
					"pretty"
				] }],
				indent: [{ indent: w() }],
				"tab-size": [{ tab: [
					Ze,
					L,
					I
				] }],
				"vertical-align": [{ align: [
					"baseline",
					"top",
					"middle",
					"bottom",
					"text-top",
					"text-bottom",
					"sub",
					"super",
					L,
					I
				] }],
				whitespace: [{ whitespace: [
					"normal",
					"nowrap",
					"pre",
					"pre-line",
					"pre-wrap",
					"break-spaces"
				] }],
				break: [{ break: [
					"normal",
					"words",
					"all",
					"keep"
				] }],
				wrap: [{ wrap: [
					"break-word",
					"anywhere",
					"normal"
				] }],
				hyphens: [{ hyphens: [
					"none",
					"manual",
					"auto"
				] }],
				content: [{ content: [
					"none",
					L,
					I
				] }],
				"bg-attachment": [{ bg: [
					"fixed",
					"local",
					"scroll"
				] }],
				"bg-clip": [{ "bg-clip": [
					"border",
					"padding",
					"content",
					"text"
				] }],
				"bg-origin": [{ "bg-origin": [
					"border",
					"padding",
					"content"
				] }],
				"bg-position": [{ bg: se() }],
				"bg-repeat": [{ bg: ce() }],
				"bg-size": [{ bg: le() }],
				"bg-image": [{ bg: [
					"none",
					{
						linear: [
							{ to: [
								"t",
								"tr",
								"r",
								"br",
								"b",
								"bl",
								"l",
								"tl"
							] },
							Ze,
							L,
							I
						],
						radial: [
							"",
							L,
							I
						],
						conic: [
							Ze,
							L,
							I
						]
					},
					yt,
					pt
				] }],
				"bg-color": [{ bg: k() }],
				"gradient-from-pos": [{ from: ue() }],
				"gradient-via-pos": [{ via: ue() }],
				"gradient-to-pos": [{ to: ue() }],
				"gradient-from": [{ from: k() }],
				"gradient-via": [{ via: k() }],
				"gradient-to": [{ to: k() }],
				rounded: [{ rounded: A() }],
				"rounded-s": [{ "rounded-s": A() }],
				"rounded-e": [{ "rounded-e": A() }],
				"rounded-t": [{ "rounded-t": A() }],
				"rounded-r": [{ "rounded-r": A() }],
				"rounded-b": [{ "rounded-b": A() }],
				"rounded-l": [{ "rounded-l": A() }],
				"rounded-ss": [{ "rounded-ss": A() }],
				"rounded-se": [{ "rounded-se": A() }],
				"rounded-ee": [{ "rounded-ee": A() }],
				"rounded-es": [{ "rounded-es": A() }],
				"rounded-tl": [{ "rounded-tl": A() }],
				"rounded-tr": [{ "rounded-tr": A() }],
				"rounded-br": [{ "rounded-br": A() }],
				"rounded-bl": [{ "rounded-bl": A() }],
				"border-w": [{ border: j() }],
				"border-w-x": [{ "border-x": j() }],
				"border-w-y": [{ "border-y": j() }],
				"border-w-s": [{ "border-s": j() }],
				"border-w-e": [{ "border-e": j() }],
				"border-w-bs": [{ "border-bs": j() }],
				"border-w-be": [{ "border-be": j() }],
				"border-w-t": [{ "border-t": j() }],
				"border-w-r": [{ "border-r": j() }],
				"border-w-b": [{ "border-b": j() }],
				"border-w-l": [{ "border-l": j() }],
				"divide-x": [{ "divide-x": j() }],
				"divide-x-reverse": ["divide-x-reverse"],
				"divide-y": [{ "divide-y": j() }],
				"divide-y-reverse": ["divide-y-reverse"],
				"border-style": [{ border: [
					...de(),
					"hidden",
					"none"
				] }],
				"divide-style": [{ divide: [
					...de(),
					"hidden",
					"none"
				] }],
				"border-color": [{ border: k() }],
				"border-color-x": [{ "border-x": k() }],
				"border-color-y": [{ "border-y": k() }],
				"border-color-s": [{ "border-s": k() }],
				"border-color-e": [{ "border-e": k() }],
				"border-color-bs": [{ "border-bs": k() }],
				"border-color-be": [{ "border-be": k() }],
				"border-color-t": [{ "border-t": k() }],
				"border-color-r": [{ "border-r": k() }],
				"border-color-b": [{ "border-b": k() }],
				"border-color-l": [{ "border-l": k() }],
				"divide-color": [{ divide: k() }],
				"outline-style": [{ outline: [
					...de(),
					"none",
					"hidden"
				] }],
				"outline-offset": [{ "outline-offset": [
					F,
					L,
					I
				] }],
				"outline-w": [{ outline: [
					"",
					F,
					ht,
					ct
				] }],
				"outline-color": [{ outline: k() }],
				shadow: [{ shadow: [
					"",
					"none",
					u,
					bt,
					mt
				] }],
				"shadow-color": [{ shadow: k() }],
				"inset-shadow": [{ "inset-shadow": [
					"none",
					d,
					bt,
					mt
				] }],
				"inset-shadow-color": [{ "inset-shadow": k() }],
				"ring-w": [{ ring: j() }],
				"ring-w-inset": ["ring-inset"],
				"ring-color": [{ ring: k() }],
				"ring-offset-w": [{ "ring-offset": [F, ct] }],
				"ring-offset-color": [{ "ring-offset": k() }],
				"inset-ring-w": [{ "inset-ring": j() }],
				"inset-ring-color": [{ "inset-ring": k() }],
				"text-shadow": [{ "text-shadow": [
					"none",
					f,
					bt,
					mt
				] }],
				"text-shadow-color": [{ "text-shadow": k() }],
				opacity: [{ opacity: [
					F,
					L,
					I
				] }],
				"mix-blend": [{ "mix-blend": [
					...fe(),
					"plus-darker",
					"plus-lighter"
				] }],
				"bg-blend": [{ "bg-blend": fe() }],
				"mask-clip": [{ "mask-clip": [
					"border",
					"padding",
					"content",
					"fill",
					"stroke",
					"view"
				] }, "mask-no-clip"],
				"mask-composite": [{ mask: [
					"add",
					"subtract",
					"intersect",
					"exclude"
				] }],
				"mask-image-linear-pos": [{ "mask-linear": [F] }],
				"mask-image-linear-from-pos": [{ "mask-linear-from": M() }],
				"mask-image-linear-to-pos": [{ "mask-linear-to": M() }],
				"mask-image-linear-from-color": [{ "mask-linear-from": k() }],
				"mask-image-linear-to-color": [{ "mask-linear-to": k() }],
				"mask-image-t-from-pos": [{ "mask-t-from": M() }],
				"mask-image-t-to-pos": [{ "mask-t-to": M() }],
				"mask-image-t-from-color": [{ "mask-t-from": k() }],
				"mask-image-t-to-color": [{ "mask-t-to": k() }],
				"mask-image-r-from-pos": [{ "mask-r-from": M() }],
				"mask-image-r-to-pos": [{ "mask-r-to": M() }],
				"mask-image-r-from-color": [{ "mask-r-from": k() }],
				"mask-image-r-to-color": [{ "mask-r-to": k() }],
				"mask-image-b-from-pos": [{ "mask-b-from": M() }],
				"mask-image-b-to-pos": [{ "mask-b-to": M() }],
				"mask-image-b-from-color": [{ "mask-b-from": k() }],
				"mask-image-b-to-color": [{ "mask-b-to": k() }],
				"mask-image-l-from-pos": [{ "mask-l-from": M() }],
				"mask-image-l-to-pos": [{ "mask-l-to": M() }],
				"mask-image-l-from-color": [{ "mask-l-from": k() }],
				"mask-image-l-to-color": [{ "mask-l-to": k() }],
				"mask-image-x-from-pos": [{ "mask-x-from": M() }],
				"mask-image-x-to-pos": [{ "mask-x-to": M() }],
				"mask-image-x-from-color": [{ "mask-x-from": k() }],
				"mask-image-x-to-color": [{ "mask-x-to": k() }],
				"mask-image-y-from-pos": [{ "mask-y-from": M() }],
				"mask-image-y-to-pos": [{ "mask-y-to": M() }],
				"mask-image-y-from-color": [{ "mask-y-from": k() }],
				"mask-image-y-to-color": [{ "mask-y-to": k() }],
				"mask-image-radial": [{ "mask-radial": [L, I] }],
				"mask-image-radial-from-pos": [{ "mask-radial-from": M() }],
				"mask-image-radial-to-pos": [{ "mask-radial-to": M() }],
				"mask-image-radial-from-color": [{ "mask-radial-from": k() }],
				"mask-image-radial-to-color": [{ "mask-radial-to": k() }],
				"mask-image-radial-shape": [{ "mask-radial": ["circle", "ellipse"] }],
				"mask-image-radial-size": [{ "mask-radial": [{
					closest: ["side", "corner"],
					farthest: ["side", "corner"]
				}] }],
				"mask-image-radial-pos": [{ "mask-radial-at": b() }],
				"mask-image-conic-pos": [{ "mask-conic": [F] }],
				"mask-image-conic-from-pos": [{ "mask-conic-from": M() }],
				"mask-image-conic-to-pos": [{ "mask-conic-to": M() }],
				"mask-image-conic-from-color": [{ "mask-conic-from": k() }],
				"mask-image-conic-to-color": [{ "mask-conic-to": k() }],
				"mask-mode": [{ mask: [
					"alpha",
					"luminance",
					"match"
				] }],
				"mask-origin": [{ "mask-origin": [
					"border",
					"padding",
					"content",
					"fill",
					"stroke",
					"view"
				] }],
				"mask-position": [{ mask: se() }],
				"mask-repeat": [{ mask: ce() }],
				"mask-size": [{ mask: le() }],
				"mask-type": [{ "mask-type": ["alpha", "luminance"] }],
				"mask-image": [{ mask: [
					"none",
					L,
					I
				] }],
				filter: [{ filter: [
					"",
					"none",
					L,
					I
				] }],
				blur: [{ blur: pe() }],
				brightness: [{ brightness: [
					F,
					L,
					I
				] }],
				contrast: [{ contrast: [
					F,
					L,
					I
				] }],
				"drop-shadow": [{ "drop-shadow": [
					"",
					"none",
					p,
					bt,
					mt
				] }],
				"drop-shadow-color": [{ "drop-shadow": k() }],
				grayscale: [{ grayscale: [
					"",
					F,
					L,
					I
				] }],
				"hue-rotate": [{ "hue-rotate": [
					F,
					L,
					I
				] }],
				invert: [{ invert: [
					"",
					F,
					L,
					I
				] }],
				saturate: [{ saturate: [
					F,
					L,
					I
				] }],
				sepia: [{ sepia: [
					"",
					F,
					L,
					I
				] }],
				"backdrop-filter": [{ "backdrop-filter": [
					"",
					"none",
					L,
					I
				] }],
				"backdrop-blur": [{ "backdrop-blur": pe() }],
				"backdrop-brightness": [{ "backdrop-brightness": [
					F,
					L,
					I
				] }],
				"backdrop-contrast": [{ "backdrop-contrast": [
					F,
					L,
					I
				] }],
				"backdrop-grayscale": [{ "backdrop-grayscale": [
					"",
					F,
					L,
					I
				] }],
				"backdrop-hue-rotate": [{ "backdrop-hue-rotate": [
					F,
					L,
					I
				] }],
				"backdrop-invert": [{ "backdrop-invert": [
					"",
					F,
					L,
					I
				] }],
				"backdrop-opacity": [{ "backdrop-opacity": [
					F,
					L,
					I
				] }],
				"backdrop-saturate": [{ "backdrop-saturate": [
					F,
					L,
					I
				] }],
				"backdrop-sepia": [{ "backdrop-sepia": [
					"",
					F,
					L,
					I
				] }],
				"border-collapse": [{ border: ["collapse", "separate"] }],
				"border-spacing": [{ "border-spacing": w() }],
				"border-spacing-x": [{ "border-spacing-x": w() }],
				"border-spacing-y": [{ "border-spacing-y": w() }],
				"table-layout": [{ table: ["auto", "fixed"] }],
				caption: [{ caption: ["top", "bottom"] }],
				transition: [{ transition: [
					"",
					"all",
					"colors",
					"opacity",
					"shadow",
					"transform",
					"none",
					L,
					I
				] }],
				"transition-behavior": [{ transition: ["normal", "discrete"] }],
				duration: [{ duration: [
					F,
					"initial",
					L,
					I
				] }],
				ease: [{ ease: [
					"linear",
					"initial",
					_,
					L,
					I
				] }],
				delay: [{ delay: [
					F,
					L,
					I
				] }],
				animate: [{ animate: [
					"none",
					v,
					L,
					I
				] }],
				backface: [{ backface: ["hidden", "visible"] }],
				perspective: [{ perspective: [
					h,
					L,
					I
				] }],
				"perspective-origin": [{ "perspective-origin": x() }],
				rotate: [{ rotate: me() }],
				"rotate-x": [{ "rotate-x": me() }],
				"rotate-y": [{ "rotate-y": me() }],
				"rotate-z": [{ "rotate-z": me() }],
				scale: [{ scale: he() }],
				"scale-x": [{ "scale-x": he() }],
				"scale-y": [{ "scale-y": he() }],
				"scale-z": [{ "scale-z": he() }],
				"scale-3d": ["scale-3d"],
				skew: [{ skew: ge() }],
				"skew-x": [{ "skew-x": ge() }],
				"skew-y": [{ "skew-y": ge() }],
				transform: [{ transform: [
					L,
					I,
					"",
					"none",
					"gpu",
					"cpu"
				] }],
				"transform-origin": [{ origin: x() }],
				"transform-style": [{ transform: ["3d", "flat"] }],
				translate: [{ translate: _e() }],
				"translate-x": [{ "translate-x": _e() }],
				"translate-y": [{ "translate-y": _e() }],
				"translate-z": [{ "translate-z": _e() }],
				"translate-none": ["translate-none"],
				zoom: [{ zoom: [
					Ze,
					L,
					I
				] }],
				accent: [{ accent: k() }],
				appearance: [{ appearance: ["none", "auto"] }],
				"caret-color": [{ caret: k() }],
				"color-scheme": [{ scheme: [
					"normal",
					"dark",
					"light",
					"light-dark",
					"only-dark",
					"only-light"
				] }],
				cursor: [{ cursor: [
					"auto",
					"default",
					"pointer",
					"wait",
					"text",
					"move",
					"help",
					"not-allowed",
					"none",
					"context-menu",
					"progress",
					"cell",
					"crosshair",
					"vertical-text",
					"alias",
					"copy",
					"no-drop",
					"grab",
					"grabbing",
					"all-scroll",
					"col-resize",
					"row-resize",
					"n-resize",
					"e-resize",
					"s-resize",
					"w-resize",
					"ne-resize",
					"nw-resize",
					"se-resize",
					"sw-resize",
					"ew-resize",
					"ns-resize",
					"nesw-resize",
					"nwse-resize",
					"zoom-in",
					"zoom-out",
					L,
					I
				] }],
				"field-sizing": [{ "field-sizing": ["fixed", "content"] }],
				"pointer-events": [{ "pointer-events": ["auto", "none"] }],
				resize: [{ resize: [
					"none",
					"",
					"y",
					"x"
				] }],
				"scroll-behavior": [{ scroll: ["auto", "smooth"] }],
				"scrollbar-thumb-color": [{ "scrollbar-thumb": k() }],
				"scrollbar-track-color": [{ "scrollbar-track": k() }],
				"scrollbar-gutter": [{ "scrollbar-gutter": [
					"auto",
					"stable",
					"both"
				] }],
				"scrollbar-w": [{ scrollbar: [
					"auto",
					"thin",
					"none"
				] }],
				"scroll-m": [{ "scroll-m": w() }],
				"scroll-mx": [{ "scroll-mx": w() }],
				"scroll-my": [{ "scroll-my": w() }],
				"scroll-ms": [{ "scroll-ms": w() }],
				"scroll-me": [{ "scroll-me": w() }],
				"scroll-mbs": [{ "scroll-mbs": w() }],
				"scroll-mbe": [{ "scroll-mbe": w() }],
				"scroll-mt": [{ "scroll-mt": w() }],
				"scroll-mr": [{ "scroll-mr": w() }],
				"scroll-mb": [{ "scroll-mb": w() }],
				"scroll-ml": [{ "scroll-ml": w() }],
				"scroll-p": [{ "scroll-p": w() }],
				"scroll-px": [{ "scroll-px": w() }],
				"scroll-py": [{ "scroll-py": w() }],
				"scroll-ps": [{ "scroll-ps": w() }],
				"scroll-pe": [{ "scroll-pe": w() }],
				"scroll-pbs": [{ "scroll-pbs": w() }],
				"scroll-pbe": [{ "scroll-pbe": w() }],
				"scroll-pt": [{ "scroll-pt": w() }],
				"scroll-pr": [{ "scroll-pr": w() }],
				"scroll-pb": [{ "scroll-pb": w() }],
				"scroll-pl": [{ "scroll-pl": w() }],
				"snap-align": [{ snap: [
					"start",
					"end",
					"center",
					"align-none"
				] }],
				"snap-stop": [{ snap: ["normal", "always"] }],
				"snap-type": [{ snap: [
					"none",
					"x",
					"y",
					"both"
				] }],
				"snap-strictness": [{ snap: ["mandatory", "proximity"] }],
				touch: [{ touch: [
					"auto",
					"none",
					"manipulation"
				] }],
				"touch-x": [{ "touch-pan": [
					"x",
					"left",
					"right"
				] }],
				"touch-y": [{ "touch-pan": [
					"y",
					"up",
					"down"
				] }],
				"touch-pz": ["touch-pinch-zoom"],
				select: [{ select: [
					"none",
					"text",
					"all",
					"auto"
				] }],
				"will-change": [{ "will-change": [
					"auto",
					"scroll",
					"contents",
					"transform",
					L,
					I
				] }],
				fill: [{ fill: ["none", ...k()] }],
				"stroke-w": [{ stroke: [
					F,
					ht,
					ct,
					lt
				] }],
				stroke: [{ stroke: ["none", ...k()] }],
				"forced-color-adjust": [{ "forced-color-adjust": ["auto", "none"] }]
			},
			conflictingClassGroups: {
				"container-named": ["container-type"],
				overflow: ["overflow-x", "overflow-y"],
				overscroll: ["overscroll-x", "overscroll-y"],
				inset: [
					"inset-x",
					"inset-y",
					"inset-bs",
					"inset-be",
					"start",
					"end",
					"top",
					"right",
					"bottom",
					"left"
				],
				"inset-x": ["right", "left"],
				"inset-y": ["top", "bottom"],
				flex: [
					"basis",
					"grow",
					"shrink"
				],
				gap: ["gap-x", "gap-y"],
				p: [
					"px",
					"py",
					"ps",
					"pe",
					"pbs",
					"pbe",
					"pt",
					"pr",
					"pb",
					"pl"
				],
				px: ["pr", "pl"],
				py: ["pt", "pb"],
				m: [
					"mx",
					"my",
					"ms",
					"me",
					"mbs",
					"mbe",
					"mt",
					"mr",
					"mb",
					"ml"
				],
				mx: ["mr", "ml"],
				my: ["mt", "mb"],
				size: ["w", "h"],
				"font-size": ["leading"],
				"fvn-normal": [
					"fvn-ordinal",
					"fvn-slashed-zero",
					"fvn-figure",
					"fvn-spacing",
					"fvn-fraction"
				],
				"fvn-ordinal": ["fvn-normal"],
				"fvn-slashed-zero": ["fvn-normal"],
				"fvn-figure": ["fvn-normal"],
				"fvn-spacing": ["fvn-normal"],
				"fvn-fraction": ["fvn-normal"],
				"line-clamp": ["display", "overflow"],
				rounded: [
					"rounded-s",
					"rounded-e",
					"rounded-t",
					"rounded-r",
					"rounded-b",
					"rounded-l",
					"rounded-ss",
					"rounded-se",
					"rounded-ee",
					"rounded-es",
					"rounded-tl",
					"rounded-tr",
					"rounded-br",
					"rounded-bl"
				],
				"rounded-s": ["rounded-ss", "rounded-es"],
				"rounded-e": ["rounded-se", "rounded-ee"],
				"rounded-t": ["rounded-tl", "rounded-tr"],
				"rounded-r": ["rounded-tr", "rounded-br"],
				"rounded-b": ["rounded-br", "rounded-bl"],
				"rounded-l": ["rounded-tl", "rounded-bl"],
				"border-spacing": ["border-spacing-x", "border-spacing-y"],
				"border-w": [
					"border-w-x",
					"border-w-y",
					"border-w-s",
					"border-w-e",
					"border-w-bs",
					"border-w-be",
					"border-w-t",
					"border-w-r",
					"border-w-b",
					"border-w-l"
				],
				"border-w-x": ["border-w-r", "border-w-l"],
				"border-w-y": ["border-w-t", "border-w-b"],
				"border-color": [
					"border-color-x",
					"border-color-y",
					"border-color-s",
					"border-color-e",
					"border-color-bs",
					"border-color-be",
					"border-color-t",
					"border-color-r",
					"border-color-b",
					"border-color-l"
				],
				"border-color-x": ["border-color-r", "border-color-l"],
				"border-color-y": ["border-color-t", "border-color-b"],
				translate: [
					"translate-x",
					"translate-y",
					"translate-none"
				],
				"translate-none": [
					"translate",
					"translate-x",
					"translate-y",
					"translate-z"
				],
				"scroll-m": [
					"scroll-mx",
					"scroll-my",
					"scroll-ms",
					"scroll-me",
					"scroll-mbs",
					"scroll-mbe",
					"scroll-mt",
					"scroll-mr",
					"scroll-mb",
					"scroll-ml"
				],
				"scroll-mx": ["scroll-mr", "scroll-ml"],
				"scroll-my": ["scroll-mt", "scroll-mb"],
				"scroll-p": [
					"scroll-px",
					"scroll-py",
					"scroll-ps",
					"scroll-pe",
					"scroll-pbs",
					"scroll-pbe",
					"scroll-pt",
					"scroll-pr",
					"scroll-pb",
					"scroll-pl"
				],
				"scroll-px": ["scroll-pr", "scroll-pl"],
				"scroll-py": ["scroll-pt", "scroll-pb"],
				touch: [
					"touch-x",
					"touch-y",
					"touch-pz"
				],
				"touch-x": ["touch"],
				"touch-y": ["touch"],
				"touch-pz": ["touch"]
			},
			conflictingClassGroupModifiers: { "font-size": ["leading"] },
			postfixLookupClassGroups: ["container-type"],
			orderSensitiveModifiers: [
				"*",
				"**",
				"after",
				"backdrop",
				"before",
				"details-content",
				"file",
				"first-letter",
				"first-line",
				"marker",
				"placeholder",
				"selection"
			]
		};
	});
	function Nt(...e) {
		return Mt(le(e));
	}
	var Pt = /* #__PURE__ */ Object.assign({
		"/src/assets/icons/custom/brightspace.svg": () => Promise.resolve().then(() => (init_brightspace_D1T12s_p(), brightspace_D1T12s_p_exports)).then((e) => e.default),
		"/src/assets/icons/custom/cairn.svg": () => Promise.resolve().then(() => (init_cairn_C_cR0Aiu(), cairn_C_cR0Aiu_exports)).then((e) => e.default),
		"/src/assets/icons/custom/canvas.svg": () => Promise.resolve().then(() => (init_canvas_C6SWyRCE(), canvas_C6SWyRCE_exports)).then((e) => e.default),
		"/src/assets/icons/custom/file-lines-slash-regular.svg": () => Promise.resolve().then(() => (init_file_lines_slash_regular_C9fu7Nra(), file_lines_slash_regular_C9fu7Nra_exports)).then((e) => e.default),
		"/src/assets/icons/custom/file-lines-slash-solid.svg": () => Promise.resolve().then(() => (init_file_lines_slash_solid_BEKYfBqQ(), file_lines_slash_solid_BEKYfBqQ_exports)).then((e) => e.default),
		"/src/assets/icons/custom/memo-magnifying-glass-regular.svg": () => Promise.resolve().then(() => (init_memo_magnifying_glass_regular_CXfS_3Wr(), memo_magnifying_glass_regular_CXfS_3Wr_exports)).then((e) => e.default),
		"/src/assets/icons/custom/moodle.svg": () => Promise.resolve().then(() => (init_moodle_CkAlgpvF(), moodle_CkAlgpvF_exports)).then((e) => e.default),
		"/src/assets/icons/custom/receipt-slash-solid.svg": () => Promise.resolve().then(() => (init_receipt_slash_solid_B0X8G5yD(), receipt_slash_solid_B0X8G5yD_exports)).then((e) => e.default),
		"/src/assets/icons/custom/rewording-slash.svg": () => Promise.resolve().then(() => (init_rewording_slash_BFjU_Tzk(), rewording_slash_BFjU_Tzk_exports)).then((e) => e.default),
		"/src/assets/icons/custom/rewording.svg": () => Promise.resolve().then(() => (init_rewording_mEvB1WjS(), rewording_mEvB1WjS_exports)).then((e) => e.default),
		"/src/assets/icons/custom/same-meaning-slash.svg": () => Promise.resolve().then(() => (init_same_meaning_slash_CK84JT0F(), same_meaning_slash_CK84JT0F_exports)).then((e) => e.default),
		"/src/assets/icons/custom/same-meaning.svg": () => Promise.resolve().then(() => (init_same_meaning_Cr_kKY80(), same_meaning_Cr_kKY80_exports)).then((e) => e.default),
		"/src/assets/icons/custom/teams.svg": () => Promise.resolve().then(() => (init_teams_Pm4MsyNQ(), teams_Pm4MsyNQ_exports)).then((e) => e.default),
		"/src/assets/icons/custom/triangle-exclamation-pen-regular.svg": () => Promise.resolve().then(() => (init_triangle_exclamation_pen_regular_Dt0_btDy(), triangle_exclamation_pen_regular_Dt0_btDy_exports)).then((e) => e.default),
		"/src/assets/icons/custom/users-circle-check-regular.svg": () => Promise.resolve().then(() => (init_users_circle_check_regular_C9fm_GlC(), users_circle_check_regular_C9fm_GlC_exports)).then((e) => e.default),
		"/src/assets/icons/custom/users-circle-check-solid.svg": () => Promise.resolve().then(() => (init_users_circle_check_solid_32rf413N(), users_circle_check_solid_32rf413N_exports)).then((e) => e.default),
		"/src/assets/icons/custom/users-circle-xmark-regular.svg": () => Promise.resolve().then(() => (init_users_circle_xmark_regular_Evqzcsz0(), users_circle_xmark_regular_Evqzcsz0_exports)).then((e) => e.default),
		"/src/assets/icons/custom/users-circle-xmark-solid.svg": () => Promise.resolve().then(() => (init_users_circle_xmark_solid_B_u_2hvw(), users_circle_xmark_solid_B_u_2hvw_exports)).then((e) => e.default)
	});
	var Ft = /* #__PURE__ */ Object.assign({
		"/src/assets/icons/solid/arrow-down-arrow-up.svg": () => Promise.resolve().then(() => (init_arrow_down_arrow_up_DKKtxpCv(), arrow_down_arrow_up_DKKtxpCv_exports)).then((e) => e.default),
		"/src/assets/icons/solid/arrow-down-short-wide.svg": () => Promise.resolve().then(() => (init_arrow_down_short_wide_C6OjNjkn(), arrow_down_short_wide_C6OjNjkn_exports)).then((e) => e.default),
		"/src/assets/icons/solid/arrow-down-wide-short.svg": () => Promise.resolve().then(() => (init_arrow_down_wide_short_L7q8rRJU(), arrow_down_wide_short_L7q8rRJU_exports)).then((e) => e.default),
		"/src/assets/icons/solid/arrow-down.svg": () => Promise.resolve().then(() => (init_arrow_down_CHP75nxp(), arrow_down_CHP75nxp_exports)).then((e) => e.default),
		"/src/assets/icons/solid/arrow-left.svg": () => Promise.resolve().then(() => (init_arrow_left_WvQhFJoQ(), arrow_left_WvQhFJoQ_exports)).then((e) => e.default),
		"/src/assets/icons/solid/arrow-right.svg": () => Promise.resolve().then(() => (init_arrow_right_BGjLFdxQ(), arrow_right_BGjLFdxQ_exports)).then((e) => e.default),
		"/src/assets/icons/solid/arrow-rotate-left.svg": () => Promise.resolve().then(() => (init_arrow_rotate_left_B9_2vahA(), arrow_rotate_left_B9_2vahA_exports)).then((e) => e.default),
		"/src/assets/icons/solid/arrow-rotate-right.svg": () => Promise.resolve().then(() => (init_arrow_rotate_right_CkhIAYQ1(), arrow_rotate_right_CkhIAYQ1_exports)).then((e) => e.default),
		"/src/assets/icons/solid/arrow-up-right-from-square.svg": () => Promise.resolve().then(() => (init_arrow_up_right_from_square_Dwau3xi5(), arrow_up_right_from_square_Dwau3xi5_exports)).then((e) => e.default),
		"/src/assets/icons/solid/arrow-up.svg": () => Promise.resolve().then(() => (init_arrow_up_PDEGQcb7(), arrow_up_PDEGQcb7_exports)).then((e) => e.default),
		"/src/assets/icons/solid/ban.svg": () => Promise.resolve().then(() => (init_ban_DfcLgI7I(), ban_DfcLgI7I_exports)).then((e) => e.default),
		"/src/assets/icons/solid/bars.svg": () => Promise.resolve().then(() => (init_bars_wzKz7v0w(), bars_wzKz7v0w_exports)).then((e) => e.default),
		"/src/assets/icons/solid/bell.svg": () => Promise.resolve().then(() => (init_bell__embu37w(), bell__embu37w_exports)).then((e) => e.default),
		"/src/assets/icons/solid/block-quote.svg": () => Promise.resolve().then(() => (init_block_quote_BARVThCJ(), block_quote_BARVThCJ_exports)).then((e) => e.default),
		"/src/assets/icons/solid/bolt.svg": () => Promise.resolve().then(() => (init_bolt_BJGrxZaK(), bolt_BJGrxZaK_exports)).then((e) => e.default),
		"/src/assets/icons/solid/book-copy.svg": () => Promise.resolve().then(() => (init_book_copy_BBG9PKO7(), book_copy_BBG9PKO7_exports)).then((e) => e.default),
		"/src/assets/icons/solid/book-open-lines.svg": () => Promise.resolve().then(() => (init_book_open_lines_DL8kKwyp(), book_open_lines_DL8kKwyp_exports)).then((e) => e.default),
		"/src/assets/icons/solid/books.svg": () => Promise.resolve().then(() => (init_books_3Rf2Jrrr(), books_3Rf2Jrrr_exports)).then((e) => e.default),
		"/src/assets/icons/solid/box-archive.svg": () => Promise.resolve().then(() => (init_box_archive_CiGxsdSR(), box_archive_CiGxsdSR_exports)).then((e) => e.default),
		"/src/assets/icons/solid/brake-warning.svg": () => Promise.resolve().then(() => (init_brake_warning_BQ__b2Em(), brake_warning_BQ__b2Em_exports)).then((e) => e.default),
		"/src/assets/icons/solid/bug.svg": () => Promise.resolve().then(() => (init_bug_BsMECbyP(), bug_BsMECbyP_exports)).then((e) => e.default),
		"/src/assets/icons/solid/calendar-days.svg": () => Promise.resolve().then(() => (init_calendar_days_Bk9Y8sgz(), calendar_days_Bk9Y8sgz_exports)).then((e) => e.default),
		"/src/assets/icons/solid/calendar-xmark.svg": () => Promise.resolve().then(() => (init_calendar_xmark_C9S6X_zn(), calendar_xmark_C9S6X_zn_exports)).then((e) => e.default),
		"/src/assets/icons/solid/cart-shopping.svg": () => Promise.resolve().then(() => (init_cart_shopping_B4NhSLRq(), cart_shopping_B4NhSLRq_exports)).then((e) => e.default),
		"/src/assets/icons/solid/chart-line-up.svg": () => Promise.resolve().then(() => (init_chart_line_up_BHQThhU0(), chart_line_up_BHQThhU0_exports)).then((e) => e.default),
		"/src/assets/icons/solid/check.svg": () => Promise.resolve().then(() => (init_check_DRDNqshc(), check_DRDNqshc_exports)).then((e) => e.default),
		"/src/assets/icons/solid/chevron-down.svg": () => Promise.resolve().then(() => (init_chevron_down_Bqj19e1x(), chevron_down_Bqj19e1x_exports)).then((e) => e.default),
		"/src/assets/icons/solid/chevron-left.svg": () => Promise.resolve().then(() => (init_chevron_left_B_tJfouO(), chevron_left_B_tJfouO_exports)).then((e) => e.default),
		"/src/assets/icons/solid/chevron-right.svg": () => Promise.resolve().then(() => (init_chevron_right_DGN_w03i(), chevron_right_DGN_w03i_exports)).then((e) => e.default),
		"/src/assets/icons/solid/chevron-up.svg": () => Promise.resolve().then(() => (init_chevron_up_DP8_qbDD(), chevron_up_DP8_qbDD_exports)).then((e) => e.default),
		"/src/assets/icons/solid/chevrons-left.svg": () => Promise.resolve().then(() => (init_chevrons_left_BO9uCLT8(), chevrons_left_BO9uCLT8_exports)).then((e) => e.default),
		"/src/assets/icons/solid/chevrons-right.svg": () => Promise.resolve().then(() => (init_chevrons_right_P77jzbHw(), chevrons_right_P77jzbHw_exports)).then((e) => e.default),
		"/src/assets/icons/solid/circle-check.svg": () => Promise.resolve().then(() => (init_circle_check_DkzlPZcu(), circle_check_DkzlPZcu_exports)).then((e) => e.default),
		"/src/assets/icons/solid/circle-exclamation.svg": () => Promise.resolve().then(() => (init_circle_exclamation_ePtdzI6y(), circle_exclamation_ePtdzI6y_exports)).then((e) => e.default),
		"/src/assets/icons/solid/circle-info.svg": () => Promise.resolve().then(() => (init_circle_info_B3hoWb19(), circle_info_B3hoWb19_exports)).then((e) => e.default),
		"/src/assets/icons/solid/circle-question.svg": () => Promise.resolve().then(() => (init_circle_question_CMjmZbEN(), circle_question_CMjmZbEN_exports)).then((e) => e.default),
		"/src/assets/icons/solid/circle.svg": () => Promise.resolve().then(() => (init_circle_CK9obxW_(), circle_CK9obxW__exports)).then((e) => e.default),
		"/src/assets/icons/solid/clipboard-list.svg": () => Promise.resolve().then(() => (init_clipboard_list_obFg7GYf(), clipboard_list_obFg7GYf_exports)).then((e) => e.default),
		"/src/assets/icons/solid/clock-rotate-left.svg": () => Promise.resolve().then(() => (init_clock_rotate_left_Cl3ne6V5(), clock_rotate_left_Cl3ne6V5_exports)).then((e) => e.default),
		"/src/assets/icons/solid/clock.svg": () => Promise.resolve().then(() => (init_clock_4qiXfc4j(), clock_4qiXfc4j_exports)).then((e) => e.default),
		"/src/assets/icons/solid/coins.svg": () => Promise.resolve().then(() => (init_coins_BvIJMAce(), coins_BvIJMAce_exports)).then((e) => e.default),
		"/src/assets/icons/solid/copy.svg": () => Promise.resolve().then(() => (init_copy_DymzQxcG(), copy_DymzQxcG_exports)).then((e) => e.default),
		"/src/assets/icons/solid/dolly.svg": () => Promise.resolve().then(() => (init_dolly_BWLrxUbu(), dolly_BWLrxUbu_exports)).then((e) => e.default),
		"/src/assets/icons/solid/download.svg": () => Promise.resolve().then(() => (init_download_Cq1rorlu(), download_Cq1rorlu_exports)).then((e) => e.default),
		"/src/assets/icons/solid/earth-americas.svg": () => Promise.resolve().then(() => (init_earth_americas_lazab6VE(), earth_americas_lazab6VE_exports)).then((e) => e.default),
		"/src/assets/icons/solid/ellipsis-vertical.svg": () => Promise.resolve().then(() => (init_ellipsis_vertical_CpD59bWA(), ellipsis_vertical_CpD59bWA_exports)).then((e) => e.default),
		"/src/assets/icons/solid/ellipsis.svg": () => Promise.resolve().then(() => (init_ellipsis_BKc75KAm(), ellipsis_BKc75KAm_exports)).then((e) => e.default),
		"/src/assets/icons/solid/empty-set.svg": () => Promise.resolve().then(() => (init_empty_set_XdUk3gbp(), empty_set_XdUk3gbp_exports)).then((e) => e.default),
		"/src/assets/icons/solid/envelope-open.svg": () => Promise.resolve().then(() => (init_envelope_open_B8SVB9mh(), envelope_open_B8SVB9mh_exports)).then((e) => e.default),
		"/src/assets/icons/solid/eye-slash.svg": () => Promise.resolve().then(() => (init_eye_slash_BWbctBSy(), eye_slash_BWbctBSy_exports)).then((e) => e.default),
		"/src/assets/icons/solid/eye.svg": () => Promise.resolve().then(() => (init_eye_C8udaNJp(), eye_C8udaNJp_exports)).then((e) => e.default),
		"/src/assets/icons/solid/feather.svg": () => Promise.resolve().then(() => (init_feather_CsIkAoz7(), feather_CsIkAoz7_exports)).then((e) => e.default),
		"/src/assets/icons/solid/file-export.svg": () => Promise.resolve().then(() => (init_file_export_CtHpVa_D(), file_export_CtHpVa_D_exports)).then((e) => e.default),
		"/src/assets/icons/solid/file-lines.svg": () => Promise.resolve().then(() => (init_file_lines_DG1HCzpY(), file_lines_DG1HCzpY_exports)).then((e) => e.default),
		"/src/assets/icons/solid/file-magnifying-glass.svg": () => Promise.resolve().then(() => (init_file_magnifying_glass_BdFfusd0(), file_magnifying_glass_BdFfusd0_exports)).then((e) => e.default),
		"/src/assets/icons/solid/file-pdf.svg": () => Promise.resolve().then(() => (init_file_pdf_DhRtwyGV(), file_pdf_DhRtwyGV_exports)).then((e) => e.default),
		"/src/assets/icons/solid/filter-slash.svg": () => Promise.resolve().then(() => (init_filter_slash_Bqmb0trt(), filter_slash_Bqmb0trt_exports)).then((e) => e.default),
		"/src/assets/icons/solid/filter.svg": () => Promise.resolve().then(() => (init_filter_B4TbeTSI(), filter_B4TbeTSI_exports)).then((e) => e.default),
		"/src/assets/icons/solid/folder-open.svg": () => Promise.resolve().then(() => (init_folder_open_gHGYh_zw(), folder_open_gHGYh_zw_exports)).then((e) => e.default),
		"/src/assets/icons/solid/folder-user.svg": () => Promise.resolve().then(() => (init_folder_user_DSLVqJgP(), folder_user_DSLVqJgP_exports)).then((e) => e.default),
		"/src/assets/icons/solid/folder.svg": () => Promise.resolve().then(() => (init_folder_C9K9xnmx(), folder_C9K9xnmx_exports)).then((e) => e.default),
		"/src/assets/icons/solid/gauge-max.svg": () => Promise.resolve().then(() => (init_gauge_max_DViMoL2_(), gauge_max_DViMoL2__exports)).then((e) => e.default),
		"/src/assets/icons/solid/gauge-min.svg": () => Promise.resolve().then(() => (init_gauge_min_C4DgCWSI(), gauge_min_C4DgCWSI_exports)).then((e) => e.default),
		"/src/assets/icons/solid/gear.svg": () => Promise.resolve().then(() => (init_gear_CgfoWG1S(), gear_CgfoWG1S_exports)).then((e) => e.default),
		"/src/assets/icons/solid/gift.svg": () => Promise.resolve().then(() => (init_gift_BYsYVXig(), gift_BYsYVXig_exports)).then((e) => e.default),
		"/src/assets/icons/solid/grid-2.svg": () => Promise.resolve().then(() => (init_grid_2_CeuWmRcs(), grid_2_CeuWmRcs_exports)).then((e) => e.default),
		"/src/assets/icons/solid/hashtag.svg": () => Promise.resolve().then(() => (init_hashtag_BF3RCoD3(), hashtag_BF3RCoD3_exports)).then((e) => e.default),
		"/src/assets/icons/solid/inbox.svg": () => Promise.resolve().then(() => (init_inbox_TWYcJCbF(), inbox_TWYcJCbF_exports)).then((e) => e.default),
		"/src/assets/icons/solid/life-ring.svg": () => Promise.resolve().then(() => (init_life_ring_DFCsKq0t(), life_ring_DFCsKq0t_exports)).then((e) => e.default),
		"/src/assets/icons/solid/lightbulb.svg": () => Promise.resolve().then(() => (init_lightbulb_CzcQ28JA(), lightbulb_CzcQ28JA_exports)).then((e) => e.default),
		"/src/assets/icons/solid/link-slash.svg": () => Promise.resolve().then(() => (init_link_slash_DfYFJeps(), link_slash_DfYFJeps_exports)).then((e) => e.default),
		"/src/assets/icons/solid/link.svg": () => Promise.resolve().then(() => (init_link_Vfa8FspI(), link_Vfa8FspI_exports)).then((e) => e.default),
		"/src/assets/icons/solid/list-tree.svg": () => Promise.resolve().then(() => (init_list_tree_BSKmPCjd(), list_tree_BSKmPCjd_exports)).then((e) => e.default),
		"/src/assets/icons/solid/location-dot-slash.svg": () => Promise.resolve().then(() => (init_location_dot_slash_Ca4NpTMa(), location_dot_slash_Ca4NpTMa_exports)).then((e) => e.default),
		"/src/assets/icons/solid/location-dot.svg": () => Promise.resolve().then(() => (init_location_dot_Cevl0QIT(), location_dot_Cevl0QIT_exports)).then((e) => e.default),
		"/src/assets/icons/solid/lock-keyhole-open.svg": () => Promise.resolve().then(() => (init_lock_keyhole_open_oE32nUKL(), lock_keyhole_open_oE32nUKL_exports)).then((e) => e.default),
		"/src/assets/icons/solid/lock-keyhole.svg": () => Promise.resolve().then(() => (init_lock_keyhole_Cwwkafy9(), lock_keyhole_Cwwkafy9_exports)).then((e) => e.default),
		"/src/assets/icons/solid/magnifying-glass-chart.svg": () => Promise.resolve().then(() => (init_magnifying_glass_chart_DOmgGNYv(), magnifying_glass_chart_DOmgGNYv_exports)).then((e) => e.default),
		"/src/assets/icons/solid/magnifying-glass.svg": () => Promise.resolve().then(() => (init_magnifying_glass_Bl8g_W0e(), magnifying_glass_Bl8g_W0e_exports)).then((e) => e.default),
		"/src/assets/icons/solid/map-location-dot.svg": () => Promise.resolve().then(() => (init_map_location_dot_BjSozhbd(), map_location_dot_BjSozhbd_exports)).then((e) => e.default),
		"/src/assets/icons/solid/map.svg": () => Promise.resolve().then(() => (init_map_h2_GH2UD(), map_h2_GH2UD_exports)).then((e) => e.default),
		"/src/assets/icons/solid/masks-theater.svg": () => Promise.resolve().then(() => (init_masks_theater_BtWnYFfO(), masks_theater_BtWnYFfO_exports)).then((e) => e.default),
		"/src/assets/icons/solid/minus.svg": () => Promise.resolve().then(() => (init_minus_D3906KJ_(), minus_D3906KJ__exports)).then((e) => e.default),
		"/src/assets/icons/solid/moon.svg": () => Promise.resolve().then(() => (init_moon_BjDzSOM1(), moon_BjDzSOM1_exports)).then((e) => e.default),
		"/src/assets/icons/solid/newspaper.svg": () => Promise.resolve().then(() => (init_newspaper_BdcSDPhT(), newspaper_BdcSDPhT_exports)).then((e) => e.default),
		"/src/assets/icons/solid/paste.svg": () => Promise.resolve().then(() => (init_paste_Be7BZIAO(), paste_Be7BZIAO_exports)).then((e) => e.default),
		"/src/assets/icons/solid/pause.svg": () => Promise.resolve().then(() => (init_pause_BTsboZRm(), pause_BTsboZRm_exports)).then((e) => e.default),
		"/src/assets/icons/solid/pen-nib.svg": () => Promise.resolve().then(() => (init_pen_nib_CjeUmzA1(), pen_nib_CjeUmzA1_exports)).then((e) => e.default),
		"/src/assets/icons/solid/pen.svg": () => Promise.resolve().then(() => (init_pen_DgZaeAUN(), pen_DgZaeAUN_exports)).then((e) => e.default),
		"/src/assets/icons/solid/piggy-bank.svg": () => Promise.resolve().then(() => (init_piggy_bank_C0_XPzRn(), piggy_bank_C0_XPzRn_exports)).then((e) => e.default),
		"/src/assets/icons/solid/play.svg": () => Promise.resolve().then(() => (init_play_DReOgv1l(), play_DReOgv1l_exports)).then((e) => e.default),
		"/src/assets/icons/solid/plus.svg": () => Promise.resolve().then(() => (init_plus_DrVgAxHl(), plus_DrVgAxHl_exports)).then((e) => e.default),
		"/src/assets/icons/solid/right-from-bracket.svg": () => Promise.resolve().then(() => (init_right_from_bracket_igRO63UN(), right_from_bracket_igRO63UN_exports)).then((e) => e.default),
		"/src/assets/icons/solid/right-to-bracket.svg": () => Promise.resolve().then(() => (init_right_to_bracket_Crvv0LJV(), right_to_bracket_Crvv0LJV_exports)).then((e) => e.default),
		"/src/assets/icons/solid/school.svg": () => Promise.resolve().then(() => (init_school_DXlU5n2F(), school_DXlU5n2F_exports)).then((e) => e.default),
		"/src/assets/icons/solid/screwdriver-wrench.svg": () => Promise.resolve().then(() => (init_screwdriver_wrench_BgMLbs4D(), screwdriver_wrench_BgMLbs4D_exports)).then((e) => e.default),
		"/src/assets/icons/solid/signature.svg": () => Promise.resolve().then(() => (init_signature_CzsyWKuW(), signature_CzsyWKuW_exports)).then((e) => e.default),
		"/src/assets/icons/solid/sliders.svg": () => Promise.resolve().then(() => (init_sliders_D3E8Jgqn(), sliders_D3E8Jgqn_exports)).then((e) => e.default),
		"/src/assets/icons/solid/snowflake.svg": () => Promise.resolve().then(() => (init_snowflake_Dw4MlfCK(), snowflake_Dw4MlfCK_exports)).then((e) => e.default),
		"/src/assets/icons/solid/spell-check.svg": () => Promise.resolve().then(() => (init_spell_check_Che8oy8R(), spell_check_Che8oy8R_exports)).then((e) => e.default),
		"/src/assets/icons/solid/spinner.svg": () => Promise.resolve().then(() => (init_spinner_B_nV7Uuk(), spinner_B_nV7Uuk_exports)).then((e) => e.default),
		"/src/assets/icons/solid/stop.svg": () => Promise.resolve().then(() => (init_stop_BpCOKHxg(), stop_BpCOKHxg_exports)).then((e) => e.default),
		"/src/assets/icons/solid/sun.svg": () => Promise.resolve().then(() => (init_sun_DtxBlK4W(), sun_DtxBlK4W_exports)).then((e) => e.default),
		"/src/assets/icons/solid/tag.svg": () => Promise.resolve().then(() => (init_tag_rZw8vML1(), tag_rZw8vML1_exports)).then((e) => e.default),
		"/src/assets/icons/solid/trash-can-arrow-up.svg": () => Promise.resolve().then(() => (init_trash_can_arrow_up_C1YpdzEK(), trash_can_arrow_up_C1YpdzEK_exports)).then((e) => e.default),
		"/src/assets/icons/solid/trash-can.svg": () => Promise.resolve().then(() => (init_trash_can_CAwatGyo(), trash_can_CAwatGyo_exports)).then((e) => e.default),
		"/src/assets/icons/solid/triangle-exclamation.svg": () => Promise.resolve().then(() => (init_triangle_exclamation_BN5cU1XS(), triangle_exclamation_BN5cU1XS_exports)).then((e) => e.default),
		"/src/assets/icons/solid/universal-access.svg": () => Promise.resolve().then(() => (init_universal_access_T8WpSzGi(), universal_access_T8WpSzGi_exports)).then((e) => e.default),
		"/src/assets/icons/solid/user-gear.svg": () => Promise.resolve().then(() => (init_user_gear_D8w2iwsB(), user_gear_D8w2iwsB_exports)).then((e) => e.default),
		"/src/assets/icons/solid/user-minus.svg": () => Promise.resolve().then(() => (init_user_minus_CIlkj7Gz(), user_minus_CIlkj7Gz_exports)).then((e) => e.default),
		"/src/assets/icons/solid/user-plus.svg": () => Promise.resolve().then(() => (init_user_plus_DnAEQGGj(), user_plus_DnAEQGGj_exports)).then((e) => e.default),
		"/src/assets/icons/solid/user-shield.svg": () => Promise.resolve().then(() => (init_user_shield_DZSvuf_O(), user_shield_DZSvuf_O_exports)).then((e) => e.default),
		"/src/assets/icons/solid/user.svg": () => Promise.resolve().then(() => (init_user_Dbawbhc8(), user_Dbawbhc8_exports)).then((e) => e.default),
		"/src/assets/icons/solid/users.svg": () => Promise.resolve().then(() => (init_users_BuC3Q_Ub(), users_BuC3Q_Ub_exports)).then((e) => e.default),
		"/src/assets/icons/solid/xmark.svg": () => Promise.resolve().then(() => (init_xmark_BZTIYV9s(), xmark_BZTIYV9s_exports)).then((e) => e.default)
	});
	var It = /* #__PURE__ */ Object.assign({
		"/src/assets/icons/regular/bell.svg": () => Promise.resolve().then(() => (init_bell_e5MrnlWO(), bell_e5MrnlWO_exports)).then((e) => e.default),
		"/src/assets/icons/regular/bolt.svg": () => Promise.resolve().then(() => (init_bolt_v2RhFbf7(), bolt_v2RhFbf7_exports)).then((e) => e.default),
		"/src/assets/icons/regular/book-copy.svg": () => Promise.resolve().then(() => (init_book_copy_BF5w1D3i(), book_copy_BF5w1D3i_exports)).then((e) => e.default),
		"/src/assets/icons/regular/book-open-lines.svg": () => Promise.resolve().then(() => (init_book_open_lines_CVPng4Mb(), book_open_lines_CVPng4Mb_exports)).then((e) => e.default),
		"/src/assets/icons/regular/books.svg": () => Promise.resolve().then(() => (init_books_XjOCaF3o(), books_XjOCaF3o_exports)).then((e) => e.default),
		"/src/assets/icons/regular/box-archive.svg": () => Promise.resolve().then(() => (init_box_archive_BlLuAmbT(), box_archive_BlLuAmbT_exports)).then((e) => e.default),
		"/src/assets/icons/regular/brake-warning.svg": () => Promise.resolve().then(() => (init_brake_warning_DQ41PPaA(), brake_warning_DQ41PPaA_exports)).then((e) => e.default),
		"/src/assets/icons/regular/bug.svg": () => Promise.resolve().then(() => (init_bug_Z2_E6KK1(), bug_Z2_E6KK1_exports)).then((e) => e.default),
		"/src/assets/icons/regular/calendar-days.svg": () => Promise.resolve().then(() => (init_calendar_days_CZDQ_8k8(), calendar_days_CZDQ_8k8_exports)).then((e) => e.default),
		"/src/assets/icons/regular/calendar-xmark.svg": () => Promise.resolve().then(() => (init_calendar_xmark_DL26Mjko(), calendar_xmark_DL26Mjko_exports)).then((e) => e.default),
		"/src/assets/icons/regular/cart-shopping.svg": () => Promise.resolve().then(() => (init_cart_shopping_CnSBnQky(), cart_shopping_CnSBnQky_exports)).then((e) => e.default),
		"/src/assets/icons/regular/circle-check.svg": () => Promise.resolve().then(() => (init_circle_check_CHVlSwVT(), circle_check_CHVlSwVT_exports)).then((e) => e.default),
		"/src/assets/icons/regular/circle-exclamation.svg": () => Promise.resolve().then(() => (init_circle_exclamation_CIuOM0Tl(), circle_exclamation_CIuOM0Tl_exports)).then((e) => e.default),
		"/src/assets/icons/regular/circle-info.svg": () => Promise.resolve().then(() => (init_circle_info_D2b_QMvU(), circle_info_D2b_QMvU_exports)).then((e) => e.default),
		"/src/assets/icons/regular/circle-question.svg": () => Promise.resolve().then(() => (init_circle_question_BxXZZFMr(), circle_question_BxXZZFMr_exports)).then((e) => e.default),
		"/src/assets/icons/regular/circle.svg": () => Promise.resolve().then(() => (init_circle_Cho_Vemi(), circle_Cho_Vemi_exports)).then((e) => e.default),
		"/src/assets/icons/regular/clipboard-list.svg": () => Promise.resolve().then(() => (init_clipboard_list_6arODTov(), clipboard_list_6arODTov_exports)).then((e) => e.default),
		"/src/assets/icons/regular/clock.svg": () => Promise.resolve().then(() => (init_clock_DNvJIAIL(), clock_DNvJIAIL_exports)).then((e) => e.default),
		"/src/assets/icons/regular/coins.svg": () => Promise.resolve().then(() => (init_coins_DlK4cVCs(), coins_DlK4cVCs_exports)).then((e) => e.default),
		"/src/assets/icons/regular/copy.svg": () => Promise.resolve().then(() => (init_copy_DACr2_w5(), copy_DACr2_w5_exports)).then((e) => e.default),
		"/src/assets/icons/regular/download.svg": () => Promise.resolve().then(() => (init_download_QTjjWPQU(), download_QTjjWPQU_exports)).then((e) => e.default),
		"/src/assets/icons/regular/earth-americas.svg": () => Promise.resolve().then(() => (init_earth_americas_C_ZJ_ghj(), earth_americas_C_ZJ_ghj_exports)).then((e) => e.default),
		"/src/assets/icons/regular/envelope-open.svg": () => Promise.resolve().then(() => (init_envelope_open_Czvww_my(), envelope_open_Czvww_my_exports)).then((e) => e.default),
		"/src/assets/icons/regular/eye-slash.svg": () => Promise.resolve().then(() => (init_eye_slash_Bwe6zXbJ(), eye_slash_Bwe6zXbJ_exports)).then((e) => e.default),
		"/src/assets/icons/regular/eye.svg": () => Promise.resolve().then(() => (init_eye_CB_xpcOG(), eye_CB_xpcOG_exports)).then((e) => e.default),
		"/src/assets/icons/regular/feather.svg": () => Promise.resolve().then(() => (init_feather_BCpP7wmd(), feather_BCpP7wmd_exports)).then((e) => e.default),
		"/src/assets/icons/regular/file-export.svg": () => Promise.resolve().then(() => (init_file_export_BUqKuCEF(), file_export_BUqKuCEF_exports)).then((e) => e.default),
		"/src/assets/icons/regular/file-lines.svg": () => Promise.resolve().then(() => (init_file_lines_7Qakw2FC(), file_lines_7Qakw2FC_exports)).then((e) => e.default),
		"/src/assets/icons/regular/file-magnifying-glass.svg": () => Promise.resolve().then(() => (init_file_magnifying_glass_DPPJVXvG(), file_magnifying_glass_DPPJVXvG_exports)).then((e) => e.default),
		"/src/assets/icons/regular/file-pdf.svg": () => Promise.resolve().then(() => (init_file_pdf_BZk9go_v(), file_pdf_BZk9go_v_exports)).then((e) => e.default),
		"/src/assets/icons/regular/filter-slash.svg": () => Promise.resolve().then(() => (init_filter_slash_B0v_aw__(), filter_slash_B0v_aw___exports)).then((e) => e.default),
		"/src/assets/icons/regular/filter.svg": () => Promise.resolve().then(() => (init_filter_F3rVsP6f(), filter_F3rVsP6f_exports)).then((e) => e.default),
		"/src/assets/icons/regular/folder-open.svg": () => Promise.resolve().then(() => (init_folder_open_w_vZrsM1(), folder_open_w_vZrsM1_exports)).then((e) => e.default),
		"/src/assets/icons/regular/folder-user.svg": () => Promise.resolve().then(() => (init_folder_user_DKrzEqKO(), folder_user_DKrzEqKO_exports)).then((e) => e.default),
		"/src/assets/icons/regular/folder.svg": () => Promise.resolve().then(() => (init_folder_BWoXBYdf(), folder_BWoXBYdf_exports)).then((e) => e.default),
		"/src/assets/icons/regular/gauge-max.svg": () => Promise.resolve().then(() => (init_gauge_max_BbhG4Anh(), gauge_max_BbhG4Anh_exports)).then((e) => e.default),
		"/src/assets/icons/regular/gauge-min.svg": () => Promise.resolve().then(() => (init_gauge_min_DPoyiw6g(), gauge_min_DPoyiw6g_exports)).then((e) => e.default),
		"/src/assets/icons/regular/gear.svg": () => Promise.resolve().then(() => (init_gear_CQjg3jBA(), gear_CQjg3jBA_exports)).then((e) => e.default),
		"/src/assets/icons/regular/gift.svg": () => Promise.resolve().then(() => (init_gift_C7JdBh8a(), gift_C7JdBh8a_exports)).then((e) => e.default),
		"/src/assets/icons/regular/grid-2.svg": () => Promise.resolve().then(() => (init_grid_2_BogLMdkK(), grid_2_BogLMdkK_exports)).then((e) => e.default),
		"/src/assets/icons/regular/inbox.svg": () => Promise.resolve().then(() => (init_inbox_CJ5O811s(), inbox_CJ5O811s_exports)).then((e) => e.default),
		"/src/assets/icons/regular/lightbulb.svg": () => Promise.resolve().then(() => (init_lightbulb_Bq8Nq8re(), lightbulb_Bq8Nq8re_exports)).then((e) => e.default),
		"/src/assets/icons/regular/location-dot-slash.svg": () => Promise.resolve().then(() => (init_location_dot_slash_B5cKa6cn(), location_dot_slash_B5cKa6cn_exports)).then((e) => e.default),
		"/src/assets/icons/regular/location-dot.svg": () => Promise.resolve().then(() => (init_location_dot_UmU_3DzA(), location_dot_UmU_3DzA_exports)).then((e) => e.default),
		"/src/assets/icons/regular/lock-keyhole-open.svg": () => Promise.resolve().then(() => (init_lock_keyhole_open_D8_uSzB_(), lock_keyhole_open_D8_uSzB__exports)).then((e) => e.default),
		"/src/assets/icons/regular/lock-keyhole.svg": () => Promise.resolve().then(() => (init_lock_keyhole_Bvc0RJtr(), lock_keyhole_Bvc0RJtr_exports)).then((e) => e.default),
		"/src/assets/icons/regular/magnifying-glass-chart.svg": () => Promise.resolve().then(() => (init_magnifying_glass_chart_C5MrYyo2(), magnifying_glass_chart_C5MrYyo2_exports)).then((e) => e.default),
		"/src/assets/icons/regular/map-location-dot.svg": () => Promise.resolve().then(() => (init_map_location_dot_35_yr6SF(), map_location_dot_35_yr6SF_exports)).then((e) => e.default),
		"/src/assets/icons/regular/map.svg": () => Promise.resolve().then(() => (init_map_BkL6_XZk(), map_BkL6_XZk_exports)).then((e) => e.default),
		"/src/assets/icons/regular/masks-theater.svg": () => Promise.resolve().then(() => (init_masks_theater_CbuXPiO6(), masks_theater_CbuXPiO6_exports)).then((e) => e.default),
		"/src/assets/icons/regular/moon.svg": () => Promise.resolve().then(() => (init_moon_DWuv9XJD(), moon_DWuv9XJD_exports)).then((e) => e.default),
		"/src/assets/icons/regular/newspaper.svg": () => Promise.resolve().then(() => (init_newspaper_JzlU71UV(), newspaper_JzlU71UV_exports)).then((e) => e.default),
		"/src/assets/icons/regular/paste.svg": () => Promise.resolve().then(() => (init_paste_BP_qzKT6(), paste_BP_qzKT6_exports)).then((e) => e.default),
		"/src/assets/icons/regular/pause.svg": () => Promise.resolve().then(() => (init_pause_YhXwIa0Q(), pause_YhXwIa0Q_exports)).then((e) => e.default),
		"/src/assets/icons/regular/pen-nib.svg": () => Promise.resolve().then(() => (init_pen_nib_DHkofnWk(), pen_nib_DHkofnWk_exports)).then((e) => e.default),
		"/src/assets/icons/regular/pen.svg": () => Promise.resolve().then(() => (init_pen_BFaC7vbv(), pen_BFaC7vbv_exports)).then((e) => e.default),
		"/src/assets/icons/regular/piggy-bank.svg": () => Promise.resolve().then(() => (init_piggy_bank_DXBVFif5(), piggy_bank_DXBVFif5_exports)).then((e) => e.default),
		"/src/assets/icons/regular/play.svg": () => Promise.resolve().then(() => (init_play_DA_Yljec(), play_DA_Yljec_exports)).then((e) => e.default),
		"/src/assets/icons/regular/school.svg": () => Promise.resolve().then(() => (init_school_Dw6F8hrb(), school_Dw6F8hrb_exports)).then((e) => e.default),
		"/src/assets/icons/regular/screwdriver-wrench.svg": () => Promise.resolve().then(() => (init_screwdriver_wrench_CsHKJX45(), screwdriver_wrench_CsHKJX45_exports)).then((e) => e.default),
		"/src/assets/icons/regular/sliders.svg": () => Promise.resolve().then(() => (init_sliders_apvy1RIg(), sliders_apvy1RIg_exports)).then((e) => e.default),
		"/src/assets/icons/regular/stop.svg": () => Promise.resolve().then(() => (init_stop_CKIwsk4t(), stop_CKIwsk4t_exports)).then((e) => e.default),
		"/src/assets/icons/regular/sun.svg": () => Promise.resolve().then(() => (init_sun_BZmXflp7(), sun_BZmXflp7_exports)).then((e) => e.default),
		"/src/assets/icons/regular/tag.svg": () => Promise.resolve().then(() => (init_tag_BzdweFtQ(), tag_BzdweFtQ_exports)).then((e) => e.default),
		"/src/assets/icons/regular/trash-can-arrow-up.svg": () => Promise.resolve().then(() => (init_trash_can_arrow_up_YGwFfpFx(), trash_can_arrow_up_YGwFfpFx_exports)).then((e) => e.default),
		"/src/assets/icons/regular/trash-can.svg": () => Promise.resolve().then(() => (init_trash_can_xRh5eGda(), trash_can_xRh5eGda_exports)).then((e) => e.default),
		"/src/assets/icons/regular/triangle-exclamation.svg": () => Promise.resolve().then(() => (init_triangle_exclamation_CprZO6A8(), triangle_exclamation_CprZO6A8_exports)).then((e) => e.default),
		"/src/assets/icons/regular/universal-access.svg": () => Promise.resolve().then(() => (init_universal_access_TddPPo2q(), universal_access_TddPPo2q_exports)).then((e) => e.default),
		"/src/assets/icons/regular/user-gear.svg": () => Promise.resolve().then(() => (init_user_gear_BhRaDoRG(), user_gear_BhRaDoRG_exports)).then((e) => e.default),
		"/src/assets/icons/regular/user-minus.svg": () => Promise.resolve().then(() => (init_user_minus_Bs05q1BI(), user_minus_Bs05q1BI_exports)).then((e) => e.default),
		"/src/assets/icons/regular/user-plus.svg": () => Promise.resolve().then(() => (init_user_plus_CHQVg8vJ(), user_plus_CHQVg8vJ_exports)).then((e) => e.default),
		"/src/assets/icons/regular/user-shield.svg": () => Promise.resolve().then(() => (init_user_shield_CgAjh_2i(), user_shield_CgAjh_2i_exports)).then((e) => e.default),
		"/src/assets/icons/regular/user.svg": () => Promise.resolve().then(() => (init_user_D_zw7BEo(), user_D_zw7BEo_exports)).then((e) => e.default),
		"/src/assets/icons/regular/users.svg": () => Promise.resolve().then(() => (init_users_D64F_GLf(), users_D64F_GLf_exports)).then((e) => e.default)
	});
	var Lt = new Set(Object.keys(Ft).map((e) => e.match(/\/([^/]+)\.svg$/)?.[1] || ""));
	var Rt = new Set(Object.keys(It).map((e) => e.match(/\/([^/]+)\.svg$/)?.[1] || ""));
	var zt = /* @__PURE__ */ new Set();
	Lt.forEach((e) => {
		e && Rt.has(e) && zt.add(e);
	});
	var Bt = Object.fromEntries(Object.entries(Pt).map(([e, t]) => [e.match(/\/([^/]+)\.svg$/)?.[1] || "", t]));
	var Vt = Object.fromEntries(Object.entries(Ft).map(([e, t]) => {
		let n = e.match(/\/([^/]+)\.svg$/)?.[1] || "";
		return [n + (zt.has(n) ? "-solid" : ""), t];
	}));
	var Ht = Object.fromEntries(Object.entries(It).map(([e, t]) => {
		let n = e.match(/\/([^/]+)\.svg$/)?.[1] || "";
		return [n + (zt.has(n) ? "-regular" : ""), t];
	}));
	var Ut = {
		...Bt,
		...Vt,
		...Ht
	};
	var Wt = /* @__PURE__ */ new Map();
	async function Gt(e) {
		if (Wt.has(e)) return Wt.get(e);
		let t = Ut[e];
		if (!t) return console.warn(`Icon "${e}" not found`), "";
		let n = await t();
		return Wt.set(e, n), n;
	}
	var Kt = ["innerHTML"];
	var qt = /* @__PURE__ */ (0, vue.defineComponent)({
		__name: "Icon",
		props: {
			name: {},
			forceColor: {
				type: Boolean,
				default: !1
			},
			class: {}
		},
		setup(e) {
			let t = e, n = (0, vue.ref)(""), r = (0, vue.ref)(!0);
			async function a() {
				r.value = !0, n.value = await Gt(t.name), r.value = !1;
			}
			(0, vue.onMounted)(() => {
				a();
			}), (0, vue.watch)(() => t.name, () => {
				a();
			});
			let o = (0, vue.computed)(() => {
				if (!n.value || r.value) return "";
				let e = n.value.match(/<svg[^>]*>(.*?)<\/svg>/s), i = e ? e[1] : "";
				return t.forceColor && i && (i = i.replace(/fill="[^"]*"/g, "fill=\"currentColor\"")), i;
			}), c = (0, vue.computed)(() => {
				if (!n.value || r.value) return { viewBox: "0 0 640 640" };
				let e = {}, t = n.value.match(/viewBox=["']([^"']+)["']/);
				return t && t[1] && (e.viewBox = t[1]), e;
			}), l = (0, vue.computed)(() => Nt("inline-block size-4 shrink-0", t.class));
			return (e, t) => ((0, vue.openBlock)(), (0, vue.createElementBlock)("svg", (0, vue.mergeProps)({ xmlns: "http://www.w3.org/2000/svg" }, c.value, {
				class: l.value,
				fill: "currentColor",
				innerHTML: o.value
			}), null, 16, Kt));
		}
	});
	function $t(e, t) {
		typeof console < "u" && (console.warn("[intlify] " + e), t && console.warn(t.stack));
	}
	var nn = typeof window < "u";
	var sn = (e, t = !1) => t ? Symbol.for(e) : Symbol(e);
	var cn = (e, t, n) => ln({
		l: e,
		k: t,
		s: n
	});
	var ln = (e) => JSON.stringify(e).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029").replace(/\u0027/g, "\\u0027");
	var z = (e) => typeof e == "number" && isFinite(e);
	var un = (e) => On(e) === "[object Date]";
	var dn = (e) => On(e) === "[object RegExp]";
	var fn = (e) => q(e) && Object.keys(e).length === 0;
	var B = Object.assign;
	var pn = Object.create;
	var V = (e = null) => pn(e);
	var mn;
	var hn = () => mn ||= typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : V();
	function gn(e) {
		return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/\//g, "&#x2F;").replace(/=/g, "&#x3D;");
	}
	function _n(e) {
		return e.replace(/&(?![a-zA-Z0-9#]{2,6};)/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	}
	var vn = /^\s*javascript\s*(?::|&#0*58;?|&#x0*3a;?|&colon;?)/i;
	var yn = /^(?:href|src|action|formaction)$/i;
	function bn(e) {
		return vn.test(e);
	}
	function xn(e) {
		let t = /url\s*\(/gi, n = "", r = 0, i;
		for (; (i = t.exec(e)) !== null;) {
			let a = i.index, o = t.lastIndex - 1, s = o + 1, c = 1, l = null;
			for (; s < e.length; s++) {
				let t = e[s];
				if (l) {
					t === l && (l = null);
					continue;
				}
				if (t === "\"" || t === "'") l = t;
				else if (t === "(") c++;
				else if (t === ")" && (c--, c === 0)) break;
			}
			if (c !== 0) break;
			let u = e.slice(o + 1, s).trim(), d = u.startsWith("\"") && u.endsWith("\"") || u.startsWith("'") && u.endsWith("'") ? u.slice(1, -1).trim() : u;
			n += e.slice(r, a), n += bn(d) ? "url(about:blank)" : e.slice(a, s + 1), r = s + 1;
		}
		return n + e.slice(r);
	}
	function Sn(e, t) {
		return yn.test(e) && bn(t) ? "about:blank" : _n(e.toLowerCase() === "style" ? xn(t) : t);
	}
	function Cn(e) {
		return e = e.replace(/([\w:-]+)\s*=\s*"([^"]*)"/g, (e, t, n) => `${t}="${Sn(t, n)}"`), e = e.replace(/([\w:-]+)\s*=\s*'([^']*)'/g, (e, t, n) => `${t}='${Sn(t, n)}'`), /\s*on\w+\s*=\s*["']?[^"'>]+["']?/gi.test(e) && (e = e.replace(/(\s+)(on)(\w+\s*=)/gi, "$1&#111;n$3")), e = e.replace(/(\s+(?:href|src|action|formaction)\s*=\s*)([^\s"'=<>`]+)/gi, (e, t, n) => bn(n) ? `${t}about:blank` : e), e;
	}
	var wn = Object.prototype.hasOwnProperty;
	function Tn(e, t) {
		return wn.call(e, t);
	}
	var H = Array.isArray;
	var U = (e) => typeof e == "function";
	var W = (e) => typeof e == "string";
	var G = (e) => typeof e == "boolean";
	var K = (e) => typeof e == "object" && !!e;
	var En = (e) => K(e) && U(e.then) && U(e.catch);
	var Dn = Object.prototype.toString;
	var On = (e) => Dn.call(e);
	var q = (e) => On(e) === "[object Object]";
	var kn = (e) => e == null ? "" : H(e) || q(e) && e.toString === Dn ? JSON.stringify(e, null, 2) : String(e);
	function An(e, t = "") {
		return e.reduce((e, n, r) => r === 0 ? e + n : e + t + n, "");
	}
	var Pn = (e) => !K(e) || H(e);
	function Fn(e, t) {
		if (Pn(e) || Pn(t)) throw Error("Invalid value");
		let n = [{
			src: e,
			des: t
		}];
		for (; n.length;) {
			let { src: e, des: t } = n.pop();
			Object.keys(e).forEach((r) => {
				r !== "__proto__" && (K(e[r]) && !K(t[r]) && (t[r] = Array.isArray(e[r]) ? [] : V()), Pn(t[r]) || Pn(e[r]) ? t[r] = e[r] : n.push({
					src: e[r],
					des: t[r]
				}));
			});
		}
	}
	function In(e, t, n) {
		return {
			line: e,
			column: t,
			offset: n
		};
	}
	function Ln(e, t, n) {
		let r = {
			start: e,
			end: t
		};
		return n != null && (r.source = n), r;
	}
	var J = {
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
		MUST_HAVE_MESSAGES_IN_PLURAL: 11,
		UNEXPECTED_EMPTY_LINKED_MODIFIER: 12,
		UNEXPECTED_EMPTY_LINKED_KEY: 13,
		UNEXPECTED_LEXICAL_ANALYSIS: 14,
		UNHANDLED_CODEGEN_NODE_TYPE: 15,
		UNHANDLED_MINIFIER_NODE_TYPE: 16
	};
	J.EXPECTED_TOKEN, J.INVALID_TOKEN_IN_PLACEHOLDER, J.UNTERMINATED_SINGLE_QUOTE_IN_PLACEHOLDER, J.UNKNOWN_ESCAPE_SEQUENCE, J.INVALID_UNICODE_ESCAPE_SEQUENCE, J.UNBALANCED_CLOSING_BRACE, J.UNTERMINATED_CLOSING_BRACE, J.EMPTY_PLACEHOLDER, J.NOT_ALLOW_NEST_PLACEHOLDER, J.INVALID_LINKED_FORMAT, J.MUST_HAVE_MESSAGES_IN_PLURAL, J.UNEXPECTED_EMPTY_LINKED_MODIFIER, J.UNEXPECTED_EMPTY_LINKED_KEY, J.UNEXPECTED_LEXICAL_ANALYSIS, J.UNHANDLED_CODEGEN_NODE_TYPE, J.UNHANDLED_MINIFIER_NODE_TYPE;
	function zn(e, t, n = {}) {
		let { domain: r, messages: i, args: a } = n, s = SyntaxError(String(e));
		return s.code = e, t && (s.location = t), s.domain = r, s;
	}
	function Bn(e) {
		throw e;
	}
	var Un = " ";
	var Wn = "\r";
	var Y = "\n";
	var Gn = "\u2028";
	var Kn = "\u2029";
	function qn(e) {
		let t = e, n = 0, r = 1, i = 1, a = 0, o = (e) => t[e] === Wn && t[e + 1] === Y, s = (e) => t[e] === Y, c = (e) => t[e] === Kn, l = (e) => t[e] === Gn, u = (e) => o(e) || s(e) || c(e) || l(e), d = () => n, f = () => r, p = () => i, m = () => a, h = (e) => o(e) || c(e) || l(e) ? Y : t[e], g = () => h(n), _ = () => h(n + a);
		function v() {
			return a = 0, u(n) && (r++, i = 0), o(n) && n++, n++, i++, t[n];
		}
		function y() {
			return o(n + a) && a++, a++, t[n + a];
		}
		function b() {
			n = 0, r = 1, i = 1, a = 0;
		}
		function x(e = 0) {
			a = e;
		}
		function S() {
			let e = n + a;
			for (; e !== n;) v();
			a = 0;
		}
		return {
			index: d,
			line: f,
			column: p,
			peekOffset: m,
			charAt: h,
			currentChar: g,
			currentPeek: _,
			next: v,
			peek: y,
			reset: b,
			resetPeek: x,
			skipToPeek: S
		};
	}
	var Jn = void 0;
	var Yn = "'";
	var Xn = "tokenizer";
	function Zn(e, t = {}) {
		let n = t.location !== !1, r = qn(e), i = () => r.index(), a = () => In(r.line(), r.column(), r.index()), o = a(), s = i(), c = {
			currentType: 13,
			offset: s,
			startLoc: o,
			endLoc: o,
			lastType: 13,
			lastOffset: s,
			lastStartLoc: o,
			lastEndLoc: o,
			braceNest: 0,
			inLinked: !1,
			text: ""
		}, l = () => c, { onError: u } = t;
		function d(e, t, r, ...i) {
			let a = l();
			if (t.column += r, t.offset += r, u) {
				let r = zn(e, n ? Ln(a.startLoc, t) : null, {
					domain: Xn,
					args: i
				});
				u(r);
			}
		}
		function f(e, t, r) {
			e.endLoc = a(), e.currentType = t;
			let i = { type: t };
			return n && (i.loc = Ln(e.startLoc, e.endLoc)), r != null && (i.value = r), i;
		}
		let p = (e) => f(e, 13);
		function m(e, t) {
			return e.currentChar() === t ? (e.next(), t) : (d(J.EXPECTED_TOKEN, a(), 0, t), "");
		}
		function h(e) {
			let t = "";
			for (; e.currentPeek() === Un || e.currentPeek() === Y;) t += e.currentPeek(), e.peek();
			return t;
		}
		function g(e) {
			let t = h(e);
			return e.skipToPeek(), t;
		}
		function _(e) {
			if (e === Jn) return !1;
			let t = e.charCodeAt(0);
			return t >= 97 && t <= 122 || t >= 65 && t <= 90 || t === 95;
		}
		function v(e) {
			if (e === Jn) return !1;
			let t = e.charCodeAt(0);
			return t >= 48 && t <= 57;
		}
		function y(e, t) {
			let { currentType: n } = t;
			if (n !== 2) return !1;
			h(e);
			let r = _(e.currentPeek());
			return e.resetPeek(), r;
		}
		function b(e, t) {
			let { currentType: n } = t;
			if (n !== 2) return !1;
			h(e);
			let r = v(e.currentPeek() === "-" ? e.peek() : e.currentPeek());
			return e.resetPeek(), r;
		}
		function x(e, t) {
			let { currentType: n } = t;
			if (n !== 2) return !1;
			h(e);
			let r = e.currentPeek() === Yn;
			return e.resetPeek(), r;
		}
		function S(e, t) {
			let { currentType: n } = t;
			if (n !== 7) return !1;
			h(e);
			let r = e.currentPeek() === ".";
			return e.resetPeek(), r;
		}
		function C(e, t) {
			let { currentType: n } = t;
			if (n !== 8) return !1;
			h(e);
			let r = _(e.currentPeek());
			return e.resetPeek(), r;
		}
		function w(e, t) {
			let { currentType: n } = t;
			if (!(n === 7 || n === 11)) return !1;
			h(e);
			let r = e.currentPeek() === ":";
			return e.resetPeek(), r;
		}
		function T(e, t) {
			let { currentType: n } = t;
			if (n !== 9) return !1;
			let r = () => {
				let t = e.currentPeek();
				return t === "{" ? _(e.peek()) : t === "@" || t === "|" || t === ":" || t === "." || t === Un || !t ? !1 : t === Y ? (e.peek(), r()) : te(e, !1);
			}, i = r();
			return e.resetPeek(), i;
		}
		function ee(e) {
			h(e);
			let t = e.currentPeek() === "|";
			return e.resetPeek(), t;
		}
		function te(e, t = !0) {
			let n = (t = !1, r = "") => {
				let i = e.currentPeek();
				return i === "{" || i === "@" || !i ? t : i === "|" ? !(r === Un || r === Y) : i === Un ? (e.peek(), n(!0, Un)) : i === Y ? (e.peek(), n(!0, Y)) : !0;
			}, r = n();
			return t && e.resetPeek(), r;
		}
		function E(e, t) {
			let n = e.currentChar();
			if (n !== Jn) return t(n) ? (e.next(), n) : null;
		}
		function ne(e) {
			let t = e.charCodeAt(0);
			return t >= 97 && t <= 122 || t >= 65 && t <= 90 || t >= 48 && t <= 57 || t === 95 || t === 36;
		}
		function re(e) {
			return E(e, ne);
		}
		function D(e) {
			let t = e.charCodeAt(0);
			return t >= 97 && t <= 122 || t >= 65 && t <= 90 || t >= 48 && t <= 57 || t === 95 || t === 36 || t === 45;
		}
		function O(e) {
			return E(e, D);
		}
		function ie(e) {
			let t = e.charCodeAt(0);
			return t >= 48 && t <= 57;
		}
		function ae(e) {
			return E(e, ie);
		}
		function oe(e) {
			let t = e.charCodeAt(0);
			return t >= 48 && t <= 57 || t >= 65 && t <= 70 || t >= 97 && t <= 102;
		}
		function k(e) {
			return E(e, oe);
		}
		function se(e) {
			let t = "", n = "";
			for (; t = ae(e);) n += t;
			return n;
		}
		function ce(e) {
			let t = "";
			for (;;) {
				let n = e.currentChar();
				if (n === "\\") {
					let r = e.peek();
					r === "{" || r === "}" || r === "@" || r === "|" || r === "\\" ? (t += n + r, e.next(), e.next()) : (e.resetPeek(), t += n, e.next());
				} else if (n === "{" || n === "}" || n === "@" || n === "|" || !n) break;
				else if (n === Un || n === Y) if (te(e)) t += n, e.next();
				else if (ee(e)) break;
				else t += n, e.next();
				else t += n, e.next();
			}
			return t;
		}
		function le(e) {
			g(e);
			let t = "", n = "";
			for (; t = O(e);) n += t;
			let r = e.currentChar();
			if (r && r !== "}" && r !== Jn && r !== Un && r !== Y && r !== "　") {
				let t = pe(e);
				return d(J.INVALID_TOKEN_IN_PLACEHOLDER, a(), 0, n + t), n + t;
			}
			return e.currentChar() === Jn && d(J.UNTERMINATED_CLOSING_BRACE, a(), 0), n;
		}
		function ue(e) {
			g(e);
			let t = "";
			return e.currentChar() === "-" ? (e.next(), t += `-${se(e)}`) : t += se(e), e.currentChar() === Jn && d(J.UNTERMINATED_CLOSING_BRACE, a(), 0), t;
		}
		function A(e) {
			return e !== Yn && e !== Y;
		}
		function j(e) {
			g(e), m(e, "'");
			let t = "", n = "";
			for (; t = E(e, A);) t === "\\" ? n += de(e) : n += t;
			let r = e.currentChar();
			return r === Y || r === Jn ? (d(J.UNTERMINATED_SINGLE_QUOTE_IN_PLACEHOLDER, a(), 0), r === Y && (e.next(), m(e, "'")), n) : (m(e, "'"), n);
		}
		function de(e) {
			let t = e.currentChar();
			switch (t) {
				case "\\":
				case "'": return e.next(), `\\${t}`;
				case "u": return fe(e, t, 4);
				case "U": return fe(e, t, 6);
				default: return d(J.UNKNOWN_ESCAPE_SEQUENCE, a(), 0, t), "";
			}
		}
		function fe(e, t, n) {
			m(e, t);
			let r = "";
			for (let i = 0; i < n; i++) {
				let n = k(e);
				if (!n) {
					d(J.INVALID_UNICODE_ESCAPE_SEQUENCE, a(), 0, `\\${t}${r}${e.currentChar()}`);
					break;
				}
				r += n;
			}
			return `\\${t}${r}`;
		}
		function M(e) {
			return e !== "{" && e !== "}" && e !== Un && e !== Y;
		}
		function pe(e) {
			g(e);
			let t = "", n = "";
			for (; t = E(e, M);) n += t;
			return n;
		}
		function me(e) {
			let t = "", n = "";
			for (; t = re(e);) n += t;
			return n;
		}
		function he(e) {
			let t = (n) => {
				let r = e.currentChar();
				return r === "{" || r === "@" || r === "|" || r === "(" || r === ")" || !r || r === Un ? n : (n += r, e.next(), t(n));
			};
			return t("");
		}
		function ge(e) {
			g(e);
			let t = m(e, "|");
			return g(e), t;
		}
		function _e(e, t) {
			let n = null;
			switch (e.currentChar()) {
				case "{": return t.braceNest >= 1 && d(J.NOT_ALLOW_NEST_PLACEHOLDER, a(), 0), e.next(), n = f(t, 2, "{"), g(e), t.braceNest++, n;
				case "}": return t.braceNest > 0 && t.currentType === 2 && d(J.EMPTY_PLACEHOLDER, a(), 0), e.next(), n = f(t, 3, "}"), t.braceNest--, t.braceNest > 0 && g(e), t.inLinked && t.braceNest === 0 && (t.inLinked = !1), n;
				case "@": return t.braceNest > 0 && d(J.UNTERMINATED_CLOSING_BRACE, a(), 0), n = ve(e, t) || p(t), t.braceNest = 0, n;
				default: {
					let r = !0, i = !0, o = !0;
					if (ee(e)) return t.braceNest > 0 && d(J.UNTERMINATED_CLOSING_BRACE, a(), 0), n = f(t, 1, ge(e)), t.braceNest = 0, t.inLinked = !1, n;
					if (t.braceNest > 0 && (t.currentType === 4 || t.currentType === 5 || t.currentType === 6)) return d(J.UNTERMINATED_CLOSING_BRACE, a(), 0), t.braceNest = 0, ye(e, t);
					if (r = y(e, t)) return n = f(t, 4, le(e)), g(e), n;
					if (i = b(e, t)) return n = f(t, 5, ue(e)), g(e), n;
					if (o = x(e, t)) return n = f(t, 6, j(e)), g(e), n;
					if (!r && !i && !o) return n = f(t, 12, pe(e)), d(J.INVALID_TOKEN_IN_PLACEHOLDER, a(), 0, n.value), g(e), n;
					break;
				}
			}
			return n;
		}
		function ve(e, t) {
			let { currentType: n } = t, r = null, i = e.currentChar();
			switch ((n === 7 || n === 8 || n === 11 || n === 9) && (i === Y || i === Un) && d(J.INVALID_LINKED_FORMAT, a(), 0), i) {
				case "@": return e.next(), r = f(t, 7, "@"), t.inLinked = !0, r;
				case ".": return g(e), e.next(), f(t, 8, ".");
				case ":": return g(e), e.next(), f(t, 9, ":");
				default: return ee(e) ? (r = f(t, 1, ge(e)), t.braceNest = 0, t.inLinked = !1, r) : S(e, t) || w(e, t) ? (g(e), ve(e, t)) : C(e, t) ? (g(e), f(t, 11, me(e))) : T(e, t) ? (g(e), i === "{" ? _e(e, t) || r : f(t, 10, he(e))) : (n === 7 && d(J.INVALID_LINKED_FORMAT, a(), 0), t.braceNest = 0, t.inLinked = !1, ye(e, t));
			}
		}
		function ye(e, t) {
			let n = { type: 13 };
			if (t.braceNest > 0) return _e(e, t) || p(t);
			if (t.inLinked) return ve(e, t) || p(t);
			switch (e.currentChar()) {
				case "{": return _e(e, t) || p(t);
				case "}": return d(J.UNBALANCED_CLOSING_BRACE, a(), 0), e.next(), f(t, 3, "}");
				case "@": return ve(e, t) || p(t);
				default:
					if (ee(e)) return n = f(t, 1, ge(e)), t.braceNest = 0, t.inLinked = !1, n;
					if (te(e)) return f(t, 0, ce(e));
			}
			return n;
		}
		function be() {
			let { currentType: e, offset: t, startLoc: n, endLoc: o } = c;
			return c.lastType = e, c.lastOffset = t, c.lastStartLoc = n, c.lastEndLoc = o, c.offset = i(), c.startLoc = a(), r.currentChar() === Jn ? f(c, 13) : ye(r, c);
		}
		return {
			nextToken: be,
			currentOffset: i,
			currentPosition: a,
			context: l
		};
	}
	var Qn = "parser";
	var $n = /(?:\\\\|\\'|\\u([0-9a-fA-F]{4})|\\U([0-9a-fA-F]{6}))/g;
	var er = /\\([\\@{}|])/g;
	function tr(e, t) {
		return t;
	}
	function nr(e, t, n) {
		switch (e) {
			case "\\\\": return "\\";
			case "\\'": return "'";
			default: {
				let e = parseInt(t || n, 16);
				return e <= 55295 || e >= 57344 ? String.fromCodePoint(e) : "�";
			}
		}
	}
	function rr(e = {}) {
		let t = e.location !== !1, { onError: n } = e;
		function r(e, r, i, a, ...o) {
			let s = e.currentPosition();
			if (s.offset += a, s.column += a, n) {
				let e = zn(r, t ? Ln(i, s) : null, {
					domain: Qn,
					args: o
				});
				n(e);
			}
		}
		function i(e, n, r) {
			let i = { type: e };
			return t && (i.start = n, i.end = n, i.loc = {
				start: r,
				end: r
			}), i;
		}
		function a(e, n, r, i) {
			t && (e.end = n, e.loc && (e.loc.end = r));
		}
		function o(e, t) {
			let n = e.context(), r = i(3, n.offset, n.startLoc);
			return r.value = t.replace(er, tr), a(r, e.currentOffset(), e.currentPosition()), r;
		}
		function s(e, t) {
			let { lastOffset: n, lastStartLoc: r } = e.context(), o = i(5, n, r);
			return o.index = parseInt(t, 10), e.nextToken(), a(o, e.currentOffset(), e.currentPosition()), o;
		}
		function c(e, t) {
			let { lastOffset: n, lastStartLoc: r } = e.context(), o = i(4, n, r);
			return o.key = t, e.nextToken(), a(o, e.currentOffset(), e.currentPosition()), o;
		}
		function l(e, t) {
			let { lastOffset: n, lastStartLoc: r } = e.context(), o = i(9, n, r);
			return o.value = t.replace($n, nr), e.nextToken(), a(o, e.currentOffset(), e.currentPosition()), o;
		}
		function u(e) {
			let t = e.nextToken(), n = e.context(), { lastOffset: o, lastStartLoc: s } = n, c = i(8, o, s);
			return t.type === 11 ? (t.value ?? r(e, J.UNEXPECTED_LEXICAL_ANALYSIS, n.lastStartLoc, 0, ir(t)), c.value = t.value || "", a(c, e.currentOffset(), e.currentPosition()), { node: c }) : (r(e, J.UNEXPECTED_EMPTY_LINKED_MODIFIER, n.lastStartLoc, 0), c.value = "", a(c, o, s), {
				nextConsumeToken: t,
				node: c
			});
		}
		function d(e, t) {
			let n = e.context(), r = i(7, n.offset, n.startLoc);
			return r.value = t, a(r, e.currentOffset(), e.currentPosition()), r;
		}
		function f(e) {
			let t = e.context(), n = i(6, t.offset, t.startLoc), o = e.nextToken();
			if (o.type === 8) {
				let t = u(e);
				n.modifier = t.node, o = t.nextConsumeToken || e.nextToken();
			}
			switch (o.type !== 9 && r(e, J.UNEXPECTED_LEXICAL_ANALYSIS, t.lastStartLoc, 0, ir(o)), o = e.nextToken(), o.type === 2 && (o = e.nextToken()), o.type) {
				case 10:
					o.value ?? r(e, J.UNEXPECTED_LEXICAL_ANALYSIS, t.lastStartLoc, 0, ir(o)), n.key = d(e, o.value || "");
					break;
				case 4:
					o.value ?? r(e, J.UNEXPECTED_LEXICAL_ANALYSIS, t.lastStartLoc, 0, ir(o)), n.key = c(e, o.value || "");
					break;
				case 5:
					o.value ?? r(e, J.UNEXPECTED_LEXICAL_ANALYSIS, t.lastStartLoc, 0, ir(o)), n.key = s(e, o.value || "");
					break;
				case 6:
					o.value ?? r(e, J.UNEXPECTED_LEXICAL_ANALYSIS, t.lastStartLoc, 0, ir(o)), n.key = l(e, o.value || "");
					break;
				default: {
					r(e, J.UNEXPECTED_EMPTY_LINKED_KEY, t.lastStartLoc, 0);
					let s = e.context(), c = i(7, s.offset, s.startLoc);
					return c.value = "", a(c, s.offset, s.startLoc), n.key = c, a(n, s.offset, s.startLoc), {
						nextConsumeToken: o,
						node: n
					};
				}
			}
			return a(n, e.currentOffset(), e.currentPosition()), { node: n };
		}
		function p(e) {
			let t = e.context(), n = i(2, t.currentType === 1 ? e.currentOffset() : t.offset, t.currentType === 1 ? t.endLoc : t.startLoc);
			n.items = [];
			let u = null;
			do {
				let i = u || e.nextToken();
				switch (u = null, i.type) {
					case 0:
						i.value ?? r(e, J.UNEXPECTED_LEXICAL_ANALYSIS, t.lastStartLoc, 0, ir(i)), n.items.push(o(e, i.value || ""));
						break;
					case 5:
						i.value ?? r(e, J.UNEXPECTED_LEXICAL_ANALYSIS, t.lastStartLoc, 0, ir(i)), n.items.push(s(e, i.value || ""));
						break;
					case 4:
						i.value ?? r(e, J.UNEXPECTED_LEXICAL_ANALYSIS, t.lastStartLoc, 0, ir(i)), n.items.push(c(e, i.value || ""));
						break;
					case 6:
						i.value ?? r(e, J.UNEXPECTED_LEXICAL_ANALYSIS, t.lastStartLoc, 0, ir(i)), n.items.push(l(e, i.value || ""));
						break;
					case 7: {
						let t = f(e);
						n.items.push(t.node), u = t.nextConsumeToken || null;
						break;
					}
				}
			} while (t.currentType !== 13 && t.currentType !== 1);
			return a(n, t.currentType === 1 ? t.lastOffset : e.currentOffset(), t.currentType === 1 ? t.lastEndLoc : e.currentPosition()), n;
		}
		function m(e, t, n, o) {
			let s = e.context(), c = o.items.length === 0, l = i(1, t, n);
			l.cases = [], l.cases.push(o);
			do {
				let t = p(e);
				c ||= t.items.length === 0, l.cases.push(t);
			} while (s.currentType !== 13);
			return c && r(e, J.MUST_HAVE_MESSAGES_IN_PLURAL, n, 0), a(l, e.currentOffset(), e.currentPosition()), l;
		}
		function h(e) {
			let t = e.context(), { offset: n, startLoc: r } = t, i = p(e);
			return t.currentType === 13 ? i : m(e, n, r, i);
		}
		function g(n) {
			let o = Zn(n, B({}, e)), s = o.context(), c = i(0, s.offset, s.startLoc);
			return t && c.loc && (c.loc.source = n), c.body = h(o), e.onCacheKey && (c.cacheKey = e.onCacheKey(n)), s.currentType !== 13 && r(o, J.UNEXPECTED_LEXICAL_ANALYSIS, s.lastStartLoc, 0, n[s.offset] || ""), a(c, o.currentOffset(), o.currentPosition()), c;
		}
		return { parse: g };
	}
	function ir(e) {
		if (e.type === 13) return "EOF";
		let t = (e.value || "").replace(/\r?\n/gu, "\\n");
		return t.length > 10 ? t.slice(0, 9) + "…" : t;
	}
	function ar(e, t = {}) {
		let n = {
			ast: e,
			helpers: /* @__PURE__ */ new Set()
		};
		return {
			context: () => n,
			helper: (e) => (n.helpers.add(e), e)
		};
	}
	function or(e, t) {
		for (let n = 0; n < e.length; n++) sr(e[n], t);
	}
	function sr(e, t) {
		switch (e.type) {
			case 1:
				or(e.cases, t), t.helper("plural");
				break;
			case 2:
				or(e.items, t);
				break;
			case 6:
				sr(e.key, t), t.helper("linked"), t.helper("type");
				break;
			case 5:
				t.helper("interpolate"), t.helper("list");
				break;
			case 4: t.helper("interpolate"), t.helper("named");
		}
	}
	function cr(e, t = {}) {
		let n = ar(e);
		n.helper("normalize"), e.body && sr(e.body, n);
		let r = n.context();
		e.helpers = Array.from(r.helpers);
	}
	function lr(e) {
		let t = e.body;
		return t.type === 2 ? ur(t) : t.cases.forEach((e) => ur(e)), e;
	}
	function ur(e) {
		if (e.items.length === 1) {
			let t = e.items[0];
			(t.type === 3 || t.type === 9) && (e.static = t.value, delete t.value);
		} else {
			let t = [];
			for (let n = 0; n < e.items.length; n++) {
				let r = e.items[n];
				if (!(r.type === 3 || r.type === 9) || r.value == null) break;
				t.push(r.value);
			}
			if (t.length === e.items.length) {
				e.static = An(t);
				for (let t = 0; t < e.items.length; t++) {
					let n = e.items[t];
					(n.type === 3 || n.type === 9) && delete n.value;
				}
			}
		}
	}
	function fr(e) {
		switch (e.t = e.type, e.type) {
			case 0: {
				let t = e;
				fr(t.body), t.b = t.body, delete t.body;
				break;
			}
			case 1: {
				let t = e, n = t.cases;
				for (let e = 0; e < n.length; e++) fr(n[e]);
				t.c = n, delete t.cases;
				break;
			}
			case 2: {
				let t = e, n = t.items;
				for (let e = 0; e < n.length; e++) fr(n[e]);
				t.i = n, delete t.items, t.static && (t.s = t.static, delete t.static);
				break;
			}
			case 3:
			case 9:
			case 8:
			case 7: {
				let t = e;
				t.value && (t.v = t.value, delete t.value);
				break;
			}
			case 6: {
				let t = e;
				fr(t.key), t.k = t.key, delete t.key, t.modifier && (fr(t.modifier), t.m = t.modifier, delete t.modifier);
				break;
			}
			case 5: {
				let t = e;
				t.i = t.index, delete t.index;
				break;
			}
			case 4: {
				let t = e;
				t.k = t.key, delete t.key;
				break;
			}
		}
		delete e.type;
	}
	function mr(e, t) {
		let { filename: n, breakLineCode: r, needIndent: i } = t, a = t.location !== !1, o = {
			filename: n,
			code: "",
			column: 1,
			line: 1,
			offset: 0,
			map: void 0,
			breakLineCode: r,
			needIndent: i,
			indentLevel: 0
		};
		a && e.loc && (o.source = e.loc.source);
		let s = () => o;
		function c(e, t) {
			o.code += e;
		}
		function l(e, t = !0) {
			let n = t ? r : "";
			c(i ? n + "  ".repeat(e) : n);
		}
		function u(e = !0) {
			let t = ++o.indentLevel;
			e && l(t);
		}
		function d(e = !0) {
			let t = --o.indentLevel;
			e && l(t);
		}
		function f() {
			l(o.indentLevel);
		}
		return {
			context: s,
			push: c,
			indent: u,
			deindent: d,
			newline: f,
			helper: (e) => `_${e}`,
			needIndent: () => o.needIndent
		};
	}
	function hr(e, t) {
		let { helper: n } = e;
		e.push(`${n("linked")}(`), yr(e, t.key), t.modifier ? (e.push(", "), yr(e, t.modifier), e.push(", _type")) : e.push(", undefined, _type"), e.push(")");
	}
	function gr(e, t) {
		let { helper: n, needIndent: r } = e;
		e.push(`${n("normalize")}([`), e.indent(r());
		let i = t.items.length;
		for (let n = 0; n < i && (yr(e, t.items[n]), n !== i - 1); n++) e.push(", ");
		e.deindent(r()), e.push("])");
	}
	function _r(e, t) {
		let { helper: n, needIndent: r } = e;
		if (t.cases.length > 1) {
			e.push(`${n("plural")}([`), e.indent(r());
			let i = t.cases.length;
			for (let n = 0; n < i && (yr(e, t.cases[n]), n !== i - 1); n++) e.push(", ");
			e.deindent(r()), e.push("])");
		}
	}
	function vr(e, t) {
		t.body ? yr(e, t.body) : e.push("null");
	}
	function yr(e, t) {
		let { helper: n } = e;
		switch (t.type) {
			case 0:
				vr(e, t);
				break;
			case 1:
				_r(e, t);
				break;
			case 2:
				gr(e, t);
				break;
			case 6:
				hr(e, t);
				break;
			case 8:
				e.push(JSON.stringify(t.value), t);
				break;
			case 7:
				e.push(JSON.stringify(t.value), t);
				break;
			case 5:
				e.push(`${n("interpolate")}(${n("list")}(${t.index}))`, t);
				break;
			case 4:
				e.push(`${n("interpolate")}(${n("named")}(${JSON.stringify(t.key)}))`, t);
				break;
			case 9:
				e.push(JSON.stringify(t.value), t);
				break;
			case 3: e.push(JSON.stringify(t.value), t);
		}
	}
	var br = (e, t = {}) => {
		let n = W(t.mode) ? t.mode : "normal", r = W(t.filename) ? t.filename : "message.intl";
		t.sourceMap;
		let i = t.breakLineCode == null ? n === "arrow" ? ";" : "\n" : t.breakLineCode, a = t.needIndent ? t.needIndent : n !== "arrow", o = e.helpers || [], s = mr(e, {
			filename: r,
			breakLineCode: i,
			needIndent: a
		});
		s.push(n === "normal" ? "function __msg__ (ctx) {" : "(ctx) => {"), s.indent(a), o.length > 0 && (s.push(`const { ${An(o.map((e) => `${e}: _${e}`), ", ")} } = ctx`), s.newline()), s.push("return "), yr(s, e), s.deindent(a), s.push("}"), delete e.helpers;
		let { code: c, map: l } = s.context();
		return {
			ast: e,
			code: c,
			map: l ? l.toJSON() : void 0
		};
	};
	function xr(e, t = {}) {
		let n = B({}, t), r = !!n.jit, i = !!n.minify, a = n.optimize == null || n.optimize, o = rr(n).parse(e);
		return r ? (a && lr(o), i && fr(o), {
			ast: o,
			code: ""
		}) : (cr(o, n), br(o, n));
	}
	function Sr() {
		typeof __INTLIFY_DROP_MESSAGE_COMPILER__ != "boolean" && (hn().__INTLIFY_DROP_MESSAGE_COMPILER__ = !1);
	}
	function Cr(e) {
		return K(e) && Nr(e) === 0 && (Tn(e, "b") || Tn(e, "body"));
	}
	var wr = ["b", "body"];
	function Tr(e) {
		return Br(e, wr);
	}
	var Er = ["c", "cases"];
	function Dr(e) {
		return Br(e, Er, []);
	}
	var Or = ["s", "static"];
	function kr(e) {
		return Br(e, Or);
	}
	var Ar = ["i", "items"];
	function jr(e) {
		return Br(e, Ar, []);
	}
	var Mr = ["t", "type"];
	function Nr(e) {
		return Br(e, Mr);
	}
	var Pr = ["v", "value"];
	function Fr(e, t) {
		let n = Br(e, Pr);
		if (n != null) return n;
		throw Hr(t);
	}
	var Ir = ["m", "modifier"];
	function Lr(e) {
		return Br(e, Ir);
	}
	var Rr = ["k", "key"];
	function zr(e) {
		let t = Br(e, Rr);
		if (t) return t;
		throw Hr(6);
	}
	function Br(e, t, n) {
		for (let n = 0; n < t.length; n++) {
			let r = t[n];
			if (Tn(e, r) && e[r] != null) return e[r];
		}
		return n;
	}
	var Vr = [
		...wr,
		...Er,
		...Or,
		...Ar,
		...Rr,
		...Ir,
		...Pr,
		...Mr
	];
	function Hr(e) {
		return /* @__PURE__ */ Error(`unhandled node type: ${e}`);
	}
	function Ur(e) {
		return (t) => Wr(t, e);
	}
	function Wr(e, t) {
		let n = Tr(t);
		if (n == null) throw Hr(0);
		if (Nr(n) === 1) {
			let t = Dr(n);
			return e.plural(t.reduce((t, n) => [...t, Gr(e, n)], []));
		} else return Gr(e, n);
	}
	function Gr(e, t) {
		let n = kr(t);
		if (n != null) return e.type === "text" ? n : e.normalize([n]);
		{
			let n = jr(t).reduce((t, n) => [...t, Kr(e, n)], []);
			return e.normalize(n);
		}
	}
	function Kr(e, t) {
		let n = Nr(t);
		switch (n) {
			case 3: return Fr(t, n);
			case 9: return Fr(t, n);
			case 4: {
				let r = t;
				if (Tn(r, "k") && r.k) return e.interpolate(e.named(r.k));
				if (Tn(r, "key") && r.key) return e.interpolate(e.named(r.key));
				throw Hr(n);
			}
			case 5: {
				let r = t;
				if (Tn(r, "i") && z(r.i)) return e.interpolate(e.list(r.i));
				if (Tn(r, "index") && z(r.index)) return e.interpolate(e.list(r.index));
				throw Hr(n);
			}
			case 6: {
				let n = t, r = Lr(n), i = zr(n);
				return e.linked(Kr(e, i), r ? Kr(e, r) : void 0, e.type);
			}
			case 7: return Fr(t, n);
			case 8: return Fr(t, n);
			default: throw Error(`unhandled node on format message part: ${n}`);
		}
	}
	var Yr = (e) => e;
	var Xr = V();
	function Zr(e, t = {}) {
		let n = !1, r = t.onError || Bn;
		return t.onError = (e) => {
			n = !0, r(e);
		}, {
			...xr(e, t),
			detectError: n
		};
	}
	/* #__NO_SIDE_EFFECTS__ */
	function Qr(e, t) {
		if (!__INTLIFY_DROP_MESSAGE_COMPILER__ && W(e)) {
			!G(t.warnHtmlMessage) || t.warnHtmlMessage;
			let r = (t.onCacheKey || Yr)(e), i = Xr[r];
			if (i) return i;
			let { ast: a, detectError: o } = Zr(e, {
				...t,
				location: false,
				jit: !0
			}), s = Ur(a);
			return o ? s : Xr[r] = s;
		} else {
			let n = e.cacheKey;
			return n ? Xr[n] || (Xr[n] = Ur(e)) : Ur(e);
		}
	}
	var X = {
		INVALID_ARGUMENT: 17,
		INVALID_DATE_ARGUMENT: 18,
		INVALID_ISO_DATE_ARGUMENT: 19,
		NOT_SUPPORT_NON_STRING_MESSAGE: 20,
		NOT_SUPPORT_LOCALE_PROMISE_VALUE: 21,
		NOT_SUPPORT_LOCALE_ASYNC_FUNCTION: 22,
		NOT_SUPPORT_LOCALE_TYPE: 23
	};
	function ii(e) {
		return zn(e, null, void 0);
	}
	X.INVALID_ARGUMENT, X.INVALID_DATE_ARGUMENT, X.INVALID_ISO_DATE_ARGUMENT, X.NOT_SUPPORT_NON_STRING_MESSAGE, X.NOT_SUPPORT_LOCALE_PROMISE_VALUE, X.NOT_SUPPORT_LOCALE_ASYNC_FUNCTION, X.NOT_SUPPORT_LOCALE_TYPE;
	function oi(e, t) {
		return t.locale == null ? ci(e.locale) : ci(t.locale);
	}
	var si;
	function ci(e) {
		if (W(e)) return e;
		if (U(e)) {
			if (e.resolvedOnce && si != null) return si;
			if (e.constructor.name === "Function") {
				let t = e();
				if (En(t)) throw ii(X.NOT_SUPPORT_LOCALE_PROMISE_VALUE);
				return si = t;
			} else throw ii(X.NOT_SUPPORT_LOCALE_ASYNC_FUNCTION);
		} else throw ii(X.NOT_SUPPORT_LOCALE_TYPE);
	}
	function li(e, t, n) {
		return [.../* @__PURE__ */ new Set([n, ...H(t) ? t : K(t) ? Object.keys(t) : W(t) ? [t] : [n]])];
	}
	function ui(e, t, n) {
		let r = W(n) ? n : Di, i = e;
		i.__localeChainCache ||= /* @__PURE__ */ new Map();
		let a = i.__localeChainCache.get(r);
		if (!a) {
			a = [];
			let e = [n];
			for (; H(e);) e = di(a, e, t);
			let o = H(t) || !q(t) ? t : t.default ? t.default : null;
			e = W(o) ? [o] : o, H(e) && di(a, e, !1), i.__localeChainCache.set(r, a);
		}
		return a;
	}
	function di(e, t, n) {
		let r = !0;
		for (let i = 0; i < t.length && G(r); i++) {
			let a = t[i];
			W(a) && (r = fi(e, t[i], n));
		}
		return r;
	}
	function fi(e, t, n) {
		let r, i = t.split("-");
		do
			r = pi(e, i.join("-"), n), i.splice(-1, 1);
		while (i.length && r === !0);
		return r;
	}
	function pi(e, t, n) {
		let r = !1;
		if (!e.includes(t) && (r = !0, t)) {
			r = t[t.length - 1] !== "!";
			let i = t.replace(/!/g, "");
			e.push(i), (H(n) || q(n)) && n[i] && (r = n[i]);
		}
		return r;
	}
	var mi = [];
	mi[0] = {
		w: [0],
		i: [3, 0],
		"[": [4],
		o: [7]
	}, mi[1] = {
		w: [1],
		".": [2],
		"[": [4],
		o: [7]
	}, mi[2] = {
		w: [2],
		i: [3, 0],
		0: [3, 0]
	}, mi[3] = {
		i: [3, 0],
		0: [3, 0],
		w: [1, 1],
		".": [2, 1],
		"[": [4, 1],
		o: [7, 1]
	}, mi[4] = {
		"'": [5, 0],
		"\"": [6, 0],
		"[": [4, 2],
		"]": [1, 3],
		o: 8,
		l: [4, 0]
	}, mi[5] = {
		"'": [4, 0],
		o: 8,
		l: [5, 0]
	}, mi[6] = {
		"\"": [4, 0],
		o: 8,
		l: [6, 0]
	};
	var hi = /^\s?(?:true|false|-?[\d.]+|'[^']*'|"[^"]*")\s?$/;
	function gi(e) {
		return hi.test(e);
	}
	function _i(e) {
		let t = e.charCodeAt(0);
		return t === e.charCodeAt(e.length - 1) && (t === 34 || t === 39) ? e.slice(1, -1) : e;
	}
	function vi(e) {
		if (e == null) return "o";
		switch (e.charCodeAt(0)) {
			case 91:
			case 93:
			case 46:
			case 34:
			case 39: return e;
			case 95:
			case 36:
			case 45: return "i";
			case 9:
			case 10:
			case 13:
			case 160:
			case 65279:
			case 8232:
			case 8233: return "w";
		}
		return "i";
	}
	function yi(e) {
		let t = e.trim();
		return e.charAt(0) === "0" && isNaN(parseInt(e)) ? !1 : gi(t) ? _i(t) : "*" + t;
	}
	function bi(e) {
		let t = [], n = -1, r = 0, i = 0, a, o, s, c, l, u, d, f = [];
		f[0] = () => {
			o === void 0 ? o = s : o += s;
		}, f[1] = () => {
			o !== void 0 && (t.push(o), o = void 0);
		}, f[2] = () => {
			f[0](), i++;
		}, f[3] = () => {
			if (i > 0) i--, r = 4, f[0]();
			else {
				if (i = 0, o === void 0 || (o = yi(o), o === !1)) return !1;
				f[1]();
			}
		};
		function p() {
			let t = e[n + 1];
			if (r === 5 && t === "'" || r === 6 && t === "\"") return n++, s = "\\" + t, f[0](), !0;
		}
		for (; r !== null;) if (n++, a = e[n], !(a === "\\" && p())) {
			if (c = vi(a), d = mi[r], l = d[c] || d.l || 8, l === 8 || (r = l[0], l[1] !== void 0 && (u = f[l[1]], u && (s = a, u() === !1)))) return;
			if (r === 7) return t;
		}
	}
	var xi = /* @__PURE__ */ new Map();
	function Si(e, t) {
		return K(e) ? e[t] : null;
	}
	function Ci(e, t) {
		if (!K(e)) return null;
		let n = xi.get(t);
		if (n || (n = bi(t), n && xi.set(t, n)), !n) return null;
		let r = n.length, i = e, a = 0;
		for (; a < r;) {
			let e = n[a];
			if (Vr.includes(e) && Cr(i) || !K(i) || !Tn(i, e)) return null;
			let t = i[e];
			if (t === void 0 || U(i)) return null;
			i = t, a++;
		}
		return i;
	}
	var Z = {
		NOT_FOUND_KEY: 1,
		FALLBACK_TO_TRANSLATE: 2,
		CANNOT_FORMAT_NUMBER: 3,
		FALLBACK_TO_NUMBER_FORMAT: 4,
		CANNOT_FORMAT_DATE: 5,
		FALLBACK_TO_DATE_FORMAT: 6,
		EXPERIMENTAL_CUSTOM_MESSAGE_COMPILER: 7,
		INVALID_NUMBER_ARGUMENT: 8,
		INVALID_DATE_ARGUMENT: 9
	};
	Z.NOT_FOUND_KEY, Z.FALLBACK_TO_TRANSLATE, Z.CANNOT_FORMAT_NUMBER, Z.FALLBACK_TO_NUMBER_FORMAT, Z.CANNOT_FORMAT_DATE, Z.FALLBACK_TO_DATE_FORMAT, Z.EXPERIMENTAL_CUSTOM_MESSAGE_COMPILER, Z.INVALID_NUMBER_ARGUMENT, Z.INVALID_DATE_ARGUMENT;
	var Ei = "11.4.6";
	var Di = "en-US";
	var Oi = (e) => `${e.charAt(0).toLocaleUpperCase()}${e.substr(1)}`;
	function ki() {
		return {
			upper: (e, t) => t === "text" && W(e) ? e.toUpperCase() : t === "vnode" && K(e) && "__v_isVNode" in e ? e.children.toUpperCase() : e,
			lower: (e, t) => t === "text" && W(e) ? e.toLowerCase() : t === "vnode" && K(e) && "__v_isVNode" in e ? e.children.toLowerCase() : e,
			capitalize: (e, t) => t === "text" && W(e) ? Oi(e) : t === "vnode" && K(e) && "__v_isVNode" in e ? Oi(e.children) : e
		};
	}
	var Ai;
	function ji(e) {
		Ai = e;
	}
	var Mi;
	function Ni(e) {
		Mi = e;
	}
	var Pi;
	function Fi(e) {
		Pi = e;
	}
	var Ri = null;
	var zi = (e) => {
		Ri = e;
	};
	var Bi = () => Ri;
	var Vi = 0;
	function Hi(e = {}) {
		let t = U(e.onWarn) ? e.onWarn : $t, n = W(e.version) ? e.version : Ei, r = W(e.locale) || U(e.locale) ? e.locale : Di, i = U(r) ? Di : r, a = H(e.fallbackLocale) || q(e.fallbackLocale) || W(e.fallbackLocale) || e.fallbackLocale === !1 ? e.fallbackLocale : i, o = q(e.messages) ? e.messages : Ui(i), s = q(e.datetimeFormats) ? e.datetimeFormats : Ui(i), c = q(e.numberFormats) ? e.numberFormats : Ui(i), l = B(V(), e.modifiers, ki()), u = e.pluralRules || V(), d = U(e.missing) ? e.missing : null, f = G(e.missingWarn) || dn(e.missingWarn) ? e.missingWarn : !0, p = G(e.fallbackWarn) || dn(e.fallbackWarn) ? e.fallbackWarn : !0, m = !!e.fallbackFormat, h = !!e.unresolving, g = U(e.postTranslation) ? e.postTranslation : null, _ = q(e.processor) ? e.processor : null, v = !G(e.warnHtmlMessage) || e.warnHtmlMessage, y = !!e.escapeParameter, b = U(e.messageCompiler) ? e.messageCompiler : Ai;
		let x = U(e.messageResolver) ? e.messageResolver : Mi || Si, S = U(e.localeFallbacker) ? e.localeFallbacker : Pi || li, C = K(e.fallbackContext) ? e.fallbackContext : void 0, w = e, T = K(w.__datetimeFormatters) ? w.__datetimeFormatters : /* @__PURE__ */ new Map(), ee = K(w.__numberFormatters) ? w.__numberFormatters : /* @__PURE__ */ new Map(), te = K(w.__meta) ? w.__meta : {};
		Vi++;
		let E = {
			version: n,
			cid: Vi,
			locale: r,
			fallbackLocale: a,
			messages: o,
			modifiers: l,
			pluralRules: u,
			missing: d,
			missingWarn: f,
			fallbackWarn: p,
			fallbackFormat: m,
			unresolving: h,
			postTranslation: g,
			processor: _,
			warnHtmlMessage: v,
			escapeParameter: y,
			messageCompiler: b,
			messageResolver: x,
			localeFallbacker: S,
			fallbackContext: C,
			onWarn: t,
			__meta: te
		};
		return E.datetimeFormats = s, E.numberFormats = c, E.__datetimeFormatters = T, E.__numberFormatters = ee, E;
	}
	var Ui = (e) => ({ [e]: V() });
	function Ki(e, t, n, r, i) {
		let { missing: a, onWarn: o } = e;
		if (a !== null) {
			let r = a(e, n, t, i);
			return W(r) ? r : t;
		} else return t;
	}
	function qi(e, t, n) {
		let r = e;
		r.__localeChainCache = /* @__PURE__ */ new Map(), e.localeFallbacker(e, n, t);
	}
	function Ji(e, t) {
		return e !== t && e.split("-")[0] === t.split("-")[0];
	}
	function Yi(e, t) {
		let n = t.indexOf(e);
		if (n === -1) return !1;
		for (let r = n + 1; r < t.length; r++) if (Ji(e, t[r])) return !0;
		return !1;
	}
	var Xi = typeof Intl < "u";
	Xi && Intl.DateTimeFormat, Xi && Intl.NumberFormat;
	function Qi(e, ...t) {
		let { datetimeFormats: n, unresolving: r, fallbackLocale: i, onWarn: a, localeFallbacker: o } = e, { __datetimeFormatters: s } = e;
		if (!W(t[0]) && !un(t[0]) && !z(t[0])) return "";
		let [c, l, u, d] = ea(...t), f = G(u.missingWarn) ? u.missingWarn : e.missingWarn;
		G(u.fallbackWarn) ? u.fallbackWarn : e.fallbackWarn;
		let m = !!u.part, h = oi(e, u), g = o(e, i, h);
		if (!W(c) || c === "") {
			let e = new Intl.DateTimeFormat(h.replace(/!/g, ""), d);
			return m ? e.formatToParts(l) : e.format(l);
		}
		let _ = {}, v, y = null, S = "datetime format";
		for (let t = 0; t < g.length; t++) {
			if (v = g[t], false);
			if (_ = n[v] || {}, y = _[c], q(y)) break;
			Ki(e, c, v, f, S);
		}
		if (!q(y) || !W(v)) return r ? -1 : c;
		let C = `${v}__${c}`;
		fn(d) || (C = `${C}__${JSON.stringify(d)}`);
		let w = s.get(C);
		return w || (w = new Intl.DateTimeFormat(v, B({}, y, d)), s.set(C, w)), m ? w.formatToParts(l) : w.format(l);
	}
	var $i = [
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
	function ea(...e) {
		let [t, n, r, i] = e, a = V(), o = V(), s;
		if (W(t)) {
			let e = t.match(/(\d{4}-\d{2}-\d{2})(T|\s)?(.*)/);
			if (!e) throw ii(X.INVALID_ISO_DATE_ARGUMENT);
			let n = e[3] ? e[3].trim().startsWith("T") ? `${e[1].trim()}${e[3].trim()}` : `${e[1].trim()}T${e[3].trim()}` : e[1].trim();
			s = new Date(n);
			try {
				s.toISOString();
			} catch {
				throw ii(X.INVALID_ISO_DATE_ARGUMENT);
			}
		} else if (un(t)) {
			if (isNaN(t.getTime())) throw ii(X.INVALID_DATE_ARGUMENT);
			s = t;
		} else if (z(t)) s = t;
		else throw ii(X.INVALID_ARGUMENT);
		return W(n) ? a.key = n : q(n) && Object.keys(n).forEach((e) => {
			$i.includes(e) ? o[e] = n[e] : a[e] = n[e];
		}), W(r) ? a.locale = r : q(r) && (o = r), q(i) && (o = i), [
			a.key || "",
			s,
			a,
			o
		];
	}
	function ta(e, t, n) {
		let r = e;
		for (let e in n) {
			let n = `${t}__${e}`;
			r.__datetimeFormatters.has(n) && r.__datetimeFormatters.delete(n);
		}
	}
	function na(e, ...t) {
		let { numberFormats: n, unresolving: r, fallbackLocale: i, onWarn: a, localeFallbacker: o } = e, { __numberFormatters: s } = e;
		if (!z(t[0])) return "";
		let [c, l, u, d] = ia(...t), f = G(u.missingWarn) ? u.missingWarn : e.missingWarn;
		G(u.fallbackWarn) ? u.fallbackWarn : e.fallbackWarn;
		let m = !!u.part, h = oi(e, u), g = o(e, i, h);
		if (!W(c) || c === "") {
			let e = new Intl.NumberFormat(h.replace(/!/g, ""), d);
			return m ? e.formatToParts(l) : e.format(l);
		}
		let _ = {}, v, y = null, S = "number format";
		for (let t = 0; t < g.length; t++) {
			if (v = g[t], false);
			if (_ = n[v] || {}, y = _[c], q(y)) break;
			Ki(e, c, v, f, S);
		}
		if (!q(y) || !W(v)) return r ? -1 : c;
		let C = `${v}__${c}`;
		fn(d) || (C = `${C}__${JSON.stringify(d)}`);
		let w = s.get(C);
		return w || (w = new Intl.NumberFormat(v, B({}, y, d)), s.set(C, w)), m ? w.formatToParts(l) : w.format(l);
	}
	var ra = [
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
	function ia(...e) {
		let [t, n, r, i] = e, a = V(), o = V();
		if (!z(t)) throw ii(X.INVALID_ARGUMENT);
		let s = t;
		return W(n) ? a.key = n : q(n) && Object.keys(n).forEach((e) => {
			ra.includes(e) ? o[e] = n[e] : a[e] = n[e];
		}), W(r) ? a.locale = r : q(r) && (o = r), q(i) && (o = i), [
			a.key || "",
			s,
			a,
			o
		];
	}
	function aa(e, t, n) {
		let r = e;
		for (let e in n) {
			let n = `${t}__${e}`;
			r.__numberFormatters.has(n) && r.__numberFormatters.delete(n);
		}
	}
	var oa = (e) => e;
	var sa = (e) => "";
	var ca = "text";
	var la = (e) => e.length === 0 ? "" : An(e);
	var ua = kn;
	function da(e, t) {
		return e = Math.abs(e), t === 2 ? e === 1 ? 0 : 1 : Math.min(e, 2);
	}
	function fa(e) {
		let t = z(e.pluralIndex) ? e.pluralIndex : -1;
		return z(e.named?.count) ? e.named.count : z(e.named?.n) ? e.named.n : t;
	}
	function pa(e = {}) {
		let t = e.locale, n = fa(e), r = W(t) && U(e.pluralRules?.[t]) ? e.pluralRules[t] : da, i = r === da ? void 0 : da, a = (e) => e[r(n, e.length, i)], o = e.list || [], s = (e) => o[e], c = e.named || V();
		z(e.pluralIndex) && (c.count ||= e.pluralIndex, c.n ||= e.pluralIndex);
		let l = (e) => c[e];
		function u(t, n) {
			return (U(e.messages) ? e.messages(t, !!n) : K(e.messages) ? e.messages[t] : !1) || (e.parent ? e.parent.message(t) : sa);
		}
		let d = (t) => e.modifiers ? e.modifiers[t] : oa, f = U(e.processor?.normalize) ? e.processor.normalize : la, p = U(e.processor?.interpolate) ? e.processor.interpolate : ua, m = {
			list: s,
			named: l,
			plural: a,
			linked: (e, ...t) => {
				let [n, r] = t, i = "text", a = "";
				t.length === 1 ? K(n) ? (a = n.modifier || a, i = n.type || i) : W(n) && (a = n || a) : t.length === 2 && (W(n) && (a = n || a), W(r) && (i = r || i));
				let o = u(e, !0)(m), s = o === "" || o === void 0 ? e : o, c = i === "vnode" && H(s) && a ? s[0] : s;
				return a ? d(a)(c, i) : c;
			},
			message: u,
			type: W(e.processor?.type) ? e.processor.type : ca,
			interpolate: p,
			normalize: f,
			values: B(V(), o, c)
		};
		return m;
	}
	var ma = () => "";
	var ha = (e) => U(e);
	function ga(e, ...t) {
		let { fallbackFormat: n, postTranslation: r, unresolving: i, messageCompiler: a, fallbackLocale: o, messages: s } = e, [c, l] = xa(...t), u = G(l.missingWarn) ? l.missingWarn : e.missingWarn, d = G(l.fallbackWarn) ? l.fallbackWarn : e.fallbackWarn, f = G(l.escapeParameter) ? l.escapeParameter : e.escapeParameter, p = !!l.resolvedMessage, m = W(l.default) || G(l.default) ? G(l.default) ? a ? c : () => c : l.default : n ? a ? c : () => c : null, h = n || m != null && (W(m) || U(m)), g = oi(e, l);
		f && _a(l);
		let [_, v, y] = p ? [
			c,
			g,
			s[g] || V()
		] : va(e, c, g, o, d, u), b = _, x = c;
		if (!p && !(W(b) || Cr(b) || ha(b)) && h && (b = m, x = b), !p && (!(W(b) || Cr(b) || ha(b)) || !W(v))) return i ? -1 : c;
		let S = !1, C = ha(b) ? b : ya(e, c, v, b, x, () => {
			S = !0;
		});
		if (S) return b;
		let w = ba(e, C, pa(wa(e, v, y, l))), T = r ? r(w, c) : w;
		if (f && W(T) && (T = Cn(T)), false);
		return T;
	}
	function _a(e) {
		H(e.list) ? e.list = e.list.map((e) => W(e) ? gn(e) : e) : K(e.named) && Object.keys(e.named).forEach((t) => {
			W(e.named[t]) && (e.named[t] = gn(e.named[t]));
		});
	}
	function va(e, t, n, r, i, a) {
		let { messages: o, onWarn: s, messageResolver: c, localeFallbacker: l } = e, u = l(e, r, n), d = V(), f, p = null, g = "translate";
		for (let r = 0; r < u.length; r++) {
			f = u[r];
			d = o[f] || V();
			if ((p = c(d, t)) === null && (p = d[t]), false);
			if (W(p) || Cr(p) || ha(p)) break;
			if (!Yi(f, u)) {
				let n = Ki(e, t, f, a, g);
				n !== t && (p = n);
			}
		}
		return [
			p,
			f,
			d
		];
	}
	function ya(e, t, n, r, i, a) {
		let { messageCompiler: o, warnHtmlMessage: s } = e;
		if (ha(r)) {
			let e = r;
			return e.locale = e.locale || n, e.key = e.key || t, e;
		}
		if (o == null) {
			let e = (() => r);
			return e.locale = n, e.key = t, e;
		}
		let f = o(r, Sa(e, n, i, r, s, a));
		return f.locale = n, f.key = t, f.source = r, f;
	}
	function ba(e, t, n) {
		return t(n);
	}
	function xa(...e) {
		let [t, n, r] = e, i = V();
		if (!W(t) && !z(t) && !ha(t) && !Cr(t)) throw ii(X.INVALID_ARGUMENT);
		let a = z(t) ? String(t) : (ha(t), t);
		return z(n) ? i.plural = n : W(n) ? i.default = n : q(n) && !fn(n) ? i.named = n : H(n) && (i.list = n), z(r) ? i.plural = r : W(r) ? i.default = r : q(r) && B(i, r), [a, i];
	}
	function Sa(e, t, n, r, i, a) {
		return {
			locale: t,
			key: n,
			warnHtmlMessage: i,
			onError: (t) => {
				if (a && a(t), false);
				throw t;
			},
			onCacheKey: (e) => cn(t, n, e)
		};
	}
	function wa(e, t, n, r) {
		let { modifiers: i, pluralRules: a, messageResolver: o, fallbackLocale: s, fallbackWarn: c, missingWarn: l, fallbackContext: u } = e, d = {
			locale: t,
			modifiers: i,
			pluralRules: a,
			messages: (r, i) => {
				let a = o(n, r);
				if (a == null && (u || i)) {
					let [n, , i] = va(u || e, r, t, s, c, l);
					a = n ?? o(i, r);
				}
				if (W(a) || Cr(a)) {
					let n = !1, i = ya(e, r, t, a, r, () => {
						n = !0;
					});
					return n ? ma : i;
				} else if (ha(a)) return a;
				else return ma;
			}
		};
		return e.processor && (d.processor = e.processor), r.list && (d.list = r.list), r.named && (d.named = r.named), z(r.plural) && (d.pluralIndex = r.plural), d;
	}
	Sr();
	var Ia = "11.4.6";
	function La() {
		typeof __INTLIFY_DROP_MESSAGE_COMPILER__ != "boolean" && (hn().__INTLIFY_DROP_MESSAGE_COMPILER__ = !1);
	}
	var Q = {
		UNEXPECTED_RETURN_TYPE: 24,
		INVALID_ARGUMENT: 25,
		MUST_BE_CALL_SETUP_TOP: 26,
		NOT_INSTALLED: 27,
		REQUIRED_VALUE: 28,
		INVALID_VALUE: 29,
		CANNOT_SETUP_VUE_DEVTOOLS_PLUGIN: 30,
		NOT_INSTALLED_WITH_PROVIDE: 31,
		UNEXPECTED_ERROR: 32,
		NOT_COMPATIBLE_LEGACY_VUE_I18N: 33,
		NOT_AVAILABLE_COMPOSITION_IN_LEGACY: 34
	};
	function $(e, ...t) {
		return zn(e, null, void 0);
	}
	Q.UNEXPECTED_RETURN_TYPE, Q.INVALID_ARGUMENT, Q.MUST_BE_CALL_SETUP_TOP, Q.NOT_INSTALLED, Q.UNEXPECTED_ERROR, Q.REQUIRED_VALUE, Q.INVALID_VALUE, Q.CANNOT_SETUP_VUE_DEVTOOLS_PLUGIN, Q.NOT_INSTALLED_WITH_PROVIDE, Q.NOT_COMPATIBLE_LEGACY_VUE_I18N, Q.NOT_AVAILABLE_COMPOSITION_IN_LEGACY;
	var za = /* #__PURE__*/ sn("__translateVNode");
	var Ba = /* #__PURE__*/ sn("__datetimeParts");
	var Va = /* #__PURE__*/ sn("__numberParts");
	var Wa = sn("__setPluralRules");
	sn("__intlifyMeta");
	var Ga = /* #__PURE__*/ sn("__injectWithOption");
	var Ka = /* #__PURE__*/ sn("__dispose");
	var qa = {
		FALLBACK_TO_ROOT: 10,
		NOT_FOUND_PARENT_SCOPE: 11,
		IGNORE_OBJ_FLATTEN: 12,
		DEPRECATE_LEGACY_MODE: 13,
		DEPRECATE_TRANSLATE_CUSTOME_DIRECTIVE: 14,
		DUPLICATE_USE_I18N_CALLING: 15
	};
	qa.FALLBACK_TO_ROOT, qa.NOT_FOUND_PARENT_SCOPE, qa.IGNORE_OBJ_FLATTEN, qa.DEPRECATE_LEGACY_MODE, qa.DEPRECATE_TRANSLATE_CUSTOME_DIRECTIVE, qa.DUPLICATE_USE_I18N_CALLING;
	function Xa(e) {
		if (!K(e) || Cr(e)) return e;
		for (let t in e) if (Tn(e, t)) if (!t.includes(".")) K(e[t]) && Xa(e[t]);
		else {
			let n = t.split("."), r = n.length - 1, i = e, a = !1;
			for (let e = 0; e < r; e++) {
				if (n[e] === "__proto__") throw Error(`unsafe key: ${n[e]}`);
				if (n[e] in i || (i[n[e]] = V()), !K(i[n[e]])) {
					a = !0;
					break;
				}
				i = i[n[e]];
			}
			if (a || (Cr(i) ? Vr.includes(n[r]) || delete e[t] : (i[n[r]] = e[t], delete e[t])), !Cr(i)) {
				let e = i[n[r]];
				K(e) && Xa(e);
			}
		}
		return e;
	}
	function Za(e, t) {
		let { messages: n, __i18n: r, messageResolver: i, flatJson: a } = t, o = q(n) ? n : H(r) ? V() : { [e]: V() };
		if (H(r) && r.forEach((e) => {
			if ("locale" in e && "resource" in e) {
				let { locale: t, resource: n } = e;
				t ? (o[t] = o[t] || V(), Fn(n, o[t])) : Fn(n, o);
			} else W(e) && Fn(JSON.parse(e), o);
		}), i == null && a) for (let e in o) Tn(o, e) && Xa(o[e]);
		return o;
	}
	function Qa(e) {
		return e.type;
	}
	function $a(e, t, n) {
		let r = K(t.messages) ? t.messages : V();
		"__i18nGlobal" in n && (r = Za(e.locale.value, {
			messages: r,
			__i18n: n.__i18nGlobal
		}));
		let i = Object.keys(r);
		if (i.length && i.forEach((t) => {
			e.mergeLocaleMessage(t, r[t]);
		}), K(t.datetimeFormats)) {
			let n = Object.keys(t.datetimeFormats);
			n.length && n.forEach((n) => {
				e.mergeDateTimeFormat(n, t.datetimeFormats[n]);
			});
		}
		if (K(t.numberFormats)) {
			let n = Object.keys(t.numberFormats);
			n.length && n.forEach((n) => {
				e.mergeNumberFormat(n, t.numberFormats[n]);
			});
		}
	}
	function eo(e) {
		return (0, vue.createVNode)(vue.Text, null, e, 0);
	}
	function to() {
		let t = "currentInstance";
		return t in vue ? vue[t] : vue.getCurrentInstance();
	}
	var no = () => [];
	var ro = () => !1;
	var io = 0;
	function ao(e) {
		return ((t, n, r, i) => e(n, r, to() || void 0, i));
	}
	function oo(e = {}) {
		let { __root: t, __injectWithOption: n } = e, r = t === void 0, a = e.flatJson, o = nn ? vue.ref : vue.shallowRef, s = !G(e.inheritLocale) || e.inheritLocale, c = o(t && s ? t.locale.value : W(e.locale) ? e.locale : Di), l = o(t && s ? t.fallbackLocale.value : W(e.fallbackLocale) || H(e.fallbackLocale) || q(e.fallbackLocale) || e.fallbackLocale === !1 ? e.fallbackLocale : c.value), u = o(Za(c.value, e)), d = o(q(e.datetimeFormats) ? e.datetimeFormats : { [c.value]: {} }), f = o(q(e.numberFormats) ? e.numberFormats : { [c.value]: {} }), p = t ? t.missingWarn : G(e.missingWarn) || dn(e.missingWarn) ? e.missingWarn : !0, m = t ? t.fallbackWarn : G(e.fallbackWarn) || dn(e.fallbackWarn) ? e.fallbackWarn : !0, h = t ? t.fallbackRoot : !G(e.fallbackRoot) || e.fallbackRoot, g = !!e.fallbackFormat, _ = U(e.missing) ? e.missing : null, v = U(e.missing) ? ao(e.missing) : null, y = U(e.postTranslation) ? e.postTranslation : null, b = t ? t.warnHtmlMessage : !G(e.warnHtmlMessage) || e.warnHtmlMessage, x = !!e.escapeParameter, S = t ? t.modifiers : q(e.modifiers) ? e.modifiers : {}, C = e.pluralRules || t && t.pluralRules, w;
		w = (() => {
			r && zi(null);
			let t = {
				version: Ia,
				locale: c.value,
				fallbackLocale: l.value,
				messages: u.value,
				modifiers: S,
				pluralRules: C,
				missing: v === null ? void 0 : v,
				missingWarn: p,
				fallbackWarn: m,
				fallbackFormat: g,
				unresolving: !0,
				postTranslation: y === null ? void 0 : y,
				warnHtmlMessage: b,
				escapeParameter: x,
				messageResolver: e.messageResolver,
				messageCompiler: e.messageCompiler,
				__meta: { framework: "vue" }
			};
			t.datetimeFormats = d.value, t.numberFormats = f.value, t.__datetimeFormatters = q(w) ? w.__datetimeFormatters : void 0, t.__numberFormatters = q(w) ? w.__numberFormatters : void 0;
			let n = Hi(t);
			return r && zi(n), n;
		})(), qi(w, c.value, l.value);
		function T() {
			return [
				c.value,
				l.value,
				u.value,
				d.value,
				f.value
			];
		}
		let te = (0, vue.computed)({
			get: () => c.value,
			set: (e) => {
				w.locale = e, c.value = e;
			}
		}), E = (0, vue.computed)({
			get: () => l.value,
			set: (e) => {
				w.fallbackLocale = e, l.value = e, qi(w, c.value, e);
			}
		}), re = (0, vue.computed)(() => u.value), D = /* #__PURE__*/ (0, vue.computed)(() => d.value), O = /* #__PURE__*/ (0, vue.computed)(() => f.value);
		function ie() {
			return U(y) ? y : null;
		}
		function ae(e) {
			y = e, w.postTranslation = e;
		}
		function k() {
			return _;
		}
		function se(e) {
			e !== null && (v = ao(e)), _ = e, w.missing = v;
		}
		let le = (e, n, i, a, o, s) => {
			T();
			let c;
			try {
				r || (w.fallbackContext = t ? Bi() : void 0), c = e(w);
			} finally {
				r || (w.fallbackContext = void 0);
			}
			if (i !== "translate exists" && z(c) && c === -1 || i === "translate exists" && !c) {
				let [e, r] = n();
				return t && h ? a(t) : o(e);
			} else if (s(c)) return c;
			else
 /* istanbul ignore next */
			throw $(Q.UNEXPECTED_RETURN_TYPE);
		};
		function ue(...e) {
			return le((t) => Reflect.apply(ga, null, [t, ...e]), () => xa(...e), "translate", (t) => Reflect.apply(t.t, t, [...e]), (e) => e, (e) => W(e));
		}
		function A(...e) {
			let [t, n, r] = e;
			if (r && !K(r)) throw $(Q.INVALID_ARGUMENT);
			return ue(t, n, B({ resolvedMessage: !0 }, r || {}));
		}
		function j(...e) {
			return le((t) => Reflect.apply(Qi, null, [t, ...e]), () => ea(...e), "datetime format", (t) => Reflect.apply(t.d, t, [...e]), () => "", (e) => W(e) || H(e));
		}
		function de(...e) {
			return le((t) => Reflect.apply(na, null, [t, ...e]), () => ia(...e), "number format", (t) => Reflect.apply(t.n, t, [...e]), () => "", (e) => W(e) || H(e));
		}
		function fe(e) {
			return e.map((e) => W(e) || z(e) || G(e) ? eo(String(e)) : e);
		}
		let M = {
			normalize: fe,
			interpolate: (e) => e,
			type: "vnode"
		};
		function pe(...e) {
			return le((t) => {
				let n, r = t;
				try {
					r.processor = M, n = Reflect.apply(ga, null, [r, ...e]);
				} finally {
					r.processor = null;
				}
				return n;
			}, () => xa(...e), "translate", (t) => t[za](...e), (e) => [eo(e)], (e) => H(e));
		}
		function me(...e) {
			return le((t) => Reflect.apply(na, null, [t, ...e]), () => ia(...e), "number format", (t) => t[Va](...e), no, (e) => W(e) || H(e));
		}
		function he(...e) {
			return le((t) => Reflect.apply(Qi, null, [t, ...e]), () => ea(...e), "datetime format", (t) => t[Ba](...e), no, (e) => W(e) || H(e));
		}
		function ge(e) {
			C = e, w.pluralRules = C;
		}
		function _e(e, t) {
			return le(() => {
				if (!e) return !1;
				let n = W(t) ? t : c.value, r = W(t) ? [n] : ui(w, l.value, n);
				for (let t = 0; t < r.length; t++) {
					let n = be(r[t]), i = w.messageResolver(n, e);
					if (i === null && (i = n[e]), Cr(i) || ha(i) || W(i)) return !0;
				}
				return !1;
			}, () => [e], "translate exists", (n) => Reflect.apply(n.te, n, [e, t]), ro, (e) => G(e));
		}
		function ve(e) {
			let t = null, n = ui(w, l.value, c.value);
			for (let r = 0; r < n.length; r++) {
				let i = u.value[n[r]] || {}, a = w.messageResolver(i, e);
				if (a != null) {
					t = a;
					break;
				}
			}
			return t;
		}
		function ye(e) {
			return ve(e) ?? (t && t.tm(e) || {});
		}
		function be(e) {
			return u.value[e] || {};
		}
		function xe(e, t) {
			if (a) {
				let n = { [e]: t };
				for (let e in n) Tn(n, e) && Xa(n[e]);
				t = n[e];
			}
			u.value[e] = t, w.messages = u.value;
		}
		function Se(e, t) {
			u.value[e] = u.value[e] || {};
			let n = { [e]: t };
			if (a) for (let e in n) Tn(n, e) && Xa(n[e]);
			t = n[e], Fn(t, u.value[e]), w.messages = u.value;
		}
		function Ce(e) {
			return d.value[e] || {};
		}
		function we(e, t) {
			d.value[e] = t, w.datetimeFormats = d.value, ta(w, e, t);
		}
		function Te(e, t) {
			d.value[e] = B(d.value[e] || {}, t), w.datetimeFormats = d.value, ta(w, e, t);
		}
		function Ee(e) {
			return f.value[e] || {};
		}
		function De(e, t) {
			f.value[e] = t, w.numberFormats = f.value, aa(w, e, t);
		}
		function Oe(e, t) {
			f.value[e] = B(f.value[e] || {}, t), w.numberFormats = f.value, aa(w, e, t);
		}
		io++, t && nn && ((0, vue.watch)(t.locale, (e) => {
			s && (c.value = e, w.locale = e, qi(w, c.value, l.value));
		}), (0, vue.watch)(t.fallbackLocale, (e) => {
			s && (l.value = e, w.fallbackLocale = e, qi(w, c.value, l.value));
		}));
		let N = {
			id: io,
			locale: te,
			fallbackLocale: E,
			get inheritLocale() {
				return s;
			},
			set inheritLocale(e) {
				s = e, e && t && (c.value = t.locale.value, l.value = t.fallbackLocale.value, qi(w, c.value, l.value));
			},
			get availableLocales() {
				return Object.keys(u.value).sort();
			},
			messages: re,
			get modifiers() {
				return S;
			},
			get pluralRules() {
				return C || {};
			},
			get isGlobal() {
				return r;
			},
			get missingWarn() {
				return p;
			},
			set missingWarn(e) {
				p = e, w.missingWarn = p;
			},
			get fallbackWarn() {
				return m;
			},
			set fallbackWarn(e) {
				m = e, w.fallbackWarn = m;
			},
			get fallbackRoot() {
				return h;
			},
			set fallbackRoot(e) {
				h = e;
			},
			get fallbackFormat() {
				return g;
			},
			set fallbackFormat(e) {
				g = e, w.fallbackFormat = g;
			},
			get warnHtmlMessage() {
				return b;
			},
			set warnHtmlMessage(e) {
				b = e, w.warnHtmlMessage = e;
			},
			get escapeParameter() {
				return x;
			},
			set escapeParameter(e) {
				x = e, w.escapeParameter = e;
			},
			t: ue,
			getLocaleMessage: be,
			setLocaleMessage: xe,
			mergeLocaleMessage: Se,
			getPostTranslationHandler: ie,
			setPostTranslationHandler: ae,
			getMissingHandler: k,
			setMissingHandler: se,
			[Wa]: ge
		};
		return N.datetimeFormats = D, N.numberFormats = O, N.rt = A, N.te = _e, N.tm = ye, N.d = j, N.n = de, N.getDateTimeFormat = Ce, N.setDateTimeFormat = we, N.mergeDateTimeFormat = Te, N.getNumberFormat = Ee, N.setNumberFormat = De, N.mergeNumberFormat = Oe, N[Ga] = n, N[za] = pe, N[Ba] = he, N[Va] = me, N;
	}
	var No = {
		tag: { type: [String, Object] },
		locale: { type: String },
		scope: {
			type: String,
			validator: (e) => e === "parent" || e === "global",
			default: "parent"
		},
		i18n: { type: Object }
	};
	function Po({ slots: e }, n) {
		return n.length === 1 && n[0] === "default" ? (e.default ? e.default() : []).reduce((e, n) => [...e, ...n.type === vue.Fragment ? n.children : [n]], []) : n.reduce((t, n) => {
			let r = e[n];
			return r && (t[n] = r()), t;
		}, V());
	}
	function Fo() {
		return vue.Fragment;
	}
	var Io = /* @__PURE__ */ (0, vue.defineComponent)({
		name: "i18n-t",
		props: B({
			keypath: {
				type: String,
				required: !0
			},
			plural: {
				type: [Number, String],
				validator: (e) => z(e) || !isNaN(e)
			}
		}, No),
		setup(e, t) {
			let { slots: n, attrs: r } = t, i = e.i18n || qo({
				useScope: e.scope,
				__useComponent: !0
			});
			return () => {
				let a = () => {
					let r = Object.keys(n).filter((e) => e[0] !== "_"), a = V();
					e.locale && (a.locale = e.locale), e.plural !== void 0 && (a.plural = W(e.plural) ? +e.plural : e.plural);
					let o = Po(t, r);
					return i[za](e.keypath, o, a);
				}, o = B(V(), r), s = W(e.tag) || K(e.tag) ? e.tag : Fo();
				return K(s) ? (0, vue.h)(s, o, { default: a }) : (0, vue.h)(s, o, a());
			};
		}
	});
	function Lo(e) {
		return H(e) && !W(e[0]);
	}
	function Ro(e, t, n, r) {
		let { slots: i, attrs: a } = t;
		return () => {
			let t = () => {
				let t = { part: !0 }, a = V();
				e.locale && (t.locale = e.locale), W(e.format) ? t.key = e.format : K(e.format) && (W(e.format.key) && (t.key = e.format.key), a = Object.keys(e.format).reduce((t, r) => n.includes(r) ? B(V(), t, { [r]: e.format[r] }) : t, V()));
				let o = r(e.value, t, a), s = [t.key];
				return H(o) ? s = o.map((e, t) => {
					let n = i[e.type], r = n ? n({
						[e.type]: e.value,
						index: t,
						parts: o
					}) : [e.value];
					return Lo(r) && (r[0].key = `${e.type}-${t}`), r;
				}) : W(o) && (s = [o]), s;
			}, o = B(V(), a), s = W(e.tag) || K(e.tag) ? e.tag : Fo();
			return K(s) ? (0, vue.h)(s, o, { default: t }) : (0, vue.h)(s, o, t());
		};
	}
	var zo = /* @__PURE__ */ (0, vue.defineComponent)({
		name: "i18n-n",
		props: B({
			value: {
				type: Number,
				required: !0
			},
			format: { type: [String, Object] }
		}, No),
		setup(e, t) {
			let n = e.i18n || qo({
				useScope: e.scope,
				__useComponent: !0
			});
			return Ro(e, t, ra, (...e) => n[Va](...e));
		}
	});
	function Bo(e, t) {
		let n = e;
		if (e.mode === "composition") return n.__getInstance(t) || e.global;
		{
			let r = n.__getInstance(t);
			return r == null ? e.global.__composer : r.__composer;
		}
	}
	function Vo(e) {
		let t = (t) => {
			let { instance: n, value: r } = t;
			/* istanbul ignore if */
			if (!n || !n.$) throw $(Q.UNEXPECTED_ERROR);
			let i = Bo(e, n.$), a = Ho(r);
			return [Reflect.apply(i.t, i, [...Uo(a)]), i];
		};
		return {
			created: (e, n) => {
				let [r, i] = t(n);
				nn && (e.__i18nWatcher = (0, vue.watch)(i.locale, () => {
					n.instance && n.instance.$forceUpdate();
				})), e.__composer = i, e.textContent = r;
			},
			unmounted: (e) => {
				nn && e.__i18nWatcher && (e.__i18nWatcher(), e.__i18nWatcher = void 0, delete e.__i18nWatcher), e.__composer && (e.__composer = void 0, delete e.__composer);
			},
			beforeUpdate: (e, { value: t }) => {
				if (e.__composer) {
					let n = e.__composer, r = Ho(t);
					e.textContent = Reflect.apply(n.t, n, [...Uo(r)]);
				}
			},
			getSSRProps: (e) => {
				let [n] = t(e);
				return { textContent: n };
			}
		};
	}
	function Ho(e) {
		if (W(e)) return { path: e };
		if (q(e)) {
			if (!("path" in e)) throw $(Q.REQUIRED_VALUE, "path");
			return e;
		} else throw $(Q.INVALID_VALUE);
	}
	function Uo(e) {
		let { path: t, locale: n, args: r, choice: i, plural: a } = e, o = {}, s = r || {};
		return W(n) && (o.locale = n), z(i) && (o.plural = i), z(a) && (o.plural = a), [
			t,
			s,
			o
		];
	}
	function Wo(e, t, ...n) {
		let r = q(n[0]) ? n[0] : {};
		(!G(r.globalInstall) || r.globalInstall) && ([Io.name, "I18nT"].forEach((t) => e.component(t, Io)), [zo.name, "I18nN"].forEach((t) => e.component(t, zo)), [is.name, "I18nD"].forEach((t) => e.component(t, is))), e.directive("t", Vo(t));
	}
	var Go = /* #__PURE__*/ sn("global-vue-i18n");
	function Ko(e = {}) {
		let t = false;
		let n = !G(e.globalInjection) || e.globalInjection, r = /* @__PURE__ */ new Map(), [i, a] = Jo(e, t), o = /* #__PURE__*/ sn("");
		function s(e) {
			return r.get(e) || null;
		}
		function c(e, t) {
			r.set(e, t);
		}
		function l(e) {
			r.delete(e);
		}
		let u = {
			get mode() {
				return "composition";
			},
			async install(e, ...r) {
				if (e.__VUE_I18N_SYMBOL__ = o, e.provide(e.__VUE_I18N_SYMBOL__, u), q(r[0])) {
					let e = r[0];
					u.__composerExtend = e.__composerExtend, u.__vueI18nExtend = e.__vueI18nExtend;
				}
				let i = null;
				n && (i = rs(e, u.global)), Wo(e, u, ...r);
				let s = e.unmount;
				if (e.unmount = () => {
					i && i(), u.dispose(), s();
				}, false);
			},
			get global() {
				return a;
			},
			dispose() {
				i.stop();
			},
			__instances: r,
			__getInstance: s,
			__setInstance: c,
			__deleteInstance: l
		};
		return u;
	}
	function qo(e = {}) {
		let t = to();
		if (t == null) throw $(Q.MUST_BE_CALL_SETUP_TOP);
		if (!t.isCE && t.appContext.app != null && !t.appContext.app.__VUE_I18N_SYMBOL__) throw $(Q.NOT_INSTALLED);
		let n = Yo(t), r = Zo(n), i = Qa(t), a = Xo(e, i);
		if (a === "global") return $a(r, e, i), r;
		if (a === "parent") {
			let i = Qo(n, t, e.__useComponent);
			return i ??= r, i;
		}
		if (a === "isolated") {
			if (n.mode !== "composition") throw $(Q.NOT_AVAILABLE_COMPOSITION_IN_LEGACY);
			let i = n, a = B({}, e);
			a.__root = Qo(n, t) || r;
			let o = oo(a);
			i.__composerExtend && (o[Ka] = i.__composerExtend(o));
			return (0, vue.getCurrentScope)() && (0, vue.onScopeDispose)(() => {
				let e = o[Ka];
				e && (e(), delete o[Ka]);
			}), o;
		}
		let o = n, s = o.__getInstance(t);
		if (s == null) {
			let n = B({}, e);
			"__i18n" in i && (n.__i18n = i.__i18n), r && (n.__root = r), s = oo(n), o.__composerExtend && (s[Ka] = o.__composerExtend(s)), es(o, t, s), o.__setInstance(t, s);
		}
		return s;
	}
	function Jo(e, t) {
		let n = (0, vue.effectScope)(), r = n.run(() => oo(e));
		if (r == null) throw $(Q.UNEXPECTED_ERROR);
		return [n, r];
	}
	function Yo(e) {
		let t = (0, vue.inject)(e.isCE ? Go : e.appContext.app.__VUE_I18N_SYMBOL__);
		/* istanbul ignore if */
		if (!t) throw $(e.isCE ? Q.NOT_INSTALLED_WITH_PROVIDE : Q.UNEXPECTED_ERROR);
		return t;
	}
	function Xo(e, t) {
		return fn(e) ? "__i18n" in t ? "local" : "global" : e.useScope ? e.useScope : "local";
	}
	function Zo(e) {
		return e.mode === "composition" ? e.global : e.global.__composer;
	}
	function Qo(e, t, n = !1) {
		let r = null, i = t.root, a = $o(t, n);
		for (; a != null;) {
			let t = e;
			if (e.mode === "composition") r = t.__getInstance(a);
			if (r != null || i === a) break;
			a = a.parent;
		}
		return r;
	}
	function $o(e, t = !1) {
		return e == null ? null : t && e.vnode.ctx || e.parent;
	}
	function es(e, t, n) {
		(0, vue.onMounted)(() => {}, t), (0, vue.onUnmounted)(() => {
			let i = n;
			e.__deleteInstance(t);
			let a = i[Ka];
			a && (a(), delete i[Ka]);
		}, t);
	}
	var ts = [
		"locale",
		"fallbackLocale",
		"availableLocales"
	];
	var ns = [
		"t",
		"rt",
		"d",
		"n",
		"tm",
		"te"
	];
	function rs(e, t) {
		let n = Object.create(null);
		return ts.forEach((e) => {
			let r = Object.getOwnPropertyDescriptor(t, e);
			if (!r) throw $(Q.UNEXPECTED_ERROR);
			let i = (0, vue.isRef)(r.value) ? {
				get() {
					return r.value.value;
				},
				set(e) {
					r.value.value = e;
				}
			} : { get() {
				return r.get && r.get();
			} };
			Object.defineProperty(n, e, i);
		}), e.config.globalProperties.$i18n = n, ns.forEach((n) => {
			let r = Object.getOwnPropertyDescriptor(t, n);
			if (!r || !r.value) throw $(Q.UNEXPECTED_ERROR);
			Object.defineProperty(e.config.globalProperties, `$${n}`, r);
		}), () => {
			delete e.config.globalProperties.$i18n, ns.forEach((t) => {
				delete e.config.globalProperties[`$${t}`];
			});
		};
	}
	var is = /* @__PURE__ */ (0, vue.defineComponent)({
		name: "i18n-d",
		props: B({
			value: {
				type: [Number, Date],
				required: !0
			},
			format: { type: [String, Object] }
		}, No),
		setup(e, t) {
			let n = e.i18n || qo({
				useScope: e.scope,
				__useComponent: !0
			});
			return Ro(e, t, $i, (...e) => n[Ba](...e));
		}
	});
	if (La(), ji(Qr), Ni(Ci), Fi(ui), false);
	function as(e) {
		return e;
	}
	var os = as({
		locale: {
			cat: "Català",
			de: "Alemany",
			en: "Anglès",
			es: "Espanyol",
			fr: "Francès",
			it: "Italià",
			pt: "Portuguès",
			sv: "Suec"
		},
		close: "Tancar"
	});
	var ss = as({
		locale: {
			cat: "Katalanisch",
			de: "Deutsch",
			en: "Englisch",
			es: "Spanisch",
			fr: "Französisch",
			it: "Italienisch",
			pt: "Portugiesisch",
			sv: "Schwedisch"
		},
		close: "Schließen"
	});
	var cs = {
		locale: {
			cat: "Catalan",
			de: "German",
			en: "English",
			es: "Spanish",
			fr: "French",
			it: "Italian",
			pt: "Portuguese",
			sv: "Swedish"
		},
		close: "Close"
	};
	var ls = as({
		locale: {
			cat: "Catalán",
			de: "Alemán",
			en: "Inglés",
			es: "Español",
			fr: "Francés",
			it: "Italiano",
			pt: "Portugués",
			sv: "Sueco"
		},
		close: "Cerrar"
	});
	var us = as({
		locale: {
			cat: "Catalan",
			de: "Allemand",
			en: "Anglais",
			es: "Espagnol",
			fr: "Français",
			it: "Italien",
			pt: "Portugais",
			sv: "Suédois"
		},
		close: "Fermer"
	});
	var ds = as({
		locale: {
			cat: "Catalano",
			de: "Tedesco",
			en: "Inglese",
			es: "Spagnolo",
			fr: "Francese",
			it: "Italiano",
			pt: "Portoghese",
			sv: "Svedese"
		},
		close: "Chiudi"
	});
	var fs = [
		"fr",
		"en",
		"de",
		"pt",
		"es",
		"it",
		"cat",
		"sv"
	];
	var ps = as({
		locale: {
			cat: "Catalão",
			de: "Alemão",
			en: "Inglês",
			es: "Espanhol",
			fr: "Francês",
			it: "Italiano",
			pt: "Português",
			sv: "Sueco"
		},
		close: "Fechar"
	});
	var ms = as({
		locale: {
			cat: "Katalanska",
			de: "Tyska",
			en: "Engelska",
			es: "Spanska",
			fr: "Franska",
			it: "Italienska",
			pt: "Portugisiska",
			sv: "Svenska"
		},
		close: "Stäng"
	});
	var hs = {
		en: cs,
		fr: us,
		de: ss,
		pt: ps,
		es: ls,
		it: ds,
		cat: os,
		sv: ms
	};
	cs.locale.en, us.locale.fr, ss.locale.de, ps.locale.pt, ls.locale.es, ds.locale.it, os.locale.cat, ms.locale.sv;
	var gs = hs;
	var _s = "en";
	var vs = navigator.language.split("-")[0];
	fs.includes(vs) && (_s = vs);
	Ko({
		locale: _s,
		fallbackLocale: "en",
		messages: gs,
		globalInjection: !1,
		legacy: !1
	});
	var js = null;
	var Ms = () => {
		js &&= (js(), null);
	};
	document.addEventListener("keydown", (e) => {
		e.key === "Escape" && Ms();
	}), document.addEventListener("wheel", Ms);
	//#endregion
	//#region view/components/molecules/DocumentIndexingButton.vue
	var DocumentIndexingButton_default = /* @__PURE__ */ (0, vue.defineComponent)({
		__name: "DocumentIndexingButton",
		props: {
			indexed: {
				type: Boolean,
				required: true
			},
			disabled: {
				type: Boolean,
				default: false
			}
		},
		emits: ["toggle"],
		setup(__props) {
			const props = __props;
			const { t } = useI18n();
			const indexLabel = (0, vue.computed)(() => t(props.indexed ? "unindex" : "index"));
			return (_ctx, _cache) => {
				return (0, vue.openBlock)(), (0, vue.createBlock)(DocumentButton_default, {
					class: "border-neutral-200 bg-transparent text-primary-900 enabled:hover:bg-neutral-200",
					label: indexLabel.value,
					"aria-label": `${(0, vue.unref)(t)(props.indexed ? "indexed" : "notIndexed")} — ${indexLabel.value}`,
					"aria-pressed": props.indexed,
					disabled: props.disabled,
					onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("toggle"))
				}, {
					default: (0, vue.withCtx)(() => [(0, vue.createVNode)((0, vue.unref)(qt), {
						name: "books-solid",
						class: "size-5"
					}), (0, vue.createElementVNode)("span", {
						"aria-hidden": "true",
						class: (0, vue.normalizeClass)(["absolute end-0.5 bottom-0.5 inline-flex size-3.5 items-center justify-center rounded-full", props.indexed ? "bg-success-200 text-success-700" : "bg-danger-200 text-danger-700"])
					}, [(0, vue.createVNode)((0, vue.unref)(qt), {
						name: props.indexed ? "check" : "xmark",
						class: "size-3"
					}, null, 8, ["name"])], 2)]),
					_: 1
				}, 8, [
					"label",
					"aria-label",
					"aria-pressed",
					"disabled"
				]);
			};
		}
	});
	//#endregion
	//#region view/components/molecules/DocumentAnalysisButton.vue
	var DocumentAnalysisButton_default = /* @__PURE__ */ (0, vue.defineComponent)({
		__name: "DocumentAnalysisButton",
		props: {
			action: {
				type: Object,
				required: true
			},
			disabled: {
				type: Boolean,
				default: false
			}
		},
		emits: ["activate"],
		setup(__props) {
			const { t } = useI18n();
			return (_ctx, _cache) => {
				return (0, vue.openBlock)(), (0, vue.createBlock)(DocumentButton_default, {
					class: "border-transparent bg-primary-500 text-neutral-50 enabled:hover:bg-primary-700",
					label: (0, vue.unref)(t)(__props.action.label),
					disabled: __props.disabled || "loading" === __props.action.kind,
					onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("activate", __props.action.kind))
				}, {
					default: (0, vue.withCtx)(() => [(0, vue.createVNode)((0, vue.unref)(qt), {
						name: __props.action.icon,
						class: (0, vue.normalizeClass)("loading" === __props.action.kind ? "size-5 animate-spin motion-reduce:animate-none" : "size-5")
					}, null, 8, ["name", "class"])]),
					_: 1
				}, 8, ["label", "disabled"]);
			};
		}
	});
	//#endregion
	//#region view/components/molecules/DocumentErrorTooltip.vue?vue&type=script&setup=true&lang.ts
	var _hoisted_1$12 = ["aria-describedby"];
	var _hoisted_2$9 = ["id"];
	//#endregion
	//#region view/components/molecules/DocumentErrorTooltip.vue
	var DocumentErrorTooltip_default = /* @__PURE__ */ (0, vue.defineComponent)({
		__name: "DocumentErrorTooltip",
		props: {
			documentId: {
				type: Number,
				required: true
			},
			message: {
				type: String,
				required: true
			}
		},
		setup(__props) {
			const props = __props;
			const { t } = useI18n();
			const tooltipOpen = (0, vue.ref)(false);
			const tooltipDismissed = (0, vue.ref)(false);
			const tooltipId = (0, vue.computed)(() => `compilatio-error-${props.documentId}`);
			function showTooltip() {
				tooltipDismissed.value = false;
				tooltipOpen.value = true;
			}
			function hideTooltip() {
				tooltipOpen.value = false;
			}
			function dismissTooltip() {
				tooltipDismissed.value = true;
			}
			return (_ctx, _cache) => {
				return (0, vue.openBlock)(), (0, vue.createElementBlock)("span", {
					class: "relative w-full text-center",
					"aria-live": "polite",
					onMouseenter: showTooltip,
					onMouseleave: hideTooltip
				}, [(0, vue.createElementVNode)("button", {
					type: "button",
					class: "cursor-help border-0 bg-transparent p-0.5 font-sans text-xs text-danger-700 underline decoration-dotted compilatio-focus",
					"aria-describedby": tooltipId.value,
					onFocus: showTooltip,
					onBlur: hideTooltip,
					onClick: showTooltip,
					onKeydown: (0, vue.withKeys)(dismissTooltip, ["esc"])
				}, (0, vue.toDisplayString)((0, vue.unref)(t)("apiError")), 41, _hoisted_1$12), (0, vue.createElementVNode)("span", {
					id: tooltipId.value,
					role: "tooltip",
					class: (0, vue.normalizeClass)([tooltipOpen.value && !tooltipDismissed.value ? "block" : "hidden", "compilatio-tooltip"])
				}, (0, vue.toDisplayString)(__props.message), 11, _hoisted_2$9)], 32);
			};
		}
	});
	//#endregion
	//#region view/composables/useDocumentActions.ts
	function useDocumentActions(initialDocument, api, t, onUpdated) {
		const data = (0, vue.ref)({ ...initialDocument });
		const pending = (0, vue.ref)("");
		const error = (0, vue.ref)(data.value.status.startsWith("error_") ? data.value.statusLabel : "");
		let mounted = true;
		(0, vue.onBeforeUnmount)(() => {
			mounted = false;
		});
		const action = (0, vue.computed)(() => {
			return {
				sent: {
					kind: "play",
					icon: "play-solid",
					label: "launch",
					url: data.value.analyseUrl ?? ""
				},
				scored: {
					kind: "report",
					icon: "magnifying-glass-chart-regular",
					label: "report",
					url: data.value.reportUrl ?? ""
				},
				error_sending_failed: {
					kind: "retry",
					icon: "arrow-rotate-left",
					label: "retry",
					url: data.value.retryUrl ?? ""
				},
				queue: {
					kind: "loading",
					icon: "spinner",
					label: "queue"
				},
				analysing: {
					kind: "loading",
					icon: "spinner",
					label: "analysing"
				}
			}[data.value.status];
		});
		function updateDocument(result, retry = false) {
			data.value = {
				...data.value,
				...result
			};
			if (retry) api.addActionUrls(data.value);
			if (mounted) onUpdated({ ...data.value });
		}
		async function perform(kind) {
			if (pending.value || "loading" === kind) return;
			const currentAction = action.value;
			if ("index" !== kind && (!currentAction || currentAction.kind !== kind)) return;
			const reportWindow = "report" === kind ? window.open("", "_blank") : null;
			pending.value = kind;
			error.value = "";
			try {
				if ("index" === kind) {
					if (!data.value.indexingUrl) throw new Error(t("apiError"));
					updateDocument(await api.patch(data.value.indexingUrl, { indexed: !data.value.indexed }));
					return;
				}
				if ("report" === kind && !reportWindow) throw new Error(t("reportBlocked"));
				if (!currentAction || !("url" in currentAction) || !currentAction.url) throw new Error(t("apiError"));
				const result = await api.post(currentAction.url);
				if ("report" === kind) {
					if (!result.url || !reportWindow) throw new Error(t("reportMissing"));
					reportWindow.location.href = result.url;
				} else updateDocument(result, "retry" === kind);
			} catch (exception) {
				reportWindow?.close();
				if (mounted) error.value = exception instanceof Error && exception.message ? exception.message : t("apiError");
			} finally {
				if (mounted) pending.value = "";
			}
		}
		return {
			data,
			pending,
			error,
			action,
			perform
		};
	}
	//#endregion
	//#region view/img/compilatio_magister_logo_short.svg
	var compilatio_magister_logo_short_default = "data:image/svg+xml,%3csvg%20width='19'%20height='19'%20viewBox='0%200%2019%2019'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M7.45149%203.14356C8.36356%203.11105%209.44921%203.34927%2010.2731%203.73604C10.6317%203.90435%2010.9087%204.08923%2011.2497%204.26261C11.1493%204.51922%2010.9627%204.89714%2010.8423%205.15232L10.2033%206.50528C10.0572%206.8113%209.89082%207.13862%209.77646%207.45583C9.27192%206.924%208.52289%206.65299%207.8044%206.61792C6.01678%206.5307%204.71395%207.68842%204.61479%209.47844C4.45735%2012.3199%207.75873%2013.6708%209.76158%2011.7785C10.5163%2012.5475%2011.3316%2013.3681%2012.1118%2014.1074C12.1468%2014.1468%2012.1366%2014.1277%2012.1474%2014.1832C12.1106%2014.2797%2011.7255%2014.5804%2011.6207%2014.6657C10.6666%2015.4428%209.40739%2015.975%208.1767%2016.0701C6.47226%2016.2155%204.77976%2015.6787%203.47071%2014.5775C2.14921%2013.4587%201.33063%2011.8573%201.1977%2010.1309C0.959841%206.94953%203.02966%204.03502%206.17444%203.31571C6.61909%203.21401%206.99792%203.1771%207.45149%203.14356Z'%20fill='%2364358C'/%3e%3cpath%20d='M13.4299%203.44818C14.0891%203.47935%2014.8002%203.46642%2015.4656%203.46662C16.2751%203.47351%2017.0848%203.46807%2017.8942%203.45031L17.8923%206.9357C17.8925%207.26158%2017.8975%207.58868%2017.8902%207.91416C17.8787%207.92643%2017.8673%207.93868%2017.8558%207.95092C17.7315%208.11741%2017.1791%208.65233%2017.0121%208.81924L15.2886%2010.5374C15.2792%209.68029%2015.2846%208.80459%2015.2888%207.94693C14.6808%207.95723%2014.0285%207.94317%2013.4276%207.96395L13.4275%205.01227C13.4272%204.50123%2013.417%203.9556%2013.4299%203.44818Z'%20fill='%2364358C'/%3e%3cpath%20d='M15.2888%207.94694C15.732%207.9228%2016.2901%207.9487%2016.7442%207.94098C16.9913%207.93677%2017.6252%207.92733%2017.8558%207.95093C17.7316%208.11742%2017.1791%208.65233%2017.0121%208.81925L15.2886%2010.5374C15.2792%209.6803%2015.2846%208.80459%2015.2888%207.94694Z'%20fill='%23A7358C'/%3e%3c/svg%3e";
	//#endregion
	//#region view/components/DocumentFrame.vue?vue&type=script&setup=true&lang.ts
	var _hoisted_1$11 = ["data-status"];
	var _hoisted_2$8 = { class: "flex items-center gap-1" };
	var _hoisted_3$8 = {
		class: "flex size-8 items-center justify-center",
		role: "img",
		"aria-label": "Compilatio Magister"
	};
	var _hoisted_4$7 = ["src"];
	var _hoisted_5$4 = {
		key: 2,
		class: "size-9"
	};
	var _hoisted_6$4 = { class: "size-9" };
	//#endregion
	//#region view/components/DocumentFrame.vue
	var DocumentFrame_default = /* @__PURE__ */ (0, vue.defineComponent)({
		__name: "DocumentFrame",
		props: {
			document: {
				type: Object,
				required: true
			},
			api: {
				type: Object,
				required: true
			},
			thresholds: {
				type: Object,
				required: true
			}
		},
		emits: ["updated"],
		setup(__props, { emit: __emit }) {
			const emit = __emit;
			const { t } = useI18n();
			const props = __props;
			const { data, pending, error, action, perform } = useDocumentActions(props.document, props.api, t, (updated) => emit("updated", updated));
			return (_ctx, _cache) => {
				return (0, vue.openBlock)(), (0, vue.createElementBlock)("span", {
					class: "service-magister compilatio-document-status inline-block box-border w-49 rounded-l bg-neutral-100 p-1 align-middle",
					"data-status": (0, vue.unref)(data).status
				}, [(0, vue.createElementVNode)("span", _hoisted_2$8, [
					(0, vue.createElementVNode)("span", _hoisted_3$8, [(0, vue.createElementVNode)("img", {
						src: (0, vue.unref)(compilatio_magister_logo_short_default),
						alt: "Compilatio Magister logo",
						class: "h-auto w-7"
					}, null, 8, _hoisted_4$7)]),
					!(0, vue.unref)(error) ? ((0, vue.openBlock)(), (0, vue.createBlock)(DocumentScore_default, {
						key: 0,
						class: "min-w-10 flex-1",
						score: (0, vue.unref)(data).score ?? null,
						thresholds: props.thresholds
					}, null, 8, ["score", "thresholds"])) : ((0, vue.openBlock)(), (0, vue.createBlock)(DocumentErrorTooltip_default, {
						key: 1,
						"document-id": (0, vue.unref)(data).submissionFileId,
						message: (0, vue.unref)(error)
					}, null, 8, ["document-id", "message"])),
					!(0, vue.unref)(error) ? ((0, vue.openBlock)(), (0, vue.createElementBlock)("span", _hoisted_5$4, [(0, vue.unref)(data).canIndex ? ((0, vue.openBlock)(), (0, vue.createBlock)(DocumentIndexingButton_default, {
						key: 0,
						indexed: (0, vue.unref)(data).indexed,
						disabled: Boolean((0, vue.unref)(pending)),
						onToggle: _cache[0] || (_cache[0] = ($event) => (0, vue.unref)(perform)("index"))
					}, null, 8, ["indexed", "disabled"])) : (0, vue.createCommentVNode)("", true)])) : (0, vue.createCommentVNode)("", true),
					(0, vue.createElementVNode)("span", _hoisted_6$4, [(0, vue.unref)(action) ? ((0, vue.openBlock)(), (0, vue.createBlock)(DocumentAnalysisButton_default, {
						key: 0,
						action: (0, vue.unref)(action),
						disabled: Boolean((0, vue.unref)(pending)),
						onActivate: (0, vue.unref)(perform)
					}, null, 8, [
						"action",
						"disabled",
						"onActivate"
					])) : (0, vue.createCommentVNode)("", true)])
				])], 8, _hoisted_1$11);
			};
		}
	});
	//#endregion
	//#region view/img/compilatio_logo.svg
	var compilatio_logo_default = "data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='UTF-8'?%3e%3csvg%20id='Calque_1'%20data-name='Calque%201'%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%201509.47%20214'%3e%3cdefs%3e%3cstyle%3e%20.cls-1%20{%20fill:%20%23ef83b3;%20}%20.cls-2%20{%20fill:%20%23e62d38;%20}%20%3c/style%3e%3c/defs%3e%3cg%3e%3cpath%20class='cls-2'%20d='M98.65,114.47c-6.1-6.15-14.77-9.72-24.81-9.72-20.09,0-34.65,14.67-34.65,34.89s14.57,34.89,34.65,34.89c10.04,0,18.71-3.57,24.81-9.91l27.57,27.36c-13.39,13.48-31.9,22.01-52.38,22.01C33.08,214,0,180.69,0,139.65s33.08-74.35,73.84-74.35c20.28,0,38.59,8.13,51.98,21.61l-27.17,27.56Z'/%3e%3cpath%20class='cls-2'%20d='M221.98,65.31c40.76,0,73.84,33.51,73.84,74.55s-33.08,74.15-73.84,74.15-73.65-33.11-73.65-74.15,32.88-74.55,73.65-74.55ZM221.98,104.16c-19.3,0-35.05,15.86-35.05,35.49s15.75,35.49,35.05,35.49,35.25-16.06,35.25-35.49-15.75-35.49-35.25-35.49Z'/%3e%3cpath%20class='cls-2'%20d='M406.67,120.42l60.06-55.12h17.53v148.7h-38.99v-76.33l-38.59,35.49-38.79-35.29v76.13h-38.99V65.31h17.53l60.25,55.12Z'/%3e%3cpath%20class='cls-2'%20d='M530.28,65.31h62.22c29.93,0,54.35,24.58,54.35,54.72s-24.22,54.52-53.56,54.52h-24.22v39.45h-38.79V65.31ZM568.82,140.84h19.22c11.82,0,21.27-9.32,21.27-21.21s-9.45-21.41-21.27-21.41h-19.22v42.63Z'/%3e%3cpath%20class='cls-2'%20d='M680.42,65.31h38.79v148.7h-38.79V65.31Z'/%3e%3cpath%20class='cls-2'%20d='M873.77,214l68.92-148.7h17.53l69.51,148.7h-38.79l-9.06-19.43h-60.45l-8.86,19.43h-38.79ZM936.58,161.66h30.13l-14.96-32.71-15.16,32.71Z'/%3e%3cpath%20class='cls-2'%20d='M1036.24,65.31h116.37v38.66h-39.19v110.03h-38.79v-110.03h-38.4v-38.66Z'/%3e%3cpath%20class='cls-2'%20d='M1191.29,65.31h38.79v148.7h-38.79V65.31Z'/%3e%3cpath%20class='cls-2'%20d='M1346.39,65.31c40.76,0,73.84,33.51,73.84,74.55s-33.08,74.15-73.84,74.15-73.64-33.11-73.64-74.15,32.88-74.55,73.64-74.55ZM1346.39,104.16c-19.3,0-35.05,15.86-35.05,35.49s15.75,35.49,35.05,35.49,35.25-16.06,35.25-35.49-15.75-35.49-35.25-35.49Z'/%3e%3cpolygon%20class='cls-2'%20points='804.5%20174.75%20804.5%2065.31%20765.71%2065.31%20765.71%20214%20836.88%20214%20855.57%20174.75%20804.5%20174.75'/%3e%3c/g%3e%3cg%3e%3cpolygon%20class='cls-2'%20points='1509.47%2065.25%201509.46%2065.26%201509.47%2065.26%201509.47%2065.25'/%3e%3cpolygon%20class='cls-2'%20points='1444.21%200%201444.21%2065.26%201509.46%2065.26%201509.47%2065.25%201509.47%200%201444.21%200'/%3e%3c/g%3e%3cpolygon%20class='cls-1'%20points='1471.55%2065.26%201509.46%2065.26%201471.55%20103.16%201471.55%2065.26'/%3e%3c/svg%3e";
	//#endregion
	//#region view/components/atoms/AppSwitch.vue?vue&type=script&setup=true&lang.ts
	var _hoisted_1$10 = ["aria-checked", "disabled"];
	//#endregion
	//#region view/components/atoms/AppSwitch.vue
	var AppSwitch_default = /* @__PURE__ */ (0, vue.defineComponent)({
		__name: "AppSwitch",
		props: {
			modelValue: {
				type: Boolean,
				required: true
			},
			disabled: {
				type: Boolean,
				default: false
			}
		},
		emits: ["update:modelValue"],
		setup(__props) {
			return (_ctx, _cache) => {
				return (0, vue.openBlock)(), (0, vue.createElementBlock)("button", {
					type: "button",
					class: (0, vue.normalizeClass)(["group relative inline-flex h-5 w-10 items-center justify-center rounded-full bg-transparent focus:outline-none", __props.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"]),
					role: "switch",
					"aria-checked": __props.modelValue,
					disabled: __props.disabled,
					onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("update:modelValue", !__props.modelValue))
				}, [(0, vue.createElementVNode)("span", {
					"aria-hidden": "true",
					class: (0, vue.normalizeClass)(["pointer-events-none absolute mx-auto h-4 w-9 rounded-full transition-colors duration-200 ease-in-out", __props.modelValue ? "bg-primary-400" : "bg-neutral-200"])
				}, null, 2), (0, vue.createElementVNode)("span", {
					"aria-hidden": "true",
					class: (0, vue.normalizeClass)(["compilatio-switch-thumb", __props.modelValue ? "translate-x-5" : "translate-x-0"])
				}, null, 2)], 10, _hoisted_1$10);
			};
		}
	});
	//#endregion
	//#region view/components/atoms/AppTextInput.vue?vue&type=script&setup=true&lang.ts
	var _hoisted_1$9 = [
		"autocomplete",
		"disabled",
		"name",
		"placeholder",
		"required",
		"type",
		"value"
	];
	//#endregion
	//#region view/components/atoms/AppTextInput.vue
	var AppTextInput_default = /* @__PURE__ */ (0, vue.defineComponent)({
		__name: "AppTextInput",
		props: {
			autocomplete: {
				type: String,
				default: void 0
			},
			disabled: {
				type: Boolean,
				default: false
			},
			modelValue: {
				type: String,
				required: true
			},
			name: {
				type: String,
				default: void 0
			},
			placeholder: {
				type: String,
				default: void 0
			},
			required: {
				type: Boolean,
				default: false
			},
			type: {
				type: String,
				default: "text"
			}
		},
		emits: ["update:modelValue"],
		setup(__props, { emit: __emit }) {
			const emit = __emit;
			const handleInput = (event) => {
				emit("update:modelValue", event.target.value);
			};
			return (_ctx, _cache) => {
				return (0, vue.openBlock)(), (0, vue.createElementBlock)("input", {
					class: "compilatio-input",
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
	//#endregion
	//#region view/components/atoms/AppRadio.vue?vue&type=script&setup=true&lang.ts
	var _hoisted_1$8 = [
		"checked",
		"disabled",
		"name",
		"value"
	];
	//#endregion
	//#region view/components/atoms/AppRadio.vue
	var AppRadio_default = /* @__PURE__ */ (0, vue.defineComponent)({
		__name: "AppRadio",
		props: {
			checked: {
				type: Boolean,
				required: true
			},
			disabled: {
				type: Boolean,
				default: false
			},
			name: {
				type: String,
				required: true
			},
			value: {
				type: String,
				required: true
			}
		},
		emits: ["select"],
		setup(__props) {
			return (_ctx, _cache) => {
				return (0, vue.openBlock)(), (0, vue.createElementBlock)("input", {
					type: "radio",
					class: "mt-1 size-4 border-neutral-300 text-primary-600 focus:ring-primary-500",
					checked: __props.checked,
					disabled: __props.disabled,
					name: __props.name,
					value: __props.value,
					onChange: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("select", __props.value))
				}, null, 40, _hoisted_1$8);
			};
		}
	});
	//#endregion
	//#region view/components/molecules/LaunchModeOption.vue?vue&type=script&setup=true&lang.ts
	var _hoisted_1$7 = { class: "flex cursor-pointer items-start gap-3 border-t border-neutral-200 px-4 py-3 transition first:border-t-0 hover:bg-neutral-50" };
	var _hoisted_2$7 = { class: "text-sm" };
	var _hoisted_3$7 = { class: "block font-medium text-neutral-900" };
	var _hoisted_4$6 = { class: "mt-0.5 block text-neutral-500" };
	//#endregion
	//#region view/components/molecules/LaunchModeOption.vue
	var LaunchModeOption_default = /* @__PURE__ */ (0, vue.defineComponent)({
		__name: "LaunchModeOption",
		props: {
			description: {
				type: String,
				required: true
			},
			disabled: {
				type: Boolean,
				default: false
			},
			label: {
				type: String,
				required: true
			},
			modelValue: {
				type: String,
				required: true
			},
			value: {
				type: String,
				required: true
			}
		},
		emits: ["update:modelValue"],
		setup(__props, { emit: __emit }) {
			const emit = __emit;
			const selectMode = (value) => {
				emit("update:modelValue", value);
			};
			return (_ctx, _cache) => {
				return (0, vue.openBlock)(), (0, vue.createElementBlock)("label", _hoisted_1$7, [(0, vue.createVNode)(AppRadio_default, {
					name: "analysisLaunchMode",
					checked: __props.modelValue === __props.value,
					disabled: __props.disabled,
					value: __props.value,
					onSelect: selectMode
				}, null, 8, [
					"checked",
					"disabled",
					"value"
				]), (0, vue.createElementVNode)("span", _hoisted_2$7, [(0, vue.createElementVNode)("span", _hoisted_3$7, (0, vue.toDisplayString)(__props.label), 1), (0, vue.createElementVNode)("span", _hoisted_4$6, (0, vue.toDisplayString)(__props.description), 1)])]);
			};
		}
	});
	//#endregion
	//#region view/components/molecules/SettingsField.vue?vue&type=script&setup=true&lang.ts
	var _hoisted_1$6 = { class: "flex flex-col gap-4 border-b border-neutral-200 py-6 md:flex-row md:gap-8" };
	var _hoisted_2$6 = { class: "min-w-0 md:w-60 md:shrink-0" };
	var _hoisted_3$6 = { class: "flex items-start gap-2" };
	var _hoisted_4$5 = ["aria-expanded"];
	var _hoisted_5$3 = {
		key: 0,
		class: "mt-2 text-xs leading-5 text-neutral-500"
	};
	var _hoisted_6$3 = { class: "w-full min-w-0 self-center md:flex-1" };
	//#endregion
	//#region view/components/molecules/SettingsField.vue
	var SettingsField_default = /* @__PURE__ */ (0, vue.defineComponent)({
		__name: "SettingsField",
		setup(__props) {
			const slots = (0, vue.useSlots)();
			const displayHelp = (0, vue.ref)(false);
			return (_ctx, _cache) => {
				return (0, vue.openBlock)(), (0, vue.createElementBlock)("div", _hoisted_1$6, [(0, vue.createElementVNode)("div", _hoisted_2$6, [(0, vue.createElementVNode)("div", _hoisted_3$6, [(0, vue.renderSlot)(_ctx.$slots, "label"), (0, vue.unref)(slots).help ? ((0, vue.openBlock)(), (0, vue.createElementBlock)("button", {
					key: 0,
					type: "button",
					class: "mt-0.5 text-primary-600 hover:text-primary-700",
					"aria-expanded": displayHelp.value,
					onClick: _cache[0] || (_cache[0] = ($event) => displayHelp.value = !displayHelp.value)
				}, [(0, vue.createVNode)((0, vue.unref)(qt), {
					name: "circle-question-solid",
					class: "size-4"
				})], 8, _hoisted_4$5)) : (0, vue.createCommentVNode)("", true)]), displayHelp.value ? ((0, vue.openBlock)(), (0, vue.createElementBlock)("div", _hoisted_5$3, [(0, vue.renderSlot)(_ctx.$slots, "help")])) : (0, vue.createCommentVNode)("", true)]), (0, vue.createElementVNode)("div", _hoisted_6$3, [(0, vue.renderSlot)(_ctx.$slots, "default")])]);
			};
		}
	});
	//#endregion
	//#region view/components/organisms/AnalysisLaunchSettings.vue?vue&type=script&setup=true&lang.ts
	var _hoisted_1$5 = { class: "text-sm" };
	var _hoisted_2$5 = { class: "font-medium text-slate-900" };
	var _hoisted_3$5 = { class: "mt-1 text-slate-500" };
	var _hoisted_4$4 = { class: "flex items-center gap-3" };
	var _hoisted_5$2 = {
		for: "automatic-indexing",
		class: "cursor-pointer text-sm text-slate-700"
	};
	var _hoisted_6$2 = { class: "text-sm" };
	var _hoisted_7$2 = { class: "font-medium text-slate-900" };
	var _hoisted_8$2 = { class: "mt-1 text-slate-500" };
	var _hoisted_9$2 = { class: "overflow-hidden rounded-md border border-slate-200" };
	var _hoisted_10$1 = { class: "text-sm" };
	var _hoisted_11 = {
		for: "compilatio-scheduled-at",
		class: "block font-medium text-slate-900"
	};
	var _hoisted_12 = { class: "mt-1 text-slate-500" };
	//#endregion
	//#region view/components/organisms/AnalysisLaunchSettings.vue
	var AnalysisLaunchSettings_default = /* @__PURE__ */ (0, vue.defineComponent)({
		__name: "AnalysisLaunchSettings",
		props: {
			automaticIndexingEnabled: {
				type: Boolean,
				required: true
			},
			disabled: {
				type: Boolean,
				default: false
			},
			launchMode: {
				type: String,
				required: true
			},
			scheduledAt: {
				type: String,
				required: true
			}
		},
		emits: [
			"update:automaticIndexingEnabled",
			"update:launchMode",
			"update:scheduledAt"
		],
		setup(__props) {
			const { t } = useI18n();
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
				return (0, vue.openBlock)(), (0, vue.createElementBlock)(vue.Fragment, null, [
					(0, vue.createVNode)(SettingsField_default, null, {
						label: (0, vue.withCtx)(() => [(0, vue.createElementVNode)("div", _hoisted_1$5, [(0, vue.createElementVNode)("p", _hoisted_2$5, (0, vue.toDisplayString)((0, vue.unref)(t)("settings_automatic_indexing")), 1), (0, vue.createElementVNode)("p", _hoisted_3$5, (0, vue.toDisplayString)((0, vue.unref)(t)("settings_automatic_indexing_description")), 1)])]),
						default: (0, vue.withCtx)(() => [(0, vue.createElementVNode)("div", _hoisted_4$4, [(0, vue.createVNode)(AppSwitch_default, {
							id: "automatic-indexing",
							disabled: __props.disabled,
							"model-value": __props.automaticIndexingEnabled,
							"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => _ctx.$emit("update:automaticIndexingEnabled", $event))
						}, null, 8, ["disabled", "model-value"]), (0, vue.createElementVNode)("label", _hoisted_5$2, (0, vue.toDisplayString)(__props.automaticIndexingEnabled ? (0, vue.unref)(t)("common_enabled") : (0, vue.unref)(t)("common_disabled")), 1)])]),
						_: 1
					}),
					(0, vue.createVNode)(SettingsField_default, null, {
						label: (0, vue.withCtx)(() => [(0, vue.createElementVNode)("div", _hoisted_6$2, [(0, vue.createElementVNode)("p", _hoisted_7$2, (0, vue.toDisplayString)((0, vue.unref)(t)("settings_launch_mode")), 1), (0, vue.createElementVNode)("p", _hoisted_8$2, (0, vue.toDisplayString)((0, vue.unref)(t)("settings_launch_mode_description")), 1)])]),
						default: (0, vue.withCtx)(() => [(0, vue.createElementVNode)("div", _hoisted_9$2, [((0, vue.openBlock)(), (0, vue.createElementBlock)(vue.Fragment, null, (0, vue.renderList)(launchModes, (mode) => {
							return (0, vue.createVNode)(LaunchModeOption_default, {
								key: mode.value,
								description: (0, vue.unref)(t)(mode.descriptionKey),
								disabled: __props.disabled,
								label: (0, vue.unref)(t)(mode.labelKey),
								"model-value": __props.launchMode,
								value: mode.value,
								"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => _ctx.$emit("update:launchMode", $event))
							}, null, 8, [
								"description",
								"disabled",
								"label",
								"model-value",
								"value"
							]);
						}), 64))])]),
						_: 1
					}),
					"scheduled" === __props.launchMode ? ((0, vue.openBlock)(), (0, vue.createBlock)(SettingsField_default, { key: 0 }, {
						label: (0, vue.withCtx)(() => [(0, vue.createElementVNode)("div", _hoisted_10$1, [(0, vue.createElementVNode)("label", _hoisted_11, (0, vue.toDisplayString)((0, vue.unref)(t)("settings_scheduled_at")), 1), (0, vue.createElementVNode)("p", _hoisted_12, (0, vue.toDisplayString)((0, vue.unref)(t)("settings_scheduled_at_description")), 1)])]),
						default: (0, vue.withCtx)(() => [(0, vue.createVNode)(AppTextInput_default, {
							id: "compilatio-scheduled-at",
							disabled: __props.disabled,
							"model-value": __props.scheduledAt,
							required: "",
							type: "datetime-local",
							"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => _ctx.$emit("update:scheduledAt", $event))
						}, null, 8, ["disabled", "model-value"])]),
						_: 1
					})) : (0, vue.createCommentVNode)("", true)
				], 64);
			};
		}
	});
	//#endregion
	//#region view/components/organisms/ApiKeySettings.vue?vue&type=script&setup=true&lang.ts
	var _hoisted_1$4 = { class: "text-sm" };
	var _hoisted_2$4 = {
		for: "compilatio-api-key",
		class: "block font-medium text-neutral-900"
	};
	var _hoisted_3$4 = { class: "mt-1 text-neutral-500" };
	//#endregion
	//#region view/components/organisms/ApiKeySettings.vue
	var ApiKeySettings_default = /* @__PURE__ */ (0, vue.defineComponent)({
		__name: "ApiKeySettings",
		props: {
			disabled: {
				type: Boolean,
				default: false
			},
			modelValue: {
				type: String,
				required: true
			}
		},
		emits: ["update:modelValue"],
		setup(__props) {
			const { t } = useI18n();
			return (_ctx, _cache) => {
				return (0, vue.openBlock)(), (0, vue.createBlock)(SettingsField_default, null, {
					label: (0, vue.withCtx)(() => [(0, vue.createElementVNode)("div", _hoisted_1$4, [(0, vue.createElementVNode)("label", _hoisted_2$4, (0, vue.toDisplayString)((0, vue.unref)(t)("settings_api_key")), 1), (0, vue.createElementVNode)("p", _hoisted_3$4, (0, vue.toDisplayString)((0, vue.unref)(t)("settings_api_key_description")), 1)])]),
					default: (0, vue.withCtx)(() => [(0, vue.createVNode)(AppTextInput_default, {
						id: "compilatio-api-key",
						autocomplete: "new-password",
						disabled: __props.disabled,
						"model-value": __props.modelValue,
						name: "apiKey",
						placeholder: (0, vue.unref)(t)("settings_api_key_placeholder"),
						type: "text",
						"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => _ctx.$emit("update:modelValue", $event))
					}, null, 8, [
						"disabled",
						"model-value",
						"placeholder"
					])]),
					_: 1
				});
			};
		}
	});
	//#endregion
	//#region view/components/molecules/DetectionOption.vue?vue&type=script&setup=true&lang.ts
	var _hoisted_1$3 = { class: "flex min-h-12 items-center justify-between gap-4 border-t border-neutral-200 py-3 first:border-t-0" };
	var _hoisted_2$3 = ["for"];
	var _hoisted_3$3 = {
		key: 0,
		class: "mt-0.5 block text-xs italic text-neutral-500"
	};
	var _hoisted_4$3 = {
		key: 1,
		class: "mt-0.5 block text-xs italic text-neutral-500"
	};
	//#endregion
	//#region view/components/molecules/DetectionOption.vue
	var DetectionOption_default = /* @__PURE__ */ (0, vue.defineComponent)({
		__name: "DetectionOption",
		props: {
			detection: {
				type: Object,
				required: true
			},
			disabled: {
				type: Boolean,
				default: false
			}
		},
		emits: ["change"],
		setup(__props, { emit: __emit }) {
			const emit = __emit;
			const { t } = useI18n();
			return (_ctx, _cache) => {
				return (0, vue.openBlock)(), (0, vue.createElementBlock)("div", _hoisted_1$3, [(0, vue.createElementVNode)("label", {
					for: `detection_${__props.detection.process}`,
					class: (0, vue.normalizeClass)(["text-sm text-neutral-800", __props.detection.configurable && __props.detection.availableInSubscription ? "cursor-pointer" : ""])
				}, [(0, vue.createTextVNode)((0, vue.toDisplayString)((0, vue.unref)(t)(`detection_${__props.detection.process}`)) + " ", 1), !__props.detection.availableInSubscription ? ((0, vue.openBlock)(), (0, vue.createElementBlock)("span", _hoisted_3$3, (0, vue.toDisplayString)((0, vue.unref)(t)("detection_not_in_subscription")), 1)) : !__props.detection.configurable ? ((0, vue.openBlock)(), (0, vue.createElementBlock)("span", _hoisted_4$3, (0, vue.toDisplayString)(__props.detection.enabled ? (0, vue.unref)(t)("detection_always_enabled") : (0, vue.unref)(t)("detection_disabled_by_admin")), 1)) : (0, vue.createCommentVNode)("", true)], 10, _hoisted_2$3), (0, vue.createVNode)(AppSwitch_default, {
					id: `detection_${__props.detection.process}`,
					"model-value": __props.detection.enabled,
					disabled: __props.disabled || !__props.detection.configurable || !__props.detection.availableInSubscription,
					"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => emit("change", $event))
				}, null, 8, [
					"id",
					"model-value",
					"disabled"
				])]);
			};
		}
	});
	//#endregion
	//#region view/components/organisms/DetectionSettings.vue?vue&type=script&setup=true&lang.ts
	var _hoisted_1$2 = { class: "text-sm" };
	var _hoisted_2$2 = { class: "font-medium text-slate-900" };
	var _hoisted_3$2 = { class: "mt-1 text-slate-500" };
	var _hoisted_4$2 = { class: "overflow-hidden rounded-md border border-slate-200 px-4" };
	//#endregion
	//#region view/components/organisms/DetectionSettings.vue
	var DetectionSettings_default = /* @__PURE__ */ (0, vue.defineComponent)({
		__name: "DetectionSettings",
		props: {
			detections: {
				type: Array,
				required: true
			},
			disabled: {
				type: Boolean,
				default: false
			}
		},
		emits: ["change"],
		setup(__props, { emit: __emit }) {
			const props = __props;
			const emit = __emit;
			const { t } = useI18n();
			const visibleDetections = (0, vue.computed)(() => props.detections.map((detection, index) => ({
				detection,
				index
			})).filter(({ detection }) => "rich_extraction" !== detection.process));
			return (_ctx, _cache) => {
				return visibleDetections.value.length ? ((0, vue.openBlock)(), (0, vue.createBlock)(SettingsField_default, { key: 0 }, {
					label: (0, vue.withCtx)(() => [(0, vue.createElementVNode)("div", _hoisted_1$2, [(0, vue.createElementVNode)("p", _hoisted_2$2, (0, vue.toDisplayString)((0, vue.unref)(t)("settings_detections")), 1), (0, vue.createElementVNode)("p", _hoisted_3$2, (0, vue.toDisplayString)((0, vue.unref)(t)("settings_detections_description")), 1)])]),
					default: (0, vue.withCtx)(() => [(0, vue.createElementVNode)("div", _hoisted_4$2, [((0, vue.openBlock)(true), (0, vue.createElementBlock)(vue.Fragment, null, (0, vue.renderList)(visibleDetections.value, (item) => {
						return (0, vue.openBlock)(), (0, vue.createBlock)(DetectionOption_default, {
							key: item.detection.process,
							detection: item.detection,
							disabled: __props.disabled,
							onChange: ($event) => emit("change", item.index, $event)
						}, null, 8, [
							"detection",
							"disabled",
							"onChange"
						]);
					}), 128))])]),
					_: 1
				})) : (0, vue.createCommentVNode)("", true);
			};
		}
	});
	//#endregion
	//#region view/components/organisms/ThresholdSettings.vue?vue&type=script&setup=true&lang.ts
	var _hoisted_1$1 = { class: "text-sm" };
	var _hoisted_2$1 = { class: "font-medium text-neutral-900" };
	var _hoisted_3$1 = { class: "mt-1 text-neutral-500" };
	var _hoisted_4$1 = { class: "grid gap-4 text-sm text-neutral-700 sm:grid-cols-2" };
	var _hoisted_5$1 = { class: "mb-1 block font-medium" };
	var _hoisted_6$1 = ["disabled", "value"];
	var _hoisted_7$1 = { class: "mb-1 block font-medium" };
	var _hoisted_8$1 = [
		"disabled",
		"min",
		"value"
	];
	var _hoisted_9$1 = {
		key: 0,
		class: "mt-3 text-sm font-medium text-danger-700",
		role: "alert"
	};
	//#endregion
	//#region view/components/organisms/ThresholdSettings.vue
	var ThresholdSettings_default = /* @__PURE__ */ (0, vue.defineComponent)({
		__name: "ThresholdSettings",
		props: {
			critical: {
				type: Number,
				required: true
			},
			disabled: {
				type: Boolean,
				default: false
			},
			warning: {
				type: Number,
				required: true
			}
		},
		emits: ["update:critical", "update:warning"],
		setup(__props, { emit: __emit }) {
			const props = __props;
			const emit = __emit;
			const { t } = useI18n();
			const warningExceedsCritical = (0, vue.computed)(() => props.warning > props.critical);
			const updateNumber = (field, event) => {
				const value = Number(event.target.value);
				const normalizedValue = Number.isFinite(value) ? value : 0;
				if ("warning" === field) {
					emit("update:warning", normalizedValue);
					return;
				}
				emit("update:critical", normalizedValue);
			};
			return (_ctx, _cache) => {
				return (0, vue.openBlock)(), (0, vue.createBlock)(SettingsField_default, null, {
					label: (0, vue.withCtx)(() => [(0, vue.createElementVNode)("div", _hoisted_1$1, [(0, vue.createElementVNode)("p", _hoisted_2$1, (0, vue.toDisplayString)((0, vue.unref)(t)("settings_thresholds")), 1), (0, vue.createElementVNode)("p", _hoisted_3$1, (0, vue.toDisplayString)((0, vue.unref)(t)("settings_thresholds_description")), 1)])]),
					default: (0, vue.withCtx)(() => [(0, vue.createElementVNode)("div", _hoisted_4$1, [(0, vue.createElementVNode)("label", null, [(0, vue.createElementVNode)("span", _hoisted_5$1, (0, vue.toDisplayString)((0, vue.unref)(t)("settings_threshold_warning")), 1), (0, vue.createElementVNode)("input", {
						class: "compilatio-input",
						disabled: __props.disabled,
						max: "100",
						min: "0",
						value: __props.warning,
						type: "number",
						onInput: _cache[0] || (_cache[0] = ($event) => updateNumber("warning", $event))
					}, null, 40, _hoisted_6$1)]), (0, vue.createElementVNode)("label", null, [(0, vue.createElementVNode)("span", _hoisted_7$1, (0, vue.toDisplayString)((0, vue.unref)(t)("settings_threshold_critical")), 1), (0, vue.createElementVNode)("input", {
						class: "compilatio-input",
						disabled: __props.disabled,
						max: "100",
						min: __props.warning,
						value: __props.critical,
						type: "number",
						onInput: _cache[1] || (_cache[1] = ($event) => updateNumber("critical", $event))
					}, null, 40, _hoisted_8$1)])]), warningExceedsCritical.value ? ((0, vue.openBlock)(), (0, vue.createElementBlock)("p", _hoisted_9$1, (0, vue.toDisplayString)((0, vue.unref)(t)("settings_error_threshold_order")), 1)) : (0, vue.createCommentVNode)("", true)]),
					_: 1
				});
			};
		}
	});
	//#endregion
	//#region view/components/SettingsPanel.vue?vue&type=script&setup=true&lang.ts
	var _hoisted_1 = { class: "service-magister overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-900 shadow-sm" };
	var _hoisted_2 = { class: "border-b border-neutral-200 px-6 py-5 sm:px-8" };
	var _hoisted_3 = ["alt"];
	var _hoisted_4 = { class: "mt-5" };
	var _hoisted_5 = { class: "text-xl font-semibold tracking-tight" };
	var _hoisted_6 = { class: "mt-1 max-w-2xl text-sm leading-6 text-neutral-600" };
	var _hoisted_7 = {
		key: 0,
		class: "flex items-center gap-3 px-6 py-10 text-sm text-neutral-600 sm:px-8"
	};
	var _hoisted_8 = { class: "px-6 sm:px-8" };
	var _hoisted_9 = { class: "flex justify-end border-t border-neutral-200 px-6 py-4 sm:px-8" };
	var _hoisted_10 = ["disabled"];
	//#endregion
	//#region view/components/SettingsPanel.vue
	var SettingsPanel_default = /* @__PURE__ */ (0, vue.defineComponent)({
		__name: "SettingsPanel",
		setup(__props) {
			const { t } = useI18n();
			const defaultThresholds = {
				warning: 10,
				critical: 20
			};
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
			const data = (0, vue.reactive)({
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
			const canSave = (0, vue.computed)(() => {
				if (!data.apiKey.trim()) return false;
				const scheduledDateIsValid = "scheduled" !== data.analysisLaunchMode || Boolean(data.scheduledAnalysisAt);
				const thresholdsAreValid = Number.isInteger(data.thresholds.warning) && Number.isInteger(data.thresholds.critical) && data.thresholds.warning >= 0 && data.thresholds.critical <= 100 && data.thresholds.warning <= data.thresholds.critical;
				return scheduledDateIsValid && thresholdsAreValid;
			});
			(0, vue.onMounted)(() => {
				const root = document.querySelector("#compilatioSettingsPanelRoot");
				if (!root) {
					setError(t("settings_error_initialization"));
					data.isLoading = false;
					return;
				}
				data.apiUrl = root.dataset.apiUrl || "";
				data.csrfToken = root.dataset.csrfToken || "";
				loadSettings();
			});
			const loadSettings = async () => {
				if (!data.apiUrl) {
					setError(t("settings_error_missing_api_url"));
					data.isLoading = false;
					return;
				}
				try {
					const response = await fetch(data.apiUrl, {
						credentials: "same-origin",
						headers: { Accept: "application/json" }
					});
					const result = await response.json();
					if (!response.ok) throw new Error(getErrorMessage(result, t("settings_error_loading")));
					applySettings(result);
				} catch (error) {
					setError(error instanceof Error ? error.message : t("settings_error_loading"));
				} finally {
					data.isLoading = false;
				}
			};
			const saveSettings = async () => {
				if (!data.apiUrl || !data.csrfToken || !canSave.value) {
					setError(t("settings_error_required_fields"));
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
							scheduledAnalysisAt: "scheduled" === data.analysisLaunchMode ? new Date(data.scheduledAnalysisAt).toISOString() : null
						})
					});
					const result = await response.json();
					if (!response.ok) throw new Error(getErrorMessage(result, t("settings_error_saving")));
					applySettings(result);
					data.message = t("settings_saved");
				} catch (error) {
					setError(error instanceof Error ? error.message : t("settings_error_saving"));
				} finally {
					data.isSaving = false;
				}
			};
			const applySettings = (settings) => {
				if ("string" === typeof settings.apiKey) data.apiKey = settings.apiKey;
				data.automaticIndexingEnabled = true === settings.automaticIndexingEnabled;
				data.analysisLaunchMode = isLaunchMode(settings.analysisLaunchMode) ? settings.analysisLaunchMode : "manual";
				data.scheduledAnalysisAt = toLocalDateTime("string" === typeof settings.scheduledAnalysisAt ? settings.scheduledAnalysisAt : null);
				data.hasFolderRecipeParameters = true === settings.hasFolderRecipeParameters;
				data.bundleDetections = normalizeDetections(settings.bundleDetections, data.hasFolderRecipeParameters);
				data.thresholds = normalizeThresholds(settings.thresholds);
			};
			const normalizeThresholds = (value) => {
				if (!isRecord(value)) return { ...defaultThresholds };
				return {
					warning: "number" === typeof value.warning ? value.warning : defaultThresholds.warning,
					critical: "number" === typeof value.critical ? value.critical : defaultThresholds.critical
				};
			};
			const serializeDetections = (detections) => Object.fromEntries(detections.map((detection) => [detection.process, { enabled: detection.enabled }]));
			const normalizeDetections = (value, canConfigureDetections) => {
				if (!canConfigureDetections) return unavailableSubscriptionDetections.map((detection) => ({ ...detection }));
				if (Array.isArray(value)) return value.filter(isApiDetection).map((detection) => ({
					...detection,
					availableInSubscription: true
				}));
				if (!isRecord(value)) return [];
				return Object.entries(value).flatMap(([process, configuration]) => {
					if (!isRecord(configuration)) return [];
					return [{
						process,
						enabled: true === configuration.enabled,
						configurable: true === configuration.configurable,
						availableInSubscription: true
					}];
				});
			};
			const isApiDetection = (value) => isRecord(value) && "string" === typeof value.process && "boolean" === typeof value.enabled && "boolean" === typeof value.configurable;
			const isRecord = (value) => "object" === typeof value && null !== value;
			const updateDetection = (index, enabled) => {
				const detection = data.bundleDetections[index];
				if (detection?.configurable) detection.enabled = enabled;
			};
			const isLaunchMode = (value) => "string" === typeof value && [
				"automatic",
				"manual",
				"scheduled"
			].includes(value);
			const setError = (message) => {
				data.hasError = true;
				data.message = message;
			};
			const getErrorMessage = (result, fallback) => {
				if ("string" === typeof result?.errorMessage) return result.errorMessage;
				if ("string" === typeof result?.error) return result.error;
				const firstError = result?.errors ? Object.values(result.errors).flat()[0] : null;
				return "string" === typeof firstError && null !== firstError ? firstError : fallback;
			};
			const toLocalDateTime = (value) => {
				if (!value) return "";
				const date = new Date(value);
				return (/* @__PURE__ */ new Date(date.getTime() - date.getTimezoneOffset() * 6e4)).toISOString().slice(0, 16);
			};
			return (_ctx, _cache) => {
				return (0, vue.openBlock)(), (0, vue.createElementBlock)("section", _hoisted_1, [(0, vue.createElementVNode)("header", _hoisted_2, [(0, vue.createElementVNode)("img", {
					src: compilatio_logo_default,
					alt: (0, vue.unref)(t)("settings_logo_alt"),
					class: "h-10 w-auto"
				}, null, 8, _hoisted_3), (0, vue.createElementVNode)("div", _hoisted_4, [(0, vue.createElementVNode)("h2", _hoisted_5, (0, vue.toDisplayString)((0, vue.unref)(t)("settings_title")), 1), (0, vue.createElementVNode)("p", _hoisted_6, (0, vue.toDisplayString)((0, vue.unref)(t)("settings_description")), 1)])]), data.isLoading ? ((0, vue.openBlock)(), (0, vue.createElementBlock)("div", _hoisted_7, [_cache[6] || (_cache[6] = (0, vue.createElementVNode)("span", { class: "size-4 animate-spin rounded-full border-2 border-neutral-300 border-t-primary-600" }, null, -1)), (0, vue.createTextVNode)(" " + (0, vue.toDisplayString)((0, vue.unref)(t)("settings_loading")), 1)])) : ((0, vue.openBlock)(), (0, vue.createElementBlock)("form", {
					key: 1,
					onSubmit: (0, vue.withModifiers)(saveSettings, ["prevent"])
				}, [
					(0, vue.createElementVNode)("div", _hoisted_8, [
						(0, vue.createVNode)(ApiKeySettings_default, {
							modelValue: data.apiKey,
							"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => data.apiKey = $event),
							disabled: data.isSaving
						}, null, 8, ["modelValue", "disabled"]),
						data.apiKey ? ((0, vue.openBlock)(), (0, vue.createBlock)(ThresholdSettings_default, {
							key: 0,
							warning: data.thresholds.warning,
							"onUpdate:warning": _cache[1] || (_cache[1] = ($event) => data.thresholds.warning = $event),
							critical: data.thresholds.critical,
							"onUpdate:critical": _cache[2] || (_cache[2] = ($event) => data.thresholds.critical = $event),
							disabled: data.isSaving
						}, null, 8, [
							"warning",
							"critical",
							"disabled"
						])) : (0, vue.createCommentVNode)("", true),
						data.apiKey ? ((0, vue.openBlock)(), (0, vue.createBlock)(AnalysisLaunchSettings_default, {
							key: 1,
							"automatic-indexing-enabled": data.automaticIndexingEnabled,
							"onUpdate:automaticIndexingEnabled": _cache[3] || (_cache[3] = ($event) => data.automaticIndexingEnabled = $event),
							"launch-mode": data.analysisLaunchMode,
							"onUpdate:launchMode": _cache[4] || (_cache[4] = ($event) => data.analysisLaunchMode = $event),
							"scheduled-at": data.scheduledAnalysisAt,
							"onUpdate:scheduledAt": _cache[5] || (_cache[5] = ($event) => data.scheduledAnalysisAt = $event),
							disabled: data.isSaving
						}, null, 8, [
							"automatic-indexing-enabled",
							"launch-mode",
							"scheduled-at",
							"disabled"
						])) : (0, vue.createCommentVNode)("", true),
						data.apiKey ? ((0, vue.openBlock)(), (0, vue.createBlock)(DetectionSettings_default, {
							key: 2,
							detections: data.bundleDetections,
							disabled: data.isSaving,
							onChange: updateDetection
						}, null, 8, ["detections", "disabled"])) : (0, vue.createCommentVNode)("", true)
					]),
					data.message ? ((0, vue.openBlock)(), (0, vue.createElementBlock)("div", {
						key: 0,
						role: "status",
						class: (0, vue.normalizeClass)(["mx-6 mb-5 rounded-md border px-4 py-3 text-sm sm:mx-8", data.hasError ? "border-danger-200 bg-danger-50 text-danger-700" : "border-success-200 bg-success-50 text-success-700"])
					}, (0, vue.toDisplayString)(data.message), 3)) : (0, vue.createCommentVNode)("", true),
					(0, vue.createElementVNode)("footer", _hoisted_9, [(0, vue.createElementVNode)("button", {
						type: "submit",
						class: "compilatio-save-button",
						disabled: data.isSaving || !canSave.value
					}, (0, vue.toDisplayString)(data.isSaving ? (0, vue.unref)(t)("settings_saving") : (0, vue.unref)(t)("settings_save")), 9, _hoisted_10)])
				], 32))]);
			};
		}
	});
	//#endregion
	//#region view/locales/en.js
	var en_default = {
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
	//#endregion
	//#region view/locales/fr.js
	var fr_default = {
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
	//#endregion
	//#region view/PlagiarismPanel.entry.ts
	window.mountCompilatioSettingsApp = (target) => {
		const locale = (document.documentElement.lang || "fr").replace("_", "-").split("-")[0];
		const i18n = createI18n({
			legacy: false,
			locale,
			fallbackLocale: "fr",
			messages: {
				en: en_default,
				fr: fr_default
			}
		});
		const app = window.pkp.pkpCreateVueApp(SettingsPanel_default);
		app.use(i18n);
		app.mount(target);
		return app;
	};
	window.mountCompilatioDocumentApp = (target, documentData, onUpdated) => {
		const config = window.pkpCompilatioDocuments;
		const locale = (config.locale || document.documentElement.lang || "fr").replace("_", "-");
		const app = window.pkp.pkpCreateVueApp({ render: () => (0, vue.h)(DocumentFrame_default, {
			document: documentData,
			thresholds: config.thresholds,
			api: window.pkpCompilatioDocumentsApi,
			onUpdated
		}) });
		app.use(createI18n({
			legacy: false,
			locale,
			messages: { [locale]: config.messages }
		}));
		app.mount(target);
		return app;
	};
	window.dispatchEvent(new Event("compilatio:document-app-ready"));
	//#endregion
})(pkp.modules.vue);

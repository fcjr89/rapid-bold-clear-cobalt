import { i as __toESM$1 } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DUQSLRl7.js
var import_react = /* @__PURE__ */ __toESM$1(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
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
/** Unified held-key input. Touch buttons inject the same codes. */
var held = /* @__PURE__ */ new Set();
var injected = /* @__PURE__ */ new Set();
var confirmPulse = false;
var cancelPulse = false;
var CONFIRM = /* @__PURE__ */ new Set([
	"KeyZ",
	"Space",
	"Enter",
	"KeyJ"
]);
var CANCEL = /* @__PURE__ */ new Set([
	"KeyX",
	"Escape",
	"KeyK",
	"Backspace"
]);
function isTypingTarget(el) {
	if (!(el instanceof HTMLElement)) return false;
	const tag = el.tagName;
	return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}
function bindInput() {
	const down = (e) => {
		if (isTypingTarget(e.target)) return;
		held.add(e.code);
		if (CONFIRM.has(e.code) || CANCEL.has(e.code) || e.code.startsWith("Arrow") || e.code.startsWith("Key")) e.preventDefault();
		if (CONFIRM.has(e.code)) confirmPulse = true;
		if (CANCEL.has(e.code)) cancelPulse = true;
	};
	const up = (e) => {
		held.delete(e.code);
	};
	const clear = () => held.clear();
	window.addEventListener("keydown", down, { passive: false });
	window.addEventListener("keyup", up);
	window.addEventListener("blur", clear);
	document.addEventListener("visibilitychange", () => {
		if (document.hidden) clear();
	});
	return () => {
		window.removeEventListener("keydown", down);
		window.removeEventListener("keyup", up);
		window.removeEventListener("blur", clear);
	};
}
function setInjected(codes, down) {
	for (const c of codes) if (down) injected.add(c);
	else injected.delete(c);
}
function setKeysExact(codes) {
	injected.clear();
	for (const c of codes) injected.add(c);
}
function isDown(code) {
	return held.has(code) || injected.has(code);
}
function axis() {
	let x = 0;
	let y = 0;
	if (isDown("KeyA") || isDown("ArrowLeft")) x -= 1;
	if (isDown("KeyD") || isDown("ArrowRight")) x += 1;
	if (isDown("KeyW") || isDown("ArrowUp")) y -= 1;
	if (isDown("KeyS") || isDown("ArrowDown")) y += 1;
	return {
		x,
		y
	};
}
function consumeConfirm() {
	const v = confirmPulse || isDown("KeyZ") && false;
	if (confirmPulse) {
		confirmPulse = false;
		return true;
	}
	return v;
}
function consumeCancel() {
	if (cancelPulse) {
		cancelPulse = false;
		return true;
	}
	return false;
}
function pulseConfirm() {
	confirmPulse = true;
}
function pulseCancel() {
	cancelPulse = true;
}
function hold(codes) {
	return {
		onPointerDown: (e) => {
			e.preventDefault();
			e.currentTarget.classList.add("is-down");
			setInjected(codes, true);
		},
		onPointerUp: (e) => {
			e.currentTarget.classList.remove("is-down");
			setInjected(codes, false);
		},
		onPointerLeave: (e) => {
			e.currentTarget.classList.remove("is-down");
			setInjected(codes, false);
		},
		onPointerCancel: (e) => {
			e.currentTarget.classList.remove("is-down");
			setInjected(codes, false);
		}
	};
}
function TouchControls() {
	const root = (0, import_react.useRef)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "touch-bar",
		ref: root,
		"aria-hidden": "false",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "dpad",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "pad-btn",
					...hold(["KeyW", "ArrowUp"]),
					children: "N"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "pad-btn",
					...hold(["KeyA", "ArrowLeft"]),
					children: "W"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "pad-btn",
					...hold(["KeyS", "ArrowDown"]),
					children: "S"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "pad-btn",
					...hold(["KeyD", "ArrowRight"]),
					children: "E"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "actions",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "action-btn b",
				onPointerDown: (e) => {
					e.preventDefault();
					pulseCancel();
				},
				children: "X"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "action-btn",
				onPointerDown: (e) => {
					e.preventDefault();
					pulseConfirm();
				},
				children: "Z"
			})]
		})]
	});
}
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => Home });
var gameMod = typeof window !== "undefined" ? import("./createGame-DHY74c4A.mjs") : null;
function Home() {
	const rootRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		let destroy;
		let alive = true;
		(gameMod ?? import("./createGame-DHY74c4A.mjs")).then(({ createGame, destroyGame }) => {
			if (!alive || !rootRef.current) return;
			rootRef.current.replaceChildren();
			createGame(rootRef.current);
			destroy = destroyGame;
			rootRef.current.querySelector("canvas")?.focus();
		});
		return () => {
			alive = false;
			destroy?.();
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "game-shell",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "sr-only",
				children: "Baki The Hammer: Bloodlines of the Divide"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				id: "game-root",
				className: "game-canvas",
				ref: rootRef,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
					width: 480,
					height: 270,
					className: "boot-canvas"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TouchControls, {})
		]
	});
}
//#endregion
export { consumeConfirm as a, __toESM as c, consumeCancel as i, axis as n, setKeysExact as o, bindInput as r, __commonJSMin as s, routes_exports as t };

import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
	{
		files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
		plugins: { js },
		extends: ["js/recommended"],
	},
	{
		files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
		languageOptions: { globals: globals.browser },
	},
	tseslint.configs.recommended,
	pluginReact.configs.flat.recommended,
	{
		settings: {
			react: {
				version: "detect", // Reactのバージョンを自動検出
			},
		},
		rules: {
			// React 17+ では JSX を使用するために React をインポートする必要がなくなったため、以下のルールを無効化
			"react/react-in-jsx-scope": "off",
			// TypeScriptには型定義があるため、PropTypesを使用する必要がないため、以下のルールを無効化
			"react/prop-types": "off",
		},
	},
	globalIgnores([
		"**/node_modules/**",
		"**/dist/**",
		"**/build/**",
		"**/coverage/**",
		"**/.next/**",
		"**/.turbo/**",
		"**/.vercel/**",
		"**/.output/**",
		"**/.idea/**",
		"**/.vscode/**",
		"**/.DS_Store/**",
		"**/Thumbs.db/**",
		"**/desktop.ini/**",
		"**/src-tauri/**",
	]),
]);

// .eslintrc.cjs
module.exports = {
	root: true,
	env: {
		browser: true,
		es2020: true,
		node: true,
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		project: './tsconfig.json',
	},
	plugins: ['svelte', '@typescript-eslint', 'prettier'],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:svelte/recommended',
		'plugin:prettier/recommended',
	],
	overrides: [
		{
			files: ['*.svelte'],
			processor: 'svelte/svelte',
		},
	],
	ignorePatterns: ['node_modules', 'dist', '.svelte-kit', 'build'],
	rules: {
		'prettier/prettier': 'warn',
		// Add any custom rules here
	},
};

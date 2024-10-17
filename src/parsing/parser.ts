import assert from 'assert';
import path from 'path';
import {
	Language,
	default as Parser,
	default as parser,
} from 'web-tree-sitter';

export type Parsing = {
	module: string;
	language: Language;
	parser: Parser;
};

export const Languages = {
	javascript: { module: 'javascript' },
	javascriptreact: { module: 'javascript' },
	typescript: { module: 'typescript' },
	typescriptreact: {
		module: 'typescript',
	},
	go: {
		module: 'go',
	},
	python: {
		module: 'python',
	},
	json: {
		module: 'json',
	},
	jsonc: {
		module: 'json',
	},

	c: { module: 'c' },
	c_sharp: { module: 'c_sharp' },
	css: { module: 'css' },
	elisp: { module: 'elisp' },
	elixir: { module: 'elixir' },
	elm: { module: 'elm' },
	embedded_template: { module: 'embedded_template' },
	html: { module: 'html' },
	java: { module: 'java' },
	cpp: { module: 'cpp' },
	lua: { module: 'lua' },
	kotlin: { module: 'kotlin' },
	objc: { module: 'objc' },
	php: { module: 'php' },
	ql: { module: 'ql' },
	ruby: { module: 'ruby' },
	rust: { module: 'rust' },
	scala: { module: 'scala' },
	solidity: { module: 'solidity' },
	systemrdl: { module: 'systemrdl' },
	toml: { module: 'toml' },
	vue: { module: 'vue' },
	yaml: { module: 'yaml' },
	tlaplus: { module: 'tlaplus' },
	tsx: { module: 'tsx' },
};

export type SupportedLanguages = keyof typeof Languages;

export class LanguageParser {
	private static initedLanguages: Partial<
		Record<keyof typeof Languages, Parsing>
	> = {};
	static async init() {
		const wasmPath = LanguageParser.path('tree-sitter');
		await parser.init({
			locateFile: () => wasmPath,
		});
	}
	static path(name: string) {
		return path.join(
			__dirname,
			'..',
			'parsers',
			`tree-sitter-${name}.wasm`
		); // Adjust the path if necessary
	}
	static async get(langname: string) {
		if (langname in LanguageParser.initedLanguages) {
			return LanguageParser.initedLanguages[
				langname as keyof typeof Languages
			];
		}

		let lang: Language | undefined;
		await LanguageParser.init();
		try {
			const parseName = Languages[langname as keyof typeof Languages];

			assert(parseName, 'could not find parser for ' + langname);
			lang = await parser.Language.load(this.path(parseName.module));
		} catch (err) {
			console.error('could not set language', err);
			return undefined;
		}
		assert(lang, 'could not set language');
		const p = new Parser();
		p.setLanguage(lang);
		LanguageParser.initedLanguages[langname as keyof typeof Languages] = {
			language: lang,
			module: langname,
			parser: p,
		};
		return LanguageParser.initedLanguages[
			langname as keyof typeof Languages
		];
	}
}


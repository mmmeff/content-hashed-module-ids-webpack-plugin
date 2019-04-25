"use strict";
const createHash = require("webpack/lib/util/createHash");
const fs = require('fs');

class ContentHashedModuleIdsPlugin {
	constructor(options) {
		if (!options) options = {};

		this.options = Object.assign(
			{
				context: null,
				hashFunction: "md4",
				hashDigest: "base64",
				hashDigestLength: 10
			},
			options
		);

	}

	apply(compiler) {
		const options = this.options;

		compiler.hooks.compilation.tap("ContentHashedModuleIdsPlugin", compilation => {
			const usedIds = new Set();
			compilation.hooks.beforeModuleIds.tap(
				"ContentHashedModuleIdsPlugin",
				(modules) => {
					for (const module of modules) {
						if (module.id === null && module.resource) {
							const hash = createHash(options.hashFunction);

							try {
								hash.update(fs.readFileSync(module.resource));
							} catch (ex) {
								console.error('failed on', module.context, module.resource);
								throw ex;
							}

							const hashId = hash.digest(options.hashDigest);
							let len = options.hashDigestLength;
							while (usedIds.has(hashId.substr(0, len))) {
								len++;
							}
							module.id = hashId.substr(0, len);
							usedIds.add(module.id);
						}
					}
				}
			);
		});
	}
}

module.exports = ContentHashedModuleIdsPlugin;
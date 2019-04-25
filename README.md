<div align="center">
  <!-- replace with accurate logo e.g from https://worldvectorlogo.com/ -->
  <img width="200" height="200" src="https://cdn.worldvectorlogo.com/logos/javascript.svg">
  <a href="https://webpack.js.org/">
    <img width="200" height="200" vspace="" hspace="25" src="https://cdn.rawgit.com/webpack/media/e7485eb2/logo/icon-square-big.svg">
  </a>
  <h1>content-hashed-module-ids-webpack-plugin</h1>
</div>

[![npm][npm]][npm-url]

This plugin generates module ID from unique hashes based on the file contents of the module. Unlike [Webpack's HashedModuleIdsPlugin](https://webpack.js.org/plugins/hashed-module-ids-plugin/), which generates hashes from the relative import path of the module.

You can use this plugin to guarantee that multiple webpack bundles on a page do not clash their module IDs and overwrite modules when loading chunk assets. This is pivotal to achieving long-term caching across disparate builds. 

Furthermore, this plugin gives you the ability to share chunks *between* multiple webpack bundles on a page so long as they use the same versions, and when they do not, the page will load both and continue working as expected.

## Install

```bash
npm i -D content-hashed-module-ids-webpack-plugin
```

## Configuration
This plugin takes the same options used by [Webpack's HashedModuleIdsPlugin](https://webpack.js.org/plugins/hashed-module-ids-plugin/).

### Plugin usage

**webpack.config.js**

```js
const ContentHashedModuleIdsPlugin = require('content-hashed-module-ids-webpack-plugin');

module.exports = {
    // ...
    plugins: [
        new ContentHashedModuleIdsPlugin({
            // HashedModuleIdsPlugin options
        })
    ]
    // ...
}
```


### Recommended configuration for long-term caching and multi-bundle chunk-sharing
This configuration is heavily based on the article *[The 100% correct way to split your chunks with webpack](https://hackernoon.com/the-100-correct-way-to-split-your-chunks-with-webpack-f8a9df5b7758)*.

```js
const ContentHashedModuleIdsPlugin = require('content-hashed-module-ids-webpack-plugin');

const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
    context: __dirname,
    entry: path.resolve(__dirname, './index.js'),
    output: {
        filename: '[name].[chunkhash].js',
        path: path.join(__dirname, './dist'),
        publicPath: './static/',
        library: 'SharedChunkBundles' // Groups all similarly built packages into the same library
    },
    plugins: [
        new ContentHashedModuleIdsPlugin() // Guarantees that all moduleIds under the SharedChunkBundles library are unique
    ],
    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 0,
            cacheGroups: {
                vendors: {
                    // splits out all node_modules into chunks by name
                    test: /[\\/]node_modules[\\/]/,
                    name: (module) => {
                        const pName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                        return `npm.${pName.replace('@', '')}`;
                    }
                }
            }
        }
    },
    mode: isDev ? 'development' : 'production',
    devtool: isDev ? 'eval' : undefined,
}
```

## License

[MIT](./LICENSE)

[npm]: https://img.shields.io/npm/v/content-hashed-module-ids-webpack-plugin.svg
[npm-url]: https://npmjs.com/package/content-hashed-module-ids-webpack-plugin
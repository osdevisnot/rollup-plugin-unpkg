const readPkg = require('read-pkg');
const { walk } = require('estree-walker');
const MagicString = require('magic-string');
const padStr = str => `'${str}'`;

module.exports = ({ transform = (name, version) => `https://unpkg.com/${name}@${version}?type=module` } = {}) => {
  const pkg = readPkg.sync();
  const cache = {};
  return {
    name: 'unpkg',
    options(opts) {
      let deps = (pkg && pkg.dependencies) || {};

      Object.keys(deps).forEach(dep => {
        const manifest = readPkg.sync(require.resolve(`${dep}/package.json`));
        if (manifest.module) cache[manifest.name] = transform(manifest.name, manifest.version);
      });

      let external = Object.values(cache);
      if (Array.isArray(opts.external)) {
        external = Array.from(new Set(opts.external.concat(external)));
      }
      return Object.assign({}, opts, { external });
    },
    transform(code, id) {
      const ast = this.parse(code);
      const magicString = new MagicString(code);
      walk(ast, {
        enter(node, parent) {
          if (node.type === 'Literal' && parent.type === 'ImportDeclaration') {
            if (cache[node.value])
              magicString.overwrite(node.start, node.end, padStr(cache[node.value]), {
                storeName: false
              });
            return node;
          }
        }
      });
      return {
        code: magicString.toString(),
        map: magicString.generateMap()
      };
    }
  };
};

const readPkg = require("read-pkg");
const { walk } = require("estree-walker");
const MagicString = require("magic-string");
const padStr = str => `'${str}'`;

module.exports = ({ transform = (name, version) => `https://unpkg.com/${name}@${version}?type=module`, autoDiscoverExternals = true } = {}) => {
  const pkg = readPkg.sync();
  const cache = {};
  return {
    name: "unpkg",
    options(opts) {
      let deps = (pkg && pkg.dependencies) || {};
      let userDefinedExternal = Array.isArray(opts.external) ? opts.external : [];
      Object.keys(deps).forEach(dep => {
        // If auto discover is set to false only add to cache if dep is in external list.
        if (autoDiscoverExternals || userDefinedExternal.includes(dep)) {
          const manifest = readPkg.sync({ cwd: `${process.cwd()}/node_modules/${dep}` });
          if (manifest.module) cache[manifest.name] = transform(manifest.name, manifest.version);
        }
      });

      let external = Object.values(cache);
      external = Array.from(new Set(userDefinedExternal.concat(external)));

      return Object.assign({}, opts, { external });
    },
    transform(code, id) {
      const ast = this.parse(code);
      const magicString = new MagicString(code);
      walk(ast, {
        enter(node, parent) {
          if (node.type === "Literal" && parent.type === "ImportDeclaration") {
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

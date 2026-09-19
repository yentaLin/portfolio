/** Prefix root-relative Markdown/MDX links and images at build time. */
export default function rehypeBaseLinks({ base = '/' } = {}) {
  const prefix = base.replace(/\/$/, '');
  return function transform(tree) {
    function visit(node) {
      for (const key of ['href', 'src']) {
        const value = node.properties?.[key];
        if (
          typeof value === 'string' &&
          value.startsWith('/') &&
          !value.startsWith('//') &&
          prefix &&
          value !== prefix &&
          !value.startsWith(`${prefix}/`)
        ) {
          node.properties[key] = `${prefix}${value}`;
        }
      }
      node.children?.forEach(visit);
    }
    visit(tree);
  };
}

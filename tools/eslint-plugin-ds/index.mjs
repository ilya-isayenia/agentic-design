// Local ESLint rules for the design system. Every rule here is a checkable line from .claude/skills/ds-rules.
const HEX = /#[0-9a-fA-F]{3,8}\b/;
const COLOR_FN = /\b(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\(/;
const LENGTH = /(?<![\w-])-?\d*\.?\d+(?:px|rem|em|vh|vw|ch)\b/;
// Tailwind arbitrary values and properties: p-[13px], bg-[#fff], [mask:none]
const ARBITRARY = /(?:^|\s|:)[!-]?[a-z][\w-]*-\[[^\]]+\]|(?:^|\s)\[[a-z-]+:[^\]]+\]/;

/** @param {string} text */
function rawValue(text) {
  if (ARBITRARY.test(text)) return 'a Tailwind arbitrary value';
  if (HEX.test(text)) return 'a raw hex colour';
  if (COLOR_FN.test(text)) return 'a raw colour function';
  if (LENGTH.test(text)) return 'a raw length';
  return null;
}

const message = (/** @type {string} */ what) =>
  `Raw value: ${what}. Use a design token class or a var(--ds-*) variable (see .claude/skills/ds-rules).`;

/** @type {import('eslint').Rule.RuleModule} */
const noRawValues = {
  meta: { type: 'problem', docs: { description: 'Disallow raw colours, lengths and Tailwind arbitrary values' }, schema: [] },
  create(context) {
    const source = context.sourceCode;
    /** @param {any} node @param {string} text */
    const check = (node, text) => {
      const what = rawValue(text);
      if (what) context.report({ node, message: message(what) });
    };
    // <style> blocks are not parsed by vue-eslint-parser; scan them as text.
    const style = /<style[^>]*>([\s\S]*?)<\/style>/g;
    const text = source.text;
    let match;
    while ((match = style.exec(text))) {
      match[1].split('\n').forEach((line, i) => {
        const what = rawValue(line.replace(/var\([^)]*\)/g, ''));
        if (what) {
          const before = text.slice(0, match.index + match[0].indexOf(match[1])).split('\n').length;
          context.report({ loc: { line: before + i, column: 0 }, message: message(what) });
        }
      });
    }
    const visitors = {
      /** @param {any} node */
      Literal(node) {
        if (typeof node.value === 'string') check(node, node.value);
      },
      /** @param {any} node */
      TemplateElement(node) {
        check(node, node.value.cooked ?? '');
      },
    };
    const templateVisitors = {
      /** @param {any} node */
      VAttribute(node) {
        if (!node.directive && ['class', 'style', 'fill', 'stroke', 'color'].includes(node.key.name) && node.value) {
          check(node, node.value.value);
        }
      },
      ...visitors,
    };
    const services = source.parserServices;
    if (services?.defineTemplateBodyVisitor) return services.defineTemplateBodyVisitor(templateVisitors, visitors);
    return visitors;
  },
};

export default { rules: { 'no-raw-values': noRawValues } };

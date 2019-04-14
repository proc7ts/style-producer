import { stypSelectorText } from './selector-text';
import { stypRuleKeyText, stypSelectorDisplayText } from './selector-text.impl';

describe('stypSelectorText', () => {
  it('prints raw selector', () => {
    expect(stypSelectorText('.some')).toBe('.some');
  });
  it('prints element name', () => {
    expect(stypSelectorText({ e: 'span' })).toBe('span');
  });
  it('prints namespace', () => {
    expect(stypSelectorText({ ns: 'foo', e: 'bar' })).toBe('foo|bar');
  });
  it('prints generic element', () => {
    expect(stypSelectorText({ $: 'foo' })).toBe('*');
  });
  it('prints generic namespaced element', () => {
    expect(stypSelectorText({ ns: 'foo' })).toBe('foo|*');
  });
  it('prints identifier', () => {
    expect(stypSelectorText({ i: 'foo:bar' })).toBe('#foo\\:bar');
  });
  it('prints classes', () => {
    expect(stypSelectorText({ c: ['foo', 'bar.baz'] })).toBe('.bar\\.baz.foo');
  });
  it('prints pseudo-items', () => {
    expect(stypSelectorText({ e: 'a', s: ':hover' })).toBe('a:hover');
  });
  it('prints combinations', () => {
    expect(stypSelectorText([{ e: 'ul' }, '>', { e: 'a' }, '+', { e: 'span', s: ':after' }])).toBe('ul>a+span:after');
  });
  it('separates parts', () => {
    expect(stypSelectorText([{ e: 'ul' }, { e: 'a' }, { e: 'span', s: ':after' }])).toBe('ul a span:after');
  });
  it('ignores qualifiers', () => {
    expect(stypSelectorText({ e: 'span', $: 'foo' })).toBe('span');
  });
  it('formats qualifiers by second argument', () => {
    expect(stypSelectorText({ e: 'span', $: ['foo', 'bar'] }, { qualify(q) { return `@${q}`; } })).toBe('span@bar@foo');
  });
});

describe('stypRuleKeyText', () => {
  it('formats qualifiers', () => {
    expect(stypRuleKeyText([{ e: 'span', $: ['foo:bar'] }])).toBe('span@foo\\:bar');
  });
});

describe('stypSelectorDisplayText', () => {
  it('displays qualifiers', () => {
    expect(stypSelectorDisplayText([{ e: 'span', $: ['foo:bar=baz'] }])).toBe('span@foo:bar=baz');
  });
});

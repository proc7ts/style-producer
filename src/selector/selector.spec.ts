import { stypSelector } from './selector';

describe('stypSelector', () => {
  it('converts string to raw selector', () => {
    expect(stypSelector('abc')).toEqual([{ s: 'abc' }]);
  });
  it('converts empty string to empty selector', () => {
    expect(stypSelector('')).toHaveLength(0);
  });
  it('handles empty selector', () => {
    expect(stypSelector({})).toHaveLength(0);
  });
  it('strips empty selector', () => {
    expect(stypSelector([{ e: 'span' }, '>', {}, { c: 'nested' }])).toEqual([{ e: 'span' }, '>', { c: ['nested'] }]);
  });
  it('handles raw selector', () => {
    expect(stypSelector({ s: 'abc' })).toEqual([{ s: 'abc' }]);
  });
  it('handles empty raw selector', () => {
    expect(stypSelector({ s: '' })).toHaveLength(0);
  });
  it('handles combinators', () => {
    expect(stypSelector(['abc', '>', { e: 'def' }])).toEqual([{ s: 'abc' }, '>', { e: 'def' }]);
  });
  it('strips subsequent combinators', () => {
    expect(stypSelector(['abc', '>', '+', '~', { e: 'def' }])).toEqual([{ s: 'abc' }, '>', { e: 'def' }]);
  });
  it('strips last combinators', () => {
    expect(stypSelector(['abc', '>', '+'])).toEqual([{ s: 'abc' }]);
  });
  it('handles id', () => {
    expect(stypSelector({ i: 'abc' })).toEqual([{ i: 'abc' }]);
  });
  it('handles empty id', () => {
    expect(stypSelector({ i: '' })).toHaveLength(0);
  });
  it('handles element', () => {
    expect(stypSelector({ e: 'span' })).toEqual([{ e: 'span' }]);
  });
  it('handles empty element', () => {
    expect(stypSelector({ e: '' })).toHaveLength(0);
  });
  it('normalizes classes', () => {
    expect(stypSelector({ c: 'abc' })).toEqual([{ c: ['abc'] }]);
  });
  it('removes empty class', () => {
    expect(stypSelector({ e: 'span', c: '' })).toEqual([{ e: 'span' }]);
  });
  it('sorts classes', () => {
    expect(stypSelector({ c: ['def', 'abc'] })).toEqual([{ c: ['abc', 'def'] }]);
  });
  it('strips empty classes', () => {
    expect(stypSelector({ c: ['', 'abc', ''] })).toEqual([{ c: ['abc'] }]);
  });
  it('removes empty classes', () => {
    expect(stypSelector({ e: 'span', c: ['', ''] })).toEqual([{ e: 'span' }]);
  });
  it('handles attributes', () => {
    expect(stypSelector({ e: 'span', s: '[abc]' })).toEqual([{ e: 'span', s: '[abc]' }]);
  });
  it('removes empty attributes', () => {
    expect(stypSelector({ e: 'span', s: '' })).toEqual([{ e: 'span' }]);
  });
  it('normalizes qualifiers', () => {
    expect(stypSelector({ $: 'abc' })).toEqual([{ $: ['abc'] }]);
  });
  it('removes empty qualifier', () => {
    expect(stypSelector({ e: 'span', $: '' })).toEqual([{ e: 'span' }]);
  });
  it('strips empty qualifiers', () => {
    expect(stypSelector({ $: ['', 'abc'] })).toEqual([{ $: ['abc'] }]);
  });
  it('removes empty qualifiers', () => {
    expect(stypSelector({ e: 'span', $: ['', ''] })).toEqual([{ e: 'span' }]);
  });
  it('sorts qualifiers', () => {
    expect(stypSelector({ $: ['def', 'abc'] })).toEqual([{ $: ['abc', 'def'] }]);
  });
  it('exposes qualifiers', () => {
    expect(stypSelector({ $: ['foo:def', 'foo:z', 'bar:abc=vvv:xxx'] })).toEqual([{
      $: [
        'bar', 'bar:abc', 'bar:abc=vvv:xxx',
        'foo', 'foo:def', 'foo:z',
      ]
    }]);
  });
});

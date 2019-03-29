import { StypRule } from './rule';
import { StypSelector } from '../selector';
import { stypRoot } from './root';
import { AfterEvent, AfterEvent__symbol, afterEventOf, trackValue, ValueTracker } from 'fun-events';
import { StypProperties } from './properties';
import { itsEmpty } from 'a-iterable';
import Mock = jest.Mock;

describe('StypRule', () => {

  let root: StypRule;

  beforeEach(() => {
    root = stypRoot();
  });

  let selector: StypSelector.Normalized;
  let rule: StypRule;
  let mockSpec: Mock<AfterEvent<[StypProperties]>, [StypRule]>;

  beforeEach(() => {
    selector = [{ e: 'test-element' }];
    mockSpec = jest.fn(r => afterEventOf({}));
    rule = root.rule(selector).add(mockSpec);
  });

  describe('empty', () => {
    it('is `false`', () => {
      expect(rule.empty).toBe(false);
    });
  });

  describe('rules', () => {
    it('empty by default', () => {
      expect(itsEmpty(rule.rules)).toBe(true);
    });
  });

  describe('read', () => {

    let properties: StypProperties;

    beforeEach(() => {
      properties = { fontSize: '12px' };
      mockSpec.mockImplementation(() => afterEventOf(properties));
    });

    it('reads the spec', () => {
      expect(rule.read.kept).toEqual([properties]);
      expect(mockSpec).toHaveBeenCalledWith(rule);
    });
    it('caches the spec', () => {
      expect(rule.read).toBe(rule.read);
      expect(mockSpec).toHaveBeenCalledTimes(1);
    });
  });

  describe('[AfterEvent__symbol]', () => {
    it('is the same as `read`', () => {
      expect(rule[AfterEvent__symbol]).toBe(rule.read);
    });
  });

  describe('add', () => {

    beforeEach(() => {
      rule = root.rule([ { e: 'element-1' }, '>', { e: 'element-1-1' }]).add({});
    });

    let update: ValueTracker<StypProperties>;
    let updated: StypRule;

    beforeEach(() => {
      update = trackValue({ display: 'block' });
      updated = rule.add(update.read);
    });

    let rule2: StypRule;

    beforeEach(() => {
      rule2 = root.rule([ { e: 'element-1', $: 'biz' }]);
    });

    it('updates existing rule', () => {
      expect(updated).toBe(rule);
    });
    it('stores updated rule in hierarchy', () => {
      expect(root.rule(rule.selector)).toBe(rule);
    });
    it('applies update', async () => {
      expect(await receiveProperties(updated)).toEqual(update.it);
    });
    it('merges updated properties', async () => {

      const update2: StypProperties = { width: '100%' };

      rule.add(update2);

      expect(await receiveProperties(rule)).toEqual({ ...update.it, ...update2 });
    });
    it('adds another rule', async () => {

      const update2: StypProperties = { width: '100%' };
      const updated2 = rule2.add(update2);

      expect(root.rule(rule2.selector)).toEqual(updated2);
      expect(await receiveProperties(updated2)).toEqual(update2);
    });
    it('adds nested rule', async () => {

      const update2: StypProperties = { width: '100%' };
      const updated2 = rule.rule({ e: 'element-1-2' }).add(update2);

      expect(root.rule(updated2.selector)).toBe(updated2);
      expect(await receiveProperties(updated2)).toEqual(update2);
    });
  });
});

describe('empty rule', () => {

  let root: StypRule;

  beforeEach(() => {
    root = stypRoot();
  });

  let selector: StypSelector.Normalized;
  let rule: StypRule;

  beforeEach(() => {
    selector = [{ c: ['nested'] }];
    rule = root.rule(selector);
  });

  it('is empty', () => {
    expect(rule.empty).toBe(true);
  });

  describe('rules', () => {
    it('are empty', () => {
      expect(itsEmpty(rule.rules)).toBe(true);
    });
  });

  describe('read', () => {
    it('sends empty properties', async () => {
      expect(await receiveProperties(rule)).toEqual({});
    });
  });

  describe('nested', () => {

    let subSelector: StypSelector.Normalized;
    let subNested: StypRule;

    beforeEach(() => {
      subSelector = [{ c: ['sub-nested'] }];
      subNested = rule.rule(subSelector);
    });

    it('returns empty selector', () => {
      expect(subNested.empty).toBe(true);
    });
    it('returns itself when selector is empty', () => {
      expect(rule.rule({})).toBe(rule);
    });
    it('has the same root', () => {
      expect(subNested.root).toBe(root);
    });
    it('has nested selector', () => {
      expect(subNested.selector).toEqual([...selector, ...subSelector]);
    });
  });
});

function receiveProperties(rule: StypRule): Promise<StypProperties> {
  return new Promise(resolve => rule.read(resolve));
}
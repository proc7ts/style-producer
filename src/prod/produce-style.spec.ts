import { StypProperties, stypRoot, StypRule } from '../rule';
import { StyleProducer } from './style-producer';
import { produceStyle } from './produce-style';
import { AIterable, itsEmpty, itsFirst, overArray } from 'a-iterable';
import { trackValue } from 'fun-events';
import SpyInstance = jest.SpyInstance;

describe('produceStyle', () => {

  let root: StypRule;

  beforeEach(() => {
    root = stypRoot();
  });

  afterEach(() => {
    // Remove `<style>` elements
    AIterable.from(overArray(document.head.querySelectorAll('style'))).forEach(e => e.remove());
  });

  describe('document', () => {
    it('is current one by default', () => {

      const mockRender = jest.fn();

      produceStyle(
          root.rules,
          {
            render: mockRender,
            schedule: scheduleNow,
          });

      expect(mockRender).toHaveBeenCalledWith(
          expect.objectContaining({ document }),
          expect.anything(),
          expect.anything());
    });
  });

  describe('parent', () => {
    it('is document head by default', () => {

      const mockRender = jest.fn();

      produceStyle(
          root.rules,
          {
            render: mockRender,
            schedule: scheduleNow,
          });

      expect(mockRender).toHaveBeenCalledWith(
          expect.objectContaining({ parent: document.head }),
          expect.anything(),
          expect.anything());
    });
  });

  describe('default scheduler', () => {

    let rafSpy: SpyInstance<number, [FrameRequestCallback]>;
    let operations: ((time: number) => void)[];

    beforeEach(() => {
      operations = [];
      rafSpy = jest.spyOn(window, 'requestAnimationFrame');
      rafSpy.mockImplementation(callback => {
        operations.push(callback);
        return 0;
      });
    });

    it('schedules in animation frame', () => {
      produceStyle(root.rules);
      expect(rafSpy).toHaveBeenCalledWith(operations[0]);
    });
    it('schedules in current window animation frame for detached document', () => {

      const doc = document.implementation.createHTMLDocument();

      produceStyle(root.rules, { document: doc });
      expect(rafSpy).toHaveBeenCalledWith(operations[0]);
    });
  });

  it('renders body rule by default', () => {
    root.add({ background: 'white' });
    produceStyle(root.rules, { schedule: scheduleNow });
    expect(cssStyle('body').background).toBe('white');
  });
  it('renders top-level rule', () => {
    root.add({ background: 'white' });
    produceStyle(root.rules, { schedule: scheduleNow, rootSelector: '.root' });
    expect(cssStyle('.root').background).toBe('white');
  });
  it('renders rule', () => {
    root.addRule({ c: 'custom' }, { display: 'block' });
    produceStyle(root.rules, { schedule: scheduleNow });
    expect(cssStyle('.custom').display).toBe('block');
  });
  it('renders important properties', () => {
    root.addRule({ c: 'custom' }, { fontSize: '12px !important' });
    produceStyle(root.rules, { schedule: scheduleNow });

    const style = cssStyle('.custom');

    expect(style.getPropertyValue('font-size')).toBe('12px');
    expect(style.getPropertyPriority('font-size')).toBe('important');
  });
  it('renders raw CSS text', () => {
    root.addRule({ c: 'custom' }, 'font-size: 12px !important;');
    produceStyle(root.rules, { schedule: scheduleNow });

    const style = [...cssStyles('.custom')][1];

    expect(style.getPropertyValue('font-size')).toBe('12px');
    expect(style.getPropertyPriority('font-size')).toBe('important');
  });
  it('appends rule', () => {
    produceStyle(root.rules, { schedule: scheduleNow });
    root.addRule({ c: 'custom' }, { display: 'block' });
    expect(cssStyle('.custom').display).toBe('block');
  });
  it('updates rule', () => {

    const properties = trackValue<StypProperties>({ display: 'block' });

    root.addRule({ c: 'custom' }, properties);
    produceStyle(root.rules, { schedule: scheduleNow });
    properties.it = { display: 'inline-block' };

    expect(cssStyle('.custom').display).toBe('inline-block');
  });
  it('removes rule', () => {

    const rule = root.addRule({ c: 'custom' }, { display: 'block' });
    const interest = produceStyle(root.rules, { schedule: scheduleNow });
    const onDone = jest.fn();

    interest.whenDone(onDone);
    rule.remove();

    expect(onDone).not.toHaveBeenCalled();
    expect(itsEmpty(cssStyles('.custom'))).toBe(true);
  });
  it('does not re-renders too often', () => {

    const operations: (() => void)[] = [];
    const mockScheduler = jest.fn<void, [StyleProducer, () => void]>();

    mockScheduler.mockImplementation((producer, operation) => operations.push(operation));

    const mockRender = jest.fn();
    const properties = trackValue<StypProperties>({ display: 'block' });
    const rule = root.addRule({ c: 'custom' }, properties);

    produceStyle(rule.rules, { schedule: mockScheduler, render: mockRender });
    properties.it = { display: 'inline-block' };

    expect(operations).toHaveLength(2);

    operations.forEach(operation => operation());
    expect(mockRender).toHaveBeenCalledTimes(1);
  });
  it('removes styles when updates interest is lost', () => {

    const properties = trackValue<StypProperties>({ display: 'block' });

    root.addRule({ c: 'custom' }, properties);
    produceStyle(root.rules, { schedule: scheduleNow }).off();

    properties.it = { display: 'inline-block' };
    expect(itsEmpty(cssStyles())).toBe(true);
  });
});

function scheduleNow(producer: StyleProducer, operation: () => void) {
  // Do not schedule. Execute immediately instead.
  operation();
}

function cssStyle(selector: string): CSSStyleDeclaration {

  const style = itsFirst(cssStyles(selector));

  if (!style) {
    return fail(`Rule not found: ${selector}`);
  }

  return style;
}

function stylesheets(): AIterable<CSSStyleSheet> {
  return AIterable.from(overArray(document.styleSheets))
      .filter<CSSStyleSheet>(isCSSStyleSheet);
}

function cssStyles(selector?: string): AIterable<CSSStyleDeclaration> {
  return stylesheets()
      .flatMap(sheet => overArray(sheet.cssRules))
      .filter<CSSStyleRule>(isCSSStyleRule)
      .filter(r => !selector || r.selectorText === selector)
      .map(r => r.style);
}

function isCSSStyleSheet(sheet: StyleSheet): sheet is CSSStyleSheet {
  return 'cssRules' in sheet;
}

function isCSSStyleRule(rule: CSSRule): rule is CSSStyleRule {
  return rule.type === CSSRule.STYLE_RULE;
}

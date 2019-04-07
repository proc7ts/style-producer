import { StyleProducer } from './style-producer';
import { StypSelector } from '../selector';
import { StypProperties } from '../rule';
import { filterIt, itsEach, ObjectEntry, overEntries } from 'a-iterable';
import { IMPORTANT_CSS_SUFFIX } from '../internal';
import hyphenateStyleName from 'hyphenate-style-name';
import { appendCSSRule } from './render.impl';

/**
 * @internal
 */
export function stypRenderProperties(
    producer: StyleProducer,
    sheetOrRule: CSSStyleSheet | CSSRule,
    selector: StypSelector.Normalized,
    properties: StypProperties): void {

  const cssRule = appendCSSRule(sheetOrRule, selector) as CSSStyleRule;
  const { style } = cssRule;

  itsEach(
      filterIt<ObjectEntry<StypProperties>, [string, StypProperties.Value]>(
          overEntries(properties),
          notCustomProperty),
      ([key, value]) => {
        value = String(value);

        let priority: 'important' | undefined;

        if (value.endsWith('!important')) {
          priority = 'important';
          value = value.substring(0, value.length - IMPORTANT_CSS_SUFFIX.length).trim();
        }

        style.setProperty(hyphenateStyleName(key), value, priority);
      });

  producer.render(cssRule, selector, properties);
}

function notCustomProperty(entry: ObjectEntry<StypProperties>): entry is [string, StypProperties.Value] {
  return String(entry[0])[0] !== '$';
}

import { StyleProducer } from './style-producer';
import { StypProperties } from '../rule';

/**
 * Renders raw CSS text. I.e. the contents of `StypProperties.$$css` property.
 *
 * It should be rendered before CSS properties normally to add the rendered rule as a first one.
 *
 * Enabled by default in `produceStyle()` function.
 */
export function stypRenderText(producer: StyleProducer, properties: StypProperties) {

  const css = properties.$$css;

  if (!css) {
    producer.render(properties);
  } else {

    const cssRule = producer.addRule() as CSSStyleRule;

    cssRule.style.cssText = css;
    producer.render(properties, { target: cssRule });
  }
}
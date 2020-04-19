/**
 * @packageDocumentation
 * @module @proc7ts/style-producer
 */
import { NamespaceAliaser } from '@proc7ts/namespace-aliaser';
import { RenderScheduler } from '@proc7ts/render-scheduler';
import { StypSelector } from '../selector';
import { StypRenderer } from './renderer';
import { StyleProducer } from './style-producer';
import { StypWriter } from './writer';

/**
 * Options for {@link StypFormat CSS style production format}.
 *
 * @category Rendering
 */
export interface StypFormatOptions {

  /**
   * A selector to use for root CSS rule.
   *
   * `body` by default.
   *
   * For custom elements a `:host` selector would be more appropriate.
   */
  readonly rootSelector?: StypSelector;

  /**
   * DOM rendering operations scheduler.
   *
   * Creates a render schedule per rule.
   *
   * Uses `newRenderSchedule` by default.
   */
  readonly scheduler?: RenderScheduler;

  /**
   * Renderer or renderer chain to use.
   */
  readonly renderer?: StypRenderer | readonly StypRenderer[];

  /**
   * Namespace aliaser to use.
   *
   * New instance will be created if not specified.
   */
  readonly nsAlias?: NamespaceAliaser;

}

/**
 * CSS styles production format.
 *
 * Accepted by {@link produceStyle} function.
 *
 * The following formats supported by `style-producer`:
 * - {@link stypObjectFormat} - creates a `<style>` element per CSS rule and utilizes CSS object model to build its
 *   style sheet.
 *
 * @category Rendering
 */
export interface StypFormat extends StypFormatOptions {

  /**
   * Creates CSS style sheet writer.
   *
   * This method is called once per each CSS rule.
   *
   * @param producer  Style producer instance.
   *
   * @returns CSS style sheet writer.
   */
  addSheet(producer: StyleProducer): StypWriter.Sheet;

}

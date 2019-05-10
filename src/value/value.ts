import { IMPORTANT_CSS_SUFFIX } from '../internal';
import { StypNumeric } from './numeric';

/**
 * CSS property value.
 *
 * This is either scalar value, or structured one.
 */
export type StypValue =
    string | number | boolean | undefined
    | StypNumeric<any>;

/**
 * Structured property CSS value. E.g. [<length>], [<percentage>], [<color>], etc.
 *
 * @typeparam Self A type of itself.
 *
 * [<length>]: https://developer.mozilla.org/en-US/docs/Web/CSS/length
 * [<percentage>]: https://developer.mozilla.org/en-US/docs/Web/CSS/percentage
 * [<color>]: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
 */
export abstract class StypValueStruct<Self extends StypValueStruct<Self>> {

  /**
   * A type of structured CSS property value.
   */
  abstract type: string;

  /**
   * CSS property value priority. E.g. whether it is `!important`.
   */
  readonly priority: 'important' | undefined;

  /**
   * Constructs structured CSS property value.
   *
   * @param opts Construction options.
   */
  protected constructor(opts?: StypValueOpts) {
    this.priority = opts && opts.priority;
  }

  /**
   * Checks whether this value equals to CSS property value.
   *
   * @param other CSS property value to compare with.
   */
  abstract is(other: StypValue): boolean;

  /**
   * Creates structured CSS value with the given `priority`.
   *
   * @param priority New priority.
   *
   * @returns Either a new value equal to this one but having the given `priority`, or this one if `priority` did
   * not change.
   */
  abstract prioritize(priority: 'important' | undefined): Self;

  /**
   * Creates `!important` variant of this value.
   *
   * @returns Either a new value equal to this one but having `important` priority, or this one if already the case.
   */
  important(): Self {
    return this.prioritize('important');
  }

  /**
   * Creates usual (not `!important`) variant of this value.
   *
   * @returns Either a new value equal to this one but having `undefined` priority, or this one if already the case.
   */
  usual(): Self {
    return this.prioritize(undefined);
  }

  /**
   * Returns textual representation of this value.
   *
   * @returns A textual representation of this value to use as CSS property value.
   */
  abstract toString(): string;

}

/**
 * Construction options of structured property CSS value.
 */
export interface StypValueOpts {

  /**
   * Constructed value priority.
   */
  readonly priority?: 'important';

}

/**
 * Splits the given CSS property value onto value non-prioritized value and priority.
 *
 * @param value CSS property value to split.
 *
 * @returns A tuple containing the value and priority.
 */
export function stypSplitPriority<T extends StypValue>(value: T): readonly [T?, 'important'?] {
  if (value == null) {
    return [];
  }

  switch (typeof value) {
    case 'object':

      const priority = value.priority;

      return priority ? [value.usual() as T, priority] : [value];
    case 'string':
      if (value.endsWith(IMPORTANT_CSS_SUFFIX)) {
        return[value.substring(0, value.length - IMPORTANT_CSS_SUFFIX.length).trim() as T, 'important'];
      }
  }

  return [value];
}

/**
 * Checks whether two CSS property values are equal.
 *
 * Compares scalar values verbatim. Compares structured values using their `StypValueStruct.is()` method. The latter
 * method is applied when at least one of the values is structured.
 *
 * @param first The first CSS property value to compare.
 * @param second The second CSS property value to compare.
 *
 * @returns `true` if `first` equals to `second`, or `false otherwise.
 */
export function stypValuesEqual(first: StypValue, second: StypValue): boolean {
  if (first === second) {
    return true;
  }
  if (typeof first === 'object') {
    return first.is(second);
  }
  if (typeof second === 'object') {
    return second.is(first);
  }
  return false;
}
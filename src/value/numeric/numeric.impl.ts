import { StypPriority } from '../priority';
import { StypValue, stypValuesEqual } from '../value';
import {
  StypAddSub as StypAddSub_,
  StypDimension as StypDimension_,
  StypMulDiv as StypMulDiv_,
  StypNumeric,
  StypNumericStruct
} from './numeric';
import { StypZero } from './zero';

/**
 * @internal
 */
export class StypDimension<Unit extends string>
    extends StypNumericStruct<StypDimension<Unit>, Unit>
    implements StypDimension_<Unit> {

  // noinspection JSMethodCanBeStatic
  get type(): 'dimension' {
    return 'dimension';
  }

  /**
   * The number value.
   */
  readonly val: number;

  /**
   * The unit.
   */
  readonly unit: Unit;

  /**
   * Constructs new structured dimension value.
   *
   * @param val The numeric value.
   * @param unit The unit.
   * @param opts CSS value options.
   */
  constructor(val: number, unit: Unit, opts: StypDimension_.Opts<Unit>) {
    super(opts);
    this.val = val;
    this.unit = unit;
  }

  toDim<U extends string>(dim: StypDimension_.Kind<U>): StypDimension_<U> | undefined {

    const thisDim: StypDimension_.Kind<any> = this.dim;

    if (dim === thisDim /* same dimension */
        || dim === thisDim.pt /* !% to compatible +% */
        || dim === (this.unit === '%' ? dim.pt /* % to any +% */ : thisDim.noPt /* !% to compatible -% */)) {
      return this as StypDimension_<any>;
    }

    return;
  }

  is(other: StypValue): boolean {
    if (other === this) {
      return true;
    }
    return typeof other === 'object'
        && other.type === this.type
        && this.unit === other.unit
        && this.val === other.val
        && this.priority === other.priority;
  }

  prioritize(priority: number): StypDimension<Unit> {
    return this.priority === priority
        ? this
        : new StypDimension(this.val, this.unit, { dim: this.dim, priority });
  }

  add(addendum: StypNumeric<Unit>): StypNumeric<Unit>;

  add(addendum: number, unit?: Unit): StypNumeric<Unit>;

  add(addendum: StypNumeric<Unit> | number, unit?: Unit): StypNumeric<Unit> {
    if (typeof addendum === 'number') {
      addendum = stypDimension(addendum, unit || this.unit, this);
    }
    if (addendum.type === 'dimension' && this.unit === addendum.unit) {
      return stypDimension(this.val + addendum.val, this.unit, this);
    }
    return stypAddSub(this, '+', addendum);
  }

  sub(subtrahend: StypNumeric<Unit>): StypNumeric<Unit>;

  sub(subtrahend: number, unit?: Unit): StypNumeric<Unit>;

  sub(subtrahend: StypNumeric<Unit> | number, unit?: Unit): StypNumeric<Unit> {
    if (typeof subtrahend === 'number') {
      subtrahend = stypDimension(subtrahend, unit || this.unit, this);
    }
    if (subtrahend.type === 'dimension' && this.unit === subtrahend.unit) {
      return stypDimension(this.val - subtrahend.val, this.unit, this);
    }
    return stypAddSub(this, '-', subtrahend);
  }

  mul(multiplier: number): StypNumeric<Unit> {
    return multiplier === 1 ? this : stypDimension(this.val * multiplier, this.unit, this);
  }

  div(divisor: number): StypNumeric<Unit> {
    return divisor === 1 ? this : stypDimension(this.val / divisor, this.unit, this);
  }

  negate(): StypNumeric<Unit> {
    return stypDimension(-this.val, this.unit, this);
  }

  /**
   * Returns a textual representation of this value to be used within CSS `calc()` function.
   *
   * @returns `<value><unit>` or just `0`.
   */
  toFormula(): string {
    return this.val + this.unit;
  }

}

/**
 * Constructs structured [dimension] CSS property value.
 *
 * @param val Numeric value.
 * @param unit Value unit.
 * @param opts Construction options.
 *
 * @returns Either [[StypDimension]], or [[StypZero]] if `val === 0`.
 *
 * [dimension]: https://developer.mozilla.org/en-US/docs/Web/CSS/dimension
 *
 * @internal
 */
export function stypDimension<Unit extends string>(
    val: number,
    unit: Unit,
    opts: StypDimension_.Opts<Unit>): StypDimension_<Unit> | StypZero<Unit> {
  return val
      ? new StypDimension<Unit>(val, unit, opts)
      : opts.dim.zero.prioritize(opts.priority || StypPriority.Default);
}

/**
 * @internal
 */
export abstract class StypCalcBase<
    Self extends StypCalcBase<Self, Op, Right, Unit>,
    Op extends '+' | '-' | '*' | '/',
    Right extends number | StypNumeric<Unit>,
    Unit extends string>
    extends StypNumericStruct<Self, Unit> {

  // noinspection JSMethodCanBeStatic
  get type(): 'calc' {
    return 'calc';
  }

  readonly left: StypNumeric<Unit>;
  readonly op: Op;
  readonly right: Right;

  // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
  constructor(
      left: StypNumeric<Unit>,
      op: Op,
      right: Right,
      opts: StypDimension_.Opts<Unit>) {
    super(opts);
    this.left = left.usual();
    this.op = op;
    this.right = right;
  }

  is(other: StypValue): boolean {
    if (this === other) {
      return true;
    }
    if (typeof other === 'object' && other.type === this.type) {
      return this.op === other.op
          && this.left.is(other.left)
          && stypValuesEqual(this.right, other.right)
          && this.priority === other.priority;
    }
    return false;
  }

  add(addendum: StypNumeric<Unit>): StypNumeric<Unit>;

  add(addendum: number, unit: Unit): StypNumeric<Unit>;

  add(addendum: StypNumeric<Unit> | number, unit?: Unit): StypNumeric<Unit> {
    if (typeof addendum === 'number') {
      addendum = stypDimension(addendum, unit as Unit, this);
    }
    return stypAddSub(this as StypNumeric<Unit>, '+', addendum);
  }

  sub(subtrahend: StypNumeric<Unit>): StypNumeric<Unit>;

  sub(subtrahend: number, unit: Unit): StypNumeric<Unit>;

  sub(subtrahend: StypNumeric<Unit> | number, unit?: Unit): StypNumeric<Unit> {
    if (typeof subtrahend === 'number') {
      subtrahend = stypDimension(subtrahend, unit as Unit, this);
    }
    return stypAddSub(this as StypNumeric<Unit>, '-', subtrahend);
  }

  mul(multiplier: number): StypNumeric<Unit> {
    return stypMul(this as StypNumeric<Unit>, multiplier);
  }

  div(divisor: number): StypNumeric<Unit> {
    return stypDiv(this as StypNumeric<Unit>, divisor);
  }

  abstract negate(): StypNumeric<Unit>;

  abstract prioritize(priority: number): Self;

  abstract toFormula(): string;

  toString() {
    return 'calc' + super.toString();
  }

}

/**
 * CSS `calc()` function call representation containing either addition or subtraction.
 *
 * @typeparam Unit Allowed unit type.
 *
 * @internal
 */
export class StypAddSub<Unit extends string>
    extends StypCalcBase<StypAddSub<Unit>, '+' | '-', StypNumeric<Unit>, Unit>
    implements StypAddSub_<Unit> {

  constructor(left: StypNumeric<Unit>, op: '+' | '-', right: StypNumeric<Unit>, opts: StypDimension_.Opts<Unit>) {
    super(left, op, right.usual(), opts);
  }

  prioritize(priority: number): StypAddSub<Unit> {
    return this.priority === priority
        ? this
        : new StypAddSub(this.left, this.op, this.right, { dim: this.dim, priority });
  }

  toDim<U extends string>(dim: StypDimension_.Kind<U>): StypAddSub<U> | undefined {

    const left = this.left.toDim(dim);

    if (!left) {
      return;
    }

    const right = this.right.toDim(dim);

    if (!right) {
      return;
    }

    if (left === this.left as StypNumeric<any> && right === this.right as StypNumeric<any>) {
      return this as StypAddSub<any>;
    }

    return new StypAddSub<U>(left, this.op, right, { dim, priority: this.priority });
  }

  negate(): StypNumeric<Unit> {
    return this.op === '-'
        ? new StypAddSub(this.right, this.op, this.left, this)
        : new StypAddSub(this.left.negate(), '-', this.right, this);
  }

  /**
   * Returns a textual representation of this value to be used within CSS `calc()` function.
   *
   * @returns `(<left> <op> <right>)`.
   */
  toFormula(): string {
    return `(${this.left.toFormula()} ${this.op} ${this.right.toFormula()})`;
  }

}

function stypAddSub<Unit extends string>(
    left: StypNumeric<Unit>,
    op: '+' | '-',
    right: StypNumeric<Unit>): StypNumeric<Unit> {
  return !right.type ? left : new StypAddSub(left, op, right, left);
}

/**
 * CSS `calc()` function call representation containing either multiplication or division.
 *
 * @typeparam Unit Allowed unit type.
 *
 * @internal
 */
export class StypMulDiv<Unit extends string>
    extends StypCalcBase<StypMulDiv<Unit>, '*' | '/', number, Unit>
    implements StypMulDiv_<Unit> {

  prioritize(priority: number): StypMulDiv<Unit> {
    return this.priority === priority
        ? this
        : new StypMulDiv(this.left, this.op, this.right, { dim: this.dim, priority });
  }

  toDim<U extends string>(dim: StypDimension_.Kind<U>): StypMulDiv<U> | undefined {

    const left = this.left.toDim(dim);

    if (!left) {
      return;
    }

    if (left === this.left as StypNumeric<any>) {
      return this as StypMulDiv<any>;
    }

    return new StypMulDiv<U>(left, this.op, this.right, { dim, priority: this.priority });
  }

  mul(multiplier: number): StypNumeric<Unit> {
    return (this.op === '*'
        ? stypMul(this.left, this.right * multiplier)
        : stypDiv(this.left, this.right / multiplier))
        .prioritize(this.priority);
  }

  div(divisor: number): StypNumeric<Unit> {
    return (this.op === '/'
        ? stypDiv(this.left, this.right * divisor)
        : stypMul(this.left, this.right / divisor))
        .prioritize(this.priority);
  }

  negate(): StypNumeric<Unit> {
    return new StypMulDiv(this.left, this.op, -this.right, this);
  }

  /**
   * Returns a textual representation of this value to be used within CSS `calc()` function.
   *
   * @returns `(<left> <op> <right>)`.
   */
  toFormula(): string {
    return `(${this.left.toFormula()} ${this.op} ${this.right})`;
  }

}

function stypMul<Unit extends string>(left: StypNumeric<Unit>, right: number): StypNumeric<Unit> {
  return !right
      ? left.dim.zero.prioritize(left.priority)
      : right === 1
          ? left.prioritize(left.priority)
          : new StypMulDiv(left, '*', right, left);
}

function stypDiv<Unit extends string>(left: StypNumeric<Unit>, right: number): StypNumeric<Unit> {
  return right === 1
      ? left.prioritize(left.priority)
      : new StypMulDiv(left, '/', right, left);
}

/**
 * @internal
 */
export function isStypNumeric(source: StypValue): source is StypNumeric<any, any> {
  return typeof source === 'object' && (source.type === 'dimension' || source.type === 'calc' || source.type === 0);
}

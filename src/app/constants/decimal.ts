import Decimal from 'decimal.js';

export class DecimalUtils {
  static DEFAULT_PRECISION: number = 34;
  static initializeDecimalLibrary() {
    Decimal.set({ precision: DecimalUtils.DEFAULT_PRECISION, rounding: Decimal.ROUND_HALF_UP });
  }
  static multiply(value1: Decimal.Value, value2: Decimal.Value): Decimal {
    const multi = new Decimal(this.valueOf(value1 ? value1 : 0)).times(this.valueOf(value2 ? value2 : 0));
    return multi.toDP(this.getPrecision(multi));
  }


  //static multiplyWithPrecision(value1: Decimal.Value, value2: Decimal.Value, precision: number): Decimal {
  // return new Decimal(value1).times(new Decimal(value2)).toDP(precision);
  //}

  static add(value1: Decimal.Value, value2: Decimal.Value): Decimal {
    const added = new Decimal(this.valueOf(value1 ? value1 : 0)).plus(this.valueOf(value2 ? value2 : 0));
    return added.toDP(this.getPrecision(added));
  }

  static subtract(value1: Decimal.Value, value2: Decimal.Value): Decimal {
    const sub = new Decimal(this.valueOf(value1 ? value1 : 0)).minus(this.valueOf(value2 ? value2 : 0));
    return sub.toDP(this.getPrecision(sub));
  }

  static divide(value1: Decimal.Value, value2: Decimal.Value): Decimal {
    const div = new Decimal(this.valueOf(value1 ? value1 : 0)).dividedBy(this.valueOf(value2 ? value2 : 0));
    return div.toDP(this.getPrecision(div, 'divide'));
  }
  static divideForProduct(value1: Decimal.Value, value2: Decimal.Value): Decimal {
    const div = new Decimal(this.valueOf(value1 ? value1 : 0)).dividedBy(this.valueOf(value2 ? value2 : 0));
    return div.toDP(this.getPrecision(div));
  }
  static valueOf(value: Decimal.Value): Decimal {
    return new Decimal(value).toDP(this.getPrecision(value));
  }

  static equals(value1: Decimal.Value, value2: Decimal.Value): boolean {
    return new Decimal(this.valueOf(value1)).eq(this.valueOf(value2));
  }

  static notEquals(value1: Decimal.Value, value2: Decimal.Value): boolean {
    return !new Decimal(this.valueOf(value1)).eq(this.valueOf(value2));
  }
  static greaterThan(value1: Decimal.Value, value2: Decimal.Value): boolean {
    // a>b
    return new Decimal(this.valueOf(value1 ? value1 : 0)).gt(this.valueOf(value2 ? value2 : 0));
  }
  static greaterThanOrEqual(value1: Decimal.Value, value2: Decimal.Value): boolean {
    // a>=b
    return new Decimal(this.valueOf(value1 ? value1 : 0)).gte(this.valueOf(value2) ? value2 : 0);
  }
  static lessThan(value1: Decimal.Value, value2: Decimal.Value): boolean {
    // a<b
    return new Decimal(this.valueOf(value1 ? value1 : 0)).lt(this.valueOf(value2 ? value2 : 0));
  }
  static lessThanOrEqual(value1: Decimal.Value, value2: Decimal.Value): boolean {
    // a<=b
    return new Decimal(this.valueOf(value1 ? value1 : 0)).lte(this.valueOf(value2 ? value2 : 0));
  }
  // static showLimitedThreeDecimal(value1: any): any {
  //   const [beforeDot, afterDot] = value1.toString().split('.');
  //   const afterDotTrimmed = afterDot.slice(0, 3);
  //   return beforeDot + '.' + afterDotTrimmed;
  // }
  static showLimitedDecimals(value1: any): any {
    if (value1.toString().includes('.')) {
      const [beforeDot, afterDot] = value1.toString().split('.');
      const afterDotTrimmed = afterDot.slice(0, 2);
      return beforeDot + '.' + afterDotTrimmed;
    }
    else {
      return value1;
    }
  }
  static enterLimitedDecimals(value1: any, precision?): any {
    if (value1.toString().includes('.')) {
      const [beforeDot, afterDot] = value1.toString().split('.');
      const afterDotTrimmed = afterDot.slice(0, (precision ? precision : 3));
      return beforeDot + '.' + afterDotTrimmed;
    }
    else {
      return value1;
    }
  }
  static fixedDecimal(value: Decimal.Value, afterDigit: number): any {
    return new Decimal(value).toFixed(afterDigit);
  }
  static getPrecision(value1, divide?) {
    let prec = divide ? 34 : 20;
    if (value1.toString().length > prec) {
      if (value1.toString().includes('.')) {
        const [beforeDot, afterDot] = value1.toString().split('.');
        return (prec - (beforeDot.length + 1))
      }
      else {
        return prec;
      }
    }
    else {
      return prec;
    }
  }
}

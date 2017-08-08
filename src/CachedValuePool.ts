export class CachedValuePool {
  public tick = 0;
  newValue(getter) {
    var cachedValue = new CachedValue(this, getter);
    return cachedValue;
  }

  clear() {
    this.tick++;
  }
}

class CachedValue {
  public _value;
  public _tick;
  public getter;
  constructor(private pool: CachedValuePool, private _getter) {
    this._tick = pool.tick;
    this.getter = () => this.get();
    this._value = this._getter();
  }

  get() {
    if (this._tick == this.pool.tick) {
      return this._value;
    }
    else {
      this._tick = this.pool.tick;
      return this._value = this._getter();
    }
  }
}

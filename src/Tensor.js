{
	'use strict';

	const Tensor = function Tensor(components) {
		if(!(this instanceof Tensor)) {
			return new Tensor(...arguments);
		}
		if(arguments.length) {
			if(typeof components[Symbol.iterator] === 'function') {
				this.push(...components.map(Tensor));
				if(this.length) {
					const dimension = this[0].dimension;
					if(this.some(component =>
						component.dimension.length !== dimension.length ||
						component.dimension.some((rank, i) => rank !== dimension[i])
					)) {
						throw new RangeError('Unequal dimensions');
					}
				}
			} else {
				return new Scalar(components);
			}
		}
	};
	Tensor.prototype = {
		__proto__: Array.prototype,
	};
	Object.defineProperty(Tensor.prototype, 'dimension', {
		get() {
			return [this.length, ...(this.length ? this[0].dimension : [])];
		}
	});

	const Scalar = function Scalar(value) {
		if(!(this instanceof Scalar)) {
			return new Scalar(...arguments);
		}
		this.value = isNaN(value) ? 0 : +value;
	};
	Scalar.prototype = {
		__proto__: Tensor.prototype,
		dimension: [],
		toValue() {
			return this.value;
		},
	};

	window['Tensor'] = Tensor;
}
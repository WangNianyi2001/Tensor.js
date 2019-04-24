{
	'use strict';

	const dimensionIsEqual = (a, b) =>
		a.length === b.length &&
		a.every((rank, i) => rank === b[i]);

	const Tensor = function Tensor(components) {
		if(!(this instanceof Tensor)) {
			return new Tensor(...arguments);
		}
		if(arguments.length) {
			if(typeof components[Symbol.iterator] === 'function') {
				this.push(...components.map(Tensor));
				if(this.length) {
					const dimension = this[0].dimension;
					if(this.some(component => !dimensionIsEqual(dimension, component.dimension))) {
						throw new RangeError('Tensor components have unequal dimensions');
					}
				}
			} else {
				return new Scalar(components);
			}
		}
	};
	Tensor.prototype = {
		__proto__: Array.prototype,
		toString() {
			return `[${this.join()}]`;
		},
		plus(tensor) {
			if(!(tensor instanceof Tensor)) {
				tensor = new Tensor(tensor);
			}
			if(!dimensionIsEqual(this.dimension, tensor.dimension)) {
				throw new RangeError('Cannot plus tensors with unequal dimensions together');
			}
			return new Tensor(this.map((component, i) => component.plus(tensor[i])));
		},
		scale(ratio) {
			return new Tensor(this.map(component => component.scale(ratio)));
		},
		product(tensor) {
			if(!(tensor instanceof Tensor)) {
				tensor = new Tensor(tensor);
			}
			return tensor instanceof Scalar
				? this.scale(tensor.scale)
				: new Tensor(this.map(component => component.product(tensor)));
		},
		dot(tensor) {
			if(!(tensor instanceof Tensor)) {
				tensor = new Tensor(tensor);
			}
			return this.reduce((sum, component) => sum + component.dot(tensor), 0);
		},
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
		[Symbol.iterator]: undefined,
		dimension: [],
		valueOf() {
			return this.value;
		},
		toString() {
			return this.value + '';
		},
		plus(scalar) {
			return new Scalar(this + scalar);
		},
		scale(ratio) {
			return new Scalar(this.value * ratio);
		},
		product(tensor) {
			if(!(tensor instanceof Tensor)) {
				tensor = new Tensor(tensor);
			}
			return tensor.scale(this.value);
		},
		dot(tensor) {
			if(!(tensor instanceof Tensor)) {
				tensor = new Tensor(tensor);
			}
			return new Scalar(
				tensor instanceof Scalar
					? this * tensor
					: tensor.reduce((sum, component) => sum + this.dot(component), 0)
			)
		},
	};

	window['Tensor'] = Tensor;
}
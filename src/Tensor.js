{
	'use strict';

	const Tensor = function Tensor(components) {
		if(!(this instanceof Tensor)) {
			return new Tensor(...arguments);
		}
		if(!arguments.length) {
			throw new ReferenceError('No arguments received');
		}
		if(typeof components[Symbol.iterator] === 'function') {
			this.push(...components.map(Tensor));
			if(this.length) {
				if(this.some(component => !this[0].hasSameDimension(component))) {
					throw new RangeError('Tensor components have unequal dimensions');
				}
			}
		} else {
			return new Scalar(components);
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
			if(!this.hasSameDimension(tensor)) {
				throw new RangeError('Cannot plus tensors with unequal dimensions together');
			}
			return new Tensor(this.map((component, i) => component.plus(tensor[i])));
		},
		scale(ratio) {
			return new Tensor(this.map(component => component.scale(ratio)));
		},
		outer(tensor) {
			if(!(tensor instanceof Tensor)) {
				tensor = new Tensor(tensor);
			}
			return tensor instanceof Scalar
				? this.scale(tensor.scale)
				: new Tensor(this.map(component => component.outer(tensor)));
		},
		inner(tensor) {
			if(!(tensor instanceof Tensor)) {
				tensor = new Tensor(tensor);
			}
			if(tensor instanceof Scalar) {
				return this.scale(tensor);
			}
			if(!this.dimensionallyContains(tensor)) {
				throw TypeError('Dotter does not dimensionally contains dottee');
			}
			return this.reduce((sum, component, i) => {
				return sum.plus(component.inner(tensor[i]));
			}, Tensor.zero(this.dimensions.slice(tensor.dimensions.length)));
		},
		dimensionallyContains(tensor) {
			return tensor.dimensions.every(
				(dimension, i) => dimension === this.dimensions[i]
			);
		},
		hasSameDimension(tensor) {
			return (
				this.dimensions.length === tensor.dimensions.length &&
				this.dimensionallyContains(tensor)
			);
		},
	};
	Object.defineProperty(Tensor.prototype, 'dimensions', {
		get() {
			return [this.length, ...(this.length ? this[0].dimensions : [])];
		}
	});
	Tensor.zero = function(dimensions) {
		if(dimensions.length === 0) {
			return new Scalar(0);
		}
		return new Tensor(Array(dimensions.shift()).fill(0).map(() => Tensor.zero(dimensions)));
	};
	window['Tensor'] = Tensor;

	const Scalar = function Scalar(value) {
		if(!(this instanceof Scalar)) {
			return new Scalar(...arguments);
		}
		this.value = isNaN(value) ? 0 : +value;
	};
	Scalar.prototype = {
		__proto__: Tensor.prototype,
		[Symbol.iterator]: undefined,
		dimensions: [],
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
		outer(tensor) {
			if(!(tensor instanceof Tensor)) {
				tensor = new Tensor(tensor);
			}
			return tensor.scale(this.value);
		},
		inner(scalar) {
			if(!(scalar instanceof Scalar)) {
				throw TypeError('Dotter does not dimensionally contains dottee');
			}
			return new Scalar(this.scale(scalar));
		},
		dimensionallyContains(tensor) {
			return tensor instanceof Scalar;
		},
		hasSameDimension(tensor) {
			return tensor instanceof Scalar;
		},
	};
	Tensor['Scalar'] = Scalar;

	const Vector = function Vector(elements) {
		if(!(this instanceof Vector)) {
			return new Vector(...arguments);
		}
		if(!arguments.length) {
			throw new ReferenceError('No arguments received');
		}
		this.push(...elements.map(Scalar));
	};
	Vector.prototype = {
		__proto__: Tensor.prototype,
	};
	Object.defineProperty(Vector.prototype, 'dimensions', {
		get() {
			return [this.length];
		}
	});
	Tensor['Vector'] = Vector;
}
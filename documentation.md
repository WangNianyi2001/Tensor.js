# Documentation of Tensor.js


## Creating a tensor

To create a tensor, use the global constructor function `Tensor`.
This function is written in the safe-factory mode, which means that you can
either call it directly or with the keyword `new`.

Pass data directly to create tensors literally.
For instance, you can do the following:
```js
const scalar = new Tensor(0);
const vector = new Tensor([0, 1, 2]);
const matrix = new Tensor([
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
]);
```
As you might be confused about whether to pass the components of a tensor
individually or that you should group them together, just keep in mind that
this constructor treats its argument as a single tensor.
Thus, it is not valid to break the components apart.

You can also pass an existing tensor instance to get a deep copy of it.
Modifying the components of a copy would not affect the original.

Note that this constructor is recursive, so it is possible to make a nested
call:
```js
const scalar = new Tensor(4);
const vector = new Tensor([0, 1, 2]);
const matrix = new Tensor([
	vector,
	[3, scalar ,5],
	[6, 7, 8],
]);
```
However, the dimensions (also the ranks) of each parallel components must be
same, trying to construct a tensor with components with unequal dimensions
would lead to a range error.
This restriction comes from some dope mathematical principles.
For further reading, please checkout relevant articles on
[Wikipedia](https://en.wikipedia.org/wiki/Tensor).


## Processing scalars

Scalars are treated a bit of differently from normal tensors, since they are
some sort of "edge cases" in the world of tensors (they are atomic).
A function called `Scalar` is created to solve the case.
It is derived from `Tensor` (in the sense of prototype chain), so applying
`instanceof Tensor` on a scalar instance would always return `true`.
It would be automatically invoked when calling `Tensor` with a single scalar
passed in, so there is no need to call it explicitly.


## Doing arithmetic operations

There are 4 operations defined as "arithmetic" for tensors: plus, scale, dot & product.

### Plus

This operation adds 2 tensors together.
As the result, each of their corresponding elements are added together
numerically.

The input tensors must have same dimensions.

Usage:
```js
const result = a.plus(b);
```

### Scale

This operation scales a tensor by a scalar factor.
As the result, each of its elements are multiplied by the scalar.

```js
const result = tensor.scale(scalar);
```

### Inner

This operation takes 2 inputs, called `a` and `b`.
It operates recursively on each pairs of corresponding
components of `a` and `b`, and adds them up.
Innering a tensor by a scalar is equivalent to scaling.

The `a`'s dimensions must sequentially contains the `b`'s dimensions.
The dimensions of their result is the complement of the `b`'s on the `a`'s.

```js
const result = a.inner(b);
```

### Outer

This operation takes 2 tensor inputs, called `a` and `b`.
It transforms each of the `a`'s elements into `b` scaled by it.

The result's dimensions are the concatenation of `a`'s and `b`'s.

Usage:
```js
const result = a.outer(b);
```


## Indexing

To index for certain sub-component of a tensor, you can simply apply the same
grammar as indexing an array on a tensor.
```js
const tensor = new Tensor([
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
]);
const vector = tensor[1];	// [3, 4, 5]
const scalar = vector[1];	// 4
```
If you're not sure about the dimension of a certain tensor, you can use
`tensor.dimension` to have a check.
```js
const tensor = new Tensor([
	[0, 1, 2],
	[3, 4, 5],
]);
const dimensions = tensor.dimensions;	// [2, 3]
```

## Conversion & formatting

This library provides a `toString` function for tensors.
Its output would be like `[a,b,c]`, where `a`, `b` and `c` are the recursive
expansions of its components.

For addition, `valueOf` is also defined for scalars.
The output of it is just the actual value of the scalar.
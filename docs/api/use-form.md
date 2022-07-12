# useForm

`useForm()` is a custom Vue composition api that will return all Vue Composition Form state and helpers directly.

```ts
useForm({
  initialValues: {},
  initialErrors: undefined,
  validateMode: 'submit',
  reValidateMode: 'change',
  validateOnMounted: false,
  validate() {},
  onSubmit(values, submitHelper) {},
  onError() {},
})
```

## Options

### initialValues (Required)

This is the form initial value, is required.

- Type

```ts
type Values = Record<string, any>
```

### `initialErrors`

This is the form initial error.

- Type `FormErrors<Values>`

### validateMode

This option allows you to configure the validation strategy **before** first submit.

- Type `'blur' | 'input' | 'change' | 'submit'`
- Default `'submit'`

### reValidateMode

This option allows you to configure the validation strategy **after** first submit.

- Type `'blur' | 'input' | 'change' | 'submit'`
- Default `'change'`

### validateOnMounted

This option allows you to configure the validation run when the component is mounted.

- Type `boolean`
- Default `false`

### validate

This function allows you to write your logic to validate your form, this is optional.  

- Type `(values: Values) => void | object | Promise<FormErrors<Values>>`

### onSubmit (Required)

This is your form submission handler. It is passed your forms `values`. If has validation error, this will not be invoked.

- Type `(values: Values, helper: FormSubmitHelper) => void | Promise<any>`

::: warning Note
If `onSubmit()` function is synchronous, you need to call `setSubmitting(false)` yourself.
:::

### onError

This is error callback, this be called when you submit form but validation error. This is optional.

- Type `(errors: FormErrors<Values>) => void`

## Returns

### values

Current form values.

- Type `DeepReadonly<Values>`

### errors

Map of field name to the field has been touched.

- Type `ComputedRef<FormErrors<Values>>`

### touched

Map of field name to specific error for that field.

- Type `ComputedRef<FormTouched<Values>>`

### dirty

Return `true` if current values are not deeply equal `initialValues`.

- Type `ComputedRef<boolean>`

### setValues

This function allows you to dynamically update form values.

- Type `(values: Values, shouldValidate?: boolean)`

### setFieldValue

This function allows you to dynamically set the value of field.  

- Type `(name: string, value: unknown, shouldValidate?: boolean)`

### submitCount

The number of times user attempted to submit.

- Type `ComputedRef<number>`

### isSubmitting

Return `true` when form is submitting, If `onSubmit()` is a synchronous function, then you need to call setSubmitting(false) on your own.

- Type `Ref<boolean>`

### isValidating

Return `true` when running validation.

- Type `ComputedRef<boolean>`

### register

This method allows you to get specific field values, meta (state) and attributes, you can also add validation for that field.

- Type

`(name: string, options?: FieldRegisterOptions<Values>) => UseFormRegisterReturn`

```ts
interface FieldRegisterOptions<Values> {
  validate?: FieldValidator<Values>;
}

type FieldValidator<Value> = (
  value: Value,
) => string | void | Promise<string | void>

type UseFormRegisterReturn<Value> =  {
  value: WritableComputedRef<Value>;
  dirty: ComputedRef<boolean>;
  error: ComputedRef<string>;
  touched: ComputedRef<boolean>;
  attrs: {
    name: string
    onBlur: () => void;
    onChange: () => void;
  };
}
```

### handleSubmit

Submit handler.

- Type `(event?: Event) => void`

### handleReset

Reset handler.

- Type `(event?: Event) => void`

### validateForm

Validate form values.

- Type `(values?: Values) => Promise<FormErrors<Values>>`

### validateField

Validate form specific field, if this field validation is register.

- Type `(name: string) => Promise<void>`

## Example

```vue
<script setup lang="ts">
import { useForm } from '@vue-composition-form/core'

interface InitialValues {
  drink: string,
  sugar: number
  ice: string
  bag: boolean
}

const { errors, dirty, register, handleSubmit, handleReset } = useForm<InitialValues>({
  initialValues: {
    drink: '',
    sugar: 30,
    ice: 'light',
    bag: false
  },
  validate (values) {
    const errors: Record<string, any> = {}

    if (!values.drink) {
      errors.drink = 'This is required!!'
    }

    return errors
  },

  validateMode: 'submit',
  reValidateMode: 'change',
  validateOnMounted: false,

  onSubmit(data, { setSubmitting }) {
    console.log(data)

    // If `onSubmit()` function is synchronous, you need to call `setSubmitting(false)` yourself.
    setSubmitting(false)
  }
})

// Basic usage
// The `attrs` need to be bind on <input> to support `validateMode` and `reValidateMode`
const { value: drink, attrs: drinkFieldAttrs } = register('drink')

// Add validation for field
const { value: sugar, attrs: sugarFieldAttrs } = register('sugar', {
  validate(value) {
    let error: string | undefined

    if(value > 100) {
      error = 'This max number is 100'
    }

    return error
  }
})

const { value: ice, attrs: iceFieldAttrs } = register('ice')
const { value: bag, attrs: bagFieldAttrs } = register('bag')

</script>

<template>
  <form @submit="handleSubmit" @reset="handleReset">
    <div>
      Is current values not equal `initialValues`: {{ dirty }}
    </div>

    <div>
      <label>Drink</label>
      <input v-model="drink" type="text" v-bind="drinkFieldAttrs">
      <div v-if="errors.drink">
        {{ errors.drink }}
      </div>
    </div>
    
    <div>
      <label>Sugar level</label>
      <input v-model="sugar" type="number" v-bind="sugarFieldAttrs">
      <div v-if="errors.sugar">
        {{ errors.sugar }}
      </div>
    </div>

    <div>
      <label>Ice level</label>
      <input v-model="ice" type="text" v-bind="iceFieldAttrs">
      <div v-if="errors.ice">
        {{ errors.ice }}
      </div>
    </div>

    <div>
      <label>Need a bag</label>
      <input v-model="bag" type="checkbox" v-bind="bagFieldAttrs">
      <div v-if="errors.bag">
        {{ errors.bag }}
      </div>
    </div>

    <button type="reset">
      Reset
    </button>
    <button type="submit">
      Submit
    </button>
  </form>
</template>
```
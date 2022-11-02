# useFieldArray

`useFieldArray()` is a custom Vue composition api that will return specific fields values, meta (state), attributes and provides common operation helpers, you can also add validation for those fields.

## Usage

```vue
<script setup lang="ts">
import { useForm, useFieldArray } from '@vorms/core'

const { handleSubmit } = useForm({
  initialValues: {
    foods: ['Bubble Tea', 'Stinky Tofu', 'Scallion Pancake']
  },
  onSubmit(data) {
    console.log(data)
  }
})

const { fields, append } = useFieldArray<string>('foods')
</script>

<template>
  <form @submit="handleSubmit">
    <div v-for="field in fields" :key="field.key">
      <input 
        v-model="field.value" 
        type="text" 
        :name="field.name" 
        v-bind="field.attrs"
      >
    </div>
    <button type="button" @click="append('Taiwanese Fried Chicken')">
      Append
    </button>
    <button type="submit">Order</button>
  </form>
</template>
```

## Options

### name (Required)

Name of the field array.

### options.validate

This function allows you to write your logic to validate your field, this is optional.

## Returns

### fields

This array contains every entry of field's key, value, meta and attrs.

### append

Append an item to the field array.

### prepend

Prepend an item to the field array.

### swap

Swap items position.

### remove

Remove item at the specified position, or remove all when no index provided.

### move

Move item to another position.

### insert

Insert item at the specified position.

### update

Update int at the specified position.

### replace

Replace the entire field array values.

## Type Declarations

<details>
  <summary>Show Type Declarations</summary>

  ```ts
  function useFieldArray <Value>(name: MaybeRef<string>, options?: UseFieldArrayOptions<Value>): UseFieldArrayReturn<Value>

  interface UseFieldArrayOptions<Value> {
    validate?: FieldArrayValidator<Value[]>;
  }

  type FieldArrayValidator<Value extends Array<any>> = (value: Value) => FormErrors<Value> | void | Promise<FormErrors<Value> | void>;

  type UseFieldArrayReturn<Value> = {
    fields: Ref<FieldEntry<Value>[]>;
    append: (value: Value) => void;
    prepend: (value: Value) => void;
    swap: (indexA: number, indexB: number) => void;
    remove: (index?: number) => void;
    move: (from: number, to: number) => void;
    insert: (index: number, value: Value) => void;
    update: (index: number, value: Value) => void;
    replace: (values: Value[]) => void;
  };

  interface FieldEntry<Value> {
    key: number;
    value: Value;
    name: string;
    error: FormErrors<Value>;
    touched: Value extends Primitive ? boolean : FormTouched<Value> | undefined;
    dirty: boolean;
    attrs: Omit<FieldAttrs, 'name'>;
  }
  ```

</details>
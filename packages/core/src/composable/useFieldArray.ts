import { ref, computed, Ref } from 'vue';

import { useFormContext } from './useFormContext';

import type {
  FormErrors,
  FormTouched,
  FieldArrayValidator,
  FieldAttrs,
  Primitive,
} from '../types';
import isUndefined from '../utils/isUndefined';
import omit from '../utils/omit';

interface FieldEntry<Value> {
  key: number;
  value: Value;
  name: string;
  error: FormErrors<Value>;
  touched: Value extends Primitive ? boolean : FormTouched<Value> | undefined;
  dirty: boolean;
  attrs: Omit<FieldAttrs, 'name'>;
}

export interface UseFieldArrayOptions<Value> {
  validate?: FieldArrayValidator<Value[]>;
}

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

const appendAt = (data: any[], value: any) => {
  return [...data, value];
};

const prependAt = (data: any[], value: any) => {
  return [value, ...data];
};

const swapAt = (data: any[], indexA: number, indexB: number): void => {
  data[indexA] = [data[indexB], (data[indexB] = data[indexA])][0];
};

const removeAt = <T>(data: T[], index?: number): T[] => {
  if (isUndefined(index)) return [];

  const clone = [...data];
  clone.splice(index, 1);
  return clone;
};

const moveAt = (data: any[], from: number, to: number) => {
  data.splice(to, 0, data.splice(from, 1)[0]);
};

const insertAt = <T>(data: T[], index: number, value: T): T[] => {
  return [...data.slice(0, index), value, ...data.slice(index)];
};

const updateAt = <T>(data: T[], index: number, value: T): T[] => {
  const clone = [...data];

  clone[index] = value;
  return clone;
};

export function useFieldArray<Value>(
  name: string,
  options?: UseFieldArrayOptions<Value>,
): UseFieldArrayReturn<Value> {
  const {
    getFieldValue,
    setFieldValue,
    getFieldError,
    getFieldTouched,
    getFieldDirty,
    getFieldAttrs,
    registerFieldArray,
    setFieldArrayValue,
  } = useFormContext();

  const fields: Ref<FieldEntry<Value>[]> = ref([]);
  const values = computed(() => getFieldValue<Value[]>(name).value);

  let seed = 0;
  const reset = () => {
    fields.value = values.value.map(createEntry);
  };

  const createEntry = (value: Value) => {
    const key = seed++;

    const index = computed(() =>
      fields.value.findIndex((field) => field.key === key),
    );

    return {
      key,
      value: computed<Value>({
        get() {
          return index.value === -1 ? value : values.value[index.value];
        },
        set(value) {
          if (index.value === -1) return;
          setFieldValue(`${name}.${index.value}`, value);
        },
      }),

      name: computed(() => {
        return `${name}.${index.value}`;
      }),

      error: computed(() => {
        return getFieldError(`${name}.${index.value}`);
      }),

      touched: computed(() => {
        return getFieldTouched(`${name}.${index.value}`);
      }),

      dirty: computed(() => {
        return getFieldDirty(`${name}.${index.value}`);
      }),

      attrs: computed(() => {
        return omit(getFieldAttrs(`${name}.${index.value}`), 'name');
      }),
    } as any as FieldEntry<Value>; // `computed` will be auto unwrapped
  };

  const append = (value: Value) => {
    setFieldArrayValue(name, appendAt(values.value, value), appendAt, {
      argA: undefined,
    });

    fields.value.push(createEntry(value));
  };

  const prepend = (value: Value) => {
    setFieldArrayValue(name, prependAt(values.value, value), prependAt, {
      argA: undefined,
    });

    fields.value.unshift(createEntry(value));
  };

  const remove = (index?: number) => {
    const cloneValues = removeAt(values.value, index);
    const cloneField = removeAt(fields.value, index);

    setFieldArrayValue(name, cloneValues, removeAt, {
      argA: index,
    });

    fields.value = cloneField;
  };

  const swap = (indexA: number, indexB: number) => {
    if (!(indexA in values.value) || !(indexB in values.value)) return;

    const cloneValues = [...values.value];
    const cloneField = [...fields.value];

    swapAt(cloneValues, indexA, indexB);
    swapAt(cloneField, indexA, indexB);

    setFieldArrayValue(
      name,
      cloneValues,
      swapAt,
      {
        argA: indexA,
        argB: indexB,
      },
      false,
    );

    fields.value = cloneField;
  };

  const move = (from: number, to: number) => {
    if (!(from in values.value)) return;

    const cloneValues = [...values.value];
    const cloneField = [...fields.value];

    moveAt(cloneValues, from, to);
    moveAt(cloneField, from, to);

    setFieldArrayValue(
      name,
      cloneValues,
      moveAt,
      {
        argA: from,
        argB: to,
      },
      false,
    );

    fields.value = cloneField;
  };

  const insert = (index: number, value: Value) => {
    const cloneValues = insertAt(values.value, index, value);
    const cloneField = insertAt(fields.value, index, createEntry(value));

    setFieldArrayValue(name, cloneValues, insertAt, {
      argA: index,
      argB: undefined,
    });

    fields.value = cloneField;
  };

  const update = (index: number, value: Value) => {
    if (!(index in values.value)) return;

    const cloneValue = updateAt(values.value, index, value);

    setFieldArrayValue(name, cloneValue, updateAt, {
      argA: index,
      argB: undefined,
    });

    fields.value[index].value = value;
  };

  const replace = (values: Value[]) => {
    const cloneValues = [...values];

    setFieldArrayValue(name, cloneValues, <T>(data: T): T => data, {});

    fields.value = cloneValues.map(createEntry);
  };

  registerFieldArray(name, {
    ...options,
    reset,
  });

  reset();

  return {
    fields,
    append,
    prepend,
    swap,
    remove,
    move,
    insert,
    update,
    replace,
  };
}

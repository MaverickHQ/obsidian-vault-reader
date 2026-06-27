export type TextContentTarget = {
  textContent: string | null;
};

export type ValueTarget = {
  value: string;
};

export type DisabledTarget = {
  disabled: boolean;
};

export function setTextContentIfChanged(target: TextContentTarget, nextValue: string): boolean {
  if (target.textContent === nextValue) {
    return false;
  }

  target.textContent = nextValue;
  return true;
}

export function setValueIfChanged(target: ValueTarget, nextValue: string): boolean {
  if (target.value === nextValue) {
    return false;
  }

  target.value = nextValue;
  return true;
}

export function setDisabledIfChanged(target: DisabledTarget, nextValue: boolean): boolean {
  if (target.disabled === nextValue) {
    return false;
  }

  target.disabled = nextValue;
  return true;
}

export class ItemView {
  contentEl: HTMLElement;

  constructor(public readonly leaf: unknown) {
    this.contentEl = document.createElement("div");
  }

  registerDomEvent(
    element: Element | Document | Window,
    eventName: string,
    callback: (event: Event) => void,
  ): void {
    element.addEventListener(eventName, callback as EventListener);
  }
}

export const activeDocument = {
  createElement: (tagName: string) => {
    if (typeof document !== "undefined") {
      return document.createElement(tagName);
    }

    return new MockElement(tagName);
  },
} as Document;

export class Notice {
  static messages: string[] = [];

  constructor(public readonly message: string) {
    Notice.messages.push(message);
  }

  static reset(): void {
    Notice.messages = [];
  }
}

class MockElement {
  textContent = "";
  children: MockElement[] = [];

  constructor(public readonly tagName: string) {}

  empty(): void {
    this.children = [];
    this.textContent = "";
  }

  createEl(tagName: string, options?: { text?: string }): MockElement {
    const element = new MockElement(tagName);
    element.textContent = options?.text ?? "";
    this.children.push(element);
    return element;
  }
}

export class PluginSettingTab {
  containerEl = new MockElement("div");

  constructor(
    public readonly app: unknown,
    public readonly plugin: unknown,
  ) {}

  display(): void {}
}

export class Setting {
  static created: Setting[] = [];
  name = "";
  description = "";
  sliders: SliderComponent[] = [];
  toggles: ToggleComponent[] = [];
  dropdowns: DropdownComponent[] = [];
  heading = false;

  constructor(public readonly containerEl: unknown) {
    Setting.created.push(this);
  }

  static reset(): void {
    Setting.created = [];
  }

  setName(name: string): this {
    this.name = name;
    return this;
  }

  setDesc(description: string): this {
    this.description = description;
    return this;
  }

  setHeading(): this {
    this.heading = true;
    return this;
  }

  addSlider(callback: (slider: SliderComponent) => void): this {
    const slider = new SliderComponent();
    this.sliders.push(slider);
    callback(slider);
    return this;
  }

  addToggle(callback: (toggle: ToggleComponent) => void): this {
    const toggle = new ToggleComponent();
    this.toggles.push(toggle);
    callback(toggle);
    return this;
  }

  addDropdown(callback: (dropdown: DropdownComponent) => void): this {
    const dropdown = new DropdownComponent();
    this.dropdowns.push(dropdown);
    callback(dropdown);
    return this;
  }
}

class SliderComponent {
  limits: [number, number, number] | null = null;
  value: number | null = null;
  onChangeCallback: ((value: number) => void) | null = null;

  setLimits(min: number, max: number, step: number): this {
    this.limits = [min, max, step];
    return this;
  }

  setValue(value: number): this {
    this.value = value;
    return this;
  }

  setDynamicTooltip(): this {
    return this;
  }

  onChange(callback: (value: number) => void): this {
    this.onChangeCallback = callback;
    return this;
  }
}

class ToggleComponent {
  value: boolean | null = null;
  onChangeCallback: ((value: boolean) => void) | null = null;

  setValue(value: boolean): this {
    this.value = value;
    return this;
  }

  onChange(callback: (value: boolean) => void): this {
    this.onChangeCallback = callback;
    return this;
  }
}

class DropdownComponent {
  options: Record<string, string> = {};
  value: string | null = null;
  onChangeCallback: ((value: string) => void) | null = null;

  addOptions(options: Record<string, string>): this {
    this.options = options;
    return this;
  }

  setValue(value: string): this {
    this.value = value;
    return this;
  }

  onChange(callback: (value: string) => void): this {
    this.onChangeCallback = callback;
    return this;
  }
}

export class Plugin {
  app: unknown = {};
  commands: Array<{ id: string; name: string; callback: () => void | Promise<void> }> = [];
  settingTabs: unknown[] = [];

  async loadData(): Promise<unknown> {
    return null;
  }

  async saveData(): Promise<void> {}

  registerView(): void {}

  registerEditorExtension(): void {}

  addSettingTab(tab: unknown): void {
    this.settingTabs.push(tab);
  }

  addCommand(command: { id: string; name: string; callback: () => void | Promise<void> }): void {
    this.commands.push(command);
  }
}

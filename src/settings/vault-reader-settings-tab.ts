import { Notice, Plugin, PluginSettingTab, Setting, type App } from "obsidian";

import type { ReaderSettingsStore } from "./settings-store";
import {
  createSettingsPatch,
  createSettingsViewModel,
  type SettingsControl,
} from "./settings-view-model";

export class VaultReaderSettingsTab extends PluginSettingTab {
  constructor(
    app: App,
    plugin: Plugin,
    private readonly settingsStore: ReaderSettingsStore,
    private readonly notify: (message: string) => void = (message) => new Notice(message),
  ) {
    super(app, plugin);
  }

  display(): void {
    this.containerEl.empty();
    new Setting(this.containerEl).setName("Vault Reader").setHeading();
    this.containerEl.createEl("p", {
      text: "Set the defaults used when a new reading session starts. You can still change these controls inside the reader panel while reading.",
    });

    for (const control of createSettingsViewModel(this.settingsStore.get()).controls) {
      this.renderControl(control);
    }
  }

  private renderControl(control: SettingsControl): void {
    const setting = new Setting(this.containerEl)
      .setName(control.label)
      .setDesc(control.description);

    if (control.kind === "number") {
      setting.addSlider((slider) => {
        slider
          .setLimits(control.min, control.max, control.step)
          .setValue(control.value)
          .setDynamicTooltip()
          .onChange((value) => {
            void this.persist(control.id, value);
          });
      });
      return;
    }

    if (control.kind === "toggle") {
      setting.addToggle((toggle) => {
        toggle.setValue(control.value).onChange((value) => {
          void this.persist(control.id, value);
        });
      });
      return;
    }

    setting.addDropdown((dropdown) => {
      dropdown
        .addOptions(
          Object.fromEntries(control.options.map((option) => [option.value, option.label])),
        )
        .setValue(control.value)
        .onChange((value) => {
          void this.persist(control.id, value);
        });
    });
  }

  private async persist(controlId: SettingsControl["id"], value: unknown): Promise<void> {
    try {
      await this.settingsStore.update(createSettingsPatch(controlId, value));
    } catch (error) {
      console.error("Vault Reader settings update failed.", error);
      this.notify("Vault Reader could not save that setting.");
      this.display();
    }
  }
}

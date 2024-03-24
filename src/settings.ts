import { App, PluginSettingTab, Setting } from "obsidian";
import MyPlugin from "./main.js";

export class ESSettingTab extends PluginSettingTab {
	constructor(app: App, public plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Confirm before deleting files")
			.addToggle((t) =>
				t
					.setValue(this.plugin.settings.delConfirmFile)
					.onChange(async (value) => {
						this.plugin.settings.delConfirmFile = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Confirm before deleting folders")
			.addToggle((t) =>
				t
					.setValue(this.plugin.settings.delConfirmFolder)
					.onChange(async (value) => {
						this.plugin.settings.delConfirmFolder = value;
						await this.plugin.saveSettings();
					})
			);
	}
}

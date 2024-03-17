import { Plugin } from "obsidian";
import { SampleSettingTab } from "./settings.js";
import { DEFAULT_SETTINGS, MyPluginSettings } from "./variables.js";
import { Console } from "./Console.js";

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;
	
	async onload() {
		Console.log("logs...");

		await this.loadSettings();
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = { ...DEFAULT_SETTINGS, ...(await this.loadData()) };
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
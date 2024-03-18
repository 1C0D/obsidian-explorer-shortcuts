import { Plugin } from "obsidian";
import { SampleSettingTab } from "./settings.js";
import { DEFAULT_SETTINGS, MyPluginSettings } from "./variables.js";
import { handleExplorerHotkeys, isOverExplorer } from "./navigateOverExplorer.js";

export default class ExplorerShortcuts extends Plugin {
	settings: MyPluginSettings;
	mousePosition: { x: number; y: number };
	overExplorer = false;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.app.workspace.onLayoutReady(() => {
			this.registerDomEvent(document, "mousemove", (e) => isOverExplorer(e, this));
			this.registerDomEvent(document, "keydown", async (e) => await handleExplorerHotkeys(e, this));
		});
	}

	async loadSettings() {
		this.settings = { ...DEFAULT_SETTINGS, ...(await this.loadData()) };
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
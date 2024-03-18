import { Plugin } from "obsidian";
import { SampleSettingTab } from "./settings.js";
import { DEFAULT_SETTINGS, MyPluginSettings } from "./variables.js";
import { isOverExplorer, openLeaf } from "./navigateOverExplorer.js";
import { explorerCut, isOverExplorerFile } from "./cutAndPaste.js";

export default class ExplorerShortcuts extends Plugin {
	settings: MyPluginSettings;
	mousePosition: { x: number; y: number };
	overExplorer = false;
	explorefileContainer: Element | null | undefined;
	pathToPaste: string | null = null

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.app.workspace.onLayoutReady(() => {
			this.registerDomEvent(document, "mousemove", (e) => mouseMoveEvents(e, this));
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

export async function handleExplorerHotkeys(event: KeyboardEvent, modal: ExplorerShortcuts) {
	// Console.debug("key", event.key)
	if (event.key === 'Escape') {
		if(!modal.explorefileContainer)	{
			console.log("returned")
			return}
		modal.explorefileContainer?.classList.remove("cut")
		modal.pathToPaste = null
	}
	if (!modal.overExplorer) return
	if (event.key === 'ArrowUp') {
		await openLeaf(modal);
	}
	if (event.key === 'ArrowDown') {
		await openLeaf(modal, true);
	}
	if (event.key === 'c') { // essayer ctrl et preventDefault
		explorerCut(event, modal)
	}

}

function mouseMoveEvents(event: MouseEvent, modal: ExplorerShortcuts) {
	isOverExplorer(event, modal)
	// if (modal.overExplorer) {
		modal.explorefileContainer = isOverExplorerFile(event, modal)
	// }
}
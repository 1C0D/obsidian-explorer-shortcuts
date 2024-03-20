// error open in folder first level
import { Notice, Plugin } from "obsidian";
import { SampleSettingTab } from "./settings.js";
import { DEFAULT_SETTINGS, MyPluginSettings } from "./variables.js";
import { newOpenLeaf, openLeaf } from "./navigateOverExplorer.js";
import { explorerCut } from "./cutAndPaste.js";
import { getElementFromMousePosition, getSelectedContainer, getSelectedPaths, isOverExplorerContainer, isOverExplorerFile, isOverExplorerFolder } from "./utils.js";

export default class ExplorerShortcuts extends Plugin {
	settings: MyPluginSettings;
	mousePosition: { x: number; y: number };
	elementFromPoint: Element | null;
	explorerContainer: Element | null | undefined;
	explorerfileContainer: Element | null | undefined;
	explorerfolderContainer: Element | null | undefined;
	selectedElements: Element[] | [];
	paths: string[];

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

function mouseMoveEvents(event: MouseEvent, modal: ExplorerShortcuts) {
	modal.elementFromPoint = getElementFromMousePosition(event, modal);
	modal.explorerContainer = isOverExplorerContainer(modal)
	if (!modal.explorerContainer) return
	// for cut copy...
	modal.explorerfolderContainer = isOverExplorerFolder(modal)
	modal.explorerfileContainer = isOverExplorerFile(modal)
}

export async function handleExplorerHotkeys(event: KeyboardEvent, modal: ExplorerShortcuts) {
	// Console.debug("key", event.key)
	if (!modal.explorerContainer) return
	
	if (event.key === 'Escape') {
		modal.selectedElements?.forEach(node => {
			node.parentElement?.classList.remove("cut")
		})
		modal.explorerfileContainer = null
	}
	if (event.key === 'ArrowUp') {
		await newOpenLeaf(modal);
		// await openLeaf(modal);
	}
	if (event.key === 'ArrowDown') {
		await newOpenLeaf(modal, true);
		// await openLeaf(modal, true);
	}

	modal.selectedElements = getSelectedContainer(modal)
	if (!modal.selectedElements.length) return // on pourrait couper ce qui est sous le curseur si pas de selection

	if (event.key === 'x') {
		// console.log("modal.selectedElements", modal.selectedElements)
		modal.paths = getSelectedPaths(modal)
		console.log("modal.selectedElements", modal.selectedElements)
		explorerCut(event, modal)
	}
}


// rename
import { Notice, Plugin, TAbstractFile, TFile, TFolder } from "obsidian";
import { SampleSettingTab } from "./settings";
import { DEFAULT_SETTINGS, MyPluginSettings } from "./variables";
import { explorerCut } from "./cutAndPaste";
import { getElementFromMousePosition, getSelectedContainer, getSelectedPaths, isOverExplorerContainer, isOverExplorerFile, isOverExplorerFolder } from "./utils";
import { navigateOverexplorer } from "./navigateOverExplorer";
import { rename } from "./rename";
import { cut } from "./cut";
import { paste } from "./paste";
import { copy } from "./copy";

export default class ExplorerShortcuts extends Plugin {
	settings: MyPluginSettings;
	mousePosition: { x: number; y: number };
	elementFromPoint: Element | null;
	explorerContainer: Element | null | undefined;
	explorerfileContainer: Element | null | undefined;
	explorerfolderContainer: Element | null | undefined;
	selectedElements: Element[] | [];
	paths: string[];
	// itemFiles: (TAbstractFile | null)[]
	operation: "copy" | "cut"

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.app.workspace.onLayoutReady(() => {
			this.registerDomEvent(document, "mousemove", (e) => mouseMoveEvents(e, this));
			this.registerDomEvent(document, "keyup", async (e) => await handleExplorerHotkeys(e, this));//keyup to detect F2
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

	// navigate over explorer
	if (event.key === 'ArrowUp') {
		await navigateOverexplorer(modal, false);
	}
	if (event.key === 'ArrowDown') {
		await navigateOverexplorer(modal, true);
	}
	if (event.key === 'F2' || event.key === 'r') {
		rename(modal)
	}

	if (event.key === 'x') {
		cut(modal)
	}
	if (event.key === 'c') {
		copy(modal)
	}
	if (event.key === 'v') {
		await paste(modal)
	}

	// cut
	if (event.key === 'Escape') {
		modal.selectedElements?.forEach(node => {
			// node.parentElement?.classList.remove("cut")
		})
		modal.explorerfileContainer = null
	}

	modal.selectedElements = getSelectedContainer(modal)
	if (!modal.selectedElements.length) return // on pourrait couper ce qui est sous le curseur si pas de selection

	// if (event.key === 'x') {
	// 	// console.log("modal.selectedElements", modal.selectedElements)
	// 	modal.paths = getSelectedPaths(modal)
	// 	console.log("modal.selectedElements", modal.selectedElements)
	// 	explorerCut(event, modal)
	// }
}


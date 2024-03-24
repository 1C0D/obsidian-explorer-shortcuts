import { Plugin } from "obsidian";
import { DEFAULT_SETTINGS } from "./variables";
import { getElementFromMousePosition, isOverExplorerContainer, isOverExplorerFile, isOverExplorerFolder } from "./utils";
import { navigateOverexplorer } from "./navigateOverExplorer";
import { rename } from "./rename";
import { cut } from "./cut";
import { paste } from "./paste";
import { copy } from "./copy";
import { deleteItem } from "./delete";
import { ESSettings } from "./global";
import { ESSettingTab } from "./settings";

export default class ExplorerShortcuts extends Plugin {
	settings: ESSettings;
	mousePosition: { x: number; y: number };
	elementFromPoint: Element | null;
	explorerContainer: Element | null | undefined;
	explorerfileContainer: Element | null | undefined;
	explorerfolderContainer: Element | null | undefined;
	selectedElements: Element[] | [];
	paths: string[];
	operation: "copy" | "cut"
	renaming: boolean
	value: string
	altPressed: boolean

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new ESSettingTab(this.app, this));

		this.app.workspace.onLayoutReady(() => {
			this.registerDomEvent(document, "mousemove", (e) => mouseMoveEvents(e, this));
			this.registerDomEvent(document, "keydown", (e) => preventEditorKeyboard(e, this));
			this.registerDomEvent(document, "keyup", async (e) => {
				await handleExplorerHotkeys(e, this)
			});
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
	// cut copy...
	modal.explorerfolderContainer = isOverExplorerFolder(modal)
	modal.explorerfileContainer = isOverExplorerFile(modal)
}

function preventEditorKeyboard(event: KeyboardEvent, modal: ExplorerShortcuts) {
	if (modal.explorerContainer && !modal.renaming) event.preventDefault()
}


export async function handleExplorerHotkeys(event: KeyboardEvent, modal: ExplorerShortcuts) {
	// console.debug("key", event.key)
	if (!modal.explorerContainer) return
	if (modal.renaming) return

	if (event.key === 'Escape') {
		modal.explorerContainer?.querySelectorAll(".cut").forEach(node => node.classList.remove("cut"))
		modal.explorerContainer?.querySelectorAll(".copy").forEach(node => node.classList.remove("copy"))
		modal.paths = []
	}

	if (event.key === 'ArrowUp') {
		await navigateOverexplorer(modal, false);
	}
	if (event.key === 'ArrowDown') {
		await navigateOverexplorer(modal, true);
	}

	if (event.key === 'Alt') {
		modal.altPressed = true;
		setTimeout(() => {
			modal.altPressed = false
		}, 1000);
	}

	if (event.key === 'F2' || event.altKey && event.key === 'r' || event.ctrlKey && event.key === 'r') {
		modal.renaming = true
		rename(modal)
	}
	// if key alt then x or alt and x at the same time. 
	if (modal.altPressed && event.key === 'x' || event.altKey && event.key === 'x') {
		cut(modal)
		modal.altPressed = false
	}
	if (modal.altPressed && event.key === 'c' || event.altKey && event.key === 'c') {
		copy(modal)
		modal.altPressed = false
	}
	if (modal.altPressed && event.key === 'v' || event.altKey && event.key === 'v') {
		await paste(modal)
		modal.altPressed = false
	}
	if (modal.altPressed && event.key === 'Delete' || event.altKey && event.key === 'Delete') {
		await deleteItem(modal)
		modal.altPressed = false
	}
}


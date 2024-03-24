import { Plugin } from "obsidian";
import { DEFAULT_SETTINGS } from "./variables";
import { getElementFromMousePosition, getHoveredElement, isOverExplorerContainer, isOverExplorerFile, isOverExplorerFolder } from "./utils";
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
	beingRenamed: Element | null

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new ESSettingTab(this.app, this));

		this.app.workspace.onLayoutReady(() => {
			this.registerDomEvent(document, "mousemove", (e) => mouseMoveEvents(e, this));
			this.registerDomEvent(document, "keydown", (e) => preventEditorKeyboard(e, this));
			this.registerDomEvent(document, "keyup", async (e) => await handleExplorerHotkeys(e, this));
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
	if (modal.explorerContainer && !modal.renaming && modal.beingRenamed) event.preventDefault()
}

export async function handleExplorerHotkeys(event: KeyboardEvent, modal: ExplorerShortcuts) {
	// console.debug("key", event.key)
	if (!modal.explorerContainer) return
	const hovered = getHoveredElement(modal)
	const beingRenamed = modal.explorerContainer.querySelector(".is-being-renamed")
	if (beingRenamed || modal.renaming) return
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
	if (event.key === 'F2' || event.key === 'r') {
		if (!beingRenamed) modal.renaming = true
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
	if (event.key === 'Delete') {
		await deleteItem(modal)
	}
}


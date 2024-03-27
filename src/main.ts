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
import { createNewItem } from "./newFileFolder";

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
			this.registerDomEvent(document, "keydown", (e) => {
				keyDown(e, this)
			});
			this.registerDomEvent(document, "keyup", async (e) => await keyUp(e, this));
		});
	}

	async loadSettings() {
		this.settings = { ...DEFAULT_SETTINGS, ...(await this.loadData()) };
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

function mouseMoveEvents(e: MouseEvent, modal: ExplorerShortcuts) {
	modal.elementFromPoint = getElementFromMousePosition(e, modal);
	modal.explorerContainer = isOverExplorerContainer(modal)
	if (!modal.explorerContainer) return
	// cut copy...
	modal.explorerfolderContainer = isOverExplorerFolder(modal)
	modal.explorerfileContainer = isOverExplorerFile(modal)
}

let blockedKeys: Record<string, boolean> = {};
async function keyDown(e: KeyboardEvent, modal: ExplorerShortcuts) {
	// console.log(e.key);
	if (!modal.explorerContainer) return;
	if (modal.renaming) return
	if (keysToBlock(e.key)) {
		e.preventDefault();
		blockedKeys[e.key] = true;
	}
}

export async function keyUp(e: KeyboardEvent, modal: ExplorerShortcuts) {
	if (!modal.explorerContainer?.parentElement) return
	const beingRenamed = modal.explorerContainer.querySelector(".is-being-renamed")

	if (beingRenamed) {
		if (blockedKeys[e.key]) {
			delete blockedKeys[e.key];
		}
	}

	if (e.key === 'Escape') {
		modal.explorerContainer?.querySelectorAll(".cut").forEach(node => node.classList.remove("cut"))
		modal.explorerContainer?.querySelectorAll(".copy").forEach(node => node.classList.remove("copy"))
		modal.paths = []
	}

	if (modal.renaming) {
		blockedKeys = {}
		return
	}
	if (e.key === 'r' || e.key === 'F2') {
		modal.renaming = true
		rename(modal)
	}
	if (e.key === 'n') {
		await createNewItem(modal, "file")
	}
	if (e.key === 'f') {
		await createNewItem(modal, "folder")
	}
	if (e.key === 'ArrowUp') {
		await navigateOverexplorer(modal, false);
	}
	if (e.key === 'ArrowDown') {
		await navigateOverexplorer(modal, true);
	}
	if (e.key === 'x') {
		cut(modal)
	}
	if (e.key === 'c') {
		copy(modal)
	}
	if (e.key === 'v') {
		await paste(modal)
	}
	if (e.key === 'Delete') {
		await deleteItem(modal)
	}
}

function keysToBlock(key: string) {
	const blockedKeysList = ['n', 'r', 'x', 'c', 'v', 'Delete', 'ArrowUp', 'ArrowDown', 'F2'];
	return blockedKeysList.includes(key);
}
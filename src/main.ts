import { Plugin, TFile, TFolder, WorkspaceLeaf, fileItem } from "obsidian";
import { SampleSettingTab } from "./settings.js";
import { DEFAULT_SETTINGS, MyPluginSettings } from "./variables.js";
import { Console } from "./Console.js";
import sortBy from 'lodash/sortBy';
import path from 'path';

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

async function handleExplorerHotkeys(event: KeyboardEvent, modal: ExplorerShortcuts) {
	Console.debug("key", event.key)
	if (!modal.overExplorer) return
	if (event.key === 'ArrowUp') {
		await openPreviousLeaf(modal);
	}
	if (event.key === 'ArrowDown') {
		await openPreviousLeaf(modal,true);
	}
}

function getExplorerItems(modal: ExplorerShortcuts) {
	const { workspace } = modal.app;
	const fileExplorerView = workspace.getLeavesOfType("file-explorer")?.first()?.view;
	if (!fileExplorerView) return;
	return Object.entries(fileExplorerView.fileItems)
}

function getActiveItemIndex(modal: ExplorerShortcuts, items: [string, fileItem][]) {
	// if (!files) return
	const { workspace } = modal.app;
	const activeView = workspace.getLeaf(false).view;
	const index = items.findIndex(([path, item]) => path === activeView.file.path);
	return index
}

async function openPreviousLeaf(modal: ExplorerShortcuts, down = false) {
	const { workspace } = modal.app;
	const items = getExplorerItems(modal)
	Console.log("items", items)
	if (!items) return
	const activePath = workspace.getLeaf(false).view.file.path
	const dirActivePath = activePath.split("/").slice(0, -1).join("/")
	Console.log("dirActivePath", dirActivePath)
	let sameDirItems: [string, fileItem][] = []
	for (const [path, fileItem] of items) {
		if (!path.startsWith(dirActivePath)) {
			continue
		}
		const ext = path.split(".").pop()
		if (!ext) continue
		if (!(ext in modal.app.viewRegistry.typeByExtension))// not in rendered ext
			continue
		sameDirItems.push([path,fileItem])

	}
	console.log("sameDirItems", sameDirItems)
	sameDirItems = sortBy(sameDirItems, tuple => {
		console.log("tuple[0]", tuple[0])
		const name = path.basename(tuple[0], path.extname(tuple[0])); // Nom de fichier sans extension pour le tuple
		return name.toLocaleLowerCase();
	});
	Console.debug("sameDirItems", sameDirItems)
	const index = getActiveItemIndex(modal, sameDirItems)
	Console.log("index", index)
	const newIndex = down? index + 1 : index - 1
	if (down ? newIndex >= sameDirItems.length : newIndex < 0) return
	const [_path, item] = sameDirItems[newIndex]
	console.log("_path", _path)
	if (item.file instanceof TFolder) return
	await workspace.getLeaf(false)?.openFile(item.file as TFile, { active: true });
}


function getElementFromMousePosition(
	event: MouseEvent,
	modal: ExplorerShortcuts
) {
	modal.mousePosition = { x: event.clientX, y: event.clientY };
	if (modal.mousePosition) {
		const elementFromPoint = document.elementFromPoint(
			modal.mousePosition.x,
			modal.mousePosition.y
		);
		return elementFromPoint;
	}
	return null;
}

const isOverExplorer = async (event: MouseEvent, modal: ExplorerShortcuts) => {
	const elementFromPoint = getElementFromMousePosition(event, modal);
	if (!elementFromPoint) {
		modal.overExplorer = false;
		return
	}
	const isLeftSplit = elementFromPoint.closest(".mod-left-split");
	if (isLeftSplit) {
		const activeLeftSplit = getActiveSidebarLeaf.bind(this)()[0]
		const isExplorerLeaf = activeLeftSplit?.getViewState().type === 'file-explorer'
		return modal.overExplorer = isExplorerLeaf
	}
	return modal.overExplorer = false
}

function getActiveSidebarLeaf(): WorkspaceLeaf[] {
	const leftRoot = this.app.workspace.leftSplit.getRoot()
	const leaves: WorkspaceLeaf[] = []
	this.app.workspace.iterateAllLeaves((leaf: WorkspaceLeaf) => {
		if (leaf.getRoot() == leftRoot && leaf.view.containerEl.clientWidth > 0) {
			leaves.push(leaf)
		}
	})
	return leaves
}
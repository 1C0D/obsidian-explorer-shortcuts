import { TAbstractFile, TFile } from "obsidian";
import ExplorerShortcuts from "./main";
import path from "path";

export function isFolder(element: Element | null) {
    return element?.classList.contains("nav-folder");
}

export function isFile(element: Element | null) {
    return element?.classList.contains("nav-file");
}

export function isFolded(element: Element | null) {
    return element?.classList.contains("is-collapsed");
}

 export async function OpenNext(modal: ExplorerShortcuts, next: Element | null) {
    console.log("OpenNext")
    const path = getElPath(next)
    if (!path) return
    const item = getFileFromPath(modal, path)
    console.log("item", item)
    await modal.app.workspace.getLeaf(false)?.openFile(item as TFile, { active: true });
}

const getFileFromPath = (modal: ExplorerShortcuts, _path: string): TAbstractFile | null => {
    const absPath = path.join(modal.app.vault.configDir, _path);
    return modal.app.vault.getAbstractFileByPath(_path)
}

export function getElPath(element: Element | null): string {
    return element?.children[0]?.getAttribute("data-path") ?? ""
}

export function unfoldFolder(modal: ExplorerShortcuts, element: Element | null) {
    const dirPath = getElPath(element)
    const items = getExplorerItems(modal)
    if (!items) return
    for (const item of items) {
        if (item[0].includes(dirPath)) {
            item[1].setCollapsed(false)
            break
        }
    }
}

function getExplorerItems(modal: ExplorerShortcuts) {
    const { workspace } = modal.app;
    const fileExplorerView = workspace.getLeavesOfType("file-explorer")?.first()?.view;
    if (!fileExplorerView) return;
    return Object.entries(fileExplorerView.fileItems)
}

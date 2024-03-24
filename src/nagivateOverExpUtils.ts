import { TAbstractFile } from "obsidian";
import ExplorerShortcuts from "./main";

export function isFolder(element: Element | null) {
    return element?.classList.contains("nav-folder");
}

export function isFile(element: Element | null) {
    return element?.classList.contains("nav-file");
}

export function isFolded(element: Element | null) {
    return element?.classList.contains("is-collapsed");
}

export const getFileFromPath = (modal: ExplorerShortcuts, _path: string): TAbstractFile | null => {
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
    const fileExplorerView = getExlorerLeaf(modal)?.view;
    if (!fileExplorerView) return;
    return Object.entries(fileExplorerView.fileItems)
}

export function getExlorerLeaf(modal: ExplorerShortcuts) {
    const { workspace } = modal.app;
    return workspace.getLeavesOfType("file-explorer")?.first();
}

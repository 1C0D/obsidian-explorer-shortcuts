import { sortBy } from "lodash";
import { fileItem, TFile, WorkspaceLeaf } from "obsidian";
import path from "path";
import { Console } from "./Console";
import ExplorerShortcuts from "./main";

export async function handleExplorerHotkeys(event: KeyboardEvent, modal: ExplorerShortcuts) {
    // Console.debug("key", event.key)
    if (!modal.overExplorer) return
    if (event.key === 'ArrowUp') {
        await openLeaf(modal);
    }
    if (event.key === 'ArrowDown') {
        await openLeaf(modal, true);
    }
}

function getExplorerItems(modal: ExplorerShortcuts) {
    const { workspace } = modal.app;
    const fileExplorerView = workspace.getLeavesOfType("file-explorer")?.first()?.view;
    if (!fileExplorerView) return;
    Console.debug("fileExplorerView", fileExplorerView)// files and dirs
    return Object.entries(fileExplorerView.fileItems)
}

function getActiveItemIndex(modal: ExplorerShortcuts, items: [string, fileItem][]) {
    const { workspace } = modal.app;
    const activeView = workspace.getLeaf(false).view;
    const index = items.findIndex(([path, item]) => path === activeView.file.path);
    return index
}

async function openLeaf(modal: ExplorerShortcuts, down = false) {
    const { workspace } = modal.app;
    const items = getExplorerItems(modal)// [[path, item], [path, item]...]
    if (!items) return

    const activePath = workspace.getLeaf(false).view.file.path
    const dirActivePath = activePath.split("/").slice(0, -1).join("/")
    const folderRemoved = getFilesOnly(items)
    let knownExtensions = filterItemsByKnownExtensions(folderRemoved, modal);// [string, fileItem][] = []
    const [rootFiles, otheFiles] = separateRootFiles(knownExtensions)
    // Console.debug("rootFiles", rootFiles)
    // Console.debug("others", otheFiles)

    const sortedItems = [...sortFilesBeforeDirs(otheFiles), ...sortFilesBeforeDirs(rootFiles)];
    // Console.debug("sortedItems", sortedItems)

    const index = getActiveItemIndex(modal, sortedItems)
    // Console.debug("index", index)
    const newIndex = down ?
        index === sortedItems.length - 1 ? 0 : index + 1 :
        index === 0 ? sortedItems.length - 1 : index - 1

    const [_path, item] = sortedItems[newIndex]
    // Console.debug("_path", _path)
    console.log("collapsed",)

    let parent = item.parent;
    while (parent && parent.collapsible) {
        if (parent.collapsible && parent.collapsed) {
            parent.setCollapsed(false);
        }
        parent = parent.parent;
    }
    await workspace.getLeaf(false)?.openFile(item.file as TFile, { active: true });
}

function getFilesOnly(items: [string, fileItem][]) {
    return items.filter(([path, item]) => item.file instanceof TFile)
}

function filterItemsByKnownExtensions(items: [string, fileItem][], modal: ExplorerShortcuts) {
    const knownExtensions = Object.keys(modal.app.viewRegistry.typeByExtension);
    const keptItems: [string, fileItem][] = items.filter(([path, fileItem]) => {
        const parts = path.split(".")
        let ext;
        if (parts.length > 1) ext = parts.pop();
        if (!ext && parts[0][0] === "/") return false;// explorer title
        return !ext || ext && knownExtensions.includes(ext);
    });
    return keptItems;
}

function separateRootFiles(items: [string, fileItem][]) {
    const rootFiles: [string, fileItem][] = []
    const otherfiles: [string, fileItem][] = []
    items.forEach(([path, fileItem]) => {
        if (path.split("/").length === 1) {
            rootFiles.push([path, fileItem])
        } else {
            otherfiles.push([path, fileItem])
        }
    })
    return [rootFiles, otherfiles]
}

function sortFilesBeforeDirs(items: [string, fileItem][]) {
    // il faudrait trier les fichiers racine pour les mettre à la fin
    return sortBy(items, ([_path]) => {
        const name = path.basename(_path, path.extname(_path)); // name without ext
        return name.toLocaleLowerCase();
    });
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

export const isOverExplorer = async (event: MouseEvent, modal: ExplorerShortcuts) => {
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
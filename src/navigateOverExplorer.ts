import { sortBy } from "lodash";
import { fileItem, TAbstractFile, TFile, TFolder, WorkspaceLeaf } from "obsidian";
import path from "path";
import { Console } from "./Console";
import ExplorerShortcuts from "./main";
import { getElementFromMousePosition } from "./utils";
import { parentPort } from "worker_threads";



function getExplorerItems(modal: ExplorerShortcuts) {
    const { workspace } = modal.app;
    const fileExplorerView = workspace.getLeavesOfType("file-explorer")?.first()?.view;
    if (!fileExplorerView) return;
    console.log("fileExplorerView.file", fileExplorerView.fileItems)
    // Console.debug("fileExplorerView", fileExplorerView)// files and dirs
    return Object.entries(fileExplorerView.fileItems)
}

function getActiveItemIndex(modal: ExplorerShortcuts, items: [string, fileItem][]) {
    const { workspace } = modal.app;
    const activeView = workspace.getLeaf(false).view;
    const index = items.findIndex(([path, item]) => path === activeView.file.path);
    return index
}

function getElPath(element: Element | null) {
    return element!.children[0]!.getAttribute("data-path")
}

function getSibling(down: boolean) {
    return down ? "nextElementSibling" : "previousElementSibling"
}

function skipUnsupported(element: Element | null, down: boolean) {
    if (!element) return
    const siblingSelector = getSibling(down)
    while (element!.children[0]?.classList.contains("is-unsupported")) {
        if (!element) return
        element = element[siblingSelector]
    }
    return element
}

function nextEl(element: Element | null, down: boolean) {
    if (!element) return
    const siblingSelector = getSibling(down)
    let next = element[siblingSelector]
    if (!next) return
    return next
}

function isNotActivePath(active: Element | null, next: Element | null) {
    return getElPath(active) !== getElPath(next)
}

function unfoldFOlder(modal: ExplorerShortcuts, element: Element | null) {
    const dirPath = getElPath(element)
    console.log("dirPath", dirPath)
    const items = getExplorerItems(modal)
    for (const item of items!) {
        if (item[0].includes(dirPath!)) {
            item[1].setCollapsed(false)
            break
        }
    }
}

function getNextFile(next: Element | null, down: boolean, active: Element | null) {
    const isUnsupported = next!.children[0].classList.contains("is-unsupported");
    console.log("isFile")
    if (isUnsupported) {
        console.log("isUnsupported", isUnsupported)
        next = skipUnsupported(next, down) ?? null
        const isFolder = next!.classList.contains("nav-folder");
        if (isFolder) return next
        console.log("next after isUnsupported", next)
    }
    if (isNotActivePath(active, next)) {
        console.log("isNotActivePath")
        return next
    }
    console.log("next file")
    return next
}

function nextFromFolder(modal: ExplorerShortcuts, next: Element | null, active: Element | null, down = true) {
    console.log("folder")
    if (next!.classList.contains("is-collapsed")) {
        console.log("collapsed")
        unfoldFOlder(modal, next)
    }

    const childs = next!.children[1].lastElementChild
    console.log("childs", childs)

    next = down ? next!.children[1].children[1] ?? null : next!.children[1].lastElementChild ?? null
    console.log("next in folder", next)
    next = getNextFile(next, down, active)

    return next
}

function getNextEl(modal: ExplorerShortcuts, active: Element | null, down = true) {
    let next = nextEl(active, down) ?? null
    console.log("next", next)
    if (next) {
        const isFolder = next.classList.contains("nav-folder");
        const isFile = next.classList.contains("nav-file");
        if (isFile) {
            next = getNextFile(next, down, active)
            const isFolder = next!.classList.contains("nav-folder");
            if (isFolder) {
                next = nextFromFolder(modal, next, active, down)
            }
            return next
        }
        else if (isFolder) {
            return nextFromFolder(modal, next, active, down)
        } else {
            console.log("else")
            // console.log("next.parentElement", next.parentElement!.parentElement)
            next = next.parentElement!.parentElement ?? null
            const siblingSelector = getSibling(down)
            next = next![siblingSelector] ?? null
            if (next && next.classList.contains("nav-folder")) {
                return nextFromFolder(modal, next, active, down)
            } else {
                next = next!.parentElement!.parentElement ?? null
                console.log("next next", next)
                next = next![siblingSelector] ?? null
                if (next && next.classList.contains("nav-folder")) {
                    next = nextFromFolder(modal, next, active, down)
                    console.log("next", next)
                } else {
                    next = next!.parentElement!.parentElement ?? null
                    console.log("next next next", next)
                    if (next) {next = next![siblingSelector] ?? null
                    return nextFromFolder(modal, next, active, down)}
                    console.log("not ok")
                }

                console.log("next", next)
                return
            }
        }
    }
}


async function OpenNext(modal: ExplorerShortcuts, next: Element | null) {
    console.log("OpenNext")
    const path = getElPath(next)
    if (!path) return
    const item = getFileFromPath(modal, path)
    // if (item instanceof TFolder) {
    //     console.log("it's a folder")
    //     return
    // }
    await modal.app.workspace.getLeaf(false)?.openFile(item as TFile, { active: true });
}

export async function newOpenLeaf(modal: ExplorerShortcuts, down = false) {
    let path;
    let next
    let active = modal.explorerContainer?.querySelector(".is-active") ?? null
    console.log("active", active)
    if (!active) return
    next = getNextEl(modal, active.parentElement, down) ?? null

    if (!next) {
        console.log("returned")
        return
    }

    await OpenNext(modal, next)



    // if the folder with the active file is closed
    // if (!active) {
    //     const activePath = modal.app.workspace.getLeaf(false).view.file.path
    //     for (const child of Array.from(modal.explorerfilesContainer!.children)) {
    //         if (!child.classList.contains("nav-folder")) continue
    //         console.log("child", child)
    //         const dirPath = child.children[0]?.getAttribute("data-path")
    //         console.log("dirPath", dirPath)
    //         if (activePath.startsWith(dirPath + "/") && child.children[0]?.children[0]?.classList.contains("is-collapsed")) {
    //             console.log("ici")
    //             const items = getExplorerItems(modal)
    //             for (const item of items!) {
    //                 if (item[0].startsWith(dirPath + "/")) {
    //                     item[1].parent.setCollapsed(false)
    //                     break
    //                 }
    //             }
    //         }
    //     }
    //     active = modal.explorerfilesContainer?.querySelector(".is-active")
    // }

    // let next = active?.parentElement?.nextElementSibling

    // // files with an unsupported extension
    // while (next?.children[0]?.classList.contains("is-unsupported")) {
    //     next = next?.nextElementSibling
    // }

    // console.log("next", next)
    // path = next?.children[0]?.getAttribute("data-path") ?? ""
    // console.log("path", path)

    // if (!next) {
    //     let parentDirContent = active?.parentElement?.parentElement?.parentElement?.nextElementSibling
    //     console.log("parentDirContent", parentDirContent)

    //     for (const child of Array.from(parentDirContent!.children)) {
    //         if (child.classList.contains("nav-file")) {
    //             console.log("child", child)
    //             path = child.children[0]?.getAttribute("data-path") ?? ""
    //             console.log("path", path)
    //             if (!isValidPath(modal, path)) continue
    //             modal.explorerfilesContainer = child.parentElement
    //             break
    //         }
    //     }
    // }

    // if (!path || !isValidPath(modal, path)) return
    // const item = getFileFromPath(modal, path)
    // if (item instanceof TFolder) {
    //     console.log("it's a folder")
    //     return
    // }
    // await modal.app.workspace.getLeaf(false)?.openFile(item as TFile, { active: true });

}

function isValidPath(modal: ExplorerShortcuts, path: string) {
    const knownExtensions = Object.keys(modal.app.viewRegistry.typeByExtension)
    if (!path) return false
    const parts = path.split(".")
    let ext
    if (parts.length > 1) ext = parts.pop()
    if (!ext && parts[0][0] === "/") return false// explorer title
    return !ext || ext && knownExtensions.includes(ext)
}

const getFileFromPath = (modal: ExplorerShortcuts, _path: string): TAbstractFile | null => {
    const absPath = path.join(modal.app.vault.configDir, _path);
    return modal.app.vault.getAbstractFileByPath(_path)
}

export async function openLeaf(modal: ExplorerShortcuts, down = false) {
    const { workspace } = modal.app;
    const items = getExplorerItems(modal)// [[path, item], [path, item]...]
    if (!items) return

    // const activePath = workspace.getLeaf(false).view.file.path
    // const dirActivePath = activePath.split("/").slice(0, -1).join("/")
    const folderRemoved = getFilesOnly(items)
    let knownExtensions = filterItemsByKnownExtensions(folderRemoved, modal);// [string, fileItem][] = []
    const [rootFiles, otheFiles] = separateRootFiles(knownExtensions)
    // Console.debug("rootFiles", rootFiles)
    // Console.debug("others", otheFiles)

    const sortedItems = [...sortFilesBeforeDirs(otheFiles), ...sortFilesBeforeDirs(rootFiles)];
    // Console.debug("sortedItems", sortedItems)

    const index = getActiveItemIndex(modal, sortedItems)
    // Console.debug("index", index)

    // loop over all items can be annoying (options???)
    // const newIndex = down ?
    //     index === sortedItems.length - 1 ? 0 : index + 1 :
    //     index === 0 ? sortedItems.length - 1 : index - 1
    const newIndex = down ?
        index + 1 : index - 1
    if (newIndex < 0 || newIndex >= sortedItems.length) return

    const [_path, item] = sortedItems[newIndex]
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
    return sortBy(items, ([_path]) => {
        const name = path.basename(_path, path.extname(_path)); // name without ext
        return name.toLocaleLowerCase();
    });
}

export const isOverExplorer = (event: MouseEvent, modal: ExplorerShortcuts) => {
    const leafContent = modal.elementFromPoint?.closest(".workspace-leaf-content[data-type='file-explorer']");
    return leafContent
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
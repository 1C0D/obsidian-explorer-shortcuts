import { TAbstractFile, TFile } from "obsidian";
import path from "path";
import { Console } from "./Console";
import ExplorerShortcuts from "./main";

function getExplorerItems(modal: ExplorerShortcuts) {
    const { workspace } = modal.app;
    const fileExplorerView = workspace.getLeavesOfType("file-explorer")?.first()?.view;
    if (!fileExplorerView) return;
    // Console.debug("fileExplorerView.file", fileExplorerView.fileItems)// files and dirs
    return Object.entries(fileExplorerView.fileItems)
}

function getElPath(element: Element | null) {
    return element!.children[0]!.getAttribute("data-path") ?? ""
}

function getSibling(down: boolean) {
    return down ? "nextElementSibling" : "previousElementSibling"
}

function skipUnsupported(element: Element | null, down: boolean) {
    while (element && element.children[0]?.classList.contains("is-unsupported")) {
        element = element[down ? "nextElementSibling" : "previousElementSibling"];
    }
    return element || null;
}

function nextEl(element: Element | null, down: boolean) {
    if (!element) return null;
    return down ? element.nextElementSibling || null : element.previousElementSibling || null;
}

function isNotActivePath(active: Element | null, next: Element | null) {
    return getElPath(active) !== getElPath(next)
}

function unfoldFolder(modal: ExplorerShortcuts, element: Element | null) {
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

function nextFromFile(modal: ExplorerShortcuts, next: Element | null, down: boolean, active: Element | null) {
    if (!next) return null
    Console.log("isFile")
    const isUnsupported = next!.children[0].classList.contains("is-unsupported");
    if (isUnsupported) {// loop, can lead to a folder
        Console.log("isUnsupported", isUnsupported)
        next = skipUnsupported(next, down) ?? null
        const isFolder = next!.classList.contains("nav-folder");
        if (isFolder) {
            Console.log("folder in isUnsupported")
            return nextFromFolder(modal, next, active, down)
        }
        Console.log("next after isUnsupported", next)
    }
    if (isNotActivePath(active, next)) {// can happen
        Console.log("isNotActivePath")
        return next
    }
    Console.log("sameAsActivePath ???? when ????", next)
    return null
}

function nextFromFolder(modal: ExplorerShortcuts, next: Element | null, active: Element | null, down = true): Element | null {
    if (!next) return null
    Console.log("folder")
    if (next.classList.contains("is-collapsed")) {
        Console.log("collapsed")
        unfoldFolder(modal, next)
    }
    const nextPath = getElPath(next)
    Console.log("nextPath", nextPath)
    // next file in folder
    next = down ? next.children[1].children[1] ?? null : next!.children[1].lastElementChild ?? null
    next = nextFromFile(modal, next, down, active)
    return next
}

function getNextDecreasing(modal: ExplorerShortcuts, next : Element | null, active: Element | null, down = true): Element | null {
    if (!next) return null
    next = next.parentElement!.parentElement ?? null
    const siblingSelector = getSibling(down)
    next = next![siblingSelector] ?? null
    if (next && next.classList.contains("nav-folder")) {
        return nextFromFolder(modal, next, active, down)
    }
    return getNextDecreasing(modal, next, active, down)
}

function getNextEl(modal: ExplorerShortcuts, active: Element | null, down = true) {
    let next = nextEl(active, down)
    Console.log("next", next)
    if (!next) return null
    const isFolder = next.classList.contains("nav-folder");
    const isFile = next.classList.contains("nav-file");
    if (isFile) {
        next = nextFromFile(modal, next, down, active)
        //put this directly in nextFromFile ???
        const isFolder = next!.classList.contains("nav-folder");
        if (isFolder) {
            Console.log("file to folder")
            next = nextFromFolder(modal, next, active, down)
        }
        return next
    }
    else if (isFolder) {
        return nextFromFolder(modal, next, active, down)
    } else {
        Console.log("else decreasing")
        next = getNextDecreasing(modal, next, active, down)
        return next
    }
}

async function OpenNext(modal: ExplorerShortcuts, next: Element | null) {
    Console.log("OpenNext")
    const path = getElPath(next)
    if (!path) return
    const item = getFileFromPath(modal, path)
    await modal.app.workspace.getLeaf(false)?.openFile(item as TFile, { active: true });
}

export async function newOpenLeaf(modal: ExplorerShortcuts, down = false) {
    let path;
    let next
    let active = modal.explorerContainer?.querySelector(".is-active") ?? null
    Console.log("active", active)
    if (!active) return
    next = getNextEl(modal, active.parentElement, down) ?? null

    if (!next) {
        Console.log("returned, no next")
        return
    }

    await OpenNext(modal, next)
}

const getFileFromPath = (modal: ExplorerShortcuts, _path: string): TAbstractFile | null => {
    const absPath = path.join(modal.app.vault.configDir, _path);
    return modal.app.vault.getAbstractFileByPath(_path)
}

export const isOverExplorer = (event: MouseEvent, modal: ExplorerShortcuts) => {
    const leafContent = modal.elementFromPoint?.closest(".workspace-leaf-content[data-type='file-explorer']");
    return leafContent
}


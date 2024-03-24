import { Notice, TFile } from "obsidian";
import { Console } from "./Console";
import ExplorerShortcuts from "./main";
import { isFolder, isFolded, unfoldFolder, isFile, getElPath, getFileFromPath } from "./nagivateOverExpUtils";

export async function navigateOverexplorer(modal: ExplorerShortcuts, down = false) {
    const active = modal.explorerContainer?.querySelector(".is-active") ?? null
    if (!active) return
    const nextElement = getNextEl(modal, down) ?? null
    if (!nextElement) {
        new Notice("End of list",800)
        return
    }
    if (nextElement && isFile(nextElement)) {
        await OpenNext(modal, nextElement)
    }
}


function getNextEl(modal: ExplorerShortcuts, down = false) {
    const elements = modal.explorerContainer?.querySelectorAll(".nav-file, .nav-folder");
    const filteredList: Element[] = [];

    if (elements) {
        elements.forEach((element) => {
            if (!element.children[0].classList.contains("is-unsupported") && !element.classList.contains("mod-root")) {
                filteredList.push(element);
            }
        });
    }

    const activeIndex = Array.from(filteredList).findIndex(el => el.children[0].classList.contains("is-active"));
    let nextIndex = down ? activeIndex + 1 : activeIndex - 1
    let nextElement = filteredList[nextIndex]

    while (isFolder(nextElement) && !isFolded(nextElement)) {
        nextIndex = down ? nextIndex + 1 : nextIndex - 1
        nextElement = filteredList[nextIndex]
    }

    if (isFolded(nextElement)) {
        unfoldFolder(modal, filteredList[nextIndex])
        getNextEl(modal, down)
    }
    return nextElement
}

export async function OpenNext(modal: ExplorerShortcuts, next: Element | null) {
    const path = getElPath(next)
    if (!path) return
    const item = getFileFromPath(modal, path)
    const activeLeaf = modal.app.workspace.getLeaf(false)    
    await activeLeaf?.openFile(item as TFile, { active: true });
    setTimeout(async () => {
        const activeEl = modal.explorerContainer?.querySelector('.is-active')
        activeEl?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 10);
}

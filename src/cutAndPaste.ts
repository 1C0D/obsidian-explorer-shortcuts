import { Notice } from "obsidian";
import { Console } from "./Console";
import ExplorerShortcuts from "./main";
import { getElementFromMousePosition } from "./utils";

export function explorerCut(event: KeyboardEvent, modal: ExplorerShortcuts) {
    // if (!modal.overExplorer) return
    if (!(!!modal.explorefileContainer)) return
    // event.preventDefault()
    Console.debug("modal.explorefileContainer", modal.explorefileContainer)
    //nav-file-title-content
    const { fileName, ext } = getFileNameAndExt(modal)

    //get parent folder name
    let parent = modal.explorefileContainer?.parentElement?.parentElement
    console.log("parent", parent)
    let folderPath: string[] = []
    while (parent && parent.classList.contains("nav-folder") && !parent.classList.contains("mod-root")) {
        const currentPath = parent.querySelector(".nav-folder-title-content")?.textContent ?? "";
        folderPath = [currentPath, ...folderPath];
        parent = parent.parentElement?.parentElement;
    }
    // folderPath = folderPath.reverse()
    const path = folderPath.join("/")
    const filePath = path.length ? path + "/" + fileName + "." + ext : fileName + "." + ext
    console.log("filePath", filePath)
    // color & cancel esc
    modal.pathToPaste = filePath
    new Notice ("Select destination")
    // put a class to make the content grey (as cut in Windows or other OS)
    modal.explorefileContainer.classList.add("cut")
    // what css code I can use in the css file. put the code in comment
    // .cut { background-color: #f5f5f5; }
    // .cut:hover { background-color: #f5f5f5; }
    // event.preventDefault()
}


export const isOverExplorerFile = (event: MouseEvent, modal: ExplorerShortcuts) => {
    const elementFromPoint = getElementFromMousePosition(event, modal);
    return elementFromPoint?.closest(".tree-item.nav-file");
}

function getFileNameAndExt(modal: ExplorerShortcuts): { fileName: string, ext: string } {
    const fileName = modal.explorefileContainer?.querySelector(".nav-file-title-content")?.textContent ?? ""
    const ext = modal.explorefileContainer?.querySelector(".nav-file-tag")?.textContent ?? "md"
    return { fileName, ext }
}
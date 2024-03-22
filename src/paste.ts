import path from "path";
import ExplorerShortcuts from "./main";
import { getElPath, getFileFromPath } from "./nagivateOverExpUtils";
import { getHoveredElement, getPathEls } from "./rename";
import { FileSystemAdapter, TFile, TFolder, normalizePath } from "obsidian";


export async function paste(modal: ExplorerShortcuts) {
    if (!modal.paths) return
    const destDir = getDestination(modal) || ""
    if (!destDir) return
    for (const itemPath of modal.paths) {
        const { dir, name, ext } = getPathEls(itemPath)
        const newPath = path.join(destDir, name + ext);
        const itemFile = getFileFromPath(modal, itemPath);
        console.log("itemFile", itemFile)

        if (itemFile) {
            if (modal.operation === "cut") {
                itemFile instanceof TFile ? await modal.app.fileManager.renameFile(itemFile as TFile, newPath) : await modal.app.vault.rename(itemFile as TFolder, newPath);
            } else {
                // let absPath = normalizePath(modal.app.vault.adapter.getFullPath(itemPath))
                console.log("itemPath", itemPath)
                console.log("newPath", newPath)
                if (itemPath === newPath) continue
                if (itemFile instanceof TFile) await modal.app.vault.copy(itemFile as TFile, newPath)
                else {
                    await this.app.vault.createFolder(newPath);
                    const newFolder = this.app.vault.getAbstractFileByPath(newPath);


                    for (const child of (itemFile as TFolder).children) {
                        if (child instanceof TFile) {
                            //@ts-ignore
                            await this.copyFile(child, newFolder, "", false); //no file name suffix, do not open after copying
                        } else if (child instanceof TFolder) {
                            //@ts-ignore
                            await this.copyFolder(child, newFolder, "");
                        }
                    }
                }
            }
        }
    }
    modal.explorerContainer?.querySelectorAll(".cut").forEach(node => {
        node.classList.remove("cut")
    })
    modal.paths = []
}

function getDestination(modal: ExplorerShortcuts) {
    const hovered = getHoveredElement(modal)
    if (!hovered) return
    const _path = getElPath(hovered)
    return path.extname(_path) ? path.dirname(_path) : _path
}
import path from "path";
import ExplorerShortcuts from "./main";
import { getElPath, getFileFromPath } from "./nagivateOverExpUtils";
import { getPathEls } from "./rename";
import { Notice, TAbstractFile, TFile, TFolder, normalizePath } from "obsidian";
import { getHoveredElement } from "./utils";
import { confirm } from "./modal"
import { incrementName } from "./newFileFolder";

export async function paste(modal: ExplorerShortcuts) {
    if (!modal.paths) return
    let destDir = getDestination(modal) || ""// dir from dir or file
    if (!destDir) return
    for (const itemPath of modal.paths) {
        let newPath = getNewPath(destDir, itemPath);
        let confirmed = false
        const itemFileExists = this.app.vault.getAbstractFileByPath(newPath);
        if (!newPath || itemPath === newPath) {
            new Notice("No path specified or same path", 2000)
            continue
        }
        if (itemFileExists) {
            const itemKind = itemFileExists ? itemFileExists instanceof TFile ? "file" : "folder" : null;
            confirmed = await confirm("File or Folder already exists. Increment name or cancel")
            if (!confirmed) continue
            else { newPath = incrementName(modal, itemKind) || "" }
        }
        if (isSubPath(destDir, itemPath)) {
            new Notice("Cannot paste into a subpath", 2000)
            continue
        }
        const itemFile = getFileFromPath(modal, itemPath);
        if (itemFile) {
            if (modal.operation === "cut") {
                await cut(modal, itemFile, newPath)
                if (modal.explorerContainer) {
                    let arr = Array.from(modal.explorerContainer.querySelectorAll(".cut"))
                    // rest of the code here
                    arr.filter(node => {
                        getElPath(node) === destDir
                    }).forEach(node => {
                        node.classList.remove("cut")
                    })
                }
            } else { // copy
                await copy(modal, itemFile, newPath)
                if (modal.explorerContainer) {
                    let arr = Array.from(modal.explorerContainer.querySelectorAll(".copy"))
                    // rest of the code here
                    arr.filter(node => {
                        getElPath(node) === destDir
                    }).forEach(node => {
                        node.classList.remove("copy")
                    })
                }
            }
            modal.paths = modal.paths.filter(p => p !== itemPath)
        }
    }
}

function isSubPath(destDir: string, itemPath: string) {
    const destDirParts = destDir.split('/');
    const itemPathParts = itemPath.split('/');
    const destDirLength = destDirParts.length;
    const itemPathLength = itemPathParts.length;
    if (destDirLength < itemPathLength) {
        return false
    };
    const tokeep = destDirParts.slice(0, itemPathLength).join('/')
    if (tokeep === itemPath) {
        return true
    };
    return false
}

async function copy(modal: ExplorerShortcuts, itemFile: TAbstractFile, newPath: string) {
    if (itemFile instanceof TFile) {
        await modal.app.vault.copy(itemFile as TFile, newPath)
    } else { // folder
        await copyFolder(modal, itemFile, newPath)
    }
}

async function copyFolder(modal: ExplorerShortcuts, itemFile: TAbstractFile, newPath: string) {
    await this.app.vault.createFolder(newPath);
    for (const child of (itemFile as TFolder).children) {
        const newNewPath = normalizePath(path.join(newPath, child.name));
        if (child instanceof TFile) {
            await modal.app.vault.copy(child as TFile, newNewPath)
        } else {
            await copyFolder(modal, child, newNewPath)
        }
    }
}

async function cut(modal: ExplorerShortcuts, itemFile: TAbstractFile, newPath: string) {
    itemFile instanceof TFile ? await modal.app.fileManager.renameFile(itemFile as TFile, newPath) : await modal.app.vault.rename(itemFile as TFolder, newPath);
}

export function getDestination(modal: ExplorerShortcuts, dir = false) {
    const hovered = getHoveredElement(modal)
    if (!hovered) return
    const _path = getElPath(hovered)
    return (path.extname(_path)) ? normalizePath(path.dirname(_path)) : _path
}

function getNewPath(destDir: string, itemPath: string) {
    const { dir, name, ext } = getPathEls(itemPath)
    const newPath = normalizePath(path.join(destDir, name + ext));
    return newPath
}
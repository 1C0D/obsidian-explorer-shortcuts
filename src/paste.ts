import path from "path";
import ExplorerShortcuts from "./main";
import { getElPath, getFileFromPath } from "./nagivateOverExpUtils";
import { getPathEls } from "./rename";
import { Notice, TAbstractFile, TFile, TFolder, normalizePath } from "obsidian";
import { getHoveredElement } from "./utils";

export async function paste(modal: ExplorerShortcuts) {
    if (!modal.paths) return
    let destDir = getDestination(modal) || ""// dir from dir or file
    if (!destDir) return
    for (const itemPath of modal.paths) {
        const newPath = getNewPath(destDir, itemPath);
        if (this.app.vault.getAbstractFileByPath(newPath)){
            new Notice("File or Folder already exists in destination",2000)
            return
        }
        if (itemPath === newPath) continue
        const itemFile = getFileFromPath(modal, itemPath);
        if (itemFile) {
            if (modal.operation === "cut") {
                await cut(modal, itemFile, newPath)
            } else { // copy
                await copy(modal, itemFile, newPath)
            }
        }
    }
    modal.explorerContainer?.querySelectorAll(".cut").forEach(node => node.classList.remove("cut"))
    modal.explorerContainer?.querySelectorAll(".copy").forEach(node => node.classList.remove("copy"))
    modal.paths = []
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

function getDestination(modal: ExplorerShortcuts) {
    const hovered = getHoveredElement(modal)
    if (!hovered) return
    const _path = getElPath(hovered)
    return path.extname(_path) ? path.dirname(_path) : _path
}

function getNewPath(destDir: string, itemPath: string) {
    const { dir, name, ext } = getPathEls(itemPath)
    const newPath = normalizePath(path.join(destDir, name + ext));
    return newPath
}





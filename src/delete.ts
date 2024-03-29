import { Notice, TFile, TFolder } from "obsidian"
import ExplorerShortcuts from "./main"
import { getElPath, getFileFromPath } from "./nagivateOverExpUtils"
import { getHoveredElement } from "./utils"
import { confirm} from "./modal"

export async function deleteItem(modal: ExplorerShortcuts) {
    const hovered = getHoveredElement(modal)
    if (!hovered) return
    const _path = getElPath(hovered)
    if (!_path) return
    const itemFile = getFileFromPath(modal, _path);
    if (!itemFile) return -1
    let confirmed = true
    if (modal.settings.delConfirmFile && itemFile instanceof TFile){
        confirmed = await confirm(" Are you sure you want to delete " + itemFile.name + "?")
    }else if( modal.settings.delConfirmFolder && itemFile instanceof TFolder){
        confirmed = await confirm(" Are you sure you want to delete " + itemFile.name + "?")
    }
    if (!confirmed) return
    const text = itemFile instanceof TFile ? "File" : "Folder"
    new Notice(`${text} removed: `+ itemFile.name,2000)
    await modal.app.vault.trash(itemFile, true)
    return
}

export async function triggerDelete(modal: ExplorerShortcuts) {
    // trigger a mouse move event to refresh the selectedElements
    const e = new MouseEvent('mousemove', { clientX: modal.mousePosition.x + 1, clientY: modal.mousePosition.y + 1 });
    document.dispatchEvent(e);
    await deleteItem(modal)
}
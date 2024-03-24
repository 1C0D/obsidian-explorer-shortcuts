import ExplorerShortcuts from "./main"
import { getElPath } from "./nagivateOverExpUtils"
import { getHoveredElement } from "./utils"

export function copy(modal: ExplorerShortcuts) {
    modal.operation = "copy"
    getPaths(modal)
}

export function getPaths(modal: ExplorerShortcuts) {
    const hovered = getHoveredElement(modal)
    if (!hovered) return
    const _path = getElPath(hovered)
    if (!modal.paths) {
        modal.paths = [_path]
    } else {
        modal.paths = [...new Set([...modal.paths, _path])]
    }
    if (modal.operation === "cut") {
        hovered.classList.add("cut") 
        hovered.classList.remove("copy")       
    }
    if (modal.operation === "copy") {
        hovered.classList.add("copy")
        hovered.classList.remove("cut")
    }
}
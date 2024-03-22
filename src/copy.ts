import ExplorerShortcuts from "./main"
import { getElPath, getFileFromPath } from "./nagivateOverExpUtils"
import { getHoveredElement, getPathElements } from "./rename"

export function copy(modal: ExplorerShortcuts) {
    // if not focused items
    const hovered = getHoveredElement(modal)
    if (!hovered) return
    const _path = getElPath(hovered)
    // const { pathEls, pathWithoutExt } = getPathElements(_path)
    modal.paths = [_path]
    hovered.classList.add("cut")
    modal.operation = "copy"
}
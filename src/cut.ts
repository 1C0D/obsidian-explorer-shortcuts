import ExplorerShortcuts from "./main";
import { getElPath, getFileFromPath } from "./nagivateOverExpUtils";
import { getHoveredElement, getPathElements } from "./rename";

export function cut(modal: ExplorerShortcuts) {
    // if not focused items
    const hovered = getHoveredElement(modal)
    if (!hovered) return
    const _path = getElPath(hovered)
    // const { pathEls, pathWithoutExt } = getPathElements(_path)
    // const itemFile = getFileFromPath(modal, _path)
    hovered.classList.add("cut")
    modal.paths = [_path]
    modal.operation = "cut"
}

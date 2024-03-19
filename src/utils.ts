// remove pas dans la hiérachie
import ExplorerShortcuts from "./main";

export function getElementFromMousePosition(
    event: MouseEvent,
    modal: ExplorerShortcuts
) {
    modal.mousePosition = { x: event.clientX, y: event.clientY };
    if (modal.mousePosition) {
        const elementFromPoint = document.elementFromPoint(
            modal.mousePosition.x,
            modal.mousePosition.y
        );
        return elementFromPoint;
    }
    return null;
}

export const isOverExplorerFilesContainer = (modal: ExplorerShortcuts) => {
    return modal.elementFromPoint?.closest(".tree-item-children.nav-folder-children");
}

export const isOverExplorerFile = (modal: ExplorerShortcuts) => {
    return modal.elementFromPoint?.closest(".tree-item.nav-file");
}

export const isOverExplorerFolder = (modal: ExplorerShortcuts) => {
    return modal.elementFromPoint?.closest(".tree-item.nav-folder");
}

export function getSelectedContainer(modal: ExplorerShortcuts) {
    return Array.from(modal.explorerfilesContainer?.querySelectorAll(".is-selected") ?? [])
}

export function getSelectedPaths(modal: ExplorerShortcuts) {
    let paths: string[] = []
    if (!modal.selectedElements) return []

    for (const node of Array.from(modal.selectedElements)) {
        const path = node.getAttribute("data-path")
        console.log("oui")
        if (!path) continue
        paths.push(path)
    }
    // exclude path if other path is higher in hierarchy
    const toRemove: string[] = [];
    for (const _path of paths) {
        let path = _path
        if (!path.includes("/")) continue
        while (path.includes("/")) {
            path = path.split("/").slice(0, -1).join("/")
            if (paths.some(p => p === path)) toRemove.push(_path)
        }
    }
    // remove from paths the paths that are to be removed
    paths = paths.filter(p => !toRemove.includes(p))
    console.log("paths", paths)
    const copy = modal.selectedElements.slice()
    copy.filter(node => {
        const path = node.getAttribute("data-path") ?? ""
        return paths.some(p => p === path)
    })

    console.log("copy", copy)
    modal.selectedElements = copy


    return paths
}
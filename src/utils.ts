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

export const isOverExplorerContainer = (modal: ExplorerShortcuts) => {
    return modal.elementFromPoint?.closest(".nav-files-container");
}

// export const isOverExplorer = (event: MouseEvent, modal: ExplorerShortcuts) => {
//     const leafContent = modal.elementFromPoint?.closest(".workspace-leaf-content[data-type='file-explorer']");
//     return leafContent
// }

export const isOverExplorerFile = (modal: ExplorerShortcuts) => {
    return modal.elementFromPoint?.closest(".tree-item.nav-file");
}

export const isOverExplorerFolder = (modal: ExplorerShortcuts) => {
    return modal.elementFromPoint?.closest(".tree-item.nav-folder");
}

export function getHoveredElement(modal: ExplorerShortcuts) {
    return modal.explorerfileContainer || modal.explorerfolderContainer || null
}
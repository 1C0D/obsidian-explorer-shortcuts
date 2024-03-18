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
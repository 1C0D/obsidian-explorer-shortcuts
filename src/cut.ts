import { getPaths } from "./copy";
import ExplorerShortcuts from "./main";

export function cut(modal: ExplorerShortcuts) {
    modal.operation = "cut"
    getPaths(modal)
}

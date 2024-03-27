import { normalizePath } from "obsidian";
import ExplorerShortcuts from "./main";
import { getDestination } from "./paste";


export async function createNewItem(modal: ExplorerShortcuts, type: 'file' | 'folder') {
    let destDir = getDestination(modal, true) || "."
    let path;
    if (type === 'file') {
        path = destDir === "." ? "" : destDir + "/";
        path = path + `Untitled.md`;
    } else {
        path = destDir === "." ? "" : destDir + "/";
        path = path + `Untitled`;
    }
    let i = 0;
    while (modal.app.vault.getAbstractFileByPath(normalizePath(path))) {
        i++;
        if (type === 'file') {
            path = destDir === "." ? "" : destDir + "/";
            path = path + `Untitled ${i}` + ".md";
        } else {
            path = destDir === "." ? "" : destDir + "/";
            path = path + `Untitled ${i}`
        }
    }
    if (type === 'file') {
        const file = await modal.app.vault.create(path, "");
        const leaf = modal.app.workspace.getLeaf('tab')
        leaf.openFile(file, {
            state: { mode: "source" },
            eState: { rename: "start" },
        });
    } else {
        await modal.app.vault.createFolder(path);
    }
};

import ExplorerShortcuts from "./main";
import { getDestination } from "./paste";


export async function createNewItem(modal: ExplorerShortcuts, type: 'file' | 'folder') {
    let destDir = getDestination(modal, true) || ""
    if (!destDir) return
    let path = type === 'file' ? destDir + "/" + `Untitled.md` : destDir + "/" + `Untitled`;
    let i = 0;
    while (modal.app.vault.getAbstractFileByPath(path)) {
        i++;
        path = destDir + "/" + `Untitled ${i}`;
    }
    if (type === 'file') {
        path = path + ".md";
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

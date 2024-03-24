import ExplorerShortcuts from "./main";
import { getDestination } from "./paste";


export async function createNewItem(modal: ExplorerShortcuts, type: 'file' | 'folder') {
    let destDir = getDestination(modal) || ""
    if (!destDir) return
    let path = destDir + "/" + `Untitled.md`;
    let i = 0;
    while (await modal.app.vault.getAbstractFileByPath(path)) {
        i++;
        path = destDir + "/" + `Untitled ${i}.md`;
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

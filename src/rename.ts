import path from "path";
import ExplorerShortcuts from "./main";
import { getElPath, getFileFromPath } from "./nagivateOverExpUtils";
import { TAbstractFile, TFile, TFolder } from "obsidian";


export function rename(modal: ExplorerShortcuts) {
    const hovered = getHoveredElement(modal)
    if (!hovered) return
    const _path = getElPath(hovered)
    const { pathEls, pathWithoutExt } = getPathElements(_path)
    const itemFile = getFileFromPath(modal, _path)
    const input = createInput(hovered, pathWithoutExt);
    if (!input) return
    addListeners(input, itemFile, pathEls)
}

export function getHoveredElement(modal: ExplorerShortcuts) {
    return modal.explorerfileContainer || modal.explorerfolderContainer || null
}

export function getPathElements(_path: string) {
    const pathEls = getPathEls(_path)
    const pathWithoutExt = path.join(path.basename(_path, path.extname(_path)))
    return {pathEls, pathWithoutExt}
}

export function getPathEls(_path: string) {
    return { dir: path.dirname(_path), name: path.basename(_path, path.extname(_path)), ext: path.extname(_path) }
}

function addListeners(input: HTMLInputElement, itemFile: TAbstractFile | null, pathEls: { dir: string, name: string, ext: string }) {
    input.onblur = async () => await handleBlurOrEnter(itemFile, pathEls, input.value)
    input.onkeydown = async (event) => {
        if (event.key === "Enter") {
            await handleBlurOrEnter(itemFile, pathEls, input.value)
            input.empty()
        }
    }
}

export function createInput(el: Element | null, currentValue: string) {
    if (el) {
        const input = document.createElement("input");
        input.type = "text";
        input.value = currentValue;
        el.replaceWith(input);
        input.focus();
        selectValue(input);
        return input;
    } else {
        return undefined;
    }
}

export const selectValue = (input: HTMLInputElement | null) => {
    input?.setSelectionRange(0, input?.value.length);
};

const handleBlurOrEnter = async (itemFile: TAbstractFile | null, pathEls: { dir: string, name: string, ext: string }, new_path: string) => {
    const _path = pathEls.dir + "/" + new_path + pathEls.ext
    console.log("_path", _path)
    itemFile instanceof TFile ? await app.fileManager.renameFile(itemFile as TFile, _path): await app.vault.rename(itemFile as TFolder, _path);
};
import path from "path";
import ExplorerShortcuts from "./main";
import { getElPath, getFileFromPath } from "./nagivateOverExpUtils";
import { TAbstractFile, TFile, TFolder, normalizePath } from "obsidian";
import { getHoveredElement } from "./utils";


export function rename(modal: ExplorerShortcuts) {
    const hovered = getHoveredElement(modal)
    if (!hovered) return
    const _path = getElPath(hovered)
    const { pathEls, pathWithoutExt } = getPathElements(_path)
    const itemFile = getFileFromPath(modal, _path)
    const input = createInput(hovered, pathWithoutExt, itemFile, pathEls, modal);
    if (!input) return
    addListeners(modal, input, itemFile, pathEls, hovered, pathWithoutExt)
}

export function getPathElements(_path: string) {
    const pathEls = getPathEls(_path)
    const pathWithoutExt = normalizePath(path.join(path.basename(_path, path.extname(_path))))
    return { pathEls, pathWithoutExt }
}

export function getPathEls(_path: string) {
    return { dir: path.dirname(_path), name: path.basename(_path, path.extname(_path)), ext: path.extname(_path) }
}

function addListeners(modal: ExplorerShortcuts, input: HTMLInputElement, itemFile: TAbstractFile | null, pathEls: { dir: string, name: string, ext: string }, hovered: Element, pathWithoutExt: string) {
    input.onblur = async () => {
        modal.renaming = false
        if (!input.value.trim()) await handleBlurOrEnter(modal, itemFile, pathEls, pathWithoutExt);
        if (hovered) {
            input.replaceWith(hovered);
        }
    }
    input.onkeydown = async (e) => {
        if (e.key === "Enter") {
            input.blur()
        }
        if (e.key === "Escape") {
            modal.renaming = false
            if (hovered) {
                await handleBlurOrEnter(modal, itemFile, pathEls, pathWithoutExt)
                input.replaceWith(hovered);
            }
        }
    }
}

export function createInput(el: Element | null, currentValue: string, itemFile: TAbstractFile | null, pathEls: { dir: string, name: string, ext: string }, modal: ExplorerShortcuts) {
    if (el) {
        const input = document.createElement("input");
        input.type = "text";
        input.value = currentValue;
        el.replaceWith(input);
        input.focus();
        // selectValue(input);
        input.onchange = async () => await handleBlurOrEnter(modal, itemFile, pathEls, input.value)
        return input;
    } else {
        return undefined;
    }
}

export const selectValue = (input: HTMLInputElement | null) => {
    input?.setSelectionRange(0, input?.value.length);
};

const handleBlurOrEnter = async (modal: ExplorerShortcuts, itemFile: TAbstractFile | null, pathEls: { dir: string, name: string, ext: string }, new_path: string) => {
    const _path = pathEls.dir + "/" + new_path + pathEls.ext
    itemFile instanceof TFile ? await modal.app.fileManager.renameFile(itemFile as TFile, _path) : await modal.app.vault.rename(itemFile as TFolder, _path);
    modal.renaming = false
};
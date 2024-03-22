import { Console } from "./Console";
import ExplorerShortcuts from "./main";
import { isFolder, isFolded, unfoldFolder, isFile, OpenNext } from "./nagivateOverExpUtils";

export async function navigateOverexplorer(modal: ExplorerShortcuts, down = false) {
    const active = modal.explorerContainer?.querySelector(".is-active") ?? null
    if (!active) return

    function getNextEl(modal: ExplorerShortcuts, down = false) {

        const elements = modal.explorerContainer?.querySelectorAll(".nav-file, .nav-folder");
        const filteredList: Element[] = [];

        if (elements) {
            elements.forEach((element) => {
                if (!element.children[0].classList.contains("is-unsupported") && !element.classList.contains("mod-root")) {
                    filteredList.push(element);
                }
            });
        }

        const activeIndex = Array.from(filteredList).findIndex(el => el.children[0].classList.contains("is-active"));
        let nextIndex = down ? activeIndex + 1 : activeIndex - 1
        let nextElement = filteredList[nextIndex]

        while (isFolder(nextElement) && !isFolded(nextElement)) { // empty folder. can happen after next operation(recursion)
            nextIndex = down ? nextIndex + 1 : nextIndex - 1
            nextElement = filteredList[nextIndex]
        }

        if (isFolded(nextElement)) {
            unfoldFolder(modal, filteredList[nextIndex])
            getNextEl(modal, down)
        }
        return nextElement
    }
    const nextElement = getNextEl(modal, down)

    if (nextElement && isFile(nextElement)) {
        await OpenNext(modal, nextElement)
    }
}


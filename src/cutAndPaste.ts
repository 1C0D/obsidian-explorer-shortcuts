import { Notice } from "obsidian";
import { Console } from "./Console";
import ExplorerShortcuts from "./main";
import { getElementFromMousePosition, getSelectedContainer } from "./utils";

// export function getSelectedItems(modal: ExplorerShortcuts) {
//     const selectedFiles = getSelectedContainer(modal)
//     console.log("selectedFiles", selectedFiles);
// }

export function explorerCut(event: KeyboardEvent, modal: ExplorerShortcuts) {
    if (!modal.selectedElements) {
        new Notice("No item selected")    
        return
    } else {
        modal.selectedElements.forEach(node => {
            // node.classList.add("cut")
        })
        new Notice ("Ready to paste")
    }

        // const path = ""
        // console.log("node", node)
        // let itemName = getItemName(node)
        // const parent = node.parentElement
        // console.log("parent", parent)
        // while (parent && parent.classList.contains("nav-folder") && !parent.classList.contains("mod-root")) {
        //     console.log("parent",   parent)
        //      const dirName = parent.children[1]?.textContent
        //      itemName = dirName + "/" + itemName 
        // }
        // console.log("itemName", itemName)



        }

        // const { fileName, ext } = getFileNameAndExt(modal)

        // //get parent folder name
        // let parent = modal.explorerfileContainer?.parentElement?.parentElement
        // // Console.debug("parent", parent)
        // let folderPath: string[] = []
        // while (parent && parent.classList.contains("nav-folder") && !parent.classList.contains("mod-root")) {
        //     const currentPath = parent.querySelector(".nav-folder-title-content")?.textContent ?? "";
        //     folderPath = [currentPath, ...folderPath];
        //     parent = parent.parentElement?.parentElement;
        // }
        // // folderPath = folderPath.reverse()
  
        // // color & cancel esc
        // new Notice("Select destination")
        // // put a class to make the content grey (as cut in Windows or other OS)
        // modal.explorerfileContainer.classList.add("cut")
        // // what css code I can use in the css file. put the code in comment
        // // .cut { background-color: #f5f5f5; }
        // // .cut:hover { background-color: #f5f5f5; }
        // // event.preventDefault()
    // }

    function getItemName(node: Element): string {
        let itemName
        if (node.classList.contains("nav-file-title")) {
            itemName = node.firstChild?.textContent
            const ext = node.children[1]?.textContent ?? "md"
            itemName = itemName + "." + ext
        } else { //folder
            itemName = node.children[1]?.textContent
        }
        return itemName??""
    }



    function getFileNameAndExt(modal: ExplorerShortcuts): { fileName: string, ext: string } {
        const fileName = modal.explorerfileContainer?.querySelector(".nav-file-title-content")?.textContent ?? ""
        const ext = modal.explorerfileContainer?.querySelector(".nav-file-tag")?.textContent ?? "md"
        return { fileName, ext }
    }


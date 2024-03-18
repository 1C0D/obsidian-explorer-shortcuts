import { TFile, TFolder } from "obsidian"

declare module "obsidian" {
    interface App {
        viewRegistry: any
    }

    interface View {
        fileItems: fileItem[],
        file: TFile,
        // openFile: (file: TFile) => void        
    }

    interface fileItem{
        "collapsible": boolean,
        "collapsed" : boolean,
        "el": HTMLElement,
        "selfEl": HTMLElement,
        "coverEl": HTMLElement,
        "collapseEl": HTMLElement,
        "innerEl": HTMLElement,
        "childrenEl": HTMLElement,
        "info": any,
        "view": View,
        "file": TFile | TFolder,
        "tagEl": HTMLElement,
        "parent": fileItem
    }
}

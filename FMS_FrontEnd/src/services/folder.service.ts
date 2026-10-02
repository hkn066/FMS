import { documentService, type DmsScope } from "@/services/document.service";
import type { Folder } from "@/types";
import type { FolderNode } from "@/types/document";

export interface CreateFolderPayload {
  name: string;
  parentId?: string;
  caseId?: string;
  arbitrationCaseId?: string;
}

function toFolder(node: FolderNode): Folder {
  return {
    id: node.id,
    name: node.name,
    parentId: node.parentId ?? undefined,
    caseId: node.caseId ?? undefined,
    isSystem: node.isSystem,
    documentCount: node.documentCount ?? 0,
    children: node.children?.map(toFolder),
  };
}

export const folderService = {
  async getTree(scope: DmsScope = {}): Promise<Folder[]> {
    const nodes = await documentService.getFolderTree(scope);
    return nodes.map(toFolder);
  },

  async create(payload: CreateFolderPayload): Promise<Folder> {
    const node = await documentService.createFolder(payload.name, payload.parentId ?? null, {
      caseId: payload.caseId,
      arbitrationCaseId: payload.arbitrationCaseId,
    });
    return toFolder(node);
  },

  async rename(id: string, name: string): Promise<Folder> {
    const node = await documentService.renameFolder(id, name);
    return toFolder(node);
  },

  async move(id: string, targetParentId?: string | null): Promise<Folder> {
    await documentService.moveFolderOrDocument(id, targetParentId ?? null, "FOLDER");
    const nodes = await documentService.getFolderTree();
    const find = (list: FolderNode[]): FolderNode | undefined => {
      for (const n of list) {
        if (n.id === id) return n;
        if (n.children) {
          const found = find(n.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    const node = find(nodes);
    if (!node) throw new Error("Klasör taşındı ancak güncel veri alınamadı");
    return toFolder(node);
  },

  async remove(id: string): Promise<void> {
    await documentService.deleteFolder(id);
  },
};

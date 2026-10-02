import type { DmsScope } from "@/services/document.service";
import type { FolderNode } from "@/types/document";
import type { ArbitrationStatus } from "@/types/arbitration";

/** Backend seed UUID — Sigorta Tahkim sistem kök klasörü */
export const DMS_ARBITRATION_ROOT_ID = "88888888-8888-8888-8888-888888888802";
export const DMS_GENERAL_ROOT_ID = "88888888-8888-8888-8888-888888888801";

export const ARBITRATION_STATUS_FOLDER_IDS: Partial<Record<ArbitrationStatus, string>> = {
  PRE_APPLICATION: "88888888-8888-8888-8888-888888888821",
  IN_COMMISSION: "88888888-8888-8888-8888-888888888822",
  EXPERT_REVIEW: "88888888-8888-8888-8888-888888888823",
  DECIDED: "88888888-8888-8888-8888-888888888824",
  CLOSED: "88888888-8888-8888-8888-888888888825",
};

export function getArbitrationStatusFromFolder(folder: FolderNode): ArbitrationStatus | null {
  if (folder.arbitrationCaseId) return null;

  for (const [status, id] of Object.entries(ARBITRATION_STATUS_FOLDER_IDS)) {
    if (folder.id === id) return status as ArbitrationStatus;
  }

  const normalized = folder.name.trim().toLowerCase();
  if (normalized.includes("yeni başvuru") || normalized.includes("yeni basvuru")) {
    return "NEW_APPLICATION";
  }
  if (normalized.includes("ön başvuru") || normalized.includes("on basvuru")) {
    return "PRE_APPLICATION";
  }
  if (normalized.includes("komisyon")) {
    return "IN_COMMISSION";
  }
  if (
    normalized.includes("eksper") ||
    normalized.includes("bilirkişi") ||
    normalized.includes("bilirkisi")
  ) {
    return "EXPERT_REVIEW";
  }
  if (normalized.includes("karar")) {
    return "DECIDED";
  }
  if (normalized.includes("kapal") || normalized.includes("sonuç")) {
    return "CLOSED";
  }
  return null;
}

export function findFolderByArbitrationStatus(
  tree: FolderNode[],
  status: ArbitrationStatus,
): FolderNode | null {
  const root = findArbitrationRoot(tree);
  if (!root?.children) return null;

  const targetId = ARBITRATION_STATUS_FOLDER_IDS[status];
  for (const folder of root.children) {
    if ((targetId && folder.id === targetId) || getArbitrationStatusFromFolder(folder) === status) {
      return folder;
    }
  }
  return null;
}

export const DMS_SYSTEM_ROOTS = {
  GENERAL: "Genel Davalar",
  ARBITRATION: "Sigorta Tahkim",
} as const;

const ARBITRATION_ROOT_NAMES = new Set([
  DMS_SYSTEM_ROOTS.ARBITRATION,
  "Tahkim Dosyaları",
  "Sigorta Tahkim",
]);

export function findFolderNode(tree: FolderNode[], id: string): FolderNode | null {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findFolderNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function findFolderNodeByName(tree: FolderNode[], name: string): FolderNode | null {
  for (const node of tree) {
    if (node.name === name) return node;
    if (node.children) {
      const found = findFolderNodeByName(node.children, name);
      if (found) return found;
    }
  }
  return null;
}

export function findArbitrationRoot(tree: FolderNode[]): FolderNode | null {
  const byId = findFolderNode(tree, DMS_ARBITRATION_ROOT_ID);
  if (byId) return byId;

  for (const name of ARBITRATION_ROOT_NAMES) {
    const byName = findFolderNodeByName(tree, name);
    if (byName) return byName;
  }

  return null;
}

export function findGeneralRoot(tree: FolderNode[]): FolderNode | null {
  const byId = findFolderNode(tree, DMS_GENERAL_ROOT_ID);
  if (byId) return byId;

  for (const name of [DMS_SYSTEM_ROOTS.GENERAL, "Genel Davalar"]) {
    const byName = findFolderNodeByName(tree, name);
    if (byName) return byName;
  }

  return tree.find((node) => node.isSystem && node.name.toLowerCase().includes("genel")) ?? null;
}

/** Browse (/documents): Genel Dosyalar + Sigorta Tahkim kökleri (tam alt ağaç). */
export function getBrowseFolderTree(tree: FolderNode[]): FolderNode[] {
  const roots: FolderNode[] = [];
  const general = findGeneralRoot(tree);
  const arbitration = findArbitrationRoot(tree);
  if (general) roots.push(general);
  if (arbitration) roots.push(arbitration);
  return roots;
}

/** Tahkim detay: Sigorta Tahkim kökü ve tüm alt ağaç. */
export function getArbitrationFolderTree(tree: FolderNode[]): FolderNode[] {
  const root = findArbitrationRoot(tree);
  return root ? [root] : [];
}

/** Dava detay: Genel Dosyalar alt ağacı. */
export function getCaseFolderTree(tree: FolderNode[]): FolderNode[] {
  const generalRoot = findGeneralRoot(tree);
  if (!generalRoot) return [];
  return generalRoot.children?.length ? generalRoot.children : [generalRoot];
}

/** Genel Davalar: Genel Dosyalar kökü ve tüm alt ağaç. */
export function getGeneralFolderTree(tree: FolderNode[]): FolderNode[] {
  const root = findGeneralRoot(tree);
  return root ? [root] : [];
}

export type SidebarFolderItem = FolderNode & { depth?: number };

/** Sol menü: Genel Davalar altındaki doğrudan klasörler/dava dosyaları (alt kırılımlar hariç). */
export function getGeneralSidebarFolders(tree: FolderNode[]): SidebarFolderItem[] {
  const root = findGeneralRoot(tree);
  if (!root?.children?.length) return [];

  const items: SidebarFolderItem[] = [];
  const visited = new Set<string>();

  for (const node of root.children) {
    if (visited.has(node.id)) continue;
    visited.add(node.id);
    items.push({ ...node, depth: 0 });
  }
  return items;
}

/** Sol menü: Sigorta Tahkim altındaki durum + dosya klasörleri. */
export function getArbitrationSidebarFolders(tree: FolderNode[]): FolderNode[] {
  const root = findArbitrationRoot(tree);
  if (!root?.children?.length) return [];

  const items: FolderNode[] = [];
  for (const statusFolder of root.children) {
    items.push(statusFolder);
    for (const caseFolder of statusFolder.children ?? []) {
      if (caseFolder.arbitrationCaseId) {
        items.push(caseFolder);
      }
    }
  }
  return items;
}

export function isFolderDescendant(
  tree: FolderNode[],
  ancestorId: string,
  candidateId: string,
): boolean {
  const ancestor = findFolderNode(tree, ancestorId);
  if (!ancestor?.children?.length) return false;

  const search = (nodes: FolderNode[]): boolean =>
    nodes.some(
      (node) => node.id === candidateId || (node.children?.length ? search(node.children) : false),
    );

  return search(ancestor.children);
}

/** Prevents dropping a folder onto itself or into its own descendants. */
export function isInvalidFolderMove(
  tree: FolderNode[],
  draggedFolderId: string,
  targetFolderId: string,
): boolean {
  return (
    draggedFolderId === targetFolderId ||
    isFolderDescendant(tree, draggedFolderId, targetFolderId)
  );
}

export function folderHasContent(folder: FolderNode): boolean {
  return (folder.documentCount ?? 0) > 0 || (folder.children?.length ?? 0) > 0;
}

export function flattenFolderTree(nodes: FolderNode[]): FolderNode[] {
  const result: FolderNode[] = [];

  const walk = (items: FolderNode[], parentId: string | null) => {
    for (const node of items) {
      result.push({ ...node, parentId: node.parentId ?? parentId, children: undefined });
      if (node.children?.length) walk(node.children, node.id);
    }
  };

  walk(nodes, null);
  return result;
}

export function buildFolderTreeFromFlat(folders: FolderNode[]): FolderNode[] {
  const idSet = new Set(folders.map((folder) => folder.id));
  const nodeMap = new Map(
    folders.map((folder) => [folder.id, { ...folder, children: [] as FolderNode[] }]),
  );
  const roots: FolderNode[] = [];

  for (const folder of folders) {
    const node = nodeMap.get(folder.id)!;
    const parentId = folder.parentId;
    if (parentId && idSet.has(parentId)) {
      nodeMap.get(parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  }

  const clean = (items: FolderNode[]): FolderNode[] =>
    items.map((node) => ({
      ...node,
      children: node.children?.length ? clean(node.children) : undefined,
    }));

  return clean(roots);
}

/** Scoped manage views use the same global tree as /documents, filtered by case or arbitration id. */
export function filterFolderTreeForScope(tree: FolderNode[], scope: DmsScope): FolderNode[] {
  const flat = flattenFolderTree(tree);
  const filtered = flat.filter((folder) => {
    if (scope.arbitrationCaseId) return folder.arbitrationCaseId === scope.arbitrationCaseId;
    if (scope.caseId) return folder.caseId === scope.caseId;
    return true;
  });
  return buildFolderTreeFromFlat(filtered);
}

export function moveFolderInTree(
  folders: FolderNode[],
  folderId: string,
  targetParentId: string | null,
): FolderNode[] {
  let nodeToMove: FolderNode | null = null;

  const removeNode = (nodes: FolderNode[]): FolderNode[] =>
    nodes
      .filter((node) => {
        if (node.id === folderId) {
          nodeToMove = { ...node, parentId: targetParentId };
          return false;
        }
        return true;
      })
      .map((node) => ({
        ...node,
        children: node.children ? removeNode(node.children) : undefined,
      }));

  const treeWithoutNode = removeNode(structuredClone(folders));
  if (!nodeToMove) return folders;

  if (targetParentId === null) {
    return [...treeWithoutNode, nodeToMove];
  }

  const addToParent = (nodes: FolderNode[]): FolderNode[] =>
    nodes.map((node) => {
      if (node.id === targetParentId) {
        return { ...node, children: [...(node.children ?? []), nodeToMove!] };
      }
      return { ...node, children: node.children ? addToParent(node.children) : undefined };
    });

  return addToParent(treeWithoutNode);
}

export function addFolderToTree(
  folders: FolderNode[],
  folder: FolderNode,
  parentId: string | null,
): FolderNode[] {
  if (!parentId) return [...folders, folder];

  const insert = (nodes: FolderNode[]): FolderNode[] =>
    nodes.map((node) => {
      if (node.id === parentId) {
        return { ...node, children: [...(node.children ?? []), folder] };
      }
      return { ...node, children: node.children ? insert(node.children) : undefined };
    });

  return insert(structuredClone(folders));
}

export function removeFolderFromTree(folders: FolderNode[], folderId: string): FolderNode[] {
  return folders
    .filter((node) => node.id !== folderId)
    .map((node) => ({
      ...node,
      children: node.children ? removeFolderFromTree(node.children, folderId) : undefined,
    }));
}

export function replaceFolderInTree(
  folders: FolderNode[],
  tempId: string,
  folder: FolderNode,
): FolderNode[] {
  return folders.map((node) => {
    if (node.id === tempId) return folder;
    return {
      ...node,
      children: node.children ? replaceFolderInTree(node.children, tempId, folder) : undefined,
    };
  });
}

export function renameFolderInTree(
  folders: FolderNode[],
  folderId: string,
  name: string,
): FolderNode[] {
  return folders.map((node) => {
    if (node.id === folderId) return { ...node, name };
    return {
      ...node,
      children: node.children ? renameFolderInTree(node.children, folderId, name) : undefined,
    };
  });
}
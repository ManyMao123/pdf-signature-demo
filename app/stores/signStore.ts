import { defineStore } from "pinia";

export interface Sign {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  strokeStyle?: string;
  signature?: string; // 存 dataURL
}

export const useSignBlockStore = defineStore("signBlockStore", () => {
  const signBlocks = ref<Sign[]>([]);

  let nextId = 1;

  // 新增矩形
  function addSignBlock(rect: Omit<Sign, "id">) {
    const blockData = { id: (nextId++).toString(), ...rect };
    signBlocks.value.push(blockData);
  }

  // 刪除矩形
  function removeSignBlock(id: string) {
    signBlocks.value = signBlocks.value.filter((r) => r.id !== id);
  }

  // 更新矩形簽名
  function setSignature(id: string, signature: string) {
    const signBlock = signBlocks.value.find((r) => r.id === id);
    if (signBlock) signBlock.signature = signature;
  }

  // 清空所有矩形
  function clearAll() {
    signBlocks.value = [];
  }

  return {
    signBlocks,
    addSignBlock,
    removeSignBlock,
    setSignature,
    clearAll,
  };
});

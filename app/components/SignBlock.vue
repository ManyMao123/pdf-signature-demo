<template>
  <div class="signature-container relative">
    <Button
      variant="link"
      class="absolute right-0 top-0 self-end px-2 py-0 gap-1 cursor-pointer"
      @click="clearCanvas"
      tabindex="-1"
    >
      <Eraser />
      清除
    </Button>

    <canvas ref="canvasRef" class="signature-canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { Button } from "./ui/button";
import { Eraser } from "lucide-vue-next";
import { useCanvas } from "@/composables/useCanvas";
import { useCanvasDrawing } from "@/composables/useCanvasDrawing";
import type { Sign } from "@/stores/signStore";
import { useSignBlockStore } from "@/stores/signStore";

const { canvasRef, ctx, clearCanvas } = useCanvas();

const { setSignature } = useSignBlockStore();

// 綁定canvasRef的繪製功能
useCanvasDrawing({ ctx, canvasRef, color: "#000000", lineWidth: 3 });

// 儲存簽名
function confirmSignature(sign: Sign) {
  if (!canvasRef.value) return;

  const dataUrl = canvasRef.value.toDataURL("image/png");
  setSignature(sign.id, dataUrl);
}

defineExpose({ confirmSignature });
</script>

<style lang="scss" scoped>
.signature-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.signature-canvas {
  border: 1px solid #ccc;
  width: 100%;
  height: 200px;
  touch-action: none; /* 禁止手勢滑動 */
}
</style>

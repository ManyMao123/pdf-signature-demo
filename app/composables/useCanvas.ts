// /composables/useCanvas.ts
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useElementSize } from "@vueuse/core";

export function useCanvas() {
  const canvasRef = ref<HTMLCanvasElement | null>(null);
  const ctx = ref<CanvasRenderingContext2D | null>(null);

  // 監聽 canvas 元素的尺寸
  const { width, height } = useElementSize(canvasRef);

  /** 初始化 Canvas 並回傳 context */
  const initCanvas = () => {
    if (!canvasRef.value) return;
    ctx.value = canvasRef.value.getContext("2d");

    resizeCanvas();
  };

  /** 依據當前元素大小重設 canvas 尺寸 */
  const resizeCanvas = () => {
    if (!canvasRef.value || !ctx.value) return;
    canvasRef.value.width = width.value;
    canvasRef.value.height = height.value;
  };

  /** 清空畫面 */
  const clearCanvas = () => {
    if (!ctx.value || !canvasRef.value) return;
    ctx.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  };

  /** 當尺寸變化時自動重繪 */
  watch([width, height], () => {
    resizeCanvas();
  });

  onMounted(initCanvas);
  onBeforeUnmount(() => clearCanvas());

  return {
    canvasRef,
    ctx,
    initCanvas,
    resizeCanvas,
    clearCanvas,
  };
}

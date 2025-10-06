// /composables/useCanvasDrawing.ts
import { ref, onMounted, onBeforeUnmount } from "vue";
import type { Ref } from "vue";

interface UseCanvasDrawingOptions {
  ctx: Ref<CanvasRenderingContext2D | null>;
  canvasRef: Ref<HTMLCanvasElement | null>;
  color?: string;
  lineWidth?: number;
}

export function useCanvasDrawing({
  ctx,
  canvasRef,
  color = "#000",
  lineWidth = 2,
}: UseCanvasDrawingOptions) {
  const isDrawing = ref(false);

  // --- 共用方法 ---
  const getRect = () => canvasRef.value!.getBoundingClientRect();

  function getMousePos(e: MouseEvent) {
    const rect = getRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function getTouchPos(e: TouchEvent) {
    const t = e.touches[0] ?? e.changedTouches[0];
    if (!t) return null;
    const rect = getRect();
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  }

  /**
   * 開始新的筆畫。
   * @param x - 起始點的 X 座標。
   * @param y - 起始點的 Y 座標。
   */
  function beginAt(x: number, y: number) {
    if (!ctx.value) return;
    ctx.value.beginPath();
    ctx.value.moveTo(x, y);
  }

  /**
   * 📈 繪製筆畫中的線段
   *
   * 從上一次的座標連線到新的座標 (x, y)，
   * 並立即描出線條。
   * 通常在滑鼠或觸控移動事件中呼叫多次。
   *
   * @param x - 目標 X 座標（相對於 canvas 左上角）
   * @param y - 目標 Y 座標（相對於 canvas 左上角）
   */
  function strokeTo(x: number, y: number) {
    if (!ctx.value) return;
    ctx.value.lineTo(x, y);
    ctx.value.strokeStyle = color;
    ctx.value.lineWidth = lineWidth;
    ctx.value.lineCap = "round";
    ctx.value.lineJoin = "round";
    ctx.value.stroke();
  }

  /** 結束筆畫 */
  function endDraw() {
    if (!ctx.value) return;
    isDrawing.value = false;
    ctx.value.closePath();
  }

  // --- 滑鼠處理 (Mouse Handlers) ---
  function startDrawingMouse(e: MouseEvent) {
    if (!canvasRef.value || !ctx.value) return;
    isDrawing.value = true;
    const pos = getMousePos(e);
    beginAt(pos.x, pos.y);
  }

  function drawMouse(e: MouseEvent) {
    if (!isDrawing.value || !ctx.value || !canvasRef.value) return;
    const pos = getMousePos(e);
    strokeTo(pos.x, pos.y);
  }

  function stopDrawingMouse(e?: MouseEvent) {
    if (!isDrawing.value) return;
    endDraw();
  }

  // --- 觸碰處理 (Touch Handlers) ---
  function startDrawingTouch(e: TouchEvent) {
    if (!canvasRef.value || !ctx.value) return;

    e.preventDefault(); // 防止頁面滾動

    isDrawing.value = true;
    const pos = getTouchPos(e);
    if (!pos) return;
    beginAt(pos.x, pos.y);
  }

  function drawTouch(e: TouchEvent) {
    if (!isDrawing.value || !ctx.value || !canvasRef.value) return;
    e.preventDefault();
    const pos = getTouchPos(e);
    if (!pos) return;
    strokeTo(pos.x, pos.y);
  }

  function stopDrawingTouch(e: TouchEvent) {
    endDraw();
  }

  onMounted(() => {
    if (!canvasRef.value) return;

    // mouse
    canvasRef.value.addEventListener("mousedown", startDrawingMouse);
    canvasRef.value.addEventListener("mousemove", drawMouse);
    canvasRef.value.addEventListener("mouseup", stopDrawingMouse);
    canvasRef.value.addEventListener("mouseleave", stopDrawingMouse);

    // touch: passive設置為fase用以阻止預設行為
    canvasRef.value.addEventListener("touchstart", startDrawingTouch, {
      passive: false,
    });
    canvasRef.value.addEventListener("touchmove", drawTouch, {
      passive: false,
    });
    canvasRef.value.addEventListener("touchend", stopDrawingTouch);
    canvasRef.value.addEventListener("touchcancel", stopDrawingTouch);
  });

  onBeforeUnmount(() => {
    if (!canvasRef.value) return;

    // mouse
    canvasRef.value.removeEventListener("mousedown", startDrawingMouse);
    canvasRef.value.removeEventListener("mousemove", drawMouse);
    canvasRef.value.removeEventListener("mouseup", stopDrawingMouse);
    canvasRef.value.removeEventListener("mouseleave", stopDrawingMouse);

    // touch
    canvasRef.value.removeEventListener("touchstart", startDrawingTouch);
    canvasRef.value.removeEventListener("touchmove", drawTouch);
    canvasRef.value.removeEventListener("touchend", stopDrawingTouch);
    canvasRef.value.removeEventListener("touchcancel", stopDrawingTouch);
  });

  return {
    isDrawing,
    // mouse handlers (也可用於template綁定)
    startDrawingMouse,
    drawMouse,
    stopDrawingMouse,
    // touch handlers (也可用於template綁定)
    startDrawingTouch,
    drawTouch,
    stopDrawingTouch,
    endDraw,
  };
}

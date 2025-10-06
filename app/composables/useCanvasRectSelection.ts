import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import type { Ref } from "vue";
import { useSignBlockStore, type Sign } from "@/stores/signStore";
import { storeToRefs } from "pinia";

export function useCanvasRectSelection(
  rectCanvasRef: Ref<HTMLCanvasElement | null>,
  signatureCanvasRef: Ref<HTMLCanvasElement | null>
) {
  const signBlockStore = useSignBlockStore();
  const { signBlocks } = storeToRefs(signBlockStore);

  const isDrawing = ref(false);
  const startPoint = ref<{ x: number; y: number } | null>(null);

  // 簽名圖片快取
  const imageCache = new Map<string, HTMLImageElement>();

  // 獲得坐標
  const getCanvasCoords = (x: number, y: number) => {
    if (!rectCanvasRef.value) return { x: 0, y: 0 };
    const rect = rectCanvasRef.value.getBoundingClientRect();

    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    const scaleX = rectCanvasRef.value.width / rect.width;
    const scaleY = rectCanvasRef.value.height / rect.height;

    return {
      x: (x - rect.left) * scaleX,
      y: (y - rect.top) * scaleY,
    };
  };

  // 繪製 badge 提示欄位名稱
  function drawBadge(ctx: CanvasRenderingContext2D, b: Sign, index: number) {
    const badgeText = `欄位${index + 1}`;
    const padding = 4;
    ctx.font = "12px sans-serif";

    const textWidth = ctx.measureText(badgeText).width;
    const textHeight = 12; // 大約高度
    const badgeX = b.x;
    const badgeY = b.y - textHeight - padding * 2; // 放在矩形上方外側

    // 繪製背景
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(
      badgeX,
      badgeY,
      textWidth + padding * 2,
      textHeight + padding * 2
    );

    // 繪製文字
    ctx.fillStyle = "white";
    ctx.fillText(
      badgeText,
      badgeX + padding,
      badgeY + textHeight + padding / 2
    );
  }

  // 繪製所有矩形
  function drawAllRects() {
    if (!rectCanvasRef.value || !signatureCanvasRef.value) return;

    const rectCtx = rectCanvasRef.value.getContext("2d")!;
    rectCtx.clearRect(
      0,
      0,
      rectCanvasRef.value.width,
      rectCanvasRef.value.height
    );

    const sigCtx = signatureCanvasRef.value.getContext("2d")!;
    sigCtx.clearRect(
      0,
      0,
      signatureCanvasRef.value.width,
      signatureCanvasRef.value.height
    );

    signBlocks.value.forEach((b: Sign, index) => {
      // 繪製矩形
      rectCtx.strokeStyle = b.strokeStyle || "#A3D977";
      rectCtx.lineWidth = 2;
      rectCtx.strokeRect(b.x, b.y, b.width, b.height);

      drawBadge(rectCtx, b, index);

      // 如果已經有簽名，就畫到 signatureCanvas
      if (b.signature) {
        let img = imageCache.get(b.id);
        if (!img || img.src !== b.signature) {
          img = new Image();
          img.src = b.signature;
          img.onload = () => drawAllRects(); // 簽名載入後重新繪製
          imageCache.set(b.id, img);
          return; // 等圖片載入完成再繪
        }

        sigCtx.drawImage(img, b.x, b.y, b.width, b.height);
      }
    });
  }

  // ----------------- Mouse 框選事件 -----------------
  function onMouseDown(e: MouseEvent) {
    const pos = getCanvasCoords(e.clientX, e.clientY);
    startPoint.value = pos;
    isDrawing.value = true;
  }

  function onMouseMove(e: MouseEvent) {
    if (!isDrawing.value || !startPoint.value) return;
    const pos = getCanvasCoords(e.clientX, e.clientY);

    // 畫臨時矩形
    drawAllRects();

    const ctx = rectCanvasRef.value!.getContext("2d")!;
    ctx.setLineDash([5, 3]);
    ctx.strokeStyle = "#A3D977";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      Math.min(startPoint.value.x, pos.x),
      Math.min(startPoint.value.y, pos.y),
      Math.abs(pos.x - startPoint.value.x),
      Math.abs(pos.y - startPoint.value.y)
    );
    ctx.setLineDash([]);
  }

  function onMouseUp(e: MouseEvent) {
    if (!isDrawing.value || !startPoint.value) return;
    const pos = getCanvasCoords(e.clientX, e.clientY);

    // 計算矩形範圍，避免負寬高
    const x = Math.min(startPoint.value.x, pos.x);
    const y = Math.min(startPoint.value.y, pos.y);
    const width = Math.abs(pos.x - startPoint.value.x);
    const height = Math.abs(pos.y - startPoint.value.y);

    // 儲存矩形
    signBlockStore.addSignBlock({
      x,
      y,
      width,
      height,
    });

    drawAllRects();

    isDrawing.value = false;
    startPoint.value = null;
  }

  // ----------------- Touch 框選事件 -----------------
  let longPressTimer: number | null = null;
  const longPressDuration = 800; // ms

  // 框選模式
  const isSelectionMode = ref(false);

  function onTouchStart(e: TouchEvent) {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (!touch) return;

      // 開始長按計時
      longPressTimer = window.setTimeout(() => {
        isSelectionMode.value = true;
        isDrawing.value = true;
        e.preventDefault();

        // 觸發框選的初始點
        onMouseDown({
          clientX: touch.clientX,
          clientY: touch.clientY,
        } as unknown as MouseEvent);
      }, longPressDuration);
    } else {
      // 多指觸控：取消長按，退出框選
      if (longPressTimer) clearTimeout(longPressTimer);
      longPressTimer = null;
      isDrawing.value = false;
      isSelectionMode.value = false;
    }
  }

  function onTouchMove(e: TouchEvent) {
    if (isDrawing.value && e.touches.length === 1 && e.cancelable) {
      e.preventDefault(); // 阻止單指拖動時滾動
      const touch = e.touches[0];
      if (!touch) return;
      onMouseMove({
        clientX: touch.clientX,
        clientY: touch.clientY,
      } as MouseEvent);
    }
  }

  function onTouchEnd(e: TouchEvent) {
    // 結束長按計時（還沒進入框選就鬆手）
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }

    if (isDrawing.value) {
      const touch = e.changedTouches[0];
      if (!touch) return;

      onMouseUp({
        clientX: touch.clientX,
        clientY: touch.clientY,
      } as MouseEvent);

      isDrawing.value = false;
      isSelectionMode.value = false;
    }
  }

  onMounted(() => {
    if (!rectCanvasRef.value) return;
    rectCanvasRef.value.addEventListener("mousedown", onMouseDown);
    rectCanvasRef.value.addEventListener("mousemove", onMouseMove);
    rectCanvasRef.value.addEventListener("mouseup", onMouseUp);
    rectCanvasRef.value.addEventListener("mouseleave", onMouseUp);

    rectCanvasRef.value.addEventListener("touchstart", onTouchStart, {
      passive: false,
    });
    rectCanvasRef.value.addEventListener("touchmove", onTouchMove, {
      passive: false,
    });
    rectCanvasRef.value.addEventListener("touchend", onTouchEnd);
  });

  onBeforeUnmount(() => {
    if (!rectCanvasRef.value) return;
    rectCanvasRef.value.removeEventListener("mousedown", onMouseDown);
    rectCanvasRef.value.removeEventListener("mousemove", onMouseMove);
    rectCanvasRef.value.removeEventListener("mouseup", onMouseUp);
    rectCanvasRef.value.removeEventListener("mouseleave", onMouseUp);

    rectCanvasRef.value.removeEventListener("touchstart", onTouchStart);
    rectCanvasRef.value.removeEventListener("touchmove", onTouchMove);
    rectCanvasRef.value.removeEventListener("touchend", onTouchEnd);
  });

  // signBlocks 變化時自動重繪
  watch(signBlocks, () => drawAllRects(), { deep: true });

  return {
    drawAllRects,
    isDrawing,
    isSelectionMode,
  };
}

<template>
  <div
    class="pdf-container relative w-[1200px] h-[1360px] min-w-max select-none"
    ref="container"
  >
    <canvas ref="pdfCanvas"></canvas>
    <canvas ref="signatureCanvas" class="absolute top-0 left-0"></canvas>
    <canvas ref="rectCanvas" class="absolute top-0 left-0"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";
import { useCanvasRectSelection } from "@/composables/useCanvasRectSelection";
import { PDFDocument } from "pdf-lib";
import { useSignBlockStore } from "@/stores/signStore";
import { storeToRefs } from "pinia";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const container = ref<HTMLDivElement | null>(null);
const pdfCanvas = ref<HTMLCanvasElement | null>(null);
const signatureCanvas = ref<HTMLCanvasElement | null>(null);
const rectCanvas = ref<HTMLCanvasElement | null>(null);

const signBlockStore = useSignBlockStore();
const { signBlocks } = storeToRefs(signBlockStore);

const { isSelectionMode } = useCanvasRectSelection(rectCanvas, signatureCanvas);

const emit = defineEmits(["update:selectionMode"]);

// 暫存頁面物件（避免每次重載 PDF）
let pdfPage: any = null;
// 避免PDF重複渲染
let isRendering = false;

const resizeCanvas = async () => {
  if (!pdfCanvas.value || !container.value || !pdfPage) return;
  if (isRendering) return;

  isRendering = true;
  try {
    const canvas = pdfCanvas.value;
    const ctx = canvas.getContext("2d")!;

    // 以當前 container 寬度作為 canvas 寬度
    const containerWidth = container.value.clientWidth > 450 ? 1200 : 450;
    // 計算 scale，保持 PDF 原始比例
    const unscaledViewport = pdfPage.getViewport({ scale: 1 });
    const scale = containerWidth / unscaledViewport.width;

    // DPI scaling 避免 Retina 模糊
    const dpr = window.devicePixelRatio || 1;
    const viewport = pdfPage.getViewport({ scale: scale * dpr });

    canvas.width = viewport.width * dpr;
    canvas.height = viewport.height * dpr;

    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;

    ctx.setTransform(1, 0, 0, 1, 0, 0); // 重置 transform
    ctx.scale(dpr, dpr);

    await pdfPage.render({ canvasContext: ctx, viewport }).promise;
  } catch (err: any) {
    if (err?.name !== "RenderingCancelledException") {
      console.error(err);
    }
  } finally {
    isRendering = false;
  }
};

// 同步矩形畫布及簽名畫布
function syncAllCanvasSize() {
  if (!pdfCanvas.value || !rectCanvas.value || !signatureCanvas.value) return;

  [rectCanvas.value, signatureCanvas.value].forEach((c) => {
    c.width = pdfCanvas.value!.width;
    c.height = pdfCanvas.value!.height;

    c.style.width = pdfCanvas.value!.style.width;
    c.style.height = pdfCanvas.value!.style.height;
  });
}

// 載入 Pdf
const loadPdf = async (url: string) => {
  const loadingTask = pdfjsLib.getDocument(url);
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);
  pdfPage = page;

  await resizeCanvas();
  syncAllCanvasSize();
};

// 匯出 Pdf
async function exportSignedPdf() {
  const pdfBytes = await fetch("/example.pdf").then((r) => r.arrayBuffer());
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const page = pdfDoc.getPage(0);

  for (const b of signBlocks.value) {
    if (b.signature) {
      const imgBytes = await fetch(b.signature).then((r) => r.arrayBuffer());
      const img = await pdfDoc.embedPng(imgBytes);

      const scaleX = pdfDoc.getPage(0).getWidth() / pdfCanvas.value!.width;
      const scaleY = pdfDoc.getPage(0).getHeight() / pdfCanvas.value!.height;

      page.drawImage(img, {
        x: b.x * scaleX,
        y: page.getHeight() - (b.y + b.height) * scaleY, // PDF 原點在左下
        width: b.width * scaleX,
        height: b.height * scaleY,
      });
    }
  }

  const finalPdf = await pdfDoc.save();
  const blob = new Blob([new Uint8Array(finalPdf)], {
    type: "application/pdf",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "signed.pdf";
  link.click();
}

onMounted(() => {
  loadPdf("/example.pdf");
});

watch(isSelectionMode, (newVal: boolean) =>
  emit("update:selectionMode", newVal)
);

defineExpose({ exportSignedPdf });
</script>

<style lang="scss" scoped></style>

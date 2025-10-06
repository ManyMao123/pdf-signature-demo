<template>
  <div class="flex gap-4 lg:gap-8 w-full h-full flex-col lg:flex-row">
    <Card
      class="pdf-card w-full h-full gap-4 flex-1 max-h-[480px] md:max-h-[585px] lg:max-h-[795px] lg:gap-6"
    >
      <CardHeader>
        <CardTitle class="flex flex-0 items-center gap-2">
          <FileText /> 合約文件
        </CardTitle>
        <CardDescription>行動裝置下，長按以進入框選模式</CardDescription>
      </CardHeader>
      <CardContent class="flex flex-1 overflow-hidden relative">
        <div class="flex flex-1 overflow-auto relative">
          <!-- 避免 SSR 生成的 HTML 與 client 端初次渲染不同 -->

          <PdfViewer
            ref="pdfViewerRef"
            v-model:selectionMode="isSelectionMode"
          />
        </div>

        <div v-show="isSelectionMode">
          <div
            class="overlay absolute top-0 bottom-0 left-0 right-0 pointer-events-none bg-black/10"
          ></div>
          <p class="absolute top-2 left-4 text-white bg-black/50 p-1 rounded">
            框選模式鎖定
          </p>
        </div>
      </CardContent>
    </Card>
    <Card
      class="w-full md:max-w-[512px] gap-4 lg:gap-6 max-h-[340px] md:max-h-[480px] lg:max-h-[795px]"
    >
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <PencilLine /> 簽名區
        </CardTitle>
      </CardHeader>
      <CardContent class="flex flex-col gap-2 overflow-auto">
        <div
          v-for="(sign, index) in signBlocks"
          :key="sign.id"
          class="relative"
        >
          <p>欄位{{ index + 1 }}</p>
          <Button
            variant="ghost"
            class="absolute top-8 right-2 w-[24px] h-[24px] rounded-lg py-0 px-0 cursor-pointer"
            @click="removeSignBlock(sign.id)"
          >
            <X />
          </Button>
          <img
            v-if="sign.signature"
            class="signature-display"
            :src="sign.signature"
            @click="handleSign(sign)"
          />
          <div v-else class="signature-display" @click="handleSign(sign)"></div>
        </div>
      </CardContent>
      <CardFooter class="flex gap-4 justify-center md:justify-end">
        <Button @click="downloadPdf">下載PDF</Button>
      </CardFooter>
    </Card>

    <Dialog v-model:open="open">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>簽名</DialogTitle>
          <DialogDescription>請在下方書寫。</DialogDescription>
        </DialogHeader>

        <SignBlock class="flex-1 w-full" ref="signBlockRef" />

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">取消</Button>
          </DialogClose>
          <Button type="submit" @click="handleSave">儲存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import PdfViewer from "~/components/PdfViewer.vue";
import SignBlock from "~/components/SignBlock.vue";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
  CardFooter,
} from "~/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileText, PencilLine, X } from "lucide-vue-next";
import { ref } from "vue";
import { useSignBlockStore } from "@/stores/signStore";
import { storeToRefs } from "pinia";
import type { Sign } from "@/stores/signStore";

const signBlockStore = useSignBlockStore();
const { signBlocks } = storeToRefs(signBlockStore);
const { removeSignBlock } = signBlockStore;

// 控制彈窗是否打開
const open = ref(false);
const signBlockRef = ref<InstanceType<typeof SignBlock> | null>(null);
const pdfViewerRef = ref<InstanceType<typeof PdfViewer> | null>(null);
const signingTarget: Ref<Sign | null> = ref(null);

// 行動裝置下：長按後切換框選模式
const isSelectionMode: Ref<Boolean> = ref(false);

// 簽名
const handleSign = (sign: Sign) => {
  open.value = true;
  signingTarget.value = sign;
};

// 儲存
const handleSave = () => {
  if (!signBlockRef.value || !signingTarget.value) return;

  signBlockRef.value.confirmSignature(signingTarget.value);
  open.value = false;
};

async function downloadPdf() {
  if (!pdfViewerRef.value) return;
  await pdfViewerRef.value.exportSignedPdf();
}
</script>

<style lang="scss" scoped>
.pdf-card {
  width: 100%;
  // min-width: 640px;

  @media (width > 1280px) {
    width: calc(100% - 512px);
    min-width: 640px;
  }
}
.signature-display {
  border: 1px solid #ccc;
  height: 160px;
  width: 100%;
}
</style>

<style lang="scss"></style>

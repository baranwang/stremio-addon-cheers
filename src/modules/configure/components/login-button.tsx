"use client";

import { RefreshCcwIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/dialog";
import { Spinner } from "@/components/spinner";
import { checkQrCodeStatus, generateQrCode } from "@/lib/bilibili";

const generateQrCodeFetcher = async ([, isOpen]: [string, boolean]) => {
  if (isOpen) {
    return generateQrCode();
  }
  return null;
};

const checkQrCodeStatusFetcher = async ([, key]: [string, string]) => {
  if (key) {
    return checkQrCodeStatus(key);
  }
  return null;
};

export const LoginButton: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const {
    data: qrCodeResp,
    isLoading,
    mutate: refreshQrCode,
  } = useSWR(["qrcode", isOpen], generateQrCodeFetcher, {
    dedupingInterval: 0,
    revalidateOnMount: true,
  });

  const { data: statusData } = useSWR(
    ["qrcode-status", qrCodeResp?.qrcode_key ?? ""],
    checkQrCodeStatusFetcher,
    {
      refreshInterval: 2000,
    },
  );

  useEffect(() => {
    if (statusData?.code === 0) {
      router.refresh();
    }
  }, [statusData?.code, router]);

  const message = useMemo(() => {
    if (!statusData || statusData?.code === 86101) {
      return "使用哔哩哔哩客户端扫码登录";
    }
    return statusData?.message;
  }, [statusData]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg">使用哔哩哔哩扫码登录</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>哔哩哔哩扫码登录</DialogTitle>
          <DialogDescription>
            Stremio Addon Cheers 只会记录你登录账号的 Cookie
            信息，用于获取视频列表、播放地址等数据，不会操作你的账号。
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="relative mx-auto size-40">
            {isLoading ? <Spinner /> : null}
            {qrCodeResp ? (
              <QRCodeSVG value={qrCodeResp.url} width={160} height={160} />
            ) : null}
            {statusData?.code === 86038 ? (
              <div
                className="absolute inset-0 flex cursor-pointer items-center justify-center bg-white/80"
                onClick={() => refreshQrCode()}
              >
                <RefreshCcwIcon />
              </div>
            ) : null}
          </div>
          <div className="mt-2 text-center text-muted-foreground text-sm">
            {message}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

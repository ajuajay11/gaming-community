"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

/** Mirrors `@mediapipe/face_detection` Results (runtime loads from CDN). */
type FaceResults = {
  detections: Array<{
    boundingBox: {
      xCenter: number;
      yCenter: number;
      width: number;
      height: number;
    };
  }>;
};

export type KycFaceCaptureHandle = {
  captureFrame: () => Promise<File | null>;
};

type Props = {
  onValidityChange?: (valid: boolean) => void;
};

const MEDIAPIPE_CAMERA =
  "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3.1675466862/camera_utils.js";
const MEDIAPIPE_FACE =
  "https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4.1646425229/face_detection.js";

function loadScriptOnce(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-mp-src="${src}"]`,
    );
    if (existing?.dataset.loaded === "1") {
      resolve();
      return;
    }
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(src)), {
        once: true,
      });
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.dataset.mpSrc = src;
    s.onload = () => {
      s.dataset.loaded = "1";
      resolve();
    };
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

type FaceDetectionInstance = {
  setOptions: (o: { model?: string; minDetectionConfidence?: number }) => void;
  onResults: (cb: (r: FaceResults) => void) => void;
  send: (i: { image: HTMLVideoElement }) => Promise<void>;
  close: () => Promise<void>;
};

type FaceDetectionCtor = new (config?: {
  locateFile?: (file: string, prefix?: string) => string;
}) => FaceDetectionInstance;

type CameraInstance = {
  start: () => Promise<void>;
  stop: () => Promise<void>;
};

type CameraCtor = new (
  video: HTMLVideoElement,
  options: {
    onFrame: () => Promise<void>;
    width?: number;
    height?: number;
    facingMode?: string;
  },
) => CameraInstance;

function getMediapipeGlobals(): {
  FaceDetection: FaceDetectionCtor;
  Camera: CameraCtor;
} {
  const w = window as unknown as {
    FaceDetection?: FaceDetectionCtor;
    Camera?: CameraCtor;
  };
  if (!w.FaceDetection || !w.Camera) {
    throw new Error("MediaPipe scripts are not loaded yet.");
  }
  return { FaceDetection: w.FaceDetection, Camera: w.Camera };
}

function evaluateDetection(results: FaceResults): boolean {
  if (!results.detections?.length) return false;
  const box = results.detections[0].boundingBox;
  const { xCenter, yCenter, width } = box;
  const isCentered =
    xCenter > 0.4 && xCenter < 0.6 && yCenter > 0.4 && yCenter < 0.6;
  const correctSize = width > 0.2 && width < 0.5;
  return isCentered && correctSize;
}

export const KycFaceCapture = forwardRef<KycFaceCaptureHandle, Props>(
  function KycFaceCapture({ onValidityChange }, ref) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const lastValidRef = useRef(false);
    const onValidityChangeRef = useRef(onValidityChange);
    onValidityChangeRef.current = onValidityChange;

    const [cameraError, setCameraError] = useState<string | null>(null);
    const [frameValid, setFrameValid] = useState(false);

    useImperativeHandle(ref, () => ({
      captureFrame: async () => {
        const video = videoRef.current;
        if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
          return null;
        }
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (!w || !h) return null;

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;
        ctx.drawImage(video, 0, 0, w, h);

        return new Promise((resolve) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(null);
                return;
              }
              resolve(
                new File([blob], "kyc-live-face.jpg", { type: "image/jpeg" }),
              );
            },
            "image/jpeg",
            0.92,
          );
        });
      },
    }));

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      let camera: CameraInstance | null = null;
      let faceDetection: FaceDetectionInstance | null = null;
      let cancelled = false;

      const run = async () => {
        try {
          setCameraError(null);
          await loadScriptOnce(MEDIAPIPE_CAMERA);
          await loadScriptOnce(MEDIAPIPE_FACE);
          const { FaceDetection, Camera } = getMediapipeGlobals();

          faceDetection = new FaceDetection({
            locateFile: (file: string) =>
              `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4.1646425229/${file}`,
          });

          faceDetection.setOptions({
            model: "short",
            minDetectionConfidence: 0.6,
          });

          faceDetection.onResults((results: FaceResults) => {
            if (cancelled) return;
            const ok = evaluateDetection(results);
            if (ok !== lastValidRef.current) {
              lastValidRef.current = ok;
              setFrameValid(ok);
              onValidityChangeRef.current?.(ok);
            }
          });

          camera = new Camera(video, {
            onFrame: async () => {
              if (!faceDetection || !video) return;
              await faceDetection.send({ image: video });
            },
            width: 640,
            height: 480,
            facingMode: "user",
          });

          await camera.start();
        } catch (e) {
          if (!cancelled) {
            setCameraError(
              e instanceof Error
                ? e.message
                : "Camera could not be started. Use HTTPS and allow access.",
            );
          }
        }
      };

      void run();

      return () => {
        cancelled = true;
        void (async () => {
          try {
            if (camera) await camera.stop();
          } catch {
            /* ignore */
          }
          try {
            if (faceDetection) await faceDetection.close();
          } catch {
            /* ignore */
          }
        })();
      };
    }, []);

    return (
      <div className="flex w-full flex-col gap-2">
        <div
          className={`relative aspect-[4/3] w-full max-w-[280px] overflow-hidden rounded-2xl bg-black/40 ${
            frameValid
              ? "ring-2 ring-emerald-400/80 ring-offset-2 ring-offset-[#0a0a0f]"
              : "ring-2 ring-red-500/50 ring-offset-2 ring-offset-[#0a0a0f]"
          }`}
        >
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            autoPlay
            playsInline
            muted
          />
        </div>
        <p className="text-[11px] leading-relaxed text-gray-500">
          Allow camera access. Center your face in the frame; the border turns
          green when position and distance look right. Snapshot is taken only
          when you submit.
        </p>
        {cameraError && (
          <p
            role="alert"
            className="text-[11px] text-red-300"
          >
            {cameraError}
          </p>
        )}
      </div>
    );
  },
);

"use client";

import { useRef, useState } from "react";

type Field = {
  id: string;
  label: string;
  digits: number;
  x: number;
  y: number;
  w: number;
  h: number;
  color?: string;
  fontSize?: number;
};

// Coordenadas em porcentagem relativas à arte original (900 x 1600).
const fields: Field[] = [
  { id: "federal", label: "Deputado federal", digits: 4, x: 27.33, y: 11.44, w: 45.56, h: 6.63, color: "#e6007e" },
  { id: "senador1", label: "Senador 1", digits: 3, x: 33.22, y: 34.06, w: 33.89, h: 6.69, color: "#ffffff" },
  { id: "senador2", label: "Senador 2", digits: 3, x: 33.22, y: 44.13, w: 33.89, h: 6.69, color: "#e6007e" },
  { id: "governador", label: "Governador", digits: 2, x: 23.89, y: 54.56, w: 22.33, h: 6.69, color: "#e6007e" },
  { id: "presidente", label: "Presidente", digits: 2, x: 51.11, y: 54.56, w: 22.33, h: 6.69, color: "#e6007e" },
];

const ART_WIDTH = 900;
const ART_HEIGHT = 1600;

export default function Home() {
  const [values, setValues] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(fields.map((field) => [field.id, Array(field.digits).fill("")]))
  );
  const inputRefs = useRef<Record<string, (HTMLInputElement | null)[]>>({});
  const imageRef = useRef<HTMLImageElement>(null);

  function updateDigit(field: Field, index: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    setValues((current) => {
      const next = [...current[field.id]];
      next[index] = digit;
      return { ...current, [field.id]: next };
    });
    if (digit && index < field.digits - 1) inputRefs.current[field.id]?.[index + 1]?.focus();
  }

  function handleKeyDown(field: Field, index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !values[field.id][index] && index > 0) {
      inputRefs.current[field.id]?.[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) inputRefs.current[field.id]?.[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < field.digits - 1) inputRefs.current[field.id]?.[index + 1]?.focus();
  }

  function handlePaste(field: Field, index: number, event: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    event.preventDefault();
    setValues((current) => {
      const next = [...current[field.id]];
      pasted.slice(0, field.digits - index).split("").forEach((digit, offset) => { next[index + offset] = digit; });
      return { ...current, [field.id]: next };
    });
    inputRefs.current[field.id]?.[Math.min(index + pasted.length, field.digits - 1)]?.focus();
  }

  function downloadImage() {
    const image = imageRef.current;
    if (!image?.complete || !image.naturalWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = ART_WIDTH;
    canvas.height = ART_HEIGHT;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(image, 0, 0, ART_WIDTH, ART_HEIGHT);

    fields.forEach((field) => {
      const digits = values[field.id];
      const cellWidth = (field.w / 100 * ART_WIDTH) / field.digits;
      const cellHeight = field.h / 100 * ART_HEIGHT;
      const fontSize = field.fontSize ?? Math.min(cellHeight * 0.72, cellWidth * 0.76);
      context.save();
      context.fillStyle = field.color ?? "#e6007e";
      context.font = `900 ${fontSize}px Arial, Helvetica, sans-serif`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      digits.forEach((digit, index) => {
        if (!digit) return;
        const centerX = (field.x / 100 * ART_WIDTH) + cellWidth * (index + 0.5);
        const centerY = (field.y / 100 * ART_HEIGHT) + cellHeight / 2;
        context.fillText(digit, centerX, centerY, cellWidth * 0.86);
      });
      context.restore();
    });

    const link = document.createElement("a");
    link.download = "santinho-personalizado.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function clearAll() {
    setValues(Object.fromEntries(fields.map((field) => [field.id, Array(field.digits).fill("")])));
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-5">
        <header className="w-full text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">Editor de santinho</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Preencha direto na imagem</h1>
          <p className="mt-2 text-sm text-slate-600">Clique nos quadrados, digite os números e baixe a arte pronta.</p>
        </header>

        <section className="w-full max-w-[450px] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/10 sm:p-4">
          <div className="relative mx-auto w-full overflow-hidden" style={{ aspectRatio: `${ART_WIDTH} / ${ART_HEIGHT}` }}>
            {/* A arte original é a base; os inputs transparentes ficam alinhados sobre os espaços vazios. */}
            <img
              ref={imageRef}
              src="/santinho.jpg"
              alt="Santinho eleitoral original"
              draggable={false}
              className="absolute inset-0 h-full w-full select-none object-fill"
              onLoad={() => {}}
            />
            {fields.map((field) => (
              <div
                key={field.id}
                aria-label={field.label}
                className="absolute grid"
                style={{
                  left: `${field.x}%`, top: `${field.y}%`, width: `${field.w}%`, height: `${field.h}%`,
                  gridTemplateColumns: `repeat(${field.digits}, minmax(0, 1fr))`,
                }}
              >
                {Array.from({ length: field.digits }, (_, index) => (
                  <input
                    key={`${field.id}-${index}`}
                    ref={(element) => {
                      inputRefs.current[field.id] ??= [];
                      inputRefs.current[field.id][index] = element;
                    }}
                    aria-label={`${field.label}, dígito ${index + 1}`}
                    autoComplete="off"
                    inputMode="numeric"
                    maxLength={1}
                    value={values[field.id][index]}
                    onChange={(event) => updateDigit(field, index, event.target.value)}
                    onKeyDown={(event) => handleKeyDown(field, index, event)}
                    onPaste={(event) => handlePaste(field, index, event)}
                    style={{ color: field.color ?? "#e6007e" }}
                    className="h-full min-w-0 rounded-[12%] border-2 border-transparent bg-transparent p-0 text-center text-[clamp(16px,5.5vw,34px)] font-black leading-none outline-none transition focus:border-blue-500/80 focus:bg-blue-500/10 focus:ring-2 focus:ring-blue-300/50"
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={downloadImage}
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              <DownloadIcon /> Baixar imagem PNG
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="min-h-12 rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
            >
              Limpar campos
            </button>
          </div>
        </section>
        <p className="max-w-lg text-center text-xs leading-relaxed text-slate-500">A imagem é exportada no tamanho original (900 × 1600). Os números são inseridos somente nos campos em branco; nada é enviado para um servidor.</p>
      </div>
    </main>
  );
}

function DownloadIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m7 10 5 5 5-5M12 15V3" />
    </svg>
  );
}

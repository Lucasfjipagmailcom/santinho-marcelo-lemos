# Editor de Santinho

Aplicação Next.js + Tailwind CSS para preencher os números diretamente sobre a imagem original e exportar um PNG.

## Requisitos
- Node.js 20.9 ou superior
- npm

## Executar

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Ajustar posições

As posições dos campos ficam no array `fields`, em `app/page.tsx`. `x`, `y`, `w` e `h` são porcentagens relativas à imagem original de 900 × 1600. Cada campo contém `digits`, que define quantos quadrados editáveis aparecem.

A arte fornecida está em `public/santinho.jpg`. A exportação é feita no navegador usando Canvas, sem backend.

import { Document, Packer, Paragraph, TextRun, ImageRun } from "docx";
import FileSaver from "file-saver";

interface LoadedImage {
  buffer: ArrayBuffer;
  width: number;
  height: number;
}

// Fetch image and get dimensions to prevent skewed rendering
async function fetchImage(url: string): Promise<LoadedImage | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ buffer, width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(blob);
    });
  } catch (error) {
    console.warn(`Export: Failed to fetch image ${url}`, error);
    return null;
  }
}

export const exportToWord = async (content: string, filename: string = "document.docx") => {
  const docFilename = filename.endsWith('.docx') ? filename : `${filename}.docx`;
  
  // Regex to match Markdown images: ![alt](url)
  const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  
  // 1. Pre-fetch all images
  const matches = [...content.matchAll(imgRegex)];
  const imageUrls = [...new Set(matches.map(m => m[2]))];
  const imageMap = new Map<string, LoadedImage>();

  if (imageUrls.length > 0) {
    await Promise.all(imageUrls.map(async (url) => {
      const data = await fetchImage(url);
      if (data) imageMap.set(url, data);
    }));
  }

  // 2. Parse content into Paragraphs
  const lines = content.split('\n');
  const children: Paragraph[] = [];

  for (const line of lines) {
    // Check for images in the line
    const lineMatches = [...line.matchAll(imgRegex)];

    if (lineMatches.length === 0) {
      children.push(new Paragraph({
        children: [new TextRun({ text: line, size: 24 })], // size is half-points, 24 = 12pt
        spacing: { after: 120 } // Space after paragraph
      }));
      continue;
    }

    let lastIndex = 0;
    const runChildren = [];

    for (const match of lineMatches) {
      // Text before image
      if (match.index! > lastIndex) {
        runChildren.push(new TextRun({
            text: line.substring(lastIndex, match.index),
            size: 24
        }));
      }

      const altText = match[1];
      const url = match[2];
      const imgData = imageMap.get(url);

      if (imgData) {
        // Constrain max width to ~500px (approx page width) while maintaining aspect ratio
        const maxWidth = 550;
        let finalWidth = imgData.width;
        let finalHeight = imgData.height;

        if (finalWidth > maxWidth) {
           const ratio = maxWidth / finalWidth;
           finalWidth = maxWidth;
           finalHeight = imgData.height * ratio;
        }

        runChildren.push(new ImageRun({
          data: imgData.buffer,
          transformation: {
            width: finalWidth,
            height: finalHeight,
          },
          altText: altText
        }));
      } else {
        // Fallback text if image load failed
        runChildren.push(new TextRun({ 
            text: ` [Image: ${altText}] `,
            bold: true,
            color: "FF0000",
            size: 24
        }));
      }

      lastIndex = match.index! + match[0].length;
    }

    // Text after last image
    if (lastIndex < line.length) {
      runChildren.push(new TextRun({
          text: line.substring(lastIndex),
          size: 24
      }));
    }

    children.push(new Paragraph({
      children: runChildren,
      spacing: { after: 120 }
    }));
  }

  // 3. Create Document
  const doc = new Document({
    sections: [{
      properties: {},
      children: children,
    }],
  });

  // 4. Generate & Save
  const blob = await Packer.toBlob(doc);
  FileSaver.saveAs(blob, docFilename);
};
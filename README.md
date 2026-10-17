# 妙笔生花 - AI 智能写作助手 (AI Writing Assistant)

**妙笔生花** 是一款基于 Google Gemini 和 OpenAI 技术的现代化智能写作辅助工具。它能够深度分析文章内容，提供从基础纠错到逻辑重构的全方位建议，帮助创作者打磨出更优质的内容。

![License](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)
![React](https://img.shields.io/badge/React-18-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF.svg)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)

## ✨ 功能特性

*   **全方位评分体系**：从总分、可读性、逻辑性、情感共鸣、创意度五个维度对文章进行量化评估。
*   **智能纠错与润色**：自动检测错别字、语法错误、标点误用，并提供专业的润色建议。
*   **逻辑结构可视化**：利用 D3.js 生成文章逻辑树状图，直观展示核心论点与支撑论据的层次结构。
*   **爆款标题分析**：分析当前标题的吸引力，预测传播潜质，并生成多个高点击率的替代标题。
*   **全文智能重写**：保留原意和语调的前提下，生成一份经过全面优化的润色版本。
*   **多模型支持**：默认支持 **Google Gemini (Flash/Pro)**，兼容 **OpenAI (GPT-4o)** 及其他兼容接口。
*   **便捷导出**：支持一键将润色后的内容导出为格式良好的 Word (.docx) 文档。
*   **现代化 UI/UX**：响应式设计，支持深色模式 (Dark Mode)，提供流畅的写作与阅读体验。

## 🛠 技术栈

*   **核心框架**: [React 18](https://react.dev/)
*   **构建工具**: [Vite](https://vitejs.dev/)
*   **语言**: [TypeScript](https://www.typescriptlang.org/)
*   **样式**: [Tailwind CSS](https://tailwindcss.com/)
*   **AI SDK**: [@google/genai](https://www.npmjs.com/package/@google/genai) (Gemini 2.0/1.5)
*   **数据可视化**: [D3.js](https://d3js.org/)
*   **文档处理**: [docx](https://docx.js.org/) (Word Export)
*   **Markdown 渲染**: [react-markdown](https://github.com/remarkjs/react-markdown)
*   **容器化**: Docker + Nginx

## 🚀 快速开始 (本地开发)

### 前置要求
*   Node.js >= 18
*   有效的 Google Gemini API Key 或 OpenAI API Key

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

虽然应用支持在界面中配置 API Key，但开发时推荐创建 `.env` 文件：

```env
# .env 文件
API_KEY=your_google_gemini_api_key
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173` 即可开始使用。

## 🐳 Docker 部署

项目包含完整的 `Dockerfile` 和 Nginx 配置，支持一键容器化部署。

### 1. 构建镜像

```bash
docker build -t ai-writing-assistant .
```

### 2. 运行容器

您可以直接在运行命令中注入 API Key，或者在 Web 界面中手动设置。

```bash
# 方式一：注入环境变量
docker run -d -p 3000:3000 \
  -e API_KEY=your_api_key_here \
  --name writing-assistant \
  ai-writing-assistant

# 方式二：不注入 Key (用户需在网页设置中自行填写)
docker run -d -p 3000:3000 \
  --name writing-assistant \
  ai-writing-assistant
```

访问 `http://localhost:3000` 使用应用。

## ⚙️ 模型配置

点击应用右上角的 **设置 (齿轮图标)** 可以进行高级配置：

*   **AI 提供商**: 切换 Google Gemini 或 OpenAI。
*   **API URL**: 如果使用 OpenAI 或 Gemini 的反向代理服务，可在此填入 Base URL。
*   **模型名称**: 自定义使用的模型版本 (如 `gemini-2.5-flash`, `gpt-4o`)。

## 📄 开源协议

本项目采用 [AGPL-3.0](LICENSE) 开源协议。
您可以自由地使用、修改和分发本项目，但请保留版权声明；若基于本项目对外提供网络服务，需同样以 AGPL-3.0 开源。

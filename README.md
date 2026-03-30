# GPT Pet

## 中文

`GPT Pet` 是一个运行在 `chatgpt.com` 页面上的浏览器扩展。  
它会把一只小宠物固定显示在 ChatGPT 对话框上方，并支持透明 `WebM` 宠物素材。

### 当前功能

- 自动识别 ChatGPT 对话框容器
- 将宠物固定在输入框上方偏右的位置
- 支持透明 `WebM` 视频宠物
- 当前默认宠物素材为 `来福`
- 点击宠物时会触发轻微的跳动反馈
- 对带少量绿边的视频做轻度去溢色处理

### 仓库结构

- `extension/manifest.json`
  扩展清单文件
- `extension/content.js`
  页面注入、定位、视频播放与轻度去绿边逻辑
- `extension/content.css`
  宠物样式与动画
- `extension/assets/laifu.webm`
  默认宠物素材

### 安装使用

1. 打开浏览器扩展页面
2. 开启开发者模式
3. 选择“加载已解压的扩展程序”
4. 选择目录：
   `/Users/zbw/Documents/New project/extension`
5. 打开或刷新 `https://chatgpt.com`

### 自定义宠物

如果你想替换默认宠物：

1. 准备一个透明背景的 `WebM` 视频
2. 替换 [laifu.webm](/Users/zbw/Documents/New%20project/extension/assets/laifu.webm)
3. 如有需要，调整 [content.js](/Users/zbw/Documents/New%20project/extension/content.js) 里的参数：
   `PET_WIDTH`
   `PET_HEIGHT`
   `PET_TOP_OFFSET`
   `PET_RIGHT_OFFSET`

### 说明

- 这个仓库现在只保留 ChatGPT 网页宠物扩展功能
- 之前的桌面宠物实验代码已经移除
- 推荐使用 Chrome、Edge 等 Chromium 浏览器

## English

`GPT Pet` is a browser extension for `chatgpt.com`.  
It places a small animated pet above the ChatGPT composer and supports transparent `WebM` pet assets.

### Current Features

- Automatically detects the ChatGPT composer surface
- Pins the pet above the input area near the top-right corner
- Supports transparent `WebM` pet videos
- Uses `LaiFu` as the default pet asset
- Plays a small hop animation when the pet is clicked
- Applies a light despill pass for videos with minor green edge spill

### Repository Structure

- `extension/manifest.json`
  Extension manifest
- `extension/content.js`
  Injection logic, positioning logic, video playback, and light despill processing
- `extension/content.css`
  Pet styling and animation
- `extension/assets/laifu.webm`
  Default pet asset

### Installation

1. Open your browser extensions page
2. Enable Developer Mode
3. Choose `Load unpacked`
4. Select:
   `/Users/zbw/Documents/New project/extension`
5. Open or refresh `https://chatgpt.com`

### Replace the Pet

To use your own pet asset:

1. Prepare a transparent-background `WebM`
2. Replace [laifu.webm](/Users/zbw/Documents/New%20project/extension/assets/laifu.webm)
3. If needed, tweak these values in [content.js](/Users/zbw/Documents/New%20project/extension/content.js):
   `PET_WIDTH`
   `PET_HEIGHT`
   `PET_TOP_OFFSET`
   `PET_RIGHT_OFFSET`

### Notes

- This repository now only keeps the ChatGPT web pet extension
- Earlier desktop pet experiments have been removed
- Chromium-based browsers are recommended

# GPT Pet

## 中文

`GPT Pet` 是一个运行在 `chatgpt.com` 页面上的浏览器扩展。  
它会把一只小宠物固定显示在 ChatGPT 对话框上方，并支持透明 `WebM` 宠物素材。

### 当前功能

- 自动识别 ChatGPT 对话框容器
- 将宠物固定在输入框上方偏右的位置
- 支持透明 `WebM` 视频宠物
- 当前默认宠物素材为 `来福`
- 支持在插件弹窗里切换内置宠物
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
- `extension/assets/chris.webm`
  第二个内置宠物素材
- `extension/popup.html`
  插件弹窗界面
- `extension/popup.js`
  宠物切换逻辑

### 安装使用

1. 打开浏览器扩展页面
2. 开启开发者模式
3. 选择“加载已解压的扩展程序”
4. 选择目录：
   `/Users/zbw/Documents/New project/extension`
5. 打开或刷新 `https://chatgpt.com`

### 手动新增宠物

如果你想在文件里新增一个宠物，而不是替换现有素材，需要改这四处：

1. 把新的透明 `WebM` 放进 `extension/assets/`
   例如：`extension/assets/mimi.webm`
2. 在 [manifest.json](/Users/zbw/Documents/New%20project/extension/manifest.json) 的 `web_accessible_resources` 里加入新文件
3. 在 [content.js](/Users/zbw/Documents/New%20project/extension/content.js) 的 `PET_LIBRARY` 里加入新宠物配置
4. 在 [popup.html](/Users/zbw/Documents/New%20project/extension/popup.html) 的下拉框里新增一个 `option`

示例：

- `manifest.json`
  加入 `"assets/mimi.webm"`
- `content.js`
  加入 `mimi: { file: "assets/mimi.webm", label: "喵～我是Mimi" }`
- `popup.html`
  加入 `<option value="mimi">Mimi</option>`

如果你只是想替换默认宠物，那么只需要直接替换 [laifu.webm](/Users/zbw/Documents/New%20project/extension/assets/laifu.webm)。

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
- Supports switching between built-in pets in the popup
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
- `extension/assets/chris.webm`
  Second built-in pet asset
- `extension/popup.html`
  Extension popup UI
- `extension/popup.js`
  Pet switching logic

### Installation

1. Open your browser extensions page
2. Enable Developer Mode
3. Choose `Load unpacked`
4. Select:
   `/Users/zbw/Documents/New project/extension`
5. Open or refresh `https://chatgpt.com`

### Add a New Pet Manually

If you want to add a new pet in the files instead of replacing an existing one, update these four places:

1. Put a new transparent `WebM` into `extension/assets/`
   Example: `extension/assets/mimi.webm`
2. Add the file to `web_accessible_resources` in [manifest.json](/Users/zbw/Documents/New%20project/extension/manifest.json)
3. Add a new pet entry to `PET_LIBRARY` in [content.js](/Users/zbw/Documents/New%20project/extension/content.js)
4. Add a new `<option>` to the dropdown in [popup.html](/Users/zbw/Documents/New%20project/extension/popup.html)

Example:

- `manifest.json`
  add `"assets/mimi.webm"`
- `content.js`
  add `mimi: { file: "assets/mimi.webm", label: "Meow, I'm Mimi" }`
- `popup.html`
  add `<option value="mimi">Mimi</option>`

If you only want to replace the default pet, you can simply replace [laifu.webm](/Users/zbw/Documents/New%20project/extension/assets/laifu.webm).

### Notes

- This repository now only keeps the ChatGPT web pet extension
- Earlier desktop pet experiments have been removed
- Chromium-based browsers are recommended

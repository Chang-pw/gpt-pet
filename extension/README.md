# GPT Pet Extension

## 中文

这是 `GPT Pet` 的浏览器扩展目录。  
扩展会在 `chatgpt.com` 的对话框上方显示一个小宠物。

### 主要文件

- `manifest.json`
- `content.js`
- `content.css`
- `assets/laifu.webm`
- `assets/chris.webm`
- `popup.html`
- `popup.css`
- `popup.js`

### 手动新增宠物

如果你想手动新增一只宠物，需要改这几处：

1. 把新的透明 `WebM` 放进 `assets/`
2. 在 `manifest.json` 里把这个文件加入 `web_accessible_resources`
3. 在 `content.js` 的 `PET_LIBRARY` 里新增配置
4. 在 `popup.html` 的下拉框里新增对应选项

例如新增 `mimi.webm`：

- `assets/mimi.webm`
- `manifest.json` 里加上 `"assets/mimi.webm"`
- `content.js` 里加上 `mimi: { file: "assets/mimi.webm", label: "喵～我是Mimi" }`
- `popup.html` 里加上 `<option value="mimi">Mimi</option>`

### 安装方式

1. 打开浏览器扩展页面
2. 开启开发者模式
3. 点击“加载已解压的扩展程序”
4. 选择当前目录

## English

This folder contains the browser extension for `GPT Pet`.  
The extension places a small pet above the ChatGPT composer on `chatgpt.com`.

### Main Files

- `manifest.json`
- `content.js`
- `content.css`
- `assets/laifu.webm`
- `assets/chris.webm`
- `popup.html`
- `popup.css`
- `popup.js`

### Add a Pet Manually

To add a new pet manually, update these places:

1. Put the new transparent `WebM` into `assets/`
2. Add the file to `web_accessible_resources` in `manifest.json`
3. Add a config entry to `PET_LIBRARY` in `content.js`
4. Add a matching option in `popup.html`

Example for `mimi.webm`:

- `assets/mimi.webm`
- add `"assets/mimi.webm"` in `manifest.json`
- add `mimi: { file: "assets/mimi.webm", label: "Meow, I'm Mimi" }` in `content.js`
- add `<option value="mimi">Mimi</option>` in `popup.html`

### Installation

1. Open your browser extensions page
2. Enable Developer Mode
3. Click `Load unpacked`
4. Select this folder

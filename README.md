# 大傷模擬技術考｜校園災害應變實境解謎訓練平台

三個災害應變實境解謎模擬整併後的主站，共用同一套設計系統與遊戲引擎。

## 網站結構

| 路徑 | 內容 |
| --- | --- |
| `index.html` | 訓練平台入口（三個任務的選單） |
| `zero-day/` | OP-01 零日攻擊：空襲避難 × 檢傷急救（原 `zero-day-attack` repo） |
| `mci/` | OP-02 大型車禍：校門口多車追撞大量傷患 |
| `earthquake/` | OP-03 重返 921：地震應變 × 骨折固定（原 `earthquake-simulation` repo） |
| `assets/style.css` | 共用設計系統（深色急救戰術風格） |
| `assets/engine.js` | 共用遊戲引擎（計時器、關卡切換、排序、密碼驗證、Toast） |

## 技術說明

- 純 HTML / CSS / JavaScript，無框架、無建置流程，直接以 GitHub Pages 部署即可。
- 所有關卡內容、通關密碼、Padlet 上傳連結與原版三個網頁完全相同。
- 原 `zero-day-attack` 與 `earthquake-simulation` 兩個 repo 的網址會自動轉址到本站對應頁面。

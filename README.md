# 小胡的 27 岁生日小屋

独立的生日网站：https://diosyang.github.io/birthday-hu/

森林绿旅行客厅，包含第一人称探索、旅行地图与 17 张合照、窗外烟花、小白兔、电视动画和宝丽莱 I-2 拍立得。点击留声机播放用户提供的《La vie en rose》。

进入房间后使用 WASD / 方向键移动，直接移动鼠标环顾，靠近物品按 F 互动；手机支持屏幕方向键与互动按钮。访问者无需登录。

## 本地运行与编辑

需要 Python 3。在仓库根目录执行：

```sh
python3 _publish/assemble.py
python3 -m http.server 8129 --bind 127.0.0.1 --directory _site
```

打开 http://127.0.0.1:8129/ 。源代码在 `site/` 中，文字、年龄与音乐配置在 `site/config.js`；房间布局在 `site/room.js`。修改源码后重新执行组装命令。

`_publish/manifest.json` 按顺序记录照片、音频和本地依赖的 Base64 分片，组装时校验完整归档的 SHA-256。生成的 `_site/` 是可部署到其他静态服务器的完整目录，不需要应用服务器、外部 CDN 或登录服务。

推送到 main 后，GitHub Actions 自动组装并发布到 GitHub Pages。仓库 Settings → Pages 的 Source 应保持 GitHub Actions。

这是独立的新网站，未修改原来的 `DiosYang/birthday-room`。Three.js 许可证随 `vendor/LICENSE` 提供；照片和音频由用户提供。

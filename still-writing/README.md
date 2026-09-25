# 还没写完 · MV

《还没写完》（tokeii）的 MV 源码：一支 4 分 50 秒、水彩绘本风格的 Q 版动画。一个白天上班、午夜才属于自己的小小创作者，一颗跟她回家的小念头，和她一笔一笔画出来的粉发看板娘桃桃。

这个 MV 参考了仓库根目录的 P(doom) MV 的做法：每一帧都是时间 `t` 的纯函数，画面由水彩色块和会“抖动”的墨线组成，按章节分镜，底部卡拉 OK 字幕。不同的是，这里的画笔是用 Canvas 2D 重写的，所以不需要显卡，普通 CPU 上每帧只要几十到几百毫秒。

## 目录

| 路径 | 内容 |
|---|---|
| [`STORYBOARD.md`](STORYBOARD.md) | 分镜：每一句歌词对应的画面 |
| [`ANIMATION_GUIDE.md`](ANIMATION_GUIDE.md) | 画每一章时用的引擎、角色、道具和风格说明 |
| [`src/ch/`](src/ch/) | 十个章节，每章一个文件 |
| [`src/core.js`](src/core.js) | 水彩画笔、墨线、相机、字、图层、纸张 |
| [`src/cast.js`](src/cast.js) | 角色：我、桃桃、团子、问号、念头星星、路人 |
| [`src/props.js`](src/props.js) | 场景和道具：她的房间（正面 / 反打 / 俯拍桌面）、夜晚城市、印章、“算了”云、月牙…… |
| [`src/lyrics.js`](src/lyrics.js) | 对齐到演唱的歌词，每个字都有时间 |
| [`src/timeline.js`](src/timeline.js) | 章节表、转场（翻页、溶、晕染）、卡拉 OK |
| [`studio.html`](studio.html) | 在浏览器里拖动时间轴预览（需要先下载字体） |
| [`render.mjs`](render.mjs) | 用 Node + @napi-rs/canvas 渲染帧，用 ffmpeg 合成 MP4 |

## 歌词是怎么对上时间的

用 MDX-Net（Kim_Vocal_2）把人声分离出来，用 SenseVoice 识别出每个字的时间戳，再把识别结果按拼音对齐到原歌词，得到每一句、每一个字的起始时间。卡拉 OK 就按这些时间一个字一个字地变色。

## 渲染

需要 Node.js 和 ffmpeg。

```bash
npm install                                          # 在仓库根目录
cd still-writing
node fetch-fonts.mjs                                 # 下载四个开源字体（霞鹜文楷、站酷快乐体、马善政、龙藏体）
node render.mjs --frames=0:290 --workers=4           # 画出所有帧到 out/frames（可断点续画）
node render.mjs --encode --out=out/still-writing.mp4 # 帧 + 歌曲 → MP4
```

检查画面：

```bash
node render.mjs --sheet=10,12,14,16,18,20 --cols=3 --out=out/check.jpg   # 缩略图拼版
node render.mjs --clip=60:75 --out=out/clip.mp4                          # 带声音的片段
```

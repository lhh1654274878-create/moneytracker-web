# GitHub 上传完整指南

## 🎯 目标：将项目上传到 GitHub，然后通过 Vercel 部署

---

## 📋 准备工作检查

✅ **Git 已安装**（版本 2.55.0）  
✅ **项目文件已准备**（MoneyTracker-Web）  
✅ **GitHub 账号**（需要您提供）

---

## 🚀 方案一：自动化脚本（推荐）

已生成一键上传脚本：`upload_to_github.sh`

### 使用步骤

#### 1. 打开 Git Bash

- 按 `Win + S`，搜索 **"Git Bash"**
- 或右键桌面空白处 → **"Git Bash Here"**

#### 2. 运行脚本

在 Git Bash 中输入：

```bash
cd "E:/Workbuddy Works/MoneyTracker-Web"
bash upload_to_github.sh
```

#### 3. 按提示操作

脚本会自动完成：
- ✅ 初始化 Git 仓库
- ✅ 配置用户信息
- ✅ 添加所有文件
- ✅ 创建提交
- ✅ 关联远程仓库
- ✅ 推送到 GitHub

**您只需要**：
1. 输入 Git 用户名和邮箱（首次）
2. 在 GitHub 创建仓库（脚本会提示）
3. 输入 GitHub 用户名
4. 输入 Personal Access Token（GitHub 密码）

---

## 🔐 关键：获取 GitHub Personal Access Token

### 为什么需要 Token？

GitHub 已不再支持密码推送，必须使用 **Personal Access Token**（PAT）。

### 获取步骤

#### 1. 访问 GitHub Token 设置

在浏览器打开：
```
https://github.com/settings/tokens
```

或者：
1. 登录 GitHub
2. 点击右上角头像 → **Settings**
3. 左侧菜单滚动到底部 → **Developer settings**
4. 点击 **Personal access tokens** → **Tokens (classic)**

#### 2. 生成新 Token

1. 点击 **"Generate new token (classic)"**
2. 填写信息：
   - **Note**：`MoneyTracker Web 上传`（备注）
   - **Expiration**：选择 `No expiration`（永不过期）或 `30 days`
   - **Select scopes**：勾选 `repo`（完整仓库权限）
3. 滚动到底部，点击 **"Generate token"**

#### 3. 复制 Token

- 页面显示一串字符（如 `ghp_xxxxxxxxxxxx`）
- **立即复制！** 离开页面后无法再看到
- 保存到安全位置（如记事本）

#### 4. 使用 Token

当 Git 推送时提示输入密码，**粘贴 Token**（不是 GitHub 账号密码）。

---

## 📝 方案二：手动操作（分步详解）

如果脚本遇到问题，可以手动执行：

### 步骤 1：在 GitHub 创建仓库

1. 访问：https://github.com/new
2. 填写信息：
   - **Repository name**：`moneytracker-web`
   - **Description**：`Web版个人记账应用`
   - **Public**：选择公开
   - ❌ 不要勾选 "Add a README file"
   - ❌ 不要选择 gitignore 或 license
3. 点击 **"Create repository"**
4. **保持页面打开**（后续需要复制仓库地址）

### 步骤 2：在本地初始化 Git

打开 Git Bash，执行：

```bash
# 进入项目目录
cd "E:/Workbuddy Works/MoneyTracker-Web"

# 初始化 Git
git init

# 配置用户信息（首次使用需要）
git config user.name "您的名字"
git config user.email "您的邮箱"
```

### 步骤 3：添加文件并提交

```bash
# 添加所有文件
git add .

# 创建提交
git commit -m "初始提交：Web版记账应用"
```

### 步骤 4：关联远程仓库

```bash
# 关联 GitHub 仓库（替换成您的用户名）
git remote add origin https://github.com/你的用户名/moneytracker-web.git

# 设置默认分支为 main
git branch -M main
```

### 步骤 5：推送到 GitHub

```bash
# 推送代码
git push -u origin main
```

**输入凭据**：
- Username：您的 GitHub 用户名
- Password：粘贴 Personal Access Token（不是密码）

---

## 🎉 上传成功后

### 验证上传

1. 刷新 GitHub 仓库页面
2. 应该能看到所有项目文件：
   - index.html
   - app.js
   - sw.js
   - manifest.json
   - README.md

### 返回 Vercel 继续部署

1. 回到 Vercel 页面（刚才的 Install 页面）
2. 点击 **"Install"** 按钮
3. GitHub 授权页面选择 **"Only select repositories"**
4. 下拉选择 **"moneytracker-web"**
5. 点击 **"Install & Authorize"**
6. 返回 Vercel，选择 `moneytracker-web` 仓库
7. 点击 **"Import"**
8. 无需修改配置，直接点击 **"Deploy"**
9. 等待 1-2 分钟，获得访问链接

---

## ⚠️ 常见问题

### Q1: Git Bash 在哪里？

**A**: 
- 搜索：按 `Win + S`，输入 "Git Bash"
- 或右键任意文件夹 → "Git Bash Here"
- 如果找不到，说明 Git 未安装（虽然检测到了，可能是其他工具的 Git）

### Q2: 推送时提示 "Authentication failed"

**A**: 
- 确保使用的是 **Personal Access Token**，不是账号密码
- 检查 Token 是否有 `repo` 权限
- Token 是否已过期

### Q3: 提示 "remote: Repository not found"

**A**: 
- 检查 GitHub 用户名是否正确
- 确认仓库名是否为 `moneytracker-web`
- 确认仓库是否已创建

### Q4: 提示 "Permission denied"

**A**: 
- 检查 Token 权限是否包含 `repo`
- 重新生成 Token 并重试

### Q5: 脚本运行失败

**A**: 
- 使用方案二手动操作
- 提供错误信息，我协助排查

---

## 📊 完整流程时间表

| 步骤 | 耗时 | 说明 |
|------|------|------|
| 获取 GitHub Token | 2 分钟 | 首次需要 |
| 在 GitHub 创建仓库 | 1 分钟 | 简单填写 |
| 运行上传脚本 | 3 分钟 | 输入信息 |
| Vercel 授权部署 | 2 分钟 | 选择仓库 |
| **总计** | **~8 分钟** | - |

---

## 🎬 立即开始

### 推荐操作顺序

1. **先获取 Token**（https://github.com/settings/tokens）
2. **创建仓库**（https://github.com/new）
3. **运行脚本**：
   ```bash
   cd "E:/Workbuddy Works/MoneyTracker-Web"
   bash upload_to_github.sh
   ```
4. **返回 Vercel** 点击 Install

---

## 💡 需要帮助？

如果遇到问题，请提供：
- 错误信息截图
- 执行到哪一步
- Git Bash 输出内容

我会立即协助您解决。

---

**脚本位置**：`E:\Workbuddy Works\MoneyTracker-Web\upload_to_github.sh`

**准备好后，打开 Git Bash，运行脚本即可！**

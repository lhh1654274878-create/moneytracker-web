#!/bin/bash
# MoneyTracker Web 项目自动上传到 GitHub 脚本
# 使用说明：在 Git Bash 中运行此脚本

echo "=========================================="
echo "MoneyTracker Web - GitHub 上传助手"
echo "=========================================="
echo ""

# 步骤 1：检查是否已初始化 Git
echo "步骤 1/6: 检查 Git 状态..."
cd "E:/Workbuddy Works/MoneyTracker-Web" || exit

if [ -d ".git" ]; then
    echo "✓ Git 仓库已初始化"
else
    echo "→ 初始化 Git 仓库..."
    git init
    echo "✓ Git 初始化完成"
fi

echo ""

# 步骤 2：配置 Git 用户信息（如果未配置）
echo "步骤 2/6: 配置 Git 用户信息..."
if [ -z "$(git config user.name)" ]; then
    echo "请输入您的用户名（用于 Git 提交记录）："
    read -r USERNAME
    git config user.name "$USERNAME"
fi

if [ -z "$(git config user.email)" ]; then
    echo "请输入您的邮箱（用于 Git 提交记录）："
    read -r EMAIL
    git config user.email "$EMAIL"
fi

echo "✓ Git 用户信息已配置"
echo "  用户名: $(git config user.name)"
echo "  邮箱: $(git config user.email)"
echo ""

# 步骤 3：添加所有文件
echo "步骤 3/6: 添加项目文件..."
git add .
echo "✓ 已添加所有文件"
echo ""

# 步骤 4：提交
echo "步骤 4/6: 创建提交..."
git commit -m "初始提交：Web版记账应用 - 完整功能实现" || echo "✓ 文件已提交或无新变更"
echo ""

# 步骤 5：关联远程仓库
echo "步骤 5/6: 关联 GitHub 远程仓库..."
echo ""
echo "=========================================="
echo "重要提示：请先在 GitHub 创建仓库！"
echo "=========================================="
echo ""
echo "1. 在浏览器打开: https://github.com/new"
echo "2. 填写仓库信息："
echo "   - Repository name: moneytracker-web"
echo "   - Description: Web版个人记账应用"
echo "   - 选择 Public（公开）"
echo "   - 不要勾选 README、gitignore、license"
echo "3. 点击 'Create repository'"
echo ""
echo "创建完成后，请输入您的 GitHub 用户名："
read -r GITHUB_USERNAME
echo ""

REPO_URL="https://github.com/$GITHUB_USERNAME/moneytracker-web.git"

# 检查是否已有 remote
if git remote | grep -q "origin"; then
    echo "→ 更新远程仓库地址..."
    git remote set-url origin "$REPO_URL"
else
    echo "→ 添加远程仓库..."
    git remote add origin "$REPO_URL"
fi

echo "✓ 远程仓库已关联: $REPO_URL"
echo ""

# 步骤 6：推送到 GitHub
echo "步骤 6/6: 推送到 GitHub..."
echo ""
echo "即将推送到 GitHub，可能需要输入您的 GitHub 凭据："
echo "  - 用户名: $GITHUB_USERNAME"
echo "  - 密码: 使用 Personal Access Token（不是账号密码）"
echo ""
echo "如何获取 Token："
echo "1. 访问: https://github.com/settings/tokens"
echo "2. 点击 'Generate new token (classic)'"
echo "3. 勾选 'repo' 权限"
echo "4. 生成后复制 Token"
echo ""

# 设置默认分支为 main
git branch -M main

# 推送
echo "开始推送..."
if git push -u origin main; then
    echo ""
    echo "=========================================="
    echo "✅ 上传成功！"
    echo "=========================================="
    echo ""
    echo "您的项目地址："
    echo "https://github.com/$GITHUB_USERNAME/moneytracker-web"
    echo ""
    echo "下一步："
    echo "1. 返回 Vercel 页面"
    echo "2. 点击 'Install' 按钮"
    echo "3. 选择 moneytracker-web 仓库"
    echo "4. 点击 'Import' 开始部署"
    echo ""
else
    echo ""
    echo "=========================================="
    echo "⚠️ 推送失败"
    echo "=========================================="
    echo ""
    echo "可能原因："
    echo "1. 仓库尚未在 GitHub 创建"
    echo "2. GitHub 用户名输入错误"
    echo "3. 未输入正确的 Personal Access Token"
    echo "4. 网络连接问题"
    echo ""
    echo "解决方案："
    echo "- 确认已在 GitHub 创建仓库"
    echo "- 检查用户名拼写"
    echo "- 使用 Personal Access Token（不是密码）"
    echo "- 重新运行此脚本"
    echo ""
fi

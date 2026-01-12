// 替换 require 为 ESM 的 import（核心修改）
import fs from 'fs/promises'; // ESM 推荐使用 promise 版本（异步更稳定）
import path from 'path';
import { fileURLToPath } from 'url'; // ESM 中获取 __dirname 的工具

// ESM 中没有 __dirname，需要手动计算（关键！）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 获取 package.json 路径（和之前逻辑一致，但基于 ESM 的 __dirname）
const packagePath = path.join(__dirname, '../package.json');

async function bumpVersion() {
  try {
    // 1. 读取 package.json（ESM 用 fs.promises，异步读取）
    const packageContent = await fs.readFile(packagePath, 'utf8');
    const packageJson = JSON.parse(packageContent);
    const currentVersion = packageJson.version;

    if (!currentVersion) {
      console.error('❌ package.json 中未找到 version 字段');
      process.exit(1);
    }

    // 2. 解析命令行参数（逻辑不变）
    const args = process.argv.slice(2);
    let bumpType = 'patch';
    if (args.includes('--minor')) bumpType = 'minor';
    if (args.includes('--major')) bumpType = 'major';

    // 3. 版本号解析容错（逻辑不变）
    const versionParts = currentVersion.split('.').map(Number);
    if (versionParts.length !== 3 || versionParts.some(isNaN)) {
      console.error('❌ 版本号格式错误，需遵循 x.y.z 语义化版本规范（当前：', currentVersion, '）');
      process.exit(1);
    }
    const [major, minor, patch] = versionParts;

    // 4. 计算新版本号（逻辑不变）
    let newVersion;
    switch (bumpType) {
      case 'major':
        newVersion = `${major + 1}.0.0`;
        break;
      case 'minor':
        newVersion = `${major}.${minor + 1}.0`;
        break;
      case 'patch':
      default:
        newVersion = `${major}.${minor}.${patch + 1}`;
    }

    // 5. 写入 package.json（ESM 用 fs.promises.writeFile）
    packageJson.version = newVersion;
    await fs.writeFile(
      packagePath,
      JSON.stringify(packageJson, null, 2) + '\n', // 保留格式化
      'utf8'
    );

    console.log(`✅ 版本号已更新：${currentVersion} → ${newVersion}`);
  } catch (err) {
    console.error('❌ 版本自增失败：', err.message);
    process.exit(1);
  }
}

// 执行函数
bumpVersion();

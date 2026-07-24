Ran terminal command:  
```bash
find /home/anlzou/anlzou/codes/rust/tauri_projects/procedural-modeling-tauri/src-tauri/gen/android -name "*.apk" 2>/dev/null && echo "---" && ls /home/anlzou/Android/Sdk/build-tools/
```

Ran terminal command:  
```bash
ls /home/anlzou/Android/Sdk/build-tools/35.0.0/apksigner 2>/dev/null && echo "---" && ls /home/anlzou/Android/Sdk/build-tools/35.0.0/zipalign 2>/dev/null
```

签名工具齐全。先生成 keystore，再对齐和签名 APK。

Ran terminal command:  
```bash
KEYSTORE="$HOME/.android/debug.keystore"
if [ ! -f "$KEYSTORE" ]; then
  echo "生成 debug keystore..."
  keytool -genkey -v -keystore "$KEYSTORE" -alias androiddebugkey \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -dname "CN=Android Debug,O=Android,C=US" \
    -storepass android -keypass android
else
  echo "keystore 已存在: $KEYSTORE"
fi
```

Ran terminal command:  
```bash
APK="/home/anlzou/anlzou/codes/rust/tauri_projects/procedural-modeling-tauri/src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release-unsigned.apk"
ALIGNED="${APK%-unsigned.apk}-aligned.apk"
SIGNED="${APK%-unsigned.apk}.apk"

ZIPALIGN="/home/anlzou/Android/Sdk/build-tools/35.0.0/zipalign"
APKSIGNER="/home/anlzou/Android/Sdk/build-tools/35.0.0/apksigner"
KEYSTORE="$HOME/.android/debug.keystore"

echo "1. 对齐 APK..."
$ZIPALIGN -v -p 4 "$APK" "$ALIGNED" 2>&1 | tail -3

echo ""
echo "2. 签名 APK..."
$APKSIGNER sign --ks "$KEYSTORE" --ks-key-alias androiddebugkey \
  --ks-pass pass:android --key-pass pass:android \
  "$ALIGNED" 2>&1

echo ""
echo "3. 输出文件："
mv "$ALIGNED" "$SIGNED"
ls -lh "$SIGNED"

echo ""
echo "4. 验证签名..."
$APKSIGNER verify "$SIGNED" 2>&1
```

Ran terminal command:  
```bash
SIGNED="/home/anlzou/anlzou/codes/rust/tauri_projects/procedural-modeling-tauri/src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk"
ls -lh "$SIGNED" 2>/dev/null && echo "---" && /home/anlzou/Android/Sdk/build-tools/35.0.0/apksigner verify "$SIGNED" 2>&1 | head -10
```

Ran terminal command:  
```bash
/home/anlzou/Android/Sdk/build-tools/35.0.0/apksigner verify --print-certs 
"/home/anlzou/anlzou/codes/rust/tauri_projects/procedural-modeling-tauri/src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk" 2>&1 | grep -E "Verified|signer|CN=|MD5|SHA"
```

APK 签名完成！✅

| 属性 | 值 |
|------|-----|
| **文件** | `app-universal-release.apk` |
| **大小** | 6.7+ MB |
| **签名算法** | RSA 2048-bit |
| **证书 DN** | `CN=Android Debug, O=Android, C=US` |
| **有效期** | 10,000 天 |

**路径：**
```
src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk
```

现在可以通过 ADB 安装到设备测试了：

```bash
adb install -r src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk
```

> ⚠️ 这是 **debug 签名**，适合开发测试。如果要在 Google Play 发布，需要生成自己的 release keystore 并使用 `--ks` 参数指定。
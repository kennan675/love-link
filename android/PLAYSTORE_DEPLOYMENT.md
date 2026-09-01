# 🚀 Google Play Store Deployment & Release Guide for BlackLoveLink

This guide details how to build, sign, and deploy **BlackLoveLink** (`com.blacklovelink.app`) to the **Google Play Store**.

---

## 🔒 1. Setting Up GitHub Actions Secrets (Recommended CI/CD)

The GitHub Actions workflow at [`.github/workflows/android-release.yml`](file:///c:/Users/pc/blacklovelink/love-link/.github/workflows/android-release.yml) automatically builds signed `.aab` bundles whenever you push a version tag (e.g. `v1.0.0`).

### Step 1.1: Generate Your Release Keystore (Once)
Run the following command in your terminal to generate your production keystore file (`release-key.jks`):

```bash
keytool -genkey -v -keystore release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias blacklovelink
```
> ⚠️ **CRITICAL**: Store `release-key.jks` and your passwords in a secure password manager. If you lose this key, you will not be able to update your app on Google Play!

### Step 1.2: Convert Keystore to Base64
Convert your `release-key.jks` into a Base64 string for GitHub Secrets:

* **PowerShell (Windows)**:
  ```powershell
  [Convert]::ToBase64String([System.IO.File]::ReadAllBytes("release-key.jks")) | Set-Clipboard
  ```
* **macOS / Linux**:
  ```bash
  base64 -i release-key.jks | pbcopy
  ```

### Step 1.3: Add GitHub Repository Secrets
Go to your GitHub repository -> **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**, and add:

| Secret Name | Value |
| :--- | :--- |
| `ANDROID_KEYSTORE_BASE64` | The copied Base64 string of `release-key.jks` |
| `ANDROID_KEYSTORE_PASSWORD` | Password you set for the keystore |
| `ANDROID_KEY_ALIAS` | `blacklovelink` (or the alias you picked) |
| `ANDROID_KEY_PASSWORD` | Password for the key alias |

### Step 1.4: Triggering an Automated Release Build
Whenever you are ready to publish a new release to Google Play, tag your commit and push it:

```bash
git tag -a v1.0.0 -m "Release v1.0.0 for Google Play Store"
git push origin v1.0.0
```
GitHub Actions will build the web app, sync Capacitor, compile the signed `.aab`, attach it to the GitHub Release, and store it in Actions Artifacts!

---

## 💻 2. Building Signed `.aab` Locally (Alternative)

If you prefer building locally on a machine with Android Studio or Android SDK:

1. Copy `android/keystore.properties.example` to `android/keystore.properties`:
   ```bash
   cp android/keystore.properties.example android/keystore.properties
   ```
2. Place your `release-key.jks` inside `android/app/` or `android/`.
3. Update `android/keystore.properties` with your passwords.
4. Run the build commands:
   ```bash
   npm run cap:sync
   cd android
   ./gradlew bundleRelease
   ```
5. Your signed `.aab` will be located at:
   `android/app/build/outputs/bundle/release/app-release.aab`

---

## 📱 3. Google Play Console Submission Checklist

### Step 3.1: Create Developer Account & App Record
1. Sign in to [Google Play Console](https://play.google.com/console).
2. Click **Create app**:
   * **App name**: BlackLoveLink
   * **Default language**: English (US)
   * **App or game**: App
   * **Free or paid**: Free (or select appropriate model)

### Step 3.2: Complete App Content Section
Before publishing, Google requires completing these store sections:
* **Privacy Policy**: Provide URL (e.g. `https://blacklovelink.app/privacy` or Vercel URL).
* **Data Safety**: Declare data collected (e.g. email, profile details, photos if applicable).
* **App Access**: Declare if any features require user login.
* **Ads & Target Audience**: Specify if app contains ads and select target age group (e.g. 18+ for dating/networking).
* **Government Apps & Financial Features**: Declare appropriate category.

### Step 3.3: Store Listing Graphics & Details
Under **Main store listing**, upload required media:
* **App Icon**: 512 x 512 px (PNG or JPEG, up to 1 MB).
* **Feature Graphic**: 1024 x 500 px (PNG or JPEG).
* **Phone Screenshots**: At least 2 screenshots (16:9 or 9:16 aspect ratio).
* **Tablet Screenshots** (Optional but recommended): 7-inch & 10-inch screenshots.

### Step 3.4: Uploading `.aab` & Launching
1. Go to **Testing** -> **Internal testing** (recommended first step) or **Production**.
2. Click **Create new release**.
3. Upload `app-release.aab`.
4. Enter release notes (e.g. *"Initial release of BlackLoveLink v1.0.0"*).
5. Click **Save** -> **Review release** -> **Start rollout to Production** (or Internal Testers).

---

## 📌 Incremental Updates (Version Bumping)
When publishing future updates to Google Play:
1. Update `versionCode` and `versionName` in [`android/app/build.gradle`](file:///c:/Users/pc/blacklovelink/love-link/android/app/build.gradle):
   * Increment `versionCode` by +1 (e.g. `2`, `3`, `4`...).
   * Change `versionName` (e.g. `"1.0.1"`).
2. Create and push new git tag (e.g. `v1.0.1`).

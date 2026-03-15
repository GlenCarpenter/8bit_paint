package art.eightbitpaint

import android.annotation.SuppressLint
import android.content.Intent
import android.os.Bundle
import android.util.Base64
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.FileProvider
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import java.io.File

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Respect status bar inset so content isn't cut off
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.webview)) { view, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            view.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        webView = findViewById(R.id.webview)

        // Configure WebView settings
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            loadWithOverviewMode = true
            useWideViewPort = true
            setSupportZoom(false)
            builtInZoomControls = false
            displayZoomControls = false
        }

        // Add native share bridge so navigator.share works
        webView.addJavascriptInterface(ShareBridge(this), "AndroidShare")

        // Keep navigation inside the WebView
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: WebResourceRequest?
            ): Boolean {
                val url = request?.url?.toString() ?: return false
                return !url.contains("8bitpaint.art")
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                // Override navigator.share to use our native bridge
                view?.evaluateJavascript("""
                    (function() {
                        navigator.share = function(data) {
                            return new Promise(function(resolve, reject) {
                                try {
                                    if (data.files && data.files.length > 0) {
                                        var file = data.files[0];
                                        var reader = new FileReader();
                                        reader.onload = function() {
                                            var base64 = reader.result.split(',')[1];
                                            AndroidShare.shareImage(
                                                base64,
                                                data.title || '',
                                                data.text || ''
                                            );
                                            resolve();
                                        };
                                        reader.onerror = function() { reject(reader.error); };
                                        reader.readAsDataURL(file);
                                    } else {
                                        AndroidShare.shareText(
                                            data.title || '',
                                            data.text || '',
                                            data.url || ''
                                        );
                                        resolve();
                                    }
                                } catch(e) { reject(e); }
                            });
                        };
                        navigator.canShare = function() { return true; };
                    })();
                """.trimIndent(), null)
            }
        }

        webView.webChromeClient = WebChromeClient()

        // Disable back button completely
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                // Intentionally empty
            }
        })

        if (savedInstanceState == null) {
            webView.loadUrl("https://8bitpaint.art")
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        webView.saveState(outState)
    }

    override fun onRestoreInstanceState(savedInstanceState: Bundle) {
        super.onRestoreInstanceState(savedInstanceState)
        webView.restoreState(savedInstanceState)
    }
}

class ShareBridge(private val activity: MainActivity) {

    @JavascriptInterface
    fun shareImage(base64Data: String, title: String, text: String) {
        val bytes = Base64.decode(base64Data, Base64.DEFAULT)
        val cacheDir = File(activity.cacheDir, "shared_images")
        cacheDir.mkdirs()
        val file = File(cacheDir, "8bit_paint.jpeg")
        file.writeBytes(bytes)

        val uri = FileProvider.getUriForFile(
            activity,
            "${activity.packageName}.fileprovider",
            file
        )

        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "image/jpeg"
            putExtra(Intent.EXTRA_STREAM, uri)
            putExtra(Intent.EXTRA_SUBJECT, title)
            putExtra(Intent.EXTRA_TEXT, text)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        activity.startActivity(Intent.createChooser(intent, "Share via"))
    }

    @JavascriptInterface
    fun shareText(title: String, text: String, url: String) {
        val shareText = if (url.isNotEmpty()) "$text $url" else text
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_SUBJECT, title)
            putExtra(Intent.EXTRA_TEXT, shareText)
        }
        activity.startActivity(Intent.createChooser(intent, "Share via"))
    }
}

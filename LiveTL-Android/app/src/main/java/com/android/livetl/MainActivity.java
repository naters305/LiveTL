package com.android.livetl;

import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;

import android.annotation.SuppressLint;
import android.app.DownloadManager;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.ViewTreeObserver;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.net.MalformedURLException;
import okhttp3.Headers;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class MainActivity extends AppCompatActivity {
    int flags = View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
        | View.SYSTEM_UI_FLAG_FULLSCREEN
        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;
    String UAS = (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/89.0.4346.0 Safari/537.36 Edg/89.0.731.0"
    );
    int screenDensity = 0;
    String action = "";

    @RequiresApi(api = Build.VERSION_CODES.KITKAT)
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        screenDensity = (getResources().getDisplayMetrics().densityDpi);
        setContentView(R.layout.activity_main);
        onNewIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent){
        String action = intent.getAction();
        String type = intent.getType();
        if (Intent.ACTION_SEND.equals(action) && type != null) {
            if ("text/plain".equals(type)) {
                String sharedText = intent.getStringExtra(Intent.EXTRA_TEXT);
                loadWebview(sharedText, true, screenDensity);
                setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_USER);
                this.action = "watch";
            }
        } else {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_USER);
            loadWebview("https://kentonishi.github.io/LiveTL/about",
                false, (screenDensity * 3) / 4);
            this.action = "launch";
        }
        updateUI();
    }

    @RequiresApi(api = Build.VERSION_CODES.KITKAT)
    void loadWebview(String url, boolean inject, int density){
        WebView wv = (WebView) findViewById(R.id.mainWebview);
        wv.addJavascriptInterface(new JSObj(wv), "Android");
        wv.setWebViewClient(new WebViewClient() {

            public void onPageFinished(WebView view, String url) {
                if (inject) {
                    wv.loadUrl("javascript:" +
                                 "window.history.pushState('', '', '" + url + "');" +
                                 "myScript = document.createElement('script');" +
                                 "myScript.src = 'CUSTOMJS';" +
                                 "document.body.appendChild(myScript);");
                }
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (inject){
                    try {
                        String jsURL = "javascript:" + readFile("inject.js").replaceAll(
                                "\n", ""
                        );
                        runOnUiThread(() -> wv.loadUrl(jsURL));
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
                String INJECTION_TOKEN = "CUSTOMJS";
                WebResourceResponse response = null;
                if(url.contains(INJECTION_TOKEN)) {
                    String assetPath = url.substring(url.indexOf(INJECTION_TOKEN) +
                        INJECTION_TOKEN.length(), url.length());
                    try {
                        response = new WebResourceResponse(
                            "application/javascript",
                            "UTF8",
                            getAssets().open("js/frame.js")
                        );
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                } else if (url.startsWith("https://www.youtube.com/live_chat")) {
                    try {
                        WebResourceResponse cordovaResponse =
                            super.shouldInterceptRequest(view, request);
                        if(cordovaResponse != null) {
                            return cordovaResponse;
                        }
                        OkHttpClient httpClient = new OkHttpClient();
                        Request okRequest = new Request.Builder()
                            .header("User-Agent", UAS)
                            .url(url)
                            .build();
                        Response modifiedResponse = httpClient.newCall(okRequest)
                            .execute().newBuilder()
                            .removeHeader("x-frame-options")
                            .removeHeader("frame-options")
                            .build();
                        return new WebResourceResponse("text/html",
                            modifiedResponse.header("content-encoding", "utf-8"),
                            modifiedResponse.body().byteStream()
                        );

                    } catch(MalformedURLException e) {
                        e.printStackTrace();
                        return null;
                    }
                    catch (IOException e) {
                        e.printStackTrace();
                        return null;
                    }
                } else {
                    response = super.shouldInterceptRequest(view, url);
                }
                return response;
            }
        });
        wv.setBackgroundColor(Color.BLACK);
        wv.loadUrl(url);
        wv.setInitialScale(density);
        WebSettings s = wv.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setJavaScriptEnabled(true);
        s.setPluginState(WebSettings.PluginState.ON);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setAllowFileAccessFromFileURLs(true);
        s.setAllowUniversalAccessFromFileURLs(true);
        s.setUserAgentString(UAS);
        s.setSupportMultipleWindows(true);
        s.setJavaScriptCanOpenWindowsAutomatically(true);
        wv.setScrollBarStyle(WebView.SCROLLBARS_INSIDE_INSET);
        wv.setOverScrollMode(View.OVER_SCROLL_NEVER);
        wv.setScrollbarFadingEnabled(false);
        wv.setWebContentsDebuggingEnabled(true);
        View root = wv.getRootView();
        ViewTreeObserver treeObserver = root.getViewTreeObserver();
        treeObserver.addOnGlobalLayoutListener(new ViewTreeObserver.OnGlobalLayoutListener() {
            @Override
            public void onGlobalLayout() {
                root.getRootView().getViewTreeObserver().removeOnGlobalLayoutListener(this);
                Utils.updateGestureExclusion(MainActivity.this);
            }
        });
        Utils.updateGestureExclusion(MainActivity.this);
    }

    class JSObj {
        private WebView wv;

        JSObj(WebView wv){
            this.wv = wv;
        }

        @RequiresApi(api = Build.VERSION_CODES.KITKAT)
        @JavascriptInterface
        public void receiveMessage(String data) {
            MainActivity.this.runOnUiThread(() -> {
                loadWebview(data, false, screenDensity);
            });
        }
    }

    public String readFile(String filePath) throws IOException {
        BufferedReader r = new BufferedReader(new InputStreamReader(getAssets().open(filePath)));
        StringBuilder total = new StringBuilder();
        for (String line; (line = r.readLine()) != null; ) {
            total.append(line).append('\n');
        }
        return total.toString();
    }

    void updateUI(){
        View v = getWindow().getDecorView();
        if (this.action == "watch") {
            v.setSystemUiVisibility(flags);
        } else {
            v.setSystemUiVisibility(View.SYSTEM_UI_FLAG_VISIBLE);
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        updateUI();
    }
}
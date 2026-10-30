package br.com.spacewing.game;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.JavascriptInterface;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.interstitial.InterstitialAd;
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.rewarded.RewardedAd;
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback;
import com.google.android.ump.ConsentInformation;
import com.google.android.ump.ConsentRequestParameters;
import com.google.android.ump.UserMessagingPlatform;

public class MainActivity extends Activity {
    private static final String BANNER_ID = BuildConfig.ADMOB_BANNER_ID;
    private static final String INTERSTITIAL_ID = BuildConfig.ADMOB_INTERSTITIAL_ID;
    private AdView banner;
    private InterstitialAd interstitial;
    private RewardedAd rewarded;
    private WebView gameWeb;
    private ConsentInformation consentInformation;
    private long lastAdTime = 0;
    private boolean adsRequested = false;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().getDecorView().setSystemUiVisibility(5894 | 1024 | 512);
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(0xff050b21);
        WebView web = new WebView(this);
        gameWeb = web;
        web.setBackgroundColor(0xff050b21);
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(true);
        web.getSettings().setAllowFileAccess(true);
        web.getSettings().setAllowContentAccess(false);
        web.setWebViewClient(new WebViewClient());
        web.setWebChromeClient(new WebChromeClient());
        web.addJavascriptInterface(new Object() {
            @JavascriptInterface public void showInterstitial() { runOnUiThread(() -> displayInterstitial()); }
            @JavascriptInterface public void showRewarded() { runOnUiThread(() -> displayRewarded()); }
        }, "AndroidAds");
        root.addView(web, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1));
        banner = new AdView(this);
        banner.setAdSize(AdSize.BANNER);
        banner.setAdUnitId(BANNER_ID);
        root.addView(banner, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
        setContentView(root);
        web.loadUrl("file:///android_asset/index.html");
        requestConsent();
    }

    private void requestConsent() {
        consentInformation = UserMessagingPlatform.getConsentInformation(this);
        ConsentRequestParameters parameters = new ConsentRequestParameters.Builder().build();
        consentInformation.requestConsentInfoUpdate(this, parameters, () -> {
            UserMessagingPlatform.loadAndShowConsentFormIfRequired(this, formError -> {
                if (consentInformation.canRequestAds()) initializeAds();
            });
            if (consentInformation.canRequestAds()) initializeAds();
        }, requestError -> {
            // Em alguns casos, o UMP permite anúncios baseados no consentimento anterior.
            if (consentInformation.canRequestAds()) initializeAds();
        });
    }

    private synchronized void initializeAds() {
        if (adsRequested || isFinishing() || isDestroyed()) return;
        adsRequested = true;
        new Thread(() -> {
            MobileAds.initialize(this, status -> {});
            runOnUiThread(() -> {
                if (!isFinishing() && !isDestroyed()) {
                    banner.loadAd(new AdRequest.Builder().build());
                    loadInterstitial();
                    loadRewarded();
                }
            });
        }).start();
    }

    private void loadInterstitial() {
        if (consentInformation == null || !consentInformation.canRequestAds()) return;
        InterstitialAd.load(this, INTERSTITIAL_ID, new AdRequest.Builder().build(), new InterstitialAdLoadCallback() {
            @Override public void onAdLoaded(InterstitialAd ad) { interstitial = ad; }
            @Override public void onAdFailedToLoad(LoadAdError error) { interstitial = null; }
        });
    }
    private void displayInterstitial() {
        if (consentInformation == null || !consentInformation.canRequestAds()) return;
        if (interstitial == null || System.currentTimeMillis() - lastAdTime < 90000) return;
        InterstitialAd ad = interstitial;
        interstitial = null;
        lastAdTime = System.currentTimeMillis();
        ad.setFullScreenContentCallback(new FullScreenContentCallback() {
            @Override public void onAdDismissedFullScreenContent() { loadInterstitial(); }
            @Override public void onAdFailedToShowFullScreenContent(com.google.android.gms.ads.AdError error) { loadInterstitial(); }
        });
        ad.show(this);
    }
    private void notifyReward(boolean earned) {
        if (gameWeb != null) gameWeb.evaluateJavascript("window.spaceWingRewardResult(" + (earned ? "true" : "false") + ")", null);
    }
    private void loadRewarded() {
        if (consentInformation == null || !consentInformation.canRequestAds()) return;
        RewardedAd.load(this, BuildConfig.ADMOB_REWARDED_ID, new AdRequest.Builder().build(), new RewardedAdLoadCallback() {
            @Override public void onAdLoaded(RewardedAd ad) { rewarded = ad; }
            @Override public void onAdFailedToLoad(LoadAdError error) { rewarded = null; }
        });
    }
    private void displayRewarded() {
        if (consentInformation == null || !consentInformation.canRequestAds() || rewarded == null) {
            notifyReward(false);
            if (rewarded == null && consentInformation != null && consentInformation.canRequestAds()) loadRewarded();
            return;
        }
        RewardedAd ad = rewarded;
        rewarded = null;
        final boolean[] earned = {false};
        ad.setFullScreenContentCallback(new FullScreenContentCallback() {
            @Override public void onAdDismissedFullScreenContent() { notifyReward(earned[0]); loadRewarded(); }
            @Override public void onAdFailedToShowFullScreenContent(com.google.android.gms.ads.AdError error) { notifyReward(false); loadRewarded(); }
        });
        ad.show(this, reward -> earned[0] = true);
    }
    @Override protected void onDestroy() { if (banner != null) banner.destroy(); super.onDestroy(); }
}

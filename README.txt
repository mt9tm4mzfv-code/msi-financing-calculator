MSI FINANCING CALCULATOR — MOBILE WEB APP
==============================================

This package contains a phone-friendly offline calculator with:
1. Higher Down Payment -> Monthly Amortization
2. Target Monthly -> Required Down Payment

It mirrors the validated computation structure supplied by the user and uses the V3.1-style forward/reverse core:
RB = S*(1-BDP)*(1+DIR)+OPDP
Forward adjusted financed = (RB-D)/(1+DIR)
Forward raw monthly = adjusted financed*(1+TR)/M
Forward customer monthly = CEILING(raw,1)
Reverse required DP = RB - target_monthly*M*(1+DIR)/(1+TR)

HOW TO USE
----------
Open index.html on a phone. For a true Home Screen app experience, host the folder on an HTTPS website, then:
- iPhone: Safari -> Share -> Add to Home Screen
- Android Chrome: Menu -> Add to Home screen / Install app

IMPORTANT
---------
This is an offline web-app build, not a signed App Store/Google Play native package.
The editable BDP, DIR, and TR values are visible in the app.
The app does not connect to Mitsubishi systems or bank systems.
All outputs are estimates and remain subject to bank approval.

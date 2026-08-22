MSI FINANCIAL CALCULATOR V2
============================

This version contains all three client inquiry calculators in one mobile application:

1. Down Payment Amount -> Monthly Amortization
2. Down Payment Percentage -> Monthly Amortization
3. Monthly Amortization -> Required Down Payment

Source basis:
- CAL1 DP AMOUNT TO MONTHLY.xlsx
- CAL2 DP PERCENTAGE TO MONTHLY.xlsx
- CAL3 MONTHLY TO DP.xlsx
- MSI FINANCIAL CALCULATOR VERSION 2.docx

The V2 page is designed as a mobile/PWA-style web application and uses the existing MSI Supabase access guard.

Important source-gap handling:
The supplied V2 specification includes an Additional Cashout for White Pearl field, but the supplied calculation workbooks do not define a formula that adds that amount to the financing computation. V2 therefore displays the amount separately and does not silently add it to the loan calculation.

All outputs are estimates and remain subject to bank approval.

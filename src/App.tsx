import { useState, useMemo } from "react";

const termRateMap: Record<number, number> = {
  2: 23,
  3: 42,
  4: 49,
  5: 57,
  6: 67,
  7: 78,
};

const fmt2 = (n: number) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const fmt0 = (n: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);

function formatMoney(n: number) {
  if (!isFinite(n)) return "0.00";
  return fmt2(n);
}

export default function App() {
  const [activeCalc, setActiveCalc] = useState(1);
  const [variant, setVariant] = useState("XPANDER CROSS");
  const [srp, setSrp] = useState(1500000);
  const [opdp, setOpdp] = useState(38000);
  const [premiumOn, setPremiumOn] = useState(false);
  const premiumAmount = 15000;
  const [termYears, setTermYears] = useState(5);
  const [bankRate, setBankRate] = useState(57);
  const [baseDpPercent, setBaseDpPercent] = useState(20);
  const [dealerIncentivePercent, setDealerIncentivePercent] = useState(17);
  const [clientDpAmount, setClientDpAmount] = useState(150000);
  const [clientDpPercent, setClientDpPercent] = useState(10);
  const [desiredMonthly, setDesiredMonthly] = useState(25000);
  const [showComparison, setShowComparison] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [expandDetailed, setExpandDetailed] = useState(false);
  const [expandSimple, setExpandSimple] = useState(false);

  const M = termYears * 12;
  const S = srp;
  const OPDP = opdp;
  const premiumVal = premiumOn ? premiumAmount : 0;

  const compute = (D_input: number, months: number, rate: number) => {
    const RB_local = S * 0.8 * 1.17 + OPDP;
    const clamped = Math.max(0, Math.min(D_input, RB_local));
    const Adjusted = (RB_local - clamped) / 1.17;
    const AdjustedDiscount = S - clamped - Adjusted;
    const TermLoan = Adjusted * (1 + rate / 100);
    const Raw = TermLoan / months;
    const Ceiled = Math.ceil(Raw);
    const AF_local = Adjusted;
    const TotalDP_local = S - Adjusted;
    const BaseAmount_local = S * 0.2;
    const DealerDisplay = (S - clamped) * 0.17;
    const Dealer_sub = TotalDP_local - BaseAmount_local - clamped - OPDP - premiumVal;
    return {
      RB_local,
      clamped,
      D_input,
      Adjusted,
      AdjustedDiscount,
      TermLoan,
      Raw,
      Ceiled,
      AF_local,
      TotalDP_local,
      BaseAmount_local,
      DealerDisplay,
      Dealer_sub,
    };
  };

  const reverseCalc = useMemo(() => {
    const RB = S * 0.8 * 1.17 + OPDP;
    const Width = M * 1.17 / (1 + bankRate / 100);
    const RequiredDP_raw = RB - desiredMonthly * Width;
    return { RB, Width, RequiredDP_raw };
  }, [S, OPDP, M, bankRate, desiredMonthly]);

  const currentCalc = useMemo(() => {
    if (activeCalc === 1) {
      return compute(clientDpAmount, M, bankRate);
    }
    if (activeCalc === 2) {
      const D = S * (clientDpPercent / 100);
      return compute(D, M, bankRate);
    }
    // calc 3
    return compute(reverseCalc.RequiredDP_raw, M, bankRate);
  }, [activeCalc, clientDpAmount, clientDpPercent, S, M, bankRate, reverseCalc.RequiredDP_raw, OPDP, premiumVal]);

  const officialLow = useMemo(() => compute(OPDP, M, bankRate), [OPDP, M, bankRate, S, premiumVal]);

  // derived percentages
  const D_forDisplay = currentCalc.clamped;
  const AF = currentCalc.AF_local;
  const TotalDP = currentCalc.TotalDP_local;
  const BaseAmt = currentCalc.BaseAmount_local;
  const Dealer_sub = currentCalc.Dealer_sub;
  const AdjustedDiscount = currentCalc.AdjustedDiscount;
  const ClientNetDP = D_forDisplay + premiumVal;

  const clientDesiredPercent = S > 0 ? (D_forDisplay / S) * 100 : 0;
  const clientNetPercent = S > 0 ? (ClientNetDP / S) * 100 : 0;
  const discountPercent = S > 0 ? (AdjustedDiscount / S) * 100 : 0;
  const totalDpPercent = S > 0 ? (TotalDP / S) * 100 : 0;
  const afPercent = S > 0 ? (AF / S) * 100 : 0;

  const monthlyDisplay = activeCalc === 3 ? desiredMonthly : currentCalc.Ceiled;

  const detailedText = `Client Desired DP Amount: ₱${formatMoney(D_forDisplay)} (${clientDesiredPercent.toFixed(2)}%)
Unit: ${variant}
Color: ${premiumOn ? "White Pearl" : "Standard Color"}
Unit SRP: ₱${formatMoney(S)} (100%)
Base Down Payment (${baseDpPercent.toFixed(2)}%): ₱${formatMoney(BaseAmt)}
Official Promo DP: ₱${formatMoney(OPDP)}
Additional Cashout for White Pearl Color: ₱${formatMoney(premiumVal)}
Client Net DP (Actual Client Cashout): ₱${formatMoney(ClientNetDP)} (${clientNetPercent.toFixed(2)}%)
Client Discount: ₱${formatMoney(AdjustedDiscount)} (${discountPercent.toFixed(2)}%)
Total DP Deductible to Unit SRP: ₱${formatMoney(TotalDP)} (${totalDpPercent.toFixed(4)}%)
Amount Financed: ₱${formatMoney(AF)} (${afPercent.toFixed(2)}%)
Monthly (${termYears} Years): ₱${formatMoney(monthlyDisplay)}
Bank Interest Rate: ${bankRate.toFixed(2)}%
Estimated computation only. Subject to change without prior notice.`;

  const simpleText = `Unit: ${variant}
Color: ${premiumOn ? "White Pearl" : "Standard Color"}
Unit SRP: ₱${formatMoney(S)} (100%)
Client Desired DP: ₱${formatMoney(D_forDisplay)} (${clientDesiredPercent.toFixed(2)}%)
Client Net DP: ₱${formatMoney(ClientNetDP)} (${clientNetPercent.toFixed(2)}%)
Official Promo DP: ₱${formatMoney(OPDP)}
Additional Cashout: ₱${formatMoney(premiumVal)}
Client Discount: ₱${formatMoney(AdjustedDiscount)} (${discountPercent.toFixed(2)}%)
Total DP: ₱${formatMoney(TotalDP)} (${totalDpPercent.toFixed(4)}%)
Amount Financed: ₱${formatMoney(AF)} (${afPercent.toFixed(2)}%)
Monthly (${termYears} Years @ ${bankRate.toFixed(2)}%): ₱${formatMoney(monthlyDisplay)}
Estimated computation only.`;

  const handleReset = () => {
    setVariant("XPANDER CROSS");
    setSrp(1500000);
    setOpdp(38000);
    setPremiumOn(false);
    setTermYears(5);
    setBankRate(57);
    setBaseDpPercent(20);
    setDealerIncentivePercent(17);
    setClientDpAmount(150000);
    setClientDpPercent(10);
    setDesiredMonthly(25000);
  };

  const copyText = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    }
  };

  const leftBorder =
    activeCalc === 1 ? "#86efac" : activeCalc === 2 ? "#93c5fd" : "#fdba74";
  const circleColor =
    activeCalc === 1 ? "bg-[#86efac] text-black" : activeCalc === 2 ? "bg-[#93c5fd] text-black" : "bg-[#fdba74] text-black";

  const titleText =
    activeCalc === 1
      ? "Down Payment Amount → Monthly Amortization"
      : activeCalc === 2
      ? "Down Payment % → Monthly Amortization"
      : "Monthly → Down Payment (Reverse)";

  const subTitle =
    activeCalc === 1
      ? `Kung mag Down Payment ko og ₱${fmt0(clientDpAmount)}, pila akong monthly?`
      : activeCalc === 2
      ? `Kung mag Down Payment ko og ${clientDpPercent.toFixed(2)}%, pila akong monthly?`
      : `Kung kaya nako ₱${fmt0(desiredMonthly)} monthly, pila needed DP?`;

  const handleTermChange = (y: number) => {
    setTermYears(y);
    const mapped = termRateMap[y];
    if (mapped !== undefined) setBankRate(mapped);
  };

  return (
    <div className="min-h-screen bg-[#0e1525] text-white font-sans antialiased selection:bg-[#7ee0a0]/30">
      <style>{`
        input[type=range]{
          -webkit-appearance:none;
          appearance:none;
          height:4px;
          background:#2a3655;
          border-radius:999px;
        }
        input[type=range]::-webkit-slider-thumb{
          -webkit-appearance:none;
          width:16px;
          height:16px;
          background:white;
          border-radius:999px;
          cursor:pointer;
          border:2px solid #0f172a;
          box-shadow:0 1px 3px rgba(0,0,0,0.4);
        }
        input[type=range]::-moz-range-thumb{
          width:16px;
          height:16px;
          background:white;
          border-radius:999px;
          cursor:pointer;
          border:2px solid #0f172a;
        }
        .no-scrollbar::-webkit-scrollbar{display:none}
        .no-scrollbar{ -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>

      <div className="max-w-[980px] mx-auto px-3 py-3 pb-[88px]">
        {/* Top floating header */}
        <div className="bg-[#162a1a] border border-[#1f3a28] rounded-[22px] p-3 flex flex-col gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#7ee0a0] flex items-center justify-center text-black font-black text-[11px] tracking-wide">DP</div>
              <div className="font-black tracking-[0.14em] text-[13px]">DRIVELOAN PRO</div>
            </div>
            <div className="bg-[#8af5b0] text-black font-black text-[11px] px-3.5 py-1.5 rounded-full tracking-wide">
              CALCULATOR — {activeCalc}
            </div>
          </div>
          <div className="bg-[#0e1525]/70 rounded-full px-3 py-2 flex items-center justify-between border border-[#1e2f23]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#7ee0a0] flex items-center justify-center text-black text-[11px] font-black">{activeCalc}</div>
              <div className="text-[12px] font-bold tracking-wide">CALCULATOR — {activeCalc}</div>
            </div>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  onClick={() => setActiveCalc(n)}
                  className={`w-7 h-7 rounded-full text-[12px] font-bold flex items-center justify-center transition-all ${
                    activeCalc === n ? "bg-[#7ee0a0] text-black" : "bg-[#2a3552] text-[#8a96b5]"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Validity cards */}
        <div className="mt-3 bg-[#131c31] border border-[#2a3655] rounded-[20px] p-4 space-y-2.5">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="bg-[#1d2a4a] border border-[#2f3d63] rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide">Valid Until Oct 03 2026 (30D)</span>
            <span className="text-[11px] text-[#8a96b5]">Published Sept 03 +30 days</span>
          </div>
          <div className="flex flex-wrap gap-2 items-center text-[11px]">
            <span className="bg-[#0f172a] border border-[#2a3655] rounded-full px-2.5 py-1 text-[#cbd5e1]">offline_grace_days 30</span>
            <span className="bg-[#12261a] border border-[#1e3a28] text-[#7ee0a0] rounded-full px-2.5 py-1">Expires in 29 days</span>
            <span className="text-[#8a96b5] text-[11px]">Need 15 seconds online to renew</span>
          </div>
          <div className="text-[10px] font-mono text-[#64748b] bg-[#0f172a] rounded-lg px-2.5 py-1.5 border border-[#1e293b] break-all">
            Supabase alter table profiles alter column offline_grace_days set default 30
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] pt-1">
            <span className="font-bold tracking-[0.12em] text-[#cbd5e1]">2-LEVEL EXPIRY</span>
            <span className="flex items-center gap-1.5 text-[#cbd5e1]"><span className="w-2 h-2 rounded-full bg-yellow-400"></span>Level1 Account Expiry</span>
            <span className="flex items-center gap-1.5 text-[#cbd5e1]"><span className="w-2 h-2 rounded-full bg-[#7ee0a0]"></span>Level2 Offline Verification 30 days</span>
          </div>
          <button className="w-full bg-white text-black font-black rounded-full py-2.5 text-[11px] tracking-[0.14em] mt-1">RENEW NOW 15 SECS ONLINE</button>
        </div>

        {/* Engine line */}
        <div className="mt-3 px-1 text-[10px] text-[#8a96b5] flex flex-wrap gap-1 items-center tracking-wide">
          <span>Engine V62.40 GOLD Logic (Base DP Dynamic Fix) • 100% offline calculator V1.00 GOLD •</span>
          <span className="text-[#86efac]">offline_grace_days:30</span>
        </div>

        {/* Offline Validity Update */}
        <div className="mt-3 bg-[#131c31] border border-[#2a3655] rounded-[20px] p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full border-[1.5px] border-[#7ee0a0] flex items-center justify-center text-[#7ee0a0] text-[12px] font-bold">30</div>
            <div className="text-[12px] font-bold tracking-[0.12em]">Offline Validity Update</div>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between text-[#5b6786]">
              <span className="line-through">BEFORE Sept 10 2026 (7 days)</span>
              <span className="line-through">Expires in 6 days</span>
            </div>
            <div className="flex justify-between items-center text-white font-semibold bg-[#0f172a] rounded-full px-3.5 py-2 border border-[#1e293b]">
              <span className="tracking-wide">NOW Valid Until Oct 03 2026</span>
              <span className="text-[#7ee0a0]">Expires in 29 days</span>
            </div>
          </div>
        </div>

        {/* Calculator Card */}
        <div
          className="mt-4 bg-[#131c31] border border-[#2a3655] rounded-[20px] overflow-hidden"
          style={{ borderLeftWidth: 4, borderLeftColor: leftBorder }}
        >
          <div className="p-4">
            <div className="flex items-start gap-2.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-black shrink-0 ${circleColor}`}>{activeCalc}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold leading-tight">{titleText}</div>
                <div className="text-[12px] italic text-[#7ee0a0] mt-1">{subTitle}</div>
              </div>
            </div>

            <div className="mt-5 space-y-5">
              {/* Variant */}
              <div className="space-y-1.5">
                <div className="text-[10px] tracking-[0.14em] text-[#8a96b5]">VEHICLE VARIANT</div>
                <div className="bg-[#0f172a] border border-[#2a3655] rounded-[16px] px-4 py-3 flex items-center">
                  <input
                    value={variant}
                    onChange={(e) => setVariant(e.target.value)}
                    className="bg-transparent outline-none w-full text-[13px] font-semibold tracking-wide"
                    placeholder="XPANDER CROSS"
                  />
                </div>
              </div>

              {/* SRP */}
              <div className="space-y-1.5">
                <div className="text-[10px] tracking-[0.14em] text-[#8a96b5]">UNIT SRP</div>
                <div className="bg-[#0f172a] border border-[#2a3655] rounded-[16px] px-4 py-3 flex items-center justify-between gap-2">
                  <span className="text-[#8a96b5] text-[13px]">₱</span>
                  <input
                    type="text"
                    value={formatMoney(srp)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9.]/g, "");
                      const num = parseFloat(raw) || 0;
                      setSrp(num);
                    }}
                    className="bg-transparent outline-none w-full text-right text-[13px] font-semibold"
                  />
                </div>
                <div className="text-[10px] text-[#5b6786] px-1">₱{formatMoney(srp)} muted</div>
              </div>

              {/* Promo */}
              <div className="space-y-1.5">
                <div className="text-[10px] tracking-[0.14em] text-[#8a96b5]">OFFICIAL PROMO DP</div>
                <div className="bg-[#0f172a] border border-[#2a3655] rounded-[16px] px-4 py-3 flex items-center justify-between gap-2">
                  <span className="text-[#8a96b5] text-[13px]">₱</span>
                  <input
                    type="text"
                    value={formatMoney(opdp)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9.]/g, "");
                      setOpdp(parseFloat(raw) || 0);
                    }}
                    className="bg-transparent outline-none w-full text-right text-[13px] font-semibold"
                  />
                </div>
                <div className="text-[10px] text-[#5b6786] px-1">₱{formatMoney(opdp)}</div>
              </div>

              {/* Premium toggle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] tracking-[0.14em] text-[#8a96b5]">PREMIUM COLOR? • SURCHARGE = ADD CASHOUT</div>
                  <button
                    onClick={() => setPremiumOn(!premiumOn)}
                    className={`w-[44px] h-[24px] rounded-full flex items-center p-1 transition-colors ${premiumOn ? "bg-[#7ee0a0]" : "bg-[#2a3652]"}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${premiumOn ? "translate-x-[20px]" : "translate-x-0"}`} />
                  </button>
                </div>
                <div className="bg-[#0f172a] border border-[#2a3655] rounded-[16px] p-3 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-[#8a96b5] leading-snug">
                    {premiumOn ? "White Pearl • +₱15,000.00 surcharge • Toggle to edit" : "Standard Color • No surcharge • Toggle to edit ₱15,000.00"}
                  </div>
                  <div className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${premiumOn ? "bg-[#7ee0a0] text-black" : "bg-[#2a3552] text-[#8a96b5]"}`}>
                    {premiumOn ? "ON" : "OFF"}
                  </div>
                </div>
              </div>

              {/* Loan Term */}
              <div className="space-y-1.5">
                <div className="text-[10px] tracking-[0.14em] text-[#8a96b5]">LOAN TERM</div>
                <div className="bg-[#0f172a] border border-[#2a3655] rounded-[16px] px-4 py-2">
                  <select
                    value={termYears}
                    onChange={(e) => handleTermChange(parseInt(e.target.value))}
                    className="bg-transparent outline-none w-full text-[13px] font-semibold"
                  >
                    <option value={2} className="bg-[#0f172a]">2 Years</option>
                    <option value={3} className="bg-[#0f172a]">3 Years</option>
                    <option value={4} className="bg-[#0f172a]">4 Years</option>
                    <option value={5} className="bg-[#0f172a]">5 Years</option>
                    <option value={6} className="bg-[#0f172a]">6 Years</option>
                    <option value={7} className="bg-[#0f172a]">7 Years</option>
                  </select>
                </div>
              </div>

              {/* Bank Interest */}
              <div className="space-y-2">
                <div className="text-[10px] tracking-[0.14em] text-[#8a96b5]">BANK INTEREST RATE (%)</div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={0.01}
                    value={bankRate}
                    onChange={(e) => setBankRate(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <div className="bg-[#0f172a] border border-[#2a3655] rounded-xl px-3 py-2 flex items-center gap-1 min-w-[92px] justify-center">
                    <input
                      type="number"
                      step={0.01}
                      value={bankRate}
                      onChange={(e) => setBankRate(parseFloat(e.target.value) || 0)}
                      className="bg-transparent w-[56px] text-center outline-none text-[13px] font-semibold"
                    />
                    <span className="text-[13px]">%</span>
                  </div>
                </div>
                <div className="text-[10px] text-[#5b6786] leading-relaxed">
                  {bankRate.toFixed(2)}% • step 0.01 • editable to 2 decimals • resets on RESET • mapping 7Y=78, 6Y=67, 5Y=57, 4Y=49, 3Y=42, 2Y=23
                </div>
              </div>

              {/* Base DP % */}
              <div className="space-y-2">
                <div className="text-[10px] tracking-[0.14em] text-[#8a96b5]">BASE DOWN PAYMENT (%)</div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={20}
                    max={90}
                    step={0.01}
                    value={baseDpPercent}
                    onChange={(e) => setBaseDpPercent(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <div className="bg-[#0f172a] border border-[#2a3655] rounded-xl px-3 py-2 flex items-center gap-1 min-w-[92px] justify-center">
                    <input
                      type="number"
                      step={0.01}
                      value={baseDpPercent}
                      onChange={(e) => setBaseDpPercent(parseFloat(e.target.value) || 0)}
                      className="bg-transparent w-[56px] text-center outline-none text-[13px] font-semibold"
                    />
                    <span className="text-[13px]">%</span>
                  </div>
                </div>
                <div className="text-[10px] text-[#5b6786] leading-relaxed">
                  Base amount: ₱{formatMoney(S * (baseDpPercent / 100))} • slider 20–90% step 0.01 default 20.00% •{" "}
                  <span className="text-[#86efac]">INCLUDED in Total DP • affects Monthly</span>
                </div>
              </div>

              {/* Dealer Incentive */}
              <div className="space-y-2">
                <div className="text-[10px] tracking-[0.14em] text-[#8a96b5]">DEALER'S INCENTIVE RATE (%)</div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={30}
                    step={0.01}
                    value={dealerIncentivePercent}
                    onChange={(e) => setDealerIncentivePercent(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <div className="bg-[#0f172a] border border-[#2a3655] rounded-xl px-3 py-2 flex items-center gap-1 min-w-[92px] justify-center">
                    <input
                      type="number"
                      step={0.01}
                      value={dealerIncentivePercent}
                      onChange={(e) => setDealerIncentivePercent(parseFloat(e.target.value) || 0)}
                      className="bg-transparent w-[56px] text-center outline-none text-[13px] font-semibold"
                    />
                    <span className="text-[13px]">%</span>
                  </div>
                </div>
                <div className="text-[10px] text-[#5b6786] leading-relaxed">
                  Incentive amount: ₱{formatMoney(currentCalc.DealerDisplay)} • adds to DP • default 17.00%
                </div>
              </div>

              {/* Primary input per calc */}
              {activeCalc === 1 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="text-[10px] tracking-[0.14em] text-[#8a96b5]">CLIENT'S DESIRED DOWN PAYMENT AMOUNT</div>
                    <span className="bg-[#3b82f6] text-white text-[8px] font-black px-1.5 py-0.5 rounded-full tracking-wide">PRIMARY</span>
                  </div>
                  <div className="bg-[#0f172a] border border-[#3b82f6] rounded-[16px] px-4 py-3 flex items-center justify-between gap-2 shadow-[0_0_0_2px_rgba(59,130,246,0.15)]">
                    <span className="text-[#3b82f6] text-[13px]">₱</span>
                    <input
                      type="text"
                      value={formatMoney(clientDpAmount)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9.]/g, "");
                        const num = parseFloat(raw) || 0;
                        setClientDpAmount(num);
                        setClientDpPercent(S > 0 ? (num / S) * 100 : 0);
                      }}
                      className="bg-transparent outline-none w-full text-right text-[13px] font-bold"
                    />
                  </div>
                  <div className="text-[10px] text-[#5b6786] px-1">₱{formatMoney(clientDpAmount)}</div>
                </div>
              )}

              {activeCalc === 2 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="text-[10px] tracking-[0.14em] text-[#8a96b5]">CLIENT'S DESIRED DOWN PAYMENT %</div>
                    <span className="bg-[#3b82f6] text-white text-[8px] font-black px-1.5 py-0.5 rounded-full tracking-wide">PRIMARY</span>
                  </div>
                  <div className="bg-[#0f172a] border border-[#3b82f6] rounded-[16px] px-4 py-3 flex items-center justify-between gap-2 shadow-[0_0_0_2px_rgba(59,130,246,0.15)]">
                    <input
                      type="number"
                      step={0.01}
                      value={clientDpPercent}
                      onChange={(e) => {
                        const p = parseFloat(e.target.value) || 0;
                        setClientDpPercent(p);
                        setClientDpAmount(S * (p / 100));
                      }}
                      className="bg-transparent outline-none w-full text-right text-[13px] font-bold"
                    />
                    <span className="text-[#3b82f6] text-[13px]">%</span>
                  </div>
                  <div className="text-[10px] text-[#5b6786] px-1">
                    ₱{formatMoney(S * (clientDpPercent / 100))} • {clientDpPercent.toFixed(2)}% of SRP
                  </div>
                </div>
              )}

              {activeCalc === 3 && (
                <>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="text-[10px] tracking-[0.14em] text-[#8a96b5]">DESIRED MONTHLY AMORTIZATION</div>
                      <span className="bg-[#f59e0b] text-black text-[8px] font-black px-1.5 py-0.5 rounded-full tracking-wide">PRIMARY</span>
                    </div>
                    <div className="bg-[#0f172a] border border-[#f59e0b] rounded-[16px] px-4 py-3 flex items-center justify-between gap-2 shadow-[0_0_0_2px_rgba(245,158,11,0.15)]">
                      <span className="text-[#f59e0b] text-[13px]">₱</span>
                      <input
                        type="text"
                        value={formatMoney(desiredMonthly)}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^0-9.]/g, "");
                          setDesiredMonthly(parseFloat(raw) || 0);
                        }}
                        className="bg-transparent outline-none w-full text-right text-[13px] font-bold"
                      />
                    </div>
                    <div className="text-[10px] text-[#5b6786] px-1">Target • Width {reverseCalc.Width.toFixed(2)} • RB ₱{formatMoney(reverseCalc.RB)}</div>
                  </div>

                  <div className="bg-[#0f172a] border border-[#2a3655] rounded-[18px] p-4">
                    <div className="text-[10px] tracking-[0.14em] text-[#8a96b5]">REQUIRED DOWN PAYMENT</div>
                    <div className="text-[22px] font-black mt-1">₱{formatMoney(currentCalc.clamped)}</div>
                    <div className="text-[10px] text-[#5b6786] mt-1">
                      Raw RequiredDP ₱{formatMoney(reverseCalc.RequiredDP_raw)} • Clamped ₱{formatMoney(currentCalc.clamped)} • Proof Raw ₱{formatMoney(currentCalc.Raw)} • Ceiled ₱{formatMoney(currentCalc.Ceiled)}
                    </div>
                    {desiredMonthly >= officialLow.Ceiled && (
                      <div className="mt-2 text-[10px] bg-[#12261a] border border-[#1e3a28] text-[#7ee0a0] rounded-full px-3 py-1 inline-block">
                        Official low-DP offer: ₱{formatMoney(officialLow.Ceiled)}/mo @ ₱{formatMoney(OPDP)} DP
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Monthly Amortization card */}
              <div className="bg-[#151e32] border border-[#2a3655] rounded-[18px] p-4">
                <div className="text-[10px] tracking-[0.16em] text-[#8a96b5]">MONTHLY AMORTIZATION</div>
                <div className="text-[28px] font-black mt-1 tracking-tight">₱{formatMoney(monthlyDisplay)}</div>
                <div className="text-[10px] text-[#7a859e] mt-2 leading-[1.6] break-words">
                  AF ₱{formatMoney(AF)} • Total DP ₱{formatMoney(TotalDP)} (Base ₱{formatMoney(BaseAmt)} + Client ₱{formatMoney(D_forDisplay)} + Promo ₱{formatMoney(OPDP)} + Dealer ₱{formatMoney(Dealer_sub)} + Premium ₱{formatMoney(premiumVal)}) • r {bankRate.toFixed(2)}% /12 • n {M} mos • Base {baseDpPercent.toFixed(2)}% = ₱{formatMoney(BaseAmt)} • DYNAMIC
                </div>
              </div>

              {/* Detailed Clipboard */}
              <div className="bg-[#0a0f1e] border border-[#1e293b] rounded-[18px] p-4">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] tracking-[0.14em] text-[#8a96b5]">DETAILED CLIPBOARD • DARK MIRROR</div>
                  <button onClick={() => setExpandDetailed(!expandDetailed)} className="text-[10px] text-[#8a96b5] underline">
                    {expandDetailed ? "Collapse" : "Expand"}
                  </button>
                </div>
                <div className={`font-mono text-[11px] leading-5 text-white whitespace-pre-wrap mt-3 bg-black/40 rounded-xl p-3 border border-[#1e293b] ${expandDetailed ? "" : "max-h-[260px] overflow-hidden"}`}>
                  {detailedText}
                </div>
                <button
                  onClick={() => copyText(detailedText, "detailed")}
                  className="w-full bg-[#a7f3d0] text-black font-black rounded-2xl py-2.5 text-[11px] tracking-[0.12em] mt-3 hover:bg-[#8af5b0] transition"
                >
                  {copied === "detailed" ? "COPIED!" : "COPY DETAILED COMPUTATION"}
                </button>
              </div>

              {/* Simple Clipboard */}
              <div className="bg-[#0a0f1e] border border-[#1e293b] rounded-[18px] p-4">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] tracking-[0.14em] text-[#8a96b5]">SIMPLE CLIPBOARD • DARK MIRROR</div>
                  <button onClick={() => setExpandSimple(!expandSimple)} className="text-[10px] text-[#8a96b5] underline">
                    {expandSimple ? "Collapse" : "Expand"}
                  </button>
                </div>
                <div className={`font-mono text-[11px] leading-5 text-white whitespace-pre-wrap mt-3 bg-black/40 rounded-xl p-3 border border-[#1e293b] ${expandSimple ? "" : "max-h-[200px] overflow-hidden"}`}>
                  {simpleText}
                </div>
                <button
                  onClick={() => copyText(simpleText, "simple")}
                  className="w-full bg-[#1e293b] text-white font-bold rounded-2xl py-2.5 text-[11px] tracking-[0.12em] mt-3 border border-[#2a3655]"
                >
                  {copied === "simple" ? "COPIED!" : "COPY SIMPLE COMPUTATION"}
                </button>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => setShowComparison(true)}
                  className="bg-white text-black font-bold rounded-2xl py-3.5 text-[12px] tracking-wide flex items-center justify-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18" />
                    <path d="M7 16l4-4 4 4 4-8" />
                  </svg>
                  GENERATE AMORTIZATION COMPARISON
                </button>
                <button
                  onClick={handleReset}
                  className="bg-[#0f172a] border border-[#2a3655] text-[#8a96b5] rounded-2xl py-3.5 text-[12px] tracking-wide"
                >
                  RESET ENTRY
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 bg-[#080c18] border border-[#1a233a] rounded-[16px] px-4 py-3 flex items-center justify-between text-[11px] text-[#8a96b5]">
          <div className="tracking-wide">
            USERNAME: Guest | <span className="underline cursor-pointer">Log Out</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold">
            <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]"></span>
            ONLINE • 30 DAYS
          </div>
        </div>

        <div className="mt-3 text-center text-[9px] text-[#3a455f] tracking-[0.2em]">V62.41 Same UI Correct Brain V3.2</div>
      </div>

      {/* Comparison Modal */}
      {showComparison && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="bg-[#131c31] border border-[#2a3655] rounded-[20px] w-full max-w-[520px] p-4 max-h-[85vh] overflow-auto no-scrollbar">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[12px] font-bold tracking-wide">AMORTIZATION COMPARISON</div>
              <button onClick={() => setShowComparison(false)} className="w-7 h-7 rounded-full bg-[#0f172a] border border-[#2a3655] text-[12px]">✕</button>
            </div>
            <div className="text-[10px] text-[#8a96b5] mb-3">S ₱{formatMoney(S)} • D ₱{formatMoney(D_forDisplay)} • OPDP ₱{formatMoney(OPDP)} • RB = S×0.8×1.17+OPDP = ₱{formatMoney(S * 0.8 * 1.17 + OPDP)}</div>
            <div className="grid grid-cols-3 gap-2 text-[10px] font-bold tracking-wide text-[#8a96b5] px-2 py-1">
              <span>TERM</span>
              <span>RATE</span>
              <span>MONTHLY</span>
            </div>
            <div className="space-y-1.5">
              {[2, 3, 4, 5, 6, 7].map((y) => {
                const months = y * 12;
                const rate = termRateMap[y];
                const comp = compute(D_forDisplay, months, rate);
                return (
                  <div key={y} className="grid grid-cols-3 gap-2 bg-[#0f172a] border border-[#2a3655] rounded-xl px-3 py-2.5 text-[12px]">
                    <span className="font-semibold">{y} Years • {months} mos</span>
                    <span className="text-[#8a96b5]">{rate}%</span>
                    <span className="font-black">₱{formatMoney(comp.Ceiled)}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 text-[10px] text-[#5b6786] leading-relaxed">
              Formula: RB = S×0.8×1.17+OPDP • Adjusted = (RB-D)/1.17 • TermLoan = Adjusted×(1+TR/100) • Raw = TermLoan/M • Ceiled = ceil(Raw)
            </div>
            <button onClick={() => setShowComparison(false)} className="w-full mt-4 bg-white text-black font-bold rounded-2xl py-2.5 text-[11px]">CLOSE</button>
          </div>
        </div>
      )}
    </div>
  );
}

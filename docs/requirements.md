# DoubleMark Site — Product Discovery (Phase 0)

## Product Promise
DoubleMark helps small businesses duplicate Chestny Znak (Честный Знак) marking codes: scan an existing code with a handheld scanner or phone camera, then send a duplicate to the printer quickly, with minimal confirmation steps.

## Source Product (DoubleMark Desktop)
- Windows WPF/.NET 8 desktop app (`DoubleMark` sibling project).
- Reads GS1 DataMatrix via COM scanner, HID keyboard wedge, or image decode (ZXing).
- Supports full marking codes (~80+ bytes, AI 91/92) and short codes (~30 bytes).
- Scanner setup matters: GS (0x1D) separator, FNC1, Virtual COM vs HID truncation risks.

## Target Audience
Small business owners and operators who need fast reprinting of marking labels without complex ERP workflows.

## Website Scope (Approved)
Full web platform:
- Marketing: homepage, benefits, how it works, contacts, pricing.
- Legal/trust: privacy, terms/offerta, cookies, company requisites (ИНН placeholder until provided).
- Auth: registration, login, password reset flow via Supabase Auth.
- Payments: sandbox checkout, subscriptions, and payment history in Supabase.
- Account: subscription status, payment history, and gated download area.
- Desktop link: Windows download gated by license (MVP uses placeholder installer URL).

## Honest Limits (Must Communicate On Site)
- Printer and scanner compatibility varies; HID may truncate full codes.
- Short vs full DataMatrix behavior depends on source code and hardware.
- Android companion app is roadmap, not v1.
- Legal texts require owner/legal review before production launch.

## Launch Model (Default)
Sell subscription/license for Windows desktop app via website checkout (sandbox first).

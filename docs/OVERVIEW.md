# dorm-dorm — Prototype Overview

Source: business-model report (Gemini share, "Residential Add-On Subscriptions in Thailand"). This file keeps only what shapes the prototype UI. Tax depreciation, salvage channels, and logistics rate cards are left out on purpose.

## What it is

A monthly **furniture and appliance add-on subscription** for tenants of budget dormitories. A tenant in a ~3,500 THB/month dorm room rents condo-grade items (2-door fridge, microwave, ergonomic chair, standing desk, air purifier) for 190–990 THB/month. That is far cheaper than moving to a condo (7,500+ THB/month plus a 22,500–36,000 THB upfront deposit and a 12-month lease).

- **Launch market:** dorms in the Rangsit / Pathum Thani university corridor (Thammasat Rangsit, Bangkok University, Rangsit University). Partner dorms rent at 3,000–4,200 THB/month.
- **Channel: B2B2C, through dorm landlords.** It is not sold direct-to-consumer. Landlords are partners.
- **Pitch to tenants:** "Upgrade your dorm to condo comfort for +490–990 THB/month. No condo deposit, no moving hassle when you graduate."

## Actors (likely prototype roles)

| Role | What they do in the system |
|---|---|
| **Tenant** (student / young professional) | Browses add-ons, subscribes, pays on the room invoice, reports damage, requests transfer/relocation/cancellation |
| **Landlord / dorm manager** (partner) | Lists rooms, bills the add-on fee on the monthly room invoice (with water/electricity), holds the unified security deposit, earns a **15% revenue share**, keeps items in the room between tenants ("pre-upgraded room") |
| **Operator** (dorm-dorm staff) | Manages inventory, schedules delivery waves, handles damage and warranty claims, processes exit requests |

Tenant communication channel: a **LINE Official Account** (for example, early-termination notice is sent via LINE).

## Catalog and pricing

### Single items

| SKU | Example models | Price (THB/mo) |
|---|---|---|
| 2-Door Inverter Fridge (5.6–6.6 cu.ft.) | Hitachi HRTN5198, Haier HRF-185MN, Hisense 5.6Q | 390 |
| Microwave (20L, 700–800W) | Sharp R-S20M6TA, Electrolux EMM20K22B | 190 |
| Ergonomic Mesh Chair | Sihoo M18 | 290 |
| Electric Standing Desk (120 cm) | Amo Design, Nubwo, Ergomaker | 350 |
| Smart Air Purifier (16–27 sq.m.) | Xiaomi Smart Air Purifier 4 Compact | 220 |

### Bundles (the lead offers)

| Bundle | Contents | Price (THB/mo) | Discount vs. separate |
|---|---|---|---|
| **Living Basic** | Fridge + Microwave | 490 | −90 |
| **Study / Work Pro** | Ergonomic Chair + Standing Desk | 590 | −50 |
| **Complete Living** | Fridge + Microwave + Ergonomic Chair + Air Purifier | 990 | −100 |

Marketing leads with **Living Basic** and **Study/Work Pro**.

### Pricing rules (useful for UI copy and validation)

- Single items cost about 5–11% of base rent. Bundles cost about 14–28%.
- **Total add-ons per tenant should stay ≤ 1,500 THB/month.** Above that, a mid-tier serviced apartment becomes the better deal.
- Comparison anchor for the UI: dorm + Complete Living = 4,490 THB/month, vs. the cheapest condo at 7,500 THB/month (40–50% cheaper). Another anchor: a 0% 10-month card installment on a fridge costs ~599 THB/month, vs. 390 THB/month here with maintenance included.
- Air purifier filter: a 390 THB annual renewal, **or** a +35 THB/month "air-care" surcharge. Open decision.

## Contract terms and fees

- **Contract type:** an operating lease plus a maintenance service agreement (สัญญาเช่าทรัพย์). It is **never** hire-purchase (เช่าซื้อ). A buyout happens only through a separate addendum.
- **Minimum term:** 6 months. 12-month option.
- **Refundable security deposit:** about 1 month of the subscription (500–1,000 THB). It is refunded 3–5 business days after pickup and inspection. Landlords may hold it as part of the room deposit.
- **Delivery / setup fee:** one-time, 290–350 THB (the report's final recommendation is 300 THB). It is **waived** for 12-month leases or when a tenant takes over an already-installed room.
- **Delivery waves:** free delivery happens only on scheduled batch days. Example: Wednesdays and Saturdays at the start of the semester. Deliveries are batched by dorm cluster.
- Unauthorized moves out of the delivery room void the warranty and the protection waiver.

### Damage policy

- **Normal wear (free):** micro-scratches on desktops, caster wheel wear, foam compression.
- **Tenant-liable:** broken parts, liquid in motors, torn mesh, burns, missing accessories.
- **Fixed damage fee schedule:**

| Damage | Fee (THB) |
|---|---|
| Broken microwave glass tray | 400 |
| Torn chair mesh seat | 900 |
| Water-damaged standing desk keypad | 850 |
| Total loss | Depreciated buyout price, capped at retail |

- Internal electrical or mechanical faults that are not caused by abuse go to the manufacturer warranty. The tenant pays nothing.
- A 5% damage reserve is built into every price. Tenants do not see a separate insurance add-on.

### Early exit (14 days' notice via LINE OA), three pathways

1. **Lease transfer / roommate takeover:** the subscription passes to the next tenant of the room or to a peer in the same building. **No fee.**
2. **In-zone relocation:** the tenant moves within the Rangsit/Pathum Thani zone and keeps the subscription. **Flat 350–500 THB** relocation fee.
3. **Early return / cancel before 6 months:** **600 THB retrieval fee**, plus the lower of: (a) one month's fee (taken from the deposit), or (b) 50% of the remaining contract balance.

### End of lease

- **In-situ retention:** items normally **stay in the room** for the next tenant (70–80% of turnovers). The landlord markets the room as "pre-upgraded".
- **Graduate buyout:** after 24–36 months, the tenant can buy their in-room items for 25–35% of the retail price.

## Open questions from the report (field discovery, not yet decided)

- Do tenants prefer single items or bundles? (If >60% prefer single items, the UI should emphasize single SKUs.)
- Do tenants prefer a refundable deposit with a 6-month minimum, or a non-refundable 300 THB fee with month-to-month cancellation?
- Can the landlord's property-management system bill the add-on on the room invoice and deduct damage fees from the room deposit?
- Will landlords accept the 15% revenue share in exchange for in-room retention?

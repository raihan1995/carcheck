# RevVeal design system — revamp 5.1

The site retains the RevVeal brand and its rev/reveal wordplay: “RevVeal your car's history.” The supplied screenshots are layout references, not a request to rename the website. The design uses white and off-white surfaces, navy text, burnt orange actions and consistent yellow registration plates. Outfit is used for headings and Inter for body text. The hero uses a transparent burnt-orange car illustration through Next Image, integrated with the page through subtle motion and orange contours.

## Shared foundations

Tokens live at the top of app/globals.css. The base palette uses ink, muted, line, background, surface, accent, accent-dark and plate, plus green, amber and red semantic colours with light tints. Type sizes are 14, 16, 20, 28, 40 and 56px, with smaller secondary metadata. Cards use a 10px radius and 1px borders; controls use 8px corners. Content width is 1200px with responsive gutters. Decorative warm tint is used in the homepage sample report area and behind the hero car; result panels also use semantic colours.

The shared SVG Icon component uses one outline system with a 1.75px stroke. RegistrationPlate and RegistrationSearch share PlateBand: the original blue band with a vector Union Jack and GB identifier, including compact plates. Searches navigate to the result route once; they do not request the same report twice. Focus indicators, a skip link, reduced-motion support and native FAQ disclosures are included.

Homepage recent checks use plain bordered registration text beneath the “Recent checks” label, rather than plate graphics. The extra sample-report link and helper line beneath the main registration search have been removed.

## Vehicle visuals retained in 5.1

MOT status, vehicle tax and London ULEZ use solid green/red backgrounds for known positive/negative outcomes. Unknown information and SORN are amber; no unavailable result is presented as a pass. MOT history uses green pass and red fail panels, amber minor/advisory defects and red major/dangerous defects, with a visible key, explicit labels and matching sidebar counts. A provider's dangerous flag takes precedence over its defect type.

The bottom of “MOT at a glance” includes the MOT summary: total tests, passes, failures, rounded percentage passed, passed/total ratio and an accessible progress bar. Counts include each recorded test and retest. Unavailable history uses dashes, while an empty history shows zero counts without inventing a pass rate. Results outside PASSED/FAILED are identified separately.

The Mileage information chart retains the horizontal bars, latest odometer per year, reading changes and summary figures. Change labels sit inside the coloured fill, 6px from its right edge. Very short fills use the label's minimum width so it stays readable. All original valid readings are checked for decreases, even where several tests occur in one year. Dates are sorted chronologically and recognised kilometre readings are converted to miles. Changes refer to the preceding recorded year; gaps are not described as a single year's driving. The positive status reads “No Mileage Alteration Detected”, without an asterisk or guarantee note. The longer explanatory paragraphs have been removed. Recorded decreases retain “Review readings” and the specific decrease warning, linked through aria-describedby only when the warning is present.

Vehicle Performance and Misc information share a two-column row directly below Mileage information and above CO₂ emission figures, with Performance on the left. Vehicle details remains above Mileage information. A container query stacks the pair when the report column is 640px wide or narrower. Both panels retain the sign-in lock and use the same selected catalogue variant. Performance includes the original power, torque, 0–60 mph, top speed, engine, fuel, cylinders, valves, transmission and drivetrain fields. The legacy acceleration0100 property contains the UK-Cars CSV's “0-60 mph (secs)” column. Misc restores price, economy, insurance, capacities, dimensions, doors, seats and boot space in a compact two-column details grid.

CO₂ emission figures use a full-width card below the Performance/Misc row and above MOT history. They retain the seven stepped colour bands, from green to red, with an outlined active row and aria-current for assistive technology. The visible “Your car” label has been removed. The value uses 28px type and the bars are shorter and closer together. The graph uses DVLA's recorded g/km, including zero; unavailable or invalid figures show an empty state. Grouped traditional A–M ranges are for visual comparison, not a tax or ULEZ assessment; the graph links to GOV.UK guidance.

Tax & registration includes estimated 6-month, 12-month and monthly Direct Debit totals under the heading “Road tax”. The standard-rate explanation and the sentence about the V5C issue date have been removed; engine-size/CO₂ band descriptions and the tax-cost estimates note remain. The original calculator now lives in lib/vehicle-tax.ts, using GOV.UK's 2026–27 tables checked on 25 November 2026; source URLs are recorded beside the rates. Registration date selects engine-size, 2001–2017 CO₂ or 2017-onward standard rates. Invalid/missing inputs and unsupported classes do not produce guessed prices, and March 2006 high-emissions registrations need a day to resolve the Band K cutoff. First-registration figures appear only for recent registrations, and the possible list-price supplement is described only while applicable. These are base estimates; exemptions and confirmed list price are unavailable. This section links to DVLA rates; TfL verification remains in the London ULEZ panel.

## Pages

Pricing includes a PriceComparison section between RevVeal's free/full pricing cards and the existing feature table. It compares the planned RevVeal full report (£5.99 incl. VAT), VehicleScore Hidden History (£13.95) and carVertical's single report (£39.99), with three cards on wide screens and a stack at 700px or narrower. Prices were checked on 25 November 2026 against [VehicleScore's buyer packs](https://vehiclescore.co.uk/hidden-history-packs) and [carVertical pricing](https://www.carvertical.com/gb/pricing); carVertical's amount was verified in a browser because its static page omits the price. The section links to both sources, identifies the single-report basis, notes differences in offers/coverage and retains RevVeal's planned/unavailable status. FULL_REPORT_PRICE_AMOUNT keeps RevVeal's comparison and primary pricing card aligned with the shared full-price label.

“What the free records cannot tell you” now uses ReportCoverage: six informational cards for Risk checks, MOT history, Mileage, Ownership, Vehicle spec and Status & value. Each uses an orange outline icon, a summary and the supplied checklist, separated by a dashed orange rule. The report-column container selects three columns above 700px, two above 400px and one on narrower screens. Availability labels distinguish free data, catalogue fields requiring sign-in and planned checks; recall and clocking-analysis extras have explicit planned labels. The cards describe coverage rather than results for the searched vehicle, retain the pricing link and state that paid checks and checkout are unavailable.

- / — registration search, trust points, feature comparison, sample and FAQ.
- /vehicle/SAMPLE — illustrative free report; real registrations use the same layout.
- /report/SAMPLE — illustrative paid-report layout and browser Save as PDF.
- /report/[id] — an owned completed report snapshot from Supabase; missing sections are never interpreted as a clear check.
- /dashboard — account home, local garage counts, real account report count, recent checks and quick actions.
- /dashboard/cars, /dashboard/reminders, /dashboard/activity — browser-local saved cars, dates with calendar export, and check history.
- /dashboard/logbook, /dashboard/tax-alerts — saved-car lists with monitoring explicitly marked as not connected.
- /dashboard/reports, /dashboard/receipts, /dashboard/settings — account report retrieval, payments and profile settings.
- /preview/dashboard — public design preview; it does not authenticate or load private account reports.
- /pricing, /faq, /comparison, /guides and individual guide pages.
- /privacy, /terms, /security and /contact — information layouts with explicit placeholders where details are unknown.

## Data and trust

The existing DVLA, MOT and catalogue integration is retained. Responses include retrieval time; the interface distinguishes it from the source's own update time, which is not supplied. Official MOT/tax status fields take precedence over date guesses. Mileage units are normalised for comparisons, while original units remain visible.

London ULEZ retains the previous DVLA Euro → suggested catalogue Euro → registration-date fallback order. Petrol/diesel/motorcycle thresholds are Euro 4/6/3; registration fallbacks are January 2006 / September 2015 / July 2007. Earlier diesels without a Euro record stay unknown. Hybrid vehicles are assessed by their combustion engine. The card heading is “London ULEZ”, with “Compliant”, “Not compliant” or “Unknown”, green/red/amber styling and an underlined “Verify on TfL” link. The calculation basis remains in the API response but is hidden in this card, including the “DVLA · Euro 6” line and separator. TfL confirms the actual outcome, including exceptions. References: [cars](https://tfl.gov.uk/modes/driving/ultra-low-emission-zone/cars) and [motorcycles](https://tfl.gov.uk/modes/driving/ultra-low-emission-zone/motorcycles-mopeds-and-more).

Vehicle Performance requires sign-in. GET and POST vehicle-check responses verify the Supabase user before returning catalogue candidates; anonymous or unverified sessions receive an empty candidate list, no suggested ID and performanceUnlocked set to false. The public ULEZ estimate is calculated on the server using the suggested catalogue Euro standard before those candidates are withheld. The page shows a sign-in prompt with a return path to the same vehicle, including for the sample. Signed-in users can choose a possible catalogue variant; it is still not a confirmed specification for that registration.

Paid checks and checkout are not implemented or advertised as active. The requested planned price is £5.99 incl. VAT. No payments can be taken. Sample outcomes are explicitly illustrative. Printing uses the browser print dialog; this is not a server-generated or emailed PDF service.

Saved cars, recent checks and reminder dates use this browser's local storage. They do not synchronise between accounts or devices. Calendar entries can be downloaded, but RevVeal does not send notifications. Existing purchased reports and profile details continue to use Supabase.

## Content and services still required

- Confirm the legal entity, address, VAT details, privacy terms, retention rules and support/security contacts. Draft pages are marked [PLACEHOLDER] and excluded from indexing.
- Set NEXT_PUBLIC_SUPPORT_EMAIL to a confirmed public support address.
- Connect paid vehicle-data sources, payment checkout/webhooks and a defined provider result contract before opening paid reports. Stored report sections currently accept status (clear/attention/not_checked), summary, source and updatedAt.
- Connect account-synchronised garage storage and actual reminder/monitoring delivery.
- Connect provider valuation, keeper/plate history and a generated/emailed PDF service if required.
- The RevVeal wordmark is intentionally typographic; a final supplied logo can replace it.

## Hero illustration and motion

The homepage uses the generated transparent asset `public/img/hero-car-5-1.png`, created with the built-in image generation tool. It is a generic burnt-orange car illustration, not an image of a searched vehicle. The original stock photograph remains available in `public/img/home-hero.jpg`.

`HeroVehicle` adds gentle car drift, pointer parallax, animated orange contours and a reveal sweep. A brighter scan beam and trailing inspection band cross the car over a shared nine-second cycle. Each sweep randomly chooses one to three two-word-or-shorter labels from `lib/hero-scan.ts`, avoiding labels from the previous sweep and duplicate car areas. The 24-label pool covers leaks, emissions, brakes, steering, suspension, tyres, lights, glass, wipers, corrosion and exhausts. Oil leak is anchored to the engine bay. Location-specific timing reveals each marker as the beam passes, and predefined layout combinations keep labels separated on mobile. Markers follow the car canvas and remain decorative examples, not registration lookup results; they are hidden from assistive technology. The visible “Illustrative scan” label has been removed.

The first selection happens after the image loads; subsequent selections use the beam's animation-iteration event, not a separate timer. This preserves the findings while paused or offscreen and avoids server/client randomisation mismatches. Focusing the registration search increases the visual emphasis. A keyboard-accessible pause/resume button controls all effects; offscreen animation is paused, and reduced-motion preferences disable movement and hide the unnecessary motion control. The former photo caption and the small line above the headline have been removed. The hero headline scales up to 76px on desktop and uses a larger mobile size. Label topics follow [DVSA MOT checks](https://www.gov.uk/government/publications/car-parts-checked-at-an-mot/car-parts-checked-at-an-mot) and the [fluid-leak/emissions inspection manual](https://www.gov.uk/guidance/mot-inspection-manual-for-private-passenger-and-light-commercial-vehicles/8-nuisance).

Full generation prompt:

```text
Use case: stylized-concept.
Asset type: transparent car hero illustration for the existing RevVeal UK vehicle-history website.
Primary request: create a premium, polished 3D automotive illustration that feels lively and fits a burnt-orange, midnight-navy and white brand.
Subject: one unbranded modern sporty fastback car, metallic burnt-orange paint, deep graphite windows, graphite alloy wheels and restrained realistic detailing. Front three-quarter view, nose pointing toward the left, complete vehicle including all wheels visible. Slightly elevated camera. Realistic attractive proportions and crisp silhouette; refined CGI product illustration, not a toy or cartoon.
Lighting: soft high-key studio lighting, warm reflections along the orange body, clean dark wheel detail. Very subtle neutral contact shadow beneath the tyres.
Composition: landscape approximately 3:2, car centered and occupying most of the canvas, about 8 percent transparent margin around it. The car should integrate into a white web page and appear grounded.
Background: genuinely transparent alpha. Car and a soft contact shadow only.
Constraints: no scenery, road, pedestal, floor plane, sky, UI, floating badges, typography, watermarks, branding, emblems or manufacturer logos. If a front plate is present, it must be a blank, narrow white UK-style rectangle with no characters. Do not crop the car. Do not bake any coloured backdrop, glow, motion streaks or decorative shapes into the image; those will be animated in HTML/CSS.
```

## Verification

Run npm test for status, mileage/date parsing, redirect and saved-car compatibility regression cases; npm run build for the production build. Browser QA uses an installed Edge browser at desktop and mobile sizes and should exercise the search, sample, error, save and navigation states without querying real vehicle providers or creating real accounts.

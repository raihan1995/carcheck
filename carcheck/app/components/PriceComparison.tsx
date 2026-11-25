import { FULL_REPORT_PRICE, FULL_REPORT_PRICE_AMOUNT } from "@/lib/site";

// UK single-report prices checked on the providers' own pages, 25 November 2026.
// carVertical's amount is loaded by the browser on its pricing page.
const competitors = [
  {
    name: "VehicleScore",
    price: "£13.95",
    product: "Hidden History check",
    url: "https://vehiclescore.co.uk/hidden-history-packs",
  },
  {
    name: "carVertical",
    price: "£39.99",
    product: "Vehicle history report",
    url: "https://www.carvertical.com/gb/pricing",
  },
];

export function PriceComparison() {
  return (
    <section
      className="section provider-price-comparison"
      id="compare-prices"
      aria-labelledby="compare-prices-heading"
    >
      <div className="container provider-price-inner">
        <div className="section-intro">
          <div>
            <span className="eyebrow">Compare prices</span>
            <h2 id="compare-prices-heading">
              One report. See the price difference.
            </h2>
            <p>UK single-report prices, before discount codes or bundles.</p>
          </div>
        </div>
        <div className="provider-price-grid">
          <article className="card provider-price-card provider-price-featured">
            <span className="badge">Planned full report</span>
            <h3>RevVeal</h3>
            <p className="provider-price-product">Full vehicle report</p>
            <div className="price">{FULL_REPORT_PRICE_AMOUNT}</div>
            <p className="provider-price-unit">Per report · incl. VAT</p>
            <p className="provider-price-availability">
              Not yet available to buy
            </p>
          </article>
          {competitors.map((provider) => (
            <article className="card provider-price-card" key={provider.name}>
              <span className="badge">Single report</span>
              <h3>{provider.name}</h3>
              <p className="provider-price-product">{provider.product}</p>
              <div className="price">{provider.price}</div>
              <p className="provider-price-unit">Per report</p>
              <a
                href={provider.url}
                className="text-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                View {provider.name} pricing
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </article>
          ))}
        </div>
        <p className="provider-price-note">
          Prices checked 25 November 2026. Offers, bundles and report coverage
          vary by provider. RevVeal’s {FULL_REPORT_PRICE} full report is planned;
          paid checks and checkout are not yet available.
        </p>
      </div>
    </section>
  );
}

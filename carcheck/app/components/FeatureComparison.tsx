import { reportFeatures } from "@/lib/site";
import { Icon } from "./ui/Icon";

export function FeatureComparison() {
  return (
    <div className="table-scroll">
      <table className="comparison-table">
        <caption className="sr-only">
          Free vehicle check and full report contents
        </caption>
        <thead>
          <tr>
            <th scope="col">What you can check</th>
            <th scope="col">
              Free<span>£0</span>
            </th>
            <th scope="col">
              Full report<span>£5.99 incl. VAT</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {reportFeatures.map(([name, description, free]) => (
            <tr key={name}>
              <th scope="row">
                {name}
                <span>{description}</span>
              </th>
              <td>
                {free ? (
                  <span className="table-check">
                    <Icon name="check" />
                    <span className="sr-only">Included</span>
                  </span>
                ) : (
                  <span className="muted">Not included</span>
                )}
              </td>
              <td>
                <span className="table-check">
                  <Icon name="check" />
                  <span className="sr-only">
                    Included in planned full report
                  </span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

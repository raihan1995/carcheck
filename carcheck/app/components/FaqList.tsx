import { faqs } from "@/lib/site";
import { Icon } from "./ui/Icon";

export function FaqList({ limit }: { limit?: number }) {
  return (
    <div className="faq-list">
      {faqs.slice(0, limit).map((item) => (
        <details key={item.question}>
          <summary>
            {item.question}
            <Icon name="plus" size={18} />
          </summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

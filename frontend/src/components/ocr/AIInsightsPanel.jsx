import {
    AlertTriangle,
    Building2,
    CalendarDays,
    CheckSquare,
    Coins,
    ListChecks,
    MapPin,
    Paperclip,
    Phone,
    Sparkles,
    Timer,
    Users,
} from "lucide-react";

function Card({ icon: Icon, title, tone = "primary", children }) {
  const tones = {
    primary: "text-primary-300 bg-primary-500/10 ring-primary-800/50",
    gold: "text-gold-300 bg-gold-500/10 ring-gold-800/50",
    success: "text-success-500 bg-success-500/10 ring-success-800/50",
    danger: "text-red-300 bg-red-500/10 ring-red-800/50",
    sky: "text-sky-300 bg-sky-500/10 ring-sky-800/50",
  };

  return (
    <section className="rounded-xl border border-ink-800 bg-ink-900/70 p-4 shadow-lg shadow-black/20 backdrop-blur-sm transition-colors hover:border-ink-700">
      <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-300">
        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md ring-1 ${tones[tone]}`}>
          <Icon size={13} />
        </span>
        {title}
      </h4>
      {children}
    </section>
  );
}

function Chips({ items, tone = "bg-ink-800 text-ink-200 ring-ink-700" }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span key={i} className={`rounded-md px-2 py-1 text-xs ring-1 ${tone}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

function Bullets({ items, marker = "bg-primary-500" }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-xs leading-relaxed text-ink-300">
          <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${marker}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * AIInsightsPanel
 * Premium card stack summarising what the document actually says: summary,
 * key points, dates, people, actions, deadlines, warnings and attachments.
 */
export default function AIInsightsPanel({ insights, keywords = [] }) {
  if (!insights) return null;

  const {
    summary,
    keyPoints = [],
    dates = [],
    people = [],
    organizations = [],
    locations = [],
    amounts = [],
    contacts = [],
    deadlines = [],
    actionItems = [],
    warnings = [],
    requiredDocuments = [],
  } = insights;

  const nothing =
    !summary &&
    !keyPoints.length &&
    !dates.length &&
    !people.length &&
    !actionItems.length &&
    !keywords.length;

  return (
    <aside className="space-y-3.5" aria-label="AI Insights">
      <div className="flex items-center gap-2">
        <Sparkles size={15} className="text-primary-400" />
        <h3 className="font-display text-sm font-semibold text-ink-50">AI Insights</h3>
      </div>

      {nothing && (
        <p className="rounded-xl border border-ink-800 bg-ink-900/60 p-4 text-xs text-ink-500">
          Not enough structured content was found to generate insights for this document.
        </p>
      )}

      {summary && (
        <Card icon={Sparkles} title="Document Summary">
          <p className="text-xs leading-relaxed text-ink-300">{summary}</p>
        </Card>
      )}

      {keyPoints.length > 0 && (
        <Card icon={ListChecks} title="Key Points" tone="sky">
          <Bullets items={keyPoints} marker="bg-sky-500" />
        </Card>
      )}

      {actionItems.length > 0 && (
        <Card icon={CheckSquare} title="Action Items" tone="success">
          <Bullets items={actionItems} marker="bg-success-500" />
        </Card>
      )}

      {deadlines.length > 0 && (
        <Card icon={Timer} title="Deadlines" tone="danger">
          <Bullets items={deadlines} marker="bg-red-500" />
        </Card>
      )}

      {warnings.length > 0 && (
        <Card icon={AlertTriangle} title="Warnings" tone="danger">
          <Bullets items={warnings} marker="bg-red-500" />
        </Card>
      )}

      {dates.length > 0 && (
        <Card icon={CalendarDays} title="Important Dates" tone="gold">
          <Chips items={dates} tone="bg-gold-500/10 text-gold-200 ring-gold-800/50" />
        </Card>
      )}

      {people.length > 0 && (
        <Card icon={Users} title="Important People" tone="gold">
          <Chips items={people} tone="bg-gold-500/10 text-gold-200 ring-gold-800/50" />
        </Card>
      )}

      {organizations.length > 0 && (
        <Card icon={Building2} title="Organizations" tone="success">
          <Chips items={organizations} tone="bg-success-500/10 text-success-500 ring-success-800/50" />
        </Card>
      )}

      {locations.length > 0 && (
        <Card icon={MapPin} title="Locations" tone="sky">
          <Chips items={locations} tone="bg-sky-500/10 text-sky-200 ring-sky-800/50" />
        </Card>
      )}

      {amounts.length > 0 && (
        <Card icon={Coins} title="Amounts" tone="gold">
          <Chips items={amounts} tone="bg-amber-500/10 text-amber-200 ring-amber-800/50" />
        </Card>
      )}

      {contacts.length > 0 && (
        <Card icon={Phone} title="Contact Information">
          <Chips items={contacts} />
        </Card>
      )}

      {requiredDocuments.length > 0 && (
        <Card icon={Paperclip} title="Required Documents">
          <Bullets items={requiredDocuments} marker="bg-primary-500" />
        </Card>
      )}

      {keywords.length > 0 && (
        <Card icon={ListChecks} title="Key Terms">
          <div className="space-y-2">
            {keywords.slice(0, 8).map((k, i) => (
              <div key={i} className="text-xs">
                <span className="font-semibold text-ink-100">{k.term}</span>
                {k.translation && <span className="text-ink-500"> — {k.translation}</span>}
              </div>
            ))}
          </div>
        </Card>
      )}
    </aside>
  );
}

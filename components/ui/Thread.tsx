import Link from "next/link";
type ThreadProps = {
  icon: string;
  label: string;
  value: string;
  href?: string;
};

export default function Thread({
  icon,
  label,
  value,
  href,
}: ThreadProps) {
  const content = (
  <div className="flex items-start gap-4">
    <span className="text-2xl">{icon}</span>

   <div>
  <p className="text-xl">
    {label && <span>{label} </span>}
    <span>{value}</span>
  </p>
</div>
  </div>
);

return href ? (
  <Link
    href={href}
    className="group block rounded-lg p-2 transition-colors hover:bg-stone-100"
  >
    {content}
  </Link>
) : (
  content
);
}
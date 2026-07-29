import Link from "next/link";
type CurrentItemProps = {
  icon: string;
  title: string;
  current?: string;
  href?: string;
};

export default function CurrentItem({
  icon,
  title,
  current,
  href,
}: CurrentItemProps) {
  const content = (
  <div className="flex items-start gap-4">
    <span className="text-2xl">{icon}</span>

    <div>
      <p className="text-xl">{title}</p>

      {current && (
        <p className="text-stone-500">
          {current}
        </p>
      )}
    </div>
  </div>
);

return href ? (
  <Link
    href={href}
    className="group block rounded-lg p-2 -m-2 transition-colors hover:bg-stone-100"
  >
    {content}
  </Link>
) : (
  content
);
}